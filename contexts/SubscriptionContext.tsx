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
      // Initialize RevenueCat
      await initializeRevenueCat();

      // Check premium status
      const premiumStatus = await checkPremiumStatus();
      setIsPremium(premiumStatus);

      // Load parse count from AsyncStorage
      const storedParses = await AsyncStorage.getItem(STORAGE_KEYS.PARSES_USED);
      const storedResetDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);

      // Check if we need to reset weekly counter
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const lastResetDate = storedResetDate || '';

      // Calculate days since last reset
      if (lastResetDate) {
        const daysSinceReset = Math.floor(
          (new Date(currentDate).getTime() - new Date(lastResetDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Reset counter if 7+ days have passed (weekly reset)
        if (daysSinceReset >= 7) {
          await resetWeeklyParses();
        } else {
          // Load stored parse count
          if (storedParses) {
            setParsesUsed(parseInt(storedParses, 10));
          }
        }
      } else {
        // First time user, set reset date
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, currentDate);
      }
    } catch (error) {
      console.error('Error initializing subscription:', error);
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
    if (!isPremium) {
      const newCount = parsesUsed + 1;
      setParsesUsed(newCount);

      try {
        // Persist to AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.PARSES_USED, newCount.toString());
      } catch (error) {
        console.error('Error saving parse count:', error);
      }
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
