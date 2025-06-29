import * as Purchases from '@revenuecat/purchases-js';

// RevenueCat configuration
const REVENUECAT_PUBLIC_SDK_KEY = 'your_revenuecat_public_sdk_key'; // Replace with your actual public SDK key

/**
 * Initialize RevenueCat SDK
 */
export const initializeRevenueCat = () => {
  try {
    console.log('🔄 Initializing RevenueCat SDK...');
    
    Purchases.configure({
      apiKey: REVENUECAT_PUBLIC_SDK_KEY,
      appUserID: null, // This will use an anonymous ID that RevenueCat generates and saves
    });
    
    console.log('✅ RevenueCat SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize RevenueCat SDK:', error);
    return false;
  }
};

/**
 * Set the user ID for RevenueCat
 * Call this after user logs in
 */
export const identifyUser = async (userId: string) => {
  try {
    console.log('🔄 Identifying user with RevenueCat:', userId);
    await Purchases.logIn(userId);
    console.log('✅ User identified with RevenueCat');
    return true;
  } catch (error) {
    console.error('❌ Failed to identify user with RevenueCat:', error);
    return false;
  }
};

/**
 * Reset the user ID for RevenueCat
 * Call this when user logs out
 */
export const resetUser = async () => {
  try {
    console.log('🔄 Resetting RevenueCat user');
    await Purchases.logOut();
    console.log('✅ RevenueCat user reset');
    return true;
  } catch (error) {
    console.error('❌ Failed to reset RevenueCat user:', error);
    return false;
  }
};

/**
 * Get current customer info
 */
export const getCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('❌ Failed to get customer info:', error);
    throw error;
  }
};

/**
 * Get available offerings
 */
export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('❌ Failed to get offerings:', error);
    throw error;
  }
};

/**
 * Purchase a package
 */
export const purchasePackage = async (packageToPurchase: any) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error) {
    if (error.code === Purchases.ErrorCode.PURCHASE_CANCELLED_ERROR) {
      console.log('User cancelled the purchase');
    } else {
      console.error('❌ Error purchasing package:', error);
    }
    throw error;
  }
};

/**
 * Check if user has active subscription
 */
export const hasActiveSubscription = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch (error) {
    console.error('❌ Failed to check subscription status:', error);
    return false;
  }
};

/**
 * Restore purchases
 */
export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('❌ Failed to restore purchases:', error);
    throw error;
  }
};

export default {
  initializeRevenueCat,
  identifyUser,
  resetUser,
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  hasActiveSubscription,
  restorePurchases
};