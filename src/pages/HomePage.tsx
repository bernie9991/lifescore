import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import AuthForm from '../components/auth/AuthForm';

const HomePage: React.FC = () => {
  const handleAuthSuccess = () => {
    // Navigation will be handled automatically by the App component
    console.log('Authentication successful');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center lg:justify-start mb-8"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">LifeScore</h1>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Your Life is Your
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Adventure
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-300 mb-8 max-w-2xl"
            >
              Turn personal growth into a great journey. Set goals, complete real-world quests, 
              and build the stats of a healthier, more balanced life. It's not just a to-do list; 
              it's a role-playing game where you are the hero.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">8B+</div>
                <div className="text-gray-400">Global Rankings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">50+</div>
                <div className="text-gray-400">Achievement Badges</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">∞</div>
                <div className="text-gray-400">Possibilities</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AuthForm onSuccess={handleAuthSuccess} />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16 text-gray-400"
        >
          <p>Built with LifeScore ⚡️</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default HomePage;