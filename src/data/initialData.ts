import { 
  ProfilSekolah, 
  Pegawai, 
  Siswa, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ, 
  SarprasItem, 
  SuratKeluar, 
  SuratMasuk,
  FaceprintPresensi,
  SkpEKinerja,
  SKPangkat,
  SKBerkala
} from '../types';

export const INITIAL_PROFIL: ProfilSekolah = {
  nama: 'SDN Kedungringin 1 Beji',
  npsn: '20519183',
  bentukPendidikan: 'Sekolah Dasar (SD)',
  status: 'Negeri',
  akreditasi: 'A (Unggul)',
  skPendirian: '421.2/012/424.072/1982',
  tanggalSk: '1982-01-05',
  alamat: 'Dusun Kedungringin RT.02 / RW.03, Desa Kedungringin',
  kelurahan: 'Kedungringin',
  kecamatan: 'Beji',
  kabupaten: 'Pasuruan',
  provinsi: 'Jawa Timur',
  kodePos: '67154',
  telepon: '(0343) 658210',
  email: 'sdnkedungringin1beji@gmail.com',
  kepalaSekolah: 'Hj. Siti Fatimah, S.Pd., M.Pd.',
  nipKepalaSekolah: '19740512 199803 2 004',
  pangkatKepalaSekolah: 'Pembina Tk. I, IV/b',
  tahunPelajaranAktif: '2024/2025',
  tanggalAcuanUsia: '2024-07-01',
};

export const INITIAL_PEGAWAI: Pegawai[] = [
  {
    id: 'peg-1',
    nip: '19740512 199803 2 004',
    nama: 'Hj. Siti Fatimah',
    gelarDepan: '',
    gelarBelakang: 'S.Pd., M.Pd.',
    jenisKelamin: 'P',
    golongan: 'IV/b (Pembina Tk. I)',
    pangkat: 'Pembina Tingkat I',
    jabatan: 'Kepala Sekolah',
    kontak: '0812-3456-7890',
    email: 'sitifatimah.kepsek@gmail.com',
    tmt: '1998-03-01',
    statusKepegawaian: 'PNS',
    pendidikanTerakhir: 'S2 Magister Manajemen Pendidikan',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '1974-05-12',
    mkgTahun: 26,
    mkgBulan: 0,
    karpeg: 'G 049821',
    nomorTaspen: '19740512199803200400',
    npwp: '08.123.456.7-624.000',
    unitKerja: 'SDN Kedungringin 1 Beji',
    skPangkatTerakhir: {
      nomor: '823.4/1042/424.103/2021',
      tanggal: '2021-03-24',
      tmt: '2021-04-01',
      masaKerjaTahun: 23,
      masaKerjaBulan: 0,
      gajiPokok: 4980000,
      pejabatPenetap: 'Gubernur Jawa Timur',
    },
    skBerkalaTerakhir: {
      nomor: '822.3/088/424.072/2023',
      tanggal: '2023-02-15',
      tmt: '2023-03-01',
      masaKerjaTahun: 25,
      masaKerjaBulan: 0,
      gajiPokok: 5211500,
      tmtBerikutnya: '2025-03-01',
      pejabatPenetap: 'Kepala Dinas Pendidikan Kab. Pasuruan',
    },
  },
  {
    id: 'peg-2',
    nip: '19800815 200604 1 012',
    nama: 'Ahmad Muzakki',
    gelarDepan: '',
    gelarBelakang: 'S.Pd.I',
    jenisKelamin: 'L',
    golongan: 'IV/a (Pembina)',
    pangkat: 'Pembina',
    jabatan: 'Guru PAI & Pembina BTQ',
    kontak: '0813-8821-4450',
    email: 'ahmad.muzakki@gmail.com',
    tmt: '2006-04-01',
    statusKepegawaian: 'PNS',
    pendidikanTerakhir: 'S1 Pendidikan Agama Islam',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '1980-08-15',
    mkgTahun: 18,
    mkgBulan: 0,
    karpeg: 'K 198273',
    nomorTaspen: '19800815200604101200',
    npwp: '09.332.112.5-624.000',
    unitKerja: 'SDN Kedungringin 1 Beji',
    skPangkatTerakhir: {
      nomor: '823.4/412/424.103/2022',
      tanggal: '2022-09-12',
      tmt: '2022-10-01',
      masaKerjaTahun: 16,
      masaKerjaBulan: 0,
      gajiPokok: 4560000,
      pejabatPenetap: 'Bupati Pasuruan',
    },
    skBerkalaTerakhir: {
      nomor: '822.3/190/424.072/2024',
      tanggal: '2024-03-10',
      tmt: '2024-04-01',
      masaKerjaTahun: 18,
      masaKerjaBulan: 0,
      gajiPokok: 4890200,
      tmtBerikutnya: '2026-04-01',
      pejabatPenetap: 'Kepala Dinas Pendidikan Kab. Pasuruan',
    },
  },
  {
    id: 'peg-3',
    nip: '19830219 200902 2 008',
    nama: 'Sri Wahyuni',
    gelarDepan: '',
    gelarBelakang: 'S.Pd.SD',
    jenisKelamin: 'P',
    golongan: 'III/d (Penata Tk. I)',
    pangkat: 'Penata Tingkat I',
    jabatan: 'Guru Kelas 6',
    kontak: '0857-3312-9844',
    email: 'sriwahyuni.kdr1@gmail.com',
    tmt: '2009-02-01',
    statusKepegawaian: 'PNS',
    pendidikanTerakhir: 'S1 PGSD',
    tempatLahir: 'Malang',
    tanggalLahir: '1983-02-19',
    mkgTahun: 15,
    mkgBulan: 0,
    karpeg: 'L 289104',
    nomorTaspen: '19830219200902200800',
    npwp: '12.441.552.1-624.000',
    unitKerja: 'SDN Kedungringin 1 Beji',
    skPangkatTerakhir: {
      nomor: '823.3/215/424.103/2021',
      tanggal: '2021-03-18',
      tmt: '2021-04-01',
      masaKerjaTahun: 12,
      masaKerjaBulan: 0,
      gajiPokok: 3950000,
      pejabatPenetap: 'Bupati Pasuruan',
    },
    skBerkalaTerakhir: {
      nomor: '822.3/044/424.072/2023',
      tanggal: '2023-01-20',
      tmt: '2023-02-01',
      masaKerjaTahun: 14,
      masaKerjaBulan: 0,
      gajiPokok: 4125800,
      tmtBerikutnya: '2025-02-01',
      pejabatPenetap: 'Kepala Dinas Pendidikan Kab. Pasuruan',
    },
  },
  {
    id: 'peg-4',
    nip: '19861103 201403 1 003',
    nama: 'Bambang Kusuma',
    gelarDepan: '',
    gelarBelakang: 'S.Pd.',
    jenisKelamin: 'L',
    golongan: 'III/c (Penata)',
    pangkat: 'Penata',
    jabatan: 'Guru Kelas 5',
    kontak: '0812-7721-3901',
    email: 'bambangkusuma.sdn@gmail.com',
    tmt: '2014-03-01',
    statusKepegawaian: 'PNS',
    pendidikanTerakhir: 'S1 PGSD',
    tempatLahir: 'Sidoarjo',
    tanggalLahir: '1986-11-03',
    mkgTahun: 10,
    mkgBulan: 0,
    karpeg: 'M 390192',
    nomorTaspen: '19861103201403100300',
    npwp: '15.662.331.0-624.000',
    unitKerja: 'SDN Kedungringin 1 Beji',
    skPangkatTerakhir: {
      nomor: '823.3/330/424.103/2022',
      tanggal: '2022-09-22',
      tmt: '2022-10-01',
      masaKerjaTahun: 8,
      masaKerjaBulan: 0,
      gajiPokok: 3500000,
      pejabatPenetap: 'Bupati Pasuruan',
    },
    skBerkalaTerakhir: {
      nomor: '822.3/112/424.072/2024',
      tanggal: '2024-02-28',
      tmt: '2024-03-01',
      masaKerjaTahun: 10,
      masaKerjaBulan: 0,
      gajiPokok: 3670000,
      tmtBerikutnya: '2026-03-01',
      pejabatPenetap: 'Kepala Dinas Pendidikan Kab. Pasuruan',
    },
  },
  {
    id: 'peg-5',
    nip: '19910418 201903 2 015',
    nama: 'Dewi Lestari',
    gelarDepan: '',
    gelarBelakang: 'S.Pd.',
    jenisKelamin: 'P',
    golongan: 'III/b (Penata Muda Tk. I)',
    pangkat: 'Penata Muda Tingkat I',
    jabatan: 'Guru Kelas 4',
    kontak: '0822-4567-8910',
    email: 'dewilestari.pgsd@gmail.com',
    tmt: '2019-03-01',
    statusKepegawaian: 'PNS',
    pendidikanTerakhir: 'S1 PGSD',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '1991-04-18',
    mkgTahun: 5,
    mkgBulan: 0,
    karpeg: 'P 412093',
    nomorTaspen: '19910418201903201500',
    npwp: '18.992.114.9-624.000',
    unitKerja: 'SDN Kedungringin 1 Beji',
    skPangkatTerakhir: {
      nomor: '823.3/118/424.103/2023',
      tanggal: '2023-03-15',
      tmt: '2023-04-01',
      masaKerjaTahun: 4,
      masaKerjaBulan: 0,
      gajiPokok: 2980000,
      pejabatPenetap: 'Bupati Pasuruan',
    },
    skBerkalaTerakhir: {
      nomor: '822.3/089/424.072/2023',
      tanggal: '2023-02-20',
      tmt: '2023-03-01',
      masaKerjaTahun: 5,
      masaKerjaBulan: 0,
      gajiPokok: 3105000,
      tmtBerikutnya: '2025-03-01',
      pejabatPenetap: 'Kepala Dinas Pendidikan Kab. Pasuruan',
    },
  },
  {
    id: 'peg-6',
    nip: '19940722 202221 2 009',
    nama: 'Nurul Hidayati',
    gelarDepan: '',
    gelarBelakang: 'S.Pd.',
    jenisKelamin: 'P',
    golongan: 'Gol. IX (Ahli Pertama)',
    pangkat: 'Ahli Pertama (PPPK)',
    jabatan: 'Guru Kelas 3',
    kontak: '0858-9012-3456',
    email: 'nurul.hidayati@gmail.com',
    tmt: '2022-03-01',
    statusKepegawaian: 'PPPK',
    pendidikanTerakhir: 'S1 PGSD',
    tempatLahir: 'Probolinggo',
    tanggalLahir: '1994-07-22',
    mkgTahun: 2,
    mkgBulan: 0,
    karpeg: 'PPPK-940722',
    nomorTaspen: '19940722202221200900',
    npwp: '21.554.771.2-624.000',
    unitKerja: 'SDN Kedungringin 1 Beji',
    skPangkatTerakhir: {
      nomor: '810/PPPK-042/424.103/2022',
      tanggal: '2022-02-28',
      tmt: '2022-03-01',
      pejabatPenetap: 'Bupati Pasuruan',
    },
    skBerkalaTerakhir: {
      nomor: '822.3/PPPK-012/424.072/2024',
      tanggal: '2024-02-15',
      tmt: '2024-03-01',
      gajiPokok: 3203600,
      tmtBerikutnya: '2026-03-01',
      pejabatPenetap: 'Kepala Dinas Pendidikan Kab. Pasuruan',
    },
  },
  {
    id: 'peg-7',
    nip: '19951205 202321 1 004',
    nama: 'Fajar Eko Prasetyo',
    gelarDepan: '',
    gelarBelakang: 'S.Pd.',
    jenisKelamin: 'L',
    golongan: 'Gol. IX (Ahli Pertama)',
    pangkat: 'Ahli Pertama (PPPK)',
    jabatan: 'Guru PJOK',
    kontak: '0813-4455-6677',
    email: 'fajar.pjok@gmail.com',
    tmt: '2023-04-01',
    statusKepegawaian: 'PPPK',
    pendidikanTerakhir: 'S1 Pendidikan Jasmani & Kesehatan',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '1995-12-05',
    mkgTahun: 1,
    mkgBulan: 6,
    karpeg: 'PPPK-951205',
    nomorTaspen: '19951205202321100400',
    npwp: '23.881.002.3-624.000',
    unitKerja: 'SDN Kedungringin 1 Beji',
    skPangkatTerakhir: {
      nomor: '810/PPPK-091/424.103/2023',
      tanggal: '2023-03-29',
      tmt: '2023-04-01',
      pejabatPenetap: 'Bupati Pasuruan',
    },
    skBerkalaTerakhir: {
      nomor: '822.3/PPPK-033/424.072/2025',
      tanggal: '2025-03-10',
      tmt: '2025-04-01',
      gajiPokok: 3203600,
      tmtBerikutnya: '2027-04-01',
      pejabatPenetap: 'Kepala Dinas Pendidikan Kab. Pasuruan',
    },
  },
  {
    id: 'peg-8',
    nip: '19960310 202421 2 011',
    nama: 'Rina Rahmawati',
    gelarDepan: '',
    gelarBelakang: 'S.Pd.',
    jenisKelamin: 'P',
    golongan: 'Gol. IX (Ahli Pertama)',
    pangkat: 'Ahli Pertama (PPPK)',
    jabatan: 'Guru Kelas 2',
    kontak: '0877-1234-9087',
    email: 'rina.rahmawati@gmail.com',
    tmt: '2024-03-01',
    statusKepegawaian: 'PPPK',
    pendidikanTerakhir: 'S1 PGSD',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '1996-03-10',
    mkgTahun: 0,
    mkgBulan: 7,
    karpeg: 'PPPK-960310',
    nomorTaspen: '19960310202421201100',
    npwp: '25.334.662.8-624.000',
    unitKerja: 'SDN Kedungringin 1 Beji',
    skPangkatTerakhir: {
      nomor: '810/PPPK-110/424.103/2024',
      tanggal: '2024-02-26',
      tmt: '2024-03-01',
      pejabatPenetap: 'Bupati Pasuruan',
    },
    skBerkalaTerakhir: {
      nomor: '822.3/PPPK-045/424.072/2024',
      tanggal: '2024-03-01',
      tmt: '2024-03-01',
      gajiPokok: 3203600,
      tmtBerikutnya: '2026-03-01',
      pejabatPenetap: 'Kepala Dinas Pendidikan Kab. Pasuruan',
    },
  },
  {
    id: 'peg-9',
    nip: '19970914 202107 2 001',
    nama: 'Tri Handayani',
    gelarDepan: '',
    gelarBelakang: 'S.Pd.',
    jenisKelamin: 'P',
    golongan: 'GTT',
    jabatan: 'Guru Kelas 1',
    kontak: '0896-5544-3322',
    email: 'trihandayani.guru@gmail.com',
    tmt: '2021-07-12',
    statusKepegawaian: 'GTT',
    pendidikanTerakhir: 'S1 PGSD',
    tempatLahir: 'Bangil',
    tanggalLahir: '1997-09-14',
    unitKerja: 'SDN Kedungringin 1 Beji',
  },
  {
    id: 'peg-10',
    nip: '19980625 202001 1 002',
    nama: 'Muhammad Rizky Pratama',
    gelarDepan: '',
    gelarBelakang: 'S.Kom.',
    jenisKelamin: 'L',
    golongan: 'PTT',
    jabatan: 'Operator Sekolah & Administrasi',
    kontak: '0812-9988-7766',
    email: 'rizky.ops.kdr1@gmail.com',
    tmt: '2020-01-02',
    statusKepegawaian: 'PTT',
    pendidikanTerakhir: 'S1 Teknik Informatika',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '1998-06-25',
    unitKerja: 'SDN Kedungringin 1 Beji',
  },
  {
    id: 'peg-11',
    nip: '-',
    nama: 'Slamet Riyadi',
    gelarDepan: '',
    gelarBelakang: '',
    jenisKelamin: 'L',
    golongan: 'PTT',
    jabatan: 'Penjaga Sekolah & Keamanan',
    kontak: '0852-1122-3344',
    email: 'slametriyadi.kdr@gmail.com',
    tmt: '2016-08-01',
    statusKepegawaian: 'PTT',
    pendidikanTerakhir: 'SMA',
    tempatLahir: 'Beji, Pasuruan',
    tanggalLahir: '1979-11-10',
    unitKerja: 'SDN Kedungringin 1 Beji',
  },
];

