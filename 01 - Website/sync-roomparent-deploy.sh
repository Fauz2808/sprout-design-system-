#!/usr/bin/env bash
# Rebuilds roomparent-landing-deploy/ from the source files, then deploys.
#
# The deploy bundle is deliberately NOT a straight copy of the source:
#   - roomparent-com-landing-v2.html   -> index.html          (clean root URL)
#   - roomparent-com-request-access.html -> request-access.html (clean shareable URL)
#   - the hero's portal preview iframe is repointed from the relative
#     ./room-parent-portal-redesign/ path to the already-deployed portal, so the
#     whole portal doesn't have to be bundled a second time.
# Everything below is idempotent — safe to re-run after any source edit.
set -euo pipefail

cd "$(dirname "$0")"
SRC_LANDING="roomparent-com-landing-v2.html"
SRC_REQUEST="roomparent-com-request-access.html"
OUT="roomparent-landing-deploy"
PORTAL="https://room-parent-portal.vercel.app"

cp "$SRC_LANDING" "$OUT/index.html"
cp "$SRC_REQUEST" "$OUT/request-access.html"
cp roomparent-privacy-policy.html "$OUT/privacy.html"
cp roomparent-terms-of-service.html "$OUT/terms.html"
cp og-room-parent.png "$OUT/"
# Sprout's own legal pages must never ship here — Room Parent has its own.
rm -f "$OUT/privacy-policy.html" "$OUT/terms-and-conditions.html"
rm -rf "$OUT/roomparent-assets"
cp -R roomparent-assets "$OUT/"
# internal scratch pages (icon explorations etc.) are not part of the public site
find "$OUT/roomparent-assets" -name '*.html' -delete

# index.html: live portal iframe + clean links
sed -i '' \
  -e "s#\./room-parent-portal-redesign/index\.html?embed=1\&amp;context=taylor\&amp;view=dashboard#${PORTAL}/?embed=1\&amp;context=taylor\&amp;view=dashboard#g" \
  -e "s#\`\./room-parent-portal-redesign/index\.html?\\\${params\.toString()}\`#\`${PORTAL}/?\${params.toString()}\`#" \
  "$OUT/index.html"

# Every page gets the same clean URLs: / , /request-access , /privacy , /terms
for f in index.html request-access.html privacy.html terms.html; do
  sed -i '' \
    -e 's#\./roomparent-com-request-access\.html#/request-access#g' \
    -e 's#\./roomparent-privacy-policy\.html#/privacy#g' \
    -e 's#\./roomparent-terms-of-service\.html#/terms#g' \
    -e 's#\./roomparent-com-landing-v2\.html#/#g' \
    -e 's#\./index\.html#/#g' \
    "$OUT/$f"
done

# cleanUrls lets /request-access serve request-access.html. The redirect keeps
# any already-shared long-form link working now that the file has a short name.
rm -f "$OUT/roomparent-com-request-access.html"
# cleanUrls strips ".html" at the filesystem layer, so every legacy path needs an
# extensionless alias too — otherwise /privacy-policy.html lands on /privacy-policy
# and 404s. Verify these with `curl -L`, not just the first hop.
cat > "$OUT/vercel.json" <<'JSON'
{
  "cleanUrls": true,
  "redirects": [
    { "source": "/privacy-policy", "destination": "/privacy", "permanent": false },
    { "source": "/privacy-policy.html", "destination": "/privacy", "permanent": false },
    { "source": "/roomparent-privacy-policy", "destination": "/privacy", "permanent": false },
    { "source": "/roomparent-privacy-policy.html", "destination": "/privacy", "permanent": false },
    { "source": "/terms-and-conditions", "destination": "/terms", "permanent": false },
    { "source": "/terms-and-conditions.html", "destination": "/terms", "permanent": false },
    { "source": "/terms-of-service", "destination": "/terms", "permanent": false },
    { "source": "/roomparent-terms-of-service", "destination": "/terms", "permanent": false },
    { "source": "/roomparent-terms-of-service.html", "destination": "/terms", "permanent": false },
    { "source": "/roomparent-com-request-access", "destination": "/request-access", "permanent": false },
    { "source": "/roomparent-com-request-access.html", "destination": "/request-access", "permanent": false },
    { "source": "/roomparent-com-landing-v2", "destination": "/", "permanent": false },
    { "source": "/roomparent-com-landing-v2.html", "destination": "/", "permanent": false }
  ]
}
JSON

echo "--- sanity checks ---"
grep -c 'room-parent-portal-redesign' "$OUT/index.html" && echo "FAIL: relative portal refs remain" && exit 1 || true
grep -ci sprout "$OUT/index.html" && echo "FAIL: Sprout refs remain" && exit 1 || true
echo "portal iframe: $(grep -c "$PORTAL" "$OUT/index.html") refs"
echo "request-access links: $(grep -c '/request-access' "$OUT/index.html") refs"
echo "bundle ready. deploy with:  cd $OUT && vercel deploy --prod --yes"
