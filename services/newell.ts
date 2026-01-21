import { generateText } from '@fastshot/ai';
import type { Recipe, Ingredient, GroceryCategory, VideoSearchResult } from '@/types';

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
  "description": "Brief recipe description",
  "servings": number,
  "cookTime": number (in minutes),
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "unit of measurement (e.g., cup, tsp, lb, oz, or empty string if none)",
      "category": "one of: Produce, Dairy & Eggs, Pantry, Meat & Seafood, Bakery, Beverages, Frozen, Other"
    }
  ],
  "steps": ["Step 1 description", "Step 2 description", ...]
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

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);

    // Create the recipe object
    const recipe: Recipe = {
      id: generateRecipeId(),
      title: parsed.title,
      description: parsed.description || '',
      source: videoUrl.includes('youtube') ? 'youtube' : 'tiktok',
      sourceUrl: videoUrl,
      videoId: videoId,
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
      steps: parsed.steps || [],
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

/**
 * Extract video ID from YouTube or TikTok URL
 */
function extractVideoId(url: string): string | undefined {
  try {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // YouTube URL patterns
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
    } else if (url.includes('tiktok.com')) {
      // TikTok URL pattern
      const match = url.match(/\/video\/(\d+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (error) {
    console.error('Error extracting video ID:', error);
  }
  return undefined;
}

/**
 * Search for recipe videos on YouTube using Newell AI
 * @param searchQuery - The search query (e.g., "easy chicken recipes")
 * @param maxResults - Maximum number of results to return (default: 10)
 */
export async function searchRecipeVideos(
  searchQuery: string,
  maxResults: number = 10
): Promise<VideoSearchResult[]> {
  // Use Newell AI to simulate YouTube search
  // In production, you would use YouTube Data API v3
  const prompt = `You are a YouTube recipe video search simulator. Generate ${maxResults} realistic recipe video search results for the query: "${searchQuery}"

Return ONLY a valid JSON array (no other text) with the following structure:
[
  {
    "id": "unique_video_id",
    "title": "Recipe video title",
    "channelName": "Channel name",
    "thumbnailUrl": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg",
    "duration": "MM:SS format (e.g., 10:23)",
    "viewCount": "formatted view count (e.g., 1.2M, 450K)",
    "publishedAt": "relative time (e.g., 2 days ago, 1 week ago)",
    "url": "https://www.youtube.com/watch?v=VIDEO_ID"
  }
]

Important:
- Make the results realistic and relevant to cooking/recipes
- Use diverse channel names (e.g., Tasty, Bon Appétit, Joshua Weissman, etc.)
- Vary video durations (5-20 minutes typical for recipes)
- Make titles descriptive and appealing
- Ensure thumbnailUrl uses the same VIDEO_ID as in the url`;

  try {
    const response = await generateText({ prompt });
    const cleanedResponse = response.trim().replace(/```json\n?|\n?```/g, '');
    const results = JSON.parse(cleanedResponse);

    return results.slice(0, maxResults);
  } catch (error) {
    console.error('Error searching recipe videos:', error);

    // Fallback to mock data
    return generateMockVideoResults(searchQuery, maxResults);
  }
}

/**
 * Generate mock video search results (fallback)
 */
function generateMockVideoResults(searchQuery: string, count: number): VideoSearchResult[] {
  const channels = [
    'Tasty',
    'Bon Appétit',
    'Joshua Weissman',
    'Binging with Babish',
    'Sam the Cooking Guy',
    'Chef John - Food Wishes',
    'Eitan Bernath',
    'Gordon Ramsay',
  ];

  return Array.from({ length: count }, (_, i) => {
    const videoId = `video_${Date.now()}_${i}`;
    const channel = channels[i % channels.length];
    const duration = `${Math.floor(Math.random() * 15) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

    return {
      id: videoId,
      title: `${searchQuery} - ${channel}'s Recipe`,
      channelName: channel,
      thumbnailUrl: `https://via.placeholder.com/640x360/E67E22/FFFFFF?text=${encodeURIComponent(searchQuery)}`,
      duration,
      viewCount: `${(Math.random() * 5).toFixed(1)}M`,
      publishedAt: `${Math.floor(Math.random() * 30) + 1} days ago`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  });
}
