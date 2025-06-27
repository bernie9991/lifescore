import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Calendar, 
  Trophy, 
  DollarSign, 
  GraduationCap, 
  Home, 
  Users,
  UserPlus,
  MessageCircle,
  Star,
  Award,
  Globe
} from 'lucide-react';
import Button from '../common/Button';
import { User } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/animations';
import { calculateLifeScore, estimateGlobalStanding } from '../../utils/lifeScoreEngine';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  currentUser: User;
  onAddFriend: (userId: string) => void;
  isFriend?: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  currentUser,
  onAddFriend,
  isFriend = false 
}) => {
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

  const handleAddFriend = () => {
    onAddFriend(user.id);
  };

  const isCurrentUser = user.id === currentUser.id;

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
            <div className="relative p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                      />
                    ) : (
                      <Users className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2">
                    <Star className="w-4 h-4 text-yellow-900" />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1 text-white">
                  <h2 className="text-3xl font-bold mb-2">
                    {user.name}
                    {isCurrentUser && <span className="text-lg text-blue-200 ml-2">(You)</span>}
                  </h2>
                  <div className="flex items-center space-x-4 text-white/80 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.city}, {user.country}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-yellow-300">
                    {formatNumber(user.lifeScore || 0)} XP
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isCurrentUser && (
                <div className="flex space-x-3 mt-6">
                  <Button 
                    onClick={handleAddFriend}
                    icon={UserPlus}
                    variant={isFriend ? 'secondary' : 'primary'}
                    className={isFriend ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {isFriend ? 'Friends' : 'Add Friend'}
                  </Button>
                  <Button variant="secondary" icon={MessageCircle}>
                    Message
                  </Button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Rankings */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                  Rankings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300">Global Rank</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-400">
                        #{formatNumber(globalRank)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">out of 8B people</p>
                  </div>
                  
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-green-400" />
                        <span className="text-gray-300">{user.country} Rank</span>
                      </div>
                      <span className="text-2xl font-bold text-green-400">
                        #{formatNumber(countryRank)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">in {user.country}</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Wealth */}
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white flex items-center">
                      <DollarSign className="w-5 h-5 text-green-400 mr-2" />
                      Wealth
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total</span>
                      <span className="text-green-400 font-bold">
                        {formatCurrency(user.wealth?.total || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Salary</span>
                      <span className="text-white">
                        {formatCurrency(user.wealth?.salary || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Savings</span>
                      <span className="text-white">
                        {formatCurrency(user.wealth?.savings || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Knowledge */}
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white flex items-center">
                      <GraduationCap className="w-5 h-5 text-blue-400 mr-2" />
                      Knowledge
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Score</span>
                      <span className="text-blue-400 font-bold">
                        {user.knowledge?.total || 0} pts
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Education</span>
                      <span className="text-white capitalize">
                        {user.knowledge?.education || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Languages</span>
                      <span className="text-white">
                        {(user.knowledge?.languages || []).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assets */}
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white flex items-center">
                      <Home className="w-5 h-5 text-purple-400 mr-2" />
                      Assets
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Value</span>
                      <span className="text-purple-400 font-bold">
                        {formatCurrency((user.assets || []).reduce((sum, asset) => sum + asset.value, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Items</span>
                      <span className="text-white">
                        {(user.assets || []).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Award className="w-6 h-6 text-yellow-400 mr-2" />
                  Recent Badges
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(user.badges || []).slice(0, 4).map((badge, index) => (
                    <div key={badge.id} className="bg-gray-900 p-3 rounded-lg border border-gray-600 text-center">
                      <div className="text-2xl mb-2">{badge.icon}</div>
                      <div className="text-xs font-medium text-white">{badge.name}</div>
                      <div className="text-xs text-gray-400">{badge.rarity}</div>
                    </div>
                  ))}
                  {(user.badges || []).length === 0 && (
                    <div className="col-span-full text-center text-gray-400 py-4">
                      No badges earned yet
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison with current user */}
              {!isCurrentUser && (
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Comparison with You</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-400">LifeScore Difference</div>
                      <div className={`text-lg font-bold ${
                        (user.lifeScore || 0) > (currentUser.lifeScore || 0) 
                          ? 'text-red-400' 
                          : 'text-green-400'
                      }`}>
                        {(user.lifeScore || 0) > (currentUser.lifeScore || 0) ? '+' : ''}
                        {formatNumber((user.lifeScore || 0) - (currentUser.lifeScore || 0))} XP
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Wealth Difference</div>
                      <div className={`text-lg font-bold ${
                        (user.wealth?.total || 0) > (currentUser.wealth?.total || 0) 
                          ? 'text-red-400' 
                          : 'text-green-400'
                      }`}>
                        {formatCurrency(Math.abs((user.wealth?.total || 0) - (currentUser.wealth?.total || 0)))}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Knowledge Difference</div>
                      <div className={`text-lg font-bold ${
                        (user.knowledge?.total || 0) > (currentUser.knowledge?.total || 0) 
                          ? 'text-red-400' 
                          : 'text-green-400'
                      }`}>
                        {(user.knowledge?.total || 0) > (currentUser.knowledge?.total || 0) ? '+' : ''}
                        {(user.knowledge?.total || 0) - (currentUser.knowledge?.total || 0)} pts
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserProfileModal;