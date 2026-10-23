import React, { useState } from 'react';
import { 
  BukuPerpustakaan, 
  PeminjamanBuku, 
  AnggotaPerpustakaan, 
  PengunjungPerpustakaan, 
  ProfilSekolah, 
  UserRole 
} from '../../types';
import { CetakKartuPerpusModal } from './CetakKartuPerpusModal';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Download, 
  Filter, 
  Edit3, 
  Trash2, 
  ArrowLeftRight, 
  Users, 
  CreditCard, 
  UserCheck, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  Printer, 
  Sparkles,
  BookMarked,
  Layers,
  Calendar
} from 'lucide-react';

interface PerpustakaanProps {
  bukuList: BukuPerpustakaan[];
  peminjamanList: PeminjamanBuku[];
  anggotaList: AnggotaPerpustakaan[];
  pengunjungList: PengunjungPerpustakaan[];
  profil: ProfilSekolah;
  userRole: UserRole;
  onSaveBuku: (buku: BukuPerpustakaan) => void;
  onDeleteBuku: (id: string) => void;
  onSavePeminjaman: (peminjaman: PeminjamanBuku) => void;
  onKembalikanBuku: (id: string) => void;
  onSaveAnggota: (anggota: AnggotaPerpustakaan) => void;
  onDeleteAnggota: (id: string) => void;
  onAddPengunjung: (pengunjung: PengunjungPerpustakaan) => void;
}

type PerpusTab = 'katalog' | 'sirkulasi' | 'anggota' | 'kartu' | 'pengunjung' | 'spreadsheet';

export const Perpustakaan: React.FC<PerpustakaanProps> = ({
  bukuList,
  peminjamanList,
  anggotaList,
  pengunjungList,
  profil,
  userRole,
  onSaveBuku,
  onDeleteBuku,
  onSavePeminjaman,
  onKembalikanBuku,
  onSaveAnggota,
  onDeleteAnggota,
  onAddPengunjung,
}) => {
  const [activeTab, setActiveTab] = useState<PerpusTab>('katalog');

  // Search & Filters
  const [searchKatalog, setSearchKatalog] = useState('');
  const [filterKategoriBuku, setFilterKategoriBuku] = useState('ALL');
  
  const [searchSirkulasi, setSearchSirkulasi] = useState('');
  const [filterStatusSirkulasi, setFilterStatusSirkulasi] = useState('ALL');

  const [searchAnggota, setSearchAnggota] = useState('');
  const [filterTipeAnggota, setFilterTipeAnggota] = useState('ALL');

  // Card Print Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<string | null>(null);

  // Modals for CRUD
  const [modalBukuOpen, setModalBukuOpen] = useState(false);
  const [editingBuku, setEditingBuku] = useState<BukuPerpustakaan | null>(null);
  const [bukuForm, setBukuForm] = useState<Partial<BukuPerpustakaan>>({
    kodeBuku: '',
    isbn: '',
    judul: '',
    pengarang: '',
    penerbit: '',
    tahunTerbit: 2023,
    kategori: 'Kurikulum Merdeka',
    jumlahEksemplar: 10,
    jumlahTersedia: 10,
    rakLokasi: 'Rak A-01',
    kondisi: 'Baik',
    sinopsis: '',
  });

  // Modal Peminjaman Baru
  const [modalPinjamOpen, setModalPinjamOpen] = useState(false);
  const [pinjamForm, setPinjamForm] = useState<{
    bukuId: string;
    anggotaId: string;
    tanggalPinjam: string;
    batasKembali: string;
    keterangan: string;
  }>({
    bukuId: bukuList[0]?.id || '',
    anggotaId: anggotaList[0]?.id || '',
    tanggalPinjam: new Date().toISOString().split('T')[0],
    batasKembali: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    keterangan: 'Peminjaman buku reguler perpustakaan',
  });

  // Modal Form Pengunjung Cepat
  const [modalPengunjungOpen, setModalPengunjungOpen] = useState(false);
  const [pengunjungForm, setPengunjungForm] = useState<{
    nama: string;
    tipe: 'Siswa' | 'Guru' | 'Tamu';
    kelasOrUnit: string;
    keperluan: 'Membaca di Tempat' | 'Peminjaman / Pengembalian' | 'Literasi Digital' | 'Diskusi / Tugas Kelompok';
  }>({
    nama: '',
    tipe: 'Siswa',
    kelasOrUnit: 'Kelas 6A',
    keperluan: 'Membaca di Tempat',
  });

  // Modal Anggota Baru
  const [modalAnggotaOpen, setModalAnggotaOpen] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<AnggotaPerpustakaan | null>(null);
  const [anggotaForm, setAnggotaForm] = useState<Partial<AnggotaPerpustakaan>>({
    nomorAnggota: `LIB-${new Date().getFullYear()}-${String(anggotaList.length + 1).padStart(3, '0')}`,
    nama: '',
    tipe: 'Siswa',
    nisnOrNip: '',
    kelasOrUnit: 'Kelas 1A',
    jenisKelamin: 'L',
    tanggalDaftar: new Date().toISOString().split('T')[0],
    status: 'Aktif',
    jumlahPinjamanAktif: 0,
  });

  // Export Spreadsheet Helper
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((e) => e.join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportKatalog = () => {
    const headers = ['Kode Buku', 'ISBN', 'Judul Buku', 'Pengarang', 'Penerbit', 'Tahun', 'Kategori', 'Total Eksemplar', 'Tersedia', 'Lokasi Rak', 'Kondisi'];
    const rows = bukuList.map((b) => [
      `"${b.kodeBuku}"`,
      `"${b.isbn}"`,
      `"${b.judul.replace(/"/g, '""')}"`,
      `"${b.pengarang}"`,
      `"${b.penerbit}"`,
      b.tahunTerbit,
      `"${b.kategori}"`,
      b.jumlahEksemplar,
      b.jumlahTersedia,
      `"${b.rakLokasi}"`,
      `"${b.kondisi}"`,
    ]);
    downloadCSV('Katalog_Buku_Perpustakaan_SDN1_Kedungringin', headers, rows);
  };

  const handleExportSirkulasi = () => {
    const headers = ['Kode Transaksi', 'Kode Buku', 'Judul Buku', 'Nama Peminjam', 'Tipe', 'Kelas/Unit', 'Tanggal Pinjam', 'Batas Kembali', 'Tanggal Kembali', 'Status', 'Keterangan'];
    const rows = peminjamanList.map((p) => [
      `"${p.kodePeminjaman}"`,
      `"${p.kodeBuku}"`,
      `"${p.judulBuku.replace(/"/g, '""')}"`,
      `"${p.namaPeminjam}"`,
      `"${p.jenisPeminjam}"`,
      `"${p.kelas || '-'}"`,
      `"${p.tanggalPinjam}"`,
      `"${p.batasKembali}"`,
      `"${p.tanggalKembali || '-'}"`,
      `"${p.status}"`,
      `"${p.keterangan || '-'}"`,
    ]);
    downloadCSV('Sirkulasi_Peminjaman_Perpustakaan_SDN1_Kedungringin', headers, rows);
  };

  const handleExportAnggota = () => {
    const headers = ['No Anggota', 'Nama Lengkap', 'Tipe', 'NISN / NIP', 'Kelas / Unit', 'Jenis Kelamin', 'Tanggal Bergabung', 'Status', 'Pinjaman Aktif'];
    const rows = anggotaList.map((a) => [
      `"${a.nomorAnggota}"`,
      `"${a.nama}"`,
      `"${a.tipe}"`,
      `"${a.nisnOrNip}"`,
      `"${a.kelasOrUnit}"`,
      `"${a.jenisKelamin}"`,
      `"${a.tanggalDaftar}"`,
      `"${a.status}"`,
      a.jumlahPinjamanAktif,
    ]);
    downloadCSV('Daftar_Anggota_Perpustakaan_SDN1_Kedungringin', headers, rows);
  };

  const handleExportPengunjung = () => {
    const headers = ['Tanggal', 'Jam', 'Nama Pengunjung', 'Tipe', 'Kelas / Unit', 'Keperluan'];
    const rows = pengunjungList.map((v) => [
      `"${v.tanggal}"`,
      `"${v.jam}"`,
      `"${v.nama}"`,
      `"${v.tipe}"`,
      `"${v.kelasOrUnit}"`,
      `"${v.keperluan}"`,
    ]);
    downloadCSV('Buku_Pengunjung_Perpustakaan_SDN1_Kedungringin', headers, rows);
  };

  // Handlers for Save
  const handleSaveBukuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bukuForm.judul || !bukuForm.kodeBuku) return;

    const payload: BukuPerpustakaan = {
      id: editingBuku ? editingBuku.id : `bk-${Date.now()}`,
      kodeBuku: bukuForm.kodeBuku || `B-${Date.now().toString().slice(-4)}`,
      isbn: bukuForm.isbn || '-',
      judul: bukuForm.judul || '',
      pengarang: bukuForm.pengarang || '-',
      penerbit: bukuForm.penerbit || '-',
      tahunTerbit: Number(bukuForm.tahunTerbit || 2023),
      kategori: (bukuForm.kategori as any) || 'Kurikulum Merdeka',
      jumlahEksemplar: Number(bukuForm.jumlahEksemplar || 1),
      jumlahTersedia: Number(bukuForm.jumlahTersedia !== undefined ? bukuForm.jumlahTersedia : bukuForm.jumlahEksemplar || 1),
      rakLokasi: bukuForm.rakLokasi || 'Rak Umum',
      kondisi: (bukuForm.kondisi as any) || 'Baik',
      sinopsis: bukuForm.sinopsis || '',
      coverUrl: bukuForm.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    };

    onSaveBuku(payload);
    setModalBukuOpen(false);
  };

  const handleSavePinjamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const book = bukuList.find((b) => b.id === pinjamForm.bukuId);
    const member = anggotaList.find((m) => m.id === pinjamForm.anggotaId);
    if (!book || !member) return;

    const payload: PeminjamanBuku = {
      id: `pinjam-${Date.now()}`,
      kodePeminjaman: `TRX-${new Date().getFullYear()}-${String(peminjamanList.length + 1).padStart(4, '0')}`,
      bukuId: book.id,
      kodeBuku: book.kodeBuku,
      judulBuku: book.judul,
      anggotaId: member.id,
      namaPeminjam: member.nama,
      jenisPeminjam: member.tipe,
      kelas: member.kelasOrUnit,
      tanggalPinjam: pinjamForm.tanggalPinjam,
      batasKembali: pinjamForm.batasKembali,
      status: 'Dipinjam',
      keterangan: pinjamForm.keterangan,
    };

    onSavePeminjaman(payload);
    setModalPinjamOpen(false);
  };

  const handleSavePengunjungSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pengunjungForm.nama) return;

    const now = new Date();
    const payload: PengunjungPerpustakaan = {
      id: `vis-${Date.now()}`,
      tanggal: now.toISOString().split('T')[0],
      jam: now.toTimeString().split(' ')[0].slice(0, 5),
      nama: pengunjungForm.nama,
      tipe: pengunjungForm.tipe,
      kelasOrUnit: pengunjungForm.kelasOrUnit,
      keperluan: pengunjungForm.keperluan,
    };

    onAddPengunjung(payload);
    setModalPengunjungOpen(false);
    setPengunjungForm({
      nama: '',
      tipe: 'Siswa',
      kelasOrUnit: 'Kelas 6A',
      keperluan: 'Membaca di Tempat',
    });
  };

  const handleSaveAnggotaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anggotaForm.nama) return;

    const payload: AnggotaPerpustakaan = {
      id: editingAnggota ? editingAnggota.id : `agt-${Date.now()}`,
      nomorAnggota: anggotaForm.nomorAnggota || `LIB-SDN1-${String(anggotaList.length + 1).padStart(3, '0')}`,
      nama: anggotaForm.nama || '',
      tipe: anggotaForm.tipe || 'Siswa',
      nisnOrNip: anggotaForm.nisnOrNip || '-',
      kelasOrUnit: anggotaForm.kelasOrUnit || 'Kelas 1',
      jenisKelamin: anggotaForm.jenisKelamin || 'L',
      tanggalDaftar: anggotaForm.tanggalDaftar || new Date().toISOString().split('T')[0],
      status: anggotaForm.status || 'Aktif',
      jumlahPinjamanAktif: anggotaForm.jumlahPinjamanAktif || 0,
    };

    onSaveAnggota(payload);
    setModalAnggotaOpen(false);
  };

  // Filtered Lists
  const filteredBuku = bukuList.filter((b) => {
    const matchSearch =
      b.judul.toLowerCase().includes(searchKatalog.toLowerCase()) ||
      b.pengarang.toLowerCase().includes(searchKatalog.toLowerCase()) ||
      b.kodeBuku.toLowerCase().includes(searchKatalog.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchKatalog.toLowerCase());
    const matchCat = filterKategoriBuku === 'ALL' || b.kategori === filterKategoriBuku;
    return matchSearch && matchCat;
  });

  const filteredSirkulasi = peminjamanList.filter((p) => {
    const matchSearch =
      p.judulBuku.toLowerCase().includes(searchSirkulasi.toLowerCase()) ||
      p.namaPeminjam.toLowerCase().includes(searchSirkulasi.toLowerCase()) ||
      p.kodePeminjaman.toLowerCase().includes(searchSirkulasi.toLowerCase());
    const matchStatus = filterStatusSirkulasi === 'ALL' || p.status === filterStatusSirkulasi;
    return matchSearch && matchStatus;
  });

  const filteredAnggota = anggotaList.filter((a) => {
    const matchSearch =
      a.nama.toLowerCase().includes(searchAnggota.toLowerCase()) ||
      a.nomorAnggota.toLowerCase().includes(searchAnggota.toLowerCase()) ||
      a.nisnOrNip.toLowerCase().includes(searchAnggota.toLowerCase());
    const matchTipe = filterTipeAnggota === 'ALL' || a.tipe === filterTipeAnggota;
    return matchSearch && matchTipe;
  });

  // Summary Metrics
  const totalJudul = bukuList.length;
  const totalEksemplar = bukuList.reduce((acc, curr) => acc + curr.jumlahEksemplar, 0);
  const totalDipinjam = peminjamanList.filter((p) => p.status === 'Dipinjam').length;
  const totalAnggota = anggotaList.length;

  return (
    <div className="space-y-6">
      {/* Top Banner Perpustakaan Pelita Ilmu */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
          <BookOpen className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Sistem Administrasi Kepustakaan Sekolah Berbasis Spreadsheet
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Perpustakaan "Pelita Ilmu"
            </h2>
            <p className="text-emerald-100 text-sm max-w-2xl">
              Pusat literasi, katalog buku Kurikulum Merdeka, sirkulasi peminjaman, keanggotaan, cetak kartu resmi, dan buku kunjungan harian SDN Kedungringin 1 Beji.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedMemberForCard(anggotaList[0]?.id || null);
                setIsCardModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Cetak Kartu Perpustakaan
            </button>
            <button
              onClick={() => setActiveTab('spreadsheet')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-colors cursor-pointer backdrop-blur-md"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              File Spreadsheet
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-700/50">
          <div className="bg-emerald-900/40 backdrop-blur-sm p-3.5 rounded-xl border border-emerald-600/30">
            <p className="text-xs text-emerald-300 font-medium">Total Judul Buku</p>
            <p className="text-2xl font-bold text-white mt-1">{totalJudul} <span className="text-xs font-normal text-emerald-200">Judul</span></p>
          </div>
          <div className="bg-emerald-900/40 backdrop-blur-sm p-3.5 rounded-xl border border-emerald-600/30">
            <p className="text-xs text-emerald-300 font-medium">Total Koleksi Eksemplar</p>
            <p className="text-2xl font-bold text-white mt-1">{totalEksemplar} <span className="text-xs font-normal text-emerald-200">Buku</span></p>
          </div>
          <div className="bg-emerald-900/40 backdrop-blur-sm p-3.5 rounded-xl border border-emerald-600/30">
            <p className="text-xs text-emerald-300 font-medium">Buku Sedang Dipinjam</p>
            <p className="text-2xl font-bold text-amber-300 mt-1">{totalDipinjam} <span className="text-xs font-normal text-emerald-200">Eksemplar</span></p>
          </div>
          <div className="bg-emerald-900/40 backdrop-blur-sm p-3.5 rounded-xl border border-emerald-600/30">
            <p className="text-xs text-emerald-300 font-medium">Anggota Terdaftar</p>
            <p className="text-2xl font-bold text-white mt-1">{totalAnggota} <span className="text-xs font-normal text-emerald-200">Orang</span></p>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('katalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'katalog'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Katalog Buku ({bukuList.length})
        </button>
        <button
          onClick={() => setActiveTab('sirkulasi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'sirkulasi'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          Peminjaman & Pengembalian ({peminjamanList.length})
        </button>
        <button
          onClick={() => setActiveTab('anggota')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'anggota'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Daftar Anggota ({anggotaList.length})
        </button>
        <button
          onClick={() => setActiveTab('kartu')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'kartu'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Cetak Kartu Perpus
        </button>
        <button
          onClick={() => setActiveTab('pengunjung')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'pengunjung'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Buku Pengunjung ({pengunjungList.length})
        </button>
        <button
          onClick={() => setActiveTab('spreadsheet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'spreadsheet'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Pusat Unduh Spreadsheet
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: KATALOG BUKU */}
      {/* ============================================================ */}
      {activeTab === 'katalog' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari judul, pengarang, ISBN, atau kode buku..."
                  value={searchKatalog}
                  onChange={(e) => setSearchKatalog(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <select
                value={filterKategoriBuku}
                onChange={(e) => setFilterKategoriBuku(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                <option value="Buku Bacaan / Fiksi">Buku Bacaan / Fiksi</option>
                <option value="Referensi & Kamus">Referensi & Kamus</option>
                <option value="Sains & Teknologi">Sains & Teknologi</option>
                <option value="Agama & Budi Pekerti">Agama & Budi Pekerti</option>
                <option value="Muatan Lokal">Muatan Lokal</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportKatalog}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export Spreadsheet
              </button>

              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    setEditingBuku(null);
                    setBukuForm({
                      kodeBuku: `B-${Date.now().toString().slice(-4)}`,
                      isbn: '',
                      judul: '',
                      pengarang: '',
                      penerbit: '',
                      tahunTerbit: 2024,
                      kategori: 'Kurikulum Merdeka',
                      jumlahEksemplar: 10,
                      jumlahTersedia: 10,
                      rakLokasi: 'Rak A-01',
                      kondisi: 'Baik',
                      sinopsis: '',
                    });
                    setModalBukuOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Buku
                </button>
              )}
            </div>
          </div>

          {/* Tabel Katalog */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Kode & ISBN</th>
                  <th className="p-3">Judul Buku & Sinopsis</th>
                  <th className="p-3">Pengarang & Penerbit</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-center">Eksemplar</th>
                  <th className="p-3">Lokasi Rak</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBuku.map((buku, idx) => (
                  <tr key={buku.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block w-max">
                        {buku.kodeBuku}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        ISBN: {buku.isbn}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs">
                      <p className="font-bold text-slate-900 leading-snug">{buku.judul}</p>
                      {buku.sinopsis && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{buku.sinopsis}</p>
                      )}
                    </td>
                    <td className="p-3 text-slate-700">
                      <p className="font-medium">{buku.pengarang}</p>
                      <p className="text-[11px] text-slate-400">{buku.penerbit} ({buku.tahunTerbit})</p>
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {buku.kategori}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-bold text-emerald-700 text-sm">
                          {buku.jumlahTersedia} / {buku.jumlahEksemplar}
                        </span>
                        <span className="text-[9px] text-slate-400">Tersedia</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-700 font-medium bg-slate-100 px-2 py-1 rounded text-[11px]">
                        {buku.rakLokasi}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {userRole === 'admin' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingBuku(buku);
                              setBukuForm(buku);
                              setModalBukuOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Edit Data Buku"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteBuku(buku.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Buku"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Hanya Lihat</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredBuku.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Tidak ada buku yang sesuai dengan pencarian atau filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SIRKULASI (PEMINJAMAN & PENGEMBALIAN) */}
      {/* ============================================================ */}
      {activeTab === 'sirkulasi' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama peminjam, judul buku, kode transaksi..."
                  value={searchSirkulasi}
                  onChange={(e) => setSearchSirkulasi(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <select
                value={filterStatusSirkulasi}
                onChange={(e) => setFilterStatusSirkulasi(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="Dipinjam">Sedang Dipinjam</option>
                <option value="Dikembalikan">Dikembalikan</option>
                <option value="Terlambat">Terlambat</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportSirkulasi}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export Sirkulasi (.CSV)
              </button>

              {userRole === 'admin' && (
                <button
                  onClick={() => setModalPinjamOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Transaksi Pinjam Baru
                </button>
              )}
            </div>
          </div>

          {/* Tabel Sirkulasi */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Kode Pinjam</th>
                  <th className="p-3">Peminjam</th>
                  <th className="p-3">Judul Buku</th>
                  <th className="p-3">Tgl Pinjam</th>
                  <th className="p-3">Batas Kembali</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Keterangan</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSirkulasi.map((trx, idx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {trx.kodePeminjaman}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{trx.namaPeminjam}</p>
                      <span className="text-[10px] text-slate-500">
                        {trx.jenisPeminjam} • {trx.kelas || '-'}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs">
                      <p className="font-semibold text-slate-800">{trx.judulBuku}</p>
                      <span className="text-[10px] text-emerald-700 font-mono">{trx.kodeBuku}</span>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{trx.tanggalPinjam}</td>
                    <td className="p-3 text-slate-600 font-medium">
                      <span className={trx.status === 'Dipinjam' ? 'text-amber-700 font-bold' : ''}>
                        {trx.batasKembali}
                      </span>
                    </td>
                    <td className="p-3">
                      {trx.status === 'Dipinjam' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3" />
                          Dipinjam
                        </span>
                      ) : trx.status === 'Dikembalikan' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Dikembalikan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertCircle className="w-3 h-3" />
                          Terlambat
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 max-w-[180px] truncate">
                      {trx.keterangan || '-'}
                    </td>
                    <td className="p-3 text-center">
                      {userRole === 'admin' && trx.status === 'Dipinjam' ? (
                        <button
                          onClick={() => onKembalikanBuku(trx.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-sm transition-colors cursor-pointer"
                        >
                          Kembalikan
                        </button>
                      ) : trx.status === 'Dikembalikan' ? (
                        <span className="text-[10px] text-slate-400 font-medium">Selesai</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Hanya Lihat</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSirkulasi.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      Tidak ada riwayat sirkulasi peminjaman buku.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: DAFTAR ANGGOTA */}
      {/* ============================================================ */}
      {activeTab === 'anggota' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama anggota, No Anggota, NISN/NIP..."
                  value={searchAnggota}
                  onChange={(e) => setSearchAnggota(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <select
                value={filterTipeAnggota}
                onChange={(e) => setFilterTipeAnggota(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Tipe</option>
                <option value="Siswa">Siswa</option>
                <option value="Guru">Guru / Pendidik</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAnggota}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export Anggota (.CSV)
              </button>

              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    setEditingAnggota(null);
                    setAnggotaForm({
                      nomorAnggota: `LIB-SDN1-${String(anggotaList.length + 1).padStart(3, '0')}`,
                      nama: '',
                      tipe: 'Siswa',
                      nisnOrNip: '',
                      kelasOrUnit: 'Kelas 1',
                      jenisKelamin: 'L',
                      tanggalDaftar: new Date().toISOString().split('T')[0],
                      status: 'Aktif',
                      jumlahPinjamanAktif: 0,
                    });
                    setModalAnggotaOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Anggota
                </button>
              )}
            </div>
          </div>

          {/* Tabel Anggota */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">No Anggota</th>
                  <th className="p-3">Nama Anggota</th>
                  <th className="p-3">Tipe & Kelas</th>
                  <th className="p-3">NISN / NIP</th>
                  <th className="p-3">Tgl Daftar</th>
                  <th className="p-3 text-center">Pinjaman Aktif</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Aksi & Cetak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnggota.map((agt, idx) => (
                  <tr key={agt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {agt.nomorAnggota}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{agt.nama}</p>
                      <span className="text-[10px] text-slate-400">JK: {agt.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-700 block">{agt.kelasOrUnit}</span>
                      <span className="text-[10px] text-slate-500">{agt.tipe}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{agt.nisnOrNip}</td>
                    <td className="p-3 text-slate-600">{agt.tanggalDaftar}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        agt.jumlahPinjamanAktif > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {agt.jumlahPinjamanAktif} Buku
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {agt.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMemberForCard(agt.id);
                            setIsCardModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[10px] shadow-sm transition-colors cursor-pointer"
                          title="Cetak Kartu Perpustakaan"
                        >
                          <CreditCard className="w-3 h-3" />
                          Cetak Kartu
                        </button>

                        {userRole === 'admin' && (
                          <button
                            onClick={() => {
                              setEditingAnggota(agt);
                              setAnggotaForm(agt);
                              setModalAnggotaOpen(true);
                            }}
                            className="p-1 rounded-md text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
                            title="Edit Anggota"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: CETAK KARTU PERPUS PREVIEW & TRIGGER */}
      {/* ============================================================ */}
      {activeTab === 'kartu' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                Layanan Cetak Kartu Perpustakaan Sekolah
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kartu anggota resmi dilengkapi barcode nomor anggota, foto siswa, ketentuan perpustakaan, tanda tangan pengelola, dan stempel sekolah.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedMemberForCard(anggotaList[0]?.id || null);
                  setIsCardModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Buka Dialog Cetak Lengkap (Single / Batch A4)
              </button>
            </div>
          </div>

          {/* Kartu Grid Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anggotaList.slice(0, 6).map((member) => (
              <div 
                key={member.id} 
                className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-4 shadow-lg border border-emerald-600/40 relative overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all"
              >
                <div className="border-b border-emerald-400/30 pb-2 flex items-center gap-2.5">
                  <span className="text-xl">📚</span>
                  <div className="leading-tight">
                    <p className="text-[9px] font-bold tracking-wider uppercase text-emerald-300">SDN KEDUNGRINGIN 1 BEJI</p>
                    <p className="text-[11px] font-extrabold text-white">KARTU PERPUSTAKAAN</p>
                  </div>
                </div>

                <div className="py-3 flex items-center gap-3">
                  <div className="w-14 h-18 rounded-lg bg-emerald-950/60 border border-emerald-400/60 overflow-hidden shrink-0 flex items-center justify-center">
                    {Boolean(member.fotoUrl && member.fotoUrl.trim()) ? (
                      <img src={member.fotoUrl} alt={member.nama} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold text-white text-xs">{member.nama}</p>
                    <p className="text-[10px] text-amber-300 font-mono font-bold">{member.nomorAnggota}</p>
                    <p className="text-[10px] text-emerald-200">{member.kelasOrUnit} • {member.tipe}</p>
                  </div>
                </div>

                <div className="border-t border-emerald-400/30 pt-2 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-emerald-200">NISN: {member.nisnOrNip}</span>
                  <button
                    onClick={() => {
                      setSelectedMemberForCard(member.id);
                      setIsCardModalOpen(true);
                    }}
                    className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Cetak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: BUKU PENGUNJUNG / PRESENSI KUNJUNGAN */}
      {/* ============================================================ */}
      {activeTab === 'pengunjung' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Presensi & Buku Kunjungan Harian Perpustakaan
              </h3>
              <p className="text-xs text-slate-500">
                Mencatat aktivitas kunjungan siswa dan dewan guru untuk kebutuhan laporan akreditasi & literasi sekolah.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPengunjung}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export Rekap Pengunjung (.CSV)
              </button>

              <button
                onClick={() => setModalPengunjungOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Isi Presensi Kunjungan
              </button>
            </div>
          </div>

          {/* Tabel Buku Pengunjung */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Tanggal & Jam</th>
                  <th className="p-3">Nama Pengunjung</th>
                  <th className="p-3">Tipe</th>
                  <th className="p-3">Kelas / Unit Kerja</th>
                  <th className="p-3">Keperluan Kunjungan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pengunjungList.map((vis, idx) => (
                  <tr key={vis.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800 block">{vis.tanggal}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Pukul {vis.jam} WIB</span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{vis.nama}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {vis.tipe}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{vis.kelasOrUnit}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-xs">
                        {vis.keperluan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: PUSAT UNDUH FILE SPREADSHEET */}
      {/* ============================================================ */}
      {activeTab === 'spreadsheet' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              Pusat Unduh File Spreadsheet Keadministrasian Perpustakaan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh berkas administrasi kepustakaan SDN Kedungringin 1 Beji terintegrasi dengan format spreadsheet standar (Excel, Google Sheets, LibreOffice Calc).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Master Template */}
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  📗
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  1. Master Berkas Spreadsheet Administrasi Kepustakaan Lengkap
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Format komprehensif berisi seluruh lembar kerja katalog buku, kartu buku, kode klasifikasi DDC perpustakaan SD, dan buku induk perpustakaan.
                </p>
              </div>
              <button
                onClick={handleExportKatalog}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Unduh Master Template Spreadsheet (.CSV)
              </button>
            </div>

            {/* Card 2: Katalog Buku */}
            <div className="border border-slate-200 bg-white rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
                  📘
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  2. File Spreadsheet Katalog Buku (Daftar Buku)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Berisi kolom lengkap: Kode Buku, ISBN, Judul, Pengarang, Penerbit, Tahun Terbit, Kategori Kurikulum Merdeka, Jumlah Eksemplar, Ketersediaan, dan Lokasi Rak.
                </p>
              </div>
              <button
                onClick={handleExportKatalog}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                Unduh File Spreadsheet Katalog Buku
              </button>
            </div>

            {/* Card 3: Sirkulasi */}
            <div className="border border-slate-200 bg-white rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  📙
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  3. File Spreadsheet Sirkulasi Peminjaman & Pengembalian
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Memuat rekap transaksi peminjaman buku oleh siswa dan guru, batas pengembalian, status keterlambatan, dan riwayat sirkulasi aktif.
                </p>
              </div>
              <button
                onClick={handleExportSirkulasi}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                Unduh File Spreadsheet Sirkulasi Buku
              </button>
            </div>

            {/* Card 4: Buku Induk Anggota */}
            <div className="border border-slate-200 bg-white rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  📕
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  4. File Spreadsheet Buku Induk Anggota Perpustakaan
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Daftar registrasi seluruh anggota perpustakaan (Siswa Kelas 1 s.d. 6 dan Guru), Nomor Anggota, NISN/NIP, dan tanggal keaktifan.
                </p>
              </div>
              <button
                onClick={handleExportAnggota}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                Unduh File Spreadsheet Buku Induk Anggota
              </button>
            </div>

            {/* Card 5: Rekap Pengunjung */}
            <div className="border border-slate-200 bg-white rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors md:col-span-2">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  📒
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  5. File Spreadsheet Buku Kunjungan & Presensi Harian Pengunjung Perpustakaan
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Log data harian siswa dan guru yang berkunjung ke perpustakaan sekolah dengan pencatatan waktu dan tujuan kunjungan (literasi, pinjam buku, diskusi).
                </p>
              </div>
              <button
                onClick={handleExportPengunjung}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                Unduh File Spreadsheet Buku Kunjungan Perpustakaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL TAMBAH/EDIT BUKU */}
      {/* ============================================================ */}
      {modalBukuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingBuku ? 'Edit Data Koleksi Buku' : 'Tambah Buku Baru ke Katalog'}
              </h3>
              <button onClick={() => setModalBukuOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBukuSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode Buku *</label>
                  <input
                    type="text"
                    required
                    value={bukuForm.kodeBuku || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, kodeBuku: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Contoh: B-KMR-05"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ISBN</label>
                  <input
                    type="text"
                    value={bukuForm.isbn || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, isbn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="978-602-..."
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Buku *</label>
                <input
                  type="text"
                  required
                  value={bukuForm.judul || ''}
                  onChange={(e) => setBukuForm({ ...bukuForm, judul: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Judul lengkap buku"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pengarang</label>
                  <input
                    type="text"
                    value={bukuForm.pengarang || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, pengarang: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Nama pengarang"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Penerbit</label>
                  <input
                    type="text"
                    value={bukuForm.penerbit || ''}
                    onChange={(e) => setBukuForm({ ...bukuForm, penerbit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Nama penerbit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tahun</label>
                  <input
                    type="number"
                    value={bukuForm.tahunTerbit || 2023}
                    onChange={(e) => setBukuForm({ ...bukuForm, tahunTerbit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Eksemplar</label>
                  <input
                    type="number"
                    min="1"
                    value={bukuForm.jumlahEksemplar || 1}
                    onChange={(e) => setBukuForm({ ...bukuForm, jumlahEksemplar: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lokasi Rak</label>
                  <input
                    type="text"
                    value={bukuForm.rakLokasi || 'Rak A-01'}
                    onChange={(e) => setBukuForm({ ...bukuForm, rakLokasi: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kategori Buku</label>
                <select
                  value={bukuForm.kategori || 'Kurikulum Merdeka'}
                  onChange={(e) => setBukuForm({ ...bukuForm, kategori: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                  <option value="Buku Bacaan / Fiksi">Buku Bacaan / Fiksi</option>
                  <option value="Referensi & Kamus">Referensi & Kamus</option>
                  <option value="Sains & Teknologi">Sains & Teknologi</option>
                  <option value="Agama & Budi Pekerti">Agama & Budi Pekerti</option>
                  <option value="Muatan Lokal">Muatan Lokal</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sinopsis / Catatan Buku</label>
                <textarea
                  rows={2}
                  value={bukuForm.sinopsis || ''}
                  onChange={(e) => setBukuForm({ ...bukuForm, sinopsis: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Deskripsi singkat isi buku..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalBukuOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  Simpan Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL TRANSAKSI PEMINJAMAN BARU */}
      {/* ============================================================ */}
      {modalPinjamOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Form Peminjaman Buku Baru</h3>
              <button onClick={() => setModalPinjamOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePinjamSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Anggota Peminjam *</label>
                <select
                  required
                  value={pinjamForm.anggotaId}
                  onChange={(e) => setPinjamForm({ ...pinjamForm, anggotaId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {anggotaList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nomorAnggota} - {m.nama} ({m.kelasOrUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Judul Buku *</label>
                <select
                  required
                  value={pinjamForm.bukuId}
                  onChange={(e) => setPinjamForm({ ...pinjamForm, bukuId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {bukuList.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.kodeBuku}] {b.judul} (Tersedia: {b.jumlahTersedia})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Pinjam</label>
                  <input
                    type="date"
                    required
                    value={pinjamForm.tanggalPinjam}
                    onChange={(e) => setPinjamForm({ ...pinjamForm, tanggalPinjam: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Batas Kembali</label>
                  <input
                    type="date"
                    required
                    value={pinjamForm.batasKembali}
                    onChange={(e) => setPinjamForm({ ...pinjamForm, batasKembali: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keterangan / Keperluan</label>
                <input
                  type="text"
                  value={pinjamForm.keterangan}
                  onChange={(e) => setPinjamForm({ ...pinjamForm, keterangan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Contoh: Tugas mandiri Bahasa Indonesia"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalPinjamOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  Proses Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PRESENSI PENGUNJUNG CEPAT */}
      {/* ============================================================ */}
      {modalPengunjungOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Isi Buku Pengunjung Perpustakaan</h3>
              <button onClick={() => setModalPengunjungOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePengunjungSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Pengunjung *</label>
                <input
                  type="text"
                  required
                  value={pengunjungForm.nama}
                  onChange={(e) => setPengunjungForm({ ...pengunjungForm, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Ketik nama siswa atau guru"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipe Pengunjung</label>
                  <select
                    value={pengunjungForm.tipe}
                    onChange={(e) => setPengunjungForm({ ...pengunjungForm, tipe: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru / Tendik</option>
                    <option value="Tamu">Tamu / Wali Murid</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kelas / Unit</label>
                  <input
                    type="text"
                    value={pengunjungForm.kelasOrUnit}
                    onChange={(e) => setPengunjungForm({ ...pengunjungForm, kelasOrUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Contoh: Kelas 6A"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keperluan Kunjungan</label>
                <select
                  value={pengunjungForm.keperluan}
                  onChange={(e) => setPengunjungForm({ ...pengunjungForm, keperluan: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Membaca di Tempat">Membaca di Tempat</option>
                  <option value="Peminjaman / Pengembalian">Peminjaman / Pengembalian Buku</option>
                  <option value="Literasi Digital">Literasi Digital & Komputer</option>
                  <option value="Diskusi / Tugas Kelompok">Diskusi / Tugas Kelompok</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalPengunjungOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL ANGGOTA BARU / EDIT */}
      {/* ============================================================ */}
      {modalAnggotaOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingAnggota ? 'Edit Data Anggota' : 'Registrasi Anggota Baru'}
              </h3>
              <button onClick={() => setModalAnggotaOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAnggotaSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Anggota *</label>
                  <input
                    type="text"
                    required
                    value={anggotaForm.nomorAnggota || ''}
                    onChange={(e) => setAnggotaForm({ ...anggotaForm, nomorAnggota: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NISN / NIP *</label>
                  <input
                    type="text"
                    required
                    value={anggotaForm.nisnOrNip || ''}
                    onChange={(e) => setAnggotaForm({ ...anggotaForm, nisnOrNip: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={anggotaForm.nama || ''}
                  onChange={(e) => setAnggotaForm({ ...anggotaForm, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipe</label>
                  <select
                    value={anggotaForm.tipe || 'Siswa'}
                    onChange={(e) => setAnggotaForm({ ...anggotaForm, tipe: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kelas / Unit</label>
                  <input
                    type="text"
                    value={anggotaForm.kelasOrUnit || ''}
                    onChange={(e) => setAnggotaForm({ ...anggotaForm, kelasOrUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={anggotaForm.jenisKelamin || 'L'}
                    onChange={(e) => setAnggotaForm({ ...anggotaForm, jenisKelamin: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAnggotaOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak Kartu Perpustakaan */}
      {isCardModalOpen && (
        <CetakKartuPerpusModal
          anggotaList={anggotaList}
          selectedAnggotaId={selectedMemberForCard}
          profil={profil}
          onClose={() => setIsCardModalOpen(false)}
        />
      )}
    </div>
  );
};
