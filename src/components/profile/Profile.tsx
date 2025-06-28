import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Edit, 
  Camera, 
  MapPin, 
  Calendar, 
  DollarSign, 
  GraduationCap,
  Home,
  Plus,
  Trash2,
  Save,
  X,
  Upload,
  Award,
  Star,
  Globe,
  Users,
  Puzzle,
  Lock,
  ExternalLink
} from 'lucide-react';
import { User as UserType } from '../../types';
import { formatCurrency, formatNumber, triggerAchievementConfetti } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import Card from '../common/Card';
import Button from '../common/Button';
import AddAssetModal from '../modals/AddAssetModal';
import UpdateWealthModal from '../modals/UpdateWealthModal';
import AddCertificateModal from '../modals/AddCertificateModal';
import IntegrationsModal from '../modals/IntegrationsModal';
import Friends from '../friends/Friends';
import toast from 'react-hot-toast';

interface ProfileProps {
  user: UserType;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');
  const [editData, setEditData] = useState({
    name: user?.name || '',
    city: user?.city || '',
    country: user?.country || '',
    age: user?.age || '',
    gender: user?.gender || '',
    isRealNameVisible: user?.isRealNameVisible || false,
  });

  // Ensure user exists
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-xl text-white mb-2">Loading profile...</div>
          <div className="text-gray-400">Please wait</div>
        </div>
      </div>
    );
  }

  const completionPercentage = () => {
    let completed = 0;
    let total = 8;

    if (user.name) completed++;
    if (user.city) completed++;
    if (user.country) completed++;
    if (user.wealth?.total) completed++;
    if (user.knowledge?.education) completed++;
    if (user.assets?.length) completed++;
    if (user.knowledge?.languages?.length) completed++;
    if (user.knowledge?.certificates?.length) completed++;

    return Math.round((completed / total) * 100);
  };

  const handleSave = () => {
    updateUser(editData);
    setIsEditing(false);
    toast.success('Profile updated successfully! 🎉');
    triggerAchievementConfetti();
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      city: user?.city || '',
      country: user?.country || '',
      age: user?.age || '',
      gender: user?.gender || '',
      isRealNameVisible: user?.isRealNameVisible || false,
    });
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a server
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file);
      updateUser({ avatar: imageUrl });
      toast.success('Profile picture updated! 📸');
    }
  };

  const handleAddAsset = (asset: any) => {
    const updatedAssets = [...(user.assets || []), asset];
    updateUser({ assets: updatedAssets });
    toast.success(`Added ${asset.name} to your assets! +${Math.floor(asset.value / 50)} XP`);
  };

  const handleUpdateWealth = (wealthData: any) => {
    updateUser({ wealth: wealthData });
    toast.success('Wealth updated successfully! Your ranking is being recalculated.');
  };

  const handleAddCertificates = (certificates: string[]) => {
    const currentKnowledge = user.knowledge || { education: '', certificates: [], languages: [], total: 0 };
    const updatedKnowledge = {
      ...currentKnowledge,
      certificates,
      total: currentKnowledge.total + (certificates.length - currentKnowledge.certificates.length) * 1000
    };
    updateUser({ knowledge: updatedKnowledge });
    toast.success(`Added ${certificates.length - currentKnowledge.certificates.length} certificates! +${(certificates.length - currentKnowledge.certificates.length) * 1000} XP`);
  };

  const handleRemoveAsset = (assetId: string) => {
    const updatedAssets = (user.assets || []).filter(asset => asset.id !== assetId);
    updateUser({ assets: updatedAssets });
    toast.success('Asset removed successfully!');
  };

  const handleRemoveLanguage = (language: string) => {
    const currentKnowledge = user.knowledge || { education: '', certificates: [], languages: [], total: 0 };
    const updatedLanguages = currentKnowledge.languages.filter(lang => lang !== language);
    const updatedKnowledge = {
      ...currentKnowledge,
      languages: updatedLanguages,
      total: Math.max(0, currentKnowledge.total - 50) // Remove 50 XP per language
    };
    updateUser({ knowledge: updatedKnowledge });
    toast.success('Language removed successfully!');
  };

  const handleAddLanguage = () => {
    if (newLanguage && newLanguage.trim()) {
      const currentKnowledge = user.knowledge || { education: '', certificates: [], languages: [], total: 0 };
      if (!currentKnowledge.languages.includes(newLanguage.trim())) {
        const updatedKnowledge = {
          ...currentKnowledge,
          languages: [...currentKnowledge.languages, newLanguage.trim()],
          total: currentKnowledge.total + 50 // Add 50 XP per language
        };
        updateUser({ knowledge: updatedKnowledge });
        toast.success(`Added ${newLanguage}! +50 XP`);
        setNewLanguage('');
        setShowAddLanguageModal(false);
      } else {
        toast.error('Language already added!');
      }
    }
  };

  const handleNotifyMeIntegrations = () => {
    updateUser({ wantsIntegrations: true });
    setShowIntegrationsModal(false);
  };

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
    'Australia', 'Japan', 'Singapore', 'Brazil', 'India', 'China', 'Spain',
    'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'South Korea',
    'Georgia', 'Other'
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'friends', label: 'Friends', icon: Users }
  ];

  // Integration apps data
  const integrationApps = [
    {
      id: 'duolingo',
      name: 'Duolingo',
      emoji: '🦉',
      description: 'Language learning progress',
      xpBonus: '+50 XP per lesson',
      color: 'from-green-500/20 to-emerald-500/20 border-green-400/40'
    },
    {
      id: 'chess',
      name: 'Chess.com',
      emoji: '♟️',
      description: 'Chess rating and tournaments',
      xpBonus: '+100 XP per win',
      color: 'from-amber-500/20 to-yellow-500/20 border-amber-400/40'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      emoji: '📸',
      description: 'Social engagement and lifestyle',
      xpBonus: '+25 XP per post',
      color: 'from-pink-500/20 to-purple-500/20 border-pink-400/40'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      emoji: '🎵',
      description: 'Creative content and followers',
      xpBonus: '+75 XP per viral video',
      color: 'from-red-500/20 to-pink-500/20 border-red-400/40'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      emoji: '🐦',
      description: 'Professional network and influence',
      xpBonus: '+10 XP per engagement',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-400/40'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      emoji: '📘',
      description: 'Social network and community',
      xpBonus: '+20 XP per connection',
      color: 'from-indigo-500/20 to-blue-500/20 border-indigo-400/40'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            👤 Profile
          </h1>
          <p className="text-gray-300 mt-2">Manage your personal information and connections</p>
        </div>
        {activeTab === 'profile' && (
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <Button onClick={handleSave} icon={Save} className="bg-green-600 hover:bg-green-700">
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="secondary" icon={X}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} icon={Edit}>
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <>
          {/* Profile Header */}
          <Card className="p-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                
                {/* Avatar Badge */}
                {user.avatarBadge && (
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border-4 border-gray-700 shadow-lg">
                    <span className="text-lg">{user.avatarBadge.icon}</span>
                  </div>
                )}
                
                <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 p-2 rounded-full text-white transition-colors cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="text-3xl font-bold bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white w-full"
                      placeholder="Full Name"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={editData.city}
                        onChange={(e) => setEditData({...editData, city: e.target.value})}
                        placeholder="City"
                        className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                      <select
                        value={editData.country}
                        onChange={(e) => setEditData({...editData, country: e.target.value})}
                        className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="">Select Country</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={editData.age}
                        onChange={(e) => setEditData({...editData, age: e.target.value})}
                        placeholder="Age"
                        className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                      <select
                        value={editData.gender}
                        onChange={(e) => setEditData({...editData, gender: e.target.value})}
                        className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                    
                    {/* Name Visibility Toggle */}
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Show my real name publicly</h4>
                          <p className="text-gray-400 text-sm">
                            When enabled, other users will see your real name instead of your username
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editData.isRealNameVisible}
                            onChange={(e) => setEditData({...editData, isRealNameVisible: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
                    <div className="flex items-center justify-center md:justify-start text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      {user.city}, {user.country}
                    </div>
                    {user.age && (
                      <div className="text-gray-300 mb-2">
                        Age: {user.age} • {user.gender && <span className="capitalize">{user.gender}</span>}
                      </div>
                    )}
                    <div className="flex items-center justify-center md:justify-start text-gray-300 mb-6">
                      <Calendar className="w-4 h-4 mr-2" />
                      Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-4xl font-bold text-blue-400 mb-2">
                        {formatNumber(user.lifeScore || 0)} XP
                      </div>
                      <div className="text-gray-300">LifeScore</div>
                    </div>
                    
                    {/* Username Display */}
                    <div className="mt-3 text-center md:text-left">
                      <div className="text-sm text-gray-400">
                        Username: <span className="text-gray-300">@{user.username}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {user.isRealNameVisible ? 
                          'Your real name is visible to others' : 
                          'Only your username is visible to others'}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Completion */}
              <div className="text-center">
                <div className="relative w-24 h-24 mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage() / 100)}`}
                      className="text-green-400"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{completionPercentage()}%</span>
                  </div>
                </div>
                <div className="text-gray-300 text-sm">Profile Complete</div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wealth */}
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-400/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Wealth</h3>
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Salary</span>
                  <span className="text-white">{formatCurrency(user.wealth?.salary || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Savings</span>
                  <span className="text-white">{formatCurrency(user.wealth?.savings || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Investments</span>
                  <span className="text-white">{formatCurrency(user.wealth?.investments || 0)}</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-semibold">Total</span>
                    <span className="text-green-400 font-bold">{formatCurrency(user.wealth?.total || 0)}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-4 bg-green-500/20 hover:bg-green-500/30 text-green-400" 
                icon={Edit}
                onClick={() => setActiveModal('updateWealth')}
              >
                Update Wealth
              </Button>
            </Card>

            {/* Knowledge */}
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-400/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Knowledge</h3>
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Education</span>
                  <div className="text-white capitalize">{user.knowledge?.education || 'Not specified'}</div>
                </div>
                <div>
                  <span className="text-gray-400">Languages</span>
                  <div className="text-white">{(user.knowledge?.languages || []).length} languages</div>
                </div>
                <div>
                  <span className="text-gray-400">Certificates</span>
                  <div className="text-white">{(user.knowledge?.certificates || []).length} certificates</div>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-semibold">Score</span>
                    <span className="text-blue-400 font-bold">{user.knowledge?.total || 0} pts</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400" 
                icon={Edit}
                onClick={() => setActiveModal('addCertificate')}
              >
                Add Certificates
              </Button>
            </Card>

            {/* Assets */}
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Assets</h3>
                <Home className="w-6 h-6 text-purple-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Items</span>
                  <span className="text-white">{(user.assets || []).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Value</span>
                  <span className="text-purple-400 font-bold">
                    {formatCurrency((user.assets || []).reduce((sum, asset) => sum + asset.value, 0))}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {(user.assets || []).slice(0, 3).map((asset) => (
                  <div key={asset.id} className="flex justify-between text-sm">
                    <span className="text-gray-400 truncate">{asset.name}</span>
                    <span className="text-white">{formatCurrency(asset.value)}</span>
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400" 
                icon={Plus}
                onClick={() => setActiveModal('addAsset')}
              >
                Add Asset
              </Button>
            </Card>
          </div>

          {/* Integrations Section */}
          <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-400/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Puzzle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    🧩 Integrations
                    <span className="ml-3 px-3 py-1 bg-yellow-500/20 border border-yellow-400/40 rounded-full text-yellow-300 text-sm font-semibold">
                      Coming Soon
                    </span>
                  </h3>
                  <p className="text-gray-400 text-sm">Connect your favorite apps to earn extra XP automatically</p>
                </div>
              </div>
            </div>

            {/* Integration Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {integrationApps.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl bg-gradient-to-br ${app.color} border-2 relative overflow-hidden opacity-60 hover:opacity-70 transition-opacity`}
                >
                  {/* Coming Soon Badge */}
                  <div className="absolute top-2 right-2 bg-gray-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    Soon
                  </div>

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full transition-transform duration-1000" />
                  
                  <div className="relative">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-xl">{app.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm">{app.name}</h4>
                        <p className="text-gray-300 text-xs">{app.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-green-400 font-semibold">
                        {app.xpBonus}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Simple info text without notification option */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Integrations will be available in a future update. Connect your favorite apps to automatically earn XP and unlock special badges.
              </p>
            </div>
          </Card>

          {/* Detailed Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Languages */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Globe className="w-5 h-5 text-blue-400 mr-2" />
                  Languages
                </h3>
                <Button variant="ghost" size="sm" icon={Plus} onClick={() => setShowAddLanguageModal(true)}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(user.knowledge?.languages || []).map((language, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-900/20 border border-blue-500/30 rounded-full text-blue-300 text-sm"
                  >
                    {language}
                    <button 
                      onClick={() => handleRemoveLanguage(language)}
                      className="ml-2 text-blue-400 hover:text-blue-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(user.knowledge?.languages || []).length === 0 && (
                  <span className="text-gray-400 text-sm">No languages added yet</span>
                )}
              </div>
            </Card>

            {/* Certificates */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Award className="w-5 h-5 text-yellow-400 mr-2" />
                  Certificates
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={Plus}
                  onClick={() => setActiveModal('addCertificate')}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {(user.knowledge?.certificates || []).map((cert, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-white">{cert}</span>
                    </div>
                  </div>
                ))}
                {(user.knowledge?.certificates || []).length === 0 && (
                  <div className="text-gray-400 text-sm text-center py-4">
                    No certificates added yet
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Assets List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Home className="w-6 h-6 text-purple-400 mr-2" />
                My Assets
              </h3>
              <Button 
                icon={Plus}
                onClick={() => setActiveModal('addAsset')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add Asset
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(user.assets || []).map((asset) => (
                <div key={asset.id} className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{asset.name}</h4>
                    <button
                      onClick={() => handleRemoveAsset(asset.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm capitalize mb-2">{asset.type}</p>
                  <p className="text-green-400 font-semibold">
                    {formatCurrency(asset.value)}
                  </p>
                </div>
              ))}
              {(user.assets || []).length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-8">
                  <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No assets added yet</p>
                  <p className="text-sm">Add your first asset to boost your LifeScore!</p>
                </div>
              )}
            </div>
          </Card>

          {/* Modals */}
          <AddAssetModal
            isOpen={activeModal === 'addAsset'}
            onClose={() => setActiveModal(null)}
            onAdd={handleAddAsset}
          />

          <UpdateWealthModal
            isOpen={activeModal === 'updateWealth'}
            onClose={() => setActiveModal(null)}
            onUpdate={handleUpdateWealth}
            currentWealth={user.wealth}
          />

          <AddCertificateModal
            isOpen={activeModal === 'addCertificate'}
            onClose={() => setActiveModal(null)}
            onAdd={handleAddCertificates}
            currentCertificates={user.knowledge?.certificates}
          />

          <IntegrationsModal
            isOpen={showIntegrationsModal}
            onClose={() => setShowIntegrationsModal(false)}
            onNotifyMe={handleNotifyMeIntegrations}
            hasNotified={user.wantsIntegrations}
          />

          {/* Add Language Modal */}
          {showAddLanguageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowAddLanguageModal(false)}
              />

              {/* Modal */}
              <div className="relative bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Add Language</h2>
                  <button
                    onClick={() => setShowAddLanguageModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Language Name
                    </label>
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="e.g., Spanish, French, Mandarin"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
                      autoFocus
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      variant="secondary"
                      onClick={() => setShowAddLanguageModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddLanguage}
                      className="flex-1"
                      disabled={!newLanguage.trim()}
                    >
                      Add Language
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <Friends user={user} />
      )}
    </div>
  );
};

export default Profile;