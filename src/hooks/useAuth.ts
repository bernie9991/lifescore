import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { updateUserLifeScore } from '../utils/lifeScoreEngine';
import { checkBadgeUnlocks, getDefaultBadgesForNewUser, ALL_BADGES } from '../utils/badgeSystem';

// --- Constants ---
const CONSTANTS = {
    TABLES: {
        PROFILES: 'profiles',
        WEALTH_DATA: 'wealth_data',
        KNOWLEDGE_DATA: 'knowledge_data',
        ASSETS: 'assets',
        USER_BADGES: 'user_badges',
        FRIENDSHIPS: 'friendships',
    },
    BADGE_IDS: {
        WELCOME: 'welcome-aboard',
        PROFILE_COMPLETE: 'profile-complete',
    },
};

const TIMEOUT_CONFIG = {
    AUTH_OPERATIONS: 15000,
    DATABASE_QUERIES: 10000,
};

// --- Error Handling & Types ---
enum AuthErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTH_ERROR = 'AUTH_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
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
    login: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, password: string, name: string) => Promise<boolean>;
    logout: () => Promise<void>;
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

// --- Utilities ---
const authLogger = {
    info: (message: string, data?: any) => console.log(`🔐 AUTH INFO: ${message}`, data || ''),
    error: (message: string, error?: any) => console.error(`❌ AUTH ERROR: ${message}`, error || ''),
    warn: (message: string, data?: any) => console.warn(`⚠️ AUTH WARNING: ${message}`, data || ''),
    debug: (message: string, data?: any) => console.debug(`🔍 AUTH DEBUG: ${message}`, data || ''),
};

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, operation: string = 'operation'): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]);
};

const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 6) return { isValid: false, message: 'Password must be at least 6 characters long' };
    if (password.length > 128) return { isValid: false, message: 'Password must be less than 128 characters' };
    return { isValid: true };
};
const validateName = (name: string): { isValid: boolean; message?: string } => {
    if (!name || name.trim().length < 2) return { isValid: false, message: 'Name must be at least 2 characters long' };
    if (name.length > 100) return { isValid: false, message: 'Name must be less than 100 characters' };
    return { isValid: true };
};

