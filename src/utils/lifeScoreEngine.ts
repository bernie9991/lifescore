// LifeScore Points Engine - Calculation & Global Standing Logic

import { User } from '../types';

export interface LifeScoreBreakdown {
  wealthScore: number;
  knowledgeScore: number;
  totalLifeScore: number;
  breakdown: {
    wealth: {
      income: number;
      savings: number;
      investments: number;
      home: number;
      car: number;
      business: number;
      items: number;
      otherAssets: number;
    };
    knowledge: {
      education: number;
      languages: number;
      certificates: number;
    };
  };
}

export interface GlobalStanding {
  globalRankEstimate: string;
  percentile: number;
  peopleAhead: number;
  facts: string[];
  wealthPercentile: number;
  educationPercentile: number;
  surpassedCountries: Array<{
    name: string;
    population: string;
    flag: string;
  }>;
}

// --- LifeScore Calculation Engine ---
export function calculateLifeScore(user: User): LifeScoreBreakdown {
  // Extract user data with defaults
  const wealth = user.wealth || { salary: 0, savings: 0, investments: 0, total: 0, currency: 'USD' };
  const knowledge = user.knowledge || { education: '', certificates: [], languages: [], total: 0 };
  const assets = user.assets || [];

  // === WEALTH POINTS CALCULATION ===
  
  // Income Points (Annual Salary)
  const incomePoints = Math.min((wealth.salary || 0) / 5, 4000); // $20,000 max = 4,000 pts
  
  // Savings Points
  const savingsPoints = Math.min((wealth.savings || 0) / 200, 3000); // $600,000 max = 3,000 pts
  
  // Investment Points
  const investmentPoints = Math.min((wealth.investments || 0) / 333, 3000); // $1M max = 3,000 pts
  
  // Asset Points
  const hasHome = assets.some(asset => asset.type === 'home' || asset.type === 'property');
  const hasCar = assets.some(asset => asset.type === 'car' || asset.type === 'vehicle');
  const businesses = assets.filter(asset => asset.type === 'business').length;
  
  const homePoints = hasHome ? 2000 : 0;
  const carPoints = hasCar ? 500 : 0;
  const businessPoints = businesses * 2000;
  
  // Calculate total asset value excluding home, car, and business
  const otherAssets = assets.filter(asset => 
    !['home', 'property', 'car', 'vehicle', 'business'].includes(asset.type)
  );
  const itemsValue = otherAssets.reduce((sum, asset) => sum + asset.value, 0);
  const itemPoints = Math.min(itemsValue / 100, 2000); // Cap at $200,000 worth
  
  // Additional high-value assets
  const luxuryAssets = assets.filter(asset => 
    ['jewelry', 'art', 'collectibles', 'luxury'].includes(asset.type)
  );
  const luxuryValue = luxuryAssets.reduce((sum, asset) => sum + asset.value, 0);
  const luxuryPoints = Math.min(luxuryValue / 200, 3000); // Cap at $600,000

  // Calculate total wealth score (max 20,000)
  const wealthScore = Math.min(
    incomePoints + savingsPoints + investmentPoints + homePoints + carPoints + businessPoints + itemPoints + luxuryPoints,
    20000
  );

  // === KNOWLEDGE POINTS CALCULATION ===
  
  // Education Level Points
  const educationLevels: Record<string, number> = {
    'none': 0,
    'high-school': 1000,
    'associates': 1500,
    'bachelors': 2000,
    'masters': 2500,
    'doctorate': 3000,
    'phd': 3000,
    'other': 800
  };
  
  const educationKey = (knowledge.education || '').toLowerCase().replace(/[^a-z]/g, '');
  const educationPoints = educationLevels[educationKey] || educationLevels['none'];
  
  // Language Points (250 per language, max 2000 for 8+ languages)
  const languagePoints = Math.min((knowledge.languages?.length || 0) * 250, 2000);
  
  // Certificate Points (1000 per certificate, max 3000 for 3+ certificates)
  const certificatePoints = Math.min((knowledge.certificates?.length || 0) * 1000, 3000);
  
  // Calculate total knowledge score (max 10,000)
  const knowledgeScore = Math.min(
    educationPoints + languagePoints + certificatePoints,
    10000
  );

  // === TOTAL LIFESCORE ===
  const totalLifeScore = wealthScore + knowledgeScore;

  return {
    wealthScore,
    knowledgeScore,
    totalLifeScore,
    breakdown: {
      wealth: {
        income: Math.round(incomePoints),
        savings: Math.round(savingsPoints),
        investments: Math.round(investmentPoints),
        home: homePoints,
        car: carPoints,
        business: businessPoints,
        items: Math.round(itemPoints),
        otherAssets: Math.round(luxuryPoints)
      },
      knowledge: {
        education: educationPoints,
        languages: languagePoints,
        certificates: certificatePoints
      }
    }
  };
}

