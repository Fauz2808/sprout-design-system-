#!/bin/sh
# tools/tile.sh out.png cols img1 img2 ...   tile review frames side by side
# cells are 360 px wide (portrait) or 640 px wide (landscape), height from the first frame's aspect
out="$1"; cols="$2"; shift 2
wh=$(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$1")
iw=${wh%,*}; ih=${wh#*,}
if [ "$ih" -gt "$iw" ]; then cw=360; else cw=640; fi
ch=$(( cw * ih / iw ))
n=$#; inputs=""; filt=""; i=0
for f in "$@"; do inputs="$inputs -i $(printf '%q' "$f")"; filt="$filt[$i]scale=$cw:$ch[v$i];"; i=$((i+1)); done
layout=""; labels=""
for j in $(seq 0 $((n-1))); do c=$((j % cols)); r=$((j / cols)); layout="$layout${layout:+|}$((c*cw))_$((r*ch))"; labels="$labels[v$j]"; done
eval ffmpeg -v error -y $inputs -filter_complex "\"$filt${labels}xstack=inputs=$n:layout=$layout:fill=black\"" -frames:v 1 "\"$out\""
