import React, { useState, useEffect } from 'react';
import {
  Store,
  UserCheck,
  LogOut,
  Maximize2,
  Minimize2,
  Keyboard,
  Clock,
  ShieldAlert,
  Sun,
  Moon,
} from 'lucide-react';
import { User, StoreConfig } from '../types';

interface NavbarProps {
  user: User;
  storeConfig: StoreConfig;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onLogout: () => void;
  onOpenShortcutsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  storeConfig,
  theme = 'light',
  onToggleTheme,
  onLogout,
  onOpenShortcutsModal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const isDark = theme === 'dark';

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
    <header
      className={`h-16 px-4 md:px-6 flex items-center justify-between z-30 select-none transition-colors border-b ${
        isDark
          ? 'bg-slate-900 text-white border-slate-800 shadow-md'
          : 'bg-white text-slate-900 border-slate-200 shadow-xs'
      }`}
    >
      {/* Left Store Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-black text-xl shadow-inner text-white tracking-wider border border-indigo-400/30">
          <Store className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`font-extrabold text-base tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {storeConfig.storeName}
            </h1>
          </div>
          <p className={`text-[11px] font-medium hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {storeConfig.tagline} • GSTIN: {storeConfig.gstin}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Clock */}
        <div
          className={`hidden lg:flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border ${
            isDark
              ? 'text-slate-300 bg-slate-800/80 border-slate-700/60'
              : 'text-slate-700 bg-slate-100 border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{timeStr}</span>
        </div>

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700/80 text-amber-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        )}

        {/* Shortcuts button */}
        <button
          onClick={onOpenShortcutsModal}
          className={`p-2 rounded-lg border transition-colors ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4 text-amber-500" />
        </button>

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded-lg border transition-colors ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700/80 text-slate-300 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* User Pill */}
        <div
          className={`flex items-center gap-2.5 pl-3 pr-1.5 py-1 rounded-xl border ${
            isDark
              ? 'bg-slate-800/90 border-slate-700'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className="text-right">
            <div className={`text-xs font-bold flex items-center justify-end gap-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              {user.name.split(' ')[0]}
              {user.role === 'admin' ? (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </div>
            <div className={`text-[10px] capitalize font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {user.role} Counter
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20"
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
