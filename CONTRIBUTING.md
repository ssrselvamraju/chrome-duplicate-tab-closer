# Contributing

Contributions are submitted under Apache License 2.0. Preserve copyright, license, and applicable attribution notices. Use synthetic URLs and titles in fixtures, screenshots, and reports.

Keep the runtime dependency-free and popup-only. Do not add telemetry, remote assets, storage, host permissions, background scanning, automatic closing, or page-content access. Privacy-affecting changes need an explicit design review and accurate disclosure updates.

Run `node --test tests/*.test.js`, `node --check popup.js`, and `python3 scripts/package.py`. Verify changed user flows in an isolated unpacked-extension profile. Add tests for behavior changes, especially grouping and closure decisions. Describe the user-visible change, validation, and limitations in pull requests. Never commit real browsing URLs, access tokens, private screenshots, or credentials.
