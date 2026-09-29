import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {makeGas,initialData} from './gas-harness.mjs';
import {canonical,createCatalogDelta} from '../shared/catalog.js';
test('upgrade an existing v10 workbook in place without setup or any cell writes',()=>{
 const g=makeGas({legacy:initialData(),backendPath:'rollback/google-apps-script-v10.js'}),before=g.get();
 const snapshot=JSON.stringify([...g.sheets].map(([name,s])=>[name,s.getSheetId(),[...s.cells]]));
 const writes=g.writes,triggerCount=g.triggers.length;vm.runInContext(readFileSync('public/google-apps-script.js','utf8'),g.context);
 g.context.checkV11();const after=g.get();assert.equal(g.writes,writes);assert.equal(g.triggers.length,triggerCount);assert.equal(after.revision,before.revision);assert.equal(canonical(after.data),canonical(before.data));assert.equal(JSON.stringify([...g.sheets].map(([name,s])=>[name,s.getSheetId(),[...s.cells]])),snapshot);
});
test('v10 server can read and edit a workbook last saved by engine v11',()=>{
 const g=makeGas({legacy:initialData()}),base=g.get(),next=structuredClone(base.data);next.appName='Сохранено в v11';const token=g.post({action:'login',password:'test-password-12345'}).token;
 assert.equal(g.post({action:'saveData',protocol:11,delta:createCatalogDelta(base.data,next),baseRevision:base.revision,requestId:crypto.randomUUID(),token}).status,'ok');
 vm.runInContext(readFileSync('rollback/google-apps-script-v10.js','utf8'),g.context);g.cache.clear();const old=g.get();assert.equal(old.status,'ok');assert.equal(old.data.appName,'Сохранено в v11');old.data.appName='Редактирование после отката';assert.equal(g.post({action:'saveData',data:old.data,baseRevision:old.revision,requestId:crypto.randomUUID(),token}).status,'ok');assert.equal(g.get().data.appName,'Редактирование после отката');
});
