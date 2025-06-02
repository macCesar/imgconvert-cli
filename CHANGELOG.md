# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2025-06-01

### ✨ New Features - Custom File Naming and Batch Renaming

#### 🏷️ Custom File Naming
- **Single File Naming**: Added `--name, -n` option for custom filename when processing individual files
- **Simple Usage**: `imgconvert photo.jpg --name "hero-banner" -f webp` → `hero-banner.webp`
- **Format Preservation**: Custom names respect the target format extension

#### 🔄 Batch Renaming Strategies
- **Multiple Strategies**: Added `--rename` option with support for systematic batch renaming
- **Available Strategies**:
  - `enumerate`: Add sequential numbers with padding (`photo.jpg` → `001-photo.jpg`)
  - `lowercase`: Convert filenames to lowercase (`MyPhoto.JPG` → `myphoto.jpg`)
  - `replace-spaces`: Replace spaces with hyphens (`my photo.png` → `my-photo.png`)
  - `prefix:text`: Add custom prefix (`image.jpg` → `thumb-image.jpg`)
  - `suffix:text`: Add custom suffix (`image.jpg` → `image-small.jpg`)

#### 🔗 Strategy Combinations
- **Chainable Strategies**: Combine multiple strategies with comma separation
- **Predictable Processing**: Strategies applied in specified order for consistent results
- **Example**: `--rename "lowercase,replace-spaces,prefix:web-"` transforms "My Photo.JPG" → "web-my-photo.jpg"
- **Enumerate Format**: Sequential numbering uses padded prefix format (001-, 002-, 003-) for natural sorting

#### 🛡️ Enhanced Validation
- **Input Validation**: Prevents `--name` usage with directory inputs
- **Strategy Validation**: Validates rename strategy syntax and supported options
- **Error Handling**: Clear error messages for invalid combinations

#### 📚 Documentation Updates
- **Comprehensive Examples**: Added real-world usage examples in README
- **Integration Examples**: Showed combination with existing resize and format options
- **Use Case Scenarios**: E-commerce, content management, and web development examples

### 🔧 Technical Implementation
- **Parser Enhancement**: Extended CLI parser with new option support and validation
- **Image Processor Updates**: Integrated filename generation into core processing workflow
- **Help System**: Updated help documentation with detailed option descriptions and examples

## [1.5.0] - 2025-06-01

### 🏗️ Major Code Refactoring - Modular Architecture Implementation

#### 🎯 Complete CLI Restructure
Based on comprehensive code analysis (see `todo/imgconverter-analysis.md`), the entire codebase has been refactored from a monolithic 1000+ line single file into a clean, modular architecture following best practices and design patterns.

#### 📦 New Modular Structure
- **Maintainable Codebase**: Reduced complexity and improved code organization
- **Clean Architecture**: Implemented proper separation between CLI, business logic, and utilities
- **Separated Concerns**: Extracted monolithic `index.js` into focused, single-responsibility modules

```
src/
├── index.js             // Clean entry point
├── cli/
│   ├── parser.js        // Argument parsing logic
│   └── help.js          // Help display and documentation
├── config/
│   ├── loader.js        // Configuration loading and merging
│   └── defaults.js      // Default configuration values
├── processors/
│   ├── image.js         // Core image processing logic
│   ├── alloy.js         // Titanium Alloy-specific processing
│   └── scaling.js       // Image scaling and transformation operations
└── utils/
    ├── logger.js        // Centralized logging utilities
    └── validation.js    // Input validation and error handling
```

#### 🔧 Technical Improvements

##### Code Quality Enhancements
- **Eliminated Code Duplication**: Extracted common patterns into reusable utilities
- **Improved Error Handling**: Centralized error management with specific error types
- **Reduced Complexity**: Broke down complex functions into smaller, focused methods
- **Better Separation of Concerns**: Each module has a single, well-defined responsibility