// Presensi Biometrik Faceprint Harian & Bulanan
export const INITIAL_PRESENSI_FACEPRINT: FaceprintPresensi[] = [
  {
    id: 'fp-01',
    pegawaiId: 'peg-1',
    nip: '19740512 199803 2 004',
    nama: 'Hj. Siti Fatimah, S.Pd., M.Pd.',
    tanggal: '2024-10-15',
    jamMasuk: '06:48:12',
    jamPulang: '14:35:40',
    mesinId: 'FP-SDNKDR1-BEJI-01',
    statusKehadiran: 'Hadir Tepat Waktu',
    keterlambatanMenit: 0,
    pulangCepatMenit: 0,
    efektifJamKerja: 7.8,
    verifikasi: 'Face Recognition Biometrik 99.8%',
    lokasiGps: 'SDN Kedungringin 1 Beji (Radius 5m)',
    catatan: 'Terverifikasi Mesin Wajah Utama Kantor Kepala Sekolah',
  },
  {
    id: 'fp-02',
    pegawaiId: 'peg-2',
    nip: '19800815 200604 1 012',
    nama: 'Ahmad Muzakki, S.Pd.I',
    tanggal: '2024-10-15',
    jamMasuk: '06:52:05',
    jamPulang: '14:30:18',
    mesinId: 'FP-SDNKDR1-BEJI-01',
    statusKehadiran: 'Hadir Tepat Waktu',
    keterlambatanMenit: 0,
    pulangCepatMenit: 0,
    efektifJamKerja: 7.6,
    verifikasi: 'Face Recognition Biometrik 99.8%',
    lokasiGps: 'SDN Kedungringin 1 Beji (Radius 8m)',
    catatan: 'Imam Sholat Dzuhur Berjamaah',
  },
  {
    id: 'fp-03',
    pegawaiId: 'peg-3',
    nip: '19830219 200902 2 008',
    nama: 'Sri Wahyuni, S.Pd.SD',
    tanggal: '2024-10-15',
    jamMasuk: '06:55:30',
    jamPulang: '14:32:00',
    mesinId: 'FP-SDNKDR1-BEJI-01',
    statusKehadiran: 'Hadir Tepat Waktu',
    keterlambatanMenit: 0,
    pulangCepatMenit: 0,
    efektifJamKerja: 7.6,
    verifikasi: 'Face Recognition Biometrik 99.8%',
    catatan: 'Wali Kelas 6 Pendampingan Asesmen',
  },
  {
    id: 'fp-04',
    pegawaiId: 'peg-4',
    nip: '19861103 201403 1 003',
    nama: 'Bambang Kusuma, S.Pd.',
    tanggal: '2024-10-15',
    jamMasuk: '07:08:44',
    jamPulang: '14:30:15',
    mesinId: 'FP-SDNKDR1-BEJI-01',
    statusKehadiran: 'Hadir Tepat Waktu',
    keterlambatanMenit: 0,
    pulangCepatMenit: 0,
    efektifJamKerja: 7.3,
    verifikasi: 'Face Recognition Biometrik 99.8%',
    catatan: 'Tepat waktu sebelum batas toleransi 07:15',
  },
  {
    id: 'fp-05',
    pegawaiId: 'peg-5',
    nip: '19910418 201903 2 015',
    nama: 'Dewi Lestari, S.Pd.',
    tanggal: '2024-10-15',
    jamMasuk: '07:18:10',
    jamPulang: '14:34:22',
    mesinId: 'FP-SDNKDR1-BEJI-01',
    statusKehadiran: 'Terlambat',
    keterlambatanMenit: 3,
    pulangCepatMenit: 0,
    efektifJamKerja: 7.2,
    verifikasi: 'Face Recognition Biometrik 99.8%',
    catatan: 'Terlambat 3 menit karena kendala lalu lintas perlintasan rel Beji',
  },
  {
    id: 'fp-06',
    pegawaiId: 'peg-6',
    nip: '19940722 202221 2 009',
    nama: 'Nurul Hidayati, S.Pd.',
    tanggal: '2024-10-15',
    jamMasuk: '06:50:11',
    jamPulang: '14:31:05',
    mesinId: 'FP-SDNKDR1-BEJI-01',
    statusKehadiran: 'Hadir Tepat Waktu',
    keterlambatanMenit: 0,
    pulangCepatMenit: 0,
    efektifJamKerja: 7.7,
    verifikasi: 'Face Recognition Biometrik 99.8%',
  },
  {
    id: 'fp-07',
    pegawaiId: 'peg-7',
    nip: '19951205 202321 1 004',
    nama: 'Fajar Eko Prasetyo, S.Pd.',
    tanggal: '2024-10-15',
    jamMasuk: '06:45:00',
    jamPulang: '14:36:12',
    mesinId: 'FP-SDNKDR1-BEJI-01',
    statusKehadiran: 'Hadir Tepat Waktu',
    keterlambatanMenit: 0,
    pulangCepatMenit: 0,
    efektifJamKerja: 7.8,
    verifikasi: 'Face Recognition Biometrik 99.8%',
    catatan: 'Memimpin senam pagi siswa',
  },
  {
    id: 'fp-08',
    pegawaiId: 'peg-8',
    nip: '19960310 202421 2 011',
    nama: 'Rina Rahmawati, S.Pd.',
    tanggal: '2024-10-15',
    jamMasuk: '07:02:18',
    jamPulang: '14:30:45',
    mesinId: 'FP-SDNKDR1-BEJI-01',
    statusKehadiran: 'Hadir Tepat Waktu',
    keterlambatanMenit: 0,
    pulangCepatMenit: 0,
    efektifJamKerja: 7.5,
    verifikasi: 'Face Recognition Biometrik 99.8%',
  },
  {
    id: 'fp-09',
    pegawaiId: 'peg-9',
    nip: '-',
    nama: 'Tri Handayani, S.Pd.',
    tanggal: '2024-10-15',
    jamMasuk: '06:58:20',
    jamPulang: '14:30:00',
    mesinId: 'FP-SDNKDR1-BEJI-01',
    statusKehadiran: 'Hadir Tepat Waktu',
    keterlambatanMenit: 0,
    pulangCepatMenit: 0,
    efektifJamKerja: 7.5,
    verifikasi: 'Face Recognition Biometrik 99.8%',
  },
  {
    id: 'fp-10',
    pegawaiId: 'peg-10',
    nip: '-',
    nama: 'Muhammad Rizky Pratama, S.Kom.',
    tanggal: '2024-10-15',
    jamMasuk: '06:40:50',
    jamPulang: '15:10:00',
    mesinId: 'FP-SDNKDR1-BEJI-01',
    statusKehadiran: 'Hadir Tepat Waktu',
    keterlambatanMenit: 0,
    pulangCepatMenit: 0,
    efektifJamKerja: 8.5,
    verifikasi: 'Face Recognition Biometrik 99.8%',
    catatan: 'Sinkronisasi Dapodik dan server ANBK',
  },
  {
    id: 'fp-11',
    pegawaiId: 'peg-11',
    nip: '-',
    nama: 'Slamet Riyadi',
    tanggal: '2024-10-15',
    jamMasuk: '06:00:15',
    jamPulang: '16:00:20',
    mesinId: 'FP-SDNKDR1-BEJI-01',
    statusKehadiran: 'Hadir Tepat Waktu',
    keterlambatanMenit: 0,
    pulangCepatMenit: 0,
    efektifJamKerja: 10.0,
    verifikasi: 'Face Recognition Biometrik 99.8%',
    catatan: 'Piket pagi pembukaan gerbang sekolah',
  },
];

