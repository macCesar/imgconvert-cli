/**
 * gen-marketplace.js — store-submission artwork.
 *
 *   iTunesConnect.png      1024×1024 (App Store)
 *   MarketplaceArtwork.png 512×512   (Google Play)
 *
 * Alpha handling depends on whether `--bg-color` was explicitly provided:
 *   - not provided → alpha preserved (matches `ti create` default template)
 *   - provided     → alpha flattened onto bg-color (safer for dark-mode
 *                    stores; logos with transparent backgrounds otherwise
 *                    blend into dark UIs on Play Store / macOS App Store)
 *
 * Uses the same --ios-padding as DefaultIcon-ios. Store artwork is scrutinized
 * at large sizes and needs breathing room; it should match the launcher look.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Generate both marketplace assets.
 * @param {string} tightMaster - Path to tight master
 * @param {number} paddingPct - iOS padding per side (0-40)
 * @param {string} outRoot - Output directory
 * @param {Object} [opts]
 * @param {boolean} [opts.flatten=false] - Flatten alpha onto bgColor
 * @param {string} [opts.bgColor='#FFFFFF'] - Background color when flattening
 * @returns {Promise<{itunesConnect: string, marketplaceArtwork: string}>}
 */
async function genMarketplace(tightMaster, paddingPct, outRoot, opts = {}) {
  const { flatten = false, bgColor = '#FFFFFF' } = opts;
  fs.mkdirSync(outRoot, { recursive: true });

  const itunesConnect = await renderSquare(
    tightMaster,
    paddingPct,
    1024,
    path.join(outRoot, 'iTunesConnect.png'),
    { flatten, bgColor }
  );
  const marketplaceArtwork = await renderSquare(
    tightMaster,
    paddingPct,
    512,
    path.join(outRoot, 'MarketplaceArtwork.png'),
    { flatten, bgColor }
  );

  return { itunesConnect, marketplaceArtwork };
}

async function renderSquare(tight, paddingPct, canvasSize, outPath, { flatten, bgColor }) {
  const inner = Math.floor((canvasSize * (100 - 2 * paddingPct)) / 100);

  const resized = await sharp(tight)
    .resize({
      width: inner,
      height: inner,
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  let pipeline = sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resized, gravity: 'center' }]);

  if (flatten) {
    pipeline = pipeline.flatten({ background: bgColor }).removeAlpha();
  }

  await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
  return outPath;
}

module.exports = { genMarketplace };
