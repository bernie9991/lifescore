import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Share2, 
  ChevronRight, 
  SkipForward, 
  Download,
  Copy,
  ExternalLink,
  Star,
  Award,
  Sparkles
} from 'lucide-react';
import { Badge } from '../../types';
import { getRarityColor } from '../../utils/badgeSystem';
import { triggerBadgeConfetti, formatNumber } from '../../utils/animations';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface BadgeUnlockModalProps {
  badges: Badge[];
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onSkipAll?: () => void;
}

const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
  badges,
  isOpen,
  onClose,
  onNext,
  onSkipAll
}) => {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  const currentBadge = badges[currentBadgeIndex];
  const hasMultipleBadges = badges.length > 1;
  const isLastBadge = currentBadgeIndex === badges.length - 1;

  console.log('🏅 BADGE MODAL: Rendering with isOpen =', isOpen);
  console.log('🏅 BADGE MODAL: Badges =', badges);
  console.log('🏅 BADGE MODAL: Current badge index =', currentBadgeIndex);
  console.log('🏅 BADGE MODAL: Current badge =', currentBadge);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && badges.length > 0) {
      console.log('🏅 BADGE MODAL: Modal opened, resetting state');
      setCurrentBadgeIndex(0);
      setShowShareMenu(false);
      setHasTriggeredConfetti(false);
    }
  }, [isOpen, badges.length]);

  // Trigger confetti when badge is shown
  useEffect(() => {
    if (isOpen && currentBadge && !hasTriggeredConfetti) {
      console.log('🏅 BADGE MODAL: Triggering confetti for badge:', currentBadge.name);
      setTimeout(() => {
        triggerBadgeConfetti(currentBadge.category);
      }, 500);
      setHasTriggeredConfetti(true);
    }
  }, [isOpen, currentBadge, hasTriggeredConfetti]);

  const handleNext = () => {
    if (isLastBadge) {
      console.log('🏅 BADGE MODAL: Last badge, closing modal');
      onClose();
    } else {
      console.log('🏅 BADGE MODAL: Moving to next badge');
      setCurrentBadgeIndex(prev => prev + 1);
      setHasTriggeredConfetti(false);
      setShowShareMenu(false);
    }
  };

  const handleShare = () => {
    setShowShareMenu(true);
  };

  const handleCopyLink = () => {
    const shareText = `🎉 I just unlocked the "${currentBadge.name}" badge on LifeScore!\n\n${currentBadge.description}\n\n+${currentBadge.xpReward} XP earned!\n\nCheck out your global ranking: ${window.location.origin}`;
    
    navigator.clipboard.writeText(shareText);
    toast.success('Badge achievement copied to clipboard! 📋');
    setShowShareMenu(false);
  };

  const handleShareX = () => {
    const shareText = `🎉 Just unlocked the "${currentBadge.name}" badge on LifeScore! ${currentBadge.icon}\n\n${currentBadge.description}\n\n+${currentBadge.xpReward} XP earned! 🚀\n\n#LifeScore #Achievement`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.origin)}`;
    window.open(url, '_blank');
    setShowShareMenu(false);
  };

  const handleDownloadImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#1F2937');
    gradient.addColorStop(1, '#111827');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 Badge Unlocked!', 400, 100);

    ctx.font = 'bold 36px Arial';
    ctx.fillText(currentBadge.name, 400, 200);

    ctx.font = '24px Arial';
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText(currentBadge.description, 400, 250);

    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#FCD34D';
    ctx.fillText(`+${currentBadge.xpReward} XP`, 400, 350);

    ctx.font = '72px Arial';
    ctx.fillText(currentBadge.icon, 400, 450);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#6B7280';
    ctx.fillText('LifeScore - Where Do You Stand in the World?', 400, 550);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lifescore-badge-${currentBadge.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Badge image downloaded! 📸');
      }
    });
    setShowShareMenu(false);
  };

  if (!isOpen || badges.length === 0) {
    console.log('🏅 BADGE MODAL: Not rendering - isOpen:', isOpen, 'badges length:', badges.length);
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="badge-unlock-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Badge Modal */}
          {currentBadge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
              className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700 w-full max-w-lg overflow-hidden shadow-2xl"
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
                    ]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Header */}
              <div className="relative p-6 text-center">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Badge counter */}
                {hasMultipleBadges && (
                  <div className="absolute top-4 left-4 bg-gray-700/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-gray-300">
                    {currentBadgeIndex + 1} of {badges.length}
                  </div>
                )}

                {/* Celebration header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                  className="mb-6"
                >
                  <div className="text-6xl mb-4">🎉</div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Badge Unlocked!
                  </h1>
                  <p className="text-gray-300">
                    Congratulations on your achievement!
                  </p>
                </motion.div>
              </div>

              {/* Badge Display */}
              <div className="px-6 pb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring", duration: 0.8, bounce: 0.4 }}
                  className={`relative p-8 rounded-2xl ${getRarityColor(currentBadge.rarity).bg} border-2 ${getRarityColor(currentBadge.rarity).border} mb-6`}
                >
                  {/* Rarity glow effect */}
                  <div className={`absolute inset-0 rounded-2xl ${getRarityColor(currentBadge.rarity).bg} blur-xl opacity-50`} />
                  
                  <div className="relative text-center">
                    {/* Badge Icon */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      className="text-8xl mb-4"
                    >
                      {currentBadge.icon}
                    </motion.div>

                    {/* Badge Name */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {currentBadge.name}
                    </h2>

                    {/* Rarity */}
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRarityColor(currentBadge.rarity).text} ${getRarityColor(currentBadge.rarity).bg} border ${getRarityColor(currentBadge.rarity).border} mb-3`}>
                      <Star className="w-4 h-4 mr-1" />
                      {currentBadge.rarity.charAt(0).toUpperCase() + currentBadge.rarity.slice(1)}
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {currentBadge.description}
                    </p>

                    {/* XP Reward */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", bounce: 0.6 }}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-6 rounded-xl text-xl"
                    >
                      <Award className="w-6 h-6 inline mr-2" />
                      +{formatNumber(currentBadge.xpReward)} XP
                    </motion.div>
                  </div>

                  {/* Floating sparkles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-yellow-400"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${10 + (i % 2) * 70}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.5, 1, 0.5],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Share Button */}
                  <div className="relative">
                    <Button
                      onClick={handleShare}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      icon={Share2}
                    >
                      🎁 Share Achievement
                    </Button>

                    {/* Share Menu */}
                    <AnimatePresence>
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden"
                        >
                          <button
                            onClick={handleCopyLink}
                            className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center text-white"
                          >
                            <Copy className="w-4 h-4 mr-3" />
                            Copy Link
                          </button>
                          <button
                            onClick={handleShareX}
                            className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center text-white"
                          >
                            <ExternalLink className="w-4 h-4 mr-3" />
                            Share on X
                          </button>
                          <button
                            onClick={handleDownloadImage}
                            className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center text-white"
                          >
                            <Download className="w-4 h-4 mr-3" />
                            Download Image
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex space-x-3">
                    {hasMultipleBadges && !isLastBadge && (
                      <Button
                        onClick={handleNext}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        icon={ChevronRight}
                      >
                        ➡ Next Badge
                      </Button>
                    )}

                    {hasMultipleBadges && !isLastBadge && onSkipAll && (
                      <Button
                        onClick={onSkipAll}
                        variant="secondary"
                        className="flex-1"
                        icon={SkipForward}
                      >
                        ⏭ Skip All
                      </Button>
                    )}

                    {(isLastBadge || !hasMultipleBadges) && (
                      <Button
                        onClick={onClose}
                        className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeUnlockModal;