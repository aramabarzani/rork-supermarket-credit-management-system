import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';
import type { CustomForm, CustomField, FormType } from '@/types/custom-forms';

export const [CustomFormsProvider, useCustomForms] = createContextHook(() => {
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState<boolean>(false);
  const [isEditingForm, setIsEditingForm] = useState<boolean>(false);

  const formsQuery = trpc.forms.getAll.useQuery();
  const formByIdQuery = trpc.forms.getById.useQuery(
    { id: selectedForm?.id || '' },
    { enabled: !!selectedForm?.id }
  );
  const submissionsQuery = trpc.forms.getSubmissions.useQuery();

  const createFormMutation = trpc.forms.create.useMutation({
    onSuccess: () => {
      formsQuery.refetch();
      setIsCreatingForm(false);
      console.log('✅ فۆرمی نوێ دروستکرا');
    },
    onError: (error) => {
      console.error('❌ هەڵە لە دروستکردنی فۆرم:', error.message);
    },
  });

  const updateFormMutation = trpc.forms.update.useMutation({
    onSuccess: () => {
      formsQuery.refetch();
      if (selectedForm?.id) {
        formByIdQuery.refetch();
      }
      setIsEditingForm(false);
      console.log('✅ فۆرم نوێکرایەوە');
    },
    onError: (error) => {
      console.error('❌ هەڵە لە نوێکردنەوەی فۆرم:', error.message);
    },
  });

  const deleteFormMutation = trpc.forms.delete.useMutation({
    onSuccess: () => {
      formsQuery.refetch();
      setSelectedForm(null);
      console.log('✅ فۆرم سڕایەوە');
    },
    onError: (error) => {
      console.error('❌ هەڵە لە سڕینەوەی فۆرم:', error.message);
    },
  });

  const addFieldMutation = trpc.forms.addField.useMutation({
    onSuccess: () => {
      formsQuery.refetch();
      if (selectedForm?.id) {
        formByIdQuery.refetch();
      }
      console.log('✅ خانەی نوێ زیادکرا');
    },
    onError: (error) => {
      console.error('❌ هەڵە لە زیادکردنی خانە:', error.message);
    },
  });

  const removeFieldMutation = trpc.forms.removeField.useMutation({
    onSuccess: () => {
      formsQuery.refetch();
      if (selectedForm?.id) {
        formByIdQuery.refetch();
      }
      console.log('✅ خانە سڕایەوە');
    },
    onError: (error) => {
      console.error('❌ هەڵە لە سڕینەوەی خانە:', error.message);
    },
  });

  const updateFieldMutation = trpc.forms.updateField.useMutation({
    onSuccess: () => {
      formsQuery.refetch();
      if (selectedForm?.id) {
        formByIdQuery.refetch();
      }
      console.log('✅ خانە نوێکرایەوە');
    },
    onError: (error) => {
      console.error('❌ هەڵە لە نوێکردنەوەی خانە:', error.message);
    },
  });

  const submitFormMutation = trpc.forms.submit.useMutation({
    onSuccess: () => {
      submissionsQuery.refetch();
      console.log('✅ فۆرم پڕکرایەوە');
    },
    onError: (error) => {
      console.error('❌ هەڵە لە پڕکردنەوەی فۆرم:', error.message);
    },
  });

  const exportFormMutation = trpc.forms.export.useMutation({
    onSuccess: (data) => {
      console.log('✅ داتای فۆرم هەناردەکرا:', data.fileName);
    },
    onError: (error) => {
      console.error('❌ هەڵە لە هەناردەکردنی داتا:', error.message);
    },
  });

  const createForm = useCallback(
    (name: string, description: string | undefined, type: FormType, fields: CustomField[]) => {
      createFormMutation.mutate({ name, description, type, fields });
    },
    [createFormMutation]
  );

  const updateForm = useCallback(
    (id: string, updates: { name?: string; description?: string; fields?: CustomField[]; isActive?: boolean }) => {
      updateFormMutation.mutate({ id, ...updates });
    },
    [updateFormMutation]
  );

  const deleteForm = useCallback(
    (id: string) => {
      deleteFormMutation.mutate({ id });
    },
    [deleteFormMutation]
  );

  const addField = useCallback(
    (formId: string, field: CustomField) => {
      addFieldMutation.mutate({ formId, field });
    },
    [addFieldMutation]
  );

  const removeField = useCallback(
    (formId: string, fieldId: string) => {
      removeFieldMutation.mutate({ formId, fieldId });
    },
    [removeFieldMutation]
  );

  const updateField = useCallback(
    (formId: string, fieldId: string, updates: Partial<CustomField>) => {
      updateFieldMutation.mutate({ formId, fieldId, updates });
    },
    [updateFieldMutation]
  );

  const submitForm = useCallback(
    (
      formId: string,
      data: Record<string, unknown>,
      relatedEntityId?: string,
      relatedEntityType?: 'customer' | 'employee' | 'debt' | 'payment'
    ) => {
      submitFormMutation.mutate({ formId, data, relatedEntityId, relatedEntityType });
    },
    [submitFormMutation]
  );

  const exportForm = useCallback(
    (formId: string, format: 'excel' | 'pdf' | 'json' | 'csv') => {
      exportFormMutation.mutate({ formId, format });
    },
    [exportFormMutation]
  );

  const getFormsByType = useCallback(
    (type: FormType) => {
      return formsQuery.data?.filter((form) => form.type === type) || [];
    },
    [formsQuery.data]
  );

  const getActiveForm = useCallback(
    (type: FormType) => {
      return formsQuery.data?.find((form) => form.type === type && form.isActive);
    },
    [formsQuery.data]
  );

  return useMemo(() => ({
    forms: formsQuery.data || [],
    selectedForm: formByIdQuery.data || selectedForm,
    submissions: submissionsQuery.data || [],
    isLoading: formsQuery.isLoading || formByIdQuery.isLoading || submissionsQuery.isLoading,
    isCreatingForm,
    isEditingForm,
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
    isCreating: createFormMutation.isPending,
    isUpdating: updateFormMutation.isPending,
    isDeleting: deleteFormMutation.isPending,
    isSubmitting: submitFormMutation.isPending,
    isExporting: exportFormMutation.isPending,
  }), [
    formsQuery.data,
    formByIdQuery.data,
    selectedForm,
    submissionsQuery.data,
    formsQuery.isLoading,
    formByIdQuery.isLoading,
    submissionsQuery.isLoading,
    isCreatingForm,
    isEditingForm,
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
    createFormMutation.isPending,
    updateFormMutation.isPending,
    deleteFormMutation.isPending,
    submitFormMutation.isPending,
    exportFormMutation.isPending,
  ]);
});
