import React, { useState } from 'react';
import { Pegawai, Siswa, ProfilSekolah, AuthUser, TabType } from '../types';
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
  KeyRound,
  UserCheck
} from 'lucide-react';

interface LoginMenuProps {
  profil: ProfilSekolah;
  pegawaiList: Pegawai[];
  siswaList?: Siswa[];
  currentUser: AuthUser;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  onNavigate: (tab: TabType) => void;
}

export const LoginMenu: React.FC<LoginMenuProps> = ({
  profil,
  pegawaiList,
  siswaList = [],
  currentUser,
  onLogin,
  onLogout,
  onNavigate,
}) => {
  const [selectedRole, setSelectedRole] = useState<'guest' | 'siswa' | 'guru' | 'admin'>(() => {
    if (currentUser.role === 'siswa') return 'siswa';
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

  // Siswa credentials state
  const [siswaKelas, setSiswaKelas] = useState<number>(6);
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('');
  const [siswaPassword, setSiswaPassword] = useState('');

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

  // 4. Siswa Login
  const handleSiswaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId) {
      setErrorMessage('Silakan pilih nama siswa atau NISN.');
      return;
    }

    const foundSiswa = siswaList.find((s) => s.id === selectedSiswaId);
    if (!foundSiswa) {
      setErrorMessage('Data siswa tidak ditemukan.');
      return;
    }

    const cleanPass = siswaPassword.trim();
    if (cleanPass && cleanPass !== '20519482' && cleanPass !== foundSiswa.nisn) {
      setErrorMessage('Kata sandi tidak valid. Gunakan kata sandi default 20519482 atau NISN.');
      return;
    }

    onLogin({
      role: 'siswa',
      name: foundSiswa.nama,
      nisn: foundSiswa.nisn,
      kelas: foundSiswa.kelas,
      rombel: `Kelas ${foundSiswa.kelas} (${foundSiswa.rombel || 'A'})`,
    });

    setErrorMessage(null);
    setSiswaPassword('');
    onNavigate('dashboard');
  };

  const filteredSiswaByKelas = siswaList.filter((s) => s.kelas === siswaKelas);

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
              <strong> Guest</strong>, <strong>Siswa</strong>, <strong>Guru Rombel</strong>, dan <strong>Administrator</strong>.
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
                Pilih peran Anda untuk mendapatkan tampilan menu dan hak akses sesuai wewenang.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              4 Kategori Peran Akun
            </span>
          </div>
        </div>

        {/* 4 Role Selection Cards */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Button 1: Guest */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('guest');
                setErrorMessage(null);
              }}
              className={`group relative flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none active:translate-y-1 active:border-b-0 ${
                selectedRole === 'guest'
                  ? 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 text-white border-b-[5px] border-slate-950 shadow-lg shadow-slate-900/30 ring-2 ring-slate-600/40 translate-y-0.5'
                  : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-800 border border-slate-200 border-b-[5px] border-b-slate-300 hover:border-b-slate-400 shadow-sm'
              }`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105 shrink-0 ${
                selectedRole === 'guest' ? 'bg-slate-700/80 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                <Eye className="w-4 h-4" />
              </div>
              <span className="tracking-wide font-extrabold">Guest</span>
            </button>

            {/* Button 2: Siswa */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('siswa');
                setErrorMessage(null);
              }}
              className={`group relative flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none active:translate-y-1 active:border-b-0 ${
                selectedRole === 'siswa'
                  ? 'bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 text-white border-b-[5px] border-blue-950 shadow-lg shadow-blue-900/30 ring-2 ring-blue-600/40 translate-y-0.5'
                  : 'bg-gradient-to-b from-white via-blue-50/50 to-blue-100 text-blue-950 border border-blue-200 border-b-[5px] border-b-blue-300 hover:border-b-blue-400 shadow-sm'
              }`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105 shrink-0 ${
                selectedRole === 'siswa' ? 'bg-blue-800/80 text-white' : 'bg-blue-100 text-blue-700'
              }`}>
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="tracking-wide font-extrabold">Siswa</span>
            </button>

            {/* Button 3: Guru */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('guru');
                setErrorMessage(null);
              }}
              className={`group relative flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none active:translate-y-1 active:border-b-0 ${
                selectedRole === 'guru'
                  ? 'bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 text-white border-b-[5px] border-emerald-950 shadow-lg shadow-emerald-900/30 ring-2 ring-emerald-600/40 translate-y-0.5'
                  : 'bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100 text-emerald-950 border border-emerald-200 border-b-[5px] border-b-emerald-300 hover:border-b-emerald-400 shadow-sm'
              }`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105 shrink-0 ${
                selectedRole === 'guru' ? 'bg-emerald-800/80 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="tracking-wide font-extrabold">Guru</span>
            </button>

            {/* Button 4: Admin */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMessage(null);
              }}
              className={`group relative flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer select-none active:translate-y-1 active:border-b-0 ${
                selectedRole === 'admin'
                  ? 'bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900 text-white border-b-[5px] border-purple-950 shadow-lg shadow-purple-900/30 ring-2 ring-purple-600/40 translate-y-0.5'
                  : 'bg-gradient-to-b from-white via-purple-50/50 to-purple-100 text-purple-950 border border-purple-200 border-b-[5px] border-b-purple-300 hover:border-b-purple-400 shadow-sm'
              }`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105 shrink-0 ${
                selectedRole === 'admin' ? 'bg-purple-800/80 text-white' : 'bg-purple-100 text-purple-700'
              }`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="tracking-wide font-extrabold">Admin</span>
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
                    <span>Hak Akses Guest:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                    <li>Melihat profil lengkap SDN Kedungringin 1 Beji</li>
                    <li>Melihat rekapitulasi presensi kelas (agregat tingkat kelas tanpa data nama siswa)</li>
                    <li>Melihat sarpras dan fasilitas ruang kelas</li>
                    <li><em>Catatan: Sub menu Tabungan disembunyikan/dilarang untuk Akun Guest demi privasi.</em></li>
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

            {/* 2. Form Siswa */}
            {selectedRole === 'siswa' && (
              <form onSubmit={handleSiswaSubmit} className="space-y-4 max-w-md mx-auto text-xs">
                <div className="text-center space-y-1 pb-2">
                  <h3 className="text-base font-bold text-slate-900">Masuk Sebagai Siswa</h3>
                  <p className="text-slate-500 text-xs">
                    Peran akun siswa: melihat dashboard, kesiswaan (buku tabungan & rekap presensi), dan sarpras sesuai rombel Anda.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Pilih Tingkat Kelas / Rombel</label>
                  <select
                    value={siswaKelas}
                    onChange={(e) => {
                      setSiswaKelas(Number(e.target.value));
                      setSelectedSiswaId('');
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value={1}>Kelas 1</option>
                    <option value={2}>Kelas 2</option>
                    <option value={3}>Kelas 3</option>
                    <option value={4}>Kelas 4</option>
                    <option value={5}>Kelas 5</option>
                    <option value={6}>Kelas 6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Pilih Nama Siswa</label>
                  <select
                    value={selectedSiswaId}
                    onChange={(e) => setSelectedSiswaId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Siswa Kelas {siswaKelas} --</option>
                    {filteredSiswaByKelas.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} (NISN: {s.nisn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Kata Sandi / PIN Siswa</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={siswaPassword}
                      onChange={(e) => setSiswaPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Masukkan kata sandi (20519482 atau NISN)"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Gunakan PIN default: <strong>20519482</strong> atau <strong>NISN</strong> siswa Anda.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Masuk Portal Akun Siswa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* 3. Form Guru */}
            {selectedRole === 'guru' && (
              <form onSubmit={handleGuruSubmit} className="space-y-4 max-w-md mx-auto text-xs">
                <div className="text-center space-y-1 pb-2">
                  <h3 className="text-base font-bold text-slate-900">Masuk Sebagai Guru Kelas / Mapel</h3>
                  <p className="text-slate-500 text-xs">
                    Mencatat saldo awal tabungan, mutasi keluar/masuk tabungan, serta input presensi harian & bulanan siswa.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Nomor Induk Pegawai (NIP)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={guruNip}
                      onChange={(e) => setGuruNip(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Contoh: 19860628 202321 1 010"
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
                      placeholder="Masukkan kata sandi guru"
                      autoComplete="current-password"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Gunakan kata sandi terdaftar (default: <strong>20519482</strong>)
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Masuk Portal Guru</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* 4. Form Admin */}
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
                    <span>Masuk Portal Administrator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
