import React from 'react';
import { ProcessedRapor } from './Kesiswaan/RekapRapor';
import { ProfilSekolah } from '../types';
import { MAPEL_LIST } from '../data/initialData';
import { X, Printer, Award, FileSpreadsheet } from 'lucide-react';

interface TranscriptModalProps {
  item: ProcessedRapor | null;
  profil: ProfilSekolah;
  onClose: () => void;
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  item,
  profil,
  onClose,
}) => {
  if (!item) return null;

  const handlePrint = () => {
    window.print();
  };

  const semMap: Record<number, Record<string, number>> = {
    7: item.original.semester7 || {},
    8: item.original.semester8 || {},
    9: item.original.semester9 || {},
    10: item.original.semester10 || {},
    11: item.original.semester11 || {},
    12: item.original.semester12 || {},
  };

  const semLabels: Record<number, string> = {
    7: 'Kls 4 (1)',
    8: 'Kls 4 (2)',
    9: 'Kls 5 (1)',
    10: 'Kls 5 (2)',
    11: 'Kls 6 (1)',
    12: 'Kls 6 (2)',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Modal Controls (Not printed) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Award className="w-4 h-4 text-blue-700" />
            <span>Pratinjau Transkrip Nilai Rapor Resmi ({item.mode === '5_semester' ? 'Opsi 5 Semester' : 'Opsi 4 Semester'})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Transkrip</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Transcript Area */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white select-text print:p-0 print:m-0" id="transcript-print-area">
          {/* School Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3 leading-tight space-y-0.5">
            <div className="font-bold text-[11px] tracking-wider uppercase text-slate-800">
              PEMERINTAH KABUPATEN PASURUAN
            </div>
            <div className="font-bold text-[12px] tracking-wide uppercase text-slate-800">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </div>
            <div className="font-black text-base sm:text-lg tracking-wide uppercase text-slate-950">
              {profil.nama.toUpperCase()}
            </div>
            <div className="text-[10px] text-slate-600 font-sans">
              NPSN: {profil.npsn} | {profil.alamat}, Kec. {profil.kecamatan}, Kab. {profil.kabupaten} 67154
            </div>
            <div className="text-[10px] text-slate-600 font-sans">
              Email: {profil.email} | Akreditasi: {profil.akreditasi}
            </div>
          </div>

          {/* Transcript Title */}
          <div className="text-center mt-5 mb-4">
            <h2 className="font-bold text-sm sm:text-base uppercase tracking-wider underline">
              TRANSKRIP REKAPITULASI NILAI RAPOR SISWA
            </h2>
            <div className="text-[11px] text-slate-600 font-medium mt-0.5">
              {item.mode === '5_semester'
                ? 'Rekapitulasi 5 Semester (Semester 7 s.d. 11: Kelas IV Sem 1 & 2, Kelas V Sem 1 & 2, Kelas VI Sem 1)'
                : 'Rekapitulasi 4 Semester (Semester 9 s.d. 12: Kelas V Sem 1 & 2, Kelas VI Sem 1 & 2)'}
            </div>
          </div>

          {/* Student Biodata */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-slate-500 text-[11px]">Nama Lengkap:</span>
                <div className="font-bold text-slate-900 text-sm">{item.namaSiswa}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">NISN:</span>
                <div className="font-mono font-bold text-slate-800">{item.nisn}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Kelas & Rombel:</span>
                <div className="font-bold text-slate-800">Kelas {item.kelas} - {item.rombel}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Peringkat Paralel:</span>
                <div className="font-bold text-blue-700">Peringkat ke-{item.rank}</div>
              </div>
            </div>
          </div>

          {/* Subject Scores Table */}
          <table className="w-full text-xs border border-slate-300 text-left">
            <thead className="bg-slate-100 font-bold text-[11px] text-slate-800">
              <tr>
                <th rowSpan={2} className="py-2 px-3 border border-slate-300 text-center w-10">No</th>
                <th rowSpan={2} className="py-2 px-3 border border-slate-300">Mata Pelajaran</th>
                <th colSpan={item.semestersIncluded.length} className="py-1 px-2 border border-slate-300 text-center bg-slate-200/60">
                  Nilai per Semester
                </th>
                <th rowSpan={2} className="py-2 px-3 border border-slate-300 text-center w-24 bg-blue-50 font-bold text-blue-950">
                  Rata-rata Mapel
                </th>
              </tr>
              <tr className="text-[10px]">
                {item.semestersIncluded.map((sem) => (
                  <th key={sem} className="py-1 px-2 border border-slate-300 text-center font-mono">
                    Sem {sem} <br />
                    <span className="text-[9px] text-slate-500 font-normal">({semLabels[sem]})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {MAPEL_LIST.map((m, idx) => {
                const avg = item.mapelAverages[m] || 0;
                return (
                  <tr key={m}>
                    <td className="py-1.5 px-3 border border-slate-200 text-center font-medium">{idx + 1}</td>
                    <td className="py-1.5 px-3 border border-slate-200 font-medium">{m}</td>
                    {item.semestersIncluded.map((sem) => {
                      const score = semMap[sem]?.[m] || '-';
                      return (
                        <td key={sem} className="py-1.5 px-2 border border-slate-200 text-center font-mono">
                          {score}
                        </td>
                      );
                    })}
                    <td className="py-1.5 px-3 border border-slate-200 text-center font-mono font-bold bg-blue-50/40 text-blue-900">
                      {avg > 0 ? avg : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-[11px] border-t-2 border-slate-400">
              <tr>
                <td colSpan={2 + item.semestersIncluded.length} className="py-2 px-3 border border-slate-300 text-right uppercase tracking-wider text-slate-800">
                  Jumlah Nilai Kumulatif:
                </td>
                <td className="py-2 px-3 border border-slate-300 text-center font-mono font-bold text-blue-900">
                  {item.totalScore}
                </td>
              </tr>
              <tr className="bg-blue-100/70 text-blue-950">
                <td colSpan={2 + item.semestersIncluded.length} className="py-2 px-3 border border-slate-300 text-right uppercase tracking-wider font-extrabold">
                  Rata-rata Nilai Akhir:
                </td>
                <td className="py-2 px-3 border border-slate-300 text-center font-mono text-sm font-extrabold text-blue-950">
                  {item.overallAverage}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Signatures */}
          <div className="mt-8 pt-4 grid grid-cols-2 text-center text-xs">
            <div className="space-y-1">
              <div>Mengetahui,</div>
              <div className="font-semibold text-slate-800">Wali Kelas {item.kelas}</div>
              <div className="h-16 flex items-center justify-center text-slate-300 italic text-[10px]">
                [Tanda Tangan]
              </div>
              <div className="font-bold underline text-slate-900">Sri Wahyuni, S.Pd.SD</div>
              <div className="text-[10px] text-slate-500 font-mono">NIP. 19830219 200902 2 008</div>
            </div>

            <div className="space-y-1">
              <div>Pasuruan, 15 Juni 2026</div>
              <div className="font-semibold text-slate-800">Kepala SDN Kedungringin 1 Beji</div>
              <div className="h-16 flex items-center justify-center text-slate-300 italic text-[10px]">
                [Stempel & Tanda Tangan]
              </div>
              <div className="font-bold underline text-slate-900">{profil.kepalaSekolah}</div>
              <div className="text-[10px] text-slate-500 font-mono">NIP. {profil.nipKepalaSekolah}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
