import { 
  BukuPerpustakaan, 
  PeminjamanBuku, 
  AnggotaPerpustakaan, 
  PengunjungPerpustakaan, 
  RuangKelasDetail 
} from '../types';

export const INITIAL_BUKU_PERPUSTAKAAN: BukuPerpustakaan[] = [
  {
    id: 'bk-01',
    kodeBuku: 'B-KMR-01',
    isbn: '978-602-244-301-8',
    judul: 'Bahasa Indonesia: Bergerak Bersama Kelas 5',
    pengarang: 'Evy Verawaty, Zulqarnain',
    penerbit: 'Pusat Perbukuan Kemendikbudristek',
    tahunTerbit: 2022,
    kategori: 'Kurikulum Merdeka',
    jumlahEksemplar: 35,
    jumlahTersedia: 28,
    rakLokasi: 'Rak A-01 (Buku Teks)',
    kondisi: 'Baik',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    sinopsis: 'Buku teks utama siswa mata pelajaran Bahasa Indonesia jenjang SD Kelas V Kurikulum Merdeka.'
  },
  {
    id: 'bk-02',
    kodeBuku: 'B-KMR-02',
    isbn: '978-602-244-657-6',
    judul: 'Ilmu Pengetahuan Alam dan Sosial (IPAS) Kelas 6',
    pengarang: 'Amalia Fitri, dkk',
    penerbit: 'Kementerian Pendidikan dan Kebudayaan',
    tahunTerbit: 2022,
    kategori: 'Kurikulum Merdeka',
    jumlahEksemplar: 32,
    jumlahTersedia: 25,
    rakLokasi: 'Rak A-02 (Buku Teks)',
    kondisi: 'Baik',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=400&q=80',
    sinopsis: 'Membimbing siswa memahami konsep sains, fenomena alam, tata surya, dan dinamika sosial masyarakat.'
  },
  {
    id: 'bk-03',
    kodeBuku: 'B-KMR-03',
    isbn: '978-602-244-802-0',
    judul: 'Matematika: Belajar Bersama Temanmu Kelas 4',
    pengarang: 'Tim Gakko Tosho',
    penerbit: 'Pusat Perbukuan Kemendikbudristek',
    tahunTerbit: 2021,
    kategori: 'Kurikulum Merdeka',
    jumlahEksemplar: 30,
    jumlahTersedia: 22,
    rakLokasi: 'Rak A-03 (Buku Teks)',
    kondisi: 'Baik',
    coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',
    sinopsis: 'Pendekatan matematis kontekstual berstandar internasional yang disesuaikan kurikulum Indonesia.'
  },
  {
    id: 'bk-04',
    kodeBuku: 'B-FIK-01',
    isbn: '978-979-407-167-0',
    judul: 'Cerita Rakyat Nusantara: Legenda Candi Prambanan & Roro Jonggrang',
    pengarang: 'M. Rahmat',
    penerbit: 'Balai Pustaka',
    tahunTerbit: 2020,
    kategori: 'Buku Bacaan / Fiksi',
    jumlahEksemplar: 8,
    jumlahTersedia: 6,
    rakLokasi: 'Rak B-01 (Fiksi Anak)',
    kondisi: 'Baik',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    sinopsis: 'Kisah klasik legenda nusantara sarat nilai budi pekerti, kesetiaan, dan sejarah peradaban masa lampau.'
  },
  {
    id: 'bk-05',
    kodeBuku: 'B-FIK-02',
    isbn: '978-602-03-2412-1',
    judul: 'Petualangan Kancil yang Cerdik dan Sahabat Hutan',
    pengarang: 'Bambang Joko',
    penerbit: 'Gramedia Pustaka Utama',
    tahunTerbit: 2021,
    kategori: 'Buku Bacaan / Fiksi',
    jumlahEksemplar: 10,
    jumlahTersedia: 7,
    rakLokasi: 'Rak B-02 (Fiksi Anak)',
    kondisi: 'Baik',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
    sinopsis: 'Dongeng fabel inspiratif yang mengajarkan pentingnya gotong royong dan kecerdikan yang berakhlak.'
  },
  {
    id: 'bk-06',
    kodeBuku: 'B-REF-01',
    isbn: '978-979-065-219-5',
    judul: 'Kamus Besar Bahasa Indonesia (KBBI) Edisi Pelajar',
    pengarang: 'Badan Pengembangan dan Pembinaan Bahasa',
    penerbit: 'Balai Pustaka',
    tahunTerbit: 2019,
    kategori: 'Referensi & Kamus',
    jumlahEksemplar: 5,
    jumlahTersedia: 5,
    rakLokasi: 'Rak C-01 (Referensi)',
    kondisi: 'Baik',
    coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80',
    sinopsis: 'Rujukan kosakata baku resmi bahasa Indonesia yang disesuaikan untuk pelajar tingkat dasar dan menengah.'
  },
  {
    id: 'bk-07',
    kodeBuku: 'B-SNS-01',
    isbn: '978-602-424-712-9',
    judul: 'Ensiklopedia Cilik: Menjelajah Galaksi dan Planet Bima Sakti',
    pengarang: 'Dr. Surya Gemilang',
    penerbit: 'Mizan Anak Pintar',
    tahunTerbit: 2022,
    kategori: 'Sains & Teknologi',
    jumlahEksemplar: 6,
    jumlahTersedia: 4,
    rakLokasi: 'Rak D-01 (Sains)',
    kondisi: 'Baik',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    sinopsis: 'Visual 3D dan penjelasan seru tentang matahari, bumi, bintang, dan penjelajahan astronaut masa depan.'
  },
  {
    id: 'bk-08',
    kodeBuku: 'B-AGM-01',
    isbn: '978-602-7890-44-1',
    judul: 'Kisah Teladan 25 Nabi dan Rasul Berakhlak Karimah',
    pengarang: 'Ustadz Ahmad Al-Farisi',
    penerbit: 'Gema Insani Press',
    tahunTerbit: 2021,
    kategori: 'Agama & Budi Pekerti',
    jumlahEksemplar: 12,
    jumlahTersedia: 9,
    rakLokasi: 'Rak E-01 (Agama)',
    kondisi: 'Baik',
    coverUrl: 'https://images.unsplash.com/photo-1584281722573-952445e9999a?auto=format&fit=crop&w=400&q=80',
    sinopsis: 'Buku panduan sejarah nabawiyah dengan bahasa ramah anak dan ilustrasi nilai perjuangan mulia.'
  },
  {
    id: 'bk-09',
    kodeBuku: 'B-MLK-01',
    isbn: '978-602-5432-88-2',
    judul: 'Gladhi Basa Jawa Gagrag Anyar Kelas 6',
    pengarang: 'Sutrisno & Bambang Siswanto',
    penerbit: 'Erlangga Jawa Timur',
    tahunTerbit: 2022,
    kategori: 'Muatan Lokal',
    jumlahEksemplar: 30,
    jumlahTersedia: 24,
    rakLokasi: 'Rak F-01 (Muatan Lokal)',
    kondisi: 'Baik',
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80',
    sinopsis: 'Pasinaon Basa Jawa ngrembug unggah-ungguh basa, tembang macapat, parikan, lan aksara Jawa.'
  },
  {
    id: 'bk-10',
    kodeBuku: 'B-MLK-02',
    isbn: '978-602-9988-12-0',
    judul: 'Legenda dan Kearifan Lokal Kabupaten Pasuruan',
    pengarang: 'Dinas Perpustakaan & Kearsipan Pasuruan',
    penerbit: 'Pustaka Daerah Pasuruan',
    tahunTerbit: 2020,
    kategori: 'Muatan Lokal',
    jumlahEksemplar: 10,
    jumlahTersedia: 8,
    rakLokasi: 'Rak F-02 (Muatan Lokal)',
    kondisi: 'Baik',
    coverUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80',
    sinopsis: 'Mengenal asal-usul Beji, Danau Ranu Grati, Bromo Tengger Semeru, dan sejarah kebudayaan Pasuruan.'
  }
];