##### Design Patterns Implementation
- **Logger Pattern**: Centralized logging with different severity levels
- **Factory Pattern**: `ImageProcessorFactory` for format-specific processors
- **Strategy Pattern**: Modular processing strategies for different image operations
- **Configuration Pattern**: Enhanced config loading with proper precedence handling

##### Performance Optimizations
- **Better Resource Management**: Improved cleanup and resource disposal
- **Optimized Imports**: Reduced startup time with selective module loading
- **Enhanced Concurrency**: Better async operation handling across modules
- **Modular Loading**: Only load required modules, reducing memory footprint

#### 🚀 Architecture Benefits

##### Maintainability
- **Testability**: Isolated modules are easier to unit test
- **Readability**: Clear module boundaries and naming conventions
- **Single Responsibility**: Each module focuses on one specific aspect
- **Extensibility**: Easy to add new features without affecting existing code

##### Developer Experience
- **IDE Support**: Better IntelliSense and code navigation
- **Consistent Patterns**: Unified coding patterns across all modules
- **Better Documentation**: Each module has clear purpose and API
- **Clear Entry Points**: Easy to understand where functionality is implemented

##### Scalability
- **Independent Modules**: Can be developed and tested in isolation
- **Clear Dependencies**: Explicit module dependencies and interfaces
- **Plugin Architecture Ready**: Modular structure supports future plugin system
- **Future-Proof**: Architecture supports TypeScript migration and advanced features

#### 📋 Refactoring Details

##### CLI Module (`src/cli/`)
- **parser.js**: Extracted argument parsing logic from main file
- **help.js**: Centralized help documentation and command descriptions
- **Benefits**: Cleaner CLI interface, easier to maintain help content

##### Configuration Module (`src/config/`)
- **defaults.js**: Default values and configuration schemas
- **loader.js**: Configuration file loading and preset management
- **Benefits**: Centralized config logic, better precedence handling

##### Processors Module (`src/processors/`)
- **alloy.js**: Titanium Alloy-specific multi-platform processing
- **image.js**: Core Sharp-based image processing operations
- **scaling.js**: Image scaling, resizing, and transformation logic
- **Benefits**: Isolated processing logic, easier to extend and test

##### Utils Module (`src/utils/`)
- **logger.js**: Centralized logging with chalk-based formatting
- **validation.js**: Input validation and error checking utilities
- **Benefits**: Reusable utilities, consistent error handling

#### 🔄 Backward Compatibility
- **Same API**: Public interface remains identical for end users
- **Preset Functionality**: All presets maintain their original behavior
- **Configuration Compatibility**: Existing config files continue working
- **No Breaking Changes**: All existing CLI commands and options work unchanged

#### 🎯 Code Quality Metrics Improved
- **Lines per Function**: Average function length significantly reduced
- **Code Duplication**: Eliminated repeated patterns through shared utilities
- **Maintainability Index**: Significantly improved through modular structure
- **Cyclomatic Complexity**: Reduced from high complexity to manageable levels

#### 📚 Documentation and Standards
- **Code Examples**: Internal documentation with usage patterns
- **JSDoc Comments**: Comprehensive documentation for all public APIs
- **Consistent Naming**: Unified naming conventions across all modules
- **Clear Module Interfaces**: Well-defined inputs and outputs for each module

#### 🛠️ Implementation Highlights
- **Error Boundaries**: Proper error isolation between modules
- **Resource Management**: Improved cleanup and memory management
- **Async Patterns**: Consistent async/await usage throughout codebase
- **Dependency Injection**: Modules accept dependencies for better testability

#### 💡 Future Development Ready
This refactoring establishes a solid foundation for future enhancements:
- **Plugin System**: Architecture ready for extensible plugin development
- **Advanced Features**: Easy integration of new image processing capabilities
- **TypeScript Migration**: Modular structure supports gradual TypeScript adoption
- **Testing Framework**: Structure supports comprehensive unit and integration testing

