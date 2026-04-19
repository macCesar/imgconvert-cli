/**
 * alloy-modern/index.js — orchestrator for modern Alloy branding assets.
 *
 * Composes the pipeline based on CLI flags:
 *
 *   --modern        → everything (adaptive + marketplace + iOS + optionally splash/notification)
 *   --adaptive      → Android adaptive icon triplet + legacy + ic_launcher.xml
 *   --marketplace   → iTunesConnect.png + MarketplaceArtwork.png
 *   --notification  → notification icons × 5
 *   --splash        → splash_icon × 5 (Android 12+)
 *   --cleanup-legacy → context-aware cleanup (can run standalone)
 *
 * Always emits DefaultIcon.png + DefaultIcon-ios.png when a master is provided,
 * because those are Titanium's root-level icons that every modern project has.
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../../utils/logger');
const { prepareMaster } = require('./prepare-master');
const { genIos } = require('./gen-ios');
const { genAndroidAdaptive } = require('./gen-android-adaptive');
const { genAndroidLegacy } = require('./gen-android-legacy');
const { genMarketplace } = require('./gen-marketplace');
const { genNotification } = require('./gen-notification');
const { genSplash } = require('./gen-splash');
const { genIcLauncherXml } = require('./gen-ic-launcher-xml');
const { detectProjectType, resolveAndroidResRoot } = require('./tiapp-reader');
const { cleanupLegacy } = require('./cleanup-legacy');
const { printPostGenNotes } = require('./post-gen-notes');

/**
 * Run the modern Alloy pipeline.
 * @param {Object} opts
 * @param {string} [opts.master] - Path to master image (optional in cleanup-only mode)
 * @param {string} opts.bgColor - Hex color (default #FFFFFF)
 * @param {number} opts.padding - Android safe-zone padding % (default 22)
 * @param {number} opts.iosPadding - iOS aesthetic padding % (default 8)
 * @param {boolean} opts.adaptive - Generate Android adaptive icons
 * @param {boolean} opts.marketplace - Generate marketplace artwork
 * @param {boolean} opts.notification - Generate notification icons
 * @param {boolean} opts.splash - Generate splash icons
 * @param {boolean} opts.cleanupLegacy - Run context-aware cleanup
 * @param {boolean} opts.aggressive - Aggressive cleanup (ldpi)
 * @param {string} opts.projectRoot - Titanium project root (default cwd)
 * @param {string} [opts.output] - Staging dir (default: <projectRoot>/.ti-branding)
 * @param {boolean} opts.dryRun - Skip file writes
 * @param {boolean} opts.inPlace - Write directly into projectRoot (overwrite)
 * @param {boolean} opts.notes - Print full post-gen notes (tiapp.xml snippets etc.)
 * @returns {Promise<{stagingRoot: string, generated: string[]}>}
 */
