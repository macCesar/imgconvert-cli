/**
 * Image processing module
 * Handles general image conversion and manipulation
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');
const { logger } = require('../utils/logger');
const { naturalSort } = require('../utils/sorting');
const { getMergedPresets } = require('../config/loader');
const { applyConfigPrecedence } = require('../cli/parser');
const { SUPPORTED_FORMATS, CONSTANTS } = require('../config/defaults');
const { determineOutputDirectory, validateOutputDirectory } = require('../utils/validation');

/**
 * Parse hex color to RGBA object for Sharp
 * @param {string} hexColor - Hex color string (with or without #)
 * @returns {Object|null} RGBA object or null if invalid
 */
function parseHexToRgba(hexColor) {
  if (!hexColor) return null;

  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return null;

  return {
    r: parseInt(hex.substr(0, 2), 16),
    g: parseInt(hex.substr(2, 2), 16),
    b: parseInt(hex.substr(4, 2), 16),
    alpha: 1
  };
}

/**
 * Map user-friendly position names to Sharp gravity constants
 * @param {string} position - User-provided position string
 * @returns {number} Sharp gravity constant
 */
function mapPositionToGravity(position) {
  if (!position) return sharp.gravity.center;

  // Normalize position string
  const normalizedPosition = position.toLowerCase().trim();

  // Map user-friendly positions to Sharp gravity constants
  const positionMap = {
    // Single positions
    'center': sharp.gravity.center,
    'centre': sharp.gravity.centre,
    'top': sharp.gravity.north,
    'bottom': sharp.gravity.south,
    'left': sharp.gravity.west,
    'right': sharp.gravity.east,
    'north': sharp.gravity.north,
    'south': sharp.gravity.south,
    'east': sharp.gravity.east,
    'west': sharp.gravity.west,

    // Corner positions
    'top left': sharp.gravity.northwest,
    'top right': sharp.gravity.northeast,
    'bottom left': sharp.gravity.southwest,
    'bottom right': sharp.gravity.southeast,
    'left top': sharp.gravity.northwest,
    'right top': sharp.gravity.northeast,
    'left bottom': sharp.gravity.southwest,
    'right bottom': sharp.gravity.southeast,
    'northwest': sharp.gravity.northwest,
    'northeast': sharp.gravity.northeast,
    'southwest': sharp.gravity.southwest,
    'southeast': sharp.gravity.southeast
  };

  return positionMap[normalizedPosition] || sharp.gravity.center;
}

/**
 * Generate filename based on rename strategies
 * @param {string} originalName - Original filename without extension
 * @param {number} index - File index for enumeration
 * @param {Object} args - Command line arguments
 * @param {boolean} isSingleFile - Whether processing a single file
 * @returns {string} Generated filename without extension
 */
