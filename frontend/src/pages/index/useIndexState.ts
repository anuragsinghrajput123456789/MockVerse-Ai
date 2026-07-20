import { useState, useCallback } from 'react';
import { QuestionPaper } from '../../shared/types';
import { useQuestionPaper } from '../../features/papers/useQuestionPaper';
import { usePaperHistory } from '../../features/history/usePaperHistory';
import { useGeneratePaper } from '../../features/papers/useGeneratePaper';
import { useSolutions } from '../../features/papers/useSolutions';
import { useEvaluation } from '../../features/papers/useEvaluation';
import { useProfile } from '../../features/profile/useProfile';

export function useIndexState() {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // 1. Profile Hook (handles authentication, settings preferences, API key, quota alerts)
  const {
    user,
    logout,
    apiKeyInput,
    setApiKeyInput,
    apiKeyMasked,
    hasStoredApiKey,
    apiKeyLoading,
    showApiKeyInput,
    setShowApiKeyInput,
    showQuotaModal,
    setShowQuotaModal,
    quotaModalMessage,
    quotaModalKeyInput,
    setQuotaModalKeyInput,
    handleQuotaError,
    handleQuotaModalSave,
    handleSaveApiKey,
    handleDeleteApiKey,
    handleSaveSettings
  } = useProfile();

  // 2. Question Paper Hook (manages active paper, solutions, evaluation states)
  const {
    currentPaper,
    setCurrentPaper,
    solutions,
    setSolutions,
    evaluationResult,
    setEvaluationResult,
    clearPaperState,
    selectPaper
  } = useQuestionPaper();

  // 3. Paper History Hook (manages history operations)
  const onHistorySelect = useCallback((paper: QuestionPaper) => {
    selectPaper(paper);
    setActiveTab('answer');
  }, [selectPaper]);

  const {
    paperHistory,
    setPaperHistory,
    handleSelectPaper,
    handleDeletePaper
  } = usePaperHistory(user, onHistorySelect, clearPaperState, setLoading);

  // 4. Generate Paper Hook
  const onGenerateSuccess = useCallback((newPaper: QuestionPaper) => {
    selectPaper(newPaper);
    setActiveTab('answer');
  }, [selectPaper]);

  const { handleGeneratePaper } = useGeneratePaper(
    user,
    setPaperHistory,
    onGenerateSuccess,
    setLoading,
    handleQuotaError
  );

  // 5. Solutions Hook
  const onSolutionsSuccess = useCallback((solContent: string) => {
    setSolutions(solContent);
  }, [setSolutions]);

  const { handleGenerateSolutions } = useSolutions(
    user,
    currentPaper,
    setCurrentPaper,
    setPaperHistory,
    onSolutionsSuccess,
    setLoading,
    handleQuotaError
  );

  // 6. Evaluation Hook
  const onEvaluationSuccess = useCallback((evalResult: string) => {
    setEvaluationResult(evalResult);
    setActiveTab('evaluate');
  }, [setEvaluationResult]);

  const { handleSubmitAnswers } = useEvaluation(
    user,
    currentPaper,
    setCurrentPaper,
    setPaperHistory,
    onEvaluationSuccess,
    setLoading,
    handleQuotaError
  );

  const toggleFaq = useCallback((index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  }, []);

  return {
    activeTab,
    setActiveTab,
    currentPaper,
    solutions,
    evaluationResult,
    loading,
    paperHistory,
    faqOpen,
    testimonialIndex,
    setTestimonialIndex,
    apiKeyInput,
    setApiKeyInput,
    apiKeyMasked,
    hasStoredApiKey,
    apiKeyLoading,
    showApiKeyInput,
    setShowApiKeyInput,
    showQuotaModal,
    setShowQuotaModal,
    quotaModalMessage,
    quotaModalKeyInput,
    setQuotaModalKeyInput,
    user,
    logout,
    handleQuotaModalSave,
    handleGeneratePaper,
    handleGenerateSolutions,
    handleSubmitAnswers,
    handleSaveApiKey,
    handleDeleteApiKey,
    handleSelectPaper,
    handleDeletePaper,
    toggleFaq,
    handleSaveSettings
  };
}

export default useIndexState;
