'use strict';
// Each concurrency setting executes a fresh CLI process; no warm process reuse.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const sharp = require('sharp');
(async () => {
  const root = path.resolve(__dirname,'..');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'imgconvert-benchmark-'));
  try {
    const source = path.join(dir,'inputs');fs.mkdirSync(source);
    const input = await sharp(path.join(root,'images/canyon-river.jpg')).resize(2400,1600,{fit:'cover'}).png().toBuffer();
    for(let i=0;i<12;i++) fs.writeFileSync(path.join(source,`${i}.png`),input);
    const rows=[];
    for(const concurrency of [1,2,4]) {
      const before=performance.now();
      const result=spawnSync('/usr/bin/time',['-l',process.execPath,path.join(root,'index.js'),source,'-f','webp','-w','1200','--concurrency',String(concurrency),'-o',path.join(dir,`out-${concurrency}`)],{cwd:dir,encoding:'utf8'});
      if(result.status!==0) throw new Error(result.stderr);
      rows.push({concurrency,seconds:Number(((performance.now()-before)/1000).toFixed(3)),maxRssBytes:Number(result.stderr.match(/(\d+)\s+maximum resident set size/)?.[1]),outputs:fs.readdirSync(path.join(dir,`out-${concurrency}`)).length});
    }
    console.log(JSON.stringify({runtime:process.version,platform:process.platform,arch:process.arch,availableParallelism:os.availableParallelism(),workload:'12 PNG images, 2400x1600 photographic content -> WebP width 1200 quality 85',rows},null,2));
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
})();
