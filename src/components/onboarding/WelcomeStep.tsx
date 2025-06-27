import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Trophy } from 'lucide-react';
import Button from '../common/Button';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-bold text-white mb-4"
      >
        Welcome to LifeScore! 🎉
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
      >
        Let's build your profile and see how you rank against the world. 
        This will take just 5 minutes!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <Target className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
          <h3 className="font-semibold text-white mb-2">Share Your Stats</h3>
          <p className="text-gray-400 text-sm">Tell us about your wealth, education, and assets</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <Trophy className="w-8 h-8 text-purple-400 mb-3 mx-auto" />
          <h3 className="font-semibold text-white mb-2">Get Ranked</h3>
          <p className="text-gray-400 text-sm">See how you compare globally and locally</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <Sparkles className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
          <h3 className="font-semibold text-white mb-2">Earn Badges</h3>
          <p className="text-gray-400 text-sm">Unlock achievements and climb the leaderboards</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button onClick={onNext} size="lg">
          Let's Get Started! 🚀
        </Button>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;