# سیستەمی دیزاینی نوێ / Modern Design System

## پێشەکی / Overview

ئەم سیستەمە دیزاینێکی نوێ و جوان و هاوچەرخ بۆ هەموو بەرنامەکە دابین دەکات بە ڕەنگە سەرنجڕاکێش و کۆمپۆنێنتە نوێکان.

This document describes the new modern design system implemented across the entire application with attractive colors and modern components.

---

## ڕەنگەکان / Colors

### ڕەنگە سەرەکیەکان / Primary Colors
- **Primary (شین/Blue)**: `#6366F1` - `#312E81`
- **Secondary (سەوز/Teal)**: `#14B8A6` - `#134E4A`
- **Success (سەوز/Green)**: `#22C55E` - `#14532D`
- **Warning (زەرد/Yellow)**: `#F59E0B` - `#78350F`
- **Danger (سوور/Red)**: `#EF4444` - `#7F1D1D`
- **Info (شین/Blue)**: `#3B82F6` - `#1E3A8A`

### ڕەنگە زیادەکان / Additional Colors
- **Purple (مۆر)**: `#A855F7` - `#581C87`
- **Pink (پەمەیی)**: `#EC4899` - `#831843`
- **Gray (خۆڵەمێش)**: `#F9FAFB` - `#111827`

---

## گرادیێنتەکان / Gradients

```typescript
import { GRADIENTS } from '@/constants/design-system';

// بەکارهێنان / Usage
<LinearGradient colors={GRADIENTS.primary} />
<LinearGradient colors={GRADIENTS.sunset} />
<LinearGradient colors={GRADIENTS.ocean} />
```

### گرادیێنتە بەردەستەکان / Available Gradients
- `primary` - شین بۆ مۆر / Blue to Purple
- `secondary` - سەوز بۆ شین / Teal to Blue
- `success` - سەوز / Green shades
- `warning` - زەرد بۆ نارەنجی / Yellow to Orange
- `danger` - سوور / Red shades
- `ocean` - شین بۆ سەوز / Blue to Teal
- `sunset` - زەرد بۆ سوور / Yellow to Red
- `forest` - سەوز تاریک / Dark Green
- `royal` - شین تاریک / Dark Blue

---

## کۆمپۆنێنتە نوێکان / New Components

### 1. ModernCard

کارتێکی نوێ بە چەند جۆر و دیزاینی جوان.

```typescript
import { ModernCard } from '@/components/ModernCard';

// کارتی ئاسایی / Default Card
<ModernCard>
  <Text>ناوەڕۆک</Text>
</ModernCard>

// کارتی گرادیێنت / Gradient Card
<ModernCard 
  variant="gradient" 
  gradientColors={[COLORS.primary[500], COLORS.primary[600]]}
>
  <Text>ناوەڕۆک</Text>
</ModernCard>

// کارتی دەرەکی / Outlined Card
<ModernCard variant="outlined">
  <Text>ناوەڕۆک</Text>
</ModernCard>

// کارتی شووشەیی / Glass Card
<ModernCard variant="glass">
  <Text>ناوەڕۆک</Text>
</ModernCard>

// کارتی کلیک کراو / Pressable Card
<ModernCard onPress={() => console.log('clicked')}>
  <Text>ناوەڕۆک</Text>
</ModernCard>
```

### 2. ModernButton

دوگمەیەکی نوێ بە چەند جۆر و ڕەنگ.

```typescript
import { ModernButton } from '@/components/ModernButton';
import { Plus } from 'lucide-react-native';

// دوگمەی سەرەکی / Primary Button
<ModernButton 
  title="زیادکردن" 
  onPress={() => {}} 
/>

// دوگمەی گرادیێنت / Gradient Button
<ModernButton 
  title="زیادکردن" 
  onPress={() => {}} 
  gradient
/>

// دوگمە بە ئایکۆن / Button with Icon
<ModernButton 
  title="زیادکردن" 
  onPress={() => {}} 
  icon={<Plus size={20} color="white" />}
  iconPosition="left"
/>

// جۆرەکانی تر / Other Variants
<ModernButton variant="success" title="سەرکەوتوو" onPress={() => {}} />
<ModernButton variant="danger" title="سڕینەوە" onPress={() => {}} />
<ModernButton variant="warning" title="ئاگاداری" onPress={() => {}} />
<ModernButton variant="outline" title="دەرەکی" onPress={() => {}} />
<ModernButton variant="ghost" title="شەفاف" onPress={() => {}} />

// قەبارەکان / Sizes
<ModernButton size="sm" title="بچووک" onPress={() => {}} />
<ModernButton size="md" title="ناوەند" onPress={() => {}} />
<ModernButton size="lg" title="گەورە" onPress={() => {}} />

// پانی تەواو / Full Width
<ModernButton fullWidth title="پانی تەواو" onPress={() => {}} />

// بارکردن / Loading
<ModernButton loading title="بارکردن" onPress={() => {}} />
```

### 3. GradientCard (نوێکراوەتەوە / Updated)

کارتی گرادیێنتی نوێکراوە بە دیزاینی باشتر.

```typescript
import { GradientCard } from '@/components/GradientCard';

<GradientCard 
  colors={[COLORS.primary[500], COLORS.primary[600]]}
  intensity="medium"
  variant="elevated"
>
  <Text>ناوەڕۆک</Text>
</GradientCard>
```

---

