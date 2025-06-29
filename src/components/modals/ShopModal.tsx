import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Sprout, 
  CreditCard, 
  Zap, 
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import Purchases from '../../lib/revenuecat';
import Button from '../common/Button';
import Card from '../common/Card';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: (seedAmount: number) => void;
}

interface Package {
  id: string;
  title: string;
  description: string;
  price: string;
  seedAmount: number;
  popular?: boolean;
}

const ShopModal: React.FC<ShopModalProps> = ({ 
  isOpen, 
  onClose,
  onPurchaseComplete
}) => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  // Fetch packages from RevenueCat
  useEffect(() => {
    if (isOpen) {
      const fetchOfferings = async () => {
        setIsLoading(true);
        try {
          // For demo purposes, we'll use mock data
          // In production, you would use: const offerings = await Purchases.getOfferings();
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock packages
          const mockPackages: Package[] = [
            {
              id: 'seeds_small',
              title: '100 Seeds',
              description: 'Basic package for occasional boosting',
              price: '$4.99',
              seedAmount: 100
            },
            {
              id: 'seeds_medium',
              title: '500 Seeds',
              description: 'Popular package for regular users',
              price: '$19.99',
              seedAmount: 500,
              popular: true
            },
            {
              id: 'seeds_large',
              title: '1,200 Seeds',
              description: 'Best value for active users',
              price: '$39.99',
              seedAmount: 1200
            }
          ];
          
          setPackages(mockPackages);
        } catch (error) {
          console.error('Error fetching offerings:', error);
          toast.error('Failed to load shop items');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchOfferings();
    } else {
      // Reset state when modal closes
      setSelectedPackage(null);
      setPurchaseComplete(false);
    }
  }, [isOpen]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setIsPurchasing(true);
    
    try {
      // In production, you would use:
      // const { customerInfo } = await Purchases.purchasePackage(selectedPackage.id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful purchase
      setPurchaseComplete(true);
      
      // Update user's seed balance in your database
      // This would typically be handled by a webhook from RevenueCat to your backend
      
      // Notify parent component
      if (onPurchaseComplete) {
        onPurchaseComplete(selectedPackage.seedAmount);
      }
      
      toast.success(`Successfully purchased ${selectedPackage.seedAmount} Seeds! 🌱`);
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sprout className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-white">
                  <h2 className="text-2xl font-bold mb-2">Get Seeds</h2>
                  <p className="text-white/80">
                    Seeds let you boost your posts and get more visibility in the feed
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="w-12 h-12 text-green-500 animate-spin mb-4" />
                  <p className="text-gray-300">Loading available packages...</p>
                </div>
              ) : purchaseComplete ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Purchase Complete!
                  </h3>
                  
                  <p className="text-gray-300 mb-6">
                    {selectedPackage?.seedAmount} Seeds have been added to your account.
                  </p>
                  
                  <Button onClick={onClose}>
                    Continue
                  </Button>
                </div>
              ) : (
                <>
                  {/* Current Balance */}
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sprout className="w-5 h-5 text-green-400" />
                        <span className="text-gray-300">Current Balance:</span>
                      </div>
                      <span className="text-xl font-bold text-green-400">
                        {user?.seedBalance || 0} Seeds
                      </span>
                    </div>
                  </div>

                  {/* Package Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Select a Package</h3>
                    
                    {packages.map((pkg) => (
                      <motion.div
                        key={pkg.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedPackage?.id === pkg.id
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                        }`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                            POPULAR
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                              <Sprout className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white">{pkg.title}</h4>
                              <p className="text-gray-400 text-sm">{pkg.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-white">{pkg.price}</div>
                            <div className="text-green-400 text-sm">{pkg.seedAmount} Seeds</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Purchase Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handlePurchase}
                      disabled={!selectedPackage || isPurchasing}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      icon={isPurchasing ? Loader : ShoppingCart}
                    >
                      {isPurchasing 
                        ? 'Processing...' 
                        : selectedPackage 
                          ? `Purchase ${selectedPackage.title} for ${selectedPackage.price}` 
                          : 'Select a package'
                      }
                    </Button>
                  </div>

                  {/* Info Section */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-sm">
                    <h4 className="font-semibold text-blue-400 mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      What are Seeds?
                    </h4>
                    <p className="text-gray-300 mb-2">
                      Seeds are LifeScore's virtual currency that let you boost your posts for more visibility.
                    </p>
                    <p className="text-gray-300">
                      When you boost a post with Seeds, it gets shown to more users and appears higher in feeds.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShopModal;