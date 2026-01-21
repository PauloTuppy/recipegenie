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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useRecipes } from '@/contexts/RecipeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function LibraryScreen() {
  const router = useRouter();
  const { recipes, favoriteRecipes, isLoading, searchRecipes } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Filter recipes based on search and favorites
  const displayRecipes = showFavoritesOnly ? favoriteRecipes : recipes;
  const filteredRecipes = searchQuery
    ? searchRecipes(searchQuery).filter((recipe) => !showFavoritesOnly || recipe.isFavorite)
    : displayRecipes;

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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {filteredRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => handleRecipePress(recipe.id)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{
                      uri: recipe.imageUrl || 'https://via.placeholder.com/300/E67E22/FFFFFF?text=Recipe',
                    }}
                    style={styles.recipeImage}
                  />
                  {recipe.isFavorite && (
                    <View style={styles.favoriteBadge}>
                      <Ionicons name="star" size={16} color={Colors.white} />
                    </View>
                  )}
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeTitle} numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    {recipe.cookTime && (
                      <View style={styles.cookTimeContainer}>
                        <Ionicons name="time-outline" size={14} color={Colors.gray[500]} />
                        <Text style={styles.cookTimeText}>{recipe.cookTime} min</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {filteredRecipes.length === 0 && !isLoading && (
              <View style={styles.emptyState}>
                <Ionicons
                  name={recipes.length === 0 ? 'book-outline' : 'search'}
                  size={64}
                  color={Colors.gray[300]}
                />
                <Text style={styles.emptyStateTitle}>
                  {recipes.length === 0 ? 'No Recipes Yet' : 'No recipes found'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {recipes.length === 0
                    ? 'Start by parsing a recipe from YouTube or TikTok on the Home tab!'
                    : showFavoritesOnly
                    ? 'You have no favorite recipes yet. Tap the heart icon on any recipe to save it!'
                    : 'Try a different search term'}
                </Text>
              </View>
            )}
          </>
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.gray[600],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
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