## سێبەرەکان / Shadows

```typescript
import { SHADOWS } from '@/constants/design-system';

const styles = StyleSheet.create({
  card: {
    ...SHADOWS.md, // سێبەری ناوەند / Medium shadow
  },
});

// بەردەست / Available: sm, md, lg, xl, 2xl
```

---

## بۆشاییەکان / Spacing

```typescript
import { SPACING } from '@/constants/design-system';

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg, // 16
    margin: SPACING.md, // 12
    gap: SPACING.sm, // 8
  },
});

// بەردەست / Available: xs(4), sm(8), md(12), lg(16), xl(20), 2xl(24), 3xl(32), 4xl(40), 5xl(48), 6xl(64)
```

---

## گۆشەکان / Border Radius

```typescript
import { BORDER_RADIUS } from '@/constants/design-system';

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg, // 16
  },
  button: {
    borderRadius: BORDER_RADIUS.md, // 12
  },
});

// بەردەست / Available: xs(4), sm(8), md(12), lg(16), xl(20), 2xl(24), 3xl(32), full(9999)
```

---

## تایپۆگرافی / Typography

```typescript
import { TYPOGRAPHY } from '@/constants/design-system';

const styles = StyleSheet.create({
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'], // 24
    fontWeight: TYPOGRAPHY.fontWeight.bold, // '700'
    lineHeight: TYPOGRAPHY.fontSize['2xl'] * TYPOGRAPHY.lineHeight.tight,
  },
});

// قەبارەی فۆنت / Font Sizes: xs(12), sm(14), base(16), lg(18), xl(20), 2xl(24), 3xl(30), 4xl(36), 5xl(48)
// قەڵەوی فۆنت / Font Weights: normal(400), medium(500), semibold(600), bold(700), extrabold(800)
// بەرزی هێڵ / Line Heights: tight(1.2), normal(1.5), relaxed(1.75)
```

---

## نموونەی بەکارهێنان / Usage Examples

### بەتی داشبۆرد / Dashboard Screen

```typescript
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { COLORS, GRADIENTS, SPACING } from '@/constants/design-system';

export default function Dashboard() {
  return (
    <ScrollView>
      {/* کارتی ئامار / Stats Card */}
      <ModernCard 
        variant="gradient" 
        gradientColors={[COLORS.primary[500], COLORS.primary[600]]}
        elevation="lg"
      >
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
          ١٢٣,٤٥٦ د.ع
        </Text>
        <Text style={{ color: 'white', opacity: 0.9 }}>
          کۆی قەرزەکان
        </Text>
      </ModernCard>

      {/* دوگمەکان / Buttons */}
      <View style={{ gap: SPACING.md }}>
        <ModernButton 
          title="زیادکردنی قەرز" 
          onPress={() => {}}
          gradient
          fullWidth
        />
        <ModernButton 
          title="زیادکردنی پارەدان" 
          onPress={() => {}}
          variant="success"
          gradient
          fullWidth
        />
      </View>
    </ScrollView>
  );
}
```

---

## گۆڕانکاریەکان لە دیزاینی کۆن / Changes from Old Design

### پێش / Before
- ڕەنگە کۆنەکان: `#1E3A8A`, `#3B82F6`
- سێبەرە سادەکان
- کارتە سادەکان

### دوای / After
- ڕەنگە نوێ و جوانەکان بە گرادیێنت
- سێبەرە نەرم و جوانەکان
- کارتە نوێکان بە چەند جۆر
- دوگمە نوێکان بە گرادیێنت و ئایکۆن
- سیستەمێکی تەواو بۆ ڕەنگ، بۆشایی، گۆشە و تایپۆگرافی

---

## ڕێنماییەکان / Guidelines

### ١. بەکارهێنانی ڕەنگ / Color Usage
- بەکارهێنانی `COLORS.primary` بۆ کردارە سەرەکیەکان
- بەکارهێنانی `COLORS.success` بۆ کردارە سەرکەوتووەکان
- بەکارهێنانی `COLORS.danger` بۆ کردارە مەترسیدارەکان
- بەکارهێنانی `COLORS.warning` بۆ ئاگاداریەکان

### ٢. بەکارهێنانی سێبەر / Shadow Usage
- `SHADOWS.sm` بۆ کارتە بچووکەکان
- `SHADOWS.md` بۆ کارتە ئاساییەکان
- `SHADOWS.lg` بۆ کارتە گرنگەکان
- `SHADOWS.xl` بۆ مۆداڵ و پۆپئاپەکان

### ٣. بەکارهێنانی بۆشایی / Spacing Usage
- بەکارهێنانی `SPACING.sm` بۆ بۆشایی نێوان ئیلێمێنتە نزیکەکان
- بەکارهێنانی `SPACING.md` بۆ بۆشایی ئاسایی
- بەکارهێنانی `SPACING.lg` بۆ بۆشایی نێوان بەشەکان

### ٤. بەکارهێنانی گۆشە / Border Radius Usage
- بەکارهێنانی `BORDER_RADIUS.md` بۆ دوگمەکان
- بەکارهێنانی `BORDER_RADIUS.lg` بۆ کارتەکان
- بەکارهێنانی `BORDER_RADIUS.full` بۆ شێوە بازنەییەکان

---

## پشتگیری / Support

بۆ هەر پرسیار یان کێشەیەک، تکایە پەیوەندی بکە.

For any questions or issues, please contact support.
