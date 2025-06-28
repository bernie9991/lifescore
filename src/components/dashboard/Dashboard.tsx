import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import DashboardHeader from './DashboardHeader';
import RankingCards from './RankingCards';
import LifeScoreMeter from './LifeScoreMeter';
import NudgesPanel from './NudgesPanel';
import DynamicFactsPanel from './DynamicFactsPanel';

interface DashboardProps {
  user: User;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onProfileClick, onSettingsClick }) => {
  return (
    <div className="space-y-8">
      <DashboardHeader user={user} onProfileClick={onProfileClick} onSettingsClick={onSettingsClick} />
      
      {/* Global Standing - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DynamicFactsPanel user={user} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <RankingCards user={user} />
          <LifeScoreMeter user={user} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <NudgesPanel user={user} />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;