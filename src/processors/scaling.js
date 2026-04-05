/**
 * Image scaling processor
 * Handles image scaling operations for Alloy presets
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { logger } = require('../utils/logger');
const { CONSTANTS } = require('../config/defaults');
const { normalizeOutputSubfolder } = require('../utils/validation');

/**
 * Process image with scaling for Alloy platforms
 * @param {string} inputFile - Input file path
 * @param {Object} scales - Scale factors object
 * @param {string} outputSubfolder - Output subfolder
 * @param {boolean} isIPhone - Whether this is for iPhone platform
 * @param {number} quality - Image quality
 * @param {string} outputFormat - Output format
 * @returns {Promise<Object>} Processing result
 */
async function processImageWithScaling(inputFile, scales, outputSubfolder, isIPhone, quality, outputFormat, outputBase) {
  // Normalize output subfolder to remove leading/trailing slashes
  const normalizedSubfolder = normalizeOutputSubfolder(outputSubfolder);

  const originalImage = sharp(inputFile);
  const metadata = await originalImage.metadata();
  const { size: originalSize } = fs.statSync(inputFile);

  let totalNewSize = 0;
  const processedFiles = [];

  // Set output base for Alloy: use provided outputBase, fallback to input file's directory
  const baseDir = outputBase || path.dirname(inputFile);
  const outputBaseDir = isIPhone
    ? path.join(baseDir, 'app', 'assets', 'iphone', 'images')
    : path.join(baseDir, 'app', 'assets', 'android', 'images');

  for (const [scaleName, scaleFactor] of Object.entries(scales)) {
    const result = await processScale(
      inputFile,
      metadata,
      scaleName,
      scaleFactor,
      outputBaseDir,
      normalizedSubfolder,
      isIPhone,
      quality,
      outputFormat
    );

    if (result) {
      totalNewSize += result.newSize;
      processedFiles.push(result.fileInfo);
      logger.progress(`Processed: ${result.fileInfo.path}`);
    }
  }

  return { originalSize, newSize: totalNewSize, processedFiles };
}

/**
 * Process a single scale variant
 * @param {string} inputFile - Input file path
 * @param {Object} metadata - Image metadata
 * @param {string} scaleName - Scale name (e.g., '2x', 'res-hdpi')
 * @param {number} scaleFactor - Scale factor
 * @param {string} outputBaseDir - Base output directory
 * @param {string} normalizedSubfolder - Normalized subfolder path
 * @param {boolean} isIPhone - Whether this is for iPhone
 * @param {number} quality - Image quality
 * @param {string} outputFormat - Output format
 * @returns {Promise<Object>} Processing result for this scale
 */
async function processScale(
  inputFile,
  metadata,
  scaleName,
  scaleFactor,
  outputBaseDir,
  normalizedSubfolder,
  isIPhone,
  quality,
  outputFormat
) {
  let outputDir;
  let outputFileName;
  let outputFilePath;

  if (isIPhone) {
    outputDir = normalizedSubfolder
      ? path.join(outputBaseDir, normalizedSubfolder)
      : outputBaseDir;

    // Ensure the directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const baseName = path.parse(inputFile).name;
    const ext = outputFormat ? `.${outputFormat}` : path.extname(inputFile);

    outputFileName = scaleName === '1x'
      ? `${baseName}${ext}`
      : `${baseName}@${scaleName}${ext}`;

    outputFilePath = path.join(outputDir, outputFileName);
  } else {
    // Android
    outputDir = normalizedSubfolder
      ? path.join(outputBaseDir, scaleName, normalizedSubfolder)
      : path.join(outputBaseDir, scaleName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const baseName = path.parse(inputFile).name;
    const ext = outputFormat ? `.${outputFormat}` : path.extname(inputFile);
    outputFileName = `${baseName}${ext}`;
    outputFilePath = path.join(outputDir, outputFileName);
  }

  // Calculate target dimensions
  const targetWidth = Math.round(metadata.width / 4 * scaleFactor);
  const targetHeight = Math.round(metadata.height / 4 * scaleFactor);

  // Use the specified output format
  const formatToUse = outputFormat || path.extname(inputFile).toLowerCase().slice(1);
  let sharpFormat = formatToUse;

  // Normalize format for Sharp (jpg -> jpeg)
  if (sharpFormat === 'jpg') {
    sharpFormat = 'jpeg';
  }

  // Create Sharp instance with resize
  let sharpInstance = sharp(inputFile).resize({
    width: targetWidth,
    height: targetHeight,
    fit: 'contain'
  });

  // Apply format-specific options
  sharpInstance = applyScalingFormatOptions(sharpInstance, sharpFormat, quality);

  try {
    // Process and save the image
    await sharpInstance
      .withMetadata({ density: CONSTANTS.DENSITY_DPI })
      .toFile(outputFilePath);

    const { size: newSize } = fs.statSync(outputFilePath);

    return {
      newSize,
      fileInfo: {
        path: outputFilePath,
        scaleName
      }
    };
  } catch (error) {
    logger.error(`Failed to process scale ${scaleName} for ${inputFile}: ${error.message}`);
    return null;
  }
}

/**
 * Apply format-specific options for scaling
 * @param {Object} sharpInstance - Sharp instance
 * @param {string} format - Output format
 * @param {number} quality - Image quality
 * @returns {Object} Modified Sharp instance
 */
function applyScalingFormatOptions(sharpInstance, format, quality) {
  switch (format) {
    case 'png':
      return sharpInstance.png({
        quality: quality,
        compressionLevel: 9
      });
    case 'webp':
      return sharpInstance.webp({
        quality: quality
      });
    case 'avif':
      return sharpInstance.avif({
        quality: quality
      });
    case 'tiff':
      return sharpInstance.tiff({
        quality: quality,
        compression: 'lzw'
      });
    case 'gif':
      return sharpInstance.gif();
    default:
      // JPEG
      return sharpInstance
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: quality });
  }
}

module.exports = {
  processImageWithScaling
};
