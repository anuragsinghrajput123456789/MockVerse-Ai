
export const mathematicsChapters = ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics'];
export const physicsChapters = ['Kinematics', 'Laws of Motion', 'Work, Energy and Power', 'Thermodynamics', 'Optics'];
export const chemistryChapters = ['Structure of Atom', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Organic Chemistry'];
export const biologyChapters = ['The Living World', 'Cell Structure and Function', 'Human Physiology', 'Genetics and Evolution'];
export const historyChapters = ['The Indus Valley Civilization', 'The Mughal Empire', 'The Indian Freedom Struggle'];
export const geographyChapters = ['The Earth in the Solar System', 'Our Country - India', 'Agriculture'];
export const englishChapters = ['Grammar', 'Reading Comprehension', 'Writing Skills', 'Literature'];
export const economicsChapters = ['Introduction to Economics', 'Consumer\'s Equilibrium and Demand', 'National Income'];
export const politicalScienceChapters = ['What is Democracy? Why Democracy?', 'Constitutional Design', 'Working of Institutions'];

export const scienceChapters = [...new Set([...physicsChapters, ...chemistryChapters, ...biologyChapters])];
export const socialScienceChapters = [...historyChapters, ...geographyChapters, ...economicsChapters, ...politicalScienceChapters];

export const chapterMap: Record<string, string[]> = {
  'mathematics': mathematicsChapters,
  'math': mathematicsChapters,
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
};

