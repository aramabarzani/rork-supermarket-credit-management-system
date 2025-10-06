import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  TrendingDown,
  BarChart3,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  price: number;
  category: string;
  lastUpdated: string;
}

export default function InventoryManagementScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'کاڵای نموونە ١',
      quantity: 50,
      minQuantity: 10,
      price: 5000,
      category: 'خواردن',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'کاڵای نموونە ٢',
      quantity: 5,
      minQuantity: 10,
      price: 3000,
      category: 'خواردنەوە',
      lastUpdated: new Date().toISOString(),
    },
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    minQuantity: '',
    price: '',
    category: '',
  });

  const lowStockItems = items.filter(item => item.quantity <= item.minQuantity);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕبکەرەوە');
      return;
    }

    const item: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: parseInt(newItem.quantity),
      minQuantity: parseInt(newItem.minQuantity) || 0,
      price: parseFloat(newItem.price),
      category: newItem.category,
      lastUpdated: new Date().toISOString(),
    };

    setItems([...items, item]);
    setNewItem({ name: '', quantity: '', minQuantity: '', price: '', category: '' });
    setShowAddModal(false);
    Alert.alert('سەرکەوتوو', 'کاڵا زیادکرا');
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'دڵنیابوونەوە',
      'دڵنیایت لە سڕینەوەی ئەم کاڵایە؟',
      [
        { text: 'نەخێر', style: 'cancel' },
        {
          text: 'بەڵێ',
          style: 'destructive',
          onPress: () => setItems(items.filter(item => item.id !== id)),
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'بەڕێوەبردنی کۆگا' }} />
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان بە ناو یان جۆر..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="white" />
          <KurdishText variant="body" color="white">
            زیادکردنی کاڵا
          </KurdishText>
        </TouchableOpacity>
      </View>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <View style={styles.alertSection}>
          <GradientCard colors={['#FEF3C7', '#FDE68A']}>
            <View style={styles.alertHeader}>
              <AlertTriangle size={24} color="#F59E0B" />
              <KurdishText variant="subtitle" color="#92400E">
                ئاگاداری کۆگا
              </KurdishText>
            </View>
            <KurdishText variant="body" color="#78350F">
              {lowStockItems.length} کاڵا کەمە لە کۆگا
            </KurdishText>
          </GradientCard>
        </View>
      )}

      {/* Statistics */}
      <View style={styles.statsRow}>
        <GradientCard style={styles.statCard} colors={['#3B82F6', '#2563EB']}>
          <Package size={24} color="#3B82F6" />
          <KurdishText variant="body" color="#1F2937">
            {items.length}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            کۆی کاڵاکان
          </KurdishText>
        </GradientCard>

        <GradientCard style={styles.statCard} colors={['#EF4444', '#DC2626']}>
          <TrendingDown size={24} color="#EF4444" />
          <KurdishText variant="body" color="#1F2937">
            {lowStockItems.length}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            کاڵای کەم
          </KurdishText>
        </GradientCard>

        <GradientCard style={styles.statCard} colors={['#10B981', '#059669']}>
          <BarChart3 size={24} color="#10B981" />
          <KurdishText variant="body" color="#1F2937">
            {formatCurrency(items.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            نرخی گشتی
          </KurdishText>
        </GradientCard>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredItems.map(item => (
          <GradientCard key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <KurdishText variant="subtitle" color="#1F2937">
                  {item.name}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280">
                  {item.category}
                </KurdishText>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Edit size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteItem(item.id)}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.itemDetails}>
              <View style={styles.detailRow}>
                <KurdishText variant="caption" color="#6B7280">
                  بڕ:
                </KurdishText>
                <KurdishText
                  variant="body"
                  color={item.quantity <= item.minQuantity ? '#EF4444' : '#10B981'}
                >
                  {item.quantity}
                </KurdishText>
              </View>
              <View style={styles.detailRow}>
                <KurdishText variant="caption" color="#6B7280">
                  نرخ:
                </KurdishText>
                <KurdishText variant="body" color="#1F2937">
                  {formatCurrency(item.price)}
                </KurdishText>
              </View>
              <View style={styles.detailRow}>
                <KurdishText variant="caption" color="#6B7280">
                  کۆی نرخ:
                </KurdishText>
                <KurdishText variant="body" color="#10B981">
                  {formatCurrency(item.quantity * item.price)}
                </KurdishText>
              </View>
            </View>
          </GradientCard>
        ))}
      </ScrollView>

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <KurdishText variant="title" color="#1F2937" style={styles.modalTitle}>
              زیادکردنی کاڵای نوێ
            </KurdishText>

            <TextInput
              style={styles.input}
              placeholder="ناوی کاڵا"
              placeholderTextColor="#9CA3AF"
              value={newItem.name}
              onChangeText={(text) => setNewItem({ ...newItem, name: text })}
              textAlign="right"
            />

            <TextInput
              style={styles.input}
              placeholder="بڕ"
              placeholderTextColor="#9CA3AF"
              value={newItem.quantity}
              onChangeText={(text) => setNewItem({ ...newItem, quantity: text })}
              keyboardType="numeric"
              textAlign="right"
            />

            <TextInput
              style={styles.input}
              placeholder="کەمترین بڕ"
              placeholderTextColor="#9CA3AF"
              value={newItem.minQuantity}
              onChangeText={(text) => setNewItem({ ...newItem, minQuantity: text })}
              keyboardType="numeric"
              textAlign="right"
            />

            <TextInput
              style={styles.input}
              placeholder="نرخ"
              placeholderTextColor="#9CA3AF"
              value={newItem.price}
              onChangeText={(text) => setNewItem({ ...newItem, price: text })}
              keyboardType="numeric"
              textAlign="right"
            />

            <TextInput
              style={styles.input}
              placeholder="جۆر"
              placeholderTextColor="#9CA3AF"
              value={newItem.category}
              onChangeText={(text) => setNewItem({ ...newItem, category: text })}
              textAlign="right"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <KurdishText variant="body" color="#6B7280">
                  پاشگەزبوونەوە
                </KurdishText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddItem}
              >
                <KurdishText variant="body" color="white">
                  زیادکردن
                </KurdishText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  alertSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  itemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
  },
});
