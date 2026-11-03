import { Pegawai, ProfilSekolah, Siswa, SarprasItem } from '../types';

export interface AsnReportRow {
  no: number;
  id: string;
  nama: string;
  nip: string;
  tempatLahir: string;
  tanggalLahir: string;
  ttlFormatted: string;
  pangkatGolongan: string;
  jenisKelamin: 'L' | 'P';
  ijazahTertinggi: string; // e.g. "S.2 2023"
  jabatan: string; // e.g. "Kepala Sekolah", "Guru Kelas VI", "P2SD"
  statusKepegawaian: 'PNSD' | 'PPPK';
  tanggalMulaiDiangkat: string; // e.g. "01/01/2005"
  tanggalMulaiDiSdIni: string; // e.g. "01/09/2025"
  skTerakhirTanggal: string; // e.g. "22-03-2005"
  skTerakhirNomor: string; // e.g. "813.2/118/424.081/2005"
  mkgTeks: string; // e.g. "20 THN 00 BLN"
  ketidakhadiran: {
    s: number; // Sakit
    i: number; // Ijin
    a: number; // Alpha
    ch: number; // Cuti Hamil
    ct: number; // Cuti Tahunan
    cb: number; // Cuti Bersalin/Besar
    dl: number; // Dinas Diluar
    dik: number; // Pendidikan
  };
  catatan: string;
}

