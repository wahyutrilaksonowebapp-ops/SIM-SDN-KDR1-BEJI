import React, { useState, useEffect, useRef } from 'react';
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
  TARGET_GDRIVE_FOLDER_ID,
  MASTER_SPREADSHEET_TITLE,
  STORAGE_KEYS,
  extractSpreadsheetId,
  getSavedMasterSheetId,
  saveMasterSheetId,
  getSavedWebAppUrl,
  saveWebAppUrl,
  fetchMasterDatabaseRealtime,
  buildMasterDatabaseSpreadsheet,
  fetchAllLiveMasterData,
  pushDataToMasterSpreadsheet
} from '../services/singleMasterSheetService';
import { 
  getAccessToken, 
  googleSignIn,
  auth
} from '../services/googleAuth';
import { 
  createSpreadsheetInFolder, 
  populateSpreadsheet,
  extendOrUpdateMasterSpreadsheet,
  listFilesInFolder
} from '../services/googleDriveSheets';
import { 
  upsertWithDeduplication, 
  FIELD_LABELS,
  getDataChangeRecords,
  clearDataChangeRecords,
  exportDataChangesToCSV,
  detectSyncConflicts,
  DataChangeRecord,
  DataConflictItem
} from '../services/dataSyncDeduplicator';
import { 
  Database, 
  RefreshCw, 
  Link2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Sparkles, 
  Trash2, 
  Clock, 
  Layers, 
  Users, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  FolderCheck,
  Check,
  Radio,
  SlidersHorizontal,
  FolderOpen,
  History,
  Download,
  Filter,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  DownloadCloud,
  UploadCloud,
  Code,
  Copy,
  Lock,
  ArrowLeftRight,
  Zap,
  Send
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/initialData';
import { LOCKED_WEB_APP_URL, syncWithGoogleAppsScript } from '../services/api';
import { ConfirmModal } from './ConfirmModal';
import { SyncConflictModal } from './SyncConflictModal';

interface SingleMasterDatabasePanelProps {
  profil: ProfilSekolah;
  siswa: Siswa[];
  pegawai: Pegawai[];
  rapor: RekapRaporSiswa[];
  btq: NilaiIjazahBTQ[];
  sarpras: SarprasItem[];
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  userRole?: UserRole;
  onUpdateProfil?: (updated: ProfilSekolah) => void;
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
  onPurgeDummyData: () => void;
}

export const SingleMasterDatabasePanel: React.FC<SingleMasterDatabasePanelProps> = ({
  profil,
  siswa,
  pegawai,
  rapor,
  btq,
  sarpras,
  suratMasuk,
  suratKeluar,
  userRole = 'admin',
  onUpdateProfil,
  onUpdateData,
  onNotify,
  onPurgeDummyData,
}) => {
  // Master Spreadsheet Configuration
  const [sheetInput, setSheetInput] = useState(() => getSavedMasterSheetId());
  const [activeSheetId, setActiveSheetId] = useState(() => getSavedMasterSheetId());
  const [sheetUrl, setSheetUrl] = useState(() => {
    const saved = getSavedMasterSheetId();
    return saved ? `https://docs.google.com/spreadsheets/d/${saved}/edit` : '';
  });
  const [webAppInput, setWebAppInput] = useState(() => getSavedWebAppUrl());
  const [isTestingSync, setIsTestingSync] = useState(false);

  // Real-time synchronization state
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REALTIME_ACTIVE) !== 'false';
    } catch {
      return true;
    }
  });

  const [isFetching, setIsFetching] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || '-';
    } catch {
      return '-';
    }
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Tabs for preview
  const [activePreviewTab, setActivePreviewTab] = useState<'pegawai' | 'siswa' | 'sarpras'>('pegawai');
  const [activeMainSection, setActiveMainSection] = useState<'sync' | 'audit_log'>('sync');
  const [copiedGas, setCopiedGas] = useState<boolean>(false);
  const [showGasModal, setShowGasModal] = useState<boolean>(false);

  // Conflict & Duplicate Validation State
  const [syncConflicts, setSyncConflicts] = useState<DataConflictItem[]>([]);
  const [syncDuplicateCount, setSyncDuplicateCount] = useState<number>(0);
  const [showConflictModal, setShowConflictModal] = useState<boolean>(false);
  const [pendingSyncData, setPendingSyncData] = useState<{
    updates: {
      pegawai?: Pegawai[];
      siswa?: Siswa[];
      sarpras?: SarprasItem[];
    };
    totalUpdated: number;
    timestamp: string;
  } | null>(null);

  // Change Log Audit State
  const [changeLogs, setChangeLogs] = useState<DataChangeRecord[]>(() => getDataChangeRecords());
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [logModuleFilter, setLogModuleFilter] = useState('ALL');
  const [logTypeFilter, setLogTypeFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showClearLogsConfirm, setShowClearLogsConfirm] = useState(false);

  const reloadChangeLogs = () => {
    setChangeLogs(getDataChangeRecords());
  };

  // Confirmation Modals
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [showCreateMasterConfirm, setShowCreateMasterConfirm] = useState(false);
  const [showPushConfirm, setShowPushConfirm] = useState(false);

  // Auto-sync polling interval (every 15 seconds if real-time active)
  useEffect(() => {
    if (!isRealtimeActive || !activeSheetId) return;

    const intervalId = setInterval(() => {
      // Trigger silent background poll
      handlePullRealtime(true);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [isRealtimeActive, activeSheetId]);

  // Save changes to activeSheetId
  const handleSaveConnection = () => {
    const extracted = extractSpreadsheetId(sheetInput);
    if (!extracted) {
      onNotify('Harap masukkan ID atau tautan Google Spreadsheet yang valid.', 'error');
      return;
    }

    saveMasterSheetId(extracted);
    setActiveSheetId(extracted);
    const generatedUrl = `https://docs.google.com/spreadsheets/d/${extracted}/edit`;
    setSheetUrl(generatedUrl);
    setSyncStatus('idle');
    setStatusMessage(`Spreadsheet terhubung: ID ${extracted.substring(0, 12)}...`);
    onNotify('Single Database Master Spreadsheet berhasil dihubungkan!', 'success');

    // Immediately pull realtime data
    setTimeout(() => {
      handlePullRealtime(false, extracted);
    }, 200);
  };

  const handleSaveWebAppConnection = () => {
    if (!webAppInput.trim()) {
      onNotify('Harap masukkan URL Web App Google Apps Script.', 'error');
      return;
    }
    saveWebAppUrl(webAppInput);
    onNotify('URL Web App Google Apps Script berhasil disimpan!', 'success');
  };

  const handleTest2WaySync = async () => {
    setIsTestingSync(true);
    setStatusMessage('Menguji sinkronisasi 2-arah (Membaca Spreadsheet & Menguji Pengiriman Web)...');
    try {
      // 1. Uji Baca (Cara 1: Spreadsheet -> Web)
      const liveData = await fetchAllLiveMasterData(profil);
      const totalPeg = liveData?.pegawai?.length ?? pegawai.length;
      const totalSis = liveData?.siswa?.length ?? siswa.length;

      // 2. Uji Kirim (Cara 2: Web -> Spreadsheet via Proxy)
      const pushRes = await pushDataToMasterSpreadsheet({
        profil,
        pegawai,
        siswa,
        rapor,
        btq,
        sarpras,
        suratMasuk,
        suratKeluar,
        actionName: 'testSync',
        item: { test: true, timestamp: new Date().toISOString() }
      });

      setSyncStatus('success');
      const msg = `Tes 2-Arah Berhasil! (1) Baca Live: ${totalPeg} Pegawai, ${totalSis} Siswa terbaca. (2) Kirim Update: Sukses via ${pushRes.channel}.`;
      setStatusMessage(msg);
      onNotify(msg, 'success');
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    } catch (err: any) {
      setSyncStatus('error');
      setStatusMessage(`Uji sinkronisasi gagal: ${err.message || 'Koneksi terputus'}`);
      onNotify(`Uji sinkronisasi gagal: ${err.message}`, 'error');
    } finally {
      setIsTestingSync(false);
    }
  };

  // Toggle real-time sync
  const toggleRealtime = (val: boolean) => {
    setIsRealtimeActive(val);
    try {
      localStorage.setItem(STORAGE_KEYS.REALTIME_ACTIVE, val ? 'true' : 'false');
    } catch {}
    onNotify(val ? 'Sinkronisasi real-time spreadsheet diaktifkan.' : 'Sinkronisasi real-time dijeda.', 'info');
  };

  // =========================================================================
  // ACTION: PULL DATA REAL-TIME FROM THE SINGLE SPREADSHEET (WITH VALIDATION)
  // =========================================================================
  const handlePullRealtime = async (isBackground = false, overrideId?: string) => {
    const targetId = overrideId || activeSheetId;

    if (!isBackground) setIsFetching(true);

    try {
      // 1. Primary: Fast, direct Apps Script live data pull (Connected to Master Spreadsheet)
      let res: any = await fetchAllLiveMasterData(profil).catch(() => null);

      // 2. Fallback to GViz if sheetId is provided
      if (!res && targetId) {
        const token = await getAccessToken();
        res = await fetchMasterDatabaseRealtime(targetId, token);
      }

      if (!res) {
        throw new Error('Gagal mengambil data dari Google Apps Script Web App maupun Spreadsheet.');
      }

      let totalUpdated = 0;
      const updates: {
        pegawai?: Pegawai[];
        siswa?: Siswa[];
        sarpras?: SarprasItem[];
      } = {};

      const detectedConflicts: DataConflictItem[] = [];
      let totalDupCount = 0;

      // 1. Process & Validate Pegawai
      if (res.pegawai && res.pegawai.length > 0) {
        const pegConf = detectSyncConflicts(
          pegawai,
          res.pegawai,
          'pegawai',
          'Data Pegawai & GTK',
          (p) => p.nama,
          FIELD_LABELS,
          [(p) => p.nip]
        );
        detectedConflicts.push(...pegConf.conflicts);
        totalDupCount += pegConf.duplicateIdsInIncoming;

        const pegResult = upsertWithDeduplication(
          pegawai,
          res.pegawai,
          'pegawai',
          'Data Pegawai & GTK',
          (p) => p.nama,
          FIELD_LABELS,
          'TARIK_SPREADSHEET'
        );
        updates.pegawai = pegResult.cleaned;
        totalUpdated += pegResult.updatedCount;
      }

      // 2. Process & Validate Siswa
      if (res.siswa && res.siswa.length > 0) {
        const siswaConf = detectSyncConflicts(
          siswa,
          res.siswa,
          'siswa',
          'Data Induk Siswa',
          (s) => s.nama,
          FIELD_LABELS,
          [(s) => s.nisn, (s) => s.nis]
        );
        detectedConflicts.push(...siswaConf.conflicts);
        totalDupCount += siswaConf.duplicateIdsInIncoming;

        const siswaResult = upsertWithDeduplication(
          siswa,
          res.siswa,
          'siswa',
          'Data Induk Siswa',
          (s) => s.nama,
          FIELD_LABELS,
          'TARIK_SPREADSHEET'
        );
        updates.siswa = siswaResult.cleaned;
        totalUpdated += siswaResult.updatedCount;
      }

      // 3. Process & Validate Sarpras
      if (res.sarpras && res.sarpras.length > 0) {
        const sarprasConf = detectSyncConflicts(
          sarpras,
          res.sarpras,
          'sarpras',
          'Inventaris Sarpras',
          (s) => s.namaSarpras,
          FIELD_LABELS
        );
        detectedConflicts.push(...sarprasConf.conflicts);
        totalDupCount += sarprasConf.duplicateIdsInIncoming;

        const sarprasResult = upsertWithDeduplication(
          sarpras,
          res.sarpras,
          'sarpras',
          'Inventaris Sarpras',
          (s) => s.namaSarpras,
          FIELD_LABELS,
          'TARIK_SPREADSHEET'
        );
        updates.sarpras = sarprasResult.cleaned;
        totalUpdated += sarprasResult.updatedCount;
      }

      // Check if validation found conflicts or duplicate IDs in manual pull
      if (!isBackground && (detectedConflicts.length > 0 || totalDupCount > 0)) {
        setSyncConflicts(detectedConflicts);
        setSyncDuplicateCount(totalDupCount);
        setPendingSyncData({
          updates,
          totalUpdated,
          timestamp: res.timestamp,
        });
        setShowConflictModal(true);
        setStatusMessage(`Ditemukan ${detectedConflicts.length} konflik data & ${totalDupCount} ID ganda. Menunggu konfirmasi penimpaan...`);
        return;
      }

      // If no conflict or background sync, commit changes
      if (Object.keys(updates).length > 0) {
        onUpdateData(updates);
      }

      if (res.profil && onUpdateProfil) {
        onUpdateProfil(res.profil);
      }

      setLastSyncTime(res.timestamp);
      setSyncStatus('success');
      setStatusMessage(`Real-time sync berhasil pada ${res.timestamp}. ${totalUpdated > 0 ? `${totalUpdated} baris diperbarui.` : 'Data sudah sinkron sempurna.'}`);
      reloadChangeLogs();

      if (!isBackground) {
        onNotify(`Data dari Google Spreadsheet berhasil ditarik secara real-time! (${res.timestamp})`, 'success');
      }
    } catch (err: any) {
      console.warn('Realtime pull notice:', err);
      setSyncStatus('error');
      setStatusMessage(err.message || 'Gagal menarik data dari Google Spreadsheet.');
      if (!isBackground) {
        onNotify(err.message || 'Gagal menarik data dari Google Spreadsheet.', 'error');
      }
    } finally {
      if (!isBackground) setIsFetching(false);
    }
  };

  // =========================================================================
  // ACTION: PERBARUI / LENGKAPI STRUKTUR MASTER SPREADSHEET DI GOOGLE DRIVE
  // Mencegah pembuatan file baru agar ID spreadsheet dan Web App GAS tetap paten
  // Menambahkan sheet & kolom baru tanpa merubah data pokok awal
  // =========================================================================
  const handleCreateMasterSpreadsheet = async () => {
    setIsPushing(true);
    setStatusMessage('Menghubungkan ke Google Drive untuk melengkapi struktur Master Database...');

    try {
      let token = await getAccessToken();
      if (!token) {
        const loginRes = await googleSignIn();
        if (!loginRes?.accessToken) {
          onNotify('Login Google diperlukan untuk mengakses Google Drive.', 'error');
          setIsPushing(false);
          return;
        }
        token = loginRes.accessToken;
      }

      // Build 1 Unified Database Spreadsheet structure (including Arsip_Rapor_Mapel, Tabungan, Presensi)
      const sheets = buildMasterDatabaseSpreadsheet({
        profil,
        pegawai,
        siswa,
        rapor,
        btq,
        sarpras,
        suratMasuk,
        suratKeluar,
      });

      const currentMasterId = extractSpreadsheetId(activeSheetId || getSavedMasterSheetId() || sheetInput);

      let targetId = currentMasterId;
      let targetUrl = sheetUrl;

      // 1. Jika sudah ada Spreadsheet yang terhubung, PERBARUI TANPA MEMBUAT FILE BARU
      if (targetId) {
        setStatusMessage('Melengkapi tab sheet baru (Arsip Rapor Mapel, Tabungan, Presensi) dan isian kolom tanpa merubah data pokok awal...');
        const result = await extendOrUpdateMasterSpreadsheet(targetId, sheets, token);

        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        setSyncStatus('success');
        setShowCreateMasterConfirm(false);

        const addedMsg = result.addedSheets.length > 0 ? ` (${result.addedSheets.join(', ')} ditambahkan)` : '';
        onNotify(`Struktur Master Spreadsheet berhasil dilengkapi! Data pokok awal tetap paten, link Spreadsheet & Web App tetap terjaga.${addedMsg}`, 'success');
        return;
      }

      // 2. Jika belum ada yang terhubung, cari file master yang sudah ada di folder agar tidak buat file ganda
      setStatusMessage('Memeriksa berkas master di folder Google Drive...');
      const existingDriveFiles = await listFilesInFolder(TARGET_GDRIVE_FOLDER_ID, token);
      const matchedMaster = existingDriveFiles.find((f) =>
        f.name.includes(MASTER_SPREADSHEET_TITLE) || f.name.includes('SIM_SDN_Kedungringin1')
      );

      if (matchedMaster) {
        targetId = matchedMaster.id;
        targetUrl = matchedMaster.webViewLink || `https://docs.google.com/spreadsheets/d/${targetId}/edit`;
        setStatusMessage('Ditemukan Master Spreadsheet di Drive. Memperbarui tab dan kolom...');
        await extendOrUpdateMasterSpreadsheet(targetId, sheets, token);
      } else {
        // Hanya jika sama sekali belum ada berkas di Google Drive, buat 1 master baru
        setStatusMessage('Membuat Master Spreadsheet baru di folder Google Drive...');
        const created = await createSpreadsheetInFolder(
          TARGET_GDRIVE_FOLDER_ID,
          `${MASTER_SPREADSHEET_TITLE}_${profil.tahunPelajaranAktif.replace('/', '_')}`,
          token
        );
        targetId = created.id;
        targetUrl = created.webViewLink;
        await populateSpreadsheet(created.id, sheets, token);
      }

      // Save ID and connect
      saveMasterSheetId(targetId, targetUrl);
      setSheetInput(targetId);
      setActiveSheetId(targetId);
      if (targetUrl) setSheetUrl(targetUrl);

      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      setSyncStatus('success');
      setShowCreateMasterConfirm(false);
      onNotify('Master Database Tunggal berhasil dihubungkan dan disinkronkan secara real-time!', 'success');
    } catch (err: any) {
      console.error('Update master spreadsheet error:', err);
      onNotify(err.message || 'Gagal memperbarui Master Spreadsheet di Google Drive.', 'error');
      setSyncStatus('error');
    } finally {
      setIsPushing(false);
    }
  };

  // =========================================================================
  // ACTION: PUSH CLEAN DATA TO MASTER SPREADSHEET
  // =========================================================================
  const handlePushToMasterSpreadsheet = async () => {
    setIsPushing(true);
    setStatusMessage('Mengunggah & menyinkronkan seluruh dataset ke Google Spreadsheet Master...');

    try {
      // 1. Primary: Direct sync via Google Apps Script Web App (No OAuth required, reliable & instant)
      const res = await pushDataToMasterSpreadsheet({
        profil,
        pegawai,
        siswa,
        rapor,
        btq,
        sarpras,
        suratMasuk,
        suratKeluar,
        actionName: 'syncAllData',
      });

      // 2. Secondary: If token exists and activeSheetId is set, also populate directly via Sheets API
      if (activeSheetId) {
        try {
          const token = await getAccessToken();
          if (token) {
            const sheets = buildMasterDatabaseSpreadsheet({
              profil,
              pegawai,
              siswa,
              rapor,
              btq,
              sarpras,
              suratMasuk,
              suratKeluar,
            });
            await populateSpreadsheet(activeSheetId, sheets, token);
          }
        } catch (tokenErr) {
          console.warn('Direct Sheets API secondary push notice:', tokenErr);
        }
      }

      const syncTime = res.timestamp || new Date().toLocaleTimeString('id-ID');
      setLastSyncTime(syncTime);
      setSyncStatus('success');
      setShowPushConfirm(false);
      onNotify(res.message || 'Seluruh data SIM berhasil disinkronkan ke Master Spreadsheet!', 'success');
    } catch (err: any) {
      console.error('Push error:', err);
      onNotify(err.message || 'Gagal menyimpan ke Google Spreadsheet.', 'error');
      setSyncStatus('error');
    } finally {
      setIsPushing(false);
    }
  };

  // =========================================================================
  // CONFLICT RESOLUTION HANDLERS (SEBELUM DATA DISIMPAN)
  // =========================================================================
  const handleConfirmOverwrite = () => {
    if (!pendingSyncData) return;
    onUpdateData(pendingSyncData.updates);
    setLastSyncTime(pendingSyncData.timestamp);
    setSyncStatus('success');
    setStatusMessage(
      `Pembaruan selesai pada ${pendingSyncData.timestamp}. Seluruh data lama ditimpa dengan dataset spreadsheet terbaru tanpa duplikasi ID.`
    );
    setShowConflictModal(false);
    setPendingSyncData(null);
    reloadChangeLogs();
    onNotify(
      `Konflik berhasil diselesaikan! Data lama telah ditimpa dengan data spreadsheet terbaru (${pendingSyncData.totalUpdated} baris diperbarui).`,
      'success'
    );
  };

  const handleKeepLocal = () => {
    if (!pendingSyncData) return;
    setShowConflictModal(false);
    setPendingSyncData(null);
    setStatusMessage('Data lokal dipertahankan. Data konflik dari spreadsheet diabaikan.');
    onNotify('Data lokal dipertahankan. Data konflik dari spreadsheet dilewati.', 'info');
  };

  const handleClearLogs = () => {
    clearDataChangeRecords();
    setChangeLogs([]);
    setShowClearLogsConfirm(false);
    onNotify('Riwayat log audit perubahan data berhasil dibersihkan.', 'info');
  };

  const filteredLogs = changeLogs.filter((log) => {
    const matchSearch =
      log.description.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.entityName.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.diffs.some(
        (d) =>
          d.label.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
          String(d.oldValue).toLowerCase().includes(logSearchTerm.toLowerCase()) ||
          String(d.newValue).toLowerCase().includes(logSearchTerm.toLowerCase())
      );

    const matchModule = logModuleFilter === 'ALL' || log.module === logModuleFilter;
    const matchType = logTypeFilter === 'ALL' || log.changeType === logTypeFilter;

    return matchSearch && matchModule && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Single Database Architecture */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Single Data Utama (1 Database Master)</span>
              </span>

              {isRealtimeActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  <span>Real-time Live Sync Aktif</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Auto-Sync Dijeda</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Pusat Data Tunggal Google Spreadsheet SIM {profil.nama}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
              Seluruh entitas (Nama Pegawai, Data Siswa, Sarpras, Rapor, Persuratan) kini dikelola terpusat hanya dalam <strong>1 Google Spreadsheet Utama</strong>. Setiap penambahan atau perubahan baris di spreadsheet akan diperbarui di web secara <strong>real-time</strong> tanpa tumpang tindih ID.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => handlePullRealtime(false)}
              disabled={isFetching || !activeSheetId}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Menarik Data...' : '⚡ Tarik Real-time'}</span>
            </button>

            <button
              onClick={() => setShowPushConfirm(true)}
              disabled={isPushing || !activeSheetId}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Unggah ke Sheet</span>
            </button>
          </div>
        </div>

        {/* Live sync footer pill */}
        <div className="mt-6 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terakhir Dicek: <strong>{lastSyncTime}</strong></span>
            {activeSheetId && (
              <>
                <span>•</span>
                <span className="font-mono text-[11px] text-emerald-300">
                  ID: {activeSheetId.substring(0, 14)}...
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRealtimeActive}
                onChange={(e) => toggleRealtime(e.target.checked)}
                className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-emerald-100 font-semibold">Polling Realtime Otomatis (15s)</span>
            </label>

            <a
              href={`https://drive.google.com/drive/folders/${TARGET_GDRIVE_FOLDER_ID}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white underline cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Buka Folder Drive</span>
            </a>
          </div>
        </div>
      </div>

      {/* 1 Menu Unified Control: Tarik & Kirim vs Log Riwayat Audit Perubahan */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
        <button
          onClick={() => setActiveMainSection('sync')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainSection === 'sync'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-300" />
          <span>⚡ Pusat Tarik & Kirim Data (Pembaruan Spreadsheet)</span>
        </button>

        <button
          onClick={() => setActiveMainSection('audit_log')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainSection === 'audit_log'
              ? 'bg-purple-800 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5 text-purple-300" />
          <span>📜 Log Riwayat Perubahan Data (Audit Diff Sebelum vs Sesudah)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-purple-200 text-purple-900">
            {changeLogs.length}
          </span>
        </button>
      </div>

      {/* SECTION A: TARIK & KIRIM DATA PEMBARUAN SPREADSHEET */}
      {activeMainSection === 'sync' && (
        <div className="space-y-6">
          {/* ARCHITECTURE HIGHLIGHT BANNER: 1 MASTER SPREADSHEET (DATA + APPS SCRIPT) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-md border border-emerald-800/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30">
                  <Database className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sistem Database Master Terpadu (1 File Spreadsheet)</span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  1 Master Spreadsheet Ganda: Database Utama & Wadah Google Apps Script
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Seluruh modul SIM disatukan dalam <strong>1 Google Spreadsheet tunggal</strong>. Tidak perlu membuat banyak file terpisah. Google Apps Script ditempel langsung pada menu <em>Ekstensi → Apps Script</em> di dalam spreadsheet master ini.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
                    setCopiedGas(true);
                    setTimeout(() => setCopiedGas(false), 2500);
                    onNotify('Kode Google Apps Script Master berhasil disalin!', 'success');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  {copiedGas ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedGas ? 'Kode Tersalin!' : 'Salin Kode Apps Script'}</span>
                </button>

                <button
                  onClick={() => setShowGasModal(!showGasModal)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-all cursor-pointer border border-white/20 whitespace-nowrap"
                >
                  <Code className="w-4 h-4 text-amber-300" />
                  <span>{showGasModal ? 'Tutup Script' : 'Lihat Script (Code.gs)'}</span>
                </button>
              </div>
            </div>

            {/* 11 Sheets In 1 Master File */}
            <div className="pt-2 border-t border-emerald-800/60">
              <p className="text-[11px] font-bold text-emerald-200 mb-2">
                11 Sheet yang Termuat Otomatis dalam 1 Master Spreadsheet:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Data_Pegawai', 'Data_Siswa', 'Rekap_Rapor', 'Nilai_BTQ',
                  'Sarpras_Aset', 'Surat_Keluar', 'Surat_Masuk', 'Profil_Sekolah',
                  'Perangkat_Ajar', 'Presensi_Faceprint', 'E_Kinerja_SKP'
                ].map((name) => (
                  <span
                    key={name}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 shadow-2xs"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Expanded GAS Code Modal/Drawer */}
            {showGasModal && (
              <div className="pt-3 border-t border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-mono text-[11px]">Salin dan tempel ke <strong>Ekstensi → Apps Script</strong> pada spreadsheet master Anda:</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">Code.gs (Container-Bound)</span>
                </div>
                <pre className="bg-slate-950 p-4 rounded-xl text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-60 border border-slate-800 scrollbar-thin">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            )}
          </div>

          {/* 2-Way Sync Explanatory & Status Card */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-emerald-800/50 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                  <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                    <span>Mekanisme Sinkronisasi 2-Arah Otomatis (Real-time)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Aktif 24/7
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Pembaruan data berjalan timbal balik otomatis antara Web SIM dan Google Spreadsheet.
                  </p>
                </div>
              </div>

              <button
                onClick={handleTest2WaySync}
                disabled={isTestingSync || !activeSheetId}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
              >
                <Zap className={`w-4 h-4 text-amber-300 ${isTestingSync ? 'animate-bounce' : ''}`} />
                <span>{isTestingSync ? 'Menguji Koneksi...' : '⚡ Uji Sinkronisasi 2 Arah'}</span>
              </button>
            </div>

            {/* 2 Cara Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {/* Cara 1 */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 font-black text-xs flex items-center justify-center border border-blue-400/30">
                    1
                  </span>
                  <h4 className="text-xs font-bold text-blue-200">
                    Spreadsheet ➔ Web SIM (Auto-Baca)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Jika Anda merubah atau menambah baris langsung di Google Spreadsheet, web SIM <strong>otomatis membaca dan menampilkan data terkini</strong> (polling aktif setiap 8 detik dan auto-refresh seketika saat Anda kembali membuka tab web).
                </p>
                <div className="flex items-center gap-2 text-[10px] text-blue-300 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Polling 8s + Auto-Sync Tab Focus Aktif</span>
                </div>
              </div>

              {/* Cara 2 */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-400/30">
                    2
                  </span>
                  <h4 className="text-xs font-bold text-emerald-200">
                    Web SIM ➔ Spreadsheet (Auto-Kirim)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Ketika Anda mengedit di web (klik <strong>Ubah</strong> lalu <strong>Simpan</strong> pada form Pegawai, Siswa, Sarpras, Nilai Rapor, BTQ, Surat), data <strong>secara otomatis terkirim ke Google Spreadsheet</strong> dan menyimpan perubahan tanpa perlu ekspor manual.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-emerald-300 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Backend Proxy /api/sync-spreadsheet Bebas CORS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Card: Google Spreadsheet Input & Controls */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-emerald-700" />
                  <span>Koneksi Google Spreadsheet Utama (Single Database)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Masukkan ID atau Tautan Berbagi Spreadsheet untuk membaca dan memperbarui data secara real-time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateMasterConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-300"
                  title="Menambahkan sheet dan kolom baru ke spreadsheet master yang terhubung tanpa membuat berkas baru (link tetap paten)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Perbarui / Lengkapi Master di Drive</span>
                </button>

                <button
                  onClick={() => setShowPurgeConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer border border-rose-200"
                  title="Hapus data dummy yang tersimpan pada web"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Data Dummy Web</span>
                </button>
              </div>
            </div>

            {/* Input & Connect Action for Spreadsheet */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  placeholder="Tempel Tautan Google Spreadsheet (https://docs.google.com/spreadsheets/d/...) atau ID"
                  className="w-full px-4 py-2.5 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-mono"
                />
              </div>

              <button
                onClick={handleSaveConnection}
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                Hubungkan Spreadsheet
              </button>

              {activeSheetId && (
                <a
                  href={sheetUrl || `https://docs.google.com/spreadsheets/d/${activeSheetId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-300 whitespace-nowrap cursor-pointer"
                >
                  <span>Buka Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Google Apps Script Web App Endpoint Input */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-bold text-emerald-950">
                    Endpoint Google Apps Script Web App (Jalur Eksekusi Simpan Data):
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(webAppInput);
                      onNotify('URL Web App berhasil disalin ke papan klip!', 'success');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 font-bold text-[11px] hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Salin</span>
                  </button>
                  <button
                    onClick={() => {
                      setWebAppInput(LOCKED_WEB_APP_URL);
                      saveWebAppUrl(LOCKED_WEB_APP_URL);
                      onNotify('URL Web App dikembalikan ke default terkunci!', 'info');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[11px] hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Reset Default
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={webAppInput}
                  onChange={(e) => setWebAppInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 px-3 py-2 text-xs font-mono border border-emerald-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  onClick={handleSaveWebAppConnection}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  Simpan URL Web App
                </button>
              </div>
            </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 border ${
            syncStatus === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : syncStatus === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              {syncStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : syncStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>

            {syncStatus === 'success' && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Real-time Ready
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3 Metric Summary Cards (Single Database State) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Pegawai */}
        <div 
          onClick={() => setActivePreviewTab('pegawai')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activePreviewTab === 'pegawai'
              ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500/10'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Sheet: Data_Pegawai
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{pegawai.length}</div>
          <div className="text-xs font-bold text-slate-800 mt-0.5">Nama Pegawai & Tenaga Pendidik</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Data identitas, NIP, pangkat/golongan, dan penugasan guru kelas.
          </p>
        </div>

        {/* Card 2: Siswa */}
        <div 
          onClick={() => setActivePreviewTab('siswa')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activePreviewTab === 'siswa'
              ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/10'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Sheet: Data_Siswa
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{siswa.length}</div>
          <div className="text-xs font-bold text-slate-800 mt-0.5">Nama Siswa & Buku Induk</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Data NISN, kelas 1–6, biodata orang tua, dan status peserta didik aktif.
          </p>
        </div>

        {/* Card 3: Sarpras & Aset */}
        <div 
          onClick={() => setActivePreviewTab('sarpras')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activePreviewTab === 'sarpras'
              ? 'bg-amber-50/70 border-amber-500 shadow-sm ring-2 ring-amber-500/10'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Sheet: Sarpras_Aset
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{sarpras.length}</div>
          <div className="text-xs font-bold text-slate-800 mt-0.5">Aset Sarana & Prasarana</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Fasilitas ruang kelas, meubelair, kondisi kelaikan, dan inventaris BOS.
          </p>
        </div>
      </div>

      {/* Real-time Data Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <h4 className="font-bold text-sm text-slate-900">
              Pratinjau Data Real-time dari Master Database:
            </h4>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              {activePreviewTab === 'pegawai' ? 'Data_Pegawai' : activePreviewTab === 'siswa' ? 'Data_Siswa' : 'Sarpras_Aset'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActivePreviewTab('pegawai')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePreviewTab === 'pegawai'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pegawai ({pegawai.length})
            </button>
            <button
              onClick={() => setActivePreviewTab('siswa')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePreviewTab === 'siswa'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Siswa ({siswa.length})
            </button>
            <button
              onClick={() => setActivePreviewTab('sarpras')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePreviewTab === 'sarpras'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sarpras ({sarpras.length})
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto max-h-96 scrollbar-thin">
          {activePreviewTab === 'pegawai' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">No</th>
                  <th className="py-2.5 px-3 font-semibold">NIP</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Lengkap & Gelar</th>
                  <th className="py-2.5 px-3 font-semibold">Jabatan</th>
                  <th className="py-2.5 px-3 font-semibold">Status / Gol</th>
                  <th className="py-2.5 px-3 font-semibold">Kontak</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pegawai.map((p, idx) => (
                  <tr key={`${p.nip || p.id || 'peg'}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">{p.nip || '-'}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {p.gelarDepan ? p.gelarDepan + ' ' : ''}{p.nama}{p.gelarBelakang ? ', ' + p.gelarBelakang : ''}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{p.jabatan}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.statusKepegawaian === 'PNS' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.statusKepegawaian} • {p.golongan || '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{p.kontak || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Tersinkron</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activePreviewTab === 'siswa' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">No</th>
                  <th className="py-2.5 px-3 font-semibold">NISN</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Siswa</th>
                  <th className="py-2.5 px-3 font-semibold">Kelas</th>
                  <th className="py-2.5 px-3 font-semibold">JK</th>
                  <th className="py-2.5 px-3 font-semibold">Orang Tua</th>
                  <th className="py-2.5 px-3 font-semibold">Alamat Domisili</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siswa.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Data siswa saat ini kosong (data dummy telah dibersihkan). Tarik data dari Google Spreadsheet utama.
                    </td>
                  </tr>
                ) : (
                  siswa.map((s, idx) => (
                    <tr key={`${s.nisn || s.id || 'sis'}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">{s.nisn || '-'}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{s.nama}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">Kelas {s.kelas}</td>
                      <td className="py-2.5 px-3 text-slate-700">{s.jenisKelamin === 'L' ? 'L' : 'P'}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{s.namaAyah || s.namaIbu || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] truncate max-w-xs">{s.alamat || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Aktif</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activePreviewTab === 'sarpras' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">No</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Sarpras / Aset</th>
                  <th className="py-2.5 px-3 font-semibold">Kategori</th>
                  <th className="py-2.5 px-3 font-semibold">Jumlah</th>
                  <th className="py-2.5 px-3 font-semibold">Kondisi</th>
                  <th className="py-2.5 px-3 font-semibold">Lokasi</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sarpras.map((s, idx) => (
                  <tr key={`${s.id || 'sar'}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{s.namaSarpras}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.kategori}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{s.jumlah} {s.satuan}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.kondisi === 'Baik' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {s.kondisi}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{s.lokasi}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Tercatat</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )}

  {/* SECTION B: AUDIT LOG RIWAYAT PERUBAHAN DATA (SEBELUM VS SESUDAH) */}
  {activeMainSection === 'audit_log' && (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-purple-700" />
            <span>Log Riwayat Audit Perubahan Data (Diff Sebelum vs Sesudah)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mencatat setiap proses update, penimpaan ID, dan penyelarasan spreadsheet untuk audit integritas data.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportDataChangesToCSV(filteredLogs)}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors border border-purple-200 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => setShowClearLogsConfirm(true)}
            disabled={changeLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Modul:</span>
          </span>
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'pegawai', label: 'Pegawai' },
            { id: 'siswa', label: 'Siswa' },
            { id: 'sarpras', label: 'Sarpras' },
            { id: 'surat_keluar', label: 'Surat Keluar' },
            { id: 'surat_masuk', label: 'Surat Masuk' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setLogModuleFilter(m.id)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                logModuleFilter === m.id
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari entitas, ID, bidang, perubahan..."
            value={logSearchTerm}
            onChange={(e) => setLogSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
            Tidak ada catatan perubahan data yang sesuai kriteria pencarian.
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={`${log.id || 'audit'}-${idx}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 hover:border-purple-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {log.entityName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                          ID: {log.entityId}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          {log.moduleLabel}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {log.changeType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{log.description}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 inline-block">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                      {log.diffs.length} Perubahan Field
                    </span>
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Diff View: Sebelum (Old) vs Sesudah (New) */}
                {isExpanded && log.diffs.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
                          <th className="py-1.5 px-2">Bidang Data</th>
                          <th className="py-1.5 px-2 bg-rose-50/60 text-rose-900">Sebelum (Nilai Lama)</th>
                          <th className="py-1.5 px-2 bg-emerald-50/60 text-emerald-900">Sesudah (Nilai Baru)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {log.diffs.map((d, dIdx) => (
                          <tr key={dIdx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-2 font-bold text-slate-800">
                              {d.label}
                            </td>
                            <td className="py-2 px-2 bg-rose-50/30 text-rose-800 font-mono text-[11px]">
                              {String(d.oldValue || '-')}
                            </td>
                            <td className="py-2 px-2 bg-emerald-50/30 text-emerald-800 font-mono font-bold text-[11px]">
                              {String(d.newValue || '-')}
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
    </div>
  )}

  {/* Modal Konfirmasi Deteksi Konflik & Validasi ID Ganda */}
  <SyncConflictModal
    isOpen={showConflictModal}
    conflicts={syncConflicts}
    duplicateCount={syncDuplicateCount}
    onConfirmOverwrite={handleConfirmOverwrite}
    onKeepCurrent={handleKeepLocal}
    onCancel={() => {
      setShowConflictModal(false);
      setPendingSyncData(null);
      setStatusMessage('Sinkronisasi dibatalkan oleh pengguna.');
    }}
  />

  {/* Clear Logs Confirmation Modal */}
  <ConfirmModal
    isOpen={showClearLogsConfirm}
    title="Bersihkan Log Riwayat Perubahan"
    message="Apakah Anda yakin ingin menghapus seluruh rekaman log riwayat perubahan data? Tindakan ini tidak dapat dibatalkan."
    confirmText="Ya, Bersihkan Log"
    cancelText="Batal"
    variant="danger"
    onConfirm={handleClearLogs}
    onCancel={() => setShowClearLogsConfirm(false)}
  />

  {/* Confirmation Modals */}
  <ConfirmModal
    isOpen={showPurgeConfirm}
    title="Bersihkan Data Dummy Web"
    message="Tindakan ini akan menghapus data dummy dan placeholder dari tampilan web dan penyimpanan lokal, sehingga web 100% hanya menampilkan data murni dari Master Google Spreadsheet utama. Lanjutkan?"
    confirmText="Ya, Bersihkan Data Dummy"
    cancelText="Batal"
    variant="warning"
    onConfirm={() => {
      setShowPurgeConfirm(false);
      onPurgeDummyData();
    }}
    onCancel={() => setShowPurgeConfirm(false)}
  />

  <ConfirmModal
    isOpen={showCreateMasterConfirm}
    title="Lengkapi & Perbarui Struktur Master di Drive"
    message={`Sistem akan memeriksa berkas Spreadsheet Master yang terhubung (${activeSheetId || 'SDN Kedungringin 1 Master'}), lalu menambahkan sheet baru (termasuk Arsip Rapor per Mapel, Tabungan, Presensi) serta melengkapi kolom baru TANPA MEMBUAT BERKAS BARU di Google Drive. Data pokok awal (GTK, Siswa, dll) tetap dipatenkan dan tidak akan tertimpa atau tergandakan. Tautan Spreadsheet dan Web App tetap paten.`}
    confirmText="Perbarui Struktur Master"
    cancelText="Batal"
    variant="info"
    onConfirm={handleCreateMasterSpreadsheet}
    onCancel={() => setShowCreateMasterConfirm(false)}
  />

  <ConfirmModal
    isOpen={showPushConfirm}
    title="Unggah Data Bersih ke Master Spreadsheet"
    message="Sistem akan menyinkronkan data yang sedang aktif di aplikasi web ke dalam Master Google Spreadsheet, menimpa baris lama jika memiliki ID yang sama sehingga spreadsheet tetap rapi tanpa baris ganda bertumpuk. Lanjutkan?"
    confirmText="Unggah & Sinkronkan"
    cancelText="Batal"
    variant="info"
    onConfirm={handlePushToMasterSpreadsheet}
    onCancel={() => setShowPushConfirm(false)}
  />
</div>
  );
};
