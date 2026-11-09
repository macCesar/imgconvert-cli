# Android branding

[Documentation home](../README.md) · [Brand option reference](cli-reference.md#brand)

## Choose the branding command

```bash
imgconvert brand logo.svg --sdk android
```

`brand` produces launcher/adaptive layers, notification icons, splash icons and marketplace artwork. `alloy` produces scale variants for ordinary application images and is [documented separately](alloy.md).

The supported SDK argument is `android`. It targets `app/src/main/res/` under the chosen output root. The public command does not accept Titanium, Kotlin, React Native or Flutter SDK values and does not generate iOS dark/tinted icons or Titanium `DefaultIcon*.png`.

## Prepare the master

Accepted master extensions are SVG, PNG, JPG/JPEG and WebP. Use a vector or a large transparent raster for logos. A transparent 1024-pixel master is a useful starting point; a square source or minimum size is not enforced.

The preparation stage preserves aspect ratio and limits the tight master to a longest dimension of 1024. Raster preparation avoids enlargement at that stage; individual generators can still scale a small master up for their target sizes. SVGs are rasterized before generation. Transparent borders already baked into the source can make the visible logo appear smaller in adaptive/artwork outputs. Notification generation trims borders separately.

For a master with excessive borders, create and inspect a trimmed raster first:

```bash
imgconvert logo.png --trim -o trimmed
imgconvert brand trimmed/logo.png --sdk android
```

## Select categories

With no category selector and no cleanup flag, the full set is generated:

```bash
imgconvert brand logo.svg --sdk android
```

To generate selected categories:

```bash
imgconvert brand logo.svg --sdk android --adaptive --notification
imgconvert brand logo.svg --sdk android --marketplace
imgconvert brand logo.svg --sdk android --splash
```

`--adaptive` includes both the adaptive triplet and a flat legacy launcher icon at each density, plus an XML resource. `--marketplace` always produces both current artwork files, even with SDK Android.

## Staging and project paths

By default, output goes into `<project>/.ti-branding/`. The directory name is retained for compatibility. The project defaults to the working directory.

```bash
imgconvert brand logo.svg --sdk android --project /work/MyApp
imgconvert brand logo.svg --sdk android --project /work/MyApp -o /work/branding-review
```

A relative explicit `-o` resolves from the working directory, not from `--project`. Master and monochrome-master paths also resolve from the working directory. The resource tree beneath output is always `app/src/main/res/` for SDK Android.

Write directly beneath the project root with:

```bash
imgconvert brand logo.svg --sdk android --project /work/MyApp --in-place
```

Existing targets still require `--overwrite`; `--in-place` selects the destination and does not grant blanket overwrite permission. Combining it with `--output` fails.

## Generated files and sizes

A complete default run writes 33 final files: 21 launcher/adaptive files, 5 notification icons, 5 splash icons and 2 marketplace images.

```text
.ti-branding/
  iTunesConnect.png
  MarketplaceArtwork.png
  app/src/main/res/
    mipmap-anydpi-v26/ic_launcher.xml
    mipmap-mdpi/ic_launcher.png
    mipmap-mdpi/ic_launcher_foreground.png
    mipmap-mdpi/ic_launcher_background.png
    mipmap-mdpi/ic_launcher_monochrome.png
    drawable-mdpi/ic_stat_notify.png
    drawable-mdpi/splash_icon.png
    ...same PNG names for hdpi, xhdpi, xxhdpi and xxxhdpi
```

PNG sizes are square dimensions in pixels:

| Resource | mdpi | hdpi | xhdpi | xxhdpi | xxxhdpi |
| --- | --- | --- | --- | --- | --- |
| Adaptive foreground/background/monochrome | 108 | 162 | 216 | 324 | 432 |
| Flat `ic_launcher.png` | 48 | 72 | 96 | 144 | 192 |
| `ic_stat_notify.png` | 24 | 36 | 48 | 72 | 96 |
| `splash_icon.png` | 288 | 432 | 576 | 864 | 1152 |

Marketplace output is `iTunesConnect.png` at 1024×1024 and `MarketplaceArtwork.png` at 512×512. Keep these filenames when automating the current output contract; the iTunes filename does not imply that the command configures an iOS app.

Intermediate master files use an exclusive temporary directory and are removed when the run ends, including on failure. They are not part of the deliverable.

## Padding and background

```bash
imgconvert brand logo.svg --sdk android --padding 15 --artwork-padding 4 --bg-color "#0B1326"
```

`--padding` is an integer percentage per side from 0 to 40, default 15. It controls adaptive artwork; the flat legacy launcher uses a reduced proportion of that value. Marketplace artwork uses `--artwork-padding`, default 4, also 0-40. `--ios-padding` is its compatibility alias. Contradictory values supplied through both names fail.

`--bg-color` accepts exactly a six-digit `#RRGGBB` hex color, default `#FFFFFF`. It sets launcher background color. Explicitly providing it also flattens marketplace alpha, even if the supplied value is the default white:

```bash
# Preserve marketplace transparency
imgconvert brand logo.png --sdk android --marketplace -o artwork-alpha

# Produce opaque marketplace artwork
imgconvert brand logo.png --sdk android --marketplace --bg-color "#FFFFFF" -o artwork-opaque
```

Padding flags do not adjust notification or splash sizing. Those generators use their own target sizing. Inspect the five densities and test the resources in the app before shipping.

## A dedicated monochrome master

A complex multicolor logo can become a solid blob when whitened into a silhouette. Supply a simplified shape with meaningful alpha:

```bash
imgconvert brand logo.svg --sdk android --adaptive --notification --monochrome-master silhouette.png
```

The alternate master feeds monochrome adaptive layers and notifications. Other categories continue using the main master. The generated monochrome layer is white with preserved alpha; Android can tint it at runtime. The CLI does not create an app notification channel or select notification colors for your application.

## Preview, overwrite and integrate

```bash
imgconvert brand logo.svg --sdk android --project /work/MyApp --dry-run
```

Dry-run checks existence and decoding of all supplied masters, lists exact planned outputs, and makes no generation or cleanup writes. It does not run every encoder or validate an Android build. Existing targets are checked during planning; use `--overwrite --dry-run` to preview an authorized replacement.

After reviewing staging, copy the generated `app/src/main/res/` resources into the corresponding resource tree of your Android project. Reference `@mipmap/ic_launcher` for the launcher, `@drawable/ic_stat_notify` for a small notification icon and `@drawable/splash_icon` in your splash integration as appropriate. `brand` does not rewrite your manifest, application code or themes.

```bash
imgconvert brand logo.svg --sdk android --adaptive --notification --notes
```

Normal Android runs already include category-specific integration notes; `--notes` does not select more assets or write extra files. For repeat generation into existing paths, add `--overwrite`. Successful files remain available if a later generation/write step fails; check the exit status.

## Legacy Titanium cleanup

`--cleanup-legacy` is a separate maintenance action on a Titanium project. It is not a general Android unused-resource scanner. It examines `tiapp.xml` and known Alloy/Classic layouts in `--project`, even if newly generated branding is staged elsewhere.

First inspect its exact deletion plan:

```bash
imgconvert brand --cleanup-legacy --project /work/OldTitaniumApp --dry-run
```

After reviewing and preserving any needed project files, apply it:

```bash
imgconvert brand --cleanup-legacy --project /work/OldTitaniumApp
```

Cleanup-only execution needs neither a master nor `--sdk`. With `--cleanup-legacy`, the automatic full generation set is disabled. To generate as well, select categories explicitly:

```bash
imgconvert brand logo.svg --sdk android --adaptive --cleanup-legacy --project /work/OldTitaniumApp --dry-run
```

The printed plan separates generation writes from project deletions. Cleanup considers known `res-long-*` / `res-notlong-*` folders, legacy iOS launch PNGs when a storyboard is enabled, and Android landscape variants only with explicit portrait evidence for the launcher and every relevant activity. iPhone orientation does not authorize Android deletions. Missing/contradictory Android configuration preserves landscape resources. Legacy `appicon.png` and `default.png` are retained when references cannot establish that they are unused.

`--aggressive` additionally includes known ldpi resource directories. It has effect only with cleanup. Deletions are permanent and are not redirected into staging; keep them reviewable with version control or a backup.
