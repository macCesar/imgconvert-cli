# imgconvert-cli

`imgconvert-cli` is a command-line tool for compressing, converting, and resizing images using the `sharp` library.

It supports various formats and lets you optimize images for the web or other purposes, with customizable quality, background color, and multi-format conversion.

## Table of Contents
- [imgconvert-cli](#imgconvert-cli)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [How It Works](#how-it-works)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
  - [Options](#options)
  - [Environment Mode](#environment-mode)
  - [Examples](#examples)
  - [Presets](#presets)
    - [Output for Alloy (Android \& iPhone)](#output-for-alloy-android--iphone)
    - [Using Preset Source Folders](#using-preset-source-folders)
  - [Configuration File](#configuration-file)
    - [Configuration Parameters](#configuration-parameters)
    - [Default Configuration File](#default-configuration-file)
  - [Debug Mode](#debug-mode)
  - [Dependencies](#dependencies)
  - [Error Handling](#error-handling)
  - [Contribution](#contribution)
  - [Roadmap / Future Features](#roadmap--future-features)
  - [License](#license)

## Features

- **Image Compression**: Compress images to reduce file size while maintaining quality.
- **Format Conversion**: Convert images between JPEG, PNG, WebP, AVIF, TIFF, and GIF.
- **File and Batch Processing**: Process a single image file or all images in a directory.
- **Customizable Quality**: Adjust output image quality.
- **Configurable Background Color**: Set a background color for images converted from formats with transparency (e.g., PNG) to formats without transparency (e.g., JPEG).
- **Multi-Format Conversion**: Convert images to all supported formats in one command.
- **Image Resizing**: Resize images by specifying width and/or height.
- **Replace Original Files**: Optionally replace original files with processed images (**see Environment Mode for restrictions**).
- **Presets**: Use predefined settings for different use cases.
- **Custom Output Directory**: Set a custom directory for processed images, or use the default `compressed` directory.
- **Debug Mode**: Enable detailed logging for troubleshooting.
- **Environment Mode**: Switch between development and production behaviors for safer testing and real deployments.

## How It Works

- Accepts a single file or a directory as input.
- Uses `sharp` to apply compression, format conversion, resizing, and optional background color.
- Outputs to a `compressed` subfolder by default, or replaces original files if `--replace` is used (**only in production mode**).
- Resizing preserves aspect ratio unless both width and height are specified.

## Installation

To install `imgconvert-cli`, you need to have Node.js and NPM installed on your system. Then, you can install the module globally using:

```bash
npm install -g imgconvert-cli
```

## Basic Usage

```bash
imgconvert <source_path>
```

- `<source_path>`: The path to the image file or directory containing the images you want to process. This is a required positional argument.

> **Note:** Whether you provide a single file or a directory, if you do **not** specify the `-f`/`--format` option, each output image will keep its original format. This applies to both single-file and batch (directory) processing.

## Options

The available options for the `imgconvert-cli` command let users customize image conversions easily.

- `-f, --format`: (Optional) The desired output format. Supported formats: `jpeg`, `png`, `webp`, `avif`, `tiff`, `gif`, or `all`. If not specified, **the original format of each file is retained**.
- `-q, --quality`: (Optional) Output image quality (1-100). Default: 85.
- `-b, --background`: (Optional) Hex color for filling transparent areas when converting to formats that do not support transparency (e.g., PNG to JPEG). Ignored if the output format supports transparency. Default: `#ffffff`.
- `-r, --replace`: (Optional) Enables replacement of original files. Default: `false`. **Note: This is only allowed in production mode. In development mode, this option is ignored and files are never overwritten.**
- `-w, --width`: (Optional) Set output image width.
- `-h, --height`: (Optional) Set output image height.
- `-o, --output`: (Optional) Set a custom output directory. If not specified, a `compressed` directory is created at the same level as the source path (or `compressed-dev` in development mode).
- `-p, --preset`: (Optional) Apply a preset configuration (e.g., `web`, `print`, `thumbnail`, `alloy`).
- `-e, --environment`: (Optional) Set the environment mode. Allowed values: `dev` (default), `prod`.
    - In `dev` mode: original files are never overwritten, output goes to `compressed-dev`, and debug logs are always enabled.
    - In `prod` mode: original files can be overwritten if `--replace` is used, output goes to `compressed`, and debug logs are only shown if `--debug` is set.
- `-d, --debug`: (Optional) Enable debug mode for detailed information (always enabled in `dev` mode).
- `-v, --version`: (Optional) Displays the version and exits.
- `-H, --help`: (Optional) Show the help message.

## Environment Mode

The `--environment` (or `-e`) option controls the behavior of the CLI for safer development and real production use:

- **Development mode (`--environment=dev`, default):**
  - Original files are never overwritten, even if `--replace` is specified (the option is ignored).
  - Output images are always written to a `compressed-dev` folder next to the source.
  - Debug logs are always enabled.
  - A warning is shown if you try to use `--replace`.
- **Production mode (`--environment=prod`):**
  - Original files can be overwritten if `--replace` is specified.
  - Output images are written to the normal `compressed` folder (or the one specified with `--output`).
  - Debug logs are only shown if `--debug` is specified.

This allows you to safely test your image processing workflow in development without risking your original files, and then switch to production for real conversions.

## Examples

1. Compress a single image without changing format:

   ```bash
   imgconvert image.jpg
   ```

2. Compress all images in a directory without changing format (each file keeps its original format):

   ```bash
   imgconvert source_folder
   ```

3. Convert a single image to WebP with custom quality:

   ```bash
   imgconvert image.jpg -f webp -q 75
   ```

4. Convert all images in a directory to PNG with default quality:

   ```bash
   imgconvert source_folder -f png
   ```

5. Convert a single image to JPEG with high quality and custom background:

   ```bash
   imgconvert image.png -f jpeg -q 95 -b "#ff0000"
   ```

6. Resize a single image to a specific width:

   ```bash
   imgconvert image.jpg -w 800
   ```

7. Resize a single image to a specific height:

   ```bash
   imgconvert image.jpg -h 600
   ```

8. Resize all images in a directory to a specific width and height:

   ```bash
   imgconvert source_folder -w 800 -h 600
   ```

9. Convert all images in a directory to all formats:

   ```bash
   imgconvert source_folder -f all
   ```

10. Replace original files with processed images (only in production mode):

    ```bash
    imgconvert source_folder -r -e prod
    ```

11. Use a preset configuration:

    ```bash
    imgconvert source_folder -p web
    ```

12. Set environment to production:

    ```bash
    imgconvert source_folder -e prod
    ```

13. Specify a custom output directory:

    ```bash
    imgconvert source_folder -o custom_output_directory
    ```

14. Enable debug mode:

    ```bash
    imgconvert source_folder -d
    ```

15. Check the version of the module:

    ```bash
    imgconvert --version
    ```

16. Show help message:

    ```bash
    imgconvert --help
    ```

## Presets

Presets are predefined configurations for common use cases:

- **web**: Optimized for the web (`webp`, quality `80`). Optionally defines a `source` path.
- **print**: High-quality output (`tiff`, quality `100`). Optionally defines a `source` path.
- **thumbnail**: Small previews (`png`, quality `60`, 150x150). Optionally defines a `source` path.
- **alloy**: For Titanium SDK, generates images at multiple resolutions for Android and iPhone. Each platform can define its own `source` path.

### Output for Alloy (Android & iPhone)

When using the `alloy` preset, the output base path is always fixed:

- Android: `app/assets/android/images`
- iPhone: `app/assets/iphone/images`

You only need to specify the relative subfolder (without leading or trailing slashes, e.g. `cards/thumbs/baby`) as the `output` in the preset or CLI. The script will generate the correct structure for each density:

**Correct usage:**

```
"output": "cards/thumbs/baby"
```

**Do NOT use:**
- `/cards/thumbs/baby`
- `cards/thumbs/baby/`
- `/cards/thumbs/baby/`

**Android Example:**

```
app/assets/android/images/res-mdpi/cards/thumbs/baby/logo.png
app/assets/android/images/res-hdpi/cards/thumbs/baby/logo.png
app/assets/android/images/res-xhdpi/cards/thumbs/baby/logo.png
app/assets/android/images/res-xxhdpi/cards/thumbs/baby/logo.png
app/assets/android/images/res-xxxhdpi/cards/thumbs/baby/logo.png
```

**iPhone Example:**

```
app/assets/iphone/images/cards/thumbs/baby/logo.png
app/assets/iphone/images/cards/thumbs/baby/logo@2x.png
app/assets/iphone/images/cards/thumbs/baby/logo@3x.png
```

You do **not** need to specify the full output path, just the subfolder as shown above. The script will handle the rest.

### Using Preset Source Folders

If you do not provide a `<source_path>` argument and the selected preset (or alloy subpreset) defines a `source` property, `imgconvert-cli` will automatically use that folder as the input. This works for top-level presets (like `web`, `print`, `thumbnail`) and for `alloy` subpresets (`android` and `iphone`).

For example:

```json
"presets": {
  "alloy": {
    "android": {
      "source": "./images/alloy/android",
      "output": "cards/thumbs/baby",
      "scales": { ... }
    },
    "iphone": {
      "source": "./images/alloy/iphone",
      "output": "cards/thumbs/baby",
      "scales": { ... }
    }
  }
}
```

Then you can simply run:

```bash
imgconvert -p alloy
```

And the tool will use the defined source folders and output subfolders automatically.

## Configuration File

The configuration file `.imgconverter.config.json` allows you to define global default parameters and custom presets for image processing. This file is automatically created in the current working directory when you run `imgconvert config`.

### Configuration Parameters

- **width**: Default width for image resizing.
- **height**: Default height for image resizing.
- **format**: Default format for image conversion.
- **quality**: Default quality for image compression.
- **replace**: Default setting for replacing original files.
- **source**: Global default source folder for images. If not provided as a CLI argument or in a preset, this will be used as the input folder.
- **output**: Default output directory for processed images. If `null`, defaults to a `compressed` directory at the same level as the source path (or `compressed-dev` in development mode).
- **background**: Hex color used to fill transparent areas only when converting images with transparency to formats that do not support it (e.g., PNG to JPEG). Ignored if the output format supports transparency.
- **presets**: Define custom presets for different use cases. Each preset can specify its own `format`, `quality`, `width`, `height`, `output`, and `source`. If a preset does not define `source`, the global `source` will be used.

### Default Configuration File

```json
{
  "width": null,
  "height": null,
  "quality": 85,
  "source": null,
  "output": null,
  "format": null,
  "replace": false,
  "background": "#ffffff",
  "presets": {
    "web": { "source": null, "format": "webp", "quality": 80 },
    "print": { "source": null, "format": "tiff", "quality": 100 },
    "thumbnail": { "source": null, "format": "png", "quality": 60, "width": 150, "height": 150 },
    "alloy": {
      "android": {
        "source": null,
        "output": "./app/assets/android/images",
        "scales": { "res-mdpi": 1, "res-hdpi": 1.5, "res-xhdpi": 2, "res-xxhdpi": 3, "res-xxxhdpi": 4 }
      },
      "iphone": {
        "source": null,
        "output": "./app/assets/iphone/images",
        "scales": { "1x": 1, "2x": 2, "3x": 3 }
      }
    }
  }
}
```

## Debug Mode

When debug mode is enabled with the `-d` or `--debug` option, the tool displays summary statistics after processing. In development mode, debug mode is always enabled.

**Sample Debug Output:**
```
Stats:
  Total Images: 5
  Elapsed Time: 0.24 secs
  Original Size: 0.87 MB
  Compressed Size: 0.25 MB
  Total Size Reduction: 71.11%
```

This information can be useful for troubleshooting and optimizing the image processing workflow.

## Dependencies

- **sharp**: A high-performance image processing library for Node.js. It handles the compression, conversion, and background color application for images.
- **minimist**: A library for parsing command-line arguments, allowing for flexible and named options.
- **chalk**: A library for styling terminal strings, used for colored output in the console.

## Error Handling

- If the source path is not specified, the tool will display an error message and exit.
- If an unsupported format is specified, the tool will default to retaining the original format.
- Non-image files and directories are skipped with a log message.

## Contribution

Contributions are welcome! If you have suggestions or improvements, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/macCesar/imgconvert-cli).

## Roadmap / Future Features

- CLI wizard for common presets
- Custom scale sets per platform
- Plugin support for user-defined transformations


## License

This project is licensed under the MIT License.

Copyright (c) 2025 César Estrada

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
