import React, { useState, useMemo } from 'react';
import { 
  Siswa, 
  ProfilSekolah, 
  AuthUser, 
  UserRole,
  TabunganTransaksi,
  SaldoAwalTabungan 
} from '../../types';
import { 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  Plus, 
  SlidersHorizontal, 
  Search, 
  Printer, 
  ShieldAlert, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Receipt, 
  FileSpreadsheet, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { formatIndoDate } from '../../utils/helpers';

interface TabunganSiswaProps {
  siswa: Siswa[];
  profil: ProfilSekolah;
  currentUser?: AuthUser;
  userRole?: UserRole;
  tabunganList: TabunganTransaksi[];
  saldoAwalList: SaldoAwalTabungan[];
  onSaveTransaksi: (item: TabunganTransaksi) => void;
  onSaveSaldoAwal: (item: SaldoAwalTabungan) => void;
  onDeleteTransaksi?: (id: string) => void;
}

export const TabunganSiswa: React.FC<TabunganSiswaProps> = ({
  siswa,
  profil,
  currentUser = { role: 'guest', name: 'Tamu' },
  userRole = 'guest',
  tabunganList,
  saldoAwalList,
  onSaveTransaksi,
  onSaveSaldoAwal,
  onDeleteTransaksi,
}) => {
  const isGuest = userRole === 'guest';
  const isSiswa = userRole === 'siswa';
  const isGuru = userRole === 'guru';
  const isAdmin = userRole === 'admin';

  // 1. Akun Guest: Dilarang memantau tabungan
  if (isGuest) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm my-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Akses Menu Terbatas</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          Sesuai kebijakan privasi keuangan SDN Kedungringin 1 Beji, data <strong>Buku Tabungan Siswa</strong> bersifat rahasia pribadi dan <strong>tidak dapat diakses oleh Akun Tamu (Guest)</strong>.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-left space-y-2">
          <p className="font-semibold text-slate-700 flex items-center gap-1.5">
            <LockIcon className="w-4 h-4 text-amber-600" /> Hak Akses Tabungan:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li><strong>Akun Siswa:</strong> Hanya dapat melihat riwayat transaksi dan saldo tabungan miliknya.</li>
            <li><strong>Akun Guru:</strong> Berwenang mencatat saldo awal dan transaksi setor/tarik tabungan kelasnya.</li>
            <li><strong>Administrator:</strong> Memiliki akses penuh rekonsiliasi kas tabungan sekolah.</li>
          </ul>
        </div>
      </div>
    );
  }

  // State for Teachers / Admins
  const defaultKelas = useMemo(() => {
    if (isGuru && currentUser.kelas) return String(currentUser.kelas);
    if (isSiswa && currentUser.kelas) return String(currentUser.kelas);
    return '6';
  }, [isGuru, isSiswa, currentUser]);

  const [selectedKelas, setSelectedKelas] = useState<string>(defaultKelas);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<'ALL' | 'setor' | 'tarik'>('ALL');
  const [viewTab, setViewTab] = useState<'transaksi' | 'rekap_siswa'>('transaksi');

  // Modal State for New Transaction
  const [showModalTransaksi, setShowModalTransaksi] = useState(false);
  const [transaksiSiswaId, setTransaksiSiswaId] = useState('');
  const [transaksiTanggal, setTransaksiTanggal] = useState(() => new Date().toISOString().split('T')[0]);
  const [transaksiJenis, setTransaksiJenis] = useState<'setor' | 'tarik'>('setor');
  const [transaksiJumlah, setTransaksiJumlah] = useState<number>(20000);
  const [transaksiKeterangan, setTransaksiKeterangan] = useState('Setoran tabungan mingguan');
  const [formError, setFormError] = useState<string | null>(null);

  // Modal State for Saldo Awal
  const [showModalSaldoAwal, setShowModalSaldoAwal] = useState(false);
  const [saldoAwalSiswaId, setSaldoAwalSiswaId] = useState('');
  const [saldoAwalNominal, setSaldoAwalNominal] = useState<number>(100000);
  const [saldoAwalTanggal, setSaldoAwalTanggal] = useState(() => new Date().toISOString().split('T')[0]);

  // Current logged in student helper
  const currentStudent = useMemo(() => {
    if (!isSiswa) return null;
    return siswa.find((s) => 
      (currentUser.nisn && s.nisn === currentUser.nisn) || 
      s.nama.toLowerCase().trim() === currentUser.name.toLowerCase().trim()
    ) || {
      id: 'sis-curr',
      nisn: currentUser.nisn || '0123847591',
      nis: '2021001',
      nama: currentUser.name,
      kelas: currentUser.kelas || 6,
      rombel: 'A',
      jenisKelamin: 'L',
      statusSiswa: 'Aktif',
    } as Siswa;
  }, [isSiswa, currentUser, siswa]);

  // Filtered students by class
  const classStudents = useMemo(() => {
    if (selectedKelas === 'ALL') return siswa;
    const k = Number(selectedKelas);
    return siswa.filter((s) => s.kelas === k);
  }, [siswa, selectedKelas]);

  // Map to get student balance
  const studentBalanceMap = useMemo(() => {
    const map = new Map<string, { saldoAwal: number; totalSetor: number; totalTarik: number; saldoAkhir: number }>();
    
    // Seed initial balance
    siswa.forEach((s) => {
      const sa = saldoAwalList.find((item) => item.siswaId === s.id || item.nisn === s.nisn);
      const saldoAwal = sa ? sa.saldoAwal : 0;
      map.set(s.id, { saldoAwal, totalSetor: 0, totalTarik: 0, saldoAkhir: saldoAwal });
    });

    // Process all transactions
    const sorted = [...tabunganList].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    sorted.forEach((t) => {
      let entry = map.get(t.siswaId);
      if (!entry) {
        entry = { saldoAwal: 0, totalSetor: 0, totalTarik: 0, saldoAkhir: 0 };
        map.set(t.siswaId, entry);
      }
      if (t.jenis === 'setor') {
        entry.totalSetor += t.jumlah;
        entry.saldoAkhir += t.jumlah;
      } else {
        entry.totalTarik += t.jumlah;
        entry.saldoAkhir -= t.jumlah;
      }
    });

    return map;
  }, [siswa, saldoAwalList, tabunganList]);

  // Format currency helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Submit New Transaction Handler (Guru / Admin)
  const handleSubmitTransaksi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaksiSiswaId) {
      setFormError('Silakan pilih siswa yang bertransaksi.');
      return;
    }
    if (transaksiJumlah <= 0) {
      setFormError('Nominal transaksi harus lebih dari Rp 0.');
      return;
    }

    const targetSiswa = siswa.find((s) => s.id === transaksiSiswaId);
    if (!targetSiswa) {
      setFormError('Data siswa tidak ditemukan.');
      return;
    }

    const currentBal = studentBalanceMap.get(targetSiswa.id)?.saldoAkhir || 0;
    if (transaksiJenis === 'tarik' && transaksiJumlah > currentBal) {
      setFormError(`Saldo siswa tidak mencukupi untuk penarikan! Saldo saat ini: ${formatRupiah(currentBal)}`);
      return;
    }

    const newSaldoSetelahnya = transaksiJenis === 'setor' 
      ? currentBal + transaksiJumlah 
      : currentBal - transaksiJumlah;

    const newTx: TabunganTransaksi = {
      id: `tab-${Date.now()}`,
      siswaId: targetSiswa.id,
      nisn: targetSiswa.nisn,
      namaSiswa: targetSiswa.nama,
      kelas: targetSiswa.kelas,
      rombel: targetSiswa.rombel || 'A',
      tanggal: transaksiTanggal,
      jenis: transaksiJenis,
      jumlah: Number(transaksiJumlah),
      saldoSebelumnya: currentBal,
      saldoSetelahnya: newSaldoSetelahnya,
      keterangan: transaksiKeterangan.trim() || (transaksiJenis === 'setor' ? 'Setoran Tabungan' : 'Penarikan Tabungan'),
      dicatatOleh: currentUser.name || 'Wali Kelas',
      createdAt: new Date().toISOString(),
    };

    onSaveTransaksi(newTx);
    setShowModalTransaksi(false);
    setFormError(null);
    setTransaksiKeterangan('Setoran tabungan');
  };

  // Submit Saldo Awal Handler (Guru / Admin)
  const handleSubmitSaldoAwal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saldoAwalSiswaId) {
      setFormError('Silakan pilih siswa.');
      return;
    }
    const targetSiswa = siswa.find((s) => s.id === saldoAwalSiswaId);
    if (!targetSiswa) return;

    const newSA: SaldoAwalTabungan = {
      id: `sa-${targetSiswa.id}`,
      siswaId: targetSiswa.id,
      nisn: targetSiswa.nisn,
      namaSiswa: targetSiswa.nama,
      kelas: targetSiswa.kelas,
      saldoAwal: Number(saldoAwalNominal),
      tanggalTetap: saldoAwalTanggal,
    };

    onSaveSaldoAwal(newSA);
    setShowModalSaldoAwal(false);
    setFormError(null);
  };

  // Print Passbook / Report
  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // VIEW UNTUK AKUN SISWA
  // ==========================================
  if (isSiswa && currentStudent) {
    const studentTxs = tabunganList.filter((t) => 
      t.siswaId === currentStudent.id || 
      t.nisn === currentStudent.nisn ||
      t.namaSiswa.toLowerCase().trim() === currentStudent.nama.toLowerCase().trim()
    ).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    const studentBalance = studentBalanceMap.get(currentStudent.id) || {
      saldoAwal: 0,
      totalSetor: studentTxs.filter((t) => t.jenis === 'setor').reduce((acc, t) => acc + t.jumlah, 0),
      totalTarik: studentTxs.filter((t) => t.jenis === 'tarik').reduce((acc, t) => acc + t.jumlah, 0),
      saldoAkhir: 0,
    };
    studentBalance.saldoAkhir = (studentBalance.saldoAwal + studentBalance.totalSetor) - studentBalance.totalTarik;

    return (
      <div className="space-y-6">
        {/* Siswa Header Card */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/70 text-emerald-100 border border-emerald-500/40">
                <Wallet className="w-3.5 h-3.5 text-emerald-300" />
                Buku Tabungan Digital Siswa
              </span>
              <h2 className="text-2xl font-black">{currentStudent.nama}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 pt-1">
                <span>NISN: <strong>{currentStudent.nisn}</strong></span>
                <span>•</span>
                <span>Rombel: <strong>Kelas {currentStudent.kelas} ({currentStudent.rombel || 'A'})</strong></span>
                <span>•</span>
                <span>Unit: <strong>{profil.nama}</strong></span>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs shadow-md hover:bg-emerald-50 transition cursor-pointer self-start md:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Riwayat Tabungan</span>
            </button>
          </div>
        </div>

        {/* Saldo Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Tabungan Aktif</p>
                <h3 className="text-2xl font-black text-emerald-700 mt-1">{formatRupiah(studentBalance.saldoAkhir)}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Saldo tercatat sah di SIM Sekolah
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Setor (Masuk)</p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(studentBalance.totalSetor)}</h3>
              </div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Akumulasi seluruh setoran</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tarik (Keluar)</p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(studentBalance.totalTarik)}</h3>
              </div>
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Penarikan kebutuhan belajar</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Awal</p>
                <h3 className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(studentBalance.saldoAwal)}</h3>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Saldo awal semester ini</p>
          </div>
        </div>

        {/* Riwayat Transaksi Tabel Siswa */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-slate-800 text-base">Riwayat Transaksi Tabungan Anda</h3>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
              {studentTxs.length} Transaksi Tercatat
            </span>
          </div>

          {studentTxs.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p>Belum ada riwayat transaksi tabungan untuk akun Anda.</p>
              <p className="text-xs text-slate-400 mt-1">Silakan menghubungi Wali Kelas Anda untuk menyetorkan tabungan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Jenis Transaksi</th>
                    <th className="py-3 px-4 text-right">Nominal Transaksi</th>
                    <th className="py-3 px-4 text-right">Saldo Setelahnya</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4">Pencatat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentTxs.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatIndoDate(tx.tanggal)}
                      </td>
                      <td className="py-3 px-4">
                        {tx.jenis === 'setor' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <ArrowDownRight className="w-3.5 h-3.5" /> Setor (Masuk)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Tarik (Keluar)
                          </span>
                        )}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold font-mono ${tx.jenis === 'setor' ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {tx.jenis === 'setor' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                      </td>
                      <td className="py-3 px-4 text-right font-black font-mono text-slate-800">
                        {formatRupiah(tx.saldoSetelahnya)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{tx.keterangan || '-'}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{tx.dicatatOleh || 'Guru'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW UNTUK AKUN GURU & ADMINISTRATOR
  // ==========================================
  const filteredTxs = tabunganList.filter((tx) => {
    const matchKelas = selectedKelas === 'ALL' || String(tx.kelas) === selectedKelas;
    const matchJenis = filterJenis === 'ALL' || tx.jenis === filterJenis;
    const matchSearch = searchTerm === '' || 
      tx.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tx.nisn.includes(searchTerm) ||
      tx.keterangan.toLowerCase().includes(searchTerm.toLowerCase());
    return matchKelas && matchJenis && matchSearch;
  }).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // Aggregate stats for selected class
  const classSummary = useMemo(() => {
    let totalSaldo = 0;
    let totalSetor = 0;
    let totalTarik = 0;
    let activeSavers = 0;

    classStudents.forEach((s) => {
      const bal = studentBalanceMap.get(s.id);
      if (bal) {
        totalSaldo += bal.saldoAkhir;
        totalSetor += bal.totalSetor;
        totalTarik += bal.totalTarik;
        if (bal.saldoAkhir > 0 || bal.totalSetor > 0) activeSavers++;
      }
    });

    return { totalSaldo, totalSetor, totalTarik, activeSavers };
  }, [classStudents, studentBalanceMap]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Pengelolaan Kas Tabungan Siswa
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {isGuru && currentUser.rombel 
              ? `Tabungan Siswa - ${currentUser.rombel}` 
              : 'Tabungan Siswa SDN Kedungringin 1'}
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan saldo awal, transaksi harian setor/tarik, dan mutasi buku tabungan kelas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setFormError(null);
              if (classStudents.length > 0) setTransaksiSiswaId(classStudents[0].id);
              setShowModalTransaksi(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs shadow-sm hover:bg-emerald-900 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi Tabungan</span>
          </button>

          <button
            onClick={() => {
              setFormError(null);
              if (classStudents.length > 0) setSaldoAwalSiswaId(classStudents[0].id);
              setShowModalSaldoAwal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer border border-slate-200"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Atur Saldo Awal</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer border border-slate-200"
            title="Cetak Rekap"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Class Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kas Tabungan (Kelas {selectedKelas})</p>
          <h3 className="text-2xl font-black text-emerald-800 mt-1">{formatRupiah(classSummary.totalSaldo)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Saldo akhir terkumpul saat ini</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Setoran Terkumpul</p>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(classSummary.totalSetor)}</h3>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5" /> Uang masuk tabungan
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penarikan Siswa</p>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(classSummary.totalTarik)}</h3>
          <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Uang keluar tabungan
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Siswa Aktif Menabung</p>
          <h3 className="text-xl font-bold text-slate-800 mt-1">
            {classSummary.activeSavers} / {classStudents.length} Siswa
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {classStudents.length > 0 ? Math.round((classSummary.activeSavers / classStudents.length) * 100) : 0}% partisipasi
          </p>
        </div>
      </div>

      {/* Control Tabs & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab('transaksi')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewTab === 'transaksi' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Riwayat Transaksi Keluar Masuk ({filteredTxs.length})
            </button>
            <button
              onClick={() => setViewTab('rekap_siswa')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewTab === 'rekap_siswa' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Buku Tabungan per Siswa ({classStudents.length})
            </button>
          </div>

          {/* Filter Kelas (Admin or Multi-class) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Pilih Rombel / Kelas:</span>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Kelas (1 s.d 6)</option>
              <option value="1">Kelas 1</option>
              <option value="2">Kelas 2</option>
              <option value="3">Kelas 3</option>
              <option value="4">Kelas 4</option>
              <option value="5">Kelas 5</option>
              <option value="6">Kelas 6</option>
            </select>
          </div>
        </div>

        {/* Search & Transaction Type Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa, NISN, atau keterangan transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {viewTab === 'transaksi' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">Jenis:</span>
              <button
                onClick={() => setFilterJenis('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  filterJenis === 'ALL' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterJenis('setor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  filterJenis === 'setor' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Setoran Saja
              </button>
              <button
                onClick={() => setFilterJenis('tarik')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  filterJenis === 'tarik' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Penarikan Saja
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW TAB 1: DAFTAR TRANSAKSI KELUAR MASUK */}
      {viewTab === 'transaksi' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredTxs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">Tidak ada riwayat transaksi yang cocok.</p>
              <p className="text-xs text-slate-400 mt-1">Gunakan tombol "+ Catat Transaksi Tabungan" untuk menambahkan setoran atau penarikan siswa.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Nama Siswa / NISN</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4 text-right">Saldo Sesudah</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4">Dicatat Oleh</th>
                    {isAdmin && <th className="py-3 px-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTxs.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatIndoDate(tx.tanggal)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{tx.namaSiswa}</div>
                        <div className="text-[11px] text-slate-400 font-mono">NISN: {tx.nisn}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          Kelas {tx.kelas} ({tx.rombel || 'A'})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {tx.jenis === 'setor' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <ArrowDownRight className="w-3 h-3" /> Setor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <ArrowUpRight className="w-3 h-3" /> Tarik
                          </span>
                        )}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold font-mono ${tx.jenis === 'setor' ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {tx.jenis === 'setor' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                      </td>
                      <td className="py-3 px-4 text-right font-black font-mono text-slate-800">
                        {formatRupiah(tx.saldoSetelahnya)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{tx.keterangan || '-'}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{tx.dicatatOleh || 'Guru'}</td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          {onDeleteTransaksi && (
                            <button
                              onClick={() => {
                                if (confirm(`Hapus catatan transaksi ${tx.namaSiswa} (${formatRupiah(tx.jumlah)})?`)) {
                                  onDeleteTransaksi(tx.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Hapus Catatan Transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW TAB 2: REKAP SALDO BUKU TABUNGAN PER SISWA */}
      {viewTab === 'rekap_siswa' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Rekap Mutasi & Saldo Buku Tabungan Siswa (Kelas {selectedKelas})
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Total {classStudents.length} Siswa
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">NISN</th>
                  <th className="py-3 px-4 text-right">Saldo Awal</th>
                  <th className="py-3 px-4 text-right">Total Setor (+)</th>
                  <th className="py-3 px-4 text-right">Total Tarik (-)</th>
                  <th className="py-3 px-4 text-right">Saldo Akhir Saat Ini</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((s, idx) => {
                  const b = studentBalanceMap.get(s.id) || { saldoAwal: 0, totalSetor: 0, totalTarik: 0, saldoAkhir: 0 };
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {s.nama}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{s.nisn}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">{formatRupiah(b.saldoAwal)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700 font-semibold">+{formatRupiah(b.totalSetor)}</td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600 font-semibold">-{formatRupiah(b.totalTarik)}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                        {formatRupiah(b.saldoAkhir)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setTransaksiSiswaId(s.id);
                            setFormError(null);
                            setShowModalTransaksi(true);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] hover:bg-emerald-100 transition cursor-pointer"
                        >
                          + Setor/Tarik
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: CATAT TRANSAKSI SETOR / TARIK
         ======================================================== */}
      {showModalTransaksi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Catat Transaksi Tabungan Siswa</h3>
              </div>
              <button
                onClick={() => setShowModalTransaksi(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTransaksi} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa:</label>
                <select
                  value={transaksiSiswaId}
                  onChange={(e) => setTransaksiSiswaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Pilih Siswa --</option>
                  {classStudents.map((s) => {
                    const curSaldo = studentBalanceMap.get(s.id)?.saldoAkhir || 0;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.nama} (Kelas {s.kelas} - Saldo: {formatRupiah(curSaldo)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Transaksi:</label>
                  <input
                    type="date"
                    value={transaksiTanggal}
                    onChange={(e) => setTransaksiTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Transaksi:</label>
                  <select
                    value={transaksiJenis}
                    onChange={(e) => setTransaksiJenis(e.target.value as 'setor' | 'tarik')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="setor">🟢 Setor Tabungan (Masuk)</option>
                    <option value="tarik">🔴 Tarik Tabungan (Keluar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal / Jumlah (Rp):</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={transaksiJumlah}
                    onChange={(e) => setTransaksiJumlah(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                {/* Nominal shortcut badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[10000, 20000, 50000, 100000].map((nom) => (
                    <button
                      key={nom}
                      type="button"
                      onClick={() => setTransaksiJumlah(nom)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition"
                    >
                      {formatRupiah(nom)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan / Keperluan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Setoran pekan ke-4, Beli seragam olahraga, dll"
                  value={transaksiKeterangan}
                  onChange={(e) => setTransaksiKeterangan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalTransaksi(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-900 transition shadow-xs cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: ATUR SALDO AWAL SISWA
         ======================================================== */}
      {showModalSaldoAwal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-700" />
                <h3 className="text-base font-bold text-slate-800">Atur Saldo Awal Tabungan</h3>
              </div>
              <button
                onClick={() => setShowModalSaldoAwal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSaldoAwal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa:</label>
                <select
                  value={saldoAwalSiswaId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSaldoAwalSiswaId(id);
                    const existing = saldoAwalList.find((sa) => sa.siswaId === id);
                    if (existing) {
                      setSaldoAwalNominal(existing.saldoAwal);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Pilih Siswa --</option>
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} (Kelas {s.kelas})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Saldo Awal (Rp):</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={saldoAwalNominal}
                    onChange={(e) => setSaldoAwalNominal(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Penetapan Saldo Awal:</label>
                <input
                  type="date"
                  value={saldoAwalTanggal}
                  onChange={(e) => setSaldoAwalTanggal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalSaldoAwal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-700 text-white font-bold hover:bg-indigo-800 transition shadow-xs cursor-pointer"
                >
                  Tetapkan Saldo Awal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}
