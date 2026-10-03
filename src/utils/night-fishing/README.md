# night-fishing

Homepage background: a real-time WebGL recreation of the night-fishing shot from *Sonny Boy* episode 05
(about 12:35–12:44), where two red electric floats bob on a dark sea. Clicking a float plays a "bite"
easter egg (nibbles → dragged under → yanked out → recast → lands and settles), choreographed drawing by
drawing after the original.

The goal is fidelity to the original cel art rather than generic water rendering: every geometry, color,
motion amplitude and reflection statistic below was measured from the source frames.

## Files

| File | Role |
|------|------|
| `config.ts` | All tunables: palette, geometry, reflection, ripple, splash, line, floats, layouts |
| `float-shape.ts` | Float contours traced from the original (vector polygons, generated — do not hand-edit) |
| `shape-atlas.ts` | Rasterizes the contours and builds a signed-distance-field atlas at runtime |
| `shader.ts` | The fragment shader (generated from `config.ts` constants) |
| `renderer.ts` | WebGL1 setup, atlas texture upload, uniforms |
| `index.ts` | `initNightFishing`: layout, timing, per-frame uniforms, bite state, hit testing |
| `motion.ts` / `bite.ts` | Calm bobbing (periodic) and the bite timeline (per-drawing keyframes) |
| `layout.ts` | Landscape / portrait composition |
| `__tests__/motion.test.ts` | Loop seamlessness, bite timeline invariants, layout |

The page side is `src/themes/night-fishing/` (`index.astro` markup, `client.ts` activation, click-to-bite, debug params). The homepage stage that mounts it is `src/pages/index.astro`.

## How it renders

- One full-screen triangle and one fragment shader. Time is stepped at 12 fps (`STEP_FPS`) because the
  original is animated on twos; the canvas only re-renders when the drawing index changes.
- Calm motion is a sum of sinusoids whose cycle counts are integers per `LOOP_SECONDS` (24 s), so the
  animation loops seamlessly (`t` and `t + LOOP_SECONDS` render identically — covered by tests).
- Pointer attract (`POINTER_ATTRACT` in `config.ts`): while the bob keeps playing around its anchor, a
  nearby cursor pulls the float a few pixels toward itself. Pull grows linearly with proximity (none at the
  edge of the radius, strongest when the cursor is on the float) and a damped spring follows that
  target, including on the way out. The spring is integrated once per drawing, on the same 12 fps step as
  the bob — it is not smoothed between drawings. A biting float is left on its choreography.
- **Float body**: `float-shape.ts` holds four layers (halo, silhouette, lit body, cream core). At start-up
  `buildShapeAtlas` fills them with Canvas 2D and runs a generalized Felzenszwalb distance transform
  (one pass per layer; edge texels are seeded with their sub-pixel coverage). The shader samples the atlas
  and paints flat cel colors with anti-aliased edges, so rotation and stretch stay crisp at any scale.
  `shapeAt` returns "far outside" beyond a float's own atlas cell — without that guard, reflections
  sample the neighbouring float's cell and draw a ghost.
- **Reflection** (only what is above water is mirrored):
  - The original reflection is a hand-drawn cycle of 15 drawings (drawing `i` matches `i + 15` at 0.88–0.98
    mask overlap, while any two drawings inside a cycle overlap only ~0.5), so it is redrawn every drawing
    ("boiling") rather than swaying smoothly. Blob and fragment shapes are re-hashed per drawing index;
    only the density profile and overall position stay stable.
  - Vertical coherence: within one drawing, the sideways offset of the reflection is a smooth curve along
    depth (centre correlation ≈ 0.55 at 16 px, 0.4 at 32 px). `waveField` is a 1D value noise in depth,
    regenerated every `REFLECTION.boil.hold` drawings (interpolated in between, so neighbouring drawings are
    partly correlated) and drifting down slowly. Every reflection pixel is shifted by it, so the body
    reflection and the fragments below line up into one wavy column.
  - The body reflection is 3 rounded blobs stacked downward, each darker, narrower and shifted sideways,
    drawn bottom-up so tone boundaries follow blob edges (as in the cel art). The stack length is re-rolled
    per drawing (`block.stack`), so it alternates between a compact lump and a longer column that breaks
    apart. It lives in "calm depth" `u = v + mirrorDepth(sink)`, so when the float sinks the blobs nearest
    the waterline disappear first.
  - Stick fragments are paint-daub shapes (main ellipse + two offset lobes + low-frequency edge wobble,
    flat-ish tops, a minimum thickness and a minimum 1.6 width/height ratio; thicker near the body
    reflection, flat strips further down). They keep the calm density
    profile, shift up by however much the body reflection shrank, and are cut at
    `reflectionReach(visible height)`.
  - `REFLECTION.mirror` maps float height → calm reflection depth (body compressed, stick stretched);
    `REFLECTION.reach` maps visible height → total reflection length (measured from the nibble and
    plunge drawings).
