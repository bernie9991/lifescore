import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  MapPin, 
  Building, 
  Users, 
  Filter, 
  Crown, 
  Medal, 
  Award, 
  DollarSign, 
  GraduationCap, 
  TrendingUp, 
  Star, 
  Zap, 
  UserPlus,
  Loader2,
  RefreshCw,
  Check,
  Info,
  User as UserIcon,
  Trophy
} from 'lucide-react';
import { User } from '../../types';
import { formatNumber, formatCurrency, triggerConfetti } from '../../utils/animations';
import { calculateLifeScore, estimateGlobalStanding } from '../../utils/lifeScoreEngine';
import Card from '../common/Card';
import Button from '../common/Button';
import UserProfileModal from '../modals/UserProfileModal';
import toast from 'react-hot-toast';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';

interface LeaderboardsProps {
  user: User;
}

interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  change: number;
  badge?: any;
  isNPC?: boolean;
}

interface StaticLeader {
  id: string;
  name: string;
  avatar?: string;
  country: string;
  city: string;
  lifeScore: number;
  wealth?: {
    total: number;
  };
  knowledge?: {
    total: number;
  };
  badge?: {
    icon: string;
    name: string;
    rarity: string;
  };
  isNPC: boolean;
  description: string;
}

const Leaderboards: React.FC<LeaderboardsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('global');
  const [filter, setFilter] = useState('combined');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [friends, setFriends] = useState<Set<string>>(new Set(user.friends || []));
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Static "NPC" leaders - famous and inspirational figures
  const staticLeaders: StaticLeader[] = [
    {
      id: 'elon-musk',
      name: 'Elon Musk',
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/330px-Elon_Musk_Royal_Society_%28crop2%29.jpg',
      country: 'United States',
      city: 'Austin',
      lifeScore: 28500,
      wealth: { total: 180000000000 },
      knowledge: { total: 9500 },
      badge: { icon: '🚀', name: 'Space Pioneer', rarity: 'legendary' },
      isNPC: true,
      description: 'Entrepreneur, CEO of Tesla and SpaceX'
    },
    {
      id: 'bill-gates',
      name: 'Bill Gates',
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Bill_Gates_2017_%28cropped%29.jpg',
      country: 'United States',
      city: 'Seattle',
      lifeScore: 27800,
      wealth: { total: 120000000000 },
      knowledge: { total: 9200 },
      badge: { icon: '🖥️', name: 'Tech Visionary', rarity: 'legendary' },
      isNPC: true,
      description: 'Co-founder of Microsoft, philanthropist'
    },
    {
      id: 'malala-yousafzai',
      name: 'Malala Yousafzai',
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Malala_Yousafzai_at_Girl_Summit_2014.jpg/330px-Malala_Yousafzai_at_Girl_Summit_2014.jpg',
      country: 'United Kingdom',
      city: 'Birmingham',
      lifeScore: 24600,
      wealth: { total: 2000000 },
      knowledge: { total: 9800 },
      badge: { icon: '🕊️', name: 'Peace Champion', rarity: 'legendary' },
      isNPC: true,
      description: 'Nobel Prize laureate, education activist'
    },
    {
      id: 'marie-curie',
      name: 'Marie Curie',
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/330px-Marie_Curie_c1920.jpg',
      country: 'France',
      city: 'Paris',
      lifeScore: 26500,
      wealth: { total: 1000000 },
      knowledge: { total: 10000 },
      badge: { icon: '⚛️', name: 'Scientific Legend', rarity: 'legendary' },
      isNPC: true,
      description: 'Physicist, chemist, pioneer in radioactivity'
    },
    {
      id: 'nelson-mandela',
      name: 'Nelson Mandela',
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nelson_Mandela_1994.jpg/330px-Nelson_Mandela_1994.jpg',
      country: 'South Africa',
      city: 'Johannesburg',
      lifeScore: 25800,
      wealth: { total: 10000000 },
      knowledge: { total: 9600 },
      badge: { icon: '✊', name: 'Freedom Fighter', rarity: 'legendary' },
      isNPC: true,
      description: 'Revolutionary, politician, philanthropist'
    }
  ];

  // Load leaderboard data from Firestore
  const loadLeaderboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Only include static leaders in the global leaderboard
      let staticLeadersToInclude: StaticLeader[] = [];
      if (activeTab === 'global') {
        staticLeadersToInclude = staticLeaders;
      }

      // Convert static leaders to LeaderboardEntry format
      const staticEntries: LeaderboardEntry[] = staticLeadersToInclude.map((leader, index) => ({
        rank: index + 1, // Temporary rank, will be recalculated after merging
        user: {
          id: leader.id,
          uid: leader.id,
          name: leader.name,
          email: `${leader.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          avatar: leader.avatar,
          country: leader.country,
          city: leader.city,
          lifeScore: leader.lifeScore,
          username: leader.name.toLowerCase().replace(/\s+/g, ''),
          isRealNameVisible: true,
          wealth: leader.wealth || { salary: 0, savings: 0, investments: 0, currency: 'USD', total: 0 },
          knowledge: leader.knowledge || { education: '', certificates: [], languages: [], total: 0 },
          assets: [],
          badges: leader.badge ? [{ ...leader.badge, id: 'special-badge', xpReward: 5000 }] : [],
          friends: [],
          createdAt: new Date('2020-01-01'),
          lastActive: new Date(),
          role: 'user'
        },
        score: leader.lifeScore,
        change: Math.floor(Math.random() * 10),
        badge: leader.badge,
        isNPC: true
      }));

      // Fetch real users from Firestore
      let realEntries: LeaderboardEntry[] = [];
      
      // Different queries based on tab
      let usersQuery;
      
      if (activeTab === 'friends') {
        // Get user's friends
        const friendIds = [...(user.friends || []), user.id]; // Include current user
        
        if (friendIds.length <= 1) { // Only the current user
          setLeaderboardData([]);
          setLoading(false);
          setRefreshing(false);
          return;
        }
        
        // Firestore 'in' operator is limited to 10 values
        // For simplicity, we'll just take the first 10 friends
        const friendsToQuery = friendIds.slice(0, 10);
        
        usersQuery = query(
          collection(db, 'users'),
          where('id', 'in', friendsToQuery),
          orderBy('lifeScore', 'desc'),
          limit(50)
        );
      } else if (activeTab === 'local' && user.country) {
        // Local leaderboard - users from same country
        usersQuery = query(
          collection(db, 'users'),
          where('country', '==', user.country),
          where('lifeScore', '>', 0),
          orderBy('lifeScore', 'desc'),
          limit(50)
        );
      } else if (activeTab === 'wealth') {
        // Wealth leaderboard
        usersQuery = query(
          collection(db, 'users'),
          where('wealth.total', '>', 0),
          orderBy('wealth.total', 'desc'),
          limit(50)
        );
      } else if (activeTab === 'knowledge') {
        // Knowledge leaderboard
        usersQuery = query(
          collection(db, 'users'),
          where('knowledge.total', '>', 0),
          orderBy('knowledge.total', 'desc'),
          limit(50)
        );
      } else {
        // Global leaderboard - all users
        usersQuery = query(
          collection(db, 'users'),
          where('lifeScore', '>', 0),
          orderBy('lifeScore', 'desc'),
          limit(50)
        );
      }

      const querySnapshot = await getDocs(usersQuery);
      
      // Process real users
      realEntries = querySnapshot.docs.map((doc, index) => {
        const userData = doc.data() as User;
        return {
          rank: index + 1, // Temporary rank, will be recalculated after merging
          user: {
            ...userData,
            id: doc.id,
            uid: doc.id,
            createdAt: userData.createdAt?.toDate() || new Date(),
            lastActive: userData.lastActive?.toDate() || new Date()
          },
          score: activeTab === 'wealth' 
            ? (userData.wealth?.total || 0) 
            : activeTab === 'knowledge' 
              ? (userData.knowledge?.total || 0) 
              : (userData.lifeScore || 0),
          change: Math.floor(Math.random() * 20) - 10, // Random change for demo
          isNPC: false
        };
      });

      // Combine static and real entries
      let combinedEntries = [...staticEntries, ...realEntries];
      
      // Sort based on score
      combinedEntries.sort((a, b) => b.score - a.score);
      
      // Reassign ranks after sorting
      combinedEntries = combinedEntries.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      setLeaderboardData(combinedEntries);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      toast.error('Failed to load leaderboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, user]);

  // Initial load and tab change
  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData, activeTab]);

  const currentTab = tabs.find(tab => tab.id === activeTab);

  const handleUserClick = (clickedUser: User) => {
    // Don't open modal for NPC users
    if ((clickedUser as any).isNPC) {
      return;
    }
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

  const getScoreDisplay = (entry: LeaderboardEntry) => {
    switch (activeTab) {
      case 'wealth':
        return formatCurrency(entry.score);
      case 'knowledge':
        return `${formatNumber(entry.score)} pts`;
      default:
        return `${formatNumber(entry.score)} XP`;
    }
  };

  const getChangeDisplay = (entry: LeaderboardEntry) => {
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
  const getCardStyling = (rank: number, isCurrentUser: boolean, isNPC: boolean = false) => {
    if (isCurrentUser) {
      return `bg-gradient-to-r ${currentTab?.color} bg-opacity-20 border-2 border-opacity-50 shadow-lg`;
    }
    
    if (isNPC) {
      return 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-2 border-purple-400/40 shadow-lg';
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
  const getAvatarStyling = (rank: number, isNPC: boolean = false) => {
    if (isNPC) {
      return 'bg-gradient-to-r from-purple-400 to-indigo-400 shadow-lg shadow-purple-400/30';
    }
    
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

  const handleRefresh = () => {
    loadLeaderboardData(true);
  };

  if (loading && leaderboardData.length === 0) {
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
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
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
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-400 hover:text-white"
            icon={refreshing ? Loader2 : RefreshCw}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="secondary" 
            icon={Filter} 
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm"
          >
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
          </Button>
        </div>
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
                    <UserIcon className="w-8 h-8 text-white" />
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

      {/* NPC Indicator - Only show for global leaderboard */}
      {activeTab === 'global' && (
        <div className="flex items-center justify-center space-x-2 bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-3 text-indigo-300 text-sm">
          <Info className="w-4 h-4" />
          <span>Entries marked with <span className="bg-purple-500/20 px-2 py-0.5 rounded-full text-purple-300 text-xs font-semibold">NPC</span> are platform-generated inspirational figures</span>
        </div>
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
                transition={{ delay: index * 0.05 }}
                className={`transition-all hover:scale-[1.02] rounded-xl p-4 ${
                  getCardStyling(entry.rank, entry.user.id === user.id, entry.isNPC)
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 flex justify-center items-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer ${getAvatarStyling(entry.rank, entry.isNPC)}`}
                           onClick={() => handleUserClick(entry.user)}>
                        {entry.user.avatar ? (
                          <img
                            src={entry.user.avatar}
                            alt={entry.user.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white"
                          />
                        ) : (
                          <UserIcon className="w-7 h-7 text-white" />
                        )}
                      </div>
                      
                      {entry.rank <= 3 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-lg">
                          <Star className="w-3 h-3 text-yellow-900" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-bold text-white text-lg cursor-pointer hover:text-blue-300 transition-colors"
                            onClick={() => handleUserClick(entry.user)}>
                          {entry.user.name}
                          {entry.user.id === user.id && (
                            <span className={`ml-2 text-sm bg-gradient-to-r ${currentTab?.color} bg-clip-text text-transparent font-semibold`}>
                              (You)
                            </span>
                          )}
                        </h3>
                        
                        {/* NPC Badge */}
                        {entry.isNPC && (
                          <span className="ml-2 bg-purple-500/20 px-2 py-0.5 rounded-full text-purple-300 text-xs font-semibold">
                            NPC
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400">{entry.user.country}</p>
                      
                      {/* Description for NPCs */}
                      {entry.isNPC && (
                        <p className="text-gray-400 text-sm italic">
                          {(entry.user as any).description || "Inspirational figure"}
                        </p>
                      )}
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

                    {/* Add Friend Button - Only for real users, not NPCs */}
                    {entry.user.id !== user.id && !entry.isNPC && (
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
            {activeTab === 'global' && 'Compete against users worldwide and inspirational figures'}
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