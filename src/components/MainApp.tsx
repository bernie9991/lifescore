import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './navigation/Sidebar';
import BottomTabBar from './navigation/BottomTabBar';
import DashboardHome from './dashboard/DashboardHome';
import QuestsAndMissions from './quests/QuestsAndMissions';
import Leaderboards from './leaderboards/Leaderboards';
import Badges from './badges/Badges';
import Friends from './friends/Friends';
import Profile from './profile/Profile';
import Feed from './feed/Feed';
import AdminPanel from './admin/AdminPanel';

const MainApp: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('feed');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (isAdmin) {
    return <AdminPanel />;
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Desktop Sidebar */}
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<Feed user={user} />} />
            <Route path="/quests" element={<QuestsAndMissions user={user} />} />
            <Route path="/dashboard" element={<DashboardHome user={user} onProfileClick={() => handlePageChange('profile')} onSettingsClick={() => {}} />} />
            <Route path="/leaderboards" element={<Leaderboards user={user} />} />
            <Route path="/badges" element={<Badges user={user} />} />
            <Route path="/friends" element={<Friends user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar currentPage={currentPage} onPageChange={handlePageChange} />
    </div>
  );
};

export default MainApp;