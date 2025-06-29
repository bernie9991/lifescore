import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Calendar, 
  BookOpen, 
  Trophy,
  Play,
  CheckCircle,
  Users,
  Zap,
  Star,
  Lock,
  Unlock,
  ArrowRight,
  Plus,
  Brain,
  Dumbbell,
  Briefcase,
  Heart,
  Flame,
  Award,
  Globe,
  TreePine,
  Palette,
  DollarSign,
  TrendingUp,
  Lightbulb,
  Rocket,
  BarChart3,
  Cpu,
  GraduationCap,
  X,
  Pause,
  Trash2,
  Coffee,
  Book,
  Music,
  Camera,
  Gamepad2,
  Utensils,
  Moon,
  Sun,
  Smartphone,
  Headphones,
  Save
} from 'lucide-react';
import { User } from '../../types';
import { formatNumber, triggerConfetti, triggerAchievementConfetti } from '../../utils/animations';
import Card from '../common/Card';
import Button from '../common/Button';
import MissionCard from './MissionCard';
import toast from 'react-hot-toast';

interface QuestsAndMissionsProps {
  user: User;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  goal: string;
  tasks: string[];
  xpReward: number;
  badge: string;
  icon: string;
  progress: number;
  total: number;
  globalProgress?: { current: number; total: number };
  status: 'available' | 'active' | 'completed' | 'coming-soon';
  category: 'fitness' | 'learning' | 'impact' | 'creative' | 'personal';
}

interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: 'mind' | 'body' | 'work' | 'social';
  streak: number;
  completedToday: boolean;
  lastCompleted?: Date;
  isPaused?: boolean;
  selectedAt?: Date;
  totalCompletions?: number;
  weeklyProgress?: number[];
  successRate?: number;
}

interface AvailableHabit {
  id: string;
  name: string;
  emoji: string;
  category: 'mind' | 'body' | 'work' | 'social';
  description: string;
}

interface KnowledgePath {
  id: string;
  title: string;
  description: string;
  author: string;
  authorLogo: string;
  nodes: KnowledgeNode[];
  completedNodes: string[];
  reward: string;
  category: 'data' | 'design' | 'ai';
  status: 'coming-soon';
}

interface KnowledgeNode {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isHidden?: boolean;
  prerequisite?: string;
  status: 'locked' | 'available' | 'completed';
}