### 🔄 Migration Notes
- **For Maintainers**: Significantly improved codebase maintainability
- **For Contributors**: Clear module boundaries make contributions easier
- **For End Users**: No changes required - all commands work exactly as before
- **For Developers**: New modular structure provides better development experience

### 🧪 Test Suite Enhancements
- **Enhanced Test Coverage**: Added comprehensive tests for the new modular architecture
- **Test Image Optimization**: Optimized test images for faster test execution and reduced repository size
- **Descriptive Test Assets**: Renamed test images with descriptive names for better test clarity
- **GIF Format Testing**: Added GIF format testing capability with new test.gif asset
- **100% Test Success Rate**: All 49 tests pass successfully with the new modular structure

### 🖼️ Test Asset Optimization and Clarity
- **Image Size Optimization**: Reduced test images from 2000x1332px to ~1000px width for faster processing
- **File Size Reduction**: Optimized test assets from ~1.5MB each to ~200-500KB for improved performance
- **Descriptive Naming**: Renamed test images for better clarity:
  - `image.jpg` → `canyon-river.jpg` (descriptive canyon with river scene)
  - `image.png` → `mountain-lake.png` (descriptive mountain with lake scene)
  - Added `test.gif` for comprehensive format testing
- **Documentation Updated**: Enhanced `images/README.md` with optimization details and asset information
- **Test Conflict Prevention**: Unique image names prevent naming conflicts during format conversion tests

## [1.4.1] - 2025-06-01

### 🐛 Bug Fixes

#### Fixed Multiple Image Processing with Format Flag
- **Issue**: When using format conversion flags (`-f jpg`, `-f webp`, etc.), only one image was processed from multiple input files due to temporary file naming conflicts
- **Root Cause**: Multiple images being processed to the same format created conflicting temporary file names (e.g., both `image.png` and `image.jpg` trying to create `/tmp/image.jpg`)
- **Solution**: Implemented unique temporary file naming using random IDs to prevent conflicts during batch processing
- **Technical Details**:
  - Added `Math.random().toString(36).substring(2, 15)` for unique temp file generation
  - Enhanced directory existence checks before file operations
  - Improved error handling for concurrent file processing

#### Improved Error Messages
- **Enhanced**: Better error reporting when multiple files fail during format conversion
- **Added**: Clear indication of which specific files failed processing
- **Fixed**: Proper cleanup of temporary files after processing errors

### 📚 Documentation Updates
- **Enhanced**: Added practical manual cropping examples to README Quick Start section
- **Added**: Real-world use cases for crop functionality in documentation
- **Improved**: Better examples showing the crop-first, resize-second workflow

### ✅ Testing
- **Verified**: `imgconvert images -f jpg` now processes all images in directory
- **Confirmed**: `imgconvert images -f webp` handles multiple files correctly
- **Tested**: Batch processing maintains file quality and naming consistency


## [1.4.0] - 2025-06-01

### ✨ Advanced Resize and Crop Control - Sharp Integration

#### 🎯 New Sharp-powered Options
- **Fit Strategies (`--fit`)**: Added comprehensive resize control with Sharp's fit strategies
  - `cover`: Crop to fill exact dimensions (maintains aspect ratio, crops excess)
  - `contain`: Fit inside dimensions preserving aspect ratio (default behavior)
  - `fill`: Stretch to fill exact dimensions (may distort image)
  - `inside`: Scale down to fit within bounds (never enlarges)
  - `outside`: Scale to cover at least the dimensions (may exceed bounds)

#### 🎨 Smart Crop Positioning (`--position`)
- **Intelligent Positioning**: Control which part of the image to keep when using `fit: cover`
- **Position Options**: `center` (default), `top`, `bottom`, `left`, `right`
- **Corner Positioning**: `"top left"`, `"top right"`, `"bottom left"`, `"bottom right"`
- **Perfect for Portraits**: Keep faces visible with `--position top`
- **Flexible Composition**: Ideal for hero images and product photography

