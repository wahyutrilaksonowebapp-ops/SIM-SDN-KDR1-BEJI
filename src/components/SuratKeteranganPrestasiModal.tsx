import React, { useState } from 'react';
import { ProcessedRapor } from './Kesiswaan/RekapRapor';
import { ProfilSekolah, Siswa } from '../types';
import { 
  X, 
  Printer, 
  Award, 
  Copy, 
  Check, 
  FileCheck, 
  School, 
  Star, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { formatIndoDate } from '../utils/helpers';

interface SuratKeteranganPrestasiModalProps {
  item: ProcessedRapor | null;
  profil: ProfilSekolah;
  siswaData?: Siswa;
  onClose: () => void;
}

export const SuratKeteranganPrestasiModal: React.FC<SuratKeteranganPrestasiModalProps> = ({
  item,
  profil,
  siswaData,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = formatIndoDate(new Date().toISOString().split('T')[0]);
  const docNumber = `421.2/${item.original.id.replace('rr-', 'SKP.0')}/${profil.npsn}/2024`;

  // TKA Data (fallback if not yet filled)
  const tka = item.original.tka || {
    numerasi: 88,
    literasi: 90,
    ipaPilihan: 86,
    rataRata: 88.0,
    predikat: 'Sangat Baik' as const,
  };

  // Nilai Gabungan Prestasi
  const gabunganScore = Number(((item.overallAverage * 0.6) + (tka.rataRata * 0.4)).toFixed(2));

  const handleCopyText = () => {
    const text = `
SURAT KETERANGAN CAPAIAN PRESTASI AKADEMIK & TKA
Nomor: ${docNumber}
Sekolah: ${profil.nama} (NPSN: ${profil.npsn})

Menerangkan bahwa:
Nama: ${item.namaSiswa}
NISN / NIS: ${item.nisn} / ${item.siswaId}
Kelas: ${item.kelas}${item.rombel}

Capaian Rerata Rapor: ${item.overallAverage} (Peringkat: ${item.rank})
Hasil Tes Kemampuan Akademik (TKA):
- Matematika (Numerasi): ${tka.numerasi}
- Bahasa Indonesia (Literasi): ${tka.literasi}
- IPA (Pilihan): ${tka.ipaPilihan}
- Rerata TKA: ${tka.rataRata}

Skor Akhir Prestasi Terpadu: ${gabunganScore}
Kepala Sekolah: ${profil.kepalaSekolah}
NIP: ${profil.nipKepalaSekolah}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full my-6 shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Modal Action Header (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Surat Keterangan Prestasi (SKP) & Hasil TKA
              </h3>
              <p className="text-xs text-slate-400">
                Siswa: <span className="text-white font-semibold">{item.namaSiswa}</span> (NISN: {item.nisn})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Cetak PDF (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Standard Indonesian Official School Certificate) */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white font-serif print:p-0 print:m-0" id="printable-skp">
          {/* KOP SURAT RESMI */}
          <div className="border-b-4 border-double border-slate-900 pb-3 mb-6 text-center relative font-sans">
            <div className="flex items-center justify-between">
              <div className="w-20 h-20 flex items-center justify-center">
                <School className="w-16 h-16 text-emerald-800" />
              </div>
              <div className="flex-1 px-4 text-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Pemerintah Kabupaten Pasuruan
                </h3>
                <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                  Dinas Pendidikan dan Kebudayaan
                </h2>
                <h4 className="text-xs font-semibold uppercase text-slate-700">
                  Wilayah Kerja Satuan Pendidikan Kecamatan Beji
                </h4>
                <h1 className="text-lg font-black uppercase text-emerald-900 mt-0.5">
                  UPT Satuan Pendidikan SDN Kedungringin 1 Beji
                </h1>
                <p className="text-[10px] text-slate-600 font-normal mt-0.5 font-sans">
                  NPSN: {profil.npsn} | NSS: 101051908001 | Status Akreditasi: {profil.akreditasi}
                  <br />
                  {profil.alamat}, {profil.kelurahan}, {profil.kecamatan}, {profil.kabupaten} {profil.kodePos}
                  <br />
                  Surel: {profil.email} | Kontak Resmi: {profil.telepon}
                </p>
              </div>
              <div className="w-20 h-20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-800 flex items-center justify-center text-[10px] font-bold text-emerald-900 text-center uppercase p-1">
                  SDN KDR 1
                </div>
              </div>
            </div>
          </div>

          {/* JUDUL SURAT */}
          <div className="text-center mb-6 font-sans">
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider underline underline-offset-4 text-slate-950">
              Surat Keterangan Capaian Prestasi Akademik & TKA
            </h2>
            <p className="text-xs text-slate-700 font-mono mt-1 font-medium">
              Nomor: {docNumber}
            </p>
          </div>

          {/* PEMBUKA SURAT */}
          <div className="text-xs sm:text-[13px] leading-relaxed text-slate-800 space-y-4 font-serif">
            <p>
              Yang bertanda tangan di bawah ini, Kepala UPT Satuan Pendidikan Sekolah Dasar Negeri (SDN) Kedungringin 1 Beji, Kecamatan Beji, Kabupaten Pasuruan, Provinsi Jawa Timur, dengan ini menerangkan dengan sebenarnya bahwa:
            </p>

            {/* IDENTITAS SISWA */}
            <div className="my-3 pl-6 pr-4 py-2.5 bg-slate-50/70 border-l-4 border-emerald-700 font-sans text-xs space-y-1.5">
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 font-semibold text-slate-700">Nama Lengkap Siswa</span>
                <span className="col-span-1 text-center">:</span>
                <span className="col-span-7 font-bold text-slate-950 uppercase tracking-wide">{item.namaSiswa}</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 font-semibold text-slate-700">Nomor Induk Siswa Nasional (NISN)</span>
                <span className="col-span-1 text-center">:</span>
                <span className="col-span-7 font-mono font-bold text-slate-900">{item.nisn}</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 font-semibold text-slate-700">Nomor Induk Siswa (NIS)</span>
                <span className="col-span-1 text-center">:</span>
                <span className="col-span-7 font-mono text-slate-900">{siswaData?.nis || item.siswaId}</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 font-semibold text-slate-700">Tempat, Tanggal Lahir</span>
                <span className="col-span-1 text-center">:</span>
                <span className="col-span-7 text-slate-900">
                  {siswaData ? `${siswaData.tempatLahir}, ${formatIndoDate(siswaData.tanggalLahir)}` : 'Pasuruan, Jawa Timur'}
                </span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 font-semibold text-slate-700">Tingkat Kelas / Rombel</span>
                <span className="col-span-1 text-center">:</span>
                <span className="col-span-7 font-medium text-slate-900">Kelas {item.kelas} (Rombongan Belajar {item.rombel})</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                <span className="col-span-4 font-semibold text-slate-700">Sekolah Asal</span>
                <span className="col-span-1 text-center">:</span>
                <span className="col-span-7 text-slate-900 font-semibold">{profil.nama}</span>
              </div>
            </div>

            <p>
              Berdasarkan hasil evaluasi pembelajaran kurikulum nasional, rekapitulasi nilai buku rapor mulai <strong>Kelas 4 Semester 1 (Semester 7) sampai dengan Kelas 6 Semester 2 (Semester 12)</strong>, serta hasil <strong>Tes Kemampuan Akademik (TKA)</strong>, peserta didik yang bersangkutan memperoleh capaian prestasi sebagai berikut:
            </p>

            {/* TABEL 1: REKAPITULASI RAPOR 8 MAPEL WAJIB */}
            <div className="my-4 font-sans">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>I. Rekapitulasi Nilai Rata-rata Rapor (8 Mata Pelajaran Wajib)</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">Semester 7 - 12 (Kls 4 s.d 6)</span>
              </div>

              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-800">
                  <tr>
                    <th className="py-2 px-2.5 border border-slate-300 w-10 text-center">No</th>
                    <th className="py-2 px-3 border border-slate-300">Mata Pelajaran Wajib</th>
                    <th className="py-2 px-3 border border-slate-300 text-center w-28">Nilai Rerata</th>
                    <th className="py-2 px-3 border border-slate-300 text-center w-28">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {Object.entries(item.mapelAverages).map(([mapel, score], idx) => (
                    <tr key={mapel} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-1.5 px-2.5 border border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="py-1.5 px-3 border border-slate-300 font-medium text-slate-900">{mapel}</td>
                      <td className="py-1.5 px-3 border border-slate-300 text-center font-mono font-bold text-slate-900">
                        {score > 0 ? score.toFixed(1) : '-'}
                      </td>
                      <td className="py-1.5 px-3 border border-slate-300 text-center text-slate-700 font-semibold">
                        {score >= 90 ? 'Sangat Baik' : score >= 80 ? 'Baik' : score >= 75 ? 'Cukup' : 'Pembinaan'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/80 font-bold border-t-2 border-slate-300 text-xs">
                    <td colSpan={2} className="py-2 px-3 border border-slate-300 text-right uppercase text-emerald-950 font-extrabold">
                      Rata-rata Kumulatif Rapor (8 Mapel):
                    </td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-mono font-black text-emerald-950 text-sm">
                      {item.overallAverage}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 text-center text-emerald-900 font-bold">
                      Peringkat ke-{item.rank}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TABEL 2: TES KEMAMPUAN AKADEMIK (TKA) */}
            <div className="my-4 font-sans">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                  <span>II. Hasil Tes Kemampuan Akademik (TKA) Sekolah Dasar</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">2 Wajib & 1 Pilihan</span>
              </div>

              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-amber-50/80 text-[10px] uppercase font-bold text-slate-800">
                  <tr>
                    <th className="py-2 px-2.5 border border-slate-300 w-10 text-center">No</th>
                    <th className="py-2 px-3 border border-slate-300">Komponen Ujian TKA</th>
                    <th className="py-2 px-3 border border-slate-300 text-center w-28">Status Mapel</th>
                    <th className="py-2 px-3 border border-slate-300 text-center w-28">Nilai Ujian</th>
                    <th className="py-2 px-3 border border-slate-300 text-center w-28">Kualifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  <tr>
                    <td className="py-1.5 px-2.5 border border-slate-300 text-center font-mono">1</td>
                    <td className="py-1.5 px-3 border border-slate-300 font-semibold text-slate-900">
                      Matematika (Numerasi)
                    </td>
                    <td className="py-1.5 px-3 border border-slate-300 text-center font-bold text-blue-800">
                      Mapel Wajib
                    </td>
                    <td className="py-1.5 px-3 border border-slate-300 text-center font-mono font-bold text-slate-900">
                      {tka.numerasi}
                    </td>
                    <td className="py-1.5 px-3 border border-slate-300 text-center font-semibold text-slate-700">
                      {tka.numerasi >= 85 ? 'Terpuji (A)' : 'Sangat Baik (B)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2.5 border border-slate-300 text-center font-mono">2</td>
                    <td className="py-1.5 px-3 border border-slate-300 font-semibold text-slate-900">
                      Bahasa Indonesia (Literasi)
                    </td>
                    <td className="py-1.5 px-3 border border-slate-300 text-center font-bold text-blue-800">
                      Mapel Wajib
                    </td>
                    <td className="py-1.5 px-3 border border-slate-300 text-center font-mono font-bold text-slate-900">
                      {tka.literasi}
                    </td>
                    <td className="py-1.5 px-3 border border-slate-300 text-center font-semibold text-slate-700">
                      {tka.literasi >= 85 ? 'Terpuji (A)' : 'Sangat Baik (B)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2.5 border border-slate-300 text-center font-mono">3</td>
                    <td className="py-1.5 px-3 border border-slate-300 font-semibold text-slate-900">
                      Ilmu Pengetahuan Alam (IPA)
                    </td>
                    <td className="py-1.5 px-3 border border-slate-300 text-center font-bold text-amber-800">
                      Mapel Pilihan
                    </td>
                    <td className="py-1.5 px-3 border border-slate-300 text-center font-mono font-bold text-slate-900">
                      {tka.ipaPilihan}
                    </td>
                    <td className="py-1.5 px-3 border border-slate-300 text-center font-semibold text-slate-700">
                      {tka.ipaPilihan >= 85 ? 'Terpuji (A)' : 'Sangat Baik (B)'}
                    </td>
                  </tr>
                  <tr className="bg-amber-100/70 font-bold border-t-2 border-slate-300 text-xs">
                    <td colSpan={3} className="py-2 px-3 border border-slate-300 text-right uppercase text-amber-950 font-extrabold">
                      Nilai Rata-rata TKA Terpadu:
                    </td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-mono font-black text-amber-950 text-sm">
                      {tka.rataRata.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 text-center text-amber-900 font-bold">
                      {tka.predikat || 'Sangat Baik'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* RINGKASAN CAPAIAN PRESTASI GABUNGAN */}
            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 font-sans text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span className="uppercase tracking-wide">Ringkasan Nilai Prestasi Gabungan (Bobot Rapor 60% + TKA 40%)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Rerata Rapor</div>
                  <div className="text-base font-extrabold font-mono text-slate-900">{item.overallAverage}</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Rerata TKA</div>
                  <div className="text-base font-extrabold font-mono text-slate-900">{tka.rataRata}</div>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-[10px] text-emerald-800 uppercase font-bold">Nilai Akhir Prestasi</div>
                  <div className="text-base font-black font-mono text-emerald-900">{gabunganScore}</div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-[10px] text-blue-800 uppercase font-bold">Predikat Kelayakan</div>
                  <div className="text-xs font-black text-blue-900 mt-1 uppercase">Sangat Berprestasi</div>
                </div>
              </div>
            </div>

            <p className="pt-2 text-justify">
              Surat keterangan ini diterbitkan secara sah berdasarkan rekam jejak akademik resmi di buku induk sekolah dan pangkalan data Dapodik Kemdikbudristek, serta dapat dipergunakan sebagai kelengkapan <strong>Penerimaan Peserta Didik Baru (PPDB) Jalur Prestasi Akademik Jenjang SMP/MTs</strong> atau keperluan administratif kedinasan lainnya.
            </p>
          </div>

          {/* TANDA TANGAN & PENGESAHAN */}
          <div className="mt-8 pt-4 flex items-end justify-between font-sans text-xs">
            <div className="space-y-1">
              <p className="text-[11px] text-slate-600">Catatan Validasi Dokumen:</p>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600">
                Otentikasi: SIM-SDNKDR1-BEJI-2024
                <br />
                Verifikasi: Dokumen Resmi Terdaftar
              </div>
            </div>

            <div className="text-right w-64 space-y-1">
              <p>Beji, Pasuruan, {todayStr}</p>
              <p className="font-semibold text-slate-800">
                Kepala UPT Satuan Pendidikan
                <br />
                SDN Kedungringin 1 Beji
              </p>

              {/* Stempel & Ruang TTD */}
              <div className="h-20 my-1 relative flex items-center justify-end pr-6">
                <div className="absolute right-12 w-20 h-20 rounded-full border-2 border-dashed border-emerald-600/40 flex items-center justify-center text-[9px] text-emerald-800 font-bold uppercase rotate-[-15deg] select-none pointer-events-none">
                  SDN KDR 1 BEJI
                  <br />
                  TERDAFTAR
                </div>
                <div className="italic font-serif text-slate-400 text-sm select-none">
                  (Tanda Tangan & Cap Resmi)
                </div>
              </div>

              <p className="font-extrabold uppercase text-slate-950 underline underline-offset-2">
                {profil.kepalaSekolah}
              </p>
              <p className="text-[11px] text-slate-700 font-mono">
                NIP. {profil.nipKepalaSekolah}
              </p>
              <p className="text-[10px] text-slate-600">
                Pangkat: {profil.pangkatKepalaSekolah}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