const QuestsAndMissions: React.FC<QuestsAndMissionsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('habits');
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [knowledgePaths, setKnowledgePaths] = useState<KnowledgePath[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());

  const [availableHabits] = useState<AvailableHabit[]>([
    // Mind habits
    { id: 'meditation-new', name: 'Daily Meditation', emoji: '🧘', category: 'mind', description: 'Practice mindfulness and reduce stress' },
    { id: 'reading-new', name: 'Read 30 Minutes', emoji: '📚', category: 'mind', description: 'Expand knowledge through daily reading' },
    { id: 'journaling', name: 'Daily Journaling', emoji: '📝', category: 'mind', description: 'Reflect and organize thoughts' },
    { id: 'learning', name: 'Learn Something New', emoji: '🧠', category: 'mind', description: 'Dedicate time to learning new skills' },
    { id: 'podcast', name: 'Listen to Podcast', emoji: '🎧', category: 'mind', description: 'Stay informed and entertained' },
    { id: 'music', name: 'Play Music', emoji: '🎵', category: 'mind', description: 'Practice musical instruments' },
    
    // Body habits
    { id: 'exercise-new', name: 'Morning Exercise', emoji: '💪', category: 'body', description: 'Start day with physical activity' },
    { id: 'water-new', name: 'Drink 8 Glasses Water', emoji: '💧', category: 'body', description: 'Stay hydrated throughout the day' },
    { id: 'walk', name: '10,000 Steps', emoji: '🚶', category: 'body', description: 'Walk for better health' },
    { id: 'yoga', name: 'Daily Yoga', emoji: '🧘‍♀️', category: 'body', description: 'Improve flexibility and balance' },
    { id: 'sleep', name: 'Sleep 8 Hours', emoji: '😴', category: 'body', description: 'Maintain healthy sleep schedule' },
    { id: 'stretch', name: 'Stretch 15 Minutes', emoji: '🤸', category: 'body', description: 'Keep muscles flexible' },
    { id: 'healthy-meal', name: 'Eat Healthy Meal', emoji: '🥗', category: 'body', description: 'Maintain nutritious diet' },
    
    // Work habits
    { id: 'coding-new', name: 'Code Practice', emoji: '💻', category: 'work', description: 'Improve programming skills' },
    { id: 'planning', name: 'Plan Tomorrow', emoji: '📅', category: 'work', description: 'Organize next day tasks' },
    { id: 'skill-practice', name: 'Practice Core Skill', emoji: '🎯', category: 'work', description: 'Focus on professional development' },
    { id: 'email-zero', name: 'Inbox Zero', emoji: '📧', category: 'work', description: 'Keep email organized' },
    { id: 'deep-work', name: '2 Hours Deep Work', emoji: '⚡', category: 'work', description: 'Focused, uninterrupted work time' },
    { id: 'review', name: 'Daily Review', emoji: '📊', category: 'work', description: 'Reflect on daily progress' },
    
    // Social habits
    { id: 'networking-new', name: 'Connect with Someone', emoji: '🤝', category: 'social', description: 'Build professional relationships' },
    { id: 'family-time', name: 'Family Time', emoji: '👨‍👩‍👧‍👦', category: 'social', description: 'Spend quality time with family' },
    { id: 'friend-call', name: 'Call a Friend', emoji: '📞', category: 'social', description: 'Maintain friendships' },
    { id: 'gratitude', name: 'Express Gratitude', emoji: '🙏', category: 'social', description: 'Thank someone each day' },
    { id: 'help-someone', name: 'Help Someone', emoji: '🤲', category: 'social', description: 'Perform acts of kindness' },
    { id: 'social-media-limit', name: 'Limit Social Media', emoji: '📱', category: 'social', description: 'Reduce screen time' }
  ]);

  const tabs = [
    { id: 'habits', label: 'Habit Tracker', icon: Calendar },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'knowledge', label: 'Knowledge Paths', icon: BookOpen }
  ];

  // Mission cards data with high-quality Pexels images
  const missionCards = [
    {
      title: "Buy Your First Home",
      description: "A step-by-step guide from saving to signing.",
      imageUrl: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1"
    },
    {
      title: "Run a 5k Race",
      description: "Go from the couch to the finish line in just 8 weeks.",
      imageUrl: "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1"
    },
    {
      title: "Launch a Side Hustle",
      description: "Turn your passion into a profitable business.",
      imageUrl: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1"
    }
  ];

  // Load user habits from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem(`user_habits_${user.id}`);
    if (savedHabits) {
      try {
        const parsedHabits = JSON.parse(savedHabits);
        setHabits(parsedHabits);
      } catch (error) {
        console.error('Error loading saved habits:', error);
      }
    }
  }, [user.id]);

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem(`user_habits_${user.id}`, JSON.stringify(habits));
    }
  }, [habits, user.id]);

  const handleCompleteHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId && !habit.completedToday && !habit.isPaused) {
        const newStreak = habit.streak + 1;
        const newTotalCompletions = (habit.totalCompletions || 0) + 1;
        
        // Calculate success rate
        const daysSinceSelected = habit.selectedAt 
          ? Math.ceil((Date.now() - habit.selectedAt.getTime()) / (1000 * 60 * 60 * 24))
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
    }));
  };

  const handleToggleHabitSelection = (habitId: string) => {
    console.log('🔍 HABIT SELECTION: Toggling habit:', habitId);
    console.log('🔍 HABIT SELECTION: Current selected habits:', Array.from(selectedHabits));
    
    setSelectedHabits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        console.log('🔍 HABIT SELECTION: Removing habit from selection');
        newSet.delete(habitId);
      } else {
        console.log('🔍 HABIT SELECTION: Adding habit to selection');
        newSet.add(habitId);
      }
      console.log('🔍 HABIT SELECTION: New selected habits:', Array.from(newSet));
      return newSet;
    });
  };

  const handleSaveSelectedHabits = () => {
    console.log('🔍 HABIT SAVE: Saving selected habits:', Array.from(selectedHabits));
    
    const selectedHabitData = availableHabits.filter(habit => selectedHabits.has(habit.id));
    console.log('🔍 HABIT SAVE: Selected habit data:', selectedHabitData);
    
    const newHabits: Habit[] = selectedHabitData.map(habit => ({
      id: `habit-${Date.now()}-${Math.random()}`,
      name: habit.name,
      emoji: habit.emoji,
      category: habit.category,
      streak: 0,
      completedToday: false,
      selectedAt: new Date(),
      totalCompletions: 0,
      weeklyProgress: new Array(7).fill(0),
      successRate: 0
    }));

    console.log('🔍 HABIT SAVE: New habits to add:', newHabits);

    setHabits(prev => [...prev, ...newHabits]);
    setSelectedHabits(new Set());
    setShowAddHabitModal(false);
    
    triggerConfetti();
    toast.success(`${newHabits.length} habit${newHabits.length > 1 ? 's' : ''} added! 🎯`);
  };

  const handleRemoveHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    setHabits(prev => prev.filter(h => h.id !== habitId));
    toast.success(`${habit?.name} removed from habits`);
  };

  const handlePauseHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { ...habit, isPaused: !habit.isPaused }
        : habit
    ));
    
    const habit = habits.find(h => h.id === habitId);
    toast.success(`${habit?.name} ${habit?.isPaused ? 'resumed' : 'paused'}`);
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

  const groupedAvailableHabits = availableHabits.reduce((acc, habit) => {
    if (!acc[habit.category]) {
      acc[habit.category] = [];
    }
    acc[habit.category].push(habit);
    return acc;
  }, {} as Record<string, AvailableHabit[]>);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            🎯 Quests & Missions
          </h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base">Level up your life through missions, habits, and knowledge paths</p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-yellow-400">{formatNumber(user.lifeScore || 0)}</div>
            <div className="text-xs text-gray-400">Total XP</div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Tabs */}
      <div className="w-full overflow-x-auto">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-md transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Habit Tracker Tab */}
      {activeTab === 'habits' && (
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
                            onClick={() => !habit.completedToday && !habit.isPaused && handleCompleteHabit(habit.id)}>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-1 right-1 flex space-x-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePauseHabit(habit.id);
                            }}
                            className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                            title={habit.isPaused ? 'Resume' : 'Pause'}
                          >
                            <Pause className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveHabit(habit.id);
                            }}
                            className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
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
                              <span className="text-lg md:text-2xl">{habit.emoji}</span>
                            </div>
                            {habit.completedToday && (
                              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                                <CheckCircle className="w-2 h-2 md:w-3 md:h-3 text-white" />
                              </div>
                            )}
                            {habit.isPaused && (
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
                            <span className="text-sm md:text-lg font-bold text-orange-400">{habit.streak}</span>
                            <span className="text-gray-400 text-xs hidden md:inline">days</span>
                          </div>

                          {/* Success Rate */}
                          {habit.successRate !== undefined && (
                            <div className="text-xs text-gray-400 mb-2">
                              {habit.successRate}% success
                            </div>
                          )}

                          {!habit.completedToday && !habit.isPaused && (
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

                          {habit.completedToday && (
                            <div className="text-green-400 font-semibold text-xs">
                              ✅ <span className="hidden md:inline">Done!</span>
                            </div>
                          )}

                          {habit.isPaused && (
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
                      {Math.max(...habits.map(h => h.streak), 0)}
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
        </div>
      )}

      {/* Missions Tab */}
      {activeTab === 'missions' && (
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-white">Upcoming Missions</h2>
            <div className="text-sm text-gray-400">
              More missions launching soon!
            </div>
          </div>

          {/* Mission Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missionCards.map((mission, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MissionCard
                  title={mission.title}
                  description={mission.description}
                  imageUrl={mission.imageUrl}
                />
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Info */}
          <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Missions Are Coming Soon!
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                We're crafting exciting, step-by-step missions to help you achieve your biggest life goals. 
                Each mission will include detailed guides, progress tracking, and exclusive rewards.
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Goal-oriented challenges</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span>Exclusive rewards</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Community support</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Knowledge Paths Tab */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4 md:space-y-6">
          {/* Empty Knowledge Paths State */}
          <Card className="p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-purple-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                Knowledge paths coming soon
              </h3>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                Structured learning paths from world-class institutions will be available soon. Stay tuned for updates!
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <GraduationCap className="w-4 h-4" />
                  <span>Learn from top institutions</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Award className="w-4 h-4" />
                  <span>Earn certificates and badges</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Learning Institutions Note */}
          <Card className="p-3 md:p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <div className="text-center">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-base md:text-lg font-bold text-white mb-2">Premium Learning Paths</h3>
              <p className="text-gray-300 text-sm">
                Curated by world-renowned institutions including Stanford, MIT, and Harvard. 
                Advanced learning paths with real-world projects and industry recognition.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced Add Habit Modal */}
      <AnimatePresence>
        {showAddHabitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAddHabitModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700">
                <h2 className="text-xl md:text-2xl font-bold text-white">Choose Your Habits</h2>
                <button
                  onClick={() => setShowAddHabitModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {Object.entries(groupedAvailableHabits).map(([category, categoryHabits]) => {
                  const CategoryIcon = getHabitCategoryIcon(category as Habit['category']);
                  const categoryColor = getHabitCategoryColor(category as Habit['category']);
                  
                  return (
                    <div key={category}>
                      <h3 className={`text-lg font-bold text-white mb-3 flex items-center ${categoryColor.split(' ')[0]}`}>
                        <CategoryIcon className="w-5 h-5 mr-2" />
                        {category.charAt(0).toUpperCase() + category.slice(1)} Habits
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryHabits.map((habit) => {
                          const isSelected = selectedHabits.has(habit.id);
                          const isAlreadyAdded = habits.some(h => h.name === habit.name);
                          
                          console.log('🔍 HABIT RENDER:', {
                            habitId: habit.id,
                            habitName: habit.name,
                            isSelected,
                            isAlreadyAdded,
                            selectedHabitsArray: Array.from(selectedHabits)
                          });
                          
                          return (
                            <motion.div
                              key={habit.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div
                                className={`p-4 border transition-all cursor-pointer rounded-lg ${
                                  isAlreadyAdded 
                                    ? 'border-gray-500 bg-gray-700/50 opacity-50 cursor-not-allowed'
                                    : isSelected
                                    ? 'border-blue-500 bg-blue-500/20'
                                    : 'border-gray-600 hover:border-blue-500/50 bg-gray-900'
                                }`}
                                onClick={() => {
                                  console.log('🔍 HABIT CLICK:', {
                                    habitId: habit.id,
                                    habitName: habit.name,
                                    isAlreadyAdded,
                                    currentlySelected: selectedHabits.has(habit.id)
                                  });
                                  
                                  if (!isAlreadyAdded) {
                                    handleToggleHabitSelection(habit.id);
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="text-2xl">{habit.emoji}</div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-white">{habit.name}</h4>
                                    <p className="text-gray-400 text-sm">{habit.description}</p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {isAlreadyAdded ? (
                                      <CheckCircle className="w-5 h-5 text-green-400" />
                                    ) : isSelected ? (
                                      <CheckCircle className="w-5 h-5 text-blue-400" />
                                    ) : (
                                      <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 border-t border-gray-700 bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {selectedHabits.size} habit{selectedHabits.size !== 1 ? 's' : ''} selected
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedHabits(new Set());
                        setShowAddHabitModal(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveSelectedHabits}
                      disabled={selectedHabits.size === 0}
                      icon={Save}
                      className="bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      Save Selection ({selectedHabits.size})
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestsAndMissions;