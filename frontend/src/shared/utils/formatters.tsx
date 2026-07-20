import React from 'react';
import { 
  Youtube, 
  FileText, 
  BookOpen, 
  Paperclip, 
  Github, 
  GraduationCap, 
  Globe, 
  Book, 
  FileSignature, 
  Zap, 
  Target, 
  Search, 
  BookMarked 
} from "lucide-react";
import { Resource } from '../types';

/**
 * Splits a comma-separated tags string into a cleaned array.
 */
export const parseTagsString = (tagsStr: string): string[] => {
  return tagsStr
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '');
};

/**
 * Resolves resource type categories to specific Lucide icons.
 */
export const getTypeIcon = (type: Resource['type']) => {
  switch (type) {
    case 'YouTube Video':
    case 'Video Lecture':
    case 'Video': 
      return <Youtube className="w-4 h-4 text-red-400" />;
    case 'Blog Article':
    case 'Article/Blog':
    case 'Blog':
    case 'Article': 
      return <FileText className="w-4 h-4 text-purple-400" />;
    case 'Documentation': return <BookOpen className="w-4 h-4 text-sky-400" />;
    case 'PDF':
    case 'Textbook/PDF': 
      return <Paperclip className="w-4 h-4 text-orange-400" />;
    case 'GitHub Repository': return <Github className="w-4 h-4 text-slate-300" />;
    case 'Course': return <GraduationCap className="w-4 h-4 text-indigo-400" />;
    case 'Website': return <Globe className="w-4 h-4 text-emerald-400" />;
    case 'Book': return <Book className="w-4 h-4 text-amber-400" />;
    case 'Notes': return <FileSignature className="w-4 h-4 text-teal-400" />;
    case 'Cheat Sheet': return <Zap className="w-4 h-4 text-yellow-400" />;
    case 'Practice Platform': return <Target className="w-4 h-4 text-pink-400" />;
    case 'Research Paper': return <Search className="w-4 h-4 text-cyan-400" />;
    default: return <BookMarked className="w-4 h-4 text-blue-400" />;
  }
};

/**
 * Maps resource types to Tailwind style classes for backgrounds, borders, and text colors.
 */
export const getTypeColor = (type: Resource['type']): string => {
  switch (type) {
    case 'YouTube Video':
    case 'Video Lecture':
    case 'Video': 
      return 'bg-red-500/10 border-red-500/20 text-red-400';
    case 'Blog Article':
    case 'Article/Blog':
    case 'Blog':
    case 'Article': 
      return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    case 'Documentation': return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
    case 'PDF':
    case 'Textbook/PDF': 
      return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    case 'GitHub Repository': return 'bg-slate-500/10 border-slate-500/20 text-slate-300';
    case 'Course': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
    case 'Website': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'Book': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'Notes': return 'bg-teal-500/10 border-teal-500/20 text-teal-400';
    case 'Cheat Sheet': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
    case 'Practice Platform': return 'bg-pink-500/10 border-pink-500/20 text-pink-400';
    case 'Research Paper': return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    default: return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
  }
};

/**
 * Maps difficulties to Tailwind color badge classes.
 */
export const getDifficultyColor = (difficulty: Resource['difficulty']): string => {
  switch (difficulty) {
    case 'Beginner': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'Intermediate': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'Advanced': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    default: return 'bg-slate-500/10 border-white/5 text-slate-400';
  }
};
