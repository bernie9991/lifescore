import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import MainAppLayout from './components/layout/MainAppLayout';
import AdminPanel from './components/admin/AdminPanel';
import BadgeUnlockModal from './components/badges/BadgeUnlockModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin, newlyUnlockedBadges, clearNewBadges, user } = useAuth();

  // Check if onboarding has been completed via localStorage
  const onboardingComplete = localStorage.getItem('lifescore_onboarding_complete') === 'true';

  // Check if user needs onboarding (incomplete profile)
  // A user needs onboarding if they don't have basic profile data OR their lifeScore is 0
  const needsOnboarding = user && (
    !onboardingComplete || 
    !user.name || 
    !user.country || 
    !user.city || 
    user.lifeScore === 0
  );

  console.log('🔍 APP ROUTING DEBUG:', {
    isAuthenticated,
    isAdmin,
    user: user ? { id: user.id, name: user.name, country: user.country, city: user.city, lifeScore: user.lifeScore } : null,
    onboardingComplete,
    needsOnboarding
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : needsOnboarding ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <HomePage />
            )
          } 
        />
        
        <Route 
          path="/onboarding" 
          element={
            isAuthenticated && !isAdmin && needsOnboarding ? (
              <OnboardingFlow />
            ) : isAuthenticated && isAdmin ? (
              <Navigate to="/admin" replace />
            ) : isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated && !isAdmin && !needsOnboarding ? (
              <MainAppLayout />
            ) : isAuthenticated && isAdmin ? (
              <Navigate to="/admin" replace />
            ) : isAuthenticated && needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        <Route 
          path="/admin" 
          element={
            isAdmin ? (
              <AdminPanel />
            ) : isAuthenticated ? (
              needsOnboarding ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Badge Unlock Modal */}
      {newlyUnlockedBadges.length > 0 && (
        <BadgeUnlockModal
          badges={newlyUnlockedBadges}
          isOpen={newlyUnlockedBadges.length > 0}
          onClose={clearNewBadges}
          onSkipAll={clearNewBadges}
        />
      )}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#F3F4F6',
            border: '1px solid #374151',
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;