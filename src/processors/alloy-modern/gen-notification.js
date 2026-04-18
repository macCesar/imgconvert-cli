/**
 * gen-notification.js — white-on-transparent notification icons × 5 densities.
 *
 * Android status bar applies runtime tint based on the notification's color
 * property, so all non-transparent pixels become white. Color info is discarded.
 *
 * Sizes: mdpi=24, hdpi=36, xhdpi=48, xxhdpi=72, xxxhdpi=96.
 * Output path: drawable-<density>/ic_stat_notify.png
 *
 * Notification icons are NOT masked by the launcher, so they render as drawn.
 * We trim any transparent padding baked into the master first, then scale the
 * logo to fill the canvas edge-to-edge on its longer axis (with a 1px
 * anti-aliasing margin on each side). This matches what first-party Android
 * apps ship (Gmail, Slack, Chrome) — the logo reaches the edge instead of
 * sitting in a visibly padded box in the status bar.
 *
 * Material's 22dp-inside-24dp "live area" spec is a conservative guideline;
 * in practice, notification icons benefit from going closer to the edge
 * because the status bar is already tiny.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const NOTIFICATION_DENSITIES = [
  { name: 'mdpi', size: 24 },
  { name: 'hdpi', size: 36 },
  { name: 'xhdpi', size: 48 },
  { name: 'xxhdpi', size: 72 },
  { name: 'xxxhdpi', size: 96 }
];

// 1px anti-aliasing margin on each side — prevents the logo's edge pixels
// from touching the canvas edge exactly, which can look aliased on some
// renderers without affecting perceived size in the status bar.
const EDGE_MARGIN = 2;

/**
 * Generate ic_stat_notify.png × 5 densities.
 * @param {string} tightMaster - Path to tight master
 * @param {string} resRoot - Android res dir
 * @returns {Promise<string[]>} Paths to generated files
 */
async function genNotification(tightMaster, resRoot) {
  const generated = [];

  // Trim baked-in transparent padding from the master so the logo can fill
  // the canvas edge-to-edge regardless of what the user provided.
  const trimmedMaster = await sharp(tightMaster)
    .trim()
    .png()
    .toBuffer();

  for (const { name, size } of NOTIFICATION_DENSITIES) {
    // Edge-to-edge with a 1px anti-aliasing margin per side.
    const inner = Math.max(1, size - EDGE_MARGIN);
    const dir = path.join(resRoot, `drawable-${name}`);
    fs.mkdirSync(dir, { recursive: true });

    const outPath = path.join(dir, 'ic_stat_notify.png');

    // Resize trimmed master to inner, whiten RGB, preserve alpha.
    const whitened = await sharp(trimmedMaster)
      .resize({
        width: inner,
        height: inner,
        fit: 'inside',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .ensureAlpha()
      .linear([0, 0, 0, 1], [255, 255, 255, 0])
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: whitened, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(outPath);

    generated.push(outPath);
  }

  return generated;
}

module.exports = { genNotification, NOTIFICATION_DENSITIES };
