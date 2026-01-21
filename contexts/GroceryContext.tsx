import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import type { GroceryList, GroceryItem, Ingredient, GroceryCategory } from '@/types';
import { saveGroceryListToFirebase, loadGroceryListFromFirebase } from '@/services/firebase';

interface GroceryContextType {
  groceryList: GroceryList;
  isLoading: boolean;
  addRecipeToGroceryList: (recipeId: string, recipeTitle: string, ingredients: Ingredient[]) => void;
  addIngredientToGroceryList: (item: GroceryItem) => void;
  removeIngredientFromGroceryList: (category: GroceryCategory, itemId: string) => void;
  updateIngredientQuantity: (category: GroceryCategory, itemId: string, delta: number) => void;
  toggleIngredientCheck: (category: GroceryCategory, itemId: string) => void;
  clearCheckedItems: () => void;
  clearAllItems: () => void;
  getItemCount: () => number;
  getCheckedCount: () => number;
  refreshFromFirebase: () => Promise<void>;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export function GroceryProvider({ children }: { children: ReactNode }) {
  const [groceryList, setGroceryList] = useState<GroceryList>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load grocery list from Firebase on mount
  useEffect(() => {
    loadGroceryList();
  }, []);

  const loadGroceryList = async () => {
    try {
      setIsLoading(true);
      const loadedList = await loadGroceryListFromFirebase();
      if (loadedList) {
        setGroceryList(loadedList);
      }
    } catch (error) {
      console.error('Error loading grocery list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFromFirebase = async () => {
    await loadGroceryList();
  };

  // Persist to Firebase whenever grocery list changes
  useEffect(() => {
    if (!isLoading) {
      const itemCount = Object.values(groceryList).reduce(
        (sum, items) => sum + (items?.length || 0),
        0
      );
      console.log(`💾 Persisting grocery list to Firebase (${itemCount} items)`);
      saveGroceryListToFirebase(groceryList);
    }
  }, [groceryList, isLoading]);

  const addRecipeToGroceryList = (
    recipeId: string,
    recipeTitle: string,
    ingredients: Ingredient[]
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    console.log(`🛒 Adding recipe to grocery list: "${recipeTitle}" (${ingredients.length} ingredients)`);

    setGroceryList((prev) => {
      const newList = { ...prev };
      let mergedCount = 0;
      let addedCount = 0;

      ingredients.forEach((ingredient) => {
        // Preserve AI-assigned category, fallback to 'Other'
        const category = ingredient.category || 'Other';

        // Normalize ingredient name for better duplicate detection
        const normalizedName = ingredient.name.trim().toLowerCase();

        const groceryItem: GroceryItem = {
          ...ingredient,
          id: ingredient.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          recipeId,
          recipeTitle,
          checked: false,
        };

        // Initialize category if it doesn't exist
        if (!newList[category]) {
          newList[category] = [];
        }

        // Smart duplicate detection: check for same ingredient name (case-insensitive)
        // across the same recipe ID to combine quantities
        const existingIndex = newList[category]!.findIndex(
          (item) =>
            item.name.trim().toLowerCase() === normalizedName &&
            item.recipeId === recipeId &&
            item.unit === ingredient.unit // Only merge if same unit
        );

        if (existingIndex >= 0) {
          // Merge: combine quantities while preserving category and recipe source
          const existingItem = newList[category]![existingIndex];
          const oldQuantity = existingItem.quantity;
          const newQuantity = oldQuantity + ingredient.quantity;

          newList[category]![existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
          };

          console.log(
            `🔄 Merged: "${ingredient.name}" in ${category} (${oldQuantity} → ${newQuantity} ${ingredient.unit})`
          );
          mergedCount++;
        } else {
          // Add as new item, preserving all AI-assigned attributes
          newList[category]!.push(groceryItem);
          console.log(
            `✅ Added: "${ingredient.name}" to ${category} (${ingredient.quantity} ${ingredient.unit})`
          );
          addedCount++;
        }
      });

      console.log(
        `📊 Grocery list updated: ${addedCount} added, ${mergedCount} merged from "${recipeTitle}"`
      );

      return newList;
    });
  };

  const addIngredientToGroceryList = (item: GroceryItem) => {
    setGroceryList((prev) => {
      const category = item.category || 'Other';
      const newList = { ...prev };

      if (!newList[category]) {
        newList[category] = [];
      }

      // Check if item already exists
      const existingIndex = newList[category]!.findIndex(
        (existing) => existing.name === item.name && existing.recipeId === item.recipeId
      );

      if (existingIndex >= 0) {
        // Update quantity
        newList[category]![existingIndex].quantity += item.quantity;
      } else {
        // Add new item
        newList[category]!.push({ ...item, checked: false });
      }

      return newList;
    });
  };

  const removeIngredientFromGroceryList = (category: GroceryCategory, itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setGroceryList((prev) => {
      const newList = { ...prev };
      if (newList[category]) {
        newList[category] = newList[category]!.filter((item) => item.id !== itemId);
        // Remove empty categories for cleaner UI
        if (newList[category]!.length === 0) {
          delete newList[category];
        }
      }
      return newList;
    });
  };

  const updateIngredientQuantity = (
    category: GroceryCategory,
    itemId: string,
    delta: number
  ) => {
    setGroceryList((prev) => {
      const newList = { ...prev };
      if (newList[category]) {
        newList[category] = newList[category]!.map((item) => {
          if (item.id === itemId) {
            const newQuantity = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      }
      return newList;
    });
  };

  const toggleIngredientCheck = (category: GroceryCategory, itemId: string) => {
    setGroceryList((prev) => {
      const newList = { ...prev };
      if (newList[category]) {
        newList[category] = newList[category]!.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        );
      }
      return newList;
    });
  };

  const clearCheckedItems = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setGroceryList((prev) => {
      const newList: GroceryList = {};
      Object.keys(prev).forEach((key) => {
        const category = key as GroceryCategory;
        const items = prev[category];
        const uncheckedItems = items?.filter((item) => !item.checked);
        if (uncheckedItems && uncheckedItems.length > 0) {
          newList[category] = uncheckedItems;
        }
      });
      return newList;
    });
  };

  const clearAllItems = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setGroceryList({});
  };

  const getItemCount = (): number => {
    return Object.values(groceryList).reduce(
      (sum, items) => sum + (items?.length || 0),
      0
    );
  };

  const getCheckedCount = (): number => {
    return Object.values(groceryList).reduce(
      (sum, items) => sum + (items?.filter((item) => item.checked).length || 0),
      0
    );
  };

  return (
    <GroceryContext.Provider
      value={{
        groceryList,
        isLoading,
        addRecipeToGroceryList,
        addIngredientToGroceryList,
        removeIngredientFromGroceryList,
        updateIngredientQuantity,
        toggleIngredientCheck,
        clearCheckedItems,
        clearAllItems,
        getItemCount,
        getCheckedCount,
        refreshFromFirebase,
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
}

export function useGrocery() {
  const context = useContext(GroceryContext);
  if (context === undefined) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
}
