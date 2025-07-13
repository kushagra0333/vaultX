import crypto from 'crypto';

export function generateShareToken() {
  return crypto.randomBytes(16).toString('hex');
}