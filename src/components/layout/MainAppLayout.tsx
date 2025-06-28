import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../navigation/Sidebar';
import BottomTabBar from '../navigation/BottomTabBar';
import Dashboard from '../dashboard/Dashboard';
import Feed from '../feed/Feed';
import QuestsAndMissions from '../quests/QuestsAndMissions';
import Leaderboards from '../leaderboards/Leaderboards';
import Badges from '../badges/Badges';
import Profile from '../profile/Profile';

const MainAppLayout: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            onProfileClick={() => setCurrentPage('profile')}
            onSettingsClick={() => setCurrentPage('profile')}
          />
        );
      case 'feed':
        return <Feed user={user} />;
      case 'quests':
        return <QuestsAndMissions user={user} />;
      case 'leaderboards':
        return <Leaderboards user={user} />;
      case 'badges':
        return <Badges user={user} />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return (
          <Dashboard 
            user={user} 
            onProfileClick={() => setCurrentPage('profile')}
            onSettingsClick={() => setCurrentPage('profile')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex">
      {/* Sidebar for desktop */}
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-20 md:pb-8">
            {renderContent()}
          </div>
        </main>
        
        {/* Bottom tab bar for mobile */}
        <BottomTabBar currentPage={currentPage} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default MainAppLayout;