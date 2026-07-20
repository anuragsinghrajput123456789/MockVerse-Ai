import React from 'react';
import { ResourceSheet } from '../../../../types';
import { X, QrCode } from 'lucide-react';

interface QrModalProps {
  showQrModal: boolean;
  setShowQrModal: (show: boolean) => void;
  activeSheet: ResourceSheet | null;
  qrCodeUrl: string;
  getShareLink: () => string;
}

export const QrModal: React.FC<QrModalProps> = ({
  showQrModal,
  setShowQrModal,
  activeSheet,
  qrCodeUrl,
  getShareLink
}) => {
  if (!showQrModal || !activeSheet) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in no-print">
      <div className="glass-card max-w-sm w-full p-8 rounded-3xl relative border border-white/10 text-center space-y-6">
        <button 
          onClick={() => setShowQrModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2 font-['Sora']">
            <QrCode className="w-5 h-5 text-pink-400" />
            <span>Scan Collection QR</span>
          </h3>
          <p className="text-slate-400 text-xs">Scan using your mobile camera to view online.</p>
        </div>

        <div className="p-4 bg-white rounded-2xl w-fit mx-auto border border-white/10">
          <img 
            src={qrCodeUrl} 
            alt="Collection QR Code" 
            className="w-44 h-44 object-contain"
            onError={(e) => {
              console.error('Failed to load QR code image from endpoint');
              (e.target as any).src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getShareLink())}`;
            }}
          />
        </div>

        <p className="text-[10px] text-slate-500 font-semibold">{activeSheet.name}</p>
      </div>
    </div>
  );
};

export default QrModal;
