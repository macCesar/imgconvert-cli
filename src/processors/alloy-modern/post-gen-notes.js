/**
 * post-gen-notes.js — prints guidance after a successful modern alloy run.
 *
 * Two modes:
 *   - default (compact): one-line per generated category + "Next steps" block
 *   - `--notes` (full):  adds brand color reminder, padding tips, and all
 *                         tiapp.xml snippets (iOS launch, Android launcher,
 *                         Android 12+ splash theme, FCM notification tint)
 */

const { logger } = require('../../utils/logger');

/**
 * Print post-generation output.
 * @param {Object} opts
 * @param {string} opts.projectType - 'alloy' | 'classic' | 'unknown'
 * @param {string} opts.projectRoot
 * @param {string} opts.stagingRoot
 * @param {string} opts.bgColor
 * @param {number} opts.padding
 * @param {number} opts.iosPadding
 * @param {boolean} opts.withSplash
 * @param {boolean} opts.withNotification
 * @param {boolean} opts.inPlace
 * @param {boolean} opts.fullNotes - if true, print the long tiapp.xml snippets
 */
function printPostGenNotes(opts) {
  if (opts.fullNotes) {
    printFullNotes(opts);
  } else {
    printCompactSummary(opts);
  }
}

/**
 * Compact default output — one line per category + Next steps + a hint that
 * full notes are available via `--notes`.
 */
function printCompactSummary(opts) {
  const { projectType, projectRoot, stagingRoot, bgColor, padding, iosPadding, inPlace } = opts;

  console.log();
  console.log('Summary');
  console.log(`  Background:   ${bgColor}   Padding: Android ${padding}% / iOS ${iosPadding}%`);
  console.log(`  ${inPlace ? 'Written in place to' : 'Staged at'}: ${inPlace ? projectRoot : stagingRoot}`);
  console.log();

  console.log('Next steps');
  if (inPlace) {
    console.log('  • Preview the new icons in Preview.app.');
    console.log('  • If something looks wrong: git checkout -- .');
    console.log('  • Rebuild: ti clean && ti build -p android -T emulator');
  } else if (projectType === 'alloy') {
    console.log('  • Preview in Preview.app, then copy to project:');
    console.log(`      cp ${stagingRoot}/{DefaultIcon,DefaultIcon-ios,iTunesConnect,MarketplaceArtwork}.png ${projectRoot}/`);
    console.log(`      cp -R ${stagingRoot}/app/platform/android/res/. ${projectRoot}/app/platform/android/res/`);
    console.log(`  • Cleanup staging: rm -rf ${stagingRoot}`);
  } else if (projectType === 'classic') {
    console.log('  • Preview in Preview.app, then copy to project:');
    console.log(`      cp ${stagingRoot}/{DefaultIcon,DefaultIcon-ios,iTunesConnect,MarketplaceArtwork}.png ${projectRoot}/`);
    console.log(`      cp -R ${stagingRoot}/platform/android/res/. ${projectRoot}/platform/android/res/`);
    console.log(`  • Cleanup staging: rm -rf ${stagingRoot}`);
  } else {
    console.log(`  • Review ${stagingRoot}/ and copy files to their final paths manually.`);
  }
  console.log();
  logger.info('Pass --notes to print tiapp.xml snippets + padding tuning guide.');
  console.log();
}

/**
 * Full notes — the long-form output with tiapp.xml snippets for every
 * optional piece (iOS launch storyboard, Android launcher, Android 12+ splash
 * theme, FCM notification). This is what `--notes` prints.
 */
