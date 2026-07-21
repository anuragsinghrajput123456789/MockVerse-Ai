import React, { useState, useEffect, useMemo } from 'react';
import { PaperFormData } from '../../shared/types';
import { useLocalStorage } from '../../shared/hooks/useLocalStorage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chapterMap } from '../../data/chapters';
import ChapterSelection from './ChapterSelection';
import ExamPresetsHeader from './components/ExamPresetsHeader';
import LiveExamSummary from './components/LiveExamSummary';
import { ExamPreset } from './data/presetsData';
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Award, 
  Layers, 
  Bot, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle2, 
  Tag
} from "lucide-react";
import { validatePaperForm } from '../../shared/utils/validation';

interface PaperFormProps {
  onSubmit: (data: PaperFormData) => void;
  loading: boolean;
}

// Exam Categories mapping to Exams list
const EXAM_CATEGORIES: Record<string, { icon: React.ReactNode; exams: string[] }> = {
  'School Exams': {
    icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
    exams: ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE']
  },
  'College / University': {
    icon: <GraduationCap className="w-4 h-4 text-purple-400" />,
    exams: ['B.Tech', 'BCA', 'MCA', 'B.Sc', 'B.Com', 'BA', 'MBA', 'M.Tech']
  },
  'Competitive Exams': {
    icon: <Sparkles className="w-4 h-4 text-pink-400" />,
    exams: ['JEE Main', 'JEE Advanced', 'NEET UG', 'CUET UG', 'CUET PG', 'CAT', 'GATE CSE', 'GATE ECE', 'CLAT', 'NDA', 'CDS']
  },
  'Government Exams': {
    icon: <Building2 className="w-4 h-4 text-cyan-400" />,
    exams: ['SSC (CGL / CHSL / MTS)', 'UPSC (Civil Services)', 'Banking (IBPS / SBI)', 'State PSC / Civil Services', 'RRB Railway Exams', 'Teaching Exams (CTET)']
  },
  'Professional Certification': {
    icon: <Award className="w-4 h-4 text-emerald-400" />,
    exams: ['AWS Certified', 'Azure', 'Google Cloud', 'Cisco CCNA', 'Oracle', 'Microsoft', 'CompTIA']
  },
  'Custom Exam': {
    icon: <Layers className="w-4 h-4 text-amber-400" />,
    exams: ['Custom Standard']
  }
};

// Common Subjects List for Autocomplete Suggestions
const COMMON_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science', 
  'English', 'History', 'Geography', 'Economics', 'Political Science', 
  'Computer Science', 'Operating Systems', 'Data Structures & Algorithms', 
  'Database Management Systems', 'Machine Learning', 'Artificial Intelligence', 
  'Computer Networks', 'Software Engineering', 'Quantitative Aptitude', 
  'Logical Reasoning', 'General Knowledge', 'Indian Polity & Governance'
];

// Quick AI Prompt Instruction Tags
const AI_PROMPT_TAGS = [
  { label: '🎯 Conceptual Focus', prompt: 'Focus heavily on testing fundamental concepts and theoretical derivations.' },
  { label: '🚫 Avoid Repeated PYQs', prompt: 'Avoid standard repetitive previous year questions. Generate fresh application-based questions.' },
  { label: '💡 Include HOTS Questions', prompt: 'Include High Order Thinking Skills (HOTS) questions requiring deep analytical reasoning.' },
  { label: '📘 Strict NCERT Grounded', prompt: 'Ensure all questions are strictly grounded in standard NCERT textbook lines and examples.' },
  { label: '🔥 Tricky Numericals', prompt: 'Prioritize multi-step tricky numerical calculations with moderate to complex values.' },
  { label: '💼 Interview Level Depth', prompt: 'Format long-answer questions to match technical interview problem scenarios.' },
  { label: '🏆 Olympiad Level', prompt: 'Include top 10% high-difficulty competition style questions.' }
];

const DEFAULT_FORM_STATE: PaperFormData & {
  examCategory: string;
  durationMins: number;
  questionTypes: string[];
  difficultyDist: { easy: number; medium: number; hard: number };
  language: string;
  selectedAiTags: string[];
} = {
  subject: '',
  class: '10',
  totalMarks: 100,
  difficulty: 'Medium',
  board: 'CBSE',
  chapters: [],
  topics: '',
  instructions: '',
  pattern: 'Board-style',
  customPatternDetails: '',
  examCategory: 'School Exams',
  durationMins: 90,
  questionTypes: ['MCQ', 'Short Answer', 'Long Answer'],
  difficultyDist: { easy: 30, medium: 50, hard: 20 },
  language: 'English',
  selectedAiTags: []
};

