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

  section(name) {
    console.log();
    console.log(chalk.cyan(`▸ ${name}`));
  }

  bullet(message) {
    console.log(`  ${chalk.cyan('•')} ${message}`);
  }

  property(label, value) {
    console.log(`${chalk.blue(label)}${value}`);
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
      console.log(chalk.cyan(`${message}`));
    }
  }

  progress(message) {
    // Clear the entire line and move cursor to beginning, then write the message
    process.stdout.write('\r\x1b[K' + chalk.green(message));
  }

  clearProgress() {
    // Clear the entire line and move cursor to beginning
    process.stdout.write('\r\x1b[K');
  }

  summary(data) {
    const { processedCount, totalOriginalSize, totalNewSize, duration } = data;

    let savings = '0.00';
    if (totalOriginalSize > 0) {
      savings = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(2);
    }

    console.log(chalk.green(`Processing complete! Summary:
  - Processed files: ${chalk.yellow(processedCount)}
  - Total original size: ${chalk.yellow(this.formatBytes(totalOriginalSize))}
  - Total new size: ${chalk.yellow(this.formatBytes(totalNewSize))}
  - Total savings: ${chalk.yellow(savings + '%')}
  - Duration: ${chalk.yellow(duration + ' seconds')}`));
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
