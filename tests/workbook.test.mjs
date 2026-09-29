import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeGas,initialData} from './gas-harness.mjs';
import {canonical,mergeCatalog} from '../shared/catalog.js';
const ready=()=>makeGas({legacy:initialData()});
const state=g=>g.context.readNative_();
function table(g,kind){return state(g).workbook.find(s=>s.kind===kind&&(kind!=='products'||s.rows.length));}
const sheet=(g,s)=>g.context.findSheet_(s);
function cell(g,s,row,key){const r=typeof row==='object'?row:s.rows.find(r=>r._id===row||r.id===row);assert.ok(r,`${s.name} row ${row}`);return sheet(g,s).getRange(r._physical,s.columns.findIndex(c=>c.key===key)+1);}
function append(g,s,values){const n=sheet(g,s).getLastRow()+1;for(const[k,v]of Object.entries(values))sheet(g,s).getRange(n,s.columns.findIndex(c=>c.key===k)+1).setValue(v);return n;}
function post(g,data,rev,id=crypto.randomUUID()){const token=g.post({action:'login',password:'test-password-12345'}).token;return g.post({action:'saveData',token,data,baseRevision:rev,requestId:id});}
const product=(data,s)=>data.categories.find(c=>c.storageId===s.owner);
function sync(g){g.context.syncWorkbook();assert.equal(g.properties.get('V10_ERROR'),undefined);}
test('native sheets contain top menu, separate menu at every level, products and independent journals',()=>{
 const g=ready(),s=state(g),root=s.workbook.find(t=>t.key==='menu:root');assert.equal(root.rows.length,s.data.categories.filter(c=>!c.parentId).length);
 for(const c of s.data.categories){const m=s.workbook.find(t=>t.key==='menu:'+c.storageId);assert.equal(m.rows.length,s.data.categories.filter(v=>v.parentId===c.id).length);assert.ok(s.workbook.some(t=>t.key===(c.type==='changelog'?'logs:':'products:')+c.storageId));}
 for(const sh of g.sheets.values())if(sh.getName().startsWith('К10 '))for(const value of sh.cells.values())assert.ok(!(typeof value==='string'&&value.includes('"categories":')),sh.getName());
 const names=[...g.sheets.keys()],rev=g.get().revision;g.context.installWorkbook();assert.deepEqual([...g.sheets.keys()],names);assert.equal(g.get().revision,rev);assert.equal(g.triggers.length,3);
});
test('direct cell edits, zero and clearing propagate without resurrection or extra revisions',()=>{
 const g=ready(),s=table(g,'products'),key=s.columns.find(c=>c.key.startsWith('cell:')).key,id=s.rows[0]._id;
 for(const value of ['Из Google',0,'']){cell(g,s,id,key).setValue(value);sync(g);assert.equal(product(g.get().data,s).rows.find(r=>r.id===id).cells[key.slice(5)],value);const rev=g.get().revision;sync(g);assert.equal(g.get().revision,rev);}
});
test('one app price change uses one atomic write batch and never rewrites unrelated product cells',()=>{
 const g=ready(),before=g.get(),s=table(g,'products'),key=s.columns.find(c=>c.key.startsWith('cell:')).key;
 product(before.data,s).rows[0].cells[key.slice(5)]='Цена 1599';let requests;g.setBeforeWrite(e=>{if(e.requests)requests=e.requests;});const writes=g.batchWrites,res=post(g,before.data,before.revision);assert.equal(res.status,'ok');assert.equal(g.batchWrites-writes,1);
 const userWrites=requests.filter(r=>r.updateCells&&r.updateCells.start.sheetId===s.sheetId);assert.equal(userWrites.length,1);assert.equal(userWrites[0].updateCells.rows[0].values.length,1);assert.equal(cell(g,table(g,'products'),s.rows[0]._id,key).getValue(),'Цена 1599');
});
test('100 unchanged viewer polls perform zero catalog batch reads and zero writes',()=>{
 const g=ready(),before=g.get(),reads=g.batchReads,writes=g.writes;for(let i=0;i<100;i++)assert.equal(g.get({revision:before.revision}).status,'unchanged');assert.equal(g.batchReads,reads);assert.equal(g.writes,writes);
});
test('50 newly connected viewers share transient cache, cache eviction does not lose data',()=>{
 const g=ready(),before=g.get(),reads=g.batchReads;for(let i=0;i<50;i++)assert.equal(g.get().revision,before.revision);assert.equal(g.batchReads,reads);g.cache.clear();assert.equal(canonical(g.get().data),canonical(before.data));assert.equal(g.batchReads,reads+1);
});
test('sheet edit before delayed trigger is detected before app CAS and independent fields merge',()=>{
 const g=ready(),base=g.get(),local=structuredClone(base.data),s=table(g,'products'),fields=s.columns.filter(c=>c.key.startsWith('cell:'));
 cell(g,s,s.rows[0]._id,fields[0].key).setValue('SHEET');product(local,s).rows[0].cells[fields[1].key.slice(5)]='APP';const conflict=post(g,local,base.revision);assert.equal(conflict.status,'conflict');const merged=mergeCatalog(base.data,local,conflict.data);assert.equal(merged.conflicts.length,0);assert.equal(post(g,merged.data,conflict.revision).status,'ok');const row=product(g.get().data,s).rows[0];assert.equal(row.cells[fields[0].key.slice(5)],'SHEET');assert.equal(row.cells[fields[1].key.slice(5)],'APP');
});
test('sheet and app edits to one cell remain a detectable conflict',()=>{
 const g=ready(),base=g.get(),local=structuredClone(base.data),s=table(g,'products'),key=s.columns.find(c=>c.key.startsWith('cell:')).key;
 cell(g,s,s.rows[0]._id,key).setValue('SHEET');product(local,s).rows[0].cells[key.slice(5)]='APP';const r=post(g,local,base.revision);assert.equal(r.status,'conflict');assert.ok(mergeCatalog(base.data,local,r.data).conflicts.length);assert.equal(cell(g,s,s.rows[0]._id,key).getValue(),'SHEET');
});
test('new product gets ID once; explicit custom ID is also retained',()=>{
 const g=ready();let s=table(g,'products'),key=s.columns.find(c=>c.key.startsWith('cell:')).key;append(g,s,{[key]:'Новый товар'});sync(g);const c=product(g.get().data,s),r=c.rows.find(r=>r.cells[key.slice(5)]==='Новый товар');assert.ok(r.id);sync(g);assert.equal(product(g.get().data,s).rows.filter(v=>v.id===r.id).length,1);
 s=table(g,'products');append(g,s,{_id:'SKU-ручной-001',[key]:'Свой ID'});sync(g);assert.ok(product(g.get().data,s).rows.some(r=>r.id==='SKU-ручной-001'));
});
test('custom menu IDs and children create separate sheets recursively',()=>{
 const g=ready();let s=state(g).workbook.find(t=>t.key==='menu:root');append(g,s,{id:'my_lino',title:'Мой линолеум',type:'Раздел'});sync(g);
 for(const [id,title,parent,type]of [['my_tarkett','Таркетт','my_lino','Раздел'],['my_collection','Коллекция','my_tarkett','Страница'],['my_decor','Декор','my_collection','Страница']]){s=state(g).workbook.find(t=>t.key==='menu:'+parent);append(g,s,{id,title,type});sync(g);assert.equal(g.get().data.categories.find(c=>c.id===id).parentId,parent);assert.ok(state(g).workbook.find(t=>t.key==='products:'+id));}
});
test('editing menu ID and title preserves sheet identity, products and child references',()=>{
 const g=ready(),before=g.get(),cat=before.data.categories.find(c=>c.id==='cat_linoleum'),s=state(g).workbook.find(t=>t.rows.some(r=>r.id===cat.id)),owned=state(g).workbook.find(t=>t.key==='menu:'+cat.storageId);
 cell(g,s,cat.id,'id').setValue('linoleum_new');cell(g,s,cat.id,'title').setValue('Линолеум новый');sync(g);const after=g.get().data,changed=after.categories.find(c=>c.id==='linoleum_new');assert.equal(changed.storageId,cat.storageId);assert.equal(after.categories.filter(c=>c.parentId==='linoleum_new').length,before.data.categories.filter(c=>c.parentId===cat.id).length);const next=state(g).workbook.find(t=>t.key===owned.key);assert.equal(next.sheetId,owned.sheetId);assert.match(next.name,/Линолеум новый/);const rev=g.get().revision;sync(g);assert.equal(g.get().revision,rev);
});
test('duplicate menu IDs and cycles do not overwrite sheet input or accept app saves',()=>{
 const g=ready(),s=state(g).workbook.find(t=>t.key==='menu:root'),r=s.rows.find(r=>r.id==='cat_linoleum');cell(g,s,r,'parentId').setValue(r.id);assert.throws(()=>sync(g),/цикл/i);assert.equal(g.get().status,'error');assert.equal(cell(g,s,r,'parentId').getValue(),r.id);cell(g,s,r,'parentId').setValue('');sync(g);cell(g,s,r,'id').setValue(s.rows.find(x=>x.id!==r.id).id);assert.throws(()=>sync(g),/Повтор ID/);
});
test('adding columns and renaming their keys preserves product values and stabilizes revision',()=>{
 const g=ready(),p=table(g,'products'),c=product(g.get().data,p);let s=table(g,'columns');append(g,s,{_owner:c.id,id:'sku-col',title:'Артикул',key:'sku'});sync(g);let prod=state(g).workbook.find(t=>t.key===p.key);cell(g,prod,prod.rows[0]._id,'cell:sku').setValue('00123');sync(g);
 s=table(g,'columns');const row=s.rows.find(r=>r._owner===c.id&&r.id==='sku-col');cell(g,s,row,'key').setValue('article');sync(g);assert.equal(product(g.get().data,p).rows[0].cells.article,'00123');assert.equal(product(g.get().data,p).rows[0].cells.sku,undefined);const rev=g.get().revision;sync(g);assert.equal(g.get().revision,rev);
});
test('direct notes and independent journals each appear on their own tab',()=>{
 const g=ready(),p=table(g,'products'),c=product(g.get().data,p);append(g,table(g,'notes'),{_owner:c.id,id:'note-own',content:'Пометка Google',position:'Под таблицей',type:'info'});sync(g);assert.equal(product(g.get().data,p).notes.at(-1).position,'bottom');
 append(g,state(g).workbook.find(t=>t.key==='menu:root'),{id:'news-two',title:'Вторые новости',type:'Журнал'});sync(g);const log=state(g).workbook.find(t=>t.key==='logs:news-two');append(g,log,{_id:'log-second',text:'Отдельная запись',date:'26.09.2026',category:'Линолеум'});sync(g);assert.equal(g.get().data.changelog.find(l=>l.id==='log-second').ownerId,'news-two');
});
test('explicit row delete and physical row removal are reflected without resurrection',()=>{
 const g=ready();let s=table(g,'products');const id=s.rows[0]._id;cell(g,s,id,'_delete').setValue('Да');sync(g);assert.ok(!product(g.get().data,s).rows.some(r=>r.id===id));s=table(g,'products');const id2=s.rows[0]._id;sheet(g,s).getRange(s.rows[0]._physical,1,1,s.columns.length).clearContent();sync(g);assert.ok(!product(g.get().data,s).rows.some(r=>r.id===id2));
});
test('physical sorting does not cross-link values and explicit order changes app order',()=>{
 const g=ready();let s=table(g,'products'),sh=sheet(g,s),a=sh.getRange(4,1,1,s.columns.length).getValues(),b=sh.getRange(5,1,1,s.columns.length).getValues();sh.getRange(4,1,1,s.columns.length).setValues(b);sh.getRange(5,1,1,s.columns.length).setValues(a);sync(g);assert.equal(product(g.get().data,s).rows[0].id,s.rows[0]._id);s=state(g).workbook.find(t=>t.key===s.key);const r=s.rows.find(r=>r._id===b[0][0]);cell(g,s,r,'_order').setValue(0);sync(g);assert.equal(product(g.get().data,s).rows[0].id,b[0][0]);
});
test('bulk paste and formula-looking strings are stored as plain cell values',()=>{
 const g=ready();const s=table(g,'products'),j=s.columns.findIndex(c=>c.key.startsWith('cell:'))+1,range=sheet(g,s).getRange(4,j,2,2);range.setValues([['A','11'],['B','22']]);g.context.workbookOnEdit({range});assert.equal(product(g.get().data,s).rows[0].cells[s.columns[j-1].key.slice(5)],'A');const d=g.get();product(d.data,s).rows[0].cells[s.columns[j-1].key.slice(5)]='=IMPORTXML("https://example.invalid","//x")';const r=post(g,d.data,d.revision);assert.equal(r.status,'ok');assert.match(cell(g,table(g,'products'),s.rows[0]._id,s.columns[j-1].key).getValue(),/^=IMPORTXML/);
});
test('unfinished new rows are preserved across unrelated app saves',()=>{
 const g=ready(),s=table(g,'columns');const n=append(g,s,{title:'Ещё заполняю'}),before=g.get();before.data.appName='Changed';assert.equal(post(g,before.data,before.revision).status,'ok');assert.equal(sheet(g,s).getRange(n,s.columns.findIndex(c=>c.key==='title')+1).getValue(),'Ещё заполняю');
});
test('failed atomic write leaves rows and revision unchanged; lost response replays once',()=>{
 const g=ready(),before=g.get(),next=structuredClone(before.data);next.appName='New name';g.failNextWrite();assert.equal(post(g,next,before.revision).status,'error');assert.equal(canonical(g.get().data),canonical(before.data));const id=crypto.randomUUID();g.loseNextResponse();assert.equal(post(g,next,before.revision,id).status,'error');const committed=g.get();assert.equal(committed.data.appName,'New name');const replay=post(g,next,before.revision,id);assert.equal(replay.status,'ok');assert.equal(replay.revision,committed.revision);
});
test('v9 migration imports pending sheet edits and never modifies old JSON snapshots',()=>{
 const fixture=JSON.parse(readFileSync('tests/fixtures/v9-workbook.json','utf8')),g=makeGas({v9:fixture,install:false});
 const ptr=JSON.parse(g.properties.get('CATALOG_POINTER_V8')),old=g.sheets.get(ptr.sheet),raw=old.getRange(1,1,ptr.chunks,1).getValues().map(r=>r[0]).join(''),snapshot=JSON.parse(raw),spec=snapshot.workbook.find(s=>s.kind==='products'&&s.rows.length),sh=[...g.sheets.values()].find(s=>s.getSheetId()===spec.sheetId),key=spec.columns.findIndex(c=>c.key.startsWith('cell:'));
 sh.getRange(4,key+1).setValue('Последняя правка v9');g.context.installWorkbook();const data=g.get().data;assert.equal(data.categories.find(c=>c.id===spec.categoryId).rows[0].cells[spec.columns[key].key.slice(5)],'Последняя правка v9');assert.equal(old.getRange(1,1,ptr.chunks,1).getValues().map(r=>r[0]).join(''),raw);
 const count=g.sheets.size;g.context.installWorkbook();assert.equal(g.sheets.size,count);assert.equal(g.triggers.length,3);
});
test('migration retry after atomic failure retains original data and does not create duplicates',()=>{
 const g=makeGas({legacy:initialData(),install:false});g.failNextWrite();assert.throws(()=>g.context.installWorkbook());g.context.installWorkbook();assert.equal(g.get().status,'ok');assert.equal(g.get().data.categories.length,initialData().categories.length);const size=g.sheets.size;g.context.installWorkbook();assert.equal(g.sheets.size,size);
});
test('missing sheet fails clearly and maintenance recovers a delayed edit after lock contention',()=>{
 const g=ready(),s=table(g,'products'),key=s.columns.find(c=>c.key.startsWith('cell:')).key,range=cell(g,s,s.rows[0]._id,key);g.holdLock();range.setValue('Delayed');g.context.workbookOnEdit({range});assert.ok(g.properties.get('V10_DIRTY'));g.releaseLock();g.context.workbookMaintenance();assert.equal(product(g.get().data,s).rows[0].cells[key.slice(5)],'Delayed');g.sheets.delete(s.name);assert.throws(()=>sync(g),/Удалён рабочий лист/);
});
test('guard detects a changed cell or row identity between batch read and write',()=>{
 const g=ready(),s=table(g,'products'),key=s.columns.find(c=>c.key.startsWith('cell:')).key,before=g.get();product(before.data,s).rows[0].cells[key.slice(5)]='APP';
 const original=g.context.guardNative_;let once=true;g.context.guardNative_=plan=>{if(once){once=false;cell(g,s,s.rows[0]._id,key).setValue('SHEET WHILE SAVING');}return original(plan);};
 const res=post(g,before.data,before.revision);assert.equal(res.status,'error');assert.match(res.error,/во время записи/);assert.equal(cell(g,s,s.rows[0]._id,key).getValue(),'SHEET WHILE SAVING');sync(g);
});
test('clearing the parent ID moves an existing submenu entry to the main menu',()=>{
 const g=ready(),s=state(g).workbook.find(t=>t.kind==='menu'&&t.owner&&t.rows.length),row=s.rows[0];cell(g,s,row,'parentId').setValue('');sync(g);assert.equal(g.get().data.categories.find(c=>c.id===row.id).parentId,null);assert.ok(state(g).workbook.find(t=>t.key==='menu:root').rows.some(r=>r.id===row.id));
});
test('migration survives losing the successful API response',()=>{
 const g=makeGas({legacy:initialData(),install:false});g.loseNextResponse();g.context.installWorkbook();assert.equal(g.get().status,'ok');const n=g.sheets.size;g.context.installWorkbook();assert.equal(g.sheets.size,n);
});
