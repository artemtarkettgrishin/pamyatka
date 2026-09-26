import vm from 'node:vm';
import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
export function initialData(){const js=ts.transpileModule(readFileSync('src/data/initialData.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;const exports={};new Function('exports',js)(exports);return exports.INITIAL_APP_DATA;}
export function makeGas({legacy=null,v9=null,install=true}={}){
 const properties=new Map([['ADMIN_PASSWORD','test-password-12345']]),sheets=new Map(),triggers=[],cache=new Map();
 let locked=false,failWrite=false,failPointer=false,afterCommitFailure=false,nextId=0,writes=0,batchReads=0,batchWrites=0,rangeReads=0,beforeWrite=null;
 const sheet=(initialName,givenId)=>{
  if(sheets.has(initialName))return sheets.get(initialName);
  let name=initialName;const cells=new Map(),id=givenId??++nextId;nextId=Math.max(nextId,id);let maxRows=1000,maxCols=26,hidden=false;
  const s={cells,getSheetId:()=>id,getName:()=>name,setName(n){if(sheets.has(n)&&sheets.get(n)!==s)throw Error('Duplicate sheet name');sheets.delete(name);name=n;sheets.set(name,s);return s;},getLastRow:()=>Math.max(0,...[...cells.entries()].filter(([,v])=>v!=='').map(([k])=>+k.split(':')[0])),getMaxRows:()=>maxRows,getMaxColumns:()=>maxCols,setSize(r,c){maxRows=r??maxRows;maxCols=c??maxCols;},insertRowsAfter(a,n){maxRows+=n;},insertColumnsAfter(a,n){maxCols+=n;},clearContents(){cells.clear();},hideSheet(){hidden=true;},showSheet(){hidden=false;},isSheetHidden:()=>hidden,setColumnWidth(){},setWrap(){},setFrozenRows(){},setFrozenColumns(){},hideRows(){},hideColumns(){},setColumnWidths(){},setRowHeight(){},
   getRange(r,c,n=1,m=1){if(typeof r==='string'){const a=r.match(/^([A-Z]+)(\d+)$/);c=fromA1(a[1]);r=+a[2];}
    return {getSheet:()=>s,getRow:()=>r,getColumn:()=>c,getNumRows:()=>n,getNumColumns:()=>m,setNumberFormat(){return this;},setBackground(){return this;},setFontColor(){return this;},setFontWeight(){return this;},setWrap(){return this;},setDataValidation(){return this;},getValues(){rangeReads++;return rawValues(s,r,c,n,m);},getValue(){return this.getValues()[0][0];},setValues(values){if(beforeWrite)beforeWrite({sheet:s,row:r,col:c,values});if(failWrite){failWrite=false;throw Error('Injected write failure');}writes++;values.forEach((row,i)=>row.forEach((v,j)=>cells.set(`${r+i}:${c+j}`,v)));return this;},setValue(v){return this.setValues([[v]]);},clearContent(){for(let i=0;i<n;i++)for(let j=0;j<m;j++)cells.delete(`${r+i}:${c+j}`);return this;}};
   }};sheets.set(name,s);return s;
 };
 function fromA1(s){return [...s].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0);}
 function rawValues(s,r,c,n,m){return Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>s.cells.get(`${r+i}:${c+j}`)??''));}
 function trim(rows){rows=rows.map(r=>{while(r.length&&r.at(-1)==='')r.pop();return r;});while(rows.length&&!rows.at(-1).length)rows.pop();return rows;}
 const ss={getId:()=> 'test-sheet-id',setActiveSheet(){},moveActiveSheet(){},getSheetByName:n=>sheets.get(n),insertSheet:sheet,deleteSheet:s=>sheets.delete(s.getName()),getSheets:()=>[...sheets.values()],toast(){}};
 if(legacy)sheet('__DATA__').getRange(1,1).setValue(JSON.stringify(legacy));
 if(v9){for(const sh of v9.sheets){const s=sheet(sh.name,sh.id);for(const[k,v]of sh.cells)s.cells.set(k,v);}for(const[k,v]of v9.properties)properties.set(k,v);}
 const digest=s=>crypto.createHash('sha256').update(s).digest('base64url');
 const byId=id=>[...sheets.values()].find(s=>s.getSheetId()===id);
 const api={Values:{batchGet(id,{ranges}){batchReads++;return {valueRanges:ranges.map(range=>{const m=range.match(/^'((?:[^']|'')+)'(?:!([A-Z]+)(\d+):([A-Z]+)(\d+))?$/);if(!m)throw Error('Bad range '+range);const s=sheets.get(m[1].replace(/''/g,"'"));if(!s)throw Error('Missing sheet '+m[1]);const r=m[3]?+m[3]:1,c=m[2]?fromA1(m[2]):1,n=m[5]?+m[5]-r+1:s.getLastRow(),width=m[4]?fromA1(m[4])-c+1:s.getMaxColumns();return {range,values:trim(rawValues(s,r,c,n,width))};})};}},batchUpdate({requests}){
   // Validate ALL subrequests before mutation, like the real atomic Sheets API.
   const ids=new Set([...sheets.values()].map(s=>s.getSheetId())),names=new Set(sheets.keys());
   for(const req of requests){if(req.addSheet){const p=req.addSheet.properties;if(ids.has(p.sheetId)||names.has(p.title))throw Error('Duplicate sheet');ids.add(p.sheetId);names.add(p.title);}const id=req.updateCells?.start.sheetId??req.updateSheetProperties?.properties.sheetId;if(id!==undefined&&!ids.has(id))throw Error('Missing target sheet '+id);}
   if(beforeWrite)beforeWrite({requests});
   if(failWrite||failPointer){failWrite=false;failPointer=false;throw Error('Injected atomic batch failure');}
   batchWrites++;writes++;
   for(const req of requests){if(req.addSheet){const p=req.addSheet.properties;sheet(p.title,p.sheetId).setSize(p.gridProperties?.rowCount,p.gridProperties?.columnCount);}
    if(req.updateSheetProperties){const p=req.updateSheetProperties.properties,s=byId(p.sheetId);if(p.title)s.setName(p.title);if(p.hidden===true)s.hideSheet();if(p.hidden===false)s.showSheet();if(p.gridProperties)s.setSize(p.gridProperties.rowCount,p.gridProperties.columnCount);}
    if(req.updateCells){const u=req.updateCells,s=byId(u.start.sheetId);u.rows.forEach((r,i)=>r.values.forEach((cell,j)=>{const v=cell.userEnteredValue;const value=v?(v.stringValue??v.numberValue??v.boolValue??''):'';s.cells.set(`${u.start.rowIndex+i+1}:${u.start.columnIndex+j+1}`,value);}));}}
   if(afterCommitFailure){afterCommitFailure=false;throw Error('Connection lost after committed batch');}return {replies:requests.map(()=>({}))};
 }};
 api.Values.batchGetByDataFilter=({dataFilters},id)=>{batchReads++;return {valueRanges:dataFilters.map(f=>{const g=f.gridRange,sh=byId(g.sheetId);if(!sh)throw Error('Missing sheet '+g.sheetId);const row=g.startRowIndex||0,col=g.startColumnIndex||0,n=(g.endRowIndex??sh.getLastRow())-row,m=(g.endColumnIndex??sh.getMaxColumns())-col;return {dataFilters:[f],valueRange:{values:trim(rawValues(sh,row+1,col+1,Math.max(0,n),m))}};}).reverse()};};
 const builder=()=>({forSpreadsheet(){return this;},onEdit(){return this;},onChange(){return this;},timeBased(){return this;},everyMinutes(){return this;}});
 const context=vm.createContext({console,Date,Set,Map,JSON,Math,Number,String,Array,Object,isFinite,
  Sheets:{Spreadsheets:api},CacheService:{getScriptCache:()=>({get:k=>cache.get(k)??null,put:(k,v)=>cache.set(k,v),remove:k=>cache.delete(k)})},
  ScriptApp:{getProjectTriggers:()=>triggers,deleteTrigger:t=>triggers.splice(triggers.indexOf(t),1),newTrigger(name){const b=builder();b.create=()=>{const t={getHandlerFunction:()=>name};triggers.push(t);return t;};return b;}},
  PropertiesService:{getScriptProperties:()=>({getProperty:k=>properties.get(k)||null,deleteProperty:k=>properties.delete(k),setProperty(k,v){properties.set(k,v);}})},
  LockService:{getScriptLock:()=>{let own=false;return {tryLock(){if(locked)return false;locked=true;own=true;return true;},waitLock(){if(locked)throw Error('locked');locked=true;own=true;},hasLock:()=>own,releaseLock(){if(own){locked=false;own=false;}}};}},
  SpreadsheetApp:{getActiveSpreadsheet:()=>ss,flush(){}},Utilities:{getUuid:()=>crypto.randomUUID(),Charset:{UTF_8:'utf8'},DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,s)=>crypto.createHash('sha256').update(s).digest(),computeHmacSha256Signature:(s,key)=>crypto.createHmac('sha256',key).update(s).digest(),base64EncodeWebSafe:b=>Buffer.from(b).toString('base64url')},
  ContentService:{MimeType:{JSON:'application/json'},createTextOutput:text=>({text,setMimeType(){return this;}})}
 });
 vm.runInContext(readFileSync('public/google-apps-script.js','utf8'),context);
 if(install)context.setup();
 return {context,properties,sheets,triggers,cache,setBeforeWrite:f=>{beforeWrite=f;},get writes(){return writes;},get batchReads(){return batchReads;},get batchWrites(){return batchWrites;},get rangeReads(){return rangeReads;},failNextWrite:()=>{failWrite=true;},failNextPointer:()=>{failPointer=true;},loseNextResponse:()=>{afterCommitFailure=true;},holdLock:()=>{locked=true;},releaseLock:()=>{locked=false;},get:(params={})=>JSON.parse(context.doGet({parameter:params}).text),post:payload=>JSON.parse(context.doPost({postData:{contents:JSON.stringify(payload)}}).text)};
}