const PaperForm: React.FC<PaperFormProps> = ({ onSubmit, loading }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [draftState, setDraftState] = useLocalStorage('mockverse_exam_builder_draft', DEFAULT_FORM_STATE);
  const [formData, setFormData] = useState(draftState);
  const [activePreset, setActivePreset] = useState<ExamPreset | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customChapters, setCustomChapters] = useLocalStorage<string[]>('customChapters', []);
  const [newChapter, setNewChapter] = useState('');
  const [subjectSearch, setSubjectSearch] = useState(formData.subject);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync isSubmitting with parent loading state
  useEffect(() => {
    if (!loading) {
      setIsSubmitting(false);
    }
  }, [loading]);

  // Auto-save draft
  useEffect(() => {
    setDraftState(formData);
  }, [formData, setDraftState]);

  // Resolve default chapters based on subject
  const defaultChapters = useMemo(() => {
    const subjectKey = formData.subject.trim().toLowerCase();
    return chapterMap[subjectKey] || [];
  }, [formData.subject]);

  // Filter subject autocomplete options
  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return COMMON_SUBJECTS;
    return COMMON_SUBJECTS.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase().trim()));
  }, [subjectSearch]);

  const isCollegeCategory = formData.examCategory === 'College / University';
  const isSchoolCategory = formData.examCategory === 'School Exams';

  // Category Change Handler
  const handleCategoryChange = (category: string) => {
    const categoryInfo = EXAM_CATEGORIES[category];
    const defaultBoard = categoryInfo ? categoryInfo.exams[0] : 'Custom Standard';
    
    setFormData(prev => ({
      ...prev,
      examCategory: category,
      board: defaultBoard,
      class: category === 'School Exams' ? '10' : category === 'College / University' ? 'Semester 4' : ''
    }));
  };

  // Preset Select Handler — 1-Click Pre-fills Form Fields
  const handleSelectPreset = (preset: ExamPreset) => {
    setActivePreset(preset);

    if (preset.category === 'Custom' || preset.id === 'custom-exam') {
      setFormData(DEFAULT_FORM_STATE);
      setSubjectSearch('');
      setErrors({});
      return;
    }

    const presetData = preset.data;
    const resolvedSubject = presetData.subject || formData.subject;
    const resolvedSubjectKey = resolvedSubject.trim().toLowerCase();
    const resolvedDefaultChapters = chapterMap[resolvedSubjectKey] || [];
    const targetChapters = presetData.chapters && presetData.chapters.length > 0 
      ? presetData.chapters 
      : resolvedDefaultChapters;

    setFormData(prev => ({
      ...prev,
      board: presetData.board || prev.board,
      class: presetData.class !== undefined ? presetData.class : prev.class,
      subject: resolvedSubject,
      totalMarks: presetData.totalMarks || prev.totalMarks,
      difficulty: presetData.difficulty || prev.difficulty,
      pattern: presetData.pattern || prev.pattern,
      customPatternDetails: presetData.customPatternDetails || prev.customPatternDetails,
      instructions: presetData.instructions || prev.instructions,
      chapters: targetChapters,
      examCategory: preset.category === 'School' ? 'School Exams' 
        : preset.category === 'College' ? 'College / University'
        : preset.category === 'Competitive' ? 'Competitive Exams'
        : prev.examCategory
    }));

    if (resolvedSubject) {
      setSubjectSearch(resolvedSubject);
    }

    setErrors({});
  };

  // Chapter Toggle Handlers
  const handleChapterToggle = (chapter: string) => {
    setFormData(prev => {
      const nextChapters = prev.chapters.includes(chapter)
        ? prev.chapters.filter(c => c !== chapter)
        : [...prev.chapters, chapter];
      
      if (nextChapters.length > 0 && errors.chapters) {
        setErrors(err => ({ ...err, chapters: '' }));
      }
      return { ...prev, chapters: nextChapters };
    });
  };

  const handleSelectAllChapters = (allChapters: string[]) => {
    setFormData(prev => ({ ...prev, chapters: allChapters }));
  };

  const handleClearAllChapters = () => {
    setFormData(prev => ({ ...prev, chapters: [] }));
  };

  const handleAddCustomChapter = () => {
    if (newChapter.trim() && !defaultChapters.includes(newChapter.trim()) && !customChapters.includes(newChapter.trim())) {
      setCustomChapters(prev => [...prev, newChapter.trim()]);
      setFormData(prev => ({ ...prev, chapters: [...prev.chapters, newChapter.trim()] }));
      setNewChapter('');
    }
  };

  const handleBulkAddChapters = (newChaptersList: string[]) => {
    const uniqueNew = newChaptersList.filter(c => !customChapters.includes(c) && !defaultChapters.includes(c));
    if (uniqueNew.length > 0) {
      setCustomChapters(prev => [...prev, ...uniqueNew]);
    }
    setFormData(prev => ({
      ...prev,
      chapters: Array.from(new Set([...prev.chapters, ...newChaptersList]))
    }));
  };

  const handleRemoveCustomChapter = (chapter: string) => {
    setCustomChapters(prev => prev.filter(c => c !== chapter));
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c !== chapter)
    }));
  };

  // AI Prompt Instruction Tag Toggle
  const handleToggleAiTag = (tagLabel: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedAiTags.includes(tagLabel);
      const nextTags = isSelected
        ? prev.selectedAiTags.filter(t => t !== tagLabel)
        : [...prev.selectedAiTags, tagLabel];
      return { ...prev, selectedAiTags: nextTags };
    });
  };

  // Format Checklist Toggle
  const handleToggleQuestionType = (type: string) => {
    setFormData(prev => {
      const isSelected = prev.questionTypes.includes(type);
      const nextTypes = isSelected
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type];
      return { ...prev, questionTypes: nextTypes };
    });
  };

  const handleResetForm = () => {
    if (window.confirm('Reset all exam builder settings to defaults?')) {
      setFormData(DEFAULT_FORM_STATE);
      setSubjectSearch('');
      setActivePreset(null);
      setErrors({});
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isSubmitting) return;

    const newErrors = validatePaperForm(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Navigate to first step containing an error
      if (newErrors.board || newErrors.examCategory) setCurrentStep(1);
      else if (newErrors.subject || newErrors.class) setCurrentStep(2);
      else if (newErrors.chapters) setCurrentStep(3);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Compile extra specifications into instructions and customPatternDetails
    const tagPrompts = formData.selectedAiTags
      .map(tagLabel => AI_PROMPT_TAGS.find(t => t.label === tagLabel)?.prompt)
      .filter(Boolean)
      .join(' ');

    const compiledInstructions = [
      `Target Exam Category: ${formData.examCategory}`,
      `Exam Target: ${formData.board}`,
      `Exam Duration: ${formData.durationMins} minutes`,
      `Language: ${formData.language}`,
      `Format Distribution: ${formData.questionTypes.join(', ')}`,
      `Difficulty Ratio: ${formData.difficultyDist.easy}% Easy, ${formData.difficultyDist.medium}% Medium, ${formData.difficultyDist.hard}% Hard`,
      tagPrompts ? `Special Requirements: ${tagPrompts}` : '',
      formData.instructions
    ].filter(Boolean).join('\n');

    const compiledPayload: PaperFormData = {
      subject: formData.subject.trim(),
      class: formData.class || 'N/A',
      totalMarks: formData.totalMarks,
      difficulty: formData.difficulty,
      board: formData.board,
      chapters: formData.chapters,
      topics: formData.topics,
      instructions: compiledInstructions,
      pattern: formData.pattern,
      customPatternDetails: formData.customPatternDetails
    };

    onSubmit(compiledPayload);
  };

  return (
    <div className="space-y-6">
      {/* ─── TOP EXAM PRESETS HEADER ─── */}
      <ExamPresetsHeader
        onSelectPreset={handleSelectPreset}
        activePresetId={activePreset?.id}
      />

      {/* ─── MAIN BUILDER GRID: PROGRESSIVE 5-STEP FORM (Left 8 Cols) + LIVE SUMMARY (Right 4 Cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* WIZARD FORM CONTAINER */}
        <div className="lg:col-span-8 glass-card p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-slate-900/90 shadow-2xl">
          
          {/* Header & Step Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-extrabold text-white font-['Sora'] tracking-tight">Smart AI Exam Builder</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">Configure intelligent exam specifications step-by-step</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-all flex items-center space-x-1"
                title="Reset form to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
                Step {currentStep} of 5
              </span>
            </div>
          </div>

          {/* Active Preset Banner */}
          {activePreset && activePreset.category !== 'Custom' && (
            <div className="mb-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between animate-fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Active Template: <strong>{activePreset.name}</strong> ({activePreset.badge})</span>
              </div>
              <button
                type="button"
                onClick={() => setActivePreset(null)}
                className="text-[11px] font-bold text-slate-400 hover:text-white underline ml-3"
              >
                Clear
              </button>
            </div>
          )}

          {/* Step Navigation Tabs Bar */}
          <div className="grid grid-cols-5 gap-1.5 mb-8 bg-black/40 p-1.5 rounded-2xl border border-white/5">
            {[
              { num: 1, label: 'Target' },
              { num: 2, label: 'Subject' },
              { num: 3, label: 'Chapters' },
              { num: 4, label: 'Settings' },
              { num: 5, label: 'AI Tags' }
            ].map(step => (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`py-2 px-1 rounded-xl text-center transition-all ${
                  currentStep === step.num
                    ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold shadow-md'
                    : currentStep > step.num
                    ? 'bg-indigo-500/10 text-indigo-300 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold">Step {step.num}</div>
                <div className="text-xs truncate font-semibold hidden sm:block">{step.label}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            
            {/* ─── STEP 1: EXAM CATEGORY & TARGET EXAM ─── */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    1. Select Exam Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(EXAM_CATEGORIES).map(([catKey, catVal]) => {
                      const isSelected = formData.examCategory === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => handleCategoryChange(catKey)}
                          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 scale-[1.02]'
                              : 'bg-white/5 border-white/10 hover:border-indigo-500/30 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            {catVal.icon}
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                          </div>
                          <span className="text-xs font-bold leading-snug">{catKey}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    2. Select Target Exam / Board *
                  </label>
                  <Select
                    value={formData.board}
                    onValueChange={(val) => {
                      setFormData(prev => ({ ...prev, board: val }));
                      if (errors.board) setErrors(prev => ({ ...prev, board: '' }));
                    }}
                  >
                    <SelectTrigger className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:ring-1 focus:ring-indigo-500/20">
                      <SelectValue placeholder="Select Target Exam" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white max-h-60 overflow-y-auto">
                      {(EXAM_CATEGORIES[formData.examCategory]?.exams || []).map(exam => (
                        <SelectItem key={exam} value={exam} className="hover:bg-indigo-500/20">
                          {exam}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.board && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.board}</p>
                  )}
                </div>
              </div>
            )}

            {/* ─── STEP 2: SUBJECT & GRADE / SEMESTER ─── */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                {/* Contextual Grade / Class / Year Select */}
                {(isSchoolCategory || isCollegeCategory) && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Class / Grade / Semester *
                    </label>
                    <Select
                      value={formData.class}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, class: val }))}
                    >
                      <SelectTrigger className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-xl text-sm">
                        <SelectValue placeholder="Select Class/Semester" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white max-h-60 overflow-y-auto">
                        {isSchoolCategory ? (
                          Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={`${i + 1}`} className="hover:bg-indigo-500/20">
                              Class {i + 1}
                            </SelectItem>
                          ))
                        ) : (
                          Array.from({ length: 8 }, (_, i) => (
                            <SelectItem key={i + 1} value={`Semester ${i + 1}`} className="hover:bg-indigo-500/20">
                              Semester {i + 1}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Searchable Subject Autocomplete */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => {
                      setSubjectSearch(e.target.value);
                      setFormData(prev => ({ ...prev, subject: e.target.value }));
                      if (errors.subject) setErrors(prev => ({ ...prev, subject: '' }));
                      setShowSubjectDropdown(true);
                    }}
                    onFocus={() => setShowSubjectDropdown(true)}
                    className="w-full h-12 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 bg-white/5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                    placeholder="Type to search or enter subject (e.g. Mathematics, Operating Systems)"
                  />

                  {/* Autocomplete Suggestions Dropdown */}
                  {showSubjectDropdown && filteredSubjects.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {filteredSubjects.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSubjectSearch(s);
                            setFormData(prev => ({ ...prev, subject: s }));
                            setShowSubjectDropdown(false);
                            if (errors.subject) setErrors(prev => ({ ...prev, subject: '' }));
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:text-white hover:bg-indigo-500/20 transition-colors flex items-center justify-between"
                        >
                          <span>{s}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">Suggested</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {errors.subject && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.subject}</p>
                  )}
                </div>
              </div>
            )}

            {/* ─── STEP 3: CHAPTERS & TOPICS ─── */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <ChapterSelection
                  defaultChapters={defaultChapters}
                  customChapters={customChapters}
                  selectedChapters={formData.chapters}
                  onChapterToggle={handleChapterToggle}
                  onRemoveCustomChapter={handleRemoveCustomChapter}
                  onAddCustomChapter={handleAddCustomChapter}
                  onBulkAddChapters={handleBulkAddChapters}
                  onSelectAllChapters={handleSelectAllChapters}
                  onClearAllChapters={handleClearAllChapters}
                  newChapter={newChapter}
                  setNewChapter={setNewChapter}
                />
                {errors.chapters && (
                  <p className="text-red-400 text-xs font-medium">{errors.chapters}</p>
                )}

                {/* Specific Topics Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Specific Focus Topics (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.topics}
                    onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-white/10 text-white bg-white/5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                    placeholder="e.g., Quadratic Equations, Integration by Parts, Memory Management"
                  />
                </div>
              </div>
            )}

            {/* ─── STEP 4: PAPER SETTINGS & QUESTION TYPES ─── */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Total Marks *
                    </label>
                    <input
                      type="number"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 0 }))}
                      className="w-full h-11 px-4 rounded-xl border border-white/10 text-white bg-white/5 text-sm focus:outline-none focus:border-indigo-500"
                      min="10"
                      max="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.durationMins}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationMins: parseInt(e.target.value) || 60 }))}
                      className="w-full h-11 px-4 rounded-xl border border-white/10 text-white bg-white/5 text-sm focus:outline-none focus:border-indigo-500"
                      min="15"
                      max="360"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Overall Difficulty
                    </label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(val: any) => setFormData(prev => ({ ...prev, difficulty: val }))}
                    >
                      <SelectTrigger className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-xl text-sm">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Average">Average</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Question Types Checklist */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Question Format Distribution
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {['MCQ', 'Short Answer', 'Long Answer', 'Numerical', 'Assertion Reason', 'Case Study'].map(type => {
                      const isSelected = formData.questionTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleToggleQuestionType(type)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                            isSelected
                              ? 'bg-indigo-500/20 border-indigo-500 text-white'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Pattern */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Question Pattern Template
                  </label>
                  <Select
                    value={formData.pattern}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, pattern: val }))}
                  >
                    <SelectTrigger className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-xl text-sm">
                      <SelectValue placeholder="Select Pattern" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      <SelectItem value="Board-style">Board Standard</SelectItem>
                      <SelectItem value="Local">Local Standard</SelectItem>
                      <SelectItem value="MCQ">MCQ Only</SelectItem>
                      <SelectItem value="Mixed">Mixed Format</SelectItem>
                      <SelectItem value="Custom">Custom Pattern Description</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* ─── STEP 5: AI SPECIAL INSTRUCTIONS & TAGS ─── */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Quick AI Instruction Tags (Click to toggle)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AI_PROMPT_TAGS.map((t) => {
                      const isSelected = formData.selectedAiTags.includes(t.label);
                      return (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => handleToggleAiTag(t.label)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white border-transparent shadow-md scale-[1.02]'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    <span>Additional AI Instructions (Optional)</span>
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={4}
                    className="w-full p-4 rounded-xl border border-white/10 text-white placeholder-slate-500 bg-white/5 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g., Include diagram questions, prioritize numerical calculations, add formula hints..."
                  />
                </div>
              </div>
            )}

            {/* ─── Wizard Controls Bar ─── */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold hover:bg-white/5 transition-all flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-indigo-500/20"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{(loading || isSubmitting) ? 'Synthesizing Exam Paper...' : 'Assemble & Generate Questions'}</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LIVE SUMMARY SIDEBAR (Right 4 Cols) */}
        <div className="lg:col-span-4 w-full">
          <LiveExamSummary
            formData={formData}
            examCategory={formData.examCategory}
            questionTypes={formData.questionTypes}
            difficultyDist={formData.difficultyDist}
            durationMins={formData.durationMins}
          />
        </div>

      </div>
    </div>
  );
};

export default PaperForm;
