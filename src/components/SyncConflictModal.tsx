import React, { useState } from 'react';
import { DataConflictItem } from '../services/dataSyncDeduplicator';
import { 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  ShieldAlert, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Users,
  GraduationCap,
  Building2,
  FileText
} from 'lucide-react';

interface SyncConflictModalProps {
  isOpen: boolean;
  conflicts: DataConflictItem[];
  duplicateCount: number;
  onConfirmOverwrite: () => void;
  onKeepCurrent: () => void;
  onCancel: () => void;
}

export const SyncConflictModal: React.FC<SyncConflictModalProps> = ({
  isOpen,
  conflicts,
  duplicateCount,
  onConfirmOverwrite,
  onKeepCurrent,
  onCancel,
}) => {
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(conflicts[0]?.id || null);

  if (!isOpen) return null;

  const filteredConflicts = conflicts.filter((c) => 
    selectedModule === 'ALL' || c.module === selectedModule
  );

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'pegawai':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'siswa':
        return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      case 'sarpras':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Deteksi Konflik Data & Validasi ID Ganda
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                Ditemukan perbedaan data atau ID yang sama antara Google Spreadsheet dan Aplikasi Web
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Summary Banner */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Terdeteksi <strong>{conflicts.length} entitas berkonflik</strong> dan <strong>{duplicateCount} baris bertumpuk</strong> pada dataset spreadsheet.
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <span className="bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md text-[11px]">
              Tindakan: Timpa Data Lama (Rekomendasi)
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedModule('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedModule === 'ALL'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua ({conflicts.length})
            </button>
            <button
              onClick={() => setSelectedModule('pegawai')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedModule === 'pegawai'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Pegawai ({conflicts.filter((c) => c.module === 'pegawai').length})
            </button>
            <button
              onClick={() => setSelectedModule('siswa')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedModule === 'siswa'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Siswa ({conflicts.filter((c) => c.module === 'siswa').length})
            </button>
            <button
              onClick={() => setSelectedModule('sarpras')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedModule === 'sarpras'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Sarpras ({conflicts.filter((c) => c.module === 'sarpras').length})
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Klik baris untuk melihat perbedaan nilai
          </span>
        </div>

        {/* Conflict List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredConflicts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Tidak ada konflik terdeteksi pada kategori ini.
            </div>
          ) : (
            filteredConflicts.map((c) => {
              const isExpanded = expandedId === c.id;
              return (
                <div
                  key={c.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs transition-all"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between gap-3 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                        {getModuleIcon(c.module)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{c.entityName}</span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-200/80 px-1.5 py-0.2 rounded">
                            ID: {c.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {c.moduleLabel} • <span className="text-amber-800 font-bold">{c.diffs.length} atribut berbeda</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        ID Ganda / Berbeda
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Diff Comparison Table */}
                  {isExpanded && (
                    <div className="p-3.5 border-t border-slate-200 bg-white">
                      <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          <tr>
                            <th className="py-2 px-3 w-1/4">Atribut / Kolom</th>
                            <th className="py-2 px-3 w-3/8 text-rose-700 bg-rose-50/60">
                              Data Lama (Sistem Web)
                            </th>
                            <th className="py-2 px-3 w-3/8 text-emerald-800 bg-emerald-50/60">
                              Data Baru (Spreadsheet)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {c.diffs.map((d, i) => (
                            <tr key={i} className="hover:bg-slate-50/60">
                              <td className="py-2 px-3 font-semibold text-slate-800">
                                {d.label}
                              </td>
                              <td className="py-2 px-3 text-rose-800 bg-rose-50/30 font-medium">
                                {String(d.oldValue)}
                              </td>
                              <td className="py-2 px-3 text-emerald-900 bg-emerald-50/30 font-bold">
                                {String(d.newValue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            Menimpa data lama akan menghapus baris bertumpuk dan menyamakan data web dengan spreadsheet.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer flex-1 sm:flex-initial"
            >
              Batal
            </button>

            <button
              onClick={onKeepCurrent}
              className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer flex-1 sm:flex-initial"
              title="Abaikan perbedaan data dan pertahankan isi web saat ini"
            >
              Pertahankan Web
            </button>

            <button
              onClick={onConfirmOverwrite}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex-1 sm:flex-initial flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Timpa Data Lama (Rekomendasi)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
