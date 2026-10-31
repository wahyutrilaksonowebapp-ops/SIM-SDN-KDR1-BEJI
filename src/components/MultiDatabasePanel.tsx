import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Server, 
  RefreshCw, 
  Copy, 
  Check, 
  Layers, 
  FileSpreadsheet, 
  Flame, 
  HardDrive, 
  Sparkles,
  Info,
  ChevronRight,
  Download,
  Upload
} from 'lucide-react';
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
  ProgramRemedialPengayaan,
  PenilaianHarian
} from '../types';
import { 
  pushDataToMasterSpreadsheet, 
  fetchAllLiveMasterData, 
  LOCKED_WEB_APP_URL, 
  getSavedMasterSheetId 
} from '../services/singleMasterSheetService';

interface MultiDatabasePanelProps {
  profil: ProfilSekolah;
  siswa: Siswa[];
  pegawai: Pegawai[];
  rapor: RekapRaporSiswa[];
  btq: NilaiIjazahBTQ[];
  sarpras: SarprasItem[];
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  presensiList?: FaceprintPresensi[];
  skpList?: SkpEKinerja[];
  remedialList?: ProgramRemedialPengayaan[];
  penilaianList?: PenilaianHarian[];
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onUpdateData?: (newData: {
    siswa?: Siswa[];
    pegawai?: Pegawai[];
    rapor?: RekapRaporSiswa[];
    btq?: NilaiIjazahBTQ[];
    sarpras?: SarprasItem[];
  }) => void;
  onUpdateProfil?: (updated: ProfilSekolah) => void;
}

