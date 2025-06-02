/**
 * Help display module
 * Shows usage information and examples
 */

const chalk = require('chalk');

/**
 * Display help message
 */
function displayHelp() {
  console.log(chalk.blue(`
Usage:
  ${chalk.green('imgconvert <source_path> [-f <format|all>] [-q <quality>] [-b <background_color>] [--replace-originals] [-w <width>] [-h <height>] [-o <output_directory>] [-p <preset>] [--fit <strategy>] [--position <position>] [--crop <coordinates>] [-d]')}

  ${chalk.green('imgconvert config')}  Create a default configuration file

Options:
  ${chalk.green('-H, --help')}             Show this help message
  ${chalk.green('-v, --version')}          Show the version of the module
  ${chalk.green('-f, --format')}           Set the desired output format (${chalk.yellow('jpeg, png, webp, avif, tiff, gif, all; default: none')})
  ${chalk.green('-q, --quality')}          Set the quality of the output images (${chalk.yellow('1-100; default: 85')})
  ${chalk.green('-b, --background')}       Set the background color for PNG images (${chalk.yellow('default: #ffffff')})
  ${chalk.green('-w, --width')}            Set the width of the output images
  ${chalk.green('-h, --height')}           Set the height of the output images
  ${chalk.green('-o, --output')}           Set the output directory for processed images
  ${chalk.green('-n, --name')}             Set custom filename for single file conversion (without extension)
  ${chalk.green('--rename')}               Batch renaming strategy for folder processing:
                            ${chalk.yellow('enumerate')} - Number files sequentially (001, 002, 003...)
                            ${chalk.yellow('lowercase')} - Convert filenames to lowercase
                            ${chalk.yellow('replace-spaces')} - Replace spaces with underscores
                            ${chalk.yellow('prefix:<text>')} - Add prefix to all files (e.g., prefix:thumb_)
                            ${chalk.yellow('suffix:<text>')} - Add suffix before extension (e.g., suffix:_optimized)
                            Multiple strategies can be combined with commas
  ${chalk.green('-p, --preset')}           Apply a preset configuration (${chalk.yellow('web, print, thumbnail, alloy')})
                            ${chalk.yellow('alloy')} preset is for Titanium SDK development, generates multi-resolution images for Android/iOS
  ${chalk.green('--fit')}                  Set resize strategy (${chalk.yellow('cover, contain, fill, inside, outside; default: contain')})
  ${chalk.green('--position')}             Set crop position when using fit: cover (${chalk.yellow('center, top, bottom, left, right, "top left", etc.')})
  ${chalk.green('--crop')}                 Manual crop coordinates (${chalk.yellow('format: left,top,width,height')})
  ${chalk.green('--replace-originals')}    Replace original files instead of creating copies (default: false)

  ${chalk.green('-d, --debug')}            Enable debug mode to show detailed information

  ${chalk.green('<source_path>')}          The path to the image file or directory to process (${chalk.yellow('required')})

Examples:
  ${chalk.green('imgconvert image.jpg')}                    Compress image (preserves original format)
  ${chalk.green('imgconvert image.jpg -w 300')}             Resize to 300px width
  ${chalk.green('imgconvert image.jpg -f webp')}            Convert to WebP format
  ${chalk.green('imgconvert image.jpg -n "converted"')}     Convert single file with custom name
  ${chalk.green('imgconvert image.jpg -p web')}             Apply web preset (webp, quality 80)
  ${chalk.green('imgconvert images -f webp -q 80')}         Convert folder to WebP with 80% quality
  ${chalk.green('imgconvert images --rename enumerate')}    Convert folder and number files (001, 002...)
  ${chalk.green('imgconvert images --rename "prefix:thumb_,lowercase"')} Add prefix and lowercase filenames
`));
}

module.exports = {
  displayHelp
};