function generateFilename(originalName, index, args, isSingleFile = false) {
  // For single file with custom name (only works for single files)
  if (args.name && isSingleFile) {
    return args.name;
  }

  let filename = originalName;

  if (args.rename) {
    const strategies = args.rename.split(',').map(s => s.trim());

    // Apply strategies in visual order (left to right in final filename)
    let parts = { prefix: '', core: filename, suffix: '' };

    for (const strategy of strategies) {
      if (strategy === 'enumerate') {
        // Add enumerated prefix with padding (001-, 002-, etc.)
        const paddedIndex = String(index).padStart(3, '0');
        parts.prefix = parts.prefix + paddedIndex + '-';
      } else if (strategy === 'lowercase') {
        parts.core = parts.core.toLowerCase();
      } else if (strategy === 'replace-spaces') {
        parts.core = parts.core.replace(/\s+/g, '-');
      } else if (strategy.startsWith('prefix:')) {
        const prefix = strategy.substring(7);
        parts.prefix = parts.prefix + prefix;
      } else if (strategy.startsWith('suffix:')) {
        const suffix = strategy.substring(7);
        parts.suffix = parts.suffix + suffix;
      }
    }

    filename = parts.prefix + parts.core + parts.suffix;
  }

  return filename;
}

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
      fit: sharp.fit[options.fit] || sharp.fit.contain,
      position: mapPositionToGravity(options.position)
    };

    // If --canvas option is used, force dimensions that will require padding
    if (options.canvas) {
      resizeOptions.fit = sharp.fit.contain; // Force contain for canvas resize
      // In canvas mode, respect user's position preference (top, center, bottom, etc.)
      // This allows positioning the image within the expanded canvas

      // For canvas mode, we need to force exact dimensions to ensure padding
      // The trick is to specify both width and height, even if user only gave one
      if (options.height && !options.width) {
        // User specified height only - use original width to force padding
        const metadata = await sharpInstance.metadata();
        resizeOptions.width = metadata.width;
      } else if (options.width && !options.height) {
        // User specified width only - use original height to force padding
        const metadata = await sharpInstance.metadata();
        resizeOptions.height = metadata.height;
      }

      // Apply background for canvas mode
      if (options.background) {
        // User specified background - use it
        const rgba = parseHexToRgba(options.background);
        if (rgba) {
          resizeOptions.background = rgba;
        }
      } else {
        // No background specified - use format-appropriate defaults for canvas mode
        if (sharpFormat === 'png' || sharpFormat === 'webp' || sharpFormat === 'avif') {
          resizeOptions.background = { r: 0, g: 0, b: 0, alpha: 0 }; // Transparent
        } else {
          // For JPEG and other formats that don't support transparency, use white
          resizeOptions.background = { r: 255, g: 255, b: 255, alpha: 1 };
        }
      }
    } else {
      // Normal resize mode (not canvas) - apply smart background defaults
      if (options.background) {
        const rgba = parseHexToRgba(options.background);
        if (rgba) {
          resizeOptions.background = rgba;
        }
      } else {
        // For non-canvas mode with contain/cover, apply transparent background for formats that support it
        if ((resizeOptions.fit === sharp.fit.contain || resizeOptions.fit === sharp.fit.cover) &&
          (sharpFormat === 'png' || sharpFormat === 'webp' || sharpFormat === 'avif')) {
          resizeOptions.background = { r: 0, g: 0, b: 0, alpha: 0 }; // Transparent
        }
      }
    }

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

  switch (format) {
    case 'png':
      return sharpInstance.png({
        palette: false, // Disable palette to preserve transparency
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
      // JPEG - always apply background (JPEG doesn't support transparency)
      return sharpInstance
        .flatten({ background: options.background || '#ffffff' })
        .jpeg({ quality: quality });
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
  const files = isDirectory ? fs.readdirSync(inputPath).sort(naturalSort) : [path.basename(inputPath)];

  // Validate incompatible options
  if (args.name && isDirectory) {
    logger.error('Error: --name option can only be used with single files, not directories. Use --rename for batch processing.');
    return;
  }

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
    canvas: args.canvas,
    replaceOriginal: args['replace-originals'],
    outputDir: outputDir,
    _userArgs: args._userArgs // Pass user args to check explicit background
  };

  const format = args.format && args.format !== 'none' ? args.format : null;

  // Prepare file list for enumeration if needed
  const imageFiles = files.filter(file => {
    const inputFile = path.join(inputDir, file);
    const fileExtension = path.extname(file).toLowerCase().slice(1);
    return SUPPORTED_FORMATS.includes(fileExtension) && fs.lstatSync(inputFile).isFile();
  });

  // Process each file
  const tasks = imageFiles.map(async (file, index) => {
    const inputFile = path.join(inputDir, file);
    const originalName = path.parse(file).name;

    // Generate output filename based on rename strategies
    const outputFilename = generateFilename(originalName, index + 1, args, !isDirectory);
    const outputFileBase = path.join(outputDir, outputFilename);

    const result = await processImage(inputFile, outputFileBase, format, options);

    if (result) {
      totalOriginalSize += result.originalSize;
      totalNewSize += result.newSize;
      processedCount++;
    }
    return result;
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
