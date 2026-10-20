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
