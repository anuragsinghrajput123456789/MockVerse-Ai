import React, { useState, useEffect } from 'react';
import { PaperFormData } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chapterMap } from '../data/chapters';
import ChapterSelection from './ChapterSelection';
import { Sparkles, HelpCircle } from "lucide-react";

interface PaperFormProps {
  onSubmit: (data: PaperFormData) => void;
  loading: boolean;
}

const PaperForm: React.FC<PaperFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<PaperFormData>({
    subject: '',
    class: '',
    totalMarks: 100,
    difficulty: 'Medium',
    board: '',
    chapters: [],
    topics: '',
    instructions: '',
    pattern: '',
    customPatternDetails: ''
  });

  const [defaultChapters, setDefaultChapters] = useState<string[]>([]);
  const [customChapters, setCustomChapters] = useLocalStorage<string[]>('customChapters', []);
  const [newChapter, setNewChapter] = useState('');
  
  useEffect(() => {
    const subjectKey = formData.subject.trim().toLowerCase();
    const newDefaultChapters = chapterMap[subjectKey] || [];
    setDefaultChapters(newDefaultChapters);

    // Clear selected chapters that are not in the new list when subject changes
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => newDefaultChapters.includes(c) || customChapters.includes(c))
    }));
  }, [formData.subject, customChapters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subject && formData.class && formData.board && formData.chapters.length > 0) {
      onSubmit(formData);
    }
  };

  const handleChapterToggle = (chapter: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.includes(chapter)
        ? prev.chapters.filter(c => c !== chapter)
        : [...prev.chapters, chapter]
    }));
  };

  const handleAddCustomChapter = () => {
    if (newChapter.trim() && !defaultChapters.includes(newChapter.trim()) && !customChapters.includes(newChapter.trim())) {
      setCustomChapters(prev => [...prev, newChapter.trim()]);
      setNewChapter('');
    }
  };

  const handleRemoveCustomChapter = (chapter: string) => {
    setCustomChapters(prev => prev.filter(c => c !== chapter));
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c !== chapter)
    }));
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
      {/* Absolute neon flare */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all duration-300"
              placeholder="e.g., Mathematics"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Class *
            </label>
            <Select
              value={formData.class}
              onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
              required
            >
              <SelectTrigger className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-xl focus:border-indigo-500 text-sm">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={`${i + 1}`} className="hover:bg-indigo-500/20">{i + 1}th Grade</SelectItem>
                ))}
                <SelectItem value="College" className="hover:bg-indigo-500/20">College</SelectItem>
                <SelectItem value="Diploma" className="hover:bg-indigo-500/20">Diploma</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Total Marks
            </label>
            <input
              type="number"
              value={formData.totalMarks}
              onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 0 }))}
              className="w-full h-11 px-4 rounded-xl border border-white/10 text-white bg-white/5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Difficulty Level
            </label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as any }))}
            >
              <SelectTrigger className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-xl focus:border-indigo-500 text-sm">
                <SelectValue placeholder="Select Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="Easy" className="hover:bg-indigo-500/20">Easy</SelectItem>
                <SelectItem value="Medium" className="hover:bg-indigo-500/20">Medium</SelectItem>
                <SelectItem value="Average" className="hover:bg-indigo-500/20">Average</SelectItem>
                <SelectItem value="Hard" className="hover:bg-indigo-500/20">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Board / Book Type *
            </label>
            <Select
              value={formData.board}
              onValueChange={(value) => setFormData(prev => ({ ...prev, board: value }))}
              required
            >
              <SelectTrigger className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-xl focus:border-indigo-500 text-sm">
                <SelectValue placeholder="Select Board" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="NCERT" className="hover:bg-indigo-500/20">NCERT</SelectItem>
                <SelectItem value="CBSE" className="hover:bg-indigo-500/20">CBSE</SelectItem>
                <SelectItem value="ICSE" className="hover:bg-indigo-500/20">ICSE</SelectItem>
                <SelectItem value="State Board" className="hover:bg-indigo-500/20">State Board</SelectItem>
                <SelectItem value="IB" className="hover:bg-indigo-500/20">IB</SelectItem>
                <SelectItem value="Cambridge" className="hover:bg-indigo-500/20">Cambridge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Question Pattern
            </label>
            <Select
              value={formData.pattern}
              onValueChange={(value) => setFormData(prev => ({ ...prev, pattern: value }))}
            >
              <SelectTrigger className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-xl focus:border-indigo-500 text-sm">
                <SelectValue placeholder="Select Pattern" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="Board-style" className="hover:bg-indigo-500/20">Board-style</SelectItem>
                <SelectItem value="Local" className="hover:bg-indigo-500/20">Local Standard</SelectItem>
                <SelectItem value="MCQ" className="hover:bg-indigo-500/20">MCQ Only</SelectItem>
                <SelectItem value="Mixed" className="hover:bg-indigo-500/20">Mixed Format</SelectItem>
                <SelectItem value="Custom" className="hover:bg-indigo-500/20">Custom Description</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {formData.pattern === 'Custom' && (
          <div className="animate-fade-in">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Custom Paper & Question Details
            </label>
            <textarea
              value={formData.customPatternDetails || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, customPatternDetails: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all"
              rows={3}
              placeholder="e.g., Section A with 10 MCQs (1 mark each), Section B with 5 short questions (3 marks each)..."
            />
          </div>
        )}

        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
          <ChapterSelection
            defaultChapters={defaultChapters}
            customChapters={customChapters}
            selectedChapters={formData.chapters}
            onChapterToggle={handleChapterToggle}
            onRemoveCustomChapter={handleRemoveCustomChapter}
            onAddCustomChapter={handleAddCustomChapter}
            newChapter={newChapter}
            setNewChapter={setNewChapter}
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Specific Topics (Optional)
          </label>
          <input
            type="text"
            value={formData.topics}
            onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
            className="w-full h-11 px-4 rounded-xl border border-white/10 text-white bg-white/5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            placeholder="e.g., Quadratic equations, Thermodynamics laws"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all"
            rows={3}
            placeholder="e.g., Include diagram-based questions, prioritize numerical calculations..."
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{loading ? 'Synthesizing Exam Paper...' : 'Assemble & Generate Questions'}</span>
        </button>
      </form>
    </div>
  );
};

export default PaperForm;
