import { Badge, User, UserBadge } from '../types';
import { calculateLifeScore, getScoreLevel, estimateGlobalStanding } from './lifeScoreEngine';

// Complete Badge Database - 50+ Badges
export const ALL_BADGES: Badge[] = [
  // === PROGRESS BADGES ===
  {
    id: 'welcome-aboard',
    name: 'Welcome Aboard',
    description: 'Complete your first LifeScore calculation',
    icon: '🎉',
    category: 'progress',
    rarity: 'common',
    xpReward: 100,
    unlockCriteria: 'Complete onboarding and first score calculation'
  },
  {
    id: 'profile-complete',
    name: 'Profile Complete',
    description: 'Fill out all basic profile information',
    icon: '✅',
    category: 'progress',
    rarity: 'common',
    xpReward: 200,
    unlockCriteria: 'Complete name, location, and basic details'
  },
  {
    id: 'first-update',
    name: 'First Update',
    description: 'Update your profile for the first time',
    icon: '🔄',
    category: 'progress',
    rarity: 'common',
    xpReward: 150,
    unlockCriteria: 'Make your first profile update'
  },
  {
    id: 'xp-master',
    name: 'XP Master',
    description: 'Reach 10,000 total XP',
    icon: '⚡',
    category: 'progress',
    rarity: 'rare',
    xpReward: 1000,
    unlockCriteria: 'Accumulate 10,000 total XP'
  },
  {
    id: 'score-climber',
    name: 'Score Climber',
    description: 'Increase your LifeScore by 2,000 points',
    icon: '📈',
    category: 'progress',
    rarity: 'uncommon',
    xpReward: 500,
    unlockCriteria: 'Improve LifeScore by 2,000 points from initial'
  },

  // === WEALTH BADGES ===
  {
    id: 'wealth-apprentice',
    name: 'Wealth Apprentice',
    description: 'Reach $50,000 in total wealth',
    icon: '💰',
    category: 'wealth',
    rarity: 'common',
    xpReward: 500,
    unlockCriteria: 'Accumulate $50,000 in total net worth'
  },
  {
    id: 'wealth-warrior',
    name: 'Wealth Warrior',
    description: 'Reach $100,000 in total wealth',
    icon: '⚔️',
    category: 'wealth',
    rarity: 'uncommon',
    xpReward: 750,
    unlockCriteria: 'Accumulate $100,000 in total net worth'
  },
  {
    id: 'wealth-champion',
    name: 'Wealth Champion',
    description: 'Reach $250,000 in total wealth',
    icon: '🏆',
    category: 'wealth',
    rarity: 'rare',
    xpReward: 1500,
    unlockCriteria: 'Accumulate $250,000 in total net worth'
  },
  {
    id: 'half-millionaire',
    name: 'Half Millionaire',
    description: 'Reach $500,000 in total wealth',
    icon: '💎',
    category: 'wealth',
    rarity: 'epic',
    xpReward: 2500,
    unlockCriteria: 'Accumulate $500,000 in total net worth'
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Reach $1,000,000 in total wealth',
    icon: '👑',
    category: 'wealth',
    rarity: 'legendary',
    xpReward: 5000,
    unlockCriteria: 'Accumulate $1,000,000 in total net worth'
  },
  {
    id: 'investor-pro',
    name: 'Investor Pro',
    description: 'Have $100,000+ in investments',
    icon: '📊',
    category: 'wealth',
    rarity: 'rare',
    xpReward: 1000,
    unlockCriteria: 'Maintain $100,000+ in investment portfolio'
  },
  {
    id: 'saver-supreme',
    name: 'Saver Supreme',
    description: 'Have $50,000+ in savings',
    icon: '🏦',
    category: 'wealth',
    rarity: 'uncommon',
    xpReward: 600,
    unlockCriteria: 'Maintain $50,000+ in savings account'
  },
  {
    id: 'high-earner',
    name: 'High Earner',
    description: 'Annual salary of $100,000+',
    icon: '💵',
    category: 'wealth',
    rarity: 'rare',
    xpReward: 800,
    unlockCriteria: 'Report annual salary of $100,000 or more'
  },

  // === KNOWLEDGE BADGES ===
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Add your first degree or education level',
    icon: '🎓',
    category: 'knowledge',
    rarity: 'common',
    xpReward: 300,
    unlockCriteria: 'Add education level to profile'
  },
  {
    id: 'skill-stacker',
    name: 'Skill Stacker',
    description: 'Add 3+ professional certificates',
    icon: '📜',
    category: 'knowledge',
    rarity: 'uncommon',
    xpReward: 600,
    unlockCriteria: 'Add 3 or more professional certificates'
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    description: 'Speak 5+ languages fluently',
    icon: '🌍',
    category: 'knowledge',
    rarity: 'epic',
    xpReward: 2000,
    unlockCriteria: 'Add 5 or more languages to profile'
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Achieve Masters degree or higher',
    icon: '📚',
    category: 'knowledge',
    rarity: 'rare',
    xpReward: 1200,
    unlockCriteria: 'Have Masters, Doctorate, or PhD education level'
  },
  {
    id: 'doctorate-holder',
    name: 'Doctorate Holder',
    description: 'Hold a Doctorate or PhD degree',
    icon: '🎖️',
    category: 'knowledge',
    rarity: 'epic',
    xpReward: 2500,
    unlockCriteria: 'Have Doctorate or PhD education level'
  },
  {
    id: 'certified-expert',
    name: 'Certified Expert',
    description: 'Hold 5+ professional certifications',
    icon: '🏅',
    category: 'knowledge',
    rarity: 'rare',
    xpReward: 1000,
    unlockCriteria: 'Add 5 or more professional certificates'
  },
  {
    id: 'trilingual',
    name: 'Trilingual',
    description: 'Speak 3+ languages',
    icon: '🗣️',
    category: 'knowledge',
    rarity: 'uncommon',
    xpReward: 500,
    unlockCriteria: 'Add 3 or more languages to profile'
  },
  {
    id: 'knowledge-master',
    name: 'Knowledge Master',
    description: 'Reach 5,000+ knowledge points',
    icon: '🧠',
    category: 'knowledge',
    rarity: 'epic',
    xpReward: 2000,
    unlockCriteria: 'Accumulate 5,000+ knowledge score points'
  },

  // === ASSETS BADGES ===
  {
    id: 'homeowner',
    name: 'Homeowner',
    description: 'Own your first property',
    icon: '🏠',
    category: 'assets',
    rarity: 'uncommon',
    xpReward: 800,
    unlockCriteria: 'Add a home or property to assets'
  },
  {
    id: 'car-owner',
    name: 'Car Owner',
    description: 'Own your first vehicle',
    icon: '🚗',
    category: 'assets',
    rarity: 'common',
    xpReward: 300,
    unlockCriteria: 'Add a car or vehicle to assets'
  },
  {
    id: 'asset-collector',
    name: 'Asset Collector',
    description: 'Own 5+ different types of assets',
    icon: '🎯',
    category: 'assets',
    rarity: 'rare',
    xpReward: 1000,
    unlockCriteria: 'Add 5 or more different asset types'
  },
  {
    id: 'luxury-owner',
    name: 'Luxury Owner',
    description: 'Own assets worth $500,000+',
    icon: '💎',
    category: 'assets',
    rarity: 'epic',
    xpReward: 2000,
    unlockCriteria: 'Have total asset value of $500,000 or more'
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    description: 'Own a business',
    icon: '🏢',
    category: 'assets',
    rarity: 'rare',
    xpReward: 1500,
    unlockCriteria: 'Add a business to your assets'
  },
  {
    id: 'art-collector',
    name: 'Art Collector',
    description: 'Own art or collectibles',
    icon: '🎨',
    category: 'assets',
    rarity: 'uncommon',
    xpReward: 600,
    unlockCriteria: 'Add art or collectibles to assets'
  },
  {
    id: 'tech-enthusiast',
    name: 'Tech Enthusiast',
    description: 'Own $50,000+ in technology assets',
    icon: '💻',
    category: 'assets',
    rarity: 'rare',
    xpReward: 800,
    unlockCriteria: 'Have $50,000+ worth of technology assets'
  },
  {
    id: 'first-asset',
    name: 'First Asset',
    description: 'Add your first asset',
    icon: '📦',
    category: 'assets',
    rarity: 'common',
    xpReward: 200,
    unlockCriteria: 'Add any asset to your profile'
  },

  // === COMMUNITY BADGES ===
  {
    id: 'first-friend',
    name: 'First Friend',
    description: 'Add your first friend',
    icon: '👋',
    category: 'community',
    rarity: 'common',
    xpReward: 250,
    unlockCriteria: 'Add your first friend to the platform'
  },
  {
    id: 'squad-up',
    name: 'Squad Up',
    description: 'Have 5+ friends',
    icon: '👥',
    category: 'community',
    rarity: 'uncommon',
    xpReward: 500,
    unlockCriteria: 'Have 5 or more friends on the platform'
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Have 20+ friends',
    icon: '🦋',
    category: 'community',
    rarity: 'rare',
    xpReward: 1000,
    unlockCriteria: 'Have 20 or more friends on the platform'
  },
  {
    id: 'shared-score',
    name: 'Score Sharer',
    description: 'Share your LifeScore for the first time',
    icon: '📤',
    category: 'community',
    rarity: 'common',
    xpReward: 200,
    unlockCriteria: 'Share your LifeScore on social media'
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Have 50+ friends',
    icon: '⭐',
    category: 'community',
    rarity: 'epic',
    xpReward: 2000,
    unlockCriteria: 'Have 50 or more friends on the platform'
  },

  // === LEADERBOARD BADGES ===
  {
    id: 'top-100k-global',
    name: 'Global Elite',
    description: 'Reach top 100,000 globally',
    icon: '🌍',
    category: 'leaderboards',
    rarity: 'rare',
    xpReward: 1500,
    unlockCriteria: 'Achieve global rank of 100,000 or better'
  },
  {
    id: 'top-10k-global',
    name: 'Global Champion',
    description: 'Reach top 10,000 globally',
    icon: '🏆',
    category: 'leaderboards',
    rarity: 'epic',
    xpReward: 3000,
    unlockCriteria: 'Achieve global rank of 10,000 or better'
  },
  {
    id: 'top-1k-global',
    name: 'Global Legend',
    description: 'Reach top 1,000 globally',
    icon: '👑',
    category: 'leaderboards',
    rarity: 'legendary',
    xpReward: 5000,
    unlockCriteria: 'Achieve global rank of 1,000 or better'
  },
  {
    id: 'country-top-1000',
    name: 'National Elite',
    description: 'Reach top 1,000 in your country',
    icon: '🏅',
    category: 'leaderboards',
    rarity: 'rare',
    xpReward: 1200,
    unlockCriteria: 'Achieve top 1,000 rank in your country'
  },
  {
    id: 'city-champion',
    name: 'City Champion',
    description: 'Reach #1 in your city',
    icon: '🥇',
    category: 'leaderboards',
    rarity: 'epic',
    xpReward: 2500,
    unlockCriteria: 'Achieve #1 rank in your city'
  },
  {
    id: 'above-nation',
    name: 'Above a Nation',
    description: 'Surpass the average of 10+ countries',
    icon: '🗺️',
    category: 'leaderboards',
    rarity: 'rare',
    xpReward: 1000,
    unlockCriteria: 'Score higher than average citizen of 10+ countries'
  },

  // === LEGENDARY BADGES ===
  {
    id: 'lifescore-legend',
    name: 'LifeScore Legend',
    description: 'Reach 25,000+ total LifeScore',
    icon: '🌟',
    category: 'legendary',
    rarity: 'legendary',
    xpReward: 10000,
    unlockCriteria: 'Achieve 25,000+ total LifeScore points'
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Reach maximum possible LifeScore',
    icon: '💯',
    category: 'legendary',
    rarity: 'legendary',
    xpReward: 15000,
    unlockCriteria: 'Achieve the theoretical maximum LifeScore'
  },
  {
    id: 'renaissance-person',
    name: 'Renaissance Person',
    description: 'Excel in all categories (wealth, knowledge, assets)',
    icon: '🎭',
    category: 'legendary',
    rarity: 'legendary',
    xpReward: 7500,
    unlockCriteria: 'Score in top 10% for wealth, knowledge, and assets'
  },
  {
    id: 'global-one-percent',
    name: 'Global 1%',
    description: 'Join the top 1% of humanity',
    icon: '💎',
    category: 'legendary',
    rarity: 'legendary',
    xpReward: 8000,
    unlockCriteria: 'Achieve top 1% global ranking'
  },

  // === HIDDEN/FUN BADGES ===
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Update profile between midnight and 6 AM',
    icon: '🦉',
    category: 'hidden',
    rarity: 'uncommon',
    xpReward: 300,
    unlockCriteria: 'Make profile updates during late night hours',
    isHidden: true
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Update profile between 5-7 AM',
    icon: '🐦',
    category: 'hidden',
    rarity: 'uncommon',
    xpReward: 300,
    unlockCriteria: 'Make profile updates during early morning hours',
    isHidden: true
  },
  {
    id: 'overachiever',
    name: 'Overachiever',
    description: 'Unlock 10 badges in one day',
    icon: '🚀',
    category: 'hidden',
    rarity: 'epic',
    xpReward: 2000,
    unlockCriteria: 'Unlock 10 or more badges within 24 hours',
    isHidden: true
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 100% of profile fields',
    icon: '✨',
    category: 'hidden',
    rarity: 'rare',
    xpReward: 1000,
    unlockCriteria: 'Fill out every possible profile field',
    isHidden: true
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete onboarding in under 5 minutes',
    icon: '⚡',
    category: 'hidden',
    rarity: 'uncommon',
    xpReward: 500,
    unlockCriteria: 'Complete entire onboarding process in under 5 minutes',
    isHidden: true
  },
  {
    id: 'badge-hunter',
    name: 'Badge Hunter',
    description: 'Unlock 25+ badges',
    icon: '🎯',
    category: 'hidden',
    rarity: 'epic',
    xpReward: 2500,
    unlockCriteria: 'Unlock 25 or more badges total',
    isHidden: true
  }
];

