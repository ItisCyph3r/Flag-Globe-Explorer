import { useState, useEffect } from 'react';
import { Continent } from '@/lib/types';
import { continents } from '@/lib/country-data';
import { QuizProvider, useQuiz } from '@/contexts/QuizContext';
import ContinentCard from '@/components/ContinentCard';
import QuizQuestion from '@/components/QuizQuestion';
import SpellingQuizQuestion from '@/components/SpellingQuizQuestion';
import QuizResults from '@/components/QuizResults';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loader2 } from "lucide-react";
import InstallPWA from "@/components/InstallPWA";
import "../styles/bubbly-background.css";

// Main Quiz component that changes based on quiz state
const Quiz = () => {
  const { state, resetQuiz, endQuiz, startQuiz, countriesLoaded } = useQuiz();
  const [selectedGameMode, setSelectedGameMode] = useState<'multiple-choice' | 'spelling'>('multiple-choice');
  
  console.log("Quiz render - state:", state.status, "loading:", state.loading);
  
  useEffect(() => {
    console.log("Quiz status changed:", state.status, "loading:", state.loading);
  }, [state.status, state.loading]);
  
  // Show loading state if countries haven't loaded yet
  if (!countriesLoaded) {
    return (
      <div className="text-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg">Loading countries data...</p>
      </div>
    );
  }
  
  // Show loading state during quiz operations
  if (state.loading || state.status === 'loading') {
    return (
      <div className="text-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg">Loading quiz...</p>
      </div>
    );
  }
  
  if (state.status === 'idle') {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-3xl font-bold">Flag Globe Explorer</h1>
          
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-xl font-semibold">Select Game Mode</h2>
              <div className="flex gap-4">
                <Button
                  variant={selectedGameMode === 'multiple-choice' ? 'default' : 'outline'}
                  onClick={() => setSelectedGameMode('multiple-choice')}
                  className="min-w-[150px]"
                >
                  Multiple Choice
                </Button>
                <Button
                  variant={selectedGameMode === 'spelling' ? 'default' : 'outline'}
                  onClick={() => setSelectedGameMode('spelling')}
                  className="min-w-[150px]"
                >
                  Spelling
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-xl font-semibold">Select Continent</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {continents.map((continent) => (
                  <ContinentCard 
                    key={continent} 
                    continent={continent} 
                    onSelect={async (continent) => {
                      try {
                        console.log("Starting quiz for continent:", continent);
                        resetQuiz();
                        await startQuiz(continent, selectedGameMode);
                      } catch (error) {
                        console.error("Error starting quiz:", error);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (state.status === 'active' || state.status === 'feedback') {
    const progress = (state.usedCountries.length / state.totalCountries) * 100;
    const remainingCountries = state.totalCountries - state.usedCountries.length;

    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2 w-full max-w-md">
            <h2 className="text-xl font-bold">{state.continent} Quiz</h2>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Progress Stats */}
            <div className="flex justify-between w-full text-sm text-muted-foreground">
              <span>{state.usedCountries.length}/{state.totalCountries} countries</span>
              <span>{remainingCountries} remaining</span>
              <span>{Math.round(progress)}% complete</span>
            </div>

            {/* Visual Indicator */}
            <div className="flex gap-1">
              {Array.from({ length: state.totalCountries }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index < state.usedCountries.length 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (window.confirm('Are you sure you want to end this quiz?')) {
                endQuiz();
              }
            }}
          >
            End Quiz
          </Button>
          {state.gameMode === 'multiple-choice' ? (
            <QuizQuestion />
          ) : (
            <SpellingQuizQuestion />
          )}
        </div>
      </div>
    );
  }
  
  if (state.status === 'completed') {
    return <QuizResults />;
  }
  
  return null;
};

// Wrapper component that provides context
const Index = () => {
  const [error, setError] = useState<Error | null>(null);
  
  console.log("Index component rendering");
  
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        {/* Enhanced bubbly background */}
        <div className="bubbly-background">
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
        </div>
        
        <div className="container container-tight py-8 relative z-10">
          <header className="text-center mb-8 relative">
            <div className="absolute right-0 top-0">
              <ThemeToggle />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              <span className="text-primary">Flag</span> Globe Explorer
            </h1>
          </header>
          
          <div className="text-center p-8 rounded-lg border border-destructive bg-card bg-opacity-80 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
            <p className="mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  try {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        {/* Enhanced bubbly background with more bubbles and custom class */}
        <div className="bubbly-background">
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
          <div className="bubble bubble-enhanced"></div>
        </div>
        
        <div className="container container-tight py-8 relative z-10">
          <header className="text-center mb-8 relative">
            <div className=" right-0 top-0 flex justify-end items-center gap-2">
              <InstallPWA />
              <ThemeToggle />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 mt-4">
              <span className="text-primary">Flag</span> Globe Explorer
            </h1>
            <p className="text-muted-foreground">Learn flags from around the world</p>
          </header>
          
          <main className="bg-card bg-opacity-90 backdrop-blur-sm rounded-lg border p-6">
            <QuizProvider>
              <Quiz />
            </QuizProvider>
          </main>
          
          <footer className="mt-16 text-center text-muted-foreground text-sm">
            <p>Created with ❤️ | Samuel Momoh </p>
          </footer>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering Index component:", error);
    setError(error instanceof Error ? error : new Error("An unknown error occurred"));
    return null;
  }
};

export default Index;
