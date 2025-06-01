const { expect } = require('chai');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('imgconvert CLI Tests', function () {
  this.timeout(120000);

  const testDir = path.join(__dirname, 'temp-test');
  const imagesDir = path.join(__dirname, '..', 'images');
  const configFile = path.join(process.cwd(), '.imgconverter.config.json');

  // Check if we're in verbose mode
  const isVerbose = process.env.VERBOSE_TESTS === 'true';

  // Helper function to execute CLI commands with conditional logging
  const execCLI = (command, options = {}) => {
    // UPDATED: Now using cli.js instead of index.js
    const fullCommand = `node cli.js ${command}`;

    if (isVerbose) {
      console.log(`\n🔧 Executing: ${fullCommand}`);
    }

    try {
      const result = execSync(fullCommand, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'], // Capture all output streams
        ...options
      });

      if (isVerbose) {
        console.log(`✅ Command succeeded`);
      }

      return result;
    } catch (error) {
      if (isVerbose) {
        console.log(`❌ Command failed with exit code: ${error.status}`);
        console.log(`📤 STDOUT: ${error.stdout || 'empty'}`);
        console.log(`📤 STDERR: ${error.stderr || 'empty'}`);
      }
      throw error;
    }
  };

  // Helper function for expected errors (silent capture)
  const execCLIExpectError = (command, options = {}) => {
    // UPDATED: Now using cli.js instead of index.js
    const fullCommand = `node cli.js ${command}`;

    if (isVerbose) {
      console.log(`\n🔧 Executing (expect error): ${fullCommand}`);
    }

    try {
      const result = execSync(fullCommand, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'], // Capture stderr silently
        ...options
      });

      if (isVerbose) {
        console.log(`❌ Command unexpectedly succeeded when error was expected`);
      }

      return result;
    } catch (error) {
      if (isVerbose) {
        console.log(`✅ Command correctly failed with expected error`);
        console.log(`📤 Error message: ${error.stderr || error.stdout || 'empty'}`);
      }
      return error;
    }
  };

  // Helper to check if file exists with conditional logging
  const checkFileExists = (filePath, description = '') => {
    const exists = fs.existsSync(filePath);

    if (isVerbose) {
      console.log(`📁 Checking ${description}: ${filePath} - ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);

      if (!exists) {
        // List directory contents to help debug
        const dir = path.dirname(filePath);
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          console.log(`📂 Directory contents of ${dir}:`, files);
        } else {
          console.log(`📂 Directory ${dir} does not exist`);
        }
      }
    }

    return exists;
  };

  // Helper to log test results conditionally
  const logResult = (testName, result) => {
    if (isVerbose) {
      console.log(`${testName} result:`, result);
    }
  };

  before(() => {
    if (isVerbose) {
      console.log('\n🚀 Setting up test environment...');
    }

    // Clean and create test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });

    // Copy real images to test directory
    ['image.jpg', 'image.png', 'image.webp', 'test.gif'].forEach(img => {
      const src = path.join(imagesDir, img);
      const dest = path.join(testDir, img);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        if (isVerbose) {
          console.log(`✅ Copied: ${img}`);
        }
      } else {
        if (isVerbose) {
          console.log(`⚠️  Source image not found: ${src}`);
        }
      }
    });

    // Clean any existing config file from previous tests
    if (fs.existsSync(configFile)) {
      fs.unlinkSync(configFile);
    }

    if (isVerbose) {
      console.log('✅ Test environment ready\n');
    }
  });

  after(() => {
    if (isVerbose) {
      console.log('\n🧹 Cleaning up test environment...');
    }

    // Clean up test directory
    if (fs.existsSync(testDir)) {
      if (isVerbose) {
        console.log(`🗑️  Removing test directory: ${testDir}`);
      }
      fs.rmSync(testDir, { recursive: true, force: true });
    }

    // Clean up config file
    if (fs.existsSync(configFile)) {
      if (isVerbose) {
        console.log(`🗑️  Removing config file: ${configFile}`);
      }
      fs.unlinkSync(configFile);
    }

    // Clean up default output directories that tests might create
    const defaultOutputDirs = [
      path.join(process.cwd(), 'converted'),
      path.join(process.cwd(), 'app'),
      path.join(process.cwd(), 'compressed'),
      path.join(process.cwd(), 'output')
    ];

    defaultOutputDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        if (isVerbose) {
          console.log(`🗑️  Removing output directory: ${dir}`);
        }
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });

    // Clean up any other potential test artifacts
    const potentialArtifacts = [
      path.join(process.cwd(), 'web-preset'),
      path.join(process.cwd(), 'thumbnail-preset'),
      path.join(process.cwd(), 'print-preset'),
      path.join(process.cwd(), 'alloy-preset')
    ];

    potentialArtifacts.forEach(artifact => {
      if (fs.existsSync(artifact)) {
        if (isVerbose) {
          console.log(`🗑️  Removing test artifact: ${artifact}`);
        }
        fs.rmSync(artifact, { recursive: true, force: true });
      }
    });

    if (isVerbose) {
      console.log('✅ Test environment cleanup completed');
    }
  });

  describe('Basic CLI functionality', () => {
    it('should display version information', () => {
      const result = execCLI('-v');
      expect(result).to.include('1.4.1');
      expect(result).to.include('imgconvert-cli version');
    });

    it('should display help message', () => {
      const result = execCLI('--help');
      expect(result).to.include('Usage:');
      expect(result).to.include('Options:');
      expect(result).to.include('imgconvert');
    });

    it('should create configuration file', () => {
      const result = execCLI('config');
      expect(result).to.include('Default configuration file created');
      expect(fs.existsSync(configFile)).to.be.true;

      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      expect(config).to.have.property('presets');
      expect(config).to.have.property('quality', 85);
    });
  });

  describe('Format conversion tests', () => {
    it('should convert PNG to WebP with quality 85 in production mode', () => {
      const inputFile = path.join(testDir, 'image.png');
      const command = `"${inputFile}" -f webp -q 85`;

      const result = execCLI(command);
      logResult('PNG to WebP', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(testDir, 'converted', 'image.webp');
      expect(checkFileExists(outputFile, 'WebP output')).to.be.true;
    });

    it('should convert JPG to WebP with quality 85 in production mode', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const command = `"${inputFile}" -f webp -q 85`;

      const result = execCLI(command);
      logResult('JPG to WebP', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(testDir, 'converted', 'image.webp');
      expect(checkFileExists(outputFile, 'WebP output')).to.be.true;
    });

    it('should convert to all formats in production mode', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'all-formats');
      const command = `"${inputFile}" -f all -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('All formats conversion', result);
      expect(result).to.include('Processed files: 1');

      // Check that multiple format files were created
      if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir);
        if (isVerbose) {
          console.log('📂 Files created:', files);
        }

        const expectedFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'];
        expectedFormats.forEach(format => {
          const expectedFile = `image.${format}`;
          expect(files).to.include(expectedFile, `Missing ${format} format`);
        });
      } else {
        throw new Error(`Output directory ${outputDir} was not created`);
      }
    });

    it('should preserve original format when no format specified', () => {
      const inputFile = path.join(testDir, 'image.png');
      const outputDir = path.join(testDir, 'preserve-format');
      const command = `"${inputFile}" -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Preserve format', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.png');
      expect(checkFileExists(outputFile, 'Preserved PNG')).to.be.true;
    });
  });

  describe('Image resizing tests', () => {
    it('should resize image with width=300 only', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'resize-width');
      const command = `"${inputFile}" -w 300 -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Resize width=300', result);
      expect(result).to.include('Processed files: 1');

      // Now CLI preserves original .jpg extension
      const outputFile = path.join(outputDir, 'image.jpg');
      expect(checkFileExists(outputFile, 'Resized width output')).to.be.true;
    });

    it('should resize image with height=200 only', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'resize-height');
      const command = `"${inputFile}" -h 200 -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Resize height=200', result);
      expect(result).to.include('Processed files: 1');

      // Now CLI preserves original .jpg extension
      const outputFile = path.join(outputDir, 'image.jpg');
      expect(checkFileExists(outputFile, 'Resized height output')).to.be.true;
    });

    it('should resize image with width=200 and height=150', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'resize-both');
      const command = `"${inputFile}" -w 200 -h 150 -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Resize width=200 height=150', result);
      expect(result).to.include('Processed files: 1');

      // Now CLI preserves original .jpg extension
      const outputFile = path.join(outputDir, 'image.jpg');
      expect(checkFileExists(outputFile, 'Resized both dimensions output')).to.be.true;
    });
  });

  describe('Quality and compression tests', () => {
    it('should apply different quality settings (95% vs 30%)', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const highQualityDir = path.join(testDir, 'high-quality');
      const lowQualityDir = path.join(testDir, 'low-quality');

      // High quality
      const highCommand = `"${inputFile}" -f webp -q 95 -o "${highQualityDir}"`;
      const highResult = execCLI(highCommand);
      logResult('High quality (95%)', highResult);

      // Low quality  
      const lowCommand = `"${inputFile}" -f webp -q 30 -o "${lowQualityDir}"`;
      const lowResult = execCLI(lowCommand);
      logResult('Low quality (30%)', lowResult);

      const highQualityFile = path.join(highQualityDir, 'image.webp');
      const lowQualityFile = path.join(lowQualityDir, 'image.webp');

      expect(checkFileExists(highQualityFile, 'High quality output')).to.be.true;
      expect(checkFileExists(lowQualityFile, 'Low quality output')).to.be.true;

      const highSize = fs.statSync(highQualityFile).size;
      const lowSize = fs.statSync(lowQualityFile).size;

      if (isVerbose) {
        console.log(`📊 High quality (95%): ${highSize} bytes, Low quality (30%): ${lowSize} bytes`);
      }
      expect(lowSize).to.be.lessThan(highSize);
    });

    it('should apply custom background color #ff0000 for transparency', () => {
      const inputFile = path.join(testDir, 'image.png');
      const outputDir = path.join(testDir, 'custom-background');
      const command = `"${inputFile}" -f jpeg -b "#ff0000" -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Custom background #ff0000', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.jpeg');
      expect(checkFileExists(outputFile, 'Custom background output')).to.be.true;
    });
  });

  describe('Preset functionality tests', () => {
    it('should work with web preset (webp, quality 80)', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'web-preset');
      const command = `"${inputFile}" -p web -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Web preset', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.webp');
      expect(checkFileExists(outputFile, 'Web preset output')).to.be.true;
    });

    it('should work with thumbnail preset (png, 150x150, quality 60)', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'thumbnail-preset');
      const command = `"${inputFile}" -p thumbnail -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Thumbnail preset', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.png');
      expect(checkFileExists(outputFile, 'Thumbnail preset output')).to.be.true;
    });

    it('should work with alloy preset for mobile development', () => {
      const inputFile = path.join(testDir, 'image.png');
      const command = `"${inputFile}" -p alloy`;

      // Clean up any existing app/assets directory
      if (fs.existsSync('app/assets')) {
        fs.rmSync('app/assets', { recursive: true, force: true });
      }

      const result = execCLI(command);
      logResult('Alloy preset', result);
      expect(result).to.include('Processed files: 2');

      // Verify Android and iPhone folders were created
      expect(checkFileExists('app/assets/android', 'Android assets')).to.be.true;
      expect(checkFileExists('app/assets/iphone', 'iPhone assets')).to.be.true;

      // Check for specific resolution files
      expect(checkFileExists('app/assets/android/images/res-mdpi', 'Android MDPI')).to.be.true;
      expect(checkFileExists('app/assets/android/images/res-hdpi', 'Android HDPI')).to.be.true;
      expect(checkFileExists('app/assets/iphone/images', 'iPhone images')).to.be.true;
    });
  });

  describe('Batch processing tests', () => {
    it('should process entire directory with webp format', () => {
      const outputDir = path.join(testDir, 'batch-processing');
      const command = `"${testDir}" -f webp -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Batch processing', result);
      expect(result).to.match(/Processed files: [1-9]\d*/); // At least 1 file

      // Check that output directory contains files
      if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir);
        if (isVerbose) {
          console.log('📂 Batch processed files:', files);
        }
        expect(files.length).to.be.greaterThan(0);
      } else {
        throw new Error(`Batch output directory ${outputDir} was not created`);
      }
    });

    it('should process directory and preserve original formats', () => {
      const outputDir = path.join(testDir, 'batch-preserve');
      const command = `"${testDir}" -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Batch preserve formats', result);
      expect(result).to.match(/Processed files: [1-9]\d*/);

      if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir);
        if (isVerbose) {
          console.log('📂 Batch preserved files:', files);
        }
        // Now CLI preserves original .jpg extension instead of converting to .jpeg
        expect(files.some(file => file.endsWith('.jpg'))).to.be.true;
        expect(files.some(file => file.endsWith('.png'))).to.be.true;
      } else {
        throw new Error(`Batch preserve directory ${outputDir} was not created`);
      }
    });
  });

  describe('Error handling tests', () => {
    it('should handle invalid width parameter "invalid"', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const command = `"${inputFile}" -w invalid`;

      const error = execCLIExpectError(command);

      if (isVerbose) {
        console.log('✅ Correctly caught invalid width error');
      }
      expect(error.stderr || error.stdout).to.include('must be a positive integer');
    });

    it('should handle invalid height parameter "-5"', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const command = `"${inputFile}" -h -5`;

      const error = execCLIExpectError(command);

      if (isVerbose) {
        console.log('✅ Correctly caught invalid height error');
      }
      expect(error.stderr || error.stdout).to.include('must be a positive integer');
    });

    it('should handle non-existent file "non-existent-file.jpg"', () => {
      const command = `"non-existent-file.jpg"`;

      const error = execCLIExpectError(command);

      if (isVerbose) {
        console.log('✅ Correctly caught non-existent file error');
      }
      expect(error.stderr || error.stdout).to.include('does not exist');
    });

    it('should handle missing source path', () => {
      const command = `-f webp`;

      const error = execCLIExpectError(command);

      if (isVerbose) {
        console.log('✅ Correctly caught missing source error');
      }
      expect(error.stderr || error.stdout).to.include('provide a source file or folder');
    });
  });

  describe('Debug mode tests', () => {
    it('should show debug information when enabled with -d flag', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const command = `"${inputFile}" -f webp -d`;

      const result = execCLI(command);
      logResult('Debug mode', result);
      expect(result).to.include('Processing complete!');
      expect(result).to.include('Total original size:');
      expect(result).to.include('Total new size:');
      expect(result).to.include('Total savings:');
      expect(result).to.include('Duration:');
    });
  });

  describe('Custom output directory tests', () => {
    it('should respect custom output directory', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const customOutputDir = path.join(testDir, 'custom-output-test');
      const command = `"${inputFile}" -f webp -o "${customOutputDir}"`;

      const result = execCLI(command);
      logResult('Custom output', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(customOutputDir, 'image.webp');
      expect(checkFileExists(outputFile, 'Custom output')).to.be.true;
    });
  });

  describe('Advanced resizing options tests', () => {
    it('should use fit strategy "cover" to crop and fill dimensions', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'fit-cover');
      const command = `"${inputFile}" --fit cover -w 200 -h 200 -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Fit cover strategy', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.jpg');
      expect(checkFileExists(outputFile, 'Fit cover output')).to.be.true;
    });

    it('should use fit strategy "contain" to fit within dimensions', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'fit-contain');
      const command = `"${inputFile}" --fit contain -w 200 -h 200 -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Fit contain strategy', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.jpg');
      expect(checkFileExists(outputFile, 'Fit contain output')).to.be.true;
    });

    it('should use position "top" with cover fit strategy', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'position-top');
      const command = `"${inputFile}" --fit cover --position top -w 200 -h 200 -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Position top', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.jpg');
      expect(checkFileExists(outputFile, 'Position top output')).to.be.true;
    });

    it('should crop image using manual coordinates', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'manual-crop');
      const command = `"${inputFile}" --crop 50,50,200,200 -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Manual crop', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.jpg');
      expect(checkFileExists(outputFile, 'Manual crop output')).to.be.true;
    });
  });



  describe('Complete preset tests', () => {
    it('should work with print preset (tiff, quality 100)', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'print-preset');
      const command = `"${inputFile}" -p print -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('Print preset', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.tiff');
      expect(checkFileExists(outputFile, 'Print preset output')).to.be.true;
    });
  });

  describe('Individual format tests', () => {
    it('should convert to AVIF format', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'avif-format');
      const command = `"${inputFile}" -f avif -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('AVIF format', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.avif');
      expect(checkFileExists(outputFile, 'AVIF output')).to.be.true;
    });

    it('should convert to TIFF format', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'tiff-format');
      const command = `"${inputFile}" -f tiff -o "${outputDir}"`;

      const result = execCLI(command);
      logResult('TIFF format', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.tiff');
      expect(checkFileExists(outputFile, 'TIFF output')).to.be.true;
    });
  });
});
