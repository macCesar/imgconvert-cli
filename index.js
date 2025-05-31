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
  ${chalk.green('imgconvert <source_path> [-f <format|all>] [-q <quality>] [-b <background_color>] [--replace-originals] [-w <width>] [-h <height>] [-o <output_directory>] [-p <preset>] [-d]')}

  ${chalk.green('imgconvert config')}  Create a default configuration file

Options:
  ${chalk.green('-H, --help')}             Show this help message
  ${chalk.green('-v, --version')}          Show the version of the module
  ${chalk.green('-f, --format')}           Set the desired output format (${chalk.yellow('jpeg, png, webp, avif, tiff, gif, all; default: none')})
  ${chalk.green('-q, --quality')}          Set the quality of the output images (${chalk.yellow('1-100; default: 85')})
  ${chalk.green('-b, --background')}       Set the background color for PNG images (${chalk.yellow('default: #ffffff')})
  ${chalk.green('-w, --width')}            Set the width of the output images
  ${chalk.green('-h, --height')}           Set the height of the output images
  ${chalk.green('--replace-originals')}    Replace original files instead of creating copies (default: false)
  ${chalk.green('-o, --output')}           Set the output directory for processed images
  ${chalk.green('-p, --preset')}           Apply a preset configuration (${chalk.yellow('web, print, thumbnail, alloy')})
  ${chalk.green('-d, --debug')}            Enable debug mode to show detailed information

