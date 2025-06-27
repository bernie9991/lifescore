import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Trophy, 
  Award, 
  User, 
  Activity,
  BarChart3,
  Target
} from 'lucide-react';

interface BottomTabBarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentPage, onPageChange }) => {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: Activity },
    { id: 'quests', label: 'Quests', icon: Target },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(tab.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all min-w-0 flex-1 ${
              currentPage === tab.id
                ? 'text-blue-400 bg-blue-900/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className={`w-5 h-5 mb-1 ${
              currentPage === tab.id ? 'text-blue-400' : 'text-gray-400'
            }`} />
            <span className={`text-xs font-medium truncate ${
              currentPage === tab.id ? 'text-blue-400' : 'text-gray-400'
            }`}>
              {tab.label}
            </span>
            
            {/* Active indicator */}
            {currentPage === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-400 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default BottomTabBar;