// Helper function to calculate global rank
function getGlobalRank(lifeScore: number): number {
  // Use the same calculation as in the modal components
  const globalStanding = estimateGlobalStanding(lifeScore, {} as User);
  return 8000000000 - globalStanding.peopleAhead;
}

// Helper function to calculate country rank
function getCountryRank(lifeScore: number, country: string): number {
  // Country populations for rank calculation
  const countryPopulations: Record<string, number> = {
    'United States': 331000000,
    'China': 1440000000,
    'India': 1380000000,
    'Brazil': 215000000,
    'United Kingdom': 67000000,
    'Germany': 83000000,
    'France': 68000000,
    'Canada': 38000000,
    'Australia': 26000000,
    'Singapore': 6000000,
    'Spain': 47000000,
    'Italy': 60000000,
    'Japan': 125000000,
    'South Korea': 52000000,
    'Georgia': 4000000
  };
  
  const globalStanding = estimateGlobalStanding(lifeScore, {} as User);
  const countryPopulation = countryPopulations[country] || 50000000;
  return Math.floor(countryPopulation * (1 - globalStanding.percentile / 100));
}

// Badge checking functions
export function checkBadgeUnlocks(user: User, previousUser?: User): Badge[] {
  const newlyUnlockedBadges: Badge[] = [];
  const userBadgeIds = user.badges?.map(b => b.id) || [];
  
  console.log('🔍 BADGE CHECK: Starting badge check for user:', user.name);
  console.log('🔍 BADGE CHECK: Current badges:', userBadgeIds);
  console.log('🔍 BADGE CHECK: User wealth total:', user.wealth?.total);
  console.log('🔍 BADGE CHECK: User knowledge education:', user.knowledge?.education);
  console.log('🔍 BADGE CHECK: User knowledge certificates:', user.knowledge?.certificates?.length);
  console.log('🔍 BADGE CHECK: User knowledge languages:', user.knowledge?.languages?.length);
  console.log('🔍 BADGE CHECK: User assets count:', user.assets?.length);
  console.log('🔍 BADGE CHECK: User lifeScore:', user.lifeScore);
  
  for (const badge of ALL_BADGES) {
    // Skip if already unlocked
    if (userBadgeIds.includes(badge.id)) {
      console.log(`🔍 BADGE CHECK: Badge "${badge.name}" (${badge.id}) - SKIPPED (already unlocked)`);
      continue;
    }
    
    console.log(`🔍 BADGE CHECK: Evaluating badge "${badge.name}" (${badge.id})`);
    
    // Check if badge should be unlocked
    const shouldUnlock = shouldUnlockBadge(badge, user, previousUser);
    console.log(`🔍 BADGE CHECK: Badge "${badge.name}" (${badge.id}) - UNLOCK? ${shouldUnlock}`);
    
    if (shouldUnlock) {
      console.log(`🎉 BADGE UNLOCKED: "${badge.name}" (${badge.id})`);
      newlyUnlockedBadges.push({
        ...badge,
        unlockedAt: new Date()
      });
    }
  }
  
  console.log(`🔍 BADGE CHECK: Total newly unlocked badges: ${newlyUnlockedBadges.length}`);
  if (newlyUnlockedBadges.length > 0) {
    console.log('🔍 BADGE CHECK: Newly unlocked badges:', newlyUnlockedBadges.map(b => b.name));
  }
  
  return newlyUnlockedBadges;
}

