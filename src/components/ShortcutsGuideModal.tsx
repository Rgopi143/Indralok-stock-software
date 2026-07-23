import React from 'react';
import { X, Keyboard, Zap } from 'lucide-react';

interface ShortcutsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsGuideModal: React.FC<ShortcutsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'F2', action: 'Focus Barcode Scanner / New Checkout Session' },
    { key: 'F4', action: 'Open Camera Web Scanner Modal' },
    { key: 'F8', action: 'Instant Pay & Print Bill' },
    { key: 'Enter', action: 'Add scanned item / Submit forms' },
    { key: 'Esc', action: 'Close open dialogs & clear scanner inputs' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">POS Keyboard Cheat Sheet</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-xs text-slate-500 mb-2">
            Use physical keyboard shortcuts for lightning-fast cashier billing:
          </p>
          <div className="space-y-2">
            {shortcuts.map((sc) => (
              <div
                key={sc.key}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
              >
                <span className="font-semibold text-slate-700">{sc.action}</span>
                <span className="font-mono font-extrabold bg-slate-900 text-white px-2 py-1 rounded text-[11px] shadow-2xs">
                  {sc.key}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
