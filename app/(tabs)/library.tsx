import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function LibraryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Mock data
  const recipes = [
    {
      id: '1',
      title: "Eitan's Crispy Chicken",
      imageUrl: 'https://via.placeholder.com/300/E67E22/FFFFFF?text=Crispy+Chicken',
      isFavorite: true,
      cookTime: 30,
    },
    {
      id: '2',
      title: 'Viral Feta Pasta',
      imageUrl: 'https://via.placeholder.com/300/A4AC86/FFFFFF?text=Feta+Pasta',
      isFavorite: true,
      cookTime: 25,
    },
    {
      id: '3',
      title: 'Speed Ramen',
      imageUrl: 'https://via.placeholder.com/300/E67E22/FFFFFF?text=Speed+Ramen',
      isFavorite: false,
      cookTime: 15,
    },
    {
      id: '4',
      title: 'Garlic Butter Shrimp',
      imageUrl: 'https://via.placeholder.com/300/A4AC86/FFFFFF?text=Garlic+Shrimp',
      isFavorite: false,
      cookTime: 20,
    },
  ];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || recipe.isFavorite;
    return matchesSearch && matchesFavorite;
  });

  const handleRecipePress = (recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/recipe/${recipeId}`);
  };

  const toggleFavoritesFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity
          style={[styles.favoritesButton, showFavoritesOnly && styles.favoritesButtonActive]}
          onPress={toggleFavoritesFilter}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showFavoritesOnly ? 'star' : 'star-outline'}
            size={20}
            color={showFavoritesOnly ? Colors.white : Colors.primary}
          />
          <Text
            style={[
              styles.favoritesButtonText,
              showFavoritesOnly && styles.favoritesButtonTextActive,
            ]}
          >
            Favorites
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          placeholderTextColor={Colors.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Recipe Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeCard}
              onPress={() => handleRecipePress(recipe.id)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
              {recipe.isFavorite && (
                <View style={styles.favoriteBadge}>
                  <Ionicons name="star" size={16} color={Colors.white} />
                </View>
              )}
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle} numberOfLines={2}>
                  {recipe.title}
                </Text>
                <View style={styles.cookTimeContainer}>
                  <Ionicons name="time-outline" size={14} color={Colors.gray[500]} />
                  <Text style={styles.cookTimeText}>{recipe.cookTime} min</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredRecipes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No recipes found</Text>
            <Text style={styles.emptyStateText}>
              {showFavoritesOnly
                ? 'You have no favorite recipes yet'
                : 'Try a different search term'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.black,
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  favoritesButtonActive: {
    backgroundColor: Colors.primary,
  },
  favoritesButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  favoritesButtonTextActive: {
    color: Colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.black,
  },
  clearButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.gray[200],
  },
  favoriteBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    lineHeight: 20,
    marginBottom: 8,
  },
  cookTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cookTimeText: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[600],
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
  },
});
