import React, { useState } from 'react';
import { AnggotaPerpustakaan, ProfilSekolah } from '../../types';
import { X, Printer, BookOpen, ShieldCheck, Download, Check, Sparkles, Filter } from 'lucide-react';

interface CetakKartuPerpusModalProps {
  anggotaList: AnggotaPerpustakaan[];
  selectedAnggotaId: string | null;
  profil: ProfilSekolah;
  onClose: () => void;
}

export const CetakKartuPerpusModal: React.FC<CetakKartuPerpusModalProps> = ({
  anggotaList,
  selectedAnggotaId,
  profil,
  onClose,
}) => {
  const [currentId, setCurrentId] = useState<string>(selectedAnggotaId || (anggotaList[0]?.id ?? ''));
  const [printMode, setPrintMode] = useState<'single' | 'batch'>('single');
  const [filterKelas, setFilterKelas] = useState<string>('ALL');

  const selectedMember = anggotaList.find((m) => m.id === currentId) || anggotaList[0];

  const filteredBatch = anggotaList.filter((m) => {
    if (filterKelas === 'ALL') return true;
    return m.kelasOrUnit.includes(filterKelas);
  });

  const handlePrint = () => {
    window.print();
  };

  const renderSingleCard = (member: AnggotaPerpustakaan, index: number = 0) => {
    return (
      <div 
        key={member.id} 
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto page-break-inside-avoid print:m-0 print:mb-6"
      >
        {/* TAMPAK DEPAN KARTU */}
        <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-cyan-900 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden border border-emerald-600/40 min-h-[260px] flex flex-col justify-between">
          {/* Background watermark */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <BookOpen className="w-56 h-56 text-white" />
          </div>

          {/* Header Kartu */}
          <div className="border-b border-emerald-400/30 pb-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center p-1.5 border border-white/20 shrink-0">
              <span className="text-2xl">📚</span>
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-300">
                PEMERINTAH KABUPATEN PASURUAN
              </p>
              <h3 className="text-sm font-extrabold tracking-wide text-white uppercase">
                {profil.nama || 'SDN KEDUNGRINGIN 1 BEJI'}
              </h3>
              <p className="text-[10px] text-emerald-200">
                PERPUSTAKAAN SEKOLAH "PELITA ILMU"
              </p>
            </div>
          </div>

          {/* Body Kartu */}
          <div className="py-3 flex items-center gap-4 relative z-10">
            {/* Foto Anggota */}
            <div className="w-20 h-24 rounded-lg bg-emerald-950/60 border-2 border-emerald-400/60 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
              {Boolean(member.fotoUrl && member.fotoUrl.trim()) ? (
                <img src={member.fotoUrl} alt={member.nama} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-1 text-emerald-200">
                  <span className="text-2xl block mb-1">👤</span>
                  <span className="text-[9px] uppercase font-bold">FOTO 3X4</span>
                </div>
              )}
            </div>

            {/* Identitas */}
            <div className="space-y-1 text-xs">
              <div>
                <p className="text-[10px] text-emerald-300 uppercase font-semibold">Nama Lengkap</p>
                <p className="font-bold text-white text-sm leading-snug">{member.nama}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <p className="text-[9px] text-emerald-300 uppercase">No. Anggota</p>
                  <p className="font-mono font-bold text-amber-300">{member.nomorAnggota}</p>
                </div>
                <div>
                  <p className="text-[9px] text-emerald-300 uppercase">NISN / NIP</p>
                  <p className="font-mono text-emerald-100">{member.nisnOrNip}</p>
                </div>
                <div>
                  <p className="text-[9px] text-emerald-300 uppercase">Kelas / Unit</p>
                  <p className="font-semibold text-white">{member.kelasOrUnit}</p>
                </div>
                <div>
                  <p className="text-[9px] text-emerald-300 uppercase">Status</p>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-medium">
                    {member.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Kartu & Barcode */}
          <div className="border-t border-emerald-400/30 pt-2 flex items-center justify-between text-[10px] text-emerald-200 relative z-10">
            <div>
              <span className="font-mono tracking-widest text-xs font-bold text-emerald-100 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-400/20">
                * {member.nomorAnggota} *
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px]">Berlaku s.d. Lulus</span>
            </div>
          </div>
        </div>

        {/* TAMPAK BELAKANG KARTU */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-700 min-h-[260px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Tata Tertib Anggota Perpustakaan
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">KETENTUAN</span>
            </div>
            <ol className="text-[11px] text-slate-300 space-y-1.5 mt-2.5 list-decimal list-inside leading-relaxed">
              <li>Kartu ini adalah tanda bukti resmi keanggotaan perpustakaan sekolah.</li>
              <li>Wajib dibawa setiap kali meminjam, membaca, atau mengembalikan koleksi buku.</li>
              <li>Peminjaman maksimal 3 eksemplar buku dengan batas waktu 7 (tujuh) hari kerja.</li>
              <li>Wajib merawat dan menjaga kebersihan serta keutuhan buku yang dipinjam.</li>
              <li>Keterlambatan atau kehilangan buku wajib dilaporkan ke petugas perpustakaan.</li>
            </ol>
          </div>

          <div className="border-t border-slate-800 pt-3 flex items-end justify-between text-[10px]">
            <div className="text-slate-400 text-[9px] leading-tight max-w-[140px]">
              Alamat: {profil.alamat || 'Jl. Raya Beji No. 12, Pasuruan'}<br />
              NPSN: {profil.npsn || '20519312'}
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-[10px]">Beji, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-slate-300 font-semibold text-[10px] mt-0.5">Kepala Perpustakaan,</p>
              <div className="h-9 flex items-center justify-center">
                <span className="text-[10px] font-serif italic text-emerald-400/80">[Tanda Tangan & Cap]</span>
              </div>
              <p className="font-bold text-white text-[10px] underline underline-offset-2">Ahmad Muzakki, S.Pd.I</p>
              <p className="text-slate-400 text-[9px]">NIP. 19820315 200902 1 003</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cetak Kartu Perpustakaan Sekolah</h2>
              <p className="text-xs text-emerald-200">
                SDN Kedungringin 1 Beji • Format Kartu Standar Siap Cetak A4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Mode Cetak:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                onClick={() => setPrintMode('single')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  printMode === 'single'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cetak Per Siswa
              </button>
              <button
                onClick={() => setPrintMode('batch')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  printMode === 'batch'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cetak Sekaligus (Batch A4)
              </button>
            </div>
          </div>

          {printMode === 'single' ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Pilih Anggota:</span>
              <select
                value={currentId}
                onChange={(e) => setCurrentId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {anggotaList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nomorAnggota} - {m.nama} ({m.kelasOrUnit})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Filter Kelas:</span>
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Kelas & Guru ({anggotaList.length})</option>
                <option value="Kelas 1">Kelas 1</option>
                <option value="Kelas 2">Kelas 2</option>
                <option value="Kelas 3">Kelas 3</option>
                <option value="Kelas 4">Kelas 4</option>
                <option value="Kelas 5">Kelas 5</option>
                <option value="Kelas 6">Kelas 6</option>
                <option value="Guru">Guru / Tenaga Pendidik</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen (Print)
            </button>
          </div>
        </div>

        {/* Modal Printable Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/60 print:bg-white print:p-0">
          <div className="print:hidden mb-4 text-center">
            <p className="text-xs text-slate-500 bg-emerald-50 text-emerald-800 py-1.5 px-3 rounded-lg border border-emerald-200 inline-block">
              💡 Format kartu sudah dioptimasi untuk kertas A4 (Depan & Belakang berdampingan). Siap cetak warna menggunakan printer sekolah.
            </p>
          </div>

          {printMode === 'single' ? (
            <div>{selectedMember && renderSingleCard(selectedMember)}</div>
          ) : (
            <div className="space-y-6">
              {filteredBatch.map((member, idx) => renderSingleCard(member, idx))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
