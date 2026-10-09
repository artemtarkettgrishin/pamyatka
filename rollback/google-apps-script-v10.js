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

/** Native relational workbook. No persistent JSON snapshots or projection copies. */
var V10_CONTROL='К10 Служебное',V10_INDEX='К10 Навигатор',V10_GUIDE='К10 Инструкция';
var START_ROW=4;
function text_(v){return v===undefined||v===null?'':String(v);}
function clone_(v){return JSON.parse(JSON.stringify(v));}
function yes_(v){return v===true||/^(да|true|1)$/i.test(text_(v).trim());}
function number_(v,fallback){if(v===''||v===undefined)return fallback;var n=Number(text_(v).replace(',','.'));if(!isFinite(n))throw new Error('Некорректное число: '+v);return n;}
function safeId_(v){var s=text_(v).trim();if(['__proto__','prototype','constructor'].indexOf(s)>=0)throw new Error('Недопустимый ID');return s;}
function optional_(obj,fields){fields.forEach(function(k){if(obj[k]===''||obj[k]===undefined)delete obj[k];});return obj;}
function normalizeStorage_(input){
  var d=clone_(sharedData(validateCatalog(input)));
  d.categories.forEach(function(c){
    c.storageId=c.storageId||c.id;c.parentId=c.parentId||null;
    optional_(c,['slug','badge','statusBadge','color','icon','startPageId','description','lastUpdated']);
    c.columns=(c.columns||[]).map(function(col){col.isSticky=!!col.isSticky;return optional_(col,['width','headerColor','align']);});
    var cellKeys=c.columns.map(function(col){return col.key;});(c.rows||[]).forEach(function(r){Object.keys(r.cells).forEach(function(k){if(cellKeys.indexOf(k)<0)cellKeys.push(k);});});
    c.rows=(c.rows||[]).map(function(r){r.highlight=r.highlight||'none';optional_(r,['note']);cellKeys.forEach(function(key){if(r.cells[key]===undefined)r.cells[key]='';});return r;});
    c.notes=(c.notes||[]).map(function(n){return optional_(n,['title','icon']);});
  });
  d.categories.sort(function(a,b){return a.storageId.localeCompare(b.storageId);});
  var first=d.categories.find(function(c){return c.type==='changelog';});
  d.changelog.forEach(function(l){l.ownerId=l.ownerId||(first?first.id:'');l.importance=l.importance||'normal';optional_(l,['author']);});
  d.settings.currencySymbol=d.settings.currencySymbol||'₽';optional_(d.settings,['defaultCategoryId']);
  if(d.settings.defaultCategoryId&&!d.categories.some(function(c){return c.id===d.settings.defaultCategoryId;}))delete d.settings.defaultCategoryId;
  validateNative_(d);return d;
}
function validateNative_(d){
  validateCatalog(d);
  var ids=new Set();d.categories.forEach(function(c){if(ids.has(c.storageId))throw new Error('Повтор внутреннего ID раздела');ids.add(c.storageId);safeId_(c.id);if(!c.title.trim())throw new Error('Пустое название раздела '+c.id);});
  if(d.settings.defaultCategoryId&&!d.categories.some(function(c){return c.id===d.settings.defaultCategoryId;}))throw new Error('Нет раздела по умолчанию');
  d.changelog.forEach(function(l){if(l.ownerId&&!d.categories.some(function(c){return c.id===l.ownerId&&c.type==='changelog';}))throw new Error('Не найден журнал для записи '+l.id);});
}
function pathFor_(data,id){var parts=[],seen=new Set();while(id){if(seen.has(id))throw new Error('Цикл меню');seen.add(id);var c=data.categories.find(function(c){return c.id===id;});if(!c)break;parts.unshift(c.title);id=c.parentId;}return parts.join(' › ');}
function col_(key,title,editable){return {key:key,title:title,editable:editable!==false};}
function spec_(key,name,kind,owner,cols,rows,path){return {key:key,name:name,kind:kind,owner:owner||'',columns:cols,rows:rows,path:path||name};}
function shortName_(prefix,c){return 'К10 '+prefix+' '+c.title.replace(/[\[\]*?:/\\']/g,' ').slice(0,45)+' · '+digest_(c.storageId).slice(0,7);}
function row_(id,values){return Object.assign({_id:id},values);}
function menuColumns_(){var C=col_;return [C('_uid','Внутренний ключ',false),C('_savedId','Предыдущий ID',false),C('id','ID'),C('title','Название'),C('parentId','ID родителя'),C('type','Тип'),C('order','Порядок'),C('startPageId','ID стартовой страницы'),C('description','Описание'),C('badge','Бейдж / акция'),C('statusBadge','Наличие / статус'),C('color','Цвет'),C('icon','Иконка'),C('slug','Короткое имя'),C('lastUpdated','Дата обновления'),C('_delete','Удалить (Да)'),C('_path','Полный путь',false)];}
function menuRow_(d,c){return Object.assign({_uid:c.storageId,_savedId:c.id,_delete:'',_path:pathFor_(d,c.id)},c,{type:({group:'Раздел',page:'Страница',changelog:'Журнал'})[c.type]});}
function nativeTables_(d){
  if(!d)return [];
  var C=col_,S=spec_,out=[];
  out.push(S('menu:root','К10 Главное меню','menu','',menuColumns_(),d.categories.filter(function(c){return !c.parentId;}).map(function(c){return menuRow_(d,c);}),'Главное меню: Обновления, Линолеум, Ламинат…'));
  d.categories.forEach(function(c){
    out.push(S('menu:'+c.storageId,shortName_('Меню',c),'menu',c.storageId,menuColumns_(),d.categories.filter(function(v){return v.parentId===c.id;}).map(function(v){return menuRow_(d,v);}),pathFor_(d,c.id)+' → вложенные разделы'));
    if(c.type!=='changelog'||c.rows.length||c.columns.length){
      var keys=c.columns.map(function(v){return v.key;});c.rows.forEach(function(r){Object.keys(r.cells).forEach(function(k){if(keys.indexOf(k)<0)keys.push(k);});});
      var cols=[C('_id','ID товара'),C('_order','Порядок'),C('_delete','Удалить (Да)'),C('highlight','Подсветка'),C('note','Примечание')].concat(keys.map(function(k){var def=c.columns.find(function(v){return v.key===k;});return C('cell:'+k,def?def.title:k+' (доп. поле)');}));
      out.push(S('products:'+c.storageId,shortName_('Товары',c),'products',c.storageId,cols,c.rows.map(function(r,i){var v={_order:i+1,_delete:'',highlight:r.highlight,note:r.note||''};keys.forEach(function(k){v['cell:'+k]=r.cells[k]===undefined?'':r.cells[k];});return row_(r.id,v);}),pathFor_(d,c.id)));
    }
  });
  var columns=[],notes=[];
  d.categories.forEach(function(c){c.columns.forEach(function(v,i){columns.push(Object.assign({_owner:c.id,_order:i+1,_delete:'',_savedKey:v.key},v));});c.notes.forEach(function(v,i){notes.push(Object.assign({_owner:c.id,_order:i+1,_delete:''},v,{position:v.position==='top'?'Над таблицей':'Под таблицей'}));});});
  out.push(S('columns','К10 Столбцы','columns','',[C('_owner','ID раздела'),C('id','ID столбца'),C('title','Название'),C('key','Ключ данных'),C('_savedKey','Прежний ключ',false),C('width','Ширина px'),C('headerColor','Цвет шапки'),C('align','Выравнивание'),C('isSticky','Закрепить'),C('_order','Порядок'),C('_delete','Удалить (Да)')],columns));
  out.push(S('notes','К10 Пометки','notes','',[C('_owner','ID раздела'),C('id','ID пометки'),C('title','Заголовок'),C('content','Текст'),C('type','Тип'),C('position','Положение'),C('icon','Иконка'),C('_order','Порядок'),C('_delete','Удалить (Да)')],notes));
  var journals=d.categories.filter(function(c){return c.type==='changelog';});if(!journals.length&&d.changelog.length)journals=[{id:'',storageId:'orphan',title:'Обновления'}];
  journals.forEach(function(c){out.push(S('logs:'+c.storageId,shortName_('Журнал',c),'logs',c.storageId,[C('_id','ID записи'),C('date','Дата'),C('category','Раздел'),C('text','Изменение'),C('importance','Важность'),C('author','Автор'),C('_order','Порядок'),C('_delete','Удалить (Да)')],d.changelog.filter(function(l){return l.ownerId===c.id;}).map(function(l,i){return row_(l.id,Object.assign({},l,{_order:i+1,_delete:''}));}),pathFor_(d,c.id)));});
  out.push(S('settings','К10 Настройки','settings','',[C('_id','Параметр',false),C('title','Описание',false),C('value','Значение')],[row_('appName',{title:'Название приложения',value:d.appName}),row_('version',{title:'Версия структуры приложения',value:d.version}),row_('currencySymbol',{title:'Валюта',value:d.settings.currencySymbol}),row_('defaultCategoryId',{title:'ID раздела по умолчанию',value:d.settings.defaultCategoryId||''})]));
  return out;
}
function service_(){if(typeof Sheets==='undefined')throw new Error('В Apps Script добавьте сервис Google Sheets API (Сервисы → + → Google Sheets API), затем запустите installWorkbook.');return Sheets.Spreadsheets;}
function ss_(){return SpreadsheetApp.getActiveSpreadsheet();}
function apiBatch_(requests){if(requests.length){SpreadsheetApp.flush();service_().batchUpdate({requests:requests},ss_().getId());}}
function sheetMap_(){var map={};ss_().getSheets().forEach(function(s){map[s.getSheetId()]=s;});return map;}
function readHead_(){
  var s=ss_().getSheetByName(V10_CONTROL);if(!s)throw new Error('Запустите installWorkbook() для переноса данных в отдельные листы.');
  return headValues_(s.getRange(2,1,1,4).getValues()[0]);
}
function headValues_(v){return {revision:Number(v[0])||0,hash:text_(v[1]),modified:text_(v[2]),initialized:yes_(v[3])};}
function readNative_(){
  var ss=ss_(),index=ss.getSheetByName(V10_INDEX),control=ss.getSheetByName(V10_CONTROL),map=sheetMap_();
  if(!index||!control)throw new Error('Запустите installWorkbook');
  var registry=index.getLastRow()>1?index.getRange(2,1,index.getLastRow()-1,6).getValues().filter(function(r){return r[0];}):[];
  var specs=registry.map(function(r){var sh=map[Number(r[3])];if(!sh)throw new Error('Удалён рабочий лист «'+r[4]+'». Восстановите его через историю Google Таблицы.');return {key:text_(r[0]),kind:text_(r[1]),owner:text_(r[2]),sheetId:Number(r[3]),name:sh.getName(),path:text_(r[5])};});
  var values=readRanges_([{sheetId:control.getSheetId()}].concat(specs.map(function(s){return {sheetId:s.sheetId};})));
  var meta=values[0].values||[],head=headValues_(meta[1]||[]),receipts=meta.slice(4).filter(function(r){return r[0];}).map(function(r){return {id:text_(r[0]),hash:text_(r[1])};});
  specs.forEach(function(spec,i){var grid=values[i+1].values||[];if(!grid[0]||grid[0][0]!=='CATALOG10'||grid[0][1]!==spec.key)throw new Error('Изменена служебная строка листа '+spec.name);spec.grid=grid;var keys=(grid[2]||[]).map(text_);if(!keys.length||new Set(keys).size!==keys.length)throw new Error('Изменены ключи столбцов в '+spec.name);var required=spec.kind==='menu'?['_uid','_savedId','id','title','parentId','type','order']:spec.kind==='columns'?['_owner','id','title','key','_savedKey']:spec.kind==='notes'?['_owner','id','content','type','position']:spec.kind==='settings'?['_id','value']:spec.kind==='logs'?['_id','date','category','text']:['_id','_order','highlight','note'];if(required.some(function(k){return keys.indexOf(k)<0;}))throw new Error('Удалены служебные ключи столбцов в '+spec.name);spec.columns=keys.map(function(k,j){return col_(k,text_((grid[1]||[])[j]));});spec.rows=[];grid.slice(3).forEach(function(vals,j){if(!vals.some(function(v){return v!==''&&v!==null;}))return;var row={_physical:j+4};keys.forEach(function(k,x){row[k]=vals[x]===undefined?'':vals[x];});spec.rows.push(row);});});
  if(!head.initialized)return {revision:head.revision,hash:head.hash,data:null,receipts:receipts,workbook:specs,meta:meta};
  var parsed=parseNative_(specs);
  return {revision:head.revision,hash:head.hash,data:parsed,receipts:receipts,workbook:specs,meta:meta};
}
function parseNative_(specs){
  var d={appName:'Памятка продавца',version:'7.0',settings:{currencySymbol:'₽'},categories:[],changelog:[]},renames={},byUid={},deleted=new Set();
  var settings=specs.find(function(s){return s.kind==='settings';});if(!settings)throw new Error('Нет листа настроек');
  settings.rows.forEach(function(r){if(r._id==='appName'||r._id==='version')d[r._id]=text_(r.value);else d.settings[r._id]=text_(r.value);});
  specs.filter(function(s){return s.kind==='menu';}).forEach(function(s){s.rows.forEach(function(r){
    if(!text_(r.title).trim()){if(r._uid&&!yes_(r._delete))throw new Error(s.name+': заполните название, строка '+r._physical);return;}
    var id=safeId_(r.id)||('cat_'+Utilities.getUuid()),uid=text_(r._uid)||id;
    if(byUid[uid])throw new Error('Повтор внутреннего ID: '+s.name);
    if(r._savedId&&r._savedId!==id)renames[text_(r._savedId)]=id;
    var c={id:id,storageId:uid,title:text_(r.title),parentId:text_(r.parentId)||null,type:({'Раздел':'group','Страница':'page','Журнал':'changelog'})[r.type]||text_(r.type)||'page',order:number_(r.order,d.categories.length+1),columns:[],rows:[],notes:[]};
    ['startPageId','description','badge','statusBadge','color','icon','slug','lastUpdated'].forEach(function(k){if(r[k]!=='')c[k]=text_(r[k]);});c._sheetOwner=r._uid?'':s.owner;
    byUid[uid]=c;if(yes_(r._delete))deleted.add(uid);d.categories.push(c);
  });});
  function ref(v){return renames[text_(v)]||text_(v);}
  d.categories.forEach(function(c){c.parentId=c.parentId?ref(c.parentId):(c._sheetOwner?(byUid[c._sheetOwner]||{}).id||null:null);if(c.startPageId)c.startPageId=ref(c.startPageId);delete c._sheetOwner;});
  if(d.settings.defaultCategoryId)d.settings.defaultCategoryId=ref(d.settings.defaultCategoryId);
  var byId={};d.categories.forEach(function(c){if(byId[c.id])throw new Error('Повтор ID раздела '+c.id);byId[c.id]=c;});
  var columnKeys={};
  function order(rows){return rows.slice().sort(function(a,b){return number_(a._order,a._physical)-number_(b._order,b._physical);});}
  specs.filter(function(s){return s.kind==='columns'||s.kind==='notes';}).forEach(function(s){order(s.rows).forEach(function(r){
    if(yes_(r._delete))return;
    if(!r._owner||!(s.kind==='columns'?r.title:r.content))return; // unfinished new line is a draft, never cleared by unrelated saves
    var c=byId[ref(r._owner)];if(!c)throw new Error(s.name+': неизвестный ID раздела '+r._owner);if(deleted.has(c.storageId))return;
    var v={id:safeId_(r.id)||Utilities.getUuid()};
    if(s.kind==='columns'){
      v.title=text_(r.title);v.key=safeId_(r.key)||('col_'+v.id);v.isSticky=yes_(r.isSticky);if(r.width!=='')v.width=number_(r.width,120);
      ['headerColor','align'].forEach(function(k){if(r[k]!=='')v[k]=text_(r[k]);});
      if(r._savedKey&&r._savedKey!==v.key){columnKeys[c.storageId]=columnKeys[c.storageId]||{};columnKeys[c.storageId][r._savedKey]=v.key;}
    }else {v.content=text_(r.content);v.type=text_(r.type)||'info';v.position=r.position==='Под таблицей'?'bottom':r.position==='Над таблицей'||!r.position?'top':text_(r.position);['title','icon'].forEach(function(k){if(r[k]!=='')v[k]=text_(r[k]);});}
    c[s.kind].push(v);
  });});
  specs.filter(function(s){return s.kind==='products'||s.kind==='logs';}).forEach(function(s){
    var c=byUid[s.owner];if(!c&&s.owner!=='orphan')return;if(c&&deleted.has(c.storageId))return;
    order(s.rows).forEach(function(r){if(yes_(r._delete))return;
      if(s.kind==='products'){
        var keys=s.columns.filter(function(col){return col.key.indexOf('cell:')===0;});
        if(!r._id&&!keys.some(function(k){return r[k.key]!=='';}))return;
        var v={id:safeId_(r._id)||Utilities.getUuid(),cells:{},highlight:text_(r.highlight)||'none'};if(r.note!=='')v.note=text_(r.note);
        keys.forEach(function(k){var key=k.key.slice(5),renamed=(columnKeys[c.storageId]||{})[key]||key,value=r[k.key];if(v.cells[renamed]!==undefined&&v.cells[renamed]!==''&&value!==''&&v.cells[renamed]!==value)throw new Error('Два поля имеют один ключ '+renamed);if(value!==''||v.cells[renamed]===undefined)v.cells[renamed]=value;});c.rows.push(v);
      }else {if(!r._id&&!r.text)return;var l={id:safeId_(r._id)||Utilities.getUuid(),ownerId:c?c.id:'',date:text_(r.date),category:text_(r.category),text:text_(r.text),importance:text_(r.importance)||'normal'};if(r.author!=='')l.author=text_(r.author);d.changelog.push(l);}
    });
  });
  d.categories=d.categories.filter(function(c){return !deleted.has(c.storageId);});
  // Removing a category with descendants requires marking the descendants too.
  d.categories.forEach(function(c){if(c.startPageId&&!d.categories.some(function(v){return v.id===c.startPageId;}))delete c.startPageId;});
  if(d.settings.defaultCategoryId&&!d.categories.some(function(c){return c.id===d.settings.defaultCategoryId;}))delete d.settings.defaultCategoryId;
  return normalizeStorage_(d);
}
function cell_(v){if(v===undefined||v===null||v==='')return {};return {userEnteredValue:typeof v==='number'?{numberValue:v}:typeof v==='boolean'?{boolValue:v}:{stringValue:String(v)}};}
function valuesRequest_(id,row,col,values){return {updateCells:{start:{sheetId:id,rowIndex:row-1,columnIndex:col-1},rows:values.map(function(r){return {values:r.map(cell_)};}),fields:'userEnteredValue'}};}
function identity_(spec,r){if(spec.kind==='menu')return text_(r._uid);if(spec.kind==='columns'||spec.kind==='notes')return text_(r._owner)+'\t'+text_(r.id);return text_(r._id);}
function readyRow_(spec,r){if(spec.kind==='menu')return !!r.title;if(spec.kind==='columns')return !!r._owner&&!!r.title;if(spec.kind==='notes')return !!r._owner&&!!r.content;if(spec.kind==='products')return !!r._id||spec.columns.some(function(c){return c.key.indexOf('cell:')===0&&r[c.key]!=='';});if(spec.kind==='logs')return !!r._id||!!r.text;return !!r._id;}
function allocateId_(used){var n;do{n=Math.floor(Math.random()*2000000000)+1;}while(used[n]);used[n]=true;return n;}
function styleRequests_(id,spec,rows){
  var n=spec.columns.length,req=[{updateSheetProperties:{properties:{sheetId:id,gridProperties:{frozenRowCount:3}},fields:'gridProperties.frozenRowCount'}},{repeatCell:{range:{sheetId:id,startRowIndex:0,endRowIndex:2,startColumnIndex:0,endColumnIndex:n},cell:{userEnteredFormat:{backgroundColor:{red:0.06,green:0.12,blue:0.2},textFormat:{bold:true,foregroundColor:{red:1,green:1,blue:1}},wrapStrategy:'WRAP'}},fields:'userEnteredFormat'}},{updateDimensionProperties:{range:{sheetId:id,dimension:'ROWS',startIndex:0,endIndex:1},properties:{hiddenByUser:true},fields:'hiddenByUser'}},{updateDimensionProperties:{range:{sheetId:id,dimension:'ROWS',startIndex:2,endIndex:3},properties:{hiddenByUser:true},fields:'hiddenByUser'}},{updateDimensionProperties:{range:{sheetId:id,dimension:'COLUMNS',startIndex:0,endIndex:n},properties:{pixelSize:170},fields:'pixelSize'}}];
  spec.columns.forEach(function(c,i){if(['_uid','_savedId','_savedKey'].indexOf(c.key)>=0)req.push({updateDimensionProperties:{range:{sheetId:id,dimension:'COLUMNS',startIndex:i,endIndex:i+1},properties:{hiddenByUser:true},fields:'hiddenByUser'}});});
  req.push({repeatCell:{range:{sheetId:id,startRowIndex:3,endRowIndex:rows,startColumnIndex:0,endColumnIndex:n},cell:{userEnteredFormat:{numberFormat:{type:'TEXT'}}},fields:'userEnteredFormat.numberFormat'}});
  req.push({addProtectedRange:{protectedRange:{range:{sheetId:id,startRowIndex:0,endRowIndex:3},description:'Служебные строки каталога: меняйте поля через К10 Столбцы',warningOnly:true}}});return req;
}
function planNative_(data,current,revision,receipts){
  var target=nativeTables_(data),old=current.workbook||[],map=sheetMap_(),used={};Object.keys(map).forEach(function(id){used[id]=true;});
  var requests=[],guards=[],newRegistry=[];
  target.forEach(function(spec){
    var prev=old.find(function(s){return s.key===spec.key;}),sheet=prev&&map[prev.sheetId],id=sheet?prev.sheetId:allocateId_(used),fresh=!sheet;
    spec.sheetId=id;
    // Keep existing physical columns stable; appended or archived fields cannot shift another user's cell.
    if(prev){var desired=spec.columns;spec.columns=prev.columns.map(function(c){return desired.find(function(v){return v.key===c.key;})||col_(c.key.indexOf('archive:')===0?c.key:'archive:'+c.key,c.title.replace(/ \(архив\)$/,'')+' (архив)',false);});desired.forEach(function(c){if(!spec.columns.some(function(v){return v.key===c.key;}))spec.columns.push(c);});}
    var rows=Math.max(100,spec.rows.length+103,prev&&prev.grid.length+100||0),cols=Math.max(18,spec.columns.length);
    if(fresh){requests.push({addSheet:{properties:{sheetId:id,title:spec.name,gridProperties:{rowCount:rows,columnCount:cols}}}});}
    else {if(sheet.getName()!==spec.name)requests.push({updateSheetProperties:{properties:{sheetId:id,title:spec.name,hidden:false},fields:'title,hidden'}});if(sheet.getMaxRows()<rows||sheet.getMaxColumns()<cols)requests.push({updateSheetProperties:{properties:{sheetId:id,gridProperties:{rowCount:Math.max(sheet.getMaxRows(),rows),columnCount:Math.max(sheet.getMaxColumns(),cols)}},fields:'gridProperties.rowCount,gridProperties.columnCount'}});}
    var headers=[['CATALOG10',spec.key,spec.path],spec.columns.map(function(c){return c.title;}),spec.columns.map(function(c){return c.key;})];
    headers.forEach(function(vals,i){if(fresh||canonical((prev.grid[i]||[]).slice(0,vals.length))!==canonical(vals))requests.push(valuesRequest_(id,i+1,1,[vals]));});
    if(fresh||canonical(spec.columns.map(function(c){return c.key;}))!==canonical(prev.columns.map(function(c){return c.key;})))requests=requests.concat(styleRequests_(id,spec,rows));
    var existing=prev?prev.rows:[],usedRows=new Set(),next=prev?Math.max(3,prev.grid.length)+1:4;
    spec.rows.forEach(function(row,i){
      var key=identity_(spec,row),match=existing.find(function(r){return identity_(spec,r)===key&&!usedRows.has(r._physical);});
      // A just-entered row has no generated ID yet. Match its physical position within
      // the same table; parser preserves encounter order for generated entries.
      if(!match)match=existing.find(function(r){if(usedRows.has(r._physical)||!readyRow_(spec,r))return false;if(spec.kind==='menu')return !r._uid&&text_(r.id)===text_(row.id)&&r.title===row.title;if(spec.kind==='columns'||spec.kind==='notes')return !r.id&&r._owner===row._owner&&(r.title===row.title||r.content===row.content);return !r._id&&spec.columns.filter(function(c){return c.key!=='_id'&&c.key!=='_order';}).every(function(c){return text_(r[c.key])===text_(row[c.key]);});});
      var physical=match?match._physical:next++;if(match)usedRows.add(physical);
      var changed=[];spec.columns.forEach(function(c,j){if(c.editable===false&&c.title.endsWith(' (архив)'))return;var value=row[c.key]===undefined?'':row[c.key],prior=match?match[c.key]:'';if(value===prior||text_(value)===text_(prior)&&typeof value===typeof prior)return;changed.push({col:j+1,value:value,old:prior});});
      if(!fresh&&!match){requests.push(valuesRequest_(id,physical,1,[spec.columns.map(function(c){return row[c.key]===undefined?'':row[c.key];})]));guards.push({id:id,row:physical,col:1,values:spec.columns.map(function(){return '';})});}
      else if(!fresh)changed.forEach(function(c){requests.push(valuesRequest_(id,physical,c.col,[[c.value]]));guards.push({id:id,row:physical,col:c.col,value:c.old});});
      if(!fresh&&match&&changed.length){var identityKeys=spec.kind==='menu'?['_uid','id']:spec.kind==='columns'||spec.kind==='notes'?['_owner','id']:['_id'];identityKeys.forEach(function(k){var j=prev.columns.findIndex(function(c){return c.key===k;});if(j>=0)guards.push({id:id,row:physical,col:j+1,value:match[k]});});}
    });
    if(fresh&&spec.rows.length)requests.push(valuesRequest_(id,4,1,spec.rows.map(function(row){return spec.columns.map(function(c){return row[c.key]===undefined?'':row[c.key];});})));
    existing.forEach(function(row){if(usedRows.has(row._physical)||!readyRow_(spec,row))return;var blank=spec.columns.map(function(){return '';});requests.push(valuesRequest_(id,row._physical,1,[blank]));row._cleared=true;guards.push({id:id,row:row._physical,col:1,values:prev.columns.map(function(c){return row[c.key];})});});
    newRegistry.push([spec.key,spec.kind,spec.owner,id,spec.name,spec.path]);
  });
  old.filter(function(s){return !target.some(function(t){return t.key===s.key;});}).forEach(function(s){requests.push({updateSheetProperties:{properties:{sheetId:s.sheetId,hidden:true,title:('Архив '+s.name).slice(0,85)+' '+s.sheetId},fields:'hidden,title'}});});
  var index=ss_().getSheetByName(V10_INDEX),control=ss_().getSheetByName(V10_CONTROL),hash=data?digest_(canonical(data)):'',modified=new Date().toISOString();
  var registryRows=[['Ключ','Тип','Внутренний ID владельца','Номер листа Google','Лист','Полный путь']].concat(newRegistry);
  var oldRegistryRows=index.getLastRow();while(registryRows.length<oldRegistryRows)registryRows.push(['','','','','','']);
  // Registry writes are necessary only for structural edits.
  var priorRegistry=[['Ключ','Тип','Внутренний ID владельца','Номер листа Google','Лист','Полный путь']].concat(old.map(function(s){return [s.key,s.kind,s.owner,s.sheetId,s.name,s.path];}));
  if(registryRows.length>index.getMaxRows())requests.push({updateSheetProperties:{properties:{sheetId:index.getSheetId(),gridProperties:{rowCount:registryRows.length+100}},fields:'gridProperties.rowCount'}});
  if(canonical(registryRows)!==canonical(priorRegistry))requests.push(valuesRequest_(index.getSheetId(),1,1,registryRows));
  requests.push(valuesRequest_(control.getSheetId(),2,1,[[revision,hash,modified,!!data]]));
  var receiptRows=(receipts||[]).map(function(r){return [r.id,r.hash];});while(receiptRows.length<(current.receipts||[]).length)receiptRows.push(['','']);
  if(canonical(receipts)!==canonical(current.receipts)&&receiptRows.length)requests.push(valuesRequest_(control.getSheetId(),5,1,receiptRows));
  return {requests:requests,guards:guards,data:data,revision:revision,hash:hash,modified:modified,workbook:target,receipts:receipts};
}
function readRanges_(grids){
  // POST body + numeric sheet IDs: no URL length limit from Cyrillic sheet names.
  var result=service_().Values.batchGetByDataFilter({dataFilters:grids.map(function(g){return {gridRange:g};}),valueRenderOption:'UNFORMATTED_VALUE',dateTimeRenderOption:'FORMATTED_STRING',majorDimension:'ROWS'},ss_().getId()).valueRanges||[];
  function key(g){return [g.sheetId,g.startRowIndex||0,g.endRowIndex===undefined?'*':g.endRowIndex,g.startColumnIndex||0,g.endColumnIndex===undefined?'*':g.endColumnIndex].join(':');}
  var matched={};result.forEach(function(r){(r.dataFilters||[]).forEach(function(f){if(f.gridRange)matched[key(f.gridRange)]=r.valueRange;});});
  return grids.map(function(g){var v=matched[key(g)];if(!v)throw new Error('Google не вернул запрошенный диапазон. Повторите попытку.');return v;});
}
function guardNative_(plan){
  if(!plan.guards.length)return;
  var groups={};plan.guards.forEach(function(g){var key=g.id+':'+g.row,group=groups[key]||(groups[key]={id:g.id,row:g.row,expected:{},lo:g.col,hi:g.col});var vals=g.values||[g.value];vals.forEach(function(v,j){var col=g.col+j;group.lo=Math.min(group.lo,col);group.hi=Math.max(group.hi,col);group.expected[col]=v===undefined?'':v;});});
  var rows=Object.keys(groups).map(function(k){return groups[k];}),values=readRanges_(rows.map(function(g){return {sheetId:g.id,startRowIndex:g.row-1,endRowIndex:g.row,startColumnIndex:g.lo-1,endColumnIndex:g.hi};}));
  rows.forEach(function(g,i){var actual=values[i].values&&values[i].values[0]||[];Object.keys(g.expected).forEach(function(col){var value=actual[Number(col)-g.lo];if(canonical(g.expected[col])!==canonical(value===undefined?'':value))throw new Error('Ячейка была изменена в Google Таблице во время записи. Повторите сохранение; черновик приложения сохранён.');});});
}
function a1_(n){var s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;}
function writeNative_(data,current,revision,receipts){var plan=planNative_(data,current,revision,receipts);guardNative_(plan);apiBatch_(plan.requests);try{cacheData_(plan);props_().deleteProperty('V10_ERROR');}catch(e){}return plan;}
function refreshNative_(){
  var state=readNative_();if(!state.data)return state;
  var hash=digest_(canonical(state.data)),target=nativeTables_(state.data);
  // Plan only when actual content changed (including menu renames/new rows). No
  // formatting, clearing, copying or revision bump for unchanged content.
  if(hash!==state.hash){state=writeNative_(state.data,state,state.revision+1,state.receipts);}
  else cacheData_(state);
  props_().deleteProperty('V10_ERROR');return state;
}
function cacheData_(state){
  if(!state.data)return;
  var cache=CacheService.getScriptCache(),json=JSON.stringify(state.data),chunks=[];
  // Cache is temporary acceleration only. It can be discarded at any time.
  for(var i=0;i<json.length;){var end=Math.min(json.length,i+18000);var code=json.charCodeAt(end-1);if(code>=0xD800&&code<=0xDBFF)end--;chunks.push(json.slice(i,end));i=end;}
  if(chunks.length>80)return;
  chunks.forEach(function(s,i){cache.put('v10:'+state.revision+':'+state.hash+':'+i,s,300);});cache.put('v10:'+state.revision+':'+state.hash+':count',String(chunks.length),300);
}
function cachedData_(head){try{var cache=CacheService.getScriptCache(),prefix='v10:'+head.revision+':'+head.hash+':',count=Number(cache.get(prefix+'count'));if(!count)return null;var s='';for(var i=0;i<count;i++){var part=cache.get(prefix+i);if(part===null)return null;s+=part;}return JSON.parse(s);}catch(e){return null;}}
function syncWorkbook(){
  var lock=LockService.getScriptLock();if(!lock.tryLock(3000)){props_().setProperty('V10_DIRTY',Utilities.getUuid());return;}
  var mark=props_().getProperty('V10_DIRTY');
  try {var state=refreshNative_();var guide=ss_().getSheetByName(V10_GUIDE);if(guide)guide.getRange(12,1).setValue('Проверено: '+new Date().toISOString()+'. Версия '+state.revision);if(props_().getProperty('V10_DIRTY')===mark)props_().deleteProperty('V10_DIRTY');return state;}
  catch(err){props_().setProperty('V10_ERROR',String(err.message||err).slice(0,7000));var guide=ss_().getSheetByName(V10_GUIDE);if(guide)guide.getRange(12,1).setValue('Ошибка: '+String(err.message||err).slice(0,7000));throw err;}
  finally{lock.releaseLock();}
}
function workbookOnEdit(e){if(!e||!e.range)return;var name=e.range.getSheet().getName();if(name.indexOf('К10 ')!==0||[V10_CONTROL,V10_INDEX,V10_GUIDE].indexOf(name)>=0)return;props_().setProperty('V10_DIRTY',Utilities.getUuid());syncWorkbook();}
function workbookOnChange(e){if(e&&e.changeType==='EDIT')return;props_().setProperty('V10_DIRTY',Utilities.getUuid());}
function workbookMaintenance(){var p=props_(),last=Number(p.getProperty('V10_CHECKED'))||0;if(p.getProperty('V10_DIRTY')||Date.now()-last>60000){syncWorkbook();p.setProperty('V10_CHECKED',String(Date.now()));}}
function requestWorkbookSync(){props_().setProperty('V10_DIRTY',Utilities.getUuid());ss_().toast('Запрос принят. Фоновая проверка выполнится в течение минуты.','Каталог',5);}
function onOpen(){SpreadsheetApp.getUi().createMenu('Каталог').addItem('Проверить изменения','requestWorkbookSync').addItem('Установить / обновить структуру','installWorkbook').addToUi();}
function installWorkbook(){
  service_();var p=props_(),password=p.getProperty('ADMIN_PASSWORD');if(!password||password.length<12)throw new Error('Задайте Script Property ADMIN_PASSWORD: минимум 12 символов.');
  var lock=LockService.getScriptLock();lock.waitLock(10000);
  try {
    if(!p.getProperty('SESSION_SECRET_V8'))p.setProperty('SESSION_SECRET_V8',Utilities.getUuid()+Utilities.getUuid());
    if(p.getProperty('V10_MIGRATING')&&ss_().getSheetByName(V10_CONTROL)&&readHead_().initialized)p.deleteProperty('V10_MIGRATING');
    if(!ss_().getSheetByName(V10_CONTROL)||p.getProperty('V10_MIGRATING')){
      var old=legacyState_(),data=old.data?normalizeStorage_(old.data):null;
      p.setProperty('V10_OLD_SHEET_IDS',JSON.stringify((old.workbook||[]).map(function(s){return s.sheetId;})));
      // No source data is changed or deleted. The old snapshot is migration backup only.
      p.setProperty('V10_MIGRATING','1');
      var ctl=ss_().getSheetByName(V10_CONTROL)||ss_().insertSheet(V10_CONTROL),index=ss_().getSheetByName(V10_INDEX)||ss_().insertSheet(V10_INDEX);
      ctl.getRange(1,1,4,4).setValues([['Версия','Отпечаток','Изменено','Заполнено'],[0,'','',false],['Служебные поля. Не изменять.','','',''],['ID запроса','Отпечаток запроса','','']]);
      try{writeNative_(data,{workbook:[],receipts:[],revision:0},(old.revision||0)+(data?1:0),old.receipts||[]);}
      catch(err){if(!readHead_().initialized)throw err;}
      p.deleteProperty('V10_MIGRATING');
    }else refreshNative_();
    var guide=ss_().getSheetByName(V10_GUIDE)||ss_().insertSheet(V10_GUIDE);
    guide.getRange(1,1,10,1).setValues([
      ['КАТАЛОГ 10 — данные хранятся непосредственно в обычных листах'],
      ['К10 Главное меню — верхние вкладки. Меняйте ID, название, тип и порядок.'],
      ['К10 Меню … — дочерние разделы конкретного узла, на любой глубине.'],
      ['К10 Товары … — отдельная таблица товаров. К10 Журнал … — отдельный журнал обновлений.'],
      ['К10 Навигатор содержит полные пути и имена всех рабочих листов.'],
      ['К10 Столбцы / К10 Пометки / К10 Настройки — параметры страниц.'],
      ['Новая строка: заполните название. Можно указать свой уникальный ID; пустой ID создастся автоматически.'],
      ['Удаление: Да в столбце Удалить. Не удаляйте листы и служебные строки 1 и 3.'],
      ['Одинаковая ячейка при одновременной ручной правке: в Google остаётся последнее значение.'],
      ['Старые листы v8/v9 — только резерв миграции. Работайте с листами К10.']]);guide.setColumnWidth(1,1050);guide.getRange(1,1,10,1).setWrap(true);
    installTriggers_();
    p.setProperty('V10_INSTALLED','1');p.deleteProperty('V10_ERROR');
    var oldIds=JSON.parse(p.getProperty('V10_OLD_SHEET_IDS')||'[]');
    ss_().getSheets().forEach(function(s){if(oldIds.indexOf(s.getSheetId())>=0||['__DATA__','__CATALOG_A_V8__','__CATALOG_B_V8__','Каталог_просмотр_v8'].indexOf(s.getName())>=0)s.hideSheet();});
    ss_().getSheetByName(V10_CONTROL).hideSheet();
    var root=ss_().getSheetByName('К10 Главное меню')||ss_().getSheetByName(V10_INDEX);ss_().setActiveSheet(root);ss_().moveActiveSheet(1);
  }finally{lock.releaseLock();}
}
// Compatibility aliases for diagnostics only, never persistent JSON storage.
function readState_(){return readNative_();}
function findSheet_(spec){return sheetMap_()[spec.sheetId];}
function grid_(sheet,spec){return readNative_().workbook.find(function(s){return s.sheetId===spec.sheetId;}).rows;}

function installTriggers_(){
    var handlers=['workbookOnEdit','workbookOnChange','workbookMaintenance'];ScriptApp.getProjectTriggers().filter(function(t){return handlers.indexOf(t.getHandlerFunction())>=0;}).forEach(function(t){ScriptApp.deleteTrigger(t);});
    ScriptApp.newTrigger('workbookOnEdit').forSpreadsheet(ss_()).onEdit().create();ScriptApp.newTrigger('workbookOnChange').forSpreadsheet(ss_()).onChange().create();ScriptApp.newTrigger('workbookMaintenance').timeBased().everyMinutes(1).create();
}

// One-time, read-only compatibility reader for v7/v8/v9. No JSON writes.
function legacyState_(){
  var WB_START=4;
  var raw=props_().getProperty('CATALOG_POINTER_V8'),state=null,ss=SpreadsheetApp.getActiveSpreadsheet();
  if(raw){var ptr=JSON.parse(raw);if(ptr.sheet){var sh=ss.getSheetByName(ptr.sheet);if(!sh)throw new Error('Нет прежнего листа '+ptr.sheet);var text=sh.getRange(1,1,ptr.chunks,1).getValues().map(function(r){return String(r[0]);}).join('');if(digest_(text)!==ptr.digest)throw new Error('Повреждено прежнее хранилище. Миграция остановлена.');state=JSON.parse(text);}}
  if(!state){var old=ss.getSheetByName('__DATA__');if(old&&old.getLastRow()){var value=old.getRange(1,1,old.getLastRow(),1).getValues().map(function(r){return r[0]?String(r[0]):'';}).join('');if(value)state={revision:1,data:JSON.parse(value),receipts:[]};}}
  if(!state)return {revision:0,data:null,receipts:[]};
  if(state.workbook&&state.workbook.length){var imported=importWorkbook_(state,readWorkbook_(state),false);state.data=imported.data;if(imported.changed)state.revision++;}
  state.data=sharedData(validateCatalog(state.data));return state;
/** Editable workbook, protocol 9. Canonical snapshots + per-table acknowledged baselines.
 * All imports and app writes share ScriptLock. Writes patch changed cells, never clear a live sheet.
 * installWorkbook() creates editor sheets and installs the two owned triggers once.
 */
var WB_ENABLED = 'WORKBOOK_ENABLED_V9';
var WB_DIRTY = 'WORKBOOK_DIRTY_V9';
var WB_ERROR = 'WORKBOOK_ERROR_V9';
var WB_START = 4;
function clone_(v) { return JSON.parse(JSON.stringify(v)); }
function text_(v) { return v === undefined || v === null ? '' : String(v); }
function sameCell_(a,b) { return text_(a) === text_(b); }
function yes_(v) { return v === true || /^(да|true|1)$/i.test(text_(v).trim()); }
function reference_(v) {
  var s=text_(v), m=s.match(/ ⟦(.*)⟧$/); return m ? m[1] : (s==='Главное меню' ? '' : s);
}
function pathFor_(data, id) {
  var result=[], seen={};
  while(id) { if(seen[id]) throw new Error('Цикл меню'); seen[id]=true; var c=data.categories.find(function(x){return x.id===id;}); if(!c) break; result.unshift(c.title); id=c.parentId; }
  return result.join(' › ');
}
function label_(data,id) { return id ? pathFor_(data,id)+' ⟦'+id+'⟧' : 'Главное меню'; }
function column_(key,title,editable) { return {key:key,title:title,editable:editable!==false}; }
function table_(key,name,kind,columns,rows,categoryId) { return {key:key,name:name,kind:kind,columns:[column_('_id','Служебный ID — не менять',false)].concat(columns),rows:rows,categoryId:categoryId||''}; }
function row_(id,values) { var result=Object.assign({_id:id},values);delete result.id;return result; }
function entityId_(owner,id) { return JSON.stringify([owner,id]); }
function decodeId_(id) { try { var v=JSON.parse(id); if(Array.isArray(v)&&v.length===2)return v; } catch(e) {} return ['',id]; }
function workbookTables_(data) {
  if(!data) return [];
  var C=column_, tables=[], cats=data.categories.slice().sort(function(a,b){return pathFor_(data,a.id).localeCompare(pathFor_(data,b.id),'ru');});
  var typeNames={group:'Раздел',page:'Страница',changelog:'Журнал'};
  tables.push(table_('menu','01_Меню','menu',[
    C('title','Название'),C('parent','Родитель — выбрать из списка'),C('type','Тип'),C('order','Порядок'),C('start','Стартовая страница'),C('description','Описание'),C('badge','Бейдж / акция'),C('statusBadge','Наличие / статус'),C('color','Цвет'),C('icon','Иконка'),C('slug','Короткое имя'),C('lastUpdated','Дата обновления'),C('_delete','Удалить (Да)'),C('_path','Полный путь меню',false),C('_depth','Уровень',false),C('_sheet','Лист товаров',false)
  ],cats.map(function(c){return row_(c.id,{title:c.title,parent:label_(data,c.parentId),type:typeNames[c.type],order:c.order,start:c.startPageId?label_(data,c.startPageId):'',description:c.description||'',badge:c.badge||'',statusBadge:c.statusBadge||'',color:c.color||'',icon:c.icon||'',slug:c.slug||'',lastUpdated:c.lastUpdated||'',_delete:'',_path:pathFor_(data,c.id),_depth:pathFor_(data,c.id).split(' › ').length,_sheet:c.type==='page'||c.columns ? productSheetName_(c):''});})));
  var cols=[],notes=[];
  cats.forEach(function(c){
    (c.columns||[]).forEach(function(v,i){cols.push(row_(entityId_(c.id,v.id),{owner:label_(data,c.id),title:v.title,key:v.key,width:v.width||'',headerColor:v.headerColor||'',align:v.align||'',isSticky:v.isSticky?'Да':'',order:i+1,_delete:''}));});
    (c.notes||[]).forEach(function(v,i){notes.push(row_(entityId_(c.id,v.id),{owner:label_(data,c.id),title:v.title||'',content:v.content,type:v.type,position:v.position==='top'?'Над таблицей':'Под таблицей',icon:v.icon||'',order:i+1,_delete:''}));});
  });
  tables.push(table_('columns','02_Столбцы','columns',[C('owner','Страница — выбрать из списка'),C('title','Название столбца'),C('key','Ключ данных'),C('width','Ширина, px'),C('headerColor','Цвет шапки'),C('align','Выравнивание'),C('isSticky','Закрепить (Да)'),C('order','Порядок'),C('_delete','Удалить (Да)')],cols));
  tables.push(table_('notes','03_Пометки','notes',[C('owner','Страница — выбрать из списка'),C('title','Заголовок'),C('content','Текст'),C('type','Тип пометки'),C('position','Положение'),C('icon','Иконка'),C('order','Порядок'),C('_delete','Удалить (Да)')],notes));
  tables.push(table_('logs','04_Обновления','logs',[C('date','Дата'),C('category','Раздел'),C('text','Изменение'),C('importance','Важность'),C('author','Автор'),C('order','Порядок'),C('_delete','Удалить (Да)')],data.changelog.map(function(v,i){return row_(v.id,Object.assign({},v,{order:i+1,_delete:''}));})));
  tables.push(table_('settings','05_Настройки','settings',[C('title','Параметр',false),C('value','Значение')],[row_('appName',{title:'Название приложения',value:data.appName}),row_('currencySymbol',{title:'Валюта',value:data.settings.currencySymbol||'₽'}),row_('defaultCategoryId',{title:'Раздел по умолчанию',value:data.settings.defaultCategoryId?label_(data,data.settings.defaultCategoryId):''})]));
  cats.filter(function(c){return c.type==='page'||c.columns;}).forEach(function(c){
    var columns=[C('_path','Путь меню',false),C('_delete','Удалить (Да)'),C('_order','Порядок'),C('highlight','Подсветка'),C('note','Примечание')].concat((c.columns||[]).map(function(col){return C('cell:'+col.key,col.title);}));
    tables.push(table_('products:'+c.id,productSheetName_(c),'products',columns,(c.rows||[]).map(function(r,i){var v={_path:pathFor_(data,c.id),_delete:'',_order:i+1,highlight:r.highlight||'none',note:r.note||''};(c.columns||[]).forEach(function(col){v['cell:'+col.key]=r.cells[col.key]===undefined?'':r.cells[col.key];});return row_(r.id,v);}),c.id));
  });
  return tables;
}
function productSheetName_(cat) { return 'Т_'+cat.title.replace(/[\[\]*?:/\\]/g,' ').slice(0,55)+'_'+digest_(cat.id).slice(0,8); }
function findSheet_(spec) {
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  return spec.sheetId ? ss.getSheets().find(function(s){return s.getSheetId()===spec.sheetId;}) : null;
}
function grid_(sheet,spec) {
  var width=spec.columns.length;
  var keys=sheet.getRange(3,1,1,width).getValues()[0].map(text_);
  if(canonical(keys)!==canonical(spec.columns.map(function(c){return c.key;}))) throw new Error('Не меняйте служебные столбцы листа «'+sheet.getName()+'». Для столбцов используйте 02_Столбцы.');
  var n=Math.max(0,sheet.getLastRow()-WB_START+1), values=n ? sheet.getRange(WB_START,1,n,width).getValues() : [];
  var rows=[], seen={};
  values.forEach(function(vals,i){
    if(vals.every(function(v){return v==='';}))return;
    var row={}; spec.columns.forEach(function(c,j){row[c.key]=vals[j];});row._physical=i+WB_START;
    if(row._id) { row._id=String(row._id); if(seen[row._id])throw new Error('Повтор служебного ID в «'+sheet.getName()+'»');seen[row._id]=true; }
    rows.push(row);
  });
  return rows;
}
function readWorkbook_(state) {
  var actual={};
  (state.workbook||[]).forEach(function(spec){var sheet=findSheet_(spec);if(!sheet)throw new Error('Лист «'+spec.name+'» удалён. Верните его через отмену/историю Google Таблицы.');actual[spec.key]=grid_(sheet,spec);});
  return actual;
}
function normalizedField_(key,v) { return ['owner','parent','start'].indexOf(key)>=0 ? reference_(v) : text_(v); }
function parseNumber_(v,fallback,label) { if(v==='')return fallback;var n=Number(text_(v).replace(',','.'));if(!isFinite(n))throw new Error('Некорректное число: '+label);return n; }
function applyWorkbookRow_(data,spec,id,values,isNew) {
  var remove=yes_(values._delete), c, list, item, i;
  if(spec.kind==='menu') {
    c=data.categories.find(function(x){return x.id===id;});
    if(remove) {
      // Deleting a branch requires explicit marks on its children as well.
      data.categories=data.categories.filter(function(x){return x.id!==id;});
      data.categories.forEach(function(x){if(x.startPageId===id)delete x.startPageId;});
      if(data.settings.defaultCategoryId===id)delete data.settings.defaultCategoryId;
      return;
    }
    if(!c) {c={id:id,title:'',type:'page',parentId:null,order:data.categories.length+1,columns:[],rows:[],notes:[]};data.categories.push(c);}
    Object.keys(values).forEach(function(k){var v=values[k];if(k.charAt(0)==='_')return;
      if(k==='parent')c.parentId=reference_(v)||null;
      else if(k==='start')c.startPageId=reference_(v)||undefined;
      else if(k==='type') { c.type=({'Раздел':'group','Страница':'page','Журнал':'changelog'})[v]||v; }
      else if(k==='order')c.order=parseNumber_(v,c.order,'порядок меню');
      else c[k]=text_(v);
    });return;
  }
  if(spec.kind==='settings') {
    if(id==='appName')data.appName=text_(values.value);
    if(id==='currencySymbol')data.settings.currencySymbol=text_(values.value);
    if(id==='defaultCategoryId')data.settings.defaultCategoryId=reference_(values.value)||undefined;
    return;
  }
  var entityId=id;
  if(spec.kind==='products') {
    c=data.categories.find(function(x){return x.id===spec.categoryId;}); if(!c)throw new Error('Раздел товара удалён в приложении');
    list=c.rows||(c.rows=[]);
  } else if(spec.kind==='logs') list=data.changelog;
  else {
    var decoded=decodeId_(id), owner=reference_(values.owner)||decoded[0];entityId=decoded[1];
    if(!isNew && owner!==decoded[0])throw new Error('Перенос существующего столбца/пометки: создайте запись в нужном разделе, затем удалите старую.');
    c=data.categories.find(function(x){return x.id===owner;});if(!c)throw new Error('Выберите существующую страницу в столбце «Страница».');
    list=c[spec.kind]||(c[spec.kind]=[]);
  }
  i=list.findIndex(function(x){return x.id===entityId;});item=i>=0?list[i]:null;
  if(remove){if(i>=0)list.splice(i,1);return;}
  if(!item){
    item=spec.kind==='products'?{id:entityId,cells:{},highlight:'none'}:spec.kind==='columns'?{id:entityId,title:'Новый столбец',key:'col_'+Utilities.getUuid()}:spec.kind==='notes'?{id:entityId,content:'',type:'info',position:'top'}:{id:entityId,date:'',category:'',text:'',importance:'normal'};
    list.push(item);
  }
  var desiredOrder;
  Object.keys(values).forEach(function(k){var v=values[k];
    if(k==='order'||k==='_order'){desiredOrder=parseNumber_(v,list.indexOf(item)+1,'порядок');return;}
    if(k.charAt(0)==='_'||k==='owner')return;
    if(k.indexOf('cell:')===0){item.cells[k.slice(5)]=v;return;}
    if(k==='key' && spec.kind==='columns' && item.key!==text_(v)) {
      var previousKey=item.key,nextKey=text_(v);
      (c.rows||[]).forEach(function(r){
        if(r.cells[previousKey]!==undefined){if(r.cells[nextKey]!==undefined&&!sameCell_(r.cells[nextKey],r.cells[previousKey]))throw new Error('Новый ключ столбца уже содержит другие значения');r.cells[nextKey]=r.cells[previousKey];delete r.cells[previousKey];}
      });item.key=nextKey;
    }
    else if(k==='width') {if(v==='')delete item.width;else item.width=parseNumber_(v,120,'ширина');}
    else if(k==='isSticky')item.isSticky=yes_(v);
    else if(k==='position')item.position=v==='Под таблицей'?'bottom':v==='Над таблицей'?'top':v;
    else if(k==='highlight')item.highlight=text_(v)||'none';
    else if(['headerColor','align'].indexOf(k)>=0 && v==='')delete item[k];
    else item[k]=text_(v);
  });
  if(desiredOrder!==undefined){list.splice(list.indexOf(item),1);list.splice(Math.max(0,Math.min(list.length,Math.round(desiredOrder)-1)),0,item);}
}
function readyNewRow_(spec,row) {
  if(yes_(row._delete))return false;
  if(spec.kind==='menu')return !!text_(row.title).trim();
  if(spec.kind==='columns')return !!reference_(row.owner)&&!!text_(row.title).trim();
  if(spec.kind==='notes')return !!reference_(row.owner)&&!!text_(row.content).trim();
  if(spec.kind==='logs')return !!text_(row.text).trim();
  if(spec.kind==='products')return spec.columns.some(function(c){return c.key.indexOf('cell:')===0 && text_(row[c.key])!=='';});
  return false;
}
// Convert only actual edits into field-level changes, comparing each against its acknowledged baseline.
function importWorkbook_(state,actual,preferSheets) {
  var data=clone_(state.data), current=workbookTables_(state.data), conflicts=[], changed=false;
  (state.workbook||[]).forEach(function(spec){
    var target=current.find(function(t){return t.key===spec.key;}), physical=actual[spec.key]||[], sheet=findSheet_(spec);
    var baseline=spec.rows||[];
    baseline.forEach(function(old){if(!physical.some(function(r){return r._id===old._id;}) && target && target.rows.some(function(r){return r._id===old._id;}))conflicts.push(spec.name+': строка удалена физически; используйте «Удалить (Да)»');});
    physical.forEach(function(row){
      var old=baseline.find(function(r){return r._id===row._id;}), now=target&&target.rows.find(function(r){return r._id===row._id;}), fresh=!old&&!now;
      if(fresh && !readyNewRow_(spec,row))return;
      if(!row._id && fresh) {
        var owner=reference_(row.owner), uuid=Utilities.getUuid();
        row._id=(spec.kind==='columns'||spec.kind==='notes')?entityId_(owner,uuid):uuid;
        // Reserve the ID once. A retry reuses it even if validation later fails.
        // Migration reserves new IDs only in memory; legacy sheets stay unchanged.
      }
      if(!old && now)old=now; // interrupted projection after canonical commit
      var edits={};
      spec.columns.filter(function(c){return c.editable;}).forEach(function(col){
        var k=col.key, value=row[k];
        if(!fresh && normalizedField_(k,value)===normalizedField_(k,old&&old[k]))return;
        if(!preferSheets && !fresh && (!now || (normalizedField_(k,now[k])!==normalizedField_(k,old[k]) && normalizedField_(k,now[k])!==normalizedField_(k,value)))) {conflicts.push(spec.name+', строка '+row._physical+', «'+col.title+'»');return;}
        if(fresh && value==='')return;
        edits[k]=value;
      });
      if(Object.keys(edits).length){applyWorkbookRow_(data,spec,row._id,edits,fresh);changed=true;}
    });
  });
  if(conflicts.length)throw new Error('Конфликт: '+conflicts.slice(0,8).join('; ')+'. Значения в ячейках сохранены. Исправьте спорные значения или восстановите строки, затем «Каталог → Синхронизировать».');
  if(changed)validateCatalog(data);
  return {data:data,changed:changed};
}

}

// Shared pure data contract. Also embedded verbatim in Backend.gs by build-backend.mjs.
function canonical(value) {
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
function sharedData(data) {
  const result = JSON.parse(JSON.stringify(data));
  delete result.lastModified;
  for (const key of ['googleScriptUrl', 'adminPasswordHash', 'lastSyncTime', 'theme', 'compactMode', 'autoSyncInterval']) delete result.settings[key];
  return result;
}
function validateCatalog(data) {
  const fail = message => { throw new Error('Некорректные данные: ' + message); };
  if (!data || typeof data !== 'object' || !Array.isArray(data.categories) || !Array.isArray(data.changelog) || !data.settings || typeof data.settings !== 'object') fail('структура каталога');
  if (typeof data.appName !== 'string' || typeof data.version !== 'string') fail('название/версия');
  function checkKeys(value, depth = 0) {
    if (depth > 30) fail('слишком глубокая структура');
    if (value && typeof value === 'object') for (const k of Object.keys(value)) {
      if (['__proto__', 'constructor', 'prototype'].includes(k)) fail('недопустимое поле');
      checkKeys(value[k], depth + 1);
    }
  }
  checkKeys(data);
  const unique = (items, label) => {
    if (!Array.isArray(items)) fail(label);
    const seen = new Set();
    for (const item of items) {
      if (!item || typeof item.id !== 'string' || !item.id || seen.has(item.id)) fail('повторяющийся или пустой ID: ' + label);
      seen.add(item.id);
    }
  };
  unique(data.categories, 'разделы'); unique(data.changelog, 'журнал');
  const optionalText = (value, keys) => { for (const k of keys) if (value[k] !== undefined && typeof value[k] !== 'string') fail('поле ' + k); };
  const cats = new Map(data.categories.map(c => [c.id, c]));
  for (const c of data.categories) {
    optionalText(c, ['slug', 'badge', 'statusBadge', 'color', 'icon', 'startPageId', 'description', 'lastUpdated']);
    if (c.parentId != null && typeof c.parentId !== 'string') fail('родитель');
    if (typeof c.title !== 'string' || !['page', 'group', 'changelog'].includes(c.type) || !Number.isFinite(c.order)) fail('поля раздела ' + c.id);
    if (c.parentId && !cats.has(c.parentId)) fail('нет родителя ' + c.id);
    const seen = new Set([c.id]); let parent = c.parentId;
    while (parent) {
      if (seen.has(parent)) fail('цикл разделов');
      seen.add(parent); parent = cats.get(parent)?.parentId;
    }
    if (c.startPageId && !cats.has(c.startPageId)) fail('нет стартовой страницы ' + c.id);
    for (const field of ['columns', 'rows', 'notes']) if (c[field] !== undefined) unique(c[field], c.id + '/' + field);
    const keys = new Set();
    for (const col of c.columns || []) {
      if (typeof col.key !== 'string' || !col.key || keys.has(col.key) || typeof col.title !== 'string') fail('ключ столбца ' + c.id);
      if (col.width !== undefined && (!Number.isFinite(col.width) || col.width <= 0)) fail('ширина столбца');
      keys.add(col.key);
    }
    for (const row of c.rows || []) {
      optionalText(row, ['note']);
      if (row.highlight !== undefined && !['none','yellow','red','green','blue'].includes(row.highlight)) fail('подсветка строки');
      if (!row.cells || typeof row.cells !== 'object' || Array.isArray(row.cells)) fail('ячейки ' + row.id);
      for (const v of Object.values(row.cells)) if (typeof v !== 'string' && !(typeof v === 'number' && Number.isFinite(v))) fail('значение ячейки');
    }
    for (const n of c.notes || []) {
      optionalText(n, ['title', 'icon']);
      if (typeof n.content !== 'string' || !['top', 'bottom'].includes(n.position) || !['danger','warning','info','success','accent','purple'].includes(n.type)) fail('пометка');
    }
  }
  for (const l of data.changelog) if (['date', 'category', 'text'].some(k => typeof l[k] !== 'string')) fail('запись журнала');
  return data;
}
// Three-way merge by stable entity IDs; values edited on both sides are never silently overwritten.
function mergeCatalog(base, local, remote) {
  const conflicts = [];
  const eq = (a, b) => canonical(a) === canonical(b);
  const obj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const keyed = v => Array.isArray(v) && v.every(x => obj(x) && typeof x.id === 'string');
  function merge(b, l, r, path) {
    if (eq(l, b)) return r;
    if (eq(r, b) || eq(l, r)) return l;
    if (keyed(b) && keyed(l) && keyed(r)) {
      const bm = new Map(b.map(x => [x.id, x])), lm = new Map(l.map(x => [x.id, x])), rm = new Map(r.map(x => [x.id, x]));
      const ids = [...new Set([...r.map(x => x.id), ...l.map(x => x.id)])];
      const merged = new Map(ids.map(id => [id, merge(bm.get(id), lm.get(id), rm.get(id), path + '/' + id)]));
      const common = b.map(x => x.id).filter(id => lm.has(id) && rm.has(id));
      const order = arr => arr.map(x => x.id).filter(id => common.includes(id));
      const lo = order(l), ro = order(r);
      if (!eq(lo, common) && !eq(ro, common) && !eq(lo, ro)) conflicts.push(path + '/порядок');
      const primary = !eq(lo, common) ? l : r;
      const sequence = primary.map(x => x.id);
      // Insert additions missing from the primary sequence near their previous neighbour.
      for (const other of [r, l]) other.forEach((x, i) => {
        if (sequence.includes(x.id)) return;
        const previous = other.slice(0, i).reverse().find(y => sequence.includes(y.id));
        sequence.splice(previous ? sequence.indexOf(previous.id) + 1 : 0, 0, x.id);
      });
      return sequence.map(id => merged.get(id)).filter(x => x !== undefined);
    }
    if (obj(b) && obj(l) && obj(r)) {
      const out = {};
      for (const key of new Set([...Object.keys(b), ...Object.keys(l), ...Object.keys(r)])) {
        const v = merge(b[key], l[key], r[key], path + '/' + key);
        if (v !== undefined) out[key] = v;
      }
      return out;
    }
    conflicts.push(path); return l;
  }
  return { data: merge(base, local, remote, ''), conflicts };
}
