import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trophy, 
  Users, 
  Calendar, 
  Award, 
  Target,
  Crown,
  Medal,
  Star,
  Clock
} from 'lucide-react';
import Button from '../common/Button';
import { formatNumber } from '../../utils/animations';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  participants: number;
  reward: string;
  endDate: Date;
  leaderboard: Array<{
    rank: number;
    name: string;
    score: number;
    avatar?: string;
  }>;
}

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  onJoin: () => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ 
  isOpen, 
  onClose, 
  challenge,
  onJoin 
}) => {
  const getDaysLeft = () => {
    return Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-gray-300">#{rank}</span>;
  };

  const getTypeColor = () => {
    switch (challenge.type) {
      case 'weekly': return 'from-green-500 to-emerald-500';
      case 'monthly': return 'from-blue-500 to-cyan-500';
      case 'special': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

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
            className="relative bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className={`relative p-6 bg-gradient-to-r ${getTypeColor()} rounded-t-2xl`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-white">
                  <h2 className="text-2xl font-bold mb-2">{challenge.title}</h2>
                  <p className="text-white/80 mb-3">{challenge.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`px-3 py-1 bg-white/20 rounded-full capitalize`}>
                      {challenge.type} Challenge
                    </span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{formatNumber(challenge.participants)} participants</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Challenge Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 text-center">
                  <Clock className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-400">{getDaysLeft()}</div>
                  <div className="text-sm text-gray-400">Days Left</div>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">{formatNumber(challenge.participants)}</div>
                  <div className="text-sm text-gray-400">Participants</div>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 text-center">
                  <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-yellow-400">Reward</div>
                  <div className="text-sm text-gray-300">{challenge.reward}</div>
                </div>
              </div>

              {/* Current Leaderboard */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                  Current Leaderboard
                </h3>
                <div className="space-y-3">
                  {challenge.leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                        entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/40' :
                        entry.rank === 2 ? 'bg-gradient-to-r from-gray-300/20 to-slate-300/20 border border-gray-300/40' :
                        entry.rank === 3 ? 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-600/40' :
                        'bg-gray-900 border border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 flex justify-center">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          {entry.avatar ? (
                            <img
                              src={entry.avatar}
                              alt={entry.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{entry.name}</h4>
                          <div className="text-sm text-gray-400">Rank #{entry.rank}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">
                          {formatNumber(entry.score)}
                        </div>
                        <div className="text-sm text-gray-400">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Challenge Rules */}
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                  <Target className="w-5 h-5 text-blue-400 mr-2" />
                  How to Participate
                </h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p>• Complete the challenge requirements to earn points</p>
                  <p>• Track your progress on the leaderboard</p>
                  <p>• Top performers win exclusive badges and XP rewards</p>
                  <p>• Challenge ends in {getDaysLeft()} days</p>
                </div>
              </div>

              {/* Join Button */}
              <div className="text-center">
                <Button 
                  onClick={onJoin}
                  size="lg"
                  className={`bg-gradient-to-r ${getTypeColor()} hover:opacity-90 px-8`}
                  icon={Trophy}
                >
                  Join Challenge
                </Button>
                <p className="text-gray-400 text-sm mt-2">
                  Free to join • Compete with {formatNumber(challenge.participants)} others
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChallengeModal;