import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Search, 
  Send, 
  Mail, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  Filter, 
  Trash2, 
  Check, 
  User, 
  RefreshCw,
  MessageCircle,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { 
  getAllGuestFeedback, 
  respondToGuestFeedback, 
  markFeedbackAsRead, 
  deleteGuestFeedback, 
  getUnreadFeedbackCount 
} from '../services/guestChatService';
import { GuestFeedbackChat } from '../types';

interface AdminFeedbackManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  adminName?: string;
}

export const AdminFeedbackManagementModal: React.FC<AdminFeedbackManagementModalProps> = ({
  isOpen,
  onClose,
  onNotify = () => {},
  adminName = 'Administrator SIM SDN Kedungringin 1',
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<GuestFeedbackChat | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Baru' | 'Diproses' | 'Ditindaklanjuti'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Follow-up Form State
  const [replyMessage, setReplyMessage] = useState('');
  const [followUpStatus, setFollowUpStatus] = useState<'Diproses' | 'Ditindaklanjuti'>('Ditindaklanjuti');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allFeedback = useMemo(() => {
    return getAllGuestFeedback();
  }, [refreshKey]);

  const unreadCount = useMemo(() => {
    return getUnreadFeedbackCount();
  }, [refreshKey]);

  const filteredList = useMemo(() => {
    return allFeedback.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && item.kategori !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.senderName.toLowerCase().includes(q);
        const matchEmail = item.senderEmail.toLowerCase().includes(q);
        const matchWa = item.senderWhatsApp.includes(q);
        const matchTitle = item.judul.toLowerCase().includes(q);
        const matchMsg = item.pesan.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchWa && !matchTitle && !matchMsg && !matchId) {
          return false;
        }
      }
      return true;
    });
  }, [allFeedback, statusFilter, categoryFilter, searchQuery]);

  if (!isOpen) return null;

  const handleSelectTicket = (ticket: GuestFeedbackChat) => {
    setSelectedTicket(ticket);
    if (!ticket.isReadByAdmin) {
      markFeedbackAsRead(ticket.id);
      setRefreshKey((k) => k + 1);
    }
    // Pre-populate if already has response
    if (ticket.tindakLanjut) {
      setReplyMessage(ticket.tindakLanjut.responseMessage);
      setFollowUpStatus(ticket.status === 'Diproses' ? 'Diproses' : 'Ditindaklanjuti');
      setInternalNotes(ticket.tindakLanjut.catatanInternal || '');
    } else {
      setReplyMessage('');
      setFollowUpStatus('Ditindaklanjuti');
      setInternalNotes('');
    }
  };

  const handleSaveFollowUp = (e: React.FormEvent, sendToWa: boolean = false) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (!replyMessage.trim()) {
      onNotify('Uraian respon tindak lanjut tidak boleh kosong.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = respondToGuestFeedback(
        selectedTicket.id,
        replyMessage,
        adminName,
        followUpStatus,
        internalNotes,
        sendToWa
      );

      setSelectedTicket(updated);
      setRefreshKey((k) => k + 1);
      onNotify(`Respon tindak lanjut untuk tiket ${selectedTicket.id} berhasil disimpan! Pengirim akan melihat respon ini.`, 'success');

      if (sendToWa) {
        handleOpenWhatsApp(selectedTicket, replyMessage);
      }
    } catch (err: any) {
      onNotify(err.message || 'Gagal menyimpan tindak lanjut.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (ticketId: string) => {
    if (window.confirm(`Hapus arsip pesan tiket ${ticketId}?`)) {
      deleteGuestFeedback(ticketId);
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
      setRefreshKey((k) => k + 1);
      onNotify('Tiket masukan berhasil dihapus dari sistem.', 'info');
    }
  };

  const handleOpenWhatsApp = (ticket: GuestFeedbackChat, customMsg?: string) => {
    let cleanWa = ticket.senderWhatsApp.replace(/[^0-9]/g, '');
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.substring(1);
    }

    const textToGuest = customMsg || ticket.tindakLanjut?.responseMessage || 
      `Halo Bapak/Ibu ${ticket.senderName}, kami dari pihak manajemen SDN Kedungringin 1 Beji ingin menindaklanjuti masukan Anda terkait "${ticket.judul}" (Tiket: ${ticket.id}). Terima kasih.`;

    const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(textToGuest)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh]">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 text-purple-300">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Pusat Masukan Guest & Menu Tindak Lanjut
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-pulse">
                    {unreadCount} Masukan Baru
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                Kelola pesan kritik & saran dari tamu/wali murid, tanggapi secara resmi, dan berikan tindak lanjut transparan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split Left List & Right Detail / Action */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left Column: Filter & List of Tickets */}
          <div className="md:col-span-5 flex flex-col h-full bg-slate-50/70 overflow-hidden">
            {/* Filter Bar */}
            <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pengirim, email, WhatsApp, topik..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="ALL">Semua Status ({allFeedback.length})</option>
                  <option value="Baru">Baru ({allFeedback.filter(f => f.status === 'Baru').length})</option>
                  <option value="Diproses">Diproses ({allFeedback.filter(f => f.status === 'Diproses').length})</option>
                  <option value="Ditindaklanjuti">Selesai ({allFeedback.filter(f => f.status === 'Ditindaklanjuti').length})</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="Saran">Saran</option>
                  <option value="Kritik">Kritik</option>
                  <option value="Pertanyaan">Pertanyaan</option>
                  <option value="Pengaduan">Pengaduan</option>
                  <option value="Apresiasi">Apresiasi</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              {filteredList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  Tidak ada pesan masukan yang cocok dengan kriteria pencarian.
                </div>
              ) : (
                filteredList.map((item) => {
                  const isSelected = selectedTicket?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectTicket(item)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-purple-50/90 border-purple-300 shadow-xs ring-1 ring-purple-400'
                          : !item.isReadByAdmin
                          ? 'bg-white border-amber-300 shadow-2xs font-semibold'
                          : 'bg-white border-slate-200/80 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.id}
                          </span>
                          {!item.isReadByAdmin && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Belum dibaca" />
                          )}
                          <span className="text-[11px] font-bold text-purple-900">
                            {item.kategori}
                          </span>
                        </div>

                        <div>
                          {item.status === 'Ditindaklanjuti' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                              Selesai
                            </span>
                          ) : item.status === 'Diproses' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                              Diproses
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                              Baru
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                        {item.judul}
                      </h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                        {item.pesan}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                        <span className="font-medium text-slate-700 truncate max-w-[150px]">
                          {item.senderName}
                        </span>
                        <span>{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detail & Menu Tindak Lanjut */}
          <div className="md:col-span-7 flex flex-col h-full bg-white overflow-hidden">
            {selectedTicket ? (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* Header Ticket */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-mono text-xs font-black">
                        {selectedTicket.id}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold">
                        {selectedTicket.kategori}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                        selectedTicket.status === 'Ditindaklanjuti'
                          ? 'bg-emerald-100 text-emerald-900'
                          : selectedTicket.status === 'Diproses'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-2">
                      {selectedTicket.judul}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(selectedTicket.createdAt).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenWhatsApp(selectedTicket)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Buka WhatsApp Pengirim untuk chat langsung"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Chat WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleDelete(selectedTicket.id)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                      title="Hapus pesan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sender Info Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nama Pengirim</span>
                    <strong className="text-slate-900 font-bold">{selectedTicket.senderName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Terlampir</span>
                    <a href={`mailto:${selectedTicket.senderEmail}`} className="text-purple-700 font-medium hover:underline flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{selectedTicket.senderEmail}</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nomor WhatsApp</span>
                    <a 
                      href={`https://wa.me/${selectedTicket.senderWhatsApp.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-emerald-700 font-mono font-bold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{selectedTicket.senderWhatsApp}</span>
                    </a>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Isi Pesan Masukan Guest:
                  </label>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap shadow-2xs">
                    {selectedTicket.pesan}
                  </div>
                </div>

                {/* Menu Tindak Lanjut (Form Respon Admin) */}
                <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                    <div className="flex items-center gap-2 text-purple-950 font-black text-xs sm:text-sm">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>Menu Tindak Lanjut & Respon Resmi Admin</span>
                    </div>
                    {selectedTicket.tindakLanjut && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Sudah Diberikan Respon</span>
                      </span>
                    )}
                  </div>

                  <form onSubmit={(e) => handleSaveFollowUp(e, false)} className="space-y-3.5">
                    {/* Status Picker */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">
                          Status Tindak Lanjut:
                        </label>
                        <select
                          value={followUpStatus}
                          onChange={(e) => setFollowUpStatus(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs font-bold border border-purple-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                        >
                          <option value="Ditindaklanjuti">Selesai Ditindaklanjuti (Solusi Diberikan)</option>
                          <option value="Diproses">Sedang Diproses (Koordinasi Internal)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">
                          Petugas Penindaklanjut:
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={adminName}
                          className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-slate-100 text-slate-700"
                        />
                      </div>
                    </div>

                    {/* Respon Resmi Pesan */}
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">
                        Tuliskan Pesan Respon / Tanggapan Resmi untuk Pengirim: <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Contoh: Terima kasih atas sarannya. Kami telah memasukkan usulan ini ke dalam rencana kerja dan mengalokasikan anggaran..."
                        className="w-full p-3.5 text-xs font-medium border border-purple-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 leading-relaxed shadow-2xs"
                      />
                      <p className="text-[11px] text-purple-900 mt-1">
                        Pesan respon ini akan langsung terlihat oleh pengirim (Guest) saat memeriksa tiket atau membuka chat di web SIM.
                      </p>
                    </div>

                    {/* Internal Disposition Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Catatan Internal / Disposisi Sekolah (Opsional):
                      </label>
                      <input
                        type="text"
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder="Contoh: Disposisi ke Tim Sarpras / Satpam gerbang depan..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Kirim Respon ke Tiket'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleSaveFollowUp(e, true)}
                        disabled={isSubmitting}
                        className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Simpan & Buka WhatsApp</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <div className="p-4 rounded-full bg-slate-100 text-slate-400">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">Pilih Pesan Masukan</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Pilih salah satu pesan dari daftar sebelah kiri untuk membaca detail dan memberikan respon tindak lanjut.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
