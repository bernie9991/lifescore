import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle, 
  Circle, 
  TrendingUp,
  BarChart3,
  ArrowRight,
  Users,
  Target,
  Flag
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
import Button from '../common/Button';
import { formatNumber } from '../../utils/animations';

interface MissionDetailModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
  onStepComplete?: (missionId: string, stepId: string) => void;
}

const MissionDetailModal: React.FC<MissionDetailModalProps> = ({
  mission,
  isOpen,
  onClose,
  onStepComplete
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'analytics'>('overview');
  
  const statusColors = getMissionStatusColor(mission);
  const statusLabel = getMissionStatusLabel(mission);
  const categoryIcon = getMissionCategoryIcon(mission.category);
  const { label: difficultyLabel, color: difficultyColor } = getMissionDifficulty(mission.difficulty);
  const timeRemaining = getTimeRemaining(mission);
  const nextStep = getNextIncompleteStep(mission);
  
  const handleStepComplete = (stepId: string) => {
    if (onStepComplete) {
      onStepComplete(mission.id, stepId);
    }
  };
  
  // Generate weekly progress data for chart
  const weeklyProgressData = mission.weeklyProgress || [0, 0, 0, 0, 0, 0, 0];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate comparison data
  const comparisonLabel = mission.comparisonToAverage && mission.comparisonToAverage > 0
    ? `${mission.comparisonToAverage}% faster than average`
    : mission.comparisonToAverage && mission.comparisonToAverage < 0
      ? `${Math.abs(mission.comparisonToAverage)}% slower than average`
      : 'On par with average';
  
  const comparisonColor = mission.comparisonToAverage && mission.comparisonToAverage > 0
    ? 'text-green-400'
    : mission.comparisonToAverage && mission.comparisonToAverage < 0
      ? 'text-red-400'
      : 'text-gray-400';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className={`relative p-6 ${statusColors.bg} rounded-t-2xl border-b border-gray-700`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-4xl">{categoryIcon}</span>
                </div>
                <div className="flex-1 text-white">
                  <h2 className="text-2xl font-bold mb-2">{mission.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`px-3 py-1 rounded-full ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}>
                      {statusLabel}
                    </span>
                    <span className={`px-3 py-1 rounded-full bg-white/10 ${difficultyColor}`}>
                      {difficultyLabel} Difficulty
                    </span>
                    <span className="flex items-center text-gray-300">
                      <Clock className="w-4 h-4 mr-1" />
                      {timeRemaining}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 text-center transition-colors ${
                  activeTab === 'overview'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('steps')}
                className={`flex-1 py-3 text-center transition-colors ${
                  activeTab === 'steps'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Steps
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-3 text-center transition-colors ${
                  activeTab === 'analytics'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Analytics
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-grow">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-300">{mission.description}</p>
                  </div>
                  
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-white">Progress</h3>
                      <div className="text-white font-semibold">
                        {mission.completedSteps.length}/{mission.steps.length} steps
                      </div>
                    </div>
                    <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          mission.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Timeline</h3>
                    <div className="flex items-center justify-between bg-gray-900 p-4 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-400">Started</div>
                        <div className="text-white">
                          {new Date(mission.startedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="h-0.5 flex-1 bg-gray-700 mx-4 relative">
                        <div 
                          className="absolute top-0 left-0 h-full bg-blue-500"
                          style={{ width: `${mission.progress}%` }}
                        />
                        <div 
                          className="absolute top-0 transform -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500"
                          style={{ left: `${mission.progress}%` }}
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Deadline</div>
                        <div className="text-white">
                          {mission.deadline 
                            ? new Date(mission.deadline).toLocaleDateString()
                            : new Date(new Date(mission.startedAt).getTime() + mission.estimatedDuration * 24 * 60 * 60 * 1000).toLocaleDateString()
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Next Step */}
                  {nextStep && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                        <ArrowRight className="w-5 h-5 text-blue-400 mr-2" />
                        Next Step
                      </h3>
                      <h4 className="font-medium text-blue-300 mb-1">{nextStep.title}</h4>
                      <p className="text-gray-300 text-sm mb-3">{nextStep.description}</p>
                      
                      {onStepComplete && mission.status === 'in-progress' && (
                        <Button
                          onClick={() => handleStepComplete(nextStep.id)}
                          className="w-full md:w-auto"
                        >
                          Mark as Complete
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Rewards */}
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Award className="w-5 h-5 text-yellow-400 mr-2" />
                      Rewards
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="text-sm text-gray-300 mb-1">XP Reward</div>
                        <div className="text-2xl font-bold text-yellow-400">+{formatNumber(mission.xpReward)} XP</div>
                      </div>
                      
                      {mission.badgeReward && (
                        <div>
                          <div className="text-sm text-gray-300 mb-1">Badge Reward</div>
                          <div className="text-lg font-semibold text-yellow-300">{mission.badgeReward}</div>
                        </div>
                      )}
                      
                      {mission.contributionToLifeScore && (
                        <div>
                          <div className="text-sm text-gray-300 mb-1">LifeScore Impact</div>
                          <div className="text-lg font-semibold text-purple-400">+{mission.contributionToLifeScore}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Steps Tab */}
              {activeTab === 'steps' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Mission Steps</h3>
                  
                  {mission.steps.map((step, index) => {
                    const isCompleted = mission.completedSteps.includes(step.id);
                    
                    return (
                      <div 
                        key={step.id}
                        className={`p-4 rounded-lg ${
                          isCompleted ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-800 border border-gray-700'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex flex-col items-center mr-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-500' : 'bg-gray-700'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : (
                                <span className="text-white font-bold">{index + 1}</span>
                              )}
                            </div>
                            {index < mission.steps.length - 1 && (
                              <div className={`w-0.5 h-8 ${
                                isCompleted ? 'bg-green-500' : 'bg-gray-700'
                              }`} />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className={`font-medium text-lg ${isCompleted ? 'text-green-300' : 'text-white'}`}>
                              {step.title}
                            </h4>
                            <p className="text-gray-400 mb-3">{step.description}</p>
                            
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="text-yellow-400 font-semibold">
                                +{step.xpReward} XP
                              </div>
                              
                              {isCompleted && step.completedAt ? (
                                <div className="text-sm text-gray-400 flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Completed on {new Date(step.completedAt).toLocaleDateString()}
                                </div>
                              ) : mission.status === 'in-progress' && onStepComplete ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleStepComplete(step.id)}
                                  className="text-sm"
                                >
                                  Mark as Complete
                                </Button>
                              ) : (
                                <div className="text-sm text-gray-400">
                                  Pending completion
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Progress Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
                      Progress Statistics
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <div className="text-sm text-gray-400 mb-1">Completion Rate</div>
                        <div className="text-2xl font-bold text-blue-400">{mission.progress}%</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {mission.completedSteps.length} of {mission.steps.length} steps
                        </div>
                      </div>
                      
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <div className="text-sm text-gray-400 mb-1">Time Invested</div>
                        <div className="text-2xl font-bold text-purple-400">
                          {Math.floor((new Date().getTime() - new Date(mission.startedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Since {new Date(mission.startedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <div className="text-sm text-gray-400 mb-1">XP Earned</div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {mission.steps
                            .filter(step => mission.completedSteps.includes(step.id))
                            .reduce((sum, step) => sum + step.xpReward, 0)
                          } XP
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          of {mission.xpReward} XP total
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Weekly Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Calendar className="w-5 h-5 text-green-400 mr-2" />
                      Weekly Activity
                    </h3>
                    
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-end justify-between h-32 mb-2">
                        {days.map((day, index) => (
                          <div key={day} className="flex flex-col items-center">
                            <div 
                              className={`w-8 ${
                                weeklyProgressData[index] ? 'bg-blue-500' : 'bg-gray-700'
                              } rounded-t transition-all`}
                              style={{ height: `${weeklyProgressData[index] ? 80 : 10}%` }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        {days.map(day => (
                          <div key={day}>{day}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Comparison to Average */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Users className="w-5 h-5 text-pink-400 mr-2" />
                      Comparison to Average
                    </h3>
                    
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-gray-300">Your Progress</div>
                        <div className="text-white font-semibold">{mission.progress}%</div>
                      </div>
                      
                      <div className="w-full h-3 bg-gray-700 rounded-full mb-4">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${mission.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-gray-300">Average User Progress</div>
                        <div className="text-white font-semibold">
                          {mission.progress - (mission.comparisonToAverage || 0)}%
                        </div>
                      </div>
                      
                      <div className="w-full h-3 bg-gray-700 rounded-full mb-4">
                        <div 
                          className="h-full bg-gray-500 rounded-full"
                          style={{ width: `${mission.progress - (mission.comparisonToAverage || 0)}%` }}
                        />
                      </div>
                      
                      <div className={`text-center font-semibold ${comparisonColor}`}>
                        {comparisonLabel}
                      </div>
                    </div>
                  </div>
                  
                  {/* LifeScore Impact */}
                  {mission.contributionToLifeScore && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
                        LifeScore Impact
                      </h3>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">
                          +{mission.contributionToLifeScore}%
                        </div>
                        <p className="text-gray-300 text-sm">
                          This mission contributes {mission.contributionToLifeScore}% to your overall LifeScore
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-900/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Last updated: {new Date(mission.lastUpdated).toLocaleDateString()}
                </div>
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MissionDetailModal;