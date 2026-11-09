# CLI reference

[Documentation home](../README.md) · [Practical recipes](recipes.md)

Defaults here are built-in defaults. General conversion and Alloy can inherit other values from [JSON/presets](configuration.md). Branding uses its own CLI options. Arguments in `<angle brackets>` are required values; `[square brackets]` indicate optional arguments. Do not type the brackets.

## Commands

| Syntax | Purpose |
| --- | --- |
| `imgconvert [source] [options]` | Convert/transform one image or a nonrecursive directory |
| `imgconvert alloy [source] [options]` | Generate fixed Titanium Alloy scale variants |
| `imgconvert brand [master] [options]` | Generate selected Android branding categories or perform legacy cleanup |
| `imgconvert config init [--force]` | Create `.imgconverter.config.json` |
| `imgconvert config show` | Print merged config as JSON |
| `imgconvert completions [shell]` | Install completion; detect shell and ask if omitted |
| `imgconvert completions print <shell>` | Print a script for bash/zsh/fish |
| `imgconvert completions uninstall` | Remove installed scripts and the managed Zsh block |
| `imgconvert help [topic]` | List topics or display topic help |

`--help` / `-h` is available on commands and subcommands. The root has `--version` / `-v`. Put subcommand options after the subcommand name. A positional source is optional only when the selected processing command has a valid configured source; `brand` can omit its master for cleanup-only operation.

## General conversion

```text
imgconvert [source] [options]
```

