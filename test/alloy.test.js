'use strict';
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { execSync } = require('child_process');

describe('imgconvert alloy subcommand', function() {
  this.timeout(300000);

  const testDir = path.join(__dirname, 'temp-alloy');
  const imagesDir = path.join(__dirname, '..', 'images');

  before(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    // Copy test images
    const images = fs.readdirSync(imagesDir).filter(f => /\.(jpg|png)$/i.test(f));
    images.forEach(f => fs.copyFileSync(path.join(imagesDir, f), path.join(testDir, f)));
  });

  after(() => {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should generate alloy assets for a single PNG file', () => {
    const inputFile = path.join(testDir, fs.readdirSync(testDir).find(f => f.endsWith('.png')));
    const result = execSync(`node index.js alloy "${inputFile}"`, { encoding: 'utf8', stdio: 'pipe' });
    expect(result).to.match(/Processed files: [1-9]\d*/);
    // alloy outputs relative to the source file's directory (not cwd)
    expect(fs.existsSync(path.join(testDir, 'app', 'assets', 'android'))).to.be.true;
    expect(fs.existsSync(path.join(testDir, 'app', 'assets', 'iphone'))).to.be.true;
  });

  it('should generate android resolution directories (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)', () => {
    const inputFile = path.join(testDir, fs.readdirSync(testDir).find(f => f.endsWith('.png')));
    execSync(`node index.js alloy "${inputFile}"`, { encoding: 'utf8', stdio: 'pipe' });
    const androidImagesDir = path.join(testDir, 'app', 'assets', 'android', 'images');
    expect(fs.existsSync(androidImagesDir)).to.be.true;
    const resolutions = ['res-mdpi', 'res-hdpi', 'res-xhdpi', 'res-xxhdpi', 'res-xxxhdpi'];
    resolutions.forEach(res => {
      expect(fs.existsSync(path.join(androidImagesDir, res))).to.be.true;
    });
  });

  it('should generate iphone resolution directories (1x, 2x, 3x)', () => {
    const inputFile = path.join(testDir, fs.readdirSync(testDir).find(f => f.endsWith('.png')));
    execSync(`node index.js alloy "${inputFile}"`, { encoding: 'utf8', stdio: 'pipe' });
    const iphoneImagesDir = path.join(testDir, 'app', 'assets', 'iphone', 'images');
    expect(fs.existsSync(iphoneImagesDir)).to.be.true;
    if (fs.existsSync(iphoneImagesDir)) {
      const files = fs.readdirSync(iphoneImagesDir);
      expect(files.length).to.be.greaterThan(0);
    }
  });

  it('should process a JPG file', () => {
    const jpgFile = fs.readdirSync(testDir).find(f => /\.jpe?g$/i.test(f));
    if (!jpgFile) return; // skip if no jpg
    const inputFile = path.join(testDir, jpgFile);
    const result = execSync(`node index.js alloy "${inputFile}"`, { encoding: 'utf8', stdio: 'pipe' });
    expect(result).to.match(/Processed files: [1-9]\d*/);
  });

  it('should show alloy help with --help flag', () => {
    const result = execSync('node index.js alloy --help', { encoding: 'utf8', stdio: 'pipe' });
    expect(result).to.include('alloy');
    expect(result).to.include('source');
  });

  it('should error when no source is provided', () => {
    try {
      execSync('node index.js alloy', { encoding: 'utf8', stdio: 'pipe' });
      expect.fail('Should have exited with error');
    } catch (err) {
      expect(err.status).to.not.equal(0);
    }
  });
});
