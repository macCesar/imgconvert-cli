# Custom presets

Besides the built-in presets (`web`, `print`, `thumbnail`, `alloy`), you can add your own in `.imgconverter.config.json`.

### Structure

```json
{
  "presets": {
    "your-preset-name": {
      "quality": 80,                   // Optional: compression quality (1-100)
      "width": 1920,                   // Optional: target width
      "height": 1080,                  // Optional: target height
      "format": "webp",                // Optional: target format
      "background": "#000000",         // Optional: background color for transparency
      "source": "path/to/source",      // Optional: default source directory
      "output": "path/to/output",      // Optional: custom output directory
      "replace-originals": false       // Optional: replace original files
    }
  }
}
```

### Examples

#### Social media

```json
{
  "presets": {
    "instagram-post": {
      "quality": 85,
      "width": 1080,
      "height": 1080,
      "format": "jpeg",
      "background": "#ffffff"
    },
    "instagram-story": {
      "quality": 80,
      "width": 1080,
      "height": 1920,
      "format": "jpeg",
      "background": "#ffffff"
    },
    "twitter-header": {
      "quality": 90,
      "width": 1500,
      "height": 500,
      "format": "jpeg",
      "background": "#1da1f2"
    }
  }
}
```

Usage:
```bash
imgconvert photos -p instagram-post
imgconvert banner.png -p twitter-header
```

#### E-commerce

```json
{
  "presets": {
    "product-main": {
      "width": 800,
      "height": 800,
      "quality": 95,
      "format": "webp",
      "background": "#ffffff",
      "output": "products/main",
      "source": "products/originals"
    },
    "product-gallery": {
      "width": 600,
      "height": 600,
      "quality": 85,
      "format": "webp",
      "background": "#ffffff",
      "output": "products/gallery",
      "source": "products/originals"
    },
    "product-thumbnail": {
      "width": 200,
      "height": 200,
      "quality": 80,
      "format": "webp",
      "background": "#ffffff",
      "output": "products/thumbs",
      "source": "products/originals"
    }
  }
}
```

Usage:
```bash
imgconvert -p product-main
imgconvert -p product-gallery
imgconvert -p product-thumbnail
```

#### Email marketing

```json
{
  "presets": {
    "email-header": {
      "width": 600,
      "height": 200,
      "quality": 75,
      "format": "jpeg",
      "background": "#ffffff"
    },
    "email-content": {
      "width": 300,
      "quality": 70,
      "format": "jpeg",
      "background": "#ffffff"
    }
  }
}
```

#### Blog / website

```json
{
  "presets": {
    "blog-featured": {
      "width": 1200,
      "height": 630,
      "quality": 85,
      "format": "webp",
      "source": "content/images",
      "output": "public/featured"
    },
    "blog-inline": {
      "width": 800,
      "quality": 80,
      "format": "webp",
      "output": "public/inline",
      "source": "content/images"
    },
    "blog-gallery": {
      "width": 400,
      "height": 300,
      "quality": 75,
      "format": "webp",
      "source": "content/images",
      "output": "public/gallery",
    }
  }
}
```

#### Per-environment

```json
{
  "presets": {
    "dev": {
      "quality": 60,
      "format": "jpeg",
      "output": "dist/dev"
    },
    "staging": {
      "quality": 75,
      "format": "webp",
      "output": "dist/staging"
    },
    "production": {
      "quality": 85,
      "format": "webp",
      "output": "dist/prod"
    },
    "cdn": {
      "quality": 80,
      "format": "avif",
      "output": "dist/cdn",
      "replace-originals": false
    }
  }
}
```

#### UI / transparent assets

```json
{
  "presets": {
    "ui-icons": {
      "width": 64,
      "height": 64,
      "quality": 95,
      "canvas": true,
      "format": "png",
      "source": "ui/icons-source",
      "output": "ui/icons"
    },
    "ui-transparent-assets": {
      "width": 512,
      "height": 512,
      "quality": 95,
      "canvas": true,
      "format": "png",
      "background": "transparent",
      "source": "ui/transparent-source",
      "output": "ui/assets"
    },
    "logo-variants": {
      "quality": 90,
      "canvas": true,
      "format": "webp",
      "source": "branding/logos",
      "output": "branding/web"
    }
  }
}
```

```bash
imgconvert -p ui-icons
imgconvert -p logo-variants
imgconvert -p ui-transparent-assets
```

#### File organization with renaming

```json
{
  "presets": {
    "web-gallery-organized": {
      "width": 800,
      "quality": 85,
      "format": "webp",
      "rename": "lowercase,replace-spaces,prefix:gallery-",
      "source": "photos/raw",
      "output": "web/gallery"
    },
    "thumbnail-enumerated": {
      "width": 200,
      "height": 200,
      "quality": 75,
      "fit": "cover",
      "format": "webp",
      "rename": "enumerate,suffix:-thumb",
      "source": "photos/raw",
      "output": "web/thumbs"
    },
    "seo-friendly-images": {
      "width": 1200,
      "quality": 80,
      "format": "webp",
      "rename": "lowercase,replace-spaces",
      "source": "content/images",
      "output": "content/web"
    }
  }
}
```

