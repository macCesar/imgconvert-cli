'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { atomicWrite, planOperations, mapLimit } = require('../src/utils/operations');
describe('Shared operation safety and queue', () => {
  let dir;
  beforeEach(() => {dir = fs.mkdtempSync(path.join(os.tmpdir(),'imgconvert-ops-'));});
  afterEach(() => fs.rmSync(dir,{recursive:true,force:true}));
  it('preserves a destination created after planning and removes own temporary', async () => {
    const destination=path.join(dir,'image.png');planOperations([{destination}]);
    await assert.rejects(atomicWrite(destination,async temp => {fs.writeFileSync(temp,'generated');fs.writeFileSync(destination,'racing user');}), {code:'EEXIST'});
    assert.equal(fs.readFileSync(destination,'utf8'),'racing user');assert.deepEqual(fs.readdirSync(dir),['image.png']);
  });
  it('removes own temporary after encoder failure and preserves existing temporaries', async () => {
    fs.writeFileSync(path.join(dir,'_master_tight.png'),'user');
    await assert.rejects(atomicWrite(path.join(dir,'out.png'), async temp => {fs.writeFileSync(temp,'partial');throw new Error('encoder failure');}));
    assert.deepEqual(fs.readdirSync(dir),['_master_tight.png']);
  });
  for (const concurrency of [1,2,4]) it(`runs at most ${concurrency} inputs including their variants`, async () => {
    let active=0, peak=0;
    const result=await mapLimit([0,1,2,3,4,5,6,7],concurrency,async value => {
      active++;peak=Math.max(peak,active);
      for(let variant=0;variant<3;variant++) await new Promise(resolve=>setTimeout(resolve,2));
      active--;return value;
    });
    assert.equal(peak,concurrency);assert.deepEqual(result,[0,1,2,3,4,5,6,7]);
  });
});
