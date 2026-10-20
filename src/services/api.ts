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

// Google Apps Script Web App Client (jika pengguna menyambungkan URL Deployment Apps Script)
export async function syncWithGoogleAppsScript(scriptUrl: string, action: string, payload?: any) {
  const url = new URL(scriptUrl);
  url.searchParams.set('action', action);

  if (payload) {
    const response = await fetch(scriptUrl, {
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
