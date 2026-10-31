import { AIInsightData } from '../types';

export interface LetterGenerationPayload {
  letterType: string;
  nomorSurat: string;
  perihal: string;
  recipient: string;
  details: Record<string, any>;
  customNotes?: string;
}

export interface LetterGenerationResult {
  letterTitle: string;
  nomorSurat: string;
  perihal: string;
  lampiran: string;
  pembuka: string;
  isiUtama: string;
  penutup: string;
  tanggalSurat: string;
  pejabat: {
    jabatan: string;
    nama: string;
    nip: string;
  };
  fullText: string;
}

export async function generateLetterWithAI(payload: LetterGenerationPayload): Promise<LetterGenerationResult> {
  const response = await fetch('/api/gemini/generate-letter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Gagal menghasilkan surat dinas dengan Gemini AI.');
  }

  return json.data;
}

export async function generateAIInsight(summaryData: Record<string, any>): Promise<AIInsightData> {
  const response = await fetch('/api/gemini/ai-insight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ summaryData }),
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Gagal menghasilkan AI Insight.');
  }

  return json.data;
}

export interface PenilaianGenerationPayload {
  mataPelajaran: string;
  kelas: number;
  materiPokok: string;
  tujuanPembelajaran: string;
  jumlahSoal: number;
  komposisi: {
    pg: number;
    pgk: number;
    isian: number;
    uraian: number;
  };
}

export async function generatePenilaianWithAI(payload: PenilaianGenerationPayload): Promise<any> {
  const response = await fetch('/api/gemini/generate-penilaian', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Gagal menghasilkan butir soal Penilaian Harian.');
  }

  return json.data;
}

export interface RemedialGenerationPayload {
  jenis: 'remedial' | 'pengayaan';
  mataPelajaran: string;
  kelas: number;
  materiPokok: string;
  tujuanPembelajaran: string;
  materiBelumDikuasai: string[];
  daftarNamaSiswa: string[];
  jumlahSoal?: number;
}

export async function generateRemedialWithAI(payload: RemedialGenerationPayload): Promise<any> {
  const response = await fetch('/api/gemini/generate-remedial', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Gagal menghasilkan program penugasan Remedial & Pengayaan by AI.');
  }

  return json.data;
}

export interface StrategiGuruPayload {
  namaSiswa: string;
  kelas: number;
  mataPelajaran: string;
  materiPokok: string;
  nilaiAwal: number;
  nilaiPerbaikan: number;
  kkm: number;
  materiBelumDikuasai: string[];
  catatanGuru?: string;
}

export interface StrategiGuruResult {
  diagnosisMiskonsepsi: string;
  strategiPersonal: {
    namaStrategi: string;
    langkahLangkah: string;
    peranTutorSebaya?: string;
  }[];
  rekomendasiMateriTambahan: {
    jenisMateri: string;
    judul: string;
    deskripsi: string;
  }[];
  panduanPendampinganOrangTua?: string;
  rencanaAksiMingguan?: {
    hari: string;
    kegiatan: string;
  }[];
}

export async function getRekomendasiStrategiAI(payload: StrategiGuruPayload): Promise<StrategiGuruResult> {
  const response = await fetch('/api/gemini/rekomendasi-strategi-guru', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Gagal menghasilkan rekomendasi strategi pengajaran personal AI.');
  }

  return json.data;
}

export const LOCKED_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyRnNib3IVPunbwCWaz9HW1Kc8N5jmG77mLfslNWdvMI43KjhjvrWMye3Dhkv4Ypi5hBg/exec';

// Google Apps Script Web App Client (terkunci resmi ke endpoint SIM SDN Kedungringin 1)
export async function syncWithGoogleAppsScript(scriptUrl: string = LOCKED_WEB_APP_URL, action: string = 'ping', payload?: any) {
  const targetUrl = scriptUrl || LOCKED_WEB_APP_URL;
  const url = new URL(targetUrl);
  url.searchParams.set('action', action);

  if (payload) {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });
    return await response.json();
  } else {
    const response = await fetch(url.toString(), {
      method: 'GET',
    });
    return await response.json();
  }
}

