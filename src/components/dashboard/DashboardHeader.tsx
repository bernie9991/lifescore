import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Settings } from 'lucide-react';
import { User as UserType } from '../../types';
import { formatNumber } from '../../utils/animations';

interface DashboardHeaderProps {
  user: UserType;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onProfileClick, onSettingsClick }) => {
  // Calculate lifeScore if it doesn't exist
  const calculateLifeScore = () => {
    if (user.lifeScore) return user.lifeScore;
    
    const wealthScore = (user.wealth?.total || 0) / 10;
    const knowledgeScore = user.knowledge?.total || 0;
    const assetScore = (user.assets || []).reduce((sum, asset) => sum + asset.value, 0) / 50;
    
    return Math.round(wealthScore + knowledgeScore + assetScore);
  };

  const lifeScore = calculateLifeScore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8"
    >
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, 
          <span className="text-blue-400 ml-2">
            {user.name}
          </span>! 👋
        </h1>
        <p className="text-gray-300">
          {user.city}, {user.country}
        </p>
      </div>

      {/* LifeScore & Actions */}
      <div className="flex items-center space-x-6">
        {/* User Avatar with Badge */}
        <div 
          className="relative cursor-pointer hover:scale-105 transition-transform"
          onClick={onProfileClick}
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          
          {/* Avatar Badge */}
          {user.avatarBadge && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700">
              <span className="text-xs">{user.avatarBadge.icon}</span>
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-300">LifeScore</p>
          <p className="text-2xl font-bold text-blue-400">
            {formatNumber(lifeScore)} XP
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={onSettingsClick}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;