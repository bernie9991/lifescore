import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, TrendingUp, Award } from 'lucide-react';
import { User } from '../../types';
import { formatCurrency } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import Card from '../common/Card';
import Button from '../common/Button';
import AddAssetModal from '../modals/AddAssetModal';
import UpdateWealthModal from '../modals/UpdateWealthModal';
import AddCertificateModal from '../modals/AddCertificateModal';
import ViewProgressModal from '../modals/ViewProgressModal';
import toast from 'react-hot-toast';

interface NudgesPanelProps {
  user: User;
}

const NudgesPanel: React.FC<NudgesPanelProps> = ({ user }) => {
  const { updateUser } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const nudges = [
    {
      id: '1',
      title: 'Add Your Car',
      description: 'Boost your asset score',
      reward: '+320 XP',
      icon: Plus,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      action: 'Add Asset',
      modalType: 'addAsset'
    },
    {
      id: '2',
      title: 'Investment Milestone',
      description: `Only ${formatCurrency(2000)} more to reach Wealth Level 4`,
      reward: '+500 XP',
      icon: Target,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      action: 'Update Wealth',
      modalType: 'updateWealth'
    },
    {
      id: '3',
      title: 'Skill Certification',
      description: 'Add a professional certificate',
      reward: '+250 XP',
      icon: Award,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      action: 'Add Certificate',
      modalType: 'addCertificate'
    },
    {
      id: '4',
      title: 'Climb the Leaderboard',
      description: 'You\'re close to breaking top 1M globally',
      reward: 'Badge',
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      action: 'View Progress',
      modalType: 'viewProgress'
    }
  ];

  const handleNudgeClick = (modalType: string) => {
    setActiveModal(modalType);
  };

  const handleAddAsset = (asset: any) => {
    const updatedAssets = [...(user.assets || []), asset];
    updateUser({ assets: updatedAssets });
    toast.success(`Added ${asset.name} to your assets! +${Math.floor(asset.value / 50)} XP`);
  };

  const handleUpdateWealth = (wealthData: any) => {
    updateUser({ wealth: wealthData });
    toast.success('Wealth updated successfully! Your ranking is being recalculated.');
  };

  const handleAddCertificates = (certificates: string[]) => {
    const currentKnowledge = user.knowledge || { education: '', certificates: [], languages: [], total: 0 };
    const updatedKnowledge = {
      ...currentKnowledge,
      certificates,
      total: currentKnowledge.total + (certificates.length - currentKnowledge.certificates.length) * 1000
    };
    updateUser({ knowledge: updatedKnowledge });
    toast.success(`Added ${certificates.length - currentKnowledge.certificates.length} certificates! +${(certificates.length - currentKnowledge.certificates.length) * 1000} XP`);
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          <span className="text-sm text-gray-400">Boost your score</span>
        </div>

        <div className="space-y-4">
          {nudges.map((nudge, index) => (
            <motion.div
              key={nudge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${nudge.bgColor} rounded-lg flex items-center justify-center`}>
                    <nudge.icon className={`w-5 h-5 ${nudge.color}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{nudge.title}</h3>
                    <p className="text-sm text-gray-400">{nudge.description}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${nudge.color} ${nudge.bgColor}`}>
                  {nudge.reward}
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-center text-xs"
                onClick={() => handleNudgeClick(nudge.modalType)}
              >
                {nudge.action}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/30">
          <h3 className="font-medium text-white mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-gray-300">
            Complete 3 actions this week to unlock the "Go-Getter" badge and earn bonus XP!
          </p>
        </div>
      </Card>

      {/* Modals */}
      <AddAssetModal
        isOpen={activeModal === 'addAsset'}
        onClose={() => setActiveModal(null)}
        onAdd={handleAddAsset}
      />

      <UpdateWealthModal
        isOpen={activeModal === 'updateWealth'}
        onClose={() => setActiveModal(null)}
        onUpdate={handleUpdateWealth}
        currentWealth={user.wealth}
      />

      <AddCertificateModal
        isOpen={activeModal === 'addCertificate'}
        onClose={() => setActiveModal(null)}
        onAdd={handleAddCertificates}
        currentCertificates={user.knowledge?.certificates}
      />

      <ViewProgressModal
        isOpen={activeModal === 'viewProgress'}
        onClose={() => setActiveModal(null)}
        user={user}
      />
    </>
  );
};

export default NudgesPanel;