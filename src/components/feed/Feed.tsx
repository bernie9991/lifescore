import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Trophy, 
  TrendingUp, 
  Award,
  Users,
  Filter,
  Globe,
  Star,
  Target
} from 'lucide-react';
import { User } from '../../types';
import { formatNumber } from '../../utils/animations';
import Card from '../common/Card';
import Button from '../common/Button';
import DynamicFactsPanel from '../dashboard/DynamicFactsPanel';

interface FeedProps {
  user: User;
}

const Feed: React.FC<FeedProps> = ({ user }) => {
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const filters = [
    { id: 'all', label: 'All Activity' },
    { id: 'friends', label: 'Friends Only' },
    { id: 'badges', label: 'Badge Unlocks' },
    { id: 'rankings', label: 'Rank Changes' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            📱 Activity Feed
          </h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base">Stay updated with achievements, challenges, and leaderboards</p>
        </div>
        <Button variant="secondary" icon={Filter} className="bg-gradient-to-r from-purple-600 to-pink-600 text-sm">
          <span className="hidden sm:inline">Filters</span>
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
    </div>
  );
};

export default Feed;