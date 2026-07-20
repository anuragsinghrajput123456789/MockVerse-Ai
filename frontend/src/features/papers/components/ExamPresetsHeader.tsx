import React, { useState } from 'react';
import { 
  Sparkles, 
  Zap, 
  BookOpen, 
  Award, 
  Flame, 
  GraduationCap, 
  Building2, 
  Cpu, 
  Database, 
  Code, 
  Brain, 
  PlusCircle, 
  FileCheck, 
  Globe 
} from 'lucide-react';
import { EXAM_PRESETS, ExamPreset } from '../data/presetsData';

interface ExamPresetsHeaderProps {
  onSelectPreset: (preset: ExamPreset) => void;
  activePresetId?: string;
}

export const ExamPresetsHeader: React.FC<ExamPresetsHeaderProps> = ({
  onSelectPreset,
  activePresetId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'School' | 'Competitive' | 'College' | 'Custom'>('All');

  // Helper to map iconName string to Lucide React Node
  const renderPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'Award': return <Award className="w-4 h-4 text-purple-400" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'Flame': return <Flame className="w-4 h-4 text-rose-400" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      case 'Building2': return <Building2 className="w-4 h-4 text-cyan-400" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'Database': return <Database className="w-4 h-4 text-teal-400" />;
      case 'Code': return <Code className="w-4 h-4 text-indigo-300" />;
      case 'Brain': return <Brain className="w-4 h-4 text-pink-300" />;
      case 'FileCheck': return <FileCheck className="w-4 h-4 text-emerald-300" />;
      case 'Globe': return <Globe className="w-4 h-4 text-blue-400" />;
      default: return <PlusCircle className="w-4 h-4 text-indigo-400" />;
    }
  };

  const filteredPresets = selectedCategory === 'All'
    ? EXAM_PRESETS
    : EXAM_PRESETS.filter(p => p.category === selectedCategory);

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-3.5 mb-6 animate-fade-in bg-slate-900/60">
      {/* Header Title & Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/5 pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-['Sora']">
            Exam Presets & Templates
          </h3>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            (Click to 1-click pre-fill form)
          </span>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['All', 'School', 'Competitive', 'College', 'Custom'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Cards Carousel / Grid */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {filteredPresets.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-2 shrink-0 min-w-[170px] sm:min-w-[190px] transition-all duration-200 group ${
                isSelected
                  ? 'bg-indigo-500/15 border-indigo-500/60 shadow-lg shadow-indigo-500/10 scale-[1.01]'
                  : 'bg-white/5 border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 group-hover:scale-105 transition-transform shrink-0">
                  {renderPresetIcon(preset.iconName)}
                </div>
                {preset.badge && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-indigo-300 uppercase tracking-wider">
                    {preset.badge}
                  </span>
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {preset.name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                  &quot;{preset.description}&quot;
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExamPresetsHeader;
