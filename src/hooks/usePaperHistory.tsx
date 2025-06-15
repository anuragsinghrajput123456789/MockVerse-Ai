
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { QuestionPaper } from '../types';
import { Session } from '@supabase/supabase-js';

const fetchHistory = async (userId: string): Promise<QuestionPaper[]> => {
    const { data, error } = await supabase
      .from('question_papers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data) {
      const formattedPapers: QuestionPaper[] = data.map(p => ({
        id: p.id,
        subject: p.subject,
        class: p.class,
        totalMarks: p.total_marks,
        difficulty: p.difficulty as any,
        board: p.board,
        chapters: p.chapters,
        topics: p.topics || '',
        instructions: p.instructions || '',
        pattern: p.pattern,
        questions: p.questions,
        createdAt: new Date(p.created_at),
      }));
      return formattedPapers;
    }
    return [];
};


export const usePaperHistory = (session: Session | null) => {
  const userId = session?.user.id;
  return useQuery({
    queryKey: ['paperHistory', userId],
    queryFn: () => fetchHistory(userId!),
    enabled: !!userId,
  });
};
