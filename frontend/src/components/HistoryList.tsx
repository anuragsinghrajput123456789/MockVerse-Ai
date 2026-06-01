
import React from 'react';
import { QuestionPaper } from '../types';

interface HistoryListProps {
  papers: QuestionPaper[];
  onSelect: (paper: QuestionPaper) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ papers, onSelect }) => {
  if (papers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-6">
          Paper History
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No papers generated yet. Create your first question paper!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-6">
        Paper History ({papers.length})
      </h2>
      
      <div className="space-y-4">
        {papers.map((paper) => (
          <div
            key={paper.id}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelect(paper)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {paper.subject} - Class {paper.class}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(paper.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs">
                {paper.board}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
                {paper.difficulty}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs">
                {paper.totalMarks} marks
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Chapters: {paper.chapters.slice(0, 3).join(', ')}
              {paper.chapters.length > 3 && ` +${paper.chapters.length - 3} more`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
