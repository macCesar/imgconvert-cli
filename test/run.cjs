'use strict';
// The legacy suites may clean cwd or write beside __dirname. Give the entire
// suite an exclusive disposable project, including fixtures and configuration.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'imgconvert-tests-'));
try {
  for (const item of ['test', 'images', 'src', 'index.js', 'package.json', 'eslint.config.cjs']) {
    fs.cpSync(path.join(root, item), path.join(sandbox, item), { recursive: true });
  }
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(sandbox, 'node_modules'), 'dir');
  const args = process.argv.slice(2);
  const files = args[0] && !args[0].startsWith('-') ? args.shift() : 'test/*.test.js';
  // Expand our flat suite selectors here. Glob 14 relies on Node APIs newer
  // than 22.13 for some patterns; the tests themselves support the minimum.
  const brace = files.match(/^test\/\{([^}]+)\}\.test\.js$/);
  const selected = brace ? brace[1].split(',').map(name=>`test/${name}.test.js`) : files === 'test/*.test.js' ? fs.readdirSync(path.join(sandbox,'test')).filter(name=>name.endsWith('.test.js')).map(name=>`test/${name}`) : [files];
  const result = spawnSync(process.execPath, [path.join(root, 'node_modules/mocha/bin/mocha.js'), ...selected, '--timeout' , '300000', ...args], { cwd: sandbox, stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  fs.rmSync(sandbox, { recursive: true, force: true });
}
