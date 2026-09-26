import {chromium} from 'playwright';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createServer} from 'node:http';
const servers=[];
for(const [port,path] of [[4174,'../baseline-v8/dist/index.html'],[4173,'dist/index.html']]) { const s=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(readFileSync(path));});await new Promise(r=>s.listen(port,'127.0.0.1',r));servers.push(s); }
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
mkdirSync('test-results/visual',{recursive:true});const results=[];
try {
 for(const [label,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
  for(const theme of ['dark','light']){
   const pages=[];
   for(const port of [4174,4173]){
    const context=await browser.newContext({viewport});await context.route('https://fonts.**',r=>r.abort());
    await context.addInitScript(theme=>localStorage.setItem('pamyatka_theme_v7',theme),theme);
    const page=await context.newPage();await page.goto(`http://127.0.0.1:${port}`);await page.locator('main').waitFor();
    await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
    pages.push({page,context,port});
   }
   for(const screen of ['home','table']) {
    const images=[];
    for(const {page,port} of pages){
     if(screen==='table')await page.getByRole('button',{name:'Линолеум',exact:true}).first().click();
     await page.waitForTimeout(150);
     if(screen==='table' && port===4173) {
      const tableBox=await page.locator('table').boundingBox();
      const decor=await page.locator('h4:visible').filter({hasText:'Декоры и подразделы коллекции'}).boundingBox();
      if(label==='mobile')assert.ok(decor.y>tableBox.y+tableBox.height,'Mobile decors must be below the table');
      else assert.ok(decor.y<tableBox.y,'Desktop decors must remain above the table');
     }
     const path=`test-results/visual/${label}-${theme}-${screen}-${port===4174?'original':'updated'}.png`;
     images.push(await page.screenshot({path,fullPage:true}));
    }
    const equal=images[0].equals(images[1]);results.push({label,theme,screen,identical:equal});console.log(label,theme,screen,equal?'IDENTICAL':'DIFFERENT');
   }
   for(const {context}of pages)await context.close();
  }
 }
 writeFileSync('test-results/visual.json',JSON.stringify(results,null,2));assert.ok(results.filter(r=>r.label==='desktop'||r.screen==='home').every(r=>r.identical),'Unrequested visual difference detected');
}finally{await browser.close();for(const s of servers)s.close();}
