import React, { useState } from 'react';
import { Barcode, Printer, CheckSquare, Square, Layers, Tag, Sliders } from 'lucide-react';
import { Product, StoreConfig } from '../../types';
import { BarcodeRenderer } from '../BarcodeRenderer';

interface BarcodeStudioViewProps {
  products: Product[];
  storeConfig: StoreConfig;
  onSaveProduct?: (productData: Partial<Product>) => Promise<void>;
}

export const BarcodeStudioView: React.FC<BarcodeStudioViewProps> = ({ products, storeConfig, onSaveProduct }) => {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    products.slice(0, 4).map((p) => p.id)
  );
  const [stickersPerProduct, setStickersPerProduct] = useState<number>(4);
  const [gridColumns, setGridColumns] = useState<number>(3);
  const [showStoreHeader, setShowStoreHeader] = useState<boolean>(true);
  const [showMrpPrice, setShowMrpPrice] = useState<boolean>(true);
  const [autoReplenishStock, setAutoReplenishStock] = useState<boolean>(true);
  const [replenishSuccessMsg, setReplenishSuccessMsg] = useState<string | null>(null);

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedProductIds(products.map((p) => p.id));
  };

  const selectLowStockOnly = () => {
    const lowStockIds = products
      .filter((p) => (p.stockQuantity ?? 20) <= (p.lowStockThreshold ?? 5))
      .map((p) => p.id);
    setSelectedProductIds(lowStockIds);
  };

  const clearSelection = () => {
    setSelectedProductIds([]);
  };

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));

  // Build full sheet items list
  const sheetItems: Product[] = [];
  selectedProducts.forEach((p) => {
    for (let i = 0; i < stickersPerProduct; i++) {
      sheetItems.push(p);
    }
  });

  const handlePrint = async () => {
    // If auto-replenish is enabled, add printed count to each selected product's stock
    if (autoReplenishStock && onSaveProduct && selectedProducts.length > 0) {
      for (const p of selectedProducts) {
        const currentStock = p.stockQuantity ?? 20;
        await onSaveProduct({
          id: p.id,
          stockQuantity: currentStock + stickersPerProduct,
        });
      }
      setReplenishSuccessMsg(`Successfully printed and added +${stickersPerProduct} barcodes to stock for ${selectedProducts.length} items!`);
      setTimeout(() => setReplenishSuccessMsg(null), 3500);
    }

    window.print();
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 overflow-y-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2">
            <Barcode className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Barcode Label Printer Studio</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Batch-generate and print barcode stickers for all merchandise tags in standard grid layouts.
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={sheetItems.length === 0}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
            sheetItems.length === 0
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
          }`}
        >
          <Printer className="w-4 h-4" /> Print {sheetItems.length} Labels
        </button>
      </div>

      {/* STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CONTROLS & SELECTION */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-5 no-print">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Sliders className="w-4 h-4 text-indigo-600" /> Batch Settings
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectLowStockOnly}
                className="text-[10px] font-bold text-amber-700 hover:underline bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                title="Select items with barcode stock below threshold"
              >
                ⚡ Low Stock Only
              </button>
              <button
                onClick={selectAll}
                className="text-[10px] font-bold text-indigo-600 hover:underline"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-[10px] font-bold text-slate-400 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          {replenishSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold p-2.5 rounded-xl animate-fade-in">
              {replenishSuccessMsg}
            </div>
          )}

          {/* Quantities per product */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Stickers per Selected Product
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={stickersPerProduct}
              onChange={(e) => setStickersPerProduct(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>

          {/* Grid Layout Columns */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sheet Grid Layout
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  onClick={() => setGridColumns(cols)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                    gridColumns === cols
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cols} Columns
                </button>
              ))}
            </div>
          </div>

          {/* Display toggles */}
          <div className="space-y-2 pt-2 border-t">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showStoreHeader}
                onChange={(e) => setShowStoreHeader(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              Show Store Name Tag
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showMrpPrice}
                onChange={(e) => setShowMrpPrice(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              Show MRP vs Offer Price
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-indigo-900 bg-indigo-50/80 p-2 rounded-xl border border-indigo-200 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReplenishStock}
                onChange={(e) => setAutoReplenishStock(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              Add printed label count to Product Barcode Stock
            </label>
          </div>

          {/* Product checklist */}
          <div className="space-y-2 pt-2 border-t">
            <label className="block text-xs font-bold text-slate-700">
              Select Products for Printing ({selectedProductIds.length} Selected)
            </label>
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {products.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                const stock = p.stockQuantity ?? 20;
                const isLow = stock <= (p.lowStockThreshold ?? 5);

                return (
                  <button
                    key={p.id}
                    onClick={() => toggleSelectProduct(p.id)}
                    className={`w-full text-left p-2 rounded-xl text-xs font-medium flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          stock === 0
                            ? 'bg-rose-100 text-rose-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {stock} left
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PRINTABLE PREVIEW SHEET */}
        <div className="lg:col-span-2 bg-slate-200 p-6 rounded-2xl border border-slate-300 min-h-[500px]">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .no-print { display: none !important; }
              #printable-studio-sheet, #printable-studio-sheet * { visibility: visible; }
              #printable-studio-sheet {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 0;
                margin: 0;
                box-shadow: none !important;
                background: white !important;
              }
            }
          `}</style>

          <div
            id="printable-studio-sheet"
            className="bg-white p-6 rounded-xl shadow-lg border border-slate-300 min-h-[500px]"
          >
            {sheetItems.length === 0 ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 text-sm">
                <Barcode className="w-12 h-12 text-slate-300 mb-2" />
                Select one or more products on the left to view barcode sheet preview.
              </div>
            ) : (
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
              >
                {sheetItems.map((prod, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-300 p-2 text-center rounded-lg bg-white flex flex-col items-center justify-center space-y-1 shadow-2xs"
                  >
                    {showStoreHeader && (
                      <div className="text-[9px] font-extrabold uppercase text-slate-800 tracking-tight truncate max-w-full">
                        {storeConfig.storeName}
                      </div>
                    )}
                    <div className="text-[10px] font-bold text-slate-900 line-clamp-1 leading-tight">
                      {prod.name}
                    </div>

                    <div className="my-0.5">
                      <BarcodeRenderer
                        value={prod.barcode}
                        height={28}
                        width={1.1}
                        fontSize={9}
                        margin={1}
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold">
                      <span className="text-indigo-900">
                        {storeConfig.currencySymbol}
                        {prod.sellingPrice}
                      </span>
                      {showMrpPrice && prod.mrp > prod.sellingPrice && (
                        <span className="text-[9px] text-slate-400 line-through">
                          MRP {storeConfig.currencySymbol}
                          {prod.mrp}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
