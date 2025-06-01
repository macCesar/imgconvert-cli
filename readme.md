# imgconvert-cli

<div align="center">

  ![npm version](https://img.shields.io/npm/v/imgconvert-cli)
  ![Node.js Version](https://img.shields.io/node/v/imgconvert-cli)
  ![downloads](https://img.shields.io/npm/dm/imgconvert-cli)
  ![license](https://img.shields.io/npm/l/imgconvert-cli)
  ![test coverage](https://img.shields.io/badge/tests-26%20passing-brightgreen)
  ![GitHub Stars](https://img.shields.io/github/stars/macCesar/imgconvert-cli)

</div>

`imgconvert-cli` is a powerful command-line tool for compressing, converting, and resizing images using the `sharp` library. It supports various formats and lets you optimize images for the web or other purposes, with customizable quality, background color, and multi-format conversion.

## 🚀 Quick Start

```bash
# Install globally
npm install -g imgconvert-cli

# Compress images (preserves original format)
imgconvert my-images/

# Convert to WebP with 80% quality
imgconvert my-images/ -f webp -q 80

# Generate mobile app assets (all configurations)
imgconvert source-images/ -p alloy

# Generate only specific mobile app assets
imgconvert -p alloy:comics
imgconvert -p alloy:thumbs-baby
```

## 🎯 Common Use Cases

- **Web Optimization**: Batch convert images to WebP for faster loading times
- **Mobile App Development**: Generate multi-resolution assets for iOS/Android with Titanium Alloy
- **Selective Asset Updates**: Use `imgconvert -p alloy:comics` to update only specific asset categories
- **Print Preparation**: Convert to high-quality TIFF format for professional printing
- **Thumbnail Generation**: Create consistent preview images with custom dimensions
- **Batch Processing**: Convert entire directories while preserving folder structure

## 📊 Performance

Typical compression results:
- **JPEG → WebP**: 25-35% size reduction
- **PNG → WebP**: 40-60% size reduction
- **Batch processing**: ~50-100 images/second
- **Memory efficient**: Processes large batches without memory issues

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Options](#options)
- [Examples](#examples)
- [File Extension Behavior](#file-extension-behavior)
- [Presets](#presets)
- [Custom Presets](#custom-presets)
- [Alloy Preset](#alloy-preset)
- [Configuration File](#configuration-file)
- [Debug Mode](#debug-mode)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Image Compression**: Compress images to reduce file size while maintaining quality
- **Format Conversion**: Convert images between JPEG, PNG, WebP, AVIF, TIFF, and GIF
- **File and Batch Processing**: Process a single image file or all images in a directory
- **Smart Extension Handling**: Preserves original file extensions when no format conversion is specified
- **Customizable Quality**: Adjust output image quality from 1-100
- **Configurable Background Color**: Set a background color for images converted from formats with transparency
- **Multi-Format Conversion**: Convert images to all supported formats in one command
- **Image Resizing**: Resize images by specifying width and/or height
- **Replace Original Files**: Optionally replace original files with processed images
- **Presets**: Use predefined settings for different use cases
- **Custom Output Directory**: Set a custom directory for processed images
- **Debug Mode**: Enable detailed logging for troubleshooting

## How It Works

- Accepts a single file or a directory as input
- Uses `sharp` to apply compression, format conversion, resizing, and optional background color
- **Preserves original file extensions** when no format is specified (e.g., `image.jpg` → `image.jpg`)
- Only changes file extension when explicitly converting formats (e.g., `image.jpg -f webp` → `image.webp`)
- Outputs to a `converted` subfolder by default, or replaces original files if `--replace-originals` is used
- Resizing preserves aspect ratio unless both width and height are specified

## Installation

### Prerequisites
- Node.js 14+ 
- NPM or Yarn

### Install
```bash
npm install -g imgconvert-cli
# or
yarn global add imgconvert-cli
```

### Verify Installation
```bash
imgconvert --version
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

## Options

The available options for the `imgconvert-cli` command let users customize image conversions easily.

- `-f, --format`: (Optional) The desired output format. Supported formats: `jpeg`, `png`, `webp`, `avif`, `tiff`, `gif`, or `all`. If not specified, **the original format and extension of each file is retained**.
- `-q, --quality`: (Optional) Output image quality (1-100). Default: 85.
- `-b, --background`: (Optional) Hex color for filling transparent areas when converting to formats that do not support transparency (e.g., PNG to JPEG). Ignored if the output format supports transparency. Default: `#ffffff`.
- `--replace-originals`: (Optional) Replace original files with processed images. Default: `false`.
- `-w, --width`: (Optional) Set output image width.
- `-h, --height`: (Optional) Set output image height.
- `-o, --output`: (Optional) Set a custom output directory. If not specified, a `converted` directory is created at the same level as the source path.
- `-p, --preset`: (Optional) Apply a preset configuration (e.g., `web`, `print`, `thumbnail`, `alloy`). For alloy preset, you can specify a specific configuration using the syntax `alloy:configName` (e.g., `alloy:comics`, `alloy:thumbs-baby`).
- `-d, --debug`: (Optional) Enable debug mode for detailed information.
- `-v, --version`: (Optional) Displays the version and exits.
- `-H, --help`: (Optional) Show the help message.

## Examples

### Basic Operations

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

### Batch Processing

4. **Batch conversion with format change:**
   ```bash
   imgconvert source_folder -f webp      # All images → .webp
   ```

5. **Convert a single image to JPEG with high quality and custom background:**
   ```bash
   imgconvert image.png -f jpeg -q 95 -b "#ff0000"
   ```

### Resizing

6. **Resize without format change:**
   ```bash
   imgconvert image.jpg -w 800           # → image.jpg (resized)
   imgconvert image.jpg -h 600           # → image.jpg (resized)
   ```

7. **Resize all images in a directory to a specific width and height:**
   ```bash
   imgconvert source_folder -w 800 -h 600
   ```

### Advanced Operations

8. **Convert all images in a directory to all formats:**
   ```bash
   imgconvert source_folder -f all
   ```

9. **Replace original files with processed images:**
    ```bash
    imgconvert source_folder --replace-originals
    ```

10. **Use a preset configuration:**
    ```bash
    imgconvert source_folder -p web
    ```

### Alloy Preset Examples

11. **Use alloy preset with platform-specific formats:**
    ```bash
    imgconvert source_folder -p alloy
    # Generates images for ALL configurations (comics, thumbs-comics, baby, thumbs-baby)
    ```

12. **Process specific alloy configurations:**
    ```bash
    imgconvert -p alloy:comics
    # Processes ONLY the comics configuration (both Android and iPhone)
    
    imgconvert -p alloy:thumbs-baby
    # Processes ONLY the thumbs-baby configuration
    
    imgconvert -p alloy:thumbs-comics
    # Processes ONLY the thumbs-comics configuration
    ```

13. **Override preset settings with CLI arguments:**
    ```bash
    imgconvert source_folder -p alloy -f png -q 95
    # CLI arguments override preset: both Android and iPhone will use PNG at 95% quality
    
    imgconvert -p alloy:comics -q 90
    # Only comics configuration with 90% quality override
    ```

14. **Use preset settings with partial CLI override:**
    ```bash
    imgconvert source_folder -p alloy -q 80
    # Only quality is overridden: Android uses WebP, iPhone uses PNG, both at 80% quality
    
    imgconvert -p alloy:baby -f webp
    # Only baby configuration, forced to WebP format for both platforms
    ```

### Utility Operations

14. **Specify a custom output directory:**
    ```bash
    imgconvert source_folder -o custom_output_directory
    ```

15. **Enable debug mode:**
    ```bash
    imgconvert source_folder -d
    ```

16. **Check the version of the module:**
    ```bash
    imgconvert --version
    ```

17. **Show help message:**
    ```bash
    imgconvert --help
    ```

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

## Presets

Presets are predefined configurations for common use cases:

- **web**: Optimized for the web (`webp`, quality `80`). Optionally defines a `source` path.
- **print**: High-quality output (`tiff`, quality `100`). Optionally defines a `source` path.
- **thumbnail**: Small previews (`png`, quality `60`, 150x150). Optionally defines a `source` path.
- **alloy**: For Titanium SDK, generates images at multiple resolutions for Android and iPhone. Supports both legacy single-source format and new multi-configuration format for complex workflows (e.g., cards, thumbnails, icons). Each platform can define its own `source` path. You can process all configurations with `-p alloy` or target specific ones with `-p alloy:configName` (e.g., `-p alloy:comics`, `-p alloy:thumbs-baby`).

## Custom Presets

Beyond the built-in presets, you can create your own custom presets in the `.imgconverter.config.json` file. This allows you to define reusable configurations for specific workflows or project requirements.

### Basic Example

```json
{
  "presets": {
    "instagram-post": {
      "width": 1080,
      "height": 1080,
      "quality": 85,
      "format": "jpeg",
      "background": "#ffffff"
    },
    "email-newsletter": {
      "width": 600,
      "quality": 70,
      "format": "jpeg",
      "source": "content/images",
      "output": "email/assets"
    },
    "product-catalog": {
      "width": 800,
      "height": 800,
      "quality": 90,
      "format": "webp",
      "background": "#ffffff"
    }
  }
}
```

### Usage

```bash
# Use your custom presets
imgconvert photos/ -p instagram-post
imgconvert banner.png -p email-newsletter
imgconvert products/ -p product-catalog

# Override preset settings with CLI arguments
imgconvert photos/ -p instagram-post -q 95  # Uses Instagram preset but with 95% quality

# Use selective configuration with custom alloy presets
imgconvert -p alloy:comics -q 85  # Process only comics with custom quality
imgconvert -p alloy:game-cards    # Process only game-cards configuration
```

### Key Features

- **Reusable configurations** for consistent processing across projects
- **Source and output paths** can be predefined in presets
- **Full parameter support**: quality, format, width, height, background, source, output, replace-originals
- **CLI override capability**: Command line arguments always take precedence over preset values
- **Workflow optimization**: Perfect for batch processing with consistent requirements

📖 **[Complete Custom Presets Guide](custom_presets.md)** - See advanced examples, best practices, and complex workflows including social media, e-commerce, email marketing, and development environment presets.

## Why Choose imgconvert-cli?

| Feature                | imgconvert-cli | ImageMagick | Sharp CLI |
| ---------------------- | -------------- | ----------- | --------- |
| Easy Setup             | ✅              | ❌           | ✅         |
| Batch Processing       | ✅              | ✅           | ❌         |
| Mobile Presets         | ✅              | ❌           | ❌         |
| Custom Presets         | ✅              | ❌           | ❌         |
| Config File            | ✅              | ❌           | ❌         |
| Extension Preservation | ✅              | ❌           | ❌         |
| Multi-Format Output    | ✅              | ✅           | ❌         |

## Alloy Preset

The `alloy` preset is specifically designed for mobile app development with Titanium Alloy framework. It generates multiple scaled versions of images for both Android and iOS platforms.

### Key Features:
- **Immutable scale factors**: Uses fixed Titanium-standard scale factors for consistency and compatibility
- **Automatic scaling**: Creates multiple resolution versions based on predefined scale factors
- **Platform-specific output**: Generates Android density folders and iOS @2x/@3x naming conventions
- **Multi-configuration support**: Process multiple image groups (cards, thumbnails, icons) in a single command
- **Independent source management**: Each configuration can have its own source directories and output paths
- **Flexible quality/format control**: Per-configuration quality and format settings with proper precedence
- **Selective configuration processing**: Target specific configurations with `alloy:configName` syntax for efficient workflows
- **Ignores width/height**: The `width` and `height` parameters are ignored as images are scaled proportionally
- **4x source requirement**: Source images should be 4x the target resolution for optimal results
- **Legacy compatibility**: Maintains backward compatibility with existing alloy configurations

### Selective Configuration Processing:
The alloy preset now supports targeting specific configurations, which is perfect for:

- **Incremental Updates**: When adding new design categories (like 'neon'), process only the new assets without regenerating everything
- **Development Workflow**: Test specific configurations quickly without waiting for all assets to be processed
- **CI/CD Optimization**: Update only the asset categories that have changed in your build pipeline
- **Resource Efficiency**: Save time and processing power by targeting exactly what you need

**Examples:**
```bash
# Process all configurations (default behavior)
imgconvert -p alloy

# Process only comics assets
imgconvert -p alloy:comics

# Process only thumbnail variants
imgconvert -p alloy:thumbs-comics
imgconvert -p alloy:thumbs-baby

# Perfect for adding new categories
imgconvert -p alloy:neon  # Only process new 'neon' design category
```

### Scale Factors:
Scale factors are **immutable constants** that follow Titanium platform standards and cannot be modified:
- **Android**: res-mdpi (1x), res-hdpi (1.5x), res-xhdpi (2x), res-xxhdpi (3x), res-xxxhdpi (4x)
- **iOS**: 1x, 2x, 3x

> **🔒 Note**: Scale factors are fixed to ensure Titanium compatibility and cannot be customized. This prevents configuration errors and maintains consistency with Titanium SDK requirements.

### Usage:

#### Process All Configurations:
```bash
# Legacy format (single android/iphone configuration)
imgconvert source-images/ -p alloy

# Multi-configuration format (all configuration groups)
imgconvert -p alloy
```

#### Process Specific Configuration:
```bash
# Process only comics configuration
imgconvert -p alloy:comics

# Process only thumbnail configurations
imgconvert -p alloy:thumbs-comics
imgconvert -p alloy:thumbs-baby

# Process only baby configuration  
imgconvert -p alloy:baby
```

#### Single Configuration (Legacy Format):
```bash
imgconvert source-images/ -p alloy
```

#### Multi-Configuration Format:
```bash
imgconvert -p alloy
```
> **Note**: With multi-configuration format, all configuration groups are processed automatically from their respective source directories when using `-p alloy`, or you can target specific configurations using `-p alloy:configName`.

> **Note**: When using the alloy preset, `width` and `height` parameters are automatically ignored since images are scaled based on predefined factors to maintain mobile platform standards.

### Output for Alloy (Android & iPhone)

When using the `alloy` preset, the output base path is always fixed:

- Android: `app/assets/android/images`
- iPhone: `app/assets/iphone/images`

You only need to specify the relative subfolder (without leading or trailing slashes, e.g. `thumbs/baby`) as the `output` in the preset or CLI. The script will generate the correct structure for each density:

**Correct usage:**

```
"output": "thumbs/baby"
```

**Do NOT use:**
- `/thumbs/baby`
- `thumbs/baby/`
- `/thumbs/baby/`

**Android Example:**

```
app/assets/android/images/res-mdpi/thumbs/baby/logo.png
app/assets/android/images/res-hdpi/thumbs/baby/logo.png
app/assets/android/images/res-xhdpi/thumbs/baby/logo.png
app/assets/android/images/res-xxhdpi/thumbs/baby/logo.png
app/assets/android/images/res-xxxhdpi/thumbs/baby/logo.png
```

**iPhone Example:**

```
app/assets/iphone/images/thumbs/baby/logo.png
app/assets/iphone/images/thumbs/baby/logo@2x.png
app/assets/iphone/images/thumbs/baby/logo@3x.png
```

You do **not** need to specify the full output path, just the subfolder as shown above. The script will handle the rest.

### Using Preset Source Folders

The alloy preset supports two configuration formats:

#### Legacy Format (Single Source per Platform)
Each platform (android/iphone) has its own source directory:

```json
"presets": {
  "alloy": {
    "android": {
      "source": "./images/alloy/android",
      "output": "thumbs/baby"
    },
    "iphone": {
      "source": "./images/alloy/iphone",
      "output": "thumbs/baby"
    }
  }
}
```

> **🔒 Note**: Scale factors are immutable and automatically applied based on Titanium standards. The `scales` property is no longer supported.

#### Multi-Configuration Format (Recommended)
Multiple configuration groups with independent source/output management:

```json
"presets": {
  "alloy": {
    "cards": {
      "android": {
        "source": "originals",
        "output": "cards/baby",
        "quality": 90,
        "format": "webp"
      },
      "iphone": {
        "source": "originals",
        "output": "cards/baby",
        "quality": 90,
        "format": "webp"
      }
    },
    "thumbs": {
      "android": {
        "source": "thumbs",
        "output": "thumbs/baby",
        "quality": 80,
        "format": "webp"
      },
      "iphone": {
        "source": "thumbs",
        "output": "thumbs/baby",
        "quality": 80,
        "format": "webp"
      }
    },
    "icons": {
      "android": {
        "source": "icons-4x",
        "output": "icons",
        "quality": 95,
        "format": "png"
      },
      "iphone": {
        "source": "icons-4x",
        "output": "icons",
        "quality": 95,
        "format": "png"
      }
    }
  }
}
```

**Benefits of Multi-Configuration Format:**
- **Batch Processing**: Process all image groups in one command
- **Independent Settings**: Each group can have different quality, format, source, and output
- **Workflow Optimization**: Perfect for game development with different asset types
- **Smart Detection**: Tool automatically detects and uses the appropriate format

Then you can simply run:

```bash
imgconvert -p alloy
```

The tool will automatically:
1. Detect if you're using legacy or multi-configuration format
2. Process each configuration group sequentially
3. Show progress for each configuration and platform
4. Provide detailed debug information when using `-d` flag

**Multi-Configuration Debug Output Example:**
```
Processing configuration: cards
  Processing android from: originals
  Processing iphone from: originals

Processing configuration: thumbs
  Processing android from: thumbs
  Processing iphone from: thumbs

Processed files:
 - app/assets/android/images/res-mdpi/cards/baby/card1.webp (config: cards, platform: android, scale: res-mdpi)
 - app/assets/android/images/res-hdpi/cards/baby/card1.webp (config: cards, platform: android, scale: res-hdpi)
 - app/assets/iphone/images/cards/baby/card1.webp (config: cards, platform: iphone, scale: 1x)
 - app/assets/iphone/images/cards/baby/card1@2x.webp (config: cards, platform: iphone, scale: 2x)
 - app/assets/android/images/res-mdpi/thumbs/baby/thumb1.webp (config: thumbs, platform: android, scale: res-mdpi)
 ...
```

### Practical Example: Game Development Workflow

Let's say you're developing a card game and have the following directory structure:

```
my-game/
├── originals/          # 4x resolution card images
│   ├── card1.png
│   ├── card2.png
│   └── card3.png
├── thumbs/             # 4x resolution thumbnail images
│   ├── card1.png
│   ├── card2.png
│   └── card3.png
├── icons-4x/           # 4x resolution icon images
│   ├── star.png
│   ├── coin.png
│   └── heart.png
└── .imgconverter.config.json
```

With this multi-configuration setup in your `.imgconverter.config.json`:

```json
{
  "presets": {
    "alloy": {
      "cards": {
        "android": {
          "source": "originals",
          "output": "cards/baby",
          "quality": 90,
          "format": "webp"
        },
        "iphone": {
          "source": "originals",
          "output": "cards/baby",
          "quality": 90,
          "format": "webp"
        }
      },
      "thumbs": {
        "android": {
          "source": "thumbs",
          "output": "thumbs/baby",
          "quality": 80,
          "format": "webp"
        },
        "iphone": {
          "source": "thumbs",
          "output": "thumbs/baby",
          "quality": 80,
          "format": "webp"
        }
      },
      "icons": {
        "android": {
          "source": "icons-4x",
          "output": "icons",
          "quality": 95,
          "format": "png"
        },
        "iphone": {
          "source": "icons-4x",
          "output": "icons",
          "quality": 95,
          "format": "png"
        }
      }
    }
  }
}
```

Run a single command:

```bash
imgconvert -p alloy
```

And get all these files automatically generated:

```
app/
└── assets/
    ├── android/
    │   └── images/
    │       ├── res-mdpi/
    │       │   ├── cards/baby/card1.webp (1x)
    │       │   ├── thumbs/baby/card1.webp (1x)
    │       │   └── icons/star.png (1x)
    │       ├── res-hdpi/
    │       │   ├── cards/baby/card1.webp (1.5x)
    │       │   ├── thumbs/baby/card1.webp (1.5x)
    │       │   └── icons/star.png (1.5x)
    │       ├── res-xhdpi/
    │       │   ├── cards/baby/card1.webp (2x)
    │       │   ├── thumbs/baby/card1.webp (2x)
    │       │   └── icons/star.png (2x)
    │       ├── res-xxhdpi/
    │       │   ├── cards/baby/card1.webp (3x)
    │       │   ├── thumbs/baby/card1.webp (3x)
    │       │   └── icons/star.png (3x)
    │       └── res-xxxhdpi/
    │           ├── cards/baby/card1.webp (4x)
    │           ├── thumbs/baby/card1.webp (4x)
    │           └── icons/star.png (4x)
    └── iphone/
        └── images/
            ├── cards/baby/card1.webp (1x)
            ├── cards/baby/card1@2x.webp (2x)
            ├── cards/baby/card1@3x.webp (3x)
            ├── thumbs/baby/card1.webp (1x)
            ├── thumbs/baby/card1@2x.webp (2x)
            ├── thumbs/baby/card1@3x.webp (3x)
            ├── icons/star.png (1x)
            ├── icons/star@2x.png (2x)
            └── icons/star@3x.png (3x)
```

**Advantages:**
- ✅ Process all asset types in one command
- ✅ Different quality settings for different asset types
- ✅ Different formats (WebP for cards/thumbs, PNG for icons)
- ✅ Organized output structure
- ✅ Perfect for CI/CD pipelines

## Best Practices for Alloy Selective Processing

### 🎯 Efficient Workflow Strategies

**1. Development Phase:**
```bash
# Test only what you're working on
imgconvert -p alloy:comics -d    # Enable debug mode to see detailed processing
```

**2. Adding New Asset Categories:**
```bash
# First, add your new configuration to .imgconverter.config.json
# Then process only the new category
imgconvert -p alloy:new-category
```

**3. Quality Testing:**
```bash
# Test different quality settings for specific configurations
imgconvert -p alloy:thumbs-comics -q 60  # Lower quality for thumbnails
imgconvert -p alloy:comics -q 95          # Higher quality for main assets
```

**4. CI/CD Integration:**
```bash
# Process only changed asset categories in your build pipeline
if [[ "$CHANGED_ASSETS" == *"comics"* ]]; then
  imgconvert -p alloy:comics
fi
```

### 🚀 Performance Tips

- **Use selective processing** during development to save time
- **Process all configurations** (`-p alloy`) only for final builds
- **Combine with debug mode** (`-d`) to monitor processing details
- **Leverage quality overrides** for different use cases without changing config files

### ⚠️ Common Gotchas

- Always verify configuration names exist before running automated scripts
- Remember that CLI arguments override preset settings
- Use consistent naming conventions for your configurations
- Test with debug mode first when setting up new configurations

## Configuration File

The configuration file `.imgconverter.config.json` allows you to define global default parameters and custom presets for image processing. This file is automatically created in the current working directory when you run `imgconvert config`.

### Configuration Precedence

The tool follows a consistent 4-level precedence system for all configuration parameters:

1. **CLI Arguments** (highest priority) - Values provided via command line flags
2. **Preset Settings** - Values defined in the specific preset being used
3. **Global Config** - Values in the `.imgconverter.config.json` file
4. **Default Values** (lowest priority) - Built-in fallback values

This means CLI arguments always override preset settings, preset settings override global config, and global config overrides defaults. This precedence applies to all parameters: `quality`, `format`, `width`, `height`, `output`, `replace-originals`, and `background`.

### Configuration Parameters

- **width**: Default width for image resizing.
- **height**: Default height for image resizing.
- **format**: Default format for image conversion.
- **quality**: Default quality for image compression.
- **replace-originals**: Default setting for replacing original files.
- **source**: Global default source folder for images. If not provided as a CLI argument or in a preset, this will be used as the input folder.
- **output**: Default output directory for processed images. If `null`, defaults to a `converted` directory at the same level as the source path.
- **background**: Hex color used to fill transparent areas only when converting images with transparency to formats that do not support it (e.g., PNG to JPEG). Ignored if the output format supports transparency.
- **presets**: Define custom presets for different use cases. Each preset can specify its own `format`, `quality`, `width`, `height`, `output`, and `source`. All preset configurations follow the precedence system: CLI arguments always override preset values, which override global config values.

### Default Configuration File

#### Legacy Alloy Format:
```json
{
  "width": null,
  "height": null,
  "quality": 85,
  "source": null,
  "output": null,
  "format": null,
  "replace-originals": false,
  "background": "#ffffff",
  "presets": {
    "web": { "source": null, "output": null, "format": "webp", "quality": 80 },
    "print": { "source": null, "output": null, "format": "tiff", "quality": 100 },
    "thumbnail": { "source": null, "output": null, "format": "png", "quality": 60, "width": 150, "height": 150 },
    "alloy": {
      "android": {
        "source": null,
        "output": null
      },
      "iphone": {
        "source": null,
        "output": null
      }
    }
  }
}
```

> **🔒 Note**: The `scales` property is no longer needed or supported. Scale factors are now immutable constants that follow Titanium standards (Android: res-mdpi to res-xxxhdpi, iOS: 1x to 3x).

#### Multi-Configuration Alloy Format (Recommended):
```json
{
  "width": null,
  "height": null,
  "quality": 85,
  "source": null,
  "output": null,
  "format": null,
  "replace-originals": false,
  "background": "#ffffff",
  "presets": {
    "web": { "source": null, "output": null, "format": "webp", "quality": 80 },
    "print": { "source": null, "output": null, "format": "tiff", "quality": 100 },
    "thumbnail": { "source": null, "output": null, "format": "png", "quality": 60, "width": 150, "height": 150 },
    "alloy": {
      "cards": {
        "android": {
          "source": "originals",
          "output": "cards/baby",
          "quality": 90,
          "format": "webp"
        },
        "iphone": {
          "source": "originals",
          "output": "cards/baby",
          "quality": 90,
          "format": "webp"
        }
      },
      "thumbs": {
        "android": {
          "source": "thumbs",
          "output": "thumbs/baby",
          "quality": 80,
          "format": "webp"
        },
        "iphone": {
          "source": "thumbs",
          "output": "thumbs/baby",
          "quality": 80,
          "format": "webp"
        }
      }
    }
  }
}
```

> **Note for Alloy Preset**: The `output` value should only contain the relative subfolder path (e.g., `"thumbs/baby"`), not the complete path. The base paths (`app/assets/android/images` and `app/assets/iphone/images`) are automatically handled by the tool.

**Example: How Precedence Works with Multi-Configuration**

Given this configuration file:
```json
{
  "quality": 75,
  "format": "jpeg",
  "presets": {
    "alloy": {
      "cards": {
        "android": {
          "quality": 90,
          "format": "webp"
        },
        "iphone": {
          "quality": 95,
          "format": "png"
        }
      },
      "thumbs": {
        "android": {
          "quality": 70,
          "format": "webp"
        },
        "iphone": {
          "quality": 75,
          "format": "webp"
        }
      }
    }
  }
}
```

Different command scenarios would result in:

- `imgconvert -p alloy` →
  - Cards: Android WebP at 90%, iPhone PNG at 95%
  - Thumbs: Android WebP at 70%, iPhone WebP at 75%
- `imgconvert -p alloy -q 80` → All platforms and configurations use JPEG at 80% (CLI overrides everything)
- `imgconvert -p alloy -f jpeg` →
  - Cards: Android JPEG at 90%, iPhone JPEG at 95%
  - Thumbs: Android JPEG at 70%, iPhone JPEG at 75%
- `imgconvert -p alloy -f webp -q 85` → All platforms and configurations use WebP at 85% (CLI overrides everything)

## Debug Mode

When debug mode is enabled with the `-d` or `--debug` option, the tool displays detailed information about the processing, including configuration-specific details for alloy presets.

**Sample Debug Output (Standard Processing):**
```
Processing complete! Summary:
  - Processed files: 5
  - Total original size: 0.87 MB
  - Total new size: 0.25 MB
  - Total savings: 71.11%
  - Duration: 0.24 seconds
```

**Sample Debug Output (Multi-Configuration Alloy):**
```
Processing configuration: cards
  Processing android from: originals
  Processing iphone from: originals

Processing configuration: thumbs
  Processing android from: thumbs
  Processing iphone from: thumbs

Processed files:
 - app/assets/android/images/res-mdpi/cards/baby/card1.webp (config: cards, platform: android, scale: res-mdpi)
 - app/assets/android/images/res-hdpi/cards/baby/card1.webp (config: cards, platform: android, scale: res-hdpi)
 - app/assets/iphone/images/cards/baby/card1.webp (config: cards, platform: iphone, scale: 1x)
 - app/assets/iphone/images/cards/baby/card1@2x.webp (config: cards, platform: iphone, scale: 2x)
 - app/assets/android/images/res-mdpi/thumbs/baby/thumb1.webp (config: thumbs, platform: android, scale: res-mdpi)
 ...

Processing complete! Summary:
  - Processed files: 24
  - Total original size: 2.45 MB
  - Total new size: 0.89 MB
  - Total savings: 63.67%
  - Duration: 1.24 seconds
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

**Q: Permission denied error**
A: Run with sudo on macOS/Linux: `sudo imgconvert ...` or check file/directory permissions.

**Q: Sharp installation fails**
A: Install build tools:
```bash
# On macOS
xcode-select --install

# On Ubuntu/Debian
sudo apt-get install build-essential

# On Windows
npm install -g windows-build-tools

# Alternative: install node-gyp globally
npm install -g node-gyp
```

**Q: Out of memory on large batches**
A: Process in smaller batches or increase Node.js memory:
```bash
node --max-old-space-size=4096 $(which imgconvert) large-folder/
```

**Q: Images appear blurry or pixelated**
A: Ensure source images are high enough resolution. For Alloy preset, use 4x resolution source images for best results.

**Q: Alloy preset not generating expected output structure**
A: Verify your configuration file format and ensure output paths don't include leading/trailing slashes (use `"thumbs/baby"` not `"/thumbs/baby/"`)

## Contributing

We welcome contributions! Here's how you can help improve imgconvert-cli:

### Quick Contributions
- 🐛 Report bugs or issues
- 💡 Suggest new features
- 📖 Improve documentation
- ⭐ Star the repository if you find it useful

### Development Setup

1. **Fork the repository**
   ```bash
   # On GitHub, click the "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/imgconvert-cli.git
   cd imgconvert-cli
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Create your feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

6. **Make your changes and test**
   ```bash
   # Make your changes
   npm test
   npm run lint
   ```

7. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

8. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

9. **Open a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Provide a clear description of your changes

### Development Guidelines

- **Code Style**: Follow the existing code style and use ESLint
- **Tests**: Add tests for new features and ensure all tests pass
- **Documentation**: Update README.md if you change functionality
- **Commits**: Use clear, descriptive commit messages
- **Issues**: Reference relevant issues in your PR description

### Areas for Contribution

- 🚀 **Performance optimizations** for large batch processing
- 🎨 **New presets** for specific use cases (social media, print, etc.)
- 🔧 **CLI improvements** and user experience enhancements
- 📱 **Additional mobile frameworks** support beyond Titanium
- 🧪 **Testing improvements** and edge case coverage
- 📚 **Documentation** examples and tutorials

## Roadmap / Future Features

### Near Term (v2.x)
- [ ] **CLI wizard** for preset configuration setup
- [ ] **Progress bars** for large batch operations
- [ ] **Parallel processing** for faster batch conversion
- [ ] **Image optimization analysis** with recommendations

### Medium Term (v3.x)
- [ ] **Plugin system** for custom transformations
- [ ] **Cloud storage integration** (AWS S3, Google Cloud)
- [ ] **Web UI** for visual configuration
- [ ] **Docker support** for containerized workflows

### Long Term (v4.x+)
- [ ] **AI-powered optimization** suggestions
- [ ] **Integration** with popular build tools (Webpack, Vite, etc.)
- [ ] **Advanced filtering** and conditional processing
- [ ] **Batch undo/rollback** functionality

> 💡 **Have an idea?** Open an issue to discuss new features or improvements!

## License

This project is licensed under the MIT License.

**Copyright (c) 2025 César Estrada**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

<div align="center">

**Made with ❤️ by [César Estrada](https://github.com/macCesar)**

[⭐ Star on GitHub](https://github.com/macCesar/imgconvert-cli) • [🐛 Report Bug](https://github.com/macCesar/imgconvert-cli/issues) • [💡 Request Feature](https://github.com/macCesar/imgconvert-cli/issues)

</div>
