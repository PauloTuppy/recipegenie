import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeRevenueCat,
  checkPremiumStatus,
  getCustomerInfo,
  purchasePackage,
  restorePurchases,
} from '@/services/revenuecat';
import type { PurchasesPackage } from 'react-native-purchases';

const STORAGE_KEYS = {
  PARSES_USED: '@recipegenie_parses_used',
  LAST_RESET_DATE: '@recipegenie_last_reset_date',
};

interface SubscriptionContextType {
  isPremium: boolean;
  isLoading: boolean;
  parsesUsed: number;
  parsesLimit: number;
  canParse: boolean;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  incrementParseCount: () => void;
  resetWeeklyParses: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [parsesUsed, setParsesUsed] = useState(0);
  const parsesLimit = 2;

  useEffect(() => {
    initializeSubscription();
  }, []);

  const initializeSubscription = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Initializing subscription system...');

      // Initialize RevenueCat
      const rcInitialized = await initializeRevenueCat();

      if (rcInitialized) {
        // Check premium status
        const premiumStatus = await checkPremiumStatus();
        setIsPremium(premiumStatus);
        console.log(`💎 Premium status: ${premiumStatus ? 'Active' : 'Inactive'}`);
      } else {
        console.log('📱 App Mode: FREE TIER');
        console.log('   All core features available:');
        console.log('   ✓ Recipe parsing (2 per week)');
        console.log('   ✓ Recipe library');
        console.log('   ✓ Grocery lists');
        console.log('   ✓ Meal planning');
        console.log('   ✓ Video search');
        setIsPremium(false);
      }

      // Load parse count from AsyncStorage
      const storedParses = await AsyncStorage.getItem(STORAGE_KEYS.PARSES_USED);
      const storedResetDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);

      // Check if we need to reset weekly counter
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const lastResetDate = storedResetDate || '';

      console.log(`📅 Last reset date: ${lastResetDate || 'Never'}`);
      console.log(`📅 Current date: ${currentDate}`);

      // Calculate days since last reset
      if (lastResetDate) {
        const daysSinceReset = Math.floor(
          (new Date(currentDate).getTime() - new Date(lastResetDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        console.log(`⏰ Days since last reset: ${daysSinceReset}`);

        // Reset counter if 7+ days have passed (weekly reset)
        if (daysSinceReset >= 7) {
          console.log('🔄 Weekly limit reached, resetting parse counter');
          await resetWeeklyParses();
        } else {
          // Load stored parse count with validation
          if (storedParses) {
            const parsedCount = parseInt(storedParses, 10);
            // Ensure the count is valid (non-negative number)
            if (!isNaN(parsedCount) && parsedCount >= 0) {
              setParsesUsed(parsedCount);
              console.log(`📊 Loaded parse count: ${parsedCount}/${parsesLimit}`);
            } else {
              console.warn('⚠️ Invalid parse count in storage, resetting to 0');
              await AsyncStorage.setItem(STORAGE_KEYS.PARSES_USED, '0');
              setParsesUsed(0);
            }
          }
        }
      } else {
        // First time user, set reset date
        console.log('🆕 First time user, initializing parse tracking');
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, currentDate);
      }

      console.log('✅ Subscription system initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing subscription:', error);
      // Fail safely with free tier defaults
      setIsPremium(false);
      setParsesUsed(0);
    } finally {
      setIsLoading(false);
    }
  };

  const purchase = async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      const result = await purchasePackage(pkg);
      if (result.success && result.customerInfo) {
        const premiumStatus = await checkPremiumStatus();
        setIsPremium(premiumStatus);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  };

  const restore = async (): Promise<boolean> => {
    try {
      await restorePurchases();
      const premiumStatus = await checkPremiumStatus();
      setIsPremium(premiumStatus);
      return premiumStatus;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  };

  const incrementParseCount = async () => {
    if (isPremium) {
      console.log('✨ Premium user - parse not counted');
      return;
    }

    const newCount = parsesUsed + 1;
    setParsesUsed(newCount);

    try {
      // Persist to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.PARSES_USED, newCount.toString());
      console.log(`📈 Parse count incremented: ${newCount}/${parsesLimit}`);

      // Warn if approaching limit
      if (newCount === parsesLimit) {
        console.log('⚠️ User has reached free tier limit!');
      } else if (newCount === parsesLimit - 1) {
        console.log('⚠️ User has 1 parse remaining');
      }
    } catch (error) {
      console.error('❌ Error saving parse count:', error);
      // Try to revert the state if we couldn't persist
      setParsesUsed(parsesUsed);
    }
  };

  const resetWeeklyParses = async () => {
    setParsesUsed(0);

    try {
      // Reset counter and update last reset date
      const currentDate = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(STORAGE_KEYS.PARSES_USED, '0');
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, currentDate);
    } catch (error) {
      console.error('Error resetting parse count:', error);
    }
  };

  const canParse = isPremium || parsesUsed < parsesLimit;

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        isLoading,
        parsesUsed,
        parsesLimit,
        canParse,
        purchase,
        restore,
        incrementParseCount,
        resetWeeklyParses,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
