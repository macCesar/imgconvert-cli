/**
 * gen-ios.js — produce Titanium's two root icons:
 *
 *   DefaultIcon.png       1024×1024, alpha preserved (universal / Android)
 *   DefaultIcon-ios.png   1024×1024, alpha flattened on bg-color (iOS)
 *
 * This matches what `titanium` / `alloy new` ships out of the box: a fresh
 * Alloy project contains both files in the project root, with DefaultIcon.png
 * having transparency and DefaultIcon-ios.png flattened (Apple rejects alpha).
 *
 * Padding is purely visual breathing room — iOS app icons have no launcher
 * mask. Default 8% per side (logo fills 84% of canvas).
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CANVAS = 1024;

/**
 * Generate DefaultIcon.png (alpha) + DefaultIcon-ios.png (flattened).
 *
 * Two distinct paddings — `DefaultIcon.png` is the universal fallback (iOS +
 * Android when no adaptive icons exist), so it uses the Android safe-zone
 * padding to stay inside launcher masks. `DefaultIcon-ios.png` is iOS-only
 * (no launcher mask), so it uses the looser aesthetic iOS padding.
 *
 * @param {string} tightMaster - Path to tight master (aspect-preserved, transparent)
 * @param {string} bgColor - Hex color used for iOS alpha flatten
 * @param {number} androidPadding - Padding % for DefaultIcon.png (Android safe-zone)
 * @param {number} iosPadding - Padding % for DefaultIcon-ios.png (iOS aesthetic)
 * @param {string} outRoot - Output directory
 * @returns {Promise<{defaultIcon: string, defaultIconIos: string}>}
 */
async function genIos(tightMaster, bgColor, androidPadding, iosPadding, outRoot) {
  fs.mkdirSync(outRoot, { recursive: true });

  const defaultIconPath = path.join(outRoot, 'DefaultIcon.png');
  const defaultIconIosPath = path.join(outRoot, 'DefaultIcon-ios.png');

  // DefaultIcon.png — alpha preserved, uses the Android safe-zone padding so
  // it stays launcher-mask-safe when Android falls back to it (projects
  // without adaptive icons in app/platform/android/res/mipmap-*/).
  await renderSquare(tightMaster, androidPadding, null, defaultIconPath);

  // DefaultIcon-ios.png — flattened on bg-color (Apple rejects alpha).
  // Uses the iOS aesthetic padding (tighter — no launcher mask on iOS).
  await renderSquare(tightMaster, iosPadding, bgColor, defaultIconIosPath);

  return { defaultIcon: defaultIconPath, defaultIconIos: defaultIconIosPath };
}

async function renderSquare(tightMaster, paddingPct, flattenBg, outPath) {
  const inner = Math.floor((CANVAS * (100 - 2 * paddingPct)) / 100);

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

  if (flattenBg) {
    await pipeline.flatten({ background: flattenBg }).removeAlpha().png({ compressionLevel: 9 }).toFile(outPath);
  } else {
    await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
  }
}

module.exports = { genIos };
