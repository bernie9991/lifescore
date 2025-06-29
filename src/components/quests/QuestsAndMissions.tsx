import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Calendar, 
  BookOpen, 
  Trophy
} from 'lucide-react';
import { User } from '../../types';
import { formatNumber } from '../../utils/animations';
import MissionCard from './MissionCard';
import LearningPathCard from './LearningPathCard';
import HabitTracker from './HabitTracker';
import Card from '../common/Card';

interface QuestsAndMissionsProps {
  user: User;
}

const QuestsAndMissions: React.FC<QuestsAndMissionsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('habits');

  const tabs = [
    { id: 'habits', label: 'Habit Tracker', icon: Calendar },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'knowledge', label: 'Knowledge Paths', icon: BookOpen }
  ];

  // Learning paths data
  const learningPaths = [
    {
      title: "Machine Learning Specialization",
      institution: "Stanford University",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_Cardinal_logo.svg/200px-Stanford_Cardinal_logo.svg.png",
      description: "Learn the fundamentals of machine learning and build intelligent systems. Master supervised learning, unsupervised learning, and best practices used in Silicon Valley.",
      tags: ["Machine Learning", "Python", "AI", "Advanced"]
    },
    {
      title: "CS50: Introduction to Computer Science",
      institution: "Harvard University",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/200px-Harvard_University_coat_of_arms.svg.png",
      description: "Harvard's introduction to computer science and programming. Learn to think algorithmically and solve problems efficiently with languages including C, Python, SQL, and JavaScript.",
      tags: ["Computer Science", "Programming", "Beginner", "Algorithms"]
    },
    {
      title: "Deep Learning Specialization",
      institution: "DeepLearning.AI",
      logoUrl: "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-university-assets.s3.amazonaws.com/fa/03d7b0c2b511e698b8b7c92c7d0b5b/DL-Logo-Square.png",
      description: "Master deep learning and break into AI. Build neural networks and lead successful machine learning projects. Course taught by Andrew Ng.",
      tags: ["Deep Learning", "Neural Networks", "TensorFlow", "Expert"]
    },
    {
      title: "Financial Markets",
      institution: "Yale University",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Yale_University_Shield_1.svg/200px-Yale_University_Shield_1.svg.png",
      description: "An overview of the ideas, methods, and institutions that permit human society to manage risks and foster enterprise. Emphasis on financially-savvy leadership skills.",
      tags: ["Finance", "Economics", "Investment", "Intermediate"]
    },
    {
      title: "Google UX Design Certificate",
      institution: "Google",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png",
      description: "Launch your career in UX design. Create a professional UX portfolio with 3 end-to-end projects: a mobile app, a responsive website, and a cross-platform experience.",
      tags: ["UX Design", "Design Thinking", "Figma", "Beginner"]
    },
    {
      title: "IBM Data Science Professional Certificate",
      institution: "IBM",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/200px-IBM_logo.svg.png",
      description: "Gain the job-ready skills for an entry-level data scientist role. Master the most up-to-date practical skills and knowledge data scientists use in their daily roles.",
      tags: ["Data Science", "Python", "SQL", "Machine Learning"]
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            🎯 Quests & Missions
          </h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base">Level up your life through missions, habits, and knowledge paths</p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-yellow-400">{formatNumber(user.lifeScore || 0)}</div>
            <div className="text-xs text-gray-400">Total XP</div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Tabs */}
      <div className="w-full overflow-x-auto">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-md transition-colors whitespace-nowrap text-sm md:text-base ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Habit Tracker Tab */}
      {activeTab === 'habits' && (
        <HabitTracker user={user} />
      )}

      {/* Missions Tab */}
      {activeTab === 'missions' && (
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MissionCard
              title="Buy Your First Home"
              description="A step-by-step guide from saving to signing."
              imageUrl="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
            />
            <MissionCard
              title="Run a 5k Race"
              description="Go from the couch to the finish line in just 8 weeks."
              imageUrl="https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=800"
            />
            <MissionCard
              title="Launch a Side Hustle"
              description="Turn your passion into a profitable business."
              imageUrl="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800"
            />
          </div>
        </div>
      )}

      {/* Knowledge Paths Tab */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4 md:space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              🎓 Premium Learning Paths
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Master new skills with world-class courses from top universities and industry leaders. 
              Build your expertise and unlock new career opportunities.
            </p>
          </div>

          {/* Learning Path Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map((path, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LearningPathCard
                  title={path.title}
                  institution={path.institution}
                  logoUrl={path.logoUrl}
                  description={path.description}
                  tags={path.tags}
                />
              </motion.div>
            ))}
          </div>

          {/* Premium Learning Paths Note */}
          <Card className="p-3 md:p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <div className="text-center">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-base md:text-lg font-bold text-white mb-2">Premium Learning Paths</h3>
              <p className="text-gray-300 text-sm">
                Curated by world-renowned institutions including Stanford, MIT, and Harvard. 
                Advanced learning paths with real-world projects and industry recognition.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuestsAndMissions;