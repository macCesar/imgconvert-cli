/**
 * gen-android-adaptive.js — adaptive icon triplet (foreground + background +
 * monochrome) at 5 densities.
 *
 * Android adaptive icon: 108×108dp canvas, 66×66dp safe-zone.
 * Densities: mdpi=108, hdpi=162, xhdpi=216, xxhdpi=324, xxxhdpi=432.
 *
 *   foreground:  logo centered inside safe-zone, transparent outside
 *   background:  solid color filling the full canvas
 *   monochrome:  foreground silhouette in white, alpha preserved
 *                (Android applies themed tint at runtime on API 31+)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DENSITIES = [
  { name: 'mdpi', size: 108 },
  { name: 'hdpi', size: 162 },
  { name: 'xhdpi', size: 216 },
  { name: 'xxhdpi', size: 324 },
  { name: 'xxxhdpi', size: 432 }
];

/**
 * Generate adaptive icon triplet × 5 densities.
 * @param {string} tightMaster - Path to tight master (colored)
 * @param {string} bgColor - Hex color for background layer
 * @param {number} paddingPct - Safe-zone padding per side (0-40)
 * @param {string} resRoot - Android res dir (e.g. app/platform/android/res)
 * @param {Object} [opts]
 * @param {string|null} [opts.monoTight] - Optional tight monochrome master.
 *   When provided, used as the source for the monochrome layer (still whitened
 *   to ensure pure white + alpha). Useful for detailed/complex logos where
 *   the colored master has visual elements that would collapse into a
 *   featureless blob when naively converted to white.
 * @returns {Promise<string[]>} Paths to all generated files
 */
async function genAndroidAdaptive(tightMaster, bgColor, paddingPct, resRoot, opts = {}) {
  const { monoTight = null } = opts;
  const generated = [];

  for (const { name, size } of DENSITIES) {
    const inner = Math.floor((size * (100 - 2 * paddingPct)) / 100);
    const dir = path.join(resRoot, `mipmap-${name}`);
    fs.mkdirSync(dir, { recursive: true });

    const foregroundPath = path.join(dir, 'ic_launcher_foreground.png');
    const backgroundPath = path.join(dir, 'ic_launcher_background.png');
    const monochromePath = path.join(dir, 'ic_launcher_monochrome.png');

    // Foreground: logo sized to inner, centered on transparent canvas
    const innerLogo = await sharp(tightMaster)
      .resize({
        width: inner,
        height: inner,
        fit: 'inside',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: innerLogo, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(foregroundPath);

    // Background: solid color
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: bgColor
      }
    })
      .png({ compressionLevel: 9 })
      .toFile(backgroundPath);

    // Monochrome: white silhouette with preserved alpha.
    // When a dedicated monochrome master is provided, we render it fresh
    // (with the same safe-zone padding as the foreground) and whiten.
    // Otherwise we derive monochrome from the already-rendered foreground.
    if (monoTight) {
      const innerMono = await sharp(monoTight)
        .resize({
          width: inner,
          height: inner,
          fit: 'inside',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();

      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite([{ input: innerMono, gravity: 'center' }])
        .ensureAlpha()
        .linear([0, 0, 0, 1], [255, 255, 255, 0])
        .png({ compressionLevel: 9 })
        .toFile(monochromePath);
    } else {
      // Sharp's .linear([a_r, a_g, a_b, a_alpha], [b_r, b_g, b_b, b_alpha])
      // applies: out = in * a + b per channel.
      // With a=[0,0,0,1], b=[255,255,255,0] → RGB forced to 255 (white),
      // alpha kept as-is. Works on any logo (dark, colored, multi-color)
      // but collapses complex multi-color detail into a silhouette.
      await sharp(foregroundPath)
        .ensureAlpha()
        .linear([0, 0, 0, 1], [255, 255, 255, 0])
        .png({ compressionLevel: 9 })
        .toFile(monochromePath);
    }

    generated.push(foregroundPath, backgroundPath, monochromePath);
  }

  // Ensure anydpi-v26 directory exists for the XML binder
  fs.mkdirSync(path.join(resRoot, 'mipmap-anydpi-v26'), { recursive: true });

  return generated;
}

module.exports = { genAndroidAdaptive, DENSITIES };
