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

  // Handle trim first (if specified) - removes transparent borders
  if (options.trim) {
    sharpInstance = sharpInstance.trim();
  }

  // Preserve the original extension for the output
  let sharpFormat = format;
  let outputExtension = format;

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

  // Handle canvas mode (extend canvas without resizing image)
  if (options.canvas && (options.width || options.height)) {
    const metadata = await sharpInstance.metadata();
    const currentWidth = metadata.width;
    const currentHeight = metadata.height;

    // Determine target dimensions
    const targetWidth = options.width || currentWidth;
    const targetHeight = options.height || currentHeight;

    // Define valid positions and their mappings
    const positionMap = {
      'center': { horizontal: 'center', vertical: 'center' },
      'top': { horizontal: 'center', vertical: 'top' },
      'bottom': { horizontal: 'center', vertical: 'bottom' },
      'left': { horizontal: 'left', vertical: 'center' },
      'right': { horizontal: 'right', vertical: 'center' },
      'top-left': { horizontal: 'left', vertical: 'top' },
      'top-right': { horizontal: 'right', vertical: 'top' },
      'bottom-left': { horizontal: 'left', vertical: 'bottom' },
      'bottom-right': { horizontal: 'right', vertical: 'bottom' }
    };

    // Validate and normalize position
    const normalizedPosition = options.position || 'center';
    const positionConfig = positionMap[normalizedPosition];

    if (!positionConfig) {
      logger.warning(`Invalid position '${normalizedPosition}', defaulting to 'center'`);
      positionConfig = positionMap['center'];
    }

    // Check if we need to extend or warn about reduction
    const needsHorizontalExtension = targetWidth > currentWidth;
    const needsVerticalExtension = targetHeight > currentHeight;
    const needsReduction = targetWidth < currentWidth || targetHeight < currentHeight;

    if (needsReduction) {
      logger.warning(`Canvas dimensions (${targetWidth}x${targetHeight}) are smaller than image (${currentWidth}x${currentHeight}). Image will be cropped.`);
    }

    // Only process if at least one dimension needs extension
    if (needsHorizontalExtension || needsVerticalExtension || needsReduction) {
      let extendOptions = { top: 0, bottom: 0, left: 0, right: 0 };

      // Calculate horizontal padding/cropping
      const horizontalDiff = targetWidth - currentWidth;
      if (horizontalDiff !== 0) {
        if (horizontalDiff > 0) {
          // Extension needed
          switch (positionConfig.horizontal) {
            case 'left':
              extendOptions.right = horizontalDiff;
              break;
            case 'right':
              extendOptions.left = horizontalDiff;
              break;
            case 'center':
            default:
              extendOptions.left = Math.floor(horizontalDiff / 2);
              extendOptions.right = horizontalDiff - extendOptions.left;
              break;
          }
        } else {
          // Reduction needed (negative values will crop)
          const cropAmount = Math.abs(horizontalDiff);
          switch (positionConfig.horizontal) {
            case 'left':
              extendOptions.right = -cropAmount;
              break;
            case 'right':
              extendOptions.left = -cropAmount;
              break;
            case 'center':
            default:
              const leftCrop = Math.floor(cropAmount / 2);
              extendOptions.left = -leftCrop;
              extendOptions.right = -(cropAmount - leftCrop);
              break;
          }
        }
      }

      // Calculate vertical padding/cropping
      const verticalDiff = targetHeight - currentHeight;
      if (verticalDiff !== 0) {
        if (verticalDiff > 0) {
          // Extension needed
          switch (positionConfig.vertical) {
            case 'top':
              extendOptions.bottom = verticalDiff;
              break;
            case 'bottom':
              extendOptions.top = verticalDiff;
              break;
            case 'center':
            default:
              extendOptions.top = Math.floor(verticalDiff / 2);
              extendOptions.bottom = verticalDiff - extendOptions.top;
              break;
          }
        } else {
          // Reduction needed (negative values will crop)
          const cropAmount = Math.abs(verticalDiff);
          switch (positionConfig.vertical) {
            case 'top':
              extendOptions.bottom = -cropAmount;
              break;
            case 'bottom':
              extendOptions.top = -cropAmount;
              break;
            case 'center':
            default:
              const topCrop = Math.floor(cropAmount / 2);
              extendOptions.top = -topCrop;
              extendOptions.bottom = -(cropAmount - topCrop);
              break;
          }
        }
      }

      // Set background color
      if (options.background) {
        // parseHexToRgba should handle: #RGB, #RGBA, #RRGGBB, #RRGGBBAA, rgb(), rgba(), color names
        const rgba = parseHexToRgba(options.background);
        if (rgba) {
          extendOptions.background = rgba;
        } else {
          logger.warning(`Invalid background color '${options.background}', using default`);
          // Fall through to format-based defaults
        }
      }

      // Use format-appropriate defaults if no valid background specified
      if (!extendOptions.background) {
        const transparentFormats = ['png', 'webp', 'avif', 'tiff'];
        if (transparentFormats.includes(sharpFormat)) {
          extendOptions.background = { r: 0, g: 0, b: 0, alpha: 0 }; // Transparent
        } else {
          extendOptions.background = { r: 255, g: 255, b: 255, alpha: 1 }; // White
        }
      }

      // Apply the extension/cropping
      sharpInstance = sharpInstance.extend(extendOptions);
    }
  }
  // Handle normal resize with fit and position options
  else if (options.width || options.height) {
    // Validate fit option
    const validFits = ['contain', 'cover', 'fill', 'inside', 'outside'];
    const selectedFit = options.fit || 'contain';

    if (!validFits.includes(selectedFit)) {
      logger.warning(`Invalid fit option '${selectedFit}', defaulting to 'contain'`);
      selectedFit = 'contain';
    }

    const resizeOptions = {
      width: options.width,
      height: options.height,
      fit: sharp.fit[selectedFit],
      withoutEnlargement: options.withoutEnlargement || false
    };

    // Only add position for fits that use it (contain and cover)
    if (selectedFit === 'contain' || selectedFit === 'cover') {
      resizeOptions.position = mapPositionToGravity(options.position);
    }

    // Apply background
    if (options.background) {
      const rgba = parseHexToRgba(options.background);
      if (rgba) {
        resizeOptions.background = rgba;
      } else {
        logger.warning(`Invalid background color '${options.background}', using default`);
      }
    }

    // For contain fit, apply transparent background for formats that support it
    // Note: 'cover' and 'fill' don't leave empty spaces, so background doesn't matter
    // 'inside' and 'outside' also don't use background
    if (!resizeOptions.background && selectedFit === 'contain') {
      const transparentFormats = ['png', 'webp', 'avif', 'tiff'];
      if (transparentFormats.includes(sharpFormat)) {
        resizeOptions.background = { r: 0, g: 0, b: 0, alpha: 0 }; // Transparent
      } else {
        resizeOptions.background = { r: 255, g: 255, b: 255, alpha: 1 }; // White for JPEG, etc.
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

  let totalNewSize = 0;
  let processedCount = 0;
  let totalOriginalSize = 0;

  // Process options
  const options = {
    fit: args.fit,
    crop: args.crop,
    trim: args.trim,
    width: args.width,
    height: args.height,
    canvas: args.canvas,
    outputDir: outputDir,
    quality: args.quality,
    position: args.position,
    _userArgs: args._userArgs, // Pass user args to check explicit background
    background: args.background,
    replaceOriginal: args['replace-originals']
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
    duration,
    totalNewSize,
    processedCount,
    totalOriginalSize
  });
}

// Helper function to map position strings to Sharp gravity constants
function mapPositionToGravity(position) {
  // Sharp uses different terminology for positions
  const positionMap = {
    'center': sharp.gravity.center,
    'centre': sharp.gravity.centre,
    'north': sharp.gravity.north,
    'south': sharp.gravity.south,
    'east': sharp.gravity.east,
    'west': sharp.gravity.west,
    'northeast': sharp.gravity.northeast,
    'northwest': sharp.gravity.northwest,
    'southeast': sharp.gravity.southeast,
    'southwest': sharp.gravity.southwest,
    // Map common position names to Sharp equivalents
    'top': sharp.gravity.north,
    'bottom': sharp.gravity.south,
    'left': sharp.gravity.west,
    'right': sharp.gravity.east,
    'top-left': sharp.gravity.northwest,
    'top-right': sharp.gravity.northeast,
    'bottom-left': sharp.gravity.southwest,
    'bottom-right': sharp.gravity.southeast
  };

  const normalizedPosition = (position || 'center').toLowerCase();

  if (!positionMap[normalizedPosition]) {
    logger.warning(`Invalid position '${position}' for resize, defaulting to 'center'`);
    return sharp.gravity.center;
  }

  return positionMap[normalizedPosition];
}

module.exports = {
  processImage,
  processImages
};
