import React from 'react';
import { 
  BookOpen, 
  Zap, 
  Award, 
  Sparkles, 
  Flame, 
  GraduationCap, 
  Building2, 
  Cpu, 
  Database, 
  Code, 
  Brain, 
  PlusCircle, 
  Layers,
  FileCheck,
  Globe
} from 'lucide-react';
import { PaperFormData } from '../../../shared/types';

export interface ExamPreset {
  id: string;
  name: string;
  category: 'School' | 'Competitive' | 'College' | 'Custom';
  description: string;
  iconName: string;
  badge?: string;
  data: Partial<PaperFormData>;
}

export const EXAM_PRESETS: ExamPreset[] = [
  // ─── SCHOOL PRESETS ────────────────────────────────────────────────────────
  {
    id: 'cbse-unit-test',
    name: 'CBSE Unit Test',
    category: 'School',
    description: 'Unit Test Pattern',
    iconName: 'Zap',
    badge: '25 Marks',
    data: {
      board: 'CBSE',
      class: '10',
      subject: 'Mathematics',
      totalMarks: 25,
      difficulty: 'Easy',
      pattern: 'Board-style',
      chapters: ['Algebra', 'Geometry'],
      instructions: 'Focus on 1 & 2 mark foundational questions.'
    }
  },
  {
    id: 'cbse-half-yearly',
    name: 'CBSE Half Yearly',
    category: 'School',
    description: 'Mid-Session Exam',
    iconName: 'BookOpen',
    badge: '50 Marks',
    data: {
      board: 'CBSE',
      class: '10',
      subject: 'Science',
      totalMarks: 50,
      difficulty: 'Medium',
      pattern: 'Board-style',
      chapters: ['Chemical Bonding', 'Laws of Motion', 'Cell Structure and Function'],
      instructions: 'Balanced section layout with short and numerical questions.'
    }
  },
  {
    id: 'cbse-final-exam',
    name: 'CBSE Final Exam',
    category: 'School',
    description: 'Full Board Pattern',
    iconName: 'Award',
    badge: '80 Marks',
    data: {
      board: 'CBSE',
      class: '12',
      subject: 'Physics',
      totalMarks: 80,
      difficulty: 'Medium',
      pattern: 'Board-style',
      chapters: ['Electrostatics & Current', 'Optics & Wave Motion', 'Thermodynamics'],
      instructions: 'Standard CBSE Class 12 paper with MCQs, Short Answers, and Long Cases.'
    }
  },
  {
    id: 'icse-board',
    name: 'ICSE Board',
    category: 'School',
    description: 'CISCE Curriculum',
    iconName: 'FileCheck',
    badge: '80 Marks',
    data: {
      board: 'ICSE',
      class: '10',
      subject: 'Mathematics',
      totalMarks: 80,
      difficulty: 'Medium',
      pattern: 'Board-style',
      chapters: ['Algebra', 'Geometry', 'Trigonometry'],
      instructions: 'Construct paper strictly following ICSE evaluation criteria.'
    }
  },
  {
    id: 'state-board',
    name: 'State Board',
    category: 'School',
    description: 'State Syllabus',
    iconName: 'Globe',
    badge: '100 Marks',
    data: {
      board: 'State Board',
      class: '10',
      subject: 'Social Science',
      totalMarks: 100,
      difficulty: 'Average',
      pattern: 'Local',
      chapters: ['Modern History & Freedom Struggle', 'Indian Geography & Resources'],
      instructions: 'Include direct recall questions and state curriculum topics.'
    }
  },
  {
    id: 'class-10-science',
    name: 'Class 10 Science',
    category: 'School',
    description: 'Phy + Chem + Bio',
    iconName: 'Sparkles',
    badge: '80 Marks',
    data: {
      board: 'CBSE',
      class: '10',
      subject: 'Science',
      totalMarks: 80,
      difficulty: 'Medium',
      pattern: 'Board-style',
      chapters: ['Structure of Atom', 'Laws of Motion', 'Human Physiology'],
      instructions: 'Comprehensive 3-section science exam.'
    }
  },
  {
    id: 'class-12-physics',
    name: 'Class 12 Physics',
    category: 'School',
    description: 'Board Exam Pattern',
    iconName: 'Zap',
    badge: '70 Marks',
    data: {
      board: 'CBSE',
      class: '12',
      subject: 'Physics',
      totalMarks: 70,
      difficulty: 'Medium',
      pattern: 'Board-style',
      chapters: ['Kinematics', 'Thermodynamics', 'Optics & Wave Motion'],
      instructions: 'Include derivation steps and numerical calculations.'
    }
  },
  {
    id: 'class-12-chemistry',
    name: 'Class 12 Chemistry',
    category: 'School',
    description: 'Organic & Inorganic',
    iconName: 'Flame',
    badge: '70 Marks',
    data: {
      board: 'CBSE',
      class: '12',
      subject: 'Chemistry',
      totalMarks: 70,
      difficulty: 'Medium',
      pattern: 'Board-style',
      chapters: ['Organic Chemistry', 'Chemical Bonding', 'Equilibrium'],
      instructions: 'Include chemical equations and reaction mechanism questions.'
    }
  },
  {
    id: 'class-12-maths',
    name: 'Class 12 Mathematics',
    category: 'School',
    description: 'Calculus & Vectors',
    iconName: 'Award',
    badge: '80 Marks',
    data: {
      board: 'CBSE',
      class: '12',
      subject: 'Mathematics',
      totalMarks: 80,
      difficulty: 'Hard',
      pattern: 'Board-style',
      chapters: ['Calculus & Limits', 'Vectors & 3D Geometry', 'Coordinate Geometry'],
      instructions: 'High weightage integration and 3D geometry problems.'
    }
  },

  // ─── COMPETITIVE PRESETS ───────────────────────────────────────────────────
  {
    id: 'jee-main',
    name: 'JEE Main Mock Test',
    category: 'Competitive',
    description: 'Latest NTA Pattern',
    iconName: 'Sparkles',
    badge: '100 Marks',
    data: {
      board: 'JEE Main',
      class: '12',
      subject: 'Mathematics',
      totalMarks: 100,
      difficulty: 'Hard',
      pattern: 'MCQ',
      chapters: ['Algebra', 'Calculus & Limits', 'Coordinate Geometry'],
      instructions: 'Single correct MCQs (+4/-1) and numerical integer value questions.'
    }
  },
  {
    id: 'jee-advanced',
    name: 'JEE Advanced',
    category: 'Competitive',
    description: 'Multi-Correct & Matrix',
    iconName: 'Flame',
    badge: '120 Marks',
    data: {
      board: 'JEE Advanced',
      class: '12',
      subject: 'Physics',
      totalMarks: 120,
      difficulty: 'Hard',
      pattern: 'Custom',
      customPatternDetails: 'Multi-correct MCQs, Paragraph Based, and Matching Type Matrix questions.',
      chapters: ['Kinematics', 'Thermodynamics', 'Modern Physics'],
      instructions: 'Top tier problem solving requiring deep conceptual mastery.'
    }
  },
  {
    id: 'neet-ug',
    name: 'NEET Full Syllabus',
    category: 'Competitive',
    description: '720 Marks Pattern',
    iconName: 'BookOpen',
    badge: '180 Marks',
    data: {
      board: 'NEET UG',
      class: '12',
      subject: 'Biology',
      totalMarks: 180,
      difficulty: 'Medium',
      pattern: 'MCQ',
      chapters: ['Cell Structure and Function', 'Human Physiology', 'Genetics and Evolution', 'Biotechnology'],
      instructions: 'NCERT line-by-line grounded MCQs and assertion-reason questions.'
    }
  },
  {
    id: 'cuet-ug',
    name: 'CUET Mock Test',
    category: 'Competitive',
    description: 'Multiple Subjects',
    iconName: 'Globe',
    badge: '200 Marks',
    data: {
      board: 'CUET UG',
      class: '12',
      subject: 'General Studies',
      totalMarks: 200,
      difficulty: 'Medium',
      pattern: 'MCQ',
      chapters: ['Quantitative Aptitude & Speed', 'Logical Reasoning', 'Current Affairs & GK'],
      instructions: 'NTA CUET General Test standard speed paper.'
    }
  },
  {
    id: 'cuet-pg',
    name: 'CUET PG Test',
    category: 'Competitive',
    description: 'Postgraduate Level',
    iconName: 'GraduationCap',
    badge: '100 Marks',
    data: {
      board: 'CUET PG',
      class: 'College',
      subject: 'Computer Science',
      totalMarks: 100,
      difficulty: 'Hard',
      pattern: 'MCQ',
      chapters: ['Data Structures & Algorithms', 'Operating Systems & Concurrency', 'Database Management & SQL'],
      instructions: 'Domain specific advanced multiple choice questions.'
    }
  },
  {
    id: 'cat-quant',
    name: 'CAT Quant Practice',
    category: 'Competitive',
    description: 'Quantitative Aptitude',
    iconName: 'Zap',
    badge: '60 Marks',
    data: {
      board: 'CAT',
      class: 'College',
      subject: 'Quantitative Aptitude',
      totalMarks: 60,
      difficulty: 'Hard',
      pattern: 'MCQ',
      chapters: ['Number Systems & Simplification', 'Percentage, Profit & Loss', 'Time, Work & Speed'],
      instructions: 'High difficulty CAT quant questions with TITA non-MCQs.'
    }
  },
  {
    id: 'gate-cse',
    name: 'GATE Computer Science',
    category: 'Competitive',
    description: 'Engineering Entrance',
    iconName: 'Cpu',
    badge: '100 Marks',
    data: {
      board: 'GATE CSE',
      class: 'College',
      subject: 'Computer Science',
      totalMarks: 100,
      difficulty: 'Hard',
      pattern: 'Mixed',
      chapters: ['Data Structures & Algorithms', 'Operating Systems & Concurrency', 'Computer Networks & Security'],
      instructions: 'GATE CS style MCQs, MSQs (Multiple Select), and NAT (Numerical Answer Type).'
    }
  },
  {
    id: 'gate-ece',
    name: 'GATE ECE',
    category: 'Competitive',
    description: 'Electronics & Comm',
    iconName: 'Zap',
    badge: '100 Marks',
    data: {
      board: 'GATE ECE',
      class: 'College',
      subject: 'Physics',
      totalMarks: 100,
      difficulty: 'Hard',
      pattern: 'Mixed',
      chapters: ['Electrostatics & Current', 'Optics & Wave Motion'],
      instructions: 'Electronics circuits, signals, and semiconductor questions.'
    }
  },
  {
    id: 'clat-exam',
    name: 'CLAT Law Test',
    category: 'Competitive',
    description: 'Passage Based Questions',
    iconName: 'Building2',
    badge: '120 Marks',
    data: {
      board: 'CLAT',
      class: '12',
      subject: 'Political Science',
      totalMarks: 120,
      difficulty: 'Medium',
      pattern: 'MCQ',
      chapters: ['Indian Constitution & Preamble', 'Judiciary & Rights', 'Governance & Public Policy'],
      instructions: 'Legal reasoning and passage-based comprehension MCQs.'
    }
  },
  {
    id: 'ssc-cgl',
    name: 'SSC CGL Mock',
    category: 'Competitive',
    description: 'Tier-1 Exam Pattern',
    iconName: 'Building2',
    badge: '200 Marks',
    data: {
      board: 'SSC (CGL / CHSL / MTS)',
      class: 'College',
      subject: 'Quantitative Aptitude',
      totalMarks: 200,
      difficulty: 'Medium',
      pattern: 'MCQ',
      chapters: ['Number Systems & Simplification', 'Percentage, Profit & Loss', 'Verbal & Logical Reasoning', 'Indian Polity & Constitution'],
      instructions: '25 Qs each across Quant, Reasoning, English, and General Awareness.'
    }
  },
  {
    id: 'upsc-prelims',
    name: 'UPSC GS Prelims',
    category: 'Competitive',
    description: 'Civil Services GS-1',
    iconName: 'Building2',
    badge: '200 Marks',
    data: {
      board: 'UPSC (Civil Services)',
      class: 'College',
      subject: 'General Knowledge',
      totalMarks: 200,
      difficulty: 'Hard',
      pattern: 'MCQ',
      chapters: ['Indian Polity & Constitution', 'Modern Indian History', 'Geography & Environment', 'Indian Economy & Budget'],
      instructions: 'Multi-statement conceptual MCQs with negative marking.'
    }
  },
  {
    id: 'bank-po',
    name: 'Bank PO Mock',
    category: 'Competitive',
    description: 'IBPS / SBI PO',
    iconName: 'Building2',
    badge: '100 Marks',
    data: {
      board: 'Banking (IBPS / SBI)',
      class: 'College',
      subject: 'Quantitative Aptitude',
      totalMarks: 100,
      difficulty: 'Hard',
      pattern: 'MCQ',
      chapters: ['Data Interpretation & Graphs', 'Seating Arrangement & Puzzles', 'Grammar & Vocabulary'],
      instructions: 'Speed and accuracy test with heavy Data Interpretation sets.'
    }
  },

  // ─── COLLEGE PRESETS ───────────────────────────────────────────────────────
  {
    id: 'btech-semester',
    name: 'B.Tech Semester Exam',
    category: 'College',
    description: 'University Pattern',
    iconName: 'GraduationCap',
    badge: '70 Marks',
    data: {
      board: 'B.Tech',
      class: 'College',
      subject: 'Computer Science',
      totalMarks: 70,
      difficulty: 'Medium',
      pattern: 'Board-style',
      chapters: ['Data Structures & Algorithms', 'Operating Systems & Concurrency', 'Database Management & SQL'],
      instructions: 'University end-term paper with Section A short answers and Section B long analytical questions.'
    }
  },
  {
    id: 'mca-semester',
    name: 'MCA Semester Exam',
    category: 'College',
    description: 'Advanced CS Theory',
    iconName: 'GraduationCap',
    badge: '80 Marks',
    data: {
      board: 'MCA',
      class: 'College',
      subject: 'Database Management Systems',
      totalMarks: 80,
      difficulty: 'Hard',
      pattern: 'Board-style',
      chapters: ['Database Management & SQL', 'Operating Systems & Concurrency'],
      instructions: 'Focus on ER Diagrams, Normalization (3NF/BCNF), and SQL queries.'
    }
  },
  {
    id: 'bca-semester',
    name: 'BCA Semester Exam',
    category: 'College',
    description: 'Core IT Foundations',
    iconName: 'Code',
    badge: '60 Marks',
    data: {
      board: 'BCA',
      class: 'College',
      subject: 'Data Structures',
      totalMarks: 60,
      difficulty: 'Medium',
      pattern: 'Mixed',
      chapters: ['Data Structures & Algorithms'],
      instructions: 'Include C/C++ code dry-run questions and data structure algorithms.'
    }
  },
  {
    id: 'mba-semester',
    name: 'MBA Semester Exam',
    category: 'College',
    description: 'Management & Case Study',
    iconName: 'Building2',
    badge: '100 Marks',
    data: {
      board: 'MBA',
      class: 'College',
      subject: 'Economics',
      totalMarks: 100,
      difficulty: 'Medium',
      pattern: 'Custom',
      customPatternDetails: 'Part A Short concepts, Part B Long Essays, Part C Real-world Business Case Study.',
      chapters: ['Microeconomics & Consumer Demand', 'Macroeconomics & National Income', 'Public Finance'],
      instructions: 'Emphasize real-world business decision making scenarios.'
    }
  },
  {
    id: 'os-subject',
    name: 'Operating Systems',
    category: 'College',
    description: 'Concurrency & Memory',
    iconName: 'Cpu',
    badge: '70 Marks',
    data: {
      board: 'B.Tech',
      class: 'College',
      subject: 'Operating Systems',
      totalMarks: 70,
      difficulty: 'Medium',
      pattern: 'Board-style',
      chapters: ['Operating Systems & Concurrency'],
      instructions: 'CPU scheduling algorithms (Round-Robin/SJF), Deadlock detection, and Virtual Memory paging.'
    }
  },
  {
    id: 'dbms-subject',
    name: 'DBMS Exam',
    category: 'College',
    description: 'SQL & Normalization',
    iconName: 'Database',
    badge: '70 Marks',
    data: {
      board: 'B.Tech',
      class: 'College',
      subject: 'Database Management Systems',
      totalMarks: 70,
      difficulty: 'Medium',
      pattern: 'Mixed',
      chapters: ['Database Management & SQL'],
      instructions: 'Relational Algebra expressions, SQL Joins, and ACID transaction properties.'
    }
  },
  {
    id: 'dsa-subject',
    name: 'Data Structures & Algo',
    category: 'College',
    description: 'Trees, Graphs & DP',
    iconName: 'Code',
    badge: '80 Marks',
    data: {
      board: 'B.Tech',
      class: 'College',
      subject: 'Data Structures',
      totalMarks: 80,
      difficulty: 'Hard',
      pattern: 'Board-style',
      chapters: ['Data Structures & Algorithms'],
      instructions: 'Time & space complexity analysis (Big-O), Binary Trees, Graph BFS/DFS, and Dynamic Programming.'
    }
  },
  {
    id: 'ml-subject',
    name: 'Machine Learning',
    category: 'College',
    description: 'AI & Neural Networks',
    iconName: 'Brain',
    badge: '70 Marks',
    data: {
      board: 'B.Tech',
      class: 'College',
      subject: 'Machine Learning',
      totalMarks: 70,
      difficulty: 'Hard',
      pattern: 'Mixed',
      chapters: ['Supervised & Unsupervised Learning', 'Neural Networks & Deep Learning'],
      instructions: 'Gradient descent derivation, Loss functions, Overfitting vs Underfitting, and Confusion Matrices.'
    }
  },

  // ─── CUSTOM PRESET ─────────────────────────────────────────────────────────
  {
    id: 'custom-exam',
    name: 'Custom Exam',
    category: 'Custom',
    description: 'Start from scratch',
    iconName: 'PlusCircle',
    badge: 'Blank Form',
    data: {
      subject: '',
      class: '10',
      board: 'CBSE',
      totalMarks: 100,
      difficulty: 'Medium',
      pattern: 'Board-style',
      chapters: [],
      topics: '',
      instructions: '',
      customPatternDetails: ''
    }
  }
];
