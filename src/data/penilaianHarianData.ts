import { PenilaianHarian, HasilPenilaianSiswa } from '../types';

export const INITIAL_PENILAIAN_HARIAN: PenilaianHarian[] = [
  {
    id: 'ph-01',
    kodeUjian: 'PH-6-IPAS-01',
    judul: 'Penilaian Harian 1: Sistem Gerak & Rangka Tubuh Manusia',
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    kelas: 6,
    rombel: 'A',
    materiPokok: 'Struktur Tulang, Macam-macam Sendi, dan Kelainan Sistem Gerak',
    tujuanPembelajaran: 'Peserta didik mampu mengidentifikasi organ rangka dan persendian, menganalisis hubungan otot dan tulang, serta merumuskan pembiasaan menjaga kesehatan postur tubuh.',
    durasiMenit: 60,
    tahunPelajaran: '2026/2027',
    semester: 1,
    kkm: 75,
    guruPengampu: 'Pudjiati, S.Pd.',
    guruNip: '19690107 200701 2 015',
    tanggalDibuat: '2026-10-10',
    status: 'aktif',
    soalList: [
      {
        id: 'soal-1',
        nomor: 1,
        tipe: 'pg',
        pertanyaan: 'Hubungan antartulang yang memungkinkan terjadinya gerakan ke segala arah, seperti hubungan antara tulang lengan atas dengan gelang bahu, disebut persendian ....',
        opsi: [
          'A. Sendi peluru',
          'B. Sendi engsel',
          'C. Sendi pelana',
          'D. Sendi putar'
        ],
        kunciJawaban: 'A',
        bobotPoin: 1,
        indikatorSoal: 'Disajikan deskripsi gerakan antartulang gelang bahu, siswa dapat menentukan nama persendian dengan benar.',
        levelKognitif: 'C2',
        pembahasan: 'Sendi peluru menghubungkan ujung tulang bulat dengan mangkok sendi sehingga dapat digerakkan ke segala arah.'
      },
      {
        id: 'soal-2',
        nomor: 2,
        tipe: 'pg',
        pertanyaan: 'Perhatikan ciri-ciri otot berikut:\n1) Bentuk gelendong dengan ujung meruncing\n2) Bekerja secara tidak sadar (involunter)\n3) Memiliki satu inti sel di tengah\nOtot dengan ciri-ciri tersebut menyusun organ ....',
        opsi: [
          'A. Dinding lambung dan usus halus',
          'B. Tulang paha dan betis',
          'C. Jantung manusia',
          'D. Lengan atas dan bisep'
        ],
        kunciJawaban: 'A',
        bobotPoin: 1,
        indikatorSoal: 'Disajikan ciri-ciri histologi otot, siswa dapat mengidentifikasi letak organ otot polos.',
        levelKognitif: 'C2',
        pembahasan: 'Ciri-ciri tersebut adalah ciri otot polos yang menyusun saluran pencernaan seperti lambung dan usus.'
      },
      {
        id: 'soal-3',
        nomor: 3,
        tipe: 'pg',
        pertanyaan: 'Kelainan pada tulang belakang yang melengkung ke arah samping sehingga badan tampak condong ke kanan atau ke kiri disebut ....',
        opsi: [
          'A. Skoliosis',
          'B. Lordosis',
          'C. Kifosis',
          'D. Osteoporosis'
        ],
        kunciJawaban: 'A',
        bobotPoin: 1,
        indikatorSoal: 'Siswa dapat membedakan jenis kelainan postur tulang belakang akibat posisi duduk salah.',
        levelKognitif: 'C1',
        pembahasan: 'Skoliosis adalah kondisi tulang belakang melengkung ke samping kiri atau kanan menyerupai huruf S atau C.'
      },
      {
        id: 'soal-4',
        nomor: 4,
        tipe: 'pg',
        pertanyaan: 'Mengapa tulang disebut sebagai alat gerak pasif pada tubuh manusia?',
        opsi: [
          'A. Karena tulang hanya dapat bergerak jika digerakkan oleh kontraksi otot',
          'B. Karena tulang tidak memiliki pembuluh darah dan serabut saraf',
          'C. Karena tulang selalu berada dalam posisi diam dan kaku',
          'D. Karena tulang tidak membutuhkan nutrisi kalsium sama sekali'
        ],
        kunciJawaban: 'A',
        bobotPoin: 1,
        indikatorSoal: 'Siswa dapat menjelaskan alasan ilmiah tulang dikategorikan sebagai alat gerak pasif.',
        levelKognitif: 'C2',
        pembahasan: 'Tulang tidak memiliki kemampuan mandiri untuk berkontraksi, pergerakannya dikendalikan oleh otot sebagai alat gerak aktif.'
      },
      {
        id: 'soal-5',
        nomor: 5,
        tipe: 'pgk',
        pertanyaan: 'Manakah dari pernyataan berikut yang merupakan fungsi utama dari sistem rangka bagi tubuh manusia? (Pilihlah DUA atau LEBIH jawaban yang benar!)',
        opsi: [
          'A. Menopang dan memberi bentuk tubuh manusia',
          'B. Menghasilkan hormon pencernaan empedu',
          'C. Melindungi organ-organ dalam yang vital seperti jantung dan paru-paru',
          'D. Tempat melekatnya otot-otot lurik dan pembentukan sel darah'
        ],
        kunciJawaban: ['A', 'C', 'D'],
        bobotPoin: 1,
        indikatorSoal: 'Siswa mampu menganalisis berbagai fungsi rangka tubuh manusia pada opsi kompleks.',
        levelKognitif: 'C3',
        pembahasan: 'Fungsi rangka meliputi penopang bentuk tubuh, pelindung organ vital, perlekatan otot, dan hematopoiesis (pembentukan sel darah). Menghasilkan empedu adalah fungsi hati.'
      },
      {
        id: 'soal-6',
        nomor: 6,
        tipe: 'pgk',
        pertanyaan: 'Kebiasaan hidup sehat manakah yang terbukti efektif mencegah terjadinya pengeroposan tulang (osteoporosis) sejak usia dini? (Pilihlah DUA atau LEBIH jawaban yang benar!)',
        opsi: [
          'A. Rajin berolahraga angkat beban berlebih tanpa pemanasan',
          'B. Mengonsumsi makanan kaya kalsium dan vitamin D seperti susu dan ikan',
          'C. Menghindari paparan sinar matahari pagi sepanjang hari',
          'D. Melakukan aktivitas fisik teratur di pagi hari dan menjaga postur duduk tegak'
        ],
        kunciJawaban: ['B', 'D'],
        bobotPoin: 1,
        indikatorSoal: 'Siswa dapat mengidentifikasi upaya pembiasaan preventif osteoporosis.',
        levelKognitif: 'C3',
        pembahasan: 'Konsumsi makanan berkalsium & vit D serta aktivitas fisik pagi hari mendukung kepadatan mineral tulang.'
      },
      {
        id: 'soal-7',
        nomor: 7,
        tipe: 'isian',
        pertanyaan: 'Zat mineral utama yang sangat dibutuhkan oleh tubuh untuk membentuk struktur tulang yang keras, padat, dan kuat adalah ....',
        kunciJawaban: 'kalsium dan fosfor',
        bobotPoin: 2,
        indikatorSoal: 'Siswa dapat menyebutkan zat mineral esensial pembentuk kekerasan matriks tulang.',
        levelKognitif: 'C1',
        pembahasan: 'Kalsium (Ca) dan fosfor (P) merupakan mineral penyusun utama garam hidroksiapatit pada tulang.'
      },
      {
        id: 'soal-8',
        nomor: 8,
        tipe: 'isian',
        pertanyaan: 'Persendian yang hanya memungkinkan gerakan satu arah menyerupai engsel pintu dan terdapat pada siku serta lutut dinamakan persendian ....',
        kunciJawaban: 'sendi engsel',
        bobotPoin: 2,
        indikatorSoal: 'Siswa dapat mengidentifikasi jenis sendi engsel berdasarkan karakteristik arah geraknya.',
        levelKognitif: 'C2',
        pembahasan: 'Sendi engsel hanya bergerak satu bidang (fleksi dan ekstensi), contohnya pada siku dan lutut.'
      },
      {
        id: 'soal-9',
        nomor: 9,
        tipe: 'uraian',
        pertanyaan: 'Uraikan 3 (tiga) perbedaan mendasar antara otot lurik (otot rangka) dengan otot polos berdasarkan: bentuk sel, cara kerja (sadar/tidak sadar), dan letak keberadaannya pada tubuh manusia!',
        kunciJawaban: 'Rubrik Penskoran:\n- Skor 3: Menjelaskan 3 aspek dengan tepat: 1) Bentuk (lurik silindris bergaris vs polos gelendong), 2) Cara kerja (lurik sadar/volunter vs polos involunter), 3) Letak (lurik menempel rangka vs polos di dinding organ dalam).\n- Skor 2: Menjelaskan 2 aspek dengan benar.\n- Skor 1: Menjelaskan 1 aspek dengan benar.\n- Skor 0: Tidak menjawab atau jawaban salah total.',
        bobotPoin: 3,
        indikatorSoal: 'Siswa mampu membandingkan karakteristik histologi dan fisiologi otot lurik dan otot polos secara mendalam.',
        levelKognitif: 'C4',
        pembahasan: 'Otot lurik silindris berlurik, bekerja secara sadar, menempel pada rangka. Otot polos gelendong tanpa lurik, involunter, menyusun jeroan.'
      },
      {
        id: 'soal-10',
        nomor: 10,
        tipe: 'uraian',
        pertanyaan: 'Sebagai seorang peserta didik, sebutkan dan jelaskan 3 (tiga) contoh perilaku nyata dalam kegiatan belajar di sekolah yang dapat merawat kesehatan tulang punggung Anda agar tidak mengalami kelainan postur tubuh!',
        kunciJawaban: 'Rubrik Penskoran:\n- Skor 3: Menyebutkan 3 perilaku logis dan konkret (contoh: duduk dengan posisi punggung tegak tidak membungkuk, memakai tas punggung dengan kedua tali di pundak secara seimbang, melakukan peregangan setelah duduk lama).\n- Skor 2: Menyebutkan 2 perilaku konkret.\n- Skor 1: Menyebutkan 1 perilaku umum.\n- Skor 0: Tidak relevan.',
        bobotPoin: 3,
        indikatorSoal: 'Siswa dapat merumuskan langkah praktis menjaga ergonomi dan kesehatan tulang belakang di lingkungan sekolah.',
        levelKognitif: 'C4',
        pembahasan: 'Kebiasaan duduk tegak, pemakaian tas ransel seimbang di kedua bahu, serta istirahat peregangan adalah kunci preventif kelainan tulang belakang.'
      }
    ]
  },
  {
    id: 'ph-02',
    kodeUjian: 'PH-6-BIND-01',
    judul: 'Penilaian Harian 1: Teks Formulir & Teks Eksplanasi Ilmiah',
    mataPelajaran: 'Bahasa Indonesia (B. Ind)',
    kelas: 6,
    rombel: 'A',
    materiPokok: 'Pengisian Formulir Pengiriman & Struktur Teks Eksplanasi',
    tujuanPembelajaran: 'Peserta didik mampu mengisi formulir identitas dengan data valid dan menganalisis bagian pernyataan umum, deretan penjelas, serta simpulan teks eksplanasi ilmiah.',
    durasiMenit: 60,
    tahunPelajaran: '2026/2027',
    semester: 1,
    kkm: 75,
    guruPengampu: 'Pudjiati, S.Pd.',
    guruNip: '19690107 200701 2 015',
    tanggalDibuat: '2026-10-18',
    status: 'aktif',
    soalList: [
      {
        id: 'soal-b1',
        nomor: 1,
        tipe: 'pg',
        pertanyaan: 'Informasi paling penting yang wajib dicantumkan dalam formulir pengiriman barang agar paket tidak tersasar ke alamat yang salah adalah ....',
        opsi: [
          'A. Nama penerima, alamat lengkap, kode pos, dan nomor telepon aktif',
          'B. Hobi dan makanan kesukaan penerima',
          'C. Nilai rapor semester terakhir pengirim',
          'D. Riwayat pendidikan sekolah dasar pengirim'
        ],
        kunciJawaban: 'A',
        bobotPoin: 1,
        indikatorSoal: 'Siswa dapat menentukan data wajib pada formulir pengiriman barang.',
        levelKognitif: 'C1',
        pembahasan: 'Nama, alamat terperinci, kode pos, dan no telepon adalah data primer pengiriman paket.'
      },
      {
        id: 'soal-b2',
        nomor: 2,
        tipe: 'pg',
        pertanyaan: 'Bagian teks eksplanasi yang berisi gambaran awal atau pengenalan fenomena alam atau sosial yang akan dibahas disebut ....',
        opsi: [
          'A. Pernyataan umum (identifikasi fenomena)',
          'B. Deretan penjelas (kausalitas)',
          'C. Interpretasi / ulasan akhir',
          'D. Kesimpulan saran pembaca'
        ],
        kunciJawaban: 'A',
        bobotPoin: 1,
        indikatorSoal: 'Siswa dapat mengidentifikasi struktur pembuka teks eksplanasi.',
        levelKognitif: 'C1',
        pembahasan: 'Pernyataan umum merupakan paragraf pengantar fenomena yang hendak diterangkan.'
      },
      {
        id: 'soal-b3',
        nomor: 3,
        tipe: 'pgk',
        pertanyaan: 'Manakah di antara kalimat berikut yang memuat konjungsi kausalitas (sebab-akibat) yang lazim ditemukan dalam deretan penjelas teks eksplanasi? (Pilihlah DUA atau LEBIH jawaban benar!)',
        opsi: [
          'A. Hujan lebat berlangsung selama tiga jam sehingga debit air sungai meluap.',
          'B. Di pasar tradisional Kedungringin dijual aneka sayur dan ikan segar.',
          'C. Terjadinya gempa bumi bawah laut menyebabkan timbulnya gelombang tsunami dahsyat.',
          'D. Kami pergi berwisata ke pantai bersama seluruh keluarga pada hari Minggu.'
        ],
        kunciJawaban: ['A', 'C'],
        bobotPoin: 1,
        indikatorSoal: 'Siswa dapat memilih kalimat yang menggunakan konjungsi kausalitas dalam teks eksplanasi.',
        levelKognitif: 'C3',
        pembahasan: 'Kata "sehingga" dan "menyebabkan" adalah penanda hubungan sebab-akibat (kausalitas).'
      },
      {
        id: 'soal-b4',
        nomor: 4,
        tipe: 'isian',
        pertanyaan: 'Kode angka 5 digit yang dicantumkan pada bagian alamat surat atau paket untuk mempermudah identifikasi wilayah kantor pos pengantaran disebut nomor ....',
        kunciJawaban: 'kode pos',
        bobotPoin: 2,
        indikatorSoal: 'Siswa dapat menyebutkan istilah kode pos pada data identitas formulir.',
        levelKognitif: 'C1',
        pembahasan: 'Kode pos adalah deretan angka unik pengenal wilayah pos.'
      },
      {
        id: 'soal-b5',
        nomor: 5,
        tipe: 'uraian',
        pertanyaan: 'Jelaskan secara terperinci apa yang dimaksud dengan deretan penjelas pada struktur teks eksplanasi, dan sebutkan jenis informasi apa saja yang dimuat di dalamnya!',
        kunciJawaban: 'Rubrik Penskoran:\n- Skor 3: Menjelaskan pengertian deretan penjelas sebagai bagian inti yang menguraikan proses kejadian sebab-akibat fenomena secara kronologis dan logis.\n- Skor 2: Penjelasan cukup namun kurang menyentuh aspek sebab-akibat.\n- Skor 1: Jawaban singkat.\n- Skor 0: Tidak relevan.',
        bobotPoin: 3,
        indikatorSoal: 'Siswa mampu menjelaskan makna dan karakteristik deretan penjelas teks eksplanasi.',
        levelKognitif: 'C3',
        pembahasan: 'Deretan penjelas memuat rentetan kronologis mengapa dan bagaimana fenomena itu terjadi.'
      }
    ]
  },
  {
    id: 'ph-03',
    kodeUjian: 'PH-6-PAI-01',
    judul: 'Penilaian Harian 1: Q.S. Ad-Duha dan Hari Akhir',
    mataPelajaran: 'Pendidikan Agama Islam dan Budi Pekerti (PAI)',
    kelas: 6,
    rombel: 'A',
    materiPokok: 'Kandungan Q.S. Ad-Duha & Makna Beriman kepada Hari Kiamat',
    tujuanPembelajaran: 'Peserta didik mampu menghafal dan memahami pesan mulia Q.S. Ad-Duha serta menguraikan tanda-tanda dan hikmah iman kepada hari akhir dalam kehidupan berakhlak.',
    durasiMenit: 60,
    tahunPelajaran: '2026/2027',
    semester: 1,
    kkm: 75,
    guruPengampu: 'Wahyu Tri Laksono, S.Pd.I',
    guruNip: '19860628 202321 1 010',
    tanggalDibuat: '2026-10-15',
    status: 'aktif',
    soalList: [
      {
        id: 'soal-p1',
        nomor: 1,
        tipe: 'pg',
        pertanyaan: 'Surah Ad-Duha diturunkan oleh Allah SWT setelah peristiwa terputusnya wahyu untuk beberapa waktu sebagai penghibur hati Nabi Muhammad SAW. Ad-Duha artinya ....',
        opsi: [
          'A. Waktu dhuha (waktu matahari sepenggalahan naik)',
          'B. Waktu fajar menjelang subuh',
          'C. Malam yang gelap gulita',
          'D. Bintang yang bersinar terang'
        ],
        kunciJawaban: 'A',
        bobotPoin: 1,
        indikatorSoal: 'Siswa dapat menjelaskan arti kata Ad-Duha.',
        levelKognitif: 'C1',
        pembahasan: 'Ad-Duha berarti waktu dhuha saat matahari naik meninggi.'
      },
      {
        id: 'soal-p2',
        nomor: 2,
        tipe: 'pgk',
        pertanyaan: 'Sikap mulia apa sajakah yang diperintahkan Allah SWT kepada kita sebagaimana tercantum dalam ayat terakhir Surah Ad-Duha? (Pilihlah DUA atau LEBIH jawaban benar!)',
        opsi: [
          'A. Tidak boleh berbuat sewenang-wenang terhadap anak yatim',
          'B. Tidak menghardik orang yang meminta-minta bantuan',
          'C. Mengeluhkan nikmat yang diterima di depan orang lain',
          'D. Mensyukuri dan menyebut-nyebut nikmat pemberian Tuhanmu'
        ],
        kunciJawaban: ['A', 'B', 'D'],
        bobotPoin: 1,
        indikatorSoal: 'Siswa dapat mengidentifikasi pesan moral pada ayat 9-11 Surah Ad-Duha.',
        levelKognitif: 'C3',
        pembahasan: 'Larangan menindas yatim, larangan menghardik peminta-minta, dan anjuran mentahadduts bin ni\'mah (mensyukuri nikmat).'
      },
      {
        id: 'soal-p3',
        nomor: 3,
        tipe: 'isian',
        pertanyaan: 'Hari kiamat di mana seluruh alam semesta dan isinya hancur lebur serta berganti dengan alam akhirat disebut kiamat ....',
        kunciJawaban: 'kubra',
        bobotPoin: 2,
        indikatorSoal: 'Siswa dapat membedakan kiamat sughra dan kubra.',
        levelKognitif: 'C1',
        pembahasan: 'Kiamat kubra adalah kehancuran total seluruh jagad raya.'
      },
      {
        id: 'soal-p4',
        nomor: 4,
        tipe: 'uraian',
        pertanyaan: 'Jelaskan 3 (tiga) hikmah beriman kepada hari akhir terhadap perilaku kita sehari-hari sebagai peserta didik di sekolah dan di rumah!',
        kunciJawaban: 'Rubrik Penskoran:\n- Skor 3: Menyebutkan 3 hikmah aplikatif (contoh: rajin beribadah dan beramal saleh, selalu berbuat jujur karena merasa diawasi Allah, takut berbuat maksiat atau menzalimi teman).\n- Skor 2: Menyebutkan 2 hikmah.\n- Skor 1: Menyebutkan 1 hikmah.\n- Skor 0: Tidak relevan.',
        bobotPoin: 3,
        indikatorSoal: 'Siswa mampu merumuskan hikmah iman kepada hari akhir dalam akhlak keseharian.',
        levelKognitif: 'C4',
        pembahasan: 'Iman pada hari pembalasan memotivasi integritas, kejujuran, dan kesalehan sosial.'
      }
    ]
  }
];

