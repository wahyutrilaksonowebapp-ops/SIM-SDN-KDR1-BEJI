import { ProgramRemedialPengayaan } from '../types';

export const INITIAL_REMEDIAL_PENGAYAAN: ProgramRemedialPengayaan[] = [
  {
    id: 'rem-01',
    kodeProgram: 'REM-IPAS-6-2026-001',
    judul: 'Program Remedial Terarah: Penguatan Konsep Sistem Gerak & Persendian',
    jenis: 'remedial',
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    kelas: 6,
    rombel: 'A',
    materiPokok: 'Sistem Gerak Manusia (Rangka, Sendi, dan Otot)',
    tujuanPembelajaran: 'Mengidentifikasi jenis-jenis sendi gerak, membedakan otot rangka dengan otot polos, dan menerapkan upaya perawatan sistem gerak.',
    penilaianHarianId: 'ph-01',
    kkm: 75,
    tanggalDibuat: '2026-10-14',
    batasWaktu: '2026-10-21',
    guruPengampu: 'Pudjiati, S.Pd.',
    guruNip: '19790815 200801 2 015',
    rekomendasiMetodeGuru: 'Bimbingan terstruktur perorangan atau tutor sebaya sebelum siswa mengerjakan lembar penugasan perbaikan.',
    ringkasanMateriScaffolding: `Halo anak hebat! Mari kita ulas kembali 3 konsep kunci yang perlu diperkuat:
1. Persendian: Sendi engsel hanya bergerak satu arah (seperti siku dan lutut). Sendi peluru bergerak ke segala arah (pada panggul dan gelang bahu).
2. Otot: Otot lurik melekat pada rangka dan digerakkan secara sadar (volunter). Sedangkan otot polos bekerja tanpa kita sadari (involunter) di organ pencernaan.
3. Kepadatan Tulang: Tulang memerlukan mineral kalsium dan fosfor serta vitamin D dari sinar matahari pagi agar tetap padat dan tidak mudah keropos (osteoporosis).`,
    daftarSiswa: [
      {
        siswaId: 'sis-04',
        nisn: '0126789023',
        namaSiswa: 'Nabila Nur Azizah',
        kelas: 6,
        rombel: 'A',
        nilaiAwal: 38,
        kkm: 75,
        materiBelumDikuasai: [
          'Membedakan mekanisme kerja otot lurik dan otot polos',
          'Identifikasi jenis persendian gerak satu arah (sendi engsel)',
          'Nutrisi esensial pembentukan matriks tulang (kalsium & fosfor)'
        ],
        nilaiPerbaikan: 78,
        status: 'Tuntas Perbaikan',
        tanggalSelesai: '2026-10-18',
        catatanGuru: 'Telah mengikuti pendampingan perorangan dan berhasil memahami perbedaan otot volunter dan involunter dengan baik.'
      }
    ],
    soalList: [
      {
        nomor: 1,
        tipe: 'pg',
        pertanyaan: 'Manakah di antara pernyataan berikut yang benar mengenai sendi engsel pada tubuh manusia?',
        opsi: [
          'A. Memungkinkan gerakan memutar ke segala arah tanpa hambatan',
          'B. Hanya memungkinkan gerakan ke satu arah saja, seperti membuka dan menutup pintu',
          'C. Tidak dapat digerakkan sama sekali karena tersambung kaku',
          'D. Hanya ditemukan pada pertemuan antara tulang tengkorak kepala'
        ],
        kunciJawaban: 'B',
        petunjukPengerjaan: 'Bayangkan engsel pada pintu rumah saat membuka dan menutup.',
        indikatorMateri: 'Identifikasi mekanisme gerak sendi engsel'
      },
      {
        nomor: 2,
        tipe: 'pg',
        pertanyaan: 'Otot yang bekerja di luar kesadaran kita (bekerja otomatis) dan terdapat pada dinding lambung serta usus halus adalah ....',
        opsi: [
          'A. Otot polos',
          'B. Otot lurik (rangka)',
          'C. Otot bisep lengan',
          'D. Tendon persendian'
        ],
        kunciJawaban: 'A',
        petunjukPengerjaan: 'Otot ini tidak bisa kita perintahkan untuk berhenti saat mencerna makanan.',
        indikatorMateri: 'Klasifikasi jenis otot involunter'
      },
      {
        nomor: 3,
        tipe: 'isian',
        pertanyaan: 'Dua zat mineral penting yang diperoleh dari konsumsi susu, ikan, dan keju untuk menguatkan tulang adalah ....',
        kunciJawaban: 'kalsium dan fosfor',
        petunjukPengerjaan: 'Kalsium menguatkan kepadatan tulang.',
        indikatorMateri: 'Zat gizi pembentuk tulang'
      },
      {
        nomor: 4,
        tipe: 'isian',
        pertanyaan: 'Gangguan penurunan kepadatan tulang yang menyebabkan tulang menjadi rapuh dan mudah patah disebut ....',
        kunciJawaban: 'osteoporosis',
        petunjukPengerjaan: 'Istilah untuk kondisi pengeroposan tulang.',
        indikatorMateri: 'Kelainan pada tulang'
      },
      {
        nomor: 5,
        tipe: 'uraian',
        pertanyaan: 'Sebutkan 2 contoh kebiasaan hidup sehari-hari yang dapat kamu lakukan saat belajar di kelas SDN Kedungringin 1 agar tulang punggung tetap lurus dan sehat!',
        kunciJawaban: '1. Duduk dengan posisi tegak, tidak membungkuk atau miring. 2. Memakai tas ransel pada kedua pundak secara seimbang.',
        petunjukPengerjaan: 'Tuliskan tindakan konkret yang biasa kamu lakukan di bangku kelas.',
        indikatorMateri: 'Upaya preventif menjaga postur tubuh'
      }
    ],
    status: 'aktif'
  },
  {
    id: 'peng-01',
    kodeProgram: 'PENG-IPAS-6-2026-001',
    judul: 'Program Pengayaan Mandiri: Eksplorasi Biomekanika & Teknologi Prostetik Rangka',
    jenis: 'pengayaan',
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    kelas: 6,
    rombel: 'A',
    materiPokok: 'Sistem Gerak Manusia (Aplikasi Teknologi Tingkat Tinggi / HOTS)',
    tujuanPembelajaran: 'Menganalisis penerapan prinsip sendi dan tuas gerak manusia pada teknologi robotik prostetik dan kebugaran gravitasi mikro.',
    penilaianHarianId: 'ph-01',
    kkm: 75,
    tanggalDibuat: '2026-10-14',
    batasWaktu: '2026-10-25',
    guruPengampu: 'Pudjiati, S.Pd.',
    guruNip: '19790815 200801 2 015',
    rekomendasiMetodeGuru: 'Fasilitasi penugasan riset mini dan pembuatan bagan visual inovasi sains.',
    ringkasanMateriScaffolding: `Selamat atas capaian prestasi istimewa kalian! Karena kalian telah tuntas dengan nilai amat baik (>= 75), mari perdalam ilmu kalian ke tingkat HOTS:
- Biomekanika Robotik: Lengan robot dan kaki prostetik modern meniru persendian bola mangkuk (sendi peluru) dan tuas sendi engsel menggunakan motor servo cerdas.
- Kebugaran Antariksa: Di luar angkasa tanpa gravitasi, tubuh kehilangan kepadatan kalsium 1-2% setiap bulan. Latihan resistensi intensif adalah kunci para astronot mempertahankan kekuatan tulang.`,
    daftarSiswa: [
      {
        siswaId: 'sis-01',
        nisn: '0123456789',
        namaSiswa: 'Muhammad Fadhil Pratama',
        kelas: 6,
        rombel: 'A',
        nilaiAwal: 94,
        kkm: 75,
        materiBelumDikuasai: ['Pendalaman HOTS: Biomekanika Robotik & Tuas Rangka'],
        status: 'Sedang Dikerjakan',
        catatanGuru: 'Diberikan tugas proyek mini desain bagan lengan robot prostetik.'
      },
      {
        siswaId: 'sis-02',
        nisn: '0124958102',
        namaSiswa: 'Aisyah Putri Azzahra',
        kelas: 6,
        rombel: 'A',
        nilaiAwal: 100,
        kkm: 75,
        materiBelumDikuasai: ['Pendalaman HOTS: Analisis Kepadatan Tulang Gravitasi Nol'],
        nilaiPerbaikan: 100,
        status: 'Tuntas Perbaikan',
        tanggalSelesai: '2026-10-17',
        catatanGuru: 'Hasil karya analisis sains biomekanika sangat inovatif dan mendalam.'
      }
    ],
    soalList: [
      {
        nomor: 1,
        tipe: 'pg',
        pertanyaan: 'Bagaimanakah teknologi lengan bionik prostetik modern memanfaatkan sinyal dari otot tubuh manusia?',
        opsi: [
          'A. Memasang sensor EMG di permukaan kulit yang menerjemahkan impuls listrik kontraksi otot menjadi perintah motorik',
          'B. Menghubungkan kabel baja manual secara langsung ke pembuluh darah',
          'C. Menghilangkan fungsi peregangan otot agar baterai bionik lebih awet',
          'D. Menggunakan magnet permanen yang tidak membutuhkan sinyal otak sama sekali'
        ],
        kunciJawaban: 'A',
        petunjukPengerjaan: 'Analisis prinsip sensor elektromiografi (EMG).',
        indikatorMateri: 'Pemanfaatan biomekanika elektroda bionik'
      },
      {
        nomor: 2,
        tipe: 'pg',
        pertanyaan: 'Mengapa astronot di Stasiun Luar Angkasa Internasional (ISS) wajib melakukan latihan treadmill dengan sabuk pengikat khusus?',
        opsi: [
          'A. Agar suhu tubuh mereka tidak mengalami kedinginan di orbit',
          'B. Untuk memberikan tekanan beban simulasi gravitasi sehingga matriks kalsium tulang tidak menyusut drastis',
          'C. Membantu sistem sirkulasi darah mengalir lebih cepat ke arah kepala',
          'D. Menghindari gangguan penglihatan akibat paparan radiasi kosmik'
        ],
        kunciJawaban: 'B',
        petunjukPengerjaan: 'Kaitkan dengan osteopenia akibat mikrogravitasi.',
        indikatorMateri: 'Mekanisme dampak gravitasi terhadap massa tulang'
      },
      {
        nomor: 3,
        tipe: 'isian',
        pertanyaan: 'Pada sistem gerak manusia yang berfungsi sebagai tuas (pengungkit) jenis pertama, titik tumpu berada di antara titik beban dan titik kuasa. Contohnya adalah gerakan mengangguk pada sendi antara leher dan tulang ....',
        kunciJawaban: 'tengkorak atau atlas',
        petunjukPengerjaan: 'Sendi atlas yang menopang tempurung kepala.',
        indikatorMateri: 'Aplikasi prinsip fisika tuas pada sistem gerak manusia'
      },
      {
        nomor: 4,
        tipe: 'isian',
        pertanyaan: 'Bahan polimer canggih yang ringan namun sangat kokoh dan sering dipakai sebagai pengganti struktur tulang pada implan medis modern adalah serat ....',
        kunciJawaban: 'karbon atau titanium',
        petunjukPengerjaan: 'Bahan biokompatibel yang tidak ditolak oleh jaringan tubuh.',
        indikatorMateri: 'Material medis implan rangka'
      },
      {
        nomor: 5,
        tipe: 'uraian',
        pertanyaan: 'Buatlah sebuah gagasan inovasi sederhana yang dapat diterapkan di SDN Kedungringin 1 Beji untuk mendeteksi atau mengingatkan siswa jika postur duduk mereka mulai membungkuk saat mengetik di Chromebook!',
        kunciJawaban: 'Contoh ide: Memanfaatkan kamera Chromebook dengan program AI pose estimation sederhana yang membunyikan lonceng lembut atau memunculkan ikon peringatan jika sudut pundak miring lebih dari 15 derajat selama 5 menit.',
        petunjukPengerjaan: 'Gunakan daya imajinasi kreatifmu untuk memecahkan masalah nyata.',
        indikatorMateri: 'Desain rekayasa teknologi ergonomis sekolah'
      }
    ],
    status: 'aktif'
  }
];
