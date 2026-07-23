import React from 'react';
import {
  ShoppingCart,
  Package,
  Barcode,
  History,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  FileSpreadsheet,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../types';

export type ViewTab =
  | 'dashboard'
  | 'billing'
  | 'products'
  | 'barcode_studio'
  | 'bills'
  | 'reports'
  | 'salesmen'
  | 'store_settings'
  | 'users'
  | 'audit';

interface SidebarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  role: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role }) => {
  const navigationItems = [
    {
      id: 'billing' as ViewTab,
      label: 'Billing Counter',
      icon: ShoppingCart,
      badge: 'F2',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      adminOnly: false,
    },
    {
      id: 'dashboard' as ViewTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      adminOnly: false,
    },
    {
      id: 'products' as ViewTab,
      label: 'Product Registration',
      icon: Package,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      adminOnly: false,
    },
    {
      id: 'barcode_studio' as ViewTab,
      label: 'Barcode Studio',
      icon: Barcode,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      adminOnly: false,
    },
    {
      id: 'bills' as ViewTab,
      label: 'Bill Search & Reprint',
      icon: History,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      adminOnly: false,
    },
    {
      id: 'reports' as ViewTab,
      label: 'Sales & GST Reports',
      icon: BarChart3,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      adminOnly: false,
    },
    {
      id: 'salesmen' as ViewTab,
      label: 'Salesman Management',
      icon: Users,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      adminOnly: false,
    },
    {
      id: 'store_settings' as ViewTab,
      label: 'Store Configuration',
      icon: Settings,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      adminOnly: true,
    },
    {
      id: 'users' as ViewTab,
      label: 'User Accounts',
      icon: ShieldCheck,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      adminOnly: true,
    },
    {
      id: 'audit' as ViewTab,
      label: 'Backup & Audit Log',
      icon: FileSpreadsheet,
      color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Navigation
        </div>

        {navigationItems.map((item) => {
          if (item.adminOnly && role !== 'admin') return null;

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
              id={`nav-tab-${item.id}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg border ${
                    isActive ? 'bg-white/20 border-white/30 text-white' : item.color
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-300">
            {role === 'admin' ? 'Administrator' : 'Cashier Counter'}
          </span>
        </div>
        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
          Online
        </span>
      </div>
    </aside>
  );
};
