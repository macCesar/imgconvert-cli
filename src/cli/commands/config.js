'use strict';
const fs = require('fs');
const path = require('path');
const { loadConfig, createDefaultConfig } = require('../../config/loader');
const { logger } = require('../../utils/logger');

const CONFIG_PATH = path.join(process.cwd(), '.imgconverter.config.json');

module.exports = {
  init(options) {
    if (fs.existsSync(CONFIG_PATH) && !(options && options.force)) {
      logger.warning('Config file already exists. Use --force to overwrite.');
      process.exit(0);
    }
    createDefaultConfig();
  },
  show() {
    const config = loadConfig();
    console.log(JSON.stringify(config, null, 2));
  },
};
