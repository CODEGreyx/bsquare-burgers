# HIGGSFIELD PROMPTS — NØRTHLINE RESIDENCES

Every asset the experience uses or can use, with the exact prompt,
placement and delivery spec. The four stills marked **GENERATED** were
produced with Higgsfield (`nano_banana_pro`, 16:9, 2K) during the build;
their prompts are reproduced verbatim so the set can be regenerated.

**Consistency rule:** generate `residence-complete` first, then pass it as
the reference image for every other generation. The building must remain
recognisably identical: two stacked board-formed concrete volumes, upper
floor cantilevered right over a recessed glass ground floor, travertine
fin tower on the left, slim dark-bronze mullions, sculptural pine,
reflecting pool, overcast Berlin dusk, warm 2700K interior light.

---

## Still images (16:9, 2K minimum, deliver as WebP q80–85)

### 1. `public/assets/exterior/residence-complete.webp` — **GENERATED** ✔

- Scene: 3 (completion reveal), 4 (approach), 5 (deconstruction) — the master reference.
- Lighting: overcast dusk, cool exterior / warm 2700K interior.

> Architectural photography of a completed luxury private residence in
> Berlin at dusk, three-quarter front view from across a dark reflecting
> pool. Brutalist contemporary European architecture: two stacked
> rectangular board-formed concrete volumes, the upper floor dramatically
> cantilevered to the right over a recessed glass ground floor.
> Floor-to-ceiling glazing with slim dark bronze metal mullions, warm
> 2700K interior lighting glowing through the glass revealing minimal
> interior. Travertine limestone vertical fin details on the left volume.
> Dark charcoal steel structural columns under the cantilever. Restrained
> landscaping: low dark ornamental grasses, one sculptural pine, wet dark
> granite pavement reflecting the warm windows. Deep blue-grey overcast
> dusk sky, cool exterior tones contrasting warm interior light. Cinematic
> color grade, muted blacks, soft ivory highlights, ultra-detailed,
> photorealistic, shot on medium format, slight low angle, 35mm equivalent
> focal length. No people, no cars, no text.

### 2. `public/assets/construction/residence-structure.webp` — **GENERATED** ✔

- Scene: 2 (the wireframe resolves into this photograph), 3 opening state.
- Reference image: residence-complete.

> Use the reference image: the EXACT same building, same camera position,
> same three-quarter view from across the site, same lens and same
> overcast dusk sky — but photographed months earlier as a clean
> construction site showing only the raw structural skeleton. Exposed
> cast-in-place concrete floor slabs, bare structural columns, concrete
> core walls and the cantilevered upper slab supported by dark steel
> columns. No facade panels, no glazing, no travertine fins, no interior
> light. Open floor plates with visible beams. The reflecting pool is only
> an empty excavated basin, ground is bare compacted earth and gravel, no
> plants, no pine tree yet. No crane, no scaffolding clutter, no people,
> no vehicles, no text. Same cinematic dusk color grade, cool blue-grey
> tones, wet ground, photorealistic architectural photography.

### 3. `public/assets/construction/residence-construction.webp` — **GENERATED** ✔

- Scene: 3 (concrete curtains carry this photograph in).
- Reference image: residence-complete.

> Use the reference image: the EXACT same building, same camera position,
> same three-quarter view, same lens and same overcast dusk sky — but
> photographed at a mid-construction stage. The board-formed concrete
> volumes are complete and cured, dark bronze window frames and mullions
> are installed but several glass panes are still missing leaving dark
> openings, the travertine vertical fins on the left volume are only
> partially installed with a few slots empty. No interior lighting yet,
> interiors dark and raw. Ground is unfinished: compacted gravel and sand
> where the granite pavement will be, the reflecting pool basin is formed
> in raw concrete but empty of water, no plants, no pine tree yet. No
> crane, no scaffolding, no people, no vehicles, no text. Same cinematic
> dusk color grade, cool blue-grey tones, photorealistic architectural
> photography.

### 4. `public/assets/interior/interior-living.webp` — **GENERATED** ✔

- Scene: 4 (full-screen interior).
- Reference image: residence-complete.

