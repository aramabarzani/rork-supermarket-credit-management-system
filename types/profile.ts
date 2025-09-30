export interface ProfileImage {
  id: string;
  userId: string;
  imageUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  fileSize: number;
  mimeType: string;
}

export interface ProfileChange {
  id: string;
  userId: string;
  userName: string;
  changeType: 'image' | 'name' | 'phone' | 'email' | 'address' | 'role' | 'permissions' | 'other';
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  ipAddress?: string;
}

export interface ProfileChangeFilters {
  userId?: string;
  changeType?: string;
  changedBy?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'user' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface ProfileStats {
  totalChanges: number;
  changesByType: Record<string, number>;
  recentChanges: ProfileChange[];
  mostActiveUsers: {
    userId: string;
    userName: string;
    changeCount: number;
  }[];
}
