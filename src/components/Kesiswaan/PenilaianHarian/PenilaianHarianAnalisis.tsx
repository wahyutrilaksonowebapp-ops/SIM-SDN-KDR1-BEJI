import React, { useState, useMemo } from 'react';
import { PenilaianHarian, HasilPenilaianSiswa, ProfilSekolah, AuthUser } from '../../../types';
import { 
  BarChart3, 
  Users, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Printer, 
  Download, 
  Edit3, 
  Check, 
  X, 
  Save, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  ChevronDown
} from 'lucide-react';

interface PenilaianHarianAnalisisProps {
  penilaian: PenilaianHarian;
  hasilList: HasilPenilaianSiswa[];
  profil: ProfilSekolah;
  currentUser: AuthUser;
  onUpdateHasil: (updated: HasilPenilaianSiswa) => void;
  onBack: () => void;
}

export const PenilaianHarianAnalisis: React.FC<PenilaianHarianAnalisisProps> = ({
  penilaian,
  hasilList,
  profil,
  currentUser,
  onUpdateHasil,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Tuntas' | 'Belum Tuntas' | 'Menunggu Koreksi'>('ALL');
  
  // Student correction modal state
  const [selectedHasil, setSelectedHasil] = useState<HasilPenilaianSiswa | null>(null);
  const [editingAnswers, setEditingAnswers] = useState<Record<string, { skorManual: number; catatanGuru: string }>>({});
  const [catatanUmum, setCatatanUmum] = useState('');

  // Filtered submissions for this test
  const testSubmissions = useMemo(() => {
    return hasilList.filter((h) => h.penilaianId === penilaian.id);
  }, [hasilList, penilaian.id]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalPeserta = testSubmissions.length;
    if (totalPeserta === 0) {
      return {
        totalPeserta: 0,
        rataRata: 0,
        nilaiTertinggi: 0,
        nilaiTerendah: 0,
        tuntasCount: 0,
        belumTuntasCount: 0,
        persenTuntas: 0,
        menungguKoreksiCount: 0,
      };
    }

    const scores = testSubmissions.map((s) => s.nilaiAkhir);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / totalPeserta);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const tuntas = testSubmissions.filter((s) => s.nilaiAkhir >= penilaian.kkm).length;
    const belumTuntas = totalPeserta - tuntas;
    const menunggu = testSubmissions.filter((s) => s.statusKoreksi === 'menunggu_koreksi_manual').length;

    return {
      totalPeserta,
      rataRata: avg,
      nilaiTertinggi: max,
      nilaiTerendah: min,
      tuntasCount: tuntas,
      belumTuntasCount: belumTuntas,
      persenTuntas: Math.round((tuntas / totalPeserta) * 100),
      menungguKoreksiCount: menunggu,
    };
  }, [testSubmissions, penilaian.kkm]);

  // Analisis Butir Soal (% benar per nomor)
  const itemAnalysis = useMemo(() => {
    return penilaian.soalList.map((soal) => {
      let correctCount = 0;
      let totalAnswered = 0;

      testSubmissions.forEach((sub) => {
        const item = sub.jawaban.find((j) => j.soalId === soal.id);
        if (item) {
          totalAnswered++;
          if (soal.tipe === 'pg' || soal.tipe === 'pgk') {
            if (item.isCorrectAuto || item.skorFinal === soal.bobotPoin) correctCount++;
          } else {
            // isian or uraian: if score is >= half
            if (item.skorFinal >= soal.bobotPoin / 2) correctCount++;
          }
        }
      });

      const percent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      let tingkatKesukaran = 'Sedang';
      if (percent >= 75) tingkatKesukaran = 'Mudah';
      else if (percent < 40) tingkatKesukaran = 'Sukar';

      return {
        nomor: soal.nomor,
        tipe: soal.tipe,
        level: soal.levelKognitif || 'C2',
        bobot: soal.bobotPoin,
        correctCount,
        totalAnswered,
        percent,
        tingkatKesukaran,
      };
    });
  }, [penilaian.soalList, testSubmissions]);

  // Filtered submissions list
  const filteredSubmissions = useMemo(() => {
    return testSubmissions.filter((sub) => {
      const matchSearch = sub.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.nisn.includes(searchTerm);
      
      let matchStatus = true;
      if (statusFilter === 'Tuntas') matchStatus = sub.nilaiAkhir >= penilaian.kkm;
      else if (statusFilter === 'Belum Tuntas') matchStatus = sub.nilaiAkhir < penilaian.kkm;
      else if (statusFilter === 'Menunggu Koreksi') matchStatus = sub.statusKoreksi === 'menunggu_koreksi_manual';

      return matchSearch && matchStatus;
    });
  }, [testSubmissions, searchTerm, statusFilter, penilaian.kkm]);

  // Open correction modal for a student
  const openCorrectionModal = (sub: HasilPenilaianSiswa) => {
    setSelectedHasil(sub);
    const initialEdits: Record<string, { skorManual: number; catatanGuru: string }> = {};
    sub.jawaban.forEach((j) => {
      initialEdits[j.soalId] = {
        skorManual: j.skorManual !== undefined ? j.skorManual : j.skorFinal,
        catatanGuru: j.catatanGuru || '',
      };
    });
    setEditingAnswers(initialEdits);
    setCatatanUmum(sub.catatanEvaluasi || '');
  };

  // Save teacher correction
  const handleSaveCorrection = () => {
    if (!selectedHasil) return;

    let totalScore = 0;
    const updatedJawaban = selectedHasil.jawaban.map((j) => {
      const edits = editingAnswers[j.soalId];
      let finalScore = j.skorFinal;
      let manualScore = j.skorManual;
      let notes = j.catatanGuru;

      if (edits) {
        if (j.tipe === 'isian' || j.tipe === 'uraian') {
          manualScore = Math.min(j.skorMaksimal, Math.max(0, edits.skorManual));
          finalScore = manualScore;
        } else {
          finalScore = edits.skorManual !== undefined ? edits.skorManual : j.skorFinal;
        }
        notes = edits.catatanGuru;
      }

      totalScore += finalScore;

      return {
        ...j,
        skorManual: manualScore,
        skorFinal: finalScore,
        catatanGuru: notes,
      };
    });

    const totalMax = selectedHasil.totalSkorMaksimal;
    const nilaiAkhir = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    const updatedHasil: HasilPenilaianSiswa = {
      ...selectedHasil,
      jawaban: updatedJawaban,
      totalSkorPerolehan: totalScore,
      nilaiAkhir,
      statusKoreksi: 'sudah_dikoreksi',
      statusKelulusan: nilaiAkhir >= penilaian.kkm ? 'Tuntas' : 'Belum Tuntas',
      catatanEvaluasi: catatanUmum || (nilaiAkhir >= penilaian.kkm ? 'Tuntas mencapai indikator pembelajaran.' : 'Perlu penguatan dan remedial.'),
      dikoreksiOleh: currentUser.name || 'Guru SDN Kedungringin 1',
      tanggalKoreksi: new Date().toISOString(),
    };

    onUpdateHasil(updatedHasil);
    setSelectedHasil(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (testSubmissions.length === 0) return;
    const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Total Skor', 'Skor Maksimal', 'Nilai Akhir', 'KKTP', 'Status Kelulusan', 'Status Koreksi'];
    const rows = testSubmissions.map((s, idx) => [
      idx + 1,
      `'${s.nisn}`,
      `"${s.namaSiswa}"`,
      `Kelas ${s.kelas}`,
      s.totalSkorPerolehan,
      s.totalSkorMaksimal,
      s.nilaiAkhir,
      penilaian.kkm,
      s.statusKelulusan,
      s.statusKoreksi
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_${penilaian.kodeUjian}_${penilaian.mataPelajaran.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Analisis Hasil Siswa
              </span>
              <span className="text-xs text-slate-400">Kode: {penilaian.kodeUjian}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{penilaian.judul}</h2>
            <p className="text-xs text-slate-300 mt-1">
              Mata Pelajaran: <strong>{penilaian.mataPelajaran}</strong> • Kelas {penilaian.kelas} • KKTP: <strong>{penilaian.kkm}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md"
            >
              Kembali ke Daftar Soal
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Nilai Rata-rata, Ketuntasan, Tertinggi, Terendah */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Rata-Rata Kelas</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{stats.rataRata}</span>
            <span className="text-[11px] text-slate-500 font-mono">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">KKTP Minimum: {penilaian.kkm}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Ketuntasan Belajar</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700">{stats.persenTuntas}%</span>
            <span className="text-[11px] text-slate-500 font-mono">({stats.tuntasCount} Siswa)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Belum Tuntas: {stats.belumTuntasCount} Siswa</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Nilai Tertinggi / Terendah</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900">{stats.nilaiTertinggi}</span>
            <span className="text-slate-400">/</span>
            <span className="text-xl font-bold text-slate-600">{stats.nilaiTerendah}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Rentang sebaran capaian</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Menunggu Koreksi Guru</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-700">{stats.menungguKoreksiCount}</span>
            <span className="text-[11px] text-slate-500 font-mono">Siswa</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Soal Isian & Uraian</p>
        </div>
      </div>

      {/* Analisis Butir Soal Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Analisis Daya Serap & Butir Soal</span>
            </h3>
            <p className="text-xs text-slate-500">Persentase siswa yang menjawab benar pada tiap butir soal</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {penilaian.soalList.length} Butir Soal
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
          {itemAnalysis.map((item) => {
            let color = 'bg-emerald-50 border-emerald-200 text-emerald-800';
            if (item.percent < 40) color = 'bg-rose-50 border-rose-200 text-rose-800';
            else if (item.percent < 70) color = 'bg-amber-50 border-amber-200 text-amber-800';

            return (
              <div key={item.nomor} className={`p-2.5 rounded-xl border ${color} text-center space-y-1`}>
                <div className="font-mono font-bold text-xs">No. {item.nomor}</div>
                <div className="text-[10px] uppercase font-semibold text-slate-500">{item.tipe} ({item.level})</div>
                <div className="text-sm font-black">{item.percent}%</div>
                <div className="text-[9px] font-medium tracking-tight">{item.tingkatKesukaran}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Banner Tindak Lanjut Remedial & Pengayaan */}
      {stats.belumTuntasCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-950 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-xs">
                Terdapat {stats.belumTuntasCount} siswa dengan nilai di bawah KKTP ({penilaian.kkm})
              </h4>
              <p className="text-[11px] text-amber-800/90">
                Sistem siap menyusun materi perbaikan terarah (scaffolding) & butir soal remedial secara otomatis melalui AI berdasarkan soal-soal yang belum dikuasai siswa.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-3.5 py-2 rounded-xl border border-amber-300 shrink-0">
            Tersedia di Tab "Remedial &amp; Pengayaan"
          </span>
        </div>
      )}

      {/* Tabel Rekap Pengerjaan Siswa */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Daftar Nilai & Hasil Siswa</span>
            </h3>
            <p className="text-xs text-slate-500">Rekapitulasi nilai dan status koreksi hasil ujian mandiri siswa</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama / NISN siswa..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="Tuntas">Tuntas (&gt;= {penilaian.kkm})</option>
              <option value="Belum Tuntas">Belum Tuntas (&lt; {penilaian.kkm})</option>
              <option value="Menunggu Koreksi">Menunggu Koreksi Guru</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="p-3 text-center w-12">No</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">NISN</th>
                <th className="p-3 text-center">Skor PG</th>
                <th className="p-3 text-center">Skor PGK</th>
                <th className="p-3 text-center">Skor Isian</th>
                <th className="p-3 text-center">Skor Uraian</th>
                <th className="p-3 text-center">Total Skor</th>
                <th className="p-3 text-center">Nilai Akhir</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub, idx) => {
                  const pgScore = sub.jawaban.filter((j) => j.tipe === 'pg').reduce((a, b) => a + b.skorFinal, 0);
                  const pgkScore = sub.jawaban.filter((j) => j.tipe === 'pgk').reduce((a, b) => a + b.skorFinal, 0);
                  const isianScore = sub.jawaban.filter((j) => j.tipe === 'isian').reduce((a, b) => a + b.skorFinal, 0);
                  const uraianScore = sub.jawaban.filter((j) => j.tipe === 'uraian').reduce((a, b) => a + b.skorFinal, 0);

                  const isTuntas = sub.nilaiAkhir >= penilaian.kkm;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{sub.namaSiswa}</td>
                      <td className="p-3 font-mono text-slate-600">{sub.nisn}</td>
                      <td className="p-3 text-center font-mono font-semibold text-blue-700">{pgScore}</td>
                      <td className="p-3 text-center font-mono font-semibold text-emerald-700">{pgkScore}</td>
                      <td className="p-3 text-center font-mono font-semibold text-purple-700">{isianScore}</td>
                      <td className="p-3 text-center font-mono font-semibold text-amber-700">{uraianScore}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900">
                        {sub.totalSkorPerolehan} / {sub.totalSkorMaksimal}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                          isTuntas ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                        }`}>
                          {sub.nilaiAkhir}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isTuntas ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sub.statusKelulusan}
                          </span>
                          {sub.statusKoreksi === 'menunggu_koreksi_manual' && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-medium">
                              Perlu Nilai Guru
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openCorrectionModal(sub)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs border border-blue-200 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Koreksi / Nilai</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500">
                    Belum ada pengerjaan siswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Koreksi Lembar Pengerjaan Siswa */}
      {selectedHasil && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Lembar Koreksi & Penilaian Guru</h3>
                  <p className="text-[11px] text-slate-400">
                    Siswa: <strong className="text-white">{selectedHasil.namaSiswa}</strong> ({selectedHasil.nisn}) • {penilaian.mataPelajaran}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHasil(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
              {/* Petunjuk Kebijakan Guru */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Kebijakan Penilaian & Pembobotan Guru:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Pilihan Ganda & PGK telah dikoreksi otomatis (1 poin). Berikan penilaian bijak untuk <strong>Isian (0-2 poin)</strong> dan <strong>Uraian (0-3 poin)</strong> berdasarkan kedalaman pemahaman siswa.
                </p>
              </div>

              {/* Daftar Soal & Jawaban Siswa */}
              <div className="space-y-4">
                {selectedHasil.jawaban.map((j) => {
                  const soalInfo = penilaian.soalList.find((s) => s.id === j.soalId);
                  const isManualType = j.tipe === 'isian' || j.tipe === 'uraian';
                  const currentEdit = editingAnswers[j.soalId] || { skorManual: j.skorFinal, catatanGuru: '' };

                  return (
                    <div key={j.soalId} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800">
                            {j.nomor}
                          </span>
                          <span className="uppercase text-[11px] text-slate-500 font-semibold">Tipe: {j.tipe}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600">
                          Maksimal: {j.skorMaksimal} Poin
                        </span>
                      </div>

                      {/* Pertanyaan */}
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {soalInfo?.pertanyaan || 'Pertanyaan tidak ditemukan'}
                      </p>

                      {/* Jawaban Siswa */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-[11px] text-slate-600 block">Jawaban Peserta Didik:</span>
                        <p className="font-medium text-slate-900 whitespace-pre-line text-xs">
                          {Array.isArray(j.jawabanSiswa) 
                            ? (j.jawabanSiswa.length > 0 ? j.jawabanSiswa.join(', ') : '(Tidak memilih opsi)')
                            : (String(j.jawabanSiswa).trim() || '(Tidak menjawab)')
                          }
                        </p>
                      </div>

                      {/* Kunci Jawaban Resmi */}
                      <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200 text-emerald-950 text-[11px] space-y-0.5">
                        <span className="font-bold">Kunci Jawaban / Kriteria:</span>
                        <p className="font-mono">{Array.isArray(j.kunciJawaban) ? j.kunciJawaban.join(', ') : String(j.kunciJawaban)}</p>
                      </div>

                      {/* Input Nilai Guru */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          <label className="font-bold text-slate-700">Skor / Poin Guru:</label>
                          <input
                            type="number"
                            min={0}
                            max={j.skorMaksimal}
                            value={currentEdit.skorManual}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setEditingAnswers((prev) => ({
                                ...prev,
                                [j.soalId]: {
                                  ...prev[j.soalId],
                                  skorManual: Math.min(j.skorMaksimal, Math.max(0, val)),
                                },
                              }));
                            }}
                            className="w-16 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-900 text-sm focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-slate-500 font-mono text-xs">/ {j.skorMaksimal}</span>
                        </div>

                        <div className="flex-1">
                          <input
                            type="text"
                            value={currentEdit.catatanGuru}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingAnswers((prev) => ({
                                ...prev,
                                [j.soalId]: {
                                  ...prev[j.soalId],
                                  catatanGuru: val,
                                },
                              }));
                            }}
                            placeholder="Catatan umpan balik butir soal..."
                            className="w-full px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catatan Umum Evaluasi Siswa */}
              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-slate-800 text-xs block">Catatan Evaluasi Umum Siswa:</label>
                <textarea
                  rows={3}
                  value={catatanUmum}
                  onChange={(e) => setCatatanUmum(e.target.value)}
                  placeholder="Berikan umpan balik menyeluruh terhadap capaian dan tindak lanjut remedial/pengayaan..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setSelectedHasil(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCorrection}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Hasil Penilaian</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
