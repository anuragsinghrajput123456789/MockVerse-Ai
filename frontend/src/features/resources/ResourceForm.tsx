import React, { useState, useEffect } from 'react';
import { Resource } from '../../shared/types';
import { FilePlus, Edit3, X, Sparkles } from "lucide-react";
import { isValidUrl } from '../../shared/utils/validation';
import { parseTagsString } from '../../shared/utils/formatters';

interface ResourceFormProps {
  onAdd: (resource: Omit<Resource, 'id' | 'createdAt' | 'resourceSheet'>) => void;
  onUpdate?: (id: string, updatedData: Omit<Resource, 'id' | 'createdAt' | 'resourceSheet'>) => void;
  editingResource?: Resource | null;
  onCancelEdit?: () => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ 
  onAdd, 
  onUpdate, 
  editingResource, 
  onCancelEdit 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Course' as Resource['type'],
    link: '',
    description: '',
    notes: '',
    tags: '',
    difficulty: 'Beginner' as Resource['difficulty'],
    estimatedTime: '',
    subject: '',
    chapter: ''
  });

  const isEditing = !!editingResource;

  // Pre-fill form when entering edit mode
  useEffect(() => {
    if (editingResource) {
      setFormData({
        title: editingResource.title,
        type: editingResource.type,
        link: editingResource.url || editingResource.link,
        description: editingResource.description || '',
        notes: editingResource.notes || '',
        tags: Array.isArray(editingResource.tags) ? editingResource.tags.join(', ') : '',
        difficulty: editingResource.difficulty || 'Beginner',
        estimatedTime: editingResource.estimatedTime || '',
        subject: editingResource.subject || '',
        chapter: editingResource.chapter || ''
      });
    } else {
      setFormData({ 
        title: '', 
        type: 'Course', 
        link: '', 
        description: '',
        notes: '',
        tags: '',
        difficulty: 'Beginner',
        estimatedTime: '',
        subject: '',
        chapter: ''
      });
    }
  }, [editingResource]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.link) return;

    // Basic URL validation
    const cleanUrl = formData.link.trim();
    if (!isValidUrl(cleanUrl)) {
      alert('Please enter a valid HTTP/HTTPS URL.');
      return;
    }

    const tagsArray = parseTagsString(formData.tags);

    const submittedData = {
      title: formData.title.trim(),
      type: formData.type,
      link: cleanUrl,
      url: cleanUrl,
      description: formData.description.trim(),
      notes: formData.notes.trim(),
      tags: tagsArray,
      difficulty: formData.difficulty,
      estimatedTime: formData.estimatedTime.trim(),
      subject: formData.subject.trim(),
      chapter: formData.chapter.trim()
    };

    if (isEditing && editingResource && onUpdate) {
      onUpdate(editingResource.id, submittedData as any);
    } else {
      onAdd(submittedData as any);
    }
    
    setFormData({
      title: '',
      type: 'Course' as Resource['type'],
      link: '',
      description: '',
      notes: '',
      tags: '',
      difficulty: 'Beginner',
      estimatedTime: '',
      subject: '',
      chapter: ''
    });
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <div className="flex items-center space-x-2.5">
          {isEditing ? (
            <Edit3 className="w-5.5 h-5.5 text-pink-400" />
          ) : (
            <FilePlus className="w-5.5 h-5.5 text-indigo-400" />
          )}
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Modify Learning Resource' : 'Add Study Resource'}
          </h2>
        </div>
        
        {isEditing && onCancelEdit && (
          <button 
            type="button" 
            onClick={onCancelEdit}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-red-400 text-slate-400 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all duration-300"
              placeholder="e.g., AP Calculus Study Guide"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Resource Category
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Resource['type'] }))}
              className="w-full h-11 px-4 rounded-xl border border-white/10 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-slate-900 text-sm transition-all"
            >
              <option value="YouTube Video">🎥 YouTube Video</option>
              <option value="Blog Article">📝 Blog Article</option>
              <option value="Documentation">📖 Documentation</option>
              <option value="PDF">📄 PDF Sheet / Exam Set</option>
              <option value="GitHub Repository">💻 GitHub Repository</option>
              <option value="Course">🎓 Course / Tutorial</option>
              <option value="Website">🌐 Website</option>
              <option value="Book">📚 Book / E-Book</option>
              <option value="Notes">📝 Notes</option>
              <option value="Cheat Sheet">⚡ Cheat Sheet</option>
              <option value="Practice Platform">🎯 Practice Platform</option>
              <option value="Research Paper">🔬 Research Paper</option>
              <option value="Other">✨ Other</option>
            </select>
          </div>
        </div>
        
        {/* Row 2: Link & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Resource Link *
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all"
              placeholder="https://example.com/materials"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Difficulty Level
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as Resource['difficulty'] }))}
              className="w-full h-11 px-4 rounded-xl border border-white/10 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-slate-900 text-sm transition-all"
            >
              <option value="Beginner">🟢 Beginner</option>
              <option value="Intermediate">🟡 Intermediate</option>
              <option value="Advanced">🔴 Advanced</option>
            </select>
          </div>
        </div>

        {/* Row 3: Estimated Time & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Estimated Learning Time (Optional)
            </label>
            <input
              type="text"
              value={formData.estimatedTime}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all"
              placeholder="e.g., 2 hours, 45 mins"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all"
              placeholder="e.g., math, calculus, derivatives"
            />
          </div>
        </div>

        {/* Row 4: Subject & Chapter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Subject (Optional)
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all"
              placeholder="e.g., Mathematics, Computer Science"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Chapter (Optional)
            </label>
            <input
              type="text"
              value={formData.chapter}
              onChange={(e) => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all"
              placeholder="e.g., Chapter 3, Integration"
            />
          </div>
        </div>
        
        {/* Row 5: One-line Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            One Line Description *
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full h-11 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all"
            placeholder="e.g., Covers main concepts from Chapter 3 with solved problems."
            required
            maxLength={200}
          />
        </div>

        {/* Row 6: Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Study Notes & Instructions (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all"
            rows={4}
            placeholder="Detailed notes, chapters, key definitions, or formulas..."
          />
        </div>
        
        <button
          type="submit"
          className={`w-full py-3.5 px-6 font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01] flex items-center justify-center space-x-2 ${
            isEditing 
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-pink-500/10'
              : 'bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-indigo-500/10'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isEditing ? 'Commit Changes' : 'Publish Resource'}</span>
        </button>
      </form>
    </div>
  );
};

export default ResourceForm;
