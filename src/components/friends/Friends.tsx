import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  Star, 
  TrendingUp, 
  Globe, 
  MapPin, 
  Zap, 
  Heart, 
  Laugh, 
  Angry, 
  Clapperboard as Clap,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { User } from '../../types';
import { formatNumber, triggerEmojiConfetti } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import Card from '../common/Card';
import Button from '../common/Button';
import UserProfileModal from '../modals/UserProfileModal';
import toast from 'react-hot-toast';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface FriendsProps {
  user: User;
}

interface FriendRequest {
  id: string;
  senderId: string;
  senderUsername: string;
  senderName: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: Date;
}

interface SearchResult {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  country: string;
  city: string;
  lifeScore: number;
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
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<SearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'friends', label: 'My Friends', icon: Users },
    { id: 'search', label: 'Find Friends', icon: UserPlus },
    { id: 'requests', label: 'Requests', icon: Award },
  ];

  const reactions: Reaction[] = [
    { id: 'haha', type: 'haha', icon: Laugh, label: 'Haha', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20 border-yellow-400/40' },
    { id: 'angry', type: 'angry', icon: Angry, label: 'Angry', color: 'text-red-400', bgColor: 'bg-red-400/20 border-red-400/40' },
    { id: 'applause', type: 'applause', icon: Clap, label: 'Applause', color: 'text-green-400', bgColor: 'bg-green-400/20 border-green-400/40' },
    { id: 'kudos', type: 'kudos', icon: Heart, label: 'Kudos', color: 'text-pink-400', bgColor: 'bg-pink-400/20 border-pink-400/40' }
  ];

  // Load friends and friend requests on component mount
  useEffect(() => {
    if (user?.id) {
      loadFriendsData();
      loadFriendRequests();
    }
  }, [user?.id]);

  const loadFriendsData = async () => {
    if (!user?.id) {
      console.log('No user ID available for loading friends');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Loading friends for user:', user.id);

      // Get user's friend IDs from their profile
      const userFriendIds = user.friends || [];
      console.log('User friend IDs:', userFriendIds);

      if (userFriendIds.length === 0) {
        console.log('No friends found in user profile');
        setFriends([]);
        return;
      }

      // Query profiles collection to get friend details
      const profilesRef = collection(db, 'profiles');
      const friendsQuery = query(profilesRef, where('id', 'in', userFriendIds));
      const friendsSnapshot = await getDocs(friendsQuery);

      const friendsData: SearchResult[] = [];
      friendsSnapshot.forEach((doc) => {
        const data = doc.data();
        friendsData.push({
          id: doc.id,
          username: data.username || data.name || 'Unknown',
          name: data.name || 'Unknown User',
          avatar: data.avatar_url,
          country: data.country || 'Unknown',
          city: data.city || 'Unknown',
          lifeScore: data.life_score || 0
        });
      });

      console.log('Loaded friends data:', friendsData);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
      setError('Failed to load friends');
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    if (!user?.id) return;

    try {
      console.log('Loading friend requests for user:', user.id);
      
      // Query friend requests collection
      const requestsRef = collection(db, 'friendRequests');
      const requestsQuery = query(requestsRef, where('recipientId', '==', user.id), where('status', '==', 'pending'));
      const requestsSnapshot = await getDocs(requestsQuery);

      const requests: FriendRequest[] = [];
      requestsSnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          senderId: data.senderId,
          senderUsername: data.senderUsername || data.senderName || 'Unknown',
          senderName: data.senderName || 'Unknown User',
          status: data.status,
          timestamp: data.timestamp?.toDate() || new Date()
        });
      });

      console.log('Loaded friend requests:', requests);
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
      toast.error('Failed to load friend requests');
    }
  };

  const searchUsers = async () => {
    if (!searchUsername.trim()) {
      toast.error('Please enter a username to search');
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      console.log('Searching for username:', searchUsername);

      const profilesRef = collection(db, 'profiles');
      const searchQuery = query(profilesRef, where('username', '==', searchUsername.trim()));
      const searchSnapshot = await getDocs(searchQuery);

      const results: SearchResult[] = [];
      searchSnapshot.forEach((doc) => {
        const data = doc.data();
        // Don't include the current user in search results
        if (doc.id !== user.id) {
          results.push({
            id: doc.id,
            username: data.username || data.name || 'Unknown',
            name: data.name || 'Unknown User',
            avatar: data.avatar_url,
            country: data.country || 'Unknown',
            city: data.city || 'Unknown',
            lifeScore: data.life_score || 0
          });
        }
      });

      console.log('Search results:', results);
      setSearchResults(results);

      if (results.length === 0) {
        toast.info('No user found with that username');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users');
      toast.error('Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  const sendFriendRequest = async (recipientId: string, recipientUsername: string, recipientName: string) => {
    if (!user?.id) return;

    try {
      console.log('Sending friend request to:', recipientId);

      // Check if already friends
      if (user.friends?.includes(recipientId)) {
        toast.error('You are already friends with this user');
        return;
      }

      // Check if request already exists
      const requestsRef = collection(db, 'friendRequests');
      const existingQuery = query(
        requestsRef, 
        where('senderId', '==', user.id), 
        where('recipientId', '==', recipientId),
        where('status', '==', 'pending')
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        toast.error('Friend request already sent');
        return;
      }

      // Create friend request
      await addDoc(requestsRef, {
        senderId: user.id,
        senderUsername: user.name, // Using name as username for now
        senderName: user.name,
        recipientId,
        recipientUsername,
        recipientName,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      toast.success(`Friend request sent to ${recipientName}!`);
      
      // Remove from search results
      setSearchResults(prev => prev.filter(result => result.id !== recipientId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const handleFriendRequest = async (requestId: string, senderId: string, action: 'accept' | 'decline') => {
    if (!user?.id) return;

    try {
      console.log(`${action}ing friend request:`, requestId);

      if (action === 'accept') {
        // Add each other as friends
        const userRef = doc(db, 'profiles', user.id);
        const senderRef = doc(db, 'profiles', senderId);

        await updateDoc(userRef, {
          friends: arrayUnion(senderId)
        });

        await updateDoc(senderRef, {
          friends: arrayUnion(user.id)
        });

        // Update local user state
        updateUser({ friends: [...(user.friends || []), senderId] });

        toast.success('Friend request accepted!');
        
        // Reload friends data
        loadFriendsData();
      } else {
        toast.info('Friend request declined');
      }

      // Delete the friend request
      const requestRef = doc(db, 'friendRequests', requestId);
      await deleteDoc(requestRef);

      // Remove from local state
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      toast.error(`Failed to ${action} friend request`);
    }
  };

  const sendReaction = async (friendId: string, reactionType: string) => {
    if (!user?.id) return;

    try {
      console.log('Sending reaction:', reactionType, 'to:', friendId);

      // Create notification for the friend
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        recipientId: friendId,
        senderId: user.id,
        senderName: user.name,
        type: 'reaction',
        emoji: reactionType,
        message: `${user.name} reacted with ${reactionType}`,
        timestamp: serverTimestamp(),
        read: false
      });

      const reaction = reactions.find(r => r.id === reactionType);
      triggerEmojiConfetti(reactionType);
      toast.success(`${reaction?.label} sent!`);
    } catch (error) {
      console.error('Error sending reaction:', error);
      toast.error('Failed to send reaction');
    }
  };

  const handleUserClick = (selectedUser: SearchResult) => {
    // Convert SearchResult to User type for the modal
    const userForModal: User = {
      id: selectedUser.id,
      name: selectedUser.name,
      email: `${selectedUser.username}@example.com`, // Mock email
      avatar: selectedUser.avatar,
      country: selectedUser.country,
      city: selectedUser.city,
      lifeScore: selectedUser.lifeScore,
      wealth: { salary: 0, savings: 0, investments: 0, currency: 'USD', total: 0 },
      knowledge: { education: '', certificates: [], languages: [], total: 0 },
      assets: [],
      badges: [],
      friends: [],
      createdAt: new Date(),
      lastActive: new Date(),
      role: 'user'
    };
    setSelectedUser(selectedUser);
  };

  if (loading && friends.length === 0) {
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
          <p className="text-gray-300 mt-2 text-sm md:text-base">
            {friends.length} friends connected • Connect and compete with friends!
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-900/20 border-red-500/30">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

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
              {tab.id === 'requests' && friendRequests.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {friendRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-4 md:space-y-6">
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {friends.map((friend) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                      <p className="text-xs md:text-sm text-gray-400 mb-2">@{friend.username}</p>
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
                            onClick={() => sendReaction(friend.id, reaction.id)}
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
                
                <p className="text-gray-400 leading-relaxed mb-6">
                  Find friends by searching for their username!
                </p>

                <Button 
                  onClick={() => setActiveTab('search')}
                  className="bg-gradient-to-r from-purple-500 to-pink-600"
                  icon={UserPlus}
                >
                  Find Friends
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-4 md:space-y-6">
          {/* Search Section */}
          <Card className="p-4 md:p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center">
              <Search className="w-5 h-5 md:w-6 md:h-6 text-blue-400 mr-2" />
              Find Friend by Username
            </h2>
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                />
              </div>
              <Button 
                onClick={searchUsers} 
                icon={Search} 
                disabled={searchLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-sm md:text-base"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {searchResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4 md:p-6 hover:shadow-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80">
                    <div className="text-center">
                      <div className="relative mb-3 md:mb-4">
                        <div 
                          className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => handleUserClick(result)}
                        >
                          {result.avatar ? (
                            <img
                              src={result.avatar}
                              alt={result.name}
                              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white"
                            />
                          ) : (
                            <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
                          )}
                        </div>
                      </div>
                      
                      <h3 
                        className="font-bold text-white mb-1 text-base md:text-lg cursor-pointer hover:text-blue-300 transition-colors"
                        onClick={() => handleUserClick(result)}
                      >
                        {result.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-2">@{result.username}</p>
                      <p className="text-xs md:text-sm text-gray-400 mb-2">{result.city}, {result.country}</p>
                      
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-3 mb-3 md:mb-4">
                        <div className="text-blue-400 font-bold text-lg md:text-xl mb-1">
                          {formatNumber(result.lifeScore)} XP
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => sendFriendRequest(result.id, result.username, result.name)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                        icon={UserPlus}
                      >
                        Add Friend
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {searchUsername && searchResults.length === 0 && !searchLoading && (
            <Card className="p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  No user found
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  No user found with username "{searchUsername}". Try a different username.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {friendRequests.length > 0 ? (
            <div className="space-y-4">
              {friendRequests.map((request) => (
                <Card key={request.id} className="p-4 md:p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base md:text-lg">{request.senderName}</h3>
                        <p className="text-sm text-gray-400">@{request.senderUsername}</p>
                        <p className="text-xs text-gray-500">
                          {request.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleFriendRequest(request.id, request.senderId, 'accept')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        icon={Check}
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleFriendRequest(request.id, request.senderId, 'decline')}
                        size="sm"
                        variant="secondary"
                        icon={X}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 md:p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">No Friend Requests</h3>
              <p className="text-gray-400 text-sm md:text-base">You're all caught up! No pending friend requests.</p>
            </Card>
          )}
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={{
            id: selectedUser.id,
            name: selectedUser.name,
            email: `${selectedUser.username}@example.com`,
            avatar: selectedUser.avatar,
            country: selectedUser.country,
            city: selectedUser.city,
            lifeScore: selectedUser.lifeScore,
            wealth: { salary: 0, savings: 0, investments: 0, currency: 'USD', total: 0 },
            knowledge: { education: '', certificates: [], languages: [], total: 0 },
            assets: [],
            badges: [],
            friends: [],
            createdAt: new Date(),
            lastActive: new Date(),
            role: 'user'
          }}
          currentUser={user}
          onAddFriend={() => {}}
          isFriend={user.friends?.includes(selectedUser.id) || false}
        />
      )}
    </div>
  );
};

export default Friends;