export const INITIAL_ANGGOTA_PERPUSTAKAAN: AnggotaPerpustakaan[] = [
  {
    id: 'agt-01',
    nomorAnggota: 'LIB-SDN1-001',
    nama: 'Muhammad Fadhil Al-Ghifari',
    tipe: 'Siswa',
    nisnOrNip: '0123847591',
    kelasOrUnit: 'Kelas 6A',
    jenisKelamin: 'L',
    tanggalDaftar: '2021-07-15',
    status: 'Aktif',
    jumlahPinjamanAktif: 1,
    fotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'agt-02',
    nomorAnggota: 'LIB-SDN1-002',
    nama: 'Aisyah Putri Azzahra',
    tipe: 'Siswa',
    nisnOrNip: '0124958102',
    kelasOrUnit: 'Kelas 6A',
    jenisKelamin: 'P',
    tanggalDaftar: '2021-07-15',
    status: 'Aktif',
    jumlahPinjamanAktif: 1,
    fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'agt-03',
    nomorAnggota: 'LIB-SDN1-003',
    nama: 'Bintang Raditya Pratama',
    tipe: 'Siswa',
    nisnOrNip: '0125678912',
    kelasOrUnit: 'Kelas 6A',
    jenisKelamin: 'L',
    tanggalDaftar: '2021-07-15',
    status: 'Aktif',
    jumlahPinjamanAktif: 0,
    fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'agt-04',
    nomorAnggota: 'LIB-SDN1-004',
    nama: 'Nabila Nur Azizah',
    tipe: 'Siswa',
    nisnOrNip: '0126789023',
    kelasOrUnit: 'Kelas 6A',
    jenisKelamin: 'P',
    tanggalDaftar: '2021-07-15',
    status: 'Aktif',
    jumlahPinjamanAktif: 0
  },
  {
    id: 'agt-05',
    nomorAnggota: 'LIB-SDN1-005',
    nama: 'Rifqi Hafizhan Ramadhan',
    tipe: 'Siswa',
    nisnOrNip: '0127890134',
    kelasOrUnit: 'Kelas 6A',
    jenisKelamin: 'L',
    tanggalDaftar: '2021-07-15',
    status: 'Aktif',
    jumlahPinjamanAktif: 0
  },
  {
    id: 'agt-06',
    nomorAnggota: 'LIB-SDN1-006',
    nama: 'Salma Khairunnisa',
    tipe: 'Siswa',
    nisnOrNip: '0135678901',
    kelasOrUnit: 'Kelas 5A',
    jenisKelamin: 'P',
    tanggalDaftar: '2022-07-18',
    status: 'Aktif',
    jumlahPinjamanAktif: 1
  },
  {
    id: 'agt-07',
    nomorAnggota: 'LIB-GUR-001',
    nama: 'Ahmad Muzakki, S.Pd.I',
    tipe: 'Guru',
    nisnOrNip: '19820315 200902 1 003',
    kelasOrUnit: 'Guru PAI & Pembina Perpus',
    jenisKelamin: 'L',
    tanggalDaftar: '2019-01-10',
    status: 'Aktif',
    jumlahPinjamanAktif: 0
  },
  {
    id: 'agt-08',
    nomorAnggota: 'LIB-GUR-002',
    nama: 'Fajar Eko Prasetyo, S.Pd.',
    tipe: 'Guru',
    nisnOrNip: '19951205 202321 1 004',
    kelasOrUnit: 'Guru PJOK',
    jenisKelamin: 'L',
    tanggalDaftar: '2023-05-02',
    status: 'Aktif',
    jumlahPinjamanAktif: 1
  }
];

export const INITIAL_PEMINJAMAN_BUKU: PeminjamanBuku[] = [
  {
    id: 'pinjam-01',
    kodePeminjaman: 'TRX-2024-0012',
    bukuId: 'bk-01',
    kodeBuku: 'B-KMR-01',
    judulBuku: 'Bahasa Indonesia: Bergerak Bersama Kelas 5',
    anggotaId: 'agt-06',
    namaPeminjam: 'Salma Khairunnisa',
    jenisPeminjam: 'Siswa',
    kelas: 'Kelas 5A',
    tanggalPinjam: '2024-10-10',
    batasKembali: '2024-10-17',
    status: 'Dipinjam',
    keterangan: 'Peminjaman untuk tugas kelompok menulis pantun dan puisi.'
  },
  {
    id: 'pinjam-02',
    kodePeminjaman: 'TRX-2024-0013',
    bukuId: 'bk-07',
    kodeBuku: 'B-SNS-01',
    judulBuku: 'Ensiklopedia Cilik: Menjelajah Galaksi dan Planet Bima Sakti',
    anggotaId: 'agt-01',
    namaPeminjam: 'Muhammad Fadhil Al-Ghifari',
    jenisPeminjam: 'Siswa',
    kelas: 'Kelas 6A',
    tanggalPinjam: '2024-10-12',
    batasKembali: '2024-10-19',
    status: 'Dipinjam',
    keterangan: 'Persiapan materi pengayaan TKA bidang IPA.'
  },
  {
    id: 'pinjam-03',
    kodePeminjaman: 'TRX-2024-0014',
    bukuId: 'bk-04',
    kodeBuku: 'B-FIK-01',
    judulBuku: 'Cerita Rakyat Nusantara: Legenda Candi Prambanan & Roro Jonggrang',
    anggotaId: 'agt-02',
    namaPeminjam: 'Aisyah Putri Azzahra',
    jenisPeminjam: 'Siswa',
    kelas: 'Kelas 6A',
    tanggalPinjam: '2024-10-11',
    batasKembali: '2024-10-18',
    status: 'Dipinjam',
    keterangan: 'Literasi 15 menit sebelum pembelajaran pagi.'
  },
  {
    id: 'pinjam-04',
    kodePeminjaman: 'TRX-2024-0010',
    bukuId: 'bk-03',
    kodeBuku: 'B-KMR-03',
    judulBuku: 'Matematika: Belajar Bersama Temanmu Kelas 4',
    anggotaId: 'agt-03',
    namaPeminjam: 'Bintang Raditya Pratama',
    jenisPeminjam: 'Siswa',
    kelas: 'Kelas 6A',
    tanggalPinjam: '2024-10-01',
    batasKembali: '2024-10-08',
    tanggalKembali: '2024-10-07',
    status: 'Dikembalikan',
    keterangan: 'Kembali tepat waktu dalam kondisi sangat baik.'
  },
  {
    id: 'pinjam-05',
    kodePeminjaman: 'TRX-2024-0008',
    bukuId: 'bk-10',
    kodeBuku: 'B-MLK-02',
    judulBuku: 'Legenda dan Kearifan Lokal Kabupaten Pasuruan',
    anggotaId: 'agt-08',
    namaPeminjam: 'Fajar Eko Prasetyo, S.Pd.',
    jenisPeminjam: 'Guru',
    kelas: 'Dewan Guru',
    tanggalPinjam: '2024-10-05',
    batasKembali: '2024-10-19',
    status: 'Dipinjam',
    keterangan: 'Rujukan pembelajaran muatan lokal PJOK permainan tradisional daerah.'
  }
];

