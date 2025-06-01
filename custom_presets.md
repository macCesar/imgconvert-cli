# Custom Presets Documentation

## Creating Custom Presets

Beyond the built-in presets (`web`, `print`, `thumbnail`, `alloy`), you can create your own custom presets in the `.imgconverter.config.json` file. This allows you to define reusable configurations for specific workflows or project requirements.

### Basic Custom Preset Structure

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

### Custom Preset Examples

#### Social Media Preset
Perfect for social media platforms with specific size requirements:

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

#### E-commerce Preset
For online store product images:

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

#### Email Marketing Preset
For email newsletter images:

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

#### Blog/Website Preset
For content management systems:

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

#### Development Environment Preset
For different deployment environments:

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

### Advanced Custom Preset Features

#### Using Source Paths in Presets
When a preset defines a `source` path, you don't need to specify the source in the command:

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

#### Preset Inheritance and Overrides
CLI arguments always override preset values:

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

### Best Practices for Custom Presets

#### 1. **Descriptive Naming**
Use clear, descriptive names that indicate the purpose:
```json
{
  "presets": {
    "mobile-app-icon": { ... },
    "email-newsletter-header": { ... },
    "product-catalog-thumb": { ... }
  }
}
```

#### 2. **Organize by Project or Platform**
Group related presets together:
```json
{
  "presets": {
    "ecommerce-main": { ... },
    "ecommerce-zoom": { ... },
    "ecommerce-thumb": { ... },

    "social-twitter": { ... },
    "social-facebook": { ... },
    "social-instagram": { ... }
  }
}
```

#### 3. **Consider File Size vs Quality**
Balance quality and file size for different use cases:
- **High quality** (90-100): Print, professional photography
- **Medium quality** (75-89): Web content, product images
- **Lower quality** (60-74): Thumbnails, email, mobile apps

#### 4. **Use Appropriate Formats**
Choose formats based on content type:
- **JPEG**: Photos, complex images with many colors
- **PNG**: Images with transparency, simple graphics, logos
- **WebP**: Modern web format, excellent compression
- **AVIF**: Next-gen format for cutting-edge applications

### Complete Custom Configuration Example

Here's a comprehensive example showing multiple custom presets for a web development agency:

```json
{
  "quality": 85,
  "width": null,
  "height": null,
  "source": null,
  "output": null,
  "format": null,
  "replace-originals": false,
  "background": "#ffffff",
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
      "quality": 75,
      "width": 300,
      "height": 225,
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
    }
  }
}
```

### Using Custom Presets in Workflows

#### Batch Processing Multiple Presets
```bash
# Process all client deliverables
imgconvert -p client-email
imgconvert -p client-web-hero
imgconvert -p client-web-thumbs
imgconvert -p client-web-gallery
imgconvert -p client-social-facebook
imgconvert -p client-social-instagram
```

#### Scripted Workflows
Create shell scripts for complex workflows:

```bash
#!/bin/bash
# client-delivery.sh

echo "Processing client deliverables..."

imgconvert -p client-email
imgconvert -p client-web-hero
imgconvert -p client-web-thumbs
imgconvert -p client-web-gallery
imgconvert -p client-social-facebook
imgconvert -p client-social-instagram

echo "Client deliverables ready!"
```

### Tips for Preset Management

1. **Version Control**: Keep your `.imgconverter.config.json` in version control
2. **Documentation**: Comment your presets (JSON doesn't support comments, but maintain separate docs)
3. **Testing**: Test presets with sample images before production use
4. **Sharing**: Share preset configurations across team members
5. **Backup**: Keep backup copies of complex preset configurations

Custom presets make imgconvert-cli incredibly flexible and allow you to standardize image processing across projects, teams, and workflows. They're perfect for maintaining consistency in brand guidelines, technical specifications, and delivery requirements.
