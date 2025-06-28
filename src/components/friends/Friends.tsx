import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus, Check, X, Bell, Heart, Laugh, ThumbsUp, Siren as Fire, Smile, Clock } from 'lucide-react';
import { User } from '../../types';
import { formatNumber, triggerEmojiConfetti } from '../../utils/animations';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface FriendsProps {
  user: User;
}

interface SearchResult {
  id: string;
  username: string;
  displayName: string;
  isRealNameVisible: boolean;
  avatar?: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: any;
}

interface Notification {
  id: string;
  type: 'friend_request' | 'emoji_reaction';
  senderId: string;
  senderUsername: string;
  emoji?: string;
  timestamp: any;
  read: boolean;
}

interface FriendData {
  id: string;
  username: string;
  displayName: string;
  isRealNameVisible: boolean;
  avatar?: string;
}

const Friends: React.FC<FriendsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'friends', label: 'My Friends', icon: Users },
    { id: 'search', label: 'Find Friends', icon: Search },
    { id: 'requests', label: 'Requests', icon: Bell },
  ];

  const emojiReactions = [
    { emoji: '😂', label: 'Laugh' },
    { emoji: '👍', label: 'Like' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😊', label: 'Smile' }
  ];

  // Load friends data
  useEffect(() => {
    if (!user?.id) return;

    const loadFriends = async () => {
      try {
        setLoading(true);
        
        // Get user's friends array
        const userDoc = await getDoc(doc(db, 'users', user.id));
        const userData = userDoc.data();
        const friendIds = userData?.friends || [];

        if (friendIds.length === 0) {
          setFriends([]);
          setLoading(false);
          return;
        }

        // Load friend details
        const friendsData: FriendData[] = [];
        for (const friendId of friendIds) {
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          if (friendDoc.exists()) {
            const friendData = friendDoc.data();
            friendsData.push({
              id: friendId,
              username: friendData.username || 'Unknown',
              displayName: friendData.name || 'Unknown User',
              isRealNameVisible: friendData.isRealNameVisible || false,
              avatar: friendData.avatar
            });
          }
        }

        setFriends(friendsData);
      } catch (error) {
        console.error('Error loading friends:', error);
        toast.error('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [user?.id]);

  // Listen for friend requests
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.id, 'friendRequests'),
      (snapshot) => {
        const requests: FriendRequest[] = [];
        snapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() } as FriendRequest);
        });
        setFriendRequests(requests.filter(req => req.status === 'pending'));
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Listen for notifications
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.id, 'notifications'),
      (snapshot) => {
        const notifs: Notification[] = [];
        snapshot.forEach((doc) => {
          notifs.push({ id: doc.id, ...doc.data() } as Notification);
        });
        setNotifications(notifs.filter(notif => !notif.read));
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a username to search');
      return;
    }

    setSearching(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '==', searchTerm.trim())
      );
      
      const querySnapshot = await getDocs(q);
      const results: SearchResult[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id !== user.id) { // Don't include current user
          results.push({
            id: doc.id,
            username: data.username,
            displayName: data.name || 'Unknown User',
            isRealNameVisible: data.isRealNameVisible || false,
            avatar: data.avatar
          });
        }
      });

      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info('No user found with that username');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (recipientId: string, recipientUsername: string) => {
    try {
      // Check if already friends
      const userDoc = await getDoc(doc(db, 'users', user.id));
      const userData = userDoc.data();
      const currentFriends = userData?.friends || [];
      
      if (currentFriends.includes(recipientId)) {
        toast.info('You are already friends with this user');
        return;
      }

      // Check if request already exists
      const existingRequests = query(
        collection(db, 'users', recipientId, 'friendRequests'),
        where('senderId', '==', user.id),
        where('status', '==', 'pending')
      );
      
      const existingSnapshot = await getDocs(existingRequests);
      if (!existingSnapshot.empty) {
        toast.info('Friend request already sent');
        return;
      }

      // Create friend request
      await addDoc(collection(db, 'users', recipientId, 'friendRequests'), {
        senderId: user.id,
        senderUsername: user.username || user.name,
        senderDisplayName: user.name,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      // Create notification
      await addDoc(collection(db, 'users', recipientId, 'notifications'), {
        type: 'friend_request',
        senderId: user.id,
        senderUsername: user.username || user.name,
        timestamp: serverTimestamp(),
        read: false
      });

      toast.success('Friend request sent!');
      
      // Remove from search results
      setSearchResults(prev => prev.filter(result => result.id !== recipientId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const handleAcceptFriendRequest = async (request: FriendRequest) => {
    try {
      // Update request status
      await updateDoc(doc(db, 'users', user.id, 'friendRequests', request.id), {
        status: 'accepted'
      });

      // Add to both users' friends arrays
      const userDocRef = doc(db, 'users', user.id);
      const senderDocRef = doc(db, 'users', request.senderId);

      // Get current friends arrays
      const userDoc = await getDoc(userDocRef);
      const senderDoc = await getDoc(senderDocRef);
      
      const userFriends = userDoc.data()?.friends || [];
      const senderFriends = senderDoc.data()?.friends || [];

      // Update friends arrays
      await updateDoc(userDocRef, {
        friends: [...userFriends, request.senderId]
      });

      await updateDoc(senderDocRef, {
        friends: [...senderFriends, user.id]
      });

      toast.success(`You are now friends with ${request.senderUsername}!`);
      
      // Reload friends list
      window.location.reload(); // Simple reload for now
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };

  const handleDeclineFriendRequest = async (request: FriendRequest) => {
    try {
      await deleteDoc(doc(db, 'users', user.id, 'friendRequests', request.id));
      toast.success('Friend request declined');
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline friend request');
    }
  };

  const handleSendEmoji = async (friendId: string, emoji: string, friendUsername: string) => {
    try {
      // Create notification for the friend
      await addDoc(collection(db, 'users', friendId, 'notifications'), {
        type: 'emoji_reaction',
        senderId: user.id,
        senderUsername: user.username || user.name,
        emoji: emoji,
        timestamp: serverTimestamp(),
        read: false
      });

      triggerEmojiConfetti('applause');
      toast.success(`Sent ${emoji} to ${friendUsername}!`);
    } catch (error) {
      console.error('Error sending emoji:', error);
      toast.error('Failed to send emoji');
    }
  };

  const getDisplayName = (friend: FriendData) => {
    return friend.isRealNameVisible ? friend.displayName : friend.username;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              👥 Friends
            </h1>
            <p className="text-gray-300 mt-2 text-sm md:text-base">Loading...</p>
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
            {friends.length} friends • {friendRequests.length} pending requests • {notifications.length} notifications
          </p>
        </div>
      </div>

      {/* Tabs */}
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
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={getDisplayName(friend)}
                              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white"
                            />
                          ) : (
                            <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-white mb-1 text-base md:text-lg">
                        {getDisplayName(friend)}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 mb-3">@{friend.username}</p>
                      
                      {/* Quick Emoji Reactions */}
                      <div className="flex justify-center space-x-1 md:space-x-2">
                        {emojiReactions.map((reaction) => (
                          <button
                            key={reaction.emoji}
                            onClick={() => handleSendEmoji(friend.id, reaction.emoji, getDisplayName(friend))}
                            className="p-1.5 md:p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all hover:scale-110"
                            title={`Send ${reaction.label}`}
                          >
                            <span className="text-sm md:text-base">{reaction.emoji}</span>
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
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-purple-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  No friends yet
                </h3>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Search for friends by username to start building your network!
                </p>
                
                <Button 
                  onClick={() => setActiveTab('search')}
                  className="bg-gradient-to-r from-purple-500 to-pink-600"
                  icon={Search}
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter username to search"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                icon={Search} 
                disabled={searching}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-sm md:text-base"
              >
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4">Search Results</h3>
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        {result.avatar ? (
                          <img
                            src={result.avatar}
                            alt={result.isRealNameVisible ? result.displayName : result.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {result.isRealNameVisible ? result.displayName : result.username}
                        </h4>
                        <p className="text-sm text-gray-400">@{result.username}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSendFriendRequest(result.id, result.username)}
                      icon={UserPlus}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4 md:space-y-6">
          {/* Friend Requests */}
          {friendRequests.length > 0 ? (
            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4">Friend Requests</h3>
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{request.senderUsername}</h4>
                        <p className="text-sm text-gray-400">sent you a friend request</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleAcceptFriendRequest(request)}
                        icon={Check}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleDeclineFriendRequest(request)}
                        icon={X}
                        size="sm"
                        variant="secondary"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-6 md:p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <Bell className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">No Friend Requests</h3>
              <p className="text-gray-400 text-sm md:text-base">You're all caught up! No pending friend requests.</p>
            </Card>
          )}

          {/* Notifications */}
          {notifications.length > 0 && (
            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Notifications</h3>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center space-x-3 bg-gray-900 p-4 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      {notification.type === 'emoji_reaction' ? (
                        <span className="text-lg">{notification.emoji}</span>
                      ) : (
                        <Bell className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">
                        <span className="font-semibold">{notification.senderUsername}</span>
                        {notification.type === 'emoji_reaction' 
                          ? ` reacted with ${notification.emoji}`
                          : ' sent you a friend request'
                        }
                      </p>
                      <p className="text-xs text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Just now
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;