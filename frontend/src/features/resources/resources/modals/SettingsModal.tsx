import React from 'react';
import { ResourceSheet } from '../../../../types';
import { X, Settings, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  editingSheet: ResourceSheet | null;
  setEditingSheet: React.Dispatch<React.SetStateAction<ResourceSheet | null>>;
  handleUpdateSheet: (e: React.FormEvent) => Promise<void>;
  handleDeleteSheet: (id: string) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  showSettingsModal,
  setShowSettingsModal,
  editingSheet,
  setEditingSheet,
  handleUpdateSheet,
  handleDeleteSheet
}) => {
  if (!showSettingsModal || !editingSheet) return null;

  const sheetId = editingSheet.id || (editingSheet as any)._id;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in no-print">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl relative border border-white/10 space-y-6">
        <button 
          onClick={() => setShowSettingsModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-xl font-bold text-white flex items-center gap-2 font-['Sora']">
          <Settings className="w-5 h-5 text-slate-400" />
          <span>Collection Settings</span>
        </h3>

        <form onSubmit={handleUpdateSheet} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Collection Name *</label>
            <input
              type="text"
              required
              value={editingSheet.name}
              onChange={(e) => setEditingSheet(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
              className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={editingSheet.description || ''}
              onChange={(e) => setEditingSheet(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
              <input
                type="text"
                value={editingSheet.subject || ''}
                onChange={(e) => setEditingSheet(prev => prev ? ({ ...prev, subject: e.target.value }) : null)}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chapter</label>
              <input
                type="text"
                value={editingSheet.chapter || ''}
                onChange={(e) => setEditingSheet(prev => prev ? ({ ...prev, chapter: e.target.value }) : null)}
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="space-y-0.5">
              <label className="block text-xs font-semibold text-white">Publicly Shared</label>
              <p className="text-[10px] text-slate-400">Generate public share links and QR codes.</p>
            </div>
            <input
              type="checkbox"
              checked={editingSheet.isPublic}
              onChange={(e) => setEditingSheet(prev => prev ? ({ ...prev, isPublic: e.target.checked }) : null)}
              className="w-5 h-5 rounded border-white/10 accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleDeleteSheet(sheetId)}
              className="flex-1 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Sheet</span>
            </button>
            <button
              type="submit"
              className="flex-grow flex-1 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg transition"
            >
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
