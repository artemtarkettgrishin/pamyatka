// Reproducible synthetic benchmark; no connection to the user's live spreadsheet.
import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
import {makeGas} from './gas-harness.mjs';
import {createCatalogDelta,applyCatalogDelta,canonical} from '../shared/catalog.js';
function sample(){
 const categories=Array.from({length:7},(_,i)=>({id:'root'+i,title:'Раздел '+i,type:i===0?'changelog':'group',parentId:null,order:i+1,columns:[],rows:[],notes:[]}));
 const owners=['brand-a','brand-b',...Array.from({length:33},(_,i)=>'collection-'+i),'sale'];
 owners.forEach((id,i)=>categories.push({id,title:'Коллекция '+i,type:'page',parentId:i<2||id==='sale'?'root1':i<12?'brand-a':'brand-b',order:i+8,
 columns:Array.from({length:9},(_,j)=>({id:'column-'+j,key:j?'col_'+('x'.repeat(25))+j:'name',title:j?'Цена '+j:'Наименование'})),
 rows:Array.from({length:i<34?36:35},(_,r)=>({id:'row_'+i+'_'+r,highlight:'none',cells:Object.fromEntries(Array.from({length:9},(_,j)=>[j?'col_'+('x'.repeat(25))+j:'name',j?String(400+i+r+j):'Декор '+i+' ширина '+r+'м']))})),notes:[]}));
 return {appName:'Тестовый каталог',version:'3.1.0',settings:{currencySymbol:'₽',defaultCategoryId:'root0'},categories,changelog:Array.from({length:36},(_,i)=>({id:'log'+i,ownerId:'root0',date:'28.09.2026',category:'Линолеум',text:'Тестовое обновление '+i}))};
}
const data=sample();assert.equal(data.categories.reduce((n,c)=>n+c.rows.length,0),1294);
const g=makeGas({legacy:data});
for(let i=0;i<76;i++)g.context.SpreadsheetApp.getActiveSpreadsheet().insertSheet('Архив тест '+i).hideSheet();
const base=g.get(),next=structuredClone(base.data),cat=next.categories.find(c=>c.rows.length);cat.rows[0].cells[cat.columns[1].key]='999';
const delta=createCatalogDelta(base.data,next),token=g.post({action:'login',password:'test-password-12345'}).token,id=crypto.randomUUID();
const oldBody={action:'saveData',data:next,baseRevision:base.revision,requestId:id,token};
const newBody={action:'saveData',delta,protocol:11,baseRevision:base.revision,requestId:id,token};
const before={metadata:g.metadataReads,cache:g.cacheCalls,batchReads:g.batchReads,batchWrites:g.batchWrites};
const r=g.post(newBody);assert.equal(r.status,'ok');assert.equal(canonical(applyCatalogDelta(next,r.delta)),canonical(g.get().data));
const save={metadataRequests:g.metadataReads-before.metadata,catalogAndGuardBatchReads:g.batchReads-before.batchReads,atomicWriteBatches:g.batchWrites-before.batchWrites};
const poll=g.get({protocol:'11',revision:base.revision});assert.ok(poll.delta);assert.equal(canonical(applyCatalogDelta(base.data,poll.delta)),canonical(g.get().data));
const bytes=v=>Buffer.byteLength(JSON.stringify(v),'utf8');
const output={fixture:'synthetic, not live Google timing',categories:43,productRows:1294,allSheets:g.sheets.size,workingSheets:g.context.readNative_().workbook.length,
 save,saveRequestBytes:{v10:bytes(oldBody),v11:bytes(newBody)},saveResponseBytes:{v10:bytes({status:'ok',data:g.get().data,revision:r.revision,gasVersion:10}),v11:bytes(r)},readResponseBytes:{v10:bytes(g.get({revision:base.revision})),v11:bytes(poll)}};
for(const key of ['saveRequestBytes','saveResponseBytes','readResponseBytes'])output[key].reductionPercent=Number(((1-output[key].v11/output[key].v10)*100).toFixed(2));
assert.ok(output.saveRequestBytes.reductionPercent>90);assert.ok(output.readResponseBytes.reductionPercent>90);assert.equal(save.metadataRequests,1);assert.equal(save.atomicWriteBatches,1);
mkdirSync('test-results',{recursive:true});writeFileSync('test-results/performance.json',JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
