# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.5] - 2025-07-08

### Added
- Auto-trim functionality with `--trim` flag to automatically remove transparent borders
- Enhanced debug mode with colored output, emojis, and better formatting
- Canvas resize functionality now properly extends canvas without scaling the image

### Fixed
- Fixed canvas mode to use Sharp's `extend()` instead of `resize()` for proper canvas extension
- Improved position validation to handle undefined positions gracefully
- Enhanced debug logger with cyan color and emoji support for better readability

### Changed
- Debug mode now shows processing steps with visual indicators (📂, ✂️, 🖼️, 📏)
- Removed [DEBUG] prefix from debug output for cleaner console experience
- Updated help documentation to include new `--trim` option and examples

## [1.7.4] - 2025-06-10

### Added
- Position control for canvas mode: `--canvas --position top/bottom/left/right` now works

### Fixed
- Fixed position parameter not working due to incorrect Sharp gravity mapping
- Fixed transparent background not applied by default for `--fit contain` operations on PNG/WebP/AVIF

## [1.7.3] - 2025-06-05

### Fixed
- Fixed cryptic error when using invalid command-line options
- Invalid options now show clear error message with suggestion to run `--help`

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
- Enhanced test coverage with optimized test assets
- Complete CLI restructure with modular architecture

## [1.4.1] - 2025-06-01

### Fixed
- Fixed temporary file naming conflicts during batch processing
- Multiple image processing with format flag now works correctly

## [1.4.0] - 2025-06-01

### Added
- Smart crop positioning (`--position`) for cover mode
- Manual cropping (`--crop`) with precise coordinate control
- Fit strategies (`--fit`) with cover, contain, fill, inside, outside options

## [1.3.1] - 2025-05-31

### Added
- Selective configuration processing for alloy preset using `alloy:configName` syntax
- Enhanced error handling with configuration validation

## [1.3.0] - 2025-05-31

### Added
- Multi-configuration support for alloy preset
- Independent source/output management per configuration group
- Fixed scale factors as immutable Titanium standards

## [1.2.1] - 2025-05-31

### Improved
- Enhanced alloy preset handling with multiple sources support
- Added warnings when width/height parameters are used with alloy preset

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
