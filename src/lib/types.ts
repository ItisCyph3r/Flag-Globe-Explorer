// Type definitions for our application

export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  continent: Continent;
  flagUrl: string;
}

export type Continent = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';

export interface QuizState {
  continent: Continent | null;
  currentQuestion: Question | null;
  score: number;
  questionsAsked: number;
  history: QuizHistory[];
  status: 'idle' | 'loading' | 'active' | 'feedback' | 'completed';
  loading: boolean;
  usedCountries: string[]; // Track country codes that have been shown
  gameMode: 'multiple-choice' | 'spelling';
  totalCountries: number;
}

export interface Question {
  targetCountry: Country;
  options: Country[];
}

export interface QuizHistory {
  question: Question;
  userAnswer: Country;
  correct: boolean;
  timestamp: number;
}

export interface ContinentStats {
  continent: Continent;
  totalAttempts: number;
  correctAnswers: number;
  highScore: number;
  // Map of country codes to their stats
  countryStats: Record<string, CountryStats>;
}

export interface CountryStats {
  correct: number;
  incorrect: number;
  lastAttempt: number | null;
  nextReviewDue: number | null;
  // Spaced repetition level (higher = longer intervals)
  level: number;
}

export type UserStatsStore = {
  continents: Record<Continent, ContinentStats>;
  lastPlayed: number | null;
}
