import { 
  ProfilSekolah, 
  Siswa, 
  Pegawai, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ, 
  SarprasItem, 
  SuratMasuk, 
  SuratKeluar,
  UserRole
} from '../types';
import { 
  upsertWithDeduplication, 
  FIELD_LABELS 
} from './dataSyncDeduplicator';
import { SheetDefinition } from './googleDriveSheets';

export const TARGET_GDRIVE_FOLDER_ID = '1cry49dLyjsyXfkGJIARR_PLwUV67t7ur';
export const MASTER_SPREADSHEET_TITLE = 'SIM_SDN_Kedungringin1_Master_Database';

export const STORAGE_KEYS = {
  MASTER_SHEET_ID: 'sim_kdr1_master_sheet_id',
  MASTER_SHEET_URL: 'sim_kdr1_master_sheet_url',
  REALTIME_ACTIVE: 'sim_kdr1_master_realtime_active',
  AUTO_SYNC_INTERVAL: 'sim_kdr1_master_sync_interval',
  LAST_SYNC_TIME: 'sim_kdr1_master_last_sync_time',
  LAST_SYNC_STATUS: 'sim_kdr1_master_last_sync_status',
  DATA_SOURCE_MODE: 'sim_kdr1_data_source_mode', // 'spreadsheet' | 'local'
};

// =========================================================================
// HELPER: EXTRACT SPREADSHEET ID FROM URL OR RAW STRING
// =========================================================================
export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const clean = input.trim();
  // Regex to match /d/{SPREADSHEET_ID}/
  const urlMatch = clean.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  // If it's already an ID (alphanumeric with dashes/underscores)
  if (/^[a-zA-Z0-9-_]{20,}$/.test(clean)) {
    return clean;
  }
  return clean;
}

// Get saved master sheet ID
export function getSavedMasterSheetId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.MASTER_SHEET_ID) || '';
  } catch {
    return '';
  }
}

export function saveMasterSheetId(id: string, url?: string) {
  try {
    const cleanId = extractSpreadsheetId(id);
    localStorage.setItem(STORAGE_KEYS.MASTER_SHEET_ID, cleanId);
    if (url || cleanId) {
      localStorage.setItem(
        STORAGE_KEYS.MASTER_SHEET_URL, 
        url || `https://docs.google.com/spreadsheets/d/${cleanId}/edit`
      );
    }
  } catch (err) {
    console.error('Failed to save master sheet ID:', err);
  }
}

