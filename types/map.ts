export interface CustomerLocation {
  customerId: string;
  customerName: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  phone: string;
  totalDebt: number;
  remainingDebt: number;
  lastVisit?: string;
  notes?: string;
}

export interface DebtCollectionRoute {
  id: string;
  name: string;
  date: string;
  assignedTo: string;
  assignedToName: string;
  customers: CustomerLocation[];
  totalDistance: number;
  estimatedTime: number;
  status: 'planned' | 'in-progress' | 'completed';
  startLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: string;
  completedAt?: string;
}

export interface MapFilters {
  city?: string;
  minDebt?: number;
  maxDebt?: number;
  hasDebt?: boolean;
  lastVisitDays?: number;
}

export interface RouteOptimization {
  originalRoute: CustomerLocation[];
  optimizedRoute: CustomerLocation[];
  distanceSaved: number;
  timeSaved: number;
}
