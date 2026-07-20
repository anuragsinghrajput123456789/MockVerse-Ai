import React, { useState } from 'react';
import { QuestionPaper } from '../../shared/types';
import QuestionPaperDisplay from './QuestionPaperDisplay';
import PomodoroTimer from './PomodoroTimer';
import AnswerForm from './AnswerForm';

interface AnswerTabProps {
  currentPaper: QuestionPaper | null;
  solutions: string;
  loading: boolean;
  onGenerateSolutions: () => Promise<void>;
  onSubmitAnswers: (answers: string[]) => Promise<void>;
  onNavigateToGenerate: () => void;
}

export const AnswerTab: React.FC<AnswerTabProps> = ({
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
        <p className="text-slate-400 mb-4">
          No question paper available. Generate one first!
        </p>
        <button
          onClick={onNavigateToGenerate}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-lg hover:from-indigo-600 hover:to-pink-600 transition-all font-bold"
        >
          Generate Question Paper
        </button>
      </div>
    );
  }

  if (showAnswerForm) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Column: Scrollable Question Paper & Solutions */}
        <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-6 max-h-[calc(100vh-160px)] overflow-y-auto pr-3 custom-scrollbar">
          <QuestionPaperDisplay
            content={currentPaper.questions}
            title={`${currentPaper.subject} Exam`}
            type="question"
            onGenerateSolutions={onGenerateSolutions}
            loading={loading}
            classVal={currentPaper.class}
            totalMarks={currentPaper.totalMarks}
            difficulty={currentPaper.difficulty}
            board={currentPaper.board}
          />
          {solutions && (
            <QuestionPaperDisplay
              content={solutions}
              title={`${currentPaper.subject} Solutions`}
              type="solution"
              classVal={currentPaper.class}
              totalMarks={currentPaper.totalMarks}
              difficulty={currentPaper.difficulty}
              board={currentPaper.board}
            />
          )}
        </div>

        {/* Right Column: Timer & Answer Inputs */}
        <div className="lg:col-span-5 space-y-6 max-h-[calc(100vh-160px)] overflow-y-auto pl-1 pr-2 custom-scrollbar">
          <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/5">
            <PomodoroTimer />
          </div>
          <AnswerForm
            questionPaper={currentPaper.questions}
            onSubmit={onSubmitAnswers}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <QuestionPaperDisplay
        content={currentPaper.questions}
        title={`${currentPaper.subject} Exam`}
        type="question"
        onGenerateSolutions={onGenerateSolutions}
        onStartAnswering={() => setShowAnswerForm(true)}
        loading={loading}
        classVal={currentPaper.class}
        totalMarks={currentPaper.totalMarks}
        difficulty={currentPaper.difficulty}
        board={currentPaper.board}
      />
      
      {solutions && (
        <QuestionPaperDisplay
          content={solutions}
          title={`${currentPaper.subject} Solutions`}
          type="solution"
          classVal={currentPaper.class}
          totalMarks={currentPaper.totalMarks}
          difficulty={currentPaper.difficulty}
          board={currentPaper.board}
        />
      )}
    </div>
  );
};

export default AnswerTab;
