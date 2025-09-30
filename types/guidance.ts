export type UserRole = 'admin' | 'employee' | 'customer';

export type TutorialType = 'video' | 'interactive' | 'document';

export interface Tutorial {
  id: string;
  title: string;
  titleKu: string;
  description: string;
  descriptionKu: string;
  type: TutorialType;
  role: UserRole;
  videoUrl?: string;
  documentUrl?: string;
  steps?: TutorialStep[];
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TutorialStep {
  id: string;
  title: string;
  titleKu: string;
  description: string;
  descriptionKu: string;
  order: number;
  imageUrl?: string;
}

export interface HelpMessage {
  id: string;
  screen: string;
  message: string;
  messageKu: string;
  role?: UserRole;
  position: 'top' | 'bottom' | 'center';
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: Date;
}

export interface Newsletter {
  id: string;
  title: string;
  titleKu: string;
  content: string;
  contentKu: string;
  type: 'update' | 'announcement' | 'monthly' | 'vip';
  targetRole?: UserRole;
  vipOnly: boolean;
  sentAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  status: 'draft' | 'scheduled' | 'sent';
}

export interface OnboardingStep {
  id: string;
  title: string;
  titleKu: string;
  description: string;
  descriptionKu: string;
  screen: string;
  order: number;
  imageUrl?: string;
  completed: boolean;
}

export interface UserGuidance {
  userId: string;
  onboardingCompleted: boolean;
  tutorialsViewed: string[];
  lastHelpViewed?: Date;
  preferredLanguage: 'en' | 'ku';
}

export interface GuidanceSettings {
  showOnboarding: boolean;
  showHelpMessages: boolean;
  autoPlayTutorials: boolean;
  newsletterEnabled: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  telegramNotifications: boolean;
}
