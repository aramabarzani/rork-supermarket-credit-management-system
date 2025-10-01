import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import type { CustomForm, FormSubmission, FormAnalytics } from '../../../../../types/custom-forms';

const fieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number', 'date', 'datetime', 'select', 'multiselect', 'checkbox', 'textarea', 'phone', 'email', 'currency']),
  required: z.boolean(),
  placeholder: z.string().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
  validations: z.array(z.object({
    type: z.enum(['required', 'min', 'max', 'pattern', 'custom']),
    value: z.union([z.string(), z.number()]).optional(),
    message: z.string(),
  })).optional(),
  dependsOn: z.string().optional(),
  dependsOnValue: z.string().optional(),
  order: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});



let customForms: CustomForm[] = [];
let formSubmissions: FormSubmission[] = [];

export const getFormsProcedure = publicProcedure
  .input(z.object({
    type: z.enum(['debt', 'payment', 'customer', 'employee', 'custom']).optional(),
    isActive: z.boolean().optional(),
  }).optional())
  .query(({ input, ctx }) => {
    let filtered = customForms;

    if (input?.type) {
      filtered = filtered.filter(f => f.type === input.type);
    }

    if (input?.isActive !== undefined) {
      filtered = filtered.filter(f => f.isActive === input.isActive);
    }

    return filtered.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });

export const getFormByIdProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(({ input, ctx }) => {
    const form = customForms.find(f => f.id === input.id);
    if (!form) {
      throw new Error('فۆرم نەدۆزرایەوە');
    }
    return form;
  });

export const createFormProcedure = publicProcedure
  .input(z.object({
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['debt', 'payment', 'customer', 'employee', 'custom']),
    fields: z.array(fieldSchema),
  }))
  .mutation(({ input, ctx }) => {
    const newForm: CustomForm = {
      id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: input.name,
      description: input.description,
      type: input.type,
      fields: input.fields,
      isActive: true,
      createdBy: ctx.user?.id || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customForms.push(newForm);
    console.log('✅ فۆرمی نوێ دروستکرا:', newForm.name);
    return newForm;
  });

export const updateFormProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    fields: z.array(fieldSchema).optional(),
    isActive: z.boolean().optional(),
  }))
  .mutation(({ input }) => {
    const formIndex = customForms.findIndex(f => f.id === input.id);
    if (formIndex === -1) {
      throw new Error('فۆرم نەدۆزرایەوە');
    }

    const updatedForm: CustomForm = {
      ...customForms[formIndex],
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.fields && { fields: input.fields }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedAt: new Date().toISOString(),
    };

    customForms[formIndex] = updatedForm;
    console.log('✅ فۆرم نوێکرایەوە:', updatedForm.name);
    return updatedForm;
  });

export const deleteFormProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(({ input }) => {
    const formIndex = customForms.findIndex(f => f.id === input.id);
    if (formIndex === -1) {
      throw new Error('فۆرم نەدۆزرایەوە');
    }

    const deletedForm = customForms[formIndex];
    customForms.splice(formIndex, 1);
    
    formSubmissions = formSubmissions.filter(s => s.formId !== input.id);
    
    console.log('✅ فۆرم سڕایەوە:', deletedForm.name);
    return { success: true, deletedForm };
  });

export const addFieldProcedure = publicProcedure
  .input(z.object({
    formId: z.string(),
    field: fieldSchema,
  }))
  .mutation(({ input }) => {
    const formIndex = customForms.findIndex(f => f.id === input.formId);
    if (formIndex === -1) {
      throw new Error('فۆرم نەدۆزرایەوە');
    }

    customForms[formIndex].fields.push(input.field);
    customForms[formIndex].updatedAt = new Date().toISOString();
    
    console.log('✅ خانەی نوێ زیادکرا بۆ فۆرم:', customForms[formIndex].name);
    return customForms[formIndex];
  });

export const removeFieldProcedure = publicProcedure
  .input(z.object({
    formId: z.string(),
    fieldId: z.string(),
  }))
  .mutation(({ input }) => {
    const formIndex = customForms.findIndex(f => f.id === input.formId);
    if (formIndex === -1) {
      throw new Error('فۆرم نەدۆزرایەوە');
    }

    const fieldIndex = customForms[formIndex].fields.findIndex(f => f.id === input.fieldId);
    if (fieldIndex === -1) {
      throw new Error('خانە نەدۆزرایەوە');
    }

    customForms[formIndex].fields.splice(fieldIndex, 1);
    customForms[formIndex].updatedAt = new Date().toISOString();
    
    console.log('✅ خانە سڕایەوە لە فۆرم:', customForms[formIndex].name);
    return customForms[formIndex];
  });

