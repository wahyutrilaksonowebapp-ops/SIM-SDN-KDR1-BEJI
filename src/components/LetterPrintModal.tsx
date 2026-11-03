import React from 'react';
import { LetterGenerationResult } from '../services/api';
import { ProfilSekolah } from '../types';
import { X, Printer, FileText } from 'lucide-react';
import { LogoPasuruan, PASURUAN_LOGO_BW_SRC } from './LogoPasuruan';

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

  const handleExportWord = async () => {
    try {
      const cleanTitle = (letter.letterTitle || 'Surat_Resmi').replace(/\s+/g, '_');
      const cleanNomor = (letter.nomorSurat || 'Nomor').replace(/[\/\\]/g, '_');
      const filename = `${cleanTitle}_SDN_Kedungringin_1_Beji_${cleanNomor}`;
      const el = document.getElementById('letter-print-area');
      if (!el) return;

      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.print\\:hidden, .screen-only').forEach((e) => e.remove());

      let logoBase64 = '';
      try {
        const resp = await fetch(PASURUAN_LOGO_BW_SRC);
        const blob = await resp.blob();
        logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn('Encoding logo to base64 fallback:', err);
      }

      const imgElements = clone.querySelectorAll('img');
      imgElements.forEach((img) => {
        if (logoBase64 && (img.src.includes('Logo_Kab_Pas') || img.alt.includes('Pasuruan'))) {
          img.src = logoBase64;
        } else if (!img.src.startsWith('data:') && !img.src.startsWith('http')) {
          img.src = window.location.origin + (img.getAttribute('src') || '');
        }
        img.style.maxWidth = '60px';
        img.style.height = 'auto';
      });

      const wordHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page Section1 {
              size: 210mm 297mm;
              mso-page-orientation: portrait;
              margin: 15mm 15mm 15mm 15mm;
              mso-header-margin: 5mm;
              mso-footer-margin: 5mm;
              mso-paper-source: 0;
            }
            div.Section1 {
              page: Section1;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 11pt;
              color: #000000;
              background-color: #ffffff;
              line-height: 1.5;
            }
            .font-bold, strong, b { font-weight: bold; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .uppercase { text-transform: uppercase; }
            .underline { text-decoration: underline; }
            .border-b-4 { border-bottom: 3px double #000000; }
          </style>
        </head>
        <body>
          <div class="Section1">
            ${clone.innerHTML}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', wordHtml], {
        type: 'application/msword;charset=utf-8'
      });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${filename}.doc`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export Word error:', err);
    }
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
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              title="Unduh dokumen dalam format Microsoft Word (.doc)"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Ekspor Word</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              title="Cetak langsung atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
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
          {/* Official Letterhead with Kop Logo Kabupaten Pasuruan */}
          <div className="border-b-4 border-double border-black pb-3 mb-6 relative font-sans text-black">
            <div className="flex items-center justify-between gap-4">
              <div className="w-20 shrink-0 flex items-center justify-center">
                <LogoPasuruan className="w-18 h-22 object-contain" />
              </div>
              <div className="flex-1 text-center leading-tight space-y-0.5">
                <h3 className="font-bold text-xs tracking-wider uppercase text-black">
                  PEMERINTAH KABUPATEN PASURUAN
                </h3>
                <h2 className="font-bold text-sm tracking-wide uppercase text-black">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </h2>
                <h1 className="font-black text-base sm:text-lg tracking-wide uppercase text-black">
                  {profil.nama.toUpperCase()}
                </h1>
                <p className="text-[10px] text-black font-normal mt-0.5 font-sans">
                  NPSN: {profil.npsn} | NSS: {profil.nss || '101051913012'} | Status Akreditasi: {profil.akreditasi}
                  <br />
                  {profil.alamat}, Kec. {profil.kecamatan}, Kab. {profil.kabupaten} Kode Pos 67154
                  <br />
                  Surel: {profil.email} | Kontak: {profil.telepon}
                </p>
              </div>
              <div className="w-20 shrink-0 hidden sm:block print:block" />
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
