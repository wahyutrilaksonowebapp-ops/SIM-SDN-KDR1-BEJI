import React from 'react';
import { PenilaianHarian, ProfilSekolah } from '../../../types';
import { Printer, X, Download, FileText, CheckCircle2, Award } from 'lucide-react';

interface PrintModalProps {
  penilaian: PenilaianHarian;
  profil: ProfilSekolah;
  onClose: () => void;
}

// 1. Modal Unduh / Cetak Kisi-Kisi Soal (Format Kurikulum Merdeka)
export const KisiKisiModal: React.FC<PrintModalProps> = ({ penilaian, profil, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in duration-150">
        {/* Header Action Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Kisi-Kisi Penilaian Harian (Kurikulum Merdeka)</h3>
              <p className="text-[11px] text-slate-400">{penilaian.judul} • Kelas {penilaian.kelas}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto font-serif text-slate-900 print:p-0">
          {/* Kop Sekolah */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Pemerintah Kabupaten Pasuruan • Dinas Pendidikan dan Kebudayaan</h4>
            <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 mt-0.5">{profil.nama}</h2>
            <p className="text-[11px] text-slate-600 italic">
              {profil.alamat}, Kec. {profil.kecamatan}, Kab. {profil.kabupaten} • NPSN: {profil.npsn} • Email: {profil.email}
            </p>
          </div>

          <div className="text-center mb-5">
            <h3 className="text-sm sm:text-base font-extrabold uppercase underline decoration-1 underline-offset-4">
              KISI-KISI PENULISAN SOAL PENILAIAN HARIAN
            </h3>
            <p className="text-xs text-slate-600 font-sans mt-1">
              Tahun Ajaran: {penilaian.tahunPelajaran} • Semester: {penilaian.semester} (Ganjil)
            </p>
          </div>

          {/* Identitas Ujian */}
          <div className="grid grid-cols-2 gap-2 text-xs font-sans mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 print:bg-white print:border-none print:p-0">
            <div>
              <p>Mata Pelajaran: <strong>{penilaian.mataPelajaran}</strong></p>
              <p>Tingkat / Kelas: <strong>Kelas {penilaian.kelas} (Fase {penilaian.kelas <= 2 ? 'A' : penilaian.kelas <= 4 ? 'B' : 'C'})</strong></p>
              <p>Materi Pokok: <strong>{penilaian.materiPokok}</strong></p>
            </div>
            <div>
              <p>Jumlah Butir Soal: <strong>{penilaian.soalList.length} Soal</strong></p>
              <p>Alokasi Waktu: <strong>{penilaian.durasiMenit} Menit</strong></p>
              <p>Guru Pengampu: <strong>{penilaian.guruPengampu}</strong></p>
            </div>
          </div>

          {/* Matriks Kisi-Kisi Soal */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300 text-xs font-sans">
              <thead className="bg-slate-100 text-slate-800">
                <tr>
                  <th className="border border-slate-300 p-2 text-center w-10">No</th>
                  <th className="border border-slate-300 p-2">Tujuan Pembelajaran (TP)</th>
                  <th className="border border-slate-300 p-2">Materi Pokok</th>
                  <th className="border border-slate-300 p-2">Indikator Soal</th>
                  <th className="border border-slate-300 p-2 text-center w-20">Bentuk Soal</th>
                  <th className="border border-slate-300 p-2 text-center w-14">Level</th>
                  <th className="border border-slate-300 p-2 text-center w-14">No Soal</th>
                  <th className="border border-slate-300 p-2 text-center w-14">Bobot</th>
                </tr>
              </thead>
              <tbody>
                {penilaian.soalList.map((soal, idx) => (
                  <tr key={soal.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 text-[11px] leading-relaxed">
                      {penilaian.tujuanPembelajaran}
                    </td>
                    <td className="border border-slate-300 p-2 text-[11px]">
                      {penilaian.materiPokok}
                    </td>
                    <td className="border border-slate-300 p-2 text-[11px] leading-relaxed">
                      {soal.indikatorSoal || `Disajikan pertanyaan mengenai ${penilaian.materiPokok}, peserta didik mampu menjawab dengan benar.`}
                    </td>
                    <td className="border border-slate-300 p-2 text-center uppercase font-bold text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100">
                        {soal.tipe}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono font-semibold text-[11px]">
                      {soal.levelKognitif || 'C2'}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono font-bold">
                      {soal.nomor}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono font-bold text-emerald-700">
                      {soal.bobotPoin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan Pengesahan */}
          <div className="grid grid-cols-2 gap-8 text-xs font-sans mt-8 pt-4">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p>Kepala SDN Kedungringin 1 Beji</p>
              <div className="h-16" />
              <p className="font-bold underline uppercase">{profil.kepalaSekolah}</p>
              <p className="text-[11px] text-slate-600">NIP. {profil.nipKepalaSekolah}</p>
            </div>
            <div className="text-center">
              <p>Beji, Pasuruan, {penilaian.tanggalDibuat}</p>
              <p>Guru Pengampu Kelas / Mapel</p>
              <div className="h-16" />
              <p className="font-bold underline uppercase">{penilaian.guruPengampu}</p>
              <p className="text-[11px] text-slate-600">NIP. {penilaian.guruNip || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Modal Unduh / Cetak Kunci Jawaban & Rubrik Penskoran
export const KunciJawabanModal: React.FC<PrintModalProps> = ({ penilaian, profil, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const totalMaxScore = penilaian.soalList.reduce((acc, s) => acc + s.bobotPoin, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in duration-150">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Kunci Jawaban & Pedoman Penskoran</h3>
              <p className="text-[11px] text-slate-400">{penilaian.judul} • Total Skor: {totalMaxScore} Poin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto font-serif text-slate-900 print:p-0">
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Pemerintah Kabupaten Pasuruan • Dinas Pendidikan dan Kebudayaan</h4>
            <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 mt-0.5">{profil.nama}</h2>
            <p className="text-[11px] text-slate-600 italic">Kunci Jawaban Resmi Penilaian Harian • {penilaian.mataPelajaran} Kelas {penilaian.kelas}</p>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-sm sm:text-base font-extrabold uppercase underline decoration-1 underline-offset-4">
              KUNCI JAWABAN & PEDOMAN PENSKORAN RESMI
            </h3>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              KKTP: {penilaian.kkm} | Total Skor Maksimal: {totalMaxScore} Poin | Nilai Akhir = (Skor Perolehan ÷ {totalMaxScore}) × 100
            </p>
          </div>

          {/* Aturan Penskoran Sesuai Kebijakan */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs font-sans text-amber-950 mb-4 space-y-1">
            <p className="font-bold">Ketentuan Pembobotan Poin Resmi SDN Kedungringin 1 Beji:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li><strong>Pilihan Ganda (PG):</strong> 1 poin per butir benar (otomatis sistem).</li>
              <li><strong>Pilihan Ganda Kompleks (PGK):</strong> 1 poin per butir benar seluruh opsi (otomatis sistem).</li>
              <li><strong>Isian Singkat:</strong> 2 poin maksimal per butir (kebijakan guru: 0, 1, atau 2 poin).</li>
              <li><strong>Uraian Komprehensif:</strong> 3 poin maksimal per butir (kebijakan guru: 0, 1, 2, atau 3 poin).</li>
            </ul>
          </div>

          {/* Rincian Kunci Jawaban per Butir Soal */}
          <div className="space-y-4 font-sans text-xs">
            {penilaian.soalList.map((soal) => {
              const displayKey = Array.isArray(soal.kunciJawaban) 
                ? soal.kunciJawaban.join(', ')
                : String(soal.kunciJawaban);

              return (
                <div key={soal.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {soal.nomor}
                      </span>
                      <span>Tipe Soal: <strong className="uppercase">{soal.tipe}</strong></span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-[11px] text-slate-700">
                      Bobot: {soal.bobotPoin} Poin
                    </span>
                  </div>

                  <p className="text-slate-800 text-xs leading-relaxed">
                    <strong>Pertanyaan:</strong> {soal.pertanyaan}
                  </p>

                  <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 text-emerald-950">
                    <p className="font-bold text-[11px]">Kunci Jawaban / Kata Kunci:</p>
                    <p className="font-mono font-semibold text-xs mt-0.5">{displayKey}</p>
                  </div>

                  {soal.pembahasan && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 text-[11px]">
                      <span className="font-bold text-slate-900">Pembahasan / Catatan Rubrik:</span> {soal.pembahasan}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-8 text-xs font-sans mt-8 pt-4">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p>Kepala SDN Kedungringin 1 Beji</p>
              <div className="h-16" />
              <p className="font-bold underline uppercase">{profil.kepalaSekolah}</p>
              <p className="text-[11px] text-slate-600">NIP. {profil.nipKepalaSekolah}</p>
            </div>
            <div className="text-center">
              <p>Beji, Pasuruan, {penilaian.tanggalDibuat}</p>
              <p>Guru Pengampu Kelas / Mapel</p>
              <div className="h-16" />
              <p className="font-bold underline uppercase">{penilaian.guruPengampu}</p>
              <p className="text-[11px] text-slate-600">NIP. {penilaian.guruNip || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Modal Unduh / Cetak Lembar Soal Siswa (Siap Cetak / Dikerjakan Kertas)
export const LembarSoalModal: React.FC<PrintModalProps> = ({ penilaian, profil, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in duration-150">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Lembar Soal Penilaian Harian Siswa</h3>
              <p className="text-[11px] text-slate-400">{penilaian.judul} • Siap Cetak Kertas / PDF</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto font-serif text-slate-900 print:p-0">
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Pemerintah Kabupaten Pasuruan • Dinas Pendidikan dan Kebudayaan</h4>
            <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 mt-0.5">{profil.nama}</h2>
            <p className="text-[11px] text-slate-600 italic">{profil.alamat}, Kec. {profil.kecamatan}, Kab. {profil.kabupaten}</p>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-sm sm:text-base font-extrabold uppercase underline decoration-1 underline-offset-4">
              LEMBAR SOAL PENILAIAN HARIAN (PH)
            </h3>
            <p className="text-xs text-slate-600 font-sans mt-0.5">Tahun Ajaran: {penilaian.tahunPelajaran} • Kurikulum Merdeka</p>
          </div>

          {/* Kotak Identitas Siswa */}
          <div className="border border-slate-300 rounded-lg p-3 text-xs font-sans mb-5 bg-slate-50/50 print:bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>Nama Peserta Didik : ..............................................................</p>
                <p className="mt-1.5">Nomor Induk Siswa : ..............................................................</p>
                <p className="mt-1.5">Kelas / Rombel : <strong>Kelas {penilaian.kelas} ({penilaian.rombel || 'A'})</strong></p>
              </div>
              <div>
                <p>Mata Pelajaran : <strong>{penilaian.mataPelajaran}</strong></p>
                <p className="mt-1.5">Hari / Tanggal : ..............................................................</p>
                <p className="mt-1.5">Alokasi Waktu : <strong>{penilaian.durasiMenit} Menit</strong></p>
              </div>
            </div>
          </div>

          {/* Petunjuk Pengerjaan */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] font-sans text-slate-700 mb-6 print:border-none print:p-0">
            <p className="font-bold text-slate-900 mb-1">PETUNJUK UMUM:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Berdoalah sebelum mengerjakan soal sesuai keyakinan masing-masing.</li>
              <li>Tuliskan identitas Anda secara lengkap dan benar pada kolom yang disediakan.</li>
              <li>Bacalah setiap butir soal dengan teliti sebelum menjawab.</li>
              <li>Periksa kembali seluruh lembar jawaban sebelum diserahkan kepada guru pengawas.</li>
            </ol>
          </div>

          {/* Daftar Naskah Soal */}
          <div className="space-y-6 font-sans text-xs">
            {penilaian.soalList.map((soal) => (
              <div key={soal.id} className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-slate-900 shrink-0 font-mono text-sm">
                    {soal.nomor}.
                  </span>
                  <div className="space-y-2 flex-1">
                    <p className="text-slate-900 font-medium leading-relaxed whitespace-pre-line">
                      {soal.pertanyaan}
                    </p>

                    {/* Pilihan Ganda / Kompleks */}
                    {soal.opsi && soal.opsi.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-2">
                        {soal.opsi.map((ops, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2 text-slate-800">
                            <span className="w-4 h-4 rounded-full border border-slate-400 inline-block shrink-0" />
                            <span>{ops}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Isian Singkat space */}
                    {soal.tipe === 'isian' && (
                      <div className="pt-2">
                        <p className="text-slate-400 italic text-[11px]">Jawaban Singkat:</p>
                        <div className="border-b border-dotted border-slate-400 w-full h-8" />
                      </div>
                    )}

                    {/* Uraian space */}
                    {soal.tipe === 'uraian' && (
                      <div className="pt-2">
                        <p className="text-slate-400 italic text-[11px]">Jawaban Uraian / Pembahasan:</p>
                        <div className="border border-slate-200 rounded-lg h-24 w-full p-2" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Penutup */}
          <div className="text-center mt-12 pt-4 border-t border-slate-200 text-xs font-sans text-slate-500 italic">
            "Kejujuran adalah pondasi utama dalam menuntut ilmu dan meraih prestasi gemilang."
          </div>
        </div>
      </div>
    </div>
  );
};