// Laporan Tribulan SKP E-Kinerja Pegawai (PermenPAN-RB No. 6 Tahun 2022)
export const INITIAL_SKP_EKINERJA: SkpEKinerja[] = [
  {
    id: 'skp-01',
    pegawaiId: 'peg-2',
    nip: '19800815 200604 1 012',
    nama: 'Ahmad Muzakki, S.Pd.I',
    jabatan: 'Guru PAI & Pembina BTQ',
    pangkatGolongan: 'Pembina, IV/a',
    tahun: 2024,
    tribulan: 3,
    periodeAwal: '2024-07-01',
    periodeAkhir: '2024-09-30',
    pejabatPenilaiNama: 'Hj. Siti Fatimah, S.Pd., M.Pd.',
    pejabatPenilaiNip: '19740512 199803 2 004',
    pejabatPenilaiJabatan: 'Kepala UPT SDN Kedungringin 1 Beji',
    targetKinerja: [
      {
        id: 'tk-1',
        rencanaKinerja: 'Terlaksananya perencanaan, pelaksanaan, dan asesmen pembelajaran Pendidikan Agama Islam dan Budi Pekerti (PAI)',
        indikator: 'Persentase perangkat ajar (Modul Ajar, ATP, Asesmen Formatif & Sumatif) tersusun lengkap dan diunggah di Platform Merdeka Mengajar (PMM)',
        targetKuantitas: '1 Dokumen Lengkap (Kls 1-6)',
        realisasi: '1 Dokumen Perangkat Ajar Lengkap 100% Terealisasi',
        umpanBalik: 'Penyusunan Modul Ajar sangat kontekstual dan mengintegrasikan pembiasaan sholat dhuha serta BTQ harian',
        capaian: 'Diatas Ekspektasi',
      },
      {
        id: 'tk-2',
        rencanaKinerja: 'Terlaksananya bimbingan ekstrakurikuler Baca Tulis Al-Qur\'an (BTQ) dan Tahfidz Juz 30',
        indikator: 'Jumlah peserta didik yang lulus munaqosyah BTQ dengan predikat Mumtaz/Jayyid Jiddan',
        targetKuantitas: '45 Peserta Didik',
        realisasi: '48 Peserta Didik Lulus Munaqosyah',
        umpanBalik: 'Prestasi siswa sangat membanggakan dalam Munaqosyah Kecamatan Beji',
        capaian: 'Diatas Ekspektasi',
      },
      {
        id: 'tk-3',
        rencanaKinerja: 'Pelaksanaan Pengembangan Keprofesian Berkelanjutan (PKB) melalui KKG PAI Korwil Beji',
        indikator: 'Jumlah sertifikat pelatihan mandiri PMM atau KKG yang diselesaikan',
        targetKuantitas: '1 Sertifikat Aksi Nyata PMM',
        realisasi: '2 Sertifikat Aksi Nyata Terverifikasi',
        umpanBalik: 'Sangat aktif berbagi praktik baik kepada guru-guru se-Kecamatan Beji',
        capaian: 'Diatas Ekspektasi',
      },
    ],
    perilakuKerja: [
      {
        aspek: 'Berorientasi Pelayanan',
        ekspektasiPimpinan: 'Memberikan bimbingan keagamaan dengan sabar dan responsif kepada siswa serta wali murid',
        umpanBalik: 'Sangat ramah, selalu menyambut siswa di pintu gerbang dengan senyum dan doa',
      },
      {
        aspek: 'Akuntabel',
        ekspektasiPimpinan: 'Melaksanakan penilaian secara adil, objektif, dan tepat waktu di buku rapor',
        umpanBalik: 'Rekapitulasi nilai selalu diserahkan tepat waktu sebelum tenggat rapat dewan guru',
      },
      {
        aspek: 'Kompeten',
        ekspektasiPimpinan: 'Terus meningkatkan kemampuan pedagogik dan penguasaan tajwid',
        umpanBalik: 'Memiliki sertifikasi tashih Al-Qur\'an dan mahir metodologi tilawati',
      },
      {
        aspek: 'Harmonis',
        ekspektasiPimpinan: 'Membangun suasana kerja yang kondusif antar sesama guru dan tenaga kependidikan',
        umpanBalik: 'Menjadi perekat kerukunan warga sekolah dan tauladan bagi seluruh warga sekolah',
      },
      {
        aspek: 'Loyal',
        ekspektasiPimpinan: 'Mendukung penuh seluruh kebijakan kepala sekolah dan program Dinas Pendidikan',
        umpanBalik: 'Sangat berkomitmen memajukan akreditasi sekolah',
      },
      {
        aspek: 'Adaptif',
        ekspektasiPimpinan: 'Memanfaatkan media digital dan LCD proyektor dalam pembelajaran PAI interaktif',
        umpanBalik: 'Menggunakan video animasi kisah nabi yang disukai siswa',
      },
      {
        aspek: 'Kolaboratif',
        ekspektasiPimpinan: 'Bekerja sama dengan guru kelas dalam pembentukan karakter profil pelajar pancasila',
        umpanBalik: 'Kolaborasi pelaksanaan P5 tema kearifan lokal berjalan sangat sukses',
      },
    ],
    predikatKinerja: 'Sangat Baik',
    ratingHasilKerja: 'Diatas Ekspektasi',
    ratingPerilaku: 'Diatas Ekspektasi',
    catatanRekomendasi: 'Pertahankan etos kerja teladan dan dedikasi tinggi dalam pembinaan akhlak mulia siswa SDN Kedungringin 1 Beji.',
    tanggalPenilaian: '2024-10-02',
  },
  {
    id: 'skp-02',
    pegawaiId: 'peg-3',
    nip: '19830219 200902 2 008',
    nama: 'Sri Wahyuni, S.Pd.SD',
    jabatan: 'Guru Kelas 6',
    pangkatGolongan: 'Penata Tingkat I, III/d',
    tahun: 2024,
    tribulan: 3,
    periodeAwal: '2024-07-01',
    periodeAkhir: '2024-09-30',
    pejabatPenilaiNama: 'Hj. Siti Fatimah, S.Pd., M.Pd.',
    pejabatPenilaiNip: '19740512 199803 2 004',
    pejabatPenilaiJabatan: 'Kepala UPT SDN Kedungringin 1 Beji',
    targetKinerja: [
      {
        id: 'tk-4',
        rencanaKinerja: 'Terlaksananya pembelajaran berdiferensiasi dan persiapan pemantapan kelulusan kelas 6',
        indikator: 'Rata-rata ketuntasan asesmen formatif siswa kelas 6 di atas KKM/KKTP (>= 80)',
        targetKuantitas: '100% Siswa Kelas 6 (32 Siswa)',
        realisasi: '32 Siswa Tuntas dengan Rerata 87.5',
        umpanBalik: 'Pendampingan belajar intensif di luar jam sekolah terlaksana dengan tertib dan terukur',
        capaian: 'Diatas Ekspektasi',
      },
      {
        id: 'tk-5',
        rencanaKinerja: 'Penyusunan Analisis Hasil Asesmen Nasional Berbasis Komputer (ANBK) & TKA',
        indikator: 'Dokumen rekapitulasi nilai rapor dan simulasi TKA Numerasi & Literasi',
        targetKuantitas: '1 Laporan Pemetaan Akademik',
        realisasi: 'Laporan Pemetaan Akademik Selesai Tepat Waktu',
        umpanBalik: 'Data analisis sangat akurat dan menjadi rujukan bimbingan belajar siswa berprestasi',
        capaian: 'Sesuai Ekspektasi',
      },
    ],
    perilakuKerja: [
      {
        aspek: 'Berorientasi Pelayanan',
        ekspektasiPimpinan: 'Memberikan penjelasan berkala kepada paguyuban wali murid kelas 6',
        umpanBalik: 'Komunikasi dengan wali murid terjalin sangat erat dan transparan',
      },
      {
        aspek: 'Akuntabel',
        ekspektasiPimpinan: 'Disiplin hadir dan mengelola administrasi kelas 6',
        umpanBalik: 'Presensi faceprint 100% tepat waktu tanpa catatan keterlambatan',
      },
      {
        aspek: 'Kompeten',
        ekspektasiPimpinan: 'Menguasai materi literasi dan numerasi standar Kemdikbudristek',
        umpanBalik: 'Materi pengayaan sangat berkualitas',
      },
      {
        aspek: 'Harmonis',
        ekspektasiPimpinan: 'Menjaga solidaritas tim guru jenjang atas',
        umpanBalik: 'Bekerja sama sangat baik dengan guru kelas 4 dan 5',
      },
      {
        aspek: 'Loyal',
        ekspektasiPimpinan: 'Menjaga nama baik sekolah di tingkat Gugus Beji',
        umpanBalik: 'Selalu aktif membawa siswa juara olimpiade sains & matematika',
      },
      {
        aspek: 'Adaptif',
        ekspektasiPimpinan: 'Memanfaatkan aplikasi CBT untuk latihan ujian siswa',
        umpanBalik: 'Siswa kelas 6 terlatih menggunakan Google Form dan Chromebook',
      },
      {
        aspek: 'Kolaboratif',
        ekspektasiPimpinan: 'Mendukung kegiatan perkemahan dan ekstrakurikuler sekolah',
        umpanBalik: 'Aktif mendampingi regu pramuka penggalang',
      },
    ],
    predikatKinerja: 'Sangat Baik',
    ratingHasilKerja: 'Diatas Ekspektasi',
    ratingPerilaku: 'Sesuai Ekspektasi',
    catatanRekomendasi: 'Sangat baik dalam mengantarkan siswa kelas 6 menuju kelulusan dengan prestasi membanggakan.',
    tanggalPenilaian: '2024-10-02',
  },
  {
    id: 'skp-03',
    pegawaiId: 'peg-7',
    nip: '19951205 202321 1 004',
    nama: 'Fajar Eko Prasetyo, S.Pd.',
    jabatan: 'Guru PJOK',
    pangkatGolongan: 'Ahli Pertama (PPPK), Gol. IX',
    tahun: 2024,
    tribulan: 3,
    periodeAwal: '2024-07-01',
    periodeAkhir: '2024-09-30',
    pejabatPenilaiNama: 'Hj. Siti Fatimah, S.Pd., M.Pd.',
    pejabatPenilaiNip: '19740512 199803 2 004',
    pejabatPenilaiJabatan: 'Kepala UPT SDN Kedungringin 1 Beji',
    targetKinerja: [
      {
        id: 'tk-6',
        rencanaKinerja: 'Terlaksananya pembelajaran PJOK dan pembinaan kebugaran jasmani peserta didik kelas 1-6',
        indikator: 'Persentase kebugaran jasmani siswa (Tes Kebugaran Siswa Indonesia) dalam kategori Baik/Sangat Baik',
        targetKuantitas: '85% Siswa',
        realisasi: '91% Siswa Kategori Bugar',
        umpanBalik: 'Antusiasme siswa dalam olahraga atletik dan senam sangat tinggi',
        capaian: 'Diatas Ekspektasi',
      },
      {
        id: 'tk-7',
        rencanaKinerja: 'Pembinaan Ekstrakurikuler Bulutangkis & Futsal untuk O2SN Korwil Beji',
        indikator: 'Perolehan medali pada ajang O2SN tingkat Kecamatan Beji',
        targetKuantitas: 'Juara 1 atau 2',
        realisasi: 'Juara 1 Bulutangkis Putra & Juara 2 Futsal',
        umpanBalik: 'Membawa nama harum SDN Kedungringin 1 Beji di tingkat Kabupaten Pasuruan',
        capaian: 'Diatas Ekspektasi',
      },
    ],
    perilakuKerja: [
      {
        aspek: 'Berorientasi Pelayanan',
        ekspektasiPimpinan: 'Mengutamakan keselamatan dan kesehatan fisik siswa saat berolahraga',
        umpanBalik: 'Prosedur pemanasan dan P3K selalu disiapkan secara prima di lapangan',
      },
      {
        aspek: 'Akuntabel',
        ekspektasiPimpinan: 'Memelihara sarana prasarana olahraga sekolah dengan rapi',
        umpanBalik: 'Peralatan bola, net, dan matras tersimpan rapi di gudang sarpras',
      },
      {
        aspek: 'Kompeten',
        ekspektasiPimpinan: 'Memperbarui lisensi kepelatihan dan kebugaran',
        umpanBalik: 'Mengikuti workshop pembina olahraga Dinas Pendidikan',
      },
      {
        aspek: 'Harmonis',
        ekspektasiPimpinan: 'Menumbuhkan sportivitas antar siswa dan rekan kerja',
        umpanBalik: 'Menciptakan suasana fun dan gembira di setiap jam pelajaran',
      },
      {
        aspek: 'Loyal',
        ekspektasiPimpinan: 'Siap menjalankan tugas ekstra pembinaan di luar jam dinas',
        umpanBalik: 'Mendampingi latihan intensif di hari Sabtu dengan penuh dedikasi',
      },
      {
        aspek: 'Adaptif',
        ekspektasiPimpinan: 'Mengadaptasi permainan tradisional eggrang dan gobak sodor dalam kurikulum',
        umpanBalik: 'Pembelajaran PJOK sangat variatif',
      },
      {
        aspek: 'Kolaboratif',
        ekspektasiPimpinan: 'Berkolaborasi dengan Puskesmas Beji untuk penjaringan kesehatan berkala',
        umpanBalik: 'Pemeriksaan status gizi dan IMT siswa berjalan lancar',
      },
    ],
    predikatKinerja: 'Sangat Baik',
    ratingHasilKerja: 'Diatas Ekspektasi',
    ratingPerilaku: 'Diatas Ekspektasi',
    catatanRekomendasi: 'Guru muda yang enerjik, pertahankan prestasi gemilang di bidang olahraga kesiswaan.',
    tanggalPenilaian: '2024-10-02',
  },
];

