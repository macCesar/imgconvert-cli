/**
 * prepare-master.js — produce two normalized masters from a single input.
 *
 *   1. <base>_square.png — 1024×1024 PNG, logo centered in a transparent
 *      square canvas (padding added to the shorter axis to preserve aspect).
 *      Used for iOS DefaultIcon + marketplace artwork (platforms that require
 *      a square icon).
 *
 *   2. <base>_tight.png — logo rasterized at 1024-px max dimension with
 *      native aspect preserved (no padding). Used for Android adaptive
 *      icons so a horizontal wordmark fills the safe-zone by width instead
 *      of being double-padded inside a square.
 *
 * Accepts SVG or PNG. SVG is rasterized by Sharp at high density, then
 * downsampled to 1024 for clean high-DPI output.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const MAX_DIMENSION = 1024;

/**
 * Prepare dual masters (square + tight) from a single input.
 * @param {string} inputPath - Path to SVG or PNG master
 * @param {string} basePath - Output base path (no extension, e.g. /tmp/foo/_master)
 * @returns {Promise<{square: string, tight: string}>} Paths to both outputs
 */
async function prepareMaster(inputPath, basePath) {
  const ext = path.extname(inputPath).toLowerCase().slice(1);
  const squarePath = `${basePath}_square.png`;
  const tightPath = `${basePath}_tight.png`;

  fs.mkdirSync(path.dirname(basePath), { recursive: true });

  if (ext === 'svg') {
    await rasterizeSvgToTight(inputPath, tightPath);
  } else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp') {
    await downsamplePngToTight(inputPath, tightPath);
  } else {
    throw new Error(`Unsupported master format: .${ext} (expected .svg or .png)`);
  }

  await padTightToSquare(tightPath, squarePath);

  return { square: squarePath, tight: tightPath };
}

/**
 * Rasterize an SVG to a tight PNG with aspect preserved, 1024-px max.
 * Sharp loads SVGs at 72dpi by default — we force high density so downsample
 * keeps edges clean.
 */
async function rasterizeSvgToTight(svgPath, outPath) {
  const svgBuffer = fs.readFileSync(svgPath);

  // First pass: render at 4x density (288 dpi) to produce a supersampled raster.
  // Sharp's density is the SVG's internal DPI, not pixel count — but supersampling
  // before downsample gives much cleaner edges than rendering at 72 dpi.
  const hiRes = await sharp(svgBuffer, { density: 288 })
    .png()
    .toBuffer();

  const meta = await sharp(hiRes).metadata();
  const { width: w, height: h } = meta;

  // Fit inside 1024×1024 preserving aspect
  await sharp(hiRes)
    .resize({
      width: w >= h ? MAX_DIMENSION : null,
      height: h > w ? MAX_DIMENSION : null,
      fit: 'inside',
      withoutEnlargement: false
    })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

/**
 * Downsample a PNG/JPEG master to 1024-px max dimension, aspect preserved.
 */
async function downsamplePngToTight(inputPath, outPath) {
  const meta = await sharp(inputPath).metadata();
  const { width: w, height: h } = meta;

  if (w < MAX_DIMENSION || h < MAX_DIMENSION) {
    // Too small — still proceed but warn via caller
  }

  await sharp(inputPath)
    .resize({
      width: w >= h ? MAX_DIMENSION : null,
      height: h > w ? MAX_DIMENSION : null,
      fit: 'inside',
      withoutEnlargement: true
    })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

/**
 * Pad a tight master to a 1024×1024 square with transparency, logo centered.
 */
async function padTightToSquare(tightPath, squarePath) {
  await sharp(tightPath)
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ compressionLevel: 9 })
    .toFile(squarePath);
}

module.exports = {
  prepareMaster,
  MAX_DIMENSION
};
