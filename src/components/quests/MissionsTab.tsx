import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Filter, 
  Search, 
  TrendingUp, 
  Award, 
  Clock,
  Loader2
} from 'lucide-react';
import { User, Mission } from '../../types';
import { getSampleMissions, completeMissionStep } from '../../utils/missionUtils';
import Card from '../common/Card';
import Button from '../common/Button';
import MissionCard from './MissionCard';
import MissionDetailModal from './MissionDetailModal';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { triggerConfetti } from '../../utils/animations';

interface MissionsTabProps {
  user: User;
}

const MissionsTab: React.FC<MissionsTabProps> = ({ user }) => {
  const { updateUser } = useAuth();
  const [missions, setMissions] = useState<Mission[]>(user.missions || getSampleMissions());
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  
  // Load missions from user object
  useEffect(() => {
    if (user?.missions) {
      setMissions(user.missions);
    } else {
      // Use sample missions for demo
      const sampleMissions = getSampleMissions();
      setMissions(sampleMissions);
      
      // Update user object with sample missions
      updateUser({ missions: sampleMissions });
    }
  }, [user.missions, updateUser]);
  
  // Filter missions
  const filteredMissions = missions.filter(mission => {
    // Filter by status
    if (filter !== 'all' && mission.status !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !mission.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !mission.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Sort missions: in-progress first, then not-started, then completed, then failed
  const sortedMissions = [...filteredMissions].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      'in-progress': 0,
      'not-started': 1,
      'completed': 2,
      'failed': 3
    };
    
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  const handleStepComplete = async (missionId: string, stepId: string) => {
    try {
      setLoading(true);
      
      // Update missions
      const updatedMissions = await completeMissionStep(user.id, missionId, stepId, missions);
      setMissions(updatedMissions);
      
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
  
  const handleViewMissionDetails = (mission: Mission) => {
    setSelectedMission(mission);
  };
  
  const filterOptions = [
    { id: 'all', label: 'All Missions' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'not-started', label: 'Not Started' }
  ];
  
  // Calculate mission stats
  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const inProgressMissions = missions.filter(m => m.status === 'in-progress').length;
  const notStartedMissions = missions.filter(m => m.status === 'not-started').length;
  
  // Calculate total XP earned from missions
  const totalXPEarned = missions.reduce((total, mission) => {
    if (mission.status === 'completed') {
      return total + mission.xpReward;
    }
    
    // For in-progress missions, add XP from completed steps
    const completedStepsXP = mission.steps
      .filter(step => mission.completedSteps.includes(step.id))
      .reduce((sum, step) => sum + step.xpReward, 0);
    
    return total + completedStepsXP;
  }, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Stats */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/30">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center">
              <Target className="w-5 h-5 text-blue-400 mr-2" />
              Your Missions
            </h2>
            <p className="text-gray-300 text-sm">
              Complete missions to earn XP and badges
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-400">{totalMissions}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-green-400">{completedMissions}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-yellow-400">{inProgressMissions}</div>
              <div className="text-xs text-gray-400">In Progress</div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-purple-400">{totalXPEarned}</div>
              <div className="text-xs text-gray-400">XP Earned</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Search missions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          >
            {filterOptions.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
        
        {/* Add Mission Button - Disabled for demo */}
        <Button
          variant="secondary"
          icon={Plus}
          disabled
          className="md:ml-auto"
        >
          New Mission
        </Button>
      </div>

      {/* Missions List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <div className="text-gray-300">Loading missions...</div>
          </div>
        </div>
      ) : sortedMissions.length > 0 ? (
        <div className="space-y-4">
          {sortedMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onStepComplete={handleStepComplete}
              onViewDetails={handleViewMissionDetails}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3">No missions found</h3>
            
            {filter !== 'all' || searchTerm ? (
              <p className="text-gray-400 mb-6">
                No missions match your current filters. Try changing the filter or search term.
              </p>
            ) : (
              <p className="text-gray-400 mb-6">
                You don't have any missions yet. Start a new mission to earn XP and badges!
              </p>
            )}
            
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                variant="secondary"
                icon={Filter}
                className="mr-2"
              >
                Clear Filters
              </Button>
              <Button
                disabled
                icon={Plus}
              >
                New Mission
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Mission Detail Modal */}
      {selectedMission && (
        <MissionDetailModal
          mission={selectedMission}
          isOpen={!!selectedMission}
          onClose={() => setSelectedMission(null)}
          onStepComplete={handleStepComplete}
        />
      )}
      
      {/* Mission Tips */}
      <Card className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Award className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Mission Tips</h3>
        </div>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            Complete missions to earn XP and special badges
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            Track your progress and compare with other users
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            Focus on one mission at a time for best results
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">•</span>
            Missions contribute to your overall LifeScore
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default MissionsTab;