#### ✂️ Manual Cropping (`--crop`)
- **Precise Control**: Extract specific regions using coordinates `left,top,width,height`
- **Crop-First Workflow**: Manual cropping applied before resizing for maximum control
- **Format**: `--crop 100,50,300,200` for pixel-perfect extractions
- **Use Cases**: Remove unwanted areas, focus on subjects, prepare for specific compositions

#### 🔧 Technical Implementation
- **Sharp Integration**: Native Sharp fit and gravity mappings for optimal performance
- **Precedence System**: CLI > Preset > Config > Default maintains existing behavior
- **Robust Validation**: Comprehensive error handling for crop coordinates and invalid values
- **Configuration Support**: All new options available in config files and presets
- **Minimist Compatibility**: Proper array handling for crop coordinates

#### 📊 Enhanced Presets
- **Updated Defaults**: Web and thumbnail presets now include smart fit strategies
- **Backward Compatibility**: Existing presets continue working without modification
- **New Preset Options**: Custom presets can now leverage all resize and crop capabilities

#### 💡 Practical Applications
- **E-commerce**: Consistent product thumbnails with `--fit cover --position center`
- **Profile Pictures**: Smart avatar cropping with `--fit cover --position top`
- **Hero Images**: Responsive banners with manual crop and cover fit
- **Social Media**: Perfect square posts from landscape images
- **Print Preparation**: Maintain aspect ratios with `--fit contain`

#### 📝 Examples
```bash
# Hero image with manual crop and smart resize
imgconvert hero.jpg --crop 0,100,1920,800 --fit cover -w 1200 -h 600 -f webp

# Profile pictures keeping faces visible
imgconvert portraits --fit cover --position top -w 200 -h 200 -f png

# Product thumbnails with consistent dimensions
imgconvert products --fit cover --position center -w 400 -h 400 -f webp -q 85

# Social media content from landscape images
imgconvert image.jpg --fit cover --position center -w 1080 -h 1080 -f jpeg
```

#### 🚀 User Experience Improvements
- **Enhanced Help**: Updated help message with comprehensive examples and usage patterns
- **Clear Documentation**: Detailed explanation of each fit strategy and position option
- **Workflow Guidance**: Best practices for different use cases and image types

### 🔄 Backward Compatibility
- **No Breaking Changes**: All existing functionality preserved and working
- **Default Behavior**: `--fit contain` maintains current resize behavior when not specified
- **Configuration Migration**: Existing config files work without modification
- **Preset Compatibility**: All existing presets continue functioning as before

## [1.3.1] - 2025-05-31

### ✨ Enhanced Alloy Preset - Selective Configuration Processing

#### 🎯 Specific Configuration Targeting
- **Selective Processing**: Added ability to process specific configurations within the alloy preset using the syntax `alloy:configName`
- **Improved Efficiency**: No longer need to regenerate ALL configurations when only specific ones are needed
- **Smart Filtering**: When using `alloy:comics` or `alloy:thumbs-baby`, only that specific configuration is processed

#### 🚀 New Syntax Support
- **Configuration Targeting**: Use `imgconvert -p alloy:comics` to process only the comics configuration
- **Multiple Options**: Support for any configuration name defined in the alloy preset (e.g., `alloy:thumbs-comics`, `alloy:baby`, `alloy:thumbs-baby`)
- **Backward Compatibility**: Using just `imgconvert -p alloy` still processes all configurations as before

#### 🛠️ Enhanced Error Handling
- **Configuration Validation**: Clear error messages when specifying a non-existent configuration
- **Available Options Display**: Shows all available configurations when an invalid one is specified
- **User-Friendly Feedback**: Helpful error messages guide users to correct syntax

#### 📊 Improved User Experience
- **Clear Processing Indication**: Console output clearly shows whether processing all configurations or just a specific one
- **Targeted Output**: When processing a specific configuration, the summary focuses only on that configuration's results
- **Help Documentation**: Updated help message to show the new syntax with examples

