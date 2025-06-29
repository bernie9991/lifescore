import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { User, Mission } from '../../types';
import { formatCurrency } from '../../utils/animations';
import Card from '../common/Card';
import MissionGoalsPanel from './MissionGoalsPanel';

interface LifeScoreMeterProps {
  user: User;
  onViewAllMissions?: () => void;
  onViewMission?: (mission: Mission) => void;
}

const LifeScoreMeter: React.FC<LifeScoreMeterProps> = ({ user, onViewAllMissions, onViewMission }) => {
  const wealthScore = (user.wealth?.total || 0) / 10;
  const knowledgeScore = user.knowledge?.total || 0;
  const assetScore = (user.assets || []).reduce((sum, asset) => sum + asset.value, 0) / 50;

  const pieData = [
    { name: 'Wealth', value: wealthScore, color: '#3B82F6' },
    { name: 'Knowledge', value: knowledgeScore, color: '#10B981' },
    { name: 'Assets', value: assetScore, color: '#8B5CF6' }
  ];

  const barData = [
    { name: 'Current', wealth: wealthScore, knowledge: knowledgeScore },
    { name: 'Target', wealth: wealthScore * 1.5, knowledge: knowledgeScore * 1.3 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">LifeScore Breakdown</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-4">Score Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [Math.round(value), 'Points']}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#F3F4F6'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats & Progress */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-4">Detailed Breakdown</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Wealth</span>
                  <span className="text-blue-400 font-semibold">
                    {Math.round(wealthScore)} pts
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((wealthScore / 5000) * 100, 100)}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatCurrency(user.wealth?.total || 0)}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Knowledge</span>
                  <span className="text-green-400 font-semibold">
                    {knowledgeScore} pts
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((knowledgeScore / 1000) * 100, 100)}%` }}
                    transition={{ delay: 0.7, duration: 1 }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {user.knowledge?.education || 'Not specified'} • {(user.knowledge?.languages || []).length} languages
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Assets</span>
                  <span className="text-purple-400 font-semibold">
                    {Math.round(assetScore)} pts
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((assetScore / 2000) * 100, 100)}%` }}
                    transition={{ delay: 0.9, duration: 1 }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {(user.assets || []).length} items • {formatCurrency((user.assets || []).reduce((sum, asset) => sum + asset.value, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Mission Goals Panel */}
      <MissionGoalsPanel 
        user={user} 
        onViewAllMissions={onViewAllMissions}
        onViewMission={onViewMission}
      />
    </div>
  );
};

export default LifeScoreMeter;