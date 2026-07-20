import React from 'react';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ onClick, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-xl transition-all duration-300 text-xs font-bold flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      <span>{loading ? 'Preparing PDF...' : 'Download PDF'}</span>
    </button>
  );
};

export default DownloadButton;
