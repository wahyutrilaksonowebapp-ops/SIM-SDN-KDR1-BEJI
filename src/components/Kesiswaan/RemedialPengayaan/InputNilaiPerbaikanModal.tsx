import React, { useState } from 'react';
import { ProgramRemedialPengayaan, SiswaRemedialPengayaanItem } from '../../../types';
import { Award, Check, X, AlertCircle } from 'lucide-react';

interface InputNilaiPerbaikanModalProps {
  program: ProgramRemedialPengayaan;
  onSave: (updatedProgram: ProgramRemedialPengayaan) => void;
  onClose: () => void;
}

export const InputNilaiPerbaikanModal: React.FC<InputNilaiPerbaikanModalProps> = ({
  program,
  onSave,
  onClose,
}) => {
  const [siswaState, setSiswaState] = useState<SiswaRemedialPengayaanItem[]>(program.daftarSiswa);

  const handleScoreChange = (index: number, val: string) => {
    const num = val === '' ? undefined : Math.min(100, Math.max(0, Number(val)));
    setSiswaState((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };
      target.nilaiPerbaikan = num;
      if (num !== undefined) {
        if (num >= target.kkm) {
          target.status = 'Tuntas Perbaikan';
        } else {
          target.status = 'Sedang Dikerjakan';
        }
        target.tanggalSelesai = new Date().toISOString().split('T')[0];
      }
      copy[index] = target;
      return copy;
    });
  };

  const handleStatusChange = (index: number, status: 'Belum Mengumpulkan' | 'Sedang Dikerjakan' | 'Tuntas Perbaikan') => {
    setSiswaState((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], status };
      return copy;
    });
  };

  const handleCatatanChange = (index: number, text: string) => {
    setSiswaState((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], catatanGuru: text };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ProgramRemedialPengayaan = {
      ...program,
      daftarSiswa: siswaState,
      status: siswaState.every((s) => s.status === 'Tuntas Perbaikan') ? 'selesai' : 'aktif',
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700/60 text-emerald-300 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Input Nilai Hasil Perbaikan (Remedial / Pengayaan)</h3>
              <p className="text-xs text-emerald-200">
                {program.judul} • Standar KKTP: {program.kkm}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Ketentuan Penskoran Remedial:</strong> Berdasarkan kaidah Kurikulum Merdeka, perolehan nilai pasca-remedial yang melampaui KKTP ({program.kkm}) dapat disepakati sesuai kebijakan sekolah (misal: dicatat setara KKTP {program.kkm} atau nilai aktual capaian baru).
            </p>
          </div>

          <div className="space-y-4">
            {siswaState.map((sis, idx) => (
              <div key={sis.siswaId || idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{sis.namaSiswa}</h4>
                    <p className="text-slate-500 text-[11px]">NISN: {sis.nisn} • Nilai Awal: <span className="font-bold text-red-600">{sis.nilaiAwal}</span> (KKTP: {sis.kkm})</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-slate-700">Status:</label>
                    <select
                      value={sis.status}
                      onChange={(e) => handleStatusChange(idx, e.target.value as any)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Belum Mengumpulkan">Belum Mengumpulkan</option>
                      <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                      <option value="Tuntas Perbaikan">Tuntas Perbaikan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nilai Perbaikan (0-100) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={sis.nilaiPerbaikan !== undefined ? sis.nilaiPerbaikan : ''}
                      onChange={(e) => handleScoreChange(idx, e.target.value)}
                      placeholder={`Contoh: ${sis.kkm}`}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Catatan Umpan Balik Guru
                    </label>
                    <input
                      type="text"
                      value={sis.catatanGuru || ''}
                      onChange={(e) => handleCatatanChange(idx, e.target.value)}
                      placeholder="Catatan perkembangan pemahaman konsep materi..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    {sis.nilaiPerbaikan !== undefined && sis.nilaiPerbaikan < sis.kkm && (
                      <p className="text-[10px] text-amber-700 mt-1 font-semibold flex items-center gap-1">
                        <span>⚠️ Nilai ({sis.nilaiPerbaikan}) masih di bawah KKTP ({sis.kkm}). Buka tombol 🧠 Rekomendasi AI pada menu utama untuk strategi personal.</span>
                      </p>
                    )}
                  </div>
                </div>

                {sis.materiBelumDikuasai && sis.materiBelumDikuasai.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1">
                    <span className="text-[10px] text-slate-500 font-medium">Materi diperbaiki:</span>
                    {sis.materiBelumDikuasai.map((m, mIdx) => (
                      <span key={mIdx} className="px-2 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[10px] font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Rekap Nilai Perbaikan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
