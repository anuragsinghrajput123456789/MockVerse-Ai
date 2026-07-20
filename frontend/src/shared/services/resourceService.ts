import { DEFAULT_TIMEOUT } from './shared/apiConfig';
import { httpGet, httpPost, httpPut, httpDelete, httpBlob } from './shared/httpClient';

export const getResourceSheets = async (): Promise<any[]> => {
  return httpGet('/resources/sheets', DEFAULT_TIMEOUT, 'Failed to fetch resource collections');
};

export const getResourceSheetById = async (id: string): Promise<any> => {
  return httpGet(`/resources/sheets/${id}`, DEFAULT_TIMEOUT, 'Failed to fetch collection details');
};

export const createResourceSheet = async (data: { name: string; description?: string; isPublic: boolean }): Promise<any> => {
  return httpPost('/resources/sheets', data, DEFAULT_TIMEOUT, 'Failed to create collection');
};

export const updateResourceSheet = async (id: string, data: { name?: string; description?: string; isPublic?: boolean }): Promise<any> => {
  return httpPut(`/resources/sheets/${id}`, data, DEFAULT_TIMEOUT, 'Failed to update collection');
};

export const deleteResourceSheet = async (id: string): Promise<any> => {
  return httpDelete(`/resources/sheets/${id}`, DEFAULT_TIMEOUT, 'Failed to delete collection');
};

// ─── Individual Resources API ──────────────────────────────────────────────────

export const addResourceToSheet = async (sheetId: string, data: any): Promise<any> => {
  return httpPost(`/resources/sheets/${sheetId}/resources`, data, DEFAULT_TIMEOUT, 'Failed to add resource');
};

export const updateResource = async (id: string, data: any): Promise<any> => {
  return httpPut(`/resources/resources/${id}`, data, DEFAULT_TIMEOUT, 'Failed to update resource');
};

export const deleteResource = async (id: string): Promise<any> => {
  return httpDelete(`/resources/resources/${id}`, DEFAULT_TIMEOUT, 'Failed to delete resource');
};

export const downloadSheetPdf = async (id: string): Promise<Blob> => {
  return httpBlob(`/resources/sheets/${id}/pdf`, DEFAULT_TIMEOUT, 'Failed to download PDF');
};

export const duplicateResourceSheet = async (id: string): Promise<any> => {
  return httpPost(`/resources/sheets/${id}/duplicate`, undefined, DEFAULT_TIMEOUT, 'Failed to duplicate collection');
};

export const downloadSheetHtml = async (id: string): Promise<Blob> => {
  return httpBlob(`/resources/sheets/${id}/html`, DEFAULT_TIMEOUT, 'Failed to download HTML study sheet');
};
