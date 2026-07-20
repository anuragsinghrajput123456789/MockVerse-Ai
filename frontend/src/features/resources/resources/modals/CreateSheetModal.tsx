import React from 'react';
import { X, Plus } from 'lucide-react';

interface CreateSheetModalProps {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  newSheetName: string;
  setNewSheetName: (val: string) => void;
  newSheetDesc: string;
  setNewSheetDesc: (val: string) => void;
  newSheetSubject: string;
  setNewSheetSubject: (val: string) => void;
  newSheetChapter: string;
  setNewSheetChapter: (val: string) => void;
  newSheetPublic: boolean;
  setNewSheetPublic: (val: boolean) => void;
  handleCreateSheet: (e: React.FormEvent) => Promise<void>;
}

export const CreateSheetModal: React.FC<CreateSheetModalProps> = ({
  showCreateModal,
  setShowCreateModal,
  newSheetName,
  setNewSheetName,
  newSheetDesc,
  setNewSheetDesc,
  newSheetSubject,
  setNewSheetSubject,
  newSheetChapter,
  setNewSheetChapter,
  newSheetPublic,
  setNewSheetPublic,
  handleCreateSheet
}) => {
  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in no-print">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl relative border border-white/10 space-y-6">
        <button 
          onClick={() => setShowCreateModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-xl font-bold text-white flex items-center gap-2 font-['Sora']">
          <Plus className="w-5 h-5 text-indigo-400" />
          <span>Create Resource Sheet</span>
        </h3>

        <form onSubmit={handleCreateSheet} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Collection Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., Statistics Class, AP Calculus"
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (Optional)</label>
            <textarea
              placeholder="Summarize the topics, books, or goals of this resource collection..."
              value={newSheetDesc}
              onChange={(e) => setNewSheetDesc(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Mathematics"
                value={newSheetSubject}
                onChange={(e) => setNewSheetSubject(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chapter (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Chapter 1"
                value={newSheetChapter}
                onChange={(e) => setNewSheetChapter(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="space-y-0.5">
              <label className="block text-xs font-semibold text-white">Publicly Shared</label>
              <p className="text-[10px] text-slate-400">Allows generating public share links and QR codes.</p>
            </div>
            <input
              type="checkbox"
              checked={newSheetPublic}
              onChange={(e) => setNewSheetPublic(e.target.checked)}
              className="w-5 h-5 rounded border-white/10 accent-indigo-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg transition"
          >
            <span>Create Collection</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSheetModal;
