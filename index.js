#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');
const chalk = require('chalk');
const minimist = require('minimist');
const { version } = require('./package.json');

// Paths
const configPath = path.join(process.cwd(), '.imgconverter.config.json');

// Load configuration
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

// Default presets and environments
const defaultPresets = {
  web: { format: 'webp', quality: 80, width: 1024, height: 768 },
  print: { format: 'jpeg', quality: 100 },
  thumbnail: { format: 'png', quality: 60, width: 150, height: 150 },
  alloy: {
    android: {
      scales: {
        "res-mdpi": 1,
        "res-hdpi": 1.5,
        "res-xhdpi": 2,
        "res-xxhdpi": 3,
        "res-xxxhdpi": 4
      },
      output: "./app/assets/android/images"
    },
    iphone: {
      scales: {
        "1x": 1,
        "2x": 2,
        "3x": 3
      },
      output: "./app/assets/iphone/images"
    }
  }
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
Usage: ${chalk.green('imgconvert <source_path> [-f=<format|all>] [-q=<quality>] [-b=<background_color>] [-r=<replace>] [-w=<width>] [-h=<height>] [-o=<output_directory>] [-e=<environment>] [-p=<preset>] [-d]')}

Options:
  ${chalk.green('-H, --help')}         Show this help message
  ${chalk.green('-v, --version')}      Show the version of the module
  ${chalk.green('-f, --format')}       Set the desired output format (${chalk.yellow('jpeg, png, webp, avif, tiff, gif, all; default: none')})
  ${chalk.green('-q, --quality')}      Set the quality of the output images (${chalk.yellow('1-100; default: 85')})
  ${chalk.green('-b, --background')}   Set the background color for PNG images (${chalk.yellow('default: #ffffff')})
  ${chalk.green('-w, --width')}        Set the width of the output images
  ${chalk.green('-h, --height')}       Set the height of the output images
  ${chalk.green('-r, --replace')}      Replace original files (${chalk.yellow('true or false; default: false')})
  ${chalk.green('-o, --output')}       Set the output directory for processed images
  ${chalk.green('-p, --preset')}       Apply a preset configuration (${chalk.yellow('web, print, thumbnail, alloy')})
  ${chalk.green('-e, --environment')}  Set the environment (${chalk.yellow('dev, prod; default: dev')})
  ${chalk.green('-d, --debug')}        Enable debug mode to show detailed information

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
    o: 'output',
    p: 'preset',
    e: 'environment',
    d: 'debug'
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
    output: config.output || null,
    debug: false
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

// Create default configuration file
if (args._[0] === 'config') {
  const defaultConfig = {
    presets: defaultPresets,
    environments: defaultEnvironments,
    width: null,
    height: null,
    quality: 85,
    format: 'none',
    replace: false,
    background: '#ffffff',
    output: null
  };

  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  console.log(chalk.green(`Default configuration file created at ${chalk.yellow(configPath)}`));
  process.exit(0);
}

// Apply preset if specified
if (args.preset && presets[args.preset]) {
  const presetConfig = presets[args.preset];
  args.format = presetConfig.format || args.format;
  args.quality = presetConfig.quality || args.quality;
  args.width = presetConfig.width || args.width;
  args.height = presetConfig.height || args.height;
  args.output = presetConfig.output || args.output;
  args.replace = presetConfig.replace !== undefined ? presetConfig.replace : args.replace;
  args.background = presetConfig.background || args.background;
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

// Determine output directory
let outputDir;
if (args.output) {
  outputDir = args.output;
} else if (config.output) {
  outputDir = config.output;
} else {
  const inputDir = fs.lstatSync(inputPath).isDirectory() ? inputPath : path.dirname(inputPath);
  outputDir = path.join(inputDir, 'compressed');
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Variables
const format = args.format;
const backgroundColor = args.background;
const quality = parseInt(args.quality, 10);
const replaceOriginal = args.replace === 'true';
const width = args.width ? parseInt(args.width, 10) : null;
const height = args.height ? parseInt(args.height, 10) : null;

// Supported image formats
const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'];

// Function to process images with scaling
const processImageWithScaling = async (inputFile, scales, outputBaseDir, isIPhone) => {
  const originalImage = sharp(inputFile);
  const metadata = await originalImage.metadata();
  const { size: originalSize } = fs.statSync(inputFile);
  let totalNewSize = 0;

  for (const [scaleName, scaleFactor] of Object.entries(scales)) {
    const outputDir = isIPhone ? outputBaseDir : path.join(outputBaseDir, scaleName);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let outputFileName;
    if (isIPhone) {
      outputFileName = scaleName === '1x'
        ? `${path.basename(inputFile)}`
        : `${path.basename(inputFile, path.extname(inputFile))}@${scaleName}${path.extname(inputFile)}`;
    } else {
      outputFileName = path.basename(inputFile);
    }

    const outputFilePath = path.join(outputDir, outputFileName);

    const targetWidth = Math.round(metadata.width / 4 * scaleFactor);
    const targetHeight = Math.round(metadata.height / 4 * scaleFactor);

    await originalImage
      .resize({
        width: targetWidth,
        height: targetHeight,
        fit: 'contain'
      })
      .withMetadata({ density: 72 })
      .toFile(outputFilePath);

    const { size: newSize } = fs.statSync(outputFilePath);
    totalNewSize += newSize;

    process.stdout.write(chalk.green(`Processed: ${chalk.yellow(outputFilePath)}                       \r`));
  }

  return { originalSize, newSize: totalNewSize };
};

// Process image
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
    process.stdout.write(chalk.green(`Processed: ${chalk.yellow(path.basename(inputFile))} to ${chalk.yellow(format.toUpperCase())} (${savings}%)                \r`));
    return { originalSize, newSize };
  } catch (err) {
    console.error(chalk.red(`Error processing ${chalk.yellow(path.basename(inputFile))} to ${chalk.yellow(format.toUpperCase())}: ${err.message}`));
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

  const tasks = files.flatMap(file => {
    const inputFile = path.join(inputDir, file);
    const fileExtension = path.extname(file).toLowerCase().slice(1);

    if (supportedFormats.includes(fileExtension) && fs.lstatSync(inputFile).isFile()) {
      if (args.preset === 'alloy') {
        const alloyPreset = presets.alloy;
        return Object.entries(alloyPreset).map(([subPresetName, subPresetConfig]) => {
          const scales = subPresetConfig.scales;
          const outputBaseDir = subPresetConfig.output || args.output || path.join(inputDir, 'compressed');
          const isIPhone = subPresetName === 'iphone';
          return processImageWithScaling(inputFile, scales, outputBaseDir, isIPhone);
        });
      } else {
        const outputFileBase = replaceOriginal ? path.join(inputDir, path.parse(file).name) : path.join(outputDir, path.parse(file).name);

        if (format === 'all') {
          return Promise.all(supportedFormats.map(fmt => processImage(inputFile, outputFileBase, fmt)));
        } else {
          return processImage(inputFile, outputFileBase, format === 'none' ? fileExtension : format);
        }
      }
    }
    return [];
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
    console.log(chalk.green(`${chalk.yellow('Process complete!')} | The images can be found in: ${chalk.yellow(outputDir)}`));

    if (args.debug) {
      const totalSavings = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(2);

      console.log(chalk.green(`\nStats:
  Total Images: ${chalk.yellow(processedCount)}
  Elapsed Time: ${chalk.yellow(elapsedTime + ' secs')}
  Original Size: ${chalk.yellow((totalOriginalSize / 1024 / 1024).toFixed(2) + ' MB')}
  Compressed Size: ${chalk.yellow((totalNewSize / 1024 / 1024).toFixed(2) + ' MB')}
  Total Size Reduction: ${chalk.yellow(totalSavings + '%')}`));
    }
  }
};

processImages().catch(err => {
  console.error(chalk.red(`Failed to process images: ${err.message}`));
  process.exit(1);
});
