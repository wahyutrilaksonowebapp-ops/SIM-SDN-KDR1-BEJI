/**
 * Kalkulasi Usia Siswa Berdasarkan Tanggal Acuan (Contoh: 1 Juli Tahun Pelajaran Berjalan)
 */
export function calculateAge(birthDateStr: string, referenceDateStr: string = '2024-07-01'): {
  years: number;
  months: number;
  days: number;
  formatted: string;
  ageCategory: string;
} {
  if (!birthDateStr) {
    return { years: 0, months: 0, days: 0, formatted: '-', ageCategory: '-' };
  }

  const birthDate = new Date(birthDateStr);
  const refDate = new Date(referenceDateStr);

  if (isNaN(birthDate.getTime()) || isNaN(refDate.getTime())) {
    return { years: 0, months: 0, days: 0, formatted: '-', ageCategory: '-' };
  }

  let years = refDate.getFullYear() - birthDate.getFullYear();
  let months = refDate.getMonth() - birthDate.getMonth();
  let days = refDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonthLastDay = new Date(refDate.getFullYear(), refDate.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  let ageCategory = '6 - 7 Tahun';
  if (years < 6) ageCategory = '< 6 Tahun (Di Bawah Umur)';
  else if (years === 6) ageCategory = '6 Tahun';
  else if (years === 7) ageCategory = '7 Tahun';
  else if (years === 8) ageCategory = '8 Tahun';
  else if (years === 9) ageCategory = '9 Tahun';
  else if (years === 10) ageCategory = '10 Tahun';
  else if (years === 11) ageCategory = '11 Tahun';
  else if (years === 12) ageCategory = '12 Tahun';
  else if (years >= 13) ageCategory = '≥ 13 Tahun';

  return {
    years,
    months,
    days,
    formatted: `${years} thn ${months} bln`,
    ageCategory,
  };
}

/**
 * Format Tanggal Indonesia
 */
export function formatIndoDate(dateStr: string): string {
  if (!dateStr) return '-';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

/**
 * Terbilang Angka 0 - 100 untuk Sertifikat Resmi
 */
export function angkaTerbilang(n: number): string {
  const rounded = Math.round(n);
  const words = [
    'Nol', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan',
    'Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas',
    'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'
  ];

  if (rounded < 20) return words[rounded];
  if (rounded < 100) {
    const tens = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh'];
    const ten = Math.floor(rounded / 10);
    const unit = rounded % 10;
    return unit > 0 ? `${tens[ten]} ${words[unit]}` : tens[ten];
  }
  if (rounded === 100) return 'Seratus';
  return String(rounded);
}

/**
 * Tentukan Predikat Nilai BTQ
 */
export function getBTQPredicate(average: number): {
  predikat: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul' | 'Kurang';
  labelIndo: string;
  lulus: boolean;
  colorClass: string;
} {
  if (average >= 90) {
    return { predikat: 'Mumtaz', labelIndo: 'Sangat Baik (Mumtaz)', lulus: true, colorClass: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
  } else if (average >= 80) {
    return { predikat: 'Jayyid Jiddan', labelIndo: 'Baik Sekali (Jayyid Jiddan)', lulus: true, colorClass: 'text-blue-700 bg-blue-100 border-blue-300' };
  } else if (average >= 75) {
    return { predikat: 'Jayyid', labelIndo: 'Baik (Jayyid)', lulus: true, colorClass: 'text-amber-700 bg-amber-100 border-amber-300' };
  } else if (average >= 60) {
    return { predikat: 'Maqbul', labelIndo: 'Cukup (Maqbul)', lulus: true, colorClass: 'text-orange-700 bg-orange-100 border-orange-300' };
  } else {
    return { predikat: 'Kurang', labelIndo: 'Kurang (Perlu Bimbingan)', lulus: false, colorClass: 'text-red-700 bg-red-100 border-red-300' };
  }
}

/**
/**
 * Bobot Hirarki DUK (Daftar Urutan Kepangkatan Standar BKN / Kemdikbud)
 * Tier 0: Kepala Sekolah (Nomor Urut 1)
 * Tier 1: PNS (Golongan IV > III > II > I)
 * Tier 2: PPPK (Golongan PPPK XVII s.d. VII)
 * Tier 3: Non-ASN (GTT, PTT, Honorer, Tenaga Kependidikan)
 */
export function getDukTier(status: string = '', jabatan: string = ''): number {
  if ((jabatan || '').toLowerCase().includes('kepala sekolah')) {
    return 0; // Prioritas utama DUK
  }
  const s = (status || '').toUpperCase().trim();
  if (s === 'PNS') return 1;
  if (s === 'PPPK') return 2;
  return 3; // Non ASN (GTT, PTT, Honorer)
}

/**
 * Bobot Pangkat / Golongan PNS (Golongan IV > III > II > I)
 */
export function getPnsRankWeight(golonganStr: string = ''): number {
  const str = (golonganStr || '').toUpperCase().trim();
  if (str.includes('IV/E')) return 450;
  if (str.includes('IV/D')) return 440;
  if (str.includes('IV/C')) return 430;
  if (str.includes('IV/B')) return 420;
  if (str.includes('IV/A') || str.includes('IV')) return 410;

  if (str.includes('III/D')) return 340;
  if (str.includes('III/C')) return 330;
  if (str.includes('III/B')) return 320;
  if (str.includes('III/A') || str.includes('III')) return 310;

  if (str.includes('II/D')) return 240;
  if (str.includes('II/C')) return 230;
  if (str.includes('II/B')) return 220;
  if (str.includes('II/A') || str.includes('II')) return 210;

  if (str.includes('I/D')) return 140;
  if (str.includes('I/C')) return 130;
  if (str.includes('I/B')) return 120;
  if (str.includes('I/A') || str.includes('I/')) return 110;

  return 100;
}

/**
 * Bobot Golongan PPPK (Golongan XVII s.d. VII)
 */
export function getPppkRankWeight(golonganStr: string = ''): number {
  const str = (golonganStr || '').toUpperCase().trim();
  if (str.includes('XVII') || str.includes('17')) return 170;
  if (str.includes('XVI') || str.includes('16')) return 160;
  if (str.includes('XV') || str.includes('15')) return 150;
  if (str.includes('XIV') || str.includes('14')) return 140;
  if (str.includes('XIII') || str.includes('13')) return 130;
  if (str.includes('XII') || str.includes('12')) return 120;
  if (str.includes('XI') || str.includes('11')) return 110;
  if (str.includes('X') || str.includes('10')) return 100;
  if (str.includes('IX') || str.includes('9')) return 90;
  if (str.includes('VIII') || str.includes('8')) return 80;
  if (str.includes('VII') || str.includes('7')) return 70;
  if (str.includes('VI') || str.includes('6')) return 60;
  if (str.includes('V') || str.includes('5')) return 50;
  return 40;
}

export function getGolonganWeight(golonganStr: string = '', statusKepegawaian: string = ''): number {
  const s = (statusKepegawaian || '').toUpperCase().trim();
  if (s === 'PNS') return getPnsRankWeight(golonganStr);
  if (s === 'PPPK') return getPppkRankWeight(golonganStr);
  return 10;
}

/**
 * Ambil tanggal lahir (timestamp) dari field tanggalLahir atau parsing 8 digit awal NIP
 */
export function getBirthTimestamp(tanggalLahir?: string, nip?: string): number {
  if (tanggalLahir && tanggalLahir.trim() && tanggalLahir !== '-') {
    const d = new Date(tanggalLahir);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // Jika tanggalLahir tidak valid, ambil dari 8 digit awal NIP (contoh: 19740512...)
  if (nip) {
    const cleanNip = nip.replace(/[\s\-\.]/g, '');
    if (cleanNip.length >= 8) {
      const year = cleanNip.substring(0, 4);
      const month = cleanNip.substring(4, 6);
      const day = cleanNip.substring(6, 8);
      const d = new Date(`${year}-${month}-${day}`);
      if (!isNaN(d.getTime())) return d.getTime();
    }
  }

  // Default tanggal netral jauh di masa kini
  return 9999999999999;
}

/**
 * Sorting Pegawai berdasarkan DUK (Daftar Urutan Kepangkatan) Resmi:
 * 1. Kepala Sekolah selalu nomor urut #1
 * 2. PNS dengan pangkat tertinggi (Golongan IV, Golongan III, Golongan II, Golongan I)
 * 3. PPPK diurutkan setelah PNS (berdasarkan Golongan PPPK tertinggi)
 * 4. Non-ASN (GTT / PTT / Honorer) di urutan terbawah
 * 5. Jika terdapat golongan yang sama, gunakan urutan tahun kelahiran tertua (tanggal lahir lebih awal).
 */
export function sortPegawaiDUK<T extends { 
  jabatan: string; 
  statusKepegawaian: string; 
  golongan: string; 
  tanggalLahir?: string; 
  nip?: string;
  nama: string;
  tmt?: string;
}>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    // 1. Hierarki Tier DUK:
    // Tier 0: Kepala Sekolah
    // Tier 1: PNS
    // Tier 2: PPPK
    // Tier 3: Non ASN
    const tierA = getDukTier(a.statusKepegawaian, a.jabatan);
    const tierB = getDukTier(b.statusKepegawaian, b.jabatan);

    if (tierA !== tierB) {
      return tierA - tierB; // Tier lebih kecil berada di atas (0 -> 1 -> 2 -> 3)
    }

    // 2. Dalam Tier yang sama, bandingkan bobot Golongan Pangkat
    let weightA = 0;
    let weightB = 0;

    if (tierA === 0) {
      // Sama-sama kepala sekolah (atau pelaksana)
      weightA = getPnsRankWeight(a.golongan);
      weightB = getPnsRankWeight(b.golongan);
    } else if (tierA === 1) {
      // PNS: Golongan IV > III > II > I
      weightA = getPnsRankWeight(a.golongan);
      weightB = getPnsRankWeight(b.golongan);
    } else if (tierA === 2) {
      // PPPK: Golongan XVII s.d. VII
      weightA = getPppkRankWeight(a.golongan);
      weightB = getPppkRankWeight(b.golongan);
    } else {
      // Non-ASN: GTT biasanya di atas PTT
      weightA = (a.statusKepegawaian || '').toUpperCase() === 'GTT' ? 20 : 10;
      weightB = (b.statusKepegawaian || '').toUpperCase() === 'GTT' ? 20 : 10;
    }

    if (weightA !== weightB) {
      return weightB - weightA; // Descending: golongan lebih tinggi di atas
    }

    // 3. Jika Golongan sama: Urutan tahun kelahiran tertua (tanggal lahir lebih awal)
    const birthA = getBirthTimestamp(a.tanggalLahir, a.nip);
    const birthB = getBirthTimestamp(b.tanggalLahir, b.nip);

    if (birthA !== birthB) {
      return birthA - birthB; // Ascending: tanggal lahir lebih dulu = usia lebih tua di atas
    }

    // 4. Cadangan: TMT terlama (lebih awal)
    if (a.tmt && b.tmt) {
      const tmtA = new Date(a.tmt).getTime();
      const tmtB = new Date(b.tmt).getTime();
      if (!isNaN(tmtA) && !isNaN(tmtB) && tmtA !== tmtB) {
        return tmtA - tmtB;
      }
    }

    // 5. Nama alfabetis
    return a.nama.localeCompare(b.nama);
  });
}

/**
 * Perhitungan Otomatis 2 Tahunan untuk TMT KGB (Kenaikan Gaji Berkala) Berikutnya
 * Contoh: TMT Berkala 2023-04-01 => TMT KGB Berikutnya 2025-04-01
 */
export function calculateNextKgbDate(tmtStr: string): string {
  if (!tmtStr || !tmtStr.trim()) return '';
  try {
    const parts = tmtStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const nextYear = year + 2;
        let safeDay = day;
        // Tangani tanggal kabisat 29 Februari
        if (month === 2 && day === 29) {
          const isLeap = (nextYear % 4 === 0 && nextYear % 100 !== 0) || nextYear % 400 === 0;
          if (!isLeap) safeDay = 28;
        }
        const mStr = String(month).padStart(2, '0');
        const dStr = String(safeDay).padStart(2, '0');
        return `${nextYear}-${mStr}-${dStr}`;
      }
    }
    const d = new Date(tmtStr);
    if (!isNaN(d.getTime())) {
      d.setFullYear(d.getFullYear() + 2);
      return d.toISOString().split('T')[0];
    }
  } catch {
    // Fallback
  }
  return '';
}

