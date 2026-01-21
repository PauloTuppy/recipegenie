import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  update,
  remove,
  onValue,
  Database,
} from 'firebase/database';
import type { Recipe, MealPlan, GroceryItem, GroceryList } from '@/types';

let app: FirebaseApp | null = null;
let database: Database | null = null;

// Firebase configuration
// Two configuration options:
// Option 1: JSON config (recommended for Expo dashboard)
// EXPO_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","databaseURL":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
// EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key (optional override)
//
// Option 2: Individual environment variables (backward compatible)
// EXPO_PUBLIC_FIREBASE_API_KEY=
// EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
// EXPO_PUBLIC_FIREBASE_DATABASE_URL=
// EXPO_PUBLIC_FIREBASE_PROJECT_ID=
// EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
// EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
// EXPO_PUBLIC_FIREBASE_APP_ID=

function getFirebaseConfig() {
  // Try to parse JSON config first (preferred for Expo dashboard)
  const jsonConfig = process.env.EXPO_PUBLIC_FIREBASE_CONFIG;
  if (jsonConfig) {
    try {
      const parsedConfig = JSON.parse(jsonConfig);

      // Allow EXPO_PUBLIC_FIREBASE_API_KEY to override the API key in JSON config
      if (process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
        parsedConfig.apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
      }

      return parsedConfig;
    } catch (error) {
      console.error('Failed to parse EXPO_PUBLIC_FIREBASE_CONFIG:', error);
    }
  }

  // Fallback to individual environment variables
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
}

export function initializeFirebase() {
  if (getApps().length === 0) {
    const firebaseConfig = getFirebaseConfig();

    // Check if Firebase is configured
    if (!firebaseConfig.apiKey) {
      console.warn('Firebase not configured. Data will not persist.');
      return false;
    }

    try {
      app = initializeApp(firebaseConfig);
      database = getDatabase(app);
      console.log('✅ Firebase initialized successfully');
      console.log('📊 Database URL:', firebaseConfig.databaseURL);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
      return false;
    }
  } else {
    app = getApps()[0];
    database = getDatabase(app);
    console.log('♻️ Firebase already initialized');
    return true;
  }
}

// User ID management (use actual auth in production)
let currentUserId = 'demo_user'; // In production, get from authentication

export function setUserId(userId: string) {
  currentUserId = userId;
}

// Recipes
export async function saveRecipe(recipe: Recipe): Promise<void> {
  if (!database) {
    console.warn('⚠️ Firebase not initialized, recipe not saved');
    return;
  }

  try {
    const recipesRef = ref(database, `users/${currentUserId}/recipes/${recipe.id}`);
    await set(recipesRef, recipe);
    console.log(`✅ Recipe saved to Firebase: "${recipe.title}" (${recipe.ingredients.length} ingredients)`);
  } catch (error) {
    console.error(`❌ Error saving recipe "${recipe.title}":`, error);
    throw error;
  }
}

export async function getRecipes(): Promise<Recipe[]> {
  if (!database) {
    console.warn('⚠️ Firebase not initialized, returning empty recipe list');
    return [];
  }

  try {
    const recipesRef = ref(database, `users/${currentUserId}/recipes`);
    const snapshot = await get(recipesRef);

    if (snapshot.exists()) {
      const recipesObj = snapshot.val();
      const recipes = Object.values(recipesObj) as Recipe[];
      console.log(`✅ Loaded ${recipes.length} recipes from Firebase`);
      return recipes;
    }

    console.log('📝 No existing recipes found, starting fresh');
    return [];
  } catch (error) {
    console.error('❌ Error loading recipes from Firebase:', error);
    return [];
  }
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  if (!database) return;

  const recipeRef = ref(database, `users/${currentUserId}/recipes/${recipeId}`);
  await remove(recipeRef);
}

export async function updateRecipeFavorite(
  recipeId: string,
  isFavorite: boolean
): Promise<void> {
  if (!database) return;

  const recipeRef = ref(database, `users/${currentUserId}/recipes/${recipeId}`);
  await update(recipeRef, { isFavorite });
}

// Grocery List - Categorized structure
export async function saveGroceryListToFirebase(groceryList: GroceryList): Promise<void> {
  if (!database) {
    console.warn('⚠️ Firebase not initialized, grocery list not saved');
    return;
  }

  try {
    const itemCount = Object.values(groceryList).reduce(
      (sum, items) => sum + (items?.length || 0),
      0
    );
    const groceryRef = ref(database, `users/${currentUserId}/groceryList`);
    await set(groceryRef, groceryList);
    console.log(`✅ Grocery list saved to Firebase (${itemCount} items, ${Object.keys(groceryList).length} categories)`);
  } catch (error) {
    console.error('❌ Error saving grocery list to Firebase:', error);
  }
}

