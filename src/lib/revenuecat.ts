// src/lib/revenuecat.ts

import { Purchases } from '@revenuecat/purchases-js';

const API_KEY = "rcb_NuecjNKbQSeWwmTaHcWCBZKpGyvS";

// Check if the key is a placeholder
if (API_KEY.startsWith("REPLACE")) {
  console.error("RevenueCat API key is not set. Please update it in src/lib/revenuecat.ts");
}

// Create a single instance of the Purchases class.
// The configuration (API key) happens here in the constructor.
const purchases = new Purchases(API_KEY);

// A separate function to call for additional setup, like debug logs.
export const initializeRevenueCat = () => {
    // Call the method on the INSTANCE, not the class
    purchases.setDebugLogsEnabled(true);
};

// Export the INSTANCE for the rest of the app to use
export default purchases;