import React from 'react';
import { Sparkles, PenTool, BookOpen, ArrowRight } from 'lucide-react';

interface QuickActionsGridProps {
  setActiveTab: (tab: string) => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ setActiveTab }) => {
  const actions = [
    {
      title: "Generate Paper",
      desc: "Configure subject, marks, and parameters to instantly build balanced exam papers.",
      tab: "generate",
      icon: Sparkles,
      color: "border-indigo-500/20 text-indigo-400 hover:shadow-indigo-500/10",
    },
    {
      title: "Paper & Solutions",
      desc: "Review your generated exam papers and unlock complete step-by-step solved solutions instantly.",
      tab: "answer",
      icon: PenTool,
      color: "border-pink-500/20 text-pink-400 hover:shadow-pink-500/10",
    },
    {
      title: "Resource Library",
      desc: "Save papers, write books list, keep structured reference materials close to you.",
      tab: "resources",
      icon: BookOpen,
      color: "border-blue-500/20 text-blue-400 hover:shadow-blue-500/10",
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">
        Launch Core Tools
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <div 
              key={idx}
              onClick={() => setActiveTab(action.tab)}
              className={`glass-card glass-card-hover p-6 rounded-2xl border cursor-pointer ${action.color}`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{action.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{action.desc}</p>
              <span className="text-xs font-semibold inline-flex items-center space-x-1 hover:underline">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsGrid;