export const INITIAL_PENGUNJUNG_PERPUSTAKAAN: PengunjungPerpustakaan[] = [
  {
    id: 'vis-01',
    tanggal: '2024-10-14',
    jam: '08:15',
    nama: 'Muhammad Fadhil Al-Ghifari',
    tipe: 'Siswa',
    kelasOrUnit: 'Kelas 6A',
    keperluan: 'Peminjaman / Pengembalian'
  },
  {
    id: 'vis-02',
    tanggal: '2024-10-14',
    jam: '09:30',
    nama: 'Aisyah Putri Azzahra',
    tipe: 'Siswa',
    kelasOrUnit: 'Kelas 6A',
    keperluan: 'Membaca di Tempat'
  },
  {
    id: 'vis-03',
    tanggal: '2024-10-14',
    jam: '10:00',
    nama: 'Salma Khairunnisa',
    tipe: 'Siswa',
    kelasOrUnit: 'Kelas 5A',
    keperluan: 'Literasi Digital'
  },
  {
    id: 'vis-04',
    tanggal: '2024-10-14',
    jam: '11:15',
    nama: 'Nurul Hidayati, S.Pd.',
    tipe: 'Guru',
    kelasOrUnit: 'Guru Kelas 3',
    keperluan: 'Peminjaman / Pengembalian'
  },
  {
    id: 'vis-05',
    tanggal: '2024-10-13',
    jam: '09:00',
    nama: 'Bintang Raditya Pratama',
    tipe: 'Siswa',
    kelasOrUnit: 'Kelas 6A',
    keperluan: 'Diskusi / Tugas Kelompok'
  }
];

