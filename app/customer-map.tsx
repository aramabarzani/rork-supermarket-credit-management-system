import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KurdishText } from '@/components/KurdishText';
import { MapContext, useMap } from '@/hooks/map-context';
import {
  MapPin,
  Navigation,
  Filter,
  Route,
  Users,
  DollarSign,
  Phone,
  CheckCircle,
} from 'lucide-react-native';

function CustomerMapContent() {
  const router = useRouter();
  const { customerLocations, routes, isLoading, filters, setFilters, createRoute, optimizeRoute } = useMap();
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [routeName, setRouteName] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const toggleCustomerSelection = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  const handleCreateRoute = async () => {
    if (selectedCustomers.length === 0) {
      Alert.alert('هەڵە', 'تکایە کڕیارێک هەڵبژێرە');
      return;
    }

    if (!routeName.trim()) {
      Alert.alert('هەڵە', 'تکایە ناوی ڕێگا بنووسە');
      return;
    }

    const selectedLocations = customerLocations.filter(loc => 
      selectedCustomers.includes(loc.customerId)
    );

    const optimized = optimizeRoute(selectedLocations);

    try {
      await createRoute({
        name: routeName,
        date: new Date().toISOString(),
        assignedTo: 'current-user',
        assignedToName: 'کارمەند',
        customers: optimized,
        totalDistance: 0,
        estimatedTime: 0,
        status: 'planned',
      });

      Alert.alert('سەرکەوتوو', 'ڕێگا بە سەرکەوتوویی دروستکرا');
      setSelectedCustomers([]);
      setRouteName('');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە دروستکردنی ڕێگا');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <KurdishText style={styles.loadingText}>چاوەڕوان بە...</KurdishText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MapPin size={20} color="#6366f1" />
            <KurdishText style={styles.statValue}>{customerLocations.length}</KurdishText>
            <KurdishText style={styles.statLabel}>کڕیار</KurdishText>
          </View>
          <View style={styles.statCard}>
            <Route size={20} color="#10B981" />
            <KurdishText style={styles.statValue}>{routes.length}</KurdishText>
            <KurdishText style={styles.statLabel}>ڕێگا</KurdishText>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={20} color="#F59E0B" />
            <KurdishText style={styles.statValue}>{selectedCustomers.length}</KurdishText>
            <KurdishText style={styles.statLabel}>هەڵبژێردراو</KurdishText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#6366f1" />
          <KurdishText style={styles.filterButtonText}>فلتەر</KurdishText>
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <TextInput
              style={styles.filterInput}
              placeholder="کەمترین قەرز"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={filters.minDebt?.toString() || ''}
              onChangeText={(text) => setFilters({ ...filters, minDebt: text ? parseInt(text) : undefined })}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="زۆرترین قەرز"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={filters.maxDebt?.toString() || ''}
              onChangeText={(text) => setFilters({ ...filters, maxDebt: text ? parseInt(text) : undefined })}
            />
          </View>
        )}
      </View>

      {selectedCustomers.length > 0 && (
        <View style={styles.routeCreator}>
          <KurdishText style={styles.routeCreatorTitle}>دروستکردنی ڕێگا</KurdishText>
          <TextInput
            style={styles.routeNameInput}
            placeholder="ناوی ڕێگا"
            placeholderTextColor="#9CA3AF"
            value={routeName}
            onChangeText={setRouteName}
          />
          <TouchableOpacity style={styles.createRouteButton} onPress={handleCreateRoute}>
            <Navigation size={20} color="#FFFFFF" />
            <KurdishText style={styles.createRouteButtonText}>دروستکردنی ڕێگا</KurdishText>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={24} color="#6366f1" />
          <KurdishText style={styles.sectionTitle}>کڕیارەکان</KurdishText>
        </View>

        {customerLocations.map((location) => (
          <TouchableOpacity
            key={location.customerId}
            style={[
              styles.locationCard,
              selectedCustomers.includes(location.customerId) && styles.locationCardSelected,
            ]}
            onPress={() => toggleCustomerSelection(location.customerId)}
          >
            <View style={styles.locationHeader}>
              <View style={styles.locationNameRow}>
                <MapPin size={20} color="#6366f1" />
                <KurdishText style={styles.locationName}>{location.customerName}</KurdishText>
              </View>
              {selectedCustomers.includes(location.customerId) && (
                <CheckCircle size={20} color="#10B981" />
              )}
            </View>

            <View style={styles.locationDetails}>
              <View style={styles.locationRow}>
                <MapPin size={14} color="#6B7280" />
                <KurdishText style={styles.locationText}>{location.address}</KurdishText>
              </View>
              <View style={styles.locationRow}>
                <Phone size={14} color="#6B7280" />
                <KurdishText style={styles.locationText}>{location.phone}</KurdishText>
              </View>
              <View style={styles.locationRow}>
                <DollarSign size={14} color="#6B7280" />
                <KurdishText style={styles.locationText}>
                  {formatCurrency(location.remainingDebt)} IQD
                </KurdishText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Route size={24} color="#6366f1" />
          <KurdishText style={styles.sectionTitle}>ڕێگاکان</KurdishText>
        </View>

        {routes.length === 0 ? (
          <View style={styles.emptyState}>
            <Route size={48} color="#D1D5DB" />
            <KurdishText style={styles.emptyText}>هیچ ڕێگایەک نییە</KurdishText>
          </View>
        ) : (
          routes.map((route) => (
            <View key={route.id} style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <KurdishText style={styles.routeName}>{route.name}</KurdishText>
                <View
                  style={[
                    styles.statusBadge,
                    route.status === 'planned' && styles.statusPlanned,
                    route.status === 'in-progress' && styles.statusInProgress,
                    route.status === 'completed' && styles.statusCompleted,
                  ]}
                >
                  <KurdishText style={styles.statusText}>
                    {route.status === 'planned' && 'پلاندانراو'}
                    {route.status === 'in-progress' && 'بەردەوامە'}
                    {route.status === 'completed' && 'تەواو'}
                  </KurdishText>
                </View>
              </View>
              <View style={styles.routeDetails}>
                <View style={styles.routeRow}>
                  <Users size={14} color="#6B7280" />
                  <KurdishText style={styles.routeText}>
                    {route.customers.length} کڕیار
                  </KurdishText>
                </View>
                <View style={styles.routeRow}>
                  <Navigation size={14} color="#6B7280" />
                  <KurdishText style={styles.routeText}>{route.assignedToName}</KurdishText>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

export default function CustomerMapScreen() {
  return (
    <MapContext>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'نەخشەی کڕیاران',
            headerStyle: { backgroundColor: '#6366f1' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontFamily: 'Rabar_029' },
          }}
        />
        <CustomerMapContent />
      </SafeAreaView>
    </MapContext>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600' as const,
  },
  filtersContainer: {
    marginTop: 12,
    gap: 8,
  },
  filterInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  routeCreator: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  routeCreatorTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  routeNameInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  createRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  createRouteButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  locationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#EEF2FF',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  locationDetails: {
    gap: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  routeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusPlanned: {
    backgroundColor: '#DBEAFE',
  },
  statusInProgress: {
    backgroundColor: '#FEF3C7',
  },
  statusCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  routeDetails: {
    gap: 6,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
