
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


export interface Resource {
  id: string;
  title: string;
  type: 
    | 'YouTube Video'
    | 'Blog Article'
    | 'Documentation'
    | 'PDF'
    | 'GitHub Repository'
    | 'Course'
    | 'Website'
    | 'Book'
    | 'Notes'
    | 'Cheat Sheet'
    | 'Practice Platform'
    | 'Research Paper'
    | 'Other';
  link: string; // kept for legacy compatibility
  url: string;
  description: string;
  notes?: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime?: string;
  subject?: string;
  chapter?: string;
  isFavorite?: boolean;
  isCompleted?: boolean;
  resourceSheet: string;
  createdAt: Date;
}

export interface ResourceSheet {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  chapter?: string;
  isPublic: boolean;
  user: string;
  resourceCount?: number;
  resources?: Resource[];
  createdAt: Date;
  updatedAt?: Date;
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
