# ڕێنمایی سیستەمی بەڕێوەبردنی قەرز

## پێشەکی

ئەم سیستەمە بۆ بەڕێوەبردنی قەرز و پارەدان لە سوپەرمارکێت و بازرگانیەکان دروستکراوە. سیستەمەکە پشتگیری لە چوار جۆر بەکارهێنەر دەکات:

- **خاوەندار (Owner)**: دەسەڵاتی تەواو بۆ بەڕێوەبردنی هەموو سیستەمەکە
- **بەڕێوەبەر (Admin)**: بەڕێوەبردنی فرۆشگا و کارمەندان
- **کارمەند (Employee)**: کارکردن لە سیستەم بەپێی دەسەڵاتەکان
- **کڕیار (Customer)**: بینینی قەرزەکانی خۆی

---

## ساختاری سیستەم

### 1. سیستەمی چوونەژوورەوە (Login System)

سیستەمەکە چوار پەڕەی login-ی جیاوازی هەیە بۆ هەر ڕۆڵێک:

```
/login              → پەڕەی سەرەکی (هەڵبژاردنی ڕۆڵ)
/login-owner        → چوونەژوورەوەی خاوەندار
/login-admin        → چوونەژوورەوەی بەڕێوەبەر
/login-employee     → چوونەژوورەوەی کارمەند
/login-customer     → چوونەژوورەوەی کڕیار
```

#### تایبەتمەندیەکانی Login:

- **Role-Based Authentication**: هەر ڕۆڵێک تەنها لە پەڕەی تایبەتی خۆی دەتوانێت بچێتە ژوورەوە
- **Tenant Isolation**: بەڕێوەبەر، کارمەند و کڕیار پەیوەستن بە فرۆشگایەکی تایبەت (tenant)
- **Security Checks**: 
  - پشکنینی ڕۆڵ
  - پشکنینی دۆخی فرۆشگا (active, suspended, expired)
  - پشکنینی دۆخی بەکارهێنەر (active, locked)

---

### 2. ساختاری Navigation

#### خاوەندار (Owner):
```
/owner-dashboard    → داشبۆردی خاوەندار
  - بەڕێوەبردنی بەڕێوەبەران
  - بەڕێوەبردنی ئابوونەکان
  - بینینی داواکاریەکانی فرۆشگا
  - ئاماری گشتی
```

#### بەڕێوەبەر و کارمەند (Admin/Employee):
```
/(tabs)/dashboard   → داشبۆردی سەرەکی
/(tabs)/customers   → بەڕێوەبردنی کڕیارەکان
/(tabs)/reports     → ڕاپۆرتەکان
/(tabs)/search      → گەڕان
/(tabs)/settings    → ڕێکخستنەکان (تەنها بەڕێوەبەر)
```

#### کڕیار (Customer):
```
/customer-dashboard → داشبۆردی کڕیار
  - بینینی قەرزەکان
  - مێژووی پارەدان
  - QR Code-ی کڕیار
```

---

### 3. سیستەمی Multi-Tenant

سیستەمەکە پشتگیری لە چەندین فرۆشگا (tenant) دەکات:

#### ساختاری Tenant:
```typescript
{
  id: string;
  storeName: string;
  storeNameKurdish: string;
  adminId: string;
  status: 'active' | 'pending' | 'suspended' | 'expired';
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  expiryDate: string;
  createdAt: string;
}
```

#### Data Isolation:
- هەر فرۆشگایەک داتای تایبەتی خۆی هەیە
- بەکارهێنەران ناتوانن داتای فرۆشگایەکی تر ببینن
- خاوەندار تەنها دەتوانێت هەموو فرۆشگاکان ببینێت

---

### 4. سیستەمی دەسەڵات (Permissions)

#### دەسەڵاتەکانی خاوەندار:
- ✅ دروستکردنی بەڕێوەبەر
- ✅ بەڕێوەبردنی ئابوونەکان
- ✅ پەسەندکردنی داواکاریەکانی فرۆشگا
- ✅ ڕاگرتن/چالاککردنەوەی فرۆشگاکان
- ❌ دەستکاری قەرز و کڕیارەکان

#### دەسەڵاتەکانی بەڕێوەبەر:
- ✅ بەڕێوەبردنی کارمەندان
- ✅ بەڕێوەبردنی کڕیارەکان
- ✅ زیادکردن/دەستکاری قەرز
- ✅ بینینی هەموو ڕاپۆرتەکان
- ✅ ڕێکخستنی سیستەم

#### دەسەڵاتەکانی کارمەند:
- ✅ زیادکردنی قەرز
- ✅ تۆمارکردنی پارەدان
- ✅ بینینی کڕیارەکان
- ❌ دەستکاری ڕێکخستنەکان
- ❌ بەڕێوەبردنی کارمەندان

#### دەسەڵاتەکانی کڕیار:
- ✅ بینینی قەرزەکانی خۆی
- ✅ بینینی مێژووی پارەدان
- ✅ بەکارهێنانی QR Code
- ❌ بینینی کڕیارانی تر

---

### 5. ساختاری داتا (Data Structure)

#### قەرز (Debt):
```typescript
{
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  remainingAmount: number;
  description: string;
  status: 'active' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  createdBy: string;
  tenantId: string;
}
```

#### پارەدان (Payment):
```typescript
{
  id: string;
  debtId: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  notes: string;
  createdBy: string;
  tenantId: string;
}
```

