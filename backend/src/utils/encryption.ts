import CryptoJS from 'crypto-js';

import { env } from '../config/env';

const ENCRYPTION_KEY = env.ENCRYPTION_KEY;

/**
 * Encrypts a string using AES encryption
 */
export function encrypt(text: string): string {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

/**
 * Decrypts an encrypted string
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}






