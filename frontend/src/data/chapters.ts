export const mathematicsChapters = ['Algebra', 'Geometry', 'Trigonometry', 'Calculus & Limits', 'Statistics & Probability', 'Coordinate Geometry', 'Vectors & 3D Geometry'];
export const physicsChapters = ['Kinematics', 'Laws of Motion', 'Work, Energy and Power', 'Thermodynamics', 'Optics & Wave Motion', 'Electrostatics & Current', 'Modern Physics'];
export const chemistryChapters = ['Structure of Atom', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Organic Chemistry', 'Equilibrium', 'Coordination Compounds'];
export const biologyChapters = ['Cell Structure and Function', 'Human Physiology', 'Genetics and Evolution', 'Biotechnology', 'Ecology and Environment', 'Plant Physiology'];
export const historyChapters = ['Ancient India & Indus Valley', 'Medieval Era & Mughal Empire', 'Modern History & Freedom Struggle', 'World History'];
export const geographyChapters = ['Physical Geography & Earth System', 'Indian Geography & Resources', 'Climate & Vegetation', 'Economic Geography'];
export const englishChapters = ['Grammar & Vocabulary', 'Reading Comprehension', 'Essay & Precision Writing', 'Literary Analysis'];
export const economicsChapters = ['Microeconomics & Consumer Demand', 'Macroeconomics & National Income', 'Indian Economy & Banking', 'Public Finance'];
export const politicalScienceChapters = ['Indian Constitution & Preamble', 'Union & State Executive', 'Judiciary & Rights', 'Governance & Public Policy'];

// Computer Science & Engineering
export const computerScienceChapters = ['Data Structures & Algorithms', 'Operating Systems & Concurrency', 'Database Management & SQL', 'Computer Networks & Security', 'Object-Oriented Programming'];
export const aiMlChapters = ['Supervised & Unsupervised Learning', 'Neural Networks & Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Model Evaluation & Tuning'];

// Competitive & Government Exams
export const quantAptitudeChapters = ['Number Systems & Simplification', 'Percentage, Profit & Loss', 'Ratio, Proportion & Mixture', 'Time, Work & Speed', 'Data Interpretation & Graphs'];
export const reasoningChapters = ['Verbal & Logical Reasoning', 'Syllogism & Statements', 'Seating Arrangement & Puzzles', 'Coding-Decoding', 'Blood Relations & Directions'];
export const generalKnowledgeChapters = ['Indian Polity & Constitution', 'Modern Indian History', 'Geography & Environment', 'Indian Economy & Budget', 'Current Affairs & GK'];

// Professional Cloud & IT Certifications
export const awsChapters = ['IAM & Access Control', 'EC2 & Compute Services', 'S3 & Cloud Storage', 'VPC & Cloud Networking', 'Serverless & Lambda', 'Security & Compliance'];

export const scienceChapters = [...new Set([...physicsChapters, ...chemistryChapters, ...biologyChapters])];
export const socialScienceChapters = [...historyChapters, ...geographyChapters, ...economicsChapters, ...politicalScienceChapters];

export const chapterMap: Record<string, string[]> = {
  'mathematics': mathematicsChapters,
  'math': mathematicsChapters,
  'maths': mathematicsChapters,
  'physics': physicsChapters,
  'chemistry': chemistryChapters,
  'biology': biologyChapters,
  'science': scienceChapters,
  'history': historyChapters,
  'geography': geographyChapters,
  'english': englishChapters,
  'economics': economicsChapters,
  'political science': politicalScienceChapters,
  'social science': socialScienceChapters,
  'computer science': computerScienceChapters,
  'cs': computerScienceChapters,
  'data structures': computerScienceChapters,
  'operating systems': computerScienceChapters,
  'database management': computerScienceChapters,
  'dbms': computerScienceChapters,
  'artificial intelligence': aiMlChapters,
  'machine learning': aiMlChapters,
  'ai': aiMlChapters,
  'ml': aiMlChapters,
  'quantitative aptitude': quantAptitudeChapters,
  'quant': quantAptitudeChapters,
  'logical reasoning': reasoningChapters,
  'reasoning': reasoningChapters,
  'general knowledge': generalKnowledgeChapters,
  'gk': generalKnowledgeChapters,
  'general studies': generalKnowledgeChapters,
  'aws': awsChapters,
};
