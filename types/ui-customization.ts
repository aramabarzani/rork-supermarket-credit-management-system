export type ThemeMode = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type DateFormat = 'yyyy-mm-dd' | 'dd-mm-yyyy' | 'mm-dd-yyyy';
export type DisplayMode = 'card' | 'list';
export type ChartType = 'bar' | 'line' | 'pie';

export interface UICustomization {
  themeMode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontSize: FontSize;
  fontFamily?: string;
  dateFormat: DateFormat;
  language: 'kurdish' | 'english' | 'arabic';
  timezone: string;
  displayMode: DisplayMode;
  chartType: ChartType;
  chartColors: string[];
  dashboardBackground?: string;
  customCSS?: string;
}

export interface RoleUICustomization {
  roleId: string;
  roleName: string;
  customization: UICustomization;
}

export interface UserUIPreferences {
  userId: string;
  customization: Partial<UICustomization>;
  overrideRoleSettings: boolean;
}

export const DEFAULT_UI_CUSTOMIZATION: UICustomization = {
  themeMode: 'light',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  backgroundColor: '#F3F4F6',
  fontSize: 'medium',
  dateFormat: 'yyyy-mm-dd',
  language: 'kurdish',
  timezone: 'Asia/Baghdad',
  displayMode: 'card',
  chartType: 'bar',
  chartColors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
};

export const FONT_SIZE_VALUES: Record<FontSize, number> = {
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 18,
};

export const THEME_PRESETS = {
  light: {
    backgroundColor: '#F3F4F6',
    cardBackground: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  },
  dark: {
    backgroundColor: '#1F2937',
    cardBackground: '#374151',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#4B5563',
  },
};

export const COLOR_PRESETS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
];
