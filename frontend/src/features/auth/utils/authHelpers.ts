// Safe JSON parse for localStorage data
export const safeJsonParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Failed to parse stored data, clearing corrupted value:', error);
    return fallback;
  }
};
