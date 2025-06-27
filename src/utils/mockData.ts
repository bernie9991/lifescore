import { User, Badge, ActivityUpdate, LeaderboardEntry } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
  age: 28,
  gender: 'male',
  country: 'United States',
  city: 'San Francisco',
  lifeScore: 7850,
  wealth: {
    salary: 120000,
    savings: 45000,
    investments: 35000,
    currency: 'USD',
    total: 200000
  },
  knowledge: {
    education: 'Masters',
    certificates: ['AWS Certified', 'PMP'],
    languages: ['English', 'Spanish', 'French'],
    total: 2500
  },
  assets: [
    { id: '1', type: 'car', name: '2022 Tesla Model 3', value: 45000 },
    { id: '2', type: 'home', name: 'Apartment', value: 800000 }
  ],
  badges: [],
  friends: ['2', '3', '4'],
  createdAt: new Date('2024-01-15'),
  lastActive: new Date()
};

export const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Wealth Apprentice',
    description: 'Reach $50,000 in total wealth',
    icon: '💰',
    category: 'wealth',
    rarity: 'common',
    xpReward: 500,
    unlockCriteria: 'Accumulate $50,000 in total net worth',
    unlockedAt: new Date('2024-02-01')
  },
  {
    id: '2',
    name: 'Knowledge Seeker',
    description: 'Earn your first degree',
    icon: '🎓',
    category: 'knowledge',
    rarity: 'common',
    xpReward: 300,
    unlockCriteria: 'Add education level to profile',
    unlockedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Asset Collector',
    description: 'Own 5 different types of assets',
    icon: '🏆',
    category: 'assets',
    rarity: 'rare',
    xpReward: 1000,
    unlockCriteria: 'Add 5 or more different asset types',
    progress: 2,
    total: 5
  },
  {
    id: '4',
    name: 'Polyglot',
    description: 'Speak 5+ languages fluently',
    icon: '🌍',
    category: 'knowledge',
    rarity: 'epic',
    xpReward: 2000,
    unlockCriteria: 'Add 5 or more languages to profile',
    progress: 3,
    total: 5
  },
  {
    id: '5',
    name: 'Millionaire',
    description: 'Reach $1,000,000 in net worth',
    icon: '💎',
    category: 'wealth',
    rarity: 'legendary',
    xpReward: 5000,
    unlockCriteria: 'Accumulate $1,000,000 in total net worth',
    progress: 200000,
    total: 1000000
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user: { ...mockUser, name: 'Sarah Chen', lifeScore: 12500, country: 'Singapore' },
    score: 12500,
    change: 2,
    badge: mockBadges[0]
  },
  {
    rank: 2,
    user: { ...mockUser, name: 'Marcus Williams', lifeScore: 11200, country: 'Canada' },
    score: 11200,
    change: -1,
    badge: mockBadges[1]
  },
  {
    rank: 3,
    user: { ...mockUser, name: 'Elena Rodriguez', lifeScore: 10800, country: 'Spain' },
    score: 10800,
    change: 1,
    badge: mockBadges[2]
  },
  {
    rank: 47,
    user: mockUser,
    score: 7850,
    change: 7,
    badge: mockBadges[0]
  }
];

export const mockActivityFeed: ActivityUpdate[] = [
  {
    id: '1',
    userId: '1',
    type: 'badge',
    message: 'You unlocked 💰 Wealth Apprentice',
    createdAt: new Date('2024-03-10T10:30:00'),
    likes: 5
  },
  {
    id: '2',
    userId: '2',
    type: 'rank',
    message: 'Sarah moved up 5 spots globally',
    createdAt: new Date('2024-03-10T09:15:00'),
    likes: 12
  },
  {
    id: '3',
    userId: '3',
    type: 'achievement',
    message: 'Marcus earned Knowledge Tycoon 🧠',
    createdAt: new Date('2024-03-10T08:45:00'),
    likes: 8
  }
];

// Mock ranking functions
export const getGlobalRank = (lifeScore: number): number => {
  // Simple mock implementation - in real app this would query the database
  const ranks = [
    { score: 12500, rank: 1 },
    { score: 11200, rank: 2 },
    { score: 10800, rank: 3 },
    { score: 9500, rank: 10 },
    { score: 8000, rank: 25 },
    { score: 7850, rank: 47 },
    { score: 7000, rank: 100 },
    { score: 5000, rank: 500 },
    { score: 3000, rank: 1000 }
  ];
  
  for (const entry of ranks) {
    if (lifeScore >= entry.score) {
      return entry.rank;
    }
  }
  
  return 10000; // Default rank for very low scores
};

export const getCountryRank = (lifeScore: number, country: string): number => {
  // Simple mock implementation - in real app this would query the database by country
  const countryMultiplier = country === 'United States' ? 0.3 : 0.5;
  const globalRank = getGlobalRank(lifeScore);
  return Math.max(1, Math.floor(globalRank * countryMultiplier));
};