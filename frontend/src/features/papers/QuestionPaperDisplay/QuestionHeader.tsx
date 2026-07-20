import React from 'react';
import { formatPaperSubheading } from './paperDisplayHelpers';

interface QuestionHeaderProps {
  title: string;
  type: 'question' | 'solution';
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({ title, type }) => {
  return (
    <div>
      <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="text-xs text-slate-400 mt-1.5 font-medium tracking-wide">
        {formatPaperSubheading(type)}
      </p>
    </div>
  );
};

export default QuestionHeader;
