import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  MapPin,
  Clock,
  UserPlus,
  Laugh,
  Angry,
  Clap,
  Heart,
  MessageCircle,
  Sprout,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { formatNumber, triggerEmojiConfetti } from '../../utils/animations';
import Button from '../common/Button';
import Card from '../common/Card';

interface FeedItemCardProps {
  avatar: string;
  username: string;
  content: string;
  timestamp: Date;
  metadata?: {
    city?: string;
    country?: string;
    badge?: { icon: string; name: string };
    xpEarned?: number;
    smartStat?: string;
  };
  reactions?: Record<string, string[]>;
  comments?: Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    timestamp: Date;
  }>;
  onReaction?: (type: string) => void;
  onComment?: (content: string) => void;
  onSeed?: () => void;
  onUserClick?: () => void;
  onAddFriend?: () => void;
  currentUserId: string;
  isFriend?: boolean;
  canSeed?: boolean;
  seedCount?: number;
  isSeeded?: boolean;
}

const FeedItemCard: React.FC<FeedItemCardProps> = ({
  avatar,
  username,
  content,
  timestamp,
  metadata = {},
  reactions = {},
  comments = [],
  onReaction,
  onComment,
  onSeed,
  onUserClick,
  onAddFriend,
  currentUserId,
  isFriend = false,
  canSeed = false,
  seedCount = 0,
  isSeeded = false
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const reactionTypes = [
    { id: 'haha', icon: Laugh, label: 'Haha', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20 border-yellow-400/40', emoji: '😂' },
    { id: 'angry', icon: Angry, label: 'Angry', color: 'text-red-400', bgColor: 'bg-red-400/20 border-red-400/40', emoji: '😠' },
    { id: 'applause', icon: Clap, label: 'Applause', color: 'text-green-400', bgColor: 'bg-green-400/20 border-green-400/40', emoji: '👏' },
    { id: 'kudos', icon: Heart, label: 'Kudos', color: 'text-pink-400', bgColor: 'bg-pink-400/20 border-pink-400/40', emoji: '❤️' }
  ];

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

  const handleReaction = useCallback((type: string) => {
    onReaction?.(type);
    triggerEmojiConfetti(type);
  }, [onReaction]);

  const handleAddComment = useCallback(() => {
    if (newComment.trim()) {
      onComment?.(newComment.trim());
      setNewComment('');
    }
  }, [newComment, onComment]);

  const getReactionCount = useCallback((type: string) => {
    return reactions[type]?.length || 0;
  }, [reactions]);

  const hasUserReacted = useCallback((type: string) => {
    return reactions[type]?.includes(currentUserId) || false;
  }, [reactions, currentUserId]);

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onUserClick}
          role="button"
          tabIndex={0}
          aria-label={`View ${username}'s profile`}
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {avatar ? (
              <img
                src={avatar}
                alt={username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <Users className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-white hover:text-blue-300 transition-colors">
              {username}
            </h3>
            {(metadata.city || metadata.country) && (
              <div className="flex items-center text-gray-400 text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {metadata.city}, {metadata.country}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-gray-400 text-sm flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {getTimeAgo(timestamp)}
          </div>
          
          {/* Add Friend Button */}
          {onAddFriend && (
            <Button
              variant="ghost"
              size="sm"
              icon={UserPlus}
              onClick={onAddFriend}
              disabled={isFriend}
              className={`text-xs ${
                isFriend 
                  ? 'text-green-400 cursor-default' 
                  : 'text-blue-400 hover:text-blue-300'
              }`}
              aria-label={isFriend ? 'Already friends' : 'Add friend'}
            >
              {isFriend ? 'Friends' : 'Add'}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-300 mb-2">{content}</p>
        {metadata.smartStat && (
          <div className="text-blue-400 font-semibold">{metadata.smartStat}</div>
        )}
        {metadata.xpEarned && (
          <div className="text-yellow-400 font-semibold">+{formatNumber(metadata.xpEarned)} XP</div>
        )}
      </div>

      {/* Badge Display */}
      {metadata.badge && (
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/40 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{metadata.badge.icon}</span>
            <div>
              <div className="font-bold text-yellow-400">{metadata.badge.name}</div>
              <div className="text-yellow-300 text-sm">Badge Unlocked!</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        {/* Reactions */}
        <div className="flex items-center space-x-2">
          {reactionTypes.map((reaction) => {
            const count = getReactionCount(reaction.id);
            const hasReacted = hasUserReacted(reaction.id);
            
            return (
              <button
                key={reaction.id}
                onClick={() => handleReaction(reaction.id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all hover:scale-105 ${
                  hasReacted 
                    ? `${reaction.bgColor} ${reaction.color} border` 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                aria-label={`${reaction.label} reaction${count > 0 ? ` (${count})` : ''}`}
              >
                <reaction.icon className="w-4 h-4" />
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Seed and Comments */}
        <div className="flex items-center space-x-3">
          {/* Seed Button */}
          {canSeed && onSeed && (
            <button
              onClick={onSeed}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all ${
                isSeeded
                  ? 'bg-green-500/20 text-green-400 border border-green-400/40'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-label={`${isSeeded ? 'Remove seed' : 'Seed post'} (${seedCount} seeds)`}
            >
              <Sprout className="w-4 h-4" />
              <span>{seedCount}</span>
            </button>
          )}

          {/* Comments Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
            aria-label={`${showComments ? 'Hide' : 'Show'} comments (${comments.length})`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length}</span>
            {showComments ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-700"
        >
          {/* Add Comment */}
          <div className="flex space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                aria-label="Add a comment"
              />
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                icon={Send}
                aria-label="Send comment"
              >
                Send
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
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
    </Card>
  );
};

export default FeedItemCard;