export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000/api/v1';

export const API_TIMEOUT_MS = 15_000;
