import { DEFAULT_TIMEOUT } from './shared/apiConfig';
import { httpGet, httpDelete } from './shared/httpClient';

// Get all papers (history)
export const getPapers = async (): Promise<any[]> => {
  const data = await httpGet<any[]>('/papers', DEFAULT_TIMEOUT, 'Failed to fetch paper history');
  return data.map((paper: any) => ({
    ...paper,
    createdAt: new Date(paper.createdAt),
  }));
};

// Get details of a specific paper
export const getPaperById = async (id: string): Promise<any> => {
  const data = await httpGet<any>(`/papers/${id}`, DEFAULT_TIMEOUT, 'Failed to fetch paper details');
  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
};

// Delete a paper
export const deletePaper = async (id: string): Promise<any> => {
  return httpDelete(`/papers/${id}`, DEFAULT_TIMEOUT, 'Failed to delete question paper');
};
