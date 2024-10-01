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

const inputDir = process.argv[2]; // The source folder is now a positional argument
const format = args.format;
const quality = parseInt(args.quality, 10);
const backgroundColor = args.background;
const outputDir = path.join(inputDir, 'compressed');

if (!inputDir) {
  console.error('Please provide a source folder.');
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Supported image formats
const supportedFormats = ['jpeg', 'png', 'webp'];

const processImages = async () => {
  const tasks = fs.readdirSync(inputDir).map(file => {
    const inputFile = path.join(inputDir, file);
    const fileExtension = path.extname(file).toLowerCase().slice(1);

    // Check if the file is a valid image and not a directory
    if (supportedFormats.includes(fileExtension) && fs.lstatSync(inputFile).isFile()) {
      const outputFileBase = path.join(outputDir, path.parse(file).name);

      const processImage = async (format) => {
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
          console.log(`Processed: ${file} to ${format.toUpperCase()}`);
        } catch (err) {
          console.error(`Error processing ${file} to ${format.toUpperCase()}:`, err);
        }
      };

      if (format === 'all') {
        return Promise.all(supportedFormats.map(processImage));
      } else {
        return processImage(format === 'none' ? fileExtension : format);
      }
    } else {
      // console.log(`Skipping unsupported or non-image file: ${file}`);
      return Promise.resolve();
    }
  });

  await Promise.all(tasks);
  console.log(`Process completed. The images are located in: ${outputDir}`);
};

processImages();
