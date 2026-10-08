# Release procedure

1. Run tests and packaging. Complete the manual checklist in VALIDATION.md, including actual unpacked Chrome operation. Review the complete Git history and package for private data and unexpected permissions/network behavior.
2. Keep the dedicated repository private until checks pass. Then change it to public, enable private vulnerability reporting, and verify public source access while signed out.
3. Configure GitHub Pages: Settings → Pages → Deploy from a branch → main → /docs. The privacy URL will be `https://ssrselvamraju.github.io/duplicate-tab-closer/privacy.html`; verify it is live before using it in the store. No analytics should be enabled on that page.
4. Commit final source, tag `v1.0.0` only when release-ready, and publish a GitHub release with the exact `dist/duplicate-tab-closer-1.0.0.zip` and `.sha256` file. Use a release-candidate tag while manual verification remains incomplete.
5. Use the owner's Chrome Web Store developer account. The owner handles registration fee payment, agreements, and any account verification. Do not disclose private account details in the repository.
6. Upload the ZIP. Use store/LISTING.md, icons/icon128.png, store/promo-440x280.png, and the 640×400 screenshots. The full-height popup-preview.png is documentation artwork, not a store-sized screenshot. Confirm current dashboard asset requirements.
7. Fill privacy fields accurately using store/LISTING.md. Local URL/title processing is data handling and must be disclosed. Supply the verified public privacy URL and GitHub support URL; there is no login or remote code.
8. Submit with deferred publishing, address reviewer feedback, and publish publicly after acceptance. Add the verified store link to README and releases. Google controls review timing and acceptance.
9. For updates, increment manifest version, update CHANGELOG/privacy policy as needed, rerun affected verification, tag matching source, and submit the same ZIP attached to the source release.

Official references: [package and upload](https://developer.chrome.com/docs/webstore/publish/), [artwork sizes](https://developer.chrome.com/docs/webstore/images), [local data handling](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).
