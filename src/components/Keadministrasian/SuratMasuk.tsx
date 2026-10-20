import React, { useState } from 'react';
import { SuratMasuk } from '../../types';
import { 
  Inbox, 
  Search, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle,
  Clock, 
  FileCheck, 
  AlertCircle
} from 'lucide-react';
import { formatIndoDate } from '../../utils/helpers';
import { ConfirmModal } from '../ConfirmModal';

interface SuratMasukProps {
  suratList: SuratMasuk[];
  onSaveSuratMasuk: (surat: SuratMasuk) => void;
  onDeleteSuratMasuk: (id: string) => void;
}

export const SuratMasukComponent: React.FC<SuratMasukProps> = ({
  suratList,
  onSaveSuratMasuk,
  onDeleteSuratMasuk,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SuratMasuk | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAgenda, setDeletingAgenda] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<SuratMasuk>>({
    nomorAgenda: `AGD/2026/${String(suratList.length + 1).padStart(3, '0')}`,
    nomorSuratMasuk: '',
    tanggalSurat: new Date().toISOString().split('T')[0],
    tanggalDiterima: new Date().toISOString().split('T')[0],
    pengirim: '',
    perihal: '',
    lampiran: '-',
    disposisiKepsek: '',
    ditujukanKepada: 'Semua Dewan Guru & Tenaga Kependidikan',
    statusDisposisi: 'Belum Disposisi',
  });

  const filtered = suratList.filter((s) => {
    const matchSearch =
      s.nomorAgenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nomorSuratMasuk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pengirim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.perihal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.statusDisposisi === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      nomorAgenda: `AGD/2026/${String(suratList.length + 1).padStart(3, '0')}`,
      nomorSuratMasuk: '',
      tanggalSurat: new Date().toISOString().split('T')[0],
      tanggalDiterima: new Date().toISOString().split('T')[0],
      pengirim: 'Dinas Pendidikan dan Kebudayaan Kab. Pasuruan',
      perihal: '',
      lampiran: '1 Berkas',
      disposisiKepsek: 'Tindak lanjuti sesuai petunjuk teknis.',
      ditujukanKepada: 'Operator Sekolah & Guru Terkait',
      statusDisposisi: 'Belum Disposisi',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: SuratMasuk) => {
    setEditingItem(item);
    setFormData({ ...item });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomorSuratMasuk || !formData.pengirim || !formData.perihal) {
      setFormError('Nomor surat, pengirim, dan perihal wajib diisi!');
      return;
    }
    setFormError(null);

    const payload: SuratMasuk = {
      id: editingItem ? editingItem.id : `sm-${Date.now()}`,
      nomorAgenda: formData.nomorAgenda || `AGD/2026/${Date.now()}`,
      nomorSuratMasuk: formData.nomorSuratMasuk,
      tanggalSurat: formData.tanggalSurat || new Date().toISOString().split('T')[0],
      tanggalDiterima: formData.tanggalDiterima || new Date().toISOString().split('T')[0],
      pengirim: formData.pengirim,
      perihal: formData.perihal,
      lampiran: formData.lampiran || '-',
      disposisiKepsek: formData.disposisiKepsek || 'Untuk diketahui dan ditindaklanjuti.',
      ditujukanKepada: formData.ditujukanKepada || 'Pihak Terkait',
      statusDisposisi: (formData.statusDisposisi || 'Belum Disposisi') as any,
    };

    onSaveSuratMasuk(payload);
    setModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'No Agenda',
      'No Surat Masuk',
      'Tanggal Surat',
      'Tanggal Diterima',
      'Pengirim / Instansi Asal',
      'Perihal',
      'Lampiran',
      'Disposisi Kepala Sekolah',
      'Ditujukan Kepada',
      'Status Disposisi',
    ];

    const rows = filtered.map((s) => [
      `"${s.nomorAgenda}"`,
      `"${s.nomorSuratMasuk}"`,
      `"${s.tanggalSurat}"`,
      `"${s.tanggalDiterima}"`,
      `"${s.pengirim}"`,
      `"${s.perihal}"`,
      `"${s.lampiran}"`,
      `"${s.disposisiKepsek}"`,
      `"${s.ditujukanKepada}"`,
      `"${s.statusDisposisi}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Agenda_Surat_Masuk_SDN_Kedungringin_1_${Date.now()}.csv`);
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
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Buku Agenda Surat Masuk & Lembar Disposisi Digital
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Pencatatan digital surat dinas masuk dari Dispendik, Korwil Beji, Puskesmas, dan mitra lainnya
            lengkap dengan tindak lanjut arahan/disposisi Kepala Sekolah.
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Surat Masuk</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari agenda, nomor surat, pengirim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <span className="text-slate-500">Status Disposisi:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">Semua Status ({suratList.length})</option>
            <option value="Belum Disposisi">Belum Disposisi ({suratList.filter(s => s.statusDisposisi === 'Belum Disposisi').length})</option>
            <option value="Proses Tindak Lanjut">Proses Tindak Lanjut ({suratList.filter(s => s.statusDisposisi === 'Proses Tindak Lanjut').length})</option>
            <option value="Selesai">Selesai ({suratList.filter(s => s.statusDisposisi === 'Selesai').length})</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Agenda & No Surat</th>
                <th className="py-3 px-4">Tanggal & Diterima</th>
                <th className="py-3 px-4">Pengirim</th>
                <th className="py-3 px-4">Perihal Surat</th>
                <th className="py-3 px-4">Disposisi & Arahan Kepsek</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {item.nomorAgenda}
                    </span>
                    <div className="font-mono text-slate-900 font-bold mt-1 text-xs">
                      {item.nomorSuratMasuk}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[11px]">
                    <div className="text-slate-800 font-medium">Surat: {formatIndoDate(item.tanggalSurat)}</div>
                    <div className="text-slate-500 mt-0.5">Diterima: {formatIndoDate(item.tanggalDiterima)}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.pengirim}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Lampiran: {item.lampiran}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 leading-snug max-w-xs">{item.perihal}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] leading-relaxed max-w-sm">
                      <div className="font-semibold text-slate-900 mb-0.5">
                        Arahan: "{item.disposisiKepsek}"
                      </div>
                      <div className="text-[10px] text-teal-700 font-medium">
                        Diteruskan ke: {item.ditujukanKepada}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.statusDisposisi === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.statusDisposisi === 'Proses Tindak Lanjut'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.statusDisposisi}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit / Beri Disposisi"
                        className="p-1.5 rounded-md text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(item.id);
                          setDeletingAgenda(item.nomorAgenda);
                        }}
                        title="Hapus Agenda"
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan agenda surat masuk yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Surat Masuk */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Agenda / Disposisi Surat Masuk' : 'Pencatatan Surat Masuk Baru'}
              </h3>
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
                  <label className="block font-medium text-slate-700 mb-1">Nomor Agenda Sekolah *</label>
                  <input
                    type="text"
                    required
                    value={formData.nomorAgenda || ''}
                    onChange={(e) => setFormData({ ...formData, nomorAgenda: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nomor Surat Asal Pengirim *</label>
                  <input
                    type="text"
                    required
                    value={formData.nomorSuratMasuk || ''}
                    onChange={(e) => setFormData({ ...formData, nomorSuratMasuk: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    placeholder="Contoh: 420/1205/424.072/2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal Surat Asal *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalSurat || ''}
                    onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal Diterima Sekolah *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalDiterima || ''}
                    onChange={(e) => setFormData({ ...formData, tanggalDiterima: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Instansi / Pihak Pengirim *</label>
                <input
                  type="text"
                  required
                  value={formData.pengirim || ''}
                  onChange={(e) => setFormData({ ...formData, pengirim: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="Dinas Pendidikan dan Kebudayaan Kab. Pasuruan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Perihal Surat *</label>
                  <input
                    type="text"
                    required
                    value={formData.perihal || ''}
                    onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lampiran</label>
                  <input
                    type="text"
                    value={formData.lampiran || '-'}
                    onChange={(e) => setFormData({ ...formData, lampiran: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    placeholder="1 Berkas / -"
                  />
                </div>
              </div>

              {/* Disposisi Section */}
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-3">
                <h4 className="font-bold text-teal-950 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-teal-700" />
                  Lembar Disposisi Kepala Sekolah
                </h4>

                <div>
                  <label className="block font-medium text-slate-800 mb-1">Instruksi / Catatan Arahan Kepala Sekolah</label>
                  <textarea
                    rows={2}
                    value={formData.disposisiKepsek || ''}
                    onChange={(e) => setFormData({ ...formData, disposisiKepsek: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    placeholder="Arahan tindak lanjut kepada guru atau operator..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-800 mb-1">Diteruskan / Ditugaskan Kepada</label>
                    <input
                      type="text"
                      value={formData.ditujukanKepada || ''}
                      onChange={(e) => setFormData({ ...formData, ditujukanKepada: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none"
                      placeholder="Operator Sekolah & Guru Kelas 5"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-800 mb-1">Status Disposisi</label>
                    <select
                      value={formData.statusDisposisi || 'Belum Disposisi'}
                      onChange={(e) => setFormData({ ...formData, statusDisposisi: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg font-bold focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Belum Disposisi">Belum Disposisi</option>
                      <option value="Proses Tindak Lanjut">Proses Tindak Lanjut</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
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
                  className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Agenda Surat Masuk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        title="Hapus Agenda Surat Masuk"
        message={`Apakah Anda yakin ingin menghapus catatan agenda surat masuk "${deletingAgenda}"?`}
        confirmText="Hapus Agenda"
        cancelText="Batal"
        variant="danger"
        onConfirm={() => {
          if (deletingId) onDeleteSuratMasuk(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
