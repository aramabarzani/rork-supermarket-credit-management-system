# باکێندەکە بە تەواوی بەستراوەتەوە ✅

## چی کرا؟

### 1. Auth Context نوێکرایەوە
- ئێستا `auth-context.tsx` لە tRPC API کەڵک وەردەگرێت بەجیاتی AsyncStorage
- هەموو login ئۆپەرەیشنەکان لە ڕێگەی باکێندەوە ئەنجام دەدرێن
- JWT token لە AsyncStorage هەڵدەگیرێت بۆ authentication

### 2. چۆن کار دەکات؟

#### Login Process:
```typescript
// کاتێک بەکارهێنەر login دەکات:
1. auth-context.tsx داواکاری دەنێرێت بۆ باکێند
2. باکێند email و password چێک دەکات
3. باکێند license status چێک دەکات
4. ئەگەر هەموو شتێک باش بوو، JWT token دەگەڕێتەوە
5. Token لە AsyncStorage هەڵدەگیرێت
6. بەکارهێنەر دەچێتە ژوورەوە
```

#### API Calls:
```typescript
// هەموو داواکاریەکانی تر بە خۆکاری token دەنێرن:
const customers = await trpcClient.customer.list.query({
  search: 'ئارام',
  limit: 50
});
```

## چۆن لە باکێندەکە کەڵک وەربگریت؟

### لە React Components:
```typescript
import { trpc } from '@/lib/trpc';

function CustomersScreen() {
  // بەکارهێنانی React Query
  const customersQuery = trpc.customer.list.useQuery({
    search: '',
    limit: 50
  });

  if (customersQuery.isLoading) return <Text>Loading...</Text>;
  if (customersQuery.error) return <Text>Error!</Text>;

  return (
    <FlatList
      data={customersQuery.data?.customers}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

### لە Non-React Files (utils, contexts):
```typescript
import { trpcClient } from '@/lib/trpc';

async function getCustomerDebts(customerId: string) {
  const result = await trpcClient.customer.getDebts.query({
    customerId
  });
  return result.debts;
}
```

## API Endpoints ئامادەن:

### Owner:
- ✅ `trpc.owner.register.mutate()` - تۆمارکردنی خاوەنی نوێ
- ✅ `trpc.owner.login.mutate()` - چوونەژوورەوەی خاوەن

### Admin:
- ✅ `trpc.admin.create.mutate()` - دروستکردنی ئەدمین
- ✅ `trpc.admin.login.mutate()` - چوونەژوورەوەی ئەدمین

### Staff:
- ✅ `trpc.staff.create.mutate()` - دروستکردنی کارمەند
- ✅ `trpc.staff.login.mutate()` - چوونەژوورەوەی کارمەند

### Customer:
- ✅ `trpc.customer.create.mutate()` - زیادکردنی کڕیار
- ✅ `trpc.customer.list.query()` - لیستی کڕیاران
- ✅ `trpc.customer.getDebts.query()` - قەرزەکانی کڕیار

### Transaction:
- ✅ `trpc.transaction.create.mutate()` - دروستکردنی مامەڵە

### License:
- ✅ `trpc.license.getStatus.query()` - بینینی دۆخی مۆڵەت
- ✅ `trpc.license.renew.mutate()` - نوێکردنەوەی مۆڵەت
- ✅ `trpc.license.verify.query()` - پشتڕاستکردنەوەی مۆڵەت

## نموونەی بەکارهێنان:

### 1. تۆمارکردنی خاوەنی نوێ:
```typescript
const result = await trpcClient.owner.register.mutate({
  name: 'ئارام بارزانی',
  email: 'aram@example.com',
  phone: '07501234567',
  password: 'password123',
  storeName: 'سوپەرمارکێتی ئارام',
  storeAddress: 'هەولێر',
  plan: 'premium'
});

// result دەگەڕێتەوە:
// {
//   success: true,
//   token: 'jwt_token_here',
//   owner: { id, name, email, storeName },
//   license: { plan, expiryDate }
// }
```

### 2. زیادکردنی کڕیار:
```typescript
const customer = await trpcClient.customer.create.mutate({
  name: 'سەرهەنگ حەسەن',
  phone: '07509876543',
  email: 'sarhang@example.com',
  address: 'سلێمانی',
  creditLimit: 1000000,
  group: 'vip'
});
```

### 3. دروستکردنی مامەڵە:
```typescript
const transaction = await trpcClient.transaction.create.mutate({
  customerId: 'customer_id_here',
  type: 'debt',
  amount: 50000,
  description: 'کڕینی بەرهەم',
  category: 'grocery',
  paymentMethod: 'cash'
});
```

### 4. وەرگرتنی لیستی کڕیاران:
```typescript
const { customers, total } = await trpcClient.customer.list.query({
  search: 'ئارام',
  group: 'vip',
  isActive: true,
  limit: 50,
  offset: 0
});
```

## تێبینیەکان:

1. **Authentication**: هەموو API calls بە خۆکاری JWT token دەنێرن لە header
2. **License Check**: باکێند بە خۆکاری license چێک دەکات پێش هەر operation
3. **Error Handling**: هەموو هەڵەکان بە شێوەیەکی یەکگرتوو handle دەکرێن
4. **Type Safety**: هەموو API calls بە تەواوی typed ن بە TypeScript

## هاتووی داهاتوو:

ئێستا دەتوانیت:
1. لاپەڕەکانت نوێ بکەیتەوە بۆ بەکارهێنانی باکێند بەجیاتی AsyncStorage
2. Context-ەکانی تر (debt, users, etc.) نوێ بکەیتەوە
3. فیچەری نوێ زیاد بکەیت بە دروستکردنی tRPC routes نوێ

---

**باکێندەکە ئامادەیە و کاردەکات! 🎉**
