# Streamline page scrub sequence

One room, one continuous chaos-to-order transformation, driven entirely by
scroll. Frame 1 is the office mid-blizzard; frame 110 is the same office in
order. Scrub back up and it comes apart again. That reversibility is the point:
a slow camera move gives nobody a reason to drag the page backwards.

## The story

The wall clock reads nine o'clock in both end frames, and the room is in
daylight. So this is not a long day, it is **two versions of the same morning**.
Same clock, same light, same desk, different life. The copy has to hold that
line: the promise is not "work later", it is "start the day not buried".

The clean frame deliberately still carries a tall stack of files. The room ends
tidy, not empty. Work got routed, not deleted, and the visual has to say so or
the whole offer reads as a con.

## Pipeline## Pipeline

1. **Still** via Higgsfield. Seedream 4.5, 16:9, quality `basic` (renders 2560x1440).
   Seedream beat Nano Banana Pro here on falloff: deeper blacks at the frame
   edges, which is what lets the copy sit on top of it.
2. **Motion** via Kling 3.0, `mode: pro`, `sound: off`, 5s, the still passed as
   `start_image`. Kling holds a continuous move better than Seedance does, which
   is the whole requirement: a scrub needs the camera to travel one direction at
   one speed. Render 2 takes and keep the one that never drifts backward.
3. **Frames** via `tools/scrub-frames.sh <clip.mp4> act1 44 1600`.

## Budget

Keep each act under ~4MB. Three acts load on one page and the entire pitch is
that things feel lighter. If an act comes in heavy, drop `SCRUB_Q` (default 72)
before dropping the frame count, since fewer frames shows up as visible stepping
on a slow scroll.

## Frame counts are declared twice

`data-count` in `streamline.html` must match what the script wrote. If they
disagree the tail of the sequence never draws. Act 1 is 44, act 2 is 40,
act 3 is 46.

## Source frames

Yeti's own two renders (`~/Downloads/Office beginning.png` = chaos,
`Office end.png` = clean; note the filenames are STORY order, not generation
order, which is an easy way to wire the render backwards).

Both were uploaded to Higgsfield and passed to Kling 3.0 as `start_image`
(clean) and `end_image` (chaos), so the sequence lands exactly on the approved
clean frame instead of an approximation of it.

**Motion prompt:** locked-off tripod, framing identical first frame to last,
every sheet erupts upward, furniture and clock stay exactly where they are.

A locked camera matters twice: the eye holds still so only the transformation
reads, and a reversed static shot has no camera-direction artefacts.

## Two failure modes, both measurable

**Dead air.** Both takes held ~2.5s on the clean office before erupting. Reversed,
that becomes 2.5s at the END of the scroll where dragging does nothing. Find it:

    ffmpeg -v error -i take.mp4 \
      -vf "tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" \
      -f null - 2>/dev/null | grep -o "YAVG=[0-9.]*" | cut -d= -f2

Threshold at ~12% of peak to locate the first and last real motion, then trim.
Trimming took the chosen take from 68 stalls / cv 0.79 to 5 stalls / cv 0.49.

**Wrong direction.** Verify from pixels, never from the log line or the filename:
the chaos frame carries more edge energy than the tidy one.

    ffmpeg -i frame_001.webp -vf edgedetect,signalstats,metadata=print -f null -

## Motion budget

Average inter-frame change, for reference when judging a new take:

| Sequence | Motion | Verdict |
|---|---|---|
| Slow pans (first attempt) | 1.6 to 2.3 | no reason to scrub |
| Dark reverse-explosion | 6.9 | works |
| Office reverse-explosion | 6.9 | works |

## Weight

7.0MB at 1440px / q62 / 110 frames. This image resists compression: even q50
only reached 6.4MB, so resolution and frame count are the levers, not quality.
Acceptable because it is now ONE lazily-loaded sequence rather than three acts,
and the poster paints immediately while frames stream in.
