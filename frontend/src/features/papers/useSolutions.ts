import { useCallback } from 'react';
import { useToast } from '../../shared/hooks/use-toast';
import { generateSolutions } from '../../shared/services/paperService';
import { QuestionPaper } from '../../shared/types';

export function useSolutions(
  user: any,
  currentPaper: QuestionPaper | null,
  setCurrentPaper: React.Dispatch<React.SetStateAction<QuestionPaper | null>>,
  setPaperHistory: React.Dispatch<React.SetStateAction<QuestionPaper[]>>,
  onSuccess: (solutions: string) => void,
  setLoading: (loading: boolean) => void,
  handleQuotaError: (error: any) => boolean
) {
  const { toast } = useToast();

  const handleGenerateSolutions = useCallback(async () => {
    if (!currentPaper) return;
    
    setLoading(true);
    try {
      const solutionContent = await generateSolutions(currentPaper.id);
      
      onSuccess(solutionContent);
      
      setCurrentPaper(prev => prev ? { ...prev, solutions: solutionContent } : null);
      
      setPaperHistory(prev => {
        const updated = prev.map(p => p.id === currentPaper.id ? { ...p, solutions: solutionContent } : p);
        if (!user) {
          localStorage.setItem('mockverse_guest_papers', JSON.stringify(updated));
        }
        return updated;
      });
      
      toast({
        title: "Solutions Generated!",
        description: "Solutions have been generated successfully.",
      });
    } catch (error: any) {
      console.error('Error generating solutions:', error);
      if (!handleQuotaError(error)) {
        toast({
          title: "Error",
          description: error.message || "Failed to generate solutions. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPaper, user, setPaperHistory, setCurrentPaper, onSuccess, setLoading, handleQuotaError, toast]);

  return {
    handleGenerateSolutions
  };
}

export default useSolutions;
