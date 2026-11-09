# Custom presets

[Official documentation](docs/README.md) · [Configuration and presets](docs/guide/configuration.md)

The configuration chapter is the maintained reference for preset fields, precedence, boolean overrides and reusable JSON examples. The links below preserve this guide's earlier entry points.

## Create and select a preset

Read [config creation and commands](docs/guide/configuration.md#config-location-and-commands), then use [the complete team recipe](docs/guide/configuration.md#a-repeatable-team-recipe). The [recipe collection](docs/guide/recipes.md#two-repeatable-delivery-sizes) includes independent hero/email presets.

## Fields, precedence, and paths

See [supported conversion fields](docs/guide/configuration.md#supported-conversion-fields), [resolution order](docs/guide/configuration.md#resolution-order) and [source-relative output paths](docs/guide/files-and-batches.md#output-paths).

## Canvas and transparency

JSON `canvas: true` is supported. [Canvas behavior](docs/guide/image-processing.md#canvas-without-scaling) explains padding/cropping without scaling; [boolean negations](docs/guide/configuration.md#disable-inherited-booleans) explain how to override it. [Backgrounds and transparency](docs/guide/image-processing.md#backgrounds-and-transparency) covers alpha and JPEG flattening.

## Alloy configuration

The [Alloy chapter](docs/guide/alloy.md#configured-sources-and-groups) includes direct-platform and grouped definitions, configured sources, `-p` selection and `--group`. Its [path rules](docs/guide/alloy.md#output-base-and-subfolders) distinguish an output base from a platform subfolder.

## Reuse across a team

Save portable paths in the project config, use separate destinations for different recipes, and compare representative outputs. [A repeatable team recipe](docs/guide/configuration.md#a-repeatable-team-recipe) and [automation](docs/guide/automation.md) show complete workflows.
