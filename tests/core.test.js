// SPDX-License-Identifier: Apache-2.0
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {keyFor, analyze, makeAction, validate, execute} = require('../popup.js');
const t = (id, url, title = 'Page', extra = {}) => ({id, url, title, windowId: id % 2 + 1, index: id, ...extra});
test('full URLs remain distinct outside known Google paths', () => {
  const tabs = [t(1,'https://example.com/a?x=1#b'),t(2,'https://example.com/a?x=2#b'),t(3,'https://example.com/a?x=1#c')];
  assert.equal(analyze(tabs).exact.length,0);
  assert.equal(keyFor(tabs[0]),tabs[0].url);
});
test('Google files merge views, support account prefixes, preserve distinct IDs', () => {
  for (const type of ['document','spreadsheets','presentation','forms']) {
    assert.equal(keyFor(t(1,`https://docs.google.com/${type}/u/2/d/abc-123/edit?tab=7#cell`)),`https://docs.google.com/${type}/d/abc-123`);
  }
  assert.equal(analyze([t(1,'https://docs.google.com/document/d/first/edit'), t(2,'https://docs.google.com/document/d/second/edit')]).exact.length,0);
  for (const url of ['https://docs.google.com/forms/d/e/published/viewform?x=1','https://docs.google.com.evil.test/document/d/x/edit','https://docs.google.com/document/not-a-document?x=1']) assert.equal(keyFor(t(1,url)),url);
});
test('excluded schemes, invalid URLs, empty URLs; pending and sleeping tabs', () => {
  for (const scheme of ['chrome','chrome-extension','devtools','about','data','edge']) assert.equal(keyFor(t(1,`${scheme}:test`)),null);
  assert.equal(keyFor(t(1,'not a URL')),null);
  assert.equal(keyFor(t(1,'')),null);
  const model=analyze([t(7,'', 'Sleeping',{pendingUrl:'https://example.com',discarded:true}),t(2,'https://example.com'),t(3,'chrome://settings')]);
  assert.deepEqual(model.exact[0].tabs.map(x=>x.id),[2,7]);
  assert.equal(model.exact[0].tabs[1].discarded,true);
  assert.deepEqual(model.stats,{total:3,duplicates:2,extras:1,possible:0});
});
test('title groups use one representative per key, ignore empty titles', () => {
  const model=analyze([t(1,'https://a.test',' Dashboard '),t(2,'https://a.test','Dashboard'),t(3,'https://b.test','DASHBOARD'),t(4,'https://c.test',' '),t(5,'https://d.test','')]);
  assert.deepEqual(model.possible[0].tabs.map(x=>x.id),[1,3]);
  assert.equal(model.stats.possible,2);
  assert.deepEqual(makeAction(model.exact).groups.flatMap(g=>g.targets),[2]);
  assert.deepEqual(makeAction(model.possible).groups.flatMap(g=>g.targets),[3]);
  assert.deepEqual(makeAction(model.exact,true).groups.flatMap(g=>g.targets),[1,2]);
});
test('stale membership, keeper, URL or fuzzy title aborts the action', () => {
  const tabs=[t(1,'https://a.test'),t(2,'https://a.test')];
  const action=makeAction(analyze(tabs).exact);
  assert.deepEqual(validate(action,tabs),[2]);
  for(const changed of [tabs.slice(1),[...tabs,t(3,'https://a.test')],[tabs[0],t(2,'https://b.test')],[t(0,'https://a.test'),...tabs]]) assert.equal(validate(action,changed),null);
  const fuzzy=[t(1,'https://a.test'),t(2,'https://b.test')];
  assert.equal(validate(makeAction(analyze(fuzzy).possible),[fuzzy[0],t(2,'https://b.test','Other')]),null);
  const google=[t(1,'https://docs.google.com/document/d/a/edit#one'),t(2,'https://docs.google.com/document/d/a/edit#two')];
  assert.equal(validate(makeAction(analyze(google).exact),[google[0],t(2,'https://docs.google.com/document/d/a/edit#three')]),null);
});
test('execute rechecks preview, excludes fuzzy globally, and reports partial failures', async () => {
  const tabs=[t(1,'https://a.test'),t(2,'https://a.test'),t(3,'https://a.test'),t(4,'https://b.test')];
  const removed=[];
  const result=await execute(makeAction(analyze(tabs).exact),{query:async()=>tabs,remove:async id=>{removed.push(id);if(id===3)throw Error('gone');}});
  assert.deepEqual(removed,[2,3]);assert.deepEqual(result,{stale:false,closed:1,failed:1});
  assert.deepEqual(await execute(makeAction(analyze(tabs).exact),{query:async()=>tabs.slice(1),remove:async()=>assert.fail('must not close')}),{stale:true,closed:0,failed:0});
});
test('large sessions and pinned/active flags preserve keeper rule', () => {
  const tabs=Array.from({length:500},(_,i)=>t(i+1,`https://example.test/${i%100}`,`Page ${i%100}`,{pinned:i===200,active:i===300}));
  const model=analyze(tabs);assert.equal(model.stats.extras,400);assert.equal(model.exact[0].tabs[0].id,1);
});
