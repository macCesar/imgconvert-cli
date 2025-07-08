# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`imgconvert-cli` is a Node.js CLI tool for image compression, conversion, and resizing using the Sharp library. It supports batch processing, multiple formats (JPEG, PNG, WebP, AVIF, TIFF, GIF), and includes specialized presets for mobile app development with Titanium Alloy.

## Development Commands

### Testing
```bash
# Run main test suite (comprehensive CLI integration tests)
npm test

# Run tests with verbose output and detailed logging
npm run test:verbose

# Watch mode for continuous testing during development
npm run test:watch

# Debug tests with Node.js inspector
npm run test:debug

# Run unit tests only (if they exist)
npm run test:unit

# Run integration tests only (if they exist)
npm run test:integration

# Run all test types
npm run test:all

# Clean test artifacts and run tests
npm run test:clean
```

### Code Quality
```bash
# Lint JavaScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Cleanup
```bash
# Remove all generated files and directories
npm run clean

# Alternative cleanup command
npm run clean-all

# Force cleanup including node_modules cache
npm run clean-force
```

## Architecture Overview

### Entry Points
- `index.js` - Main executable entry point (#!/usr/bin/env node)
- `src/index.js` - Application orchestrator and main flow control

### Core Modules Structure
```
src/
├── cli/           # Command line interface
│   ├── parser.js  # Argument parsing with minimist, precedence handling
│   └── help.js    # Help system and usage information
├── config/        # Configuration management
│   ├── defaults.js # Default values, presets, constants
│   └── loader.js   # Config file loading and creation
├── processors/    # Image processing engines
│   ├── image.js   # General image processing with Sharp
│   ├── alloy.js   # Titanium Alloy mobile app asset generation
│   └── scaling.js # Image scaling utilities
└── utils/         # Utility modules
    ├── logger.js  # Logging with Chalk for colored output
    ├── sorting.js # Natural sorting for file processing
    └── validation.js # Input validation and path handling
```

### Key Architectural Patterns

**Configuration Precedence System** (4 levels):
1. CLI Arguments (highest priority)
2. Preset Settings
3. Global Config (`.imgconverter.config.json`)
4. Default Values (lowest priority)

**Preset System**:
- Built-in presets: `web`, `print`, `thumbnail`, `alloy`
- Custom user presets in `.imgconverter.config.json`
- Special Alloy preset with dual format support (legacy and multi-configuration)

**Processing Flow**:
1. CLI argument parsing and validation (`cli/parser.js`)
2. Configuration loading and precedence application (`config/loader.js`)
3. Input validation (`utils/validation.js`)
4. Route to appropriate processor (`processors/image.js` or `processors/alloy.js`)
5. Sharp-based image processing with error handling

### Alloy Preset Architecture
The Alloy preset handles Titanium mobile app development with two configuration formats:

**Legacy Format**: Single android/iphone configuration
**Multi-Configuration Format**: Multiple asset groups (cards, thumbs, icons) with independent settings

Fixed scale factors per Titanium standards:
- **Android**: res-mdpi (1x), res-hdpi (1.5x), res-xhdpi (2x), res-xxhdpi (3x), res-xxxhdpi (4x)
- **iPhone**: 1x, 2x, 3x

## Testing Architecture

- **Main test file**: `test/simple.test.js` - Comprehensive CLI integration tests
- **Test timeout**: 120 seconds (handles large image processing)
- **Test images**: Located in `images/` directory
- **Verbose mode**: Set `VERBOSE_TESTS=true` for detailed test output
- **Test execution**: Uses `execSync` to run actual CLI commands for real-world testing

## Configuration Management

**Default config location**: `.imgconverter.config.json` in project root

**Key configuration aspects**:
- Supports both global defaults and preset-specific settings
- Alloy preset can define per-platform settings (android/iphone)
- Multi-configuration support for complex mobile app workflows
- Source and output path management per configuration

## Dependencies and Libraries

- **sharp**: Core image processing (formats, quality, resizing, cropping)
- **minimist**: CLI argument parsing with alias support
- **chalk**: Terminal output styling and colors
- **mocha/chai/sinon**: Testing framework (dev dependencies)
- **eslint**: Code linting (dev dependency)

## File Processing Patterns

**Batch Processing**: Processes entire directories with natural sorting
**Extension Preservation**: Maintains original extensions when no format conversion specified
**Output Management**: Creates `converted/` subdirectory by default unless `--replace-originals` or custom output specified
**Error Handling**: Graceful handling of non-image files and processing errors

## Development Notes

- Node.js 14+ required (specified in engines)
- Uses Sharp's internal 'jpeg' format but preserves user-friendly '.jpg' extensions
- Immutable scale factors for Alloy preset ensure Titanium compatibility
- CLI uses `unknown` option handler to catch and report invalid arguments
- Debug mode (`-d`) provides detailed processing information and timing