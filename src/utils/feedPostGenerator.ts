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
    console.log('🔄 FEED POST: Generating feed post:', { updateType, specificData });
    
    // Check if we should create a post for this update
    const shouldCreatePost = determineIfPostNeeded(user, previousUser, updateType, specificData);
    
    if (!shouldCreatePost) {
      console.log('❌ FEED POST: No feed post needed for this update');
      return false;
    }

    // Check for recent posts (within 24 hours) to potentially group updates
    const recentPost = await findRecentUserPost(user.id);
    
    // Generate update data
    const updateData = generateUpdateData(user, previousUser, updateType, specificData);
    
    if (recentPost && shouldGroupWithRecentPost(updateType, recentPost.type)) {
      // Update existing post with new information
      console.log('🔄 FEED POST: Updating existing post:', recentPost.id);
      await updateExistingPost(recentPost.id, updateData);
      return true;
    } else {
      // Create new feed post
      console.log('✅ FEED POST: Creating new feed post');
      await createNewFeedPost(user, updateData);
      return true;
    }
  } catch (error) {
    console.error('❌ FEED POST ERROR:', error);
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
    console.log('❌ FEED POST: User has not completed onboarding, skipping post');
    return false;
  }

  switch (updateType) {
    case UpdateType.BADGE_EARNED:
      // Always create posts for badges
      console.log('✅ FEED POST: Creating post for badge earned');
      return true;
      
    case UpdateType.CERTIFICATION_ADDED:
      // Only create posts if there's actual new certification data
      if (!specificData || !specificData.certName) {
        console.log('❌ FEED POST: No certification name provided');
        return false;
      }
      console.log('✅ FEED POST: Creating post for certification added:', specificData.certName);
      return true;
      
    case UpdateType.WEALTH_UPDATE:
      // Only post significant wealth updates (>5% increase)
      if (!previousUser || !previousUser.wealth) {
        console.log('❌ FEED POST: No previous wealth data to compare');
        return false;
      }
      const prevTotal = previousUser.wealth.total || 0;
      const currentTotal = user.wealth?.total || 0;
      const percentChange = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;
      console.log(`🔄 FEED POST: Wealth change: ${percentChange.toFixed(2)}% (${prevTotal} -> ${currentTotal})`);
      return percentChange >= 5;
      
    case UpdateType.ASSET_ADDED:
      // Always post when an asset is added
      if (!specificData) {
        console.log('❌ FEED POST: No asset data provided');
        return false;
      }
      console.log('✅ FEED POST: Creating post for asset added:', specificData.name);
      return true;
      
    case UpdateType.PROFILE_PICTURE:
      // Only post if this is the first profile picture or a change after 30+ days
      if (!user.avatar) {
        console.log('❌ FEED POST: No avatar to post about');
        return false;
      }
      if (!previousUser?.avatar) {
        console.log('✅ FEED POST: Creating post for first profile picture');
        return true;
      }
      
      // Check if it's been at least 30 days since the last profile picture update
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const shouldPost = previousUser.lastActive < thirtyDaysAgo;
      console.log(`${shouldPost ? '✅' : '❌'} FEED POST: Profile picture update ${shouldPost ? 'will' : 'will not'} create post`);
      return shouldPost;
      
    case UpdateType.LANGUAGE_ADDED:
      // Post when a new language is added
      if (!specificData || !specificData.language) {
        console.log('❌ FEED POST: No language data provided');
        return false;
      }
      console.log('✅ FEED POST: Creating post for language added:', specificData.language);
      return true;
      
    case UpdateType.EDUCATION_UPDATE:
      // Post when education level changes
      if (!specificData || !specificData.education) {
        console.log('❌ FEED POST: No education data provided');
        return false;
      }
      console.log('✅ FEED POST: Creating post for education update:', specificData.education);
      return true;
      
    default:
      console.log('❌ FEED POST: Unknown update type:', updateType);
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
    console.log('🔄 FEED POST: No recent posts found');
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  console.log('🔄 FEED POST: Found recent post:', doc.id);
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
    console.log('🔄 FEED POST: Grouping with existing post of same type');
    return true;
  }
  
  // Group related update types
  const relatedGroups = [
    [UpdateType.CERTIFICATION_ADDED, UpdateType.EDUCATION_UPDATE, UpdateType.LANGUAGE_ADDED],
    [UpdateType.WEALTH_UPDATE, UpdateType.ASSET_ADDED]
  ];
  
  const shouldGroup = relatedGroups.some(group => 
    group.includes(newType) && group.includes(existingType as UpdateType)
  );
  
  console.log(`${shouldGroup ? '🔄' : '❌'} FEED POST: ${shouldGroup ? 'Grouping' : 'Not grouping'} with existing post`);
  return shouldGroup;
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
  console.log('🔄 FEED POST: Would update existing post:', postId, updateData);
  // This would be implemented with Firestore document update
};

/**
 * Create a new feed post
 */
const createNewFeedPost = async (user: User, updateData: UpdateData) => {
  try {
    console.log('✅ FEED POST: Creating new feed post:', updateData);
    
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
    
    const docRef = await addDoc(collection(db, 'feedItems'), feedItemData);
    console.log('✅ FEED POST: Created new feed post with ID:', docRef.id);
    return true;
  } catch (error) {
    console.error('❌ FEED POST ERROR:', error);
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