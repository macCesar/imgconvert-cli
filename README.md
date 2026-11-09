# imgconvert-cli

Compress, convert, crop, resize, and rename images from the terminal. Generate Android branding assets or Titanium Alloy multi-scale images with dedicated subcommands.

This guide describes v3.0.0. See [migration from v2](#migration-from-v2) before reusing older commands, and [known limitations](#known-limitations) for options whose implementation is incomplete.

## Contents

- [Installation](#installation) and [quick start](#quick-start)
- [Command reference](#command-reference)
- [General image processing](#general-image-processing)
- [Presets and configuration](#presets-and-configuration)
- [Android branding](#android-branding)
- [Alloy multi-scale images](#alloy-multi-scale-images)
- [Shell completions](#shell-completions)
- [Migration from v2](#migration-from-v2)
- [Known limitations](#known-limitations) and [troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Installation

```bash
npm install -g imgconvert-cli
imgconvert --version
imgconvert --help
```

Use a Node.js version supported by the installed dependencies. Sharp 0.33.5 requires `^18.17.0 || ^20.3.0 || >=21.0.0`; Commander 12 requires Node 18+. The package's own `node >=14` declaration is outdated. Development with Mocha 11 requires `^18.18.0 || ^20.9.0 || >=21.1.0`. This checkout was validated on Node 22.

## Quick start

```bash
# Convert a file; creates ./converted/photo.webp
imgconvert photo.jpg -f webp -q 80

# Convert the immediate image files in a directory; creates ./photos-converted/
imgconvert photos -f webp

# Square thumbnail, crop anchored at the top
imgconvert portrait.jpg --width 400 --height 400 --fit cover --position top

# Extract a region, then scale it
imgconvert photo.jpg --crop 100,50,800,600 --width 400 --height 300

# Change canvas size without scaling the original pixels
imgconvert logo.png --canvas --width 1024 --height 1024

# Android branding, staged for review
imgconvert brand logo.svg --sdk android

# Titanium Alloy assets
imgconvert alloy icon.png

# Create a config in the current directory
imgconvert config init
```

## Command reference

| Command | Purpose |
| --- | --- |
| `imgconvert [source] [options]` | General image processing; source may come from config or a preset |
| `imgconvert brand [master] [options]` | Android branding; master optional only for cleanup |
| `imgconvert alloy <source> [options]` | Titanium Alloy multi-scale images; source argument required |
| `imgconvert config init [--force]` | Create config; keep an existing file unless forced |
| `imgconvert config show` | Print defaults merged with the current config as JSON |
| `imgconvert completions [bash\|zsh\|fish]` | Install completions; interactive if shell omitted |
| `imgconvert completions print <shell>` | Print a completion script without installing it |
| `imgconvert completions uninstall` | Remove installed completion files and the managed zsh block |
| `imgconvert help [topic]` | List topics or explain crop, resize, rename, presets, brand, alloy |

Run `imgconvert <command> --help` for command-specific options. `-h` / `--help` shows help; `-v` / `--version` shows the version. Options belong after the subcommand they configure. General conversion flags do not configure `brand` or `alloy`.

## General image processing

```bash
imgconvert [source] [options]
```

Source is one image file or a directory. Directory processing is not recursive: subdirectories and unsupported extensions are skipped. Supported input extensions are `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.tiff`, `.gif` (case-insensitive). SVG input is supported by `brand`, not general conversion. Animated inputs are opened without Sharp's animation option; do not use this command to preserve animation.

### Options

| Option | Meaning | Default |
| --- | --- | --- |
| `-f, --format <format>` | `jpg`, `jpeg`, `png`, `webp`, `avif`, `tiff`, `gif`, `all` | Preserve input format |
| `-q, --quality <n>` | Quality 1 to 100; effect depends on encoder | 85 |
| `-b, --background <color>` | Padding color; also flattens transparency for JPEG | Transparent padding for PNG/WebP/AVIF/TIFF; white otherwise |
| `--width <n>` | Positive output width in pixels | Automatic |
| `--height <n>` | Positive output height in pixels | Automatic |
| `--fit <strategy>` | `contain`, `cover`, `fill`, `inside`, `outside` | `contain` |
| `--position <position>` | Anchor for cover, contain, or canvas | `center` |
| `--crop <left,top,width,height>` | Extract region in pixels before resize | None |
| `--canvas` | Pad/crop canvas without scaling | Off |
| `--trim` | Auto-trim borders using Sharp's edge detection | Off |
| `-n, --name <name>` | Output basename without extension; single file only | Input basename |
| `--rename <strategies>` | Comma-separated batch naming rules | None |
| `-o, --output <dir>` | Output directory | See paths below |
| `--replace` | Accepted flag; currently still writes to output directory | See known limitations |
| `-p, --preset <name>` | Built-in conversion preset or custom preset | None |
| `-d, --debug` | Detailed processing diagnostics | Off |
| `-h, --help` | Show help | N/A |
| `-v, --version` | Show version | N/A |

`--replace-originals` is a hidden compatibility alias for `--replace`. Neither currently provides reliable in-place replacement. Width has no `-w` alias in v3. Use `--height` for height.

Format names are lowercase. Without `-f`, the original extension is preserved after normalization to lowercase. Explicit `-f jpeg` produces `.jpeg`, while `-f jpg` produces `.jpg`. `-f all` emits all seven extensions, including both `.jpg` and `.jpeg`.

Quality is an encoder setting, not a guaranteed percentage reduction or visual score. GIF ignores it; TIFF uses LZW and PNG uses compression level 9 without palette quantization. Output may be larger than the input. Processing speed and size reduction depend on the input and settings.

### Paths and overwriting

| Input | Default output |
| --- | --- |
| `/work/photo.jpg` | `/work/converted/photo.jpg` |
| `/work/photos/` | `/work/photos-converted/` |
| `/work/photos/` with `-o optimized` | `/work/optimized/` |
| `/work/photo.jpg` with `-o optimized` | `/work/optimized/` |

Relative `output` paths resolve beside the source file or source directory, including values from presets/config. Absolute paths are used as-is. Input paths are resolved from the current working directory. Missing output directories are created.

Existing destination filenames are overwritten without confirmation. Different inputs with the same basename can collide after conversion or renaming; use separate destinations or enumeration. Processing a file re-encodes it even when the format stays the same. The output may have different bytes and metadata.

### Resize strategies

With only width or height, the other dimension follows the aspect ratio. With both dimensions:

| Strategy | Result |
| --- | --- |
| `contain` | Fit the whole image into the exact canvas; pad unused space |
| `cover` | Fill the exact canvas, cropping excess |
| `fill` | Stretch to exact dimensions; may distort |
| `inside` | Fit within both bounds, preserving aspect ratio; no padding |
| `outside` | Cover both bounds, preserving aspect ratio; one dimension may exceed its bound |

Both `inside` and `outside` can enlarge or shrink. The CLI has no option to prevent enlargement or reduction.

Canonical positions: `center`, `top`, `bottom`, `left`, `right`, `top-left`, `top-right`, `bottom-left`, `bottom-right`. Quoted forms such as `"top left"` and underscore forms work too. Invalid positions fall back to center. Additional compass aliases work for ordinary resizing, but use canonical positions for canvas operations.

```bash
imgconvert photo.jpg --width 800 --height 600 --fit inside
imgconvert photo.jpg --width 400 --height 400 --fit cover --position top-left
imgconvert photo.png --width 800 --height 600 --fit contain -b "#ffffff"
```

### Crop, trim, and canvas

Processing order is trim → manual crop → resize/canvas → encoding. Use non-negative integer crop origins and positive integer dimensions that fit within the image. `--crop 100,50,800,600` extracts an 800×600 region beginning at x=100, y=50.

`--trim` uses Sharp's default trim behavior based on edge color/transparency. It is not object detection or background removal. For predictable coordinates, perform trim, manual crop, and canvas operations in separate runs when combining them.

`--canvas` retains the image's pixel scale. Larger dimensions add padding; smaller dimensions remove pixels. An omitted dimension stays at its original size. `--position` anchors the image on each axis; `--fit` does not control canvas mode.

```bash
imgconvert logo.png --trim
imgconvert shot.png --canvas --height 2688 --position top
imgconvert logo.png --canvas --width 1200 --height 800 -b "rgba(255,0,0,0.5)"
```

For padding, supported color forms include `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `rgb(...)`, `rgba(...)`, and common names (`white`, `black`, `red`, `green`, `blue`, `yellow`, `cyan`, `magenta`, `gray`, `grey`, `transparent`). Quote colors, especially hex values and values containing spaces. Background color fills padding; it does not flatten existing alpha in PNG/WebP. JPEG always flattens alpha, using white unless a background is provided.

### File naming and batch renaming

```bash
imgconvert photo.jpg --name hero-banner -f webp
imgconvert photos --rename "lowercase,replace-spaces,prefix:web-" -f webp
imgconvert photos --rename "prefix:gallery-,enumerate,suffix:-small"
```

| Strategy | Example |
| --- | --- |
| `enumerate` | `photo.jpg` → `001-photo.jpg` (keeps basename) |
| `lowercase` | `MyPhoto.JPG` → `myphoto.jpg` |
| `replace-spaces` | `my photo.png` → `my-photo.png` |
| `prefix:text` | `photo.jpg` → `textphoto.jpg` |
| `suffix:text` | `photo.jpg` → `phototext.jpg` |

Enumeration starts at 001 in natural filename order (1, 2, 10). Prefixes and enumeration accumulate in the order written; suffixes also accumulate. `lowercase` and `replace-spaces` modify the original basename, not added prefixes/suffixes. For example, `prefix:WEB-,lowercase` keeps `WEB-` uppercase. `--name` takes priority over rename rules for a single input file and is rejected for directories.

## Presets and configuration

```bash
imgconvert photo.jpg -p web
imgconvert photo.jpg -p thumbnail --quality 90
imgconvert config init
imgconvert config show
imgconvert config init --force
```

| Built-in conversion preset | Settings |
| --- | --- |
| `web` | WebP, quality 80, fit cover, position center |
| `print` | TIFF, quality 100, fit contain |
| `thumbnail` | PNG, 150×150, quality 60, fit cover, position center |

The config file is `.imgconverter.config.json` in the current working directory, not automatically beside the input or in parent directories. `config init` writes defaults and preset templates; `--force` overwrites an existing config without prompting. `config show` prints merged defaults/config/presets; it does not resolve a selected command's options or expand relative paths. Invalid JSON logs a warning and falls back to defaults.

For general processing, precedence is explicit CLI option → selected preset → global config → built-in default. Source selection is explicit input → preset source → global source. A custom definition replaces the whole built-in preset with that name (no deep merge). Unknown preset names currently fall back to global/default settings without an error.

Config/preset fields applied by general conversion are `source`, `output`, `quality`, `format`, `width`, `height`, `fit`, `position`, `crop`, `background`, `trim`, `name`, `rename`, and `replace-originals`. Use `--canvas` on the command line: config/preset `canvas` values are not currently applied. Boolean settings enabled in config have no corresponding CLI `--no-*` override.

```json
{
  "quality": 85,
  "presets": {
    "hero": {
      "source": "photos",
      "output": "web-images",
      "format": "webp",
      "quality": 90,
      "width": 1200,
      "height": 630,
      "fit": "cover",
      "position": "top",
      "rename": "lowercase,replace-spaces"
    }
  }
}
```

Run `imgconvert -p hero` to use its source, or `imgconvert other-photos -p hero` to override it. See [custom presets](CUSTOM_PRESETS.md) for reusable recipes and path examples.

## Android branding

```bash
imgconvert brand logo.svg --sdk android
imgconvert brand logo.png --sdk android --adaptive --notification
imgconvert brand logo.svg --sdk android --project /work/my-app --dry-run
```

Only `--sdk android` is implemented. Kotlin, React Native, Flutter, and Titanium are not accepted SDK values. This command does not generate Titanium `DefaultIcon*.png` or iOS dark/tinted variants. `alloy` generates a different kind of asset: scaled application images.

SVG and PNG are preferred masters; JPG/JPEG/WebP are also accepted by the implementation. Use a high-resolution raster (ideally at least 1024 pixels on the longest side) or vector master. Images are normalized with aspect ratio preserved to a maximum dimension of 1024; smaller sources can be enlarged. A square 1024×1024 minimum is not enforced. Transparent padding already present in a master is retained; trim it beforehand if needed.

Without generation selectors, `brand` generates adaptive icons, marketplace artwork, notification icons, and splash icons. With any selector, only selected categories are generated. `--cleanup-legacy` disables the automatic full set; when combining cleanup with generation, specify selectors explicitly.

### Brand options

| Option | Meaning / default |
| --- | --- |
| `--sdk <target>` | `android`; required except for cleanup |
| `--adaptive` | Foreground/background/monochrome layers + legacy launcher icons at five densities and adaptive XML |
| `--marketplace` | `iTunesConnect.png` (1024²) and `MarketplaceArtwork.png` (512²) |
| `--notification` | White silhouettes on transparent backgrounds at five densities |
| `--splash` | Android 12+ splash icons at five densities |
| `--bg-color <hex>` | Six-digit hex, default `#FFFFFF`; explicitly supplying it also flattens marketplace alpha |
| `--padding <n>` | Android padding per side; positive integer 1-40, default 15; 12-20 is tuning guidance |
| `--ios-padding <n>` | Marketplace padding per side in this Android flow; positive integer 1-40, default 4 |
| `--monochrome-master <path>` | Separate silhouette for monochrome adaptive and notification icons |
| `--project <path>` | Project root, default current directory |
| `-o, --output <dir>` | Staging directory; relative to current directory, default `<project>/.ti-branding/` |
| `--in-place` | Write directly under project root, overwriting destinations; explicit `--output` wins |
| `--notes` | Full integration/tuning notes; currently includes Titanium-oriented guidance |
| `--dry-run` | Print plan without generating or deleting files; does not decode/fully validate the master |
| `--cleanup-legacy` | Inspect/delete legacy Titanium layout artifacts in the project, even when generation is staged |
| `--aggressive` | Include ldpi artifacts in cleanup |
| `-d, --debug` | Include diagnostic details |
| `-h, --help` | Show command help |

### Output and integration

Relative to the staging directory (or project root with `--in-place`):

```text
app/src/main/res/
  mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/
    ic_launcher_foreground.png
    ic_launcher_background.png
    ic_launcher_monochrome.png
    ic_launcher.png
  mipmap-anydpi-v26/ic_launcher.xml
  drawable-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/
    ic_stat_notify.png
    splash_icon.png
iTunesConnect.png
MarketplaceArtwork.png
```

Files depend on selected categories. Staged runs also retain `_master_*.png` intermediates; copy the final assets rather than these intermediates. Default marketplace output preserves alpha; use an explicit `--bg-color "#FFFFFF"` for opaque artwork. The themed monochrome layer is part of `--adaptive`; a separate monochrome master helps retain negative-space detail in complex logos.

Copy the generated `app/src/main/res/` tree into your Android module, or choose `--in-place` after reviewing the plan. Generation does not edit your AndroidManifest or theme configuration. Wire the launcher to `@mipmap/ic_launcher`; notification code can reference `@drawable/ic_stat_notify`, and your splash theme can reference `@drawable/splash_icon`. Verify the app's resource integration in its own build.

Cleanup is a legacy Titanium maintenance operation: it inspects `tiapp.xml`, Alloy `app/` or Classic `Resources/` layouts, and known legacy folders. It prints a plan and immediately deletes matched files unless `--dry-run` is present. It is not general Android resource cleanup. Staging generation does not stage cleanup deletions.

```bash
imgconvert brand --cleanup-legacy --project /work/old-ti-app --dry-run
```

## Alloy multi-scale images

```bash
imgconvert alloy /work/icons/icon.png
```

The source is treated as a 4× master on both platforms. Every output dimension is `round(source dimension / 4 × scale)`. A 400×400 source produces Android 100, 150, 200, 300, 400 pixel images and iPhone 100, 200, 300 pixel images. Scale factors are fixed.

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

With no configured output base, `tiapp.xml` in the current directory selects that directory as the base; otherwise the base is the source file's directory (for a directory input, assets go inside that source directory). Platform `output` values add a subfolder within each platform's image tree, not an absolute destination.

Public options are `-o, --output <dir>`, `-p, --preset <name>`, `-d, --debug`, and `-h, --help`. The current handler loses CLI `-o` during precedence resolution when no preset/global output supplies a value, and it always reads platform definitions from `presets.alloy`. Use `presets.alloy` and global `output` for reliable configuration rather than relying on a separate custom Alloy preset key. Quality/format are configured in JSON; the subcommand does not accept conversion flags like `-q`, `-f`, or `--width`.

```json
{
  "output": "/work/my-app",
  "presets": {
    "alloy": {
      "android": { "output": "icons", "quality": 85, "format": "png" },
      "iphone": { "output": "icons", "quality": 85, "format": "png" }
    }
  }
}
```

Platform `source` overrides the positional source. You must still pass an existing source argument to the v3 subcommand. A grouped format is also supported under `presets.alloy`, with each group containing `android` and `iphone` objects. All groups run; the older `alloy:group` selection syntax is not wired into v3. Platform quality/format overrides group settings, then Alloy-wide settings, then global/default values.

See [custom presets](CUSTOM_PRESETS.md#alloy-configuration) for a grouped example. Existing output assets are overwritten. This command does not create launcher/adaptive icons or splash themes.

## Shell completions

```bash
imgconvert completions
imgconvert completions zsh
imgconvert completions print bash
imgconvert completions uninstall
```

| Shell | Installed file | Setup |
| --- | --- | --- |
| zsh | `~/.zsh/completions/_imgconvert` | Adds managed `fpath`/`compinit` block to `~/.zshrc` |
| bash | `~/.local/share/bash-completion/completions/imgconvert` | Requires bash-completion, including `_init_completion`, loaded by your shell |
| fish | `~/.config/fish/completions/imgconvert.fish` | Loaded automatically in a new fish shell |

The interactive installer detects `$SHELL` and asks before installing. Explicit shell installation writes immediately. Reinstallation avoids duplicating the managed zsh block. Uninstall removes all three installed scripts and the block it added. Restart the shell or source `~/.zshrc` as appropriate. Completion coverage varies by shell; use `--help` for the complete option list.

## Migration from v2

| Earlier syntax | v3 syntax |
| --- | --- |
| `-w 400` | `--width 400` |
| `-h 400` | `--height 400` (numeric `-h` has a deprecated compatibility shim) |
| `-H` | `-h` or `--help` |
| `imgconvert config` | `imgconvert config init` (bare config has a deprecated shim) |
| `-p alloy` | `imgconvert alloy <source>` |
| `-p alloy:group` | Configure `presets.alloy`; selective group execution is unavailable |
| `-p ti-branding` / `-p alloy --modern` | `imgconvert brand <master> --sdk android` for Android branding |
| `--replace-originals` | Hidden alias for `--replace`; see current limitation below |

Old Alloy/branding preset names remain in generated config/internal modules but the root command no longer dispatches them to those processors. Use the subcommands. Compatibility shims are scheduled for removal in v4.

## Known limitations

The following limitations apply to v3.0.0:

- `--replace` still writes into the output directory; it does not reliably replace the source. Avoid depending on it for in-place processing.
- Alloy `-o` and custom `-p` do not consistently control the processor; use the documented JSON configuration. Group selection is unavailable.
- `canvas` in JSON is ignored; pass `--canvas` explicitly.
- Unknown preset names do not fail. Check spelling and `config show`.
- Some image failures are logged while the command still returns exit code 0. For automation, inspect output files and the processed count as well as exit status.
- Branding dry-run does not validate image decoding, master format, or optional monochrome master contents.
- Branding notes/layout warnings contain Titanium guidance even for Android generation. Use the Android output paths above as the reference.
- The package's declared Node minimum and some legacy npm test scripts need updating; see installation and the testing guide.

## Troubleshooting

Use `imgconvert ... --debug` for details. If an option is unknown, check the subcommand's `--help` and the migration table. For a missing source, verify the current directory and config source paths. For invalid configuration, use strict JSON (no comments or trailing commas).

If output appears missing, check source-relative paths for general conversion, the Alloy base rules, and project-relative staging for branding. A `brand` layout warning referring to Alloy/Classic does not change the Android `app/src/main/res/` destination.

For a crop error, ensure the rectangle fits the input. For unexpected padding, check `contain` versus `cover`. For oversized files, compare encoder/quality settings with representative inputs because conversion can increase file size.

`NO_COLOR=1` disables colored output. `IMGCONVERT_NO_UPDATE_CHECK=1` disables the optional update check (any nonempty value disables it). Update notifications are best-effort and failures are ignored.

## Contributing

```bash
git clone https://github.com/macCesar/imgconvert-cli.git
cd imgconvert-cli
npm ci
node index.js --help
npm run test:help
```

Use `node /absolute/path/to/imgconvert-cli/index.js` to test from an isolated working directory. Run the tests covering your change and lint the changed JavaScript. See [testing guide](test/README.md) for suite selection, fixtures, and cleanup behavior. Submit a pull request explaining behavior changes and validation. Do not update historical changelog entries to describe current behavior; add a new entry.

## License

[MIT](LICENSE). [Report issues or request features](https://github.com/macCesar/imgconvert-cli/issues).
