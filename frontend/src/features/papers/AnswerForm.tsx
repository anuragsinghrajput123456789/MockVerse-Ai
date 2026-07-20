import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Plus, Trash2, PenTool } from 'lucide-react';

interface AnswerFormProps {
  questionPaper: string;
  onSubmit: (answers: string[]) => void;
  loading: boolean;
}

// Helper to parse questions from markdown
const parseQuestions = (markdown: string): string[] => {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const questions: string[] = [];
  let currentQuestion = '';
  
  // Detects start of a numbered question, e.g. "1. ", "Q2.", "Question 3:"
  const questionStartRegex = /^\s*(?:Q(?:uestion)?\s*)?(\d+)\s*[.:)]\s+(.+)/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(questionStartRegex);
    
    if (match) {
      if (currentQuestion) {
        questions.push(currentQuestion.trim());
      }
      currentQuestion = line;
    } else if (currentQuestion !== '') {
      // Append details like sub-questions or bullet points
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || trimmed.startsWith('---') || trimmed.startsWith('__')) {
        questions.push(currentQuestion.trim());
        currentQuestion = '';
      } else {
        currentQuestion += '\n' + line;
      }
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion.trim());
  }
  
  return questions;
};

export const AnswerForm: React.FC<AnswerFormProps> = ({ questionPaper, onSubmit, loading }) => {
  const parsedQuestions = useMemo(() => parseQuestions(questionPaper), [questionPaper]);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (parsedQuestions.length > 0) {
      setAnswers(Array(parsedQuestions.length).fill(''));
    } else {
      setAnswers(['', '', '', '', '']); // Default fallback slots
    }
  }, [parsedQuestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers.map(answer => answer.trim()));
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const addAnswer = () => {
    setAnswers([...answers, '']);
  };

  const removeSpecificAnswer = (indexToRemove: number) => {
    if (answers.length > 1) {
      setAnswers(answers.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const hasQuestions = parsedQuestions.length > 0;

  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden bg-white/5">
      {/* Ambient glass flare */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-pink-400" />
        <span>Submit Your Answers</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {answers.map((answer, index) => {
            const hasParsed = parsedQuestions.length > index;
            const questionText = hasParsed ? parsedQuestions[index] : `Question ${index + 1}`;
            
            return (
              <div 
                key={index} 
                className="space-y-3 p-4.5 rounded-xl bg-white/5 border border-white/5 relative group hover:border-indigo-500/20 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {hasParsed ? `Question ${index + 1}` : `Answer Box ${index + 1}`}
                  </label>
                  {!hasParsed && answers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecificAnswer(index)}
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-all"
                      title="Remove this answer slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {hasParsed && (
                  <div className="text-xs text-slate-300 bg-black/30 px-3.5 py-2.5 rounded-lg border border-white/5 max-h-44 overflow-y-auto leading-relaxed whitespace-pre-wrap font-sans">
                    {questionText}
                  </div>
                )}

                <textarea
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-[#0B0F19] text-sm transition-all duration-300"
                  rows={hasParsed ? 3 : 4}
                  placeholder={hasParsed ? `Draft your solution for Question ${index + 1}...` : `Enter your answer for question ${index + 1}...`}
                />
              </div>
            );
          })}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          {!hasQuestions && (
            <button
              type="button"
              onClick={addAnswer}
              className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Answer Slot</span>
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || answers.every(a => a.trim() === '')}
            className="flex-1 py-3.5 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Submitting & Grading...' : 'Submit Answers for AI Evaluation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnswerForm;
