export interface Recipe {
  id: string;
  title: string;
  source: 'youtube' | 'tiktok';
  sourceUrl: string;
  videoId?: string; // YouTube or TikTok video ID
  imageUrl?: string;
  thumbnailUrl?: string; // Video thumbnail
  servings: number;
  cookTime: number; // in minutes
  ingredients: Ingredient[];
  steps?: string[]; // Cooking instructions/steps
  description?: string; // Recipe description
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

// YouTube Video Search Results
export interface VideoSearchResult {
  id: string; // Video ID
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration: string; // formatted duration (e.g., "10:23")
  viewCount?: string;
  publishedAt?: string;
  url: string; // Full video URL
}

export interface SavedVideoSearch {
  id: string;
  searchQuery: string;
  results: VideoSearchResult[];
  createdAt: number;
  resultCount: number;
}
