export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarBadge?: Badge;
  age?: number;
  gender?: string;
  country: string;
  city: string;
  lifeScore: number;
  wealth: WealthData;
  knowledge: KnowledgeData;
  assets: Asset[];
  badges: Badge[];
  friends: string[];
  createdAt: Date;
  lastActive: Date;
  scoreBreakdown?: any;
  wantsIntegrations?: boolean;
  role: string;
}

export interface WealthData {
  id?: string;
  salary?: number;
  savings?: number;
  investments?: number;
  currency: string;
  total: number;
}

export interface KnowledgeData {
  id?: string;
  education: string;
  certificates: string[];
  languages: string[];
  total: number;
}

export interface Asset {
  id: string;
  type: string;
  name: string;
  value: number;
  verified?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'wealth' | 'knowledge' | 'assets' | 'community' | 'leaderboards' | 'progress' | 'legendary' | 'hidden';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockCriteria: string;
  isHidden?: boolean;
  unlockedAt?: Date;
  progress?: number;
  total?: number;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  status: 'unlocked' | 'locked' | 'in-progress';
  unlockedAt?: Date;
  progress?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  change: number;
  badge?: Badge;
}

export interface CustomLeaderboard {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  isPrivate: boolean;
  createdAt: Date;
}

export interface ActivityUpdate {
  id: string;
  userId: string;
  type: 'badge' | 'rank' | 'achievement' | 'friend';
  message: string;
  data?: any;
  createdAt: Date;
  likes: number;
}