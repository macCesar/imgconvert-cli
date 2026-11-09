# Practical recipes

[Documentation home](../README.md) · [Configuration](configuration.md)

Each recipe assumes compatible existing inputs and a fresh output destination. Repeating one may require `--overwrite`. Paths below are relative to the directory where you run the commands unless the [output rules](files-and-batches.md#output-paths) say otherwise.

## Web photos with a width limit

```bash
imgconvert photos -f webp -q 80 -w 1600 --concurrency 2 -o web-images
```

A source directory `photos/` produces a sibling `web-images/`. Width-only resizing keeps the aspect ratio but may enlarge smaller inputs. Compare a representative output before running a large collection.

## Exact social/banner dimensions

```bash
imgconvert photo.jpg -f webp -w 1200 --height 630 --fit cover --position top --name social-card -o social
```

Produces `social/social-card.webp` at 1200×630. The top anchor is useful when a centered crop would cut off content near the top; inspect the crop rather than assuming it detects a face.

## Product cards without cropping

```bash
imgconvert products -f webp -w 800 --height 800 --fit contain -b "#ffffff" --rename "lowercase,replace-spaces" -o product-cards
```

Every output is 800×800 with the full image fitted inside and white padding. Existing transparent parts of WebP remain transparent; white fills added padding. If you need all transparency flattened by this public pipeline, JPEG is an available output choice:

```bash
imgconvert products -f jpg -w 800 --height 800 --fit contain -b "#ffffff" -o product-cards-jpeg
```

## Transparent logo canvas

```bash
imgconvert logo.png --trim -o trimmed
imgconvert trimmed/logo.png --canvas -w 1024 --height 1024 -b transparent -o canvas
```

The second output is `trimmed/canvas/logo.png` because relative output resolves beside its source file. This preserves pixel scale. If the trimmed logo is larger than 1024 on an axis, canvas crops that axis; ordinary `contain` is more appropriate when the artwork must be scaled to fit.

## Consistent screenshot height

```bash
imgconvert screenshots --canvas --height 2688 --position top -o screenshot-canvases
```

Widths stay unchanged. Short images get bottom padding; taller images lose pixels from the bottom. This does not guarantee any store's complete screenshot requirements; inspect dimensions and content for your target use.

## A crop with known coordinates

```bash
imgconvert screenshot.png --crop 40,80,1000,600 -w 500 --height 300 -f webp -o cropped
```

Requires an input at least 1040 pixels wide and 680 high. It extracts 1000×600 from `(40,80)`, then scales to 500×300. If you add trim, recalculate coordinates for the trimmed image.

## Resolve same-basename collisions

```bash
imgconvert catalog -f webp --rename "enumerate,lowercase,replace-spaces" -o catalog-web
```

Enumeration distinguishes `product.jpg` and `product.png`. It retains the original basename, producing names such as `001-product.webp`. It does not rename inputs.

## Compare formats for one master

```bash
imgconvert master.png -f all -q 85 -o comparisons
```

Produces seven files. Compare appearance, dimensions and byte size; an equal quality number across formats is not an equal visual-quality guarantee. Both JPEG extensions are included for compatibility.

## Resize an original, or create a sibling

```bash
# Replace the same PNG after resizing
imgconvert photo.png --in-place -w 800

# Create a sibling WebP and keep the PNG
imgconvert photo.png --in-place -f webp
```

The first changes your source. Use a copy or version control if you will need its original pixels. An existing sibling WebP requires `--overwrite`; `--in-place -o other-directory` is invalid.

## Two repeatable delivery sizes

Save this config, then place the inputs in `photos/`:

```json
{
  "presets": {
    "hero": {
      "width": 1200,
      "height": 630,
      "fit": "cover",
      "format": "webp",
      "quality": 85,
      "output": "hero-images"
    },
    "email": {
      "width": 600,
      "height": 200,
      "fit": "cover",
      "format": "jpg",
      "quality": 75,
      "background": "#ffffff",
      "output": "email-images"
    }
  }
}
```

```bash
imgconvert photos -p hero
imgconvert photos -p email
```

Outputs use separate sibling directories, so both delivery sets coexist. To produce a different quality for an isolated experiment:

```bash
imgconvert photos -p hero -q 70 -o hero-quality-70
```

## Android resource review

```bash
imgconvert brand logo.svg --sdk android --adaptive --notification --monochrome-master silhouette.png --dry-run
imgconvert brand logo.svg --sdk android --adaptive --notification --monochrome-master silhouette.png
```

The first validates masters and previews paths. The second writes the selected resources under `.ti-branding/app/src/main/res/`. Review the artwork and [integrate it into the app](android-branding.md#preview-overwrite-and-integrate).

## Opaque marketplace artwork with no extra margin

```bash
imgconvert brand logo.svg --sdk android --marketplace --artwork-padding 0 --bg-color "#FFFFFF" -o store-artwork
```

Writes the two marketplace PNGs with alpha flattened onto white. A nonsquare logo still has unused area on its shorter axis to preserve aspect ratio; zero padding does not stretch it to a square.

## Alloy assets into an explicit project

```bash
imgconvert alloy masters -o "$PWD/MyTitaniumApp" --concurrency 2
```

Every input is a 4x master. The absolute base avoids ambiguity when the inputs are configured in several directories. For a grouped JSON definition, use `-p <definition> --group <group>` as shown in [Alloy configuration](alloy.md#configured-sources-and-groups).
