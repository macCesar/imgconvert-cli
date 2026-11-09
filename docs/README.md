# ImgConvert CLI documentation

The official user guide for ImgConvert CLI: convert and transform images, repeat recipes with presets, generate Titanium Alloy assets, and prepare Android branding from the terminal.

This guide describes the source in this checkout. Check `imgconvert --version` and `imgconvert --help` when using an installed package; an older published package may not contain the features documented here.

## Start here

1. [Install and run your first conversion](guide/getting-started.md).
2. [Understand resizing, cropping, canvas and transparency](guide/image-processing.md).
3. [Choose output paths and overwrite behavior](guide/files-and-batches.md).
4. [Save a reusable configuration](guide/configuration.md).

## Find a task

| I want to… | Read |
| --- | --- |
| Convert a photo or a folder to WebP | [Getting started](guide/getting-started.md#first-conversion) |
| Choose cover, contain or inside | [Resize strategies](guide/image-processing.md#resize-strategies) |
| Pad a logo without scaling its pixels | [Canvas](guide/image-processing.md#canvas-without-scaling) |
| Trim borders, then crop and resize | [Transform order](guide/image-processing.md#transform-order) |
| Rename a naturally sorted batch | [Naming](guide/files-and-batches.md#file-naming) |
| Update an original or create a sibling format | [In-place processing](guide/files-and-batches.md#in-place-processing) |
| Reuse team settings or select an Alloy group | [Configuration](guide/configuration.md), [Alloy](guide/alloy.md) |
| Generate launcher, notification or splash artwork | [Android branding](guide/android-branding.md) |
| Copy a practical command or preset | [Recipes](guide/recipes.md) |
| Run the CLI in a script and handle partial failure | [Automation](guide/automation.md) |
| Look up every flag and default | [CLI reference](guide/cli-reference.md) |
| Fix an error or update an older command | [Troubleshooting and migration](guide/troubleshooting.md) |

## What the CLI supports

General conversion accepts immediate files with JPEG/JPG, PNG, WebP, AVIF, TIFF or GIF extensions. It can change format/quality, trim borders, extract a rectangle, resize, change the canvas, and rename outputs. Directory discovery is nonrecursive. Animated inputs are processed as still images.

`alloy` produces fixed Android density and iPhone scale variants. `brand` accepts SVG/PNG/JPEG/WebP masters and produces Android resources plus marketplace artwork. The supported branding SDK value is `android`.

The public interface is the command line. Importing the npm package is not a supported JavaScript API. The CLI does not expose recursive discovery, arbitrary rotation, a DPI control, animation preservation, automatic background removal or a general conversion dry-run. See [limits and common questions](guide/troubleshooting.md#capabilities-and-limits) before building a workflow around an extra flag.

## Reading examples

Examples use a terminal with `imgconvert` on its executable path. Replace file/project names with your own. Quote paths containing spaces and colors beginning with `#`. Each example assumes its inputs already exist and its outputs are new unless `--overwrite` is shown.

JSON blocks are complete, strict JSON examples. Use one as `.imgconverter.config.json` in the directory where you run the command. Do not paste multiple JSON objects into the same file. A named preset works after you add its definition to that file.

[Project README](../README.md) · [Full CLI reference](guide/cli-reference.md) · [Testing and contributing](../test/README.md)
