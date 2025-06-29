import { useState, useEffect, useCallback } from 'react';
import { Habit } from '../types';
import { useAuth } from './useAuth';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { 
  resetDailyHabits, 
  checkAndUpdateStreaks, 
  addHabit, 
  removeHabit, 
  updateHabit, 
  completeHabit, 
  toggleHabitPaused 
} from '../utils/habitUtils';

export const useHabits = () => {
  const { user, updateUser } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingHabitId, setProcessingHabitId] = useState<string | null>(null);

  // Load habits from user object and localStorage
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      if (user.habits && user.habits.length > 0) {
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
    } catch (error) {
      console.error('Error loading habits:', error);
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, [user, updateUser]);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    if (!user || !habits.length) return;
    
    localStorage.setItem(`user_habits_${user.id}`, JSON.stringify(habits));
  }, [habits, user]);

  // Check for day change to reset completedToday status
  useEffect(() => {
    if (!user || !habits.length) return;
    
    // Get the current date
    const now = new Date();
    const today = now.toDateString();
    
    // Get the last reset date from localStorage
    const lastResetDate = localStorage.getItem(`habits_last_reset_${user.id}`);
    
    // If the date has changed, reset habits
    if (lastResetDate !== today) {
      const resetHabitsAsync = async () => {
        try {
          // Reset completedToday status
          const resetHabits = await resetDailyHabits(habits, user.id);
          setHabits(resetHabits);
          
          // Check for streak breaks
          const updatedHabits = await checkAndUpdateStreaks(resetHabits, user.id);
          setHabits(updatedHabits);
          
          // Update user object
          updateUser({ habits: updatedHabits });
          
          // Save the current date as the last reset date
          localStorage.setItem(`habits_last_reset_${user.id}`, today);
        } catch (error) {
          console.error('Error resetting habits:', error);
        }
      };
      
      resetHabitsAsync();
    }
  }, [habits, user, updateUser]);

  // Add a new habit
  const addNewHabit = useCallback(async (habit: Omit<Habit, 'streak' | 'completedToday' | 'lastCompleted' | 'selectedAt' | 'totalCompletions' | 'weeklyProgress' | 'successRate'>) => {
    if (!user) {
      toast.error('You must be logged in to add habits');
      return;
    }
    
    try {
      setLoading(true);
      
      const updatedHabits = await addHabit(habit, user.id, habits);
      setHabits(updatedHabits);
      
      // Update user object
      updateUser({ habits: updatedHabits });
      
      toast.success(`${habit.name} added to your habits!`);
      return updatedHabits;
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error('Failed to add habit');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, habits, updateUser]);

  // Remove a habit
  const removeExistingHabit = useCallback(async (habitId: string) => {
    if (!user) {
      toast.error('You must be logged in to remove habits');
      return;
    }
    
    try {
      setProcessingHabitId(habitId);
      
      const updatedHabits = await removeHabit(habitId, user.id, habits);
      setHabits(updatedHabits);
      
      // Update user object
      updateUser({ habits: updatedHabits });
      
      const habit = habits.find(h => h.id === habitId);
      toast.success(`${habit?.name} removed from habits`);
      return updatedHabits;
    } catch (error) {
      console.error('Error removing habit:', error);
      toast.error('Failed to remove habit');
      return null;
    } finally {
      setProcessingHabitId(null);
    }
  }, [user, habits, updateUser]);

  // Update a habit
  const updateExistingHabit = useCallback(async (habitId: string, updates: Partial<Habit>) => {
    if (!user) {
      toast.error('You must be logged in to update habits');
      return;
    }
    
    try {
      setProcessingHabitId(habitId);
      
      const updatedHabits = await updateHabit(habitId, updates, user.id, habits);
      setHabits(updatedHabits);
      
      // Update user object
      updateUser({ habits: updatedHabits });
      
      return updatedHabits;
    } catch (error) {
      console.error('Error updating habit:', error);
      toast.error('Failed to update habit');
      return null;
    } finally {
      setProcessingHabitId(null);
    }
  }, [user, habits, updateUser]);

  // Complete a habit
  const completeExistingHabit = useCallback(async (habitId: string) => {
    if (!user) {
      toast.error('You must be logged in to complete habits');
      return;
    }
    
    try {
      setProcessingHabitId(habitId);
      
      const updatedHabits = await completeHabit(habitId, user.id, habits);
      setHabits(updatedHabits);
      
      // Update user object
      updateUser({ habits: updatedHabits });
      
      const habit = updatedHabits.find(h => h.id === habitId);
      
      // Check for streak milestones
      if (habit?.streak === 7) {
        toast.success('🔥 7-day streak! "Streak Rookie" badge unlocked!');
      } else if (habit?.streak === 30) {
        toast.success('🏆 30-day streak! "Streak Master" badge unlocked!');
      } else {
        toast.success(`${habit?.name} completed! Streak: ${habit?.streak} days 🔥`);
      }
      
      return updatedHabits;
    } catch (error) {
      console.error('Error completing habit:', error);
      toast.error('Failed to complete habit');
      return null;
    } finally {
      setProcessingHabitId(null);
    }
  }, [user, habits, updateUser]);

  // Toggle habit paused state
  const toggleHabitPausedState = useCallback(async (habitId: string) => {
    if (!user) {
      toast.error('You must be logged in to pause/resume habits');
      return;
    }
    
    try {
      setProcessingHabitId(habitId);
      
      const updatedHabits = await toggleHabitPaused(habitId, user.id, habits);
      setHabits(updatedHabits);
      
      // Update user object
      updateUser({ habits: updatedHabits });
      
      const habit = updatedHabits.find(h => h.id === habitId);
      toast.success(`${habit?.name} ${habit?.isPaused ? 'paused' : 'resumed'}`);
      
      return updatedHabits;
    } catch (error) {
      console.error('Error toggling habit paused state:', error);
      toast.error('Failed to update habit');
      return null;
    } finally {
      setProcessingHabitId(null);
    }
  }, [user, habits, updateUser]);

  // Save multiple habits at once
  const saveHabits = useCallback(async (newHabits: Habit[]) => {
    if (!user) {
      toast.error('You must be logged in to save habits');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update in Firestore
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        'habits': newHabits
      });
      
      setHabits(newHabits);
      
      // Update user object
      updateUser({ habits: newHabits });
      
      toast.success(`Saved ${newHabits.length} habits to your profile!`);
      return newHabits;
    } catch (error) {
      console.error('Error saving habits:', error);
      toast.error('Failed to save habits');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, updateUser]);

  return {
    habits,
    loading,
    processingHabitId,
    addHabit: addNewHabit,
    removeHabit: removeExistingHabit,
    updateHabit: updateExistingHabit,
    completeHabit: completeExistingHabit,
    togglePausedState: toggleHabitPausedState,
    saveHabits
  };
};

export default useHabits;