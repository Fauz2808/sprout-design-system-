#!/bin/sh
# Renders, scores and muxes the launch film.
#   tools/make-film.sh                 the full film  → out/sprout-launch.mp4
#   tools/make-film.sh 1,2,3,4 name    those sections → out/sprout-launch-name.mp4
cd "$(dirname "$0")/.."
EP="${1:-full}"; NAME="${2:+-$2}"
node tools/render.mjs video --ep "$EP" > "out/render-$EP.log" 2>&1 || { echo "render FAILED, see out/render-$EP.log"; exit 1; }; echo "render ok"
python3 tools/score-short.py "$EP"; echo "score exit $?"
ffmpeg -v error -y -i "out/sprout-ep$EP-silent.mp4" -i "out/score-ep$EP.wav" -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "out/sprout-launch$NAME.mp4"; echo "mux exit $?"
echo DONE
