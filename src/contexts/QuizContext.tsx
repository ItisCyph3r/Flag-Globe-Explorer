import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { Continent, Country, Question, QuizHistory, QuizState } from '@/lib/types';
import { createQuestion, fetchAllCountries, getCountriesByContinent } from '@/lib/country-data';
import { loadStats, saveStats, updateStats } from '@/lib/storage-service';
import { toast } from '@/components/ui/use-toast';

// Define actions for the reducer
type QuizAction =
  | { type: 'START_QUIZ'; payload: { continent: Continent; gameMode?: 'multiple-choice' | 'spelling'; totalCountries: number } }
  | { type: 'SET_QUESTION'; payload: { question: Question | null; usedCountries?: string[] } }
  | { type: 'SUBMIT_ANSWER'; payload: { answer: Country } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'END_QUIZ' }
  | { type: 'RESET' };

// Initial state
const initialQuizState: QuizState = {
  continent: null,
  currentQuestion: null,
  score: 0,
  questionsAsked: 0,
  history: [],
  status: 'idle',
  loading: false,
  usedCountries: [],
  gameMode: 'multiple-choice',
  totalCountries: 0,
};

// Reducer function
function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ': {
      const { continent, gameMode, totalCountries } = action.payload;
      return {
        ...initialQuizState,
        continent,
        gameMode,
        totalCountries,
        status: 'loading',
        loading: true,
      };
    }
    
    case 'SET_QUESTION': {
      const { question, usedCountries } = action.payload;
      return {
        ...state,
        currentQuestion: question,
        status: question ? 'active' : 'idle',
        loading: false,
        usedCountries: usedCountries || state.usedCountries,
      };
    }
    
    case 'SUBMIT_ANSWER': {
      const { answer } = action.payload;
      if (!state.currentQuestion) return state;
      
      const correct = answer.code === state.currentQuestion.targetCountry.code;
      const history: QuizHistory = {
        question: state.currentQuestion,
        userAnswer: answer,
        correct,
        timestamp: Date.now(),
      };
      
      return {
        ...state,
        score: correct ? state.score + 1 : state.score,
        history: [...state.history, history],
        status: 'feedback',
      };
    }
    
    case 'NEXT_QUESTION': {
      if (!state.continent) return state;
      
      return {
        ...state,
        status: 'loading',
        loading: true,
        questionsAsked: state.questionsAsked + 1,
      };
    }
    
    case 'END_QUIZ': {
      return {
        ...state,
        status: 'completed',
        loading: false,
      };
    }
    
    case 'RESET': {
      return initialQuizState;
    }
    
    default:
      return state;
  }
}

// Create context
interface QuizContextType {
  state: QuizState;
  startQuiz: (continent: Continent, gameMode?: 'multiple-choice' | 'spelling') => Promise<void>;
  submitAnswer: (answer: Country) => void;
  nextQuestion: () => Promise<void>;
  endQuiz: () => void;
  resetQuiz: () => void;
  countriesLoaded: boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Provider component
export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const [countriesLoaded, setCountriesLoaded] = useState(false);
  
  // Load stats and countries on initial mount
  const userStats = React.useMemo(() => loadStats(), []);
  
  // Preload countries data
  useEffect(() => {
    const loadCountries = async () => {
      try {
        await fetchAllCountries();
        setCountriesLoaded(true);
      } catch (error) {
        console.error('Failed to preload countries:', error);
        toast({
          title: "Error",
          description: "Failed to load countries data. Please check your connection and try again.",
          variant: "destructive",
        });
      }
    };
    
    loadCountries();
  }, []);
  
  // Update stats when an answer is submitted
  useEffect(() => {
    const lastHistoryItem = state.history[state.history.length - 1];
    
    if (lastHistoryItem && state.status === 'feedback' && state.continent) {
      const updatedStats = updateStats(
        userStats,
        state.continent,
        lastHistoryItem.userAnswer.code,
        lastHistoryItem.correct,
        state.score
      );
      
      saveStats(updatedStats);
      
      // Show toast notification
      if (lastHistoryItem.correct) {
        toast({
          title: "Correct!",
          description: `You identified ${lastHistoryItem.question.targetCountry.name} correctly.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Incorrect",
          description: `The correct answer was ${lastHistoryItem.question.targetCountry.name}.`,
          variant: "destructive",
        });
      }
    }
  }, [state.history, state.status, state.continent, userStats, state.score]);
  
  // Context methods
  const startQuiz = async (continent: Continent, gameMode: 'multiple-choice' | 'spelling' = 'multiple-choice') => {
    try {
      // Get total number of countries for the continent
      const continentCountries = await getCountriesByContinent(continent);
      const totalCountries = continentCountries.length;
      
      dispatch({ type: 'START_QUIZ', payload: { continent, gameMode, totalCountries } });
      const question = await createQuestion(continent);
      dispatch({ type: 'SET_QUESTION', payload: { question } });
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to start quiz. Please try again.",
        variant: "destructive",
      });
      dispatch({ type: 'RESET' });
    }
  };
  
  const submitAnswer = (answer: Country) => {
    dispatch({ type: 'SUBMIT_ANSWER', payload: { answer } });
  };
  
  const nextQuestion = async () => {
    try {
      if (!state.continent) return;
      
      dispatch({ type: 'NEXT_QUESTION' });
      const question = await createQuestion(state.continent);
      
      if (!question) {
        dispatch({ type: 'END_QUIZ' });
        return;
      }
      
      // Check if we've shown all countries
      const continentCountries = await getCountriesByContinent(state.continent);
      const allCountriesShown = state.usedCountries.length >= continentCountries.length;
      
      if (allCountriesShown) {
        dispatch({ type: 'END_QUIZ' });
        toast({
          title: "Quiz Complete!",
          description: "You've seen all the countries in this continent!",
          variant: "default",
        });
        return;
      }
      
      // Add the target country to used countries if not already there
      if (!state.usedCountries.includes(question.targetCountry.code)) {
        dispatch({ 
          type: 'SET_QUESTION', 
          payload: { 
            question,
            usedCountries: [...state.usedCountries, question.targetCountry.code]
          } 
        });
      } else {
        dispatch({ type: 'SET_QUESTION', payload: { question } });
      }
    } catch (error) {
      console.error('Error getting next question:', error);
      toast({
        title: "Error",
        description: "Failed to load next question. Please try again.",
        variant: "destructive",
      });
      dispatch({ type: 'END_QUIZ' });
    }
  };
  
  const endQuiz = () => {
    dispatch({ type: 'END_QUIZ' });
  };
  
  const resetQuiz = () => {
    dispatch({ type: 'RESET' });
  };
  
  const contextValue: QuizContextType = {
    state,
    startQuiz,
    submitAnswer,
    nextQuestion,
    endQuiz,
    resetQuiz,
    countriesLoaded,
  };
  
  return (
    <QuizContext.Provider value={contextValue}>
      {children}
    </QuizContext.Provider>
  );
}

// Hook for using the quiz context
export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