#### 💡 Use Cases
- **Incremental Updates**: Perfect for when adding new design categories (like 'neon') and only wanting to process the new assets
- **Development Workflow**: Developers can test specific configurations without waiting for all assets to be regenerated
- **Selective Builds**: Ideal for CI/CD pipelines that only need to update specific asset categories

#### 🔧 Technical Implementation
- **Parser Enhancement**: Enhanced argument parser to detect `preset:subpreset` syntax
- **Configuration Filtering**: Smart filtering logic that processes only the specified configuration group
- **Validation Logic**: Robust validation ensures specified configurations exist before processing
- **Precedence Maintenance**: Maintains all existing precedence rules (CLI > Preset > Config > Default)

#### 📝 Examples
```bash
# Process all alloy configurations (existing behavior)
imgconvert -p alloy

# Process only comics configuration
imgconvert -p alloy:comics

# Process only baby thumbnails
imgconvert -p alloy:thumbs-baby

# Process only thumbnail comics
imgconvert -p alloy:thumbs-comics
```

### 🔄 No Breaking Changes
- **Full Compatibility**: Existing alloy preset usage remains unchanged
- **Legacy Support**: All existing configuration files continue to work without modification
- **Additive Feature**: This is a pure enhancement that adds functionality without removing or changing existing behavior

## [1.3.0] - 2025-05-31

### ✨ Major Alloy Preset Enhancement

#### 🚀 Multi-Configuration Support for Alloy Preset
- **Multiple Configuration Groups**: Enhanced alloy preset to support multiple configuration groups (e.g., `cards`, `thumbs`, `icons`) within a single preset
- **Independent Source/Output Management**: Each configuration group can have its own source directories and output paths for both Android and iPhone platforms
- **Flexible Quality and Format Control**: Per-configuration quality and format settings with proper precedence: CLI > Subpreset > ConfigGroup > Global > Default
- **Batch Processing**: Process all configurations in a single command execution

#### 🔒 Immutable Titanium Standards Implementation
- **Fixed Scale Factors**: Titanium Alloy scale factors are now immutable constants that cannot be modified by users
- **Simplified Configuration**: Removed `scales` property from configuration files - scales are now built-in Titanium standards
- **Error Prevention**: Prevents users from accidentally breaking Titanium compatibility by modifying scale factors
- **Code Consistency**: All scale references now use centralized immutable constants (`ALLOY_SCALES`)

#### 🏗️ New Configuration Structure
- **Legacy Compatibility**: Maintains full backward compatibility with existing alloy preset configurations (`alloy.android`, `alloy.iphone`)
- **Auto-Detection**: Automatically detects new multi-configuration format vs legacy format
- **Multi-Configuration Support**: New structure supports `alloy.{configName}.{platform}` format (e.g., `alloy.cards.android`, `alloy.thumbs.iphone`)
- **Clean Configuration**: Generated configuration files no longer include modifiable scale factors

#### 📊 Improved Debug and Monitoring
- **Enhanced Debug Output**: Debug mode now shows configuration group and platform information for each processed file
- **Progress Tracking**: Better progress indication showing current configuration group being processed
- **Detailed Summary**: Processing summary includes configuration-specific information

#### 🎯 Configuration Examples
**New Multi-Configuration Format:**
```json
{
  "presets": {
    "alloy": {
      "cards": {
        "android": {
          "quality": 90,
          "format": "webp",
          "source": "originals",
          "output": "cards/baby"
        },
        "iphone": {
          "quality": 90,
          "format": "webp",
          "source": "originals",
          "output": "cards/baby"
        }
      },
      "thumbs": {
        "android": {
          "quality": 80,
          "format": "webp",
          "source": "thumbs",
          "output": "thumbs/baby"
        },
        "iphone": {
          "quality": 80,
          "format": "webp",
          "source": "thumbs",
          "output": "thumbs/baby"
        }
      }
    }
  }
}
```

