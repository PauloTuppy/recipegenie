import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

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
  const [selectedDay, setSelectedDay] = useState(0);

  // Mock meal plan data for the week
  const [weekData, setWeekData] = useState<DayMeals[]>([
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Generate Grocery List',
      'Generate a grocery list for the entire week?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            // TODO: Implement grocery list generation
          },
        },
      ]
    );
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
