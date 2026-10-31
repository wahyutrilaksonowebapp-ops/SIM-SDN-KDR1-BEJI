import React, { useState } from 'react';
import { 
  PenilaianHarian, 
  HasilPenilaianSiswa, 
  ProfilSekolah, 
  AuthUser, 
  UserRole,
  Siswa
} from '../../../types';
import { PenilaianHarianForm } from './PenilaianHarianForm';
import { PenilaianHarianCBT } from './PenilaianHarianCBT';
import { PenilaianHarianAnalisis } from './PenilaianHarianAnalisis';
import { KisiKisiModal, KunciJawabanModal, LembarSoalModal } from './PrintDokumenModals';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Printer, 
  Download, 
  Edit3, 
  Trash2, 
  Play, 
  Sparkles,
  BarChart3,
  Users,
  Eye,
  Check,
  X,
  FileCheck2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface PenilaianHarianRootProps {
  profil: ProfilSekolah;
  currentUser: AuthUser;
  userRole?: UserRole;
  siswaList: Siswa[];
  penilaianList: PenilaianHarian[];
  hasilList: HasilPenilaianSiswa[];
  onSavePenilaian: (item: PenilaianHarian) => void;
  onDeletePenilaian: (id: string) => void;
  onSaveHasil: (item: HasilPenilaianSiswa) => void;
}

