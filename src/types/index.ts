export type TabType = 
  | 'login'
  | 'dashboard' 
  | 'kepegawaian' 
  | 'kesiswaan' 
  | 'sarpras' 
  | 'keadministrasian' 
  | 'google_integration';

export type KesiswaanSubTab = 'siswa' | 'penilaian_harian' | 'penilaian' | 'remedial_pengayaan' | 'tabungan' | 'presensi';
export type KeadministrasianSubTab = 'surat_keluar' | 'surat_masuk' | 'perangkat_pembelajaran';
export type SarprasSubTab = 'inventaris' | 'perpustakaan' | 'ruang_kelas';

export interface ProfilSekolah {
  nama: string;
  npsn: string;
  bentukPendidikan: string;
  status: string;
  akreditasi: string;
  skPendirian: string;
  tanggalSk: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  pangkatKepalaSekolah: string;
  tahunPelajaranAktif: string;
  tanggalAcuanUsia: string; // Misal '2024-07-01'
}

export interface SKPangkat {
  nomor: string;
  tanggal: string; // YYYY-MM-DD (Tanggal Surat)
  tmt: string;     // YYYY-MM-DD (TMT Pangkat)
  masaKerjaTahun?: number;
  masaKerjaBulan?: number;
  gajiPokok?: number; // Rupiah
  pejabatPenetap?: string;
}

export interface SKBerkala {
  nomor: string;
  tanggal: string; // YYYY-MM-DD (Tanggal Surat)
  tmt: string;     // YYYY-MM-DD (TMT KGB)
  masaKerjaTahun?: number;
  masaKerjaBulan?: number;
  gajiPokok: number; // Rupiah
  tmtBerikutnya: string; // YYYY-MM-DD (2 tahun kemudian)
  pejabatPenetap?: string;
}

export interface SKAngkatan {
  nomor: string;
  tanggal: string; // YYYY-MM-DD (Tanggal Surat)
  tmt: string;     // YYYY-MM-DD (TMT Pengangkatan Pertama/CPNS/PPPK/PTT)
  pejabatPenetap?: string;
  golonganAwal?: string;
}

export interface Pegawai {
  id: string;
  nip: string;
  nama: string;
  gelarDepan?: string;
  gelarBelakang?: string;
  jenisKelamin: 'L' | 'P';
  golongan: string; // IV/b, IV/a, III/d, III/c, III/b, IX PPPK, GTT, PTT
  pangkat?: string; // Pembina Tk. I, Penata, Ahli Pertama, dll
  jabatan: string;  // Kepala Sekolah, Guru Kelas 1, Guru PJOK, Operator, dll.
  kontak: string;
  email: string;
  tmt: string;      // YYYY-MM-DD
  statusKepegawaian: 'PNS' | 'PPPK' | 'GTT' | 'PTT' | 'Non ASN';
  pendidikanTerakhir: string;
  tempatLahir: string;
  tanggalLahir: string;
  // Data Kepegawaian Lanjutan ASN
  skPangkatTerakhir?: SKPangkat; // SK Tingkat
  skBerkalaTerakhir?: SKBerkala; // SK Berkala (KGB)
  skAngkatan?: SKAngkatan;       // SK Angkatan
  mkgTahun?: number;  // Masa Kerja Golongan (Tahun)
  mkgBulan?: number;  // Masa Kerja Golongan (Bulan)
  karpeg?: string;    // Kartu Pegawai
  nomorTaspen?: string;
  npwp?: string;
  unitKerja?: string; // SDN Kedungringin I  Beji
}

export interface FaceprintPresensi {
  id: string;
  pegawaiId: string;
  nip: string;
  nama: string;
  tanggal: string; // YYYY-MM-DD
  jamMasuk: string; // HH:mm:ss
  jamPulang: string; // HH:mm:ss
  mesinId: string; // misal "FP-SDNKDR1-BEJI-01"
  statusKehadiran: 'Hadir Tepat Waktu' | 'Terlambat' | 'Pulang Cepat' | 'Dinas Luar' | 'Izin' | 'Sakit' | 'Cuti';
  keterlambatanMenit: number;
  pulangCepatMenit: number;
  efektifJamKerja: number; // Dalam jam desimal misal 7.5
  verifikasi: 'Face Recognition Biometrik 99.8%' | 'Fingerprint Cadangan' | 'Disposisi Kepala Sekolah';
  lokasiGps?: string;
  catatan?: string;
}

