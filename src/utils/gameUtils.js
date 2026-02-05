import { easyWords } from '../data/easyWords';
import { mediumWords } from '../data/mediumWords';
import { hardWords } from '../data/hardWords';

// Get word database based on difficulty level
export const getWordDatabase = (level) => {
  if (level >= 1 && level <= 3) return easyWords;
  if (level >= 4 && level <= 6) return mediumWords;
  if (level >= 7 && level <= 9) return hardWords;
  return mediumWords; // default
};

// Generate random words for a game round
export const generateRandomWords = (count, level) => {
  const database = getWordDatabase(level);
  const shuffled = [...database].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Select random bonus words - FIXED to handle both array and number
export const selectBonusWords = (wordCountOrArray, bonusCount) => {
  // Handle both array and number input
  const totalWords = Array.isArray(wordCountOrArray) ? wordCountOrArray.length : wordCountOrArray;
  
  const indices = [];
  const maxBonus = Math.min(bonusCount, totalWords);
  
  while (indices.length < maxBonus) {
    const randomIndex = Math.floor(Math.random() * totalWords);
    if (!indices.includes(randomIndex)) {
      indices.push(randomIndex);
    }
  }
  
  console.log(`Generated ${indices.length} bonus indices out of ${totalWords} words:`, indices);
  return indices;
};

// Calculate points based on word count
export const calculatePoints = (wordCount, bonusCount) => {
  let basePoints = 0;
  
  if (wordCount === 2) basePoints = 2;
  else if (wordCount === 3) basePoints = 4;
  else if (wordCount === 4) basePoints = 8;
  else if (wordCount >= 5) basePoints = 16;
  
  return basePoints + bonusCount;
};

// Generate a random 6-digit room number
export const generateRoomNumber = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Simple spell checker - accepts all valid letter words
export const spellCheck = (word) => {
  if (!word || word.trim().length === 0) return false;
  
  const cleanWord = word.trim();
  
  // Only check if it's letters and at least 2 characters
  if (cleanWord.length < 2) return false;
  if (!/^[A-Za-z]+$/.test(cleanWord)) return false;
  
  // Accept all valid words for now
  return true;
};

// Format time (seconds to MM:SS)
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Validate player name (alphanumeric, spaces, underscores)
export const validatePlayerName = (name) => {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 20) return false;
  return /^[a-zA-Z0-9_ ]+$/.test(name);
};

// Validate email
export const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const validatePhone = (phone) => {
  if (!phone || phone.trim().length === 0) return false;
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};
