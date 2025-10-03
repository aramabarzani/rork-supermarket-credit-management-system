export interface Product {
  id: string;
  name: string;
  nameKurdish: string;
  description?: string;
  descriptionKurdish?: string;
  sku: string;
  barcode?: string;
  category: string;
  categoryKurdish: string;
  unit: 'piece' | 'kg' | 'liter' | 'meter' | 'box' | 'carton';
  unitKurdish: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  reorderPoint: number;
  supplier?: string;
  supplierKurdish?: string;
  location?: string;
  locationKurdish?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productNameKurdish: string;
  type: 'in' | 'out' | 'adjustment' | 'return' | 'damage' | 'transfer';
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  totalCost?: number;
  reason: string;
  reasonKurdish: string;
  reference?: string;
  relatedDebtId?: string;
  relatedPaymentId?: string;
  fromLocation?: string;
  toLocation?: string;
  notes?: string;
  notesKurdish?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameKurdish: string;
  description?: string;
  descriptionKurdish?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  productNameKurdish: string;
  alertType: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
  currentStock: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  messageKurdish: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  nameKurdish: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  addressKurdish?: string;
  city?: string;
  notes?: string;
  notesKurdish?: string;
  isActive: boolean;
  totalPurchases: number;
  totalPaid: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  supplierNameKurdish: string;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  notesKurdish?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  productNameKurdish: string;
  quantity: number;
  unitCost: number;
  total: number;
  receivedQuantity: number;
  notes?: string;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    productNameKurdish: string;
    quantitySold: number;
    revenue: number;
  }[];
  categoryBreakdown: {
    category: string;
    categoryKurdish: string;
    productCount: number;
    totalValue: number;
  }[];
  recentMovements: StockMovement[];
}

export const PRODUCT_UNITS = [
  { value: 'piece', label: 'Piece', labelKurdish: 'دانە' },
  { value: 'kg', label: 'Kilogram', labelKurdish: 'کیلۆگرام' },
  { value: 'liter', label: 'Liter', labelKurdish: 'لیتر' },
  { value: 'meter', label: 'Meter', labelKurdish: 'مەتر' },
  { value: 'box', label: 'Box', labelKurdish: 'سندوق' },
  { value: 'carton', label: 'Carton', labelKurdish: 'کارتۆن' },
] as const;

export const STOCK_MOVEMENT_TYPES = [
  { value: 'in', label: 'Stock In', labelKurdish: 'کاڵا هاتووە' },
  { value: 'out', label: 'Stock Out', labelKurdish: 'کاڵا چووەتە دەرەوە' },
  { value: 'adjustment', label: 'Adjustment', labelKurdish: 'ڕاستکردنەوە' },
  { value: 'return', label: 'Return', labelKurdish: 'گەڕاندنەوە' },
  { value: 'damage', label: 'Damage', labelKurdish: 'زیان' },
  { value: 'transfer', label: 'Transfer', labelKurdish: 'گواستنەوە' },
] as const;
