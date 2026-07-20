import React from 'react';
import { 
  User as UserIcon, 
  Zap, 
  FileText, 
  CheckCircle2, 
  Key, 
  Shield, 
  AlertTriangle, 
  ExternalLink, 
  Settings as SettingsIcon, 
  Award 
} from 'lucide-react';
import Auth from '../auth/Auth';
import { QuestionPaper } from '../../shared/types';

interface ProfileTabProps {
  user: any;
  logout: () => void;
  paperHistory: QuestionPaper[];
  hasStoredApiKey: boolean;
  apiKeyMasked: string | null;
  apiKeyInput: string;
  setApiKeyInput: (val: string) => void;
  apiKeyLoading: boolean;
  showApiKeyInput: boolean;
  setShowApiKeyInput: (val: boolean) => void;
  handleSaveApiKey: () => Promise<void>;
  handleDeleteApiKey: () => Promise<void>;
  handleSaveSettings: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  logout,
  paperHistory,
  hasStoredApiKey,
  apiKeyMasked,
  apiKeyInput,
  setApiKeyInput,
  apiKeyLoading,
  showApiKeyInput,
  setShowApiKeyInput,
  handleSaveApiKey,
  handleDeleteApiKey,
  handleSaveSettings
}) => {
  if (!user) {
    return (
      <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-6">
          <UserIcon className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Sign In to Your Account</h2>
        </div>
        <Auth isInline={true} />
      </div>
    );
  }

  const savedResources = JSON.parse(localStorage.getItem('resources') || '[]');
  const totalPapers = paperHistory.length;
  const totalSolutions = paperHistory.filter(p => p.solutions).length;
  const totalEvaluations = paperHistory.filter(p => p.evaluationResult).length;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8 pb-12 stagger-children">
      {/* Header Identity Glass Panel */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0B0F19] rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl">
              {user?.name ? user.name.substring(0,2).toUpperCase() : "ST"}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{user?.name || "Student User"}</h2>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold tracking-wider uppercase">Pro</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3.5">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-extrabold uppercase tracking-wide">MockVerse Gold Member</span>
              <span className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-extrabold uppercase tracking-wide">AI Explorer</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3 w-full md:w-auto">
          <div className="text-xs text-slate-500 text-center md:text-right">
            Account Status: <span className="text-emerald-400 font-bold">Active</span>
          </div>
          <button
            onClick={logout}
            className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-red-500/5"
          >
            <span>Sign Out Securely</span>
          </button>
        </div>
      </div>

      {/* Account Progress Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-white/5 relative group hover:border-indigo-500/30 transition-all duration-300">
          <span className="text-xs text-slate-400 font-semibold tracking-wide">Generated Papers</span>
          <span className="text-3xl font-extrabold text-white mt-4">{totalPapers}</span>
          <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-white/5 relative group hover:border-pink-500/30 transition-all duration-300">
          <span className="text-xs text-slate-400 font-semibold tracking-wide">Saved Resources</span>
          <span className="text-3xl font-extrabold text-white mt-4">{savedResources.length}</span>
          <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-white/5 relative group hover:border-emerald-500/30 transition-all duration-300">
          <span className="text-xs text-slate-400 font-semibold tracking-wide">Solutions Unlocked</span>
          <span className="text-3xl font-extrabold text-white mt-4">{totalSolutions}</span>
          <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ═══ API Key Management Section ═══ */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden border border-white/5">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center space-x-2 border-b border-white/5 pb-4 mb-6">
          <Key className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-white text-lg">Gemini API Key Management</h3>
        </div>

        {/* Status indicator */}
        <div className={`flex items-center space-x-3 p-4 rounded-xl border mb-6 transition-all ${
          hasStoredApiKey
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-slate-500/5 border-white/5'
        }`}>
          <Shield className={`w-5 h-5 shrink-0 ${hasStoredApiKey ? 'text-emerald-400' : 'text-slate-500'}`} />
          <div className="flex-1">
            <h4 className={`text-sm font-bold ${hasStoredApiKey ? 'text-emerald-400' : 'text-slate-400'}`}>
              {hasStoredApiKey ? 'Personal API Key Active' : 'Using Server Default Key'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {hasStoredApiKey
                ? `Your encrypted key: ${apiKeyMasked || '••••••••'}`
                : 'Add your own Gemini API key for dedicated quota and limits.'}
            </p>
          </div>
          {hasStoredApiKey && (
            <button
              onClick={handleDeleteApiKey}
              disabled={apiKeyLoading}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-[10px] font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {apiKeyLoading ? 'Removing...' : 'Remove Key'}
            </button>
          )}
        </div>

        {/* Add/Update API Key form */}
        {!showApiKeyInput && !hasStoredApiKey && (
          <button
            onClick={() => setShowApiKeyInput(true)}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 hover:text-amber-300 font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Key className="w-4 h-4" />
            <span>Add Your Gemini API Key</span>
          </button>
        )}

        {(showApiKeyInput || hasStoredApiKey) && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                {hasStoredApiKey ? 'Update API Key' : 'Enter Gemini API Key'}
              </label>
              <div className="flex space-x-3">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={hasStoredApiKey ? 'Enter new key to update...' : 'AIzaSy...'}
                  className="flex-1 h-11 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 bg-[#080C16] text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
                <button
                  onClick={handleSaveApiKey}
                  disabled={apiKeyLoading || !apiKeyInput.trim()}
                  className="px-6 h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 flex items-center space-x-2"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{apiKeyLoading ? 'Saving...' : 'Save Key'}</span>
                </button>
              </div>
            </div>

            {/* Help text */}
            <div className="flex items-start space-x-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <AlertTriangle className="w-4 h-4 text-amber-400/60 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-500 space-y-1">
                <p>Your key is <span className="text-amber-400/80 font-semibold">AES-256 encrypted</span> before storage. It's never exposed in plain text.</p>
                <p>Get a free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center space-x-1"><span>Google AI Studio</span><ExternalLink className="w-3 h-3" /></a></p>
              </div>
            </div>

            {!hasStoredApiKey && showApiKeyInput && (
              <button
                onClick={() => { setShowApiKeyInput(false); setApiKeyInput(''); }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Split layout for achievements and settings */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Settings options */}
        <div className="glass-panel p-6 rounded-3xl border-white/5 md:col-span-7 space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <SettingsIcon className="w-4 h-4 text-pink-400" />
            <h3 className="font-extrabold text-white text-base">Model & Prompt Optimization</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">AI Model Anchor</label>
                <select className="w-full h-10 px-3 rounded-xl bg-[#080C16] border border-white/10 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                  <option>Gemini 1.5 Pro (Recommended)</option>
                  <option>Gemini 1.5 Flash (Performance)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Temperature Profile</label>
                <select className="w-full h-10 px-3 rounded-xl bg-[#080C16] border border-white/10 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                  <option>Balanced Precision (0.7 - Default)</option>
                  <option>Strict Verification (0.3 - Focused)</option>
                  <option>Creative Exploration (0.9 - Diverse)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Standard CBSE Template Prompting</label>
              <select className="w-full h-10 px-3 rounded-xl bg-[#080C16] border border-white/10 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                <option>Default Section-wise Distribution (SAQ, MCQ, LAQ)</option>
                <option>Multiple Choice Focused</option>
                <option>Written Theoretical Essays Focused</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <div>
                <h5 className="font-bold text-white">Push Email Reports</h5>
                <p className="text-[11px] text-slate-500">Send graded sheets automatically to educators.</p>
              </div>
              <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 bg-black border-slate-700 focus:ring-0" defaultChecked />
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Progress Achievements */}
        <div className="glass-panel p-6 rounded-3xl border-white/5 md:col-span-5 space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Award className="w-4 h-4 text-indigo-400" />
            <h3 className="font-extrabold text-white text-base">Progress Achievements</h3>
          </div>

          <div className="space-y-4">
            <div className={`flex items-start space-x-3 p-3 rounded-xl border transition-all duration-300 ${totalPapers > 0 ? 'bg-indigo-500/5 border-indigo-500/20 text-white' : 'bg-white/5 border-white/5 opacity-50'}`}>
              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${totalPapers > 0 ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <h4 className="font-bold text-xs">First Milestone Generator</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Generate your first customized AI exam sheet.</p>
              </div>
            </div>

            <div className={`flex items-start space-x-3 p-3 rounded-xl border transition-all duration-300 ${savedResources.length > 0 ? 'bg-indigo-500/5 border-indigo-500/20 text-white' : 'bg-white/5 border-white/5 opacity-50'}`}>
              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${savedResources.length > 0 ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <h4 className="font-bold text-xs">Library Builder</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Save at least 1 study or lecture bookmark.</p>
              </div>
            </div>

            <div className={`flex items-start space-x-3 p-3 rounded-xl border transition-all duration-300 ${totalEvaluations > 0 ? 'bg-indigo-500/5 border-indigo-500/20 text-white' : 'bg-white/5 border-white/5 opacity-50'}`}>
              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${totalEvaluations > 0 ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <h4 className="font-bold text-xs">AI Evaluation Pioneer</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Obtain line-by-line grading scorecard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
