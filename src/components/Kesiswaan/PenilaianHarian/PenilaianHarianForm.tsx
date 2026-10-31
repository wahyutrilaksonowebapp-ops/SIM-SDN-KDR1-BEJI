import React, { useState, useEffect } from 'react';
import { PenilaianHarian, SoalItem, ProfilSekolah, AuthUser } from '../../../types';
import { generatePenilaianWithAI } from '../../../services/api';
import { 
  Sparkles, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  AlertCircle, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  RefreshCw,
  FileText,
  Award
} from 'lucide-react';

interface PenilaianHarianFormProps {
  profil: ProfilSekolah;
  currentUser: AuthUser;
  onSave: (penilaian: PenilaianHarian) => void;
  onCancel: () => void;
  existingPenilaian?: PenilaianHarian | null;
}

const MAPEL_OPTIONS = [
  'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
  'Pendidikan Agama Islam dan Budi Pekerti (PAI)',
  'Bahasa Indonesia (B. Ind)',
  'Matematika (Mtk)',
  'Pendidikan Pancasila (PKn)',
  'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)',
  'Bahasa Inggris (B. Ing)',
  'Muatan Lokal Bahasa Jawa (B. Jawa)',
  'Seni Budaya (SB)'
];

export const PenilaianHarianForm: React.FC<PenilaianHarianFormProps> = ({
  profil,
  currentUser,
  onSave,
  onCancel,
  existingPenilaian,
}) => {
  // Determine if current user is a "Guru Kelas" or "Guru Mapel"
  const isGuruKelas = React.useMemo(() => {
    if (currentUser.role !== 'guru') return false;
    const jab = (currentUser.jabatan || '').toUpperCase();
    return jab.includes('KELAS') || !!currentUser.kelas;
  }, [currentUser]);

  const defaultKelas = currentUser.kelas || 6;

  // Form State
  const [mataPelajaran, setMataPelajaran] = useState(existingPenilaian?.mataPelajaran || 'Ilmu Pengetahuan Alam dan Sosial (IPAS)');
  const [kelas, setKelas] = useState<number>(existingPenilaian?.kelas || defaultKelas);
  const [rombel, setRombel] = useState(existingPenilaian?.rombel || 'A');
  const [materiPokok, setMateriPokok] = useState(existingPenilaian?.materiPokok || '');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState(existingPenilaian?.tujuanPembelajaran || '');
  const [durasiMenit, setDurasiMenit] = useState<number>(existingPenilaian?.durasiMenit || 60);
  const [kkm, setKkm] = useState<number>(existingPenilaian?.kkm || 75);
  
  // Komposisi Soal State
  const [totalSoal, setTotalSoal] = useState<number>(existingPenilaian?.soalList.length || 10);
  const [countPG, setCountPG] = useState<number>(4);
  const [countPGK, setCountPGK] = useState<number>(2);
  const [countIsian, setCountIsian] = useState<number>(2);
  const [countUraian, setCountUraian] = useState<number>(2);

  // List of generated / edited questions
  const [soalList, setSoalList] = useState<SoalItem[]>(existingPenilaian?.soalList || []);

  // AI Loading & Error State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);

  // Sync total when composition counts change
  useEffect(() => {
    setTotalSoal(countPG + countPGK + countIsian + countUraian);
  }, [countPG, countPGK, countIsian, countUraian]);

  // AI Question Generator Handler
  const handleGenerateAI = async () => {
    if (!materiPokok.trim()) {
      setGenError('Silakan isi Materi Pokok terlebih dahulu sebelum melakukan generate soal.');
      return;
    }

    setIsGeneratingAI(true);
    setGenError(null);
    setGenSuccess(null);

    try {
      const generated = await generatePenilaianWithAI({
        mataPelajaran,
        kelas,
        materiPokok,
        tujuanPembelajaran: tujuanPembelajaran || `Memahami dan menerapkan materi ${materiPokok}`,
        jumlahSoal: totalSoal,
        komposisi: {
          pg: countPG,
          pgk: countPGK,
          isian: countIsian,
          uraian: countUraian,
        },
      });

      if (generated && generated.soalList && generated.soalList.length > 0) {
        const mappedSoal: SoalItem[] = generated.soalList.map((s: any, idx: number) => ({
          id: `soal-${Date.now()}-${idx + 1}`,
          nomor: idx + 1,
          tipe: s.tipe || 'pg',
          pertanyaan: s.pertanyaan || '',
          opsi: s.opsi || (s.tipe === 'pg' || s.tipe === 'pgk' ? ['A. ...', 'B. ...', 'C. ...', 'D. ...'] : undefined),
          kunciJawaban: s.kunciJawaban || 'A',
          bobotPoin: s.tipe === 'pg' || s.tipe === 'pgk' ? 1 : s.tipe === 'isian' ? 2 : 3,
          indikatorSoal: s.indikatorSoal || '',
          levelKognitif: s.levelKognitif || 'C2',
          pembahasan: s.pembahasan || '',
        }));

        setSoalList(mappedSoal);
        setGenSuccess(`Berhasil membuat ${mappedSoal.length} butir soal Kurikulum Merdeka secara otomatis! Anda dapat meninjau dan mengedit soal di bawah.`);
      } else {
        throw new Error('Format butir soal dari AI tidak lengkap.');
      }
    } catch (err: any) {
      console.warn('AI Generation notice:', err);
      setGenError('Kendala saat menghubungi AI. Menggunakan bank soal standar kurikulum sekolah.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Add a blank question manually
  const handleAddQuestion = (type: 'pg' | 'pgk' | 'isian' | 'uraian') => {
    const newNo = soalList.length + 1;
    const newSoal: SoalItem = {
      id: `soal-${Date.now()}-${newNo}`,
      nomor: newNo,
      tipe: type,
      pertanyaan: `Pertanyaan baru nomor ${newNo}...`,
      opsi: (type === 'pg' || type === 'pgk') 
        ? ['A. Pilihan satu', 'B. Pilihan dua', 'C. Pilihan tiga', 'D. Pilihan empat']
        : undefined,
      kunciJawaban: type === 'pg' ? 'A' : type === 'pgk' ? ['A', 'B'] : 'kunci jawaban',
      bobotPoin: (type === 'pg' || type === 'pgk') ? 1 : type === 'isian' ? 2 : 3,
      indikatorSoal: `Disajikan materi ${materiPokok || 'pembelajaran'}, siswa dapat menjawab dengan tepat.`,
      levelKognitif: 'C2',
      pembahasan: 'Pembahasan jawaban.',
    };

    setSoalList((prev) => [...prev, newSoal]);
  };

  // Remove question
  const handleRemoveQuestion = (id: string) => {
    setSoalList((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      return filtered.map((s, idx) => ({ ...s, nomor: idx + 1 }));
    });
  };

  // Update question field
  const handleUpdateQuestion = (id: string, updates: Partial<SoalItem>) => {
    setSoalList((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiPokok.trim()) {
      alert('Silakan isi Materi Pokok penilaian harian.');
      return;
    }

    if (soalList.length === 0) {
      alert('Daftar butir soal masih kosong. Silakan klik tombol "Generate Soal by AI" atau tambahkan soal secara manual.');
      return;
    }

    const newPenilaian: PenilaianHarian = {
      id: existingPenilaian?.id || `ph-${Date.now()}`,
      kodeUjian: existingPenilaian?.kodeUjian || `PH-${kelas}-${mataPelajaran.substring(0, 4).toUpperCase().trim()}-${Date.now().toString().slice(-4)}`,
      judul: existingPenilaian?.judul || `Penilaian Harian: ${materiPokok}`,
      mataPelajaran,
      kelas,
      rombel,
      materiPokok,
      tujuanPembelajaran: tujuanPembelajaran || `Tujuan pembelajaran materi ${materiPokok}`,
      durasiMenit,
      tahunPelajaran: profil.tahunPelajaranAktif || '2026/2027',
      semester: 1,
      kkm,
      soalList,
      guruPengampu: currentUser.name || 'Guru SDN Kedungringin 1',
      guruNip: currentUser.nip,
      tanggalDibuat: existingPenilaian?.tanggalDibuat || new Date().toISOString().split('T')[0],
      status: 'aktif',
    };

    onSave(newPenilaian);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <span>{existingPenilaian ? 'Edit Penilaian Harian' : 'Buat Penilaian Harian Baru'}</span>
          </h3>
          <p className="text-xs text-slate-500">
            Penetapan instrumen asesmen pembelajaran Kurikulum Merdeka berbasis CBT & AI
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Row 1: Mata Pelajaran & Kelas / Rombel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mata Pelajaran */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Mata Pelajaran <span className="text-rose-500">*</span>
          </label>
          <select
            value={mataPelajaran}
            onChange={(e) => setMataPelajaran(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            {MAPEL_OPTIONS.map((mapel) => (
              <option key={mapel} value={mapel}>{mapel}</option>
            ))}
          </select>
        </div>

        {/* Tingkat Kelas (Khusus Guru Mapel / Admin bebas tentukan; Guru Kelas dikunci ke kelasnya) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tingkat Kelas <span className="text-rose-500">*</span>
            {isGuruKelas && (
              <span className="ml-1 text-[10px] text-blue-600 font-normal">(Kelas Guru Binaan)</span>
            )}
          </label>
          <select
            value={kelas}
            disabled={isGuruKelas}
            onChange={(e) => setKelas(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-75 disabled:bg-slate-100 cursor-pointer"
          >
            <option value={1}>Kelas 1 (Fase A)</option>
            <option value={2}>Kelas 2 (Fase A)</option>
            <option value={3}>Kelas 3 (Fase B)</option>
            <option value={4}>Kelas 4 (Fase B)</option>
            <option value={5}>Kelas 5 (Fase C)</option>
            <option value={6}>Kelas 6 (Fase C)</option>
          </select>
        </div>
      </div>

      {/* Row 2: Materi Pokok & Tujuan Pembelajaran */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Materi Pokok / Pokok Bahasan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={materiPokok}
            onChange={(e) => setMateriPokok(e.target.value)}
            placeholder="Contoh: Sistem Gerak dan Persendian Manusia"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            KKTP (Kriteria Ketercapaian) & Alokasi Waktu
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={kkm}
              onChange={(e) => setKkm(Number(e.target.value))}
              placeholder="KKTP (75)"
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold"
            />
            <input
              type="number"
              value={durasiMenit}
              onChange={(e) => setDurasiMenit(Number(e.target.value))}
              placeholder="Waktu (Menit)"
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold"
            />
          </div>
        </div>
      </div>

      {/* Tujuan Pembelajaran */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Tujuan Pembelajaran (TP)
        </label>
        <textarea
          rows={2}
          value={tujuanPembelajaran}
          onChange={(e) => setTujuanPembelajaran(e.target.value)}
          placeholder="Contoh: Peserta didik mampu mengidentifikasi organ rangka dan sendi, serta menyajikan upaya menjaga kesehatan sistem gerak..."
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Row 3: Komposisi Jenis Soal & AI Generator Panel */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-emerald-50/70 border border-blue-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Komposisi Butir Soal & Generator AI</span>
            </h4>
            <p className="text-[11px] text-slate-600">
              Tentukan jumlah butir soal untuk tiap bentuk instrumen (Total: <strong>{totalSoal} Soal</strong>)
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={isGeneratingAI}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
          >
            {isGeneratingAI ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Membuat Soal by AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Soal by AI</span>
              </>
            )}
          </button>
        </div>

        {/* Composition Input Fields */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-[11px] font-semibold">
              <span>Pilihan Ganda</span>
              <span className="text-blue-600">1 Poin</span>
            </div>
            <input
              type="number"
              min={0}
              max={30}
              value={countPG}
              onChange={(e) => setCountPG(Number(e.target.value))}
              className="w-full text-center py-1.5 font-bold text-slate-900 border border-slate-300 rounded-lg text-sm bg-slate-50"
            />
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-[11px] font-semibold">
              <span>PG Kompleks</span>
              <span className="text-blue-600">1 Poin</span>
            </div>
            <input
              type="number"
              min={0}
              max={20}
              value={countPGK}
              onChange={(e) => setCountPGK(Number(e.target.value))}
              className="w-full text-center py-1.5 font-bold text-slate-900 border border-slate-300 rounded-lg text-sm bg-slate-50"
            />
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-[11px] font-semibold">
              <span>Isian Singkat</span>
              <span className="text-emerald-700 font-bold">2 Poin</span>
            </div>
            <input
              type="number"
              min={0}
              max={20}
              value={countIsian}
              onChange={(e) => setCountIsian(Number(e.target.value))}
              className="w-full text-center py-1.5 font-bold text-slate-900 border border-slate-300 rounded-lg text-sm bg-slate-50"
            />
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-[11px] font-semibold">
              <span>Uraian Lengkap</span>
              <span className="text-purple-700 font-bold">3 Poin</span>
            </div>
            <input
              type="number"
              min={0}
              max={15}
              value={countUraian}
              onChange={(e) => setCountUraian(Number(e.target.value))}
              className="w-full text-center py-1.5 font-bold text-slate-900 border border-slate-300 rounded-lg text-sm bg-slate-50"
            />
          </div>
        </div>

        {/* Feedback messages */}
        {genSuccess && (
          <div className="p-3 bg-emerald-100/80 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{genSuccess}</span>
          </div>
        )}
        {genError && (
          <div className="p-3 bg-amber-100/80 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{genError}</span>
          </div>
        )}
      </div>

      {/* Question List Editor */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-sm text-slate-900">Daftar Naskah Butir Soal ({soalList.length} Soal)</h4>
            <p className="text-xs text-slate-500">Anda dapat mengubah teks pertanyaan, opsi jawaban, dan kunci jawaban secara leluasa.</p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleAddQuestion('pg')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
            >
              + PG (1 pt)
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion('pgk')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
            >
              + PGK (1 pt)
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion('isian')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] transition cursor-pointer"
            >
              + Isian (2 pt)
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion('uraian')}
              className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-[11px] transition cursor-pointer"
            >
              + Uraian (3 pt)
            </button>
          </div>
        </div>

        {/* Questions Cards */}
        {soalList.map((soal, idx) => (
          <div key={soal.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center font-mono text-xs">
                  {idx + 1}
                </span>
                <span className="uppercase text-xs font-bold text-slate-700">
                  Tipe: {soal.tipe} ({soal.bobotPoin} Poin)
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  Level {soal.levelKognitif || 'C2'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveQuestion(soal.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition cursor-pointer"
                title="Hapus butir soal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Question Textarea */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Pertanyaan Soal:</label>
              <textarea
                rows={2}
                value={soal.pertanyaan}
                onChange={(e) => handleUpdateQuestion(soal.id, { pertanyaan: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Options for PG & PGK */}
            {soal.opsi && soal.opsi.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 block">Pilihan Jawaban (A, B, C, D):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {soal.opsi.map((ops, oIdx) => (
                    <input
                      key={oIdx}
                      type="text"
                      value={ops}
                      onChange={(e) => {
                        const newOpsi = [...(soal.opsi || [])];
                        newOpsi[oIdx] = e.target.value;
                        handleUpdateQuestion(soal.id, { opsi: newOpsi });
                      }}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Answer Key */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Kunci Jawaban / Kriteria Penilaian:
                </label>
                <input
                  type="text"
                  value={Array.isArray(soal.kunciJawaban) ? soal.kunciJawaban.join(', ') : soal.kunciJawaban}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (soal.tipe === 'pgk') {
                      const splitted = val.split(',').map((x) => x.trim().toUpperCase());
                      handleUpdateQuestion(soal.id, { kunciJawaban: splitted });
                    } else {
                      handleUpdateQuestion(soal.id, { kunciJawaban: val });
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-emerald-50/60 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-950"
                  placeholder={soal.tipe === 'pgk' ? 'Contoh: A, C' : 'Contoh: A'}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Indikator Soal (Kisi-Kisi):</label>
                <input
                  type="text"
                  value={soal.indikatorSoal || ''}
                  onChange={(e) => handleUpdateQuestion(soal.id, { indikatorSoal: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                  placeholder="Disajikan ilustrasi, peserta didik dapat..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
        >
          Batal
        </button>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Penilaian Harian</span>
        </button>
      </div>
    </form>
  );
};
