import { useState, useEffect, useCallback } from 'react';
import { QuestionPaper } from '../../shared/types';
import { useToast } from '../../shared/hooks/use-toast';
import { getPapers, deletePaper } from '../../shared/services/historyService';

export function usePaperHistory(
  user: any,
  onSelect: (paper: QuestionPaper) => void,
  onClearActive: () => void,
  setLoading: (loading: boolean) => void
) {
  const { toast } = useToast();
  const [paperHistory, setPaperHistory] = useState<QuestionPaper[]>([]);

  const fetchHistory = useCallback(async (isMounted = () => true) => {
    try {
      const history = await getPapers();
      if (isMounted()) {
        setPaperHistory(history);
      }
    } catch (error: any) {
      console.error('Error fetching paper history:', error);
    }
  }, []);

  // Load paper history from backend MongoDB or localStorage on mount
  useEffect(() => {
    let mounted = true;
    if (user) {
      fetchHistory(() => mounted);
    } else {
      // Guest user history from localStorage
      const guestHistoryStr = localStorage.getItem('mockverse_guest_papers');
      if (guestHistoryStr) {
        try {
          const parsed = JSON.parse(guestHistoryStr);
          if (Array.isArray(parsed)) {
            setPaperHistory(parsed.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) })));
          }
        } catch (e) {
          console.error('Error parsing guest papers:', e);
        }
      } else {
        setPaperHistory([]);
      }
    }
    return () => { mounted = false; };
  }, [user, fetchHistory]);

  const handleSelectPaper = useCallback((paper: QuestionPaper) => {
    onSelect(paper);
  }, [onSelect]);

  const handleDeletePaper = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this question paper from your history?")) {
      setLoading(true);
      try {
        await deletePaper(id);
        
        setPaperHistory(prev => {
          const updated = prev.filter(p => p.id !== id);
          if (!user) {
            localStorage.setItem('mockverse_guest_papers', JSON.stringify(updated));
          }
          return updated;
        });

        onClearActive();
        
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
      } finally {
        setLoading(false);
      }
    }
  }, [user, onClearActive, setLoading, toast]);

  return {
    paperHistory,
    setPaperHistory,
    fetchHistory,
    handleSelectPaper,
    handleDeletePaper
  };
}

export default usePaperHistory;
