import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle, 
  Circle, 
  Award, 
  Calendar,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Mission, MissionStep } from '../../types';
import { 
  getTimeRemaining, 
  getMissionStatusColor, 
  getMissionStatusLabel,
  getMissionCategoryIcon,
  getMissionDifficulty,
  getNextIncompleteStep
} from '../../utils/missionUtils';
import Card from '../common/Card';
import Button from '../common/Button';

interface MissionCardProps {
  mission: Mission;
  onStepComplete?: (missionId: string, stepId: string) => void;
  onViewDetails?: (mission: Mission) => void;
  isExpanded?: boolean;
}

const MissionCard: React.FC<MissionCardProps> = ({ 
  mission, 
  onStepComplete,
  onViewDetails,
  isExpanded = false
}) => {
  const [expanded, setExpanded] = useState(isExpanded);
  
  const statusColors = getMissionStatusColor(mission);
  const statusLabel = getMissionStatusLabel(mission);
  const categoryIcon = getMissionCategoryIcon(mission.category);
  const { label: difficultyLabel, color: difficultyColor } = getMissionDifficulty(mission.difficulty);
  const timeRemaining = getTimeRemaining(mission);
  const nextStep = getNextIncompleteStep(mission);
  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const handleStepComplete = (stepId: string) => {
    if (onStepComplete) {
      onStepComplete(mission.id, stepId);
    }
  };
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(mission);
    }
  };

  return (
    <Card className={`p-4 md:p-6 ${statusColors.bg} border ${statusColors.border} hover:shadow-lg transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-xl">{categoryIcon}</span>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{mission.title}</h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className={`${statusColors.text}`}>{statusLabel}</span>
              <span className="text-gray-400">•</span>
              <span className={difficultyColor}>{difficultyLabel}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm ${statusColors.text} ${statusColors.bg} border ${statusColors.border}`}>
            <span className="font-semibold">{mission.progress}%</span>
          </div>
          <button
            onClick={handleToggleExpand}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-300" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-300" />
            )}
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">Progress</span>
          <span className="text-white font-semibold">
            {mission.completedSteps.length}/{mission.steps.length} steps
          </span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              mission.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${mission.progress}%` }}
          />
        </div>
      </div>
      
      {/* Time Remaining */}
      <div className="flex items-center text-sm text-gray-300 mb-4">
        <Clock className="w-4 h-4 mr-2" />
        <span>{timeRemaining}</span>
      </div>
      
      {/* Description - Always visible */}
      <p className="text-gray-300 text-sm mb-4">{mission.description}</p>
      
      {/* Expanded Content */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 mt-4 pt-4 border-t border-gray-700"
        >
          {/* Steps List */}
          <div>
            <h4 className="font-semibold text-white mb-3">Your Progress</h4>
            <div className="space-y-3">
              {mission.steps.map((step) => {
                const isCompleted = mission.completedSteps.includes(step.id);
                
                return (
                  <div 
                    key={step.id}
                    className={`p-3 rounded-lg ${
                      isCompleted ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="mt-1 mr-3">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-medium ${isCompleted ? 'text-green-300' : 'text-white'}`}>
                          {step.title}
                        </h5>
                        <p className="text-sm text-gray-400">{step.description}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-yellow-400">
                            +{step.xpReward} XP
                          </div>
                          
                          {!isCompleted && mission.status === 'in-progress' && onStepComplete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                              onClick={() => handleStepComplete(step.id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                          
                          {isCompleted && step.completedAt && (
                            <div className="text-xs text-gray-400 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(step.completedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Next Step */}
          {nextStep && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2 flex items-center">
                <ArrowRight className="w-4 h-4 text-blue-400 mr-2" />
                Next Step
              </h4>
              <p className="text-blue-300 text-sm">{nextStep.title}</p>
              <p className="text-gray-400 text-xs mt-1">{nextStep.description}</p>
            </div>
          )}
          
          {/* Rewards */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2 flex items-center">
              <Award className="w-4 h-4 text-yellow-400 mr-2" />
              Rewards
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-yellow-400 font-bold">+{mission.xpReward} XP</div>
              {mission.badgeReward && (
                <div className="text-yellow-300 text-sm">Badge: {mission.badgeReward}</div>
              )}
            </div>
          </div>
          
          {/* Contribution to LifeScore */}
          {mission.contributionToLifeScore && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 text-purple-400 mr-2" />
                LifeScore Impact
              </h4>
              <div className="text-purple-300 text-sm">
                This mission contributes {mission.contributionToLifeScore}% to your overall LifeScore
              </div>
            </div>
          )}
          
          {/* View Details Button */}
          {onViewDetails && (
            <div className="text-center">
              <Button
                onClick={handleViewDetails}
                className="w-full md:w-auto"
              >
                View Full Details
              </Button>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Collapsed View - Show Button */}
      {!expanded && (
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            className="text-gray-300 hover:text-white"
          >
            Show Details
          </Button>
        </div>
      )}
    </Card>
  );
};

export default MissionCard;