/**
 * Alloy preset processor — LEGACY path (v1.x behavior).
 *
 * Multi-scale 1x/2x/3x (iPhone) + mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi (Android).
 * Preserved unchanged for backward compatibility — used when neither --modern
 * nor any of the modern sub-flags are present.
 *
 * The router in ./alloy.js decides between this and ./alloy-modern/.
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const { naturalSort } = require('../utils/sorting');
const { getMergedPresets } = require('../config/loader');
const { processImageWithScaling } = require('./scaling');
const { applyConfigPrecedence } = require('../config/precedence');
const { ALLOY_SCALES, SUPPORTED_FORMATS } = require('../config/defaults');

/**
 * Process images using Alloy preset (legacy multi-scale path).
 * @param {Object} args - Command line arguments
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
async function processAlloyLegacy(args, config) {
  const presets = getMergedPresets(config);
  args = applyConfigPrecedence(args, config, presets);

  // Check if we have the new multiple configurations format
  const alloyPreset = presets.alloy;
  const isLegacyFormat = alloyPreset.android && alloyPreset.iphone &&
    !Object.keys(alloyPreset).some(key =>
      key !== 'android' && key !== 'iphone' &&
      typeof alloyPreset[key] === 'object' &&
      alloyPreset[key].android && alloyPreset[key].iphone
    );

  if (!isLegacyFormat) {
    // New multi-configuration format
    return await processAlloyMultipleConfigurations(args, alloyPreset);
  } else {
    // Legacy format
    return await processAlloyLegacyFormat(args, alloyPreset);
  }
}

/**
 * Process Alloy preset with multiple configurations
 * @param {Object} args - Command line arguments
 * @param {Object} alloyPreset - Alloy preset configuration
 */
async function processAlloyMultipleConfigurations(args, alloyPreset) {
  let totalNewSize = 0;
  let processedCount = 0;
  let totalOriginalSize = 0;
  const startTime = Date.now();
  const processedFilesInfo = [];

  // Get all configuration groups
  let configGroups = Object.keys(alloyPreset);

  // Filter to specific subpreset if requested
  if (args.alloySubPreset) {
    if (alloyPreset[args.alloySubPreset]) {
      configGroups = [args.alloySubPreset];
      logger.info(`Processing only configuration: ${args.alloySubPreset}`);
    } else {
      logger.error(`Error: Configuration "${args.alloySubPreset}" not found in alloy preset.`);
      logger.warning(`Available configurations: ${Object.keys(alloyPreset).join(', ')}`);
      process.exit(1);
    }
  } else {
    logger.info(`Processing all alloy configurations: ${configGroups.join(', ')}`);
  }

  for (const configGroupName of configGroups) {
    const configGroup = alloyPreset[configGroupName];

    logger.info(`\nProcessing configuration: ${configGroupName}`);

    // Process each platform within the configuration group
    for (const [subPresetName, subPresetConfig] of Object.entries(configGroup)) {
      if (subPresetName !== 'android' && subPresetName !== 'iphone') {
        continue; // Skip non-platform keys like quality, format, etc.
      }

      const result = await processAlloyPlatform(
        subPresetName,
        subPresetConfig,
        configGroupName,
        args,
        alloyPreset
      );

      if (result) {
        processedFilesInfo.push(...result.processedFilesInfo);
        totalOriginalSize += result.totalOriginalSize;
        totalNewSize += result.totalNewSize;
        processedCount += result.processedCount;
      }
    }
  }

  // Log summary
  logAlloyProcessingSummary(
    processedCount,
    totalOriginalSize,
    totalNewSize,
    startTime,
    args.debug ? processedFilesInfo : null
  );
}

/**
 * Process Alloy legacy format
 * @param {Object} args - Command line arguments
 * @param {Object} alloyPreset - Alloy preset configuration
 */
async function processAlloyLegacyFormat(args, alloyPreset) {
  let totalNewSize = 0;
  let processedCount = 0;
  let totalOriginalSize = 0;
  const startTime = Date.now();
  const processedFilesInfo = [];

  // Process each platform separately
  for (const [subPresetName, subPresetConfig] of Object.entries(alloyPreset)) {
    if (subPresetName !== 'android' && subPresetName !== 'iphone') {
      continue;
    }

    const result = await processAlloyPlatform(
      subPresetName,
      subPresetConfig,
      null,
      args,
      alloyPreset
    );

    if (result) {
      processedFilesInfo.push(...result.processedFilesInfo);
      totalOriginalSize += result.totalOriginalSize;
      totalNewSize += result.totalNewSize;
      processedCount += result.processedCount;
    }
  }

  // Log summary
  logAlloyProcessingSummary(
    processedCount,
    totalOriginalSize,
    totalNewSize,
    startTime,
    args.debug ? processedFilesInfo : null
  );
}

/**
 * Process a single Alloy platform configuration
 * @param {string} subPresetName - Platform name (android/iphone)
 * @param {Object} subPresetConfig - Platform configuration
 * @param {string} configGroupName - Configuration group name
 * @param {Object} args - Command line arguments
 * @param {Object} alloyPreset - Full alloy preset
 * @returns {Promise<Object>} Processing results
 */
