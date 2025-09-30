import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Palette,
  Type,
  Calendar,
  Globe,
  Layout,
  BarChart3,
  Save,
  RotateCcw,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUICustomization } from '@/hooks/ui-customization-context';
import {
  ThemeMode,
  FontSize,
  DateFormat,
  DisplayMode,
  ChartType,
  COLOR_PRESETS,
  FONT_SIZE_VALUES,
} from '@/types/ui-customization';

export default function UICustomizationScreen() {
  const router = useRouter();
  const { currentCustomization, updateCustomization, resetToDefault } = useUICustomization();

  const [themeMode, setThemeMode] = useState<ThemeMode>(currentCustomization.themeMode);
  const [primaryColor, setPrimaryColor] = useState<string>(currentCustomization.primaryColor);
  const [fontSize, setFontSize] = useState<FontSize>(currentCustomization.fontSize);
  const [dateFormat, setDateFormat] = useState<DateFormat>(currentCustomization.dateFormat);
  const [language, setLanguage] = useState<'kurdish' | 'english' | 'arabic'>(currentCustomization.language);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(currentCustomization.displayMode);
  const [chartType, setChartType] = useState<ChartType>(currentCustomization.chartType);
  const [backgroundColor, setBackgroundColor] = useState<string>(currentCustomization.backgroundColor);

  const handleSave = async () => {
    await updateCustomization({
      themeMode,
      primaryColor,
      fontSize,
      dateFormat,
      language,
      displayMode,
      chartType,
      backgroundColor,
    });
    router.back();
  };

  const handleReset = async () => {
    await resetToDefault();
    setThemeMode('light');
    setPrimaryColor('#3B82F6');
    setFontSize('medium');
    setDateFormat('yyyy-mm-dd');
    setLanguage('kurdish');
    setDisplayMode('card');
    setChartType('bar');
    setBackgroundColor('#F3F4F6');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            ڕووکار (٧٠٧)
          </KurdishText>
          <GradientCard>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Palette size={20} color="#3B82F6" />
                <KurdishText variant="body" color="#1F2937">
                  مۆدی شەو-ڕۆژ
                </KurdishText>
              </View>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </GradientCard>
        </View>

        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            ڕەنگی سەرەکی (٧٠٤، ٧١٠)
          </KurdishText>
          <GradientCard>
            <View style={styles.colorGrid}>
              {COLOR_PRESETS.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.value },
                    primaryColor === color.value && styles.colorOptionSelected,
                  ]}
                  onPress={() => setPrimaryColor(color.value)}
                >
                  {primaryColor === color.value && (
                    <View style={styles.colorCheck} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </GradientCard>
        </View>

        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            قەبارەی فۆنت (٧٠٥، ٧٠٦)
          </KurdishText>
          <GradientCard>
            {(['small', 'medium', 'large', 'xlarge'] as FontSize[]).map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionRow,
                  fontSize === size && styles.optionRowSelected,
                ]}
                onPress={() => setFontSize(size)}
              >
                <Type size={20} color={fontSize === size ? '#3B82F6' : '#6B7280'} />
                <KurdishText
                  variant="body"
                  color={fontSize === size ? '#3B82F6' : '#1F2937'}
                  style={[{ fontSize: FONT_SIZE_VALUES[size] as number }]}
                >
                  {size === 'small' ? 'بچووک' : size === 'medium' ? 'ناوەند' : size === 'large' ? 'گەورە' : 'زۆر گەورە'}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </GradientCard>
        </View>

        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            فۆرماتی بەروار (٧١٧)
          </KurdishText>
          <GradientCard>
            {(['yyyy-mm-dd', 'dd-mm-yyyy', 'mm-dd-yyyy'] as DateFormat[]).map((format) => (
              <TouchableOpacity
                key={format}
                style={[
                  styles.optionRow,
                  dateFormat === format && styles.optionRowSelected,
                ]}
                onPress={() => setDateFormat(format)}
              >
                <Calendar size={20} color={dateFormat === format ? '#3B82F6' : '#6B7280'} />
                <KurdishText
                  variant="body"
                  color={dateFormat === format ? '#3B82F6' : '#1F2937'}
                >
                  {format}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </GradientCard>
        </View>

        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            زمان (٧١٩)
          </KurdishText>
          <GradientCard>
            {(['kurdish', 'english', 'arabic'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.optionRow,
                  language === lang && styles.optionRowSelected,
                ]}
                onPress={() => setLanguage(lang)}
              >
                <Globe size={20} color={language === lang ? '#3B82F6' : '#6B7280'} />
                <KurdishText
                  variant="body"
                  color={language === lang ? '#3B82F6' : '#1F2937'}
                >
                  {lang === 'kurdish' ? 'کوردی' : lang === 'english' ? 'English' : 'عربي'}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </GradientCard>
        </View>

        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            شێوەی پیشاندان (٧١٥، ٧١٦)
          </KurdishText>
          <GradientCard>
            {(['card', 'list'] as DisplayMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.optionRow,
                  displayMode === mode && styles.optionRowSelected,
                ]}
                onPress={() => setDisplayMode(mode)}
              >
                <Layout size={20} color={displayMode === mode ? '#3B82F6' : '#6B7280'} />
                <KurdishText
                  variant="body"
                  color={displayMode === mode ? '#3B82F6' : '#1F2937'}
                >
                  {mode === 'card' ? 'کارت' : 'لیست'}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </GradientCard>
        </View>

        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            جۆری گراف (٧١٣، ٧١٤)
          </KurdishText>
          <GradientCard>
            {(['bar', 'line', 'pie'] as ChartType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionRow,
                  chartType === type && styles.optionRowSelected,
                ]}
                onPress={() => setChartType(type)}
              >
                <BarChart3 size={20} color={chartType === type ? '#3B82F6' : '#6B7280'} />
                <KurdishText
                  variant="body"
                  color={chartType === type ? '#3B82F6' : '#1F2937'}
                >
                  {type === 'bar' ? 'بار' : type === 'line' ? 'هێڵ' : 'پای'}
                </KurdishText>
              </TouchableOpacity>
            ))}
          </GradientCard>
        </View>

        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            ڕەنگی پاشبنەما (٧٠٩)
          </KurdishText>
          <GradientCard>
            <View style={styles.colorGrid}>
              {['#F3F4F6', '#FFFFFF', '#1F2937', '#374151', '#EFF6FF', '#FEF2F2'].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    backgroundColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setBackgroundColor(color)}
                >
                  {backgroundColor === color && (
                    <View style={styles.colorCheck} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </GradientCard>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#FFFFFF" />
            <KurdishText variant="subtitle" color="#FFFFFF">
              پاشەکەوتکردن
            </KurdishText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RotateCcw size={20} color="#EF4444" />
            <KurdishText variant="subtitle" color="#EF4444">
              گەڕانەوە بۆ بنەڕەت
            </KurdishText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  colorOptionSelected: {
    borderColor: '#3B82F6',
    borderWidth: 3,
  },
  colorCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionRowSelected: {
    backgroundColor: '#EFF6FF',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
});
