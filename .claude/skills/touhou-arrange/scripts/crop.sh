#!/bin/bash
# usage: crop.sh <dir with p-N.png at 300dpi> <page> <y0> <y1> <x0> <x1> <name>   (coordinates in 100-dpi units)
set -e
dir=$1
y0=$(( $3 * 3 )); h=$(( ($4 - $3) * 3 )); x0=$(( $5 * 3 )); w=$(( ($6 - $5) * 3 ))
sips -c "$h" "$w" --cropOffset "$y0" "$x0" "$dir/p-$2.png" --out "$dir/$7.png" >/dev/null
echo "$dir/$7.png"
