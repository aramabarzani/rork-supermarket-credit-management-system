import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import type { Tutorial, TutorialStep } from '../../../../../types/guidance';

const tutorialStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  titleKu: z.string(),
  description: z.string(),
  descriptionKu: z.string(),
  order: z.number(),
  imageUrl: z.string().optional(),
});

const tutorialSchema = z.object({
  title: z.string(),
  titleKu: z.string(),
  description: z.string(),
  descriptionKu: z.string(),
  type: z.enum(['video', 'interactive', 'document']),
  role: z.enum(['admin', 'employee', 'customer']),
  videoUrl: z.string().optional(),
  documentUrl: z.string().optional(),
  steps: z.array(tutorialStepSchema).optional(),
  duration: z.number().optional(),
});

const mockTutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Getting Started as Admin',
    titleKu: 'دەستپێکردن وەک بەڕێوەبەر',
    description: 'Learn how to manage the system as an administrator',
    descriptionKu: 'فێربە چۆن سیستەم بەڕێوە ببەیت وەک بەڕێوەبەر',
    type: 'video',
    role: 'admin',
    videoUrl: 'https://example.com/admin-tutorial.mp4',
    duration: 600,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Employee Guide',
    titleKu: 'ڕێنمایی کارمەند',
    description: 'Complete guide for employees',
    descriptionKu: 'ڕێنمایی تەواو بۆ کارمەندان',
    type: 'interactive',
    role: 'employee',
    steps: [
      {
        id: '1',
        title: 'Add Debt',
        titleKu: 'زیادکردنی قەرز',
        description: 'Learn how to add debt',
        descriptionKu: 'فێربە چۆن قەرز زیاد بکەیت',
        order: 1,
      },
      {
        id: '2',
        title: 'Record Payment',
        titleKu: 'تۆمارکردنی پارەدان',
        description: 'Learn how to record payments',
        descriptionKu: 'فێربە چۆن پارەدان تۆمار بکەیت',
        order: 2,
      },
    ],
    duration: 300,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Customer Portal',
    titleKu: 'پۆرتاڵی کڕیار',
    description: 'How to use the customer portal',
    descriptionKu: 'چۆن پۆرتاڵی کڕیار بەکار بهێنیت',
    type: 'document',
    role: 'customer',
    documentUrl: 'https://example.com/customer-guide.pdf',
    duration: 180,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const tutorialsProcedure = publicProcedure
  .input(
    z.object({
      role: z.enum(['admin', 'employee', 'customer']).optional(),
    })
  )
  .query(({ input }) => {
    if (input.role) {
      return mockTutorials.filter((t) => t.role === input.role);
    }
    return mockTutorials;
  });

export const tutorialByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const tutorial = mockTutorials.find((t) => t.id === input.id);
    if (!tutorial) {
      throw new Error('Tutorial not found');
    }
    return tutorial;
  });

export const createTutorialProcedure = publicProcedure
  .input(tutorialSchema)
  .mutation(({ input }) => {
    const newTutorial: Tutorial = {
      id: Date.now().toString(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockTutorials.push(newTutorial);
    return newTutorial;
  });

export const updateTutorialProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      data: tutorialSchema.partial(),
    })
  )
  .mutation(({ input }) => {
    const index = mockTutorials.findIndex((t) => t.id === input.id);
    if (index === -1) {
      throw new Error('Tutorial not found');
    }
    mockTutorials[index] = {
      ...mockTutorials[index],
      ...input.data,
      updatedAt: new Date(),
    };
    return mockTutorials[index];
  });

export const deleteTutorialProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    const index = mockTutorials.findIndex((t) => t.id === input.id);
    if (index === -1) {
      throw new Error('Tutorial not found');
    }
    mockTutorials.splice(index, 1);
    return { success: true };
  });
