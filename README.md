# NØRTHLINE RESIDENCES

**Private architectural residences in Berlin — a cinematic scroll-driven concept experience by [CODEGREY.DEV](https://codegrey.dev).**

As you scroll, one residence is physically built in front of you:

> darkness → blueprint → wireframe → structural frame → concrete →
> materials & glass → the completed residence at dusk → the interior →
> the CODEGREY.DEV reveal

NØRTHLINE is a fictional brand created for this concept. No real property,
client, award, or statistic is represented. All architectural imagery was
generated with **Higgsfield** from a single reference design so the same
building persists through every construction stage.

---

## Install

```bash
npm install
```

## Run (development)

```bash
npm run dev
# → http://localhost:5173
```

## Build & preview (production)

```bash
npm run build
npm run preview
```

Stack: **React 18 + Vite 5 + GSAP ScrollTrigger + Lenis**. No CSS
frameworks, no template.

---

## Filming Mode

Built for filming the site on a MacBook with a phone.

| Key     | Action                                                        |
| ------- | ------------------------------------------------------------- |
| `F`     | Toggle Filming Mode — fullscreen, hides nav/help/controls, hides the cursor after ~2 s idle, disables text selection & hover states |
| `R`     | Reset the experience to the very beginning                    |
| `M`     | Toggle sound (audio is opt-in; the site is complete without it) |
| `Space` | Freeze / release the scroll clock (useful to hold a frame)    |

A discreet **Film** dot-button sits at the bottom-right. The shortcut help
chip is shown in development builds only and retires on first scroll.

## Asset folders

```
public/assets/
├── exterior/       residence-complete.webp   (hero master, Higgsfield)
├── construction/   residence-structure.webp, residence-construction.webp
├── interior/       interior-living.webp
├── materials/      (empty — procedural SVG textures render until real
│                    macro photography is added, see below)
├── video/          (empty — drop cinematic MP4s here, see below)
└── audio/          (empty — sound is synthesized with WebAudio)
```

Every asset path the experience uses is declared once in
`src/data/assets.js`.

## Higgsfield replacement workflow

All prompts live in **HIGGSFIELD-PROMPTS.md** — every still and video,
including the ones already generated, so the whole set can be regenerated
or extended at any time.

1. Generate the asset with the exact prompt from HIGGSFIELD-PROMPTS.md
   (16:9, 2K or higher for stills).
2. Convert to WebP (stills) or H.264/H.265 MP4 (video),
   e.g. `npx sharp-cli -i in.png -o out.webp -q 82`.
3. Drop the file at the path listed in the prompt file.
4. For videos and material macros, flip the corresponding entry in
   `src/data/assets.js` from `null` to the file path.

No animation code changes are required — scenes automatically prefer real
video over the still + code-motion fallback.

*(This repo also contains `.github/workflows/fetch-assets.yml`, a small CI
job that downloads freshly generated Higgsfield URLs listed in
`scripts/asset-urls.txt` and commits them — useful when your working
environment cannot reach the Higgsfield CDN directly.)*

## Recommended browser & display setup for filming

- Chrome or Arc, latest, on a MacBook Pro (the experience is tuned for a
  16:10 ≥1440px viewport; it also runs fine on Safari 17+).
- 100 % browser zoom, macOS Night Shift / True Tone **off**.
- Screen brightness ~80 %, room lights low — the site is dark and the
  contrast carries best against a dim environment.
- Close other tabs; Chrome's tab throttling can steal frames.

## Reel filming instructions

1. Open the site, let the loader finish, press `F` (fullscreen + chrome
   hidden).
2. Frame the MacBook at a slight angle; keep the screen's top edge clear
   of reflections.
3. Scroll slowly and steadily with two fingers — every trackpad movement
   visibly constructs the building. The big moments:
   - the blueprint drawing itself (scene 1),
   - the plan tilting down and the structure rising out of it (scene 2),
   - concrete panels pouring in, the lights coming on room by room, the
     residence blooming out of its own light (scene 3),
   - passing through the glass into the interior (scene 4),
   - the residence deconstructing into the CODEGREY.DEV endcard (scene 5).
4. Hold at the end — the final composition is stable for as long as you
   need.
5. `R` to reset and take another pass. `Space` freezes any frame.

---

A concept experience by **CODEGREY.DEV** — digital experiences for
ambitious brands.
