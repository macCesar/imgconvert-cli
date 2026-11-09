'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { logger } = require('./logger');
const { SUPPORTED_FORMATS } = require('../config/defaults');
const { naturalSort } = require('./sorting');
function discover(source) {
  if (!source || !fs.existsSync(source)) throw new Error(`Source does not exist: ${source || '(missing)'}`);
  source = path.resolve(source);
  const directory = fs.statSync(source).isDirectory();
  const files = directory ? fs.readdirSync(source).sort(naturalSort).map(f => path.join(source,f)) : [source];
  const images = files.filter(f => fs.statSync(f).isFile() && SUPPORTED_FORMATS.includes(path.extname(f).slice(1).toLowerCase()));
  if (!images.length) throw new Error(directory ? `No supported images in ${source}` : `Unsupported input format: ${source}`);
  return images;
}
function planOperations(operations, { overwrite = false } = {}) {
  const keyFor = value => process.platform === 'linux' ? path.resolve(value) : path.resolve(value).toLowerCase();
  const inputs = new Set(operations.filter(op => op.source).map(op => keyFor(op.source)));
  const seen = new Set();
  for (const op of operations) {
    op.destination = path.resolve(op.destination);
    op.source = op.source ? path.resolve(op.source) : null;
    // Case-fold on platforms whose standard filesystems are case insensitive.
    const key = keyFor(op.destination);
    if (inputs.has(key) && key !== keyFor(op.source || '')) throw new Error(`Output would replace another input: ${op.destination}`);
    if (seen.has(key)) throw new Error(`Output collision: ${op.destination}`);
    seen.add(key);
    op.overwrite = Boolean((op.allowOverwrite ?? overwrite) || (op.inPlace && op.source === op.destination));
    if (fs.existsSync(op.destination) && (!op.overwrite || !fs.statSync(op.destination).isFile())) throw new Error(`Destination exists: ${op.destination}; use --overwrite`);
    logger.debug(`${op.source || '(generated)'} -> ${op.destination}`);
  }
  return operations;
}
async function atomicWrite(destination, write, overwrite = false) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const temp = path.join(path.dirname(destination), `.imgconvert-${randomUUID()}${path.extname(destination)}`);
  const fd = fs.openSync(temp, 'wx');
  fs.closeSync(fd);
  try {
    await write(temp);
    if (overwrite) fs.renameSync(temp, destination);
    else fs.linkSync(temp, destination); // Atomic no-clobber commit, including creation races.
  } finally {
    fs.rmSync(temp, { force: true });
  }
}
async function mapLimit(items, concurrency, task) {
  let next = 0;
  const results = new Array(items.length);
  await Promise.all(Array.from({length: Math.min(concurrency, items.length)}, async () => {
    while (next < items.length) { const i = next++; results[i] = await task(items[i], i); }
  }));
  return results;
}
function operationResult(processedCount, failedCount, destinations, errors = []) {
  return { processedCount, failedCount, outputCount: destinations.length, destinations, errors, exitCode: errors.length || failedCount ? destinations.length ? 2 : 1 : 0 };
}
module.exports = { discover, planOperations, atomicWrite, mapLimit, operationResult };
