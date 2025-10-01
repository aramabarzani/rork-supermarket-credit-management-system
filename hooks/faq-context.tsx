import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAQItem, FAQCategory, FAQStats, FAQFilter } from '@/types/faq';

const FAQ_KEY = 'faq_items';

export const [FAQProvider, useFAQ] = createContextHook(() => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAQ_KEY);
      if (stored) {
        setFaqs(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFAQs = async (updatedFAQs: FAQItem[]) => {
    try {
      await AsyncStorage.setItem(FAQ_KEY, JSON.stringify(updatedFAQs));
      setFaqs(updatedFAQs);
    } catch (error) {
      console.error('Failed to save FAQs:', error);
      throw error;
    }
  };

  const createFAQ = useCallback(async (
    question: string,
    questionKurdish: string,
    answer: string,
    answerKurdish: string,
    category: FAQCategory,
    tags: string[],
    createdBy: string
  ) => {
    const newFAQ: FAQItem = {
      id: `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question,
      questionKurdish,
      answer,
      answerKurdish,
      category,
      tags,
      order: faqs.length,
      isPublished: false,
      views: 0,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
    };

    await saveFAQs([...faqs, newFAQ]);
    return newFAQ;
  }, [faqs]);

  const updateFAQ = useCallback(async (id: string, updates: Partial<FAQItem>, updatedBy: string) => {
    const updated = faqs.map(faq =>
      faq.id === id
        ? { ...faq, ...updates, updatedAt: new Date().toISOString(), updatedBy }
        : faq
    );
    await saveFAQs(updated);
  }, [faqs]);

  const deleteFAQ = useCallback(async (id: string) => {
    const updated = faqs.filter(faq => faq.id !== id);
    await saveFAQs(updated);
  }, [faqs]);

  const publishFAQ = useCallback(async (id: string) => {
    await updateFAQ(id, { isPublished: true }, 'system');
  }, [updateFAQ]);

  const unpublishFAQ = useCallback(async (id: string) => {
    await updateFAQ(id, { isPublished: false }, 'system');
  }, [updateFAQ]);

  const incrementViews = useCallback(async (id: string) => {
    const faq = faqs.find(f => f.id === id);
    if (faq) {
      await updateFAQ(id, { views: faq.views + 1 }, 'system');
    }
  }, [faqs, updateFAQ]);

  const markHelpful = useCallback(async (id: string) => {
    const faq = faqs.find(f => f.id === id);
    if (faq) {
      await updateFAQ(id, { helpful: faq.helpful + 1 }, 'system');
    }
  }, [faqs, updateFAQ]);

  const markNotHelpful = useCallback(async (id: string) => {
    const faq = faqs.find(f => f.id === id);
    if (faq) {
      await updateFAQ(id, { notHelpful: faq.notHelpful + 1 }, 'system');
    }
  }, [faqs, updateFAQ]);

  const reorderFAQs = useCallback(async (faqIds: string[]) => {
    const updated = faqs.map(faq => {
      const newOrder = faqIds.indexOf(faq.id);
      return newOrder !== -1 ? { ...faq, order: newOrder } : faq;
    });
    await saveFAQs(updated.sort((a, b) => a.order - b.order));
  }, [faqs]);

  const getFAQById = useCallback((id: string) => {
    return faqs.find(faq => faq.id === id);
  }, [faqs]);

  const getPublishedFAQs = useCallback(() => {
    return faqs.filter(faq => faq.isPublished).sort((a, b) => a.order - b.order);
  }, [faqs]);

  const getFAQsByCategory = useCallback((category: FAQCategory) => {
    return faqs.filter(faq => faq.category === category && faq.isPublished).sort((a, b) => a.order - b.order);
  }, [faqs]);

  const searchFAQs = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return faqs.filter(faq =>
      faq.isPublished && (
        faq.question.toLowerCase().includes(lowerQuery) ||
        faq.questionKurdish.toLowerCase().includes(lowerQuery) ||
        faq.answer.toLowerCase().includes(lowerQuery) ||
        faq.answerKurdish.toLowerCase().includes(lowerQuery) ||
        faq.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    );
  }, [faqs]);

  const getFilteredFAQs = useCallback((filter: FAQFilter) => {
    return faqs.filter(faq => {
      if (filter.category && filter.category.length > 0 && !filter.category.includes(faq.category)) {
        return false;
      }
      if (filter.isPublished !== undefined && faq.isPublished !== filter.isPublished) {
        return false;
      }
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some(tag => faq.tags.includes(tag));
        if (!hasTag) return false;
      }
      if (filter.searchQuery) {
        const lowerQuery = filter.searchQuery.toLowerCase();
        const matches = 
          faq.question.toLowerCase().includes(lowerQuery) ||
          faq.questionKurdish.toLowerCase().includes(lowerQuery) ||
          faq.answer.toLowerCase().includes(lowerQuery) ||
          faq.answerKurdish.toLowerCase().includes(lowerQuery) ||
          faq.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => a.order - b.order);
  }, [faqs]);

  const getFAQStats = useCallback((): FAQStats => {
    const publishedFAQs = faqs.filter(f => f.isPublished);
    const totalViews = faqs.reduce((sum, f) => sum + f.views, 0);
    const totalHelpful = faqs.reduce((sum, f) => sum + f.helpful, 0);
    const totalNotHelpful = faqs.reduce((sum, f) => sum + f.notHelpful, 0);
    const totalFeedback = totalHelpful + totalNotHelpful;
    const averageHelpfulness = totalFeedback > 0 ? (totalHelpful / totalFeedback) * 100 : 0;

    const categoryMap = new Map<FAQCategory, number>();
    faqs.forEach(faq => {
      categoryMap.set(faq.category, (categoryMap.get(faq.category) || 0) + 1);
    });

    const faqsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));

    const topViewedFAQs = [...faqs]
      .filter(f => f.isPublished)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const topHelpfulFAQs = [...faqs]
      .filter(f => f.isPublished && (f.helpful + f.notHelpful) > 0)
      .sort((a, b) => {
        const aRatio = a.helpful / (a.helpful + a.notHelpful);
        const bRatio = b.helpful / (b.helpful + b.notHelpful);
        return bRatio - aRatio;
      })
      .slice(0, 5);

    return {
      totalFAQs: faqs.length,
      publishedFAQs: publishedFAQs.length,
      totalViews,
      totalHelpful,
      totalNotHelpful,
      averageHelpfulness,
      faqsByCategory,
      topViewedFAQs,
      topHelpfulFAQs,
    };
  }, [faqs]);

  const getAllTags = useCallback(() => {
    const tagSet = new Set<string>();
    faqs.forEach(faq => {
      faq.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [faqs]);

  return useMemo(() => ({
    faqs,
    isLoading,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    publishFAQ,
    unpublishFAQ,
    incrementViews,
    markHelpful,
    markNotHelpful,
    reorderFAQs,
    getFAQById,
    getPublishedFAQs,
    getFAQsByCategory,
    searchFAQs,
    getFilteredFAQs,
    getFAQStats,
    getAllTags,
  }), [
    faqs,
    isLoading,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    publishFAQ,
    unpublishFAQ,
    incrementViews,
    markHelpful,
    markNotHelpful,
    reorderFAQs,
    getFAQById,
    getPublishedFAQs,
    getFAQsByCategory,
    searchFAQs,
    getFilteredFAQs,
    getFAQStats,
    getAllTags,
  ]);
});
