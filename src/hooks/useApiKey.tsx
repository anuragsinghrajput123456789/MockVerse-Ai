
import { useState, useEffect } from 'react';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string>('AIzaSyCTnS9K1VD_hx2pQOT2I4Jk1JfcjWbxN0c');

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
      setApiKey(stored);
    } else {
      // Save the default API key to localStorage
      localStorage.setItem('gemini_api_key', 'AIzaSyCTnS9K1VD_hx2pQOT2I4Jk1JfcjWbxN0c');
    }
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
  };

  return { apiKey, saveApiKey, clearApiKey };
};
