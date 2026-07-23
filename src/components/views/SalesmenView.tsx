import React, { useState } from 'react';
import { Users, Plus, Edit2, Phone, Award, ShieldCheck, X } from 'lucide-react';
import { Salesman } from '../../types';

interface SalesmenViewProps {
  salesmen: Salesman[];
  onSaveSalesman: (salesman: Partial<Salesman>) => Promise<void>;
}

export const SalesmenView: React.FC<SalesmenViewProps> = ({ salesmen, onSaveSalesman }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalesman, setEditingSalesman] = useState<Salesman | null>(null);

  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formComm, setFormComm] = useState<number>(2.0);
  const [formActive, setFormActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingSalesman(null);
    setFormName('');
    setFormCode(`SM-0${salesmen.length + 1}`);
    setFormPhone('');
    setFormComm(2.0);
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Salesman) => {
    setEditingSalesman(s);
    setFormName(s.name);
    setFormCode(s.code);
    setFormPhone(s.phone);
    setFormComm(s.commissionPercent);
    setFormActive(s.active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSalesman({
      ...(editingSalesman ? { id: editingSalesman.id } : {}),
      name: formName.trim(),
      code: formCode.trim(),
      phone: formPhone.trim(),
      commissionPercent: Number(formComm),
      active: formActive,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 overflow-y-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Salesman Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain sales staff records, assign employee IDs, and set incentive commission rates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Salesman
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salesmen.map((s) => (
          <div
            key={s.id}
            className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-extrabold text-sm">
                  {s.code}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{s.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {s.phone || 'No Phone'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(s)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Incentive Commission
                </span>
                <span className="font-extrabold text-indigo-900">{s.commissionPercent}% per sale</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {s.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {editingSalesman ? 'Edit Salesman Record' : 'Add New Salesman'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Salesman Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Anil Kumar"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="SM-01"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={formComm}
                    onChange={(e) => setFormComm(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Mobile Number"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="s-active"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="s-active" className="font-bold text-slate-700">
                  Active Status
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
                  Save Salesman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
