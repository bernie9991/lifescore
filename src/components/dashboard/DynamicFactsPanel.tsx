import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  RefreshCw, 
  Share2, 
  TrendingUp, 
  Users, 
  GraduationCap, 
  DollarSign,
  MapPin,
  Crown,
  Star,
  ChevronLeft,
  ChevronRight,
  Flag,
  Calculator,
  Award
} from 'lucide-react';
import { User } from '../../types';
import { formatNumber, formatCurrency, triggerConfetti } from '../../utils/animations';
import { 
  calculateLifeScore, 
  estimateGlobalStanding, 
  getCachedGlobalStanding, 
  setCachedGlobalStanding,
  getScoreLevel,
  type LifeScoreBreakdown,
  type GlobalStanding
} from '../../utils/lifeScoreEngine';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface DynamicFactsPanelProps {
  user: User;
}

interface GlobalFact {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  content: string;
  subtext?: string;
  color: string;
  bgGradient: string;
  emoji: string;
  category: 'global' | 'education' | 'wealth' | 'countries' | 'percentile' | 'breakdown';
}

const DynamicFactsPanel: React.FC<DynamicFactsPanelProps> = ({ user }) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<LifeScoreBreakdown | null>(null);
  const [globalStanding, setGlobalStanding] = useState<GlobalStanding | null>(null);

  // Calculate LifeScore and global standing
  useEffect(() => {
    const breakdown = calculateLifeScore(user);
    setScoreBreakdown(breakdown);

    // Try to get cached standing first
    const cached = getCachedGlobalStanding(user.id, breakdown.totalLifeScore);
    if (cached) {
      setGlobalStanding(cached);
    } else {
      // Calculate new standing and cache it
      const standing = estimateGlobalStanding(breakdown.totalLifeScore, user);
      setGlobalStanding(standing);
      setCachedGlobalStanding(user.id, standing, breakdown.totalLifeScore);
    }
  }, [user]);

  // Create facts array with safe defaults
  const facts: GlobalFact[] = React.useMemo(() => {
    if (!scoreBreakdown || !globalStanding) {
      return [];
    }

    const { totalLifeScore, wealthScore, knowledgeScore } = scoreBreakdown;
    const { percentile, peopleAhead, surpassedCountries, wealthPercentile, educationPercentile } = globalStanding;
    const scoreLevel = getScoreLevel(totalLifeScore);
    const globalRank = 8000000000 - peopleAhead;

    const getRandomCountries = (count: number) => {
      const shuffled = [...surpassedCountries].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    return [
      {
        id: 'global-rank',
        icon: Globe,
        title: 'Global Standing',
        content: `You're ahead of ${formatNumber(peopleAhead)} people worldwide`,
        subtext: `Global Rank: #${formatNumber(globalRank)} / 8B • Top ${(100 - percentile).toFixed(2)}%`,
        color: 'text-blue-400',
        bgGradient: 'from-blue-500/20 to-cyan-500/20',
        emoji: '🌍',
        category: 'global'
      },
      {
        id: 'score-breakdown',
        icon: Calculator,
        title: 'LifeScore Breakdown',
        content: `${formatNumber(totalLifeScore)} XP Total Score`,
        subtext: `Wealth: ${formatNumber(wealthScore)} XP • Knowledge: ${formatNumber(knowledgeScore)} XP`,
        color: scoreLevel.color.replace('text-', 'text-'),
        bgGradient: 'from-indigo-500/20 to-purple-500/20',
        emoji: '📊',
        category: 'breakdown'
      },
      {
        id: 'wealth-comparison',
        icon: DollarSign,
        title: 'Wealth Impact',
        content: `Your wealth puts you in the top ${(100 - wealthPercentile).toFixed(1)}% globally`,
        subtext: `Wealthier than ${wealthPercentile.toFixed(1)}% of the world's population`,
        color: 'text-green-400',
        bgGradient: 'from-green-500/20 to-emerald-500/20',
        emoji: '💰',
        category: 'wealth'
      },
      {
        id: 'education-level',
        icon: GraduationCap,
        title: 'Education Impact',
        content: `Your education level exceeds ${educationPercentile}% of people globally`,
        subtext: `Higher education than ${formatNumber(8000000000 * educationPercentile / 100)} people`,
        color: 'text-purple-400',
        bgGradient: 'from-purple-500/20 to-pink-500/20',
        emoji: '🎓',
        category: 'education'
      },
      {
        id: 'countries-surpassed',
        icon: Flag,
        title: 'Countries Surpassed',
        content: surpassedCountries.length > 0 
          ? `You outrank the average citizen of ${getRandomCountries(3).map(c => c.name).join(', ')}`
          : 'Keep improving to surpass country averages',
        subtext: surpassedCountries.length > 0
          ? `Total countries surpassed: ${surpassedCountries.length} nations`
          : 'Add more data to your profile to improve your ranking',
        color: 'text-yellow-400',
        bgGradient: 'from-yellow-500/20 to-orange-500/20',
        emoji: '🏝️',
        category: 'countries'
      },
      {
        id: 'percentile-power',
        icon: Crown,
        title: `${scoreLevel.level} Status`,
        content: `You're in the ${scoreLevel.description.toLowerCase()}`,
        subtext: `LifeScore Level: ${scoreLevel.level} • ${scoreLevel.description}`,
        color: scoreLevel.color,
        bgGradient: 'from-pink-500/20 to-rose-500/20',
        emoji: '👑',
        category: 'percentile'
      }
    ];
  }, [scoreBreakdown, globalStanding]);

  // Auto-play effect - now always called
  useEffect(() => {
    if (!isAutoPlaying || isHovered || facts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, 6000); // 6 seconds per fact

    return () => clearInterval(interval);
  }, [facts.length, isAutoPlaying, isHovered]);

  // Show loading state if data is not ready
  if (!scoreBreakdown || !globalStanding) {
    return (
      <Card className="p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-center h-20">
          <div className="text-center">
            <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
            <div className="text-gray-300 text-sm">Calculating your global standing...</div>
          </div>
        </div>
      </Card>
    );
  }

  const { totalLifeScore, wealthScore, knowledgeScore } = scoreBreakdown;
  const { percentile, peopleAhead, surpassedCountries, wealthPercentile, educationPercentile } = globalStanding;
  const scoreLevel = getScoreLevel(totalLifeScore);
  const globalRank = 8000000000 - peopleAhead;

  const currentFact = facts[currentFactIndex] || facts[0];

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentFactIndex((prev) => (prev - 1 + facts.length) % facts.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentFactIndex((prev) => (prev + 1) % facts.length);
  };

  const handleRefresh = () => {
    // Recalculate scores and clear cache
    localStorage.removeItem(`lifescore_standing_${user.id}`);
    const newBreakdown = calculateLifeScore(user);
    const newStanding = estimateGlobalStanding(newBreakdown.totalLifeScore, user);
    
    setScoreBreakdown(newBreakdown);
    setGlobalStanding(newStanding);
    setCachedGlobalStanding(user.id, newStanding, newBreakdown.totalLifeScore);
    
    setCurrentFactIndex(Math.floor(Math.random() * facts.length));
    triggerConfetti();
    toast.success('LifeScore recalculated! 🎉');
  };

  const handleShare = () => {
    const shareText = `🌍 ${currentFact.content}\n\nMy LifeScore: ${formatNumber(totalLifeScore)} XP\nGlobal Rank: #${formatNumber(globalRank)}\n\nCheck out your global ranking on LifeScore!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Global LifeScore Ranking',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Ranking copied to clipboard! 📋');
    }
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentFactIndex(index);
  };

  return (
    <Card 
      className="p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Globe className="w-5 h-5 text-blue-400 mr-2" />
            Your Global Standing
          </h2>
          <div className="flex items-center space-x-3 mt-1">
            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${scoreLevel.color} bg-white/10`}>
              {scoreLevel.level} Level
            </div>
            <div className="text-gray-400 text-xs">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-gray-400 hover:text-white p-2"
            title="Recalculate LifeScore"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-400 hover:text-white p-2"
            title="Share your ranking"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Fact Display */}
      <div className="relative mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFactIndex}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`relative p-4 rounded-lg bg-gradient-to-br ${currentFact.bgGradient} border border-white/10`}
          >
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm`}>
                    <span className="text-xl">{currentFact.emoji}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{currentFact.title}</h3>
                    <div className="flex items-center space-x-2">
                      <currentFact.icon className={`w-3 h-3 ${currentFact.color}`} />
                      <span className={`text-xs ${currentFact.color} font-medium uppercase tracking-wide`}>
                        {currentFact.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handlePrevious}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-bold text-white leading-relaxed">
                  {currentFact.content}
                </p>
                {currentFact.subtext && (
                  <p className={`text-sm ${currentFact.color} font-medium`}>
                    {currentFact.subtext}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center space-x-2 mb-4">
        {facts.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentFactIndex 
                ? `${currentFact.color.replace('text-', 'bg-')} scale-125` 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Compact Global Visualization Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-300">
          <span className="font-medium">Global Population Ranking</span>
          <span className="text-blue-400 font-bold">
            Top {(100 - percentile).toFixed(2)}%
          </span>
        </div>
        
        <div className="relative">
          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${percentile}%` }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </motion.div>
          </div>
          
          {/* User Avatar positioned on the progress bar */}
          <motion.div
            className="absolute top-1/2 transform -translate-y-1/2"
            style={{ left: `${percentile}%` }}
            initial={{ scale: 0, x: '-50%' }}
            animate={{ scale: 1, x: '-50%' }}
            transition={{ duration: 1, delay: 1.5, type: "spring", bounce: 0.4 }}
          >
            <div className="relative">
              {/* Glowing ring */}
              <div className="absolute inset-0 w-8 h-8 bg-blue-400 rounded-full animate-ping opacity-30" />
              <div className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-50 blur-sm" />
              
              {/* User Avatar */}
              <div className="relative w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <Users className="w-4 h-4 text-white" />
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-gray-600 shadow-lg">
                <div className="font-semibold">{user.name}</div>
                <div className="text-blue-400">#{formatNumber(globalRank)}</div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
              </div>
            </div>
          </motion.div>
          
          {/* Scale Labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1" />
              Bottom 1%
            </span>
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1" />
              Average
            </span>
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1" />
              Top 1%
            </span>
          </div>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        <div className="text-center p-2 bg-gray-900/50 rounded border border-gray-700">
          <div className="text-sm font-bold text-blue-400">
            #{formatNumber(globalRank)}
          </div>
          <div className="text-xs text-gray-400">Rank</div>
        </div>
        
        <div className="text-center p-2 bg-gray-900/50 rounded border border-gray-700">
          <div className="text-sm font-bold text-green-400">
            {formatNumber(peopleAhead)}
          </div>
          <div className="text-xs text-gray-400">Behind</div>
        </div>
        
        <div className="text-center p-2 bg-gray-900/50 rounded border border-gray-700">
          <div className="text-sm font-bold text-purple-400">
            {surpassedCountries.length}
          </div>
          <div className="text-xs text-gray-400">Countries</div>
        </div>

        <div className="text-center p-2 bg-gray-900/50 rounded border border-gray-700">
          <div className={`text-sm font-bold ${scoreLevel.color}`}>
            {formatNumber(totalLifeScore)}
          </div>
          <div className="text-xs text-gray-400">XP</div>
        </div>
      </div>
    </Card>
  );
};

export default DynamicFactsPanel;