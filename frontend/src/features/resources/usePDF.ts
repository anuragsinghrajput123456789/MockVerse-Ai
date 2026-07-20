import { useCallback } from 'react';
import { ResourceSheet } from '../../shared/types';
import { useToast } from '../../shared/hooks/use-toast';
import { downloadSheetPdf, downloadSheetHtml } from '../../shared/services/resourceService';

export function usePDF(activeSheet: ResourceSheet | null) {
  const { toast } = useToast();

  const handleExportPdf = useCallback(async () => {
    if (!activeSheet) return;
    try {
      toast({
        title: "Compiling PDF...",
        description: "Your study sheet PDF is generating on the server.",
      });
      const sheetId = activeSheet.id || (activeSheet as any)._id;
      const blob = await downloadSheetPdf(sheetId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = activeSheet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `${safeName}_study_sheet.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Success!",
        description: "Interactive PDF downloaded successfully.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Export Failed",
        description: "Unable to export PDF study sheet.",
        variant: "destructive"
      });
    }
  }, [activeSheet, toast]);

  const handleExportHtml = useCallback(async () => {
    if (!activeSheet) return;
    try {
      toast({
        title: "Compiling HTML...",
        description: "Your study sheet HTML is generating on the server.",
      });
      const sheetId = activeSheet.id || (activeSheet as any)._id;
      const blob = await downloadSheetHtml(sheetId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = activeSheet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `${safeName}_study_sheet.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Success!",
        description: "HTML Study Sheet downloaded successfully.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Export Failed",
        description: "Unable to export HTML study sheet.",
        variant: "destructive"
      });
    }
  }, [activeSheet, toast]);

  const handlePrintSheet = useCallback(() => {
    window.print();
  }, []);

  return {
    handleExportPdf,
    handleExportHtml,
    handlePrintSheet
  };
}

export default usePDF;