> Interior of the same luxury residence shown in the reference image,
> photographed from inside the ground-floor living space at dusk, looking
> outward at an angle through the floor-to-ceiling glazing with slim dark
> bronze mullions toward the dark reflecting pool and sculptural pine
> outside. Materials matching the exterior: one board-formed concrete
> wall, a full-height travertine limestone feature wall, wide-plank dark
> smoked oak floor, dark oak joinery. Minimal furniture: low ivory bouclé
> sofa, dark stone plinth coffee table, single sculptural floor lamp. Warm
> 2700K recessed architectural lighting washing down the travertine wall,
> restrained and controlled, deep shadows, no visible light fixtures
> glare. Cool blue dusk visible outside contrasting the warm interior.
> Cinematic color grade, photorealistic, medium format architectural
> interior photography, no people, no text.

### 4b. `public/assets/interior/interior-living-2.webp` — **GENERATED** ✔

- Scene: 4 (the room turns — reverse/wider view revealed by a light wipe).
- Reference images: interior-living + residence-complete.

> A second photograph inside the SAME living room as the first interior
> reference image, same residence as the exterior reference, same evening,
> same furniture and materials. Camera now positioned near the travertine
> limestone feature wall, looking across the ivory bouclé sofa and dark
> stone plinth coffee table toward the floor-to-ceiling glazing with slim
> dark bronze mullions, through which the dark reflecting pool, wet
> granite terrace and sculptural pine are visible in blue dusk. Wide-plank
> dark smoked oak floor, board-formed concrete ceiling edge, warm 2700K
> recessed lighting washing the stone, the small sculptural bronze floor
> lamp glowing beside the sofa. Identical warm-interior cool-exterior
> cinematic color grade as the references, photorealistic medium format
> architectural interior photography, no people, no text.

### 5. `public/assets/exterior/residence-reference.webp` — optional alias

Identical to residence-complete; keep a copy under this name if a separate
untouched master is wanted for future generations.

### 6. `public/assets/exterior/residence-blueprint.webp` — temporary (code-drawn)

- Scene: 1 currently renders a hand-built SVG blueprint (crisper for
  scroll-drawing). Generate this only if a raster blueprint is preferred.
- Reference image: residence-complete. Aspect 16:9, 2K.

> Refined architectural blueprint of the exact building in the reference
> image, drawn from the same three-quarter camera angle. Thin precise
> ivory-white and pale steel-blue line work on a near-black graphite
> background, elevation and floor plan lines, dimension chains with end
> ticks, grid axis bubbles labeled A to F, small technical annotations,
> restrained line weights, no color fills, no photorealism, clean vector
> feel, museum-quality architectural drawing, no people, no logos.

### 7. `public/assets/exterior/residence-wireframe.webp` — temporary (code-drawn)

- Scene: 2 uses the animated SVG wireframe instead. Same instructions as 6:

> Dark three-dimensional structural wireframe of the exact building in the
> reference image, same camera angle: thin glowing pale-grey edges tracing
> every slab, column, beam and glazing frame over a near-black background,
> subtle depth fog, faint ground grid, technical and precise, no photoreal
> surfaces, no text.

### 8–11. Material macros (deliver 1:1 or 16:9, ≥1K, WebP)

Currently rendered procedurally (SVG turbulence) — drop the files and set
`materials.*` in `src/data/assets.js`.

- `public/assets/materials/material-stone.webp` — Scene 3 material wall, panel 1:

  > Extreme macro photograph of honed travertine limestone, warm grey-beige
  > with fine natural pitting and long horizontal veining, raking warm
  > 2700K light from the left revealing surface relief, dark moody
  > background falloff, cinematic, ultra sharp, no text.

- `public/assets/materials/material-oak.webp` — panel 2:

  > Extreme macro photograph of dark smoked oak wood, wide plank, matte
  > oiled finish, deep espresso brown with visible straight grain and
  > subtle cathedral figure, soft warm side light, cinematic dark mood,
  > ultra sharp, no text.

- `public/assets/materials/material-metal.webp` — panel 3:

  > Extreme macro photograph of patinated dark bronze metal, fine vertical
  > brushed texture, soft specular highlight band moving across the
  > surface, deep charcoal tones with warm bronze undertone, cinematic,
  > ultra sharp, no text.

- `public/assets/materials/material-glass.webp` — panel 4:

  > Macro photograph of low-iron architectural glass edge and surface at
  > dusk, cool blue-grey reflections with one warm interior light bokeh,
  > subtle rain droplets, dark background, cinematic, ultra sharp, no text.

---

## ★ V0 — THE BUILD (scroll-scrubbed construction clip) — PRIORITY

