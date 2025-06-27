import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { LogOut, User, Trophy, BarChart3 } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, {user.name || 'User'}! 👋
            </h1>
            <p className="text-gray-300">
              {user.city && user.country ? `${user.city}, ${user.country}` : 'Complete your profile to get started'}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-300">LifeScore</p>
              <p className="text-2xl font-bold text-blue-400">
                {user.lifeScore || 0} XP
              </p>
            </div>
            
            <Button 
              onClick={logout}
              variant="secondary"
              icon={LogOut}
              size="sm"
            >
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Profile</h3>
                  <p className="text-gray-400 text-sm">Manage your information</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white">{user.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white">
                    {user.city && user.country ? `${user.city}, ${user.country}` : 'Not set'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* LifeScore Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">LifeScore</h3>
                  <p className="text-gray-400 text-sm">Your global ranking</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {user.lifeScore || 0} XP
                </div>
                <p className="text-gray-400 text-sm">
                  Complete your profile to increase your score
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Achievements Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Achievements</h3>
                  <p className="text-gray-400 text-sm">Badges and milestones</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {user.badges?.length || 0}
                </div>
                <p className="text-gray-400 text-sm">
                  Badges earned
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Getting Started Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
                <h3 className="font-semibold text-white mb-2">1. Complete Your Profile</h3>
                <p className="text-gray-400 text-sm">
                  Add your personal information, location, and basic details to get started.
                </p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
                <h3 className="font-semibold text-white mb-2">2. Add Your Wealth Data</h3>
                <p className="text-gray-400 text-sm">
                  Input your salary, savings, and investments to calculate your wealth score.
                </p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-600">
                <h3 className="font-semibold text-white mb-2">3. Share Your Knowledge</h3>
                <p className="text-gray-400 text-sm">
                  Add your education, certifications, and languages to boost your knowledge score.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;