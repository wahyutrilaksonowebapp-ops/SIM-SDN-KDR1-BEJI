import React from 'react';
import { LetterGenerationResult } from '../services/api';
import { ProfilSekolah } from '../types';
import { X, Printer, FileText } from 'lucide-react';

interface LetterPrintModalProps {
  letter: LetterGenerationResult | null;
  profil: ProfilSekolah;
  onClose: () => void;
}

export const LetterPrintModal: React.FC<LetterPrintModalProps> = ({
  letter,
  profil,
  onClose,
}) => {
  if (!letter) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Controls */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>Pratinjau Cetak Surat Resmi (Kop Dinas SDN Kedungringin 1 Beji)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Letter Sheet */}
        <div className="p-8 sm:p-14 text-slate-900 bg-white font-serif text-xs leading-relaxed select-text print:p-0 print:m-0" id="letter-print-area">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-950 pb-3 leading-tight space-y-0.5">
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
              NPSN: {profil.npsn} | Alamat: {profil.alamat}, Kec. {profil.kecamatan}, Kab. {profil.kabupaten} 67154
            </div>
            <div className="text-[10px] text-slate-600 font-sans">
              Email: {profil.email} | Telepon: {profil.telepon}
            </div>
          </div>

          {/* Letter Title & Number */}
          <div className="text-center mt-6 mb-5 space-y-1">
            <h2 className="font-bold text-sm uppercase underline tracking-wider">
              {letter.letterTitle}
            </h2>
            <div className="text-xs font-mono font-medium text-slate-700">
              Nomor: {letter.nomorSurat}
            </div>
          </div>

          {/* Opening Paragraph */}
          <div className="text-justify mb-3">
            {letter.pembuka}
          </div>

          {/* Body Section */}
          <div className="my-4 whitespace-pre-line text-justify font-sans bg-slate-50/50 p-4 rounded border border-slate-200 leading-normal text-xs text-slate-850">
            {letter.isiUtama}
          </div>

          {/* Closing Paragraph */}
          <div className="text-justify mb-8">
            {letter.penutup}
          </div>

          {/* Signature Block */}
          <div className="flex justify-end pt-4">
            <div className="text-center w-64 space-y-1 font-sans">
              <div>{letter.tanggalSurat}</div>
              <div className="font-semibold text-slate-800">{letter.pejabat.jabatan},</div>
              <div className="h-20 flex items-center justify-center text-slate-300 italic text-[10px]">
                [Stempel Dinas & Tanda Tangan Basah]
              </div>
              <div className="font-bold underline text-slate-950 text-xs">
                {letter.pejabat.nama}
              </div>
              <div className="text-[10px] text-slate-600 font-mono">
                NIP. {letter.pejabat.nip}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
