export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

// Timeout durations (ms)
export const DEFAULT_TIMEOUT = 10000;  // 10s for CRUD operations
export const AI_TIMEOUT = 120000;      // 2min for AI generation endpoints
