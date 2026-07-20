import React from 'react';

interface DeleteDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/70 backdrop-blur-sm flex items-center justify-center">
      <div className="glass-card p-6 rounded-2xl border border-white/10 max-w-sm w-full space-y-4">
        <h3 className="text-lg font-bold text-white">Delete Collection?</h3>
        <p className="text-xs text-slate-400">Are you sure you want to delete this collection and all its resources? This action is irreversible.</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
