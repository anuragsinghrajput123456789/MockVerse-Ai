import React from 'react';
import EvaluationResult from './EvaluationResult';

interface EvaluateTabProps {
  evaluationResult: string;
  onNavigateToAnswer: () => void;
}

export const EvaluateTab: React.FC<EvaluateTabProps> = ({ evaluationResult, onNavigateToAnswer }) => {
  if (evaluationResult) {
    return <EvaluationResult result={evaluationResult} />;
  }

  return (
    <div className="text-center py-12">
      <p className="text-slate-400 mb-4">
        No evaluation results available. Submit your answers first!
      </p>
      <button
        onClick={onNavigateToAnswer}
        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-lg hover:from-indigo-600 hover:to-pink-600 transition-all font-bold"
      >
        Submit Answers
      </button>
    </div>
  );
};

export default EvaluateTab;
