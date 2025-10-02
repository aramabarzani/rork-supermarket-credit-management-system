import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Plus, Edit3, Trash2, Save, X, Tag } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { safeStorage } from '@/utils/storage';

interface DebtCategory {
  id: string;
  name: string;
  icon: string;
  isCustom: boolean;
}

const DEFAULT_CATEGORIES: DebtCategory[] = [
  { id: 'mobile', name: 'موبایل', icon: '📱', isCustom: false },
  { id: 'food', name: 'خۆراک', icon: '🍽️', isCustom: false },
  { id: 'grocery', name: 'نووت', icon: '🛒', isCustom: false },
  { id: 'electronics', name: 'ئەلیکترۆنی', icon: '💻', isCustom: false },
  { id: 'clothing', name: 'جل و بەرگ', icon: '👕', isCustom: false },
  { id: 'medicine', name: 'دەرمان', icon: '💊', isCustom: false },
  { id: 'fuel', name: 'سووتەمەنی', icon: '⛽', isCustom: false },
  { id: 'services', name: 'خزمەتگوزاری', icon: '🔧', isCustom: false },
  { id: 'other', name: 'هیتر', icon: '📦', isCustom: false },
];

const STORAGE_KEY = 'debt_categories';

const EMOJI_SUGGESTIONS = [
  '📱', '🍽️', '🛒', '💻', '👕', '💊', '⛽', '🔧', '📦',
  '🏠', '🚗', '📚', '🎮', '⚽', '🎵', '🎨', '✈️', '🏥',
  '🏪', '🍕', '☕', '🎁', '💰', '📝', '🔑', '🛠️', '📞',
];

