# imgconvert-cli

`imgconvert-cli` is a command-line tool for compressing, converting, and resizing images using the powerful `sharp` library.

It supports various image formats and allows you to optimize your images for web use or other purposes, with customizable quality, background color options, and the ability to convert to multiple formats at once.

You can also resize images by specifying the desired width and/or height, maintaining the aspect ratio unless both dimensions are provided.

## Features

- **Image Compression**: Compress images to reduce file size while maintaining quality.
- **Format Conversion**: Convert images between different formats such as JPEG, PNG, WebP, AVIF, TIFF, and GIF.
- **File and Batch Processing**: Process a single image file or all images in a specified directory.
- **Customizable Quality**: Adjust the quality of the output images.
- **Configurable Background Color**: Set a background color for images converted from formats with transparency (e.g., PNG) to formats without transparency (e.g., JPEG).
- **Multi-Format Conversion**: Convert images to all supported formats (JPEG, PNG, WebP, AVIF, TIFF, GIF) simultaneously using a single command.
- **Image Resizing**: Resize images by specifying the desired width and/or height, maintaining the aspect ratio unless both dimensions are provided.
- **Replace Original Files**: Optionally replace the original files with the processed images.
- **Presets and Environments**: Use predefined settings for different use cases and environments.
- **Custom Output Directory**: Specify a custom directory for processed images, or use the default `compressed` directory.
- **Debug Mode**: Enable detailed logging for troubleshooting.

## Installation

To install `imgconvert-cli`, you need to have Node.js and NPM installed on your system. Then, you can install the module globally using:

```bash
npm install -g imgconvert-cli
```

## Usage

The basic syntax for using `imgconvert-cli` is:

```bash
imgconvert <source_path> [-f=<format|all>] [-q=<quality>] [-b=<background_color>] [-r=<replace>] [-w=<width>] [-h=<height>] [-o=<output_directory>] [-p=<preset>] [-e=<environment>] [-d]
```

- `<source_path>`: The path to the image file or directory containing the images you want to process. This is a required positional argument.
- `-f, --format`: (Optional) The desired output format. Supported formats are `jpeg`, `png`, `webp`, `avif`, `tiff`, and `gif`. Use `all` to convert to all formats simultaneously. If not specified, the original format is retained.
- `-q, --quality`: (Optional) The quality of the output images, specified as an integer between 1 and 100. The default quality is 85.
- `-b, --background`: (Optional) The background color to use when converting images with transparency to formats without transparency (e.g., PNG to JPEG). Specify the color in hexadecimal format (e.g., `#ffffff` for white). The default is white.
- `-r, --replace`: (Optional) Replace the original files with the processed images. Use `true` to enable this feature. The default is `false`.
- `-w, --width`: (Optional) Set the width of the output images.
- `-h, --height`: (Optional) Set the height of the output images.
- `-o, --output`: (Optional) Specify the output directory for processed images. If not specified, a `compressed` directory is created at the same level as the source path.
- `-p, --preset`: (Optional) Apply a preset configuration (e.g., `web`, `print`, `thumbnail`, `alloy`).
- `-e, --environment`: (Optional) Set the environment (e.g., `dev`, `prod`).
- `-d, --debug`: (Optional) Enable debug mode to show detailed information.
- `-v, --version`: (Optional) Display the version of the module.
- `-H, --help`: (Optional) Show the help message with usage instructions.

### Presets

Presets are predefined configurations that allow you to quickly apply a set of options for common use cases. The available presets are:

- **web**: Optimizes images for web use with a format of `webp`, quality of `80`, width of `1024`, and height of `768`.
- **print**: Configured for high-quality prints with a format of `jpeg` and quality of `100`.
- **thumbnail**: Creates small images suitable for thumbnails with a format of `png`, quality of `60`, width of `150`, and height of `150`.
- **alloy**: Specifically designed for use with the Titanium SDK, this preset generates images at multiple resolutions for Android and iPhone. The base images should be 4 times the size of the final 1x images.

### Alloy Preset

