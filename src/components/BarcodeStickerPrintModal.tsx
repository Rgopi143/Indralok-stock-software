import React, { useState } from 'react';
import { X, Printer, Tag, Sliders } from 'lucide-react';
import { Product, StoreConfig } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';

interface BarcodeStickerPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  allProducts: Product[];
  storeConfig: StoreConfig;
}

export const BarcodeStickerPrintModal: React.FC<BarcodeStickerPrintModalProps> = ({
  isOpen,
  onClose,
  product,
  allProducts,
  storeConfig,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(product);
  const [stickerCount, setStickerCount] = useState<number>(12);
  const [showStoreName, setShowStoreName] = useState<boolean>(true);
  const [showMrp, setShowMrp] = useState<boolean>(true);
  const [columns, setColumns] = useState<number>(3);

  React.useEffect(() => {
    setSelectedProduct(product || allProducts[0] || null);
  }, [product, allProducts]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentProd = selectedProduct;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-950 font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Barcode Label Printing Studio</h3>
              <p className="text-xs text-slate-300">Generate printable barcode tags for store merchandise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="no-print bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b pb-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Sticker Customizer
            </div>

            {/* Select Product */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Product
              </label>
              <select
                value={currentProd?.id || ''}
                onChange={(e) => {
                  const p = allProducts.find((item) => item.id === e.target.value);
                  if (p) setSelectedProduct(p);
                }}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} [{p.barcode}]
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity of Labels */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Number of Stickers to Print
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={stickerCount}
                onChange={(e) => setStickerCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Sheet Columns */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Layout Grid Columns
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((col) => (
                  <button
                    key={col}
                    onClick={() => setColumns(col)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      columns === col
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {col} Cols
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStoreName}
                  onChange={(e) => setShowStoreName(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Include Store Name
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMrp}
                  onChange={(e) => setShowMrp(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Display MRP & Offer Price
              </label>
            </div>

            <div className="pt-4">
              <button
                onClick={handlePrint}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print Sticker Sheet
              </button>
            </div>
          </div>

          {/* Printable Preview Sheet */}
          <div className="md:col-span-2 bg-slate-100 p-4 rounded-xl border border-slate-300 overflow-y-auto max-h-[500px]">
            {currentProd ? (
              <div id="printable-sticker-sheet" className="bg-white p-4 shadow-sm min-h-[400px]">
                <style>{`
                  @media print {
                    body * { visibility: hidden; }
                    .no-print { display: none !important; }
                    #printable-sticker-sheet, #printable-sticker-sheet * { visibility: visible; }
                    #printable-sticker-sheet {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      padding: 0;
                      margin: 0;
                      box-shadow: none !important;
                    }
                  }
                `}</style>

                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: stickerCount }).map((_, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-300 p-2 text-center rounded bg-white flex flex-col items-center justify-center space-y-1 shadow-2xs"
                    >
                      {showStoreName && (
                        <div className="text-[9px] font-extrabold uppercase text-slate-800 tracking-tight truncate max-w-full">
                          {storeConfig.storeName}
                        </div>
                      )}
                      <div className="text-[10px] font-bold text-slate-900 line-clamp-1 leading-tight">
                        {currentProd.name}
                      </div>

                      {/* Barcode Render */}
                      <div className="my-0.5">
                        <BarcodeRenderer
                          value={currentProd.barcode}
                          height={28}
                          width={1.2}
                          fontSize={9}
                          margin={1}
                        />
                      </div>

                      <div className="flex items-center justify-center gap-2 text-[10px] font-bold">
                        <span className="text-indigo-900">
                          {storeConfig.currencySymbol}
                          {currentProd.sellingPrice}
                        </span>
                        {showMrp && currentProd.mrp > currentProd.sellingPrice && (
                          <span className="text-[9px] text-slate-400 line-through">
                            MRP {storeConfig.currencySymbol}
                            {currentProd.mrp}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                No product selected for barcode printing.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center no-print text-xs text-slate-500">
          <span>Tip: Set page margins to "None" in Browser Print Dialog for exact alignment.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
