#!/usr/bin/env bash
# Turn one rendered clip into a scroll-scrub frame sequence.
#
#   tools/scrub-frames.sh <clip.mp4> <act-name> [frame-count] [width]
#
# Set REVERSE=1 to number the frames backwards. This is how the transformation
# is built: video models render "neat thing explodes" convincingly and
# "mess assembles itself" badly, so we render the explosion and reverse it.
# Scrolling down then pulls the storm of paper back into squared stacks.
#
# Writes media/streamline/<act-name>/frame_NNN.webp plus poster.jpg, then
# prints the total weight. Keep an act under ~4MB: three acts load on the
# same page and the whole point of the thing is that it feels light.
#
# The page reads the frame count off data-count in streamline.html, so if you
# change the count here, change it there too or the last frames never show.
set -euo pipefail

CLIP="${1:?usage: scrub-frames.sh <clip.mp4> <act-name> [count] [width]}"
ACT="${2:?missing act name, e.g. act1}"
COUNT="${3:-44}"
WIDTH="${4:-1600}"
QUALITY="${SCRUB_Q:-72}"
REVERSE="${REVERSE:-0}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/media/streamline/$ACT"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CLIP")
FPS=$(python3 -c "print(f'{$COUNT/$DUR:.6f}')")
echo "clip ${DUR}s -> $COUNT frames at ${FPS}fps, ${WIDTH}px wide, q$QUALITY"

# -vsync 0 so ffmpeg emits exactly what the fps filter selects and the frame
# numbering stays in step with scroll position.
ffmpeg -v error -i "$CLIP" -vf "fps=$FPS,scale=$WIDTH:-2:flags=lanczos" \
       -vsync 0 -frames:v "$COUNT" "$TMP/f_%03d.png"

GOT=$(ls "$TMP"/f_*.png 2>/dev/null | wc -l | tr -d ' ')
if [ "$GOT" -lt "$COUNT" ]; then
  # Short by a frame or two from rounding: hold the last one so the sequence
  # never ends on a gap the scrubber would draw as a stall.
  LAST=$(ls "$TMP"/f_*.png | tail -1)
  for i in $(seq $((GOT+1)) "$COUNT"); do
    cp "$LAST" "$TMP/$(printf 'f_%03d.png' "$i")"
  done
  echo "padded $((COUNT-GOT)) frame(s) by holding the last"
fi

mkdir -p "$OUT"
rm -f "$OUT"/frame_*.webp
i=0
if [ "$REVERSE" = "1" ]; then
  LIST=$(ls "$TMP"/f_*.png | sort -r)
  echo "reversing: last rendered frame becomes frame_001"
else
  LIST=$(ls "$TMP"/f_*.png | sort)
fi
for f in $LIST; do
  i=$((i+1))
  cwebp -quiet -q "$QUALITY" -m 6 "$f" -o "$OUT/$(printf 'frame_%03d.webp' "$i")"
done

# Poster doubles as the mobile still, where the scrub never activates.
if [ "$REVERSE" = "1" ]; then
  cp "$(ls "$TMP"/f_*.png | sort -r | head -1)" "$TMP/poster.png"
else
  cp "$TMP/f_001.png" "$TMP/poster.png"
fi
sips -s format jpeg -s formatOptions 68 -Z "$WIDTH" "$TMP/poster.png" --out "$OUT/poster.jpg" >/dev/null

TOTAL=$(du -sh "$OUT" | cut -f1)
BIGGEST=$(ls -S "$OUT"/frame_*.webp | head -1)
echo "wrote $(ls "$OUT"/frame_*.webp | wc -l | tr -d ' ') frames -> $OUT"
echo "total $TOTAL, largest frame $(du -h "$BIGGEST" | cut -f1)"
