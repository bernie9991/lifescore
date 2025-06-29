import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface FeedQueryOptions {
  feedType: 'global' | 'friends';
  userId: string;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null;
}

export interface FeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  city: string;
  country: string;
  badge?: { icon: string; name: string };
  type: string;
  title: string;
  subtitle: string;
  content: string;
  smartStat?: string;
  xpEarned?: number;
  currentRank?: number;
  isSelfDeclared: boolean;
  seedCount: number;
  seededBy: string[];
  isVerified: boolean;
  isAdminVerified: boolean;
  timestamp: Date;
  reactions: Record<string, string[]>;
  visual?: string;
  comments: any[];
  metadata?: any;
}

export const buildFeedQuery = async ({
  feedType,
  userId,
  pageSize = 20,
  lastDoc = null
}: FeedQueryOptions) => {
  let feedQuery;
  
  if (feedType === 'friends') {
    // Get user's friends list
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const friendIds = [...(userData?.friends || []), userId]; // Include current user
    
    if (friendIds.length === 0) {
      return null;
    }

    // Query feed items from friends (Firestore 'in' limit is 10)
    const friendBatches = [];
    for (let i = 0; i < friendIds.length; i += 10) {
      const batch = friendIds.slice(i, i + 10);
      let batchQuery = query(
        collection(db, 'feedItems'),
        where('userId', 'in', batch),
        orderBy('timestamp', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        batchQuery = query(
          collection(db, 'feedItems'),
          where('userId', 'in', batch),
          orderBy('timestamp', 'desc'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }

      friendBatches.push(batchQuery);
    }

    return friendBatches;
  } else {
    // Global feed query
    feedQuery = query(
      collection(db, 'feedItems'),
      orderBy('timestamp', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      feedQuery = query(
        collection(db, 'feedItems'),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    return [feedQuery];
  }
};

export const executeFeedQuery = async (queries: any[]): Promise<{
  items: FeedItem[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  const allItems: FeedItem[] = [];
  let lastDocument: QueryDocumentSnapshot<DocumentData> | null = null;

  for (const query of queries) {
    const querySnapshot = await getDocs(query);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allItems.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        city: data.city || 'Unknown',
        country: data.country || 'Unknown',
        badge: data.badge,
        type: data.type,
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        smartStat: data.smartStat,
        xpEarned: data.xpEarned,
        currentRank: data.currentRank,
        isSelfDeclared: data.isSelfDeclared || false,
        seedCount: data.seedCount || 0,
        seededBy: data.seededBy || [],
        isVerified: data.isVerified || false,
        isAdminVerified: data.isAdminVerified || false,
        timestamp: data.timestamp?.toDate() || new Date(),
        reactions: data.reactions || {},
        visual: data.visual,
        comments: data.comments || [],
        metadata: data.metadata
      });
    });

    // Keep track of the last document for pagination
    if (querySnapshot.docs.length > 0) {
      lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
    }
  }

  // Sort all items by timestamp (newest first)
  allItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return {
    items: allItems,
    lastDoc: lastDocument
  };
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading utility for images
export const lazyLoadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

// Optimized image loading with fallback
export const loadImageWithFallback = async (
  primarySrc: string, 
  fallbackSrc?: string
): Promise<string> => {
  try {
    return await lazyLoadImage(primarySrc);
  } catch {
    if (fallbackSrc) {
      try {
        return await lazyLoadImage(fallbackSrc);
      } catch {
        return ''; // Return empty string if both fail
      }
    }
    return '';
  }
};