/**
 * Branding preset router — handles `-p alloy` and `-p ti-branding`.
 *
 * Two preset names, both handled here:
 *
 *   `-p ti-branding`  → always runs the modern Titanium SDK 13.x branding
 *                       pipeline. Works on Alloy AND Classic projects
 *                       (auto-detected). Preferred name going forward.
 *
 *   `-p alloy`        → two modes based on flags:
 *                         • no modern flags → v1.x multi-scale 1x/2x/3x +
 *                           mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi pipeline
 *                           (Alloy-specific). Preserved for backward compat.
 *                         • any modern flag (--modern, --adaptive,
 *                           --marketplace, --notification, --splash,
 *                           --cleanup-legacy) → same as ti-branding.
 *
 * The modern pipeline emits: DefaultIcon.png (alpha) + DefaultIcon-ios.png
 * (flattened), Android adaptive triplet × 5 densities, marketplace artwork,
 * notification icons, splash icons, context-aware legacy cleanup.
 */

const { processAlloyLegacy } = require('./alloy-legacy');
const { runModern } = require('./alloy-modern');
const { logger } = require('../utils/logger');

/**
 * Whether any modern-mode flag was requested.
 */
function isModernRequested(args) {
  return Boolean(
    args.modern ||
    args.adaptive ||
    args.marketplace ||
    args.notification ||
    args.splash ||
    args['cleanup-legacy']
  );
}

/**
 * Whether the invocation is using the `ti-branding` preset name.
 * The `ti-branding` preset always implies modern mode — there is no legacy
 * path for it. If no sub-flags are passed, it defaults to kitchen sink
 * (adaptive + marketplace + notification + splash).
 */
function isTiBrandingPreset(args) {
  return args.presetName === 'ti-branding';
}

/**
 * Process images using the Alloy / ti-branding preset. Delegates to legacy
 * or modern based on the preset name and which flags are present.
 * @param {Object} args - Parsed CLI arguments
 * @param {Object} config - Loaded configuration
 */
async function processAlloyPreset(args, config) {
  const tiBranding = isTiBrandingPreset(args);
  const modernRequested = isModernRequested(args);

  // `-p ti-branding` always runs modern. `-p alloy` runs modern only when
  // modern flags are present; otherwise it stays on the legacy multi-scale
  // path for backward compatibility with v1.x.
  if (tiBranding || modernRequested) {
    // Print deprecation warning if the user opted into modern via the old
    // `-p alloy` spelling instead of `-p ti-branding`. This alias is kept
    // for backward compat with early v2.0.0 docs and will be removed in a
    // future major version (v3.0.0). `-p alloy` WITHOUT modern flags stays
    // supported indefinitely — it's a separate legacy multi-scale feature.
    if (!tiBranding && modernRequested) {
      logger.warning(
        'Deprecation: `-p alloy` with modern flags (--modern, --adaptive, --marketplace, --notification, --splash, --cleanup-legacy) is deprecated and will be removed in v3.0.0. Use `-p ti-branding` instead.'
      );
    }

    // Kitchen-sink rules:
    //   -p ti-branding (no sub-flags)           → all four
    //   -p alloy --modern (no sub-flags)        → all four
    //   anything with explicit sub-flags        → only those sub-flags
    const anySubFlag = args.adaptive || args.marketplace || args.notification || args.splash;
    const kitchenSink = (tiBranding || args.modern) && !anySubFlag;

    await runModern({
      master: args._[0],
      monochromeMaster: args['monochrome-master'] || null,
      bgColor: args['bg-color'] || '#FFFFFF',
      bgColorExplicit: Boolean(args['bg-color']),
      padding: parseIntOr(args.padding, 15),
      iosPadding: parseIntOr(args['ios-padding'], 4),
      adaptive: kitchenSink ? true : Boolean(args.adaptive),
      marketplace: kitchenSink ? true : Boolean(args.marketplace),
      notification: kitchenSink ? true : Boolean(args.notification),
      splash: kitchenSink ? true : Boolean(args.splash),
      cleanupLegacy: Boolean(args['cleanup-legacy']),
      aggressive: Boolean(args.aggressive),
      projectRoot: args.project ? resolveProject(args.project) : process.cwd(),
      output: args.output || null,
      dryRun: Boolean(args['dry-run']),
      inPlace: Boolean(args['in-place']),
      notes: Boolean(args.notes)
    });
    return;
  }

  // Legacy path (v1.x behavior)
  return processAlloyLegacy(args, config);
}

function parseIntOr(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function resolveProject(value) {
  const path = require('path');
  return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

module.exports = {
  processAlloyPreset,
  isModernRequested
};
