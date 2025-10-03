# جیاکردنەوەی داتای فرۆشگاکان (Multi-Tenant Data Isolation)

## چۆنیەتی کارکردن

ئەم سیستەمە دڵنیایی دەکاتەوە کە هەر فرۆشگایەک (Tenant) داتای تایبەتی خۆی هەیە و ناتوانێت داتای فرۆشگایەکی تر ببینێت.

### 1. Storage System

فایل: `utils/storage.ts`

```typescript
// هەر کلیلێک بە tenantId پێشگر دەکرێت
tenant_${tenantId}_debts
tenant_${tenantId}_payments
tenant_${tenantId}_customers
```

### 2. Tenant Context Setup

کاتێک بەکارهێنەرێک دەچێتە ژوورەوە:

```typescript
// لە auth-context.tsx
if (updatedUser.tenantId) {
  setCurrentTenantId(updatedUser.tenantId);
  console.log('[Auth] Login - Tenant context set:', updatedUser.tenantId);
}
```

### 3. Data Scoping

هەموو داتاکان بە خۆکار بە tenantId جیا دەکرێنەوە:

```typescript
// لە debt-context.tsx
const debts = await safeStorage.getItem('debts'); // tenant_123_debts
await safeStorage.setItem('debts', newDebts); // tenant_123_debts
```

### 4. Global Data

هەندێک داتا دەبێت گلۆباڵ بن (بۆ هەموو فرۆشگاکان):

```typescript
// لیستی بەکارهێنەران (چونکە دەبێت بتوانن بچنە ژوورەوە)
await safeStorage.getGlobalItem('users');

// لیستی فرۆشگاکان
await safeStorage.getGlobalItem('tenants');

// داواکاریەکانی فرۆشگا
await safeStorage.getGlobalItem('store_requests');
```

## ڕێگای کارکردن

### 1. تۆمارکردنی فرۆشگایەکی نوێ

```
User → Store Registration → Store Request Created
     → Admin Approves → Tenant Created
     → Admin User Created with tenantId
```

### 2. چوونە ژوورەوە

```
User Login → Find User → Check tenantId
          → setCurrentTenantId(user.tenantId)
          → All data operations scoped to tenant
```

### 3. خوێندنەوە و نووسینی داتا

```
Read: safeStorage.getItem('debts')
   → getTenantKey('debts')
   → 'tenant_123_debts'
   → Read from storage

Write: safeStorage.setItem('debts', data)
    → getTenantKey('debts')
    → 'tenant_123_debts'
    → Write to storage
```

## تایبەتمەندیەکان

### ✅ جیاکردنەوەی تەواو
- هەر فرۆشگایەک داتای خۆی هەیە
- ناتوانن داتای یەکتر ببینن
- خۆکار جیا دەکرێنەوە

### ✅ پاراستن
- tenantId لە login دادەنرێت
- هەموو کارەکان بە tenantId پشکنین دەکرێن
- لە logout دەسڕێتەوە

### ✅ گلۆباڵ داتا
- بەکارهێنەران (بۆ login)
- فرۆشگاکان (بۆ بەڕێوەبردن)
- داواکاریەکان (بۆ پەسەندکردن)

## نموونە

### فرۆشگای A (tenantId: "123")
```
Storage Keys:
- tenant_123_debts
- tenant_123_payments
- tenant_123_customers
```

### فرۆشگای B (tenantId: "456")
```
Storage Keys:
- tenant_456_debts
- tenant_456_payments
- tenant_456_customers
```

### گلۆباڵ
```
Storage Keys:
- users (هەموو بەکارهێنەران)
- tenants (هەموو فرۆشگاکان)
- store_requests (هەموو داواکاریەکان)
```

## چۆن بەکاری بهێنیت

### بۆ داتای تایبەتی فرۆشگا
```typescript
// خۆکار بە tenantId جیا دەکرێتەوە
const debts = await safeStorage.getItem('debts');
await safeStorage.setItem('debts', newDebts);
```

### بۆ داتای گلۆباڵ
```typescript
// بەبێ tenantId
const users = await safeStorage.getGlobalItem('users');
await safeStorage.setGlobalItem('users', newUsers);
```

## تێبینیەکان

1. **Login**: tenantId دادەنرێت لە `auth-context.tsx`
2. **Logout**: tenantId دەسڕێتەوە
3. **Data Operations**: خۆکار بە tenantId جیا دەکرێنەوە
4. **Global Data**: بەکارهێنەران، فرۆشگاکان، داواکاریەکان

## پشکنین

```typescript
// لە console
console.log('[Storage] Current tenant set to:', tenantId);
console.log('[Auth] Login - Tenant context set:', tenantId);
console.log('[Auth] Logout - Tenant context cleared');
```

## ئاسایشی

- هەر فرۆشگایەک تەنها داتای خۆی دەبینێت
- ناتوانن داتای فرۆشگایەکی تر بگۆڕن
- بەڕێوەبەران دەتوانن هەموو فرۆشگاکان ببینن
