import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Star, Target, TrendingUp, Users, Sparkles, Crown, Zap, Filter, Search, Trophy, Eye, Check, X } from 'lucide-react';
import { User } from '../../types';
import { ALL_BADGES, getRarityColor, getCategoryIcon, getBadgeProgress } from '../../utils/badgeSystem';
import { formatNumber, triggerBadgeConfetti } from '../../utils/animations';
import Card from '../common/Card';
import Button from '../common/Button';
import BadgeDetailModal from './BadgeDetailModal';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface BadgesProps {
  user: User;
}

const Badges: React.FC<BadgesProps> = ({ user }) => {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('progress');
  const [showAvatarBadgeSelector, setShowAvatarBadgeSelector] = useState(false);

  const tabs = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'wealth', label: 'Wealth', icon: Award },
    { id: 'knowledge', label: 'Knowledge', icon: Star },
    { id: 'assets', label: 'Assets', icon: Crown },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'legendary', label: 'Legendary', icon: Zap },
  ];

  const sortOptions = [
    { id: 'progress', label: 'Progress' },
    { id: 'rarity', label: 'Rarity' },
    { id: 'xp', label: 'XP Reward' },
    { id: 'name', label: 'Name' }
  ];

  // Get user's unlocked badge IDs
  const userBadgeIds = user.badges?.map(b => b.id) || [];

  // Filter badges
  const filteredBadges = ALL_BADGES.filter(badge => {
    // Category filter
    if (activeTab !== 'all' && badge.category !== activeTab) return false;
    
    // Search filter
    if (searchTerm && !badge.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !badge.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Hide hidden badges unless unlocked
    if (badge.isHidden && !userBadgeIds.includes(badge.id)) return false;
    
    return true;
  });

  // Sort badges
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    const aUnlocked = userBadgeIds.includes(a.id);
    const bUnlocked = userBadgeIds.includes(b.id);
    
    // Always show unlocked badges first
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    
    switch (sortBy) {
      case 'progress':
        if (!aUnlocked && !bUnlocked) {
          const aProgress = getBadgeProgress(a, user).percentage;
          const bProgress = getBadgeProgress(b, user).percentage;
          return bProgress - aProgress;
        }
        return 0;
      
      case 'rarity':
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      
      case 'xp':
        return b.xpReward - a.xpReward;
      
      case 'name':
        return a.name.localeCompare(b.name);
      
      default:
        return 0;
    }
  });

  const earnedBadges = filteredBadges.filter(badge => userBadgeIds.includes(badge.id));
  const lockedBadges = filteredBadges.filter(badge => !userBadgeIds.includes(badge.id));
  const inProgressBadges = lockedBadges.filter(b => getBadgeProgress(b, user).percentage > 0);

  // Calculate stats
  const totalXPFromBadges = user.badges?.reduce((sum, badge) => sum + badge.xpReward, 0) || 0;
  const completionPercentage = Math.round((earnedBadges.length / filteredBadges.length) * 100);

  // Get vibrant colors for each badge
  const getVibrantBadgeColors = (badge: any, index: number) => {
    const colorSchemes = [
      { bg: 'from-yellow-400/20 via-orange-400/15 to-amber-500/20', border: 'border-yellow-400/40', shadow: 'shadow-yellow-400/20', accent: 'text-yellow-400' },
      { bg: 'from-blue-400/20 via-cyan-400/15 to-sky-500/20', border: 'border-blue-400/40', shadow: 'shadow-blue-400/20', accent: 'text-blue-400' },
      { bg: 'from-purple-400/20 via-pink-400/15 to-fuchsia-500/20', border: 'border-purple-400/40', shadow: 'shadow-purple-400/20', accent: 'text-purple-400' },
      { bg: 'from-green-400/20 via-emerald-400/15 to-teal-500/20', border: 'border-green-400/40', shadow: 'shadow-green-400/20', accent: 'text-green-400' },
      { bg: 'from-orange-400/20 via-red-400/15 to-rose-500/20', border: 'border-orange-400/40', shadow: 'shadow-orange-400/20', accent: 'text-orange-400' },
    ];
    
    const colorIndex = badge.id.charCodeAt(0) % colorSchemes.length;
    return colorSchemes[colorIndex];
  };

  const getBadgeCardStyling = (badge: any, index: number) => {
    const colors = getVibrantBadgeColors(badge, index);
    const isUnlocked = userBadgeIds.includes(badge.id);
    
    if (isUnlocked) {
      return `bg-gradient-to-br ${colors.bg} border-2 ${colors.border} ${colors.shadow} shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer transition-all duration-300`;
    }
    return 'bg-gray-800/50 border border-gray-600 opacity-60 grayscale hover:grayscale-0 hover:opacity-80 transition-all cursor-pointer';
  };

  const handleBadgeClick = (badge: any) => {
    setSelectedBadge(badge);
    
    // Trigger confetti if it's unlocked
    if (userBadgeIds.includes(badge.id)) {
      triggerBadgeConfetti(badge.category);
    }
  };

  const handleSetAvatarBadge = (badge: any) => {
    if (!userBadgeIds.includes(badge.id)) {
      toast.error('You must unlock this badge first!');
      return;
    }

    updateUser({ avatarBadge: badge });
    setShowAvatarBadgeSelector(false);
    toast.success(`${badge.name} badge set as avatar badge! 🎖️`);
  };

  const handleRemoveAvatarBadge = () => {
    updateUser({ avatarBadge: null });
    setShowAvatarBadgeSelector(false);
    toast.success('Avatar badge removed');
  };

  const unlockedBadgesForAvatar = user.badges?.filter(b => b.id) || [];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            🏆 Achievement Badges
          </h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base">
            {earnedBadges.length} of {filteredBadges.length} badges earned • 
            <span className="text-yellow-400 font-semibold ml-2">
              {formatNumber(totalXPFromBadges)} XP earned
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowAvatarBadgeSelector(true)}
            className="text-xs md:text-sm"
          >
            <Award className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Avatar Badge</span>
            <span className="sm:hidden">Badge</span>
          </Button>
          <div className="text-right">
            <div className="text-xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              {formatNumber(totalXPFromBadges)} XP
            </div>
            <div className="text-xs text-gray-400">from badges</div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Stats Overview - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card className="p-3 md:p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-400/30">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <div className="text-lg md:text-2xl font-bold text-green-400">{earnedBadges.length}</div>
              <div className="text-xs md:text-sm text-gray-400">Earned</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 md:p-4 bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-400/30">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <div className="text-lg md:text-2xl font-bold text-gray-400">{lockedBadges.length}</div>
              <div className="text-xs md:text-sm text-gray-400">Locked</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 md:p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-400/30">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <div className="text-lg md:text-2xl font-bold text-blue-400">{inProgressBadges.length}</div>
              <div className="text-xs md:text-sm text-gray-400">In Progress</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 md:p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/30">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <div className="text-lg md:text-2xl font-bold text-purple-400">{completionPercentage}%</div>
              <div className="text-xs md:text-sm text-gray-400">Complete</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile-Optimized Controls */}
      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Search badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 md:pl-10 pr-4 py-2 md:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile-Optimized Tabs - Horizontal Scroll */}
      <div className="w-full overflow-x-auto">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-md whitespace-nowrap transition-colors text-sm md:text-base ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compact Badge Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {sortedBadges.map((badge, index) => {
          const isUnlocked = userBadgeIds.includes(badge.id);
          const progress = getBadgeProgress(badge, user);
          const colors = getVibrantBadgeColors(badge, index);
          const rarityColors = getRarityColor(badge.rarity);
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card 
                className={`${getBadgeCardStyling(badge, index)} p-3 md:p-4`}
                onClick={() => handleBadgeClick(badge)}
              >
                <div className="text-center">
                  {/* Badge Icon */}
                  <div className={`text-3xl md:text-4xl mb-2 ${isUnlocked ? '' : 'grayscale'} transform hover:scale-110 transition-transform`}>
                    {badge.icon}
                  </div>
                  
                  {/* Badge Name */}
                  <h3 className="font-bold text-white text-sm md:text-base mb-1 line-clamp-2">{badge.name}</h3>
                  
                  {/* Rarity Badge */}
                  <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border mb-2 ${
                    isUnlocked 
                      ? `${rarityColors.text} ${rarityColors.bg} ${rarityColors.border}`
                      : 'bg-gray-700 text-gray-300 border-gray-600'
                  }`}>
                    <Star className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                    <span className="hidden md:inline">{badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}</span>
                    <span className="md:hidden">{badge.rarity.charAt(0).toUpperCase()}</span>
                  </div>

                  {/* Category */}
                  <div className="mb-2">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                      isUnlocked ? colors.accent : 'text-gray-400'
                    } bg-white/10`}>
                      <span className="mr-1">{getCategoryIcon(badge.category)}</span>
                      <span className="hidden md:inline">{badge.category.charAt(0).toUpperCase() + badge.category.slice(1)}</span>
                    </div>
                  </div>

                  {/* Badge Status */}
                  {isUnlocked ? (
                    <div className="text-center">
                      <div className="text-green-400 font-bold text-sm mb-1 flex items-center justify-center">
                        <Award className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span className="hidden md:inline">Unlocked!</span>
                        <span className="md:hidden">✓</span>
                      </div>
                      <div className={`font-bold text-sm ${colors.accent}`}>
                        +{formatNumber(badge.xpReward)} XP
                      </div>
                    </div>
                  ) : progress.percentage > 0 ? (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-semibold">{progress.current}/{progress.total}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all bg-gradient-to-r ${colors.bg.replace('/20', '/60')}`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold text-xs">
                          +{formatNumber(badge.xpReward)} XP
                        </div>
                        <div className="text-xs text-gray-400">
                          {Math.round(progress.percentage)}% done
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-1 flex items-center justify-center">
                        <Lock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span className="hidden md:inline">Locked</span>
                        <span className="md:hidden">🔒</span>
                      </div>
                      <div className="text-yellow-400 font-bold text-xs">
                        +{formatNumber(badge.xpReward)} XP
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      className="text-xs w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBadgeClick(badge);
                      }}
                    >
                      <span className="hidden md:inline">Details</span>
                      <span className="md:hidden">👁️</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Rarity Distribution */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80">
        <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Badge Rarity Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {['common', 'uncommon', 'rare', 'epic', 'legendary'].map((rarity) => {
            const rarityBadges = filteredBadges.filter(b => b.rarity === rarity);
            const earnedRarity = rarityBadges.filter(b => userBadgeIds.includes(b.id));
            const colors = getRarityColor(rarity);
            
            return (
              <div key={rarity} className={`p-3 md:p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
                <div className={`text-sm md:text-lg font-bold ${colors.text} capitalize`}>
                  {rarity}
                </div>
                <div className="text-white font-semibold text-sm md:text-base">{earnedRarity.length}/{rarityBadges.length}</div>
                <div className="text-xs text-gray-400">
                  {rarityBadges.length > 0 ? Math.round((earnedRarity.length/rarityBadges.length) * 100) : 0}% complete
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Avatar Badge Selector Modal */}
      {showAvatarBadgeSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAvatarBadgeSelector(false)}
          />

          {/* Modal */}
          <div className="relative bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700">
              <h2 className="text-xl md:text-2xl font-bold text-white">Choose Avatar Badge</h2>
              <button
                onClick={() => setShowAvatarBadgeSelector(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
              {/* Current Badge */}
              {user.avatarBadge && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Current Avatar Badge</h3>
                  <div className="flex items-center justify-between bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{user.avatarBadge.icon}</span>
                      <div>
                        <div className="font-semibold text-white">{user.avatarBadge.name}</div>
                        <div className="text-sm text-gray-400">{user.avatarBadge.description}</div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRemoveAvatarBadge}
                      icon={X}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {/* Available Badges */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Available Badges ({unlockedBadgesForAvatar.length})
                </h3>
                
                {unlockedBadgesForAvatar.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {unlockedBadgesForAvatar.map((badge) => {
                      const fullBadge = ALL_BADGES.find(b => b.id === badge.id);
                      if (!fullBadge) return null;
                      
                      const isCurrentBadge = user.avatarBadge?.id === badge.id;
                      
                      return (
                        <div
                          key={badge.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            isCurrentBadge 
                              ? 'border-blue-500 bg-blue-500/20' 
                              : 'border-gray-600 bg-gray-900 hover:border-gray-500'
                          }`}
                          onClick={() => handleSetAvatarBadge(fullBadge)}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{fullBadge.icon}</span>
                            <div className="flex-1">
                              <div className="font-semibold text-white">{fullBadge.name}</div>
                              <div className="text-sm text-gray-400">{fullBadge.description}</div>
                            </div>
                            {isCurrentBadge ? (
                              <Check className="w-5 h-5 text-blue-400" />
                            ) : (
                              <div className="w-5 h-5 border border-gray-600 rounded" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No badges unlocked yet</p>
                    <p className="text-sm">Unlock badges to display them on your avatar!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          user={user}
          isOpen={!!selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};

export default Badges;