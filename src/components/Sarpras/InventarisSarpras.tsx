import React, { useState } from 'react';
import { SarprasItem, UserRole } from '../../types';
import { ConfirmModal } from '../ConfirmModal';
import { 
  Building2, 
  Search, 
  Plus, 
  Download, 
  Filter, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  X, 
  CheckCircle,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Image as ImageIcon
} from 'lucide-react';

interface InventarisSarprasProps {
  sarpras: SarprasItem[];
  userRole?: UserRole;
  onSaveSarpras: (item: SarprasItem) => void;
  onDeleteSarpras: (id: string) => void;
}

export const InventarisSarpras: React.FC<InventarisSarprasProps> = ({
  sarpras,
  userRole = 'admin',
  onSaveSarpras,
  onDeleteSarpras,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [kondisiFilter, setKondisiFilter] = useState<string>('ALL');
  const [kategoriFilter, setKategoriFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SarprasItem | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<SarprasItem>>({
    namaSarpras: '',
    kategori: 'Ruang Pembelajaran',
    jumlah: 1,
    satuan: 'Ruang',
    luasM2: 56,
    kondisi: 'Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    keterangan: '',
    lokasi: 'Kampus SDN Kedungringin 1',
  });

  const filtered = sarpras.filter((item) => {
    const matchSearch =
      item.namaSarpras.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKondisi = kondisiFilter === 'ALL' || item.kondisi === kondisiFilter;
    const matchKategori = kategoriFilter === 'ALL' || item.kategori === kategoriFilter;
    return matchSearch && matchKondisi && matchKategori;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      namaSarpras: '',
      kategori: 'Ruang Pembelajaran',
      jumlah: 1,
      satuan: 'Ruang',
      luasM2: 56,
      kondisi: 'Baik',
      fotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
      keterangan: 'Fasilitas dalam kondisi siap pakai.',
      lokasi: 'Kampus SDN Kedungringin 1',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: SarprasItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaSarpras) {
      setFormError('Nama Sarpras wajib diisi!');
      return;
    }
    setFormError(null);

    const payload: SarprasItem = {
      id: editingItem ? editingItem.id : `srp-${Date.now()}`,
      namaSarpras: formData.namaSarpras,
      kategori: (formData.kategori || 'Ruang Pembelajaran') as any,
      jumlah: Number(formData.jumlah || 1),
      satuan: formData.satuan || 'Ruang',
      luasM2: Number(formData.luasM2 || 0),
      kondisi: (formData.kondisi || 'Baik') as any,
      fotoUrl: formData.fotoUrl || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
      keterangan: formData.keterangan || '-',
      lokasi: formData.lokasi || 'Kampus Sekolah',
    };

    onSaveSarpras(payload);
    setModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Nama Sarpras', 'Kategori', 'Jumlah', 'Satuan', 'Luas (m2)', 'Kondisi', 'Lokasi', 'Keterangan', 'Link Foto'];
    const rows = filtered.map((s) => [
      `"${s.namaSarpras}"`,
      `"${s.kategori}"`,
      s.jumlah,
      `"${s.satuan}"`,
      s.luasM2 || 0,
      `"${s.kondisi}"`,
      `"${s.lokasi}"`,
      `"${s.keterangan}"`,
      `"${s.fotoUrl}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Sarpras_SDN_Kedungringin_1_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const baikCount = sarpras.filter((s) => s.kondisi === 'Baik').length;
  const rusakRinganCount = sarpras.filter((s) => s.kondisi === 'Rusak Ringan').length;
  const rusakBeratCount = sarpras.filter((s) => s.kondisi === 'Rusak Berat').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Inventaris Sarana & Prasarana Sekolah
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Pencatatan jenis sarpras, status kelaikan fisik (<strong>Baik, Rusak Ringan, Rusak Berat</strong>),
            luas area, dan dokumentasi foto riil sekolah.
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
          {userRole === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sarpras</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setKondisiFilter(kondisiFilter === 'Baik' ? 'ALL' : 'Baik')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            kondisiFilter === 'Baik' ? 'bg-emerald-100 border-emerald-400' : 'bg-emerald-50/70 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Kondisi Baik</span>
            </div>
            <span className="text-lg font-bold text-emerald-900">{baikCount} Unit</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Laik operasional pembelajaran & kegiatan siswa.</p>
        </div>

        <div 
          onClick={() => setKondisiFilter(kondisiFilter === 'Rusak Ringan' ? 'ALL' : 'Rusak Ringan')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            kondisiFilter === 'Rusak Ringan' ? 'bg-amber-100 border-amber-400' : 'bg-amber-50/70 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Rusak Ringan</span>
            </div>
            <span className="text-lg font-bold text-amber-900">{rusakRinganCount} Unit</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Perlu pemeliharaan rutin BOS / perbaikan minor.</p>
        </div>

        <div 
          onClick={() => setKondisiFilter(kondisiFilter === 'Rusak Berat' ? 'ALL' : 'Rusak Berat')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            kondisiFilter === 'Rusak Berat' ? 'bg-red-100 border-red-400' : 'bg-red-50/70 border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-800 font-semibold text-xs">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <span>Rusak Berat</span>
            </div>
            <span className="text-lg font-bold text-red-900">{rusakBeratCount} Unit</span>
          </div>
          <p className="text-[11px] text-red-700 mt-1">Perlu usulan proposal rehabilitasi DAK fisik Dispendik.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari sarpras, lokasi, atau keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto text-xs">
          <select
            value={kondisiFilter}
            onChange={(e) => setKondisiFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">Semua Kondisi ({sarpras.length})</option>
            <option value="Baik">Hanya Baik ({baikCount})</option>
            <option value="Rusak Ringan">Hanya Rusak Ringan ({rusakRinganCount})</option>
            <option value="Rusak Berat">Hanya Rusak Berat ({rusakBeratCount})</option>
          </select>

          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Ruang Pembelajaran">Ruang Pembelajaran</option>
            <option value="Ruang Penunjang">Ruang Penunjang</option>
            <option value="Sanitasi & Ibadah">Sanitasi & Ibadah</option>
            <option value="Fasilitas Terbuka">Fasilitas Terbuka</option>
            <option value="Peralatan">Peralatan</option>
          </select>

          {(kondisiFilter !== 'ALL' || kategoriFilter !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setKondisiFilter('ALL');
                setKategoriFilter('ALL');
                setSearchTerm('');
              }}
              className="text-slate-500 hover:text-red-600 px-2 py-1 text-xs underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid Cards of Sarpras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const isBaik = item.kondisi === 'Baik';
          const isRingan = item.kondisi === 'Rusak Ringan';
          const isBerat = item.kondisi === 'Rusak Berat';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
                  <img
                    src={item.fotoUrl}
                    alt={item.namaSarpras}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-slate-900/80 backdrop-blur-xs text-white uppercase">
                      {item.kategori}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-xs ${
                        isBaik
                          ? 'bg-emerald-500 text-white'
                          : isRingan
                          ? 'bg-amber-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {item.kondisi}
                    </span>
                  </div>

                  <button
                    onClick={() => setActivePhotoModal(item.fotoUrl)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Perbesar Foto"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {item.namaSarpras}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                      {item.jumlah} {item.satuan}
                    </span>
                    {item.luasM2 ? (
                      <span className="text-slate-500 text-[11px]">
                        Luas: <strong>{item.luasM2} m²</strong>
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.keterangan || 'Tidak ada catatan keterangan fasilitas.'}
                  </p>

                  <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-100">
                    <span>📍</span>
                    <span>{item.lokasi || 'Kampus Sekolah'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                {userRole === 'admin' ? (
                  <>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(item.id);
                        setDeletingName(item.namaSarpras);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Hanya Lihat</span>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada data sarpras</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Silakan sesuaikan kata kunci pencarian atau filter kondisi sarpras.
            </p>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Sarpras */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingItem ? 'Edit Data Sarpras' : 'Tambah Fasilitas Sarpras Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Sarana / Prasarana *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaSarpras}
                  onChange={(e) => setFormData({ ...formData, namaSarpras: e.target.value })}
                  placeholder="Contoh: Laboratorium Komputer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Ruang Pembelajaran">Ruang Pembelajaran</option>
                    <option value="Ruang Penunjang">Ruang Penunjang</option>
                    <option value="Sanitasi & Ibadah">Sanitasi & Ibadah</option>
                    <option value="Fasilitas Terbuka">Fasilitas Terbuka</option>
                    <option value="Peralatan">Peralatan</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kondisi Fisik</label>
                  <select
                    value={formData.kondisi}
                    onChange={(e) => setFormData({ ...formData, kondisi: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    placeholder="Ruang / Unit"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Luas (m²)</label>
                  <input
                    type="number"
                    value={formData.luasM2}
                    onChange={(e) => setFormData({ ...formData, luasM2: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lokasi Kampus</label>
                <input
                  type="text"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  placeholder="Contoh: Gedung Timur Lantai 1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tautan URL Foto</label>
                <input
                  type="url"
                  value={formData.fotoUrl}
                  onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keterangan Spesifikasi</label>
                <textarea
                  rows={2}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Keterangan kondisi mebeler, listrik, atau renovasi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-medium shadow-xs"
                >
                  Simpan Sarpras
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Enlarge Modal */}
      {activePhotoModal && (
        <div 
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl">
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePhotoModal}
              alt="Sarpras Foto"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Hapus Data Sarpras?"
        message={`Apakah Anda yakin ingin menghapus "${deletingName}" dari daftar inventaris sarana dan prasarana? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Data"
        cancelText="Batal"
        variant="danger"
        onConfirm={() => {
          if (deletingId) {
            onDeleteSarpras(deletingId);
            setDeletingId(null);
          }
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
