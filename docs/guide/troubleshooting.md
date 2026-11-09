# Troubleshooting and migration

[Documentation home](../README.md) · [CLI reference](cli-reference.md)

## Command not found

The package is `imgconvert-cli`, but its executable is `imgconvert`. Check the Node version and install:

```bash
node --version
npm install -g imgconvert-cli
imgconvert --version
```

Your shell must include npm's global executable directory in its path. If you prefer a source checkout, use `node /absolute/path/to/imgconvert-cli/index.js`. Do not assume another globally installed executable points at your current checkout.

## Unknown option or preset

Check help for the actual command and installed version:

```bash
imgconvert --version
imgconvert --help
imgconvert alloy --help
imgconvert brand --help
```

General conversion flags do not automatically belong to subcommands. Examples: `--width` is a conversion flag, `--group` belongs to Alloy, and `--sdk` belongs to brand. Only brand has `--dry-run`. A missing custom preset is an error; it does not silently use defaults.

The manual follows the repository source. If an installed published version has older help, use its supported syntax or install the intended source/release. There is no universal `--config`, `--json` or `--recursive` flag.

## Destination already exists

An existing planned filename needs `--overwrite`. An existing directory alone is not a conflict. Choose a fresh destination or explicitly authorize replacing files:

```bash
imgconvert photo.png -f webp -o new-output
imgconvert photo.png -f webp -o new-output --overwrite
```

For a collision between two planned outputs, overwrite cannot resolve ownership. Use distinct names (`--rename enumerate`), formats or subfolders. A rename chain that targets another input in the same batch is also rejected; use a separate destination.

## Output is in an unexpected directory

General output resolves beside the source. For `/work/photos`, `-o optimized` means `/work/optimized`, not `/work/photos/optimized`. Alloy resolves a relative base from each input file directory, then adds `app/assets/…`. Branding resolves an explicit relative output from the working directory and appends its resource tree.

Inspect effective paths:

```bash
imgconvert photo.png -f webp --debug
imgconvert alloy icon.png --debug
imgconvert brand logo.svg --sdk android --dry-run
```

