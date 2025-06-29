import * as Purchases from '@revenuecat/purchases-js';

// RevenueCat API key
const REVENUECAT_API_KEY = "rcb_NuecjNKbQSeWwmTaHcWCBZKpGyvS";

export const initializeRevenueCat = () => {
  if (!REVENUECAT_API_KEY) {
    console.error("RevenueCat API key is not set. Please update it in src/lib/revenuecat.ts");
    throw new Error("RevenueCat API key is not set. Please update it in src/lib/revenuecat.ts");
  }
  
  try {
    console.log("Initializing RevenueCat with API key:", REVENUECAT_API_KEY);
    Purchases.setDebugLogsEnabled(true); // Enable for testing
    Purchases.configure({
      apiKey: REVENUECAT_API_KEY
    });
    console.log("RevenueCat initialized successfully");
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
    throw error;
  }
};

export default Purchases;