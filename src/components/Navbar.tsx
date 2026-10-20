import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Building2, 
  FileText, 
  Database,
  School,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { TabType, ProfilSekolah, AuthUser } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { ShieldCheck, LogIn, ChevronDown, Eye } from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  profil: ProfilSekolah;
  currentUser?: AuthUser;
  onUpdateProfil: (updated: ProfilSekolah) => void;
  onResetData: () => void;
  onOpenLoginModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profil,
  currentUser = { role: 'admin', name: 'Administrator' },
  onUpdateProfil,
  onResetData,
  onOpenLoginModal,
}) => {
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'kepegawaian', label: 'Kepegawaian', icon: <Users className="w-4 h-4" /> },
    { id: 'kesiswaan', label: 'Kesiswaan', icon: <GraduationCap className="w-4 h-4" />, badge: 'Rapor & BTQ' },
    { id: 'sarpras', label: 'Sarpras', icon: <Building2 className="w-4 h-4" /> },
    { id: 'keadministrasian', label: 'Keadministrasian', icon: <FileText className="w-4 h-4" />, badge: 'AI Persuratan' },
    { id: 'google_integration', label: 'Google Drive & Sheets', icon: <Database className="w-4 h-4" />, badge: 'GDrive Folder' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-white px-4 py-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 font-semibold border border-emerald-700">
              NPSN: {profil.npsn}
            </span>
            <span className="text-emerald-200 hidden md:inline">|</span>
            <span className="text-emerald-100 truncate">
              {profil.alamat}, Kec. {profil.kecamatan}, Kab. {profil.kabupaten}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-950/70 px-2.5 py-1 rounded-md border border-emerald-800">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Tahun Pelajaran:</span>
              <select
                value={profil.tahunPelajaranAktif}
                onChange={(e) => {
                  const tp = e.target.value;
                  const year = tp.split('/')[0];
                  onUpdateProfil({
                    ...profil,
                    tahunPelajaranAktif: tp,
                    tanggalAcuanUsia: `${year}-07-01`,
                  });
                }}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
              >
                <option value="2024/2025" className="text-slate-900">2024/2025 (Acuan: 1 Juli 2024)</option>
                <option value="2025/2026" className="text-slate-900">2025/2026 (Acuan: 1 Juli 2025)</option>
                <option value="2026/2027" className="text-slate-900">2026/2027 (Acuan: 1 Juli 2026)</option>
              </select>
            </div>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setShowResetConfirm(true)}
                title="Reset ke data awal"
                className="flex items-center gap-1 text-emerald-300 hover:text-white px-2 py-1 rounded hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs font-bold ring-2 ring-emerald-600/30">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  SIM SDN Kedungringin 1 Beji
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Akreditasi {profil.akreditasi.split(' ')[0]}
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Sistem Informasi Manajemen Sekolah Terpadu Google Workspace & Gemini AI
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* User Role & Login Switcher */}
            <div className="pl-2 border-l border-slate-200">
              <button
                onClick={onOpenLoginModal}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100 shadow-xs'
                    : currentUser.role === 'guru'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 shadow-xs'
                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 shadow-xs'
                }`}
                title="Ganti Mode Pengguna (Guest / Admin / Guru)"
              >
                {currentUser.role === 'admin' && (
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                )}
                {currentUser.role === 'guru' && (
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                )}
                {(currentUser.role === 'guest' || currentUser.role === 'siswa') && (
                  <Eye className="w-4 h-4 text-slate-600" />
                )}
                <span className="truncate max-w-[140px]">
                  {currentUser.role === 'admin'
                    ? 'Admin (Akses Penuh)'
                    : currentUser.role === 'guru'
                    ? currentUser.kelas
                      ? `Guru Kelas ${currentUser.kelas}`
                      : currentUser.name.split(',')[0].split(' ')[0]
                    : 'Guest (Info Umum)'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Data SIM SDN Kedungringin 1 Beji"
        message="Apakah Anda yakin ingin mereset seluruh data sistem (kepegawaian, kesiswaan, rapor, BTQ, sarpras, persuratan) kembali ke data default?"
        confirmText="Ya, Reset Data"
        cancelText="Batal"
        variant="warning"
        onConfirm={() => {
          setShowResetConfirm(false);
          onResetData();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </header>
  );
};