export const MAPEL_LIST = [
  'Pendidikan Agama Islam dan Budi Pekerti (PAI)',
  'Pendidikan Pancasila (PKn)',
  'Bahasa Indonesia (B. Ind)',
  'Matematika (Mtk)',
  'Seni Budaya (SB)',
  'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)',
  'Bahasa Inggris (B. Ing)',
  'Muatan Lokal Bahasa Jawa (B. Jawa)',
];

export const INITIAL_SISWA: Siswa[] = [
  // Kelas 6
  {
    id: 'sis-01',
    nisn: '0123847591',
    nis: '2021001',
    nama: 'Muhammad Fadhil Al-Ghifari',
    jenisKelamin: 'L',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2012-05-14',
    agama: 'Islam',
    kelas: 6,
    rombel: 'A',
    namaAyah: 'Suwandi',
    namaIbu: 'Khotimah',
    alamat: 'Dsn. Kedungringin RT.01 RW.02 Beji',
    noHpOrtu: '0812-3344-5566',
    tmtDiterima: '2019-07-15',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-02',
    nisn: '0124958102',
    nis: '2021002',
    nama: 'Aisyah Putri Azzahra',
    jenisKelamin: 'P',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2012-08-20',
    agama: 'Islam',
    kelas: 6,
    rombel: 'A',
    namaAyah: 'Abdul Rohim',
    namaIbu: 'Siti Aminah',
    alamat: 'Dsn. Kedungringin RT.03 RW.02 Beji',
    noHpOrtu: '0857-4455-6677',
    tmtDiterima: '2019-07-15',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-03',
    nisn: '0125678912',
    nis: '2021003',
    nama: 'Bintang Raditya Pratama',
    jenisKelamin: 'L',
    tempatLahir: 'Bangil',
    tanggalLahir: '2012-03-09',
    agama: 'Islam',
    kelas: 6,
    rombel: 'A',
    namaAyah: 'Haryanto',
    namaIbu: 'Endang Sulistyowati',
    alamat: 'Jl. Melati RT.04 RW.01 Kedungringin',
    noHpOrtu: '0813-8901-2345',
    tmtDiterima: '2019-07-15',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-04',
    nisn: '0126789023',
    nis: '2021004',
    nama: 'Nabila Nur Azizah',
    jenisKelamin: 'P',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2012-11-25',
    agama: 'Islam',
    kelas: 6,
    rombel: 'A',
    namaAyah: 'Mukhlis',
    namaIbu: 'Zubaidah',
    alamat: 'Dsn. Kedungringin RT.02 RW.03 Beji',
    noHpOrtu: '0878-1234-5678',
    tmtDiterima: '2019-07-15',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-05',
    nisn: '0127890134',
    nis: '2021005',
    nama: 'Rifqi Hafizhan Ramadhan',
    jenisKelamin: 'L',
    tempatLahir: 'Sidoarjo',
    tanggalLahir: '2012-07-30',
    agama: 'Islam',
    kelas: 6,
    rombel: 'A',
    namaAyah: 'Danu Kusuma',
    namaIbu: 'Nur Hayati',
    alamat: 'Dsn. Pilang RT.01 RW.04 Beji',
    noHpOrtu: '0899-7654-3210',
    tmtDiterima: '2019-07-15',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-06',
    nisn: '0128901245',
    nis: '2021006',
    nama: 'Theresia Maria Siregar',
    jenisKelamin: 'P',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2012-09-12',
    agama: 'Kristen',
    kelas: 6,
    rombel: 'A',
    namaAyah: 'Yohanes Siregar',
    namaIbu: 'Marta Simanjuntak',
    alamat: 'Perum Beji Asri Blok B-12',
    noHpOrtu: '0812-4567-8901',
    tmtDiterima: '2019-07-15',
    statusSiswa: 'Aktif',
  },

  // Kelas 5
  {
    id: 'sis-07',
    nisn: '0134567890',
    nis: '2022001',
    nama: 'Dimas Arya Pamungkas',
    jenisKelamin: 'L',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2013-04-18',
    agama: 'Islam',
    kelas: 5,
    rombel: 'A',
    namaAyah: 'Joko Susilo',
    namaIbu: 'Sri Rejeki',
    alamat: 'Dsn. Kedungringin RT.02 RW.01 Beji',
    noHpOrtu: '0812-6677-8899',
    tmtDiterima: '2020-07-13',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-08',
    nisn: '0135678901',
    nis: '2022002',
    nama: 'Salma Khairunnisa',
    jenisKelamin: 'P',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2013-06-22',
    agama: 'Islam',
    kelas: 5,
    rombel: 'A',
    namaAyah: 'Subhan',
    namaIbu: 'Mariana',
    alamat: 'Dsn. Kedungringin RT.04 RW.03 Beji',
    noHpOrtu: '0856-7890-1234',
    tmtDiterima: '2020-07-13',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-09',
    nisn: '0136789012',
    nis: '2022003',
    nama: 'Farhan Dwi Cahyo',
    jenisKelamin: 'L',
    tempatLahir: 'Bangil',
    tanggalLahir: '2013-10-05',
    agama: 'Islam',
    kelas: 5,
    rombel: 'A',
    namaAyah: 'Riyanto',
    namaIbu: 'Sutini',
    alamat: 'Dsn. Kedungringin RT.01 RW.03 Beji',
    noHpOrtu: '0813-9012-3456',
    tmtDiterima: '2020-07-13',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-10',
    nisn: '0137890123',
    nis: '2022004',
    nama: 'Zahra Anindya Putri',
    jenisKelamin: 'P',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2013-12-14',
    agama: 'Islam',
    kelas: 5,
    rombel: 'A',
    namaAyah: 'Arif Wibowo',
    namaIbu: 'Kartika',
    alamat: 'Dsn. Kedungringin RT.03 RW.01 Beji',
    noHpOrtu: '0821-3456-7890',
    tmtDiterima: '2020-07-13',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-11',
    nisn: '0138901234',
    nis: '2022005',
    nama: 'I Made Bagus Sadewa',
    jenisKelamin: 'L',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2013-05-19',
    agama: 'Hindu',
    kelas: 5,
    rombel: 'A',
    namaAyah: 'I Wayan Sudiarta',
    namaIbu: 'Ni Ketut Sukerni',
    alamat: 'Jl. Kenanga RT.02 Beji',
    noHpOrtu: '0812-3322-1100',
    tmtDiterima: '2020-07-13',
    statusSiswa: 'Aktif',
  },

  // Kelas 4
  {
    id: 'sis-12',
    nisn: '0141234567',
    nis: '2023001',
    nama: 'Alif Kurnia Wardhana',
    jenisKelamin: 'L',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2014-02-11',
    agama: 'Islam',
    kelas: 4,
    rombel: 'A',
    namaAyah: 'Budi Santoso',
    namaIbu: 'Lilik Rahayu',
    alamat: 'Dsn. Kedungringin RT.02 RW.02 Beji',
    noHpOrtu: '0857-1122-3344',
    tmtDiterima: '2021-07-12',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-13',
    nisn: '0142345678',
    nis: '2023002',
    nama: 'Hafizhah Nurul Ilmi',
    jenisKelamin: 'P',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2014-07-08',
    agama: 'Islam',
    kelas: 4,
    rombel: 'A',
    namaAyah: 'Mustofa',
    namaIbu: 'Anisah',
    alamat: 'Dsn. Kedungringin RT.04 RW.01 Beji',
    noHpOrtu: '0813-2233-4455',
    tmtDiterima: '2021-07-12',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-14',
    nisn: '0143456789',
    nis: '2023003',
    nama: 'Raka Aditya Pratama',
    jenisKelamin: 'L',
    tempatLahir: 'Bangil',
    tanggalLahir: '2014-09-24',
    agama: 'Islam',
    kelas: 4,
    rombel: 'A',
    namaAyah: 'Samsul Arifin',
    namaIbu: 'Wiwiek',
    alamat: 'Dsn. Kedungringin RT.03 RW.03 Beji',
    noHpOrtu: '0877-4455-6677',
    tmtDiterima: '2021-07-12',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-15',
    nisn: '0144567890',
    nis: '2023004',
    nama: 'Kayla Syakira Maulida',
    jenisKelamin: 'P',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2014-04-03',
    agama: 'Islam',
    kelas: 4,
    rombel: 'A',
    namaAyah: 'Zainal Abidin',
    namaIbu: 'Fitriyah',
    alamat: 'Dsn. Kedungringin RT.01 RW.01 Beji',
    noHpOrtu: '0812-7788-9900',
    tmtDiterima: '2021-07-12',
    statusSiswa: 'Aktif',
  },

  // Kelas 3
  {
    id: 'sis-16',
    nisn: '0151122334',
    nis: '2024001',
    nama: 'Fathir Ahmad Dani',
    jenisKelamin: 'L',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2015-03-15',
    agama: 'Islam',
    kelas: 3,
    rombel: 'A',
    namaAyah: 'Dany Setiawan',
    namaIbu: 'Rina Marlina',
    alamat: 'Dsn. Kedungringin RT.02 RW.03 Beji',
    noHpOrtu: '0858-3344-5566',
    tmtDiterima: '2022-07-11',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-17',
    nisn: '0152233445',
    nis: '2024002',
    nama: 'Nadhira Shafa Salsabila',
    jenisKelamin: 'P',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2015-08-19',
    agama: 'Islam',
    kelas: 3,
    rombel: 'A',
    namaAyah: 'Sholeh',
    namaIbu: 'Umi Kulsum',
    alamat: 'Dsn. Kedungringin RT.03 RW.02 Beji',
    noHpOrtu: '0813-5566-7788',
    tmtDiterima: '2022-07-11',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-18',
    nisn: '0153344556',
    nis: '2024003',
    nama: 'Gabriel Alexander Tan',
    jenisKelamin: 'L',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2015-11-04',
    agama: 'Katolik',
    kelas: 3,
    rombel: 'A',
    namaAyah: 'Antonius Tan',
    namaIbu: 'Lucia Fransiska',
    alamat: 'Perum Beji Indah Blok C-05',
    noHpOrtu: '0812-9900-1122',
    tmtDiterima: '2022-07-11',
    statusSiswa: 'Aktif',
  },

  // Kelas 2
  {
    id: 'sis-19',
    nisn: '0161112233',
    nis: '2025001',
    nama: 'Kenzo Althafandra',
    jenisKelamin: 'L',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2016-05-10',
    agama: 'Islam',
    kelas: 2,
    rombel: 'A',
    namaAyah: 'Rendra Kurnia',
    namaIbu: 'Dian Permata',
    alamat: 'Dsn. Kedungringin RT.01 RW.02 Beji',
    noHpOrtu: '0857-8899-0011',
    tmtDiterima: '2023-07-17',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-20',
    nisn: '0162223344',
    nis: '2025002',
    nama: 'Zalfa Naura Hayati',
    jenisKelamin: 'P',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2016-09-28',
    agama: 'Islam',
    kelas: 2,
    rombel: 'A',
    namaAyah: 'Mahmud Fauzi',
    namaIbu: 'Laila Munawaroh',
    alamat: 'Dsn. Kedungringin RT.04 RW.02 Beji',
    noHpOrtu: '0813-1122-4455',
    tmtDiterima: '2023-07-17',
    statusSiswa: 'Aktif',
  },

  // Kelas 1
  {
    id: 'sis-21',
    nisn: '0171122334',
    nis: '2026001',
    nama: 'Arsakha Virendra Pratama',
    jenisKelamin: 'L',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2017-06-18',
    agama: 'Islam',
    kelas: 1,
    rombel: 'A',
    namaAyah: 'Ferry Irawan',
    namaIbu: 'Novita Sari',
    alamat: 'Dsn. Kedungringin RT.02 RW.01 Beji',
    noHpOrtu: '0856-4433-2211',
    tmtDiterima: '2024-07-15',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-22',
    nisn: '0172233445',
    nis: '2026002',
    nama: 'Alula Farzana Ayunindya',
    jenisKelamin: 'P',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2017-03-25',
    agama: 'Islam',
    kelas: 1,
    rombel: 'A',
    namaAyah: 'Dwi Prasetyo',
    namaIbu: 'Yunita Indah',
    alamat: 'Dsn. Kedungringin RT.03 RW.03 Beji',
    noHpOrtu: '0812-7766-5544',
    tmtDiterima: '2024-07-15',
    statusSiswa: 'Aktif',
  },
  {
    id: 'sis-23',
    nisn: '0173344556',
    nis: '2026003',
    nama: 'Muhammad Bilal Al-Ghazi',
    jenisKelamin: 'L',
    tempatLahir: 'Bangil',
    tanggalLahir: '2017-08-14',
    agama: 'Islam',
    kelas: 1,
    rombel: 'A',
    namaAyah: 'Ghazi Maulana',
    namaIbu: 'Siti Rohmah',
    alamat: 'Dsn. Kedungringin RT.01 RW.03 Beji',
    noHpOrtu: '0878-9988-7766',
    tmtDiterima: '2024-07-15',
    statusSiswa: 'Aktif',
  },
];

