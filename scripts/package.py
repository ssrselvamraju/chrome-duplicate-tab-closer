#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Reproducible allowlisted extension package. Run from any directory."""
from pathlib import Path
import hashlib, json, zipfile
root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'manifest.json').read_text())
assert manifest['permissions'] == ['tabs']
assert manifest['manifest_version'] == 3
assert not any(k in manifest for k in ('host_permissions','background','content_scripts','externally_connectable'))
files = ['manifest.json','popup.html','popup.js','LICENSE','NOTICE','docs/privacy.html']
files += [f'icons/icon{size}.png' for size in (16,32,48,128)]
out = root / 'dist'
out.mkdir(exist_ok=True)
archive = out / f'duplicate-tab-closer-{manifest["version"]}.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as bundle:
    for name in sorted(files):
        info = zipfile.ZipInfo(name, date_time=(2026,1,1,0,0,0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        bundle.writestr(info, (root / name).read_bytes())
checksum = hashlib.sha256(archive.read_bytes()).hexdigest()
(out / (archive.name + '.sha256')).write_text(f'{checksum}  {archive.name}\n')
print(f'{archive}\nSHA256: {checksum}')
