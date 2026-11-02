import { GuestFeedbackChat } from '../types';

const FEEDBACK_STORAGE_KEY = 'sim_kdr1_guest_feedback_chats';

// Realistic seed data of guest feedback & follow-ups
const SEED_FEEDBACK_CHATS: GuestFeedbackChat[] = [
  {
    id: 'TIK-KDR1-2026-001',
    senderName: 'Hendra Setiawan',
    senderEmail: 'hendra.setiawan82@gmail.com',
    senderWhatsApp: '081234567890',
    kategori: 'Saran',
    judul: 'Usulan Penambahan Fasilitas Rak Buku Pojok Baca Kelas',
    pesan: 'Mohon dipertimbangkan penambahan buku dongeng dan ensiklopedia anak pada pojok baca kelas 1 dan 2 agar anak-anak semakin gemar membaca saat jam istirahat. Terima kasih untuk SIM sekolah yang sangat transparan.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    status: 'Ditindaklanjuti',
    isReadByAdmin: true,
    tindakLanjut: {
      respondedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      respondedBy: 'Fuad Fahrudin, M.Pd. (Kepala Sekolah)',
      responseMessage: 'Terima kasih atas saran yang sangat baik dari Bapak Hendra. Usulan penambahan buku pojok baca telah kami masukkan ke dalam program Sarpras literasi perpustakaan semester ganjil ini. Kami telah mengalokasikan 40 judul buku cerita edukatif baru untuk Kelas 1 dan 2.',
      catatanInternal: 'Telah didisposisikan ke Tim Sarpras & Petugas Perpustakaan untuk pengadaan koleksi baru.',
      sentToWa: true,
      sentToEmail: true,
    },
  },
  {
    id: 'TIK-KDR1-2026-002',
    senderName: 'Siti Nurhaliza (Wali Murid)',
    senderEmail: 'siti.nurhaliza.kdr@gmail.com',
    senderWhatsApp: '085788990011',
    kategori: 'Kritik',
    judul: 'Kerapian Tempat Parkir Jemputan dan Pintu Gerbang Depan',
    pesan: 'Saat jam kepulangan siswa pukul 12.00, lalu lintas di depan gerbang Dusun Ngampel cukup padat karena motor penjemput parkir memakan bahu jalan. Mohon ada petugas atau arahan parkir yang lebih tertib.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'Diproses',
    isReadByAdmin: true,
    tindakLanjut: {
      respondedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      respondedBy: 'Mochammad Dzulkifli Bachtiar (Staff Administrasi)',
      responseMessage: 'Yth. Ibu Siti Nurhaliza, terima kasih banyak atas kritiknya yang membangun. Kami telah berkoordinasi dengan petugas keamanan dan komite sekolah. Mulai Senin depan, area drop-zone dan penjemputan akan dibagi per sesi kepulangan agar lalu lintas lancar.',
      catatanInternal: 'Koordinasi dengan satpam dan Babinsa untuk piket penertiban jam 11.30-12.30.',
      sentToWa: true,
    },
  },
  {
    id: 'TIK-KDR1-2026-003',
    senderName: 'Bambang Irawan',
    senderEmail: 'bambang.irawan.beji@yahoo.com',
    senderWhatsApp: '081399887766',
    kategori: 'Kritik',
    judul: 'Informasi Jadwal Pelaksanaan Ulangan Harian dan CBT',
    pesan: 'Mohon jadwal pelaksanaan Penilaian Harian CBT diumumkan minimal 3 hari sebelum tes berlangsung agar orang tua bisa mendampingi belajar anak di rumah dengan lebih matang.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'Baru',
    isReadByAdmin: false,
  },
  {
    id: 'TIK-KDR1-2026-004',
    senderName: 'Lina Marlina (Wali Murid Kelas 3)',
    senderEmail: 'lina.marlina.pasuruan@gmail.com',
    senderWhatsApp: '087855667788',
    kategori: 'Saran',
    judul: 'Kegiatan Ekstrakurikuler Membatik atau Seni Lukis Tradisional',
    pesan: 'Apakah sekolah bisa mengadakan ekstrakurikuler seni lukis atau batik khas Pasuruan untuk mengisi bakat kreatif siswa? Anak-anak kelas 3 sangat berminat dengan kesenian rupa.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'Baru',
    isReadByAdmin: false,
  },
];

export function getAllGuestFeedback(): GuestFeedbackChat[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(SEED_FEEDBACK_CHATS));
      return SEED_FEEDBACK_CHATS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(SEED_FEEDBACK_CHATS));
      return SEED_FEEDBACK_CHATS;
    }
    return parsed;
  } catch (err) {
    console.error('Gagal membaca data feedback chat guest:', err);
    return SEED_FEEDBACK_CHATS;
  }
}

