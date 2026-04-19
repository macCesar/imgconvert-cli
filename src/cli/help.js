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
  ${chalk.green('-b, --background')}       Set the background color when converting from formats with transparency to formats without (${chalk.yellow('default: transparent for PNG/WebP, #ffffff for JPEG')})
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
  ${chalk.green('-p, --preset')}           Apply a preset configuration (${chalk.yellow('web, print, thumbnail, alloy, ti-branding')})
                            ${chalk.yellow('alloy')} preset: legacy Titanium Alloy multi-scale 1x/2x/3x + mdpi→xxxhdpi pipeline
                            ${chalk.yellow('ti-branding')} preset: modern Titanium SDK 13.x branding (Alloy + Classic, DefaultIcon + adaptive + marketplace)
  ${chalk.green('--fit')}                  Set resize strategy (${chalk.yellow('cover, contain, fill, inside, outside; default: contain')})
  ${chalk.green('--position')}             Set crop position when using fit: cover (${chalk.yellow('center, top, bottom, left, right, "top left", etc.')})
  ${chalk.green('--crop')}                 Manual crop coordinates (${chalk.yellow('format: left,top,width,height')})
  ${chalk.green('--canvas')}               Resize canvas instead of image (maintains original image, adds transparent padding)
  ${chalk.green('--trim')}                 Automatically remove transparent borders around images
  ${chalk.green('--replace-originals')}    Replace original files instead of creating copies (default: false)

  ${chalk.green('-d, --debug')}            Enable debug mode to show detailed information

  ${chalk.green('<source_path>')}          The path to the image file or directory to process (${chalk.yellow('required')})

${chalk.bold('Titanium — Modern branding (SDK 13.x, Alloy + Classic)')}
  Use ${chalk.yellow('--preset ti-branding')} (preferred) or ${chalk.yellow('--preset alloy')} with ${chalk.yellow('--modern')} to
  generate a full modern branding set from a single SVG/PNG master: DefaultIcon.png,
  DefaultIcon-ios.png, Android adaptive icons × 5 densities, marketplace artwork,
  notification icons, splash icons. Auto-detects Alloy (app/) vs Classic
  (Resources/) layout.

  ${chalk.green('--modern')}                  Kitchen-sink modern flow (adaptive + marketplace)
  ${chalk.green('--adaptive')}                Android adaptive icon triplet + legacy + XML × 5
  ${chalk.green('--marketplace')}             iTunesConnect.png (1024²) + MarketplaceArtwork.png (512²)
  ${chalk.green('--notification')}            Notification icons × 5 densities (white on transparent)
  ${chalk.green('--splash')}                  Android 12+ splash_icon × 5 densities
  ${chalk.green('--bg-color <hex>')}          Background for Android adaptive + iOS flatten (${chalk.yellow('default: #FFFFFF')})
  ${chalk.green('--padding <pct>')}           Android safe-zone padding per side 0-40 (${chalk.yellow('default: 20')}; spec floor: 19.44)
  ${chalk.green('--ios-padding <pct>')}       iOS / marketplace padding per side 0-40 (${chalk.yellow('default: 4')})
  ${chalk.green('--cleanup-legacy')}          Context-aware cleanup using tiapp.xml (prints plan first)
  ${chalk.green('--aggressive')}              Cleanup also removes ldpi density folders
  ${chalk.green('--project <path>')}          Titanium project root (${chalk.yellow('default: cwd')})
  ${chalk.green('--in-place')}                Write directly into the project (OVERWRITES existing icons)
  ${chalk.green('--monochrome-master <path>')} Optional dedicated master for ic_launcher_monochrome.png + ic_stat_notify.png
                            (useful for complex logos where a naive color→white would lose detail)
  ${chalk.green('--notes')}                   Print full tiapp.xml snippets + padding tuning guide (default: compact summary)
  ${chalk.green('--dry-run')}                 Show plan without writing files

Examples:
  ${chalk.green('imgconvert image.jpg')}                                 Compress image (preserves original format)
  ${chalk.green('imgconvert image.jpg -w 300')}                          Resize to 300px width
  ${chalk.green('imgconvert image.jpg -f webp')}                         Convert to WebP format
  ${chalk.green('imgconvert image.jpg -n "converted"')}                  Convert single file with custom name
  ${chalk.green('imgconvert image.jpg -p web')}                          Apply web preset (webp, quality 80)
  ${chalk.green('imgconvert image.png --canvas -h 1660')}                Canvas resize with transparent padding
  ${chalk.green('imgconvert image.png --trim')}                          Remove transparent borders automatically
  ${chalk.green('imgconvert images -f webp -q 80')}                      Convert folder to WebP with 80% quality
  ${chalk.green('imgconvert images --rename enumerate')}                 Convert folder and number files (001, 002...)
  ${chalk.green('imgconvert images --rename "prefix:thumb_,lowercase"')} Add prefix and lowercase filenames
  ${chalk.green('imgconvert logo.svg -p ti-branding --bg-color "#0B1326"')}   Modern Titanium branding from SVG (stages to .ti-branding/)
  ${chalk.green('imgconvert logo.svg -p ti-branding --in-place')}           Brand a fresh project — overwrites default Titanium icons
  ${chalk.green('imgconvert -p ti-branding --cleanup-legacy --dry-run')}     Preview cleanup of legacy branding artifacts
`));
}

module.exports = {
  displayHelp
};
