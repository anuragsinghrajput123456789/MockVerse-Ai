
import { useState, useEffect } from 'react';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string>('AIzaSyAHYYF6u__TlBXAMSgyw5GRUT5sn3LG0D4');

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
      setApiKey(stored);
    } else {
      // Save the new default API key to localStorage
      localStorage.setItem('gemini_api_key', 'AIzaSyAHYYF6u__TlBXAMSgyw5GRUT5sn3LG0D4');
    }
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('AIzaSyAHYYF6u__TlBXAMSgyw5GRUT5sn3LG0D4');
  };

  return { apiKey, saveApiKey, clearApiKey };
};
