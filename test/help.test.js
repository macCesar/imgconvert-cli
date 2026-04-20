'use strict';
const { expect } = require('chai');
const { execSync } = require('child_process');

function runCLI(args) {
  return execSync(`node index.js ${args}`, { encoding: 'utf8', stdio: 'pipe' });
}

function runCLIError(args) {
  try {
    execSync(`node index.js ${args}`, { encoding: 'utf8', stdio: 'pipe' });
    return { status: 0, output: '' };
  } catch (err) {
    return { status: err.status, output: (err.stdout || '') + (err.stderr || '') };
  }
}

describe('imgconvert help system', function() {
  this.timeout(30000);

  it('should show main help with --help flag', () => {
    const result = runCLI('--help');
    expect(result).to.include('imgconvert');
    expect(result).to.include('brand');
    expect(result).to.include('alloy');
    expect(result).to.include('config');
  });

  it('should show brand --help with brand-specific flags only', () => {
    const result = runCLI('brand --help');
    expect(result).to.include('--adaptive');
    expect(result).to.not.include('--width');
    expect(result).to.not.include('--rename');
  });

  it('should show alloy --help', () => {
    const result = runCLI('alloy --help');
    expect(result).to.include('alloy');
    expect(result).to.include('source');
  });

  it('should show config --help', () => {
    const result = runCLI('config --help');
    expect(result).to.include('init');
    expect(result).to.include('show');
  });

  it('help crop should show crop information', () => {
    const result = runCLI('help crop');
    expect(result).to.match(/crop/i);
    expect(result).to.match(/trim|canvas/i);
  });

  it('help resize should show fit strategies', () => {
    const result = runCLI('help resize');
    expect(result).to.match(/fit|strategy/i);
    expect(result).to.match(/cover|contain/i);
  });

  it('help rename should show rename strategies', () => {
    const result = runCLI('help rename');
    expect(result).to.include('enumerate');
  });

  it('help presets should show preset names', () => {
    const result = runCLI('help presets');
    expect(result).to.include('web');
    expect(result).to.include('thumbnail');
  });

  it('help with no topic should list all topics', () => {
    const result = runCLI('help');
    expect(result).to.include('crop');
    expect(result).to.include('resize');
    expect(result).to.include('rename');
    expect(result).to.include('presets');
  });

  it('help unknown-topic should exit 1', () => {
    const res = runCLIError('help unknown-topic-xyz');
    expect(res.status).to.equal(1);
  });

  it('should print bash completions', () => {
    const result = runCLI('--completions bash');
    expect(result).to.include('imgconvert');
  });

  it('should print zsh completions', () => {
    const result = runCLI('--completions zsh');
    expect(result).to.include('imgconvert');
  });

  it('should print fish completions', () => {
    const result = runCLI('--completions fish');
    expect(result).to.include('imgconvert');
  });
});
