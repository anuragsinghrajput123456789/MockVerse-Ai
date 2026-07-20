import { useState, useEffect, useCallback } from 'react';
import { ResourceSheet } from '../types/resource';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../../shared/hooks/use-toast';
import { 
  getResourceSheets, 
  getResourceSheetById, 
  createResourceSheet, 
  updateResourceSheet, 
  deleteResourceSheet,
  duplicateResourceSheet
} from '../../../shared/services/resourceService';

export function useResourceSheets() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [sheets, setSheets] = useState<ResourceSheet[]>([]);
  const [activeSheet, setActiveSheet] = useState<ResourceSheet | null>(null);
  const [loadingSheets, setLoadingSheets] = useState<boolean>(true);
  const [loadingResources, setLoadingResources] = useState<boolean>(false);
  const [sharedSheetId, setSharedSheetId] = useState<string | null>(null);
  const [isSharedView, setIsSharedView] = useState<boolean>(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newSheetName, setNewSheetName] = useState<string>('');
  const [newSheetDesc, setNewSheetDesc] = useState<string>('');
  const [newSheetSubject, setNewSheetSubject] = useState<string>('');
  const [newSheetChapter, setNewSheetChapter] = useState<string>('');
  const [newSheetPublic, setNewSheetPublic] = useState<boolean>(false);

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [editingSheet, setEditingSheet] = useState<ResourceSheet | null>(null);

  const fetchSheetDetails = useCallback(async (id: string) => {
    try {
      setLoadingResources(true);
      const data = await getResourceSheetById(id);
      setActiveSheet(data);
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

  const fetchSheets = useCallback(async (selectId?: string) => {
    if (!user) return;
    try {
      setLoadingSheets(true);
      const data = await getResourceSheets();
      setSheets(data);
      if (data.length > 0) {
        if (selectId) {
          const matched = data.find(s => s._id === selectId || s.id === selectId);
          if (matched) {
            await fetchSheetDetails(matched._id || matched.id);
          } else {
            await fetchSheetDetails(data[0]._id || data[0].id);
          }
        } else if (!activeSheet) {
          await fetchSheetDetails(data[0]._id || data[0].id);
        } else {
          const currentId = activeSheet.id || (activeSheet as any)._id;
          await fetchSheetDetails(currentId);
        }
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
  }, [user, activeSheet, fetchSheetDetails, toast]);

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

  return {
    user,
    sheets,
    setSheets,
    activeSheet,
    setActiveSheet,
    loadingSheets,
    setLoadingSheets,
    loadingResources,
    setLoadingResources,
    sharedSheetId,
    setSharedSheetId,
    isSharedView,
    setIsSharedView,
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
    fetchSheetDetails,
    fetchSheets,
    handleCreateSheet,
    handleUpdateSheet,
    handleDeleteSheet,
    handleDuplicateSheet
  };
}
