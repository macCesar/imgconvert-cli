'use strict';
// Load lazily: this module is also used by the command handlers in program.js.
function definitions() {
  const root = require('./program');
  const entries = [];
  function visit(command, name = '') {
    entries.push({command,name});
    for (const child of command.commands.filter(c=>!c._hidden).sort((a,b)=>a.name().localeCompare(b.name()))) visit(child, [name,child.name()].filter(Boolean).join(' '));
  }
  visit(root);
  return entries.map(({command:c,name}) => ({
    name, description: c.description(),
    children: c.commands.filter(x=>!x._hidden).map(x=>x.name()),
    options: [...c.options,...(c.options.some(o=>o.long==='--help') ? [] : [{long:'--help',short:'-h',description:'Show help'}])].map(o=>({
      flags:[o.short,o.long].filter(Boolean), description:o.description, argument:Boolean(o.required||o.optional), choices:o.argChoices || [], key:o.attributeName ? o.attributeName() : 'help'
    }))
  }));
}
const quote = s => "'" + String(s).replace(/'/g,"'\\''") + "'";
function bashCompletion() {
  const defs = definitions();
  const cases = defs.map(d => {
    const values=d.options.filter(o=>o.argument).map(o=>`      ${o.flags.join('|')}) argument=1; ${o.key === 'preset' ? 'values="$(imgconvert _complete presets 2>/dev/null)"' : o.key === 'group' ? 'values="$(imgconvert _complete groups "$preset" 2>/dev/null)"' : `values=${quote(o.choices.join(' '))}`} ;;
`).join('');
    return `    ${quote(d.name)})
      case "$prev" in
${values}      esac
      if (( ! argument )) && [[ "$cur" == -* ]]; then values=${quote(d.options.flatMap(o=>o.flags).join(' '))}; fi
      if (( ! argument )) && [[ -z "$values" && "$cur" != -* ]]; then values=${quote(d.children.join(' '))}; fi ;;
`;
  }).join('');
  return `# imgconvert bash completion
_imgconvert_completions() {
  local cur="\${COMP_WORDS[COMP_CWORD]}" prev="\${COMP_WORDS[COMP_CWORD-1]}" context="" values="" preset="alloy" word i argument=0 candidate
  for ((i=1; i<COMP_CWORD; i++)); do
    word="\${COMP_WORDS[i]}"
    case "$word" in
      -p|--preset) preset="\${COMP_WORDS[i+1]}"; ((i++)); continue ;;
    esac
    if ((i==1)); then
      case "$word" in ${defs.filter(d=>d.name && !d.name.includes(' ')).map(d=>d.name).join('|')}) context="$word" ;; esac
    fi
    case "$context $word" in
${defs.filter(d=>d.name.includes(' ')).map(d=>'      '+quote(d.name)+') context='+quote(d.name)+' ;;').join('\n')}
    esac
  done
  case "$context" in
${cases}  esac
  if [[ "$context" == help ]]; then values="crop resize rename presets brand alloy"; fi
  if [[ "$context" == completions || "$context" == "completions print" ]]; then values="bash zsh fish uninstall print"; fi
  if ((argument)) && [[ -z "$values" ]]; then COMPREPLY=(); while IFS= read -r candidate; do COMPREPLY+=("$candidate"); done < <(compgen -f -- "$cur"); return; fi
  COMPREPLY=( $(compgen -W "$values" -- "$cur") )
  if (( ! argument )) && [[ "$cur" != -* && ( "$context" == "" || "$context" == brand || "$context" == alloy ) ]]; then while IFS= read -r candidate; do COMPREPLY+=("$candidate"); done < <(compgen -f -- "$cur"); fi
}
complete -F _imgconvert_completions imgconvert
`;
}
function zshCompletion() {
  const defs=definitions();
  const cases=defs.map(d=>{
    const opts=d.options.flatMap(o=>{
      let action=o.choices.length ? `(${o.choices.join(' ')})` : '_files';
      if(o.key==='preset') action='->presets';
      if(o.key==='group') action='->groups';
      return o.flags.map(flag => quote(`${o.flags.length>1?'('+o.flags.join(' ')+')':''}${flag}[${o.description.replace(/[\[\]:']/g,'')} ]${o.argument?':value:'+action:''}`));
    });
    const rest=d.children.length && d.name !== '' && d.name !== 'completions' ? quote('1:command:('+d.children.join(' ')+')'):d.name==='completions'?"'1:shell:(bash zsh fish uninstall print)' '*:shell:(bash zsh fish)'":d.name==='help'?"'1:topic:(crop resize rename presets brand alloy)'":"'*:source:_files'";
    return `    ${quote(d.name)}) _arguments -C ${opts.join(' ')} ${rest} ;;`;
  }).join('\n');
  return `#compdef imgconvert
# imgconvert zsh completion
_imgconvert() {
  local context='' state line preset=alloy
  local -a commands values
  commands=(
${defs.filter(d=>d.name && !d.name.includes(' ')).map(d=>'    '+quote(d.name+':'+d.description)).join('\n')}
  )
  if (( CURRENT == 2 )); then
    _describe -t commands 'imgconvert commands' commands
    _files
  fi
  case "$words[2] $words[3]" in
${defs.filter(d=>d.name.includes(' ')).map(d=>'    '+quote(d.name)+') context='+quote(d.name)+'; words=("$words[1]" "${(@)words[4,-1]}"); ((CURRENT-=2)) ;;').join('\n')}
    *) case "$words[2]" in ${defs.filter(d=>d.name && !d.name.includes(' ')).map(d=>d.name).join('|')}) context="$words[2]"; words=("$words[1]" "\${(@)words[3,-1]}"); ((CURRENT--)) ;; esac ;;
  esac
  local i
  for ((i=2;i<\${#words};i++)); do
    if [[ "$words[i]" == -p || "$words[i]" == --preset ]]; then preset="$words[i+1]"; fi
  done
  case "$context" in
${cases}
  esac
  case "$state" in
    presets) values=(\${(f)"$(imgconvert _complete presets 2>/dev/null)"}); _describe 'preset' values ;;
    groups) values=(\${(f)"$(imgconvert _complete groups "$preset" 2>/dev/null)"}); _describe 'group' values ;;
  esac
}
_imgconvert
`;
}
function fishCompletion() {
  const defs=definitions(), commands=defs.filter(d=>d.name && !d.name.includes(' ')).map(d=>d.name).join(' ');
  const lines=['# imgconvert fish completion', 'function __imgconvert_groups', '  set -l preset alloy', '  set -l words (commandline -opc)', '  for i in (seq (count $words))', '    if contains -- $words[$i] -p --preset; and test $i -lt (count $words)', '      set preset $words[(math $i + 1)]', '    end', '  end', '  imgconvert _complete groups "$preset" 2>/dev/null', 'end'];
  for(const d of defs){
    if(d.name && !d.name.includes(' ')) lines.push(`complete -c imgconvert -f -n '__fish_use_subcommand' -a ${quote(d.name)} -d ${quote(d.description)}`);
    const context=d.name ? d.name.split(' ').map(name=>`__fish_seen_subcommand_from ${name}`).join('; and ') : `not __fish_seen_subcommand_from ${commands}`;
    for(const o of d.options){
      const flags=o.flags.map(f=>f.startsWith('--')?'-l '+f.slice(2):'-s '+f.slice(1)).join(' ');
      const values=o.key==='preset'?'(imgconvert _complete presets 2>/dev/null)':o.key==='group'?'(__imgconvert_groups)':o.choices.join(' ');
      lines.push(`# ${o.flags.join(' ')}\ncomplete -c imgconvert -n ${quote(context)} ${flags} -d ${quote(o.description)}${o.argument?' -r':''}${values?' -f -a '+quote(values):''}`);
    }
    if(d.children.length) lines.push(`complete -c imgconvert -f -n ${quote(context)} -a ${quote(d.children.join(' '))}`);
  }
  lines.push("complete -c imgconvert -f -n '__fish_seen_subcommand_from completions' -a 'bash zsh fish uninstall print'", "complete -c imgconvert -f -n '__fish_seen_subcommand_from help' -a 'crop resize rename presets brand alloy'");
  return lines.join('\n')+'\n';
}
function print(shell) {
  const generator={bash:bashCompletion,zsh:zshCompletion,fish:fishCompletion}[shell];
  if(!generator) throw new Error(`Unknown shell: ${shell}. Supported: bash, zsh, fish`);
  process.stdout.write(generator());
}
module.exports={print,bashCompletion,zshCompletion,fishCompletion};