function shouldUnlockBadge(badge: Badge, user: User, previousUser?: User): boolean {
  const scoreBreakdown = calculateLifeScore(user);
  const globalRank = getGlobalRank(user.lifeScore || 0);
  const countryRank = getCountryRank(user.lifeScore || 0, user.country);
  
  // For specific badges, add detailed logging
  if (badge.id === 'wealth-apprentice') {
    console.log(`🔍 BADGE CHECK: wealth-apprentice - Checking if wealth total (${user.wealth?.total}) >= 50000`);
  } else if (badge.id === 'skill-stacker') {
    console.log(`🔍 BADGE CHECK: skill-stacker - Checking if certificates (${user.knowledge?.certificates?.length}) >= 3`);
  } else if (badge.id === 'first-asset') {
    console.log(`🔍 BADGE CHECK: first-asset - Checking if assets count (${user.assets?.length}) >= 1`);
  } else if (badge.id === 'trilingual') {
    console.log(`🔍 BADGE CHECK: trilingual - Checking if languages (${user.knowledge?.languages?.length}) >= 3`);
  }
  
  switch (badge.id) {
    // Progress badges
    case 'welcome-aboard':
      return (user.lifeScore || 0) > 0;
    
    case 'profile-complete':
      return !!(user.name && user.city && user.country);
    
    case 'first-update':
      return previousUser && (
        user.name !== previousUser.name ||
        user.city !== previousUser.city ||
        user.wealth?.total !== previousUser.wealth?.total
      );
    
    case 'xp-master':
      return (user.lifeScore || 0) >= 10000;
    
    case 'score-climber':
      return previousUser && ((user.lifeScore || 0) - (previousUser.lifeScore || 0)) >= 2000;

    // Wealth badges
    case 'wealth-apprentice':
      return (user.wealth?.total || 0) >= 50000;
    
    case 'wealth-warrior':
      return (user.wealth?.total || 0) >= 100000;
    
    case 'wealth-champion':
      return (user.wealth?.total || 0) >= 250000;
    
    case 'half-millionaire':
      return (user.wealth?.total || 0) >= 500000;
    
    case 'millionaire':
      return (user.wealth?.total || 0) >= 1000000;
    
    case 'investor-pro':
      return (user.wealth?.investments || 0) >= 100000;
    
    case 'saver-supreme':
      return (user.wealth?.savings || 0) >= 50000;
    
    case 'high-earner':
      return (user.wealth?.salary || 0) >= 100000;

    // Knowledge badges
    case 'knowledge-seeker':
      return !!(user.knowledge?.education && user.knowledge.education !== '' && user.knowledge.education !== 'none');
    
    case 'skill-stacker':
      return (user.knowledge?.certificates?.length || 0) >= 3;
    
    case 'polyglot':
      return (user.knowledge?.languages?.length || 0) >= 5;
    
    case 'bookworm':
      const education = user.knowledge?.education?.toLowerCase() || '';
      return ['masters', 'master', 'doctorate', 'phd'].some(level => education.includes(level));
    
    case 'doctorate-holder':
      const docEducation = user.knowledge?.education?.toLowerCase() || '';
      return ['doctorate', 'phd'].some(level => docEducation.includes(level));
    
    case 'certified-expert':
      return (user.knowledge?.certificates?.length || 0) >= 5;
    
    case 'trilingual':
      return (user.knowledge?.languages?.length || 0) >= 3;
    
    case 'knowledge-master':
      return scoreBreakdown.knowledgeScore >= 5000;

    // Asset badges
    case 'first-asset':
      return (user.assets?.length || 0) >= 1;
    
    case 'homeowner':
      return user.assets?.some(asset => ['home', 'property'].includes(asset.type)) || false;
    
    case 'car-owner':
      return user.assets?.some(asset => ['car', 'vehicle'].includes(asset.type)) || false;
    
    case 'asset-collector':
      const assetTypes = new Set(user.assets?.map(asset => asset.type) || []);
      return assetTypes.size >= 5;
    
    case 'luxury-owner':
      const totalAssetValue = user.assets?.reduce((sum, asset) => sum + asset.value, 0) || 0;
      return totalAssetValue >= 500000;
    
    case 'entrepreneur':
      return user.assets?.some(asset => asset.type === 'business') || false;
    
    case 'art-collector':
      return user.assets?.some(asset => ['art', 'collectibles'].includes(asset.type)) || false;
    
    case 'tech-enthusiast':
      const techValue = user.assets?.filter(asset => asset.type === 'technology')
        .reduce((sum, asset) => sum + asset.value, 0) || 0;
      return techValue >= 50000;

    // Community badges
    case 'first-friend':
      return (user.friends?.length || 0) >= 1;
    
    case 'squad-up':
      return (user.friends?.length || 0) >= 5;
    
    case 'social-butterfly':
      return (user.friends?.length || 0) >= 20;
    
    case 'influencer':
      return (user.friends?.length || 0) >= 50;

    // Leaderboard badges
    case 'top-100k-global':
      return globalRank <= 100000;
    
    case 'top-10k-global':
      return globalRank <= 10000;
    
    case 'top-1k-global':
      return globalRank <= 1000;
    
    case 'country-top-1000':
      return countryRank <= 1000;
    
    case 'city-champion':
      return countryRank <= 1; // Simplified for demo

    // Legendary badges
    case 'lifescore-legend':
      return (user.lifeScore || 0) >= 25000;
    
    case 'perfect-score':
      return (user.lifeScore || 0) >= 30000;
    
    case 'renaissance-person':
      return scoreBreakdown.wealthScore >= 15000 && 
             scoreBreakdown.knowledgeScore >= 8000 && 
             (user.assets?.length || 0) >= 10;
    
    case 'global-one-percent':
      return globalRank <= 80000000; // Top 1% of 8B

    // Hidden badges
    case 'night-owl':
      const hour = new Date().getHours();
      return hour >= 0 && hour < 6;
    
    case 'early-bird':
      const morningHour = new Date().getHours();
      return morningHour >= 5 && morningHour < 7;
    
    case 'perfectionist':
      return !!(user.name && user.age && user.gender && user.city && user.country &&
               user.wealth?.salary && user.wealth?.savings && user.wealth?.investments &&
               user.knowledge?.education && user.knowledge?.languages?.length &&
               user.knowledge?.certificates?.length && user.assets?.length);
    
    case 'badge-hunter':
      return (user.badges?.length || 0) >= 25;

    default:
      return false;
  }
}

