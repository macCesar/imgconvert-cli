/**
 * Input validation module
 * Validates user input and configuration
 */

const fs = require('fs');
const path = require('path');
const { SUPPORTED_FORMATS } = require('../config/defaults');
const { logger } = require('./logger');

/**
 * Validate input arguments and configuration
 * @param {Object} args - Parsed arguments
 * @param {Object} config - Configuration object
 * @returns {Object} Validation result
 */
function validateInput(args, config) {
  // Set debug mode for logger
  logger.setDebugMode(args.debug);

  // Check for input path
  let inputPath = args._[0];

  if (!inputPath) {
    // Try to use source from preset or config
    if (args.presetSource) {
      inputPath = args.presetSource;
      logger.info(`Using source folder from preset or global config: ${inputPath}`);
    } else if (args.presetName === 'alloy') {
      // Special case for alloy preset
      args.useAlloyMultipleSources = true;
      args.alloySubPreset = args.subPreset;
      return { valid: true, inputPath: null };
    } else if (config.source) {
      inputPath = config.source;
      logger.info(`Using global source folder from config: ${inputPath}`);
    } else {
      return {
        valid: false,
        error: 'Error: Please provide a source file or folder.'
      };
    }
  }

  // Validate path exists
  if (inputPath && !fs.existsSync(inputPath)) {
    return {
      valid: false,
      error: `Error: The specified path "${inputPath}" does not exist.`
    };
  }

  // Validate format if specified
  if (args.format && args.format !== 'all' && !SUPPORTED_FORMATS.includes(args.format)) {
    return {
      valid: false,
      error: `Error: Unsupported format "${args.format}". Supported formats: ${SUPPORTED_FORMATS.join(', ')}`
    };
  }

  // Validate crop coordinates if specified
  if (args.crop) {
    // Handle case where crop might be an array (if passed multiple times)
    const cropValue = Array.isArray(args.crop) ? args.crop[args.crop.length - 1] : args.crop;
    const cropString = String(cropValue);
    const coords = cropString.split(',').map(Number);

    if (coords.length !== 4 || coords.some(isNaN) || coords[2] <= 0 || coords[3] <= 0) {
      return {
        valid: false,
        error: 'Error: Invalid crop coordinates. Format should be: left,top,width,height'
      };
    }
    // Normalize to single value
    args.crop = cropString;
  }

  // Validate fit strategy
  const validFitStrategies = ['cover', 'contain', 'fill', 'inside', 'outside'];
  if (args.fit) {
    // Handle case where fit might be an array (if passed multiple times)
    const fitValue = Array.isArray(args.fit) ? args.fit[args.fit.length - 1] : args.fit;
    if (!validFitStrategies.includes(fitValue)) {
      return {
        valid: false,
        error: `Error: Invalid fit strategy "${fitValue}". Valid options: ${validFitStrategies.join(', ')}`
      };
    }
    // Normalize to single value
    args.fit = fitValue;
  }

  // Validate --name option only works with single files
  if (args.name && inputPath && fs.lstatSync(inputPath).isDirectory()) {
    return {
      valid: false,
      error: 'Error: The --name option can only be used with single files, not directories. Use --rename for batch renaming.'
    };
  }

  // Warning for alloy preset with width/height
  if (args.presetName === 'alloy' && (args.width || args.height)) {
    logger.warning('Warning: Width and height parameters are ignored when using the alloy preset. Images are scaled based on predefined factors.');
  }

  return { valid: true, inputPath };
}

/**
 * Validate output directory
 * @param {string} outputDir - Output directory path
 * @param {boolean} shouldCreate - Whether to create if doesn't exist
 * @returns {boolean} Whether directory is valid
 */
function validateOutputDirectory(outputDir, shouldCreate = true) {
  if (!outputDir) return false;

  try {
    if (!fs.existsSync(outputDir) && shouldCreate) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    return true;
  } catch (error) {
    logger.error(`Failed to create output directory: ${error.message}`);
    return false;
  }
}

/**
 * Determine output directory
 * @param {Object} args - Arguments object
 * @param {Object} config - Configuration object
 * @param {string} inputPath - Input file/directory path
 * @returns {string} Output directory path
 */
function determineOutputDirectory(args, config, inputPath) {
  if (args.output) {
    return args.output;
  } else if (config.output) {
    return config.output;
  } else if (inputPath) {
    const isDirectory = fs.lstatSync(inputPath).isDirectory();
    const baseDir = isDirectory ? path.dirname(inputPath) : path.dirname(inputPath);
    const outputName = isDirectory ? `${path.basename(inputPath)}-converted` : 'converted';
    return path.join(baseDir, outputName);
  }
  return null;
}

/**
 * Normalize output subfolder path
 * @param {string} subfolder - Subfolder path
 * @returns {string} Normalized path
 */
function normalizeOutputSubfolder(subfolder) {
  if (!subfolder) return '';
  return subfolder.replace(/^\/+|\/+$/g, '');
}

module.exports = {
  validateInput,
  validateOutputDirectory,
  determineOutputDirectory,
  normalizeOutputSubfolder
};
