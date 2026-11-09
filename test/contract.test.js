'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const sharp = require('sharp');
const cli = path.resolve(__dirname, '../index.js');
describe('CLI correction contract', function () {
  this.timeout(60000);
  let dir;
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { cwd: dir, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
  const config = obj => fs.writeFileSync(path.join(dir, '.imgconverter.config.json'), JSON.stringify(obj));
  const image = async (name = 'a.png') => sharp({ create: { width: 40, height: 20, channels: 4, background: 'red' } }).png().toFile(path.join(dir, name));
  beforeEach(async () => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'imgconvert-contract-')); await image(); });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));
  it('shows help without arguments', () => { const r = run(); assert.equal(r.status, 0); assert.match(r.stdout, /Usage/); });
  for (const [flag, value] of [['--width','12px'], ['--width','1.5'], ['--quality','101'], ['--quality','0'], ['--crop','0.5,0,2,2'], ['--crop','-1,0,2,2'], ['--background','badhex'], ['--position','diagonal']]) {
    it(`rejects ${flag} ${value}`, () => { const r = run('a.png', flag, value); assert.equal(r.status, 1); assert.doesNotMatch(r.stderr, /\n\s+at /); });
  }
  it('rejects malformed JSON and unknown presets', () => {
    fs.writeFileSync(path.join(dir, '.imgconverter.config.json'), '{'); assert.equal(run('a.png').status, 1);
    fs.unlinkSync(path.join(dir, '.imgconverter.config.json')); assert.equal(run('a.png','-p','missing').status, 1);
  });
  it('applies JSON canvas with CLI negations and null fallback', async () => {
    config({ canvas: true, width: 50, height: 30, presets: { x: { width: null, trim: true } } });
    const r = run('a.png','-p','x','--no-trim','-o','out'); assert.equal(r.status, 0, r.stderr);
    const m = await sharp(path.join(dir,'out/a.png')).metadata(); assert.equal(m.width,50); assert.equal(m.height,30);
    const pixel = await sharp(path.join(dir,'out/a.png')).raw().toBuffer(); assert.equal(pixel[3],0);
    assert.equal(run('a.png','--no-canvas','-w','10','-o','scaled').status,0);
  });
  it('rejects invalid JSON options through the same validation', () => {
    for (const obj of [{width:'12px'},{quality:101},{trim:'false'},{crop:'0,0,1.5,2'},{position:'diagonal'},{inPlace:true,'replace-originals':false}]) { config(obj); assert.equal(run('a.png').status,1,JSON.stringify(obj)); }
  });
  it('keeps config show pure JSON', () => { config({canvas:true}); assert.equal(JSON.parse(run('config','show').stdout).canvas,true); });

  it('rejects colliding outputs before writing even with overwrite', async () => {
    await image('a.jpg'); const r = run('.', '-f','webp','--overwrite','-o',path.join(dir,'out')); assert.equal(r.status,1); assert.equal(fs.existsSync(path.join(dir,'out')),false);
  });
  it('protects existing destinations and allows explicit overwrite', () => {
    fs.mkdirSync(path.join(dir,'out')); fs.writeFileSync(path.join(dir,'out/a.png'),'sentinel');
    assert.equal(run('a.png','-o','out').status,1); assert.equal(fs.readFileSync(path.join(dir,'out/a.png'),'utf8'),'sentinel');
    assert.equal(run('a.png','-o','out','--overwrite').status,0);
  });
  it('updates input in place and preserves original on format change', async () => {
    assert.equal(run('a.png','--replace-originals','-w','10').status,0);
    assert.equal((await sharp(path.join(dir,'a.png')).metadata()).width,10);
    assert.equal(run('a.png','--in-place','-f','webp').status,0); assert.equal(fs.existsSync(path.join(dir,'a.webp')),true);
    assert.equal(fs.existsSync(path.join(dir,'converted')),false); assert.equal(fs.existsSync(path.join(dir,'a.png')),true);
    assert.equal(run('a.png','--in-place','-f','webp').status,1);
  });
  it('rejects output/in-place and unsupported or empty input', () => {
    assert.equal(run('a.png','--in-place','-o','out').status,1);
    fs.writeFileSync(path.join(dir,'a.svg'),'<svg/>'); assert.equal(run('a.svg').status,1);
    fs.mkdirSync(path.join(dir,'empty')); assert.equal(run('empty').status,1);
  });
  it('preserves valid batch outputs and reports partial failure', () => {
    fs.writeFileSync(path.join(dir,'bad.png'),'broken'); const r=run('.','-f','webp','-o',path.join(dir,'out')); assert.equal(r.status,2,r.stderr); assert.equal(fs.existsSync(path.join(dir,'out/a.webp')),true);
  });
  it('composes trim crop canvas and uses crop dimensions', async () => {
    await sharp({create:{width:20,height:10,channels:4,background:'red'}}).extend({top:5,bottom:5,left:5,right:5,background:'transparent'}).png().toFile(path.join(dir,'border.png'));
    const r=run('border.png','--trim','--crop','2,2,10,6','--canvas','--width','6','--height','12','--position','north-east','-o','out'); assert.equal(r.status,0,r.stderr);
    const m=await sharp(path.join(dir,'out/border.png')).metadata(); assert.equal(m.width,6); assert.equal(m.height,12);
    const {data,info}=await sharp(path.join(dir,'out/border.png')).raw().toBuffer({resolveWithObject:true}); assert.equal(data[3],255); assert.equal(data[(info.width*11)*4+3],0);
  });

  it('runs configured Alloy sources, selected preset/group and explicit output', async () => {
    config({presets:{custom:{icons:{android:{source:'a.png',format:'webp',output:'icons'},iphone:{source:'a.png',output:'icons'}}}}});
    const r=run('alloy','-p','custom','--group','icons','-o',path.join(dir,'assets')); assert.equal(r.status,0,r.stderr);
    assert.equal((await sharp(path.join(dir,'assets/app/assets/android/images/res-mdpi/icons/a.webp')).metadata()).width,10);
    assert.equal(fs.existsSync(path.join(dir,'assets/app/assets/iphone/images/icons/a@3x.png')),true);
    assert.equal(run('alloy','-p','custom','--group','missing').status,1);
  });
  it('plans collisions across Alloy groups before generating', () => {
    const group={android:{source:'a.png'}}; config({presets:{alloy:{one:group,two:group}}});
    assert.equal(run('alloy','--overwrite','-o',path.join(dir,'assets')).status,1);
    assert.equal(fs.existsSync(path.join(dir,'assets')),false);
  });

  it('brand dry-run decodes every supplied master without writes', () => {
    assert.equal(run('brand','a.png','--sdk','android','--marketplace','--monochrome-master','missing.png','--dry-run').status,1);
    fs.writeFileSync(path.join(dir,'bad.png'),'broken'); assert.equal(run('brand','bad.png','--sdk','android','--dry-run').status,1);
    assert.equal(fs.existsSync(path.join(dir,'.ti-branding')),false);
  });
  it('brand protects existing outputs, accepts zero padding and prints Android notes', () => {
    const first=run('brand','a.png','--sdk','android','--marketplace','--artwork-padding','0','--notes'); assert.equal(first.status,0,first.stderr); assert.doesNotMatch(first.stdout,/ti clean|tiapp.xml|DefaultIcon/);
    const target=path.join(dir,'.ti-branding/MarketplaceArtwork.png'); const original=fs.readFileSync(target);
    assert.equal(run('brand','a.png','--sdk','android','--marketplace').status,1); assert.deepEqual(fs.readFileSync(target),original);
    assert.equal(run('brand','a.png','--sdk','android','--marketplace','--overwrite').status,0);
    assert.deepEqual(fs.readdirSync(path.join(dir,'.ti-branding')).sort(),['MarketplaceArtwork.png','iTunesConnect.png']);
  });
  it('cleanup keeps Android landscape resources with iPhone-only portrait evidence and empty adaptive dirs', async () => {
    const landscape=path.join(dir,'app/assets/android/images/res-land-hdpi');fs.mkdirSync(landscape,{recursive:true});fs.writeFileSync(path.join(landscape,'active.png'),'keep');
    const assets=path.join(dir,'app/assets/android');fs.writeFileSync(path.join(assets,'appicon.png'),'keep');fs.writeFileSync(path.join(assets,'default.png'),'keep');
    fs.mkdirSync(path.join(dir,'app/platform/android/res/mipmap-anydpi-v26'),{recursive:true});
    fs.writeFileSync(path.join(dir,'tiapp.xml'),'<ti:app><ios><orientations><iphone><orientation>UIInterfaceOrientationPortrait</orientation></iphone></orientations></ios><android><manifest><application><activity android:screenOrientation="landscape"/></application></manifest></android></ti:app>');
    const r=run('brand','--cleanup-legacy');assert.equal(r.status,0,r.stderr);assert.equal(fs.existsSync(landscape),true);assert.equal(fs.existsSync(path.join(assets,'appicon.png')),true);assert.equal(fs.existsSync(path.join(assets,'default.png')),true);
  });

  it('uses legacy JSON replacement and supports explicit false negations', async () => {
    config({'replace-originals':true,width:10});assert.equal(run('a.png').status,0);assert.equal((await sharp(path.join(dir,'a.png')).metadata()).width,10);
    config({inPlace:true,overwrite:true,canvas:true,trim:true});assert.equal(run('a.png','--no-in-place','--no-overwrite','--no-canvas','--no-trim','-o','negated').status,0);
  });
  it('rejects effective JSON output/in-place and validates concurrency', () => {
    config({inPlace:true,output:'out'});assert.equal(run('a.png').status,1);config({});
    for(const n of ['0','2px','1.5','-1']) assert.equal(run('a.png','--concurrency',n).status,1);
  });
  it('generates all in-place formats from the same original pixels', async () => {
    const r=run('a.png','--in-place','-f','all','--crop','10,0,20,20');assert.equal(r.status,0,r.stderr);
    for(const ext of ['jpeg','jpg','png','webp','avif','tiff','gif']) assert.equal((await sharp(path.join(dir,`a.${ext}`)).metadata()).width,20);
  });
  it('keeps user master-like files after branding success and validation failure', () => {
    fs.mkdirSync(path.join(dir,'.ti-branding'));fs.writeFileSync(path.join(dir,'.ti-branding/_master_tight.png'),'user-owned');
    assert.equal(run('brand','a.png','--sdk','android','--marketplace').status,0);
    assert.equal(run('brand','a.png','--sdk','android','--marketplace','--monochrome-master','missing','--overwrite').status,1);
    assert.equal(fs.readFileSync(path.join(dir,'.ti-branding/_master_tight.png'),'utf8'),'user-owned');
  });
  it('validates all Alloy platform options before generating', () => {
    config({presets:{alloy:{android:{source:'a.png'},iphone:{source:'missing.png'}}}});assert.equal(run('alloy').status,1);assert.equal(fs.existsSync(path.join(dir,'app')),false);
    config({presets:{alloy:{android:{source:'a.png',quality:101}}}});assert.equal(run('alloy').status,1);
  });

  it('protects another input from in-place batch renaming even with overwrite', async () => {
    await sharp({create:{width:40,height:20,channels:4,background:'blue'}}).png().toFile(path.join(dir,'xa.png'));
    const original=fs.readFileSync(path.join(dir,'xa.png'));
    const r=run(dir,'--in-place','--overwrite','--rename','prefix:x','--concurrency','1');assert.equal(r.status,1,r.stderr);
    assert.deepEqual(fs.readFileSync(path.join(dir,'xa.png')),original);assert.equal(fs.existsSync(path.join(dir,'xxa.png')),false);
  });
  it('respects Alloy platform overwrite false over global true', () => {
    const target=path.join(dir,'app/assets/android/images/res-mdpi/a.png');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,'USER FILE');
    config({overwrite:true,presets:{custom:{android:{source:'a.png',overwrite:false}}}});
    assert.equal(run('alloy','-p','custom').status,1);assert.equal(fs.readFileSync(target,'utf8'),'USER FILE');
    assert.equal(run('alloy','-p','custom','--overwrite').status,0);
  });

  it('rejects malformed preset maps and selected definitions before writes', () => {
    for(const presets of ['oops',[],{bad:'oops'},{bad:[]},{bad:null}]) {
      config({presets});const r=run('a.png','-p','bad','-o','out');assert.equal(r.status,1,JSON.stringify(presets));assert.equal(fs.existsSync(path.join(dir,'out')),false);
    }
  });
});
