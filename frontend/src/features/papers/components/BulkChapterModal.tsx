import React, { useState } from 'react';
import { X, FileText, Plus } from 'lucide-react';

interface BulkChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChapters: (chapters: string[]) => void;
}

export const BulkChapterModal: React.FC<BulkChapterModalProps> = ({
  isOpen,
  onClose,
  onAddChapters,
}) => {
  const [bulkText, setBulkText] = useState('');

  if (!isOpen) return null;

  const handleImport = () => {
    if (!bulkText.trim()) return;

    // Split by lines or commas
    const parsed = bulkText
      .split(/[\n,]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (parsed.length > 0) {
      onAddChapters(parsed);
      setBulkText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 space-y-4 bg-slate-900 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white font-['Sora']">Bulk Add Custom Chapters</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Paste multiple chapter titles or topics below. Separate each chapter with a new line or comma.
        </p>

        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          rows={6}
          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono"
          placeholder={`Chapter 1: Limits & Continuity\nChapter 2: Derivatives & Chain Rule\nChapter 3: Integration by Parts\nChapter 4: Differential Equations`}
        />

        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!bulkText.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center space-x-1.5 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkChapterModal;
