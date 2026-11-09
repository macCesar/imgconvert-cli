/**
 * Configuration loader module
 * Handles loading and creating configuration files
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const { defaultConfig, defaultPresets } = require('./defaults');

const CONFIG_PATH = path.join(process.cwd(), '.imgconverter.config.json');

/**
 * Load configuration from file
 * @returns {Object} Configuration object
 */
function loadConfig() {
  let config = {};

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const fileContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
      config = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Invalid configuration JSON: ${error.message}`);
    }
  }

  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Configuration must be a JSON object');

  if (config.presets != null && (typeof config.presets !== 'object' || Array.isArray(config.presets))) throw new Error('presets must be an object');

  // Merge with defaults
  const merged = {
    ...defaultConfig,
    ...Object.fromEntries(Object.entries(config).filter(([, v]) => v != null)),
    presets: {
      ...defaultPresets,
      ...(config.presets || {})
    }
  };
  Object.defineProperty(merged, '_raw', { value: config });
  return merged;
}

/**
 * Create default configuration file
 */
function createDefaultConfig() {
  const configContent = { ...defaultConfig, presets: defaultPresets };

  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(configContent, null, 2), 'utf-8');

    // Show a shorter, more readable path
    const relativePath = path.relative(process.cwd(), CONFIG_PATH);
    const displayPath = relativePath.startsWith('..') ? CONFIG_PATH : `./${relativePath}`;

    logger.success(`Default configuration file created at ${displayPath}`);
  } catch (error) {
    throw new Error(`Failed to create configuration file: ${error.message}`);
  }
}

/**
 * Get merged presets (default + user)
 * @param {Object} config - Configuration object
 * @returns {Object} Merged presets
 */
function getMergedPresets(config) {
  return {
    ...defaultPresets,
    ...(config.presets || {})
  };
}

module.exports = {
  loadConfig,
  createDefaultConfig,
  getMergedPresets,
  CONFIG_PATH
};
