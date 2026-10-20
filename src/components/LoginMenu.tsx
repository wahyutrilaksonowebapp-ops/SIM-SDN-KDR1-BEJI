import React, { useState } from 'react';
import { Pegawai, ProfilSekolah, AuthUser, UserRole, TabType } from '../types';
import { 
  ShieldCheck, 
  GraduationCap, 
  Lock, 
  User, 
  AlertCircle,
  School,
  Eye,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  KeyRound,
  LogOut,
  Building2,
  Users
} from 'lucide-react';

interface LoginMenuProps {
  profil: ProfilSekolah;
  pegawaiList: Pegawai[];
  currentUser: AuthUser;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  onNavigate: (tab: TabType) => void;
}

export const LoginMenu: React.FC<LoginMenuProps> = ({
  profil,
  pegawaiList,
  currentUser,
  onLogin,
  onLogout,
  onNavigate,
}) => {
  const [selectedRole, setSelectedRole] = useState<'guest' | 'admin' | 'guru'>(() => {
    if (currentUser.role === 'guru') return 'guru';
    if (currentUser.role === 'guest') return 'guest';
    return 'admin';
  });

  // Admin credentials state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Guru credentials state
  const [guruNip, setGuruNip] = useState('');
  const [guruPassword, setGuruPassword] = useState('');

  // Error & Feedback state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to normalize strings for comparison (remove spaces, dots, dashes)
  const normalizeCode = (val: string) => val.replace(/[\s\-\.]/g, '').toLowerCase().trim();

  // 1. Guest Login (No password required)
  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      role: 'guest',
      name: 'Tamu / Pengunjung Publik',
      rombel: 'Informasi Umum',
    });
    setErrorMessage(null);
    onNavigate('dashboard');
  };

  // 2. Admin Login (Username: Admin, Password: 20519482)
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = adminUsername.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Username dan kata sandi Administrator wajib diisi.');
      return;
    }

    if (cleanUser === 'admin' && cleanPass === '20519482') {
      onLogin({
        role: 'admin',
        name: 'Administrator SIM SDN Kedungringin 1',
        rombel: 'Semua Rombongan Belajar (Akses Penuh)',
      });
      setErrorMessage(null);
      setAdminPassword('');
      onNavigate('dashboard');
    } else {
      setErrorMessage('Username atau kata sandi Administrator tidak sesuai.');
    }
  };

  // 3. Guru Login (Username: NIP, Password: 20519482)
  const handleGuruSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNip = normalizeCode(guruNip);
    const cleanPass = guruPassword.trim();

    if (!cleanNip || !cleanPass) {
      setErrorMessage('NIP dan kata sandi Guru wajib diisi.');
      return;
    }

    if (cleanPass !== '20519482') {
      setErrorMessage('Kata sandi Guru tidak valid. Silakan periksa kembali.');
      return;
    }

    // Find teacher by normalized NIP
    const foundTeacher = pegawaiList.find((p) => {
      const pNip = normalizeCode(p.nip);
      return pNip === cleanNip;
    });

    if (!foundTeacher) {
      setErrorMessage(
        'NIP tidak terdaftar pada direktori kepegawaian SDN Kedungringin 1 Beji. Silakan periksa kembali NIP Anda.'
      );
      return;
    }

    // Determine assigned class / rombel based on teacher's jabatan
    let assignedKelas: number | undefined;
    let rombelLabel = foundTeacher.jabatan || 'Guru SDN Kedungringin 1';

    const jabatanUpper = foundTeacher.jabatan.toUpperCase();
    if (jabatanUpper.includes('KELAS 1')) assignedKelas = 1;
    else if (jabatanUpper.includes('KELAS 2')) assignedKelas = 2;
    else if (jabatanUpper.includes('KELAS 3')) assignedKelas = 3;
    else if (jabatanUpper.includes('KELAS 4')) assignedKelas = 4;
    else if (jabatanUpper.includes('KELAS 5')) assignedKelas = 5;
    else if (jabatanUpper.includes('KELAS 6')) assignedKelas = 6;

    if (assignedKelas) {
      rombelLabel = `Rombongan Belajar Kelas ${assignedKelas}`;
    }

    const fullName = `${foundTeacher.gelarDepan ? foundTeacher.gelarDepan + ' ' : ''}${foundTeacher.nama}${
      foundTeacher.gelarBelakang ? ', ' + foundTeacher.gelarBelakang : ''
    }`;

    onLogin({
      role: 'guru',
      name: fullName,
      nip: foundTeacher.nip,
      jabatan: foundTeacher.jabatan,
      kelas: assignedKelas,
      rombel: rombelLabel,
    });

    setErrorMessage(null);
    setGuruPassword('');
    onNavigate('kepegawaian');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-700">
              <School className="w-3.5 h-3.5 text-emerald-300" />
              <span>Portal Masuk Multi-Role Resmi</span>
              <span className="text-emerald-400">•</span>
              <span>NPSN: {profil.npsn}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang di SIM {profil.nama}
            </h1>

            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Sistem Informasi Manajemen Sekolah Terpadu dengan hak akses berbasis peran (RBAC) untuk 
              <strong> Guest</strong>, <strong>Administrator</strong>, dan <strong>Guru Rombongan Belajar</strong>.
            </p>
          </div>

          <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 md:border-l border-emerald-700/60 pt-4 md:pt-0 md:pl-6 text-right">
            <span className="text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-emerald-700/70 border border-emerald-600 text-emerald-100">
              Akreditasi {profil.akreditasi}
            </span>
            <div className="text-[11px] text-emerald-200">
              Kec. {profil.kecamatan}, Kab. {profil.kabupaten}
            </div>
          </div>
        </div>
      </div>

      {/* Active Session Card (If Logged In) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${
            currentUser.role === 'admin' 
              ? 'bg-purple-700' 
              : currentUser.role === 'guru' 
              ? 'bg-emerald-700' 
              : 'bg-slate-700'
          }`}>
            {currentUser.role === 'admin' && <ShieldCheck className="w-6 h-6" />}
            {currentUser.role === 'guru' && <GraduationCap className="w-6 h-6" />}
            {(currentUser.role === 'guest' || currentUser.role === 'siswa') && <Eye className="w-6 h-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status Akun Aktif:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                currentUser.role === 'admin'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : currentUser.role === 'guru'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-800 border border-slate-300'
              }`}>
                {currentUser.role === 'admin' && 'Administrator (Akses Penuh)'}
                {currentUser.role === 'guru' && `Guru (${currentUser.rombel || currentUser.jabatan || 'Rombel'})`}
                {(currentUser.role === 'guest' || currentUser.role === 'siswa') && 'Guest (Informasi Umum)'}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              {currentUser.name}
            </h3>

            {currentUser.nip && (
              <p className="text-[11px] text-slate-500">
                NIP. {currentUser.nip}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => onNavigate(currentUser.role === 'guru' ? 'kepegawaian' : 'dashboard')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <span>{currentUser.role === 'guru' ? 'Buka Menu Guru' : 'Buka Dashboard SIM'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            title="Keluar dari akun saat ini dan kembali ke menu login"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Role Login Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        {/* Section Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-700" />
                Pilih Peran Akun untuk Masuk
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih salah satu peran di bawah ini sesuai tugas dan wewenang Anda di SDN Kedungringin 1 Beji.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              3 Kategori Peran
            </span>
          </div>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Guest */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('guest');
                setErrorMessage(null);
              }}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedRole === 'guest'
                  ? 'border-slate-800 bg-slate-50/80 shadow-md ring-2 ring-slate-800/10'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    Tanpa Sandi
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">Guest (Tamu Publik)</h4>
                  <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                    Melihat informasi publik (Dashboard, Direktori Kepegawaian, Kesiswaan Umum, dan Fasilitas Sarpras). Menu Keadministrasian/persuratan ditutup.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold flex items-center gap-1.5 text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                <span>1-Klik Langsung Masuk</span>
              </div>
            </button>

            {/* Card 2: Admin */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMessage(null);
              }}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedRole === 'admin'
                  ? 'border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-600/15'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    Akses Penuh
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">Administrator</h4>
                  <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                    Memiliki akses merubah dan memperbarui secara keseluruhan data SIM sekolah (semua rombel, master data, dan Google Sheets).
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-100 text-[11px] font-bold flex items-center gap-1.5 text-purple-800">
                <Lock className="w-3.5 h-3.5 text-purple-700" />
                <span>Otentikasi Sandi Admin</span>
              </div>
            </button>

            {/* Card 3: Guru */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('guru');
                setErrorMessage(null);
              }}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedRole === 'guru'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-600/15'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Akses Rombel
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">Guru / Wali Kelas</h4>
                  <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                    Memiliki akses update sesuai dengan rombongan belajar / tingkat kelasnya (nilai rapor, TKA, data siswa, dan LMS kelas).
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-100 text-[11px] font-bold flex items-center gap-1.5 text-emerald-800">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>Login dengan NIP Guru</span>
              </div>
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form Content Based on Selected Role */}
          <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200">
            {/* 1. Form Guest */}
            {selectedRole === 'guest' && (
              <form onSubmit={handleGuestSubmit} className="space-y-4 max-w-lg mx-auto text-xs">
                <div className="text-center space-y-1 pb-2">
                  <h3 className="text-base font-bold text-slate-900">Masuk Mode Guest (Pengunjung)</h3>
                  <p className="text-slate-500 text-xs">
                    Anda akan diarahkan ke halaman informasi umum sekolah tanpa perlu memasukkan kata sandi.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-700 space-y-2">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Fitur yang dapat diakses oleh Guest:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                    <li>Melihat profil lengkap & fasilitas SDN Kedungringin 1 Beji</li>
                    <li>Melihat statistik demografi kesiswaan & direktori kepegawaian</li>
                    <li>Melihat katalog buku perpustakaan & daftar inventaris sarpras</li>
                    <li>Melihat denah dan fasilitas Gedung Ruang Kelas 1 s.d. 6</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>Masuk Sebagai Guest Sekarang (1-Klik)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* 2. Form Admin */}
            {selectedRole === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4 max-w-md mx-auto text-xs">
                <div className="text-center space-y-1 pb-2">
                  <h3 className="text-base font-bold text-slate-900">Masuk Sebagai Administrator</h3>
                  <p className="text-slate-500 text-xs">
                    Hak akses penuh untuk mengelola dan memperbarui keseluruhan data SIM.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Username Admin</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      placeholder="Masukkan username"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      placeholder="Masukkan kata sandi"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Masuk Administrator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* 3. Form Guru */}
            {selectedRole === 'guru' && (
              <form onSubmit={handleGuruSubmit} className="space-y-4 max-w-md mx-auto text-xs">
                <div className="text-center space-y-1 pb-2">
                  <h3 className="text-base font-bold text-slate-900">Masuk Sebagai Guru / Tenaga Pendidik</h3>
                  <p className="text-slate-500 text-xs">
                    Hak akses pembaruan data khusus untuk rombongan belajar / kelas yang Anda ampu.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">NIP Guru</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={guruNip}
                      onChange={(e) => setGuruNip(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Masukkan NIP Guru Anda"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={guruPassword}
                      onChange={(e) => setGuruPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Masukkan kata sandi"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Masuk Sebagai Guru</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Security & Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Pemisahan Hak Akses (RBAC)</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Menjamin keamanan data sekolah di mana setiap peran hanya memiliki wewenang sesuai fungsi kedinasan.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-800 font-bold">
            <Building2 className="w-4 h-4 text-indigo-700" />
            <span>6 Rombongan Belajar</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Terintegrasi dengan Gedung Ruang Kelas 1 s.d. 6, jadwal piket kebersihan, struktur kelas, dan LMS materi.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 text-purple-800 font-bold">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span>Google Workspace & Gemini AI</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Sinkronisasi otomatis spreadsheet Drive folder serta pembuatan surat dinas cerdas berbasis AI.
          </p>
        </div>
      </div>
    </div>
  );
};
