import { useState, useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const SpellingQuizQuestion = () => {
  const { state, submitAnswer, nextQuestion } = useQuiz();
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [hintLetters, setHintLetters] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (state.currentQuestion) {
      const countryName = state.currentQuestion.targetCountry.name.toUpperCase();
      const allLetters = [
        ...countryName.split('').filter(char => char !== ' '),
        ...Array(3).fill(0).map(() => 
          String.fromCharCode(65 + Math.floor(Math.random() * 26))
        )
      ];
      const shuffled = allLetters.sort(() => Math.random() - 0.5);
      setAvailableLetters(shuffled);
      setSelectedLetters([]);
      setCurrentGuess('');
      setHintsUsed(0);
      setHintLetters([]);
      setShowAnswer(false);
    }
  }, [state.currentQuestion]);

  const handleLetterClick = (letter: string) => {
    if (selectedLetters.includes(letter)) {
      const newSelected = selectedLetters.filter(l => l !== letter);
      setSelectedLetters(newSelected);
      setCurrentGuess(newSelected.join(''));
      setShowAnswer(false);
    } else {
      const newSelected = [...selectedLetters, letter];
      setSelectedLetters(newSelected);
      setCurrentGuess(newSelected.join(''));
      
      // Check if all positions are filled
      const countryName = state.currentQuestion?.targetCountry.name.toUpperCase() || '';
      if (newSelected.length === countryName.replace(/\s/g, '').length) {
        setShowAnswer(true);
      }
    }
  };

  const handleHint = () => {
    if (!state.currentQuestion || hintsUsed >= 3) return;

    const countryName = state.currentQuestion.targetCountry.name.toUpperCase();
    const remainingLetters = countryName.split('').filter(
      (letter, index) => !hintLetters.includes(letter) && !selectedLetters.includes(letter)
    );

    if (remainingLetters.length > 0) {
      const randomLetter = remainingLetters[Math.floor(Math.random() * remainingLetters.length)];
      setHintLetters([...hintLetters, randomLetter]);
      setHintsUsed(hintsUsed + 1);
      
      const newSelected = [...selectedLetters, randomLetter];
      setSelectedLetters(newSelected);
      setCurrentGuess(newSelected.join(''));
      
      // Check if all positions are filled after hint
      if (newSelected.length === countryName.replace(/\s/g, '').length) {
        setShowAnswer(true);
      }
      
      toast({
        title: "Hint",
        description: `The letter "${randomLetter}" has been added!`,
        variant: "default",
      });
    }
  };

  const handleNextQuestion = () => {
    if (showAnswer) {
      const isCorrect = currentGuess === state.currentQuestion?.targetCountry.name.toUpperCase();
      if (isCorrect) {
        submitAnswer(state.currentQuestion.targetCountry);
      }
      nextQuestion();
    }
  };

  if (!state.currentQuestion) return null;

  const countryName = state.currentQuestion.targetCountry.name.toUpperCase();
  const letterCount = countryName.replace(/\s/g, '').length;

  const displayLetters = Array(letterCount).fill('_');
  
  hintLetters.forEach(hintLetter => {
    const positions = [];
    let pos = countryName.indexOf(hintLetter);
    while (pos !== -1) {
      positions.push(pos);
      pos = countryName.indexOf(hintLetter, pos + 1);
    }
    positions.forEach(pos => {
      if (pos < displayLetters.length) {
        displayLetters[pos] = hintLetter;
      }
    });
  });

  selectedLetters.forEach(letter => {
    const positions = [];
    let pos = countryName.indexOf(letter);
    while (pos !== -1) {
      positions.push(pos);
      pos = countryName.indexOf(letter, pos + 1);
    }
    positions.forEach(pos => {
      if (pos < displayLetters.length) {
        displayLetters[pos] = letter;
      }
    });
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-64 h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
        <img 
          src={state.currentQuestion.targetCountry.flagUrl} 
          alt="Country flag" 
          className="max-w-full max-h-full object-contain p-1"
        />
      </div>

      <div className="text-2xl font-mono tracking-wider flex gap-2">
        {displayLetters.map((letter, index) => {
          const isCorrect = showAnswer && letter === countryName[index];
          return (
            <span 
              key={index} 
              className={`
                ${hintLetters.includes(letter) ? "text-primary" : ""}
                ${isCorrect ? "text-green-500" : ""}
              `}
            >
              {letter}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleHint}
          disabled={hintsUsed >= 3}
          className="flex items-center gap-1"
        >
          <HelpCircle className="h-4 w-4" />
          Hint ({3 - hintsUsed} left)
        </Button>
      </div>

      <div className="grid grid-cols-8 gap-2 max-w-lg">
        {availableLetters.map((letter, index) => (
          <Button
            key={index}
            variant={
              hintLetters.includes(letter) 
                ? "secondary" 
                : selectedLetters.includes(letter) 
                  ? "default" 
                  : "outline"
            }
            size="sm"
            onClick={() => handleLetterClick(letter)}
            className="w-10 h-10"
            disabled={hintLetters.includes(letter)}
          >
            {letter}
          </Button>
        ))}
      </div>

      {showAnswer && (
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedLetters([]);
              setCurrentGuess('');
              setShowAnswer(false);
            }}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            onClick={handleNextQuestion}
            className="flex items-center gap-1"
          >
            Next Question
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SpellingQuizQuestion; 