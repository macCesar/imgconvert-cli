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
 * @param {string} tightMaster - Path to tight master (aspect-preserved, transparent)
 * @param {string} bgColor - Hex color used for iOS alpha flatten
 * @param {number} paddingPct - Padding per side (0-40)
 * @param {string} outRoot - Output directory
 * @returns {Promise<{defaultIcon: string, defaultIconIos: string}>}
 */
async function genIos(tightMaster, bgColor, paddingPct, outRoot) {
  fs.mkdirSync(outRoot, { recursive: true });

  const inner = Math.floor((CANVAS * (100 - 2 * paddingPct)) / 100);
  const defaultIconPath = path.join(outRoot, 'DefaultIcon.png');
  const defaultIconIosPath = path.join(outRoot, 'DefaultIcon-ios.png');

  const resized = await sharp(tightMaster)
    .resize({
      width: inner,
      height: inner,
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  // DefaultIcon.png — alpha preserved (matches `ti create` default)
  await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(defaultIconPath);

  // DefaultIcon-ios.png — flattened on bg-color (Apple rejects alpha)
  // Sharp's .flatten() merges alpha into the background but may still emit
  // an alpha channel in PNG output — follow with .removeAlpha() to guarantee
  // the output has no alpha channel at all.
  await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resized, gravity: 'center' }])
    .flatten({ background: bgColor })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toFile(defaultIconIosPath);

  return { defaultIcon: defaultIconPath, defaultIconIos: defaultIconIosPath };
}

module.exports = { genIos };
