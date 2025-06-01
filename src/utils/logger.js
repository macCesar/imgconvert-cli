/**
 * Logger utility module
 * Provides consistent logging with colors
 */

const chalk = require('chalk');

class Logger {
  constructor() {
    this.debugMode = false;
  }

  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  info(message) {
    console.log(chalk.blue(message));
  }

  success(message) {
    console.log(chalk.green(message));
  }

  warning(message) {
    console.log(chalk.yellow(message));
  }

  error(message) {
    console.error(chalk.red(message));
  }

  debug(message) {
    if (this.debugMode) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  }

  progress(message) {
    process.stdout.write(chalk.green(`${message}\r`));
  }

  clearProgress() {
    process.stdout.write('\r' + ' '.repeat(100) + '\r');
  }

  summary(data) {
    const { processedCount, totalOriginalSize, totalNewSize, duration } = data;

    let savings = '0.00';
    if (totalOriginalSize > 0) {
      savings = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(2);
    }

    console.log(chalk.green(`
Processing complete! Summary:
  - Processed files: ${chalk.yellow(processedCount)}
  - Total original size: ${chalk.yellow(this.formatBytes(totalOriginalSize))}
  - Total new size: ${chalk.yellow(this.formatBytes(totalNewSize))}
  - Total savings: ${chalk.yellow(savings + '%')}
  - Duration: ${chalk.yellow(duration + ' seconds')}
`));
  }

  formatBytes(bytes) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = {
  logger
};
