import React, { useState, useEffect } from 'react';
import { 
  ProgramRemedialPengayaan, 
  PenilaianHarian, 
  HasilPenilaianSiswa, 
  Siswa, 
  AuthUser,
  ButirSoalRemedial,
  SiswaRemedialPengayaanItem
} from '../../../types';
import { generateRemedialWithAI } from '../../../services/api';
import { 
  Sparkles, 
  X, 
  Check, 
  AlertCircle, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';

interface RemedialGeneratorModalProps {
  penilaianList: PenilaianHarian[];
  hasilList: HasilPenilaianSiswa[];
  siswaList: Siswa[];
  currentUser: AuthUser;
  preSelectedPenilaianId?: string;
  preSelectedSiswaIds?: string[];
  initialJenis?: 'remedial' | 'pengayaan';
  onSave: (program: ProgramRemedialPengayaan) => void;
  onClose: () => void;
}

export const RemedialGeneratorModal: React.FC<RemedialGeneratorModalProps> = ({
  penilaianList,
  hasilList,
  siswaList,
  currentUser,
  preSelectedPenilaianId,
  preSelectedSiswaIds = [],
  initialJenis = 'remedial',
  onSave,
  onClose,
}) => {
  const isGuruKelas = Boolean(currentUser.kelas) || Boolean(currentUser.jabatan && currentUser.jabatan.toUpperCase().includes('KELAS'));
  const defaultKelas = currentUser.kelas || 6;

  // Selected Penilaian Harian
  const [selectedPenilaianId, setSelectedPenilaianId] = useState<string>(preSelectedPenilaianId || (penilaianList[0]?.id || ''));
  const currentPenilaian = penilaianList.find((p) => p.id === selectedPenilaianId);

  // Form Fields
  const [jenis, setJenis] = useState<'remedial' | 'pengayaan'>(initialJenis);
  const [mataPelajaran, setMataPelajaran] = useState(currentPenilaian?.mataPelajaran || 'Ilmu Pengetahuan Alam dan Sosial (IPAS)');
  const [kelas, setKelas] = useState<number>(currentPenilaian?.kelas || defaultKelas);
  const [rombel, setRombel] = useState(currentPenilaian?.rombel || 'A');
  const [materiPokok, setMateriPokok] = useState(currentPenilaian?.materiPokok || 'Sistem Gerak Manusia');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState(currentPenilaian?.tujuanPembelajaran || 'Mengidentifikasi sistem gerak dan upaya perawatannya');
  const [kkm, setKkm] = useState<number>(currentPenilaian?.kkm || 75);
  const [batasWaktu, setBatasWaktu] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Selected Students
  const [selectedSiswaList, setSelectedSiswaList] = useState<SiswaRemedialPengayaanItem[]>([]);
  const [materiBelumDikuasaiTags, setMateriBelumDikuasaiTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState<{
    judul: string;
    ringkasanMateriScaffolding: string;
    rekomendasiMetodeGuru?: string;
    soalList: ButirSoalRemedial[];
  } | null>(null);

  // Synchronize when selectedPenilaianId or jenis changes
  useEffect(() => {
    if (currentPenilaian) {
      setMataPelajaran(currentPenilaian.mataPelajaran);
      setKelas(currentPenilaian.kelas);
      setRombel(currentPenilaian.rombel);
      setMateriPokok(currentPenilaian.materiPokok);
      setTujuanPembelajaran(currentPenilaian.tujuanPembelajaran);
      setKkm(currentPenilaian.kkm || 75);

      // Find results for this penilaian
      const results = hasilList.filter((h) => h.penilaianId === currentPenilaian.id);

      // Collect missed questions from results
      const missedIndicators = new Set<string>();
      results.forEach((res) => {
        if (res.jawaban) {
          res.jawaban.forEach((j) => {
            if (j.skorFinal < j.skorMaksimal) {
              const soalRef = currentPenilaian.soalList.find((s) => s.id === j.soalId || s.nomor === j.nomor);
              if (soalRef?.indikatorSoal) {
                missedIndicators.add(soalRef.indikatorSoal);
              }
            }
          });
        }
      });

      if (missedIndicators.size > 0) {
        setMateriBelumDikuasaiTags(Array.from(missedIndicators).slice(0, 4));
      } else {
        setMateriBelumDikuasaiTags([
          'Pemahaman konsep kunci materi pokok',
          'Pembedaan kategori dan mekanisme fungsi',
          'Penerapan pola pemecahan masalah kontekstual'
        ]);
      }

      // Filter students based on jenis
      const candidateStudents: SiswaRemedialPengayaanItem[] = [];

      results.forEach((res) => {
        const isTarget = jenis === 'remedial' ? res.nilaiAkhir < (currentPenilaian.kkm || 75) : res.nilaiAkhir >= (currentPenilaian.kkm || 75);
        if (isTarget) {
          const missedForSiswa: string[] = [];
          if (res.jawaban) {
            res.jawaban.forEach((j) => {
              if (j.skorFinal < j.skorMaksimal) {
                const sRef = currentPenilaian.soalList.find((s) => s.id === j.soalId || s.nomor === j.nomor);
                if (sRef?.indikatorSoal) missedForSiswa.push(sRef.indikatorSoal);
              }
            });
          }

          candidateStudents.push({
            siswaId: res.siswaId,
            nisn: res.nisn,
            namaSiswa: res.namaSiswa,
            kelas: res.kelas,
            rombel: res.rombel,
            nilaiAwal: res.nilaiAkhir,
            kkm: currentPenilaian.kkm || 75,
            materiBelumDikuasai: missedForSiswa.length > 0 ? missedForSiswa : [currentPenilaian.materiPokok],
            status: 'Belum Mengumpulkan'
          });
        }
      });

      // If no candidate from results, fallback to filtered student list of the class
      if (candidateStudents.length === 0) {
        const classStudents = siswaList.filter((s) => s.kelas === currentPenilaian.kelas);
        classStudents.slice(0, 2).forEach((s) => {
          candidateStudents.push({
            siswaId: s.id,
            nisn: s.nisn,
            namaSiswa: s.nama,
            kelas: s.kelas,
            rombel: s.rombel || 'A',
            nilaiAwal: jenis === 'remedial' ? 55 : 88,
            kkm: currentPenilaian.kkm || 75,
            materiBelumDikuasai: [currentPenilaian.materiPokok],
            status: 'Belum Mengumpulkan'
          });
        });
      }

      setSelectedSiswaList(candidateStudents);
    }
  }, [selectedPenilaianId, jenis, currentPenilaian, hasilList, siswaList]);

  // Handle adding custom topic tag
  const handleAddTag = () => {
    if (newTagInput.trim()) {
      setMateriBelumDikuasaiTags((prev) => [...prev, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (idx: number) => {
    setMateriBelumDikuasaiTags((prev) => prev.filter((_, i) => i !== idx));
  };

  // Toggle student selection
  const handleToggleStudent = (siswaId: string) => {
    setSelectedSiswaList((prev) => {
      const exists = prev.some((s) => s.siswaId === siswaId);
      if (exists) {
        return prev.filter((s) => s.siswaId !== siswaId);
      } else {
        const found = siswaList.find((s) => s.id === siswaId);
        if (!found) return prev;
        return [
          ...prev,
          {
            siswaId: found.id,
            nisn: found.nisn,
            namaSiswa: found.nama,
            kelas: found.kelas,
            rombel: found.rombel || 'A',
            nilaiAwal: jenis === 'remedial' ? 58 : 90,
            kkm,
            materiBelumDikuasai: materiBelumDikuasaiTags,
            status: 'Belum Mengumpulkan'
          }
        ];
      }
    });
  };

  // AI Generation Trigger
  const handleGenerateAI = async () => {
    if (selectedSiswaList.length === 0) {
      alert('Pilihlah minimal satu siswa penerima tugas perbaikan.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateRemedialWithAI({
        jenis,
        mataPelajaran,
        kelas,
        materiPokok,
        tujuanPembelajaran,
        materiBelumDikuasai: materiBelumDikuasaiTags,
        daftarNamaSiswa: selectedSiswaList.map((s) => s.namaSiswa),
        jumlahSoal: 5
      });

      setAiGeneratedData({
        judul: res.judul || `${jenis === 'remedial' ? 'Program Remedial: ' : 'Program Pengayaan: '}${materiPokok}`,
        ringkasanMateriScaffolding: res.ringkasanMateriScaffolding || '',
        rekomendasiMetodeGuru: res.rekomendasiMetodeGuru || '',
        soalList: res.soalList || []
      });
    } catch (err: any) {
      console.error('Error generating remedial with AI:', err);
      alert('Gagal menghasilkan program remedial dengan AI: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGeneratedData) {
      alert('Silakan klik "Generate Tugas by AI" terlebih dahulu untuk menyusun materi dan butir soal.');
      return;
    }

    if (selectedSiswaList.length === 0) {
      alert('Tentukan minimal 1 siswa penerima penugasan.');
      return;
    }

    const uniqueCode = `${jenis === 'remedial' ? 'REM' : 'PENG'}-${mataPelajaran.substring(0, 4).toUpperCase().trim()}-${kelas}-${Date.now().toString().slice(-4)}`;

    const newProgram: ProgramRemedialPengayaan = {
      id: `prog-${Date.now()}`,
      kodeProgram: uniqueCode,
      judul: aiGeneratedData.judul,
      jenis,
      mataPelajaran,
      kelas,
      rombel,
      materiPokok,
      tujuanPembelajaran,
      penilaianHarianId: selectedPenilaianId || undefined,
      kkm,
      tanggalDibuat: new Date().toISOString().split('T')[0],
      batasWaktu,
      guruPengampu: currentUser.name || 'Guru SDN Kedungringin 1',
      guruNip: currentUser.nip,
      ringkasanMateriScaffolding: aiGeneratedData.ringkasanMateriScaffolding,
      daftarSiswa: selectedSiswaList,
      soalList: aiGeneratedData.soalList,
      status: 'aktif',
      rekomendasiMetodeGuru: aiGeneratedData.rekomendasiMetodeGuru
    };

    onSave(newProgram);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 text-emerald-300 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Buat Penugasan Remedial & Pengayaan Otomatis by AI
              </h3>
              <p className="text-xs text-emerald-200">
                Deteksi siswa di bawah KKM & rancang tugas perbaikan scaffolding Kurikulum Merdeka
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSaveProgram} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Tipe Program & Sumber Asesmen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Jenis Program <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJenis('remedial')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                    jenis === 'remedial'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Remedial (&lt; KKM)
                </button>
                <button
                  type="button"
                  onClick={() => setJenis('pengayaan')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                    jenis === 'pengayaan'
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Pengayaan (HOTS)
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tautkan Sumber Penilaian Harian
              </label>
              <select
                value={selectedPenilaianId}
                onChange={(e) => setSelectedPenilaianId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {penilaianList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.kodeUjian} - {p.judul} (Kelas {p.kelas} - {p.mataPelajaran})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mapel, Kelas, Materi */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                value={mataPelajaran}
                onChange={(e) => setMataPelajaran(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tingkat Kelas</label>
              <input
                type="number"
                disabled={isGuruKelas}
                value={kelas}
                onChange={(e) => setKelas(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Standar KKTP (KKM)</label>
              <input
                type="number"
                value={kkm}
                onChange={(e) => setKkm(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Materi Pokok</label>
              <input
                type="text"
                value={materiPokok}
                onChange={(e) => setMateriPokok(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Batas Waktu Pengumpulan</label>
              <input
                type="date"
                value={batasWaktu}
                onChange={(e) => setBatasWaktu(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Materi / Indikator yang Belum Dikuasai (Target Perbaikan) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800">
                Fokus Materi / Indikator yang {jenis === 'remedial' ? 'Belum Dikuasai Siswa' : 'Akan Diperdalam (HOTS)'}:
              </label>
              <span className="text-[10px] text-slate-500">Otomatis dideteksi dari analisis jawaban salah</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
              {materiBelumDikuasaiTags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-semibold border border-amber-200"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tIdx)}
                    className="hover:text-red-700 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ketik materi spesifik & tekan Enter..."
                  className="w-full px-2 py-1 bg-transparent border-none text-xs focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="p-1 text-slate-500 hover:text-emerald-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Daftar Siswa Penerima Tugas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>
                  Siswa Terpilih ({selectedSiswaList.length} Siswa {jenis === 'remedial' ? 'Butuh Remedial' : 'Penerima Pengayaan'}):
                </span>
              </label>
              <span className="text-[10px] text-slate-500">
                {jenis === 'remedial' ? 'Siswa dengan nilai < KKTP otomatis terpilih' : 'Siswa dengan nilai >= KKTP'}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              {siswaList
                .filter((s) => s.kelas === kelas)
                .map((sis) => {
                  const isChecked = selectedSiswaList.some((s) => s.siswaId === sis.id);
                  const matchedResult = hasilList.find(
                    (h) => h.penilaianId === selectedPenilaianId && (h.siswaId === sis.id || h.nisn === sis.nisn)
                  );
                  const scoreDisplay = matchedResult ? matchedResult.nilaiAkhir : '-';
                  const isFailing = matchedResult && matchedResult.nilaiAkhir < kkm;

                  return (
                    <label
                      key={sis.id}
                      className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-50/70 font-semibold text-emerald-950' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStudent(sis.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-bold">{sis.nama}</span>
                          <span className="text-[10px] text-slate-500 ml-2">NISN: {sis.nisn}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {matchedResult && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isFailing ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            Nilai: {scoreDisplay} {isFailing ? '(< KKM)' : '(Tuntas)'}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
            </div>
          </div>

          {/* Tombol AI Generator */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateAI}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                isGenerating
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Menghubungkan Gemini 3.8 Flash & Menyusun Scaffolding Remedial...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>✨ Generate Tugas &amp; Soal {jenis === 'remedial' ? 'Remedial' : 'Pengayaan'} by AI</span>
                </>
              )}
            </button>
          </div>

          {/* AI Preview Section */}
          {aiGeneratedData && (
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Hasil Penyusunan Materi &amp; Soal Perbaikan AI</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  5 Butir Soal Terarah
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">Judul Program</label>
                <input
                  type="text"
                  value={aiGeneratedData.judul}
                  onChange={(e) => setAiGeneratedData({ ...aiGeneratedData, judul: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Rangkuman Materi &amp; Panduan Konsep Siswa (Scaffolding):
                </label>
                <textarea
                  rows={4}
                  value={aiGeneratedData.ringkasanMateriScaffolding}
                  onChange={(e) => setAiGeneratedData({ ...aiGeneratedData, ringkasanMateriScaffolding: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs leading-relaxed text-slate-700"
                />
              </div>

              {aiGeneratedData.rekomendasiMetodeGuru && (
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-emerald-900 text-[11px]">
                  <strong>Saran Metode Guru:</strong> {aiGeneratedData.rekomendasiMetodeGuru}
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-slate-800">
                  Pratinjau Butir Soal Perbaikan:
                </label>
                {aiGeneratedData.soalList.map((soal, sIdx) => (
                  <div key={sIdx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-800">{soal.nomor}. {soal.pertanyaan}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[9px] uppercase">
                        {soal.tipe}
                      </span>
                    </div>
                    {soal.opsi && (
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pl-4">
                        {soal.opsi.map((o, oIdx) => <div key={oIdx}>{o}</div>)}
                      </div>
                    )}
                    <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded flex items-center justify-between">
                      <span><strong>Kunci:</strong> {soal.kunciJawaban}</span>
                      {soal.petunjukPengerjaan && <span><strong>Petunjuk:</strong> {soal.petunjukPengerjaan}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!aiGeneratedData}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold shadow-xs transition-colors cursor-pointer ${
                aiGeneratedData
                  ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Simpan &amp; Terbitkan Penugasan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
