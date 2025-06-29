import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Award, 
  CheckCircle, 
  ChevronRight
} from 'lucide-react';
import Button from '../common/Button';

interface MissionCardProps {
  title: string;
  description: string;
  imageUrl: string;
  progress?: number;
  totalSteps?: number;
  completedSteps?: number;
  timeRemaining?: string;
  xpReward?: number;
  badgeReward?: string;
  nextMilestone?: string;
  category?: string;
}

const MissionCard: React.FC<MissionCardProps> = ({ 
  title, 
  description, 
  imageUrl,
  progress = 0,
  totalSteps = 5,
  completedSteps = 0,
  timeRemaining = "Coming Soon",
  xpReward = 1000,
  badgeReward,
  nextMilestone = "Start this mission",
  category = "personal"
}) => {
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wealth': return '💰';
      case 'health': return '💪';
      case 'career': return '💼';
      case 'knowledge': return '🧠';
      default: return '🎯';
    }
  };

  // Get status color based on progress
  const getStatusColor = (progress: number) => {
    if (progress >= 75) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (progress >= 50) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (progress >= 25) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden border border-gray-700 bg-gray-800 flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative h-48">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        {/* Coming Soon Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg">
            Coming Soon
          </div>
        </div>
        
        {/* Category Icon */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-gray-900/70 backdrop-blur-sm text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
            <span className="mr-1">{getCategoryIcon(category)}</span>
            <span className="capitalize">{category}</span>
          </div>
        </div>
        
        {/* Mission Title */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-gray-300 text-sm line-clamp-2">{description}</p>
        </div>
      </div>
      
      {/* Mission Details */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Progress</span>
            <span className="text-white font-semibold">
              {completedSteps}/{totalSteps} steps
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-900 p-2 rounded-lg">
            <div className="flex items-center text-xs text-gray-400 mb-1">
              <Clock className="w-3 h-3 mr-1" />
              Time Remaining
            </div>
            <div className="text-sm font-semibold text-white">{timeRemaining}</div>
          </div>
          
          <div className="bg-gray-900 p-2 rounded-lg">
            <div className="flex items-center text-xs text-gray-400 mb-1">
              <Award className="w-3 h-3 mr-1" />
              XP Reward
            </div>
            <div className="text-sm font-semibold text-yellow-400">+{xpReward} XP</div>
          </div>
        </div>
        
        {/* Next Milestones */}
        <div className="bg-gray-900 p-3 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center">
            <CheckCircle className="w-3 h-3 text-blue-400 mr-1" />
            Next Milestone
          </h4>
          <div className="text-xs text-gray-300">
            {nextMilestone}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(progress)} self-start mb-4`}>
          {progress >= 75 ? 'Near Completion' : 
           progress >= 50 ? 'Good Progress' : 
           progress >= 25 ? 'In Progress' : 'Just Started'}
        </div>
        
        {/* View Details Button */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-auto w-full justify-center"
          icon={ChevronRight}
        >
          View Details
        </Button>
      </div>
    </motion.div>
  );
};

export default MissionCard;