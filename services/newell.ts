import { generateText } from '@fastshot/ai';
import type { Recipe, Ingredient, GroceryCategory } from '@/types';

/**
 * Parse a recipe from video content using Newell AI
 * @param videoUrl - The URL of the YouTube or TikTok video
 * @param videoTranscript - The transcript or description of the video
 */
export async function parseRecipeFromVideo(
  videoUrl: string,
  videoTranscript: string
): Promise<Recipe> {
  // Use Newell AI to extract structured recipe data
  const prompt = `You are a recipe extraction AI. Analyze the following video transcript and extract recipe information.

Video Transcript:
${videoTranscript}

Extract and return a JSON object with the following structure (respond ONLY with valid JSON, no other text):
{
  "title": "Recipe name",
  "servings": number,
  "cookTime": number (in minutes),
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "unit of measurement (e.g., cup, tsp, lb, oz, or empty string if none)",
      "category": "one of: Produce, Dairy & Eggs, Pantry, Meat & Seafood, Bakery, Beverages, Frozen, Other"
    }
  ]
}

Important:
- Extract all ingredients with their quantities
- Categorize each ingredient appropriately
- If servings or cook time are not mentioned, estimate reasonable values
- Keep ingredient names concise and clear`;

  try {
    const response = await generateText({ prompt });

    // Parse the JSON response
    const cleanedResponse = response.trim().replace(/```json\n?|\n?```/g, '');
    const parsed = JSON.parse(cleanedResponse);

    // Create the recipe object
    const recipe: Recipe = {
      id: generateRecipeId(),
      title: parsed.title,
      source: videoUrl.includes('youtube') ? 'youtube' : 'tiktok',
      sourceUrl: videoUrl,
      servings: parsed.servings || 4,
      cookTime: parsed.cookTime || 30,
      ingredients: parsed.ingredients.map((ing: any, index: number) => ({
        id: `${generateRecipeId()}-ing-${index}`,
        name: ing.name,
        quantity: ing.quantity || 0,
        unit: ing.unit || '',
        category: ing.category as GroceryCategory,
        checked: false,
      })),
      isFavorite: false,
      createdAt: Date.now(),
      parsedAt: Date.now(),
    };

    return recipe;
  } catch (error) {
    console.error('Error parsing recipe:', error);
    throw new Error('Failed to parse recipe from video. Please try again.');
  }
}

/**
 * Categorize a grocery list using Newell AI
 * @param ingredients - List of ingredients to categorize
 */
export async function categorizeIngredients(
  ingredients: Ingredient[]
): Promise<Ingredient[]> {
  const prompt = `You are a grocery categorization AI. Categorize the following ingredients into appropriate grocery store sections.

Ingredients:
${ingredients.map((ing, i) => `${i + 1}. ${ing.name}`).join('\n')}

Available categories: Produce, Dairy & Eggs, Pantry, Meat & Seafood, Bakery, Beverages, Frozen, Other

Return a JSON array with the category for each ingredient (respond ONLY with valid JSON, no other text):
[
  "category1",
  "category2",
  ...
]`;

  try {
    const response = await generateText({ prompt });
    const cleanedResponse = response.trim().replace(/```json\n?|\n?```/g, '');
    const categories = JSON.parse(cleanedResponse);

    return ingredients.map((ing, index) => ({
      ...ing,
      category: categories[index] as GroceryCategory,
    }));
  } catch (error) {
    console.error('Error categorizing ingredients:', error);
    // Return original ingredients with default category
    return ingredients.map(ing => ({ ...ing, category: 'Other' as GroceryCategory }));
  }
}

/**
 * Generate a weekly meal plan using Newell AI
 * @param preferences - User preferences for meal planning
 */
export async function generateWeeklyMealPlan(preferences: {
  cuisine?: string;
  dietary?: string;
  skillLevel?: string;
}): Promise<any> {
  const prompt = `You are a meal planning AI. Generate a 7-day meal plan with breakfast, lunch, and dinner for each day.

Preferences:
- Cuisine: ${preferences.cuisine || 'Any'}
- Dietary Restrictions: ${preferences.dietary || 'None'}
- Cooking Skill Level: ${preferences.skillLevel || 'Intermediate'}

Return a JSON array with 7 days (respond ONLY with valid JSON, no other text):
[
  {
    "day": "Monday",
    "breakfast": "Recipe name",
    "lunch": "Recipe name",
    "dinner": "Recipe name",
    "snack": "Recipe name"
  },
  ...
]`;

  try {
    const response = await generateText({ prompt });
    const cleanedResponse = response.trim().replace(/```json\n?|\n?```/g, '');
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw new Error('Failed to generate meal plan. Please try again.');
  }
}

/**
 * Extract video transcript/description (mock implementation)
 * In a real app, you would use a service like YouTube API or web scraping
 */
export async function extractVideoContent(videoUrl: string): Promise<string> {
  // Mock implementation - in production, you would:
  // 1. Use YouTube Data API to get video description/captions
  // 2. Use TikTok API or web scraping for TikTok videos
  // 3. Use a video transcription service

  // For demo purposes, return a mock transcript
  return `
    Today I'm making my famous crispy chicken! Here's what you'll need:

    Ingredients:
    - 2 pounds of boneless chicken thighs
    - 1 cup of panko breadcrumbs
    - 2 beaten eggs
    - Half a cup of flour
    - 1 teaspoon of smoked paprika
    - Salt and pepper to taste
    - Vegetable oil for frying

    This recipe serves 4 people and takes about 30 minutes to make.

    Instructions:
    1. Season the chicken with salt and pepper
    2. Set up your breading station with flour, eggs, and panko
    3. Coat each piece of chicken in flour, then egg, then panko
    4. Fry in hot oil until golden brown and crispy
    5. Serve hot and enjoy!
  `;
}

// Helper function to generate unique IDs
function generateRecipeId(): string {
  return `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
