import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Edit3, Trash2, Tag } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function DebtCategoriesManagementScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<DebtCategory[]>(DEFAULT_CATEGORIES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [editingCategory, setEditingCategory] = useState<DebtCategory | null>(null);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem('debt_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCategories(parsed);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const saveCategories = async (updatedCategories: DebtCategory[]) => {
    try {
      await AsyncStorage.setItem('debt_categories', JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('تێبینی', 'تکایە ناوی مۆر بنووسە');
      return;
    }

    const newCategory: DebtCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.trim(),
      icon: newCategoryIcon.trim() || '📦',
      isCustom: true,
    };

    const updatedCategories = [...categories, newCategory];
    await saveCategories(updatedCategories);
    
    setNewCategoryName('');
    setNewCategoryIcon('');
    setShowAddForm(false);
    Alert.alert('سەرکەوتوو', 'مۆری نوێ زیادکرا');
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      Alert.alert('تێبینی', 'تکایە ناوی مۆر بنووسە');
      return;
    }

    const updatedCategories = categories.map(cat =>
      cat.id === editingCategory.id
        ? { ...cat, name: newCategoryName.trim(), icon: newCategoryIcon.trim() || cat.icon }
        : cat
    );

    await saveCategories(updatedCategories);
    
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryIcon('');
    Alert.alert('سەرکەوتوو', 'مۆر نوێکرایەوە');
  };

  const handleDeleteCategory = (category: DebtCategory) => {
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

  const startEdit = (category: DebtCategory) => {
    if (!category.isCustom) {
      Alert.alert('تێبینی', 'ناتوانیت مۆرە بنەڕەتیەکان دەستکاری بکەیت');
      return;
    }
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryIcon('');
    setShowAddForm(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <KurdishText variant="title" color="#1F2937">
          بەڕێوەبردنی مۆری قەرز
        </KurdishText>
        <TouchableOpacity
          onPress={() => {
            setShowAddForm(!showAddForm);
            setEditingCategory(null);
            setNewCategoryName('');
            setNewCategoryIcon('');
          }}
          style={styles.addButton}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {(showAddForm || editingCategory) && (
          <GradientCard style={styles.formCard}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.formTitle}>
              {editingCategory ? 'دەستکاری مۆر' : 'زیادکردنی مۆری نوێ'}
            </KurdishText>

            <View style={styles.inputGroup}>
              <KurdishText variant="body" color="#6B7280">
                ناوی مۆر
              </KurdishText>
              <TextInput
                style={styles.input}
                placeholder="ناوی مۆر بنووسە"
                placeholderTextColor="#9CA3AF"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <KurdishText variant="body" color="#6B7280">
                ئایکۆن (emoji)
              </KurdishText>
              <TextInput
                style={styles.input}
                placeholder="📦"
                placeholderTextColor="#9CA3AF"
                value={newCategoryIcon}
                onChangeText={setNewCategoryIcon}
                textAlign="center"
                maxLength={2}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={editingCategory ? handleEditCategory : handleAddCategory}
              >
                <KurdishText variant="body" color="white">
                  {editingCategory ? 'نوێکردنەوە' : 'زیادکردن'}
                </KurdishText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={cancelEdit}
              >
                <KurdishText variant="body" color="#6B7280">
                  پاشگەزبوونەوە
                </KurdishText>
              </TouchableOpacity>
            </View>
          </GradientCard>
        )}

        <GradientCard style={styles.infoCard}>
          <Tag size={32} color="#1E3A8A" />
          <KurdishText variant="body" color="#1F2937" style={{ marginTop: 12, textAlign: 'center' }}>
            بەڕێوەبردنی مۆرەکانی قەرز
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280" style={{ marginTop: 8, textAlign: 'center' }}>
            زیادکردن، دەستکاری و سڕینەوەی مۆرەکانی قەرز
          </KurdishText>
        </GradientCard>

        <View style={styles.categoriesGrid}>
          {categories.map(category => (
            <GradientCard key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <KurdishText variant="title" color="#1F2937" style={{ fontSize: 32 }}>
                    {category.icon}
                  </KurdishText>
                  <KurdishText variant="subtitle" color="#1F2937" style={{ marginTop: 8 }}>
                    {category.name}
                  </KurdishText>
                  {category.isCustom && (
                    <View style={styles.customBadge}>
                      <KurdishText variant="caption" color="#10B981">
                        تایبەتی
                      </KurdishText>
                    </View>
                  )}
                </View>
              </View>

              {category.isCustom && (
                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editActionButton]}
                    onPress={() => startEdit(category)}
                  >
                    <Edit3 size={16} color="#3B82F6" />
                    <KurdishText variant="caption" color="#3B82F6">
                      دەستکاری
                    </KurdishText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteActionButton]}
                    onPress={() => handleDeleteCategory(category)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <KurdishText variant="caption" color="#EF4444">
                      سڕینەوە
                    </KurdishText>
                  </TouchableOpacity>
                </View>
              )}
            </GradientCard>
          ))}
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  formCard: {
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    marginTop: 8,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    alignItems: 'center',
  },
  customBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editActionButton: {
    backgroundColor: '#DBEAFE',
  },
  deleteActionButton: {
    backgroundColor: '#FEE2E2',
  },
});
