import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  GraduationCap, 
  DollarSign, 
  Home, 
  Globe, 
  Camera, 
  User, 
  Clock, 
  MapPin, 
  MessageCircle, 
  Sprout, 
  Heart, 
  Laugh, 
  Angry, 
  Clapperboard as Clap,
  ChevronDown,
  ChevronUp,
  Send,
  EyeOff,
  ThumbsUp
} from 'lucide-react';
import { formatNumber, formatCurrency } from '../../utils/animations';
import { formatRelativeTime } from '../../utils/feedUtils';
import Button from '../common/Button';
import Card from '../common/Card';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  likedBy?: string[];
}

interface AutomatedFeedPostProps {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  city: string;
  country: string;
  type: string;
  title: string;
  content: string;
  timestamp: Date;
  metadata?: any;
  badge?: { icon: string; name: string; rarity: string };
  xpEarned?: number;
  reactions: Record<string, string[]>;
  comments: Comment[];
  onUserClick: () => void;
  onReaction: (type: string) => void;
  onComment: (content: string) => void;
  onSeed?: () => void;
  onHidePost?: () => void;
  currentUserId: string;
  isFriend?: boolean;
  canSeed?: boolean;
  seedCount?: number;
  isSeeded?: boolean;
  showComments: boolean;
  onToggleComments: () => void;
  onLikeComment?: (commentId: string) => void;
}

const AutomatedFeedPost: React.FC<AutomatedFeedPostProps> = ({
  id,
  userName,
  userAvatar,
  city,
  country,
  type,
  title,
  content,
  timestamp,
  metadata,
  badge,
  xpEarned,
  reactions,
  comments,
  onUserClick,
  onReaction,
  onComment,
  onSeed,
  onHidePost,
  currentUserId,
  isFriend = false,
  canSeed = false,
  seedCount = 0,
  isSeeded = false,
  showComments,
  onToggleComments,
  onLikeComment
}) => {
  const [newComment, setNewComment] = useState('');

  // Get icon based on update type
  const getUpdateIcon = () => {
    switch (type) {
      case 'badge-earned':
        return <Award className="w-5 h-5 text-yellow-400" />;
      case 'certification-added':
        return <GraduationCap className="w-5 h-5 text-blue-400" />;
      case 'wealth-update':
        return <DollarSign className="w-5 h-5 text-green-400" />;
      case 'asset-added':
        return <Home className="w-5 h-5 text-purple-400" />;
      case 'language-added':
        return <Globe className="w-5 h-5 text-cyan-400" />;
      case 'profile-picture':
        return <Camera className="w-5 h-5 text-pink-400" />;
      case 'education-update':
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      default:
        return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get background color based on update type
  const getUpdateBackground = () => {
    switch (type) {
      case 'badge-earned':
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
      case 'certification-added':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30';
      case 'wealth-update':
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30';
      case 'asset-added':
        return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30';
      case 'language-added':
        return 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/30';
      case 'profile-picture':
        return 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-400/30';
      case 'education-update':
        return 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-400/30';
      default:
        return 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-gray-600';
    }
  };

  // Get reaction count
  const getReactionCount = (type: string) => {
    return reactions[type]?.length || 0;
  };

  // Check if user reacted
  const hasUserReacted = (type: string) => {
    return reactions[type]?.includes(currentUserId) || false;
  };

  // Handle comment submission
  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onComment(newComment);
      setNewComment('');
    }
  };

  // Check if user has liked a comment
  const hasUserLikedComment = (comment: Comment) => {
    return comment.likedBy?.includes(currentUserId) || false;
  };

  return (
    <Card className={`p-6 ${getUpdateBackground()} hover:shadow-xl transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onUserClick}
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-white hover:text-blue-300 transition-colors">
              {userName}
            </h3>
            <div className="flex items-center text-gray-400 text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              {city}, {country}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-gray-400 text-sm flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatRelativeTime(timestamp)}
          </div>
          {getUpdateIcon()}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
        <p className="text-gray-300 mb-2">{content}</p>
        
        {/* Specific metadata displays */}
        {type === 'wealth-update' && metadata?.percentChange && (
          <div className="text-green-400 font-semibold">
            Net worth increased by {metadata.percentChange}%
          </div>
        )}
        
        {type === 'asset-added' && metadata?.assetValue && (
          <div className="text-purple-400 font-semibold">
            Asset value: {formatCurrency(metadata.assetValue)}
          </div>
        )}
        
        {xpEarned && (
          <div className="text-yellow-400 font-semibold">+{formatNumber(xpEarned)} XP</div>
        )}
      </div>

      {/* Badge Display */}
      {badge && (
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/40 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{badge.icon}</span>
            <div>
              <div className="font-bold text-yellow-400">{badge.name}</div>
              <div className="text-yellow-300 text-sm">
                {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)} Badge
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Update */}
      {type === 'profile-picture' && metadata?.avatarUrl && (
        <div className="mb-4 p-3 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-400/40 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30">
              <img 
                src={metadata.avatarUrl} 
                alt={`${userName}'s new profile picture`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
        {/* Reactions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onReaction('haha')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all hover:scale-105 ${
              hasUserReacted('haha') 
                ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/40' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Laugh className="w-4 h-4" />
            {getReactionCount('haha') > 0 && <span>{getReactionCount('haha')}</span>}
          </button>
          
          <button
            onClick={() => onReaction('kudos')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all hover:scale-105 ${
              hasUserReacted('kudos') 
                ? 'bg-pink-400/20 text-pink-400 border border-pink-400/40' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Heart className="w-4 h-4" />
            {getReactionCount('kudos') > 0 && <span>{getReactionCount('kudos')}</span>}
          </button>
        </div>

        {/* Seed, Comments, and Hide */}
        <div className="flex items-center space-x-2">
          {/* Seed Button */}
          {canSeed && onSeed && (
            <button
              onClick={onSeed}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all ${
                isSeeded
                  ? 'bg-green-500/20 text-green-400 border border-green-400/40'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>{seedCount}</span>
            </button>
          )}

          {/* Comments Button */}
          <button
            onClick={onToggleComments}
            className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length}</span>
            {showComments ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          
          {/* Hide Post Button */}
          {onHidePost && (
            <button
              onClick={onHidePost}
              className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
              title="Hide post"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          )}
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
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
              />
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                icon={Send}
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
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="font-semibold text-white text-sm">{comment.userName}</div>
                    <div className="text-gray-300 text-sm">{comment.content}</div>
                  </div>
                  <div className="flex items-center mt-1 ml-3">
                    <div className="text-gray-400 text-xs mr-3">
                      {formatRelativeTime(comment.timestamp)}
                    </div>
                    {onLikeComment && (
                      <button 
                        onClick={() => onLikeComment(comment.id)}
                        className={`flex items-center text-xs ${
                          hasUserLikedComment(comment) 
                            ? 'text-blue-400' 
                            : 'text-gray-400 hover:text-blue-400'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {comment.likes > 0 && <span>{comment.likes}</span>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-2">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default AutomatedFeedPost;