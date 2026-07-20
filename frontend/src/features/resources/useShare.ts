import { useState, useCallback } from 'react';
import { ResourceSheet } from '../../shared/types';
import { useToast } from '../../shared/hooks/use-toast';

export function useShare(activeSheet: ResourceSheet | null) {
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const getShareLink = useCallback(() => {
    if (!activeSheet) return '';
    const sheetId = activeSheet.id || (activeSheet as any)._id;
    return `${window.location.origin}/?share_sheet=${sheetId}`;
  }, [activeSheet]);

  const handleCopyShareLink = useCallback(() => {
    const link = getShareLink();
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast({
      title: "Share Link Copied!",
      description: "Collection read-only URL copied to clipboard.",
    });
  }, [getShareLink, toast]);

  return {
    showShareModal,
    setShowShareModal,
    showQrModal,
    setShowQrModal,
    getShareLink,
    handleCopyShareLink
  };
}

export default useShare;
