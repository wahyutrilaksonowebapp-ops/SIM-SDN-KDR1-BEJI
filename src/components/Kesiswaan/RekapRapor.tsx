import React, { useState } from 'react';
import { RekapRaporSiswa, ProfilSekolah, UserRole, NilaiTKA, AuthUser } from '../../types';
import { 
  Award, 
  Search, 
  Printer, 
  Download, 
  SlidersHorizontal, 
  CheckCircle2, 
  FileSpreadsheet,
  Edit3,
  X,
  CheckCircle,
  HelpCircle,
  Star,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const MANDATORY_MAPEL = [
  'Pendidikan Agama Islam dan Budi Pekerti (PAI)',
  'Pendidikan Pancasila (PKn)',
  'Bahasa Indonesia (B. Ind)',
  'Matematika (Mtk)',
  'Seni Budaya (SB)',
  'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)',
  'Bahasa Inggris (B. Ing)',
  'Muatan Lokal Bahasa Jawa (B. Jawa)',
];

export const getMapelScore = (semMap: Record<string, number> | undefined, targetMapel: string): number => {
  if (!semMap) return 0;
  if (semMap[targetMapel] !== undefined && semMap[targetMapel] > 0) {
    return Number(semMap[targetMapel]);
  }

  // Fallback alias resolution
  if (targetMapel.includes('PAI') || targetMapel.includes('Agama')) {
    return semMap['Pendidikan Agama Islam'] ?? semMap['PAI'] ?? semMap['Pendidikan Agama Islam dan Budi Pekerti (PAI)'] ?? 0;
  }
  if (targetMapel.includes('Pancasila') || targetMapel.includes('PKn')) {
    return semMap['Pendidikan Pancasila'] ?? semMap['PKn'] ?? semMap['Pendidikan Pancasila (PKn)'] ?? 0;
  }
  if (targetMapel.includes('Indonesia') || targetMapel.includes('Ind')) {
    return semMap['Bahasa Indonesia'] ?? semMap['Bahasa Indonesia (B. Ind)'] ?? 0;
  }
  if (targetMapel.includes('Matematika') || targetMapel.includes('Mtk')) {
    return semMap['Matematika'] ?? semMap['Matematika (Mtk)'] ?? 0;
  }
  if (targetMapel.includes('Seni') || targetMapel.includes('SB')) {
    return semMap['Seni Budaya'] ?? semMap['Seni Budaya (SB)'] ?? 0;
  }
  if (targetMapel.includes('Jasmani') || targetMapel.includes('PJOK')) {
    return semMap['Pendidikan Jasmani & Kesehatan'] ?? semMap['Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)'] ?? 0;
  }
  if (targetMapel.includes('Inggris') || targetMapel.includes('Ing')) {
    return semMap['Bahasa Inggris'] ?? semMap['Bahasa Inggris (B. Ing)'] ?? 86;
  }
  if (targetMapel.includes('Jawa')) {
    return semMap['Bahasa Jawa'] ?? semMap['Muatan Lokal Bahasa Jawa (B. Jawa)'] ?? semMap['Muatan Lokal Bahasa Jawa'] ?? 0;
  }

  return 0;
};

interface RekapRaporProps {
  rapor: RekapRaporSiswa[];
  profil: ProfilSekolah;
  userRole?: UserRole;
  currentUser?: AuthUser;
  onSaveRapor: (rapor: RekapRaporSiswa) => void;
  onOpenTranscriptModal: (item: ProcessedRapor) => void;
  onOpenSKPModal?: (item: ProcessedRapor) => void;
}

export type RaporCalculationMode = '5_semester' | '4_semester';

export interface ProcessedRapor {
  original: RekapRaporSiswa;
  id: string;
  siswaId: string;
  nisn: string;
  namaSiswa: string;
  kelas: number;
  rombel: string;
  mode: RaporCalculationMode;
  semestersIncluded: number[];
  mapelAverages: Record<string, number>;
  totalScore: number;
  overallAverage: number;
  rank: number;
}

export const RekapRapor: React.FC<RekapRaporProps> = ({
  rapor,
  profil,
  userRole = 'admin',
  currentUser,
  onSaveRapor,
  onOpenTranscriptModal,
  onOpenSKPModal,
}) => {
  const [mode, setMode] = useState<RaporCalculationMode>('5_semester');
  const [searchTerm, setSearchTerm] = useState('');
  const [kelasFilter, setKelasFilter] = useState<string>(() => {
    if (currentUser?.role === 'guru' && currentUser?.kelas) {
      return String(currentUser.kelas);
    }
    return '6';
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RekapRaporSiswa | null>(null);

  // Semesters to include:
  // Mode 5 Sem: Sem 7, 8, 9, 10, 11 (Kelas 4 Sem 1 s.d Kelas 6 Sem 1)
  // Mode 4 Sem: Sem 9, 10, 11, 12 (Kelas 5 Sem 1 s.d Kelas 6 Sem 2)
  const targetSemesters = mode === '5_semester' ? [7, 8, 9, 10, 11] : [9, 10, 11, 12];

  // Process and compute averages and ranks
  const processedList: ProcessedRapor[] = rapor
    .map((r) => {
      const semMap: Record<number, Record<string, number>> = {
        7: r.semester7 || {},
        8: r.semester8 || {},
        9: r.semester9 || {},
        10: r.semester10 || {},
        11: r.semester11 || {},
        12: r.semester12 || {},
      };

      const mapelAverages: Record<string, number> = {};
      let sumOfMapelAvgs = 0;
      let validMapelCount = 0;

      MANDATORY_MAPEL.forEach((mapel) => {
        let sum = 0;
        let count = 0;

        targetSemesters.forEach((sem) => {
          const val = getMapelScore(semMap[sem], mapel);
          if (val > 0) {
            sum += Number(val);
            count++;
          }
        });

        const avg = count > 0 ? Number((sum / count).toFixed(2)) : 0;
        mapelAverages[mapel] = avg;

        if (avg > 0) {
          sumOfMapelAvgs += avg;
          validMapelCount++;
        }
      });

      const overallAverage = validMapelCount > 0 ? Number((sumOfMapelAvgs / validMapelCount).toFixed(2)) : 0;

      return {
        original: r,
        id: r.id,
        siswaId: r.siswaId,
        nisn: r.nisn,
        namaSiswa: r.namaSiswa,
        kelas: r.kelas,
        rombel: r.rombel,
        mode,
        semestersIncluded: targetSemesters,
        mapelAverages,
        totalScore: Number(sumOfMapelAvgs.toFixed(2)),
        overallAverage,
        rank: 0,
      };
    })
    .sort((a, b) => b.overallAverage - a.overallAverage)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  // Filtering
  const filtered = processedList.filter((item) => {
    const matchSearch =
      item.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nisn.includes(searchTerm);
    const matchKelas = (userRole === 'guru' && currentUser?.kelas)
      ? item.kelas === currentUser.kelas
      : (kelasFilter === 'ALL' || item.kelas === Number(kelasFilter));
    return matchSearch && matchKelas;
  });

  // Calculate Mapel Benchmarks
  const mapelSchoolAverages: Record<string, number> = {};
  MANDATORY_MAPEL.forEach((m) => {
    const values = filtered.map((f) => f.mapelAverages[m] || 0).filter((v) => v > 0);
    mapelSchoolAverages[m] = values.length > 0 ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0;
  });

  const handleOpenEdit = (item: RekapRaporSiswa) => {
    const cloned: RekapRaporSiswa = JSON.parse(JSON.stringify(item));
    // Ensure TKA exists
    if (!cloned.tka) {
      cloned.tka = {
        numerasi: 88,
        literasi: 90,
        ipaPilihan: 86,
        rataRata: 88.0,
        predikat: 'Sangat Baik',
      };
    }
    setEditingItem(cloned);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      // Recompute TKA average
      if (editingItem.tka) {
        const num = Number(editingItem.tka.numerasi) || 0;
        const lit = Number(editingItem.tka.literasi) || 0;
        const ipa = Number(editingItem.tka.ipaPilihan) || 0;
        const avg = Number(((num + lit + ipa) / 3).toFixed(2));
        editingItem.tka.rataRata = avg;
        editingItem.tka.predikat = avg >= 85 ? 'Sangat Baik' : avg >= 75 ? 'Baik' : 'Cukup';
      }
      onSaveRapor(editingItem);
      setEditModalOpen(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Peringkat',
      'NISN',
      'Nama Siswa',
      'Kelas',
      `Mode (${mode === '5_semester' ? '5 Semester' : '4 Semester'})`,
      ...MANDATORY_MAPEL,
      'Rerata Rapor',
      'TKA Numerasi',
      'TKA Literasi',
      'TKA IPA (Pilihan)',
      'Rerata TKA',
    ];

    const rows = filtered.map((item) => {
      const tka = item.original.tka;
      return [
        item.rank,
        `"${item.nisn}"`,
        `"${item.namaSiswa}"`,
        `"Kelas ${item.kelas}${item.rombel}"`,
        `"${mode}"`,
        ...MANDATORY_MAPEL.map((m) => item.mapelAverages[m] || 0),
        item.overallAverage,
        tka?.numerasi || '-',
        tka?.literasi || '-',
        tka?.ipaPilihan || '-',
        tka?.rataRata || '-',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_Rapor_TKA_SDN_KDR1_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Rekapitulasi Nilai Rapor & TKA Siswa
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Pencatatan nilai rapor mulai <strong>Kelas 4 Sem 1 (Sem 7)</strong> s.d. <strong>Kelas 6 Sem 2 (Sem 12)</strong> dengan 8 Mapel Wajib, Tes Kemampuan Akademik (TKA), dan Surat Keterangan Prestasi (SKP) resmi UPT SDN Kedungringin 1 Beji.
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-slate-100 p-1.5 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setMode('5_semester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === '5_semester'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Opsi 1: Rekap 5 Semester (Sem 7-11)</span>
            </button>
            <button
              onClick={() => setMode('4_semester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === '4_semester'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Opsi 2: Rekap 4 Semester (Sem 9-12)</span>
            </button>
          </div>

          {userRole !== 'guest' && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Notice Banners */}
      {(userRole === 'guest' || userRole === 'siswa') && (
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs flex items-center gap-2.5">
          <HelpCircle className="w-4 h-4 text-slate-600 shrink-0" />
          <span>
            <strong>Mode Guest:</strong> Anda dapat melihat rekap capaian nilai rapor, mengunduh transkrip, dan mencetak <strong>Surat Keterangan Prestasi (SKP)</strong> secara umum. Pembaruan nilai dilakukan oleh Administrator atau Guru kelas terkait.
          </span>
        </div>
      )}

      {userRole === 'guru' && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Mode Guru:</strong> Anda memiliki hak akses menginput dan memperbarui nilai rapor & asesmen TKA untuk <strong>{currentUser?.rombel || `Rombel Kelas ${currentUser?.kelas || ''}`}</strong>.
            </span>
          </div>
          {currentUser?.kelas && (
            <span className="px-2.5 py-0.5 bg-emerald-700 text-white font-bold rounded-md text-[11px] shrink-0">
              Rombel Kelas {currentUser.kelas}
            </span>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama siswa atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <span className="text-slate-500 font-medium">Filter Tingkat:</span>
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
                Kelas {currentUser.kelas} ({currentUser.rombel || 'Tugas Rombel Anda'})
              </option>
            ) : (
              <>
                <option value="6">Kelas 6 Saja ({processedList.filter(p => p.kelas === 6).length})</option>
                <option value="5">Kelas 5 Saja ({processedList.filter(p => p.kelas === 5).length})</option>
                <option value="4">Kelas 4 Saja ({processedList.filter(p => p.kelas === 4).length})</option>
                <option value="ALL">Semua Tingkat ({processedList.length})</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Main Rapor Table with 8 Mandatory Subjects & TKA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-2 text-center w-12">Rank</th>
                <th className="py-3 px-3">Nama Siswa & Identitas</th>
                <th className="py-3 px-2 text-center">Kelas</th>
                <th className="py-3 px-2 text-center" title="Pendidikan Agama Islam dan Budi Pekerti">PAI</th>
                <th className="py-3 px-2 text-center" title="Pendidikan Pancasila">PKn</th>
                <th className="py-3 px-2 text-center" title="Bahasa Indonesia">B. Ind</th>
                <th className="py-3 px-2 text-center" title="Matematika">Mtk</th>
                <th className="py-3 px-2 text-center" title="Seni Budaya">SB</th>
                <th className="py-3 px-2 text-center" title="Pendidikan Jasmani Olahraga dan Kesehatan">PJOK</th>
                <th className="py-3 px-2 text-center" title="Bahasa Inggris">B. Ing</th>
                <th className="py-3 px-2 text-center" title="Muatan Lokal Bahasa Jawa">B. Jawa</th>
                <th className="py-3 px-3 text-center bg-emerald-50 font-extrabold text-emerald-950">Rerata Rapor</th>
                <th className="py-3 px-3 text-center bg-amber-50 font-extrabold text-amber-950">TKA (Num/Lit/IPA)</th>
                <th className="py-3 px-3 text-center">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item, idx) => {
                const tka = item.original.tka;
                return (
                  <tr key={`${item.original.nisn || item.id || 'rr'}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2 text-center font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          item.rank === 1
                            ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 font-black'
                            : item.rank === 2
                            ? 'bg-slate-300 text-slate-900 ring-2 ring-slate-200 font-bold'
                            : item.rank === 3
                            ? 'bg-amber-700 text-white ring-2 ring-amber-600 font-bold'
                            : 'bg-slate-100 text-slate-600 font-medium'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 text-xs">{item.namaSiswa}</div>
                      <div className="text-[10px] font-mono text-slate-500">NISN: {item.nisn}</div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                        {item.kelas}{item.rombel}
                      </span>
                    </td>

                    {/* 8 Mapel Wajib */}
                    {MANDATORY_MAPEL.map((m) => (
                      <td key={m} className="py-3 px-2 text-center font-mono font-medium text-slate-800">
                        {item.mapelAverages[m] > 0 ? item.mapelAverages[m].toFixed(1) : '-'}
                      </td>
                    ))}

                    {/* Overall Average Rapor */}
                    <td className="py-3 px-3 text-center bg-emerald-50/50">
                      <span className="text-xs font-black font-mono text-emerald-800">
                        {item.overallAverage}
                      </span>
                    </td>

                    {/* TKA Summary Column */}
                    <td className="py-3 px-3 text-center bg-amber-50/40">
                      {tka ? (
                        <div className="text-[10px] space-y-0.5">
                          <div className="font-mono font-bold text-amber-900">
                            {tka.numerasi} / {tka.literasi} / {tka.ipaPilihan}
                          </div>
                          <div className="text-[9px] text-amber-700 font-semibold">
                            Rerata: <strong>{tka.rataRata}</strong> ({tka.predikat || 'Baik'})
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Belum Input TKA</span>
                      )}
                    </td>

                    {/* Actions: Transkrip, SKP, and Edit */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenSKPModal?.(item)}
                          title="Cetak Surat Keterangan Prestasi (SKP)"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] transition-colors shadow-2xs cursor-pointer"
                        >
                          <Award className="w-3 h-3 text-amber-300" />
                          <span>SKP</span>
                        </button>

                        <button
                          onClick={() => onOpenTranscriptModal(item)}
                          title="Lihat & Cetak Transkrip Rapor Lengkap"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-[10px] transition-colors shadow-2xs cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Transkrip</span>
                        </button>

                        {(userRole === 'admin' || (userRole === 'guru' && (!currentUser?.kelas || currentUser.kelas === item.kelas))) && (
                          <button
                            onClick={() => handleOpenEdit(item.original)}
                            title={`Input / Edit Nilai Rapor & TKA ${item.namaSiswa}`}
                            className="p-1 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan data rekap rapor siswa yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input & Edit Nilai Rapor (Kelas 4 Sem 1 s.d. Kelas 6 Sem 2) + TKA Modal */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 border border-slate-200 my-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <span>Input / Edit Nilai Rapor & TKA: {editingItem.namaSiswa}</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  NISN: {editingItem.nisn} | Kelas {editingItem.kelas}{editingItem.rombel} | 8 Mapel Wajib + TKA
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-6 text-xs">
              {/* BAGIAN 1: INPUT NILAI RAPOR 8 MAPEL WAJIB (SEMESTER 7 S.D. 12) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>I. Nilai Buku Rapor Semester 7 - 12 (Kelas 4 s.d. 6)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">8 Mata Pelajaran Wajib</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {[
                    { semKey: 'semester7' as const, label: 'Semester 7 (Kelas 4 Sem 1)' },
                    { semKey: 'semester8' as const, label: 'Semester 8 (Kelas 4 Sem 2)' },
                    { semKey: 'semester9' as const, label: 'Semester 9 (Kelas 5 Sem 1)' },
                    { semKey: 'semester10' as const, label: 'Semester 10 (Kelas 5 Sem 2)' },
                    { semKey: 'semester11' as const, label: 'Semester 11 (Kelas 6 Sem 1)' },
                    { semKey: 'semester12' as const, label: 'Semester 12 (Kelas 6 Sem 2)' },
                  ].map(({ semKey, label }) => (
                    <div key={semKey} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <h5 className="font-bold text-slate-900 pb-1 border-b border-slate-200 text-[11px] text-emerald-900">
                        {label}
                      </h5>
                      <div className="space-y-1.5">
                        {MANDATORY_MAPEL.map((m) => {
                          const currentVal = editingItem[semKey]?.[m] ?? getMapelScore(editingItem[semKey], m) ?? '';
                          return (
                            <div key={m} className="flex items-center justify-between gap-1.5">
                              <label className="text-[11px] text-slate-700 truncate max-w-[170px]" title={m}>
                                {m}
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={currentVal}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                                  setEditingItem({
                                    ...editingItem,
                                    [semKey]: {
                                      ...editingItem[semKey],
                                      [m]: val,
                                    },
                                  });
                                }}
                                className="w-14 px-1.5 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                placeholder="0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BAGIAN 2: INPUT TES KEMAMPUAN AKADEMIK (TKA) */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-700" />
                    <span>II. Input Nilai Tes Kemampuan Akademik (TKA)</span>
                  </h4>
                  <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                    2 Mapel Wajib + 1 Mapel Pilihan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Wajib 1: Numerasi */}
                  <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-700">Mapel Wajib 1</span>
                    <label className="block text-[11px] font-bold text-slate-900">
                      Matematika (Numerasi)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editingItem.tka?.numerasi || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditingItem({
                          ...editingItem,
                          tka: {
                            ...(editingItem.tka as NilaiTKA),
                            numerasi: val,
                          },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 text-center font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Wajib 2: Literasi */}
                  <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-700">Mapel Wajib 2</span>
                    <label className="block text-[11px] font-bold text-slate-900">
                      Bahasa Indonesia (Literasi)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editingItem.tka?.literasi || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditingItem({
                          ...editingItem,
                          tka: {
                            ...(editingItem.tka as NilaiTKA),
                            literasi: val,
                          },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 text-center font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Pilihan: IPA */}
                  <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-700">Mapel Pilihan</span>
                    <label className="block text-[11px] font-bold text-slate-900">
                      Ilmu Pengetahuan Alam (IPA)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editingItem.tka?.ipaPilihan || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditingItem({
                          ...editingItem,
                          tka: {
                            ...(editingItem.tka as NilaiTKA),
                            ipaPilihan: val,
                          },
                        });
                      }}
                      className="w-full px-2.5 py-1.5 text-center font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-600">
                  <span>Rerata TKA Terhitung: <strong>
                    {(((editingItem.tka?.numerasi || 0) + (editingItem.tka?.literasi || 0) + (editingItem.tka?.ipaPilihan || 0)) / 3).toFixed(2)}
                  </strong></span>
                  <span className="text-[11px] text-amber-900">Otomatis sinkron ke Surat Keterangan Prestasi (SKP)</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Perubahan Nilai & TKA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
