import React from 'react';
import { ResourceSheet } from '../../../types';
import { 
  Printer, 
  Download, 
  FileCode, 
  CopyPlus, 
  Share2, 
  QrCode, 
  Settings, 
  Lock, 
  Unlock, 
  Bookmark, 
  Layers, 
  Calendar 
} from 'lucide-react';

interface CollectionHeaderProps {
  activeSheet: ResourceSheet;
  isSharedView: boolean;
  handlePrintSheet: () => void;
  handleExportPdf: () => Promise<void>;
  handleExportHtml: () => Promise<void>;
  handleDuplicateSheet: () => Promise<void>;
  setShowShareModal: (show: boolean) => void;
  setShowQrModal: (show: boolean) => void;
  setEditingSheet: (sheet: ResourceSheet) => void;
  setShowSettingsModal: (show: boolean) => void;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
  activeSheet,
  isSharedView,
  handlePrintSheet,
  handleExportPdf,
  handleExportHtml,
  handleDuplicateSheet,
  setShowShareModal,
  setShowQrModal,
  setEditingSheet,
  setShowSettingsModal
}) => {
  return (
    <div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">{activeSheet.name}</h1>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border flex items-center gap-1 tracking-wider ${
            activeSheet.isPublic 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {activeSheet.isPublic ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
            <span>{activeSheet.isPublic ? 'Public' : 'Private'}</span>
          </span>
        </div>
        
        {activeSheet.description && (
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-2xl">{activeSheet.description}</p>
        )}

        {/* Course Meta Context & Metadata Row */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-[11px] font-medium text-slate-400 border-t border-white/5 mt-2">
          {activeSheet.subject && (
            <span className="flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
              Subject: <strong>{activeSheet.subject}</strong>
            </span>
          )}
          {activeSheet.chapter && (
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-pink-400" />
              Chapter: <strong>{activeSheet.chapter}</strong>
            </span>
          )}
          <span>Total Materials: <strong>{activeSheet.resources?.length || 0}</strong></span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Created: <strong>{new Date(activeSheet.createdAt).toLocaleDateString()}</strong>
          </span>
          {activeSheet.updatedAt && (
            <span>Last Updated: <strong>{new Date(activeSheet.updatedAt).toLocaleDateString()}</strong></span>
          )}
        </div>
      </div>

      {/* Header Action Buttons */}
      <div className="no-print flex flex-wrap gap-2 shrink-0 w-full lg:w-auto">
        <button
          onClick={handlePrintSheet}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
          title="Print study sheet"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Print</span>
        </button>

        <button
          onClick={handleExportPdf}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
          title="Export as PDF"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">PDF</span>
        </button>

        <button
          onClick={handleExportHtml}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
          title="Export as HTML"
        >
          <FileCode className="w-4 h-4" />
          <span className="hidden sm:inline">HTML</span>
        </button>

        {!isSharedView && (
          <button
            onClick={handleDuplicateSheet}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-indigo-400 hover:text-indigo-300 transition-all text-xs font-bold flex items-center gap-1.5"
            title="Duplicate Sheet Collection"
          >
            <CopyPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>
        )}

        {activeSheet.isPublic && (
          <>
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-indigo-400 hover:text-indigo-300 transition-all text-xs font-bold flex items-center gap-1.5"
              title="Get public share URL"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-pink-400 hover:text-pink-300 transition-all text-xs font-bold flex items-center gap-1.5"
              title="Get collection QR code"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QR Code</span>
            </button>
          </>
        )}

        {!isSharedView && (
          <button
            onClick={() => {
              setEditingSheet(activeSheet);
              setShowSettingsModal(true);
            }}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            title="Collection Settings"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CollectionHeader;
