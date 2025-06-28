import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Globe, MapPin, Users, Star, ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import { triggerConfetti, formatNumber } from '../../utils/animations';
import { getGlobalRank, getCountryRank } from '../../utils/mockData';
import { useNavigate } from 'react-router-dom';

interface ResultsStepProps {
  data: any;
  onNext: (data: any) => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ data, onNext }) => {
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const calculateLifeScore = () => {
    const wealthScore = (data.wealth?.total || 0) / 10;
    const knowledgeScore = data.knowledge?.total || 0;
    const assetScore = (data.assets || []).reduce((sum: number, asset: any) => sum + asset.value, 0) / 50;
    
    return Math.round(wealthScore + knowledgeScore + assetScore);
  };

  const lifeScore = calculateLifeScore();
  const globalRank = getGlobalRank(lifeScore);
  const countryRank = getCountryRank(lifeScore, data.country);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResults(true);
      triggerConfetti();
      
      // Create complete user data with LifeScore but no badges
      // Badges will be determined by the useAuth hook
      const completeUserData = {
        ...data,
        lifeScore
      };
      
      // Pass the complete data to parent
      onNext(completeUserData);
    }, 1000);

    return () => clearTimeout(timer);
  }, [data, lifeScore, onNext]);

  const handleComplete = () => {
    // Set the completion flag BEFORE navigating
    localStorage.setItem('lifescore_onboarding_complete', 'true');
    
    console.log("Onboarding complete, navigating to dashboard");
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  if (!showResults) {
    return (
      <div className="text-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-8"
        />
        <h2 className="text-2xl font-bold text-white mb-4">
          Calculating your LifeScore...
        </h2>
        <p className="text-gray-300">
          Analyzing your data against global statistics
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      {/* LifeScore Display */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mb-8"
      >
        <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{formatNumber(lifeScore)}</div>
            <div className="text-xs text-blue-200">XP</div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          🎉 Your LifeScore is {formatNumber(lifeScore)}!
        </h1>
        <p className="text-xl text-gray-300">
          Welcome to the global ranking system, {data.name}!
        </p>
      </motion.div>

      {/* Rankings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <Globe className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
          <h3 className="font-semibold text-white mb-2">Global Rank</h3>
          <p className="text-2xl font-bold text-blue-400">#{formatNumber(globalRank)}</p>
          <p className="text-gray-400 text-sm">out of 8B people</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <MapPin className="w-8 h-8 text-green-400 mb-3 mx-auto" />
          <h3 className="font-semibold text-white mb-2">{data.country} Rank</h3>
          <p className="text-2xl font-bold text-green-400">#{formatNumber(countryRank)}</p>
          <p className="text-gray-400 text-sm">in your country</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <Users className="w-8 h-8 text-purple-400 mb-3 mx-auto" />
          <h3 className="font-semibold text-white mb-2">City Rank</h3>
          <p className="text-2xl font-bold text-purple-400">#247</p>
          <p className="text-gray-400 text-sm">in {data.city}</p>
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6 mb-8"
      >
        <Star className="w-8 h-8 text-yellow-400 mb-4 mx-auto" />
        <h3 className="text-xl font-bold text-white mb-4">Your Achievement Highlights</h3>
        <div className="space-y-2 text-gray-300">
          <p>🌍 You're ahead of {formatNumber(8000000000 - globalRank)} people globally</p>
          <p>💰 Your wealth ranking puts you in the top {Math.round((1 - globalRank / 8000000000) * 100)}%</p>
          <p>🧠 You outperform the average {data.country} citizen in knowledge</p>
          <p>🏆 You've unlocked your first achievement badges!</p>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button onClick={handleComplete} size="lg" icon={ArrowRight}>
          Enter Your Dashboard
        </Button>
        <p className="text-gray-400 text-sm mt-4">
          Start competing, earning badges, and climbing the leaderboards!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ResultsStep;