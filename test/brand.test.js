'use strict';
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { execSync } = require('child_process');

describe('imgconvert brand subcommand', function() {
  this.timeout(300000);

  const imagesDir = path.join(__dirname, '..', 'images');
  // Find an SVG or fall back to first PNG as master
  const masterFile = (() => {
    const svg = fs.readdirSync(imagesDir).find(f => f.endsWith('.svg'));
    if (svg) return path.join(imagesDir, svg);
    const png = fs.readdirSync(imagesDir).find(f => f.endsWith('.png'));
    return png ? path.join(imagesDir, png) : null;
  })();

  after(() => {
    // Clean up brand output
    if (fs.existsSync('.ti-branding')) fs.rmSync('.ti-branding', { recursive: true, force: true });
  });

  it('should show brand --help with brand-specific flags', () => {
    const result = execSync('node index.js brand --help', { encoding: 'utf8', stdio: 'pipe' });
    expect(result).to.include('--adaptive');
    expect(result).to.include('--marketplace');
    expect(result).to.include('--notification');
    expect(result).to.include('--splash');
    expect(result).to.include('--bg-color');
    expect(result).to.include('--dry-run');
    expect(result).to.not.include('--width');
    expect(result).to.not.include('--rename');
  });

  it('should run with --cleanup-legacy --dry-run without master', () => {
    const result = execSync('node index.js brand --cleanup-legacy --dry-run', { encoding: 'utf8', stdio: 'pipe' });
    // cleanup-legacy does not require a master and exits 0
    expect(result).to.be.a('string');
    // Should mention dry run or cleanup
    expect(result).to.match(/dry.?run|cleanup|clean/i);
  });

  it('should error when no master and no --cleanup-legacy', () => {
    try {
      execSync('node index.js brand', { encoding: 'utf8', stdio: 'pipe' });
      expect.fail('Should have exited with error');
    } catch (err) {
      expect(err.status).to.not.equal(0);
      const output = (err.stdout || '') + (err.stderr || '');
      expect(output).to.match(/required|master/i);
    }
  });

  if (masterFile) {
    it('should run --dry-run without writing files', () => {
      if (fs.existsSync('.ti-branding')) fs.rmSync('.ti-branding', { recursive: true, force: true });
      execSync(`node index.js brand "${masterFile}" --dry-run`, { encoding: 'utf8', stdio: 'pipe' });
      // In dry-run mode, no actual output staging dir should be written
      expect(fs.existsSync('.ti-branding')).to.be.false;
    });

    it('should run with --adaptive --dry-run', () => {
      const result = execSync(`node index.js brand "${masterFile}" --adaptive --dry-run`, { encoding: 'utf8', stdio: 'pipe' });
      expect(result).to.be.a('string');
    });

    it('should run with --marketplace --dry-run', () => {
      const result = execSync(`node index.js brand "${masterFile}" --marketplace --dry-run`, { encoding: 'utf8', stdio: 'pipe' });
      expect(result).to.be.a('string');
    });
  }
});