#### 🔧 Technical Improvements
- **Smart Format Detection**: Automatically detects if using new multi-configuration format or legacy format
- **Enhanced Function Signatures**: Updated `getEffectiveQuality` and `getEffectiveFormat` functions to support configuration group context
- **Robust Error Handling**: Better error handling for missing source directories with clear warning messages
- **Process Isolation**: Each configuration group processes independently with proper cleanup

#### 💡 Usage Benefits
- **Game Development Workflow**: Perfect for game card processing with different image sets (large cards, thumbnails, icons)
- **Multi-Source Processing**: Process different source folders to different output locations in one command
- **Consistent Scaling**: Maintains alloy preset's automatic 4x scaling behavior across all configurations
- **Platform Optimization**: Different quality/format settings per platform and image type

### 🔄 Breaking Changes
- **No Breaking Changes**: This version maintains full backward compatibility with existing alloy preset configurations
- **Enhanced Detection**: The system now automatically differentiates between legacy (`alloy.android`, `alloy.iphone`) and new multi-configuration formats (`alloy.cards.android`, `alloy.thumbs.android`, etc.)

### 📝 Documentation
- **Comprehensive Examples**: Added detailed configuration examples for the new multi-configuration format
- **Migration Guide**: Clear guidance on how to upgrade from legacy to new format
- **Use Case Documentation**: Specific examples for game development and multi-asset workflows

## [1.2.1] - 2025-05-31

### ✨ Enhanced Alloy Preset

#### 🔧 Improved Alloy Preset Handling
- **Multiple Sources Support**: Enhanced alloy preset to properly handle multiple source directories for Android and iPhone platforms
- **Smart Output Directory Management**: Improved output directory creation logic to prevent conflicts when using alloy preset
- **Relative Path Support**: Updated alloy preset to use relative output paths instead of absolute paths for better flexibility

#### 🚨 User Experience Improvements
- **Width/Height Warning**: Added console warning when width or height parameters are used with alloy preset, as these are automatically ignored
- **Documentation Enhancement**: Comprehensive documentation updates for alloy preset including:
  - Clear explanation of automatic scaling behavior
  - Platform-specific output structure examples
  - Usage guidelines and best practices
  - Clarification that width/height parameters are ignored

#### 🏗️ Code Structure Improvements
- **Enhanced Args Object**: Improved argument object structure for better preset configuration handling
- **Default Presets Update**: Updated default preset configurations to include proper output properties
- **Directory Creation Logic**: Enhanced directory creation to skip generic output directory creation for alloy preset, allowing platform-specific directories to be created instead

#### 📝 Documentation Updates
- **Alloy Preset Section**: Added comprehensive alloy preset documentation with:
  - Key features explanation
  - Scale factors for Android and iPhone
  - Output directory structure examples
  - Usage examples and best practices
- **Configuration Consistency**: Updated default configuration examples to match actual code implementation
- **Clarification Notes**: Added notes explaining relative vs absolute path usage for alloy preset

### 🐛 Bug Fixes
- **Output Directory Conflicts**: Fixed issue where generic output directory was created unnecessarily when using alloy preset
- **Documentation Inconsistencies**: Corrected discrepancies between documentation and actual code behavior for alloy preset configuration

### 🔄 Technical Details
- **Preset Logic**: Enhanced preset application logic to better handle alloy-specific requirements
- **Path Management**: Improved path handling for alloy preset to ensure correct directory structure creation
- **Validation**: Added proper validation for alloy preset usage with width/height parameters

## [1.2.0] - 2025-05-31

### 🚨 BREAKING CHANGES
- **Removed Environment Mode**: The `--environment` / `-e` flag has been completely removed. The CLI now has consistent behavior without development/production modes.
- **Renamed Parameter**: `--replace` / `-r` has been renamed to `--replace-originals` for better clarity and user understanding.