export const INITIAL_HASIL_PENILAIAN: HasilPenilaianSiswa[] = [
  {
    id: 'hp-01',
    penilaianId: 'ph-01',
    siswaId: 'sis-01',
    nisn: '0123847591',
    namaSiswa: 'Muhammad Fadhil Al-Ghifari',
    kelas: 6,
    rombel: 'A',
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    waktuMulai: '2026-10-12 08:00',
    waktuSelesai: '2026-10-12 08:42',
    totalSkorPerolehan: 15,
    totalSkorMaksimal: 16,
    nilaiAkhir: 94,
    statusKoreksi: 'sudah_dikoreksi',
    statusKelulusan: 'Tuntas',
    catatanEvaluasi: 'Luar biasa! Pemahaman konsep sistem rangka dan persendian sangat mendalam.',
    dikoreksiOleh: 'Pudjiati, S.Pd.',
    tanggalKoreksi: '2026-10-12 11:30',
    jawaban: [
      { soalId: 'soal-1', nomor: 1, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-2', nomor: 2, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-3', nomor: 3, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-4', nomor: 4, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-5', nomor: 5, tipe: 'pgk', jawabanSiswa: ['A', 'C', 'D'], kunciJawaban: ['A', 'C', 'D'], isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-6', nomor: 6, tipe: 'pgk', jawabanSiswa: ['B', 'D'], kunciJawaban: ['B', 'D'], isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-7', nomor: 7, tipe: 'isian', jawabanSiswa: 'Kalsium dan fosfor', kunciJawaban: 'kalsium dan fosfor', skorOtomatis: 0, skorManual: 2, skorFinal: 2, skorMaksimal: 2, catatanGuru: 'Tepat sekali.' },
      { soalId: 'soal-8', nomor: 8, tipe: 'isian', jawabanSiswa: 'sendi engsel', kunciJawaban: 'sendi engsel', skorOtomatis: 0, skorManual: 2, skorFinal: 2, skorMaksimal: 2, catatanGuru: 'Jawaban benar.' },
      { soalId: 'soal-9', nomor: 9, tipe: 'uraian', jawabanSiswa: 'Otot lurik menempel pada rangka, berbentuk silindris garis-garis, dan bekerja secara sadar. Sedangkan otot polos bentuknya gelendong meruncing, bekerja tanpa sadar, dan terletak di lambung serta usus.', kunciJawaban: 'Rubrik penskoran...', skorOtomatis: 0, skorManual: 3, skorFinal: 3, skorMaksimal: 3, catatanGuru: 'Uraian lengkap dan runut.' },
      { soalId: 'soal-10', nomor: 10, tipe: 'uraian', jawabanSiswa: '1. Duduk dengan posisi tegak saat belajar di kelas. 2. Menggunakan tas ransel dengan dua tali agar beban merata. 3. Istirahat olahraga peregangan.', kunciJawaban: 'Rubrik penskoran...', skorOtomatis: 0, skorManual: 2, skorFinal: 2, skorMaksimal: 3, catatanGuru: 'Contoh bagus, tambahkan penjelasan nutrisi.' }
    ]
  },
  {
    id: 'hp-02',
    penilaianId: 'ph-01',
    siswaId: 'sis-02',
    nisn: '0124958102',
    namaSiswa: 'Aisyah Putri Azzahra',
    kelas: 6,
    rombel: 'A',
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    waktuMulai: '2026-10-12 08:00',
    waktuSelesai: '2026-10-12 08:38',
    totalSkorPerolehan: 16,
    totalSkorMaksimal: 16,
    nilaiAkhir: 100,
    statusKoreksi: 'sudah_dikoreksi',
    statusKelulusan: 'Tuntas',
    catatanEvaluasi: 'Sempurna! Seluruh butir soal dijawab dengan akurat dan runtut.',
    dikoreksiOleh: 'Pudjiati, S.Pd.',
    tanggalKoreksi: '2026-10-12 11:35',
    jawaban: [
      { soalId: 'soal-1', nomor: 1, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-2', nomor: 2, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-3', nomor: 3, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-4', nomor: 4, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-5', nomor: 5, tipe: 'pgk', jawabanSiswa: ['A', 'C', 'D'], kunciJawaban: ['A', 'C', 'D'], isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-6', nomor: 6, tipe: 'pgk', jawabanSiswa: ['B', 'D'], kunciJawaban: ['B', 'D'], isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-7', nomor: 7, tipe: 'isian', jawabanSiswa: 'kalsium dan fosfat', kunciJawaban: 'kalsium dan fosfor', skorOtomatis: 0, skorManual: 2, skorFinal: 2, skorMaksimal: 2 },
      { soalId: 'soal-8', nomor: 8, tipe: 'isian', jawabanSiswa: 'sendi engsel', kunciJawaban: 'sendi engsel', skorOtomatis: 0, skorManual: 2, skorFinal: 2, skorMaksimal: 2 },
      { soalId: 'soal-9', nomor: 9, tipe: 'uraian', jawabanSiswa: '1. Bentuk: otot lurik silinder berserat sedangkan otot polos gelendong. 2. Kontrol: otot lurik volunter dan otot polos involunter. 3. Tempat: otot lurik di tulang dan otot polos di organ visceral.', kunciJawaban: 'Rubrik...', skorOtomatis: 0, skorManual: 3, skorFinal: 3, skorMaksimal: 3 },
      { soalId: 'soal-10', nomor: 10, tipe: 'uraian', jawabanSiswa: '1. Duduk dengan posisi ergonomis tidak membungkuk. 2. Berolahraga rutin di lapangan sekolah setiap pelajaran PJOK. 3. Minum susu dan makan makanan bergizi seimbang saat istirahat.', kunciJawaban: 'Rubrik...', skorOtomatis: 0, skorManual: 3, skorFinal: 3, skorMaksimal: 3 }
    ]
  },
  {
    id: 'hp-03',
    penilaianId: 'ph-01',
    siswaId: 'sis-03',
    nisn: '0125678912',
    namaSiswa: 'Bintang Raditya Pratama',
    kelas: 6,
    rombel: 'A',
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    waktuMulai: '2026-10-12 08:00',
    waktuSelesai: '2026-10-12 08:49',
    totalSkorPerolehan: 13,
    totalSkorMaksimal: 16,
    nilaiAkhir: 81,
    statusKoreksi: 'sudah_dikoreksi',
    statusKelulusan: 'Tuntas',
    catatanEvaluasi: 'Baik, di atas KKTP (75). Tingkatkan ketelitian pada soal pilihan ganda kompleks.',
    dikoreksiOleh: 'Pudjiati, S.Pd.',
    tanggalKoreksi: '2026-10-12 11:40',
    jawaban: [
      { soalId: 'soal-1', nomor: 1, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-2', nomor: 2, tipe: 'pg', jawabanSiswa: 'B', kunciJawaban: 'A', isCorrectAuto: false, skorOtomatis: 0, skorFinal: 0, skorMaksimal: 1 },
      { soalId: 'soal-3', nomor: 3, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-4', nomor: 4, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-5', nomor: 5, tipe: 'pgk', jawabanSiswa: ['A', 'C'], kunciJawaban: ['A', 'C', 'D'], isCorrectAuto: false, skorOtomatis: 0, skorFinal: 0, skorMaksimal: 1 },
      { soalId: 'soal-6', nomor: 6, tipe: 'pgk', jawabanSiswa: ['B', 'D'], kunciJawaban: ['B', 'D'], isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-7', nomor: 7, tipe: 'isian', jawabanSiswa: 'kalsium', kunciJawaban: 'kalsium dan fosfor', skorOtomatis: 0, skorManual: 2, skorFinal: 2, skorMaksimal: 2 },
      { soalId: 'soal-8', nomor: 8, tipe: 'isian', jawabanSiswa: 'sendi engsel', kunciJawaban: 'sendi engsel', skorOtomatis: 0, skorManual: 2, skorFinal: 2, skorMaksimal: 2 },
      { soalId: 'soal-9', nomor: 9, tipe: 'uraian', jawabanSiswa: 'Otot lurik ada di tangan dan kaki kita bisa gerakkan sendiri. Otot polos ada di dalam perut bekerja otomatis.', kunciJawaban: 'Rubrik...', skorOtomatis: 0, skorManual: 2, skorFinal: 2, skorMaksimal: 3 },
      { soalId: 'soal-10', nomor: 10, tipe: 'uraian', jawabanSiswa: 'Duduk tegak, olahraga lari pagi, dan tidak membawa tas yang terlalu berat di punggung.', kunciJawaban: 'Rubrik...', skorOtomatis: 0, skorManual: 3, skorFinal: 3, skorMaksimal: 3 }
    ]
  },
  {
    id: 'hp-04',
    penilaianId: 'ph-01',
    siswaId: 'sis-04',
    nisn: '0126789023',
    namaSiswa: 'Nabila Nur Azizah',
    kelas: 6,
    rombel: 'A',
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    waktuMulai: '2026-10-12 08:00',
    waktuSelesai: '2026-10-12 08:44',
    totalSkorPerolehan: 6,
    totalSkorMaksimal: 16,
    nilaiAkhir: 38,
    statusKoreksi: 'menunggu_koreksi_manual',
    statusKelulusan: 'Perlu Bimbingan',
    catatanEvaluasi: 'Menunggu penilaian guru untuk bagian isian dan uraian.',
    jawaban: [
      { soalId: 'soal-1', nomor: 1, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-2', nomor: 2, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-3', nomor: 3, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-4', nomor: 4, tipe: 'pg', jawabanSiswa: 'A', kunciJawaban: 'A', isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-5', nomor: 5, tipe: 'pgk', jawabanSiswa: ['A', 'C', 'D'], kunciJawaban: ['A', 'C', 'D'], isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-6', nomor: 6, tipe: 'pgk', jawabanSiswa: ['B', 'D'], kunciJawaban: ['B', 'D'], isCorrectAuto: true, skorOtomatis: 1, skorFinal: 1, skorMaksimal: 1 },
      { soalId: 'soal-7', nomor: 7, tipe: 'isian', jawabanSiswa: 'mineral kalsium', kunciJawaban: 'kalsium dan fosfor', skorOtomatis: 0, skorManual: 0, skorFinal: 0, skorMaksimal: 2 },
      { soalId: 'soal-8', nomor: 8, tipe: 'isian', jawabanSiswa: 'engsel lutut', kunciJawaban: 'sendi engsel', skorOtomatis: 0, skorManual: 0, skorFinal: 0, skorMaksimal: 2 },
      { soalId: 'soal-9', nomor: 9, tipe: 'uraian', jawabanSiswa: 'Perbedaannya adalah otot lurik menempel pada rangka tulang sedangkan otot polos menempel pada lambung dan usus halus.', kunciJawaban: 'Rubrik...', skorOtomatis: 0, skorManual: 0, skorFinal: 0, skorMaksimal: 3 },
      { soalId: 'soal-10', nomor: 10, tipe: 'uraian', jawabanSiswa: 'Makan makanan yang sehat dan bergizi, tidak malas berolahraga saat jam senam, dan selalu duduk tegak saat mendengarkan penjelasan guru di kelas.', kunciJawaban: 'Rubrik...', skorOtomatis: 0, skorManual: 0, skorFinal: 0, skorMaksimal: 3 }
    ]
  }
];
