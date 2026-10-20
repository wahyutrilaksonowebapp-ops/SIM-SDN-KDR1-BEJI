import React, { useState } from 'react';
import { 
  Database, 
  FileText, 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Layers, 
  CheckCircle2, 
  SendHorizontal,
  RefreshCw,
  AlertCircle,
  FolderCheck,
  History,
  Sparkles
} from 'lucide-react';
import { 
  GOOGLE_DOCS_SURAT_TEMPLATE, 
  GOOGLE_DOCS_BTQ_TEMPLATE, 
  GOOGLE_APPS_SCRIPT_CODE 
} from '../data/initialData';
import { syncWithGoogleAppsScript } from '../services/api';
import { GoogleDriveSync } from './GoogleDriveSync';
import { ActivityLogMonitor } from './ActivityLogMonitor';
import { SmartDataSyncPanel } from './SmartDataSyncPanel';
import { SingleMasterDatabasePanel } from './SingleMasterDatabasePanel';
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
  UserRole
} from '../types';

interface DocsAndGasProps {
  profil?: ProfilSekolah;
  siswa?: Siswa[];
  pegawai?: Pegawai[];
  rapor?: RekapRaporSiswa[];
  btq?: NilaiIjazahBTQ[];
  sarpras?: SarprasItem[];
  suratMasuk?: SuratMasuk[];
  suratKeluar?: SuratKeluar[];
  presensiList?: FaceprintPresensi[];
  skpList?: SkpEKinerja[];
  userRole?: UserRole;
  onUpdateData?: (newData: {
    siswa?: Siswa[];
    pegawai?: Pegawai[];
    rapor?: RekapRaporSiswa[];
    btq?: NilaiIjazahBTQ[];
    sarpras?: SarprasItem[];
    suratMasuk?: SuratMasuk[];
    suratKeluar?: SuratKeluar[];
  }) => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onPurgeDummyData?: () => void;
}

