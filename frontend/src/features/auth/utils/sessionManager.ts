export const AUTH_EXPIRED_EVENT = 'mockverse:auth-expired';

export const dispatchAuthExpired = (): void => {
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
};

export const listenToAuthExpired = (callback: () => void): () => void => {
  window.addEventListener(AUTH_EXPIRED_EVENT, callback);
  return () => {
    window.removeEventListener(AUTH_EXPIRED_EVENT, callback);
  };
};
