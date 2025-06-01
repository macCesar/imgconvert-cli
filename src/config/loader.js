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
      logger.warning(`Failed to parse configuration file: ${error.message}`);
      logger.warning('Using default configuration');
    }
  }

  // Merge with defaults
  return {
    ...defaultConfig,
    ...config,
    presets: {
      ...defaultPresets,
      ...(config.presets || {})
    }
  };
}

/**
 * Create default configuration file
 */
function createDefaultConfig() {
  const configContent = {
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

  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(configContent, null, 2), 'utf-8');
    logger.success(`Default configuration file created at ${CONFIG_PATH}`);
  } catch (error) {
    logger.error(`Failed to create configuration file: ${error.message}`);
    process.exit(1);
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
