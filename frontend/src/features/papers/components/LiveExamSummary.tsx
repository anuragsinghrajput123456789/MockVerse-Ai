import React from 'react';
import { Award, BookOpen, Clock, Layers, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PaperFormData } from '../../../shared/types';

interface LiveExamSummaryProps {
  formData: PaperFormData;
  examCategory?: string;
  questionTypes?: string[];
  difficultyDist?: { easy: number; medium: number; hard: number };
  durationMins?: number;
}

export const LiveExamSummary: React.FC<LiveExamSummaryProps> = ({
  formData,
  examCategory = 'School Exams',
  questionTypes = ['MCQ', 'Short Answer'],
  difficultyDist = { easy: 30, medium: 50, hard: 20 },
  durationMins = 90
}) => {
  const chaptersCount = formData.chapters.length;

  // Calculate estimated total questions based on total marks and question types
  const estimatedQuestions = Math.max(
    5,
    Math.round(formData.totalMarks / (questionTypes.includes('Long Answer') ? 4 : 2.5))
  );

  // Health / Readiness Validation Check
  const issues: string[] = [];
  if (!formData.subject.trim()) issues.push('Subject required');
  if (!formData.board) issues.push('Exam target required');
  if (chaptersCount === 0) issues.push('Select at least 1 chapter');
  if (formData.totalMarks <= 0) issues.push('Valid total marks required');

  const isReady = issues.length === 0;

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-5 sticky top-6 bg-slate-900/90 backdrop-blur-md shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-['Sora']">Live Exam Spec</h3>
            <p className="text-[10px] text-slate-400">Real-time AI prompt compiler</p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider flex items-center gap-1 ${
          isReady
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
        }`}>
          {isReady ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          <span>{isReady ? 'Ready' : 'Incomplete'}</span>
        </div>
      </div>

      {/* Target Spec Summary Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-indigo-400" />
            <span>Target Exam</span>
          </div>
          <div className="font-bold text-white truncate">
            {formData.board || 'Not Selected'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {examCategory} {formData.class ? `(${formData.class})` : ''}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-purple-400" />
            <span>Subject</span>
          </div>
          <div className="font-bold text-white truncate">
            {formData.subject || 'Not Entered'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {chaptersCount} {chaptersCount === 1 ? 'Chapter' : 'Chapters'} Selected
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-pink-400" />
            <span>Marks & Time</span>
          </div>
          <div className="font-bold text-white">
            {formData.totalMarks} Marks
          </div>
          <div className="text-[10px] text-slate-400">
            Est. ~{durationMins} Mins
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Est. Questions</span>
          </div>
          <div className="font-bold text-white">
            ~{estimatedQuestions} Qs
          </div>
          <div className="text-[10px] text-slate-400">
            {formData.difficulty} Profile
          </div>
        </div>
      </div>

      {/* Difficulty Weightage Gauge */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Difficulty Balance</span>
          <span>{difficultyDist.easy}% E | {difficultyDist.medium}% M | {difficultyDist.hard}% H</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${difficultyDist.easy}%` }} />
          <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${difficultyDist.medium}%` }} />
          <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${difficultyDist.hard}%` }} />
        </div>
      </div>

      {/* Selected Question Types Badges */}
      {questionTypes.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format Distribution</span>
          <div className="flex flex-wrap gap-1.5">
            {questionTypes.map(type => (
              <span key={type} className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-semibold">
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Validation / Health Feedback */}
      {!isReady && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Missing Configuration Fields:</span>
          </div>
          <ul className="list-disc list-inside text-[10px] space-y-0.5 text-amber-200/90">
            {issues.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {isReady && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px]">All required parameters locked. Ready to synthesize AI exam.</span>
        </div>
      )}
    </div>
  );
};

export default LiveExamSummary;
