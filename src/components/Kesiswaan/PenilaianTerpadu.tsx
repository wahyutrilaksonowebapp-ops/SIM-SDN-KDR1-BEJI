import React, { useState, useMemo } from 'react';
import { 
  Siswa, 
  ProfilSekolah, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ, 
  UserRole, 
  AuthUser,
  NilaiTKA 
} from '../../types';
import { 
  MANDATORY_MAPEL, 
  getMapelScore, 
  ProcessedRapor, 
  RaporCalculationMode 
} from './RekapRapor';
import { getBTQPredicate } from '../../utils/helpers';
import { logUserActivity } from '../../services/logger';
import { 
  Award, 
  BookOpen, 
  Star, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  SlidersHorizontal, 
  Edit3, 
  CheckCircle2, 
  CheckCircle,
  X, 
  Download, 
  Sparkles,
  Layers,
  GraduationCap,
  Filter,
  Check,
  AlertCircle,
  Upload,
  FileUp,
  FileDown,
  Table,
  Copy,
  FileText,
  CheckCheck
} from 'lucide-react';

interface PenilaianTerpaduProps {
  siswa: Siswa[];
  profil: ProfilSekolah;
  rapor: RekapRaporSiswa[];
  btq: NilaiIjazahBTQ[];
  userRole?: UserRole;
  currentUser?: AuthUser;
  onSaveRapor: (r: RekapRaporSiswa) => void;
  onSaveBTQ: (b: NilaiIjazahBTQ) => void;
  onDeleteBTQ?: (id: string) => void;
  onOpenTranscriptModal: (item: ProcessedRapor) => void;
  onOpenCertificateModal: (item: NilaiIjazahBTQ) => void;
  onOpenSKPModal?: (item: ProcessedRapor) => void;
}

export type PenilaianViewMode = 'all' | 'rapor' | 'tka' | 'btq';

