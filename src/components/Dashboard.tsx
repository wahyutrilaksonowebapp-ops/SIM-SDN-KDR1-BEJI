import React, { useState } from 'react';
import { 
  ProfilSekolah, 
  Pegawai, 
  Siswa, 
  SarprasItem, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ,
  SuratMasuk,
  SuratKeluar,
  TabType,
  AIInsightData,
  AuthUser
} from '../types';
import { 
  School, 
  Users, 
  GraduationCap, 
  Building2, 
  Sparkles, 
  Award, 
  FileCheck2, 
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Eye,
  ShieldCheck,
  CheckCircle2,
  History,
  Database,
  DownloadCloud,
  FileSpreadsheet,
  ExternalLink,
  Check,
  Link2,
  X,
  CalendarClock,
  AlertTriangle,
  Hourglass,
  BellRing
} from 'lucide-react';
import { generateAIInsight } from '../services/api';
import { getActivityLogs } from '../services/logger';
import { 
  fetchProfilSekolahFromSpreadsheet, 
  getSavedMasterSheetId, 
  saveMasterSheetId 
} from '../services/singleMasterSheetService';
import { getAccessToken } from '../services/googleAuth';
import { DashboardCharts3D } from './DashboardCharts3D';
import { calculateBupPensiun, BupPensiunInfo, formatIndoDate } from '../utils/helpers';

