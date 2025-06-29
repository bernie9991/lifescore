import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Brain, 
  Dumbbell, 
  Briefcase, 
  Heart, 
  Star, 
  Save,
  Loader2
} from 'lucide-react';
import { User } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface HabitSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitsSelected: (habits: Habit[]) => void;
  currentHabits: Habit[];
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: 'mind' | 'body' | 'work' | 'social';
  description: string;
  streak?: number;
  completedToday?: boolean;
  lastCompleted?: Date;
  isPaused?: boolean;
  selectedAt?: Date;
  totalCompletions?: number;
  weeklyProgress?: number[];
  successRate?: number;
}

const HabitSelectionModal: React.FC<HabitSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onHabitsSelected,
  currentHabits = []
}) => {
  const { user, updateUser } = useAuth();
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  
  // Available habits data
  const availableHabits: Habit[] = [
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
  ];

  // Initialize selected habits based on current habits
  useEffect(() => {
    if (currentHabits.length > 0) {
      const currentHabitIds = new Set(currentHabits.map(habit => habit.id));
      setSelectedHabits(currentHabitIds);
    } else {
      setSelectedHabits(new Set());
    }
  }, [currentHabits, isOpen]);

  // Filter habits by category
  const filteredHabits = filter === 'all' 
    ? availableHabits 
    : availableHabits.filter(habit => habit.category === filter);

  // Group habits by category for display
  const groupedHabits = filteredHabits.reduce((acc, habit) => {
    if (!acc[habit.category]) {
      acc[habit.category] = [];
    }
    acc[habit.category].push(habit);
    return acc;
  }, {} as Record<string, Habit[]>);

  const handleToggleHabit = async (habit: Habit) => {
    try {
      setSaving(true);
      
      // Update local state first for immediate feedback
      const newSelectedHabits = new Set(selectedHabits);
      const isSelected = selectedHabits.has(habit.id);
      
      if (isSelected) {
        newSelectedHabits.delete(habit.id);
      } else {
        newSelectedHabits.add(habit.id);
      }
      
      setSelectedHabits(newSelectedHabits);
      
      // Update in Firestore
      if (user?.id) {
        const userDocRef = doc(db, 'users', user.id);
        
        if (isSelected) {
          // Remove habit
          await updateDoc(userDocRef, {
            'habits': arrayRemove(habit)
          });
          toast.success(`Removed "${habit.name}" from your habits`);
        } else {
          // Add habit with initial properties
          const newHabit: Habit = {
            ...habit,
            streak: 0,
            completedToday: false,
            selectedAt: new Date(),
            totalCompletions: 0,
            weeklyProgress: new Array(7).fill(0),
            successRate: 0
          };
          
          await updateDoc(userDocRef, {
            'habits': arrayUnion(newHabit)
          });
          toast.success(`Added "${habit.name}" to your habits`);
        }
        
        // Update local user state
        const updatedHabits = isSelected
          ? currentHabits.filter(h => h.id !== habit.id)
          : [...currentHabits, {
              ...habit,
              streak: 0,
              completedToday: false,
              selectedAt: new Date(),
              totalCompletions: 0,
              weeklyProgress: new Array(7).fill(0),
              successRate: 0
            }];
        
        updateUser({ habits: updatedHabits });
        onHabitsSelected(updatedHabits);
      }
    } catch (error) {
      console.error('Error updating habit:', error);
      toast.error('Failed to update habit. Please try again.');
      
      // Revert local state on error
      const revertedHabits = new Set(selectedHabits);
      if (selectedHabits.has(habit.id)) {
        revertedHabits.delete(habit.id);
      } else {
        revertedHabits.add(habit.id);
      }
      setSelectedHabits(revertedHabits);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      
      if (!user?.id) {
        toast.error('User not found. Please log in again.');
        return;
      }
      
      // Create array of selected habits
      const selectedHabitObjects = availableHabits
        .filter(habit => selectedHabits.has(habit.id))
        .map(habit => ({
          ...habit,
          streak: 0,
          completedToday: false,
          selectedAt: new Date(),
          totalCompletions: 0,
          weeklyProgress: new Array(7).fill(0),
          successRate: 0
        }));
      
      // Update in Firestore
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        'habits': selectedHabitObjects
      });
      
      // Update local user state
      updateUser({ habits: selectedHabitObjects });
      onHabitsSelected(selectedHabitObjects);
      
      toast.success(`Saved ${selectedHabitObjects.length} habits to your profile!`);
      onClose();
    } catch (error) {
      console.error('Error saving habits:', error);
      toast.error('Failed to save habits. Please try again.');
    } finally {
      setSaving(false);
    }
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

  const categoryFilters = [
    { id: 'all', label: 'All Habits' },
    { id: 'mind', label: 'Mind', icon: Brain },
    { id: 'body', label: 'Body', icon: Dumbbell },
    { id: 'work', label: 'Work', icon: Briefcase },
    { id: 'social', label: 'Social', icon: Heart }
  ];

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
            className="relative bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700">
              <h2 className="text-xl md:text-2xl font-bold text-white">Choose Your Habits</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Category Filters */}
            <div className="p-4 border-b border-gray-700 bg-gray-900/50">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categoryFilters.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilter(category.id)}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${
                      filter === category.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {category.icon && <category.icon className="w-4 h-4" />}
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {Object.entries(groupedHabits).length > 0 ? (
                Object.entries(groupedHabits).map(([category, categoryHabits]) => {
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
                          const isAlreadyAdded = currentHabits.some(h => h.id === habit.id);
                          
                          return (
                            <motion.div
                              key={habit.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card 
                                className={`p-4 border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-500/20'
                                    : 'border-gray-600 hover:border-blue-500/50'
                                }`}
                                onClick={() => handleToggleHabit(habit)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="text-2xl">{habit.emoji}</div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-white">{habit.name}</h4>
                                    <p className="text-gray-400 text-sm">{habit.description}</p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {saving ? (
                                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                    ) : isSelected ? (
                                      <Check className="w-5 h-5 text-blue-400" />
                                    ) : (
                                      <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                                    )}
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No habits found</h3>
                  <p className="text-gray-400">Try selecting a different category or check back later for new habits.</p>
                </div>
              )}
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
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAll}
                    disabled={saving}
                    icon={saving ? Loader2 : Save}
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    {saving ? 'Saving...' : `Save Selection (${selectedHabits.size})`}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HabitSelectionModal;