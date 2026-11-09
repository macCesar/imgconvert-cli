# Custom presets

This guide describes conversion presets and Alloy configuration in v3. Read the [main command reference](README.md) for every option and current implementation limitations.

## Create and select a preset

Run `imgconvert config init` in your working directory, then edit `.imgconverter.config.json`. The file must be strict JSON: comments and trailing commas are invalid. `config init --force` overwrites existing content.

```json
{
  "quality": 85,
  "presets": {
    "social-square": {
      "width": 1080,
      "height": 1080,
      "fit": "cover",
      "position": "center",
      "quality": 85,
      "format": "jpeg",
      "background": "#ffffff"
    },
    "product": {
      "source": "photos/raw",
      "output": "optimized",
      "width": 800,
      "height": 800,
      "fit": "contain",
      "quality": 80,
      "format": "webp",
      "background": "#ffffff",
      "rename": "lowercase,replace-spaces"
    },
    "blog-hero": {
      "width": 1200,
      "height": 630,
      "fit": "cover",
      "position": "top",
      "quality": 85,
      "format": "webp"
    },
    "email-header": {
      "width": 600,
      "height": 200,
      "fit": "cover",
      "quality": 75,
      "format": "jpeg"
    },
    "numbered-thumbs": {
      "width": 200,
      "height": 200,
      "fit": "cover",
      "format": "webp",
      "rename": "prefix:gallery-,enumerate,suffix:-thumb"
    },
    "print-page": {
      "width": 2480,
      "height": 3508,
      "fit": "contain",
      "format": "tiff",
      "quality": 100
    }
  }
}
```

```bash
imgconvert photo.jpg -p social-square
imgconvert -p product
imgconvert other-photos -p product --quality 95
imgconvert banner.png -p blog-hero
imgconvert photos -p numbered-thumbs
```

The numbered preset creates names such as `gallery-001-photo-thumb.webp`. `print-page` specifies pixel dimensions, not a physical paper size or a DPI setting.

## Fields, precedence, and paths

Conversion presets support `source`, `output`, `quality`, `width`, `height`, `format`, `fit`, `position`, `crop`, `background`, `trim`, `name`, `rename`, and `replace-originals`. Omitted values fall back to global config/defaults. Explicit CLI options win over presets. `null` is an explicit preset value and prevents inheritance for that field.

A preset with the same name as a built-in replaces its whole definition; it does not extend it. For example, redefining `thumbnail` with only `quality` removes its built-in dimensions/format. Unknown preset names currently fall back silently, so check spelling.

The file is read from the current working directory. Relative `source` is relative to that directory; relative `output` resolves beside the selected source. For example, from `/work/site`, the `product` preset above reads `/work/site/photos/raw` and writes `/work/site/photos/optimized`, not `/work/site/optimized`. To target another location, choose the appropriate source-relative path or an absolute output path.

An explicit source overrides preset/global source. A preset source overrides the global source. `config show` shows the merged config, not the effective options of a selected preset.

For single-file presets, `name` is a basename without an extension. For directory inputs use `rename`; `name` is rejected. Existing destination files are overwritten.

## Canvas and transparency

Config/preset `canvas: true` is not applied in v3. Pass the flag explicitly:

```json
{
  "presets": {
    "icon-canvas": {
      "width": 512,
      "height": 512,
      "format": "png",
      "background": "transparent",
      "position": "center"
    }
  }
}
```

```bash
imgconvert logo.png -p icon-canvas --canvas
```

Canvas adds padding or crops without scaling; it can remove content if dimensions are smaller than the input. Ordinary resizing uses `fit`. `contain` uses padding; `cover` fills and crops; `inside` fits without padding. Inside/outside can both enlarge or shrink.

A background fills padding; existing PNG/WebP alpha is preserved. JPEG flattens alpha. `trim` removes edge-colored/transparent borders before cropping/resizing. Avoid combining trim and manual pixel coordinates without checking the intermediate image.

`replace-originals` is a legacy config key, but in-place replacement is currently incomplete; use an explicit output directory. There are no `--no-*` switches to disable true booleans inherited from config.

## Alloy configuration

Alloy uses `presets.alloy`, rather than a root conversion preset. Pass a source argument even when platform sources are configured:

```json
{
  "output": "/work/my-app",
  "presets": {
    "alloy": {
      "quality": 85,
      "cards": {
        "android": { "source": "assets/cards", "output": "cards", "format": "webp" },
        "iphone": { "source": "assets/cards", "output": "cards", "format": "png" }
      },
      "icons": {
        "quality": 90,
        "android": { "source": "assets/icons", "output": "icons" },
        "iphone": { "source": "assets/icons", "output": "icons" }
      }
    }
  }
}
```

```bash
imgconvert alloy assets/cards
```

This processes all groups; each platform source takes priority over the positional source. A single configuration can instead place `android` and `iphone` directly under `alloy`. Keep both platform objects in the single-configuration structure.

Global `output` above is the absolute project base. Platform `output` is a subfolder inside `app/assets/android/images/res-*/` or `app/assets/iphone/images/`. Platform quality/format takes precedence over group values, then Alloy-wide values, then global/default settings.

Every source is a 4× master: a 400-pixel image yields Android widths 100/150/200/300/400 and iPhone widths 100/200/300. Scale factors are fixed; a JSON `scales` field does not override them.

The CLI currently always reads platform definitions from `presets.alloy`. A custom `alloy -p other-key` does not select a separate platform definition, `-o` can be lost during precedence handling, and `alloy:group` does not select a group in v3. Configure the JSON shown above to avoid these option-handling problems. See [Alloy reference](README.md#alloy-multi-scale-images) for output paths and default base selection.

## Reuse across a team

Commit the JSON configuration with the project when paths are portable. Run several presets as separate commands:

```bash
imgconvert photos -p blog-hero
imgconvert photos -p email-header
```

Choose different output directories for variants to prevent overwriting. Validate a few representative images before processing a large directory. Use `imgconvert help presets`, `imgconvert config show`, and `--debug` to inspect settings.
