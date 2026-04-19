# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2026-04-18

### Fixed — post-gen Android splash guidance

The `--notes` output previously said:
> ⚠ CRITICAL: NEVER set android:theme="..." on `<application>` or any `<activity>`.

This was overly absolute. The rule is narrower: don't inherit from
`@android:style/Theme.DeviceDefault.NoActionBar` (that strips the ActionBar).
Inheriting from a Titanium parent theme (`Theme.Titanium.Light`,
`.Light.NoTitle`, `.Light.Fullscreen`, plus Dark variants) keeps the ActionBar
and IS the recommended approach to prevent the end-of-splash flicker that
happens when Android's SplashScreen API transitions to Titanium's activity
with a mismatched background color.

The `--notes` output now:
- Explains the flicker cause (color mismatch between system splash and Ti activity)
- Recommends the Titanium-parent-theme approach as the primary fix
- Lists the available Titanium parent themes
- Keeps the narrower warning (don't inherit from Android's NoActionBar parent)

Reference: the production app "LM - La Baraja" uses this exact pattern
(`Theme.Titanium.Light.Fullscreen` parent + `windowSplashScreenBackground`
matching the activity background) with zero flicker on Android 12+.

### Changed — default `--ios-padding` lowered from 8% to 4%

Per Apple's HIG and production app measurements (La Baraja, Mail, Safari,
WhatsApp, most popular apps), iOS app icons typically fill 92-97% of the
canvas. Our previous default of 8% per side (84% fill) was noticeably more
conservative than industry standard. iOS icons have no launcher mask, so
there's no cropping risk — the padding is purely aesthetic breathing room.

