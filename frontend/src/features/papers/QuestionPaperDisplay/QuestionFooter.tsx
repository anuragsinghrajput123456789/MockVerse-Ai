import React from 'react';
import { hasFooterMetadata } from './paperDisplayHelpers';

interface QuestionFooterProps {
  classVal?: string;
  totalMarks?: number;
  difficulty?: string;
  board?: string;
}

export const QuestionFooter: React.FC<QuestionFooterProps> = ({
  classVal,
  totalMarks,
  difficulty,
  board
}) => {
  if (!hasFooterMetadata(classVal, totalMarks, difficulty, board)) return null;

  return (
    <div className="bg-white/[0.02] border-t border-white/5 px-6 py-4 flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
      {classVal && <span>Class: <strong className="text-slate-300">{classVal}</strong></span>}
      {totalMarks && <span>Total Marks: <strong className="text-slate-300">{totalMarks}</strong></span>}
      {difficulty && <span>Difficulty: <strong className="text-slate-300">{difficulty}</strong></span>}
      {board && <span>Board: <strong className="text-slate-300">{board}</strong></span>}
    </div>
  );
};

export default QuestionFooter;
