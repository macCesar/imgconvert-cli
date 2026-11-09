# Configuration and presets

[Documentation home](../README.md) · [Alloy configuration](alloy.md#configured-sources-and-groups)

## Config location and commands

The CLI reads `.imgconverter.config.json` from the directory where you run it. It does not search parent directories or discover a config beside an arbitrary input path. This file is a per-working-directory configuration; "global" settings below mean its top-level options, not a machine-wide home-directory file.

```bash
imgconvert config init
imgconvert config show
imgconvert config init --force
```

`init` writes defaults and preset templates. If the file exists, it leaves it unchanged unless you use `--force`. `show` prints defaults merged with the current file and preset map as JSON, with no progress text. It does not select a command/preset, resolve relative paths or show all effective command-specific decisions.

`brand` is configured through its own CLI flags; it does not read the general conversion preset settings from this JSON file.

## Resolution order

General conversion resolves each option independently:

```text
explicit CLI option > selected preset > top-level config > built-in default
```

A value of `null` means unspecified and allows inheritance. `false` and `0` remain explicit values, subject to the option's validation. For example, quality 0 and width 0 still fail because their ranges start at 1.

```json
{
  "quality": 90,
  "canvas": true,
  "presets": {
    "hero": {
      "quality": null,
      "width": 1200,
      "height": 630,
      "fit": "cover",
      "canvas": false,
      "format": "webp"
    }
  }
}
```

With this file:

```bash
imgconvert photo.jpg -p hero
imgconvert photo.jpg -p hero -q 75 -o hero-75
```

The first uses quality 90, because the preset's null inherits it. It uses ordinary resizing because the preset's `canvas: false` overrides top-level `true`. The second uses quality 75 from the CLI.

For conversion, input selection is positional source > preset source > top-level source. Running `imgconvert` with no arguments always shows help; select a source-bearing preset with `imgconvert -p name` to execute it.

## Built-in presets

| Name | Settings |
| --- | --- |
| `web` | `format: "webp"`, quality 80, fit cover, center position |
| `print` | `format: "tiff"`, quality 100, fit contain |
| `thumbnail` | PNG, 150×150, quality 60, fit cover, center position |

`web` does not impose a width/height. `print` does not set a physical paper size or a DPI value. The config templates also contain `alloy` and the legacy `ti-branding` entry. Use their [public subcommands](cli-reference.md#commands); selecting those names at the conversion root does not dispatch branding or scale generation.

A custom preset with a built-in name replaces the whole built-in recipe. This is not a deep merge:

```json
{
  "presets": {
    "thumbnail": {
      "quality": 90
    }
  }
}
```

This definition removes the built-in 150×150 dimensions and PNG format. Other values inherit from top-level configuration/defaults. It is no longer a complete thumbnail recipe.

## Supported conversion fields

Use JSON booleans and numbers, not quoted `"false"` or strings with units.

| JSON key | CLI equivalent | Default / accepted value |
| --- | --- | --- |
| `source` | Positional source | Null; file or directory path |
| `output` | `--output` | Null; [source-relative destination rules](files-and-batches.md#output-paths) |
| `format` | `--format` | Null; preserve extension, or a supported format / `all` |
| `quality` | `--quality` | 85; integer 1-100 |
| `width`, `height` | `--width`, `--height` | Null; positive integers |
| `fit` | `--fit` | `contain`; cover/contain/fill/inside/outside |
| `position` | `--position` | `center`; [accepted positions](image-processing.md#positions) |
| `crop` | `--crop` | Null; `"left,top,width,height"` |
| `background` | `--background` | Null; [accepted colors](image-processing.md#backgrounds-and-transparency) |
| `canvas` | `--canvas` | False |
| `trim` | `--trim` | False |
| `name` | `--name` | Null; single input only |
| `rename` | `--rename` | Null; comma-separated strategies |
| `inPlace` | `--in-place` | False |
| `overwrite` | `--overwrite` | False |
| `concurrency` | `--concurrency` | `min(4, availableParallelism())`; positive integer |
| `presets` | `--preset` selects an entry | Object mapping names to complete recipe objects |

The legacy key `replace-originals` normalizes to `inPlace`. Do not put contradictory replacement aliases in the same object. `{"inPlace": true, "replace-originals": false}` is invalid.

JSON keys use the spelling in this table: `inPlace`, not a presumed general rule of copying every hyphenated CLI option. Branding keys such as padding and SDK are not part of this conversion schema.

## Disable inherited booleans

```bash
imgconvert photo.png -p hero --no-canvas --no-trim --no-in-place --no-overwrite
```

Each `--no-*` is explicit CLI input, so it wins over a preset or top-level true value. Null does not disable an inherited boolean. Use `false` in a preset to do that.

## A repeatable team recipe

Create `photos/raw/` and place images there. Save this as the config in the project root:

```json
{
  "concurrency": 2,
  "presets": {
    "product": {
      "source": "photos/raw",
      "output": "optimized",
      "width": 800,
      "height": 800,
      "fit": "contain",
      "position": "center",
      "format": "webp",
      "quality": 80,
      "background": "#ffffff",
      "rename": "lowercase,replace-spaces"
    }
  }
}
```

```bash
imgconvert -p product
imgconvert -p product --overwrite
```

From `/work/shop`, the source is `/work/shop/photos/raw` and output is `/work/shop/photos/optimized`. It is beside `raw`, not beside the config. To change the destination for a run, pass an absolute `-o` or the appropriate source-relative path.

Commit portable recipes with the project so teammates use the same settings. Keep different output directories for different recipes. Enable overwrite deliberately for repeated builds instead of making it a blanket top-level default when people also run ad hoc commands.

## Debug configuration

```bash
imgconvert photo.jpg -p web --debug
imgconvert alloy --group icons --debug
```

Debug output includes effective options and value origins, plus absolute planned source/destination paths. General conversion also prints detailed processing information; Alloy reports resolved options per platform/group. `config show` answers what is in the combined configuration, while debug answers what an operation will use.

Malformed JSON, a malformed selected preset, an unknown preset or invalid effective values fail. Comments and trailing commas are not accepted in JSON. There is no `--config <path>` flag.