export const DocsAndGas: React.FC<DocsAndGasProps> = ({
  profil = {
    nama: 'SDN Kedungringin 1 Beji',
    npsn: '20519312',
    bentukPendidikan: 'SD',
    status: 'Negeri',
    akreditasi: 'A',
    skPendirian: '421.2/012/424.072/1982',
    tanggalSk: '1982-01-10',
    alamat: 'Jl. Raya Beji No. 12',
    kelurahan: 'Kedungringin',
    kecamatan: 'Beji',
    kabupaten: 'Kabupaten Pasuruan',
    provinsi: 'Jawa Timur',
    kodePos: '67154',
    telepon: '(0343) 656123',
    email: 'sdnkedungringin1beji@gmail.com',
    kepalaSekolah: 'Hj. Siti Fatimah, S.Pd., M.Pd.',
    nipKepalaSekolah: '19740512 199803 2 004',
    pangkatKepalaSekolah: 'Pembina Tk. I (IV/b)',
    tahunPelajaranAktif: '2024/2025',
    tanggalAcuanUsia: '2024-07-01',
  },
  siswa = [],
  pegawai = [],
  rapor = [],
  btq = [],
  sarpras = [],
  suratMasuk = [],
  suratKeluar = [],
  presensiList = [],
  skpList = [],
  userRole = 'admin',
  onUpdateData,
  onNotify,
  onPurgeDummyData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'master_database' | 'smart_sync' | 'gdrive_sync' | 'activity_log' | 'skema' | 'templates' | 'gas_code' | 'sync'
  >('master_database');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Sync test state
  const [scriptUrl, setScriptUrl] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleTestSync = async () => {
    if (!scriptUrl) {
      setSyncError('Masukkan URL Web App Google Apps Script Anda terlebih dahulu!');
      return;
    }
    setSyncLoading(true);
    setSyncError(null);
    setSyncResult(null);

    try {
      const res = await syncWithGoogleAppsScript(scriptUrl, 'ping');
      setSyncResult(res);
    } catch (err: any) {
      setSyncError(err.message || 'Gagal terhubung dengan Google Apps Script Web App.');
    } finally {
      setSyncLoading(false);
    }
  };

  const sheetsSchema = [
    {
      name: 'Rekap_Nilai_Rapor',
      purpose: 'Menampung nilai rapor siswa Kelas 4, 5, 6 dari Semester 7 hingga 12 untuk kalkulasi 5 vs 4 Semester.',
      columns: [
        { name: 'ID', type: 'String', note: 'Primary Key (contoh: rr-01)' },
        { name: 'Siswa_ID', type: 'String', note: 'Foreign Key ke Data_Siswa' },
        { name: 'NISN', type: 'String (10)', note: 'Nomor Induk Siswa Nasional' },
        { name: 'Nama_Siswa', type: 'String', note: 'Nama lengkap siswa' },
        { name: 'Kelas', type: 'Number (4-6)', note: 'Tingkat kelas siswa' },
        { name: 'Rombel', type: 'String', note: 'Rombongan belajar (A/B)' },
        { name: 'Sem_7_PAI ... Sem_7_BJawa', type: 'Number (0-100)', note: '8 Mapel Kelas 4 Semester 1' },
        { name: 'Sem_8_PAI ... Sem_8_BJawa', type: 'Number (0-100)', note: '8 Mapel Kelas 4 Semester 2' },
        { name: 'Sem_9_PAI ... Sem_9_BJawa', type: 'Number (0-100)', note: '8 Mapel Kelas 5 Semester 1' },
        { name: 'Sem_10_PAI ... Sem_10_BJawa', type: 'Number (0-100)', note: '8 Mapel Kelas 5 Semester 2' },
        { name: 'Sem_11_PAI ... Sem_11_BJawa', type: 'Number (0-100)', note: '8 Mapel Kelas 6 Semester 1' },
        { name: 'Sem_12_PAI ... Sem_12_BJawa', type: 'Number (0-100)', note: '8 Mapel Kelas 6 Semester 2' },
        { name: 'Rata_Sem_7 s.d. Rata_Sem_12', type: 'Formula (AVERAGE)', note: 'Formula rata-rata per semester' },
      ],
    },
    {
      name: 'Nilai_Ijazah_BTQ',
      purpose: 'Menampung data penilaian standarisasi Baca Tulis Al-Qur\'an untuk penerbitan ijazah/sertifikat BTQ.',
      columns: [
        { name: 'ID', type: 'String', note: 'Primary key rekaman BTQ' },
        { name: 'Siswa_ID', type: 'String', note: 'Relasi ke Data_Siswa' },
        { name: 'NISN', type: 'String (10)', note: 'NISN Siswa' },
        { name: 'Nama_Siswa', type: 'String', note: 'Nama lengkap siswa' },
        { name: 'Kelas', type: 'Number', note: 'Kelas siswa' },
        { name: 'No_Sertifikat', type: 'String', note: 'Nomor registrasi sertifikat resmi' },
        { name: 'Tahsin', type: 'Number (0-100)', note: 'Skor makharijul & shifatul huruf' },
        { name: 'Tajwid', type: 'Number (0-100)', note: 'Skor hukum bacaan Al-Qur\'an' },
        { name: 'Tahfidz', type: 'Number (0-100)', note: 'Skor hafalan surat pendek Juz 30' },
        { name: 'Menulis', type: 'Number (0-100)', note: 'Skor khat naskhi & imla\' Arab' },
        { name: 'Membaca', type: 'Number (0-100)', note: 'Skor tartil & fashahah' },
        { name: 'Rata_Rata', type: 'Formula / Number', note: '=AVERAGE(Tahsin:Membaca)' },
        { name: 'Predikat', type: 'String', note: 'Mumtaz / Jayyid Jiddan / Jayyid / Maqbul' },
        { name: 'Status_Kelulusan', type: 'String', note: 'Lulus (>=75) / Remedial (<75)' },
        { name: 'Catatan_Pembimbing', type: 'String', note: 'Ulasan evaluasi kompetensi' },
        { name: 'Tanggal_Terbit', type: 'String / Date', note: 'Tanggal ijazah dikeluarkan' },
        { name: 'Penguji', type: 'String', note: 'Nama Guru PAI / Penguji' },
      ],
    },
    {
      name: 'Data_Siswa',
      purpose: 'Basis data induk kesiswaan dengan tanggal lahir untuk kalkulasi usia TMT 1 Juli.',
      columns: [
        { name: 'ID', type: 'String', note: 'ID Siswa unik' },
        { name: 'NISN', type: 'String (10)', note: 'Nomor Induk Siswa Nasional' },
        { name: 'NIS', type: 'String', note: 'Nomor Induk Sekolah' },
        { name: 'Nama_Lengkap', type: 'String', note: 'Nama sesuai akta kelahiran' },
        { name: 'Jenis_Kelamin', type: 'String (L/P)', note: 'Laki-laki / Perempuan' },
        { name: 'Tempat_Lahir', type: 'String', note: 'Kota / Kabupaten lahir' },
        { name: 'Tanggal_Lahir', type: 'Date (YYYY-MM-DD)', note: 'Tanggal lahir siswa' },
        { name: 'Agama', type: 'String', note: 'Islam, Kristen, Katolik, Hindu, Buddha' },
        { name: 'Kelas', type: 'Number (1-6)', note: 'Tingkat kelas berjalan' },
        { name: 'Rombel', type: 'String', note: 'Rombel A/B' },
        { name: 'Nama_Ayah', type: 'String', note: 'Nama ayah kandung' },
        { name: 'Nama_Ibu', type: 'String', note: 'Nama ibu kandung' },
        { name: 'Alamat', type: 'String', note: 'Alamat domisili' },
        { name: 'No_HP_Ortu', type: 'String', note: 'Kontak WhatsApp orang tua' },
        { name: 'TMT_Diterima', type: 'Date', note: 'Tanggal diterima di sekolah' },
      ],
    },
    {
      name: 'Data_Pegawai',
      purpose: 'Basis data identitas pendidik dan tenaga kependidikan (NIP, Golongan, Jabatan, TMT).',
      columns: [
        { name: 'ID', type: 'String', note: 'ID Pegawai unik' },
        { name: 'NIP', type: 'String (18 digit)', note: 'Nomor Induk Pegawai (atau - untuk GTT)' },
        { name: 'Nama_Lengkap', type: 'String', note: 'Nama tanpa gelar' },
        { name: 'Gelar_Depan', type: 'String', note: 'Gelar akademis depan' },
        { name: 'Gelar_Belakang', type: 'String', note: 'Gelar akademis belakang (S.Pd., M.Pd.)' },
        { name: 'Jenis_Kelamin', type: 'String (L/P)', note: 'Laki-laki / Perempuan' },
        { name: 'Golongan', type: 'String', note: 'Pangkat / Golongan ruang (IV/b, III/c, dll.)' },
        { name: 'Jabatan', type: 'String', note: 'Kepala Sekolah, Guru Kelas, Guru Mapel, PTT' },
        { name: 'Kontak_HP', type: 'String', note: 'Nomor telepon / WhatsApp' },
        { name: 'Email', type: 'String', note: 'Alamat email aktif' },
        { name: 'TMT_Pengangkatan', type: 'Date', note: 'Terhitung Mulai Tanggal CPNS/SK' },
        { name: 'Status_Kepegawaian', type: 'String', note: 'PNS / PPPK / GTT / PTT' },
        { name: 'Pendidikan_Terakhir', type: 'String', note: 'S1 PGSD, S2 Manajemen, dll.' },
      ],
    },
    {
      name: 'Data_Sarpras',
      purpose: 'Pencatatan sarana prasarana sekolah, kondisi kelaikan, dan link foto.',
      columns: [
        { name: 'ID', type: 'String', note: 'ID Sarpras unik' },
        { name: 'Nama_Sarpras', type: 'String', note: 'Nama gedung / ruang / fasilitas' },
        { name: 'Kategori', type: 'String', note: 'Ruang Pembelajaran / Penunjang / Sanitasi' },
        { name: 'Jumlah', type: 'Number', note: 'Kuantitas unit' },
        { name: 'Satuan', type: 'String', note: 'Ruang / Pintu / Unit' },
        { name: 'Luas_M2', type: 'Number', note: 'Luas lantai dalam meter persegi' },
        { name: 'Kondisi', type: 'String', note: 'Baik / Rusak Ringan / Rusak Berat' },
        { name: 'Foto_URL', type: 'String (URL)', note: 'Link dokumentasi Google Drive / web' },
        { name: 'Lokasi', type: 'String', note: 'Lokasi di lingkungan kampus' },
        { name: 'Keterangan', type: 'String', note: 'Catatan tindak lanjut perawatan' },
      ],
    },
    {
      name: 'Surat_Keluar & Surat_Masuk',
      purpose: 'Buku agenda persuratan digital dan tracking disposisi Kepala Sekolah.',
      columns: [
        { name: 'Nomor_Surat / Agenda', type: 'String', note: 'Kode klasifikasi surat dinas' },
        { name: 'Tanggal_Surat', type: 'Date', note: 'Tanggal penerbitan' },
        { name: 'Pengirim / Tujuan', type: 'String', note: 'Pihak pengirim atau penerima' },
        { name: 'Perihal', type: 'String', note: 'Pokok isi naskah dinas' },
        { name: 'Disposisi_Kepsek', type: 'String', note: 'Arahan tindak lanjut pimpinan' },
        { name: 'Status', type: 'String', note: 'Belum Disposisi / Proses / Selesai' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-700" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Arsitektur Basis Data Spreadsheet, Template Dokumen & Kode GAS
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Dokumentasi teknis utuh untuk implementasi Google Spreadsheet sebagai Database,
              master template Google Docs (Surat Resmi & Sertifikat BTQ), serta kode program Google Apps Script (Code.gs).
            </p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="mt-5 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('master_database')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'master_database'
                ? 'bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md ring-2 ring-emerald-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-300" />
            <span>⚡ Single Data Utama (Real-time Spreadsheet)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-400 text-slate-900 animate-pulse">
              1 Database
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('smart_sync')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'smart_sync'
                ? 'bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Deduplikasi & Timpa ID</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-400 text-slate-900">
              Audit
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('gdrive_sync')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'gdrive_sync'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FolderCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Folder Google Drive & Auto Sync</span>
          </button>
          <button
            onClick={() => setActiveSubTab('activity_log')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'activity_log'
                ? 'bg-purple-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>Log Aktivitas & Audit (LocalStorage)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-purple-200 text-purple-900">
              Audit Admin
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('skema')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'skema'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Skema Database Google Spreadsheet</span>
          </button>
          <button
            onClick={() => setActiveSubTab('templates')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'templates'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Master Template Google Docs</span>
          </button>
          <button
            onClick={() => setActiveSubTab('gas_code')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'gas_code'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>3. Backend Google Apps Script (Code.gs)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('sync')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'sync'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <SendHorizontal className="w-3.5 h-3.5" />
            <span>4. Uji Koneksi Live Web App</span>
          </button>
        </div>
      </div>

      {/* SubTab 0: Single Master Database (Primary) */}
      {activeSubTab === 'master_database' && (
        <SingleMasterDatabasePanel
          profil={profil}
          siswa={siswa}
          pegawai={pegawai}
          rapor={rapor}
          btq={btq}
          sarpras={sarpras}
          suratMasuk={suratMasuk}
          suratKeluar={suratKeluar}
          userRole={userRole}
          onUpdateData={onUpdateData || (() => {})}
          onNotify={onNotify || (() => {})}
          onPurgeDummyData={onPurgeDummyData || (() => {})}
        />
      )}

      {/* SubTab: Smart Data Sync Panel */}
      {activeSubTab === 'smart_sync' && (
        <SmartDataSyncPanel
          profil={profil}
          siswa={siswa}
          pegawai={pegawai}
          rapor={rapor}
          btq={btq}
          sarpras={sarpras}
          suratMasuk={suratMasuk}
          suratKeluar={suratKeluar}
          userRole={userRole}
          onUpdateData={onUpdateData || (() => {})}
          onNotify={onNotify || (() => {})}
        />
      )}

      {/* SubTab 0: Google Drive Sync */}
      {activeSubTab === 'gdrive_sync' && (
        <GoogleDriveSync
          profil={profil}
          siswa={siswa}
          pegawai={pegawai}
          rapor={rapor}
          btq={btq}
          sarpras={sarpras}
          suratMasuk={suratMasuk}
          suratKeluar={suratKeluar}
          presensiList={presensiList}
          skpList={skpList}
          userRole={userRole}
        />
      )}

      {/* SubTab: Activity Log Monitor */}
      {activeSubTab === 'activity_log' && (
        <ActivityLogMonitor currentUserRole={userRole} />
      )}

      {/* SubTab 1: Skema Database Spreadsheet */}
      {activeSubTab === 'skema' && (
        <div className="space-y-5">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Panduan Pembuatan Database Google Spreadsheet:</strong>
              <p className="mt-0.5 text-slate-700">
                Buat 1 file Google Spreadsheet di Google Drive Anda (beri nama: <code>DB_SIM_SDN_Kedungringin_1_Beji</code>).
                Di dalamnya, buat tab/sheet sesuai dengan daftar di bawah ini beserta nama kolom yang persis sama.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {sheetsSchema.map((sheet, sIdx) => (
              <div key={sheet.name} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                        {sIdx + 1}
                      </span>
                      <h3 className="font-mono font-bold text-slate-900 text-sm">
                        Sheet: <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{sheet.name}</span>
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{sheet.purpose}</p>
                  </div>

                  <button
                    onClick={() => {
                      const colNames = sheet.columns.map((c) => c.name).join('\t');
                      copyToClipboard(colNames, `sheet-header-${sheet.name}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    {copiedSection === `sheet-header-${sheet.name}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Salin Header Kolom (Baris 1)</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4 w-12 text-center">No</th>
                        <th className="py-2.5 px-4">Nama Kolom (Header)</th>
                        <th className="py-2.5 px-4">Tipe Data</th>
                        <th className="py-2.5 px-4">Keterangan / Fungsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sheet.columns.map((col, cIdx) => (
                        <tr key={col.name} className="hover:bg-slate-50">
                          <td className="py-2 px-4 text-center font-mono text-slate-400">{cIdx + 1}</td>
                          <td className="py-2 px-4 font-mono font-bold text-slate-900">{col.name}</td>
                          <td className="py-2 px-4 text-emerald-700 font-mono text-[11px]">{col.type}</td>
                          <td className="py-2 px-4 text-slate-600 text-[11px]">{col.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 2: Master Templates Google Docs */}
      {activeSubTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  Template 1: Dokumen Ijazah / Sertifikat BTQ (Google Docs)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Salin teks di bawah ini ke master Google Docs Anda untuk proses merge sertifikat BTQ.
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(GOOGLE_DOCS_BTQ_TEMPLATE, 'tmpl-btq')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium shadow-xs cursor-pointer"
              >
                {copiedSection === 'tmpl-btq' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'tmpl-btq' ? 'Tersalin' : 'Salin Template BTQ'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-slate-800">Daftar Variabel Placeholder:</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-emerald-800">
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{nama_siswa}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{nisn}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{kelas}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{nomor_sertifikat}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{tahsin}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{tajwid}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{tahfidz}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{menulis}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{membaca}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{rata_rata}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{predikat}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{status_kelulusan}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{catatan_pembimbing}}'}</span>
                <span className="bg-emerald-100 px-1.5 py-0.5 rounded">{'{{tanggal_terbit}}'}</span>
              </div>
            </div>

            <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed max-h-96">
              {GOOGLE_DOCS_BTQ_TEMPLATE}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  Template 2: Surat Keluar Resmi Sekolah (Google Docs)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Master template surat keterangan resmi dengan kop SDN Kedungringin 1 Beji.
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(GOOGLE_DOCS_SURAT_TEMPLATE, 'tmpl-surat')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium shadow-xs cursor-pointer"
              >
                {copiedSection === 'tmpl-surat' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'tmpl-surat' ? 'Tersalin' : 'Salin Template Surat'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed max-h-96">
              {GOOGLE_DOCS_SURAT_TEMPLATE}
            </pre>
          </div>
        </div>
      )}

      {/* SubTab 3: Google Apps Script Code */}
      {activeSubTab === 'gas_code' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-emerald-700" />
                  Kode Lengkap Backend Google Apps Script (Code.gs)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mencakup logika rekap rapor 5 vs 4 semester, CRUD Spreadsheet, merge dokumen BTQ, dan REST API.
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(GOOGLE_APPS_SCRIPT_CODE, 'gas-code')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer self-start sm:self-auto"
              >
                {copiedSection === 'gas-code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSection === 'gas-code' ? 'Kode Berhasil Disalin!' : 'Salin Kode Code.gs'}</span>
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-800">Langkah Pemasangan di Google Drive:</span>
              <ol className="list-decimal pl-5 space-y-1 text-slate-600">
                <li>Buka Spreadsheet database Anda di browser.</li>
                <li>Klik menu <strong>Extensions (Ekstensi) &gt; Apps Script</strong>.</li>
                <li>Hapus kode bawaan di file <code>Code.gs</code>, lalu paste kode lengkap di bawah ini.</li>
                <li>Sesuaikan variabel <code>SPREADSHEET_ID</code>, <code>DOCS_TEMPLATE_BTQ_ID</code>, dan <code>OUTPUT_PDF_FOLDER_ID</code>.</li>
                <li>Klik tombol <strong>Deploy (Terapkan) &gt; New deployment (Penerapan baru)</strong>.</li>
                <li>Pilih jenis <strong>Web app</strong>, atur <em>Execute as: Me</em> dan <em>Who has access: Anyone (Siapa saja)</em>.</li>
                <li>Salin URL Web App yang dihasilkan untuk dimasukkan ke tab "Uji Koneksi Live Web App".</li>
              </ol>
            </div>

            <pre className="p-5 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed max-h-[600px] border border-slate-800">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* SubTab 4: Live Web App Connection Test */}
      {activeSubTab === 'sync' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SendHorizontal className="w-5 h-5 text-emerald-700" />
              Pengujian Konektivitas Google Apps Script Web App
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan URL Deployment Web App Google Apps Script Anda untuk menguji integrasi dua arah secara live.
            </p>
          </div>

          <div className="max-w-2xl space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                URL Google Apps Script Web App (Deploy as Web App)
              </label>
              <input
                type="url"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Contoh: https://script.google.com/macros/s/.../exec
              </span>
            </div>

            <button
              onClick={handleTestSync}
              disabled={syncLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {syncLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menghubungkan ke Apps Script...</span>
                </>
              ) : (
                <>
                  <SendHorizontal className="w-4 h-4" />
                  <span>Uji Ping & Ambil Data</span>
                </>
              )}
            </button>
          </div>

          {syncError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{syncError}</span>
            </div>
          )}

          {syncResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Respon Sukses dari Google Apps Script:
              </div>
              <pre className="p-3 bg-white rounded-lg border border-emerald-300 font-mono text-slate-800 overflow-x-auto text-[11px]">
                {JSON.stringify(syncResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
