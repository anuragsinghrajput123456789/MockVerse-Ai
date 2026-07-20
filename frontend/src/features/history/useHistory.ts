import { useCallback } from 'react';
import { QuestionPaper } from '../../shared/types';
import { useToast } from '../../shared/hooks/use-toast';
import { deletePaper } from '../../shared/services/historyService';

export function useHistory(
  user: any,
  paperHistory: QuestionPaper[],
  setPaperHistory: React.Dispatch<React.SetStateAction<QuestionPaper[]>>,
  onDeleteCurrentPaper?: () => void
) {
  const { toast } = useToast();

  const handleDeletePaper = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this question paper from your history?")) {
      try {
        if (user) {
          await deletePaper(id);
        } else {
          try {
            await deletePaper(id);
          } catch (err) {
            console.warn("Failed to delete paper from backend database, continuing locally", err);
          }
        }
        
        setPaperHistory(prev => {
          const updated = prev.filter(p => p.id !== id);
          if (!user) {
            localStorage.setItem('mockverse_guest_papers', JSON.stringify(updated));
          }
          return updated;
        });

        if (onDeleteCurrentPaper) {
          onDeleteCurrentPaper();
        }

        toast({
          title: "Question Paper Deleted",
          description: "Your paper has been removed successfully.",
        });
      } catch (error: any) {
        console.error('Error deleting paper:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete paper. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [user, setPaperHistory, onDeleteCurrentPaper, toast]);

  return {
    handleDeletePaper
  };
}

export default useHistory;
