// Preset configurations for all 9 difficulty levels - UPDATED 1/11/25
export const presets = {
  1: {
    level: 1,
    difficulty: "Easy",
    words: 24,
    seconds: 120,
    rounds: 5,
    bonusWords: 5
  },
  2: {
    level: 2,
    difficulty: "Easy",
    words: 22,
    seconds: 110,
    rounds: 5,
    bonusWords: 4
  },
  3: {
    level: 3,
    difficulty: "Easy",
    words: 20,
    seconds: 100,
    rounds: 5,
    bonusWords: 3
  },
  4: {
    level: 4,
    difficulty: "Medium",
    words: 22,
    seconds: 110,
    rounds: 5,
    bonusWords: 4
  },
  5: {
    level: 5,
    difficulty: "Medium",
    words: 20,
    seconds: 100,
    rounds: 5,
    bonusWords: 3
  },
  6: {
    level: 6,
    difficulty: "Medium",
    words: 18,
    seconds: 90,
    rounds: 5,
    bonusWords: 2
  },
  7: {
    level: 7,
    difficulty: "Difficult",
    words: 18,
    seconds: 100,
    rounds: 5,
    bonusWords: 3
  },
  8: {
    level: 8,
    difficulty: "Difficult",
    words: 16,
    seconds: 90,
    rounds: 5,
    bonusWords: 2
  },
  9: {
    level: 9,
    difficulty: "Difficult",
    words: 14,
    seconds: 80,
    rounds: 5,
    bonusWords: 1
  }
};

export const getPreset = (level) => {
  return presets[level] || presets[3]; // Default to level 3
};
