# ڕێنمایی سیستەمی لایسێنس

## چۆنیەتی کارکردنی سیستەم

سیستەمی لایسێنس ئێستا بە **AsyncStorage** بەستراوەتەوە، واتە هەموو داتاکان لە ئامێری بەکارهێنەر هەڵدەگیرێن.

### تایبەتمەندیە سەرەکییەکان

#### 1. بەڕێوەبردنی لایسێنس (License Management)
- **شوێن**: `app/license-management.tsx`
- **Backend**: `backend/trpc/routes/license/management/route.ts`
- **Storage Key**: `licenses`

**تایبەتمەندییەکان**:
- دروستکردنی لایسێنسی نوێ
- پشتڕاستکردنەوەی لایسێنس
- نوێکردنەوەی دۆخی لایسێنس (چالاک، ڕاگیراو، بەسەرچوو)
- نوێکردنەوەی ماوەی لایسێنس
- چالاککردن/ناچالاککردنی لایسێنس
- گواستنەوەی لایسێنس بۆ ئامێری تر

#### 2. بەڕێوەبردنی کڕیاران (Tenant Management)
- **Backend**: `backend/trpc/routes/tenant/management/route.ts`
- **Storage Key**: `tenants`

**تایبەتمەندییەکان**:
- دروستکردنی کڕیاری نوێ
- بەڕێوەبردنی ڕێکخستنەکان (ژمارەی بەکارهێنەر، کڕیار، لق)
- نوێکردنەوەی ئاماری کڕیار
- درێژکردنەوەی لایسێنسی کڕیار

#### 3. بەڕێوەبردنی بەشداری (Subscription Management)
- **Backend**: `backend/trpc/routes/subscription/management/route.ts`
- **Storage Keys**: `subscriptions`, `subscription_payments`

**پلانەکان**:
- **Basic**: 50,000 IQD/مانگ - 5 بەکارهێنەر، 100 کڕیار
- **Professional**: 100,000 IQD/مانگ - 20 بەکارهێنەر، 500 کڕیار
- **Enterprise**: 200,000 IQD/مانگ - بێسنوور

## چۆنیەتی بەکارهێنان

### وەک خاوەندار/دابینکەر

1. **چوونە ژوورەوە**:
   - ژمارەی مۆبایل: `07501234567`
   - وشەی نهێنی: `admin123`

2. **دەستگەیشتن بە لایسێنس**:
   - لە مێنیوی سەرەکی، بڕۆ بۆ "بەڕێوەبردنی لایسێنس"
   - دەتوانیت لایسێنسی نوێ دروست بکەیت
   - دەتوانیت دۆخی لایسێنسەکان بگۆڕیت
   - دەتوانیت لایسێنسەکان نوێ بکەیتەوە

3. **دروستکردنی لایسێنسی نوێ**:
   ```
   - کلیک لەسەر دوگمەی "لایسێنسی نوێ"
   - پڕکردنەوەی زانیاریەکان:
     * ناوی کڕیار
     * ناوی بازرگانی
     * جۆری بازرگانی (سوپەرمارکێت، بەقاڵی، ...)
     * جۆری لایسێنس (تاقیکردنەوە، مانگانە، ساڵانە، هەمیشەیی)
     * ژمارەی بەکارهێنەران
     * ژمارەی کڕیاران
     * ژمارەی لقەکان
     * زانیاری پەیوەندی
   - کلیک لەسەر "دروستکردن"
   ```

4. **بەڕێوەبردنی لایسێنسەکان**:
   - **ڕاگرتن**: بۆ ڕاگرتنی لایسێنسێک کاتێک
   - **چالاککردنەوە**: بۆ چالاککردنەوەی لایسێنسێکی ڕاگیراو
   - **نوێکردنەوە**: بۆ درێژکردنەوەی ماوەی لایسێنس
   - **ناچالاککردن**: بۆ لابردنی بەستنەوەی لایسێنس بە ئامێر

### وەک بەڕێوەبەری کڕیار

1. **چوونە ژوورەوە**:
   - بە لایسێنس کی کە خاوەندار پێتداوە

2. **بینینی لایسێنس**:
   - دەتوانیت لایسێنسەکەت ببینیت (Read-only)
   - دەتوانیت دۆخ و ماوە ببینیت
   - **ناتوانیت** گۆڕانکاری بکەیت
   - بۆ گۆڕانکاری، پەیوەندی بە دابینکەر بکە

## ستراکچەری داتا

### License
```typescript
{
  id: string;
  key: string; // کلیلی یەکتا (XXXX-XXXX-XXXX-XXXX)
  clientId: string;
  clientName: string;
  businessName: string;
  businessType: 'supermarket' | 'grocery' | 'retail' | 'wholesale' | 'other';
  type: 'trial' | 'monthly' | 'yearly' | 'lifetime';
  status: 'active' | 'expired' | 'suspended' | 'trial';
  maxUsers: number;
  maxCustomers: number;
  maxBranches: number;
  features: string[];
  issuedAt: string;
  expiresAt: string | null;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  activationCount: number;
}
```

