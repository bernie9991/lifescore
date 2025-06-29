import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Filter, 
  Clock, 
  Loader2, 
  RefreshCw, 
  Trash2,
  Award,
  GraduationCap,
  DollarSign,
  Home,
  Globe,
  Camera,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { User } from '../../types';
import { formatRelativeTime } from '../../utils/feedUtils';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface MyPostsProps {
  user: User;
}

interface Post {
  id: string;
  type: string;
  title: string;
  content: string;
  timestamp: Date;
  isHidden?: boolean;
  comments: any[];
  reactions: Record<string, string[]>;
  metadata?: any;
  badge?: any;
}

const MyPosts: React.FC<MyPostsProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [refreshing, setRefreshing] = useState(false);

  // Load user's posts
  const loadPosts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const postsQuery = query(
        collection(db, 'feedItems'),
        where('userId', '==', user.id),
        orderBy('timestamp', sortOrder === 'newest' ? 'desc' : 'asc')
      );

      const querySnapshot = await getDocs(postsQuery);
      const userPosts: Post[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userPosts.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          content: data.content,
          timestamp: data.timestamp?.toDate() || new Date(),
          isHidden: data.isHidden || false,
          comments: data.comments || [],
          reactions: data.reactions || {},
          metadata: data.metadata,
          badge: data.badge
        });
      });

      // Apply filter if needed
      let filteredPosts = userPosts;
      if (filter !== 'all') {
        if (filter === 'visible') {
          filteredPosts = userPosts.filter(post => !post.isHidden);
        } else if (filter === 'hidden') {
          filteredPosts = userPosts.filter(post => post.isHidden);
        } else {
          filteredPosts = userPosts.filter(post => post.type === filter);
        }
      }

      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id, filter, sortOrder]);

  // Initial load
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Toggle post visibility
  const togglePostVisibility = async (postId: string, currentlyHidden: boolean) => {
    try {
      const postRef = doc(db, 'feedItems', postId);
      await updateDoc(postRef, {
        isHidden: !currentlyHidden
      });

      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post, isHidden: !currentlyHidden };
        }
        return post;
      }));

      toast.success(`Post ${currentlyHidden ? 'made visible' : 'hidden'} successfully`);
    } catch (error) {
      console.error('Error toggling post visibility:', error);
      toast.error('Failed to update post visibility');
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const postRef = doc(db, 'feedItems', postId);
      await deleteDoc(postRef);

      // Update local state
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  // Get icon based on post type
  const getPostIcon = (type: string) => {
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
        return <MessageSquare className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get background color based on post type
  const getPostBackground = (type: string, isHidden: boolean = false) => {
    if (isHidden) {
      return 'bg-gray-800/50 border-gray-600/50 opacity-60';
    }

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

  // Get human-readable post type
  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'badge-earned':
        return 'Badge Earned';
      case 'certification-added':
        return 'Certification';
      case 'wealth-update':
        return 'Wealth Update';
      case 'asset-added':
        return 'New Asset';
      case 'language-added':
        return 'New Language';
      case 'profile-picture':
        return 'Profile Picture';
      case 'education-update':
        return 'Education Update';
      default:
        return 'Post';
    }
  };

  // Get total engagement (comments + reactions)
  const getTotalEngagement = (post: Post) => {
    const commentCount = post.comments.length;
    const reactionCount = Object.values(post.reactions).reduce((sum, users) => sum + users.length, 0);
    return commentCount + reactionCount;
  };

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Posts' },
    { id: 'visible', label: 'Visible Posts' },
    { id: 'hidden', label: 'Hidden Posts' },
    { id: 'badge-earned', label: 'Badges' },
    { id: 'certification-added', label: 'Certifications' },
    { id: 'asset-added', label: 'Assets' }
  ];

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <div className="text-gray-300">Loading your posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/30">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center">
              <MessageSquare className="w-5 h-5 text-blue-400 mr-2" />
              My Posts
            </h2>
            <p className="text-gray-300 text-sm">
              Manage all your posts and control their visibility
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-400">{posts.length}</div>
              <div className="text-xs text-gray-400">Total Posts</div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-green-400">
                {posts.filter(post => !post.isHidden).length}
              </div>
              <div className="text-xs text-gray-400">Visible</div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-yellow-400">
                {posts.filter(post => post.isHidden).length}
              </div>
              <div className="text-xs text-gray-400">Hidden</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 items-center">
        {/* Filter Dropdown */}
        <div className="relative w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-full"
            >
              {filterOptions.map(option => (
                <option key={option.id} value={option.id} className="bg-gray-800 text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Order */}
        <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-2 w-full md:w-auto">
          <Clock className="w-4 h-4 text-gray-400" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="bg-transparent text-white focus:outline-none w-full"
          >
            <option value="newest" className="bg-gray-800 text-white">Newest First</option>
            <option value="oldest" className="bg-gray-800 text-white">Oldest First</option>
          </select>
        </div>

        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadPosts(true)}
          disabled={refreshing}
          className="text-gray-400 hover:text-white ml-auto"
          icon={refreshing ? Loader2 : RefreshCw}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${getPostBackground(post.type, post.isHidden)}`}
            >
              {/* Post Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getPostIcon(post.type)}
                  <div>
                    <div className="text-sm text-gray-400">
                      {getPostTypeLabel(post.type)}
                    </div>
                    <h3 className="font-bold text-white">{post.title}</h3>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {post.isHidden ? (
                    <span className="flex items-center text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Hidden
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-full">
                      <Eye className="w-3 h-3 mr-1" />
                      Visible
                    </span>
                  )}
                  
                  <div className="text-gray-400 text-xs flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatRelativeTime(post.timestamp)}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-3">
                <p className="text-gray-300 text-sm">{post.content}</p>
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center space-x-4 mb-3 text-xs text-gray-400">
                <div className="flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {post.comments.length} comments
                </div>
                
                <div className="flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  {Object.values(post.reactions).reduce((sum, users) => sum + users.length, 0)} reactions
                </div>
                
                <div className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {getTotalEngagement(post)} total engagement
                </div>
              </div>

              {/* Expanded Content */}
              {expandedPost === post.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-gray-700"
                >
                  {/* Badge Display */}
                  {post.badge && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/40 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{post.badge.icon}</span>
                        <div>
                          <div className="font-bold text-yellow-400">{post.badge.name}</div>
                          <div className="text-yellow-300 text-sm">
                            {post.badge.rarity && `${post.badge.rarity.charAt(0).toUpperCase() + post.badge.rarity.slice(1)} Badge`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {post.comments.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">Comments ({post.comments.length})</h4>
                      {post.comments.slice(0, 3).map((comment, index) => (
                        <div key={index} className="bg-gray-800 p-3 rounded-lg">
                          <div className="flex justify-between">
                            <div className="font-semibold text-white text-sm">{comment.userName}</div>
                            <div className="text-gray-400 text-xs">
                              {formatRelativeTime(new Date(comment.timestamp))}
                            </div>
                          </div>
                          <div className="text-gray-300 text-sm">{comment.content}</div>
                        </div>
                      ))}
                      {post.comments.length > 3 && (
                        <div className="text-center text-sm text-blue-400">
                          +{post.comments.length - 3} more comments
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">No comments yet</div>
                  )}

                  {/* Reactions */}
                  {Object.keys(post.reactions).length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold text-white">Reactions</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(post.reactions).map(([type, users]) => {
                          if (users.length === 0) return null;
                          
                          let emoji = '👍';
                          let color = 'text-blue-400';
                          
                          if (type === 'haha') {
                            emoji = '😂';
                            color = 'text-yellow-400';
                          } else if (type === 'angry') {
                            emoji = '😠';
                            color = 'text-red-400';
                          } else if (type === 'applause') {
                            emoji = '👏';
                            color = 'text-green-400';
                          } else if (type === 'kudos') {
                            emoji = '❤️';
                            color = 'text-pink-400';
                          }
                          
                          return (
                            <div key={type} className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-800 ${color}`}>
                              <span>{emoji}</span>
                              <span>{users.length}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  className="text-gray-400 hover:text-white text-xs"
                  icon={expandedPost === post.id ? ChevronUp : ChevronDown}
                >
                  {expandedPost === post.id ? 'Show Less' : 'Show More'}
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePostVisibility(post.id, post.isHidden || false)}
                    className={`text-xs ${post.isHidden ? 'text-green-400' : 'text-yellow-400'}`}
                    icon={post.isHidden ? Eye : EyeOff}
                  >
                    {post.isHidden ? 'Make Visible' : 'Hide Post'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                    icon={Trash2}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3">No posts found</h3>
            
            {filter !== 'all' ? (
              <p className="text-gray-400 mb-6">
                No posts match your current filter. Try changing the filter or create new posts.
              </p>
            ) : (
              <p className="text-gray-400 mb-6">
                You haven't created any posts yet. Update your profile, add assets, or earn badges to generate posts automatically.
              </p>
            )}
            
            <div className="flex justify-center">
              <Button
                onClick={() => setFilter('all')}
                variant="secondary"
                icon={Filter}
                className="mr-2"
              >
                Clear Filters
              </Button>
              <Button
                onClick={() => loadPosts(true)}
                icon={RefreshCw}
              >
                Refresh
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Privacy Notice */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <AlertTriangle className="w-5 h-5 text-blue-400 mr-2" />
          <h3 className="text-blue-400 font-semibold">Privacy Information</h3>
        </div>
        <p className="text-blue-300 text-sm">
          Hidden posts are only visible to you. They won't appear in anyone's feed, but they're still stored in your account.
        </p>
      </div>
    </div>
  );
};

export default MyPosts;