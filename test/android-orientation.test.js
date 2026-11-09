'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {readTiapp}=require('../src/processors/alloy-modern/tiapp-reader');
const {cleanupLegacy}=require('../src/processors/alloy-modern/cleanup-legacy');
describe('Android cleanup evidence',()=>{
  let dir;
  beforeEach(()=>{dir=fs.mkdtempSync(path.join(os.tmpdir(),'imgconvert-orientation-'));});
  afterEach(()=>fs.rmSync(dir,{recursive:true,force:true}));
  function config(activities){
    const file=path.join(dir,'tiapp.xml');fs.writeFileSync(file,`<ti:app xmlns:ti="http://ti.tidev.io"><android><manifest xmlns:android="http://schemas.android.com/apk/res/android"><application>${activities}</application></manifest></android></ti:app>`);return file;
  }
  const launcher='<activity android:name=".Main" android:screenOrientation="portrait"><intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter></activity>';
  it('requires portrait evidence for every activity and the launcher',()=>{
    assert.equal(readTiapp(config(launcher)).androidPortraitOnly,true);
    assert.equal(readTiapp(config(launcher+'<activity android:name=".Other"/>')).androidPortraitOnly,false);
    assert.equal(readTiapp(config(launcher+'<activity android:screenOrientation="landscape"/>')).androidPortraitOnly,false);
    assert.equal(readTiapp(config('<activity android:screenOrientation="portrait"/>')).androidPortraitOnly,false);
  });
  it('keeps landscape resources if an external manifest conflicts',()=>{
    const file=config(launcher);const base=path.join(dir,'app/platform/android');fs.mkdirSync(base,{recursive:true});fs.writeFileSync(path.join(base,'AndroidManifest.xml'),'<manifest><application><activity android:screenOrientation="landscape"/></application></manifest>');
    assert.equal(readTiapp(file).androidPortraitOnly,false);
  });
  it('can remove landscape variants with explicit Android-only portrait evidence',async()=>{
    config(launcher);const landscape=path.join(dir,'app/assets/android/images/res-land-hdpi');fs.mkdirSync(landscape,{recursive:true});fs.writeFileSync(path.join(landscape,'test.png'),'unused');
    await cleanupLegacy({projectRoot:dir,projectType:'alloy'});assert.equal(fs.existsSync(landscape),false);
  });
});
