import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Target, TrendingUp, Award, Globe, MapPin } from 'lucide-react';
import Button from '../common/Button';
import { User } from '../../types';
import { formatNumber } from '../../utils/animations';
import { calculateLifeScore, estimateGlobalStanding } from '../../utils/lifeScoreEngine';

interface ViewProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const ViewProgressModal: React.FC<ViewProgressModalProps> = ({ isOpen, onClose, user }) => {
  // Calculate real rankings using the LifeScore engine
  const scoreBreakdown = calculateLifeScore(user);
  const globalStanding = estimateGlobalStanding(scoreBreakdown.totalLifeScore, user);
  const globalRank = 8000000000 - globalStanding.peopleAhead;
  
  // Calculate country rank based on global percentile
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

  const progressData = [
    {
      title: 'Global Ranking',
      current: globalRank,
      target: Math.floor(globalRank * 0.8),
      icon: Globe,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      unit: 'rank'
    },
    {
      title: `${user.country} Ranking`,
      current: countryRank,
      target: Math.floor(countryRank * 0.7),
      icon: MapPin,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      unit: 'rank'
    },
    {
      title: 'LifeScore',
      current: user.lifeScore || 0,
      target: (user.lifeScore || 0) + 2000,
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      unit: 'XP'
    },
    {
      title: 'Net Worth',
      current: user.wealth?.total || 0,
      target: (user.wealth?.total || 0) + 50000,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      unit: 'USD'
    }
  ];

  const milestones = [
    {
      title: 'Top 1M Globally',
      description: 'Break into the top 1 million worldwide',
      progress: Math.min((8000000 - globalRank) / 7000000 * 100, 100),
      isCompleted: globalRank <= 1000000
    },
    {
      title: 'Wealth Level 5',
      description: 'Reach $250,000 in net worth',
      progress: Math.min(((user.wealth?.total || 0) / 250000) * 100, 100),
      isCompleted: (user.wealth?.total || 0) >= 250000
    },
    {
      title: 'Knowledge Master',
      description: 'Earn 1000+ knowledge points',
      progress: Math.min(((user.knowledge?.total || 0) / 1000) * 100, 100),
      isCompleted: (user.knowledge?.total || 0) >= 1000
    },
    {
      title: 'Asset Collector',
      description: 'Own 5+ different types of assets',
      progress: Math.min(((user.assets?.length || 0) / 5) * 100, 100),
      isCompleted: (user.assets?.length || 0) >= 5
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Progress</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Progress Cards */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Current vs Target</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {progressData.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${item.bgColor} border border-gray-600 rounded-lg p-4`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                        <span className="text-xs text-gray-400">{item.unit}</span>
                      </div>
                      
                      <h4 className="font-medium text-white mb-2">{item.title}</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Current</span>
                          <span className="text-white">
                            {item.unit === 'rank' ? `#${formatNumber(item.current)}` : 
                             item.unit === 'USD' ? `$${formatNumber(item.current)}` :
                             formatNumber(item.current)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Target</span>
                          <span className={item.color}>
                            {item.unit === 'rank' ? `#${formatNumber(item.target)}` : 
                             item.unit === 'USD' ? `$${formatNumber(item.target)}` :
                             formatNumber(item.target)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Milestones</h3>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-900 border border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {milestone.isCompleted ? (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Award className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                              <Target className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-white">{milestone.title}</h4>
                            <p className="text-sm text-gray-400">{milestone.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            milestone.isCompleted ? 'text-green-400' : 'text-blue-400'
                          }`}>
                            {Math.round(milestone.progress)}%
                          </div>
                          <div className="text-xs text-gray-400">
                            {milestone.isCompleted ? 'Complete' : 'Progress'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            milestone.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(milestone.progress, 100)}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {formatNumber(globalStanding.peopleAhead)}
                    </div>
                    <div className="text-sm text-gray-400">People behind you</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {globalStanding.percentile}%
                    </div>
                    <div className="text-sm text-gray-400">Global percentile</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {(user.assets || []).length}
                    </div>
                    <div className="text-sm text-gray-400">Assets owned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {(user.knowledge?.certificates || []).length}
                    </div>
                    <div className="text-sm text-gray-400">Certificates</div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="text-center">
                <Button onClick={onClose} className="px-8">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ViewProgressModal;