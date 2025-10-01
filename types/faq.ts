export interface FAQItem {
  id: string;
  question: string;
  questionKurdish: string;
  answer: string;
  answerKurdish: string;
  category: FAQCategory;
  tags: string[];
  order: number;
  isPublished: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export type FAQCategory = 
  | 'general'
  | 'account'
  | 'payments'
  | 'debts'
  | 'reports'
  | 'notifications'
  | 'security'
  | 'technical'
  | 'subscription';

export interface FAQCategoryInfo {
  id: FAQCategory;
  name: string;
  nameKurdish: string;
  icon: string;
  description: string;
  descriptionKurdish: string;
}

export interface FAQStats {
  totalFAQs: number;
  publishedFAQs: number;
  totalViews: number;
  totalHelpful: number;
  totalNotHelpful: number;
  averageHelpfulness: number;
  faqsByCategory: {
    category: FAQCategory;
    count: number;
  }[];
  topViewedFAQs: FAQItem[];
  topHelpfulFAQs: FAQItem[];
}

export interface FAQFilter {
  category?: FAQCategory[];
  searchQuery?: string;
  isPublished?: boolean;
  tags?: string[];
}

export const FAQ_CATEGORIES: FAQCategoryInfo[] = [
  {
    id: 'general',
    name: 'General',
    nameKurdish: 'گشتی',
    icon: 'info',
    description: 'General questions about the system',
    descriptionKurdish: 'پرسیارە گشتیەکان دەربارەی سیستەمەکە',
  },
  {
    id: 'account',
    name: 'Account',
    nameKurdish: 'هەژمار',
    icon: 'user',
    description: 'Questions about account management',
    descriptionKurdish: 'پرسیارەکان دەربارەی بەڕێوەبردنی هەژمار',
  },
  {
    id: 'payments',
    name: 'Payments',
    nameKurdish: 'پارەدان',
    icon: 'credit-card',
    description: 'Questions about payments and transactions',
    descriptionKurdish: 'پرسیارەکان دەربارەی پارەدان و مامەڵەکان',
  },
  {
    id: 'debts',
    name: 'Debts',
    nameKurdish: 'قەرزەکان',
    icon: 'file-text',
    description: 'Questions about debt management',
    descriptionKurdish: 'پرسیارەکان دەربارەی بەڕێوەبردنی قەرز',
  },
  {
    id: 'reports',
    name: 'Reports',
    nameKurdish: 'راپۆرتەکان',
    icon: 'bar-chart',
    description: 'Questions about reports and analytics',
    descriptionKurdish: 'پرسیارەکان دەربارەی راپۆرت و شیکاری',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    nameKurdish: 'ئاگادارکردنەوەکان',
    icon: 'bell',
    description: 'Questions about notifications',
    descriptionKurdish: 'پرسیارەکان دەربارەی ئاگادارکردنەوەکان',
  },
  {
    id: 'security',
    name: 'Security',
    nameKurdish: 'پاراستن',
    icon: 'shield',
    description: 'Questions about security and privacy',
    descriptionKurdish: 'پرسیارەکان دەربارەی پاراستن و تایبەتێتی',
  },
  {
    id: 'technical',
    name: 'Technical',
    nameKurdish: 'تەکنیکی',
    icon: 'settings',
    description: 'Technical questions and troubleshooting',
    descriptionKurdish: 'پرسیارە تەکنیکیەکان و چارەسەرکردنی کێشەکان',
  },
  {
    id: 'subscription',
    name: 'Subscription',
    nameKurdish: 'ئابوونە',
    icon: 'package',
    description: 'Questions about subscription plans',
    descriptionKurdish: 'پرسیارەکان دەربارەی پلانەکانی ئابوونە',
  },
];
