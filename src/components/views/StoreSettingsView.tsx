import React, { useState } from 'react';
import { Settings, Store, Save, CheckCircle2, Receipt, FileText } from 'lucide-react';
import { StoreConfig } from '../../types';

interface StoreSettingsViewProps {
  storeConfig: StoreConfig;
  onUpdateStoreConfig: (config: StoreConfig) => Promise<void>;
}

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({
  storeConfig,
  onUpdateStoreConfig,
}) => {
  const [formData, setFormData] = useState<StoreConfig>(storeConfig);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateStoreConfig(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 overflow-y-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-rose-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Store & Invoice Configuration</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Update store business information, GSTIN registration, invoice print headers, and terms & conditions.
          </p>
        </div>

        {isSaved && (
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4" /> Changes Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6 text-xs">
        {/* SECTION 1: BUSINESS IDENTITY */}
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2 mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-indigo-600" /> Store Profile & GSTIN
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Name (Header) *</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">GSTIN Registration No. *</label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">UPI VPA (for QR Payments)</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="storename@upi"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ADDRESS & LOCATION */}
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2 mb-4">
            Store Physical Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Address Line 1</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Address Line 2</label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">City, State & Pincode</label>
              <input
                type="text"
                value={formData.cityStatePincode}
                onChange={(e) => setFormData({ ...formData, cityStatePincode: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: INVOICE PRINT SETTINGS */}
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2 mb-4">
            Receipt Format & Terms
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Receipt Format</label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, receiptFormat: 'thermal_80mm' })}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                    formData.receiptFormat === 'thermal_80mm'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Receipt className="w-4 h-4" /> 80mm Thermal Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, receiptFormat: 'a4_full' })}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                    formData.receiptFormat === 'a4_full'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" /> A4 Standard Tax Invoice
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Invoice Footer Note</label>
              <input
                type="text"
                value={formData.invoiceFooterNote}
                onChange={(e) => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
                placeholder="Thank you for shopping!"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Terms & Conditions</label>
              <textarea
                rows={4}
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Save className="w-4 h-4" /> Save Store Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
