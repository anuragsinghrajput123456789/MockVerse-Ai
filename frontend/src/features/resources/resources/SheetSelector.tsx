import React from 'react';
import { ResourceSheet } from '../../../types';
import { Plus, Folder } from 'lucide-react';

interface SheetSelectorProps {
  sheets: ResourceSheet[];
  activeSheet: ResourceSheet | null;
  isSharedView: boolean;
  fetchSheetDetails: (id: string) => Promise<void>;
  setShowCreateModal: (show: boolean) => void;
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({
  sheets,
  activeSheet,
  isSharedView,
  fetchSheetDetails,
  setShowCreateModal
}) => {
  if (isSharedView) return null;

  return (
    <div className="no-print flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/5 pb-6">
      <div className="flex-grow flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mr-1">Study Sheets:</span>
        {sheets.map((sheet) => {
          const sheetId = sheet.id || (sheet as any)._id;
          const isActive = activeSheet && (activeSheet.id === sheetId || (activeSheet as any)._id === sheetId);
          return (
            <button
              key={sheetId}
              onClick={() => fetchSheetDetails(sheetId)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all duration-300 ${
                isActive 
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-lg shadow-indigo-500/5'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
              }`}
            >
              <Folder className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{sheet.name}</span>
              <span className="text-[10px] text-slate-500 font-normal">({sheet.resourceCount || 0})</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="h-10 px-4.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/15 shrink-0 hover:scale-[1.02]"
      >
        <Plus className="w-4 h-4" />
        <span>Create Sheet</span>
      </button>
    </div>
  );
};

export default SheetSelector;
