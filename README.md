# imgconvert-cli

<div align="center">

  ![npm version](https://img.shields.io/npm/v/imgconvert-cli)
  ![Node.js Version](https://img.shields.io/node/v/imgconvert-cli)
  ![downloads](https://img.shields.io/npm/dm/imgconvert-cli)
  ![license](https://img.shields.io/npm/l/imgconvert-cli)
  ![test coverage](https://img.shields.io/badge/tests-74%20passing-brightgreen)
  ![GitHub Stars](https://img.shields.io/github/stars/macCesar/imgconvert-cli)

</div>

`imgconvert-cli` is a powerful command-line tool for compressing, converting, and resizing images using the `sharp` library. It supports various formats and lets you optimize images for the web or other purposes, with customizable quality, background color, advanced resizing strategies, and multi-format conversion.

## 🚀 Quick Start

```bash
# Install globally
npm install -g imgconvert-cli

# Compress images (preserves original format)
imgconvert my-images

# Convert to WebP with 80% quality
imgconvert my-images -f webp -q 80

# Advanced resizing with cover strategy (crops to fill dimensions)
imgconvert photo.jpg --fit cover --position center -w 400 -h 400 -f webp

# Manual cropping: extract specific region then resize
imgconvert photo.jpg --crop 100,50,800,600 -w 400 -h 300 -f webp

# Canvas resize: maintain original image, add transparent padding
imgconvert photo.png --canvas -h 1660
imgconvert design.png --canvas -w 800 -h 600 -f webp

# Custom file naming and batch renaming
imgconvert photo.jpg --name "hero-banner" -f webp
imgconvert photos --rename "lowercase,replace-spaces,prefix:web-" -f webp

# Generate mobile app assets (all configurations)
imgconvert source-images -p alloy

# Generate specific mobile app assets (user-defined configurations)
imgconvert -p alloy:your-config-name
imgconvert -p alloy:another-config
```

## 🎯 Common Use Cases

- **Web Optimization**: Batch convert images to WebP for faster loading times
- **Perfect Thumbnails**: Use `--fit cover` with `--position` for consistent square thumbnails
- **Hero Images**: Crop images to exact dimensions while preserving important content areas
- **Canvas Design**: Use `--canvas` to maintain original images while extending to exact canvas dimensions
- **Transparent Backgrounds**: Resize PNG images without losing transparency using `--canvas`
- **Mobile App Development**: Generate multi-resolution assets for iOS/Android with Titanium Alloy
- **Selective Asset Updates**: Use `imgconvert -p alloy:config-name` to update only specific user-defined asset categories
- **Print Preparation**: Convert to high-quality TIFF format for professional printing
- **Custom Cropping**: Extract specific regions before resizing with `--crop`
- **Batch Processing**: Convert entire directories while preserving folder structure
- **File Organization**: Use custom naming and batch renaming for consistent file naming conventions
- **SEO-Friendly Filenames**: Convert spaces to hyphens and apply lowercase for web-ready filenames

## 📊 Performance

Typical compression results:
- **JPEG → WebP**: 25-35% size reduction
- **PNG → WebP**: 40-60% size reduction
- **Batch processing**: ~50-100 images/second
- **Memory efficient**: Processes large batches without memory issues

## 📊 Project Stats

- **Platforms**: macOS, Linux, Windows
- **Bundle Size**: ~45KB (excluding Sharp)
- **Test Coverage**: 74 comprehensive tests
- **Dependencies**: 3 (sharp, minimist, chalk)

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Options](#options)
- [File Naming and Batch Renaming](#file-naming-and-batch-renaming)
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
- **Advanced Resizing Strategies**: Control how images fit target dimensions with multiple strategies (cover, contain, fill, inside, outside)
- **Smart Positioning**: Choose which part of the image to preserve when cropping (center, top, bottom, left, right, corners)
- **Manual Cropping**: Extract specific regions before resizing with precise coordinate control
- **File and Batch Processing**: Process a single image file or all images in a directory
- **Smart Extension Handling**: Preserves original file extensions when no format conversion is specified
- **Custom File Naming**: Rename individual files or apply batch renaming strategies during processing
- **Batch Renaming Strategies**: Enumerate, lowercase, replace spaces, add prefixes/suffixes, and combine multiple strategies
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

| Option                | Alias | Description                                                                             | Default                                    |
| --------------------- | ----- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| `--format`            | `-f`  | Output format: `jpeg`, `png`, `webp`, `avif`, `tiff`, `gif`, `all`                      | Original format                            |
| `--quality`           | `-q`  | Quality (1-100)                                                                         | 85                                         |
| `--background`        | `-b`  | Background color when converting from transparent formats to non-transparent formats    | Transparent for PNG/WebP, #ffffff for JPEG |
| `--width`             | `-w`  | Output width in pixels                                                                  | -                                          |
| `--height`            | `-h`  | Output height in pixels                                                                 | -                                          |
| `--output`            | `-o`  | Output directory                                                                        | Same as source                             |
| `--preset`            | `-p`  | Apply preset: `web`, `print`, `thumbnail`, `alloy`                                      | -                                          |
| `--fit`               | -     | Resize strategy: `cover`, `contain`, `fill`, `inside`, `outside`                        | `contain`                                  |
| `--position`          | -     | Crop position: `center`, `top`, `bottom`, `left`, `right`, corners                      | `center`                                   |
| `--crop`              | -     | Manual crop coordinates: `left,top,width,height`                                        | -                                          |
| `--canvas`            | -     | Resize canvas instead of image (maintains original, adds padding)                       | `false`                                    |
| `--name`              | `-n`  | Custom filename for single file processing                                              | -                                          |
| `--rename`            | -     | Batch rename strategy: `enumerate`, `lowercase`, `replace-spaces`, `prefix:`, `suffix:` | -                                          |
| `--replace-originals` | -     | Replace original files                                                                  | `false`                                    |
| `--debug`             | `-d`  | Enable debug mode                                                                       | `false`                                    |
| `--version`           | `-v`  | Show version                                                                            | -                                          |
| `--help`              | `-H`  | Show help message                                                                       | -                                          |

## Advanced Resize and Crop Control

The Sharp library integration provides powerful image manipulation capabilities with precise control over how images are resized and cropped.

**Processing Workflow**: Manual Crop → Resize → Format Conversion

### Fit Strategies (`--fit`)

Controls how images are resized when both width and height are specified:

| Strategy  | Behavior                           | Use Case                | Aspect Ratio |
| --------- | ---------------------------------- | ----------------------- | ------------ |
| `contain` | Shrink to fit, letterbox if needed | Preserve entire image   | Preserved    |
| `cover`   | Crop to fill dimensions exactly    | Hero images, thumbnails | Preserved    |
| `fill`    | Stretch to exact dimensions        | Icons, backgrounds      | Ignored      |
| `inside`  | Only shrink, never enlarge         | High-res source images  | Preserved    |
| `outside` | Only enlarge, never shrink         | Upscaling small images  | Preserved    |

### Position Control (`--position`)

When using `--fit cover` or `--fit contain`, controls which part of the image to preserve or focus on:

| Position       | Description                  | Best For                 |
| -------------- | ---------------------------- | ------------------------ |
| `center`       | Focus on center (default)    | General purpose          |
| `top`          | Focus on top edge            | Portraits, faces         |
| `bottom`       | Focus on bottom edge         | Architecture             |
| `left`         | Focus on left edge           | Portraits (left-facing)  |
| `right`        | Focus on right edge          | Portraits (right-facing) |
| `top left`     | Focus on top-left corner     | Documents, logos         |
| `top right`    | Focus on top-right corner    | UI screenshots           |
| `bottom left`  | Focus on bottom-left corner  | Signatures               |
| `bottom right` | Focus on bottom-right corner | Watermarks               |

### Manual Cropping (`--crop`)

Extract specific regions before resizing:

- **Format**: `left,top,width,height` (all in pixels)
- **Example**: `--crop 100,50,800,600` crops 800x600 region starting at (100,50)
- **Workflow**: Cropping is applied first, then resizing with fit/position options

### Canvas Resize vs Image Resize (`--canvas`)

Choose between two different resizing approaches:

#### Standard Resize (Default)
- **Use case**: Traditional image resizing
- **Behavior**: Scales the image proportionally
- **Transparency**: Preserves existing transparency

```bash
imgconvert photo.png -h 1660
# 1024x1536 → 1107x1660 (proportional scaling)
```

#### Canvas Resize (`--canvas`)
- **Use case**: Design layouts, maintaining exact canvas sizes
- **Behavior**: Maintains original image, adds padding to reach target dimensions
- **Transparency**: Adds transparent padding for PNG/WebP, white for JPEG

```bash
imgconvert photo.png --canvas -h 1660
# 1024x1536 → 1024x1660 (original image + transparent padding)

imgconvert photo.png --canvas -h 1660 -b "#ff0000"
# 1024x1536 → 1024x1660 (original image + red padding)
```

| Aspect               | Standard Resize         | Canvas Resize (`--canvas`) |
| -------------------- | ----------------------- | -------------------------- |
| **Image scaling**    | ✅ Scales proportionally | ❌ Maintains original size  |
| **Exact dimensions** | ❌ Respects aspect ratio | ✅ Exact target dimensions  |
| **Transparency**     | Preserves existing      | ✅ Adds transparent padding |
| **Use case**         | Photo resizing          | Design layouts, mockups    |

## File Naming and Batch Renaming

The tool provides flexible options for customizing output filenames when processing images.

### Single File Naming (`--name`, `-n`)

Rename individual files during processing:

```bash
imgconvert photo.jpg --name "hero-image" -f webp
# Output: hero-image.webp
```

**Important**: The `--name` option only works with single files, not directories.

### Batch Renaming Strategies (`--rename`)

Apply systematic renaming to multiple files:

| Strategy         | Description                 | Example Input  | Example Output    |
| ---------------- | --------------------------- | -------------- | ----------------- |
| `enumerate`      | Add sequential numbers      | `photo.jpg`    | `001-photo.jpg`   |
| `lowercase`      | Convert to lowercase        | `MyPhoto.JPG`  | `myphoto.jpg`     |
| `replace-spaces` | Replace spaces with hyphens | `my photo.png` | `my-photo.png`    |
| `prefix:text`    | Add prefix to filename      | `image.jpg`    | `thumb-image.jpg` |
| `suffix:text`    | Add suffix to filename      | `image.jpg`    | `image-small.jpg` |

### Combining Strategies

Multiple rename strategies can be combined by separating them with commas:

```bash
imgconvert photos --rename "lowercase,replace-spaces,prefix:web-"
# "My Photo.jpg" → "web-my-photo.jpg"

imgconvert images --rename "prefix:gallery-,enumerate"
# "photo.jpg" → "gallery-001-photo.jpg"
```

**Visual Order**: Strategies are applied to build the filename in visual order from left to right, making the result predictable and intuitive.

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

### Advanced Resizing and Cropping

4. **Smart resizing strategies:**
   ```bash
   # Cover strategy: crop to fill exact dimensions
   imgconvert photo.jpg --fit cover -w 400 -h 400

   # Contain strategy: fit inside dimensions (default)
   imgconvert photo.jpg --fit contain -w 400 -h 400

   # Fill strategy: stretch to exact dimensions
   imgconvert photo.jpg --fit fill -w 400 -h 400
   ```

5. **Control cropping position with cover strategy:**
   ```bash
   # Keep the top part when cropping
   imgconvert portrait.jpg --fit cover --position top -w 300 -h 300

   # Keep the center (default)
   imgconvert photo.jpg --fit cover --position center -w 300 -h 300

   # Keep specific corners
   imgconvert image.jpg --fit cover --position "top left" -w 400 -h 400
   ```

6. **Control positioning with contain strategy (letterboxing):**
   ```bash
   # Position image at top of canvas when letterboxing
   imgconvert wide-image.jpg --fit contain --position top -w 400 -h 400

   # Position image at bottom-right when letterboxing
   imgconvert landscape.jpg --fit contain --position "bottom right" -w 600 -h 600
   ```

7. **Manual cropping before resizing:**
   ```bash
   # Crop specific region then resize
   imgconvert image.png --crop 100,50,300,200 -w 200 -h 150

   # Crop and convert format
   imgconvert photo.jpg --crop 0,0,500,500 --fit cover -w 300 -h 300 -f webp
   ```

8. **Canvas resizing (maintain original image, add padding):**
   ```bash
   # Resize canvas to larger dimensions with transparent padding
   imgconvert photo.png --canvas -h 1660
   # Original 1024x1536 → Output 1024x1660 with transparent padding

   # Resize canvas with custom background color
   imgconvert photo.png --canvas -h 1660 -b "#ffffff"
   # Adds white padding instead of transparent

   # Resize canvas to exact dimensions
   imgconvert image.jpg --canvas -w 800 -h 600 -f png
   # Maintains original image centered, adds transparent padding to reach 800x600
   ```

### File Naming and Renaming

9. **Custom naming for single files:**
   ```bash
   # Rename during conversion
   imgconvert hero-photo.jpg --name "main-banner" -f webp
   # Output: main-banner.webp

   # Custom name with resizing
   imgconvert profile.png --name "avatar" --fit cover -w 200 -h 200
   # Output: avatar.png
   ```

10. **Batch renaming strategies:**
   ```bash
   # Add sequential numbers
   imgconvert photos --rename enumerate -f webp
   # photo1.jpg → 001-photo1.webp, photo2.jpg → 002-photo2.webp

   # Convert to lowercase and replace spaces
   imgconvert "My Photos" --rename "lowercase,replace-spaces"
   # "My Photo.JPG" → "my-photo.jpg"

   # Add prefix for organization
   imgconvert thumbnails --rename "prefix:thumb-" -w 150 -h 150
   # image.jpg → thumb-image.jpg
   ```

9. **Advanced renaming combinations:**
   ```bash
   # Multiple strategies for web optimization
   imgconvert uploads --rename "lowercase,replace-spaces,suffix:-optimized" -f webp -q 80
   # "Product Photo.png" → "product-photo-optimized.webp"

   # Enumerated thumbnails with prefix
   imgconvert gallery --rename "prefix:gallery-,enumerate" --fit cover -w 300 -h 300
   # photo.jpg → gallery-001-photo.jpg
   ```

### Real-World Examples

10. **Perfect for web development:**
    ```bash
    # Social media thumbnails with organized naming
    imgconvert profiles --fit cover --position top -w 150 -h 150 -f webp --rename "prefix:profile-,enumerate"

    # Product images with consistent dimensions and clean filenames
    imgconvert products --fit contain -w 800 -h 600 -f webp -q 90 --rename "lowercase,replace-spaces"

    # Hero banners with descriptive names
    imgconvert heroes --fit cover --position center -w 1920 -h 800 -f webp --rename "suffix:-hero"
    ```

11. **Mobile app assets with systematic naming:**
    ```bash
    # Square app icons with size indicators
    imgconvert icons --fit cover --position center -w 512 -h 512 -f png --rename "suffix:-512"

    # Profile pictures with enumeration
    imgconvert avatars --fit cover --position top -w 200 -h 200 -f webp --rename "prefix:avatar-,enumerate"
    ```

12. **E-commerce and content management:**
    ```bash
    # Product catalog with clean, SEO-friendly names
    imgconvert "Product Photos" --rename "lowercase,replace-spaces,prefix:product-" -f webp -q 85
    # "Blue Shirt Medium.jpg" → "product-blue-shirt-medium.webp"

    # Blog post images with consistent naming
    imgconvert blog-images --rename "lowercase,replace-spaces,suffix:-post" -w 800 -q 80
    # "My Great Article Photo.png" → "my-great-article-photo-post.png"
    ```

    # Profile pictures
    imgconvert avatars --fit cover --position top -w 200 -h 200 -f webp
    ```

12. **Use alloy preset with platform-specific formats:**
    ```bash
    imgconvert source_folder -p alloy
    # Generates images for ALL configurations (comics, thumbs-comics, baby, thumbs-baby)
    ```

13. **Process specific alloy configurations (user-defined):**
    ```bash
    imgconvert -p alloy:your-cards-config
    # Processes ONLY the 'your-cards-config' configuration (both Android and iPhone)
    # Note: 'your-cards-config' must be defined in your .imgconverter.config.json

    imgconvert -p alloy:your-thumbnails-config
    # Processes ONLY the 'your-thumbnails-config' configuration
    # Note: 'your-thumbnails-config' must be defined in your .imgconverter.config.json

    imgconvert -p alloy:your-icons-config
    # Processes ONLY the 'your-icons-config' configuration
    # Note: 'your-icons-config' must be defined in your .imgconverter.config.json
    ```

14. **Override preset settings with CLI arguments:**
    ```bash
    imgconvert source_folder -p alloy -f png -q 95
    # CLI arguments override preset: both Android and iPhone will use PNG at 95% quality

    imgconvert -p alloy:your-cards-config -q 90
    # Only 'your-cards-config' configuration with 90% quality override
    # Note: 'your-cards-config' must be defined in your .imgconverter.config.json
    ```

15. **Use preset settings with partial CLI override:**
    ```bash
    imgconvert source_folder -p alloy -q 80
    # Only quality is overridden: Android uses WebP, iPhone uses PNG, both at 80% quality

    imgconvert -p alloy:your-config-name -f webp
    # Only your-config-name configuration, forced to WebP format for both platforms
    # Note: 'your-config-name' must be defined in your .imgconverter.config.json
    ```

16. **Extract and optimize specific image regions with manual cropping:**
    ```bash
    # Extract a product from a larger photo and create web-optimized thumbnails
    imgconvert product-photo.jpg --crop 200,150,600,800 -w 300 -h 400 -f webp -q 85

    # Create hero image by cropping center portion from high-res photo
    imgconvert landscape.jpg --crop 500,100,1920,800 --fit cover -w 1200 -h 500 -f webp

    # Extract faces from group photos for profile pictures
    imgconvert group-photo.jpg --crop 350,200,500,500 --fit cover -w 150 -h 150 -f webp
    ```

### Utility Operations

18. **Specify a custom output directory:**
    ```bash
    imgconvert source_folder -o custom_output_directory
    ```

19. **Enable debug mode:**
    ```bash
    imgconvert source_folder -d
    ```

20. **Check the version of the module:**
    ```bash
    imgconvert --version
    ```

21. **Show help message:**
    ```bash
    imgconvert --help
    ```

## File Extension Behavior

`imgconvert-cli` has intelligent file extension handling:

### **Preserve Original Extensions**
When no format is specified with `-f`, the original file extension is preserved:

| Input       | Command                | Output      |
| ----------- | ---------------------- | ----------- |
| `logo.png`  | `imgconvert logo.png`  | `logo.png`  |
| `icon.webp` | `imgconvert icon.webp` | `icon.webp` |
| `photo.jpg` | `imgconvert photo.jpg` | `photo.jpg` |

### **Format Conversion Changes Extensions**
When using `-f` to specify a format, the extension changes accordingly:

| Input       | Command                        | Output       |
| ----------- | ------------------------------ | ------------ |
| `logo.png`  | `imgconvert logo.png -f jpeg`  | `logo.jpeg`  |
| `icon.webp` | `imgconvert icon.webp -f png`  | `icon.png`   |
| `photo.jpg` | `imgconvert photo.jpg -f webp` | `photo.webp` |

> **💡 Tip:** This behavior ensures consistency and user expectations while maintaining technical compatibility with the Sharp image processing library.

## Presets

Presets are predefined configurations for common use cases:

- **web**: Optimized for the web (`webp`, quality `80`). Optionally defines a `source` path.
- **print**: High-quality output (`tiff`, quality `100`). Optionally defines a `source` path.
- **thumbnail**: Small previews (`png`, quality `60`, 150x150). Optionally defines a `source` path.
- **square-thumbs**: Consistent square thumbnails (`webp`, quality `80`, 300x300). Optionally defines a `source` path.
- **hero-images**: High-quality hero images (`webp`, quality `85`, 1920x1080). Optionally defines a `source` path.
- **alloy**: For Titanium SDK, generates images at multiple resolutions for Android and iOS. Supports both legacy single-source format and new multi-configuration format for complex workflows (e.g., cards, thumbnails, icons). Each platform can define its own `source` path. You can process all configurations with `-p alloy` or target specific ones with `-p alloy:configName` where `configName` is your custom configuration defined in `.imgconverter.config.json`.

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
      "output": "email/assets",
      "source": "content/images"
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
imgconvert photos -p instagram-post
imgconvert products -p product-catalog
imgconvert banner.png -p email-newsletter

# Override preset settings with CLI arguments
imgconvert photos -p instagram-post -q 95  # Uses Instagram preset but with 95% quality

# Use selective configuration with custom alloy presets
imgconvert -p alloy:your-game-cards    # Process only your-game-cards configuration
imgconvert -p alloy:your-config-name -q 90  # Process only your-config-name with custom quality
# Note: These configurations must be defined in your .imgconverter.config.json
```

### Key Features

- **Source and output paths** can be predefined in presets
- **Reusable configurations** for consistent processing across projects
- **Workflow optimization**: Perfect for batch processing with consistent requirements
- **CLI override capability**: Command line arguments always take precedence over preset values
- **Full parameter support**: quality, format, width, height, background, source, output, replace-originals

📖 **[Complete Custom Presets Guide](custom_presets.md)** - See advanced examples, best practices, and complex workflows including social media, e-commerce, email marketing, and development environment presets.

## Why Choose imgconvert-cli?

| Feature                 | imgconvert-cli | ImageMagick | Sharp CLI |
| ----------------------- | -------------- | ----------- | --------- |
| Easy Setup              | ✅              | ❌           | ✅         |
| Batch Processing        | ✅              | ✅           | ❌         |
| Mobile Presets          | ✅              | ❌           | ❌         |
| Custom Presets          | ✅              | ❌           | ❌         |
| Config File             | ✅              | ❌           | ❌         |
| Extension Preservation  | ✅              | ❌           | ❌         |
| Multi-Format Output     | ✅              | ✅           | ❌         |
| **Comprehensive Tests** | **✅**          | **❌**       | **❌**     |

## Alloy Preset

The `alloy` preset is specifically designed for mobile app development with Titanium Alloy framework. It generates multiple scaled versions of images for both Android and iOS platforms.

### Key Features:
- **Legacy compatibility**: Maintains backward compatibility with existing alloy configurations
- **Automatic scaling**: Creates multiple resolution versions based on predefined scale factors
- **4x source requirement**: Source images should be 4x the target resolution for optimal results
- **Platform-specific output**: Generates Android density folders and iOS @2x/@3x naming conventions
- **Flexible quality/format control**: Per-configuration quality and format settings with proper precedence
- **Immutable scale factors**: Uses fixed Titanium-standard scale factors for consistency and compatibility
- **Ignores width/height**: The `width` and `height` parameters are ignored as images are scaled proportionally
- **Multi-configuration support**: Process multiple image groups (cards, thumbnails, icons) in a single command
- **Independent source management**: Each configuration can have its own source directories and output paths
- **Selective configuration processing**: Target specific configurations with `alloy:configName` syntax for efficient workflows

### Selective Configuration Processing:
The alloy preset now supports targeting specific configurations, which is perfect for:

- **Resource Efficiency**: Save time and processing power by targeting exactly what you need
- **CI/CD Optimization**: Update only the asset categories that have changed in your build pipeline
- **Development Workflow**: Test specific configurations quickly without waiting for all assets to be processed
- **Incremental Updates**: When adding new design categories (like 'neon'), process only the new assets without regenerating everything

**Examples:**
```bash
# Process all configurations (default behavior)
imgconvert -p alloy

# Process only your custom assets configuration
imgconvert -p alloy:your-config-name

# Process only your thumbnail variants (user-defined configurations)
imgconvert -p alloy:your-thumbs-config1
imgconvert -p alloy:your-thumbs-config2

# Perfect for adding new categories
imgconvert -p alloy:your-new-category  # Only process your custom 'new-category' configuration
# Note: All configuration names must be defined in your .imgconverter.config.json
```

### Scale Factors:
Scale factors are **immutable constants** that follow Titanium platform standards and cannot be modified:
- **iOS**: 1x, 2x, 3x
- **Android**: res-mdpi (1x), res-hdpi (1.5x), res-xhdpi (2x), res-xxhdpi (3x), res-xxxhdpi (4x)

> **🔒 Note**: Scale factors are fixed to ensure Titanium compatibility and cannot be customized. This prevents configuration errors and maintains consistency with Titanium SDK requirements.

### Usage:

#### Process All Configurations:
```bash
# Legacy format (single android/iphone configuration)
imgconvert source-images -p alloy

# Multi-configuration format (all configuration groups)
imgconvert -p alloy
```

#### Process Specific Configuration:
```bash
# Process only your custom configuration
imgconvert -p alloy:your-config-name

# Process only your custom thumbnail configurations
imgconvert -p alloy:your-thumbs-config1
imgconvert -p alloy:your-thumbs-config2

# Process only your custom configuration
imgconvert -p alloy:another-config-name
# Note: All configuration names must be defined in your .imgconverter.config.json
```

#### Single Configuration (Legacy Format):
```bash
imgconvert source-images -p alloy
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
      "output": "thumbs/baby",
      "source": "android-source-folder"
    },
    "iphone": {
      "output": "thumbs/baby",
      "source": "iphone-source-folder"
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
        "quality": 90,
        "format": "webp",
        "source": "originals",
        "output": "cards/baby"
      },
      "iphone": {
        "quality": 90,
        "format": "webp",
        "source": "originals",
        "output": "cards/baby"
      }
    },
    "thumbs": {
      "android": {
        "quality": 80,
        "format": "webp",
        "output": "thumbs/baby",
        "source": "original-thumbs"
      },
      "iphone": {
        "quality": 80,
        "format": "webp",
        "output": "thumbs/baby",
        "source": "original-thumbs"
      }
    },
    "icons": {
      "android": {
        "quality": 95,
        "format": "png",
        "output": "icons",
        "source": "icons-4x"
      },
      "iphone": {
        "quality": 95,
        "format": "png",
        "output": "icons",
        "source": "icons-4x"
      }
    }
  }
}
```

**Benefits of Multi-Configuration Format:**
- **Batch Processing**: Process all image groups in one command
- **Smart Detection**: Tool automatically detects and uses the appropriate format
- **Workflow Optimization**: Perfect for game development with different asset types
- **Independent Settings**: Each group can have different quality, format, source, and output

Then you can simply run:

```bash
imgconvert -p alloy
```

The tool will automatically:
1. Process each configuration group sequentially
2. Show progress for each configuration and platform
3. Provide detailed debug information when using `-d` flag
4. Detect if you're using legacy or multi-configuration format

**Multi-Configuration Debug Output Example:**
```
Processing configuration: cards
  Processing android from: originals
  Processing iphone from: originals

Processing configuration: thumbs
  Processing android from: original-thumbs
  Processing iphone from: original-thumbs

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

### Practical Example: Game Development Workflow

Let's say you're developing a card game and have the following directory structure:

```
my-game/
├── originals/          # 4x resolution card images
│   ├── card1.png
│   ├── card2.png
│   └── card3.png
├── original-thumbs/    # 4x resolution thumbnail images
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
          "quality": 90,
          "format": "webp",
          "source": "originals",
          "output": "cards/baby"
        },
        "iphone": {
          "quality": 90,
          "format": "webp",
          "source": "originals",
          "output": "cards/baby"
        }
      },
      "thumbs": {
        "android": {
          "quality": 80,
          "format": "webp",
          "output": "thumbs/baby",
          "source": "original-thumbs"
        },
        "iphone": {
          "quality": 80,
          "format": "webp",
          "output": "thumbs/baby",
          "source": "original-thumbs"
        }
      },
      "icons": {
        "android": {
          "quality": 95,
          "format": "png",
          "output": "icons",
          "source": "icons-4x"
        },
        "iphone": {
          "quality": 95,
          "format": "png",
          "output": "icons",
          "source": "icons-4x"
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
            ├── cards/baby/
            │   ├── card1.webp (1x)
            │   ├── card1@2x.webp (2x)
            │   └── card1@3x.webp (3x)
            ├── thumbs/baby/
            │   ├── card1.webp (1x)
            │   ├── card1@2x.webp (2x)
            │   └── card1@3x.webp (3x)
            └── icons/
                ├── star.png (1x)
                ├── star@2x.png (2x)
                └── star@3x.png (3x)
```

**Advantages:**
- ✅ Organized output structure
- ✅ Perfect for CI/CD pipelines
- ✅ Process all asset types in one command
- ✅ Different quality settings for different asset types
- ✅ Different formats (WebP for cards/thumbs, PNG for icons)

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
imgconvert -p alloy:comics -q 95          # Higher quality for main assets
imgconvert -p alloy:thumbs-comics -q 60   # Lower quality for thumbnails
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
- **Combine with debug mode** (`-d`) to monitor processing details
- **Process all configurations** (`-p alloy`) only for final builds
- **Leverage quality overrides** for different use cases without changing config files

### ⚠️ Common Gotchas

- Remember that CLI arguments override preset settings
- Use consistent naming conventions for your configurations
- Test with debug mode first when setting up new configurations
- Always verify configuration names exist before running automated scripts

## Configuration File

The configuration file `.imgconverter.config.json` allows you to define global default parameters and custom presets for image processing.

**Quick Start:**
You can generate a default configuration file at any time by running:

```bash
imgconvert config
```

### Configuration Precedence

The tool follows a consistent 4-level precedence system for all configuration parameters:

1. **CLI Arguments** (highest priority) - Values provided via command line flags
2. **Preset Settings** - Values defined in the specific preset being used
3. **Global Config** - Values in the `.imgconverter.config.json` file
4. **Default Values** (lowest priority) - Built-in fallback values

This means CLI arguments always override preset settings, preset settings override global config, and global config overrides defaults. This precedence applies to all parameters: `quality`, `format`, `width`, `height`, `output`, `replace-originals`, `background`, `fit`, `position`, and `crop`.

### Configuration Parameters

- **width**: Default width for image resizing.
- **height**: Default height for image resizing.
- **format**: Default format for image conversion.
- **quality**: Default quality for image compression.
- **fit**: Default resize strategy (`cover`, `contain`, `fill`, `inside`, `outside`).
- **position**: Default cropping position for `fit: cover` (`center`, `top`, `bottom`, `left`, `right`, corners).
- **crop**: Default crop coordinates in format `left,top,width,height`.
- **canvas**: Default setting for canvas resize mode (maintains original image, adds padding instead of scaling).
- **replace-originals**: Default setting for replacing original files.
- **source**: Global default source folder for images. If not provided as a CLI argument or in a preset, this will be used as the input folder.
- **output**: Default output directory for processed images. If `null`, defaults to a `converted` directory at the same level as the source path.
- **background**: Background color used when resizing images to larger dimensions or when converting from transparent formats (PNG, WebP) to non-transparent formats (JPEG). For PNG and WebP outputs, transparency is preserved by default. Only applies to JPEG conversion or when explicitly specified.
- **presets**: Define custom presets for different use cases. Each preset can specify its own `format`, `quality`, `width`, `height`, `output`, `source`, `fit`, `position`, and `crop`. All preset configurations follow the precedence system: CLI arguments always override preset values, which override global config values.

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

#### Multi-Configuration Alloy Format (Recommended):
```json
{
  "width": null,
  "height": null,
  "quality": 85,
  "fit": "contain",
  "position": "center",
  "crop": null,
  "source": null,
  "output": null,
  "format": null,
  "background": null,
  "replace-originals": false,

  "presets": {
    "web": { "source": null, "output": null, "format": "webp", "quality": 80 },
    "print": { "source": null, "output": null, "format": "tiff", "quality": 100 },
    "thumbnail": { "source": null, "output": null, "format": "png", "quality": 60, "width": 150, "height": 150 },
    "alloy": {
      "cards": {
        "android": {
          "quality": 90,
          "format": "webp",
          "source": "originals",
          "output": "cards/baby"
        },
        "iphone": {
          "quality": 90,
          "format": "webp",
          "source": "originals",
          "output": "cards/baby"
        }
      },
      "thumbs": {
        "android": {
          "quality": 80,
          "format": "webp",
          "output": "thumbs/baby",
          "source": "original-thumbs"
        },
        "iphone": {
          "quality": 80,
          "format": "webp",
          "output": "thumbs/baby",
          "source": "original-thumbs"
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
node --max-old-space-size=4096 $(which imgconvert) large-folder
```

**Q: Images appear blurry or pixelated**
A: Ensure source images are high enough resolution. For Alloy preset, use 4x resolution source images for best results.

**Q: Alloy preset not generating expected output structure**
A: Verify your configuration file format and ensure output paths don't include leading/trailing slashes (use `"thumbs/baby"` not `"/thumbs/baby/"`)

## Contributing

We welcome contributions! Here's how you can help improve imgconvert-cli:

### Quick Contributions
- 💡 Suggest new features
- 📖 Improve documentation
- 🐛 Report bugs or issues
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
   - Click "New Pull Request" or "Compare & pull request"
   - **Select the correct branches**: `base: main` ← `compare: your-feature-branch`
   - Provide a clear description of your changes
   - **Reference issues**: Use "Fixes #123" or "Closes #456" if applicable
   - **Add reviewers** if you know who should review your code
   - Click "Create Pull Request"

10. **After Creating the PR**
    - Monitor for feedback and requested changes
    - Make additional commits to the same branch if changes are needed
    - **Keep your branch updated** with the main branch if needed:
      ```bash
      git checkout main
      git pull upstream main
      git checkout feature/amazing-feature
      git merge main
      ```


### PR Best Practices

- **Title**: Use a clear, descriptive title (e.g., "Add WebP optimization for mobile preset")
- **Description**: Explain what you changed and why
- **Breaking Changes**: Clearly mark any breaking changes
- **Screenshots**: Include before/after images for UI changes
- **Testing**: Mention what tests you ran


### Example PR Description Template:
```
## What does this PR do?
Brief description of the changes

## Why is this needed?
Explain the problem this solves

## How to test?
Steps to verify the changes work

## Checklist:
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Development Guidelines

- **Commits**: Use clear, descriptive commit messages
- **Issues**: Reference relevant issues in your PR description
- **Code Style**: Follow the existing code style and use ESLint
- **Tests**: Add tests for new features and ensure all tests pass
- **Documentation**: Update README.md if you change functionality

### Areas for Contribution

- 📚 **Documentation** examples and tutorials
- 🧪 **Testing improvements** and edge case coverage
- 🔧 **CLI improvements** and user experience enhancements
- 📱 **Additional mobile frameworks** support beyond Titanium
- 🚀 **Performance optimizations** for large batch processing
- 🎨 **New presets** for specific use cases (social media, print, etc.)

## Roadmap / Future Features

### Near Term (v2.x)
- [ ] **Progress bars** for large batch operations
- [ ] **CLI wizard** for preset configuration setup
- [ ] **Parallel processing** for faster batch conversion
- [ ] **Image optimization analysis** with recommendations

### Medium Term (v3.x)
- [ ] **Web UI** for visual configuration
- [ ] **Plugin system** for custom transformations
- [ ] **Docker support** for containerized workflows
- [ ] **Cloud storage integration** (AWS S3, Google Cloud)

### Long Term (v4.x+)
- [ ] **Batch undo/rollback** functionality
- [ ] **AI-powered optimization** suggestions
- [ ] **Advanced filtering** and conditional processing
- [ ] **Integration** with popular build tools (Webpack, Vite, etc.)

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
