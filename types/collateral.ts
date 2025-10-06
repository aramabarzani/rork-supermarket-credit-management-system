export interface Collateral {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  type: 'property' | 'vehicle' | 'jewelry' | 'electronics' | 'documents' | 'other';
  description: string;
  estimatedValue: number;
  documentNumber?: string;
  serialNumber?: string;
  photos?: string[];
  status: 'held' | 'returned' | 'sold';
  receivedAt: string;
  receivedBy: string;
  receivedByName: string;
  returnedAt?: string;
  returnedBy?: string;
  returnedByName?: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface CollateralReport {
  totalCollaterals: number;
  heldCollaterals: number;
  returnedCollaterals: number;
  soldCollaterals: number;
  totalEstimatedValue: number;
  collateralsByType: {
    type: string;
    count: number;
    value: number;
  }[];
}
