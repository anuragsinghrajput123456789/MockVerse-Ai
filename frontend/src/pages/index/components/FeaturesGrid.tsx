import React from 'react';
import { Brain, Award, CheckCircle2 } from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      title: "AI Question Generation",
      desc: "Constructs multi-part questions matching CBSE, ICSE, or generic boards using cognitive depth parameters.",
      icon: Brain
    },
    {
      title: "Step-by-Step Solutions",
      desc: "Instantly solves generated questions with clear working, explanations, and final answer highlights.",
      icon: Award
    },
    {
      title: "Live Chatbot Tutor",
      desc: "Interactive assistant loaded dynamically with your active question sheet context to explain answers line-by-line.",
      icon: CheckCircle2
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-3xl font-extrabold text-white">Platform Core Ecosystem Capabilities</h2>
        <p className="text-sm text-slate-400">
          Comprehensive smart classroom integrations built for student curriculum mastery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="glass-card p-8 rounded-2xl border border-white/5 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesGrid;