// =========================================================================
// BUILD 1 SINGLE MASTER DATABASE SPREADSHEET (ALL IN ONE)
// =========================================================================
export function buildMasterDatabaseSpreadsheet(data: {
  profil: ProfilSekolah;
  pegawai: Pegawai[];
  siswa: Siswa[];
  rapor: RekapRaporSiswa[];
  btq: NilaiIjazahBTQ[];
  sarpras: SarprasItem[];
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
}): SheetDefinition[] {
  const { profil, pegawai, siswa, rapor, btq, sarpras, suratMasuk, suratKeluar } = data;

  // 1. Sheet: Data_Pegawai (Sumber Data Utama GTK)
  const pegHeader = [
    'ID', 'NIP', 'Nama Lengkap', 'Gelar Depan', 'Gelar Belakang', 'Jenis Kelamin',
    'Golongan', 'Pangkat', 'Jabatan', 'Status Pegawai', 'Pendidikan Terakhir',
    'TMT CPNS/PPPK', 'Tempat Lahir', 'Tanggal Lahir', 'Kontak / WA', 'Email',
    'Unit Kerja', 'No Karpeg', 'No Taspen', 'NPWP'
  ];
  const pegRows: (string | number)[][] = [
    pegHeader,
    ...pegawai.map((p) => [
      p.id,
      p.nip || '-',
      p.nama,
      p.gelarDepan || '',
      p.gelarBelakang || '',
      p.jenisKelamin === 'L' ? 'L' : 'P',
      p.golongan || '-',
      p.pangkat || '-',
      p.jabatan || 'Guru',
      p.statusKepegawaian || 'PNS',
      p.pendidikanTerakhir || 'S1',
      p.tmt || '-',
      p.tempatLahir || 'Pasuruan',
      p.tanggalLahir || '-',
      p.kontak || '-',
      p.email || '-',
      p.unitKerja || profil.nama,
      p.karpeg || '-',
      p.nomorTaspen || '-',
      p.npwp || '-'
    ])
  ];

  // 2. Sheet: Data_Siswa (Sumber Data Utama Peserta Didik)
  const siswaHeader = [
    'ID', 'NISN', 'NIS', 'Nama Lengkap Siswa', 'Jenis Kelamin', 'Tempat Lahir',
    'Tanggal Lahir', 'Agama', 'Kelas', 'Rombel', 'Nama Ayah', 'Nama Ibu',
    'Alamat Rumah', 'No HP Ortu', 'TMT Diterima', 'Status Siswa'
  ];
  const siswaRows: (string | number)[][] = [
    siswaHeader,
    ...siswa.map((s) => [
      s.id,
      s.nisn,
      s.nis,
      s.nama,
      s.jenisKelamin === 'L' ? 'L' : 'P',
      s.tempatLahir || 'Pasuruan',
      s.tanggalLahir || '-',
      s.agama || 'Islam',
      s.kelas,
      s.rombel || 'A',
      s.namaAyah || '-',
      s.namaIbu || '-',
      s.alamat || '-',
      s.noHpOrtu || '-',
      s.tmtDiterima || '2024-07-15',
      s.statusSiswa || 'Aktif'
    ])
  ];

  // 3. Sheet: Rekap_Rapor (Nilai Rapor & TKA)
  const raporHeader = [
    'ID', 'NISN', 'Nama Siswa', 'Kelas', 'Rombel',
    'Sem 7', 'Sem 8', 'Sem 9', 'Sem 10', 'Sem 11', 'Sem 12',
    'Rata Rapor 5 Sem', 'Rata Rapor 4 Sem',
    'TKA Numerasi', 'TKA Literasi', 'TKA IPA', 'Rata TKA', 'Predikat'
  ];
  const calcAvg = (map?: Record<string, number>) => {
    if (!map) return 0;
    const vals = Object.values(map);
    return vals.length > 0 ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0;
  };
  const raporRows: (string | number)[][] = [
    raporHeader,
    ...rapor.map((r) => {
      const s7 = calcAvg(r.semester7);
      const s8 = calcAvg(r.semester8);
      const s9 = calcAvg(r.semester9);
      const s10 = calcAvg(r.semester10);
      const s11 = calcAvg(r.semester11);
      const s12 = calcAvg(r.semester12);
      const r5 = Number(((s7 + s8 + s9 + s10 + s11) / 5).toFixed(2));
      const r4 = Number(((s7 + s8 + s9 + s10) / 4).toFixed(2));
      return [
        r.id,
        r.nisn,
        r.namaSiswa,
        r.kelas,
        r.rombel,
        s7,
        s8,
        s9,
        s10,
        s11,
        s12,
        r5,
        r4,
        r.tka?.numerasi || 0,
        r.tka?.literasi || 0,
        r.tka?.ipaPilihan || 0,
        r.tka?.rataRata || 0,
        r.tka?.predikat || '-'
      ];
    })
  ];

  // 4. Sheet: Nilai_BTQ
  const btqHeader = [
    'ID', 'NISN', 'Nama Siswa', 'No Sertifikat', 
    'Tahsin', 'Tajwid', 'Tahfidz', 'Menulis', 'Membaca', 'Rata-rata', 'Predikat'
  ];
  const btqRows: (string | number)[][] = [
    btqHeader,
    ...btq.map((b) => [
      b.id,
      b.nisn,
      b.namaSiswa,
      b.noSertifikat,
      b.tahsin,
      b.tajwid,
      b.tahfidz,
      b.menulis,
      b.membaca,
      b.rataRata,
      b.predikat
    ])
  ];

  // 5. Sheet: Sarpras_Aset
  const sarprasHeader = [
    'ID', 'Nama Sarpras', 'Kategori', 'Jumlah', 'Satuan', 
    'Kondisi', 'Lokasi', 'Keterangan'
  ];
  const sarprasRows: (string | number)[][] = [
    sarprasHeader,
    ...sarpras.map((s) => [
      s.id,
      s.namaSarpras,
      s.kategori,
      s.jumlah,
      s.satuan,
      s.kondisi,
      s.lokasi,
      s.keterangan || '-'
    ])
  ];

  // 6. Sheet: Surat_Keluar
  const skHeader = [
    'ID', 'Nomor Surat', 'Tanggal Surat', 'Perihal', 'Tujuan / Penerima', 
    'Pejabat NIP', 'Status'
  ];
  const skRows: (string | number)[][] = [
    skHeader,
    ...suratKeluar.map((s) => [
      s.id,
      s.nomorSurat,
      s.tanggalSurat,
      s.perihal,
      s.tujuan,
      s.pejabatNip || '-',
      s.status || 'Terkirim'
    ])
  ];

  // 7. Sheet: Surat_Masuk
  const smHeader = [
    'ID', 'Nomor Surat Masuk', 'Tanggal Surat', 'Tanggal Diterima', 'Pengirim', 
    'Perihal', 'Disposisi'
  ];
  const smRows: (string | number)[][] = [
    smHeader,
    ...suratMasuk.map((s) => [
      s.id,
      s.nomorSuratMasuk,
      s.tanggalSurat,
      s.tanggalDiterima,
      s.pengirim,
      s.perihal,
      s.disposisiKepsek || '-'
    ])
  ];

  // 8. Sheet: Profil_Sekolah
  const profilRows: (string | number)[][] = [
    ['Parameter', 'Nilai / Konfigurasi'],
    ['Nama Sekolah', profil.nama],
    ['NPSN', profil.npsn],
    ['Bentuk Pendidikan', profil.bentukPendidikan],
    ['Status Sekolah', profil.status],
    ['Akreditasi', profil.akreditasi],
    ['Alamat Lengkap', profil.alamat],
    ['Kecamatan', profil.kecamatan],
    ['Kabupaten', profil.kabupaten],
    ['Kepala Sekolah', profil.kepalaSekolah],
    ['NIP Kepala Sekolah', profil.nipKepalaSekolah],
    ['Pangkat Kepala Sekolah', profil.pangkatKepalaSekolah],
    ['Tahun Pelajaran Aktif', profil.tahunPelajaranAktif],
    ['Tanggal Acuan Usia', profil.tanggalAcuanUsia || '2024-07-01']
  ];

  return [
    { title: 'Data_Pegawai', rows: pegRows },
    { title: 'Data_Siswa', rows: siswaRows },
    { title: 'Rekap_Rapor', rows: raporRows },
    { title: 'Nilai_BTQ', rows: btqRows },
    { title: 'Sarpras_Aset', rows: sarprasRows },
    { title: 'Surat_Keluar', rows: skRows },
    { title: 'Surat_Masuk', rows: smRows },
    { title: 'Profil_Sekolah', rows: profilRows },
  ];
}

