import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mission } from '../../types';
import DashboardHeader from './DashboardHeader';
import RankingCards from './RankingCards';
import LifeScoreMeter from './LifeScoreMeter';
import NudgesPanel from './NudgesPanel';
import DynamicFactsPanel from './DynamicFactsPanel';
import MissionDetailModal from '../quests/MissionDetailModal';
import { completeMissionStep } from '../../utils/missionUtils';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { triggerConfetti } from '../../utils/animations';

interface DashboardProps {
  user: User;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onViewMission?: (mission: Mission) => void;
  onViewAllMissions?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onProfileClick, 
  onSettingsClick,
  onViewMission,
  onViewAllMissions
}) => {
  const { updateUser } = useAuth();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(false);

  const handleViewMission = (mission: Mission) => {
    if (onViewMission) {
      onViewMission(mission);
    } else {
      setSelectedMission(mission);
    }
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

  return (
    <div className="space-y-8">
      <DashboardHeader user={user} onProfileClick={onProfileClick} onSettingsClick={onSettingsClick} />
      
      {/* Global Standing - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DynamicFactsPanel user={user} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <RankingCards user={user} />
          <LifeScoreMeter user={user} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <NudgesPanel user={user} />
        </div>
      </motion.div>

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

export default Dashboard;