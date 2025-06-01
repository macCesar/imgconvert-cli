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

// Titanium Alloy platform scales (immutable - these are Titanium standards)
const ALLOY_SCALES = Object.freeze({
  android: Object.freeze({ "res-mdpi": 1, "res-hdpi": 1.5, "res-xhdpi": 2, "res-xxhdpi": 3, "res-xxxhdpi": 4 }),
  iphone: Object.freeze({ "1x": 1, "2x": 2, "3x": 3 })
});

// Default presets
const defaultPresets = {
  print: { source: null, output: null, quality: 100, format: 'tiff', fit: 'contain' },
  web: { source: null, output: null, quality: 80, format: 'webp', fit: 'cover', position: 'center' },
  thumbnail: { source: null, output: null, width: 150, height: 150, quality: 60, format: 'png', fit: 'cover', position: 'center' },
  alloy: {
    android: {
      source: null,
      output: null
    },
    iphone: {
      source: null,
      output: null
    }
  }
};

// Merge config presets
const presets = { ...defaultPresets, ...(config.presets || {}) };

// Helper to display help message
const displayHelp = () => {
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
  ${chalk.green('imgconvert image.jpg -f webp')}            Convert to WebP format
  ${chalk.green('imgconvert image.jpg -w 300')}             Resize to 300px width
  ${chalk.green('imgconvert images -f webp -q 80')}         Convert folder to WebP with 80% quality
  ${chalk.green('imgconvert image.jpg -p web')}             Apply web preset (webp, quality 80)
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
    d: 'debug',
    'fit': 'fit',
    'crop': 'crop',
    'position': 'position'
  },
  boolean: ['replace-originals', 'debug']
});

// Create args object with proper precedence: CLI > Preset > Config > Default
const args = {
  _: userArgs._,
  help: userArgs.help,
  version: userArgs.version,
  width: userArgs.width || null,
  debug: userArgs.debug || false,
  output: userArgs.output || null,
  preset: userArgs.preset || null,
  height: userArgs.height || null,
  format: userArgs.format || null,
  quality: userArgs.quality || null,
  background: userArgs.background || null,

  fit: userArgs.fit || null,
  crop: userArgs.crop || null,
  position: userArgs.position || null,

  'replace-originals': userArgs['replace-originals'] || false,
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
    quality: 85,
    width: null,
    height: null,
    source: null,
    output: null,
    format: null,

    crop: null,
    fit: 'contain',
    position: 'center',
    background: '#ffffff',

    'replace-originals': false,

    presets: defaultPresets,
  };

  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  console.log(chalk.green(`Default configuration file created at ${chalk.yellow(configPath)}`));
  process.exit(0);
}

// Parse preset and subpreset (e.g., "alloy:comics")
let presetName = args.preset;
let subPreset = null;

if (args.preset && args.preset.includes(':')) {
  const parts = args.preset.split(':');
  presetName = parts[0];
  subPreset = parts[1];
}