export function getDefaultBadgesForNewUser(user: User): Badge[] {
  const defaultBadges: Badge[] = [];
  
  console.log('🔍 DEFAULT BADGES: Getting default badges for new user:', user.name);
  console.log('🔍 DEFAULT BADGES: User data:', {
    lifeScore: user.lifeScore,
    wealth: user.wealth?.total,
    education: user.knowledge?.education,
    assets: user.assets?.length
  });
  
  // Always give welcome badge
  const welcomeBadge = ALL_BADGES.find(b => b.id === 'welcome-aboard');
  if (welcomeBadge) {
    defaultBadges.push({
      ...welcomeBadge,
      unlockedAt: new Date()
    });
  }
  
  // Check for other beginner badges
  const potentialBadges = [
    'profile-complete',
    'wealth-apprentice',
    'knowledge-seeker',
    'first-asset',
    'car-owner',
    'homeowner'
  ];
  
  for (const badgeId of potentialBadges) {
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (badge && shouldUnlockBadge(badge, user)) {
      console.log('🔍 DEFAULT BADGES: Adding default badge:', badge.name);
      defaultBadges.push({
        ...badge,
        unlockedAt: new Date()
      });
    }
  }
  
  console.log('🔍 DEFAULT BADGES: Default badges for new user:', defaultBadges.map(b => b.name));
  return defaultBadges;
}

