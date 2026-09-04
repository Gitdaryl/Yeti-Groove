# DLYC Previz Spec - source data for renders and Higgsfield prompts

Everything below is read off the client-supplied drawings. Yeti cannot read the sheet
text at screen size, so this file IS the readable version. Treat it as the source of
truth for prompt writing, and re-verify against any newer set before rendering.

**Status after the Aug 26 2026 site meeting: the A-1 to A-6 boathouse set is SUPERSEDED.**
Craig confirmed in the room that those sheets are "a previous version." The concept changed.
Do not model from them directly. See "Revised direction" at the bottom, which is now the
governing brief. The elevations remain useful only as a material and massing reference.

---

## The three projects

| | Project | Drawings on hand | Previz-ready? |
|---|---|---|---|
| A | Beachfront: landscaping, retaining walls, playground | Wilson Design L.01 / L.02, conceptual + revised | Partial. Site plan and details only, no building elevations |
| B | New boathouse over cafe + classroom, possible music pavilion | Krieghoff A-1 to A-6, both plans + all four elevations | **Yes. Fully modelable** |
| C | Clubhouse floors 2-3, 30 hotel rooms into 12-15 luxury suites | None seen | No. Intent only |

Lead with B. It is the only one with complete geometry.

---

## Project B: the boathouse

Krieghoff-Lenawee Co, Adrian MI. Drawn by J. Wright; G. Faulkner on A-4, A-5, A-6.
Architect/Engineer of record: J. Wright. Sheets A-1 to A-4 dated 11-13-2024,
A-5/A-6 dated 06-18-2024. File named PROGRESS SET 6_25_25.
Marked PRELIMINARY / NOT FOR CONSTRUCTION. Craig says it is out of date.

### Vertical dimensions (datum elevations off the sheets)

| Level | Elev | Note |
|---|---|---|
| Lower level floor | 87'-6" | boat bays / cafe level |
| First floor | 100'-0" | banquet level, +12'-6" |
| Top of wainscot / top of stone | 103'-4" | stone base terminates 3'-4" up |
| Truss bearing | 116'-0" | 16'-0" plate height on first floor |
| Top of roof | 127'-8 1/4" | main ridge |
| Top of cupola | 136'-4 1/16" | overall ~48'-10" above lower floor |

The 16'-0" plate on the banquet level is the important one. This is a tall, generous
room, not a domestic ceiling. Renders must feel volumetric.

### Footprint (read off chained dimension strings, verify on site)

- Lower level main mass approx **96'-6" x 46'-6"**
- Attached storage wing approx **47'-7" x 20'-0"**
- First floor banquet block approx **66'-6" x 60'-0"**, plus a service wing

### Room program

**Lower level (A-1):** Vestibule 001, Rest Rooms 002 / 003, Cafe 004, Office 005,
Mech 006, Storage 007, Multi-Purpose 008 (the classroom), Storage 009.

**First floor (A-2):** Banquet Room 100, Serving Bar 101, Serving Area 102,
Corridor 103, Rest Rooms 104 / 105 / 106, Mech/Storage 107.
**NANO WALL** with two stacking areas. Serving counter. Balcony railing.

### Material palette, as specified

| Sheet callout | Prompt language |
|---|---|
| 8" LP SmartSide | horizontal painted lap siding, 8 inch exposure |
| SmartSide trims (typ) | painted trim boards at corners and openings |
| Shake siding | cedar shake shingle siding, used in gables and on the cupola |
| Stone veneer / masonry wainscot | dry-stacked stone veneer base, terminating at a cap 3'-4" above the first floor |
| Shingle roof | asphalt shingle roof, wide overhangs |
| Metal roof | standing seam metal, **cupola only** |
| Alum storefront window / door (typ) | dark anodized aluminum storefront glazing |
| PVC railing | white PVC deck railing, full width of the lake-side balcony |
| Display boards | exterior display panels on the east elevation |

Do not let a model invent brick, stucco, board-and-batten, or a full metal roof.
The main roof is asphalt shingle. Metal appears only on the cupola.

### Orientation and the hero shots

**North elevation is the lake face. Confirmed by Yeti Aug 26 2026.** A-3 is therefore
the water side: full-width balcony with PVC railing above a stone base with wide bay
openings at water level. A-4 south is the land-side arrival facade and carries the club
logo. A-5 east shows grade falling away sharply toward the water.

1. **The nano wall, golden hour.** First-floor banquet room, 16' plate, folding glass
   wall stacking open onto the north balcony with the lake beyond. This is the film.
   Nobody can read "NANO WALL STACKING AREA" on a floor plan; everybody understands
   this shot.
2. **South elevation arrival (A-4).** Club logo already drawn on the building above the
   entry. The front door with the name on it. Hero frame for a title card.
3. **North elevation from the water.** Boat approach, cupola on the skyline.
4. **Cafe level (004) opening onto the beach.** Ties Project B to Project A.

### What the drawings do NOT give you

No roof plan, no building sections, no window/door schedule, no interior finishes,
no lighting, no furniture. Cupola construction is inferred from elevations only.
Anything in that list is a creative decision, so flag it to the client as a
visualization choice rather than presenting it as designed.

