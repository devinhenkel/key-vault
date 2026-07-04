import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM standard IV length

/**
 * Derive a 32-byte key from the ENCRYPTION_SECRET env var.
 * Falls back to a throwaway dev key if not set (will log a warning).
 */
function getEncryptionKey() {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    console.warn('[security] ENCRYPTION_SECRET is not set — using insecure dev fallback. Do NOT use in production.');
    return crypto.scryptSync('dev-only-insecure-key', 'salt', 32);
  }
  return crypto.scryptSync(secret, 'api-key-catalog-salt', 32);
}

let cachedKey = null;

function getKey() {
  if (!cachedKey) cachedKey = getEncryptionKey();
  return cachedKey;
}

/**
 * Encrypt a plaintext string.
 * Returns a combined string: iv:ciphertext:authTag (all hex)
 */
export function encrypt(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${ciphertext.toString('hex')}:${authTag.toString('hex')}`;
}

/**
 * Decrypt a string produced by encrypt().
 */
export function decrypt(encrypted) {
  const key = getKey();
  const parts = encrypted.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted format');
  const iv = Buffer.from(parts[0], 'hex');
  const ciphertext = Buffer.from(parts[1], 'hex');
  const authTag = Buffer.from(parts[2], 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}

/**
 * Mask a key value for display: show only first 4 and last 4 characters.
 * e.g. "sk-abcd...wxyz"
 */
export function maskKey(value) {
  if (!value || value.length <= 8) return '••••••••';
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}