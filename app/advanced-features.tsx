import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft,
  Calendar,
  Percent,
  TrendingUp,
  Shield,
  Package,
  Scale,
  Phone,
  FileX,
  Handshake,
  CreditCard,
  Users,
  Bell,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  route?: string;
  comingSoon?: boolean;
}

export default function AdvancedFeaturesScreen() {
  const router = useRouter();

  const features: Feature[] = [
    {
      id: 'installments',
      title: 'بەشەکان (قیست)',
      description: 'دابەشکردنی قەرز بۆ چەند بەشێک بە شێوەی ڕۆژانە، هەفتانە یان مانگانە',
      icon: Calendar,
      color: '#3B82F6',
      route: '/installment-management',
    },
    {
      id: 'discounts',
      title: 'داشکاندن',
      description: 'بەڕێوەبردنی داشکاندنی قەرز بە شێوەی ڕێژەیی یان بڕی دیاریکراو',
      icon: Percent,
      color: '#10B981',
      route: '/discount-management',
    },
    {
      id: 'interest',
      title: 'سوود',
      description: 'حیسابکردنی سوود لەسەر قەرزە دواکەوتووەکان',
      icon: TrendingUp,
      color: '#F59E0B',
      route: '/interest-management',
    },
    {
      id: 'guarantees',
      title: 'زامن',
      description: 'بەڕێوەبردنی زامنەکان و زانیاریەکانیان',
      icon: Shield,
      color: '#8B5CF6',
      route: '/guarantee-management',
    },
    {
      id: 'collateral',
      title: 'بارمتە',
      description: 'بەڕێوەبردنی بارمتەکان (موڵک، ئۆتۆمبێل، زێڕ...)',
      icon: Package,
      color: '#EC4899',
      route: '/collateral-management',
    },
    {
      id: 'legal',
      title: 'کێشەی یاسایی',
      description: 'بەڕێوەبردنی کێشە یاساییەکان و دادگاکان',
      icon: Scale,
      color: '#EF4444',
      route: '/legal-management',
    },
    {
      id: 'collection',
      title: 'هەوڵی کۆکردنەوە',
      description: 'تۆمارکردنی هەوڵەکانی کۆکردنەوەی قەرز',
      icon: Phone,
      color: '#14B8A6',
      route: '/collection-management',
    },
    {
      id: 'writeoff',
      title: 'سڕینەوەی قەرز',
      description: 'سڕینەوەی قەرزە کۆنەکراوەکان',
      icon: FileX,
      color: '#6B7280',
      route: '/writeoff-management',
    },
    {
      id: 'settlement',
      title: 'ڕێککەوتن',
      description: 'ڕێککەوتن لەسەر بڕێکی کەمتر لە قەرزی سەرەکی',
      icon: Handshake,
      color: '#06B6D4',
      route: '/settlement-management',
    },
    {
      id: 'payment-methods',
      title: 'شێوازەکانی پارەدان',
      description: 'بەڕێوەبردنی شێوازەکانی جیاوازی پارەدان',
      icon: CreditCard,
      color: '#A855F7',
      route: '/payment-methods',
    },
    {
      id: 'customer-groups',
      title: 'گرووپەکانی کڕیار',
      description: 'دابەشکردنی کڕیارەکان بۆ گرووپەکان',
      icon: Users,
      color: '#F97316',
      route: '/customer-groups',
    },
    {
      id: 'auto-reminders',
      title: 'بیرخستنەوەی خۆکار',
      description: 'ناردنی بیرخستنەوەی خۆکار بۆ کڕیارەکان',
      icon: Bell,
      color: '#84CC16',
      route: '/auto-reminders',
    },
    {
      id: 'contracts',
      title: 'گرێبەستەکان',
      description: 'دروستکردن و بەڕێوەبردنی گرێبەستەکان',
      icon: FileText,
      color: '#0EA5E9',
      route: '/contract-management',
    },
    {
      id: 'credit-limits',
      title: 'سنووری قەرز',
      description: 'دیاریکردنی سنووری قەرز بۆ هەر کڕیارێک',
      icon: DollarSign,
      color: '#22C55E',
      route: '/credit-limits',
    },
    {
      id: 'risk-assessment',
      title: 'هەڵسەنگاندنی مەترسی',
      description: 'هەڵسەنگاندنی مەترسی کڕیارەکان',
      icon: AlertTriangle,
      color: '#EAB308',
      route: '/risk-assessment',
    },
    {
      id: 'approval-workflow',
      title: 'ڕێگای پەسەندکردن',
      description: 'سیستەمی پەسەندکردنی قەرزە گەورەکان',
      icon: CheckCircle,
      color: '#10B981',
      route: '/approval-workflow',
    },
  ];

  const handleFeaturePress = (feature: Feature) => {
    if (feature.comingSoon) {
      return;
    }
    if (feature.route) {
      router.push(feature.route as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <KurdishText style={styles.headerTitle}>{'تایبەتمەندییە پێشکەوتووەکان'}</KurdishText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.description}>
            <KurdishText style={styles.descriptionText}>
              {'تایبەتمەندییە پێشکەوتووەکان بۆ بەڕێوەبردنی باشتری قەرزەکان'}
            </KurdishText>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[styles.featureCard, feature.comingSoon && styles.featureCardDisabled]}
                onPress={() => handleFeaturePress(feature)}
                disabled={feature.comingSoon}
              >
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                  <feature.icon size={28} color={feature.color} />
                </View>
                <KurdishText style={styles.featureTitle}>{feature.title}</KurdishText>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                {feature.comingSoon && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>بەم زووانە</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
  },
  description: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  descriptionText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureCardDisabled: {
    opacity: 0.6,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