The [path tables](files-and-batches.md#output-paths) and [Alloy base rules](alloy.md#output-base-and-subfolders) give complete examples.

## Output and in-place conflict

Check inherited settings as well as typed flags. A JSON `output` plus CLI `--in-place`, or JSON `inPlace: true` plus CLI `-o`, is a conflict. Use a preset without an output for replacement, or disable replacement for a directory run:

```bash
imgconvert photo.png --no-in-place -o processed
```

Null inherits and does not disable a configured boolean. Use false or its CLI negation.

## JSON is invalid or a value is ignored

The file must be strict JSON containing one object. Remove comments/trailing commas, use real booleans, and check field spelling. A preset map and every selected recipe must be objects.

```bash
imgconvert config show
imgconvert photo.png -p web --debug
```

`show` verifies loading and prints merged JSON. Debug reveals the options actually selected for a processing operation. The CLI reads config from the working directory, not from parent directories or the input directory. Branding's flags do not come from conversion presets.

## Unexpected crop, dimensions or padding

- `cover` crops; `contain` pads; `fill` can distort; `inside` and `outside` preserve aspect ratio without padding.
- Canvas preserves pixel scale and may remove pixels on a smaller axis. An omitted canvas dimension stays unchanged.
- Trim runs before crop and can change both the origin and dimensions. Crop coordinates refer to that result.
- Crops need integer coordinates and must fit completely; a decimal or out-of-bounds region fails.
- Position affects cover/contain/canvas. It does not detect subjects or choose a face automatically.

See [the fit example table](image-processing.md#resize-strategies) for numeric results.

## Transparency or colors look different

JPEG cannot keep alpha; the pipeline flattens it on white or the supplied background. For PNG/WebP padding, a background does not flatten all existing transparent pixels.

Marketplace branding keeps alpha by default. Explicit `--bg-color "#FFFFFF"` makes that artwork opaque even though white is also the default launcher background. Monochrome/notification outputs intentionally whiten colored pixels and preserve their alpha. Use a dedicated monochrome master if details collapse into a solid silhouette.

## File size or memory is higher than expected

Changing extension or lowering quality does not guarantee a smaller file. PNG uses no palette in general conversion, TIFF uses LZW, and GIF ignores quality. High source dimensions and several active tasks increase memory demand.

```bash
imgconvert photos -f webp -q 80 -w 1600 --concurrency 1 -o memory-limited
```

Try a representative input, inspect visual quality, then increase concurrency to 2 or 4 if the machine has room. The result is content/codec dependent. `-f all` deliberately writes more variants and is best used for comparison or when every format is needed.

## Some files succeeded and the command returned 2

This is a partial result, not an all-or-nothing rollback. Preserve valid files, inspect the reported failures, and decide how to retry. A retry into the same output can require overwrite permission because successful files are already present. [Automation](automation.md#exit-codes) shows how to handle the status without losing it.

## Capabilities and limits

| Question | Current behavior |
| --- | --- |
| Does it recurse into subfolders? | No; run selected directories explicitly |
| Can general conversion rasterize SVG? | No; SVG is supported as a brand master |
| Does it preserve GIF/WebP animation? | No; animated input is handled as a still image |
| Can it rotate or auto-orient photos? | No public option for either operation |
| Can it prevent enlargement? | No public resize flag; smaller images can enlarge |
| Can it remove a background? | Trim removes detected borders, not arbitrary backgrounds |
| Does it preserve EXIF and other metadata? | General re-encoding does not promise metadata preservation |
| Can it set print DPI? | No public DPI option; print presets define format/quality/pixels only |
| Can it generate only iPhone Alloy images? | Yes; configure only `iphone` in the selected definition |
| Can it generate iOS app icons? | No public brand SDK for that; both marketplace artwork files are still generated |
| Does it edit Android themes/manifest or build the app? | No; integrate the generated resources in the app |
| Can it preview conversion/Alloy without writing? | Those commands have no dry-run; use a separate destination |
| Is there a public JavaScript import API? | No; the supported contract is the CLI |
| Does cleanup delete only staging files? | No; it targets the selected Titanium project |

## Migration from older commands

| Older spelling or assumption | Current usage |
| --- | --- |
| `-w 400` | Still supported; same as `--width 400` |
| Numeric `-h 400` for height | Use `--height 400`; the numeric compatibility shim emits a deprecation warning |
| `-H` for help | Use `-h` or `--help` |
| Bare `imgconvert config` | Use `imgconvert config init` or `config show`; bare config currently rewrites to init with a warning |
| Root `-p alloy` | Use `imgconvert alloy [source]` |
| Root `-p alloy:icons` | Use `imgconvert alloy --group icons` |
| `-p ti-branding` or `-p alloy --modern` | Use `imgconvert brand <master> --sdk android` for Android branding |
| `--replace` / `--replace-originals` | Both are aliases for `--in-place` |
| `--ios-padding` | Alias for the preferred `--artwork-padding` |
| Existing output silently replaced | Add `--overwrite` deliberately |
| JSON null disables inheritance | Null now means unspecified; use false for booleans |
| Output and replacement combined | Select one mode; disable inherited replacement with `--no-in-place` if needed |
| Processing errors still count as successful shell execution | Handle exit codes 1 and 2 |

Some internal modules and preset names remain for compatibility; they do not expose additional public flags. Numeric `-h` and bare-config shims are deprecated, so write new scripts using their explicit replacements.

## Reporting a problem

Include the version, exact command, working-directory/source/output relationship, relevant config, and the error text. Reproduce on a copy of one representative input when possible. Debug output helps explain resolution decisions; review file paths before sharing it.

[Report an issue](https://github.com/macCesar/imgconvert-cli/issues). A reproducible example and expected output are more useful than only a progress screenshot.
