import { useState } from 'react';
import { Resource, ResourceSheet } from '../types/resource';
import { useToast } from '../../../shared/hooks/use-toast';
import { 
  addResourceToSheet, 
  updateResource, 
  deleteResource 
} from '../../../shared/services/resourceService';

export function useResources(
  activeSheet: ResourceSheet | null,
  fetchSheetDetails: (id: string) => Promise<void>
) {
  const { toast } = useToast();

  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showResourceForm, setShowResourceForm] = useState<boolean>(false);

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
      await fetchSheetDetails(sheetId);
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
      await fetchSheetDetails(activeSheet.id || (activeSheet as any)._id);
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
      await fetchSheetDetails(activeSheet.id || (activeSheet as any)._id);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Delete Failed",
        description: "Unable to remove resource.",
        variant: "destructive"
      });
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean, setActiveSheet: React.Dispatch<React.SetStateAction<ResourceSheet | null>>) => {
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
      await fetchSheetDetails(activeSheet.id || (activeSheet as any)._id);
    }
  };

  const handleToggleCompleted = async (id: string, isCompleted: boolean, setActiveSheet: React.Dispatch<React.SetStateAction<ResourceSheet | null>>) => {
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
      await fetchSheetDetails(activeSheet.id || (activeSheet as any)._id);
    }
  };

  const handleEditSelect = (resource: any) => {
    setEditingResource(resource);
    setShowResourceForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    editingResource,
    setEditingResource,
    showResourceForm,
    setShowResourceForm,
    handleAddResource,
    handleUpdateResource,
    handleDeleteResource,
    handleToggleFavorite,
    handleToggleCompleted,
    handleEditSelect
  };
}
