# imgconvert-cli

`imgconvert-cli` is a command-line tool for compressing and converting images using the powerful `sharp` library. It supports various image formats and allows you to optimize your images for web use or other purposes.

## Features

- **Image Compression**: Compress images to reduce file size while maintaining quality.
- **Format Conversion**: Convert images between different formats such as JPEG, PNG, and WebP.
- **Batch Processing**: Process all images in a specified directory.
- **Customizable Quality**: Adjust the quality of the output images.

## Installation

To install `imgconvert-cli`, you need to have Node.js and NPM installed on your system. Then, you can install the module globally using:

```bash
npm install -g imgconvert-cli
```

## Usage

The basic syntax for using `imgconvert-cli` is:

```bash
imgconvert <input_directory> [format] [quality]
```

- `<input_directory>`: The path to the directory containing the images you want to process.
- `[format]`: (Optional) The desired output format. Supported formats are `jpeg`, `png`, and `webp`. If not specified, the original format is retained.
- `[quality]`: (Optional) The quality of the output images, specified as an integer between 1 and 100. The default quality is 85.

### Examples

1. **Compress Images Without Changing Format**

   To compress images in a directory without changing their format, simply specify the directory:

   ```bash
   imgconvert /path/to/images
   ```

2. **Convert Images to WebP with Custom Quality**

   To convert all images in a directory to WebP format with a quality of 75:

   ```bash
   imgconvert /path/to/images webp 75
   ```

3. **Convert Images to PNG with Default Quality**

   To convert all images in a directory to PNG format with the default quality:

   ```bash
   imgconvert /path/to/images png
   ```

4. **Convert Images to JPEG with High Quality**

   To convert all images in a directory to JPEG format with a quality of 95:

   ```bash
   imgconvert /path/to/images jpeg 95
   ```

## How It Works

- The tool reads all files in the specified input directory.
- It processes each image using the `sharp` library, applying compression and format conversion as specified.
- The processed images are saved in a subdirectory named `compressed` within the input directory.

## Dependencies

- **sharp**: A high-performance image processing library for Node.js. It handles the compression and conversion of images.

## Error Handling

- If the input directory is not specified, the tool will display an error message and exit.
- If an unsupported format is specified, the tool will default to retaining the original format.

## Contribution

Contributions are welcome! If you have suggestions or improvements, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/yourusername/imgconvert-cli).

## License

This project is licensed under the MIT License.
