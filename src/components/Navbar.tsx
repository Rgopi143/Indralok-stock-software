import React, { useState, useEffect } from 'react';
import {
  Store,
  UserCheck,
  LogOut,
  Maximize2,
  Minimize2,
  Keyboard,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { User, StoreConfig } from '../types';

interface NavbarProps {
  user: User;
  storeConfig: StoreConfig;
  onLogout: () => void;
  onOpenShortcutsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  storeConfig,
  onLogout,
  onOpenShortcutsModal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' • ' +
          now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.debug(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.debug(err));
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="bg-slate-900 text-white h-16 px-4 md:px-6 flex items-center justify-between shadow-md border-b border-slate-800 z-30 select-none">
      {/* Left Store Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-black text-xl shadow-inner text-white tracking-wider border border-indigo-400/30">
          <Store className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base tracking-tight leading-none text-white">
              {storeConfig.storeName}
            </h1>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              POS v2.5
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            {storeConfig.tagline} • GSTIN: {storeConfig.gstin}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{timeStr}</span>
        </div>

        {/* Shortcuts button */}
        <button
          onClick={onOpenShortcutsModal}
          className="p-2 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">Shortcuts</span>
        </button>

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 bg-slate-800/90 pl-3 pr-1.5 py-1 rounded-xl border border-slate-700">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-100 flex items-center justify-end gap-1">
              {user.name.split(' ')[0]}
              {user.role === 'admin' ? (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <div className="text-[10px] text-slate-400 capitalize font-medium">{user.role} Counter</div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors border border-red-500/30"
            title="Switch User / Logout"
            id="logout-btn"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
