import React, { useState } from 'react';
import { ProgramRemedialPengayaan, AuthUser } from '../../../types';
import { BookOpen, CheckCircle2, Send, X, Sparkles, AlertCircle } from 'lucide-react';

interface KerjakanTugasRemedialModalProps {
  program: ProgramRemedialPengayaan;
  currentUser: AuthUser;
  onSaveSubmission: (programId: string, siswaId: string, answers: Record<number, string>, calculatedScore: number) => void;
  onClose: () => void;
}

export const KerjakanTugasRemedialModal: React.FC<KerjakanTugasRemedialModalProps> = ({
  program,
  currentUser,
  onSaveSubmission,
  onClose,
}) => {
  const isRemedial = program.jenis === 'remedial';

  // Identify student in program
  const currentSiswa = program.daftarSiswa.find(
    (s) => (currentUser.nisn && s.nisn === currentUser.nisn) || s.namaSiswa.toLowerCase().includes(currentUser.name.toLowerCase())
  ) || program.daftarSiswa[0];

  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    return currentSiswa?.jawabanSiswa || {};
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionScore, setSubmissionScore] = useState<number | null>(null);

  const handleAnswerChange = (nomor: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [nomor]: val }));
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-grade PG items and estimate score
    let totalScore = 0;
    const maxScore = program.soalList.length;

    program.soalList.forEach((soal) => {
      const userAns = (answers[soal.nomor] || '').trim().toUpperCase();
      if (soal.tipe === 'pg') {
        const correct = String(soal.kunciJawaban).trim().toUpperCase();
        if (userAns.startsWith(correct) || userAns === correct) {
          totalScore += 1;
        }
      } else {
        // For isian or uraian, provide credit if non-empty
        if (userAns.length > 2) {
          totalScore += 1;
        }
      }
    });

    const scaledScore = Math.round((totalScore / maxScore) * 100);
    // Remedial capped at or around KKTP unless pengayaan
    const finalImprovementScore = isRemedial ? Math.max(program.kkm, Math.min(88, scaledScore)) : scaledScore;

    setSubmissionScore(finalImprovementScore);
    setIsSubmitted(true);

    if (currentSiswa) {
      onSaveSubmission(program.id, currentSiswa.siswaId, answers, finalImprovementScore);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className={`px-6 py-4 ${isRemedial ? 'bg-amber-900' : 'bg-emerald-900'} text-white flex items-center justify-between rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Lembar Tugas Mandiri: {isRemedial ? 'Perbaikan (Remedial)' : 'Pengayaan'}
              </h3>
              <p className="text-xs text-white/80">
                {program.mataPelajaran} • Siswa: <span className="font-bold">{currentSiswa?.namaSiswa || currentUser.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {isSubmitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Jawaban Tugas {isRemedial ? 'Remedial' : 'Pengayaan'} Berhasil Dikirim!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Terima kasih telah bersungguh-sungguh mempelajari kembali materi ini. Perolehan estimasi nilai perbaikanmu adalah:
              </p>
              <div className="inline-block px-6 py-3 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900">
                <span className="text-3xl font-extrabold">{submissionScore}</span>
                <span className="text-xs font-semibold block text-emerald-700">KKTP: {program.kkm} • Status: Tuntas Perbaikan</span>
              </div>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors cursor-pointer shadow-xs"
                >
                  Tutup dan Kembali ke Menu
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCompleteSubmit} className="space-y-6">
              {/* Refresher Micro-Lesson by AI */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Rangkuman Konsep Materi Penting (Panduan Belajar Siswa)</span>
                </div>
                <div className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px] bg-white p-3.5 rounded-lg border border-emerald-100">
                  {program.ringkasanMateriScaffolding}
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-5">
                <h4 className="font-bold text-slate-800 text-sm">
                  Latihan Soal Perbaikan ({program.soalList.length} Butir Soal):
                </h4>

                {program.soalList.map((soal) => {
                  const currentAnswer = answers[soal.nomor] || '';
                  return (
                    <div key={soal.nomor} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {soal.nomor}. {soal.pertanyaan}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[9px] uppercase">
                          {soal.tipe}
                        </span>
                      </div>

                      {soal.petunjukPengerjaan && (
                        <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                          <span className="font-semibold">Petunjuk: </span>
                          {soal.petunjukPengerjaan}
                        </div>
                      )}

                      {/* Input based on type */}
                      {soal.tipe === 'pg' && soal.opsi ? (
                        <div className="space-y-2 pt-1 pl-1">
                          {soal.opsi.map((ops, oIdx) => {
                            const optionLetter = ops.charAt(0);
                            const isSelected = currentAnswer.startsWith(optionLetter) || currentAnswer === optionLetter;
                            return (
                              <label
                                key={oIdx}
                                className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-emerald-50 border-emerald-500 font-semibold text-emerald-950'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`soal-${soal.nomor}`}
                                  value={optionLetter}
                                  checked={isSelected}
                                  onChange={() => handleAnswerChange(soal.nomor, optionLetter)}
                                  className="text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>{ops}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : soal.tipe === 'isian' ? (
                        <div className="pt-1">
                          <input
                            type="text"
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(soal.nomor, e.target.value)}
                            placeholder="Ketikkan jawaban singkat di sini..."
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      ) : (
                        <div className="pt-1">
                          <textarea
                            rows={3}
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(soal.nomor, e.target.value)}
                            placeholder="Tuliskan penjelasan dan alasan jawabanmu secara lengkap..."
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Lembar Tugas Remedial</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
