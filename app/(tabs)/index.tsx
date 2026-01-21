import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { parseRecipeFromVideo, extractVideoContent } from '@/services/newell';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRecipes } from '@/contexts/RecipeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

export default function HomeScreen() {
  const router = useRouter();
  const { canParse, isPremium, parsesUsed, parsesLimit, incrementParseCount } = useSubscription();
  const { addRecipe, recipes } = useRecipes();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Get recent recipes from context (latest 3)
  const recentRecipes = recipes.slice(0, 3).map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    imageUrl: recipe.imageUrl || 'https://via.placeholder.com/400x300/E67E22/FFFFFF?text=Recipe',
  }));

  const handleParse = async () => {
    if (!url.trim()) return;

    // Check subscription limits
    if (!canParse) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Free Limit Reached',
        `You've used all ${parsesLimit} free parses this week. Upgrade to Premium for unlimited parsing!`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade to Premium',
            onPress: () => router.push('/paywall'),
          },
        ]
      );
      return;
    }

    // Validate URL
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    const isTiktok = url.includes('tiktok.com');

    if (!isYoutube && !isTiktok) {
      Alert.alert('Invalid URL', 'Please enter a valid YouTube or TikTok link.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setLoadingMessage('Scanning video ingredients...');

    try {
      // Extract video content (transcript/description)
      setLoadingMessage('Extracting video content...');
      const videoContent = await extractVideoContent(url);

      // Parse recipe using Newell AI
      setLoadingMessage('Analyzing recipe with AI...');
      const recipe = await parseRecipeFromVideo(url, videoContent);

      // Save recipe to Firebase via RecipeContext
      setLoadingMessage('Saving recipe...');
      await addRecipe(recipe);

      // Increment parse count for free users
      await incrementParseCount();

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success alert
      Alert.alert(
        'Recipe Parsed Successfully!',
        `"${recipe.title}" has been added to your library.`,
        [{ text: 'View Recipe', onPress: () => router.push(`/recipe/${recipe.id}`) }]
      );

      // Clear URL input
      setUrl('');
    } catch (error) {
      console.error('Parse error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Parse Failed',
        error instanceof Error ? error.message : 'Failed to parse recipe. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleRecipePress = (recipeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/recipe/${recipeId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoShape} />
            <View style={styles.logoContent}>
              <Ionicons name="restaurant" size={32} color={Colors.primary} />
              <Text style={styles.logoText}>
                Recipe<Text style={styles.logoTextOrange}>genie</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* URL Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Home - Paste Recipe Link</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Paste YouTube or TikTok link..."
              placeholderTextColor={Colors.gray[400]}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Ionicons
              name="clipboard-outline"
              size={20}
              color={Colors.gray[400]}
              style={styles.inputIcon}
            />
          </View>

          <TouchableOpacity
            style={[styles.parseButton, isLoading && styles.parseButtonDisabled]}
            onPress={handleParse}
            disabled={isLoading || !url.trim()}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color={Colors.white} />
                {loadingMessage && (
                  <Text style={styles.parseButtonText}>{loadingMessage}</Text>
                )}
              </>
            ) : (
              <>
                <Ionicons name="play" size={20} color={Colors.white} />
                <Text style={styles.parseButtonText}>Parse Recipe & Extract</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.aiPoweredText}>
            {isLoading ? 'Processing with Newell AI...' : 'AI-powered extraction via Newell'}
          </Text>

          {/* Usage Indicator for Free Users */}
          {!isPremium && (
            <View style={styles.usageContainer}>
              <View style={styles.usageBar}>
                <View
                  style={[
                    styles.usageBarFill,
                    { width: `${(parsesUsed / parsesLimit) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.usageText}>
                {parsesUsed} / {parsesLimit} free parses this week
              </Text>
              {parsesUsed >= parsesLimit && (
                <TouchableOpacity
                  style={styles.upgradeLink}
                  onPress={() => router.push('/paywall')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.upgradeLinkText}>Upgrade for unlimited</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Recent Recipes */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Recipes</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentScrollContent}
          >
            {recentRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => handleRecipePress(recipe.id)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: recipe.imageUrl }}
                  style={styles.recipeImage}
                  resizeMode="cover"
                />
                <View style={styles.recipeCardContent}>
                  <Text style={styles.recipeTitle} numberOfLines={2}>
                    {recipe.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    position: 'relative',
  },
  logoShape: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 80,
    height: 80,
    backgroundColor: Colors.primary,
    borderRadius: 40,
    opacity: 0.2,
  },
  logoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
  },
  logoTextOrange: {
    color: Colors.primary,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 15,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 45,
    paddingVertical: 16,
    fontSize: 15,
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  parseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  parseButtonDisabled: {
    opacity: 0.6,
  },
  parseButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  aiPoweredText: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: 10,
  },
  usageContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  usageBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  usageText: {
    fontSize: 12,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 8,
  },
  upgradeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  upgradeLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  recentSection: {
    paddingTop: 20,
  },
  recentScrollContent: {
    paddingHorizontal: 20,
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
  recipeCardContent: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    lineHeight: 20,
  },
});
