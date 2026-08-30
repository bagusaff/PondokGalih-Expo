import axios from 'axios';

// Replaces the legacy `API_URL from '@env'` + per-file axios usage.
// Same server, same headers; token still passed per call (legacy pattern).

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const authHeader = (token: string) => ({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});
