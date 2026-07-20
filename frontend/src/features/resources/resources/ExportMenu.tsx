import React from 'react';
import { FileText, Printer, Globe } from 'lucide-react';

interface ExportMenuProps {
  onExportPdf: () => void;
  onExportHtml: () => void;
  onPrint: () => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ onExportPdf, onExportHtml, onPrint }) => {
  return (
    <div className="flex items-center space-x-2.5">
      <button
        onClick={onExportPdf}
        className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-xl transition duration-300 text-xs font-bold flex items-center gap-2"
        title="Download PDF"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden md:inline">Download PDF</span>
      </button>

      <button
        onClick={onExportHtml}
        className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-xl transition duration-300 text-xs font-bold flex items-center gap-2"
        title="Download HTML"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden md:inline">Download HTML</span>
      </button>

      <button
        onClick={onPrint}
        className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/30 text-pink-400 hover:text-pink-300 rounded-xl transition duration-300 text-xs font-bold flex items-center gap-2"
        title="Print Sheet"
      >
        <Printer className="w-4 h-4" />
        <span className="hidden md:inline">Print Sheet</span>
      </button>
    </div>
  );
};

export default ExportMenu;
