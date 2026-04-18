const fs = require('fs');
const path = require('path');
const os = require('os');
const { expect } = require('chai');
const { cleanupLegacy } = require('../src/processors/alloy-modern/cleanup-legacy');

describe('cleanup-legacy', function () {
  this.timeout(20000);

  const testRoot = path.join(os.tmpdir(), 'imgconvert-cleanup-test');

  // Silence logger during tests by redirecting console output
  let originalLog, originalErr;
  beforeEach(() => {
    originalLog = console.log;
    originalErr = console.error;
    console.log = () => {};
    console.error = () => {};
  });
  afterEach(() => {
    console.log = originalLog;
    console.error = originalErr;
  });

  beforeEach(() => {
    fs.rmSync(testRoot, { recursive: true, force: true });
    fs.mkdirSync(testRoot, { recursive: true });
  });

  after(() => {
    fs.rmSync(testRoot, { recursive: true, force: true });
  });

  /** Create a nested file under testRoot for the cleanup plan to find. */
  const touch = (...parts) => {
    const full = path.join(testRoot, ...parts);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, '');
    return full;
  };

  /** Write tiapp.xml with optional storyboard/orientation hints. */
  const writeTiapp = ({ storyboard = false, portrait = false } = {}) => {
    const sb = storyboard
      ? '<enable-launch-screen-storyboard>true</enable-launch-screen-storyboard>'
      : '';
    const orient = portrait
      ? `<orientations>
           <iphone>
             <orientation>UIInterfaceOrientationPortrait</orientation>
           </iphone>
         </orientations>`
      : '';
    fs.writeFileSync(
      path.join(testRoot, 'tiapp.xml'),
      `<?xml version="1.0"?>
<ti:app xmlns:ti="http://ti.tidev.io">
  <ios>${sb}${orient}</ios>
</ti:app>`,
      'utf8'
    );
  };

  it('returns 0 removed when project has no legacy artifacts', async () => {
    fs.mkdirSync(path.join(testRoot, 'app'));
    writeTiapp();
    const result = await cleanupLegacy({
      projectRoot: testRoot,
      projectType: 'alloy',
      aggressive: false,
      dryRun: false
    });
    expect(result.removed).to.equal(0);
  });

  it('SAFE: removes res-long-* and res-notlong-* directories always', async () => {
    fs.mkdirSync(path.join(testRoot, 'app'));
    writeTiapp();
    touch('app', 'assets', 'android', 'images', 'res-long-land-hdpi', 'default.png');
    touch('app', 'assets', 'android', 'images', 'res-notlong-port-mdpi', 'default.png');

    const result = await cleanupLegacy({
      projectRoot: testRoot,
      projectType: 'alloy',
      aggressive: false,
      dryRun: false
    });

    expect(result.removed).to.be.at.least(2);
    expect(fs.existsSync(path.join(testRoot, 'app/assets/android/images/res-long-land-hdpi'))).to.equal(false);
    expect(fs.existsSync(path.join(testRoot, 'app/assets/android/images/res-notlong-port-mdpi'))).to.equal(false);
  });

  it('CONDITIONAL: removes iOS Default-*.png ONLY when storyboard is enabled', async () => {
    fs.mkdirSync(path.join(testRoot, 'app'));
    writeTiapp({ storyboard: false });
    touch('app', 'assets', 'iphone', 'Default-568h@2x.png');

    // Without storyboard → NOT removed
    await cleanupLegacy({
      projectRoot: testRoot, projectType: 'alloy', aggressive: false, dryRun: false
    });
    expect(fs.existsSync(path.join(testRoot, 'app/assets/iphone/Default-568h@2x.png'))).to.equal(true);

    // Enable storyboard → now removed
    writeTiapp({ storyboard: true });
    await cleanupLegacy({
      projectRoot: testRoot, projectType: 'alloy', aggressive: false, dryRun: false
    });
    expect(fs.existsSync(path.join(testRoot, 'app/assets/iphone/Default-568h@2x.png'))).to.equal(false);
  });

  it('CONDITIONAL: removes legacy appicon.png when adaptive icons are present', async () => {
    fs.mkdirSync(path.join(testRoot, 'app'));
    fs.mkdirSync(path.join(testRoot, 'app/platform/android/res/mipmap-anydpi-v26'), { recursive: true });
    writeTiapp();
    touch('app', 'assets', 'android', 'appicon.png');
    touch('app', 'assets', 'android', 'default.png');

    await cleanupLegacy({
      projectRoot: testRoot, projectType: 'alloy', aggressive: false, dryRun: false
    });
    expect(fs.existsSync(path.join(testRoot, 'app/assets/android/appicon.png'))).to.equal(false);
    expect(fs.existsSync(path.join(testRoot, 'app/assets/android/default.png'))).to.equal(false);
  });

  it('AGGRESSIVE: removes ldpi density folders only when --aggressive is set', async () => {
    fs.mkdirSync(path.join(testRoot, 'app'));
    writeTiapp();
    touch('app', 'platform', 'android', 'res', 'drawable-ldpi', 'foo.png');
    touch('app', 'assets', 'android', 'images', 'res-ldpi', 'default.png');

    // Without aggressive → kept
    await cleanupLegacy({
      projectRoot: testRoot, projectType: 'alloy', aggressive: false, dryRun: false
    });
    expect(fs.existsSync(path.join(testRoot, 'app/platform/android/res/drawable-ldpi'))).to.equal(true);
    expect(fs.existsSync(path.join(testRoot, 'app/assets/android/images/res-ldpi'))).to.equal(true);

    // With aggressive → removed
    await cleanupLegacy({
      projectRoot: testRoot, projectType: 'alloy', aggressive: true, dryRun: false
    });
    expect(fs.existsSync(path.join(testRoot, 'app/platform/android/res/drawable-ldpi'))).to.equal(false);
    expect(fs.existsSync(path.join(testRoot, 'app/assets/android/images/res-ldpi'))).to.equal(false);
  });

  it('dry-run never removes anything', async () => {
    fs.mkdirSync(path.join(testRoot, 'app'));
    writeTiapp();
    const target = touch('app', 'assets', 'android', 'images', 'res-long-land-hdpi', 'default.png');

    const result = await cleanupLegacy({
      projectRoot: testRoot, projectType: 'alloy', aggressive: true, dryRun: true
    });

    expect(result.removed).to.equal(0);
    expect(fs.existsSync(target)).to.equal(true);
  });
});
