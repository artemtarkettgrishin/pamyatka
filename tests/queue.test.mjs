import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {buildSync} from 'esbuild';
import {makeGas,initialData} from './gas-harness.mjs';
const code=buildSync({entryPoints:['src/utils/writeQueue.ts'],bundle:true,write:false,format:'iife',globalName:'Queue'}).outputFiles[0].text;
const url='https://script.google.com/macros/s/TEST_EXECUTION/exec';
function storage(map=new Map()) {return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),map};}
function device(gas,{local=storage(),session=storage(),authenticated=true,transport}={}) {
 if(authenticated)session.setItem('pamyatka_session_v8',JSON.stringify({...gas.post({action:'login',password:'test-password-12345'}),url}));
 const nav={onLine:true};let published=null,timerId=0;
 const context=vm.createContext({console,URL,URLSearchParams,AbortController,crypto,Date,Promise,Set,Map,JSON,Math,Number,String,Array,Object,structuredClone,
  localStorage:local,sessionStorage:session,navigator:nav,confirm:()=>false,
  window:{addEventListener(){},removeEventListener(){}},
  setTimeout:()=>++timerId,clearTimeout(){},
  fetch:async(target,opts)=>{
   const invoke=()=> opts.method==='POST' ? gas.post(JSON.parse(opts.body)) : gas.get(Object.fromEntries(new URL(target).searchParams));
   const result=transport ? await transport(invoke,opts):invoke();
   return {ok:true,json:async()=>result};
  }
 });
 vm.runInContext(code,context);const q=context.Queue;
 q.subscribeData(d=>{published=d;});
 return {q,nav,local,session,get data(){return published;},load(){const r=gas.get();q.acceptRemote(r.data,r.revision,url,q.getEditEpoch());}};
}
function page(data){return data.categories.find(c=>c.rows?.length && c.columns?.length);}
const change=(d,key,val)=>{const x=structuredClone(d);page(x).rows[0].cells[key]=val;return x;};
test('two independent devices preserve changes to different cells',async()=>{
 const gas=makeGas({legacy:initialData()}),a=device(gas),b=device(gas);a.load();b.load();
 a.q.noteDraft(change(a.data,'left','A'));b.q.noteDraft(change(b.data,'right','B'));
 await a.q.flushNow();await b.q.flushNow();await b.q.flushNow();
 assert.equal(page(gas.get().data).rows[0].cells.left,'A');assert.equal(page(gas.get().data).rows[0].cells.right,'B');assert.equal(b.q.getQueueSnapshot().dirty,false);
});
test('same-cell conflict remains a durable draft and is not auto-overwritten',async()=>{
 const gas=makeGas({legacy:initialData()}),a=device(gas),b=device(gas);a.load();b.load();a.q.noteDraft(change(a.data,'same','A'));b.q.noteDraft(change(b.data,'same','B'));
 await a.q.flushNow();await b.q.flushNow();assert.equal(b.q.getQueueSnapshot().status,'error');assert.equal(b.q.getQueueSnapshot().dirty,true);assert.equal(page(gas.get().data).rows[0].cells.same,'A');assert.ok([...b.local.map.keys()].some(k=>k.startsWith('pamyatka_draft_v8_')));
});
test('edits during an in-flight request remain dirty and get a second write',async()=>{
 const gas=makeGas({legacy:initialData()});let release;
 const d=device(gas,{transport:invoke=>new Promise(resolve=>{release=()=>resolve(invoke());})});d.load();d.q.noteDraft(change(d.data,'x','first'));
 const first=d.q.flushNow();d.q.noteDraft(change(d.data,'x','second'));release();await first;
 assert.equal(page(gas.get().data).rows[0].cells.x,'first');assert.equal(d.q.getQueueSnapshot().dirty,true);
 const second=d.q.flushNow();release();await second;assert.equal(page(gas.get().data).rows[0].cells.x,'second');assert.equal(d.q.getQueueSnapshot().dirty,false);
});
test('server commit followed by network loss safely replays after reload',async()=>{
 const gas=makeGas({legacy:initialData()});let fail=true;
 const d=device(gas,{transport:invoke=>{const r=invoke();if(fail){fail=false;throw Error('network response lost');}return r;}});d.load();d.q.noteDraft(change(d.data,'x','once'));await d.q.flushNow();const revision=gas.get().revision;
 assert.equal(d.q.getQueueSnapshot().dirty,true);
 const reload=device(gas,{local:d.local,session:d.session});reload.q.resumeDraft(url);await reload.q.flushNow();assert.equal(gas.get().revision,revision);assert.equal(reload.q.getQueueSnapshot().dirty,false);
});
test('pending draft survives offline reload and viewers cannot write it',async()=>{
 const gas=makeGas({legacy:initialData()}),d=device(gas);d.load();d.nav.onLine=false;d.q.noteDraft(change(d.data,'x','offline'));await d.q.flushNow();assert.equal(d.q.getQueueSnapshot().dirty,true);
 const viewer=device(gas,{local:d.local,authenticated:false});viewer.load();assert.equal(viewer.q.noteDraft(change(viewer.data,'x','bad')),false);assert.equal(page(gas.get().data).rows[0].cells.x,undefined);
 const reload=device(gas,{local:d.local,session:d.session});reload.q.resumeDraft(url);await reload.q.flushNow();assert.equal(page(gas.get().data).rows[0].cells.x,'offline');
});
test('late read cannot replace newer local typing or newer revisions',async()=>{
 const gas=makeGas({legacy:initialData()}),d=device(gas);d.load();const epoch=d.q.getEditEpoch(),old=gas.get();d.q.noteDraft(change(d.data,'x','fresh'));await d.q.flushNow();
 assert.equal(d.q.acceptRemote(old.data,old.revision,url,epoch),false);assert.equal(d.q.acceptRemote(old.data,old.revision,url,d.q.getEditEpoch()),false);assert.equal(page(d.data).rows[0].cells.x,'fresh');
});
test('reconnect and manual flush cannot create parallel writes',async()=>{
 const gas=makeGas({legacy:initialData()});let release,count=0;
 const d=device(gas,{transport:invoke=>{count++;return new Promise(resolve=>release=()=>resolve(invoke()));}});d.load();d.q.noteDraft(change(d.data,'x','one'));
 const a=d.q.flushNow(),b=d.q.flushNow();assert.equal(count,1);release();await Promise.all([a,b]);assert.equal(count,1);
});
test('expired sessions stop writes without deleting draft',async()=>{
 const gas=makeGas({legacy:initialData()}),d=device(gas);d.load();d.q.noteDraft(change(d.data,'x','private'));d.session.removeItem('pamyatka_session_v8');await d.q.flushNow();assert.equal(d.q.getQueueSnapshot().dirty,true);assert.equal(d.q.getQueueSnapshot().status,'readonly');assert.equal(page(gas.get().data).rows[0].cells.x,undefined);
});
test('dirty drafts cannot be moved to a different table',()=>{const gas=makeGas({legacy:initialData()}),d=device(gas);d.load();d.q.noteDraft(change(d.data,'x','private'));assert.throws(()=>d.q.switchEndpoint('other'));});
test('four editors converge without losing any independent edit',async()=>{
 const gas=makeGas({legacy:initialData()}),devices=Array.from({length:4},()=>device(gas));
 for(const [i,d]of devices.entries()){d.load();d.q.noteDraft(change(d.data,'editor'+i,'value'+i));}
 for(const d of devices){for(let i=0;i<6&&d.q.getQueueSnapshot().dirty;i++)await d.q.flushNow();assert.equal(d.q.getQueueSnapshot().dirty,false);}
 for(let i=0;i<4;i++)assert.equal(page(gas.get().data).rows[0].cells['editor'+i],'value'+i);
});
