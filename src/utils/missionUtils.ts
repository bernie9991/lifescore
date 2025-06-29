import { Mission, MissionStep, User } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { formatNumber } from './animations';
import { useAuth } from '../hooks/useAuth';

/**
 * Get the estimated time remaining for a mission
 * @param mission The mission to calculate time for
 * @returns String representation of time remaining
 */
export const getTimeRemaining = (mission: Mission): string => {
  if (mission.status === 'completed') {
    return 'Completed';
  }
  
  if (mission.status === 'failed') {
    return 'Failed';
  }
  
  if (!mission.deadline) {
    // Calculate based on progress and estimated duration
    const totalDays = mission.estimatedDuration;
    const daysElapsed = Math.floor((Date.now() - new Date(mission.startedAt).getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = totalDays - daysElapsed;
    
    if (daysRemaining <= 0) {
      return 'Overdue';
    }
    
    if (daysRemaining === 1) {
      return '1 day remaining';
    }
    
    return `${daysRemaining} days remaining`;
  } else {
    // Calculate based on deadline
    const now = new Date();
    const deadline = new Date(mission.deadline);
    const daysRemaining = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return 'Overdue';
    }
    
    if (daysRemaining === 0) {
      // Calculate hours
      const hoursRemaining = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
      if (hoursRemaining <= 0) {
        return 'Due today';
      }
      return `${hoursRemaining} hours remaining`;
    }
    
    if (daysRemaining === 1) {
      return '1 day remaining';
    }
    
    return `${daysRemaining} days remaining`;
  }
};

/**
 * Get the status color for a mission
 * @param mission The mission to get color for
 * @returns Tailwind color classes
 */
export const getMissionStatusColor = (mission: Mission): { bg: string, text: string, border: string } => {
  if (mission.status === 'completed') {
    return { 
      bg: 'bg-green-500/20', 
      text: 'text-green-400',
      border: 'border-green-500/30'
    };
  }
  
  if (mission.status === 'failed') {
    return { 
      bg: 'bg-red-500/20', 
      text: 'text-red-400',
      border: 'border-red-500/30'
    };
  }
  
  // Based on progress
  if (mission.progress >= 75) {
    return { 
      bg: 'bg-blue-500/20', 
      text: 'text-blue-400',
      border: 'border-blue-500/30'
    };
  }
  
  if (mission.progress >= 50) {
    return { 
      bg: 'bg-purple-500/20', 
      text: 'text-purple-400',
      border: 'border-purple-500/30'
    };
  }
  
  if (mission.progress >= 25) {
    return { 
      bg: 'bg-yellow-500/20', 
      text: 'text-yellow-400',
      border: 'border-yellow-500/30'
    };
  }
  
  return { 
    bg: 'bg-gray-500/20', 
    text: 'text-gray-400',
    border: 'border-gray-500/30'
  };
};

/**
 * Get the status label for a mission
 * @param mission The mission to get status for
 * @returns Status label
 */
export const getMissionStatusLabel = (mission: Mission): string => {
  if (mission.status === 'completed') {
    return 'Completed';
  }
  
  if (mission.status === 'failed') {
    return 'Failed';
  }
  
  if (mission.progress >= 75) {
    return 'Near Completion';
  }
  
  if (mission.progress >= 25) {
    return 'In Progress';
  }
  
  return 'Just Started';
};

/**
 * Get the category icon for a mission
 * @param category The mission category
 * @returns Emoji icon
 */
export const getMissionCategoryIcon = (category: Mission['category']): string => {
  switch (category) {
    case 'wealth': return '💰';
    case 'knowledge': return '🧠';
    case 'health': return '💪';
    case 'career': return '💼';
    case 'personal': return '🌱';
    default: return '🎯';
  }
};

/**
 * Get the difficulty label and color for a mission
 * @param difficulty The mission difficulty
 * @returns Object with label and color
 */
export const getMissionDifficulty = (difficulty: Mission['difficulty']): { label: string, color: string } => {
  switch (difficulty) {
    case 'easy':
      return { label: 'Easy', color: 'text-green-400' };
    case 'medium':
      return { label: 'Medium', color: 'text-yellow-400' };
    case 'hard':
      return { label: 'Hard', color: 'text-orange-400' };
    case 'expert':
      return { label: 'Expert', color: 'text-red-400' };
    default:
      return { label: 'Unknown', color: 'text-gray-400' };
  }
};

/**
 * Complete a mission step
 * @param userId User ID
 * @param missionId Mission ID
 * @param stepId Step ID
 * @returns Updated mission
 */
export const completeMissionStep = async (
  userId: string,
  missionId: string,
  stepId: string,
  missions: Mission[]
): Promise<Mission[]> => {
  try {
    // Find the mission
    const missionIndex = missions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
      throw new Error('Mission not found');
    }
    
    const mission = missions[missionIndex];
    
    // Find the step
    const stepIndex = mission.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) {
      throw new Error('Step not found');
    }
    
    // Check if step is already completed
    if (mission.completedSteps.includes(stepId)) {
      return missions;
    }
    
    // Update the step
    const updatedSteps = [...mission.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      isCompleted: true,
      completedAt: new Date()
    };
    
    // Update completed steps
    const updatedCompletedSteps = [...mission.completedSteps, stepId];
    
    // Calculate new progress
    const newProgress = Math.round((updatedCompletedSteps.length / mission.steps.length) * 100);
    
    // Check if mission is completed
    const newStatus = newProgress === 100 ? 'completed' : mission.status;
    
    // Update mission
    const updatedMission: Mission = {
      ...mission,
      steps: updatedSteps,
      completedSteps: updatedCompletedSteps,
      progress: newProgress,
      status: newStatus,
      lastUpdated: new Date()
    };
    
    // Update missions array
    const updatedMissions = [...missions];
    updatedMissions[missionIndex] = updatedMission;
    
    // Update in Firestore
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'missions': updatedMissions
    });
    
    return updatedMissions;
  } catch (error) {
    console.error('Error completing mission step:', error);
    throw error;
  }
};

