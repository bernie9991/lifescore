import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import WelcomeStep from './WelcomeStep';
import BasicInfoStep from './BasicInfoStep';
import WealthStep from './WealthStep';
import AssetsStep from './AssetsStep';
import KnowledgeStep from './KnowledgeStep';
import ResultsStep from './ResultsStep';

const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const { updateUser } = useAuth();

  const steps = [
    WelcomeStep,
    BasicInfoStep,
    WealthStep,
    AssetsStep,
    KnowledgeStep,
    ResultsStep
  ];

  const nextStep = (data?: any) => {
    console.log('🔍 ONBOARDING: Next step called', { currentStep, data });
    
    if (data) {
      const newFormData = { ...formData, ...data };
      setFormData(newFormData);
      console.log('🔍 ONBOARDING: Updated form data', newFormData);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      console.log('🔍 ONBOARDING: Moving to step', currentStep + 1);
    } else {
      // Complete onboarding
      console.log('🔍 ONBOARDING: Completing onboarding with final data', formData);
      
      // Update user with all collected data
      updateUser(formData);
      
      // The ResultsStep component will handle setting the completion flag and navigation
      console.log('🔍 ONBOARDING: Onboarding flow completed');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      console.log('🔍 ONBOARDING: Moving back to step', currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep];

  console.log('🔍 ONBOARDING: Rendering step', currentStep, 'of', steps.length);

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