The **alloy** preset is tailored for developers using the [Titanium SDK](https://titaniumsdk.com). It generates images at various resolutions suitable for different device densities. When using this preset, ensure that the base images are 4 times the size of the final 1x images. This means that if you want a 1x image to be 100x100 pixels, the base image should be 400x400 pixels.

The alloy preset supports the following configurations:

- **Android**: Generates images for different Android screen densities:
  - `res-mdpi`: 1x
  - `res-hdpi`: 1.5x
  - `res-xhdpi`: 2x
  - `res-xxhdpi`: 3x
  - `res-xxxhdpi`: 4x
- **iPhone**: Generates images for different iPhone screen densities:
  - `1x`: Standard resolution
  - `2x`: Retina resolution
  - `3x`: Super Retina resolution

### General Examples

1. **Compress a Single Image Without Changing Format**

   To compress a single image file without changing its format:

   ```bash
   imgconvert image.jpg
   ```

2. **Compress All Images in a Directory Without Changing Format**

   To compress all images in a directory without changing their format:

   ```bash
   imgconvert source_folder
   ```

3. **Convert a Single Image to WebP with Custom Quality**

   To convert a single image file to WebP format with a quality of 75:

   ```bash
   imgconvert image.jpg -f=webp -q=75
   ```

4. **Convert All Images in a Directory to PNG with Default Quality**

   To convert all images in a directory to PNG format with the default quality:

   ```bash
   imgconvert source_folder -f=png
   ```

5. **Convert a Single Image to JPEG with High Quality and Custom Background**

   To convert a single image file to JPEG format with a quality of 95 and a red background:

   ```bash
   imgconvert image.png -f=jpeg -q=95 -b=#ff0000
   ```

6. **Resize a Single Image to a Specific Width**

   To resize a single image file to a width of 800 pixels while maintaining the aspect ratio:

   ```bash
   imgconvert image.jpg -w=800
   ```

7. **Resize a Single Image to a Specific Height**

   To resize a single image file to a height of 600 pixels while maintaining the aspect ratio:

   ```bash
   imgconvert image.jpg -h=600
   ```

8. **Resize All Images in a Directory to a Specific Width and Height**

   To resize all images in a directory to a width of 800 pixels and a height of 600 pixels, this will crop the images from the center:

   ```bash
   imgconvert source_folder -w=800 -h=600
   ```

9. **Convert All Images in a Directory to All Formats**

   To convert all images in a directory to JPEG, PNG, WebP, AVIF, TIFF, and GIF formats:

   ```bash
   imgconvert source_folder -f=all
   ```

10. **Replace Original Files with Processed Images**

    To replace the original files with the processed images:

    ```bash
    imgconvert source_folder -r=true
    ```

11. **Use a Preset Configuration**

    To apply a preset configuration, such as `web`, which might include specific settings for format, quality, width, and height:

    ```bash
    imgconvert source_folder -p=web
    ```

12. **Set Environment to Production**

    To set the environment to `prod`, which might include settings like replacing original files:

    ```bash
    imgconvert source_folder -e=prod
    ```

13. **Specify a Custom Output Directory**

    To specify a custom output directory for processed images:

    ```bash
    imgconvert source_folder -o=custom_output_directory
    ```

14. **Enable Debug Mode**

    To enable debug mode and get detailed logging of the processing steps:

    ```bash
    imgconvert source_folder -d
    ```

15. **Check the Version of the Module**

    To display the version of the `imgconvert-cli` module:

    ```bash
    imgconvert --version
    ```

16. **Show Help Message**

    To display the help message with usage instructions:

    ```bash
    imgconvert --help
    ```

### Examples for the Alloy Preset

1. **Process Images for Android Using the Alloy Preset**

   To process images for different screen densities on Android, you can use the `alloy` preset.

   **Ensure that the base images are 4 times the size of the final images. For example, if you want the final image for `res-mdpi` to be 100x100 pixels, the base image should be 400x400 pixels.**

   ```bash
   imgconvert source_folder -p=alloy
   ```

   This will generate images in the following directories:
   - `./app/assets/android/images/res-mdpi/`
   - `./app/assets/android/images/res-hdpi/`
   - `./app/assets/android/images/res-xhdpi/`
   - `./app/assets/android/images/res-xxhdpi/`
   - `./app/assets/android/images/res-xxxhdpi/`

2. **Process Images for iPhone Using the Alloy Preset**

   To process images for different iPhone resolutions, you can also use the `alloy` preset.

   **Ensure that the base images are 4 times the size of the final images.**

   ```bash
   imgconvert source_folder -p=alloy
   ```

   This will generate images in the following directories:
   - `./app/assets/iphone/images/1x/`
   - `./app/assets/iphone/images/2x/`
   - `./app/assets/iphone/images/3x/`

3. **Example of Using the Alloy Preset with Original File Replacement**

   If you want to replace the original images with the processed ones for Android using the `alloy` preset, you can use the following command:

   ```bash
   imgconvert source_folder -p=alloy -r=true
   ```

   This will replace the original images in the specified output directories.

## Configuration File

The configuration file `.imgconverter.config.json` allows you to define custom presets and environments. This file is automatically created in the current working directory when you run `imgconvert config`.

### Configuration Parameters

- **presets**: Define custom presets for different use cases. Each preset can specify `format`, `quality`, `width`, `height`, and `output`.
- **environments**: Define settings for different environments. Each environment can specify whether to `replace` original files and the `output` directory.
- **width**: Default width for image resizing.
- **height**: Default height for image resizing.
- **quality**: Default quality for image compression.
- **format**: Default format for image conversion.
- **replace**: Default setting for replacing original files.
- **background**: Default background color for images with transparency.
- **output**: Default output directory for processed images. If `null`, defaults to a `compressed` directory at the same level as the source path.

### Example Configuration File

```json
{
  "presets": {
    "web": { "format": "webp", "quality": 80, "width": 1024, "height": 768, "output": null },
    "print": { "format": "jpeg", "quality": 100, "output": null },
    "thumbnail": { "format": "png", "quality": 60, "width": 150, "height": 150, "output": null },
    "alloy": { "android": { "scales": { "res-mdpi": 1, "res-hdpi": 1.5, "res-xhdpi": 2, "res-xxhdpi": 3, "res-xxxhdpi": 4 }, "output": "./app/assets/android/images" }, "iphone": { "scales": { "1x": 1, "2x": 2, "3x": 3 }, "output": "./app/assets/iphone/images" } }
  },
  "environments": {
    "dev": { "replace": false, "output": null },
    "prod": { "replace": true, "output": null }
  },
  "width": null,
  "height": null,
  "quality": 85,
  "format": "none",
  "replace": false,
  "background": "#ffffff",
  "output": null
}
```

## How It Works

- The tool reads the specified source path, which can be a single image file or a directory.
- It processes each image using the `sharp` library, applying compression, format conversion, resizing, and background color as specified.
- The processed images are saved in a subdirectory named `compressed` within the source directory or the directory of the input file, unless a custom output directory is specified or the `--replace` option is used, in which case the original files are replaced.
- Resizing is performed by specifying the desired width and/or height, maintaining the aspect ratio unless both dimensions are provided.

## Debug Mode

When debug mode is enabled with the `-d` or `--debug` option, the tool provides detailed logging of the processing steps, including:

- The original and new sizes of each processed image.
- The time taken to process each image.
- Any errors encountered during processing.

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

## License

This project is licensed under the MIT License.