```bash
imgconvert -p web-gallery-organized
# "Beautiful Sunset.jpg" → "gallery-beautiful-sunset.webp"

imgconvert -p thumbnail-enumerated
# photo.jpg → "001-photo-thumb.webp"

imgconvert -p seo-friendly-images
# "Product Image 2024.png" → "product-image-2024.webp"
```

### Source paths in presets

If a preset defines `source`, you don't need to pass it on the command line:

```json
{
  "presets": {
    "icons": {
      "width": 32,
      "height": 32,
      "quality": 95,
      "format": "png",
      "source": "src/icons",
      "output": "dist/icons"
    }
  }
}
```

Usage:
```bash
# Automatically uses src/icons as source
imgconvert -p icons
```

### CLI overrides

CLI arguments always win over preset values:

```json
{
  "presets": {
    "base-web": {
      "quality": 80,
      "format": "webp"
    }
  }
}
```

```bash
# Uses WebP format but with 95% quality instead of 80%
imgconvert images -p base-web -q 95

# Uses 80% quality but JPEG format instead of WebP
imgconvert images -p base-web -f jpeg
```

### Tips

- Use descriptive names: `product-catalog-thumb`, not `preset1`
- Group related presets by prefix: `ecommerce-main`, `ecommerce-zoom`, `ecommerce-thumb`
- Quality guidelines: 90-100 for print, 75-89 for web, 60-74 for thumbnails/email
- Format guidelines: JPEG for photos, PNG for transparency, WebP for web, AVIF for best compression
- Use `canvas: true` when you need exact dimensions with transparency
- Use `rename` for consistent file naming across batches

### Full example

A config file for a web development agency:

```json
{
  "quality": 85,
  "width": null,
  "height": null,
  "source": null,
  "output": null,
  "format": null,
  "background": "#ffffff",
  "replace-originals": false,
  "presets": {
    "web": { "format": "webp", "quality": 80 },
    "print": { "format": "tiff", "quality": 100 },
    "thumbnail": { "format": "png", "quality": 60, "width": 150, "height": 150 },

    "client-web-hero": {
      "width": 1920,
      "quality": 90,
      "height": 1080,
      "format": "webp",
      "output": "clients/web/hero",
      "source": "clients/images/hero",
    },
    "client-web-gallery": {
      "width": 800,
      "height": 600,
      "quality": 85,
      "format": "webp",
      "output": "clients/web/gallery",
      "source": "clients/images/gallery"
    },
    "client-web-thumbs": {
      "width": 300,
      "height": 225,
      "quality": 75,
      "format": "webp",
      "output": "clients/web/thumbs",
      "source": "clients/images/gallery"
    },
    "client-email": {
      "width": 600,
      "quality": 70,
      "format": "jpeg",
      "background": "#ffffff",
      "output": "clients/email",
      "source": "clients/images/email"
    },
    "client-print-brochure": {
      "width": 2480,
      "quality": 100,
      "height": 3508,
      "format": "tiff",
      "source": "clients/images/print",
      "output": "clients/print/brochure"
    },
    "client-social-facebook": {
      "quality": 85,
      "width": 1200,
      "height": 630,
      "format": "jpeg",
      "background": "#ffffff",
      "source": "clients/images/social",
      "output": "clients/social/facebook"
    },
    "client-social-instagram": {
      "quality": 85,
      "width": 1080,
      "height": 1080,
      "format": "jpeg",
      "background": "#ffffff",
      "source": "clients/images/social",
      "output": "clients/social/instagram"
    },
    "client-ui-components": {
      "quality": 95,
      "canvas": true,
      "format": "png",
      "source": "clients/images/ui",
      "output": "clients/ui/components"
    },
    "client-organized-web": {
      "width": 1200,
      "quality": 85,
      "format": "webp",
      "rename": "lowercase,replace-spaces,prefix:client-",
      "source": "clients/images/mixed",
      "output": "clients/web/organized"
    }
  }
}
```

### Workflows

#### Running multiple presets
```bash
# Process all client deliverables
imgconvert -p client-email
imgconvert -p client-web-hero
imgconvert -p client-web-thumbs
imgconvert -p client-web-gallery
imgconvert -p client-ui-components
imgconvert -p client-organized-web
imgconvert -p client-social-facebook
imgconvert -p client-social-instagram
```

#### Shell script

```bash
#!/bin/bash
# client-delivery.sh

echo "Processing client deliverables..."

imgconvert -p client-email
imgconvert -p client-web-hero
imgconvert -p client-web-thumbs
imgconvert -p client-web-gallery
imgconvert -p client-ui-components
imgconvert -p client-organized-web
imgconvert -p client-social-facebook
imgconvert -p client-social-instagram

echo "Client deliverables ready!"
```

Keep your `.imgconverter.config.json` in version control so the whole team uses the same presets. Test with a few sample images before running on the full set.
