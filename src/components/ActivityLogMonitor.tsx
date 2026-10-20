import React, { useState, useEffect } from 'react';
import { ActivityLog, UserRole } from '../types';
import { 
  getActivityLogs, 
  clearActivityLogs, 
  exportLogsToCSV 
} from '../services/logger';
import { 
  ShieldCheck, 
  GraduationCap, 
  Eye, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  RefreshCw, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Layers,
  Database,
  ArrowUpDown
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface ActivityLogMonitorProps {
  currentUserRole?: UserRole;
}

export const ActivityLogMonitor: React.FC<ActivityLogMonitorProps> = ({
  currentUserRole = 'admin',
}) => {
  const [logs, setLogs] = useState<ActivityLog[]>(() => getActivityLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Reload logs from localStorage
  const refreshLogs = () => {
    setLogs(getActivityLogs());
  };

  useEffect(() => {
    refreshLogs();
    // Also listen to storage events if multiple tabs are open
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sim_kdr1_activity_logs') {
        refreshLogs();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClear = () => {
    clearActivityLogs();
    refreshLogs();
    setShowClearConfirm(false);
  };

  const handleExport = () => {
    exportLogsToCSV(filteredLogs);
  };

  // Filtered Logs
  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userNip && log.userNip.includes(searchTerm)) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchRole = roleFilter === 'ALL' || log.role === roleFilter;

    return matchSearch && matchCategory && matchAction && matchRole;
  });

  // Summary counts
  const totalLogs = logs.length;
  const loginCount = logs.filter((l) => l.action === 'LOGIN').length;
  const hapusCount = logs.filter((l) => l.action === 'HAPUS').length;
  const tambahSuratCount = logs.filter((l) => l.category === 'SURAT' && l.action === 'TAMBAH').length;
  const mutasiCount = logs.filter((l) => l.action === 'TAMBAH' || l.action === 'UBAH').length;

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Log Aktivitas & Audit Perubahan Data Pengguna
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Database className="w-3 h-3 text-emerald-600" />
                  Tersimpan di localStorage
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-500">
                  Pencatatan aktivitas login, hapus data, tambah surat, dan manipulasi data SIM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={refreshLogs}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Muat ulang log aktivitas dari localStorage"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Unduh log aktivitas terpilih ke format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV ({filteredLogs.length})</span>
          </button>

          {currentUserRole === 'admin' && (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Bersihkan seluruh rekaman log dari localStorage"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Log</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Catatan</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalLogs}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Semua jejak audit</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Aktivitas Login</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-800">{loginCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Sesi masuk pengguna</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Hapus Data</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">{hapusCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Penghapusan data arsip</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Tambah Surat</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-800">{tambahSuratCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Surat masuk & keluar baru</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari deskripsi, nama pengguna, atau NIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto text-xs">
          {/* Action Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Aksi:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Aksi</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="TAMBAH">TAMBAH</option>
              <option value="UBAH">UBAH</option>
              <option value="HAPUS">HAPUS</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Kategori:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="AUTENTIKASI">Autentikasi</option>
              <option value="SURAT">Persuratan</option>
              <option value="SISWA">Kesiswaan</option>
              <option value="RAPOR">Rapor & BTQ</option>
              <option value="PEGAWAI">Kepegawaian</option>
              <option value="SARPRAS">Sarpras</option>
              <option value="SISTEM">Sistem</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Peran:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="ALL">Semua Peran</option>
              <option value="admin">Administrator</option>
              <option value="guru">Guru</option>
              <option value="guest">Guest / Tamu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-40">Waktu & Tanggal</th>
                <th className="px-4 py-3 w-48">Pengguna & Peran</th>
                <th className="px-4 py-3 w-28">Aksi</th>
                <th className="px-4 py-3 w-32">Kategori</th>
                <th className="px-4 py-3">Deskripsi Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium">Tidak ada rekaman log yang sesuai dengan filter.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Aktivitas login, hapus data, dan tambah surat akan otomatis tercatat di sini.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let actionBadgeClass = 'bg-slate-100 text-slate-800 border-slate-200';
                  if (log.action === 'HAPUS') {
                    actionBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold';
                  } else if (log.action === 'TAMBAH') {
                    actionBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
                  } else if (log.action === 'UBAH') {
                    actionBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                  } else if (log.action === 'LOGIN') {
                    actionBadgeClass = 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
                  } else if (log.action === 'LOGOUT') {
                    actionBadgeClass = 'bg-slate-200 text-slate-700 border-slate-300 font-medium';
                  }

                  let roleBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                  let roleIcon = <Eye className="w-3 h-3 text-slate-500" />;
                  if (log.role === 'admin') {
                    roleBadgeClass = 'bg-purple-100 text-purple-800 border-purple-200 font-bold';
                    roleIcon = <ShieldCheck className="w-3 h-3 text-purple-700" />;
                  } else if (log.role === 'guru') {
                    roleBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
                    roleIcon = <GraduationCap className="w-3 h-3 text-emerald-700" />;
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
                      </td>

                      {/* User & Role */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span className="truncate max-w-[170px]" title={log.userName}>
                              {log.userName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border uppercase ${roleBadgeClass}`}
                            >
                              {roleIcon}
                              <span>{log.role}</span>
                            </span>
                            {log.userNip && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                NIP: {log.userNip}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] border uppercase tracking-wider ${actionBadgeClass}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                          {log.category}
                        </span>
                      </td>

                      {/* Description & Details */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-slate-900 font-medium leading-relaxed">
                            {log.description}
                          </p>
                          {log.details && (
                            <p className="text-[11px] text-slate-500 mt-0.5 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 inline-block">
                              {log.details}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan <strong>{filteredLogs.length}</strong> dari total <strong>{logs.length}</strong> aktivitas pengguna.
          </div>
          <div className="text-[11px] text-slate-400">
            Penyimpanan: Web LocalStorage (`sim_kdr1_activity_logs`)
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Bersihkan Seluruh Log Aktivitas?"
        message="Tindakan ini akan menghapus semua riwayat catatan audit aktivitas pengguna yang tersimpan di localStorage browser ini. Apakah Anda yakin ingin melanjutkan?"
        confirmText="Ya, Bersihkan Log"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
