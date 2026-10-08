Duplicate Tab Closer release candidate: local-only Chrome Manifest V3 extension with Apache 2.0 source and only the tabs permission.

Download the extension ZIP, extract it, and use Chrome's Developer mode → Load unpacked to select the folder containing manifest.json. This candidate is not yet on the Chrome Web Store.

Seven focused tests and actual unpacked Chrome integration checks pass, including exact/global and possible-title closures, multiple windows, pinned tabs, offline refresh, and popup reopening. Normal-browser toolbar popup, memory-saver, and restored-tab verification remain before store submission; see VALIDATION.md. Closing tabs can lose unsaved work.

The attached ZIP and SHA-256 checksum are generated from this source tag. No accounts, analytics, or browsing data sent to the developer.
