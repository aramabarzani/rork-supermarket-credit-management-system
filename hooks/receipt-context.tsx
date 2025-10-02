import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import { Receipt, ReceiptTemplate, ReceiptFilters, CompanyInfo } from '@/types/debt';
import { useAuth } from './auth-context';
import { safeStorage } from '@/utils/storage';

const RECEIPTS_STORAGE_KEY = 'receipts';
const RECEIPT_TEMPLATES_STORAGE_KEY = 'receipt_templates';
const COMPANY_INFO_STORAGE_KEY = 'company_info';
const RECEIPT_COUNTER_STORAGE_KEY = 'receipt_counter';

export const [ReceiptProvider, useReceipts] = createContextHook(() => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'سوپەرمارکێتی نموونە',
    phone: '+964 750 123 4567',
    address: 'هەولێر، کوردستان، عێراق',
    email: 'info@example.com',
    logoUri: undefined,
    website: undefined,
    taxNumber: undefined
  });
  const [receiptCounter, setReceiptCounter] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(Platform.OS !== 'web');
  
  const authContext = useAuth();
  const { user } = authContext || {};

  // Handle web hydration
  useEffect(() => {
    if (Platform.OS === 'web') {
      const timer = setTimeout(() => {
        setIsHydrated(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Load data from storage
  const loadData = useCallback(async () => {
    // Don't load data until hydration is complete on web
    if (Platform.OS === 'web' && !isHydrated) {
      return;
    }

    try {
      setIsLoading(true);
      
      const [receiptsData, templatesData, companyData, counterData] = await Promise.all([
        safeStorage.getItem<Receipt[]>(RECEIPTS_STORAGE_KEY, []),
        safeStorage.getItem<ReceiptTemplate[]>(RECEIPT_TEMPLATES_STORAGE_KEY, null),
        safeStorage.getItem<CompanyInfo>(COMPANY_INFO_STORAGE_KEY, null),
        safeStorage.getItem<number>(RECEIPT_COUNTER_STORAGE_KEY, 1)
      ]);
      
      if (receiptsData) {
        setReceipts(receiptsData);
      }
      
      if (templatesData) {
        setTemplates(templatesData);
      } else {
        // Create default template
        const defaultTemplate = createDefaultTemplate();
        setTemplates([defaultTemplate]);
        await safeStorage.setItem(RECEIPT_TEMPLATES_STORAGE_KEY, [defaultTemplate]);
      }
      
      if (companyData) {
        setCompanyInfo(companyData);
      }
      
      if (counterData) {
        setReceiptCounter(counterData);
      }
    } catch (error) {
      console.error('Error loading receipt data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isHydrated]);

  // Auto-load data when hydrated
  useEffect(() => {
    if (Platform.OS !== 'web' || isHydrated) {
      const timer = setTimeout(loadData, Platform.OS === 'web' ? 100 : 0);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, loadData]);

  // Create default receipt template
  const createDefaultTemplate = (): ReceiptTemplate => ({
    id: 'default',
    name: 'قاڵبی بنەڕەتی',
    headerTemplate: '{{companyName}}\n{{companyPhone}}\n{{companyAddress}}',
    bodyTemplate: 'وەسڵی {{type}}\nژمارە: {{receiptNumber}}\nبەروار: {{date}}\n\nکڕیار: {{customerName}}\nبڕ: {{amount}} د.ع\n\n{{notes}}',
    footerTemplate: 'سوپاس بۆ هاوکاریتان\n{{companyEmail}}',
    styles: {
      fontSize: 14,
      fontFamily: 'System',
      primaryColor: '#1F2937',
      secondaryColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      logoSize: { width: 80, height: 80 }
    },
    isDefault: true
  });

  // Generate next receipt number
  const generateReceiptNumber = useCallback(async (): Promise<string> => {
    const nextNumber = receiptCounter;
    const newCounter = nextNumber + 1;
    setReceiptCounter(newCounter);
    await safeStorage.setItem(RECEIPT_COUNTER_STORAGE_KEY, newCounter);
    return `R${nextNumber.toString().padStart(6, '0')}`;
  }, [receiptCounter]);

  // Create receipt for debt
  const createDebtReceipt = useCallback(async (debtId: string, customerId: string, customerName: string, amount: number, notes?: string): Promise<Receipt> => {
    if (!debtId?.trim() || !customerId?.trim() || !customerName?.trim() || !amount || amount <= 0) {
      throw new Error('Invalid receipt data');
    }
    
    const receiptNumber = await generateReceiptNumber();
    const receipt: Receipt = {
      id: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      receiptNumber,
      type: 'debt',
      relatedId: debtId,
      customerId,
      customerName,
      amount,
      date: new Date().toISOString(),
      createdBy: user?.id || 'unknown',
      createdByName: user?.name || 'نەناسراو',
      companyInfo,
      notes: notes?.trim() || undefined
    };
    
    const updatedReceipts = [...receipts, receipt];
    setReceipts(updatedReceipts);
    await safeStorage.setItem(RECEIPTS_STORAGE_KEY, updatedReceipts);
    
    return receipt;
  }, [receipts, companyInfo, user, generateReceiptNumber]);

  // Create receipt for payment
  const createPaymentReceipt = useCallback(async (paymentId: string, customerId: string, customerName: string, amount: number, notes?: string): Promise<Receipt> => {
    if (!paymentId?.trim() || !customerId?.trim() || !customerName?.trim() || !amount || amount <= 0) {
      throw new Error('Invalid receipt data');
    }
    
    const receiptNumber = await generateReceiptNumber();
    const receipt: Receipt = {
      id: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      receiptNumber,
      type: 'payment',
      relatedId: paymentId,
      customerId,
      customerName,
      amount,
      date: new Date().toISOString(),
      createdBy: user?.id || 'unknown',
      createdByName: user?.name || 'نەناسراو',
      companyInfo,
      notes: notes?.trim() || undefined
    };
    
    const updatedReceipts = [...receipts, receipt];
    setReceipts(updatedReceipts);
    await safeStorage.setItem(RECEIPTS_STORAGE_KEY, updatedReceipts);
    
    return receipt;
  }, [receipts, companyInfo, user, generateReceiptNumber]);

  // Update company info
  const updateCompanyInfo = useCallback(async (newInfo: CompanyInfo) => {
    if (!newInfo?.name?.trim()) {
      console.error('Company name is required');
      return;
    }
    const sanitizedInfo: CompanyInfo = {
      name: newInfo.name.trim(),
      phone: newInfo.phone?.trim() || '',
      address: newInfo.address?.trim() || '',
      email: newInfo.email?.trim() || '',
      logoUri: newInfo.logoUri || undefined,
      website: newInfo.website?.trim() || undefined,
      taxNumber: newInfo.taxNumber?.trim() || undefined
    };
    setCompanyInfo(sanitizedInfo);
    await safeStorage.setItem(COMPANY_INFO_STORAGE_KEY, sanitizedInfo);
  }, []);

  // Create new template
  const createTemplate = useCallback(async (template: Omit<ReceiptTemplate, 'id'>) => {
    const newTemplate: ReceiptTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    await safeStorage.setItem(RECEIPT_TEMPLATES_STORAGE_KEY, updatedTemplates);
    
    return newTemplate;
  }, [templates]);

  // Update template
  const updateTemplate = useCallback(async (templateId: string, updates: Partial<ReceiptTemplate>) => {
    const updatedTemplates = templates.map(template => 
      template.id === templateId ? { ...template, ...updates } : template
    );
    setTemplates(updatedTemplates);
    await safeStorage.setItem(RECEIPT_TEMPLATES_STORAGE_KEY, updatedTemplates);
  }, [templates]);

  // Delete template
  const deleteTemplate = useCallback(async (templateId: string) => {
    const updatedTemplates = templates.filter(template => template.id !== templateId && !template.isDefault);
    setTemplates(updatedTemplates);
    await safeStorage.setItem(RECEIPT_TEMPLATES_STORAGE_KEY, updatedTemplates);
  }, [templates]);

  // Set receipt number manually
  const setReceiptNumber = useCallback(async (receiptId: string, newNumber: string) => {
    if (!receiptId?.trim() || !newNumber?.trim()) {
      console.error('Receipt ID and number are required');
      return;
    }
    
    const updatedReceipts = receipts.map(receipt => 
      receipt.id === receiptId ? { ...receipt, receiptNumber: newNumber.trim() } : receipt
    );
    setReceipts(updatedReceipts);
    await safeStorage.setItem(RECEIPTS_STORAGE_KEY, updatedReceipts);
  }, [receipts]);

  // Search receipts
  const searchReceipts = useCallback((filters: ReceiptFilters) => {
    let filteredReceipts = [...receipts];

    // Text search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredReceipts = filteredReceipts.filter(receipt => 
        receipt.customerName.toLowerCase().includes(searchLower) ||
        receipt.receiptNumber.toLowerCase().includes(searchLower) ||
        receipt.notes?.toLowerCase().includes(searchLower) ||
        receipt.createdByName.toLowerCase().includes(searchLower)
      );
    }

    // Receipt number search
    if (filters.receiptNumber) {
      filteredReceipts = filteredReceipts.filter(receipt => 
        receipt.receiptNumber.includes(filters.receiptNumber!)
      );
    }

    // Customer filter
    if (filters.customerId) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.customerId === filters.customerId);
    }

    // Employee filter
    if (filters.employeeId) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.createdBy === filters.employeeId);
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.type === filters.type);
    }

    // Date range filter
    if (filters.startDate) {
      filteredReceipts = filteredReceipts.filter(receipt => 
        new Date(receipt.date) >= new Date(filters.startDate!)
      );
    }
    if (filters.endDate) {
      filteredReceipts = filteredReceipts.filter(receipt => 
        new Date(receipt.date) <= new Date(filters.endDate!)
      );
    }

    // Sorting
    if (filters.sortBy) {
      filteredReceipts.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'customer':
            aValue = a.customerName;
            bValue = b.customerName;
            break;
          case 'receiptNumber':
            aValue = a.receiptNumber;
            bValue = b.receiptNumber;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return filteredReceipts;
  }, [receipts]);

  // Get receipts by customer
  const getReceiptsByCustomer = useCallback((customerId: string) => {
    return receipts.filter(receipt => receipt.customerId === customerId);
  }, [receipts]);

  // Get receipts by employee
  const getReceiptsByEmployee = useCallback((employeeId: string) => {
    return receipts.filter(receipt => receipt.createdBy === employeeId);
  }, [receipts]);

  // Get recent receipts
  const getRecentReceipts = useCallback((limit: number = 10) => {
    return receipts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [receipts]);

  // Get receipt by ID
  const getReceiptById = useCallback((receiptId: string) => {
    return receipts.find(receipt => receipt.id === receiptId);
  }, [receipts]);

  // Generate receipt content from template
  const generateReceiptContent = useCallback((receipt: Receipt, template?: ReceiptTemplate) => {
    const activeTemplate = template || templates.find(t => t.isDefault) || templates[0];
    if (!activeTemplate) return '';

    const formatCurrency = (amount: number) => {
      if (!amount || isNaN(amount)) return '0 د.ع';
      return new Intl.NumberFormat('ckb-IQ', {
        style: 'currency',
        currency: 'IQD',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ckb-IQ');
    };

    const replacePlaceholders = (text: string) => {
      return text
        .replace(/{{companyName}}/g, receipt.companyInfo.name)
        .replace(/{{companyPhone}}/g, receipt.companyInfo.phone || '')
        .replace(/{{companyAddress}}/g, receipt.companyInfo.address || '')
        .replace(/{{companyEmail}}/g, receipt.companyInfo.email || '')
        .replace(/{{type}}/g, receipt.type === 'debt' ? 'قەرز' : 'پارەدان')
        .replace(/{{receiptNumber}}/g, receipt.receiptNumber)
        .replace(/{{date}}/g, formatDate(receipt.date))
        .replace(/{{customerName}}/g, receipt.customerName)
        .replace(/{{amount}}/g, formatCurrency(receipt.amount))
        .replace(/{{notes}}/g, receipt.notes || '');
    };

    const header = replacePlaceholders(activeTemplate.headerTemplate);
    const body = replacePlaceholders(activeTemplate.bodyTemplate);
    const footer = replacePlaceholders(activeTemplate.footerTemplate);

    return `${header}\n\n${body}\n\n${footer}`;
  }, [templates]);

  return useMemo(() => ({
    receipts,
    templates,
    companyInfo,
    receiptCounter,
    isLoading: isLoading || (Platform.OS === 'web' && !isHydrated),
    loadData,
    createDebtReceipt,
    createPaymentReceipt,
    updateCompanyInfo,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setReceiptNumber,
    searchReceipts,
    getReceiptsByCustomer,
    getReceiptsByEmployee,
    getRecentReceipts,
    getReceiptById,
    generateReceiptContent,
    generateReceiptNumber
  }), [
    receipts,
    templates,
    companyInfo,
    receiptCounter,
    isLoading,
    isHydrated,
    loadData,
    createDebtReceipt,
    createPaymentReceipt,
    updateCompanyInfo,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setReceiptNumber,
    searchReceipts,
    getReceiptsByCustomer,
    getReceiptsByEmployee,
    getRecentReceipts,
    getReceiptById,
    generateReceiptContent,
    generateReceiptNumber
  ]);
});