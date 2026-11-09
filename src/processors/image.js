const { parseHexToRgba, normalizePositionName } = require('../config/values');
/**
 * Image processing module
 * Handles general image conversion and manipulation
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { logger } = require('../utils/logger');
const { discover, planOperations, atomicWrite, mapLimit, operationResult } = require('../utils/operations');
const { SUPPORTED_FORMATS } = require('../config/defaults');
const { CONSTANTS } = require('../config/defaults');
const { determineOutputDirectory } = require('../utils/validation');

/**
 * Parse color string to RGBA object for Sharp
 * Supports: #RGB, #RGBA, #RRGGBB, #RRGGBBAA, rgb(), rgba(), color names
 * @param {string} colorString - Color string
 * @returns {Object|null} RGBA object or null if invalid
 */
/**
 * Map user-friendly position names to Sharp gravity constants
 * @param {string} position - User-provided position string
 * @returns {number} Sharp gravity constant
 */
function mapPositionToGravity(position) {
  if (!position) return sharp.gravity.center;

  // Normalize position string
  const normalizedPosition = normalizePositionName(position);

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
  let sharpInstance = sharp(options.inputBuffer || inputFile);

  logger.debug(`Processing: ${path.basename(inputFile)}`);

  // Handle trim first (if specified) - removes transparent borders
  if (options.trim) {
    sharpInstance = sharp(await sharpInstance.trim().png().toBuffer());
    logger.debug(`Trimmed transparent borders`);
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

  // Handle crop first (if specified)
  if (options.crop) {
    const cropString = Array.isArray(options.crop) ? options.crop.join(',') : String(options.crop);
    const [left, top, cropWidth, cropHeight] = cropString.split(',').map(Number);
    if (left >= 0 && top >= 0 && cropWidth > 0 && cropHeight > 0) {
      sharpInstance = sharp(await sharpInstance.extract({ left, top, width: cropWidth, height: cropHeight }).png().toBuffer());
    } else {
      logger.warning(`Warning: Invalid crop coordinates "${cropString}", skipping crop.`);
    }
  }

  // Handle canvas mode (extend or shrink canvas without resizing image)
  if (options.canvas && (options.width || options.height)) {
    const metadata = await sharpInstance.metadata();
    const currentWidth = metadata.width;
    const currentHeight = metadata.height;

    const targetWidth = options.width || currentWidth;
    const targetHeight = options.height || currentHeight;

    const positionMap = {
      'center': { horizontal: 'center', vertical: 'center' },
      'top': { horizontal: 'center', vertical: 'top' },
      'bottom': { horizontal: 'center', vertical: 'bottom' },
      'left': { horizontal: 'left', vertical: 'center' },
      'right': { horizontal: 'right', vertical: 'center' },
      'top left': { horizontal: 'left', vertical: 'top' },
      'top right': { horizontal: 'right', vertical: 'top' },
      'bottom left': { horizontal: 'left', vertical: 'bottom' },
      'bottom right': { horizontal: 'right', vertical: 'bottom' }
    };

    const normalizedPosition = normalizePositionName(options.position || 'center');
    let positionConfig = positionMap[normalizedPosition];

    if (!positionConfig) {
      logger.warning(`Invalid position '${normalizedPosition}', defaulting to 'center'`);
      positionConfig = positionMap['center'];
    }

    if (targetWidth !== currentWidth || targetHeight !== currentHeight) {
      // Step 1: crop dimensions that shrink (extract)
      if (currentWidth > targetWidth || currentHeight > targetHeight) {
        const cropWidth = Math.min(currentWidth, targetWidth);
        const cropHeight = Math.min(currentHeight, targetHeight);
        let left = 0;
        let top = 0;

        if (currentWidth > targetWidth) {
          const diff = currentWidth - targetWidth;
          switch (positionConfig.horizontal) {
            case 'left':
              left = 0;
              break;
            case 'right':
              left = diff;
              break;
            case 'center':
            default:
              left = Math.floor(diff / 2);
              break;
          }
        }

        if (currentHeight > targetHeight) {
          const diff = currentHeight - targetHeight;
          switch (positionConfig.vertical) {
            case 'top':
              top = 0;
              break;
            case 'bottom':
              top = diff;
              break;
            case 'center':
            default:
              top = Math.floor(diff / 2);
              break;
          }
        }

        sharpInstance = sharp(await sharpInstance.extract({ left, top, width: cropWidth, height: cropHeight }).png().toBuffer());
      }

      // Step 2: pad dimensions that grow (extend)
      if (targetWidth > currentWidth || targetHeight > currentHeight) {
        const extendOptions = { top: 0, bottom: 0, left: 0, right: 0 };

        if (targetWidth > currentWidth) {
          const diff = targetWidth - currentWidth;
          switch (positionConfig.horizontal) {
            case 'left':
              extendOptions.right = diff;
              break;
            case 'right':
              extendOptions.left = diff;
              break;
            case 'center':
            default:
              extendOptions.left = Math.floor(diff / 2);
              extendOptions.right = diff - extendOptions.left;
              break;
          }
        }

        if (targetHeight > currentHeight) {
          const diff = targetHeight - currentHeight;
          switch (positionConfig.vertical) {
            case 'top':
              extendOptions.bottom = diff;
              break;
            case 'bottom':
              extendOptions.top = diff;
              break;
            case 'center':
            default:
              extendOptions.top = Math.floor(diff / 2);
              extendOptions.bottom = diff - extendOptions.top;
              break;
          }
        }

        if (options.background) {
          const rgba = parseHexToRgba(options.background);
          if (rgba) {
            extendOptions.background = rgba;
          } else {
            logger.warning(`Invalid background color '${options.background}', using default`);
          }
        }

        if (!extendOptions.background) {
          const transparentFormats = ['png', 'webp', 'avif', 'tiff'];
          if (transparentFormats.includes(sharpFormat)) {
            extendOptions.background = { r: 0, g: 0, b: 0, alpha: 0 };
          } else {
            extendOptions.background = { r: 255, g: 255, b: 255, alpha: 1 };
          }
        }

        sharpInstance = sharpInstance.extend(extendOptions);
      }

      logger.debug(`Canvas: ${currentWidth}x${currentHeight} → ${targetWidth}x${targetHeight}`);
    }
  }
  // Handle normal resize with fit and position options
  else if (options.width || options.height) {
    // Validate fit option
    const validFits = ['contain', 'cover', 'fill', 'inside', 'outside'];
    let selectedFit = options.fit || 'contain';

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
    logger.debug(`Resize: ${options.width || 'auto'}x${options.height || 'auto'} (${selectedFit})`);
  }

  // Apply format-specific options
  sharpInstance = applyFormatOptions(sharpInstance, sharpFormat, options);

  const { size: originalSize } = fs.statSync(inputFile);
  const finalOutputFile = `${outputFileBase}.${outputExtension}`;
  await atomicWrite(finalOutputFile, temp => sharpInstance.toFile(temp), options.overwrite);
  const { size: newSize } = fs.statSync(finalOutputFile);
  logger.progress(`Processed: ${path.basename(inputFile)} to ${outputExtension.toUpperCase()}`);
  return { originalSize, newSize, destination: finalOutputFile };

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
  const inputPath = path.resolve(args._[0] || args.presetSource || config.source);
  const imageFiles = discover(inputPath);
  const single = !fs.statSync(inputPath).isDirectory();
  const outputDir = args.inPlace ? path.dirname(inputPath) : determineOutputDirectory(args, {}, inputPath);
  const tasks = imageFiles.map((source, i) => {
    const base = generateFilename(path.parse(source).name, i + 1, args, single);
    const formats = args.format === 'all' ? SUPPORTED_FORMATS : [args.format || path.extname(source).slice(1).toLowerCase()];
    return { source, variants: formats.map(format => ({source, format, destination: path.join(args.inPlace ? path.dirname(source) : outputDir, `${base}.${format}`), inPlace: args.inPlace})) };
  });
  planOperations(tasks.flatMap(t => t.variants), args);
  const destinations = [], errors = [];
  let processedCount = 0, failedCount = 0, totalOriginalSize = 0, totalNewSize = 0;
  await mapLimit(tasks, args.concurrency, async task => {
    let failed = false;
    const originalSize = fs.statSync(task.source).size;
    const inputBuffer = task.variants.some(op => op.destination === task.source) ? fs.readFileSync(task.source) : null;
    for (const op of task.variants) {
      try {
        const result = await processImage(op.source, op.destination.slice(0, -op.format.length - 1), op.format, { ...args, inputBuffer, overwrite: op.overwrite });
        destinations.push(op.destination);
        totalNewSize += result.newSize;
      } catch (error) {
        failed = true; errors.push({source: op.source, destination: op.destination, message: error.message});
        logger.error(`${op.source}: ${error.message}`);
        if (args.debug) console.error(error.stack);
      }
    }
    if (failed) failedCount++; else processedCount++;
    totalOriginalSize += originalSize;
  });
  logger.clearProgress();
  logger.summary({ processedCount, totalOriginalSize, totalNewSize, duration: ((Date.now()-startTime)/1000).toFixed(2) });
  logger.info(`Failed inputs: ${failedCount}; Generated outputs: ${destinations.length}`);
  return operationResult(processedCount, failedCount, destinations, errors);
}

module.exports = {
  processImage,
  processImages
};
