import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, Building, Users, Filter, Crown, Medal, Award, DollarSign, GraduationCap, TrendingUp, Star, Zap, UserPlus } from 'lucide-react';
import { User } from '../../types';
import { formatNumber, formatCurrency, triggerConfetti } from '../../utils/animations';
import { calculateLifeScore, estimateGlobalStanding } from '../../utils/lifeScoreEngine';
import { getMockLeaderboard } from '../../utils/mockData';
import Card from '../common/Card';
import Button from '../common/Button';
import UserProfileModal from '../modals/UserProfileModal';
import toast from 'react-hot-toast';

interface LeaderboardsProps {
  user: User;
}

interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  change: number;
  badge?: any;
}

const Leaderboards: React.FC<LeaderboardsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('global');
  const [filter, setFilter] = useState('combined');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [friends, setFriends] = useState<Set<string>>(new Set(user.friends || []));
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'global', label: 'Global', icon: Globe, color: 'from-blue-500 to-cyan-400' },
    { id: 'local', label: 'Local', icon: MapPin, color: 'from-green-500 to-emerald-400' },
    { id: 'wealth', label: 'Wealth', icon: DollarSign, color: 'from-yellow-500 to-orange-400' },
    { id: 'knowledge', label: 'Knowledge', icon: GraduationCap, color: 'from-purple-500 to-pink-400' },
    { id: 'friends', label: 'Friends', icon: Users, color: 'from-rose-500 to-pink-400' },
  ];

  const filters = [
    { id: 'combined', label: 'Combined' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
  ];

  // Load leaderboard data using mock data
  useEffect(() => {
    loadLeaderboardData();
  }, [activeTab, filter]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Use mock data instead of Supabase
      const mockData = getMockLeaderboard(activeTab, user);
      setLeaderboardData(mockData);
      
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  const handleUserClick = (clickedUser: User) => {
    setSelectedUser(clickedUser);
  };

  const handleAddFriend = (userId: string) => {
    // Prevent adding yourself as friend
    if (userId === user.id) {
      toast.error('You cannot add yourself as a friend!');
      return;
    }

    // Check if already friends
    if (friends.has(userId)) {
      toast.error('Already friends!');
      return;
    }

    // Check if request already sent
    if (friendRequests.has(userId)) {
      toast.error('Friend request already sent!');
      return;
    }

    // Add to friend requests
    setFriendRequests(prev => new Set([...prev, userId]));
    
    // Simulate accepting the friend request after a short delay
    setTimeout(() => {
      setFriends(prev => new Set([...prev, userId]));
      setFriendRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      toast.success('Friend request accepted! 🎉');
    }, 1500);

    triggerConfetti();
    toast.success('Friend request sent! 🎉');
  };

  const isFriend = (userId: string) => {
    return friends.has(userId);
  };

  const hasPendingRequest = (userId: string) => {
    return friendRequests.has(userId);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 drop-shadow-lg" />;
    if (rank === 2) return <Medal className="w-4 h-4 md:w-5 md:h-5 text-gray-300 drop-shadow-lg" />;
    if (rank === 3) return <Award className="w-4 h-4 md:w-5 md:h-5 text-amber-600 drop-shadow-lg" />;
    return <span className="text-sm md:text-lg font-bold text-gray-300">#{rank}</span>;
  };

  const getScoreDisplay = (entry: any) => {
    switch (activeTab) {
      case 'wealth':
        return formatCurrency(entry.score);
      case 'knowledge':
        return `${formatNumber(entry.score)} pts`;
      default:
        return `${formatNumber(entry.score)} XP`;
    }
  };

  const getChangeDisplay = (entry: any) => {
    switch (activeTab) {
      case 'wealth':
        return `${entry.change > 0 ? '+' : ''}${formatCurrency(entry.change)}`;
      case 'knowledge':
        return `${entry.change > 0 ? '+' : ''}${entry.change} pts`;
      default:
        return `${entry.change > 0 ? '+' : ''}${entry.change} XP`;
    }
  };

  // Get card styling based on rank
  const getCardStyling = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return `bg-gradient-to-r ${currentTab?.color} bg-opacity-20 border-2 border-opacity-50 shadow-lg`;
    }
    
    // Top 3 positions - vibrant, cheerful colors
    if (rank === 1) {
      return 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400/40 shadow-lg shadow-yellow-400/20';
    }
    if (rank === 2) {
      return 'bg-gradient-to-r from-gray-300/20 to-slate-300/20 border-2 border-gray-300/40 shadow-lg shadow-gray-300/20';
    }
    if (rank === 3) {
      return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-2 border-amber-600/40 shadow-lg shadow-amber-600/20';
    }
    
    // Rest - lighter, fun colors
    return 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/30 hover:from-indigo-500/15 hover:to-purple-500/15 hover:border-indigo-400/40';
  };

  // Get avatar styling based on rank
  const getAvatarStyling = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg shadow-yellow-400/30';
    }
    if (rank === 2) {
      return 'bg-gradient-to-r from-gray-300 to-slate-300 shadow-lg shadow-gray-300/30';
    }
    if (rank === 3) {
      return 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg shadow-amber-600/30';
    }
    return `bg-gradient-to-r from-indigo-400 to-purple-400 shadow-md`;
  };

  const getFriendButtonText = (userId: string) => {
    if (isFriend(userId)) return 'Friends';
    if (hasPendingRequest(userId)) return 'Sent';
    return 'Add';
  };

  const getFriendButtonVariant = (userId: string) => {
    if (isFriend(userId)) return 'secondary';
    if (hasPendingRequest(userId)) return 'ghost';
    return 'primary';
  };

  const getFriendButtonClass = (userId: string) => {
    if (isFriend(userId)) {
      return 'bg-green-600 hover:bg-green-700 text-white border-green-600';
    }
    if (hasPendingRequest(userId)) {
      return 'text-gray-400 cursor-not-allowed bg-gray-700';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              🏆 Leaderboards
            </h1>
            <p className="text-gray-300 mt-2 text-sm md:text-base">Compete and climb the rankings!</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <div className="text-gray-300">Loading leaderboards...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🏆 Leaderboards
          </h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base">Compete and climb the rankings!</p>
        </div>
        <Button variant="secondary" icon={Filter} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm">
          <span className="hidden sm:inline">Filters</span>
          <span className="sm:hidden">Filter</span>
        </Button>
      </div>

      {/* Mobile-Optimized Tabs - Horizontal Scroll */}
      <div className="w-full overflow-x-auto">
        <div className="flex space-x-2 bg-gray-800/50 p-2 rounded-xl backdrop-blur-sm min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all whitespace-nowrap font-medium text-sm md:text-base ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile-Optimized Filter Buttons */}
      <div className="flex space-x-2 overflow-x-auto">
        {filters.map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm transition-all font-medium whitespace-nowrap ${
              filter === filterOption.id
                ? `bg-gradient-to-r ${currentTab?.color} text-white shadow-md`
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Current User Position */}
      {user && (
        <Card className={`p-4 md:p-6 border-2 bg-gradient-to-r ${currentTab?.color} bg-opacity-10 border-opacity-50`} style={{ borderColor: 'rgb(59 130 246 / 0.5)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentTab?.color} rounded-full flex items-center justify-center shadow-lg cursor-pointer`}
                     onClick={() => handleUserClick(user)}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <Users className="w-8 h-8 text-white" />
                  )}
                </div>
                
                {/* Avatar Badge */}
                {user.avatarBadge && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700">
                    <span className="text-xs">{user.avatarBadge.icon}</span>
                  </div>
                )}
                
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <Star className="w-4 h-4 text-yellow-900" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white cursor-pointer hover:text-blue-300 transition-colors"
                    onClick={() => handleUserClick(user)}>
                  {user.name} (You)
                </h3>
                <p className="text-gray-300">{user.city}, {user.country}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">
                    {formatNumber(user.lifeScore)} XP
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold bg-gradient-to-r ${currentTab?.color} bg-clip-text text-transparent`}>
                #{formatNumber(leaderboardData.findIndex(entry => entry.user.id === user.id) + 1 || 1)}
              </div>
              <div className="text-green-400 font-semibold flex items-center justify-end">
                <TrendingUp className="w-4 h-4 mr-1" />
                ↑ 7 today
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard Content */}
      {leaderboardData.length > 0 ? (
        <Card className="p-3 md:p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm">
          <div className="space-y-2 md:space-y-3">
            {leaderboardData.map((entry, index) => (
              <motion.div
                key={`${entry.user.id}-${activeTab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`transition-all hover:scale-[1.02] rounded-xl p-4 ${
                  getCardStyling(entry.rank, entry.user.id === user.id)
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 flex justify-center items-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer ${getAvatarStyling(entry.rank)}`}
                           onClick={() => handleUserClick(entry.user)}>
                        {entry.user.avatar ? (
                          <img
                            src={entry.user.avatar}
                            alt={entry.user.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white"
                          />
                        ) : (
                          <Users className="w-7 h-7 text-white" />
                        )}
                      </div>
                      
                      {entry.rank <= 3 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-lg">
                          <Star className="w-3 h-3 text-yellow-900" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg cursor-pointer hover:text-blue-300 transition-colors"
                          onClick={() => handleUserClick(entry.user)}>
                        {entry.user.name}
                        {entry.user.id === user.id && (
                          <span className={`ml-2 text-sm bg-gradient-to-r ${currentTab?.color} bg-clip-text text-transparent font-semibold`}>
                            (You)
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-400">{entry.user.country}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white mb-1">
                        {getScoreDisplay(entry)}
                      </div>
                      <div className={`text-sm font-semibold flex items-center justify-end ${
                        entry.change > 0 ? 'text-green-400' : entry.change < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {entry.change > 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : entry.change < 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
                        ) : null}
                        {getChangeDisplay(entry)} today
                      </div>
                    </div>

                    {/* Add Friend Button */}
                    {entry.user.id !== user.id && (
                      <Button
                        variant={getFriendButtonVariant(entry.user.id)}
                        size="sm"
                        icon={UserPlus}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddFriend(entry.user.id);
                        }}
                        disabled={isFriend(entry.user.id) || hasPendingRequest(entry.user.id)}
                        className={getFriendButtonClass(entry.user.id)}
                      >
                        {getFriendButtonText(entry.user.id)}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      ) : (
        /* Empty State */
        <Card className="p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-gray-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              No leaderboard data yet
            </h3>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Be the first to earn a badge and appear on the leaderboards! Complete your profile and start your LifeScore journey.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Star className="w-4 h-4" />
                <span>Complete your profile to get started</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Award className="w-4 h-4" />
                <span>Earn badges to climb the rankings</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab-specific insights */}
      <Card className={`p-4 md:p-6 bg-gradient-to-r ${currentTab?.color} bg-opacity-10 border border-opacity-30`}>
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-bold text-white mb-2">
            {activeTab === 'global' && '🌍 Global Competition'}
            {activeTab === 'local' && '🏘️ Local Champions'}
            {activeTab === 'wealth' && '💰 Wealth Rankings'}
            {activeTab === 'knowledge' && '🧠 Knowledge Leaders'}
            {activeTab === 'friends' && '👥 Friend Circle'}
          </h3>
          <p className="text-gray-300 text-sm md:text-base">
            {activeTab === 'global' && 'Compete against users worldwide'}
            {activeTab === 'local' && `See how you rank in ${user.city} and ${user.country}`}
            {activeTab === 'wealth' && 'Rankings based on total net worth'}
            {activeTab === 'knowledge' && 'Education, certificates, and skills combined'}
            {activeTab === 'friends' && 'Private leaderboard with your connections'}
          </p>
        </div>
      </Card>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          currentUser={user}
          onAddFriend={handleAddFriend}
          isFriend={isFriend(selectedUser.id)}
        />
      )}
    </div>
  );
};

export default Leaderboards;