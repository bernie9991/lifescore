import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Settings, 
  BarChart3, 
  Shield, 
  Database,
  UserCheck,
  UserX,
  Crown,
  Award,
  TrendingUp,
  Globe,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Eye,
  Ban,
  CheckCircle,
  FileText,
  Target,
  Star,
  GraduationCap,
  Home,
  Car,
  Gem,
  Save,
  X
} from 'lucide-react';
import { User } from '../../types';
import { formatNumber, formatCurrency } from '../../utils/animations';
import Card from '../common/Card';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

const AdminPanel: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Mock admin data
  const adminStats = {
    totalUsers: 2847392,
    activeUsers: 1923847,
    newUsersToday: 1247,
    totalWealth: 847392847392,
    averageLifeScore: 6847,
    topCountries: [
      { name: 'United States', users: 847392, percentage: 29.8 },
      { name: 'China', users: 623847, percentage: 21.9 },
      { name: 'India', users: 456789, percentage: 16.0 },
      { name: 'Brazil', users: 234567, percentage: 8.2 },
      { name: 'United Kingdom', users: 189234, percentage: 6.6 }
    ]
  };

  // Mock onboarding questions
  const [onboardingQuestions, setOnboardingQuestions] = useState([
    {
      id: '1',
      step: 'basic-info',
      title: 'Basic Information',
      description: 'Tell us a bit about yourself',
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'age', label: 'Age', type: 'number', required: true },
        { name: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'other', 'prefer-not-to-say'], required: true },
        { name: 'country', label: 'Country', type: 'select', required: true },
        { name: 'city', label: 'City', type: 'text', required: true }
      ]
    },
    {
      id: '2',
      step: 'wealth',
      title: 'Financial Information',
      description: 'Help us understand your financial standing',
      fields: [
        { name: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'CAD'], required: true },
        { name: 'salary', label: 'Annual Salary', type: 'number', required: false },
        { name: 'savings', label: 'Savings', type: 'number', required: false },
        { name: 'investments', label: 'Investments', type: 'number', required: false }
      ]
    }
  ]);

  // Mock leaderboards
  const [leaderboards, setLeaderboards] = useState([
    {
      id: '1',
      name: 'Global LifeScore',
      description: 'Overall ranking based on combined score',
      type: 'global',
      category: 'combined',
      isActive: true,
      participants: 2847392,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Crypto Millionaires',
      description: 'Top crypto investors worldwide',
      type: 'custom',
      category: 'wealth',
      isActive: true,
      participants: 45000,
      createdAt: new Date('2024-02-15')
    }
  ]);

  // Mock challenges
  const [challenges, setChallenges] = useState([
    {
      id: '1',
      title: 'Wealth Sprint Challenge',
      description: 'Increase your net worth by $10,000 this month',
      type: 'monthly',
      category: 'wealth',
      reward: 'Wealth Warrior Badge + 2,000 XP',
      participants: 15420,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
      isActive: true,
      requirements: { target: 10000, metric: 'wealth_increase' }
    },
    {
      id: '2',
      title: 'Knowledge Quest',
      description: 'Earn 3 new certificates this week',
      type: 'weekly',
      category: 'knowledge',
      reward: 'Scholar Badge + 1,500 XP',
      participants: 8750,
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-03-17'),
      isActive: true,
      requirements: { target: 3, metric: 'certificates' }
    }
  ]);

  // Mock badges
  const [badges, setBadges] = useState([
    {
      id: '1',
      name: 'Wealth Apprentice',
      description: 'Reach $50,000 in total wealth',
      icon: '💰',
      category: 'wealth',
      rarity: 'common',
      xpReward: 500,
      requirements: { wealth: 50000 },
      isActive: true
    },
    {
      id: '2',
      name: 'Knowledge Seeker',
      description: 'Earn your first degree',
      icon: '🎓',
      category: 'knowledge',
      rarity: 'common',
      xpReward: 300,
      requirements: { education: 'bachelors' },
      isActive: true
    },
    {
      id: '3',
      name: 'Polyglot Master',
      description: 'Speak 5+ languages fluently',
      icon: '🌍',
      category: 'knowledge',
      rarity: 'legendary',
      xpReward: 2000,
      requirements: { languages: 5 },
      isActive: true
    }
  ]);

  // Mock education levels
  const [educationLevels, setEducationLevels] = useState([
    { id: '1', name: 'High School', points: 100, isActive: true },
    { id: '2', name: 'Associates Degree', points: 200, isActive: true },
    { id: '3', name: 'Bachelors Degree', points: 400, isActive: true },
    { id: '4', name: 'Masters Degree', points: 600, isActive: true },
    { id: '5', name: 'Doctorate/PhD', points: 1000, isActive: true },
    { id: '6', name: 'Trade School', points: 150, isActive: true }
  ]);

  // Mock asset types
  const [assetTypes, setAssetTypes] = useState([
    { id: '1', name: 'Home/Property', icon: '🏠', pointsPerDollar: 0.02, isActive: true },
    { id: '2', name: 'Vehicle', icon: '🚗', pointsPerDollar: 0.01, isActive: true },
    { id: '3', name: 'Jewelry/Valuables', icon: '💍', pointsPerDollar: 0.015, isActive: true },
    { id: '4', name: 'Art/Collectibles', icon: '🎨', pointsPerDollar: 0.025, isActive: true },
    { id: '5', name: 'Electronics', icon: '📱', pointsPerDollar: 0.005, isActive: true }
  ]);

  // Mock user data for admin management
  const mockUsers: (User & { status: 'active' | 'suspended' | 'pending'; lastLogin: Date })[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      country: 'Singapore',
      city: 'Singapore',
      lifeScore: 12500,
      wealth: { salary: 150000, savings: 80000, investments: 120000, currency: 'USD', total: 350000 },
      knowledge: { education: 'Masters', certificates: ['AWS', 'PMP'], languages: ['English', 'Mandarin'], total: 2800 },
      assets: [{ id: '1', type: 'home', name: 'Condo', value: 800000 }],
      badges: [],
      friends: ['2', '3'],
      createdAt: new Date('2024-01-15'),
      lastActive: new Date(),
      status: 'active',
      lastLogin: new Date('2024-03-10T14:30:00')
    },
    {
      id: '2',
      name: 'Marcus Williams',
      email: 'marcus.w@example.com',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      country: 'Canada',
      city: 'Toronto',
      lifeScore: 11200,
      wealth: { salary: 120000, savings: 60000, investments: 80000, currency: 'CAD', total: 260000 },
      knowledge: { education: 'Bachelors', certificates: ['Google Cloud'], languages: ['English', 'French'], total: 2400 },
      assets: [{ id: '1', type: 'car', name: 'Tesla Model 3', value: 45000 }],
      badges: [],
      friends: ['1', '3'],
      createdAt: new Date('2024-02-01'),
      lastActive: new Date(),
      status: 'active',
      lastLogin: new Date('2024-03-10T12:15:00')
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'onboarding', label: 'Onboarding', icon: FileText },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'items', label: 'Items & Points', icon: Star },
    { id: 'content', label: 'Content Moderation', icon: Shield },
    { id: 'system', label: 'System Settings', icon: Settings },
  ];

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'delete' | 'verify') => {
    console.log(`${action} user ${userId}`);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for users:`, Array.from(selectedUsers));
    setSelectedUsers(new Set());
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'suspended': return 'text-red-400 bg-red-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const handleSaveItem = (item: any, type: string) => {
    if (editingItem?.id) {
      // Update existing item
      switch (type) {
        case 'badge':
          setBadges(badges.map(b => b.id === item.id ? item : b));
          break;
        case 'challenge':
          setChallenges(challenges.map(c => c.id === item.id ? item : c));
          break;
        case 'leaderboard':
          setLeaderboards(leaderboards.map(l => l.id === item.id ? item : l));
          break;
        case 'education':
          setEducationLevels(educationLevels.map(e => e.id === item.id ? item : e));
          break;
        case 'asset':
          setAssetTypes(assetTypes.map(a => a.id === item.id ? item : a));
          break;
      }
    } else {
      // Add new item
      const newItem = { ...item, id: Date.now().toString() };
      switch (type) {
        case 'badge':
          setBadges([...badges, newItem]);
          break;
        case 'challenge':
          setChallenges([...challenges, newItem]);
          break;
        case 'leaderboard':
          setLeaderboards([...leaderboards, newItem]);
          break;
        case 'education':
          setEducationLevels([...educationLevels, newItem]);
          break;
        case 'asset':
          setAssetTypes([...assetTypes, newItem]);
          break;
      }
    }
    setEditingItem(null);
    setShowModal(false);
  };

  const handleDeleteItem = (id: string, type: string) => {
    switch (type) {
      case 'badge':
        setBadges(badges.filter(b => b.id !== id));
        break;
      case 'challenge':
        setChallenges(challenges.filter(c => c.id !== id));
        break;
      case 'leaderboard':
        setLeaderboards(leaderboards.filter(l => l.id !== id));
        break;
      case 'education':
        setEducationLevels(educationLevels.filter(e => e.id !== id));
        break;
      case 'asset':
        setAssetTypes(assetTypes.filter(a => a.id !== id));
        break;
    }
  };

  // Modal Component
  const Modal = ({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white">{formatNumber(adminStats.totalUsers)}</p>
              <p className="text-green-400 text-sm">+{formatNumber(adminStats.newUsersToday)} today</p>
            </div>
            <Users className="w-12 h-12 text-blue-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold text-white">{formatNumber(adminStats.activeUsers)}</p>
              <p className="text-green-400 text-sm">{Math.round((adminStats.activeUsers / adminStats.totalUsers) * 100)}% active</p>
            </div>
            <UserCheck className="w-12 h-12 text-green-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Total Wealth</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(adminStats.totalWealth)}</p>
              <p className="text-purple-400 text-sm">Platform wide</p>
            </div>
            <Trophy className="w-12 h-12 text-purple-400" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-medium">Avg LifeScore</p>
              <p className="text-3xl font-bold text-white">{formatNumber(adminStats.averageLifeScore)}</p>
              <p className="text-yellow-400 text-sm">XP per user</p>
            </div>
            <Award className="w-12 h-12 text-yellow-400" />
          </div>
        </Card>
      </div>

      {/* Top Countries */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Globe className="w-6 h-6 text-blue-400 mr-2" />
          Top Countries by Users
        </h3>
        <div className="space-y-4">
          {adminStats.topCountries.map((country, index) => (
            <div key={country.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                <span className="text-white font-medium">{country.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
                <span className="text-blue-400 font-semibold w-20 text-right">
                  {formatNumber(country.users)}
                </span>
                <span className="text-gray-400 text-sm w-12 text-right">
                  {country.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
          Recent Platform Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
            <span className="text-gray-300">New user registrations</span>
            <span className="text-green-400 font-semibold">+1,247 today</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
            <span className="text-gray-300">Badges unlocked</span>
            <span className="text-yellow-400 font-semibold">+3,892 today</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
            <span className="text-gray-300">Wealth updates</span>
            <span className="text-blue-400 font-semibold">+2,156 today</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
            <span className="text-gray-300">Friend connections</span>
            <span className="text-purple-400 font-semibold">+987 today</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name, email, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" icon={Filter}>
              Filter
            </Button>
            <Button icon={Plus}>
              Add User
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-300">
                {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleBulkAction('activate')}>
                  Activate
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleBulkAction('suspend')}>
                  Suspend
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleBulkAction('delete')}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Users Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                      } else {
                        setSelectedUsers(new Set());
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">LifeScore</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Wealth</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Last Login</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.city}, {user.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-blue-400 font-semibold">
                      {formatNumber(user.lifeScore)} XP
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-green-400 font-semibold">
                      {formatCurrency(user.wealth.total)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-300 text-sm">
                    {user.lastLogin.toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUserAction(user.id, 'verify')}
                        className="text-blue-400 hover:text-blue-300"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                        className={user.status === 'active' ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}
                        title={user.status === 'active' ? 'Suspend' : 'Activate'}
                      >
                        {user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="text-red-400 hover:text-red-300"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderOnboarding = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Onboarding Questions</h2>
        <Button icon={Plus} onClick={() => {
          setEditingItem({ step: '', title: '', description: '', fields: [] });
          setShowModal(true);
        }}>
          Add Step
        </Button>
      </div>

      {onboardingQuestions.map((question) => (
        <Card key={question.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">{question.title}</h3>
              <p className="text-gray-400">{question.description}</p>
              <span className="text-sm text-blue-400">Step: {question.step}</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" icon={Edit} onClick={() => {
                setEditingItem(question);
                setShowModal(true);
              }}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" icon={Trash2} className="text-red-400">
                Delete
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.fields.map((field, index) => (
              <div key={index} className="bg-gray-900 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{field.label}</span>
                  <span className="text-xs text-gray-400">{field.type}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {field.required ? 'Required' : 'Optional'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );

  const renderLeaderboards = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Leaderboards</h2>
        <Button icon={Plus} onClick={() => {
          setEditingItem({ name: '', description: '', type: 'custom', category: 'combined', isActive: true });
          setShowModal(true);
        }}>
          Create Leaderboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {leaderboards.map((leaderboard) => (
          <Card key={leaderboard.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{leaderboard.name}</h3>
                <p className="text-gray-400">{leaderboard.description}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" icon={Edit} onClick={() => {
                  setEditingItem(leaderboard);
                  setShowModal(true);
                }}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" icon={Trash2} className="text-red-400" onClick={() => handleDeleteItem(leaderboard.id, 'leaderboard')}>
                  Delete
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white capitalize">{leaderboard.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="text-white capitalize">{leaderboard.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Participants:</span>
                <span className="text-blue-400 font-semibold">{formatNumber(leaderboard.participants)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${leaderboard.isActive ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'}`}>
                  {leaderboard.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Challenges</h2>
        <Button icon={Plus} onClick={() => {
          setEditingItem({ 
            title: '', 
            description: '', 
            type: 'weekly', 
            category: 'wealth', 
            reward: '', 
            isActive: true,
            requirements: { target: 0, metric: '' }
          });
          setShowModal(true);
        }}>
          Create Challenge
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{challenge.title}</h3>
                <p className="text-gray-400">{challenge.description}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" icon={Edit} onClick={() => {
                  setEditingItem(challenge);
                  setShowModal(true);
                }}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" icon={Trash2} className="text-red-400" onClick={() => handleDeleteItem(challenge.id, 'challenge')}>
                  Delete
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white capitalize">{challenge.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="text-white capitalize">{challenge.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Participants:</span>
                <span className="text-blue-400 font-semibold">{formatNumber(challenge.participants)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reward:</span>
                <span className="text-yellow-400">{challenge.reward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${challenge.isActive ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'}`}>
                  {challenge.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Badges</h2>
        <Button icon={Plus} onClick={() => {
          setEditingItem({ 
            name: '', 
            description: '', 
            icon: '🏆', 
            category: 'wealth', 
            rarity: 'common', 
            xpReward: 100,
            requirements: {},
            isActive: true
          });
          setShowModal(true);
        }}>
          Create Badge
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {badges.map((badge) => (
          <Card key={badge.id} className="p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{badge.icon}</div>
              <h3 className="text-lg font-semibold text-white">{badge.name}</h3>
              <p className="text-gray-400 text-sm">{badge.description}</p>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="text-white capitalize">{badge.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rarity:</span>
                <span className={`capitalize ${
                  badge.rarity === 'legendary' ? 'text-yellow-400' :
                  badge.rarity === 'epic' ? 'text-purple-400' :
                  badge.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {badge.rarity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">XP Reward:</span>
                <span className="text-yellow-400 font-semibold">{badge.xpReward} XP</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" icon={Edit} className="flex-1" onClick={() => {
                setEditingItem(badge);
                setShowModal(true);
              }}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" icon={Trash2} className="text-red-400" onClick={() => handleDeleteItem(badge.id, 'badge')}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderItemsAndPoints = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Items & Point System</h2>
      
      {/* Education Levels */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <GraduationCap className="w-6 h-6 text-blue-400 mr-2" />
            Education Levels
          </h3>
          <Button icon={Plus} onClick={() => {
            setEditingItem({ name: '', points: 0, isActive: true });
            setShowModal(true);
          }}>
            Add Level
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {educationLevels.map((level) => (
            <div key={level.id} className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">{level.name}</h4>
                <p className="text-blue-400 font-semibold">{level.points} points</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" icon={Edit} onClick={() => {
                  setEditingItem(level);
                  setShowModal(true);
                }}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" icon={Trash2} className="text-red-400" onClick={() => handleDeleteItem(level.id, 'education')}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Asset Types */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Home className="w-6 h-6 text-purple-400 mr-2" />
            Asset Types
          </h3>
          <Button icon={Plus} onClick={() => {
            setEditingItem({ name: '', icon: '🏠', pointsPerDollar: 0.01, isActive: true });
            setShowModal(true);
          }}>
            Add Type
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assetTypes.map((type) => (
            <div key={type.id} className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <h4 className="font-medium text-white">{type.name}</h4>
                  <p className="text-purple-400 font-semibold">{type.pointsPerDollar} pts/$</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" icon={Edit} onClick={() => {
                  setEditingItem(type);
                  setShowModal(true);
                }}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" icon={Trash2} className="text-red-400" onClick={() => handleDeleteItem(type.id, 'asset')}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderContentModeration = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Shield className="w-6 h-6 text-red-400 mr-2" />
          Content Moderation Queue
        </h3>
        <div className="text-center py-8">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-white mb-2">No Pending Reports</h4>
          <p className="text-gray-400">All content has been reviewed and approved.</p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-6">Moderation Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Auto-approve wealth updates</h4>
              <p className="text-sm text-gray-400">Automatically approve wealth updates under $10,000</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Require verification for high assets</h4>
              <p className="text-sm text-gray-400">Assets over $100,000 require manual verification</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Database className="w-6 h-6 text-purple-400 mr-2" />
          System Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Platform Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Max LifeScore</label>
                <input
                  type="number"
                  defaultValue="50000"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Badge XP Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue="1.0"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Security Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Two-factor authentication required</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Email verification required</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-6">Backup & Maintenance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Create Backup
          </Button>
          <Button variant="secondary">
            System Health Check
          </Button>
          <Button variant="secondary">
            Clear Cache
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderEditModal = () => {
    if (!editingItem || !showModal) return null;

    const isEditing = !!editingItem.id;
    
    return (
      <Modal 
        title={`${isEditing ? 'Edit' : 'Create'} ${
          activeTab === 'badges' ? 'Badge' :
          activeTab === 'challenges' ? 'Challenge' :
          activeTab === 'leaderboards' ? 'Leaderboard' :
          activeTab === 'items' ? 'Item' : 'Item'
        }`}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
      >
        <div className="space-y-4">
          {/* Badge Form */}
          {activeTab === 'badges' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                    placeholder="Badge name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Icon</label>
                  <input
                    type="text"
                    value={editingItem.icon || ''}
                    onChange={(e) => setEditingItem({...editingItem, icon: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                    placeholder="🏆"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  rows={3}
                  placeholder="Badge description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Category</label>
                  <select
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  >
                    <option value="wealth">Wealth</option>
                    <option value="knowledge">Knowledge</option>
                    <option value="assets">Assets</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Rarity</label>
                  <select
                    value={editingItem.rarity || ''}
                    onChange={(e) => setEditingItem({...editingItem, rarity: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  >
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">XP Reward</label>
                  <input
                    type="number"
                    value={editingItem.xpReward || 0}
                    onChange={(e) => setEditingItem({...editingItem, xpReward: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* Challenge Form */}
          {activeTab === 'challenges' && (
            <>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  placeholder="Challenge title"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  rows={3}
                  placeholder="Challenge description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Type</label>
                  <select
                    value={editingItem.type || ''}
                    onChange={(e) => setEditingItem({...editingItem, type: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="special">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Category</label>
                  <select
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  >
                    <option value="wealth">Wealth</option>
                    <option value="knowledge">Knowledge</option>
                    <option value="assets">Assets</option>
                    <option value="social">Social</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Reward</label>
                <input
                  type="text"
                  value={editingItem.reward || ''}
                  onChange={(e) => setEditingItem({...editingItem, reward: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  placeholder="Badge + XP reward"
                />
              </div>
            </>
          )}

          {/* Leaderboard Form */}
          {activeTab === 'leaderboards' && (
            <>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  placeholder="Leaderboard name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  rows={3}
                  placeholder="Leaderboard description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Type</label>
                  <select
                    value={editingItem.type || ''}
                    onChange={(e) => setEditingItem({...editingItem, type: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  >
                    <option value="global">Global</option>
                    <option value="custom">Custom</option>
                    <option value="regional">Regional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Category</label>
                  <select
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  >
                    <option value="combined">Combined</option>
                    <option value="wealth">Wealth</option>
                    <option value="knowledge">Knowledge</option>
                    <option value="assets">Assets</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Education/Asset Form */}
          {activeTab === 'items' && (
            <>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  placeholder="Item name"
                />
              </div>
              {editingItem.icon !== undefined && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Icon</label>
                  <input
                    type="text"
                    value={editingItem.icon || ''}
                    onChange={(e) => setEditingItem({...editingItem, icon: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                    placeholder="🏠"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  {editingItem.pointsPerDollar !== undefined ? 'Points per Dollar' : 'Points'}
                </label>
                <input
                  type="number"
                  step={editingItem.pointsPerDollar !== undefined ? "0.001" : "1"}
                  value={editingItem.pointsPerDollar || editingItem.points || 0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (editingItem.pointsPerDollar !== undefined) {
                      setEditingItem({...editingItem, pointsPerDollar: value});
                    } else {
                      setEditingItem({...editingItem, points: value});
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={() => {
                setShowModal(false);
                setEditingItem(null);
              }}
              variant="secondary" 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const type = activeTab === 'badges' ? 'badge' :
                           activeTab === 'challenges' ? 'challenge' :
                           activeTab === 'leaderboards' ? 'leaderboard' :
                           editingItem.pointsPerDollar !== undefined ? 'asset' : 'education';
                handleSaveItem(editingItem, type);
              }}
              className="flex-1"
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 h-screen flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </motion.button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-700">
            <Button
              onClick={logout}
              variant="secondary"
              className="w-full"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                👑 Admin Dashboard
              </h1>
              <p className="text-gray-300 mt-2">Manage users, content, and platform settings</p>
            </div>

            {/* Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'users' && renderUserManagement()}
              {activeTab === 'onboarding' && renderOnboarding()}
              {activeTab === 'leaderboards' && renderLeaderboards()}
              {activeTab === 'challenges' && renderChallenges()}
              {activeTab === 'badges' && renderBadges()}
              {activeTab === 'items' && renderItemsAndPoints()}
              {activeTab === 'content' && renderContentModeration()}
              {activeTab === 'system' && renderSystemSettings()}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {renderEditModal()}
    </div>
  );
};

export default AdminPanel;