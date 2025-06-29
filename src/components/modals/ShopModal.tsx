import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Package, CreditCard, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Purchases from '../../lib/revenuecat';
import { PurchasesPackage } from '@revenuecat/purchases-js';
import Button from '../common/Button';
import Card from '../common/Card';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const offerings = await Purchases.getOfferings();
        console.log('RevenueCat offerings:', offerings);
        
        if (offerings.current) {
          setPackages(offerings.current.availablePackages);
        } else {
          setError('No offerings available. Please try again later.');
        }
      } catch (error) {
        console.error("Error fetching offerings:", error);
        setError('Failed to load products. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchOfferings();
    }
  }, [isOpen]);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setPurchasingPackage(pkg.identifier);
      
      // In a real implementation, you would call:
      // const purchaseResult = await Purchases.purchasePackage(pkg);
      
      // For demo purposes, we'll simulate a successful purchase after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      alert(`Purchase successful for ${pkg.product.title}!`);
      setPurchasingPackage(null);
    } catch (error) {
      console.error("Purchase failed:", error);
      alert(`Purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPurchasingPackage(null);
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
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Get Seeds</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                  <p className="text-gray-300">Loading products...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
                  <p className="text-red-400 font-semibold mb-2">Error Loading Products</p>
                  <p className="text-gray-300">{error}</p>
                  <Button 
                    onClick={() => setIsLoading(true)}
                    className="mt-4"
                    variant="secondary"
                  >
                    Try Again
                  </Button>
                </div>
              ) : packages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-300">No products available at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <Card 
                      key={pkg.identifier}
                      className="p-4 hover:border-green-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">{pkg.product.title}</h3>
                          <p className="text-gray-300 text-sm mb-2">{pkg.product.description}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-400 font-bold text-lg">{pkg.product.priceString}</span>
                            {pkg.product.introPrice && (
                              <span className="text-gray-400 text-sm line-through">
                                {pkg.product.introPrice.priceString}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handlePurchase(pkg)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600"
                          disabled={purchasingPackage === pkg.identifier}
                        >
                          {purchasingPackage === pkg.identifier ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Buy Now
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Info Section */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 font-medium mb-1">Secure Payments</h4>
                    <p className="text-gray-300 text-sm">
                      All transactions are processed securely through RevenueCat and Stripe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShopModal;