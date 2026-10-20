import React, { useState } from 'react';
import { 
  RuangKelasDetail, 
  ProfilSekolah, 
  UserRole,
  AuthUser,
  StrukturOrganisasiKelas,
  JadwalPiketHari,
  JadwalPelajaranItem,
  LMSMateriKelas,
  RefleksiHarianKelas
} from '../../types';
import { 
  Building2, 
  Users, 
  Calendar, 
  Clock, 
  BookOpen, 
  MessageSquare, 
  Printer, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  Smile, 
  HeartHandshake, 
  ShieldCheck, 
  Award,
  Video,
  FileText,
  Bell,
  Trash2,
  X,
  ExternalLink
} from 'lucide-react';

interface GedungRuangKelasProps {
  ruangKelasList: RuangKelasDetail[];
  profil: ProfilSekolah;
  userRole: UserRole;
  currentUser?: AuthUser;
  onUpdateRuangKelas: (updated: RuangKelasDetail) => void;
}

type KelasAdminTab = 'profil' | 'struktur' | 'piket' | 'jadwal' | 'lms' | 'refleksi';

export const GedungRuangKelas: React.FC<GedungRuangKelasProps> = ({
  ruangKelasList,
  profil,
  userRole,
  currentUser,
  onUpdateRuangKelas,
}) => {
  const [selectedKelasNum, setSelectedKelasNum] = useState<number>(() => {
    if (currentUser?.role === 'guru' && currentUser?.kelas) {
      return currentUser.kelas;
    }
    return 1;
  });
  const [activeTab, setActiveTab] = useState<KelasAdminTab>('profil');

  // Currently selected classroom
  const currentKelas = ruangKelasList.find((k) => k.kelas === selectedKelasNum) || ruangKelasList[0];
  const canEditClass = userRole === 'admin' || (userRole === 'guru' && currentUser?.kelas === currentKelas.kelas);

  // Modal State for Refleksi Pelajaran
  const [modalRefleksiOpen, setModalRefleksiOpen] = useState(false);
  const [refleksiForm, setRefleksiForm] = useState<Partial<RefleksiHarianKelas>>({
    tanggal: new Date().toISOString().split('T')[0],
    mataPelajaran: 'Bahasa Indonesia',
    topikBahasan: '',
    pemahamanBaru: '',
    kendalaAtauTantangan: '',
    suasanaBelajar: 'Sangat Menyenangkan 🤩',
    ditulisOleh: 'Ketua Kelas',
    catatanWaliKelas: '',
  });

  // Modal State for LMS Baru
  const [modalLMSOpen, setModalLMSOpen] = useState(false);
  const [lmsForm, setLmsForm] = useState<Partial<LMSMateriKelas>>({
    judul: '',
    mataPelajaran: 'Bahasa Indonesia',
    tipe: 'Materi / Modul',
    tanggalPosting: new Date().toISOString().split('T')[0],
    deskripsi: '',
    linkSumber: '',
    statusPengumpulan: 'Tersedia di Kelas',
  });

  // Modal State for Edit Struktur
  const [modalStrukturOpen, setModalStrukturOpen] = useState(false);
  const [strukturForm, setStrukturForm] = useState<StrukturOrganisasiKelas>(currentKelas.strukturOrganisasi);

  // Day of week helper in Indonesian
  const getHariIni = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
  };
  const hariIni = getHariIni();

  const handlePrint = () => {
    window.print();
  };

  const handleSaveRefleksi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refleksiForm.topikBahasan || !refleksiForm.pemahamanBaru) return;

    const newRefleksi: RefleksiHarianKelas = {
      id: `ref-${Date.now()}`,
      tanggal: refleksiForm.tanggal || new Date().toISOString().split('T')[0],
      mataPelajaran: refleksiForm.mataPelajaran || 'Bahasa Indonesia',
      topikBahasan: refleksiForm.topikBahasan,
      pemahamanBaru: refleksiForm.pemahamanBaru,
      kendalaAtauTantangan: refleksiForm.kendalaAtauTantangan || 'Tidak ada kendala, materi dipahami dengan baik.',
      suasanaBelajar: (refleksiForm.suasanaBelajar as any) || 'Sangat Menyenangkan 🤩',
      ditulisOleh: refleksiForm.ditulisOleh || 'Perwakilan Siswa',
      catatanWaliKelas: refleksiForm.catatanWaliKelas || 'Bagus sekali! Pertahankan semangat belajar kalian.',
    };

    const updated = {
      ...currentKelas,
      refleksi: [newRefleksi, ...currentKelas.refleksi],
    };

    onUpdateRuangKelas(updated);
    setModalRefleksiOpen(false);
    setRefleksiForm({
      tanggal: new Date().toISOString().split('T')[0],
      mataPelajaran: 'Bahasa Indonesia',
      topikBahasan: '',
      pemahamanBaru: '',
      kendalaAtauTantangan: '',
      suasanaBelajar: 'Sangat Menyenangkan 🤩',
      ditulisOleh: 'Ketua Kelas',
      catatanWaliKelas: '',
    });
  };

  const handleSaveLMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lmsForm.judul) return;

    const newLMS: LMSMateriKelas = {
      id: `lms-${Date.now()}`,
      judul: lmsForm.judul,
      mataPelajaran: lmsForm.mataPelajaran || 'Bahasa Indonesia',
      tipe: (lmsForm.tipe as any) || 'Materi / Modul',
      tanggalPosting: lmsForm.tanggalPosting || new Date().toISOString().split('T')[0],
      deskripsi: lmsForm.deskripsi || '',
      linkSumber: lmsForm.linkSumber || '',
      statusPengumpulan: lmsForm.statusPengumpulan || 'Tersedia di Kelas',
    };

    const updated = {
      ...currentKelas,
      lms: [newLMS, ...currentKelas.lms],
    };

    onUpdateRuangKelas(updated);
    setModalLMSOpen(false);
    setLmsForm({
      judul: '',
      mataPelajaran: 'Bahasa Indonesia',
      tipe: 'Materi / Modul',
      tanggalPosting: new Date().toISOString().split('T')[0],
      deskripsi: '',
      linkSumber: '',
      statusPengumpulan: 'Tersedia di Kelas',
    });
  };

  const handleSaveStruktur = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...currentKelas,
      strukturOrganisasi: strukturForm,
    };
    onUpdateRuangKelas(updated);
    setModalStrukturOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* SUB-SUB MENU SELECTOR: RUANG KELAS 1 s.d. RUANG KELAS 6 */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-700" />
              Sub Menu Gedung Ruang Kelas (Gedung Pembelajaran 1 s.d. 6)
            </h3>
            <p className="text-xs text-slate-500">
              Pilih ruang kelas untuk melihat sarana fisik dan keadministrasian kelas umum (non perangkat ajar).
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            6 Ruang Kelas Rombel Aktif
          </span>
        </div>

        {/* 6 Sub-sub Menu Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((kNum) => {
            const kData = ruangKelasList.find((k) => k.kelas === kNum);
            const isSelected = selectedKelasNum === kNum;
            return (
              <button
                key={kNum}
                onClick={() => {
                  setSelectedKelasNum(kNum);
                  if (kData) setStrukturForm(kData.strukturOrganisasi);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-700 to-blue-800 text-white border-indigo-700 shadow-md scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl mb-1">🏫</span>
                <span className="font-extrabold text-xs">Ruang Kelas {kNum}</span>
                <span className={`text-[10px] mt-0.5 truncate max-w-[120px] ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {kData?.waliKelas.split(',')[0] || `Wali Kelas ${kNum}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Classroom Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              Keadministrasian Kelas Umum • Non Perangkat Ajar
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentKelas.namaRuang}
            </h2>
            <p className="text-indigo-200 text-xs sm:text-sm italic">
              "{currentKelas.mottoKelas}"
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-100 pt-1">
              <span>👤 <strong>Wali Kelas:</strong> {currentKelas.waliKelas} (NIP. {currentKelas.nipWaliKelas})</span>
              <span>📍 <strong>Lokasi:</strong> {currentKelas.lokasiGedung}</span>
              <span>📐 <strong>Luas:</strong> {currentKelas.luasM2} m² ({currentKelas.kapasitasSiswa} Kursi)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-indigo-300" />
              Cetak Dokumen Kelas Ini
            </button>
          </div>
        </div>
      </div>

      {/* Classroom Administration Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('profil')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'profil'
              ? 'bg-indigo-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Profil & Sarpras Fasilitas
        </button>
        <button
          onClick={() => setActiveTab('struktur')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'struktur'
              ? 'bg-indigo-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Struktur Organisasi Kelas
        </button>
        <button
          onClick={() => setActiveTab('piket')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'piket'
              ? 'bg-indigo-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Jadwal Piket Kebersihan
        </button>
        <button
          onClick={() => setActiveTab('jadwal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'jadwal'
              ? 'bg-indigo-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Jadwal Pelajaran Kelas
        </button>
        <button
          onClick={() => setActiveTab('lms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'lms'
              ? 'bg-indigo-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          LMS & Pojok Belajar ({currentKelas.lms.length})
        </button>
        <button
          onClick={() => setActiveTab('refleksi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'refleksi'
              ? 'bg-indigo-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Refleksi Pelajaran Hari Ini ({currentKelas.refleksi.length})
        </button>
      </div>

      {/* Role Notice Banner for Ruang Kelas */}
      {canEditClass ? (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Wewenang Pengelolaan Aktif:</strong> Anda memiliki hak akses memperbarui keadministrasian Ruang Kelas {currentKelas.kelas} (Struktur, Piket, Jadwal, LMS, dan Jurnal Refleksi).
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-700 text-white font-bold text-[11px] shrink-0">
            {userRole === 'admin' ? 'Administrator' : `Wali Kelas ${currentKelas.kelas}`}
          </span>
        </div>
      ) : userRole === 'guru' ? (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Mode Lihat (Read-Only):</strong> Anda login sebagai <strong>Guru {currentUser?.rombel || `Kelas ${currentUser?.kelas || ''}`}</strong>. Ruang Kelas {currentKelas.kelas} ini hanya dapat diperbarui oleh Wali Kelas ({currentKelas.waliKelas}) atau Administrator.
            </span>
          </div>
          {currentUser?.kelas && (
            <button
              onClick={() => setSelectedKelasNum(currentUser.kelas!)}
              className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[11px] transition-colors cursor-pointer shrink-0"
            >
              Buka Ruang Kelas {currentUser.kelas} Saya
            </button>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
          <span>
            <strong>Mode Guest:</strong> Menampilkan profil fasilitas dan keadministrasian Ruang Kelas {currentKelas.kelas} SDN Kedungringin 1 Beji (Hanya Lihat).
          </span>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 1: PROFIL & SARPRAS RUANG KELAS */}
      {/* ============================================================ */}
      {activeTab === 'profil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Foto & Kondisi */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200">
              <img
                src={currentKelas.fotoUrl}
                alt={currentKelas.namaRuang}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
                Kondisi: {currentKelas.kondisi}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">{currentKelas.namaRuang}</h4>
              <p className="text-slate-600 leading-relaxed">
                Ruang pembelajaran standar nasional dilengkapi pencahayaan alami, sirkulasi udara optimal, papan tulis ganda, sudut literasi, serta media pembelajaran digital.
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Kapasitas Maksimal</span>
                  <span className="font-bold">{currentKelas.kapasitasSiswa} Siswa</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Luas Ruangan</span>
                  <span className="font-bold">{currentKelas.luasM2} m²</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Lokasi Gedung</span>
                  <span className="font-semibold">{currentKelas.lokasiGedung}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Wali Kelas</span>
                  <span className="font-bold text-indigo-700">{currentKelas.waliKelas}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Sarana & Inventaris Kelas */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-700" />
                  Daftar Fasilitas & Inventaris Fisik Ruang Kelas
                </h4>
                <p className="text-xs text-slate-500">
                  Kelengkapan mebel, sarana penunjang, dan media pembelajaran di dalam ruang.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <p className="text-[11px] text-slate-500">Meja Siswa</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{currentKelas.inventaris.mejaSiswa} Set</p>
                <span className="text-[10px] text-emerald-600 font-medium">Standar SNI</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <p className="text-[11px] text-slate-500">Kursi Siswa</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{currentKelas.inventaris.kursiSiswa} Unit</p>
                <span className="text-[10px] text-emerald-600 font-medium">Kondisi Baik</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <p className="text-[11px] text-slate-500">Meja & Kursi Guru</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">1 Set Lengkap</p>
                <span className="text-[10px] text-slate-500">Dengan Laci Kunci</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <p className="text-[11px] text-slate-500">Papan Tulis</p>
                <p className="text-xs font-bold text-slate-900 mt-1">{currentKelas.inventaris.papanTulis}</p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <p className="text-[11px] text-slate-500">Sirkulasi & Kipas</p>
                <p className="text-xs font-bold text-slate-900 mt-1">{currentKelas.inventaris.kipasAtauAc}</p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <p className="text-[11px] text-slate-500">Proyektor / Smart TV</p>
                <p className="text-xs font-bold text-slate-900 mt-1">{currentKelas.inventaris.proyektor}</p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 sm:col-span-2">
                <p className="text-[11px] text-slate-500">Pojok Baca & Sudut Literasi</p>
                <p className="text-xs font-bold text-slate-900 mt-1">{currentKelas.inventaris.pojokBaca}</p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                <p className="text-[11px] text-slate-500">Lemari Dokumen Kelas</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{currentKelas.inventaris.lemariKelas} Unit</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 2: STRUKTUR ORGANISASI KELAS */}
      {/* ============================================================ */}
      {activeTab === 'struktur' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-700" />
                Bagan Struktur Organisasi Paguyuban Kelas {currentKelas.kelas}
              </h3>
              <p className="text-xs text-slate-500">
                Tahun Ajaran {profil.tahunPelajaranAktif || '2024/2025'} • SDN Kedungringin 1 Beji
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak Bagan Organisasi
              </button>

              {canEditClass && (
                <button
                  onClick={() => {
                    setStrukturForm(currentKelas.strukturOrganisasi);
                    setModalStrukturOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Struktur
                </button>
              )}
            </div>
          </div>

          {/* Visual Organizational Chart Tree */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center space-y-6">
            {/* Level 1: Wali Kelas */}
            <div className="bg-gradient-to-r from-indigo-800 to-blue-800 text-white rounded-2xl p-4 shadow-lg text-center max-w-sm w-full border border-indigo-500/40">
              <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Wali Kelas</p>
              <h4 className="text-sm font-extrabold mt-0.5">{currentKelas.strukturOrganisasi.waliKelas}</h4>
              <p className="text-[10px] text-indigo-200 font-mono mt-0.5">NIP. {currentKelas.strukturOrganisasi.nipWaliKelas}</p>
            </div>

            <div className="w-0.5 h-6 bg-indigo-300"></div>

            {/* Level 2: Ketua & Wakil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full">
              <div className="bg-white rounded-xl p-3.5 shadow-md border-2 border-indigo-600 text-center">
                <p className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Ketua Kelas</p>
                <h5 className="text-xs font-extrabold text-slate-900 mt-1">{currentKelas.strukturOrganisasi.ketuaKelas}</h5>
              </div>
              <div className="bg-white rounded-xl p-3.5 shadow-md border-2 border-blue-500 text-center">
                <p className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Wakil Ketua Kelas</p>
                <h5 className="text-xs font-extrabold text-slate-900 mt-1">{currentKelas.strukturOrganisasi.wakilKetua}</h5>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-indigo-300"></div>

            {/* Level 3: Sekretaris & Bendahara */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full">
              <div className="bg-white rounded-xl p-3 shadow border border-slate-200 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">Sekretaris 1 & 2</p>
                <p className="text-xs font-bold text-slate-900 mt-1">{currentKelas.strukturOrganisasi.sekretaris1}</p>
                {currentKelas.strukturOrganisasi.sekretaris2 && (
                  <p className="text-xs text-slate-600 mt-0.5">{currentKelas.strukturOrganisasi.sekretaris2}</p>
                )}
              </div>
              <div className="bg-white rounded-xl p-3 shadow border border-slate-200 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500">Bendahara 1 & 2</p>
                <p className="text-xs font-bold text-slate-900 mt-1">{currentKelas.strukturOrganisasi.bendahara1}</p>
                {currentKelas.strukturOrganisasi.bendahara2 && (
                  <p className="text-xs text-slate-600 mt-0.5">{currentKelas.strukturOrganisasi.bendahara2}</p>
                )}
              </div>
            </div>

            <div className="w-0.5 h-6 bg-indigo-300"></div>

            {/* Level 4: Seksi-Seksi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                  🧹 Seksi Kebersihan
                </p>
                <ul className="text-xs text-emerald-950 mt-1.5 space-y-1">
                  {currentKelas.strukturOrganisasi.seksiKebersihan.map((n, i) => (
                    <li key={i} className="font-medium">• {n}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-[11px] font-bold text-blue-800 uppercase flex items-center gap-1.5">
                  🛡️ Seksi Keamanan
                </p>
                <ul className="text-xs text-blue-950 mt-1.5 space-y-1">
                  {currentKelas.strukturOrganisasi.seksiKeamanan.map((n, i) => (
                    <li key={i} className="font-medium">• {n}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1.5">
                  🕌 Seksi Keagamaan
                </p>
                <ul className="text-xs text-amber-950 mt-1.5 space-y-1">
                  {currentKelas.strukturOrganisasi.seksiKeagamaan.map((n, i) => (
                    <li key={i} className="font-medium">• {n}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <p className="text-[11px] font-bold text-purple-800 uppercase flex items-center gap-1.5">
                  🇮🇩 Seksi Upacara & Kerapian
                </p>
                <ul className="text-xs text-purple-950 mt-1.5 space-y-1">
                  {currentKelas.strukturOrganisasi.seksiUpacaraDanKerapian.map((n, i) => (
                    <li key={i} className="font-medium">• {n}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 3: JADWAL PIKET KEBERSIHAN KELAS */}
      {/* ============================================================ */}
      {activeTab === 'piket' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                Jadwal Piket Kebersihan & Kerapian Ruang Kelas {currentKelas.kelas}
              </h3>
              <p className="text-xs text-slate-500">
                Pembagian tugas regu kerja harian menjaga kebersihan lingkungan belajar menyenangkan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak Jadwal Piket Dinding
              </button>
            </div>
          </div>

          {/* Grid 6 Hari Piket */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentKelas.jadwalPiket.map((piket) => {
              const isToday = piket.hari === hariIni;
              return (
                <div
                  key={piket.hari}
                  className={`rounded-2xl p-4 border transition-all ${
                    isToday
                      ? 'bg-amber-50/70 border-amber-300 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      📅 {piket.hari}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                        Piket Hari Ini!
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Petugas Piket Siswa:</p>
                    <ul className="space-y-1 text-slate-800">
                      {piket.petugas.map((nama, i) => (
                        <li key={i} className="flex items-center gap-2 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                          {nama}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2 mt-2 border-t border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Tugas Pokok:</p>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                        {piket.tugasUtama}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 4: JADWAL PELAJARAN KELAS */}
      {/* ============================================================ */}
      {activeTab === 'jadwal' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-700" />
                Jadwal Pelajaran Mingguan Kelas {currentKelas.kelas}
              </h3>
              <p className="text-xs text-slate-500">
                Kurikulum Merdeka • Wajib PAI, PKn, B. Indo, MTK, IPAS, PJOK, Seni Budaya, B. Jawa, & B. Inggris.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak Jadwal Pelajaran
              </button>
            </div>
          </div>

          {/* Tabel Jadwal Pelajaran */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-14 text-center">Jam</th>
                  <th className="p-3 w-28 text-center">Waktu</th>
                  <th className="p-3">Senin</th>
                  <th className="p-3">Selasa</th>
                  <th className="p-3">Rabu</th>
                  <th className="p-3">Kamis</th>
                  <th className="p-3">Jumat</th>
                  <th className="p-3">Sabtu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentKelas.jadwalPelajaran.map((row) => (
                  <tr key={row.jamKe} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center font-bold text-slate-700 font-mono">Ke-{row.jamKe}</td>
                    <td className="p-3 text-center text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {row.waktu}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{row.senin.mapel}</p>
                      <p className="text-[10px] text-slate-500">{row.senin.guru}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{row.selasa.mapel}</p>
                      <p className="text-[10px] text-slate-500">{row.selasa.guru}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{row.rabu.mapel}</p>
                      <p className="text-[10px] text-slate-500">{row.rabu.guru}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{row.kamis.mapel}</p>
                      <p className="text-[10px] text-slate-500">{row.kamis.guru}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{row.jumat.mapel}</p>
                      <p className="text-[10px] text-slate-500">{row.jumat.guru}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{row.sabtu.mapel}</p>
                      <p className="text-[10px] text-slate-500">{row.sabtu.guru}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 5: LMS KELAS (POJOK BELAJAR & BAHAN TAYANG) */}
      {/* ============================================================ */}
      {activeTab === 'lms' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-700" />
                LMS Kelas (Learning Management Space & Pojok Modul Digital)
              </h3>
              <p className="text-xs text-slate-500">
                Penyimpanan materi modul, ringkasan belajar, tugas harian, dan pengumuman untuk siswa Ruang Kelas {currentKelas.kelas}.
              </p>
            </div>

            {canEditClass && (
              <button
                onClick={() => setModalLMSOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Modul / Bahan Belajar
              </button>
            )}
          </div>

          {/* Cards LMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentKelas.lms.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {item.mataPelajaran}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.tanggalPosting}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.judul}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.deskripsi}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {item.statusPengumpulan || 'Bahan Belajar'}
                  </span>
                  {item.linkSumber && (
                    <a
                      href={item.linkSumber}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-700 font-bold hover:underline"
                    >
                      Buka Materi <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
            {currentKelas.lms.length === 0 && (
              <div className="col-span-2 p-8 text-center text-slate-400">
                Belum ada modul atau materi LMS yang diunggah untuk kelas ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 6: REFLEKSI PELAJARAN HARI INI */}
      {/* ============================================================ */}
      {activeTab === 'refleksi' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-700" />
                Jurnal Refleksi Pembelajaran Hari Ini - Ruang Kelas {currentKelas.kelas}
              </h3>
              <p className="text-xs text-slate-500">
                Refleksi harian siswa dan guru: hal yang dipahami, kendala yang dihadapi, suasana belajar, dan umpan balik wali kelas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak Jurnal Refleksi
              </button>

              {canEditClass && (
                <button
                  onClick={() => setModalRefleksiOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tulis Refleksi Hari Ini
                </button>
              )}
            </div>
          </div>

          {/* List Refleksi */}
          <div className="space-y-4">
            {currentKelas.refleksi.map((ref) => (
              <div
                key={ref.id}
                className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                      {ref.mataPelajaran}
                    </span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {ref.topikBahasan}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900">
                      {ref.suasanaBelajar}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      📅 {ref.tanggal}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                    <p className="font-bold text-emerald-900 flex items-center gap-1">
                      💡 Hal Baru yang Dipahami Hari Ini:
                    </p>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      {ref.pemahamanBaru}
                    </p>
                  </div>

                  <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3">
                    <p className="font-bold text-rose-900 flex items-center gap-1">
                      ❓ Kendala / Bagian yang Masih Bingung:
                    </p>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      {ref.kendalaAtauTantangan}
                    </p>
                  </div>
                </div>

                {ref.catatanWaliKelas && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs">
                    <p className="font-bold text-blue-900 flex items-center gap-1">
                      🧑‍🏫 Umpan Balik Wali Kelas ({currentKelas.waliKelas}):
                    </p>
                    <p className="text-blue-950 mt-1 italic">
                      "{ref.catatanWaliKelas}"
                    </p>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-right">
                  Ditulis oleh: <span className="font-semibold text-slate-600">{ref.ditulisOleh}</span>
                </div>
              </div>
            ))}
            {currentKelas.refleksi.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                Belum ada entri refleksi pelajaran untuk ruang kelas ini. Silakan tulis refleksi hari ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL REFLEKSI PELAJARAN BARU */}
      {/* ============================================================ */}
      {modalRefleksiOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-indigo-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Tulis Refleksi Pembelajaran Hari Ini</h3>
              <button onClick={() => setModalRefleksiOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRefleksi} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={refleksiForm.tanggal}
                    onChange={(e) => setRefleksiForm({ ...refleksiForm, tanggal: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mata Pelajaran *</label>
                  <select
                    value={refleksiForm.mataPelajaran}
                    onChange={(e) => setRefleksiForm({ ...refleksiForm, mataPelajaran: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Pendidikan Agama Islam (PAI)">Pendidikan Agama Islam (PAI)</option>
                    <option value="Pendidikan Pancasila (PKn)">Pendidikan Pancasila (PKn)</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Matematika">Matematika</option>
                    <option value="IPAS">IPAS (Sains & Sosial)</option>
                    <option value="PJOK">PJOK</option>
                    <option value="Seni Budaya">Seni Budaya</option>
                    <option value="Bahasa Jawa (Mulok)">Bahasa Jawa (Mulok)</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Topik / Materi yang Dipelajari *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Operasi pembagian pecahan desimal"
                  value={refleksiForm.topikBahasan}
                  onChange={(e) => setRefleksiForm({ ...refleksiForm, topikBahasan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  1. Apa hal baru dan paling menarik yang dipahami hari ini? *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ceritakan apa yang kalian mengerti setelah belajar tadi..."
                  value={refleksiForm.pemahamanBaru}
                  onChange={(e) => setRefleksiForm({ ...refleksiForm, pemahamanBaru: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  2. Apa tantangan atau pertanyaan yang masih membingungkan?
                </label>
                <textarea
                  rows={2}
                  placeholder="Bagian mana yang dirasa masih sulit atau ingin diulang pembahasannya..."
                  value={refleksiForm.kendalaAtauTantangan}
                  onChange={(e) => setRefleksiForm({ ...refleksiForm, kendalaAtauTantangan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Suasana Belajar Hari Ini</label>
                  <select
                    value={refleksiForm.suasanaBelajar}
                    onChange={(e) => setRefleksiForm({ ...refleksiForm, suasanaBelajar: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Sangat Menyenangkan 🤩">Sangat Menyenangkan 🤩</option>
                    <option value="Senang & Paham 😊">Senang & Paham 😊</option>
                    <option value="Biasa Saja 😐">Biasa Saja 😐</option>
                    <option value="Butuh Penjelasan Ulang 😕">Butuh Penjelasan Ulang 😕</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ditulis Oleh</label>
                  <input
                    type="text"
                    value={refleksiForm.ditulisOleh}
                    onChange={(e) => setRefleksiForm({ ...refleksiForm, ditulisOleh: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Catatan / Umpan Balik Wali Kelas
                </label>
                <input
                  type="text"
                  placeholder="Apresiasi atau motivasi tindak lanjut..."
                  value={refleksiForm.catatanWaliKelas}
                  onChange={(e) => setRefleksiForm({ ...refleksiForm, catatanWaliKelas: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalRefleksiOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold"
                >
                  Simpan Jurnal Refleksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL TAMBAH MODUL LMS */}
      {/* ============================================================ */}
      {modalLMSOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-indigo-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Tambah Bahan Belajar LMS</h3>
              <button onClick={() => setModalLMSOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLMS} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Materi / Tugas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul Rangkuman Sistem Peredaran Darah"
                  value={lmsForm.judul}
                  onChange={(e) => setLmsForm({ ...lmsForm, judul: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={lmsForm.mataPelajaran}
                    onChange={(e) => setLmsForm({ ...lmsForm, mataPelajaran: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipe Konten</label>
                  <select
                    value={lmsForm.tipe}
                    onChange={(e) => setLmsForm({ ...lmsForm, tipe: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Materi / Modul">Materi / Modul</option>
                    <option value="Tugas Harian">Tugas Harian</option>
                    <option value="Video Pembelajaran">Video Pembelajaran</option>
                    <option value="Pengumuman">Pengumuman</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Petunjuk belajar untuk siswa..."
                  value={lmsForm.deskripsi}
                  onChange={(e) => setLmsForm({ ...lmsForm, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Link URL Materi / Video</label>
                <input
                  type="text"
                  placeholder="https://kemdikbud.go.id/..."
                  value={lmsForm.linkSumber}
                  onChange={(e) => setLmsForm({ ...lmsForm, linkSumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalLMSOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold"
                >
                  Publikasikan ke Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL EDIT STRUKTUR ORGANISASI */}
      {/* ============================================================ */}
      {modalStrukturOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-indigo-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Edit Struktur Organisasi Kelas {currentKelas.kelas}</h3>
              <button onClick={() => setModalStrukturOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStruktur} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ketua Kelas</label>
                  <input
                    type="text"
                    required
                    value={strukturForm.ketuaKelas}
                    onChange={(e) => setStrukturForm({ ...strukturForm, ketuaKelas: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Wakil Ketua</label>
                  <input
                    type="text"
                    required
                    value={strukturForm.wakilKetua}
                    onChange={(e) => setStrukturForm({ ...strukturForm, wakilKetua: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sekretaris 1</label>
                  <input
                    type="text"
                    required
                    value={strukturForm.sekretaris1}
                    onChange={(e) => setStrukturForm({ ...strukturForm, sekretaris1: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sekretaris 2</label>
                  <input
                    type="text"
                    value={strukturForm.sekretaris2 || ''}
                    onChange={(e) => setStrukturForm({ ...strukturForm, sekretaris2: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bendahara 1</label>
                  <input
                    type="text"
                    required
                    value={strukturForm.bendahara1}
                    onChange={(e) => setStrukturForm({ ...strukturForm, bendahara1: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bendahara 2</label>
                  <input
                    type="text"
                    value={strukturForm.bendahara2 || ''}
                    onChange={(e) => setStrukturForm({ ...strukturForm, bendahara2: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Seksi Kebersihan (pisahkan koma)
                </label>
                <input
                  type="text"
                  value={strukturForm.seksiKebersihan.join(', ')}
                  onChange={(e) => setStrukturForm({ ...strukturForm, seksiKebersihan: e.target.value.split(',').map((s) => s.trim()) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Seksi Keamanan (pisahkan koma)
                </label>
                <input
                  type="text"
                  value={strukturForm.seksiKeamanan.join(', ')}
                  onChange={(e) => setStrukturForm({ ...strukturForm, seksiKeamanan: e.target.value.split(',').map((s) => s.trim()) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalStrukturOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold"
                >
                  Simpan Struktur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
