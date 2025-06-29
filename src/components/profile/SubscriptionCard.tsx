import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Check, 
  Zap, 
  Shield, 
  Award, 
  Loader2, 
  Sparkles, 
  RefreshCw,
  Lock
} from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import { getOfferings, hasActiveSubscription, purchasePackage, restorePurchases } from '../../lib/revenuecat';
import toast from 'react-hot-toast';

interface SubscriptionCardProps {
  userId: string;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [processingRestore, setProcessingRestore] = useState(false);

  // Load subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        setLoading(true);
        
        // Check if user has active subscription
        const hasSubscription = await hasActiveSubscription();
        setIsSubscribed(hasSubscription);
        
        // Get available offerings
        const offeringsData = await getOfferings();
        setOfferings(offeringsData);
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSubscriptionData();
  }, [userId]);

  // Handle purchase
  const handlePurchase = async (packageToPurchase: any) => {
    try {
      setProcessingPurchase(true);
      
      // Process purchase
      await purchasePackage(packageToPurchase);
      
      // Update subscription status
      setIsSubscribed(true);
      
      toast.success('Subscription activated successfully! 🎉');
    } catch (error) {
      console.error('Error processing purchase:', error);
      
      // Don't show error for user cancellation
      if (error.code !== 'PURCHASE_CANCELLED_ERROR') {
        toast.error('Failed to process purchase. Please try again.');
      }
    } finally {
      setProcessingPurchase(false);
    }
  };

  // Handle restore purchases
  const handleRestorePurchases = async () => {
    try {
      setProcessingRestore(true);
      
      // Restore previous purchases
      const customerInfo = await restorePurchases();
      
      // Check if user has premium entitlement
      const hasPremium = customerInfo.entitlements.active['premium'] !== undefined;
      setIsSubscribed(hasPremium);
      
      if (hasPremium) {
        toast.success('Premium subscription restored! 🎉');
      } else {
        toast.info('No previous subscriptions found.');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      toast.error('Failed to restore purchases. Please try again.');
    } finally {
      setProcessingRestore(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
        <div className="text-gray-300">Loading subscription information...</div>
      </Card>
    );
  }

  if (isSubscribed) {
    return (
      <Card className="p-6 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-400/30">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Premium Subscription Active</h3>
          <p className="text-gray-300 mb-6">You have access to all premium features!</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-3 rounded-lg flex items-center">
              <Check className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-white text-sm">Ad-Free Experience</span>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg flex items-center">
              <Check className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-white text-sm">Premium Badges</span>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg flex items-center">
              <Check className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-white text-sm">Advanced Analytics</span>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg flex items-center">
              <Check className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-white text-sm">Priority Support</span>
            </div>
          </div>
          
          <div className="text-yellow-400 text-sm">
            Thank you for supporting LifeScore!
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/30">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">Upgrade to Premium</h3>
        <p className="text-gray-300 mb-6">Unlock all features and enhance your LifeScore experience</p>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-900/50 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">Ad-Free Experience</div>
              <div className="text-gray-400 text-sm">Enjoy LifeScore without interruptions</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-900/50 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">Exclusive Premium Badges</div>
              <div className="text-gray-400 text-sm">Unlock special badges only for premium users</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-900/50 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">Advanced Analytics</div>
              <div className="text-gray-400 text-sm">Get deeper insights into your global standing</div>
            </div>
          </div>
        </div>
        
        {/* Subscription Options */}
        <div className="space-y-3 mb-6">
          {offerings?.current?.availablePackages ? (
            offerings.current.availablePackages.map((pkg: any, index: number) => (
              <motion.div
                key={pkg.identifier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => handlePurchase(pkg)}
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-white font-bold">{pkg.product.title}</div>
                    <div className="text-gray-400 text-sm">{pkg.product.description}</div>
                  </div>
                  <div className="text-blue-400 font-bold">{pkg.product.priceString}</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <div className="text-white font-bold">Premium Monthly</div>
                  <div className="text-gray-400 text-sm">Full access to all premium features</div>
                </div>
                <div className="text-blue-400 font-bold">$4.99/month</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-3">
          <Button
            onClick={() => handlePurchase(offerings?.current?.availablePackages?.[0] || null)}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
            disabled={processingPurchase || !offerings?.current?.availablePackages}
            icon={processingPurchase ? Loader2 : Crown}
          >
            {processingPurchase ? 'Processing...' : 'Upgrade to Premium'}
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleRestorePurchases}
            disabled={processingRestore}
            icon={processingRestore ? Loader2 : RefreshCw}
            className="text-gray-400"
          >
            {processingRestore ? 'Restoring...' : 'Restore Purchases'}
          </Button>
        </div>
        
        <div className="mt-4 text-gray-400 text-xs">
          Subscriptions will be charged to your credit card through your App Store account. 
          Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.
        </div>
      </div>
    </Card>
  );
};

export default SubscriptionCard;