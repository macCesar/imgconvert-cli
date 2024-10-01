#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Parse command-line arguments
const inputDir = process.argv[2];
const format = process.argv[3] || 'none';
const quality = parseInt(process.argv[4], 10) || 85; // Default quality is 85
const backgroundColor = process.argv[5] || '#ffffff'; // Default background color is white
const outputDir = path.join(inputDir, 'compressed');

if (!inputDir) {
  console.error('Please provide a directory with images.');
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Supported image formats
const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];

fs.readdirSync(inputDir).forEach(file => {
  const inputFile = path.join(inputDir, file);
  const fileExtension = path.extname(file).toLowerCase();

  // Check if the file is a valid image and not a directory
  if (supportedFormats.includes(fileExtension) && fs.lstatSync(inputFile).isFile()) {
    const outputFileBase = path.join(outputDir, path.parse(file).name);

    const processImage = (format) => {
      let sharpInstance = sharp(inputFile);

      if (format === 'png') {
        sharpInstance = sharpInstance.png({ quality: quality, compressionLevel: 9, adaptiveFiltering: true });
      } else if (format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality: quality });
      } else {
        sharpInstance = sharpInstance.flatten({ background: backgroundColor }).jpeg({ quality: quality });
      }

      sharpInstance
        .toFile(`${outputFileBase}.${format}`)
        .then(() => {
          console.log(`Processed: ${file} to ${format.toUpperCase()}`);
        })
        .catch(err => {
          console.error(`Error processing ${file} to ${format.toUpperCase()}:`, err);
        });
    };

    if (format === '--all') {
      ['jpeg', 'png', 'webp'].forEach(processImage);
    } else {
      processImage(format === 'none' ? fileExtension.slice(1) : format);
    }
  } else {
    console.log(`Skipping unsupported or non-image file: ${file}`);
  }
});

console.log(`Process completed. The images are located in: ${outputDir}`);
