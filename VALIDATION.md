# Validation record — October 8, 2026

## Completed

- Node.js 24.21.0: seven focused test cases pass, covering ordinary URL identity, Google paths, distinct file IDs, excluded schemes, pending URLs, discarded tabs, normalized titles, representative selection, stale previews, exact/global and fuzzy target separation, partial failure reporting, and 500-tab sessions.
- Chrome 154.0.8037.97: popup HTML/JS tested in an isolated headless browser with synthetic Chrome tabs API fixtures. Rendering, four-second auto-refresh on/off, stale-preview rejection, exact-only global action, possible-title confirmation cancellation/acceptance, close-all confirmation, and hostile-title literal rendering pass. No page JavaScript errors.
- Source audit: no fetch, XMLHttpRequest, WebSocket, sendBeacon, unsafe innerHTML, storage calls, remote assets, background worker, or content scripts. Manifest requests only tabs and restricts extension connections with connect-src 'none'.
- Standard-library allowlisted ZIP packaging and checksum generation pass. Runtime includes the local privacy policy, Apache LICENSE, NOTICE, and bundled icons.
- Synthetic screenshots visually reviewed for readable text and exact/amber group separation. These are production UI screenshots with mocked tab metadata, not personal browsing data.

## Remaining release gates

- Actual unpacked-extension Chrome API and permissions validation is pending. This browser's command-line extension loading did not register the extension; fixture-based UI tests do not establish installed-extension integration.
- Verify actual action-popup size/scrolling and keyboard focus, multi-window tab removal, memory-saver tabs, restored pending tabs, popup closing/reopening, pinned/active indicators, and Chrome extension error panel in a dedicated test profile.
- Inspect network activity in the installed extension while offline and confirm only intentional external privacy/support navigation can open a network page.
- Confirm GitHub public visibility, live privacy URL, owner support channel, and the full packaged release before public store submission.
- Chrome Web Store publisher registration, fee/agreement/verification as applicable, submission, review, and publication remain owner/account-dependent.

Optional fixture UI check: install Playwright only in your development environment and run `node tests/browser-check.cjs` with CHROME_PATH set if necessary. It regenerates synthetic screenshots and does not require Playwright in the extension package.
