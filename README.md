# Field watch studio

A small 3D watch customizer. Pick the case shape, metal, finish, bezel, dial, and strap. The preview updates in place. The link hash stores the build so it can be shared.

This is an original studio model and catalog. It follows the interaction pattern of the public Swatchmods configurator (case, bezel, dial, strap, night lume, display-back) and does not include that site's meshes, dial art, or names.

## Run

```bash
npm install
npm test
npm run dev
```

Open the printed local URL. `npm run build` writes a static site to `dist/`.

## What the public configurator actually is

`swatchmods.com/configure` is a Next.js page. The 3D tool is not drawn by that page. The page embeds one iframe:

`https://veizla.com/configurator/index.html#style=…`

Inside the frame, two custom elements do the work. Neither needs a framework.

1. `<swatch-configurator>` (`configurator.js`) fetches `config.json` from the same folder and draws the option chips. Picking an option writes the URL hash (`style`, `finish`, `case`, `dial`, `strap`, `bezel`, `mode`) and sets attributes on the viewer. A flat case photo plus a dial photo stays underneath as a fallback if WebGL cannot start.
2. `<swatch-watch-3d>` (`swatch-watch-3d.js`) is a Three.js scene: WebGLRenderer, GLTFLoader, OrbitControls, a room environment, and MeshPhysicalMaterial. One watch model contains every variant. Parts are found by name (`dial_rp`, `dial_ff`, `bracelet`, `strap`, `hand_hour`, `movement_balance`, and so on). The active case family is the only style group left visible.

The model file is not a plain `.glb` on that host. Treat it as their asset. This project replaces it with procedural parts so the same option pipeline can be reused on your own geometry.

## How a click becomes a different watch

`config.json` is the catalog. Prices and names live there. The 3D viewer only reads `look`:

| Choice | What changes in the scene |
| --- | --- |
| Case metal | `look.metal` and `look.polished` tint the brushed and polished slots. `satin` and `gloss` are roughness (0 mirror, 1 matte). |
| Finish | Brushed uses the satin roughness and a grain normal map. Polished uses the gloss roughness and drops the grain. |
| Bezel | Colour tints the insert. `aluminium` stays metallic. `ceramic` sets metalness to 0 and raises clearcoat. |
| Dial | `top` / `bottom` repaint a gradient texture. `frame` colors indices and hands. `lume` and `print` color the glowing plots and the text. A `sub` block shows the small seconds dial. |
| Strap | No `rubber` colour means the steel bracelet. A `rubber` hex hides the bracelet and tints the rubber mesh. |
| Shape | One case group per family (octagon, diver, chrono). Only the selected group is visible. Dials and bezels are filtered to that family. |

Colour and roughness lerp for about half a second. The hash is updated with `history.replaceState`, so the iframe does not reload.

Night mode turns down the environment and key light and raises the lume material's emissive intensity. The hands read the clock every frame. A balance wheel and rotor keep moving so the display back reads as a movement. The Movement button moves the camera to the back; it does not load a second model.

## Where that lives in this repo

- `src/config.js` — the catalog. Add a dial, metal, bezel, or strap here.
- `src/state.js` — hash parsing and `resolveLook`, the map from ids to material values.
- `src/scene.js` — the Three.js watch. One material per slot. `apply(state)` is the only input.
- `src/main.js` — chips, night, movement, and the hash.
- `test/resolve.test.js` — checks finish roughness, ceramic versus aluminium, and the strap swap.

To add a dial, append an object under `dials` with a unique `id`, a `swatch`, and a `look`. No mesh edit is required.

## Sharper bracelet and dial

The octagon is the integrated case: a wide eight-sided bezel, a hex screw on each corner, and a flat three-row bracelet that starts on the top and bottom flats. `buildIntegratedBracelet` sets the link width, height, and pitch. The diver and chrono keep `buildBracelet`, the narrower rounded links.

The dial print is a 2048 canvas in `createWatch` (`dialCanvas.width`). `paintDial` draws the sunburst, the minute track, and the words in units of that width, so raising the canvas (3072, 4096) stays sharp when you crop in. `anisotropy` is set to the GPU maximum so the texture holds up at an angle. Indices and hands stay meshes; they are what throws the shadow and the lume.

## Adding a case shape

`shapes` in `src/config.js` is the whole definition. `buildCase` reads it and builds one group per entry. Copy a block and change the numbers:

| Field | Meaning |
| --- | --- |
| `kind` | `circle` uses `radius`. `polygon` uses `sides` and `radius`, with a flat at 12, 3, 6, and 9. `rounded` uses `width`, `height`, and `corner`. |
| `opening` | Radius of the round hole the dial sits in. |
| `bezelOuter` / `bezelInner` | The insert. A polygon case uses a matching polygon ring. `bezelFollowsCase` paints that ring with the case metal and hides the bezel picker. |
| `lugReach` | How far the lugs sit from the center. The strap starts just past this. |
| `crownShift` | Extra push on the crown when the case is wider than the round one. |

`octagon` is the eight-sided case. `diver` and `chrono` are circles with their own dial families. The dial, hands, and movement are shared, so a new outline does not need a new face. A dial needs a `family` that matches the shape, or the chip list will not show it.
