import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Mail, Search, Trophy, Crown, Medal, Award, Star, TrendingUp, Globe, MapPin, Zap, Heart, Laugh, Angry, Clapperboard as Clap } from 'lucide-react';
import { User } from '../../types';
import { formatNumber, formatCurrency, triggerEmojiConfetti } from '../../utils/animations';
import { supabase } from '../../lib/supabase';
import Card from '../common/Card';
import Button from '../common/Button';
import UserProfileModal from '../modals/UserProfileModal';
import toast from 'react-hot-toast';

interface FriendsProps {
  user: User;
}

interface Reaction {
  id: string;
  type: 'haha' | 'angry' | 'applause' | 'kudos';
  icon: React.ComponentType<any>;
  label: string;
  color: string;
  bgColor: string;
}

const Friends: React.FC<FriendsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [friendReactions, setFriendReactions] = useState<Record<string, Record<string, string>>>({});
  const [friends, setFriends] = useState<Set<string>>(new Set(user.friends || []));
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [friendsData, setFriendsData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'friends', label: 'My Friends', icon: Users },
    { id: 'requests', label: 'Requests', icon: UserPlus },
  ];

  const reactions: Reaction[] = [
    { id: 'haha', type: 'haha', icon: Laugh, label: 'Haha', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20 border-yellow-400/40' },
    { id: 'angry', type: 'angry', icon: Angry, label: 'Angry', color: 'text-red-400', bgColor: 'bg-red-400/20 border-red-400/40' },
    { id: 'applause', type: 'applause', icon: Clap, label: 'Applause', color: 'text-green-400', bgColor: 'bg-green-400/20 border-green-400/40' },
    { id: 'kudos', type: 'kudos', icon: Heart, label: 'Kudos', color: 'text-pink-400', bgColor: 'bg-pink-400/20 border-pink-400/40' }
  ];

  // Load friends data from Supabase
  useEffect(() => {
    loadFriendsData();
  }, [user.friends]);

  const loadFriendsData = async () => {
    try {
      setLoading(true);
      
      if (!user.friends || user.friends.length === 0) {
        setFriendsData([]);
        setLoading(false);
        return;
      }

      // Query friends from Supabase
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          avatar_url,
          country,
          city,
          life_score,
          created_at
        `)
        .in('id', user.friends);

      if (error) {
        console.error('Error loading friends:', error);
        setFriendsData([]);
        return;
      }

      // Convert to User objects
      const friendsUsers: User[] = (profiles || []).map(profile => ({
        id: profile.id,
        name: profile.name || 'Anonymous',
        email: '', // Don't expose email
        avatar: profile.avatar_url,
        country: profile.country || '',
        city: profile.city || '',
        lifeScore: profile.life_score || 0,
        wealth: { salary: 0, savings: 0, investments: 0, currency: 'USD', total: 0 },
        knowledge: { education: '', certificates: [], languages: [], total: 0 },
        assets: [],
        badges: [],
        friends: [],
        createdAt: new Date(profile.created_at),
        lastActive: new Date(),
        status: 'online' // Mock status
      }));

      // Add current user to the list for leaderboard
      const allUsers = [...friendsUsers, user];
      
      // Sort by LifeScore for leaderboard
      allUsers.sort((a, b) => b.lifeScore - a.lifeScore);
      
      setFriendsData(allUsers);
      
    } catch (error) {
      console.error('Error loading friends data:', error);
      setFriendsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = () => {
    if (inviteEmail) {
      toast.success(`Invitation sent to ${inviteEmail}! 🎉`);
      setInviteEmail('');
    }
  };

  const handleUserClick = (clickedUser: User) => {
    setSelectedUser(clickedUser);
  };

  const handleReaction = (friendId: string, reactionType: string) => {
    setFriendReactions(prev => ({
      ...prev,
      [friendId]: {
        ...prev[friendId],
        [reactionType]: (prev[friendId]?.[reactionType] || '0')
      }
    }));

    const reaction = reactions.find(r => r.id === reactionType);
    
    // Trigger emoji confetti based on reaction type
    triggerEmojiConfetti(reactionType);
    
    toast.success(`${reaction?.label} sent to friend! 🎉`);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 drop-shadow-lg" />;
    if (rank === 2) return <Medal className="w-4 h-4 md:w-5 md:h-5 text-gray-300 drop-shadow-lg" />;
    if (rank === 3) return <Award className="w-4 h-4 md:w-5 md:h-5 text-amber-600 drop-shadow-lg" />;
    return <span className="text-sm md:text-lg font-bold text-gray-300">#{rank}</span>;
  };

  // Get card styling based on rank
  const getCardStyling = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400/50 shadow-lg shadow-blue-400/20';
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
    return 'bg-gradient-to-r from-indigo-400 to-purple-400 shadow-md';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              👥 Friends
            </h1>
            <p className="text-gray-300 mt-2 text-sm md:text-base">Connect and compete with friends!</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <div className="text-gray-300">Loading friends...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            👥 Friends
          </h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base">{friendsData.length - 1} friends connected • Compete and celebrate together!</p>
        </div>
        <Button icon={UserPlus} size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-sm">
          <span className="hidden sm:inline">Add Friends</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Mobile-Optimized Tabs */}
      <div className="w-full overflow-x-auto">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-md transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'leaderboard' && (
        <div className="space-y-4 md:space-y-6">
          {friendsData.length > 1 ? (
            <>
              {/* Leaderboard Header */}
              <Card className="p-4 md:p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
                <div className="text-center">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center justify-center">
                    <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 mr-2 md:mr-3" />
                    Friend Circle Leaderboard
                  </h2>
                  <p className="text-gray-300 text-sm md:text-base">
                    Compete with your friends and celebrate each other's achievements!
                  </p>
                </div>
              </Card>

              {/* Friend Leaderboard */}
              <Card className="p-3 md:p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm">
                <div className="space-y-3 md:space-y-4">
                  {friendsData.map((friend, index) => {
                    const rank = index + 1;
                    const change = Math.floor(Math.random() * 20) - 10; // Random change for demo
                    
                    return (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 md:p-5 rounded-xl transition-all hover:scale-[1.02] ${
                          getCardStyling(rank, friend.id === user.id)
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-12 flex justify-center items-center">
                              {getRankIcon(rank)}
                            </div>
                            
                            <div className="relative">
                              <div 
                                className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer ${getAvatarStyling(rank)}`}
                                onClick={() => handleUserClick(friend)}
                              >
                                {friend.avatar ? (
                                  <img
                                    src={friend.avatar}
                                    alt={friend.name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-white"
                                  />
                                ) : (
                                  <Users className="w-8 h-8 text-white" />
                                )}
                              </div>
                              
                              {rank <= 3 && (
                                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-lg">
                                  <Star className="w-3 h-3 text-yellow-900" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h3 
                                className="text-xl font-bold text-white cursor-pointer hover:text-blue-300 transition-colors"
                                onClick={() => handleUserClick(friend)}
                              >
                                {friend.name}
                                {friend.id === user.id && (
                                  <span className="ml-2 text-blue-400 text-sm">(You)</span>
                                )}
                              </h3>
                              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{friend.city}, {friend.country}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Zap className="w-3 h-3 text-yellow-400" />
                                  <span className="text-yellow-400 font-semibold">
                                    {formatNumber(friend.lifeScore)} XP
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            {/* Score and Change */}
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">
                                {formatNumber(friend.lifeScore)} XP
                              </div>
                              <div className={`text-sm font-semibold flex items-center justify-end ${
                                change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
                              }`}>
                                {change > 0 ? (
                                  <TrendingUp className="w-4 h-4 mr-1" />
                                ) : change < 0 ? (
                                  <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
                                ) : null}
                                {change > 0 ? '+' : ''}{change} today
                              </div>
                            </div>

                            {/* Quick Reactions - Only for other friends */}
                            {friend.id !== user.id && (
                              <div className="flex items-center space-x-2">
                                {reactions.map((reaction) => (
                                  <button
                                    key={reaction.id}
                                    onClick={() => handleReaction(friend.id, reaction.id)}
                                    className={`p-2 rounded-full border transition-all hover:scale-110 ${reaction.bgColor} hover:shadow-lg`}
                                    title={`Send ${reaction.label}`}
                                  >
                                    <reaction.icon className={`w-4 h-4 ${reaction.color}`} />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </>
          ) : (
            /* Empty Leaderboard State */
            <Card className="p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-purple-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  No friends yet
                </h3>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Add friends to see how you compare! Invite people to join LifeScore and compete together.
                </p>
                
                <Button 
                  onClick={() => setActiveTab('friends')}
                  className="bg-gradient-to-r from-purple-500 to-pink-600"
                  icon={UserPlus}
                >
                  Invite Friends
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="space-y-4 md:space-y-6">
          {/* Invite Section */}
          <Card className="p-4 md:p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center">
              <Mail className="w-5 h-5 md:w-6 md:h-6 text-blue-400 mr-2" />
              Invite Friends
            </h2>
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter friend's email"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
              <Button onClick={handleInvite} icon={Mail} className="bg-gradient-to-r from-blue-500 to-purple-600 text-sm md:text-base">
                Send Invite
              </Button>
            </div>
          </Card>

          {/* Friends List or Empty State */}
          {friendsData.filter(f => f.id !== user.id).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {friendsData.filter(f => f.id !== user.id).map((friend, index) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 md:p-6 hover:shadow-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80">
                    <div className="text-center">
                      <div className="relative mb-3 md:mb-4">
                        <div 
                          className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => handleUserClick(friend)}
                        >
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white"
                            />
                          ) : (
                            <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
                          )}
                        </div>
                      </div>
                      
                      <h3 
                        className="font-bold text-white mb-1 text-base md:text-lg cursor-pointer hover:text-blue-300 transition-colors"
                        onClick={() => handleUserClick(friend)}
                      >
                        {friend.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-2">{friend.city}, {friend.country}</p>
                      
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-3 mb-3 md:mb-4">
                        <div className="text-blue-400 font-bold text-lg md:text-xl mb-1">
                          {formatNumber(friend.lifeScore)} XP
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mb-3 md:mb-4">
                        <Button variant="secondary" size="sm" className="flex-1 text-xs md:text-sm">
                          Compare
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-xs md:text-sm">
                          Message
                        </Button>
                      </div>

                      {/* Quick Reactions */}
                      <div className="grid grid-cols-2 gap-1 md:flex md:justify-center md:space-x-2 md:gap-0">
                        {reactions.map((reaction) => (
                          <button
                            key={reaction.id}
                            onClick={() => handleReaction(friend.id, reaction.id)}
                            className={`p-1.5 md:p-2 rounded-full border transition-all hover:scale-110 ${reaction.bgColor}`}
                            title={`Send ${reaction.label}`}
                          >
                            <reaction.icon className={`w-3 h-3 md:w-4 md:h-4 ${reaction.color}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  No friends yet
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  Invite friends to join LifeScore and start competing together!
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Empty Requests State */}
          <Card className="p-6 md:p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">No Friend Requests</h3>
            <p className="text-gray-400 text-sm md:text-base">You're all caught up! Invite more friends to expand your network.</p>
          </Card>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          currentUser={user}
          onAddFriend={() => {}}
          isFriend={true}
        />
      )}
    </div>
  );
};

export default Friends;