// =========================================================================
// PARSERS: CONVERT ROWS FROM SPREADSHEET TO TYPED OBJECTS
// =========================================================================

export function parsePegawaiFromSheetRows(rows: any[][]): Pegawai[] {
  if (!rows || rows.length < 2) return [];
  // First row is header
  const dataRows = rows.slice(1);
  return dataRows
    .filter((r) => r && r[2]) // must have nama
    .map((r, idx) => {
      const id = String(r[0] || `peg-${idx + 1}`).trim();
      const nip = String(r[1] || '').trim();
      const nama = String(r[2] || '').trim();
      const gelarDepan = String(r[3] || '').trim();
      const gelarBelakang = String(r[4] || '').trim();
      const jenisKelamin = String(r[5] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';
      const golongan = String(r[6] || 'III/a');
      const pangkat = String(r[7] || 'Penata Muda');
      const jabatan = String(r[8] || 'Guru');
      const statusKepegawaian = String(r[9] || 'PNS') as any;
      const pendidikanTerakhir = String(r[10] || 'S1');
      const tmt = String(r[11] || '2010-01-01');
      const tempatLahir = String(r[12] || 'Pasuruan');
      const tanggalLahir = String(r[13] || '1985-01-01');
      const kontak = String(r[14] || '-');
      const email = String(r[15] || '-');
      const unitKerja = String(r[16] || 'SDN Kedungringin 1 Beji');
      const karpeg = String(r[17] || '-');
      const nomorTaspen = String(r[18] || '-');
      const npwp = String(r[19] || '-');

      return {
        id,
        nip,
        nama,
        gelarDepan,
        gelarBelakang,
        jenisKelamin,
        golongan,
        pangkat,
        jabatan,
        statusKepegawaian,
        pendidikanTerakhir,
        tmt,
        tempatLahir,
        tanggalLahir,
        kontak,
        email,
        unitKerja,
        karpeg,
        nomorTaspen,
        npwp,
      };
    });
}

export function parseSiswaFromSheetRows(rows: any[][]): Siswa[] {
  if (!rows || rows.length < 2) return [];
  const validAgama: Siswa['agama'][] = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
  const dataRows = rows.slice(1);
  return dataRows
    .filter((r) => r && r[3]) // must have nama
    .map((r, idx) => {
      const id = String(r[0] || `sis-${idx + 1}`).trim();
      const nisn = String(r[1] || '').trim();
      const nis = String(r[2] || '').trim();
      const nama = String(r[3] || '').trim();
      const jenisKelamin = String(r[4] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';
      const tempatLahir = String(r[5] || 'Pasuruan').trim();
      const tanggalLahir = String(r[6] || '2014-01-01').trim();
      const rawAgama = String(r[7] || 'Islam').trim();
      const agama: Siswa['agama'] = validAgama.includes(rawAgama as any) ? (rawAgama as Siswa['agama']) : 'Islam';
      const kelas = Number(r[8]) || 1;
      const rombel = String(r[9] || 'A').trim();
      const namaAyah = String(r[10] || '-').trim();
      const namaIbu = String(r[11] || '-').trim();
      const alamat = String(r[12] || 'Kedungringin, Beji').trim();
      const noHpOrtu = String(r[13] || '-').trim();
      const tmtDiterima = String(r[14] || '2024-07-15').trim();
      const statusSiswa = (String(r[15] || 'Aktif').trim()) as any;

      return {
        id,
        nisn,
        nis,
        nama,
        jenisKelamin,
        tempatLahir,
        tanggalLahir,
        agama,
        kelas,
        rombel,
        namaAyah,
        namaIbu,
        alamat,
        noHpOrtu,
        tmtDiterima,
        statusSiswa,
      };
    });
}

export function parseSarprasFromSheetRows(rows: any[][]): SarprasItem[] {
  if (!rows || rows.length < 2) return [];
  const validKategori: SarprasItem['kategori'][] = [
    'Ruang Pembelajaran',
    'Ruang Penunjang',
    'Sanitasi & Ibadah',
    'Fasilitas Terbuka',
    'Peralatan',
  ];
  const dataRows = rows.slice(1);
  return dataRows
    .filter((r) => r && r[2])
    .map((r, idx) => {
      const rawKategori = String(r[3] || 'Peralatan').trim();
      const kategori: SarprasItem['kategori'] = validKategori.includes(rawKategori as any)
        ? (rawKategori as SarprasItem['kategori'])
        : 'Peralatan';
      const rawKondisi = String(r[6] || 'Baik').trim();
      const kondisi: SarprasItem['kondisi'] = rawKondisi.toLowerCase().includes('rusak berat')
        ? 'Rusak Berat'
        : rawKondisi.toLowerCase().includes('rusak')
        ? 'Rusak Ringan'
        : 'Baik';

      return {
        id: String(r[0] || `sar-${idx + 1}`).trim(),
        namaSarpras: String(r[2] || '').trim(),
        kategori,
        jumlah: Number(r[4]) || 1,
        satuan: String(r[5] || 'Unit').trim(),
        kondisi,
        lokasi: String(r[7] || 'Ruang Kelas').trim(),
        fotoUrl: '',
        keterangan: String(r[8] || 'Tercatat di SIM').trim(),
      };
    });
}

// =========================================================================
// REAL-TIME DATA FETCH FROM SPREADSHEET (VIA GVIZ OR SHEETS API)
// =========================================================================

// Fetch via Google Visualization API (Zero-Auth / Shared Link)
export async function fetchSheetRowsViaGViz(spreadsheetId: string, sheetName: string): Promise<any[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal membaca sheet "${sheetName}" via Google Sheet API (${res.status}). Pastikan sheet dapat diakses.`);
  }

  const text = await res.text();
  // Strip GViz JSON wrapper: /*O_o*/ google.visualization.Query.setResponse({...});
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error(`Format respons Google Sheet "${sheetName}" tidak valid.`);
  }

  const parsed = JSON.parse(jsonMatch[1]);
  if (parsed.status === 'error') {
    throw new Error(parsed.errors?.[0]?.message || `Error pada sheet "${sheetName}".`);
  }

  const table = parsed.table;
  if (!table || !table.cols) return [];

  // Headers
  const headers = table.cols.map((c: any) => c.label || c.id || '');

  // Rows
  const rows: any[][] = [headers];
  if (table.rows && Array.isArray(table.rows)) {
    for (const r of table.rows) {
      if (!r.c) continue;
      const rowValues = r.c.map((cell: any) => (cell ? (cell.v !== undefined ? cell.v : cell.f || '') : ''));
      rows.push(rowValues);
    }
  }

  return rows;
}

// Fetch via Google Sheets API v4 (if OAuth accessToken is active)
export async function fetchSheetRowsViaApiV4(
  spreadsheetId: string, 
  sheetNames: string[], 
  accessToken: string
): Promise<Record<string, any[][]>> {
  const rangesQuery = sheetNames.map((s) => `ranges=${encodeURIComponent(s + '!A1:Z500')}`).join('&');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangesQuery}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membaca Google Sheets API v4 (${res.status}).`);
  }

  const data = await res.json();
  const result: Record<string, any[][]> = {};

  if (data.valueRanges && Array.isArray(data.valueRanges)) {
    data.valueRanges.forEach((rangeObj: any) => {
      const fullRange = rangeObj.range || '';
      const matchedSheet = sheetNames.find((name) => fullRange.startsWith(`'${name}'`) || fullRange.startsWith(name));
      const key = matchedSheet || fullRange.split('!')[0];
      result[key] = rangeObj.values || [];
    });
  }

  return result;
}