interface DashboardProps {
  profil: ProfilSekolah;
  pegawai: Pegawai[];
  siswa: Siswa[];
  sarpras: SarprasItem[];
  rapor: RekapRaporSiswa[];
  btq: NilaiIjazahBTQ[];
  suratMasuk?: SuratMasuk[];
  suratKeluar?: SuratKeluar[];
  currentUser?: AuthUser;
  setActiveTab: (tab: TabType) => void;
  onUpdateProfil?: (updated: ProfilSekolah) => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onSyncRealtime?: () => Promise<void>;
  isSyncingRealtime?: boolean;
  lastSyncTime?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profil,
  pegawai,
  siswa,
  sarpras,
  rapor,
  btq,
  suratMasuk = [],
  suratKeluar = [],
  currentUser,
  setActiveTab,
  onUpdateProfil,
  onNotify,
  onSyncRealtime,
  isSyncingRealtime = false,
  lastSyncTime,
}) => {
  const [aiInsight, setAiInsight] = useState<AIInsightData | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // State for fetching Profil Sekolah from Google Spreadsheet
  const [isFetchingProfil, setIsFetchingProfil] = useState(false);
  const [profilSyncStatus, setProfilSyncStatus] = useState<string | null>(null);
  const [showSheetInputModal, setShowSheetInputModal] = useState(false);
  const [sheetUrlInput, setSheetUrlInput] = useState(() => getSavedMasterSheetId());

  // Statistics
  const totalPegawai = pegawai.length;
  const pnsCount = pegawai.filter((p) => p.statusKepegawaian === 'PNS').length;
  const pppkCount = pegawai.filter((p) => p.statusKepegawaian === 'PPPK').length;
  const honorerCount = pegawai.filter((p) => p.statusKepegawaian === 'GTT' || p.statusKepegawaian === 'PTT').length;

  const totalSiswa = siswa.length;
  const lakiCount = siswa.filter((s) => s.jenisKelamin === 'L').length;
  const perempuanCount = siswa.filter((s) => s.jenisKelamin === 'P').length;

  const sarprasBaik = sarpras.filter((s) => s.kondisi === 'Baik').length;
  const sarprasRusakRingan = sarpras.filter((s) => s.kondisi === 'Rusak Ringan').length;
  const sarprasRusakBerat = sarpras.filter((s) => s.kondisi === 'Rusak Berat').length;

  // BTQ Pass Rate
  const btqLulus = btq.filter((b) => b.statusKelulusan === 'Lulus').length;
  const btqRate = btq.length > 0 ? Math.round((btqLulus / btq.length) * 100) : 100;

  // Persuratan / Letters Statistics
  const totalLetters = (suratMasuk?.length || 0) + (suratKeluar?.length || 0);
  const pendingLetters = (suratMasuk || []).filter(
    (s) => !s.disposisiKepsek || 
           s.disposisiKepsek.toLowerCase().includes('pending') || 
           s.disposisiKepsek.toLowerCase().includes('belum') || 
           s.disposisiKepsek.toLowerCase().includes('proses')
  ).length;

  // Siswa per kelas
  const perKelasCount = [1, 2, 3, 4, 5, 6].map((k) => ({
    kelas: k,
    total: siswa.filter((s) => s.kelas === k).length,
    laki: siswa.filter((s) => s.kelas === k && s.jenisKelamin === 'L').length,
    perempuan: siswa.filter((s) => s.kelas === k && s.jenisKelamin === 'P').length,
  }));

  // State & Perhitungan Notifikasi Otomatis BUP (Batas Usia Pensiun) Pegawai
  const [bupTab, setBupTab] = useState<'ALL' | 'MENDESAK' | 'MENDEKATI' | 'PERSIAPAN'>('ALL');
  const [showAllBup, setShowAllBup] = useState(false);

  const bupSummary = React.useMemo(() => {
    const list = pegawai.map((p) => {
      const bup = calculateBupPensiun(p.tanggalLahir, p.jabatan);
      return {
        pegawai: p,
        bup,
      };
    });

    // Urutkan dari sisa bulan terkecil (paling mendesak / terdekat TMT Pensiun)
    list.sort((a, b) => a.bup.sisaBulan - b.bup.sisaBulan);

    const mendeak = list.filter((item) => item.bup.status === 'Mendesak' || item.bup.status === 'Sudah Pensiun');
    const mendekati = list.filter((item) => item.bup.status === 'Mendekati');
    const persiapan = list.filter((item) => item.bup.status === 'Persiapan');
    const totalAlert = mendeak.length + mendekati.length + persiapan.length;

    return {
      all: list,
      mendeak,
      mendekati,
      persiapan,
      totalAlert,
      prioritas: [...mendeak, ...mendekati, ...persiapan],
    };
  }, [pegawai]);

  const filteredBupList = React.useMemo(() => {
    if (bupTab === 'MENDESAK') return bupSummary.mendeak;
    if (bupTab === 'MENDEKATI') return bupSummary.mendekati;
    if (bupTab === 'PERSIAPAN') return bupSummary.persiapan;
    return bupSummary.prioritas;
  }, [bupTab, bupSummary]);

  const displayedBupList = showAllBup ? filteredBupList : filteredBupList.slice(0, 4);

  // Trigger Gemini AI Insight
  const handleGenerateAiInsight = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const summaryPayload = {
        sekolah: profil.nama,
        tahunPelajaran: profil.tahunPelajaranAktif,
        rekapPegawai: {
          total: totalPegawai,
          pns: pnsCount,
          pppk: pppkCount,
          honorer: honorerCount,
        },
        rekapSiswa: {
          total: totalSiswa,
          lakiLaki: lakiCount,
          perempuan: perempuanCount,
          distribusiKelas: perKelasCount,
        },
        rekapSarpras: {
          total: sarpras.length,
          baik: sarprasBaik,
          rusakRingan: sarprasRusakRingan,
          rusakBerat: sarprasRusakBerat,
          daftarRusakBerat: sarpras.filter(s => s.kondisi === 'Rusak Berat').map(s => s.namaSarpras),
        },
        rekapBTQ: {
          totalPeserta: btq.length,
          lulus: btqLulus,
          persentaseLulus: `${btqRate}%`,
          rataRataSkor: (btq.reduce((acc, b) => acc + b.rataRata, 0) / (btq.length || 1)).toFixed(1),
        },
        rekapRapor: {
          jumlahSiswaTerekam: rapor.length,
        },
      };

      const result = await generateAIInsight(summaryPayload);
      setAiInsight({
        ...result,
        lastGenerated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      setAiError(err.message || 'Gagal memanggil Gemini AI.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Function to pull school profile directly from master spreadsheet
  const handleAmbilProfilDariSpreadsheet = async (overrideUrl?: string) => {
    setIsFetchingProfil(true);
    try {
      const sheetToUse = overrideUrl || sheetUrlInput || getSavedMasterSheetId();
      if (overrideUrl) {
        saveMasterSheetId(overrideUrl);
      }
      const token = await getAccessToken();
      const updated = await fetchProfilSekolahFromSpreadsheet(sheetToUse, token, profil);
      if (onUpdateProfil) {
        onUpdateProfil(updated);
      }
      try {
        localStorage.setItem('sim_kdr1_profil', JSON.stringify(updated));
      } catch {}
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setProfilSyncStatus(`Tersinkron ${timeStr}`);
      onNotify?.(`Data profil sekolah berhasil diambil dari Google Spreadsheet: ${updated.nama}!`, 'success');
      setShowSheetInputModal(false);
    } catch (err: any) {
      console.warn('Gagal ambil profil dari spreadsheet:', err);
      if (!getSavedMasterSheetId() && !overrideUrl) {
        setShowSheetInputModal(true);
      } else {
        onNotify?.(err.message || 'Gagal mengambil data profil dari spreadsheet. Pastikan sheet Profil_Sekolah tersedia.', 'error');
      }
    } finally {
      setIsFetchingProfil(false);
    }
  };

  const isSiswa = currentUser?.role === 'siswa';
  const siswaRombelKelas = currentUser?.kelas || 6;
  const classmates = siswa.filter((s) => s.kelas === siswaRombelKelas);
  const classmatesL = classmates.filter((s) => s.jenisKelamin === 'L').length;
  const classmatesP = classmates.filter((s) => s.jenisKelamin === 'P').length;

  const classBtq = btq.filter((b) => {
    const s = siswa.find((x) => x.nama.toLowerCase() === b.namaSiswa.toLowerCase());
    return s ? s.kelas === siswaRombelKelas : true;
  });
  const classBtqLulus = classBtq.filter((b) => b.statusKelulusan === 'Lulus').length;
  const classBtqRate = classBtq.length > 0 ? Math.round((classBtqLulus / classBtq.length) * 100) : 100;

  const classSarpras = sarpras.filter((item) => {
    const l = item.lokasi.toLowerCase();
    const k = String(siswaRombelKelas);
    return l.includes(`kelas ${k}`) || l.includes(`ruang ${k}`);
  });
  const classSarprasBaik = classSarpras.filter((s) => s.kondisi === 'Baik').length;

  return (
    <div className="space-y-6">
      {/* Student Specific Welcome Banner */}
      {isSiswa && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-blue-700/50 relative overflow-hidden animate-in fade-in duration-200">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-700/70 text-blue-100 border border-blue-500/40">
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                Portal Dashboard Siswa - {currentUser.rombel || `Kelas ${siswaRombelKelas}`}
              </span>
              <h2 className="text-2xl font-black">Halo, {currentUser.name}! 👋</h2>
              <p className="text-xs text-blue-200">
                NISN: <strong>{currentUser.nisn || '-'}</strong> | Rombongan Belajar: <strong>Kelas {siswaRombelKelas}</strong> | SDN Kedungringin 1 Beji
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('kesiswaan')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Lihat Tabungan & Presensi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('sarpras')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20 cursor-pointer"
              >
                <span>Fasilitas Sarpras Kelas</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-blue-950/60 p-2.5 rounded-xl border border-blue-800/40">
              <span className="text-blue-300 text-[11px]">Teman Sekelas:</span>
              <div className="font-bold text-white text-base mt-0.5">{classmates.length} Siswa</div>
            </div>
            <div className="bg-blue-950/60 p-2.5 rounded-xl border border-blue-800/40">
              <span className="text-blue-300 text-[11px]">Laki-laki / Perempuan:</span>
              <div className="font-bold text-white text-base mt-0.5">{classmatesL} L / {classmatesP} P</div>
            </div>
            <div className="bg-blue-950/60 p-2.5 rounded-xl border border-blue-800/40">
              <span className="text-blue-300 text-[11px]">Wali Kelas:</span>
              <div className="font-bold text-white truncate mt-0.5">Guru Kelas {siswaRombelKelas}</div>
            </div>
            <div className="bg-blue-950/60 p-2.5 rounded-xl border border-blue-800/40">
              <span className="text-blue-300 text-[11px]">Tahun Pelajaran:</span>
              <div className="font-bold text-white mt-0.5">{profil.tahunPelajaranAktif}</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Welcome & School Identity Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-700/60 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-600/40">
              <School className="w-3.5 h-3.5" />
              Sistem Informasi Manajemen Terintegrasi
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Selamat Datang di SIM {profil.nama}
            </h2>
          </div>
        </div>

        {/* Quick Identity Bar */}
        <div className="mt-6 pt-4 border-t border-emerald-700/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-emerald-300 font-medium">Kepala Sekolah</div>
              <div className="font-semibold text-white truncate" title={profil.kepalaSekolah}>{profil.kepalaSekolah}</div>
              <div className="text-emerald-200/80 text-[11px] truncate">NIP. {profil.nipKepalaSekolah}</div>
              {profil.pangkatKepalaSekolah && (
                <div className="text-[10px] text-emerald-300/70 truncate">{profil.pangkatKepalaSekolah}</div>
              )}
            </div>
            <div>
              <div className="text-emerald-300 font-medium">Status & Akreditasi</div>
              <div className="font-semibold text-white">{profil.status} - Akreditasi {profil.akreditasi}</div>
              <div className="text-emerald-200/80 text-[11px]">NPSN: {profil.npsn}</div>
              <div className="text-[10px] text-emerald-300/70">Bentuk: {profil.bentukPendidikan}</div>
            </div>
            <div>
              <div className="text-emerald-300 font-medium">Tahun Pelajaran</div>
              <div className="font-semibold text-white">{profil.tahunPelajaranAktif}</div>
              <div className="text-emerald-200/80 text-[11px]">Acuan TMT: {profil.tanggalAcuanUsia}</div>
              <div className="text-[10px] text-emerald-300/70">Kurikulum Merdeka</div>
            </div>
            <div>
              <div className="text-emerald-300 font-medium">Kecamatan & Daerah</div>
              <div className="font-semibold text-white">Kec. {profil.kecamatan}</div>
              <div className="text-emerald-200/80 text-[11px] truncate">Kab. {profil.kabupaten}, Jawa Timur</div>
              <div className="text-[10px] text-emerald-300/70 truncate" title={profil.alamat}>{profil.alamat}</div>
            </div>
          </div>
        </div>

      {/* ========================================================================= */}
      {/* SINGLE MASTER DATABASE TERKUNCI & REALTIME STATUS BANNER                  */}
      {/* Kunci ke spreadsheet SIM_SDN_Kedungringin1_Master_Database_2026_2027      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-emerald-500/80 p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">
                  Database Terkunci Real-time (Single Data Utama)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Realtime Aktif
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  11 Pegawai GTK Resmi
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Data Dummy Dibersihkan
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Sumber Master: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800 text-[11px]">SIM_SDN_Kedungringin1_Master_Database_2026_2027</code>. Seluruh data GTK, Profil, Kesiswaan, dan Sarpras disinkronkan secara real-time untuk Guest, Guru, dan Admin tanpa data dummy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {lastSyncTime && (
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Update: <strong className="text-slate-700 font-mono">{lastSyncTime}</strong>
              </span>
            )}
            <button
              onClick={() => onSyncRealtime ? onSyncRealtime() : handleAmbilProfilDariSpreadsheet()}
              disabled={isSyncingRealtime}
              title="Sinkronkan data real-time terbaru dari Google Spreadsheet"
              className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRealtime ? 'animate-spin' : ''}`} />
              <span>{isSyncingRealtime ? 'Menyinkronkan...' : 'Sinkronkan Real-time'}</span>
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('google_integration')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
              >
                Pusat Master Sheet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUMMARY STATISTIC CARDS (Total Students, Active Staff, Pending Letters, Facilities) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Students Card */}
        <div 
          onClick={() => setActiveTab('kesiswaan')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {isSiswa ? `Rombel Kelas ${siswaRombelKelas}` : 'Total Students'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {isSiswa ? classmates.length : totalSiswa}
            </div>
            <div className="text-xs font-medium text-slate-500">
              {isSiswa ? `Siswa Kelas ${siswaRombelKelas} (Rombel Anda)` : 'Total Students / Siswa Terdaftar'}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
            <span>L: <strong className="text-slate-800">{isSiswa ? classmatesL : lakiCount}</strong> | P: <strong className="text-slate-800">{isSiswa ? classmatesP : perempuanCount}</strong></span>
            <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Rincian <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 2. Active Staff Card */}
        <div 
          onClick={() => setActiveTab('kepegawaian')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active Staff
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {totalPegawai}
            </div>
            <div className="text-xs font-medium text-slate-500">
              Pendidik & Tenaga Kependidikan Aktif
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
            <span><strong>{pnsCount}</strong> PNS • <strong>{pppkCount}</strong> PPPK • <strong>{honorerCount}</strong> Non-ASN</span>
            <span className="text-emerald-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Direktori <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 3. Pending Letters Card */}
        <div 
          onClick={() => setActiveTab('keadministrasian')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Pending Letters
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {pendingLetters}
            </div>
            <div className="text-xs font-medium text-slate-500">
              Surat Menunggu Tindak Lanjut / Disposisi
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
            <span>Total: <strong>{totalLetters}</strong> Arsip Surat</span>
            <span className="text-amber-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Agenda <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 4. Sarana Prasarana / School Facilities Card */}
        <div 
          onClick={() => setActiveTab('sarpras')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              {isSiswa ? `${classSarprasBaik} Laik Pakai` : 'Fasilitas & Aset'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {isSiswa ? classSarpras.length : sarpras.length}
            </div>
            <div className="text-xs font-medium text-slate-500">
              {isSiswa ? `Sarpras Ruang Kelas ${siswaRombelKelas}` : 'Unit Sarana & Prasarana'}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
            <span className="text-emerald-700 font-medium">Kondisi Baik: {isSiswa ? classSarprasBaik : sarprasBaik} Unit</span>
            <span className="text-purple-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Sarpras <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 3D Visualizer Kesiswaan (Sesuai Rombel untuk Siswa) */}
      <DashboardCharts3D
        pegawai={pegawai}
        siswa={siswa}
        btq={btq}
        currentUser={currentUser}
      />

      {/* Administrator Audit Log Feed (LocalStorage Monitoring) */}
      {currentUser?.role === 'admin' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pemantau Log Aktivitas & Perubahan Data (Khusus Administrator)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mencatat riwayat aktivitas login pengguna, penambahan surat, penghapusan data, dan manipulasi sistem yang tersimpan di localStorage browser.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('google_integration')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span>Buka Log Lengkap & Ekspor CSV</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {getActivityLogs().slice(0, 4).map((log, idx) => {
              let actionBadge = 'bg-slate-100 text-slate-700 border-slate-200';
              if (log.action === 'HAPUS') actionBadge = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
              else if (log.action === 'TAMBAH') actionBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
              else if (log.action === 'UBAH') actionBadge = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
              else if (log.action === 'LOGIN') actionBadge = 'bg-blue-100 text-blue-800 border-blue-300 font-bold';

              return (
                <div key={`${log.id || 'log'}-${idx}`} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] border uppercase ${actionBadge}`}>
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {log.userName}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 line-clamp-1">
                      {log.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
                    <span className="font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                      {log.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Pengaturan Tautan Google Spreadsheet Profil */}
      {showSheetInputModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Ambil Profil dari Master Spreadsheet
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sinkronisasi sheet <strong>Profil_Sekolah</strong> ke identitas SIM SDN Kedungringin 1
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSheetInputModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ID atau Link Google Spreadsheet:
                </label>
                <input
                  type="text"
                  value={sheetUrlInput}
                  onChange={(e) => setSheetUrlInput(e.target.value)}
                  placeholder="Contoh: 1cry49dLyjsyXfkGJIARR_PLwUV67t7ur atau link edit spreadsheet"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Sistem akan membaca sheet bernama <strong>Profil_Sekolah</strong> atau <strong>Profil</strong>.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Format Kolom Sheet Profil yang Didukung:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Format Berbaris (Key-Value): <code>Nama Sekolah</code>, <code>NPSN</code>, <code>Bentuk Pendidikan</code>, <code>Status</code>, <code>Akreditasi</code>, <code>Alamat</code>, <code>Kecamatan</code>, <code>Kabupaten</code>, <code>Kepala Sekolah</code>, <code>NIP Kepala Sekolah</code>, <code>Tahun Pelajaran</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSheetInputModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleAmbilProfilDariSpreadsheet(sheetUrlInput)}
                disabled={isFetchingProfil || !sheetUrlInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isFetchingProfil ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <DownloadCloud className="w-3.5 h-3.5" />
                )}
                <span>{isFetchingProfil ? 'Mengambil Profil...' : 'Ambil & Sinkronkan Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