export function getUnreadFeedbackCount(): number {
  const list = getAllGuestFeedback();
  return list.filter((item) => !item.isReadByAdmin || item.status === 'Baru').length;
}

export function sendGuestFeedback(data: {
  senderName: string;
  senderEmail: string;
  senderWhatsApp: string;
  kategori: 'Kritik' | 'Saran' | 'Pertanyaan' | 'Pengaduan' | 'Apresiasi';
  judul: string;
  pesan: string;
}): GuestFeedbackChat {
  // Validate email
  const cleanEmail = data.senderEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    throw new Error('Alamat email wajib diisi dengan format yang valid (contoh: nama@domain.com).');
  }

  // Validate WhatsApp
  const cleanWa = data.senderWhatsApp.replace(/[^0-9]/g, '');
  if (cleanWa.length < 9) {
    throw new Error('Nomor WhatsApp wajib diisi minimal 9-10 digit (contoh: 081234567890).');
  }

  if (!data.senderName.trim()) {
    throw new Error('Nama pengirim wajib diisi.');
  }

  if (!data.pesan.trim()) {
    throw new Error('Isi pesan / masukan kritik dan saran tidak boleh kosong.');
  }

  const list = getAllGuestFeedback();
  const year = new Date().getFullYear();
  const nextSeq = String(list.length + 1).padStart(3, '0');
  const ticketId = `TIK-KDR1-${year}-${nextSeq}`;

  const newChat: GuestFeedbackChat = {
    id: ticketId,
    senderName: data.senderName.trim(),
    senderEmail: cleanEmail,
    senderWhatsApp: data.senderWhatsApp.trim(),
    kategori: data.kategori || 'Saran',
    judul: data.judul.trim() || `Masukan ${data.kategori} dari ${data.senderName.trim()}`,
    pesan: data.pesan.trim(),
    createdAt: new Date().toISOString(),
    status: 'Baru',
    isReadByAdmin: false,
  };

  const updated = [newChat, ...list];
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Gagal menyimpan guest feedback chat:', err);
  }

  return newChat;
}

export function respondToGuestFeedback(
  ticketId: string,
  responseMessage: string,
  adminName: string,
  status: 'Diproses' | 'Ditindaklanjuti' = 'Ditindaklanjuti',
  catatanInternal?: string,
  sentToWa: boolean = false
): GuestFeedbackChat {
  const list = getAllGuestFeedback();
  const targetIndex = list.findIndex((item) => item.id === ticketId);

  if (targetIndex === -1) {
    throw new Error(`Pesan masukan dengan nomor tiket ${ticketId} tidak ditemukan.`);
  }

  const updatedChat: GuestFeedbackChat = {
    ...list[targetIndex],
    status,
    isReadByAdmin: true,
    tindakLanjut: {
      respondedAt: new Date().toISOString(),
      respondedBy: adminName || 'Administrator SIM SDN Kedungringin 1',
      responseMessage: responseMessage.trim(),
      catatanInternal: catatanInternal?.trim() || undefined,
      sentToWa,
      sentToEmail: true,
    },
  };

  list[targetIndex] = updatedChat;
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Gagal memperbarui respon feedback:', err);
  }

  return updatedChat;
}

export function markFeedbackAsRead(ticketId: string): void {
  const list = getAllGuestFeedback();
  const updated = list.map((item) => {
    if (item.id === ticketId) {
      return { ...item, isReadByAdmin: true };
    }
    return item;
  });
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {}
}

export function deleteGuestFeedback(ticketId: string): void {
  const list = getAllGuestFeedback();
  const filtered = list.filter((item) => item.id !== ticketId);
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {}
}

export function searchGuestFeedbackByContact(contactQuery: string): GuestFeedbackChat[] {
  if (!contactQuery || !contactQuery.trim()) return [];
  const query = contactQuery.trim().toLowerCase();
  const rawQueryNumbers = contactQuery.replace(/[^0-9]/g, '');

  const list = getAllGuestFeedback();
  return list.filter((item) => {
    const emailMatch = item.senderEmail.toLowerCase().includes(query);
    const waNumbers = item.senderWhatsApp.replace(/[^0-9]/g, '');
    const waMatch = rawQueryNumbers.length >= 4 && waNumbers.includes(rawQueryNumbers);
    const ticketMatch = item.id.toLowerCase().includes(query);
    const nameMatch = item.senderName.toLowerCase().includes(query);
    return emailMatch || waMatch || ticketMatch || nameMatch;
  });
}