/**
 * Status Jatuh Tempo KGB Berikutnya
 */
export function getKgbStatus(tmtBerikutnyaStr?: string): {
  status: 'Jatuh Tempo' | 'Mendekati' | 'Aktif' | 'Belum Ada';
  badgeClass: string;
  label: string;
  diffMonths?: number;
} {
  if (!tmtBerikutnyaStr || !tmtBerikutnyaStr.trim() || tmtBerikutnyaStr === '-') {
    return {
      status: 'Belum Ada',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      label: 'Belum Ada KGB',
    };
  }

  const nextDate = new Date(tmtBerikutnyaStr);
  if (isNaN(nextDate.getTime())) {
    return {
      status: 'Belum Ada',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      label: '-',
    };
  }

  const now = new Date();
  const diffTime = nextDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.round(diffDays / 30);

  if (diffDays <= 0) {
    return {
      status: 'Jatuh Tempo',
      badgeClass: 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse',
      label: 'Jatuh Tempo!',
      diffMonths,
    };
  } else if (diffDays <= 90) {
    return {
      status: 'Mendekati',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      label: `Segera (${diffMonths} bln lagi)`,
      diffMonths,
    };
  } else {
    return {
      status: 'Aktif',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium',
      label: `Aktif (${diffMonths} bln lagi)`,
      diffMonths,
    };
  }
}