export function getBadgeProgress(badge: Badge, user: User): { current: number; total: number; percentage: number } {
  const scoreBreakdown = calculateLifeScore(user);
  const globalRank = getGlobalRank(user.lifeScore || 0);
  
  switch (badge.id) {
    case 'wealth-apprentice':
      return { current: user.wealth?.total || 0, total: 50000, percentage: Math.min(((user.wealth?.total || 0) / 50000) * 100, 100) };
    
    case 'wealth-warrior':
      return { current: user.wealth?.total || 0, total: 100000, percentage: Math.min(((user.wealth?.total || 0) / 100000) * 100, 100) };
    
    case 'millionaire':
      return { current: user.wealth?.total || 0, total: 1000000, percentage: Math.min(((user.wealth?.total || 0) / 1000000) * 100, 100) };
    
    case 'polyglot':
      return { current: user.knowledge?.languages?.length || 0, total: 5, percentage: Math.min(((user.knowledge?.languages?.length || 0) / 5) * 100, 100) };
    
    case 'asset-collector':
      const assetTypes = new Set(user.assets?.map(asset => asset.type) || []);
      return { current: assetTypes.size, total: 5, percentage: Math.min((assetTypes.size / 5) * 100, 100) };
    
    case 'squad-up':
      return { current: user.friends?.length || 0, total: 5, percentage: Math.min(((user.friends?.length || 0) / 5) * 100, 100) };
    
    case 'top-100k-global':
      const progress = Math.max(0, 1000000 - globalRank);
      return { current: progress, total: 900000, percentage: Math.min((progress / 900000) * 100, 100) };
    
    case 'trilingual':
      return { current: user.knowledge?.languages?.length || 0, total: 3, percentage: Math.min(((user.knowledge?.languages?.length || 0) / 3) * 100, 100) };
      
    case 'skill-stacker':
      return { current: user.knowledge?.certificates?.length || 0, total: 3, percentage: Math.min(((user.knowledge?.certificates?.length || 0) / 3) * 100, 100) };
    
    default:
      return { current: 0, total: 1, percentage: 0 };
  }
}

export function getRarityColor(rarity: string): { text: string; bg: string; border: string } {
  switch (rarity) {
    case 'common':
      return { text: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-400/40' };
    case 'uncommon':
      return { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-400/40' };
    case 'rare':
      return { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-400/40' };
    case 'epic':
      return { text: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-400/40' };
    case 'legendary':
      return { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-400/40' };
    default:
      return { text: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-400/40' };
  }
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'wealth': return '💰';
    case 'knowledge': return '🧠';
    case 'assets': return '🏠';
    case 'community': return '👥';
    case 'leaderboards': return '🏆';
    case 'progress': return '📈';
    case 'legendary': return '👑';
    case 'hidden': return '🎭';
    default: return '🏅';
  }
}