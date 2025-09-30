export interface Note {
  id: string;
  entityType: 'debt' | 'payment' | 'customer' | 'employee';
  entityId: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
  isPrivate: boolean;
  tags?: string[];
}

export interface NoteFilters {
  entityType?: 'debt' | 'payment' | 'customer' | 'employee';
  entityId?: string;
  createdBy?: string;
  searchText?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  isPrivate?: boolean;
  sortBy?: 'date' | 'entity' | 'creator';
  sortOrder?: 'asc' | 'desc';
}

export interface NoteStats {
  totalNotes: number;
  notesByType: {
    debt: number;
    payment: number;
    customer: number;
    employee: number;
  };
  recentNotes: Note[];
}