export const updateFieldProcedure = publicProcedure
  .input(z.object({
    formId: z.string(),
    fieldId: z.string(),
    updates: fieldSchema.partial(),
  }))
  .mutation(({ input }) => {
    const formIndex = customForms.findIndex(f => f.id === input.formId);
    if (formIndex === -1) {
      throw new Error('فۆرم نەدۆزرایەوە');
    }

    const fieldIndex = customForms[formIndex].fields.findIndex(f => f.id === input.fieldId);
    if (fieldIndex === -1) {
      throw new Error('خانە نەدۆزرایەوە');
    }

    customForms[formIndex].fields[fieldIndex] = {
      ...customForms[formIndex].fields[fieldIndex],
      ...input.updates,
    };
    customForms[formIndex].updatedAt = new Date().toISOString();
    
    console.log('✅ خانە نوێکرایەوە لە فۆرم:', customForms[formIndex].name);
    return customForms[formIndex];
  });

export const submitFormProcedure = publicProcedure
  .input(z.object({
    formId: z.string(),
    data: z.record(z.string(), z.unknown()),
    relatedEntityId: z.string().optional(),
    relatedEntityType: z.enum(['customer', 'employee', 'debt', 'payment']).optional(),
  }))
  .mutation(({ input, ctx }) => {
    const form = customForms.find(f => f.id === input.formId);
    if (!form) {
      throw new Error('فۆرم نەدۆزرایەوە');
    }

    const submission: FormSubmission = {
      id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      formId: input.formId,
      formName: form.name,
      data: input.data,
      submittedBy: ctx.user?.id || 'system',
      submittedAt: new Date().toISOString(),
      relatedEntityId: input.relatedEntityId,
      relatedEntityType: input.relatedEntityType,
    };

    formSubmissions.push(submission);
    console.log('✅ فۆرم پڕکرایەوە:', form.name);
    return submission;
  });

export const getSubmissionsProcedure = publicProcedure
  .input(z.object({
    formId: z.string().optional(),
    relatedEntityId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional())
  .query(({ input, ctx }) => {
    let filtered = formSubmissions;

    if (input?.formId) {
      filtered = filtered.filter(s => s.formId === input.formId);
    }

    if (input?.relatedEntityId) {
      filtered = filtered.filter(s => s.relatedEntityId === input.relatedEntityId);
    }

    if (input?.startDate) {
      filtered = filtered.filter(s => s.submittedAt >= input.startDate!);
    }

    if (input?.endDate) {
      filtered = filtered.filter(s => s.submittedAt <= input.endDate!);
    }

    return filtered.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  });

export const getFormAnalyticsProcedure = publicProcedure
  .input(z.object({
    formId: z.string(),
  }))
  .query(({ input, ctx }) => {
    const form = customForms.find(f => f.id === input.formId);
    if (!form) {
      throw new Error('فۆرم نەدۆزرایەوە');
    }

    const submissions = formSubmissions.filter(s => s.formId === input.formId);

    const submissionsByDate: Record<string, number> = {};
    const submissionsByUser: Record<string, number> = {};
    const fieldUsageStats: Record<string, { filled: number; empty: number; uniqueValues: number }> = {};

    form.fields.forEach(field => {
      fieldUsageStats[field.name] = {
        filled: 0,
        empty: 0,
        uniqueValues: 0,
      };
    });

    submissions.forEach(submission => {
      const date = submission.submittedAt.split('T')[0];
      submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
      submissionsByUser[submission.submittedBy] = (submissionsByUser[submission.submittedBy] || 0) + 1;

      form.fields.forEach(field => {
        const value = submission.data[field.name];
        if (value !== undefined && value !== null && value !== '') {
          fieldUsageStats[field.name].filled++;
        } else {
          fieldUsageStats[field.name].empty++;
        }
      });
    });

    Object.keys(fieldUsageStats).forEach(fieldName => {
      const uniqueValues = new Set(
        submissions.map(s => s.data[fieldName]).filter(v => v !== undefined && v !== null && v !== '')
      );
      fieldUsageStats[fieldName].uniqueValues = uniqueValues.size;
    });

    const analytics: FormAnalytics = {
      formId: input.formId,
      totalSubmissions: submissions.length,
      submissionsByDate,
      submissionsByUser,
      averageCompletionTime: 0,
      fieldUsageStats,
    };

    return analytics;
  });

export const exportFormDataProcedure = publicProcedure
  .input(z.object({
    formId: z.string(),
    format: z.enum(['excel', 'pdf', 'json', 'csv']),
  }))
  .mutation(({ input }) => {
    const form = customForms.find(f => f.id === input.formId);
    if (!form) {
      throw new Error('فۆرم نەدۆزرایەوە');
    }

    const submissions = formSubmissions.filter(s => s.formId === input.formId);

    console.log(`✅ داتای فۆرم هەناردەکرێت بە ${input.format}:`, form.name);
    
    return {
      success: true,
      format: input.format,
      data: submissions,
      fileName: `${form.name}_${new Date().toISOString().split('T')[0]}.${input.format}`,
    };
  });
