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
  FaceprintPresensi,
  SkpEKinerja,
  BukuPerpustakaan,
  PeminjamanBuku,
  AnggotaPerpustakaan,
  PengunjungPerpustakaan,
  RuangKelasDetail,
  UserRole
} from '../types';
import { 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken, 
  initAuth 
} from '../services/googleAuth';
import { 
  TARGET_GDRIVE_FOLDER_ID,
  TARGET_GDRIVE_FOLDER_URL,
  DriveFileItem,
  listFilesInFolder,
  createSpreadsheetInFolder,
  populateSpreadsheet,
  buildDataIndukSiswaSheets,
  buildRekapRaporSheets,
  buildKepegawaianSheets,
  buildPerpustakaanSheets,
  buildKeadministrasianRuangKelasSheets,
  buildSarprasSheets,
  buildPersuratanSheets
} from '../services/googleDriveSheets';
import { 
  INITIAL_BUKU_PERPUSTAKAAN,
  INITIAL_PEMINJAMAN_BUKU,
  INITIAL_ANGGOTA_PERPUSTAKAAN,
  INITIAL_PENGUNJUNG_PERPUSTAKAAN,
  INITIAL_RUANG_KELAS
} from '../data/sarprasData';
import { ConfirmModal } from './ConfirmModal';
import { 
  Database, 
  FileSpreadsheet, 
  FolderCheck, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  FileText, 
  Users, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  School, 
  Mail, 
  Check, 
  Clock, 
  LogOut,
  Award
} from 'lucide-react';

interface GoogleDriveSyncProps {
  profil: ProfilSekolah;
  siswa: Siswa[];
  pegawai: Pegawai[];
  rapor: RekapRaporSiswa[];
  btq: NilaiIjazahBTQ[];
  sarpras: SarprasItem[];
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  presensiList: FaceprintPresensi[];
  skpList: SkpEKinerja[];
  userRole?: UserRole;
}

