'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const chalk = require('chalk');
const { bashCompletion, zshCompletion, fishCompletion, print } = require('../completions');

const SHELLS = ['bash', 'zsh', 'fish'];

const INSTALL_TARGETS = {
  zsh: {
    file: '.zsh/completions/_imgconvert',
    generate: zshCompletion,
    rcFile: '.zshrc',
    rcLines: [
      'fpath=(~/.zsh/completions $fpath)',
      'autoload -Uz compinit && compinit',
    ],
    reload: 'source ~/.zshrc',
  },
  bash: {
    file: '.local/share/bash-completion/completions/imgconvert',
    generate: bashCompletion,
    rcFile: null,
    rcLines: null,
    reload: 'source ~/.bashrc (or open a new terminal)',
  },
  fish: {
    file: '.config/fish/completions/imgconvert.fish',
    generate: fishCompletion,
    rcFile: null,
    rcLines: null,
    reload: 'open a new fish shell',
  },
};

const MARKER_START = '# >>> imgconvert completions >>>';
const MARKER_END = '# <<< imgconvert completions <<<';

function homePath(rel) {
  return path.join(os.homedir(), rel);
}

function detectShell() {
  const shell = process.env.SHELL || '';
  const base = path.basename(shell);
  return SHELLS.includes(base) ? base : null;
}

function install(shell) {
  if (!SHELLS.includes(shell)) {
    process.stderr.write(chalk.red(`Unsupported shell: ${shell}. Supported: ${SHELLS.join(', ')}\n`));
    process.exit(1);
  }

  const target = INSTALL_TARGETS[shell];
  const targetFile = homePath(target.file);
  const targetDir = path.dirname(targetFile);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetFile, target.generate(), 'utf8');
  process.stdout.write(chalk.green('✓ ') + `Installed ${chalk.bold(shell)} completion: ${chalk.dim('~/' + target.file)}\n`);

  if (target.rcFile && target.rcLines) {
    const rcPath = homePath(target.rcFile);
    const content = fs.existsSync(rcPath) ? fs.readFileSync(rcPath, 'utf8') : '';

    const alreadyHasFpath = /fpath=\(.*\.zsh\/completions/.test(content);
    const alreadyHasMarker = content.includes(MARKER_START);

    if (!alreadyHasFpath && !alreadyHasMarker) {
      const block = `\n${MARKER_START}\n${target.rcLines.join('\n')}\n${MARKER_END}\n`;
      fs.appendFileSync(rcPath, block, 'utf8');
      process.stdout.write(chalk.green('✓ ') + `Added fpath setup to ${chalk.dim('~/' + target.rcFile)}\n`);
    } else {
      process.stdout.write(chalk.dim('  (fpath already configured in ~/' + target.rcFile + ' — skipped)\n'));
    }
  }

  process.stdout.write(`\nDone! To activate: ${chalk.green(target.reload)}\n`);
  process.stdout.write(`Then try: ${chalk.green('imgconvert <TAB>')}\n\n`);
}

function uninstall() {
  let removed = 0;

  for (const shell of SHELLS) {
    const target = INSTALL_TARGETS[shell];
    const targetFile = homePath(target.file);

    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
      process.stdout.write(chalk.green('✓ ') + `Removed ${chalk.dim('~/' + target.file)}\n`);
      removed++;
    }

    if (target.rcFile) {
      const rcPath = homePath(target.rcFile);
      if (fs.existsSync(rcPath)) {
        const content = fs.readFileSync(rcPath, 'utf8');
        const regex = new RegExp(`\\n?${MARKER_START}[\\s\\S]*?${MARKER_END}\\n?`, 'g');
        if (regex.test(content)) {
          fs.writeFileSync(rcPath, content.replace(regex, ''), 'utf8');
          process.stdout.write(chalk.green('✓ ') + `Removed block from ${chalk.dim('~/' + target.rcFile)}\n`);
        }
      }
    }
  }

  if (removed === 0) {
    process.stdout.write(chalk.yellow('No imgconvert completions were installed.\n'));
  } else {
    process.stdout.write(`\nDone! Restart your shell (or source its rc file) to apply.\n\n`);
  }
}

function askYesNo(question, defaultYes = true) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] ';
    rl.question(question + suffix, (answer) => {
      rl.close();
      const t = (answer || '').trim().toLowerCase();
      if (!t) resolve(defaultYes);
      else resolve(t === 'y' || t === 'yes');
    });
  });
}

async function interactive() {
  const shell = detectShell();
  if (!shell) {
    process.stderr.write(chalk.red('Could not detect your shell from $SHELL.\n'));
    process.stderr.write(`Specify one explicitly: ${chalk.green('imgconvert completions <bash|zsh|fish>')}\n`);
    process.exit(1);
  }

  const target = INSTALL_TARGETS[shell];
  process.stdout.write(`\n${chalk.bold('imgconvert completion installer')}\n\n`);
  process.stdout.write(`Detected shell:  ${chalk.green(shell)}\n`);
  process.stdout.write(`Install target:  ${chalk.dim('~/' + target.file)}\n`);
  if (target.rcFile) {
    process.stdout.write(`RC file:         ${chalk.dim('~/' + target.rcFile)} ${chalk.dim('(will add fpath setup if missing)')}\n`);
  }
  process.stdout.write('\n');

  const ok = await askYesNo(`Install completion for ${chalk.bold(shell)}?`);
  if (!ok) {
    process.stdout.write(chalk.yellow('Cancelled — no changes made.\n\n'));
    return;
  }
  process.stdout.write('\n');
  install(shell);
}

module.exports = { install, uninstall, interactive, printScript: print, detectShell };
