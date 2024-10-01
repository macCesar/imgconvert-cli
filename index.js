#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Parse command-line arguments
const inputDir = process.argv[2];
const format = process.argv[3] || 'none';
const quality = parseInt(process.argv[4], 10) || 85; // Default quality is 85
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
    const outputFile = path.join(outputDir, path.parse(file).name);

    sharp(inputFile)
      .toFormat(format === 'webp' ? 'webp' : format === 'png' ? 'png' : 'jpeg', {
        quality: quality
      })
      .toFile(`${outputFile}.${format === 'none' ? fileExtension.slice(1) : format}`)
      .then(() => {
        console.log(`Processed: ${file}`);
      })
      .catch(err => {
        console.error(`Error processing ${file}:`, err);
      });
  } else {
    console.log(`Skipping unsupported or non-image file: ${file}`);
  }
});

console.log(`Process completed. The images are located in: ${outputDir}`);
