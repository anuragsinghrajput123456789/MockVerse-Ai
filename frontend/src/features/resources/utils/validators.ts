export const validateSheetInput = (name: string): { isValid: boolean; message: string } => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'Collection name is required.' };
  }
  if (name.length > 100) {
    return { isValid: false, message: 'Collection name must be under 100 characters.' };
  }
  return { isValid: true, message: '' };
};

export const validateResourceInput = (title: string, url: string): { isValid: boolean; message: string } => {
  if (!title || !title.trim()) {
    return { isValid: false, message: 'Resource title is required.' };
  }
  if (!url || !url.trim()) {
    return { isValid: false, message: 'Resource link is required.' };
  }
  try {
    new URL(url);
  } catch {
    return { isValid: false, message: 'Please enter a valid URL link (e.g. https://example.com).' };
  }
  return { isValid: true, message: '' };
};
