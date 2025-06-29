import { User, Badge } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

// Types of profile updates to track
export enum UpdateType {
  CERTIFICATION_ADDED = 'certification-added',
  BADGE_EARNED = 'badge-earned',
  SKILL_ADDED = 'skill-added',
  ACHIEVEMENT = 'achievement',
  PROFILE_PICTURE = 'profile-picture',
  WEALTH_UPDATE = 'wealth-update',
  ASSET_ADDED = 'asset-added',
  EDUCATION_UPDATE = 'education-update',
  LANGUAGE_ADDED = 'language-added'
}

interface UpdateData {
  type: UpdateType;
  title: string;
  content: string;
  metadata?: any;
}

/**
 * Generates and posts feed updates based on user profile changes
 */
export const generateFeedPost = async (
  user: User,
  previousUser: User | null,
  updateType: UpdateType,
  specificData?: any
): Promise<boolean> => {
  try {
    // Check if we should create a post for this update
    const shouldCreatePost = determineIfPostNeeded(user, previousUser, updateType, specificData);
    
    if (!shouldCreatePost) {
      console.log('No feed post needed for this update');
      return false;
    }

    // Check for recent posts (within 24 hours) to potentially group updates
    const recentPost = await findRecentUserPost(user.id);
    
    // Generate update data
    const updateData = generateUpdateData(user, previousUser, updateType, specificData);
    
    if (recentPost && shouldGroupWithRecentPost(updateType, recentPost.type)) {
      // Update existing post with new information
      await updateExistingPost(recentPost.id, updateData);
      return true;
    } else {
      // Create new feed post
      await createNewFeedPost(user, updateData);
      return true;
    }
  } catch (error) {
    console.error('Error generating feed post:', error);
    return false;
  }
};

/**
 * Determines if a post should be created for this update
 */
const determineIfPostNeeded = (
  user: User,
  previousUser: User | null,
  updateType: UpdateType,
  specificData?: any
): boolean => {
  // Skip posts for users who haven't completed onboarding
  if (!user.username) {
    return false;
  }

  switch (updateType) {
    case UpdateType.BADGE_EARNED:
      // Always create posts for badges
      return true;
      
    case UpdateType.CERTIFICATION_ADDED:
      // Only create posts if there's actual new certification data
      if (!specificData || !specificData.certName) {
        return false;
      }
      return true;
      
    case UpdateType.WEALTH_UPDATE:
      // Only post significant wealth updates (>10% increase)
      if (!previousUser || !previousUser.wealth) {
        return false;
      }
      const prevTotal = previousUser.wealth.total || 0;
      const currentTotal = user.wealth?.total || 0;
      const percentChange = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;
      return percentChange >= 10;
      
    case UpdateType.ASSET_ADDED:
      // Always post when a significant asset is added
      return !!specificData && specificData.value >= 10000;
      
    case UpdateType.PROFILE_PICTURE:
      // Only post if this is the first profile picture or a change after 30+ days
      if (!user.avatar) return false;
      if (!previousUser?.avatar) return true;
      
      // Check if it's been at least 30 days since the last profile picture update
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return previousUser.lastActive < thirtyDaysAgo;
      
    case UpdateType.LANGUAGE_ADDED:
      // Post when a new language is added
      return !!specificData && !!specificData.language;
      
    case UpdateType.EDUCATION_UPDATE:
      // Post when education level changes
      return !!specificData && !!specificData.education;
      
    default:
      return false;
  }
};

/**
 * Find recent posts by the user (within last 24 hours)
 */
const findRecentUserPost = async (userId: string) => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const feedQuery = query(
    collection(db, 'feedItems'),
    where('userId', '==', userId),
    where('timestamp', '>=', oneDayAgo),
    orderBy('timestamp', 'desc'),
    limit(1)
  );
  
  const querySnapshot = await getDocs(feedQuery);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate()
  };
};

/**
 * Determine if updates should be grouped in the same post
 */
const shouldGroupWithRecentPost = (newType: UpdateType, existingType: string): boolean => {
  // Group similar update types
  if (newType === existingType) {
    return true;
  }
  
  // Group related update types
  const relatedGroups = [
    [UpdateType.CERTIFICATION_ADDED, UpdateType.EDUCATION_UPDATE, UpdateType.LANGUAGE_ADDED],
    [UpdateType.WEALTH_UPDATE, UpdateType.ASSET_ADDED]
  ];
  
  return relatedGroups.some(group => 
    group.includes(newType) && group.includes(existingType as UpdateType)
  );
};

