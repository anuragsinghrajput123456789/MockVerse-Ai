import React from 'react';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <LoadingSpinner />
      <span className="text-slate-400 text-sm animate-pulse font-medium">Synchronizing Paper Layout...</span>
    </div>
  );
};

export default LoadingState;
