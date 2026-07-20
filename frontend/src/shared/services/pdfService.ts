/**
 * PDF Service configurations and layout settings.
 */

export const getPdfLayoutConfig = () => {
  return {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait' as const,
    margins: {
      top: 15,
      bottom: 15,
      left: 15,
      right: 15
    }
  };
};

export default getPdfLayoutConfig;
