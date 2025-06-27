import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Globe, Zap } from 'lucide-react';
import { User } from '../../types';
import { formatNumber } from '../../utils/animations';
import { getGlobalRank } from '../../utils/mockData';
import Card from '../common/Card';

interface FactPanelProps {
  user: User;
}

const FactPanel: React.FC<FactPanelProps> = ({ user }) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  const globalRank = getGlobalRank(user.lifeScore);
  const peopleAhead = 8000000000 - globalRank;

  const facts = [
    {
      icon: Globe,
      title: "Global Standing",
      content: `You are ahead of ${formatNumber(peopleAhead)} people globally`,
      color: "text-blue-400"
    },
    {
      icon: Zap,
      title: "Country Comparison",
      content: `You outrank the entire population of 47 countries`,
      color: "text-green-400"
    },
    {
      icon: Globe,
      title: "Wealth Percentile",
      content: `Your wealth puts you in the top ${Math.round((1 - globalRank / 8000000000) * 100)}% worldwide`,
      color: "text-purple-400"
    },
    {
      icon: Zap,
      title: "Knowledge Edge",
      content: `Your education level exceeds 73% of your country's population`,
      color: "text-yellow-400"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [facts.length]);

  const currentFact = facts[currentFactIndex];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Dynamic Facts</h2>
        <button
          onClick={() => setCurrentFactIndex((prev) => (prev + 1) % facts.length)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <motion.div
        key={currentFactIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className={`w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4`}>
          <currentFact.icon className={`w-8 h-8 ${currentFact.color}`} />
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-3">
          {currentFact.title}
        </h3>
        
        <p className="text-gray-300 leading-relaxed">
          {currentFact.content}
        </p>
      </motion.div>

      {/* Progress Dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {facts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentFactIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentFactIndex ? 'bg-blue-400' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Additional Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">{user.lifeScore}</p>
          <p className="text-xs text-gray-400">Total XP</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">
            #{formatNumber(globalRank)}
          </p>
          <p className="text-xs text-gray-400">Global Rank</p>
        </div>
      </div>
    </Card>
  );
};

export default FactPanel;