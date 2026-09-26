import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {makeGas,initialData} from './gas-harness.mjs';
import {createServer} from 'node:http';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const gas=makeGas({legacy:initialData()});
gas.context.installWorkbook();
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(readFileSync('dist/index.html'));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const endpoint='https://script.google.com/macros/s/TEST_EXECUTION/exec';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[],stats={writes:0,reads:0};
async function newDevice(mobile=false) {
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000}});
 await context.route('https://fonts.**',route=>route.abort());
 await context.route('https://script.google.com/**',async route=>{
  const req=route.request();let data;
  if(req.method()==='POST'){stats.writes++;data=gas.post(req.postDataJSON());}else{stats.reads++;data=gas.get(Object.fromEntries(new URL(req.url()).searchParams));}
  await route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/?script='+encodeURIComponent(endpoint));
 await page.waitForFunction(()=>localStorage.getItem('pamyatka_data_v7')?.includes('TEST_EXECUTION'));
 return {context,page};
}
async function login(page){await page.getByRole('button',{name:'Вход',exact:true}).click();await page.locator('input[type=password]').fill('test-password-12345');await page.getByRole('button',{name:'Войти',exact:true}).click();await page.getByText('Вы вошли в режим администратора',{exact:true}).waitFor();}
async function table(page){const tab=page.getByRole('button',{name:'Линолеум',exact:true}).first();const box=await tab.boundingBox();await tab.click({position:{x:20,y:box.height-5}});await page.locator('table').waitFor();}
async function until(fn,timeout=15000){const start=Date.now();while(!fn()){if(Date.now()-start>timeout)throw Error('Timed out waiting for server condition');await new Promise(r=>setTimeout(r,100));}}
try {
 const a=await newDevice(),b=await newDevice(true),viewer=await newDevice();
 await login(a.page);await login(b.page);await table(a.page);await table(b.page);await table(viewer.page);
 assert.equal(await viewer.page.locator('tbody input,tbody textarea').count(),0);
 const row=a.page.locator('tbody tr').first();
 await row.locator('textarea').fill('Тест независимых правок A');
 await b.page.locator('tbody tr').first().locator('input').first().fill('12345');
 await until(()=>JSON.stringify(gas.get().data).includes('Тест независимых правок A')&&JSON.stringify(gas.get().data).includes('12345'));
 await viewer.page.getByText('Тест независимых правок A',{exact:true}).waitFor({timeout:20000});
 assert.equal(await viewer.page.locator('tbody').getByText('12345',{exact:true}).count(),1);
 console.log('PASS: two editors + viewer, independent cells merge and live update without reload');
 // Direct cell editing propagates through the real workbook import functions to live browsers.
 const spec=gas.context.readState_().workbook.find(t=>t.key==='products:page_lino_ostin');
 const sh=gas.context.findSheet_(spec), nameColumn=spec.columns.findIndex(c=>c.key==='cell:name')+1;
 const nameRange=sh.getRange(4,nameColumn), oldValue=nameRange.getValue();
 nameRange.setValue('Товар изменён в Google Таблице');
 gas.context.workbookOnEdit({range:nameRange,oldValue,value:'Товар изменён в Google Таблице'});
 await viewer.page.getByText('Товар изменён в Google Таблице',{exact:true}).waitFor({timeout:20000});
 await a.page.waitForFunction(()=>document.querySelector('tbody textarea')?.value==='Товар изменён в Google Таблице');
 console.log('PASS: direct sheet edit reaches a live viewer and editor without reload');
 // New typing while the first save response is delayed.
 let release;let delayed=false;
 await a.context.unroute('https://script.google.com/**');
 await a.context.route('https://script.google.com/**',async route=>{
  const req=route.request();
  if(req.method()==='POST' && req.postDataJSON().action==='saveData' && !delayed){delayed=true;const result=gas.post(req.postDataJSON());await new Promise(r=>release=r);await route.fulfill({contentType:'application/json',body:JSON.stringify(result)});return;}
  const data=req.method()==='POST'?gas.post(req.postDataJSON()):gas.get(Object.fromEntries(new URL(req.url()).searchParams));await route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
 });
 await row.locator('textarea').fill('Первая отправка');await until(()=>delayed);await row.locator('textarea').fill('Ввод во время отправки');release();await until(()=>JSON.stringify(gas.get().data).includes('Ввод во время отправки'));
 console.log('PASS: typing during save preserved');
 // Let both editors load one baseline, then change one field differently.
 await b.page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await b.page.locator('tbody textarea').first().waitFor();
 await b.page.waitForFunction(()=>document.querySelector('tbody textarea')?.value==='Ввод во время отправки');
 await row.locator('textarea').fill('Конфликт A');await b.page.locator('tbody textarea').first().fill('Конфликт B');
 await until(()=>JSON.stringify(gas.get().data).includes('Конфликт A')||JSON.stringify(gas.get().data).includes('Конфликт B'));
 await new Promise(r=>setTimeout(r,3000));
 const hasDraft=await Promise.all([a.page,b.page].map(p=>p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('pamyatka_draft_v8_')).length)));
 assert.equal(hasDraft.filter(n=>n>0).length,1);
 console.log('PASS: same-cell conflict retains one durable draft');
 // Viewing activity never sends data writes.
 const before=gas.get().revision;await viewer.page.reload();await table(viewer.page);assert.equal(gas.get().revision,before);
 assert.deepEqual(errors,[]);
 console.log('PASS: viewer is read-only; no browser exceptions');
 const manager=await newDevice();await login(manager.page);
 await manager.page.getByTitle('Добавить новый раздел в верхнее меню').click();
 await manager.page.getByPlaceholder('Например: Sinteros Ostin, Harvest 8/33 4V, Дуб Ористано...').fill('Проверка ID');
 await manager.page.getByLabel('ID раздела',{exact:true}).fill('custom-ui-id');
 await manager.page.getByRole('button',{name:'Создать',exact:true}).click();
 await until(()=>gas.get().data.categories.some(c=>c.id==='custom-ui-id'));
 const tab=manager.page.getByRole('navigation',{name:'Категории каталога'}).getByRole('button',{name:'Проверка ID',exact:true});
 await tab.hover();await tab.locator('..').getByTitle('Редактировать раздел меню').click();
 await manager.page.getByLabel('ID раздела',{exact:true}).fill('renamed-ui-id');
 await manager.page.getByRole('button',{name:'Сохранить изменения',exact:true}).click();
 await until(()=>gas.get().data.categories.some(c=>c.id==='renamed-ui-id'));
 assert.ok(!gas.get().data.categories.some(c=>c.id==='custom-ui-id'));
 assert.equal(gas.get().data.categories.find(c=>c.id==='renamed-ui-id').storageId,'custom-ui-id');
 const tableBox=await b.page.locator('table').boundingBox();
 const decorBox=await b.page.locator('h4:visible').filter({hasText:'Декоры и подразделы коллекции'}).boundingBox();
 assert.ok(decorBox.y>tableBox.y+tableBox.height);
 assert.deepEqual(errors,[]);
 console.log('PASS: admin creates and renames custom IDs; mobile table precedes decors');
 mkdirSync('test-results',{recursive:true});writeFileSync('test-results/browser.json',JSON.stringify({passed:6,errors,stats},null,2));
} finally {await browser.close();server.close();}
