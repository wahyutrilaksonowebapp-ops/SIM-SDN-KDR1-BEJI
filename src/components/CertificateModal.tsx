import React from 'react';
import { NilaiIjazahBTQ, ProfilSekolah } from '../types';
import { X, Printer, Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { angkaTerbilang, getBTQPredicate } from '../utils/helpers';

interface CertificateModalProps {
  item: NilaiIjazahBTQ | null;
  profil: ProfilSekolah;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  item,
  profil,
  onClose,
}) => {
  if (!item) return null;

  const predInfo = getBTQPredicate(item.rataRata);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Modal Controls (Not printed) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Pratinjau Cetak Piagam Ijazah / Sertifikat BTQ Resmi (A4)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="p-6 sm:p-10 bg-[#fdfbf7] text-slate-900 select-text print:p-0 print:bg-white print:m-0" id="certificate-print-area">
          {/* Outer Islamic Style Ornate Border */}
          <div className="relative border-8 border-emerald-900/90 p-1 rounded-sm shadow-inner">
            <div className="border-2 border-amber-600/80 p-6 sm:p-8 rounded-xs relative bg-white">
              
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-amber-700 text-lg font-serif">۞</div>
              <div className="absolute top-2 right-2 text-amber-700 text-lg font-serif">۞</div>
              <div className="absolute bottom-2 left-2 text-amber-700 text-lg font-serif">۞</div>
              <div className="absolute bottom-2 right-2 text-amber-700 text-lg font-serif">۞</div>

              {/* Header */}
              <div className="text-center space-y-1">
                <div className="text-amber-800 font-serif text-xs tracking-widest uppercase font-semibold">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-600 font-medium">
                  PEMERINTAH KABUPATEN PASURUAN • DINAS PENDIDIKAN DAN KEBUDAYAAN
                </div>
                <div className="font-serif font-black text-lg sm:text-xl text-emerald-950 tracking-wide">
                  SEKOLAH DASAR NEGERI KEDUNGRINGIN 1 BEJI
                </div>
                <div className="text-[10px] text-slate-500 tracking-normal">
                  NPSN: {profil.npsn} | Alamat: {profil.alamat}, Kec. Beji, Kab. Pasuruan 67154
                </div>

                <div className="my-3 flex items-center justify-center gap-3">
                  <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-amber-600" />
                  <div className="w-3 h-3 rotate-45 border border-amber-700 bg-amber-100" />
                  <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-amber-600" />
                </div>

                <div className="pt-1">
                  <h1 className="font-serif font-extrabold text-xl sm:text-2xl text-emerald-900 tracking-wider uppercase">
                    IJAZAH / SERTIFIKAT
                  </h1>
                  <h2 className="text-xs sm:text-sm font-semibold tracking-wide text-amber-900 uppercase">
                    BACA TULIS AL-QUR'AN (BTQ)
                  </h2>
                  <div className="text-[11px] font-mono text-slate-600 mt-1">
                    Nomor: <strong className="text-slate-900">{item.noSertifikat}</strong>
                  </div>
                </div>
              </div>

              {/* Statement */}
              <div className="mt-5 text-center text-xs text-slate-700 leading-relaxed max-w-xl mx-auto">
                Kepala SDN Kedungringin 1 Beji, Kecamatan Beji, Kabupaten Pasuruan menerangkan bahwa:
              </div>

              {/* Student Identity Box */}
              <div className="mt-3 max-w-lg mx-auto bg-emerald-50/50 border border-emerald-200/80 rounded-lg p-3 text-xs">
                <div className="grid grid-cols-3 gap-y-1.5 text-left">
                  <span className="text-slate-600 font-medium">Nama Siswa</span>
                  <span className="col-span-2 font-bold text-slate-900 uppercase">: {item.namaSiswa}</span>

                  <span className="text-slate-600 font-medium">NISN / Kelas</span>
                  <span className="col-span-2 font-mono text-slate-800">: {item.nisn} / Kelas {item.kelas}</span>

                  <span className="text-slate-600 font-medium">Sekolah Asal</span>
                  <span className="col-span-2 font-medium text-slate-800">: SDN Kedungringin 1 Beji</span>

                  <span className="text-slate-600 font-medium">Dinyatakan</span>
                  <span className="col-span-2 font-bold text-emerald-800">
                    : {item.statusKelulusan.toUpperCase()} dengan Predikat {item.predikat.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Score Table */}
              <div className="mt-5 max-w-xl mx-auto">
                <div className="text-[11px] font-bold text-slate-800 mb-1.5 text-center uppercase tracking-wider">
                  Rincian Capaian Nilai Standarisasi BTQ:
                </div>
                <table className="w-full text-xs border border-slate-300 text-left">
                  <thead className="bg-emerald-900 text-white font-semibold text-[11px]">
                    <tr>
                      <th className="py-2 px-3 border border-emerald-800 text-center w-10">No</th>
                      <th className="py-2 px-3 border border-emerald-800">Komponen Penilaian</th>
                      <th className="py-2 px-3 border border-emerald-800 text-center w-24">Skor (0-100)</th>
                      <th className="py-2 px-3 border border-emerald-800 text-center">Terbilang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    <tr>
                      <td className="py-1.5 px-3 border border-slate-200 text-center font-medium">1</td>
                      <td className="py-1.5 px-3 border border-slate-200 font-medium">
                        Tahsin (Makharijul Huruf & Shifatul Huruf)
                      </td>
                      <td className="py-1.5 px-3 border border-slate-200 text-center font-bold font-mono">{item.tahsin}</td>
                      <td className="py-1.5 px-3 border border-slate-200 text-center italic text-[11px]">{angkaTerbilang(item.tahsin)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 border border-slate-200 text-center font-medium">2</td>
                      <td className="py-1.5 px-3 border border-slate-200 font-medium">
                        Tajwid (Hukum Nun Mati/Tanwin, Mim, & Mad)
                      </td>
                      <td className="py-1.5 px-3 border border-slate-200 text-center font-bold font-mono">{item.tajwid}</td>
                      <td className="py-1.5 px-3 border border-slate-200 text-center italic text-[11px]">{angkaTerbilang(item.tajwid)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 border border-slate-200 text-center font-medium">3</td>
                      <td className="py-1.5 px-3 border border-slate-200 font-medium">
                        Tahfidz (Hafalan Surat Pendek Juz 30)
                      </td>
                      <td className="py-1.5 px-3 border border-slate-200 text-center font-bold font-mono">{item.tahfidz}</td>
                      <td className="py-1.5 px-3 border border-slate-200 text-center italic text-[11px]">{angkaTerbilang(item.tahfidz)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 border border-slate-200 text-center font-medium">4</td>
                      <td className="py-1.5 px-3 border border-slate-200 font-medium">
                        Menulis (Khat Naskhi & Rasm Imla' Arab)
                      </td>
                      <td className="py-1.5 px-3 border border-slate-200 text-center font-bold font-mono">{item.menulis}</td>
                      <td className="py-1.5 px-3 border border-slate-200 text-center italic text-[11px]">{angkaTerbilang(item.menulis)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 border border-slate-200 text-center font-medium">5</td>
                      <td className="py-1.5 px-3 border border-slate-200 font-medium">
                        Membaca (Fashahah & Irama Tartil)
                      </td>
                      <td className="py-1.5 px-3 border border-slate-200 text-center font-bold font-mono">{item.membaca}</td>
                      <td className="py-1.5 px-3 border border-slate-200 text-center italic text-[11px]">{angkaTerbilang(item.membaca)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-amber-50/80 font-bold border-t-2 border-emerald-900">
                    <tr>
                      <td colSpan={2} className="py-2 px-3 border border-slate-300 text-emerald-950 uppercase tracking-wide">
                        Rata-rata Nilai Kumulatif
                      </td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-mono text-sm text-emerald-900">
                        {item.rataRata}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 text-center text-emerald-900 font-bold uppercase text-[11px]">
                        {predInfo.labelIndo}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {item.catatan && (
                  <div className="mt-2 text-[10px] text-slate-500 italic text-center">
                    Catatan Pembimbing: "{item.catatan}"
                  </div>
                )}
              </div>

              {/* Signatures & QR Code */}
              <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-3 items-end text-center text-xs">
                {/* Left: Penguji BTQ */}
                <div className="space-y-1">
                  <div className="text-slate-600 text-[11px]">Mengetahui,</div>
                  <div className="font-semibold text-slate-800">Guru PAI & Penguji BTQ</div>
                  <div className="h-14 flex items-center justify-center text-slate-300 italic text-[10px]">
                    [Tanda Tangan]
                  </div>
                  <div className="font-bold underline text-slate-900">{item.penguji}</div>
                  <div className="text-[10px] text-slate-500 font-mono">NIP. 19800815 200604 1 012</div>
                </div>

                {/* Center: Verification Seal */}
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-emerald-700/60 flex flex-col items-center justify-center bg-emerald-50 text-emerald-800 p-1">
                    <ShieldCheck className="w-6 h-6 text-emerald-700" />
                    <span className="text-[8px] font-bold uppercase font-mono mt-0.5">TERVERIFIKASI</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">SIM SDN KDR 1 BEJI</span>
                </div>

                {/* Right: Kepala Sekolah */}
                <div className="space-y-1">
                  <div className="text-slate-600 text-[11px]">Pasuruan, {item.tanggalTerbit}</div>
                  <div className="font-semibold text-slate-800">{profil.kepalaSekolah ? 'Kepala Sekolah' : 'Kepala SDN Kedungringin 1'}</div>
                  <div className="h-14 flex items-center justify-center text-slate-300 italic text-[10px]">
                    [Stempel Dinas & TTD]
                  </div>
                  <div className="font-bold underline text-slate-900">{profil.kepalaSekolah}</div>
                  <div className="text-[10px] text-slate-500 font-mono">NIP. {profil.nipKepalaSekolah}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
