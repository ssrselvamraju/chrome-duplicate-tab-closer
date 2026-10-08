// Copyright 2026 Duplicate Tab Closer contributors
// SPDX-License-Identifier: Apache-2.0
(function (root) {
  'use strict';
  const excluded = new Set(['chrome:', 'chrome-extension:', 'devtools:', 'about:', 'data:', 'edge:']);
  function keyFor(tab) {
    const raw = tab.url || tab.pendingUrl;
    if (!raw) return null;
    let url;
    try { url = new URL(raw); } catch { return null; }
    if (excluded.has(url.protocol)) return null;
    if (url.hostname === 'docs.google.com' && ['http:', 'https:'].includes(url.protocol)) {
      const match = url.pathname.match(/^\/(document|spreadsheets|presentation|forms)\/(?:u\/\d+\/)?d\/([\w-]+)(?:\/|$)/);
      if (match && !(match[1] === 'forms' && match[2] === 'e')) {
        return `https://docs.google.com/${match[1]}/d/${match[2]}`;
      }
    }
    return raw;
  }
  function titleFor(tab) { return (tab.title || '').trim().toLowerCase(); }
  function analyze(tabs) {
    const byKey = new Map();
    for (const tab of tabs) {
      const key = keyFor(tab);
      if (!key || !Number.isInteger(tab.id) || tab.id < 0) continue;
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key).push(tab);
    }
    const exact = [], byTitle = new Map();
    for (const [key, members] of byKey) {
      members.sort((a, b) => a.id - b.id);
      if (members.length > 1) exact.push({kind: 'exact', key, tabs: members});
      const title = titleFor(members[0]);
      if (title) {
        if (!byTitle.has(title)) byTitle.set(title, []);
        byTitle.get(title).push(members[0]);
      }
    }
    const possible = [];
    for (const [key, members] of byTitle) {
      if (members.length > 1) possible.push({kind: 'possible', key, tabs: members.sort((a, b) => a.id - b.id)});
    }
    return {exact, possible, stats: {
      total: tabs.length,
      duplicates: exact.reduce((n, g) => n + g.tabs.length, 0),
      extras: exact.reduce((n, g) => n + g.tabs.length - 1, 0),
      possible: possible.reduce((n, g) => n + g.tabs.length, 0)
    }};
  }
  function makeAction(groups, all = false) {
    return {all, groups: groups.map(g => ({kind: g.kind, key: g.key,
      members: g.tabs.map(t => ({id: t.id, url: t.url || t.pendingUrl, key: keyFor(t), title: titleFor(t)})),
      targets: (all ? g.tabs : g.tabs.slice(1)).map(t => t.id)}))};
  }
  // Abort the entire action on changed membership or URLs. Never expand a clicked preview.
  function validate(action, tabs) {
    const model = analyze(tabs);
    for (const expected of action.groups) {
      const current = model[expected.kind === 'exact' ? 'exact' : 'possible'].find(g => g.key === expected.key);
      if (!current || current.tabs.length !== expected.members.length) return null;
      for (let i = 0; i < current.tabs.length; i++) {
        const tab = current.tabs[i], old = expected.members[i];
        if (tab.id !== old.id || (tab.url || tab.pendingUrl) !== old.url || keyFor(tab) !== old.key ||
          (expected.kind === 'possible' && titleFor(tab) !== old.title)) return null;
      }
    }
    return action.groups.flatMap(g => g.targets);
  }
  async function execute(action, api) {
    const ids = validate(action, await api.query({}));
    if (ids === null) return {stale: true, closed: 0, failed: 0};
    let closed = 0, failed = 0;
    // Each result is tracked so a partial failure is never reported as complete success.
    for (const id of ids) {
      try { await api.remove(id); closed++; } catch { failed++; }
    }
    return {stale: false, closed, failed};
  }
  const core = {keyFor, titleFor, analyze, makeAction, validate, execute};
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  if (!root.document) return;
  const doc = root.document, $ = id => doc.getElementById(id);
  let model = null, busy = false, lastUpdate = 0;
  function el(tag, text, className) {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function setBusy(value) {
    busy = value;
    doc.querySelectorAll('button').forEach(button => { button.disabled = value; });
    $('global-close').disabled = value || !model || !model.stats.extras;
    $('groups').setAttribute('aria-busy', String(value));
  }
  function button(label, action, className) {
    const node = el('button', label, className);
    node.type = 'button';
    node.addEventListener('click', () => close(action));
    return node;
  }
  function groupView(group) {
    const card = el('article', undefined, `group ${group.kind}`);
    card.append(el('h3', group.kind === 'exact' ? group.tabs[0].title || 'Untitled tab' : group.key));
    if (group.kind === 'exact') card.append(el('p', group.key, 'url'));
    const list = el('ul');
    group.tabs.forEach((tab, index) => {
      const item = el('li');
      const heading = el('div', undefined, 'tab-heading');
      heading.append(el('span', index === 0 ? 'KEEP' : 'CLOSE', index === 0 ? 'badge keep' : 'badge'));
      heading.append(el('span', tab.title || 'Untitled tab', 'tab-title'));
      item.append(heading);
      item.append(el('p', `Window ${tab.windowId} · Tab ${tab.index + 1}${tab.pinned ? ' · Pinned' : ''}${tab.active ? ' · Active' : ''}${tab.discarded ? ' · 💤 Sleeping (discarded)' : ''}`, 'meta'));
      if (group.kind === 'possible') item.append(el('p', tab.url || tab.pendingUrl, 'url'));
      list.append(item);
    });
    card.append(list);
    const actions = el('div', undefined, 'actions');
    actions.append(button(`Close ${group.tabs.length - 1} extras`, makeAction([group]), 'primary'));
    if (group.kind === 'exact') actions.append(button(`Close all (${group.tabs.length})`, makeAction([group], true), 'danger'));
    card.append(actions);
    return card;
  }
  function render() {
    const stats = model.stats;
    for (const name of ['total', 'duplicates', 'extras', 'possible']) $(name).textContent = stats[name];
    const groups = $('groups');
    groups.replaceChildren();
    groups.append(el('h2', 'Exact URL / Google file matches'));
    if (!model.exact.length) groups.append(el('p', 'No exact duplicates found.', 'empty'));
    model.exact.forEach(group => groups.append(groupView(group)));
    groups.append(el('h2', 'Possible duplicates — same title, different URL', 'amber'));
    groups.append(el('p', 'A shared title does not guarantee the same page. Review each URL. Each action closes only the listed representative extras.', 'notice amber'));
    if (!model.possible.length) groups.append(el('p', 'No possible duplicates found.', 'empty'));
    model.possible.forEach(group => groups.append(groupView(group)));
    setBusy(false);
  }
  async function refresh(preserveStatus = false) {
    if (busy) return;
    setBusy(true);
    try {
      model = analyze(await root.chrome.tabs.query({}));
      lastUpdate = Date.now();
      $('updated').textContent = 'Updated 0s ago';
      render();
      if (!preserveStatus) $('status').textContent = 'Preview refreshed. No tabs were closed.';
    } catch {
      $('status').textContent = 'Could not read tabs. Try Refresh again.';
    } finally { setBusy(false); }
  }
  async function close(action) {
    if (busy || !action.groups.length) return;
    const count = action.groups.reduce((n, g) => n + g.targets.length, 0);
    const possible = action.groups.some(g => g.kind === 'possible');
    // Lock before displaying confirmation; refresh must not invalidate the visible decision.
    setBusy(true);
    if ((action.all || possible) && !root.confirm(possible
      ? `Close ${count} possible duplicate tab(s)? Their URLs differ and they may be different pages. Unsaved work can be lost.`
      : `Close all ${count} tabs in this group, including the KEEP tab? Unsaved work can be lost.`)) {
      setBusy(false); return;
    }
    try {
      const result = await execute(action, root.chrome.tabs);
      $('status').textContent = result.stale ? 'Tabs changed. Review the refreshed preview and click again.'
        : `Closed ${result.closed} tab(s).${result.failed ? ` ${result.failed} tab(s) could not be closed.` : ''}`;
    } catch { $('status').textContent = 'Could not verify tabs. Nothing further was closed; refresh and try again.'; }
    finally { setBusy(false); await refresh(true); }
  }
  $('refresh').addEventListener('click', () => refresh());
  $('global-close').addEventListener('click', () => { if (model) close(makeAction(model.exact)); });
  const refreshTimer = root.setInterval(() => { if ($('auto-refresh').checked) refresh(true); }, 4000);
  const ageTimer = root.setInterval(() => {
    $('updated').textContent = lastUpdate ? `Updated ${Math.floor((Date.now() - lastUpdate) / 1000)}s ago` : 'Not updated yet';
  }, 1000);
  root.addEventListener('pagehide', () => { root.clearInterval(refreshTimer); root.clearInterval(ageTimer); });
  refresh();
})(typeof window !== 'undefined' ? window : globalThis);
