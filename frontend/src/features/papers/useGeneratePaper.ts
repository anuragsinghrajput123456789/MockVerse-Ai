import { useCallback } from 'react';
import { useToast } from '../../shared/hooks/use-toast';
import { generateQuestionPaper } from '../../shared/services/paperService';
import { QuestionPaper, PaperFormData } from '../../shared/types';

export function useGeneratePaper(
  user: any,
  setPaperHistory: React.Dispatch<React.SetStateAction<QuestionPaper[]>>,
  onSuccess: (paper: QuestionPaper) => void,
  setLoading: (loading: boolean) => void,
  handleQuotaError: (error: any) => boolean
) {
  const { toast } = useToast();

  const handleGeneratePaper = useCallback(async (formData: PaperFormData) => {
    setLoading(true);
    try {
      const newPaper = await generateQuestionPaper(formData);
      
      onSuccess(newPaper);
      
      setPaperHistory(prev => {
        const updated = [newPaper, ...prev];
        if (!user) {
          localStorage.setItem('mockverse_guest_papers', JSON.stringify(updated));
        }
        return updated;
      });
      
      toast({
        title: "Question Paper Generated!",
        description: "Your paper has been generated successfully.",
      });
    } catch (error: any) {
      console.error('Error generating paper:', error);
      if (!handleQuotaError(error)) {
        toast({
          title: "Error",
          description: error.message || "Failed to generate paper. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, setPaperHistory, onSuccess, setLoading, handleQuotaError, toast]);

  return {
    handleGeneratePaper
  };
}

export default useGeneratePaper;
