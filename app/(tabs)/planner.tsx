import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useGrocery } from '@/contexts/GroceryContext';
import type { Ingredient } from '@/types';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

interface DayMeals {
  date: string;
  dayName: string;
  dayNumber: number;
  meals: {
    [key in MealType]?: string;
  };
}

export default function PlannerScreen() {
  const router = useRouter();
  const { addRecipeToGroceryList } = useGrocery();
  const [selectedDay, setSelectedDay] = useState(0);

  // Mock meal plan data for the week
  const [weekData] = useState<DayMeals[]>([
    {
      date: 'Mon',
      dayName: 'Monday',
      dayNumber: 13,
      meals: {
        Breakfast: 'Avocado Toast with Egg',
        Lunch: 'Quinoa Salad with Chickpeas',
        Dinner: "Eitan's Crispy Chicken",
        Snack: 'Apple Slices with Peanut Butter',
      },
    },
    {
      date: 'Tue',
      dayName: 'Tuesday',
      dayNumber: 14,
      meals: {
        Breakfast: 'Greek Yogurt Parfait',
        Lunch: 'Mediterranean Wrap',
        Dinner: 'Garlic Butter Shrimp',
      },
    },
    {
      date: 'Wed',
      dayName: 'Wednesday',
      dayNumber: 15,
      meals: {},
    },
    {
      date: 'Thu',
      dayName: 'Thursday',
      dayNumber: 16,
      meals: {},
    },
    {
      date: 'Fri',
      dayName: 'Friday',
      dayNumber: 17,
      meals: {},
    },
    {
      date: 'Sat',
      dayName: 'Saturday',
      dayNumber: 18,
      meals: {},
    },
    {
      date: 'Sun',
      dayName: 'Sunday',
      dayNumber: 19,
      meals: {},
    },
  ]);

  const handleDayPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay(index);
  };

  const handleSwapMeal = (mealType: MealType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Swap Meal', `Swap ${mealType}?`, [{ text: 'Cancel' }, { text: 'Swap' }]);
  };

  const handleGenerateGroceryList = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Count total meals in the plan
    let totalMeals = 0;
    weekData.forEach((day) => {
      totalMeals += Object.keys(day.meals).length;
    });

    if (totalMeals === 0) {
      Alert.alert('No Meals Planned', 'Add meals to your week plan first before generating a grocery list.');
      return;
    }

    Alert.alert(
      'Generate Grocery List',
      `Generate a grocery list from ${totalMeals} planned meals for the entire week?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            generateWeeklyGroceryList();
          },
        },
      ]
    );
  };

  const generateWeeklyGroceryList = () => {
    let addedRecipes = 0;

    // For each day, for each meal, add ingredients to grocery list
    weekData.forEach((day) => {
      Object.entries(day.meals).forEach(([mealType, mealName]) => {
        if (mealName) {
          // In a real app, you would fetch the recipe by ID and get its ingredients
          // For demo, we'll create mock ingredients based on the meal name
          const mockIngredients = generateMockIngredientsForMeal(mealName);
          const recipeId = `${day.date}-${mealType}`;

          addRecipeToGroceryList(recipeId, mealName, mockIngredients);
          addedRecipes++;
        }
      });
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert(
      'Grocery List Generated!',
      `Added ingredients from ${addedRecipes} recipes to your grocery list.`,
      [
        { text: 'View Grocery List', onPress: () => router.push('/grocery-list') },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  // Helper function to generate mock ingredients for demo
  const generateMockIngredientsForMeal = (mealName: string): Ingredient[] => {
    // This would normally fetch from a database
    // For demo, we return realistic ingredients based on meal type
    const ingredients: Ingredient[] = [];

    if (mealName.toLowerCase().includes('chicken')) {
      ingredients.push(
        { id: `${Date.now()}-1`, name: 'Chicken Breast', quantity: 1, unit: 'lb', category: 'Meat & Seafood' },
        { id: `${Date.now()}-2`, name: 'Olive Oil', quantity: 2, unit: 'tbsp', category: 'Pantry' },
        { id: `${Date.now()}-3`, name: 'Garlic', quantity: 2, unit: 'cloves', category: 'Produce' }
      );
    } else if (mealName.toLowerCase().includes('egg')) {
      ingredients.push(
        { id: `${Date.now()}-1`, name: 'Eggs', quantity: 2, unit: '', category: 'Dairy & Eggs' },
        { id: `${Date.now()}-2`, name: 'Avocado', quantity: 1, unit: '', category: 'Produce' },
        { id: `${Date.now()}-3`, name: 'Bread', quantity: 2, unit: 'slices', category: 'Bakery' }
      );
    } else if (mealName.toLowerCase().includes('salad')) {
      ingredients.push(
        { id: `${Date.now()}-1`, name: 'Lettuce', quantity: 1, unit: 'head', category: 'Produce' },
        { id: `${Date.now()}-2`, name: 'Tomatoes', quantity: 2, unit: '', category: 'Produce' },
        { id: `${Date.now()}-3`, name: 'Cucumber', quantity: 1, unit: '', category: 'Produce' }
      );
    } else {
      // Generic ingredients
      ingredients.push(
        { id: `${Date.now()}-1`, name: 'Mixed Vegetables', quantity: 2, unit: 'cups', category: 'Produce' },
        { id: `${Date.now()}-2`, name: 'Olive Oil', quantity: 1, unit: 'tbsp', category: 'Pantry' }
      );
    }

    return ingredients;
  };

  const currentDay = weekData[selectedDay];
  const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Meal Planner</Text>
        <View style={styles.premiumBadge}>
          <Ionicons name="lock-closed" size={12} color={Colors.sage} />
          <Text style={styles.premiumText}>Premium Feature: AI Meal Planning</Text>
        </View>
      </View>

      {/* Week Selector */}
      <View style={styles.weekContainer}>
        <Text style={styles.weekTitle}>Meal Plan - Week of Nov 13</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScrollContent}
        >
          {weekData.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dayButton, selectedDay === index && styles.dayButtonActive]}
              onPress={() => handleDayPress(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.dayButtonDate, selectedDay === index && styles.dayButtonDateActive]}
              >
                {day.date}
              </Text>
              <Text
                style={[
                  styles.dayButtonNumber,
                  selectedDay === index && styles.dayButtonNumberActive,
                ]}
              >
                {day.dayNumber}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Meals List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {mealTypes.map((mealType) => (
          <View key={mealType} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealType}>{mealType}</Text>
              {currentDay.meals[mealType] && (
                <TouchableOpacity
                  style={styles.swapButton}
                  onPress={() => handleSwapMeal(mealType)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="swap-horizontal" size={18} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            {currentDay.meals[mealType] ? (
              <Text style={styles.mealName}>{currentDay.meals[mealType]}</Text>
            ) : (
              <View style={styles.emptyMeal}>
                <Ionicons name="add-circle-outline" size={24} color={Colors.gray[400]} />
                <Text style={styles.emptyMealText}>Add {mealType.toLowerCase()}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Generate Grocery List Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateGroceryList}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={20} color={Colors.white} />
          <Text style={styles.generateButtonText}>Generate Grocery List for Week</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 10,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.sage,
    opacity: 0.8,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  weekContainer: {
    paddingBottom: 15,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  daysScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  dayButton: {
    width: 50,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayButtonDate: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray[600],
    marginBottom: 4,
  },
  dayButtonDateActive: {
    color: Colors.white,
  },
  dayButtonNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
  },
  dayButtonNumberActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  mealCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[500],
  },
  swapButton: {
    padding: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    lineHeight: 22,
  },
  emptyMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  emptyMealText: {
    fontSize: 14,
    color: Colors.gray[400],
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.cream,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  generateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
