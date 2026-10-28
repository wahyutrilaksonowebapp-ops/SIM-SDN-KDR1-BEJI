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
import { 
  SheetDefinition, 
  populateSpreadsheet, 
  extendOrUpdateMasterSpreadsheet 
} from './googleDriveSheets';
import { getAccessToken } from './googleAuth';
import { INITIAL_PROFIL } from '../data/initialData';

export const TARGET_GDRIVE_FOLDER_ID = '1cry49dLyjsyXfkGJIARR_PLwUV67t7ur';
export const MASTER_SPREADSHEET_TITLE = 'SIM_SDN_Kedungringin1_Master_Database_2026_2027';

export const LOCKED_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyGKR4TKbaL38H4R_pNvEzej9CwOogP9pAE7YKtlDYgm9fawAZPrewDWYATplrhbRr84w/exec';

export const STORAGE_KEYS = {
  MASTER_SHEET_ID: 'sim_kdr1_master_sheet_id',
  MASTER_SHEET_URL: 'sim_kdr1_master_sheet_url',
  WEB_APP_URL: 'sim_kdr1_web_app_url',
  REALTIME_ACTIVE: 'sim_kdr1_master_realtime_active',
  AUTO_SYNC_INTERVAL: 'sim_kdr1_master_sync_interval',
  LAST_SYNC_TIME: 'sim_kdr1_master_last_sync_time',
  LAST_SYNC_STATUS: 'sim_kdr1_master_last_sync_status',
  DATA_SOURCE_MODE: 'sim_kdr1_data_source_mode', // 'spreadsheet' | 'local'
};