### ✨ Added
- **Improved CLI Clarity**: New `--replace-originals` flag is self-explanatory and removes confusion about when files get replaced.
- **Consistent Behavior**: The CLI now behaves the same way every time, eliminating unexpected surprises from environment modes.
- **Enhanced Documentation**: Comprehensive documentation updates reflecting the simplified interface.

### 🔧 Changed
- **Simplified CLI Interface**: Removed confusing environment concept that was causing user confusion
- **Parameter Naming**: `--replace` → `--replace-originals` for better user experience
- **Default Output Directory**: Changed from `compressed` to `converted` for better alignment with tool name and purpose
- **Help Message**: Updated to show only essential, clear options
- **Configuration System**: Updated default config to use `replace-originals` instead of `replace`
- **Preset Logic**: All preset application logic now uses the new parameter naming convention

### 🗑️ Removed
- **Environment Mode**: Complete removal of `dev`/`prod` environment logic
- **Related Variables**: Removed `effectiveReplace`, `effectiveDebug`, `effectiveOutput`, and `environment` variables
- **Development Mode Restrictions**: No more automatic file protection in development mode
- **Environment Documentation**: Removed all references to environment modes from README

### 🐛 Fixed
- **Precedence System**: Maintained and verified the correct CLI > Preset > Config > Default precedence order
- **Configuration Consistency**: All references now use consistent parameter naming
- **Documentation Sync**: Documentation now accurately reflects the actual CLI behavior

### 📝 Documentation
- **README Updates**: Complete overhaul of documentation to reflect simplified CLI
- **Removed Sections**: Eliminated "Environment Mode" section and references
- **Updated Examples**: All examples now use the new `--replace-originals` syntax
- **Configuration Guide**: Updated configuration parameters and examples
- **FAQ Updates**: Removed environment-related questions and answers

### 🔄 Migration Guide
For users upgrading from previous versions:

#### Before (Old Syntax):
```bash
# Old environment-based syntax (NO LONGER WORKS)
imgconvert source_folder --replace --environment prod
imgconvert source_folder -r -e prod
```

#### After (New Syntax):
```bash
# New simplified syntax
imgconvert source_folder --replace-originals
```

#### Configuration File Changes:
Update your `.imgconverter.config.json` file:

```json
{
  "replace": false  // OLD - remove this
  "replace-originals": false  // NEW - use this instead
}
```

### 🛠️ Technical Details

#### Code Changes:
- **`index.js`**: Complete refactoring to remove environment logic
- **CLI Parsing**: Updated minimist configuration for new parameter names
- **Preset Application**: Modified to use `replace-originals` throughout
- **Variable Cleanup**: Removed all environment-related variables and logic
- **Output Directory**: Changed default output folder from `compressed` to `converted`

#### Precedence System Verification:
The configuration precedence system continues to work correctly:
1. **CLI Arguments** (highest priority)
2. **Preset Settings**
3. **Global Config**
4. **Default Values** (lowest priority)

This applies to all parameters: `quality`, `format`, `width`, `height`, `output`, `replace-originals`, and `background`.

### 🎯 Benefits of Changes

1. **User Experience**:
   - Simpler, more predictable CLI behavior
   - Self-explanatory parameter names
   - More intuitive output directory naming (`converted` vs `compressed`)
   - No more confusion about when files get replaced

2. **Maintainability**:
   - Reduced code complexity
   - Fewer conditional branches
   - Cleaner codebase
   - More consistent naming throughout the application

3. **Documentation**:
   - Easier to understand and maintain
   - More focused content
   - Better user onboarding
   - Consistent terminology

### ⚡ Performance
- No performance impact - changes are purely interface and logic simplification
- Maintained all existing image processing capabilities
- Preserved all format support and quality options

---

## Previous Versions

### [1.1.5] and earlier
- Original implementation with environment modes
- Used `--replace` / `-r` flag
- Had development/production mode distinctions
- See git history for detailed changes in previous versions