/**
 * Konfigurasi Pewarnaan Status Kepegawaian (PNS: Biru, PPPK: Hijau/Emerald, Non-ASN: Oranye/Amber)
 */
export function getStatusColorConfig(status?: string): {
  key: 'PNS' | 'PPPK' | 'NON_ASN';
  label: string;
  badgeClass: string;
  solidBadgeClass: string;
  rowClass: string;
  cardBorderClass: string;
  accentBarClass: string;
  dotColor: string;
} {
  const s = (status || '').toUpperCase().trim();
  if (s === 'PNS') {
    return {
      key: 'PNS',
      label: 'PNS (Pegawai Negeri Sipil)',
      badgeClass: 'bg-blue-100 text-blue-900 border border-blue-300 font-bold',
      solidBadgeClass: 'bg-blue-600 text-white shadow-xs font-bold',
      rowClass: 'border-l-4 border-l-blue-600 hover:bg-blue-50/40',
      cardBorderClass: 'border-blue-200 hover:border-blue-500 shadow-blue-50/50',
      accentBarClass: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      dotColor: 'bg-blue-600',
    };
  }
  if (s === 'PPPK') {
    return {
      key: 'PPPK',
      label: 'PPPK (Perjanjian Kerja)',
      badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold',
      solidBadgeClass: 'bg-emerald-600 text-white shadow-xs font-bold',
      rowClass: 'border-l-4 border-l-emerald-600 hover:bg-emerald-50/40',
      cardBorderClass: 'border-emerald-200 hover:border-emerald-500 shadow-emerald-50/50',
      accentBarClass: 'bg-gradient-to-r from-emerald-600 to-teal-600',
      dotColor: 'bg-emerald-600',
    };
  }
  // Non-ASN (GTT, PTT, Honorer, Sukarela)
  return {
    key: 'NON_ASN',
    label: s ? `Non ASN: ${s}` : 'Non ASN',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
    solidBadgeClass: 'bg-amber-500 text-white shadow-xs font-bold',
    rowClass: 'border-l-4 border-l-amber-500 hover:bg-amber-50/40',
    cardBorderClass: 'border-amber-200 hover:border-amber-500 shadow-amber-50/50',
    accentBarClass: 'bg-gradient-to-r from-amber-500 to-orange-500',
    dotColor: 'bg-amber-500',
  };
}

