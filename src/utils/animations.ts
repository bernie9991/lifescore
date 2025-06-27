import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  });
};

export const triggerXPBurst = () => {
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ['#FFD700', '#FFA500']
  });
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ['#FFD700', '#FFA500']
  });
};

// Custom emoji confetti system using DOM elements
export const triggerEmojiConfetti = (reactionType: string) => {
  const emojiMap: Record<string, string[]> = {
    'haha': ['😂', '🤣', '😄', '😆', '😁', '😊'],
    'angry': ['😠', '😡', '🤬', '💢', '😤', '🔥'],
    'applause': ['👏', '🙌', '👍', '💪', '🎉', '✨'],
    'kudos': ['❤️', '💖', '💕', '💝', '🥰', '😍']
  };

  const emojis = emojiMap[reactionType] || ['🎉', '✨', '⭐'];
  
  // Create emoji elements and animate them
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      createEmojiParticle(emoji);
    }, i * 100);
  }
};

// Badge unlock emoji confetti
export const triggerBadgeConfetti = (badgeType: string) => {
  const badgeEmojiMap: Record<string, string[]> = {
    'wealth': ['💰', '💎', '🤑', '💸', '🏆', '⭐'],
    'knowledge': ['🧠', '📚', '🎓', '💡', '🌟', '✨'],
    'assets': ['🏠', '🚗', '💍', '🏆', '⭐', '🎯'],
    'legendary': ['👑', '🏆', '💎', '⭐', '🌟', '✨']
  };

  const emojis = badgeEmojiMap[badgeType] || ['🏆', '⭐', '🎉'];
  
  // Create a spectacular burst for badge unlocks
  for (let i = 0; i < 25; i++) {
    setTimeout(() => {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      createEmojiParticle(emoji, true);
    }, i * 80);
  }
};

// Achievement unlock confetti
export const triggerAchievementConfetti = () => {
  const achievementEmojis = ['🏆', '🥇', '🎖️', '👑', '⭐', '🌟', '✨', '🎉'];
  
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const emoji = achievementEmojis[Math.floor(Math.random() * achievementEmojis.length)];
      createEmojiParticle(emoji, true);
    }, i * 60);
  }
};

// Level up confetti
export const triggerLevelUpConfetti = () => {
  const levelUpEmojis = ['🚀', '⬆️', '📈', '💪', '🔥', '⭐', '🌟', '✨'];
  
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const emoji = levelUpEmojis[Math.floor(Math.random() * levelUpEmojis.length)];
      createEmojiParticle(emoji, true);
    }, i * 100);
  }
};

// Helper function to create individual emoji particles
const createEmojiParticle = (emoji: string, isBig: boolean = false) => {
  const particle = document.createElement('div');
  particle.textContent = emoji;
  particle.style.position = 'fixed';
  particle.style.fontSize = isBig ? '2.5rem' : '1.8rem';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '9999';
  particle.style.userSelect = 'none';
  
  // Random starting position (top of screen, random x)
  const startX = Math.random() * window.innerWidth;
  const startY = -50;
  
  particle.style.left = startX + 'px';
  particle.style.top = startY + 'px';
  
  // Add to DOM
  document.body.appendChild(particle);
  
  // Animation properties
  const duration = 3000 + Math.random() * 2000; // 3-5 seconds
  const endY = window.innerHeight + 100;
  const drift = (Math.random() - 0.5) * 200; // Side drift
  const rotation = Math.random() * 720 - 360; // Random rotation
  const scale = 0.3 + Math.random() * 0.4; // End scale 0.3-0.7
  
  // Apply animation
  particle.animate([
    {
      transform: `translate(0px, 0px) rotate(0deg) scale(1)`,
      opacity: 1
    },
    {
      transform: `translate(${drift}px, ${endY - startY}px) rotate(${rotation}deg) scale(${scale})`,
      opacity: 0
    }
  ], {
    duration: duration,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }).onfinish = () => {
    // Clean up
    if (particle.parentNode) {
      particle.parentNode.removeChild(particle);
    }
  };
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'text-gray-400 border-gray-400';
    case 'rare': return 'text-blue-400 border-blue-400';
    case 'epic': return 'text-purple-400 border-purple-400';
    case 'legendary': return 'text-yellow-400 border-yellow-400';
    default: return 'text-gray-400 border-gray-400';
  }
};

export const getProgressPercentage = (current: number, total: number): number => {
  return Math.min((current / total) * 100, 100);
};