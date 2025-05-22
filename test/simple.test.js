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
    const fullCommand = `node index.js ${command}`;

    if (isVerbose) {
      console.log(`\n🔧 Executing: ${fullCommand}`);
    }

    try {
      const result = execSync(fullCommand, {
        encoding: 'utf8',
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
      console.log(`\n📁 Test files available at: ${testDir}`);
    }

    // Clean up config file after tests
    if (fs.existsSync(configFile)) {
      fs.unlinkSync(configFile);
    }
  });

  describe('Basic CLI functionality', () => {
    it('should display version information', () => {
      const result = execCLI('-v');
      expect(result).to.include('1.1.4');
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
      const command = `"${inputFile}" -f webp -q 85 -e prod`;

      const result = execCLI(command);
      logResult('PNG to WebP', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(testDir, 'compressed', 'image.webp');
      expect(checkFileExists(outputFile, 'WebP output')).to.be.true;
    });

    it('should convert JPG to WebP with quality 85 in production mode', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const command = `"${inputFile}" -f webp -q 85 -e prod`;

      const result = execCLI(command);
      logResult('JPG to WebP', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(testDir, 'compressed', 'image.webp');
      expect(checkFileExists(outputFile, 'WebP output')).to.be.true;
    });

    it('should convert to all formats in production mode', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'all-formats');
      const command = `"${inputFile}" -f all -o "${outputDir}" -e prod`;

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
      const command = `"${inputFile}" -o "${outputDir}" -e prod`;

      const result = execCLI(command);
      logResult('Preserve format', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.png');
      expect(checkFileExists(outputFile, 'Preserved PNG')).to.be.true;
    });
  });

  describe('Image resizing tests', () => {
    it('should resize image with width=300 only in production mode', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'resize-width');
      const command = `"${inputFile}" -w 300 -o "${outputDir}" -e prod`;

      const result = execCLI(command);
      logResult('Resize width=300', result);
      expect(result).to.include('Processed files: 1');

      // Now CLI preserves original .jpg extension
      const outputFile = path.join(outputDir, 'image.jpg');
      expect(checkFileExists(outputFile, 'Resized width output')).to.be.true;
    });

    it('should resize image with height=200 only in production mode', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'resize-height');
      const command = `"${inputFile}" -h 200 -o "${outputDir}" -e prod`;

      const result = execCLI(command);
      logResult('Resize height=200', result);
      expect(result).to.include('Processed files: 1');

      // Now CLI preserves original .jpg extension
      const outputFile = path.join(outputDir, 'image.jpg');
      expect(checkFileExists(outputFile, 'Resized height output')).to.be.true;
    });

    it('should resize image with width=200 and height=150 in production mode', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'resize-both');
      const command = `"${inputFile}" -w 200 -h 150 -o "${outputDir}" -e prod`;

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
      const highCommand = `"${inputFile}" -f webp -q 95 -o "${highQualityDir}" -e prod`;
      const highResult = execCLI(highCommand);
      logResult('High quality (95%)', highResult);

      // Low quality  
      const lowCommand = `"${inputFile}" -f webp -q 30 -o "${lowQualityDir}" -e prod`;
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
      const command = `"${inputFile}" -f jpeg -b "#ff0000" -o "${outputDir}" -e prod`;

      const result = execCLI(command);
      logResult('Custom background #ff0000', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.jpeg');
      expect(checkFileExists(outputFile, 'Custom background output')).to.be.true;
    });
  });

  describe('Environment mode tests', () => {
    it('should use dev mode by default and create compressed-dev folder', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const command = `"${inputFile}" -f webp`;

      const result = execCLI(command);
      logResult('Dev mode default', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(testDir, 'compressed-dev', 'image.webp');
      expect(checkFileExists(outputFile, 'Dev mode output')).to.be.true;
    });

    it('should warn about replace in dev mode', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const command = `"${inputFile}" -r -e dev`;

      const result = execCLI(command);
      logResult('Dev mode replace warning', result);
      expect(result).to.include('Overwriting original files is disabled in development environment');
    });

    it('should work in production mode', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'prod-mode');
      const command = `"${inputFile}" -f webp -o "${outputDir}" -e prod`;

      const result = execCLI(command);
      logResult('Production mode', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.webp');
      expect(checkFileExists(outputFile, 'Production mode output')).to.be.true;
    });
  });

  describe('Preset functionality tests', () => {
    it('should work with web preset (webp, quality 80)', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'web-preset');
      const command = `"${inputFile}" -p web -o "${outputDir}" -e prod`;

      const result = execCLI(command);
      logResult('Web preset', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.webp');
      expect(checkFileExists(outputFile, 'Web preset output')).to.be.true;
    });

    it('should work with thumbnail preset (png, 150x150, quality 60)', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const outputDir = path.join(testDir, 'thumbnail-preset');
      const command = `"${inputFile}" -p thumbnail -o "${outputDir}" -e prod`;

      const result = execCLI(command);
      logResult('Thumbnail preset', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(outputDir, 'image.png');
      expect(checkFileExists(outputFile, 'Thumbnail preset output')).to.be.true;
    });

    it('should work with alloy preset for mobile development', () => {
      const inputFile = path.join(testDir, 'image.png');
      const command = `"${inputFile}" -p alloy -e prod`;

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
      const command = `"${testDir}" -f webp -o "${outputDir}" -e prod`;

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
      const command = `"${testDir}" -o "${outputDir}" -e prod`;

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

      try {
        execCLI(command);
        expect.fail('Should have thrown an error for invalid width');
      } catch (error) {
        if (isVerbose) {
          console.log('✅ Correctly caught invalid width error');
        }
        expect(error.stderr || error.stdout).to.include('must be a positive integer');
      }
    });

    it('should handle invalid height parameter "-5"', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const command = `"${inputFile}" -h -5`;

      try {
        execCLI(command);
        expect.fail('Should have thrown an error for negative height');
      } catch (error) {
        if (isVerbose) {
          console.log('✅ Correctly caught invalid height error');
        }
        expect(error.stderr || error.stdout).to.include('must be a positive integer');
      }
    });

    it('should handle non-existent file "non-existent-file.jpg"', () => {
      const command = `"non-existent-file.jpg" -e prod`;

      try {
        execCLI(command);
        expect.fail('Should have thrown an error for non-existent file');
      } catch (error) {
        if (isVerbose) {
          console.log('✅ Correctly caught non-existent file error');
        }
        expect(error.stderr || error.stdout).to.include('does not exist');
      }
    });

    it('should handle missing source path', () => {
      const command = `-f webp`;

      try {
        execCLI(command);
        expect.fail('Should have thrown an error for missing source');
      } catch (error) {
        if (isVerbose) {
          console.log('✅ Correctly caught missing source error');
        }
        expect(error.stderr || error.stdout).to.include('provide a source file or folder');
      }
    });
  });

  describe('Debug mode tests', () => {
    it('should show debug information when enabled with -d flag', () => {
      const inputFile = path.join(testDir, 'image.jpg');
      const command = `"${inputFile}" -f webp -d -e prod`;

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
      const command = `"${inputFile}" -f webp -o "${customOutputDir}" -e prod`;

      const result = execCLI(command);
      logResult('Custom output', result);
      expect(result).to.include('Processed files: 1');

      const outputFile = path.join(customOutputDir, 'image.webp');
      expect(checkFileExists(outputFile, 'Custom output')).to.be.true;
    });
  });
});
