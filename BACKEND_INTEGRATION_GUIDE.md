# Backend Integration Guide

## Overview

Your Supermarket Credit Management System now has a fully functional backend with:
- **Database**: SQLite with Drizzle ORM
- **API**: tRPC for type-safe API calls
- **Authentication**: JWT-based authentication
- **License Management**: Automatic license validation

---

## Database Schema

### Tables Created:
1. **owners** - Store owners
2. **admins** - Admin users
3. **staff** - Staff members
4. **customers** - Customer records
5. **transactions** - Debt and payment transactions
6. **licenses** - License and subscription management

---

## API Endpoints (tRPC Procedures)

### Owner Operations
```typescript
// Register a new owner
trpc.owner.register.useMutation()
// Input: { name, email, phone, password, storeName, storeAddress?, plan? }
// Returns: { success, token, owner, license }

// Login as owner
trpc.owner.login.useMutation()
// Input: { email, password }
// Returns: { success, token, owner, license }
```

### Admin Operations
```typescript
// Create admin (owner only)
trpc.admin.create.useMutation()
// Input: { name, email, phone, password, permissions[] }
// Returns: { success, admin }

// Login as admin
trpc.admin.login.useMutation()
// Input: { email, password }
// Returns: { success, token, admin }
```

### Staff Operations
```typescript
// Create staff (owner/admin only)
trpc.staff.create.useMutation()
// Input: { name, email, phone, password, role, permissions[] }
// Returns: { success, staff }

// Login as staff
trpc.staff.login.useMutation()
// Input: { email, password }
// Returns: { success, token, staff }
```

### Customer Operations
```typescript
// Create customer
trpc.customer.create.useMutation()
// Input: { name, phone, email?, address?, creditLimit?, ... }
// Returns: { success, customer }

// List customers
trpc.customer.list.useQuery()
// Input: { search?, group?, isActive?, limit?, offset? }
// Returns: { customers[], total }

// Get customer debts
trpc.customer.getDebts.useQuery()
// Input: { customerId }
// Returns: { customer, debts[], payments[], summary }
```

### Transaction Operations
```typescript
// Create transaction (debt or payment)
trpc.transaction.create.useMutation()
// Input: { customerId, type, amount, description?, ... }
// Returns: { success, transaction, customer }
```

### License Operations
```typescript
// Get license status
trpc.license.getStatus.useQuery()
// Returns: { license: { plan, status, expiryDate, features, ... } }

// Renew license (owner only)
trpc.license.renew.useMutation()
// Input: { plan, duration? }
// Returns: { success, license }

// Verify license
trpc.license.verify.useQuery()
// Returns: { isValid, error?, renewUrl?, license? }
```

---

## Authentication Flow

### 1. Registration/Login
```typescript
import { trpc } from '@/lib/trpc';

// Register owner
const registerMutation = trpc.owner.register.useMutation();
const result = await registerMutation.mutateAsync({
  name: "Aram Barzani",
  email: "aram@example.com",
  phone: "+9647501234567",
  password: "securePassword123",
  storeName: "Barzani Supermarket",
  plan: "premium"
});

// Save token
await AsyncStorage.setItem('authToken', result.token);
await AsyncStorage.setItem('user', JSON.stringify(result.owner));
```

### 2. Making Authenticated Requests
The token is automatically included in requests when you use tRPC. Update your `lib/trpc.ts` to include the token:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// In your tRPC client setup
const getAuthToken = async () => {
  return await AsyncStorage.getItem('authToken');
};

// Add to headers
headers: async () => {
  const token = await getAuthToken();
  return {
    authorization: token ? `Bearer ${token}` : '',
  };
}
```

---

## License Validation

All protected endpoints automatically validate:
1. **Authentication** - Valid JWT token required
2. **License Status** - Active and not expired
3. **Resource Limits** - Checks against plan limits

### Error Handling
```typescript
try {
  await trpc.customer.create.mutateAsync({ ... });
} catch (error) {
  if (error.data?.code === 'FORBIDDEN') {
    // License expired or limit reached
    const renewUrl = error.cause?.renewUrl;
    router.push(renewUrl);
  }
}
```

---

## Subscription Plans

### Free Plan
- 0 Admins, 2 Staff, 50 Customers
- 30 days validity
- Features: basic_customers, basic_transactions

### Basic Plan
- 1 Admin, 5 Staff, 200 Customers
- 365 days validity
- Features: + reports, notifications

### Premium Plan
- 3 Admins, 15 Staff, 1000 Customers
- 365 days validity
- Features: + analytics, advanced_reports, whatsapp_integration

### Enterprise Plan
- 10 Admins, 50 Staff, 10,000 Customers
- 365 days validity
- Features: + api_access, custom_branding, priority_support

---

## Example: Complete Registration & Customer Flow

```typescript
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Register Owner
const registerOwner = async () => {
  const result = await trpc.owner.register.mutateAsync({
    name: "Aram Barzani",
    email: "aram@example.com",
    phone: "+9647501234567",
    password: "securePassword123",
    storeName: "Barzani Supermarket",
    plan: "premium"
  });
  
  await AsyncStorage.setItem('authToken', result.token);
  return result;
};

// 2. Create Customer
const createCustomer = async () => {
  const result = await trpc.customer.create.mutateAsync({
    name: "Ahmed Ali",
    phone: "+9647509876543",
    email: "ahmed@example.com",
    creditLimit: 1000000, // 1M IQD
    group: "VIP"
  });
  
  return result.customer;
};

// 3. Add Debt Transaction
const addDebt = async (customerId: string) => {
  const result = await trpc.transaction.create.mutateAsync({
    customerId,
    type: "debt",
    amount: 50000, // 50K IQD
    description: "Grocery purchase",
    category: "groceries",
    status: "pending"
  });
  
  return result;
};

// 4. Get Customer Debts
const getDebts = async (customerId: string) => {
  const result = await trpc.customer.getDebts.useQuery({
    customerId
  });
  
  console.log('Current Debt:', result.summary.currentDebt);
  console.log('Available Credit:', result.summary.availableCredit);
  
  return result;
};
```

---

## Security Features

✅ **Password Hashing** - bcrypt with salt rounds  
✅ **JWT Authentication** - 7-day token expiry  
✅ **License Validation** - Automatic on protected routes  
✅ **Role-Based Access** - Owner/Admin/Staff permissions  
✅ **Resource Limits** - Plan-based restrictions  
✅ **SQL Injection Protection** - Drizzle ORM parameterized queries  

---

## Next Steps

1. **Update Auth Context** - Replace AsyncStorage logic with tRPC calls
2. **Update Customer Context** - Use `trpc.customer.*` endpoints
3. **Update Debt Context** - Use `trpc.transaction.*` endpoints
4. **Add License Monitoring** - Show expiry warnings in UI
5. **Handle Offline Mode** - Queue mutations when offline

---

## Database Location

The SQLite database is stored at: `./data/database.db`

To reset the database, delete this file and restart the server.

---

## Support

For issues or questions:
- Check error messages in console
- Verify JWT token is being sent
- Confirm license is active
- Check resource limits for your plan

---

**Backend is now fully connected! 🎉**

All operations flow through:
**Owner → Admin → Staff → Customer → Transactions → License Validation**
