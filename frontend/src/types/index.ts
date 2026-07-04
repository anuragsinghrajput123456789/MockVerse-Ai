
export interface QuestionPaper {
  id: string;
  subject: string;
  class: string;
  totalMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Average' | 'Hard';
  board: string;
  chapters: string[];
  topics?: string;
  instructions?: string;
  pattern: string;
  questions: string;
  solutions?: string;
  evaluationResult?: string;
  createdAt: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface Answer {
  questionIndex: number;
  answer: string;
}

export interface EvaluationResult {
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  feedback: string;
  detailedFeedback: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'Course' | 'Book' | 'Blog' | 'Video' | 'PDF';
  link: string;
  description: string;
  createdAt: Date;
}

export interface PaperFormData {
  subject: string;
  class: string;
  totalMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Average' | 'Hard';
  board: string;
  chapters: string[];
  topics: string;
  instructions: string;
  pattern: string;
  customPatternDetails?: string;
}
