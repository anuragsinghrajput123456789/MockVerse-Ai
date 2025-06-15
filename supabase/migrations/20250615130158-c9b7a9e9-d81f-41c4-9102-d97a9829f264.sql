
-- Create a table for question papers
CREATE TABLE public.question_papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  class TEXT NOT NULL,
  total_marks INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  board TEXT NOT NULL,
  chapters TEXT[] NOT NULL,
  topics TEXT,
  instructions TEXT,
  pattern TEXT NOT NULL,
  questions TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for the table
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to view their own question papers
CREATE POLICY "Users can view their own question papers"
  ON public.question_papers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a policy to allow users to create their own question papers
CREATE POLICY "Users can create their own question papers"
  ON public.question_papers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a policy to allow users to delete their own question papers
CREATE POLICY "Users can delete their own question papers"
  ON public.question_papers
  FOR DELETE
  USING (auth.uid() = user_id);
