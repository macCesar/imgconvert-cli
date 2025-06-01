# Test Images

This directory contains optimized real-world images for comprehensive testing purposes.

## Current Test Images

### 🏞️ **canyon-river.jpg** (~200KB)
- **Dimensions**: ~1000px width (optimized from 2000x1332px)
- **Description**: Beautiful canyon landscape with river scene
- **Format**: JPEG
- **Use**: Primary test image for JPG format testing and conversions

### 🏔️ **mountain-lake.png** (~341KB)
- **Dimensions**: ~1000px width (optimized from 2000x1332px)
- **Description**: Scenic mountain landscape with lake
- **Format**: PNG (with transparency support)
- **Use**: Primary test image for PNG format testing and transparency handling

### 🎬 **test.gif** (~503KB)
- **Dimensions**: ~1000px width
- **Description**: Animated/static GIF created from canyon-river.jpg
- **Format**: GIF
- **Use**: GIF format testing and conversion workflows

## Optimization Benefits

✅ **Performance**: Reduced from 2000x1332px to ~1000px width for faster test execution  
✅ **Unique Names**: Descriptive filenames prevent conflicts during format conversions  
✅ **Complete Coverage**: All major formats (JPG, PNG, GIF) for comprehensive testing  
✅ **Real-world Scenarios**: Actual photographic content instead of minimal test files  

## Why Real Images Instead of Generated?

1. **Realistic Testing**: Real photographic content tests actual use cases
2. **Format Validation**: Complex images validate compression and conversion algorithms properly
3. **Visual Quality**: Enables quality comparison tests between different settings
4. **Edge Cases**: Real images contain varied color spaces, details, and characteristics
5. **Transparency Testing**: PNG images can test alpha channel handling

## Test Integration

These images are automatically copied to the test environment during test execution:
- Copied to `test/temp-test/` directory at test startup
- Used across all 49 test scenarios in `simple.test.js`
- Cleaned up automatically after test completion
- Support all imgconvert-cli features: resizing, format conversion, quality adjustment, presets

## Image Creation History

- **Original**: Large 2000x1332px sample images
- **June 2024**: Optimized using imgconvert-cli itself to ~1000px width
- **June 2024**: Renamed with descriptive names to prevent conversion conflicts
- **June 2024**: Added GIF format by converting existing JPG using imgconvert-cli
