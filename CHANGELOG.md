# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
