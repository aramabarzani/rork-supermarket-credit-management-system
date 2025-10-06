export interface WriteOff {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: 'uncollectible' | 'bankruptcy' | 'death' | 'fraud' | 'settlement' | 'other';
  reasonDetails: string;
  approvedBy: string;
  approvedByName: string;
  approvedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documents?: {
    name: string;
    url: string;
    uploadedAt: string;
  }[];
  notes?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface WriteOffReport {
  totalWriteOffs: number;
  totalWriteOffAmount: number;
  writeOffsByReason: {
    reason: string;
    count: number;
    amount: number;
  }[];
  writeOffRate: number;
  averageWriteOffAmount: number;
}
