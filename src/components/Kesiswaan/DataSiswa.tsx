import React, { useState } from 'react';
import { Siswa, ProfilSekolah, UserRole, AuthUser } from '../../types';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Calendar, 
  Filter, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle,
  HelpCircle,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  Printer,
  ShieldAlert
} from 'lucide-react';
import { calculateAge, formatIndoDate } from '../../utils/helpers';
import { ConfirmModal } from '../ConfirmModal';

interface DataSiswaProps {
  siswa: Siswa[];
  profil: ProfilSekolah;
  userRole?: UserRole;
  currentUser?: AuthUser;
  onSaveSiswa: (siswa: Siswa) => void;
  onDeleteSiswa: (id: string) => void;
}

export const DataSiswa: React.FC<DataSiswaProps> = ({
  siswa,
  profil,
  userRole = 'admin',
  currentUser,
  onSaveSiswa,
  onDeleteSiswa,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [kelasFilter, setKelasFilter] = useState<string>(() => {
    if (currentUser?.role === 'guru' && currentUser?.kelas) {
      return String(currentUser.kelas);
    }
    return 'ALL';
  });
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [agamaFilter, setAgamaFilter] = useState<string>('ALL');
  const [usiaFilter, setUsiaFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Siswa>>({
    nisn: '',
    nis: '',
    nama: '',
    jenisKelamin: 'L',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2014-01-01',
    agama: 'Islam',
    kelas: 4,
    rombel: 'A',
    namaAyah: '',
    namaIbu: '',
    alamat: 'Dsn. Kedungringin Beji',
    noHpOrtu: '',
    tmtDiterima: '2020-07-13',
    statusSiswa: 'Aktif',
  });

  const refDate = profil.tanggalAcuanUsia || '2024-07-01';

  // Filtering
  const filtered = siswa.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm) ||
      s.nis.includes(searchTerm);

    const matchKelas = (userRole === 'guru' && currentUser?.kelas)
      ? s.kelas === currentUser.kelas
      : (kelasFilter === 'ALL' || s.kelas === Number(kelasFilter));
    const matchGender = genderFilter === 'ALL' || s.jenisKelamin === genderFilter;
    const matchAgama = agamaFilter === 'ALL' || s.agama === agamaFilter;

    const ageInfo = calculateAge(s.tanggalLahir, refDate);
    let matchUsia = true;
    if (usiaFilter === '<6') matchUsia = ageInfo.years < 6;
    else if (usiaFilter === '6-7') matchUsia = ageInfo.years >= 6 && ageInfo.years <= 7;
    else if (usiaFilter === '8-9') matchUsia = ageInfo.years >= 8 && ageInfo.years <= 9;
    else if (usiaFilter === '10-11') matchUsia = ageInfo.years >= 10 && ageInfo.years <= 11;
    else if (usiaFilter === '12-13') matchUsia = ageInfo.years >= 12 && ageInfo.years <= 13;
    else if (usiaFilter === '>13') matchUsia = ageInfo.years > 13;

    return matchSearch && matchKelas && matchGender && matchAgama && matchUsia;
  });

  // Rekapitulasi Jenis Kelamin & Agama per Kelas
  const rekapPerKelas = [1, 2, 3, 4, 5, 6].map((k) => {
    const siswaKelas = siswa.filter((s) => s.kelas === k);
    return {
      kelas: k,
      total: siswaKelas.length,
      laki: siswaKelas.filter((s) => s.jenisKelamin === 'L').length,
      perempuan: siswaKelas.filter((s) => s.jenisKelamin === 'P').length,
      islam: siswaKelas.filter((s) => s.agama === 'Islam').length,
      kristen: siswaKelas.filter((s) => s.agama === 'Kristen').length,
      katolik: siswaKelas.filter((s) => s.agama === 'Katolik').length,
      hindu: siswaKelas.filter((s) => s.agama === 'Hindu').length,
      buddha: siswaKelas.filter((s) => s.agama === 'Buddha').length,
    };
  });

  const totalRekap = {
    total: rekapPerKelas.reduce((a, b) => a + b.total, 0),
    laki: rekapPerKelas.reduce((a, b) => a + b.laki, 0),
    perempuan: rekapPerKelas.reduce((a, b) => a + b.perempuan, 0),
    islam: rekapPerKelas.reduce((a, b) => a + b.islam, 0),
    kristen: rekapPerKelas.reduce((a, b) => a + b.kristen, 0),
    katolik: rekapPerKelas.reduce((a, b) => a + b.katolik, 0),
    hindu: rekapPerKelas.reduce((a, b) => a + b.hindu, 0),
    buddha: rekapPerKelas.reduce((a, b) => a + b.buddha, 0),
  };

  const [rekapTab, setRekapTab] = useState<'usia_jk_kelas' | 'jk_agama'>('usia_jk_kelas');
  const [showRekapTable, setShowRekapTable] = useState(true);

  // Kategori Kelompok Usia Standar Dapodik
  const AGE_CATEGORIES = [
    { label: '< 7 Tahun', check: (y: number) => y < 7 },
    { label: '7 Tahun', check: (y: number) => y === 7 },
    { label: '8 Tahun', check: (y: number) => y === 8 },
    { label: '9 Tahun', check: (y: number) => y === 9 },
    { label: '10 Tahun', check: (y: number) => y === 10 },
    { label: '11 Tahun', check: (y: number) => y === 11 },
    { label: '12 Tahun', check: (y: number) => y === 12 },
    { label: '> 12 Tahun', check: (y: number) => y > 12 },
  ];

  // Matriks Rekapitulasi Usia x Jenis Kelamin x Kelas
  const rekapUsiaGenderKelas = AGE_CATEGORIES.map((cat) => {
    const classes = [1, 2, 3, 4, 5, 6].map((k) => {
      const matchSiswa = siswa.filter((s) => {
        if (s.kelas !== k) return false;
        const age = calculateAge(s.tanggalLahir, refDate);
        return cat.check(age.years);
      });

      const l = matchSiswa.filter((s) => s.jenisKelamin === 'L').length;
      const p = matchSiswa.filter((s) => s.jenisKelamin === 'P').length;
      return {
        kelas: k,
        l,
        p,
        total: l + p,
      };
    });

    const rowTotalL = classes.reduce((sum, c) => sum + c.l, 0);
    const rowTotalP = classes.reduce((sum, c) => sum + c.p, 0);
    const rowTotal = rowTotalL + rowTotalP;

    return {
      label: cat.label,
      classes,
      totalL: rowTotalL,
      totalP: rowTotalP,
      total: rowTotal,
    };
  });

  // Total Column per class
  const colTotals = [1, 2, 3, 4, 5, 6].map((k) => {
    let l = 0;
    let p = 0;
    rekapUsiaGenderKelas.forEach((row) => {
      const classData = row.classes.find((c) => c.kelas === k);
      if (classData) {
        l += classData.l;
        p += classData.p;
      }
    });
    return {
      kelas: k,
      l,
      p,
      total: l + p,
    };
  });

  const grandTotalL = colTotals.reduce((sum, c) => sum + c.l, 0);
  const grandTotalP = colTotals.reduce((sum, c) => sum + c.p, 0);
  const grandTotal = grandTotalL + grandTotalP;

  const handleExportRekapUsiaCSV = () => {
    const headers = [
      'Rentang Usia',
      'Kls 1 L', 'Kls 1 P', 'Kls 1 Jml',
      'Kls 2 L', 'Kls 2 P', 'Kls 2 Jml',
      'Kls 3 L', 'Kls 3 P', 'Kls 3 Jml',
      'Kls 4 L', 'Kls 4 P', 'Kls 4 Jml',
      'Kls 5 L', 'Kls 5 P', 'Kls 5 Jml',
      'Kls 6 L', 'Kls 6 P', 'Kls 6 Jml',
      'Total L', 'Total P', 'Grand Total'
    ];

    const rows = rekapUsiaGenderKelas.map((r) => {
      const classCols: (string | number)[] = [];
      r.classes.forEach((c) => {
        classCols.push(c.l, c.p, c.total);
      });
      return [`"${r.label}"`, ...classCols, r.totalL, r.totalP, r.total];
    });

    // Add total row
    const totalRowCols: (string | number)[] = [];
    colTotals.forEach((c) => {
      totalRowCols.push(c.l, c.p, c.total);
    });
    rows.push(['"TOTAL SELURUH KELAS"', ...totalRowCols, grandTotalL, grandTotalP, grandTotal]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekapitulasi_Siswa_Usia_JK_Kelas_SDN_KDR1_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAdd = () => {
    setEditingSiswa(null);
    setFormData({
      nisn: '',
      nis: '',
      nama: '',
      jenisKelamin: 'L',
      tempatLahir: 'Pasuruan',
      tanggalLahir: '2014-01-01',
      agama: 'Islam',
      kelas: 1,
      rombel: 'A',
      namaAyah: '',
      namaIbu: '',
      alamat: 'Dsn. Kedungringin Beji',
      noHpOrtu: '',
      tmtDiterima: new Date().toISOString().split('T')[0],
      statusSiswa: 'Aktif',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (s: Siswa) => {
    setEditingSiswa(s);
    setFormData({ ...s });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nisn) {
      setFormError('Nama dan NISN wajib diisi!');
      return;
    }
    setFormError(null);

    const payload: Siswa = {
      id: editingSiswa ? editingSiswa.id : `sis-${Date.now()}`,
      nisn: formData.nisn,
      nis: formData.nis || `2024${Math.floor(Math.random() * 900 + 100)}`,
      nama: formData.nama,
      jenisKelamin: (formData.jenisKelamin || 'L') as 'L' | 'P',
      tempatLahir: formData.tempatLahir || 'Pasuruan',
      tanggalLahir: formData.tanggalLahir || '2014-01-01',
      agama: (formData.agama || 'Islam') as any,
      kelas: Number(formData.kelas || 1),
      rombel: formData.rombel || 'A',
      namaAyah: formData.namaAyah || '-',
      namaIbu: formData.namaIbu || '-',
      alamat: formData.alamat || '-',
      noHpOrtu: formData.noHpOrtu || '-',
      tmtDiterima: formData.tmtDiterima || '2024-07-15',
      statusSiswa: 'Aktif',
    };

    onSaveSiswa(payload);
    setModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['NISN', 'NIS', 'Nama Lengkap', 'Kelas', 'JK', 'Tempat Lahir', 'Tgl Lahir', 'Usia per 1 Juli', 'Agama', 'Alamat', 'HP Ortu'];
    const rows = filtered.map((s) => {
      const age = calculateAge(s.tanggalLahir, refDate);
      return [
        `"${s.nisn}"`,
        `"${s.nis}"`,
        `"${s.nama}"`,
        `"${s.kelas} ${s.rombel}"`,
        `"${s.jenisKelamin}"`,
        `"${s.tempatLahir}"`,
        `"${s.tanggalLahir}"`,
        `"${age.formatted}"`,
        `"${s.agama}"`,
        `"${s.alamat}"`,
        `"${s.noHpOrtu}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Siswa_SDN_Kedungringin_1_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Acuan Usia */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            Data Induk Siswa & Demografi
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen data siswa, filter kelas, jenis kelamin, agama, dan filter usia acuan TMT 1 Juli tahun pelajaran berjalan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Acuan Usia: <strong>{formatIndoDate(refDate)}</strong></span>
          </div>

          {userRole !== 'guest' && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          )}

          {(userRole === 'admin' || userRole === 'guru') && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Notice Banners */}
      {(userRole === 'guest' || userRole === 'siswa') && (
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs flex items-center gap-2.5">
          <HelpCircle className="w-4 h-4 text-slate-600 shrink-0" />
          <span>
            <strong>Mode Guest:</strong> Anda sedang melihat direktori umum kesiswaan SDN Kedungringin 1 Beji (Hanya Lihat). Wewenang merubah data tersedia untuk Administrator dan Guru rombel kelas terkait.
          </span>
        </div>
      )}

      {userRole === 'guru' && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Mode Guru:</strong> Anda memiliki hak akses mengelola dan memperbarui data siswa pada <strong>{currentUser?.rombel || `Rombel Kelas ${currentUser?.kelas || ''}`}</strong>.
            </span>
          </div>
          {currentUser?.kelas && (
            <span className="px-2.5 py-0.5 bg-emerald-700 text-white font-bold rounded-md text-[11px] shrink-0">
              Rombel Kelas {currentUser.kelas}
            </span>
          )}
        </div>
      )}

      {/* Tab Switcher: Rekapitulasi Usia x JK x Kelas VS Rekap JK & Agama */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Statistik & Tabel Rekapitulasi Kesiswaan
            </h4>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setRekapTab('usia_jk_kelas')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  rekapTab === 'usia_jk_kelas'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Rekap Usia, JK & Kelas
              </button>
              <button
                onClick={() => setRekapTab('jk_agama')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  rekapTab === 'jk_agama'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Rekap JK & Agama per Kelas
              </button>
            </div>

            {userRole !== 'guest' && rekapTab === 'usia_jk_kelas' && (
              <button
                onClick={handleExportRekapUsiaCSV}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                title="Unduh Tabel Matriks Usia x JK x Kelas ke CSV"
              >
                <Download className="w-3 h-3" />
                <span>Unduh Matriks CSV</span>
              </button>
            )}

            <button
              onClick={() => setShowRekapTable(!showRekapTable)}
              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer"
              title={showRekapTable ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
            >
              {showRekapTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showRekapTable && (
          <div>
            {/* Indikator Otomatis Rekap Sheet Data Siswa */}
            <div className="p-4 bg-slate-50/60 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Siswa Otomatis</span>
                <div className="text-xl font-extrabold text-emerald-950 font-mono mt-0.5">{siswa.length} Anak</div>
                <span className="text-[10px] text-emerald-700 font-semibold">Tersinkron Sheet Data Siswa</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Laki-Laki (L)</span>
                <div className="text-xl font-extrabold text-blue-900 font-mono mt-0.5">
                  {grandTotalL} <span className="text-xs font-semibold text-slate-500">({grandTotal > 0 ? Math.round((grandTotalL / grandTotal) * 100) : 0}%)</span>
                </div>
                <span className="text-[10px] text-blue-600 font-semibold">Siswa Putra</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Perempuan (P)</span>
                <div className="text-xl font-extrabold text-pink-900 font-mono mt-0.5">
                  {grandTotalP} <span className="text-xs font-semibold text-slate-500">({grandTotal > 0 ? Math.round((grandTotalP / grandTotal) * 100) : 0}%)</span>
                </div>
                <span className="text-[10px] text-pink-600 font-semibold">Siswa Putri</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kelompok Usia & Kelas</span>
                <div className="text-xl font-extrabold text-purple-950 font-mono mt-0.5">6 Rombel</div>
                <span className="text-[10px] text-purple-700 font-semibold">Acuan: {formatIndoDate(refDate)}</span>
              </div>
            </div>

            {rekapTab === 'usia_jk_kelas' ? (
              /* TABEL REKAPITULASI BERDASARKAN USIA, JENIS KELAMIN, DAN KELAS */
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs text-slate-700 border-collapse">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-800 uppercase">
                    <tr>
                      <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-200 text-left bg-slate-200/60">
                        Rentang Usia (Acuan 1 Juli)
                      </th>
                      {[1, 2, 3, 4, 5, 6].map((k) => (
                        <th key={k} colSpan={3} className="py-1 px-2 border-r border-slate-200 bg-emerald-50/70 text-emerald-950 font-extrabold">
                          Kelas {k}
                        </th>
                      ))}
                      <th colSpan={3} className="py-1 px-3 bg-blue-100/70 text-blue-950 font-extrabold">
                        Total Seluruh Kelas
                      </th>
                    </tr>
                    <tr className="border-t border-slate-200 text-[10px] text-slate-600">
                      {[1, 2, 3, 4, 5, 6].map((k) => (
                        <React.Fragment key={k}>
                          <th className="py-1 px-1.5 border-r border-slate-200 text-blue-700 font-semibold">L</th>
                          <th className="py-1 px-1.5 border-r border-slate-200 text-pink-700 font-semibold">P</th>
                          <th className="py-1 px-1.5 border-r border-slate-200 font-bold bg-emerald-100/50 text-slate-900">Jml</th>
                        </React.Fragment>
                      ))}
                      <th className="py-1 px-2 border-r border-slate-200 text-blue-800 font-bold">L</th>
                      <th className="py-1 px-2 border-r border-slate-200 text-pink-800 font-bold">P</th>
                      <th className="py-1 px-2 font-extrabold bg-blue-200/80 text-blue-950">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rekapUsiaGenderKelas.map((row, idx) => (
                      <tr key={row.label} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/70'}>
                        <td className="py-2 px-3 font-bold text-slate-900 text-left border-r border-slate-200">
                          {row.label}
                        </td>
                        {row.classes.map((c) => (
                          <React.Fragment key={c.kelas}>
                            <td className="py-2 px-1.5 border-r border-slate-100 text-blue-600 font-medium">
                              {c.l > 0 ? c.l : '-'}
                            </td>
                            <td className="py-2 px-1.5 border-r border-slate-100 text-pink-600 font-medium">
                              {c.p > 0 ? c.p : '-'}
                            </td>
                            <td className="py-2 px-1.5 border-r border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                              {c.total > 0 ? c.total : '-'}
                            </td>
                          </React.Fragment>
                        ))}
                        <td className="py-2 px-2 border-r border-slate-200 text-blue-800 font-bold bg-blue-50/30">
                          {row.totalL}
                        </td>
                        <td className="py-2 px-2 border-r border-slate-200 text-pink-800 font-bold bg-pink-50/30">
                          {row.totalP}
                        </td>
                        <td className="py-2 px-2 font-extrabold text-blue-950 bg-blue-100/60">
                          {row.total}
                        </td>
                      </tr>
                    ))}

                    {/* Baris Total Keseluruhan Sekolah */}
                    <tr className="bg-emerald-100/80 font-extrabold text-slate-900 border-t-2 border-emerald-400">
                      <td className="py-2.5 px-3 border-r border-slate-200 text-left uppercase text-emerald-950">
                        JUMLAH TOTAL SISWA
                      </td>
                      {colTotals.map((c) => (
                        <React.Fragment key={c.kelas}>
                          <td className="py-2 px-1.5 border-r border-slate-200 text-blue-800 font-extrabold">
                            {c.l}
                          </td>
                          <td className="py-2 px-1.5 border-r border-slate-200 text-pink-800 font-extrabold">
                            {c.p}
                          </td>
                          <td className="py-2 px-1.5 border-r border-slate-200 bg-emerald-200/70 text-emerald-950 font-extrabold">
                            {c.total}
                          </td>
                        </React.Fragment>
                      ))}
                      <td className="py-2 px-2 border-r border-slate-300 text-blue-900 font-extrabold bg-blue-200/60">
                        {grandTotalL}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300 text-pink-900 font-extrabold bg-pink-200/60">
                        {grandTotalP}
                      </td>
                      <td className="py-2 px-2 text-emerald-950 bg-emerald-300/80 font-black text-sm">
                        {grandTotal}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              /* TABEL REKAPITULASI JENIS KELAMIN & AGAMA PER KELAS */
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs text-slate-700">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-semibold text-slate-700">
                    <tr>
                      <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-200">Tingkat Kelas</th>
                      <th colSpan={3} className="py-1 px-3 border-r border-slate-200 bg-blue-50/70 text-blue-900">
                        Jenis Kelamin
                      </th>
                      <th colSpan={5} className="py-1 px-3 bg-amber-50/70 text-amber-900">
                        Agama & Kepercayaan
                      </th>
                    </tr>
                    <tr className="border-t border-slate-200 text-[10px]">
                      <th className="py-1 px-2 border-r border-slate-200">L</th>
                      <th className="py-1 px-2 border-r border-slate-200">P</th>
                      <th className="py-1 px-2 border-r border-slate-200 font-bold bg-blue-100/50">Jml</th>
                      <th className="py-1 px-2">Islam</th>
                      <th className="py-1 px-2">Kristen</th>
                      <th className="py-1 px-2">Katolik</th>
                      <th className="py-1 px-2">Hindu</th>
                      <th className="py-1 px-2">Buddha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rekapPerKelas.map((row) => (
                      <tr key={row.kelas} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">
                          Kelas {row.kelas}
                        </td>
                        <td className="py-2 px-2 border-r border-slate-100 text-blue-600 font-medium">{row.laki}</td>
                        <td className="py-2 px-2 border-r border-slate-100 text-pink-600 font-medium">{row.perempuan}</td>
                        <td className="py-2 px-2 border-r border-slate-200 font-bold bg-blue-50/40 text-slate-900">{row.total}</td>
                        <td className="py-2 px-2 font-medium">{row.islam}</td>
                        <td className="py-2 px-2">{row.kristen}</td>
                        <td className="py-2 px-2">{row.katolik}</td>
                        <td className="py-2 px-2">{row.hindu}</td>
                        <td className="py-2 px-2">{row.buddha}</td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-emerald-50/70 font-bold text-slate-900 border-t-2 border-emerald-300">
                      <td className="py-2 px-3 border-r border-slate-200">TOTAL SEKOLAH</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-blue-700">{totalRekap.laki}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-pink-700">{totalRekap.perempuan}</td>
                      <td className="py-2 px-2 border-r border-slate-200 bg-emerald-100 text-emerald-950">{totalRekap.total}</td>
                      <td className="py-2 px-2">{totalRekap.islam}</td>
                      <td className="py-2 px-2">{totalRekap.kristen}</td>
                      <td className="py-2 px-2">{totalRekap.katolik}</td>
                      <td className="py-2 px-2">{totalRekap.hindu}</td>
                      <td className="py-2 px-2">{totalRekap.buddha}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Tools & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto text-xs">
            {/* Filter Kelas */}
            <select
              value={userRole === 'guru' && currentUser?.kelas ? String(currentUser.kelas) : kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              disabled={userRole === 'guru' && !!currentUser?.kelas}
              className={`px-2.5 py-1.5 border rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                userRole === 'guru' && currentUser?.kelas
                  ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900 cursor-not-allowed'
                  : 'bg-slate-50 border-slate-200 cursor-pointer'
              }`}
            >
              {userRole === 'guru' && currentUser?.kelas ? (
                <option value={String(currentUser.kelas)}>
                  Rombel Kelas {currentUser.kelas} (Tugas Anda)
                </option>
              ) : (
                <>
                  <option value="ALL">Semua Kelas</option>
                  <option value="1">Kelas 1</option>
                  <option value="2">Kelas 2</option>
                  <option value="3">Kelas 3</option>
                  <option value="4">Kelas 4</option>
                  <option value="5">Kelas 5</option>
                  <option value="6">Kelas 6</option>
                </>
              )}
            </select>

            {/* Filter Gender */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">Semua JK</option>
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>

            {/* Filter Agama */}
            <select
              value={agamaFilter}
              onChange={(e) => setAgamaFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">Semua Agama</option>
              <option value="Islam">Islam</option>
              <option value="Kristen">Kristen</option>
              <option value="Katolik">Katolik</option>
              <option value="Hindu">Hindu</option>
            </select>

            {/* Filter Usia (Acuan 1 Juli) */}
            <select
              value={usiaFilter}
              onChange={(e) => setUsiaFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg font-semibold text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">Filter Usia: Semua</option>
              <option value="<6">&lt; 6 Tahun</option>
              <option value="6-7">6 - 7 Tahun</option>
              <option value="8-9">8 - 9 Tahun</option>
              <option value="10-11">10 - 11 Tahun</option>
              <option value="12-13">12 - 13 Tahun</option>
              <option value=">13">&gt; 13 Tahun</option>
            </select>

            {(kelasFilter !== 'ALL' || genderFilter !== 'ALL' || agamaFilter !== 'ALL' || usiaFilter !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setKelasFilter('ALL');
                  setGenderFilter('ALL');
                  setAgamaFilter('ALL');
                  setUsiaFilter('ALL');
                  setSearchTerm('');
                }}
                className="text-slate-500 hover:text-red-600 px-2 py-1 text-xs underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Usia siswa dihitung secara presisi berdasarkan selisih tanggal lahir siswa terhadap tanggal acuan{' '}
            <strong>{formatIndoDate(refDate)}</strong> (Awal Tahun Pelajaran Berjalan).
          </span>
        </div>
      </div>

      {/* Main Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Siswa & NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Jenis Kelamin</th>
                <th className="py-3 px-4">TTL & Usia (per 1 Juli)</th>
                <th className="py-3 px-4">Agama</th>
                <th className="py-3 px-4">Orang Tua & Alamat</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item, idx) => {
                const age = calculateAge(item.tanggalLahir, refDate);
                return (
                  <tr key={`${item.nisn || item.id || 'sis'}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.nama}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        NISN: {item.nisn} | NIS: {item.nis}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                        Kelas {item.kelas} - {item.rombel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          item.jenisKelamin === 'L'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}
                      >
                        {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900">
                        {item.tempatLahir}, {formatIndoDate(item.tanggalLahir)}
                      </div>
                      <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        <span>{age.formatted} ({age.ageCategory})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{item.agama}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-medium">Ayah: {item.namaAyah}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">{item.alamat}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">HP: {item.noHpOrtu}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {userRole === 'admin' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Data Siswa"
                            className="p-1.5 rounded-md text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingId(item.id);
                              setDeletingName(item.nama);
                            }}
                            title="Hapus Siswa"
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : userRole === 'guru' ? (
                        currentUser?.kelas && currentUser.kelas !== item.kelas ? (
                          <span 
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500"
                            title={`Dikelola oleh Guru Kelas ${item.kelas}`}
                          >
                            Kelas {item.kelas}
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title={`Edit Data Siswa Kelas ${item.kelas}`}
                              className="p-1.5 rounded-md text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingId(item.id);
                                setDeletingName(item.nama);
                              }}
                              title="Hapus Siswa Rombel Ini"
                              className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                          Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan data siswa yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Siswa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Contoh: Muhammad Fadhil"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">NISN (10 Digit) *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formData.nisn || ''}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kelas *</label>
                  <select
                    value={formData.kelas || 1}
                    onChange={(e) => setFormData({ ...formData, kelas: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((k) => (
                      <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Rombel</label>
                  <input
                    type="text"
                    value={formData.rombel || 'A'}
                    onChange={(e) => setFormData({ ...formData, rombel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="A / B"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin || 'L'}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempatLahir || ''}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Pasuruan"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalLahir || ''}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Agama</label>
                  <select
                    value={formData.agama || 'Islam'}
                    onChange={(e) => setFormData({ ...formData, agama: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    value={formData.namaAyah || ''}
                    onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Ibu</label>
                  <input
                    type="text"
                    value={formData.namaIbu || ''}
                    onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Alamat Rumah</label>
                  <input
                    type="text"
                    value={formData.alamat || ''}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Dsn. Kedungringin RT.01 RW.02"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">No. HP Orang Tua / WA</label>
                  <input
                    type="text"
                    value={formData.noHpOrtu || ''}
                    onChange={(e) => setFormData({ ...formData, noHpOrtu: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {formError}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Data Siswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus data siswa "${deletingName}" dari pangkalan data?`}
        confirmText="Hapus Siswa"
        cancelText="Batal"
        variant="danger"
        onConfirm={() => {
          if (deletingId) onDeleteSiswa(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
