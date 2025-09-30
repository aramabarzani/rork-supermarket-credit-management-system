import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { CustomField, CustomForm } from '@/types/custom-forms';
import { KurdishText } from './KurdishText';

type DynamicFormRendererProps = {
  form: CustomForm;
  onSubmit: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
  isSubmitting?: boolean;
};

export function DynamicFormRenderer({ form, onSubmit, initialData = {}, isSubmitting = false }: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sortedFields = useMemo(() => {
    return [...form.fields].sort((a, b) => a.order - b.order);
  }, [form.fields]);

  const validateField = (field: CustomField, value: unknown): string | null => {
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} پێویستە`;
    }

    if (field.validations) {
      for (const validation of field.validations) {
        switch (validation.type) {
          case 'min':
            if (typeof value === 'number' && typeof validation.value === 'number' && value < validation.value) {
              return validation.message;
            }
            if (typeof value === 'string' && typeof validation.value === 'number' && value.length < validation.value) {
              return validation.message;
            }
            break;
          case 'max':
            if (typeof value === 'number' && typeof validation.value === 'number' && value > validation.value) {
              return validation.message;
            }
            if (typeof value === 'string' && typeof validation.value === 'number' && value.length > validation.value) {
              return validation.message;
            }
            break;
          case 'pattern':
            if (typeof value === 'string' && typeof validation.value === 'string') {
              const regex = new RegExp(validation.value);
              if (!regex.test(value)) {
                return validation.message;
              }
            }
            break;
        }
      }
    }

    return null;
  };

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    
    const field = form.fields.find((f) => f.name === fieldName);
    if (field) {
      const error = validateField(field, value);
      setErrors((prev) => {
        if (error) {
          return { ...prev, [fieldName]: error };
        } else {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        }
      });
    }
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    for (const field of form.fields) {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const shouldShowField = (field: CustomField): boolean => {
    if (!field.dependsOn) return true;
    
    const dependentValue = formData[field.dependsOn];
    return dependentValue === field.dependsOnValue;
  };

  const renderField = (field: CustomField) => {
    if (!shouldShowField(field)) return null;

    const value = formData[field.name];
    const error = errors[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <KurdishText style={styles.label}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </KurdishText>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={value as string || ''}
              onChangeText={(text) => handleFieldChange(field.name, text)}
              placeholder={field.placeholder}
              keyboardType={field.type === 'phone' ? 'phone-pad' : field.type === 'email' ? 'email-address' : 'default'}
            />
            {error && <Text style={styles.errorText}><KurdishText>{error}</KurdishText></Text>}
          </View>
        );

      case 'number':
      case 'currency':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <KurdishText style={styles.label}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </KurdishText>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={value?.toString() || ''}
              onChangeText={(text) => handleFieldChange(field.name, parseFloat(text) || 0)}
              placeholder={field.placeholder}
              keyboardType="numeric"
            />
            {error && <Text style={styles.errorText}><KurdishText>{error}</KurdishText></Text>}
          </View>
        );

      case 'textarea':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <KurdishText style={styles.label}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </KurdishText>
            <TextInput
              style={[styles.input, styles.textarea, error && styles.inputError]}
              value={value as string || ''}
              onChangeText={(text) => handleFieldChange(field.name, text)}
              placeholder={field.placeholder}
              multiline
              numberOfLines={4}
            />
            {error && <Text style={styles.errorText}><KurdishText>{error}</KurdishText></Text>}
          </View>
        );

      case 'checkbox':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <View style={styles.checkboxRow}>
              <Switch
                value={value as boolean || false}
                onValueChange={(checked) => handleFieldChange(field.name, checked)}
              />
              <KurdishText style={styles.checkboxLabel}>
                {field.label}
                {field.required && <Text style={styles.required}> *</Text>}
              </KurdishText>
            </View>
            {error && <Text style={styles.errorText}><KurdishText>{error}</KurdishText></Text>}
          </View>
        );

      case 'select':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <KurdishText style={styles.label}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </KurdishText>
            <View style={styles.selectContainer}>
              {field.options?.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.selectOption,
                    value === option.value && styles.selectOptionActive,
                  ]}
                  onPress={() => handleFieldChange(field.name, option.value)}
                >
                  <KurdishText
                    style={[
                      styles.selectOptionText,
                      value === option.value && styles.selectOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
            {error && <Text style={styles.errorText}><KurdishText>{error}</KurdishText></Text>}
          </View>
        );

      case 'date':
      case 'datetime':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <KurdishText style={styles.label}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </KurdishText>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={value as string || ''}
              onChangeText={(text) => handleFieldChange(field.name, text)}
              placeholder={field.placeholder || 'YYYY-MM-DD'}
            />
            {error && <Text style={styles.errorText}><KurdishText>{error}</KurdishText></Text>}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <KurdishText style={styles.title}>{form.name}</KurdishText>
        {form.description && (
          <KurdishText style={styles.description}>{form.description}</KurdishText>
        )}
      </View>

      <View style={styles.fieldsContainer}>
        {sortedFields.map((field) => renderField(field))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <KurdishText style={styles.submitButtonText}>
          {isSubmitting ? 'تکایە چاوەڕێ بە...' : 'ناردن'}
        </KurdishText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
  },
  fieldsContainer: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
  },
  selectOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  selectOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
