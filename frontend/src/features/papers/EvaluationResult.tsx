import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EvaluationResultProps {
  result: string;
}

export const EvaluationResult: React.FC<EvaluationResultProps> = ({ result }) => {
  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 bg-white/5 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent mb-6">
        📊 Evaluation Results
      </h2>
      
      <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {result}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default EvaluationResult;
