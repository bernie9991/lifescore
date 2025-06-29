import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Pause, 
  CheckCircle, 
  Brain, 
  Dumbbell, 
  Briefcase, 
  Heart, 
  Star, 
  Flame,
  BarChart3,
  Loader2
} from 'lucide-react';
import { User, Habit } from '../../types';
import { formatNumber, triggerConfetti, triggerAchievementConfetti } from '../../utils/animations';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import HabitSelectionModal from './HabitSelectionModal';

interface HabitTrackerProps {
  user: User;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ user }) => {
  const { updateUser } = useAuth();
  const [habits, setHabits] = useState<Habit[]>(user.habits || []);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingHabitId, setProcessingHabitId] = useState<string | null>(null);

  // Load user habits from user object
  useEffect(() => {
    if (user?.habits) {
      setHabits(user.habits);
    } else {
      // Try to load from localStorage as fallback
      const savedHabits = localStorage.getItem(`user_habits_${user.id}`);
      if (savedHabits) {
        try {
          const parsedHabits = JSON.parse(savedHabits);
          setHabits(parsedHabits);
          // Sync with user object
          updateUser({ habits: parsedHabits });
        } catch (error) {
          console.error('Error loading saved habits:', error);
        }
      }
    }
  }, [user.id, user.habits, updateUser]);

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem(`user_habits_${user.id}`, JSON.stringify(habits));
    }
  }, [habits, user.id]);

  const handleCompleteHabit = async (habitId: string) => {
    try {
      setProcessingHabitId(habitId);
      
      const updatedHabits = habits.map(habit => {
        if (habit.id === habitId && !habit.completedToday && !habit.isPaused) {
          const newStreak = (habit.streak || 0) + 1;
          const newTotalCompletions = (habit.totalCompletions || 0) + 1;
          
          // Calculate success rate
          const daysSinceSelected = habit.selectedAt 
            ? Math.ceil((Date.now() - new Date(habit.selectedAt).getTime()) / (1000 * 60 * 60 * 24))
            : 1;
          const successRate = Math.round((newTotalCompletions / daysSinceSelected) * 100);
          
          // Update weekly progress (last 7 days)
          const today = new Date().getDay();
          const newWeeklyProgress = habit.weeklyProgress || new Array(7).fill(0);
          newWeeklyProgress[today] = 1;
          
          // Check for streak milestones
          if (newStreak === 7) {
            triggerAchievementConfetti();
            toast.success('🔥 7-day streak! "Streak Rookie" badge unlocked!');
          } else if (newStreak === 30) {
            triggerAchievementConfetti();
            toast.success('🏆 30-day streak! "Streak Master" badge unlocked!');
          } else {
            triggerConfetti();
            toast.success(`${habit.name} completed! Streak: ${newStreak} days 🔥`);
          }
          
          return {
            ...habit,
            completedToday: true,
            streak: newStreak,
            lastCompleted: new Date(),
            totalCompletions: newTotalCompletions,
            successRate,
            weeklyProgress: newWeeklyProgress
          };
        }
        return habit;
      });
      
      setHabits(updatedHabits);
      
      // Update in Firestore
      if (user?.id) {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
          'habits': updatedHabits
        });
        
        // Update user object
        updateUser({ habits: updatedHabits });
      }
    } catch (error) {
      console.error('Error completing habit:', error);
      toast.error('Failed to update habit. Please try again.');
    } finally {
      setProcessingHabitId(null);
    }
  };

  const handleRemoveHabit = async (habitId: string) => {
    try {
      setProcessingHabitId(habitId);
      
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;
      
      const updatedHabits = habits.filter(h => h.id !== habitId);
      setHabits(updatedHabits);
      
      // Update in Firestore
      if (user?.id) {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
          'habits': updatedHabits
        });
        
        // Update user object
        updateUser({ habits: updatedHabits });
      }
      
      toast.success(`${habit.name} removed from habits`);
    } catch (error) {
      console.error('Error removing habit:', error);
      toast.error('Failed to remove habit. Please try again.');
    } finally {
      setProcessingHabitId(null);
    }
  };

  const handlePauseHabit = async (habitId: string) => {
    try {
      setProcessingHabitId(habitId);
      
      const updatedHabits = habits.map(habit => 
        habit.id === habitId 
          ? { ...habit, isPaused: !habit.isPaused }
          : habit
      );
      
      setHabits(updatedHabits);
      
      // Update in Firestore
      if (user?.id) {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
          'habits': updatedHabits
        });
        
        // Update user object
        updateUser({ habits: updatedHabits });
      }
      
      const habit = habits.find(h => h.id === habitId);
      toast.success(`${habit?.name} ${habit?.isPaused ? 'resumed' : 'paused'}`);
    } catch (error) {
      console.error('Error pausing habit:', error);
      toast.error('Failed to update habit. Please try again.');
    } finally {
      setProcessingHabitId(null);
    }
  };

  const handleHabitsSelected = (selectedHabits: Habit[]) => {
    setHabits(selectedHabits);
    updateUser({ habits: selectedHabits });
  };

  const getHabitCategoryIcon = (category: Habit['category']) => {
    switch (category) {
      case 'mind': return Brain;
      case 'body': return Dumbbell;
      case 'work': return Briefcase;
      case 'social': return Heart;
      default: return Star;
    }
  };

  const getHabitCategoryColor = (category: Habit['category']) => {
    switch (category) {
      case 'mind': return 'text-purple-400 bg-purple-500/20';
      case 'body': return 'text-green-400 bg-green-500/20';
      case 'work': return 'text-blue-400 bg-blue-500/20';
      case 'social': return 'text-pink-400 bg-pink-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-white">Daily Habits</h2>
        <Button 
          icon={Plus} 
          variant="secondary" 
          size="sm"
          onClick={() => setShowAddHabitModal(true)}
          className="text-sm"
        >
          <span className="hidden sm:inline">Add Habit</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {habits.length > 0 ? (
        <>
          {/* Habits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {habits.map((habit, index) => {
              const CategoryIcon = getHabitCategoryIcon(habit.category);
              const categoryColor = getHabitCategoryColor(habit.category);
              const progressPercentage = habit.completedToday ? 100 : 0;
              const isProcessing = processingHabitId === habit.id;
              
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-3 md:p-4 ${
                    habit.isPaused ? 'border-gray-500/40 bg-gray-500/10 opacity-60' :
                    habit.completedToday ? 'border-green-400/40 bg-green-500/10' : 'border-gray-600'
                  } hover:shadow-lg transition-all cursor-pointer relative group`}
                        onClick={() => !habit.completedToday && !habit.isPaused && !isProcessing && handleCompleteHabit(habit.id)}>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-1 right-1 flex space-x-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePauseHabit(habit.id);
                        }}
                        disabled={isProcessing}
                        className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-white disabled:opacity-50"
                        title={habit.isPaused ? 'Resume' : 'Pause'}
                      >
                        <Pause className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHabit(habit.id);
                        }}
                        disabled={isProcessing}
                        className="p-1 bg-red-600 hover:bg-red-700 rounded text-white disabled:opacity-50"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-center">
                      {/* Habit Ring Progress */}
                      <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-3">
                        <svg className="w-12 h-12 md:w-16 md:h-16 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-700"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 35}`}
                            strokeDashoffset={`${2 * Math.PI * 35 * (1 - progressPercentage / 100)}`}
                            className={habit.completedToday ? 'text-green-400' : 'text-blue-400'}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isProcessing ? (
                            <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-blue-400 animate-spin" />
                          ) : (
                            <span className="text-lg md:text-2xl">{habit.emoji}</span>
                          )}
                        </div>
                        {habit.completedToday && !isProcessing && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                            <CheckCircle className="w-2 h-2 md:w-3 md:h-3 text-white" />
                          </div>
                        )}
                        {habit.isPaused && !isProcessing && (
                          <div className="absolute -top-1 -right-1 bg-gray-500 rounded-full p-1">
                            <Pause className="w-2 h-2 md:w-3 md:h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-white text-xs md:text-sm mb-1 md:mb-2 line-clamp-2">{habit.name}</h3>
                      
                      <div className={`inline-flex items-center px-1 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-semibold ${categoryColor} mb-1 md:mb-2`}>
                        <CategoryIcon className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                        <span className="hidden md:inline">{habit.category}</span>
                        <span className="md:hidden">{habit.category.charAt(0).toUpperCase()}</span>
                      </div>

                      <div className="flex items-center justify-center space-x-1 mb-2 md:mb-3">
                        <Flame className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                        <span className="text-sm md:text-lg font-bold text-orange-400">{habit.streak || 0}</span>
                        <span className="text-gray-400 text-xs hidden md:inline">days</span>
                      </div>

                      {/* Success Rate */}
                      {habit.successRate !== undefined && (
                        <div className="text-xs text-gray-400 mb-2">
                          {habit.successRate}% success
                        </div>
                      )}

                      {!habit.completedToday && !habit.isPaused && !isProcessing && (
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-xs py-1"
                          icon={CheckCircle}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteHabit(habit.id);
                          }}
                        >
                          <span className="hidden md:inline">Complete</span>
                          <span className="md:hidden">✓</span>
                        </Button>
                      )}

                      {habit.completedToday && !isProcessing && (
                        <div className="text-green-400 font-semibold text-xs">
                          ✅ <span className="hidden md:inline">Done!</span>
                        </div>
                      )}

                      {habit.isPaused && !isProcessing && (
                        <div className="text-gray-400 font-semibold text-xs">
                          ⏸️ <span className="hidden md:inline">Paused</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Summary */}
          <Card className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
              Progress Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {habits.filter(h => h.completedToday).length}
                </div>
                <div className="text-sm text-gray-400">Completed Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {Math.max(...habits.map(h => h.streak || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Total Completions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + (h.successRate || 0), 0) / habits.length) : 0}%
                </div>
                <div className="text-sm text-gray-400">Avg Success Rate</div>
              </div>
            </div>
          </Card>
        </>
      ) : (
        /* Empty Habits State */
        <Card className="p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-purple-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              No habits yet
            </h3>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Start building positive habits to improve your daily routine and earn XP!
            </p>
            
            <Button 
              onClick={() => setShowAddHabitModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
              icon={Plus}
            >
              Add Your First Habit
            </Button>
          </div>
        </Card>
      )}

      {/* Streak Milestones */}
      <Card className="p-3 md:p-4 bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30">
        <h3 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 flex items-center">
          <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mr-2" />
          Streak Milestones
        </h3>
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="text-center p-2 md:p-3 bg-gray-900/50 rounded-lg">
            <div className="text-lg md:text-xl font-bold text-yellow-400">7</div>
            <div className="text-xs text-gray-400">Rookie</div>
          </div>
          <div className="text-center p-2 md:p-3 bg-gray-900/50 rounded-lg">
            <div className="text-lg md:text-xl font-bold text-orange-400">30</div>
            <div className="text-xs text-gray-400">Master</div>
          </div>
          <div className="text-center p-2 md:p-3 bg-gray-900/50 rounded-lg">
            <div className="text-lg md:text-xl font-bold text-red-400">100</div>
            <div className="text-xs text-gray-400">Legend</div>
          </div>
        </div>
      </Card>

      {/* Habit Selection Modal */}
      <HabitSelectionModal
        isOpen={showAddHabitModal}
        onClose={() => setShowAddHabitModal(false)}
        onHabitsSelected={handleHabitsSelected}
        currentHabits={habits}
      />
    </div>
  );
};

export default HabitTracker;