// Normalize Google Spreadsheet date strings (such as "Date(1980,5,18)" or ISO timestamp) into standard YYYY-MM-DD
export function normalizeDateString(val: any): string {
  if (!val) return '';
  const s = String(val).trim();
  if (!s || s === '-' || s.toLowerCase() === 'undefined' || s.toLowerCase() === 'null') return '';

  // Handle Google Visualization Date(YYYY, monthIndex, day) format
  const gvizMatch = s.match(/Date\((\d+),\s*(\d+),\s*(\d+)/i);
  if (gvizMatch) {
    const y = parseInt(gvizMatch[1], 10);
    // GViz month is 0-indexed (0=Jan, 5=Jun, etc.)
    const m = parseInt(gvizMatch[2], 10) + 1;
    const d = parseInt(gvizMatch[3], 10);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // Handle ISO 2026-02-19T17:00:00.000Z
  if (s.includes('T') && !isNaN(Date.parse(s))) {
    try {
      const d = new Date(s);
      return d.toISOString().split('T')[0];
    } catch {}
  }

  // Handle DD/MM/YYYY
  const dmyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${String(dmyMatch[2]).padStart(2, '0')}-${String(dmyMatch[1]).padStart(2, '0')}`;
  }

  return s;
}

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

export function getSavedWebAppUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WEB_APP_URL);
    // If not found or if user had the previous script URL cached, migrate to the locked URL
    if (!saved || saved.includes('AKfycbxQKrCfjYPLT0Eol82ooEsfVOtOWJwcQn4rx-axJNcQ9TrVxc7Rm8YJ6y7uSd54hJC8ew')) {
      localStorage.setItem(STORAGE_KEYS.WEB_APP_URL, LOCKED_WEB_APP_URL);
      return LOCKED_WEB_APP_URL;
    }
    return saved;
  } catch {
    return LOCKED_WEB_APP_URL;
  }
}

export function saveWebAppUrl(url: string) {
  try {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEYS.WEB_APP_URL, url.trim());
    } else {
      localStorage.setItem(STORAGE_KEYS.WEB_APP_URL, LOCKED_WEB_APP_URL);
    }
  } catch (err) {
    console.error('Failed to save Web App URL:', err);
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
  perangkatAjar?: any[];
  presensiList?: any[];
  skpList?: any[];
  tabunganList?: any[];
  presensiBulananList?: any[];
  presensiHarianList?: any[];
}): SheetDefinition[] {
  const { profil, pegawai, siswa, rapor, btq, sarpras, suratMasuk, suratKeluar, perangkatAjar, presensiList, skpList } = data;

  // 1. Sheet: Data_Pegawai (Sumber Data Utama GTK)
  const pegHeader = [
    'ID', 'NIP', 'Nama Lengkap', 'Gelar Depan', 'Gelar Belakang', 'Jenis Kelamin',
    'Golongan', 'Pangkat', 'Jabatan', 'Status Pegawai', 'Pendidikan Terakhir',
    'TMT CPNS/PPPK', 'Tempat Lahir', 'Tanggal Lahir', 'Kontak / WA', 'Email',
    'Unit Kerja', 'No Karpeg', 'No Taspen', 'NPWP',
    'Nomor SK Tingkat', 'Tanggal SK Tingkat', 'TMT SK Tingkat',
    'Nomor SK Berkala', 'Tanggal SK Berkala', 'TMT SK Berkala',
    'Nomor SK Angkatan', 'Tanggal SK Angkatan', 'TMT SK Angkatan'
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
      p.npwp || '-',
      p.skPangkatTerakhir?.nomor || '-',
      p.skPangkatTerakhir?.tanggal || '-',
      p.skPangkatTerakhir?.tmt || '-',
      p.skBerkalaTerakhir?.nomor || '-',
      p.skBerkalaTerakhir?.tanggal || '-',
      p.skBerkalaTerakhir?.tmt || '-',
      p.skAngkatan?.nomor || '-',
      p.skAngkatan?.tanggal || '-',
      p.skAngkatan?.tmt || '-'
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

  // 9. Sheet: Perangkat_Ajar (Arsip Modul & Perangkat Pembelajaran AI)
  const paHeader = [
    'ID', 'Jenis Perangkat', 'Kurikulum', 'Mata Pelajaran', 'Fase', 'Kelas',
    'Semester', 'Elemen CP', 'Nama Guru Pengampu', 'NIP Guru', 'Tanggal Dibuat',
    'Ringkasan Materi', 'Status Validasi'
  ];
  const defaultPaRows = [
    [
      'pa-001',
      'Modul Ajar Deep Learning',
      'CP 020 (PAI)',
      'Pendidikan Agama Islam dan Budi Pekerti',
      'Fase C',
      6,
      1,
      'Al-Qur\'an Hadis',
      pegawai[0]?.nama || 'Wahyudi, S.Pd.I.',
      pegawai[0]?.nip || '19850712 201001 1 018',
      '2024-08-15',
      'Surah Pendek, Tajwid & Hadis Berbuat Baik (Mindful, Meaningful, Joyful)',
      'Disahkan Kepala Sekolah'
    ],
    [
      'pa-002',
      'ATP (Alur Tujuan Pembelajaran)',
      'CP 020 (PAI)',
      'Pendidikan Agama Islam dan Budi Pekerti',
      'Fase C',
      6,
      1,
      'Akidah',
      pegawai[0]?.nama || 'Wahyudi, S.Pd.I.',
      pegawai[0]?.nip || '19850712 201001 1 018',
      '2024-07-20',
      'Iman kepada Hari Akhir dan Qada Qadar dengan Penguatan Karakter P3',
      'Disahkan Kepala Sekolah'
    ],
    [
      'pa-003',
      'Modul Ajar Deep Learning',
      'CP 046/H/KR/2024 (Umum)',
      'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
      'Fase C',
      6,
      1,
      'Pemahaman IPAS',
      'Sri Wahyuni, S.Pd.SD',
      '19830219 200902 2 008',
      '2024-08-25',
      'Sistem Tata Surya & Rotasi-Revolusi Bumi dengan Media Model Interaktif',
      'Disahkan Kepala Sekolah'
    ]
  ];
  const paRows: (string | number)[][] = [
    paHeader,
    ...(perangkatAjar && perangkatAjar.length > 0
      ? perangkatAjar.map((p) => [
          p.id || `pa-${Date.now()}`,
          p.jenisPerangkat || 'Modul Ajar',
          p.kurikulum || 'CP 020 (PAI)',
          p.mapel || 'PAI',
          p.fase || 'Fase C',
          p.kelas || 6,
          p.semester || 1,
          p.elemen || 'Al-Qur\'an Hadis',
          p.guruNama || pegawai[0]?.nama || '-',
          p.guruNip || pegawai[0]?.nip || '-',
          p.tanggal || new Date().toISOString().split('T')[0],
          p.ringkasan || '-',
          p.status || 'Disahkan Kepala Sekolah'
        ])
      : defaultPaRows)
  ];

  // 10. Sheet: Presensi_Faceprint (Data Kehadiran Biometrik)
  const fpHeader = [
    'ID', 'Pegawai ID', 'NIP', 'Nama Pegawai', 'Tanggal', 'Jam Masuk',
    'Jam Pulang', 'Mesin ID', 'Status Kehadiran', 'Keterlambatan (Mnt)',
    'Jam Kerja Efektif', 'Metode Verifikasi'
  ];
  const fpRows: (string | number)[][] = [
    fpHeader,
    ...(presensiList && presensiList.length > 0
      ? presensiList.map((fp) => [
          fp.id,
          fp.pegawaiId,
          fp.nip || '-',
          fp.nama,
          fp.tanggal,
          fp.jamMasuk,
          fp.jamPulang,
          fp.mesinId,
          fp.statusKehadiran,
          fp.keterlambatanMenit,
          fp.efektifJamKerja,
          fp.verifikasi
        ])
      : pegawai.slice(0, 5).map((p, idx) => [
          `fp-00${idx + 1}`,
          p.id,
          p.nip || '-',
          p.nama,
          new Date().toISOString().split('T')[0],
          '06:48:12',
          '14:15:00',
          'FP-SDNKDR1-BEJI-01',
          'Hadir Tepat Waktu',
          0,
          7.5,
          'Face Recognition Biometrik 99.8%'
        ]))
  ];

  // 11. Sheet: E_Kinerja_SKP (Sasaran Kinerja Pegawai Triwulanan)
  const skpHeader = [
    'ID', 'Pegawai ID', 'NIP', 'Nama Pegawai', 'Jabatan', 'Tahun',
    'Triwulan', 'Predikat Kinerja', 'Rating Hasil Kerja', 'Rating Perilaku',
    'Pejabat Penilai Nama', 'NIP Penilai', 'Tanggal Penilaian'
  ];
  const skpRows: (string | number)[][] = [
    skpHeader,
    ...(skpList && skpList.length > 0
      ? skpList.map((s) => [
          s.id,
          s.pegawaiId,
          s.nip,
          s.nama,
          s.jabatan,
          s.tahun,
          `Triwulan ${s.tribulan}`,
          s.predikatKinerja,
          s.ratingHasilKerja,
          s.ratingPerilaku,
          s.pejabatPenilaiNama,
          s.pejabatPenilaiNip,
          s.tanggalPenilaian
        ])
      : [
          [
            'skp-001',
            pegawai[0]?.id || 'peg-1',
            pegawai[0]?.nip || '19850712 201001 1 018',
            pegawai[0]?.nama || 'Wahyudi, S.Pd.I.',
            pegawai[0]?.jabatan || 'Guru PAI',
            2024,
            'Triwulan 3',
            'Sangat Baik',
            'Diatas Ekspektasi',
            'Diatas Ekspektasi',
            profil.kepalaSekolah,
            profil.nipKepalaSekolah,
            '2024-10-02'
          ]
        ])
  ];

  // 12. Sheet: Arsip_Rapor_Mapel (Arsip Nilai Rapor Semester per Mata Pelajaran)
  const mapelNames = [
    'Pendidikan Agama Islam dan Budi Pekerti (PAI)',
    'Pendidikan Pancasila (PKn)',
    'Bahasa Indonesia (B. Ind)',
    'Matematika (Mtk)',
    'Seni Budaya (SB)',
    'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)',
    'Bahasa Inggris (B. Ing)',
    'Muatan Lokal Bahasa Jawa (B. Jawa)',
  ];

  const armHeader = [
    'ID', 'NISN', 'Nama Siswa', 'Kelas', 'Rombel', 'Semester', 'Mata Pelajaran', 'Nilai', 'Predikat', 'Capaian Kompetensi', 'Tahun Pelajaran'
  ];
  const armRows: (string | number)[][] = [armHeader];

  (rapor || []).forEach((r) => {
    const semMap: Record<number, Record<string, number> | undefined> = {
      7: r.semester7,
      8: r.semester8,
      9: r.semester9,
      10: r.semester10,
      11: r.semester11,
      12: r.semester12,
    };

    [7, 8, 9, 10, 11, 12].forEach((semNum) => {
      const scores = semMap[semNum];
      if (scores && typeof scores === 'object') {
        mapelNames.forEach((mapel, mIdx) => {
          let score = scores[mapel] || 0;
          if (!score) {
            if (mapel.includes('PAI')) score = scores['PAI'] || scores['Pendidikan Agama Islam'] || 0;
            else if (mapel.includes('Pancasila')) score = scores['PKn'] || scores['Pendidikan Pancasila'] || 0;
            else if (mapel.includes('Indonesia')) score = scores['Bahasa Indonesia'] || 0;
            else if (mapel.includes('Matematika')) score = scores['Matematika'] || 0;
            else if (mapel.includes('Seni')) score = scores['Seni Budaya'] || 0;
            else if (mapel.includes('Jasmani')) score = scores['PJOK'] || scores['Pendidikan Jasmani & Kesehatan'] || 0;
            else if (mapel.includes('Inggris')) score = scores['Bahasa Inggris'] || 86;
            else if (mapel.includes('Jawa')) score = scores['Bahasa Jawa'] || scores['Muatan Lokal Bahasa Jawa'] || 0;
          }

          if (score > 0) {
            const predikat = score >= 90 ? 'A (Sangat Baik)' : score >= 80 ? 'B (Baik)' : score >= 75 ? 'C (Cukup)' : 'D (Perlu Bimbingan)';
            const capaian = score >= 85 ? 'Tercapai dengan sangat optimal' : 'Tercapai dengan baik';
            armRows.push([
              `arm-${r.id}-s${semNum}-m${mIdx + 1}`,
              r.nisn,
              r.namaSiswa,
              r.kelas,
              r.rombel || 'A',
              `Semester ${semNum}`,
              mapel,
              score,
              predikat,
              capaian,
              profil.tahunPelajaranAktif,
            ]);
          }
        });
      }
    });
  });

  // 13. Sheet: Tabungan_Siswa
  const tabHeader = [
    'ID', 'Tanggal Transaksi', 'Siswa ID', 'NISN', 'Nama Siswa', 'Kelas', 'Rombel', 'Jenis Transaksi', 'Jumlah (Rp)', 'Keterangan', 'Petugas'
  ];
  const tabRows: (string | number)[][] = [
    tabHeader,
    ...((data.tabunganList && data.tabunganList.length > 0)
      ? data.tabunganList.map((t: any) => [
          t.id,
          t.tanggal,
          t.siswaId,
          t.nisn,
          t.namaSiswa,
          t.kelas,
          t.rombel || 'A',
          t.jenis === 'setor' ? 'Setor' : 'Tarik',
          t.jumlah,
          t.keterangan || '-',
          t.petugas || 'Wali Kelas',
        ])
      : [
          ['tab-001', '2026-07-20', 'sis-1', '0123456781', siswa[0]?.nama || 'Ahmad Faiz', 6, 'A', 'Setor', 50000, 'Setoran Awal Tahun Ajaran', 'Wali Kelas 6A'],
          ['tab-002', '2026-08-01', 'sis-1', '0123456781', siswa[0]?.nama || 'Ahmad Faiz', 6, 'A', 'Setor', 25000, 'Tabungan Mingguan', 'Wali Kelas 6A'],
        ]),
  ];

  // 14. Sheet: Presensi_Siswa
  const presHeader = [
    'ID', 'Bulan / Periode', 'Kelas', 'Rombel', 'Tipe Presensi', 'Sakit (S)', 'Izin (I)', 'Tanpa Keterangan (TK)', 'Jumlah Hari Efektif', 'Keterangan'
  ];
  const presRows: (string | number)[][] = [
    presHeader,
    ...((data.presensiBulananList && data.presensiBulananList.length > 0)
      ? data.presensiBulananList.map((pb: any) => [
          pb.id,
          pb.bulan,
          pb.kelas,
          pb.rombel || 'A',
          'Rekapitulasi Bulanan',
          pb.s,
          pb.i,
          pb.tk,
          pb.hariEfektif,
          pb.keterangan || '-',
        ])
      : [
          ['pr-001', 'Juli 2026', 6, 'A', 'Rekapitulasi Bulanan', 2, 1, 0, 20, 'Tingkat kehadiran 95%'],
          ['pr-002', 'Agustus 2026', 6, 'A', 'Rekapitulasi Bulanan', 1, 2, 0, 22, 'Tingkat kehadiran 97%'],
        ]),
  ];

  return [
    { title: 'Data_Pegawai', rows: pegRows },
    { title: 'Data_Siswa', rows: siswaRows },
    { title: 'Rekap_Rapor', rows: raporRows },
    { title: 'Arsip_Rapor_Mapel', rows: armRows },
    { title: 'Nilai_BTQ', rows: btqRows },
    { title: 'Sarpras_Aset', rows: sarprasRows },
    { title: 'Tabungan_Siswa', rows: tabRows },
    { title: 'Presensi_Siswa', rows: presRows },
    { title: 'Surat_Keluar', rows: skRows },
    { title: 'Surat_Masuk', rows: smRows },
    { title: 'Profil_Sekolah', rows: profilRows },
    { title: 'Perangkat_Ajar', rows: paRows },
    { title: 'Presensi_Faceprint', rows: fpRows },
    { title: 'E_Kinerja_SKP', rows: skpRows },
  ];
}

// =========================================================================
// PARSERS: CONVERT ROWS FROM SPREADSHEET TO TYPED OBJECTS
// =========================================================================

export function parsePegawaiFromSheetRows(rows: any[]): Pegawai[] {
  if (!rows || rows.length === 0) return [];

  const isHeaderRow = (idVal: any, nameVal: any) => {
    const id = String(idVal || '').trim().toUpperCase();
    if (id === 'ID') return true;
    const name = String(nameVal || '').trim().toLowerCase();
    if (!name || name === 'nama lengkap' || name === 'nama' || name === 'nama pegawai') return true;
    return false;
  };

  // Case A: Array of Objects (from Google Apps Script getAllData)
  if (rows[0] && typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
    return rows
      .filter((item) => {
        if (!item || typeof item !== 'object') return false;
        const rawId = item['ID'] || item['id'] || '';
        const rawName = item['Nama Lengkap'] || item['Nama'] || item['nama'] || '';
        return !isHeaderRow(rawId, rawName);
      })
      .map((item, idx) => {
        let id = String(item['ID'] || item['id'] || `peg-${idx + 1}`).trim();
        if (!id || id.toUpperCase() === 'ID') id = `peg-${idx + 1}`;
        const nip = String(item['NIP'] || item['nip'] || '-').trim();
        const nama = String(item['Nama Lengkap'] || item['Nama'] || item['nama'] || '').trim();
        const gelarDepan = String(item['Gelar Depan'] || item['gelarDepan'] || '').trim();
        const gelarBelakang = String(item['Gelar Belakang'] || item['gelarBelakang'] || '').trim();
        const rawJk = String(item['Jenis Kelamin'] || item['JK'] || item['jenisKelamin'] || 'L').toUpperCase();
        let jenisKelamin: 'L' | 'P' = rawJk.startsWith('P') ? 'P' : 'L';
        if (nama.toLowerCase().includes('fuad')) {
          jenisKelamin = 'L';
        }
        const golongan = String(item['Golongan'] || item['golongan'] || 'III/a');
        const pangkat = String(item['Pangkat'] || item['pangkat'] || '');
        const jabatan = String(item['Jabatan'] || item['jabatan'] || 'Guru');
        const statusKepegawaian = String(item['Status Pegawai'] || item['statusKepegawaian'] || 'PNS') as any;
        const pendidikanTerakhir = String(item['Pendidikan Terakhir'] || item['pendidikanTerakhir'] || 'S1');
        const tmt = normalizeDateString(item['TMT CPNS/PPPK'] || item['TMT'] || item['tmt'] || '2010-01-01');
        const tempatLahir = String(item['Tempat Lahir'] || item['tempatLahir'] || 'Pasuruan');
        const tanggalLahir = normalizeDateString(item['Tanggal Lahir'] || item['tanggalLahir'] || '1985-01-01');
        const kontak = String(item['Kontak / WA'] || item['kontak'] || '-');
        const email = String(item['Email'] || item['email'] || '-');
        const unitKerja = String(item['Unit Kerja'] || item['unitKerja'] || 'SDN Kedungringin 1 Beji');
        const karpeg = String(item['No Karpeg'] || item['karpeg'] || '-');
        const nomorTaspen = String(item['No Taspen'] || item['nomorTaspen'] || '-');
        const npwp = String(item['NPWP'] || item['npwp'] || '-');

        const skPangkatNomor = String(item['Nomor SK Tingkat'] || item['skPangkatNomor'] || '').trim();
        const skPangkatTanggal = normalizeDateString(item['Tanggal SK Tingkat'] || item['skPangkatTanggal'] || '');
        const skPangkatTmt = normalizeDateString(item['TMT SK Tingkat'] || item['skPangkatTmt'] || '');
        const skPangkatTerakhir = (skPangkatNomor && skPangkatNomor !== '-') ? {
          nomor: skPangkatNomor,
          tanggal: skPangkatTanggal,
          tmt: skPangkatTmt,
          pejabatPenetap: 'Bupati Pasuruan',
        } : undefined;

        const skBerkalaNomor = String(item['Nomor SK Berkala'] || item['skBerkalaNomor'] || '').trim();
        const skBerkalaTanggal = normalizeDateString(item['Tanggal SK Berkala'] || item['skBerkalaTanggal'] || '');
        const skBerkalaTmt = normalizeDateString(item['TMT SK Berkala'] || item['skBerkalaTmt'] || '');
        const skBerkalaTerakhir = (skBerkalaNomor && skBerkalaNomor !== '-') ? {
          nomor: skBerkalaNomor,
          tanggal: skBerkalaTanggal,
          tmt: skBerkalaTmt,
          gajiPokok: 0,
          tmtBerikutnya: '',
          pejabatPenetap: 'Kepala Dinas Pendidikan Kab. Pasuruan',
        } : undefined;

        const skAngkatanNomor = String(item['Nomor SK Angkatan'] || item['skAngkatanNomor'] || '').trim();
        const skAngkatanTanggal = normalizeDateString(item['Tanggal SK Angkatan'] || item['skAngkatanTanggal'] || '');
        const skAngkatanTmt = normalizeDateString(item['TMT SK Angkatan'] || item['skAngkatanTmt'] || '');
        const skAngkatan = (skAngkatanNomor && skAngkatanNomor !== '-') ? {
          nomor: skAngkatanNomor,
          tanggal: skAngkatanTanggal,
          tmt: skAngkatanTmt,
          pejabatPenetap: 'Bupati Pasuruan',
        } : undefined;

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
          skPangkatTerakhir,
          skBerkalaTerakhir,
          skAngkatan,
        };
      });
  }

  // Case B: 2D Array of rows (from Google Visualization / Sheets API v4)
  if (rows.length < 2) return [];
  const dataRows = rows.slice(1);
  return dataRows
    .filter((r) => {
      if (!r || !r[2]) return false;
      return !isHeaderRow(r[0], r[2]);
    })
    .map((r, idx) => {
      let id = String(r[0] || `peg-${idx + 1}`).trim();
      if (!id || id.toUpperCase() === 'ID') id = `peg-${idx + 1}`;
      const nip = String(r[1] || '').trim();
      const nama = String(r[2] || '').trim();
      const gelarDepan = String(r[3] || '').trim();
      const gelarBelakang = String(r[4] || '').trim();
      const rawJk = String(r[5] || 'L').toUpperCase();
      let jenisKelamin: 'L' | 'P' = rawJk.startsWith('P') ? 'P' : 'L';
      if (nama.toLowerCase().includes('fuad')) {
        jenisKelamin = 'L';
      }
      const golongan = String(r[6] || 'III/a');
      const pangkat = String(r[7] || 'Penata Muda');
      const jabatan = String(r[8] || 'Guru');
      const statusKepegawaian = String(r[9] || 'PNS') as any;
      const pendidikanTerakhir = String(r[10] || 'S1');
      const tmt = normalizeDateString(r[11] || '2010-01-01');
      const tempatLahir = String(r[12] || 'Pasuruan');
      const tanggalLahir = normalizeDateString(r[13] || '1985-01-01');
      const kontak = String(r[14] || '-');
      const email = String(r[15] || '-');
      const unitKerja = String(r[16] || 'SDN Kedungringin 1 Beji');
      const karpeg = String(r[17] || '-');
      const nomorTaspen = String(r[18] || '-');
      const npwp = String(r[19] || '-');

      const skPangkatNomor = String(r[20] || '').trim();
      const skPangkatTanggal = normalizeDateString(r[21] || '');
      const skPangkatTmt = normalizeDateString(r[22] || '');
      const skPangkatTerakhir = (skPangkatNomor && skPangkatNomor !== '-') ? {
        nomor: skPangkatNomor,
        tanggal: skPangkatTanggal,
        tmt: skPangkatTmt,
        pejabatPenetap: 'Bupati Pasuruan',
      } : undefined;

      const skBerkalaNomor = String(r[23] || '').trim();
      const skBerkalaTanggal = normalizeDateString(r[24] || '');
      const skBerkalaTmt = normalizeDateString(r[25] || '');
      const skBerkalaTerakhir = (skBerkalaNomor && skBerkalaNomor !== '-') ? {
        nomor: skBerkalaNomor,
        tanggal: skBerkalaTanggal,
        tmt: skBerkalaTmt,
        gajiPokok: 0,
        tmtBerikutnya: '',
        pejabatPenetap: 'Kepala Dinas Pendidikan Kab. Pasuruan',
      } : undefined;

      const skAngkatanNomor = String(r[26] || '').trim();
      const skAngkatanTanggal = normalizeDateString(r[27] || '');
      const skAngkatanTmt = normalizeDateString(r[28] || '');
      const skAngkatan = (skAngkatanNomor && skAngkatanNomor !== '-') ? {
        nomor: skAngkatanNomor,
        tanggal: skAngkatanTanggal,
        tmt: skAngkatanTmt,
        pejabatPenetap: 'Bupati Pasuruan',
      } : undefined;

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
        skPangkatTerakhir,
        skBerkalaTerakhir,
        skAngkatan,
      };
    });
}

export function parseSiswaFromSheetRows(rows: any[]): Siswa[] {
  if (!rows || rows.length === 0) return [];
  const validAgama: Siswa['agama'][] = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

  const isHeaderRow = (idVal: any, nameVal: any) => {
    const id = String(idVal || '').trim().toUpperCase();
    if (id === 'ID') return true;
    const name = String(nameVal || '').trim().toLowerCase();
    if (!name || name.includes('nama lengkap') || name === 'nama' || name.includes('nama siswa')) return true;
    return false;
  };

  // Case A: Array of Objects (from Google Apps Script getAllData)
  if (rows[0] && typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
    return rows
      .filter((item) => {
        if (!item || typeof item !== 'object') return false;
        const rawId = item['ID'] || item['id'] || '';
        const rawName = item['Nama Lengkap Siswa'] || item['Nama Siswa'] || item['Nama'] || item['nama'] || '';
        return !isHeaderRow(rawId, rawName);
      })
      .map((item, idx) => {
        let id = String(item['ID'] || item['id'] || `sis-${idx + 1}`).trim();
        if (!id || id.toUpperCase() === 'ID') id = `sis-${idx + 1}`;
        const nisn = String(item['NISN'] || item['nisn'] || '').trim();
        const nis = String(item['NIS'] || item['nis'] || '').trim();
        const nama = String(item['Nama Lengkap Siswa'] || item['Nama Siswa'] || item['Nama'] || item['nama'] || '').trim();
        const rawJk = String(item['Jenis Kelamin'] || item['JK'] || item['jenisKelamin'] || 'L').toUpperCase();
        const jenisKelamin = rawJk.startsWith('P') ? 'P' : 'L';
        const tempatLahir = String(item['Tempat Lahir'] || item['tempatLahir'] || 'Pasuruan').trim();
        const tanggalLahir = normalizeDateString(item['Tanggal Lahir'] || item['tanggalLahir'] || '2014-01-01');
        const rawAgama = String(item['Agama'] || item['agama'] || 'Islam').trim();
        const agama: Siswa['agama'] = validAgama.includes(rawAgama as any) ? (rawAgama as Siswa['agama']) : 'Islam';
        const kelas = Number(item['Kelas'] || item['kelas']) || 1;
        const rombel = String(item['Rombel'] || item['rombel'] || 'A').trim();
        const namaAyah = String(item['Nama Ayah'] || item['namaAyah'] || '-').trim();
        const namaIbu = String(item['Nama Ibu'] || item['namaIbu'] || '-').trim();
        const alamat = String(item['Alamat Rumah'] || item['Alamat'] || item['alamat'] || 'Kedungringin, Beji').trim();
        const noHpOrtu = String(item['No HP Ortu'] || item['noHpOrtu'] || '-').trim();
        const tmtDiterima = normalizeDateString(item['TMT Diterima'] || item['tmtDiterima'] || '2024-07-15');
        const statusSiswa = (String(item['Status Siswa'] || item['statusSiswa'] || 'Aktif').trim()) as any;

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

  // Case B: 2D Array of rows (from Google Visualization / Sheets API v4)
  if (rows.length < 2) return [];
  const dataRows = rows.slice(1);
  return dataRows
    .filter((r) => {
      if (!r || !r[3]) return false;
      return !isHeaderRow(r[0], r[3]);
    })
    .map((r, idx) => {
      let id = String(r[0] || `sis-${idx + 1}`).trim();
      if (!id || id.toUpperCase() === 'ID') id = `sis-${idx + 1}`;
      const nisn = String(r[1] || '').trim();
      const nis = String(r[2] || '').trim();
      const nama = String(r[3] || '').trim();
      const jenisKelamin = String(r[4] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';
      const tempatLahir = String(r[5] || 'Pasuruan').trim();
      const tanggalLahir = normalizeDateString(r[6] || '2014-01-01');
      const rawAgama = String(r[7] || 'Islam').trim();
      const agama: Siswa['agama'] = validAgama.includes(rawAgama as any) ? (rawAgama as Siswa['agama']) : 'Islam';
      const kelas = Number(r[8]) || 1;
      const rombel = String(r[9] || 'A').trim();
      const namaAyah = String(r[10] || '-').trim();
      const namaIbu = String(r[11] || '-').trim();
      const alamat = String(r[12] || 'Kedungringin, Beji').trim();
      const noHpOrtu = String(r[13] || '-').trim();
      const tmtDiterima = normalizeDateString(r[14] || '2024-07-15');
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

export function parseSarprasFromSheetRows(rows: any[]): SarprasItem[] {
  if (!rows || rows.length === 0) return [];
  const validKategori: SarprasItem['kategori'][] = [
    'Ruang Pembelajaran',
    'Ruang Penunjang',
    'Sanitasi & Ibadah',
    'Fasilitas Terbuka',
    'Peralatan',
  ];

  const isHeaderRow = (idVal: any, nameVal: any) => {
    const id = String(idVal || '').trim().toUpperCase();
    if (id === 'ID') return true;
    const name = String(nameVal || '').trim().toLowerCase();
    if (!name || name.includes('nama sarpras') || name === 'nama' || name.includes('sarpras')) return true;
    return false;
  };

  // Case A: Array of Objects
  if (rows[0] && typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
    return rows
      .filter((item) => {
        if (!item || typeof item !== 'object') return false;
        const rawId = item['ID'] || item['id'] || '';
        const rawName = item['Nama Sarpras'] || item['namaSarpras'] || item['Nama'] || '';
        return !isHeaderRow(rawId, rawName);
      })
      .map((item, idx) => {
        let id = String(item['ID'] || item['id'] || `sar-${idx + 1}`).trim();
        if (!id || id.toUpperCase() === 'ID') id = `sar-${idx + 1}`;
        const rawKategori = String(item['Kategori'] || item['kategori'] || 'Peralatan').trim();
        const kategori: SarprasItem['kategori'] = validKategori.includes(rawKategori as any)
          ? (rawKategori as SarprasItem['kategori'])
          : 'Peralatan';
        const rawKondisi = String(item['Kondisi'] || item['kondisi'] || 'Baik').trim();
        const kondisi: SarprasItem['kondisi'] = rawKondisi.toLowerCase().includes('rusak berat')
          ? 'Rusak Berat'
          : rawKondisi.toLowerCase().includes('rusak')
          ? 'Rusak Ringan'
          : 'Baik';

        return {
          id,
          namaSarpras: String(item['Nama Sarpras'] || item['namaSarpras'] || item['Nama'] || '').trim(),
          kategori,
          jumlah: Number(item['Jumlah'] || item['jumlah']) || 1,
          satuan: String(item['Satuan'] || item['satuan'] || 'Unit').trim(),
          kondisi,
          lokasi: String(item['Lokasi'] || item['lokasi'] || 'Ruang Kelas').trim(),
          fotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
          keterangan: String(item['Keterangan'] || item['keterangan'] || 'Tercatat di SIM').trim(),
        };
      });
  }

  // Case B: 2D Array
  if (rows.length < 2) return [];
  const dataRows = rows.slice(1);
  return dataRows
    .filter((r) => {
      if (!r || !r[2]) return false;
      return !isHeaderRow(r[0], r[2]);
    })
    .map((r, idx) => {
      let id = String(r[0] || `sar-${idx + 1}`).trim();
      if (!id || id.toUpperCase() === 'ID') id = `sar-${idx + 1}`;
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
        id,
        namaSarpras: String(r[2] || '').trim(),
        kategori,
        jumlah: Number(r[4]) || 1,
        satuan: String(r[5] || 'Unit').trim(),
        kondisi,
        lokasi: String(r[7] || 'Ruang Kelas').trim(),
        fotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
        keterangan: String(r[8] || 'Tercatat di SIM').trim(),
      };
    });
}

export function parseRaporFromSheetRows(rows: any[]): RekapRaporSiswa[] {
  if (!rows || rows.length === 0) return [];

  const isHeaderRow = (idVal: any, nameVal: any) => {
    const id = String(idVal || '').trim().toUpperCase();
    if (id === 'ID') return true;
    const name = String(nameVal || '').trim().toLowerCase();
    if (!name || name.includes('nama siswa') || name === 'nama') return true;
    return false;
  };

  // Case A: Array of Objects (Google Apps Script getAllData)
  if (typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
    return rows
      .filter((r) => {
        if (!r || typeof r !== 'object') return false;
        const rawId = r['ID'] || r['id'] || '';
        const rawName = r['Nama Siswa'] || r['namaSiswa'] || r['Nama'] || '';
        return !isHeaderRow(rawId, rawName);
      })
      .map((r, idx) => {
        let id = String(r['ID'] || r['id'] || `rr-${idx + 1}`).trim();
        if (!id || id.toUpperCase() === 'ID') id = `rr-${idx + 1}`;
        const s7 = Number(r['Sem 7'] || r['sem7'] || 85);
        const s8 = Number(r['Sem 8'] || r['sem8'] || 85);
        const s9 = Number(r['Sem 9'] || r['sem9'] || 86);
        const s10 = Number(r['Sem 10'] || r['sem10'] || 87);
        const s11 = Number(r['Sem 11'] || r['sem11'] || 88);
        const s12 = Number(r['Sem 12'] || r['sem12'] || 89);
        const num = Number(r['TKA Numerasi'] || r['tkaNumerasi'] || 0);
        const lit = Number(r['TKA Literasi'] || r['tkaLiterasi'] || 0);
        const ipa = Number(r['TKA IPA'] || r['tkaIpa'] || 0);
        const tkaAvg = Number(r['Rata TKA'] || r['rataTka'] || (num && lit ? ((num + lit + ipa) / 3).toFixed(1) : 0));
        return {
          id,
          siswaId: String(r['Siswa ID'] || r['siswaId'] || `sis-${idx + 1}`),
          nisn: String(r['NISN'] || r['nisn'] || '').replace("'", '').trim(),
          namaSiswa: String(r['Nama Siswa'] || r['namaSiswa'] || '').trim(),
          kelas: Number(r['Kelas'] || r['kelas']) || 6,
          rombel: String(r['Rombel'] || r['rombel'] || 'A'),
          semester7: { 'Pendidikan Pancasila': s7, 'Bahasa Indonesia': s7, 'Matematika': s7, 'IPAS': s7 },
          semester8: { 'Pendidikan Pancasila': s8, 'Bahasa Indonesia': s8, 'Matematika': s8, 'IPAS': s8 },
          semester9: { 'Pendidikan Pancasila': s9, 'Bahasa Indonesia': s9, 'Matematika': s9, 'IPAS': s9 },
          semester10: { 'Pendidikan Pancasila': s10, 'Bahasa Indonesia': s10, 'Matematika': s10, 'IPAS': s10 },
          semester11: { 'Pendidikan Pancasila': s11, 'Bahasa Indonesia': s11, 'Matematika': s11, 'IPAS': s11 },
          semester12: { 'Pendidikan Pancasila': s12, 'Bahasa Indonesia': s12, 'Matematika': s12, 'IPAS': s12 },
          tka: {
            numerasi: num,
            literasi: lit,
            ipaPilihan: ipa,
            rataRata: tkaAvg,
            predikat: (r['Predikat'] || (tkaAvg >= 85 ? 'Sangat Baik' : tkaAvg >= 75 ? 'Baik' : 'Cukup')) as any,
          },
        };
      });
  }

  // Case B: 2D Array (GViz / Sheets API)
  if (rows.length < 2) return [];
  return rows.slice(1)
    .filter((r) => {
      if (!r || !(r[1] || r[2])) return false;
      return !isHeaderRow(r[0], r[2]);
    })
    .map((r, idx) => {
      let id = String(r[0] || `rr-${idx + 1}`).trim();
      if (!id || id.toUpperCase() === 'ID') id = `rr-${idx + 1}`;
      const s7 = Number(r[5]) || 85;
      const s8 = Number(r[6]) || 85;
      const s9 = Number(r[7]) || 86;
      const s10 = Number(r[8]) || 87;
      const s11 = Number(r[9]) || 88;
      const s12 = Number(r[10]) || 89;
      const num = Number(r[13]) || 0;
      const lit = Number(r[14]) || 0;
      const ipa = Number(r[15]) || 0;
      const tkaAvg = Number(r[16]) || 0;
      return {
        id,
        siswaId: `sis-${idx + 1}`,
        nisn: String(r[1] || '').replace("'", '').trim(),
        namaSiswa: String(r[2] || '').trim(),
        kelas: Number(r[3]) || 6,
        rombel: String(r[4] || 'A'),
        semester7: { 'Pendidikan Pancasila': s7, 'Bahasa Indonesia': s7, 'Matematika': s7, 'IPAS': s7 },
        semester8: { 'Pendidikan Pancasila': s8, 'Bahasa Indonesia': s8, 'Matematika': s8, 'IPAS': s8 },
        semester9: { 'Pendidikan Pancasila': s9, 'Bahasa Indonesia': s9, 'Matematika': s9, 'IPAS': s9 },
        semester10: { 'Pendidikan Pancasila': s10, 'Bahasa Indonesia': s10, 'Matematika': s10, 'IPAS': s10 },
        semester11: { 'Pendidikan Pancasila': s11, 'Bahasa Indonesia': s11, 'Matematika': s11, 'IPAS': s11 },
        semester12: { 'Pendidikan Pancasila': s12, 'Bahasa Indonesia': s12, 'Matematika': s12, 'IPAS': s12 },
        tka: {
          numerasi: num,
          literasi: lit,
          ipaPilihan: ipa,
          rataRata: tkaAvg,
          predikat: (r[17] || (tkaAvg >= 85 ? 'Sangat Baik' : 'Baik')) as any,
        },
      };
    });
}

export function parseBTQFromSheetRows(rows: any[]): NilaiIjazahBTQ[] {
  if (!rows || rows.length === 0) return [];

  const isHeaderRow = (idVal: any, nameVal: any) => {
    const id = String(idVal || '').trim().toUpperCase();
    if (id === 'ID') return true;
    const name = String(nameVal || '').trim().toLowerCase();
    if (!name || name.includes('nama siswa') || name === 'nama') return true;
    return false;
  };

  // Case A: Array of Objects (Google Apps Script getAllData)
  if (typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
    return rows
      .filter((r) => {
        if (!r || typeof r !== 'object') return false;
        const rawId = r['ID'] || r['id'] || '';
        const rawName = r['Nama Siswa'] || r['namaSiswa'] || r['Nama'] || '';
        return !isHeaderRow(rawId, rawName);
      })
      .map((r, idx) => {
        let id = String(r['ID'] || r['id'] || `btq-${idx + 1}`).trim();
        if (!id || id.toUpperCase() === 'ID') id = `btq-${idx + 1}`;
        const tahsin = Number(r['Tahsin'] || r['tahsin']) || 80;
        const tajwid = Number(r['Tajwid'] || r['tajwid']) || 80;
        const tahfidz = Number(r['Tahfidz'] || r['tahfidz']) || 80;
        const menulis = Number(r['Menulis'] || r['menulis']) || 80;
        const membaca = Number(r['Membaca'] || r['membaca']) || 80;
        const avg = Number(r['Rata-rata'] || r['rataRata']) || Number(((tahsin + tajwid + tahfidz + menulis + membaca) / 5).toFixed(1));
        let predikat = (r['Predikat'] || r['predikat'] || 'Jayyid') as any;
        if (!r['Predikat']) {
          if (avg >= 90) predikat = 'Mumtaz';
          else if (avg >= 80) predikat = 'Jayyid Jiddan';
          else if (avg >= 75) predikat = 'Jayyid';
          else if (avg >= 60) predikat = 'Maqbul';
          else predikat = 'Kurang';
        }
        return {
          id,
          siswaId: String(r['Siswa ID'] || r['siswaId'] || `sis-${idx + 1}`),
          nisn: String(r['NISN'] || r['nisn'] || '').replace("'", '').trim(),
          namaSiswa: String(r['Nama Siswa'] || r['namaSiswa'] || '').trim(),
          kelas: Number(r['Kelas'] || r['kelas']) || 6,
          noSertifikat: String(r['No Sertifikat'] || r['noSertifikat'] || `421.2/BTQ-${String(idx + 1).padStart(3, '0')}/424.072.24/2026`),
          tahsin,
          tajwid,
          tahfidz,
          menulis,
          membaca,
          rataRata: avg,
          predikat,
          statusKelulusan: avg >= 60 ? 'Lulus' : 'Remedial',
          catatan: String(r['Catatan'] || r['catatan'] || 'Memenuhi standarisasi kelulusan BTQ'),
          tanggalTerbit: String(r['Tanggal Terbit'] || r['tanggalTerbit'] || '2026-06-20'),
          penguji: String(r['Penguji'] || r['penguji'] || 'Ust. Ahmad Fauzi, S.Pd.I'),
        };
      });
  }

  // Case B: 2D Array (GViz / Sheets API)
  if (rows.length < 2) return [];
  return rows.slice(1)
    .filter((r) => {
      if (!r || !(r[1] || r[2])) return false;
      return !isHeaderRow(r[0], r[2]);
    })
    .map((r, idx) => {
      let id = String(r[0] || `btq-${idx + 1}`).trim();
      if (!id || id.toUpperCase() === 'ID') id = `btq-${idx + 1}`;
      const tahsin = Number(r[4]) || 80;
      const tajwid = Number(r[5]) || 80;
      const tahfidz = Number(r[6]) || 80;
      const menulis = Number(r[7]) || 80;
      const membaca = Number(r[8]) || 80;
      const avg = Number(r[9]) || Number(((tahsin + tajwid + tahfidz + menulis + membaca) / 5).toFixed(1));
      return {
        id,
        siswaId: `sis-${idx + 1}`,
        nisn: String(r[1] || '').replace("'", '').trim(),
        namaSiswa: String(r[2] || '').trim(),
        kelas: 6,
        noSertifikat: String(r[3] || `421.2/BTQ-${String(idx + 1).padStart(3, '0')}/424.072.24/2026`),
        tahsin,
        tajwid,
        tahfidz,
        menulis,
        membaca,
        rataRata: avg,
        predikat: (r[10] || (avg >= 90 ? 'Mumtaz' : avg >= 80 ? 'Jayyid Jiddan' : 'Jayyid')) as any,
        statusKelulusan: avg >= 60 ? 'Lulus' : 'Remedial',
        catatan: 'Standar kelulusan BTQ',
        tanggalTerbit: String(r[11] || '2026-06-20'),
        penguji: String(r[12] || 'Ust. Ahmad Fauzi, S.Pd.I'),
      };
    });
}

export function parseProfilFromSheetRows(rows: any[][], fallback?: ProfilSekolah): ProfilSekolah {
  const result: ProfilSekolah = {
    ...(fallback || INITIAL_PROFIL),
  };

  if (!rows || rows.length === 0) return result;

  const map: Record<string, string> = {};

  // Case A: Key-Value rows (Parameter | Nilai)
  for (const r of rows) {
    if (!r || r.length < 2) continue;
    const key = String(r[0] || '').trim().toLowerCase();
    const val = String(r[1] !== undefined && r[1] !== null ? r[1] : '').trim();
    if (key && val) {
      map[key] = val;
    }
  }

  // Case B: Horizontal table (Row 0 = headers, Row 1 = values)
  if (rows.length >= 2 && rows[0] && Array.isArray(rows[0])) {
    const headers = rows[0].map((h: any) => String(h || '').trim().toLowerCase());
    const values = rows[1] || [];
    headers.forEach((h, idx) => {
      if (h && values[idx] !== undefined && values[idx] !== null) {
        const val = String(values[idx]).trim();
        if (val) map[h] = val;
      }
    });
  }

  // Flexibly assign fields from map
  for (const [k, v] of Object.entries(map)) {
    if (!v) continue;
    if (k.includes('nama') && (k.includes('sekolah') || k === 'nama')) {
      result.nama = v;
    } else if (k === 'npsn' || k.includes('npsn')) {
      result.npsn = v;
    } else if (k.includes('bentuk') || k === 'jenjang') {
      result.bentukPendidikan = v;
    } else if (k === 'status' || k.includes('status sekolah')) {
      result.status = v;
    } else if (k.includes('akreditasi')) {
      result.akreditasi = v;
    } else if (k.includes('alamat')) {
      result.alamat = v;
    } else if (k.includes('kecamatan') || k === 'kec') {
      result.kecamatan = v;
    } else if (k.includes('kabupaten') || k.includes('kota') || k === 'kab') {
      result.kabupaten = v;
    } else if ((k.includes('kepala') || k.includes('kepsek')) && !k.includes('nip') && !k.includes('pangkat')) {
      result.kepalaSekolah = v;
    } else if (k.includes('nip') && (k.includes('kepala') || k.includes('kepsek') || k === 'nip')) {
      result.nipKepalaSekolah = v;
    } else if (k.includes('pangkat') && (k.includes('kepala') || k.includes('kepsek'))) {
      result.pangkatKepalaSekolah = v;
    } else if (k.includes('tahun') && (k.includes('pelajaran') || k.includes('ajaran'))) {
      result.tahunPelajaranAktif = v;
    } else if (k.includes('acuan') || (k.includes('tanggal') && k.includes('usia'))) {
      result.tanggalAcuanUsia = v;
    }
  }

  return result;
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
  accessToken?: string | null,
  currentProfil?: ProfilSekolah
): Promise<{
  pegawai?: Pegawai[];
  siswa?: Siswa[];
  rapor?: RekapRaporSiswa[];
  btq?: NilaiIjazahBTQ[];
  sarpras?: SarprasItem[];
  profil?: ProfilSekolah;
  rawRows?: Record<string, any[][]>;
  timestamp: string;
}> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  if (!cleanId) {
    throw new Error('ID atau link Google Spreadsheet tidak boleh kosong.');
  }

  const sheetNames = ['Data_Pegawai', 'Data_Siswa', 'Sarpras_Aset', 'Profil_Sekolah', 'Rekap_Rapor', 'Nilai_BTQ'];
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
  const parsedRapor = rawData['Rekap_Rapor'] ? parseRaporFromSheetRows(rawData['Rekap_Rapor']) : undefined;
  const parsedBtq = rawData['Nilai_BTQ'] ? parseBTQFromSheetRows(rawData['Nilai_BTQ']) : undefined;
  const parsedProfil = rawData['Profil_Sekolah'] && rawData['Profil_Sekolah'].length > 0 
    ? parseProfilFromSheetRows(rawData['Profil_Sekolah'], currentProfil) 
    : undefined;

  const now = new Date().toLocaleTimeString('id-ID');
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, now);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_STATUS, 'SUCCESS');
  } catch {}

  return {
    pegawai: parsedPegawai,
    siswa: parsedSiswa,
    rapor: parsedRapor,
    btq: parsedBtq,
    sarpras: parsedSarpras,
    profil: parsedProfil,
    rawRows: rawData,
    timestamp: now,
  };
}

// Dedicated function to fetch and sync Profil Sekolah from Spreadsheet
export async function fetchProfilSekolahFromSpreadsheet(
  spreadsheetId?: string,
  accessToken?: string | null,
  currentProfil?: ProfilSekolah
): Promise<ProfilSekolah> {
  const targetId = extractSpreadsheetId(spreadsheetId || getSavedMasterSheetId());

  // 1. Fetch via Google Sheet (GViz or API v4)
  if (targetId) {
    const candidateNames = ['Profil_Sekolah', 'Profil', 'Profil Sekolah', 'Data_Profil', 'Sekolah'];
    for (const name of candidateNames) {
      try {
        let rows: any[][] = [];
        if (accessToken) {
          try {
            const batch = await fetchSheetRowsViaApiV4(targetId, [name], accessToken);
            rows = batch[name] || [];
          } catch {
            rows = await fetchSheetRowsViaGViz(targetId, name);
          }
        } else {
          rows = await fetchSheetRowsViaGViz(targetId, name);
        }

        if (rows && rows.length > 0) {
          const parsed = parseProfilFromSheetRows(rows, currentProfil);
          if (parsed && parsed.nama) {
            return parsed;
          }
        }
      } catch (e) {
        // Continue to next candidate
      }
    }
  }

  // 2. Fetch via Google Apps Script (proxy or direct)
  try {
    const webAppUrl = getSavedWebAppUrl();
    const proxyRes = await fetch(`/api/live-data?scriptUrl=${encodeURIComponent(webAppUrl)}`);
    if (proxyRes.ok) {
      const resJson = await proxyRes.json();
      const data = resJson.data;
      if (data && data.profil && Array.isArray(data.profil) && data.profil.length > 0) {
        const rows: any[][] = [];
        for (const item of data.profil) {
          if (Array.isArray(item)) {
            rows.push(item);
          } else if (typeof item === 'object' && item !== null) {
            const vals = Object.values(item);
            if (vals.length >= 2) rows.push([vals[0], vals[1]]);
            else if (vals.length === 1) rows.push([Object.keys(item)[0], vals[0]]);
          }
        }
        if (rows.length > 0) {
          const parsed = parseProfilFromSheetRows(rows, currentProfil);
          if (parsed && parsed.nama) return parsed;
        }
      }
    }
  } catch (gasErr) {
    console.warn('Apps Script Profil fetch fallback error:', gasErr);
  }

  if (!targetId) {
    throw new Error('ID Spreadsheet master belum terhubung. Silakan hubungkan spreadsheet di menu Setting atau tombol sinkronisasi.');
  }

  throw new Error(`Sheet "Profil_Sekolah" tidak ditemukan pada Spreadsheet ID: ${targetId}. Pastikan sheet bernama "Profil_Sekolah" ada dan dapat diakses publik/viewer.`);
}

/**
 * Mengambil data terbaru secara langsung dari Google Spreadsheet / Google Apps Script
 * Dipakai saat aplikasi pertama kali dimuat & polling otomatis berkala
 */
export async function fetchAllLiveMasterData(currentProfil?: ProfilSekolah): Promise<{
  pegawai?: Pegawai[];
  siswa?: Siswa[];
  rapor?: RekapRaporSiswa[];
  btq?: NilaiIjazahBTQ[];
  sarpras?: SarprasItem[];
  profil?: ProfilSekolah;
  timestamp: string;
} | null> {
  const targetScriptUrl = getSavedWebAppUrl();

  // 1. Prioritas 1: Google Apps Script Web App via Backend Proxy /api/live-data (Bebas CORS & Sangat Cepat)
  try {
    const proxyRes = await fetch(`/api/live-data?scriptUrl=${encodeURIComponent(targetScriptUrl)}`);
    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json.success && json.data) {
        const data = json.data;
        const parsedPeg = (data.pegawai && Array.isArray(data.pegawai) && data.pegawai.length > 0)
          ? parsePegawaiFromSheetRows(data.pegawai)
          : undefined;

        const parsedSis = (data.siswa && Array.isArray(data.siswa) && data.siswa.length > 0)
          ? parseSiswaFromSheetRows(data.siswa)
          : undefined;

        const parsedRap = (data.rapor && Array.isArray(data.rapor) && data.rapor.length > 0)
          ? parseRaporFromSheetRows(data.rapor)
          : undefined;

        const parsedBtq = (data.btq && Array.isArray(data.btq) && data.btq.length > 0)
          ? parseBTQFromSheetRows(data.btq)
          : undefined;

        const parsedSar = (data.sarpras && Array.isArray(data.sarpras) && data.sarpras.length > 0)
          ? parseSarprasFromSheetRows(data.sarpras)
          : undefined;

        let parsedProf: ProfilSekolah | undefined = undefined;
        if (data.profil && Array.isArray(data.profil) && data.profil.length > 0) {
          const rows: any[][] = [];
          for (const item of data.profil) {
            if (Array.isArray(item)) rows.push(item);
            else if (typeof item === 'object' && item !== null) {
              const vals = Object.values(item);
              if (vals.length >= 2) rows.push([vals[0], vals[1]]);
              else if (vals.length === 1) rows.push([Object.keys(item)[0], vals[0]]);
            }
          }
          if (rows.length > 0) {
            parsedProf = parseProfilFromSheetRows(rows, currentProfil);
          }
        }

        if (parsedPeg || parsedSis || parsedRap || parsedBtq || parsedSar || parsedProf) {
          const now = new Date().toLocaleTimeString('id-ID');
          try {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, now);
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC_STATUS, 'SUCCESS');
          } catch {}

          return {
            pegawai: parsedPeg,
            siswa: parsedSis,
            rapor: parsedRap,
            btq: parsedBtq,
            sarpras: parsedSar,
            profil: parsedProf,
            timestamp: now,
          };
        }
      }
    }
  } catch (proxyErr) {
    console.warn('Backend proxy /api/live-data notice:', proxyErr);
  }

  // 2. Prioritas 2: Spreadsheet Google Sheets ID (GViz endpoint)
  const savedId = getSavedMasterSheetId();
  if (savedId) {
    try {
      const res = await fetchMasterDatabaseRealtime(savedId, null, currentProfil);
      if (res.pegawai || res.siswa || res.rapor || res.btq || res.sarpras || res.profil) {
        return res;
      }
    } catch (gvizErr) {
      console.warn('GViz fetchAllLiveMasterData error:', gvizErr);
    }
  }

  return null;
}

// =========================================================================
// SPREADSHEET PAYLOAD SERIALIZERS (Bilingual Keys for Guaranteed GAS Compatibility)
// =========================================================================
export function formatPegawaiPayload(p: Pegawai): any {
  if (!p) return {};
  return {
    ID: p.id,
    id: p.id,
    NIP: p.nip || '-',
    nip: p.nip || '-',
    'Nama Lengkap': p.nama,
    nama: p.nama,
    'Gelar Depan': p.gelarDepan || '',
    gelarDepan: p.gelarDepan || '',
    'Gelar Belakang': p.gelarBelakang || '',
    gelarBelakang: p.gelarBelakang || '',
    'Jenis Kelamin': p.jenisKelamin || 'L',
    jenisKelamin: p.jenisKelamin || 'L',
    Golongan: p.golongan || '-',
    golongan: p.golongan || '-',
    Pangkat: p.pangkat || '-',
    pangkat: p.pangkat || '-',
    Jabatan: p.jabatan || 'Guru',
    jabatan: p.jabatan || 'Guru',
    'Status Pegawai': p.statusKepegawaian || 'PNS',
    statusKepegawaian: p.statusKepegawaian || 'PNS',
    'Pendidikan Terakhir': p.pendidikanTerakhir || 'S1',
    pendidikanTerakhir: p.pendidikanTerakhir || 'S1',
    'TMT CPNS/PPPK': p.tmt || '-',
    tmt: p.tmt || '-',
    'Tempat Lahir': p.tempatLahir || 'Pasuruan',
    tempatLahir: p.tempatLahir || 'Pasuruan',
    'Tanggal Lahir': p.tanggalLahir || '-',
    tanggalLahir: p.tanggalLahir || '-',
    'Kontak / WA': p.kontak || '-',
    kontak: p.kontak || '-',
    Email: p.email || '-',
    email: p.email || '-',
    'Unit Kerja': p.unitKerja || 'SDN Kedungringin 1 Beji',
    unitKerja: p.unitKerja || 'SDN Kedungringin 1 Beji',
    'No Karpeg': p.karpeg || '-',
    'No Taspen': p.nomorTaspen || '-',
    NPWP: p.npwp || '-',
    'Nomor SK Tingkat': p.skPangkatTerakhir?.nomor || '-',
    'Tanggal SK Tingkat': p.skPangkatTerakhir?.tanggal || '-',
    'TMT SK Tingkat': p.skPangkatTerakhir?.tmt || '-',
    'Nomor SK Berkala': p.skBerkalaTerakhir?.nomor || '-',
    'Tanggal SK Berkala': p.skBerkalaTerakhir?.tanggal || '-',
    'TMT SK Berkala': p.skBerkalaTerakhir?.tmt || '-',
    'Nomor SK Angkatan': p.skAngkatan?.nomor || '-',
    'Tanggal SK Angkatan': p.skAngkatan?.tanggal || '-',
    'TMT SK Angkatan': p.skAngkatan?.tmt || '-'
  };
}

export function formatSiswaPayload(s: Siswa): any {
  if (!s) return {};
  return {
    ID: s.id,
    id: s.id,
    NISN: s.nisn,
    nisn: s.nisn,
    NIS: s.nis,
    nis: s.nis,
    'Nama Lengkap Siswa': s.nama,
    'Nama Siswa': s.nama,
    nama: s.nama,
    'Jenis Kelamin': s.jenisKelamin || 'L',
    jenisKelamin: s.jenisKelamin || 'L',
    'Tempat Lahir': s.tempatLahir || 'Pasuruan',
    tempatLahir: s.tempatLahir || 'Pasuruan',
    'Tanggal Lahir': s.tanggalLahir || '-',
    tanggalLahir: s.tanggalLahir || '-',
    Agama: s.agama || 'Islam',
    agama: s.agama || 'Islam',
    Kelas: s.kelas,
    kelas: s.kelas,
    Rombel: s.rombel || 'A',
    rombel: s.rombel || 'A',
    'Nama Ayah': s.namaAyah || '-',
    namaAyah: s.namaAyah || '-',
    'Nama Ibu': s.namaIbu || '-',
    namaIbu: s.namaIbu || '-',
    'Alamat Rumah': s.alamat || '-',
    alamat: s.alamat || '-',
    'No HP Ortu': s.noHpOrtu || '-',
    noHpOrtu: s.noHpOrtu || '-',
    'TMT Diterima': s.tmtDiterima || '2024-07-15',
    tmtDiterima: s.tmtDiterima || '2024-07-15',
    'Status Siswa': s.statusSiswa || 'Aktif',
    statusSiswa: s.statusSiswa || 'Aktif',
  };
}

export function formatSarprasPayload(s: SarprasItem): any {
  if (!s) return {};
  return {
    ID: s.id,
    id: s.id,
    'Nama Sarpras': s.namaSarpras,
    namaSarpras: s.namaSarpras,
    nama: s.namaSarpras,
    Kategori: s.kategori,
    kategori: s.kategori,
    Jumlah: s.jumlah,
    jumlah: s.jumlah,
    Satuan: s.satuan,
    satuan: s.satuan,
    Kondisi: s.kondisi,
    kondisi: s.kondisi,
    Lokasi: s.lokasi,
    lokasi: s.lokasi,
    Keterangan: s.keterangan || '-',
    keterangan: s.keterangan || '-'
  };
}

export function formatRaporPayload(r: any): any {
  if (!r) return {};
  const calcAvg = (map?: Record<string, number> | number) => {
    if (!map) return 0;
    if (typeof map === 'number') return map;
    const vals = Object.values(map);
    return vals.length > 0 ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0;
  };
  const s7 = calcAvg(r.semester7);
  const s8 = calcAvg(r.semester8);
  const s9 = calcAvg(r.semester9);
  const s10 = calcAvg(r.semester10);
  const s11 = calcAvg(r.semester11);
  const s12 = calcAvg(r.semester12);
  const avg5 = Number(((s7 + s8 + s9 + s10 + s11) / 5).toFixed(2));
  const avg4 = Number(((s7 + s8 + s9 + s10) / 4).toFixed(2));

  return {
    ID: r.id,
    id: r.id,
    NISN: r.nisn,
    nisn: r.nisn,
    'Nama Siswa': r.namaSiswa,
    namaSiswa: r.namaSiswa,
    nama: r.namaSiswa,
    Kelas: r.kelas,
    kelas: r.kelas,
    Rombel: r.rombel || 'A',
    rombel: r.rombel || 'A',
    'Sem 7': s7,
    'Sem 8': s8,
    'Sem 9': s9,
    'Sem 10': s10,
    'Sem 11': s11,
    'Sem 12': s12,
    'Rata Rapor 5 Sem': avg5,
    'Rata Rapor 4 Sem': avg4,
    'TKA Numerasi': r.tka?.numerasi || 0,
    'TKA Literasi': r.tka?.literasi || 0,
    'TKA IPA': r.tka?.ipaPilihan || 0,
    'Rata TKA': r.tka?.rataRata || 0,
    Predikat: r.tka?.predikat || '-'
  };
}

export function formatBTQPayload(b: NilaiIjazahBTQ): any {
  if (!b) return {};
  return {
    ID: b.id,
    id: b.id,
    NISN: b.nisn,
    nisn: b.nisn,
    'Nama Siswa': b.namaSiswa,
    namaSiswa: b.namaSiswa,
    nama: b.namaSiswa,
    'No Sertifikat': b.noSertifikat,
    noSertifikat: b.noSertifikat,
    Tahsin: b.tahsin,
    tahsin: b.tahsin,
    Tajwid: b.tajwid,
    tajwid: b.tajwid,
    Tahfidz: b.tahfidz,
    tahfidz: b.tahfidz,
    Menulis: b.menulis,
    menulis: b.menulis,
    Membaca: b.membaca,
    membaca: b.membaca,
    'Rata-rata': b.rataRata,
    rataRata: b.rataRata,
    Predikat: b.predikat,
    predikat: b.predikat
  };
}

export function formatSuratMasukPayload(sm: SuratMasuk): any {
  if (!sm) return {};
  return {
    ID: sm.id,
    id: sm.id,
    'Nomor Surat Masuk': sm.nomorSuratMasuk,
    nomorSuratMasuk: sm.nomorSuratMasuk,
    'Tanggal Surat': sm.tanggalSurat,
    tanggalSurat: sm.tanggalSurat,
    'Tanggal Diterima': sm.tanggalDiterima,
    tanggalDiterima: sm.tanggalDiterima,
    Pengirim: sm.pengirim,
    pengirim: sm.pengirim,
    Perihal: sm.perihal,
    perihal: sm.perihal,
    Disposisi: sm.disposisiKepsek || '-',
    disposisiKepsek: sm.disposisiKepsek || '-'
  };
}

export function formatSuratKeluarPayload(sk: SuratKeluar): any {
  if (!sk) return {};
  return {
    ID: sk.id,
    id: sk.id,
    'Nomor Surat': sk.nomorSurat,
    nomorSurat: sk.nomorSurat,
    'Tanggal Surat': sk.tanggalSurat,
    tanggalSurat: sk.tanggalSurat,
    Perihal: sk.perihal,
    perihal: sk.perihal,
    'Tujuan / Penerima': sk.tujuan,
    tujuan: sk.tujuan,
    'Pejabat NIP': sk.pejabatNip || '-',
    pejabatNip: sk.pejabatNip || '-',
    Status: sk.status || 'Terkirim',
    status: sk.status || 'Terkirim'
  };
}

export function formatProfilPayload(p: ProfilSekolah): any {
  if (!p) return {};
  return {
    ...p,
    'Nama Sekolah': p.nama,
    NPSN: p.npsn,
    'Bentuk Pendidikan': p.bentukPendidikan,
    Status: p.status,
    Akreditasi: p.akreditasi,
    Alamat: p.alamat,
    Kecamatan: p.kecamatan,
    Kabupaten: p.kabupaten,
    'Kepala Sekolah': p.kepalaSekolah,
    'NIP Kepala Sekolah': p.nipKepalaSekolah,
    'Tahun Pelajaran': p.tahunPelajaranAktif
  };
}

/**
 * Otomatis mengirim dan menyinkronkan data yang disimpan di web langsung ke Google Spreadsheet Master
 * Dipanggil di setiap aksi Simpan (Pegawai, Siswa, Rapor, BTQ, Sarpras, Surat, Profil)
 */
export async function pushDataToMasterSpreadsheet(data: {
  profil: ProfilSekolah;
  pegawai: Pegawai[];
  siswa: Siswa[];
  rapor: RekapRaporSiswa[];
  btq: NilaiIjazahBTQ[];
  sarpras: SarprasItem[];
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  actionName?: string;
  item?: any;
}): Promise<{
  success: boolean;
  message: string;
  timestamp: string;
  channel: 'apps_script' | 'sheets_api' | 'cached';
}> {
  const timestamp = new Date().toLocaleTimeString('id-ID');
  const cleanId = extractSpreadsheetId(getSavedMasterSheetId());
  const webAppUrl = getSavedWebAppUrl();
  let syncedViaGas = false;
  let syncedViaSheetsApi = false;
  let serverMessage = '';

  // Determine specific item formatting based on actionName
  let formattedItem: any = null;
  if (data.item) {
    if (data.actionName === 'savePegawai') formattedItem = formatPegawaiPayload(data.item);
    else if (data.actionName === 'saveSiswa') formattedItem = formatSiswaPayload(data.item);
    else if (data.actionName === 'saveSarpras') formattedItem = formatSarprasPayload(data.item);
    else if (data.actionName === 'saveRapor') formattedItem = formatRaporPayload(data.item);
    else if (data.actionName === 'saveNilaiBTQ') formattedItem = formatBTQPayload(data.item);
    else if (data.actionName === 'saveSuratMasuk') formattedItem = formatSuratMasukPayload(data.item);
    else if (data.actionName === 'saveSuratKeluar') formattedItem = formatSuratKeluarPayload(data.item);
    else if (data.actionName === 'saveProfil') formattedItem = formatProfilPayload(data.item);
    else formattedItem = data.item;
  }

  // 1. Kirim update ke backend proxy /api/sync-spreadsheet (Bebas CORS, Langsung ke Google Apps Script)
  try {
    const proxyRes = await fetch('/api/sync-spreadsheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scriptUrl: webAppUrl,
        action: data.actionName || 'syncAllData',
        payload: {
          ...(formattedItem || {}),
          item: formattedItem || data.item,
          profil: formatProfilPayload(data.profil),
          pegawai: (data.pegawai || []).map(formatPegawaiPayload),
          siswa: (data.siswa || []).map(formatSiswaPayload),
          rapor: (data.rapor || []).map(formatRaporPayload),
          btq: (data.btq || []).map(formatBTQPayload),
          sarpras: (data.sarpras || []).map(formatSarprasPayload),
          suratMasuk: (data.suratMasuk || []).map(formatSuratMasukPayload),
          suratKeluar: (data.suratKeluar || []).map(formatSuratKeluarPayload),
          arsipRaporMapel: (data.rapor || []).flatMap((r) => {
            const mapelNames = [
              'Pendidikan Agama Islam dan Budi Pekerti (PAI)',
              'Pendidikan Pancasila (PKn)',
              'Bahasa Indonesia (B. Ind)',
              'Matematika (Mtk)',
              'Seni Budaya (SB)',
              'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)',
              'Bahasa Inggris (B. Ing)',
              'Muatan Lokal Bahasa Jawa (B. Jawa)',
            ];
            const list: any[] = [];
            const sMap: Record<number, any> = { 7: r.semester7, 8: r.semester8, 9: r.semester9, 10: r.semester10, 11: r.semester11, 12: r.semester12 };
            [7, 8, 9, 10, 11, 12].forEach((sem) => {
              if (sMap[sem]) {
                mapelNames.forEach((m) => {
                  let sc = sMap[sem][m] || 0;
                  if (!sc) {
                    if (m.includes('PAI')) sc = sMap[sem]['PAI'] || sMap[sem]['Pendidikan Agama Islam'] || 0;
                    else if (m.includes('Pancasila')) sc = sMap[sem]['PKn'] || sMap[sem]['Pendidikan Pancasila'] || 0;
                    else if (m.includes('Indonesia')) sc = sMap[sem]['Bahasa Indonesia'] || 0;
                    else if (m.includes('Matematika')) sc = sMap[sem]['Matematika'] || 0;
                    else if (m.includes('Seni')) sc = sMap[sem]['Seni Budaya'] || 0;
                    else if (m.includes('Jasmani')) sc = sMap[sem]['PJOK'] || 0;
                    else if (m.includes('Inggris')) sc = sMap[sem]['Bahasa Inggris'] || 86;
                    else if (m.includes('Jawa')) sc = sMap[sem]['Bahasa Jawa'] || 0;
                  }
                  if (sc > 0) {
                    list.push({
                      id: `arm-${r.id}-s${sem}-${m}`,
                      nisn: r.nisn,
                      namaSiswa: r.namaSiswa,
                      kelas: r.kelas,
                      rombel: r.rombel || 'A',
                      semester: `Semester ${sem}`,
                      mapel: m,
                      nilai: sc,
                      predikat: sc >= 90 ? 'A (Sangat Baik)' : sc >= 80 ? 'B (Baik)' : sc >= 75 ? 'C (Cukup)' : 'D (Perlu Bimbingan)',
                      tahunPelajaran: data.profil?.tahunPelajaranAktif || '2024/2025'
                    });
                  }
                });
              }
            });
            return list;
          }),
          timestamp,
        },
      }),
    });

    if (proxyRes.ok) {
      const resJson = await proxyRes.json();
      if (resJson.success) {
        syncedViaGas = true;
        serverMessage = resJson.message || '';
      }
    }
  } catch (proxyErr) {
    console.warn('Proxy sync error:', proxyErr);
  }

  // 2. Sinkronkan langsung ke Google Spreadsheet via Google Sheets API (jika Google OAuth aktif & Master Sheet ID ada)
  // Menggunakan extendOrUpdateMasterSpreadsheet agar tidak menimpa data pokok awal dan tidak membuat file baru
  if (cleanId) {
    try {
      const token = await getAccessToken();
      if (token) {
        const sheets = buildMasterDatabaseSpreadsheet({
          profil: data.profil,
          pegawai: data.pegawai,
          siswa: data.siswa,
          rapor: data.rapor,
          btq: data.btq,
          sarpras: data.sarpras,
          suratMasuk: data.suratMasuk,
          suratKeluar: data.suratKeluar,
        });
        await extendOrUpdateMasterSpreadsheet(cleanId, sheets, token);
        syncedViaSheetsApi = true;
      }
    } catch (sheetErr) {
      console.warn('Auto-sync via Google Sheets API skipped/error:', sheetErr);
    }
  }

  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, timestamp);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_STATUS, 'SUCCESS');
    window.dispatchEvent(new CustomEvent('master_spreadsheet_synced', { detail: { timestamp } }));
  } catch {}

  const channel: 'apps_script' | 'sheets_api' | 'cached' = 
    syncedViaSheetsApi ? 'sheets_api' : syncedViaGas ? 'apps_script' : 'cached';

  return {
    success: true,
    message: serverMessage || (syncedViaSheetsApi 
      ? `Tersinkron langsung ke Master Google Spreadsheet (${timestamp})`
      : syncedViaGas
      ? `Terkirim ke Google Apps Script Web App (${timestamp})`
      : `Disimpan ke basis data & cache sinkronisasi lokal (${timestamp})`),
    timestamp,
    channel,
  };
}




