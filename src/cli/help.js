'use strict';

/**
 * Help display module — topic-based dispatch system
 * Each topic is a self-contained function; displayHelp() kept for backward compat.
 */

const chalk = require('chalk');

const TOPICS = {
  crop: displayCrop,
  resize: displayResize,
  rename: displayRename,
  presets: displayPresets,
  brand: displayBrand,
  alloy: displayAlloy,
};

/**
 * Show detailed help for a specific topic.
 * Exits with code 1 for unknown topics.
 * @param {string} topic
 */
function displayTopic(topic) {
  const fn = TOPICS[topic];
  if (!fn) {
    process.stderr.write(
      chalk.red(`\nUnknown help topic: ${chalk.bold(topic)}\n\n`) +
        `Available topics: ${Object.keys(TOPICS).join(', ')}\n\n`
    );
    process.exit(1);
  }
  fn();
}

/**
 * List all available topics with one-liner descriptions.
 */
function listTopics() {
  console.log(chalk.bold('\nHelp Topics:\n'));
  const descriptions = {
    crop: 'Manual crop, canvas extend, and auto-trim',
    resize: 'Width/height, fit strategies, and anchor positions',
    rename: 'Batch rename strategies and single-file naming',
    presets: 'Built-in presets, custom presets, config file',
    brand: 'Titanium SDK 13.x branding pipeline (brand subcommand)',
    alloy: 'Legacy Titanium Alloy multi-scale asset generation',
  };
  for (const [topic, desc] of Object.entries(descriptions)) {
    console.log(`  ${chalk.green(topic.padEnd(10))} ${desc}`);
  }
  console.log(`\nUsage: ${chalk.green('imgconvert help <topic>')}\n`);
}

/**
 * Backward-compatible entry point.
 * Prints a minimal Usage/Options header so existing tests keep passing,
 * then delegates to listTopics() for the full topic index.
 */
function displayHelp() {
  console.log(chalk.bold('\nUsage:'));
  console.log(`  ${chalk.green('imgconvert')} <source> [options]\n`);
  console.log(chalk.bold('Options:'));
  console.log(`  ${chalk.green('-H, --help')}     Show help`);
  console.log(`  ${chalk.green('-v, --version')}  Show version\n`);
  listTopics();
}

// ---------------------------------------------------------------------------
// Topic functions
// ---------------------------------------------------------------------------

function displayCrop() {
  console.log(chalk.bold('\nManual Crop & Canvas Operations\n'));
  console.log(
    `  ${chalk.green('--crop <left,top,width,height>')}
    Extract a specific region from the image.
    Example: ${chalk.green('imgconvert photo.jpg --crop 100,50,800,600')}

  ${chalk.green('--trim')}
    Automatically remove transparent/white borders around images.
    Example: ${chalk.green('imgconvert icon.png --trim')}

  ${chalk.green('--canvas')} ${chalk.green('--width <n>')} ${chalk.green('--height <n>')}
    Extend the canvas (add padding) without scaling the image.
    The original image is centered; extra space becomes transparent.
    Example: ${chalk.green('imgconvert logo.png --canvas --width 1024 --height 1024')}

  ${chalk.bold('Differences:')}
    ${chalk.green('--crop')}:   Cuts INTO the image (removes parts)
    ${chalk.green('--canvas')}: Adds space AROUND the image (no pixels removed)
    ${chalk.green('--trim')}:   Removes empty/transparent borders (auto-detection)
`
  );
}

function displayResize() {
  console.log(chalk.bold('\nResize & Fit Strategies\n'));
  console.log(
    `  ${chalk.green('--width <n>')}    Set output width in pixels
  ${chalk.green('--height <n>')}   Set output height in pixels

  ${chalk.bold('Fit strategies')} (${chalk.green('--fit <strategy>')}):
    ${chalk.yellow('cover')}    Scale to fill dimensions, crop excess (default for fixed w+h)
    ${chalk.yellow('contain')}  Scale to fit within dimensions, letterbox if needed (default)
    ${chalk.yellow('fill')}     Stretch to exact dimensions (may distort)
    ${chalk.yellow('inside')}   Scale down to fit inside dimensions, never upscale
    ${chalk.yellow('outside')}  Scale up to cover dimensions, never downscale

  ${chalk.green('--position <pos>')}   Crop anchor when using fit: cover
    Values: ${chalk.yellow('center')} (default), ${chalk.yellow('top')}, ${chalk.yellow('bottom')}, ${chalk.yellow('left')}, ${chalk.yellow('right')},
            ${chalk.yellow('top-left')}, ${chalk.yellow('top-right')}, ${chalk.yellow('bottom-left')}, ${chalk.yellow('bottom-right')}

  ${chalk.bold('Examples:')}
    ${chalk.green('imgconvert photo.jpg --width 1200 --height 800 --fit cover')}
    ${chalk.green('imgconvert photo.jpg --width 800 --fit contain')}
    ${chalk.green('imgconvert photo.jpg --height 400 --fit inside')}
    ${chalk.green('imgconvert photo.jpg --width 500 --height 500 --fit cover --position top')}
`
  );
}