export interface SkpTargetKinerja {
  id: string;
  rencanaKinerja: string;
  indikator: string;
  targetKuantitas: string;
  realisasi: string;
  umpanBalik: string;
  capaian: 'Diatas Ekspektasi' | 'Sesuai Ekspektasi' | 'Dibawah Ekspektasi';
}

export interface SkpPerilakuBerAKHLAK {
  aspek: 'Berorientasi Pelayanan' | 'Akuntabel' | 'Kompeten' | 'Harmonis' | 'Loyal' | 'Adaptif' | 'Kolaboratif';
  ekspektasiPimpinan: string;
  umpanBalik: string;
}

export interface SkpEKinerja {
  id: string;
  pegawaiId: string;
  nip: string;
  nama: string;
  jabatan: string;
  pangkatGolongan: string;
  tahun: number;
  tribulan: 1 | 2 | 3 | 4; // Tribulan I (Jan-Mar), II (Apr-Jun), III (Jul-Sep), IV (Okt-Des)
  periodeAwal: string;
  periodeAkhir: string;
  pejabatPenilaiNama: string;
  pejabatPenilaiNip: string;
  pejabatPenilaiJabatan: string;
  targetKinerja: SkpTargetKinerja[];
  perilakuKerja: SkpPerilakuBerAKHLAK[];
  predikatKinerja: 'Sangat Baik' | 'Baik' | 'Butuh Perbaikan' | 'Kurang' | 'Sangat Kurang';
  ratingHasilKerja: 'Diatas Ekspektasi' | 'Sesuai Ekspektasi' | 'Dibawah Ekspektasi';
  ratingPerilaku: 'Diatas Ekspektasi' | 'Sesuai Ekspektasi' | 'Dibawah Ekspektasi';
  catatanRekomendasi: string;
  tanggalPenilaian: string;
}

export interface Siswa {
  id: string;
  nisn: string;
  nis: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  agama: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  kelas: number; // 1 s.d 6
  rombel: string; // 'A' or 'B'
  namaAyah: string;
  namaIbu: string;
  alamat: string;
  noHpOrtu: string;
  tmtDiterima: string;
  statusSiswa: 'Aktif' | 'Lulus' | 'Pindah';
}

export type UserRole = 'guest' | 'admin' | 'guru' | 'siswa';

export interface AuthUser {
  id?: string;
  role: UserRole;
  name: string;
  nip?: string;
  jabatan?: string;
  kelas?: number; // Rombongan belajar / tingkat kelas (1-6)
  rombel?: string; // Label rombel, misal "Kelas 4", "Semua Kelas"
  nisn?: string;
}

export interface NilaiTKA {
  numerasi: number;     // Matematika (Numerasi) - Mapel Wajib
  literasi: number;     // Bahasa Indonesia (Literasi) - Mapel Wajib
  ipaPilihan: number;   // Ilmu Pengetahuan Alam (IPA) - Mapel Pilihan
  rataRata: number;
  predikat?: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan';
  nomorPeserta?: string;
  catatan?: string;
}

export interface NilaiSemesterMap {
  [mapel: string]: number; // e.g. "Pendidikan Pancasila": 88
}

export interface RekapRaporSiswa {
  id: string;
  siswaId: string;
  nisn: string;
  namaSiswa: string;
  kelas: number;
  rombel: string;
  // Semester 7 s.d. 12
  semester7: NilaiSemesterMap; // Kelas 4 Sem 1
  semester8: NilaiSemesterMap; // Kelas 4 Sem 2
  semester9: NilaiSemesterMap; // Kelas 5 Sem 1
  semester10: NilaiSemesterMap; // Kelas 5 Sem 2
  semester11: NilaiSemesterMap; // Kelas 6 Sem 1
  semester12: NilaiSemesterMap; // Kelas 6 Sem 2
  // Tes Kemampuan Akademik (TKA)
  tka?: NilaiTKA;
}

export interface NilaiIjazahBTQ {
  id: string;
  siswaId: string;
  nisn: string;
  namaSiswa: string;
  kelas: number;
  noSertifikat: string;
  tahsin: number; // 0-100
  tajwid: number; // 0-100
  tahfidz: number; // 0-100
  menulis: number; // 0-100
  membaca: number; // 0-100
  rataRata: number;
  predikat: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul' | 'Kurang';
  statusKelulusan: 'Lulus' | 'Remedial';
  catatan: string;
  tanggalTerbit: string;
  penguji: string;
}

export interface SarprasItem {
  id: string;
  namaSarpras: string;
  kategori: 'Ruang Pembelajaran' | 'Ruang Penunjang' | 'Sanitasi & Ibadah' | 'Fasilitas Terbuka' | 'Peralatan';
  jumlah: number;
  satuan: string;
  luasM2?: number;
  kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  fotoUrl: string;
  keterangan: string;
  lokasi: string;
}

