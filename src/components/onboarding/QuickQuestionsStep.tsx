import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Car, GraduationCap, Globe, DollarSign, MapPin } from 'lucide-react';
import Button from '../common/Button';

interface QuickQuestionsStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrev: () => void;
  canGoBack: boolean;
}

const QuickQuestionsStep: React.FC<QuickQuestionsStepProps> = ({ data, onNext, onPrev, canGoBack }) => {
  const [answers, setAnswers] = useState({
    name: data.name || '',
    country: data.country || '',
    city: data.city || '',
    hasHome: data.hasHome || false,
    hasCar: data.hasCar || false,
    education: data.education || '',
    languages: data.languages || ['English'],
    salary: data.salary || ''
  });

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
    'Australia', 'Japan', 'Singapore', 'Brazil', 'India', 'China', 'Spain',
    'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'South Korea',
    'Georgia', 'Other'
  ];

  const educationLevels = [
    { value: 'high-school', label: 'High School' },
    { value: 'associates', label: 'Associates Degree' },
    { value: 'bachelors', label: 'Bachelors Degree' },
    { value: 'masters', label: 'Masters Degree' },
    { value: 'doctorate', label: 'Doctorate/PhD' },
    { value: 'other', label: 'Other/Trade School' }
  ];

  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
  ];

  const handleLanguageToggle = (language: string) => {
    setAnswers(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleNext = () => {
    onNext(answers);
  };

  const isValid = answers.name && answers.country && answers.city && answers.education;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-8 rounded-2xl border border-gray-700"
    >
      <h2 className="text-3xl font-bold text-white mb-2">Quick Questions</h2>
      <p className="text-gray-300 mb-8">Help us calculate your initial LifeScore</p>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={answers.name}
              onChange={(e) => setAnswers(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your full name"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Annual Salary (USD)
            </label>
            <input
              type="number"
              value={answers.salary}
              onChange={(e) => setAnswers(prev => ({ ...prev, salary: parseInt(e.target.value) || 0 }))}
              placeholder="e.g., 75000"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="inline w-4 h-4 mr-2" />
              Country
            </label>
            <select
              value={answers.country}
              onChange={(e) => setAnswers(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
            <input
              type="text"
              value={answers.city}
              onChange={(e) => setAnswers(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Your city"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Assets */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">Do you own any of these?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAnswers(prev => ({ ...prev, hasHome: !prev.hasHome }))}
              className={`p-4 rounded-lg border text-left transition-all ${
                answers.hasHome
                  ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                  : 'border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-500'
              }`}
            >
              <Home className="w-6 h-6 mb-2" />
              <div className="font-medium">Home/Property</div>
              <div className="text-sm text-gray-400">Own or paying mortgage</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAnswers(prev => ({ ...prev, hasCar: !prev.hasCar }))}
              className={`p-4 rounded-lg border text-left transition-all ${
                answers.hasCar
                  ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                  : 'border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-500'
              }`}
            >
              <Car className="w-6 h-6 mb-2" />
              <div className="font-medium">Vehicle</div>
              <div className="text-sm text-gray-400">Car, truck, motorcycle</div>
            </motion.button>
          </div>
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">
            <GraduationCap className="inline w-4 h-4 mr-2" />
            Highest Education Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {educationLevels.map(level => (
              <motion.button
                key={level.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAnswers(prev => ({ ...prev, education: level.value }))}
                className={`p-3 rounded-lg border text-left transition-all ${
                  answers.education === level.value
                    ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                    : 'border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">{level.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">
            <Globe className="inline w-4 h-4 mr-2" />
            Languages You Speak
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {commonLanguages.map(language => (
              <motion.button
                key={language}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageToggle(language)}
                className={`p-2 rounded-lg border text-center transition-all text-sm ${
                  answers.languages.includes(language)
                    ? 'border-green-500 bg-green-900/20 text-green-300'
                    : 'border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-500'
                }`}
              >
                {language}
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Selected: {answers.languages.join(', ')}
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="secondary" onClick={onPrev}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!isValid}>
          Complete Setup
        </Button>
      </div>
    </motion.div>
  );
};

export default QuickQuestionsStep;