'use strict';
function parseHexToRgba(colorString) {
  if (!colorString || typeof colorString !== 'string') return null;

  const color = colorString.trim().toLowerCase();

  // Named colors (common ones)
  const namedColors = {
    'white': { r: 255, g: 255, b: 255, alpha: 1 },
    'black': { r: 0, g: 0, b: 0, alpha: 1 },
    'red': { r: 255, g: 0, b: 0, alpha: 1 },
    'green': { r: 0, g: 128, b: 0, alpha: 1 },
    'blue': { r: 0, g: 0, b: 255, alpha: 1 },
    'yellow': { r: 255, g: 255, b: 0, alpha: 1 },
    'cyan': { r: 0, g: 255, b: 255, alpha: 1 },
    'magenta': { r: 255, g: 0, b: 255, alpha: 1 },
    'transparent': { r: 0, g: 0, b: 0, alpha: 0 },
    'gray': { r: 128, g: 128, b: 128, alpha: 1 },
    'grey': { r: 128, g: 128, b: 128, alpha: 1 }
  };

  if (namedColors[color]) {
    return namedColors[color];
  }

  // rgb() or rgba() format
  const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (rgbMatch && rgbMatch.slice(1, 4).every(v => Number(v) <= 255) && (rgbMatch[4] === undefined || Number(rgbMatch[4]) <= 1)) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      alpha: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
    };
  }

  // Hex format
  if (!/^#?[0-9a-f]{3,8}$/.test(color)) return null;
  let hex = color.replace('#', '');

  // Convert 3-char hex to 6-char
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  // Handle 4-char hex (with alpha) to 8-char
  if (hex.length === 4) {
    hex = hex.split('').map(c => c + c).join('');
  }

  // Parse 6-char hex
  if (hex.length === 6) {
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b, alpha: 1 };
    }
  }

  // Parse 8-char hex (with alpha)
  if (hex.length === 8) {
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const a = parseInt(hex.substr(6, 2), 16);

    if (!isNaN(r) && !isNaN(g) && !isNaN(b) && !isNaN(a)) {
      return { r, g, b, alpha: a / 255 };
    }
  }

  return null;
}

function normalizePositionName(position) {
  return String(position)
    .toLowerCase()
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');
}

module.exports = { parseHexToRgba, normalizePositionName };
