#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');
const chalk = require('chalk');
const minimist = require('minimist');
const { version } = require('./package.json');

// Paths
const configPath = path.join(process.cwd(), '.imgconverter.config');

// Load configuration
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

// Default presets and environments
const defaultPresets = {
  web: { format: 'webp', quality: 80, width: 1024, height: 768 },
  print: { format: 'jpeg', quality: 100 },
  thumbnail: { format: 'png', quality: 60, width: 150, height: 150 }
};

const defaultEnvironments = {
  dev: { replace: false },
  prod: { replace: true }
};

// Merge config presets and environments
const presets = { ...defaultPresets, ...(config.presets || {}) };
const environments = { ...defaultEnvironments, ...(config.environments || {}) };

// Helper to display help message
const displayHelp = () => {
  console.log(chalk.blue(`
Usage: ${chalk.green('imgconvert <source_path> [-f=<format|all>] [-q=<quality>] [-b=<background_color>] [-r=<replace>] [-w=<width>] [-h=<height>] [-e=<environment>] [-p=<preset>]')}

Options:
  ${chalk.green('-H, --help')}         Show this help message
  ${chalk.green('-v, --version')}      Show the version of the module
  ${chalk.green('-f, --format')}       Set the desired output format (${chalk.yellow('jpeg, png, webp, avif, tiff, gif, all; default: none')})
  ${chalk.green('-q, --quality')}      Set the quality of the output images (${chalk.yellow('1-100; default: 85')})
  ${chalk.green('-b, --background')}   Set the background color for PNG images (${chalk.yellow('default: #ffffff')})
  ${chalk.green('-w, --width')}        Set the width of the output images
  ${chalk.green('-h, --height')}       Set the height of the output images
  ${chalk.green('-r, --replace')}      Replace original files (${chalk.yellow('true or false; default: false')})
  ${chalk.green('-p, --preset')}       Apply a preset configuration (${chalk.yellow('web, print, thumbnail')})
  ${chalk.green('-e, --environment')}  Set the environment (${chalk.yellow('dev, prod; default: dev')})

${chalk.green('<source_path>')}        The path to the image file or directory to process (${chalk.yellow('required')})
`));
  process.exit(0);
};

// Parse CLI arguments
const args = minimist(process.argv.slice(2), {
  alias: {
    H: 'help',
    v: 'version',
    q: 'quality',
    b: 'background',
    f: 'format',
    r: 'replace',
    w: 'width',
    h: 'height',
    p: 'preset',
    e: 'environment'
  },
  default: {
    preset: null,
    environment: 'dev',
    width: config.width || null,
    height: config.height || null,
    quality: config.quality || 85,
    format: config.format || 'none',
    replace: config.replace || false,
    background: config.background || '#ffffff',
  }
});

// Handle height and width validation
if (args.height && (isNaN(parseInt(args.height)) || parseInt(args.height) <= 0)) {
  console.error(chalk.red(`Error: The height argument ('-h' or '--height') must be a positive integer.`));
  process.exit(1);
}

if (args.height) {
  args.height = parseInt(args.height, 10);
}

if (args.width && (isNaN(parseInt(args.width)) || parseInt(args.width) <= 0)) {
  console.error(chalk.red(`Error: The width argument ('-w' or '--width') must be a positive integer.`));
  process.exit(1);
}

if (args.width) {
  args.width = parseInt(args.width, 10);
}

if (args.help) {
  displayHelp();
}

if (args.version) {
  console.log(chalk.blue(`imgconvert-cli version: ${version}`));
  process.exit(0);
}

// Apply preset if specified
if (args.preset && presets[args.preset]) {
  const presetConfig = presets[args.preset];
  args.format = presetConfig.format || args.format;
  args.quality = presetConfig.quality || args.quality;
  args.width = presetConfig.width || args.width;
  args.height = presetConfig.height || args.height;
}

// Apply environment settings
if (args.environment && environments[args.environment]) {
  const envConfig = environments[args.environment];
  args.replace = envConfig.replace || args.replace;
}

// Input validation
const inputPath = args._[0];
if (!inputPath) {
  console.error(chalk.red('Error: Please provide a source file or folder.'));
  process.exit(1);
}
if (!fs.existsSync(inputPath)) {
  console.error(chalk.red(`Error: The specified path "${inputPath}" does not exist.`));
  process.exit(1);
}