#### کڕیار (Customer):
```typescript
{
  id: string;
  name: string;
  phone: string;
  role: 'customer';
  address: string;
  customerGroup: string;
  customerRating: string;
  totalDebt: number;
  onTimePayments: number;
  latePayments: number;
  qrCode: CustomerQRCode;
  tenantId: string;
}
```

---

### 6. تایبەتمەندیەکانی سەرەکی

#### بۆ خاوەندار:
- 📊 داشبۆردی تایبەت بە ئاماری هەموو فرۆشگاکان
- 🏪 بەڕێوەبردنی فرۆشگاکان و ئابوونەکان
- 📝 پەسەندکردنی داواکاریەکانی فرۆشگای نوێ
- 🔔 ئاگادارکردنەوە بۆ بەسەرچوونی ئابوونەکان
- 💰 بینینی کۆی داهات

#### بۆ بەڕێوەبەر/کارمەند:
- 📊 داشبۆردی ورد بە ئاماری فرۆشگا
- 👥 بەڕێوەبردنی کڕیارەکان
- 💳 زیادکردنی قەرز و پارەدان
- 📈 ڕاپۆرتی ورد (مانگانە، ساڵانە)
- 🔍 گەڕانی پێشکەوتوو
- 📱 QR Code بۆ کڕیارەکان
- 🖨️ چاپکردنی وەسڵ

#### بۆ کڕیار:
- 📊 داشبۆردی تایبەت
- 💰 بینینی قەرزەکان
- 📜 مێژووی پارەدان
- 📱 QR Code-ی تایبەت
- 🔔 ئاگادارکردنەوەکان

---

### 7. Design System

سیستەمەکە design system-ێکی یەکسانی هەیە:

#### ڕەنگەکان (Colors):
```typescript
- Primary: #4F46E5 (شین)
- Success: #10B981 (سەوز)
- Warning: #F59E0B (زەرد)
- Danger: #EF4444 (سوور)
- Info: #3B82F6 (شینی ڕووناک)
```

#### ڕەنگەکانی ڕۆڵەکان:
- خاوەندار: #7C3AED (مۆر)
- بەڕێوەبەر: #DC2626 (سوور)
- کارمەند: #059669 (سەوز)
- کڕیار: #2563EB (شین)

---

### 8. Performance Optimization

#### Context Providers:
سیستەمەکە 27+ context provider بەکاردەهێنێت. بۆ باشترکردنی performance:

1. **Lazy Loading**: تەنها context-ەکانی پێویست بارکراون
2. **Memoization**: بەکارهێنانی `useMemo` و `useCallback`
3. **Code Splitting**: جیاکردنەوەی کۆدەکان بەپێی ڕۆڵ

#### Storage System:
- **Tenant Isolation**: هەر فرۆشگایەک storage-ی تایبەتی خۆی هەیە
- **Global Storage**: بۆ داتای گشتی (users, tenants)
- **Safe Storage**: پشکنینی هەڵە و validation

---

### 9. چۆنیەتی بەکارهێنان

#### وەک خاوەندار:
1. چوونەژوورەوە لە `/login-owner`
2. دروستکردنی بەڕێوەبەر لە owner dashboard
3. بەڕێوەبردنی ئابوونەکان
4. پەسەندکردنی داواکاریەکانی فرۆشگا

#### وەک بەڕێوەبەر:
1. چوونەژوورەوە لە `/login-admin`
2. دروستکردنی کارمەندان
3. زیادکردنی کڕیارەکان
4. بەڕێوەبردنی قەرز و پارەدان

#### وەک کارمەند:
1. چوونەژوورەوە لە `/login-employee`
2. زیادکردنی قەرز بۆ کڕیارەکان
3. تۆمارکردنی پارەدان
4. بینینی ڕاپۆرتەکان

#### وەک کڕیار:
1. چوونەژوورەوە لە `/login-customer`
2. بینینی قەرزەکان
3. بینینی مێژووی پارەدان
4. بەکارهێنانی QR Code

---

### 10. پاراستن (Security)

#### تایبەتمەندیەکانی پاراستن:
- ✅ Role-Based Access Control (RBAC)
- ✅ Tenant Data Isolation
- ✅ Session Management
- ✅ Password Encryption (پێویستە زیاد بکرێت)
- ✅ Failed Login Attempts Tracking
- ✅ Account Locking
- ✅ Two-Factor Authentication (ئامادەیە بەڵام ناچالاکە)

---

### 11. داهاتوو (Future Enhancements)

#### تایبەتمەندیەکانی پێشنیارکراو:
- [ ] Backend API بە Node.js/Express
- [ ] Real-time Notifications بە WebSocket
- [ ] Advanced Analytics Dashboard
- [ ] Export بۆ Excel/PDF
- [ ] WhatsApp/SMS Integration
- [ ] Inventory Management
- [ ] Commission System
- [ ] Expense Tracking
- [ ] Profit/Loss Reports

---

## پشتیوانی فنی

بۆ هەر پرسیار یان کێشەیەک:
- GitHub: [aramabarzani/rork-supermarket-credit-management-system](https://github.com/aramabarzani/rork-supermarket-credit-management-system)
- Email: support@example.com

---

## مۆڵەت (License)

ئەم سیستەمە بۆ بەکارهێنانی بازرگانی دروستکراوە.

© 2025 - هەموو مافەکان پارێزراون
