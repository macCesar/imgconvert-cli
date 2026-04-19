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
    const splashDir = projectType === 'classic'
      ? 'platform/android/res/values'
      : 'app/platform/android/res/values';

    console.log();
    console.log('  3. Android 12+ splash screen — RECOMMENDED: match Titanium activity theme');
    console.log();
    console.log('     Titanium SDK 13.x shows a system splash using your launcher icon on');
    console.log('     Android 12+. If the system splash background does NOT match your first');
    console.log('     Titanium activity background, you get a visible FLICKER at the end of');
    console.log('     the splash (navy → white → content) right before index.js renders.');
    console.log();
    console.log('     Fix: define a custom theme that INHERITS from a Titanium parent theme');
    console.log('     and applies to the whole application. This keeps the ActionBar intact');
    console.log('     while synchronizing the splash background with the activity background.');
    console.log();
    console.log(`     Create ${splashDir}/splash_theme.xml:`);
    console.log('       <?xml version="1.0" encoding="utf-8"?>');
    console.log('       <resources>');
    console.log('         <style name="Theme.App.Splash" parent="@style/Theme.Titanium.Light.NoTitle">');
    console.log(`           <item name="android:windowSplashScreenBackground">${bgColor}</item>`);
    console.log('           <item name="android:windowSplashScreenAnimatedIcon">@mipmap/ic_launcher</item>');
    console.log('         </style>');
    console.log('       </resources>');
    console.log();
    console.log('     Then in tiapp.xml under <android><manifest>:');
    console.log('       <application android:icon="@mipmap/ic_launcher"');
    console.log('                    android:theme="@style/Theme.App.Splash"');
    console.log('                    android:usesCleartextTraffic="false"/>');
    console.log();
    console.log('     Parent theme options (pick per your ActionBar needs):');
    console.log('       @style/Theme.Titanium.Light            — ActionBar + title bar');
    console.log('       @style/Theme.Titanium.Light.NoTitle    — ActionBar, no title (common)');
    console.log('       @style/Theme.Titanium.Light.Fullscreen — no ActionBar, no status bar');
    console.log('       (plus Dark variants)');
    console.log();
    console.log('     ⚠  Inherit ONLY from Titanium parents (Theme.Titanium.*). Do NOT');
    console.log('        inherit from @android:style/Theme.DeviceDefault.NoActionBar on');
    console.log('        <application> — that strips the ActionBar from every screen.');
    console.log();
    console.log('     The splash_icon.png × 5 files generated in drawable-* are OPTIONAL —');
    console.log('     the theme above points windowSplashScreenAnimatedIcon at the launcher');
    console.log('     icon, which is usually what you want. Point it at @drawable/splash_icon');
    console.log('     only if you designed a distinct custom splash icon.');
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
