#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const minimist = require('minimist');

// Parse command-line arguments using minimist
const args = minimist(process.argv.slice(3), {
  alias: {
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

const inputPath = process.argv[2]; // The source path (file or folder) is now a positional argument
const format = args.format;
const quality = parseInt(args.quality, 10);
const backgroundColor = args.background;

const outputDir = fs.lstatSync(inputPath).isDirectory() 
  ? path.join(inputPath, 'compressed') 
  : path.join(path.dirname(inputPath), 'compressed');

if (!inputPath) {
  console.error('Please provide a source file or folder.');
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Supported image formats
const supportedFormats = ['jpeg', 'png', 'webp'];

const processImage = async (inputFile, outputFileBase, format) => {
  let sharpInstance = sharp(inputFile);

  if (format === 'png') {
    sharpInstance = sharpInstance.png({
      compressionLevel: 9,
      palette: true,
      quality: quality,
    });
  } else if (format === 'webp') {
    sharpInstance = sharpInstance.webp({
      quality: quality,
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
    console.error(`Error processing ${path.basename(inputFile)} to ${format.toUpperCase()}:`, err);
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

  for (const task of tasks) {
    const processedFileName = await task;
    if (processedFileName) {
      process.stdout.write(`Processed: ${processedFileName}                \r`); // Extra spaces to clear previous longer names
    }
  }

  const endTime = Date.now();
  const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

  console.log('Process completed in', elapsedTime, 'seconds. The images are located in:', outputDir);
};

processImages();
