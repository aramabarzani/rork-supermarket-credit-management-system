# Backend Usage Examples

## Quick Start Examples

### 1. Owner Registration & Login

```typescript
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Register new owner
export function OwnerRegistration() {
  const registerMutation = trpc.owner.register.useMutation({
    onSuccess: async (data) => {
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.owner));
      await AsyncStorage.setItem('userRole', 'owner');
      router.replace('/owner-dashboard');
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const handleRegister = () => {
    registerMutation.mutate({
      name: "Aram Barzani",
      email: "aram@example.com",
      phone: "+9647501234567",
      password: "securePassword123",
      storeName: "Barzani Supermarket",
      storeAddress: "Erbil, Kurdistan",
      plan: "premium"
    });
  };

  return (
    <Button 
      onPress={handleRegister}
      loading={registerMutation.isPending}
    >
      Register
    </Button>
  );
}

// Login owner
export function OwnerLogin() {
  const loginMutation = trpc.owner.login.useMutation({
    onSuccess: async (data) => {
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.owner));
      await AsyncStorage.setItem('userRole', 'owner');
      router.replace('/owner-dashboard');
    }
  });

  const handleLogin = (email: string, password: string) => {
    loginMutation.mutate({ email, password });
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

---

### 2. Admin Management

```typescript
// Create Admin (Owner only)
export function CreateAdmin() {
  const createAdminMutation = trpc.admin.create.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', `Admin ${data.admin.name} created!`);
    },
    onError: (error) => {
      if (error.data?.code === 'FORBIDDEN') {
        Alert.alert('Limit Reached', error.message);
        router.push('/subscription-details');
      }
    }
  });

  const handleCreate = () => {
    createAdminMutation.mutate({
      name: "Ahmed Ali",
      email: "ahmed@example.com",
      phone: "+9647509876543",
      password: "adminPass123",
      permissions: [
        "manage_customers",
        "manage_transactions",
        "view_reports"
      ]
    });
  };

  return <Button onPress={handleCreate}>Create Admin</Button>;
}

// Admin Login
export function AdminLogin() {
  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: async (data) => {
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.admin));
      await AsyncStorage.setItem('userRole', 'admin');
      router.replace('/(tabs)/dashboard');
    }
  });

  return <LoginForm onSubmit={(email, password) => 
    loginMutation.mutate({ email, password })
  } />;
}
```

---

### 3. Staff Management

```typescript
// Create Staff
export function CreateStaff() {
  const createStaffMutation = trpc.staff.create.useMutation();

  const handleCreate = () => {
    createStaffMutation.mutate({
      name: "Sara Mohammed",
      email: "sara@example.com",
      phone: "+9647501112233",
      password: "staffPass123",
      role: "cashier",
      permissions: [
        "add_customer",
        "add_transaction",
        "view_customer_debts"
      ]
    });
  };

  return <Button onPress={handleCreate}>Add Staff</Button>;
}
```

---

### 4. Customer Operations

```typescript
// Create Customer
export function AddCustomer() {
  const createCustomerMutation = trpc.customer.create.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', `Customer ${data.customer.name} added!`);
      router.back();
    },
    onError: (error) => {
      if (error.data?.code === 'FORBIDDEN') {
        Alert.alert('Customer Limit Reached', 
          'Upgrade your plan to add more customers');
        router.push('/subscription-details');
      }
    }
  });

  const handleSubmit = (formData: any) => {
    createCustomerMutation.mutate({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      creditLimit: parseFloat(formData.creditLimit),
      group: formData.group,
      rating: formData.rating,
      notes: formData.notes
    });
  };

  return <CustomerForm onSubmit={handleSubmit} />;
}

// List Customers
export function CustomerList() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<string>();

  const { data, isLoading, refetch } = trpc.customer.list.useQuery({
    search,
    group,
    isActive: true,
    limit: 50,
    offset: 0
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View>
      <SearchBar value={search} onChangeText={setSearch} />
      <FlatList
        data={data?.customers}
        renderItem={({ item }) => (
          <CustomerCard customer={item} />
        )}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </View>
  );
}

// Get Customer Debts
export function CustomerDebts({ customerId }: { customerId: string }) {
  const { data, isLoading } = trpc.customer.getDebts.useQuery({
    customerId
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View>
      <Text>Customer: {data?.customer.name}</Text>
      <Text>Total Debt: {data?.summary.totalDebt} IQD</Text>
      <Text>Total Paid: {data?.summary.totalPaid} IQD</Text>
      <Text>Current Debt: {data?.summary.currentDebt} IQD</Text>
      <Text>Available Credit: {data?.summary.availableCredit} IQD</Text>

      <Text style={{ marginTop: 20 }}>Debts:</Text>
      {data?.debts.map(debt => (
        <DebtCard key={debt.id} debt={debt} />
      ))}

      <Text style={{ marginTop: 20 }}>Payments:</Text>
      {data?.payments.map(payment => (
        <PaymentCard key={payment.id} payment={payment} />
      ))}
    </View>
  );
}
```

---

### 5. Transaction Operations

```typescript
// Add Debt
export function AddDebt({ customerId }: { customerId: string }) {
  const createTransactionMutation = trpc.transaction.create.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', 
        `Debt added. Current debt: ${data.customer.currentDebt} IQD`);
      router.back();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const handleSubmit = (formData: any) => {
    createTransactionMutation.mutate({
      customerId,
      type: "debt",
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      dueDate: formData.dueDate,
      status: "pending"
    });
  };

  return <DebtForm onSubmit={handleSubmit} />;
}

