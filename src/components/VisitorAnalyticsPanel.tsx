import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Filter, 
  Search, 
  Download, 
  Smartphone, 
  Laptop, 
  Tablet, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  GraduationCap, 
  Eye, 
  Sparkles,
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  getAllVisitorLogs, 
  getDailyVisitorStats, 
  getVisitorSummary, 
  exportVisitorLogsToCSV, 
  DailyVisitorStat 
} from '../services/visitorTracker';
import { VisitorLog, UserRole } from '../types';

interface VisitorAnalyticsPanelProps {
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onClose?: () => void;
}

export const VisitorAnalyticsPanel: React.FC<VisitorAnalyticsPanelProps> = ({
  onNotify = () => {},
  onClose,
}) => {
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('14');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [deviceFilter, setDeviceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Load summary and daily stats
  const summary = useMemo(() => getVisitorSummary(), [refreshKey]);
  const dailyStats = useMemo(() => getDailyVisitorStats(parseInt(timeRange, 10)), [timeRange, refreshKey]);
  const allLogs = useMemo(() => getAllVisitorLogs(), [refreshKey]);

  // Max value in daily stats for relative bar height
  const maxDaily = useMemo(() => {
    return Math.max(...dailyStats.map((s) => s.total), 1);
  }, [dailyStats]);

  // Filter logs for table
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      // Role filter
      if (roleFilter !== 'ALL' && log.role !== roleFilter) return false;

      // Device filter
      if (deviceFilter !== 'ALL' && log.deviceType !== deviceFilter) return false;

      // Date filter
      if (selectedDate !== 'ALL' && log.date !== selectedDate) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = log.userName.toLowerCase().includes(q);
        const matchId = (log.identifier || '').toLowerCase().includes(q);
        const matchRombel = (log.rombel || '').toLowerCase().includes(q);
        const matchPage = log.pageVisited.toLowerCase().includes(q);
        const matchDevice = log.device.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRombel && !matchPage && !matchDevice) {
          return false;
        }
      }

      return true;
    });
  }, [allLogs, roleFilter, deviceFilter, selectedDate, searchQuery]);

  const handleExportCSV = () => {
    exportVisitorLogsToCSV(filteredLogs);
    onNotify(`Berhasil mengekspor ${filteredLogs.length} data kunjungan ke format CSV!`, 'success');
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    onNotify('Data analisis pengunjung berhasil dimuat ulang!', 'info');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-700" />
            <span>Admin</span>
          </span>
        );
      case 'guru':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <GraduationCap className="w-3 h-3 text-emerald-700" />
            <span>Guru & GTK</span>
          </span>
        );
      case 'siswa':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
            <Users className="w-3 h-3 text-blue-700" />
            <span>Siswa</span>
          </span>
        );
      case 'guest':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
            <Eye className="w-3 h-3 text-slate-600" />
            <span>Guest / Publik</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-emerald-800/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Modul Analisis Akses Web • Administrator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Data Analisis & Rekapitulasi Pengunjung Web
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Pantau siapa saja yang telah mengunjungi web SIM SDN Kedungringin 1 Beji beserta jumlah pengunjung tiap harinya secara terperinci dan transparan.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-all cursor-pointer border border-white/15"
              title="Segarkan data analisis"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Segarkan</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Rekap (CSV)</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Hari Ini */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kunjungan Hari Ini</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{summary.todayVisits}</span>
            <span className="text-[11px] text-slate-500 font-medium">sesi</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-emerald-700 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Kemarin: {summary.yesterdayVisits} sesi</span>
          </div>
        </div>

        {/* Card 2: Pengunjung Guru */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Guru & GTK</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{summary.roleCounts.guru}</span>
            <span className="text-[11px] text-slate-500 font-medium">sesi</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">11 Pegawai resmi aktif</p>
        </div>

        {/* Card 3: Pengunjung Siswa */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Siswa Terdaftar</span>
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{summary.roleCounts.siswa}</span>
            <span className="text-[11px] text-slate-500 font-medium">sesi</span>
          </div>
          <p className="mt-2 text-[11px] text-blue-700 font-medium">Akses Kelas 1 - Kelas 6</p>
        </div>

        {/* Card 4: Pengunjung Guest / Tamu */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Guest & Publik</span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{summary.roleCounts.guest}</span>
            <span className="text-[11px] text-slate-500 font-medium">sesi</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Wali murid & masyarakat</p>
        </div>

        {/* Card 5: Total Akumulasi */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Kunjungan</span>
            <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{summary.totalVisits}</span>
            <span className="text-[11px] text-slate-500 font-medium">total</span>
          </div>
          <p className="mt-2 text-[11px] text-purple-700 font-medium">{summary.uniqueUsersCount} Pengguna unik</p>
        </div>
      </div>

      {/* Daily Visitor Traffic Chart (Berapa jumlah pengunjung tiap harinya) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              <span>Grafik Jumlah Pengunjung Tiap Harinya</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi tren kunjungan harian web SIM SDN Kedungringin 1 Beji berdasarkan kelompok peran.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Rentang:</span>
            {(['7', '14', '30'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {r} Hari
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
            <span>Guru & GTK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            <span>Siswa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
            <span>Guest / Tamu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-600 inline-block" />
            <span>Admin</span>
          </div>
          <span className="text-[11px] text-slate-400 ml-auto italic">
            Klik salah satu batang tanggal untuk memfilter tabel di bawah
          </span>
        </div>

        {/* Interactive Bar Chart Visualization */}
        <div className="pt-4 pb-2 overflow-x-auto">
          <div className="min-w-[650px] flex items-end gap-2.5 sm:gap-3 h-56 px-2">
            {dailyStats.map((stat, idx) => {
              const isSelected = selectedDate === stat.date;
              const barHeightPercent = Math.max(Math.round((stat.total / maxDaily) * 100), 10);

              const guruPercent = stat.total > 0 ? (stat.guru / stat.total) * 100 : 0;
              const siswaPercent = stat.total > 0 ? (stat.siswa / stat.total) * 100 : 0;
              const guestPercent = stat.total > 0 ? (stat.guest / stat.total) * 100 : 0;
              const adminPercent = stat.total > 0 ? (stat.admin / stat.total) * 100 : 0;

              return (
                <div
                  key={stat.date}
                  onClick={() => setSelectedDate(isSelected ? 'ALL' : stat.date)}
                  className={`flex-1 flex flex-col items-center justify-end h-full cursor-pointer group transition-all p-1 rounded-xl ${
                    isSelected ? 'bg-emerald-50 ring-2 ring-emerald-600' : 'hover:bg-slate-50'
                  }`}
                  title={`${stat.dateLabel}: Total ${stat.total} Kunjungan (Guru: ${stat.guru}, Siswa: ${stat.siswa}, Guest: ${stat.guest}, Admin: ${stat.admin})`}
                >
                  {/* Tooltip on hover */}
                  <span className="text-[10px] font-black text-slate-800 mb-1 group-hover:scale-110 transition-transform">
                    {stat.total}
                  </span>

                  {/* Stacked Bar Container */}
                  <div 
                    className="w-full max-w-[28px] rounded-t-lg overflow-hidden flex flex-col justify-end transition-all shadow-xs group-hover:brightness-105"
                    style={{ height: `${barHeightPercent}%` }}
                  >
                    {/* Admin segment */}
                    {adminPercent > 0 && (
                      <div style={{ height: `${adminPercent}%` }} className="bg-purple-600 w-full" />
                    )}
                    {/* Guest segment */}
                    {guestPercent > 0 && (
                      <div style={{ height: `${guestPercent}%` }} className="bg-amber-400 w-full" />
                    )}
                    {/* Siswa segment */}
                    {siswaPercent > 0 && (
                      <div style={{ height: `${siswaPercent}%` }} className="bg-blue-500 w-full" />
                    )}
                    {/* Guru segment */}
                    {guruPercent > 0 && (
                      <div style={{ height: `${guruPercent}%` }} className="bg-emerald-600 w-full" />
                    )}
                  </div>

                  {/* Day Label */}
                  <span className={`text-[10px] mt-2 font-bold truncate max-w-[48px] text-center ${
                    isSelected ? 'text-emerald-900 font-black underline' : 'text-slate-500 group-hover:text-slate-900'
                  }`}>
                    {stat.dateLabel.split(',')[1] || stat.date.substring(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {selectedDate !== 'ALL' && (
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <span className="font-bold">
              Memfilter daftar kunjungan khusus tanggal: <strong>{selectedDate}</strong>
            </span>
            <button
              onClick={() => setSelectedDate('ALL')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Hapus Filter Tanggal
            </button>
          </div>
        )}
      </div>

      {/* Visitor Detailed Table (Siapa saja yang telah mengunjungi web) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <span>Daftar Siapa Saja yang Telah Mengunjungi Web</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan lengkap identitas pengguna, peran, jam akses, perangkat, dan modul yang dibuka.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Ditemukan: <span className="text-emerald-700 font-black">{filteredLogs.length}</span> Sesi Kunjungan
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pengunjung, NIP, NISN, atau modul..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">Semua Peran ({allLogs.length})</option>
              <option value="guru">Guru & GTK ({summary.roleCounts.guru})</option>
              <option value="siswa">Siswa ({summary.roleCounts.siswa})</option>
              <option value="guest">Guest / Tamu ({summary.roleCounts.guest})</option>
              <option value="admin">Administrator ({summary.roleCounts.admin})</option>
            </select>
          </div>

          {/* Device Filter */}
          <div>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">Semua Perangkat</option>
              <option value="Desktop">Desktop / PC ({summary.deviceCounts.Desktop})</option>
              <option value="Mobile">Smartphone / HP ({summary.deviceCounts.Mobile})</option>
              <option value="Tablet">Tablet ({summary.deviceCounts.Tablet})</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Waktu Kunjungan</th>
                <th className="py-3 px-3.5">Nama Pengunjung</th>
                <th className="py-3 px-3.5">Peran</th>
                <th className="py-3 px-3.5">NIP / NISN / Rombel</th>
                <th className="py-3 px-3.5">Modul Dibuka</th>
                <th className="py-3 px-3.5">Perangkat & Browser</th>
                <th className="py-3 px-3.5">Durasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                    Tidak ada catatan kunjungan yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 100).map((log) => (
                  <tr key={log.id} className="hover:bg-emerald-50/40 transition-colors">
                    {/* Waktu */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.time}</div>
                      <div className="text-[10px] text-slate-500">{log.date}</div>
                    </td>

                    {/* Nama */}
                    <td className="py-2.5 px-3.5">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.ip}</div>
                    </td>

                    {/* Peran */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      {getRoleBadge(log.role)}
                    </td>

                    {/* Identitas / Rombel */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <div className="text-slate-800 font-semibold">{log.identifier || '-'}</div>
                      {log.rombel && (
                        <div className="text-[10px] text-emerald-800 font-medium">{log.rombel}</div>
                      )}
                    </td>

                    {/* Modul */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700 text-[11px] border border-slate-200">
                        {log.pageVisited}
                      </span>
                    </td>

                    {/* Perangkat */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        {log.deviceType === 'Mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        ) : log.deviceType === 'Tablet' ? (
                          <Tablet className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                        <span className="truncate max-w-[170px]" title={log.device}>
                          {log.device}
                        </span>
                      </div>
                    </td>

                    {/* Durasi */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {log.sessionMinutes ? `${log.sessionMinutes} mnt` : '< 1 mnt'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredLogs.length > 100 && (
          <div className="text-center text-xs text-slate-500 italic pt-2">
            Menampilkan 100 kunjungan terbaru dari total {filteredLogs.length} data. Gunakan tombol "Ekspor Rekap (CSV)" untuk mengunduh seluruh data.
          </div>
        )}
      </div>
    </div>
  );
};
