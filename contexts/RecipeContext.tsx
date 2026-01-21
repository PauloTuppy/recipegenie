import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import type { Recipe } from '@/types';
import {
  saveRecipe,
  getRecipes,
  deleteRecipe,
  updateRecipeFavorite,
  subscribeToRecipes,
} from '@/services/firebase';

interface RecipeContextType {
  recipes: Recipe[];
  isLoading: boolean;
  favoriteRecipes: Recipe[];
  addRecipe: (recipe: Recipe) => Promise<void>;
  removeRecipe: (recipeId: string) => Promise<void>;
  toggleFavorite: (recipeId: string) => Promise<void>;
  getRecipeById: (recipeId: string) => Recipe | undefined;
  refreshRecipes: () => Promise<void>;
  searchRecipes: (query: string) => Recipe[];
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recipes from Firebase on mount
  useEffect(() => {
    loadRecipes();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRecipes((updatedRecipes) => {
      setRecipes(updatedRecipes);
    });

    return () => unsubscribe();
  }, []);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      const loadedRecipes = await getRecipes();
      setRecipes(loadedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRecipes = async () => {
    await loadRecipes();
  };

  const addRecipe = async (recipe: Recipe) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Optimistic update
      setRecipes((prev) => [recipe, ...prev]);

      // Persist to Firebase
      await saveRecipe(recipe);
    } catch (error) {
      console.error('Error adding recipe:', error);
      // Revert optimistic update on error
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
      throw error;
    }
  };

  const removeRecipe = async (recipeId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Optimistic update
      const previousRecipes = [...recipes];
      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));

      // Persist to Firebase
      await deleteRecipe(recipeId);
    } catch (error) {
      console.error('Error removing recipe:', error);
      // Revert on error
      await loadRecipes();
      throw error;
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Optimistic update
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
        )
      );

      // Find the recipe to get current favorite status
      const recipe = recipes.find((r) => r.id === recipeId);
      if (recipe) {
        await updateRecipeFavorite(recipeId, !recipe.isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      await loadRecipes();
      throw error;
    }
  };

  const getRecipeById = (recipeId: string): Recipe | undefined => {
    return recipes.find((r) => r.id === recipeId);
  };

  const searchRecipes = (query: string): Recipe[] => {
    if (!query.trim()) return recipes;

    const lowerQuery = query.toLowerCase();
    return recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(lowerQuery) ||
        recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(lowerQuery))
    );
  };

  const favoriteRecipes = recipes.filter((r) => r.isFavorite);

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        isLoading,
        favoriteRecipes,
        addRecipe,
        removeRecipe,
        toggleFavorite,
        getRecipeById,
        refreshRecipes,
        searchRecipes,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
}
