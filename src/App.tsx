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
import { ToastContainer, ToastMessage } from './components/Toast';
import { ProcessedRapor } from './components/Kesiswaan/RekapRapor';
import { LetterGenerationResult } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // LocalStorage persistence helpers
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`sim_kdr1_${key}`);
      return item ? JSON.parse(item) : fallback;
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
      role: 'admin', 
      name: 'Administrator SIM SDN Kedungringin 1',
      rombel: 'Semua Rombongan Belajar (Akses Penuh)'
    })
  );
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Main State
  const [profil, setProfil] = useState<ProfilSekolah>(() => loadStored('profil', INITIAL_PROFIL));
  const [pegawai, setPegawai] = useState<Pegawai[]>(() => loadStored('pegawai', INITIAL_PEGAWAI));
  const [siswa, setSiswa] = useState<Siswa[]>(() => loadStored('siswa', INITIAL_SISWA));
  const [rapor, setRapor] = useState<RekapRaporSiswa[]>(() => loadStored('rapor', INITIAL_REKAP_RAPOR));
  const [btq, setBtq] = useState<NilaiIjazahBTQ[]>(() => loadStored('btq', INITIAL_NILAI_BTQ));
  const [sarpras, setSarpras] = useState<SarprasItem[]>(() => loadStored('sarpras', INITIAL_SARPRAS));
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
    let roleTitle = 'Tamu (Guest)';
    if (user.role === 'admin') roleTitle = 'Administrator (Akses Penuh)';
    else if (user.role === 'guru') roleTitle = `Guru: ${user.name} (${user.rombel || user.jabatan})`;
    addToast(
      `Berhasil masuk sebagai ${roleTitle}!`,
      'success'
    );
  };

  const handleLogout = () => {
    setCurrentUser({ 
      role: 'guest', 
      name: 'Tamu / Pengunjung Publik', 
      rombel: 'Informasi Umum' 
    });
    addToast('Anda telah keluar dan beralih ke Mode Guest (Hanya Lihat Informasi).', 'info');
  };

  // Reset function
  const handleResetData = () => {
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
    setCurrentUser({ role: 'admin', name: 'Administrator' });
    addToast('Data sistem berhasil direset ke pengaturan awal SDN Kedungringin 1 Beji!', 'success');
  };

  // Presensi & SKP Handlers
  const handleSavePresensi = (item: FaceprintPresensi) => {
    setPresensiList((prev) => [item, ...prev]);
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
    addToast(`Evaluasi SKP Tribulan ${item.nama} berhasil disimpan!`, 'success');
  };

  // Entity Handlers
  const handleSavePegawai = (item: Pegawai) => {
    setPegawai((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
  };

  const handleDeletePegawai = (id: string) => {
    setPegawai((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveSiswa = (item: Siswa) => {
    setSiswa((prev) => {
      const idx = prev.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
  };

  const handleDeleteSiswa = (id: string) => {
    setSiswa((prev) => prev.filter((s) => s.id !== id));
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
  };

  const handleSaveBTQ = (item: NilaiIjazahBTQ) => {
    setBtq((prev) => {
      const idx = prev.findIndex((b) => b.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
  };

  const handleDeleteBTQ = (id: string) => {
    setBtq((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSaveSarpras = (item: SarprasItem) => {
    setSarpras((prev) => {
      const idx = prev.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
  };

  const handleDeleteSarpras = (id: string) => {
    setSarpras((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveSuratKeluar = (item: SuratKeluar) => {
    setSuratKeluar((prev) => [item, ...prev]);
  };

  const handleDeleteSuratKeluar = (id: string) => {
    setSuratKeluar((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveSuratMasuk = (item: SuratMasuk) => {
    setSuratMasuk((prev) => {
      const idx = prev.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
  };

  const handleDeleteSuratMasuk = (id: string) => {
    setSuratMasuk((prev) => prev.filter((s) => s.id !== id));
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
          onUpdateProfil={setProfil}
          onResetData={handleResetData}
          onOpenLoginModal={() => setLoginModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
            <KeadministrasianRoot
              suratKeluar={suratKeluar}
              suratMasuk={suratMasuk}
              profil={profil}
              pegawai={pegawai}
              siswa={siswa}
              onSaveSuratKeluar={handleSaveSuratKeluar}
              onDeleteSuratKeluar={handleDeleteSuratKeluar}
              onSaveSuratMasuk={handleSaveSuratMasuk}
              onDeleteSuratMasuk={handleDeleteSuratMasuk}
              onOpenLetterPrintModal={setActiveLetterPrint}
            />
          )}

          {activeTab === 'google_integration' && (
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
            />
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
