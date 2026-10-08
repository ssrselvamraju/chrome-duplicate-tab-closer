# Chrome Web Store listing draft

Name: Duplicate Tab Closer
Category recommendation: Tools
Language: English
Price: Free
Short description: Find and close duplicate tabs across your Chrome windows. Local processing, no accounts or data sent to us.

## Description

Struggling to keep up with your 400+ open Chrome tabs? Worried that many are duplicates, using up your laptop's RAM or slowing things down?

Close duplicate tabs across your Chrome windows. Runs entirely in your browser. No accounts, analytics, ads, or data sent to us. Free and open source.

Review duplicate URLs and keep one copy, or close all tabs in a specific group. Google Docs, Sheets, Slides, and Forms files match across views. Sleeping tabs are included. Same-title tabs with different URLs appear separately in amber and always need their own explicit action. Global closure affects exact matches only.

Refresh manually or every four seconds while the popup is open. No background scanning or automatic closing. Closing unnecessary tabs can free resources; actual memory and speed improvements vary.

Privacy: open-tab URLs, titles, and tab status are processed only in popup memory, never sent to us or persistently stored. The tabs permission is needed to compare URLs and titles across windows. No page contents, browsing history, cookies, passwords, or form data are read. Incognito is disabled.

Closing tabs can lose unsaved work. Google file matching merges different views of a file; matching titles alone do not prove the same page. Pinned and active tabs are included. Review the preview before closing.

Apache 2.0 open source. Source/support: https://github.com/ssrselvamraju/chrome-duplicate-tab-closer
Privacy policy: use the verified live GitHub Pages policy URL before submission.

## Privacy Practices and reviewer notes

Single purpose: help users find and close duplicate open tabs across accessible windows in their Chrome profile.

Permission justification: tabs provides URL, pending URL, and title access needed for exact and possible-title matching. Other tab metadata supports the preview and chosen close actions. No host permissions or remote code.

Data handling: URLs/titles (web browsing information) and tab metadata are processed locally, transiently, solely for this feature. No transmission, sale, advertising, telemetry, or persistent storage. Answer the dashboard's current categories based on these facts; do not describe local processing as no data access.

Reviewer steps: install; open two copies of an ordinary test URL in separate windows; open two views of a synthetic Google file; open two different URLs with the same title; click the extension. Check exact groups, sleeping indicator when applicable, and amber possible groups. Close all extras keeps lowest-ID exact representatives and leaves possible-title representatives untouched. Possible close and close-all-in-group require confirmation. Refresh only changes the preview. No account, credentials, or backend are required.

Assets: icon128.png, promo-440x280.png, screenshot-exact-640x400.png, screenshot-possible-640x400.png. Screenshots show the production UI with synthetic API fixtures; replace with actual unpacked-extension screenshots if dashboard/reviewer requires them.
