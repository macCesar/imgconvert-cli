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
const { getMergedPresets } = require('./config/loader');
const { applyConfigPrecedence } = require('./cli/parser');

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

    // Apply configuration precedence BEFORE validation
    const presets = getMergedPresets(config);
    const finalArgs = applyConfigPrecedence(args, config, presets);

    // Validate input
    const validation = validateInput(finalArgs, config);
    if (!validation.valid) {
      logger.error(validation.error);
      process.exit(1);
    }

    // Process based on preset
    if (finalArgs.preset === 'alloy' || (finalArgs.preset && finalArgs.preset.startsWith('alloy:'))) {
      await processAlloyPreset(finalArgs, config);
    } else {
      await processImages(finalArgs, config);
    }

  } catch (error) {
    logger.error(`Unexpected error: ${error.message}`);
    if (args.debug) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Export the main function for use by the entry point
module.exports = { main };

// Start the application only if this file is run directly
if (require.main === module) {
  main();
}
