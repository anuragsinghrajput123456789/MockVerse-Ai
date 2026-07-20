// Helper to parse API errors with quota detection and 401 auto-logout
export const parseApiError = async (res: Response, defaultMsg: string) => {
  let errorData: any;
  try {
    errorData = await res.json();
  } catch {
    errorData = { message: defaultMsg };
  }

  const error: any = new Error(errorData.message || defaultMsg);
  error.errorCode = errorData.errorCode || null;
  error.statusCode = res.status;

  // Auto-logout on 401 (token expired/invalid)
  if (res.status === 401) {
    const token = localStorage.getItem('mockverse_token');
    if (token) {
      // Token exists but server rejected it — clear auth state
      localStorage.removeItem('mockverse_token');
      localStorage.removeItem('mockverse_user');
      // Dispatch a custom event so AuthContext can react
      window.dispatchEvent(new CustomEvent('mockverse:auth-expired'));
    }
  }

  return error;
};
