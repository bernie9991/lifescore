import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import MainAppLayout from './components/layout/MainAppLayout';
import AdminPanel from './components/admin/AdminPanel';
import BadgeUnlockModal from './components/badges/BadgeUnlockModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, isAdmin, newlyUnlockedBadges, clearNewBadges, user } = useAuthProvider();

  // Check if user needs onboarding (incomplete profile)
  const needsOnboarding = user && (
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
              <Navigate to="/admin" replace />
            ) : needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <MainAppLayout />
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
              <Navigate to="/" replace />
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
                <Navigate to="/" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Catch all route */}
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