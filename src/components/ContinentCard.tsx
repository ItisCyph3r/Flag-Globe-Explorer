
import { Button } from '@/components/ui/button';
import { Continent } from '@/lib/types';
import { loadStats } from '@/lib/storage-service';
import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface ContinentCardProps {
  continent: Continent;
  onSelect: (continent: Continent) => void;
}

const continentImages: Record<Continent, string> = {
  'Africa': 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Asia': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Europe': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'North America': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'South America': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'Oceania': 'https://images.unsplash.com/photo-1589330273594-fade1ee91647?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
};

const ContinentCard = ({ continent, onSelect }: ContinentCardProps) => {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    correctAnswers: 0,
    highScore: 0,
  });

  useEffect(() => {
    const userStats = loadStats();
    const continentStats = userStats.continents[continent];
    
    if (continentStats) {
      setStats({
        totalAttempts: continentStats.totalAttempts,
        correctAnswers: continentStats.correctAnswers,
        highScore: continentStats.highScore,
      });
    }
  }, [continent]);

  const accuracy = stats.totalAttempts > 0 
    ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) 
    : 0;

  return (
    <div 
      className="flag-card group cursor-pointer hover:scale-105 transition-transform"
      onClick={() => onSelect(continent)}
    >
      <div className="relative h-40 overflow-hidden rounded-t-xl">
        <img 
          src={continentImages[continent]} 
          alt={continent}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <h3 className="absolute bottom-3 left-4 text-white text-xl font-bold">{continent}</h3>
      </div>
      
      <div className="p-4">
        {stats.totalAttempts > 0 ? (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Accuracy</span>
              <span className="text-sm font-medium">{accuracy}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">High Score</span>
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-app-amber" />
                <span className="text-sm font-medium">{stats.highScore}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Start your first quiz!</p>
        )}
        
        <Button 
          className="w-full mt-3 bg-app-indigo hover:bg-app-indigo/90 text-white"
        >
          Start Quiz
        </Button>
      </div>
    </div>
  );
};

export default ContinentCard;