// Add Payment
export function AddPayment({ customerId }: { customerId: string }) {
  const createTransactionMutation = trpc.transaction.create.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', 
        `Payment recorded. Remaining debt: ${data.customer.currentDebt} IQD`);
      router.back();
    }
  });

  const handleSubmit = (formData: any) => {
    createTransactionMutation.mutate({
      customerId,
      type: "payment",
      amount: parseFloat(formData.amount),
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      status: "completed"
    });
  };

  return <PaymentForm onSubmit={handleSubmit} />;
}
```

---

### 6. License Management

```typescript
// Check License Status
export function LicenseStatus() {
  const { data, isLoading } = trpc.license.getStatus.useQuery();

  if (isLoading) return <LoadingSpinner />;

  const isExpiringSoon = data && data.license.daysRemaining < 30;

  return (
    <View>
      <Text>Plan: {data?.license.plan}</Text>
      <Text>Status: {data?.license.status}</Text>
      <Text>Days Remaining: {data?.license.daysRemaining}</Text>
      
      {isExpiringSoon && (
        <Alert severity="warning">
          Your license expires in {data.license.daysRemaining} days!
        </Alert>
      )}

      <Text>Limits:</Text>
      <Text>- Max Admins: {data?.license.maxAdmins}</Text>
      <Text>- Max Staff: {data?.license.maxStaff}</Text>
      <Text>- Max Customers: {data?.license.maxCustomers}</Text>

      <Text>Features:</Text>
      {data?.license.features.map(feature => (
        <Text key={feature}>✓ {feature}</Text>
      ))}
    </View>
  );
}

// Renew License
export function RenewLicense() {
  const renewMutation = trpc.license.renew.useMutation({
    onSuccess: (data) => {
      Alert.alert('Success', 
        `License renewed! New expiry: ${data.license.expiryDate}`);
    }
  });

  const handleRenew = (plan: string) => {
    renewMutation.mutate({
      plan: plan as "free" | "basic" | "premium" | "enterprise",
      duration: 365
    });
  };

  return (
    <View>
      <Button onPress={() => handleRenew('basic')}>
        Renew Basic - $99/year
      </Button>
      <Button onPress={() => handleRenew('premium')}>
        Renew Premium - $299/year
      </Button>
      <Button onPress={() => handleRenew('enterprise')}>
        Renew Enterprise - $999/year
      </Button>
    </View>
  );
}

// Verify License (for middleware)
export function useLicenseCheck() {
  const { data } = trpc.license.verify.useQuery();

  useEffect(() => {
    if (data && !data.isValid) {
      Alert.alert('License Issue', data.error || 'License validation failed', [
        {
          text: 'Renew',
          onPress: () => router.push(data.renewUrl || '/subscription-details')
        }
      ]);
    }
  }, [data]);

  return data;
}
```

---

### 7. Error Handling

```typescript
// Global Error Handler
export function useGlobalErrorHandler() {
  const handleError = (error: any) => {
    console.error('API Error:', error);

    switch (error.data?.code) {
      case 'UNAUTHORIZED':
        Alert.alert('Authentication Required', 'Please login again');
        AsyncStorage.clear();
        router.replace('/login');
        break;

      case 'FORBIDDEN':
        if (error.cause?.renewUrl) {
          Alert.alert('License Issue', error.message, [
            {
              text: 'Renew',
              onPress: () => router.push(error.cause.renewUrl)
            }
          ]);
        } else {
          Alert.alert('Access Denied', error.message);
        }
        break;

      case 'NOT_FOUND':
        Alert.alert('Not Found', error.message);
        break;

      case 'CONFLICT':
        Alert.alert('Conflict', error.message);
        break;

      case 'BAD_REQUEST':
        Alert.alert('Invalid Request', error.message);
        break;

      default:
        Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  return { handleError };
}
```

---

### 8. Complete Auth Context Example

```typescript
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const [AuthContext, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginOwnerMutation = trpc.owner.login.useMutation();
  const loginAdminMutation = trpc.admin.login.useMutation();
  const loginStaffMutation = trpc.staff.login.useMutation();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginOwner = async (email: string, password: string) => {
    const result = await loginOwnerMutation.mutateAsync({ email, password });
    await AsyncStorage.setItem('authToken', result.token);
    await AsyncStorage.setItem('user', JSON.stringify(result.owner));
    await AsyncStorage.setItem('userRole', 'owner');
    setToken(result.token);
    setUser(result.owner);
    return result;
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setToken(null);
    setUser(null);
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    loginOwner,
    logout
  };
});
```

---

## Testing the Backend

```typescript
// Test in your app
import { trpc } from '@/lib/trpc';

export function TestBackend() {
  const testConnection = async () => {
    try {
      // Test registration
      const result = await trpc.owner.register.mutateAsync({
        name: "Test Owner",
        email: "test@example.com",
        phone: "+9647501234567",
        password: "test123",
        storeName: "Test Store",
        plan: "free"
      });
      
      console.log('✅ Registration successful:', result);
      
      // Test login
      const loginResult = await trpc.owner.login.mutateAsync({
        email: "test@example.com",
        password: "test123"
      });
      
      console.log('✅ Login successful:', loginResult);
      
      Alert.alert('Success', 'Backend is working!');
    } catch (error) {
      console.error('❌ Backend test failed:', error);
      Alert.alert('Error', 'Backend test failed');
    }
  };

  return <Button onPress={testConnection}>Test Backend</Button>;
}
```

---

**All examples are ready to use! Copy and adapt them to your needs.** 🚀
