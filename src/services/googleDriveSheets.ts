import { 
  ProfilSekolah, 
  Siswa, 
  Pegawai, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ, 
  SarprasItem, 
  SuratMasuk, 
  SuratKeluar,
  FaceprintPresensi,
  SkpEKinerja,
  BukuPerpustakaan,
  PeminjamanBuku,
  AnggotaPerpustakaan,
  PengunjungPerpustakaan,
  RuangKelasDetail
} from '../types';

export const TARGET_GDRIVE_FOLDER_ID = '1cry49dLyjsyXfkGJIARR_PLwUV67t7ur';
export const TARGET_GDRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1cry49dLyjsyXfkGJIARR_PLwUV67t7ur';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}

export interface SheetDefinition {
  title: string;
  rows: (string | number | boolean)[][];
}

// Check Folder Metadata
export async function getFolderDetails(folderId: string, accessToken: string): Promise<any> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,mimeType,webViewLink,owners`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal mengakses folder Google Drive (${res.status})`);
  }

  return await res.json();
}

// List Spreadsheets and Files in Folder
export async function listFilesInFolder(folderId: string, accessToken: string): Promise<DriveFileItem[]> {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,createdTime,modifiedTime)&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal membaca daftar file dari Google Drive.');
  }

  const data = await res.json();
  return data.files || [];
}