### Tenant
```typescript
{
  id: string;
  name: string;
  nameKu: string;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  licenseKey: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  createdAt: string;
  expiresAt?: string;
  settings: {
    maxUsers: number;
    maxCustomers: number;
    maxStorage: number;
    enabledModules: string[];
  };
  stats: {
    totalUsers: number;
    totalCustomers: number;
    totalDebts: number;
    totalPayments: number;
    storageUsed: number;
  };
}
```

### Subscription
```typescript
{
  id: string;
  clientId: string;
  plan: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  features: string[];
}
```

## API Endpoints (tRPC)

### License
- `trpc.license.create` - دروستکردنی لایسێنس
- `trpc.license.validate` - پشتڕاستکردنەوەی لایسێنس
- `trpc.license.getAll` - وەرگرتنی هەموو لایسێنسەکان
- `trpc.license.updateStatus` - نوێکردنەوەی دۆخ
- `trpc.license.renew` - نوێکردنەوەی لایسێنس
- `trpc.license.activate` - چالاککردنی لایسێنس
- `trpc.license.deactivate` - ناچالاککردنی لایسێنس
- `trpc.license.transfer` - گواستنەوەی لایسێنس
- `trpc.license.getStats` - وەرگرتنی ئامار

### Tenant
- `trpc.tenant.create` - دروستکردنی کڕیار
- `trpc.tenant.getAll` - وەرگرتنی هەموو کڕیارەکان
- `trpc.tenant.getById` - وەرگرتنی کڕیار بە ID
- `trpc.tenant.getByLicense` - وەرگرتنی کڕیار بە لایسێنس
- `trpc.tenant.updateStatus` - نوێکردنەوەی دۆخ
- `trpc.tenant.updateSettings` - نوێکردنەوەی ڕێکخستنەکان
- `trpc.tenant.updateStats` - نوێکردنەوەی ئامار
- `trpc.tenant.delete` - سڕینەوەی کڕیار
- `trpc.tenant.getDashboardStats` - وەرگرتنی ئاماری داشبۆرد
- `trpc.tenant.extendLicense` - درێژکردنەوەی لایسێنس

### Subscription
- `trpc.subscription.getPlans` - وەرگرتنی پلانەکان
- `trpc.subscription.create` - دروستکردنی بەشداری
- `trpc.subscription.getByClient` - وەرگرتنی بەشداری کڕیار
- `trpc.subscription.getAll` - وەرگرتنی هەموو بەشدارییەکان
- `trpc.subscription.cancel` - هەڵوەشاندنەوەی بەشداری
- `trpc.subscription.renew` - نوێکردنەوەی بەشداری
- `trpc.subscription.getPayments` - وەرگرتنی پارەدانەکان

## تێبینیە گرنگەکان

1. **هەڵگرتنی داتا**: هەموو داتاکان لە AsyncStorage هەڵدەگیرێن (لە ئامێری بەکارهێنەر)
2. **دەسەڵات**: تەنیا خاوەندار (admin/admin) دەتوانێت لایسێنس دروست بکات و بگۆڕێت
3. **بەڕێوەبەران**: دەتوانن لایسێنسەکانیان ببینن بەڵام ناتوانن گۆڕانکاری بکەن
4. **کارمەندان**: هیچ دەسەڵاتێکیان نییە بۆ بینینی لایسێنس

## نموونەی بەکارهێنان لە کۆد

```typescript
// دروستکردنی لایسێنسی نوێ
const createLicense = trpc.license.create.useMutation();
await createLicense.mutateAsync({
  clientName: 'ئەحمەد محەمەد',
  businessName: 'سوپەرمارکێتی ئەحمەد',
  businessType: 'supermarket',
  type: 'monthly',
  maxUsers: 5,
  maxCustomers: 100,
  maxBranches: 1,
  features: ['customer_management', 'debt_tracking'],
  contactPerson: 'ئەحمەد',
  contactPhone: '07501234567',
  contactEmail: 'ahmad@example.com',
});

// پشتڕاستکردنەوەی لایسێنس
const validation = await trpc.license.validate.query({
  key: 'XXXX-XXXX-XXXX-XXXX',
  deviceId: 'device-123',
  ipAddress: '192.168.1.1',
});

if (validation.isValid) {
  console.log('لایسێنس دروستە');
  console.log('ماوەی ماوە:', validation.remainingDays, 'ڕۆژ');
}

// وەرگرتنی هەموو لایسێنسەکان
const licenses = trpc.license.getAll.useQuery();

// نوێکردنەوەی لایسێنس
const renewLicense = trpc.license.renew.useMutation();
await renewLicense.mutateAsync({
  licenseId: 'lic_123',
  durationMonths: 12, // ساڵێک
});
```

## داهاتوو

بۆ ئەوەی سیستەمەکە بە سێرڤەری ڕاستەقینە ببەستیتەوە:

1. **داتابەیس**: بەکارهێنانی PostgreSQL، MySQL، یان MongoDB
2. **API**: دروستکردنی REST یان GraphQL API
3. **Authentication**: بەکارهێنانی JWT بۆ پاراستنی API
4. **Payment Gateway**: بەستنەوە بە سیستەمی پارەدان
5. **Email/SMS**: ناردنی ئاگادارکردنەوە بۆ بەسەرچوونی لایسێنس
