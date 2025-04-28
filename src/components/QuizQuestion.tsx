import { useQuiz } from '@/contexts/QuizContext';
import { Country } from '@/lib/types';
import { useState } from 'react';
import { Button } from './ui/button';
import FlagCard from './FlagCard';
import { Loader2 } from 'lucide-react';

const QuizQuestion = () => {
  const { state, submitAnswer, nextQuestion } = useQuiz();
  const [selectedAnswer, setSelectedAnswer] = useState<Country | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  
  // Get current question
  const question = state.currentQuestion;
  
  if (!question) return null;
  
  const handleFlagClick = (country: Country) => {
    if (state.status !== 'active' || selectedAnswer) return;
    
    setSelectedAnswer(country);
    submitAnswer(country);
    setShowAnswer(true);
  };
  
  const handleNextQuestion = async () => {
    try {
      setLoadingNext(true);
      setSelectedAnswer(null);
      setShowAnswer(false);
      
      await nextQuestion();
    } catch (error) {
      console.error("Error loading next question:", error);
    } finally {
      setLoadingNext(false);
    }
  };
  
  const isCorrectAnswer = selectedAnswer?.code === question.targetCountry.code;
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">
          Find the flag of:
        </h2>
        <p className="text-3xl font-extrabold text-app-indigo">
          {question.targetCountry.name}
        </p>
        
        <div className="mt-2 flex justify-center items-center gap-2">
          <div className="px-3 py-1 bg-muted rounded-full text-sm">
            Question {state.questionsAsked + 1}
          </div>
          <div className="px-3 py-1 bg-app-indigo/10 text-app-indigo rounded-full text-sm font-medium">
            Score: {state.score}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {question.options.map((country) => (
          <FlagCard
            key={country.code}
            country={country}
            onClick={() => handleFlagClick(country)}
            selected={selectedAnswer?.code === country.code}
            correct={
              showAnswer 
                ? country.code === question.targetCountry.code 
                : undefined
            }
            showName={showAnswer}
            disabled={showAnswer || loadingNext}
          />
        ))}
      </div>
      
      {showAnswer && (
        <div className="mt-8 text-center animate-scale-in">
          <div className={`mb-4 text-xl font-bold ${isCorrectAnswer ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrectAnswer ? 'Correct!' : 'Incorrect!'}
          </div>
          
          <Button 
            onClick={handleNextQuestion}
            className="bg-app-indigo hover:bg-app-indigo/90 text-white"
            size="lg"
            disabled={loadingNext}
          >
            {loadingNext ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Next Question'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;
