import test from 'node:test';
import assert from 'node:assert/strict';
import {makeGas,initialData} from './gas-harness.mjs';
import {canonical,createCatalogDelta,applyCatalogDelta,sharedData} from '../shared/catalog.js';
const ready=()=>makeGas({legacy:initialData()});
const auth=g=>g.post({action:'login',password:'test-password-12345'}).token;
const edit=data=>{const d=structuredClone(data);d.categories.find(c=>c.rows?.length).rows[0].cells.name='Изменённая позиция';return d;};
function send(g,base,next,id=crypto.randomUUID()){return g.post({action:'saveData',protocol:11,delta:createCatalogDelta(base.data,next),baseRevision:base.revision,requestId:id,token:auth(g)});}
test('delta round trip preserves additions, deletes, order, settings, zero and cleared fields',()=>{
 const base=sharedData(initialData()),next=edit(base),c=next.categories.find(c=>c.rows?.length);
 c.rows[0].cells.retail=0;c.rows[0].cells.name='';delete c.rows[0].note;
 c.rows.push({id:'added',cells:{name:'New'},highlight:'none'});c.rows.reverse();
 const leaf=next.categories.find(x=>x.id!==c.id&&!next.categories.some(y=>y.parentId===x.id)&&!next.categories.some(y=>y.startPageId===x.id)&&!next.changelog.some(l=>l.ownerId===x.id));next.categories=next.categories.filter(x=>x!==leaf);
 next.categories.push({id:'new-page',parentId:null,title:'Новая',type:'page',order:999,columns:[],rows:[],notes:[]});next.categories.reverse();next.settings.currencySymbol='EUR';next.changelog.reverse();
 const delta=createCatalogDelta(base,next);assert.equal(canonical(applyCatalogDelta(base,delta)),canonical(next));assert.equal(base.categories.some(c=>c.id==='new-page'),false);
});
test('malformed deltas are rejected without mutating source',()=>{
 const base=sharedData(initialData()),before=canonical(base);
 for(const delta of [null,{format:1,meta:{__bad:1},categories:null,changelog:null},{format:1,meta:{},categories:{upsert:[],remove:['missing']},changelog:null},{format:1,meta:{},categories:{upsert:[],remove:[],order:[]},changelog:null}])assert.throws(()=>applyCatalogDelta(base,delta));
 assert.equal(canonical(base),before);
});
test('new save protocol changes only one category and acknowledges normalized data',()=>{
 const g=ready(),base=g.get(),next=edit(base.data),delta=createCatalogDelta(base.data,next),id=crypto.randomUUID();assert.equal(delta.categories.upsert.length,1);
 const reads=g.metadataReads,writes=g.batchWrites,r=send(g,base,next,id);assert.equal(r.status,'ok');assert.equal(g.metadataReads-reads,1);assert.equal(g.batchWrites-writes,1);assert.equal(r.requestId,id);assert.ok(r.delta);assert.equal(canonical(applyCatalogDelta(next,r.delta)),canonical(g.get().data));
});
test('read deltas support skipped revisions; old viewers still receive full catalog',()=>{
 const g=ready(),base=g.get(),next=edit(base.data);assert.equal(send(g,base,next).status,'ok');const mid=g.get();mid.data.appName='Новое имя';assert.equal(send(g,g.get(),mid.data).status,'ok');
 const r=g.get({protocol:'11',revision:base.revision});assert.ok(r.delta);assert.equal(r.baseRevision,base.revision);assert.equal(canonical(applyCatalogDelta(base.data,r.delta)),canonical(g.get().data));assert.ok(g.get({revision:base.revision}).data);
});
test('evicted history falls back to full read; partial current cache never yields partial data',()=>{
 const g=ready(),base=g.get();send(g,base,edit(base.data));g.cache.delete('v11:revision:'+base.revision);assert.ok(g.get({protocol:'11',revision:base.revision}).data);
 const current=g.get(),head=g.context.readHead_();g.cache.delete('v10:'+head.revision+':'+head.hash+':0');const reads=g.batchReads;const r=g.get();assert.equal(canonical(r.data),canonical(current.data));assert.equal(g.batchReads,reads+1);
});
test('delta receipt survives lost response and cache eviction without applying twice',()=>{
 const g=ready(),base=g.get(),next=edit(base.data),id=crypto.randomUUID();g.loseNextResponse();assert.equal(send(g,base,next,id).status,'error');g.cache.clear();const committed=g.get(),r=send(g,base,next,id);assert.equal(r.status,'ok');assert.equal(r.revision,committed.revision);assert.equal(canonical(r.data),canonical(committed.data));
 assert.equal(send(g,base,{...next,appName:'different'},id).status,'error');
});
test('untriggered sheet change conflicts with stale delta and remains intact',()=>{
 const g=ready(),base=g.get(),s=g.context.readNative_().workbook.find(t=>t.kind==='products'&&t.rows.length),sh=g.context.findSheet_(s),column=s.columns.findIndex(c=>c.key==='cell:name')+1;
 sh.getRange(s.rows[0]._physical,column).setValue('Правка прямо в таблице');const r=send(g,base,edit(base.data));assert.equal(r.status,'conflict');assert.equal(sh.getRange(s.rows[0]._physical,column).getValue(),'Правка прямо в таблице');
});
test('cache bulk operations replace loops and cache outage cannot make Sheets unavailable',()=>{
 const g=ready(),data=g.get().data,c=data.categories.find(c=>c.rows?.length);c.rows[0].cells.name='Я'.repeat(200000);const s={data,revision:123,hash:'test'};
 const calls=g.cacheCalls;g.context.cacheData_(s);assert.equal(g.cacheCalls-calls,1);const reads=g.cacheCalls;assert.equal(canonical(g.context.cachedData_(s)),canonical(data));assert.equal(g.cacheCalls-reads,2);
 g.cache.clear();g.context.CacheService.getScriptCache=()=>({get(){throw Error('cache unavailable');},putAll(){throw Error('cache unavailable');}});assert.equal(g.get().status,'ok');
});
test('v11 preflight makes zero writes and preserves all sheet names, values and revision',()=>{
 const g=ready(),snapshot=()=>JSON.stringify([...g.sheets].map(([n,s])=>[n,[...s.cells]])),before=snapshot(),writes=g.writes;
 const result=g.context.checkV11();assert.equal(result.engineVersion,11);assert.equal(g.writes,writes);assert.equal(snapshot(),before);
});
test('metadata and row lookups avoid legacy per-sheet scans during save',()=>{
 const g=ready(),base=g.get();g.context.sheetMap_=()=>{throw Error('Per-sheet lookup on the save path');};assert.equal(send(g,base,edit(base.data)).status,'ok');
});
