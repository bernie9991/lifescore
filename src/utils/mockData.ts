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
  lastActive: new Date(),
  role: 'user'
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

// Mock friends data
export const getMockFriends = (): User[] => {
  return [
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      age: 26,
      gender: 'female',
      country: 'Singapore',
      city: 'Singapore',
      lifeScore: 12500,
      wealth: { salary: 150000, savings: 80000, investments: 120000, currency: 'SGD', total: 350000 },
      knowledge: { education: 'Masters', certificates: ['Google Cloud', 'Scrum Master'], languages: ['English', 'Mandarin', 'Malay'], total: 3200 },
      assets: [{ id: '1', type: 'home', name: 'Condo', value: 900000 }],
      badges: [],
      friends: ['1', '3'],
      createdAt: new Date('2024-01-10'),
      lastActive: new Date(),
      role: 'user'
    },
    {
      id: '3',
      name: 'Marcus Williams',
      email: 'marcus@example.com',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      age: 32,
      gender: 'male',
      country: 'Canada',
      city: 'Toronto',
      lifeScore: 11200,
      wealth: { salary: 110000, savings: 60000, investments: 90000, currency: 'CAD', total: 260000 },
      knowledge: { education: 'Bachelors', certificates: ['PMP', 'Six Sigma'], languages: ['English', 'French'], total: 2800 },
      assets: [{ id: '1', type: 'car', name: 'BMW X5', value: 65000 }],
      badges: [],
      friends: ['1', '2'],
      createdAt: new Date('2024-01-05'),
      lastActive: new Date(),
      role: 'user'
    },
    {
      id: '4',
      name: 'Elena Rodriguez',
      email: 'elena@example.com',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      age: 29,
      gender: 'female',
      country: 'Spain',
      city: 'Madrid',
      lifeScore: 10800,
      wealth: { salary: 85000, savings: 40000, investments: 55000, currency: 'EUR', total: 180000 },
      knowledge: { education: 'Masters', certificates: ['Adobe Certified', 'Google Analytics'], languages: ['Spanish', 'English', 'Portuguese', 'Italian'], total: 3000 },
      assets: [{ id: '1', type: 'art', name: 'Art Collection', value: 25000 }],
      badges: [],
      friends: ['1'],
      createdAt: new Date('2024-01-20'),
      lastActive: new Date(),
      role: 'user'
    },
    {
      id: '5',
      name: 'David Kim',
      email: 'david@example.com',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      age: 31,
      gender: 'male',
      country: 'South Korea',
      city: 'Seoul',
      lifeScore: 9500,
      wealth: { salary: 95000, savings: 35000, investments: 45000, currency: 'KRW', total: 175000 },
      knowledge: { education: 'Bachelors', certificates: ['AWS', 'Kubernetes'], languages: ['Korean', 'English', 'Japanese'], total: 2400 },
      assets: [{ id: '1', type: 'car', name: 'Hyundai Genesis', value: 40000 }],
      badges: [],
      friends: [],
      createdAt: new Date('2024-02-01'),
      lastActive: new Date(),
      role: 'user'
    }
  ];
};

// Mock leaderboard data
export const getMockLeaderboard = (tab: string, currentUser: User): LeaderboardEntry[] => {
  const mockUsers = getMockFriends();
  const allUsers = [...mockUsers, currentUser];
  
  // Sort based on tab type
  let sortedUsers = [...allUsers];
  
  switch (tab) {
    case 'wealth':
      sortedUsers.sort((a, b) => (b.wealth?.total || 0) - (a.wealth?.total || 0));
      break;
    case 'knowledge':
      sortedUsers.sort((a, b) => (b.knowledge?.total || 0) - (a.knowledge?.total || 0));
      break;
    case 'local':
      sortedUsers = sortedUsers.filter(u => u.country === currentUser.country);
      sortedUsers.sort((a, b) => b.lifeScore - a.lifeScore);
      break;
    case 'friends':
      sortedUsers = sortedUsers.filter(u => currentUser.friends?.includes(u.id) || u.id === currentUser.id);
      sortedUsers.sort((a, b) => b.lifeScore - a.lifeScore);
      break;
    default: // global
      sortedUsers.sort((a, b) => b.lifeScore - a.lifeScore);
  }
  
  return sortedUsers.map((user, index) => ({
    rank: index + 1,
    user,
    score: tab === 'wealth' ? (user.wealth?.total || 0) : 
           tab === 'knowledge' ? (user.knowledge?.total || 0) : 
           user.lifeScore,
    change: Math.floor(Math.random() * 20) - 10, // Random change for demo
    badge: mockBadges[Math.floor(Math.random() * mockBadges.length)]
  }));
};

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