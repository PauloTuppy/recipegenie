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
// Add these to your .env file:
// EXPO_PUBLIC_FIREBASE_API_KEY=
// EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
// EXPO_PUBLIC_FIREBASE_DATABASE_URL=
// EXPO_PUBLIC_FIREBASE_PROJECT_ID=
// EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
// EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
// EXPO_PUBLIC_FIREBASE_APP_ID=

export function initializeFirebase() {
  if (getApps().length === 0) {
    const firebaseConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    };

    // Check if Firebase is configured
    if (!firebaseConfig.apiKey) {
      console.warn('Firebase not configured. Data will not persist.');
      return false;
    }

    try {
      app = initializeApp(firebaseConfig);
      database = getDatabase(app);
      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return false;
    }
  } else {
    app = getApps()[0];
    database = getDatabase(app);
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
  if (!database) return;

  const recipesRef = ref(database, `users/${currentUserId}/recipes/${recipe.id}`);
  await set(recipesRef, recipe);
}

export async function getRecipes(): Promise<Recipe[]> {
  if (!database) return [];

  const recipesRef = ref(database, `users/${currentUserId}/recipes`);
  const snapshot = await get(recipesRef);

  if (snapshot.exists()) {
    const recipesObj = snapshot.val();
    return Object.values(recipesObj) as Recipe[];
  }

  return [];
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
  if (!database) return;

  try {
    const groceryRef = ref(database, `users/${currentUserId}/groceryList`);
    await set(groceryRef, groceryList);
  } catch (error) {
    console.error('Error saving grocery list to Firebase:', error);
  }
}

export async function loadGroceryListFromFirebase(): Promise<GroceryList | null> {
  if (!database) return null;

  try {
    const groceryRef = ref(database, `users/${currentUserId}/groceryList`);
    const snapshot = await get(groceryRef);

    if (snapshot.exists()) {
      return snapshot.val() as GroceryList;
    }

    return {};
  } catch (error) {
    console.error('Error loading grocery list from Firebase:', error);
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