async function processAlloyPlatform(subPresetName, subPresetConfig, configGroupName, args, alloyPreset) {
  // Use source from config, or fallback to the input path from command line
  const sourceFolder = subPresetConfig.source || args._[0];

  if (!sourceFolder) {
    logger.warning(`Warning: No source folder defined for ${configGroupName ? `${configGroupName}.` : ''}${subPresetName}, skipping...`);
    return null;
  }

  if (!fs.existsSync(sourceFolder)) {
    logger.warning(`Warning: Source folder "${sourceFolder}" for ${configGroupName ? `${configGroupName}.` : ''}${subPresetName} does not exist, skipping...`);
    return null;
  }

  logger.clearProgress();
  logger.info(`  Processing ${subPresetName} from: ${sourceFolder}`);

  const isDirectory = fs.lstatSync(sourceFolder).isDirectory();
  const inputDir = isDirectory ? sourceFolder : path.dirname(sourceFolder);
  const files = isDirectory ? fs.readdirSync(sourceFolder).sort(naturalSort) : [path.basename(sourceFolder)];

  let processedCount = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  const processedFilesInfo = [];

  const tasks = files.map(async (file) => {
    const inputFile = path.join(inputDir, file);
    const fileExtension = path.extname(file).toLowerCase().slice(1);

    if (SUPPORTED_FORMATS.includes(fileExtension) && fs.lstatSync(inputFile).isFile()) {
      const scales = ALLOY_SCALES[subPresetName];
      const outputSubfolder = subPresetConfig.output || '';
      const isIPhone = subPresetName === 'iphone';
      const effectiveQuality = getEffectiveQuality(subPresetName, subPresetConfig, configGroupName, args, alloyPreset);
      const effectiveFormat = getEffectiveFormat(subPresetName, subPresetConfig, path.extname(inputFile), configGroupName, args, alloyPreset);

      // Determine output base: CLI -o flag > Titanium project root (CWD with tiapp.xml) > input file's directory
      let outputBase;
      if (args.output) {
        outputBase = path.isAbsolute(args.output) ? args.output : path.resolve(path.dirname(inputFile), args.output);
      } else if (fs.existsSync(path.join(process.cwd(), 'tiapp.xml'))) {
        outputBase = process.cwd();
      } else {
        outputBase = path.dirname(inputFile);
      }

      const result = await processImageWithScaling(
        inputFile,
        scales,
        outputSubfolder,
        isIPhone,
        effectiveQuality,
        effectiveFormat,
        outputBase
      );

      if (result) {
        result.processedFiles.forEach(f => {
          processedFilesInfo.push({
            ...f,
            configGroup: configGroupName,
            platform: subPresetName
          });
        });
        totalOriginalSize += result.originalSize;
        totalNewSize += result.newSize;
        processedCount++;
      }
      return result;
    }
    return null;
  });

  await Promise.all(tasks);

  logger.clearProgress();

  return {
    processedCount,
    totalOriginalSize,
    totalNewSize,
    processedFilesInfo
  };
}

/**
 * Get effective quality for Alloy processing
 * @param {string} subPresetName - Platform name
 * @param {Object} subPresetConfig - Platform configuration
 * @param {string} configGroupName - Configuration group name
 * @param {Object} args - Command line arguments
 * @param {Object} alloyPreset - Full alloy preset
 * @returns {number} Effective quality value
 */
function getEffectiveQuality(subPresetName, subPresetConfig, configGroupName, args, alloyPreset) {
  // CLI flag always wins
  if (args._userArgs.quality) return parseInt(args._userArgs.quality, 10);
  // Subpreset (android/iphone) quality
  if (subPresetConfig && subPresetConfig.quality) return parseInt(subPresetConfig.quality, 10);
  // Configuration group quality
  if (configGroupName && alloyPreset[configGroupName] && alloyPreset[configGroupName].quality) {
    return parseInt(alloyPreset[configGroupName].quality, 10);
  }
  // Alloy preset quality
  if (alloyPreset.quality) return parseInt(alloyPreset.quality, 10);
  // Default from args (which includes config defaults)
  return args.quality;
}

/**
 * Get effective format for Alloy processing
 * @param {string} subPresetName - Platform name
 * @param {Object} subPresetConfig - Platform configuration
 * @param {string} originalExt - Original file extension
 * @param {string} configGroupName - Configuration group name
 * @param {Object} args - Command line arguments
 * @param {Object} alloyPreset - Full alloy preset
 * @returns {string} Effective format
 */
function getEffectiveFormat(subPresetName, subPresetConfig, originalExt, configGroupName, args, alloyPreset) {
  // CLI flag always wins
  if (args._userArgs.format) return args._userArgs.format;
  // Subpreset (android/iphone) format
  if (subPresetConfig && subPresetConfig.format) return subPresetConfig.format;
  // Configuration group format
  if (configGroupName && alloyPreset[configGroupName] && alloyPreset[configGroupName].format) {
    return alloyPreset[configGroupName].format;
  }
  // Alloy preset format
  if (alloyPreset.format) return alloyPreset.format;
  // Default from args or preserve original
  return args.format || originalExt.slice(1).toLowerCase();
}

/**
 * Log Alloy processing summary
 * @param {number} processedCount - Number of processed files
 * @param {number} totalOriginalSize - Total original size in bytes
 * @param {number} totalNewSize - Total new size in bytes
 * @param {number} startTime - Start time in milliseconds
 * @param {Array} processedFilesInfo - Optional array of processed files for debug
 */
function logAlloyProcessingSummary(processedCount, totalOriginalSize, totalNewSize, startTime, processedFilesInfo) {
  // Log processed files info in debug mode
  if (processedFilesInfo) {
    logger.debug(`Processed files:`);
    processedFilesInfo.forEach(fileInfo => {
      const configInfo = fileInfo.configGroup ? `config: ${fileInfo.configGroup}, ` : '';
      logger.debug(` - ${fileInfo.path} (${configInfo}platform: ${fileInfo.platform}, scale: ${fileInfo.scaleName})`);
    });
  }

  // Calculate duration
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Show summary
  logger.summary({
    processedCount,
    totalOriginalSize,
    totalNewSize,
    duration
  });
}

module.exports = {
  processAlloyLegacy
};
