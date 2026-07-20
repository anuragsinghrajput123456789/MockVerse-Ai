// Helper to get auth headers
export const getHeaders = (isJson = true): Record<string, string> => {
  const token = localStorage.getItem('mockverse_token');
  const headers: Record<string, string> = {};

  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};
