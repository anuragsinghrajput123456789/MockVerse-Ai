import { useState } from 'react';

export function useSearch(initialSearchTerm = '') {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);

  return {
    searchTerm,
    setSearchTerm
  };
}

export default useSearch;
