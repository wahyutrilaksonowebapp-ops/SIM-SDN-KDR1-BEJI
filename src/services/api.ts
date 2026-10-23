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

export const LOCKED_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxQKrCfjYPLT0Eol82ooEsfVOtOWJwcQn4rx-axJNcQ9TrVxc7Rm8YJ6y7uSd54hJC8ew/exec';

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

