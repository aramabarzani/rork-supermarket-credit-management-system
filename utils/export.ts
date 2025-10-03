import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
}

export class ExportManager {
  static async exportToCSV(data: ExportData): Promise<void> {
    try {
      const { headers, rows, title = 'export' } = data;
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const fileName = `${title}_${Date.now()}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri);
        }
      }
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error('هەڵە لە هەناردەکردنی CSV');
    }
  }

  static async exportToJSON(data: any, title: string = 'export'): Promise<void> {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const fileName = `${title}_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (Platform.OS === 'web') {
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri);
        }
      }
    } catch (error) {
      console.error('JSON export error:', error);
      throw new Error('هەڵە لە هەناردەکردنی JSON');
    }
  }

  static generateCSVFromObjects<T extends Record<string, any>>(
    objects: T[],
    columns?: { key: keyof T; label: string }[]
  ): ExportData {
    if (objects.length === 0) {
      return { headers: [], rows: [] };
    }

    const keys = columns 
      ? columns.map(c => c.key as string)
      : Object.keys(objects[0]);
    
    const headers = columns
      ? columns.map(c => c.label)
      : keys;

    const rows = objects.map(obj =>
      keys.map(key => {
        const value = obj[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );

    return { headers, rows };
  }

  static async exportDebtsToCSV(debts: any[]): Promise<void> {
    const data = this.generateCSVFromObjects(debts, [
      { key: 'id', label: 'ژمارە' },
      { key: 'customerName', label: 'ناوی کڕیار' },
      { key: 'amount', label: 'بڕی قەرز' },
      { key: 'remainingAmount', label: 'بڕی ماوە' },
      { key: 'category', label: 'جۆر' },
      { key: 'status', label: 'دۆخ' },
      { key: 'createdAt', label: 'بەروار' },
      { key: 'dueDate', label: 'بەرواری کۆتایی' },
    ]);

    await this.exportToCSV({ ...data, title: 'debts' });
  }

  static async exportPaymentsToCSV(payments: any[]): Promise<void> {
    const data = this.generateCSVFromObjects(payments, [
      { key: 'id', label: 'ژمارە' },
      { key: 'amount', label: 'بڕ' },
      { key: 'paymentDate', label: 'بەروار' },
      { key: 'receivedByName', label: 'وەرگیراو لەلایەن' },
      { key: 'notes', label: 'تێبینی' },
    ]);

    await this.exportToCSV({ ...data, title: 'payments' });
  }

  static async exportCustomersToCSV(customers: any[]): Promise<void> {
    const data = this.generateCSVFromObjects(customers, [
      { key: 'id', label: 'ژمارە' },
      { key: 'name', label: 'ناو' },
      { key: 'phone', label: 'ژمارەی مۆبایل' },
      { key: 'email', label: 'ئیمەیڵ' },
      { key: 'address', label: 'ناونیشان' },
      { key: 'createdAt', label: 'بەروار' },
    ]);

    await this.exportToCSV({ ...data, title: 'customers' });
  }
}

export const exportManager = ExportManager;
