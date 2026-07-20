import React from 'react';
import { Sparkles, Zap, Award, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import { PaperFormData } from '../../../shared/types';

export interface PresetTemplate {
  id: string;
  name: string;
  category: string;
  badge: string;
  icon: React.ReactNode;
  data: Partial<PaperFormData> & {
    examCategory?: string;
    questionTypes?: string[];
  };
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'cbse-unit',
    name: 'CBSE Unit Test',
    category: 'School',
    badge: '30 Mins • 25 Marks',
    icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
    data: {
      examCategory: 'School Exams',
      board: 'CBSE',
      class: '10',
      totalMarks: 25,
      difficulty: 'Easy',
      pattern: 'Board-style',
      subject: 'Mathematics',
      questionTypes: ['MCQ', 'Short Answer'],
      instructions: 'Focus on core textbook concepts and 1-2 mark questions.',
    }
  },
  {
    id: 'cbse-final',
    name: 'CBSE Board Final',
    category: 'School',
    badge: '180 Mins • 80 Marks',
    icon: <Award className="w-3.5 h-3.5 text-purple-400" />,
    data: {
      examCategory: 'School Exams',
      board: 'CBSE',
      class: '12',
      totalMarks: 80,
      difficulty: 'Medium',
      pattern: 'Board-style',
      subject: 'Physics',
      questionTypes: ['MCQ', 'Short Answer', 'Long Answer', 'Assertion Reason', 'Case Study'],
      instructions: 'Construct balanced sections matching latest CBSE Class 12 sample paper pattern.',
    }
  },
  {
    id: 'jee-mock',
    name: 'JEE Main Mock',
    category: 'Competitive',
    badge: '180 Mins • 100 Marks',
    icon: <Sparkles className="w-3.5 h-3.5 text-pink-400" />,
    data: {
      examCategory: 'Competitive Exams',
      board: 'JEE Main',
      class: '12',
      totalMarks: 100,
      difficulty: 'Hard',
      pattern: 'MCQ',
      subject: 'Mathematics',
      questionTypes: ['MCQ', 'Numerical'],
      instructions: 'Include single-correct MCQs (+4/-1 marking) and numerical value questions.',
    }
  },
  {
    id: 'neet-speed',
    name: 'NEET Biology Speed Test',
    category: 'Competitive',
    badge: '60 Mins • 90 Marks',
    icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" />,
    data: {
      examCategory: 'Competitive Exams',
      board: 'NEET UG',
      class: '11',
      totalMarks: 90,
      difficulty: 'Medium',
      pattern: 'MCQ',
      subject: 'Biology',
      questionTypes: ['MCQ', 'Assertion Reason'],
      instructions: 'Strictly NCERT grounded MCQs with diagram and assertion-reason questions.',
    }
  },
  {
    id: 'college-mid',
    name: 'College Semester Mid-Term',
    category: 'College',
    badge: '90 Mins • 50 Marks',
    icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />,
    data: {
      examCategory: 'College / University',
      board: 'B.Tech',
      class: 'Semester 4',
      totalMarks: 50,
      difficulty: 'Medium',
      pattern: 'Mixed',
      subject: 'Operating Systems',
      questionTypes: ['Short Answer', 'Long Answer', 'Numerical'],
      instructions: 'University midterm style with algorithm tracing and analytical questions.',
    }
  },
  {
    id: 'upsc-prelims',
    name: 'UPSC GS Prelims Mock',
    category: 'Government',
    badge: '120 Mins • 100 Marks',
    icon: <Building2 className="w-3.5 h-3.5 text-cyan-400" />,
    data: {
      examCategory: 'Government Exams',
      board: 'UPSC Prelims',
      class: '',
      totalMarks: 100,
      difficulty: 'Hard',
      pattern: 'MCQ',
      subject: 'Indian Polity & Governance',
      questionTypes: ['MCQ', 'Assertion Reason'],
      instructions: 'Multi-statement MCQs requiring deep analytical clarity and constitutional grounding.',
    }
  }
];

interface PresetTemplatesBarProps {
  onSelectPreset: (preset: PresetTemplate) => void;
}

export const PresetTemplatesBar: React.FC<PresetTemplatesBarProps> = ({ onSelectPreset }) => {
  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Preset Templates</span>
        </span>
        <span className="text-[10px] text-slate-500 font-medium">Click to 1-click prefill form</span>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {PRESET_TEMPLATES.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/10 text-left shrink-0 transition-all group duration-200"
          >
            <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 group-hover:scale-110 transition-transform">
              {preset.icon}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors leading-tight">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                {preset.badge}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PresetTemplatesBar;