// --- Global Standing Estimation ---
export function estimateGlobalStanding(totalScore: number, user: User): GlobalStanding {
  const MAX_SCORE = 30000;
  const WORLD_POPULATION = 8_000_000_000;

  // Calculate percentile (0 to 1)
  let percentile = Math.min(totalScore / MAX_SCORE, 1);
  
  // Apply realistic distribution curve (most people are in lower percentiles)
  // Use exponential curve to make higher scores more exclusive
  percentile = Math.pow(percentile, 0.7); // Adjust curve steepness
  
  const peopleAhead = Math.floor(percentile * WORLD_POPULATION);
  const globalRank = WORLD_POPULATION - peopleAhead;
  const percentileDisplay = Math.floor(percentile * 100);

  // Calculate wealth percentile based on global wealth distribution
  const wealthTotal = user.wealth?.total || 0;
  let wealthPercentile = 0;
  
  if (wealthTotal < 1000) wealthPercentile = 10;
  else if (wealthTotal < 10000) wealthPercentile = 30;
  else if (wealthTotal < 50000) wealthPercentile = 60;
  else if (wealthTotal < 100000) wealthPercentile = 80;
  else if (wealthTotal < 250000) wealthPercentile = 90;
  else if (wealthTotal < 500000) wealthPercentile = 95;
  else if (wealthTotal < 1000000) wealthPercentile = 98;
  else wealthPercentile = 99.5;

  // Calculate education percentile
  const educationPercentiles: Record<string, number> = {
    'none': 20,
    'high-school': 50,
    'associates': 70,
    'bachelors': 85,
    'masters': 95,
    'doctorate': 99,
    'phd': 99.5
  };
  
  const educationKey = (user.knowledge?.education || '').toLowerCase().replace(/[^a-z]/g, '');
  const educationPercentile = educationPercentiles[educationKey] || 20;

  // Countries the user surpasses (realistic data)
  const allCountries = [
    { name: 'Chad', population: '16.4M', flag: '🇹🇩', threshold: 2000 },
    { name: 'Madagascar', population: '28.4M', flag: '🇲🇬', threshold: 2500 },
    { name: 'Afghanistan', population: '39.8M', flag: '🇦🇫', threshold: 3000 },
    { name: 'Nepal', population: '29.1M', flag: '🇳🇵', threshold: 4000 },
    { name: 'Cambodia', population: '16.7M', flag: '🇰🇭', threshold: 4500 },
    { name: 'Bangladesh', population: '165M', flag: '🇧🇩', threshold: 5000 },
    { name: 'Myanmar', population: '54.4M', flag: '🇲🇲', threshold: 5500 },
    { name: 'Laos', population: '7.3M', flag: '🇱🇦', threshold: 6000 },
    { name: 'Bolivia', population: '11.7M', flag: '🇧🇴', threshold: 7000 },
    { name: 'Honduras', population: '10.0M', flag: '🇭🇳', threshold: 7500 },
    { name: 'Nicaragua', population: '6.6M', flag: '🇳🇮', threshold: 8000 },
    { name: 'Moldova', population: '2.6M', flag: '🇲🇩', threshold: 8500 },
    { name: 'Ukraine', population: '44.1M', flag: '🇺🇦', threshold: 9000 },
    { name: 'Philippines', population: '109M', flag: '🇵🇭', threshold: 10000 },
    { name: 'India', population: '1.38B', flag: '🇮🇳', threshold: 11000 },
    { name: 'Indonesia', population: '273M', flag: '🇮🇩', threshold: 12000 },
    { name: 'Brazil', population: '215M', flag: '🇧🇷', threshold: 13000 },
    { name: 'Mexico', population: '128M', flag: '🇲🇽', threshold: 14000 },
    { name: 'Turkey', population: '84.3M', flag: '🇹🇷', threshold: 15000 },
    { name: 'Russia', population: '146M', flag: '🇷🇺', threshold: 16000 },
    { name: 'Poland', population: '38.0M', flag: '🇵🇱', threshold: 17000 },
    { name: 'South Korea', population: '51.8M', flag: '🇰🇷', threshold: 18000 },
    { name: 'Spain', population: '47.4M', flag: '🇪🇸', threshold: 19000 },
    { name: 'Italy', population: '60.4M', flag: '🇮🇹', threshold: 20000 },
    { name: 'France', population: '67.4M', flag: '🇫🇷', threshold: 21000 },
    { name: 'United Kingdom', population: '67.9M', flag: '🇬🇧', threshold: 22000 },
    { name: 'Germany', population: '83.2M', flag: '🇩🇪', threshold: 23000 },
    { name: 'Japan', population: '125M', flag: '🇯🇵', threshold: 24000 },
    { name: 'Canada', population: '38.2M', flag: '🇨🇦', threshold: 25000 },
    { name: 'Australia', population: '25.7M', flag: '🇦🇺', threshold: 26000 },
    { name: 'Bhutan', population: '772K', flag: '🇧🇹', threshold: 6500 },
    { name: 'Fiji', population: '896K', flag: '🇫🇯', threshold: 7200 },
    { name: 'Iceland', population: '368K', flag: '🇮🇸', threshold: 27000 },
    { name: 'Luxembourg', population: '634K', flag: '🇱🇺', threshold: 28000 }
  ];

  const surpassedCountries = allCountries.filter(country => totalScore > country.threshold);

  // Generate dynamic facts based on score ranges
  const facts: string[] = [];

  if (totalScore < 3000) {
    facts.push("You're building your foundation - ahead of citizens in the least developed regions");
    facts.push("Your score puts you above subsistence-level economies");
  } else if (totalScore < 6000) {
    facts.push("You're ahead of average citizens in developing nations like Chad and Madagascar");
    facts.push("Your wealth and education exceed most rural populations globally");
  } else if (totalScore < 10000) {
    facts.push("You surpass the average citizen in countries like Bolivia, Nepal, and Cambodia");
    facts.push("Your combined wealth and knowledge exceed 60% of the global population");
  } else if (totalScore < 15000) {
    facts.push("You're ahead of most people in major countries like India, Philippines, and Indonesia");
    facts.push("Your lifestyle exceeds the average in emerging economies");
  } else if (totalScore < 20000) {
    facts.push("You outrank average citizens in developed nations like Brazil, Mexico, and Turkey");
    facts.push("You're in the global upper-middle class tier");
  } else if (totalScore < 25000) {
    facts.push("You exceed the average in wealthy countries like South Korea, Spain, and Italy");
    facts.push("You're in the top 5% globally - ahead of most developed nation citizens");
  } else {
    facts.push("You're in the global elite - ahead of average citizens even in the wealthiest nations");
    facts.push("Your LifeScore puts you in the top 1% of all humans currently alive");
  }

  // Add wealth-specific facts
  if (wealthPercentile > 90) {
    facts.push(`Your wealth puts you in the top ${(100 - wealthPercentile).toFixed(1)}% globally`);
  }

  // Add education-specific facts
  if (educationPercentile > 85) {
    facts.push(`Your education level exceeds ${educationPercentile}% of the world's population`);
  }

  // Add country-specific facts
  if (surpassedCountries.length > 0) {
    const totalSurpassedPop = surpassedCountries.reduce((sum, country) => {
      const pop = parseFloat(country.population.replace(/[^\d.]/g, ''));
      return sum + (country.population.includes('B') ? pop * 1000 : pop);
    }, 0);
    
    facts.push(`You outrank the average citizen of ${surpassedCountries.length} countries`);
    facts.push(`Combined population surpassed: ${totalSurpassedPop.toFixed(1)}M+ people`);
  }

  return {
    globalRankEstimate: `You're ahead of ${peopleAhead.toLocaleString()} people globally`,
    percentile: percentileDisplay,
    peopleAhead,
    facts,
    wealthPercentile,
    educationPercentile,
    surpassedCountries: surpassedCountries.slice(0, 10) // Limit to top 10 for display
  };
}

