/** Catalog v10: native sheets are the ONLY persistent catalog store.
 * Enable Google Sheets API in Apps Script Services; run installWorkbook().
 * Never write catalog JSON to cells. Legacy JSON is read only during migration.
 */
var GAS_VERSION = 10;
var SESSION_MS = 12 * 60 * 60 * 1000;
function props_() { return PropertiesService.getScriptProperties(); }
function jsonResponse(value) { value.gasVersion = GAS_VERSION; return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
function digest_(s) { return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)); }
function sign_(s) {
  var p = props_();
  var secret = p.getProperty('SESSION_SECRET_V8');
  if (!secret) throw new Error('Сначала запустите setup()');
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s, secret + p.getProperty('ADMIN_PASSWORD'), Utilities.Charset.UTF_8));
}
function equal_(a,b) { if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false; var n=0; for(var i=0;i<a.length;i++) n |= a.charCodeAt(i)^b.charCodeAt(i); return n===0; }
function authorized_(token) {
  if (typeof token !== 'string' || token.length > 1000) return false;
  var parts = token.split('.');
  return parts.length === 3 && Number(parts[0]) > Date.now() && Number(parts[0]) <= Date.now() + SESSION_MS + 60000 && equal_(parts[2], sign_(parts[0]+'.'+parts[1]));
}
function login_(password) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) return {status:'busy', error:'Сервер занят. Повторите вход.'};
  try {
    var p=props_(), expected=p.getProperty('ADMIN_PASSWORD');
    if (!expected || expected.length < 12) return {status:'error', error:'Администратору нужно настроить ADMIN_PASSWORD и выполнить setup()'};
    var rate = JSON.parse(p.getProperty('LOGIN_RATE_V8') || '{"at":0,"count":0}');
    if (Date.now()-rate.at > 60000) rate={at:Date.now(), count:0};
    if (rate.count >= 20) return {status:'error', error:'Слишком много попыток. Повторите через минуту.'};
    rate.count++; p.setProperty('LOGIN_RATE_V8', JSON.stringify(rate));
    if (typeof password !== 'string' || !equal_(digest_(password),digest_(expected))) return {status:'unauthorized', error:'Неверный пароль'};
    var expiresAt=Date.now()+SESSION_MS, text=String(expiresAt)+'.'+Utilities.getUuid();
    return {status:'ok', token:text+'.'+sign_(text), expiresAt:expiresAt};
  } finally { lock.releaseLock(); }
}

function doGet(e) {
  try {
    var params=e&&e.parameter||{};
    if(params.action==='ping')return jsonResponse({status:'ok'});
    if(params.action&&params.action!=='getData')throw new Error('Неизвестная операция');
    var head=readHead_();
    // Viewer polling never scans or formats the workbook. A pending edit is processed
    // by its installed trigger / minute worker, not by every viewer.
    if(props_().getProperty('V10_ERROR'))throw new Error(props_().getProperty('V10_ERROR'));
    if(params.revision!==undefined && String(params.revision)===String(head.revision))return jsonResponse({status:'unchanged',revision:head.revision});
    if(!head.initialized)return jsonResponse({status:'empty',revision:head.revision});
    var cached=cachedData_(head);
    if(cached)return jsonResponse({status:'ok',revision:head.revision,data:cached});
    var lock=LockService.getScriptLock();
    if(!lock.tryLock(1000))return jsonResponse({status:'busy',error:'Идёт сохранение; данные появятся при следующей проверке.'});
    try { var state=refreshNative_(); return jsonResponse({status:state.data?'ok':'empty',revision:state.revision,data:state.data}); }
    finally {lock.releaseLock();}
  }catch(err){return jsonResponse({status:'error',error:String(err.message||err)});}
}
function doPost(e) {
  var lock;
  try {
    var raw=e&&e.postData&&e.postData.contents;
    if(!raw||raw.length>4000000)throw new Error('Пустой или слишком большой запрос (максимум 4 МБ)');
    var payload=JSON.parse(raw);
    if(payload.action==='login')return jsonResponse(login_(payload.password));
    if(!authorized_(payload.token))return jsonResponse({status:'unauthorized',error:'Войдите в режим администратора заново'});
    if(payload.action!=='saveData')throw new Error('Неизвестная операция');
    if(!Number.isSafeInteger(payload.baseRevision)||payload.baseRevision<0||typeof payload.requestId!=='string'||! /^[\w-]{8,100}$/.test(payload.requestId))throw new Error('Неверная версия или ID запроса');
    var incoming=sharedData(validateCatalog(payload.data)),signature=digest_(canonical(incoming));
    lock=LockService.getScriptLock();
    if(!lock.tryLock(10000))return jsonResponse({status:'busy',error:'Идёт другая запись; запрос будет повторён'});
    // One batch read under ScriptLock detects even edits whose onEdit hasn't arrived.
    var current=refreshNative_(), receipt=current.receipts.find(function(r){return r.id===payload.requestId;});
    if(receipt) {
      if(receipt.hash!==signature)throw new Error('ID запроса уже использован с другим содержимым');
      return jsonResponse({status:'ok',revision:current.revision,data:current.data});
    }
    if(current.revision!==payload.baseRevision)return jsonResponse({status:'conflict',revision:current.revision,data:current.data});
    var next=normalizeStorage_(incoming),receipts=[{id:payload.requestId,hash:signature}].concat(current.receipts).slice(0,200);
    // Content, receipts and revision commit together in a single atomic API batch.
    var saved=writeNative_(next,current,current.revision+1,receipts);
    return jsonResponse({status:'ok',revision:saved.revision,data:saved.data});
  }catch(err){return jsonResponse({status:'error',error:String(err.message||err)});}
  finally {if(lock&&lock.hasLock())lock.releaseLock();}
}
function setup(){installWorkbook();}
