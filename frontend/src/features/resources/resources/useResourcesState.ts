import { useState, useEffect, useCallback, useRef } from 'react';
import { Resource, ResourceSheet } from '../../../shared/types';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../../shared/hooks/use-toast';
import { 
  getResourceSheets, 
  getResourceSheetById, 
  createResourceSheet, 
  updateResourceSheet, 
  deleteResourceSheet,
  duplicateResourceSheet,
  addResourceToSheet,
  updateResource,
  deleteResource,
  getSheetQrCodeUrl
} from '../../../shared/services/resourceService';
import { useShare } from '../useShare';
import { usePDF } from '../usePDF';
import { useFilters } from '../useFilters';

export function useResourcesState() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Collections state
  const [sheets, setSheets] = useState<ResourceSheet[]>([]);
  const [activeSheet, setActiveSheet] = useState<ResourceSheet | null>(null);
  
  // Loading states
  const [loadingSheets, setLoadingSheets] = useState<boolean>(true);
  const [loadingResources, setLoadingResources] = useState<boolean>(false);

  // Ref to avoid circular dependency in fetchSheets callback
  const activeSheetIdRef = useRef<string | null>(null);

  // Shared view mode
  const [sharedSheetId, setSharedSheetId] = useState<string | null>(null);
  const [isSharedView, setIsSharedView] = useState<boolean>(false);

  // Resource Form States
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showResourceForm, setShowResourceForm] = useState<boolean>(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newSheetName, setNewSheetName] = useState<string>('');
  const [newSheetDesc, setNewSheetDesc] = useState<string>('');
  const [newSheetSubject, setNewSheetSubject] = useState<string>('');
  const [newSheetChapter, setNewSheetChapter] = useState<string>('');
  const [newSheetPublic, setNewSheetPublic] = useState<boolean>(false);

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [editingSheet, setEditingSheet] = useState<ResourceSheet | null>(null);

  // Integrate extracted custom hooks
  const {
    showShareModal,
    setShowShareModal,
    showQrModal,
    setShowQrModal,
    getShareLink,
    handleCopyShareLink
  } = useShare(activeSheet);

  const {
    handleExportPdf,
    handleExportHtml,
    handlePrintSheet
  } = usePDF(activeSheet);

  const {
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
  } = useFilters(activeSheet);

  // Fetch sheet items (with resources)
  const fetchSheetDetails = useCallback(async (id: string) => {
    try {
      setLoadingResources(true);
      const data = await getResourceSheetById(id);
      setActiveSheet(data);
      activeSheetIdRef.current = data?.id || (data as any)?._id || null;
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load collection items.",
        variant: "destructive"
      });
    } finally {
      setLoadingResources(false);
    }
  }, [toast]);

  // Fetch collections
  const fetchSheets = useCallback(async (selectId?: string) => {
    if (!user) return;
    try {
      setLoadingSheets(true);
      const data = await getResourceSheets();
      setSheets(data);
      if (data.length > 0) {
        let targetId = selectId;
        if (!targetId && activeSheetIdRef.current) {
          const exists = data.some(s => (s._id || s.id) === activeSheetIdRef.current);
          if (exists) {
            targetId = activeSheetIdRef.current;
          }
        }
        const matched = data.find(s => (s._id || s.id) === targetId) || data[0];
        await fetchSheetDetails(matched._id || matched.id);
      } else {
        setActiveSheet(null);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch study collections.",
        variant: "destructive"
      });
    } finally {
      setLoadingSheets(false);
    }
  }, [user, fetchSheetDetails, toast]);

  // Check URL params for share sheet ID on mount
  useEffect(() => {
    const checkUrlParams = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const shareId = queryParams.get('share_sheet');

      if (shareId) {
        setSharedSheetId(shareId);
        setIsSharedView(true);
        try {
          setLoadingSheets(true);
          const data = await getResourceSheetById(shareId);
          setActiveSheet(data);
        } catch (err: any) {
          console.error(err);
          toast({
            title: "Access Error",
            description: "Shared collection not found or access forbidden.",
            variant: "destructive"
          });
          setIsSharedView(false);
          setSharedSheetId(null);
        } finally {
          setLoadingSheets(false);
        }
      } else if (user) {
        setIsSharedView(false);
        try {
          setLoadingSheets(true);
          const data = await getResourceSheets();
          setSheets(data);
          if (data.length > 0) {
            await getResourceSheetById(data[0]._id || data[0].id)
              .then(resData => setActiveSheet(resData))
              .catch(() => {});
          } else {
            setActiveSheet(null);
          }
        } catch (err: any) {
          console.error(err);
        } finally {
          setLoadingSheets(false);
        }
      } else {
        setLoadingSheets(false);
      }
    };
    checkUrlParams();
  }, [user, toast]);

  // Migration from localStorage
  useEffect(() => {
    const migrateLocalResources = async () => {
      if (!user || isSharedView) return;
      const localData = localStorage.getItem('resources');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            toast({
              title: "Migrating resources...",
              description: "Saving browser storage materials to database...",
            });

            const defaultSheet = await createResourceSheet({
              name: 'My Migrated Resources',
              description: 'Learning materials imported from local browser storage.',
              isPublic: false,
              subject: 'General',
              chapter: 'Unsorted'
            } as any);

            const sheetId = defaultSheet._id || defaultSheet.id;

            for (const r of parsed) {
              const tagsArray = Array.isArray(r.tags) ? r.tags : [];
              await addResourceToSheet(sheetId, {
                title: r.title,
                type: r.type || 'Other',
                url: r.link || r.url || 'https://example.com',
                description: r.description || 'Migrated resource',
                notes: r.notes || '',
                tags: tagsArray,
                difficulty: r.difficulty || 'Beginner',
                estimatedTime: r.estimatedTime || '',
                subject: r.subject || '',
                chapter: r.chapter || ''
              });
            }

            localStorage.removeItem('resources');
            toast({
              title: "Migration Successful!",
              description: `Successfully synced ${parsed.length} resources to MongoDB.`,
            });
            fetchSheets(sheetId);
          }
        } catch (err) {
          console.error('Local resources migration failed:', err);
        }
      }
    };
    migrateLocalResources();
  }, [user, isSharedView, fetchSheets, toast]);

  // ─── Sheet Actions ──────────────────────────────────────────────────────────

  const handleCreateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName.trim()) return;

    try {
      const data = await createResourceSheet({
        name: newSheetName.trim(),
        description: newSheetDesc.trim(),
        subject: newSheetSubject.trim(),
        chapter: newSheetChapter.trim(),
        isPublic: newSheetPublic,
      } as any);

      toast({
        title: "Collection Created!",
        description: `"${data.name}" sheet has been added.`,
      });

      setNewSheetName('');
      setNewSheetDesc('');
      setNewSheetSubject('');
      setNewSheetChapter('');
      setNewSheetPublic(false);
      setShowCreateModal(false);
      
      fetchSheets(data._id || data.id);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Creation Failed",
        description: "Unable to create collection.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSheet || !editingSheet.name.trim()) return;

    try {
      const id = editingSheet.id || (editingSheet as any)._id;
      await updateResourceSheet(id, {
        name: editingSheet.name.trim(),
        description: editingSheet.description,
        subject: editingSheet.subject,
        chapter: editingSheet.chapter,
        isPublic: editingSheet.isPublic,
      });

      toast({
        title: "Collection Updated!",
        description: "Study sheet changes saved successfully.",
      });

      setShowSettingsModal(false);
      fetchSheets(id);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Update Failed",
        description: "Unable to save changes.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSheet = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this collection and all its resources? This action is irreversible.")) return;

    try {
      await deleteResourceSheet(id);
      toast({
        title: "Collection Removed",
        description: "Study collection has been deleted.",
      });
      setShowSettingsModal(false);
      if (activeSheet && ((activeSheet.id || (activeSheet as any)._id) === id)) {
        setActiveSheet(null);
      }
      fetchSheets();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Delete Failed",
        description: "Unable to remove collection.",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateSheet = async () => {
    if (!activeSheet) return;
    const sheetId = activeSheet.id || (activeSheet as any)._id;

    try {
      setLoadingSheets(true);
      const data = await duplicateResourceSheet(sheetId);
      toast({
        title: "Collection Cloned!",
        description: `Created copy: "${data.name}"`,
      });
      fetchSheets(data._id || data.id);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Duplication Failed",
        description: "Unable to duplicate this study collection.",
        variant: "destructive"
      });
      setLoadingSheets(false);
    }
  };

  // ─── Resource Actions ───────────────────────────────────────────────────────

  const handleAddResource = async (resourceData: any) => {
    if (!activeSheet) return;
    const sheetId = activeSheet.id || (activeSheet as any)._id;
    try {
      await addResourceToSheet(sheetId, resourceData);
      toast({
        title: "Resource Added!",
        description: "Study resource added to this collection.",
      });
      setShowResourceForm(false);
      fetchSheetDetails(sheetId);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to Add",
        description: err.message || "Failed to add resource to collection.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateResource = async (id: string, updatedData: any) => {
    if (!activeSheet) return;
    try {
      await updateResource(id, updatedData);
      toast({
        title: "Resource Updated!",
        description: "Saved resource changes successfully.",
      });
      setEditingResource(null);
      setShowResourceForm(false);
      fetchSheetDetails(activeSheet.id || (activeSheet as any)._id);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to save resource details.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!activeSheet) return;
    try {
      await deleteResource(id);
      toast({
        title: "Resource Removed",
        description: "Study resource has been removed.",
      });
      fetchSheetDetails(activeSheet.id || (activeSheet as any)._id);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Delete Failed",
        description: "Unable to remove resource.",
        variant: "destructive"
      });
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    if (!activeSheet) return;
    try {
      // Optimistic Update
      setActiveSheet(prev => {
        if (!prev || !prev.resources) return prev;
        return {
          ...prev,
          resources: prev.resources.map(r => r.id === id ? { ...r, isFavorite } : r)
        };
      });

      await updateResource(id, { isFavorite });
      toast({
        title: isFavorite ? "Added to Favorites" : "Removed from Favorites",
        description: "Updated status successfully.",
      });
    } catch (err) {
      console.error(err);
      fetchSheetDetails(activeSheet.id || (activeSheet as any)._id);
    }
  };

  const handleToggleCompleted = async (id: string, isCompleted: boolean) => {
    if (!activeSheet) return;
    try {
      // Optimistic Update
      setActiveSheet(prev => {
        if (!prev || !prev.resources) return prev;
        return {
          ...prev,
          resources: prev.resources.map(r => r.id === id ? { ...r, isCompleted } : r)
        };
      });

      await updateResource(id, { isCompleted });
      toast({
        title: isCompleted ? "Completed!" : "Incomplete",
        description: "Resource status updated successfully.",
      });
    } catch (err) {
      console.error(err);
      fetchSheetDetails(activeSheet.id || (activeSheet as any)._id);
    }
  };

  // QR Code endpoint
  const qrCodeUrl = activeSheet 
    ? getSheetQrCodeUrl(activeSheet.id || (activeSheet as any)._id) 
    : '';

  const handleEditSelect = (resource: Resource) => {
    setEditingResource(resource);
    setShowResourceForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    user,
    sheets,
    activeSheet,
    loadingSheets,
    loadingResources,
    sharedSheetId,
    isSharedView,
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
    editingResource,
    setEditingResource,
    showResourceForm,
    setShowResourceForm,
    showCreateModal,
    setShowCreateModal,
    newSheetName,
    setNewSheetName,
    newSheetDesc,
    setNewSheetDesc,
    newSheetSubject,
    setNewSheetSubject,
    newSheetChapter,
    setNewSheetChapter,
    newSheetPublic,
    setNewSheetPublic,
    showSettingsModal,
    setShowSettingsModal,
    editingSheet,
    setEditingSheet,
    showShareModal,
    setShowShareModal,
    showQrModal,
    setShowQrModal,
    fetchSheets,
    fetchSheetDetails,
    handleCreateSheet,
    handleUpdateSheet,
    handleDeleteSheet,
    handleDuplicateSheet,
    handleAddResource,
    handleUpdateResource,
    handleDeleteResource,
    handleToggleFavorite,
    handleToggleCompleted,
    getShareLink,
    handleCopyShareLink,
    handleExportPdf,
    handleExportHtml,
    handlePrintSheet,
    processedResources,
    uniqueTypes,
    uniqueSubjects,
    uniqueChapters,
    qrCodeUrl,
    handleEditSelect,
    setIsSharedView,
    setSharedSheetId
  };
}
