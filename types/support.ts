export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';
export type IssueCategory = 'payment' | 'debt' | 'account' | 'technical' | 'other';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  reportedBy: string;
  reportedByName: string;
  reportedByRole: 'customer' | 'employee' | 'admin';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolutionNotes?: string;
  rating?: number;
  ratingComment?: string;
  attachments?: string[];
}

export interface IssueComment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userRole: 'customer' | 'employee' | 'admin';
  comment: string;
  createdAt: string;
  isInternal: boolean;
}

export interface IssueStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  averageResolutionTime: number;
  averageRating: number;
  issuesByCategory: {
    category: IssueCategory;
    count: number;
  }[];
  issuesByPriority: {
    priority: IssuePriority;
    count: number;
  }[];
}

export interface MonthlyIssueReport {
  month: string;
  totalIssues: number;
  resolvedIssues: number;
  averageResolutionTime: number;
  averageRating: number;
  issuesByCategory: {
    category: IssueCategory;
    count: number;
  }[];
}

export interface YearlyIssueReport {
  year: string;
  totalIssues: number;
  resolvedIssues: number;
  averageResolutionTime: number;
  averageRating: number;
  monthlyBreakdown: MonthlyIssueReport[];
}

export interface IssueFilter {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  category?: IssueCategory[];
  reportedBy?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
}
