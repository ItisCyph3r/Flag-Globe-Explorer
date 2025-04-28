import { useQuiz } from '@/contexts/QuizContext';
import { Button } from './ui/button';

const QuizResults = () => {
  const { state, resetQuiz } = useQuiz();
  
  if (state.status !== 'completed') return null;
  
  const totalQuestions = state.questionsAsked;
  const correctAnswers = state.score;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  return (
    <div className="max-w-md mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">Quiz Results</h2>
        
        <div className="bg-card rounded-lg shadow-lg p-6 border">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Score</span>
              <span className="font-bold text-2xl text-foreground">{state.score}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Questions</span>
              <span className="text-foreground">{totalQuestions}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="text-foreground">{accuracy}%</span>
            </div>
          </div>
          
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-app-indigo"
              style={{ width: `${accuracy}%` }}
            ></div>
          </div>
          
          <div className="mt-6">
            {accuracy >= 80 ? (
              <p className="text-green-600 font-medium">Great job! Your flag knowledge is impressive!</p>
            ) : accuracy >= 50 ? (
              <p className="text-app-amber font-medium">Good effort! Keep practicing to improve.</p>
            ) : (
              <p className="text-app-rose font-medium">Keep learning! Practice makes perfect.</p>
            )}
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <Button 
            onClick={resetQuiz}
            className="w-full bg-app-indigo hover:bg-app-indigo/90"
            size="lg"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
