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
