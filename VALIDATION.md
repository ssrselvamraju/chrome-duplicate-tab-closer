# Validation record — October 8, 2026

## Completed

- Node.js 24.21.0: seven focused test cases pass, covering ordinary URL identity, Google paths, distinct file IDs, excluded schemes, pending URLs, discarded tabs, normalized titles, representative selection, stale previews, exact/global and fuzzy target separation, partial failure reporting, and 500-tab sessions.
- Chrome 154.0.8037.97: popup HTML/JS tested in an isolated headless browser with synthetic Chrome tabs API fixtures. Rendering, four-second auto-refresh on/off, stale-preview rejection, exact-only global action, possible-title confirmation cancellation/acceptance, close-all confirmation, and hostile-title literal rendering pass. No page JavaScript errors.
- Source audit: no fetch, XMLHttpRequest, WebSocket, sendBeacon, unsafe innerHTML, storage calls, remote assets, background worker, or content scripts. Manifest requests only tabs and restricts extension connections with connect-src 'none'.
- Standard-library allowlisted ZIP packaging and checksum generation pass. Runtime includes the local privacy policy, Apache LICENSE, NOTICE, and bundled icons.
- Synthetic screenshots visually reviewed for readable text and exact/amber group separation. These are production UI screenshots with mocked tab metadata, not personal browsing data.

- Actual unpacked Chrome 154 extension loaded using Chrome's supported Extensions.loadUnpacked debugging API in a disposable regular profile. Real tabs query, exact/title grouping, keeper preservation, global/fuzzy removal, multiple windows, pinned tabs, offline refresh, popup reopening with auto-refresh reset, tabs-only manifest, and no extension-page HTTP requests pass. Incognito exclusion was verified.

## Remaining store release gates

- A headless Chrome crash occurred when exercising native tab discard. Sleeping-tab behavior passes synthetic/core tests; manually verify memory-saver tabs in a normal browser before store launch.
- Verify actual toolbar action-popup size/scrolling, keyboard focus, restored pending tabs, and the Chrome extension error panel in a normal dedicated profile. Multi-window removal, pinned indicators, and popup reopening already pass integration tests.
- Offline installed-extension refresh and absence of outbound popup requests pass; verify intentional privacy/support link navigation in the normal browser.
- Confirm live privacy URL, public source visibility, private vulnerability reporting, and the packaged release before public store submission.
- Chrome Web Store publisher registration, fee/agreement/verification as applicable, submission, review, and publication remain owner/account-dependent.

Optional fixture UI check: install Playwright only in your development environment and run `node tests/browser-check.cjs` with CHROME_PATH set if necessary. It regenerates synthetic screenshots and does not require Playwright in the extension package.
