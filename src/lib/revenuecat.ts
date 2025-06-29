import Purchases from '@revenuecat/purchases-js';

// This is a placeholder. I will replace it with my real key.
const REVENUECAT_API_KEY = "REPLACE_WITH_YOUR_PUBLIC_STRIPE_API_KEY";

export const initializeRevenueCat = () => {
  if (REVENUECAT_API_KEY.startsWith("REPLACE")) {
    console.error("RevenueCat API key is not set. Please update it in src/lib/revenuecat.ts");
    return;
  }
  Purchases.setDebugLogsEnabled(true); // Enable for testing
  Purchases.configure({
    apiKey: REVENUECAT_API_KEY
  });
};

export default Purchases;