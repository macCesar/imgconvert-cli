# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
