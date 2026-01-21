import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useGrocery } from '@/contexts/GroceryContext';
import type { Ingredient } from '@/types';

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { addRecipeToGroceryList } = useGrocery();
  const [isFavorite, setIsFavorite] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      id: '1',
      name: 'Chicken Thighs (boneless)',
      quantity: 2,
      unit: 'lbs',
      category: 'Meat & Seafood',
      checked: false,
    },
    {
      id: '2',
      name: 'Panko Breadcrumbs',
      quantity: 1,
      unit: 'cup',
      category: 'Pantry',
      checked: false,
    },
    {
      id: '3',
      name: 'Eggs (beaten)',
      quantity: 2,
      unit: '',
      category: 'Dairy & Eggs',
      checked: false,
    },
    {
      id: '4',
      name: 'Flour',
      quantity: 0.5,
      unit: 'cup',
      category: 'Pantry',
      checked: false,
    },
    {
      id: '5',
      name: 'Smoked Paprika',
      quantity: 1,
      unit: 'tsp',
      category: 'Pantry',
      checked: false,
    },
  ]);

  // Mock recipe data
  const recipe = {
    title: "Eitan's Crispy Chicken",
    source: 'TikTok',
    servings: 4,
    cookTime: 30,
    imageUrl: 'https://via.placeholder.com/600x400/E67E22/FFFFFF?text=Crispy+Chicken',
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFavorite(!isFavorite);
  };

  const handleIngredientCheck = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, checked: !ing.checked } : ing))
    );
  };

  const handleAddToGroceryList = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Add recipe ingredients to grocery list
    addRecipeToGroceryList(params.id || 'temp-id', recipe.title, ingredients);

    Alert.alert(
      'Added to Grocery List!',
      `${ingredients.length} ingredients from "${recipe.title}" have been added to your grocery list.`,
      [
        { text: 'View Grocery List', onPress: () => router.push('/grocery-list') },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} resizeMode="cover" />

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? Colors.error : Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Recipe Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.source}>Parsed from {recipe.source}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>Serves {recipe.servings}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{recipe.cookTime} min</Text>
            </View>
          </View>
        </View>

        {/* Ingredients Section */}
        <View style={styles.ingredientsContainer}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <Text style={styles.aiNote}>Ingredients auto-grouped by Newell AI</Text>

          {ingredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.ingredientItem}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleIngredientCheck(ingredient.id)}
                activeOpacity={0.7}
              >
                {ingredient.checked && (
                  <Ionicons name="checkmark" size={18} color={Colors.white} />
                )}
              </TouchableOpacity>

              <Text
                style={[
                  styles.ingredientText,
                  ingredient.checked && styles.ingredientTextChecked,
                ]}
              >
                {ingredient.quantity > 0 && `${ingredient.quantity} ${ingredient.unit} `}
                {ingredient.name}
              </Text>

              <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
                <Ionicons name="pencil" size={16} color={Colors.gray[400]} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add to Grocery List Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToGroceryList}
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>Add to Grocery List</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  imageContainer: {
    width: width,
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray[200],
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  source: {
    fontSize: 14,
    color: Colors.gray[500],
    marginBottom: 15,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.gray[700],
    fontWeight: '500',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray[300],
  },
  ingredientsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 5,
  },
  aiNote: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
    lineHeight: 22,
  },
  ingredientTextChecked: {
    textDecorationLine: 'line-through',
    color: Colors.gray[400],
  },
  editButton: {
    padding: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  addButton: {
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
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
