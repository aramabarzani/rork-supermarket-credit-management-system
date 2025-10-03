export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'هەڵەیەکی نەناسراو ڕوویدا';
}

export function getUserFriendlyErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);
  
  const errorMap: Record<string, string> = {
    'Network request failed': 'تکایە هێڵی ئینتەرنێتەکەت بپشکنە',
    'Timeout': 'کاتەکە بەسەرچوو، تکایە دووبارە هەوڵبدەرەوە',
    'Not found': 'زانیاری نەدۆزرایەوە',
    'Unauthorized': 'تکایە دووبارە بچۆرە ژوورەوە',
    'Forbidden': 'مۆڵەتت نییە بۆ ئەم کردارە',
    'Server error': 'کێشەیەک لە سێرڤەر ڕوویدا',
    'Debt not found': 'قەرزەکە نەدۆزرایەوە',
    'Payment not found': 'پارەدانەکە نەدۆزرایەوە',
    'Customer not found': 'کڕیارەکە نەدۆزرایەوە',
    'Payment amount exceeds remaining debt': 'بڕی پارەدان زیاترە لە قەرزی ماوە',
    'ناتوانیت قەرزێک بسڕیتەوە کە پارەدانی لەسەر کراوە': 'ناتوانیت قەرزێک بسڕیتەوە کە پارەدانی لەسەر کراوە',
    'ناتوانیت پارەدانێکی گەڕاوە دەستکاری بکەیت': 'ناتوانیت پارەدانێکی گەڕاوە دەستکاری بکەیت',
    'ناتوانیت پارەدانێکی گەڕاوە بسڕیتەوە': 'ناتوانیت پارەدانێکی گەڕاوە بسڕیتەوە',
    'ئەم پارەدانە پێشتر گەڕاوەتەوە': 'ئەم پارەدانە پێشتر گەڕاوەتەوە',
    'کۆی بڕەکان دەبێ یەکسان بن لەگەڵ بڕی ماوەی قەرزەکە': 'کۆی بڕەکان دەبێ یەکسان بن لەگەڵ بڕی ماوەی قەرزەکە',
  };
  
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) {
      return value;
    }
  }
  
  return message || 'هەڵەیەکی نەناسراو ڕوویدا';
}

export function logError(error: unknown, context?: string) {
  const message = getErrorMessage(error);
  const timestamp = new Date().toISOString();
  
  console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}${message}`);
  
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
}

export function handleAsyncError<T>(
  promise: Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<[T | null, unknown | null]> {
  return promise
    .then((data) => [data, null] as [T, null])
    .catch((error) => {
      if (errorHandler) {
        errorHandler(error);
      }
      logError(error);
      return [null, error] as [null, unknown];
    });
}
