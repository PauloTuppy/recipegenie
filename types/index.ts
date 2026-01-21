export interface Recipe {
  id: string;
  title: string;
  source: 'youtube' | 'tiktok';
  sourceUrl: string;
  imageUrl?: string;
  servings: number;
  cookTime: number; // in minutes
  ingredients: Ingredient[];
  isFavorite: boolean;
  createdAt: number;
  parsedAt: number;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: GroceryCategory;
  checked?: boolean;
}

export type GroceryCategory =
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Pantry'
  | 'Meat & Seafood'
  | 'Bakery'
  | 'Beverages'
  | 'Frozen'
  | 'Other';

export interface GroceryItem extends Ingredient {
  recipeId?: string;
  recipeTitle?: string;
}

export type GroceryList = {
  [K in GroceryCategory]?: GroceryItem[];
};

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface MealPlan {
  date: string; // YYYY-MM-DD
  meals: {
    [key in MealType]?: {
      recipeId: string;
      recipeName: string;
    };
  };
}

export interface UserSubscription {
  isPremium: boolean;
  weeklyParsesUsed: number;
  weeklyParsesLimit: number;
  subscriptionExpiresAt?: number;
}

export interface ParseRequest {
  url: string;
  platform: 'youtube' | 'tiktok';
}

export interface ParseResponse {
  success: boolean;
  recipe?: Recipe;
  error?: string;
}
