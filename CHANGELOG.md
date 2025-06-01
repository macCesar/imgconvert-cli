# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
