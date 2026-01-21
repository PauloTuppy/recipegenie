import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { searchRecipeVideos } from '@/services/newell';
import { saveVideoSearchResults } from '@/services/firebase';
import type { VideoSearchResult, SavedVideoSearch } from '@/types';

const { width } = Dimensions.get('window');

export default function VideoSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<VideoSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSearching(true);
    setHasSearched(true);

    try {
      // Search for recipe videos using Newell AI
      const searchResults = await searchRecipeVideos(searchQuery, 12);
      setResults(searchResults);

      // Save search results to Firebase
      const savedSearch: SavedVideoSearch = {
        id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        searchQuery: searchQuery,
        results: searchResults,
        createdAt: Date.now(),
        resultCount: searchResults.length,
      };

      await saveVideoSearchResults(savedSearch);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Search error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Search Failed', 'Unable to search videos. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVideoSelect = (video: VideoSearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert(
      'Parse Recipe?',
      `Would you like to parse the recipe from "${video.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Parse Recipe',
          onPress: () => {
            // Navigate back to home and trigger parse with video URL
            router.push({
              pathname: '/(tabs)',
              params: { videoUrl: video.url },
            });
          },
        },
      ]
    );
  };

  const handleViewSavedSearches = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/saved-video-searches');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Recipe Videos</Text>
        <TouchableOpacity
          style={styles.savedButton}
          onPress={handleViewSavedSearches}
          activeOpacity={0.7}
        >
          <Ionicons name="bookmark" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for recipes (e.g., 'easy pasta')"
            placeholderTextColor={Colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            editable={!isSearching}
          />
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          activeOpacity={0.8}
        >
          {isSearching ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="search" size={18} color={Colors.white} />
              <Text style={styles.searchButtonText}>Search</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Searching for recipe videos...</Text>
            <Text style={styles.loadingSubtext}>Powered by Newell AI</Text>
          </View>
        ) : results.length > 0 ? (
          <>
            <Text style={styles.resultsHeader}>
              Found {results.length} videos for &ldquo;{searchQuery}&rdquo;
            </Text>
            <View style={styles.resultsGrid}>
              {results.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.videoCard}
                  onPress={() => handleVideoSelect(video)}
                  activeOpacity={0.9}
                >
                  <View style={styles.thumbnailContainer}>
                    <View style={styles.thumbnailPlaceholder}>
                      <Ionicons name="play-circle" size={48} color={Colors.white} />
                    </View>
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{video.duration}</Text>
                    </View>
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <Text style={styles.channelName} numberOfLines={1}>
                      {video.channelName}
                    </Text>
                    <View style={styles.videoMeta}>
                      <Text style={styles.metaText}>{video.viewCount} views</Text>
                      <View style={styles.metaDot} />
                      <Text style={styles.metaText}>{video.publishedAt}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : hasSearched ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No videos found</Text>
            <Text style={styles.emptyStateText}>Try a different search term</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-outline" size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>Search for Recipe Videos</Text>
            <Text style={styles.emptyStateText}>
              Find inspiration from YouTube cooking channels{'\n'}and parse them into recipes
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
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    flex: 1,
    textAlign: 'center',
  },
  savedButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
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
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
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
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.gray[500],
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 15,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  videoCard: {
    width: (width - 55) / 2,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnailContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    lineHeight: 18,
    marginBottom: 6,
  },
  channelName: {
    fontSize: 12,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: Colors.gray[500],
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.gray[400],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
    lineHeight: 20,
  },
});
