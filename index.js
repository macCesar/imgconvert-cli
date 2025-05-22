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

// Default presets
const defaultPresets = {
  web: { source: null, quality: 80, format: 'webp' },
  print: { source: null, quality: 100, format: 'tiff' },
  thumbnail: { source: null, width: 150, height: 150, quality: 60, format: 'png' },
  alloy: {
    android: {
      source: null,
      output: "",
      scales: { "res-mdpi": 1, "res-hdpi": 1.5, "res-xhdpi": 2, "res-xxhdpi": 3, "res-xxxhdpi": 4 }
    },
    iphone: {
      source: null,
      output: "",
      scales: { "1x": 1, "2x": 2, "3x": 3 }
    }
  }
};

// Merge config presets
const presets = { ...defaultPresets, ...(config.presets || {}) };

// Helper to display help message
const displayHelp = () => {
  console.log(chalk.blue(`
Usage:
  ${chalk.green('imgconvert <source_path> [-f <format|all>] [-q <quality>] [-b <background_color>] [-r] [-w <width>] [-h <height>] [-o <output_directory>] [-e <environment>] [-p <preset>] [-d]')}

  ${chalk.green('imgconvert config')}  Create a default configuration file

Options:
  ${chalk.green('-H, --help')}         Show this help message
  ${chalk.green('-v, --version')}      Show the version of the module
  ${chalk.green('-f, --format')}       Set the desired output format (${chalk.yellow('jpeg, png, webp, avif, tiff, gif, all; default: none')})
  ${chalk.green('-q, --quality')}      Set the quality of the output images (${chalk.yellow('1-100; default: 85')})
  ${chalk.green('-b, --background')}   Set the background color for PNG images (${chalk.yellow('default: #ffffff')})
  ${chalk.green('-w, --width')}        Set the width of the output images
  ${chalk.green('-h, --height')}       Set the height of the output images
  ${chalk.green('-r, --replace')}      Enables replacement of original files (default: false)
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
  boolean: ['replace'],
  default: {
    preset: null,
    environment: 'dev',
    width: config.width || null,
    height: config.height || null,
    quality: config.quality || 85,
    format: config.format !== undefined ? config.format : null,
    replace: config.replace || false,
    background: config.background || '#ffffff',
    output: config.output || null,
    debug: false
  }
});

// Environment logic
const environment = args.environment || 'dev';
let effectiveReplace = !!args.replace;
let effectiveDebug = !!args.debug;
let effectiveOutput = args.output;

if (environment === 'dev') {
  if (args.replace) {
    console.log(chalk.yellow('[DEV MODE] Overwriting original files is disabled in development environment. Output will be written to "compressed-dev" folder.'));
  }
  effectiveReplace = false;
  effectiveDebug = true;
  // If output is not set, use compressed-dev
  if (!args.output && !config.output) {
    effectiveOutput = null; // will be set to compressed-dev below
  }
}

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
    width: null,
    height: null,
    quality: 85,
    source: null,
    output: null,
    format: null,
    replace: false,
    background: '#ffffff',
    presets: defaultPresets
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
  // If the preset has source, use it, else use global config.source
  if (presetConfig.source) {
    args.presetSource = presetConfig.source;
  } else if (config.source) {
    args.presetSource = config.source;
  }
}

// Input validation
let inputPath = args._[0];
if (!inputPath) {
  // Try to use the source folder from the preset or global config
  if (args.presetSource) {
    inputPath = args.presetSource;
    console.log(chalk.blue(`Using source folder from preset or global config: ${chalk.yellow(inputPath)}`));
  } else if (args.preset === 'alloy') {
    // Try to use source from alloy subpresets
    const alloyPreset = presets.alloy;
    const androidSource = alloyPreset.android && alloyPreset.android.source;
    const iphoneSource = alloyPreset.iphone && alloyPreset.iphone.source;
    if (androidSource) {
      inputPath = androidSource;
      console.log(chalk.blue(`Using source folder from alloy.android preset: ${chalk.yellow(inputPath)}`));
    } else if (iphoneSource) {
      inputPath = iphoneSource;
      console.log(chalk.blue(`Using source folder from alloy.iphone preset: ${chalk.yellow(inputPath)}`));
    } else if (config.source) {
      inputPath = config.source;
      console.log(chalk.blue(`Using global source folder from config: ${chalk.yellow(inputPath)}`));
    }
  } else if (config.source) {
    inputPath = config.source;
    console.log(chalk.blue(`Using global source folder from config: ${chalk.yellow(inputPath)}`));
  }
  if (!inputPath) {
    console.error(chalk.red('Error: Please provide a source file or folder.'));
    process.exit(1);
  }
}
if (!fs.existsSync(inputPath)) {
  console.error(chalk.red(`Error: The specified path "${inputPath}" does not exist.`));
  process.exit(1);
}

// Determine output directory
let outputDir;
if (effectiveOutput) {
  outputDir = effectiveOutput;
} else if (config.output) {
  outputDir = config.output;
} else {
  const inputDir = fs.lstatSync(inputPath).isDirectory() ? inputPath : path.dirname(inputPath);
  outputDir = environment === 'dev'
    ? path.join(inputDir, 'compressed-dev')
    : path.join(inputDir, 'compressed');
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Variables
const userSpecifiedFormat = args.format && args.format !== 'none';
const format = userSpecifiedFormat ? args.format : null; // null si no se especifica
const backgroundColor = args.background;
const quality = parseInt(args.quality, 10);
const replaceOriginal = effectiveReplace;
const width = args.width ? parseInt(args.width, 10) : null;
const height = args.height ? parseInt(args.height, 10) : null;
const debugMode = effectiveDebug;

// Supported image formats
const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'];

// Helper to normalize output subfolder (removes leading/trailing slashes)
function normalizeOutputSubfolder(subfolder) {
  if (!subfolder) return '';
  return subfolder.replace(/^\/+|\/+$/g, '');
}

// Function to get the effective quality for Alloy (CLI > preset > global > default)
function getEffectiveQuality(subPresetName, subPresetConfig) {
  // CLI flag always wins
  if (args.quality) return parseInt(args.quality, 10);
  // Subpreset (android/iphone) quality
  if (subPresetConfig && subPresetConfig.quality) return parseInt(subPresetConfig.quality, 10);
  // Alloy preset quality
  if (presets.alloy && presets.alloy.quality) return parseInt(presets.alloy.quality, 10);
  // Global config
  if (config.quality) return parseInt(config.quality, 10);
  // Default
  return 85;
}

// Function to process images with scaling
const processImageWithScaling = async (inputFile, scales, outputSubfolder, isIPhone, quality) => {
  // Normalize output subfolder to remove leading/trailing slashes
  const normalizedSubfolder = normalizeOutputSubfolder(outputSubfolder);
  const originalImage = sharp(inputFile);
  const metadata = await originalImage.metadata();
  const { size: originalSize } = fs.statSync(inputFile);
  let totalNewSize = 0;
  const processedFiles = [];

  // Set fixed output base for Alloy
  const outputBaseDir = isIPhone
    ? path.join('app', 'assets', 'iphone', 'images')
    : path.join('app', 'assets', 'android', 'images');

  for (const [scaleName, scaleFactor] of Object.entries(scales)) {
    let outputDir;
    let outputFileName;
    let outputFilePath;

    if (isIPhone) {
      outputDir = normalizedSubfolder ? path.join(outputBaseDir, normalizedSubfolder) : outputBaseDir;
      // Asegurar que el directorio existe
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const baseName = path.parse(inputFile).name;
      const ext = path.extname(inputFile);
      outputFileName = scaleName === '1x'
        ? `${baseName}${ext}`
        : `${baseName}@${scaleName}${ext}`;
      outputFilePath = path.join(outputDir, outputFileName);
    } else {
      outputDir = normalizedSubfolder
        ? path.join(outputBaseDir, scaleName, normalizedSubfolder)
        : path.join(outputBaseDir, scaleName);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      outputFileName = path.basename(inputFile);
      outputFilePath = path.join(outputDir, outputFileName);
    }

    const targetWidth = Math.round(metadata.width / 4 * scaleFactor);
    const targetHeight = Math.round(metadata.height / 4 * scaleFactor);

    // Detect output format from extension
    const ext = path.extname(inputFile).toLowerCase();
    let sharpInstance = sharp(inputFile).resize({
      width: targetWidth,
      height: targetHeight,
      fit: 'contain'
    });
    // Apply quality to the output format
    if (ext === '.png') {
      sharpInstance = sharpInstance.png({ quality: quality, compressionLevel: 9 });
    } else if (ext === '.webp') {
      sharpInstance = sharpInstance.webp({ quality: quality });
    } else if (ext === '.avif') {
      sharpInstance = sharpInstance.avif({ quality: quality });
    } else if (ext === '.tiff') {
      sharpInstance = sharpInstance.tiff({ quality: quality, compression: 'lzw' });
    } else if (ext === '.gif') {
      sharpInstance = sharpInstance.gif();
    } else {
      sharpInstance = sharpInstance.flatten({ background: backgroundColor }).jpeg({ quality: quality });
    }
    await sharpInstance.withMetadata({ density: 72 }).toFile(outputFilePath);

    const { size: newSize } = fs.statSync(outputFilePath);
    totalNewSize += newSize;
    processedFiles.push({ path: outputFilePath, scaleName });

    process.stdout.write(chalk.green(`Processed: ${chalk.yellow(outputFilePath)}                \r`));
  }

  return { originalSize, newSize: totalNewSize, processedFiles };
};

// Process image
const processImage = async (inputFile, outputFileBase, format) => {
  let sharpInstance = sharp(inputFile);

  // Si formato es 'all', procesar para todos los formatos soportados
  if (format === 'all') {
    let results = [];
    for (const fmt of supportedFormats) {
      const result = await processImage(inputFile, outputFileBase, fmt);
      if (result) results.push(result);
    }
    // Sumar todos los tamaños originales y nuevos
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
    return { originalSize: totalOriginal / results.length, newSize: totalNew };
  }

  // Si no se especificó formato, usar el formato original del archivo
  let effectiveFormat = format;
  if (!effectiveFormat) {
    effectiveFormat = path.extname(inputFile).slice(1).toLowerCase();
    // Normaliza 'jpg' a 'jpeg' para sharp
    if (effectiveFormat === 'jpg') effectiveFormat = 'jpeg';
  }

  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height);
  }

  if (effectiveFormat === 'png') {
    sharpInstance = sharpInstance.png({
      palette: true,
      quality: quality,
      compressionLevel: 9,
    });
  } else if (effectiveFormat === 'webp') {
    sharpInstance = sharpInstance.webp({
      quality: quality,
    });
  } else if (effectiveFormat === 'avif') {
    sharpInstance = sharpInstance.avif({
      quality: quality,
    });
  } else if (effectiveFormat === 'tiff') {
    sharpInstance = sharpInstance.tiff({
      quality: quality,
      compression: 'lzw',
    });
  } else if (effectiveFormat === 'gif') {
    sharpInstance = sharpInstance.gif();
  } else {
    sharpInstance = sharpInstance.flatten({ background: backgroundColor }).jpeg({
      quality: quality,
    });
  }

  try {
    const { size: originalSize } = fs.statSync(inputFile);
    const tempOutputFile = path.join(os.tmpdir(), `${path.basename(outputFileBase)}.${effectiveFormat}`);
    await sharpInstance.toFile(tempOutputFile);

    const finalOutputFile = replaceOriginal ? `${outputFileBase}.${effectiveFormat}` : path.join(outputDir, `${path.basename(outputFileBase)}.${effectiveFormat}`);

    fs.renameSync(tempOutputFile, finalOutputFile);

    const { size: newSize } = fs.statSync(finalOutputFile);

    // Calcular savings de manera segura para evitar NaN
    let savings = '0.00';
    if (originalSize > 0) {
      savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    }

    process.stdout.write(chalk.green(`Processed: ${chalk.yellow(path.basename(inputFile))} to ${chalk.yellow(effectiveFormat ? effectiveFormat.toUpperCase() : 'UNKNOWN')} (${savings}%)                \r`));
    return { originalSize, newSize };
  } catch (err) {
    console.error(chalk.red(`Error processing ${chalk.yellow(path.basename(inputFile))} to ${chalk.yellow(effectiveFormat ? effectiveFormat.toUpperCase() : 'UNKNOWN')}: ${err.message}`));
    return null;
  }
};

// Process images
const processImages = async () => {
  const isDirectory = fs.lstatSync(inputPath).isDirectory();
  const inputDir = isDirectory ? inputPath : path.dirname(inputPath);
  const files = isDirectory ? fs.readdirSync(inputPath) : [path.basename(inputPath)];
  let processedCount = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  const startTime = Date.now();
  const processedFilesInfo = [];

  const tasks = files.flatMap(file => {
    const inputFile = path.join(inputDir, file);
    const fileExtension = path.extname(file).toLowerCase().slice(1);

    if (supportedFormats.includes(fileExtension) && fs.lstatSync(inputFile).isFile()) {
      if (args.preset === 'alloy') {
        const alloyPreset = presets.alloy;
        return Object.entries(alloyPreset).map(([subPresetName, subPresetConfig]) => {
          const scales = subPresetConfig.scales;
          const outputSubfolder = args.output || subPresetConfig.output || '';
          const isIPhone = subPresetName === 'iphone';
          const effectiveQuality = getEffectiveQuality(subPresetName, subPresetConfig);
          return processImageWithScaling(inputFile, scales, outputSubfolder, isIPhone, effectiveQuality).then(result => {
            if (result) {
              processedFilesInfo.push(...result.processedFiles);
              totalOriginalSize += result.originalSize;
              totalNewSize += result.newSize;
              processedCount++;
            }
            return result;
          });
        });
      } else {
        const outputFileBase = path.join(outputDir, path.parse(inputFile).name);
        // Si no se especificó formato, pásale null para que processImage use el formato original
        return processImage(inputFile, outputFileBase, format).then(result => {
          if (result) {
            totalOriginalSize += result.originalSize;
            totalNewSize += result.newSize;
            processedCount++;
          }
          return result;
        });
      }
    }
    return [];
  });

  await Promise.all(tasks);

  // Log processed files info
  if (debugMode) {
    console.log(chalk.blue(`Processed files:`));
    processedFilesInfo.forEach(fileInfo => {
      console.log(chalk.blue(` - ${fileInfo.path} (scale: ${fileInfo.scaleName})`));
    });
  }

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Calcular savings de manera segura para evitar NaN
  let savings = '0.00';
  if (totalOriginalSize > 0) {
    savings = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(2);
  }

  console.log(chalk.green(`
Processing complete! Summary:
  - Processed files: ${chalk.yellow(processedCount)}
  - Total original size: ${chalk.yellow((totalOriginalSize / 1024).toFixed(2) + ' KB')}
  - Total new size: ${chalk.yellow((totalNewSize / 1024).toFixed(2) + ' KB')}
  - Total savings: ${chalk.yellow(savings + '%')}
  - Duration: ${chalk.yellow(duration + ' seconds')}
`));
};

// Start processing
processImages().catch(err => {
  console.error(chalk.red(`Unexpected error: ${err.message}`));
  process.exit(1);
});
