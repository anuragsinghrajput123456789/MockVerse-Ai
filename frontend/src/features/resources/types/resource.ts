export interface Resource {
  id: string;
  _id?: string;
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
    | 'Other'
    | 'Video Lecture'
    | 'Article/Blog'
    | 'Textbook/PDF'
    | 'Blog';
  link: string;
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
  _id?: string;
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