/**
 * Get the next incomplete step for a mission
 * @param mission The mission
 * @returns The next incomplete step or null if all steps are completed
 */
export const getNextIncompleteStep = (mission: Mission): MissionStep | null => {
  if (mission.status === 'completed') {
    return null;
  }
  
  return mission.steps.find(step => !mission.completedSteps.includes(step.id)) || null;
};

/**
 * Calculate the contribution of missions to overall LifeScore
 * @param missions User's missions
 * @returns Contribution percentage
 */
export const calculateMissionContribution = (missions: Mission[], lifeScore: number): number => {
  if (!missions || missions.length === 0 || !lifeScore) return 0;
  
  const totalMissionXP = missions.reduce((total, mission) => {
    // For completed missions, add full XP
    if (mission.status === 'completed') {
      return total + mission.xpReward;
    }
    
    // For in-progress missions, add XP from completed steps
    const completedStepsXP = mission.steps
      .filter(step => mission.completedSteps.includes(step.id))
      .reduce((sum, step) => sum + step.xpReward, 0);
    
    return total + completedStepsXP;
  }, 0);
  
  return Math.round((totalMissionXP / lifeScore) * 100);
};

/**
 * Get weekly progress data for missions
 * @param missions User's missions
 * @returns Weekly progress data for charts
 */
export const getMissionWeeklyProgress = (missions: Mission[]): any[] => {
  if (!missions || missions.length === 0) return [];
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  
  // Reorder days to start with today
  const orderedDays = [
    ...days.slice(today),
    ...days.slice(0, today)
  ];
  
  // Generate random data for demo purposes
  // In a real app, this would come from actual user activity
  return orderedDays.map((day, index) => {
    const activeMissions = missions.filter(m => m.status === 'in-progress').length;
    const completedSteps = Math.floor(Math.random() * activeMissions * 2);
    
    return {
      day,
      completedSteps,
      activeMissions
    };
  });
};

/**
 * Get mission comparison data (user vs average)
 * @param missions User's missions
 * @returns Comparison data for charts
 */
export const getMissionComparison = (missions: Mission[]): any[] => {
  if (!missions || missions.length === 0) return [];
  
  return missions.filter(m => m.status === 'in-progress').map(mission => {
    // Generate random average for demo purposes
    // In a real app, this would come from actual user data
    const averageProgress = Math.floor(Math.random() * 70) + 10;
    
    return {
      name: mission.title,
      userProgress: mission.progress,
      averageProgress,
      difference: mission.progress - averageProgress
    };
  });
};

/**
 * Get sample missions for demo purposes
 * @returns Array of sample missions
 */