export const INITIAL_REKAP_RAPOR: RekapRaporSiswa[] = [
  // Siswa Kelas 6 (mempunyai nilai lengkap Semester 7 s.d 12)
  {
    id: 'rr-01',
    siswaId: 'sis-01',
    nisn: '0123847591',
    namaSiswa: 'Muhammad Fadhil Al-Ghifari',
    kelas: 6,
    rombel: 'A',
    semester7: {
      'Pendidikan Agama Islam': 90,
      'Pendidikan Pancasila': 88,
      'Bahasa Indonesia': 86,
      'Matematika': 89,
      'IPAS': 87,
      'Pendidikan Jasmani & Kesehatan': 92,
      'Seni Budaya': 85,
      'Bahasa Jawa': 84,
    },
    semester8: {
      'Pendidikan Agama Islam': 92,
      'Pendidikan Pancasila': 89,
      'Bahasa Indonesia': 88,
      'Matematika': 90,
      'IPAS': 88,
      'Pendidikan Jasmani & Kesehatan': 90,
      'Seni Budaya': 86,
      'Bahasa Jawa': 86,
    },
    semester9: {
      'Pendidikan Agama Islam': 93,
      'Pendidikan Pancasila': 91,
      'Bahasa Indonesia': 90,
      'Matematika': 92,
      'IPAS': 90,
      'Pendidikan Jasmani & Kesehatan': 91,
      'Seni Budaya': 88,
      'Bahasa Jawa': 87,
    },
    semester10: {
      'Pendidikan Agama Islam': 94,
      'Pendidikan Pancasila': 92,
      'Bahasa Indonesia': 92,
      'Matematika': 94,
      'IPAS': 91,
      'Pendidikan Jasmani & Kesehatan': 93,
      'Seni Budaya': 89,
      'Bahasa Jawa': 88,
    },
    semester11: {
      'Pendidikan Agama Islam': 95,
      'Pendidikan Pancasila': 93,
      'Bahasa Indonesia': 93,
      'Matematika': 95,
      'IPAS': 93,
      'Pendidikan Jasmani & Kesehatan': 92,
      'Seni Budaya': 90,
      'Bahasa Jawa': 89,
    },
    semester12: {
      'Pendidikan Agama Islam': 96,
      'Pendidikan Pancasila': 94,
      'Bahasa Indonesia': 94,
      'Matematika': 96,
      'IPAS': 94,
      'Pendidikan Jasmani & Kesehatan': 94,
      'Seni Budaya': 91,
      'Bahasa Jawa': 90,
    },
  },
  {
    id: 'rr-02',
    siswaId: 'sis-02',
    nisn: '0124958102',
    namaSiswa: 'Aisyah Putri Azzahra',
    kelas: 6,
    rombel: 'A',
    semester7: {
      'Pendidikan Agama Islam': 95,
      'Pendidikan Pancasila': 92,
      'Bahasa Indonesia': 94,
      'Matematika': 91,
      'IPAS': 90,
      'Pendidikan Jasmani & Kesehatan': 88,
      'Seni Budaya': 92,
      'Bahasa Jawa': 89,
    },
    semester8: {
      'Pendidikan Agama Islam': 96,
      'Pendidikan Pancasila': 93,
      'Bahasa Indonesia': 95,
      'Matematika': 93,
      'IPAS': 92,
      'Pendidikan Jasmani & Kesehatan': 89,
      'Seni Budaya': 93,
      'Bahasa Jawa': 90,
    },
    semester9: {
      'Pendidikan Agama Islam': 96,
      'Pendidikan Pancasila': 94,
      'Bahasa Indonesia': 96,
      'Matematika': 94,
      'IPAS': 93,
      'Pendidikan Jasmani & Kesehatan': 90,
      'Seni Budaya': 94,
      'Bahasa Jawa': 92,
    },
    semester10: {
      'Pendidikan Agama Islam': 97,
      'Pendidikan Pancasila': 95,
      'Bahasa Indonesia': 96,
      'Matematika': 95,
      'IPAS': 94,
      'Pendidikan Jasmani & Kesehatan': 91,
      'Seni Budaya': 95,
      'Bahasa Jawa': 93,
    },
    semester11: {
      'Pendidikan Agama Islam': 98,
      'Pendidikan Pancasila': 96,
      'Bahasa Indonesia': 97,
      'Matematika': 96,
      'IPAS': 95,
      'Pendidikan Jasmani & Kesehatan': 91,
      'Seni Budaya': 96,
      'Bahasa Jawa': 94,
    },
    semester12: {
      'Pendidikan Agama Islam': 98,
      'Pendidikan Pancasila': 97,
      'Bahasa Indonesia': 98,
      'Matematika': 97,
      'IPAS': 96,
      'Pendidikan Jasmani & Kesehatan': 92,
      'Seni Budaya': 96,
      'Bahasa Jawa': 95,
    },
  },
  {
    id: 'rr-03',
    siswaId: 'sis-03',
    nisn: '0125678912',
    namaSiswa: 'Bintang Raditya Pratama',
    kelas: 6,
    rombel: 'A',
    semester7: {
      'Pendidikan Agama Islam': 86,
      'Pendidikan Pancasila': 85,
      'Bahasa Indonesia': 84,
      'Matematika': 88,
      'IPAS': 86,
      'Pendidikan Jasmani & Kesehatan': 90,
      'Seni Budaya': 82,
      'Bahasa Jawa': 81,
    },
    semester8: {
      'Pendidikan Agama Islam': 87,
      'Pendidikan Pancasila': 86,
      'Bahasa Indonesia': 85,
      'Matematika': 89,
      'IPAS': 87,
      'Pendidikan Jasmani & Kesehatan': 91,
      'Seni Budaya': 83,
      'Bahasa Jawa': 82,
    },
    semester9: {
      'Pendidikan Agama Islam': 88,
      'Pendidikan Pancasila': 87,
      'Bahasa Indonesia': 86,
      'Matematika': 91,
      'IPAS': 88,
      'Pendidikan Jasmani & Kesehatan': 92,
      'Seni Budaya': 85,
      'Bahasa Jawa': 84,
    },
    semester10: {
      'Pendidikan Agama Islam': 89,
      'Pendidikan Pancasila': 88,
      'Bahasa Indonesia': 87,
      'Matematika': 92,
      'IPAS': 89,
      'Pendidikan Jasmani & Kesehatan': 93,
      'Seni Budaya': 86,
      'Bahasa Jawa': 85,
    },
    semester11: {
      'Pendidikan Agama Islam': 90,
      'Pendidikan Pancasila': 89,
      'Bahasa Indonesia': 88,
      'Matematika': 93,
      'IPAS': 90,
      'Pendidikan Jasmani & Kesehatan': 94,
      'Seni Budaya': 87,
      'Bahasa Jawa': 86,
    },
    semester12: {
      'Pendidikan Agama Islam': 91,
      'Pendidikan Pancasila': 90,
      'Bahasa Indonesia': 89,
      'Matematika': 94,
      'IPAS': 91,
      'Pendidikan Jasmani & Kesehatan': 95,
      'Seni Budaya': 88,
      'Bahasa Jawa': 87,
    },
  },
  {
    id: 'rr-04',
    siswaId: 'sis-04',
    nisn: '0126789023',
    namaSiswa: 'Nabila Nur Azizah',
    kelas: 6,
    rombel: 'A',
    semester7: {
      'Pendidikan Agama Islam': 92,
      'Pendidikan Pancasila': 90,
      'Bahasa Indonesia': 91,
      'Matematika': 87,
      'IPAS': 88,
      'Pendidikan Jasmani & Kesehatan': 87,
      'Seni Budaya': 90,
      'Bahasa Jawa': 88,
    },
    semester8: {
      'Pendidikan Agama Islam': 93,
      'Pendidikan Pancasila': 91,
      'Bahasa Indonesia': 92,
      'Matematika': 88,
      'IPAS': 89,
      'Pendidikan Jasmani & Kesehatan': 88,
      'Seni Budaya': 91,
      'Bahasa Jawa': 89,
    },
    semester9: {
      'Pendidikan Agama Islam': 94,
      'Pendidikan Pancasila': 92,
      'Bahasa Indonesia': 93,
      'Matematika': 90,
      'IPAS': 90,
      'Pendidikan Jasmani & Kesehatan': 89,
      'Seni Budaya': 92,
      'Bahasa Jawa': 90,
    },
    semester10: {
      'Pendidikan Agama Islam': 95,
      'Pendidikan Pancasila': 93,
      'Bahasa Indonesia': 94,
      'Matematika': 91,
      'IPAS': 91,
      'Pendidikan Jasmani & Kesehatan': 90,
      'Seni Budaya': 93,
      'Bahasa Jawa': 91,
    },
    semester11: {
      'Pendidikan Agama Islam': 95,
      'Pendidikan Pancasila': 94,
      'Bahasa Indonesia': 95,
      'Matematika': 92,
      'IPAS': 92,
      'Pendidikan Jasmani & Kesehatan': 90,
      'Seni Budaya': 94,
      'Bahasa Jawa': 92,
    },
    semester12: {
      'Pendidikan Agama Islam': 96,
      'Pendidikan Pancasila': 95,
      'Bahasa Indonesia': 95,
      'Matematika': 93,
      'IPAS': 93,
      'Pendidikan Jasmani & Kesehatan': 91,
      'Seni Budaya': 95,
      'Bahasa Jawa': 93,
    },
  },
  {
    id: 'rr-05',
    siswaId: 'sis-05',
    nisn: '0127890134',
    namaSiswa: 'Rifqi Hafizhan Ramadhan',
    kelas: 6,
    rombel: 'A',
    semester7: {
      'Pendidikan Agama Islam': 88,
      'Pendidikan Pancasila': 86,
      'Bahasa Indonesia': 85,
      'Matematika': 86,
      'IPAS': 85,
      'Pendidikan Jasmani & Kesehatan': 89,
      'Seni Budaya': 84,
      'Bahasa Jawa': 83,
    },
    semester8: {
      'Pendidikan Agama Islam': 89,
      'Pendidikan Pancasila': 87,
      'Bahasa Indonesia': 86,
      'Matematika': 87,
      'IPAS': 86,
      'Pendidikan Jasmani & Kesehatan': 90,
      'Seni Budaya': 85,
      'Bahasa Jawa': 84,
    },
    semester9: {
      'Pendidikan Agama Islam': 90,
      'Pendidikan Pancasila': 88,
      'Bahasa Indonesia': 87,
      'Matematika': 88,
      'IPAS': 87,
      'Pendidikan Jasmani & Kesehatan': 91,
      'Seni Budaya': 86,
      'Bahasa Jawa': 85,
    },
    semester10: {
      'Pendidikan Agama Islam': 91,
      'Pendidikan Pancasila': 89,
      'Bahasa Indonesia': 88,
      'Matematika': 89,
      'IPAS': 88,
      'Pendidikan Jasmani & Kesehatan': 92,
      'Seni Budaya': 87,
      'Bahasa Jawa': 86,
    },
    semester11: {
      'Pendidikan Agama Islam': 92,
      'Pendidikan Pancasila': 90,
      'Bahasa Indonesia': 89,
      'Matematika': 90,
      'IPAS': 89,
      'Pendidikan Jasmani & Kesehatan': 92,
      'Seni Budaya': 88,
      'Bahasa Jawa': 87,
    },
    semester12: {
      'Pendidikan Agama Islam': 92,
      'Pendidikan Pancasila': 91,
      'Bahasa Indonesia': 90,
      'Matematika': 91,
      'IPAS': 90,
      'Pendidikan Jasmani & Kesehatan': 93,
      'Seni Budaya': 89,
      'Bahasa Jawa': 88,
    },
  },
  {
    id: 'rr-06',
    siswaId: 'sis-06',
    nisn: '0128901245',
    namaSiswa: 'Theresia Maria Siregar',
    kelas: 6,
    rombel: 'A',
    semester7: {
      'Pendidikan Agama Islam': 89, // Nilai Agama Kristen disesuaikan
      'Pendidikan Pancasila': 88,
      'Bahasa Indonesia': 91,
      'Matematika': 89,
      'IPAS': 88,
      'Pendidikan Jasmani & Kesehatan': 87,
      'Seni Budaya': 90,
      'Bahasa Jawa': 82,
    },
    semester8: {
      'Pendidikan Agama Islam': 90,
      'Pendidikan Pancasila': 89,
      'Bahasa Indonesia': 92,
      'Matematika': 90,
      'IPAS': 89,
      'Pendidikan Jasmani & Kesehatan': 88,
      'Seni Budaya': 91,
      'Bahasa Jawa': 83,
    },
    semester9: {
      'Pendidikan Agama Islam': 91,
      'Pendidikan Pancasila': 90,
      'Bahasa Indonesia': 93,
      'Matematika': 91,
      'IPAS': 90,
      'Pendidikan Jasmani & Kesehatan': 89,
      'Seni Budaya': 92,
      'Bahasa Jawa': 84,
    },
    semester10: {
      'Pendidikan Agama Islam': 92,
      'Pendidikan Pancasila': 91,
      'Bahasa Indonesia': 94,
      'Matematika': 92,
      'IPAS': 91,
      'Pendidikan Jasmani & Kesehatan': 90,
      'Seni Budaya': 93,
      'Bahasa Jawa': 85,
    },
    semester11: {
      'Pendidikan Agama Islam': 93,
      'Pendidikan Pancasila': 92,
      'Bahasa Indonesia': 95,
      'Matematika': 93,
      'IPAS': 92,
      'Pendidikan Jasmani & Kesehatan': 91,
      'Seni Budaya': 94,
      'Bahasa Jawa': 86,
    },
    semester12: {
      'Pendidikan Agama Islam': 94,
      'Pendidikan Pancasila': 93,
      'Bahasa Indonesia': 95,
      'Matematika': 94,
      'IPAS': 93,
      'Pendidikan Jasmani & Kesehatan': 91,
      'Seni Budaya': 95,
      'Bahasa Jawa': 87,
    },
  },
  // Siswa Kelas 5 (memiliki nilai Semester 7 s.d 10)
  {
    id: 'rr-07',
    siswaId: 'sis-07',
    nisn: '0134567890',
    namaSiswa: 'Dimas Arya Pamungkas',
    kelas: 5,
    rombel: 'A',
    semester7: {
      'Pendidikan Agama Islam': 85,
      'Pendidikan Pancasila': 84,
      'Bahasa Indonesia': 86,
      'Matematika': 88,
      'IPAS': 85,
      'Pendidikan Jasmani & Kesehatan': 90,
      'Seni Budaya': 83,
      'Bahasa Jawa': 82,
    },
    semester8: {
      'Pendidikan Agama Islam': 87,
      'Pendidikan Pancasila': 85,
      'Bahasa Indonesia': 87,
      'Matematika': 89,
      'IPAS': 86,
      'Pendidikan Jasmani & Kesehatan': 91,
      'Seni Budaya': 84,
      'Bahasa Jawa': 83,
    },
    semester9: {
      'Pendidikan Agama Islam': 88,
      'Pendidikan Pancasila': 86,
      'Bahasa Indonesia': 88,
      'Matematika': 90,
      'IPAS': 87,
      'Pendidikan Jasmani & Kesehatan': 92,
      'Seni Budaya': 85,
      'Bahasa Jawa': 85,
    },
    semester10: {
      'Pendidikan Agama Islam': 89,
      'Pendidikan Pancasila': 88,
      'Bahasa Indonesia': 89,
      'Matematika': 91,
      'IPAS': 88,
      'Pendidikan Jasmani & Kesehatan': 92,
      'Seni Budaya': 86,
      'Bahasa Jawa': 86,
    },
    semester11: {},
    semester12: {},
  },
  {
    id: 'rr-08',
    siswaId: 'sis-08',
    nisn: '0135678901',
    namaSiswa: 'Salma Khairunnisa',
    kelas: 5,
    rombel: 'A',
    semester7: {
      'Pendidikan Agama Islam': 93,
      'Pendidikan Pancasila': 91,
      'Bahasa Indonesia': 92,
      'Matematika': 90,
      'IPAS': 89,
      'Pendidikan Jasmani & Kesehatan': 88,
      'Seni Budaya': 91,
      'Bahasa Jawa': 87,
    },
    semester8: {
      'Pendidikan Agama Islam': 94,
      'Pendidikan Pancasila': 92,
      'Bahasa Indonesia': 93,
      'Matematika': 91,
      'IPAS': 90,
      'Pendidikan Jasmani & Kesehatan': 89,
      'Seni Budaya': 92,
      'Bahasa Jawa': 88,
    },
    semester9: {
      'Pendidikan Agama Islam': 95,
      'Pendidikan Pancasila': 93,
      'Bahasa Indonesia': 94,
      'Matematika': 92,
      'IPAS': 91,
      'Pendidikan Jasmani & Kesehatan': 90,
      'Seni Budaya': 93,
      'Bahasa Jawa': 89,
    },
    semester10: {
      'Pendidikan Agama Islam': 95,
      'Pendidikan Pancasila': 94,
      'Bahasa Indonesia': 95,
      'Matematika': 93,
      'IPAS': 92,
      'Pendidikan Jasmani & Kesehatan': 90,
      'Seni Budaya': 94,
      'Bahasa Jawa': 90,
    },
    semester11: {},
    semester12: {},
  },
  // Siswa Kelas 4 (memiliki nilai Semester 7 s.d 8)
  {
    id: 'rr-12',
    siswaId: 'sis-12',
    nisn: '0141234567',
    namaSiswa: 'Alif Kurnia Wardhana',
    kelas: 4,
    rombel: 'A',
    semester7: {
      'Pendidikan Agama Islam': 88,
      'Pendidikan Pancasila': 86,
      'Bahasa Indonesia': 87,
      'Matematika': 89,
      'IPAS': 86,
      'Pendidikan Jasmani & Kesehatan': 91,
      'Seni Budaya': 84,
      'Bahasa Jawa': 83,
    },
    semester8: {
      'Pendidikan Agama Islam': 89,
      'Pendidikan Pancasila': 87,
      'Bahasa Indonesia': 88,
      'Matematika': 90,
      'IPAS': 88,
      'Pendidikan Jasmani & Kesehatan': 92,
      'Seni Budaya': 85,
      'Bahasa Jawa': 84,
    },
    semester9: {},
    semester10: {},
    semester11: {},
    semester12: {},
  },
];

