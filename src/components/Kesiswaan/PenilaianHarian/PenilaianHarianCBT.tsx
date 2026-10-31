import React, { useState, useEffect, useMemo } from 'react';
import { PenilaianHarian, HasilPenilaianSiswa, JawabanSiswaItem, AuthUser } from '../../../types';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  RotateCcw,
  Flag,
  HelpCircle,
  FileCheck2,
  Check,
  X,
  Sparkles
} from 'lucide-react';

interface PenilaianHarianCBTProps {
  penilaian: PenilaianHarian;
  currentUser: AuthUser;
  onSubmit: (hasil: HasilPenilaianSiswa) => void;
  onExit: () => void;
}

export const PenilaianHarianCBT: React.FC<PenilaianHarianCBTProps> = ({
  penilaian,
  currentUser,
  onSubmit,
  onExit,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [markedDoubt, setMarkedDoubt] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(penilaian.durasiMenit * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [startTime] = useState(() => new Date().toISOString());

  const totalQuestions = penilaian.soalList.length;
  const currentSoal = penilaian.soalList[currentIdx];

  // Timer countdown
  useEffect(() => {
    if (timeLeftSeconds <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Handle answers
  const handleSelectPG = (optionLetter: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentSoal.id]: optionLetter,
    }));
  };

  const handleTogglePGK = (optionLetter: string) => {
    const current = (answers[currentSoal.id] as string[]) || [];
    let updated: string[];
    if (current.includes(optionLetter)) {
      updated = current.filter((item) => item !== optionLetter);
    } else {
      updated = [...current, optionLetter].sort();
    }
    setAnswers((prev) => ({
      ...prev,
      [currentSoal.id]: updated,
    }));
  };

  const handleTextChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentSoal.id]: text,
    }));
  };

  const toggleDoubt = () => {
    setMarkedDoubt((prev) => ({
      ...prev,
      [currentSoal.id]: !prev[currentSoal.id],
    }));
  };

  // Answer stats
  const answeredCount = useMemo(() => {
    let count = 0;
    penilaian.soalList.forEach((s) => {
      const ans = answers[s.id];
      if (ans !== undefined && ans !== null) {
        if (Array.isArray(ans) && ans.length > 0) count++;
        else if (typeof ans === 'string' && ans.trim().length > 0) count++;
      }
    });
    return count;
  }, [answers, penilaian.soalList]);

  // Final submit handler with automatic grading for PG & PGK
  const handleFinalSubmit = () => {
    const jawabanItems: JawabanSiswaItem[] = penilaian.soalList.map((soal) => {
      const studentAns = answers[soal.id] || (soal.tipe === 'pgk' ? [] : '');
      let isCorrectAuto: boolean | undefined = undefined;
      let skorOtomatis = 0;

      // Otomatis koreksi untuk PG (1 poin)
      if (soal.tipe === 'pg') {
        const correctKey = String(soal.kunciJawaban).trim().toUpperCase();
        const studKey = String(studentAns).trim().toUpperCase();
        if (studKey && studKey === correctKey) {
          isCorrectAuto = true;
          skorOtomatis = 1;
        } else {
          isCorrectAuto = false;
          skorOtomatis = 0;
        }
      }

      // Otomatis koreksi untuk PGK (1 poin)
      if (soal.tipe === 'pgk') {
        const correctKeys = Array.isArray(soal.kunciJawaban) 
          ? soal.kunciJawaban.map((k) => String(k).trim().toUpperCase()).sort()
          : [String(soal.kunciJawaban).trim().toUpperCase()];
        const studKeys = Array.isArray(studentAns)
          ? studentAns.map((k) => String(k).trim().toUpperCase()).sort()
          : [String(studentAns).trim().toUpperCase()];
        
        const isMatch = correctKeys.length === studKeys.length && 
          correctKeys.every((val, idx) => val === studKeys[idx]);

        if (isMatch) {
          isCorrectAuto = true;
          skorOtomatis = 1;
        } else {
          isCorrectAuto = false;
          skorOtomatis = 0;
        }
      }

      // Isian (2 poin) & Uraian (3 poin): skor diserahkan kebijakan guru
      const skorFinal = (soal.tipe === 'pg' || soal.tipe === 'pgk') ? skorOtomatis : 0;

      return {
        soalId: soal.id,
        nomor: soal.nomor,
        tipe: soal.tipe,
        jawabanSiswa: studentAns,
        kunciJawaban: soal.kunciJawaban,
        isCorrectAuto,
        skorOtomatis,
        skorManual: undefined,
        skorFinal,
        skorMaksimal: soal.bobotPoin,
        catatanGuru: (soal.tipe === 'isian' || soal.tipe === 'uraian') ? 'Menunggu koreksi guru' : undefined,
      };
    });

    const totalMaxScore = penilaian.soalList.reduce((acc, s) => acc + s.bobotPoin, 0);
    const initialScoreObtained = jawabanItems.reduce((acc, j) => acc + j.skorFinal, 0);
    const initialNilaiAkhir = totalMaxScore > 0 ? Math.round((initialScoreObtained / totalMaxScore) * 100) : 0;

    const hasManualQuestions = penilaian.soalList.some((s) => s.tipe === 'isian' || s.tipe === 'uraian');

    const hasil: HasilPenilaianSiswa = {
      id: `hp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      penilaianId: penilaian.id,
      siswaId: currentUser.nisn || `sis-${Date.now()}`,
      nisn: currentUser.nisn || '0123456789',
      namaSiswa: currentUser.name || 'Siswa CBT',
      kelas: penilaian.kelas,
      rombel: currentUser.rombel || `Kelas ${penilaian.kelas} A`,
      mataPelajaran: penilaian.mataPelajaran,
      waktuMulai: startTime,
      waktuSelesai: new Date().toISOString(),
      jawaban: jawabanItems,
      totalSkorPerolehan: initialScoreObtained,
      totalSkorMaksimal: totalMaxScore,
      nilaiAkhir: initialNilaiAkhir,
      statusKoreksi: hasManualQuestions ? 'menunggu_koreksi_manual' : 'sudah_dikoreksi',
      statusKelulusan: initialNilaiAkhir >= penilaian.kkm ? 'Tuntas' : 'Belum Tuntas',
      catatanEvaluasi: hasManualQuestions
        ? 'Jawaban pilihan ganda & PGK telah dikoreksi otomatis. Nilai isian dan uraian akan diperiksa oleh guru.'
        : `Hasil tes tuntas. Nilai akhir Anda adalah ${initialNilaiAkhir}.`,
    };

    onSubmit(hasil);
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 p-3 sm:p-6 flex flex-col justify-between">
      {/* Top Header CBT */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white">{penilaian.judul}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Kelas {penilaian.kelas}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Peserta: <strong className="text-slate-200">{currentUser.name}</strong> • NISN: {currentUser.nisn || '-'}
            </p>
          </div>
        </div>

        {/* Timer & Exit */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-mono font-bold text-sm shadow-xs ${
            timeLeftSeconds <= 300 
              ? 'bg-rose-900/60 text-rose-200 border border-rose-600 animate-pulse'
              : 'bg-slate-950/80 text-emerald-300 border border-slate-700'
          }`}>
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Sisa Waktu: {formatTimer(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={onExit}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-600 transition cursor-pointer"
          >
            Keluar CBT
          </button>
        </div>
      </div>

      {/* Main CBT Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 my-4 flex-1">
        {/* Left Column: Current Question & Answer Input */}
        <div className="lg:col-span-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-7 shadow-lg flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Question Number & Type Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-sm">
                  Soal No. {currentSoal.nomor}
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase bg-slate-700 text-slate-200 border border-slate-600">
                  {currentSoal.tipe === 'pg' && 'Pilihan Ganda (1 Poin)'}
                  {currentSoal.tipe === 'pgk' && 'Pilihan Ganda Kompleks (1 Poin)'}
                  {currentSoal.tipe === 'isian' && 'Isian Singkat (2 Poin)'}
                  {currentSoal.tipe === 'uraian' && 'Uraian Komprehensif (3 Poin)'}
                </span>
              </div>

              <button
                onClick={toggleDoubt}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  markedDoubt[currentSoal.id]
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{markedDoubt[currentSoal.id] ? 'Ragu-ragu' : 'Tandai Ragu'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
              {currentSoal.pertanyaan}
            </div>

            {/* Interactive Answer Inputs based on Question Type */}
            <div className="pt-2">
              {/* 1. PILIHAN GANDA (PG) */}
              {currentSoal.tipe === 'pg' && currentSoal.opsi && (
                <div className="space-y-2.5">
                  {currentSoal.opsi.map((opsiText, idx) => {
                    const letter = opsiText.substring(0, 1).toUpperCase();
                    const isSelected = answers[currentSoal.id] === letter;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPG(letter)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-500 text-white shadow-xs font-semibold ring-2 ring-blue-500/50'
                            : 'bg-slate-800/90 hover:bg-slate-700/60 border-slate-700 text-slate-200'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {letter}
                        </span>
                        <span className="text-xs sm:text-sm pt-0.5">{opsiText}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. PILIHAN GANDA KOMPLEKS (PGK) */}
              {currentSoal.tipe === 'pgk' && currentSoal.opsi && (
                <div className="space-y-2.5">
                  <p className="text-xs text-amber-300/90 italic mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pilihlah dua atau lebih pilihan jawaban yang benar (dapat mencentang beberapa opsi):
                  </p>
                  {currentSoal.opsi.map((opsiText, idx) => {
                    const letter = opsiText.substring(0, 1).toUpperCase();
                    const selectedList = (answers[currentSoal.id] as string[]) || [];
                    const isChecked = selectedList.includes(letter);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTogglePGK(letter)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-xs font-semibold ring-2 ring-emerald-500/50'
                            : 'bg-slate-800/90 hover:bg-slate-700/60 border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center border ${
                          isChecked ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-500 bg-slate-700'
                        }`}>
                          {isChecked && <Check className="w-4 h-4 stroke-3" />}
                        </div>
                        <span className="text-xs sm:text-sm pt-0.5">{opsiText}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. ISIAN SINGKAT */}
              {currentSoal.tipe === 'isian' && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold block">Ketikkan Jawaban Singkat Anda:</label>
                  <input
                    type="text"
                    value={(answers[currentSoal.id] as string) || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Contoh: kata kunci istilah atau nama organ..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm placeholder:text-slate-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    *Gunakan ejaan bahasa Indonesia yang baku dan tepat. Bobot maksimal: 2 poin.
                  </p>
                </div>
              )}

              {/* 4. URAIAN KOMPREHENSIF */}
              {currentSoal.tipe === 'uraian' && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold block">Tuliskan Penjelasan Lengkap Anda:</label>
                  <textarea
                    rows={6}
                    value={(answers[currentSoal.id] as string) || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Tuliskan uraian argumen, perbandingan, atau langkah-langkah pemecahan masalah dengan runtut..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm placeholder:text-slate-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    *Penilaian uraian akan dikoreksi dan dinilai secara komprehensif oleh dewan guru (maksimal 3 poin).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls: Prev, Next, Submit */}
          <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="text-xs text-slate-400 hidden sm:inline">
              Pertanyaan {currentIdx + 1} dari {totalQuestions}
            </span>

            {currentIdx < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Kumpulkan Ujian</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Grid & Progress */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Navigasi Soal</h4>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {answeredCount}/{totalQuestions} Terjawab
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-700/70 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Numbers Grid */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {penilaian.soalList.map((soal, idx) => {
                const isCurrent = currentIdx === idx;
                const isDoubt = markedDoubt[soal.id];
                const ans = answers[soal.id];
                const isAnswered = ans !== undefined && ans !== null && 
                  (Array.isArray(ans) ? ans.length > 0 : String(ans).trim().length > 0);

                let badgeColor = 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 border-slate-600';
                if (isCurrent) {
                  badgeColor = 'ring-2 ring-blue-400 bg-blue-600 text-white font-bold';
                } else if (isDoubt) {
                  badgeColor = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
                } else if (isAnswered) {
                  badgeColor = 'bg-emerald-600 text-white font-bold border-emerald-500';
                }

                return (
                  <button
                    key={soal.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-xl border text-xs font-mono transition flex items-center justify-center cursor-pointer ${badgeColor}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-700/60 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
                <span>Sudah Dijawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500 shrink-0" />
                <span>Ragu-ragu ({Object.values(markedDoubt).filter(Boolean).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-700 shrink-0" />
                <span>Belum Dijawab ({totalQuestions - answeredCount})</span>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Selesai & Kirim Ujian</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">Konfirmasi Pengiriman Ujian</h3>
                <p className="text-xs text-slate-400">Pastikan seluruh jawaban Anda telah diperiksa.</p>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Pertanyaan:</span>
                <span className="font-bold text-white">{totalQuestions} Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sudah Terjawab:</span>
                <span className="font-bold text-emerald-400">{answeredCount} Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Belum Terjawab:</span>
                <span className="font-bold text-rose-400">{totalQuestions - answeredCount} Soal</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Setelah dikirim, jawaban pilihan ganda (PG) dan pilihan ganda kompleks (PGK) akan langsung dikoreksi otomatis oleh sistem. Nilai isian dan uraian akan diperiksa oleh guru pengampu.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Batal & Lanjutkan
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Kirim Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