export const INITIAL_RUANG_KELAS: RuangKelasDetail[] = [
  {
    kelas: 1,
    namaRuang: 'Gedung Ruang Kelas 1 (Ki Hajar Dewantara)',
    lokasiGedung: 'Gedung A Lantai 1 Sayap Barat',
    luasM2: 56,
    kapasitasSiswa: 28,
    kondisi: 'Sangat Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    waliKelas: 'Rina Rahmawati, S.Pd.SD',
    nipWaliKelas: '19880914 201903 2 007',
    mottoKelas: 'Ceria, Santun, Rajin, dan Selalu Semangat Belajar!',
    inventaris: {
      mejaSiswa: 14,
      kursiSiswa: 28,
      mejaGuru: 1,
      kursiGuru: 1,
      papanTulis: 'Papan Tulis Putih Magnetik & Pojok Huruf/Angka',
      kipasAtauAc: '2 Unit Kipas Angin Dinding Cosmos',
      pojokBaca: '1 Rak Pojok Baca Anak Bergambar + Karpet Matras',
      proyektor: '1 Unit Smart TV 43 Inci Wall Mount',
      lemariKelas: 1
    },
    strukturOrganisasi: {
      waliKelas: 'Rina Rahmawati, S.Pd.SD',
      nipWaliKelas: '19880914 201903 2 007',
      ketuaKelas: 'Aditya Pratama',
      wakilKetua: 'Kinara Salsabila',
      sekretaris1: 'Zahra Anindya',
      sekretaris2: 'Bagas Ramadhan',
      bendahara1: 'Alifa Khadijah',
      bendahara2: 'Rehan Maulana',
      seksiKebersihan: ['Aditya', 'Kinara', 'Zahra'],
      seksiKeamanan: ['Bagas', 'Rehan', 'Farhan'],
      seksiKeagamaan: ['Alifa', 'Syifa', 'Hafiz'],
      seksiUpacaraDanKerapian: ['Dimas', 'Kirana', 'Wildan']
    },
    jadwalPiket: [
      { hari: 'Senin', petugas: ['Aditya Pratama', 'Kinara Salsabila', 'Alifa Khadijah'], tugasUtama: 'Menyiapkan papan tulis, merapikan meja guru & menyiram tanaman depan kelas.' },
      { hari: 'Selasa', petugas: ['Zahra Anindya', 'Bagas Ramadhan', 'Farhan Kurnia'], tugasUtama: 'Menyapu lantai, membersihkan loker buku & membuang sampah ke tempat pilah.' },
      { hari: 'Rabu', petugas: ['Rehan Maulana', 'Syifa Az-Zahra', 'Hafiz Firdaus'], tugasUtama: 'Mengepel lantai, merapikan pojok baca bergambar & membersihkan jendela.' },
      { hari: 'Kamis', petugas: ['Dimas Anggara', 'Kirana Ayu', 'Wildan Saputra'], tugasUtama: 'Merapikan meja kursi siswa, membersihkan penghapus & memeriksa kebersihan laci.' },
      { hari: 'Jumat', petugas: ['Naura Shafa', 'Rizky Fauzi', 'Aqila Putri'], tugasUtama: 'Jumat Bersih menyeluruh, merapikan perlengkapan ibadah & pojok literasi.' },
      { hari: 'Sabtu', petugas: ['Ilham Bintang', 'Keysha Aurelia', 'Rafi Ahmad'], tugasUtama: 'Sterilisasi ruangan akhir pekan & penataan perlengkapan permainan edukatif.' }
    ],
    jadwalPelajaran: [
      { jamKe: 1, waktu: '07.00 - 07.35', senin: { mapel: 'Upacara Bendera', guru: 'Seluruh Dewan Guru' }, selasa: { mapel: 'Pendidikan Agama Islam (PAI)', guru: 'Ahmad Muzakki, S.Pd.I' }, rabu: { mapel: 'Pendidikan Pancasila (PKn)', guru: 'Rina Rahmawati, S.Pd.SD' }, kamis: { mapel: 'PJOK (Senam Ceria)', guru: 'Fajar Eko Prasetyo, S.Pd.' }, jumat: { mapel: 'Senam Pagi & Karakter', guru: 'Rina Rahmawati, S.Pd.SD' }, sabtu: { mapel: 'Seni Budaya & Prakarya', guru: 'Rina Rahmawati, S.Pd.SD' } },
      { jamKe: 2, waktu: '07.35 - 08.10', senin: { mapel: 'Bahasa Indonesia', guru: 'Rina Rahmawati, S.Pd.SD' }, selasa: { mapel: 'Pendidikan Agama Islam (PAI)', guru: 'Ahmad Muzakki, S.Pd.I' }, rabu: { mapel: 'Pendidikan Pancasila (PKn)', guru: 'Rina Rahmawati, S.Pd.SD' }, kamis: { mapel: 'PJOK', guru: 'Fajar Eko Prasetyo, S.Pd.' }, jumat: { mapel: 'Pendidikan Agama Islam', guru: 'Ahmad Muzakki, S.Pd.I' }, sabtu: { mapel: 'Seni Budaya & Prakarya', guru: 'Rina Rahmawati, S.Pd.SD' } },
      { jamKe: 3, waktu: '08.10 - 08.45', senin: { mapel: 'Bahasa Indonesia', guru: 'Rina Rahmawati, S.Pd.SD' }, selasa: { mapel: 'Bahasa Indonesia (Membaca)', guru: 'Rina Rahmawati, S.Pd.SD' }, rabu: { mapel: 'Matematika (Berhitung)', guru: 'Rina Rahmawati, S.Pd.SD' }, kamis: { mapel: 'Bahasa Indonesia', guru: 'Rina Rahmawati, S.Pd.SD' }, jumat: { mapel: 'Bahasa Jawa (Mulok)', guru: 'Rina Rahmawati, S.Pd.SD' }, sabtu: { mapel: 'Penguatan Profil Pancasila', guru: 'Rina Rahmawati, S.Pd.SD' } },
      { jamKe: 4, waktu: '09.05 - 09.40', senin: { mapel: 'Matematika', guru: 'Rina Rahmawati, S.Pd.SD' }, selasa: { mapel: 'Matematika', guru: 'Rina Rahmawati, S.Pd.SD' }, rabu: { mapel: 'Bahasa Inggris Ceria', guru: 'Tri Handayani, S.Pd.' }, kamis: { mapel: 'Matematika', guru: 'Rina Rahmawati, S.Pd.SD' }, jumat: { mapel: 'Pojok Baca Literasi', guru: 'Rina Rahmawati, S.Pd.SD' }, sabtu: { mapel: 'Pengembangan Bakat', guru: 'Rina Rahmawati, S.Pd.SD' } }
    ],
    lms: [
      {
        id: 'lms-1-01',
        judul: 'Mengenal Bunyi Huruf Vokal dan Huruf Konsonan B, C, D',
        mataPelajaran: 'Bahasa Indonesia',
        tipe: 'Materi / Modul',
        tanggalPosting: '2024-10-14',
        deskripsi: 'Panduan membaca interaktif dengan gambar binatang dan benda di sekitar sekolah.',
        linkSumber: 'https://buku.kemdikbud.go.id/katalog/buku-bahasa-indonesia-kelas-1',
        statusPengumpulan: 'Tersedia untuk Belajar Mandiri di Rumah'
      },
      {
        id: 'lms-1-02',
        judul: 'Tugas Mewarnai dan Menghitung Benda 1 s.d. 10',
        mataPelajaran: 'Matematika',
        tipe: 'Tugas Harian',
        tanggalPosting: '2024-10-13',
        deskripsi: 'Lembar kerja penjumlahan dasar benda nyata (buah apel, pensil, dan buku).',
        statusPengumpulan: '24 dari 26 Siswa Telah Mengumpulkan'
      }
    ],
    refleksi: [
      {
        id: 'ref-1-01',
        tanggal: '2024-10-14',
        mataPelajaran: 'Bahasa Indonesia & Matematika',
        topikBahasan: 'Membaca suku kata "ba-bi-bu-be-bo" dan menghitung jumlah balok kayu',
        pemahamanBaru: 'Anak-anak sangat antusias saat menyusun balok huruf membentuk kata "B-O-L-A" dan "B-U-K-U".',
        kendalaAtauTantangan: 'Beberapa siswa masih tertukar antara huruf b dan d saat menuliskannya di buku tulis bergaris.',
        suasanaBelajar: 'Sangat Menyenangkan 🤩',
        ditulisOleh: 'Aditya Pratama (Ketua Kelas didampingi Wali Kelas)',
        catatanWaliKelas: 'Besok diberikan permainan kartu huruf raba untuk memperkuat daya ingat arah lengkungan huruf b dan d.'
      }
    ]
  },
  {
    kelas: 2,
    namaRuang: 'Gedung Ruang Kelas 2 (R.A. Kartini)',
    lokasiGedung: 'Gedung A Lantai 1 Sayap Timur',
    luasM2: 56,
    kapasitasSiswa: 28,
    kondisi: 'Sangat Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    waliKelas: 'Tri Handayani, S.Pd.',
    nipWaliKelas: '19900315 202012 2 011',
    mottoKelas: 'Hebat, Berani Berbicara, Santun, dan Pantang Menyerah!',
    inventaris: {
      mejaSiswa: 14,
      kursiSiswa: 28,
      mejaGuru: 1,
      kursiGuru: 1,
      papanTulis: 'Papan Tulis Putih Magnetik & Papan Karya Siswa',
      kipasAtauAc: '2 Unit Kipas Angin Dinding Maspion',
      pojokBaca: 'Rak Pojok Baca Tingkat 3 + Aneka Buku Dongeng',
      proyektor: '1 Unit LCD Proyektor + Layar Tarik',
      lemariKelas: 1
    },
    strukturOrganisasi: {
      waliKelas: 'Tri Handayani, S.Pd.',
      nipWaliKelas: '19900315 202012 2 011',
      ketuaKelas: 'Danish Alvaro',
      wakilKetua: 'Nadhira Qaireen',
      sekretaris1: 'Siti Hanifah',
      sekretaris2: 'Galih Wicaksono',
      bendahara1: 'Ayla Azzahra',
      bendahara2: 'Arka Dewantara',
      seksiKebersihan: ['Danish', 'Nadhira', 'Ayla'],
      seksiKeamanan: ['Galih', 'Arka', 'Fathan'],
      seksiKeagamaan: ['Siti Hanifah', 'Raya', 'Ibrahim'],
      seksiUpacaraDanKerapian: ['Zidan', 'Nadia', 'Bima']
    },
    jadwalPiket: [
      { hari: 'Senin', petugas: ['Danish Alvaro', 'Nadhira Qaireen', 'Ayla Azzahra'], tugasUtama: 'Menyiapkan papan tulis & membersihkan debu meja guru.' },
      { hari: 'Selasa', petugas: ['Siti Hanifah', 'Galih Wicaksono', 'Arka Dewantara'], tugasUtama: 'Menyapu lantai kelas & membersihkan teras depan.' },
      { hari: 'Rabu', petugas: ['Fathan Al-Ghazi', 'Raya Shafiyah', 'Ibrahimovic'], tugasUtama: 'Merapikan pojok baca & merapikan lemari buku.' },
      { hari: 'Kamis', petugas: ['Zidan Fahreza', 'Nadia Putri', 'Bima Sakti'], tugasUtama: 'Mengepel lantai & membersihkan kaca jendela.' },
      { hari: 'Jumat', petugas: ['Khadijah Amira', 'Rayhan Malik', 'Tasya Bella'], tugasUtama: 'Operasi semut dan penataan tanaman hias kelas.' },
      { hari: 'Sabtu', petugas: ['Fajar Sidik', 'Annisa Zahra', 'Kenzo Putra'], tugasUtama: 'Pembersihan akhir pekan dan cek perlengkapan kelas.' }
    ],
    jadwalPelajaran: [
      { jamKe: 1, waktu: '07.00 - 07.35', senin: { mapel: 'Upacara Bendera', guru: 'Seluruh Dewan Guru' }, selasa: { mapel: 'Matematika (Pengurangan)', guru: 'Tri Handayani, S.Pd.' }, rabu: { mapel: 'Bahasa Indonesia', guru: 'Tri Handayani, S.Pd.' }, kamis: { mapel: 'PJOK', guru: 'Fajar Eko Prasetyo, S.Pd.' }, jumat: { mapel: 'Senam Sehat & PAI', guru: 'Ahmad Muzakki, S.Pd.I' }, sabtu: { mapel: 'Seni Rupa & Keterampilan', guru: 'Tri Handayani, S.Pd.' } },
      { jamKe: 2, waktu: '07.35 - 08.10', senin: { mapel: 'Pendidikan Pancasila', guru: 'Tri Handayani, S.Pd.' }, selasa: { mapel: 'Matematika', guru: 'Tri Handayani, S.Pd.' }, rabu: { mapel: 'Bahasa Indonesia', guru: 'Tri Handayani, S.Pd.' }, kamis: { mapel: 'PJOK', guru: 'Fajar Eko Prasetyo, S.Pd.' }, jumat: { mapel: 'PAI & Budi Pekerti', guru: 'Ahmad Muzakki, S.Pd.I' }, sabtu: { mapel: 'Bahasa Jawa (Mulok)', guru: 'Tri Handayani, S.Pd.' } }
    ],
    lms: [
      {
        id: 'lms-2-01',
        judul: 'Cerita Fabel: Persahabatan Lebah dan Semut Pekerja Keras',
        mataPelajaran: 'Bahasa Indonesia',
        tipe: 'Materi / Modul',
        tanggalPosting: '2024-10-12',
        deskripsi: 'Menemukan pesan moral gotong royong dan sikap tolong-menolong sesama teman.',
        statusPengumpulan: 'Bahan Bacaan Kelas'
      }
    ],
    refleksi: [
      {
        id: 'ref-2-01',
        tanggal: '2024-10-14',
        mataPelajaran: 'Matematika',
        topikBahasan: 'Pengurangan teknik meminjam puluhan',
        pemahamanBaru: 'Siswa mulai memahami cara menukar satu puluhan menjadi 10 satuan dengan media lidi.',
        kendalaAtauTantangan: 'Perlu penguatan konsep saat angka satuan di atas lebih kecil dari pengurangnya.',
        suasanaBelajar: 'Senang & Paham 😊',
        ditulisOleh: 'Danish Alvaro (Ketua Kelas 2)',
        catatanWaliKelas: 'Lanjutkan dengan latihan bertahap menggunakan media stik es krim warna-warni.'
      }
    ]
  },
  {
    kelas: 3,
    namaRuang: 'Gedung Ruang Kelas 3 (Pangeran Diponegoro)',
    lokasiGedung: 'Gedung B Lantai 1 Sayap Utara',
    luasM2: 60,
    kapasitasSiswa: 30,
    kondisi: 'Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    waliKelas: 'Nurul Hidayati, S.Pd.',
    nipWaliKelas: '19940722 202221 2 009',
    mottoKelas: 'Disiplin, Berani Mencoba, Gotong Royong Meraih Prestasi!',
    inventaris: {
      mejaSiswa: 15,
      kursiSiswa: 30,
      mejaGuru: 1,
      kursiGuru: 1,
      papanTulis: 'Papan Tulis Putih Keramik & Papan Pengumuman',
      kipasAtauAc: '2 Kipas Angin Dinding KDK',
      pojokBaca: 'Rak Buku Tingkat + Karpet Puzzle Edukasi',
      proyektor: '1 Unit Smart TV 50 Inci',
      lemariKelas: 1
    },
    strukturOrganisasi: {
      waliKelas: 'Nurul Hidayati, S.Pd.',
      nipWaliKelas: '19940722 202221 2 009',
      ketuaKelas: 'Rafiandra Putra',
      wakilKetua: 'Anindita Keisha',
      sekretaris1: 'Fathir Ahmad',
      sekretaris2: 'Clara Bella',
      bendahara1: 'Mikaela Salsabila',
      bendahara2: 'Zaki Mubarak',
      seksiKebersihan: ['Rafiandra', 'Anindita', 'Clara'],
      seksiKeamanan: ['Fathir', 'Zaki', 'Gilang'],
      seksiKeagamaan: ['Mikaela', 'Fatimah', 'Hanan'],
      seksiUpacaraDanKerapian: ['Teguh', 'Alya', 'Rendy']
    },
    jadwalPiket: [
      { hari: 'Senin', petugas: ['Rafiandra Putra', 'Anindita Keisha', 'Fathir Ahmad'], tugasUtama: 'Menata meja guru & menyiapkan spidol boardmarker.' },
      { hari: 'Selasa', petugas: ['Clara Bella', 'Mikaela Salsabila', 'Zaki Mubarak'], tugasUtama: 'Menyapu lantai kelas & membersihkan papan tulis.' },
      { hari: 'Rabu', petugas: ['Gilang Ramadhan', 'Fatimah Az-Zahra', 'Hanan Al-Fatih'], tugasUtama: 'Mengepel dan merapikan buku perpustakaan mini.' },
      { hari: 'Kamis', petugas: ['Teguh Prasetyo', 'Alya Safitri', 'Rendy Bagus'], tugasUtama: 'Menyiram pot tanaman gantung depan kelas.' },
      { hari: 'Jumat', petugas: ['Nia Ramadhani', 'Bayu Anggoro', 'Citra Kirana'], tugasUtama: 'Jumat Bersih & sterilisasi gagang pintu kelas.' },
      { hari: 'Sabtu', petugas: ['Fajar Shodiq', 'Salsabila Putri', 'Arkan Danu'], tugasUtama: 'Menutup tirai kelas & mematikan saklar listrik akhir pekan.' }
    ],
    jadwalPelajaran: [
      { jamKe: 1, waktu: '07.00 - 07.35', senin: { mapel: 'Upacara Bendera', guru: 'Seluruh Dewan Guru' }, selasa: { mapel: 'Matematika (Perkalian)', guru: 'Nurul Hidayati, S.Pd.' }, rabu: { mapel: 'IPAS (Wujud Zat)', guru: 'Nurul Hidayati, S.Pd.' }, kamis: { mapel: 'Pendidikan Pancasila', guru: 'Nurul Hidayati, S.Pd.' }, jumat: { mapel: 'PAI & Budi Pekerti', guru: 'Ahmad Muzakki, S.Pd.I' }, sabtu: { mapel: 'Bahasa Jawa (Mulok)', guru: 'Nurul Hidayati, S.Pd.' } }
    ],
    lms: [
      {
        id: 'lms-3-01',
        judul: 'Eksperimen Wujud Benda: Padat, Cair, dan Gas',
        mataPelajaran: 'IPAS',
        tipe: 'Video Pembelajaran',
        tanggalPosting: '2024-10-11',
        deskripsi: 'Video pengamatan es batu mencair dan air mendidih menghasilkan uap air.',
        linkSumber: 'https://youtube.com/watch?v=ipas-wujud-zat',
        statusPengumpulan: 'Disimak bersama di kelas'
      }
    ],
    refleksi: [
      {
        id: 'ref-3-01',
        tanggal: '2024-10-14',
        mataPelajaran: 'IPAS',
        topikBahasan: 'Perubahan wujud benda mencair dan membeku',
        pemahamanBaru: 'Siswa paham bahwa perubahan wujud terjadi karena pengaruh suhu panas dan dingin.',
        kendalaAtauTantangan: 'Perbedaan konsep antara menguap dan menyublim masih butuh analogi konkret.',
        suasanaBelajar: 'Sangat Menyenangkan 🤩',
        ditulisOleh: 'Rafiandra Putra',
        catatanWaliKelas: 'Pertemuan berikutnya demonstrasi kapur barus untuk konsep menyublim.'
      }
    ]
  },
  {
    kelas: 4,
    namaRuang: 'Gedung Ruang Kelas 4 (Jenderal Soedirman)',
    lokasiGedung: 'Gedung B Lantai 1 Sayap Selatan',
    luasM2: 64,
    kapasitasSiswa: 32,
    kondisi: 'Sangat Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    waliKelas: 'Muhammad Rizky, S.Pd.',
    nipWaliKelas: '19920110 202104 1 005',
    mottoKelas: 'Berpikir Kritis, Berkarya Nyata, Berkarakter Juara!',
    inventaris: {
      mejaSiswa: 16,
      kursiSiswa: 32,
      mejaGuru: 1,
      kursiGuru: 1,
      papanTulis: 'Papan Tulis Whiteboard Double Side',
      kipasAtauAc: '2 Kipas Angin Plafon Panasonic',
      pojokBaca: 'Lemari Display Modul & Ensiklopedia Anak',
      proyektor: '1 Unit LCD Epson + Speaker Aktif',
      lemariKelas: 1
    },
    strukturOrganisasi: {
      waliKelas: 'Muhammad Rizky, S.Pd.',
      nipWaliKelas: '19920110 202104 1 005',
      ketuaKelas: 'Bagus Setiawan',
      wakilKetua: 'Dinda Permata',
      sekretaris1: 'Reva Amelia',
      sekretaris2: 'Aldo Pratama',
      bendahara1: 'Nayra Salsabila',
      bendahara2: 'Kresna Wijaya',
      seksiKebersihan: ['Bagus', 'Dinda', 'Reva'],
      seksiKeamanan: ['Aldo', 'Kresna', 'Irfan'],
      seksiKeagamaan: ['Nayra', 'Aliyah', 'Zainal'],
      seksiUpacaraDanKerapian: ['Taufik', 'Laras', 'Doni']
    },
    jadwalPiket: [
      { hari: 'Senin', petugas: ['Bagus Setiawan', 'Dinda Permata', 'Reva Amelia'], tugasUtama: 'Persiapan sarana upacara & kebersihan podium kelas.' },
      { hari: 'Selasa', petugas: ['Aldo Pratama', 'Nayra Salsabila', 'Kresna Wijaya'], tugasUtama: 'Pembersihan meja, menyapu dan menyortir sampah botol plastik.' },
      { hari: 'Rabu', petugas: ['Irfan Maulana', 'Aliyah Zahra', 'Zainal Abidin'], tugasUtama: 'Mengepel lantai & penataan pojok baca Kurikulum Merdeka.' },
      { hari: 'Kamis', petugas: ['Taufik Hidayat', 'Laras Wulandari', 'Doni Damara'], tugasUtama: 'Pengecekan kebersihan laci siswa dan penyiraman taman.' },
      { hari: 'Jumat', petugas: ['Rere Novita', 'Bima Arya', 'Intan Permata'], tugasUtama: 'Aksi Bersih lingkungan kelas dan persiapan salat Jumat.' },
      { hari: 'Sabtu', petugas: ['Wildan Fauzi', 'Viona Sandra', 'Gilang Pratama'], tugasUtama: 'Pemberesan display karya dan rekap absensi piket mingguan.' }
    ],
    jadwalPelajaran: [
      { jamKe: 1, waktu: '07.00 - 07.35', senin: { mapel: 'Upacara Bendera', guru: 'Seluruh Dewan Guru' }, selasa: { mapel: 'Matematika (Pecahan)', guru: 'Muhammad Rizky, S.Pd.' }, rabu: { mapel: 'Bahasa Indonesia (Paragraf Ide Pokok)', guru: 'Muhammad Rizky, S.Pd.' }, kamis: { mapel: 'IPAS (Bagian Tumbuhan)', guru: 'Muhammad Rizky, S.Pd.' }, jumat: { mapel: 'Pendidikan Agama Islam', guru: 'Ahmad Muzakki, S.Pd.I' }, sabtu: { mapel: 'Seni Rupa & Kriya', guru: 'Muhammad Rizky, S.Pd.' } }
    ],
    lms: [
      {
        id: 'lms-4-01',
        judul: 'Modul Pecahan Senilai dan Operasi Hitung Campuran',
        mataPelajaran: 'Matematika',
        tipe: 'Materi / Modul',
        tanggalPosting: '2024-10-10',
        deskripsi: 'Panduan step-by-step menyamakan penyebut pecahan dengan KPK.',
        linkSumber: 'https://repositori.kemdikbud.go.id/pecahan-sd-kelas-4',
        statusPengumpulan: 'Bahan Ajar Utama'
      }
    ],
    refleksi: [
      {
        id: 'ref-4-01',
        tanggal: '2024-10-14',
        mataPelajaran: 'Matematika',
        topikBahasan: 'Menyederhanakan pecahan biasa menjadi bentuk paling sederhana',
        pemahamanBaru: 'Siswa paham pembagian FPB untuk pembilang dan penyebut.',
        kendalaAtauTantangan: 'Siswa yang belum lancar perkalian 7 dan 8 agak lambat mencari FPB.',
        suasanaBelajar: 'Senang & Paham 😊',
        ditulisOleh: 'Bagus Setiawan',
        catatanWaliKelas: 'Akan diadakan kuis kilat perkalian 5 menit setiap pagi sebelum pelajaran dimulai.'
      }
    ]
  },
  {
    kelas: 5,
    namaRuang: 'Gedung Ruang Kelas 5 (Ir. Soekarno)',
    lokasiGedung: 'Gedung C Lantai 1 Sayap Timur',
    luasM2: 64,
    kapasitasSiswa: 32,
    kondisi: 'Sangat Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    waliKelas: 'Hj. Siti Fatimah, S.Pd., M.Pd.',
    nipWaliKelas: '19740512 199803 2 004',
    mottoKelas: 'Mandiri, Unggul Dalam Prestasi, Menjunjung Tinggi Budi Pekerti!',
    inventaris: {
      mejaSiswa: 16,
      kursiSiswa: 32,
      mejaGuru: 1,
      kursiGuru: 1,
      papanTulis: 'Papan Tulis Whiteboard Besar & Papan Bimbingan Konseling',
      kipasAtauAc: '2 Kipas Angin Dinding Regency Tornado',
      pojokBaca: 'Pojok Baca Literasi Digital + 2 Unit Tablet Sekolah',
      proyektor: '1 Unit LCD Projector InFocus Wall Mount',
      lemariKelas: 1
    },
    strukturOrganisasi: {
      waliKelas: 'Hj. Siti Fatimah, S.Pd., M.Pd.',
      nipWaliKelas: '19740512 199803 2 004',
      ketuaKelas: 'Fachri Alamsyah',
      wakilKetua: 'Salma Khairunnisa',
      sekretaris1: 'Devina Nur Aulia',
      sekretaris2: 'Rendra Pratama',
      bendahara1: 'Almira Shafa',
      bendahara2: 'Arya Putra',
      seksiKebersihan: ['Fachri', 'Salma', 'Devina'],
      seksiKeamanan: ['Rendra', 'Arya', 'Faisal'],
      seksiKeagamaan: ['Almira', 'Zahwa', 'Lukman'],
      seksiUpacaraDanKerapian: ['Ilham', 'Cindy', 'Farhan']
    },
    jadwalPiket: [
      { hari: 'Senin', petugas: ['Fachri Alamsyah', 'Salma Khairunnisa', 'Devina Nur Aulia'], tugasUtama: 'Pemeriksaan kerapian seragam & kebersihan ruang kelas.' },
      { hari: 'Selasa', petugas: ['Rendra Pratama', 'Almira Shafa', 'Arya Putra'], tugasUtama: 'Menyapu, merapikan meja guru & pemilahan sampah organik/anorganik.' },
      { hari: 'Rabu', petugas: ['Faisal Ridho', 'Zahwa Kamila', 'Lukman Hakim'], tugasUtama: 'Mengepel lantai & mengelap kaca jendela kelas.' },
      { hari: 'Kamis', petugas: ['Ilham Ramadhan', 'Cindy Fatika', 'Farhan Hidayat'], tugasUtama: 'Merapikan rak buku literasi & cek perangkat proyektor.' },
      { hari: 'Jumat', petugas: ['Melati Sukma', 'Genta Buana', 'Nadia Safitri'], tugasUtama: 'Jumat Bersih & persiapan salat dhuha berjamaah.' },
      { hari: 'Sabtu', petugas: ['Kevin Sanjaya', 'Aura Kasih', 'Rizky Billar'], tugasUtama: 'Penataan bangku format U-shape untuk kegiatan diskusi kelas.' }
    ],
    jadwalPelajaran: [
      { jamKe: 1, waktu: '07.00 - 07.35', senin: { mapel: 'Upacara Bendera', guru: 'Seluruh Dewan Guru' }, selasa: { mapel: 'IPAS (Sistem Pencernaan)', guru: 'Hj. Siti Fatimah, S.Pd., M.Pd.' }, rabu: { mapel: 'Matematika (Kecepatan & Debit)', guru: 'Hj. Siti Fatimah, S.Pd., M.Pd.' }, kamis: { mapel: 'Bahasa Indonesia (Teks Eksplanasi)', guru: 'Hj. Siti Fatimah, S.Pd., M.Pd.' }, jumat: { mapel: 'Pendidikan Agama Islam', guru: 'Ahmad Muzakki, S.Pd.I' }, sabtu: { mapel: 'Bahasa Inggris', guru: 'Tri Handayani, S.Pd.' } }
    ],
    lms: [
      {
        id: 'lms-5-01',
        judul: 'Peta Konsep Sistem Pencernaan Manusia dan Gangguannya',
        mataPelajaran: 'IPAS',
        tipe: 'Materi / Modul',
        tanggalPosting: '2024-10-13',
        deskripsi: 'Bahan tayang infografik organ pencernaan mulai mulut sampai usus besar.',
        linkSumber: 'https://kemdikbud.go.id/sistem-pencernaan-kelas-5',
        statusPengumpulan: '30 Siswa Telah Mengakses'
      }
    ],
    refleksi: [
      {
        id: 'ref-5-01',
        tanggal: '2024-10-14',
        mataPelajaran: 'IPAS',
        topikBahasan: 'Proses penyerapan nutrisi di usus halus dan peranan lambung',
        pemahamanBaru: 'Siswa terkesima mengetahui fungsi enzim asam lambung dan panjang usus manusia.',
        kendalaAtauTantangan: 'Mengingat nama-nama enzim (ptialin, pepsin, renin, tripsin) perlu jembatan keledai.',
        suasanaBelajar: 'Sangat Menyenangkan 🤩',
        ditulisOleh: 'Salma Khairunnisa (Wakil Ketua Kelas 5)',
        catatanWaliKelas: 'Dibuatkan lagu singkatan enzim agar mudah dihafal secara riang gembira.'
      }
    ]
  },
  {
    kelas: 6,
    namaRuang: 'Gedung Ruang Kelas 6 (Mohammad Hatta)',
    lokasiGedung: 'Gedung C Lantai 1 Sayap Barat',
    luasM2: 64,
    kapasitasSiswa: 32,
    kondisi: 'Sangat Baik',
    fotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    waliKelas: 'Ahmad Muzakki, S.Pd.I',
    nipWaliKelas: '19820315 200902 1 003',
    mottoKelas: 'Sukses TKA, Unggul Akademik, Berbudi Pekerti Luhur Menuju Jenjang SMP!',
    inventaris: {
      mejaSiswa: 16,
      kursiSiswa: 32,
      mejaGuru: 1,
      kursiGuru: 1,
      papanTulis: 'Papan Tulis Whiteboard Besar & Papan Target Sukses TKA/Asesmen',
      kipasAtauAc: '2 Kipas Angin Dinding Maspion Tornado',
      pojokBaca: 'Pojok Bank Soal TKA, Literasi & Numerasi',
      proyektor: '1 Unit LCD Proyektor + Audio Sound System',
      lemariKelas: 1
    },
    strukturOrganisasi: {
      waliKelas: 'Ahmad Muzakki, S.Pd.I',
      nipWaliKelas: '19820315 200902 1 003',
      ketuaKelas: 'Muhammad Fadhil Al-Ghifari',
      wakilKetua: 'Aisyah Putri Azzahra',
      sekretaris1: 'Nabila Nur Azizah',
      sekretaris2: 'Bintang Raditya Pratama',
      bendahara1: 'Rifqi Hafizhan Ramadhan',
      bendahara2: 'Dewi Lestari',
      seksiKebersihan: ['Muhammad Fadhil', 'Aisyah Putri', 'Bintang Raditya'],
      seksiKeamanan: ['Rifqi Hafizhan', 'Rian Hidayat', 'Fajar Ramadhan'],
      seksiKeagamaan: ['Nabila Nur Azizah', 'Dewi Lestari', 'Ahmad Dani'],
      seksiUpacaraDanKerapian: ['Ilham Habibie', 'Salwa Nadia', 'Gibran Rakabuming']
    },
    jadwalPiket: [
      { hari: 'Senin', petugas: ['Muhammad Fadhil Al-Ghifari', 'Aisyah Putri Azzahra', 'Nabila Nur Azizah'], tugasUtama: 'Petugas persiapan upacara, kebersihan mimbar & papan tulis.' },
      { hari: 'Selasa', petugas: ['Bintang Raditya Pratama', 'Rifqi Hafizhan Ramadhan', 'Dewi Lestari'], tugasUtama: 'Menyapu lantai, membersihkan loker buku soal & membuang sampah.' },
      { hari: 'Rabu', petugas: ['Rian Hidayat', 'Fajar Ramadhan', 'Ahmad Dani'], tugasUtama: 'Mengepel ruang kelas, mengelap proyektor & menyiram tanaman koridor.' },
      { hari: 'Kamis', petugas: ['Ilham Habibie', 'Salwa Nadia', 'Gibran Rakabuming'], tugasUtama: 'Pemeriksaan kerapian meja kursi belajar dan kebersihan laci.' },
      { hari: 'Jumat', petugas: ['Zaskia Gotik', 'Alief Ramadhan', 'Putri Indah'], tugasUtama: 'Jumat Berkah & pembersihan sarana salat dan musala sekolah.' },
      { hari: 'Sabtu', petugas: ['Danang Sutrisno', 'Bella Safira', 'Fauzan Adhim'], tugasUtama: 'Sterilisasi ruangan & penataan arsip lembar jawaban latihan TKA.' }
    ],
    jadwalPelajaran: [
      { jamKe: 1, waktu: '07.00 - 07.35', senin: { mapel: 'Upacara Bendera', guru: 'Seluruh Dewan Guru' }, selasa: { mapel: 'Matematika (Numerasi TKA)', guru: 'Ahmad Muzakki, S.Pd.I' }, rabu: { mapel: 'Bahasa Indonesia (Literasi TKA)', guru: 'Ahmad Muzakki, S.Pd.I' }, kamis: { mapel: 'IPAS (Mapel Pilihan TKA)', guru: 'Ahmad Muzakki, S.Pd.I' }, jumat: { mapel: 'Pendidikan Agama Islam (PAI)', guru: 'Ahmad Muzakki, S.Pd.I' }, sabtu: { mapel: 'Simulasi Try Out TKA & Karakter', guru: 'Ahmad Muzakki, S.Pd.I' } },
      { jamKe: 2, waktu: '07.35 - 08.10', senin: { mapel: 'Pendidikan Pancasila (PKn)', guru: 'Ahmad Muzakki, S.Pd.I' }, selasa: { mapel: 'Matematika (Numerasi TKA)', guru: 'Ahmad Muzakki, S.Pd.I' }, rabu: { mapel: 'Bahasa Indonesia (Literasi TKA)', guru: 'Ahmad Muzakki, S.Pd.I' }, kamis: { mapel: 'IPAS', guru: 'Ahmad Muzakki, S.Pd.I' }, jumat: { mapel: 'BTQ & Tahsin Al-Qur\'an', guru: 'Ahmad Muzakki, S.Pd.I' }, sabtu: { mapel: 'Bahasa Jawa (Mulok)', guru: 'Ahmad Muzakki, S.Pd.I' } },
      { jamKe: 3, waktu: '08.10 - 08.45', senin: { mapel: 'Bahasa Indonesia', guru: 'Ahmad Muzakki, S.Pd.I' }, selasa: { mapel: 'PJOK', guru: 'Fajar Eko Prasetyo, S.Pd.' }, rabu: { mapel: 'Seni Budaya', guru: 'Ahmad Muzakki, S.Pd.I' }, kamis: { mapel: 'Bahasa Inggris', guru: 'Tri Handayani, S.Pd.' }, jumat: { mapel: 'Pembinaan Karakter & Refleksi', guru: 'Ahmad Muzakki, S.Pd.I' }, sabtu: { mapel: 'Bimbingan Konseling & Prestasi', guru: 'Ahmad Muzakki, S.Pd.I' } }
    ],
    lms: [
      {
        id: 'lms-6-01',
        judul: 'Bank Soal Simulasi Tes Kemampuan Akademik (TKA) - Numerasi & Literasi',
        mataPelajaran: 'Persiapan TKA & Kelulusan',
        tipe: 'Tugas Harian',
        tanggalPosting: '2024-10-14',
        deskripsi: 'Paket 50 soal pilihan ganda berbasis stimulus konteks nyata dan penalaran logis tingkat lanjut.',
        linkSumber: 'https://pusmendik.kemdikbud.go.id/an/tka-numerasi-literasi',
        statusPengumpulan: '31 dari 32 Siswa Selesai Mengerjakan'
      },
      {
        id: 'lms-6-02',
        judul: 'Modul Muatan Lokal: Gladhi Basa Jawa & Aksara Jawa Sandhangan',
        mataPelajaran: 'Bahasa Jawa',
        tipe: 'Materi / Modul',
        tanggalPosting: '2024-10-12',
        deskripsi: 'Panduan membaca dan menulis aksara Jawa legena, sandhangan swara, panyigeg, dan wyanjana.',
        statusPengumpulan: 'Tersedia Lengkap di Pojok Belajar'
      }
    ],
    refleksi: [
      {
        id: 'ref-6-01',
        tanggal: '2024-10-14',
        mataPelajaran: 'Matematika (Numerasi TKA)',
        topikBahasan: 'Analisis data diagram batang dan persentase diskon belanja',
        pemahamanBaru: 'Siswa sukses memecahkan studi kasus menghitung harga termurah dari promo perbandingan dua toko.',
        kendalaAtauTantangan: 'Membaca soal cerita yang panjang membutuhkan ketelitian dan konsentrasi tinggi.',
        suasanaBelajar: 'Sangat Menyenangkan 🤩',
        ditulisOleh: 'Muhammad Fadhil Al-Ghifari (Ketua Kelas 6)',
        catatanWaliKelas: 'Pertahankan daya juang! Teknik eliminasi jawaban yang tidak logis sangat membantu menghemat waktu saat ujian.'
      }
    ]
  }
];
