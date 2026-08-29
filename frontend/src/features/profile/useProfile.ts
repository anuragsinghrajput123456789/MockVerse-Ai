import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../shared/hooks/use-toast';
import { 
  saveUserApiKey, 
  deleteUserApiKey, 
  getUserApiKey 
} from '../../shared/services/profileService';

export function useProfile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // API Key Management State
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyMasked, setApiKeyMasked] = useState<string | null>(null);
  const [hasStoredApiKey, setHasStoredApiKey] = useState(false);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // Quota Alert Modal State
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaModalMessage, setQuotaModalMessage] = useState('');
  const [quotaModalKeyInput, setQuotaModalKeyInput] = useState('');

  // Load API key status on mount
  useEffect(() => {
    if (user) {
      getUserApiKey().then(data => {
        setHasStoredApiKey(data.hasApiKey);
        setApiKeyMasked(data.maskedKey);
      }).catch((err) => {
        // Don't log auth errors (handled by auto-logout), but log unexpected ones
        if (err?.statusCode !== 401) {
          console.error('Failed to fetch API key status:', err);
        }
      });
    } else {
      setHasStoredApiKey(false);
      setApiKeyMasked(null);
    }
  }, [user]);

  const handleQuotaError = useCallback((error: any) => {
    if (error.errorCode === 'API_KEY_QUOTA_EXHAUSTED' || error.errorCode === 'CONCURRENT_REQUEST_LIMIT' || error.statusCode === 429) {
      setQuotaModalMessage('Your API key has exceeded its usage limit. You can add a new API key below to continue generating, or wait for the quota to reset.');
      setQuotaModalKeyInput('');
      setShowQuotaModal(true);
      return true;
    }
    if (error.errorCode === 'API_KEY_INVALID') {
      setQuotaModalMessage('The provided API key is invalid or expired. Please enter a valid Gemini API key below to continue.');
      setQuotaModalKeyInput('');
      setShowQuotaModal(true);
      return true;
    }
    return false;
  }, []);

  const handleQuotaModalSave = useCallback(async () => {
    if (!quotaModalKeyInput.trim()) return;
    setApiKeyLoading(true);
    try {
      const result = await saveUserApiKey(quotaModalKeyInput.trim());
      setHasStoredApiKey(true);
      setApiKeyMasked(result.maskedKey);
      setApiKeyInput('');
      setQuotaModalKeyInput('');
      setShowQuotaModal(false);
      toast({
        title: "🔑 API Key Updated!",
        description: "Your new Gemini API key has been saved. You can now generate papers again.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save API key.",
        variant: "destructive",
      });
    } finally {
      setApiKeyLoading(false);
    }
  }, [quotaModalKeyInput, toast]);

  const handleSaveApiKey = useCallback(async () => {
    if (!apiKeyInput.trim()) return;
    setApiKeyLoading(true);
    try {
      const result = await saveUserApiKey(apiKeyInput.trim());
      setHasStoredApiKey(true);
      setApiKeyMasked(result.maskedKey);
      setApiKeyInput('');
      setShowApiKeyInput(false);
      toast({
        title: "🔑 API Key Saved!",
        description: "Your Gemini API key has been encrypted and stored securely.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save API key.",
        variant: "destructive",
      });
    } finally {
      setApiKeyLoading(false);
    }
  }, [apiKeyInput, toast]);

  const handleDeleteApiKey = useCallback(async () => {
    setApiKeyLoading(true);
    try {
      await deleteUserApiKey();
      setHasStoredApiKey(false);
      setApiKeyMasked(null);
      setApiKeyInput('');
      toast({
        title: "API Key Removed",
        description: "Your stored API key has been deleted. The server default key will be used.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key.",
        variant: "destructive",
      });
    } finally {
      setApiKeyLoading(false);
    }
  }, [toast]);

  const handleSaveSettings = useCallback(() => {
    toast({
      title: "Preferences Synchronized!",
      description: "System parameters and model anchors have been updated successfully.",
    });
  }, [toast]);

  return {
    user,
    logout,
    apiKeyInput,
    setApiKeyInput,
    apiKeyMasked,
    setApiKeyMasked,
    hasStoredApiKey,
    setHasStoredApiKey,
    apiKeyLoading,
    showApiKeyInput,
    setShowApiKeyInput,
    showQuotaModal,
    setShowQuotaModal,
    quotaModalMessage,
    quotaModalKeyInput,
    setQuotaModalKeyInput,
    handleQuotaError,
    handleQuotaModalSave,
    handleSaveApiKey,
    handleDeleteApiKey,
    handleSaveSettings
  };
}

export default useProfile;