`public/assets/video/build-timelapse.mp4` — the centrepiece. One locked
camera; the residence is constructed across the clip. BuildScene scrubs
this video's timeline directly to scroll (build as you scroll down, un-build
as you scroll up), so nothing else needs to change — just drop the file and
set `videos.buildTimelapse` in `src/data/assets.js`.

- Aspect 16:9, 1080p+, **5–8 s**, 24–30 fps.
- **Locked-off camera — zero pan/zoom/parallax.** The frame must match the
  reference stills' three-quarter angle so it sits in the same "one place".
- Generate with start_image = `residence-structure.webp` and end_image =
  `residence-complete.webp` (kling3_0 supports start+end frames) so the
  clip morphs the *same building* from frame to finished.
- **Encode for scrubbing:** dense keyframes, e.g.
  `ffmpeg -i in.mp4 -c:v libx264 -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart build-timelapse.mp4`
  (a keyframe every ~6 frames makes seeking smooth as you scroll).

> Locked-off architectural time-lapse of a single luxury Berlin residence
> under construction at dusk, camera completely static on a tripod, exact
> three-quarter view across the reflecting-pool plot. The building assembles
> itself in place: bare structural concrete frame and columns → cast
> concrete walls and the cantilevered upper volume → dark bronze window
> frames → glass panes fill in → travertine fins clad the left volume →
> warm 2700K interior lights switch on room by room → water fills the
> reflecting pool and the sculptural pine and grasses settle in. Overcast
> blue-grey dusk sky throughout, cool exterior vs warm interior, cinematic
> muted color grade. The architecture stays rigid and identical, no
> morphing windows, no warping geometry, no people, no cranes, no text,
> no camera movement.

---

## Cinematic videos (16:9, 1080p+, H.264 MP4, 6–10 s, 24 fps)

Camera movement must be **very slow and perfectly stable** — the site is
filmed off a MacBook screen; fast AI motion, warping architecture,
changing windows or morphing furniture are unusable. Each file activates
by setting its path in `src/data/assets.js` (`videos.*`).

### V1. `public/assets/video/exterior-approach.mp4`

- Scene 3, replaces the completed-residence still after the reveal.
- Duration 8–10 s, loopable. Lighting: identical dusk grade to the still.

> Ultra slow cinematic dolly push toward the completed residence from the
> reference image, across the dark reflecting pool, dusk, warm interior
> lights on, perfectly stable camera, no people, no camera shake, subtle
> water ripple reflections only, architecture completely rigid and
> unchanging, photorealistic, cinematic color grade.

### V2. `public/assets/video/exterior-reflection.mp4`

- Scene 3 alternative / b-roll between FORM and MATERIAL.
- Duration 6–8 s, loopable.

> Very slow lateral tracking shot across the reflecting pool and wet dark
> granite pavement of the residence in the reference image at dusk, warm
> window light shimmering in the water, camera perfectly level and stable,
> architecture rigid, no people, cinematic, photorealistic.

### V3. `public/assets/video/interior-light.mp4`

- Scene 4, replaces the interior still.
- Duration 8–10 s, loopable.

> Static locked-off interior shot of the living space in the reference
> image: warm architectural light very slowly sweeping across the
> travertine feature wall, dust motes in the beam, everything else
> perfectly still, dusk outside the glazing, cinematic, photorealistic,
> no people.

### V4. `public/assets/video/material-macro.mp4`

- Scene 3 material wall (plays inside the panels) or scene 4 inserts.
- Duration 8 s.

> Extreme macro sequence, very slow continuous pan across four surfaces in
> order: honed travertine, dark smoked oak grain, brushed patinated
> bronze, rain-specked architectural glass, raking warm light, shallow
> depth of field, perfectly steady motion, cinematic dark mood, no text.

### V5. `public/assets/video/berlin-atmosphere.mp4`

- Scene 5 background under the deconstruction (optional).
- Duration 8–10 s, loopable.

> Elevated calm view over Berlin rooftops at blue-hour dusk, distant TV
> tower silhouette on the horizon, low clouds drifting almost
> imperceptibly, muted blue-grey grade with sparse warm window lights,
> perfectly stable camera, no people, no logos, cinematic.

---

## Regeneration checklist

1. Generate #1 first at 2K. Approve it before anything else.
2. Chain #2, #3, #4 with #1 as reference in the same session.
3. Stills → WebP q82; videos → H.264 CRF 20–23, `-movflags +faststart`.
4. Place files at the exact paths above; update `src/data/assets.js` only
   for videos/materials (stills are already wired).
