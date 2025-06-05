/**
 * Sorting utilities for file processing
 */

const path = require('path');

/**
 * Natural sort comparison function for numeric filenames
 * Handles cases like: 1.png, 2.png, 10.png, 11.png instead of 1.png, 10.png, 11.png, 2.png
 * @param {string} a - First filename
 * @param {string} b - Second filename
 * @returns {number} Comparison result
 */
function naturalSort(a, b) {
  const aName = path.parse(a).name;
  const bName = path.parse(b).name;

  // If both are pure numbers, compare numerically
  const aNum = parseInt(aName, 10);
  const bNum = parseInt(bName, 10);

  if (!isNaN(aNum) && !isNaN(bNum) && aName === aNum.toString() && bName === bNum.toString()) {
    return aNum - bNum;
  }

  // Otherwise, use natural string comparison with numeric awareness
  return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' });
}

module.exports = {
  naturalSort
};