// Apply preset if specified
if (presetName && presets[presetName]) {
  const presetConfig = presets[presetName];

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
  if (!userArgs.crop) {
    args.crop = presetConfig.crop || config.crop || null;
  }
  if (!userArgs.fit) {
    args.fit = presetConfig.fit || config.fit || 'contain';
  }
  if (!userArgs.position) {
    args.position = presetConfig.position || config.position || 'center';
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
  if (!userArgs.crop) {
    args.crop = config.crop || null;
  }
  if (!userArgs.fit) {
    args.fit = config.fit || 'contain';
  }
  if (!userArgs.position) {
    args.position = config.position || 'center';
  }
}

// Input validation
let inputPath = args._[0];
if (!inputPath) {
  // Try to use the source folder from the preset or global config
  if (args.presetSource) {
    inputPath = args.presetSource;
    console.log(chalk.blue(`Using source folder from preset or global config: ${chalk.yellow(inputPath)}`));
  } else if (presetName === 'alloy') {
    // For alloy preset, we'll handle multiple sources in processImages
    // Just set a flag to indicate we're using alloy preset
    args.useAlloyMultipleSources = true;
    args.alloySubPreset = subPreset; // Store the specific subpreset if provided
  } else if (config.source) {
    inputPath = config.source;
    console.log(chalk.blue(`Using global source folder from config: ${chalk.yellow(inputPath)}`));
  }
  if (!inputPath && !args.useAlloyMultipleSources) {
    console.error(chalk.red('Error: Please provide a source file or folder.'));
    process.exit(1);
  }
}

// Warning for alloy preset with width/height
if (presetName === 'alloy' && (args.width || args.height)) {
  console.log(chalk.yellow('Warning: Width and height parameters are ignored when using the alloy preset. Images are scaled based on predefined factors.'));
}

// For alloy preset with multiple sources, we don't check path existence here
// as we'll handle multiple paths in processImages
if (inputPath && !fs.existsSync(inputPath)) {
  console.error(chalk.red(`Error: The specified path "${inputPath}" does not exist.`));
  process.exit(1);
}

// Determine output directory
let outputDir;
if (args.output) {
  outputDir = args.output;
} else if (config.output) {
  outputDir = config.output;
} else if (inputPath) {
  const inputDir = fs.lstatSync(inputPath).isDirectory() ? inputPath : path.dirname(inputPath);
  outputDir = path.join(inputDir, 'converted');
} else {
  // For alloy preset with multiple sources, we don't need a default output dir
  // as each platform will create its own directories
  outputDir = null;
}

// Ensure output directory exists (only if we have a single output directory)
// Skip creation for alloy preset as each platform creates its own specific directories
if (outputDir && !fs.existsSync(outputDir) && presetName !== 'alloy') {
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
function getEffectiveQuality(subPresetName, subPresetConfig, configGroupName) {
  // CLI flag always wins
  if (userArgs.quality) return parseInt(userArgs.quality, 10);
  // Subpreset (android/iphone) quality
  if (subPresetConfig && subPresetConfig.quality) return parseInt(subPresetConfig.quality, 10);
  // Configuration group quality (cards, thumbs, etc.)
  if (configGroupName && presets.alloy && presets.alloy[configGroupName] && presets.alloy[configGroupName].quality) {
    return parseInt(presets.alloy[configGroupName].quality, 10);
  }
  // Alloy preset quality
  if (presets.alloy && presets.alloy.quality) return parseInt(presets.alloy.quality, 10);
  // Global config
  if (config.quality) return parseInt(config.quality, 10);
  // Default
  return 85;
}

// Function to get the effective format for Alloy (CLI > preset > global > original)
function getEffectiveFormat(subPresetName, subPresetConfig, originalExt, configGroupName) {
  // CLI flag always wins
  if (userArgs.format) return userArgs.format;
  // Subpreset (android/iphone) format
  if (subPresetConfig && subPresetConfig.format) return subPresetConfig.format;
  // Configuration group format (cards, thumbs, etc.)
  if (configGroupName && presets.alloy && presets.alloy[configGroupName] && presets.alloy[configGroupName].format) {
    return presets.alloy[configGroupName].format;
  }
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

  // Preserve the original extension for the output
  let outputExtension = format;
  let sharpFormat = format;

  if (!outputExtension) {
    outputExtension = path.extname(inputFile).slice(1).toLowerCase();
    sharpFormat = outputExtension;
  }

  // Only normalize for Sharp, not for the file name
  if (sharpFormat === 'jpg') {
    sharpFormat = 'jpeg';
  }

  // If format is 'all', process for all supported formats
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

  // Handle crop first (if specified)
  if (args.crop) {
    // Ensure crop is a string (minimist might parse it as array)
    const cropString = Array.isArray(args.crop) ? args.crop.join(',') : String(args.crop);
    const [left, top, cropWidth, cropHeight] = cropString.split(',').map(Number);
    if (left >= 0 && top >= 0 && cropWidth > 0 && cropHeight > 0) {
      sharpInstance = sharpInstance.extract({ left, top, width: cropWidth, height: cropHeight });
    } else {
      console.log(chalk.yellow(`Warning: Invalid crop coordinates "${cropString}", skipping crop.`));
    }
  }

  // Handle resize with fit and position options
  if (width || height) {
    const resizeOptions = {
      width: width,
      height: height,
      withoutEnlargement: true,
      fit: sharp.fit[args.fit] || sharp.fit.contain,
      position: sharp.gravity[args.position] || sharp.gravity.center
    };

    sharpInstance = sharpInstance.resize(resizeOptions);
  }

  // Use sharpFormat for Sharp (may be 'jpeg')
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
    // For JPEG (including original JPG files)
    sharpInstance = sharpInstance.flatten({ background: backgroundColor }).jpeg({
      quality: quality,
    });
  }

  try {
    const { size: originalSize } = fs.statSync(inputFile);

    // Create unique temporary file name to avoid conflicts when processing multiple files to same format
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const tempOutputFile = path.join(os.tmpdir(), `${path.basename(outputFileBase)}_${uniqueId}.${outputExtension}`);
    await sharpInstance.toFile(tempOutputFile);

    const finalOutputFile = replaceOriginal
      ? `${outputFileBase}.${outputExtension}`
      : path.join(outputDir, `${path.basename(outputFileBase)}.${outputExtension}`);

    // Ensure the output directory exists
    if (!fs.existsSync(path.dirname(finalOutputFile))) {
      fs.mkdirSync(path.dirname(finalOutputFile), { recursive: true });
    }

    fs.renameSync(tempOutputFile, finalOutputFile);

    const { size: newSize } = fs.statSync(finalOutputFile);

    let savings = '0.00';
    if (originalSize > 0) {
      savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    }

    // For the log, use the original extension
    const displayFormat = outputExtension.toUpperCase();
    process.stdout.write(chalk.green(`Processed: ${chalk.yellow(path.basename(inputFile))} to ${chalk.yellow(displayFormat)} (${savings}%)                \r`));
    return { originalSize, newSize };
  } catch (err) {
    const displayFormat = outputExtension ? outputExtension.toUpperCase() : 'UNKNOWN';
    console.error(chalk.red(`Error processing ${chalk.yellow(path.basename(inputFile))} to ${chalk.yellow(displayFormat)}: ${err.message}`));
    return null;
  }
};

// Function to process images for alloy preset with multiple configurations
const processAlloyMultipleConfigurations = async (specificSubPreset = null) => {
  let totalNewSize = 0;
  let processedCount = 0;
  let totalOriginalSize = 0;
  const startTime = Date.now();
  const processedFilesInfo = [];
  const alloyPreset = presets.alloy;

  // Get all configuration groups (cards, thumbs, etc.)
  let configGroups = Object.keys(alloyPreset);

  // If a specific subpreset is requested, filter to only that one
  if (specificSubPreset) {
    if (alloyPreset[specificSubPreset]) {
      configGroups = [specificSubPreset];
      console.log(chalk.blue(`Processing only configuration: ${chalk.yellow(specificSubPreset)}`));
    } else {
      console.error(chalk.red(`Error: Configuration "${specificSubPreset}" not found in alloy preset.`));
      console.log(chalk.yellow(`Available configurations: ${Object.keys(alloyPreset).join(', ')}`));
      process.exit(1);
    }
  } else {
    console.log(chalk.blue(`Processing all alloy configurations: ${chalk.yellow(configGroups.join(', '))}`));
  }

  for (const configGroupName of configGroups) {
    const configGroup = alloyPreset[configGroupName];

    console.log(chalk.blue(`\nProcessing configuration: ${chalk.yellow(configGroupName)}`));

    // Process each platform within the configuration group
    for (const [subPresetName, subPresetConfig] of Object.entries(configGroup)) {
      const sourceFolder = subPresetConfig.source;

      if (!sourceFolder) {
        console.log(chalk.yellow(`Warning: No source folder defined for ${configGroupName}.${subPresetName}, skipping...`));
        continue;
      }

      if (!fs.existsSync(sourceFolder)) {
        console.log(chalk.yellow(`Warning: Source folder "${sourceFolder}" for ${configGroupName}.${subPresetName} does not exist, skipping...`));
        continue;
      }

      // Clear any previous progress line before showing platform message
      process.stdout.write('\r' + ' '.repeat(100) + '\r');
      console.log(chalk.blue(`  Processing ${subPresetName} from: ${chalk.yellow(sourceFolder)}`));

      const isDirectory = fs.lstatSync(sourceFolder).isDirectory();
      const inputDir = isDirectory ? sourceFolder : path.dirname(sourceFolder);
      const files = isDirectory ? fs.readdirSync(sourceFolder) : [path.basename(sourceFolder)];

      const tasks = files.flatMap(file => {
        const inputFile = path.join(inputDir, file);
        let fileExtension = path.extname(file).toLowerCase().slice(1);

        if (supportedFormats.includes(fileExtension) && fs.lstatSync(inputFile).isFile()) {
          const scales = ALLOY_SCALES[subPresetName];
          const outputSubfolder = subPresetConfig.output || '';
          const isIPhone = subPresetName === 'iphone';
          const effectiveQuality = getEffectiveQuality(subPresetName, subPresetConfig, configGroupName);
          const effectiveFormat = getEffectiveFormat(subPresetName, subPresetConfig, path.extname(inputFile), configGroupName);

          return processImageWithScaling(inputFile, scales, outputSubfolder, isIPhone, effectiveQuality, effectiveFormat).then(result => {
            if (result) {
              processedFilesInfo.push(...result.processedFiles.map(f => ({
                ...f,
                configGroup: configGroupName,
                platform: subPresetName
              })));
              totalOriginalSize += result.originalSize;
              totalNewSize += result.newSize;
              processedCount++;
            }
            return result;
          });
        }
        return [];
      });

      await Promise.all(tasks);

      // Clear the progress line after processing this platform
      process.stdout.write('\r' + ' '.repeat(100) + '\r');
    }
  }

  // Log processed files info
  if (debugMode) {
    console.log(chalk.blue(`Processed files:`));
    processedFilesInfo.forEach(fileInfo => {
      console.log(chalk.blue(` - ${fileInfo.path} (config: ${fileInfo.configGroup}, platform: ${fileInfo.platform}, scale: ${fileInfo.scaleName})`));
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

  process.stdout.write('\r' + ' '.repeat(100) + '\r');

  console.log(chalk.green(`
Processing complete! Summary:
  - Processed files: ${chalk.yellow(processedCount)}
  - Total original size: ${chalk.yellow((totalOriginalSize / 1024).toFixed(2) + ' KB')}
  - Total new size: ${chalk.yellow((totalNewSize / 1024).toFixed(2) + ' KB')}
  - Total savings: ${chalk.yellow(savings + '%')}
  - Duration: ${chalk.yellow(duration + ' seconds')}
`));
};

// Process images for alloy preset with multiple sources
const processAlloyMultipleSources = async () => {
  // Check if we have the new multiple configurations format
  const alloyPreset = presets.alloy;

  // Check if this is legacy format (direct android/iphone keys) or multi-config format
  const isLegacyFormat = alloyPreset.android && alloyPreset.iphone;

  if (!isLegacyFormat) {
    // This is the new multi-configuration format
    return await processAlloyMultipleConfigurations(args.alloySubPreset);
  }

  // Legacy format - original implementation
  let totalNewSize = 0;
  let processedCount = 0;
  let totalOriginalSize = 0;
  const startTime = Date.now();
  const processedFilesInfo = [];

  // Process each platform separately with its own source
  for (const [subPresetName, subPresetConfig] of Object.entries(alloyPreset)) {
    const sourceFolder = subPresetConfig.source;

    if (!sourceFolder) {
      console.log(chalk.yellow(`Warning: No source folder defined for ${subPresetName}, skipping...`));
      continue;
    }

    if (!fs.existsSync(sourceFolder)) {
      console.log(chalk.yellow(`Warning: Source folder "${sourceFolder}" for ${subPresetName} does not exist, skipping...`));
      continue;
    }

    // Clear any previous progress line before showing platform message
    process.stdout.write('\r' + ' '.repeat(100) + '\r');
    console.log(chalk.blue(`Processing ${subPresetName} from: ${chalk.yellow(sourceFolder)}`));

    const isDirectory = fs.lstatSync(sourceFolder).isDirectory();
    const inputDir = isDirectory ? sourceFolder : path.dirname(sourceFolder);
    const files = isDirectory ? fs.readdirSync(sourceFolder) : [path.basename(sourceFolder)];

    const tasks = files.flatMap(file => {
      const inputFile = path.join(inputDir, file);
      let fileExtension = path.extname(file).toLowerCase().slice(1);

      if (supportedFormats.includes(fileExtension) && fs.lstatSync(inputFile).isFile()) {
        const scales = ALLOY_SCALES[subPresetName];
        const outputSubfolder = args.output || subPresetConfig.output || '';
        const isIPhone = subPresetName === 'iphone';
        const effectiveQuality = getEffectiveQuality(subPresetName, subPresetConfig, null);
        const effectiveFormat = getEffectiveFormat(subPresetName, subPresetConfig, path.extname(inputFile), null);

        return processImageWithScaling(inputFile, scales, outputSubfolder, isIPhone, effectiveQuality, effectiveFormat).then(result => {
          if (result) {
            processedFilesInfo.push(...result.processedFiles);
            totalOriginalSize += result.originalSize;
            totalNewSize += result.newSize;
            processedCount++;
          }
          return result;
        });
      }
      return [];
    });

    await Promise.all(tasks);

    // Clear the progress line after processing this platform
    process.stdout.write('\r' + ' '.repeat(100) + '\r');
  }

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

  process.stdout.write('\r' + ' '.repeat(100) + '\r');

  console.log(chalk.green(`
Processing complete! Summary:
  - Processed files: ${chalk.yellow(processedCount)}
  - Total original size: ${chalk.yellow((totalOriginalSize / 1024).toFixed(2) + ' KB')}
  - Total new size: ${chalk.yellow((totalNewSize / 1024).toFixed(2) + ' KB')}
  - Total savings: ${chalk.yellow(savings + '%')}
  - Duration: ${chalk.yellow(duration + ' seconds')}
`));
};

// Process images
const processImages = async () => {
  // Special handling for alloy preset with multiple sources
  if (presetName === 'alloy' && args.useAlloyMultipleSources) {
    return await processAlloyMultipleSources();
  }

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
      if (presetName === 'alloy') {
        const alloyPreset = presets.alloy;
        return Object.entries(alloyPreset).map(([subPresetName, subPresetConfig]) => {
          const scales = ALLOY_SCALES[subPresetName];
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

  process.stdout.write('\r' + ' '.repeat(100) + '\r');

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
