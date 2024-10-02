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

## Installation

To install `imgconvert-cli`, you need to have Node.js and NPM installed on your system. Then, you can install the module globally using:

```bash
npm install -g imgconvert-cli
```

## Usage

The basic syntax for using `imgconvert-cli` is:

```bash
imgconvert <source_path> [-f=<format|all>] [-q=<quality>] [-b=<background_color>] [-r=<replace>] [-w=<width>] [-h=<height>]
```

- `<source_path>`: The path to the image file or directory containing the images you want to process. This is a required positional argument.
- `-f, --format`: (Optional) The desired output format. Supported formats are `jpeg`, `png`, `webp`, `avif`, `tiff`, and `gif`. Use `all` to convert to all formats simultaneously. If not specified, the original format is retained.
- `-q, --quality`: (Optional) The quality of the output images, specified as an integer between 1 and 100. The default quality is 85.
- `-b, --background`: (Optional) The background color to use when converting images with transparency to formats without transparency (e.g., PNG to JPEG). Specify the color in hexadecimal format (e.g., `#ffffff` for white). The default is white.
- `-r, --replace`: (Optional) Replace the original files with the processed images. Use `true` to enable this feature. The default is `false`.
- `-w, --width`: (Optional) Set the width of the output images.
- `-h, --height`: (Optional) Set the height of the output images.
- `-v, --version`: (Optional) Display the version of the module.
- `-H, --help`: (Optional) Show the help message with usage instructions.

### Examples

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

11. **Check the Version of the Module**

    To display the version of the `imgconvert-cli` module:

    ```bash
    imgconvert --version
    ```

12. **Show Help Message**

    To display the help message with usage instructions:

    ```bash
    imgconvert --help
    ```

## How It Works

- The tool reads the specified source path, which can be a single image file or a directory.
- It processes each image using the `sharp` library, applying compression, format conversion, resizing, and background color as specified.
- The processed images are saved in a subdirectory named `compressed` within the source directory or the directory of the input file, unless the `--replace` option is used, in which case the original files are replaced.
- Resizing is performed by specifying the desired width and/or height, maintaining the aspect ratio unless both dimensions are provided.

## Dependencies

- **sharp**: A high-performance image processing library for Node.js. It handles the compression, conversion, and background color application for images.
- **minimist**: A library for parsing command-line arguments, allowing for flexible and named options.

## Error Handling

- If the source path is not specified, the tool will display an error message and exit.
- If an unsupported format is specified, the tool will default to retaining the original format.
- Non-image files and directories are skipped with a log message.

## Contribution

Contributions are welcome! If you have suggestions or improvements, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/macCesar/imgconvert-cli).

## License

This project is licensed under the MIT License.
