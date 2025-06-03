/**
 * Default configuration values
 * Contains all default settings and presets
 */

// Titanium Alloy platform scales (immutable - these are Titanium standards)
const ALLOY_SCALES = Object.freeze({
  android: Object.freeze({
    "res-mdpi": 1,
    "res-hdpi": 1.5,
    "res-xhdpi": 2,
    "res-xxhdpi": 3,
    "res-xxxhdpi": 4
  }),
  iphone: Object.freeze({
    "1x": 1,
    "2x": 2,
    "3x": 3
  })
});

// Default configuration values
const defaultConfig = {
  quality: 85,
  width: null,
  height: null,
  source: null,
  output: null,
  format: null,
  canvas: false,
  background: null,

  crop: null,
  fit: 'contain',
  position: 'center',

  'replace-originals': false
};

// Default presets
const defaultPresets = {
  print: {
    source: null,
    output: null,
    quality: 100,
    format: 'tiff',
    fit: 'contain'
  },
  web: {
    source: null,
    output: null,
    quality: 80,
    format: 'webp',
    fit: 'cover',
    position: 'center'
  },
  thumbnail: {
    source: null,
    output: null,
    width: 150,
    height: 150,
    quality: 60,
    format: 'png',
    fit: 'cover',
    position: 'center'
  },
  alloy: {
    android: {
      source: null,
      output: null
    },
    iphone: {
      source: null,
      output: null
    }
  }
};

// Supported image formats
const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'tiff', 'gif'];

// Constants
const CONSTANTS = {
  MIN_QUALITY: 1,
  MAX_QUALITY: 100,
  DENSITY_DPI: 72,
  DEFAULT_QUALITY: 85,
  TEMP_FILE_LENGTH: 15,
  PROGRESS_BAR_WIDTH: 100
};

module.exports = {
  ALLOY_SCALES,
  defaultConfig,
  defaultPresets,
  SUPPORTED_FORMATS,
  CONSTANTS
};