export const GoogleDriveSync: React.FC<GoogleDriveSyncProps> = ({
  profil,
  siswa,
  pegawai,
  rapor,
  btq,
  sarpras,
  suratMasuk,
  suratKeluar,
  presensiList,
  skpList,
  userRole = 'admin',
}) => {
  // Google Auth State
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Folder Files State
  const [filesInFolder, setFilesInFolder] = useState<DriveFileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  // Sync / Generation State
  const [syncingKey, setSyncingKey] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastCreatedUrl, setLastCreatedUrl] = useState<string | null>(null);

  // Confirmation Modal State (MANDATORY for mutating operations per Workspace skill)
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  // Load Sarpras extra data
  const bukuList: BukuPerpustakaan[] = React.useMemo(() => {
    const s = localStorage.getItem('app_perpustakaan_buku');
    return s ? JSON.parse(s) : INITIAL_BUKU_PERPUSTAKAAN;
  }, []);

  const peminjamanList: PeminjamanBuku[] = React.useMemo(() => {
    const s = localStorage.getItem('app_perpustakaan_peminjaman');
    return s ? JSON.parse(s) : INITIAL_PEMINJAMAN_BUKU;
  }, []);

  const anggotaList: AnggotaPerpustakaan[] = React.useMemo(() => {
    const s = localStorage.getItem('app_perpustakaan_anggota');
    return s ? JSON.parse(s) : INITIAL_ANGGOTA_PERPUSTAKAAN;
  }, []);

  const pengunjungList: PengunjungPerpustakaan[] = React.useMemo(() => {
    const s = localStorage.getItem('app_perpustakaan_pengunjung');
    return s ? JSON.parse(s) : INITIAL_PENGUNJUNG_PERPUSTAKAAN;
  }, []);

  const ruangKelasList: RuangKelasDetail[] = React.useMemo(() => {
    const s = localStorage.getItem('app_sarpras_ruang_kelas');
    return s ? JSON.parse(s) : INITIAL_RUANG_KELAS;
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        fetchFolderFiles(token);
      },
      () => {
        setGoogleUser(null);
        setFilesInFolder([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchFolderFiles = async (tokenOverride?: string) => {
    setLoadingFiles(true);
    setFolderError(null);
    try {
      const token = tokenOverride || (await getAccessToken());
      if (!token) return;
      const files = await listFilesInFolder(TARGET_GDRIVE_FOLDER_ID, token);
      setFilesInFolder(files);
    } catch (err: any) {
      console.error('Fetch folder error:', err);
      setFolderError(err.message || 'Gagal memuat berkas dari folder Google Drive.');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        await fetchFolderFiles(res.accessToken);
      }
    } catch (err: any) {
      if (
        err?.code !== 'auth/popup-closed-by-user' && 
        err?.code !== 'auth/cancelled-popup-request' &&
        !err?.message?.includes('popup-closed-by-user')
      ) {
        setAuthError(err.message || 'Gagal login dengan akun Google.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setFilesInFolder([]);
    setSuccessMessage(null);
  };

  // Modules definition to populate
  const spreadsheetModules = [
    {
      key: 'data_siswa',
      title: 'SIM_SDN_Kedungringin1_Data_Induk_Siswa_dan_Rekapitulasi',
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
      category: 'Kesiswaan',
      sheetsCount: '2 Sheet (Data Induk & Rekapitulasi Usia x JK x Kelas)',
      recordsCount: `${siswa.length} Siswa`,
      description: 'Buku induk peserta didik lengkap dengan NISN, orang tua, status, serta matriks rekapitulasi usia dan rombel.',
      builder: () => buildDataIndukSiswaSheets(siswa, profil),
    },
    {
      key: 'rekap_rapor',
      title: 'SIM_SDN_Kedungringin1_Rekap_Nilai_Rapor_dan_TKA',
      icon: <Award className="w-5 h-5 text-indigo-600" />,
      category: 'Kesiswaan & Kurikulum',
      sheetsCount: '1 Sheet (Rapor Sem 7 s.d. 12 + TKA)',
      recordsCount: `${rapor.length} Rapor Siswa`,
      description: 'Transkrip nilai rapor kelas 4–6 (8 mapel wajib), kalkulasi 5 vs 4 semester, TKA Numerasi/Literasi/IPA, & rangking.',
      builder: () => buildRekapRaporSheets(rapor, profil),
    },
    {
      key: 'kepegawaian',
      title: 'SIM_SDN_Kedungringin1_Kepegawaian_ASN_dan_Presensi_Faceprint',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      category: 'Kepegawaian & GTK',
      sheetsCount: '3 Sheet (Laporan ASN Bulanan, Presensi Faceprint, SKP Tribulan)',
      recordsCount: `${pegawai.length} Pegawai & ${presensiList.length} Log Presensi`,
      description: 'Laporan ASN (SK Pangkat, SK KGB, MKG), Log biometrik presensi faceprint harian, dan evaluasi SKP E-Kinerja BKN.',
      builder: () => buildKepegawaianSheets(pegawai, presensiList, skpList, profil),
    },
    {
      key: 'perpustakaan',
      title: 'SIM_SDN_Kedungringin1_Administrasi_Kepustakaan_Pelita_Ilmu',
      icon: <BookOpen className="w-5 h-5 text-teal-600" />,
      category: 'Sarpras & Kepustakaan',
      sheetsCount: '4 Sheet (Katalog, Sirkulasi, Anggota, Kunjungan)',
      recordsCount: `${bukuList.length} Judul Buku & ${anggotaList.length} Anggota`,
      description: 'Katalog buku Kurikulum Merdeka, sirkulasi peminjaman, buku induk anggota, dan presensi kunjungan harian perpustakaan.',
      builder: () => buildPerpustakaanSheets(bukuList, peminjamanList, anggotaList, pengunjungList, profil),
    },
    {
      key: 'ruang_kelas',
      title: 'SIM_SDN_Kedungringin1_Keadministrasian_Ruang_Kelas_1_sd_6',
      icon: <School className="w-5 h-5 text-purple-600" />,
      category: 'Sarpras & Kelas',
      sheetsCount: '4 Sheet (Inventaris Kelas, Struktur, Piket, Refleksi)',
      recordsCount: `${ruangKelasList.length} Ruang Kelas`,
      description: 'Inventaris fisik kelas 1–6, struktur organisasi paguyuban kelas, jadwal piket kebersihan harian, dan jurnal refleksi.',
      builder: () => buildKeadministrasianRuangKelasSheets(ruangKelasList, profil),
    },
    {
      key: 'sarpras_inventaris',
      title: 'SIM_SDN_Kedungringin1_Inventaris_Sarpras_Sekolah',
      icon: <Building2 className="w-5 h-5 text-amber-600" />,
      category: 'Sarpras Fasilitas',
      sheetsCount: '1 Sheet (Inventaris Sarpras)',
      recordsCount: `${sarpras.length} Unit Sarpras`,
      description: 'Buku inventaris aset dan sarana prasarana sekolah, kategori fisik, kelaikan (Baik/Rusak), dan luas area.',
      builder: () => buildSarprasSheets(sarpras, profil),
    },
    {
      key: 'persuratan',
      title: 'SIM_SDN_Kedungringin1_Buku_Agenda_Persuratan_Masuk_dan_Keluar',
      icon: <Mail className="w-5 h-5 text-rose-600" />,
      category: 'Tata Usaha',
      sheetsCount: '2 Sheet (Agenda Surat Masuk & Registrasi Surat Keluar)',
      recordsCount: `${suratMasuk.length + suratKeluar.length} Surat`,
      description: 'Buku agenda penomoran persuratan sekolah, disposisi kepala sekolah, dan arsip registrasi surat dinas.',
      builder: () => buildPersuratanSheets(suratMasuk, suratKeluar, profil),
    },
  ];

  // Execute single sync
  const executeSync = async (mod: typeof spreadsheetModules[0]) => {
    const token = await getAccessToken();
    if (!token) {
      handleSignIn();
      return;
    }

    setSyncingKey(mod.key);
    setSyncProgress(`Membuat Google Spreadsheet "${mod.title}" di folder Drive...`);
    setSuccessMessage(null);

    try {
      // 1. Create file in folder
      const created = await createSpreadsheetInFolder(TARGET_GDRIVE_FOLDER_ID, mod.title, token);
      
      // 2. Populate sheets
      setSyncProgress(`Mengunggah baris data dan format sheet ke Google Spreadsheet...`);
      const sheetsData = mod.builder();
      await populateSpreadsheet(created.id, sheetsData, token);

      setSuccessMessage(`Berhasil membuat dan melengkapi spreadsheet "${mod.title}" di folder Google Drive!`);
      setLastCreatedUrl(created.webViewLink);
      
      // Refresh file list
      await fetchFolderFiles(token);
    } catch (err: any) {
      console.error('Sync error:', err);
      setFolderError(err.message || `Gagal menyinkronkan spreadsheet ${mod.title}`);
    } finally {
      setSyncingKey(null);
      setSyncProgress(null);
    }
  };

  // Trigger sync with Mandatory Confirmation Dialog
  const requestSync = (mod: typeof spreadsheetModules[0]) => {
    setConfirmModalData({
      isOpen: true,
      title: `Buat Spreadsheet: ${mod.title}?`,
      message: `Tindakan ini akan membuat file Google Spreadsheet baru di folder Google Drive Anda (${mod.sheetsCount}, ${mod.recordsCount}). Lanjutkan?`,
      action: async () => {
        await executeSync(mod);
      },
    });
  };

  // Sync All Spreadsheets Master Flow
  const requestSyncAll = () => {
    setConfirmModalData({
      isOpen: true,
      title: 'Lengkapi & Buat Seluruh Spreadsheet SIM SDN Kedungringin 1?',
      message: `Tindakan ini akan membuat 7 berkas Google Spreadsheet lengkap (Data Siswa, Rekap Rapor & TKA, Kepegawaian & Faceprint, Perpustakaan, Keadministrasian Ruang Kelas 1-6, Sarpras, dan Persuratan) langsung di folder Google Drive target: https://drive.google.com/drive/folders/${TARGET_GDRIVE_FOLDER_ID}. Apakah Anda setuju?`,
      action: async () => {
        const token = await getAccessToken();
        if (!token) {
          handleSignIn();
          return;
        }

        setSyncingKey('ALL');
        setSuccessMessage(null);

        try {
          for (let i = 0; i < spreadsheetModules.length; i++) {
            const mod = spreadsheetModules[i];
            setSyncProgress(`[${i + 1}/${spreadsheetModules.length}] Membuat spreadsheet "${mod.title}"...`);
            const created = await createSpreadsheetInFolder(TARGET_GDRIVE_FOLDER_ID, mod.title, token);
            
            setSyncProgress(`[${i + 1}/${spreadsheetModules.length}] Mengunggah lembar kerja data "${mod.title}"...`);
            const sheetsData = mod.builder();
            await populateSpreadsheet(created.id, sheetsData, token);
          }

          setSuccessMessage('Luar biasa! Seluruh 7 berkas spreadsheet SIM SDN Kedungringin 1 Beji telah lengkap dibuat dan tersimpan di folder Google Drive target!');
          await fetchFolderFiles(token);
        } catch (err: any) {
          console.error('Sync All error:', err);
          setFolderError(err.message || 'Terjadi kesalahan saat menyinkronkan seluruh spreadsheet.');
        } finally {
          setSyncingKey(null);
          setSyncProgress(null);
        }
      },
    });
  };

  const downloadModuleCSV = (mod: typeof spreadsheetModules[0]) => {
    const sheets = mod.builder();
    for (const s of sheets) {
      const csvContent = s.rows.map((row) => 
        row.map((val) => {
          const str = String(val ?? '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      ).join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${mod.title}_${s.title}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner GDrive Connection */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-cyan-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Integrasi Resmi Google Workspace • Drive & Sheets API
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sinkronisasi Google Drive & Spreadsheet SIM
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Layanan otomatisasi untuk membuat, melengkapi, dan menyinkronkan seluruh file spreadsheet sistem informasi manajemen <strong>SDN Kedungringin 1 Beji</strong> langsung ke folder Google Drive resmi sekolah.
            </p>

            {/* Folder Target Badge */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={TARGET_GDRIVE_FOLDER_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
              >
                <FolderCheck className="w-4 h-4 text-emerald-300" />
                <span>Folder Target: ID: {TARGET_GDRIVE_FOLDER_ID.slice(0, 12)}...</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-200" />
              </a>

              {googleUser && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  Terhubung: {googleUser.email}
                </span>
              )}
            </div>
          </div>

          {/* Right Action / Auth Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {!googleUser ? (
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.31 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{isLoggingIn ? 'Menghubungkan...' : 'Hubungkan Akun Google'}</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={requestSyncAll}
                  disabled={Boolean(syncingKey)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Lengkapi Semua Spreadsheet di GDrive</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Logout Akun Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress or Status Bar */}
        {syncProgress && (
          <div className="mt-5 pt-4 border-t border-emerald-700/60 flex items-center gap-3 text-xs text-amber-200">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
            <span className="font-semibold">{syncProgress}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-5 pt-4 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">{successMessage}</span>
            </div>
            {lastCreatedUrl && (
              <a
                href={lastCreatedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-400 transition-colors"
              >
                <span>Buka Spreadsheet Baru</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {folderError && (
          <div className="mt-5 pt-4 border-t border-rose-700/60 flex items-center gap-2 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{folderError}</span>
          </div>
        )}
      </div>

      {/* Files currently in Google Drive Folder */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderCheck className="w-5 h-5 text-emerald-700" />
              Daftar File di Folder Google Drive Resmi Sekolah
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Folder: <code className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{TARGET_GDRIVE_FOLDER_ID}</code> • Menampilkan spreadsheet dan dokumen yang sudah terunggah.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={TARGET_GDRIVE_FOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Buka di Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {googleUser && (
              <button
                onClick={() => fetchFolderFiles()}
                disabled={loadingFiles}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                title="Muat Ulang Berkas Folder"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* File Table or Empty State */}
        {!googleUser ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">
              Silakan hubungkan akun Google Anda di atas untuk melihat isi folder dan melengkapi spreadsheet secara otomatis.
            </p>
            <button
              onClick={handleSignIn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Hubungkan Google Sekarang
            </button>
          </div>
        ) : loadingFiles ? (
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Membaca file dari Google Drive...</span>
          </div>
        ) : filesInFolder.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-dashed border-emerald-200 space-y-2">
            <Sparkles className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-slate-900">Folder masih kosong!</p>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Klik tombol <strong>"Lengkapi Semua Spreadsheet di GDrive"</strong> untuk otomatis mengunggah seluruh kebutuhan administrasi SIM SDN Kedungringin 1 Beji.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Nama Berkas Spreadsheet</th>
                  <th className="p-3">Tipe Berkas</th>
                  <th className="p-3">Terakhir Diperbarui</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filesInFolder.map((file, idx) => (
                  <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-emerald-700 font-bold">📗</span>
                        <span className="font-bold text-slate-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-[10px]">
                        Google Spreadsheet
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="p-3 text-center">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-sm transition-colors"
                        >
                          <span>Buka di Sheets</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grid of 7 Comprehensive SIM Modules to Sync */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Modul Administrasi Spreadsheet SIM SDN Kedungringin 1 Beji
            </h3>
            <p className="text-xs text-slate-500">
              Pilih dan lengkapi spreadsheet per divisi atau sinkronkan secara mandiri.
            </p>
          </div>

          {googleUser && (
            <button
              onClick={requestSyncAll}
              disabled={Boolean(syncingKey)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Sinkronkan Semua ({spreadsheetModules.length} Berkas)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {spreadsheetModules.map((mod) => {
            const isSyncing = syncingKey === mod.key;
            const existingFile = filesInFolder.find((f) => f.name.includes(mod.title));

            return (
              <div
                key={mod.key}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {mod.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {mod.recordsCount}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                      {mod.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                        {mod.title.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{mod.sheetsCount}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {existingFile ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sudah di Drive
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Siap Dibuat</span>
                  )}

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <button
                      onClick={() => downloadModuleCSV(mod)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                      title="Unduh Berkas Spreadsheet (.CSV)"
                    >
                      <Download className="w-3 h-3 text-emerald-700" />
                      <span>Unduh CSV</span>
                    </button>

                    {existingFile?.webViewLink && (
                      <a
                        href={existingFile.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition-colors"
                        title="Buka Spreadsheet di Tab Baru"
                      >
                        Buka
                      </a>
                    )}

                    <button
                      onClick={() => requestSync(mod)}
                      disabled={Boolean(syncingKey)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Proses...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3 h-3" />
                          <span>{existingFile ? 'Perbarui' : 'Buat di Drive'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal (MANDATORY per Workspace guidelines) */}
      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        title={confirmModalData.title}
        message={confirmModalData.message}
        confirmText="Ya, Lanjutkan"
        cancelText="Batal"
        variant="info"
        onConfirm={async () => {
          setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
          await confirmModalData.action();
        }}
        onCancel={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