export const PenilaianHarianRoot: React.FC<PenilaianHarianRootProps> = ({
  profil,
  currentUser,
  userRole = 'guest',
  siswaList,
  penilaianList,
  hasilList,
  onSavePenilaian,
  onDeletePenilaian,
  onSaveHasil,
}) => {
  // Navigation View State
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'cbt' | 'analisis'>('list');
  const [activePenilaian, setActivePenilaian] = useState<PenilaianHarian | null>(null);

  // Filters State
  const [selectedKelas, setSelectedKelas] = useState<string>(() => {
    if (userRole === 'siswa' && currentUser.kelas) return String(currentUser.kelas);
    if (userRole === 'guru' && currentUser.kelas) return String(currentUser.kelas);
    return 'ALL';
  });
  const [selectedMapel, setSelectedMapel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for post-save automated download & direct inspection
  const [modalType, setModalType] = useState<'kisi_kisi' | 'kunci' | 'lembar_soal' | null>(null);
  const [showPostSaveBanner, setShowPostSaveBanner] = useState<PenilaianHarian | null>(null);

  // Student Result Modal State
  const [studentResultModal, setStudentResultModal] = useState<HasilPenilaianSiswa | null>(null);

  // Filter assessments based on role & criteria
  const filteredPenilaian = React.useMemo(() => {
    return penilaianList.filter((item) => {
      // Siswa role: strictly scoped to student's registered class
      if (userRole === 'siswa') {
        const studentKelas = currentUser.kelas || 6;
        if (item.kelas !== studentKelas) return false;
      } else {
        // Teacher / Guest filter
        if (selectedKelas !== 'ALL' && String(item.kelas) !== selectedKelas) return false;
      }

      if (selectedMapel !== 'ALL' && item.mataPelajaran !== selectedMapel) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.judul.toLowerCase().includes(q);
        const matchMateri = item.materiPokok.toLowerCase().includes(q);
        const matchMapel = item.mataPelajaran.toLowerCase().includes(q);
        if (!matchTitle && !matchMateri && !matchMapel) return false;
      }

      return true;
    });
  }, [penilaianList, userRole, currentUser.kelas, selectedKelas, selectedMapel, searchQuery]);

  // Handle Save from Form
  const handleFormSave = (penilaian: PenilaianHarian) => {
    onSavePenilaian(penilaian);
    setViewMode('list');
    setActivePenilaian(penilaian);
    // Otomatis berikan menu unduhan kisi-kisi, kunci jawaban, dan lembar soal
    setShowPostSaveBanner(penilaian);
  };

  // Launch CBT mode
  const handleStartCBT = (item: PenilaianHarian) => {
    setActivePenilaian(item);
    setViewMode('cbt');
  };

  // Open Analysis mode
  const handleOpenAnalysis = (item: PenilaianHarian) => {
    setActivePenilaian(item);
    setViewMode('analisis');
  };

  // View Student Result
  const handleViewStudentResult = (item: PenilaianHarian) => {
    const studentNisn = currentUser.nisn;
    const existing = hasilList.find(
      (h) => h.penilaianId === item.id && (h.nisn === studentNisn || h.namaSiswa === currentUser.name)
    );
    if (existing) {
      setStudentResultModal(existing);
    }
  };

  // Submit from CBT runner
  const handleCBTSubmit = (hasil: HasilPenilaianSiswa) => {
    onSaveHasil(hasil);
    setViewMode('list');
    setStudentResultModal(hasil);
  };

  // Extract distinct mapel for filter
  const distinctMapel = React.useMemo(() => {
    const set = new Set<string>();
    penilaianList.forEach((p) => set.add(p.mataPelajaran));
    return Array.from(set);
  }, [penilaianList]);

  // Active CBT View
  if (viewMode === 'cbt' && activePenilaian) {
    return (
      <PenilaianHarianCBT
        penilaian={activePenilaian}
        currentUser={currentUser}
        onSubmit={handleCBTSubmit}
        onExit={() => setViewMode('list')}
      />
    );
  }

  // Active Analisis View
  if (viewMode === 'analisis' && activePenilaian) {
    return (
      <PenilaianHarianAnalisis
        penilaian={activePenilaian}
        hasilList={hasilList}
        profil={profil}
        currentUser={currentUser}
        onUpdateHasil={onSaveHasil}
        onBack={() => setViewMode('list')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner Penilaian Harian */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/60 text-emerald-200 border border-emerald-500/40">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Modul Penilaian Harian (CBT & Kurikulum Merdeka)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {userRole === 'siswa' ? `Penilaian Harian Kelas ${currentUser.kelas || 6}` : 'Penilaian Harian Siswa'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {userRole === 'siswa'
                ? 'Portal pengerjaan asesmen mandiri berbasis komputer (CBT). Kerjakan ulangan harian, pantau skor real-time, dan telusuri pembahasan nilai Anda.'
                : 'Penyusunan instrumen tes cerdas by AI, cetak otomatis kisi-kisi dan kunci jawaban, koreksi instan PG & PGK, serta analisis ketuntasan hasil pengerjaan siswa.'}
            </p>
          </div>

          {/* Action button for Guru / Admin */}
          {(userRole === 'guru' || userRole === 'admin') && viewMode === 'list' && (
            <button
              onClick={() => {
                setActivePenilaian(null);
                setViewMode('create');
              }}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer self-start md:self-center shrink-0"
            >
              <Plus className="w-4 h-4 stroke-3" />
              <span>Buat Penilaian Harian Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Automated Post-Save Download Menu Banner */}
      {showPostSaveBanner && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 shadow-sm animate-in fade-in zoom-in-95 duration-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  Penilaian Harian Berhasil Disimpan & Diterbitkan!
                </h4>
                <p className="text-xs text-emerald-800">
                  Instrumen <strong>{showPostSaveBanner.judul}</strong> ({showPostSaveBanner.mataPelajaran}) telah tersimpan. Silakan unduh atau cetak dokumen kelengkapan berikut:
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPostSaveBanner(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => {
                setActivePenilaian(showPostSaveBanner);
                setModalType('kisi_kisi');
              }}
              className="px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>1. Unduh / Cetak Kisi-Kisi Soal</span>
            </button>

            <button
              onClick={() => {
                setActivePenilaian(showPostSaveBanner);
                setModalType('kunci');
              }}
              className="px-4 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>2. Unduh Kunci & Pedoman Penskoran</span>
            </button>

            <button
              onClick={() => {
                setActivePenilaian(showPostSaveBanner);
                setModalType('lembar_soal');
              }}
              className="px-4 py-2 rounded-xl bg-white border border-blue-300 hover:bg-blue-100 text-blue-900 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-700" />
              <span>3. Unduh Lembar Soal Siswa</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Create / Edit Form View */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <PenilaianHarianForm
          profil={profil}
          currentUser={currentUser}
          existingPenilaian={activePenilaian}
          onSave={handleFormSave}
          onCancel={() => setViewMode('list')}
        />
      )}

      {/* 4. Filter Toolbar & List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Kelas Filter (Guru & Guest can pick; Siswa locked) */}
              {userRole !== 'siswa' && (
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="ALL">Semua Kelas (1–6)</option>
                  <option value="1">Kelas 1</option>
                  <option value="2">Kelas 2</option>
                  <option value="3">Kelas 3</option>
                  <option value="4">Kelas 4</option>
                  <option value="5">Kelas 5</option>
                  <option value="6">Kelas 6</option>
                </select>
              )}

              {/* Mapel Filter */}
              <select
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-xs truncate"
              >
                <option value="ALL">Semua Mata Pelajaran</option>
                {distinctMapel.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari materi pokok atau judul tes..."
                className="w-full sm:w-64 pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPenilaian.map((item) => {
              // Calculate student submission state
              const studentNisn = currentUser.nisn;
              const studentSubmission = hasilList.find(
                (h) => h.penilaianId === item.id && (h.nisn === studentNisn || h.namaSiswa === currentUser.name)
              );

              // Submissions count for teacher
              const submissionsForTest = hasilList.filter((h) => h.penilaianId === item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5 space-y-3">
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Kelas {item.kelas} ({item.rombel || 'A'})
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono font-semibold">
                        KKTP: {item.kkm}
                      </span>
                    </div>

                    {/* Judul & Mapel */}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                        {item.judul}
                      </h3>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5">{item.mataPelajaran}</p>
                    </div>

                    {/* Materi Pokok & Detail */}
                    <div className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      <strong>Materi:</strong> {item.materiPokok}
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>{item.soalList.length} Butir Soal</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.durasiMenit} Menit</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Card based on Role */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-2">
                    {/* SISWA ROLE */}
                    {userRole === 'siswa' && (
                      <div>
                        {studentSubmission ? (
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Nilai Anda:</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className={`text-lg font-black ${
                                  studentSubmission.nilaiAkhir >= item.kkm ? 'text-emerald-700' : 'text-rose-700'
                                }`}>
                                  {studentSubmission.nilaiAkhir}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-700">
                                  {studentSubmission.statusKelulusan}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleViewStudentResult(item)}
                              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                            >
                              Lihat Hasil
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartCBT(item)}
                            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Mulai Kerjakan (CBT)</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* GURU / ADMIN ROLE */}
                    {(userRole === 'guru' || userRole === 'admin') && (
                      <div className="space-y-2">
                        {/* Action buttons: Analisis Siswa */}
                        <button
                          onClick={() => handleOpenAnalysis(item)}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Analisis Hasil Siswa ({submissionsForTest.length})</span>
                        </button>

                        {/* Dropdown / button row: Dokumen Kisi-kisi, Kunci, Lembar Soal */}
                        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-slate-700">
                          <button
                            onClick={() => {
                              setActivePenilaian(item);
                              setModalType('kisi_kisi');
                            }}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-center transition cursor-pointer truncate"
                            title="Unduh / Cetak Kisi-kisi Soal"
                          >
                            Kisi-Kisi
                          </button>
                          <button
                            onClick={() => {
                              setActivePenilaian(item);
                              setModalType('kunci');
                            }}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-center transition cursor-pointer truncate"
                            title="Unduh / Cetak Kunci Jawaban"
                          >
                            Kunci & Rubrik
                          </button>
                          <button
                            onClick={() => {
                              setActivePenilaian(item);
                              setModalType('lembar_soal');
                            }}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-center transition cursor-pointer truncate"
                            title="Unduh / Cetak Lembar Soal Siswa"
                          >
                            Lembar Soal
                          </button>
                        </div>
                      </div>
                    )}

                    {/* GUEST ROLE */}
                    {userRole === 'guest' && (
                      <div className="space-y-1.5">
                        <button
                          onClick={() => handleStartCBT(item)}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Simulasi Mandiri CBT</span>
                        </button>

                        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-slate-700">
                          <button
                            onClick={() => {
                              setActivePenilaian(item);
                              setModalType('kisi_kisi');
                            }}
                            className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-center transition cursor-pointer"
                          >
                            Kisi-Kisi
                          </button>
                          <button
                            onClick={() => {
                              setActivePenilaian(item);
                              setModalType('kunci');
                            }}
                            className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-center transition cursor-pointer"
                          >
                            Kunci
                          </button>
                          <button
                            onClick={() => {
                              setActivePenilaian(item);
                              setModalType('lembar_soal');
                            }}
                            className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-center transition cursor-pointer"
                          >
                            Soal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPenilaian.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold">Tidak ditemukan Penilaian Harian yang sesuai.</p>
              <p className="text-xs">Silakan ubah filter kelas, mata pelajaran, atau buat penilaian harian baru.</p>
            </div>
          )}
        </div>
      )}

      {/* 5. Document Modals: Kisi-Kisi, Kunci Jawaban, Lembar Soal */}
      {modalType === 'kisi_kisi' && activePenilaian && (
        <KisiKisiModal
          penilaian={activePenilaian}
          profil={profil}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'kunci' && activePenilaian && (
        <KunciJawabanModal
          penilaian={activePenilaian}
          profil={profil}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'lembar_soal' && activePenilaian && (
        <LembarSoalModal
          penilaian={activePenilaian}
          profil={profil}
          onClose={() => setModalType(null)}
        />
      )}

      {/* 6. Student Result Detail Modal (Lihat Hasil) */}
      {studentResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in duration-150">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Hasil Penilaian Harian Anda</h3>
                  <p className="text-xs text-slate-400">
                    {studentResultModal.mataPelajaran} • {studentResultModal.namaSiswa}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStudentResultModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
              {/* Score card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-blue-900 block">Nilai Capaian Akhir:</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-blue-900 font-mono">
                      {studentResultModal.nilaiAkhir}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/ 100</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Skor Perolehan: <strong>{studentResultModal.totalSkorPerolehan}</strong> dari total {studentResultModal.totalSkorMaksimal} poin
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                    studentResultModal.nilaiAkhir >= 75 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {studentResultModal.statusKelulusan}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Status: {studentResultModal.statusKoreksi === 'sudah_dikoreksi' ? 'Selesai Dikoreksi' : 'Menunggu Nilai Isian/Uraian'}
                  </p>
                </div>
              </div>

              {/* Catatan Evaluasi Guru */}
              {studentResultModal.catatanEvaluasi && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    Catatan Umpan Balik Guru:
                  </p>
                  <p className="text-slate-700 leading-relaxed italic text-[11px]">
                    "{studentResultModal.catatanEvaluasi}"
                  </p>
                </div>
              )}

              {/* Rincian Jawaban per butir */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Rincian Lembar Jawaban:</h4>
                <div className="space-y-2">
                  {studentResultModal.jawaban.map((j) => (
                    <div key={j.soalId} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-800">
                          {j.nomor}
                        </span>
                        <div>
                          <span className="uppercase text-[10px] font-bold text-slate-500 mr-2">{j.tipe}</span>
                          <span className="font-semibold text-slate-800">
                            Jawaban: {Array.isArray(j.jawabanSiswa) ? j.jawabanSiswa.join(', ') : String(j.jawabanSiswa)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-700">
                          {j.skorFinal} / {j.skorMaksimal} pt
                        </span>
                        {j.isCorrectAuto !== undefined && (
                          j.isCorrectAuto ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setStudentResultModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs transition cursor-pointer hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