export default function DebtCategoriesManagementScreen() {

  const { hasPermission } = useAuth();
  
  const [categories, setCategories] = useState<DebtCategory[]>(DEFAULT_CATEGORIES);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const stored = await safeStorage.getItem<DebtCategory[]>(STORAGE_KEY, DEFAULT_CATEGORIES);
      if (stored && stored.length > 0) {
        setCategories(stored);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const saveCategories = async (newCategories: DebtCategory[]) => {
    try {
      await safeStorage.setItem(STORAGE_KEY, newCategories);
      setCategories(newCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
      Alert.alert('هەڵە', 'کێشە لە پاشەکەوتکردنی مۆرەکان');
    }
  };

  const handleAddCategory = async () => {
    if (!hasPermission(PERMISSIONS.EDIT_SETTINGS)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی بەڕێوەبردنی مۆرەکانت نییە');
      return;
    }

    if (!newCategoryName.trim()) {
      Alert.alert('تێبینی', 'تکایە ناوی مۆر بنووسە');
      return;
    }

    const newCategory: DebtCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      isCustom: true,
    };

    const updatedCategories = [...categories, newCategory];
    await saveCategories(updatedCategories);

    setNewCategoryName('');
    setNewCategoryIcon('📦');
    setIsAdding(false);
    Alert.alert('سەرکەوتوو', 'مۆری نوێ زیادکرا');
  };

  const handleEditCategory = async (category: DebtCategory) => {
    if (!hasPermission(PERMISSIONS.EDIT_SETTINGS)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی بەڕێوەبردنی مۆرەکانت نییە');
      return;
    }

    if (!category.isCustom) {
      Alert.alert('تێبینی', 'ناتوانیت مۆرە بنەڕەتیەکان دەستکاری بکەیت');
      return;
    }

    setEditingId(category.id);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
  };

  const handleSaveEdit = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('تێبینی', 'تکایە ناوی مۆر بنووسە');
      return;
    }

    const updatedCategories = categories.map(cat => 
      cat.id === editingId 
        ? { ...cat, name: newCategoryName.trim(), icon: newCategoryIcon }
        : cat
    );

    await saveCategories(updatedCategories);

    setEditingId(null);
    setNewCategoryName('');
    setNewCategoryIcon('📦');
    Alert.alert('سەرکەوتوو', 'مۆر نوێکرایەوە');
  };

  const handleDeleteCategory = async (category: DebtCategory) => {
    if (!hasPermission(PERMISSIONS.EDIT_SETTINGS)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی بەڕێوەبردنی مۆرەکانت نییە');
      return;
    }

    if (!category.isCustom) {
      Alert.alert('تێبینی', 'ناتوانیت مۆرە بنەڕەتیەکان بسڕیتەوە');
      return;
    }

    Alert.alert(
      'دڵنیابوونەوە',
      `دڵنیایت لە سڕینەوەی مۆری "${category.name}"؟`,
      [
        { text: 'نەخێر', style: 'cancel' },
        {
          text: 'بەڵێ',
          style: 'destructive',
          onPress: async () => {
            const updatedCategories = categories.filter(cat => cat.id !== category.id);
            await saveCategories(updatedCategories);
            Alert.alert('سەرکەوتوو', 'مۆر سڕایەوە');
          },
        },
      ]
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewCategoryName('');
    setNewCategoryIcon('📦');
  };

  const renderCategoryItem = ({ item }: { item: DebtCategory }) => {
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <GradientCard style={styles.categoryCard}>
          <View style={styles.editForm}>
            <View style={styles.emojiSelector}>
              <TouchableOpacity
                style={styles.emojiButton}
                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <KurdishText variant="body" style={{ fontSize: 32 }}>{newCategoryIcon}</KurdishText>
              </TouchableOpacity>
              {showEmojiPicker && (
                <View style={styles.emojiPicker}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {EMOJI_SUGGESTIONS.map((emoji, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.emojiOption}
                        onPress={() => {
                          setNewCategoryIcon(emoji);
                          setShowEmojiPicker(false);
                        }}
                      >
                        <KurdishText variant="body" style={{ fontSize: 24 }}>{emoji}</KurdishText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <TextInput
              style={styles.input}
              placeholder="ناوی مۆر"
              placeholderTextColor="#9CA3AF"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              textAlign="right"
            />

            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Save size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <X size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </GradientCard>
      );
    }

    return (
      <GradientCard style={styles.categoryCard}>
        <View style={styles.categoryContent}>
          <View style={styles.categoryInfo}>
            <View style={styles.iconContainer}>
              <KurdishText variant="body" style={{ fontSize: 24 }}>
                {item.icon}
              </KurdishText>
            </View>
            <View style={styles.categoryDetails}>
              <KurdishText variant="subtitle" color="#1F2937">
                {item.name}
              </KurdishText>
              <KurdishText variant="caption" color="#6B7280">
                {item.isCustom ? 'مۆری تایبەت' : 'مۆری بنەڕەتی'}
              </KurdishText>
            </View>
          </View>

          {item.isCustom && (
            <View style={styles.categoryActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditCategory(item)}
              >
                <Edit3 size={16} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteCategory(item)}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </GradientCard>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <KurdishText variant="title" color="#1F2937">بەڕێوەبردنی مۆرەکانی قەرز</KurdishText>
        {hasPermission(PERMISSIONS.EDIT_SETTINGS) && !isAdding && !editingId && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAdding(true)}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {isAdding && (
        <View style={styles.addSection}>
          <GradientCard style={styles.addForm}>
            <KurdishText variant="subtitle" color="#1F2937" style={{ marginBottom: 16 }}>زیادکردنی مۆری نوێ</KurdishText>

            <View style={styles.emojiSelector}>
              <TouchableOpacity
                style={styles.emojiButton}
                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <KurdishText variant="body" style={{ fontSize: 32 }}>{newCategoryIcon}</KurdishText>
              </TouchableOpacity>
              {showEmojiPicker && (
                <View style={styles.emojiPicker}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {EMOJI_SUGGESTIONS.map((emoji, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.emojiOption}
                        onPress={() => {
                          setNewCategoryIcon(emoji);
                          setShowEmojiPicker(false);
                        }}
                      >
                        <KurdishText variant="body" style={{ fontSize: 24 }}>{emoji}</KurdishText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <TextInput
              style={styles.input}
              placeholder="ناوی مۆر"
              placeholderTextColor="#9CA3AF"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              textAlign="right"
            />

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleAddCategory}
              >
                <KurdishText variant="body" color="white">زیادکردن</KurdishText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelFormButton]}
                onPress={handleCancelEdit}
              >
                <KurdishText variant="body" color="#6B7280">پاشگەزبوونەوە</KurdishText>
              </TouchableOpacity>
            </View>
          </GradientCard>
        </View>
      )}

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Tag size={48} color="#9CA3AF" />
            <KurdishText variant="body" color="#6B7280" style={{ marginTop: 16 }}>هیچ مۆرێک نییە</KurdishText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSection: {
    padding: 16,
  },
  addForm: {
    padding: 16,
  },
  emojiSelector: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emojiButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPicker: {
    marginTop: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    maxWidth: '100%',
  },
  emojiOption: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
  },
  cancelFormButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listContent: {
    padding: 16,
  },
  categoryCard: {
    marginBottom: 12,
  },
  categoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryDetails: {
    flex: 1,
    gap: 4,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  editForm: {
    gap: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
});