export const getSampleMissions = (): Mission[] => {
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  return [
    {
      id: 'mission-1',
      title: 'Buy Your First Home',
      description: 'Complete all the necessary steps to purchase your first property, from saving for a down payment to closing the deal.',
      category: 'wealth',
      difficulty: 'hard',
      xpReward: 5000,
      badgeReward: 'homeowner',
      steps: [
        {
          id: 'step-1-1',
          title: 'Save for down payment',
          description: 'Save at least 20% of the home value for a down payment',
          isCompleted: true,
          completedAt: new Date(oneMonthAgo.getTime() + 7 * 24 * 60 * 60 * 1000),
          xpReward: 1000
        },
        {
          id: 'step-1-2',
          title: 'Get pre-approved for a mortgage',
          description: 'Contact lenders and get pre-approved for a mortgage',
          isCompleted: true,
          completedAt: new Date(oneMonthAgo.getTime() + 14 * 24 * 60 * 60 * 1000),
          xpReward: 800
        },
        {
          id: 'step-1-3',
          title: 'Find a real estate agent',
          description: 'Research and hire a reputable real estate agent',
          isCompleted: true,
          completedAt: new Date(oneMonthAgo.getTime() + 21 * 24 * 60 * 60 * 1000),
          xpReward: 500
        },
        {
          id: 'step-1-4',
          title: 'House hunting',
          description: 'Visit at least 10 properties that match your criteria',
          isCompleted: false,
          xpReward: 1200
        },
        {
          id: 'step-1-5',
          title: 'Make an offer and close',
          description: 'Make an offer on your chosen property and complete the closing process',
          isCompleted: false,
          xpReward: 1500
        }
      ],
      startedAt: oneMonthAgo,
      estimatedDuration: 180, // 6 months
      status: 'in-progress',
      progress: 60,
      completedSteps: ['step-1-1', 'step-1-2', 'step-1-3'],
      lastUpdated: new Date(oneMonthAgo.getTime() + 21 * 24 * 60 * 60 * 1000),
      deadline: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 3 months from now
      contributionToLifeScore: 15,
      weeklyProgress: [0, 1, 0, 1, 0, 1, 0],
      comparisonToAverage: 20 // 20% faster than average
    },
    {
      id: 'mission-2',
      title: 'Run a 5K Race',
      description: 'Train for and complete your first 5K race, improving your fitness and endurance.',
      category: 'health',
      difficulty: 'medium',
      xpReward: 2000,
      steps: [
        {
          id: 'step-2-1',
          title: 'Start training program',
          description: 'Begin a Couch to 5K training program',
          isCompleted: true,
          completedAt: new Date(oneMonthAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
          xpReward: 300
        },
        {
          id: 'step-2-2',
          title: 'Run 1 mile without stopping',
          description: 'Build endurance to run 1 mile without walking breaks',
          isCompleted: true,
          completedAt: new Date(oneMonthAgo.getTime() + 10 * 24 * 60 * 60 * 1000),
          xpReward: 400
        },
        {
          id: 'step-2-3',
          title: 'Run 2 miles without stopping',
          description: 'Increase endurance to run 2 miles without walking breaks',
          isCompleted: false,
          xpReward: 500
        },
        {
          id: 'step-2-4',
          title: 'Register for a 5K race',
          description: 'Find and register for an upcoming 5K race in your area',
          isCompleted: false,
          xpReward: 300
        },
        {
          id: 'step-2-5',
          title: 'Complete the 5K race',
          description: 'Participate in and finish the 5K race',
          isCompleted: false,
          xpReward: 500
        }
      ],
      startedAt: oneMonthAgo,
      estimatedDuration: 60, // 2 months
      status: 'in-progress',
      progress: 40,
      completedSteps: ['step-2-1', 'step-2-2'],
      lastUpdated: new Date(oneMonthAgo.getTime() + 10 * 24 * 60 * 60 * 1000),
      deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
      contributionToLifeScore: 8,
      weeklyProgress: [1, 1, 0, 0, 1, 0, 0],
      comparisonToAverage: -5 // 5% slower than average
    },
    {
      id: 'mission-3',
      title: 'Learn a Programming Language',
      description: 'Master a new programming language and build a portfolio project to showcase your skills.',
      category: 'knowledge',
      difficulty: 'medium',
      xpReward: 3000,
      badgeReward: 'code-master',
      steps: [
        {
          id: 'step-3-1',
          title: 'Complete basic tutorials',
          description: 'Finish introductory courses and understand the fundamentals',
          isCompleted: true,
          completedAt: new Date(oneMonthAgo.getTime() + 5 * 24 * 60 * 60 * 1000),
          xpReward: 500
        },
        {
          id: 'step-3-2',
          title: 'Build small practice projects',
          description: 'Create 3 small projects to practice your skills',
          isCompleted: true,
          completedAt: new Date(oneMonthAgo.getTime() + 15 * 24 * 60 * 60 * 1000),
          xpReward: 700
        },
        {
          id: 'step-3-3',
          title: 'Learn advanced concepts',
          description: 'Master advanced topics like data structures and algorithms',
          isCompleted: true,
          completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          xpReward: 800
        },
        {
          id: 'step-3-4',
          title: 'Build a portfolio project',
          description: 'Create a substantial project that showcases your skills',
          isCompleted: false,
          xpReward: 1000
        }
      ],
      startedAt: oneMonthAgo,
      estimatedDuration: 90, // 3 months
      status: 'in-progress',
      progress: 75,
      completedSteps: ['step-3-1', 'step-3-2', 'step-3-3'],
      lastUpdated: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      deadline: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 2 months from now
      contributionToLifeScore: 12,
      weeklyProgress: [0, 1, 1, 0, 1, 0, 0],
      comparisonToAverage: 15 // 15% faster than average
    }
  ];
};