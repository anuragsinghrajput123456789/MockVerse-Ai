import React from 'react';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  setActiveTab: (tab: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ setActiveTab }) => {
  return (
    <div className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
      {/* Decorative glows (optimized blur) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] glow-bg-indigo opacity-30 pointer-events-none rounded-full blur-[40px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] glow-bg-pink opacity-20 pointer-events-none rounded-full blur-[40px]" />

      <div className="space-y-6 md:w-3/5 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider animate-pulse-glow">
          <Zap className="w-3.5 h-3.5" />
          <span>Powered by Gemini 1.5 Pro</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
          Master Your Exams With <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MockVerse.(AI)</span>
        </h1>
        
        <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
          The ultimate smart study companion. Instantly generate balanced custom question papers, fetch itemized worked solutions, and evaluate your answers with deep AI feedback.
        </p>

        <div className="flex flex-wrap gap-4 pt-4">
          <button
            onClick={() => setActiveTab('generate')}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
          >
            <span>Create Custom Exam</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setActiveTab('resources')}
            className="px-8 py-4 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
          >
            Explore Library
          </button>
        </div>

        <div className="flex items-center space-x-6 pt-6 border-t border-white/5 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Relational DB Security</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>Bloom's Taxonomy Compliant</span>
          </div>
        </div>
      </div>

      {/* Showcase Hero Image Container */}
      <div className="md:w-2/5 flex justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-2xl blur-3xl pointer-events-none" />
        <img 
          src="/images/mockverse_workspace_hero.png" 
          alt="MockVerse Futuristic Screen" 
          className="w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl animate-float relative z-10"
        />
      </div>
    </div>
  );
};

export default HeroSection;
