import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Users,
  Receipt,
  CreditCard,
  PieChart as PieIcon,
  FileSpreadsheet,
  TrendingUp,
  Download,
  DollarSign,
  Percent,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Bill, Salesman, StoreConfig } from '../../types';

interface ReportsViewProps {
  bills: Bill[];
  salesmen: Salesman[];
  storeConfig: StoreConfig;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ bills, salesmen, storeConfig }) => {
  const [activeReportTab, setActiveReportTab] = useState<
    'sales_summary' | 'salesman' | 'gst' | 'payment_mode'
  >('sales_summary');

  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('7days');

  // Filter bills by dateRange
  const now = new Date();
  const filteredBills = bills.filter((b) => {
    const billDate = new Date(b.date);
    if (dateRange === 'today') {
      return billDate.toDateString() === now.toDateString();
    }
    if (dateRange === '7days') {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      return billDate >= past7;
    }
    if (dateRange === '30days') {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      return billDate >= past30;
    }
    return true;
  });

  // Totals
  const totalSales = filteredBills.reduce((s, b) => s + b.grandTotal, 0);
  const totalBillsCount = filteredBills.length;
  const totalGstCollected = filteredBills.reduce((s, b) => s + b.totalGstAmount, 0);
  const totalTaxableValue = filteredBills.reduce((s, b) => s + b.totalTaxableValue, 0);

  // Salesman Performance Data
  const salesmanStats = salesmen.map((s) => {
    const salesmanBills = filteredBills.filter((b) => b.salesmanId === s.id);
    const revenue = salesmanBills.reduce((sum, b) => sum + b.grandTotal, 0);
    const gst = salesmanBills.reduce((sum, b) => sum + b.totalGstAmount, 0);
    const estimatedCommission = (revenue * (s.commissionPercent || 0)) / 100;

    return {
      id: s.id,
      name: s.name,
      code: s.code,
      billCount: salesmanBills.length,
      revenue,
      gst,
      commissionPercent: s.commissionPercent,
      estimatedCommission,
    };
  });

  // GST Slab Breakdown (5%, 12%, 18%, 28%)
  const gstSlabs: Record<number, { taxable: number; cgst: number; sgst: number; totalGst: number }> = {
    5: { taxable: 0, cgst: 0, sgst: 0, totalGst: 0 },
    12: { taxable: 0, cgst: 0, sgst: 0, totalGst: 0 },
    18: { taxable: 0, cgst: 0, sgst: 0, totalGst: 0 },
    28: { taxable: 0, cgst: 0, sgst: 0, totalGst: 0 },
  };

  filteredBills.forEach((b) => {
    b.items.forEach((item) => {
      const slab = item.gstPercent;
      if (!gstSlabs[slab]) {
        gstSlabs[slab] = { taxable: 0, cgst: 0, sgst: 0, totalGst: 0 };
      }
      gstSlabs[slab].taxable += item.taxableValue;
      gstSlabs[slab].cgst += item.cgstAmount;
      gstSlabs[slab].sgst += item.sgstAmount;
      gstSlabs[slab].totalGst += item.totalGstAmount;
    });
  });

  // Payment Mode Data
  const paymentModeDataMap: Record<string, number> = {};
  filteredBills.forEach((b) => {
    const pm = b.paymentMethod.toUpperCase();
    paymentModeDataMap[pm] = (paymentModeDataMap[pm] || 0) + b.grandTotal;
  });

  const paymentChartData = Object.entries(paymentModeDataMap).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];

  // Export Report to CSV
  const exportReportCsv = () => {
    let rows: string[][] = [];
    let filename = `report_${activeReportTab}_${dateRange}.csv`;

    if (activeReportTab === 'salesman') {
      rows = [
        ['Salesman Code', 'Salesman Name', 'Total Bills', 'Total Sales (₹)', 'GST Generated (₹)', 'Commission %', 'Est. Commission (₹)'],
        ...salesmanStats.map((s) => [
          s.code,
          `"${s.name}"`,
          String(s.billCount),
          s.revenue.toFixed(2),
          s.gst.toFixed(2),
          `${s.commissionPercent}%`,
          s.estimatedCommission.toFixed(2),
        ]),
      ];
    } else if (activeReportTab === 'gst') {
      rows = [
        ['GST Slab Rate (%)', 'Taxable Amount (₹)', 'CGST Amount (₹)', 'SGST Amount (₹)', 'Total GST (₹)'],
        ...Object.entries(gstSlabs).map(([slab, d]) => [
          `${slab}%`,
          d.taxable.toFixed(2),
          d.cgst.toFixed(2),
          d.sgst.toFixed(2),
          d.totalGst.toFixed(2),
        ]),
      ];
    } else {
      rows = [
        ['Invoice Number', 'Date', 'Salesman', 'Taxable (₹)', 'GST (₹)', 'Grand Total (₹)', 'Payment Method'],
        ...filteredBills.map((b) => [
          b.billNumber,
          new Date(b.date).toLocaleDateString('en-IN'),
          `"${b.salesmanName}"`,
          b.totalTaxableValue.toFixed(2),
          b.totalGstAmount.toFixed(2),
          b.grandTotal.toFixed(2),
          b.paymentMethod.toUpperCase(),
        ]),
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
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
            <BarChart3 className="w-6 h-6 text-teal-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Comprehensive Sales Reports</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business performance analytics, salesman commissions, and GST compliance audit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold">
            {(['today', '7days', '30days', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  dateRange === range
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : range}
              </button>
            ))}
          </div>

          <button
            onClick={exportReportCsv}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export Report CSV
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
              {storeConfig.currencySymbol}
              {totalSales.toFixed(2)}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Bills Generated
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
              {totalBillsCount}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              GST Collected
            </span>
            <span className="text-2xl font-extrabold text-indigo-900 font-mono mt-1 block">
              {storeConfig.currencySymbol}
              {totalGstCollected.toFixed(2)}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Taxable Value
            </span>
            <span className="text-2xl font-extrabold text-slate-800 font-mono mt-1 block">
              {storeConfig.currencySymbol}
              {totalTaxableValue.toFixed(2)}
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* REPORT SUB TABS */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2 overflow-x-auto">
          {[
            { id: 'sales_summary', label: 'Sales Overview', icon: BarChart3 },
            { id: 'salesman', label: 'Salesman Commission', icon: Users },
            { id: 'gst', label: 'GST Tax Collection', icon: Percent },
            { id: 'payment_mode', label: 'Payment Distribution', icon: PieIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReportTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id as typeof activeReportTab)}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* TAB 1: SALES OVERVIEW */}
          {activeReportTab === 'sales_summary' && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 text-sm">Revenue Trend</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredBills.slice(0, 15).map((b) => ({
                      name: b.billNumber.replace('INV-2026-', '#'),
                      amount: b.grandTotal,
                      gst: b.totalGstAmount,
                    }))}
                  >
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                    <YAxis stroke="#64748B" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Grand Total ₹" />
                    <Bar dataKey="gst" fill="#F59E0B" radius={[6, 6, 0, 0]} name="GST ₹" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 2: SALESMAN PERFORMANCE */}
          {activeReportTab === 'salesman' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Salesman Name</th>
                    <th className="py-3 px-4 text-center">Bills Handled</th>
                    <th className="py-3 px-4 text-right">Total Revenue Generated</th>
                    <th className="py-3 px-4 text-right">GST Generated</th>
                    <th className="py-3 px-4 text-center">Comm. Rate</th>
                    <th className="py-3 px-4 text-right">Est. Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {salesmanStats.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{s.code}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">{s.name}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {s.billCount}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-indigo-900 font-mono">
                        ₹{s.revenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        ₹{s.gst.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-700">
                        {s.commissionPercent}%
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-700 font-mono text-sm">
                        ₹{s.estimatedCommission.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: GST COLLECTION BREAKDOWN */}
          {activeReportTab === 'gst' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                GST Tax Summary breakdown categorized by tax slab percentage (CGST = GST/2, SGST = GST/2).
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">GST Tax Slab</th>
                      <th className="py-3 px-4 text-right">Taxable Goods Value</th>
                      <th className="py-3 px-4 text-right">CGST Collected (Central)</th>
                      <th className="py-3 px-4 text-right">SGST Collected (State)</th>
                      <th className="py-3 px-4 text-right">Total GST Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-mono">
                    {Object.entries(gstSlabs).map(([slab, data]) => (
                      <tr key={slab} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-extrabold text-slate-900 text-sm font-sans">
                          {slab}% GST Slab
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-700">
                          ₹{data.taxable.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          ₹{data.cgst.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          ₹{data.sgst.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-amber-700 text-sm">
                          ₹{data.totalGst.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT DISTRIBUTION */}
          {activeReportTab === 'payment_mode' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {paymentChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Payment Method Revenue Breakdown</h4>
                <div className="space-y-2 text-xs">
                  {paymentChartData.map((item, idx) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{item.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
