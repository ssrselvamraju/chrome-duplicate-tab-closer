// SPDX-License-Identifier: Apache-2.0
// Optional development check: requires Playwright and Chrome, not used by the extension.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:640,height:800}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 const t=(id,url,title,extra={})=>({id,url,title,windowId:1+(id%2),index:id-1,...extra});
 window.testTabs=[t(1,'https://docs.google.com/spreadsheets/d/demo-budget/edit#gid=0','Team budget',{pinned:true}),t(2,'https://docs.google.com/spreadsheets/d/demo-budget/edit#gid=42','Team budget',{discarded:true}),t(3,'https://example.test/research','Research notes'),t(4,'https://example.test/research','Research notes'),t(5,'https://alpha.example.test/dashboard','Dashboard'),t(6,'https://beta.example.test/dashboard','Dashboard')];
 window.removed=[];window.queries=0;
 window.chrome={tabs:{query:async()=>{window.queries++;await new Promise(r=>setTimeout(r,50));return window.testTabs.map(t=>({...t}));},remove:async id=>{await new Promise(r=>setTimeout(r,100));window.removed.push(id);window.testTabs=window.testTabs.filter(t=>t.id!==id);}}};
});
await page.goto('file://'+root+'/popup.html');
await page.waitForFunction(()=>document.getElementById('extras').textContent==='2');
await page.screenshot({path:root+'/store/popup-preview.png',fullPage:true});
// Store-size screenshot captures actual UI without invented browser chrome.
await page.setViewportSize({width:640,height:400});await page.locator('.exact').first().scrollIntoViewIfNeeded();await page.waitForTimeout(300);await page.screenshot({path:root+'/store/screenshot-exact-640x400.png'});
await page.locator('h2.amber').scrollIntoViewIfNeeded();await page.waitForTimeout(300);await page.screenshot({path:root+'/store/screenshot-possible-640x400.png'});
await page.setViewportSize({width:640,height:800});
assert.equal(await page.locator('.exact').count(),2);assert.equal(await page.locator('.possible').count(),1);
assert.match(await page.locator('body').innerText(),/Sleeping/);
await page.locator('#auto-refresh').uncheck();
const queries=await page.evaluate(()=>window.queries);await page.waitForTimeout(4300);assert.equal(await page.evaluate(()=>window.queries),queries);
await page.locator('#auto-refresh').check();await page.waitForTimeout(4200);assert.ok(await page.evaluate(()=>window.queries)>queries);
await page.locator('#auto-refresh').uncheck();
// Navigation between preview and click must abort.
await page.evaluate(()=>window.testTabs[1].url='https://example.test/changed');
await page.locator('#global-close').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Tabs changed'));
assert.deepEqual(await page.evaluate(()=>window.removed),[]);
await page.locator('#global-close').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Closed 1'));
assert.deepEqual(await page.evaluate(()=>window.removed),[4]);
page.once('dialog',dialog=>dialog.dismiss());await page.locator('.possible').filter({hasText:'dashboard'}).locator('button').click();assert.deepEqual(await page.evaluate(()=>window.removed),[4]);
page.once('dialog',dialog=>dialog.accept());await page.locator('.possible').filter({hasText:'dashboard'}).locator('button').click();await page.waitForFunction(()=>window.removed.includes(6));
assert.deepEqual(await page.evaluate(()=>window.removed),[4,6]);
// hostile titles are literal text.
await page.evaluate(()=>window.testTabs.push({id:7,url:'https://example.test/research',title:'<img src=x onerror=alert(1)>',windowId:1,index:1}));
await page.locator('#refresh').click();await page.waitForFunction(()=>document.querySelector('.exact'));
assert.equal(await page.locator('img').count(),0);
page.once('dialog',dialog=>dialog.accept());await page.locator('.exact .danger').click();await page.waitForFunction(()=>window.removed.includes(7));assert.ok((await page.evaluate(()=>window.removed)).includes(3));
assert.deepEqual(errors,[]);
console.log('Chrome '+browser.version()+': UI render, auto-refresh on/off, stale action, global exclusion, fuzzy confirmation, close-all confirmation, literal hostile title: PASS');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
