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
  LogOut
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: AuthUser;
  siswaList: Siswa[];
  pegawaiList: Pegawai[];
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentUser,
  pegawaiList,
  onClose,
  onLogin,
  onLogout,
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
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-500">Status Saat Ini:</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                currentUser.role === 'admin'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : currentUser.role === 'guru'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
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
              {currentUser.role === 'guest' && (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-700" />
                  <span>Guest (Informasi Umum)</span>
                </>
              )}
              {currentUser.role === 'siswa' && (
                <>
                  <Eye className="w-3.5 h-3.5 text-blue-700" />
                  <span>Guest Siswa</span>
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

        {/* Multi-Role Selector Tabs */}
        <div className="p-5">
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-xl mb-4">
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
                  Melihat informasi yang bersifat umum pada SDN Kedungringin 1 Beji (profil sekolah, statistik kesiswaan, katalog perpustakaan, fasilitas ruang kelas, dan direktori umum) tanpa memerlukan kata sandi.
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
                <Eye className="w-4 h-4" />
                <span>Masuk Sebagai Guest</span>
              </button>
            </form>
          )}

          {/* 2. ADMIN MODE */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-purple-950 text-[11px] leading-relaxed">
                <strong>Tugas & Hak Akses Admin:</strong> Memiliki akses merubah dan memperbarui secara keseluruhan data SIM sekolah (semua rombel/kelas, kepegawaian, kesiswaan, sarpras, persuratan, serta Google Drive & Sheets).
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
                  <ShieldCheck className="w-4 h-4" />
                  <span>Masuk Sebagai Administrator</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. GURU MODE */}
          {selectedRole === 'guru' && (
            <form onSubmit={handleGuruSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-950 text-[11px] leading-relaxed">
                <strong>Tugas & Hak Akses Guru:</strong> Memiliki akses update sesuai dengan rombongan belajar / tingkat kelas yang diampu (nilai rapor, asesmen TKA, data siswa kelas binaan, LMS materi kelas, piket & struktur ruang kelas).
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
                  <BookOpen className="w-4 h-4" />
                  <span>Masuk Sebagai Guru</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
