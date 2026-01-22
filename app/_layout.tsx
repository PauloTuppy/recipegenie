import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { GroceryProvider } from '@/contexts/GroceryContext';
import { RecipeProvider } from '@/contexts/RecipeContext';
import { initializeFirebase } from '@/services/firebase';

export default function RootLayout() {
  useEffect(() => {
    // Initialize Firebase and User Identity on app start
    const init = async () => {
      await initializeFirebase();
      await import('@/services/firebase').then(m => m.initializeUserIdentity());
    };
    init();
  }, []);

  return (
    <SubscriptionProvider>
      <RecipeProvider>
        <GroceryProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="recipe/[id]"
              options={{
                headerShown: false,
                presentation: 'card'
              }}
            />
            <Stack.Screen
              name="paywall"
              options={{
                presentation: 'modal',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="grocery-list"
              options={{
                headerShown: false,
                presentation: 'card'
              }}
            />
          </Stack>
        </GroceryProvider>
      </RecipeProvider>
    </SubscriptionProvider>
  );
}
