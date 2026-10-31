import React, { useState } from 'react';
import { 
  ProgramRemedialPengayaan, 
  SiswaRemedialPengayaanItem,
  PenilaianHarian, 
  HasilPenilaianSiswa, 
  ProfilSekolah, 
  AuthUser, 
  UserRole,
  Siswa 
} from '../../../types';
import { RemedialGeneratorModal } from './RemedialGeneratorModal';
import { CetakDokumenRemedialModal } from './CetakDokumenRemedialModal';
import { InputNilaiPerbaikanModal } from './InputNilaiPerbaikanModal';
import { KerjakanTugasRemedialModal } from './KerjakanTugasRemedialModal';
import { RekomendasiStrategiAIModal } from './RekomendasiStrategiAIModal';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  TrendingUp, 
  BookOpen, 
  Award, 
  Calendar, 
  Trash2, 
  Edit3,
  Brain, 
  Eye, 
  Play
} from 'lucide-react';

interface RemedialPengayaanRootProps {
  profil: ProfilSekolah;
  currentUser: AuthUser;
  userRole?: UserRole;
  siswaList: Siswa[];
  penilaianList: PenilaianHarian[];
  hasilList: HasilPenilaianSiswa[];
  remedialList: ProgramRemedialPengayaan[];
  onSaveProgram: (p: ProgramRemedialPengayaan) => void;
  onDeleteProgram: (id: string) => void;
  onSaveSubmission: (programId: string, siswaId: string, answers: Record<number, string>, calculatedScore: number) => void;
}