/**
 * Konfigurasi Pewarnaan Berdasarkan Jenis Kelamin (L: Cyan/Sky ♂, P: Rose/Pink ♀)
 */
export function getJenisKelaminConfig(jk?: 'L' | 'P' | string): {
  code: 'L' | 'P';
  label: string;
  shortLabel: string;
  symbol: string;
  badgeClass: string;
  pillClass: string;
  iconBgClass: string;
  textColor: string;
} {
  const isMale = jk === 'L' || (jk || '').toUpperCase().startsWith('L');
  if (isMale) {
    return {
      code: 'L',
      label: 'Laki-laki',
      shortLabel: 'L',
      symbol: '♂',
      badgeClass: 'bg-sky-100 text-sky-900 border border-sky-300 font-bold',
      pillClass: 'bg-sky-50 text-sky-800 border border-sky-200',
      iconBgClass: 'bg-sky-500 text-white',
      textColor: 'text-sky-700',
    };
  }
  return {
    code: 'P',
    label: 'Perempuan',
    shortLabel: 'P',
    symbol: '♀',
    badgeClass: 'bg-rose-100 text-rose-900 border border-rose-300 font-bold',
    pillClass: 'bg-rose-50 text-rose-800 border border-rose-200',
    iconBgClass: 'bg-rose-500 text-white',
    textColor: 'text-rose-700',
  };
}

