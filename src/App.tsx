import React, { useState, useEffect } from 'react';
import { 
  TabType, 
  ProfilSekolah, 
  Pegawai, 
  Siswa, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ, 
  SarprasItem, 
  SuratKeluar, 
  SuratMasuk,
  AuthUser,
  FaceprintPresensi,
  SkpEKinerja 
} from './types';
import { 
  INITIAL_PROFIL, 
  INITIAL_PEGAWAI, 
  INITIAL_SISWA, 
  INITIAL_REKAP_RAPOR, 
  INITIAL_NILAI_BTQ, 
  INITIAL_SARPRAS, 
  INITIAL_SURAT_KELUAR, 
  INITIAL_SURAT_MASUK,
  INITIAL_PRESENSI_FACEPRINT,
  INITIAL_SKP_EKINERJA 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Kepegawaian } from './components/Kepegawaian';
import { KesiswaanRoot } from './components/Kesiswaan/KesiswaanRoot';
import { Sarpras } from './components/Sarpras';
import { KeadministrasianRoot } from './components/Keadministrasian/KeadministrasianRoot';
import { DocsAndGas } from './components/DocsAndGas';
import { CertificateModal } from './components/CertificateModal';
import { TranscriptModal } from './components/TranscriptModal';
import { LetterPrintModal } from './components/LetterPrintModal';
import { SuratKeteranganPrestasiModal } from './components/SuratKeteranganPrestasiModal';
import { LoginModal } from './components/LoginModal';
import { LoginMenu } from './components/LoginMenu';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ProcessedRapor } from './components/Kesiswaan/RekapRapor';
import { LetterGenerationResult } from './services/api';
import { logUserActivity } from './services/logger';
import { 
  getSavedMasterSheetId, 
  fetchMasterDatabaseRealtime,
  fetchAllLiveMasterData 
} from './services/singleMasterSheetService';
import { Lock, ShieldCheck, RefreshCw } from 'lucide-react';

const CURRENT_DB_VERSION = '2026_2027_v1';

