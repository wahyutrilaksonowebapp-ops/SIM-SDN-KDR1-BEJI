import React from 'react';
import { ProgramRemedialPengayaan, ProfilSekolah } from '../../../types';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface CetakDokumenRemedialModalProps {
  program: ProgramRemedialPengayaan;
  profil: ProfilSekolah;
  onClose: () => void;
}

export const CetakDokumenRemedialModal: React.FC<CetakDokumenRemedialModalProps> = ({
  program,
  profil,
  onClose,
}) => {
  const isRemedial = program.jenis === 'remedial';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isRemedial ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cetak Lembar Dokumen {isRemedial ? 'Remedial' : 'Pengayaan'}
              </h3>
              <p className="text-xs text-slate-300">
                {program.kodeProgram} • {program.mataPelajaran} - Kelas {program.kelas}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible space-y-6 text-slate-800 text-xs">
          {/* KOP RESMI SEKOLAH */}
          <div className="border-b-2 border-slate-900 pb-4 text-center relative">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-800 flex items-center justify-center bg-emerald-50 text-emerald-900 font-extrabold text-sm">
                SDN KDR 1
              </div>
              <div className="flex-1 px-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  PEMERINTAH KABUPATEN PASURUAN • DINAS PENDIDIKAN DAN KEBUDAYAAN
                </h4>
                <h2 className="text-lg font-black uppercase text-slate-900 tracking-wide">
                  {profil.nama || 'UPT SATUAN PENDIDIKAN FORMAL SDN KEDUNGRINGIN 1 BEJI'}
                </h2>
                <p className="text-[11px] text-slate-600">
                  {profil.alamat || 'Dusun Kedungringin Selatan, Kedungringin, Kec. Beji, Kab. Pasuruan, Jawa Timur 67154'}
                </p>
                <p className="text-[10px] text-slate-500">
                  NPSN: {profil.npsn || '20519313'} • Email: {profil.email || 'sdnkedungringin1beji@gmail.com'}
                </p>
              </div>
              <div className="w-16 h-16 rounded-full border-2 border-slate-400 flex items-center justify-center bg-slate-50 text-slate-700 font-bold text-xs">
                KAB. PAS
              </div>
            </div>
            <div className="w-full h-0.5 bg-slate-900 mt-3" />
          </div>

          {/* JUDUL DOKUMEN */}
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 underline">
              {isRemedial ? 'LEMBAR PENUGASAN PERBAIKAN & PROGRAM REMEDIAL' : 'LEMBAR PENUGASAN EKSPLORASI PROGRAM PENGAYAAN'}
            </h3>
            <p className="text-[11px] font-semibold text-slate-600">
              Tahun Ajaran {profil.tahunPelajaranAktif || '2026/2027'} • Standar KKTP/KKM: {program.kkm}
            </p>
          </div>

          {/* INFORMASI UMUM */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <div className="flex"><span className="w-32 text-slate-500 font-medium">Mata Pelajaran:</span> <span className="font-bold text-slate-800">{program.mataPelajaran}</span></div>
              <div className="flex"><span className="w-32 text-slate-500 font-medium">Tingkat Kelas / Rombel:</span> <span className="font-bold text-slate-800">Kelas {program.kelas} {program.rombel}</span></div>
              <div className="flex"><span className="w-32 text-slate-500 font-medium">Materi Pokok:</span> <span className="font-bold text-slate-800">{program.materiPokok}</span></div>
              <div className="flex"><span className="w-32 text-slate-500 font-medium">Guru Pengampu:</span> <span className="font-bold text-slate-800">{program.guruPengampu}</span></div>
            </div>
            <div className="space-y-1">
              <div className="flex"><span className="w-32 text-slate-500 font-medium">Kode Program:</span> <span className="font-mono font-bold text-slate-800">{program.kodeProgram}</span></div>
              <div className="flex"><span className="w-32 text-slate-500 font-medium">Tanggal Diterbitkan:</span> <span className="text-slate-800">{program.tanggalDibuat}</span></div>
              <div className="flex"><span className="w-32 text-slate-500 font-medium">Batas Waktu:</span> <span className="text-slate-800 font-semibold">{program.batasWaktu}</span></div>
              <div className="flex"><span className="w-32 text-slate-500 font-medium">Tujuan Pembelajaran:</span> <span className="text-slate-800 italic line-clamp-2">{program.tujuanPembelajaran}</span></div>
            </div>
          </div>

          {/* DAFTAR SISWA PESERTA PROGRAM */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <span>A. Daftar Peserta Didik Penerima Penugasan</span>
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2 text-center w-10">No</th>
                    <th className="p-2">Nama Peserta Didik</th>
                    <th className="p-2 text-center">NISN</th>
                    <th className="p-2 text-center">Nilai Awal</th>
                    <th className="p-2 text-center">Standar KKTP</th>
                    <th className="p-2 text-center">Nilai Perbaikan</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {program.daftarSiswa.map((sis, idx) => (
                    <tr key={sis.siswaId || idx} className="hover:bg-slate-50">
                      <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-800">{sis.namaSiswa}</td>
                      <td className="p-2 text-center font-mono text-slate-600">{sis.nisn}</td>
                      <td className="p-2 text-center font-bold text-red-600">{sis.nilaiAwal}</td>
                      <td className="p-2 text-center font-semibold text-slate-700">{sis.kkm}</td>
                      <td className="p-2 text-center font-bold text-emerald-700">
                        {sis.nilaiPerbaikan !== undefined ? sis.nilaiPerbaikan : '-'}
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sis.status === 'Tuntas Perbaikan' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sis.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MATERI PANDUAN SCAFFOLDING OLEH AI */}
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-2">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>B. Rangkuman Konsep Pembelajaran & Bimbingan Terarah (Scaffolding AI)</span>
            </h4>
            <div className="text-slate-700 whitespace-pre-line leading-relaxed text-[11px] bg-white p-3 rounded-lg border border-emerald-100">
              {program.ringkasanMateriScaffolding}
            </div>
            {program.rekomendasiMetodeGuru && (
              <p className="text-[10px] text-emerald-800 italic">
                *Catatan Pendekatan Guru: {program.rekomendasiMetodeGuru}
              </p>
            )}
          </div>

          {/* BUTIR SOAL PERBAIKAN */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>C. Butir Soal Penugasan {isRemedial ? 'Remedial' : 'Pengayaan'}</span>
            </h4>
            <div className="space-y-3">
              {program.soalList.map((soal) => (
                <div key={soal.nomor} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-800">
                      {soal.nomor}. {soal.pertanyaan}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[9px] uppercase tracking-wider">
                      {soal.tipe}
                    </span>
                  </div>

                  {/* Opsi jika PG */}
                  {soal.opsi && soal.opsi.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4 pt-1">
                      {soal.opsi.map((ops, oIdx) => (
                        <div key={oIdx} className="text-slate-600 text-[11px]">
                          {ops}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lembar Jawaban Kosong untuk pengerjaan tertulis cetak */}
                  <div className="border-t border-dashed border-slate-300 pt-2 text-[10px] text-slate-400">
                    <span className="font-medium text-slate-500">Jawaban Siswa: __________________________________________________</span>
                  </div>

                  {/* Petunjuk pengerjaan */}
                  {soal.petunjukPengerjaan && (
                    <div className="text-[10px] text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1">
                      <span className="font-bold text-slate-600">Petunjuk Belajar:</span>
                      <span>{soal.petunjukPengerjaan}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* KUNCI JAWABAN & PEDOMAN GURU */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">
              D. Kunci Jawaban & Rubrik Penskoran Guru
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              {program.soalList.map((soal) => (
                <div key={soal.nomor} className="bg-white p-2 rounded border border-slate-200">
                  <span className="font-bold text-slate-800">No. {soal.nomor} ({soal.tipe.toUpperCase()}): </span>
                  <span className="font-semibold text-emerald-800">{soal.kunciJawaban}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LEMBAR PENGESAHAN TANDA TANGAN */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-[11px] text-slate-700">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold text-slate-900">Kepala UPT SPF SDN Kedungringin 1</p>
              <div className="h-16" />
              <p className="font-bold text-slate-900 underline">{profil.kepalaSekolah || 'Hj. Siti Fatimah, S.Pd., M.Pd.'}</p>
              <p className="text-[10px] text-slate-500">NIP. {profil.nipKepalaSekolah || '19740512 199803 2 004'}</p>
            </div>
            <div>
              <p>Pasuruan, {program.tanggalDibuat}</p>
              <p className="font-bold text-slate-900">Guru Pengampu Mata Pelajaran</p>
              <div className="h-16" />
              <p className="font-bold text-slate-900 underline">{program.guruPengampu}</p>
              <p className="text-[10px] text-slate-500">NIP. {program.guruNip || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
