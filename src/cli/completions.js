'use strict';

const COMMANDS = ['alloy', 'brand', 'completions', 'config', 'help'];
const FORMATS = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif', 'all'];
const FIT = ['cover', 'contain', 'fill', 'inside', 'outside'];
const HELP_TOPICS = ['crop', 'resize', 'rename', 'presets', 'brand', 'alloy'];
const CONFIG_CMDS = ['init', 'show'];
const COMPLETION_SHELLS = ['bash', 'zsh', 'fish'];
const COMPLETION_CMDS = [...COMPLETION_SHELLS, 'uninstall', 'print'];

function bashCompletion() {
  return `# imgconvert bash completion
_imgconvert_completions() {
  local cur prev words cword
  _init_completion || return
  case "$prev" in
    imgconvert)
      COMPREPLY=( $(compgen -W "${COMMANDS.join(' ')} --help --version" -- "$cur") )
      return ;;
    brand) COMPREPLY=( $(compgen -W "--adaptive --marketplace --notification --splash --bg-color --padding --ios-padding --monochrome-master --project --output --in-place --notes --dry-run --cleanup-legacy --aggressive --debug --help" -- "$cur") ); return ;;
    alloy) COMPREPLY=( $(compgen -W "--output --preset --debug --help" -- "$cur") ); return ;;
    config) COMPREPLY=( $(compgen -W "${CONFIG_CMDS.join(' ')} --help" -- "$cur") ); return ;;
    completions) COMPREPLY=( $(compgen -W "${COMPLETION_CMDS.join(' ')} --help" -- "$cur") ); return ;;
    print) COMPREPLY=( $(compgen -W "${COMPLETION_SHELLS.join(' ')}" -- "$cur") ); return ;;
    help) COMPREPLY=( $(compgen -W "${HELP_TOPICS.join(' ')}" -- "$cur") ); return ;;
    --format|-f) COMPREPLY=( $(compgen -W "${FORMATS.join(' ')}" -- "$cur") ); return ;;
    --fit) COMPREPLY=( $(compgen -W "${FIT.join(' ')}" -- "$cur") ); return ;;
  esac
  COMPREPLY=( $(compgen -W "--format --quality --background --width --height --fit --position --crop --canvas --trim --rename --name --output --replace --preset --debug --version --help" -- "$cur") )
}
complete -F _imgconvert_completions imgconvert
`;
}

function zshCompletion() {
  const formats = FORMATS.join(' ');
  const fit = FIT.join(' ');
  return `#compdef imgconvert
# imgconvert zsh completion
_imgconvert() {
  local -a commands
  commands=(
    'alloy:Generate legacy Titanium Alloy multi-scale assets'
    'brand:Generate Titanium SDK 13.x app icons and branding assets'
    'completions:Install shell completion (bash|zsh|fish)'
    'config:Manage .imgconverter.config.json'
    'help:Detailed help on a specific topic'
  )
  _arguments \\
    '(-v --version)'{-v,--version}'[Show version]' \\
    '(-h --help)'{-h,--help}'[Show help]' \\
    '(-f --format)'{-f,--format}'[Output format]:format:(${formats})' \\
    '(-q --quality)'{-q,--quality}'[Quality 1-100]:quality' \\
    '--fit[Resize strategy]:fit:(${fit})' \\
    '1: :->command_or_source' \\
    '*:: :->args'
  case $state in
    command_or_source)
      _describe -t commands 'imgconvert commands' commands
      _files
      ;;
  esac
}
_imgconvert
`;
}

function fishCompletion() {
  const lines = [
    '# imgconvert fish completion',
    `set -l commands ${COMMANDS.join(' ')}`,
    `set -l formats ${FORMATS.join(' ')}`,
    `set -l fit_strategies ${FIT.join(' ')}`,
    `set -l help_topics ${HELP_TOPICS.join(' ')}`,
    '',
    '# Subcommands',
    'complete -c imgconvert -f -n "__fish_use_subcommand" -a alloy -d "Generate legacy Alloy multi-scale assets"',
    'complete -c imgconvert -f -n "__fish_use_subcommand" -a brand -d "Generate Titanium branding assets"',
    'complete -c imgconvert -f -n "__fish_use_subcommand" -a completions -d "Install shell completion"',
    'complete -c imgconvert -f -n "__fish_use_subcommand" -a config -d "Manage config file"',
    'complete -c imgconvert -f -n "__fish_use_subcommand" -a help -d "Topic-specific help"',
    '',
    '# completions sub-subcommands',
    'complete -c imgconvert -f -n "__fish_seen_subcommand_from completions" -a "bash zsh fish uninstall print"',
    '',
    '# Global options',
    'complete -c imgconvert -s f -l format -d "Output format" -a "$formats"',
    'complete -c imgconvert -s q -l quality -d "Quality 1-100"',
    'complete -c imgconvert -l width -d "Output width in pixels"',
    'complete -c imgconvert -l height -d "Output height in pixels"',
    'complete -c imgconvert -l fit -d "Resize strategy" -a "$fit_strategies"',
    'complete -c imgconvert -s h -l help -d "Show help"',
    'complete -c imgconvert -s v -l version -d "Show version"',
  ];
  return lines.join('\n') + '\n';
}

function print(shell) {
  switch (shell) {
    case 'bash': process.stdout.write(bashCompletion()); break;
    case 'zsh':  process.stdout.write(zshCompletion()); break;
    case 'fish': process.stdout.write(fishCompletion()); break;
    default:
      process.stderr.write(`Unknown shell: ${shell}. Supported: bash, zsh, fish\n`);
      process.exit(1);
  }
}

module.exports = { print, bashCompletion, zshCompletion, fishCompletion };
