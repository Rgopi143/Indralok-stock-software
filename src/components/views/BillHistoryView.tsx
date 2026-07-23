import React, { useState } from 'react';
import {
  History,
  Search,
  Printer,
  Eye,
  FileSpreadsheet,
  Calendar,
  User,
  CreditCard,
  X,
  Copy,
} from 'lucide-react';
import { Bill, StoreConfig, Salesman } from '../../types';
import { InvoicePrintModal } from '../InvoicePrintModal';

interface BillHistoryViewProps {
  bills: Bill[];
  salesmen: Salesman[];
  storeConfig: StoreConfig;
}

export const BillHistoryView: React.FC<BillHistoryViewProps> = ({
  bills,
  salesmen,
  storeConfig,
}) => {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSalesman, setSelectedSalesman] = useState('All');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('All');

  // Modal
  const [activeBill, setActiveBill] = useState<Bill | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const handleOpenBillModal = (bill: Bill) => {
    setActiveBill(bill);
    setIsInvoiceOpen(true);
  };

  const filteredBills = bills.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      b.billNumber.toLowerCase().includes(q) ||
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.customerPhone && b.customerPhone.includes(q)) ||
      b.salesmanName.toLowerCase().includes(q);

    const matchesSalesman = selectedSalesman === 'All' || b.salesmanId === selectedSalesman;
    const matchesPayment = selectedPaymentMode === 'All' || b.paymentMethod === selectedPaymentMode;

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(b.date) >= new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(b.date) <= end;
    }

    return matchesSearch && matchesSalesman && matchesPayment && matchesDate;
  });

  const exportCsv = () => {
    if (filteredBills.length === 0) return;

    const headers = [
      'Bill Number',
      'Date',
      'Cashier',
      'Salesman',
      'Customer',
      'Items Count',
      'Subtotal',
      'GST Total',
      'Discount',
      'Grand Total',
      'Payment Mode',
    ];

    const rows = filteredBills.map((b) => [
      b.billNumber,
      new Date(b.date).toLocaleString('en-IN'),
      `"${b.cashierName}"`,
      `"${b.salesmanName}"`,
      `"${b.customerName || 'N/A'}"`,
      b.items.length,
      b.subtotal.toFixed(2),
      b.totalGstAmount.toFixed(2),
      b.discountAmount.toFixed(2),
      b.grandTotal.toFixed(2),
      b.paymentMethod.toUpperCase(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bill_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 overflow-y-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Bill Search & Reprint Register</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search past sales transactions, review tax breakdowns, and print duplicate copy invoices.
          </p>
        </div>

        <button
          onClick={exportCsv}
          disabled={filteredBills.length === 0}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV ({filteredBills.length})
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Bill #, Customer Name / Phone..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Salesman filter */}
          <div>
            <select
              value={selectedSalesman}
              onChange={(e) => setSelectedSalesman(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="All">All Salesmen</option>
              {salesmen.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Mode filter */}
          <div>
            <select
              value={selectedPaymentMode}
              onChange={(e) => setSelectedPaymentMode(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="All">All Payment Modes</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI / QR</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl text-xs"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* BILLS TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Salesman</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-right">GST Total</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-center">Payment</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                    No matching invoices found in history.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-extrabold text-indigo-900 font-mono">
                      {bill.billNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(bill.date).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{bill.salesmanName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {bill.customerName ? (
                        <div>
                          <div className="font-semibold text-slate-800">{bill.customerName}</div>
                          <div className="text-[10px] text-slate-400">{bill.customerPhone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Walk-in</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {bill.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      ₹{bill.totalGstAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900 text-sm font-mono">
                      ₹{bill.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenBillModal(bill)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors flex items-center gap-1 mx-auto text-xs"
                      >
                        <Printer className="w-3.5 h-3.5" /> View / Reprint
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT / REPRINT INVOICE MODAL */}
      <InvoicePrintModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        bill={activeBill}
        storeConfig={storeConfig}
        isDuplicate={true}
      />
    </div>
  );
};
