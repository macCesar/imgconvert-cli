/**
 * Image processing module
 * Handles general image conversion and manipulation
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');
const { logger } = require('../utils/logger');
const { SUPPORTED_FORMATS, CONSTANTS } = require('../config/defaults');
const { applyConfigPrecedence } = require('../cli/parser');
const { getMergedPresets } = require('../config/loader');
const { determineOutputDirectory, validateOutputDirectory } = require('../utils/validation');

/**
 * Process a single image file
 * @param {string} inputFile - Input file path
 * @param {string} outputFileBase - Output file base path
 * @param {string} format - Output format
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing result
 */
async function processImage(inputFile, outputFileBase, format, options) {
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
    for (const fmt of SUPPORTED_FORMATS) {
      const result = await processImage(inputFile, outputFileBase, fmt, options);
      if (result) results.push(result);
    }
    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalNew = results.reduce((sum, r) => sum + r.newSize, 0);
    return { originalSize: totalOriginal / results.length, newSize: totalNew };
  }

  // Handle crop first (if specified)
  if (options.crop) {
    const cropString = Array.isArray(options.crop) ? options.crop.join(',') : String(options.crop);
    const [left, top, cropWidth, cropHeight] = cropString.split(',').map(Number);
    if (left >= 0 && top >= 0 && cropWidth > 0 && cropHeight > 0) {
      sharpInstance = sharpInstance.extract({ left, top, width: cropWidth, height: cropHeight });
    } else {
      logger.warning(`Warning: Invalid crop coordinates "${cropString}", skipping crop.`);
    }
  }

  // Handle resize with fit and position options
  if (options.width || options.height) {
    const resizeOptions = {
      width: options.width,
      height: options.height,
      withoutEnlargement: true,
      fit: sharp.fit[options.fit] || sharp.fit.contain,
      position: sharp.gravity[options.position] || sharp.gravity.center
    };

    sharpInstance = sharpInstance.resize(resizeOptions);
  }

  // Apply format-specific options
  sharpInstance = applyFormatOptions(sharpInstance, sharpFormat, options);

  try {
    const { size: originalSize } = fs.statSync(inputFile);

    // Create unique temporary file name
    const uniqueId = Math.random().toString(36).substring(2, CONSTANTS.TEMP_FILE_LENGTH);
    const tempOutputFile = path.join(os.tmpdir(), `${path.basename(outputFileBase)}_${uniqueId}.${outputExtension}`);
    await sharpInstance.toFile(tempOutputFile);

    const finalOutputFile = options.replaceOriginal
      ? `${outputFileBase}.${outputExtension}`
      : path.join(options.outputDir, `${path.basename(outputFileBase)}.${outputExtension}`);

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
    logger.progress(`Processed: ${path.basename(inputFile)} to ${displayFormat} (${savings}%)`);
    return { originalSize, newSize };
  } catch (err) {
    const displayFormat = outputExtension ? outputExtension.toUpperCase() : 'UNKNOWN';
    logger.error(`Error processing ${path.basename(inputFile)} to ${displayFormat}: ${err.message}`);
    return null;
  }
}

/**
 * Apply format-specific options to Sharp instance
 * @param {Object} sharpInstance - Sharp instance
 * @param {string} format - Output format
 * @param {Object} options - Processing options
 * @returns {Object} Modified Sharp instance
 */
function applyFormatOptions(sharpInstance, format, options) {
  const quality = options.quality || CONSTANTS.DEFAULT_QUALITY;
  const backgroundColor = options.background || '#ffffff';

  switch (format) {
    case 'png':
      return sharpInstance.png({
        palette: true,
        quality: quality,
        compressionLevel: 9,
      });
    case 'webp':
      return sharpInstance.webp({
        quality: quality,
      });
    case 'avif':
      return sharpInstance.avif({
        quality: quality,
      });
    case 'tiff':
      return sharpInstance.tiff({
        quality: quality,
        compression: 'lzw',
      });
    case 'gif':
      return sharpInstance.gif();
    default:
      // For JPEG (including original JPG files)
      return sharpInstance.flatten({ background: backgroundColor }).jpeg({
        quality: quality,
      });
  }
}

/**
 * Process multiple images
 * @param {Object} args - Command line arguments
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
async function processImages(args, config) {
  const startTime = Date.now();

  // Apply configuration precedence
  const presets = getMergedPresets(config);
  args = applyConfigPrecedence(args, config, presets);

  const inputPath = args._[0] || args.presetSource || config.source;
  if (!inputPath) {
    logger.error('No input path specified');
    return;
  }

  const isDirectory = fs.lstatSync(inputPath).isDirectory();
  const inputDir = isDirectory ? inputPath : path.dirname(inputPath);
  const files = isDirectory ? fs.readdirSync(inputPath) : [path.basename(inputPath)];

  // Determine output directory
  const outputDir = determineOutputDirectory(args, config, inputPath);
  if (!validateOutputDirectory(outputDir)) {
    logger.error('Failed to create output directory');
    return;
  }

  let processedCount = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;

  // Process options
  const options = {
    quality: args.quality,
    width: args.width,
    height: args.height,
    crop: args.crop,
    fit: args.fit,
    position: args.position,
    background: args.background,
    replaceOriginal: args['replace-originals'],
    outputDir: outputDir
  };

  const format = args.format && args.format !== 'none' ? args.format : null;

  // Process each file
  const tasks = files.map(async (file) => {
    const inputFile = path.join(inputDir, file);
    const fileExtension = path.extname(file).toLowerCase().slice(1);

    if (SUPPORTED_FORMATS.includes(fileExtension) && fs.lstatSync(inputFile).isFile()) {
      const outputFileBase = path.join(outputDir, path.parse(inputFile).name);
      const result = await processImage(inputFile, outputFileBase, format, options);

      if (result) {
        totalOriginalSize += result.originalSize;
        totalNewSize += result.newSize;
        processedCount++;
      }
      return result;
    }
    return null;
  });

  await Promise.all(tasks);

  // Clear progress and show summary
  logger.clearProgress();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  logger.summary({
    processedCount,
    totalOriginalSize,
    totalNewSize,
    duration
  });
}

module.exports = {
  processImage,
  processImages
};
