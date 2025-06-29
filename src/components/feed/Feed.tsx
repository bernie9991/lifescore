import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  MessageCircle, 
  Trophy, 
  TrendingUp, 
  Award,
  Users,
  UserPlus,
  Eye,
  Sprout,
  CheckCircle,
  MapPin,
  Clock,
  Laugh,
  Angry,
  Clapperboard as Clap,
  Heart,
  Plus,
  Target,
  Crown,
  Zap,
  Globe,
  Star,
  Calendar,
  Send,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { User } from '../../types';
import { formatNumber, triggerEmojiConfetti } from '../../utils/animations';
import Card from '../common/Card';
import Button from '../common/Button';
import UserProfileModal from '../modals/UserProfileModal';
import ChallengeModal from '../modals/ChallengeModal';
import DynamicFactsPanel from '../dashboard/DynamicFactsPanel';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface FeedProps {
  user: User;
}

interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  city: string;
  country: string;
  badge?: { icon: string; name: string };
  type: 'badge-earned' | 'rank-change' | 'goal-completed' | 'certificate-added' | 'item-added' | 'income-update';
  title: string;
  subtitle: string;
  smartStat?: string;
  xpEarned?: number;
  currentRank?: number;
  isSelfDeclared: boolean;
  seedCount: number;
  seededBy: string[];
  isVerified: boolean;
  isAdminVerified: boolean;
  createdAt: Date;
  reactions: Record<string, number>;
  visual?: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  likes: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  participants: number;
  reward: string;
  endDate: Date;
  leaderboard: Array<{
    rank: number;
    name: string;
    score: number;
    avatar?: string;
  }>;
}

interface PopularLeaderboard {
  id: string;
  title: string;
  description: string;
  category: string;
  participants: number;
  topUsers: Array<{
    rank: number;
    name: string;
    score: number;
    avatar?: string;
  }>;
}

interface FeedItem {
  id: string;
  type: 'post' | 'challenge' | 'leaderboard';
  data: FeedPost | Challenge | PopularLeaderboard;
  createdAt: Date;
}

const Feed: React.FC<FeedProps> = ({ user }) => {
  const [filter, setFilter] = useState('all');
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [seededPosts, setSeededPosts] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [friends, setFriends] = useState<Set<string>>(new Set(user.friends || []));
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const reactions = [
    { id: 'haha', type: 'haha', icon: Laugh, label: 'Haha', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20 border-yellow-400/40' },
    { id: 'angry', type: 'angry', icon: Angry, label: 'Angry', color: 'text-red-400', bgColor: 'bg-red-400/20 border-red-400/40' },
    { id: 'applause', type: 'applause', icon: Clap, label: 'Applause', color: 'text-green-400', bgColor: 'bg-green-400/20 border-green-400/40' },
    { id: 'kudos', type: 'kudos', icon: Heart, label: 'Kudos', color: 'text-pink-400', bgColor: 'bg-pink-400/20 border-pink-400/40' }
  ];

  // Load real feed data from Supabase
  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = async () => {
    try {
      setLoading(true);
      
      // For now, we'll show an empty feed since there's no real activity data yet
      // In the future, this would query actual user activities from the database
      setFeedPosts([]);
      
    } catch (error) {
      console.error('Error loading feed data:', error);
      setFeedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All Activity' },
    { id: 'friends', label: 'Friends Only' },
    { id: 'badges', label: 'Badge Unlocks' },
    { id: 'rankings', label: 'Rank Changes' },
  ];

  const handleReaction = (postId: string, reactionType: string) => {
    const currentReaction = userReactions[postId];
    
    if (currentReaction === reactionType) {
      // Remove reaction if clicking the same one
      setUserReactions(prev => {
        const newReactions = { ...prev };
        delete newReactions[postId];
        return newReactions;
      });
    } else {
      // Set new reaction
      setUserReactions(prev => ({
        ...prev,
        [postId]: reactionType
      }));
      
      // Trigger emoji confetti
      triggerEmojiConfetti(reactionType);
      
      const reaction = reactions.find(r => r.id === reactionType);
      toast.success(`${reaction?.label} reaction sent! 🎉`);
    }
  };

  const handleSeed = (postId: string) => {
    const newSeededPosts = new Set(seededPosts);
    if (newSeededPosts.has(postId)) {
      newSeededPosts.delete(postId);
      toast.success('Seed removed');
    } else {
      newSeededPosts.add(postId);
      toast.success('Post seeded! Thanks for verifying! 🌱');
    }
    setSeededPosts(newSeededPosts);
  };

  const handleAddFriend = (userId: string) => {
    if (friends.has(userId)) {
      toast.error('Already friends!');
      return;
    }

    if (friendRequests.has(userId)) {
      toast.error('Friend request already sent!');
      return;
    }

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

    triggerEmojiConfetti('applause');
    toast.success('Friend request sent! 🎉');
  };

  const handleUserClick = (post: FeedPost) => {
    // Create a mock user object from post data
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
  };

  const handleJoinChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleJoinLeaderboard = (leaderboard: PopularLeaderboard) => {
    toast.success(`Joined ${leaderboard.title}! 🎉`);
    triggerEmojiConfetti('applause');
  };

  const handleToggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleAddComment = (postId: string) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: commentText,
      createdAt: new Date(),
      likes: 0
    };

    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setNewComments(prev => ({
      ...prev,
      [postId]: ''
    }));

    toast.success('Comment added! 💬');
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
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
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <div className="text-gray-300">Loading feed...</div>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Global Standing Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DynamicFactsPanel user={user} />
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg overflow-x-auto">
        {filters.map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-3 md:px-4 py-2 rounded-md whitespace-nowrap transition-colors text-sm ${
              filter === filterOption.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Empty Feed State */}
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
            No feed events yet
          </h3>
          
          <p className="text-gray-400 mb-8 leading-relaxed">
            Start your LifeScore journey! Update your profile, add assets, or earn badges to see activity in your feed.
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

      {/* Challenge Modal */}
      {selectedChallenge && (
        <ChallengeModal
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          challenge={selectedChallenge}
          onJoin={() => {
            toast.success(`Joined ${selectedChallenge.title}! 🎉`);
            triggerEmojiConfetti('applause');
            setSelectedChallenge(null);
          }}
        />
      )}
    </div>
  );
};

export default Feed;