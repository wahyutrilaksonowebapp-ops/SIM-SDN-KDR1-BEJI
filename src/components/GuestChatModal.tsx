import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Phone, 
  User, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  Search, 
  Sparkles,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { 
  sendGuestFeedback, 
  searchGuestFeedbackByContact, 
  getAllGuestFeedback 
} from '../services/guestChatService';
import { GuestFeedbackChat } from '../types';

interface GuestChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initialTab?: 'kirim' | 'cek';
}

export const GuestChatModal: React.FC<GuestChatModalProps> = ({
  isOpen,
  onClose,
  onNotify = () => {},
  initialTab = 'kirim',
}) => {
  const [activeTab, setActiveTab] = useState<'kirim' | 'cek'>(initialTab);

  // Form State
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderWhatsApp, setSenderWhatsApp] = useState('');
  const [kategori, setKategori] = useState<'Kritik' | 'Saran' | 'Pertanyaan' | 'Pengaduan' | 'Apresiasi'>('Saran');
  const [judul, setJudul] = useState('');
  const [pesan, setPesan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<GuestFeedbackChat | null>(null);

  // Check Status State
  const [searchContact, setSearchContact] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<GuestFeedbackChat[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const created = sendGuestFeedback({
        senderName,
        senderEmail,
        senderWhatsApp,
        kategori,
        judul,
        pesan,
      });

      setSubmittedTicket(created);
      onNotify(`Kritik & Saran Anda berhasil dikirim dengan Nomor Tiket: ${created.id}! Admin sekolah akan segera menindaklanjuti.`, 'success');
      
      // Reset form
      setSenderName('');
      setJudul('');
      setPesan('');
    } catch (err: any) {
      onNotify(err.message || 'Gagal mengirim pesan kritik & saran.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchTickets = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchContact.trim()) {
      onNotify('Masukkan Email atau Nomor WhatsApp untuk memeriksa status respon.', 'info');
      return;
    }

    const results = searchGuestFeedbackByContact(searchContact);
    setSearchResults(results);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 sm:p-6 flex items-start justify-between relative">
          <div className="space-y-1.5 pr-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-[11px] font-bold border border-emerald-500/40">
              <MessageCircle className="w-3 h-3" />
              <span>Layanan Interaktif Tamu & Guest</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Chat Masukan: Kritik & Saran Terbuka</span>
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Sampaikan kritik, saran, maupun pertanyaan kepada manajemen SDN Kedungringin 1 Beji. Pesan Anda terintegrasi langsung dengan akun Admin untuk ditindaklanjuti.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('kirim')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'kirim'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Kritik & Saran</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('cek');
              if (senderEmail || senderWhatsApp) {
                setSearchContact(senderEmail || senderWhatsApp);
                setSearchResults(searchGuestFeedbackByContact(senderEmail || senderWhatsApp));
                setHasSearched(true);
              }
            }}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'cek'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Cek Respon & Tindak Lanjut Admin</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'kirim' ? (
            <div>
              {/* Syarat Khusus Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1 mb-5">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Syarat Mengisi Masukan Guest:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Pengirim <strong>wajib melampirkan alamat Email aktif dan Nomor WhatsApp yang valid</strong> agar tim Administrator sekolah dapat memberikan notifikasi tindak lanjut serta mengirimkan balasan langsung ke kontak Anda.
                </p>
              </div>

              {submittedTicket ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 font-black text-emerald-800 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Masukan Anda Berhasil Terkirim ke Administrator!</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    Terima kasih telah berkontribusi membangun mutu SDN Kedungringin 1 Beji. Pesan Anda telah diteruskan ke Admin dengan rincian tiket:
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs space-y-1 font-mono">
                    <div>No. Tiket: <strong className="text-emerald-900">{submittedTicket.id}</strong></div>
                    <div>Pengirim: <strong>{submittedTicket.senderName}</strong></div>
                    <div>Email: <strong>{submittedTicket.senderEmail}</strong></div>
                    <div>WhatsApp: <strong>{submittedTicket.senderWhatsApp}</strong></div>
                    <div>Status: <span className="px-2 py-0.5 rounded bg-emerald-100 font-bold text-emerald-800">Baru (Menunggu Tindak Lanjut)</span></div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSearchContact(submittedTicket.senderEmail);
                        setSearchResults([submittedTicket]);
                        setHasSearched(true);
                        setActiveTab('cek');
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Pantau Status Tiket Ini
                    </button>
                    <button
                      onClick={() => setSubmittedTicket(null)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Kirim Pesan Lain
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Row 1: Nama & Kategori */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Nama Lengkap Pengirim <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="Contoh: Bpk. M. Sholeh / Ibu Anisa"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Kategori Masukan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                      >
                        <option value="Saran">Saran Pembangunan / Program</option>
                        <option value="Kritik">Kritik & Evaluasi Layanan</option>
                        <option value="Pertanyaan">Pertanyaan / Konsultasi Sekolah</option>
                        <option value="Pengaduan">Pengaduan Fasilitas / Keamanan</option>
                        <option value="Apresiasi">Apresiasi & Ucapan Terima Kasih</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Syarat Wajib: Email & WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center justify-between">
                        <span>Email Aktif (Wajib Syarat)</span>
                        <span className="text-[10px] text-emerald-700 font-extrabold uppercase">Wajib</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-emerald-700 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          placeholder="nama.anda@gmail.com"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Untuk menerima surat balasan elektronik dari sekolah.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center justify-between">
                        <span>Nomor WhatsApp Aktif (Wajib Syarat)</span>
                        <span className="text-[10px] text-emerald-700 font-extrabold uppercase">Wajib</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-emerald-700 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={senderWhatsApp}
                          onChange={(e) => setSenderWhatsApp(e.target.value)}
                          placeholder="081234567890 atau +6281..."
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-medium"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Admin dapat merespon langsung via chat WhatsApp.</p>
                    </div>
                  </div>

                  {/* Row 3: Judul */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Perihal / Pokok Masukan <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      placeholder="Contoh: Usulan pojok baca kelas / Ketertiban gerbang"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                    />
                  </div>

                  {/* Row 4: Isi Pesan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Uraian Pesan Kritik & Saran <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={pesan}
                      onChange={(e) => setPesan(e.target.value)}
                      placeholder="Tuliskan masukan Anda secara jelas, santun, dan konstruktif..."
                      className="w-full p-3.5 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Mengirim Masukan...' : 'Kirim Chat Masukan ke Admin'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Tab Cek Status & Respon Admin */
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <form onSubmit={handleSearchTickets} className="space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Cek Status Tiket & Balasan Admin:
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchContact}
                        onChange={(e) => setSearchContact(e.target.value)}
                        placeholder="Masukkan Email, No. WA, atau No. Tiket..."
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap"
                    >
                      Cari Respon
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Gunakan alamat email atau nomor WhatsApp yang Anda daftarkan saat mengirim pesan.
                  </p>
                </form>
              </div>

              {/* Result List */}
              <div className="space-y-3">
                {hasSearched && searchResults.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Tidak ditemukan tiket masukan dengan email atau nomor WhatsApp tersebut. Pastikan kontak yang Anda masukkan sesuai.
                  </div>
                ) : (
                  (hasSearched ? searchResults : getAllGuestFeedback().slice(0, 4)).map((chat) => (
                    <div
                      key={chat.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-3 shadow-2xs"
                    >
                      {/* Ticket Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {chat.id}
                          </span>
                          <span className="text-xs font-bold text-emerald-800">
                            {chat.kategori}
                          </span>
                        </div>
                        <div>
                          {chat.status === 'Ditindaklanjuti' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Selesai Ditindaklanjuti</span>
                            </span>
                          ) : chat.status === 'Diproses' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Sedang Diproses</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                              <span>Baru Dikirim</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Message Content */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{chat.judul}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          "{chat.pesan}"
                        </p>
                        <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-3">
                          <span>Pengirim: {chat.senderName}</span>
                          <span>•</span>
                          <span>{new Date(chat.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      {/* Admin Response & Follow Up */}
                      {chat.tindakLanjut ? (
                        <div className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-1.5 animate-in fade-in">
                          <div className="flex items-center justify-between text-xs font-extrabold text-emerald-950">
                            <span className="flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-700" />
                              <span>Tanggapan Resmi Admin:</span>
                            </span>
                            <span className="text-[10px] text-emerald-700 font-mono">
                              {new Date(chat.tindakLanjut.respondedAt).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                            {chat.tindakLanjut.responseMessage}
                          </p>
                          <div className="text-[10px] text-emerald-700 pt-1 font-semibold border-t border-emerald-200/60 mt-2 flex items-center justify-between">
                            <span>Ditindaklanjuti oleh: {chat.tindakLanjut.respondedBy}</span>
                            {chat.tindakLanjut.sentToWa && (
                              <span className="text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                                Notifikasi WA Terkirim
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Pesan sedang dalam antrean telaah oleh tim manajemen sekolah. Tanggapan resmi akan muncul di sini dan dikirimkan ke kontak Anda.</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
