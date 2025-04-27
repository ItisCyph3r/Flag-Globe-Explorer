
import { Continent, ContinentStats, CountryStats, UserStatsStore } from "./types";

const STORAGE_KEY = "flag-globe-explorer-stats";

const defaultCountryStats = (): CountryStats => ({
  correct: 0,
  incorrect: 0,
  lastAttempt: null,
  nextReviewDue: null,
  level: 0,
});

const defaultContinentStats = (continent: Continent): ContinentStats => ({
  continent,
  totalAttempts: 0,
  correctAnswers: 0,
  highScore: 0,
  countryStats: {},
});

const defaultUserStats = (): UserStatsStore => {
  const continents: Record<Continent, ContinentStats> = {
    'Africa': defaultContinentStats('Africa'),
    'Asia': defaultContinentStats('Asia'),
    'Europe': defaultContinentStats('Europe'),
    'North America': defaultContinentStats('North America'),
    'South America': defaultContinentStats('South America'),
    'Oceania': defaultContinentStats('Oceania'),
  };
  
  return {
    continents,
    lastPlayed: null,
  };
};

// Load stats from local storage
export const loadStats = (): UserStatsStore => {
  try {
    const savedStats = localStorage.getItem(STORAGE_KEY);
    if (savedStats) {
      return JSON.parse(savedStats);
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
  return defaultUserStats();
};

// Save stats to local storage
export const saveStats = (stats: UserStatsStore): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Error saving stats:", error);
  }
};

// Calculate when the country should be reviewed next based on spaced repetition
export const calculateNextReview = (level: number): number => {
  // Base interval in milliseconds (1 day)
  const baseInterval = 24 * 60 * 60 * 1000;
  
  // Calculate next interval based on the level (exponential backoff)
  // Level 0: 1 day, Level 1: 3 days, Level 2: 7 days, Level 3: 14 days, etc.
  const multiplier = Math.pow(2, level);
  const interval = baseInterval * multiplier;
  
  return Date.now() + interval;
};

// Update stats after an answer
export const updateStats = (
  stats: UserStatsStore,
  continent: Continent,
  countryCode: string,
  correct: boolean,
  score: number
): UserStatsStore => {
  const newStats = { ...stats };
  
  // Ensure continent stats exist
  if (!newStats.continents[continent]) {
    newStats.continents[continent] = defaultContinentStats(continent);
  }
  
  const continentStats = newStats.continents[continent];
  continentStats.totalAttempts++;
  if (correct) {
    continentStats.correctAnswers++;
  }
  
  // Update high score if necessary
  if (score > continentStats.highScore) {
    continentStats.highScore = score;
  }
  
  // Ensure country stats exist
  if (!continentStats.countryStats[countryCode]) {
    continentStats.countryStats[countryCode] = defaultCountryStats();
  }
  
  const countryStats = continentStats.countryStats[countryCode];
  
  // Update country-specific stats
  if (correct) {
    countryStats.correct++;
    // Increase level for spaced repetition (max level 5)
    countryStats.level = Math.min(5, countryStats.level + 1);
  } else {
    countryStats.incorrect++;
    // Reset level for incorrect answers
    countryStats.level = 0;
  }
  
  countryStats.lastAttempt = Date.now();
  countryStats.nextReviewDue = calculateNextReview(countryStats.level);
  
  // Update last played timestamp
  newStats.lastPlayed = Date.now();
  
  return newStats;
};

// Get countries due for review based on spaced repetition
export const getCountriesDueForReview = (
  stats: UserStatsStore,
  continent: Continent
): string[] => {
  const now = Date.now();
  const continentStats = stats.continents[continent];
  
  if (!continentStats) return [];
  
  return Object.entries(continentStats.countryStats)
    .filter(([_, stats]) => {
      // Include if never reviewed or due for review
      return !stats.nextReviewDue || stats.nextReviewDue <= now;
    })
    .map(([code]) => code);
};
