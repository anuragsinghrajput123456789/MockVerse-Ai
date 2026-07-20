import { useCallback } from 'react';
import { useToast } from '../../shared/hooks/use-toast';
import { evaluateAnswers } from '../../shared/services/paperService';
import { QuestionPaper } from '../../shared/types';

export function useEvaluation(
  user: any,
  currentPaper: QuestionPaper | null,
  setCurrentPaper: React.Dispatch<React.SetStateAction<QuestionPaper | null>>,
  setPaperHistory: React.Dispatch<React.SetStateAction<QuestionPaper[]>>,
  onSuccess: (result: string) => void,
  setLoading: (loading: boolean) => void,
  handleQuotaError: (error: any) => boolean
) {
  const { toast } = useToast();

  const handleSubmitAnswers = useCallback(async (answers: string[]) => {
    if (!currentPaper) return;
    
    setLoading(true);
    try {
      const result = await evaluateAnswers(currentPaper.id, answers);
      
      onSuccess(result);
      
      setCurrentPaper(prev => prev ? { ...prev, evaluationResult: result } : null);
      
      setPaperHistory(prev => {
        const updated = prev.map(p => p.id === currentPaper.id ? { ...p, evaluationResult: result } : p);
        if (!user) {
          localStorage.setItem('mockverse_guest_papers', JSON.stringify(updated));
        }
        return updated;
      });
      
      toast({
        title: "Answers Evaluated!",
        description: "Your answers have been evaluated successfully.",
      });
    } catch (error: any) {
      console.error('Error evaluating answers:', error);
      if (!handleQuotaError(error)) {
        toast({
          title: "Error",
          description: error.message || "Failed to evaluate answers. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPaper, user, setPaperHistory, setCurrentPaper, onSuccess, setLoading, handleQuotaError, toast]);

  return {
    handleSubmitAnswers
  };
}

export default useEvaluation;
