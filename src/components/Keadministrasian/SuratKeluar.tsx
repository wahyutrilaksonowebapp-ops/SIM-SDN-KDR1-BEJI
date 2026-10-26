import React, { useState } from 'react';
import { SuratKeluar, ProfilSekolah, Pegawai, Siswa } from '../../types';
import { 
  FileText, 
  Sparkles, 
  Send, 
  Printer, 
  Copy, 
  Check, 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Calendar,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { generateLetterWithAI, LetterGenerationResult } from '../../services/api';
import { ConfirmModal } from '../ConfirmModal';

interface SuratKeluarProps {
  suratList: SuratKeluar[];
  profil: ProfilSekolah;
  pegawaiList: Pegawai[];
  siswaList: Siswa[];
  onSaveSuratKeluar: (surat: SuratKeluar) => void;
  onDeleteSuratKeluar: (id: string) => void;
  onOpenLetterPrintModal: (letter: LetterGenerationResult) => void;
}

export const SuratKeluarComponent: React.FC<SuratKeluarProps> = ({
  suratList,
  profil,
  pegawaiList,
  siswaList,
  onSaveSuratKeluar,
  onDeleteSuratKeluar,
  onOpenLetterPrintModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<SuratKeluar['jenisSurat']>('keterangan_siswa');
  const [nomorSurat, setNomorSurat] = useState(`421.2/${String(suratList.length + 1).padStart(3, '0')}/424.072.24/2026`);
  const [recipient, setRecipient] = useState('');
  const [perihal, setPerihal] = useState('Surat Keterangan Aktif Sekolah');
  const [customNotes, setCustomNotes] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingNo, setDeletingNo] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Specific Form Details
  const [targetSiswaId, setTargetSiswaId] = useState(siswaList[0]?.id || '');
  const [targetPegawaiId, setTargetPegawaiId] = useState(pegawaiList[0]?.id || '');
  const [keperluan, setKeperluan] = useState('Pengurusan beasiswa Program Indonesia Pintar (PIP)');
  const [namaKegiatan, setNamaKegiatan] = useState('Bimbingan Teknis Implementasi Kurikulum Merdeka');
  const [tanggalAcara, setTanggalAcara] = useState('Senin, 20 Oktober 2026');
  const [tempatAcara, setTempatAcara] = useState('Aula Korwil Bidang Pendidikan Kecamatan Beji');

  // Generator State
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<LetterGenerationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick preset loader based on letter type
  const handleTypeChange = (type: SuratKeluar['jenisSurat']) => {
    setSelectedType(type);
    if (type === 'keterangan_siswa') {
      setPerihal('Surat Keterangan Siswa Aktif Sekolah');
      setKeperluan('Pengurusan beasiswa Program Indonesia Pintar (PIP)');
    } else if (type === 'keterangan_guru') {
      setPerihal('Surat Keterangan Pengabdian Pendidik / Tendik');
      setKeperluan('Kelengkapan administrasi pemberkasan Tunjangan Profesi Guru (TPG)');
    } else if (type === 'surat_tugas') {
      setPerihal('Surat Perintah Tugas (SPT)');
      setNamaKegiatan('Workshop Peningkatan Literasi dan Numerasi Berbasis Rapor Pendidikan');
    } else if (type === 'undangan') {
      setPerihal('Undangan Sosialisasi Program Sekolah dan Persiapan Asesmen');
      setRecipient('Bapak/Ibu Orang Tua / Wali Murid');
    } else if (type === 'pemberitahuan') {
      setPerihal('Pemberitahuan Pelaksanaan Ujian dan Libur Semester');
      setRecipient('Seluruh Orang Tua / Wali Murid SDN Kedungringin 1 Beji');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      let detailsPayload: Record<string, any> = {};

      if (selectedType === 'keterangan_siswa') {
        const s = siswaList.find((x) => x.id === targetSiswaId) || siswaList[0];
        detailsPayload = {
          nama: s.nama,
          nisn: s.nisn,
          nis: s.nis,
          kelas: `Kelas ${s.kelas} - ${s.rombel}`,
          tempatTanggalLahir: `${s.tempatLahir}, ${s.tanggalLahir}`,
          namaOrangTua: s.namaAyah,
          alamat: s.alamat,
          keperluan: keperluan,
        };
      } else if (selectedType === 'keterangan_guru') {
        const p = pegawaiList.find((x) => x.id === targetPegawaiId) || pegawaiList[0];
        detailsPayload = {
          nama: `${p.gelarDepan ? p.gelarDepan + ' ' : ''}${p.nama}${p.gelarBelakang ? ', ' + p.gelarBelakang : ''}`,
          nip: p.nip,
          pangkatGolongan: p.golongan,
          jabatan: p.jabatan,
          tmt: p.tmt,
          keperluan: keperluan,
        };
      } else if (selectedType === 'surat_tugas') {
        const p = pegawaiList.find((x) => x.id === targetPegawaiId) || pegawaiList[0];
        detailsPayload = {
          pegawaiDitugaskan: {
            nama: `${p.gelarDepan ? p.gelarDepan + ' ' : ''}${p.nama}${p.gelarBelakang ? ', ' + p.gelarBelakang : ''}`,
            nip: p.nip,
            jabatan: p.jabatan,
          },
          kegiatan: namaKegiatan,
          hariTanggal: tanggalAcara,
          tempat: tempatAcara,
        };
      } else if (selectedType === 'undangan' || selectedType === 'pemberitahuan') {
        detailsPayload = {
          tujuan: recipient,
          agenda: namaKegiatan,
          hariTanggal: tanggalAcara,
          tempat: tempatAcara,
          keperluan: keperluan,
        };
      }

      const result = await generateLetterWithAI({
        letterType: selectedType,
        nomorSurat,
        perihal,
        recipient: recipient || 'Pihak Terkait',
        details: detailsPayload,
        customNotes,
      });

      setGeneratedResult(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memanggil Gemini AI API.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLog = () => {
    if (!generatedResult) return;

    const payload: SuratKeluar = {
      id: `sk-${Date.now()}`,
      nomorSurat: generatedResult.nomorSurat,
      tanggalSurat: new Date().toISOString().split('T')[0],
      perihal: generatedResult.perihal,
      jenisSurat: selectedType,
      tujuan: recipient || 'Pihak Terkait',
      ringkasan: generatedResult.pembuka.substring(0, 120) + '...',
      fullContent: generatedResult.fullText,
      pejabatNip: profil.nipKepalaSekolah,
      status: 'Ditandatangani',
    };

    onSaveSuratKeluar(payload);
    setSaveSuccessMsg('Surat berhasil dicatat ke buku register Surat Keluar!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleCopyText = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = suratList.filter((s) =>
    s.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.perihal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tujuan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-700" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Generator Surat Resmi Otomatis (Gemini 3.8 Flash)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Membuat surat keterangan guru/tendik, siswa aktif, surat tugas dinas, undangan wali murid,
              dan pengumuman resmi berkop dinas SDN Kedungringin 1 Beji dalam hitungan detik.
            </p>
          </div>
        </div>

        {/* Letter Type Pills */}
        <div className="mt-5 flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'keterangan_siswa' as const, label: '1. Keterangan Siswa' },
            { id: 'keterangan_guru' as const, label: '2. Keterangan Guru / Tendik' },
            { id: 'surat_tugas' as const, label: '3. Surat Perintah Tugas (SPT)' },
            { id: 'undangan' as const, label: '4. Surat Undangan Resmi' },
            { id: 'pemberitahuan' as const, label: '5. Surat Pemberitahuan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTypeChange(item.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedType === item.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Input + AI Generated Result Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (5 Cols): Form Parameter Input */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Parameter Naskah Dinas
          </h3>

          <form onSubmit={handleGenerate} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nomor Surat Resmi *</label>
              <input
                type="text"
                required
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Perihal Surat *</label>
              <input
                type="text"
                required
                value={perihal}
                onChange={(e) => setPerihal(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Type Specific Fields */}
            {selectedType === 'keterangan_siswa' && (
              <div>
                <label className="block font-medium text-slate-700 mb-1">Pilih Siswa *</label>
                <select
                  value={targetSiswaId}
                  onChange={(e) => setTargetSiswaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {siswaList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} (Kelas {s.kelas} - NISN: {s.nisn})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(selectedType === 'keterangan_guru' || selectedType === 'surat_tugas') && (
              <div>
                <label className="block font-medium text-slate-700 mb-1">Pilih Pendidik / Tendik *</label>
                <select
                  value={targetPegawaiId}
                  onChange={(e) => setTargetPegawaiId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {pegawaiList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.jabatan} - NIP: {p.nip})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(selectedType === 'undangan' || selectedType === 'pemberitahuan') && (
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tujuan / Kepada Yth. *</label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Bapak/Ibu Orang Tua / Wali Murid Siswa Kelas 6"
                />
              </div>
            )}

            {(selectedType === 'surat_tugas' || selectedType === 'undangan' || selectedType === 'pemberitahuan') && (
              <>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Kegiatan / Agenda</label>
                  <input
                    type="text"
                    value={namaKegiatan}
                    onChange={(e) => setNamaKegiatan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Hari / Tanggal</label>
                    <input
                      type="text"
                      value={tanggalAcara}
                      onChange={(e) => setTanggalAcara(e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tempat</label>
                    <input
                      type="text"
                      value={tempatAcara}
                      onChange={(e) => setTempatAcara(e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-medium text-slate-700 mb-1">Keperluan / Keterangan Khusus</label>
              <textarea
                rows={2}
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Instruksi Tambahan ke Gemini AI</label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                placeholder="Gunakan bahasa baku dinas, penomoran rapi..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI Sedang Menyusun Surat...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Generate Draf Surat Resmi</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right (7 Cols): Formatted Letter Preview */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Pratinjau Naskah Dinas Resmi
              </h3>
              {generatedResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                  </button>
                  <button
                    onClick={() => onOpenLetterPrintModal(generatedResult)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Kop Resmi</span>
                  </button>
                </div>
              )}
            </div>

            {generatedResult ? (
              <div className="mt-4 p-6 bg-slate-50 border border-slate-200 rounded-xl font-serif text-slate-900 text-xs space-y-4 shadow-2xs leading-relaxed">
                {/* Official Letterhead */}
                <div className="text-center border-b-2 border-slate-900 pb-3 leading-tight space-y-0.5">
                  <div className="font-bold text-[11px] tracking-wider uppercase text-slate-800">
                    PEMERINTAH KABUPATEN PASURUAN
                  </div>
                  <div className="font-bold text-[12px] tracking-wide uppercase text-slate-800">
                    DINAS PENDIDIKAN DAN KEBUDAYAAN
                  </div>
                  <div className="font-black text-sm tracking-wide uppercase text-slate-950">
                    {profil.nama.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-slate-600 font-sans">
                    NPSN: {profil.npsn} | {profil.alamat}, Kec. {profil.kecamatan}, Kab. {profil.kabupaten} 67154
                  </div>
                  <div className="text-[10px] text-slate-600 font-sans">
                    Email: {profil.email} | Telepon: {profil.telepon}
                  </div>
                </div>

                {/* Title and Number */}
                <div className="text-center pt-2 space-y-0.5">
                  <div className="font-bold text-xs uppercase underline tracking-wider">
                    {generatedResult.letterTitle}
                  </div>
                  <div className="text-[11px] font-mono font-medium text-slate-700">
                    Nomor: {generatedResult.nomorSurat}
                  </div>
                </div>

                {/* Opening */}
                <div className="pt-2 text-justify">
                  {generatedResult.pembuka}
                </div>

                {/* Main Content */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-justify font-sans whitespace-pre-line text-[11px] text-slate-800 leading-normal">
                  {generatedResult.isiUtama}
                </div>

                {/* Closing */}
                <div className="text-justify">
                  {generatedResult.penutup}
                </div>

                {/* Signature Block */}
                <div className="pt-4 flex justify-end">
                  <div className="text-center w-64 space-y-1 font-sans">
                    <div>{generatedResult.tanggalSurat}</div>
                    <div className="font-semibold text-slate-800">{generatedResult.pejabat.jabatan},</div>
                    <div className="h-16 flex items-center justify-center text-slate-300 italic text-[10px]">
                      [Tanda Tangan & Cap Stempel Basah]
                    </div>
                    <div className="font-bold underline text-slate-950">
                      {generatedResult.pejabat.nama}
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono">
                      NIP. {generatedResult.pejabat.nip}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-12 py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-slate-700">Pratinjau Surat Belum Tersedia</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Silakan isi parameter surat di samping dan klik tombol "Generate Draf Surat Resmi"
                  untuk melihat hasil kompilasi cerdas.
                </p>
              </div>
            )}
          </div>

          {saveSuccessMsg && (
            <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-medium text-center">
              {saveSuccessMsg}
            </div>
          )}

          {generatedResult && (
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Draf siap diekspor atau dimasukkan ke buku agenda register.
              </span>
              <button
                onClick={handleSaveToLog}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simpan ke Register Surat Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Outgoing Letter Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Buku Agenda Register Surat Keluar
            </h4>
            <p className="text-[11px] text-slate-500">Rekaman nomor surat yang telah diterbitkan sekolah.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Cari surat keluar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-md text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">No</th>
                <th className="py-2.5 px-4">Nomor & Tanggal Surat</th>
                <th className="py-2.5 px-4">Perihal / Jenis</th>
                <th className="py-2.5 px-4">Tujuan / Penerima</th>
                <th className="py-2.5 px-4">Ringkasan Isi</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((item, idx) => (
                <tr key={`${item.id || 'sk'}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900 text-xs">{item.nomorSurat}</div>
                    <div className="text-[10px] text-slate-500">{item.tanggalSurat}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{item.perihal}</div>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                      {item.jenisSurat.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{item.tujuan}</td>
                  <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate">{item.ringkasan}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setDeletingId(item.id);
                        setDeletingNo(item.nomorSurat);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                    Belum ada rekaman surat keluar yang dicatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deletingId}
        title="Hapus Rekaman Surat Keluar"
        message={`Apakah Anda yakin ingin menghapus arsip surat nomor "${deletingNo}"?`}
        confirmText="Hapus Surat"
        cancelText="Batal"
        variant="danger"
        onConfirm={() => {
          if (deletingId) onDeleteSuratKeluar(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
