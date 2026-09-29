#!/bin/sh
# Renders, scores and muxes the five shorts: out/sprout-short-N-<name>.mp4
# Usage (from ~/Sprout): "SPROUT VIDEO/Video 5 - Launch/tools/make-shorts.sh" [episode numbers...]
cd "$(dirname "$0")/.."
NAMES="1:intro 2:daily-brief 3:sprout-assist 4:class-group-chat 5:families"
EPS="${*:-1 2 3 4 5}"
for e in $EPS; do
  n=$(echo "$NAMES" | tr ' ' '\n' | grep "^$e:" | cut -d: -f2)
  node tools/render.mjs video --ep "$e" > "out/render-ep$e.log" 2>&1; echo "ep$e render exit $?"
  python3 tools/score-short.py "$e"; echo "ep$e score exit $?"
  ffmpeg -v error -y -i "out/sprout-ep$e-silent.mp4" -i "out/score-ep$e.wav" -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "out/sprout-short-$e-$n.mp4"; echo "ep$e mux exit $?"
done
echo ALL-DONE
