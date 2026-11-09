'use strict';
const assert = require('node:assert/strict');
const pkg = require('../package.json');
describe('Safe tooling', () => {
  it('cleanup never targets user outputs or config', () => {
    assert.doesNotMatch(pkg.scripts.clean, /app\/|output\/|converted\/|config\.json|\*-preset/);
  });
  it('test aliases run real isolated tests', () => {
    for (const name of ['test', 'test:all', 'test:unit', 'test:integration']) {
      assert.match(pkg.scripts[name], /test\/run\.cjs|npm test/);
    }
  });
});
