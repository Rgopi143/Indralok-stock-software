import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Key, UserCheck, ShieldAlert, X, Edit2 } from 'lucide-react';
import { User, UserRole } from '../../types';

interface UserManagementViewProps {
  users: User[];
  onSaveUser: (userData: Partial<User>) => Promise<void>;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ users, onSaveUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('cashier');
  const [formPin, setFormPin] = useState('1234');
  const [formActive, setFormActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormName('');
    setFormRole('cashier');
    setFormPin('1234');
    setFormActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormUsername(u.username);
    setFormName(u.name);
    setFormRole(u.role);
    setFormPin(u.pin || '1234');
    setFormActive(u.active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formName.trim()) {
      setErrorMsg('Username and Name are required.');
      return;
    }

    try {
      await onSaveUser({
        ...(editingUser ? { id: editingUser.id } : {}),
        username: formUsername.trim().toLowerCase(),
        name: formName.trim(),
        role: formRole,
        pin: formPin.trim(),
        active: formActive,
      });
      setIsModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to save user account.');
      }
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 overflow-y-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900">User Accounts & Access Roles</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage system login accounts, define Cashier vs Administrator privileges, and PIN security.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Create User Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    u.role === 'admin'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-indigo-100 text-indigo-900'
                  }`}
                >
                  {u.role === 'admin' ? (
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{u.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(u)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Access Role</span>
                <span className="font-extrabold text-slate-900 uppercase tracking-wider">{u.role}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Security PIN</span>
                <span className="font-mono font-bold text-slate-700">•••• ({u.pin || '1234'})</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {editingUser ? 'Edit User Account' : 'Create User Account'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-semibold border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="e.g. cashier1"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">User Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">4-Digit Security PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    placeholder="1234"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="u-active"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="u-active" className="font-bold text-slate-700">
                  Account Active
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 font-bold rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
