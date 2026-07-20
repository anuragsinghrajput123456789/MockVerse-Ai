import React from 'react';
import { AlertTriangle, Shield, Key, ExternalLink, Settings as SettingsIcon } from 'lucide-react';

interface QuotaModalProps {
  showQuotaModal: boolean;
  setShowQuotaModal: (show: boolean) => void;
  quotaModalMessage: string;
  quotaModalKeyInput: string;
  setQuotaModalKeyInput: (val: string) => void;
  handleQuotaModalSave: () => Promise<void>;
  apiKeyLoading: boolean;
  setActiveTab: (tab: string) => void;
}

export const QuotaModal: React.FC<QuotaModalProps> = ({
  showQuotaModal,
  setShowQuotaModal,
  quotaModalMessage,
  quotaModalKeyInput,
  setQuotaModalKeyInput,
  handleQuotaModalSave,
  apiKeyLoading,
  setActiveTab
}) => {
  if (!showQuotaModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-modal-overlay" onClick={() => setShowQuotaModal(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      
      {/* Modal Panel */}
      <div
        className="relative w-full max-w-lg glass-panel rounded-3xl border border-red-500/20 shadow-2xl shadow-red-500/10 overflow-hidden animate-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center animate-alert-pulse">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">API Key Limit Reached</h3>
              <p className="text-xs text-slate-500 mt-0.5">Action required to continue</p>
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="relative p-6 space-y-5">
          <p className="text-sm text-slate-300 leading-relaxed">
            {quotaModalMessage}
          </p>
          
          {/* Quick API Key Input */}
          <div className="space-y-3">
            <label className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider block">
              Enter New Gemini API Key
            </label>
            <div className="flex space-x-3">
              <input
                type="password"
                value={quotaModalKeyInput}
                onChange={(e) => setQuotaModalKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 h-12 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 bg-[#080C16] text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleQuotaModalSave()}
              />
              <button
                onClick={handleQuotaModalSave}
                disabled={apiKeyLoading || !quotaModalKeyInput.trim()}
                className="px-6 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Shield className="w-4 h-4" />
                <span>{apiKeyLoading ? 'Saving...' : 'Save & Continue'}</span>
              </button>
            </div>
          </div>
          
          {/* Help links */}
          <div className="flex items-start space-x-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <Key className="w-4 h-4 text-amber-400/60 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-500 space-y-1.5">
              <p>Your key is <span className="text-amber-400/80 font-semibold">AES-256 encrypted</span> before storage.</p>
              <p>Get a free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center space-x-1"><span>Google AI Studio</span><ExternalLink className="w-3 h-3" /></a></p>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="relative p-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => setShowQuotaModal(false)}
            className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            Close
          </button>
          <button
            onClick={() => { setShowQuotaModal(false); setActiveTab('profile'); }}
            className="px-5 py-2.5 text-sm font-semibold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-all flex items-center space-x-2"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Go to Profile Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotaModal;