/**
 * Kalkulasi Batas Usia Pensiun (BUP) Pegawai ASN / Guru sesuai Regulasi BKN
 * Guru / Kepala Sekolah: BUP 60 Tahun (UU Guru & Dosen No. 14/2005)
 * Pelaksana / Tendik: BUP 58 Tahun (PP No. 11/2017)
 * TMT Pensiun resmi adalah tanggal 1 bulan berikutnya setelah tanggal lahir
 */
export interface BupPensiunInfo {
  usiaBupTahun: number;          // 60 untuk Guru/Kepsek, 58 untuk Pelaksana/Tendik
  usiaSaatIniTahun: number;
  usiaSaatIniBulan: number;
  tmtPensiun: string;             // YYYY-MM-DD
  tmtPensiunFormatted: string;    // e.g. "1 Mei 2026"
  sisaBulan: number;              // Selisih bulan ke TMT pensiun
  sisaTahun: number;
  status: 'Sudah Pensiun' | 'Mendesak' | 'Mendekati' | 'Persiapan' | 'Aktif';
  statusLabel: string;
  badgeClass: string;
  alertLevel: 'danger' | 'warning' | 'info' | 'normal';
}

export function calculateBupPensiun(
  birthDateStr?: string,
  jabatan: string = 'Guru',
  currentDate: Date = new Date()
): BupPensiunInfo {
  if (!birthDateStr) {
    return {
      usiaBupTahun: 60,
      usiaSaatIniTahun: 0,
      usiaSaatIniBulan: 0,
      tmtPensiun: '-',
      tmtPensiunFormatted: '-',
      sisaBulan: 999,
      sisaTahun: 99,
      status: 'Aktif',
      statusLabel: 'Aktif',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      alertLevel: 'normal',
    };
  }

  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) {
    return {
      usiaBupTahun: 60,
      usiaSaatIniTahun: 0,
      usiaSaatIniBulan: 0,
      tmtPensiun: '-',
      tmtPensiunFormatted: '-',
      sisaBulan: 999,
      sisaTahun: 99,
      status: 'Aktif',
      statusLabel: 'Aktif',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      alertLevel: 'normal',
    };
  }

  // Tentukan BUP berdasarkan jabatan
  const j = (jabatan || '').toLowerCase();
  const isGuruOrKepsek = j.includes('guru') || j.includes('kepala') || j.includes('pengawas') || j.includes('pendidik');
  const usiaBup = isGuruOrKepsek ? 60 : 58;

  // Tahun dan bulan mencapai BUP
  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth(); // 0-indexed
  const bupYear = birthYear + usiaBup;

  // TMT Pensiun resmi BKN: Tanggal 1 bulan berikutnya setelah tanggal lahir
  let pMonth = birthMonth + 1;
  let pYear = bupYear;
  if (pMonth > 11) {
    pMonth = 0;
    pYear += 1;
  }

  const pMonthStr = String(pMonth + 1).padStart(2, '0');
  const tmtPensiunStr = `${pYear}-${pMonthStr}-01`;
  const tmtFormatted = formatIndoDate(tmtPensiunStr);

  // Usia saat ini
  let curYears = currentDate.getFullYear() - birthDate.getFullYear();
  let curMonths = currentDate.getMonth() - birthDate.getMonth();
  if (currentDate.getDate() < birthDate.getDate()) {
    curMonths--;
  }
  if (curMonths < 0) {
    curYears--;
    curMonths += 12;
  }

  // Selisih bulan hingga TMT Pensiun
  const diffMonths = (pYear - currentDate.getFullYear()) * 12 + (pMonth - currentDate.getMonth());
  const sisaTahun = Math.floor(Math.max(0, diffMonths) / 12);
  const sisaBulanRem = Math.max(0, diffMonths) % 12;

  let status: BupPensiunInfo['status'] = 'Aktif';
  let statusLabel = '';
  let badgeClass = '';
  let alertLevel: BupPensiunInfo['alertLevel'] = 'normal';

  if (diffMonths <= 0) {
    status = 'Sudah Pensiun';
    statusLabel = `Telah Mencapai BUP (${Math.abs(diffMonths)} bln lalu)`;
    badgeClass = 'bg-rose-100 text-rose-900 border border-rose-300 font-bold';
    alertLevel = 'danger';
  } else if (diffMonths <= 6) {
    status = 'Mendesak';
    statusLabel = `Mendesak BUP (${diffMonths} bln lagi)`;
    badgeClass = 'bg-red-100 text-red-900 border border-red-300 font-black animate-pulse';
    alertLevel = 'danger';
  } else if (diffMonths <= 12) {
    status = 'Mendekati';
    statusLabel = `Mendekati BUP (${diffMonths} bln lagi)`;
    badgeClass = 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
    alertLevel = 'warning';
  } else if (diffMonths <= 24) {
    status = 'Persiapan';
    const thStr = sisaTahun > 0 ? `${sisaTahun} th ` : '';
    statusLabel = `Persiapan BUP (${thStr}${sisaBulanRem} bln)`;
    badgeClass = 'bg-blue-100 text-blue-900 border border-blue-300 font-semibold';
    alertLevel = 'info';
  } else {
    status = 'Aktif';
    statusLabel = `Aktif (${sisaTahun} th lagi)`;
    badgeClass = 'bg-slate-100 text-slate-700 border border-slate-200';
    alertLevel = 'normal';
  }

  return {
    usiaBupTahun: usiaBup,
    usiaSaatIniTahun: curYears,
    usiaSaatIniBulan: curMonths,
    tmtPensiun: tmtPensiunStr,
    tmtPensiunFormatted: tmtFormatted,
    sisaBulan: diffMonths,
    sisaTahun,
    status,
    statusLabel,
    badgeClass,
    alertLevel,
  };
}
