import React from 'react';
import { motion } from 'framer-motion';

interface MissionCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

const MissionCard: React.FC<MissionCardProps> = ({ title, description, imageUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-64 md:h-80 rounded-2xl overflow-hidden group"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      
      {/* Coming Soon Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg">
          Coming Soon
        </div>
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
          {title}
        </h3>
        <p className="text-gray-200 text-sm md:text-base leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-2xl border border-white/10" />
    </motion.div>
  );
};

export default MissionCard;