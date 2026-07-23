import React, { useState } from 'react';
import { X, Printer, Download, Receipt, FileText, CheckCircle2, Copy } from 'lucide-react';
import { Bill, StoreConfig } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  storeConfig: StoreConfig;
  isDuplicate?: boolean;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  bill,
  storeConfig,
  isDuplicate = false,
}) => {
  const [format, setFormat] = useState<'thermal_80mm' | 'a4_full'>(
    storeConfig.receiptFormat || 'thermal_80mm'
  );
  const [showDuplicateBadge, setShowDuplicateBadge] = useState<boolean>(isDuplicate);

  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(bill.date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-slate-950 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Tax Invoice #{bill.billNumber}</h3>
              <p className="text-xs text-slate-300">
                Generated on {formattedDate} • Payment: {bill.paymentMethod.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Print Format:</span>
            <button
              onClick={() => setFormat('thermal_80mm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                format === 'thermal_80mm'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              80mm Thermal Receipt
            </button>
            <button
              onClick={() => setFormat('a4_full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                format === 'a4_full'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              A4 Standard Invoice
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showDuplicateBadge}
                onChange={(e) => setShowDuplicateBadge(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              Duplicate Copy Watermark
            </label>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Invoice
            </button>
          </div>
        </div>

        {/* Invoice View Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200/60 flex justify-center">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              .no-print { display: none !important; }
              #printable-invoice-container, #printable-invoice-container * { visibility: visible; }
              #printable-invoice-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none !important;
                background: white !important;
              }
            }
          `}</style>

          <div
            id="printable-invoice-container"
            className={`bg-white shadow-xl rounded-xl p-6 text-slate-900 border border-slate-300 relative transition-all ${
              format === 'thermal_80mm' ? 'max-w-[340px] text-xs font-mono' : 'max-w-2xl text-xs font-sans'
            }`}
          >
            {/* Watermark for Duplicate */}
            {showDuplicateBadge && (
              <div className="absolute top-12 right-6 border-2 border-red-500 text-red-500 font-extrabold text-[11px] px-2 py-0.5 rounded rotate-12 opacity-80 uppercase tracking-widest pointer-events-none">
                DUPLICATE COPY
              </div>
            )}

            {/* STORE HEADER */}
            <div className="text-center border-b border-slate-200 pb-4 mb-4">
              <h2 className="font-extrabold text-base tracking-wide uppercase text-slate-900">
                {storeConfig.storeName}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium mb-1">{storeConfig.tagline}</p>
              <p className="text-[10px] text-slate-700">
                {storeConfig.addressLine1}, {storeConfig.addressLine2}
              </p>
              <p className="text-[10px] text-slate-700">{storeConfig.cityStatePincode}</p>
              <div className="mt-1 flex flex-wrap justify-center gap-x-3 text-[10px] font-semibold text-slate-800">
                <span>GSTIN: {storeConfig.gstin}</span>
                <span>Ph: {storeConfig.phone}</span>
              </div>
            </div>

            {/* TAX INVOICE BADGE & METADATA */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-3 text-[11px]">
              <div>
                <p className="font-bold text-slate-900">
                  Bill No: <span className="font-mono text-indigo-900">{bill.billNumber}</span>
                </p>
                <p className="text-slate-600">Date: {formattedDate}</p>
                <p className="text-slate-600">
                  Salesman: <span className="font-medium text-slate-800">{bill.salesmanName}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-1">
                  Tax Invoice
                </span>
                <p className="text-slate-600">Cashier: {bill.cashierName.split(' ')[0]}</p>
                <p className="text-slate-600 font-semibold">Mode: {bill.paymentMethod.toUpperCase()}</p>
              </div>
            </div>

            {/* CUSTOMER DETAILS IF PRESENT */}
            {(bill.customerName || bill.customerPhone) && (
              <div className="bg-slate-50 p-2 rounded border border-slate-200 mb-3 text-[10px]">
                <span className="font-bold text-slate-700">Customer: </span>
                {bill.customerName && <span>{bill.customerName} </span>}
                {bill.customerPhone && <span className="text-slate-500">({bill.customerPhone})</span>}
              </div>
            )}

            {/* ITEM TABLE */}
            <table className="w-full text-left mb-4 border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-[10px] font-bold uppercase text-slate-700">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Price</th>
                  <th className="py-1 text-right">GST%</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[10px]">
                {bill.items.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-1.5 pr-1">
                      <div className="font-bold text-slate-900 line-clamp-2">{item.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono">BC: {item.barcode}</div>
                    </td>
                    <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                    <td className="py-1.5 text-right font-mono">
                      {storeConfig.currencySymbol}
                      {item.sellingPrice.toFixed(2)}
                    </td>
                    <td className="py-1.5 text-right text-slate-600">{item.gstPercent}%</td>
                    <td className="py-1.5 text-right font-bold font-mono">
                      {storeConfig.currencySymbol}
                      {item.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* CALCULATION SUMMARY */}
            <div className="border-t border-slate-800 pt-2 space-y-1 text-[11px] mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Total Items:</span>
                <span className="font-bold text-slate-800">{bill.items.length} (Qty: {bill.items.reduce((s, i) => s + i.quantity, 0)})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount:</span>
                <span className="font-mono">
                  {storeConfig.currencySymbol}
                  {bill.totalTaxableValue.toFixed(2)}
                </span>
              </div>

              {/* GST BREAKDOWN */}
              <div className="bg-slate-50 p-2 rounded border border-slate-200 my-1 space-y-1 text-[10px]">
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>CGST Total:</span>
                  <span className="font-mono">
                    {storeConfig.currencySymbol}
                    {bill.totalCgstAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>SGST Total:</span>
                  <span className="font-mono">
                    {storeConfig.currencySymbol}
                    {bill.totalSgstAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t pt-1">
                  <span>Total Tax Included:</span>
                  <span className="font-mono">
                    {storeConfig.currencySymbol}
                    {bill.totalGstAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {bill.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Special Discount:</span>
                  <span className="font-mono">
                    -{storeConfig.currencySymbol}
                    {bill.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t-2 border-slate-900 pt-1.5 mt-2">
                <span>GRAND TOTAL:</span>
                <span className="font-mono text-indigo-900 text-base">
                  {storeConfig.currencySymbol}
                  {bill.grandTotal.toFixed(2)}
                </span>
              </div>

              {/* PAYMENT DETAILS */}
              {bill.paymentMethod === 'cash' && bill.paymentDetails?.cashReceived !== undefined && (
                <div className="text-[10px] text-slate-600 space-y-0.5 pt-1 border-t border-dashed">
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span className="font-mono">{storeConfig.currencySymbol}{bill.paymentDetails.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Change Returned:</span>
                    <span className="font-mono">{storeConfig.currencySymbol}{(bill.paymentDetails.changeReturned || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* INVOICE BARCODE */}
            <div className="my-3 flex flex-col items-center justify-center">
              <BarcodeRenderer value={bill.billNumber} height={30} width={1.2} fontSize={9} />
            </div>

            {/* TERMS & FOOTER */}
            <div className="text-center border-t border-slate-200 pt-3 text-[9px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 uppercase">{storeConfig.invoiceFooterNote}</p>
              <div className="whitespace-pre-line text-[8px] text-slate-400">
                {storeConfig.termsAndConditions}
              </div>
              <p className="text-[8px] text-slate-300 pt-1">Software: Smart Barcode POS v2.5</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center no-print">
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Bill saved to permanent history
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
