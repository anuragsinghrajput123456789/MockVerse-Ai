import React, { useState, useEffect } from 'react';
import { Resource } from '../types';
import { FilePlus, Edit3, X, Sparkles } from "lucide-react";

interface ResourceFormProps {
  onAdd: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
  onUpdate?: (id: string, updatedData: Omit<Resource, 'id' | 'createdAt'>) => void;
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
    description: ''
  });

  const isEditing = !!editingResource;

  // Pre-fill form when entering edit mode
  useEffect(() => {
    if (editingResource) {
      setFormData({
        title: editingResource.title,
        type: editingResource.type,
        link: editingResource.link,
        description: editingResource.description || ''
      });
    } else {
      setFormData({ title: '', type: 'Course', link: '', description: '' });
    }
  }, [editingResource]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.link) return;

    if (isEditing && editingResource && onUpdate) {
      onUpdate(editingResource.id, formData);
    } else {
      onAdd(formData);
    }
    
    setFormData({ title: '', type: 'Course', link: '', description: '' });
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
              <option value="Course">🎓 Course / Tutorials</option>
              <option value="Book">📚 Textbook / E-Book</option>
              <option value="Blog">📝 Editorial / Blog Post</option>
              <option value="Video">🎥 Video Guide / Playlist</option>
              <option value="PDF">📄 PDF Sheet / Exam Set</option>
            </select>
          </div>
        </div>
        
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
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all"
            rows={3}
            placeholder="Brief details about the syllabus covered, topics, or book authors..."
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
