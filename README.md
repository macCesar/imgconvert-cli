# imgconvert-cli

<div align="center">

  ![npm version](https://img.shields.io/npm/v/imgconvert-cli)
  ![Node.js Version](https://img.shields.io/node/v/imgconvert-cli)
  ![downloads](https://img.shields.io/npm/dm/imgconvert-cli)
  ![license](https://img.shields.io/npm/l/imgconvert-cli)
  ![test coverage](https://img.shields.io/badge/tests-96%20passing-brightgreen)
  ![GitHub Stars](https://img.shields.io/github/stars/macCesar/imgconvert-cli)

</div>

`imgconvert-cli` is a command-line tool for compressing, converting, and resizing images using the `sharp` library. It supports JPEG, PNG, WebP, AVIF, TIFF, and GIF, with options for quality, background color, resize strategies, and batch processing.

## Quick start

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

## Common use cases

- Batch convert images to WebP for faster loading
- Consistent square thumbnails with `--fit cover` and `--position`
- Crop to exact dimensions with `--crop`, then resize
- Extend canvas without scaling the image using `--canvas`
- Resize PNGs without losing transparency
- Generate multi-resolution assets for iOS/Android with the Titanium Alloy preset
- Update only specific asset categories with `imgconvert -p alloy:config-name`
- Convert to TIFF for print
- Process entire directories at once
- Batch rename files: lowercase, replace spaces, add prefixes/suffixes

## Performance

Typical compression results:
- JPEG to WebP: 25-35% size reduction
- PNG to WebP: 40-60% size reduction
- Batch processing: ~50-100 images/second
- Handles large batches without memory issues

## Project stats

- Platforms: macOS, Linux, Windows
- Bundle size: ~45KB (excluding Sharp)
- Tests: 74 passing
- Dependencies: 3 (sharp, minimist, chalk)

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

- Compress images while maintaining quality
- Convert between JPEG, PNG, WebP, AVIF, TIFF, and GIF
- Multiple resize strategies: cover, contain, fill, inside, outside
- Position control when cropping (center, top, bottom, left, right, corners)
- Manual cropping with precise coordinates
- Process single files or entire directories
- Preserves original file extensions when no format conversion is specified
- Custom file naming and batch renaming (enumerate, lowercase, replace spaces, prefix, suffix)
- Adjustable quality from 1-100
- Configurable background color for transparency handling
- Convert to all supported formats in one command with `-f all`
- Replace originals in-place with `--replace-originals`
- Built-in presets: web, print, thumbnail, alloy
- Custom output directory with `-o`
- Debug mode with `-d` for troubleshooting

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

> When you don't specify `-f`, each output image keeps its original extension:
> - `image.jpg` → `image.jpg` (compressed but same format)
> - `image.png` → `image.png` (compressed but same format)
>
> The file extension only changes when you explicitly specify a different format with `-f`.

## Options


| Option                | Alias | Description                                                                                 | Default                                    |
| --------------------- | ----- | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `--format`            | `-f`  | Output format: `jpeg`, `png`, `webp`, `avif`, `tiff`, `gif`, `all`                          | Original format                            |
| `--quality`           | `-q`  | Quality (1-100)                                                                             | 85                                         |
| `--background`        | `-b`  | Background color when converting from transparent formats to non-transparent formats        | Transparent for PNG/WebP, #ffffff for JPEG |
| `--width`             | `-w`  | Output width in pixels                                                                      | -                                          |
| `--height`            | `-h`  | Output height in pixels                                                                     | -                                          |
| `--output`            | `-o`  | Output directory (relative paths resolve next to the source, absolute paths are used as-is) | `<source>-converted`                       |
| `--preset`            | `-p`  | Apply preset: `web`, `print`, `thumbnail`, `alloy`                                          | -                                          |
| `--fit`               | -     | Resize strategy: `cover`, `contain`, `fill`, `inside`, `outside`                            | `contain`                                  |
| `--position`          | -     | Crop position: `center`, `top`, `bottom`, `left`, `right`, corners                          | `center`                                   |
| `--crop`              | -     | Manual crop coordinates: `left,top,width,height`                                            | -                                          |
| `--canvas`            | -     | Resize canvas instead of image (maintains original, adds padding)                           | `false`                                    |
| `--name`              | `-n`  | Custom filename for single file processing                                                  | -                                          |
| `--rename`            | -     | Batch rename strategy: `enumerate`, `lowercase`, `replace-spaces`, `prefix:`, `suffix:`     | -                                          |
| `--replace-originals` | -     | Replace original files                                                                      | `false`                                    |
| `--debug`             | `-d`  | Enable debug mode                                                                           | `false`                                    |
| `--version`           | `-v`  | Show version                                                                                | -                                          |
| `--help`              | `-H`  | Show help message                                                                           | -                                          |

## Advanced resize and crop control

Processing order: Manual Crop → Resize → Format Conversion

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

When using `--fit cover`, `--fit contain`, or `--canvas`, controls which part of the image to preserve or focus on:

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

### Canvas resize vs image resize (`--canvas`)

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
- **Position Control**: Use `--position` to control where the image is placed within the expanded canvas

```bash
imgconvert photo.png --canvas -h 1660
# 1024x1536 → 1024x1660 (original image centered + transparent padding)

imgconvert photo.png --canvas -h 1660 --position top
# 1024x1536 → 1024x1660 (original image at top + transparent padding at bottom)

imgconvert photo.png --canvas -h 1660 --position bottom
# 1024x1536 → 1024x1660 (original image at bottom + transparent padding at top)

imgconvert photo.png --canvas -h 1660 -b "#ff0000"
# 1024x1536 → 1024x1660 (original image + red padding)
```

| Aspect               | Standard Resize         | Canvas Resize (`--canvas`) |
| -------------------- | ----------------------- | -------------------------- |
| **Image scaling**    | ✅ Scales proportionally | ❌ Maintains original size  |
| **Exact dimensions** | ❌ Respects aspect ratio | ✅ Exact target dimensions  |
| **Transparency**     | Preserves existing      | ✅ Adds transparent padding |
| **Position control** | Via `--position`        | ✅ Via `--position` (NEW)   |
| **Use case**         | Photo resizing          | Design layouts, mockups    |

## File naming and batch renaming

### Single file naming (`--name`, `-n`)

Rename individual files during processing:

```bash
imgconvert photo.jpg --name "hero-image" -f webp
# Output: hero-image.webp
```

**Important**: The `--name` option only works with single files, not directories.

### Batch renaming strategies (`--rename`)

Apply systematic renaming to multiple files:

| Strategy         | Description                 | Example Input  | Example Output    |
| ---------------- | --------------------------- | -------------- | ----------------- |
| `enumerate`      | Add sequential numbers      | `photo.jpg`    | `001-photo.jpg`   |
| `lowercase`      | Convert to lowercase        | `MyPhoto.JPG`  | `myphoto.jpg`     |
| `replace-spaces` | Replace spaces with hyphens | `my photo.png` | `my-photo.png`    |
| `prefix:text`    | Add prefix to filename      | `image.jpg`    | `thumb-image.jpg` |
| `suffix:text`    | Add suffix to filename      | `image.jpg`    | `image-small.jpg` |

### Combining strategies

Multiple rename strategies can be combined by separating them with commas:

```bash
imgconvert photos --rename "lowercase,replace-spaces,prefix:web-"
# "My Photo.jpg" → "web-my-photo.jpg"

imgconvert images --rename "prefix:gallery-,enumerate"
# "photo.jpg" → "gallery-001-photo.jpg"
```

Strategies are applied left to right, so the result matches the order you write them.

## Examples

### Basic operations

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

### Resizing and cropping

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
   # Original 1024x1536 → Output 1024x1660 with transparent padding (centered)

   # Control position within the expanded canvas
   imgconvert photo.png --canvas -h 1660 --position top
   # Original 1024x1536 → Output 1024x1660 with image at top, transparent padding at bottom

   imgconvert photo.png --canvas -h 1660 --position bottom
   # Original 1024x1536 → Output 1024x1660 with image at bottom, transparent padding at top

   # Resize canvas with custom background color
   imgconvert photo.png --canvas -h 1660 -b "#ffffff"
   # Adds white padding instead of transparent

   # Resize canvas to exact dimensions
   imgconvert image.jpg --canvas -w 800 -h 600 -f png
   # Maintains original image centered, adds transparent padding to reach 800x600
   ```

### File naming and renaming

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

### Real-world examples

10. **Web development:**
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

### Utility operations

18. **Specify a custom output directory:**
    ```bash
    # Relative name — creates "custom_output" next to source_folder
    imgconvert source_folder -o custom_output

    # Absolute path — uses it as-is
    imgconvert source_folder -o /tmp/processed
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

## File extension behavior

### Preserve original extensions
When no format is specified with `-f`, the original file extension is preserved:

| Input       | Command                | Output      |
| ----------- | ---------------------- | ----------- |
| `logo.png`  | `imgconvert logo.png`  | `logo.png`  |
| `icon.webp` | `imgconvert icon.webp` | `icon.webp` |
| `photo.jpg` | `imgconvert photo.jpg` | `photo.jpg` |

### Format conversion changes extensions
When using `-f` to specify a format, the extension changes accordingly:

| Input       | Command                        | Output       |
| ----------- | ------------------------------ | ------------ |
| `logo.png`  | `imgconvert logo.png -f jpeg`  | `logo.jpeg`  |
| `icon.webp` | `imgconvert icon.webp -f png`  | `icon.png`   |
| `photo.jpg` | `imgconvert photo.jpg -f webp` | `photo.webp` |

> **Tip:** The extension only changes when you explicitly use `-f`.

## Presets

Presets are predefined configurations for common use cases:

- **web**: Optimized for the web (`webp`, quality `80`). Optionally defines a `source` path.
- **print**: High-quality output (`tiff`, quality `100`). Optionally defines a `source` path.
- **thumbnail**: Small previews (`png`, quality `60`, 150x150). Optionally defines a `source` path.
- **square-thumbs**: Consistent square thumbnails (`webp`, quality `80`, 300x300). Optionally defines a `source` path.
- **hero-images**: High-quality hero images (`webp`, quality `85`, 1920x1080). Optionally defines a `source` path.
- **alloy**: For Titanium SDK. Generates scaled images for Android and iOS at all required densities. Supports a single-source legacy format and a multi-configuration format (e.g., cards, thumbnails, icons with independent settings). Process everything with `-p alloy` or target one group with `-p alloy:configName`.

## Custom Presets

You can define your own presets in `.imgconverter.config.json`.

### Example

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

### Key points

- Presets can include source and output paths
- CLI arguments always override preset values
- Supports all parameters: quality, format, width, height, background, source, output, replace-originals

See [custom_presets.md](custom_presets.md) for more examples.

## Comparison

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

## Alloy preset

The `alloy` preset generates scaled images for Titanium Alloy apps, producing all required density variants for Android and iOS from a single set of source images.

- Backward compatible with existing alloy configurations
- Source images should be 4x resolution (the tool scales down from there)
- Generates Android density folders (`res-mdpi` through `res-xxxhdpi`) and iOS `@2x`/`@3x` naming
- Per-configuration quality and format settings with proper precedence
- Scale factors are fixed to Titanium standards and cannot be changed
- `width` and `height` parameters are ignored (scaling is based on fixed factors)
- Supports multiple image groups (cards, thumbnails, icons) in a single command
- Each configuration can have its own source directory and output path
- Target a specific configuration with `alloy:configName`

### Selective configuration processing

You can target individual configurations instead of processing everything:

- Process only what changed, saving time during development
- Update specific asset categories in CI/CD pipelines
- Test one configuration without waiting for all assets to rebuild
- Add a new category and process just that one

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

### Scale factors

These are fixed to match Titanium platform standards:
- **iOS**: 1x, 2x, 3x
- **Android**: res-mdpi (1x), res-hdpi (1.5x), res-xhdpi (2x), res-xxhdpi (3x), res-xxxhdpi (4x)

> Scale factors cannot be customized. They match what Titanium expects.

### Usage

#### Process all configurations:
```bash
# Legacy format (single android/iphone configuration)
imgconvert source-images -p alloy

# Multi-configuration format (all configuration groups)
imgconvert -p alloy
```

#### Process a specific configuration:
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

#### Single configuration (legacy format):
```bash
imgconvert source-images -p alloy
```

#### Multi-configuration format:
```bash
imgconvert -p alloy
```
> With multi-configuration format, all groups are processed from their respective source directories. Use `-p alloy:configName` to target one.

> `width` and `height` are ignored with the alloy preset. Images are scaled based on fixed factors.

### Output for Alloy (Android & iPhone)

When using the `alloy` preset, the output follows this structure:

- Android: `<base>/app/assets/android/images`
- iPhone: `<base>/app/assets/iphone/images`

**Output directory precedence:**

| Priority | Condition                               | Output base (`<base>`)                            |
| -------- | --------------------------------------- | ------------------------------------------------- |
| 1        | `-o /absolute/path` specified           | `/absolute/path`                                  |
| 2        | `-o relative-name` specified            | Resolved next to the input file's directory       |
| 3        | `tiapp.xml` exists in current directory | Current working directory (Titanium project root) |
| 4        | No `-o` and no `tiapp.xml` in CWD       | Same directory as the input file                  |

**Examples:**

```bash
# With absolute output path
imgconvert ~/Desktop/logo.png -p alloy -o ~/Developer/my-titanium-app
# Output: ~/Developer/my-titanium-app/app/assets/android/images/...

# With relative output name — resolves next to the input file
imgconvert ~/Desktop/logo.png -p alloy -o my-project
# Output: ~/Desktop/my-project/app/assets/android/images/...

# Inside a Titanium project (tiapp.xml exists in CWD)
cd ~/Developer/my-titanium-app
imgconvert ~/Desktop/logo.png -p alloy
# Output: ~/Developer/my-titanium-app/app/assets/android/images/...

# Outside a Titanium project, no -o flag
cd ~/Downloads
imgconvert ~/Desktop/logo.png -p alloy
# Output: ~/Desktop/app/assets/android/images/...
```

You only need to specify the relative subfolder (without leading or trailing slashes, e.g. `thumbs/baby`) as the `output` in the preset configuration. The script will generate the correct structure for each density:

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

### Preset source folders

Two configuration formats are supported:

#### Legacy format (single source per platform)

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

> Scale factors are applied automatically. The `scales` property is no longer supported.

#### Multi-configuration format (recommended)

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

The tool auto-detects which format you're using. Each group can have its own quality, format, source, and output.

Then run:

```bash
imgconvert -p alloy
```

This will:
1. Process each configuration group sequentially
2. Show progress for each configuration and platform
3. Show detailed debug info when using `-d`
4. Auto-detect legacy vs multi-configuration format

**Multi-configuration alloy output:**
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

### Example: game development workflow

Say you're building a card game with this directory structure:

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

With this `.imgconverter.config.json`:

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

One command:

```bash
imgconvert -p alloy
```

Generates:

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

## Titanium — Modern branding (SDK 13.x, Alloy + Classic)

For Titanium SDK 13.x projects (both Alloy and Classic), `--preset ti-branding` generates a full modern branding asset set from a single SVG or PNG master — matching what `titanium` / `alloy new` ships out of the box, plus everything a production app actually needs on Android (adaptive icons, notification icons, splash icons) and for marketplace submission.

Auto-detects project layout: `app/` → Alloy, `Resources/` → Classic. The generated Android paths adjust automatically (`app/platform/android/res/...` vs `platform/android/res/...`). Root-level icons (`DefaultIcon.png`, `DefaultIcon-ios.png`, `iTunesConnect.png`, `MarketplaceArtwork.png`) land at the project root in both cases.

**Preset name:** `ti-branding` is the preferred name going forward (matches the [TiTools `ti-branding` skill](https://github.com/macCesar/titools/tree/main/skills/ti-branding) for Claude Code users). The older `--preset alloy --modern` spelling is kept as a backward-compatible alias — both invocations route to the same pipeline.

**Backward compatibility:** `--preset alloy` without any modern flag continues to emit the legacy 1x/2x/3x (iPhone) + mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi (Android) output exactly as v1.x did. No existing scripts need to change.

### What gets generated

Root-level icons (when a master is provided):

| File                      | Size    | Alpha      | Purpose                                                   |
| ------------------------- | ------- | ---------- | --------------------------------------------------------- |
| `DefaultIcon.png`         | 1024²   | preserved  | Universal / Android source — matches `ti create` default  |
| `DefaultIcon-ios.png`     | 1024²   | flattened  | iOS-specific (Apple rejects alpha on icons)               |

Marketplace (`--marketplace` or `--modern`):

| File                      | Size    | Alpha      | Purpose                         |
| ------------------------- | ------- | ---------- | ------------------------------- |
| `iTunesConnect.png`       | 1024²   | preserved  | App Store artwork               |
| `MarketplaceArtwork.png`  | 512²    | preserved  | Google Play artwork             |

Android adaptive icons (`--adaptive` or `--modern`) — 5 densities × 3 layers:

| Density   | Canvas | Files                                                                            |
| --------- | ------ | -------------------------------------------------------------------------------- |
| mdpi      | 108²   | `ic_launcher_foreground.png`, `ic_launcher_background.png`, `ic_launcher_monochrome.png` |
| hdpi      | 162²   | ″                                                                                |
| xhdpi     | 216²   | ″                                                                                |
| xxhdpi    | 324²   | ″                                                                                |
| xxxhdpi   | 432²   | ″                                                                                |

Plus `mipmap-anydpi-v26/ic_launcher.xml` (adaptive binder) and legacy `ic_launcher.png` at 48/72/96/144/192 for API 21–25 fallback.

Optional — Android notification icons (`--notification`) at `drawable-*/ic_stat_notify.png`, sized 24/36/48/72/96 (white-on-transparent, runtime-tinted).

Optional — Android 12+ splash icons (`--splash`) at `drawable-*/splash_icon.png`, sized 288/432/576/864/1152 per the SplashScreen API spec.

### Flags

| Flag                      | Default     | Purpose                                                                          |
| ------------------------- | ----------- | -------------------------------------------------------------------------------- |
| `-p ti-branding`          | —           | Select the modern pipeline (preferred name)                                      |
| `--modern`                | off         | With `-p alloy`: route to modern pipeline (same as using `-p ti-branding`)       |
| `--adaptive`              | off         | Android adaptive icon triplet + legacy + XML binder                              |
| `--marketplace`           | off         | iTunesConnect.png + MarketplaceArtwork.png                                       |
| `--notification`          | off         | Notification icons × 5 densities                                                 |
| `--splash`                | off         | Android 12+ splash_icon × 5 densities                                            |
| `--bg-color <hex>`        | `#FFFFFF`   | Background for Android adaptive layer + iOS alpha flatten                        |
| `--padding <pct>`         | `20`        | Android safe-zone padding per side (0–40). Material spec floor is 19.44%; default of 20 gives a tiny buffer while keeping the logo visibly prominent |
| `--ios-padding <pct>`     | `8`         | iOS / marketplace aesthetic padding per side (0–40)                              |
| `--cleanup-legacy`        | off         | Context-aware cleanup driven by tiapp.xml (prints plan before deleting)          |
| `--aggressive`            | off         | With `--cleanup-legacy`, also remove ldpi density folders                        |
| `--project <path>`        | cwd         | Titanium project root                                                            |
| `--output <path>`         | `<project>/.ti-branding` | Staging directory                                                    |
| `--in-place`              | off         | Skip staging — write directly into the project (**overwrites existing icons**)   |
| `--monochrome-master <path>` | —         | Optional dedicated silhouette master for `ic_launcher_monochrome.png` + `ic_stat_notify.png`. Falls back to whitening the main master when not provided. Use when the colored logo has multi-color detail that collapses into a featureless blob when naively converted to white (example: a painter's palette with 4 color dots → design a monochrome variant with 4 cutout holes instead of solid white blobs) |
| `--notes`                 | off         | Print full tiapp.xml snippets + padding tuning guide (default: compact summary)  |
| `--dry-run`               | off         | Show what would be generated / deleted without writing                           |

### Examples

```bash
# Brand a fresh project — overwrites default Titanium icons directly (no staging)
cd ~/Developer/my-app
imgconvert logo.svg -p ti-branding --in-place --bg-color "#0B1326"

# Safer: stage to .ti-branding/ first, review, then copy manually (default behavior)
imgconvert logo.svg -p ti-branding --bg-color "#0B1326" --project ~/Developer/my-app

# Just the Android adaptive icon triplet (no marketplace, no extras)
imgconvert logo.svg -p ti-branding --adaptive --bg-color "#FDD900" --project ~/Developer/my-app

# Cleanup mode — preview what would be removed from a Titanium project's legacy cruft
imgconvert -p ti-branding --cleanup-legacy --dry-run --project ~/Developer/my-app

# Cleanup + aggressive (remove ldpi too)
imgconvert -p ti-branding --cleanup-legacy --aggressive --project ~/Developer/my-app

# Full flow + cleanup in one command, in-place
imgconvert logo.svg -p ti-branding --in-place --cleanup-legacy --bg-color "#0B1326"

# Backward-compat alias: --preset alloy --modern works identically
imgconvert logo.svg -p alloy --modern --in-place --bg-color "#0B1326"
```

### Context-aware cleanup

`--cleanup-legacy` reads your `tiapp.xml` to decide what's safe to delete. Targets are grouped into three buckets:

- **SAFE** — always removed. Universally obsolete artifacts (e.g. `res-long-*/` and `res-notlong-*/` qualifier folders that have been dead since Android 3.0).
- **CONDITIONAL** — only removed when your project config guarantees they're unused:
  - iOS `Default-*.png` legacy launch images — removed only when `<enable-launch-screen-storyboard>true</enable-launch-screen-storyboard>` is set.
  - Android landscape folders (`res-*-land-*`) — removed only when your app is portrait-only.
  - Legacy `appicon.png` and `default.png` under `app/assets/android/` — removed only when adaptive icons are already in place.
- **AGGRESSIVE** — behind `--aggressive`. Strongly defensible but has edge cases (currently: ldpi resource folders, which represent <1% of active Android devices in 2026).

The plan is always printed before anything is deleted. Pair with `--dry-run` to preview without touching disk.

### Post-generation notes

After a successful run the tool prints `tiapp.xml` snippets for:
- iOS launch background (linking your `--bg-color` to the storyboard)
- Android launcher icon wiring
- Android 12+ splash theme (if `--splash` was used) — both the native `android:` approach and the `androidx.core:core-splashscreen` library approach
- FCM notification icon + tint meta-data (if `--notification` was used)

None of the tiapp.xml edits are made automatically — paste only what you need after reviewing.

### Why two icons for iOS (`DefaultIcon.png` + `DefaultIcon-ios.png`)?

A fresh `ti create` project ships both. `DefaultIcon.png` is the universal/Android source (alpha preserved); `DefaultIcon-ios.png` is the iOS-specific file that ships into the app binary, with alpha flattened because Apple rejects alpha channels on App Store submissions. This tool generates both to match that convention.

## Tips for alloy selective processing

### During development:
```bash
# Test only what you're working on
imgconvert -p alloy:comics -d    # Enable debug mode to see detailed processing
```

### Adding new asset categories:
```bash
# First, add your new configuration to .imgconverter.config.json
# Then process only the new category
imgconvert -p alloy:new-category
```

### Quality testing:
```bash
# Test different quality settings for specific configurations
imgconvert -p alloy:comics -q 95          # Higher quality for main assets
imgconvert -p alloy:thumbs-comics -q 60   # Lower quality for thumbnails
```

### CI/CD integration:
```bash
# Process only changed asset categories in your build pipeline
if [[ "$CHANGED_ASSETS" == *"comics"* ]]; then
  imgconvert -p alloy:comics
fi
```

### Things to keep in mind

- Use selective processing during development, run all configurations (`-p alloy`) for final builds
- Combine with `-d` to see what's happening
- CLI arguments override preset settings
- Use consistent naming for your configurations
- Test with debug mode first when setting up new configurations
- Always verify configuration names exist before running automated scripts

## Configuration File

Global defaults and custom presets live in `.imgconverter.config.json`.

Generate a default config file with:

```bash
imgconvert config
```

### Configuration precedence

1. CLI arguments (highest)
2. Preset settings
3. Global config (`.imgconverter.config.json`)
4. Default values (lowest)

This applies to all parameters: `quality`, `format`, `width`, `height`, `output`, `replace-originals`, `background`, `fit`, `position`, and `crop`.

### Parameters

- **width** / **height**: Default dimensions for resizing.
- **format**: Default output format.
- **quality**: Default compression quality (1-100).
- **fit**: Resize strategy (`cover`, `contain`, `fill`, `inside`, `outside`).
- **position**: Crop/letterbox position (`center`, `top`, `bottom`, `left`, `right`, corners).
- **crop**: Crop coordinates as `left,top,width,height`.
- **canvas**: If true, extends canvas instead of scaling the image.
- **replace-originals**: If true, overwrites the original files.
- **source**: Default input folder (used when no path is given on the CLI).
- **output**: Default output directory. If `null`, creates a `converted` folder next to the source.
- **background**: Background color for transparency-to-opaque conversions (e.g., PNG to JPEG). PNG/WebP outputs keep transparency by default.
- **presets**: Custom preset definitions. Each preset can override any of the above parameters.

### Default configuration file

#### Legacy alloy format:
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

#### Multi-configuration alloy format (recommended):
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

> For the alloy preset, `output` should only be the relative subfolder (e.g., `"thumbs/baby"`). The base paths (`app/assets/android/images` and `app/assets/iphone/images`) are added automatically.

**Precedence example with multi-configuration**

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

Results:

- `imgconvert -p alloy` →
  - Cards: Android WebP at 90%, iPhone PNG at 95%
  - Thumbs: Android WebP at 70%, iPhone WebP at 75%
- `imgconvert -p alloy -q 80` → All platforms and configurations use JPEG at 80% (CLI overrides everything)
- `imgconvert -p alloy -f jpeg` →
  - Cards: Android JPEG at 90%, iPhone JPEG at 95%
  - Thumbs: Android JPEG at 70%, iPhone JPEG at 75%
- `imgconvert -p alloy -f webp -q 85` → All platforms and configurations use WebP at 85% (CLI overrides everything)

## Debug mode

Use `-d` or `--debug` to see detailed processing info.

**Standard processing:**
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

## Dependencies

- **sharp** - Image processing (compression, conversion, resizing). Note: Sharp uses 'jpeg' internally, but imgconvert preserves '.jpg' extensions in filenames.
- **minimist** - CLI argument parsing.
- **chalk** - Colored terminal output.

## Error handling

- Missing source path shows an error and exits.
- Unsupported formats fall back to the original format.
- Non-image files are skipped with a log message.

## Troubleshooting

### Common issues

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
A: Verify your configuration file format and ensure output paths don't include leading/trailing slashes (use `"thumbs/baby"` not `"/thumbs/baby/"`). If files are not appearing where expected, check the output precedence: an absolute `-o` path is used as-is, a relative `-o` name resolves next to the input file, then the tool checks for `tiapp.xml` in the current directory (Titanium project detection), and finally falls back to the input file's directory.

## Contributing

### Development setup

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


### PR guidelines

- Use a clear title (e.g., "Add WebP optimization for mobile preset")
- Explain what you changed and why
- Mark any breaking changes
- Mention what tests you ran

### PR description template:
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

### Guidelines

- Use clear commit messages
- Reference issues in your PR
- Follow existing code style (ESLint)
- Add tests for new features
- Update README if you change functionality

## Roadmap

- [ ] Progress bars for large batch operations
- [ ] CLI wizard for preset configuration
- [ ] Parallel processing for faster batch conversion
- [ ] Plugin system for custom transformations
- [ ] Docker support
- [ ] Integration with build tools (Webpack, Vite)

Have an idea? [Open an issue](https://github.com/macCesar/imgconvert-cli/issues).

## License

This project is licensed under the MIT License.

**Copyright (c) 2026 César Estrada**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

<div align="center">

**Made with ❤️ by [César Estrada](https://github.com/macCesar)**

[⭐ Star on GitHub](https://github.com/macCesar/imgconvert-cli) • [🐛 Report Bug](https://github.com/macCesar/imgconvert-cli/issues) • [💡 Request Feature](https://github.com/macCesar/imgconvert-cli/issues)

</div>
