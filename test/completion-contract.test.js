'use strict';
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {bashCompletion,zshCompletion,fishCompletion}=require('../src/cli/completions');
describe('Commander-derived completion',()=>{
  it('completes arguments after source and options in bash',()=>{
    const script=bashCompletion();
    function complete(words){const r=spawnSync('bash',['-c',script+'\nCOMP_WORDS=('+words+'); COMP_CWORD=$(('+words.split(' ').length+'-1)); _imgconvert_completions; printf "%s\\n" "${COMPREPLY[@]}"'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout;}
    assert.match(complete('imgconvert photo.png --format j'),/jpg/);
    assert.match(complete('imgconvert brand logo.png --sdk a'),/android/);
    assert.match(complete('imgconvert alloy photo.png --o'),/--overwrite/);
    assert.doesNotMatch(complete('imgconvert brand logo.png --'),/--canvas/);
    assert.match(complete('imgconvert config init --f'),/--force/);
    assert.match(complete('imgconvert package.j'),/package.json/);
  });
  it('provides contextual options and values in every shell',()=>{
    for(const script of [bashCompletion(),zshCompletion(),fishCompletion()]) for(const token of ['jpg','--group','--artwork-padding','android','--concurrency']) assert.ok(script.includes(token),token);
  });
});
