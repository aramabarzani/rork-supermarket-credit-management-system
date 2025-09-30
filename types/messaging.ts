export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'employee' | 'customer';
  recipientId: string;
  recipientName: string;
  recipientRole: 'admin' | 'employee' | 'customer';
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  attachments?: MessageAttachment[];
  replyToId?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface BroadcastMessage {
  id: string;
  senderId: string;
  senderName: string;
  targetRole: 'all' | 'customers' | 'employees';
  subject: string;
  content: string;
  createdAt: string;
  recipientCount: number;
  readCount: number;
}

export interface EmployeeRating {
  id: string;
  employeeId: string;
  employeeName: string;
  ratedBy: string;
  raterName: string;
  rating: number;
  category: 'performance' | 'punctuality' | 'customer_service' | 'teamwork' | 'overall';
  comment: string;
  createdAt: string;
  period: string;
}

export interface CustomerRating {
  id: string;
  customerId: string;
  customerName: string;
  ratedBy: string;
  raterName: string;
  rating: number;
  category: 'payment_reliability' | 'communication' | 'overall';
  comment: string;
  createdAt: string;
  onTimePayments: number;
  latePayments: number;
  totalDebt: number;
  paidAmount: number;
}

export interface RatingReport {
  employeeId?: string;
  customerId?: string;
  averageRating: number;
  totalRatings: number;
  ratingsByCategory: Record<string, number>;
  trend: 'improving' | 'declining' | 'stable';
  lastRatingDate: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'employee' | 'customer';
  content: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: string;
  userName: string;
  userRole: 'admin' | 'employee' | 'customer';
  joinedAt: string;
}

export interface MessageStats {
  totalMessages: number;
  unreadMessages: number;
  sentMessages: number;
  receivedMessages: number;
  messagesByDate: { date: string; count: number }[];
}

export interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  totalChatMessages: number;
  averageResponseTime: number;
  chatsByDate: { date: string; count: number }[];
}

export interface MessageFilters {
  startDate?: string;
  endDate?: string;
  senderId?: string;
  recipientId?: string;
  isRead?: boolean;
  role?: 'admin' | 'employee' | 'customer';
}

export interface ChatFilters {
  startDate?: string;
  endDate?: string;
  participantId?: string;
  hasUnread?: boolean;
}
