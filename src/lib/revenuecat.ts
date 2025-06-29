import * as Purchases from '@revenuecat/purchases-js';

// RevenueCat API key
const REVENUECAT_API_KEY = "rcb_NuecjNKbQSeWwmTaHcWCBZKpGyvS";

export const initializeRevenueCat = () => {
  if (REVENUECAT_API_KEY.startsWith("rcb_NuecjNKbQSeWwmTaHcWCBZKpGyvS")) {
    console.error("RevenueCat API key is not set. Please update it in src/lib/revenuecat.ts");
    return;
  }
  Purchases.setDebugLogsEnabled(true); // Enable for testing
  Purchases.configure({
    apiKey: REVENUECAT_API_KEY
  });
};

export default Purchases;