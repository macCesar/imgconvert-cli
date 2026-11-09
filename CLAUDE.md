# CLAUDE.md

Repository guidance for Claude Code (claude.ai/code).

## Project overview

`imgconvert-cli` is a Node.js CLI tool for image compression, conversion, and resizing using the Sharp library. It supports batch processing, multiple formats (JPEG, PNG, WebP, AVIF, TIFF, GIF), and includes specialized presets for mobile app development with Titanium Alloy.

## Development commands

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

# Select tests for the changed behavior first
npm run test:help
npm run test:general -- --grep "Batch renaming"

# See test/README.md for suites and cleanup side effects.
# test:unit/test:integration/test:all currently reference absent directories.
```

### Code quality

The checkout has no ESLint configuration. See `test/README.md` for an explicit syntax-check command; `npm run lint` needs project rules before it can run normally.

```bash
# Lint JavaScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Cleanup

These commands also remove root config and potentially valuable `app/`, `output/`, and matching preset folders. Inspect paths before running.

```bash
# Remove all generated files and directories
npm run clean

# Alternative cleanup command
npm run clean-all

# Force cleanup including node_modules cache
npm run clean-force
```

## Architecture overview

### Entry points
- `index.js` - Main executable entry point (#!/usr/bin/env node)
- `src/index.js` - Application orchestrator and main flow control

### Module structure
```
src/
├── cli/           # Command line interface
│   ├── program.js # Active Commander v3 command/option definitions
│   ├── commands/  # General, brand, alloy, config, help, completions handlers
│   ├── parser.js  # Legacy parser; not the active v3 CLI entry
│   └── help.js    # Help system and usage information
├── config/        # Configuration management
│   ├── defaults.js # Default values, presets, constants
│   ├── loader.js   # Config file loading and creation
│   └── precedence.js # Shared CLI > preset > config > default resolution
├── processors/    # Image processing engines
│   ├── image.js   # General image processing with Sharp
│   ├── alloy.js   # Legacy internal router, retained for older callers
│   ├── alloy-legacy.js # Active v3 alloy multi-scale processor
│   ├── alloy-modern/ # Shared branding generators used by v3 brand
│   └── scaling.js # Image scaling utilities
└── utils/         # Utility modules
    ├── logger.js  # Logging with Chalk for colored output
    ├── sorting.js # Natural sorting for file processing
    └── validation.js # Input validation and path handling
```

### Architecture patterns

Configuration Precedence System (4 levels):
1. CLI Arguments (highest priority)
2. Preset Settings
3. Global Config (`.imgconverter.config.json`)
4. Default Values (lowest priority)

Preset System:
- Root conversion presets: `web`, `print`, `thumbnail`
- `alloy` reads platform definitions from `presets.alloy`; `brand` uses CLI flags.
- Legacy `alloy`/`ti-branding` preset entries remain in generated config but root conversion does not route to their processors.
- Custom user presets in `.imgconverter.config.json`
- Special Alloy preset with dual format support (legacy and multi-configuration)

Processing Flow:
1. CLI argument parsing and validation (`cli/program.js` and `cli/commands/`)
2. Configuration loading and precedence application (`config/loader.js`, `config/precedence.js`)
3. Input validation (`utils/validation.js`)
4. Command handler selects `processors/image.js`, `processors/alloy-legacy.js`, or `processors/alloy-modern/index.js`
5. Sharp-based image processing with error handling

### Alloy configuration
The Alloy preset handles Titanium mobile app development with two configuration formats:

Legacy Format: Single android/iphone configuration
Multi-Configuration Format: Multiple asset groups (cards, thumbs, icons) with independent settings

Fixed scale factors per Titanium standards:
- Android: res-mdpi (1x), res-hdpi (1.5x), res-xhdpi (2x), res-xxhdpi (3x), res-xxxhdpi (4x)
- iPhone: 1x, 2x, 3x

## Testing

- General conversion tests: `test/general.test.js` - Comprehensive CLI integration tests
- Main test timeout: 300 seconds; targeted npm scripts have their own limits
- Test images: Located in `images/` directory
- Verbose mode: Set `VERBOSE_TESTS=true` for detailed test output
- Test execution: Uses `execSync` to run actual CLI commands to test the CLI

## Configuration

Config location: `.imgconverter.config.json` in the current working directory (no parent/input-directory discovery)

Key configuration aspects:
- Supports both global defaults and preset-specific settings
- Alloy preset can define per-platform settings (android/iphone)
- Multi-configuration support for complex mobile app workflows
- Source and output path management per configuration

## Dependencies

- sharp: Core image processing (formats, quality, resizing, cropping)
- commander: Active v3 CLI parsing and subcommands
- fast-xml-parser: Titanium cleanup configuration analysis
- update-notifier: Optional best-effort update notification
- chalk: Terminal output styling and colors
- mocha/chai/sinon: Testing framework (dev dependencies)
- eslint: Code linting (dev dependency)

## File processing

Batch Processing: Processes immediate supported files with natural sorting; not recursive
Extension Preservation: Maintains original extensions when no format conversion specified
Output Management: Single input uses sibling `converted/`; directory input uses sibling `<source>-converted/`. Relative output resolves beside source. `--replace` is currently incomplete and still writes to the output directory.
Error Handling: Skips unsupported files and logs processing errors

## Development notes

- Package engines still says Node 14, but Sharp/Commander require newer Node; see README installation requirements.
- Uses Sharp's internal 'jpeg' format but preserves user-friendly '.jpg' extensions
- Immutable scale factors for Alloy preset ensure Titanium compatibility
- Commander validates options; `cli/legacy-shims.js` rewrites numeric `-h` and bare `config` with deprecation warnings.
- Use `--width`/`--height`; `-w` is absent and `-h` means help.
- README known limitations documents Alloy output/preset wiring, ignored JSON canvas, and incomplete replacement behavior.
- Debug mode (`-d`) provides detailed processing information and timing

## Project state

- `docs/project/requirements.md`: what the system must do
- `docs/project/context.md`: architecture, documentation map, and conventions
- `docs/project/decisions.md`: decisions and their reasons
- `docs/project/status.md`: current work, verification, and next steps

Read `status.md` when resuming work. Do not import it at startup.

@docs/project/requirements.md
@docs/project/context.md
@docs/project/decisions.md