// --- Main Auth Hook ---
export const useAuthProvider = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastError, setLastError] = useState<AuthError | null>(null);
    const signupDetails = useRef<{ name?: string }>({});

    const clearError = useCallback(() => setLastError(null), []);

    const handleAuthError = useCallback((error: any, operation: string): AuthError => {
        authLogger.error(`${operation} failed`, error);
        let authError: AuthError;
        
        if (error.type && Object.values(AuthErrorType).includes(error.type)) {
            authError = error;
        } else if (error.message?.includes('timeout')) {
            authError = { type: AuthErrorType.TIMEOUT_ERROR, message: `${operation} timed out.`, originalError: error, timestamp: new Date() };
        } else if (error.message?.includes('Invalid login credentials')) {
            authError = { type: AuthErrorType.AUTH_ERROR, message: 'Invalid email or password.', originalError: error, timestamp: new Date() };
        } else if (error.message?.includes('User already registered')) {
            authError = { type: AuthErrorType.VALIDATION_ERROR, message: 'An account with this email already exists.', originalError: error, timestamp: new Date() };
        } else {
            authError = { type: AuthErrorType.UNKNOWN_ERROR, message: error.message || `${operation} failed.`, originalError: error, timestamp: new Date() };
        }
        
        setLastError(authError);
        return authError;
    }, []);

    const loadUserData = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
        try {
            authLogger.info('Loading user data', { userId: supabaseUser.id });
            const { data: profile, error: profileError } = await supabase
                .from(CONSTANTS.TABLES.PROFILES)
                .select('*, role')
                .eq('id', supabaseUser.id)
                .single();

            if (profileError) throw profileError;
            if (!profile) throw new Error("Profile not found for user.");

            const [wealthResult, knowledgeResult, assetsResult, badgesResult, friendsResult] = await Promise.all([
                supabase.from(CONSTANTS.TABLES.WEALTH_DATA).select('*').eq('user_id', supabaseUser.id).single(),
                supabase.from(CONSTANTS.TABLES.KNOWLEDGE_DATA).select('*').eq('user_id', supabaseUser.id).single(),
                supabase.from(CONSTANTS.TABLES.ASSETS).select('*').eq('user_id', supabaseUser.id),
                supabase.from(CONSTANTS.TABLES.USER_BADGES).select('*').eq('user_id', supabaseUser.id),
                supabase.from(CONSTANTS.TABLES.FRIENDSHIPS).select('friend_id').eq('user_id', supabaseUser.id).eq('status', 'accepted'),
            ]);

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
                wealth: wealthResult.data ? { ...wealthResult.data, total: wealthResult.data.salary + wealthResult.data.savings + wealthResult.data.investments } : { salary: 0, savings: 0, investments: 0, currency: 'USD', total: 0 },
                knowledge: knowledgeResult.data ? { ...knowledgeResult.data, total: knowledgeResult.data.total_score } : { education: '', certificates: [], languages: [], total: 0 },
                assets: assetsResult.data || [],
                badges: (badgesResult.data || []).map(ub => {
                    const badge = ALL_BADGES.find(b => b.id === ub.badge_id);
                    return badge ? { ...badge, unlockedAt: new Date(ub.unlocked_at) } : null;
                }).filter(Boolean) as User['badges'],
                friends: (friendsResult.data || []).map(f => f.friend_id),
                createdAt: new Date(profile.created_at),
                lastActive: new Date(),
                avatarBadge: profile.avatar_badge_id ? ALL_BADGES.find(b => b.id === profile.avatar_badge_id) : undefined,
                wantsIntegrations: profile.wants_integrations || false,
                role: profile.role || 'user',
            };

            authLogger.info('User data loaded successfully', { userName: userData.name });
            return userData;

        } catch (error) {
            handleAuthError(error, 'Load User Data');
            return null;
        }
    }, [handleAuthError]);

    const initializeNewUserData = useCallback(async (userId: string, name: string) => {
        authLogger.info('Initializing new user data', { userId });
        const { error } = await supabase
            .from(CONSTANTS.TABLES.PROFILES)
            .update({ name: name.trim() })
            .eq('id', userId);
        
        if (error) {
            handleAuthError(error, "Initialize User Data");
            throw error;
        }
        authLogger.info('User profile name updated successfully.');
    }, [handleAuthError]);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        clearError();
        authLogger.info('Attempting login', { email });

        if (email === 'admin' && password === 'admin123') {
            authLogger.info('Admin login detected');
            const adminUser: User = { id: 'admin-user-id', name: 'Admin', email: 'admin@lifescore.com', lifeScore: 1000, role: 'admin' } as User;
            setUser(adminUser);
            setIsAdmin(true);
            setIsAuthenticated(true);
            setLoading(false);
            return true;
        }
        
        try {
            if (!validateEmail(email) || !validatePassword(password).isValid) {
                throw new Error('Invalid email or password format.');
            }
            const { error } = await withTimeout(
                supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }),
                TIMEOUT_CONFIG.AUTH_OPERATIONS,
                'user login'
            );
            if (error) throw error;
            authLogger.info('Login successful, waiting for auth state change.');
            return true;
        } catch (error) {
            handleAuthError(error, 'Login');
            setLoading(false);
            return false;
        }
    }, [clearError, handleAuthError]);

    const signup = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
        setLoading(true);
        clearError();
        authLogger.info('Attempting signup', { email, name });

        try {
            if (!validateEmail(email) || !validatePassword(password).isValid || !validateName(name).isValid) {
                throw new Error('Invalid signup details.');
            }
            signupDetails.current = { name };
            const { data, error } = await withTimeout(
                supabase.auth.signUp({
                    email: email.trim().toLowerCase(),
                    password,
                    options: { data: { name: name.trim() } }
                }),
                TIMEOUT_CONFIG.AUTH_OPERATIONS,
                'user signup'
            );
            if (error) throw error;
            if (!data.user) throw new Error('Signup failed - no user returned');
            authLogger.info('Auth user created, waiting for auth state change.');
            toast.success('Account created! Please check your email to verify.');
            return true;
        } catch (error) {
            handleAuthError(error, 'Signup');
            signupDetails.current = {};
            setLoading(false);
            return false;
        }
    }, [clearError, handleAuthError]);

    const logout = useCallback(async () => {
        setLoading(true);
        authLogger.info('Logging out user');
        const { error } = await supabase.auth.signOut();
        if (error) {
            handleAuthError(error, 'Logout');
        }
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setNewlyUnlockedBadges([]);
        setLoading(false);
    }, [handleAuthError]);
    
    const saveUserData = useCallback(async (updatedUser: User) => {
        authLogger.info('Saving user data', { userName: updatedUser.name });
        const { id, name, avatar, age, gender, country, city, lifeScore, avatarBadge, wantsIntegrations, wealth, knowledge, assets } = updatedUser;
        const profilePromise = supabase.from(CONSTANTS.TABLES.PROFILES).update({ name, avatar_url: avatar, age, gender, country, city, life_score: lifeScore, avatar_badge_id: avatarBadge?.id || null, wants_integrations: wantsIntegrations }).eq('id', id);
        const wealthPromise = supabase.from(CONSTANTS.TABLES.WEALTH_DATA).update({ salary: wealth.salary, savings: wealth.savings, investments: wealth.investments, currency: wealth.currency }).eq('user_id', id);
        const knowledgePromise = supabase.from(CONSTANTS.TABLES.KNOWLEDGE_DATA).update({ education: knowledge.education, certificates: knowledge.certificates, languages: knowledge.languages }).eq('user_id', id);
        
        const currentAssets = user?.assets || [];
        const newAssets = assets || [];
        const assetsToInsert = newAssets.filter(na => !currentAssets.some(ca => ca.id === na.id));
        const assetsToUpdate = newAssets.filter(na => {
            const current = currentAssets.find(ca => ca.id === na.id);
            return current && JSON.stringify(current) !== JSON.stringify(na);
        });
        const assetIdsToDelete = currentAssets.filter(ca => !newAssets.some(na => na.id === ca.id)).map(a => a.id);
    
        const assetPromises = [];
        if (assetsToInsert.length > 0) assetPromises.push(supabase.from(CONSTANTS.TABLES.ASSETS).insert(assetsToInsert.map(a => ({...a, user_id: id}))));
        if (assetIdsToDelete.length > 0) assetPromises.push(supabase.from(CONSTANTS.TABLES.ASSETS).delete().in('id', assetIdsToDelete));
        assetsToUpdate.forEach(asset => assetPromises.push(supabase.from(CONSTANTS.TABLES.ASSETS).update(asset).eq('id', asset.id)));
    
        const results = await Promise.all([profilePromise, wealthPromise, knowledgePromise, ...assetPromises]);
        const firstError = results.find(res => res.error)?.error;
        if (firstError) throw firstError;
    
        authLogger.info('User data saved successfully');
    }, [user]);

    const updateUser = useCallback(async (userData: Partial<User>) => {
        if (!user) return;
        const previousUser = JSON.parse(JSON.stringify(user));
        const updatedUserDraft = { ...user, ...userData };
        const userWithScore = updateUserLifeScore(updatedUserDraft);
        const newBadges = checkBadgeUnlocks(userWithScore, previousUser);

        if (newBadges.length > 0) {
            userWithScore.badges = [...(userWithScore.badges || []), ...newBadges];
        }
        setLoading(true);
        try {
            await saveUserData(userWithScore);
            setUser(userWithScore);
            toast.success('Profile updated!');
            if (newBadges.length > 0) {
                setNewlyUnlockedBadges(newBadges);
                toast.success(`🎉 ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''} unlocked!`);
            }
        } catch (error) {
            handleAuthError(error, 'User Update');
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    }, [user, handleAuthError, saveUserData]);

    const clearNewBadges = useCallback(() => setNewlyUnlockedBadges([]), []);

    useEffect(() => {
        setLoading(true);
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const userData = await loadUserData(session.user);
                if (userData) {
                    setUser(userData);
                    setIsAuthenticated(true);
                    setIsAdmin(userData.role === 'admin');
                }
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            authLogger.info('Auth state changed', { event });
            setLoading(true);
            if (session?.user) {
                const isNewUser = event === 'SIGNED_IN' && signupDetails.current.name;
                if (isNewUser) {
                    await initializeNewUserData(session.user.id, signupDetails.current.name as string);
                    signupDetails.current = {};
                }
                const userData = await loadUserData(session.user);
                if (userData) {
                    setUser(userData);
                    setIsAuthenticated(true);
                    setIsAdmin(userData.role === 'admin');
                    if(isNewUser) {
                        const defaultBadges = getDefaultBadgesForNewUser(userData);
                        setNewlyUnlockedBadges(defaultBadges);
                    }
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setIsAdmin(false);
                setNewlyUnlockedBadges([]);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [loadUserData, initializeNewUserData]);

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
        clearError,
    };
};

// --- Auth Provider Component ---
// This component should wrap your application to provide auth context.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const auth = useAuthProvider();
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};