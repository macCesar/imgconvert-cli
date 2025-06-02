# Testing Guide for imgconvert-cli

<div align="center">

![test coverage](https://img.shields.io/badge/tests-74%20passing-brightgreen)
![test framework](https://img.shields.io/badge/framework-mocha%2Bchai-blue)

</div>

This guide covers the comprehensive test suite for `imgconvert-cli`, including setup, execution, and troubleshooting.

## Table of Contents
- [Testing Guide for imgconvert-cli](#testing-guide-for-imgconvert-cli)
  - [Table of Contents](#table-of-contents)
  - [Test Suite Overview](#test-suite-overview)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Tests](#running-tests)
    - [Run All Tests](#run-all-tests)
    - [Run Tests with Cleanup](#run-tests-with-cleanup)
    - [Run with Extended Timeout (for slow systems)](#run-with-extended-timeout-for-slow-systems)
    - [Specific Test Categories](#specific-test-categories)
  - [Test Structure](#test-structure)
  - [Test Categories](#test-categories)
    - [1. **Basic CLI Functionality**](#1-basic-cli-functionality)
    - [2. **Format Conversion Tests**](#2-format-conversion-tests)
    - [3. **Image Resizing Tests**](#3-image-resizing-tests)
    - [4. **Quality and Compression Tests**](#4-quality-and-compression-tests)
    - [5. **Preset Functionality Tests**](#5-preset-functionality-tests)
    - [6. **Batch Processing Tests**](#6-batch-processing-tests)
    - [7. **Advanced Resizing Options Tests**](#7-advanced-resizing-options-tests)
    - [8. **Complete Preset Tests**](#8-complete-preset-tests)
    - [9. **Individual Format Tests**](#9-individual-format-tests)
    - [10. **Error Handling Tests**](#10-error-handling-tests)
    - [11. **Debug Mode Tests**](#11-debug-mode-tests)
    - [12. **Custom Output Directory Tests**](#12-custom-output-directory-tests)
  - [Test Environment Setup](#test-environment-setup)
    - [Automatic Setup](#automatic-setup)
    - [Manual Setup (if needed)](#manual-setup-if-needed)
  - [Debugging Tests](#debugging-tests)
    - [Choose the Right Mode for Your Needs](#choose-the-right-mode-for-your-needs)
    - [Debug Output Examples](#debug-output-examples)
  - [Common Issues and Solutions](#common-issues-and-solutions)
    - [1. **Missing Test Images**](#1-missing-test-images)
    - [2. **Extension Mismatch Errors**](#2-extension-mismatch-errors)
    - [3. **Permission Errors**](#3-permission-errors)
    - [4. **Timeout Issues**](#4-timeout-issues)
    - [5. **Config File Conflicts**](#5-config-file-conflicts)
  - [Adding New Tests](#adding-new-tests)
    - [Test Structure Template](#test-structure-template)
    - [Best Practices for New Tests](#best-practices-for-new-tests)
  - [Test Coverage](#test-coverage)
  - [CI/CD Integration](#cicd-integration)
    - [GitHub Actions Example](#github-actions-example)
    - [Local Pre-commit Hook](#local-pre-commit-hook)
  - [Tips for Test Maintenance](#tips-for-test-maintenance)
  - [Performance Considerations](#performance-considerations)
  - [Test Cleanup](#test-cleanup)
    - [Automatic Cleanup](#automatic-cleanup)
    - [Manual Cleanup](#manual-cleanup)
    - [Force Clean Everything](#force-clean-everything)

## Test Suite Overview

The imgconvert-cli test suite is a comprehensive testing framework that includes:

- **74 tests** covering all CLI functionality
- **Detailed command logging** with full CLI command visibility
- **File existence verification** with directory content inspection
- **Error handling validation** for edge cases and invalid inputs
- **Format conversion verification** including complete format support
- **Batch processing validation**
- **Preset functionality testing**

## Prerequisites

Before running tests, ensure you have:

- **Node.js** (version 14.x or higher)
- **NPM** (comes with Node.js)
- **Test images** in the `images/` directory:
  - `image.jpg` (JPEG test image)
  - `image.png` (PNG test image)

## Installation

Install all dependencies including testing frameworks:

```bash
npm install
```

The test suite uses:
- **Mocha**: Test framework
- **Chai**: Assertion library

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Cleanup
```bash
npm run clean-all && npm test
```

### Run with Extended Timeout (for slow systems)
```bash
npx mocha test/simple.test.js --timeout 300000
```

### Specific Test Categories

You can focus on specific test categories by modifying the test file or using grep:

```bash
# Focus on format conversion tests (verbose mode recommended for debugging)
npm run test:verbose -- --grep "Format conversion"

# Focus on resizing tests
npm run test:verbose -- --grep "Image resizing"

# Focus on error handling
npm run test:verbose -- --grep "Error handling"

# Quick test of just basic functionality
npm test -- --grep "Basic CLI functionality"
```

## Test Structure

The test suite is organized into logical groups:

```
test/
├── simple.test.js          # Main comprehensive test suite
├── temp-test/              # Temporary test directory (auto-created)
└── ...                     # Additional test files (if any)
```

## Test Categories

### 1. **Basic CLI Functionality**
- Version display (`-v`, `--version`)
- Help message (`--help`)
- Configuration file creation (`config`)

### 2. **Format Conversion Tests**
- PNG to WebP conversion
- JPG to WebP conversion
- All formats conversion (`-f all`)
- Original format preservation

### 3. **Image Resizing Tests**
- Width-only resizing (`-w`)
- Height-only resizing (`-h`)
- Both dimensions resizing (`-w -h`)

### 4. **Quality and Compression Tests**
- High vs low quality comparison
- Custom background color for transparency

### 5. **Preset Functionality Tests**
- Web preset (`-p web`)
- Thumbnail preset (`-p thumbnail`)
- Print preset (`-p print`)
- Alloy preset for mobile development (`-p alloy`)

### 6. **Batch Processing Tests**
- Directory processing with format conversion
- Directory processing with format preservation

### 7. **Advanced Resizing Options Tests**
- Fit strategies (`cover`, `contain`, `fill`, `inside`, `outside`)
- Position control (`top`, `bottom`, `left`, `right`, `center`, etc.)
- Manual crop coordinates (`left,top,width,height`)

### 8. **Complete Preset Tests**
- Print preset (TIFF, quality 100)
- All preset configurations

### 9. **Individual Format Tests**
- AVIF format conversion
- TIFF format conversion
- All supported formats individually

### 10. **Error Handling Tests**
- Invalid width/height parameters
- Non-existent file handling
- Missing source path handling

### 11. **Debug Mode Tests**
- Debug output verification

### 12. **Custom Output Directory Tests**
- Custom output path handling

## Test Environment Setup

### Automatic Setup
The test suite automatically:

1. **Creates test directory**: `test/temp-test/`
2. **Copies test images**: From `images/` to test directory
3. **Cleans up config**: Removes any existing `.imgconverter.config.json`
4. **Sets up logging**: Detailed command execution logging

### Manual Setup (if needed)
If tests fail due to missing images:

```bash
# Create test images directory
mkdir -p images/

# Add test images (you'll need actual image files)
# - images/image.jpg
# - images/image.png
```

## Debugging Tests

### Choose the Right Mode for Your Needs

**For daily development and CI/CD:**
```bash
npm test
```
- ✅ Clean, professional output
- ✅ Fast to read and understand
- ✅ Perfect for automated systems
- ✅ Shows only test results

**For debugging failing tests:**
```bash
npm run test:verbose
```
- 🔍 Shows exact CLI commands executed
- 🔍 Displays file existence checks with directory contents
- 🔍 Captures and displays error details
- 🔍 Perfect for understanding what went wrong

### Debug Output Examples

**Normal mode** shows only:
```
  Error handling tests
    ✔ should handle invalid width parameter "invalid" (51ms)
    ✔ should handle invalid height parameter "-5" (52ms)
```

**Verbose mode** shows:
```
  Error handling tests

🔧 Executing (expect error): node index.js "/path/image.jpg" -w invalid
✅ Command correctly failed with expected error
📤 Error message: Error: The width argument must be a positive integer.
    ✔ should handle invalid width parameter "invalid" (51ms)
```

## Common Issues and Solutions

### 1. **Missing Test Images**
**Problem**: `⚠️ Source image not found: /path/to/image.webp`

**Solution**:
- Ensure `images/image.jpg` and `images/image.png` exist
- These are the only required test images

### 2. **Extension Mismatch Errors**
**Problem**: `expected false to be true` in resizing tests

**Solution**:
- This usually indicates the CLI is generating `.jpeg` files when tests expect `.jpg`
- Check if the JPG/JPEG fix was properly implemented

### 3. **Permission Errors**
**Problem**: `ENOENT: no such file or directory, rename`

**Solution**:
```bash
# Ensure write permissions
chmod -R 755 test/
rm -rf test/temp-test/
```

### 4. **Timeout Issues**
**Problem**: Tests timing out

**Solution**:
```bash
# Increase timeout
npx mocha test/simple.test.js --timeout 600000
```

### 5. **Config File Conflicts**
**Problem**: Tests interfering with each other

**Solution**: The test suite automatically cleans up, but manually:
```bash
rm -f .imgconverter.config.json
npm run clean-all
```

## Adding New Tests

### Test Structure Template
```javascript
describe('New Feature Tests', () => {
  it('should do something specific with clear parameters', () => {
    const inputFile = path.join(testDir, 'image.jpg');
    const outputDir = path.join(testDir, 'feature-output');
    const command = `"${inputFile}" --new-feature value -o "${outputDir}"`;

    const result = execCLI(command);
    logResult('New feature', result);
    expect(result).to.include('Expected output text');

    const outputFile = path.join(outputDir, 'expected-output.jpg');
    expect(checkFileExists(outputFile, 'Feature output')).to.be.true;
  });
});
```

### Best Practices for New Tests
1. **Descriptive test names** with specific parameters
2. **Clear output directories** for each test
3. **Check file existence** with descriptive labels
4. **Log command execution** for debugging

## Test Coverage

Current test coverage includes:

| Feature                   | Coverage | Tests                               |
| ------------------------- | -------- | ----------------------------------- |
| CLI Arguments             | ✅ 100%   | Version, Help, Config               |
| Format Conversion         | ✅ 100%   | All supported formats               |
| Image Resizing            | ✅ 100%   | Width, Height, Both                 |
| Advanced Resizing Options | ✅ 100%   | Fit strategies, Position, Crop      |
| Preset Functionality      | ✅ 100%   | Web, Print, Thumbnail, Alloy        |
| Individual Formats        | ✅ 100%   | AVIF, TIFF, WebP, PNG, JPEG, GIF    |
| Batch Processing          | ✅ 100%   | Directory processing                |
| Quality Settings          | ✅ 100%   | High/Low quality, Custom background |
| Error Handling            | ✅ 100%   | Invalid parameters, Missing files   |
| Debug Mode                | ✅ 100%   | Debug output verification           |
| Custom Output             | ✅ 100%   | Custom directory handling           |

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
```

### Local Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
npm test
```

## Tips for Test Maintenance

1. **Keep tests independent** - Each test should work in isolation
2. **Use descriptive names** - Test names should explain what's being tested
3. **Test edge cases** - Include invalid inputs and boundary conditions
4. **Verify actual behavior** - Don't just test that commands run, verify output
5. **Clean up after tests** - Use `after()` hooks to clean temporary files
6. **Update tests with features** - When adding CLI features, add corresponding tests

## Performance Considerations

- **Image processing tests** take longer (2-5 seconds each)
- **Format conversion to all formats** can take 30+ seconds
- **Alloy preset tests** take 15-20 seconds due to multiple resolution generation
- **Total test suite** typically runs in 60-120 seconds

For faster development cycles, focus on specific test categories during development and run the full suite before commits.

## Test Cleanup

### Automatic Cleanup
The test suite automatically cleans up after execution:

- ✅ **Test directory**: `test/temp-test/` (completely removed)
- ✅ **Config file**: `.imgconverter.config.json` (removed)
- ✅ **Default output directories**: `converted/`, `app/`, `compressed/`, `output/`
- ✅ **Preset directories**: `web-preset/`, `thumbnail-preset/`, `print-preset/`, `alloy-preset/`

### Manual Cleanup
If tests are interrupted or cleanup fails, you can manually clean:

```bash
# Clean all test artifacts
npm run clean-all

# Or manually remove directories
rm -rf test/temp-test/
rm -rf converted/ app/ compressed/ output/
rm -rf *-preset/
rm -f .imgconverter.config.json
```

### Force Clean Everything
```bash
# Nuclear option - removes ALL generated files
npm run clean-force
```
