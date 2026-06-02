import React from "react";
import { Download, Sparkles, PenTool } from "lucide-react";

interface QuestionPaperHeaderProps {
  title: string;
  type: "question" | "solution";
  loading?: boolean;
  onGenerateSolutions?: () => void;
  onStartAnswering?: () => void;
  onDownloadPDF?: () => void;
}

const QuestionPaperHeader: React.FC<QuestionPaperHeaderProps> = ({
  title,
  type,
  loading,
  onGenerateSolutions,
  onStartAnswering,
  onDownloadPDF
}) => {
  return (
    <div className="bg-white/5 px-6 py-5 border-b border-white/5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium tracking-wide">
            {type === 'question' ? 'AI Question Paper' : 'AI Solution Key'} • Generated {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onDownloadPDF}
            className="px-4.5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-xl transition-all duration-300 text-xs font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          
          {onGenerateSolutions && type === 'question' && (
            <button
              onClick={onGenerateSolutions}
              disabled={loading}
              className="px-4.5 py-2.5 bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/35 hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 text-xs font-bold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Solving...' : 'Generate Solutions'}</span>
            </button>
          )}
          
          {onStartAnswering && type === 'question' && (
            <button
              onClick={onStartAnswering}
              className="px-4.5 py-2.5 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-300 hover:scale-105 text-xs font-bold flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              <span>Start Answering</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperHeader;