export const PenilaianTerpadu: React.FC<PenilaianTerpaduProps> = ({
  siswa,
  profil,
  rapor,
  btq,
  userRole = 'admin',
  currentUser,
  onSaveRapor,
  onSaveBTQ,
  onDeleteBTQ,
  onOpenTranscriptModal,
  onOpenCertificateModal,
  onOpenSKPModal,
}) => {
  const [viewMode, setViewMode] = useState<PenilaianViewMode>('all');
  const [calculationMode, setCalculationMode] = useState<RaporCalculationMode>('5_semester');
  const [searchTerm, setSearchTerm] = useState('');
  const [kelasFilter, setKelasFilter] = useState<string>(() => {
    if (currentUser?.role === 'guru' && currentUser?.kelas) {
      return String(currentUser.kelas);
    }
    return '6';
  });

  // Template and Import Modal States
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importTarget, setImportTarget] = useState<'sem7' | 'sem8' | 'sem9' | 'sem10' | 'sem11' | 'sem12' | 'tka' | 'btq'>('sem11');
  const [importMode, setImportMode] = useState<'paste' | 'file'>('paste');
  const [importRawText, setImportRawText] = useState('');
  const [importPreviewRows, setImportPreviewRows] = useState<any[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);

  // Unified Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'rapor' | 'tka' | 'btq'>('rapor');
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);

  // Form State for Rapor + TKA
  const [formRapor, setFormRapor] = useState<RekapRaporSiswa | null>(null);

  // Form State for BTQ
  const [formBtq, setFormBtq] = useState<NilaiIjazahBTQ | null>(null);

  const targetSemesters = calculationMode === '5_semester' ? [7, 8, 9, 10, 11] : [9, 10, 11, 12];

  // Process Rapor averages and rankings
  const processedRaporMap = useMemo(() => {
    const map = new Map<string, ProcessedRapor>();

    const processed = rapor.map((r) => {
      const semMap: Record<number, Record<string, number>> = {
        7: r.semester7 || {},
        8: r.semester8 || {},
        9: r.semester9 || {},
        10: r.semester10 || {},
        11: r.semester11 || {},
        12: r.semester12 || {},
      };

      const mapelAverages: Record<string, number> = {};
      let sumOfMapelAvgs = 0;
      let validCount = 0;

      MANDATORY_MAPEL.forEach((mapel) => {
        let sum = 0;
        let count = 0;

        targetSemesters.forEach((sem) => {
          const val = getMapelScore(semMap[sem], mapel);
          if (val > 0) {
            sum += val;
            count++;
          }
        });

        const avg = count > 0 ? Number((sum / count).toFixed(1)) : 0;
        mapelAverages[mapel] = avg;
        if (avg > 0) {
          sumOfMapelAvgs += avg;
          validCount++;
        }
      });

      const overallAverage = validCount > 0 ? Number((sumOfMapelAvgs / validCount).toFixed(2)) : 0;

      return {
        original: r,
        id: r.id,
        siswaId: r.siswaId,
        nisn: r.nisn,
        namaSiswa: r.namaSiswa,
        kelas: r.kelas,
        rombel: r.rombel,
        mode: calculationMode,
        semestersIncluded: targetSemesters,
        mapelAverages,
        totalScore: Number(sumOfMapelAvgs.toFixed(1)),
        overallAverage,
        rank: 1,
      };
    });

    processed.sort((a, b) => b.overallAverage - a.overallAverage);
    processed.forEach((item, index) => {
      item.rank = index + 1;
      map.set(item.siswaId, item);
      map.set(item.nisn, item);
      map.set(item.id, item);
    });

    return map;
  }, [rapor, calculationMode, targetSemesters]);

  // BTQ Map by SiswaId and NISN
  const btqMap = useMemo(() => {
    const map = new Map<string, NilaiIjazahBTQ>();
    btq.forEach((b) => {
      map.set(b.siswaId, b);
      map.set(b.nisn, b);
      map.set(b.id, b);
    });
    return map;
  }, [btq]);

  // Merged Student Assessments List
  const unifiedStudentList = useMemo(() => {
    return siswa
      .filter((s) => {
        const matchKelas = kelasFilter === 'ALL' || String(s.kelas) === kelasFilter;
        const matchSearch =
          s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.nisn.includes(searchTerm) ||
          s.nis.includes(searchTerm);
        return matchKelas && matchSearch;
      })
      .map((s) => {
        const rItem = processedRaporMap.get(s.id) || processedRaporMap.get(s.nisn);
        const bItem = btqMap.get(s.id) || btqMap.get(s.nisn);
        const originalRapor = rapor.find((r) => r.siswaId === s.id || r.nisn === s.nisn);

        return {
          siswa: s,
          raporProcessed: rItem,
          raporOriginal: originalRapor,
          btq: bItem,
        };
      });
  }, [siswa, kelasFilter, searchTerm, processedRaporMap, btqMap, rapor]);

  // Open Unified Modal for a Student
  const handleOpenUnifiedModal = (s: Siswa) => {
    setSelectedSiswa(s);

    // Existing Rapor or create template
    const existingRapor = rapor.find((r) => r.siswaId === s.id || r.nisn === s.nisn);
    if (existingRapor) {
      setFormRapor(JSON.parse(JSON.stringify(existingRapor)));
    } else {
      setFormRapor({
        id: `rr-${s.id}`,
        siswaId: s.id,
        nisn: s.nisn,
        namaSiswa: s.nama,
        kelas: s.kelas,
        rombel: s.rombel || 'A',
        semester7: {},
        semester8: {},
        semester9: {},
        semester10: {},
        semester11: {},
        semester12: {},
        tka: {
          numerasi: 85,
          literasi: 88,
          ipaPilihan: 86,
          rataRata: 86.3,
          predikat: 'Sangat Baik',
          nomorPeserta: `TKA-2026-${s.nisn.slice(-4)}`,
          catatan: 'Siap mengikuti jenjang pendidikan lanjutan.',
        },
      });
    }

    // Existing BTQ or create template
    const existingBtq = btq.find((b) => b.siswaId === s.id || b.nisn === s.nisn);
    if (existingBtq) {
      setFormBtq(JSON.parse(JSON.stringify(existingBtq)));
    } else {
      const nextSeq = String(btq.length + 1).padStart(3, '0');
      setFormBtq({
        id: `btq-${s.id}`,
        siswaId: s.id,
        nisn: s.nisn,
        namaSiswa: s.nama,
        kelas: s.kelas,
        noSertifikat: `421.2/BTQ-${nextSeq}/424.072.24/2026`,
        tahsin: 88,
        tajwid: 86,
        tahfidz: 90,
        menulis: 85,
        membaca: 90,
        rataRata: 87.8,
        predikat: 'Mumtaz',
        statusKelulusan: 'Lulus',
        catatan: 'Makhraj fasih, tartil, dan hafal surat-surat juz 30 dengan baik.',
        tanggalTerbit: '15 Juni 2026',
        penguji: 'Wahyu Tri Laksono, S.Pd.I',
      });
    }

    setActiveModalTab('rapor');
    setModalOpen(true);
  };

  // Save all assessments together
  const handleSaveAllAssessments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswa || !formRapor || !formBtq) return;

    // 1. Calculate TKA average & predicate
    const tka = formRapor.tka;
    if (tka) {
      const num = Number(tka.numerasi) || 0;
      const lit = Number(tka.literasi) || 0;
      const ipa = Number(tka.ipaPilihan) || 0;
      const avgTka = Number(((num + lit + ipa) / 3).toFixed(1));
      let pred: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan' = 'Baik';
      if (avgTka >= 85) pred = 'Sangat Baik';
      else if (avgTka >= 75) pred = 'Baik';
      else if (avgTka >= 65) pred = 'Cukup';
      else pred = 'Perlu Bimbingan';

      formRapor.tka = {
        ...tka,
        rataRata: avgTka,
        predikat: pred,
      };
    }

    // 2. Calculate BTQ average & predicate
    const bAvg = Number(
      ((Number(formBtq.tahsin) +
        Number(formBtq.tajwid) +
        Number(formBtq.tahfidz) +
        Number(formBtq.menulis) +
        Number(formBtq.membaca)) /
        5).toFixed(1)
    );
    const predInfo = getBTQPredicate(bAvg);
    const updatedBtq: NilaiIjazahBTQ = {
      ...formBtq,
      rataRata: bAvg,
      predikat: predInfo.predikat as any,
      statusKelulusan: bAvg >= 70 ? 'Lulus' : 'Remedial',
    };

    // Save to parent state
    onSaveRapor(formRapor);
    onSaveBTQ(updatedBtq);

    logUserActivity({
      userName: currentUser?.name || 'Administrator',
      role: userRole,
      action: 'UBAH',
      category: 'RAPOR',
      description: `Memperbarui input penilaian terpadu (Rapor, TKA & BTQ) untuk siswa ${selectedSiswa.nama} (NISN: ${selectedSiswa.nisn}).`,
    });

    setModalOpen(false);
  };

  // Export Unified Assessment to CSV
  const handleExportCSV = () => {
    const headers = [
      'NISN',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Rombel',
      'Rata-rata Rapor (8 Mapel)',
      'Peringkat Rapor',
      'TKA Numerasi',
      'TKA Literasi',
      'TKA IPA Pilihan',
      'Rerata TKA',
      'Predikat TKA',
      'No Sertifikat BTQ',
      'BTQ Tahsin',
      'BTQ Tajwid',
      'BTQ Tahfidz',
      'BTQ Menulis',
      'BTQ Membaca',
      'Rerata BTQ',
      'Predikat BTQ',
      'Status Kelulusan BTQ'
    ];

    const rows = unifiedStudentList.map(({ siswa: s, raporProcessed: rp, btq: b }) => {
      const tka = rp?.original?.tka;
      return [
        `"${s.nisn}"`,
        `"${s.nis}"`,
        `"${s.nama}"`,
        `"${s.kelas}"`,
        `"${s.rombel}"`,
        `"${rp?.overallAverage || '-'}"`,
        `"${rp?.rank || '-'}"`,
        `"${tka?.numerasi ?? '-'}"`,
        `"${tka?.literasi ?? '-'}"`,
        `"${tka?.ipaPilihan ?? '-'}"`,
        `"${tka?.rataRata ?? '-'}"`,
        `"${tka?.predikat ?? '-'}"`,
        `"${b?.noSertifikat ?? '-'}"`,
        `"${b?.tahsin ?? '-'}"`,
        `"${b?.tajwid ?? '-'}"`,
        `"${b?.tahfidz ?? '-'}"`,
        `"${b?.menulis ?? '-'}"`,
        `"${b?.membaca ?? '-'}"`,
        `"${b?.rataRata ?? '-'}"`,
        `"${b?.predikat ?? '-'}"`,
        `"${b?.statusKelulusan ?? '-'}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Penilaian_Terpadu_SDN_Kedungringin1_Kelas_${kelasFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCsvFile = (content: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = (target: string) => {
    const relevantSiswa = siswa.filter((s) => kelasFilter === 'ALL' || String(s.kelas) === kelasFilter);

    if (target.startsWith('sem')) {
      const semNum = Number(target.replace('sem', ''));
      const headers = [
        'NISN',
        'Nama Siswa',
        'Kelas',
        'Rombel',
        'Pendidikan Agama Islam (PAI)',
        'Pendidikan Pancasila (PKn)',
        'Bahasa Indonesia (B. Ind)',
        'Matematika (Mtk)',
        'Seni Budaya (SB)',
        'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)',
        'Bahasa Inggris (B. Ing)',
        'Muatan Lokal Bahasa Jawa (B. Jawa)'
      ];

      const rows = relevantSiswa.map((s) => {
        const existingR = rapor.find((r) => r.siswaId === s.id || r.nisn === s.nisn);
        const semKey = `semester${semNum}` as keyof RekapRaporSiswa;
        const semData = (existingR ? (existingR[semKey] as Record<string, number>) : {}) || {};
        return [
          `"${s.nisn}"`,
          `"${s.nama}"`,
          s.kelas,
          `"${s.rombel || 'A'}"`,
          getMapelScore(semData, 'Pendidikan Agama Islam') || 85,
          getMapelScore(semData, 'Pendidikan Pancasila') || 85,
          getMapelScore(semData, 'Bahasa Indonesia') || 85,
          getMapelScore(semData, 'Matematika') || 85,
          getMapelScore(semData, 'Seni Budaya') || 85,
          getMapelScore(semData, 'Pendidikan Jasmani Olahraga dan Kesehatan') || 85,
          getMapelScore(semData, 'Bahasa Inggris') || 85,
          getMapelScore(semData, 'Bahasa Jawa') || 85,
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      downloadCsvFile(csvContent, `Template_Import_Nilai_Semester_${semNum}_Kelas_${kelasFilter}_${Date.now()}.csv`);
    } else if (target === 'tka') {
      const headers = ['NISN', 'Nama Siswa', 'Kelas', 'Rombel', 'Numerasi', 'Literasi', 'IPA Pilihan', 'Nomor Peserta', 'Catatan'];
      const rows = relevantSiswa.map((s) => {
        const existingR = rapor.find((r) => r.siswaId === s.id || r.nisn === s.nisn);
        const tka = existingR?.tka;
        return [
          `"${s.nisn}"`,
          `"${s.nama}"`,
          s.kelas,
          `"${s.rombel || 'A'}"`,
          tka?.numerasi || 85,
          tka?.literasi || 88,
          tka?.ipaPilihan || 86,
          `"${tka?.nomorPeserta || `TKA-2026-${s.nisn.slice(-4)}`}"`,
          `"${tka?.catatan || 'Kompetensi baik'}"`
        ];
      });
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      downloadCsvFile(csvContent, `Template_Import_TKA_Kelas_${kelasFilter}_${Date.now()}.csv`);
    } else if (target === 'btq') {
      const headers = ['NISN', 'Nama Siswa', 'Kelas', 'No Sertifikat', 'Tahsin', 'Tajwid', 'Tahfidz', 'Menulis', 'Membaca', 'Penguji'];
      const rows = relevantSiswa.map((s, idx) => {
        const existingB = btq.find((b) => b.siswaId === s.id || b.nisn === s.nisn);
        const nextSeq = String(idx + 1).padStart(3, '0');
        return [
          `"${s.nisn}"`,
          `"${s.nama}"`,
          s.kelas,
          `"${existingB?.noSertifikat || `421.2/BTQ-${nextSeq}/424.072.24/2026`}"`,
          existingB?.tahsin || 88,
          existingB?.tajwid || 86,
          existingB?.tahfidz || 90,
          existingB?.menulis || 85,
          existingB?.membaca || 90,
          `"${existingB?.penguji || 'Ustadz Muhammad Yusuf, S.Pd.I'}"`
        ];
      });
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      downloadCsvFile(csvContent, `Template_Import_BTQ_Kelas_${kelasFilter}_${Date.now()}.csv`);
    }
  };

  const parseCsvOrTsv = (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
    const cleanCell = (c: string) => c.replace(/^["']|["']$/g, '').trim();

    const headers = lines[0].split(delimiter).map(cleanCell);
    const parsedRows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(delimiter).map(cleanCell);
      if (cells.length < 2) continue;
      const rowObj: Record<string, string> = {};
      headers.forEach((h, colIdx) => {
        rowObj[h] = cells[colIdx] || '';
      });
      rowObj['__col0'] = cells[0] || '';
      rowObj['__col1'] = cells[1] || '';
      rowObj['__col2'] = cells[2] || '';
      rowObj['__col3'] = cells[3] || '';
      rowObj['__col4'] = cells[4] || '';
      rowObj['__col5'] = cells[5] || '';
      rowObj['__col6'] = cells[6] || '';
      rowObj['__col7'] = cells[7] || '';
      rowObj['__col8'] = cells[8] || '';
      rowObj['__col9'] = cells[9] || '';
      rowObj['__col10'] = cells[10] || '';
      rowObj['__col11'] = cells[11] || '';
      parsedRows.push(rowObj);
    }
    return parsedRows;
  };

  const handleProcessImportPreview = () => {
    setImportErrorMsg(null);
    setImportSuccessMsg(null);
    if (!importRawText.trim()) {
      setImportErrorMsg('Silakan tempel (paste) data atau upload file CSV/TSV terlebih dahulu.');
      return;
    }

    try {
      const parsed = parseCsvOrTsv(importRawText);
      if (parsed.length === 0) {
        setImportErrorMsg('Format data tidak terbaca. Pastikan ada baris judul kolom (header) dan baris data siswa.');
        return;
      }

      const matched = parsed.map((row) => {
        const nisnVal = (row['NISN'] || row['nisn'] || row['__col0'] || '').trim();
        const namaVal = (row['Nama Siswa'] || row['Nama'] || row['nama'] || row['__col1'] || '').trim();

        const student = siswa.find((s) => 
          (nisnVal && s.nisn === nisnVal) ||
          (namaVal && s.nama.toLowerCase().includes(namaVal.toLowerCase()))
        );

        return {
          student,
          nisn: nisnVal || student?.nisn || '-',
          nama: student?.nama || namaVal || 'Siswa Tidak Ditemukan',
          matched: !!student,
          rawData: row,
        };
      });

      const validCount = matched.filter((m) => m.matched).length;
      if (validCount === 0) {
        setImportErrorMsg('Tidak ditemukan siswa yang cocok dengan NISN / Nama pada data impor.');
      }

      setImportPreviewRows(matched);
    } catch (err: any) {
      setImportErrorMsg(`Gagal memproses data: ${err.message || 'Format tidak valid'}`);
    }
  };

  const handleApplyImport = () => {
    const validMatches = importPreviewRows.filter((m) => m.matched && m.student);
    if (validMatches.length === 0) {
      setImportErrorMsg('Tidak ada baris data valid untuk disimpan.');
      return;
    }

    let savedCount = 0;

    validMatches.forEach((m) => {
      const s = m.student!;
      const row = m.rawData;

      if (importTarget.startsWith('sem')) {
        const semNum = Number(importTarget.replace('sem', ''));
        const existingR = rapor.find((r) => r.siswaId === s.id || r.nisn === s.nisn) || {
          id: `rr-${s.id}`,
          siswaId: s.id,
          nisn: s.nisn,
          namaSiswa: s.nama,
          kelas: s.kelas,
          rombel: s.rombel || 'A',
          semester7: {},
          semester8: {},
          semester9: {},
          semester10: {},
          semester11: {},
          semester12: {},
        };

        const updatedSemData: Record<string, number> = {
          'Pendidikan Agama Islam (PAI)': Number(row['Pendidikan Agama Islam (PAI)'] || row['PAI'] || row['__col4'] || 85),
          'Pendidikan Pancasila (PKn)': Number(row['Pendidikan Pancasila (PKn)'] || row['PKn'] || row['__col5'] || 85),
          'Bahasa Indonesia (B. Ind)': Number(row['Bahasa Indonesia (B. Ind)'] || row['Bahasa Indonesia'] || row['__col6'] || 85),
          'Matematika (Mtk)': Number(row['Matematika (Mtk)'] || row['Matematika'] || row['__col7'] || 85),
          'Seni Budaya (SB)': Number(row['Seni Budaya (SB)'] || row['Seni Budaya'] || row['__col8'] || 85),
          'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)': Number(row['Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)'] || row['PJOK'] || row['__col9'] || 85),
          'Bahasa Inggris (B. Ing)': Number(row['Bahasa Inggris (B. Ing)'] || row['Bahasa Inggris'] || row['__col10'] || 85),
          'Muatan Lokal Bahasa Jawa (B. Jawa)': Number(row['Muatan Lokal Bahasa Jawa (B. Jawa)'] || row['Bahasa Jawa'] || row['__col11'] || 85),
        };

        const updatedRapor: RekapRaporSiswa = {
          ...existingR,
          [`semester${semNum}`]: updatedSemData,
        };

        onSaveRapor(updatedRapor);
        savedCount++;
      } else if (importTarget === 'tka') {
        const existingR = rapor.find((r) => r.siswaId === s.id || r.nisn === s.nisn) || {
          id: `rr-${s.id}`,
          siswaId: s.id,
          nisn: s.nisn,
          namaSiswa: s.nama,
          kelas: s.kelas,
          rombel: s.rombel || 'A',
          semester7: {},
          semester8: {},
          semester9: {},
          semester10: {},
          semester11: {},
          semester12: {},
        };

        const num = Number(row['Numerasi'] || row['__col4'] || 85);
        const lit = Number(row['Literasi'] || row['__col5'] || 85);
        const ipa = Number(row['IPA Pilihan'] || row['__col6'] || 85);
        const avg = Number(((num + lit + ipa) / 3).toFixed(1));
        const pred = avg >= 90 ? 'Sangat Baik' : avg >= 80 ? 'Baik' : avg >= 70 ? 'Cukup' : 'Perlu Bimbingan';

        const updatedRapor: RekapRaporSiswa = {
          ...existingR,
          tka: {
            numerasi: num,
            literasi: lit,
            ipaPilihan: ipa,
            rataRata: avg,
            predikat: pred as any,
            nomorPeserta: row['Nomor Peserta'] || row['__col7'] || `TKA-2026-${s.nisn.slice(-4)}`,
            catatan: row['Catatan'] || row['__col8'] || 'Kompetensi baik',
          },
        };

        onSaveRapor(updatedRapor);
        savedCount++;
      } else if (importTarget === 'btq') {
        const existingB = btq.find((b) => b.siswaId === s.id || b.nisn === s.nisn);
        const nextSeq = String(btq.length + 1).padStart(3, '0');
        const tahsin = Number(row['Tahsin'] || row['__col4'] || 85);
        const tajwid = Number(row['Tajwid'] || row['__col5'] || 85);
        const tahfidz = Number(row['Tahfidz'] || row['__col6'] || 85);
        const menulis = Number(row['Menulis'] || row['__col7'] || 85);
        const membaca = Number(row['Membaca'] || row['__col8'] || 85);
        const avg = Number(((tahsin + tajwid + tahfidz + menulis + membaca) / 5).toFixed(1));
        const btqInfo = getBTQPredicate(avg);

        const payload: NilaiIjazahBTQ = {
          id: existingB ? existingB.id : `btq-${s.id}`,
          siswaId: s.id,
          nisn: s.nisn,
          namaSiswa: s.nama,
          kelas: s.kelas,
          noSertifikat: row['No Sertifikat'] || row['__col3'] || existingB?.noSertifikat || `421.2/BTQ-${nextSeq}/424.072.24/2026`,
          tahsin,
          tajwid,
          tahfidz,
          menulis,
          membaca,
          rataRata: avg,
          predikat: btqInfo.predikat,
          statusKelulusan: btqInfo.lulus ? 'Lulus' : 'Remedial',
          catatan: 'Telah mengikuti pembinaan BTQ.',
          tanggalTerbit: new Date().toISOString().split('T')[0],
          penguji: row['Penguji'] || row['__col9'] || existingB?.penguji || 'Ustadz Muhammad Yusuf, S.Pd.I',
        };

        onSaveBTQ(payload);
        savedCount++;
      }
    });

    logUserActivity({
      role: userRole,
      userName: currentUser?.name || 'Administrator',
      userNip: currentUser?.nip,
      action: 'UBAH',
      category: 'RAPOR',
      description: `Impor nilai massal berhasil diterapkan untuk ${savedCount} siswa pada target ${importTarget.toUpperCase()}.`,
    });

    setImportSuccessMsg(`Berhasil mengimpor dan memperbarui nilai untuk ${savedCount} siswa!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportRawText(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Control Center */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-emerald-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pusat Penilaian Siswa Terpadu</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <GraduationCap className="w-7 h-7 text-emerald-400" />
              <span>Input & Rekap Penilaian: Rapor, TKA & Sertifikat BTQ</span>
            </h2>
            <p className="text-xs text-emerald-200/80 mt-1 max-w-3xl leading-relaxed">
              Seluruh input nilai evaluasi siswa terintegrasi dalam 1 pintu: Buku Rapor 8 Mapel Wajib (Semester 7-12), Tes Kemampuan Akademik (TKA Standar Kelulusan), dan Ijazah Sertifikat BTQ 5 Aspek.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-xs transition-colors border border-amber-400/30 cursor-pointer shadow-xs"
              title="Unduh Template Excel/CSV per Semester"
            >
              <FileDown className="w-4 h-4 text-amber-300" />
              <span>Unduh Template Impor</span>
            </button>
            <button
              onClick={() => {
                setImportModalOpen(true);
                setImportSuccessMsg(null);
                setImportErrorMsg(null);
                setImportPreviewRows([]);
                setImportRawText('');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              title="Impor Nilai dari File CSV atau Tempel Data Excel"
            >
              <FileUp className="w-4 h-4 text-white" />
              <span>Impor Nilai (CSV / Excel)</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/15 cursor-pointer shadow-xs"
              title="Ekspor seluruh data penilaian ke CSV"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Ekspor Terpadu (CSV)</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-black/20 rounded-xl border border-white/10 overflow-x-auto">
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>🏆 Semua Penilaian (Matriks Terpadu)</span>
            </button>
            <button
              onClick={() => setViewMode('rapor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'rapor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📘 Buku Rapor (8 Mapel)</span>
            </button>
            <button
              onClick={() => setViewMode('tka')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'tka'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-200" />
              <span>⭐ Tes Kemampuan Akademik (TKA)</span>
            </button>
            <button
              onClick={() => setViewMode('btq')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'btq'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>📜 Ijazah / Sertifikat BTQ</span>
            </button>
          </div>

          {/* Rapor calculation toggle */}
          <div className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-emerald-200 text-[11px] font-medium">Acuan Rapor:</span>
            <button
              onClick={() => setCalculationMode('5_semester')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                calculationMode === '5_semester'
                  ? 'bg-emerald-400 text-slate-900'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              5 Semester (PPDB)
            </button>
            <button
              onClick={() => setCalculationMode('4_semester')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                calculationMode === '4_semester'
                  ? 'bg-emerald-400 text-slate-900'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              4 Semester (Kelulusan)
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Tingkat Kelas:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {['ALL', '1', '2', '3', '4', '5', '6'].map((k) => (
              <button
                key={k}
                onClick={() => setKelasFilter(k)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  kelasFilter === k
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {k === 'ALL' ? 'Semua' : `Kelas ${k}`}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari siswa (Nama, NISN, NIS)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Unified Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-3">Identitas Siswa</th>
                <th className="py-3 px-2 text-center">Kelas</th>

                {/* Mode 'all' or 'rapor': Show Rapor Columns */}
                {(viewMode === 'all' || viewMode === 'rapor') && (
                  <>
                    <th className="py-3 px-3 text-center bg-blue-50/60 text-blue-950">
                      Rerata Rapor ({calculationMode === '5_semester' ? '5 Sem' : '4 Sem'})
                    </th>
                    <th className="py-3 px-2 text-center bg-blue-50/60 text-blue-950">
                      Rank
                    </th>
                  </>
                )}

                {/* Mode 'all' or 'tka': Show TKA Columns */}
                {(viewMode === 'all' || viewMode === 'tka') && (
                  <>
                    <th className="py-3 px-3 text-center bg-amber-50/70 text-amber-950">
                      TKA (Num / Lit / IPA)
                    </th>
                    <th className="py-3 px-3 text-center bg-amber-50/70 text-amber-950">
                      Rata & Predikat TKA
                    </th>
                  </>
                )}

                {/* Mode 'all' or 'btq': Show BTQ Columns */}
                {(viewMode === 'all' || viewMode === 'btq') && (
                  <>
                    <th className="py-3 px-3 text-center bg-purple-50/70 text-purple-950">
                      Sertifikat BTQ (5 Aspek)
                    </th>
                    <th className="py-3 px-3 text-center bg-purple-50/70 text-purple-950">
                      Status & Predikat BTQ
                    </th>
                  </>
                )}

                <th className="py-3 px-3 text-center w-36">Aksi Terpadu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {unifiedStudentList.map(({ siswa: s, raporProcessed: rp, btq: b }, idx) => {
                const tka = rp?.original?.tka;
                const canEdit =
                  userRole === 'admin' ||
                  (userRole === 'guru' && (!currentUser?.kelas || currentUser.kelas === s.kelas));

                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 text-center font-mono text-slate-400 font-bold">
                      {idx + 1}
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 hover:text-emerald-800">
                        {s.nama}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>NISN: {s.nisn}</span>
                        <span>•</span>
                        <span>NIS: {s.nis}</span>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[11px]">
                        {s.kelas}{s.rombel || 'A'}
                      </span>
                    </td>

                    {/* Rapor Columns */}
                    {(viewMode === 'all' || viewMode === 'rapor') && (
                      <>
                        <td className="py-3 px-3 text-center bg-blue-50/20">
                          {rp && rp.overallAverage > 0 ? (
                            <span className="font-mono font-extrabold text-blue-900 text-xs px-2 py-0.5 rounded bg-blue-100/60">
                              {rp.overallAverage}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Belum Ada</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center bg-blue-50/20">
                          {rp && rp.rank ? (
                            <span className="text-[11px] font-bold text-blue-700 font-mono">
                              #{rp.rank}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </>
                    )}

                    {/* TKA Columns */}
                    {(viewMode === 'all' || viewMode === 'tka') && (
                      <>
                        <td className="py-3 px-3 text-center bg-amber-50/20">
                          {tka ? (
                            <div className="text-[11px] font-mono font-bold text-amber-900">
                              {tka.numerasi} / {tka.literasi} / {tka.ipaPilihan}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Belum Input TKA</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center bg-amber-50/20">
                          {tka ? (
                            <div>
                              <span className="font-bold text-amber-900 font-mono">{tka.rataRata}</span>
                              <span className="text-[10px] ml-1.5 px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">
                                {tka.predikat || 'Baik'}
                              </span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      </>
                    )}

                    {/* BTQ Columns */}
                    {(viewMode === 'all' || viewMode === 'btq') && (
                      <>
                        <td className="py-3 px-3 text-center bg-purple-50/20">
                          {b ? (
                            <div className="text-[11px] font-mono text-purple-950 font-bold" title="Tahsin / Tajwid / Tahfidz / Menulis / Membaca">
                              {b.tahsin} / {b.tajwid} / {b.tahfidz} / {b.menulis} / {b.membaca}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Belum Terbit</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center bg-purple-50/20">
                          {b ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="font-mono font-bold text-purple-900">{b.rataRata}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                  b.statusKelulusan === 'Lulus'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {b.predikat}
                              </span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      </>
                    )}

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canEdit && (
                          <button
                            onClick={() => handleOpenUnifiedModal(s)}
                            title={`Input / Edit Nilai Terpadu (Rapor + TKA + BTQ): ${s.nama}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-emerald-200" />
                            <span>Edit Nilai</span>
                          </button>
                        )}

                        {rp && (
                          <button
                            onClick={() => onOpenTranscriptModal(rp)}
                            title="Cetak Transkrip Rapor"
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {rp && onOpenSKPModal && (
                          <button
                            onClick={() => onOpenSKPModal(rp)}
                            title="Cetak Surat Keterangan Prestasi (SKP)"
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {b && (
                          <button
                            onClick={() => onOpenCertificateModal(b)}
                            title="Lihat & Cetak Ijazah Sertifikat BTQ"
                            className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {unifiedStudentList.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ditemukan data siswa yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* UNIFIED INPUT / EDIT MODAL (RAPOR + TKA + SERTIFIKAT BTQ)                */}
      {/* ========================================================================= */}
      {modalOpen && selectedSiswa && formRapor && formBtq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 border border-slate-200 my-4 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Input & Edit Penilaian Terpadu: {selectedSiswa.nama}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    NISN: {selectedSiswa.nisn} | NIS: {selectedSiswa.nis} | Kelas {selectedSiswa.kelas}{selectedSiswa.rombel || 'A'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subtabs (Rapor vs TKA vs BTQ) */}
            <div className="mt-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveModalTab('rapor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeModalTab === 'rapor'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>1. Nilai Buku Rapor (8 Mapel - Sem 7 s.d. 12)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('tka')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeModalTab === 'tka'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>2. Tes Kemampuan Akademik (TKA)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('btq')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeModalTab === 'btq'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>3. Ijazah / Sertifikat BTQ (5 Aspek)</span>
              </button>
            </div>

            <form onSubmit={handleSaveAllAssessments} className="mt-5 space-y-5 text-xs">
              {/* TAB 1: BUKU RAPOR SEMESTER 7 - 12 */}
              {activeModalTab === 'rapor' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>Nilai Rapor 8 Mata Pelajaran Wajib (Semester 7 s.d. 12)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Kelas 4 (Sem 7-8), Kelas 5 (Sem 9-10), Kelas 6 (Sem 11-12)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {[
                      { semKey: 'semester7' as const, label: 'Semester 7 (Kelas 4 Sem 1)' },
                      { semKey: 'semester8' as const, label: 'Semester 8 (Kelas 4 Sem 2)' },
                      { semKey: 'semester9' as const, label: 'Semester 9 (Kelas 5 Sem 1)' },
                      { semKey: 'semester10' as const, label: 'Semester 10 (Kelas 5 Sem 2)' },
                      { semKey: 'semester11' as const, label: 'Semester 11 (Kelas 6 Sem 1)' },
                      { semKey: 'semester12' as const, label: 'Semester 12 (Kelas 6 Sem 2)' },
                    ].map(({ semKey, label }) => (
                      <div key={semKey} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <h5 className="font-bold text-slate-900 pb-1 border-b border-slate-200 text-[11px] text-blue-900">
                          {label}
                        </h5>
                        <div className="space-y-1.5">
                          {MANDATORY_MAPEL.map((m) => {
                            const currentVal = formRapor[semKey]?.[m] ?? getMapelScore(formRapor[semKey], m) ?? '';
                            return (
                              <div key={m} className="flex items-center justify-between gap-1.5">
                                <label className="text-[11px] text-slate-700 truncate max-w-[170px]" title={m}>
                                  {m}
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={currentVal}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                                    setFormRapor({
                                      ...formRapor,
                                      [semKey]: {
                                        ...formRapor[semKey],
                                        [m]: val,
                                      },
                                    });
                                  }}
                                  className="w-14 px-1.5 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                  placeholder="0"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: TES KEMAMPUAN AKADEMIK (TKA) */}
              {activeModalTab === 'tka' && (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-600" />
                        <span>Input Penilaian Tes Kemampuan Akademik (TKA)</span>
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        2 Mata Pelajaran Wajib (Numerasi & Literasi) + 1 Mapel Pilihan (IPA)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Wajib 1: Numerasi */}
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-blue-700">Mapel Wajib 1</span>
                      <label className="block text-xs font-bold text-slate-900">
                        Matematika (Numerasi)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formRapor.tka?.numerasi || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormRapor({
                            ...formRapor,
                            tka: {
                              ...(formRapor.tka as NilaiTKA),
                              numerasi: val,
                            },
                          });
                        }}
                        className="w-full px-3 py-2 text-center font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Wajib 2: Literasi */}
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-blue-700">Mapel Wajib 2</span>
                      <label className="block text-xs font-bold text-slate-900">
                        Bahasa Indonesia (Literasi)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formRapor.tka?.literasi || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormRapor({
                            ...formRapor,
                            tka: {
                              ...(formRapor.tka as NilaiTKA),
                              literasi: val,
                            },
                          });
                        }}
                        className="w-full px-3 py-2 text-center font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Pilihan: IPA */}
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-700">Mapel Pilihan</span>
                      <label className="block text-xs font-bold text-slate-900">
                        Ilmu Pengetahuan Alam (IPA)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formRapor.tka?.ipaPilihan || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormRapor({
                            ...formRapor,
                            tka: {
                              ...(formRapor.tka as NilaiTKA),
                              ipaPilihan: val,
                            },
                          });
                        }}
                        className="w-full px-3 py-2 text-center font-mono font-bold text-base text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nomor Peserta Ujian TKA
                      </label>
                      <input
                        type="text"
                        value={formRapor.tka?.nomorPeserta || ''}
                        onChange={(e) => {
                          setFormRapor({
                            ...formRapor,
                            tka: {
                              ...(formRapor.tka as NilaiTKA),
                              nomorPeserta: e.target.value,
                            },
                          });
                        }}
                        placeholder="Contoh: TKA-2026-0012"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Catatan Evaluasi Akademik
                      </label>
                      <input
                        type="text"
                        value={formRapor.tka?.catatan || ''}
                        onChange={(e) => {
                          setFormRapor({
                            ...formRapor,
                            tka: {
                              ...(formRapor.tka as NilaiTKA),
                              catatan: e.target.value,
                            },
                          });
                        }}
                        placeholder="Catatan prestasi & kemampuan siswa..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: IJAZAH / SERTIFIKAT BTQ */}
              {activeModalTab === 'btq' && (
                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-700" />
                        <span>Penilaian Ijazah & Sertifikat BTQ (Baca Tulis Al-Qur'an)</span>
                      </h4>
                      <p className="text-[11px] text-purple-800">
                        5 Aspek Pengujian: Tahsin, Tajwid, Tahfidz, Menulis, dan Membaca
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nomor Registrasi Sertifikat
                      </label>
                      <input
                        type="text"
                        value={formBtq.noSertifikat}
                        onChange={(e) => setFormBtq({ ...formBtq, noSertifikat: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nama Guru Penguji
                      </label>
                      <input
                        type="text"
                        value={formBtq.penguji}
                        onChange={(e) => setFormBtq({ ...formBtq, penguji: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Tanggal Penerbitan
                      </label>
                      <input
                        type="text"
                        value={formBtq.tanggalTerbit}
                        onChange={(e) => setFormBtq({ ...formBtq, tanggalTerbit: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>

                  {/* 5 Aspek Nilai BTQ */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                    {[
                      { key: 'tahsin' as const, label: '1. Tahsin (Fashahah)' },
                      { key: 'tajwid' as const, label: '2. Tajwid (Kaidah)' },
                      { key: 'tahfidz' as const, label: '3. Tahfidz (Juz 30)' },
                      { key: 'menulis' as const, label: '4. Menulis (Khat)' },
                      { key: 'membaca' as const, label: '5. Membaca (Tartil)' },
                    ].map(({ key, label }) => (
                      <div key={key} className="bg-white p-3 rounded-xl border border-purple-200 text-center space-y-1">
                        <label className="block text-[10px] font-bold text-slate-700 truncate" title={label}>
                          {label}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={formBtq[key]}
                          onChange={(e) => setFormBtq({ ...formBtq, [key]: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 text-center font-mono font-bold text-base text-purple-950 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Catatan Evaluasi / Rekomendasi BTQ
                    </label>
                    <input
                      type="text"
                      value={formBtq.catatan}
                      onChange={(e) => setFormBtq({ ...formBtq, catatan: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-extrabold text-xs shadow-md hover:from-emerald-800 hover:to-teal-900 transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-200" />
                    <span>Simpan Semua Penilaian (Rapor, TKA & BTQ)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: UNDUH TEMPLATE IMPOR NILAI PER SEMESTER */}
      {/* ========================================================================= */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-amber-200" />
                  <span>Unduh Template Impor Nilai Kurikulum Merdeka</span>
                </h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  Template CSV/Excel telah terisi NISN & Nama siswa aktif (Filter Kelas: {kelasFilter === 'ALL' ? 'Semua Kelas' : `Kelas ${kelasFilter}`}).
                </p>
              </div>
              <button
                onClick={() => setTemplateModalOpen(false)}
                className="p-1.5 rounded-lg text-amber-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  1. Template Buku Rapor per Semester (8 Mapel Kurikulum Merdeka)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'sem7', label: 'Semester 7 (Kelas 4 Smt 1)', desc: '8 Mapel Wajib Rapor' },
                    { id: 'sem8', label: 'Semester 8 (Kelas 4 Smt 2)', desc: '8 Mapel Wajib Rapor' },
                    { id: 'sem9', label: 'Semester 9 (Kelas 5 Smt 1)', desc: '8 Mapel Wajib Rapor' },
                    { id: 'sem10', label: 'Semester 10 (Kelas 5 Smt 2)', desc: '8 Mapel Wajib Rapor' },
                    { id: 'sem11', label: 'Semester 11 (Kelas 6 Smt 1)', desc: '8 Mapel Wajib Rapor' },
                    { id: 'sem12', label: 'Semester 12 (Kelas 6 Smt 2)', desc: '8 Mapel Wajib Rapor' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleDownloadTemplate(item.id)}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  2. Template Penilaian Kelulusan & Keagamaan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleDownloadTemplate('tka')}
                    className="p-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-amber-900 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>Template Tes Kemampuan Akademik (TKA)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Numerasi (Mtk), Literasi (B.Indo), IPA Pilihan
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-700 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleDownloadTemplate('btq')}
                    className="p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-purple-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                        <span>Template Ijazah / Sertifikat BTQ</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        5 Aspek: Tahsin, Tajwid, Tahfidz, Tulis, Baca
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-purple-700 shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setTemplateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: IMPOR DATA NILAI SISWA (EXCEL / CSV / SPREADSHEET) */}
      {/* ========================================================================= */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-emerald-300" />
                  <span>Impor Nilai Siswa Terpadu</span>
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Dukung input massal nilai buku rapor per semester, TKA, dan sertifikat BTQ dari file CSV atau tempel tabel spreadsheet.
                </p>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto grow">
              {/* Target Penilaian Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. Pilih Target Penilaian yang Diimpor:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'sem7' as const, label: 'Semester 7 (Kls 4-1)' },
                    { id: 'sem8' as const, label: 'Semester 8 (Kls 4-2)' },
                    { id: 'sem9' as const, label: 'Semester 9 (Kls 5-1)' },
                    { id: 'sem10' as const, label: 'Semester 10 (Kls 5-2)' },
                    { id: 'sem11' as const, label: 'Semester 11 (Kls 6-1)' },
                    { id: 'sem12' as const, label: 'Semester 12 (Kls 6-2)' },
                    { id: 'tka' as const, label: 'Tes TKA Kelulusan' },
                    { id: 'btq' as const, label: 'Sertifikat BTQ 5 Aspek' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setImportTarget(item.id);
                        setImportPreviewRows([]);
                        setImportErrorMsg(null);
                        setImportSuccessMsg(null);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        importTarget === item.id
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Mode Switcher */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800">
                    2. Sumber Data:
                  </label>
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setImportMode('paste')}
                      className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                        importMode === 'paste' ? 'bg-white shadow-xs text-emerald-900' : 'text-slate-600'
                      }`}
                    >
                      Tempel Teks (Copy-Paste)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportMode('file')}
                      className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                        importMode === 'file' ? 'bg-white shadow-xs text-emerald-900' : 'text-slate-600'
                      }`}
                    >
                      Upload File CSV
                    </button>
                  </div>
                </div>

                {importMode === 'paste' ? (
                  <div>
                    <textarea
                      rows={6}
                      value={importRawText}
                      onChange={(e) => setImportRawText(e.target.value)}
                      placeholder="Salin baris dari Google Spreadsheet / Excel (termasuk baris judul) lalu tempelkan di sini..."
                      className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Tip: Anda dapat membuka template yang diunduh di Google Sheets, mengisi nilai murid, lalu blok seluruh tabel (Ctrl+A), salin (Ctrl+C), dan tempel di kotak ini.
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Pilih berkas CSV dari komputer</p>
                    <p className="text-[11px] text-slate-500 mt-1">Format didukung: .csv (UTF-8, pemisah koma atau titik koma)</p>
                    <input
                      type="file"
                      accept=".csv,text/csv,text/plain"
                      onChange={handleFileUpload}
                      className="mt-3 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Process Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleProcessImportPreview}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Table className="w-4 h-4 text-amber-300" />
                  <span>Proses & Pratinjau Kecocokan Siswa</span>
                </button>
              </div>

              {/* Feedback messages */}
              {importErrorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{importErrorMsg}</span>
                </div>
              )}

              {importSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {/* Preview Table */}
              {importPreviewRows.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase">
                      Pratinjau Hasil Impor ({importPreviewRows.filter(r => r.matched).length} Siswa Teridentifikasi Cocok)
                    </h4>
                    <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-full">
                      Total {importPreviewRows.length} Baris Terbaca
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">No</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">NISN</th>
                          <th className="py-2 px-3">Nama Siswa</th>
                          <th className="py-2 px-3">Target Impor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {importPreviewRows.map((row, idx) => (
                          <tr key={idx} className={row.matched ? 'bg-white hover:bg-emerald-50/40' : 'bg-red-50/40'}>
                            <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3">
                              {row.matched ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" /> Cocok
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                                  <AlertCircle className="w-3 h-3" /> Tidak Ditemukan
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono font-semibold">{row.nisn}</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{row.nama}</td>
                            <td className="py-2 px-3 font-mono text-slate-600 uppercase text-[10px]">{importTarget}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                disabled={importPreviewRows.filter(r => r.matched).length === 0}
                onClick={handleApplyImport}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-emerald-200" />
                <span>Terapkan & Simpan Nilai ke Sistem ({importPreviewRows.filter(r => r.matched).length} Siswa)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
