#!/usr/bin/env bash
# Rebuilds feature-map-deploy/ from feature-map.html, then deploys it.
# The map is one self-contained file, so the bundle is a copy and nothing else.
# Re-run this after editing the F array; do not edit the deploy copy by hand.
set -euo pipefail
cd "$(dirname "$0")"
cp feature-map.html feature-map-deploy/index.html
echo "--- sanity checks ---"
grep -q 'const F = \[' feature-map-deploy/index.html || { echo "FAIL: data array missing"; exit 1; }
echo "features: $(grep -o "st:'[a-z]*'" feature-map-deploy/index.html | wc -l | tr -d " ")"
echo "bundle ready. deploy with:  cd feature-map-deploy && vercel deploy --prod --yes"