// Variables
const format = args.format;
const backgroundColor = args.background;
const quality = parseInt(args.quality, 10);
const replaceOriginal = args.replace === 'true';
const width = args.width ? parseInt(args.width, 10) : null;
const height = args.height ? parseInt(args.height, 10) : null;

let outputDir;
if (fs.lstatSync(inputPath).isDirectory()) {
  outputDir = replaceOriginal ? inputPath : path.join(inputPath, 'compressed');
} else {
  outputDir = replaceOriginal ? path.dirname(inputPath) : path.join(path.dirname(inputPath), 'compressed');
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Supported image formats
const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'];

const processImage = async (inputFile, outputFileBase, format) => {
  let sharpInstance = sharp(inputFile);

  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height);
  }

  if (format === 'png') {
    sharpInstance = sharpInstance.png({
      palette: true,
      quality: quality,
      compressionLevel: 9,
    });
  } else if (format === 'webp') {
    sharpInstance = sharpInstance.webp({
      quality: quality,
    });
  } else if (format === 'avif') {
    sharpInstance = sharpInstance.avif({
      quality: quality,
    });
  } else if (format === 'tiff') {
    sharpInstance = sharpInstance.tiff({
      quality: quality,
      compression: 'lzw',
    });
  } else if (format === 'gif') {
    sharpInstance = sharpInstance.gif();
  } else {
    sharpInstance = sharpInstance.flatten({ background: backgroundColor }).jpeg({
      quality: quality,
    });
  }

  try {
    const { size: originalSize } = fs.statSync(inputFile);
    const tempOutputFile = path.join(os.tmpdir(), `${path.basename(outputFileBase)}.${format}`);
    await sharpInstance.toFile(tempOutputFile);

    const finalOutputFile = replaceOriginal ? `${outputFileBase}.${format}` : path.join(outputDir, `${path.basename(outputFileBase)}.${format}`);

    fs.renameSync(tempOutputFile, finalOutputFile);

    const { size: newSize } = fs.statSync(finalOutputFile);
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    process.stdout.write(chalk.green(`Processed: ${path.basename(inputFile)} to ${format.toUpperCase()} (${savings}%)                \r`));
    return { originalSize, newSize };
  } catch (err) {
    console.error(chalk.red(`Error processing ${path.basename(inputFile)} to ${format.toUpperCase()}: ${err.message}`));
    return null;
  }
};

// Process images
const processImages = async () => {
  const isDirectory = fs.lstatSync(inputPath).isDirectory();
  const inputDir = isDirectory ? inputPath : path.dirname(inputPath);
  const files = isDirectory ? fs.readdirSync(inputPath) : [path.basename(inputPath)];

  let totalNewSize = 0;
  let processedCount = 0;
  let totalOriginalSize = 0;
  const startTime = Date.now();

  const tasks = files.map(file => {
    const inputFile = path.join(inputDir, file);
    const fileExtension = path.extname(file).toLowerCase().slice(1);

    if (supportedFormats.includes(fileExtension) && fs.lstatSync(inputFile).isFile()) {
      const outputFileBase = replaceOriginal ? path.join(inputDir, path.parse(file).name) : path.join(outputDir, path.parse(file).name);

      if (format === 'all') {
        return Promise.all(supportedFormats.map(fmt => processImage(inputFile, outputFileBase, fmt)));
      } else {
        return processImage(inputFile, outputFileBase, format === 'none' ? fileExtension : format);
      }
    }
    return Promise.resolve();
  });

  const results = await Promise.all(tasks);

  results.forEach(result => {
    if (result && result.originalSize && result.newSize) {
      processedCount += 1;
      totalNewSize += result.newSize;
      totalOriginalSize += result.originalSize;
    }
  });

  const endTime = Date.now();
  const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

  if (processedCount === 0) {
    console.log(chalk.yellow('No valid images were found or processed in the specified location.'));
  } else {
    const totalSavings = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(2);
    console.log(chalk.blue(`${chalk.green(processedCount + ' file(s)')} were processed in ${chalk.green(elapsedTime + ' seconds')}. Total size reduction: ${chalk.green(totalSavings + '%')}.`));
    console.log(chalk.blue(`\nThe images can be found in: ${chalk.green(outputDir)}`));

    console.log(chalk.green(`\nProcessed ${processedCount} images`));
    console.log(chalk.green(`Original Size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`));
    console.log(chalk.green(`Compressed Size: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`));
  }
};

processImages().catch(err => {
  console.error(chalk.red(`Failed to process images: ${err.message}`));
  process.exit(1);
});
