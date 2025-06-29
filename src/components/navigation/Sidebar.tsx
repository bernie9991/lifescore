import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Trophy, 
  Award, 
  Users, 
  LogOut,
  Sparkles,
  Activity,
  BarChart3,
  Target,
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'feed', label: 'Feed', icon: Activity },
    { id: 'quests', label: 'Quests & Missions', icon: Target },
    { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="hidden md:flex w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 h-screen flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">LifeScore</h1>
        </div>
      </div>

      {/* User Info - Now clickable for profile */}
      <div className="p-4 border-b border-gray-700">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700/50 rounded-lg p-2 transition-colors relative"
          onClick={() => onPageChange('profile')}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Avatar Badge */}
            {user?.avatarBadge && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700">
                <span className="text-xs">{user.avatarBadge.icon}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate hover:text-blue-300 transition-colors">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.lifeScore || 0} XP
            </p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;