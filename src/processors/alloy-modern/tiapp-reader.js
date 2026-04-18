/**
 * tiapp-reader.js — parse tiapp.xml and expose just enough config for
 * context-aware cleanup decisions. Uses fast-xml-parser under the hood, but
 * falls back to regex when the dep is unavailable (keeps the package
 * functional even if someone patches the dep tree).
 */

const fs = require('fs');

let XMLParser;
try {
  // Lazy-require so a missing dep surfaces clearly in cleanup paths only.
  ({ XMLParser } = require('fast-xml-parser'));
} catch (_) {
  XMLParser = null;
}

/**
 * Read tiapp.xml and return cleanup-relevant flags.
 * @param {string} tiappPath - Absolute path to tiapp.xml
 * @returns {{
 *   exists: boolean,
 *   storyboardEnabled: boolean,
 *   portraitOnly: boolean,
 *   defaultBgColor: string|null
 * }}
 */
function readTiapp(tiappPath) {
  const result = {
    exists: false,
    storyboardEnabled: false,
    portraitOnly: false,
    defaultBgColor: null
  };

  if (!fs.existsSync(tiappPath)) {
    return result;
  }

  result.exists = true;
  const xml = fs.readFileSync(tiappPath, 'utf8');

  if (XMLParser) {
    return parseWithFastXml(xml, result);
  }
  return parseWithRegex(xml, result);
}

function parseWithFastXml(xml, result) {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: false,
      parseTagValue: false,
      trimValues: true
    });
    const doc = parser.parse(xml);

    const ios = doc?.['ti:app']?.ios || doc?.ti?.app?.ios;
    if (ios) {
      const sb = ios['enable-launch-screen-storyboard'];
      if (typeof sb === 'string' && sb.trim().toLowerCase() === 'true') {
        result.storyboardEnabled = true;
      }
      const bg = ios['default-background-color'];
      if (typeof bg === 'string' && bg.trim()) {
        result.defaultBgColor = bg.trim();
      }

      const orientations = ios.orientations;
      if (orientations) {
        // Detect portrait-only: iphone entry exists and no landscape variants
        const iphoneBlock = orientations.iphone;
        if (iphoneBlock !== undefined) {
          const flat = JSON.stringify(iphoneBlock);
          result.portraitOnly = !/Landscape/i.test(flat);
        }
      }
    }
    return result;
  } catch (_) {
    return parseWithRegex(xml, result);
  }
}

function parseWithRegex(xml, result) {
  if (/<enable-launch-screen-storyboard>\s*true\s*</i.test(xml)) {
    result.storyboardEnabled = true;
  }

  const bgMatch = xml.match(/<default-background-color>\s*(#[0-9A-Fa-f]{6,8})\s*</);
  if (bgMatch) {
    result.defaultBgColor = bgMatch[1];
  }

  if (/<orientations\b/i.test(xml) && !/UIInterfaceOrientationLandscape/i.test(xml)) {
    result.portraitOnly = true;
  }

  return result;
}

/**
 * Detect Titanium project layout.
 * @param {string} projectRoot - Absolute path to project root
 * @returns {'alloy'|'classic'|'unknown'}
 */
function detectProjectType(projectRoot) {
  const path = require('path');
  if (fs.existsSync(path.join(projectRoot, 'app'))) return 'alloy';
  if (fs.existsSync(path.join(projectRoot, 'Resources'))) return 'classic';
  return 'unknown';
}

/**
 * Return the Android res root for a given project layout.
 * @param {string} projectRoot
 * @param {'alloy'|'classic'|'unknown'} projectType
 * @returns {string|null}
 */
function resolveAndroidResRoot(projectRoot, projectType) {
  const path = require('path');
  if (projectType === 'alloy') return path.join(projectRoot, 'app', 'platform', 'android', 'res');
  if (projectType === 'classic') return path.join(projectRoot, 'platform', 'android', 'res');
  return null;
}

/**
 * Detect whether the project already has an adaptive icon XML in place.
 * @param {string} projectRoot
 * @returns {boolean}
 */
function hasAdaptiveIcons(projectRoot) {
  const path = require('path');
  const candidates = [
    path.join(projectRoot, 'app', 'platform', 'android', 'res', 'mipmap-anydpi-v26'),
    path.join(projectRoot, 'platform', 'android', 'res', 'mipmap-anydpi-v26')
  ];
  return candidates.some((c) => fs.existsSync(c));
}

module.exports = {
  readTiapp,
  detectProjectType,
  resolveAndroidResRoot,
  hasAdaptiveIcons
};
