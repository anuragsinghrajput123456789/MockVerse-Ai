
import React, { useState } from 'react';
import { QuestionPaper } from '../../types';
import QuestionPaperDisplay from '../QuestionPaperDisplay';
import PomodoroTimer from '../PomodoroTimer';
import AnswerForm from '../AnswerForm';

interface AnswerTabProps {
  currentPaper: QuestionPaper | null;
  solutions: string;
  loading: boolean;
  onGenerateSolutions: () => Promise<void>;
  onSubmitAnswers: (answers: string[]) => Promise<void>;
  onNavigateToGenerate: () => void;
}

const AnswerTab: React.FC<AnswerTabProps> = ({
  currentPaper,
  solutions,
  loading,
  onGenerateSolutions,
  onSubmitAnswers,
  onNavigateToGenerate,
}) => {
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  if (!currentPaper) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No question paper available. Generate one first!
        </p>
        <button
          onClick={onNavigateToGenerate}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-lg hover:from-indigo-600 hover:to-pink-600 transition-all"
        >
          Generate Question Paper
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <QuestionPaperDisplay
        content={currentPaper.questions}
        title="Question Paper"
        type="question"
        onGenerateSolutions={onGenerateSolutions}
        onStartAnswering={() => setShowAnswerForm(true)}
        loading={loading}
      />
      
      {solutions && (
        <QuestionPaperDisplay
          content={solutions}
          title="Solutions"
          type="solution"
        />
      )}
      
      {showAnswerForm && (
        <>
          <PomodoroTimer />
          <AnswerForm
            questionPaper={currentPaper.questions}
            onSubmit={onSubmitAnswers}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default AnswerTab;
