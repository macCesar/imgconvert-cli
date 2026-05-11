'use strict';
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { execSync } = require('child_process');

describe('imgconvert brand subcommand', function() {
  this.timeout(300000);

  const imagesDir = path.join(__dirname, '..', 'images');
  const masterFile = (() => {
    const svg = fs.readdirSync(imagesDir).find(f => f.endsWith('.svg'));
    if (svg) return path.join(imagesDir, svg);
    const png = fs.readdirSync(imagesDir).find(f => f.endsWith('.png'));
    return png ? path.join(imagesDir, png) : null;
  })();

  after(() => {
    if (fs.existsSync('.ti-branding')) fs.rmSync('.ti-branding', { recursive: true, force: true });
  });

  it('should show brand --help with the public flags', () => {
    const result = execSync('node index.js brand --help', { encoding: 'utf8', stdio: 'pipe' });
    expect(result).to.include('--sdk');
    expect(result).to.include('--adaptive');
    expect(result).to.include('--marketplace');
    expect(result).to.include('--notification');
    expect(result).to.include('--splash');
    expect(result).to.include('--bg-color');
    expect(result).to.include('--dry-run');
    expect(result).to.not.include('--width');
    expect(result).to.not.include('--rename');
  });

  it('should run --cleanup-legacy --dry-run without master or --sdk', () => {
    const result = execSync('node index.js brand --cleanup-legacy --dry-run', { encoding: 'utf8', stdio: 'pipe' });
    expect(result).to.be.a('string');
    expect(result).to.match(/dry.?run|cleanup|clean/i);
  });

  it('should error when no master and no --cleanup-legacy', () => {
    try {
      execSync('node index.js brand', { encoding: 'utf8', stdio: 'pipe' });
      expect.fail('Should have exited with error');
    } catch (err) {
      expect(err.status).to.not.equal(0);
      const output = (err.stdout || '') + (err.stderr || '');
      expect(output).to.match(/--sdk|master/i);
    }
  });

  if (masterFile) {
    it('should error when --sdk is missing', () => {
      try {
        execSync(`node index.js brand "${masterFile}" --dry-run`, { encoding: 'utf8', stdio: 'pipe' });
        expect.fail('Should have exited with error');
      } catch (err) {
        expect(err.status).to.not.equal(0);
        const output = (err.stdout || '') + (err.stderr || '');
        expect(output).to.match(/--sdk/i);
        expect(output).to.include('android');
      }
    });

    it('should error on invalid --sdk value', () => {
      try {
        execSync(`node index.js brand "${masterFile}" --sdk bogus --dry-run`, { encoding: 'utf8', stdio: 'pipe' });
        expect.fail('Should have exited with error');
      } catch (err) {
        expect(err.status).to.not.equal(0);
        const output = (err.stdout || '') + (err.stderr || '');
        expect(output).to.match(/--sdk|bogus/i);
      }
    });

    it('should run --dry-run with --sdk android', () => {
      const result = execSync(
        `node index.js brand "${masterFile}" --sdk android --dry-run`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      expect(result).to.be.a('string');
      // imgconvert does NOT emit iOS Dark/Tinted — that's purgetss's territory
      expect(result).to.not.include('DefaultIcon-Dark.png');
      expect(result).to.not.include('DefaultIcon-Tinted.png');
    });

    it('should run with --sdk android --adaptive --dry-run', () => {
      const result = execSync(
        `node index.js brand "${masterFile}" --sdk android --adaptive --dry-run`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      expect(result).to.be.a('string');
      expect(result).to.match(/mipmap|adaptive/i);
    });

    it('should run with --sdk android --marketplace --dry-run', () => {
      const result = execSync(
        `node index.js brand "${masterFile}" --sdk android --marketplace --dry-run`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      expect(result).to.be.a('string');
      expect(result).to.match(/marketplace|iTunesConnect/i);
    });
  }
});

describe('legacy shims', function() {
  this.timeout(30000);

  it('should rewrite `-h <n>` to `--height <n>` with a deprecation warning', () => {
    const imagesDir = path.join(__dirname, '..', 'images');
    const png = fs.readdirSync(imagesDir).find(f => f.endsWith('.png') || f.endsWith('.jpg'));
    if (!png) return;
    const srcFile = path.join(imagesDir, png);
    const outputDir = path.join(__dirname, '..', 'test-output-legacy-h');
    if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });

    const result = execSync(
      `node index.js "${srcFile}" -h 100 -o "${outputDir}" 2>&1`,
      { encoding: 'utf8', stdio: 'pipe', shell: '/bin/bash' }
    );
    expect(result).to.match(/deprecated|--height/i);

    if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
  });

  it('should rewrite bare `config` to `config init` with a warning', () => {
    const configFile = path.join(process.cwd(), '.imgconverter.config.json');
    const backup = fs.existsSync(configFile)
      ? fs.readFileSync(configFile, 'utf8')
      : null;
    if (fs.existsSync(configFile)) fs.unlinkSync(configFile);

    const result = execSync(
      `node index.js config 2>&1`,
      { encoding: 'utf8', stdio: 'pipe', shell: '/bin/bash' }
    );
    expect(result).to.match(/deprecated|config init/i);
    expect(fs.existsSync(configFile)).to.be.true;

    if (backup !== null) fs.writeFileSync(configFile, backup);
    else if (fs.existsSync(configFile)) fs.unlinkSync(configFile);
  });
});
