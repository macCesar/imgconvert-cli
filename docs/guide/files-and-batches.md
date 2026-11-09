# Files, naming and batches

[Documentation home](../README.md) · [Automation and exit codes](automation.md)

## Input discovery

A source is one image or one directory. Directory processing reads immediate compatible files in natural filename order, so `1.png`, `2.png`, `10.png` sort in that order. It skips subdirectories and unsupported extensions. A single unsupported file, a missing path or a directory containing no compatible images fails.

Discovery uses extensions to choose inputs; a corrupt `.png` is still attempted and reported as a failed input. Other valid images in that batch can succeed.

## Output paths

General conversion resolves a relative output beside the source, not automatically beneath your current working directory:

| Source | Option | Effective output |
| --- | --- | --- |
| `/work/photo.jpg` | None | `/work/converted/photo.jpg` |
| `/work/photos/` | None | `/work/photos-converted/…` |
| `/work/photo.jpg` | `-o optimized` | `/work/optimized/photo.jpg` |
| `/work/photos/` | `-o optimized` | `/work/optimized/…` |
| `/work/photos/` | `-o photos/optimized` | `/work/photos/optimized/…` |
| `/work/photos/` | `-o /delivery/images` | `/delivery/images/…` |

The same rule applies to `output` inherited from JSON. Inputs and preset `source` paths resolve from the working directory. Missing output directories are created after the write plan is accepted.

For predictable destinations in a script, use an absolute output path. Alloy and branding use their own [path rules](alloy.md#output-base-and-subfolders), [described separately](android-branding.md#staging-and-project-paths).

## Collisions and existing files

Before writing, the command enumerates the requested destinations. It rejects:

- Two outputs targeting the same destination, including collisions between formats, renamed inputs or Alloy groups.
- Existing destinations without overwrite permission.
- An output targeting a different input in the same command, even with `--overwrite`.

An existing output directory is fine if none of the planned filenames already exists. An unrelated file in that directory is left alone.

Consider:

```text
photos/
  product.jpg
  product.png
```

Both inputs would become `product.webp`. `--overwrite` cannot choose between them. Enumeration makes their destinations distinct:

```bash
imgconvert photos -f webp --rename enumerate
```

Once those outputs exist, repeat deliberately with:

```bash
imgconvert photos -f webp --rename enumerate --overwrite
```

Enumeration depends on the complete sorted input list. Adding another earlier-sorted input can change later prefixes; keep a stable source list when filenames must remain stable.

## In-place processing

`--in-place` authorizes an update of the input itself when its format and name stay the same:

```bash
imgconvert photo.png --in-place -w 800
```

A format or name change creates a sibling and preserves the source:

```bash
imgconvert photo.png --in-place -f webp
imgconvert photo.png --in-place --name photo-small -w 400
```

The first creates `photo.webp`; the second creates `photo-small.png`. If either sibling exists, add `--overwrite` to replace it. No `converted/` directory is used in these examples.

`--replace` and `--replace-originals` are compatibility aliases for `--in-place`. `--no-in-place` disables an inherited replacement setting.

An effective `output` and an effective `inPlace: true` conflict, including values inherited from JSON. Choose either a destination directory or replacement mode. Override a configured replacement when selecting a directory:

```bash
imgconvert photo.png --no-in-place -o resized -w 800
```

`--overwrite` grants permission for existing targets at the chosen destination; directing output onto the source with that permission can replace it too. Use a separate output directory when you need to keep all original files.

## File naming

`--name` sets a single input's output basename without its extension. It takes precedence over `--rename` and is rejected for directory sources.

```bash
imgconvert photo.jpg --name hero-banner -f webp
```

For directories, compose comma-separated naming rules:

| Strategy | Effect on `My Photo.png` |
| --- | --- |
| `enumerate` | `001-My Photo.png` for the first input |
| `lowercase` | `my photo.png` |
| `replace-spaces` | `My-Photo.png` |
| `prefix:shop-` | `shop-My Photo.png` |
| `suffix:-small` | `My Photo-small.png` |

```bash
imgconvert photos --rename "prefix:gallery-,enumerate,lowercase,replace-spaces,suffix:-thumb" -f webp
```

A first input named `My Photo.png` becomes `gallery-001-my-photo-thumb.webp`. Enumeration and prefixes accumulate in the written order; suffixes accumulate at the end. Lowercasing and replacing spaces affect the original basename only, so `prefix:WEB-,lowercase` keeps `WEB-` uppercase.

## Partial results and write safety

Each output is encoded into an exclusive temporary file beside its destination, then committed. Failed writes remove their own temporary files. Without overwrite permission, a destination that appears after planning is protected too.

The whole command is not a transaction: successful outputs stay when another image or variant fails. A planning error happens before output generation; a processing error can produce a partial result. Use [exit codes and counts](automation.md#exit-codes) rather than treating the presence of one file as proof that the entire command succeeded.

## Concurrency

General conversion and Alloy accept `--concurrency <n>` or JSON `concurrency`. The value must be a positive integer. The default is the smaller of 4 and Node's available parallelism.

```bash
imgconvert photos -f webp --concurrency 1
imgconvert photos -f webp --concurrency 4 -o fast-output
```

One input occupies one task; its formats or scale variants are generated inside that task. Selecting `all` does not multiply the task limit. More active inputs may improve throughput at a memory cost. Start with 1 for large images or constrained machines and compare with 2 or 4 on representative content.

`brand` does not accept `--concurrency`. It runs the selected branding generators through its own pipeline.
