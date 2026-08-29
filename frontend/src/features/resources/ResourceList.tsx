import React, { useState } from 'react';
import { Resource } from '../../shared/types';
import { 
  Clock,
  Tag,
  Copy,
  ExternalLink,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  CheckSquare,
  Square,
  QrCode,
  Share2,
  Calendar,
  BookMarked as BookmarkIcon
} from "lucide-react";
import { useToast } from '../../shared/hooks/use-toast';
import { getTypeIcon, getTypeColor, getDifficultyColor } from '../../shared/utils/formatters';
import { downloadResourceQr as apiDownloadResourceQr } from '../../shared/services/resourceService';


interface ResourceListProps {
  resources: Resource[];
  onDelete?: (id: string) => void;
  onEdit?: (resource: Resource) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onToggleCompleted?: (id: string, isCompleted: boolean) => void;
  isReadOnly?: boolean;
}

const ResourceList: React.FC<ResourceListProps> = ({ 
  resources, 
  onDelete, 
  onEdit,
  onToggleFavorite,
  onToggleCompleted,
  isReadOnly = false
}) => {
  const { toast } = useToast();
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const toggleNotes = (id: string) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied!",
      description: "Resource link copied to clipboard.",
    });
  };

  const shareResource = (resource: Resource) => {
    const url = resource.url || resource.link;
    navigator.clipboard.writeText(url);
    toast({
      title: "Resource Shared!",
      description: `Copied direct link for "${resource.title}" to clipboard.`,
    });
  };

  const downloadResourceQr = async (resource: Resource) => {
    try {
      toast({
        title: "Generating QR...",
        description: "Retrieving individual resource QR code from server.",
      });
      const blob = await apiDownloadResourceQr(resource.id || (resource as any)._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "QR Code Downloaded",
        description: `QR code for "${resource.title}" downloaded successfully.`,
      });
    } catch (e) {
      toast({
        title: "Download Failed",
        description: "Unable to retrieve QR Code image.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfirm = (id: string) => {
    if (window.confirm("Are you sure you want to remove this learning resource from your study library?")) {
      if (onDelete) onDelete(id);
    }
  };


  if (resources.length === 0) {
    return (
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 text-center py-16 space-y-4">
        <BookmarkIcon className="w-12 h-12 text-slate-700 mx-auto opacity-40 animate-pulse" />
        <h3 className="text-lg font-bold text-white">No Resources Found</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          No learning materials found in this collection matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {resources.map((resource, index) => {
        const resourceId = resource.id || (resource as any)._id || `resource-${index}`;
        const isExpanded = !!expandedNotes[resourceId];
        const resourceUrl = resource.url || resource.link;
        const isFav = !!resource.isFavorite;
        const isComp = !!resource.isCompleted;
        const dateAddedStr = new Date(resource.createdAt || Date.now()).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        return (
          <div
            key={resourceId}
            className={`p-5 border rounded-2xl transition-all duration-300 flex flex-col justify-between relative group ${
              isComp 
                ? 'bg-slate-900/40 border-slate-800/50 opacity-60' 
                : 'bg-white/5 border-white/5 hover:bg-slate-800/10 hover:border-indigo-500/25 hover:scale-[1.01]'
            }`}
          >
            <div>
              {/* Top row: Category badge, Difficulty, Favorite & Completed states */}
              <div className="flex items-start justify-between mb-3.5 gap-2 no-print">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    {getTypeIcon(resource.type)}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border tracking-wider ${getDifficultyColor(resource.difficulty)}`}>
                    {resource.difficulty}
                  </span>

                  {/* Favorite Toggle */}
                  {!isReadOnly && onToggleFavorite && (
                    <button
                      onClick={() => onToggleFavorite(resourceId, !isFav)}
                      className={`p-1 rounded-lg border transition ${
                        isFav 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                      title={isFav ? "Remove from Favorites" : "Mark as Favorite"}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  )}

                  {/* Completed Checkbox */}
                  {!isReadOnly && onToggleCompleted && (
                    <button
                      onClick={() => onToggleCompleted(resourceId, !isComp)}
                      className={`p-1 rounded-lg border transition ${
                        isComp 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                      title={isComp ? "Mark as Incomplete" : "Mark as Completed"}
                    >
                      {isComp ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Title & Estimated Learning Time */}
              <div className="mb-2">
                <h3 className={`font-bold text-base leading-snug transition-all ${
                  isComp ? 'line-through text-slate-500' : 'text-white'
                }`}>
                  {resource.title}
                </h3>
                
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px] text-slate-400 font-medium">
                  {resource.estimatedTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{resource.estimatedTime}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Added: {dateAddedStr}</span>
                  </div>
                </div>
              </div>
              
              {/* Course Meta Info: Subject and Chapter Badges */}
              {(resource.subject || resource.chapter) && (
                <div className="flex flex-wrap gap-2 mb-3.5">
                  {resource.subject && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/5 border border-indigo-500/10 text-[9px] text-indigo-300 font-bold uppercase">
                      Sub: {resource.subject}
                    </span>
                  )}
                  {resource.chapter && (
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/5 border border-pink-500/10 text-[9px] text-pink-300 font-bold uppercase">
                      Ch: {resource.chapter}
                    </span>
                  )}
                </div>
              )}
              
              {/* Description */}
              <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">
                {resource.description}
              </p>

              {/* Tags list */}
              {Array.isArray(resource.tags) && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  <Tag className="w-3 h-3 text-slate-500 mt-1 shrink-0" />
                  {resource.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-slate-300 font-medium transition-colors hover:border-indigo-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Collapsible Study Notes */}
              {resource.notes && (
                <div className="mb-3.5">
                  <button
                    onClick={() => toggleNotes(resourceId)}
                    className="flex items-center space-x-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors no-print"
                  >
                    <span>{isExpanded ? 'Hide Study Notes' : 'Show Study Notes'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-2 p-3 rounded-xl bg-black/35 border border-white/5 text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-sans">
                      {resource.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Actions Footer */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2 text-xs font-semibold">
              <div className="flex items-center space-x-3">
                <a
                  href={resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => copyToClipboard(resourceUrl)}
                  className="inline-flex items-center space-x-1 text-slate-400 hover:text-white transition-colors no-print"
                  title="Copy direct resource URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Link</span>
                </button>
              </div>

              <div className="flex items-center space-x-1.5 no-print">
                {/* Individual Share Action */}
                <button
                  onClick={() => shareResource(resource)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all hover:scale-105"
                  title="Share Resource Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {/* Individual QR Download */}
                <button
                  onClick={() => downloadResourceQr(resource)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-pink-400 hover:border-pink-500/30 transition-all hover:scale-105"
                  title="Download Resource QR Code"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>

                {!isReadOnly && onDelete && onEdit && (
                  <>
                    {/* Edit Action */}
                    <button
                      onClick={() => onEdit(resource)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all hover:scale-105"
                      title="Modify Resource"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Action */}
                    <button
                      onClick={() => handleDeleteConfirm(resourceId)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all hover:scale-105"
                      title="Remove Resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResourceList;
