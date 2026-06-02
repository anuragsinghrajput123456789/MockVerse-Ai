import React from 'react';
import { Resource } from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Video, 
  Paperclip, 
  Trash2, 
  Edit3, 
  Share2, 
  Download, 
  ExternalLink,
  BookMarked
} from "lucide-react";

interface ResourceListProps {
  resources: Resource[];
  onDelete: (id: string) => void;
  onEdit: (resource: Resource) => void;
  onShare: (resource: Resource) => void;
  onExport: (resource: Resource) => void;
}

const ResourceList: React.FC<ResourceListProps> = ({ 
  resources, 
  onDelete, 
  onEdit, 
  onShare,
  onExport 
}) => {

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'Course': return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      case 'Book': return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'Blog': return <FileText className="w-4 h-4 text-purple-400" />;
      case 'Video': return <Video className="w-4 h-4 text-pink-400" />;
      case 'PDF': return <Paperclip className="w-4 h-4 text-orange-400" />;
      default: return <BookMarked className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTypeColor = (type: Resource['type']) => {
    switch (type) {
      case 'Course': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      case 'Book': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'Blog': return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'Video': return 'bg-pink-500/10 border-pink-500/20 text-pink-400';
      case 'PDF': return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
      default: return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

  if (resources.length === 0) {
    return (
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 text-center py-16 space-y-4">
        <BookMarked className="w-12 h-12 text-slate-700 mx-auto opacity-40 animate-pulse" />
        <h3 className="text-lg font-bold text-white">Study Library & Resources</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Your bookmarked syllabus materials and courses are currently empty. Populate items above to build your active learning index!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center space-x-2">
          <BookMarked className="w-5.5 h-5.5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">
            Study Resources <span className="text-slate-500 font-medium">({resources.length})</span>
          </h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="p-5 border border-white/5 rounded-2xl bg-white/5 hover:bg-slate-800/20 transition-all hover:border-indigo-500/20 duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3.5 gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    {getTypeIcon(resource.type)}
                  </div>
                  <h3 className="font-bold text-white text-sm line-clamp-1">{resource.title}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shrink-0 tracking-wider ${getTypeColor(resource.type)}`}>
                  {resource.type}
                </span>
              </div>
              
              {resource.description && (
                <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">
                  {resource.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-xs font-semibold">
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Syllabus Material</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center space-x-1.5">
                {/* Edit Action */}
                <button
                  onClick={() => onEdit(resource)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all hover:scale-105"
                  title="Modify Resource"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {/* Export Action */}
                <button
                  onClick={() => onExport(resource)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all hover:scale-105"
                  title="Download Interactive File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {/* Share Action */}
                <button
                  onClick={() => onShare(resource)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-pink-400 hover:border-pink-500/30 transition-all hover:scale-105"
                  title="Share Material"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Action */}
                <button
                  onClick={() => onDelete(resource.id)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all hover:scale-105"
                  title="Remove Resource"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;
