import React from 'react';
import { ResourceSheet } from '../../../../types';
import { X, Share2, Copy } from 'lucide-react';

interface ShareModalProps {
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
  activeSheet: ResourceSheet | null;
  getShareLink: () => string;
  handleCopyShareLink: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  showShareModal,
  setShowShareModal,
  activeSheet,
  getShareLink,
  handleCopyShareLink
}) => {
  if (!showShareModal || !activeSheet) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in no-print">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl relative border border-white/10 space-y-6">
        <button 
          onClick={() => setShowShareModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2 font-['Sora']">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <span>Share Collection Link</span>
          </h3>
          <p className="text-slate-400 text-xs">Anyone with this link can view this collection in read-only mode.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={getShareLink()}
            className="w-full h-10 px-3 rounded-lg border border-white/10 bg-black/40 text-xs text-slate-300 focus:outline-none"
          />
          <button
            onClick={handleCopyShareLink}
            className="px-3 h-10 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