export const INITIAL_NILAI_BTQ: NilaiIjazahBTQ[] = [
  {
    id: 'btq-01',
    siswaId: 'sis-01',
    nisn: '0123847591',
    namaSiswa: 'Muhammad Fadhil Al-Ghifari',
    kelas: 6,
    noSertifikat: '421.2/BTQ-001/424.072.24/2026',
    tahsin: 92,
    tajwid: 90,
    tahfidz: 94,
    menulis: 88,
    membaca: 95,
    rataRata: 91.8,
    predikat: 'Mumtaz',
    statusKelulusan: 'Lulus',
    catatan: 'Makhraj huruf fasih, hafal Juz 30 dengan tartil dan tajwid mutqin.',
    tanggalTerbit: '15 Juni 2026',
    penguji: 'Ahmad Muzakki, S.Pd.I',
  },
  {
    id: 'btq-02',
    siswaId: 'sis-02',
    nisn: '0124958102',
    namaSiswa: 'Aisyah Putri Azzahra',
    kelas: 6,
    noSertifikat: '421.2/BTQ-002/424.072.24/2026',
    tahsin: 96,
    tajwid: 95,
    tahfidz: 98,
    menulis: 94,
    membaca: 97,
    rataRata: 96.0,
    predikat: 'Mumtaz',
    statusKelulusan: 'Lulus',
    catatan: 'Sangat istimewa, irama nahawand merdu dan hafalan Al-Qur\'an sangat lancar.',
    tanggalTerbit: '15 Juni 2026',
    penguji: 'Ahmad Muzakki, S.Pd.I',
  },
  {
    id: 'btq-03',
    siswaId: 'sis-03',
    nisn: '0125678912',
    namaSiswa: 'Bintang Raditya Pratama',
    kelas: 6,
    noSertifikat: '421.2/BTQ-003/424.072.24/2026',
    tahsin: 84,
    tajwid: 82,
    tahfidz: 85,
    menulis: 80,
    membaca: 86,
    rataRata: 83.4,
    predikat: 'Jayyid Jiddan',
    statusKelulusan: 'Lulus',
    catatan: 'Bacaan tartil, perlu pendalaman pada hukum ghunnah dan mad jaiz.',
    tanggalTerbit: '15 Juni 2026',
    penguji: 'Ahmad Muzakki, S.Pd.I',
  },
  {
    id: 'btq-04',
    siswaId: 'sis-04',
    nisn: '0126789023',
    namaSiswa: 'Nabila Nur Azizah',
    kelas: 6,
    noSertifikat: '421.2/BTQ-004/424.072.24/2026',
    tahsin: 90,
    tajwid: 88,
    tahfidz: 92,
    menulis: 86,
    membaca: 91,
    rataRata: 89.4,
    predikat: 'Jayyid Jiddan',
    statusKelulusan: 'Lulus',
    catatan: 'Lancar dan tertib, khath naskhi rapi dan tepat kaidah harakat.',
    tanggalTerbit: '15 Juni 2026',
    penguji: 'Ahmad Muzakki, S.Pd.I',
  },
  {
    id: 'btq-05',
    siswaId: 'sis-05',
    nisn: '0127890134',
    namaSiswa: 'Rifqi Hafizhan Ramadhan',
    kelas: 6,
    noSertifikat: '421.2/BTQ-005/424.072.24/2026',
    tahsin: 82,
    tajwid: 80,
    tahfidz: 80,
    menulis: 78,
    membaca: 84,
    rataRata: 80.8,
    predikat: 'Jayyid Jiddan',
    statusKelulusan: 'Lulus',
    catatan: 'Mampu membaca dengan baik, hafalan surat Ad-Dhuha hingga An-Nas lancar.',
    tanggalTerbit: '15 Juni 2026',
    penguji: 'Ahmad Muzakki, S.Pd.I',
  },
  {
    id: 'btq-08',
    siswaId: 'sis-08',
    nisn: '0135678901',
    namaSiswa: 'Salma Khairunnisa',
    kelas: 5,
    noSertifikat: '421.2/BTQ-006/424.072.24/2026',
    tahsin: 93,
    tajwid: 91,
    tahfidz: 92,
    menulis: 89,
    membaca: 94,
    rataRata: 91.8,
    predikat: 'Mumtaz',
    statusKelulusan: 'Lulus',
    catatan: 'Capaian akseleratif kelas 5, sangat mahir dalam tajwid nun mati dan mim.',
    tanggalTerbit: '15 Juni 2026',
    penguji: 'Ahmad Muzakki, S.Pd.I',
  },
];

