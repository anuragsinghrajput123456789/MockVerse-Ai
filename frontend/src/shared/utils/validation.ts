import { PaperFormData } from '../types';

/**
 * Validates whether a given string is a valid HTTP/HTTPS URL.
 */
export const isValidUrl = (url: string): boolean => {
  const cleanUrl = url.trim();
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(cleanUrl);
};

/**
 * Validates the question paper generation form.
 * Returns an object containing error messages mapped to field names.
 */
export const validatePaperForm = (formData: PaperFormData): Record<string, string> => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.subject.trim()) {
    newErrors.subject = 'Subject is required';
  }
  if (!formData.class) {
    newErrors.class = 'Class grade is required';
  }
  if (!formData.board) {
    newErrors.board = 'Board / Book type is required';
  }
  if (formData.totalMarks <= 0) {
    newErrors.totalMarks = 'Total marks must be greater than 0';
  }
  if (formData.pattern === 'Custom' && !formData.customPatternDetails?.trim()) {
    newErrors.customPatternDetails = 'Please specify your custom pattern details';
  }
  if (formData.chapters.length === 0) {
    newErrors.chapters = 'Please select at least one chapter';
  }

  return newErrors;
};
