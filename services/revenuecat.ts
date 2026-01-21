import Purchases, {
  CustomerInfo,
  PurchasesPackage,
  PurchasesOfferings,
} from 'react-native-purchases';

const ENTITLEMENT_ID = 'premium';

// Initialize RevenueCat
export async function initializeRevenueCat() {
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

  if (!apiKey || apiKey === 'your_revenuecat_api_key_here') {
    console.warn('⚠️ RevenueCat API key not configured. Subscription features will be disabled.');
    console.warn('💡 Please set EXPO_PUBLIC_REVENUECAT_API_KEY in your environment variables.');
    return false;
  }

  try {
    await Purchases.configure({ apiKey });
    console.log('✅ RevenueCat initialized successfully');
    console.log('🔑 Using API key:', apiKey.substring(0, 10) + '...');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize RevenueCat:', error);
    return false;
  }
}

// Get available offerings
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
}

// Purchase a package
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false };
    }
    console.error('Purchase error:', error);
    throw error;
  }
}

// Check if user has premium access
export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    if (isPremium) {
      console.log('✨ Premium access active');
    } else {
      console.log('🔓 Free tier active');
    }

    return isPremium;
  } catch (error) {
    console.error('❌ Error checking premium status:', error);
    // Default to free tier on error for safety
    return false;
  }
}

// Get customer info
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Error getting customer info:', error);
    return null;
  }
}

// Restore purchases
export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return null;
  }
}

// Log in user (for cross-device subscriptions)
export async function loginUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('Error logging in user:', error);
  }
}

// Log out user
export async function logoutUser(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('Error logging out user:', error);
  }
}

// Check if user has reached free tier limit
export function hasReachedFreeLimit(parsesUsed: number): boolean {
  const FREE_TIER_LIMIT = 2;
  return parsesUsed >= FREE_TIER_LIMIT;
}
