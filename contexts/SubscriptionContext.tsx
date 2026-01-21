import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  initializeRevenueCat,
  checkPremiumStatus,
  getCustomerInfo,
  purchasePackage,
  restorePurchases,
} from '@/services/revenuecat';
import type { PurchasesPackage } from 'react-native-purchases';

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

      // Load parse count from storage (in production, use AsyncStorage)
      // For now, just use state
      // const storedParses = await AsyncStorage.getItem('parsesUsed');
      // if (storedParses) setParsesUsed(parseInt(storedParses, 10));
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

  const incrementParseCount = () => {
    if (!isPremium) {
      const newCount = parsesUsed + 1;
      setParsesUsed(newCount);
      // In production, save to AsyncStorage
      // AsyncStorage.setItem('parsesUsed', newCount.toString());
    }
  };

  const resetWeeklyParses = () => {
    setParsesUsed(0);
    // In production, save to AsyncStorage
    // AsyncStorage.setItem('parsesUsed', '0');
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
