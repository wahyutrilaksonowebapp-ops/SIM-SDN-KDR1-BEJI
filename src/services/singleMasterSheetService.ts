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
import { INITIAL_PROFIL } from '../data/initialData';

export const TARGET_GDRIVE_FOLDER_ID = '1cry49dLyjsyXfkGJIARR_PLwUV67t7ur';
export const MASTER_SPREADSHEET_TITLE = 'SIM_SDN_Kedungringin1_Master_Database_2026_2027';

export const LOCKED_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxQKrCfjYPLT0Eol82ooEsfVOtOWJwcQn4rx-axJNcQ9TrVxc7Rm8YJ6y7uSd54hJC8ew/exec';

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
  perangkatAjar?: any[];
  presensiList?: any[];
  skpList?: any[];
}): SheetDefinition[] {
  const { profil, pegawai, siswa, rapor, btq, sarpras, suratMasuk, suratKeluar, perangkatAjar, presensiList, skpList } = data;

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

  return [
    { title: 'Data_Pegawai', rows: pegRows },
    { title: 'Data_Siswa', rows: siswaRows },
    { title: 'Rekap_Rapor', rows: raporRows },
    { title: 'Nilai_BTQ', rows: btqRows },
    { title: 'Sarpras_Aset', rows: sarprasRows },
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

  // Case A: Array of Objects (from Google Apps Script getAllData)
  if (rows[0] && typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
    return rows
      .filter((item) => item && (item['Nama Lengkap'] || item['Nama'] || item['nama']))
      .map((item, idx) => {
        const id = String(item['ID'] || item['id'] || `peg-${idx + 1}`).trim();
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
        const tmt = String(item['TMT CPNS/PPPK'] || item['TMT'] || item['tmt'] || '2010-01-01');
        const tempatLahir = String(item['Tempat Lahir'] || item['tempatLahir'] || 'Pasuruan');
        const tanggalLahir = String(item['Tanggal Lahir'] || item['tanggalLahir'] || '1985-01-01');
        const kontak = String(item['Kontak / WA'] || item['kontak'] || '-');
        const email = String(item['Email'] || item['email'] || '-');
        const unitKerja = String(item['Unit Kerja'] || item['unitKerja'] || 'SDN Kedungringin 1 Beji');
        const karpeg = String(item['No Karpeg'] || item['karpeg'] || '-');
        const nomorTaspen = String(item['No Taspen'] || item['nomorTaspen'] || '-');
        const npwp = String(item['NPWP'] || item['npwp'] || '-');

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

  // Case B: 2D Array of rows (from Google Visualization / Sheets API v4)
  if (rows.length < 2) return [];
  const dataRows = rows.slice(1);
  return dataRows
    .filter((r) => r && r[2]) // must have nama
    .map((r, idx) => {
      const id = String(r[0] || `peg-${idx + 1}`).trim();
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

export function parseSiswaFromSheetRows(rows: any[]): Siswa[] {
  if (!rows || rows.length === 0) return [];
  const validAgama: Siswa['agama'][] = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

  // Case A: Array of Objects (from Google Apps Script getAllData)
  if (rows[0] && typeof rows[0] === 'object' && !Array.isArray(rows[0])) {
    return rows
      .filter((item) => item && (item['Nama Lengkap Siswa'] || item['Nama Siswa'] || item['Nama'] || item['nama']))
      .map((item, idx) => {
        const id = String(item['ID'] || item['id'] || `sis-${idx + 1}`).trim();
        const nisn = String(item['NISN'] || item['nisn'] || '').trim();
        const nis = String(item['NIS'] || item['nis'] || '').trim();
        const nama = String(item['Nama Lengkap Siswa'] || item['Nama Siswa'] || item['Nama'] || item['nama'] || '').trim();
        const rawJk = String(item['Jenis Kelamin'] || item['JK'] || item['jenisKelamin'] || 'L').toUpperCase();
        const jenisKelamin = rawJk.startsWith('P') ? 'P' : 'L';
        const tempatLahir = String(item['Tempat Lahir'] || item['tempatLahir'] || 'Pasuruan').trim();
        const tanggalLahir = String(item['Tanggal Lahir'] || item['tanggalLahir'] || '2014-01-01').trim();
        const rawAgama = String(item['Agama'] || item['agama'] || 'Islam').trim();
        const agama: Siswa['agama'] = validAgama.includes(rawAgama as any) ? (rawAgama as Siswa['agama']) : 'Islam';
        const kelas = Number(item['Kelas'] || item['kelas']) || 1;
        const rombel = String(item['Rombel'] || item['rombel'] || 'A').trim();
        const namaAyah = String(item['Nama Ayah'] || item['namaAyah'] || '-').trim();
        const namaIbu = String(item['Nama Ibu'] || item['namaIbu'] || '-').trim();
        const alamat = String(item['Alamat Rumah'] || item['Alamat'] || item['alamat'] || 'Kedungringin, Beji').trim();
        const noHpOrtu = String(item['No HP Ortu'] || item['noHpOrtu'] || '-').trim();
        const tmtDiterima = String(item['TMT Diterima'] || item['tmtDiterima'] || '2024-07-15').trim();
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
        fotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
        keterangan: String(r[8] || 'Tercatat di SIM').trim(),
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
  sarpras?: SarprasItem[];
  profil?: ProfilSekolah;
  rawRows?: Record<string, any[][]>;
  timestamp: string;
}> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  if (!cleanId) {
    throw new Error('ID atau link Google Spreadsheet tidak boleh kosong.');
  }

  const sheetNames = ['Data_Pegawai', 'Data_Siswa', 'Sarpras_Aset', 'Profil_Sekolah'];
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

  // 2. Fetch via Google Apps Script (LOCKED_WEB_APP_URL)
  try {
    const url = `${LOCKED_WEB_APP_URL}?action=getAllData`;
    const gasRes = await fetch(url);
    if (gasRes.ok) {
      const data = await gasRes.json();
      if (data && data.profil && Array.isArray(data.profil) && data.profil.length > 0) {
        const rows: any[][] = [];
        for (const item of data.profil) {
          if (Array.isArray(item)) {
            rows.push(item);
          } else if (typeof item === 'object' && item !== null) {
            const vals = Object.values(item);
            if (vals.length >= 2) {
              rows.push([vals[0], vals[1]]);
            } else if (vals.length === 1) {
              const keys = Object.keys(item);
              rows.push([keys[0], vals[0]]);
            }
          }
        }
        if (rows.length > 0) {
          const parsed = parseProfilFromSheetRows(rows, currentProfil);
          if (parsed && parsed.nama) {
            return parsed;
          }
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
 * Dipakai saat aplikasi pertama kali dimuat agar Pengunjung (Guest), Akun Guru, dan Admin
 * langsung mendapatkan data real spreadsheet & pembaruan terakhir dari admin.
 */
export async function fetchAllLiveMasterData(currentProfil?: ProfilSekolah): Promise<{
  pegawai?: Pegawai[];
  siswa?: Siswa[];
  sarpras?: SarprasItem[];
  profil?: ProfilSekolah;
  timestamp: string;
} | null> {
  // 1. Prioritas 1: Google Apps Script Web App (LOCKED_WEB_APP_URL)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);
    const url = `${LOCKED_WEB_APP_URL}?action=getAllData`;
    const gasRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (gasRes.ok) {
      const data = await gasRes.json();
      if (data && typeof data === 'object') {
        const parsedPeg = (data.pegawai && Array.isArray(data.pegawai) && data.pegawai.length > 0)
          ? parsePegawaiFromSheetRows(data.pegawai)
          : undefined;

        const parsedSis = (data.siswa && Array.isArray(data.siswa) && data.siswa.length > 0)
          ? parseSiswaFromSheetRows(data.siswa)
          : undefined;

        const parsedSar = (data.sarpras && Array.isArray(data.sarpras) && data.sarpras.length > 0)
          ? parseSarprasFromSheetRows(data.sarpras)
          : undefined;

        let parsedProf: ProfilSekolah | undefined = undefined;
        if (data.profil && Array.isArray(data.profil) && data.profil.length > 0) {
          const rows: any[][] = [];
          for (const item of data.profil) {
            if (Array.isArray(item)) {
              rows.push(item);
            } else if (typeof item === 'object' && item !== null) {
              const vals = Object.values(item);
              if (vals.length >= 2) rows.push([vals[0], vals[1]]);
              else if (vals.length === 1) {
                const keys = Object.keys(item);
                rows.push([keys[0], vals[0]]);
              }
            }
          }
          if (rows.length > 0) {
            parsedProf = parseProfilFromSheetRows(rows, currentProfil);
          }
        }

        if (parsedPeg || parsedSis || parsedSar || parsedProf) {
          const now = new Date().toLocaleTimeString('id-ID');
          try {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, now);
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC_STATUS, 'SUCCESS');
          } catch {}

          return {
            pegawai: parsedPeg,
            siswa: parsedSis,
            sarpras: parsedSar,
            profil: parsedProf,
            timestamp: now,
          };
        }
      }
    }
  } catch (gasErr) {
    console.warn('Apps Script fetchAllLiveMasterData error:', gasErr);
  }

  // 2. Prioritas 2: Spreadsheet Google Sheets ID (GViz endpoint)
  const savedId = getSavedMasterSheetId();
  if (savedId) {
    try {
      const res = await fetchMasterDatabaseRealtime(savedId, null, currentProfil);
      if (res.pegawai || res.siswa || res.sarpras || res.profil) {
        return res;
      }
    } catch (gvizErr) {
      console.warn('GViz fetchAllLiveMasterData error:', gvizErr);
    }
  }

  return null;
}


