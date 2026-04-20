'use strict';
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { execSync } = require('child_process');

describe('imgconvert config subcommand', function() {
  this.timeout(60000);

  const configFile = path.join(process.cwd(), '.imgconverter.config.json');

  afterEach(() => {
    if (fs.existsSync(configFile)) fs.unlinkSync(configFile);
  });

  it('should create config file with config init', () => {
    const result = execSync('node index.js config init', { encoding: 'utf8', stdio: 'pipe' });
    expect(result).to.include('Default configuration file created');
    expect(fs.existsSync(configFile)).to.be.true;
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    expect(config).to.have.property('presets');
    expect(config).to.have.property('quality', 85);
  });

  it('should warn when config exists and --force not given', () => {
    execSync('node index.js config init', { encoding: 'utf8', stdio: 'pipe' }); // create first
    const result = execSync('node index.js config init', { encoding: 'utf8', stdio: 'pipe' });
    expect(result).to.match(/exists|already/i);
  });

  it('should overwrite config when --force is given', () => {
    execSync('node index.js config init', { encoding: 'utf8', stdio: 'pipe' }); // create first
    execSync('node index.js config init --force', { encoding: 'utf8', stdio: 'pipe' });
    expect(fs.existsSync(configFile)).to.be.true;
  });

  it('should show config as JSON with config show', () => {
    execSync('node index.js config init', { encoding: 'utf8', stdio: 'pipe' });
    const result = execSync('node index.js config show', { encoding: 'utf8', stdio: 'pipe' });
    const parsed = JSON.parse(result);
    expect(parsed).to.be.an('object');
    expect(parsed).to.have.property('presets');
  });

  it('should show config help when no subcommand given', () => {
    const result = execSync('node index.js config --help', { encoding: 'utf8', stdio: 'pipe' });
    expect(result).to.include('init');
    expect(result).to.include('show');
  });
});