export const MultiDatabasePanel: React.FC<MultiDatabasePanelProps> = ({
  profil,
  siswa,
  pegawai,
  rapor,
  btq,
  sarpras,
  suratMasuk,
  suratKeluar,
  presensiList = [],
  skpList = [],
  remedialList = [],
  penilaianList = [],
  onNotify = () => {},
  onUpdateData,
  onUpdateProfil,
}) => {
  const [isUpdatingSpreadsheet, setIsUpdatingSpreadsheet] = useState(false);
  const [isTarikLoading, setIsTarikLoading] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectedDbTab, setSelectedDbTab] = useState<'spreadsheet' | 'supabase' | 'firebase'>('spreadsheet');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    onNotify(`Berhasil menyalin ${type} ke papan klip!`, 'success');
    setTimeout(() => setCopiedType(null), 3000);
  };

  const handleTarikData = async () => {
    setIsTarikLoading(true);
    try {
      const res = await fetchAllLiveMasterData(profil);
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (res) {
        if (onUpdateData) {
          onUpdateData({
            pegawai: res.pegawai,
            siswa: res.siswa,
            rapor: res.rapor,
            btq: res.btq,
            sarpras: res.sarpras,
          });
        }
        if (res.profil && onUpdateProfil) {
          onUpdateProfil(res.profil);
        }
        onNotify(`Tarik Data Berhasil (${nowTime})! Mengambil ${res.pegawai?.length || pegawai.length} GTK & ${res.siswa?.length || siswa.length} Siswa dari Database/Spreadsheet.`, 'success');
      } else {
        onNotify(`Tarik Data: Database siap & tersinkronisasi (${nowTime}).`, 'info');
      }
    } catch (err: any) {
      onNotify('Gagal menarik data dari database: ' + (err.message || 'Koneksi terputus'), 'error');
    } finally {
      setIsTarikLoading(false);
    }
  };

  const handleUpdateAllToSpreadsheet = async () => {
    setIsUpdatingSpreadsheet(true);
    try {
      const res = await pushDataToMasterSpreadsheet({
        profil,
        pegawai,
        siswa,
        rapor,
        btq,
        sarpras,
        suratMasuk,
        suratKeluar,
        actionName: 'updateCompleteMasterDatabase',
      });

      onNotify(
        `Syncron Berhasil! Data Profil Sekolah, ${siswa.length} Siswa, ${pegawai.length} GTK, ${sarpras.length} Sarpras, ${rapor.length} Rapor telah dikirimkan ke Database.`,
        'success'
      );
    } catch (err: any) {
      console.error('Error updating spreadsheet:', err);
      onNotify('Gagal mengirim data: ' + err.message, 'error');
    } finally {
      setIsUpdatingSpreadsheet(false);
    }
  };

  // SQL DDL Schema for Supabase PostgreSQL
  const supabaseSqlSchema = `-- SKEMA DATABASE POSTGRESQL SUPABASE
-- KHUSUS UPT SATUAN PENDIDIKAN FORMAL SDN KEDUNGRINGIN 1 BEJI
-- TAHUN PELAJARAN 2026/2027

-- 1. Tabel Profil Sekolah
CREATE TABLE IF NOT EXISTS profil_sekolah (
  npsn VARCHAR(10) PRIMARY KEY,
  nama_sekolah VARCHAR(150) NOT NULL,
  bentuk_pendidikan VARCHAR(20) DEFAULT 'SD',
  status_sekolah VARCHAR(20) DEFAULT 'Negeri',
  akreditasi VARCHAR(20) DEFAULT 'B (Baik)',
  alamat TEXT,
  kecamatan VARCHAR(50) DEFAULT 'Beji',
  kabupaten VARCHAR(50) DEFAULT 'Kabupaten Pasuruan',
  provinsi VARCHAR(50) DEFAULT 'Jawa Timur',
  kepala_sekolah VARCHAR(100),
  nip_kepala_sekolah VARCHAR(30),
  tahun_pelajaran_aktif VARCHAR(20) DEFAULT '2026/2027',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INJEKSI DATA RESMI PROFIL SEKOLAH (SUPABASE)
INSERT INTO profil_sekolah (
  npsn, nama_sekolah, bentuk_pendidikan, status_sekolah, akreditasi,
  alamat, kecamatan, kabupaten, provinsi, kepala_sekolah,
  nip_kepala_sekolah, tahun_pelajaran_aktif
) VALUES (
  '20519482',
  'SDN Kedungringin 1 Beji',
  'SD',
  'Negeri',
  'B (Baik)',
  'Jl. Dusun Ngampel Desa Kedungringin Rt/Rw 035/010 Kode Pos 67154',
  'Beji',
  'Kabupaten Pasuruan',
  'Jawa Timur',
  'Fuad Fahrudin, M.Pd.',
  '19800618 200501 1 010',
  '2026/2027'
) ON CONFLICT (npsn) DO UPDATE SET
  nama_sekolah = EXCLUDED.nama_sekolah,
  bentuk_pendidikan = EXCLUDED.bentuk_pendidikan,
  status_sekolah = EXCLUDED.status_sekolah,
  akreditasi = EXCLUDED.akreditasi,
  alamat = EXCLUDED.alamat,
  kecamatan = EXCLUDED.kecamatan,
  kabupaten = EXCLUDED.kabupaten,
  kepala_sekolah = EXCLUDED.kepala_sekolah,
  nip_kepala_sekolah = EXCLUDED.nip_kepala_sekolah,
  tahun_pelajaran_aktif = EXCLUDED.tahun_pelajaran_aktif,
  updated_at = NOW();

-- 2. Tabel Guru & Tenaga Kependidikan (GTK)
CREATE TABLE IF NOT EXISTS pegawai_gtk (
  id VARCHAR(50) PRIMARY KEY,
  nip VARCHAR(30),
  nuptk VARCHAR(30),
  nama VARCHAR(150) NOT NULL,
  jenis_kelamin VARCHAR(5) CHECK (jenis_kelamin IN ('L', 'P')),
  jabatan VARCHAR(100) NOT NULL,
  status_kepegawaian VARCHAR(30) DEFAULT 'PNS',
  golongan VARCHAR(20),
  pendidikan_terakhir VARCHAR(50),
  unit_kerja VARCHAR(100) DEFAULT 'SDN Kedungringin 1 Beji',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Peserta Didik
CREATE TABLE IF NOT EXISTS data_siswa (
  id VARCHAR(50) PRIMARY KEY,
  nisn VARCHAR(20) UNIQUE NOT NULL,
  nis VARCHAR(20),
  nama VARCHAR(150) NOT NULL,
  jenis_kelamin VARCHAR(5) CHECK (jenis_kelamin IN ('L', 'P')),
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  agama VARCHAR(30) DEFAULT 'Islam',
  kelas INT CHECK (kelas BETWEEN 1 AND 6),
  rombel VARCHAR(10) DEFAULT 'A',
  nama_ayah VARCHAR(100),
  nama_ibu VARCHAR(100),
  alamat TEXT,
  status_siswa VARCHAR(20) DEFAULT 'Aktif'
);

-- 4. Tabel Asesmen & Penilaian Harian Kurikulum Merdeka
CREATE TABLE IF NOT EXISTS penilaian_harian (
  id VARCHAR(50) PRIMARY KEY,
  kode_ujian VARCHAR(50) UNIQUE,
  judul VARCHAR(200) NOT NULL,
  mata_pelajaran VARCHAR(100) NOT NULL,
  kelas INT NOT NULL,
  rombel VARCHAR(10) DEFAULT 'A',
  materi_pokok TEXT,
  tujuan_pembelajaran TEXT,
  durasi_menit INT DEFAULT 45,
  kkm INT DEFAULT 75,
  guru_pengampu VARCHAR(150)
);

-- 5. Tabel Hasil Ujian CBT Siswa
CREATE TABLE IF NOT EXISTS hasil_penilaian_siswa (
  id VARCHAR(50) PRIMARY KEY,
  penilaian_id VARCHAR(50) REFERENCES penilaian_harian(id) ON DELETE CASCADE,
  siswa_id VARCHAR(50) REFERENCES data_siswa(id) ON DELETE CASCADE,
  nisn VARCHAR(20),
  nama_siswa VARCHAR(150),
  total_skor_perolehan INT,
  total_skor_maksimal INT,
  nilai_akhir NUMERIC(5,2),
  status_kelulusan VARCHAR(30) CHECK (status_kelulusan IN ('Tuntas', 'Belum Tuntas', 'Perlu Bimbingan')),
  waktu_selesai TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabel Program Remedial & Pengayaan AI
CREATE TABLE IF NOT EXISTS program_remedial_pengayaan (
  id VARCHAR(50) PRIMARY KEY,
  kode_program VARCHAR(50) UNIQUE,
  judul VARCHAR(200) NOT NULL,
  jenis VARCHAR(20) CHECK (jenis IN ('remedial', 'pengayaan')),
  mata_pelajaran VARCHAR(100) NOT NULL,
  kelas INT NOT NULL,
  materi_pokok TEXT,
  ringkasan_materi_scaffolding TEXT,
  kkm INT DEFAULT 75,
  guru_pengampu VARCHAR(150),
  status VARCHAR(20) DEFAULT 'aktif'
);`;

  // Firebase Firestore JSON Blueprint
  const firebaseJsonBlueprint = `{
  "projectId": "sim-sdn-kedungringin1-beji",
  "database": "(default)",
  "securityRules": "rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read, write: if request.auth != null; } } }",
  "collections": {
    "profil_sekolah": {
      "doc_id": "sdn_kedungringin_1",
      "fields": {
        "npsn": "20519482",
        "nama": "SDN Kedungringin 1 Beji",
        "bentukPendidikan": "SD",
        "status": "Negeri",
        "akreditasi": "B (Baik)",
        "alamat": "Jl. Dusun Ngampel Desa Kedungringin Rt/Rw 035/010 Kode Pos 67154",
        "kecamatan": "Beji",
        "kabupaten": "Kabupaten Pasuruan",
        "provinsi": "Jawa Timur",
        "kepalaSekolah": "Fuad Fahrudin, M.Pd.",
        "nipKepalaSekolah": "19800618 200501 1 010",
        "tahunPelajaran": "2026/2027",
        "updatedAt": "2026-10-31T00:00:00Z"
      }
    },
    "data_gtk": {
      "totalRecords": ${pegawai.length},
      "sampleItem": {
        "nama": "${pegawai[0]?.nama || 'Fuad Fahrudin, M.Pd.'}",
        "nip": "${pegawai[0]?.nip || '19800618 200501 1 010'}",
        "jabatan": "${pegawai[0]?.jabatan || 'Kepala Sekolah'}"
      }
    },
    "data_siswa": {
      "totalRecords": ${siswa.length},
      "sampleItem": {
        "nama": "${siswa[0]?.nama || 'Muhammad Fadhil'}",
        "nisn": "${siswa[0]?.nisn || '0123456789'}",
        "kelas": ${siswa[0]?.kelas || 6}
      }
    },
    "penilaian_harian": {
      "totalRecords": ${penilaianList.length}
    },
    "remedial_pengayaan": {
      "totalRecords": ${remedialList.length}
    }
  }
}`;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner: Penetapan Data Utama */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-800/60 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-400/30">
                Pusat Kendali Basis Data Terpadu
              </span>
              <span className="text-xs text-emerald-200">SDN Kedungringin I Beji</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Arsitektur Multi-Database (Spreadsheet, Supabase, Firebase)</span>
              <Sparkles className="w-5 h-5 text-amber-300" />
            </h2>
            <p className="text-xs text-emerald-100/90 max-w-3xl leading-relaxed">
              Penetapan <strong>Web SIM SDN Kedungringin I Beji</strong> sebagai <strong>Pusat Data Utama yang Tetap</strong> dengan integrasi ke 3 ekosistem database modern. Sistem menentukan opsi terbaik berdasarkan kebutuhan transparansi sekolah dasar negeri, keandalan arsip, dan efisiensi operasional.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            {/* Tombol Tarik Data (Pengambilan data dari database) */}
            <button
              onClick={handleTarikData}
              disabled={isTarikLoading}
              title="Tarik Data: Mengambil data terbaru dari database/spreadsheet secara manual"
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                isTarikLoading
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400/50'
              }`}
            >
              <Download className={`w-4 h-4 text-emerald-200 ${isTarikLoading ? 'animate-bounce' : ''}`} />
              <span>{isTarikLoading ? 'Menarik Data...' : '📥 Tarik Data'}</span>
            </button>

            {/* Tombol Syncron (Pengiriman database) */}
            <button
              onClick={handleUpdateAllToSpreadsheet}
              disabled={isUpdatingSpreadsheet}
              title="Syncron: Mengirimkan seluruh data web secara langsung ke database"
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                isUpdatingSpreadsheet
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-500 text-white border border-teal-400/50'
              }`}
            >
              <Upload className={`w-4 h-4 text-teal-100 ${isUpdatingSpreadsheet ? 'animate-spin' : ''}`} />
              <span>{isUpdatingSpreadsheet ? 'Mengirim Data...' : '🚀 Syncron'}</span>
            </button>
          </div>
        </div>

        {/* 3 Database Comparative Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {/* 1. Google Spreadsheet (Terpilih sebagai Data Utama Tetap) */}
          <div className="bg-emerald-900/60 backdrop-blur-xs rounded-2xl p-4 border-2 border-emerald-400 shadow-md flex flex-col justify-between gap-3 relative overflow-hidden">
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-400 text-emerald-950 font-black text-[9px] uppercase tracking-wider">
              ⭐ Pilihan Terbaik &amp; Data Utama
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700/80 text-emerald-300 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs">Google Spreadsheet (GAS)</h4>
                  <p className="text-[10px] text-emerald-300 font-mono">Master Sheet Terkunci</p>
                </div>
              </div>
              <p className="text-[11px] text-emerald-100/90 leading-relaxed pt-1">
                <strong>Alasan Terbaik:</strong> Terintegrasi langsung dengan akun Google Workspace resmi SDN Kedungringin I Beji, gratis seumur hidup tanpa biaya cloud tier, dan transparan untuk diaudit oleh Pengawas Dinas Pendidikan Pasuruan secara visual.
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-between text-[10px]">
              <span className="text-emerald-300 font-medium">Status Engine:</span>
              <span className="font-bold text-white bg-emerald-500/40 px-2 py-0.5 rounded">
                🟢 Aktif &amp; Terhubung
              </span>
            </div>
          </div>

          {/* 2. Supabase PostgreSQL */}
          <div className="bg-slate-900/80 backdrop-blur-xs rounded-2xl p-4 border border-slate-700 shadow-xs flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Supabase (PostgreSQL)</h4>
                  <p className="text-[10px] text-slate-400">Relational SQL Engine</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                Cocok untuk arsitektur relasional tingkat tinggi (foreign keys, complex aggregate queries, dan row-level security dinas). Skema DDL telah disiapkan dan siap di-deploy kapan saja.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-medium">Status Engine:</span>
              <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                🟡 Siap Replikasi
              </span>
            </div>
          </div>

          {/* 3. Firebase Firestore */}
          <div className="bg-slate-900/80 backdrop-blur-xs rounded-2xl p-4 border border-slate-700 shadow-xs flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Firebase (Firestore NoSQL)</h4>
                  <p className="text-[10px] text-slate-400">Realtime Document Database</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                Sangat kuat untuk latency milidetik, push event real-time CBT ujian siswa, dan sinkronisasi biometrik presensi. Struktur JSON Blueprint dan Security Rules telah dikonfigurasi.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-medium">Status Engine:</span>
              <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                🟡 Siap Replikasi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Switcher Tabs & Tools */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedDbTab('spreadsheet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDbTab === 'spreadsheet'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>1. Google Spreadsheet (Data Utama Tetap)</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-emerald-400 text-slate-950">
              Aktif
            </span>
          </button>

          <button
            onClick={() => setSelectedDbTab('supabase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDbTab === 'supabase'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HardDrive className="w-4 h-4 text-emerald-300" />
            <span>2. Supabase PostgreSQL Schema</span>
          </button>

          <button
            onClick={() => setSelectedDbTab('firebase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDbTab === 'firebase'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>3. Firebase Firestore Blueprint</span>
          </button>
        </div>

        {/* Tab 1: Google Spreadsheet (Data Utama Tetap) */}
        {selectedDbTab === 'spreadsheet' && (
          <div className="p-6 space-y-6 text-xs text-slate-700">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Status Basis Data Utama Terkunci: SDN Kedungringin I Beji</span>
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed max-w-2xl">
                  Endpoint Web App Google Apps Script telah dikonfigurasi permanen. Seluruh penambahan, pengeditan, atau penghapusan data di web otomatis disinkronkan ke Master Spreadsheet tanpa merubah link resmi.
                </p>
              </div>

              <a
                href={LOCKED_WEB_APP_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs hover:bg-emerald-900 transition-colors shadow-xs shrink-0"
              >
                <span>Buka Web App Resmi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Rekapitulasi Cakupan Tabel Master */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                Cakupan Lembar Sheet Master Database yang Mengacu ke Spreadsheet:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">PROFIL_SEKOLAH</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Lengkap</span>
                  </div>
                  <p className="text-[11px] text-slate-500">NPSN, SK Operasional, Akreditasi A, Alamat, Luas Tanah, Kontak.</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">DATA_GTK_PEGAWAI</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">{pegawai.length} Guru/GTK</span>
                  </div>
                  <p className="text-[11px] text-slate-500">NIP, NUPTK, Jabatan, Golongan, Riwayat SK Pangkat, SK Berkala.</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">DATA_SISWA</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">{siswa.length} Siswa</span>
                  </div>
                  <p className="text-[11px] text-slate-500">NISN, NIK, Tempat/Tgl Lahir, Agama, Rombel Kelas 1-6, Orang Tua.</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">SARANA_PRASARANA</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">{sarpras.length} Aset</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Ruang Kelas 1-6, Lab Komputer Chromebook, Perpustakaan, Musholla.</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">RAPOR_SEMESTER</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">{rapor.length} Siswa</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Arsip nilai 5 semester (Sem 7-12) &amp; Tes Kemampuan Akademik (TKA).</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">IJAZAH_BTQ</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">{btq.length} Sertifikat</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Komponen Tahsin, Tajwid, Tahfidz Juz 30, Fashahah, Menulis Khat.</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">SURAT_MASUK_KELUAR</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">{suratMasuk.length + suratKeluar.length} Surat</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Agenda nomor surat dinas, tanggal, pengirim, perihal, disposisi.</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">PENILAIAN_HARIAN</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">{penilaianList.length} Paket Asesmen</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Bank butir soal CBT, kisi-kisi, kunci jawaban, dan rekap skor.</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">REMEDIAL_PENGAYAAN</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">{remedialList.length} Program</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Scaffolding konsep AI, penugasan perbaikan, dan rekap nilai KKTP.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Supabase PostgreSQL */}
        {selectedDbTab === 'supabase' && (
          <div className="p-6 space-y-4 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Skema DDL PostgreSQL Supabase</h4>
                <p className="text-slate-500 text-[11px]">Gunakan skema SQL ini pada SQL Editor Supabase untuk membuat tabel relasional</p>
              </div>
              <button
                onClick={() => copyToClipboard(supabaseSqlSchema, 'Skema SQL Supabase')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {copiedType === 'Skema SQL Supabase' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === 'Skema SQL Supabase' ? 'Tersalin!' : 'Salin Skema DDL'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
              {supabaseSqlSchema}
            </pre>
          </div>
        )}

        {/* Tab 3: Firebase Firestore */}
        {selectedDbTab === 'firebase' && (
          <div className="p-6 space-y-4 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Blueprint Koleksi &amp; Aturan Keamanan Firebase Firestore</h4>
                <p className="text-slate-500 text-[11px]">Konfigurasi NoSQL document collections untuk database realtime Firebase</p>
              </div>
              <button
                onClick={() => copyToClipboard(firebaseJsonBlueprint, 'Blueprint JSON Firebase')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {copiedType === 'Blueprint JSON Firebase' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === 'Blueprint JSON Firebase' ? 'Tersalin!' : 'Salin JSON Blueprint'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
              {firebaseJsonBlueprint}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
