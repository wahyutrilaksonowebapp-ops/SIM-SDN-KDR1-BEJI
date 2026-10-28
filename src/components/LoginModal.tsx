import React, { useState } from 'react';
import { Pegawai, Siswa, AuthUser, UserRole } from '../types';
import { 
  ShieldCheck, 
  GraduationCap, 
  Lock, 
  User, 
  X, 
  AlertCircle,
  School,
  Eye,
  CheckCircle2,
  BookOpen,
  LogOut,
  UserCheck,
  LogIn,
  Search,
  RefreshCw
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: AuthUser;
  siswaList: Siswa[];
  pegawaiList: Pegawai[];
  onClose: () => void;
  onLogin: (user: AuthUser) => Promise<void> | void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentUser,
  siswaList = [],
  pegawaiList,
  onClose,
  onLogin,
  onLogout,
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
  const [siswaSearchText, setSiswaSearchText] = useState('');
  const [siswaPassword, setSiswaPassword] = useState('');

  // Dual-function login & sync loading state
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Error & Feedback state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
    onClose();
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
      onClose();
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
    onClose();
  };

  // 4. Siswa Login: Tombol login berfungsi ganda (tarik data spreadsheet & proses login)
  const handleSiswaSubmit = async (e: React.FormEvent) => {
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
      setErrorMessage('Kata sandi tidak valid. Silakan periksa kembali kata sandi Anda.');
      return;
    }

    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      await onLogin({
        role: 'siswa',
        name: foundSiswa.nama,
        nisn: foundSiswa.nisn,
        kelas: foundSiswa.kelas,
        rombel: `Kelas ${foundSiswa.kelas} (${foundSiswa.rombel || 'A'})`,
      });
      setSiswaPassword('');
      onClose();
    } catch (err: any) {
      setErrorMessage('Terjadi kendala saat menarik data dari spreadsheet: ' + (err?.message || 'Silakan ulangi'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const filteredSiswaByKelas = siswaList.filter((s) => s.kelas === siswaKelas);

  // Pencarian Cepat Siswa (Nama / NISN)
  const matchingSiswaSearchResults = siswaSearchText.trim()
    ? siswaList
        .filter((s) => {
          const q = siswaSearchText.toLowerCase().trim();
          return (
            s.nama.toLowerCase().includes(q) ||
            (s.nisn && s.nisn.toLowerCase().includes(q))
          );
        })
        .slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <School className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Portal Masuk Sistem</h3>
              <p className="text-[11px] text-emerald-200">SDN Kedungringin 1 Beji - Kab. Pasuruan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Status Banner */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status Saat Ini:</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                currentUser.role === 'admin'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : currentUser.role === 'guru'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : currentUser.role === 'siswa'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              {currentUser.role === 'admin' && (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Admin (Akses Penuh)</span>
                </>
              )}
              {currentUser.role === 'guru' && (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Guru {currentUser.kelas ? `(Kelas ${currentUser.kelas})` : ''}</span>
                </>
              )}
              {currentUser.role === 'siswa' && (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Siswa {currentUser.kelas ? `(Kelas ${currentUser.kelas})` : ''}</span>
                </>
              )}
              {currentUser.role === 'guest' && (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-700" />
                  <span>Guest (Informasi Umum)</span>
                </>
              )}
            </span>
          </div>

          <button
            onClick={() => {
              onLogout();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Keluar dari akun saat ini"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>

        {/* Multi-Role Selector Tabs: Guest | Siswa | Guru | Admin */}
        <div className="p-5">
          <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('guest');
                setErrorMessage(null);
              }}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'guest'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>Guest</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('siswa');
                setErrorMessage(null);
              }}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'siswa'
                  ? 'bg-white text-blue-900 shadow-xs ring-1 ring-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Siswa</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('guru');
                setErrorMessage(null);
              }}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'guru'
                  ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>Guru</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMessage(null);
              }}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-white text-purple-900 shadow-xs ring-1 ring-purple-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span>Admin</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. GUEST MODE */}
          {selectedRole === 'guest' && (
            <form onSubmit={handleGuestSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span>Karakteristik & Hak Akses Guest</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-slate-600">
                  Akses keterbukaan informasi publik: Profil resmi SDN Kedungringin I Beji, rekapitulasi kehadiran kelas agregat, direktori pendidik & tenaga kependidikan, serta informasi sarana prasarana sekolah secara transparan tanpa kata sandi.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Langsung masuk tanpa kata sandi</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            </form>
          )}

          {/* 2. SISWA MODE */}
          {selectedRole === 'siswa' && (
            <form onSubmit={handleSiswaSubmit} className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 text-[11.5px] leading-relaxed">
                <strong>Akses Portal Siswa Mandiri:</strong> Memantau riwayat transaksi buku tabungan siswa, rekapitulasi presensi kehadiran (Sakit, Izin, Tanpa Keterangan, Jumlah), capaian rapor semester per mata pelajaran (Semester 7–12), dan inventaris fasilitas rombel kelas Anda.
              </div>

              {/* Pencarian Teks Siswa / NISN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cari Siswa Cepat (Nama / NISN)</span>
                  </label>
                  {siswaSearchText && (
                    <button
                      type="button"
                      onClick={() => setSiswaSearchText('')}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5 font-normal cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Bersihkan
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={siswaSearchText}
                    onChange={(e) => setSiswaSearchText(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ketik nama lengkap atau NISN..."
                  />
                </div>

                {/* Suggestion Dropdown List */}
                {siswaSearchText.trim() && (
                  <div className="mt-1.5 bg-white border border-blue-200 rounded-xl shadow-lg max-h-40 overflow-y-auto divide-y divide-slate-100 z-20">
                    {matchingSiswaSearchResults.length > 0 ? (
                      matchingSiswaSearchResults.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedSiswaId(s.id);
                            setSiswaKelas(s.kelas);
                            setSiswaSearchText(s.nama);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center justify-between gap-2 text-xs cursor-pointer ${
                            selectedSiswaId === s.id ? 'bg-blue-100/70 font-semibold text-blue-900' : 'text-slate-800'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-bold text-slate-900">{s.nama}</span>
                            <span className="text-[10px] text-slate-500 ml-1.5">NISN: {s.nisn}</span>
                          </div>
                          <span className="shrink-0 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                            Kls {s.kelas}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-2.5 text-center text-slate-500 text-xs">
                        Tidak ditemukan siswa "{siswaSearchText}".
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Rombel / Kelas</label>
                  <select
                    value={siswaKelas}
                    onChange={(e) => {
                      setSiswaKelas(Number(e.target.value));
                      setSelectedSiswaId('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
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
                  <label className="block text-slate-700 font-semibold mb-1">Pilih Siswa</label>
                  <select
                    value={selectedSiswaId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedSiswaId(id);
                      const s = siswaList.find((x) => x.id === id);
                      if (s) setSiswaSearchText(s.nama);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {filteredSiswaByKelas.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.nisn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kata Sandi / PIN Siswa</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={siswaPassword}
                    onChange={(e) => setSiswaPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-75 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Tarik Data & Login...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* 3. GURU MODE */}
          {selectedRole === 'guru' && (
            <form onSubmit={handleGuruSubmit} className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-[11.5px] leading-relaxed">
                <strong>Akses Administrasi Kelas & Pengajaran:</strong> Pencatatan presensi siswa secara harian dan rekap bulanan, pengelolaan transaksi tabungan rombel ampu (saldo awal & mutasi keluar-masuk), input evaluasi nilai rapor semester 8 mapel, dan sarpras ruang kelas.
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">NIP Guru</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={guruNip}
                    onChange={(e) => setGuruNip(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Masukkan NIP Anda"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={guruPassword}
                    onChange={(e) => setGuruPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </div>
            </form>
          )}

          {/* 4. ADMIN MODE */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-950 text-[11.5px] leading-relaxed">
                <strong>Akses Kendali Penuh Sistem (Full Access):</strong> Tata kelola data induk kepegawaian GTK & peserta didik, manajemen sarpras dan persuratan dinas, kontrol validasi database sekolah, serta sinkronisasi realtime Master Database Google Spreadsheet.
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Username Admin</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Masukkan username"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
