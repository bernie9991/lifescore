import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Check, X, AlertCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Button from '../common/Button';

interface UsernameStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrev: () => void;
  canGoBack: boolean;
}

const UsernameStep: React.FC<UsernameStepProps> = ({ data, onNext, onPrev, canGoBack }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { username: data.username || '' }
  });
  
  const [checking, setChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
  const [showRealNameToggle, setShowRealNameToggle] = useState(false);

  const watchedUsername = watch('username');

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    setChecking(true);
    setUsernameStatus('checking');

    try {
      const q = query(
        collection(db, 'users'),
        where('username', '==', username.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setUsernameStatus('available');
      } else {
        setUsernameStatus('taken');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameStatus(null);
    } finally {
      setChecking(false);
    }
  };

  // Check username availability when user stops typing
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedUsername && watchedUsername.length >= 3) {
        checkUsernameAvailability(watchedUsername);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedUsername]);

  const onSubmit = (formData: any) => {
    if (usernameStatus !== 'available') {
      return;
    }

    const cleanedData = {
      username: formData.username.toLowerCase().trim(),
      isRealNameVisible: formData.isRealNameVisible || false
    };

    onNext(cleanedData);
  };

  const validateUsername = (value: string) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-8 rounded-2xl border border-gray-700"
    >
      <h2 className="text-3xl font-bold text-white mb-2">Choose Your Username</h2>
      <p className="text-gray-300 mb-8">This will be how other users can find and identify you</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Username
          </label>
          <div className="relative">
            <input
              {...register('username', { 
                required: 'Username is required',
                validate: validateUsername
              })}
              type="text"
              placeholder="e.g., john_doe123"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              onChange={(e) => {
                e.target.value = e.target.value.toLowerCase();
              }}
            />
            
            {/* Status Indicator */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {checking && (
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
              {usernameStatus === 'available' && (
                <Check className="w-5 h-5 text-green-400" />
              )}
              {usernameStatus === 'taken' && (
                <X className="w-5 h-5 text-red-400" />
              )}
            </div>
          </div>
          
          {/* Status Messages */}
          {errors.username && (
            <p className="text-red-400 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.username.message as string}
            </p>
          )}
          {usernameStatus === 'available' && !errors.username && (
            <p className="text-green-400 text-sm mt-1 flex items-center">
              <Check className="w-4 h-4 mr-1" />
              Username is available!
            </p>
          )}
          {usernameStatus === 'taken' && (
            <p className="text-red-400 text-sm mt-1 flex items-center">
              <X className="w-4 h-4 mr-1" />
              Username is already taken
            </p>
          )}
          
          <p className="text-gray-400 text-xs mt-2">
            3-20 characters, letters, numbers, and underscores only
          </p>
        </div>

        {/* Privacy Settings */}
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-3">Privacy Settings</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Show my real name publicly</label>
              <p className="text-gray-400 text-sm">
                When enabled, other users will see your real name instead of your username
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                {...register('isRealNameVisible')}
                type="checkbox"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Username Preview */}
        {watchedUsername && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-2">Preview</h4>
            <p className="text-gray-300 text-sm">
              Other users will see you as: <span className="font-semibold text-white">@{watchedUsername.toLowerCase()}</span>
            </p>
          </div>
        )}

        <div className="flex justify-between pt-6">
          {canGoBack && (
            <Button variant="secondary" onClick={onPrev}>
              Back
            </Button>
          )}
          <Button 
            type="submit" 
            className={!canGoBack ? 'ml-auto' : ''}
            disabled={usernameStatus !== 'available' || checking}
          >
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default UsernameStep;