// 8 Pegawai ASN SDN Kedungringin 1 Beji sesuai dokumen dinas resmi
export const OFFICIAL_ASN_PEGAWAI_LIST: AsnReportRow[] = [
  {
    no: 1,
    id: 'peg-1',
    nama: 'FUAD FAHRUDIN, M.Pd',
    nip: '198006182005011010',
    tempatLahir: 'Bojonegoro',
    tanggalLahir: '18 Juni 1980',
    ttlFormatted: 'Bojonegoro, 18 Juni 1980',
    pangkatGolongan: 'Penata Tk. I',
    jenisKelamin: 'L',
    ijazahTertinggi: 'S.2\n2023',
    jabatan: 'Kepala Sekolah',
    statusKepegawaian: 'PNSD',
    tanggalMulaiDiangkat: '01/01/2005',
    tanggalMulaiDiSdIni: '01/09/2025',
    skTerakhirTanggal: '22-03-2005',
    skTerakhirNomor: '813.2/118/424.081/2005',
    mkgTeks: '20 THN\n00 BLN',
    ketidakhadiran: { s: 0, i: 0, a: 0, ch: 0, ct: 0, cb: 0, dl: 0, dik: 0 },
    catatan: '-',
  },
  {
    no: 2,
    id: 'peg-3',
    nama: 'PUDJIATI, S.Pd',
    nip: '196901032007012000',
    tempatLahir: 'Ngawi',
    tanggalLahir: '03 Januari 1969',
    ttlFormatted: 'Ngawi, 03 Januari 1969',
    pangkatGolongan: 'Penata Tk. I',
    jenisKelamin: 'P',
    ijazahTertinggi: 'S.1\n2008',
    jabatan: 'Guru Kelas VI',
    statusKepegawaian: 'PNSD',
    tanggalMulaiDiangkat: '25/01/2008',
    tanggalMulaiDiSdIni: '01/10/2003',
    skTerakhirTanggal: '24-04-2024',
    skTerakhirNomor: '800.1.11.13/3.2331/424.103/2024',
    mkgTeks: '17 THN\n05 BLN',
    ketidakhadiran: { s: 0, i: 0, a: 0, ch: 0, ct: 0, cb: 0, dl: 0, dik: 0 },
    catatan: '-',
  },
  {
    no: 3,
    id: 'peg-5',
    nama: 'ISFAUL MUKARROMAH, S.Pd',
    nip: '198009062008012000',
    tempatLahir: 'Sidoarjo',
    tanggalLahir: '06 September 1980',
    ttlFormatted: 'Sidoarjo, 06 September 1980',
    pangkatGolongan: 'Penata Muda Tk.I',
    jenisKelamin: 'P',
    ijazahTertinggi: 'S.1\n2016',
    jabatan: 'Guru Kelas IV',
    statusKepegawaian: 'PNSD',
    tanggalMulaiDiangkat: '21/08/2009',
    tanggalMulaiDiSdIni: '01/04/1999',
    skTerakhirTanggal: '17-03-2026',
    skTerakhirNomor: '800.1.3.2/3.205.204/20026',
    mkgTeks: '16 THN\n00 BLN',
    ketidakhadiran: { s: 0, i: 0, a: 0, ch: 0, ct: 0, cb: 0, dl: 0, dik: 0 },
    catatan: '-',
  },
  {
    no: 4,
    id: 'peg-11',
    nama: 'MALIK',
    nip: '197908242009031000',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '24 Agustus 1979',
    ttlFormatted: 'Pasuruan, 24 Agustus 1979',
    pangkatGolongan: 'Pengatur',
    jenisKelamin: 'L',
    ijazahTertinggi: 'SMA\n2009',
    jabatan: 'P2SD',
    statusKepegawaian: 'PNSD',
    tanggalMulaiDiangkat: '24/04/2009',
    tanggalMulaiDiSdIni: '01/10/1997',
    skTerakhirTanggal: '17-06-2026',
    skTerakhirNomor: '800.1.3.2/2.404/204/2026',
    mkgTeks: '16 THN\n00 BLN',
    ketidakhadiran: { s: 0, i: 0, a: 0, ch: 0, ct: 0, cb: 0, dl: 0, dik: 0 },
    catatan: '-',
  },
  {
    no: 5,
    id: 'peg-2',
    nama: 'WAHYU TRI LAKSONO, S.PdI',
    nip: '198606282023211010',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '28 Juni 1986',
    ttlFormatted: 'Pasuruan, 28 Juni 1986',
    pangkatGolongan: 'Guru Ahli Pertama/IX',
    jenisKelamin: 'L',
    ijazahTertinggi: 'S.1\n2009',
    jabatan: 'Guru Mapel PAI',
    statusKepegawaian: 'PPPK',
    tanggalMulaiDiangkat: '07/06/2023',
    tanggalMulaiDiSdIni: '01/10/2007',
    skTerakhirTanggal: '15/04/2025',
    skTerakhirNomor: '800.1.11.13.PPPK/IX.616/424.103/2025',
    mkgTeks: '02 THN\n00 BLN',
    ketidakhadiran: { s: 0, i: 0, a: 0, ch: 0, ct: 0, cb: 0, dl: 0, dik: 0 },
    catatan: '-',
  },
  {
    no: 6,
    id: 'peg-6',
    nama: 'ARIF DIANTORO, S.Pd',
    nip: '198302102024211017',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '10 Februari 1983',
    ttlFormatted: 'Pasuruan, 10 Februari 1983',
    pangkatGolongan: 'Guru Ahli Pertama/IX',
    jenisKelamin: 'L',
    ijazahTertinggi: 'S.1\n2016',
    jabatan: 'Guru Kelas III',
    statusKepegawaian: 'PPPK',
    tanggalMulaiDiangkat: '01/07/2014',
    tanggalMulaiDiSdIni: '01/08/2014',
    skTerakhirTanggal: '03/02/2026',
    skTerakhirNomor: '800.1.11.13.PPPK/IX.2036/204/2026',
    mkgTeks: '02 THN\n00 BLN',
    ketidakhadiran: { s: 0, i: 0, a: 0, ch: 0, ct: 0, cb: 0, dl: 0, dik: 0 },
    catatan: '-',
  },
  {
    no: 7,
    id: 'peg-7',
    nama: "MOCHAMAD SYAFI'I, S.Pd",
    nip: '199504142024211023',
    tempatLahir: 'Tuban',
    tanggalLahir: '14 April 1995',
    ttlFormatted: 'Tuban, 14 April 1995',
    pangkatGolongan: 'Guru Ahli Pertama/IX',
    jenisKelamin: 'L',
    ijazahTertinggi: 'S.1\n2019',
    jabatan: 'Guru Kelas PJOK',
    statusKepegawaian: 'PPPK',
    tanggalMulaiDiangkat: '01/09/2021',
    tanggalMulaiDiSdIni: '01/09/2021',
    skTerakhirTanggal: '03/02/2026',
    skTerakhirNomor: '800.1.11.13.PPPK/IX.2041/204/2026',
    mkgTeks: '02 THN\n00 BLN',
    ketidakhadiran: { s: 0, i: 0, a: 0, ch: 0, ct: 0, cb: 0, dl: 0, dik: 0 },
    catatan: '-',
  },
  {
    no: 8,
    id: 'peg-4',
    nama: 'GADIS YUNITA BERLIANA, S.Pd',
    nip: '200006092024212000',
    tempatLahir: 'Banyuwangi',
    tanggalLahir: '09 Juni 2000',
    ttlFormatted: 'Banyuwangi, 09 Juni 2000',
    pangkatGolongan: 'Guru Ahli Pertama/IX',
    jenisKelamin: 'P',
    ijazahTertinggi: 'S 1\n2022',
    jabatan: 'Guru Kelas V',
    statusKepegawaian: 'PPPK',
    tanggalMulaiDiangkat: '01/07/2024',
    tanggalMulaiDiSdIni: '01/07/2024',
    skTerakhirTanggal: '03/02/2026',
    skTerakhirNomor: '800.1.11.13.PPPK/IX.2044/204/2026',
    mkgTeks: '02 THN\n00 BLN',
    ketidakhadiran: { s: 0, i: 0, a: 0, ch: 0, ct: 0, cb: 0, dl: 0, dik: 0 },
    catatan: '-',
  },
];

