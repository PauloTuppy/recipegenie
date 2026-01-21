import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { loadVideoSearchResults, deleteVideoSearch } from '@/services/firebase';
import type { SavedVideoSearch, VideoSearchResult } from '@/types';

export default function SavedVideoSearchesScreen() {
  const router = useRouter();
  const [searches, setSearches] = useState<SavedVideoSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSearchId, setExpandedSearchId] = useState<string | null>(null);

  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = async () => {
    try {
      const loadedSearches = await loadVideoSearchResults();
      setSearches(loadedSearches);
    } catch (error) {
      console.error('Error loading searches:', error);
      Alert.alert('Error', 'Failed to load saved searches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSearch = (searchId: string, searchQuery: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Delete Search?',
      `Remove "${searchQuery}" from saved searches?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVideoSearch(searchId);
              setSearches((prev) => prev.filter((s) => s.id !== searchId));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting search:', error);
              Alert.alert('Error', 'Failed to delete search');
            }
          },
        },
      ]
    );
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
            router.push({
              pathname: '/(tabs)',
              params: { videoUrl: video.url },
            });
          },
        },
      ]
    );
  };

  const toggleExpand = (searchId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSearchId(expandedSearchId === searchId ? null : searchId);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        <Text style={styles.headerTitle}>Saved Searches</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading saved searches...</Text>
          </View>
        ) : searches.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Saved Searches</Text>
            <Text style={styles.emptyStateText}>
              Search for recipe videos to save them{'\n'}for quick access later
            </Text>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => router.push('/video-search')}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={18} color={Colors.white} />
              <Text style={styles.searchButtonText}>Start Searching</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              {searches.length} saved {searches.length === 1 ? 'search' : 'searches'}
            </Text>

            {searches.map((search) => {
              const isExpanded = expandedSearchId === search.id;
              return (
                <View key={search.id} style={styles.searchCard}>
                  <TouchableOpacity
                    style={styles.searchHeader}
                    onPress={() => toggleExpand(search.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.searchHeaderLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons name="search" size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.searchInfo}>
                        <Text style={styles.searchQuery}>{search.searchQuery}</Text>
                        <Text style={styles.searchMeta}>
                          {search.resultCount} videos • {formatDate(search.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.searchHeaderRight}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteSearch(search.id, search.searchQuery)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                      </TouchableOpacity>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={Colors.gray[400]}
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.videosContainer}>
                      <View style={styles.videoDivider} />
                      {search.results.map((video) => (
                        <TouchableOpacity
                          key={video.id}
                          style={styles.videoItem}
                          onPress={() => handleVideoSelect(video)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.videoThumbnail}>
                            <Ionicons name="play-circle" size={32} color={Colors.white} />
                            <View style={styles.videoDurationBadge}>
                              <Text style={styles.videoDurationText}>{video.duration}</Text>
                            </View>
                          </View>
                          <View style={styles.videoDetails}>
                            <Text style={styles.videoTitle} numberOfLines={2}>
                              {video.title}
                            </Text>
                            <Text style={styles.videoChannel} numberOfLines={1}>
                              {video.channelName}
                            </Text>
                            <Text style={styles.videoStats} numberOfLines={1}>
                              {video.viewCount} views • {video.publishedAt}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
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
  placeholder: {
    width: 40,
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
    fontSize: 15,
    color: Colors.gray[600],
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[600],
    marginBottom: 15,
  },
  searchCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  searchHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInfo: {
    flex: 1,
  },
  searchQuery: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  searchMeta: {
    fontSize: 13,
    color: Colors.gray[500],
  },
  searchHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  videoDivider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginHorizontal: 16,
  },
  videosContainer: {
    paddingBottom: 8,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  videoThumbnail: {
    width: 100,
    height: 70,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  videoDurationText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  videoDetails: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
    lineHeight: 18,
  },
  videoChannel: {
    fontSize: 12,
    color: Colors.gray[600],
    marginBottom: 2,
  },
  videoStats: {
    fontSize: 11,
    color: Colors.gray[500],
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
    marginBottom: 24,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