// --- Utility Functions ---

export function updateUserLifeScore(user: User): User {
  const scoreBreakdown = calculateLifeScore(user);
  
  return {
    ...user,
    lifeScore: scoreBreakdown.totalLifeScore,
    // Store breakdown in user object for detailed display
    scoreBreakdown
  };
}

export function formatScoreBreakdown(breakdown: LifeScoreBreakdown): string {
  const { wealthScore, knowledgeScore, totalLifeScore } = breakdown;
  
  return `LifeScore: ${totalLifeScore.toLocaleString()} XP (Wealth: ${wealthScore.toLocaleString()}, Knowledge: ${knowledgeScore.toLocaleString()})`;
}

export function getScoreLevel(score: number): { level: string; color: string; description: string } {
  if (score < 3000) return { 
    level: 'Developing', 
    color: 'text-red-400', 
    description: 'Building your foundation' 
  };
  if (score < 6000) return { 
    level: 'Emerging', 
    color: 'text-orange-400', 
    description: 'Making progress' 
  };
  if (score < 10000) return { 
    level: 'Established', 
    color: 'text-yellow-400', 
    description: 'Solid standing' 
  };
  if (score < 15000) return { 
    level: 'Advanced', 
    color: 'text-green-400', 
    description: 'Above average globally' 
  };
  if (score < 20000) return { 
    level: 'Elite', 
    color: 'text-blue-400', 
    description: 'Top tier globally' 
  };
  if (score < 25000) return { 
    level: 'Exceptional', 
    color: 'text-purple-400', 
    description: 'Global top 5%' 
  };
  return { 
    level: 'Legendary', 
    color: 'text-pink-400', 
    description: 'Global top 1%' 
  };
}

// --- Cache Management ---
interface CachedStanding {
  standing: GlobalStanding;
  timestamp: number;
  score: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function getCachedGlobalStanding(userId: string, currentScore: number): GlobalStanding | null {
  try {
    const cached = localStorage.getItem(`lifescore_standing_${userId}`);
    if (!cached) return null;
    
    const data: CachedStanding = JSON.parse(cached);
    const now = Date.now();
    
    // Return cached data if it's fresh and score hasn't changed significantly
    if (
      now - data.timestamp < CACHE_DURATION && 
      Math.abs(data.score - currentScore) < 100 // Allow small score variations
    ) {
      return data.standing;
    }
    
    // Clear expired cache
    localStorage.removeItem(`lifescore_standing_${userId}`);
    return null;
  } catch {
    return null;
  }
}

export function setCachedGlobalStanding(userId: string, standing: GlobalStanding, score: number): void {
  try {
    const cacheData: CachedStanding = {
      standing,
      timestamp: Date.now(),
      score
    };
    localStorage.setItem(`lifescore_standing_${userId}`, JSON.stringify(cacheData));
  } catch {
    // Ignore cache errors
  }
}