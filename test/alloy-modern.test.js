const fs = require('fs');
const path = require('path');
const os = require('os');
const { expect } = require('chai');
const { execFileSync } = require('child_process');

/**
 * Integration tests for the modern Alloy branding pipeline.
 * Exercises the CLI end-to-end and inspects the generated files on disk.
 */
describe('Alloy modern branding pipeline', function () {
  this.timeout(120000);

  const cliPath = path.resolve(__dirname, '..', 'index.js');
  const testRoot = path.join(os.tmpdir(), 'imgconvert-modern-test');
  const masterSvg = path.join(testRoot, 'master.svg');
  const stagingDir = path.join(testRoot, '.staging');

  /** Run the CLI with an args array — no shell interpolation. */
  const runCli = (args) => execFileSync('node', [cliPath, ...args], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  /**
   * A minimal SVG used as the master input. Sharp can rasterize plain shapes
   * reliably without needing external assets.
   */
  const SAMPLE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="20" y="20" width="60" height="60" fill="#FDD900"/>
  <circle cx="50" cy="50" r="20" fill="#422006"/>
</svg>`;

  beforeEach(() => {
    fs.rmSync(testRoot, { recursive: true, force: true });
    fs.mkdirSync(testRoot, { recursive: true });
    fs.writeFileSync(masterSvg, SAMPLE_SVG, 'utf8');
  });

  after(() => {
    fs.rmSync(testRoot, { recursive: true, force: true });
  });

  describe('prepare-master', () => {
    const { prepareMaster } = require('../src/processors/alloy-modern/prepare-master');

    it('produces tight + square PNG masters from an SVG input', async () => {
      const base = path.join(testRoot, '_master');
      const { square, tight } = await prepareMaster(masterSvg, base);
      expect(fs.existsSync(square)).to.equal(true);
      expect(fs.existsSync(tight)).to.equal(true);
    });

    it('square master is exactly 1024x1024', async () => {
      const base = path.join(testRoot, '_master');
      const { square } = await prepareMaster(masterSvg, base);
      const sharp = require('sharp');
      const meta = await sharp(square).metadata();
      expect(meta.width).to.equal(1024);
      expect(meta.height).to.equal(1024);
    });

    it('tight master preserves aspect (square SVG → 1024x1024)', async () => {
      const base = path.join(testRoot, '_master');
      const { tight } = await prepareMaster(masterSvg, base);
      const sharp = require('sharp');
      const meta = await sharp(tight).metadata();
      expect(meta.width).to.equal(1024);
      expect(meta.height).to.equal(1024);
    });

    it('rejects unsupported format', async () => {
      const bad = path.join(testRoot, 'bad.xyz');
      fs.writeFileSync(bad, 'not-an-image');
      try {
        await prepareMaster(bad, path.join(testRoot, '_master'));
        expect.fail('should have thrown');
      } catch (err) {
        expect(err.message).to.include('Unsupported master format');
      }
    });
  });

  describe('gen-ios', () => {
    const { prepareMaster } = require('../src/processors/alloy-modern/prepare-master');
    const { genIos } = require('../src/processors/alloy-modern/gen-ios');

    it('emits DefaultIcon.png (with alpha) and DefaultIcon-ios.png (no alpha)', async () => {
      const { tight } = await prepareMaster(masterSvg, path.join(testRoot, '_master'));
      const { defaultIcon, defaultIconIos } = await genIos(tight, '#0B1326', 8, testRoot);

      const sharp = require('sharp');
      const metaAlpha = await sharp(defaultIcon).metadata();
      const metaFlat = await sharp(defaultIconIos).metadata();

      expect(metaAlpha.width).to.equal(1024);
      expect(metaAlpha.height).to.equal(1024);
      expect(metaAlpha.hasAlpha).to.equal(true);

      expect(metaFlat.width).to.equal(1024);
      expect(metaFlat.height).to.equal(1024);
      expect(metaFlat.hasAlpha).to.equal(false);
    });
  });

  describe('gen-marketplace', () => {
    const { prepareMaster } = require('../src/processors/alloy-modern/prepare-master');
    const { genMarketplace } = require('../src/processors/alloy-modern/gen-marketplace');

    it('emits iTunesConnect.png (1024²) + MarketplaceArtwork.png (512²), both with alpha', async () => {
      const { tight } = await prepareMaster(masterSvg, path.join(testRoot, '_master'));
      const { itunesConnect, marketplaceArtwork } = await genMarketplace(tight, 8, testRoot);

      const sharp = require('sharp');
      const metaIos = await sharp(itunesConnect).metadata();
      const metaPlay = await sharp(marketplaceArtwork).metadata();

      expect(metaIos.width).to.equal(1024);
      expect(metaIos.height).to.equal(1024);
      expect(metaIos.hasAlpha).to.equal(true);

      expect(metaPlay.width).to.equal(512);
      expect(metaPlay.height).to.equal(512);
      expect(metaPlay.hasAlpha).to.equal(true);
    });
  });

  describe('gen-android-adaptive', () => {
    const { prepareMaster } = require('../src/processors/alloy-modern/prepare-master');
    const { genAndroidAdaptive, DENSITIES } = require('../src/processors/alloy-modern/gen-android-adaptive');

    it('emits foreground + background + monochrome × 5 densities at correct sizes', async () => {
      const { tight } = await prepareMaster(masterSvg, path.join(testRoot, '_master'));
      const resRoot = path.join(testRoot, 'res');
      await genAndroidAdaptive(tight, '#0B1326', 22, resRoot);

      const sharp = require('sharp');
      for (const { name, size } of DENSITIES) {
        const dir = path.join(resRoot, `mipmap-${name}`);
        for (const layer of ['ic_launcher_foreground', 'ic_launcher_background', 'ic_launcher_monochrome']) {
          const file = path.join(dir, `${layer}.png`);
          expect(fs.existsSync(file), `missing ${name}/${layer}`).to.equal(true);
          const meta = await sharp(file).metadata();
          expect(meta.width).to.equal(size);
          expect(meta.height).to.equal(size);
        }
      }
      expect(fs.existsSync(path.join(resRoot, 'mipmap-anydpi-v26'))).to.equal(true);
    });
  });

  describe('gen-android-legacy', () => {
    const { prepareMaster } = require('../src/processors/alloy-modern/prepare-master');
    const { genAndroidLegacy, LEGACY_DENSITIES } = require('../src/processors/alloy-modern/gen-android-legacy');

    it('emits ic_launcher.png × 5 at legacy sizes (48..192)', async () => {
      const { tight } = await prepareMaster(masterSvg, path.join(testRoot, '_master'));
      const resRoot = path.join(testRoot, 'res');
      await genAndroidLegacy(tight, '#0B1326', 22, resRoot);

      const sharp = require('sharp');
      for (const { name, size } of LEGACY_DENSITIES) {
        const file = path.join(resRoot, `mipmap-${name}`, 'ic_launcher.png');
        expect(fs.existsSync(file)).to.equal(true);
        const meta = await sharp(file).metadata();
        expect(meta.width).to.equal(size);
        expect(meta.height).to.equal(size);
      }
    });
  });

  describe('gen-notification', () => {
    const { prepareMaster } = require('../src/processors/alloy-modern/prepare-master');
    const { genNotification, NOTIFICATION_DENSITIES } = require('../src/processors/alloy-modern/gen-notification');

    it('emits ic_stat_notify.png × 5 at 24..96', async () => {
      const { tight } = await prepareMaster(masterSvg, path.join(testRoot, '_master'));
      const resRoot = path.join(testRoot, 'res');
      await genNotification(tight, 22, resRoot);

      const sharp = require('sharp');
      for (const { name, size } of NOTIFICATION_DENSITIES) {
        const file = path.join(resRoot, `drawable-${name}`, 'ic_stat_notify.png');
        expect(fs.existsSync(file)).to.equal(true);
        const meta = await sharp(file).metadata();
        expect(meta.width).to.equal(size);
        expect(meta.height).to.equal(size);
        expect(meta.hasAlpha).to.equal(true);
      }
    });
  });

  describe('gen-splash', () => {
    const { prepareMaster } = require('../src/processors/alloy-modern/prepare-master');
    const { genSplash, SPLASH_DENSITIES } = require('../src/processors/alloy-modern/gen-splash');

    it('emits splash_icon.png × 5 at 288..1152', async () => {
      const { tight } = await prepareMaster(masterSvg, path.join(testRoot, '_master'));
      const resRoot = path.join(testRoot, 'res');
      await genSplash(tight, resRoot);

      const sharp = require('sharp');
      for (const { name, size } of SPLASH_DENSITIES) {
        const file = path.join(resRoot, `drawable-${name}`, 'splash_icon.png');
        expect(fs.existsSync(file)).to.equal(true);
        const meta = await sharp(file).metadata();
        expect(meta.width).to.equal(size);
        expect(meta.height).to.equal(size);
      }
    });
  });

  describe('gen-ic-launcher-xml', () => {
    const { genIcLauncherXml } = require('../src/processors/alloy-modern/gen-ic-launcher-xml');

    it('writes the adaptive-icon binder to mipmap-anydpi-v26', () => {
      const resRoot = path.join(testRoot, 'res');
      const xmlPath = genIcLauncherXml(resRoot);
      expect(fs.existsSync(xmlPath)).to.equal(true);
      const xml = fs.readFileSync(xmlPath, 'utf8');
      expect(xml).to.include('<adaptive-icon');
      expect(xml).to.include('ic_launcher_foreground');
      expect(xml).to.include('ic_launcher_background');
      expect(xml).to.include('ic_launcher_monochrome');
    });
  });

  describe('CLI integration — kitchen sink (--modern)', () => {
    beforeEach(() => {
      fs.mkdirSync(path.join(testRoot, 'app'), { recursive: true });
    });

    it('generates the full modern asset set via CLI', () => {
      runCli([
        masterSvg,
        '--preset', 'alloy',
        '--modern',
        '--bg-color', '#0B1326',
        '--project', testRoot,
        '--output', stagingDir
      ]);

      for (const f of ['DefaultIcon.png', 'DefaultIcon-ios.png', 'iTunesConnect.png', 'MarketplaceArtwork.png']) {
        expect(fs.existsSync(path.join(stagingDir, f)), `missing ${f}`).to.equal(true);
      }
      expect(fs.existsSync(
        path.join(stagingDir, 'app', 'platform', 'android', 'res', 'mipmap-anydpi-v26', 'ic_launcher.xml')
      )).to.equal(true);
      expect(fs.existsSync(
        path.join(stagingDir, 'app', 'platform', 'android', 'res', 'mipmap-xxxhdpi', 'ic_launcher_foreground.png')
      )).to.equal(true);
      expect(fs.existsSync(
        path.join(stagingDir, 'app', 'platform', 'android', 'res', 'drawable-xxxhdpi', 'ic_stat_notify.png')
      )).to.equal(true);
      expect(fs.existsSync(
        path.join(stagingDir, 'app', 'platform', 'android', 'res', 'drawable-xxxhdpi', 'splash_icon.png')
      )).to.equal(true);
    });

    it('honors --dry-run (no files written)', () => {
      runCli([
        masterSvg,
        '--preset', 'alloy',
        '--modern',
        '--project', testRoot,
        '--output', stagingDir,
        '--dry-run'
      ]);

      expect(fs.existsSync(stagingDir)).to.equal(false);
    });

    it('--adaptive alone skips marketplace and extras', () => {
      runCli([
        masterSvg,
        '--preset', 'alloy',
        '--adaptive',
        '--project', testRoot,
        '--output', stagingDir
      ]);

      expect(fs.existsSync(path.join(stagingDir, 'DefaultIcon.png'))).to.equal(true);
      expect(fs.existsSync(path.join(stagingDir, 'iTunesConnect.png'))).to.equal(false);
      expect(fs.existsSync(
        path.join(stagingDir, 'app', 'platform', 'android', 'res', 'drawable-mdpi', 'ic_stat_notify.png')
      )).to.equal(false);
    });
  });
});
