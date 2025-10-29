import crypto from 'crypto';

export function makeMerchantApiKey(): { apiKey: string; apiKeyHash: string } {
  const apiKey = 'mkey_' + crypto.randomBytes(24).toString('base64url'); 
  const apiKeyHash = hashApiKey(apiKey);
  return { apiKey, apiKeyHash };
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey, 'utf8').digest('hex');
}
