import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Award, 
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { User, Mission } from '../../types';
import { 
  getTimeRemaining, 
  getMissionStatusColor, 
  getMissionStatusLabel,
  getMissionCategoryIcon,
  calculateMissionContribution,
  getMissionWeeklyProgress,
  getMissionComparison
} from '../../utils/missionUtils';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatNumber } from '../../utils/animations';

interface MissionGoalsPanelProps {
  user: User;
  onViewAllMissions?: () => void;
  onViewMission?: (mission: Mission) => void;
}

const MissionGoalsPanel: React.FC<MissionGoalsPanelProps> = ({ 
  user, 
  onViewAllMissions,
  onViewMission
}) => {
  const missions = user.missions || [];
  
  // Get active missions (in progress)
  const activeMissions = missions.filter(mission => mission.status === 'in-progress');
  
  // Calculate mission contribution to LifeScore
  const missionContribution = calculateMissionContribution(missions, user.lifeScore || 0);
  
  // Get weekly progress data
  const weeklyProgressData = getMissionWeeklyProgress(missions);
  
  // Get comparison data
  const comparisonData = getMissionComparison(missions);
  
  // If no missions, show empty state
  if (missions.length === 0) {
    return (
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 text-blue-400 mr-2" />
            Mission Goals
          </h3>
          {onViewAllMissions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAllMissions}
              className="text-sm"
            >
              View All
            </Button>
          )}
        </div>
        
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-500" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">No Active Missions</h4>
          <p className="text-gray-400 text-sm mb-4">
            Start a mission to track your progress and earn rewards
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onViewAllMissions}
            disabled={!onViewAllMissions}
          >
            Browse Missions
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Target className="w-5 h-5 text-blue-400 mr-2" />
          Mission Goals
        </h3>
        {onViewAllMissions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllMissions}
            className="text-sm"
          >
            View All
          </Button>
        )}
      </div>
      
      {/* Mission Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Active Missions</div>
          <div className="text-xl font-bold text-blue-400">{activeMissions.length}</div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Completed</div>
          <div className="text-xl font-bold text-green-400">
            {missions.filter(m => m.status === 'completed').length}
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">XP Earned</div>
          <div className="text-xl font-bold text-yellow-400">
            {formatNumber(
              missions.reduce((total, mission) => {
                if (mission.status === 'completed') {
                  return total + mission.xpReward;
                }
                
                // For in-progress missions, add XP from completed steps
                const completedStepsXP = mission.steps
                  .filter(step => mission.completedSteps.includes(step.id))
                  .reduce((sum, step) => sum + step.xpReward, 0);
                
                return total + completedStepsXP;
              }, 0)
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">LifeScore Impact</div>
          <div className="text-xl font-bold text-purple-400">{missionContribution}%</div>
        </div>
      </div>
      
      {/* Active Missions */}
      <div className="space-y-3 mb-4">
        <h4 className="font-medium text-white">Active Missions</h4>
        
        {activeMissions.length > 0 ? (
          activeMissions.slice(0, 3).map((mission) => {
            const statusColors = getMissionStatusColor(mission);
            const statusLabel = getMissionStatusLabel(mission);
            const categoryIcon = getMissionCategoryIcon(mission.category);
            const timeRemaining = getTimeRemaining(mission);
            
            return (
              <motion.div
                key={mission.id}
                whileHover={{ scale: 1.01 }}
                className={`p-3 rounded-lg ${statusColors.bg} border ${statusColors.border} cursor-pointer`}
                onClick={() => onViewMission && onViewMission(mission)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{categoryIcon}</span>
                    <h5 className="font-medium text-white">{mission.title}</h5>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs ${statusColors.text} ${statusColors.bg} border ${statusColors.border}`}>
                    {statusLabel}
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Progress: {mission.progress}%</span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {timeRemaining}
                  </span>
                </div>
                
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${mission.progress}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className="text-gray-400">
                    {mission.completedSteps.length}/{mission.steps.length} steps
                  </span>
                  <span className="text-yellow-400 font-semibold">
                    +{mission.xpReward} XP
                  </span>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm">
            No active missions. Start a new mission to track your progress!
          </div>
        )}
        
        {activeMissions.length > 3 && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAllMissions}
              className="text-sm"
              icon={ChevronRight}
            >
              View {activeMissions.length - 3} More
            </Button>
          </div>
        )}
      </div>
      
      {/* Weekly Progress */}
      <div className="mb-4">
        <h4 className="font-medium text-white mb-2 flex items-center">
          <BarChart3 className="w-4 h-4 text-blue-400 mr-1" />
          Weekly Progress
        </h4>
        
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
          <div className="flex items-end justify-between h-24 mb-2">
            {weeklyProgressData.map((data, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-6 bg-blue-500 rounded-t transition-all"
                  style={{ height: `${Math.min(data.completedSteps * 10, 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            {weeklyProgressData.map((data, index) => (
              <div key={index}>{data.day}</div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Comparison to Average */}
      {comparisonData.length > 0 && (
        <div>
          <h4 className="font-medium text-white mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 text-purple-400 mr-1" />
            Your Performance
          </h4>
          
          <div className="space-y-2">
            {comparisonData.slice(0, 2).map((data, index) => (
              <div key={index} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300 truncate">{data.name}</span>
                  <span className={data.difference > 0 ? 'text-green-400' : data.difference < 0 ? 'text-red-400' : 'text-gray-400'}>
                    {data.difference > 0 ? '+' : ''}{data.difference}%
                  </span>
                </div>
                
                <div className="w-full h-2 bg-gray-700 rounded-full mb-2">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${data.userProgress}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>You: {data.userProgress}%</span>
                  <span>Avg: {data.averageProgress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MissionGoalsPanel;