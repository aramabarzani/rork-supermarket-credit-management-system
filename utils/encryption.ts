/**
 * Simple encryption utilities for password hashing and data encryption
 * Note: This is a basic implementation. For production, use proper encryption libraries
 */

const ENCRYPTION_KEY = 'rork-credit-management-2024';

/**
 * Simple hash function for passwords
 * In production, use bcrypt or similar
 */
export function hashPassword(password: string): string {
  let hash = 0;
  const combined = password + ENCRYPTION_KEY;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Check if a string is valid base64
 */
function isValidBase64(str: string): boolean {
  if (!str || str.trim() === '') return false;
  try {
    const trimmed = str.trim();
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    if (!base64Regex.test(trimmed)) return false;
    if (trimmed.length % 4 !== 0) return false;
    atob(trimmed);
    return true;
  } catch {
    return false;
  }
}

/**
 * Simple XOR encryption for data
 * In production, use AES or similar
 */
export function encryptData(data: string): string {
  try {
    const utf8Bytes = unescape(encodeURIComponent(data));
    let encrypted = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      const charCode = utf8Bytes.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      encrypted += String.fromCharCode(charCode);
    }
    const binaryString = encrypted.split('').map(c => 
      String.fromCharCode(c.charCodeAt(0) & 0xff)
    ).join('');
    return btoa(binaryString);
  } catch (error) {
    console.error('Encryption error:', error);
    return data;
  }
}

/**
 * Decrypt XOR encrypted data
 */
export function decryptData(encryptedData: string): string {
  try {
    if (!encryptedData || encryptedData.trim() === '') {
      return encryptedData;
    }
    
    const trimmed = encryptedData.trim();
    
    if (!isValidBase64(trimmed)) {
      console.log('Not valid base64, returning as-is');
      return encryptedData;
    }
    
    const decoded = atob(trimmed);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    
    return decodeURIComponent(escape(decrypted));
  } catch (error) {
    console.log('Decryption error, returning original:', error);
    return encryptedData;
  }
}

/**
 * Encrypt sensitive user data
 */
export function encryptSensitiveData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    return encryptData(jsonString);
  } catch (error) {
    console.error('Error encrypting sensitive data:', error);
    return JSON.stringify(data);
  }
}

/**
 * Decrypt sensitive user data
 */
export function decryptSensitiveData<T>(encryptedData: string): T | null {
  try {
    const decrypted = decryptData(encryptedData);
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error('Error decrypting sensitive data:', error);
    return null;
  }
}