New default 4% per side → 92% fill matches Apple's own apps. Override with
`--ios-padding 2` (aggressive, matches La Baraja's 1.6%) or `--ios-padding 8`
(previous default) when needed.

This change affects: DefaultIcon.png, DefaultIcon-ios.png, iTunesConnect.png,
MarketplaceArtwork.png. Android adaptive padding (`--padding`) stays at 20%
(Material spec, unchanged).

## [2.0.0] - 2026-04-18

### Added — Modern Titanium branding pipeline (Alloy + Classic)

Introduces a new `ti-branding` preset (and extends `--preset alloy --modern` as
a backward-compatible alias) — a complete modern branding generator for
Titanium SDK 13.x projects that works on both Alloy and Classic layouts. Pairs
with any of the new flags below to emit a full asset set from a single SVG or
PNG master, matching what `titanium` / `alloy new` ships out of the box plus
everything a production app needs on Android.

The preset name matches the [TiTools `ti-branding` skill](https://github.com/macCesar/titools/tree/main/skills/ti-branding)
so Claude Code users and npm CLI users converge on the same feature name.
Auto-detects `app/` (Alloy) vs `Resources/` (Classic) layout and adjusts the
Android output paths automatically (`app/platform/android/res/...` vs
`platform/android/res/...`).

- `-p ti-branding` — new preset name, preferred over `-p alloy --modern`. Always routes to the modern pipeline; no sub-flags defaults to kitchen-sink (adaptive + marketplace + notification + splash).
- `--modern` — kitchen-sink flow when used with `-p alloy` (backward-compatible alias for `-p ti-branding`)
- `--adaptive` — Android adaptive icon triplet (foreground + background + monochrome) × 5 densities + legacy `ic_launcher.png` × 5 + `mipmap-anydpi-v26/ic_launcher.xml` binder
- `--marketplace` — `iTunesConnect.png` (1024²) + `MarketplaceArtwork.png` (512²), both with alpha preserved (matches Titanium defaults)
- `--notification` — Android notification icons (white on transparent) × 5 densities at `drawable-*/ic_stat_notify.png`
- `--splash` — Android 12+ SplashScreen API icons × 5 densities
- `--bg-color <hex>` — background for Android adaptive + iOS alpha flatten (default `#FFFFFF`). **New behavior:** when explicitly provided, also flattens `iTunesConnect.png` + `MarketplaceArtwork.png` on the given color (prevents dark-mode muddy appearance on Play Store / macOS App Store when the master logo has transparent areas). When NOT provided, the two marketplace files keep alpha to match `ti create` default.
- `--monochrome-master <path>` — optional dedicated silhouette master for `ic_launcher_monochrome.png` (Android 13+ themed icons) and `ic_stat_notify.png` (notification status bar). When provided, these two outputs use the dedicated master instead of naively whitening the colored main master. Useful for logos with multi-color detail (e.g. a painter's palette with 4 color dots) where a color→white flatten produces a featureless blob — you design a monochrome variant with cutout holes / negative space, and the detail survives in themed icons and notification.
- `--padding <pct>` — Android safe-zone padding per side (default `20`). Material Design spec floor is 19.44% (108dp canvas with 66dp keyline grid); the default of 20 sits just above the spec floor for a tiny buffer while keeping the logo visibly prominent. Previous pre-release drafts used 22%, which produced noticeably smaller logos (~6% less width at xxxhdpi) without real justification — the 2.5% "safety" margin didn't save any real-world logos from masking. 20% is the new recommended balance.
- `--ios-padding <pct>` — iOS / marketplace aesthetic padding per side (default `8`)
- `--cleanup-legacy` — context-aware cleanup using `tiapp.xml` analysis. Categorizes targets into SAFE, CONDITIONAL, and AGGRESSIVE buckets. Always prints the plan before deleting. Can run standalone (without a master) to just clean.
- `--aggressive` — includes ldpi density folders in cleanup (<1% global market)
- `--project <path>` — Titanium project root (default: cwd)
- `--in-place` — skip the default `.ti-branding/` staging directory and write files directly into the project root (overwrites existing icons). Pairs well with a fresh `ti create` project where you want to immediately replace the default Titanium/Alloy icons in one command, without the manual copy step. Prints an explicit warning and recommends committing first. `--output` takes precedence over `--in-place` when both are passed.
- `--notes` — opt-in to print the full tiapp.xml snippets, padding tuning guide, and platform-specific configuration reminders (iOS launch storyboard, Android launcher wiring, Android 12+ splash theme, FCM notification tint) after a successful run. Default output is a compact one-screen summary (~27 lines) with a pointer to `--notes`. Before this flag the full output (~100+ lines) was always printed, which buried the most important "next steps" information under reference-style documentation.
- `--dry-run` — show plan without writing files

Root-level icons emitted when a master is provided:
- `DefaultIcon.png` (1024², alpha preserved) — universal / Android
- `DefaultIcon-ios.png` (1024², alpha flattened on bg-color) — iOS (Apple rejects alpha)

This matches the output of a fresh `ti create` + `alloy new` project — alpha is
kept on `DefaultIcon.png`, `iTunesConnect.png`, and `MarketplaceArtwork.png`, and
only stripped on `DefaultIcon-ios.png`.

Auto-detects Alloy (`app/` directory) vs Classic (`Resources/`) project layouts.

### Changed
- `src/processors/alloy.js` is now a thin router that delegates to either
  `alloy-legacy.js` (the v1.x multi-scale 1x/2x/3x behavior) or
  `alloy-modern/` (the new pipeline), based on the presence of any modern flag.

### Backward compatibility
- `imgconvert --preset alloy` without any modern flag continues to emit the
  legacy 1x/2x/3x (iPhone) + mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi (Android) output
  exactly as v1.x did. **Not deprecated** — this is a distinct multi-scale
  feature with no modern replacement.

### Deprecated
- `--preset alloy` combined with any modern flag (`--modern`, `--adaptive`,
  `--marketplace`, `--notification`, `--splash`, `--cleanup-legacy`) prints
  a deprecation warning and will be removed in v3.0.0. Use
  `--preset ti-branding` instead — it's an exact drop-in replacement and
  the name accurately describes scope (works on both Alloy and Classic).
  Plain `--preset alloy` with no modern flags stays supported indefinitely.

### Dependencies
- Added `fast-xml-parser` (~18KB, no native bindings) for `tiapp.xml` parsing.
  Used only on the modern cleanup path; regex fallback kicks in if the dep is
  unavailable.

### Tests
- 36 new tests covering prepare-master, all generators, tiapp-reader,
  cleanup-legacy buckets, and CLI integration (kitchen sink + dry-run +
  sub-flag isolation).

## [1.7.9] - 2026-04-06

### Fixed
- Relative `-o` paths now resolve next to the source file/folder instead of the current working directory
- Applies to both general processing and the alloy preset

## [1.7.8] - 2026-04-04

### Added
- Show help when running `imgconvert` without any arguments

### Fixed
- Alloy preset output was relative to CWD, now it's relative to the input file
- Alloy preset ignored the `-o` flag
- Alloy preset detects Titanium projects (`tiapp.xml` in CWD) and writes to `app/assets/` automatically

### Changed
- Alloy output directory precedence: `-o` flag > Titanium project root (CWD with `tiapp.xml`) > input file's directory

## [1.7.7] - 2025-01-21

### Fixed
- Fixed cross-device link error when processing images on external drives

## [1.7.6] - 2025-08-27

### Changed
- Dependencies update

## [1.7.5] - 2025-07-08

### Added
- `--trim` flag to remove transparent borders
- Debug mode now has colored output and visual indicators
- Canvas resize extends the canvas without scaling the image

### Fixed
- Canvas mode was using Sharp's `resize()` instead of `extend()`
- Position validation crashed on undefined positions
- Debug logger readability (cyan color, emoji indicators)

### Changed
- Debug output uses visual step indicators (📂, ✂️, 🖼️, 📏) instead of [DEBUG] prefix
- Help documentation updated for `--trim`

## [1.7.4] - 2025-06-10

### Added
- Position control for canvas mode: `--canvas --position top/bottom/left/right` now works

### Fixed
- Position parameter didn't work (incorrect Sharp gravity mapping)
- `--fit contain` on PNG/WebP/AVIF wasn't applying transparent background by default

## [1.7.3] - 2025-06-05

### Fixed
- Invalid CLI options gave a cryptic error; now shows a clear message with `--help` suggestion

## [1.7.2] - 2025-06-05

### Changed
- Rename strategies now build filenames in visual left-to-right order
- `--rename "prefix:gallery-,enumerate"` now produces `gallery-001-photo.jpg` as expected

## [1.7.1] - 2025-06-04

### Added
- Natural numeric sorting for batch file processing
- Files with numeric names now process in logical order (1.png, 2.png, 10.png, 11.png)

## [1.7.0] - 2025-06-02

### Added
- Canvas resize mode with `--canvas` flag for preserving PNG transparency
- Maintains transparent background when enlarging images instead of black background

## [1.6.0] - 2025-06-01

### Added
- Batch renaming strategies with `--rename` option
- Custom file naming with `--name` option for single files
- Support for enumerate, lowercase, replace-spaces, prefix, and suffix strategies

## [1.5.0] - 2025-06-01

### Changed
- More test coverage with smaller test assets
- CLI restructured into modular architecture

## [1.4.1] - 2025-06-01

### Fixed
- Temporary file naming conflicts during batch processing
- Multiple images with `-f` flag weren't all getting converted

## [1.4.0] - 2025-06-01

### Added
- Smart crop positioning (`--position`) for cover mode
- Manual cropping (`--crop`) with precise coordinate control
- Fit strategies (`--fit`) with cover, contain, fill, inside, outside options

## [1.3.1] - 2025-05-31

### Added
- Selective configuration processing for alloy preset: `alloy:configName` syntax
- Better error messages when configuration is invalid

## [1.3.0] - 2025-05-31

### Added
- Multi-configuration support for alloy preset
- Independent source/output management per configuration group
- Fixed scale factors as immutable Titanium standards

## [1.2.1] - 2025-05-31

### Improved
- Alloy preset handles multiple sources per platform
- Warning when width/height are used with alloy preset (they're ignored)

## [1.2.0] - 2025-05-31

### Breaking Changes
- Removed `--environment` / `-e` flag
- Renamed `--replace` / `-r` to `--replace-originals`
- Changed default output directory from `compressed` to `converted`

## [1.1.5] and earlier
- Original implementation with environment modes
- Used `--replace` / `-r` flag
- Had development/production mode distinctions
- See git history for detailed changes in previous versions
