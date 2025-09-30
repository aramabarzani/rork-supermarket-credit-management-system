import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { FileText, Plus, Search, Filter, Download, Trash2 } from 'lucide-react-native';
import { useNotes } from '@/hooks/notes-context';
import { NoteFilters } from '@/types/notes';

export default function NotesManagementScreen() {
  const { addNote, deleteNote, searchNotes, getStats, exportNotes } = useNotes();
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<NoteFilters>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState<{
    entityType: 'debt' | 'payment' | 'customer' | 'employee';
    entityId: string;
    content: string;
    isPrivate: boolean;
    tags: string[];
  }>({
    entityType: 'customer',
    entityId: '',
    content: '',
    isPrivate: false,
    tags: [],
  });

  const stats = getStats();
  const filteredNotes = searchNotes({ ...filters, searchText });

  const handleAddNote = async () => {
    if (!newNote.content || !newNote.entityId) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕ بکەرەوە');
      return;
    }

    await addNote({
      ...newNote,
      createdBy: 'admin',
      createdByName: 'بەڕێوەبەر',
    });

    setShowAddModal(false);
    setNewNote({
      entityType: 'customer',
      entityId: '',
      content: '',
      isPrivate: false,
      tags: [],
    });
    Alert.alert('سەرکەوتوو', 'یاداشت زیادکرا');
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert(
      'دڵنیایی',
      'دڵنیایت لە سڕینەوەی ئەم یاداشتە؟',
      [
        { text: 'نەخێر', style: 'cancel' },
        {
          text: 'بەڵێ',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(id);
            Alert.alert('سەرکەوتوو', 'یاداشت سڕایەوە');
          },
        },
      ]
    );
  };

  const handleExport = () => {
    const data = exportNotes('json');
    Alert.alert('هەناردە', 'داتاکان ئامادەن بۆ هەناردە');
    console.log('Export data:', data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'بەڕێوەبردنی یاداشتەکان',
          headerStyle: { backgroundColor: '#6366f1' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <FileText size={24} color="#6366f1" />
            <Text style={styles.statValue}>{stats.totalNotes}</Text>
            <Text style={styles.statLabel}>کۆی یاداشتەکان</Text>
          </View>
          <View style={styles.statCard}>
            <FileText size={24} color="#10b981" />
            <Text style={styles.statValue}>{stats.notesByType.customer}</Text>
            <Text style={styles.statLabel}>کڕیار</Text>
          </View>
          <View style={styles.statCard}>
            <FileText size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{stats.notesByType.debt}</Text>
            <Text style={styles.statLabel}>قەرز</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="گەڕان لە یاداشتەکان..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>فلتەرەکان</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filters.entityType === 'customer' && styles.filterChipActive,
                ]}
                onPress={() => setFilters({ ...filters, entityType: 'customer' })}
              >
                <Text style={styles.filterChipText}>کڕیار</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filters.entityType === 'debt' && styles.filterChipActive,
                ]}
                onPress={() => setFilters({ ...filters, entityType: 'debt' })}
              >
                <Text style={styles.filterChipText}>قەرز</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filters.entityType === 'payment' && styles.filterChipActive,
                ]}
                onPress={() => setFilters({ ...filters, entityType: 'payment' })}
              >
                <Text style={styles.filterChipText}>پارەدان</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddModal(true)}>
            <Plus size={20} color="#fff" />
            <Text style={styles.actionButtonText}>یاداشتی نوێ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleExport}>
            <Download size={20} color="#6366f1" />
            <Text style={styles.actionButtonSecondaryText}>هەناردە</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>یاداشتەکان ({filteredNotes.length})</Text>
          {filteredNotes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <View style={styles.noteTypeContainer}>
                  <View style={[styles.noteTypeBadge, { backgroundColor: getNoteTypeColor(note.entityType) }]}>
                    <Text style={styles.noteTypeBadgeText}>{getNoteTypeLabel(note.entityType)}</Text>
                  </View>
                  {note.isPrivate && (
                    <View style={styles.privateBadge}>
                      <Text style={styles.privateBadgeText}>تایبەتی</Text>
                    </View>
                  )}
                </View>
                <View style={styles.noteActions}>
                  <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.noteContent}>{note.content}</Text>
              <View style={styles.noteFooter}>
                <Text style={styles.noteAuthor}>{note.createdByName}</Text>
                <Text style={styles.noteDate}>
                  {new Date(note.createdAt).toLocaleDateString('ar-IQ')}
                </Text>
              </View>
              {note.tags && note.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {note.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {showAddModal && (
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>یاداشتی نوێ</Text>
              
              <Text style={styles.inputLabel}>جۆر</Text>
              <View style={styles.typeSelector}>
                {(['customer', 'debt', 'payment', 'employee'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      newNote.entityType === type && styles.typeOptionActive,
                    ]}
                    onPress={() => setNewNote({ ...newNote, entityType: type })}
                  >
                    <Text style={styles.typeOptionText}>{getNoteTypeLabel(type)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>ناسنامەی بابەت</Text>
              <TextInput
                style={styles.input}
                placeholder="ناسنامەی بابەت"
                value={newNote.entityId}
                onChangeText={(text) => setNewNote({ ...newNote, entityId: text })}
              />

              <Text style={styles.inputLabel}>ناوەرۆک</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="ناوەرۆکی یاداشت..."
                value={newNote.content}
                onChangeText={(text) => setNewNote({ ...newNote, content: text })}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setNewNote({ ...newNote, isPrivate: !newNote.isPrivate })}
              >
                <View style={[styles.checkbox, newNote.isPrivate && styles.checkboxChecked]}>
                  {newNote.isPrivate && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>یاداشتی تایبەتی</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleAddNote}
                >
                  <Text style={styles.modalButtonText}>زیادکردن</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.modalButtonSecondaryText}>پاشگەزبوونەوە</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getNoteTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    customer: 'کڕیار',
    debt: 'قەرز',
    payment: 'پارەدان',
    employee: 'کارمەند',
  };
  return labels[type] || type;
}

function getNoteTypeColor(type: string): string {
  const colors: Record<string, string> = {
    customer: '#10b981',
    debt: '#f59e0b',
    payment: '#3b82f6',
    employee: '#8b5cf6',
  };
  return colors[type] || '#6b7280';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1f2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
  },
  filterChipText: {
    fontSize: 14,
    color: '#1f2937',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  actionButtonSecondaryText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  notesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  noteTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noteTypeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  privateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ef4444',
  },
  privateBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  noteContent: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteAuthor: {
    fontSize: 14,
    color: '#6b7280',
  },
  noteDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  typeOptionActive: {
    backgroundColor: '#6366f1',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#1f2937',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