${chalk.green('<source_path>')}            The path to the image file or directory to process (${chalk.yellow('required')})
`));
  process.exit(0);
};

// Parse CLI arguments first without defaults to detect user-specified values
const userArgs = minimist(process.argv.slice(2), {
  alias: {
    H: 'help',
    v: 'version',
    q: 'quality',
    b: 'background',
    f: 'format',
    w: 'width',
    h: 'height',
    o: 'output',
    p: 'preset',
    d: 'debug'
  },
  boolean: ['replace-originals', 'debug']
});

// Create args object with proper precedence: CLI > Preset > Config > Default
const args = {
  preset: userArgs.preset || null,
  width: userArgs.width || null,
  height: userArgs.height || null,
  quality: userArgs.quality || null,
  format: userArgs.format || null,
  'replace-originals': userArgs['replace-originals'] || false,
  background: userArgs.background || null,
  output: userArgs.output || null,
  debug: userArgs.debug || false,
  help: userArgs.help,
  version: userArgs.version,
  _: userArgs._
};

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
    'replace-originals': false,
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

  // Apply correct precedence: CLI > Preset > Config > Default
  // Only apply preset/config values if user didn't specify them via CLI
  if (!userArgs.format) {
    args.format = presetConfig.format || config.format || null;
  }
  if (!userArgs.quality) {
    args.quality = presetConfig.quality || config.quality || 85;
  }
  if (!userArgs.width) {
    args.width = presetConfig.width || config.width || null;
  }
  if (!userArgs.height) {
    args.height = presetConfig.height || config.height || null;
  }
  if (!userArgs.output) {
    args.output = presetConfig.output || config.output || null;
  }
  if (!userArgs['replace-originals']) {
    args['replace-originals'] = presetConfig['replace-originals'] !== undefined ? presetConfig['replace-originals'] : (config['replace-originals'] !== undefined ? config['replace-originals'] : false);
  }
  if (!userArgs.background) {
    args.background = presetConfig.background || config.background || '#ffffff';
  }

  // If the preset has source, use it, else use global config.source
  if (presetConfig.source) {
    args.presetSource = presetConfig.source;
  } else if (config.source) {
    args.presetSource = config.source;
  }
} else {
  // No preset specified, apply config defaults if user didn't specify CLI values
  if (!userArgs.format) {
    args.format = config.format || null;
  }
  if (!userArgs.quality) {
    args.quality = config.quality || 85;
  }
  if (!userArgs.width) {
    args.width = config.width || null;
  }
  if (!userArgs.height) {
    args.height = config.height || null;
  }
  if (!userArgs.output) {
    args.output = config.output || null;
  }
  if (!userArgs['replace-originals']) {
    args['replace-originals'] = config['replace-originals'] !== undefined ? config['replace-originals'] : false;
  }
  if (!userArgs.background) {
    args.background = config.background || '#ffffff';
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
if (args.output) {
  outputDir = args.output;
} else if (config.output) {
  outputDir = config.output;
} else {
  const inputDir = fs.lstatSync(inputPath).isDirectory() ? inputPath : path.dirname(inputPath);
  outputDir = path.join(inputDir, 'converted');
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Variables
const userSpecifiedFormat = args.format && args.format !== 'none';
const format = userSpecifiedFormat ? args.format : null; // null if not specified
const backgroundColor = args.background;
const quality = parseInt(args.quality, 10);
const replaceOriginal = args['replace-originals'];
const width = args.width ? parseInt(args.width, 10) : null;
const height = args.height ? parseInt(args.height, 10) : null;
const debugMode = args.debug;

// Supported image formats
const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'tiff', 'gif'];

// Helper to normalize output subfolder (removes leading/trailing slashes)
function normalizeOutputSubfolder(subfolder) {
  if (!subfolder) return '';
  return subfolder.replace(/^\/+|\/+$/g, '');
}

// Function to get the effective quality for Alloy (CLI > preset > global > default)
function getEffectiveQuality(subPresetName, subPresetConfig) {
  // CLI flag always wins
  if (userArgs.quality) return parseInt(userArgs.quality, 10);
  // Subpreset (android/iphone) quality
  if (subPresetConfig && subPresetConfig.quality) return parseInt(subPresetConfig.quality, 10);
  // Alloy preset quality
  if (presets.alloy && presets.alloy.quality) return parseInt(presets.alloy.quality, 10);
  // Global config
  if (config.quality) return parseInt(config.quality, 10);
  // Default
  return 85;
}

// Function to get the effective format for Alloy (CLI > preset > global > original)
function getEffectiveFormat(subPresetName, subPresetConfig, originalExt) {
  // CLI flag always wins
  if (userArgs.format) return userArgs.format;
  // Subpreset (android/iphone) format
  if (subPresetConfig && subPresetConfig.format) return subPresetConfig.format;
  // Alloy preset format
  if (presets.alloy && presets.alloy.format) return presets.alloy.format;
  // Global config
  if (config.format) return config.format;
  // Default: preserve original extension
  return originalExt.slice(1).toLowerCase();
}

// Function to process images with scaling
const processImageWithScaling = async (inputFile, scales, outputSubfolder, isIPhone, quality, outputFormat) => {
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
      // Ensure the directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const baseName = path.parse(inputFile).name;
      // Use the specified output format instead of original extension
      const ext = outputFormat ? `.${outputFormat}` : path.extname(inputFile);
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
      const baseName = path.parse(inputFile).name;
      // Use the specified output format instead of original extension
      const ext = outputFormat ? `.${outputFormat}` : path.extname(inputFile);
      outputFileName = `${baseName}${ext}`;
      outputFilePath = path.join(outputDir, outputFileName);
    }

    const targetWidth = Math.round(metadata.width / 4 * scaleFactor);
    const targetHeight = Math.round(metadata.height / 4 * scaleFactor);

    // Use the specified output format instead of detecting from extension
    const formatToUse = outputFormat || path.extname(inputFile).toLowerCase().slice(1);
    let sharpFormat = formatToUse;

    // Normalize format for Sharp (jpg -> jpeg)
    if (sharpFormat === 'jpg') {
      sharpFormat = 'jpeg';
    }

    let sharpInstance = sharp(inputFile).resize({
      width: targetWidth,
      height: targetHeight,
      fit: 'contain'
    });

    // Apply quality to the output format
    if (sharpFormat === 'png') {
      sharpInstance = sharpInstance.png({ quality: quality, compressionLevel: 9 });
    } else if (sharpFormat === 'webp') {
      sharpInstance = sharpInstance.webp({ quality: quality });
    } else if (sharpFormat === 'avif') {
      sharpInstance = sharpInstance.avif({ quality: quality });
    } else if (sharpFormat === 'tiff') {
      sharpInstance = sharpInstance.tiff({ quality: quality, compression: 'lzw' });
    } else if (sharpFormat === 'gif') {
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

  // Conservar la extensión original para el output
  let outputExtension = format;
  let sharpFormat = format;

  if (!outputExtension) {
    outputExtension = path.extname(inputFile).slice(1).toLowerCase();
    sharpFormat = outputExtension;
  }

  // Solo normalizar para Sharp, no para el nombre del archivo
  if (sharpFormat === 'jpg') {
    sharpFormat = 'jpeg';
  }

  // Si formato es 'all', procesar para todos los formatos soportados
  if (format === 'all') {
    let results = [];
    for (const fmt of supportedFormats) {
      const result = await processImage(inputFile, outputFileBase, fmt);
      if (result) results.push(result);
    }
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
    return { originalSize: totalOriginal / results.length, newSize: totalNew };
  }

  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height);
  }

  // Usar sharpFormat para Sharp (puede ser 'jpeg')
  if (sharpFormat === 'png') {
    sharpInstance = sharpInstance.png({
      palette: true,
      quality: quality,
      compressionLevel: 9,
    });
  } else if (sharpFormat === 'webp') {
    sharpInstance = sharpInstance.webp({
      quality: quality,
    });
  } else if (sharpFormat === 'avif') {
    sharpInstance = sharpInstance.avif({
      quality: quality,
    });
  } else if (sharpFormat === 'tiff') {
    sharpInstance = sharpInstance.tiff({
      quality: quality,
      compression: 'lzw',
    });
  } else if (sharpFormat === 'gif') {
    sharpInstance = sharpInstance.gif();
  } else {
    // Para JPEG (incluyendo archivos JPG originales)
    sharpInstance = sharpInstance.flatten({ background: backgroundColor }).jpeg({
      quality: quality,
    });
  }

  try {
    const { size: originalSize } = fs.statSync(inputFile);

    // Usar outputExtension para el nombre del archivo (conserva 'jpg' si era 'jpg')
    const tempOutputFile = path.join(os.tmpdir(), `${path.basename(outputFileBase)}.${outputExtension}`);
    await sharpInstance.toFile(tempOutputFile);

    const finalOutputFile = replaceOriginal
      ? `${outputFileBase}.${outputExtension}`
      : path.join(outputDir, `${path.basename(outputFileBase)}.${outputExtension}`);

    fs.renameSync(tempOutputFile, finalOutputFile);

    const { size: newSize } = fs.statSync(finalOutputFile);

    let savings = '0.00';
    if (originalSize > 0) {
      savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    }

    // Para el log, usar la extensión original
    const displayFormat = outputExtension.toUpperCase();
    process.stdout.write(chalk.green(`Processed: ${chalk.yellow(path.basename(inputFile))} to ${chalk.yellow(displayFormat)} (${savings}%)                \r`));
    return { originalSize, newSize };
  } catch (err) {
    const displayFormat = outputExtension ? outputExtension.toUpperCase() : 'UNKNOWN';
    console.error(chalk.red(`Error processing ${chalk.yellow(path.basename(inputFile))} to ${chalk.yellow(displayFormat)}: ${err.message}`));
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
    let fileExtension = path.extname(file).toLowerCase().slice(1);

    if (supportedFormats.includes(fileExtension) && fs.lstatSync(inputFile).isFile()) {
      if (args.preset === 'alloy') {
        const alloyPreset = presets.alloy;
        return Object.entries(alloyPreset).map(([subPresetName, subPresetConfig]) => {
          const scales = subPresetConfig.scales;
          const outputSubfolder = args.output || subPresetConfig.output || '';
          const isIPhone = subPresetName === 'iphone';
          const effectiveQuality = getEffectiveQuality(subPresetName, subPresetConfig);
          const effectiveFormat = getEffectiveFormat(subPresetName, subPresetConfig, path.extname(inputFile));
          return processImageWithScaling(inputFile, scales, outputSubfolder, isIPhone, effectiveQuality, effectiveFormat).then(result => {
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
