# Getting started

[Documentation home](../README.md) · Next: [Image processing](image-processing.md)

## Install

Use Node.js 22.13.0 or later. Check the runtime, install the package, then inspect the installed command:

```bash
node --version
npm install -g imgconvert-cli
imgconvert --version
imgconvert --help
```

The executable is `imgconvert`; the npm package is `imgconvert-cli`. If the shell cannot find the executable, see [installation troubleshooting](troubleshooting.md#command-not-found).

This documentation follows the repository source. Installation from npm retrieves the published version, which may predate changes in this checkout. To use this checkout directly:

```bash
git clone https://github.com/macCesar/imgconvert-cli.git
cd imgconvert-cli
npm ci
node index.js --help
```

In examples below, replace `imgconvert` with `node /absolute/path/to/imgconvert-cli/index.js` to run repository source from another working directory. `npm ci` is for a source checkout and installs its development tools as well as runtime dependencies.

## First conversion

Place a JPEG named `photo.jpg` in your working directory, then run:

```bash
imgconvert photo.jpg -f webp -q 80
```

Expected output:

```text
photo.jpg
converted/
  photo.webp
```

The original is preserved. Quality 80 is a starting setting for this example; compare the output visually and by file size. Changing format does not guarantee a smaller file.

To repeat that conversion into the same destination:

```bash
imgconvert photo.jpg -f webp -q 80 --overwrite
```

Without `--overwrite`, the existing `converted/photo.webp` causes an error before processing begins.

## Resize a photo

```bash
imgconvert photo.jpg -w 800 -f webp -o resized
```

For a 1600×900 source, `resized/photo.webp` is 800×450. Giving one dimension preserves the aspect ratio. Giving both dimensions makes `--fit` relevant:

```bash
imgconvert photo.jpg -w 400 --height 400 --fit cover -o square
```

The result is an exact 400×400 square, cropped to fill. Use `contain` to keep the full image with padding or `inside` to fit inside bounds without padding.

## Convert a directory

```bash
imgconvert photos -f webp --concurrency 2
```

For a source directory `/work/photos`, the default destination is `/work/photos-converted`. Only immediate compatible image files are processed. Subdirectories and unsupported files are skipped; a directory with no compatible images fails.

If `photos` contains `item.jpg` and `item.png`, converting both to WebP would target `item.webp` twice. Choose distinct names before writing:

```bash
imgconvert photos -f webp --rename enumerate
```

This produces names such as `001-item.webp` and `002-item.webp`. See [batch safety](files-and-batches.md#collisions-and-existing-files).

## Use a built-in recipe

```bash
imgconvert photo.jpg -p thumbnail
```

The built-in `thumbnail` preset produces a 150×150 PNG using `cover`, quality 60 and a centered crop. An explicit CLI option overrides the selected preset:

```bash
imgconvert photo.jpg -p thumbnail -w 256 --height 256 -o thumbnails-256
```

Presets named `web` and `print` are also built in. [Configuration](configuration.md) explains their settings and custom recipes.

## Discover help

```bash
imgconvert
imgconvert --help
imgconvert brand --help
imgconvert alloy --help
imgconvert help resize
imgconvert help presets
```

Running with no arguments shows help and returns success. `-h` means help; use `--height` for height. `-w` is the width alias. Options for a subcommand belong after its name:

```bash
imgconvert alloy photo.png --concurrency 2
```

Continue with [image processing](image-processing.md), or look up a task in the [recipe collection](recipes.md).
