import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Scan, Keyboard, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  products: Product[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  products,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'simulation'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = 'reader-region';

  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch(err => console.debug(err));
      }
      return;
    }

    setCameraError(null);
    let isMounted = true;

    const startCamera = async () => {
      try {
        const html5Qrcode = new Html5Qrcode(scannerRegionId);
        html5QrcodeRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
          },
          (decodedText) => {
            if (isMounted) {
              setScannedFeedback(`Scanned: ${decodedText}`);
              onScan(decodedText);
              setTimeout(() => setScannedFeedback(null), 1200);
            }
          },
          () => {
            // Ignore frame decode failures
          }
        );
      } catch (err: unknown) {
        if (isMounted) {
          console.warn('Camera access error:', err);
          setCameraError('Camera access unavailable or permission denied. Use physical USB barcode scanner or simulation tab below.');
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch(err => console.debug(err));
      }
    };
  }, [isOpen, activeTab, onScan]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setScannedFeedback(`Scanned: ${manualCode.trim()}`);
      setManualCode('');
      setTimeout(() => setScannedFeedback(null), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Barcode Scanner</h3>
              <p className="text-xs text-slate-300">Scan product label for instant billing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            id="close-barcode-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Feedback Banner */}
        {scannedFeedback && (
          <div className="bg-emerald-500 text-white px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            {scannedFeedback}
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'camera'
                ? 'border-indigo-600 text-indigo-600 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            Webcam Scanner
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'simulation'
                ? 'border-indigo-600 text-indigo-600 bg-white font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Quick Touch Scan
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'camera' ? (
            <div>
              <div className="relative rounded-xl overflow-hidden bg-slate-950 min-h-[240px] flex items-center justify-center border border-slate-800">
                <div id={scannerRegionId} className="w-full h-full min-h-[240px]" />
                {cameraError && (
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-900 text-slate-200">
                    <Camera className="w-10 h-10 text-slate-500 mb-3" />
                    <p className="text-xs text-amber-300 font-medium mb-2">{cameraError}</p>
                    <p className="text-xs text-slate-400">
                      Note: Physical USB Barcode scanners work automatically on any screen!
                    </p>
                  </div>
                )}
              </div>

              {/* Manual input fallback */}
              <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <Keyboard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Or type barcode & press Enter..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </form>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-3 font-medium">
                Click any registered product below to simulate scanning its barcode sticker:
              </p>
              <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                {products.filter(p => p.status === 'active').map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onScan(product.barcode);
                      setScannedFeedback(`Scanned: ${product.name}`);
                      setTimeout(() => setScannedFeedback(null), 1200);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                          {product.barcode}
                        </span>
                        <span>• {product.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-700 text-sm">
                        ₹{product.sellingPrice}
                      </div>
                      <div className="text-[10px] text-slate-400 line-through">
                        MRP ₹{product.mrp}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>USB Scanner Mode: Always Active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
