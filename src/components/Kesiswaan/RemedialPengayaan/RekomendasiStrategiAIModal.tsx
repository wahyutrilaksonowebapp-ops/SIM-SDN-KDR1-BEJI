import React, { useState, useEffect } from 'react';
import { SiswaRemedialPengayaanItem, ProfilSekolah, AuthUser } from '../../../types';
import { getRekomendasiStrategiAI, StrategiGuruResult } from '../../../services/api';
import { 
  Sparkles, 
  X, 
  Brain, 
  Target, 
  BookOpen, 
  HeartHandshake, 
  Calendar, 
  Printer, 
  Check, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react';

interface RekomendasiStrategiAIModalProps {
  siswa: SiswaRemedialPengayaanItem;
  mataPelajaran: string;
  materiPokok: string;
  profil: ProfilSekolah;
  currentUser: AuthUser;
  onSaveToStudentNotes: (siswaId: string, updatedNotes: string) => void;
  onClose: () => void;
}

export const RekomendasiStrategiAIModal: React.FC<RekomendasiStrategiAIModalProps> = ({
  siswa,
  mataPelajaran,
  materiPokok,
  profil,
  currentUser,
  onSaveToStudentNotes,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [strategyResult, setStrategyResult] = useState<StrategiGuruResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchStrategy = async () => {
    setLoading(true);
    setSavedSuccess(false);
    try {
      const res = await getRekomendasiStrategiAI({
        namaSiswa: siswa.namaSiswa,
        kelas: siswa.kelas,
        mataPelajaran,
        materiPokok,
        nilaiAwal: siswa.nilaiAwal,
        nilaiPerbaikan: siswa.nilaiPerbaikan || siswa.nilaiAwal,
        kkm: siswa.kkm,
        materiBelumDikuasai: siswa.materiBelumDikuasai || [materiPokok],
        catatanGuru: siswa.catatanGuru
      });
      setStrategyResult(res);
    } catch (err) {
      console.error('Error fetching strategy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategy();
  }, [siswa.siswaId]);

  const handleSaveToNotes = () => {
    if (!strategyResult) return;
    const noteText = `[Rekomendasi AI]: ${strategyResult.diagnosisMiskonsepsi.slice(0, 160)}... Strategi: ${strategyResult.strategiPersonal[0]?.namaStrategi || '-'}`;
    onSaveToStudentNotes(siswa.siswaId, noteText);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-200 text-[10px] font-bold uppercase tracking-wider">
                  AI Konsultan Pedagogis Guru
                </span>
                <span className="text-xs text-purple-200">• Kurikulum Merdeka</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Rekomendasi Strategi Pengajaran Personal &amp; Materi Tambahan
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-purple-300" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diagnostic Bar for Student */}
        <div className="bg-purple-50/70 border-b border-purple-100 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-900 font-bold flex items-center justify-center">
              {siswa.namaSiswa.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{siswa.namaSiswa}</h4>
              <p className="text-[11px] text-slate-500">
                Kelas {siswa.kelas} {siswa.rombel} • NISN: {siswa.nisn} • Mapel: <span className="font-semibold text-slate-700">{mataPelajaran}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-center">
              <span className="text-[9px] text-slate-500 uppercase block font-medium">Nilai Awal</span>
              <span className="font-bold text-red-600 text-xs">{siswa.nilaiAwal}</span>
            </div>
            <span className="text-slate-400 font-bold">➔</span>
            <div className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-center">
              <span className="text-[9px] text-slate-500 uppercase block font-medium">Hasil Remedial</span>
              <span className="font-bold text-amber-700 text-xs">{siswa.nilaiPerbaikan || 'Belum'}</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-purple-100/80 border border-purple-300 text-center">
              <span className="text-[9px] text-purple-800 uppercase block font-bold">Standar KKTP</span>
              <span className="font-bold text-purple-950 text-xs">{siswa.kkm}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">
                Gemini 3.8 Flash sedang menganalisis miskonsepsi belajar {siswa.namaSiswa}...
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Menyusun diagnosis kognitif, strategi intervensi personal guru, dan rekomendasi alat peraga khusus.
              </p>
            </div>
          ) : strategyResult ? (
            <div className="space-y-6">
              {/* 1. Diagnosis Miskonsepsi */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-xl border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>1. Diagnosis Kognitif &amp; Akar Miskonsepsi Belajar Siswa</span>
                </div>
                <p className="text-slate-800 leading-relaxed text-[11px] bg-white/80 p-3 rounded-lg border border-amber-100">
                  {strategyResult.diagnosisMiskonsepsi}
                </p>
              </div>

              {/* 2. Strategi Pengajaran Personal */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span>2. Rekomendasi Strategi Pengajaran Personal untuk Guru Kelas</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {strategyResult.strategiPersonal.map((strat, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-slate-900 text-[11px]">{strat.namaStrategi}</h5>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px] pl-7">
                        {strat.langkahLangkah}
                      </p>
                      {strat.peranTutorSebaya && (
                        <div className="ml-7 p-2 rounded-lg bg-emerald-50 text-emerald-900 text-[10px] border border-emerald-100">
                          <span className="font-bold">Kolaborasi Teman Sebaya: </span>
                          {strat.peranTutorSebaya}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Rekomendasi Materi & Media Pembelajaran Tambahan */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>3. Materi Tambahan &amp; Media Pembelajaran Konkret yang Disarankan</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {strategyResult.rekomendasiMateriTambahan.map((mat, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px] uppercase">
                        {mat.jenisMateri}
                      </span>
                      <h5 className="font-bold text-slate-900 text-[11px]">{mat.judul}</h5>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{mat.deskripsi}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Pendampingan Orang Tua */}
              {strategyResult.panduanPendampinganOrangTua && (
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                    <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>4. Pesan Komunikasi &amp; Panduan Pendampingan Orang Tua di Rumah</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 text-slate-700 text-[11px] leading-relaxed italic">
                    "{strategyResult.panduanPendampinganOrangTua}"
                  </div>
                  <p className="text-[10px] text-emerald-800">
                    *Pesan di atas dapat disalin ke buku penghubung siswa atau WhatsApp wali murid.
                  </p>
                </div>
              )}

              {/* 5. Rencana Aksi Mingguan */}
              {strategyResult.rencanaAksiMingguan && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span>5. Rencana Aksi Intervensi Terarah (1 Minggu Menuju Ketuntasan KKTP)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {strategyResult.rencanaAksiMingguan.map((aksi, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-purple-900 text-[10px]">{aksi.hari}</span>
                        <p className="text-[11px] text-slate-700 leading-tight">{aksi.kegiatan}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              Gagal memuat rekomendasi. Silakan klik tombol coba lagi.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={fetchStrategy}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate Analisis AI</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleSaveToNotes}
              disabled={!strategyResult || savedSuccess}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold shadow-xs transition-colors cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-900 hover:bg-purple-950 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{savedSuccess ? 'Tersimpan ke Catatan Siswa!' : 'Simpan Rekomendasi ke Catatan Evaluasi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
