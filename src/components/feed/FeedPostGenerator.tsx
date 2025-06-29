import React, { useState, useEffect } from 'react';
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
  X,
  Eye,
  EyeOff,
  Settings,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { User } from '../../types';
import { formatNumber, formatCurrency } from '../../utils/animations';
import { formatRelativeTime } from '../../utils/feedUtils';
import Card from '../common/Card';
import Button from '../common/Button';

interface FeedPostGeneratorProps {
  user: User;
  onGeneratePost: (postData: any) => void;
}

const FeedPostGenerator: React.FC<FeedPostGeneratorProps> = ({ user, onGeneratePost }) => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [postType, setPostType] = useState<string>('achievement');
  const [postTitle, setPostTitle] = useState<string>('');
  const [postContent, setPostContent] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [xpAmount, setXpAmount] = useState<number>(0);
  const [selectedBadge, setSelectedBadge] = useState<string>('');

  const postTypes = [
    { id: 'achievement', label: 'Achievement', icon: Trophy },
    { id: 'certification', label: 'Certification', icon: GraduationCap },
    { id: 'wealth-update', label: 'Wealth Update', icon: DollarSign },
    { id: 'asset-added', label: 'New Asset', icon: Home },
    { id: 'skill-added', label: 'New Skill', icon: Star }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postTitle.trim() || !postContent.trim()) {
      return;
    }
    
    const postData = {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      city: user.city,
      country: user.country,
      type: postType,
      title: postTitle,
      content: postContent,
      isPublic,
      timestamp: new Date(),
      ...(xpAmount > 0 && { xpEarned: xpAmount }),
      ...(selectedBadge && { badge: { id: selectedBadge } })
    };
    
    onGeneratePost(postData);
    
    // Reset form
    setPostTitle('');
    setPostContent('');
    setPostType('achievement');
    setXpAmount(0);
    setSelectedBadge('');
    setShowGenerator(false);
  };

  return (
    <div className="mb-6">
      {!showGenerator ? (
        <Button 
          onClick={() => setShowGenerator(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
          icon={Plus}
        >
          Share an Achievement
        </Button>
      ) : (
        <Card className="p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Share an Update</h3>
            <button
              onClick={() => setShowGenerator(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Post Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Update Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {postTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPostType(type.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      postType === type.id
                        ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                        : 'border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <type.icon className="w-5 h-5 mx-auto mb-2" />
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Post Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="What did you achieve?"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {postTitle.length}/100
              </div>
            </div>
            
            {/* Post Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share the details of your achievement..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                maxLength={250}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {postContent.length}/250
              </div>
            </div>
            
            {/* Advanced Options Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced Options
                {showAdvancedOptions ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </button>
            </div>
            
            {/* Advanced Options */}
            {showAdvancedOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-2"
              >
                {/* XP Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    XP Earned (optional)
                  </label>
                  <input
                    type="number"
                    value={xpAmount || ''}
                    onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={0}
                    max={10000}
                  />
                </div>
                
                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Visibility
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        isPublic
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        !isPublic
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      <EyeOff className="w-4 h-4 mr-2" />
                      Friends Only
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Submit Button */}
            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowGenerator(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                disabled={!postTitle.trim() || !postContent.trim()}
              >
                Share Update
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default FeedPostGenerator;