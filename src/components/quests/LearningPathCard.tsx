import React from 'react';
import { motion } from 'framer-motion';

interface LearningPathCardProps {
  title: string;
  institution: string;
  logoUrl: string;
  description: string;
  tags: string[];
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({
  title,
  institution,
  logoUrl,
  description,
  tags
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full"
    >
      {/* Coming Soon Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold px-3 py-1 rounded-full text-xs shadow-md">
          Coming Soon
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 h-full flex flex-col">
        {/* Institution Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            <img
              src={logoUrl}
              alt={`${institution} logo`}
              className="w-10 h-10 object-contain"
              onError={(e) => {
                // Fallback to a colored circle with initials if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">${institution.charAt(0)}</div>`;
                }
              }}
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">{institution}</h4>
            <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-1"></div>
          </div>
        </div>

        {/* Course Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
    </motion.div>
  );
};

export default LearningPathCard;