---

## Rights - blocking issue

The Krieghoff sheets carry the restrictive notice: the drawings are the exclusive
property of Krieghoff Lenawee Co and are **"not to be copied or used in any other way
without the express consent of Krieghoff Lenawee Co."** A photoreal previz derived from
those elevations is exactly that use. The Wilson landscape sheets carry their own
copyright notice.

**Get written consent before rendering a single frame.** Craig can broker it in one
email because Krieghoff is the club's own CM. Put the permission in the contract.

---

## Prompt-writing notes

- Render at 720p and upscale with Topaz rather than native 1080p, per the standing recipe.
- Say what HOLDS in a camera move. A pull-back that resolves keeps the tension.
- Label every output a visualization of approved plans, never a photograph.
- The building is a lake club, not a resort. Michigan inland lake, mature hardwoods,
  late summer. Avoid palm-adjacent or coastal-Atlantic dressing.
- Late August is the best the site looks all year. Any site plate should be shot now.


---

## Creative direction

### The film's actual job

The club's waitlist has fallen from **70+ down to 15** over the years (source: DLYC
marketing manager, relayed Aug 26 2026). That is the number the film exists to move.
It reframes the audience: this is not only a boardroom film for members voting on an
assessment, it is a **public-facing recruitment asset** aimed at prospective members
across the Irish Hills, Toledo and Ann Arbor orbit.

Consequences: it needs a 60 second cut and a vertical cut, it needs public usage terms,
and it pairs directly with the Sales Suite's custom domain with lead capture, which
becomes the waitlist signup page. Film feeds page, page produces a countable number.

### Structure

Yeti's instinct is a build-timelapse from the existing structure to the finished vision.
That is right as a **device**, wrong as the whole film. A timelapse shows a building
being made; it ends where the sell begins. Three acts instead:

1. **Now.** The club as it stands, warm, populated, recognizably theirs.
2. **The build.** Blueprint-to-building transition. Yeti has already proven this
   technique - see the Signature-Films-Previz archive (`blue print to building.mp4`,
   `Condo foundation to frames.mp4`, `Tower build time lapse.mp4`).
3. **After.** Nano wall folding open at golden hour, banquet room full, cafe at the
   beach, boats coming in.

End on people, not on a finished building. The ask is membership, not construction.

### Accuracy versus feeling - it is not a choice

Be **accurate where it is drawn**, **evocative where it is not**, and label the whole
thing a visualization of approved plans.

Accurate matters because Krieghoff and Wilson will watch this, and they broker the next
job. A metal main roof or an invented atrium costs credibility with the channel. It also
protects the club: a member who votes yes on an assessment because of a render that does
not match the finished building is Craig's governance problem, and Yeti should not hand
a client that liability.

Evocative is legitimately open wherever the drawings are silent: interior finishes,
furniture, lighting, people, weather, and landscaping around the boathouse are all
undesigned. Make those beautiful.

The good news is the building as specified is already handsome - cedar shake, stone
veneer, a cupola, a folding glass wall onto the lake. It does not need embellishing.
It needs rendering well.

---

## Prompt calibration results (Aug 26 2026, 8 test images, 15 credits)

Tests live in the session scratchpad `dlyc-tests/`. Internal only, never sent to client.

### Model split - use both, for different jobs

| | Use | Why |
|---|---|---|
| **flux_2** (variant pro, 2k) | **Exteriors** | Best material articulation; renders the carved DEVILS LAKE YACHT CLUB sign legibly, which almost nothing does. Holds shingle-vs-metal roof correctly. |
| **seedream_v5_pro** (2k) | **Interiors** | Followed the flat-ceiling instruction where FLUX would not. Warmer, more photographic, better at spatial constraints. |

This reverses between shot types. Do not pick one model for the whole project.

### The rules that actually changed the output

1. **Never write "boathouse" unqualified.** Round 1 put the building on stone piers
   standing in open water. Say "lakeside clubhouse on a sloping shore site, walkout
   lower level at grade." Round 2 with that language fixed it completely.
2. **State roof pitch numerically.** "Low-pitched, roughly 4:12, broad and horizontal."
   Without it the model draws an 8:12 suburban roof and the building stops reading as
   a lakeside pavilion.
3. **Positive descriptions beat negations.** "No cathedral vault, no sloping ceiling"
   was ignored by FLUX twice. Describe the thing you want instead: "a flat horizontal
   ceiling, level from wall to wall, with painted trusses hung below it."
4. **Place the cupola explicitly:** "centered on the main ridge, rising about nine feet
   above it." Otherwise it lands on the front roof slope.
5. **Count things out loud.** "Exactly three overhead doors" - unspecified counts drift.

### Known drift still to fix

- FLUX adds a full covered porch colonnade across the south facade that is not drawn.
- Roof colour drifts warm brown; specify "weathered charcoal grey asphalt shingle".
- Interior ceiling still wants to vault. Seedream is closer but not exact.
- Deck columns appear even when excluded; plausible structurally, low priority.

### Standing honesty rule

