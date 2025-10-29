import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

export function encryptGCM(plain: Buffer, base64Key: string): { iv: string; ct: string; tag: string } {
  const key = Buffer.from(base64Key, 'base64');
  if (key.length !== 32) throw new Error('WALLET_ENC_KEY_BASE64 must be 32 bytes (base64)');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString('base64'), ct: ct.toString('base64'), tag: tag.toString('base64') };
}

export function decryptGCM(payload: { iv: string; ct: string; tag: string }, base64Key: string): Buffer {
  const key = Buffer.from(base64Key, 'base64');
  const iv = Buffer.from(payload.iv, 'base64');
  const ct = Buffer.from(payload.ct, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}
