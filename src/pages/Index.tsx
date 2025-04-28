import { useState, useEffect } from 'react';
import { Continent } from '@/lib/types';
import { continents } from '@/lib/country-data';
import { QuizProvider, useQuiz } from '@/contexts/QuizContext';
import ContinentCard from '@/components/ContinentCard';
import QuizQuestion from '@/components/QuizQuestion';
import QuizResults from '@/components/QuizResults';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loader2 } from "lucide-react";
import InstallPWA from "@/components/InstallPWA";
import "../styles/bubbly-background.css";

// Main Quiz component that changes based on quiz state
const Quiz = () => {
  const { state, resetQuiz, endQuiz, startQuiz, countriesLoaded } = useQuiz();
  
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
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Select a continent to begin</h2>
        <p className="text-gray-600 mb-8">Test your knowledge of country flags around the world</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {continents.map((continent) => (
            <ContinentCard 
              key={continent} 
              continent={continent} 
              onSelect={async (continent) => {
                try {
                  console.log("Starting quiz for continent:", continent);
                  resetQuiz();
                  await startQuiz(continent);
                } catch (error) {
                  console.error("Error starting quiz:", error);
                }
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  
  if (state.status === 'active' || state.status === 'feedback') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{state.continent} Quiz</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to end this quiz?')) {
                endQuiz();
              }
            }}
          >
            End Quiz
          </Button>
        </div>
        
        <QuizQuestion />
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
            <p className="text-muted-foreground">Learn flags from arouncscsd the world</p>
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
