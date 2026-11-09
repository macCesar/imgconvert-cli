# imgconvert-cli

Compress, convert, crop, resize and rename images from the terminal. Generate Android branding resources or fixed Titanium Alloy scale assets with dedicated commands.

**[Read the official documentation](docs/README.md)** for the full user guide, every CLI option, working examples and troubleshooting. This README is the project entry point. The manual describes this source checkout; an older npm release may not yet expose every documented option.

## Contents

- [Installation](#installation) and [quick start](#quick-start)
- [Command reference](#command-reference)
- [General image processing](#general-image-processing)
- [Presets and configuration](#presets-and-configuration)
- [Android branding](#android-branding)
- [Alloy multi-scale images](#alloy-multi-scale-images)
- [Shell completions](#shell-completions)
- [Migration](#migration-from-v2), [limits](#known-limitations) and [troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Installation

Requires Node.js 22.13.0 or later.

```bash
npm install -g imgconvert-cli
imgconvert --version
imgconvert --help
```

[Installation and source-checkout instructions](docs/guide/getting-started.md#install).

## Quick start

```bash
# Creates converted/photo.webp; preserves the source
imgconvert photo.jpg -f webp -q 80

# Creates a sibling photos-converted/ directory
imgconvert photos -f webp --concurrency 2

# Produces a 400x400 cropped thumbnail
imgconvert photo.jpg -w 400 --height 400 --fit cover -o thumbnails

# Pads or crops a canvas without scaling its pixels
imgconvert logo.png --canvas -w 1024 --height 1024 -o canvas

# Stages a complete Android branding set
imgconvert brand logo.svg --sdk android

# Generates fixed Android/iPhone scale variants
imgconvert alloy icon.png
```

Examples assume new destinations. Repeat with `--overwrite` only when replacing the existing outputs is intended. [Getting started](docs/guide/getting-started.md) explains the resulting files; [practical recipes](docs/guide/recipes.md) cover common delivery workflows.

## Command reference

| Command | Purpose | Documentation |
| --- | --- | --- |
| `imgconvert [source] [options]` | Convert/transform images | [Conversion flags](docs/guide/cli-reference.md#general-conversion) |
| `imgconvert alloy [source] [options]` | Titanium Alloy scale variants | [Alloy guide](docs/guide/alloy.md) |
| `imgconvert brand [master] [options]` | Android branding and legacy cleanup | [Branding guide](docs/guide/android-branding.md) |
| `imgconvert config init [--force]` | Create config | [Configuration](docs/guide/configuration.md) |
| `imgconvert config show` | Print combined config JSON | [Config reference](docs/guide/cli-reference.md#config) |
| `imgconvert completions [shell]` | Install shell completion | [Shell integration](docs/guide/automation.md#shell-completion) |
| `imgconvert completions print <shell>` | Print a completion script | [Completion reference](docs/guide/cli-reference.md#completions) |
| `imgconvert completions uninstall` | Remove installed completion scripts | [Completion reference](docs/guide/cli-reference.md#completions) |
| `imgconvert help [topic]` | Topic help | [Help reference](docs/guide/cli-reference.md#help) |

Use `imgconvert <command> --help` for installed options. Running with no arguments shows help. `-h` means help; `--height` means height; `-w` is the width alias.

## General image processing

General conversion supports JPEG/JPG, PNG, WebP, AVIF, TIFF and GIF files. Directories are nonrecursive; animations are processed as still images. SVG is accepted as a branding master. Read [the image processing guide](docs/guide/image-processing.md) for formats, quality, transparency and transform order.

### Options

The [complete flag reference](docs/guide/cli-reference.md#general-conversion) lists values, defaults, aliases and boolean negations.

### Paths and overwriting

Relative conversion output resolves beside the source: `imgconvert /work/photos -o optimized` writes to `/work/optimized`. Existing targets need `--overwrite`; collisions between two requested outputs are rejected even with that flag. [Files and batches](docs/guide/files-and-batches.md) covers paths, partial results and in-place updates.

### Resize strategies

Choose `cover` to fill/crop, `contain` to fit/pad, `inside` to fit without padding, `outside` to cover both bounds without final cropping, or `fill` to stretch. [Numeric examples and positions](docs/guide/image-processing.md#resize-strategies).

### Crop, trim, and canvas

Order is trim, crop, resize or canvas, then encoding. Crop coordinates refer to the trimmed result. Canvas preserves pixel scale and can crop smaller axes. [Transform guide](docs/guide/image-processing.md#transform-order).

### File naming and batch renaming

Use `--name` for one input or compose `enumerate`, `lowercase`, `replace-spaces`, `prefix:` and `suffix:` rules for a batch. [Naming examples and ordering](docs/guide/files-and-batches.md#file-naming).

## Presets and configuration

Built-in conversion presets are `web`, `print` and `thumbnail`. Custom recipes live in `.imgconverter.config.json` in the working directory. Precedence is explicit CLI > preset > top-level config > default. Null inherits; false/zero remain explicit subject to validation. [Configuration guide](docs/guide/configuration.md) includes the field schema, reusable recipes and debug examples. [Custom preset index](CUSTOM_PRESETS.md) preserves the earlier guide entry point.

## Android branding

`brand` accepts `--sdk android` and generates adaptive/legacy launchers, notifications, splash icons and marketplace artwork. Select categories, inspect a dry-run, then stage or write beneath a project. Existing files require overwrite permission. [Branding guide](docs/guide/android-branding.md).

### Brand options

[All brand flags and defaults](docs/guide/cli-reference.md#brand).

### Output and integration

SDK Android writes `app/src/main/res/` beneath the chosen output root. Marketplace artwork consists of `iTunesConnect.png` and `MarketplaceArtwork.png`. [File sizes, padding, alpha and integration](docs/guide/android-branding.md#generated-files-and-sizes). Legacy Titanium cleanup is a separate project deletion action described in the same guide.

## Alloy multi-scale images

`alloy` treats inputs as 4x masters on both platforms and produces five Android densities plus iPhone 1x/2x/3x images. It accepts configured sources, selected definitions and named groups. [Scale table, configuration and output bases](docs/guide/alloy.md).

## Shell completions

Bash, Zsh and Fish scripts derive options from Commander. Install, print or uninstall them with the `completions` command. [Paths, activation and dynamic preset/group completion](docs/guide/automation.md#shell-completion).

## Migration from v2

Use explicit subcommands for Alloy/branding, `--height` for height, and `config init` / `config show` for configuration. [Full migration table](docs/guide/troubleshooting.md#migration-from-older-commands).

## Known limitations

The supported public interface is the CLI. There is no public JavaScript import API, recursive discovery, animation preservation, arbitrary rotation or general background removal. [Capabilities and limits](docs/guide/troubleshooting.md#capabilities-and-limits).

### File safety migration

Existing destinations require `--overwrite`. `--in-place` updates the original only when name/format are retained; otherwise it creates a sibling. Effective output/replacement combinations fail. [Replacement semantics](docs/guide/files-and-batches.md#in-place-processing).

### Exit codes and batches

Processing returns 0 for success, 1 for invalid/planning/no-output failures, and 2 for partial output. [Script examples and status handling](docs/guide/automation.md#exit-codes).

## Troubleshooting

Use `--debug` on the processing command to inspect decisions and errors. [Troubleshooting](docs/guide/troubleshooting.md) explains paths, collisions, JSON, dimensions, alpha and performance.

## Contributing

```bash
git clone https://github.com/macCesar/imgconvert-cli.git
cd imgconvert-cli
npm ci
node index.js --help
npm run test:help
```

Run the subset covering a change, then applicable lint/static checks. [Testing guide](test/README.md) explains the isolated runner and suite selection. Source changes, compatibility notes and validation belong in a pull request; npm publication is a separate action.

## License

[MIT](LICENSE). [Report issues or request features](https://github.com/macCesar/imgconvert-cli/issues).