| Flag | Value / effect | Default |
| --- | --- | --- |
| `-f, --format <format>` | `jpg`, `jpeg`, `png`, `webp`, `avif`, `tiff`, `gif`, `all` | Preserve input extension, lowercase |
| `-q, --quality <n>` | Full integer 1-100 | 85 |
| `-b, --background <color>` | [Color](image-processing.md#backgrounds-and-transparency) for padding/JPEG flattening | Transparent for alpha-capable padding, white otherwise |
| `-w, --width <n>` | Positive integer pixel width | Automatic/unchanged according to mode |
| `--height <n>` | Positive integer pixel height | Automatic/unchanged according to mode |
| `--fit <strategy>` | `cover`, `contain`, `fill`, `inside`, `outside` | `contain` |
| `--position <pos>` | [Anchor](image-processing.md#positions) for cover/contain/canvas | `center` |
| `--crop <coords>` | Integer `left,top,width,height` after trim | None |
| `--canvas` | Pad/crop area while retaining pixel scale | False |
| `--no-canvas` | Disable inherited canvas | No explicit override |
| `--trim` | Trim detected edge-color/transparent borders | False |
| `--no-trim` | Disable inherited trim | No explicit override |
| `--rename <strategy>` | Comma-separated naming strategies | None |
| `-n, --name <name>` | Single-file output basename without extension | Source basename |
| `-o, --output <dir>` | Destination directory using [source-relative rules](files-and-batches.md#output-paths) | `converted/` or sibling `<directory>-converted/` |
| `--in-place` | Update own input or create a sibling on name/format change | False |
| `--no-in-place` | Disable inherited replacement | No explicit override |
| `--replace` | Alias for `--in-place` | No explicit override |
| `--replace-originals` | Hidden compatibility alias for `--in-place` | No explicit override |
| `--overwrite` | Allow replacing existing planned destinations | False |
| `--no-overwrite` | Disable inherited overwrite permission | No explicit override |
| `--concurrency <n>` | Positive integer maximum active input tasks | `min(4, availableParallelism())` |
| `-p, --preset <name>` | Built-in or custom conversion preset | None |
| `-d, --debug` | Effective options/origins, paths and diagnostic traces | False |
| `-v, --version` | Print version | N/A |
| `-h, --help` | Print help | N/A |

Naming strategies: `enumerate`, `lowercase`, `replace-spaces`, `prefix:<text>`, `suffix:<text>`. See [naming order and examples](files-and-batches.md#file-naming).

Dimensions, quality and concurrency reject units and decimal text such as `800px` or `2.5`. Crop origins can be zero; width/height cannot. `output` and replacement are incompatible when both are effective. Duplicate planned destinations are rejected even if overwrite is allowed.

## Alloy

```text
imgconvert alloy [source] [options]
```

| Flag | Value / effect | Default |
| --- | --- | --- |
| `-o, --output <dir>` | Base before `app/assets/…`; relative to input file directory | Working directory with `tiapp.xml`, otherwise each source file's directory |
| `-p, --preset <name>` | Select an Alloy platform definition | `alloy` |
| `--group <name>` | Select one named group | All groups |
| `-q, --quality <n>` | Integer 1-100; override selected platform/group settings | 85 after config resolution |
| `-f, --format <format>` | Any supported output format or `all` | Preserve input format |
| `--overwrite` | Override JSON protection and replace existing targets | False after config resolution |
| `--no-overwrite` | Override JSON overwrite permission | No explicit override |
| `--concurrency <n>` | Positive integer input-task limit | `min(4, availableParallelism())` |
| `-d, --debug` | Resolved platform/group options and planned paths | False |
| `-h, --help` | Print Alloy help | N/A |

Sources may be configured per platform/group. A platform `output` is a subfolder inside scale directories, while CLI/top-level `output` selects the base. [Alloy guide](alloy.md) covers both configuration shapes, resolution and fixed scale factors.

## Brand

```text
imgconvert brand [master] --sdk android [options]
imgconvert brand --cleanup-legacy [options]
```

| Flag | Value / effect | Default |
| --- | --- | --- |
| `--sdk <target>` | Only `android` is accepted; required for generation without cleanup | Required except for cleanup |
| `--adaptive` | Adaptive foreground/background/monochrome, flat launchers and XML | Selected if no category/cleanup flag is given |
| `--marketplace` | 1024² `iTunesConnect.png` and 512² `MarketplaceArtwork.png` | Selected if no category/cleanup flag is given |
| `--notification` | White-alpha `ic_stat_notify.png`, five densities | Selected if no category/cleanup flag is given |
| `--splash` | `splash_icon.png`, five densities | Selected if no category/cleanup flag is given |
| `--bg-color <hex>` | Six-digit `#RRGGBB`; explicit use flattens marketplace alpha | `#FFFFFF` |
| `--padding <n>` | Integer 0-40, percentage per side for Android adaptive artwork | 15 |
| `--artwork-padding <n>` | Integer 0-40, percentage per side for marketplace artwork | 4 |
| `--ios-padding <n>` | Compatibility alias for artwork padding | No explicit override |
| `--monochrome-master <path>` | Alternate shape for monochrome/notification outputs | Derive from main master |
| `--project <path>` | Project root; also the actual target of cleanup | Working directory |
| `-o, --output <dir>` | Staging root; relative to working directory | `<project>/.ti-branding/` |
| `--in-place` | Write below project root; conflicts with `--output` | False |
| `--overwrite` | Replace existing generated destinations | False |
| `--no-overwrite` | Disable overwrite permission | No explicit override |
| `--notes` | Request integration notes for generated categories | False |
| `--dry-run` | Decode masters, inspect planned writes/deletions, write nothing | False |
| `--cleanup-legacy` | Apply legacy Titanium project cleanup | False |
| `--aggressive` | Include known ldpi directories in cleanup | False; only effective with cleanup |
| `-d, --debug` | Diagnostic details and traces | False |
| `-h, --help` | Print brand help | N/A |

A cleanup flag disables automatic full-set generation; combine it with explicit category flags to generate anything too. The supported master extensions are SVG, PNG, JPG/JPEG and WebP. Read [branding](android-branding.md) before integrating resources or applying deletion plans.

## Config

```text
imgconvert config init [--force]
imgconvert config show
```

`init` preserves an existing config unless `--force` is given. `show` prints combined JSON without resolving an operation. `--help` / `-h` shows command-specific help. Prefer explicit `init`/`show`; bare `config` has a deprecated compatibility rewrite to `init`.

## Completions

```text
imgconvert completions [bash|zsh|fish]
imgconvert completions print <bash|zsh|fish>
imgconvert completions uninstall
```

No extra processing options apply here. With no shell, the installer uses `$SHELL` and asks before modifying files. With an explicit shell, it installs immediately. `print` writes a script to standard output. `uninstall` removes all supported installed scripts and the managed Zsh configuration block. Each accepts help.

[Installed paths and activation](automation.md#shell-completion) describe the changes to your home directory.

## Help

```text
imgconvert help [crop|resize|rename|presets|brand|alloy]
```

Omit the topic to list available topics. An unknown topic fails. `imgconvert --help` shows the root command's options and subcommands; running with no arguments also shows root help and exits 0.

## Environment and status

`NO_COLOR=1` disables colors. Any nonempty `IMGCONVERT_NO_UPDATE_CHECK` disables the optional update check.

Exit codes are 0 for success, 1 for invalid/planning/no-output failures, and 2 for partial processing success. See [automation](automation.md#exit-codes) for handling them and the exceptions for non-generation commands.