export interface SuratKeluar {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  perihal: string;
  jenisSurat: 'keterangan_siswa' | 'keterangan_guru' | 'surat_tugas' | 'undangan' | 'pemberitahuan';
  tujuan: string;
  ringkasan: string;
  fullContent?: string;
  pejabatNip: string;
  status: 'Draf' | 'Ditandatangani' | 'Terkirim';
}

export interface SuratMasuk {
  id: string;
  nomorAgenda: string;
  nomorSuratMasuk: string;
  tanggalSurat: string;
  tanggalDiterima: string;
  pengirim: string;
  perihal: string;
  lampiran: string;
  disposisiKepsek: string;
  ditujukanKepada: string;
  statusDisposisi: 'Belum Disposisi' | 'Proses Tindak Lanjut' | 'Selesai';
}

export interface AIInsightData {
  executiveSummary: string;
  academicHighlights: string[];
  btqHighlights: string[];
  sarprasStatus: string;
  actionableRecommendations: string[];
  lastGenerated?: string;
}

// ==========================================
// KEADMINISTRASIAN KEPUSTAKAAN (PERPUSTAKAAN)
// ==========================================

export interface BukuPerpustakaan {
  id: string;
  kodeBuku: string;       // e.g. "B-KMR-001"
  isbn: string;           // e.g. "978-623-1234-56-7"
  judul: string;
  pengarang: string;
  penerbit: string;
  tahunTerbit: number;
  kategori: 'Kurikulum Merdeka' | 'Buku Bacaan / Fiksi' | 'Referensi & Kamus' | 'Sains & Teknologi' | 'Agama & Budi Pekerti' | 'Muatan Lokal';
  jumlahEksemplar: number;
  jumlahTersedia: number;
  rakLokasi: string;      // e.g. "Rak A-02"
  kondisi: 'Baik' | 'Rusak Ringan';
  coverUrl?: string;
  sinopsis?: string;
}

export interface PeminjamanBuku {
  id: string;
  kodePeminjaman: string;
  bukuId: string;
  judulBuku: string;
  kodeBuku: string;
  anggotaId: string;
  namaPeminjam: string;
  jenisPeminjam: 'Siswa' | 'Guru';
  kelas?: string;
  tanggalPinjam: string;   // YYYY-MM-DD
  batasKembali: string;    // YYYY-MM-DD
  tanggalKembali?: string; // YYYY-MM-DD
  status: 'Dipinjam' | 'Dikembalikan' | 'Terlambat';
  denda?: number;
  keterangan?: string;
}

export interface AnggotaPerpustakaan {
  id: string;
  nomorAnggota: string;   // e.g. "LIB-2024-001"
  nama: string;
  tipe: 'Siswa' | 'Guru';
  nisnOrNip: string;
  kelasOrUnit: string;
  jenisKelamin: 'L' | 'P';
  tanggalDaftar: string;
  status: 'Aktif' | 'Non-Aktif';
  jumlahPinjamanAktif: number;
  fotoUrl?: string;
}

export interface PengunjungPerpustakaan {
  id: string;
  tanggal: string;
  jam: string;
  nama: string;
  tipe: 'Siswa' | 'Guru' | 'Tamu';
  kelasOrUnit: string;
  keperluan: 'Membaca di Tempat' | 'Peminjaman / Pengembalian' | 'Literasi Digital' | 'Diskusi / Tugas Kelompok';
}

// ==========================================
// GEDUNG RUANG KELAS 1 s.d. 6
// ==========================================

export interface StrukturOrganisasiKelas {
  waliKelas: string;
  nipWaliKelas: string;
  ketuaKelas: string;
  wakilKetua: string;
  sekretaris1: string;
  sekretaris2?: string;
  bendahara1: string;
  bendahara2?: string;
  seksiKebersihan: string[];
  seksiKeamanan: string[];
  seksiKeagamaan: string[];
  seksiUpacaraDanKerapian: string[];
}

export interface JadwalPiketHari {
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  petugas: string[]; // nama-nama siswa
  tugasUtama: string;
}

export interface JadwalPelajaranItem {
  jamKe: number;
  waktu: string; // e.g. "07.00 - 07.35"
  senin: { mapel: string; guru: string };
  selasa: { mapel: string; guru: string };
  rabu: { mapel: string; guru: string };
  kamis: { mapel: string; guru: string };
  jumat: { mapel: string; guru: string };
  sabtu: { mapel: string; guru: string };
}

