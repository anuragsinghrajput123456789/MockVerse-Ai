
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateQuestionPaper, generateSolutions, evaluateAnswers } from '../services/geminiService';
import { supabase } from '../integrations/supabase/client';
import { PaperFormData, QuestionPaper } from '../types';
import { Session } from '@supabase/supabase-js';

export const usePaperActions = (session: Session | null) => {
    const queryClient = useQueryClient();

    const generatePaperMutation = useMutation({
        mutationFn: async (formData: PaperFormData) => {
            if (!session) throw new Error("Authentication Required");
            const content = await generateQuestionPaper(formData);
            
            const newPaperDataForDb = {
                user_id: session.user.id,
                subject: formData.subject,
                class: formData.class,
                total_marks: formData.totalMarks,
                difficulty: formData.difficulty,
                board: formData.board,
                chapters: formData.chapters,
                topics: formData.topics,
                instructions: formData.instructions,
                pattern: formData.pattern,
                questions: content,
            };

            const { data: savedPaper, error: insertError } = await supabase
                .from('question_papers')
                .insert(newPaperDataForDb)
                .select()
                .single();
            
            if (insertError) throw insertError;

            const paper: QuestionPaper = {
                id: savedPaper.id,
                subject: savedPaper.subject,
                class: savedPaper.class,
                totalMarks: savedPaper.total_marks,
                difficulty: savedPaper.difficulty as any,
                board: savedPaper.board,
                chapters: savedPaper.chapters,
                topics: savedPaper.topics || '',
                instructions: savedPaper.instructions || '',
                pattern: savedPaper.pattern,
                questions: savedPaper.questions,
                createdAt: new Date(savedPaper.created_at),
            };
            return paper;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paperHistory', session?.user.id] });
        }
    });

    const generateSolutionsMutation = useMutation({
        mutationFn: (questions: string) => generateSolutions(questions),
    });

    const evaluateAnswersMutation = useMutation({
        mutationFn: ({ questions, answers }: { questions: string; answers: string[] }) => evaluateAnswers(questions, answers),
    });

    return { generatePaperMutation, generateSolutionsMutation, evaluateAnswersMutation };
}
