export interface Guarantee {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  guarantorId: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorAddress?: string;
  guarantorNationalId?: string;
  guaranteeType: 'personal' | 'property' | 'bank' | 'check';
  guaranteeAmount: number;
  guaranteeDetails: string;
  documentUrl?: string;
  status: 'active' | 'released' | 'claimed';
  createdAt: string;
  createdBy: string;
  createdByName: string;
  releasedAt?: string;
  releasedBy?: string;
  releasedByName?: string;
  notes?: string;
}

export interface Guarantor {
  id: string;
  name: string;
  phone: string;
  address?: string;
  nationalId?: string;
  email?: string;
  relationship?: string;
  totalGuarantees: number;
  activeGuarantees: number;
  totalGuaranteedAmount: number;
  creditScore?: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface GuaranteeReport {
  totalGuarantees: number;
  activeGuarantees: number;
  releasedGuarantees: number;
  claimedGuarantees: number;
  totalGuaranteedAmount: number;
  guaranteesByType: {
    type: string;
    count: number;
    amount: number;
  }[];
  topGuarantors: {
    guarantorId: string;
    guarantorName: string;
    totalGuarantees: number;
    totalAmount: number;
  }[];
}
