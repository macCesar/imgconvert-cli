# Automation and shell integration

[Documentation home](../README.md) · [Troubleshooting](troubleshooting.md)

## Exit codes

| Code | Meaning | What to do |
| --- | --- | --- |
| `0` | All requested processing operations succeeded; help and config commands can also return success without image outputs | Continue the workflow |
| `1` | Invalid arguments/configuration, a pre-write planning failure, or no valid processing output | Inspect the error; correct inputs/options |
| `2` | Some valid outputs exist alongside processing failures | Review the failure list and preserve or retry successful/failed work deliberately |

A batch keeps successful outputs even if another input fails. Generated-output count is distinct from processed-input count. `-f all`, Alloy scales and branding categories can create several outputs from one source. A zero code from `--help`, a dry-run or cleanup-only operation does not mean an image was encoded.

Do not parse the progress text as a stable machine API. There is no public `--json` result flag. Use the exit code and verify expected artifacts when integrating with another tool.

## A shell wrapper that handles partial results

This POSIX-shell example expects the `photos` directory to exist. A second run requires reviewing existing outputs or adding `--overwrite` deliberately:

```sh
#!/bin/sh

status=0
imgconvert photos -f webp -q 80 --concurrency 2 -o "$PWD/build/web-images" || status=$?

case "$status" in
  0) printf '%s\n' 'Image batch completed.' ;;
  2) printf '%s\n' 'Partial output: inspect failed inputs before continuing.' >&2 ;;
  *) printf '%s\n' 'Image batch failed.' >&2 ;;
esac

exit "$status"
```

The `||` assignment preserves the CLI status and also works when this block is adapted into a shell with `set -e`. Avoid adding overwrite to a retry without checking where existing files came from. A partial retry can otherwise fail planning because successful files already exist.

## npm scripts in another project

Install ImgConvert as a development dependency of your consuming project, then use its executable in npm scripts:

```bash
npm install --save-dev imgconvert-cli
```

Example consuming-project `package.json` fragment, shown as a complete JSON object for clarity:

```json
{
  "scripts": {
    "images:web": "imgconvert photos -p web --width 1600 --concurrency 2 -o build/images",
    "images:web:replace": "npm run images:web -- --overwrite"
  }
}
```

With `photos` in the consuming project root, `-o build/images` writes to that project's `build/images`, beside the source directory. Moving the source changes this relationship; an absolute path in a shell wrapper fixes the destination explicitly.

Pin the dependency/version according to your project workflow. The manual follows this repository checkout; compare installed help before using newly added options from a published version.

## Logs and diagnostics

```bash
imgconvert photos -f webp --debug
NO_COLOR=1 IMGCONVERT_NO_UPDATE_CHECK=1 imgconvert photos -f webp -o logs-example
```

`--debug` / `-d` is supported by conversion, `alloy` and `brand`; put it after the subcommand for the latter two. Stack traces are shown only in debug mode. Debug also exposes absolute planned paths and, for conversion/Alloy, configuration resolution details.

| Environment variable | Effect |
| --- | --- |
| `NO_COLOR=1` | Disable colored terminal output |
| `IMGCONVERT_NO_UPDATE_CHECK=1` | Disable the optional update check; any nonempty value disables it |

Progress logs, warnings and human summaries may change as the CLI evolves. Config inspection is the JSON exception:

```bash
imgconvert config show > combined-config.json
```

That output is the merged config, not an image-processing result or a fully resolved operation plan. Environment-assignment syntax above is for POSIX shells; use your shell's environment-setting syntax elsewhere.

## Shell completion

```bash
# Detect the shell and ask before installation
imgconvert completions

# Install immediately for a selected shell
imgconvert completions zsh
imgconvert completions bash
imgconvert completions fish
```

| Shell | Installed file | Activation |
| --- | --- | --- |
| Zsh | `~/.zsh/completions/_imgconvert` | The installer adds a managed fpath/compinit block to `~/.zshrc` if needed; open a new shell or source that file |
| Bash | `~/.local/share/bash-completion/completions/imgconvert` | Use your shell's completion loading, or source the installed file explicitly |
| Fish | `~/.config/fish/completions/imgconvert.fish` | Open a new Fish shell |

The Bash installer does not edit `.bashrc` or guarantee that your environment loads that path automatically. To load it in the current Bash shell:

```bash
source ~/.local/share/bash-completion/completions/imgconvert
```

To inspect or manage the scripts yourself:

```bash
imgconvert completions print zsh
imgconvert completions print bash
imgconvert completions print fish
imgconvert completions uninstall
```

Uninstall removes installed files for all three shells and the managed Zsh block. Reinstallation avoids duplicating that block. Options, descriptions and enumerated values derive from Commander; preset and group candidates are read from the current working directory's configuration during completion. Reinstall completion scripts after upgrading the CLI to refresh their option definitions.

PowerShell completion is not included. Completion is a convenience; `imgconvert <command> --help` remains the reference for the installed executable.