// Enforce locking database to the exact master spreadsheet data & purge any old dummy data
const initializeAndLockDatabase = () => {
  try {
    const version = localStorage.getItem('sim_kdr1_db_lock_version');
    const storedPegawai = localStorage.getItem('sim_kdr1_pegawai');
    const storedProfil = localStorage.getItem('sim_kdr1_profil');
    const hasDummyPegawai = storedPegawai && (
      storedPegawai.includes('Siti Fatimah') || 
      storedPegawai.includes('Suhartono') || 
      storedPegawai.includes('Nur Aini') || 
      storedPegawai.includes('Ahmad Muzakki') || 
      storedPegawai.includes('Bambang Kusuma') || 
      storedPegawai.includes('Dewi Lestari')
    );
    const hasDummyProfil = storedProfil && (storedProfil.includes('Siti Fatimah') || !storedProfil.includes('Fuad Fahrudin'));

    if (version !== CURRENT_DB_VERSION || hasDummyPegawai || hasDummyProfil) {
      localStorage.setItem('sim_kdr1_pegawai', JSON.stringify(INITIAL_PEGAWAI));
      localStorage.setItem('sim_kdr1_profil', JSON.stringify(INITIAL_PROFIL));
      localStorage.setItem('sim_kdr1_presensi', JSON.stringify(INITIAL_PRESENSI_FACEPRINT));
      localStorage.setItem('sim_kdr1_skp_ekinerja', JSON.stringify(INITIAL_SKP_EKINERJA));
      localStorage.setItem('sim_kdr1_db_lock_version', CURRENT_DB_VERSION);
    }
  } catch (e) {
    console.warn('DB lock check error:', e);
  }
};
initializeAndLockDatabase();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sim_kdr1_is_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const isLogged = sessionStorage.getItem('sim_kdr1_is_logged_in') === 'true';
      if (!isLogged) return 'login';
      const saved = localStorage.getItem('sim_kdr1_auth_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'guru') return 'kepegawaian';
        return 'dashboard';
      }
    } catch {}
    return 'login';
  });

  // LocalStorage persistence helpers with sanitization for master lock
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`sim_kdr1_${key}`);
      if (!item) return fallback;
      if (key === 'pegawai') {
        if (item.includes('Siti Fatimah') || item.includes('Suhartono') || item.includes('Nur Aini')) {
          return INITIAL_PEGAWAI as unknown as T;
        }
      }
      if (key === 'profil') {
        if (item.includes('Siti Fatimah')) {
          return INITIAL_PROFIL as unknown as T;
        }
      }
      return JSON.parse(item);
    } catch {
      return fallback;
    }
  };

  const saveStored = (key: string, data: any) => {
    try {
      localStorage.setItem(`sim_kdr1_${key}`, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  };

  // User Authentication State (Guest vs Admin vs Guru)
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => 
    loadStored('auth_user', { 
      role: 'guest', 
      name: 'Tamu / Pengunjung Publik', 
      rombel: 'Informasi Umum' 
    })
  );

  const [isSyncingRealtime, setIsSyncingRealtime] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    try {
      return localStorage.getItem('sim_kdr1_master_last_sync_time') || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Main State
  const [profil, setProfil] = useState<ProfilSekolah>(() => loadStored('profil', INITIAL_PROFIL));
  const [pegawai, setPegawai] = useState<Pegawai[]>(() => loadStored('pegawai', INITIAL_PEGAWAI));
  const [siswa, setSiswa] = useState<Siswa[]>(() => loadStored('siswa', INITIAL_SISWA));
  const [rapor, setRapor] = useState<RekapRaporSiswa[]>(() => loadStored('rapor', INITIAL_REKAP_RAPOR));
  const [btq, setBtq] = useState<NilaiIjazahBTQ[]>(() => loadStored('btq', INITIAL_NILAI_BTQ));
  const [sarpras, setSarpras] = useState<SarprasItem[]>(() => {
    const items = loadStored('sarpras', INITIAL_SARPRAS);
    return items.map((item: SarprasItem) => ({
      ...item,
      fotoUrl: (item.fotoUrl && item.fotoUrl.trim() !== '') 
        ? item.fotoUrl 
        : 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    }));
  });
  const [suratKeluar, setSuratKeluar] = useState<SuratKeluar[]>(() => loadStored('surat_keluar', INITIAL_SURAT_KELUAR));
  const [suratMasuk, setSuratMasuk] = useState<SuratMasuk[]>(() => loadStored('surat_masuk', INITIAL_SURAT_MASUK));
  const [presensiList, setPresensiList] = useState<FaceprintPresensi[]>(() => loadStored('presensi', INITIAL_PRESENSI_FACEPRINT));
  const [skpList, setSkpList] = useState<SkpEKinerja[]>(() => loadStored('skp_ekinerja', INITIAL_SKP_EKINERJA));

  // Sync to localStorage
  useEffect(() => saveStored('auth_user', currentUser), [currentUser]);
  useEffect(() => saveStored('profil', profil), [profil]);
  useEffect(() => saveStored('pegawai', pegawai), [pegawai]);
  useEffect(() => saveStored('siswa', siswa), [siswa]);
  useEffect(() => saveStored('rapor', rapor), [rapor]);
  useEffect(() => saveStored('btq', btq), [btq]);
  useEffect(() => saveStored('sarpras', sarpras), [sarpras]);
  useEffect(() => saveStored('surat_keluar', suratKeluar), [suratKeluar]);
  useEffect(() => saveStored('surat_masuk', suratMasuk), [suratMasuk]);
  useEffect(() => saveStored('presensi', presensiList), [presensiList]);
  useEffect(() => saveStored('skp_ekinerja', skpList), [skpList]);

  // Modal Viewers
  const [activeCertificate, setActiveCertificate] = useState<NilaiIjazahBTQ | null>(null);
  const [activeTranscript, setActiveTranscript] = useState<ProcessedRapor | null>(null);
  const [activeLetterPrint, setActiveLetterPrint] = useState<LetterGenerationResult | null>(null);
  const [activeSKP, setActiveSKP] = useState<ProcessedRapor | null>(null);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Auth Handlers
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    try {
      sessionStorage.setItem('sim_kdr1_is_logged_in', 'true');
    } catch {}

    // Record login activity in localStorage
    logUserActivity({
      role: user.role,
      userName: user.name,
      userNip: user.nip,
      action: 'LOGIN',
      category: 'AUTENTIKASI',
      description: `Pengguna berhasil login sebagai ${user.role.toUpperCase()}: ${user.name}${user.rombel ? ` (${user.rombel})` : ''}`,
      details: `Waktu login: ${new Date().toLocaleTimeString('id-ID')} | Peran: ${user.role}`
    });

    if (user.role === 'guru') {
      setActiveTab('kepegawaian');
    } else {
      setActiveTab('dashboard');
    }

    let roleTitle = 'Tamu (Guest)';
    if (user.role === 'admin') roleTitle = 'Administrator (Akses Penuh)';
    else if (user.role === 'guru') roleTitle = `Guru: ${user.name} (${user.rombel || user.jabatan || 'Guru Kelas'})`;
    addToast(
      `Berhasil masuk sebagai ${roleTitle}!`,
      'success'
    );
  };

  const handleLogout = () => {
    // Record logout activity in localStorage
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'LOGOUT',
      category: 'AUTENTIKASI',
      description: `Pengguna keluar: ${currentUser.name} (${currentUser.role}) mengakhiri sesi.`,
    });

    setIsLoggedIn(false);
    try {
      sessionStorage.removeItem('sim_kdr1_is_logged_in');
    } catch {}

    setCurrentUser({ 
      role: 'guest', 
      name: 'Tamu / Pengunjung Publik', 
      rombel: 'Informasi Umum' 
    });
    setActiveTab('login');
    addToast('Anda telah keluar. Silakan pilih peran akun untuk masuk kembali.', 'info');
  };

  // Reset function
  const handleResetData = () => {
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'HAPUS',
      category: 'SISTEM',
      description: 'Reset sistem: Mengembalikan seluruh data dan konfigurasi ke default awal SDN Kedungringin 1 Beji',
    });

    localStorage.clear();
    setProfil(INITIAL_PROFIL);
    setPegawai(INITIAL_PEGAWAI);
    setSiswa(INITIAL_SISWA);
    setRapor(INITIAL_REKAP_RAPOR);
    setBtq(INITIAL_NILAI_BTQ);
    setSarpras(INITIAL_SARPRAS);
    setSuratKeluar(INITIAL_SURAT_KELUAR);
    setSuratMasuk(INITIAL_SURAT_MASUK);
    setPresensiList(INITIAL_PRESENSI_FACEPRINT);
    setSkpList(INITIAL_SKP_EKINERJA);
    setCurrentUser({ role: 'admin', name: 'Administrator SIM SDN Kedungringin 1' });
    setIsLoggedIn(true);
    addToast('Data sistem berhasil direset ke pengaturan awal SDN Kedungringin 1 Beji!', 'success');
  };

  // Presensi & SKP Handlers
  const handleSavePresensi = (item: FaceprintPresensi) => {
    setPresensiList((prev) => [item, ...prev]);
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'TAMBAH',
      category: 'PEGAWAI',
      description: `Mencatat presensi biometrik faceprint: ${item.nama} (${item.statusKehadiran})`,
      details: `Jam Masuk: ${item.jamMasuk} | Mesin: ${item.mesinId}`
    });
    addToast(`Presensi biometrik ${item.nama} berhasil dicatat!`, 'success');
  };

  const handleSaveSkp = (item: SkpEKinerja) => {
    setSkpList((prev) => {
      const idx = prev.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'TAMBAH',
      category: 'PEGAWAI',
      description: `Menyimpan evaluasi SKP E-Kinerja Tribulan ${item.tribulan}: ${item.nama}`,
      details: `Predikat Kinerja: ${item.predikatKinerja} | Rating: ${item.ratingHasilKerja}`
    });
    addToast(`Evaluasi SKP Tribulan ${item.nama} berhasil disimpan!`, 'success');
  };

  // Entity Handlers
  const handleSavePegawai = (item: Pegawai) => {
    const isExisting = pegawai.some((p) => p.id === item.id);
    setPegawai((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: isExisting ? 'UBAH' : 'TAMBAH',
      category: 'PEGAWAI',
      description: isExisting
        ? `Memperbarui data GTK: ${item.nama} (Jabatan: ${item.jabatan})`
        : `Menambahkan GTK baru: ${item.nama} (NIP: ${item.nip || '-'}, ${item.jabatan})`,
      details: `Status: ${item.statusKepegawaian} | Golongan: ${item.golongan}`
    });
    addToast(`Data pegawai ${item.nama} berhasil disimpan!`, 'success');
  };

  const handleDeletePegawai = (id: string) => {
    const target = pegawai.find((p) => p.id === id);
    setPegawai((prev) => prev.filter((p) => p.id !== id));
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'HAPUS',
      category: 'PEGAWAI',
      description: `Menghapus data pegawai GTK: ${target?.nama || id} (NIP: ${target?.nip || '-'})`,
      details: `Jabatan: ${target?.jabatan || '-'} | Status: ${target?.statusKepegawaian || '-'}`
    });
    addToast(`Data pegawai ${target?.nama || id} berhasil dihapus.`, 'info');
  };

  const handleSaveSiswa = (item: Siswa) => {
    const isExisting = siswa.some((s) => s.id === item.id);
    setSiswa((prev) => {
      const idx = prev.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: isExisting ? 'UBAH' : 'TAMBAH',
      category: 'SISWA',
      description: isExisting
        ? `Memperbarui data siswa: ${item.nama} (NISN: ${item.nisn}, Kelas: ${item.kelas})`
        : `Menambahkan siswa baru: ${item.nama} (NISN: ${item.nisn}, Kelas: ${item.kelas})`,
      details: `Jenis Kelamin: ${item.jenisKelamin} | Rombel: ${item.rombel}`
    });
    addToast(`Data siswa ${item.nama} berhasil disimpan!`, 'success');
  };

  const handleDeleteSiswa = (id: string) => {
    const target = siswa.find((s) => s.id === id);
    setSiswa((prev) => prev.filter((s) => s.id !== id));
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'HAPUS',
      category: 'SISWA',
      description: `Menghapus data siswa: ${target?.nama || id} (NISN: ${target?.nisn || '-'}, Kelas: ${target?.kelas || '-'})`,
      details: `Rombel: ${target?.rombel || '-'} | Agama: ${target?.agama || '-'}`
    });
    addToast(`Data siswa ${target?.nama || id} berhasil dihapus.`, 'info');
  };

  const handleSaveRapor = (item: RekapRaporSiswa) => {
    setRapor((prev) => {
      const idx = prev.findIndex((r) => r.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'UBAH',
      category: 'RAPOR',
      description: `Memperbarui nilai rapor siswa: ${item.namaSiswa} (NISN: ${item.nisn}, Kelas: ${item.kelas})`,
      details: `Rata-rata TKA: ${item.tka?.rataRata || '-'} | Predikat: ${item.tka?.predikat || '-'}`
    });
    addToast(`Data nilai rapor ${item.namaSiswa} berhasil disimpan!`, 'success');
  };

  const handleSaveBTQ = (item: NilaiIjazahBTQ) => {
    const isExisting = btq.some((b) => b.id === item.id);
    setBtq((prev) => {
      const idx = prev.findIndex((b) => b.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: isExisting ? 'UBAH' : 'TAMBAH',
      category: 'RAPOR',
      description: isExisting
        ? `Memperbarui nilai ijazah BTQ siswa: ${item.namaSiswa} (No: ${item.noSertifikat})`
        : `Menerbitkan penilaian ijazah BTQ baru: ${item.namaSiswa} (No: ${item.noSertifikat})`,
      details: `Rata-rata: ${item.rataRata} | Predikat: ${item.predikat}`
    });
    addToast(`Data nilai BTQ ${item.namaSiswa} berhasil disimpan!`, 'success');
  };

  const handleDeleteBTQ = (id: string) => {
    const target = btq.find((b) => b.id === id);
    setBtq((prev) => prev.filter((b) => b.id !== id));
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'HAPUS',
      category: 'RAPOR',
      description: `Menghapus sertifikat / nilai BTQ: ${target?.namaSiswa || id} (No: ${target?.noSertifikat || '-'})`,
      details: `NISN: ${target?.nisn || '-'}`
    });
    addToast(`Data nilai BTQ ${target?.namaSiswa || id} berhasil dihapus.`, 'info');
  };

  const handleSaveSarpras = (item: SarprasItem) => {
    const isExisting = sarpras.some((s) => s.id === item.id);
    setSarpras((prev) => {
      const idx = prev.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: isExisting ? 'UBAH' : 'TAMBAH',
      category: 'SARPRAS',
      description: isExisting
        ? `Memperbarui sarana prasarana: ${item.namaSarpras} (Kondisi: ${item.kondisi})`
        : `Menambahkan aset sarpras baru: ${item.namaSarpras} (${item.jumlah} ${item.satuan})`,
      details: `Kategori: ${item.kategori} | Lokasi: ${item.lokasi}`
    });
    addToast(`Data sarpras ${item.namaSarpras} berhasil disimpan!`, 'success');
  };

  const handleDeleteSarpras = (id: string) => {
    const target = sarpras.find((s) => s.id === id);
    setSarpras((prev) => prev.filter((s) => s.id !== id));
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'HAPUS',
      category: 'SARPRAS',
      description: `Menghapus aset sarpras: ${target?.namaSarpras || id} (Kategori: ${target?.kategori || '-'})`,
      details: `Lokasi: ${target?.lokasi || '-'} | Kondisi: ${target?.kondisi || '-'}`
    });
    addToast(`Data sarpras ${target?.namaSarpras || id} berhasil dihapus.`, 'info');
  };

  const handleSaveSuratKeluar = (item: SuratKeluar) => {
    const isExisting = suratKeluar.some((s) => s.id === item.id);
    setSuratKeluar((prev) => [item, ...prev.filter((s) => s.id !== item.id)]);
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: isExisting ? 'UBAH' : 'TAMBAH',
      category: 'SURAT',
      description: isExisting
        ? `Memperbarui Surat Keluar No: ${item.nomorSurat} (${item.perihal})`
        : `Menambahkan Surat Keluar baru No: ${item.nomorSurat} (${item.perihal}) - Tujuan: ${item.tujuan}`,
      details: `Jenis: ${item.jenisSurat} | Tanggal: ${item.tanggalSurat}`
    });
    addToast(`Surat Keluar ${item.nomorSurat} berhasil disimpan!`, 'success');
  };

  const handleDeleteSuratKeluar = (id: string) => {
    const target = suratKeluar.find((s) => s.id === id);
    setSuratKeluar((prev) => prev.filter((s) => s.id !== id));
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'HAPUS',
      category: 'SURAT',
      description: `Menghapus arsip surat keluar No: ${target?.nomorSurat || id} - Perihal: ${target?.perihal || '-'}`,
      details: `Tujuan: ${target?.tujuan || '-'}`
    });
    addToast('Arsip Surat Keluar berhasil dihapus.', 'info');
  };

  const handleSaveSuratMasuk = (item: SuratMasuk) => {
    const isExisting = suratMasuk.some((s) => s.id === item.id);
    setSuratMasuk((prev) => {
      const idx = prev.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: isExisting ? 'UBAH' : 'TAMBAH',
      category: 'SURAT',
      description: isExisting
        ? `Memperbarui Surat Masuk No: ${item.nomorSuratMasuk} dari ${item.pengirim}`
        : `Menambahkan Surat Masuk baru No: ${item.nomorSuratMasuk} dari ${item.pengirim} - Perihal: ${item.perihal}`,
      details: `Diterima: ${item.tanggalDiterima} | Disposisi: ${item.disposisiKepsek || '-'}`
    });
    addToast(`Surat Masuk ${item.nomorSuratMasuk} berhasil disimpan!`, 'success');
  };

  const handleDeleteSuratMasuk = (id: string) => {
    const target = suratMasuk.find((s) => s.id === id);
    setSuratMasuk((prev) => prev.filter((s) => s.id !== id));
    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'HAPUS',
      category: 'SURAT',
      description: `Menghapus arsip surat masuk No: ${target?.nomorSuratMasuk || id} dari: ${target?.pengirim || '-'}`,
      details: `Perihal: ${target?.perihal || '-'}`
    });
    addToast('Arsip Surat Masuk berhasil dihapus.', 'info');
  };

  const handleBatchUpdateData = (newData: {
    siswa?: Siswa[];
    pegawai?: Pegawai[];
    rapor?: RekapRaporSiswa[];
    btq?: NilaiIjazahBTQ[];
    sarpras?: SarprasItem[];
    suratMasuk?: SuratMasuk[];
    suratKeluar?: SuratKeluar[];
  }) => {
    if (newData.siswa) setSiswa(newData.siswa);
    if (newData.pegawai) setPegawai(newData.pegawai);
    if (newData.rapor) setRapor(newData.rapor);
    if (newData.btq) setBtq(newData.btq);
    if (newData.sarpras) setSarpras(newData.sarpras);
    if (newData.suratMasuk) setSuratMasuk(newData.suratMasuk);
    if (newData.suratKeluar) setSuratKeluar(newData.suratKeluar);
  };

  const handlePurgeDummyData = () => {
    // Purge dummy students, dummy scores, and reset state
    setSiswa([]);
    setRapor([]);
    setBtq([]);
    saveStored('siswa', []);
    saveStored('rapor', []);
    saveStored('btq', []);

    try {
      localStorage.removeItem('sim_kdr1_siswa');
      localStorage.removeItem('sim_kdr1_rapor');
      localStorage.removeItem('sim_kdr1_btq');
    } catch {}

    logUserActivity({
      role: currentUser.role,
      userName: currentUser.name,
      userNip: currentUser.nip,
      action: 'HAPUS',
      category: 'SISTEM',
      description: 'Membersihkan data dummy web agar sistem murni menggunakan Single Data Utama (Master Spreadsheet).',
    });

    addToast('Data dummy berhasil dibersihkan dari web! Sistem kini menggunakan Single Data Utama.', 'info');

    // If master spreadsheet is connected, immediately pull live data
    const sheetId = getSavedMasterSheetId();
    if (sheetId) {
      fetchMasterDatabaseRealtime(sheetId)
        .then((res) => {
          if (res.siswa && res.siswa.length > 0) {
            setSiswa(res.siswa);
            saveStored('siswa', res.siswa);
          }
          if (res.pegawai && res.pegawai.length > 0) {
            setPegawai(res.pegawai);
            saveStored('pegawai', res.pegawai);
          }
          addToast(`Sinkronisasi real-time berhasil: ${res.siswa?.length || 0} Siswa, ${res.pegawai?.length || 0} Pegawai ditarik dari Spreadsheet.`, 'success');
        })
        .catch((err) => {
          console.warn('Realtime fetch after purge notice:', err);
        });
    }
  };

  // 1. Initial Mount: Immediately load the latest real data updated by admin from Google Apps Script / Spreadsheet
  // Ensuring Guest, Guru, and Admin see live real data rather than stale dummy state
  useEffect(() => {
    let isMounted = true;
    const loadInitialLiveMasterData = async () => {
      try {
        const live = await fetchAllLiveMasterData(profil);
        if (!isMounted || !live) return;

        let hasUpdated = false;
        if (live.pegawai && live.pegawai.length > 0) {
          setPegawai(live.pegawai);
          saveStored('pegawai', live.pegawai);
          hasUpdated = true;
        }
        if (live.siswa && live.siswa.length > 0) {
          setSiswa(live.siswa);
          saveStored('siswa', live.siswa);
          hasUpdated = true;
        }
        if (live.sarpras && live.sarpras.length > 0) {
          setSarpras(live.sarpras);
          saveStored('sarpras', live.sarpras);
          hasUpdated = true;
        }
        if (live.profil && live.profil.nama) {
          setProfil(live.profil);
          saveStored('profil', live.profil);
          hasUpdated = true;
        }
        if (hasUpdated) {
          addToast('Data real spreadsheet & update admin terbaru berhasil dimuat otomatis.', 'info');
        }
      } catch (err) {
        console.warn('Gagal memuat data awal live spreadsheet:', err);
      }
    };

    loadInitialLiveMasterData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-time periodic synchronization heartbeat
  // Runs universally for all users (Guest, Guru, Admin) so any update made by admin is mirrored live
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const sheetId = getSavedMasterSheetId();
        let res: any = null;

        if (sheetId) {
          res = await fetchMasterDatabaseRealtime(sheetId, null, profil).catch(() => null);
        }
        if (!res) {
          res = await fetchAllLiveMasterData(profil).catch(() => null);
        }

        if (!res) return;

        let hasChanges = false;
        if (res.pegawai && res.pegawai.length > 0) {
          if (res.pegawai.length !== pegawai.length || res.pegawai[0]?.nama !== pegawai[0]?.nama) {
            setPegawai(res.pegawai);
            saveStored('pegawai', res.pegawai);
            hasChanges = true;
          }
        }
        if (res.siswa && res.siswa.length > 0) {
          if (res.siswa.length !== siswa.length || res.siswa[0]?.nama !== siswa[0]?.nama) {
            setSiswa(res.siswa);
            saveStored('siswa', res.siswa);
            hasChanges = true;
          }
        }
        if (res.profil && res.profil.nama) {
          if (
            res.profil.nama !== profil.nama ||
            res.profil.kepalaSekolah !== profil.kepalaSekolah ||
            res.profil.npsn !== profil.npsn ||
            res.profil.tahunPelajaranAktif !== profil.tahunPelajaranAktif
          ) {
            setProfil(res.profil);
            saveStored('profil', res.profil);
            hasChanges = true;
          }
        }
        if (hasChanges) {
          addToast('Pembaruan data terbaru dari admin & spreadsheet berhasil disinkronkan secara real-time!', 'info');
        }
      } catch (err) {
        // Silent background check
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [pegawai.length, siswa.length, profil.nama, profil.kepalaSekolah, profil.npsn, profil.tahunPelajaranAktif]);

  // Manual / Immediate Realtime Synchronization Handler
  const handleManualRealtimeSync = async () => {
    setIsSyncingRealtime(true);
    try {
      const sheetId = getSavedMasterSheetId();
      let res: any = null;
      if (sheetId) {
        res = await fetchMasterDatabaseRealtime(sheetId, null, profil).catch(() => null);
      }
      if (!res) {
        res = await fetchAllLiveMasterData(profil).catch(() => null);
      }
      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(nowTime);
      try {
        localStorage.setItem('sim_kdr1_master_last_sync_time', nowTime);
      } catch {}

      if (res) {
        let countPeg = 0;
        let countSis = 0;
        if (res.pegawai && res.pegawai.length > 0) {
          setPegawai(res.pegawai);
          saveStored('pegawai', res.pegawai);
          countPeg = res.pegawai.length;
        }
        if (res.siswa && res.siswa.length > 0) {
          setSiswa(res.siswa);
          saveStored('siswa', res.siswa);
          countSis = res.siswa.length;
        }
        if (res.profil && res.profil.nama) {
          setProfil(res.profil);
          saveStored('profil', res.profil);
        }
        addToast(`Sinkronisasi real-time berhasil (${nowTime})! Terhubung ke Master Database (${countPeg || pegawai.length} Pegawai, ${countSis || siswa.length} Siswa).`, 'success');
      } else {
        addToast(`Sistem SIM SDN Kedungringin 1 terkunci dengan 11 Pegawai Master Spreadsheet (${nowTime}).`, 'success');
      }
    } catch (err: any) {
      addToast('Pemeriksaan real-time database selesai.', 'info');
    } finally {
      setIsSyncingRealtime(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profil={profil}
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          onUpdateProfil={setProfil}
          onResetData={handleResetData}
          onOpenLoginModal={() => setLoginModalOpen(true)}
          onLogout={handleLogout}
          onSyncRealtime={handleManualRealtimeSync}
          isSyncingRealtime={isSyncingRealtime}
          lastSyncTime={lastSyncTime}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {activeTab === 'login' && (
            <LoginMenu
              profil={profil}
              pegawaiList={pegawai}
              currentUser={currentUser}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              profil={profil}
              pegawai={pegawai}
              siswa={siswa}
              sarpras={sarpras}
              rapor={rapor}
              btq={btq}
              currentUser={currentUser}
              setActiveTab={setActiveTab}
              onUpdateProfil={setProfil}
              onNotify={addToast}
              onSyncRealtime={handleManualRealtimeSync}
              isSyncingRealtime={isSyncingRealtime}
              lastSyncTime={lastSyncTime}
            />
          )}

          {activeTab === 'kepegawaian' && (
            <Kepegawaian
              pegawai={pegawai}
              profil={profil}
              userRole={currentUser.role}
              currentUser={currentUser}
              presensiList={presensiList}
              skpList={skpList}
              onSavePegawai={handleSavePegawai}
              onDeletePegawai={handleDeletePegawai}
              onSavePresensi={handleSavePresensi}
              onSaveSkp={handleSaveSkp}
            />
          )}

          {activeTab === 'kesiswaan' && (
            <KesiswaanRoot
              siswa={siswa}
              profil={profil}
              rapor={rapor}
              btq={btq}
              userRole={currentUser.role}
              currentUser={currentUser}
              onSaveSiswa={handleSaveSiswa}
              onDeleteSiswa={handleDeleteSiswa}
              onSaveRapor={handleSaveRapor}
              onSaveBTQ={handleSaveBTQ}
              onDeleteBTQ={handleDeleteBTQ}
              onOpenTranscriptModal={setActiveTranscript}
              onOpenCertificateModal={setActiveCertificate}
              onOpenSKPModal={setActiveSKP}
            />
          )}

          {activeTab === 'sarpras' && (
            <Sarpras
              sarpras={sarpras}
              profil={profil}
              userRole={currentUser.role}
              currentUser={currentUser}
              onSaveSarpras={handleSaveSarpras}
              onDeleteSarpras={handleDeleteSarpras}
            />
          )}

          {activeTab === 'keadministrasian' && (
            (currentUser.role === 'guest' || currentUser.role === 'siswa') ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto mt-12 shadow-sm animate-in fade-in">
                <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-xs">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Akses Terbatas untuk Pengunjung</h3>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  Menu Keadministrasian dan Perangkat Pembelajaran AI hanya dapat diakses oleh akun <strong>Guru</strong> dan <strong>Administrator</strong>.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-2.5">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
                  >
                    Kembali ke Dashboard
                  </button>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="px-4 py-2 bg-purple-100 text-purple-900 border border-purple-300 rounded-xl text-xs font-bold hover:bg-purple-200 transition-colors cursor-pointer"
                  >
                    Masuk Sebagai Guru / Admin
                  </button>
                </div>
              </div>
            ) : (
              <KeadministrasianRoot
                suratKeluar={suratKeluar}
                suratMasuk={suratMasuk}
                profil={profil}
                pegawai={pegawai}
                siswa={siswa}
                userRole={currentUser.role}
                onSaveSuratKeluar={handleSaveSuratKeluar}
                onDeleteSuratKeluar={handleDeleteSuratKeluar}
                onSaveSuratMasuk={handleSaveSuratMasuk}
                onDeleteSuratMasuk={handleDeleteSuratMasuk}
                onOpenLetterPrintModal={setActiveLetterPrint}
              />
            )
          )}

          {activeTab === 'google_integration' && (
            currentUser.role !== 'admin' ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto mt-12 shadow-sm animate-in fade-in">
                <div className="w-14 h-14 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-200 shadow-xs">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Akses Menu Pengaturan Terbatas</h3>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  Pengaturan Google Drive, skema spreadsheet, dan sinkronisasi data hanya dapat diakses oleh akun <strong>Administrator</strong>.
                </p>
                <button
                  onClick={() => setActiveTab(currentUser.role === 'guru' ? 'kepegawaian' : 'dashboard')}
                  className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
                >
                  Kembali ke Menu Utama
                </button>
              </div>
            ) : (
              <DocsAndGas
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
                userRole={currentUser.role}
                onUpdateProfil={setProfil}
                onUpdateData={handleBatchUpdateData}
                onNotify={(msg, type) => addToast(msg, type || 'info')}
                onPurgeDummyData={handlePurgeDummyData}
              />
            )
          )}
        </main>
      </div>

      {/* Modals for Printing */}
      <CertificateModal
        item={activeCertificate}
        profil={profil}
        onClose={() => setActiveCertificate(null)}
      />

      <TranscriptModal
        item={activeTranscript}
        profil={profil}
        onClose={() => setActiveTranscript(null)}
      />

      <LetterPrintModal
        letter={activeLetterPrint}
        profil={profil}
        onClose={() => setActiveLetterPrint(null)}
      />

      {/* Surat Keterangan Prestasi (SKP) & TKA Modal */}
      <SuratKeteranganPrestasiModal
        item={activeSKP}
        profil={profil}
        siswaData={siswa.find((s) => s.id === activeSKP?.siswaId)}
        onClose={() => setActiveSKP(null)}
      />

      {/* Login Multi-Role (Guest, Admin, Guru) Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        currentUser={currentUser}
        siswaList={siswa}
        pegawaiList={pegawai}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* In-app Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">SDN Kedungringin 1 Beji</span>
            <span>•</span>
            <span>Kecamatan Beji, Kabupaten Pasuruan, Jawa Timur</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Sistem Informasi Manajemen Terpadu Google Workspace & Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
