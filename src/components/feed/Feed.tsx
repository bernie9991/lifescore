import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, MessageCircle, Trophy, TrendingUp, Award, Users, UserPlus, Eye, Sprout, CheckCircle, MapPin, Clock, Laugh, Angry, Clapperboard as Clap, Heart, Plus, Target, Crown, Zap, Globe, Star, Calendar, Send, ChevronDown, ChevronUp, RefreshCw, Loader2 } from 'lucide-react';
import { User } from '../../types';
import { formatNumber, triggerEmojiConfetti } from '../../utils/animations';
import Card from '../common/Card';
import Button from '../common/Button';
import UserProfileModal from '../modals/UserProfileModal';
import ChallengeModal from '../modals/ChallengeModal';
import DynamicFactsPanel from '../dashboard/DynamicFactsPanel';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import toast from 'react-hot-toast';

interface FeedProps {
  user: User;
}

interface FeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  city: string;
  country: string;
  badge?: { icon: string; name: string };
  type: 'badge-earned' | 'rank-change' | 'goal-completed' | 'certificate-added' | 'item-added' | 'income-update' | 'profile-update' | 'achievement';
  title: string;
  subtitle: string;
  content: string;
  smartStat?: string;
  xpEarned?: number;
  currentRank?: number;
  isSelfDeclared: boolean;
  seedCount: number;
  seededBy: string[];
  isVerified: boolean;
  isAdminVerified: boolean;
  timestamp: Date;
  reactions: Record<string, string[]>; // reaction type -> array of user IDs
  visual?: string;
  comments: Comment[];
  metadata?: any;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
}

interface ReactionType {
  id: string;
  type: string;
  icon: React.ComponentType<any>;
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
}

