import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, Edit2, Save, X, ArrowUp, ArrowDown } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { useCustomForms } from '@/hooks/custom-forms-context';
import type { CustomField, FieldType, FormType } from '@/types/custom-forms';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'دەق' },
  { value: 'number', label: 'ژمارە' },
  { value: 'currency', label: 'دراو' },
  { value: 'date', label: 'بەروار' },
  { value: 'datetime', label: 'بەروار و کات' },
  { value: 'select', label: 'هەڵبژاردن' },
  { value: 'checkbox', label: 'چێک بۆکس' },
  { value: 'textarea', label: 'دەقی درێژ' },
  { value: 'phone', label: 'ژمارەی تەلەفۆن' },
  { value: 'email', label: 'ئیمەیڵ' },
];

const FORM_TYPES: { value: FormType; label: string }[] = [
  { value: 'debt', label: 'قەرز' },
  { value: 'payment', label: 'پارەدان' },
  { value: 'customer', label: 'کڕیار' },
  { value: 'employee', label: 'کارمەند' },
  { value: 'custom', label: 'تایبەتی' },
];

export default function FormBuilderScreen() {
  const router = useRouter();
  const { createForm, isCreating } = useCustomForms();

  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formType, setFormType] = useState<FormType>('custom');
  const [fields, setFields] = useState<CustomField[]>([]);
  const [showFieldModal, setShowFieldModal] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  const [fieldName, setFieldName] = useState<string>('');
  const [fieldLabel, setFieldLabel] = useState<string>('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [fieldRequired, setFieldRequired] = useState<boolean>(false);
  const [fieldPlaceholder, setFieldPlaceholder] = useState<string>('');

  const handleAddField = () => {
    setEditingField(null);
    setFieldName('');
    setFieldLabel('');
    setFieldType('text');
    setFieldRequired(false);
    setFieldPlaceholder('');
    setShowFieldModal(true);
  };

  const handleEditField = (field: CustomField) => {
    setEditingField(field);
    setFieldName(field.name);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldRequired(field.required);
    setFieldPlaceholder(field.placeholder || '');
    setShowFieldModal(true);
  };

  const handleSaveField = () => {
    if (!fieldName || !fieldLabel) {
      Alert.alert('هەڵە', 'تکایە ناو و ناونیشانی خانە پڕ بکەرەوە');
      return;
    }

    const newField: CustomField = {
      id: editingField?.id || `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: fieldName,
      label: fieldLabel,
      type: fieldType,
      required: fieldRequired,
      placeholder: fieldPlaceholder,
      order: editingField?.order || fields.length,
    };

    if (editingField) {
      setFields(fields.map((f) => (f.id === editingField.id ? newField : f)));
    } else {
      setFields([...fields, newField]);
    }

    setShowFieldModal(false);
  };

  const handleDeleteField = (fieldId: string) => {
    Alert.alert('سڕینەوە', 'دڵنیایت لە سڕینەوەی ئەم خانەیە؟', [
      { text: 'نەخێر', style: 'cancel' },
      {
        text: 'بەڵێ',
        style: 'destructive',
        onPress: () => {
          setFields(fields.filter((f) => f.id !== fieldId));
        },
      },
    ]);
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newFields.length) return;

    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    newFields.forEach((field, idx) => {
      field.order = idx;
    });

    setFields(newFields);
  };

  const handleSaveForm = () => {
    if (!formName) {
      Alert.alert('هەڵە', 'تکایە ناوی فۆرم پڕ بکەرەوە');
      return;
    }

    if (fields.length === 0) {
      Alert.alert('هەڵە', 'تکایە لانیکەم یەک خانە زیاد بکە');
      return;
    }

    createForm(formName, formDescription, formType, fields);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'دروستکردنی فۆرمی نوێ',
          headerRight: () => (
            <TouchableOpacity onPress={handleSaveForm} disabled={isCreating}>
              <Save size={24} color={isCreating ? '#9CA3AF' : '#3B82F6'} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>زانیاری فۆرم</KurdishText>

          <View style={styles.inputGroup}>
            <KurdishText style={styles.label}>ناوی فۆرم *</KurdishText>
            <TextInput
              style={styles.input}
              value={formName}
              onChangeText={setFormName}
              placeholder="ناوی فۆرم بنووسە"
            />
          </View>

          <View style={styles.inputGroup}>
            <KurdishText style={styles.label}>وەسف</KurdishText>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={formDescription}
              onChangeText={setFormDescription}
              placeholder="وەسفی فۆرم بنووسە"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <KurdishText style={styles.label}>جۆری فۆرم</KurdishText>
            <View style={styles.typeContainer}>
              {FORM_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    formType === type.value && styles.typeOptionActive,
                  ]}
                  onPress={() => setFormType(type.value)}
                >
                  <KurdishText
                    style={[
                      styles.typeOptionText,
                      formType === type.value && styles.typeOptionTextActive,
                    ]}
                  >
                    {type.label}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KurdishText style={styles.sectionTitle}>خانەکان ({fields.length})</KurdishText>
            <TouchableOpacity style={styles.addButton} onPress={handleAddField}>
              <Plus size={20} color="#FFFFFF" />
              <KurdishText style={styles.addButtonText}>زیادکردنی خانە</KurdishText>
            </TouchableOpacity>
          </View>

          {fields.length === 0 ? (
            <View style={styles.emptyState}>
              <KurdishText style={styles.emptyStateText}>
                هیچ خانەیەک زیاد نەکراوە
              </KurdishText>
            </View>
          ) : (
            <View style={styles.fieldsList}>
              {fields.map((field, index) => (
                <View key={field.id} style={styles.fieldCard}>
                  <View style={styles.fieldInfo}>
                    <KurdishText style={styles.fieldLabel}>
                      {field.label}
                      {field.required && <Text style={styles.required}> *</Text>}
                    </KurdishText>
                    <KurdishText style={styles.fieldMeta}>
                      {FIELD_TYPES.find((t) => t.value === field.type)?.label} • {field.name}
                    </KurdishText>
                  </View>

                  <View style={styles.fieldActions}>
                    <TouchableOpacity
                      onPress={() => handleMoveField(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp size={20} color={index === 0 ? '#D1D5DB' : '#6B7280'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleMoveField(index, 'down')}
                      disabled={index === fields.length - 1}
                    >
                      <ArrowDown
                        size={20}
                        color={index === fields.length - 1 ? '#D1D5DB' : '#6B7280'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleEditField(field)}>
                      <Edit2 size={20} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteField(field.id)}>
                      <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showFieldModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <KurdishText style={styles.modalTitle}>
                {editingField ? 'دەستکاریکردنی خانە' : 'زیادکردنی خانەی نوێ'}
              </KurdishText>
              <TouchableOpacity onPress={() => setShowFieldModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <KurdishText style={styles.label}>ناوی خانە *</KurdishText>
                <TextInput
                  style={styles.input}
                  value={fieldName}
                  onChangeText={setFieldName}
                  placeholder="customer_name"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.label}>ناونیشانی خانە *</KurdishText>
                <TextInput
                  style={styles.input}
                  value={fieldLabel}
                  onChangeText={setFieldLabel}
                  placeholder="ناوی کڕیار"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.label}>جۆری خانە</KurdishText>
                <View style={styles.typeContainer}>
                  {FIELD_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeOption,
                        fieldType === type.value && styles.typeOptionActive,
                      ]}
                      onPress={() => setFieldType(type.value)}
                    >
                      <KurdishText
                        style={[
                          styles.typeOptionText,
                          fieldType === type.value && styles.typeOptionTextActive,
                        ]}
                      >
                        {type.label}
                      </KurdishText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.label}>Placeholder</KurdishText>
                <TextInput
                  style={styles.input}
                  value={fieldPlaceholder}
                  onChangeText={setFieldPlaceholder}
                  placeholder="ناوی کڕیار بنووسە"
                />
              </View>

              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setFieldRequired(!fieldRequired)}
                >
                  <View
                    style={[styles.checkboxBox, fieldRequired && styles.checkboxBoxActive]}
                  >
                    {fieldRequired && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <KurdishText style={styles.checkboxLabel}>خانەی پێویست</KurdishText>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowFieldModal(false)}
              >
                <KurdishText style={styles.modalButtonSecondaryText}>پاشگەزبوونەوە</KurdishText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleSaveField}>
                <KurdishText style={styles.modalButtonPrimaryText}>پاشەکەوتکردن</KurdishText>
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
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typeOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  fieldsList: {
    gap: 12,
  },
  fieldCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  fieldMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  required: {
    color: '#EF4444',
  },
  fieldActions: {
    flexDirection: 'row',
    gap: 12,
  },
  checkboxRow: {
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