// Helper to get matching ASN list from live database or fallback to official document rows
export function getMergedAsnReportList(livePegawaiList: Pegawai[]): AsnReportRow[] {
  if (!livePegawaiList || livePegawaiList.length === 0) {
    return OFFICIAL_ASN_PEGAWAI_LIST;
  }

  // Sort list: Kepala Sekolah first, then teachers, then staff
  const sorted = [...livePegawaiList].sort((a, b) => {
    const aIsKepsek = (a.jabatan || '').toLowerCase().includes('kepala sekolah');
    const bIsKepsek = (b.jabatan || '').toLowerCase().includes('kepala sekolah');
    if (aIsKepsek && !bIsKepsek) return -1;
    if (!aIsKepsek && bIsKepsek) return 1;
    return 0;
  });

  return sorted.map((live, idx) => {
    // Check if matching official row exists for fallback details
    const cleanLiveNip = (live.nip || '').replace(/\D/g, '');
    const official = OFFICIAL_ASN_PEGAWAI_LIST.find((o) => {
      const cleanOfficialNip = o.nip.replace(/\D/g, '');
      return (cleanLiveNip && cleanOfficialNip && (cleanLiveNip.includes(cleanOfficialNip) || cleanOfficialNip.includes(cleanLiveNip))) ||
        live.nama.toLowerCase().includes(o.nama.split(',')[0].toLowerCase().trim());
    });

    const deg = live.ijazahTertinggiSingkat || (live.pendidikanTerakhir?.startsWith('S2') ? 'S.2' : live.pendidikanTerakhir?.startsWith('S1') ? 'S.1' : (live.pendidikanTerakhir || 'S.1'));
    const yr = live.ijazahTahun || official?.ijazahTertinggi.split('\n')[1] || '2023';

    // Format TTL
    const tempatLahir = live.tempatLahir || official?.tempatLahir || 'Pasuruan';
    const tglLahir = live.tanggalLahir || official?.tanggalLahir || '1985-01-01';
    let ttlFormatted = official?.ttlFormatted || `${tempatLahir}, ${tglLahir}`;
    try {
      if (tglLahir.includes('-')) {
        const parts = tglLahir.split('-');
        if (parts.length === 3) {
          const blnNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          const mIdx = parseInt(parts[1], 10) - 1;
          const bln = blnNames[mIdx] || parts[1];
          ttlFormatted = `${tempatLahir}, ${parts[2]} ${bln} ${parts[0]}`;
        }
      }
    } catch {}

    const tanggalMulaiDiangkat = live.tanggalMulaiDiangkat || official?.tanggalMulaiDiangkat || (live.skAngkatan?.tmt ? live.skAngkatan.tmt.split('-').reverse().join('/') : (live.tmt ? live.tmt.split('-').reverse().join('/') : '01/01/2010'));
    const tanggalMulaiDiSdIni = live.tanggalMulaiDiSdIni || official?.tanggalMulaiDiSdIni || (live.tmt ? live.tmt.split('-').reverse().join('/') : '01/01/2020');
    const skTerakhirTanggal = live.skTerakhirTanggal || official?.skTerakhirTanggal || (live.skPangkatTerakhir?.tanggal ? live.skPangkatTerakhir.tanggal.split('-').reverse().join('-') : '-');
    const skTerakhirNomor = live.skTerakhirNomor || official?.skTerakhirNomor || live.skPangkatTerakhir?.nomor || '-';

    const mkgTeks = live.mkgTeks || official?.mkgTeks || (live.mkgTahun !== undefined ? `${String(live.mkgTahun).padStart(2, '0')} THN\n${String(live.mkgBulan || 0).padStart(2, '0')} BLN` : (official?.mkgTeks || '-'));

    const statusKepegawaian: 'PNSD' | 'PPPK' = (live.statusKepegawaian === 'PPPK') ? 'PPPK' : 'PNSD';

    const pangkatGolongan = live.pangkat 
      ? `${live.pangkat}${live.golongan ? ' (' + live.golongan + ')' : ''}`
      : (live.golongan || official?.pangkatGolongan || 'Penata Muda');

    const fullNama = `${live.nama.toUpperCase()}${live.gelarBelakang ? ', ' + live.gelarBelakang : ''}`;

    return {
      no: idx + 1,
      id: live.id || `peg-${idx + 1}`,
      nama: fullNama,
      nip: (live.nip || official?.nip || '-').replace(/\s+/g, ''),
      tempatLahir,
      tanggalLahir: tglLahir,
      ttlFormatted,
      pangkatGolongan,
      jenisKelamin: (live.jenisKelamin === 'P' ? 'P' : 'L'),
      ijazahTertinggi: `${deg}\n${yr}`,
      jabatan: live.jabatan || official?.jabatan || 'Guru',
      statusKepegawaian,
      tanggalMulaiDiangkat,
      tanggalMulaiDiSdIni,
      skTerakhirTanggal,
      skTerakhirNomor,
      mkgTeks,
      ketidakhadiran: {
        s: live.ketidakhadiran?.sakit ?? (official?.ketidakhadiran.s || 0),
        i: live.ketidakhadiran?.ijin ?? (official?.ketidakhadiran.i || 0),
        a: live.ketidakhadiran?.alpha ?? (official?.ketidakhadiran.a || 0),
        ch: live.ketidakhadiran?.cutiHamil ?? (official?.ketidakhadiran.ch || 0),
        ct: live.ketidakhadiran?.cutiTahunan ?? (official?.ketidakhadiran.ct || 0),
        cb: live.ketidakhadiran?.cutiBesar ?? (official?.ketidakhadiran.cb || 0),
        dl: live.ketidakhadiran?.dinasLuar ?? (official?.ketidakhadiran.dl || 0),
        dik: live.ketidakhadiran?.pendidikan ?? (official?.ketidakhadiran.dik || 0),
      },
      catatan: live.catatanLaporan || official?.catatan || '-',
    };
  });
}