export async function loadGroceryListFromFirebase(): Promise<GroceryList | null> {
  if (!database) {
    console.warn('⚠️ Firebase not initialized, returning empty grocery list');
    return {};
  }

  try {
    const groceryRef = ref(database, `users/${currentUserId}/groceryList`);
    const snapshot = await get(groceryRef);

    if (snapshot.exists()) {
      const groceryList = snapshot.val() as GroceryList;
      const itemCount = Object.values(groceryList).reduce(
        (sum, items) => sum + (items?.length || 0),
        0
      );
      console.log(`✅ Loaded grocery list from Firebase (${itemCount} items, ${Object.keys(groceryList).length} categories)`);
      return groceryList;
    }

    console.log('📝 No existing grocery list found, starting fresh');
    return {};
  } catch (error) {
    console.error('❌ Error loading grocery list from Firebase:', error);
    return null;
  }
}

// Legacy support - keep for backward compatibility
export async function saveGroceryList(items: GroceryItem[]): Promise<void> {
  console.warn('saveGroceryList is deprecated. Use saveGroceryListToFirebase instead.');
  if (!database) return;

  const groceryRef = ref(database, `users/${currentUserId}/groceryList`);
  await set(groceryRef, items);
}

export async function getGroceryList(): Promise<GroceryItem[]> {
  console.warn('getGroceryList is deprecated. Use loadGroceryListFromFirebase instead.');
  if (!database) return [];

  const groceryRef = ref(database, `users/${currentUserId}/groceryList`);
  const snapshot = await get(groceryRef);

  if (snapshot.exists()) {
    return snapshot.val() as GroceryItem[];
  }

  return [];
}

// Meal Plans
export async function saveMealPlan(mealPlan: MealPlan): Promise<void> {
  if (!database) return;

  try {
    const mealPlanRef = ref(database, `users/${currentUserId}/mealPlans/${mealPlan.date}`);
    await set(mealPlanRef, mealPlan);
  } catch (error) {
    console.error('Error saving meal plan to Firebase:', error);
  }
}

export async function getMealPlans(startDate: string, endDate: string): Promise<MealPlan[]> {
  if (!database) return [];

  try {
    const mealPlansRef = ref(database, `users/${currentUserId}/mealPlans`);
    const snapshot = await get(mealPlansRef);

    if (snapshot.exists()) {
      const plansObj = snapshot.val();
      const plans = Object.values(plansObj) as MealPlan[];

      // Filter by date range
      return plans.filter(
        (plan) => plan.date >= startDate && plan.date <= endDate
      );
    }

    return [];
  } catch (error) {
    console.error('Error loading meal plans from Firebase:', error);
    return [];
  }
}

export async function saveWeeklyMealPlans(plans: MealPlan[]): Promise<void> {
  if (!database) return;

  try {
    const updates: { [key: string]: MealPlan } = {};
    plans.forEach((plan) => {
      updates[`users/${currentUserId}/mealPlans/${plan.date}`] = plan;
    });
    await update(ref(database), updates);
  } catch (error) {
    console.error('Error saving weekly meal plans to Firebase:', error);
  }
}

export async function deleteMealPlan(date: string): Promise<void> {
  if (!database) return;

  try {
    const mealPlanRef = ref(database, `users/${currentUserId}/mealPlans/${date}`);
    await remove(mealPlanRef);
  } catch (error) {
    console.error('Error deleting meal plan from Firebase:', error);
  }
}

// User Preferences
export async function saveUserPreference(key: string, value: any): Promise<void> {
  if (!database) return;

  const prefRef = ref(database, `users/${currentUserId}/preferences/${key}`);
  await set(prefRef, value);
}

export async function getUserPreference(key: string): Promise<any | null> {
  if (!database) return null;

  const prefRef = ref(database, `users/${currentUserId}/preferences/${key}`);
  const snapshot = await get(prefRef);

  return snapshot.exists() ? snapshot.val() : null;
}

// Real-time listeners
export function subscribeToRecipes(callback: (recipes: Recipe[]) => void): () => void {
  if (!database) return () => {};

  const recipesRef = ref(database, `users/${currentUserId}/recipes`);
  const unsubscribe = onValue(recipesRef, (snapshot) => {
    if (snapshot.exists()) {
      const recipesObj = snapshot.val();
      callback(Object.values(recipesObj) as Recipe[]);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
}
