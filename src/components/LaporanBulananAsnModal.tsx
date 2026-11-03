import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Calendar, 
  Download, 
  Check, 
  FileCheck2, 
  FileSpreadsheet, 
  Users, 
  Building2, 
  Clock, 
  Maximize2 
} from 'lucide-react';
import { LogoPasuruan, PASURUAN_LOGO_BW_SRC } from './LogoPasuruan';
import { Pegawai, ProfilSekolah, Siswa, SarprasItem, LaporanAsnReportType } from '../types';
import { 
  getMergedAsnReportList, 
  OFFICIAL_DATA_SISWA_LAPOR_BULAN, 
  AsnReportRow 
} from '../data/laporanBulananAsnData';

const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const TAHUN_BERJALAN_LIST = [2026, 2027, 2028, 2029, 2030];

function parseMonthYear(input: string) {
  const parts = input.trim().split(/\s+/);
  let month = parts[0] || 'Oktober';
  let year = parseInt(parts[1] || '2026', 10);
  if (isNaN(year)) year = 2026;
  const monthIdx = BULAN_NAMES.findIndex(b => b.toLowerCase() === month.toLowerCase());
  const validMonthIdx = monthIdx >= 0 ? monthIdx : 9; // default Oktober
  const lastDate = new Date(year, validMonthIdx + 1, 0).getDate();
  const properMonthName = BULAN_NAMES[validMonthIdx];
  return {
    month: properMonthName,
    year,
    monthIdx: validMonthIdx,
    lastDate,
    periodeUpper: `${properMonthName.toUpperCase()} ${year}`,
    tanggalLaporan: `${lastDate} ${properMonthName} ${year}`
  };
}

export type HolidayType = 'minggu' | 'libur_nasional' | 'cuti_bersama' | 'kerja';

export interface DayHolidayInfo {
  type: HolidayType;
  label?: string;
  badge?: string;
  headerBg: string;
  headerColor: string;
  cellBg: string;
  cellColor: string;
}

