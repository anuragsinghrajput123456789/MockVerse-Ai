import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, CheckSquare, Square, FilePlus } from 'lucide-react';
import BulkChapterModal from './components/BulkChapterModal';

interface ChapterSelectionProps {
  defaultChapters: string[];
  customChapters: string[];
  selectedChapters: string[];
  onChapterToggle: (chapter: string) => void;
  onRemoveCustomChapter: (chapter: string) => void;
  onAddCustomChapter: () => void;
  onBulkAddChapters?: (chapters: string[]) => void;
  onSelectAllChapters?: (chapters: string[]) => void;
  onClearAllChapters?: () => void;
  newChapter: string;
  setNewChapter: (value: string) => void;
}

const ChapterSelection: React.FC<ChapterSelectionProps> = ({
  defaultChapters,
  customChapters,
  selectedChapters,
  onChapterToggle,
  onRemoveCustomChapter,
  onAddCustomChapter,
  onBulkAddChapters,
  onSelectAllChapters,
  onClearAllChapters,
  newChapter,
  setNewChapter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const allAvailableChapters = useMemo(() => {
    return Array.from(new Set([...defaultChapters, ...customChapters]));
  }, [defaultChapters, customChapters]);

  const filteredDefaultChapters = useMemo(() => {
    if (!searchTerm.trim()) return defaultChapters;
    return defaultChapters.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase().trim()));
  }, [defaultChapters, searchTerm]);

  const filteredCustomChapters = useMemo(() => {
    if (!searchTerm.trim()) return customChapters;
    return customChapters.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase().trim()));
  }, [customChapters, searchTerm]);

  const handleSelectAll = () => {
    if (onSelectAllChapters) {
      onSelectAllChapters(allAvailableChapters);
    }
  };

  const handleClearAll = () => {
    if (onClearAllChapters) {
      onClearAllChapters();
    }
  };

  const handleBulkImport = (newChaptersList: string[]) => {
    if (onBulkAddChapters) {
      onBulkAddChapters(newChaptersList);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Bulk Import Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-xs transition-all"
            placeholder="Search chapters..."
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-indigo-300 font-semibold transition-all flex items-center space-x-1.5"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Bulk Add</span>
          </button>

          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white font-medium transition-all flex items-center space-x-1"
            title="Select all chapters"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Select All</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white font-medium transition-all flex items-center space-x-1"
            title="Clear all selected chapters"
          >
            <Square className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Add Single Custom Chapter */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Add Single Chapter
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newChapter}
            onChange={(e) => setNewChapter(e.target.value)}
            className="flex-1 h-11 px-4 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white/5 text-sm transition-all"
            placeholder="Enter chapter name"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddCustomChapter();
              }
            }}
          />
          <button
            type="button"
            onClick={onAddCustomChapter}
            className="px-5 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
      
      {/* Chapter Checkbox Selector Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Chapters * ({selectedChapters.length} Selected)
          </label>
        </div>

        <div className="space-y-4 max-h-60 overflow-y-auto p-4 border border-white/10 rounded-xl bg-slate-900/80 backdrop-blur-sm scrollbar-thin">
          {filteredDefaultChapters.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Default Chapters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredDefaultChapters.map((chapter) => (
                  <div key={chapter} className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2.5 cursor-pointer flex-1 p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-xs font-medium text-slate-200 group">
                      <input
                        type="checkbox"
                        checked={selectedChapters.includes(chapter)}
                        onChange={() => onChapterToggle(chapter)}
                        className="w-4 h-4 rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer shrink-0"
                      />
                      <span className="truncate group-hover:text-white transition-colors">{chapter}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredCustomChapters.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Custom Chapters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredCustomChapters.map((chapter) => (
                  <div key={chapter} className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2.5 cursor-pointer flex-1 p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-xs font-medium text-slate-200 group">
                      <input
                        type="checkbox"
                        checked={selectedChapters.includes(chapter)}
                        onChange={() => onChapterToggle(chapter)}
                        className="w-4 h-4 rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer shrink-0"
                      />
                      <span className="truncate group-hover:text-white transition-colors">{chapter}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onRemoveCustomChapter(chapter)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                      title="Remove custom chapter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allAvailableChapters.length === 0 && (
            <p className="text-slate-400 text-xs text-center py-6">
              Enter a subject above or click &quot;Bulk Add&quot; to build your chapter list.
            </p>
          )}

          {allAvailableChapters.length > 0 && filteredDefaultChapters.length === 0 && filteredCustomChapters.length === 0 && (
            <p className="text-slate-400 text-xs text-center py-6">
              No chapters match your search query &quot;{searchTerm}&quot;.
            </p>
          )}
        </div>
      </div>

      {/* Bulk Chapter Modal */}
      <BulkChapterModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onAddChapters={handleBulkImport}
      />
    </div>
  );
};

export default ChapterSelection;
