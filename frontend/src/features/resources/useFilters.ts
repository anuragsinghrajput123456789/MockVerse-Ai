import { useState, useMemo } from 'react';
import { Resource, ResourceSheet } from '../../shared/types';

export function useFilters(activeSheet: ResourceSheet | null) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterChapter, setFilterChapter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');

  const processedResources = useMemo(() => {
    if (!activeSheet || !activeSheet.resources) return [];

    let list = [...activeSheet.resources];

    // Search query (Title, Description, Subject, Chapter, Tags)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.subject && r.subject.toLowerCase().includes(q)) ||
        (r.chapter && r.chapter.toLowerCase().includes(q)) ||
        (r.tags && r.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Type Filter
    if (filterType !== 'All') {
      list = list.filter(r => r.type === filterType);
    }

    // Difficulty Filter
    if (filterDifficulty !== 'All') {
      list = list.filter(r => r.difficulty === filterDifficulty);
    }

    // Subject Filter
    if (filterSubject !== 'All') {
      list = list.filter(r => r.subject === filterSubject);
    }

    // Chapter Filter
    if (filterChapter !== 'All') {
      list = list.filter(r => r.chapter === filterChapter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'subject') {
        return (a.subject || '').localeCompare(b.subject || '');
      }
      if (sortBy === 'chapter') {
        return (a.chapter || '').localeCompare(b.chapter || '');
      }
      if (sortBy === 'difficulty') {
        const diffMap = { Beginner: 1, Intermediate: 2, Advanced: 3 };
        return (diffMap[a.difficulty] || 0) - (diffMap[b.difficulty] || 0);
      }
      if (sortBy === 'type') {
        return a.type.localeCompare(b.type);
      }
      if (sortBy === 'tags') {
        return (a.tags?.[0] || '').localeCompare(b.tags?.[0] || '');
      }
      return 0;
    });

    return list;
  }, [activeSheet, searchTerm, filterType, filterDifficulty, filterSubject, filterChapter, sortBy]);

  // Unique list generators for filter dropdowns
  const uniqueTypes = useMemo(() => {
    if (!activeSheet || !activeSheet.resources) return [];
    return Array.from(new Set(activeSheet.resources.map(r => r.type).filter(Boolean)));
  }, [activeSheet]);

  const uniqueSubjects = useMemo(() => {
    if (!activeSheet || !activeSheet.resources) return [];
    return Array.from(new Set(activeSheet.resources.map(r => r.subject).filter(Boolean)));
  }, [activeSheet]);

  const uniqueChapters = useMemo(() => {
    if (!activeSheet || !activeSheet.resources) return [];
    return Array.from(new Set(activeSheet.resources.map(r => r.chapter).filter(Boolean)));
  }, [activeSheet]);

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterDifficulty,
    setFilterDifficulty,
    filterSubject,
    setFilterSubject,
    filterChapter,
    setFilterChapter,
    sortBy,
    setSortBy,
    processedResources,
    uniqueTypes,
    uniqueSubjects,
    uniqueChapters
  };
}

export default useFilters;