/**
 * Generate update data based on the type of update
 */
const generateUpdateData = (
  user: User,
  previousUser: User | null,
  updateType: UpdateType,
  specificData?: any
): UpdateData => {
  switch (updateType) {
    case UpdateType.BADGE_EARNED:
      const badge = specificData as Badge;
      return {
        type: UpdateType.BADGE_EARNED,
        title: `${user.name} earned a new badge!`,
        content: `${user.name} unlocked the "${badge.name}" badge: ${badge.description}`,
        metadata: {
          badge: {
            id: badge.id,
            name: badge.name,
            icon: badge.icon,
            rarity: badge.rarity
          },
          xpEarned: badge.xpReward
        }
      };
      
    case UpdateType.CERTIFICATION_ADDED:
      return {
        type: UpdateType.CERTIFICATION_ADDED,
        title: `${user.name} earned a new certification!`,
        content: `${user.name} added "${specificData.certName}" to their professional certifications.`,
        metadata: {
          certification: specificData.certName
        }
      };
      
    case UpdateType.WEALTH_UPDATE:
      const prevTotal = (previousUser?.wealth?.total || 0);
      const currentTotal = (user.wealth?.total || 0);
      const difference = currentTotal - prevTotal;
      const percentChange = prevTotal > 0 ? ((difference / prevTotal) * 100).toFixed(0) : '∞';
      
      return {
        type: UpdateType.WEALTH_UPDATE,
        title: `${user.name} reported a wealth increase!`,
        content: `${user.name}'s net worth increased by ${percentChange}%.`,
        metadata: {
          previousTotal: prevTotal,
          currentTotal: currentTotal,
          difference: difference,
          percentChange: percentChange
        }
      };
      
    case UpdateType.ASSET_ADDED:
      return {
        type: UpdateType.ASSET_ADDED,
        title: `${user.name} added a new asset!`,
        content: `${user.name} added a new ${specificData.type}: ${specificData.name} valued at $${specificData.value.toLocaleString()}.`,
        metadata: {
          assetType: specificData.type,
          assetName: specificData.name,
          assetValue: specificData.value
        }
      };
      
    case UpdateType.PROFILE_PICTURE:
      return {
        type: UpdateType.PROFILE_PICTURE,
        title: `${user.name} updated their profile picture!`,
        content: `${user.name} has a new profile picture.`,
        metadata: {
          avatarUrl: user.avatar
        }
      };
      
    case UpdateType.LANGUAGE_ADDED:
      return {
        type: UpdateType.LANGUAGE_ADDED,
        title: `${user.name} added a new language!`,
        content: `${user.name} now speaks ${specificData.language}.`,
        metadata: {
          language: specificData.language
        }
      };
      
    case UpdateType.EDUCATION_UPDATE:
      return {
        type: UpdateType.EDUCATION_UPDATE,
        title: `${user.name} updated their education!`,
        content: `${user.name} updated their education to ${specificData.education}.`,
        metadata: {
          education: specificData.education
        }
      };
      
    default:
      return {
        type: UpdateType.ACHIEVEMENT,
        title: `${user.name} made a profile update!`,
        content: `${user.name} updated their profile.`
      };
  }
};

/**
 * Update an existing feed post with new information
 */
const updateExistingPost = async (postId: string, updateData: UpdateData) => {
  // Implementation would update the existing post document
  console.log('Would update existing post:', postId, updateData);
  // This would be implemented with Firestore document update
};

/**
 * Create a new feed post
 */
const createNewFeedPost = async (user: User, updateData: UpdateData) => {
  try {
    const feedItemData = {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      city: user.city,
      country: user.country,
      type: updateData.type,
      title: updateData.title,
      subtitle: '',
      content: updateData.content,
      isSelfDeclared: false,
      seedCount: 0,
      seededBy: [],
      isVerified: true,
      isAdminVerified: false,
      timestamp: serverTimestamp(),
      reactions: {},
      comments: [],
      ...updateData.metadata && { metadata: updateData.metadata },
      ...updateData.metadata?.badge && { badge: updateData.metadata.badge },
      ...updateData.metadata?.xpEarned && { xpEarned: updateData.metadata.xpEarned }
    };
    
    await addDoc(collection(db, 'feedItems'), feedItemData);
    console.log('Created new feed post for', user.name, 'of type', updateData.type);
    return true;
  } catch (error) {
    console.error('Error creating feed post:', error);
    return false;
  }
};

/**
 * Utility to truncate content to a maximum length
 */
export const truncateContent = (content: string, maxLength: number = 250): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength - 3) + '...';
};