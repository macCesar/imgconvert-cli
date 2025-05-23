# Test Images

This directory contains minimal images for testing purposes.

During test execution, valid minimal JPG and PNG files are created for testing.

These files are temporary and are cleaned up after the tests complete.

## Why not include images in the repository?

1. **Repository size**: Keeps the repository small by not including unnecessary binary files.
2. **Simplicity**: Avoids licensing or copyright issues with images.
3. **Portability**: Ensures tests work in any environment without external dependencies.

## Image Generation

Images are automatically generated in the `integration.test.js` file with the smallest possible size to be recognized as valid image files by the libraries used.
