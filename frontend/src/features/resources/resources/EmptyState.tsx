import React from 'react';
import { Folder } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No active collection selected",
  description = "Please create or select a study resource collection sheet from the dashboard.",
  icon,
  action
}) => {
  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 text-center py-20 space-y-4">
      {icon || <Folder className="w-12 h-12 text-slate-700 mx-auto opacity-40 animate-pulse" />}
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mx-auto">
        {description}
      </p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;

