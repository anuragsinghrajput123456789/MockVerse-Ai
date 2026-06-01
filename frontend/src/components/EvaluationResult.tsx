
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EvaluationResultProps {
  result: string;
}

const EvaluationResult: React.FC<EvaluationResultProps> = ({ result }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-6">
        📊 Evaluation Results
      </h2>
      
      <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {result}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default EvaluationResult;
