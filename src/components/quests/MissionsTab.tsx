import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Calendar, 
  BookOpen, 
  Trophy,
  Clock,
  Award,
  Users,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { User } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';

interface MissionsTabProps {
  user: User;
}

const MissionsTab: React.FC<MissionsTabProps> = ({ user }) => {
  // Sample mission data for visual representation
  const sampleMissions = [
    {
      id: 'mission-1',
      title: 'Buy Your First Home',
      description: 'A step-by-step guide from saving to signing.',
      imageUrl: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
      progress: 60,
      totalSteps: 5,
      completedSteps: 3,
      timeRemaining: '90 days',
      xpReward: 5000,
      badgeReward: 'Homeowner',
      category: 'wealth'
    },
    {
      id: 'mission-2',
      title: 'Run a 5k Race',
      description: 'Go from the couch to the finish line in just 8 weeks.',
      imageUrl: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=800',
      progress: 40,
      totalSteps: 5,
      completedSteps: 2,
      timeRemaining: '30 days',
      xpReward: 2000,
      category: 'health'
    },
    {
      id: 'mission-3',
      title: 'Launch a Side Hustle',
      description: 'Turn your passion into a profitable business.',
      imageUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      progress: 75,
      totalSteps: 4,
      completedSteps: 3,
      timeRemaining: '60 days',
      xpReward: 3000,
      badgeReward: 'Entrepreneur',
      category: 'career'
    }
  ];

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wealth': return '💰';
      case 'health': return '💪';
      case 'career': return '💼';
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
    <div className="space-y-4 md:space-y-6">
      {/* Mission Stats Overview */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/30">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center">
              <Target className="w-5 h-5 text-blue-400 mr-2" />
              Mission Center
            </h2>
            <p className="text-gray-300 text-sm">
              Complete missions to earn XP and special badges
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-400">3</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-green-400">0</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-yellow-400">3</div>
              <div className="text-xs text-gray-400">In Progress</div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-purple-400">10,000</div>
              <div className="text-xs text-gray-400">XP Available</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleMissions.map((mission) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden border border-gray-700 bg-gray-800 flex flex-col h-full"
          >
            {/* Image Section */}
            <div className="relative h-48">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${mission.imageUrl})` }}
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
                  <span className="mr-1">{getCategoryIcon(mission.category)}</span>
                  <span className="capitalize">{mission.category}</span>
                </div>
              </div>
              
              {/* Mission Title */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <h3 className="text-xl font-bold text-white mb-1">{mission.title}</h3>
                <p className="text-gray-300 text-sm line-clamp-2">{mission.description}</p>
              </div>
            </div>
            
            {/* Mission Details */}
            <div className="p-4 flex-grow flex flex-col">
              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Progress</span>
                  <span className="text-white font-semibold">
                    {mission.completedSteps}/{mission.totalSteps} steps
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${mission.progress}%` }}
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
                  <div className="text-sm font-semibold text-white">{mission.timeRemaining}</div>
                </div>
                
                <div className="bg-gray-900 p-2 rounded-lg">
                  <div className="flex items-center text-xs text-gray-400 mb-1">
                    <Award className="w-3 h-3 mr-1" />
                    XP Reward
                  </div>
                  <div className="text-sm font-semibold text-yellow-400">+{mission.xpReward} XP</div>
                </div>
              </div>
              
              {/* Next Milestones */}
              <div className="bg-gray-900 p-3 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                  <CheckCircle className="w-3 h-3 text-blue-400 mr-1" />
                  Next Milestone
                </h4>
                <div className="text-xs text-gray-300">
                  {mission.id === 'mission-1' && 'Find a real estate agent and start house hunting'}
                  {mission.id === 'mission-2' && 'Run 2 miles without stopping'}
                  {mission.id === 'mission-3' && 'Build a portfolio project to showcase your skills'}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.progress)} self-start mb-4`}>
                {mission.progress >= 75 ? 'Near Completion' : 
                 mission.progress >= 50 ? 'Good Progress' : 
                 mission.progress >= 25 ? 'In Progress' : 'Just Started'}
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
        ))}
      </div>

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