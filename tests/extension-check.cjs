// SPDX-License-Identifier: Apache-2.0
// Development-only actual-extension integration check in a disposable Chrome profile.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');const path=require('node:path');
(async()=>{
const root=path.resolve(__dirname,'..');
const context=await chromium.launchPersistentContext(require('node:fs').mkdtempSync('/tmp/dtc-real-'),{executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome',headless:true,ignoreDefaultArgs:['--disable-extensions'],args:['--no-sandbox','--enable-unsafe-extension-debugging']});
const browser=context.browser();const cdp=await browser.newBrowserCDPSession();
const {id}=await cdp.send('Extensions.loadUnpacked',{path:root});console.log('Loaded extension:',id);

await context.route('https://*.example.test/**',route=>route.fulfill({contentType:'text/html',body:'<title>Research</title><h1>Synthetic research page</h1>'}));
const a=await context.newPage();await a.goto('https://a.example.test/research');
const b=await context.newPage();await b.goto('https://a.example.test/research');
const c=await context.newPage();await c.goto('https://b.example.test/research');
const popup=await context.newPage();await popup.goto(`chrome-extension://${id}/popup.html`);
await popup.waitForFunction(()=>document.getElementById('extras').textContent==='1');
assert.equal(await popup.locator('.exact').count(),1);assert.equal(await popup.locator('.possible').count(),1);
await popup.locator('#auto-refresh').uncheck();
const outgoing=[];popup.on('request',r=>{if(/^https?:/.test(r.url()))outgoing.push(r.url())});
await popup.locator('#global-close').click();await popup.waitForFunction(()=>document.getElementById('status').textContent.includes('Closed 1'));
assert.equal(b.isClosed(),true);assert.equal(a.isClosed(),false);assert.equal(c.isClosed(),false);
await popup.waitForFunction(()=>document.querySelectorAll('.possible button:not(:disabled)').length===1);
popup.once('dialog',dialog=>dialog.accept());await popup.locator('.possible button').click();await popup.waitForFunction(()=>document.getElementById('possible').textContent==='0');
assert.equal(c.isClosed(),true);assert.equal(a.isClosed(),false);assert.deepEqual(outgoing,[]);
assert.equal(await popup.evaluate(()=>chrome.runtime.getManifest().permissions.join(',')),'tabs');
// Multi-window, pinned, discarded tabs with the actual Chrome API.
const info=await popup.evaluate(async()=>{
  const win=await chrome.windows.create({url:'https://a.example.test/second',focused:false});
  const first=win.tabs[0];await chrome.tabs.update(first.id,{pinned:true});
  const second=await chrome.tabs.create({url:'https://a.example.test/second',active:false});
  
  return {first:first.id,second:second.id};
});
await popup.locator('#refresh').click();await popup.waitForFunction(()=>document.getElementById('extras').textContent==='1');
assert.match(await popup.locator('.exact').innerText(),/Pinned/);

await popup.locator('#global-close').click();await popup.waitForFunction(()=>document.getElementById('extras').textContent==='0');
const live=await popup.evaluate(()=>chrome.tabs.query({}));
assert.ok(live.some(t=>t.id===info.first));assert.ok(!live.some(t=>t.id===info.second));
await context.setOffline(true);await popup.locator('#refresh').click();await popup.waitForFunction(()=>!document.getElementById('refresh').disabled);
assert.deepEqual(outgoing,[]);
await popup.close();const reopened=await context.newPage();await reopened.goto(`chrome-extension://${id}/popup.html`);
await reopened.waitForFunction(()=>document.getElementById('total').textContent!=='—');
assert.equal(await reopened.locator('#auto-refresh').isChecked(),true);
await reopened.locator('a').click();
console.log('Actual unpacked Chrome extension: tabs query, exact and title groups, real global/fuzzy tab removal, keeper, multi-window/pinned tabs, offline refresh, popup reopening, no outbound requests, tabs-only manifest: PASS');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
