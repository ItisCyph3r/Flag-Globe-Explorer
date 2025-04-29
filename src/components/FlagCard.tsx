import { Country } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FlagCardProps {
  country: Country;
  onClick?: () => void;
  selected?: boolean;
  correct?: boolean;
  showName?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FlagCard = ({
  country,
  onClick,
  selected = false,
  correct,
  showName = false,
  disabled = false,
  size = 'md',
}: FlagCardProps) => {
  // Determine styles based on state
  const isCorrectAnswer = correct === true;
  const isIncorrectAnswer = selected && correct === false;
  
  const sizeClasses = {
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-40',
  };

  return (
    <div 
      className={cn(
        "flag-card overflow-hidden",
        "transition-all duration-300 transform",
        onClick && !disabled && "cursor-pointer hover:translate-y-[-4px]",
        selected && "ring-2 ring-offset-2",
        isCorrectAnswer && "ring-green-700 bg-green-200 ring-4",
        isIncorrectAnswer && "ring-red-700 bg-red-200",
        disabled && "opacity-70 pointer-events-none",
        sizeClasses[size]
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center  border border-gray- shadow-sm">
        <div className="w-full h-full flex items-center justify-center p-2">
          <img 
            src={country.flagUrl} 
            alt={`Flag of ${country.name}`}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            loading="lazy"
          />
        </div>
        
        {showName && (
          <div className="absolute bottom-0 w-full bg-black/50 p-2 text-center">
            <p className="text-white text-sm font-medium">{country.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlagCard;
