import React, { useState } from 'react';
import { Store, ArrowRight, UserCheck, KeyRound, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { User, StoreConfig } from '../types';

interface LoginPageProps {
  users: User[];
  storeConfig: StoreConfig;
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, storeConfig, onLogin }) => {
  const activeUsers = users.filter((u) => u.active);
  const [selectedUser, setSelectedUser] = useState<User>(activeUsers[0] || users[0]);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (selectedUser.pin && pin !== selectedUser.pin) {
      setErrorMsg('Incorrect 4-digit security PIN. Please check and try again.');
      return;
    }

    onLogin(selectedUser);
  };

  const handleSelectUser = (u: User) => {
    setSelectedUser(u);
    setPin(u.pin || '1234');
    setErrorMsg(null);
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden select-none font-sans text-slate-800">
      {/* Left 50%: Rich Indigo Hero Branding Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-indigo-900/50">
        {/* Glowing background ambient lights */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Store Logo & Header */}
        <div className="space-y-8 relative z-10 my-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-500/30 ring-4 ring-white/10 shrink-0">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight leading-none text-white font-sans">
                {storeConfig.storeName}
              </h1>
              <p className="text-xs text-amber-300 font-bold uppercase tracking-wider mt-1">
                Smart Barcode POS System
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-indigo-800/40">
            <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white font-sans">
              Fast, Reliable & Secure Retail Billing Software
            </h2>
            <p className="text-sm text-indigo-200/80 leading-relaxed max-w-lg">
              Streamline counter sales, automated GST invoicing, barcode generation, and real-time inventory management across all store counters.
            </p>
          </div>

          <div className="space-y-3.5 pt-4">
            <div className="flex items-center gap-3 text-sm text-indigo-100 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Instant Barcode Scanning & Express Billing (F2 / F4)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-indigo-100 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Thermal 80mm & Full A4 Tax Invoices</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-indigo-100 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Multi-Counter Staff Accounts & Commission Tracking</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-indigo-300/60 font-medium pt-8">
          © {new Date().getFullYear()} {storeConfig.storeName} • ScanBill POS System
        </div>
      </div>

      {/* Right 50%: Clean Light Login Form Panel */}
      <div className="lg:w-1/2 bg-slate-50/80 p-8 lg:p-16 flex flex-col justify-between overflow-y-auto">
        <div className="max-w-md mx-auto w-full my-auto space-y-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight font-sans">
              Counter Login
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-2">
              Select your user account and enter your security PIN to access the billing terminal.
            </p>
          </div>

          {/* Account Selector Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Select User Account
              </label>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
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
                    onClick={() => handleSelectUser(u)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-600 ring-offset-2 scale-[1.02]'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200/90 hover:border-indigo-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm tracking-tight">{u.name.split(' ')[0]}</span>
                        {u.role === 'admin' ? (
                          <ShieldAlert className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-amber-600'}`} />
                        ) : (
                          <UserCheck className={`w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`} />
                        )}
                      </div>
                      <div
                        className={`text-xs capitalize font-medium mt-1 ${
                          isSelected ? 'text-indigo-100' : 'text-slate-500'
                        }`}
                      >
                        {u.role} Counter
                      </div>
                    </div>
                    <span
                      className={`text-[10px] mt-3 font-mono font-bold px-2 py-0.5 rounded-md inline-block w-fit ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      PIN: {u.pin || '1234'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5 pt-2">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 text-rose-700 rounded-xl font-bold text-xs text-center border border-rose-200 shadow-xs">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Enter Security PIN
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 focus:border-indigo-600 rounded-2xl font-mono text-center font-black text-lg text-slate-900 tracking-widest focus:ring-4 focus:ring-indigo-600/10 focus:outline-none transition-all shadow-xs"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-sm tracking-wide rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/30 hover:shadow-2xl active:scale-[0.99] transition-all duration-200 cursor-pointer"
            >
              <span>Access Counter Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 font-medium pt-4">
            Authorized Store Staff Only • ScanBill POS Software
          </div>
        </div>
      </div>
    </div>
  );
};