export interface LMSMateriKelas {
  id: string;
  judul: string;
  mataPelajaran: string;
  tipe: 'Materi / Modul' | 'Tugas Harian' | 'Video Pembelajaran' | 'Pengumuman';
  tanggalPosting: string;
  deskripsi: string;
  linkSumber?: string;
  fileLampiran?: string;
  statusPengumpulan?: string;
}

export interface RefleksiHarianKelas {
  id: string;
  tanggal: string; // YYYY-MM-DD
  mataPelajaran: string;
  topikBahasan: string;
  pemahamanBaru: string;     // Apa hal baru yang dipahami hari ini
  kendalaAtauTantangan: string; // Hal yang masih membingungkan
  suasanaBelajar: 'Sangat Menyenangkan 🤩' | 'Senang & Paham 😊' | 'Biasa Saja 😐' | 'Butuh Penjelasan Ulang 😕';
  ditulisOleh: string;       // Nama siswa / perwakilan kelas
  catatanWaliKelas?: string; // Feedback dari wali kelas / guru
}

export interface RuangKelasDetail {
  kelas: number; // 1 s.d 6
  namaRuang: string; // "Gedung Ruang Kelas 1", dll
  lokasiGedung: string;
  luasM2: number;
  kapasitasSiswa: number;
  kondisi: 'Sangat Baik' | 'Baik' | 'Perlu Perbaikan';
  fotoUrl: string;
  waliKelas: string;
  nipWaliKelas: string;
  mottoKelas: string;
  inventaris: {
    mejaSiswa: number;
    kursiSiswa: number;
    mejaGuru: number;
    kursiGuru: number;
    papanTulis: string;
    kipasAtauAc: string;
    pojokBaca: string;
    proyektor: string;
    lemariKelas: number;
  };
  strukturOrganisasi: StrukturOrganisasiKelas;
  jadwalPiket: JadwalPiketHari[];
  jadwalPelajaran: JadwalPelajaranItem[];
  lms: LMSMateriKelas[];
  refleksi: RefleksiHarianKelas[];
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO 8601 string
  role: UserRole;
  userName: string;
  userNip?: string;
  action: 'LOGIN' | 'LOGOUT' | 'TAMBAH' | 'UBAH' | 'HAPUS';
  category: 'AUTENTIKASI' | 'SISWA' | 'RAPOR' | 'SURAT' | 'SARPRAS' | 'PEGAWAI' | 'SISTEM';
  description: string;
  details?: string;
}

// ==================== TABUNGAN SISWA ====================
export interface TabunganTransaksi {
  id: string;
  siswaId: string;
  nisn: string;
  namaSiswa: string;
  kelas: number;
  rombel: string;
  tanggal: string; // YYYY-MM-DD
  jenis: 'setor' | 'tarik';
  jumlah: number; // Rupiah
  saldoSebelumnya: number;
  saldoSetelahnya: number;
  keterangan: string;
  dicatatOleh: string;
  createdAt?: string;
}

export interface SaldoAwalTabungan {
  id: string;
  siswaId: string;
  nisn: string;
  namaSiswa: string;
  kelas: number;
  saldoAwal: number;
  tanggalTetap: string;
}

// ==================== PRESENSI SISWA ====================
export interface PresensiHarianRecord {
  siswaId: string;
  nisn: string;
  namaSiswa: string;
  status: 'H' | 'S' | 'I' | 'TK'; // Hadir, Sakit, Izin, Tanpa Keterangan
  catatan?: string;
}

export interface PresensiHarianSiswa {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kelas: number;
  rombel: string;
  guruPencatat: string;
  records: PresensiHarianRecord[];
  createdAt?: string;
}

export interface PresensiRekapBulananRecord {
  siswaId: string;
  nisn: string;
  namaSiswa: string;
  s: number;  // Sakit
  i: number;  // Izin
  tk: number; // Tanpa Keterangan / Alpa
  j: number;  // Jumlah Total Hadir / Kehadiran
  persentaseKehadiran?: number;
}

export interface PresensiRekapBulan {
  id: string;
  bulan: string; // "2026-07" atau "Juli 2026"
  kelas: number;
  rombel: string;
  hariEfektif: number;
  records: PresensiRekapBulananRecord[];
  guruPencatat: string;
  updatedAt?: string;
}

// ==================== PENILAIAN HARIAN (CBT & KURIKULUM MERDEKA) ====================
export type TipeSoal = 'pg' | 'pgk' | 'isian' | 'uraian';

