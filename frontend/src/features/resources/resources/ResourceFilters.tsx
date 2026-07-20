import React from 'react';
import { Search, SlidersHorizontal, X, Plus } from 'lucide-react';

interface ResourceFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  isSharedView: boolean;
  filterType: string;
  setFilterType: (val: string) => void;
  filterDifficulty: string;
  setFilterDifficulty: (val: string) => void;
  filterSubject: string;
  setFilterSubject: (val: string) => void;
  filterChapter: string;
  setFilterChapter: (val: string) => void;
  uniqueTypes: string[];
  uniqueSubjects: string[];
  uniqueChapters: string[];
  showResourceForm: boolean;
  setShowResourceForm: (val: boolean) => void;
  setEditingResource: (val: any) => void;
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  isSharedView,
  filterType,
  setFilterType,
  filterDifficulty,
  setFilterDifficulty,
  filterSubject,
  setFilterSubject,
  filterChapter,
  setFilterChapter,
  uniqueTypes,
  uniqueSubjects,
  uniqueChapters,
  showResourceForm,
  setShowResourceForm,
  setEditingResource
}) => {
  return (
    <div className="no-print p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Box */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Title, Desc, Subject, Chapter, Tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-white/10 bg-black/30 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Sorting and Add Resource buttons */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 flex-wrap">
          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-1.5 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="newest" className="bg-slate-900 text-white">Newest First</option>
              <option value="oldest" className="bg-slate-900 text-white">Oldest First</option>
              <option value="alphabetical" className="bg-slate-900 text-white">Alphabetical</option>
              <option value="subject" className="bg-slate-900 text-white">Subject</option>
              <option value="chapter" className="bg-slate-900 text-white">Chapter</option>
              <option value="difficulty" className="bg-slate-900 text-white">Difficulty</option>
              <option value="type" className="bg-slate-900 text-white">Resource Type</option>
              <option value="tags" className="bg-slate-900 text-white">Tags</option>
            </select>
          </div>

          {!isSharedView && (
            <button
              onClick={() => {
                setEditingResource(null);
                setShowResourceForm(!showResourceForm);
              }}
              className="h-10 px-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resource</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5">
        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Filters:</span>
        </span>

        {/* Resource Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-8.5 px-3 rounded-lg border border-white/5 bg-black/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="All">All Types</option>
          {uniqueTypes.map((t, idx) => (
            <option key={idx} value={t}>{t}</option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="h-8.5 px-3 rounded-lg border border-white/5 bg-black/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="All">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        {/* Subject Filter */}
        {uniqueSubjects.length > 0 && (
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="h-8.5 px-3 rounded-lg border border-white/5 bg-black/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="All">All Subjects</option>
            {uniqueSubjects.map((s, idx) => (
              <option key={idx} value={s}>{s}</option>
            ))}
          </select>
        )}

        {/* Chapter Filter */}
        {uniqueChapters.length > 0 && (
          <select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value)}
            className="h-8.5 px-3 rounded-lg border border-white/5 bg-black/40 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="All">All Chapters</option>
            {uniqueChapters.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Clear filters shortcut */}
        {(filterType !== 'All' || filterDifficulty !== 'All' || filterSubject !== 'All' || filterChapter !== 'All' || searchTerm) && (
          <button
            onClick={() => {
              setFilterType('All');
              setFilterDifficulty('All');
              setFilterSubject('All');
              setFilterChapter('All');
              setSearchTerm('');
            }}
            className="text-[10px] text-pink-400 hover:text-pink-300 font-bold transition flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ResourceFilters;
