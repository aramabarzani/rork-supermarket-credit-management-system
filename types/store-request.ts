import { SubscriptionPlan } from './subscription';

export type StoreRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'deleted';

export interface StoreRequest {
  id: string;
  storeName: string;
  storeNameKurdish: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerPassword?: string;
  address: string;
  city: string;
  plan: SubscriptionPlan;
  status: StoreRequestStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
  tenantId?: string;
}

export interface StoreRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
}
