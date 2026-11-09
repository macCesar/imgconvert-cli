# Image processing

[Documentation home](../README.md) · [All conversion options](cli-reference.md#general-conversion)

## Formats and quality

Use a single file or a directory as the source. General conversion discovers `.jpeg`, `.jpg`, `.png`, `.webp`, `.avif`, `.tiff` and `.gif` inputs, ignoring extension case. SVG masters belong to [`brand`](android-branding.md).

```bash
imgconvert photo.png -f webp -q 85
imgconvert photo.png -f jpg -b "#ffffff" -o jpeg-output
imgconvert photo.png -f all -o format-comparison
```

Without `--format`, the extension is preserved after conversion to lowercase. `jpg` and `jpeg` use the same encoder but produce the requested extension. `all` writes seven variants, including both `.jpg` and `.jpeg`.

| Output | Current encoder settings | Practical consideration |
| --- | --- | --- |
| JPEG/JPG | Quality 1-100; flatten alpha on the background | Use an explicit background when converting a transparent logo |
| PNG | Compression level 9, palette disabled | Lower quality is not a reliable way to reduce PNG size in this pipeline |
| WebP | Quality 1-100 | Compare size and visual detail on representative inputs |
| AVIF | Quality 1-100 | Encoding time and output size depend on content |
| TIFF | LZW compression | Quality is passed through, but LZW is the selected compression |
| GIF | GIF encoder; quality flag unused | Animation preservation is not enabled |

Default quality is 85, unless JSON or a preset supplies another value. Quality must be a full integer from 1 to 100. The number has different effects across codecs and is not a promised compression ratio.

## Transform order

Every image follows this order, regardless of the order of flags:

```text
input -> trim -> manual crop -> resize OR canvas -> encode
```

A crop rectangle refers to the result of trim. Canvas operates on the cropped image. Output names and destinations are planned before these stages execute.

```bash
imgconvert logo.png --trim --crop 10,10,200,100 --canvas -w 240 --height 140 -o framed-logo
```

This requires the trimmed image to contain a rectangle starting at `(10,10)` with size 200×100. It then pads that cropped region to 240×140 without changing its pixel scale. If the trimmed dimensions are unknown, inspect a separate trimmed output before choosing crop coordinates.

## Resize strategies

Suppose the source is 800×400 and you request `--width 300 --height 300`:

| `--fit` | Output size | What happens |
| --- | --- | --- |
| `contain` (default) | 300×300 | Scale to 300×150 and add padding |
| `cover` | 300×300 | Scale to 600×300 and crop horizontally |
| `fill` | 300×300 | Stretch; the aspect ratio changes |
| `inside` | 300×150 | Fit within the bounds; no padding |
| `outside` | 600×300 | Cover both bounds; no final crop |

```bash
imgconvert photo.jpg -w 300 --height 300 --fit contain -o contained
imgconvert photo.jpg -w 300 --height 300 --fit cover --position top -o covered
imgconvert photo.jpg -w 300 --height 300 --fit inside -o bounded
```

With only width or height, the other dimension follows the aspect ratio. Resizing may enlarge small images, including `inside` and `outside`. There is no public CLI flag to disable enlargement or reduction.

`--position` affects `cover` and `contain`; it does not change `fill`, `inside` or `outside`.

## Positions

| Canonical value | Meaning | Other accepted aliases |
| --- | --- | --- |
| `center` | Center on both axes | `centre` |
| `top` | Top, centered horizontally | `north` |
| `bottom` | Bottom, centered horizontally | `south` |
| `left` | Left, centered vertically | `west` |
| `right` | Right, centered vertically | `east` |
| `top-left` | Top left corner | `northwest`, `north-west`, `left-top` |
| `top-right` | Top right corner | `northeast`, `north-east`, `right-top` |
| `bottom-left` | Bottom left corner | `southwest`, `south-west`, `left-bottom` |
| `bottom-right` | Bottom right corner | `southeast`, `south-east`, `right-bottom` |

Hyphens, underscores and quoted spaces normalize to the same position. Position names are case insensitive. The aliases work for canvas as well as ordinary resizing. Unknown positions fail validation.

## Manual crop

```bash
imgconvert screenshot.png --crop 100,50,800,600 -o cropped
```

Coordinates are `left,top,width,height`, measured in pixels from the top left. Origins must be non-negative integers; dimensions must be positive integers. The whole rectangle must fit inside the current image, after trim if selected. Decimal coordinates and out-of-bounds rectangles fail.

To crop then scale the extracted region:

```bash
imgconvert screenshot.png --crop 100,50,800,600 -w 400 --height 300 -o cropped-small
```

The crop is 800×600; the final output is 400×300.

## Trim borders

```bash
imgconvert logo.png --trim -o trimmed
```

Trim removes borders detected from edge color or transparency using Sharp's default behavior. It does not detect a subject or remove a complex background. Inspect the result if edge colors resemble the artwork.

Trim changes the origin and dimensions used by a subsequent crop. For an unfamiliar master, first write a trimmed output and inspect it; then use its coordinates in the next command.

## Canvas without scaling

```bash
imgconvert screenshot.png --canvas --height 2688 --position top -o tall-canvas
```

Canvas changes the available area while retaining pixel scale. An omitted dimension keeps its size after previous stages. A larger axis adds padding; a smaller axis crops pixels. Each axis is handled independently:

```bash
imgconvert photo.png --canvas -w 1000 --height 200 --position top-left -o mixed-canvas
```

For an 800×400 source, this adds 200 pixels on the right and removes 200 from the bottom. `--fit` is ignored in canvas mode. `--position` controls which edges are kept and where padding appears.

## Backgrounds and transparency

Default padding is transparent for PNG, WebP, AVIF and TIFF; it is white for other outputs. JPEG always flattens existing transparency on white unless you supply `--background`.

```bash
imgconvert logo.png --canvas -w 512 --height 512 -b transparent -o transparent-canvas
imgconvert logo.png -w 512 --height 512 --fit contain -b "#0B1326" -o dark-padding
imgconvert logo.png -f jpg -b "#ffffff" -o opaque-jpeg
```

For formats that preserve alpha, a background fills newly added padding; it does not make all existing transparent pixels opaque.

Accepted general background forms:

| Form | Example |
| --- | --- |
| Hex RGB/RGBA | `"#fff"`, `"#ffff"`, `"#ffffff"`, `"#ffffff80"` |
| Integer RGB | `"rgb(255,0,0)"` |
| RGB with alpha from 0 to 1 | `"rgba(255,0,0,0.5)"` |
| Common name | `white`, `black`, `red`, `green`, `blue`, `yellow`, `cyan`, `magenta`, `gray`, `grey`, `transparent` |

RGB channels range from 0 to 255. Quote hex colors so the shell does not interpret `#` as a comment. Branding's `--bg-color` has a stricter [six-digit hex contract](android-branding.md#padding-and-background).

## Metadata and scope

Conversion re-encodes the image. It does not promise byte identity, metadata preservation or preservation of animated frames. There are no public options for rotation, automatic orientation correction, EXIF editing or a DPI override. Keep the source when those properties matter and inspect your target output.

Next: [Files, naming and batches](files-and-batches.md).