const Feed: React.FC<FeedProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [seededPosts, setSeededPosts] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Set<string>>(new Set(user.friends || []));
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Refs for infinite scroll
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  // Cache for feed items
  const feedCacheRef = useRef<Map<string, FeedItem[]>>(new Map());

  const reactions: ReactionType[] = [
    { id: 'haha', type: 'haha', icon: Laugh, label: 'Haha', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20 border-yellow-400/40', emoji: '😂' },
    { id: 'angry', type: 'angry', icon: Angry, label: 'Angry', color: 'text-red-400', bgColor: 'bg-red-400/20 border-red-400/40', emoji: '😠' },
    { id: 'applause', type: 'applause', icon: Clap, label: 'Applause', color: 'text-green-400', bgColor: 'bg-green-400/20 border-green-400/40', emoji: '👏' },
    { id: 'kudos', type: 'kudos', icon: Heart, label: 'Kudos', color: 'text-pink-400', bgColor: 'bg-pink-400/20 border-pink-400/40', emoji: '❤️' }
  ];

  // Load feed data with pagination
  const loadFeedData = useCallback(async (isRefresh = false, isLoadMore = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setError(null);
      } else if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      // Check cache first for initial load
      const cacheKey = `${activeTab}-${user.id}`;
      if (!isRefresh && !isLoadMore && feedCacheRef.current.has(cacheKey)) {
        const cachedItems = feedCacheRef.current.get(cacheKey)!;
        setFeedItems(cachedItems);
        setLoading(false);
        return;
      }

      let feedQuery;
      
      if (activeTab === 'friends') {
        // Get user's friends list
        const userDoc = await getDoc(doc(db, 'users', user.id));
        const userData = userDoc.data();
        const friendIds = [...(userData?.friends || []), user.id]; // Include current user
        
        if (friendIds.length === 0) {
          setFeedItems([]);
          setHasMore(false);
          return;
        }

        // Query feed items from friends
        feedQuery = query(
          collection(db, 'feedItems'),
          where('userId', 'in', friendIds.slice(0, 10)), // Firestore 'in' limit is 10
          orderBy('timestamp', 'desc'),
          limit(20)
        );
      } else {
        // Global feed query
        feedQuery = query(
          collection(db, 'feedItems'),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
      }

      // Add pagination for load more
      if (isLoadMore && lastDoc) {
        feedQuery = query(
          collection(db, 'feedItems'),
          orderBy('timestamp', 'desc'),
          startAfter(lastDoc),
          limit(20)
        );
      }

      const querySnapshot = await getDocs(feedQuery);
      const items: FeedItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          city: data.city || 'Unknown',
          country: data.country || 'Unknown',
          badge: data.badge,
          type: data.type,
          title: data.title,
          subtitle: data.subtitle,
          content: data.content,
          smartStat: data.smartStat,
          xpEarned: data.xpEarned,
          currentRank: data.currentRank,
          isSelfDeclared: data.isSelfDeclared || false,
          seedCount: data.seedCount || 0,
          seededBy: data.seededBy || [],
          isVerified: data.isVerified || false,
          isAdminVerified: data.isAdminVerified || false,
          timestamp: data.timestamp?.toDate() || new Date(),
          reactions: data.reactions || {},
          visual: data.visual,
          comments: data.comments || [],
          metadata: data.metadata
        });
      });

      if (isRefresh || !isLoadMore) {
        setFeedItems(items);
        // Cache the results
        feedCacheRef.current.set(cacheKey, items);
      } else {
        setFeedItems(prev => [...prev, ...items]);
      }

      // Update pagination state
      setHasMore(querySnapshot.docs.length === 20);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);

    } catch (error) {
      console.error('Error loading feed data:', error);
      setError('Failed to load feed. Please try again.');
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [activeTab, user.id, lastDoc]);

  // Initial load and tab change
  useEffect(() => {
    setLastDoc(null);
    setHasMore(true);
    loadFeedData();
  }, [activeTab, user.id]);

  // Infinite scroll setup
  useEffect(() => {
    if (!loadMoreTriggerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
          loadFeedData(false, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    observerRef.current.observe(loadMoreTriggerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadingMore, loadFeedData]);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setLastDoc(null);
    setHasMore(true);
    loadFeedData(true);
  }, [loadFeedData]);

  // Handle reactions
  const handleReaction = useCallback(async (postId: string, reactionType: string) => {
    const currentReaction = userReactions[postId];
    
    try {
      const postRef = doc(db, 'feedItems', postId);
      
      if (currentReaction === reactionType) {
        // Remove reaction
        await updateDoc(postRef, {
          [`reactions.${reactionType}`]: arrayRemove(user.id)
        });
        setUserReactions(prev => {
          const newReactions = { ...prev };
          delete newReactions[postId];
          return newReactions;
        });
      } else {
        // Add new reaction (remove old one if exists)
        const updates: any = {
          [`reactions.${reactionType}`]: arrayUnion(user.id)
        };
        
        if (currentReaction) {
          updates[`reactions.${currentReaction}`] = arrayRemove(user.id);
        }
        
        await updateDoc(postRef, updates);
        setUserReactions(prev => ({
          ...prev,
          [postId]: reactionType
        }));
        
        // Trigger emoji confetti
        const reaction = reactions.find(r => r.id === reactionType);
        if (reaction) {
          triggerEmojiConfetti(reactionType);
          toast.success(`${reaction.emoji} reaction sent!`);
        }
      }

      // Update local state
      setFeedItems(prev => prev.map(item => {
        if (item.id === postId) {
          const newReactions = { ...item.reactions };
          
          if (currentReaction === reactionType) {
            // Remove reaction
            newReactions[reactionType] = (newReactions[reactionType] || []).filter(id => id !== user.id);
          } else {
            // Add new reaction
            if (currentReaction) {
              newReactions[currentReaction] = (newReactions[currentReaction] || []).filter(id => id !== user.id);
            }
            newReactions[reactionType] = [...(newReactions[reactionType] || []), user.id];
          }
          
          return { ...item, reactions: newReactions };
        }
        return item;
      }));

    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    }
  }, [userReactions, user.id, reactions]);

  // Handle seeding (verification)
  const handleSeed = useCallback(async (postId: string) => {
    try {
      const postRef = doc(db, 'feedItems', postId);
      const isSeeded = seededPosts.has(postId);
      
      if (isSeeded) {
        await updateDoc(postRef, {
          seededBy: arrayRemove(user.id),
          seedCount: Math.max(0, feedItems.find(item => item.id === postId)?.seedCount || 0 - 1)
        });
        setSeededPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        toast.success('Seed removed');
      } else {
        await updateDoc(postRef, {
          seededBy: arrayUnion(user.id),
          seedCount: (feedItems.find(item => item.id === postId)?.seedCount || 0) + 1
        });
        setSeededPosts(prev => new Set([...prev, postId]));
        toast.success('Post seeded! Thanks for verifying! 🌱');
      }

      // Update local state
      setFeedItems(prev => prev.map(item => {
        if (item.id === postId) {
          return {
            ...item,
            seedCount: isSeeded ? Math.max(0, item.seedCount - 1) : item.seedCount + 1,
            seededBy: isSeeded 
              ? item.seededBy.filter(id => id !== user.id)
              : [...item.seededBy, user.id]
          };
        }
        return item;
      }));

    } catch (error) {
      console.error('Error updating seed:', error);
      toast.error('Failed to update verification');
    }
  }, [seededPosts, user.id, feedItems]);

  // Handle add friend
  const handleAddFriend = useCallback(async (userId: string) => {
    if (userId === user.id) {
      toast.error('You cannot add yourself as a friend!');
      return;
    }

    if (friends.has(userId)) {
      toast.error('Already friends!');
      return;
    }

    if (friendRequests.has(userId)) {
      toast.error('Friend request already sent!');
      return;
    }

    try {
      // Add to friend requests collection
      await addDoc(collection(db, 'users', userId, 'friendRequests'), {
        senderId: user.id,
        senderUsername: user.username || user.name,
        senderDisplayName: user.name,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      setFriendRequests(prev => new Set([...prev, userId]));
      
      setTimeout(() => {
        setFriends(prev => new Set([...prev, userId]));
        setFriendRequests(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        toast.success('Friend request accepted! 🎉');
      }, 1500);

      toast.success('Friend request sent! 🎉');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  }, [user, friends, friendRequests]);

  // Handle user click
  const handleUserClick = useCallback((post: FeedItem) => {
    const mockUser: User = {
      id: post.userId,
      uid: post.userId,
      name: post.userName,
      email: `${post.userName.toLowerCase().replace(' ', '.')}@example.com`,
      avatar: post.userAvatar,
      country: post.country,
      city: post.city,
      lifeScore: Math.floor(Math.random() * 10000) + 5000,
      username: `${post.userName.toLowerCase().replace(' ', '')}${Math.floor(Math.random() * 1000)}`,
      isRealNameVisible: true,
      wealth: {
        salary: Math.floor(Math.random() * 100000) + 50000,
        savings: Math.floor(Math.random() * 50000) + 10000,
        investments: Math.floor(Math.random() * 30000) + 5000,
        currency: 'USD',
        total: Math.floor(Math.random() * 200000) + 100000
      },
      knowledge: {
        education: 'Bachelor\'s Degree',
        certificates: ['Professional Certificate'],
        languages: ['English'],
        total: Math.floor(Math.random() * 1000) + 500
      },
      assets: [],
      badges: [],
      friends: [],
      createdAt: new Date('2024-01-01'),
      lastActive: new Date(),
      role: 'user'
    };
    
    setSelectedUser(mockUser);
  }, []);

  // Handle comment toggle
  const handleToggleComments = useCallback((postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  // Handle add comment
  const handleAddComment = useCallback(async (postId: string) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

    try {
      const newComment: Comment = {
        id: `c${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: commentText,
        timestamp: new Date(),
        likes: 0
      };

      // Update Firestore
      const postRef = doc(db, 'feedItems', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });

      // Update local state
      setFeedItems(prev => prev.map(item => {
        if (item.id === postId) {
          return { ...item, comments: [...item.comments, newComment] };
        }
        return item;
      }));

      setNewComments(prev => ({
        ...prev,
        [postId]: ''
      }));

      toast.success('Comment added! 💬');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  }, [newComments, user]);

  // Get time ago
  const getTimeAgo = useCallback((date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const days = Math.floor(diffInHours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return date.toLocaleDateString();
  }, []);

  // Get reaction count
  const getReactionCount = useCallback((reactions: Record<string, string[]>, type: string) => {
    return reactions[type]?.length || 0;
  }, []);

  // Check if user reacted
  const hasUserReacted = useCallback((reactions: Record<string, string[]>, type: string) => {
    return reactions[type]?.includes(user.id) || false;
  }, [user.id]);

  // Show seed button only for friends and own posts
  const shouldShowSeedButton = useCallback((post: FeedItem) => {
    return post.userId === user.id || friends.has(post.userId);
  }, [user.id, friends]);

  if (loading && feedItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              📱 Activity Feed
            </h1>
            <p className="text-gray-300 mt-2 text-sm md:text-base">Stay updated with achievements, challenges, and leaderboards</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <div className="text-gray-300">Loading feed...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={feedContainerRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            📱 Activity Feed
          </h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base">Stay updated with achievements, challenges, and leaderboards</p>
        </div>
        
        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-gray-400 hover:text-white"
          icon={refreshing ? Loader2 : RefreshCw}
          aria-label="Refresh feed"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Global Standing Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DynamicFactsPanel user={user} />
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
            activeTab === 'global'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
          aria-label="Global feed"
        >
          <Globe className="w-4 h-4" />
          <span>Global</span>
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
            activeTab === 'friends'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
          aria-label="Friends feed"
        >
          <Users className="w-4 h-4" />
          <span>Friends</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-red-900/20 border-red-500/30">
          <div className="text-center">
            <div className="text-red-400 mb-2">⚠️ {error}</div>
            <Button onClick={() => loadFeedData()} variant="secondary" size="sm">
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Feed Content */}
      {feedItems.length > 0 ? (
        <div className="space-y-6">
          <AnimatePresence>
            {feedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleUserClick(item)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${item.userName}'s profile`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        {item.userAvatar ? (
                          <img
                            src={item.userAvatar}
                            alt={item.userName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white hover:text-blue-300 transition-colors">
                          {item.userName}
                        </h3>
                        <div className="flex items-center text-gray-400 text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.city}, {item.country}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-gray-400 text-sm flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {getTimeAgo(item.timestamp)}
                      </div>
                      
                      {/* Add Friend Button */}
                      {item.userId !== user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={UserPlus}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddFriend(item.userId);
                          }}
                          disabled={friends.has(item.userId) || friendRequests.has(item.userId)}
                          className={`text-xs ${
                            friends.has(item.userId) 
                              ? 'text-green-400 cursor-default' 
                              : friendRequests.has(item.userId)
                              ? 'text-gray-400 cursor-default'
                              : 'text-blue-400 hover:text-blue-300'
                          }`}
                          aria-label={
                            friends.has(item.userId) ? 'Already friends' :
                            friendRequests.has(item.userId) ? 'Request sent' :
                            'Add friend'
                          }
                        >
                          {friends.has(item.userId) ? 'Friends' :
                           friendRequests.has(item.userId) ? 'Sent' : 'Add'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-300 mb-2">{item.content}</p>
                    {item.smartStat && (
                      <div className="text-blue-400 font-semibold">{item.smartStat}</div>
                    )}
                    {item.xpEarned && (
                      <div className="text-yellow-400 font-semibold">+{formatNumber(item.xpEarned)} XP</div>
                    )}
                  </div>

                  {/* Badge Display */}
                  {item.badge && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/40 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{item.badge.icon}</span>
                        <div>
                          <div className="font-bold text-yellow-400">{item.badge.name}</div>
                          <div className="text-yellow-300 text-sm">Badge Unlocked!</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    {/* Reactions */}
                    <div className="flex items-center space-x-2">
                      {reactions.map((reaction) => {
                        const count = getReactionCount(item.reactions, reaction.type);
                        const hasReacted = hasUserReacted(item.reactions, reaction.type);
                        
                        return (
                          <button
                            key={reaction.id}
                            onClick={() => handleReaction(item.id, reaction.type)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all hover:scale-105 ${
                              hasReacted 
                                ? `${reaction.bgColor} ${reaction.color} border` 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            aria-label={`${reaction.label} reaction${count > 0 ? ` (${count})` : ''}`}
                          >
                            <reaction.icon className="w-4 h-4" />
                            <span>{count > 0 ? count : ''}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Seed and Comments */}
                    <div className="flex items-center space-x-3">
                      {/* Seed Button (only for friends and own posts) */}
                      {shouldShowSeedButton(item) && (
                        <button
                          onClick={() => handleSeed(item.id)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all ${
                            seededPosts.has(item.id)
                              ? 'bg-green-500/20 text-green-400 border border-green-400/40'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                          aria-label={`${seededPosts.has(item.id) ? 'Remove seed' : 'Seed post'} (${item.seedCount} seeds)`}
                        >
                          <Sprout className="w-4 h-4" />
                          <span>{item.seedCount}</span>
                        </button>
                      )}

                      {/* Comments Button */}
                      <button
                        onClick={() => handleToggleComments(item.id)}
                        className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                        aria-label={`${expandedComments.has(item.id) ? 'Hide' : 'Show'} comments (${item.comments.length})`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{item.comments.length}</span>
                        {expandedComments.has(item.id) ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {expandedComments.has(item.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-700"
                      >
                        {/* Add Comment */}
                        <div className="flex space-x-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1 flex space-x-2">
                            <input
                              type="text"
                              value={newComments[item.id] || ''}
                              onChange={(e) => setNewComments(prev => ({
                                ...prev,
                                [item.id]: e.target.value
                              }))}
                              placeholder="Add a comment..."
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(item.id)}
                              aria-label="Add a comment"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddComment(item.id)}
                              disabled={!newComments[item.id]?.trim()}
                              icon={Send}
                              aria-label="Send comment"
                            >
                              Send
                            </Button>
                          </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3">
                          {item.comments.map((comment) => (
                            <div key={comment.id} className="flex space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                {comment.userAvatar ? (
                                  <img
                                    src={comment.userAvatar}
                                    alt={comment.userName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <Users className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-700 rounded-lg p-3">
                                  <div className="font-semibold text-white text-sm">{comment.userName}</div>
                                  <div className="text-gray-300 text-sm">{comment.content}</div>
                                </div>
                                <div className="text-gray-400 text-xs mt-1 ml-3">
                                  {getTimeAgo(comment.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load More Trigger */}
          {hasMore && (
            <div ref={loadMoreTriggerRef} className="flex justify-center py-8">
              {loadingMore ? (
                <div className="flex items-center space-x-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more posts...</span>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">Scroll for more posts</div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Empty Feed State */
        <div className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="w-12 h-12 text-purple-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              {activeTab === 'friends' ? 'No friend activity yet' : 'No feed events yet'}
            </h3>
            
            <p className="text-gray-400 mb-8 leading-relaxed">
              {activeTab === 'friends' 
                ? 'Add friends to see their achievements and updates in your feed.'
                : 'Start your LifeScore journey! Update your profile, add assets, or earn badges to see activity in your feed.'
              }
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Trophy className="w-4 h-4" />
                <span>Earn badges to create feed posts</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>Add friends to see their achievements</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>Update your profile to track progress</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          currentUser={user}
          onAddFriend={handleAddFriend}
          isFriend={friends.has(selectedUser.id)}
        />
      )}
    </div>
  );
};

export default Feed;