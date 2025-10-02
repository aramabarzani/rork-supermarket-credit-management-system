import { useState, useCallback, useMemo, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CustomerLocation, DebtCollectionRoute, MapFilters } from '@/types/map';
import type { Customer } from '@/types/customer';
import type { Debt } from '@/types/debt';

export const [MapContext, useMap] = createContextHook(() => {
  const [customerLocations, setCustomerLocations] = useState<CustomerLocation[]>([]);
  const [routes, setRoutes] = useState<DebtCollectionRoute[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<MapFilters>({});

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [customersData, debtsData, routesData] = await Promise.all([
        AsyncStorage.getItem('users'),
        AsyncStorage.getItem('debts'),
        AsyncStorage.getItem('debt_collection_routes'),
      ]);

      const customers: Customer[] = customersData ? JSON.parse(customersData) : [];
      const debts: Debt[] = debtsData ? JSON.parse(debtsData) : [];

      const locations: CustomerLocation[] = customers
        .filter(c => c.address)
        .map(customer => {
          const customerDebts = debts.filter(d => d.customerId === customer.id);
          const totalDebt = customerDebts.reduce((sum, d) => sum + d.amount, 0);
          const remainingDebt = customerDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

          const lat = 36.1911 + (Math.random() - 0.5) * 0.1;
          const lng = 44.0092 + (Math.random() - 0.5) * 0.1;

          return {
            customerId: customer.id,
            customerName: customer.name,
            latitude: lat,
            longitude: lng,
            address: customer.address || '',
            city: customer.city || 'هەولێر',
            phone: customer.phone || '',
            totalDebt,
            remainingDebt,
          };
        });

      setCustomerLocations(locations);

      if (routesData) {
        setRoutes(JSON.parse(routesData));
      }
    } catch (error) {
      console.error('[Map] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createRoute = useCallback(async (route: Omit<DebtCollectionRoute, 'id' | 'createdAt'>) => {
    const newRoute: DebtCollectionRoute = {
      ...route,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const updated = [...routes, newRoute];
    await AsyncStorage.setItem('debt_collection_routes', JSON.stringify(updated));
    setRoutes(updated);
    return newRoute;
  }, [routes]);

  const updateRoute = useCallback(async (routeId: string, updates: Partial<DebtCollectionRoute>) => {
    const updated = routes.map(r => r.id === routeId ? { ...r, ...updates } : r);
    await AsyncStorage.setItem('debt_collection_routes', JSON.stringify(updated));
    setRoutes(updated);
  }, [routes]);

  const deleteRoute = useCallback(async (routeId: string) => {
    const updated = routes.filter(r => r.id !== routeId);
    await AsyncStorage.setItem('debt_collection_routes', JSON.stringify(updated));
    setRoutes(updated);
  }, [routes]);

  const calculateDistance = useCallback((loc1: CustomerLocation, loc2: CustomerLocation): number => {
    const R = 6371;
    const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const optimizeRoute = useCallback((customers: CustomerLocation[]) => {
    if (customers.length <= 1) return customers;

    const optimized = [...customers];
    let improved = true;

    while (improved) {
      improved = false;
      for (let i = 0; i < optimized.length - 1; i++) {
        for (let j = i + 1; j < optimized.length; j++) {
          const currentDistance = 
            calculateDistance(optimized[i], optimized[i + 1]) +
            (j < optimized.length - 1 ? calculateDistance(optimized[j], optimized[j + 1]) : 0);

          const [a, b] = [optimized[i + 1], optimized[j]];
          optimized[i + 1] = b;
          optimized[j] = a;

          const newDistance = 
            calculateDistance(optimized[i], optimized[i + 1]) +
            (j < optimized.length - 1 ? calculateDistance(optimized[j], optimized[j + 1]) : 0);

          if (newDistance < currentDistance) {
            improved = true;
          } else {
            optimized[i + 1] = a;
            optimized[j] = b;
          }
        }
      }
    }

    return optimized;
  }, [calculateDistance]);

  const filteredLocations = useMemo(() => {
    return customerLocations.filter(loc => {
      if (filters.city && loc.city !== filters.city) return false;
      if (filters.minDebt && loc.remainingDebt < filters.minDebt) return false;
      if (filters.maxDebt && loc.remainingDebt > filters.maxDebt) return false;
      if (filters.hasDebt !== undefined && (loc.remainingDebt > 0) !== filters.hasDebt) return false;
      return true;
    });
  }, [customerLocations, filters]);

  return useMemo(
    () => ({
      customerLocations: filteredLocations,
      allLocations: customerLocations,
      routes,
      isLoading,
      filters,
      setFilters,
      createRoute,
      updateRoute,
      deleteRoute,
      optimizeRoute,
      calculateDistance,
      refreshData: loadData,
    }),
    [filteredLocations, customerLocations, routes, isLoading, filters, createRoute, updateRoute, deleteRoute, optimizeRoute, calculateDistance, loadData]
  );
});
