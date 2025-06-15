
import React from 'react';
import EvaluationResult from '../EvaluationResult';

interface EvaluateTabProps {
  evaluationResult: string;
  onNavigateToAnswer: () => void;
}

const EvaluateTab: React.FC<EvaluateTabProps> = ({ evaluationResult, onNavigateToAnswer }) => {
  if (evaluationResult) {
    return <EvaluationResult result={evaluationResult} />;
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        No evaluation results available. Submit your answers first!
      </p>
      <button
        onClick={onNavigateToAnswer}
        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
      >
        Submit Answers
      </button>
    </div>
  );
};

export default EvaluateTab;
