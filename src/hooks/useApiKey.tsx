
import { useState, useEffect } from 'react';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string>('AIzaSyDZDUMUMB6NRHu_fcuD7JnTKEaH_s82_Ok');

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
      setApiKey(stored);
    } else {
      // Save the new default API key to localStorage
      localStorage.setItem('gemini_api_key', 'AIzaSyDZDUMUMB6NRHu_fcuD7JnTKEaH_s82_Ok');
    }
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('AIzaSyDZDUMUMB6NRHu_fcuD7JnTKEaH_s82_Ok');
  };

  return { apiKey, saveApiKey, clearApiKey };
};
