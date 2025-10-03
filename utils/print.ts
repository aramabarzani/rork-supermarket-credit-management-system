import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export interface ReceiptData {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  receiptNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  items: {
    description: string;
    amount: number;
  }[];
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  notes?: string;
  employeeName?: string;
}

export class PrintManager {
  static generateReceiptHTML(data: ReceiptData): string {
    const {
      storeName,
      storeAddress,
      storePhone,
      receiptNumber,
      date,
      customerName,
      customerPhone,
      items,
      totalAmount,
      paidAmount,
      remainingAmount,
      notes,
      employeeName,
    } = data;

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ku">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>وەسڵ - ${receiptNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          
          .receipt {
            border: 2px solid #1E3A8A;
            padding: 30px;
            border-radius: 8px;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #1E3A8A;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          
          .store-name {
            font-size: 32px;
            font-weight: bold;
            color: #1E3A8A;
            margin-bottom: 10px;
          }
          
          .store-info {
            font-size: 14px;
            color: #6B7280;
            margin: 5px 0;
          }
          
          .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 15px;
            background: #F3F4F6;
            border-radius: 8px;
          }
          
          .info-item {
            flex: 1;
          }
          
          .info-label {
            font-size: 12px;
            color: #6B7280;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 16px;
            font-weight: bold;
            color: #1F2937;
          }
          
          .customer-info {
            margin-bottom: 20px;
            padding: 15px;
            background: #EFF6FF;
            border-radius: 8px;
          }
          
          .customer-name {
            font-size: 18px;
            font-weight: bold;
            color: #1E3A8A;
            margin-bottom: 5px;
          }
          
          .customer-phone {
            font-size: 14px;
            color: #6B7280;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .items-table th {
            background: #1E3A8A;
            color: white;
            padding: 12px;
            text-align: right;
            font-size: 14px;
          }
          
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #E5E7EB;
            font-size: 14px;
          }
          
          .items-table tr:last-child td {
            border-bottom: none;
          }
          
          .totals {
            margin-top: 20px;
            padding: 20px;
            background: #F9FAFB;
            border-radius: 8px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 16px;
          }
          
          .total-row.main {
            font-size: 20px;
            font-weight: bold;
            color: #1E3A8A;
            border-top: 2px solid #1E3A8A;
            padding-top: 15px;
            margin-top: 10px;
          }
          
          .total-row.paid {
            color: #10B981;
          }
          
          .total-row.remaining {
            color: #EF4444;
          }
          
          .notes {
            margin-top: 20px;
            padding: 15px;
            background: #FEF3C7;
            border-radius: 8px;
            border-right: 4px solid #F59E0B;
          }
          
          .notes-label {
            font-weight: bold;
            color: #92400E;
            margin-bottom: 5px;
          }
          
          .notes-text {
            color: #78350F;
            font-size: 14px;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 12px;
          }
          
          .employee-name {
            margin-top: 10px;
            font-size: 14px;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .receipt {
              border: none;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="store-name">${storeName}</div>
            ${storeAddress ? `<div class="store-info">${storeAddress}</div>` : ''}
            ${storePhone ? `<div class="store-info">تەلەفۆن: ${storePhone}</div>` : ''}
          </div>
          
          <div class="receipt-info">
            <div class="info-item">
              <div class="info-label">ژمارەی وەسڵ</div>
              <div class="info-value">${receiptNumber}</div>
            </div>
            <div class="info-item">
              <div class="info-label">بەروار</div>
              <div class="info-value">${new Date(date).toLocaleDateString('ckb-IQ')}</div>
            </div>
          </div>
          
          <div class="customer-info">
            <div class="customer-name">کڕیار: ${customerName}</div>
            ${customerPhone ? `<div class="customer-phone">تەلەفۆن: ${customerPhone}</div>` : ''}
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>وردەکاری</th>
                <th style="width: 150px;">بڕ (د.ع)</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.amount.toLocaleString('ckb-IQ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row main">
              <span>کۆی گشتی:</span>
              <span>${totalAmount.toLocaleString('ckb-IQ')} د.ع</span>
            </div>
            ${paidAmount !== undefined ? `
              <div class="total-row paid">
                <span>پارەدراوە:</span>
                <span>${paidAmount.toLocaleString('ckb-IQ')} د.ع</span>
              </div>
            ` : ''}
            ${remainingAmount !== undefined ? `
              <div class="total-row remaining">
                <span>ماوە:</span>
                <span>${remainingAmount.toLocaleString('ckb-IQ')} د.ع</span>
              </div>
            ` : ''}
          </div>
          
          ${notes ? `
            <div class="notes">
              <div class="notes-label">تێبینی:</div>
              <div class="notes-text">${notes}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <div>سوپاس بۆ کڕینەکەت</div>
            ${employeeName ? `<div class="employee-name">کارمەند: ${employeeName}</div>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static async printReceipt(data: ReceiptData): Promise<void> {
    try {
      const html = this.generateReceiptHTML(data);
      
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
      } else {
        await Print.printAsync({
          html,
          width: 612,
          height: 792,
        });
      }
    } catch (error) {
      console.error('Print error:', error);
      throw new Error('هەڵە لە چاپکردن');
    }
  }

  static async saveToPDF(data: ReceiptData): Promise<void> {
    try {
      const html = this.generateReceiptHTML(data);
      
      const { uri } = await Print.printToFileAsync({
        html,
        width: 612,
        height: 792,
      });

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `receipt_${data.receiptNumber}.pdf`;
        link.click();
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch (error) {
      console.error('PDF save error:', error);
      throw new Error('هەڵە لە پاشەکەوتکردنی PDF');
    }
  }
}

export const printManager = PrintManager;