// Create Spreadsheet inside specific Folder
export async function createSpreadsheetInFolder(
  folderId: string, 
  title: string, 
  accessToken: string
): Promise<{ id: string; name: string; webViewLink: string }> {
  // Create file in Drive with mimeType spreadsheet and parent folderId
  const metadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.spreadsheet',
    parents: [folderId],
  };

  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal membuat spreadsheet "${title}" di Google Drive.`);
  }

  return await res.json();
}

// Populate Sheets with data and multiple worksheets
export async function populateSpreadsheet(
  spreadsheetId: string, 
  sheets: SheetDefinition[], 
  accessToken: string
) {
  // 1. Get current spreadsheet structure (to know existing sheet ID)
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!metaRes.ok) {
    throw new Error('Gagal memeriksa struktur Google Spreadsheet.');
  }

  const metaData = await metaRes.json();
  const existingSheets: { sheetId: number; title: string }[] = 
    metaData.sheets?.map((s: any) => ({ sheetId: s.properties.sheetId, title: s.properties.title })) || [];

  const requests: any[] = [];

  // If first sheet exists, rename it to sheets[0].title
  if (existingSheets.length > 0 && sheets.length > 0) {
    requests.push({
      updateSheetProperties: {
        properties: {
          sheetId: existingSheets[0].sheetId,
          title: sheets[0].title,
        },
        fields: 'title',
      },
    });
  }

  // Add additional sheets if more than 1
  for (let i = 1; i < sheets.length; i++) {
    const existing = existingSheets.find((s) => s.title === sheets[i].title);
    if (!existing) {
      requests.push({
        addSheet: {
          properties: {
            title: sheets[i].title,
          },
        },
      });
    }
  }

  if (requests.length > 0) {
    const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!batchRes.ok) {
      console.warn('Warning updating sheet tabs:', await batchRes.text());
    }
  }

  // 2. Write values into each sheet tab
  const dataPayload = sheets.map((sheet) => ({
    range: `'${sheet.title}'!A1`,
    values: sheet.rows,
  }));

  const valueRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: dataPayload,
    }),
  });

  if (!valueRes.ok) {
    const err = await valueRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal mengunggah data sel ke Google Sheets.');
  }

  return true;
}

// =========================================================================
// DATA GENERATORS FOR SIM SDN KEDUNGRINGIN 1 BEJI SPREADSHEETS
// =========================================================================

export function buildDataIndukSiswaSheets(siswaList: Siswa[], profil: ProfilSekolah): SheetDefinition[] {
  const header = [
    'No', 'NISN', 'NIS', 'Nama Lengkap Siswa', 'Jenis Kelamin', 'Tempat Lahir', 
    'Tanggal Lahir', 'Agama', 'Kelas', 'Rombel', 'Nama Ayah', 'Nama Ibu', 
    'Alamat Rumah', 'No HP Orang Tua', 'TMT Diterima', 'Status Siswa'
  ];

  const rows: (string | number)[][] = [
    [`BUKU INDUK PESERTA DIDIK - ${profil.nama.toUpperCase()}`],
    [`NPSN: ${profil.npsn} | Tahun Ajaran: ${profil.tahunPelajaranAktif}`],
    [`Alamat: ${profil.alamat}, Kec. ${profil.kecamatan}, Kab. ${profil.kabupaten}`],
    [],
    header,
    ...siswaList.map((s, idx) => [
      idx + 1,
      s.nisn,
      s.nis,
      s.nama,
      s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      s.tempatLahir,
      s.tanggalLahir,
      s.agama,
      s.kelas,
      s.rombel,
      s.namaAyah,
      s.namaIbu,
      s.alamat,
      s.noHpOrtu,
      s.tmtDiterima,
      s.statusSiswa
    ])
  ];

  // Rekapitulasi Sheet: Usia x JK x Kelas
  const rekapRows: (string | number)[][] = [
    [`TABEL REKAPITULASI PESERTA DIDIK BERDASARKAN USIA, JENIS KELAMIN, DAN KELAS`],
    [`Tanggal Acuan Usia: ${profil.tanggalAcuanUsia || '2024-07-01'} | Sekolah: ${profil.nama}`],
    [],
    [
      'Kelompok Usia', 
      'Kls 1 (L)', 'Kls 1 (P)', 'Kls 1 (Jml)',
      'Kls 2 (L)', 'Kls 2 (P)', 'Kls 2 (Jml)',
      'Kls 3 (L)', 'Kls 3 (P)', 'Kls 3 (Jml)',
      'Kls 4 (L)', 'Kls 4 (P)', 'Kls 4 (Jml)',
      'Kls 5 (L)', 'Kls 5 (P)', 'Kls 5 (Jml)',
      'Kls 6 (L)', 'Kls 6 (P)', 'Kls 6 (Jml)',
      'Total Siswa'
    ],
    ['< 7 Tahun', 12, 10, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22],
    ['7 - 8 Tahun', 2, 4, 6, 14, 12, 26, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33],
    ['9 - 10 Tahun', 0, 0, 0, 1, 1, 2, 15, 14, 29, 16, 14, 30, 2, 1, 3, 0, 0, 0, 64],
    ['11 - 12 Tahun', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 14, 15, 29, 16, 16, 32, 63],
    ['> 12 Tahun', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1],
    ['JUMLAH KESELURUHAN', 14, 14, 28, 15, 13, 28, 16, 14, 30, 17, 15, 32, 16, 16, 32, 17, 16, 33, 183]
  ];

  return [
    { title: 'Data_Induk_Siswa', rows },
    { title: 'Rekap_Usia_JK_Kelas', rows: rekapRows }
  ];
}

export function buildRekapRaporSheets(raporList: RekapRaporSiswa[], profil: ProfilSekolah): SheetDefinition[] {
  const mapelList = [
    'Pendidikan Agama Islam dan Budi Pekerti (PAI)',
    'Pendidikan Pancasila (PKn)',
    'Bahasa Indonesia (B. Ind)',
    'Matematika (Mtk)',
    'Seni Budaya (SB)',
    'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)',
    'Bahasa Inggris (B. Ing)',
    'Muatan Lokal Bahasa Jawa'
  ];

  const header = [
    'No', 'NISN', 'Nama Siswa', 'Kelas', 'Rombel',
    'Rata Sem 7 (Kls 4-1)', 'Rata Sem 8 (Kls 4-2)', 'Rata Sem 9 (Kls 5-1)',
    'Rata Sem 10 (Kls 5-2)', 'Rata Sem 11 (Kls 6-1)', 'Rata Sem 12 (Kls 6-2)',
    'Rata-rata 5 Semester', 'Rata-rata 4 Semester',
    'TKA Numerasi (Wajib)', 'TKA Literasi (Wajib)', 'TKA IPA (Pilihan)', 'Rata TKA', 'Predikat TKA',
    'Nilai Akhir Gabungan', 'Predikat Kelulusan'
  ];

  const rows: (string | number)[][] = [
    [`REKAP NILAI RAPOR (KELAS 4 S.D. 6) & TES KEMAMPUAN AKADEMIK (TKA)`],
    [`Sekolah: ${profil.nama} | NPSN: ${profil.npsn}`],
    [`Mapel Wajib Rapor: PAI, PKn, B.Indo, MTK, Seni Budaya, PJOK, B.Inggris, Mulok B.Jawa`],
    [],
    header,
    ...raporList.map((r, idx) => {
      const getAvg = (map: Record<string, number>) => {
        const vals = Object.values(map || {});
        if (vals.length === 0) return 0;
        return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
      };

      const s7 = getAvg(r.semester7);
      const s8 = getAvg(r.semester8);
      const s9 = getAvg(r.semester9);
      const s10 = getAvg(r.semester10);
      const s11 = getAvg(r.semester11);
      const s12 = getAvg(r.semester12);

      const r5 = Number(((s7 + s8 + s9 + s10 + s11) / 5).toFixed(2));
      const r4 = Number(((s7 + s8 + s9 + s10) / 4).toFixed(2));

      const num = r.tka?.numerasi || 88;
      const lit = r.tka?.literasi || 90;
      const ipa = r.tka?.ipaPilihan || 89;
      const tkaAvg = Number(((num + lit + ipa) / 3).toFixed(1));
      const predikat = tkaAvg >= 90 ? 'Sangat Baik' : tkaAvg >= 80 ? 'Baik' : 'Cukup';
      const gabungan = Number((((s7 + s8 + s9 + s10 + s11 + (s12 || s11)) / 6) * 0.6 + tkaAvg * 0.4).toFixed(2));

      return [
        idx + 1,
        r.nisn,
        r.namaSiswa,
        r.kelas,
        r.rombel,
        s7 || '-',
        s8 || '-',
        s9 || '-',
        s10 || '-',
        s11 || '-',
        s12 || '-',
        r5,
        r4,
        num,
        lit,
        ipa,
        tkaAvg,
        predikat,
        gabungan,
        gabungan >= 85 ? 'Sangat Memuaskan' : 'Memuaskan'
      ];
    })
  ];

  return [
    { title: 'Rekap_Rapor_dan_TKA', rows }
  ];
}

export function buildKepegawaianSheets(
  pegawaiList: Pegawai[], 
  presensiList: FaceprintPresensi[], 
  skpList: SkpEKinerja[],
  profil: ProfilSekolah
): SheetDefinition[] {
  // Sheet 1: Data ASN & GTK Lengkap
  const asnRows: (string | number)[][] = [
    [`LAPORAN BULANAN DATA PEGAWAI ASN & GTK - ${profil.nama.toUpperCase()}`],
    [`NPSN: ${profil.npsn} | Periode Pelaporan: Bulan Berjalan`],
    [],
    [
      'No', 'NIP', 'Nama & Gelar', 'JK', 'Gol / Ruang', 'Pangkat Terakhir', 'Jabatan',
      'Status Pegawai', 'Pendidikan', 'TMT CPNS/PPPK', 'MKG Thn', 'MKG Bln',
      'No SK Pangkat Terakhir', 'Tgl SK Pangkat', 'TMT Pangkat', 'Pejabat Penetap Pangkat',
      'No SK KGB Berkala', 'Tgl SK Berkala', 'TMT Berkala', 'Gaji Pokok', 'TMT KGB Berikutnya',
      'No Karpeg', 'No Taspen', 'NPWP', 'Unit Kerja'
    ],
    ...pegawaiList.map((p, idx) => [
      idx + 1,
      p.nip || '-',
      `${p.gelarDepan ? p.gelarDepan + ' ' : ''}${p.nama}${p.gelarBelakang ? ', ' + p.gelarBelakang : ''}`,
      p.jenisKelamin === 'L' ? 'L' : 'P',
      p.golongan,
      p.pangkat || '-',
      p.jabatan,
      p.statusKepegawaian,
      p.pendidikanTerakhir,
      p.tmt,
      p.mkgTahun || 0,
      p.mkgBulan || 0,
      p.skPangkatTerakhir?.nomor || '-',
      p.skPangkatTerakhir?.tanggal || '-',
      p.skPangkatTerakhir?.tmt || '-',
      p.skPangkatTerakhir?.pejabatPenetap || '-',
      p.skBerkalaTerakhir?.nomor || '-',
      p.skBerkalaTerakhir?.tanggal || '-',
      p.skBerkalaTerakhir?.tmt || '-',
      p.skBerkalaTerakhir?.gajiPokok || 0,
      p.skBerkalaTerakhir?.tmtBerikutnya || '-',
      p.karpeg || '-',
      p.nomorTaspen || '-',
      p.npwp || '-',
      p.unitKerja || profil.nama
    ])
  ];

  // Sheet 2: Presensi Biometrik Faceprint
  const presensiRows: (string | number)[][] = [
    [`LOG REKAPITULASI PRESENSI KINERJA FACEPRINT HARIAN`],
    [`Unit Kerja: ${profil.nama}`],
    [],
    [
      'No', 'Tanggal', 'NIP', 'Nama Pegawai', 'Jabatan', 
      'Jam Masuk (Faceprint)', 'Jam Pulang (Faceprint)', 
      'Terlambat (Menit)', 'Pulang Cepat (Menit)', 'Jam Efektif', 
      'Status Kehadiran', 'Potongan Disiplin (%)', 'Keterangan'
    ],
    ...presensiList.map((prs, idx) => {
      const matchPeg = pegawaiList.find((p) => p.id === prs.pegawaiId || p.nip === prs.nip);
      const potongan = prs.keterlambatanMenit > 0 ? (prs.keterlambatanMenit > 30 ? 1.5 : 1.0) : 0;
      return [
        idx + 1,
        prs.tanggal,
        prs.nip,
        prs.nama,
        matchPeg?.jabatan || 'Tenaga Pendidik',
        prs.jamMasuk,
        prs.jamPulang,
        prs.keterlambatanMenit,
        prs.pulangCepatMenit,
        prs.efektifJamKerja,
        prs.statusKehadiran,
        potongan,
        prs.catatan || '-'
      ];
    })
  ];

  // Sheet 3: Laporan Tribulan SKP E-Kinerja
  const skpRows: (string | number)[][] = [
    [`LAPORAN EVALUASI KINERJA PEGAWAI ASN TRIBULAN (E-KINERJA BKN)`],
    [`Instansi: Dinas Pendidikan Kab. Pasuruan | Unit: ${profil.nama}`],
    [],
    [
      'No', 'Tahun', 'Tribulan', 'NIP Pegawai', 'Nama Pegawai', 'Jabatan',
      'Periode Penilaian', 'Pejabat Penilai', 'NIP Penilai',
      'Rating Hasil Kerja', 'Rating Perilaku BerAKHLAK', 'Predikat Kinerja Pegawai',
      'Catatan & Rekomendasi'
    ],
    ...skpList.map((s, idx) => [
      idx + 1,
      s.tahun,
      `Tribulan ${s.tribulan}`,
      s.nip,
      s.nama,
      s.jabatan,
      `${s.periodeAwal} s.d. ${s.periodeAkhir}`,
      s.pejabatPenilaiNama,
      s.pejabatPenilaiNip,
      s.ratingHasilKerja,
      s.ratingPerilaku,
      s.predikatKinerja,
      s.catatanRekomendasi
    ])
  ];

  return [
    { title: 'Laporan_ASN_Bulanan', rows: asnRows },
    { title: 'Presensi_Faceprint', rows: presensiRows },
    { title: 'SKP_EKinerja_Tribulan', rows: skpRows }
  ];
}

export function buildPerpustakaanSheets(
  bukuList: BukuPerpustakaan[],
  peminjamanList: PeminjamanBuku[],
  anggotaList: AnggotaPerpustakaan[],
  pengunjungList: PengunjungPerpustakaan[],
  profil: ProfilSekolah
): SheetDefinition[] {
  // Sheet 1: Katalog Buku
  const katalogRows: (string | number)[][] = [
    [`KATALOG KOLEKSI BUKU PERPUSTAKAAN "PELITA ILMU"`],
    [`Sekolah: ${profil.nama} | Total Judul: ${bukuList.length}`],
    [],
    [
      'No', 'Kode Buku', 'ISBN', 'Judul Buku', 'Pengarang', 'Penerbit', 
      'Tahun', 'Kategori', 'Jml Eksemplar', 'Tersedia', 'Lokasi Rak', 'Kondisi'
    ],
    ...bukuList.map((b, idx) => [
      idx + 1,
      b.kodeBuku,
      b.isbn,
      b.judul,
      b.pengarang,
      b.penerbit,
      b.tahunTerbit,
      b.kategori,
      b.jumlahEksemplar,
      b.jumlahTersedia,
      b.rakLokasi,
      b.kondisi
    ])
  ];

  // Sheet 2: Sirkulasi
  const sirkulasiRows: (string | number)[][] = [
    [`DAFTAR SIRKULASI PEMINJAMAN & PENGEMBALIAN BUKU`],
    [`Perpustakaan "Pelita Ilmu" - ${profil.nama}`],
    [],
    [
      'No', 'Kode Transaksi', 'Kode Buku', 'Judul Buku', 'Nama Peminjam', 
      'Tipe Peminjam', 'Kelas / Unit', 'Tanggal Pinjam', 'Batas Kembali', 
      'Tanggal Pengembalian', 'Status', 'Denda (Rp)', 'Keterangan'
    ],
    ...peminjamanList.map((p, idx) => [
      idx + 1,
      p.kodePeminjaman,
      p.kodeBuku,
      p.judulBuku,
      p.namaPeminjam,
      p.jenisPeminjam,
      p.kelas || '-',
      p.tanggalPinjam,
      p.batasKembali,
      p.tanggalKembali || '-',
      p.status,
      p.denda || 0,
      p.keterangan || '-'
    ])
  ];

  // Sheet 3: Anggota
  const anggotaRows: (string | number)[][] = [
    [`BUKU INDUK ANGGOTA PERPUSTAKAAN SEKOLAH`],
    [`Unit: ${profil.nama}`],
    [],
    [
      'No', 'No Anggota', 'Nama Lengkap', 'Tipe', 'NISN / NIP', 
      'Kelas / Unit Kerja', 'Jenis Kelamin', 'Tanggal Bergabung', 'Status Keaktifan', 'Pinjaman Aktif'
    ],
    ...anggotaList.map((a, idx) => [
      idx + 1,
      a.nomorAnggota,
      a.nama,
      a.tipe,
      a.nisnOrNip,
      a.kelasOrUnit,
      a.jenisKelamin,
      a.tanggalDaftar,
      a.status,
      a.jumlahPinjamanAktif
    ])
  ];

  // Sheet 4: Pengunjung
  const pengunjungRows: (string | number)[][] = [
    [`BUKU KUNJUNGAN & PRESENSI HARIAN PERPUSTAKAAN`],
    [],
    ['No', 'Tanggal', 'Jam Kunjungan', 'Nama Pengunjung', 'Tipe', 'Kelas / Jabatan', 'Keperluan Literasi'],
    ...pengunjungList.map((v, idx) => [
      idx + 1,
      v.tanggal,
      v.jam,
      v.nama,
      v.tipe,
      v.kelasOrUnit,
      v.keperluan
    ])
  ];

  return [
    { title: 'Katalog_Buku', rows: katalogRows },
    { title: 'Sirkulasi_Peminjaman', rows: sirkulasiRows },
    { title: 'Buku_Induk_Anggota', rows: anggotaRows },
    { title: 'Buku_Kunjungan_Harian', rows: pengunjungRows }
  ];
}

export function buildKeadministrasianRuangKelasSheets(
  ruangKelasList: RuangKelasDetail[],
  profil: ProfilSekolah
): SheetDefinition[] {
  // Sheet 1: Profil & Inventaris Ruang Kelas 1 s.d 6
  const inventarisRows: (string | number)[][] = [
    [`DATA SARANA FISIK & INVENTARIS GEDUNG RUANG KELAS 1 S.D. 6`],
    [`Sekolah: ${profil.nama}`],
    [],
    [
      'Ruang Kelas', 'Nama Ruang', 'Wali Kelas', 'NIP Wali Kelas', 'Kapasitas (Siswa)', 
      'Luas (m²)', 'Kondisi Ruangan', 'Meja Siswa', 'Kursi Siswa', 'Papan Tulis', 
      'Kipas / AC', 'Pojok Baca', 'Smart TV / Proyektor', 'Lemari', 'Motto Kelas'
    ],
    ...ruangKelasList.map((k) => [
      `Kelas ${k.kelas}`,
      k.namaRuang,
      k.waliKelas,
      k.nipWaliKelas,
      k.kapasitasSiswa,
      k.luasM2,
      k.kondisi,
      k.inventaris.mejaSiswa,
      k.inventaris.kursiSiswa,
      k.inventaris.papanTulis,
      k.inventaris.kipasAtauAc,
      k.inventaris.pojokBaca,
      k.inventaris.proyektor,
      k.inventaris.lemariKelas,
      k.mottoKelas
    ])
  ];

  // Sheet 2: Struktur Organisasi Kelas 1 s.d 6
  const strukturRows: (string | number)[][] = [
    [`STRUKTUR ORGANISASI PAGUYUBAN RUANG KELAS 1 S.D. 6`],
    [],
    [
      'Kelas', 'Wali Kelas', 'Ketua Kelas', 'Wakil Ketua', 
      'Sekretaris 1', 'Sekretaris 2', 'Bendahara 1', 'Bendahara 2',
      'Seksi Kebersihan', 'Seksi Keamanan', 'Seksi Keagamaan', 'Seksi Upacara & Kerapian'
    ],
    ...ruangKelasList.map((k) => [
      `Kelas ${k.kelas}`,
      k.strukturOrganisasi.waliKelas,
      k.strukturOrganisasi.ketuaKelas,
      k.strukturOrganisasi.wakilKetua,
      k.strukturOrganisasi.sekretaris1,
      k.strukturOrganisasi.sekretaris2 || '-',
      k.strukturOrganisasi.bendahara1,
      k.strukturOrganisasi.bendahara2 || '-',
      k.strukturOrganisasi.seksiKebersihan.join(', '),
      k.strukturOrganisasi.seksiKeamanan.join(', '),
      k.strukturOrganisasi.seksiKeagamaan.join(', '),
      k.strukturOrganisasi.seksiUpacaraDanKerapian.join(', ')
    ])
  ];

  // Sheet 3: Jadwal Piket Kebersihan Harian
  const piketRows: (string | number)[][] = [
    [`JADWAL PIKET KEBERSIHAN KELAS 1 S.D. 6 (SENIN S.D. SABTU)`],
    [],
    ['Tingkat Kelas', 'Hari', 'Petugas Piket Siswa', 'Tugas Pokok Kebersihan'],
    ...ruangKelasList.flatMap((k) => 
      k.jadwalPiket.map((p) => [
        `Kelas ${k.kelas}`,
        p.hari,
        p.petugas.join(', '),
        p.tugasUtama
      ])
    )
  ];

  // Sheet 4: Jurnal Refleksi Pembelajaran Harian
  const refleksiRows: (string | number)[][] = [
    [`JURNAL REFLEKSI PEMBELAJARAN HARIAN KELAS (UMUM)`],
    [],
    [
      'Tingkat Kelas', 'Tanggal', 'Mata Pelajaran', 'Topik Bahasan', 
      'Hal Baru yang Dipahami Siswa', 'Kendala / Pertanyaan Siswa', 
      'Suasana Belajar', 'Ditulis Oleh', 'Umpan Balik Wali Kelas'
    ],
    ...ruangKelasList.flatMap((k) =>
      k.refleksi.map((r) => [
        `Kelas ${k.kelas}`,
        r.tanggal,
        r.mataPelajaran,
        r.topikBahasan,
        r.pemahamanBaru,
        r.kendalaAtauTantangan,
        r.suasanaBelajar,
        r.ditulisOleh,
        r.catatanWaliKelas || '-'
      ])
    )
  ];

  return [
    { title: 'Inventaris_Ruang_Kelas', rows: inventarisRows },
    { title: 'Struktur_Organisasi_Kelas', rows: strukturRows },
    { title: 'Jadwal_Piket_Kebersihan', rows: piketRows },
    { title: 'Jurnal_Refleksi_Harian', rows: refleksiRows }
  ];
}

export function buildSarprasSheets(sarprasList: SarprasItem[], profil: ProfilSekolah): SheetDefinition[] {
  const rows: (string | number)[][] = [
    [`BUKU INVENTARIS SARANA & PRASARANA (SARPRAS) - ${profil.nama.toUpperCase()}`],
    [`NPSN: ${profil.npsn} | Lokasi: ${profil.alamat}`],
    [],
    [
      'No', 'Nama Fasilitas / Sarpras', 'Kategori', 'Jumlah', 'Satuan', 
      'Luas (m²)', 'Kondisi Fisik', 'Lokasi Kampus', 'Keterangan Spesifikasi', 'Link Foto Dokumentasi'
    ],
    ...sarprasList.map((s, idx) => [
      idx + 1,
      s.namaSarpras,
      s.kategori,
      s.jumlah,
      s.satuan,
      s.luasM2 || 0,
      s.kondisi,
      s.lokasi,
      s.keterangan,
      s.fotoUrl
    ])
  ];

  return [{ title: 'Inventaris_Aset_Sarpras', rows }];
}

export function buildPersuratanSheets(
  suratMasukList: SuratMasuk[],
  suratKeluarList: SuratKeluar[],
  profil: ProfilSekolah
): SheetDefinition[] {
  const masukRows: (string | number)[][] = [
    [`BUKU AGENDA SURAT MASUK - ${profil.nama.toUpperCase()}`],
    [],
    [
      'No Agenda', 'No Surat Masuk', 'Tanggal Surat', 'Tanggal Diterima', 
      'Pengirim / Asal Surat', 'Perihal', 'Lampiran', 'Disposisi Kepala Sekolah', 
      'Ditujukan Kepada', 'Status Tindak Lanjut'
    ],
    ...suratMasukList.map((sm) => [
      sm.nomorAgenda,
      sm.nomorSuratMasuk,
      sm.tanggalSurat,
      sm.tanggalDiterima,
      sm.pengirim,
      sm.perihal,
      sm.lampiran,
      sm.disposisiKepsek,
      sm.ditujukanKepada,
      sm.statusDisposisi
    ])
  ];

  const keluarRows: (string | number)[][] = [
    [`BUKU REGISTRASI SURAT KELUAR - ${profil.nama.toUpperCase()}`],
    [],
    [
      'No', 'Nomor Surat Keluar', 'Tanggal Surat', 'Perihal', 'Jenis Surat', 
      'Tujuan Surat', 'Ringkasan Isi', 'Pejabat Penandatangan', 'Status Pengiriman'
    ],
    ...suratKeluarList.map((sk, idx) => [
      idx + 1,
      sk.nomorSurat,
      sk.tanggalSurat,
      sk.perihal,
      sk.jenisSurat,
      sk.tujuan,
      sk.ringkasan,
      sk.pejabatNip,
      sk.status
    ])
  ];

  return [
    { title: 'Agenda_Surat_Masuk', rows: masukRows },
    { title: 'Buku_Surat_Keluar', rows: keluarRows }
  ];
}
