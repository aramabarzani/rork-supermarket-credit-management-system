import { useState, useCallback, useMemo, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CustomForm, CustomField, FormType } from '@/types/custom-forms';

export const [CustomFormsProvider, useCustomForms] = createContextHook(() => {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const loadForms = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem('custom_forms');
      if (stored) {
        setForms(JSON.parse(stored));
      }
    } catch (error) {
      console.error('[Custom Forms] Failed to load forms:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const createForm = useCallback((name: string, description: string | undefined, type: FormType, fields: CustomField[]) => {
    const newForm: CustomForm = {
      id: Date.now().toString(),
      name,
      description,
      type,
      fields,
      isActive: true,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...forms, newForm];
    AsyncStorage.setItem('custom_forms', JSON.stringify(updated));
    setForms(updated);
  }, [forms]);

  const updateForm = useCallback((id: string, updates: Partial<CustomForm>) => {
    const updated = forms.map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f);
    AsyncStorage.setItem('custom_forms', JSON.stringify(updated));
    setForms(updated);
  }, [forms]);

  const deleteForm = useCallback(async (id: string) => {
    setIsDeleting(true);
    const updated = forms.filter(f => f.id !== id);
    await AsyncStorage.setItem('custom_forms', JSON.stringify(updated));
    setForms(updated);
    setIsDeleting(false);
  }, [forms]);

  const exportForm = useCallback(async (formId: string, format: 'excel' | 'pdf' | 'json' | 'csv') => {
    setIsExporting(true);
    console.log('Exporting form:', formId, format);
    setTimeout(() => setIsExporting(false), 1000);
  }, []);

  const addField = useCallback((formId: string, field: CustomField) => {
    const updated = forms.map(f => f.id === formId ? { ...f, fields: [...f.fields, field] } : f);
    AsyncStorage.setItem('custom_forms', JSON.stringify(updated));
    setForms(updated);
  }, [forms]);

  const removeField = useCallback((formId: string, fieldId: string) => {
    const updated = forms.map(f => f.id === formId ? { ...f, fields: f.fields.filter(field => field.id !== fieldId) } : f);
    AsyncStorage.setItem('custom_forms', JSON.stringify(updated));
    setForms(updated);
  }, [forms]);

  const updateField = useCallback((formId: string, fieldId: string, updates: Partial<CustomField>) => {
    const updated = forms.map(f => 
      f.id === formId 
        ? { ...f, fields: f.fields.map(field => field.id === fieldId ? { ...field, ...updates } : field) }
        : f
    );
    AsyncStorage.setItem('custom_forms', JSON.stringify(updated));
    setForms(updated);
  }, [forms]);

  const submitForm = useCallback((formId: string, data: Record<string, unknown>) => {
    console.log('Submitting form:', formId, data);
  }, []);

  const getFormsByType = useCallback((type: FormType) => {
    return forms.filter((form) => form.type === type);
  }, [forms]);

  const getActiveForm = useCallback((type: FormType) => {
    return forms.find((form) => form.type === type && form.isActive);
  }, [forms]);

  const setIsCreatingForm = useCallback(() => {}, []);
  const setIsEditingForm = useCallback(() => {}, []);

  return useMemo(() => ({
    forms,
    selectedForm,
    submissions: [],
    isLoading,
    isCreatingForm: false,
    isEditingForm: false,
    setSelectedForm,
    setIsCreatingForm,
    setIsEditingForm,
    createForm,
    updateForm,
    deleteForm,
    addField,
    removeField,
    updateField,
    submitForm,
    exportForm,
    getFormsByType,
    getActiveForm,
    isCreating: false,
    isUpdating: false,
    isDeleting,
    isSubmitting: false,
    isExporting,
  }), [forms, selectedForm, isLoading, isDeleting, isExporting, createForm, updateForm, deleteForm, addField, removeField, updateField, submitForm, exportForm, getFormsByType, getActiveForm, setIsCreatingForm, setIsEditingForm]);
});
