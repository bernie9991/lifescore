import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  Sparkles, 
  Zap,
  Camera,
  Music,
  MessageCircle,
  BookOpen,
  Trophy,
  Users,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotifyMe: () => void;
  hasNotified?: boolean;
}

interface Integration {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  emoji: string;
  description: string;
  category: 'learning' | 'social' | 'gaming' | 'fitness' | 'creative';
  xpBonus: string;
  comingSoon: boolean;
}

const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ 
  isOpen, 
  onClose, 
  onNotifyMe,
  hasNotified = false 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const integrations: Integration[] = [
    {
      id: 'duolingo',
      name: 'Duolingo',
      icon: BookOpen,
      emoji: '🦉',
      description: 'Connect your language learning progress and earn XP for daily streaks and completed lessons.',
      category: 'learning',
      xpBonus: '+50 XP per lesson',
      comingSoon: true
    },
    {
      id: 'chess',
      name: 'Chess.com',
      icon: Trophy,
      emoji: '♟️',
      description: 'Link your chess rating and tournament results to boost your knowledge score.',
      category: 'gaming',
      xpBonus: '+100 XP per win',
      comingSoon: true
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Camera,
      emoji: '📸',
      description: 'Share your achievements and lifestyle updates to earn social engagement XP.',
      category: 'social',
      xpBonus: '+25 XP per post',
      comingSoon: true
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Music,
      emoji: '🎵',
      description: 'Connect your creative content and follower growth for bonus creativity points.',
      category: 'creative',
      xpBonus: '+75 XP per viral video',
      comingSoon: true
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: MessageCircle,
      emoji: '🐦',
      description: 'Link your professional network and thought leadership for influence scoring.',
      category: 'social',
      xpBonus: '+10 XP per engagement',
      comingSoon: true
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Users,
      emoji: '📘',
      description: 'Connect your social network and community involvement for relationship XP.',
      category: 'social',
      xpBonus: '+20 XP per connection',
      comingSoon: true
    }
  ];

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'gaming', label: 'Gaming', icon: Trophy },
    { id: 'creative', label: 'Creative', icon: Camera }
  ];

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  const handleNotifyMe = () => {
    onNotifyMe();
    toast.success('🔔 You\'ll be notified when integrations launch!');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'learning': return 'from-blue-500/20 to-cyan-500/20 border-blue-400/40';
      case 'social': return 'from-pink-500/20 to-rose-500/20 border-pink-400/40';
      case 'gaming': return 'from-purple-500/20 to-indigo-500/20 border-purple-400/40';
      case 'creative': return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/40';
      default: return 'from-gray-500/20 to-slate-500/20 border-gray-400/40';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal - Mobile optimized slide up animation */}
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.95,
              y: window.innerWidth < 768 ? '100%' : 20 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              y: window.innerWidth < 768 ? '100%' : 20 
            }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
            className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-t-3xl md:rounded-3xl border-2 border-purple-500/30 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/20"
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)'
                  ]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Header */}
            <div className="relative p-4 md:p-6 border-b border-gray-700/50">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  🧩 Account Integrations
                </h2>
                <div className="inline-flex items-center px-3 py-1 bg-yellow-500/20 border border-yellow-400/40 rounded-full text-yellow-300 text-sm font-semibold mb-3">
                  <Zap className="w-4 h-4 mr-1" />
                  Coming Soon
                </div>
                <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
                  Soon you'll be able to connect apps like Duolingo, Chess.com, Instagram, TikTok and more to earn extra XP and badges.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Category Filter */}
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm ${
                      selectedCategory === category.id
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>

              {/* Integrations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIntegrations.map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 md:p-5 rounded-xl bg-gradient-to-br ${getCategoryColor(integration.category)} border-2 hover:shadow-lg transition-all group relative overflow-hidden`}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className="relative">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <span className="text-2xl">{integration.emoji}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg">{integration.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400 capitalize">{integration.category}</span>
                            <span className="text-green-400 font-semibold text-xs">{integration.xpBonus}</span>
                          </div>
                        </div>
                        {integration.comingSoon && (
                          <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-full px-2 py-1">
                            <span className="text-yellow-300 text-xs font-semibold">Soon</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">
                        {integration.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <ExternalLink className="w-3 h-3" />
                          <span>Auto-sync enabled</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs bg-white/10 hover:bg-white/20 border border-white/20"
                          disabled
                        >
                          Connect
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Benefits Section */}
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-4 md:p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                  <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                  Integration Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Automatic XP tracking from your favorite apps</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Exclusive badges for connected platforms</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Real-time leaderboard updates</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Cross-platform achievement syncing</span>
                  </div>
                </div>
              </div>

              {/* Notify Me Section */}
              <div className="text-center">
                {hasNotified ? (
                  <div className="inline-flex items-center space-x-2 px-4 py-3 bg-green-500/20 border border-green-400/40 rounded-xl text-green-300">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">You'll be notified when integrations launch!</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleNotifyMe}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30"
                      icon={Bell}
                    >
                      🔔 Notify Me When Available
                    </Button>
                    <p className="text-gray-400 text-sm">
                      Be the first to know when integrations go live and get early access!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IntegrationsModal;