import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { ALL_BADGES } from '../../utils/badgeSystem';
import { triggerConfetti } from '../../utils/animations';
import WelcomeStep from './WelcomeStep';
import QuickQuestionsStep from './QuickQuestionsStep';
import BadgeUnlockModal from '../badges/BadgeUnlockModal';

const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [showBadges, setShowBadges] = useState(false);
  const [badgesToShow, setBadgesToShow] = useState<any[]>([]);
  const { updateUser } = useAuth();

  const steps = [
    WelcomeStep,
    QuickQuestionsStep
  ];

  const nextStep = (data?: any) => {
    if (data) {
      setFormData(prev => ({ ...prev, ...data }));
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Calculate LifeScore based on answers
      let lifeScore = 1000; // Base score
      
      // Add points based on answers
      if (formData.hasHome) lifeScore += 2000;
      if (formData.hasCar) lifeScore += 500;
      if (formData.education === 'bachelors') lifeScore += 1500;
      if (formData.education === 'masters') lifeScore += 2000;
      if (formData.education === 'doctorate') lifeScore += 2500;
      if (formData.languages?.length > 1) lifeScore += formData.languages.length * 200;
      if (formData.salary) lifeScore += Math.min(formData.salary / 10, 2000);

      // Prepare user data
      const userData = {
        ...formData,
        lifeScore,
        wealth: {
          salary: formData.salary || 0,
          savings: 0,
          investments: 0,
          currency: 'USD',
          total: formData.salary || 0
        },
        knowledge: {
          education: formData.education || '',
          certificates: [],
          languages: formData.languages || ['English'],
          total: formData.languages?.length * 200 || 200
        },
        assets: []
      };

      // Add assets based on answers
      if (formData.hasHome) {
        userData.assets.push({
          id: crypto.randomUUID(),
          type: 'home',
          name: 'Primary Residence',
          value: 300000,
          verified: false
        });
      }

      if (formData.hasCar) {
        userData.assets.push({
          id: crypto.randomUUID(),
          type: 'car',
          name: 'Personal Vehicle',
          value: 25000,
          verified: false
        });
      }

      // Update user data
      await updateUser(userData);

      // Show welcome badges
      const welcomeBadges = [
        ALL_BADGES.find(b => b.id === 'welcome-aboard'),
        ALL_BADGES.find(b => b.id === 'profile-complete'),
        formData.hasHome ? ALL_BADGES.find(b => b.id === 'homeowner') : null,
        formData.hasCar ? ALL_BADGES.find(b => b.id === 'car-owner') : null,
        (formData.salary && formData.salary >= 50000) ? ALL_BADGES.find(b => b.id === 'wealth-apprentice') : null
      ].filter(Boolean);

      setBadgesToShow(welcomeBadges);
      setShowBadges(true);
      triggerConfetti();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const CurrentStepComponent = steps[currentStep];

  if (showBadges) {
    return (
      <BadgeUnlockModal
        badges={badgesToShow}
        isOpen={showBadges}
        onClose={() => setShowBadges(false)}
        onSkipAll={() => setShowBadges(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepComponent
              data={formData}
              onNext={nextStep}
              onPrev={prevStep}
              canGoBack={currentStep > 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;