import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { isPremium, parsesUsed, parsesLimit, restore } = useSubscription();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/paywall');
  };

  const handleManageSubscription = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Manage Subscription',
      'What would you like to do?',
      [
        {
          text: 'Restore Purchases',
          onPress: async () => {
            const success = await restore();
            if (success) {
              Alert.alert('Success', 'Your subscription has been restored!');
            } else {
              Alert.alert('No Subscription', 'No active subscription found.');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const toggleNotifications = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Subscription Status */}
        <View style={styles.section}>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionBadge}>
                <Ionicons
                  name={isPremium ? 'star' : 'star-outline'}
                  size={20}
                  color={isPremium ? Colors.white : Colors.primary}
                />
                <Text style={[styles.badgeText, isPremium && styles.badgeTextPremium]}>
                  {isPremium ? 'Premium' : 'Free'}
                </Text>
              </View>
            </View>

            {!isPremium && (
              <>
                <Text style={styles.subscriptionTitle}>Weekly Parse Usage</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(parsesUsed / parsesLimit) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {parsesUsed} / {parsesLimit} parses used
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={handleUpgrade}
                  activeOpacity={0.8}
                >
                  <Ionicons name="rocket" size={20} color={Colors.white} />
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium - $3.99/month</Text>
                </TouchableOpacity>

                <View style={styles.benefitsList}>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text style={styles.benefitText}>Unlimited recipe parsing</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text style={styles.benefitText}>AI-powered meal planning</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text style={styles.benefitText}>Smart grocery categorization</Text>
                  </View>
                </View>
              </>
            )}

            {isPremium && (
              <>
                <Text style={styles.subscriptionTitle}>Premium Member</Text>
                <Text style={styles.subscriptionDescription}>
                  You have unlimited access to all features
                </Text>
                <TouchableOpacity
                  style={styles.manageButton}
                  onPress={handleManageSubscription}
                  activeOpacity={0.8}
                >
                  <Text style={styles.manageButtonText}>Manage Subscription</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={22} color={Colors.primary} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: Colors.gray[300], true: Colors.sage }}
              thumbColor={Colors.white}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="restaurant" size={22} color={Colors.primary} />
              <Text style={styles.settingText}>Dietary Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={22} color={Colors.primary} />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle" size={22} color={Colors.primary} />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark" size={22} color={Colors.primary} />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text" size={22} color={Colors.primary} />
              <Text style={styles.settingText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Recipegenie v1.0.0</Text>
          <Text style={styles.versionSubtext}>Powered by Newell AI</Text>
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
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.black,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 12,
  },
  subscriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subscriptionHeader: {
    marginBottom: 15,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  badgeTextPremium: {
    color: Colors.white,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 12,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 13,
    color: Colors.gray[600],
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 15,
  },
  upgradeButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  benefitsList: {
    gap: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  manageButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.black,
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 11,
    color: Colors.gray[400],
  },
});
