// bonusUtils.js - Bonus point calculation for Link Logic game

/**
 * Grid Layout (4x5 = 20 words):
 * 
 *  0   1   2   3   4
 *  5   6   7   8   9
 * 10  11  12  13  14
 * 15  16  17  18  19
 * 
 * Corner positions: 0, 4, 15, 19
 * Edge positions: 0,1,2,3,4,5,9,10,14,15,16,17,18,19
 * Non-edge (interior): 6,7,8,11,12,13
 */

const GRID_COLS = 5;
const GRID_ROWS = 4;

// Convert flat index to grid position
export const indexToPosition = (index) => {
  const row = Math.floor(index / GRID_COLS);
  const col = index % GRID_COLS;
  return { row, col };
};

// Convert grid position to flat index
export const positionToIndex = (row, col) => {
  return row * GRID_COLS + col;
};

// Check if two positions are adjacent (including diagonals)
export const areAdjacent = (pos1, pos2) => {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  
  // Adjacent if within 1 row AND 1 col (includes diagonals)
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
};

// ROUND 2: Corner Bonus
// Check if word is in corner position
export const isCornerWord = (wordIndex) => {
  const corners = [0, 4, 15, 19];
  return corners.includes(wordIndex);
};

// ROUND 3: Touch Bonus
// Check if two words touch each other (adjacent)
export const doWordsTou = (index1, index2) => {
  const pos1 = indexToPosition(index1);
  const pos2 = indexToPosition(index2);
  return areAdjacent(pos1, pos2);
};

// ROUND 4: Edge Bonus
// Check if word is on outer edge
export const isEdgeWord = (wordIndex) => {
  const pos = indexToPosition(wordIndex);
  return pos.row === 0 || pos.row === GRID_ROWS - 1 || 
         pos.col === 0 || pos.col === GRID_COLS - 1;
};

// ROUND 5: Line Bonus
// Check if words are in same row or column
export const areInSameLine = (index1, index2) => {
  const pos1 = indexToPosition(index1);
  const pos2 = indexToPosition(index2);
  return pos1.row === pos2.row || pos1.col === pos2.col;
};

/**
 * Calculate bonus points for a round
 * @param {number} round - Current round number
 * @param {string[]} selectedWords - Array of selected words
 * @param {string[]} allWords - All words in the grid
 * @param {object} bonusSettings - Bonus settings from Firebase (optional)
 * @returns {object} { qualifyingCount, bonusPoints, description }
 */
export const calculateRoundBonus = (round, selectedWords, allWords, bonusSettings = null) => {
  // No bonus for round 1
  if (round === 1) {
    return { qualifyingCount: 0, bonusPoints: 0, description: null };
  }

  // Check if bonus is enabled for this round
  const roundKey = `round${round}`;
  if (bonusSettings && bonusSettings[roundKey] && !bonusSettings[roundKey].enabled) {
    return { qualifyingCount: 0, bonusPoints: 0, description: 'Disabled' };
  }

  // Get indices of selected words
  const selectedIndices = selectedWords.map(word => allWords.indexOf(word));
  
  let qualifyingCount = 0;
  let description = '';

  switch (round) {
    case 2: // Corner Bonus
      qualifyingCount = selectedIndices.filter(isCornerWord).length;
      description = 'Corner words';
      break;

    case 3: // Touch Bonus
      // Count pairs of words that touch
      const touchPairs = [];
      for (let i = 0; i < selectedIndices.length; i++) {
        for (let j = i + 1; j < selectedIndices.length; j++) {
          if (doWordsTou(selectedIndices[i], selectedIndices[j])) {
            touchPairs.push([i, j]);
          }
        }
      }
      // Each word in a touching pair counts
      const touchingWords = new Set();
      touchPairs.forEach(([i, j]) => {
        touchingWords.add(selectedIndices[i]);
        touchingWords.add(selectedIndices[j]);
      });
      qualifyingCount = touchingWords.size;
      description = 'Touching words';
      break;

    case 4: // Edge Bonus
      qualifyingCount = selectedIndices.filter(isEdgeWord).length;
      description = 'Edge words';
      break;

    case 5: // Line Bonus
      // Count words that share a row or column with at least one other word
      const lineWords = new Set();
      for (let i = 0; i < selectedIndices.length; i++) {
        for (let j = i + 1; j < selectedIndices.length; j++) {
          if (areInSameLine(selectedIndices[i], selectedIndices[j])) {
            lineWords.add(selectedIndices[i]);
            lineWords.add(selectedIndices[j]);
          }
        }
      }
      qualifyingCount = lineWords.size;
      description = 'Line words';
      break;

    default:
      return { qualifyingCount: 0, bonusPoints: 0, description: null };
  }

  // Calculate bonus points based on qualifying count
  // Use custom values from settings if available, otherwise use defaults
  let bonusPoints = 0;
  const defaultValues = { tier1: 10, tier2: 20, tier3: 30 };
  const tierValues = (bonusSettings && bonusSettings[roundKey]) ? bonusSettings[roundKey] : defaultValues;
  
  if (qualifyingCount === 2) bonusPoints = tierValues.tier1;
  else if (qualifyingCount === 3) bonusPoints = tierValues.tier2;
  else if (qualifyingCount >= 4) bonusPoints = tierValues.tier3;

  return { qualifyingCount, bonusPoints, description };
};

/**
 * Get visual representation of grid positions for debugging
 */
export const visualizeGrid = (highlightIndices = []) => {
  let grid = '';
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const index = positionToIndex(row, col);
      const char = highlightIndices.includes(index) ? '●' : index.toString().padStart(2, ' ');
      grid += char + ' ';
    }
    grid += '\n';
  }
  return grid;
};

export default {
  indexToPosition,
  positionToIndex,
  areAdjacent,
  isCornerWord,
  doWordsTou,
  isEdgeWord,
  areInSameLine,
  calculateRoundBonus,
  visualizeGrid
};