- **Water-surface effects**: the lit ring where the body meets the water (float-local, painted above the
  halo and mostly hidden behind the body: a thin edge on the left, a 2–17 px band up the right edge, now
  and then a strip under the body; the body's lit rim inside it is tinted a deeper coral), the underwater glow when the body is just below the surface, the landing ripple (paint daubs
  along an expanding flattened ellipse), the air reflection of a flying float, splash droplets, the
  fishing line (quadratic Bézier segments, held per drawing) and the speed line (from the body away
  from the tip).

## The bite timeline

`bite.ts` keyframes are indexed in drawings (1/12 s). Drawing `n` corresponds to frame `36 + n` of a
12 fps extraction starting at 12:35.05 of the episode (the nibble starts at 12:38). Tracks:
`sink`, `dx`, `tilt`, `stretch`, `trail`, `air`/`airSpread`, `drop` (the whole water surface moving
down/up after the recast), `reflection`; plus `LINE_POSES` (held, not tweened), splash and ripple
start times, and agitation impulses. Values are authored for a rod on the left and mirrored for the
right float. Only one float can bite at a time (the shader has a single event slot).

Notable facts from the original that are easy to get wrong:

- The float is yanked out **upside down** (body leading, tip trailing) and that drawing is held for two
  drawings; the line in that drawing is a separate straight line left of the float.
- Mid-air during the recast the float is almost upright with the tip up-right, and the line attaches to
  the far end of the speed line.
- After landing, the water itself drops ~85 px then rebounds; the float barely sinks (≤ 0.25 of its
  height). Measure the waterline per frame from where the reflection starts, never assume it is fixed.
- There is no splash on landing — only on the yank.
- The original draws no reflection during the yank; one is added there on purpose.

## Debugging and visual verification

- `?nf-t=<seconds>` freezes the scene at a loop time; add `&nf-bite=<floatIndex>:<seconds>` to freeze a
  bite drawing (e.g. `?theme=night-fishing&nf-t=2&nf-bite=1:3.334` is the left float landing; drawing = seconds × 12).
- Headless screenshots work with Playwright's `chrome-headless-shell` and SwiftShader:

  ```bash
  chrome-headless-shell --headless --hide-scrollbars --use-angle=swiftshader --enable-unsafe-swiftshader \
    --window-size=1920,1080 --virtual-time-budget=4000 --screenshot=out.png \
    "http://localhost:4321/?theme=night-fishing&nf-t=2&nf-bite=1:1.25"
  ```

- Always compare side by side with the original at the same scale (crop + `ffmpeg hstack`) and look at
  the images. Numeric checks (per-depth reflection coverage, fragment width/height/fill, per-layer IoU of
  the float after aligning both images to a canonical pose) catch regressions but did not catch the
  "geometric look" problems — those were only found visually.
- Reference numbers for the calm right float (reflection coverage by depth below the waterline, ±120 px
  window): 0–60 px ≈ 17%, 80–240 px ≈ 6–11%, 260–480 px ≈ 0–3%. Fragments: median width ≈ 44,
  height ≈ 14, fill (area / bbox) ≈ 0.73.

## Re-tracing the float shape

`float-shape.ts` was produced offline; redo it only if the shape needs to change:

1. Extract the calm frames of the shot at 12 fps and, for each frame, find the sub-pixel centroids of
   the tip core and the body core (cream pixels, split by vertical gap).
2. Rotate/translate every frame into a canonical upright pose (body-core centroid at the origin,
   tip–body distance ≈ 162.75 px), resample at 4× and average (~65 frames) to remove compression noise.
3. Threshold layers on the average: halo `R > 40`, silhouette `R > 145`, lit `R > 145 && G > 65`,
   cream `G > 150`. Mirror the lower right edge from the left edge where the animated foot glint
   merges in, and close the halo bottom with a half-ellipse where the waterline cuts it.
4. Marching squares → Ramer–Douglas–Peucker (split closed loops first) → light smoothing → convert to
   float-local coordinates (`y = 60 − v`, waterline at `y = 0`).

Both floats share the left float's contour: the right float's average was blurred into a bulbous tip by
per-frame tilt differences, while single original frames show the same slim tip on both floats.

## Tuning

Everything lives in `config.ts`. Keep every periodic component's cycle count an integer (or the loop
breaks), keep `REFLECTION.mirror` / `reach` monotonic, and note the uniform budget: the shader uses about
13 `vec4` uniforms (WebGL1 guarantees 16).

## Related notes

- BGM (`src/components/bgm-player.astro`) is mounted by the night-fishing theme, next to its theme switch. Default is muted, with the slider parked at 50%; nothing is stored until the visitor unmutes or moves the slider. Clicking the mute button turns sound on at that level. Actual gain is the slider value squared, so 50% plays at 0.25. The track title stays visible. There is no separate play/pause control. Switching to a theme without BGM pauses playback and does not change the saved preference. The first hop is a 302 without CORS headers, so the `<audio>` element must not set `crossorigin` and cannot be routed through Web Audio; iOS therefore cannot lower the volume (the slider is hidden there, and playback starts only from a user gesture).
- Known gaps: the landing ripple's main stroke is a bit thinner than the original, the mid-air reflection
  cluster is looser, portrait layouts have not been checked visually, and the line branch that connects
  the float to the main line during the recast is not drawn.
