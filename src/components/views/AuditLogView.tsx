import React, { useState } from 'react';
import { FileSpreadsheet, Download, Upload, RotateCcw, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '../../types';
import { api } from '../../lib/api';

interface AuditLogViewProps {
  logs: AuditLog[];
  onDatabaseRestoredOrReset: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  logs,
  onDatabaseRestoredOrReset,
}) => {
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    window.open(api.downloadBackupUrl, '_blank');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const jsonContent = JSON.parse(evt.target?.result as string);
        await api.restoreDatabase(jsonContent);
        setUploadMsg('Database restored successfully from backup file!');
        onDatabaseRestoredOrReset();
        setTimeout(() => setUploadMsg(null), 3000);
      } catch (err) {
        alert('Failed to restore backup: Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDatabase = async () => {
    if (confirm('WARNING: Reset database to initial factory demo state? All current custom items will be restored to default.')) {
      await api.resetDatabase();
      setUploadMsg('Database re-seeded to initial demo data!');
      onDatabaseRestoredOrReset();
      setTimeout(() => setUploadMsg(null), 3000);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-100 overflow-y-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-slate-700" />
            <h2 className="text-xl font-extrabold text-slate-900">Database Backup & Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Download JSON data backups, restore store database, and review immutable audit logs.
          </p>
        </div>

        {uploadMsg && (
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" /> {uploadMsg}
          </div>
        )}
      </div>

      {/* BACKUP & RESTORE ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* DOWNLOAD BACKUP */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Download className="w-5 h-5 text-indigo-600" /> Download Full Backup
          </div>
          <p className="text-xs text-slate-500">
            Export all store settings, products, barcodes, salesmen, user accounts, and billing history to a single JSON backup.
          </p>
          <button
            onClick={handleDownloadBackup}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            Download POS Backup File
          </button>
        </div>

        {/* RESTORE FROM BACKUP */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Upload className="w-5 h-5 text-emerald-600" /> Restore Database
          </div>
          <p className="text-xs text-slate-500">
            Restore system state from a previously exported JSON backup file.
          </p>
          <label className="block w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors">
            Upload JSON Backup
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* RESET DATA */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <RotateCcw className="w-5 h-5 text-rose-600" /> Reset Demo State
          </div>
          <p className="text-xs text-slate-500">
            Re-seed application data back to default factory demo state.
          </p>
          <button
            onClick={handleResetDatabase}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            Re-seed Demo Data
          </button>
        </div>
      </div>

      {/* AUDIT TRAIL LOG */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" /> System Audit Logs ({logs.length})
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 text-xs font-bold uppercase sticky top-0 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 font-sans">{log.userName}</td>
                  <td className="py-3 px-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
