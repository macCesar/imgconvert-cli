/**
 * gen-ios-dark.js — produce Titanium's iOS 18+ dark-mode root icon:
 *
 *   DefaultIcon-Dark.png   1024×1024, transparent (default) or flattened on dark bg
 *
 * Per Apple HIG (iOS 18+): the dark variant may either (a) omit the background
 * so the system applies its own dark gradient, or (b) use an opaque dark tint.
 * This module supports both: if bgColor is null, alpha is preserved; if a hex
 * is provided, the image is flattened on that color.
 *
 * Two source modes:
 *   1. Main master (optionally + --dark-bg-color for opaque)
 *   2. --dark-master <path> → separate master (dedicated dark logo)
 *
 * Titanium SDK 13.1+ is expected to read this file from the project root, but
 * upstream issue tidev/titanium-sdk#14122 is not yet merged — until then, the
 * user may need to manually place the PNG inside Assets.xcassets/AppIcon.appiconset.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CANVAS = 1024;

/**
 * @param {string} tightMaster - Main tight master, or --dark-master output (aspect-preserved)
 * @param {string|null} bgColor - Hex color for opaque flatten, or null for transparent
 * @param {number} paddingPct - Padding per side (0-40)
 * @param {string} outRoot - Output directory
 * @returns {Promise<string>} Path to DefaultIcon-Dark.png
 */
async function genIosDark(tightMaster, bgColor, paddingPct, outRoot) {
  fs.mkdirSync(outRoot, { recursive: true });

  const inner = Math.floor((CANVAS * (100 - 2 * paddingPct)) / 100);
  const outPath = path.join(outRoot, 'DefaultIcon-Dark.png');

  const resized = await sharp(tightMaster)
    .resize({
      width: inner,
      height: inner,
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  const pipeline = sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).composite([{ input: resized, gravity: 'center' }]);

  if (bgColor) {
    // Opaque variant: flatten on dark tint, strip alpha entirely.
    await pipeline
      .flatten({ background: bgColor })
      .removeAlpha()
      .png({ compressionLevel: 9 })
      .toFile(outPath);
  } else {
    // Apple-recommended default: preserve alpha. The system paints its own
    // dark gradient behind the icon at render time.
    await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
  }

  return outPath;
}

module.exports = { genIosDark };
