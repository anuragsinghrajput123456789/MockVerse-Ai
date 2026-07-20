import React from 'react';
import { TrendingUp } from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  const stats = [
    { label: "Generated Solutions", value: "984", trend: "+18%", color: "text-indigo-400" },
    { label: "Generated Papers", value: "1,250", trend: "+24%", color: "text-pink-400" },
    { label: "Saved Notes/Library", value: "42", trend: "+8%", color: "text-purple-400" }
  ];

  return (
    <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[300px] h-[300px] glow-bg-indigo opacity-20 pointer-events-none rounded-full blur-[30px]" />
      
      <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center justify-between">
        <div className="lg:w-1/3 space-y-4">
          <h2 className="text-3xl font-extrabold text-white">Your Analytics & Progress</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Track your prep level across chapters. Our system correlates your answer reviews and visualizes overall subject completeness metrics.
          </p>
          
          {/* Circular Progress Metre */}
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="stroke-slate-800" strokeWidth="4" fill="transparent" />
                <circle cx="32" cy="32" r="28" className="stroke-indigo-500" strokeWidth="4" fill="transparent"
                  strokeDasharray={175} strokeDashoffset={175 - (175 * 84) / 100} strokeLinecap="round" />
              </svg>
              <span className="absolute text-sm font-bold text-white">84%</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Weekly Prep Completion</h4>
              <p className="text-xs text-slate-500">Goal: 5 Exam Sets • Active</p>
            </div>
          </div>
        </div>

        <div className="lg:w-2/3 w-full grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-children">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-white/5 relative flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                <h3 className={`text-3xl font-extrabold mt-2 ${stat.color}`}>{stat.value}</h3>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-4 text-xs">
                <span className="text-emerald-400 font-bold">{stat.trend} this week</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
