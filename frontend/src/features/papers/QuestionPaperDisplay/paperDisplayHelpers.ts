/**
 * Format the paper header subheading string.
 */
export const formatPaperSubheading = (type: 'question' | 'solution', date: Date = new Date()): string => {
  const label = type === 'question' ? 'AI Question Paper' : 'AI Solution Key';
  return `${label} • Generated ${date.toLocaleDateString()}`;
};

/**
 * Guard check to see if any footer metadata fields exist.
 */
export const hasFooterMetadata = (
  classVal?: string,
  totalMarks?: number,
  difficulty?: string,
  board?: string
): boolean => {
  return Boolean(classVal || totalMarks || difficulty || board);
};
