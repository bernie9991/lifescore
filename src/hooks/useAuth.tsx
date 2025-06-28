import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';
import { updateUserLifeScore } from '../utils/lifeScoreEngine';
import { checkBadgeUnlocks, getDefaultBadgesForNewUser, ALL_BADGES } from '../utils/badgeSystem';
import toast from 'react-hot-toast';

// Enhanced timeout configuration
const TIMEOUT_CONFIG = {
  AUTH_OPERATIONS: 15000,     // 15 seconds for auth operations
  DATABASE_QUERIES: 10000,    // 10 seconds for database queries
  USER_CREATION: 20000,       // 20 seconds for user creation
  SESSION_CHECK: 5000         // 5 seconds for session checks
};

// Enhanced error types for better error handling
enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

interface AuthError {
  type: AuthErrorType;
  message: string;
  originalError?: any;
  timestamp: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  newlyUnlockedBadges: any[];
  clearNewBadges: () => void;
  loading: boolean;
  lastError: AuthError | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Enhanced logging utility
const authLogger = {
  info: (message: string, data?: any) => {
    console.log(`🔥 FIREBASE AUTH: ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`❌ FIREBASE ERROR: ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ FIREBASE WARNING: ${message}`, data || '');
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`🔍 FIREBASE DEBUG: ${message}`, data || '');
    }
  }
};

// Enhanced timeout wrapper with better error handling
const withTimeout = <T,>(
  promise: Promise<T>, 
  timeoutMs: number,
  operation: string = 'operation'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const error: AuthError = {
        type: AuthErrorType.TIMEOUT_ERROR,
        message: `${operation} timed out after ${timeoutMs}ms. Please check your connection.`,
        timestamp: new Date()
      };
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([
    Promise.resolve(promise).catch(err => {
      const error: AuthError = {
        type: AuthErrorType.NETWORK_ERROR,
        message: `${operation} failed`,
        originalError: err,
        timestamp: new Date()
      };
      throw error;
    }),
    timeoutPromise
  ]);
};

// Input validation utilities
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  return { isValid: true };
};

const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  if (name.length > 100) {
    return { isValid: false, message: 'Name must be less than 100 characters' };
  }
  return { isValid: true };
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<AuthError | null>(null);

  const clearError = () => setLastError(null);

  // Enhanced error handler
  const handleAuthError = useCallback((error: any, operation: string): AuthError => {
    authLogger.error(`${operation} failed`, error);
    
    let authError: AuthError;
    
    if (error.type) {
      // Already an AuthError
      authError = error;
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      authError = {
        type: AuthErrorType.AUTH_ERROR,
        message: 'Invalid email or password. Please check your credentials and try again.',
        originalError: error,
        timestamp: new Date()
      };
    } else if (error.code === 'auth/email-already-in-use') {
      authError = {
        type: AuthErrorType.VALIDATION_ERROR,
        message: 'An account with this email already exists. Please try logging in instead.',
        originalError: error,
        timestamp: new Date()
      };
    } else if (error.code === 'auth/weak-password') {
      authError = {
        type: AuthErrorType.VALIDATION_ERROR,
        message: 'Password is too weak. Please choose a stronger password (at least 6 characters).',
        originalError: error,
        timestamp: new Date()
      };
    } else if (error.code === 'auth/invalid-email') {
      authError = {
        type: AuthErrorType.VALIDATION_ERROR,
        message: 'Please enter a valid email address.',
        originalError: error,
        timestamp: new Date()
      };
    } else if (error.code === 'auth/network-request-failed') {
      authError = {
        type: AuthErrorType.NETWORK_ERROR,
        message: 'Network error. Please check your internet connection and try again.',
        originalError: error,
        timestamp: new Date()
      };
    } else if (error.code === 'auth/too-many-requests') {
      authError = {
        type: AuthErrorType.AUTH_ERROR,
        message: 'Too many failed attempts. Please wait a moment and try again.',
        originalError: error,
        timestamp: new Date()
      };
    } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      authError = {
        type: AuthErrorType.TIMEOUT_ERROR,
        message: `${operation} timed out. Please check your connection and try again.`,
        originalError: error,
        timestamp: new Date()
      };
    } else {
      authError = {
        type: AuthErrorType.UNKNOWN_ERROR,
        message: error.message || `${operation} failed. Please try again.`,
        originalError: error,
        timestamp: new Date()
      };
    }
    
    setLastError(authError);
    return authError;
  }, []);

  // Create mock admin user
  const createMockAdminUser = (): User => ({
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@lifescore.com',
    avatar: undefined,
    age: undefined,
    gender: undefined,
    country: 'Global',
    city: 'Admin City',
    lifeScore: 1000,
    wealth: {
      salary: 100000,
      savings: 50000,
      investments: 25000,
      currency: 'USD',
      total: 175000
    },
    knowledge: {
      education: 'Master\'s Degree',
      certificates: ['Admin Certification', 'Leadership Certificate'],
      languages: ['English', 'Spanish', 'French'],
      total: 100
    },
    assets: [
      { id: '1', type: 'Real Estate', name: 'Admin House', value: 500000, verified: true },
      { id: '2', type: 'Vehicle', name: 'Admin Car', value: 50000, verified: true }
    ],
    badges: ALL_BADGES.slice(0, 5).map(badge => ({
      ...badge,
      unlockedAt: new Date()
    })),
    friends: [],
    createdAt: new Date(),
    lastActive: new Date(),
    avatarBadge: ALL_BADGES[0],
    wantsIntegrations: false,
    role: 'admin'
  });

  // Initialize user data in Firestore
  const initializeUserData = async (userId: string, name: string, email: string) => {
    authLogger.info('Initializing user data in Firestore', { userId, name, email });
    
    try {
      // Validate inputs
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.message);
      }

      const emailValidation = validateEmail(email);
      if (!emailValidation) {
        throw new Error('Invalid email format');
      }

      // Create user profile document
      const userDocRef = doc(db, 'users', userId);
      const userData = {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: null,
        age: null,
        gender: null,
        country: '',
        city: '',
        lifeScore: 0,
        avatarBadgeId: null,
        wantsIntegrations: false,
        wealth: {
          salary: 0,
          savings: 0,
          investments: 0,
          currency: 'USD',
          total: 0
        },
        knowledge: {
          education: '',
          certificates: [],
          languages: [],
          total: 0
        },
        assets: [],
        friends: [],
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        role: 'user'
      };

      await withTimeout(
        setDoc(userDocRef, userData),
        TIMEOUT_CONFIG.DATABASE_QUERIES,
        'user profile creation'
      );

      authLogger.info('User profile created successfully');

      // Create starter badges
      const starterBadges = [
        { userId, badgeId: 'welcome-aboard', unlockedAt: serverTimestamp() },
        { userId, badgeId: 'profile-complete', unlockedAt: serverTimestamp() }
      ];

      const badgesCollection = collection(db, 'userBadges');
      for (const badge of starterBadges) {
        await withTimeout(
          addDoc(badgesCollection, badge),
          TIMEOUT_CONFIG.DATABASE_QUERIES,
          'starter badge creation'
        );
      }

      authLogger.info('Starter badges created successfully');
      authLogger.info('User data initialization complete');
      return true;
    } catch (error) {
      authLogger.error('User data initialization failed', error);
      throw error;
    }
  };

  // Load user data from Firestore
  const loadUserData = useCallback(async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      authLogger.info('Loading user data from Firestore', { userId: firebaseUser.uid });
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await withTimeout(
        getDoc(userDocRef),
        TIMEOUT_CONFIG.DATABASE_QUERIES,
        'user profile query'
      );

      if (!userDocSnap.exists()) {
        authLogger.warn('User profile not found, creating default user for onboarding');
        return {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL,
          age: undefined,
          gender: undefined,
          country: '',
          city: '',
          lifeScore: 0,
          wealth: {
            salary: 0,
            savings: 0,
            investments: 0,
            currency: 'USD',
            total: 0
          },
          knowledge: {
            education: '',
            certificates: [],
            languages: [],
            total: 0
          },
          assets: [],
          badges: [],
          friends: [],
          createdAt: new Date(),
          lastActive: new Date(),
          wantsIntegrations: false,
          role: 'user'
        };
      }

      const userData = userDocSnap.data();

      // Load user badges
      const badgesQuery = query(
        collection(db, 'userBadges'),
        where('userId', '==', firebaseUser.uid)
      );
      
      const badgesSnapshot = await withTimeout(
        getDocs(badgesQuery),
        TIMEOUT_CONFIG.DATABASE_QUERIES,
        'user badges query'
      );

      const userBadges = badgesSnapshot.docs.map(doc => {
        const badgeData = doc.data();
        const badge = ALL_BADGES.find(b => b.id === badgeData.badgeId);
        return badge ? {
          ...badge,
          unlockedAt: badgeData.unlockedAt?.toDate() || new Date()
        } : null;
      }).filter(Boolean);

      // Convert Firestore data to User type
      const user: User = {
        id: userData.id,
        name: userData.name || '',
        email: userData.email || firebaseUser.email || '',
        avatar: userData.avatar || firebaseUser.photoURL,
        age: userData.age,
        gender: userData.gender,
        country: userData.country || '',
        city: userData.city || '',
        lifeScore: userData.lifeScore || 0,
        wealth: userData.wealth || {
          salary: 0,
          savings: 0,
          investments: 0,
          currency: 'USD',
          total: 0
        },
        knowledge: userData.knowledge || {
          education: '',
          certificates: [],
          languages: [],
          total: 0
        },
        assets: userData.assets || [],
        badges: userBadges,
        friends: userData.friends || [],
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastActive: new Date(),
        avatarBadge: userData.avatarBadgeId ? ALL_BADGES.find(b => b.id === userData.avatarBadgeId) : undefined,
        wantsIntegrations: userData.wantsIntegrations || false,
        role: userData.role || 'user'
      };

      authLogger.info('User data loaded successfully', { userName: user.name });
      return user;
    } catch (error) {
      authLogger.error('Error loading user data', error);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      authLogger.info('Logging out user');
      
      // Handle admin logout
      if (isAdmin) {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setNewlyUnlockedBadges([]);
        setLoading(false);
        return;
      }
      
      await withTimeout(
        signOut(auth),
        TIMEOUT_CONFIG.AUTH_OPERATIONS,
        'logout'
      );
      
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setNewlyUnlockedBadges([]);
      clearError();
    } catch (error) {
      handleAuthError(error, 'Logout');
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setNewlyUnlockedBadges([]);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, isAdmin]);

  // Initialize auth with Firebase
  useEffect(() => {
    let isMounted = true;

    authLogger.info('Initializing Firebase authentication...');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      try {
        if (firebaseUser) {
          authLogger.info('Firebase user authenticated', { userId: firebaseUser.uid, email: firebaseUser.email });
          const userData = await loadUserData(firebaseUser);
          
          if (userData && isMounted) {
            setUser(userData);
            setIsAuthenticated(true);
            clearError();
            authLogger.info('User state updated successfully');
          }
        } else {
          authLogger.info('No Firebase user found');
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
            setNewlyUnlockedBadges([]);
          }
        }
      } catch (error) {
        handleAuthError(error, 'Auth state change');
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
          setNewlyUnlockedBadges([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [loadUserData, handleAuthError]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      authLogger.info('Attempting login', { email });
      
      // Input validation
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      
      // Admin login - handle this first before attempting Firebase auth
      if (email === 'admin' && password === 'admin123') {
        authLogger.info('Admin login detected');
        const adminUser = createMockAdminUser();
        setUser(adminUser);
        setIsAdmin(true);
        setIsAuthenticated(true);
        setLoading(false);
        authLogger.info('Admin login successful');
        return;
      }

      // Regular user login with Firebase
      authLogger.info('Attempting Firebase authentication...');
      const userCredential = await withTimeout(
        signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password),
        TIMEOUT_CONFIG.AUTH_OPERATIONS,
        'Firebase login'
      );

      if (userCredential.user) {
        authLogger.info('Firebase login successful', { userId: userCredential.user.uid });
        // Auth state change will handle the rest
        return;
      }

      throw new Error('Login failed - no user returned');
    } catch (error) {
      const authError = handleAuthError(error, 'Login');
      throw authError;
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();
      authLogger.info('Attempting signup', { email, name });
      
      // Input validation
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.message);
      }
      
      // Step 1: Create Firebase auth user
      authLogger.info('Creating Firebase user...');
      const userCredential = await withTimeout(
        createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password),
        TIMEOUT_CONFIG.AUTH_OPERATIONS,
        'Firebase user creation'
      );

      if (!userCredential.user) {
        throw new Error('Signup failed - no user returned');
      }

      authLogger.info('Firebase user created successfully', { userId: userCredential.user.uid });

      // Step 2: Update Firebase user profile
      authLogger.info('Updating Firebase user profile...');
      await updateProfile(userCredential.user, {
        displayName: name.trim()
      });

      // Step 3: Initialize user data in Firestore
      authLogger.info('Initializing user data in Firestore...');
      await initializeUserData(userCredential.user.uid, name.trim(), email.trim().toLowerCase());

      // Step 4: Load complete user data
      authLogger.info('Loading complete user data...');
      const userData = await loadUserData(userCredential.user);
      
      if (!userData) {
        throw new Error('Failed to load user data after signup');
      }

      // Step 5: Set up badges for celebration
      authLogger.info('Setting up welcome badges...');
      const defaultBadges = getDefaultBadgesForNewUser(userData);
      
      if (defaultBadges.length > 0) {
        authLogger.info('Setting newly unlocked badges for display', { badges: defaultBadges.map(b => b.name) });
        setNewlyUnlockedBadges(defaultBadges);
        userData.badges = [...userData.badges, ...defaultBadges];
      }

      // Step 6: Set user state
      setUser(userData);
      setIsAuthenticated(true);
      
      authLogger.info('Signup completed successfully');
      return;
    } catch (error) {
      const authError = handleAuthError(error, 'Signup');
      throw authError;
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, loadUserData]);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    if (!user) {
      authLogger.error('No user to update');
      return;
    }

    try {
      authLogger.debug('Updating user', userData);
      
      const updatedUser = { ...user, ...userData };
      const userWithScore = updateUserLifeScore(updatedUser);
      
      authLogger.debug('Checking for badge unlocks...');
      const newBadges = checkBadgeUnlocks(userWithScore, user);
      
      if (newBadges.length > 0) {
        authLogger.info('New badges unlocked', { badges: newBadges.map(b => b.name) });
        userWithScore.badges = [...(userWithScore.badges || []), ...newBadges];
        
        // Save new badges to Firestore
        const badgesCollection = collection(db, 'userBadges');
        for (const badge of newBadges) {
          await addDoc(badgesCollection, {
            userId: user.id,
            badgeId: badge.id,
            unlockedAt: serverTimestamp()
          });
        }
      }
      
      setUser(userWithScore);
      
      // Don't try to save admin user data to Firebase
      if (isAdmin) {
        authLogger.info('Admin user - skipping database save');
        if (newBadges.length > 0) {
          setNewlyUnlockedBadges(newBadges);
          toast.success(`🎉 ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''} unlocked!`);
        }
        return;
      }
      
      // Save to Firestore for real users
      const userDocRef = doc(db, 'users', user.id);
      const updateData = {
        ...userData,
        lifeScore: userWithScore.lifeScore,
        lastActive: serverTimestamp()
      };
      
      await setDoc(userDocRef, updateData, { merge: true });
      authLogger.info('User data updated in Firestore');
      
      if (newBadges.length > 0) {
        setNewlyUnlockedBadges(newBadges);
        toast.success(`🎉 ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''} unlocked!`);
      }
    } catch (error) {
      handleAuthError(error, 'User update');
      toast.error('Failed to update profile');
    }
  }, [handleAuthError, user, isAdmin]);

  const clearNewBadges = () => {
    authLogger.debug('Clearing newly unlocked badges');
    setNewlyUnlockedBadges([]);
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    signup,
    logout,
    updateUser,
    newlyUnlockedBadges,
    clearNewBadges,
    loading,
    lastError,
    clearError
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authValue = useAuthProvider();

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };