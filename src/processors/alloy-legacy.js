'use strict';
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { logger } = require('../utils/logger');
const { ALLOY_SCALES, SUPPORTED_FORMATS } = require('../config/defaults');
const { applyScalingFormatOptions } = require('./scaling');
const { discover, planOperations, atomicWrite, mapLimit, operationResult } = require('../utils/operations');

async function processAlloyLegacy(args, config) {
  const start = Date.now();
  // The active CLI passes fully resolved platform options. Keep the legacy
  // adapter usable internally without introducing a second CLI resolution.
  if (!args.platforms) {
    const { resolveAlloyOptions } = require('../config/precedence');
    const { getMergedPresets } = require('../config/loader');
    args = resolveAlloyOptions({...args,presetName:args.presetName || 'alloy'},config,getMergedPresets(config));
  }
  const bySource = new Map();
  for (const entry of args.platforms) {
      const {platform,settings,source,groupName,options:resolved} = entry;
      if (args.debug) logger.debug(JSON.stringify({group:groupName,platform,effective:resolved,origins:resolved._origins}));
      for (const input of discover(source)) {
        const base = args.output ? path.resolve(path.dirname(input), args.output) : fs.existsSync(path.join(process.cwd(),'tiapp.xml')) ? process.cwd() : path.dirname(input);
        const subfolder = String(settings.output || '').replace(/^\/+|\/+$/g,'');
        const formats = resolved.format === 'all' ? SUPPORTED_FORMATS : [resolved.format || path.extname(input).slice(1).toLowerCase()];
        if (!bySource.has(input)) bySource.set(input, []);
        for (const format of formats) {
          for (const [scaleName, scale] of Object.entries(ALLOY_SCALES[platform])) {
            const filename = `${path.parse(input).name}${platform === 'iphone' && scaleName !== '1x' ? '@'+scaleName : ''}.${format}`;
            const destination = path.join(base,'app','assets',platform,'images', platform === 'android' ? scaleName : '', subfolder,filename);
            bySource.get(input).push({source: input, destination, format, scale, scaleName, quality: resolved.quality, allowOverwrite: resolved.overwrite});
          }
        }
      }
  }
  if (!bySource.size) throw new Error('No Alloy inputs');
  planOperations([...bySource.values()].flat(), args);
  const destinations = [], errors = [];
  let processedCount = 0, failedCount = 0, totalOriginalSize = 0, totalNewSize = 0;
  await mapLimit([...bySource], args.concurrency, async ([source, variants]) => {
    let failed = false;
    let metadata;
    try { metadata = await sharp(source).metadata(); }
    catch (error) { errors.push({source, message: error.message}); logger.error(`${source}: ${error.message}`); failedCount++; return; }
    totalOriginalSize += fs.statSync(source).size;
    for (const op of variants) {
      try {
        let pipeline = sharp(source).resize({width: Math.max(1,Math.round(metadata.width/4*op.scale)), height: Math.max(1,Math.round(metadata.height/4*op.scale)),fit:'contain'});
        pipeline = applyScalingFormatOptions(pipeline, op.format === 'jpg' ? 'jpeg' : op.format, op.quality);
        await atomicWrite(op.destination, temp => pipeline.withMetadata({density:72}).toFile(temp), op.overwrite);
        destinations.push(op.destination); totalNewSize += fs.statSync(op.destination).size;
        logger.progress(`Processed: ${op.destination}`);
      } catch (error) { failed = true; errors.push({source, destination:op.destination, message:error.message}); logger.error(error.message); if (args.debug) console.error(error.stack); }
    }
    if (failed) failedCount++; else processedCount++;
  });
  logger.clearProgress();
  logger.summary({processedCount,totalOriginalSize,totalNewSize,duration:((Date.now()-start)/1000).toFixed(2)});
  logger.info(`Failed inputs: ${failedCount}; Generated outputs: ${destinations.length}`);
  return operationResult(processedCount,failedCount,destinations,errors);
}
module.exports = { processAlloyLegacy };
