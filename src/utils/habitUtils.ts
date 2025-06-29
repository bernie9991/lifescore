import { Habit } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

/**
 * Resets the completedToday status for all habits at midnight
 * @param habits The user's habits
 * @param userId The user's ID
 * @returns Updated habits with reset completedToday status
 */
export const resetDailyHabits = async (habits: Habit[], userId: string): Promise<Habit[]> => {
  try {
    if (!habits || habits.length === 0) return [];
    
    // Reset completedToday flag for all habits
    const resetHabits = habits.map(habit => ({
      ...habit,
      completedToday: false
    }));
    
    // Update in Firestore
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'habits': resetHabits
    });
    
    return resetHabits;
  } catch (error) {
    console.error('Error resetting daily habits:', error);
    throw error;
  }
};

/**
 * Checks for streak breaks and resets streaks if needed
 * @param habits The user's habits
 * @param userId The user's ID
 * @returns Updated habits with adjusted streaks
 */
export const checkAndUpdateStreaks = async (habits: Habit[], userId: string): Promise<Habit[]> => {
  try {
    if (!habits || habits.length === 0) return [];
    
    const now = new Date();
    const updatedHabits = habits.map(habit => {
      // Skip paused habits
      if (habit.isPaused) return habit;
      
      // If no lastCompleted date, keep streak as is
      if (!habit.lastCompleted) return habit;
      
      const lastCompleted = new Date(habit.lastCompleted);
      const daysSinceLastCompleted = Math.floor(
        (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // If more than 1 day has passed since last completion, reset streak
      if (daysSinceLastCompleted > 1) {
        return {
          ...habit,
          streak: 0
        };
      }
      
      return habit;
    });
    
    // Update in Firestore
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'habits': updatedHabits
    });
    
    return updatedHabits;
  } catch (error) {
    console.error('Error checking and updating streaks:', error);
    throw error;
  }
};

/**
 * Adds a new habit to the user's habits
 * @param habit The habit to add
 * @param userId The user's ID
 * @param currentHabits The user's current habits
 * @returns Updated habits array with the new habit
 */
export const addHabit = async (
  habit: Omit<Habit, 'streak' | 'completedToday' | 'lastCompleted' | 'selectedAt' | 'totalCompletions' | 'weeklyProgress' | 'successRate'>, 
  userId: string,
  currentHabits: Habit[]
): Promise<Habit[]> => {
  try {
    // Check if habit already exists
    if (currentHabits.some(h => h.id === habit.id)) {
      throw new Error('Habit already exists');
    }
    
    // Create new habit with default values
    const newHabit: Habit = {
      ...habit,
      streak: 0,
      completedToday: false,
      selectedAt: new Date(),
      totalCompletions: 0,
      weeklyProgress: new Array(7).fill(0),
      successRate: 0
    };
    
    // Update in Firestore
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'habits': arrayUnion(newHabit)
    });
    
    return [...currentHabits, newHabit];
  } catch (error) {
    console.error('Error adding habit:', error);
    throw error;
  }
};

/**
 * Removes a habit from the user's habits
 * @param habitId The ID of the habit to remove
 * @param userId The user's ID
 * @param currentHabits The user's current habits
 * @returns Updated habits array without the removed habit
 */
export const removeHabit = async (
  habitId: string,
  userId: string,
  currentHabits: Habit[]
): Promise<Habit[]> => {
  try {
    const habitToRemove = currentHabits.find(h => h.id === habitId);
    if (!habitToRemove) {
      throw new Error('Habit not found');
    }
    
    const updatedHabits = currentHabits.filter(h => h.id !== habitId);
    
    // Update in Firestore
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'habits': arrayRemove(habitToRemove)
    });
    
    return updatedHabits;
  } catch (error) {
    console.error('Error removing habit:', error);
    throw error;
  }
};

/**
 * Updates a habit's properties
 * @param habitId The ID of the habit to update
 * @param updates The properties to update
 * @param userId The user's ID
 * @param currentHabits The user's current habits
 * @returns Updated habits array with the modified habit
 */
export const updateHabit = async (
  habitId: string,
  updates: Partial<Habit>,
  userId: string,
  currentHabits: Habit[]
): Promise<Habit[]> => {
  try {
    const updatedHabits = currentHabits.map(habit => 
      habit.id === habitId ? { ...habit, ...updates } : habit
    );
    
    // Update in Firestore
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'habits': updatedHabits
    });
    
    return updatedHabits;
  } catch (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

/**
 * Completes a habit for the day
 * @param habitId The ID of the habit to complete
 * @param userId The user's ID
 * @param currentHabits The user's current habits
 * @returns Updated habits array with the completed habit
 */
export const completeHabit = async (
  habitId: string,
  userId: string,
  currentHabits: Habit[]
): Promise<Habit[]> => {
  try {
    const updatedHabits = currentHabits.map(habit => {
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
    
    // Update in Firestore
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'habits': updatedHabits
    });
    
    return updatedHabits;
  } catch (error) {
    console.error('Error completing habit:', error);
    throw error;
  }
};

/**
 * Toggles the paused state of a habit
 * @param habitId The ID of the habit to toggle
 * @param userId The user's ID
 * @param currentHabits The user's current habits
 * @returns Updated habits array with the toggled habit
 */
export const toggleHabitPaused = async (
  habitId: string,
  userId: string,
  currentHabits: Habit[]
): Promise<Habit[]> => {
  try {
    const updatedHabits = currentHabits.map(habit => 
      habit.id === habitId ? { ...habit, isPaused: !habit.isPaused } : habit
    );
    
    // Update in Firestore
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'habits': updatedHabits
    });
    
    return updatedHabits;
  } catch (error) {
    console.error('Error toggling habit paused state:', error);
    throw error;
  }
};

/**
 * Gets habit statistics for a user
 * @param habits The user's habits
 * @returns Object containing habit statistics
 */
export const getHabitStats = (habits: Habit[]) => {
  if (!habits || habits.length === 0) {
    return {
      completedToday: 0,
      bestStreak: 0,
      totalCompletions: 0,
      averageSuccessRate: 0,
      categoryBreakdown: {
        mind: 0,
        body: 0,
        work: 0,
        social: 0
      }
    };
  }
  
  const completedToday = habits.filter(h => h.completedToday).length;
  const bestStreak = Math.max(...habits.map(h => h.streak || 0), 0);
  const totalCompletions = habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0);
  const averageSuccessRate = habits.length > 0 
    ? Math.round(habits.reduce((sum, h) => sum + (h.successRate || 0), 0) / habits.length) 
    : 0;
  
  // Category breakdown
  const categoryBreakdown = habits.reduce((acc, habit) => {
    acc[habit.category] = (acc[habit.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    completedToday,
    bestStreak,
    totalCompletions,
    averageSuccessRate,
    categoryBreakdown
  };
};