function displayRename() {
  console.log(chalk.bold('\nBatch Rename Strategies\n'));
  console.log(
    `  ${chalk.green('--rename <strategy[,strategy...]>')}

  ${chalk.bold('Strategies:')}
    ${chalk.yellow('enumerate')}        Number files sequentially: 001.jpg, 002.jpg, ...
    ${chalk.yellow('lowercase')}        Convert filenames to lowercase
    ${chalk.yellow('replace-spaces')}   Replace spaces with underscores
    ${chalk.yellow('prefix:<text>')}    Add prefix to all filenames (e.g., ${chalk.yellow('prefix:thumb_')})
    ${chalk.yellow('suffix:<text>')}    Add suffix before extension (e.g., ${chalk.yellow('suffix:_optimized')})

  Combine multiple strategies with commas:
    ${chalk.green('imgconvert ./photos --rename lowercase,replace-spaces,prefix:web_')}

  ${chalk.bold('Single file rename:')}
    ${chalk.green('-n, --name <name>')}   Set custom output filename (without extension)
    ${chalk.green('imgconvert photo.jpg --name hero-image -f webp')}

  ${chalk.bold('Examples:')}
    ${chalk.green('imgconvert ./photos --rename enumerate')}
    ${chalk.green('imgconvert ./photos --rename prefix:2024_,lowercase')}
    ${chalk.green('imgconvert banner.png --name banner-retina --width 2048')}
`
  );
}

function displayPresets() {
  console.log(chalk.bold('\nPreset System\n'));
  console.log(
    `  ${chalk.bold('Built-in presets')} (${chalk.green('-p, --preset')}):
    ${chalk.yellow('web')}         Quality: 85, format: webp
    ${chalk.yellow('print')}       Quality: 100, format: tiff
    ${chalk.yellow('thumbnail')}   Width: 150, height: 150, fit: cover, quality: 80

  CLI flags always override preset values:
    ${chalk.green('imgconvert photo.jpg -p web --quality 95')}   (quality = 95, not 85)

  ${chalk.bold('Custom presets')} in ${chalk.green('.imgconverter.config.json')}:
    {
      "presets": {
        "mypreset": {
          "quality": 90,
          "format": "webp",
          "width": 1200
        }
      }
    }

  Use: ${chalk.green('imgconvert ./photos -p mypreset')}

  Create default config: ${chalk.green('imgconvert config init')}
  Show current config:   ${chalk.green('imgconvert config show')}
`
  );
}

function displayBrand() {
  console.log(chalk.bold('\nTitanium SDK 13.x Branding Pipeline\n'));
  console.log(
    `  ${chalk.green('imgconvert brand <master.svg> [options]')}

  No sub-flags = kitchen-sink (all asset types generated).

  ${chalk.bold('Key flags:')}
    ${chalk.green('--adaptive')}          Android adaptive icon triplet × 5 densities
    ${chalk.green('--marketplace')}       iTunesConnect (1024²) + Play Store artwork (512²)
    ${chalk.green('--notification')}      Notification icons × 5 densities
    ${chalk.green('--splash')}            Android 12+ splash_icon × 5 densities
    ${chalk.green('--bg-color <hex>')}    Background color (default: ${chalk.yellow('#FFFFFF')})
    ${chalk.green('--padding <n>')}       Android safe-zone padding 0-40% (default: ${chalk.yellow('20')})
    ${chalk.green('--ios-padding <n>')}   iOS padding 0-40% (default: ${chalk.yellow('4')})
    ${chalk.green('--in-place')}          Write directly into project (OVERWRITES)
    ${chalk.green('--dry-run')}           Preview without writing any files
    ${chalk.green('--cleanup-legacy')}    Remove legacy branding artifacts

  ${chalk.bold('Examples:')}
    ${chalk.green('imgconvert brand logo.svg')}
    ${chalk.green('imgconvert brand logo.svg --adaptive --bg-color "#0B1326"')}
    ${chalk.green('imgconvert brand logo.svg --in-place')}
    ${chalk.green('imgconvert brand --cleanup-legacy --dry-run')}

  Run: ${chalk.green('imgconvert brand --help')} for full flag reference.
`
  );
}

function displayAlloy() {
  console.log(chalk.bold('\nLegacy Titanium Alloy Multi-Scale Assets\n'));
  console.log(
    `  ${chalk.green('imgconvert alloy <source> [options]')}

  Generates multi-scale assets for Titanium Alloy projects:
    ${chalk.bold('Android:')} res-mdpi (1×), res-hdpi (1.5×), res-xhdpi (2×),
             res-xxhdpi (3×), res-xxxhdpi (4×)
    ${chalk.bold('iPhone:')}  1×, 2×, 3×

  ${chalk.bold('Options:')}
    ${chalk.green('-o, --output <dir>')}    Output directory
    ${chalk.green('-p, --preset <name>')}   Alloy preset key from config file

  ${chalk.bold('Examples:')}
    ${chalk.green('imgconvert alloy icon.png')}
    ${chalk.green('imgconvert alloy icon.png -p my-alloy-config')}

  Run: ${chalk.green('imgconvert alloy --help')} for full options.
`
  );
}

module.exports = { displayHelp, displayTopic, listTopics };
