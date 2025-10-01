/**
 * Data validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate phone number (Kurdish format)
 */
export function validatePhone(phone: string): ValidationResult {
  const errors: string[] = [];
  
  if (!phone || phone.trim().length === 0) {
    errors.push('ژمارەی مۆبایل پێویستە');
  } else if (!/^07[0-9]{9}$/.test(phone)) {
    errors.push('ژمارەی مۆبایل نادروستە. دەبێت بە 07 دەست پێ بکات و 11 ژمارە بێت');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (email && email.trim().length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('ئیمەیڵ نادروستە');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password || password.length === 0) {
    errors.push('وشەی نهێنی پێویستە');
  } else if (password.length < 6) {
    errors.push('وشەی نهێنی دەبێت لانیکەم 6 پیت بێت');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate amount (must be positive number)
 */
export function validateAmount(amount: number | string): ValidationResult {
  const errors: string[] = [];
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    errors.push('بڕی پارە دەبێت ژمارە بێت');
  } else if (numAmount <= 0) {
    errors.push('بڕی پارە دەبێت لە سفر زیاتر بێت');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate national ID (13 digits)
 */
export function validateNationalId(nationalId: string): ValidationResult {
  const errors: string[] = [];
  
  if (nationalId && nationalId.trim().length > 0) {
    if (!/^[0-9]{13}$/.test(nationalId)) {
      errors.push('ژمارەی ناسنامە دەبێت 13 ژمارە بێت');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  const errors: string[] = [];
  
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    errors.push(`${fieldName} پێویستە`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate customer data
 */
export function validateCustomerData(data: {
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
}): ValidationResult {
  const errors: string[] = [];
  
  const nameValidation = validateRequired(data.name, 'ناو');
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  }
  
  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) {
    errors.push(...phoneValidation.errors);
  }
  
  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
  }
  
  if (data.nationalId) {
    const nationalIdValidation = validateNationalId(data.nationalId);
    if (!nationalIdValidation.isValid) {
      errors.push(...nationalIdValidation.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate debt data
 */
export function validateDebtData(data: {
  customerId: string;
  amount: number | string;
  description: string;
  category: string;
}): ValidationResult {
  const errors: string[] = [];
  
  const customerValidation = validateRequired(data.customerId, 'کڕیار');
  if (!customerValidation.isValid) {
    errors.push(...customerValidation.errors);
  }
  
  const amountValidation = validateAmount(data.amount);
  if (!amountValidation.isValid) {
    errors.push(...amountValidation.errors);
  }
  
  const descriptionValidation = validateRequired(data.description, 'وەسف');
  if (!descriptionValidation.isValid) {
    errors.push(...descriptionValidation.errors);
  }
  
  const categoryValidation = validateRequired(data.category, 'جۆر');
  if (!categoryValidation.isValid) {
    errors.push(...categoryValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate payment data
 */
export function validatePaymentData(data: {
  debtId: string;
  amount: number | string;
}): ValidationResult {
  const errors: string[] = [];
  
  const debtValidation = validateRequired(data.debtId, 'قەرز');
  if (!debtValidation.isValid) {
    errors.push(...debtValidation.errors);
  }
  
  const amountValidation = validateAmount(data.amount);
  if (!amountValidation.isValid) {
    errors.push(...amountValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
