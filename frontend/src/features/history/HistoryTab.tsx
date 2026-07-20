import React from 'react';
import { QuestionPaper } from '../../shared/types';
import { FileText, Trash2, ArrowRight } from 'lucide-react';

interface HistoryTabProps {
  paperHistory: QuestionPaper[];
  handleSelectPaper: (paper: QuestionPaper) => void;
  handleDeletePaper: (e: React.MouseEvent, id: string) => Promise<void>;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  paperHistory,
  handleSelectPaper,
  handleDeletePaper
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-4">
        <span className="w-6 h-6 text-orange-400 font-bold">History</span>
      </div>
      {paperHistory.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">No question papers generated yet. Generate one first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paperHistory.map((paper) => (
            <div
              key={paper.id}
              className="glass-card p-5 rounded-xl border border-white/5 cursor-pointer hover:bg-slate-800/40 hover:border-indigo-500/20 transition-all hover:scale-[1.01] flex items-center justify-between"
              onClick={() => handleSelectPaper(paper)}
            >
              <div>
                <h3 className="font-bold text-white text-base">{paper.subject} - Class {paper.class}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {paper.chapters.join(', ')} • {paper.totalMarks} marks • {paper.difficulty}
                </p>
                <span className="text-[10px] text-slate-500 mt-2 block">
                  Generated: {new Date(paper.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={(e) => handleDeletePaper(e, paper.id)}
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 transition-all"
                  title="Delete Question Paper"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ArrowRight className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
