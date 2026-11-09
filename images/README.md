# Test images

Repository fixtures used by the image conversion and Alloy suites:

| File | Purpose |
| --- | --- |
| `canyon-river.jpg` | JPEG conversion, compression, resize and naming |
| `mountain-lake.png` | PNG conversion and resize |
| `test.gif` | GIF input/output scenarios |

The general suite copies fixtures to `test/temp-test/`; the Alloy suite uses `test/temp-alloy/`. Other suites generate their own fixtures. See the [testing guide](../test/README.md) for commands and cleanup side effects.

PNG support alone does not establish that a fixture contains transparent pixels. Tests of alpha preservation should create or verify an image with known transparency. General CLI processing does not preserve animated GIF sequences.

To inspect current fixture metadata without creating outputs:

```bash
node -e 'const sharp = require("sharp"); for (const file of ["images/canyon-river.jpg", "images/mountain-lake.png", "images/test.gif"]) sharp(file).metadata().then(meta => console.log(file, meta));'
```

Keep filenames stable because tests refer to them. Add small, purpose-specific fixtures when needed to cover cases the photographs do not exercise.
