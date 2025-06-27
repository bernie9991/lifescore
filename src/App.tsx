import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import MainApp from './components/MainApp';
import BadgeUnlockModal from './components/badges/BadgeUnlockModal';

const AppContent: React.FC = () => {
  const { 
    isAuthenticated, 
    isAdmin, 
    authInitialized, 
    newlyUnlockedBadges, 
    clearNewBadges, 
    user 
  } = useAuthProvider();

  // Show loading screen while auth is initializing
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white text-xl font-semibold mb-2">Initializing LifeScore...</div>
          <div className="text-gray-300">Setting up your experience</div>
        </div>
      </div>
    );
  }

  // Check if user needs onboarding (incomplete profile)
  const needsOnboarding = user && isAuthenticated && !isAdmin && (
    !user.name || 
    !user.country || 
    !user.city || 
    user.lifeScore === 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Routes>
        <Route 
          path="/" 
          element={
            !isAuthenticated ? (
              <HomePage />
            ) : isAdmin ? (
              <Navigate to="/app" replace />
            ) : needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/app" replace />
            )
          } 
        />
        
        <Route 
          path="/onboarding" 
          element={
            isAuthenticated && !isAdmin && needsOnboarding ? (
              <OnboardingFlow />
            ) : isAuthenticated && isAdmin ? (
              <Navigate to="/app" replace />
            ) : isAuthenticated ? (
              <Navigate to="/app" replace />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        <Route 
          path="/app/*" 
          element={
            isAuthenticated && !needsOnboarding ? (
              <MainApp />
            ) : isAuthenticated && needsOnboarding ? (
              <Navigate to="/onboarding" replace />
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
  const authValue = useAuthProvider();

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <AppContent />
      </Router>
    </AuthContext.Provider>
  );
}

export default App;