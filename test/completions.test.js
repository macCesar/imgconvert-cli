'use strict';
const { expect } = require('chai');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function runCLI(args, env = {}) {
  const argv = Array.isArray(args) ? args : args.split(' ').filter(Boolean);
  return execFileSync('node', ['index.js', ...argv], {
    encoding: 'utf8',
    stdio: 'pipe',
    env: { ...process.env, ...env },
  });
}

function runCLIError(args, env = {}) {
  try {
    runCLI(args, env);
    return { status: 0, output: '' };
  } catch (err) {
    return { status: err.status, output: (err.stdout || '') + (err.stderr || '') };
  }
}

describe('imgconvert completions subcommand', function() {
  this.timeout(30000);

  let sandbox;

  beforeEach(() => {
    sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'imgconvert-completions-'));
  });

  afterEach(() => {
    if (sandbox && fs.existsSync(sandbox)) {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  describe('print', () => {
    it('print bash emits bash completion script', () => {
      const out = runCLI('completions print bash');
      expect(out).to.include('imgconvert bash completion');
      expect(out).to.include('_imgconvert_completions');
      expect(out).to.include('complete -F');
    });

    it('print zsh emits zsh completion script', () => {
      const out = runCLI('completions print zsh');
      expect(out).to.include('#compdef imgconvert');
      expect(out).to.include('_describe');
      expect(out).to.include('imgconvert commands');
    });

    it('print fish emits fish completion script', () => {
      const out = runCLI('completions print fish');
      expect(out).to.include('imgconvert fish completion');
      expect(out).to.include('__fish_use_subcommand');
    });

    it('print with unknown shell exits non-zero', () => {
      const res = runCLIError('completions print unknown-shell');
      expect(res.status).to.equal(1);
      expect(res.output).to.match(/Unknown shell/i);
    });

    it('zsh completion lists subcommands alphabetically', () => {
      const out = runCLI('completions print zsh');
      const alloyIdx = out.indexOf("'alloy:");
      const brandIdx = out.indexOf("'brand:");
      const completionsIdx = out.indexOf("'completions:");
      const configIdx = out.indexOf("'config:");
      const helpIdx = out.indexOf("'help:");
      expect(alloyIdx).to.be.greaterThan(-1);
      expect(alloyIdx).to.be.lessThan(brandIdx);
      expect(brandIdx).to.be.lessThan(completionsIdx);
      expect(completionsIdx).to.be.lessThan(configIdx);
      expect(configIdx).to.be.lessThan(helpIdx);
    });
  });

  describe('install', () => {
    it('install zsh creates file and appends fpath to .zshrc', () => {
      runCLI('completions zsh', { HOME: sandbox });
      const completionFile = path.join(sandbox, '.zsh/completions/_imgconvert');
      const zshrc = path.join(sandbox, '.zshrc');
      expect(fs.existsSync(completionFile)).to.be.true;
      expect(fs.readFileSync(completionFile, 'utf8')).to.include('#compdef imgconvert');
      expect(fs.existsSync(zshrc)).to.be.true;
      const rc = fs.readFileSync(zshrc, 'utf8');
      expect(rc).to.include('fpath=(~/.zsh/completions $fpath)');
      expect(rc).to.include('# >>> imgconvert completions >>>');
      expect(rc).to.include('# <<< imgconvert completions <<<');
    });

    it('install bash creates file at XDG path and leaves rc files alone', () => {
      runCLI('completions bash', { HOME: sandbox });
      const completionFile = path.join(sandbox, '.local/share/bash-completion/completions/imgconvert');
      expect(fs.existsSync(completionFile)).to.be.true;
      expect(fs.readFileSync(completionFile, 'utf8')).to.include('_imgconvert_completions');
      expect(fs.existsSync(path.join(sandbox, '.bashrc'))).to.be.false;
    });

    it('install fish creates file at fish completions path', () => {
      runCLI('completions fish', { HOME: sandbox });
      const completionFile = path.join(sandbox, '.config/fish/completions/imgconvert.fish');
      expect(fs.existsSync(completionFile)).to.be.true;
      expect(fs.readFileSync(completionFile, 'utf8')).to.include('__fish_use_subcommand');
    });

    it('install with unknown shell exits non-zero', () => {
      const res = runCLIError('completions mksh', { HOME: sandbox });
      expect(res.status).to.equal(1);
      expect(res.output).to.match(/Unsupported shell/i);
    });

    it('install zsh is idempotent (no duplicate rc block on second run)', () => {
      runCLI('completions zsh', { HOME: sandbox });
      runCLI('completions zsh', { HOME: sandbox });
      const zshrc = path.join(sandbox, '.zshrc');
      const rc = fs.readFileSync(zshrc, 'utf8');
      const markerCount = (rc.match(/# >>> imgconvert completions >>>/g) || []).length;
      expect(markerCount).to.equal(1);
    });
  });

  describe('uninstall', () => {
    it('uninstall removes all installed completion files and rc block', () => {
      runCLI('completions zsh', { HOME: sandbox });
      runCLI('completions bash', { HOME: sandbox });
      runCLI('completions fish', { HOME: sandbox });
      runCLI('completions uninstall', { HOME: sandbox });

      expect(fs.existsSync(path.join(sandbox, '.zsh/completions/_imgconvert'))).to.be.false;
      expect(fs.existsSync(path.join(sandbox, '.local/share/bash-completion/completions/imgconvert'))).to.be.false;
      expect(fs.existsSync(path.join(sandbox, '.config/fish/completions/imgconvert.fish'))).to.be.false;

      const zshrc = path.join(sandbox, '.zshrc');
      if (fs.existsSync(zshrc)) {
        const rc = fs.readFileSync(zshrc, 'utf8');
        expect(rc).to.not.include('# >>> imgconvert completions >>>');
        expect(rc).to.not.include('fpath=(~/.zsh/completions');
      }
    });

    it('uninstall is safe when nothing was installed', () => {
      const out = runCLI('completions uninstall', { HOME: sandbox });
      expect(out).to.match(/No imgconvert completions/i);
    });
  });

  describe('help', () => {
    it('completions --help shows examples for all shells', () => {
      const out = runCLI('completions --help');
      expect(out).to.include('bash');
      expect(out).to.include('zsh');
      expect(out).to.include('fish');
      expect(out).to.include('uninstall');
    });
  });

  describe('main help references', () => {
    it('main --help lists completions subcommand in USAGE', () => {
      const out = runCLI('--help');
      expect(out).to.include('imgconvert completions');
    });

    it('main --help no longer references --completions flag', () => {
      const out = runCLI('--help');
      expect(out).to.not.include('--completions <shell>');
    });
  });
});
