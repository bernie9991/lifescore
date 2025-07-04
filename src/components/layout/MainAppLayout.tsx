import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../navigation/Sidebar';
import BottomTabBar from '../navigation/BottomTabBar';
import Dashboard from '../dashboard/Dashboard';
import Feed from '../feed/Feed';
import QuestsAndMissions from '../quests/QuestsAndMissions';
import Leaderboards from '../leaderboards/Leaderboards';
import Badges from '../badges/Badges';
import Friends from '../friends/Friends';
import Profile from '../profile/Profile';
import MissionDetailModal from '../quests/MissionDetailModal';
import { Mission } from '../../types';
import { completeMissionStep } from '../../utils/missionUtils';
import toast from 'react-hot-toast';
import { triggerConfetti } from '../../utils/animations';

const MainAppLayout: React.FC = () => {
  const { user, updateUser } = useAuth();
  // FIXED: Changed default page from 'dashboard' to 'feed'
  const [currentPage, setCurrentPage] = useState('feed');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleViewMission = (mission: Mission) => {
    setSelectedMission(mission);
  };

  const handleStepComplete = async (missionId: string, stepId: string) => {
    try {
      setLoading(true);
      
      // Update missions
      const updatedMissions = await completeMissionStep(user.id, missionId, stepId, user.missions || []);
      
      // Update user object
      updateUser({ missions: updatedMissions });
      
      // Show success message
      toast.success('Step completed! 🎉');
      triggerConfetti();
      
      // Update selected mission if open
      if (selectedMission?.id === missionId) {
        const updatedMission = updatedMissions.find(m => m.id === missionId);
        if (updatedMission) {
          setSelectedMission(updatedMission);
        }
      }
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('Failed to complete step. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            onProfileClick={() => setCurrentPage('profile')}
            onSettingsClick={() => setCurrentPage('profile')}
            onViewMission={handleViewMission}
            onViewAllMissions={() => setCurrentPage('quests')}
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
      case 'friends':
        return <Friends user={user} />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return <Feed user={user} />;
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

      {/* Mission Detail Modal */}
      {selectedMission && (
        <MissionDetailModal
          mission={selectedMission}
          isOpen={!!selectedMission}
          onClose={() => setSelectedMission(null)}
          onStepComplete={handleStepComplete}
        />
      )}
    </div>
  );
};

export default MainAppLayout;