function printFullNotes(opts) {
  const {
    projectType, projectRoot, stagingRoot,
    bgColor, padding, iosPadding, withSplash, withNotification, inPlace
  } = opts;

  console.log();
  console.log('Notes on what was generated');
  console.log();
  console.log(`  • Brand color ${bgColor} was baked into Android adaptive background layer`);
  console.log('    and iOS/marketplace flattened masters (Apple rejects alpha).');
  console.log(`  • Android padding:  ${padding}%  (logo fills ${100 - 2 * padding}% of each mipmap canvas)`);
  console.log(`  • iOS padding:      ${iosPadding}%  (logo fills ${100 - 2 * iosPadding}% of DefaultIcon-ios and marketplace art)`);
  console.log();
  console.log('  If the logo looks cramped: re-run with higher padding');
  console.log('      --padding 25-30       (Android)');
  console.log('      --ios-padding 10-14   (iOS)');
  console.log();
  console.log('  If the logo looks too small: re-run with lower padding');
  console.log('      --padding 19          (Android spec floor)');
  console.log('      --ios-padding 2-3     (matches first-party apps like Mail, Safari)');

  console.log();
  console.log('Configuration reminders');
  console.log('  The tool does NOT auto-edit tiapp.xml. Snippets below are optional —');
  console.log('  paste only what you need, after reviewing.');
  console.log();
  console.log('  ⚠  tiapp.xml <application> tag may be self-closing');
  console.log('     If yours looks like:');
  console.log('         <application android:icon="@mipmap/ic_launcher" .../>');
  console.log('     You must expand it BEFORE adding children:');
  console.log('         <application android:icon="@mipmap/ic_launcher" ...>');
  console.log('         </application>');

  console.log();
  console.log('  1. iOS launch background — under <ios> in tiapp.xml:');
  console.log('     Matches your --bg-color to the launch storyboard.');
  console.log('      <ios>');
  console.log('        <enable-launch-screen-storyboard>true</enable-launch-screen-storyboard>');
  console.log(`        <default-background-color>${bgColor}</default-background-color>`);
  console.log('      </ios>');

  console.log();
  console.log('  2. Android launcher icon — under <android><manifest><application>:');
  console.log('      <application android:icon="@mipmap/ic_launcher"');
  console.log('                   android:usesCleartextTraffic="false"/>');

  if (withSplash) {
    console.log();
    console.log('  3. Android 12+ splash screen — OPTIONAL, advanced');
    console.log();
    console.log('     Titanium SDK 13.x shows a system splash automatically using your');
    console.log('     launcher icon. For most apps THE DEFAULT IS ENOUGH — do nothing.');
    console.log();
    console.log('     If you experience a visible FLICKER at the end of the splash (brief');
    console.log('     color flash before index.js renders), that is the system splash');
    console.log('     background mismatching your first Titanium activity background.');
    console.log();
    console.log('     Fixing it requires adding a custom theme + wiring it in tiapp.xml.');
    console.log('     This is INVASIVE — do NOT auto-apply the snippet below without:');
    console.log('       (a) verifying the parent theme you pick actually exists in your');
    console.log('           Titanium SDK version (theme names vary across SDK releases)');
    console.log('       (b) checking whether your project already has a custom theme —');
    console.log('           if so, EXTEND it instead of overriding via android:theme');
    console.log('       (c) testing the build succeeds before committing tiapp.xml');
    console.log();
    console.log('     Template (verify parent theme exists in your SDK before using):');
    console.log('       <!-- app/platform/android/res/values/splash_theme.xml -->');
    console.log('       <?xml version="1.0" encoding="utf-8"?>');
    console.log('       <resources>');
    console.log('         <style name="Theme.App.Splash" parent="@style/YOUR_APP_PARENT_THEME">');
    console.log(`           <item name="android:windowSplashScreenBackground">${bgColor}</item>`);
    console.log('           <item name="android:windowSplashScreenAnimatedIcon">@mipmap/ic_launcher</item>');
    console.log('         </style>');
    console.log('       </resources>');
    console.log();
    console.log('     Known-working parent (confirmed in Titanium SDK 13.2.0):');
    console.log('       @style/Theme.Titanium.Light.Fullscreen');
    console.log();
    console.log('     If your SDK does not expose Theme.Titanium.Light.Fullscreen, check');
    console.log('     the styles.xml shipped with your installed SDK under the android/');
    console.log('     folder — the available parent themes vary across SDK versions.');
    console.log();
    console.log('     ⚠  Do NOT inherit from @android:style/Theme.DeviceDefault.NoActionBar.');
    console.log('        That parent strips the ActionBar from every screen in your app.');
    console.log();
    console.log('     The splash_icon.png × 5 files are generated for advanced use (custom');
    console.log('     splash icon distinct from launcher). Most apps do NOT need them —');
    console.log('     Titanium falls back to the launcher icon for the system splash.');
  }

  if (withNotification) {
    const colorsDir = projectType === 'classic'
      ? 'platform/android/res/values'
      : 'app/platform/android/res/values';

    console.log();
    console.log('  4. FCM notification icon + tint');
    console.log('     Only needed if you use firebase.cloudmessaging for push.');
    console.log();
    console.log(`     Create ${colorsDir}/colors.xml (or merge):`);
    console.log('       <?xml version="1.0" encoding="utf-8"?>');
    console.log('       <resources>');
    console.log(`         <color name="notification_tint">${bgColor}</color>`);
    console.log('       </resources>');
    console.log();
    console.log('     Then under <application> in tiapp.xml:');
    console.log('       <meta-data android:name="com.google.firebase.messaging.default_notification_icon"');
    console.log('                  android:resource="@drawable/ic_stat_notify"/>');
    console.log('       <meta-data android:name="com.google.firebase.messaging.default_notification_color"');
    console.log('                  android:resource="@color/notification_tint"/>');
  }

  console.log();
  console.log('Next steps');
  console.log();

  if (inPlace) {
    console.log('  1. Preview the new icons in Preview.app — the files in your project');
    console.log('     have been overwritten directly (no staging directory was used).');
    console.log('  2. If something looks wrong, restore from git:  git checkout -- .');
    console.log('  3. Rebuild:           ti clean && ti build -p android -T emulator');
  } else if (projectType === 'alloy') {
    console.log('  1. Preview the generated icons in Preview.app or your file manager.');
    console.log('  2. If good, copy to project:');
    console.log(`       cp ${stagingRoot}/DefaultIcon.png ${stagingRoot}/DefaultIcon-ios.png ${stagingRoot}/iTunesConnect.png ${stagingRoot}/MarketplaceArtwork.png ${projectRoot}/`);
    console.log(`       cp -R ${stagingRoot}/app/platform/android/res/. ${projectRoot}/app/platform/android/res/`);
    console.log(`  3. Cleanup staging:   rm -rf ${stagingRoot}`);
    console.log('  4. Rebuild:           ti clean && ti build -p android -T emulator');
  } else if (projectType === 'classic') {
    console.log('  1. Preview the generated icons in Preview.app or your file manager.');
    console.log('  2. If good, copy to project:');
    console.log(`       cp ${stagingRoot}/DefaultIcon.png ${stagingRoot}/DefaultIcon-ios.png ${stagingRoot}/iTunesConnect.png ${stagingRoot}/MarketplaceArtwork.png ${projectRoot}/`);
    console.log(`       cp -R ${stagingRoot}/platform/android/res/. ${projectRoot}/platform/android/res/`);
    console.log(`  3. Cleanup staging:   rm -rf ${stagingRoot}`);
    console.log('  4. Rebuild:           ti clean && ti build -p android -T emulator');
  } else {
    console.log('  1. Review staging dir and copy files to their final paths manually.');
    console.log(`  2. Cleanup staging:   rm -rf ${stagingRoot}`);
  }
  console.log();
}

module.exports = { printPostGenNotes };
