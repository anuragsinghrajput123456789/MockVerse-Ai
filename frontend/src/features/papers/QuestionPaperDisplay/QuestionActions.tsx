import React from 'react';
import { Sparkles, PenTool } from 'lucide-react';

interface QuestionActionsProps {
  type: 'question' | 'solution';
  loading?: boolean;
  onGenerateSolutions?: () => void;
  onStartAnswering?: () => void;
}

export const QuestionActions: React.FC<QuestionActionsProps> = ({
  type,
  loading,
  onGenerateSolutions,
  onStartAnswering
}) => {
  return (
    <div className="flex flex-wrap gap-3">
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
  );
};

export default QuestionActions;