export function getDayHolidayInfo(year: number, monthIdx: number, day: number): DayHolidayInfo {
  const dow = new Date(year, monthIdx, day).getDay();
  const m = String(monthIdx + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const ymd = `${year}-${m}-${d}`;
  const md = `${m}-${d}`;

  // Hari Libur Nasional & Hari Besar Resmi di Indonesia
  const nationalHolidays: Record<string, string> = {
    '2026-01-01': 'Tahun Baru 2026 Masehi',
    '2026-01-16': "Isra Mi'raj Nabi Muhammad SAW",
    '2026-02-17': 'Tahun Baru Imlek 2577',
    '2026-03-03': 'Hari Suci Nyepi Saka 1948',
    '2026-03-20': 'Hari Raya Idul Fitri 1447 H',
    '2026-03-21': 'Hari Raya Idul Fitri 1447 H',
    '2026-04-03': 'Wafat Yesus Kristus',
    '2026-05-01': 'Hari Buruh Internasional',
    '2026-05-14': 'Kenaikan Yesus Kristus',
    '2026-05-27': 'Hari Raya Idul Adha 1447 H',
    '2026-05-31': 'Hari Raya Waisak 2570',
    '2026-06-01': 'Hari Lahir Pancasila',
    '2026-06-16': 'Tahun Baru Islam 1448 H',
    '2026-08-17': 'Hari Kemerdekaan RI ke-81',
    '2026-08-25': 'Maulid Nabi Muhammad SAW',
    '2026-10-01': 'Hari Kesaktian Pancasila',
    '2026-10-28': 'Hari Sumpah Pemuda',
    '2026-11-10': 'Hari Pahlawan',
    '2026-12-25': 'Hari Raya Natal',

    // Pengulangan tahunan
    '01-01': 'Tahun Baru Masehi',
    '05-01': 'Hari Buruh Internasional',
    '06-01': 'Hari Lahir Pancasila',
    '08-17': 'Hari Kemerdekaan RI',
    '10-01': 'Hari Kesaktian Pancasila',
    '10-28': 'Hari Sumpah Pemuda',
    '11-10': 'Hari Pahlawan',
    '12-25': 'Hari Raya Natal',
  };

  // Cuti Bersama Resmi Pemerintah
  const cutiBersama: Record<string, string> = {
    '2026-02-18': 'Cuti Bersama Tahun Baru Imlek',
    '2026-03-04': 'Cuti Bersama Hari Suci Nyepi',
    '2026-03-19': 'Cuti Bersama Idul Fitri 1447 H',
    '2026-03-23': 'Cuti Bersama Idul Fitri 1447 H',
    '2026-03-24': 'Cuti Bersama Idul Fitri 1447 H',
    '2026-05-15': 'Cuti Bersama Kenaikan Yesus Kristus',
    '2026-05-28': 'Cuti Bersama Idul Adha 1447 H',
    '2026-12-24': 'Cuti Bersama Hari Raya Natal',
    '2026-12-26': 'Cuti Bersama Hari Raya Natal',
  };

  if (nationalHolidays[ymd] || nationalHolidays[md]) {
    return {
      type: 'libur_nasional',
      label: nationalHolidays[ymd] || nationalHolidays[md],
      badge: 'LN',
      headerBg: '#e11d48',
      headerColor: '#ffffff',
      cellBg: '#ffe4e6',
      cellColor: '#881337',
    };
  }

  if (cutiBersama[ymd]) {
    return {
      type: 'cuti_bersama',
      label: cutiBersama[ymd],
      badge: 'CB',
      headerBg: '#d97706',
      headerColor: '#ffffff',
      cellBg: '#fef3c7',
      cellColor: '#78350f',
    };
  }

  if (dow === 0) {
    return {
      type: 'minggu',
      label: 'Libur Umum (Minggu)',
      badge: 'MGU',
      headerBg: '#dc2626',
      headerColor: '#ffffff',
      cellBg: '#fee2e2',
      cellColor: '#991b1b',
    };
  }

  return {
    type: 'kerja',
    headerBg: '#f1f5f9',
    headerColor: '#000000',
    cellBg: '#ffffff',
    cellColor: '#000000',
  };
}

export interface AttendanceRecord {
  s: number;
  i: number;
  ct: number;
  dl: number;
  dik: number;
  a: number;
  ch: number;
  cb: number;
  keterangan: string;
}

interface LaporanBulananAsnModalProps {
  isOpen: boolean;
  initialReport?: LaporanAsnReportType;
  initialBulan?: string;
  profil: ProfilSekolah;
  pegawai: Pegawai[];
  siswa: Siswa[];
  sarpras: SarprasItem[];
  onClose: () => void;
}

export const LaporanBulananAsnModal: React.FC<LaporanBulananAsnModalProps> = ({
  isOpen,
  initialReport = 'data_guru',
  initialBulan = 'Oktober 2026',
  profil,
  pegawai,
  siswa,
  sarpras,
  onClose,
}) => {
  const [activeReport, setActiveReport] = useState<LaporanAsnReportType>(initialReport);
  const [selectedPeriode, setSelectedPeriode] = useState<string>(initialBulan);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceRecord>>({});

  useEffect(() => {
    if (initialReport) {
      setActiveReport(initialReport);
    }
  }, [initialReport]);

  useEffect(() => {
    if (initialBulan) {
      setSelectedPeriode(initialBulan);
    }
  }, [initialBulan]);

  const parsed = parseMonthYear(selectedPeriode);
  const periodeBulan = parsed.periodeUpper;
  const tanggalLaporan = parsed.tanggalLaporan;

  const asnRows: AsnReportRow[] = getMergedAsnReportList(pegawai);

  // Initialize and keep attendance edits synchronized with pegawai list
  useEffect(() => {
    if (asnRows && asnRows.length > 0) {
      setAttendanceState((prev) => {
        const next = { ...prev };
        let hasChanges = false;
        asnRows.forEach((row) => {
          if (!next[row.id]) {
            hasChanges = true;
            next[row.id] = {
              s: row.ketidakhadiran?.s || 0,
              i: row.ketidakhadiran?.i || 0,
              ct: row.ketidakhadiran?.ct || 0,
              dl: row.ketidakhadiran?.dl || 0,
              dik: row.ketidakhadiran?.dik || 0,
              a: row.ketidakhadiran?.a || 0,
              ch: row.ketidakhadiran?.ch || 0,
              cb: row.ketidakhadiran?.cb || 0,
              keterangan: row.catatan || '-',
            };
          }
        });
        return hasChanges ? next : prev;
      });
    }
  }, [asnRows]);

  const handleUpdateAttendance = (
    rowId: string,
    field: keyof AttendanceRecord,
    val: number | string
  ) => {
    setAttendanceState((prev) => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || { s: 0, i: 0, ct: 0, dl: 0, dik: 0, a: 0, ch: 0, cb: 0, keterangan: '-' }),
        [field]: val,
      },
    }));
  };

  // Dynamic calculation of working days, Sundays, national holidays, and cuti bersama
  const monthDayStats = (() => {
    let workingDays = 0;
    let sundays = 0;
    let nationalHolidays = 0;
    let cutiBersama = 0;
    for (let d = 1; d <= parsed.lastDate; d++) {
      const h = getDayHolidayInfo(parsed.year, parsed.monthIdx, d);
      if (h.type === 'kerja') workingDays++;
      else if (h.type === 'minggu') sundays++;
      else if (h.type === 'libur_nasional') nationalHolidays++;
      else if (h.type === 'cuti_bersama') cutiBersama++;
    }
    return {
      totalDays: parsed.lastDate,
      workingDays,
      sundays,
      nationalHolidays,
      cutiBersama,
      totalLibur: sundays + nationalHolidays + cutiBersama,
    };
  })();

  if (!isOpen) return null;
  
  // Real database aggregation for Data Siswa Lapor Bulan (terintegrasi penuh dengan Data Kesiswaan)
  const dataSiswaRekap = (() => {
    const activeSiswa = (siswa || []).filter((s) => s.statusSiswa !== 'Lulus' && s.statusSiswa !== 'Pindah');
    const hasLiveSiswa = activeSiswa.length > 0;

    const perKelas = [1, 2, 3, 4, 5, 6].map((c) => {
      const rombelSiswa = activeSiswa.filter((s) => String(s.kelas) === String(c));
      const l = hasLiveSiswa ? rombelSiswa.filter((s) => s.jenisKelamin === 'L').length : OFFICIAL_DATA_SISWA_LAPOR_BULAN.perKelas[c - 1].l;
      const p = hasLiveSiswa ? rombelSiswa.filter((s) => s.jenisKelamin === 'P').length : OFFICIAL_DATA_SISWA_LAPOR_BULAN.perKelas[c - 1].p;

      const countAgama = (agamas: string[]) => ({
        l: hasLiveSiswa ? rombelSiswa.filter((s) => agamas.includes(s.agama) && s.jenisKelamin === 'L').length : 0,
        p: hasLiveSiswa ? rombelSiswa.filter((s) => agamas.includes(s.agama) && s.jenisKelamin === 'P').length : 0,
      });

      return {
        kelas: c,
        label: ['I', 'II', 'III', 'IV', 'V', 'VI'][c - 1],
        l,
        p,
        total: l + p,
        agama: {
          islam: hasLiveSiswa ? countAgama(['Islam']) : { l, p },
          kristen: countAgama(['Kristen']),
          katolik: countAgama(['Katolik']),
          hindu: countAgama(['Hindu']),
          buddha: countAgama(['Buddha', 'Budha']),
          konghucu: countAgama(['Konghucu']),
        }
      };
    });

    const totalL = perKelas.reduce((sum, k) => sum + k.l, 0);
    const totalP = perKelas.reduce((sum, k) => sum + k.p, 0);
    const totalSemua = totalL + totalP;

    const sumAgama = (key: 'islam' | 'kristen' | 'katolik' | 'hindu' | 'buddha' | 'konghucu') => {
      const l = perKelas.reduce((s, k) => s + k.agama[key].l, 0);
      const p = perKelas.reduce((s, k) => s + k.agama[key].p, 0);
      return { l, p, total: l + p };
    };

    return {
      ...OFFICIAL_DATA_SISWA_LAPOR_BULAN,
      perKelas,
      totalL,
      totalP,
      totalSemua,
      agamaIslam: sumAgama('islam'),
      agamaKristen: sumAgama('kristen'),
      agamaKatolik: sumAgama('katolik'),
      agamaHindu: sumAgama('hindu'),
      agamaBuddha: sumAgama('buddha'),
      agamaKonghucu: sumAgama('konghucu'),
    };
  })();

  // Dynamic PTK & Staff counts from live pegawai database
  const ptkStats = (() => {
    const list = pegawai || [];
    const kepsek = list.filter((p) => (p.jabatan || '').toLowerCase().includes('kepala sekolah')).length || 1;
    const guruKelas = list.filter((p) => (p.jabatan || '').toLowerCase().includes('guru kelas')).length;
    const guruPjok = list.filter((p) => (p.jabatan || '').toLowerCase().includes('pjok') || (p.jabatan || '').toLowerCase().includes('penjaskor')).length;
    const guruPai = list.filter((p) => (p.jabatan || '').toLowerCase().includes('pai') || (p.jabatan || '').toLowerCase().includes('agama')).length;
    const guruBtq = list.filter((p) => (p.jabatan || '').toLowerCase().includes('btq')).length;
    const admin = list.filter((p) => (p.jabatan || '').toLowerCase().includes('operator') || (p.jabatan || '').toLowerCase().includes('administrasi') || (p.jabatan || '').toLowerCase().includes('tata usaha')).length;
    const guruLain = list.filter((p) => {
      const j = (p.jabatan || '').toLowerCase();
      return !j.includes('kepala sekolah') && !j.includes('guru kelas') && !j.includes('pjok') && !j.includes('penjaskor') && !j.includes('pai') && !j.includes('agama') && !j.includes('btq') && !j.includes('operator') && !j.includes('administrasi');
    }).length;

    const totalPtk = list.length || 6;
    const pns = list.filter((p) => p.statusKepegawaian === 'PNS').length;
    const pppk = list.filter((p) => p.statusKepegawaian === 'PPPK').length;
    const nonAsn = list.filter((p) => p.statusKepegawaian !== 'PNS' && p.statusKepegawaian !== 'PPPK').length;

    return {
      kepsek,
      guruKelas: guruKelas || 4,
      guruPjok: guruPjok || 1,
      guruPai: guruPai || 1,
      guruBtq,
      admin,
      guruLain,
      totalPtk,
      pns: pns || 2,
      pppk: pppk || 4,
      nonAsn,
      totalStatus: totalPtk
    };
  })();

  // Determine current orientation
  const isPortrait = activeReport === 'data_guru' || activeReport === 'laporan_presensi';
  const orientationLabel = isPortrait ? 'A4 Potret' : 'A4 Lanskape';

  const handlePrint = () => {
    // Set official filename title for "Simpan sebagai PDF" / Save as PDF destination
    const reportCodeMap: Record<LaporanAsnReportType, string> = {
      data_guru: 'Data_Guru_ASN',
      laporan_presensi: 'Rekap_Presensi_PNS_PPPK',
      format_presensi_bulan: 'Format_Presensi_Bulanan_Pegawai',
      data_siswa: 'Daftar_Lapor_Bulan_Data_Siswa'
    };
    const prevTitle = document.title;
    const cleanPeriod = periodeBulan.replace(/\s+/g, '_');
    document.title = `Laporan_Bulanan_ASN_${reportCodeMap[activeReport]}_SDN_Kedungringin_1_Beji_${cleanPeriod}`;

    // Inject dynamic @page CSS rule for exact A4 portrait/landscape with 1cm (10mm) margins on all sides
    const printStyleId = 'dynamic-report-print-style';
    let styleEl = document.getElementById(printStyleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = printStyleId;
      document.head.appendChild(styleEl);
    }
    
    styleEl.innerHTML = `
      @media print {
        @page {
          size: A4 ${isPortrait ? 'portrait' : 'landscape'};
          margin: 10mm 10mm 10mm 10mm; /* Margin tepat 1 cm pada tiap sisi */
        }
        html, body {
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * {
          visibility: hidden !important;
        }
        #printable-report-area, 
        #printable-report-area * {
          visibility: visible !important;
        }
        #printable-report-area {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          box-shadow: none !important;
          border: none !important;
        }
        .print\\:hidden, .screen-only {
          display: none !important;
          visibility: hidden !important;
        }
        table {
          page-break-inside: auto !important;
          border-collapse: collapse !important;
        }
        tr {
          page-break-inside: avoid !important;
          page-break-after: auto !important;
        }
        thead {
          display: table-header-group !important;
        }
        tfoot {
          display: table-footer-group !important;
        }
      }
    `;

    window.focus();
    setTimeout(() => {
      window.print();
      // Restore previous document title after user interaction
      setTimeout(() => {
        document.title = prevTitle;
      }, 1000);
    }, 120);
  };

  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      const reportCodeMap: Record<LaporanAsnReportType, string> = {
        data_guru: 'Data_Guru_ASN',
        laporan_presensi: 'Rekap_Presensi_PNS_PPPK',
        format_presensi_bulan: 'Format_Presensi_Bulanan_Pegawai',
        data_siswa: 'Daftar_Lapor_Bulan_Data_Siswa'
      };
      const cleanPeriod = periodeBulan.replace(/\s+/g, '_');
      const filename = `Laporan_Bulanan_ASN_${reportCodeMap[activeReport]}_SDN_Kedungringin_1_Beji_${cleanPeriod}`;

      const reportEl = document.getElementById('printable-report-area');
      if (!reportEl) return;

      // Clone content to transform for Word document format
      const clone = reportEl.cloneNode(true) as HTMLElement;

      // Ensure print-only text spans are visible in Word export
      clone.querySelectorAll('.print\\:inline-block, .print\\:block, .print\\:inline').forEach((el) => {
        el.classList.remove('hidden');
        (el as HTMLElement).style.display = 'inline-block';
      });

      // Replace select dropdowns with clean text spans
      clone.querySelectorAll('select').forEach((sel) => {
        const selectedText = (sel as HTMLSelectElement).options[(sel as HTMLSelectElement).selectedIndex]?.text || '-';
        const span = document.createElement('span');
        span.textContent = selectedText;
        span.style.fontWeight = 'bold';
        span.style.textAlign = 'center';
        sel.parentNode?.replaceChild(span, sel);
      });

      // Replace inputs with clean text spans
      clone.querySelectorAll('input').forEach((inp) => {
        const val = (inp as HTMLInputElement).value || '-';
        const span = document.createElement('span');
        span.textContent = val;
        span.style.textAlign = 'center';
        inp.parentNode?.replaceChild(span, inp);
      });

      // Remove remaining screen-only and print-hidden elements
      clone.querySelectorAll('.print\\:hidden, .screen-only').forEach((el) => el.remove());

      // Preload / embed Base64 image for the official logo so Microsoft Word renders it cleanly
      let logoBase64 = '';
      try {
        const resp = await fetch(PASURUAN_LOGO_BW_SRC);
        const blob = await resp.blob();
        logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn('Encoding logo to base64 fallback:', err);
      }

      // Replace img src with base64 data URL or absolute URL
      const imgElements = clone.querySelectorAll('img');
      imgElements.forEach((img) => {
        if (logoBase64 && (img.src.includes('Logo_Kab_Pas') || img.alt.includes('Pasuruan'))) {
          img.src = logoBase64;
        } else if (!img.src.startsWith('data:') && !img.src.startsWith('http')) {
          img.src = window.location.origin + (img.getAttribute('src') || '');
        }
        img.style.maxWidth = '55px';
        img.style.height = 'auto';
      });

      // Construct MSO-compliant HTML for Microsoft Word (.doc) with exact A4 and 1cm margin
      const wordHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${filename}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page Section1 {
              size: ${isPortrait ? '210mm 297mm' : '297mm 210mm'};
              mso-page-orientation: ${isPortrait ? 'portrait' : 'landscape'};
              margin: 10mm 10mm 10mm 10mm; /* Margin baku 1 cm tiap sisi */
              mso-header-margin: 5mm;
              mso-footer-margin: 5mm;
              mso-paper-source: 0;
            }
            div.Section1 {
              page: Section1;
            }
            body {
              font-family: Arial, 'DejaVu Sans', Helvetica, sans-serif;
              font-size: 8.5pt;
              color: #000000;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            table {
              border-collapse: collapse !important;
              width: 100% !important;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
              margin-top: 3pt;
              margin-bottom: 5pt;
            }
            table, th, td {
              border: 1px solid #000000;
            }
            th, td {
              padding: 2.5pt 3.5pt;
              font-size: 7.5pt;
              vertical-align: middle;
            }
            th {
              background-color: #f1f5f9;
              font-weight: bold;
              text-align: center;
            }
            .font-bold { font-weight: bold; }
            .font-extrabold { font-weight: 800; }
            .font-semibold { font-weight: 600; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .uppercase { text-transform: uppercase; }
            .underline { text-decoration: underline; }
            .italic { font-style: italic; }
            .truncate { overflow: hidden; }
            .border-b-2 { border-bottom: 2px solid #000000; }
            .border-b { border-bottom: 1px solid #000000; }
            .bg-slate-50, .bg-slate-100 { background-color: #f8fafc; }
            .bg-red-500, .bg-red-600 { background-color: #dc2626 !important; color: #ffffff !important; }
            .bg-red-100 { background-color: #fee2e2 !important; color: #991b1b !important; }
            .bg-rose-600 { background-color: #e11d48 !important; color: #ffffff !important; }
            .bg-rose-100 { background-color: #ffe4e6 !important; color: #881337 !important; }
            .bg-amber-500 { background-color: #d97706 !important; color: #ffffff !important; }
            .bg-amber-100 { background-color: #fef3c7 !important; color: #78350f !important; }
          </style>
        </head>
        <body>
          <div class="Section1">
            ${clone.innerHTML}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', wordHtml], {
        type: 'application/msword;charset=utf-8'
      });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${filename}.doc`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export Word error:', err);
    } finally {
      setIsExportingWord(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Modal Dialog Container */}
      <div className="bg-slate-100 rounded-2xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden print:max-h-none print:max-w-none print:w-full print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Screen Only) */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  Laporan Bulanan ASN SDN Kedungringin 1 Beji
                </h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                  isPortrait 
                    ? 'bg-blue-50 text-blue-900 border-blue-300' 
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                }`}>
                  Format {orientationLabel} • Kertas A4 (Margin 1 cm Tiap Sisi)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Format resmi sesuai Dinas Pendidikan Kabupaten Pasuruan (Daftar Guru, Rekap Presensi, Format Presensi, Data Siswa)
              </p>
            </div>
          </div>

          {/* Controls: Tab Buttons & Print Action */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setActiveReport('data_guru')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeReport === 'data_guru'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="A4 Potret: Data Pendidik dan Tenaga Kependidikan"
              >
                1. Data Guru (Potret)
              </button>
              <button
                onClick={() => setActiveReport('laporan_presensi')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeReport === 'laporan_presensi'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="A4 Potret: Rekapitulasi Daftar Hadir PNS & PPPK"
              >
                2. Laporan Presensi (Potret)
              </button>
              <button
                onClick={() => setActiveReport('format_presensi_bulan')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeReport === 'format_presensi_bulan'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="A4 Lanskape: Daftar Hadir Pegawai 1-30/31"
              >
                3. Format Presensi (Lanskape)
              </button>
              <button
                onClick={() => setActiveReport('data_siswa')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeReport === 'data_siswa'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="A4 Lanskape: Daftar Lapor Bulan Data Siswa & Sarpras"
              >
                4. Data Siswa (Lanskape)
              </button>
            </div>

            {/* Periode Month & Year Selector in Modal */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              <span className="font-semibold text-slate-700">Periode:</span>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="bg-white border border-emerald-400 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                title="Pilih Bulan & Tahun Berjalan Mulai 2026"
              >
                {TAHUN_BERJALAN_LIST.map((thn) => (
                  <optgroup key={thn} label={`Tahun ${thn} ${thn === 2026 ? '(TP 2026/2027)' : ''}`}>
                    {BULAN_NAMES.map((bln) => {
                      const val = `${bln} ${thn}`;
                      return (
                        <option key={val} value={val}>
                          {bln} {thn} {val === 'Oktober 2026' ? '★' : ''}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer ring-2 ring-emerald-600/40 hover:scale-[1.02]"
                title="Unduh berkas PDF atau cetak ke kertas A4 (Margin 1 cm tiap sisi)"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-[10px] font-mono font-bold tracking-tight">
                  A4
                </span>
              </button>

              <button
                onClick={handleExportWord}
                disabled={isExportingWord}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer ring-2 ring-blue-600/40 hover:scale-[1.02] disabled:opacity-60"
                title="Unduh berkas dokumen dalam format Microsoft Word (.doc, A4, Margin 1 cm tiap sisi)"
              >
                <FileText className="w-4 h-4 text-blue-200" />
                <span>{isExportingWord ? 'Menyimpan...' : 'Unduh Word'}</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-700 text-[10px] font-mono font-bold tracking-tight">
                  .doc
                </span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Preview Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          
          {/* Printable Document Paper */}
          <div
            id="printable-report-area"
            className={`bg-white text-slate-900 shadow-xl border border-slate-300 p-6 sm:p-8 font-sans print:shadow-none print:border-none print:p-0 ${
              isPortrait
                ? 'w-full max-w-[210mm] min-h-[297mm]' // A4 Portrait Dimensions
                : 'w-full max-w-[297mm] min-h-[210mm]' // A4 Landscape Dimensions
            }`}
            style={{ boxSizing: 'border-box' }}
          >

            {/* ========================================================================= */}
            {/* 1. REPORT 1: LAPORAN BULAN - DATA GURU (A4 POTRET)                        */}
            {/* ========================================================================= */}
            {activeReport === 'data_guru' && (
              <div className="space-y-4 text-slate-900">
                {/* Header Kop Resmi */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-black gap-4">
                  <div className="w-16 shrink-0 flex items-center justify-center">
                    <LogoPasuruan className="w-14 h-18 object-contain" />
                  </div>
                  <div className="flex-1 text-center">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                      DATA PENDIDIK DAN TENAGA KEPENDIDIKAN
                    </h2>
                    <h1 className="text-base font-extrabold uppercase text-black tracking-wide">
                      SDN KEDUNGRINGIN I
                    </h1>
                    <h3 className="text-xs font-bold uppercase text-black">
                      KECAMATAN BEJI KABUPATEN PASURUAN
                    </h3>
                    <p className="text-[10px] text-slate-800 mt-0.5">
                      Alamat : Dsn. Ngampel, Ds. Kedungringin, Kec. Beji Kab. Pasuruan Kode Pos 67154
                    </p>
                  </div>
                  <div className="w-16 shrink-0 hidden sm:block print:block" />
                </div>

                {/* Table Data Guru & GTK */}
                <div className="overflow-x-auto print:overflow-visible">
                  <table className="w-full text-left text-[9px] border-collapse border border-black font-sans leading-tight">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold text-black border-b border-black">
                        <th className="border border-black p-1 w-6" rowSpan={2}>No.<br/>Urut</th>
                        <th className="border border-black p-1 w-44" rowSpan={2}>
                          Nama<br/>NIP<br/>Tempat & tanggal lahir<br/>Pangkat/Golongan
                        </th>
                        <th className="border border-black p-1 w-6" rowSpan={2}>L/P</th>
                        <th className="border border-black p-1 w-16" rowSpan={2}>Ijasah<br/>Tertinggi /<br/>Tahun</th>
                        <th className="border border-black p-1 w-20" rowSpan={2}>Jabatan<br/>Di sekolah ini</th>
                        <th className="border border-black p-1 w-16" rowSpan={2}>Status<br/>Kepegawaian</th>
                        <th className="border border-black p-1 w-16" rowSpan={2}>Tanggal<br/>Mulai<br/>Di angkat</th>
                        <th className="border border-black p-1 w-16" rowSpan={2}>Tanggal<br/>Mulai<br/>Di SD ini</th>
                        <th className="border border-black p-1 w-32" rowSpan={2}>Tanggal dan Nomor SK terakhir</th>
                        <th className="border border-black p-1 w-14" rowSpan={2}>Masa<br/>Kerja<br/>Golongan</th>
                        <th className="border border-black p-0.5" colSpan={6}>Ketidak Hadiran</th>
                        <th className="border border-black p-1 w-12" rowSpan={2}>Catatan</th>
                      </tr>
                      <tr className="bg-slate-100 text-center font-bold text-black border-b border-black">
                        <th className="border border-black p-0.5 w-4">S</th>
                        <th className="border border-black p-0.5 w-4">I</th>
                        <th className="border border-black p-0.5 w-4">A</th>
                        <th className="border border-black p-0.5 w-4">CH</th>
                        <th className="border border-black p-0.5 w-4">CT</th>
                        <th className="border border-black p-0.5 w-4">CB</th>
                      </tr>
                      <tr className="bg-slate-200 text-center text-[8px] font-mono border-b border-black text-slate-800">
                        <td className="border border-black py-0.5">1</td>
                        <td className="border border-black py-0.5">2</td>
                        <td className="border border-black py-0.5">3</td>
                        <td className="border border-black py-0.5">4</td>
                        <td className="border border-black py-0.5">5</td>
                        <td className="border border-black py-0.5">6</td>
                        <td className="border border-black py-0.5">7</td>
                        <td className="border border-black py-0.5">8</td>
                        <td className="border border-black py-0.5">9</td>
                        <td className="border border-black py-0.5">10</td>
                        <td className="border border-black py-0.5">11</td>
                        <td className="border border-black py-0.5">12</td>
                        <td className="border border-black py-0.5">13</td>
                        <td className="border border-black py-0.5">14</td>
                        <td className="border border-black py-0.5">15</td>
                        <td className="border border-black py-0.5">16</td>
                        <td className="border border-black py-0.5">17</td>
                      </tr>
                    </thead>
                    <tbody>
                      {asnRows.map((row) => {
                        const att = attendanceState[row.id] || {
                          s: row.ketidakhadiran?.s || 0,
                          i: row.ketidakhadiran?.i || 0,
                          ct: row.ketidakhadiran?.ct || 0,
                          dl: row.ketidakhadiran?.dl || 0,
                          dik: row.ketidakhadiran?.dik || 0,
                          a: row.ketidakhadiran?.a || 0,
                          ch: row.ketidakhadiran?.ch || 0,
                          cb: row.ketidakhadiran?.cb || 0,
                          keterangan: row.catatan || '-',
                        };

                        return (
                          <tr key={row.id} className="border-b border-black hover:bg-slate-50">
                            <td className="border border-black p-0.5 text-center font-bold text-[8.5px]">{row.no}</td>
                            <td className="border border-black p-1 overflow-hidden">
                              <div className="font-bold text-[9px] leading-tight truncate" title={row.nama}>{row.nama}</div>
                              <div className="font-mono text-[8px] text-slate-800 leading-none truncate">{row.nip}</div>
                              <div className="text-[8px] text-slate-700 leading-tight truncate">{row.ttlFormatted}</div>
                              <div className="text-[8px] font-semibold text-slate-900 leading-none truncate">{row.pangkatGolongan}</div>
                            </td>
                            <td className="border border-black p-0.5 text-center font-bold text-[8.5px]">{row.jenisKelamin}</td>
                            <td className="border border-black p-0.5 text-center whitespace-pre-line font-medium text-[8px] leading-tight">{row.ijazahTertinggi}</td>
                            <td className="border border-black p-0.5 text-center font-semibold text-[8px] leading-tight truncate">{row.jabatan}</td>
                            <td className="border border-black p-0.5 text-center font-bold text-[8px]">{row.statusKepegawaian}</td>
                            <td className="border border-black p-0.5 text-center font-mono text-[8px] leading-none">{row.tanggalMulaiDiangkat}</td>
                            <td className="border border-black p-0.5 text-center font-mono text-[8px] leading-none">{row.tanggalMulaiDiSdIni}</td>
                            <td className="border border-black p-0.5 text-center overflow-hidden">
                              <div className="font-mono text-[8px] font-bold leading-tight">{row.skTerakhirTanggal}</div>
                              <div className="font-mono text-[7px] leading-none truncate text-slate-800" title={row.skTerakhirNomor}>{row.skTerakhirNomor}</div>
                            </td>
                            <td className="border border-black p-0.5 text-center whitespace-pre-line font-mono font-bold text-[8px] leading-tight">{row.mkgTeks}</td>
                            
                            {/* Ketidakhadiran S, I, A, CH, CT, CB dengan Droplist 1-25 */}
                            <td className="border border-black p-0 text-center align-middle">
                              <select
                                value={att.s || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 's', Number(e.target.value))}
                                className="w-full text-center bg-transparent border-0 hover:bg-slate-100 rounded text-[8px] font-bold p-0 cursor-pointer outline-none print:hidden"
                                title={`Sakit: ${att.s || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[8px]">{att.s > 0 ? att.s : '-'}</span>
                            </td>

                            <td className="border border-black p-0 text-center align-middle">
                              <select
                                value={att.i || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 'i', Number(e.target.value))}
                                className="w-full text-center bg-transparent border-0 hover:bg-slate-100 rounded text-[8px] font-bold p-0 cursor-pointer outline-none print:hidden"
                                title={`Izin: ${att.i || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[8px]">{att.i > 0 ? att.i : '-'}</span>
                            </td>

                            <td className="border border-black p-0 text-center align-middle">
                              <select
                                value={att.a || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 'a', Number(e.target.value))}
                                className="w-full text-center bg-transparent border-0 hover:bg-slate-100 rounded text-[8px] font-bold p-0 cursor-pointer outline-none print:hidden"
                                title={`Alpha: ${att.a || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[8px]">{att.a > 0 ? att.a : '-'}</span>
                            </td>

                            <td className="border border-black p-0 text-center align-middle">
                              <select
                                value={att.ch || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 'ch', Number(e.target.value))}
                                className="w-full text-center bg-transparent border-0 hover:bg-slate-100 rounded text-[8px] font-bold p-0 cursor-pointer outline-none print:hidden"
                                title={`Cuti Hamil: ${att.ch || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[8px]">{att.ch > 0 ? att.ch : '-'}</span>
                            </td>

                            <td className="border border-black p-0 text-center align-middle">
                              <select
                                value={att.ct || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 'ct', Number(e.target.value))}
                                className="w-full text-center bg-transparent border-0 hover:bg-slate-100 rounded text-[8px] font-bold p-0 cursor-pointer outline-none print:hidden"
                                title={`Cuti Tahunan: ${att.ct || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[8px]">{att.ct > 0 ? att.ct : '-'}</span>
                            </td>

                            <td className="border border-black p-0 text-center align-middle">
                              <select
                                value={att.cb || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 'cb', Number(e.target.value))}
                                className="w-full text-center bg-transparent border-0 hover:bg-slate-100 rounded text-[8px] font-bold p-0 cursor-pointer outline-none print:hidden"
                                title={`Cuti Bersalin: ${att.cb || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[8px]">{att.cb > 0 ? att.cb : '-'}</span>
                            </td>

                            <td className="border border-black p-0.5 text-center text-[7.5px] leading-tight truncate">
                              <input
                                type="text"
                                value={att.keterangan || '-'}
                                onChange={(e) => handleUpdateAttendance(row.id, 'keterangan', e.target.value)}
                                className="w-full text-center bg-transparent border-0 hover:bg-slate-100 rounded text-[7.5px] p-0 outline-none print:hidden truncate"
                                title="Catatan"
                              />
                              <span className="hidden print:inline-block truncate max-w-full">{att.keterangan || '-'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Tanda Tangan Plt Kepala Sekolah */}
                <div className="flex justify-end pt-4 pr-6">
                  <div className="text-center text-[10px] space-y-1">
                    <div>Pasuruan, {tanggalLaporan}</div>
                    <div className="font-bold">Plt Kepala Sekolah</div>
                    <div className="font-bold">SDN Kedungringin I Beji</div>
                    <div className="h-16" />
                    <div className="font-bold underline text-xs">FUAD FAHRUDIN, M.Pd</div>
                    <div className="font-mono text-[9px]">NIP. 198006182005011010</div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. REPORT 2: LAPORAN PRESENSI (A4 POTRET)                                 */}
            {/* ========================================================================= */}
            {activeReport === 'laporan_presensi' && (
              <div className="space-y-4 text-slate-900">
                {/* Header Logo & Judul */}
                <div className="text-center space-y-1 pb-3">
                  <div className="flex justify-center mb-1">
                    <LogoPasuruan className="w-12 h-14" size={52} />
                  </div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wide text-black leading-tight">
                    REKAPITULASI DAFTAR HADIR PNS, PPPK, & PPPK PW
                  </h2>
                  <h3 className="text-xs font-bold uppercase text-black">
                    DI LINGKUNGAN PEMERINTAH KABUPATEN PASURUAN
                  </h3>
                </div>

                {/* Info Identitas Unit Kerja */}
                <div className="text-xs space-y-1 pt-1 font-bold text-slate-900">
                  <div className="flex gap-2">
                    <span className="w-24">Halaman</span>
                    <span>: 3</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-24">UNIT KERJA</span>
                    <span>: SDN KEDUNGRINGIN I KEC. BEJI</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-24">BULAN</span>
                    <span>: {periodeBulan}</span>
                  </div>
                </div>

                {/* Info Hari Kerja Efektif & Admin Droplist Hint */}
                <div className="flex items-center justify-between text-[8px] bg-slate-50 border border-slate-300 px-2 py-1 rounded print:hidden">
                  <span className="font-semibold text-slate-800">
                    ℹ️ <strong className="text-black">Hari Kerja Efektif {periodeBulan}:</strong> {monthDayStats.workingDays} Hari ({monthDayStats.sundays} Minggu, {monthDayStats.nationalHolidays} Libur Nasional, {monthDayStats.cutiBersama} Cuti Bersama)
                  </span>
                  <span className="text-emerald-800 font-bold">
                    Pilih angka 1-25 pada kolom hadir untuk mengubah laporan berkala
                  </span>
                </div>

                {/* Table Rekapitulasi Presensi */}
                <div className="overflow-x-auto print:overflow-visible pt-1">
                  <table className="w-full table-fixed text-left text-[9px] border-collapse border border-black font-sans">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold text-black border-b border-black">
                        <th className="border border-black p-1 w-[32px] text-center">No.<br/>Urut</th>
                        <th className="border border-black p-1 text-left w-auto">
                          Nama Pegawai / NIP<br/>
                          Tempat Tanggal Lahir<br/>
                          Pangkat / Golongan
                        </th>
                        <th className="border border-black p-1 w-[46px] text-center">Sakit<br/>( Hari )</th>
                        <th className="border border-black p-1 w-[46px] text-center">Ijin<br/>( Hari )</th>
                        <th className="border border-black p-1 w-[46px] text-center">Cuti<br/>( Hari )</th>
                        <th className="border border-black p-1 w-[50px] text-center">Dinas<br/>Diluar<br/>( Hari )</th>
                        <th className="border border-black p-1 w-[52px] text-center">Pendidikan<br/>( Hari )</th>
                        <th className="border border-black p-1 w-[54px] text-center">Tanpa Ket./<br/>Alpha<br/>( Hari )</th>
                        <th className="border border-black p-1 w-[90px] text-center">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asnRows.map((row) => {
                        const att = attendanceState[row.id] || {
                          s: row.ketidakhadiran?.s || 0,
                          i: row.ketidakhadiran?.i || 0,
                          ct: row.ketidakhadiran?.ct || 0,
                          dl: row.ketidakhadiran?.dl || 0,
                          dik: row.ketidakhadiran?.dik || 0,
                          a: row.ketidakhadiran?.a || 0,
                          ch: row.ketidakhadiran?.ch || 0,
                          cb: row.ketidakhadiran?.cb || 0,
                          keterangan: row.catatan || '-',
                        };

                        return (
                          <tr key={row.id} className="border-b border-black hover:bg-slate-50 transition-colors">
                            <td className="border border-black p-1 text-center font-bold text-[9px]">{row.no}</td>
                            <td className="border border-black p-1.5 overflow-hidden">
                              <div className="flex justify-between items-baseline gap-1 overflow-hidden">
                                <span className="font-bold text-[9.5px] truncate" title={row.nama}>{row.nama}</span>
                                <span className="font-mono text-[8px] text-slate-800 shrink-0">{row.nip}</span>
                              </div>
                              <div className="flex justify-between items-baseline gap-1 text-[8.5px] text-slate-700 overflow-hidden mt-0.5">
                                <span className="truncate">{row.ttlFormatted}</span>
                                <span className="font-semibold text-slate-900 shrink-0">{row.pangkatGolongan}</span>
                              </div>
                            </td>

                            {/* Sakit (Hari) - Droplist 1-25 */}
                            <td className="border border-black p-0.5 text-center align-middle">
                              <select
                                value={att.s || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 's', Number(e.target.value))}
                                className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded text-[9px] font-bold py-0.5 cursor-pointer outline-none print:hidden"
                                title={`Sakit: ${att.s || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[9px]">
                                {att.s && att.s > 0 ? att.s : '-'}
                              </span>
                            </td>

                            {/* Ijin (Hari) - Droplist 1-25 */}
                            <td className="border border-black p-0.5 text-center align-middle">
                              <select
                                value={att.i || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 'i', Number(e.target.value))}
                                className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded text-[9px] font-bold py-0.5 cursor-pointer outline-none print:hidden"
                                title={`Ijin: ${att.i || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[9px]">
                                {att.i && att.i > 0 ? att.i : '-'}
                              </span>
                            </td>

                            {/* Cuti (Hari) - Droplist 1-25 */}
                            <td className="border border-black p-0.5 text-center align-middle">
                              <select
                                value={att.ct || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 'ct', Number(e.target.value))}
                                className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded text-[9px] font-bold py-0.5 cursor-pointer outline-none print:hidden"
                                title={`Cuti: ${att.ct || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[9px]">
                                {att.ct && att.ct > 0 ? att.ct : '-'}
                              </span>
                            </td>

                            {/* Dinas Diluar (Hari) - Droplist 1-25 */}
                            <td className="border border-black p-0.5 text-center align-middle">
                              <select
                                value={att.dl || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 'dl', Number(e.target.value))}
                                className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded text-[9px] font-bold py-0.5 cursor-pointer outline-none print:hidden"
                                title={`Dinas Luar: ${att.dl || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[9px]">
                                {att.dl && att.dl > 0 ? att.dl : '-'}
                              </span>
                            </td>

                            {/* Pendidikan (Hari) - Droplist 1-25 */}
                            <td className="border border-black p-0.5 text-center align-middle">
                              <select
                                value={att.dik || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 'dik', Number(e.target.value))}
                                className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded text-[9px] font-bold py-0.5 cursor-pointer outline-none print:hidden"
                                title={`Pendidikan/Diklat: ${att.dik || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[9px]">
                                {att.dik && att.dik > 0 ? att.dik : '-'}
                              </span>
                            </td>

                            {/* Tanpa Keterangan / Alpha (Hari) - Droplist 1-25 */}
                            <td className="border border-black p-0.5 text-center align-middle">
                              <select
                                value={att.a || 0}
                                onChange={(e) => handleUpdateAttendance(row.id, 'a', Number(e.target.value))}
                                className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded text-[9px] font-bold py-0.5 cursor-pointer outline-none print:hidden"
                                title={`Tanpa Ket./Alpha: ${att.a || 0} hari kerja`}
                              >
                                <option value={0}>-</option>
                                {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                              <span className="hidden print:inline-block font-bold text-[9px]">
                                {att.a && att.a > 0 ? att.a : '-'}
                              </span>
                            </td>

                            {/* Keterangan */}
                            <td className="border border-black p-0.5 text-center align-middle overflow-hidden">
                              <input
                                type="text"
                                value={att.keterangan || '-'}
                                onChange={(e) => handleUpdateAttendance(row.id, 'keterangan', e.target.value)}
                                className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white rounded text-[8.5px] py-0.5 px-0.5 outline-none print:hidden truncate"
                                placeholder="-"
                                title="Keterangan"
                              />
                              <span className="hidden print:inline-block text-[8.5px] truncate max-w-full">
                                {att.keterangan || '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Signature Plt Kepala Sekolah */}
                <div className="flex justify-end pt-6 pr-6">
                  <div className="text-center text-xs space-y-1">
                    <div>Pasuruan, {tanggalLaporan}</div>
                    <div className="font-bold">Plt Kepala SDN Kedungringin I Beji</div>
                    <div className="h-16" />
                    <div className="font-bold underline text-sm">FUAD FAHRUDIN, M.Pd</div>
                    <div className="font-mono text-[10px]">NIP. 198006182005011010</div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. REPORT 3: FORMAT PRESENSI BULAN (A4 LANSKAPE)                         */}
            {/* ========================================================================= */}
            {activeReport === 'format_presensi_bulan' && (() => {
              // Dynamic days in selected month: 1 to 28/29/30/31
              const daysCount = Math.min(parsed.lastDate, 31);
              const days = Array.from({ length: daysCount }, (_, i) => i + 1);
              // Calculate Sundays for the selected month and year
              const sundays: number[] = [];
              for (let d = 1; d <= daysCount; d++) {
                const dow = new Date(parsed.year, parsed.monthIdx, d).getDay();
                if (dow === 0) sundays.push(d);
              }

              // In official format, teachers & P2SD staff list (7 staff, with Headmaster signing at bottom)
              const teachersOnly = asnRows.filter((p) => !p.jabatan.toLowerCase().includes('kepala sekolah'));

              return (
                <div className="space-y-3 text-slate-900">
                  {/* Header Resmi */}
                  <div className="flex items-center gap-4 border-b border-black pb-2">
                    <LogoPasuruan className="w-14 h-16 shrink-0" size={56} />
                    <div className="text-center flex-1">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                        PEMERINTAH KABUPATEN PASURUAN
                      </h2>
                      <h1 className="text-base font-extrabold uppercase text-black">
                        DINAS PENDIDIKAN
                      </h1>
                      <h3 className="text-sm font-bold uppercase text-black tracking-wide">
                        SDN KEDUNGRINGIN I BEJI
                      </h3>
                    </div>
                    <div className="w-14" /> {/* Spacer */}
                  </div>

                  {/* Sub Header: DAFTAR HADIR PEGAWAI & Hari Kerja Efektif */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-bold text-black pt-1 gap-1">
                    <div className="flex items-center gap-2">
                      <span>DAFTAR HADIR PEGAWAI</span>
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 print:hidden">
                        Efektif: {monthDayStats.workingDays} Hari Kerja • {monthDayStats.sundays} Minggu • {monthDayStats.nationalHolidays + monthDayStats.cutiBersama} Hari Libur & Cuti
                      </span>
                    </div>
                    <span>BULAN : {periodeBulan}</span>
                  </div>

                  {/* Table Daftar Hadir Harian Pegawai */}
                  <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full table-fixed text-left text-[8px] border-collapse border border-black font-sans">
                      <thead>
                        <tr className="bg-slate-100 text-center font-bold text-black border-b border-black">
                          <th className="border border-black p-0.5 w-[22px]" rowSpan={2}>NO</th>
                          <th className="border border-black p-0.5 w-[135px] text-left" rowSpan={2}>
                            <div className="px-1">NAMA / NIP</div>
                          </th>
                          <th className="border border-black p-0.5" colSpan={daysCount}>
                            TANGGAL BULAN {periodeBulan}
                          </th>
                          <th className="border border-black p-0.5 w-[28px]" rowSpan={2}>KET</th>
                        </tr>
                        <tr className="bg-slate-100 text-center font-bold text-black border-b border-black">
                          {days.map((d) => {
                            const hInfo = getDayHolidayInfo(parsed.year, parsed.monthIdx, d);
                            return (
                              <th 
                                key={d} 
                                title={hInfo.label || `Tanggal ${d}`}
                                style={{
                                  backgroundColor: hInfo.type !== 'kerja' ? hInfo.headerBg : undefined,
                                  color: hInfo.type !== 'kerja' ? hInfo.headerColor : undefined,
                                }}
                                className={`border border-black p-0 text-[7.5px] select-none h-6 ${
                                  hInfo.type === 'minggu'
                                    ? 'bg-red-600 text-white font-extrabold'
                                    : hInfo.type === 'libur_nasional'
                                    ? 'bg-rose-600 text-white font-extrabold'
                                    : hInfo.type === 'cuti_bersama'
                                    ? 'bg-amber-500 text-white font-extrabold'
                                    : 'text-black'
                                }`}
                              >
                                <div className="leading-none">{d}</div>
                                {hInfo.badge && (
                                  <div className="text-[5.5px] uppercase tracking-tighter opacity-95 leading-none mt-0.5 font-mono">
                                    {hInfo.badge}
                                  </div>
                                )}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {teachersOnly.map((teacher, idx) => {
                          const att = attendanceState[teacher.id];
                          const totalAbsen = att ? (att.s || 0) + (att.i || 0) + (att.a || 0) + (att.ct || 0) : 0;
                          const ketTeks = totalAbsen > 0 
                            ? [att?.s ? `S:${att.s}` : '', att?.i ? `I:${att.i}` : '', att?.a ? `A:${att.a}` : ''].filter(Boolean).join(' ')
                            : '-';

                          return (
                            <tr key={teacher.id} className="border-b border-black h-7 hover:bg-slate-50 transition-colors">
                              <td className="border border-black p-0.5 text-center font-bold text-[8px]">{idx + 1}</td>
                              <td className="border border-black px-1.5 py-0.5 overflow-hidden">
                                <div className="font-bold text-[8.5px] truncate max-w-[130px] leading-tight" title={teacher.nama}>
                                  {teacher.nama}
                                </div>
                                <div className="font-mono text-[7px] text-slate-700 truncate max-w-[130px] leading-none mt-0.5">
                                  {teacher.nip}
                                </div>
                              </td>
                              {days.map((d) => {
                                const hInfo = getDayHolidayInfo(parsed.year, parsed.monthIdx, d);
                                return (
                                  <td
                                    key={d}
                                    title={hInfo.label || `Tanggal ${d}`}
                                    style={{
                                      backgroundColor: hInfo.type !== 'kerja' ? hInfo.cellBg : undefined,
                                      color: hInfo.type !== 'kerja' ? hInfo.cellColor : undefined,
                                    }}
                                    className={`border border-black p-0 text-center text-[7px] font-bold select-none ${
                                      hInfo.type === 'minggu'
                                        ? 'bg-red-100 text-red-800'
                                        : hInfo.type === 'libur_nasional'
                                        ? 'bg-rose-100 text-rose-900'
                                        : hInfo.type === 'cuti_bersama'
                                        ? 'bg-amber-100 text-amber-950'
                                        : 'bg-white'
                                    }`}
                                  >
                                    {hInfo.type === 'minggu' 
                                      ? 'L' 
                                      : hInfo.type === 'libur_nasional' 
                                      ? 'LN' 
                                      : hInfo.type === 'cuti_bersama' 
                                      ? 'CB' 
                                      : ''}
                                  </td>
                                );
                              })}
                              <td className="border border-black p-0.5 text-center font-bold text-[7px] truncate" title={ketTeks}>
                                {ketTeks}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Legenda Keterangan Hari & Warna (Minggu, Hari Libur Besar, Cuti Bersama) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-[8px] pt-1.5 pb-0.5 border-t border-slate-300 mt-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-slate-900">Keterangan Warna Hari:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center bg-red-100 text-red-700 text-[7px] font-bold">L</span>
                          <span className="font-semibold text-slate-800">Libur Umum (Minggu)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center bg-rose-200 text-rose-900 text-[7px] font-bold">LN</span>
                          <span className="font-semibold text-slate-800">Libur Hari Besar / Nasional</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center bg-amber-200 text-amber-950 text-[7px] font-bold">CB</span>
                          <span className="font-semibold text-slate-800">Cuti Bersama Pemerintah</span>
                        </div>
                      </div>
                      <div className="text-[7.5px] text-slate-600 italic">
                        *Kolom hari libur dan cuti bersama diarsir warna agar presisi saat verifikasi paraf hadir
                      </div>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="flex justify-end pt-4 pr-12">
                    <div className="text-center text-xs space-y-1">
                      <div>Kedungringin, {tanggalLaporan}</div>
                      <div className="font-bold">Plt Kepala Sekolah</div>
                      <div className="font-bold">SDN Kedungringin I Beji</div>
                      <div className="h-14" />
                      <div className="font-bold underline text-xs">FUAD FAHRUDIN, M.Pd</div>
                      <div className="font-mono text-[10px]">NIP. 198006182005011010</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ========================================================================= */}
            {/* 4. REPORT 4: DATA SISWA (A4 LANSKAPE)                                    */}
            {/* ========================================================================= */}
            {activeReport === 'data_siswa' && (
              <div className="space-y-2 text-slate-900 text-[9px] leading-tight font-sans">
                {/* Title & Department Header with Official Logo */}
                <div className="flex items-center justify-between pb-1 border-b border-black gap-2">
                  <div className="w-12 shrink-0 flex items-center justify-center">
                    <LogoPasuruan className="w-10 h-13 object-contain" />
                  </div>
                  <div className="flex-1 text-center space-y-0.5">
                    <h1 className="text-xs font-extrabold uppercase text-black tracking-wider">
                      DAFTAR LAPOR BULAN {periodeBulan}
                    </h1>
                    <h2 className="text-[11px] font-bold uppercase text-black">
                      DINAS PENDIDIKAN DAN KEBUDAYAAN KABUPATEN PASURUAN
                    </h2>
                  </div>
                  <div className="w-12 shrink-0 hidden sm:block print:block" />
                </div>

                {/* Info Identitas Sekolah */}
                <div className="flex justify-between items-start text-[8.5px] pt-0.5 border-b border-black pb-1">
                  <div className="space-y-0.5">
                    <div className="flex gap-2">
                      <span className="w-32">Halaman</span>
                      <span>: 2</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-32">Nama Sekolah</span>
                      <span>: SDN KEDUNGRINGIN I KEC. BEJI</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-32">Nomor Statistik Sekolah</span>
                      <span>: {profil.nss || '101051913012'}</span>
                      <span className="ml-4 font-bold">NPSN : {profil.npsn}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-32">Alamat Sekolah</span>
                      <span>: {profil.alamat}</span>
                    </div>
                  </div>
                  <div className="font-bold uppercase tracking-wider text-[8px] bg-slate-100 p-1 border border-black">
                    PROVINSI DAERAH TINGKAT I JATIM
                  </div>
                </div>

                {/* Main 2-Column Content Layout (Matching attachment 3) */}
                <div className="grid grid-cols-12 gap-3 pt-1">
                  
                  {/* Left Column (Col 1 to 7) - Keadaan Siswa, Agama, Sarpras, Penjaga */}
                  <div className="col-span-7 space-y-2">
                    {/* Table Keadaan Murid */}
                    <div>
                      <div className="text-center font-bold text-[8.5px] uppercase bg-slate-100 border border-black p-0.5">
                        TAHUN PELAJARAN {profil.tahunPelajaranAktif || '2026/2027'}
                      </div>
                      <table className="w-full text-center text-[8px] border-collapse border border-black">
                        <thead>
                          <tr className="bg-slate-50 font-bold border-b border-black">
                            <th className="border border-black p-0.5 w-20" rowSpan={2}>Keadaan Murid</th>
                            <th className="border border-black p-0.5" colSpan={18}>BANYAKNYA PESERTA DIDIK</th>
                            <th className="border border-black p-0.5" colSpan={3}>Jumlah</th>
                          </tr>
                          <tr className="bg-slate-50 font-bold border-b border-black">
                            {dataSiswaRekap.perKelas.map((k) => (
                              <React.Fragment key={k.kelas}>
                                <th className="border border-black p-0.5" colSpan={3}>{k.label}</th>
                              </React.Fragment>
                            ))}
                            <th className="border border-black p-0.5">L</th>
                            <th className="border border-black p-0.5">P</th>
                            <th className="border border-black p-0.5">Semua</th>
                          </tr>
                          <tr className="bg-slate-100 font-bold border-b border-black text-[7.5px]">
                            <th className="border border-black p-0.5" />
                            {dataSiswaRekap.perKelas.map((k) => (
                              <React.Fragment key={k.kelas}>
                                <th className="border border-black p-0.5">L</th>
                                <th className="border border-black p-0.5">P</th>
                                <th className="border border-black p-0.5">Jml</th>
                              </React.Fragment>
                            ))}
                            <th className="border border-black p-0.5">{dataSiswaRekap.totalL}</th>
                            <th className="border border-black p-0.5">{dataSiswaRekap.totalP}</th>
                            <th className="border border-black p-0.5">{dataSiswaRekap.totalSemua}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-black">
                            <td className="border border-black p-0.5 font-bold text-left pl-1">Awal Bulan</td>
                            {dataSiswaRekap.perKelas.map((k) => (
                              <React.Fragment key={k.kelas}>
                                <td className="border border-black p-0.5">{k.l}</td>
                                <td className="border border-black p-0.5">{k.p}</td>
                                <td className="border border-black p-0.5 font-bold">{k.total}</td>
                              </React.Fragment>
                            ))}
                            <td className="border border-black p-0.5 font-bold">{dataSiswaRekap.totalL}</td>
                            <td className="border border-black p-0.5 font-bold">{dataSiswaRekap.totalP}</td>
                            <td className="border border-black p-0.5 font-extrabold">{dataSiswaRekap.totalSemua}</td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border border-black p-0.5 text-left pl-1">Masuk</td>
                            {dataSiswaRekap.perKelas.map((k) => (
                              <React.Fragment key={k.kelas}>
                                <td className="border border-black p-0.5">0</td>
                                <td className="border border-black p-0.5">0</td>
                                <td className="border border-black p-0.5">0</td>
                              </React.Fragment>
                            ))}
                            <td className="border border-black p-0.5">0</td>
                            <td className="border border-black p-0.5">0</td>
                            <td className="border border-black p-0.5">0</td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border border-black p-0.5 text-left pl-1">Keluar</td>
                            {dataSiswaRekap.perKelas.map((k) => (
                              <React.Fragment key={k.kelas}>
                                <td className="border border-black p-0.5">0</td>
                                <td className="border border-black p-0.5">0</td>
                                <td className="border border-black p-0.5">0</td>
                              </React.Fragment>
                            ))}
                            <td className="border border-black p-0.5">0</td>
                            <td className="border border-black p-0.5">0</td>
                            <td className="border border-black p-0.5">0</td>
                          </tr>
                          <tr className="border-b border-black bg-slate-50 font-bold">
                            <td className="border border-black p-0.5 text-left pl-1">Jumlah</td>
                            {dataSiswaRekap.perKelas.map((k) => (
                              <React.Fragment key={k.kelas}>
                                <td className="border border-black p-0.5">{k.l}</td>
                                <td className="border border-black p-0.5">{k.p}</td>
                                <td className="border border-black p-0.5">{k.total}</td>
                              </React.Fragment>
                            ))}
                            <td className="border border-black p-0.5">{dataSiswaRekap.totalL}</td>
                            <td className="border border-black p-0.5">{dataSiswaRekap.totalP}</td>
                            <td className="border border-black p-0.5">{dataSiswaRekap.totalSemua}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Table Agama */}
                    <div>
                      <div className="font-bold text-[8px] uppercase bg-slate-100 border border-black px-1 py-0.5">
                        AGAMA
                      </div>
                      <table className="w-full text-center text-[8px] border-collapse border border-black">
                        <tbody>
                          <tr className="border-b border-black">
                            <td className="border border-black p-0.5 text-left pl-1 w-20">Islam</td>
                            {dataSiswaRekap.perKelas.map((k) => (
                              <React.Fragment key={k.kelas}>
                                <td className="border border-black p-0.5">{k.agama.islam.l}</td>
                                <td className="border border-black p-0.5">{k.agama.islam.p}</td>
                                <td className="border border-black p-0.5 font-bold">{k.agama.islam.l + k.agama.islam.p}</td>
                              </React.Fragment>
                            ))}
                            <td className="border border-black p-0.5 font-bold">{dataSiswaRekap.agamaIslam.l}</td>
                            <td className="border border-black p-0.5 font-bold">{dataSiswaRekap.agamaIslam.p}</td>
                            <td className="border border-black p-0.5 font-extrabold">{dataSiswaRekap.agamaIslam.total}</td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border border-black p-0.5 text-left pl-1">Kristen Protestan</td>
                            {dataSiswaRekap.perKelas.map((k) => (
                              <React.Fragment key={k.kelas}>
                                <td className="border border-black p-0.5">{k.agama.kristen.l}</td>
                                <td className="border border-black p-0.5">{k.agama.kristen.p}</td>
                                <td className="border border-black p-0.5">{k.agama.kristen.l + k.agama.kristen.p}</td>
                              </React.Fragment>
                            ))}
                            <td className="border border-black p-0.5">{dataSiswaRekap.agamaKristen.l}</td>
                            <td className="border border-black p-0.5">{dataSiswaRekap.agamaKristen.p}</td>
                            <td className="border border-black p-0.5">{dataSiswaRekap.agamaKristen.total}</td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border border-black p-0.5 text-left pl-1">Kristen Katolik</td>
                            {dataSiswaRekap.perKelas.map((k) => (
                              <React.Fragment key={k.kelas}>
                                <td className="border border-black p-0.5">{k.agama.katolik.l}</td>
                                <td className="border border-black p-0.5">{k.agama.katolik.p}</td>
                                <td className="border border-black p-0.5">{k.agama.katolik.l + k.agama.katolik.p}</td>
                              </React.Fragment>
                            ))}
                            <td className="border border-black p-0.5">{dataSiswaRekap.agamaKatolik.l}</td>
                            <td className="border border-black p-0.5">{dataSiswaRekap.agamaKatolik.p}</td>
                            <td className="border border-black p-0.5">{dataSiswaRekap.agamaKatolik.total}</td>
                          </tr>
                          <tr className="border-b border-black bg-slate-50 font-bold">
                            <td className="border border-black p-0.5 text-left pl-1">Jumlah</td>
                            {dataSiswaRekap.perKelas.map((k) => (
                              <React.Fragment key={k.kelas}>
                                <td className="border border-black p-0.5">{k.l}</td>
                                <td className="border border-black p-0.5">{k.p}</td>
                                <td className="border border-black p-0.5">{k.total}</td>
                              </React.Fragment>
                            ))}
                            <td className="border border-black p-0.5">{dataSiswaRekap.totalL}</td>
                            <td className="border border-black p-0.5">{dataSiswaRekap.totalP}</td>
                            <td className="border border-black p-0.5">{dataSiswaRekap.totalSemua}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Sections E, F, G, H */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {/* E, F, G */}
                      <div className="space-y-1.5 border border-black p-1.5">
                        <div>
                          <div className="font-bold">E. Banyaknya Penjaga SD</div>
                          <div className="pl-2 space-y-0.2">
                            <div>1. PNS : 1 Orang</div>
                            <div>2. PPPK : - Orang</div>
                            <div>3. Sukwan : - Orang</div>
                          </div>
                        </div>

                        <div>
                          <div className="font-bold">F. Banyaknya Hari Sekolah</div>
                          <div className="pl-2">Efektif : 24 Hari</div>
                        </div>

                        <div>
                          <div className="font-bold">G. Absensi Peserta Didik</div>
                          <div className="pl-2 space-y-0.2">
                            <div>a. Sakit : - %</div>
                            <div>b. Izin : - %</div>
                            <div>c. Alpha : - % +</div>
                            <div className="font-semibold">Jumlah : - %</div>
                          </div>
                        </div>
                      </div>

                      {/* H. Sarana Pendidikan & Perlengkapan Sekolah (Parallel 2 columns) */}
                      <div className="border border-black p-1.5">
                        <div className="font-bold mb-1">H. Sarana Pendidikan & Perlengkapan Sekolah</div>
                        <div className="grid grid-cols-2 gap-x-2 text-[7.5px] leading-snug">
                          {dataSiswaRekap.saranaList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-baseline border-b border-slate-200 py-0.2">
                              <span className="truncate pr-1">{item.nama}</span>
                              <span className="font-bold shrink-0">{item.jumlah}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Col 8 to 12) - Ruangan A, Rombel B, PTK C, Status Guru D */}
                  <div className="col-span-5 space-y-2 border border-black p-2">
                    {/* A. Banyaknya Ruangan */}
                    <div>
                      <div className="font-bold text-[9px] mb-0.5">A. Banyaknya Ruangan</div>
                      <div className="space-y-0.5 pl-2 text-[8px]">
                        <div>
                          <div className="font-semibold">1. Jumlah ruang kelas : 6 ruang</div>
                          <div className="pl-3 text-slate-700">Hak milik : 6 ruang, Sewa : -, Pinjam : -</div>
                        </div>
                        <div>
                          <div className="font-semibold">2. Jumlah ruang kantor : 1 ruang</div>
                          <div className="pl-3 text-slate-700">Hak milik : 1 ruang, Sewa : -, Pinjam : -</div>
                        </div>
                        <div>
                          <div className="font-semibold">3. Jumlah ruangan KM/WC : 5 ruang</div>
                          <div className="pl-3 text-slate-700">Hak milik : 5 ruang, Sewa : -, Pinjam : -</div>
                        </div>
                        <div>
                          <div className="font-semibold">4. Jumlah ruang lain-lain (UKS/Koperasi/Perpus, Musholla, dll)</div>
                          <div className="pl-3 text-slate-700">Hak milik : 3 ruang, Sewa : -, Pinjam : -</div>
                        </div>
                      </div>
                    </div>

                    {/* B. Banyaknya Kelas / Rombongan Belajar */}
                    <div className="pt-1 border-t border-black">
                      <div className="font-bold text-[9px] mb-0.5">B. Banyaknya Kelas / Rombongan Belajar</div>
                      <div className="grid grid-cols-2 gap-x-2 pl-2 text-[8px]">
                        {dataSiswaRekap.rombonganBelajar.map((r, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{r.kelas}</span>
                            <span>: {r.ruang} ruang : {r.rombel} Rombel</span>
                          </div>
                        ))}
                      </div>
                      <div className="pl-2 pt-0.5 font-bold flex justify-between border-t border-slate-300 mt-0.5">
                        <span>Jumlah</span>
                        <span>: 6 ruang : 6 Rombel</span>
                      </div>
                    </div>

                    {/* C. Banyaknya PTK */}
                    <div className="pt-1 border-t border-black">
                      <div className="font-bold text-[9px] mb-0.5">C. Banyaknya PTK</div>
                      <div className="space-y-0.2 pl-2 text-[8px]">
                        <div className="flex justify-between"><span>1. Kepala Sekolah</span><span>: {ptkStats.kepsek} Orang</span></div>
                        <div className="flex justify-between"><span>2. Guru Kelas</span><span>: {ptkStats.guruKelas} Orang</span></div>
                        <div className="flex justify-between"><span>3. Guru Penjaskor</span><span>: {ptkStats.guruPjok} Orang</span></div>
                        <div className="flex justify-between"><span>4. Guru PAI</span><span>: {ptkStats.guruPai} Orang</span></div>
                        <div className="flex justify-between"><span>5. Guru BTQ</span><span>: {ptkStats.guruBtq > 0 ? `${ptkStats.guruBtq} Orang` : '- Orang'}</span></div>
                        <div className="flex justify-between"><span>6. Administrasi umum</span><span>: {ptkStats.admin > 0 ? `${ptkStats.admin} Orang` : '- Orang'}</span></div>
                        <div className="flex justify-between"><span>7. Guru Mapel Lainnya</span><span>: {ptkStats.guruLain > 0 ? `${ptkStats.guruLain} Orang` : '- Orang'}</span></div>
                        <div className="flex justify-between font-bold pt-0.5 border-t border-slate-300">
                          <span>Jumlah</span>
                          <span>: {ptkStats.totalPtk} Orang</span>
                        </div>
                      </div>
                    </div>

                    {/* D. Status Guru dan Kepala Sekolah */}
                    <div className="pt-1 border-t border-black">
                      <div className="font-bold text-[9px] mb-0.5">D. Status Guru dan Kepala Sekolah</div>
                      <div className="space-y-0.2 pl-2 text-[8px]">
                        <div className="flex justify-between"><span>1. PNS</span><span>: {ptkStats.pns} Orang</span></div>
                        <div className="flex justify-between"><span>2. PPPK</span><span>: {ptkStats.pppk} Orang</span></div>
                        <div className="flex justify-between"><span>3. PPPK PW / Non ASN</span><span>: {ptkStats.nonAsn > 0 ? `${ptkStats.nonAsn} Orang` : '- Orang'}</span></div>
                        <div className="flex justify-between font-bold pt-0.5 border-t border-slate-300">
                          <span>Jumlah</span>
                          <span>: {ptkStats.totalStatus} Orang</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar (Screen Only) */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              Format Dokumen: <strong>{orientationLabel} (Kertas A4)</strong> • Margin Cetak: <strong>1,0 cm pada tiap sisi</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleExportWord}
              disabled={isExportingWord}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer ring-2 ring-blue-600/30 hover:scale-[1.02] disabled:opacity-60"
              title="Unduh dan simpan laporan dalam format Microsoft Word (.doc, A4, Margin 1 cm tiap sisi)"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>{isExportingWord ? 'Menyimpan Word...' : 'Unduh Word (.doc)'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer ring-2 ring-emerald-600/30 hover:scale-[1.02]"
              title="Unduh berkas PDF atau cetak ke kertas A4 (Margin 1 cm tiap sisi)"
            >
              <Download className="w-4 h-4" />
              <span>Unduh PDF (A4 - 1cm)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
