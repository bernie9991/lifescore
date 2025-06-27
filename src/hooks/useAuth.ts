import { useState, useEffect, createContext, useContext } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { ALL_BADGES } from '../utils/badgeSystem';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  authInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  newlyUnlockedBadges: any[];
  clearNewBadges: () => void;
  loading: boolean;
  error: string | null;
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

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

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
      { id: '1', type: 'home', name: 'Admin House', value: 500000, verified: true },
      { id: '2', type: 'car', name: 'Admin Car', value: 50000, verified: true }
    ],
    badges: ALL_BADGES.slice(0, 5).map(badge => ({
      ...badge,
      unlockedAt: new Date()
    })),
    friends: [],
    createdAt: new Date(),
    lastActive: new Date(),
    avatarBadge: ALL_BADGES[0],
    wantsIntegrations: false
  });

  // Load user data from Supabase
  const loadUserData = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('🔍 Loading user data for:', supabaseUser.id);
      
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('Profile query error:', profileError);
        throw profileError;
      }

      if (!profile) {
        console.log('No profile found, user needs onboarding');
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
          wantsIntegrations: false
        };
      }

      // Load related data in parallel
      const [wealthResult, knowledgeResult, assetsResult, badgesResult] = await Promise.allSettled([
        supabase.from('wealth_data').select('*').eq('user_id', supabaseUser.id).single(),
        supabase.from('knowledge_data').select('*').eq('user_id', supabaseUser.id).single(),
        supabase.from('assets').select('*').eq('user_id', supabaseUser.id),
        supabase.from('user_badges').select('*').eq('user_id', supabaseUser.id)
      ]);

      const wealthData = wealthResult.status === 'fulfilled' ? wealthResult.value.data : null;
      const knowledgeData = knowledgeResult.status === 'fulfilled' ? knowledgeResult.value.data : null;
      const assets = assetsResult.status === 'fulfilled' ? assetsResult.value.data : [];
      const userBadges = badgesResult.status === 'fulfilled' ? badgesResult.value.data : [];

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
        friends: [],
        createdAt: new Date(profile.created_at),
        lastActive: new Date(),
        avatarBadge: profile.avatar_badge_id ? ALL_BADGES.find(b => b.id === profile.avatar_badge_id) : undefined,
        wantsIntegrations: profile.wants_integrations || false
      };

      console.log('✅ User data loaded successfully');
      return userData;
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      return null;
    }
  };

  // Initialize user data after signup
  const initializeUserData = async (userId: string, name: string, email: string) => {
    try {
      console.log('🔧 Initializing user data for:', userId);
      
      // Create profile
      const { error: profileError } = await supabase
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

      if (profileError) throw profileError;

      // Create wealth data
      const { error: wealthError } = await supabase
        .from('wealth_data')
        .insert({
          user_id: userId,
          salary: 0,
          savings: 0,
          investments: 0,
          currency: 'USD',
          total: 0
        });

      if (wealthError) throw wealthError;

      // Create knowledge data
      const { error: knowledgeError } = await supabase
        .from('knowledge_data')
        .insert({
          user_id: userId,
          education: '',
          certificates: [],
          languages: [],
          total_score: 0
        });

      if (knowledgeError) throw knowledgeError;

      console.log('✅ User data initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing user data:', error);
      throw error;
    }
  };

  // Save user data to Supabase
  const saveUserData = async (userData: User) => {
    try {
      console.log('💾 Saving user data for:', userData.name);
      
      const safeInt = (value: any): number => {
        if (value === null || value === undefined || value === '') return 0;
        const parsed = parseInt(String(value), 10);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Update profile
      const { error: profileError } = await supabase
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

      if (profileError) throw profileError;

      // Update wealth data if present
      if (userData.wealth) {
        const { error: wealthError } = await supabase
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

        if (wealthError) throw wealthError;
      }

      // Update knowledge data if present
      if (userData.knowledge) {
        const { error: knowledgeError } = await supabase
          .from('knowledge_data')
          .upsert({
            id: userData.knowledge.id,
            user_id: userData.id,
            education: userData.knowledge.education || '',
            certificates: userData.knowledge.certificates || [],
            languages: userData.knowledge.languages || [],
            total_score: safeInt(userData.knowledge.total)
          });

        if (knowledgeError) throw knowledgeError;
      }

      // Update assets if present
      if (userData.assets && userData.assets.length > 0) {
        // Delete existing assets first
        await supabase
          .from('assets')
          .delete()
          .eq('user_id', userData.id);

        // Insert new assets
        const { error: assetsError } = await supabase
          .from('assets')
          .insert(userData.assets.map(asset => ({
            id: asset.id,
            user_id: userData.id,
            type: asset.type,
            name: asset.name,
            value: safeInt(asset.value),
            verified: asset.verified || false
          })));

        if (assetsError) throw assetsError;
      }

      // Update badges if present
      if (userData.badges && userData.badges.length > 0) {
        const { data: existingBadges } = await supabase
          .from('user_badges')
          .select('badge_id')
          .eq('user_id', userData.id);

        const existingBadgeIds = existingBadges?.map(b => b.badge_id) || [];
        const newBadges = userData.badges.filter(b => !existingBadgeIds.includes(b.id));

        if (newBadges.length > 0) {
          const { error: badgesError } = await supabase
            .from('user_badges')
            .insert(newBadges.map(badge => ({
              user_id: userData.id,
              badge_id: badge.id,
              unlocked_at: badge.unlockedAt?.toISOString() || new Date().toISOString()
            })));

          if (badgesError) throw badgesError;
        }
      }

      console.log('✅ User data saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 Attempting login for:', email);
      
      // Admin login
      if (email === 'admin' && password === 'admin123') {
        console.log('👑 Admin login detected');
        const adminUser = createMockAdminUser();
        setUser(adminUser);
        setIsAdmin(true);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Regular user login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) throw error;

      if (data.user) {
        console.log('✅ Login successful');
        // User data will be loaded by the auth state change listener
      }

      setLoading(false);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Login failed');
      setLoading(false);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Attempting signup for:', email);
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Signup failed - no user returned');
      }

      console.log('✅ Auth user created:', data.user.id);

      // Initialize user data
      await initializeUserData(data.user.id, name.trim(), email.trim().toLowerCase());

      // User data will be loaded by the auth state change listener
      setLoading(false);
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      setError(error.message || 'Signup failed');
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user');
      
      // Handle admin logout
      if (isAdmin) {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setNewlyUnlockedBadges([]);
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error && !error.message.includes('Session from session_id claim in JWT does not exist')) {
        console.error('Logout error:', error);
      }
      
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setNewlyUnlockedBadges([]);
      setError(null);
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setNewlyUnlockedBadges([]);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      console.log('🔄 Updating user data');
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Don't try to save admin user data to Supabase
      if (isAdmin) {
        console.log('👑 Admin user - skipping database save');
        return;
      }
      
      await saveUserData(updatedUser);
    } catch (error: any) {
      console.error('❌ Error updating user:', error);
      toast.error('Failed to update profile');
    }
  };

  const clearNewBadges = () => {
    setNewlyUnlockedBadges([]);
  };

  // Initialize auth
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing authentication...');

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (mounted) {
            setAuthInitialized(true);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('📱 Found existing session');
          const userData = await loadUserData(session.user);
          
          if (userData && mounted) {
            setUser(userData);
            setIsAuthenticated(true);
            console.log('✅ User authenticated successfully');
          }
        } else {
          console.log('❌ No existing session found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        if (mounted) {
          setAuthInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔄 Auth state changed:', event);
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in');
          const userData = await loadUserData(session.user);
          
          if (userData && mounted) {
            setUser(userData);
            setIsAuthenticated(true);
            setError(null);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          if (mounted) {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
            setNewlyUnlockedBadges([]);
            setError(null);
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed');
          const userData = await loadUserData(session.user);
          if (userData && mounted) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
          setNewlyUnlockedBadges([]);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isAuthenticated,
    isAdmin,
    authInitialized,
    login,
    signup,
    logout,
    updateUser,
    newlyUnlockedBadges,
    clearNewBadges,
    loading,
    error,
    clearError
  };
};

export { AuthContext };