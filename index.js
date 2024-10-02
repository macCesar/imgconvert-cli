#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const chalk = require('chalk');
const minimist = require('minimist');

// Function to display help message
const displayHelp = () => {
  console.log(chalk.blue(`
Usage: ${chalk.green('imgconvert <source_path> [-f=<format|all>] [-q=<quality>] [-b=<background_color>]')}

${chalk.green.bold('imgconvert-cli')} is a command-line tool for compressing and converting images using the ${chalk.bold('sharp')} library. 
It supports various formats (JPEG, PNG, WebP, AVIF, TIFF, GIF) and allows you to optimize images for web use with customizable quality and background color options.

Options:
  ${chalk.green('-h, --help')}         Show this help message
  ${chalk.green('-f, --format')}       Set the desired output format (${chalk.yellow('jpeg, png, webp, avif, tiff, gif, all; default: none')})
  ${chalk.green('-q, --quality')}      Set the quality of the output images (${chalk.yellow('1-100; default: 85')})
  ${chalk.green('-b, --background')}   Set the background color for PNG images (${chalk.yellow('default: #ffffff')})

${chalk.green('<source_path>')}        The path to the image file or directory to process (${chalk.yellow('required')})
`));
  process.exit(0);
};

// Parse command-line arguments using minimist
const args = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    q: 'quality',
    b: 'background',
    f: 'format'
  },
  default: {
    quality: 85,
    background: '#ffffff',
    format: 'none'
  }
});

// Check for help flag
if (args.help) {
  displayHelp();
}

// Validate inputPath
const inputPath = args._[0]; // Get the first positional argument
if (!inputPath) {
  console.error(chalk.red('Error: Please provide a source file or folder.'));
  process.exit(1);
}

// Check if inputPath exists
if (!fs.existsSync(inputPath)) {
  console.error(chalk.red(`Error: The specified path "${inputPath}" does not exist.`));
  process.exit(1);
}

const format = args.format;
const backgroundColor = args.background;
const quality = parseInt(args.quality, 10);

const outputDir = fs.lstatSync(inputPath).isDirectory() 
  ? path.join(inputPath, 'compressed') 
  : path.join(path.dirname(inputPath), 'compressed');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Supported image formats
const supportedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'];

const processImage = async (inputFile, outputFileBase, format) => {
  let sharpInstance = sharp(inputFile);

  if (format === 'png') {
    sharpInstance = sharpInstance.png({
      palette: true,
      quality: quality,
      compressionLevel: 9,
    });
  } else if (format === 'webp') {
    sharpInstance = sharpInstance.webp({
      quality: quality,
    });
  } else if (format === 'avif') {
    sharpInstance = sharpInstance.avif({
      quality: quality,
    });
  } else if (format === 'tiff') {
    sharpInstance = sharpInstance.tiff({
      quality: quality,
    });
  } else if (format === 'gif') {
    sharpInstance = sharpInstance.gif({
      quality: quality,
      palette: true,
      dither: 1.0,
    });
  } else {
    sharpInstance = sharpInstance.flatten({ background: backgroundColor }).jpeg({
      quality: quality,
    });
  }

  try {
    await sharpInstance.toFile(`${outputFileBase}.${format}`);
    return path.basename(inputFile);
  } catch (err) {
    console.error(chalk.red(`Error processing ${path.basename(inputFile)} to ${format.toUpperCase()}: ${err.message}`));
    return null;
  }
};

const processImages = async () => {
  const isDirectory = fs.lstatSync(inputPath).isDirectory();

  const files = isDirectory ? fs.readdirSync(inputPath) : [path.basename(inputPath)];
  const inputDir = isDirectory ? inputPath : path.dirname(inputPath);

  const tasks = files.map(file => {
    const inputFile = path.join(inputDir, file);
    const fileExtension = path.extname(file).toLowerCase().slice(1);

    // Check if the file is a valid image and not a directory
    if (supportedFormats.includes(fileExtension) && fs.lstatSync(inputFile).isFile()) {
      const outputFileBase = path.join(outputDir, path.parse(file).name);

      if (format === 'all') {
        return Promise.all(supportedFormats.map(fmt => processImage(inputFile, outputFileBase, fmt)));
      } else {
        return processImage(inputFile, outputFileBase, format === 'none' ? fileExtension : format);
      }
    } else {
      return Promise.resolve();
    }
  });

  const startTime = Date.now();
  let processedCount = 0;

  for (const task of tasks) {
    const processedFileName = await task;
    if (processedFileName) {
      processedCount++;
      process.stdout.write(chalk.green(`Processed: ${processedFileName}                \r`));
    }
  }

  const endTime = Date.now();
  const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

  if (processedCount === 0) {
    console.log(chalk.yellow('No valid images were found or processed in the specified location.'));
  } else {
    console.log(chalk.blue(`${chalk.green(processedCount)} file(s) were processed in ${chalk.green(elapsedTime)} seconds. The images can be found in: ${chalk.green(outputDir)}`));
  }
};

processImages();