// Rekap Keadaan Siswa Resmi Daftar Lapor Bulan Oktober 2026
export interface DataSiswaRekapKelas {
  kelas: number;
  label: string;
  l: number;
  p: number;
  total: number;
}

export interface DataSiswaLaporBulanSummary {
  tahunPelajaran: string;
  bulanLabel: string;
  perKelas: DataSiswaRekapKelas[];
  totalL: number;
  totalP: number;
  totalSemua: number;
  agamaIslam: { l: number; p: number; total: number };
  agamaKristenProtestan: { l: number; p: number; total: number };
  agamaKristenKatolik: { l: number; p: number; total: number };
  ruangan: {
    ruangKelas: { jumlah: number; milik: number; sewa: number; pinjam: number };
    ruangKantor: { jumlah: number; milik: number; sewa: number; pinjam: number };
    kmWc: { jumlah: number; milik: number; sewa: number; pinjam: number };
    ruangLain: { jumlah: number; milik: number; sewa: number; pinjam: number };
  };
  rombonganBelajar: { kelas: string; ruang: number; rombel: number }[];
  ptk: {
    kepalaSekolah: number;
    guruKelas: number;
    guruPenjaskor: number;
    guruPai: number;
    guruBtq: number;
    administrasiUmum: number;
    guruMapelLain: number;
    total: number;
  };
  statusGuruKepsek: {
    pns: number;
    pppk: number;
    pppkPw: number;
    total: number;
  };
  penjagaSd: {
    pns: number;
    pppk: number;
    sukwan: number;
  };
  hariSekolahEfektif: number;
  absensi: { sakit: string; izin: string; alpha: string; total: string };
  saranaList: { nama: string; jumlah: number | string }[];
}

