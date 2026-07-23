import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Percent,
  Award,
  ArrowRight,
  Clock,
  Printer,
  Sparkles,
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
} from 'recharts';
import { Bill, Salesman, StoreConfig } from '../../types';

interface DashboardViewProps {
  bills: Bill[];
  salesmen: Salesman[];
  storeConfig: StoreConfig;
  onNavigateToBilling: () => void;
  onNavigateToBillHistory: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bills,
  salesmen,
  storeConfig,
  onNavigateToBilling,
  onNavigateToBillHistory,
}) => {
  const todayStr = new Date().toDateString();

  const todayBills = bills.filter((b) => new Date(b.date).toDateString() === todayStr);

  const todaySales = todayBills.reduce((s, b) => s + b.grandTotal, 0);
  const todayBillCount = todayBills.length;
  const todayGst = todayBills.reduce((s, b) => s + b.totalGstAmount, 0);

  // Top Salesman today
  const salesmanSalesMap: Record<string, { name: string; total: number }> = {};
  todayBills.forEach((b) => {
    if (!salesmanSalesMap[b.salesmanId]) {
      salesmanSalesMap[b.salesmanId] = { name: b.salesmanName, total: 0 };
    }
    salesmanSalesMap[b.salesmanId].total += b.grandTotal;
  });

  const sortedSalesmen = Object.values(salesmanSalesMap).sort((a, b) => b.total - a.total);
  const topSalesmanToday = sortedSalesmen[0]?.name || 'N/A';

  // Recent 5 transactions
  const recentBills = bills.slice(0, 5);

  // Hourly Sales Trend Today or last 7 days
  const past7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const dayBills = bills.filter((b) => new Date(b.date).toDateString() === dayStr);
    const dayTotal = dayBills.reduce((s, b) => s + b.grandTotal, 0);

    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      sales: dayTotal,
      count: dayBills.length,
    };
  });

  // Payment Breakdown
  const paymentMap: Record<string, number> = {};
  todayBills.forEach((b) => {
    const pm = b.paymentMethod.toUpperCase();
    paymentMap[pm] = (paymentMap[pm] || 0) + b.grandTotal;
  });

  const pieData = Object.entries(paymentMap).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899'];

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 overflow-y-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Executive POS Dashboard</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time daily checkout performance, revenue metrics, and recent sales invoices.
          </p>
        </div>

        <button
          onClick={onNavigateToBilling}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
        >
          <Receipt className="w-4 h-4" /> Open Billing Counter (F2)
        </button>
      </div>

      {/* TODAY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Today's Revenue
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
              {storeConfig.currencySymbol}
              {todaySales.toFixed(2)}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Bills Issued Today
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
              {todayBillCount}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Today's GST Tax
            </span>
            <span className="text-2xl font-extrabold text-indigo-900 font-mono mt-1 block">
              {storeConfig.currencySymbol}
              {todayGst.toFixed(2)}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Top Salesman Today
            </span>
            <span className="text-base font-extrabold text-slate-900 mt-1 block line-clamp-1">
              {topSalesmanToday}
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7 DAYS SALES BAR CHART */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">7-Day Sales Performance</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={past7DaysData}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Bar dataKey="sales" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Sales ₹" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PAYMENT BREAKDOWN PIE */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Today's Payment Modes</h3>
          {pieData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-slate-400">
              No transactions recorded today yet.
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    label
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Recent Checkout Transactions
          </div>
          <button
            onClick={onNavigateToBillHistory}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All Bills <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Salesman</th>
                <th className="py-3 px-4 text-right">Items</th>
                <th className="py-3 px-4 text-right">GST</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentBills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-extrabold text-indigo-900 font-mono">
                    {b.billNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(b.date).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{b.salesmanName}</td>
                  <td className="py-3 px-4 text-right font-bold">{b.items.length}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    ₹{b.totalGstAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900 font-mono">
                    ₹{b.grandTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {b.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
