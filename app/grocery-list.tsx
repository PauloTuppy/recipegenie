import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import type { GroceryList, GroceryCategory, GroceryItem } from '@/types';

export default function GroceryListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Mock grocery list data (organized by category)
  const [groceryList, setGroceryList] = useState<GroceryList>({
    Produce: [
      {
        id: '1',
        name: 'Garlic',
        quantity: 1,
        unit: 'head',
        category: 'Produce',
        checked: false,
      },
      {
        id: '2',
        name: 'Lemon',
        quantity: 2,
        unit: '',
        category: 'Produce',
        checked: false,
      },
      {
        id: '3',
        name: 'Fresh Parsley',
        quantity: 1,
        unit: 'bunch',
        category: 'Produce',
        checked: false,
      },
    ],
    'Dairy & Eggs': [
      {
        id: '4',
        name: 'Eggs',
        quantity: 1,
        unit: 'dozen',
        category: 'Dairy & Eggs',
        checked: false,
      },
      {
        id: '5',
        name: 'Milk',
        quantity: 1,
        unit: 'gallon',
        category: 'Dairy & Eggs',
        checked: true,
      },
    ],
    Pantry: [
      {
        id: '6',
        name: 'Olive Oil',
        quantity: 1,
        unit: 'bottle',
        category: 'Pantry',
        checked: false,
      },
      {
        id: '7',
        name: 'Panko Breadcrumbs',
        quantity: 1,
        unit: 'box',
        category: 'Pantry',
        checked: false,
      },
    ],
  });

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const toggleItem = (category: GroceryCategory, itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGroceryList((prev) => ({
      ...prev,
      [category]: prev[category]?.map((item: GroceryItem) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const incrementQuantity = (category: GroceryCategory, itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGroceryList((prev) => ({
      ...prev,
      [category]: prev[category]?.map((item: GroceryItem) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      ),
    }));
  };

  const decrementQuantity = (category: GroceryCategory, itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGroceryList((prev) => ({
      ...prev,
      [category]: prev[category]?.map((item: GroceryItem) =>
        item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      ),
    }));
  };

  const deleteItem = (category: GroceryCategory, itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGroceryList((prev) => ({
      ...prev,
      [category]: prev[category]?.filter((item: GroceryItem) => item.id !== itemId),
    }));
  };

  const clearCheckedItems = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Clear Checked Items', 'Remove all checked items from the list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          const newList: GroceryList = {};
          Object.keys(groceryList).forEach((category) => {
            const items = groceryList[category as GroceryCategory];
            const uncheckedItems = items?.filter((item: GroceryItem) => !item.checked);
            if (uncheckedItems && uncheckedItems.length > 0) {
              newList[category as GroceryCategory] = uncheckedItems;
            }
          });
          setGroceryList(newList);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const shareList = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let message = 'Grocery List\n\n';
    Object.keys(groceryList).forEach((category) => {
      const items = groceryList[category as GroceryCategory];
      if (items && items.length > 0) {
        message += `${category}:\n`;
        items.forEach((item: GroceryItem) => {
          const quantityStr = item.quantity > 0 ? `${item.quantity} ${item.unit} ` : '';
          message += `• ${quantityStr}${item.name}\n`;
        });
        message += '\n';
      }
    });

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const categories = Object.keys(groceryList) as GroceryCategory[];
  const totalItems = categories.reduce(
    (sum, cat) => sum + (groceryList[cat]?.length || 0),
    0
  );
  const checkedItems = categories.reduce(
    (sum, cat) => sum + (groceryList[cat]?.filter((item: GroceryItem) => item.checked).length || 0),
    0
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Grocery List</Text>
          <Text style={styles.headerSubtitle}>
            {checkedItems} of {totalItems} items
          </Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={shareList} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.aiNote}>AI-organized by Newell into store sections.</Text>

      {/* Grocery List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => {
          const items = groceryList[category];
          if (!items || items.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category}</Text>
              </View>

              {items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  {/* Checkbox */}
                  <TouchableOpacity
                    style={[styles.checkbox, item.checked && styles.checkboxChecked]}
                    onPress={() => toggleItem(category, item.id)}
                    activeOpacity={0.7}
                  >
                    {item.checked && <Ionicons name="checkmark" size={18} color={Colors.white} />}
                  </TouchableOpacity>

                  {/* Item Info */}
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                      {item.name}
                    </Text>
                  </View>

                  {/* Quantity Controls */}
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => decrementQuantity(category, item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove-circle-outline" size={24} color={Colors.gray[400]} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>
                      {item.quantity} {item.unit}
                    </Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => incrementQuantity(category, item.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteItem(category, item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearCheckedItems}
          disabled={checkedItems === 0}
          activeOpacity={0.8}
        >
          <Ionicons name="trash" size={18} color={checkedItems === 0 ? Colors.gray[400] : Colors.error} />
          <Text style={[styles.clearButtonText, checkedItems === 0 && styles.clearButtonTextDisabled]}>
            Clear Checked Items
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 2,
  },
  shareButton: {
    padding: 4,
  },
  aiNote: {
    fontSize: 11,
    color: Colors.gray[500],
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    backgroundColor: Colors.sage,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
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
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.black,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: Colors.gray[400],
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    padding: 2,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    minWidth: 50,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: Colors.cream,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
  },
  clearButtonTextDisabled: {
    color: Colors.gray[400],
  },
});
