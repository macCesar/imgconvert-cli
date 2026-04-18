const fs = require('fs');
const path = require('path');
const os = require('os');
const { expect } = require('chai');
const {
  readTiapp,
  detectProjectType,
  resolveAndroidResRoot,
  hasAdaptiveIcons
} = require('../src/processors/alloy-modern/tiapp-reader');

describe('tiapp-reader', () => {
  const testRoot = path.join(os.tmpdir(), 'imgconvert-tiapp-test');

  beforeEach(() => {
    fs.rmSync(testRoot, { recursive: true, force: true });
    fs.mkdirSync(testRoot, { recursive: true });
  });

  after(() => {
    fs.rmSync(testRoot, { recursive: true, force: true });
  });

  describe('readTiapp', () => {
    const writeTiapp = (xml) => {
      const p = path.join(testRoot, 'tiapp.xml');
      fs.writeFileSync(p, xml, 'utf8');
      return p;
    };

    it('returns exists=false for missing file', () => {
      const result = readTiapp(path.join(testRoot, 'nope.xml'));
      expect(result.exists).to.equal(false);
      expect(result.storyboardEnabled).to.equal(false);
    });

    it('detects storyboardEnabled=true', () => {
      const p = writeTiapp(`<?xml version="1.0"?>
<ti:app xmlns:ti="http://ti.tidev.io">
  <ios>
    <enable-launch-screen-storyboard>true</enable-launch-screen-storyboard>
  </ios>
</ti:app>`);
      const result = readTiapp(p);
      expect(result.exists).to.equal(true);
      expect(result.storyboardEnabled).to.equal(true);
    });

    it('detects storyboardEnabled=false when tag is missing', () => {
      const p = writeTiapp(`<?xml version="1.0"?>
<ti:app xmlns:ti="http://ti.tidev.io"><ios></ios></ti:app>`);
      const result = readTiapp(p);
      expect(result.storyboardEnabled).to.equal(false);
    });

    it('reads default-background-color', () => {
      const p = writeTiapp(`<?xml version="1.0"?>
<ti:app xmlns:ti="http://ti.tidev.io">
  <ios>
    <default-background-color>#0B1326</default-background-color>
  </ios>
</ti:app>`);
      const result = readTiapp(p);
      expect(result.defaultBgColor).to.equal('#0B1326');
    });

    it('detects portraitOnly when orientations has no landscape entries', () => {
      const p = writeTiapp(`<?xml version="1.0"?>
<ti:app xmlns:ti="http://ti.tidev.io">
  <ios>
    <orientations>
      <iphone>
        <orientation>UIInterfaceOrientationPortrait</orientation>
      </iphone>
    </orientations>
  </ios>
</ti:app>`);
      const result = readTiapp(p);
      expect(result.portraitOnly).to.equal(true);
    });

    it('detects portraitOnly=false when landscape is allowed', () => {
      const p = writeTiapp(`<?xml version="1.0"?>
<ti:app xmlns:ti="http://ti.tidev.io">
  <ios>
    <orientations>
      <iphone>
        <orientation>UIInterfaceOrientationPortrait</orientation>
        <orientation>UIInterfaceOrientationLandscapeLeft</orientation>
      </iphone>
    </orientations>
  </ios>
</ti:app>`);
      const result = readTiapp(p);
      expect(result.portraitOnly).to.equal(false);
    });
  });

  describe('detectProjectType', () => {
    it('detects alloy layout when app/ exists', () => {
      fs.mkdirSync(path.join(testRoot, 'app'));
      expect(detectProjectType(testRoot)).to.equal('alloy');
    });

    it('detects classic layout when Resources/ exists', () => {
      fs.mkdirSync(path.join(testRoot, 'Resources'));
      expect(detectProjectType(testRoot)).to.equal('classic');
    });

    it('returns unknown when neither is present', () => {
      expect(detectProjectType(testRoot)).to.equal('unknown');
    });

    it('prefers alloy if both are present', () => {
      fs.mkdirSync(path.join(testRoot, 'app'));
      fs.mkdirSync(path.join(testRoot, 'Resources'));
      expect(detectProjectType(testRoot)).to.equal('alloy');
    });
  });

  describe('resolveAndroidResRoot', () => {
    it('maps alloy → app/platform/android/res', () => {
      const p = resolveAndroidResRoot('/tmp/foo', 'alloy');
      expect(p).to.equal(path.join('/tmp/foo', 'app', 'platform', 'android', 'res'));
    });

    it('maps classic → platform/android/res', () => {
      const p = resolveAndroidResRoot('/tmp/foo', 'classic');
      expect(p).to.equal(path.join('/tmp/foo', 'platform', 'android', 'res'));
    });

    it('returns null for unknown', () => {
      expect(resolveAndroidResRoot('/tmp/foo', 'unknown')).to.equal(null);
    });
  });

  describe('hasAdaptiveIcons', () => {
    it('returns false when mipmap-anydpi-v26 does not exist', () => {
      expect(hasAdaptiveIcons(testRoot)).to.equal(false);
    });

    it('returns true for alloy project with adaptive icons', () => {
      fs.mkdirSync(
        path.join(testRoot, 'app', 'platform', 'android', 'res', 'mipmap-anydpi-v26'),
        { recursive: true }
      );
      expect(hasAdaptiveIcons(testRoot)).to.equal(true);
    });

    it('returns true for classic project with adaptive icons', () => {
      fs.mkdirSync(
        path.join(testRoot, 'platform', 'android', 'res', 'mipmap-anydpi-v26'),
        { recursive: true }
      );
      expect(hasAdaptiveIcons(testRoot)).to.equal(true);
    });
  });
});
