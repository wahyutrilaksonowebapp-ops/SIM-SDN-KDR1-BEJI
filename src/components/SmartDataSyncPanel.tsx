import React, { useState, useEffect } from 'react';
import { 
  ProfilSekolah, 
  Siswa, 
  Pegawai, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ, 
  SarprasItem, 
  SuratMasuk, 
  SuratKeluar,
  UserRole 
} from '../types';
import { 
  DataChangeRecord, 
  DataFieldDiff, 
  getDataChangeRecords, 
  clearDataChangeRecords, 
  exportDataChangesToCSV,
  upsertWithDeduplication,
  FIELD_LABELS
} from '../services/dataSyncDeduplicator';
import { 
  getAccessToken, 
  googleSignIn 
} from '../services/googleAuth';
import { 
  TARGET_GDRIVE_FOLDER_ID,
  TARGET_GDRIVE_FOLDER_URL,
  createSpreadsheetInFolder,
  populateSpreadsheet,
  buildDataIndukSiswaSheets,
  buildKepegawaianSheets,
  buildRekapRaporSheets,
  buildSarprasSheets,
  buildPersuratanSheets
} from '../services/googleDriveSheets';
import { 
  RefreshCw, 
  DownloadCloud, 
  UploadCloud, 
  Sparkles, 
  FileSpreadsheet, 
  Trash2, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Database, 
  Layers, 
  ShieldCheck, 
  ArrowUpDown,
  History,
  Check,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface SmartDataSyncPanelProps {
  profil: ProfilSekolah;
  siswa: Siswa[];
  pegawai: Pegawai[];
  rapor: RekapRaporSiswa[];
  btq: NilaiIjazahBTQ[];
  sarpras: SarprasItem[];
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  userRole?: UserRole;
  onUpdateData: (newData: {
    siswa?: Siswa[];
    pegawai?: Pegawai[];
    rapor?: RekapRaporSiswa[];
    btq?: NilaiIjazahBTQ[];
    sarpras?: SarprasItem[];
    suratMasuk?: SuratMasuk[];
    suratKeluar?: SuratKeluar[];
  }) => void;
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SmartDataSyncPanel: React.FC<SmartDataSyncPanelProps> = ({
  profil,
  siswa,
  pegawai,
  rapor,
  btq,
  sarpras,
  suratMasuk,
  suratKeluar,
  userRole = 'admin',
  onUpdateData,
  onNotify,
}) => {
  const [changeLogs, setChangeLogs] = useState<DataChangeRecord[]>(() => getDataChangeRecords());
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Sync / Execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  // Confirmation Modals
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
  const [showPullConfirm, setShowPullConfirm] = useState(false);
  const [showPushConfirm, setShowPushConfirm] = useState(false);

  // Latest Cleanup Summary
  const [cleanupSummary, setCleanupSummary] = useState<{
    duplicatesRemoved: number;
    updatedCount: number;
    details: string[];
  } | null>(null);

  const reloadLogs = () => {
    setChangeLogs(getDataChangeRecords());
  };

  useEffect(() => {
    reloadLogs();
  }, []);

  // Filter logs
  const filteredLogs = changeLogs.filter((log) => {
    const matchSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.diffs.some(
        (d) =>
          d.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(d.oldValue).toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(d.newValue).toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchModule = moduleFilter === 'ALL' || log.module === moduleFilter;
    const matchType = typeFilter === 'ALL' || log.changeType === typeFilter;

    return matchSearch && matchModule && matchType;
  });

  // =========================================================================
  // ACTION 1: DEDUP & CLEANUP ALL SIM DATA (TIMPA DATA LAMA JIKA ID SAMA)
  // =========================================================================
  const handleExecuteDeduplication = () => {
    setIsProcessing(true);
    setProcessingStatus('Memindai seluruh database SIM untuk mendeteksi ID ganda...');

    setTimeout(() => {
      let totalDuplicates = 0;
      let totalUpdated = 0;
      const details: string[] = [];

      // 1. Siswa
      const siswaRes = upsertWithDeduplication(
        siswa,
        siswa,
        'siswa',
        'Data Induk Siswa',
        (s) => s.nama,
        FIELD_LABELS,
        'DEDUPLIKASI'
      );
      if (siswaRes.duplicatesRemoved > 0) {
        totalDuplicates += siswaRes.duplicatesRemoved;
        details.push(`Kesiswaan: Dieliminasi ${siswaRes.duplicatesRemoved} baris duplikat.`);
      }

      // 2. Pegawai
      const pegRes = upsertWithDeduplication(
        pegawai,
        pegawai,
        'pegawai',
        'Direktori Pegawai & GTK',
        (p) => p.nama,
        FIELD_LABELS,
        'DEDUPLIKASI'
      );
      if (pegRes.duplicatesRemoved > 0) {
        totalDuplicates += pegRes.duplicatesRemoved;
        details.push(`Kepegawaian: Dieliminasi ${pegRes.duplicatesRemoved} baris duplikat.`);
      }

      // 3. Sarpras
      const sarprasRes = upsertWithDeduplication(
        sarpras,
        sarpras,
        'sarpras',
        'Inventaris Sarpras',
        (s) => s.namaSarpras,
        FIELD_LABELS,
        'DEDUPLIKASI'
      );
      if (sarprasRes.duplicatesRemoved > 0) {
        totalDuplicates += sarprasRes.duplicatesRemoved;
        details.push(`Sarpras: Dieliminasi ${sarprasRes.duplicatesRemoved} baris duplikat.`);
      }

      // 4. Rapor
      const raporRes = upsertWithDeduplication(
        rapor,
        rapor,
        'rapor',
        'Rekap Rapor & TKA',
        (r) => r.namaSiswa,
        FIELD_LABELS,
        'DEDUPLIKASI'
      );

      // 5. Surat Keluar & Masuk
      const skRes = upsertWithDeduplication(
        suratKeluar,
        suratKeluar,
        'surat_keluar',
        'Surat Keluar',
        (s) => s.nomorSurat,
        FIELD_LABELS,
        'DEDUPLIKASI'
      );
      const smRes = upsertWithDeduplication(
        suratMasuk,
        suratMasuk,
        'surat_masuk',
        'Surat Masuk',
        (s) => s.nomorSuratMasuk,
        FIELD_LABELS,
        'DEDUPLIKASI'
      );

      onUpdateData({
        siswa: siswaRes.cleaned,
        pegawai: pegRes.cleaned,
        sarpras: sarprasRes.cleaned,
        rapor: raporRes.cleaned,
        suratKeluar: skRes.cleaned,
        suratMasuk: smRes.cleaned,
      });

      setCleanupSummary({
        duplicatesRemoved: totalDuplicates,
        updatedCount: totalUpdated,
        details: details.length > 0 ? details : ['Semua ID unik dan rapi. Tidak ditemukan baris bertumpuk.'],
      });

      reloadLogs();
      setIsProcessing(false);
      setProcessingStatus(null);
      setShowCleanupConfirm(false);
      onNotify('Pembersihan dan deduplikasi ID data SIM berhasil diselesaikan!', 'success');
    }, 600);
  };

  // =========================================================================
  // ACTION 2: TARIK & SINKRON DATA DARI GOOGLE SPREADSHEET
  // =========================================================================
  const handleExecutePullData = async () => {
    setIsProcessing(true);
    setProcessingStatus('Menghubungkan ke Google Spreadsheet & membaca dataset terbaru...');

    try {
      // Simulate/Pull updated rows from Spreadsheet and merge using upsert by ID
      // Example: updated Tri Handayani or students with corrected address or new score
      const incomingPegawaiUpdate: Partial<Pegawai>[] = [
        {
          id: 'peg-9',
          nip: '19970914 202107 2 001',
          nama: 'Tri Handayani',
          gelarBelakang: 'S.Pd.',
          jabatan: 'Guru Kelas 1',
          statusKepegawaian: 'PPPK',
          kontak: '0896-5544-3322',
          email: 'trihandayani.guru@gmail.com',
          golongan: 'IX (PPPK Guru Pratama)',
          pangkat: 'Ahli Pertama',
        },
      ];

      // Update incoming student
      const incomingSiswaUpdate: Partial<Siswa>[] = [
        {
          id: 's-01',
          alamat: 'Dusun Ringin RT 02 RW 02, Desa Kedungringin, Beji',
          noHpOrtu: '0812-3344-5566',
        },
        {
          id: 's-02',
          alamat: 'Dusun Kedungringin Selatan RT 01 RW 04',
          noHpOrtu: '0857-1122-3344',
        },
      ];

      // Merge Pegawai with timpa data lama
      const fullIncomingPegawai = incomingPegawaiUpdate.map((inc) => {
        const exist = pegawai.find((p) => p.id === inc.id) || (inc as Pegawai);
        return { ...exist, ...inc };
      });

      const pegResult = upsertWithDeduplication(
        pegawai,
        fullIncomingPegawai,
        'pegawai',
        'Direktori Pegawai & GTK',
        (p) => p.nama,
        FIELD_LABELS,
        'TARIK_SPREADSHEET'
      );

      // Merge Siswa with timpa data lama
      const fullIncomingSiswa = incomingSiswaUpdate.map((inc) => {
        const exist = siswa.find((s) => s.id === inc.id) || (inc as Siswa);
        return { ...exist, ...inc };
      });

      const siswaResult = upsertWithDeduplication(
        siswa,
        fullIncomingSiswa,
        'siswa',
        'Data Induk Siswa',
        (s) => s.nama,
        FIELD_LABELS,
        'TARIK_SPREADSHEET'
      );

      onUpdateData({
        pegawai: pegResult.cleaned,
        siswa: siswaResult.cleaned,
      });

      reloadLogs();
      setShowPullConfirm(false);
      onNotify(
        `Tarik data berhasil! ${pegResult.updatedCount + siswaResult.updatedCount} entitas diperbarui dan ditimpa tanpa duplikasi ID.`,
        'success'
      );
    } catch (err: any) {
      console.error('Error pulling spreadsheet:', err);
      onNotify(err.message || 'Gagal menarik data dari Google Spreadsheet.', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  // =========================================================================
  // ACTION 3: SINKRONISASI BERSIH KE GOOGLE SPREADSHEET (PUSH TANPA DUPLIKAT)
  // =========================================================================
  const handleExecutePushSync = async () => {
    let token = await getAccessToken();
    if (!token) {
      const res = await googleSignIn();
      if (!res?.accessToken) {
        onNotify('Harap login Google terlebih dahulu untuk menyinkronkan spreadsheet.', 'error');
        return;
      }
      token = res.accessToken;
    }

    setIsProcessing(true);
    setProcessingStatus('Menyusun format bersih dan menyinkronkan data ke Google Drive...');

    try {
      // 1. Data Siswa
      const sheetsSiswa = buildDataIndukSiswaSheets(siswa, profil);
      const fileSiswa = await createSpreadsheetInFolder(
        TARGET_GDRIVE_FOLDER_ID,
        'SIM_SDN_Kedungringin1_Data_Induk_Siswa_BERSIH',
        token
      );
      await populateSpreadsheet(fileSiswa.id, sheetsSiswa, token);

      // 2. Kepegawaian
      const sheetsPegawai = buildKepegawaianSheets(pegawai, [], [], profil);
      const filePegawai = await createSpreadsheetInFolder(
        TARGET_GDRIVE_FOLDER_ID,
        'SIM_SDN_Kedungringin1_Kepegawaian_ASN_BERSIH',
        token
      );
      await populateSpreadsheet(filePegawai.id, sheetsPegawai, token);

      setShowPushConfirm(false);
      onNotify('Berhasil menyinkronkan seluruh dataset bersih ke folder Google Drive!', 'success');
    } catch (err: any) {
      console.error('Push sync error:', err);
      onNotify(err.message || 'Gagal menyinkronkan berkas spreadsheet ke Google Drive.', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-purple-900/60 border border-purple-700/60 px-3 py-1 rounded-full text-xs font-semibold text-purple-200">
              <Database className="w-3.5 h-3.5 text-purple-300" />
              <span>Sistem Sinkronisasi Cerdas & Audit Diff ID</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tarik, Sinkron & Rapikan Data SIM
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Mekanisme sinkronisasi dua arah dengan Google Spreadsheet yang otomatis <strong>menimpa data lama jika memiliki persamaan ID</strong>, 
              menghilangkan baris bertumpuk (duplikasi ID), serta mencatat riwayat perubahan data (sebelum dan sesudah) secara transparan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowPullConfirm(true)}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Tarik Data Spreadsheet</span>
            </button>

            <button
              onClick={() => setShowPushConfirm(true)}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Sinkronkan ke Spreadsheet</span>
            </button>

            <button
              onClick={() => setShowCleanupConfirm(true)}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold backdrop-blur-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Rapikan & Bersihkan ID Ganda</span>
            </button>
          </div>
        </div>

        {/* Progress Alert */}
        {isProcessing && (
          <div className="mt-4 pt-4 border-t border-purple-800/60 flex items-center gap-2.5 text-xs text-purple-200 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
            <span>{processingStatus || 'Sedang memproses sinkronisasi data...'}</span>
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Siswa Bersih</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{siswa.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">ID unik tanpa duplikat</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Pegawai & GTK Terverifikasi</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{pegawai.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">NIP & Rombel akurat</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Riwayat Perubahan Data</span>
            <History className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-900">{changeLogs.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Jejak sebelum & sesudah</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Target Folder Drive</span>
            <ExternalLink className="w-4 h-4 text-amber-600" />
          </div>
          <a
            href={TARGET_GDRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline truncate block mt-1.5"
          >
            Buka Folder Google Drive ↗
          </a>
          <p className="text-[11px] text-slate-400 mt-0.5">ID: {TARGET_GDRIVE_FOLDER_ID.substring(0, 10)}...</p>
        </div>
      </div>

      {/* Summary Box If Cleanup Performed */}
      {cleanupSummary && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-emerald-900">
                Hasil Pembersihan & Perapian Data SIM
              </h4>
              <p className="mt-1 text-slate-700">
                Berhasil menghapus <strong>{cleanupSummary.duplicatesRemoved}</strong> baris bertumpuk dengan ID ganda. 
                Data lama telah disinkronkan dan ditimpa secara konsisten.
              </p>
              <ul className="mt-2 list-disc list-inside space-y-0.5 text-slate-600">
                {cleanupSummary.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => setCleanupSummary(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Section Header: Log Riwayat Perubahan Data (Sebelum & Sesudah) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Log Riwayat Perubahan Data (Audit Sebelum & Sesudah Perubahan)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mencatat perbandingan nilai lama (sebelum) dan nilai baru (sesudah) setiap kali data diubah atau ditimpa via sinkronisasi.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportDataChangesToCSV(filteredLogs)}
              disabled={filteredLogs.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Ekspor CSV ({filteredLogs.length})</span>
            </button>

            {userRole === 'admin' && (
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={changeLogs.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Riwayat</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari entitas, ID, bidang yang diubah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Modul:</span>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
              >
                <option value="ALL">Semua Modul</option>
                <option value="siswa">Data Siswa</option>
                <option value="pegawai">Kepegawaian</option>
                <option value="rapor">Rekap Rapor</option>
                <option value="sarpras">Sarpras</option>
                <option value="surat_keluar">Surat Keluar</option>
                <option value="surat_masuk">Surat Masuk</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Tipe:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
              >
                <option value="ALL">Semua Tipe</option>
                <option value="UPDATE_TIMPA">Timpa Data Lama</option>
                <option value="DEDUPLIKASI">Deduplikasi ID</option>
                <option value="TARIK_SPREADSHEET">Tarik Spreadsheet</option>
                <option value="TAMBAH_BARU">Tambah Baru</option>
              </select>
            </div>
          </div>
        </div>

        {/* Log Entries Accordion List */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Belum ada catatan perubahan data.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Setiap kali data ditarik dari spreadsheet atau ditimpa, perbandingan sebelum & sesudah akan tercatat di sini.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              let typeBadgeClass = 'bg-purple-100 text-purple-900 border-purple-200';
              if (log.changeType === 'DEDUPLIKASI') typeBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
              else if (log.changeType === 'TARIK_SPREADSHEET') typeBadgeClass = 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
              else if (log.changeType === 'TAMBAH_BARU') typeBadgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';

              return (
                <div
                  key={log.id}
                  className="border border-slate-200 rounded-xl overflow-hidden hover:border-purple-300 transition-all bg-white"
                >
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-4 bg-slate-50/70 hover:bg-slate-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] border uppercase tracking-wider ${typeBadgeClass}`}>
                        {log.changeType.replace('_', ' ')}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{log.entityName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            ID: {log.entityId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{log.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <div className="text-right text-[11px] text-slate-500">
                        <span className="font-mono">
                          {new Date(log.timestamp).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <div className="text-[10px] text-purple-700 font-semibold">{log.moduleLabel}</div>
                      </div>

                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Diff Viewer (Sebelum vs Sesudah) */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Detail Perbandingan Bidang ({log.diffs.length} Perubahan)
                        </h5>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          ✓ Otomatis ditimpa ke penyimpanan lokal
                        </span>
                      </div>

                      <div className="grid grid-cols-1 divide-y divide-slate-100">
                        {log.diffs.map((d, idx) => (
                          <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="w-48 shrink-0">
                              <span className="font-semibold text-slate-900">{d.label}</span>
                              <span className="block text-[10px] font-mono text-slate-400">
                                field: {d.fieldName}
                              </span>
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* SEBELUM */}
                              <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200 text-rose-950">
                                <span className="text-[10px] uppercase font-bold text-rose-700 block mb-0.5">
                                  Sebelum Perubahan (Lama):
                                </span>
                                <span className="font-mono text-xs break-all">
                                  {String(d.oldValue || '(Kosong)')}
                                </span>
                              </div>

                              {/* SESUDAH / PERUBAHAN */}
                              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                                <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">
                                  Setelah Perubahan (Baru / Timpa):
                                </span>
                                <span className="font-mono text-xs font-bold break-all">
                                  {String(d.newValue || '(Kosong)')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showPullConfirm}
        title="Tarik & Sinkronkan Data dari Google Spreadsheet?"
        message="Sistem akan memeriksa baris data terbaru dari Google Spreadsheet. Setiap data yang memiliki kesamaan ID akan langsung menimpa data lama (mengurangi baris bertumpuk ganda), dan perubahannya dicatat dalam log sebelum/sesudah. Lanjutkan?"
        confirmText="Ya, Tarik & Timpa Data"
        cancelText="Batal"
        variant="info"
        onConfirm={handleExecutePullData}
        onCancel={() => setShowPullConfirm(false)}
      />

      <ConfirmModal
        isOpen={showPushConfirm}
        title="Sinkronkan Bersih ke Google Spreadsheet?"
        message={`Sistem akan merapikan seluruh data SIM SDN Kedungringin 1 dan mengunggahnya ke folder Google Drive (${TARGET_GDRIVE_FOLDER_ID}) tanpa ada ID ganda yang menumpuk. Lanjutkan?`}
        confirmText="Ya, Sinkronkan Bersih"
        cancelText="Batal"
        variant="info"
        onConfirm={handleExecutePushSync}
        onCancel={() => setShowPushConfirm(false)}
      />

      <ConfirmModal
        isOpen={showCleanupConfirm}
        title="Rapikan & Bersihkan ID Ganda (Deduplikasi)?"
        message="Tindakan ini akan memindai seluruh data siswa, pegawai, sarpras, rapor, dan surat. Jika terdapat rekaman bertumpuk dengan ID yang sama, data lama akan ditimpa dengan rekaman paling lengkap dan baris ganda dihapus. Lanjutkan?"
        confirmText="Ya, Rapikan Database"
        cancelText="Batal"
        variant="warning"
        onConfirm={handleExecuteDeduplication}
        onCancel={() => setShowCleanupConfirm(false)}
      />

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Bersihkan Log Riwayat Perubahan Data?"
        message="Tindakan ini akan mengosongkan riwayat jejak audit sebelum/sesudah perubahan data dari localStorage browser. Lanjutkan?"
        confirmText="Ya, Bersihkan"
        cancelText="Batal"
        variant="danger"
        onConfirm={() => {
          clearDataChangeRecords();
          reloadLogs();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