The nano-wall interiors are the strongest images and the least supported by the
drawings - there is no building section, so the ceiling is invented. Anything invented
gets flagged to the client as a visualization choice, never presented as designed.


---

# REVISED DIRECTION — from the Aug 26 site meeting

This section supersedes the boathouse geometry above. Recorded from the meeting with
Craig Gabel, Mike Clark and Mark Schaffner at the club.

## Scope actually commissioned

**A + B together as one concept. Project C is explicitly out for now.**
Craig: "for now, let's just concentrate on this and not do anything upstairs."

## Terminology, use Craig's words

- **Boathouse** = the enclosed building
- **Pavilion** = the open structure beside it, open on three sides

The old set drew one combined building. The new concept is an enclosed building plus a
separate pavilion, related rooflines, flowing into the lawn.

## Architectural style, now specified

- **Vernacular Victorian.** Their words, from Mark. Not fancy Victorian, the plain kind.
- Reference building: **The Breakers at Cedar Point** - the addition matches the original.
- Craig: "it's important to me that it has extra gingerbread."
- Must match the existing club. "The same magic." Explicitly **not** "modern Frank Lloyd
  Wright." The existing club is 1870s.

## Pavilion, confirmed details

- **Roof pitch 4:12.** Craig said it out loud. The existing club reads as 6:12.
- Deliberately lower than the main club so it does not overpower it.
- Possibly a hip roof all the way around rather than a gable.
- **Timber frame, exposed from below.** "You're going to just look up and see all timber."
- Columns match the existing porch columns: cedar, painted, same finish.
- Roofline should match the club's **lower** roofline, not the top one.
- Optional drop-down vinyl on two sides for weather.
- Capacity target 120 to 150 people under cover.

## Boathouse building

- **Nano doors on the wall facing the pavilion/patio**, windows to the north.
- Floor sits roughly 2 to 3 feet above the current boathouse floor.
- Lower level needs **9 foot clear** (currently 7 foot) to work as usable space.
- Lower level program: cafe, classroom / multi-purpose, bathrooms, storage.
  Bathrooms accessible independently so cafe or classroom can be locked separately.
- Garage doors that open up at the lower level.
- Guard railing to match existing. 30 inches, or 42 if it has to be higher.

## Beachfront - the emotional core

**Accessibility is the story, not luxury.** Craig: if you are wheelchair bound you cannot
get from the club to the dock. "It is something that we deserve to provide better for
the members." The goal is parking lot to dock without hitting a single step.

**Put that in the film.** It is the one beat that is about dignity rather than amenity,
and it is the argument that survives any member who thinks this is spending on nothing.

Other beachfront notes: existing walls date to 1956 and are failing. Sundial/shower
feature drops to 30 inches to avoid needing a railing. Sand volleyball goes away and
moves into the water. Play zoned: ages 2 to 8 in one area, teen and adult games
(cornhole, tetherball) in another. Stage plus a level lawn that can take a large tent.
One dying red oak comes out, the rest stay.

## Purpose and deadline

- **"Our whole goal is to launch the membership."**
- Near-term deliverable: something to include in a **holiday letter to members**, so late
  November. That is the real deadline.
- Also wanted looping on the club TVs when they are otherwise idle.
- Project A construction starts roughly **13 months out** (autumn 2027).
- Craig, unprompted, on the Cove film: "that project was going nowhere until I had that
  video made. And then all of a sudden..."

## Project C, deferred but live

30-ish old hotel rooms into roughly a dozen units. Their own funding theory: **pre-sell
the units to fund the boathouse.** Craig floated ten units at half a million. That is an
off-plan sales job when it wakes up, not a member-excitement film. Interim step they
agreed: gut the manager's suite first as a proof of concept, via Chuck and Mickey.

## Agreed workflow

Yeti proposed and Craig approved: run concepts → group phone chat → they send style
reference pictures → pick a direction → elevations → 3D model animations.

They also said to let the AI **run wild** first without tight parameters, just to see
what shows up. So the concept phase is deliberately exploratory. Tight accuracy applies
later, once a direction is chosen.

## Assets and access

- Craig to send a clean unmarked site plan plus a marked-up copy.
- **Otis**, project manager, has Yeti's email and will send better information.
- **Drone approved on site.** Craig: "yeah, go for it."
- Topographic survey exists.
- Trade split: Brandon = landscape/hardscape, Krieghoff = the build, Chuck and Mickey =
  interior rooms. Zoning contact Jeff Kittle, plus Gillow. Rollin Township.
- Grade-level landscape work likely needs no permit; no variance since Gillow was hired.

## Commercial position

**No number was named by either side.** Craig: "we're open to, if you want to give us a
fixed fee based on what you do in the past... whatever you would prefer. I would say get
back to us." The quote is entirely Yeti's to set.

**The $2,000 anchor is dead, and they killed it.** Yeti used the learning-curve framing
("it was the first time, an experiment"), someone in the room said they could not imagine
what an architectural firm would charge, and the response to "that is not what is going
on anymore" was **"you can just throw all of that in the trash."** See [[no-secret-discounts]].
