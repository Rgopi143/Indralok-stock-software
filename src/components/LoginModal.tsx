import React, { useState } from 'react';
import { Lock, ArrowRight, Store, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ users, onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<User>(users[0] || null);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeUsers = users.filter((u) => u.active);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (selectedUser.pin && pin !== selectedUser.pin) {
      setErrorMsg('Incorrect 4-digit security PIN.');
      return;
    }

    onLogin(selectedUser);
  };

  const handleQuickDemoSelect = (u: User) => {
    setSelectedUser(u);
    setPin(u.pin || '1234');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-200/80 via-slate-100/90 to-slate-300/80 backdrop-blur-xl flex items-center justify-center p-4">
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[500px] bg-slate-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] max-w-md w-full overflow-hidden p-8 space-y-6">
        {/* Rich Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-16 h-16 bg-gradient-to-b from-slate-900 to-black text-white rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-slate-950/20 ring-4 ring-slate-100/80 transition-transform hover:scale-105 duration-300">
              <Store className="w-8 h-8 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 font-sans">
              Smart Barcode POS
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1 tracking-wide uppercase">
              Executive Terminal Access
            </p>
          </div>
        </div>

        {/* Account Selection Grid */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Select User Account
              </label>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {activeUsers.length} Counter Accounts
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {activeUsers.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickDemoSelect(u)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border-slate-950 shadow-xl shadow-slate-950/25 ring-2 ring-slate-950 ring-offset-2 scale-[1.02]'
                        : 'bg-slate-50/80 hover:bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 text-amber-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div>
                      <div className="font-black text-sm tracking-tight">{u.name.split(' ')[0]}</div>
                      <div
                        className={`text-[10px] capitalize font-bold tracking-wider mt-0.5 ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {u.role}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-white/10 text-slate-200 border border-white/10'
                            : 'bg-slate-200/70 text-slate-600'
                        }`}
                      >
                        PIN: {u.pin || '1234'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-4 border-t border-slate-100">
            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl font-bold text-xs text-center border border-rose-200/80 shadow-xs animate-shake">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">
                Security PIN Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="• • • •"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border-2 border-slate-200 focus:border-slate-950 focus:bg-white rounded-2xl font-mono text-center font-black text-lg text-slate-900 tracking-widest focus:ring-4 focus:ring-slate-900/10 focus:outline-none transition-all shadow-inner"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-black hover:to-black text-white font-black text-sm tracking-wide rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-slate-900/30 hover:shadow-2xl active:scale-[0.99] transition-all duration-200 cursor-pointer"
            >
              <span>Access Counter Terminal</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
