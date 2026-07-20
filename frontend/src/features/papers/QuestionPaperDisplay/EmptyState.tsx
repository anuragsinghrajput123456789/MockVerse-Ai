import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 text-center border border-dashed border-white/10 rounded-2xl">
      <span className="text-3xl">📄</span>
      <h3 className="text-white font-semibold">No Content Selected</h3>
      <p className="text-slate-400 text-sm max-w-sm">Please generate a new question paper or select one from history to begin.</p>
    </div>
  );
};

export default EmptyState;
