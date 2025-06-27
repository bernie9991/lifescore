import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Globe, Plus, X } from 'lucide-react';
import Button from '../common/Button';

interface KnowledgeStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrev: () => void;
  canGoBack: boolean;
}

const KnowledgeStep: React.FC<KnowledgeStepProps> = ({ data, onNext, onPrev, canGoBack }) => {
  const [education, setEducation] = useState(data.knowledge?.education || '');
  const [certificates, setCertificates] = useState(data.knowledge?.certificates || []);
  const [languages, setLanguages] = useState(data.knowledge?.languages || []);
  const [newCertificate, setNewCertificate] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const educationLevels = [
    { value: 'high-school', label: 'High School', points: 100 },
    { value: 'associates', label: 'Associates Degree', points: 200 },
    { value: 'bachelors', label: 'Bachelors Degree', points: 400 },
    { value: 'masters', label: 'Masters Degree', points: 600 },
    { value: 'doctorate', label: 'Doctorate/PhD', points: 1000 },
    { value: 'other', label: 'Other/Trade School', points: 150 }
  ];

  const addCertificate = () => {
    if (newCertificate.trim() && !certificates.includes(newCertificate.trim())) {
      setCertificates([...certificates, newCertificate.trim()]);
      setNewCertificate('');
    }
  };

  const removeCertificate = (cert: string) => {
    setCertificates(certificates.filter(c => c !== cert));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const calculateKnowledgeScore = () => {
    const educationPoints = educationLevels.find(e => e.value === education)?.points || 0;
    const certificatePoints = certificates.length * 100;
    const languagePoints = languages.length * 50;
    return educationPoints + certificatePoints + languagePoints;
  };

  const handleNext = () => {
    onNext({
      knowledge: {
        education,
        certificates,
        languages,
        total: calculateKnowledgeScore()
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-8 rounded-2xl border border-gray-700"
    >
      <h2 className="text-3xl font-bold text-white mb-2">Knowledge & Education</h2>
      <p className="text-gray-300 mb-8">Tell us about your educational background and skills</p>

      <div className="space-y-8">
        {/* Education Level */}
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
                onClick={() => setEducation(level.value)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  education === level.value
                    ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                    : 'border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">{level.label}</div>
                <div className="text-sm text-gray-400">+{level.points} points</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">
            <Award className="inline w-4 h-4 mr-2" />
            Certificates & Qualifications
          </label>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCertificate}
              onChange={(e) => setNewCertificate(e.target.value)}
              placeholder="e.g., AWS Certified, PMP, etc."
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addCertificate()}
            />
            <Button onClick={addCertificate} icon={Plus}>
              Add
            </Button>
          </div>

          {certificates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {certificates.map((cert: string) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/20 border border-blue-500/30 rounded-full text-blue-300 text-sm"
                >
                  {cert}
                  <button
                    onClick={() => removeCertificate(cert)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-4">
            <Globe className="inline w-4 h-4 mr-2" />
            Languages Spoken
          </label>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="e.g., English, Spanish, French"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
            />
            <Button onClick={addLanguage} icon={Plus}>
              Add
            </Button>
          </div>

          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {languages.map((lang: string) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-900/20 border border-green-500/30 rounded-full text-green-300 text-sm"
                >
                  {lang}
                  <button
                    onClick={() => removeLanguage(lang)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Knowledge Score Preview */}
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Knowledge Score:</span>
            <span className="text-2xl font-bold text-blue-400">
              {calculateKnowledgeScore()} points
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="secondary" onClick={onPrev}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
};

export default KnowledgeStep;