async function runModern(opts) {
  const {
    master,
    monochromeMaster = null,
    bgColor = '#FFFFFF',
    bgColorExplicit = false,
    padding = 20,
    iosPadding = 4,
    adaptive = false,
    marketplace = false,
    notification = false,
    splash = false,
    cleanupLegacy: runCleanup = false,
    aggressive = false,
    projectRoot = process.cwd(),
    output,
    dryRun = false,
    inPlace = false,
    notes = false
  } = opts;

  validateOptions({ master, bgColor, padding, iosPadding, cleanupLegacy: runCleanup });

  const projectType = detectProjectType(projectRoot);
  // --in-place writes directly into the project root (overwrite mode).
  // Explicit --output wins over --in-place to avoid ambiguity.
  const isInPlace = inPlace && !output;
  const stagingRoot = output || (isInPlace ? projectRoot : path.join(projectRoot, '.ti-branding'));

  logger.info(`Project:    ${projectRoot} (${projectType})`);
  if (master) {
    logger.info(`Master:     ${master}`);
    logger.info(`Background: ${bgColor}`);
    logger.info(`Padding:    Android ${padding}% / iOS ${iosPadding}% per side`);
    logger.info(isInPlace ? `Writing IN PLACE to: ${projectRoot}` : `Staging:    ${stagingRoot}`);
  }
  if (isInPlace && !dryRun) {
    logger.warning('⚠  --in-place mode: files in your project will be OVERWRITTEN. Commit first if you want a rollback.');
  }
  if (dryRun) logger.warning('DRY RUN — no files will be written');

  const generated = [];

  // Cleanup-only mode: skip all generation
  if (!master && runCleanup) {
    logger.info('Cleanup-only mode');
    await cleanupLegacy({ projectRoot, projectType, aggressive, dryRun });
    return { stagingRoot, generated };
  }

  if (!master) {
    throw new Error('Master image is required (unless running --cleanup-legacy alone).');
  }
  if (!fs.existsSync(master)) {
    throw new Error(`Master image not found: ${master}`);
  }

  // Warn if layout unknown
  if (projectType === 'unknown') {
    logger.warning(`Could not detect project layout. Expected 'app/' (Alloy) or 'Resources/' (Classic).`);
    logger.warning(`Assets will be staged under ${stagingRoot}/standalone/ — copy manually.`);
  }

  // Resolve Android res root inside staging
  const androidResStaging = getStagingAndroidResRoot(stagingRoot, projectType);

  if (dryRun) {
    logger.info('[dry-run] Would generate:');
    logger.info(`  - ${stagingRoot}/DefaultIcon.png + DefaultIcon-ios.png`);
    if (marketplace) logger.info(`  - ${stagingRoot}/iTunesConnect.png + MarketplaceArtwork.png`);
    if (adaptive) {
      logger.info(`  - ${androidResStaging}/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher_{foreground,background,monochrome}.png`);
      logger.info(`  - ${androidResStaging}/mipmap-{...}/ic_launcher.png (legacy)`);
      logger.info(`  - ${androidResStaging}/mipmap-anydpi-v26/ic_launcher.xml`);
    }
    if (notification) logger.info(`  - ${androidResStaging}/drawable-*/ic_stat_notify.png × 5`);
    if (splash) logger.info(`  - ${androidResStaging}/drawable-*/splash_icon.png × 5`);
    if (runCleanup) {
      await cleanupLegacy({ projectRoot, projectType, aggressive, dryRun });
    }
    return { stagingRoot, generated };
  }

  // ---- Prepare masters ----------------------------------------------------
  logger.info('Preparing dual masters (square + tight)');
  const masterBase = path.join(stagingRoot, '_master');
  const { tight } = await prepareMaster(master, masterBase);

  // Optional monochrome master — if provided, used for the monochrome adaptive
  // layer and notification icons (instead of whitening the colored master).
  // Lets users design a simplified silhouette for complex/detailed logos
  // where a naive color→white flattening would produce a featureless blob.
  let monoTight = null;
  if (monochromeMaster) {
    if (!fs.existsSync(monochromeMaster)) {
      throw new Error(`Monochrome master not found: ${monochromeMaster}`);
    }
    logger.info(`Preparing monochrome master: ${monochromeMaster}`);
    const monoBase = path.join(stagingRoot, '_master_mono');
    const monoResult = await prepareMaster(monochromeMaster, monoBase);
    monoTight = monoResult.tight;
  }

  // ---- iOS (root-level DefaultIcon.png + DefaultIcon-ios.png) ------------
  logger.info('Generating DefaultIcon.png (alpha) + DefaultIcon-ios.png (flattened)');
  const ios = await genIos(tight, bgColor, iosPadding, stagingRoot);
  generated.push(ios.defaultIcon, ios.defaultIconIos);

  // ---- Marketplace -------------------------------------------------------
  if (marketplace) {
    const alphaMode = bgColorExplicit
      ? `flattened on ${bgColor}`
      : 'alpha preserved';
    logger.info(`Generating marketplace artwork (iTunesConnect.png + MarketplaceArtwork.png, ${alphaMode})`);
    const mkt = await genMarketplace(tight, iosPadding, stagingRoot, {
      flatten: bgColorExplicit,
      bgColor
    });
    generated.push(mkt.itunesConnect, mkt.marketplaceArtwork);
  }

  // ---- Android adaptive + legacy + XML -----------------------------------
  if (adaptive) {
    const monoLabel = monoTight ? ', monochrome from --monochrome-master' : '';
    logger.info(`Generating Android adaptive icons (foreground + background + monochrome${monoLabel}) × 5`);
    const adaptiveFiles = await genAndroidAdaptive(tight, bgColor, padding, androidResStaging, { monoTight });
    generated.push(...adaptiveFiles);

    logger.info('Generating Android legacy ic_launcher.png × 5');
    const legacyFiles = await genAndroidLegacy(tight, bgColor, padding, androidResStaging);
    generated.push(...legacyFiles);

    const xmlPath = genIcLauncherXml(androidResStaging);
    generated.push(xmlPath);
    logger.success(`Adaptive icon XML: ${xmlPath}`);
  }

  // ---- Notification ------------------------------------------------------
  if (notification) {
    const monoLabel = monoTight ? ' from --monochrome-master' : ' whitened from master';
    logger.info(`Generating notification icons (white+alpha, edge-to-edge${monoLabel}) × 5`);
    const notifFiles = await genNotification(monoTight || tight, androidResStaging);
    generated.push(...notifFiles);
  }

  // ---- Splash ------------------------------------------------------------
  if (splash) {
    logger.info('Generating Android 12+ splash icons × 5');
    const splashFiles = await genSplash(tight, androidResStaging);
    generated.push(...splashFiles);
  }

  // ---- Cleanup -----------------------------------------------------------
  if (runCleanup) {
    logger.info('Cleanup legacy artifacts');
    await cleanupLegacy({ projectRoot, projectType, aggressive, dryRun });
  }

  // In --in-place mode, intermediate master files (_master_*.png) land
  // directly in the project root. Clean them up so the user is only left
  // with the real branded assets.
  if (isInPlace) {
    const tmpFiles = [
      path.join(stagingRoot, '_master_square.png'),
      path.join(stagingRoot, '_master_tight.png'),
      path.join(stagingRoot, '_master_mono_square.png'),
      path.join(stagingRoot, '_master_mono_tight.png')
    ];
    for (const tmp of tmpFiles) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    }
    logger.success(`All assets written IN PLACE at: ${projectRoot}`);
  } else {
    logger.success(`All assets staged at: ${stagingRoot}`);
  }

  // ---- Post-gen notes ----------------------------------------------------
  printPostGenNotes({
    projectType,
    projectRoot,
    stagingRoot,
    bgColor,
    padding,
    iosPadding,
    withSplash: splash,
    withNotification: notification,
    inPlace: isInPlace,
    fullNotes: notes
  });

  return { stagingRoot, generated };
}

function getStagingAndroidResRoot(stagingRoot, projectType) {
  if (projectType === 'alloy') return path.join(stagingRoot, 'app', 'platform', 'android', 'res');
  if (projectType === 'classic') return path.join(stagingRoot, 'platform', 'android', 'res');
  return path.join(stagingRoot, 'standalone', 'platform', 'android', 'res');
}

function validateOptions({ master, bgColor, padding, iosPadding, cleanupLegacy }) {
  if (!master && !cleanupLegacy) {
    throw new Error('Master image path is required (unless using --cleanup-legacy alone).');
  }
  if (!/^#[0-9A-Fa-f]{6}$/.test(bgColor)) {
    throw new Error(`--bg-color must be a 6-digit hex like #0B1326 (got: ${bgColor}).`);
  }
  if (padding < 0 || padding > 40) {
    throw new Error(`--padding must be between 0 and 40 (got: ${padding}).`);
  }
  if (iosPadding < 0 || iosPadding > 40) {
    throw new Error(`--ios-padding must be between 0 and 40 (got: ${iosPadding}).`);
  }
}

module.exports = { runModern };
