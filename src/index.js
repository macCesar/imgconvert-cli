/**
 * Main orchestrator for imgconvert-cli
 * Coordinates all modules and handles the main application flow
 */

const fs = require('fs');
const path = require('path');
const { parseArguments } = require('./cli/parser');
const { displayHelp } = require('./cli/help');
const { loadConfig, createDefaultConfig } = require('./config/loader');
const { validateInput } = require('./utils/validation');
const { logger } = require('./utils/logger');
const { processImages } = require('./processors/image');
const { processAlloyPreset } = require('./processors/alloy');
const { version } = require('../package.json');

async function main() {
  try {
    // Parse command line arguments
    const args = parseArguments(process.argv.slice(2));

    // Handle help
    if (args.help) {
      displayHelp();
      process.exit(0);
    }

    // Handle version
    if (args.version) {
      logger.info(`imgconvert-cli version: ${version}`);
      process.exit(0);
    }

    // Handle config creation
    if (args._[0] === 'config') {
      createDefaultConfig();
      process.exit(0);
    }

    // Load configuration
    const config = loadConfig();

    // Validate input
    const validation = validateInput(args, config);
    if (!validation.valid) {
      logger.error(validation.error);
      process.exit(1);
    }

    // Process based on preset
    if (args.preset === 'alloy' || (args.preset && args.preset.startsWith('alloy:'))) {
      await processAlloyPreset(args, config);
    } else {
      await processImages(args, config);
    }

  } catch (error) {
    logger.error(`Unexpected error: ${error.message}`);
    if (args.debug) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Start the application
main();
