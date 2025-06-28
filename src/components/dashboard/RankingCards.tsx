import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, Building, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { User } from '../../types';
import { formatNumber } from '../../utils/animations';
import { calculateLifeScore, estimateGlobalStanding } from '../../utils/lifeScoreEngine';
import Card from '../common/Card';

interface RankingCardsProps {
  user: User;
}

const RankingCards: React.FC<RankingCardsProps> = ({ user }) => {
  // Calculate real rankings using the LifeScore engine
  const scoreBreakdown = calculateLifeScore(user);
  const globalStanding = estimateGlobalStanding(scoreBreakdown.totalLifeScore, user);
  const globalRank = 8000000000 - globalStanding.peopleAhead;
  
  // For country rank, we'll use a simplified calculation based on global percentile
  const countryPopulations: Record<string, number> = {
    'United States': 331000000,
    'China': 1440000000,
    'India': 1380000000,
    'Brazil': 215000000,
    'United Kingdom': 67000000,
    'Germany': 83000000,
    'France': 68000000,
    'Canada': 38000000,
    'Australia': 26000000,
    'Singapore': 6000000,
    'Spain': 47000000,
    'Italy': 60000000,
    'Japan': 125000000,
    'South Korea': 52000000,
    'Georgia': 4000000
  };
  
  const countryPopulation = countryPopulations[user.country] || 50000000;
  const countryRank = Math.floor(countryPopulation * (1 - globalStanding.percentile / 100));
  
  // City rank is estimated as a fraction of country rank
  const cityRank = Math.floor(countryRank * 0.1); // Assume city is ~10% of country population

  const rankings = [
    {
      title: 'Global Rank',
      rank: globalRank,
      total: '8B',
      icon: Globe,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      change: Math.floor(Math.random() * 20) - 10, // Random change for demo
      changeType: 'up' as const
    },
    {
      title: `${user.country}`,
      rank: countryRank,
      total: formatNumber(countryPopulation),
      icon: MapPin,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      change: Math.floor(Math.random() * 15) - 7,
      changeType: 'up' as const
    },
    {
      title: user.city,
      rank: cityRank,
      total: formatNumber(Math.floor(countryPopulation * 0.1)),
      icon: Building,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      change: Math.floor(Math.random() * 10) - 5,
      changeType: Math.random() > 0.5 ? 'up' as const : 'down' as const
    },
    {
      title: 'Friends',
      rank: Math.min((user.friends?.length || 0) + 1, 12), // User's position among friends
      total: Math.max((user.friends?.length || 0) + 1, 12).toString(),
      icon: Users,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      change: Math.floor(Math.random() * 3) - 1,
      changeType: 'up' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {rankings.map((ranking, index) => (
        <motion.div
          key={ranking.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6 hover:shadow-xl">
            <div className={`w-12 h-12 ${ranking.bgColor} rounded-lg flex items-center justify-center mb-4`}>
              <ranking.icon className={`w-6 h-6 ${ranking.color}`} />
            </div>
            
            <h3 className="text-sm font-medium text-gray-300 mb-1">
              {ranking.title} Rank
            </h3>
            
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-white">
                #{formatNumber(ranking.rank)}
              </span>
              <span className="text-xs text-gray-400">
                / {ranking.total}
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              {ranking.changeType === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
              )}
              <span className={ranking.changeType === 'up' ? 'text-green-400' : 'text-red-400'}>
                {Math.abs(ranking.change)} {ranking.changeType} today
              </span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default RankingCards;