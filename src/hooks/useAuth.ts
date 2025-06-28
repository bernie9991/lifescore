import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { updateUserLifeScore } from '../utils/lifeScoreEngine';
import { checkBadgeUnlocks, getDefaultBadgesForNewUser, ALL_BADGES } from '../utils/badgeSystem';
import toast from 'react-hot-toast';

// Enhanced timeout configuration with increased timeout values for better reliability
const TIMEOUT_CONFIG = {
  AUTH_OPERATIONS: 30000,     // 30 seconds for auth operations
  DATABASE_QUERIES: 20000,    // 20 seconds for database queries
  USER_CREATION: 30000,       // 30 seconds for user creation
  SESSION_CHECK: 10000        // 10 seconds for session checks
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
    console.log(`🔐 AUTH INFO: ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`❌ AUTH ERROR: ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ AUTH WARNING: ${message}`, data || '');
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`🔍 AUTH DEBUG: ${message}`, data || '');
    }
  }
};

// Enhanced timeout wrapper with better error handling
const withTimeout = <T>(
  promise: Promise<T>, 
  timeoutMs: number,
  operation: string = 'operation'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const error: AuthError = {
        type: AuthErrorType.TIMEOUT_ERROR,
        message: `${operation} timed out after ${timeoutMs}ms`,
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
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<AuthError | null>(null);

  const clearError = () => setLastError(null);

  // Enhanced error handler
  const handleAuthError = useCallback((error: any, operation: string): AuthError => {
    authLogger.error(`${operation} failed`, error);
    
    let authError: AuthError;
    
    if (error.type) {
      // Already an AuthError
      authError = error;
    } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      authError = {
        type: AuthErrorType.TIMEOUT_ERROR,
        message: `${operation} timed out. Please check your connection and try again.`,
        originalError: error,
        timestamp: new Date()
      };
    } else if (error.message?.includes('Invalid login credentials')) {
      authError = {
        type: AuthErrorType.AUTH_ERROR,
        message: 'Invalid email or password. Please check your credentials and try again.',
        originalError: error,
        timestamp: new Date()
      };
    } else if (error.message?.includes('User already registered')) {
      authError = {
        type: AuthErrorType.VALIDATION_ERROR,
        message: 'An account with this email already exists. Please try logging in instead.',
        originalError: error,
        timestamp: new Date()
      };
    } else if (error.message?.includes('Email not confirmed')) {
      authError = {
        type: AuthErrorType.AUTH_ERROR,
        message: 'Please check your email and click the confirmation link before signing in.',
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

  // Enhanced session checking with retry logic
  const waitForSession = async (maxRetries = 3, delay = 1000): Promise<SupabaseUser | null> => {
    for (let i = 0; i < maxRetries; i++) {
      authLogger.debug(`Checking for session (attempt ${i + 1}/${maxRetries})`);
      
      try {
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await withTimeout(
          sessionPromise, 
          TIMEOUT_CONFIG.SESSION_CHECK,
          'session check'
        );
        
        if (error) {
          authLogger.error('Session check error', error);
          throw error;
        }
        
        if (session?.user) {
          authLogger.info('Session found', { userId: session.user.id });
          return session.user;
        }
        
        if (i < maxRetries - 1) {
          authLogger.debug(`No session yet, waiting ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        authLogger.warn(`Session check attempt ${i + 1} failed, retrying...`);
      }
    }
    
    authLogger.info('No session found after retries');
    return null;
  };

  // Enhanced user data initialization with better error handling
  const initializeUserData = async (userId: string, name: string, email: string) => {
    authLogger.info('Initializing user data', { userId, name, email });
    
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

      // 1. Create profile with enhanced error handling
      authLogger.debug('Creating profile...');
      const profilePromise = supabase
        .from('profiles')
        .insert({
          id: userId,
          name: name.trim(),
          avatar_url: null,
          age: null,
          gender: null,
          country: '',
          city: '',
          life_score: 0,
          avatar_badge_id: null,
          wants_integrations: false
        });

      const { error: profileError } = await withTimeout(
        profilePromise, 
        TIMEOUT_CONFIG.DATABASE_QUERIES,
        'profile creation'
      );

      if (profileError) {
        authLogger.error('Profile creation failed', profileError);
        throw profileError;
      }
      authLogger.info('Profile created successfully');

      // 2. Create wealth data
      authLogger.debug('Creating wealth data...');
      const wealthPromise = supabase
        .from('wealth_data')
        .insert({
          user_id: userId,
          salary: 0,
          savings: 0,
          investments: 0,
          currency: 'USD',
          total: 0
        });

      const { error: wealthError } = await withTimeout(
        wealthPromise, 
        TIMEOUT_CONFIG.DATABASE_QUERIES,
        'wealth data creation'
      );

      if (wealthError) {
        authLogger.error('Wealth data creation failed', wealthError);
        throw wealthError;
      }
      authLogger.info('Wealth data created successfully');

      // 3. Create knowledge data
      authLogger.debug('Creating knowledge data...');
      const knowledgePromise = supabase
        .from('knowledge_data')
        .insert({
          user_id: userId,
          education: '',
          certificates: [],
          languages: [],
          total_score: 0
        });

      const { error: knowledgeError } = await withTimeout(
        knowledgePromise, 
        TIMEOUT_CONFIG.DATABASE_QUERIES,
        'knowledge data creation'
      );

      if (knowledgeError) {
        authLogger.error('Knowledge data creation failed', knowledgeError);
        throw knowledgeError;
      }
      authLogger.info('Knowledge data created successfully');

      // 4. Create starter badges
      authLogger.debug('Creating starter badges...');
      const starterBadges = [
        { user_id: userId, badge_id: 'welcome-aboard' },
        { user_id: userId, badge_id: 'profile-complete' }
      ];

      const badgesPromise = supabase
        .from('user_badges')
        .insert(starterBadges);

      const { error: badgesError } = await withTimeout(
        badgesPromise, 
        TIMEOUT_CONFIG.DATABASE_QUERIES,
        'starter badges creation'
      );

      if (badgesError) {
        authLogger.error('Starter badges creation failed', badgesError);
        throw badgesError;
      }
      authLogger.info('Starter badges created successfully');

      authLogger.info('User data initialization complete');
      return true;
    } catch (error) {
      authLogger.error('User data initialization failed', error);
      throw error;
    }
  };

  // Enhanced user data loading with better error handling
  const loadUserData = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      authLogger.info('Loading user data', { userId: supabaseUser.id });
      
      // Get profile with enhanced error handling
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle(); // Use maybeSingle to handle missing profiles gracefully

      const { data: profile, error: profileError } = await withTimeout(
        profilePromise, 
        TIMEOUT_CONFIG.DATABASE_QUERIES,
        'profile query'
      );

      if (profileError) {
        authLogger.error('Profile query failed', profileError);
        throw profileError;
      }

      if (!profile) {
        authLogger.warn('Profile not found, creating default user for onboarding');
        return {
          id: supabaseUser.id,
          name: '',
          email: supabaseUser.email || '',
          avatar: undefined,
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

      // Load related data in parallel for better performance
      const [wealthResult, knowledgeResult, assetsResult, badgesResult, friendsResult] = await Promise.allSettled([
        withTimeout(
          supabase.from('wealth_data').select('*').eq('user_id', supabaseUser.id).limit(1).maybeSingle(),
          TIMEOUT_CONFIG.DATABASE_QUERIES,
          'wealth data query'
        ),
        withTimeout(
          supabase.from('knowledge_data').select('*').eq('user_id', supabaseUser.id).limit(1).maybeSingle(),
          TIMEOUT_CONFIG.DATABASE_QUERIES,
          'knowledge data query'
        ),
        withTimeout(
          supabase.from('assets').select('*').eq('user_id', supabaseUser.id),
          TIMEOUT_CONFIG.DATABASE_QUERIES,
          'assets query'
        ),
        withTimeout(
          supabase.from('user_badges').select('*').eq('user_id', supabaseUser.id),
          TIMEOUT_CONFIG.DATABASE_QUERIES,
          'badges query'
        ),
        withTimeout(
          supabase.from('friendships').select('friend_id').eq('user_id', supabaseUser.id).eq('status', 'accepted'),
          TIMEOUT_CONFIG.DATABASE_QUERIES,
          'friends query'
        )
      ]);

      // Extract data from settled promises
      const wealthData = wealthResult.status === 'fulfilled' ? wealthResult.value.data : null;
      const knowledgeData = knowledgeResult.status === 'fulfilled' ? knowledgeResult.value.data : null;
      const assets = assetsResult.status === 'fulfilled' ? assetsResult.value.data : [];
      const userBadges = badgesResult.status === 'fulfilled' ? badgesResult.value.data : [];
      const friendships = friendsResult.status === 'fulfilled' ? friendsResult.value.data : [];

      // Log any failed queries
      [wealthResult, knowledgeResult, assetsResult, badgesResult, friendsResult].forEach((result, index) => {
        if (result.status === 'rejected') {
          const queryNames = ['wealth', 'knowledge', 'assets', 'badges', 'friends'];
          authLogger.warn(`${queryNames[index]} query failed`, result.reason);
        }
      });

      // Convert to User type
      const userData: User = {
        id: profile.id,
        name: profile.name || '',
        email: supabaseUser.email || '',
        avatar: profile.avatar_url,
        age: profile.age,
        gender: profile.gender,
        country: profile.country || '',
        city: profile.city || '',
        lifeScore: profile.life_score || 0,
        wealth: wealthData ? {
          id: wealthData.id,
          salary: wealthData.salary || 0,
          savings: wealthData.savings || 0,
          investments: wealthData.investments || 0,
          currency: wealthData.currency || 'USD',
          total: wealthData.total || 0
        } : {
          salary: 0,
          savings: 0,
          investments: 0,
          currency: 'USD',
          total: 0
        },
        knowledge: knowledgeData ? {
          id: knowledgeData.id,
          education: knowledgeData.education || '',
          certificates: knowledgeData.certificates || [],
          languages: knowledgeData.languages || [],
          total: knowledgeData.total_score || 0
        } : {
          education: '',
          certificates: [],
          languages: [],
          total: 0
        },
        assets: assets?.map(asset => ({
          id: asset.id,
          type: asset.type,
          name: asset.name,
          value: asset.value,
          verified: asset.verified
        })) || [],
        badges: userBadges?.map(ub => {
          const badge = ALL_BADGES.find(b => b.id === ub.badge_id);
          return badge ? {
            ...badge,
            unlockedAt: new Date(ub.unlocked_at)
          } : null;
        }).filter(Boolean) || [],
        friends: friendships?.map(f => f.friend_id) || [],
        createdAt: new Date(profile.created_at),
        lastActive: new Date(),
        avatarBadge: profile.avatar_badge_id ? ALL_BADGES.find(b => b.id === profile.avatar_badge_id) : undefined,
        wantsIntegrations: profile.wants_integrations || false,
        role: 'user'
      };

      authLogger.info('User data loaded successfully', { userName: userData.name });
      return userData;
    } catch (error) {
      authLogger.error('Error loading user data', error);
      return null;
    }
  }, [handleAuthError]);

  // Enhanced user data saving with better error handling and fixed circular reference issue
  const saveUserData = async (userData: User) => {
    try {
      authLogger.info('Saving user data', { userName: userData.name });
      
      const safeInt = (value: any): number => {
        if (value === null || value === undefined || value === '') return 0;
        const parsed = parseInt(String(value), 10);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Update profile with only the columns that exist in the profiles table
      // This prevents circular reference errors by excluding complex objects
      const profilePromise = supabase
        .from('profiles')
        .upsert({
          id: userData.id,
          name: userData.name?.trim() || '',
          avatar_url: userData.avatar || null,
          age: userData.age ? safeInt(userData.age) : null,
          gender: userData.gender || null,
          country: userData.country || '',
          city: userData.city || '',
          life_score: safeInt(userData.lifeScore),
          avatar_badge_id: userData.avatarBadge?.id || null,
          wants_integrations: userData.wantsIntegrations || false
        });

      const { error: profileError } = await withTimeout(
        profilePromise, 
        TIMEOUT_CONFIG.DATABASE_QUERIES,
        'profile update'
      );

      if (profileError) {
        authLogger.error('Profile update failed', profileError);
        throw profileError;
      }

      // Update wealth data if present
      if (userData.wealth) {
        const wealthPromise = supabase
          .from('wealth_data')
          .upsert({
            id: userData.wealth.id,
            user_id: userData.id,
            salary: safeInt(userData.wealth.salary),
            savings: safeInt(userData.wealth.savings),
            investments: safeInt(userData.wealth.investments),
            currency: userData.wealth.currency || 'USD',
            total: safeInt(userData.wealth.total)
          });

        const { error: wealthError } = await withTimeout(
          wealthPromise, 
          TIMEOUT_CONFIG.DATABASE_QUERIES,
          'wealth data update'
        );

        if (wealthError) {
          authLogger.error('Wealth update failed', wealthError);
          throw wealthError;
        }
      }

      // Update knowledge data if present
      if (userData.knowledge) {
        const knowledgePromise = supabase
          .from('knowledge_data')
          .upsert({
            id: userData.knowledge.id,
            user_id: userData.id,
            education: userData.knowledge.education || '',
            certificates: userData.knowledge.certificates || [],
            languages: userData.knowledge.languages || [],
            total_score: safeInt(userData.knowledge.total)
          });

        const { error: knowledgeError } = await withTimeout(
          knowledgePromise, 
          TIMEOUT_CONFIG.DATABASE_QUERIES,
          'knowledge data update'
        );

        if (knowledgeError) {
          authLogger.error('Knowledge update failed', knowledgeError);
          throw knowledgeError;
        }
      }

      // Update assets if present
      if (userData.assets && userData.assets.length > 0) {
        // Delete existing assets first
        const deleteAssetsPromise = supabase
          .from('assets')
          .delete()
          .eq('user_id', userData.id);

        await withTimeout(
          deleteAssetsPromise, 
          TIMEOUT_CONFIG.DATABASE_QUERIES,
          'assets deletion'
        );

        // Insert new assets
        const insertAssetsPromise = supabase
          .from('assets')
          .insert(userData.assets.map(asset => ({
            id: asset.id,
            user_id: userData.id,
            type: asset.type,
            name: asset.name,
            value: safeInt(asset.value),
            verified: asset.verified || false
          })));

        const { error: assetsError } = await withTimeout(
          insertAssetsPromise, 
          TIMEOUT_CONFIG.DATABASE_QUERIES,
          'assets insertion'
        );

        if (assetsError) {
          authLogger.error('Assets update failed', assetsError);
          throw assetsError;
        }
      }

      // Update badges if present
      if (userData.badges && userData.badges.length > 0) {
        const existingBadgesPromise = supabase
          .from('user_badges')
          .select('badge_id')
          .eq('user_id', userData.id);

        const { data: existingBadges } = await withTimeout(
          existingBadgesPromise, 
          TIMEOUT_CONFIG.DATABASE_QUERIES,
          'existing badges query'
        );

        const existingBadgeIds = existingBadges?.map(b => b.badge_id) || [];
        const newBadges = userData.badges.filter(b => !existingBadgeIds.includes(b.id));

        if (newBadges.length > 0) {
          authLogger.info('Inserting new badges', { badges: newBadges.map(b => b.name) });
          const insertBadgesPromise = supabase
            .from('user_badges')
            .insert(newBadges.map(badge => ({
              user_id: userData.id,
              badge_id: badge.id,
              unlocked_at: badge.unlockedAt?.toISOString() || new Date().toISOString()
            })));

          const { error: badgesError } = await withTimeout(
            insertBadgesPromise, 
            TIMEOUT_CONFIG.DATABASE_QUERIES,
            'badges insertion'
          );

          if (badgesError) {
            authLogger.error('Badges update failed', badgesError);
            throw badgesError;
          }
        }
      }

      authLogger.info('User data saved successfully');
      return true;
    } catch (error) {
      authLogger.error('Error saving user data', error);
      throw error;
    }
  };

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
      
      const logoutPromise = supabase.auth.signOut();
      const { error } = await withTimeout(
        logoutPromise, 
        TIMEOUT_CONFIG.AUTH_OPERATIONS,
        'logout'
      );
      
      if (error && !error.message.includes('Session from session_id claim in JWT does not exist')) {
        authLogger.error('Logout failed', error);
      }
      
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
  }, [handleAuthError]);

  // Initialize auth with enhanced error handling
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        authLogger.info('Initializing authentication...');

        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await withTimeout(
          sessionPromise, 
          TIMEOUT_CONFIG.SESSION_CHECK,
          'initial session check'
        );
        
        if (error) {
          handleAuthError(error, 'Initial session check');
          if (isMounted) {
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (session?.user && isMounted) {
          authLogger.info('Found existing session', { userId: session.user.id });
          const userData = await loadUserData(session.user);
          
          if (userData && isMounted) {
            setUser(userData);
            setIsAuthenticated(true);
            authLogger.info('User authenticated successfully');
          }
        } else {
          authLogger.info('No existing session found');
        }
      } catch (error) {
        handleAuthError(error, 'Authentication initialization');
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with enhanced error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      authLogger.info('Auth state changed', { event });
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          authLogger.info('User signed in', { userId: session.user.id });
          const userData = await loadUserData(session.user);
          
          if (userData && isMounted) {
            setUser(userData);
            setIsAuthenticated(true);
            clearError();
          }
        } else if (event === 'SIGNED_OUT') {
          authLogger.info('User signed out');
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
            setNewlyUnlockedBadges([]);
            clearError();
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          authLogger.info('Token refreshed', { userId: session.user.id });
          const userData = await loadUserData(session.user);
          if (userData && isMounted) {
            setUser(userData);
            setIsAuthenticated(true);
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
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData, handleAuthError, logout]);

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
      
      // Admin login - handle this first before attempting Supabase auth
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

      // Regular user login with enhanced timeout and error handling
      const loginPromise = supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      const { data, error } = await withTimeout(
        loginPromise, 
        TIMEOUT_CONFIG.AUTH_OPERATIONS,
        'user login'
      );

      if (error) {
        throw error;
      }

      if (data.user) {
        authLogger.info('Login successful', { userId: data.user.id });
        setLoading(false);
        return;
      }

      setLoading(false);
      throw new Error('Login failed - no user returned');
    } catch (error) {
      const authError = handleAuthError(error, 'Login');
      setLoading(false);
      throw authError;
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
      
      // Step 1: Create auth user with enhanced timeout
      const signupPromise = supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password
      });

      const { data, error } = await withTimeout(
        signupPromise, 
        TIMEOUT_CONFIG.AUTH_OPERATIONS,
        'user signup'
      );

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Signup failed - no user returned');
      }

      authLogger.info('Auth user created', { userId: data.user.id });

      // Step 2: Wait for session to be established
      authLogger.debug('Waiting for session...');
      const sessionUser = await waitForSession();
      
      if (!sessionUser) {
        throw new Error('Failed to establish session after signup');
      }

      // Step 3: Initialize user data in database
      authLogger.debug('Initializing user data...');
      await initializeUserData(sessionUser.id, name.trim(), email.trim().toLowerCase());

      // Step 4: Load complete user data
      authLogger.debug('Loading complete user data...');
      const userData = await loadUserData(sessionUser);
      
      if (!userData) {
        throw new Error('Failed to load user data after signup');
      }

      // Step 5: Set up badges for celebration
      authLogger.debug('Setting up badge celebration...');
      const defaultBadges = getDefaultBadgesForNewUser(userData);
      
      if (defaultBadges.length > 0) {
        authLogger.info('Setting newly unlocked badges for display', { badges: defaultBadges.map(b => b.name) });
        setNewlyUnlockedBadges(defaultBadges);
        userData.badges = [...userData.badges, ...defaultBadges];
      }

      // Step 6: Set user state
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      
      authLogger.info('Signup completed successfully');
      return;
    } catch (error) {
      const authError = handleAuthError(error, 'Signup');
      setLoading(false);
      throw authError;
    }
  }, [handleAuthError]);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    if (!user) {
      authLogger.error('No user to update');
      return;
    }

    try {
      authLogger.debug('Updating user', userData);
      
      // Create a clean copy of the previous user without circular references
      const previousUser = JSON.parse(JSON.stringify(user, (key, value) => {
        // Filter out any potential circular references or non-serializable objects
        if (typeof value === 'object' && value !== null) {
          if (value.constructor === Window || value.constructor === Document) {
            return undefined;
          }
        }
        return value;
      }));
      
      const updatedUser = { ...user, ...userData };
      const userWithScore = updateUserLifeScore(updatedUser);
      
      authLogger.debug('Checking for badge unlocks...');
      const newBadges = checkBadgeUnlocks(userWithScore, previousUser);
      
      if (newBadges.length > 0) {
        authLogger.info('New badges unlocked', { badges: newBadges.map(b => b.name) });
        userWithScore.badges = [...(userWithScore.badges || []), ...newBadges];
      }
      
      setUser(userWithScore);
      
      // Don't try to save admin user data to Supabase
      if (isAdmin) {
        authLogger.info('Admin user - skipping database save');
        if (newBadges.length > 0) {
          authLogger.info('Setting newly unlocked badges for display', { badges: newBadges.map(b => b.name) });
          setNewlyUnlockedBadges(newBadges);
          toast.success(`🎉 ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''} unlocked!`);
        }
        return;
      }
      
      try {
        await saveUserData(userWithScore);
        authLogger.info('User data saved successfully');
        
        if (newBadges.length > 0) {
          authLogger.info('Setting newly unlocked badges for display', { badges: newBadges.map(b => b.name) });
          setNewlyUnlockedBadges(newBadges);
          toast.success(`🎉 ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''} unlocked!`);
        }
      } catch (error) {
        handleAuthError(error, 'User data save');
        setUser(previousUser);
        toast.error('Failed to update profile');
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

export { AuthContext };