import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Award, 
  Star, 
  Lock, 
  CheckCircle, 
  Target,
  TrendingUp,
  Users,
  Calendar,
  Zap
} from 'lucide-react';
import { Badge, User } from '../../types';
import { getRarityColor, getCategoryIcon, getBadgeProgress } from '../../utils/badgeSystem';
import { formatNumber } from '../../utils/animations';
import Button from '../common/Button';

interface BadgeDetailModalProps {
  badge: Badge;
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  user,
  isOpen,
  onClose
}) => {
  const userBadgeIds = user.badges?.map(b => b.id) || [];
  const isUnlocked = userBadgeIds.includes(badge.id);
  const progress = getBadgeProgress(badge, user);
  const rarityColors = getRarityColor(badge.rarity);
  const unlockedBadge = user.badges?.find(b => b.id === badge.id);

  // Mock data for how many people have this badge
  const getBadgeStats = () => {
    const baseUsers = {
      'common': Math.floor(Math.random() * 2000000) + 500000,
      'uncommon': Math.floor(Math.random() * 800000) + 200000,
      'rare': Math.floor(Math.random() * 300000) + 50000,
      'epic': Math.floor(Math.random() * 100000) + 10000,
      'legendary': Math.floor(Math.random() * 10000) + 1000
    };
    
    return baseUsers[badge.rarity] || Math.floor(Math.random() * 50000) + 5000;
  };

  const badgeHolders = getBadgeStats();
  const globalPercentage = ((badgeHolders / 8000000000) * 100).toFixed(3);

  // Get tips for unlocking the badge
  const getUnlockTips = () => {
    switch (badge.id) {
      case 'wealth-apprentice':
        return [
          'Add your salary, savings, and investments',
          'Include all sources of income',
          'Update your financial information regularly'
        ];
      case 'polyglot':
        return [
          'Add all languages you speak fluently',
          'Include programming languages if relevant',
          'Consider learning a new language'
        ];
      case 'asset-collector':
        return [
          'Add different types of assets (home, car, jewelry, etc.)',
          'Include business assets if you own any',
          'Don\'t forget about valuable collectibles'
        ];
      case 'first-friend':
        return [
          'Connect with colleagues and friends',
          'Share your LifeScore to attract connections',
          'Engage with the community'
        ];
      default:
        return [
          'Complete your profile information',
          'Update your data regularly',
          'Engage with the platform features'
        ];
    }
  };

  const unlockTips = getUnlockTips();

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
            className="relative bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className={`relative p-6 bg-gradient-to-r ${rarityColors.bg} rounded-t-2xl border-b border-gray-700`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-6">
                {/* Badge Icon */}
                <div className="relative">
                  <div className={`w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm ${isUnlocked ? '' : 'grayscale'}`}>
                    <span className="text-5xl">{badge.icon}</span>
                  </div>
                  {isUnlocked && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {!isUnlocked && (
                    <div className="absolute -bottom-2 -right-2 bg-gray-600 rounded-full p-2">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Badge Info */}
                <div className="flex-1 text-white">
                  <h2 className="text-3xl font-bold mb-2">{badge.name}</h2>
                  <p className="text-white/80 mb-3 text-lg">{badge.description}</p>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${rarityColors.text} bg-white/20 border border-white/30`}>
                      <Star className="w-4 h-4 mr-1" />
                      {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                    </div>
                    
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/20 border border-white/30">
                      <span className="mr-1">{getCategoryIcon(badge.category)}</span>
                      {badge.category.charAt(0).toUpperCase() + badge.category.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unlock Status */}
                <div className={`p-4 rounded-lg border ${isUnlocked ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-700/50 border-gray-600'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">Status</h3>
                    {isUnlocked ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  {isUnlocked ? (
                    <div>
                      <div className="text-green-400 font-bold text-lg mb-2">Unlocked!</div>
                      {unlockedBadge?.unlockedAt && (
                        <div className="flex items-center text-sm text-gray-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          {unlockedBadge.unlockedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-gray-400 font-bold text-lg mb-2">Locked</div>
                      {progress.percentage > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white">{progress.current}/{progress.total}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${rarityColors.bg.replace('/20', '/60')}`}
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {Math.round(progress.percentage)}% complete
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* XP Reward */}
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">XP Reward</h3>
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-yellow-400 font-bold text-2xl">
                    +{formatNumber(badge.xpReward)} XP
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {isUnlocked ? 'Already earned' : 'Earn when unlocked'}
                  </div>
                </div>
              </div>

              {/* Global Stats */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <Users className="w-5 h-5 text-blue-400 mr-2" />
                  Global Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {formatNumber(badgeHolders)}
                    </div>
                    <div className="text-sm text-gray-400">People have this badge</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {globalPercentage}%
                    </div>
                    <div className="text-sm text-gray-400">Of all users</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-300">
                  {badge.rarity === 'legendary' ? 'Ultra rare achievement!' :
                   badge.rarity === 'epic' ? 'Very rare badge' :
                   badge.rarity === 'rare' ? 'Uncommon achievement' : 
                   badge.rarity === 'uncommon' ? 'Moderately common' : 'Common badge'}
                </div>
              </div>

              {/* Unlock Criteria */}
              <div className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <Target className="w-5 h-5 text-purple-400 mr-2" />
                  How to Unlock
                </h3>
                <p className="text-gray-300 mb-3">{badge.unlockCriteria}</p>
                
                {!isUnlocked && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Tips:</h4>
                    <ul className="space-y-1">
                      {unlockTips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start">
                          <span className="text-purple-400 mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Related Badges */}
              {badge.category && (
                <div className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                  <h3 className="font-semibold text-white mb-3 flex items-center">
                    <Award className="w-5 h-5 text-orange-400 mr-2" />
                    Related Badges
                  </h3>
                  <div className="text-sm text-gray-300">
                    Explore more {badge.category} badges to boost your score in this category.
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="text-center">
                <Button
                  onClick={onClose}
                  className="px-8"
                >
                  {isUnlocked ? 'Awesome!' : 'Got it!'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BadgeDetailModal;