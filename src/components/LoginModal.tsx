import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, Lock, ArrowRight, Store } from 'lucide-react';
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
      setErrorMsg('Incorrect 4-digit PIN code.');
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
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Banner */}
        <div className="bg-slate-900 text-white p-8 text-center space-y-2">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl text-amber-300 shadow-lg border border-indigo-400/30">
            <Store className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Smart Barcode POS System</h2>
          <p className="text-xs text-slate-300">Select user account & enter security PIN to log in</p>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Quick Select User Account
            </label>
            <div className="grid grid-cols-2 gap-2">
              {activeUsers.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickDemoSelect(u)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-xs">{u.name.split(' ')[0]}</div>
                      <div
                        className={`text-[10px] capitalize ${
                          isSelected ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {u.role}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] mt-2 font-mono ${
                        isSelected ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      PIN: {u.pin || '1234'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2 border-t text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold text-center border border-rose-200">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Enter Security PIN</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl font-mono text-center font-extrabold text-base focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <span>Access Counter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
