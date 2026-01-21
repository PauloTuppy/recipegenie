import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { GroceryList, GroceryItem, Ingredient, GroceryCategory } from '@/types';

interface GroceryContextType {
  groceryList: GroceryList;
  addRecipeToGroceryList: (recipeId: string, recipeTitle: string, ingredients: Ingredient[]) => void;
  addIngredientToGroceryList: (item: GroceryItem) => void;
  removeIngredientFromGroceryList: (category: GroceryCategory, itemId: string) => void;
  updateIngredientQuantity: (category: GroceryCategory, itemId: string, delta: number) => void;
  toggleIngredientCheck: (category: GroceryCategory, itemId: string) => void;
  clearCheckedItems: () => void;
  clearAllItems: () => void;
  getItemCount: () => number;
  getCheckedCount: () => number;
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export function GroceryProvider({ children }: { children: ReactNode }) {
  const [groceryList, setGroceryList] = useState<GroceryList>({});

  const addRecipeToGroceryList = (
    recipeId: string,
    recipeTitle: string,
    ingredients: Ingredient[]
  ) => {
    setGroceryList((prev) => {
      const newList = { ...prev };

      ingredients.forEach((ingredient) => {
        const category = ingredient.category || 'Other';
        const groceryItem: GroceryItem = {
          ...ingredient,
          recipeId,
          recipeTitle,
          checked: false,
        };

        if (!newList[category]) {
          newList[category] = [];
        }

        // Check if item already exists (same name from same recipe)
        const existingIndex = newList[category]!.findIndex(
          (item) => item.name === ingredient.name && item.recipeId === recipeId
        );

        if (existingIndex >= 0) {
          // Update quantity of existing item
          newList[category]![existingIndex].quantity += ingredient.quantity;
        } else {
          // Add new item
          newList[category]!.push(groceryItem);
        }
      });

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
    setGroceryList((prev) => {
      const newList = { ...prev };
      if (newList[category]) {
        newList[category] = newList[category]!.filter((item) => item.id !== itemId);
        // Remove empty categories
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
        addRecipeToGroceryList,
        addIngredientToGroceryList,
        removeIngredientFromGroceryList,
        updateIngredientQuantity,
        toggleIngredientCheck,
        clearCheckedItems,
        clearAllItems,
        getItemCount,
        getCheckedCount,
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