export const INITIAL_SARPRAS: SarprasItem[] = [
  {
    id: 'srp-01',
    namaSarpras: 'Gedung Ruang Kelas 1 s.d 6 (6 Rombel)',
    kategori: 'Ruang Pembelajaran',
    jumlah: 6,
    satuan: 'Ruang',
    luasM2: 384,
    kondisi: 'Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Dilengkapi meja kursi siswa standar, papan tulis putih, kipas angin, dan proyektor.',
    lokasi: 'Sayap Utara & Selatan Kampus Sekolah',
  },
  {
    id: 'srp-02',
    namaSarpras: 'Perpustakaan "Pelita Ilmu"',
    kategori: 'Ruang Pembelajaran',
    jumlah: 1,
    satuan: 'Ruang',
    luasM2: 72,
    kondisi: 'Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Memiliki koleksi lebih dari 2.500 buku fiksi dan referensi kurikulum merdeka.',
    lokasi: 'Gedung Utama Lantai 1',
  },
  {
    id: 'srp-03',
    namaSarpras: 'Laboratorium Komputer & TIK',
    kategori: 'Ruang Pembelajaran',
    jumlah: 1,
    satuan: 'Ruang',
    luasM2: 64,
    kondisi: 'Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    keterangan: '25 Unit Chromebook bantuan Kemendikbudristek untuk pelaksanaan ANBK.',
    lokasi: 'Sebelah Ruang Guru',
  },
  {
    id: 'srp-04',
    namaSarpras: 'Musholla "Baitul Ilmi"',
    kategori: 'Sanitasi & Ibadah',
    jumlah: 1,
    satuan: 'Ruang',
    luasM2: 60,
    kondisi: 'Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Pusat kegiatan sholat dhuha berjamaah dan praktik pembelajaran BTQ.',
    lokasi: 'Area Barat Dekat Lapangan',
  },
  {
    id: 'srp-05',
    namaSarpras: 'Ruang Kepala Sekolah & Tamu',
    kategori: 'Ruang Penunjang',
    jumlah: 1,
    satuan: 'Ruang',
    luasM2: 36,
    kondisi: 'Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Dilengkapi etalase trofi kejuaraan dan perangkat kerja komputer.',
    lokasi: 'Gedung Depan',
  },
  {
    id: 'srp-06',
    namaSarpras: 'Ruang Guru & Tata Usaha',
    kategori: 'Ruang Penunjang',
    jumlah: 1,
    satuan: 'Ruang',
    luasM2: 54,
    kondisi: 'Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Tempat istirahat dan koordinasi pendidik dilengkapi wifi 100 Mbps.',
    lokasi: 'Gedung Depan',
  },
  {
    id: 'srp-07',
    namaSarpras: 'Ruang UKS (Usaha Kesehatan Sekolah)',
    kategori: 'Ruang Penunjang',
    jumlah: 1,
    satuan: 'Ruang',
    luasM2: 24,
    kondisi: 'Rusak Ringan',
    fotoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Plafon sudut timur bocor saat hujan deras, kasur dan obat P3K lengkap.',
    lokasi: 'Samping Ruang Perpustakaan',
  },
  {
    id: 'srp-08',
    namaSarpras: 'Toilet Siswa & Sanitasi',
    kategori: 'Sanitasi & Ibadah',
    jumlah: 4,
    satuan: 'Pintu',
    luasM2: 20,
    kondisi: 'Rusak Ringan',
    fotoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Keran air 1 unit macet dan kunci grendel pintu nomor 3 perlu penggantian.',
    lokasi: 'Belakang Kelas 3 dan 4',
  },
  {
    id: 'srp-09',
    namaSarpras: 'Gudang Alat Olahraga & Pramuka',
    kategori: 'Ruang Penunjang',
    jumlah: 1,
    satuan: 'Ruang',
    luasM2: 18,
    kondisi: 'Rusak Berat',
    fotoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Atap kayu lapuk termakan rayap dan lantai semen retak parah, perlu rehab DAK.',
    lokasi: 'Pojok Belakang Lapangan',
  },
  {
    id: 'srp-10',
    namaSarpras: 'Lapangan Serbaguna (Upacara & Voli)',
    kategori: 'Fasilitas Terbuka',
    jumlah: 1,
    satuan: 'Area',
    luasM2: 450,
    kondisi: 'Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    keterangan: 'Lantai semen cor halus, tiang bendera permanen, dan garis lapangan voli.',
    lokasi: 'Tengah Halaman Kampus Sekolah',
  },
];

export const INITIAL_SURAT_KELUAR: SuratKeluar[] = [
  {
    id: 'sk-01',
    nomorSurat: '421.2/045/424.072.24/2026',
    tanggalSurat: '2026-03-02',
    perihal: 'Surat Keterangan Masih Aktif Sekolah',
    jenisSurat: 'keterangan_siswa',
    tujuan: 'Orang Tua Siswa (Muhammad Fadhil Al-Ghifari)',
    ringkasan: 'Menerangkan bahwa siswa an. Muhammad Fadhil Al-Ghifari benar-benar siswa aktif Kelas 6 untuk pengurusan beasiswa PIP.',
    pejabatNip: '19740512 199803 2 004',
    status: 'Ditandatangani',
  },
  {
    id: 'sk-02',
    nomorSurat: '421.2/048/424.072.24/2026',
    tanggalSurat: '2026-03-10',
    perihal: 'Surat Tugas Mengikuti Bimtek Kurikulum Merdeka',
    jenisSurat: 'surat_tugas',
    tujuan: 'Dewi Lestari, S.Pd.',
    ringkasan: 'Penugasan guru kelas 4 untuk mengikuti Workshop Peningkatan Kompetensi Numerasi di Korwil Bidang Pendidikan Beji.',
    pejabatNip: '19740512 199803 2 004',
    status: 'Terkirim',
  },
  {
    id: 'sk-03',
    nomorSurat: '005/052/424.072.24/2026',
    tanggalSurat: '2026-03-18',
    perihal: 'Undangan Rapat Komite dan Sosialisasi Ujian Sekolah',
    jenisSurat: 'undangan',
    tujuan: 'Wali Murid Siswa Kelas 6',
    ringkasan: 'Mengundang seluruh orang tua/wali murid kelas 6 dalam rangka persiapan Ujian Sekolah dan Wisuda BTQ.',
    pejabatNip: '19740512 199803 2 004',
    status: 'Terkirim',
  },
];

export const INITIAL_SURAT_MASUK: SuratMasuk[] = [
  {
    id: 'sm-01',
    nomorAgenda: 'AGD/2026/089',
    nomorSuratMasuk: '420/1205/424.072/2026',
    tanggalSurat: '2026-02-20',
    tanggalDiterima: '2026-02-23',
    pengirim: 'Dinas Pendidikan dan Kebudayaan Kab. Pasuruan',
    perihal: 'Verifikasi Data Calon Peserta Asesmen Nasional (ANBK) SD Tahun 2026',
    lampiran: '1 Berkas',
    disposisiKepsek: 'Kepada Operator Sekolah (Sdr. Rizky), segera sinkronkan BIO-AN dan pastikan data NISN valid sebelum 15 Maret 2026.',
    ditujukanKepada: 'Operator Sekolah & Guru Kelas 5',
    statusDisposisi: 'Selesai',
  },
  {
    id: 'sm-02',
    nomorAgenda: 'AGD/2026/094',
    nomorSuratMasuk: '421.2/088/Beji/2026',
    tanggalSurat: '2026-03-01',
    tanggalDiterima: '2026-03-03',
    pengirim: 'Puskesmas Beji',
    perihal: 'Pelaksanaan Bulan Imunisasi Anak Sekolah (BIAS) dan Pemeriksaan Gigi',
    lampiran: '-',
    disposisiKepsek: 'Kepada Tim UKS & Guru Kelas 1-2, siapkan daftar siswa dan ruang UKS pada tanggal 25 Maret 2026.',
    ditujukanKepada: 'Pembina UKS',
    statusDisposisi: 'Proses Tindak Lanjut',
  },
  {
    id: 'sm-03',
    nomorAgenda: 'AGD/2026/102',
    nomorSuratMasuk: '441/310/Kec.Beji/2026',
    tanggalSurat: '2026-03-12',
    tanggalDiterima: '2026-03-14',
    pengirim: 'Kecamatan Beji',
    perihal: 'Peringatan Hari Pramuka dan Festival Tari Daerah Pelajar Pasuruan',
    lampiran: 'Petunjuk Teknis',
    disposisiKepsek: 'Guru PJOK & Pembina Pramuka, seleksi siswa berpotensi untuk regu pramuka penggalang.',
    ditujukanKepada: 'Fajar Eko Prasetyo, S.Pd.',
    statusDisposisi: 'Belum Disposisi',
  },
];

// Master Template Google Docs texts
export const GOOGLE_DOCS_SURAT_TEMPLATE = `PEMERINTAH KABUPATEN PASURUAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
KOORDINATOR WILAYAH PENDIDIKAN KECAMATAN BEJI
SEKOLAH DASAR NEGERI KEDUNGRINGIN 1 BEJI
NPSN: 20519183 | NSS: 101051507001 | Akreditasi: A
Alamat: Dusun Kedungringin RT.02/RW.03, Desa Kedungringin, Kec. Beji, Kab. Pasuruan 67154
Email: sdnkedungringin1beji@gmail.com | Website: https://sdnkedungringin1beji.sch.id
================================================================================

                                {{judul_surat}}
                         Nomor: {{nomor_surat}}

Yang bertanda tangan di bawah ini:
Nama                  : {{pejabat_nama}}
NIP                   : {{pejabat_nip}}
Pangkat / Gol. Ruang  : {{pejabat_pangkat}}
Jabatan               : Kepala SDN Kedungringin 1 Beji

Dengan ini menerangkan dengan sesungguhnya bahwa:
Nama Lengkap          : {{nama_subjek}}
NISN / NIP            : {{identitas_subjek}}
Kelas / Jabatan       : {{posisi_subjek}}
Tempat, Tanggal Lahir : {{ttl_subjek}}
Alamat                : {{alamat_subjek}}

{{isi_keterangan_utama}}

Demikian surat ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya bagi yang berkepentingan.


                                            Dikeluarkan di : Pasuruan
                                            Pada tanggal   : {{tanggal_surat}}

                                            Kepala SDN Kedungringin 1 Beji,
                                            
                                            
                                            
                                            {{pejabat_nama}}
                                            NIP. {{pejabat_nip}}`;

