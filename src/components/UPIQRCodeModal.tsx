import React from 'react';
import { X, QrCode, CheckCircle, ShieldCheck, Copy } from 'lucide-react';
import { StoreConfig } from '../types';

interface UPIQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: () => void;
  amount: number;
  billNumber: string;
  storeConfig: StoreConfig;
}

export const UPIQRCodeModal: React.FC<UPIQRCodeModalProps> = ({
  isOpen,
  onClose,
  onPaymentConfirmed,
  amount,
  billNumber,
  storeConfig,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const upiId = storeConfig.upiId || 'smartmart@upi';
  const storeNameEncoded = encodeURIComponent(storeConfig.storeName);
  const upiString = `upi://pay?pa=${upiId}&pn=${storeNameEncoded}&am=${amount.toFixed(2)}&tn=Invoice%20${billNumber}&cu=INR`;

  // QR Code image URL via Google Chart QR API fallback or clear SVG
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiString)}`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">UPI Quick Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div className="bg-indigo-50/80 p-3 rounded-xl border border-indigo-100">
            <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider block">
              Amount Due
            </span>
            <div className="text-3xl font-extrabold text-indigo-900 mt-0.5">
              {storeConfig.currencySymbol}
              {amount.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Bill: {billNumber}</span>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white border-2 border-dashed border-indigo-200 rounded-2xl inline-block shadow-inner">
            <img
              src={qrImageUrl}
              alt="Scan UPI QR Code"
              className="w-52 h-52 object-contain mx-auto"
              onError={(e) => {
                // Fallback if offline
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="text-[10px] font-bold text-slate-400 mt-2">
              Scan with GPay, PhonePe, Paytm, BHIM
            </div>
          </div>

          {/* UPI ID Info */}
          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500">UPI VPA:</span>
            <span className="font-mono font-bold text-slate-800">{upiId}</span>
            <button
              onClick={copyUpi}
              className="p-1 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : ''}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Encrypted & Direct Bank Transfer
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onPaymentConfirmed}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};
