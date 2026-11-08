import crypto from 'crypto';

/**
 * AES-256-GCM Encryption / Decryption Module.
 * Used exclusively on the server to securely store and decrypt BYOK API keys.
 * Never import or execute in client components.
 */

function getEncryptionKey(): Buffer {
  const secret = process.env.KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('KEY_ENCRYPTION_SECRET is not configured in environment variables.');
  }
  // If base64 encoded 32 bytes
  try {
    const buf = Buffer.from(secret, 'base64');
    if (buf.length === 32) return buf;
  } catch {
    // fallback to hash
  }
  return crypto.createHash('sha256').update(secret).digest();
}

export interface EncryptedPayload {
  ciphertext: string; // hex
  iv: string;         // hex
  authTag: string;    // hex
}

/**
 * Encrypts an API key using AES-256-GCM.
 */
export function encryptApiKey(plainKey: string): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Decrypts an encrypted API key using AES-256-GCM.
 * Result is kept strictly in-memory during inference execution.
 */
export function decryptApiKey(encryptedHex: string, ivHex: string, authTagHex: string): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  
  if (authTagHex) {
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  }

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Masks an API key for safe frontend display (e.g., sk-...1234 or AIza...9876)
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '****';
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  return `${prefix}...${suffix}`;
}