// Unified Fetch: pulls all master tables in real-time
export async function fetchMasterDatabaseRealtime(
  spreadsheetId: string,
  accessToken?: string | null
): Promise<{
  pegawai?: Pegawai[];
  siswa?: Siswa[];
  sarpras?: SarprasItem[];
  rawRows?: Record<string, any[][]>;
  timestamp: string;
}> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  if (!cleanId) {
    throw new Error('ID atau link Google Spreadsheet tidak boleh kosong.');
  }

  const sheetNames = ['Data_Pegawai', 'Data_Siswa', 'Sarpras_Aset'];
  let rawData: Record<string, any[][]> = {};

  // Try API v4 if accessToken provided
  if (accessToken) {
    try {
      rawData = await fetchSheetRowsViaApiV4(cleanId, sheetNames, accessToken);
    } catch (apiErr) {
      console.warn('API v4 batchGet failed, falling back to GViz query endpoint:', apiErr);
      // Fallback to GViz
      for (const name of sheetNames) {
        try {
          rawData[name] = await fetchSheetRowsViaGViz(cleanId, name);
        } catch (gvizErr) {
          console.warn(`Could not fetch ${name} via GViz:`, gvizErr);
        }
      }
    }
  } else {
    // Zero-Auth / Public GViz mode
    for (const name of sheetNames) {
      try {
        rawData[name] = await fetchSheetRowsViaGViz(cleanId, name);
      } catch (gvizErr) {
        console.warn(`Could not fetch ${name} via GViz:`, gvizErr);
      }
    }
  }

  const parsedPegawai = rawData['Data_Pegawai'] ? parsePegawaiFromSheetRows(rawData['Data_Pegawai']) : undefined;
  const parsedSiswa = rawData['Data_Siswa'] ? parseSiswaFromSheetRows(rawData['Data_Siswa']) : undefined;
  const parsedSarpras = rawData['Sarpras_Aset'] ? parseSarprasFromSheetRows(rawData['Sarpras_Aset']) : undefined;

  const now = new Date().toLocaleTimeString('id-ID');
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, now);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_STATUS, 'SUCCESS');
  } catch {}

  return {
    pegawai: parsedPegawai,
    siswa: parsedSiswa,
    sarpras: parsedSarpras,
    rawRows: rawData,
    timestamp: now,
  };
}