export const OFFICIAL_DATA_SISWA_LAPOR_BULAN: DataSiswaLaporBulanSummary = {
  tahunPelajaran: '2026/2027',
  bulanLabel: 'OKTOBER 2026',
  perKelas: [
    { kelas: 1, label: 'Kelas I', l: 14, p: 6, total: 20 },
    { kelas: 2, label: 'Kelas II', l: 10, p: 11, total: 21 },
    { kelas: 3, label: 'Kelas III', l: 10, p: 7, total: 17 },
    { kelas: 4, label: 'Kelas IV', l: 17, p: 10, total: 27 },
    { kelas: 5, label: 'Kelas V', l: 9, p: 8, total: 17 },
    { kelas: 6, label: 'Kelas VI', l: 5, p: 12, total: 17 },
  ],
  totalL: 65,
  totalP: 54,
  totalSemua: 119,
  agamaIslam: { l: 65, p: 54, total: 119 },
  agamaKristenProtestan: { l: 0, p: 0, total: 0 },
  agamaKristenKatolik: { l: 0, p: 0, total: 0 },
  ruangan: {
    ruangKelas: { jumlah: 6, milik: 6, sewa: 0, pinjam: 0 },
    ruangKantor: { jumlah: 1, milik: 1, sewa: 0, pinjam: 0 },
    kmWc: { jumlah: 5, milik: 5, sewa: 0, pinjam: 0 },
    ruangLain: { jumlah: 3, milik: 3, sewa: 0, pinjam: 0 },
  },
  rombonganBelajar: [
    { kelas: 'Kelas I', ruang: 1, rombel: 1 },
    { kelas: 'Kelas II', ruang: 1, rombel: 1 },
    { kelas: 'Kelas III', ruang: 1, rombel: 1 },
    { kelas: 'Kelas IV', ruang: 1, rombel: 1 },
    { kelas: 'Kelas V', ruang: 1, rombel: 1 },
    { kelas: 'Kelas VI', ruang: 1, rombel: 1 },
  ],
  ptk: {
    kepalaSekolah: 1,
    guruKelas: 4,
    guruPenjaskor: 1,
    guruPai: 1,
    guruBtq: 0,
    administrasiUmum: 0,
    guruMapelLain: 0,
    total: 6,
  },
  statusGuruKepsek: {
    pns: 2,
    pppk: 4,
    pppkPw: 0,
    total: 6,
  },
  penjagaSd: {
    pns: 1,
    pppk: 0,
    sukwan: 0,
  },
  hariSekolahEfektif: 24,
  absensi: {
    sakit: '-',
    izin: '-',
    alpha: '-',
    total: '-',
  },
  saranaList: [
    { nama: 'Kursi untuk 1 peserta didik', jumlah: 160 },
    { nama: 'Bangku untuk 2 peserta didik', jumlah: 80 },
    { nama: 'Rak/Lemari Kantor', jumlah: 12 },
    { nama: 'Kursi, Meja Guru Kelas', jumlah: 8 },
    { nama: 'Rak/Lemari Buku Kelas + Kantor', jumlah: 8 },
    { nama: 'Papan Tulis Kelas', jumlah: 8 },
    { nama: 'Rak/Lemari Perpustakaan', jumlah: 12 },
    { nama: 'Kursi tamu', jumlah: 1 },
    { nama: 'Peralatan Dapur, Rak Piring', jumlah: 1 },
    { nama: 'Peta Indonesia & Dunia', jumlah: 1 },
    { nama: 'Kipas Angin Kelas', jumlah: 6 },
    { nama: 'Mesin Tik', jumlah: 2 },
    { nama: 'Mesin Jahit', jumlah: '-' },
    { nama: 'Alat Peraga IPA', jumlah: 3 },
    { nama: 'Kerangka Manusia', jumlah: 1 },
    { nama: 'Alat IPS', jumlah: 3 },
    { nama: 'Atlas', jumlah: 3 },
    { nama: 'Globe', jumlah: 9 },
    { nama: 'Kipas Angin Kantor', jumlah: 2 },
    { nama: 'Bola Basket', jumlah: '-' },
    { nama: 'Lempar Lembing', jumlah: '-' },
    { nama: 'Bola Tolak Peluru', jumlah: '-' },
    { nama: 'Net Voli & Badminton', jumlah: 1 },
    { nama: 'Bola Voli', jumlah: 3 },
    { nama: 'Bola Sepak', jumlah: 1 },
    { nama: 'Komputer (CPU), Laptop', jumlah: 20 },
    { nama: 'Printer', jumlah: 2 },
    { nama: 'Tape Rec., Mic, Wireless', jumlah: 0 },
    { nama: 'Piala / Tropi', jumlah: 12 },
    { nama: 'Vandel Prestasi Pramuka', jumlah: 1 },
    { nama: 'Televisi, VCD', jumlah: 1 },
    { nama: 'Orgen Elektrik', jumlah: '-' },
    { nama: 'Sound Syistem', jumlah: 1 },
    { nama: 'Slide Proyektor', jumlah: 4 },
  ],
};