export interface SoalItem {
  id: string;
  nomor: number;
  tipe: TipeSoal;
  pertanyaan: string;
  opsi?: string[]; // Untuk PG (1 jawaban benar) & PGK (beberapa jawaban benar), e.g. ["A. ...", "B. ..."]
  kunciJawaban: string | string[]; // PG: "A", PGK: ["A", "C"], Isian: "fotosintesis", Uraian: "kriteria..."
  bobotPoin: number; // PG: 1, PGK: 1, Isian: 2, Uraian: 3
  indikatorSoal?: string;
  levelKognitif?: 'C1' | 'C2' | 'C3' | 'C4';
  pembahasan?: string;
}

export interface PenilaianHarian {
  id: string;
  kodeUjian: string;
  judul: string;
  mataPelajaran: string;
  kelas: number;
  rombel: string;
  materiPokok: string;
  tujuanPembelajaran: string;
  durasiMenit: number;
  tahunPelajaran: string;
  semester: number;
  soalList: SoalItem[];
  kkm: number; // KKTP (Kriteria Ketercapaian Tujuan Pembelajaran, default 75)
  guruPengampu: string;
  guruNip?: string;
  tanggalDibuat: string;
  status: 'aktif' | 'selesai' | 'draf';
}

export interface JawabanSiswaItem {
  soalId: string;
  nomor: number;
  tipe: TipeSoal;
  jawabanSiswa: string | string[]; // PG: "A", PGK: ["A", "B"], Isian: "teks", Uraian: "teks"
  kunciJawaban: string | string[];
  isCorrectAuto?: boolean;
  skorOtomatis: number;
  skorManual?: number; // Kebijakan Guru: Isian (0-2), Uraian (0-3)
  skorFinal: number;
  skorMaksimal: number;
  catatanGuru?: string;
}

export interface HasilPenilaianSiswa {
  id: string;
  penilaianId: string;
  siswaId: string;
  nisn: string;
  namaSiswa: string;
  kelas: number;
  rombel: string;
  mataPelajaran: string;
  waktuMulai?: string;
  waktuSelesai: string;
  jawaban: JawabanSiswaItem[];
  totalSkorPerolehan: number;
  totalSkorMaksimal: number;
  nilaiAkhir: number; // Skala 100
  statusKoreksi: 'menunggu_koreksi_manual' | 'sudah_dikoreksi';
  statusKelulusan: 'Tuntas' | 'Belum Tuntas' | 'Perlu Bimbingan';
  catatanEvaluasi?: string;
  dikoreksiOleh?: string;
  tanggalKoreksi?: string;
}

// ==================== REMEDIAL & PENGAYAAN (AI-POWERED) ====================
export interface ButirSoalRemedial {
  nomor: number;
  tipe: 'pg' | 'isian' | 'uraian';
  pertanyaan: string;
  opsi?: string[];
  kunciJawaban: string;
  petunjukPengerjaan?: string;
  indikatorMateri?: string;
}

export interface SiswaRemedialPengayaanItem {
  siswaId: string;
  nisn: string;
  namaSiswa: string;
  kelas: number;
  rombel: string;
  nilaiAwal: number;
  kkm: number;
  materiBelumDikuasai: string[]; // Materi / TP yang perlu penguatan
  nilaiPerbaikan?: number; // Skor perbaikan (Maksimal KKTP/KKM atau nilai aktual baru)
  status: 'Belum Mengumpulkan' | 'Sedang Dikerjakan' | 'Tuntas Perbaikan';
  tanggalSelesai?: string;
  catatanGuru?: string;
  jawabanSiswa?: Record<number, string>; // Jawaban pengerjaan siswa jika dikerjakan di web
}

export interface ProgramRemedialPengayaan {
  id: string;
  kodeProgram: string;
  judul: string;
  jenis: 'remedial' | 'pengayaan'; // Remedial (< KKM) vs Pengayaan (>= KKM)
  mataPelajaran: string;
  kelas: number;
  rombel: string;
  materiPokok: string;
  tujuanPembelajaran: string;
  penilaianHarianId?: string; // Tautan ke ID Penilaian Harian terkait
  kkm: number; // Standar KKTP (default 75)
  tanggalDibuat: string;
  batasWaktu: string;
  guruPengampu: string;
  guruNip?: string;
  ringkasanMateriScaffolding: string; // Materi penjelasan konsep terarah yang digenerate AI
  daftarSiswa: SiswaRemedialPengayaanItem[];
  soalList: ButirSoalRemedial[];
  status: 'aktif' | 'selesai' | 'arsip';
  rekomendasiMetodeGuru?: string;
}


