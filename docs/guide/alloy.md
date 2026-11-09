# Titanium Alloy scale assets

[Documentation home](../README.md) · [Alloy option reference](cli-reference.md#alloy)

## Generate from a 4x master

```bash
imgconvert alloy icon.png
```

`alloy` produces Android density variants and iPhone 1x/2x/3x application images. It treats the input as a 4x master on both platforms. This is different from [`brand`](android-branding.md), which generates launcher layers, splash and notification artwork.

For a 400×200 input:

| Platform | Scale/directory | Output size |
| --- | --- | --- |
| Android | `res-mdpi` / 1x | 100×50 |
| Android | `res-hdpi` / 1.5x | 150×75 |
| Android | `res-xhdpi` / 2x | 200×100 |
| Android | `res-xxhdpi` / 3x | 300×150 |
| Android | `res-xxxhdpi` / 4x | 400×200 |
| iPhone | 1x | 100×50 |
| iPhone | 2x | 200×100 |
| iPhone | 3x | 300×150 |

Each dimension is rounded from `source / 4 × scale`, with a minimum of one pixel. Factors are fixed; there is no CLI `--width`/`--height` or customizable scale map. A 400-pixel iPhone input produces a largest 3x variant of 300 pixels, not 400.

## Filenames and directories

With default platform definitions and PNG input:

```text
app/assets/android/images/res-mdpi/icon.png
app/assets/android/images/res-hdpi/icon.png
app/assets/android/images/res-xhdpi/icon.png
app/assets/android/images/res-xxhdpi/icon.png
app/assets/android/images/res-xxxhdpi/icon.png
app/assets/iphone/images/icon.png
app/assets/iphone/images/icon@2x.png
app/assets/iphone/images/icon@3x.png
```

Default quality is 85, and the input format is preserved with a lowercase extension. Use platform/group settings or explicit CLI options to choose a format/quality. `-f all` generates all seven supported extensions for each scale.

```bash
imgconvert alloy icon.png -f webp -q 80
```

Supported inputs/discovery are the same raster extensions as general conversion. A directory is nonrecursive. Inputs are counted separately from generated variants; one image producing eight scale files is one processed input. If the same input is configured for multiple platforms, its variants share one queued input task.

## Output base and subfolders

The base is selected as follows:

1. Effective `--output` / top-level or selected-preset output, with explicit CLI taking priority.
2. Otherwise, the working directory if it contains `tiapp.xml`.
3. Otherwise, each input file's directory.

A relative output base resolves from each input file's directory. This differs from general conversion's directory-input rule:

| Command | Input files | Relative `-o optimized` resolves to |
| --- | --- | --- |
| `imgconvert /work/icons -o optimized` | `/work/icons/icon.png` | `/work/optimized/` |
| `imgconvert alloy /work/icons -o optimized` | `/work/icons/icon.png` | `/work/icons/optimized/` as base |

Alloy then appends `app/assets/<platform>/images/…`. To target one known project from different source locations, use an absolute output base:

```bash
imgconvert alloy /work/masters -o /work/MyTitaniumApp
```

A platform's JSON `output` is a subfolder inside its scale image directories, not another project base. For example, Android `"output": "icons"` produces `app/assets/android/images/res-mdpi/icons/icon.png`.

## Configured sources and groups

`alloy` reads `presets.alloy` by default. Both formats below are supported.

A single definition can place platform objects directly under the preset:

```json
{
  "presets": {
    "alloy": {
      "android": { "source": "masters", "output": "icons", "format": "webp" },
      "iphone": { "source": "masters", "output": "icons", "format": "png" }
    }
  }
}
```

```bash
imgconvert alloy -o /work/MyTitaniumApp
```

No positional source is required when the selected platforms have configured sources. One platform alone is also valid; omitted platforms are not generated. A platform source takes precedence over the positional source. Group/preset sources can also supply a source, then the positional argument/top-level source provide fallbacks. Configured relative sources resolve from the working directory.

For several asset sets, use named groups:

```json
{
  "concurrency": 2,
  "presets": {
    "mobile-assets": {
      "quality": 85,
      "cards": {
        "quality": 80,
        "android": { "source": "masters/cards", "output": "cards", "format": "webp" },
        "iphone": { "source": "masters/cards", "output": "cards", "format": "png" }
      },
      "icons": {
        "android": { "source": "masters/icons", "output": "icons", "format": "png" },
        "iphone": { "source": "masters/icons", "output": "icons", "format": "png" }
      }
    }
  }
}
```

```bash
# Run every group in this definition
imgconvert alloy -p mobile-assets -o /work/MyTitaniumApp

# Run only its icons group
imgconvert alloy -p mobile-assets --group icons -o /work/MyTitaniumApp
```

Use one shape per preset: either direct platform objects or named platform groups. `--group` selects a named group; an unknown name fails. `-p mobile-assets` selects that definition rather than silently continuing to use `presets.alloy`.

## Quality, format and overwrite policy

Per-platform values resolve as:

```text
explicit CLI > platform > group > selected preset > top-level config > default
```

For the grouped recipe above, Android cards use WebP, iPhone cards use PNG, and both use group quality 80. `-q 95` overrides quality for every selected platform. Null inherits, while an explicit `overwrite: false` at platform level can disable broader JSON overwrite permission. An explicit CLI `--overwrite` wins over that setting.

All selected destinations are planned together. Collisions between platforms/groups or two inputs block the command before writing, even with `--overwrite`. Separate group output subfolders help keep names distinct. Existing targets require effective overwrite permission:

```bash
imgconvert alloy -p mobile-assets --group icons -o /work/MyTitaniumApp --overwrite
```

Use `--no-overwrite` to disable JSON overwrite permission, or `--debug` to inspect resolved options and paths. [Concurrency and partial-result rules](files-and-batches.md#concurrency) apply to Alloy too. It does not accept `--dry-run`, branding flags, rename strategies or a replacement flag.