export const GOOGLE_DOCS_BTQ_TEMPLATE = `================================================================================
                 PEMERINTAH KABUPATEN PASURUAN
               DINAS PENDIDIKAN DAN KEBUDAYAAN
           SEKOLAH DASAR NEGERI KEDUNGRINGIN 1 BEJI
================================================================================
                        IJAZAH / SERTIFIKAT
                     BACA TULIS AL-QUR'AN (BTQ)
                   Nomor: {{nomor_sertifikat}}

Kepala SDN Kedungringin 1 Beji menerangkan bahwa:

Nama Lengkap          : {{nama_siswa}}
Nomor Induk Siswa Nas.: {{nisn}}
Kelas / Rombel        : {{kelas}}
Tempat, Tanggal Lahir : {{ttl}}
Sekolah Asal          : SDN Kedungringin 1 Beji

Telah Mengikuti Ujian Standarisasi Baca Tulis Al-Qur'an (BTQ)
dan Dinyatakan: {{status_kelulusan}}
dengan Predikat: {{predikat}}

Rincian Nilai Capaian Kompetensi:
--------------------------------------------------------------------------------
No. | Komponen Penilaian             | Skor (0-100) | Huruf
--------------------------------------------------------------------------------
 1. | Tahsin (Makharijul Huruf)      | {{tahsin}}   | {{tahsin_terbilang}}
 2. | Tajwid (Hukum Bacaan Al-Qur'an)| {{tajwid}}   | {{tajwid_terbilang}}
 3. | Tahfidz (Hafalan Juz 30)       | {{tahfidz}}  | {{tahfidz_terbilang}}
 4. | Menulis (Khat & Imla' Arab)    | {{menulis}}  | {{menulis_terbilang}}
 5. | Membaca (Tartil & Fashahah)    | {{membaca}}  | {{membaca_terbilang}}
--------------------------------------------------------------------------------
    | Rata-rata Kumulatif            | {{rata_rata}}| {{predikat}}
--------------------------------------------------------------------------------

Catatan Evaluasi Pembimbing:
"{{catatan_pembimbing}}"

                                            Pasuruan, {{tanggal_terbit}}
Mengetahui,
Guru PAI / Penguji BTQ                      Kepala SDN Kedungringin 1 Beji


{{penguji_nama}}                            {{pejabat_nama}}
NIP. {{penguji_nip}}                        NIP. {{pejabat_nip}}`;

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * 1 MASTER SPREADSHEET BACKEND APPS SCRIPT - SIM SDN KEDUNGRINGIN 1 BEJI
 * ==============================================================================
 * Petunjuk Penyiapan Cepat:
 * 1. Buka 1 Spreadsheet Master Anda di Google Sheets.
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script".
 * 3. Hapus seluruh isi Code.gs, lalu TEMPEL seluruh kode script ini.
 * 4. Klik "Deploy" -> "Kelola Deployment" -> "Deployment Baru" -> Pilih "Aplikasi Web" (Web App).
 *    - Akses (Who has access): Pilih "Siapa Saja" (Anyone / Anyone with link).
 * 5. Salin URL Web App yang dihasilkan, lalu tempel ke SIM SDN Kedungringin 1.
 * ==============================================================================
 */

// Konfigurasi ID Spreadsheet (Opsional - Jika script ditempel di dalam sheet, biarkan kosong):
const CONFIG = {
  MASTER_SPREADSHEET_ID: "", // Biarkan kosong jika Script Container-Bound (Ekstensi -> Apps Script)
  DOCS_TEMPLATE_BTQ_ID: "",
  DOCS_TEMPLATE_SURAT_ID: "",
  TARGET_FOLDER_ID: "1cry49dLyjsyXfkGJIARR_PLwUV67t7ur"
};

// Daftar Sheet Resmi dalam 1 Master Spreadsheet
const SHEET_NAMES = {
  PEGAWAI: "Data_Pegawai",
  SISWA: "Data_Siswa",
  RAPOR: "Rekap_Rapor",
  BTQ: "Nilai_BTQ",
  SARPRAS: "Sarpras_Aset",
  SURAT_KELUAR: "Surat_Keluar",
  SURAT_MASUK: "Surat_Masuk",
  PROFIL: "Profil_Sekolah",
  PERANGKAT_AJAR: "Perangkat_Ajar",
  PRESENSI: "Presensi_Faceprint",
  SKP: "E_Kinerja_SKP"
};

/**
 * Mendapatkan referensi 1 Master Spreadsheet aktif
 */
function getMasterSS() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  if (CONFIG.MASTER_SPREADSHEET_ID && CONFIG.MASTER_SPREADSHEET_ID !== "") {
    return SpreadsheetApp.openById(CONFIG.MASTER_SPREADSHEET_ID);
  }
  
  throw new Error("Master Spreadsheet tidak ditemukan. Buka spreadsheet melalui Ekstensi -> Apps Script atau isi CONFIG.MASTER_SPREADSHEET_ID.");
}

/**
 * Handle HTTP GET Request
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  const response = { status: 'success', timestamp: new Date().toISOString() };

  try {
    const ss = getMasterSS();

    if (action === 'ping') {
      response.message = 'Backend 1 Master Spreadsheet SIM SDN Kedungringin 1 AKTIF!';
      response.spreadsheetName = ss.getName();
      response.availableSheets = ss.getSheets().map(s => s.getName());
    } 
    else if (action === 'getAllData') {
      // Tarik seluruh 11 sheet dari 1 Master Spreadsheet dalam 1 pemanggilan
      response.pegawai = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.PEGAWAI));
      response.siswa = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.SISWA));
      response.rapor = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.RAPOR));
      response.btq = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.BTQ));
      response.sarpras = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.SARPRAS));
      response.suratMasuk = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.SURAT_MASUK));
      response.suratKeluar = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.SURAT_KELUAR));
      response.profil = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.PROFIL));
      response.perangkatAjar = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.PERANGKAT_AJAR));
      response.presensi = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.PRESENSI));
      response.skp = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.SKP));

      response.totalPegawai = response.pegawai.length;
      response.totalSiswa = response.siswa.length;
      response.message = 'Seluruh data master SIM berhasil dimuat dari 1 Spreadsheet terpusat.';
    }
    else if (action === 'getPegawai') {
      response.data = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.PEGAWAI));
    }
    else if (action === 'getSiswa') {
      response.data = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.SISWA));
    }
    else if (action === 'getPerangkatAjar') {
      response.data = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.PERANGKAT_AJAR));
    }
    else if (action === 'getPresensi') {
      response.data = getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.PRESENSI));
    }
    else {
      response.message = 'Aksi GET tidak dikenali: ' + action;
    }
  } catch (err) {
    response.status = 'error';
    response.message = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST Request (Penyimpanan & Update ke 1 Master Spreadsheet)
 */
function doPost(e) {
  let requestData = {};
  try {
    requestData = JSON.parse(e.postData.contents);
  } catch (err) {
    requestData = e.parameter || {};
  }

  const action = requestData.action;
  const response = { status: 'success', timestamp: new Date().toISOString() };

  try {
    const ss = getMasterSS();

    if (action === 'savePerangkatAjar') {
      // Simpan Perangkat Ajar AI (ATP, Prota, Promes, Modul Deep Learning, dll)
      let sheet = ss.getSheetByName(SHEET_NAMES.PERANGKAT_AJAR);
      if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAMES.PERANGKAT_AJAR);
        sheet.appendRow([
          'ID', 'Jenis Perangkat', 'Kurikulum', 'Mata Pelajaran', 'Fase', 'Kelas',
          'Semester', 'Elemen CP', 'Nama Guru Pengampu', 'NIP Guru', 'Tanggal Dibuat',
          'Ringkasan Materi', 'Status Validasi'
        ]);
      }

      const p = requestData.payload;
      const rowData = [
        p.id || ('pa-' + Date.now()),
        p.jenisPerangkat || 'Modul Ajar Deep Learning',
        p.kurikulum || 'CP 020 (PAI)',
        p.mapel || 'Pendidikan Agama Islam',
        p.fase || 'Fase C',
        p.kelas || 6,
        p.semester || 1,
        p.elemen || 'Al-Qur\\'an Hadis',
        p.guruNama || 'Wahyudi, S.Pd.I.',
        p.guruNip || '19850712 201001 1 018',
        p.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
        p.ringkasan || 'Perangkat ajar berbasis AI siap cetak A4',
        p.status || 'Disahkan Kepala Sekolah'
      ];

      sheet.appendRow(rowData);
      response.message = 'Perangkat Pembelajaran (' + (p.jenisPerangkat || 'Modul') + ') berhasil disimpan ke Master Spreadsheet.';
    }
    else if (action === 'saveNilaiBTQ') {
      // Rekam nilai Ijazah BTQ
      let sheet = ss.getSheetByName(SHEET_NAMES.BTQ);
      const data = requestData.payload;
      
      const avg = ((Number(data.tahsin) + Number(data.tajwid) + Number(data.tahfidz) + Number(data.menulis) + Number(data.membaca)) / 5).toFixed(1);
      let predikat = 'Kurang';
      if (avg >= 90) predikat = 'Mumtaz';
      else if (avg >= 80) predikat = 'Jayyid Jiddan';
      else if (avg >= 75) predikat = 'Jayyid';
      else if (avg >= 60) predikat = 'Maqbul';

      const rowData = [
        data.id || ('btq-' + Date.now()),
        "'" + data.nisn,
        data.namaSiswa,
        data.noSertifikat,
        data.tahsin,
        data.tajwid,
        data.tahfidz,
        data.menulis,
        data.membaca,
        avg,
        predikat
      ];

      const existingRow = findRowIndexByColumn(sheet, 2, data.nisn);
      if (existingRow > 0) {
        sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
        response.message = 'Nilai BTQ siswa ' + data.namaSiswa + ' diperbarui.';
      } else {
        sheet.appendRow(rowData);
        response.message = 'Nilai BTQ siswa ' + data.namaSiswa + ' berhasil disimpan.';
      }

      response.data = { rataRata: avg, predikat: predikat };
    }
    else if (action === 'saveSuratKeluar') {
      let sheet = ss.getSheetByName(SHEET_NAMES.SURAT_KELUAR);
      const s = requestData.payload;
      sheet.appendRow([
        s.id || ('sk-' + Date.now()),
        s.nomorSurat,
        s.tanggalSurat,
        s.perihal,
        s.tujuan,
        s.pejabatNip || '-',
        s.status || 'Terkirim'
      ]);
      response.message = 'Surat keluar berhasil dicatat di Master Spreadsheet.';
    }
    else if (action === 'savePresensiFaceprint') {
      let sheet = ss.getSheetByName(SHEET_NAMES.PRESENSI);
      const f = requestData.payload;
      sheet.appendRow([
        f.id || ('fp-' + Date.now()),
        f.pegawaiId || '-',
        "'" + (f.nip || '-'),
        f.nama || '-',
        f.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
        f.jamMasuk || '06:50:00',
        f.jamPulang || '14:15:00',
        f.mesinId || 'FP-SDNKDR1-BEJI-01',
        f.statusKehadiran || 'Hadir Tepat Waktu',
        f.keterlambatanMenit || 0,
        f.efektifJamKerja || 7.5,
        f.verifikasi || 'Face Recognition Biometrik 99.8%'
      ]);
      response.message = 'Log presensi biometrik berhasil disimpan.';
    }
    else {
      response.message = 'Aksi POST tidak didukung: ' + action;
    }
  } catch (err) {
    response.status = 'error';
    response.message = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper: Ambil data Sheet sebagai Array of Objects
 */
function getSheetDataAsObjects(sheet) {
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  const results = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    results.push(obj);
  }
  return results;
}

/**
 * Helper: Cari nomor baris berdasarkan nilai kolom tertentu
 */
function findRowIndexByColumn(sheet, colIndex, valueToMatch) {
  if (!sheet) return -1;
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][colIndex - 1]).trim() === String(valueToMatch).trim()) {
      return i + 1;
    }
  }
  return -1;
}
`;
