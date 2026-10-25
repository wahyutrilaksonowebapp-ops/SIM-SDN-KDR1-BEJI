import React, { useState } from 'react';
import { NilaiIjazahBTQ, Siswa, ProfilSekolah } from '../../types';
import { 
  Award, 
  Search, 
  Plus, 
  Printer, 
  Download, 
  FileText, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { getBTQPredicate } from '../../utils/helpers';
import { ConfirmModal } from '../ConfirmModal';

interface IjazahBTQProps {
  btqList: NilaiIjazahBTQ[];
  siswaList: Siswa[];
  profil: ProfilSekolah;
  onSaveBTQ: (item: NilaiIjazahBTQ) => void;
  onDeleteBTQ: (id: string) => void;
  onOpenCertificateModal: (item: NilaiIjazahBTQ) => void;
}

export const IjazahBTQ: React.FC<IjazahBTQProps> = ({
  btqList,
  siswaList,
  profil,
  onSaveBTQ,
  onDeleteBTQ,
  onOpenCertificateModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NilaiIjazahBTQ | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formSiswaId, setFormSiswaId] = useState('');
  const [noSertifikat, setNoSertifikat] = useState('');
  const [tahsin, setTahsin] = useState<number>(85);
  const [tajwid, setTajwid] = useState<number>(85);
  const [tahfidz, setTahfidz] = useState<number>(85);
  const [menulis, setMenulis] = useState<number>(85);
  const [membaca, setMembaca] = useState<number>(85);
  const [catatan, setCatatan] = useState('Mampu membaca dengan tartil dan tajwid baik.');
  const [penguji, setPenguji] = useState('Wahyu Tri Laksono, S.Pd.I');
  const [tanggalTerbit, setTanggalTerbit] = useState('15 Juni 2026');

  // Computed average & predicate for form preview
  const currentAvg = Number(((tahsin + tajwid + tahfidz + menulis + membaca) / 5).toFixed(1));
  const predicateInfo = getBTQPredicate(currentAvg);

  const handleOpenAdd = () => {
    setEditingItem(null);
    const candidateSiswa = siswaList.find((s) => !btqList.some((b) => b.siswaId === s.id)) || siswaList[0];
    setFormSiswaId(candidateSiswa ? candidateSiswa.id : '');
    const nextSeq = String(btqList.length + 1).padStart(3, '0');
    setNoSertifikat(`421.2/BTQ-${nextSeq}/424.072.24/2026`);
    setTahsin(88);
    setTajwid(86);
    setTahfidz(90);
    setMenulis(84);
    setMembaca(90);
    setCatatan('Makhraj fasih, tartil, dan hafal surat-surat juz 30 dengan baik.');
    setPenguji('Wahyu Tri Laksono, S.Pd.I');
    setTanggalTerbit('15 Juni 2026');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: NilaiIjazahBTQ) => {
    setEditingItem(item);
    setFormSiswaId(item.siswaId);
    setNoSertifikat(item.noSertifikat);
    setTahsin(item.tahsin);
    setTajwid(item.tajwid);
    setTahfidz(item.tahfidz);
    setMenulis(item.menulis);
    setMembaca(item.membaca);
    setCatatan(item.catatan);
    setPenguji(item.penguji);
    setTanggalTerbit(item.tanggalTerbit);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selSiswa = siswaList.find((s) => s.id === formSiswaId);
    if (!selSiswa) {
      setFormError('Pilih siswa terlebih dahulu!');
      return;
    }
    setFormError(null);

    const avg = Number(((tahsin + tajwid + tahfidz + menulis + membaca) / 5).toFixed(1));
    const pred = getBTQPredicate(avg);

    const payload: NilaiIjazahBTQ = {
      id: editingItem ? editingItem.id : `btq-${Date.now()}`,
      siswaId: selSiswa.id,
      nisn: selSiswa.nisn,
      namaSiswa: selSiswa.nama,
      kelas: selSiswa.kelas,
      noSertifikat: noSertifikat || `421.2/BTQ-${Date.now()}/424.072.24/2026`,
      tahsin,
      tajwid,
      tahfidz,
      menulis,
      membaca,
      rataRata: avg,
      predikat: pred.predikat,
      statusKelulusan: pred.lulus ? 'Lulus' : 'Remedial',
      catatan,
      tanggalTerbit,
      penguji,
    };

    onSaveBTQ(payload);
    setModalOpen(false);
  };

  // Filter List
  const filtered = btqList.filter((b) => {
    const matchSearch =
      b.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.nisn.includes(searchTerm) ||
      b.noSertifikat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.statusKelulusan === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportCSV = () => {
    const headers = [
      'No Sertifikat',
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Tahsin (0-100)',
      'Tajwid (0-100)',
      'Tahfidz (0-100)',
      'Menulis (0-100)',
      'Membaca (0-100)',
      'Rata-rata',
      'Predikat',
      'Status Kelulusan',
      'Catatan Evaluasi',
      'Tanggal Terbit',
      'Penguji',
    ];

    const rows = filtered.map((b) => [
      `"${b.noSertifikat}"`,
      `"${b.nisn}"`,
      `"${b.namaSiswa}"`,
      `"Kelas ${b.kelas}"`,
      b.tahsin,
      b.tajwid,
      b.tahfidz,
      b.menulis,
      b.membaca,
      b.rataRata,
      `"${b.predikat}"`,
      `"${b.statusKelulusan}"`,
      `"${b.catatan}"`,
      `"${b.tanggalTerbit}"`,
      `"${b.penguji}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nilai_Ijazah_BTQ_SDN_Kedungringin_1_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Ijazah / Sertifikat Baca Tulis Al-Qur'an (BTQ)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Form penilaian 5 kompetensi BTQ: <strong>Tahsin, Tajwid, Tahfidz, Menulis, dan Membaca</strong>.
            Terintegrasi langsung dengan template resmi Google Docs dan generator piagam sertifikat siap cetak.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Input Nilai BTQ</span>
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama siswa, NISN, atau no sertifikat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <span className="text-slate-500">Status Kelulusan:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">Semua ({btqList.length})</option>
            <option value="Lulus">Lulus ({btqList.filter((b) => b.statusKelulusan === 'Lulus').length})</option>
            <option value="Remedial">Remedial ({btqList.filter((b) => b.statusKelulusan === 'Remedial').length})</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Siswa & Sertifikat</th>
                <th className="py-3 px-3 text-center">Tahsin</th>
                <th className="py-3 px-3 text-center">Tajwid</th>
                <th className="py-3 px-3 text-center">Tahfidz</th>
                <th className="py-3 px-3 text-center">Menulis</th>
                <th className="py-3 px-3 text-center">Membaca</th>
                <th className="py-3 px-4 text-center bg-emerald-50/70 font-bold text-emerald-950">Rerata</th>
                <th className="py-3 px-3 text-center">Predikat</th>
                <th className="py-3 px-3 text-center">Kelulusan</th>
                <th className="py-3 px-4 text-center">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item, idx) => {
                const pred = getBTQPredicate(item.rataRata);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.namaSiswa}</div>
                      <div className="text-[11px] font-mono text-slate-500">NISN: {item.nisn} • Kelas {item.kelas}</div>
                      <div className="text-[10px] text-emerald-700 font-mono mt-0.5">{item.noSertifikat}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium">{item.tahsin}</td>
                    <td className="py-3.5 px-3 text-center font-medium">{item.tajwid}</td>
                    <td className="py-3.5 px-3 text-center font-medium">{item.tahfidz}</td>
                    <td className="py-3.5 px-3 text-center font-medium">{item.menulis}</td>
                    <td className="py-3.5 px-3 text-center font-medium">{item.membaca}</td>
                    <td className="py-3.5 px-4 text-center bg-emerald-50/40">
                      <span className="text-sm font-extrabold text-emerald-800">{item.rataRata}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[10px] border ${pred.colorClass}`}>
                        {item.predikat}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          item.statusKelulusan === 'Lulus'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.statusKelulusan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenCertificateModal(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-[11px] shadow-2xs transition-colors cursor-pointer"
                          title="Cetak Piagam Ijazah Resmi"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Ijazah</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Nilai BTQ"
                          className="p-1.5 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(item.id);
                            setDeletingName(item.namaSiswa);
                          }}
                          title="Hapus Data"
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada rekaman nilai BTQ yang sesuai. Klik "Input Nilai BTQ" untuk menambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Nilai BTQ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? 'Edit Nilai Ujian BTQ' : 'Form Input Nilai Ujian BTQ'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pilih Siswa *</label>
                  <select
                    required
                    value={formSiswaId}
                    onChange={(e) => setFormSiswaId(e.target.value)}
                    disabled={!!editingItem}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {siswaList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} (Kelas {s.kelas} - {s.nisn})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nomor Sertifikat Ijazah *</label>
                  <input
                    type="text"
                    required
                    value={noSertifikat}
                    onChange={(e) => setNoSertifikat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="421.2/BTQ-001/424.072.24/2026"
                  />
                </div>
              </div>

              {/* 5 Components of BTQ */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    5 Komponen Penilaian Standar BTQ (Skala 0 - 100)
                  </h4>
                  <div className="text-right">
                    <span className="text-emerald-800 text-[11px] font-semibold">
                      Rata-rata: <strong>{currentAvg}</strong> ({predicateInfo.predikat})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">1. Tahsin (Makhraj)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={tahsin}
                      onChange={(e) => setTahsin(Number(e.target.value))}
                      className="w-full px-3 py-2 text-center font-bold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">2. Tajwid (Hukum)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={tajwid}
                      onChange={(e) => setTajwid(Number(e.target.value))}
                      className="w-full px-3 py-2 text-center font-bold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">3. Tahfidz (Juz 30)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={tahfidz}
                      onChange={(e) => setTahfidz(Number(e.target.value))}
                      className="w-full px-3 py-2 text-center font-bold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">4. Menulis (Khat)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={menulis}
                      onChange={(e) => setMenulis(Number(e.target.value))}
                      className="w-full px-3 py-2 text-center font-bold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">5. Membaca (Tartil)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={membaca}
                      onChange={(e) => setMembaca(Number(e.target.value))}
                      className="w-full px-3 py-2 text-center font-bold bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="p-2 bg-white rounded-lg border border-emerald-200 text-center">
                      <div className="text-[10px] text-slate-500">Status Kelulusan:</div>
                      <div className={`font-bold ${predicateInfo.lulus ? 'text-emerald-700' : 'text-red-600'}`}>
                        {predicateInfo.lulus ? 'LULUS' : 'REMEDIAL'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Catatan Evaluasi / Rekomendasi Pembimbing</label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Catatan mengenai kelancaran hafalan dan tajwid siswa..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal Terbit Sertifikat</label>
                  <input
                    type="text"
                    value={tanggalTerbit}
                    onChange={(e) => setTanggalTerbit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Contoh: 15 Juni 2026"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Guru PAI / Penguji</label>
                  <input
                    type="text"
                    value={penguji}
                    onChange={(e) => setPenguji(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Wahyu Tri Laksono, S.Pd.I"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {formError}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Nilai BTQ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        title="Hapus Nilai BTQ"
        message={`Apakah Anda yakin ingin menghapus data nilai ujian BTQ siswa "${deletingName}"?`}
        confirmText="Hapus Nilai"
        cancelText="Batal"
        variant="danger"
        onConfirm={() => {
          if (deletingId) onDeleteBTQ(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
