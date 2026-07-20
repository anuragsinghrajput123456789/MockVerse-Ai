export const generateDuplicateName = (name: string): string => {
  return `${name} (Copy)`;
};

export const formatDateString = (date: Date | string): string => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
