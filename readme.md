# imgconvert-cli

<div align="center">

  ![npm version](https://img.shields.io/npm/v/imgconvert-cli)
  ![downloads](https://img.shields.io/npm/dm/imgconvert-cli)
  ![license](https://img.shields.io/npm/l/imgconvert-cli)
  ![test coverage](https://img.shields.io/badge/tests-26%20passing-brightgreen)

</div>

`imgconvert-cli` is a command-line tool for compressing, converting, and resizing images using the `sharp` library.

It supports various formats and lets you optimize images for the web or other purposes, with customizable quality, background color, and multi-format conversion.

## Table of Contents
- [imgconvert-cli](#imgconvert-cli)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [How It Works](#how-it-works)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
  - [File Extension Behavior](#file-extension-behavior)
    - [**Preserve Original Extensions**](#preserve-original-extensions)
    - [**Format Conversion Changes Extensions**](#format-conversion-changes-extensions)
  - [Options](#options)
  - [Environment Mode](#environment-mode)
  - [Examples](#examples)
  - [Presets](#presets)
    - [Output for Alloy (Android \& iPhone)](#output-for-alloy-android--iphone)
    - [Using Preset Source Folders](#using-preset-source-folders)
  - [Configuration File](#configuration-file)
    - [Configuration Precedence](#configuration-precedence)
    - [Configuration Parameters](#configuration-parameters)
    - [Default Configuration File](#default-configuration-file)
  - [Debug Mode](#debug-mode)
  - [Dependencies](#dependencies)
  - [Error Handling](#error-handling)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
  - [Contribution](#contribution)
  - [Roadmap / Future Features](#roadmap--future-features)
  - [License](#license)

## Features

- **Image Compression**: Compress images to reduce file size while maintaining quality.
- **Format Conversion**: Convert images between JPEG, PNG, WebP, AVIF, TIFF, and GIF.
- **File and Batch Processing**: Process a single image file or all images in a directory.
- **Smart Extension Handling**: Preserves original file extensions when no format conversion is specified.
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
- **Preserves original file extensions** when no format is specified (e.g., `image.jpg` → `image.jpg`).
- Only changes file extension when explicitly converting formats (e.g., `image.jpg -f webp` → `image.webp`).
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

> **📝 Important:** When you don't specify the `-f`/`--format` option, each output image will **preserve its original file extension**. For example:
> - `image.jpg` → `image.jpg` (compressed but same format)
> - `image.png` → `image.png` (compressed but same format)
>
> The file extension only changes when you explicitly specify a different format with `-f`.

## File Extension Behavior

`imgconvert-cli` has intelligent file extension handling:

### **Preserve Original Extensions**
When no format is specified with `-f`, the original file extension is preserved:

| Input       | Command                | Output      |
| ----------- | ---------------------- | ----------- |
| `photo.jpg` | `imgconvert photo.jpg` | `photo.jpg` |
| `logo.png`  | `imgconvert logo.png`  | `logo.png`  |
| `icon.webp` | `imgconvert icon.webp` | `icon.webp` |

### **Format Conversion Changes Extensions**
When using `-f` to specify a format, the extension changes accordingly:

| Input       | Command                        | Output       |
| ----------- | ------------------------------ | ------------ |
| `photo.jpg` | `imgconvert photo.jpg -f webp` | `photo.webp` |
| `logo.png`  | `imgconvert logo.png -f jpeg`  | `logo.jpeg`  |
| `icon.webp` | `imgconvert icon.webp -f png`  | `icon.png`   |

> **💡 Tip:** This behavior ensures consistency and user expectations while maintaining technical compatibility with the Sharp image processing library.

## Options

The available options for the `imgconvert-cli` command let users customize image conversions easily.

- `-f, --format`: (Optional) The desired output format. Supported formats: `jpeg`, `png`, `webp`, `avif`, `tiff`, `gif`, or `all`. If not specified, **the original format and extension of each file is retained**.
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

1. **Compress images without changing format (preserves extensions):**

   ```bash
   imgconvert image.jpg      # → image.jpg (compressed)
   imgconvert image.png      # → image.png (compressed)
   ```

2. **Compress all images in directory (preserves original formats):**

   ```bash
   imgconvert source_folder  # Each file keeps its original extension
   ```

3. **Convert to different format (changes extension):**

   ```bash
   imgconvert image.jpg -f webp -q 75    # → image.webp
   imgconvert image.png -f jpeg          # → image.jpeg
   ```

4. **Batch conversion with format change:**

   ```bash
   imgconvert source_folder -f webp      # All images → .webp
   ```

5. **Convert a single image to JPEG with high quality and custom background:**

   ```bash
   imgconvert image.png -f jpeg -q 95 -b "#ff0000"
   ```

6. **Resize without format change:**

   ```bash
   imgconvert image.jpg -w 800           # → image.jpg (resized)
   imgconvert image.jpg -h 600           # → image.jpg (resized)
   ```

7. **Resize all images in a directory to a specific width and height:**

   ```bash
   imgconvert source_folder -w 800 -h 600
   ```

8. **Convert all images in a directory to all formats:**

   ```bash
   imgconvert source_folder -f all
   ```

9. **Replace original files with processed images (only in production mode):**

    ```bash
    imgconvert source_folder -r -e prod
    ```

10. **Use a preset configuration:**

    ```bash
    imgconvert source_folder -p web
    ```

11. **Use alloy preset with platform-specific formats:**

    ```bash
    imgconvert source_folder -p alloy
    # Generates images according to subpreset format configuration
    ```

12. **Override preset settings with CLI arguments:**

    ```bash
    imgconvert source_folder -p alloy -f png -q 95
    # CLI arguments override preset: both Android and iPhone will use PNG at 95% quality
    ```

13. **Use preset settings with partial CLI override:**

    ```bash
    imgconvert source_folder -p alloy -q 80
    # Only quality is overridden: Android uses WebP, iPhone uses PNG, both at 80% quality
    ```

14. **Set environment to production:**

    ```bash
    imgconvert source_folder -e prod
    ```

15. **Specify a custom output directory:**

    ```bash
    imgconvert source_folder -o custom_output_directory
    ```

16. **Enable debug mode:**

    ```bash
    imgconvert source_folder -d
    ```

17. **Check the version of the module:**

    ```bash
    imgconvert --version
    ```

18. **Show help message:**

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

### Configuration Precedence

The tool follows a consistent 4-level precedence system for all configuration parameters:

1. **CLI Arguments** (highest priority) - Values provided via command line flags
2. **Preset Settings** - Values defined in the specific preset being used
3. **Global Config** - Values in the `.imgconverter.config.json` file
4. **Default Values** (lowest priority) - Built-in fallback values

This means CLI arguments always override preset settings, preset settings override global config, and global config overrides defaults. This precedence applies to all parameters: `quality`, `format`, `width`, `height`, `output`, `replace`, and `background`.

### Configuration Parameters

- **width**: Default width for image resizing.
- **height**: Default height for image resizing.
- **format**: Default format for image conversion.
- **quality**: Default quality for image compression.
- **replace**: Default setting for replacing original files.
- **source**: Global default source folder for images. If not provided as a CLI argument or in a preset, this will be used as the input folder.
- **output**: Default output directory for processed images. If `null`, defaults to a `compressed` directory at the same level as the source path (or `compressed-dev` in development mode).
- **background**: Hex color used to fill transparent areas only when converting images with transparency to formats that do not support it (e.g., PNG to JPEG). Ignored if the output format supports transparency.
- **presets**: Define custom presets for different use cases. Each preset can specify its own `format`, `quality`, `width`, `height`, `output`, and `source`. All preset configurations follow the precedence system: CLI arguments always override preset values, which override global config values.

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

**Example: How Precedence Works**

Given this configuration file:
```json
{
  "quality": 75,
  "format": "jpeg",
  "presets": {
    "alloy": {
      "android": {
        "quality": 90,
        "format": "webp"
      },
      "iphone": {
        "quality": 95,
        "format": "png"
      }
    }
  }
}
```

Different command scenarios would result in:

- `imgconvert -p alloy` → Android: WebP at 90%, iPhone: PNG at 95%
- `imgconvert -p alloy -q 80` → Android: WebP at 80%, iPhone: PNG at 80% (CLI overrides quality)
- `imgconvert -p alloy -f jpeg` → Android: JPEG at 90%, iPhone: JPEG at 95% (CLI overrides format)
- `imgconvert -p alloy -f jpeg -q 80` → Both platforms: JPEG at 80% (CLI overrides everything)

## Debug Mode

When debug mode is enabled with the `-d` or `--debug` option, the tool displays summary statistics after processing. In development mode, debug mode is always enabled.

**Sample Debug Output:**
```
Processing complete! Summary:
  - Processed files: 5
  - Total original size: 0.87 MB
  - Total new size: 0.25 MB
  - Total savings: 71.11%
  - Duration: 0.24 seconds
```

This information can be useful for troubleshooting and optimizing the image processing workflow.

## Dependencies

- **sharp**: A high-performance image processing library for Node.js. It handles the compression, conversion, and background color application for images.
  - *Note: Sharp internally uses 'jpeg' format specification, but imgconvert-cli preserves user-friendly '.jpg' extensions in output filenames.*
- **minimist**: A library for parsing command-line arguments, allowing for flexible and named options.
- **chalk**: A library for styling terminal strings, used for colored output in the console.

## Error Handling

- If the source path is not specified, the tool will display an error message and exit.
- If an unsupported format is specified, the tool will default to retaining the original format.
- Non-image files and directories are skipped with a log message.

## Troubleshooting

### Common Issues

**Q: Why did my `.jpg` file become `.jpeg` in older versions?**
A: This was an issue in versions prior to 1.1.4. Update to the latest version where original extensions are preserved when no format conversion is specified.

**Q: The CLI says "format not supported" for my file**
A: Ensure your file has one of these extensions: `.jpeg`, `.jpg`, `.png`, `.webp`, `.avif`, `.tiff`, `.gif`

**Q: Batch processing failed on some files**
A: Check file permissions and ensure the output directory is writable. Use `--debug` flag for detailed error information.

**Q: Output quality seems poor**
A: Adjust quality with `-q` parameter (1-100). Default is 85. Use `-q 95` for higher quality.

**Q: Files are not being overwritten in development mode**
A: This is intentional. Use `-e prod` for production mode if you need to replace original files.

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
