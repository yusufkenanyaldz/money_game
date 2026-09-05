#!/usr/bin/env bash
# MİDAS — itch.io paketi üretir.
# itch.io zip'in KÖKÜNDE index.html arar; klasör sarmalayıcı OLMAMALI.
set -euo pipefail
cd "$(dirname "$0")"
OUT="onemoretap-itch.zip"
rm -f "$OUT"
zip -j -9 "$OUT" index.html
echo
echo "✓ $OUT hazır ($(du -h "$OUT" | cut -f1))"
unzip -l "$OUT"