export const RemedialPengayaanRoot: React.FC<RemedialPengayaanRootProps> = ({
  profil,
  currentUser,
  userRole = 'guest',
  siswaList,
  penilaianList,
  hasilList,
  remedialList,
  onSaveProgram,
  onDeleteProgram,
  onSaveSubmission,
}) => {
  const isSiswa = userRole === 'siswa';
  const isGuest = userRole === 'guest';
  const isGuru = userRole === 'guru' || userRole === 'admin';

  // Filters
  const [activeTab, setActiveTab] = useState<'semua' | 'remedial' | 'pengayaan' | 'radar_kkm'>('semua');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorPreFill, setGeneratorPreFill] = useState<{
    penilaianId?: string;
    siswaIds?: string[];
    jenis?: 'remedial' | 'pengayaan';
  }>({});

  const [activePrintProgram, setActivePrintProgram] = useState<ProgramRemedialPengayaan | null>(null);
  const [activeScoringProgram, setActiveScoringProgram] = useState<ProgramRemedialPengayaan | null>(null);
  const [activeTaskRunnerProgram, setActiveTaskRunnerProgram] = useState<ProgramRemedialPengayaan | null>(null);
  const [activeStrategyModal, setActiveStrategyModal] = useState<{
    siswa: SiswaRemedialPengayaanItem;
    mataPelajaran: string;
    materiPokok: string;
  } | null>(null);

  // Scan students whose score is below KKM from hasilList
  const failingStudents = hasilList.filter((h) => {
    const penRef = penilaianList.find((p) => p.id === h.penilaianId);
    const kkm = penRef?.kkm || 75;
    return h.nilaiAkhir < kkm;
  });

  // Calculate statistics
  const totalRemedialActive = remedialList.filter((p) => p.jenis === 'remedial').length;
  const totalPengayaanActive = remedialList.filter((p) => p.jenis === 'pengayaan').length;

  let totalCompletedRemedials = 0;
  let totalScoreGains = 0;

  remedialList.forEach((prog) => {
    if (prog.jenis === 'remedial') {
      prog.daftarSiswa.forEach((s) => {
        if (s.status === 'Tuntas Perbaikan' && s.nilaiPerbaikan !== undefined) {
          totalCompletedRemedials += 1;
          totalScoreGains += (s.nilaiPerbaikan - s.nilaiAwal);
        }
      });
    }
  });

  const averageScoreGain = totalCompletedRemedials > 0 ? (totalScoreGains / totalCompletedRemedials).toFixed(1) : '35.0';

  // Filtered Programs
  const filteredPrograms = remedialList.filter((prog) => {
    // If student, only show assignments where this student is enrolled
    if (isSiswa) {
      const isEnrolled = prog.daftarSiswa.some(
        (s) => (currentUser.nisn && s.nisn === currentUser.nisn) || s.namaSiswa.toLowerCase().includes(currentUser.name.toLowerCase())
      );
      if (!isEnrolled) return false;
    }

    if (activeTab === 'remedial' && prog.jenis !== 'remedial') return false;
    if (activeTab === 'pengayaan' && prog.jenis !== 'pengayaan') return false;

    if (filterKelas !== 'all' && String(prog.kelas) !== filterKelas) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = prog.judul.toLowerCase().includes(q);
      const matchMapel = prog.mataPelajaran.toLowerCase().includes(q);
      const matchMateri = prog.materiPokok.toLowerCase().includes(q);
      const matchSiswa = prog.daftarSiswa.some((s) => s.namaSiswa.toLowerCase().includes(q));
      if (!matchTitle && !matchMapel && !matchMateri && !matchSiswa) return false;
    }

    return true;
  });

  const handleQuickCreateRemedialFromFailing = (penilaianId?: string, siswaId?: string) => {
    setGeneratorPreFill({
      penilaianId,
      siswaIds: siswaId ? [siswaId] : [],
      jenis: 'remedial',
    });
    setIsGeneratorOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-sm border border-emerald-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-400/30">
              Kurikulum Merdeka Asesmen
            </span>
            <span className="text-xs text-emerald-200">SDN Kedungringin 1 Beji</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Modul Remedial &amp; Pengayaan Berbasis AI</span>
            <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300/30" />
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
            Sistem otomatis mendeteksi siswa yang nilainya di bawah KKTP/KKM, mengidentifikasi butir materi yang belum dikuasai, dan menghasilkan paket perbaikan (scaffolding &amp; soal remedial) melalui AI.
          </p>
        </div>

        {isGuru && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setGeneratorPreFill({ jenis: 'remedial' });
                setIsGeneratorOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ Buat Remedial AI (&lt; KKM)</span>
            </button>
            <button
              onClick={() => {
                setGeneratorPreFill({ jenis: 'pengayaan' });
                setIsGeneratorOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer border border-emerald-400/40"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pengayaan HOTS</span>
            </button>
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Siswa Terdeteksi &lt; KKM</p>
            <h4 className="text-lg font-black text-slate-900">{failingStudents.length} Siswa</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Program Remedial Aktif</p>
            <h4 className="text-lg font-black text-slate-900">{totalRemedialActive} Paket</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Program Pengayaan HOTS</p>
            <h4 className="text-lg font-black text-slate-900">{totalPengayaanActive} Paket</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Rata-rata Kenaikan Nilai</p>
            <h4 className="text-lg font-black text-emerald-700">+{averageScoreGain} Poin</h4>
          </div>
        </div>
      </div>

      {/* Radar Box: Siswa Terdeteksi Butuh Remedial */}
      {failingStudents.length > 0 && isGuru && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-amber-950 text-sm">
                Radar Deteksi Kebutuhan Remedial: {failingStudents.length} Siswa Perlu Intervensi Perbaikan
              </h3>
            </div>
            <span className="text-[11px] text-amber-800 font-semibold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              Standar KKTP: 75
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {failingStudents.map((fail) => {
              const penRef = penilaianList.find((p) => p.id === fail.penilaianId);
              // Extract missed questions
              const missedList: string[] = [];
              if (fail.jawaban && penRef) {
                fail.jawaban.forEach((j) => {
                  if (j.skorFinal < j.skorMaksimal) {
                    const sRef = penRef.soalList.find((s) => s.id === j.soalId || s.nomor === j.nomor);
                    if (sRef?.indikatorSoal) missedList.push(sRef.indikatorSoal);
                  }
                });
              }

              return (
                <div key={fail.id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{fail.namaSiswa}</h4>
                        <p className="text-[10px] text-slate-500">
                          Kelas {fail.kelas} {fail.rombel} • NISN: {fail.nisn} • Mapel: <span className="font-semibold text-slate-700">{fail.mataPelajaran}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
                          {fail.nilaiAkhir} / 100
                        </span>
                        <span className="text-[9px] block text-slate-500 mt-0.5">KKTP: {penRef?.kkm || 75}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-700 mb-1">Materi/Indikator Belum Dikuasai:</p>
                      <div className="flex flex-wrap gap-1">
                        {(missedList.length > 0 ? missedList.slice(0, 3) : ['Konsep ' + penRef?.materiPokok]).map((m, mIdx) => (
                          <span key={mIdx} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[9px] font-medium">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickCreateRemedialFromFailing(fail.penilaianId, fail.siswaId)}
                      className="flex items-center justify-center gap-1.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ Buat Tugas Remedial</span>
                    </button>
                    <button
                      onClick={() => {
                        const dummyItem: SiswaRemedialPengayaanItem = {
                          siswaId: fail.siswaId,
                          nisn: fail.nisn,
                          namaSiswa: fail.namaSiswa,
                          kelas: fail.kelas,
                          rombel: fail.rombel,
                          nilaiAwal: fail.nilaiAkhir,
                          kkm: penRef?.kkm || 75,
                          materiBelumDikuasai: missedList.length > 0 ? missedList : [penRef?.materiPokok || 'Materi Pokok'],
                          status: 'Belum Mengumpulkan'
                        };
                        setActiveStrategyModal({
                          siswa: dummyItem,
                          mataPelajaran: fail.mataPelajaran,
                          materiPokok: penRef?.materiPokok || 'Materi Pokok'
                        });
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <Brain className="w-3.5 h-3.5 text-purple-700" />
                      <span>🧠 Strategi &amp; Materi AI</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'semua' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Program ({remedialList.length})
          </button>
          <button
            onClick={() => setActiveTab('remedial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'remedial' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Remedial &lt; KKM ({totalRemedialActive})
          </button>
          <button
            onClick={() => setActiveTab('pengayaan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pengayaan' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pengayaan HOTS ({totalPengayaanActive})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari program, materi, atau siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="all">Semua Kelas</option>
            <option value="1">Kelas 1</option>
            <option value="2">Kelas 2</option>
            <option value="3">Kelas 3</option>
            <option value="4">Kelas 4</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
          </select>
        </div>
      </div>

      {/* Program Cards / List */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Belum Ada Program Remedial &amp; Pengayaan</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {isSiswa
              ? 'Selamat! Saat ini Anda tidak memiliki penugasan remedial yang perlu dikerjakan.'
              : 'Gunakan tombol "Buat Remedial AI" untuk merancang tugas perbaikan secara otomatis berdasarkan analisis asesmen.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrograms.map((program) => {
            const isRem = program.jenis === 'remedial';
            const totalSiswa = program.daftarSiswa.length;
            const completedCount = program.daftarSiswa.filter((s) => s.status === 'Tuntas Perbaikan').length;
            const progressPercent = totalSiswa > 0 ? Math.round((completedCount / totalSiswa) * 100) : 0;

            return (
              <div
                key={program.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                        isRem ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}>
                        {isRem ? 'Program Remedial (< KKM)' : 'Program Pengayaan (HOTS)'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {program.judul}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {program.mataPelajaran} • <span className="font-semibold text-slate-700">Kelas {program.kelas} {program.rombel}</span> • KKTP: {program.kkm}
                      </p>
                    </div>

                    <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {program.kodeProgram}
                    </span>
                  </div>

                  {/* Scaffolding Micro Summary */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 text-[11px] line-clamp-3 leading-relaxed">
                    <span className="font-bold text-slate-800">Ringkasan Konsep: </span>
                    {program.ringkasanMateriScaffolding}
                  </div>

                  {/* Students Enrolled List */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Siswa Penerima Tugas ({totalSiswa} Siswa):</span>
                      </span>
                      <span className="font-bold text-emerald-700">{completedCount}/{totalSiswa} Tuntas</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {program.daftarSiswa.map((sis) => (
                        <span
                          key={sis.siswaId}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            sis.status === 'Tuntas Perbaikan'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <span>{sis.namaSiswa}</span>
                          {sis.nilaiPerbaikan !== undefined && (
                            <span className="font-bold text-emerald-900">({sis.nilaiPerbaikan})</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActivePrintProgram(program)}
                      title="Cetak Lembar Tugas & Berita Acara"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Cetak Dokumen</span>
                    </button>

                    {isGuru && (
                      <button
                        onClick={() => setActiveScoringProgram(program)}
                        title="Input Nilai Hasil Perbaikan Siswa"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Input Nilai Perbaikan</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveTaskRunnerProgram(program)}
                      title={isSiswa ? 'Kerjakan Tugas Remedial' : 'Pratinjau Lembar Siswa'}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{isSiswa ? 'Kerjakan Tugas' : 'Pratinjau Siswa'}</span>
                    </button>

                    {isGuru && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus paket ${program.judul}?`)) {
                            onDeleteProgram(program.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus Program"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {isGeneratorOpen && (
        <RemedialGeneratorModal
          penilaianList={penilaianList}
          hasilList={hasilList}
          siswaList={siswaList}
          currentUser={currentUser}
          preSelectedPenilaianId={generatorPreFill.penilaianId}
          preSelectedSiswaIds={generatorPreFill.siswaIds}
          initialJenis={generatorPreFill.jenis || 'remedial'}
          onSave={(newProg) => {
            onSaveProgram(newProg);
            setIsGeneratorOpen(false);
          }}
          onClose={() => setIsGeneratorOpen(false)}
        />
      )}

      {activePrintProgram && (
        <CetakDokumenRemedialModal
          program={activePrintProgram}
          profil={profil}
          onClose={() => setActivePrintProgram(null)}
        />
      )}

      {activeScoringProgram && (
        <InputNilaiPerbaikanModal
          program={activeScoringProgram}
          onSave={(updated) => {
            onSaveProgram(updated);
            setActiveScoringProgram(null);
          }}
          onClose={() => setActiveScoringProgram(null)}
        />
      )}

      {activeTaskRunnerProgram && (
        <KerjakanTugasRemedialModal
          program={activeTaskRunnerProgram}
          currentUser={currentUser}
          onSaveSubmission={(progId, siswaId, answers, score) => {
            onSaveSubmission(progId, siswaId, answers, score);
            setActiveTaskRunnerProgram(null);
          }}
          onClose={() => setActiveTaskRunnerProgram(null)}
        />
      )}

      {activeStrategyModal && (
        <RekomendasiStrategiAIModal
          siswa={activeStrategyModal.siswa}
          mataPelajaran={activeStrategyModal.mataPelajaran}
          materiPokok={activeStrategyModal.materiPokok}
          profil={profil}
          currentUser={currentUser}
          onSaveToStudentNotes={(siswaId, updatedNotes) => {
            // Update notes across remedialList
            const updatedProg = remedialList.find((p) =>
              p.daftarSiswa.some((s) => s.siswaId === siswaId)
            );
            if (updatedProg) {
              const newDaftar = updatedProg.daftarSiswa.map((s) =>
                s.siswaId === siswaId ? { ...s, catatanGuru: updatedNotes } : s
              );
              onSaveProgram({ ...updatedProg, daftarSiswa: newDaftar });
            }
          }}
          onClose={() => setActiveStrategyModal(null)}
        />
      )}
    </div>
  );
};
