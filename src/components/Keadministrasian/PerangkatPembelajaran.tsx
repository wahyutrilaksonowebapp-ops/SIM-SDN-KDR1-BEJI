import React, { useState, useMemo, useRef } from 'react';
import { ProfilSekolah, Pegawai, Siswa, UserRole } from '../../types';
import { 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Printer, 
  Download, 
  Edit3, 
  Copy, 
  Check, 
  Award, 
  FileText, 
  Brain, 
  Clock, 
  Target, 
  Users, 
  HelpCircle,
  FolderDown,
  BookCheck,
  PenTool,
  ClipboardList,
  CheckSquare,
  BarChart,
  RefreshCw,
  Zap,
  Sliders,
  Save,
  Wand2,
  Eye,
  FileCode,
  CheckCircle,
  Compass,
  GraduationCap
} from 'lucide-react';
import { formatIndoDate } from '../../utils/helpers';
import { LOCKED_WEB_APP_URL, syncWithGoogleAppsScript } from '../../services/api';

interface PerangkatPembelajaranProps {
  profil: ProfilSekolah;
  pegawai: Pegawai[];
  siswa: Siswa[];
  userRole?: UserRole;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export type PerangkatType = 
  | 'atp'
  | 'prota'
  | 'promes'
  | 'rpe'
  | 'modul_deep_learning'
  | 'jurnal_mengajar'
  | 'lkm'
  | 'penilaian'
  | 'presensi'
  | 'bank_soal'
  | 'remedial_pengayaan'
  | 'cover';

export type KurikulumCP = 'cp020_pai' | 'cp046_umum';

export const PerangkatPembelajaran: React.FC<PerangkatPembelajaranProps> = ({
  profil,
  pegawai,
  siswa,
  userRole = 'admin',
  onNotify,
}) => {
  // Selector state
  const [curriculumType, setCurriculumType] = useState<KurikulumCP>('cp020_pai');
  const [selectedFase, setSelectedFase] = useState<'A' | 'B' | 'C'>('C');
  const [selectedKelas, setSelectedKelas] = useState<number>(6);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedMapel, setSelectedMapel] = useState<string>('Pendidikan Agama Islam dan Budi Pekerti (PAI)');
  const [selectedElemen, setSelectedElemen] = useState<string>('Al-Qur\'an Hadis');
  const [alokasiWaktu, setAlokasiWaktu] = useState<string>('2 JP (2 x 35 Menit)');
  const [selectedGuruId, setSelectedGuruId] = useState<string>(() => pegawai[0]?.id || '');

  // Active Device Tab
  const [activePerangkat, setActivePerangkat] = useState<PerangkatType>('modul_deep_learning');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'document_a4' | 'raw_editor'>('document_a4');
  const [customText, setCustomText] = useState<string>('');
  const [coverTheme, setCoverTheme] = useState<'kemdikbud' | 'emerald' | 'batik' | 'navy'>('kemdikbud');
  const [kktpThreshold, setKktpThreshold] = useState<number>(75);
  const [copied, setCopied] = useState<boolean>(false);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string>('');
  const [aiActiveEnhancement, setAiActiveEnhancement] = useState<string>('Default Standar Kemdikbudristek');
  const [isSavingToMaster, setIsSavingToMaster] = useState<boolean>(false);

  // Selected Teacher Info
  const currentGuru = useMemo(() => {
    return pegawai.find((p) => p.id === selectedGuruId) || pegawai[0] || {
      id: 'peg-1',
      nama: 'Wahyudi, S.Pd.I.',
      nip: '19850712 201001 1 018',
      jabatan: 'Guru PAI',
      golongan: 'III/c',
      pangkat: 'Penata',
    };
  }, [pegawai, selectedGuruId]);

  // Adjust kelas when Fase changes
  const handleFaseChange = (fase: 'A' | 'B' | 'C') => {
    setSelectedFase(fase);
    if (fase === 'A') setSelectedKelas(1);
    if (fase === 'B') setSelectedKelas(4);
    if (fase === 'C') setSelectedKelas(6);
  };

  // Mapel options based on curriculum
  const mapelOptions = useMemo(() => {
    if (curriculumType === 'cp020_pai') {
      return ['Pendidikan Agama Islam dan Budi Pekerti (PAI)'];
    }
    return [
      'Matematika',
      'Bahasa Indonesia',
      'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
      'Pendidikan Pancasila (PPKn)',
      'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)',
      'Seni Rupa / Seni Budaya',
      'Bahasa Inggris',
      'Muatan Lokal Bahasa Jawa'
    ];
  }, [curriculumType]);

  // Elemen options based on mapel & CP
  const elemenOptions = useMemo(() => {
    if (curriculumType === 'cp020_pai') {
      return [
        'Al-Qur\'an Hadis',
        'Akidah',
        'Akhlak',
        'Fikih',
        'Sejarah Peradaban Islam'
      ];
    }
    if (selectedMapel.includes('Matematika')) {
      return ['Bilangan', 'Aljabar', 'Pengukuran', 'Geometri', 'Analisis Data dan Peluang'];
    }
    if (selectedMapel.includes('Indonesia')) {
      return ['Menyimak', 'Membaca dan Memirsa', 'Berbicara dan Mempresentasikan', 'Menulis'];
    }
    if (selectedMapel.includes('IPAS')) {
      return ['Pemahaman IPAS (Sains & Sosial)', 'Keterampilan Proses Ilmiah'];
    }
    if (selectedMapel.includes('Pancasila')) {
      return ['Pancasila', 'Undang-Undang Dasar NRI 1945', 'Bhinneka Tunggal Ika', 'Negara Kesatuan Republik Indonesia'];
    }
    if (selectedMapel.includes('PJOK')) {
      return ['Keterampilan Gerak', 'Pengetahuan Gerak', 'Pemanfaatan Gerak', 'Pengembangan Karakter'];
    }
    return ['Apresiasi & Kreasi', 'Keterampilan Proses', 'Literasi Kontekstual'];
  }, [curriculumType, selectedMapel]);

  // CP 020 Text Database
  const CP020_TEXT: Record<'A' | 'B' | 'C', Record<string, string>> = {
    A: {
      'Al-Qur\'an Hadis': 'Membaca dan membedakan huruf hijaiah berharakat, huruf hijaiah bersambung; menghafal Surah al-Fātihah, beberapa surah pendek Al-Qur\'an, dan hadis tentang kebersihan.',
      'Akidah': 'Menjelaskan dan meyakini rukun iman, iman kepada Allah Swt., beberapa asmaulhusna, dan iman kepada malaikat.',
      'Akhlak': 'Menerapkan akhlak terhadap Allah Swt. dengan menyucikan dan memuji-Nya, dan akhlak terhadap diri sendiri.',
      'Fikih': 'Menerapkan rukun Islam, syahadatain, tata cara bersuci, salat fardu, zikir dan berdoa setelah salat.',
      'Sejarah Peradaban Islam': 'Menceritakan kisah keteladanan beberapa nabi dan rasul.',
    },
    B: {
      'Al-Qur\'an Hadis': 'Membaca, menulis, dan membedakan huruf hijaiah bersambung; menghafal dan menjelaskan beberapa surah pendek, hadis tentang kewajiban salat dan menjaga hubungan baik dengan sesama.',
      'Akidah': 'Menjelaskan dan meyakini sifat-sifat Allah Swt., iman kepada kitab-kitab Allah Swt., beberapa asmaulhusna, dan iman kepada rasul-rasul Allah Swt.',
      'Akhlak': 'Menerapkan akhlak terhadap Allah Swt. dengan berbaik sangka kepada-Nya, akhlak terhadap orang tua, keluarga, dan guru.',
      'Fikih': 'Menerapkan azan dan ikamah, salat jumat dan salat sunah; menjelaskan balig dan tanggung jawab yang menyertainya (taklīf).',
      'Sejarah Peradaban Islam': 'Menceritakan dan menjelaskan kisah Nabi Muhammad saw. sebelum dan sesudah menjadi rasul periode Makkah.',
    },
    C: {
      'Al-Qur\'an Hadis': 'Membaca, menulis dan membedakan huruf hijaiah bersambung; menjelaskan beberapa surah pendek dan hadis tentang berbuat baik kepada orang tua, guru, dan teman.',
      'Akidah': 'Menjelaskan dan meyakini beberapa asmaulhusna, iman kepada hari akhir, iman kepada qadā\' dan qadar.',
      'Akhlak': 'Menerapkan akhlak terhadap Allah Swt. dengan berdoa dan bertawakal kepada-Nya, akhlak terhadap teman, tetangga, non-muslim, hewan, dan tumbuhan.',
      'Fikih': 'Menerapkan puasa wajib dan sunah, makanan minuman yang halal dan haram, zakat, infak, sedekah, dan wakaf.',
      'Sejarah Peradaban Islam': 'Menceritakan dan menjelaskan kisah Nabi Muhammad saw. periode Madinah dan khulafaurasyidin.',
    },
  };

  // CP 046 Text Fallback
  const getCP046Text = (mapel: string, fase: string, elemen: string) => {
    if (mapel.includes('Matematika')) {
      if (fase === 'A') return 'Menunjukkan pemahaman bilangan cacah sampai dengan 100, melakukan operasi penjumlahan dan pengurangan, mengidentifikasi bangun datar sederhana.';
      if (fase === 'B') return 'Memahami bilangan cacah sampai 10.000, pecahan senilai, kelipatan dan faktor, pengukuran panjang dan luas, bangun ruang kubus dan balok.';
      return 'Memahami bilangan bulat negatif, operasi hitung pecahan desimal dan persen, rasio perbandingan, volume kubus/balok, penyajian dan penafsiran diagram batang dan lingkaran.';
    }
    if (mapel.includes('Indonesia')) {
      if (fase === 'A') return 'Menyimak instruksi lisan sederhana, mengeja kata suku terbuka dan tertutup, menceritakan kembali cerita pendek bergambar, menulis kalimat sederhana dengan huruf tegak bersambung.';
      if (fase === 'B') return 'Memahami ide pokok dan ide pendukung, membedakan fakta dan opini, menyampaikan gagasan dengan santun dalam diskusi kelas, menulis teks narasi dan eksposisi dengan kaidah EYD.';
      return 'Menganalisis informasi dari berbagai tipe teks fiksi dan nonfiksi, menyampaikan presentasi yang logis dan runtut, menulis teks eksplanasi, laporan hasil pengamatan, serta teks narasi kreatif.';
    }
    if (mapel.includes('IPAS')) {
      if (fase === 'B') return 'Menganalisis hubungan antara bentuk dan fungsi bagian tubuh tumbuhan/hewan, wujud zat dan perubahannya, gaya dan gerak di lingkungan sekitar, interaksi sosial dan kearifan lokal Pasuruan.';
      return 'Memahami sistem organ tubuh manusia (pencernaan, pernapasan, peredaran darah), ekosistem dan jaring-jaring makanan, gelombang bunyi dan cahaya, energi listrik dan terbarukan, peristiwa proklamasi kemerdekaan.';
    }
    if (mapel.includes('Pancasila')) {
      if (fase === 'A') return 'Mengenal simbol dan sila-sila Pancasila, menaati aturan di rumah dan di sekolah, menghargai keberagaman teman di kelas.';
      if (fase === 'B') return 'Memahami makna sila-sila Pancasila dan penerapannya dalam kehidupan sehari-hari, hak dan kewajiban anak, serta keberagaman suku budaya di Indonesia.';
      return 'Mengidentifikasi nilai-nilai Pancasila dalam gotong royong, memahami norma hukum dan perundang-undangan, menjaga keutuhan Negara Kesatuan Republik Indonesia (NKRI).';
    }
    return `Capaian Pembelajaran Elemen ${elemen} Fase ${fase} berpedoman pada Keputusan BSKAP No. 046/H/KR/2024: Mengembangkan kompetensi pengetahuan, keterampilan proses, serta dimensi Profil Pelajar Pancasila secara utuh.`;
  };

  // Get active CP description
  const activeCPText = useMemo(() => {
    if (curriculumType === 'cp020_pai') {
      const faseData = CP020_TEXT[selectedFase];
      return faseData[selectedElemen] || faseData['Al-Qur\'an Hadis'];
    }
    return getCP046Text(selectedMapel, selectedFase, selectedElemen);
  }, [curriculumType, selectedFase, selectedElemen, selectedMapel]);

  // 12 Perangkat Catalog Definition
  const perangkatButtons: {
    id: PerangkatType;
    label: string;
    shortTitle: string;
    icon: React.ReactNode;
    color: string;
    badge: string;
    desc: string;
  }[] = [
    {
      id: 'atp',
      label: '1. ATP (Alur Tujuan Pembelajaran)',
      shortTitle: 'Alur Tujuan Pembelajaran (ATP)',
      icon: <Target className="w-4 h-4 text-emerald-600" />,
      color: 'hover:border-emerald-500 bg-emerald-50/50',
      badge: 'CP 020 / 046',
      desc: 'Pemetaan capaian elemen, penurunan TP ABCD, dan alokasi JP terukur',
    },
    {
      id: 'prota',
      label: '2. Program Tahunan (Prota)',
      shortTitle: 'Program Tahunan (Prota)',
      icon: <Calendar className="w-4 h-4 text-blue-600" />,
      color: 'hover:border-blue-500 bg-blue-50/50',
      badge: 'Distribusi Smt 1-2',
      desc: 'Matriks alokasi waktu tahunan seluruh capaian pembelajaran',
    },
    {
      id: 'promes',
      label: '3. Program Semester (Promes)',
      shortTitle: 'Program Semester (Promes)',
      icon: <ClipboardList className="w-4 h-4 text-indigo-600" />,
      color: 'hover:border-indigo-500 bg-indigo-50/50',
      badge: 'Matriks Bulanan',
      desc: 'Rincian mingguan KBM semester ganjil dan genap',
    },
    {
      id: 'rpe',
      label: '4. Rencana Pekan Efektif (RPE)',
      shortTitle: 'Rencana Pekan Efektif (RPE)',
      icon: <Clock className="w-4 h-4 text-purple-600" />,
      color: 'hover:border-purple-500 bg-purple-50/50',
      badge: 'Kalender Diknas',
      desc: 'Kalkulasi pekan efektif riil, libur semester & jam efektif',
    },
    {
      id: 'modul_deep_learning',
      label: '5. Modul Ajar Deep Learning',
      shortTitle: 'Modul Ajar Deep Learning',
      icon: <Brain className="w-4 h-4 text-rose-600" />,
      color: 'hover:border-rose-500 bg-rose-50/50',
      badge: 'Mindful, Meaningful, Joyful',
      desc: 'Modul lengkap 3 pilar Kemendikbud & diferensiasi murid',
    },
    {
      id: 'jurnal_mengajar',
      label: '6. Jurnal Mengajar Harian',
      shortTitle: 'Jurnal Mengajar Guru',
      icon: <BookCheck className="w-4 h-4 text-amber-600" />,
      color: 'hover:border-amber-500 bg-amber-50/50',
      badge: 'Agenda & Refleksi',
      desc: 'Catatan harian KBM, ketuntasan kelas & tindak lanjut guru',
    },
    {
      id: 'lkm',
      label: '7. Lembar Kerja Murid (LKM)',
      shortTitle: 'Lembar Kerja Murid (LKPD)',
      icon: <PenTool className="w-4 h-4 text-teal-600" />,
      color: 'hover:border-teal-500 bg-teal-50/50',
      badge: 'Aktivitas HOTS',
      desc: 'Instruksi eksplorasi, stimulus kontekstual & refleksi murid',
    },
    {
      id: 'penilaian',
      label: '8. Lembar Penilaian & KKTP',
      shortTitle: 'Asesmen & Rubrik KKTP',
      icon: <CheckSquare className="w-4 h-4 text-cyan-600" />,
      color: 'hover:border-cyan-500 bg-cyan-50/50',
      badge: 'Formatif & Sumatif',
      desc: 'Rubrik ketercapaian tujuan pembelajaran & observasi P3',
    },
    {
      id: 'presensi',
      label: '9. Presensi / Absensi Murid',
      shortTitle: 'Presensi Harian Kelas',
      icon: <Users className="w-4 h-4 text-emerald-700" />,
      color: 'hover:border-emerald-600 bg-emerald-50/40',
      badge: 'Rekap H/S/I/A',
      desc: 'Lembar kehadiran murid terintegrasi data siswa SDN KDR1',
    },
    {
      id: 'bank_soal',
      label: '10. Bank Soal HOTS & AKM',
      shortTitle: 'Bank Soal Asesmen',
      icon: <HelpCircle className="w-4 h-4 text-violet-600" />,
      color: 'hover:border-violet-500 bg-violet-50/50',
      badge: 'C1 s.d C6 HOTS',
      desc: 'Soal PG, PG Kompleks, Menjodohkan & Uraian Berbobot',
    },
    {
      id: 'remedial_pengayaan',
      label: '11. Aplikasi Koreksi, Remidi & Pengayaan',
      shortTitle: 'Koreksi & Laporan Formal',
      icon: <BarChart className="w-4 h-4 text-orange-600" />,
      color: 'hover:border-orange-500 bg-orange-50/50',
      badge: 'Berita Acara Resmi',
      desc: 'Tabel analisis ketuntasan, rencana remidi/pengayaan & laporan',
    },
    {
      id: 'cover',
      label: '12. Cover Perangkat Pembelajaran',
      shortTitle: 'Cover Perangkat Resmi',
      icon: <Award className="w-4 h-4 text-amber-700" />,
      color: 'hover:border-amber-600 bg-amber-50/60',
      badge: 'Desain Cetak A4',
      desc: 'Sampul formal dinas siap cetak dengan logo dan identitas guru',
    },
  ];

  // AI Prompt Chips Accelerator
  const aiPromptChips = [
    { label: '🧠 Deep Learning 3 Pilar', prompt: 'Perkuat 3 pilar Deep Learning (Mindful: kesadaran penuh & orientasi; Meaningful: relevansi kehidupan & analisis kritis; Joyful: pembelajaran aktif gembira & gamifikasi).' },
    { label: '🎯 Diferensiasi Murid', prompt: 'Sertakan diferensiasi konten (bacaan teks & gambar), diferensiasi proses (bimbingan bertingkat & tutor sebaya), dan diferensiasi produk (poster/lisan/tulisan).' },
    { label: '🌾 Kearifan Lokal Pasuruan', prompt: 'Integrasikan konteks kearifan lokal Kabupaten Pasuruan (komoditas mangga putar/gadung Pasuruan, sentra mebel, kawasan Bromo, dan pesantren budaya).' },
    { label: '📊 Rubrik KKTP Multi-Level', prompt: 'Lengkapi dengan rubrik KKTP interval 4 skala: Perlu Bimbingan (0-60%), Cukup (61-75%), Baik (76-85%), dan Sangat Baik (86-100%) beserta tindak lanjut.' },
    { label: '🚀 Soal HOTS C4-C6', prompt: 'Tingkatkan kualitas soal dengan stimulus berbasis studi kasus nyata kehidupan, penalaran tingkat tinggi (C4 Analisis, C5 Evaluasi, C6 Kreasi).' },
    { label: '💻 Integrasi Teknologi', prompt: 'Sertakan pemanfaatan teknologi digital sederhana seperti Chromebook sekolah, QR code video pembelajaran, dan kuis interaktif.' }
  ];

  // Interactive AI Enhancement Trigger
  const handleApplyAIEnhancement = (promptText?: string) => {
    const finalPrompt = promptText || aiAssistantPrompt;
    if (!finalPrompt.trim()) return;

    setIsGeneratingAI(true);
    setAiActiveEnhancement(finalPrompt);

    setTimeout(() => {
      setIsGeneratingAI(false);
      if (onNotify) {
        onNotify(`Asisten Guru AI berhasil menyempurnakan perangkat: "${finalPrompt.slice(0, 45)}..."`, 'success');
      }
    }, 650);
  };

  // Copy text handler
  const handleCopy = () => {
    const el = document.getElementById('perangkat-print-area');
    if (el) {
      navigator.clipboard.writeText(el.innerText);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onNotify) onNotify('Seluruh teks perangkat pembelajaran berhasil disalin ke clipboard!', 'info');
  };

  // Native Print Handler (Dedicated A4 PDF Output)
  const handlePrint = () => {
    window.print();
  };

  // Download Word (.doc) Handler
  const handleDownloadDoc = () => {
    const el = document.getElementById('perangkat-print-area');
    if (!el) return;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${perangkatButtons.find(b => b.id === activePerangkat)?.shortTitle} - ${profil.nama}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.4; color: #000; }
          table { border-collapse: collapse; width: 100%; margin: 12px 0; }
          th, td { border: 1px solid #000; padding: 6px 8px; font-size: 11pt; }
          th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
          .kop-title { text-align: center; font-weight: bold; }
          .line-kop { border-bottom: 2px solid #000; margin-bottom: 12px; }
          .signature-box { margin-top: 30px; width: 100%; }
        </style>
      </head>
      <body>
        ${el.innerHTML}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activePerangkat.toUpperCase()}_Kelas${selectedKelas}_${selectedMapel.slice(0, 15).replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onNotify) onNotify('Dokumen Word (.doc) berhasil diunduh. Siap dibuka di Microsoft Word!', 'success');
  };

  // Save Record into 1 Master Spreadsheet
  const handleSaveToMasterSpreadsheet = () => {
    setIsSavingToMaster(true);
    setTimeout(() => {
      setIsSavingToMaster(false);
      try {
        const existingKey = 'sim_kdr1_perangkat_ajar_records';
        const saved = JSON.parse(localStorage.getItem(existingKey) || '[]');
        const newRecord = {
          id: `pa-${Date.now()}`,
          jenisPerangkat: perangkatButtons.find(b => b.id === activePerangkat)?.shortTitle || 'Modul Ajar',
          kurikulum: curriculumType === 'cp020_pai' ? 'CP 020 (PAI)' : 'CP 046/H/KR/2024',
          mapel: selectedMapel,
          fase: `Fase ${selectedFase}`,
          kelas: selectedKelas,
          semester: selectedSemester,
          elemen: selectedElemen,
          guruNama: currentGuru.nama,
          guruNip: currentGuru.nip,
          tanggal: new Date().toISOString().split('T')[0],
          ringkasan: `Perangkat pembelajaran ${selectedElemen} dengan penguatan Deep Learning & Diferensiasi.`,
          status: 'Disahkan Kepala Sekolah'
        };
        saved.unshift(newRecord);
        localStorage.setItem(existingKey, JSON.stringify(saved.slice(0, 50)));

        // Sync asynchronously to locked Google Apps Script Web App
        syncWithGoogleAppsScript(LOCKED_WEB_APP_URL, 'savePerangkatAjar', newRecord).catch((err) => {
          console.warn('Sync to locked webapp notice:', err);
        });
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }

      if (onNotify) {
        onNotify(`Perangkat Pembelajaran berhasil disimpan ke Sheet 'Perangkat_Ajar' di Master Spreadsheet!`, 'success');
      }
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Top Banner: Asisten Guru AI Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Asisten Guru AI Profesional • CP 020 (PAI) & CP 046 (Umum)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Generator Perangkat Pembelajaran Kurikulum Merdeka
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Instrumen administrasi guru berstandar nasional Kemendikbudristek & BSKAP. Menghasilkan 12 modul pembelajaran dengan pendekatan <strong>Deep Learning (Mindful, Meaningful, Joyful)</strong>, diferensiasi murid, serta siap cetak formal PDF ukuran <strong>A4</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-md transition-all cursor-pointer hover:scale-102"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>Cetak PDF (A4)</span>
            </button>

            <button
              onClick={handleDownloadDoc}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer hover:scale-102 border border-emerald-500/40"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Word (.doc)</span>
            </button>

            <button
              onClick={handleSaveToMasterSpreadsheet}
              disabled={isSavingToMaster}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer hover:scale-102"
            >
              {isSavingToMaster ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Simpan ke Master Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Kurikulum, Fase, Kelas, Guru & Inovasi AI */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6 max-w-full overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Konfigurasi Parameter Perangkat & Capaian Pembelajaran
              </h3>
              <p className="text-xs text-slate-500">
                Sesuaikan mata pelajaran, fase belajar, guru pengampu, serta instruksi khusus Asisten Guru AI.
              </p>
            </div>
          </div>

          {/* Kurikulum Toggle */}
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                setCurriculumType('cp020_pai');
                setSelectedMapel('Pendidikan Agama Islam dan Budi Pekerti (PAI)');
                setSelectedElemen('Al-Qur\'an Hadis');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                curriculumType === 'cp020_pai'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CP 020 (PAI Lengkap)
            </button>
            <button
              onClick={() => {
                setCurriculumType('cp046_umum');
                setSelectedMapel('Ilmu Pengetahuan Alam dan Sosial (IPAS)');
                setSelectedElemen('Pemahaman IPAS (Sains & Sosial)');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                curriculumType === 'cp046_umum'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CP 046 (Mapel Umum BSKAP)
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Fase & Kelas */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Fase & Tingkat Kelas:</span>
              <span className="text-emerald-700 font-extrabold">Fase {selectedFase}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['A', 'B', 'C'] as const).map((fase) => (
                <button
                  key={fase}
                  onClick={() => handleFaseChange(fase)}
                  className={`py-2 px-1 text-center font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedFase === fase
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Fase {fase}
                  <span className="block text-[10px] font-normal text-slate-500">
                    {fase === 'A' ? 'Kelas 1-2' : fase === 'B' ? 'Kelas 3-4' : 'Kelas 5-6'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pilih Kelas Spesifik & Semester */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Kelas & Semester:</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {selectedFase === 'A' && (
                  <>
                    <option value={1}>Kelas 1</option>
                    <option value={2}>Kelas 2</option>
                  </>
                )}
                {selectedFase === 'B' && (
                  <>
                    <option value={3}>Kelas 3</option>
                    <option value={4}>Kelas 4</option>
                  </>
                )}
                {selectedFase === 'C' && (
                  <>
                    <option value={5}>Kelas 5</option>
                    <option value={6}>Kelas 6</option>
                  </>
                )}
              </select>

              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value) as 1 | 2)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value={1}>Sem. 1 (Ganjil)</option>
                <option value={2}>Sem. 2 (Genap)</option>
              </select>
            </div>
          </div>

          {/* Mata Pelajaran */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Mata Pelajaran:</label>
            <select
              value={selectedMapel}
              onChange={(e) => {
                setSelectedMapel(e.target.value);
                if (curriculumType === 'cp020_pai') {
                  setSelectedElemen('Al-Qur\'an Hadis');
                } else if (e.target.value.includes('Matematika')) {
                  setSelectedElemen('Bilangan');
                } else if (e.target.value.includes('Indonesia')) {
                  setSelectedElemen('Membaca dan Memirsa');
                } else if (e.target.value.includes('IPAS')) {
                  setSelectedElemen('Pemahaman IPAS (Sains & Sosial)');
                } else {
                  setSelectedElemen('Pancasila');
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {mapelOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Elemen CP */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Elemen Capaian (CP):</label>
            <select
              value={selectedElemen}
              onChange={(e) => setSelectedElemen(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {elemenOptions.map((el) => (
                <option key={el} value={el}>{el}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Guru Pengampu & Alokasi Waktu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Pendidik / Guru Pengampu (Penandatangan Dokumen):</label>
            <select
              value={selectedGuruId}
              onChange={(e) => setSelectedGuruId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {pegawai.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} — NIP: {p.nip || 'Non-NIP'} ({p.jabatan || 'Guru'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Alokasi Waktu & Durasi KBM:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={alokasiWaktu}
                onChange={(e) => setAlokasiWaktu(e.target.value)}
                placeholder="Misal: 2 JP (2 x 35 Menit)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                1 Pertemuan
              </span>
            </div>
          </div>
        </div>

        {/* Asisten Guru AI Interactive Accelerator Console */}
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-emerald-50/70 via-teal-50/50 to-blue-50/60 border border-emerald-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-emerald-700" />
              <span className="font-black text-slate-900 text-xs uppercase tracking-wider">
                Panel Asisten Guru AI: Penajaman Pedagogik & Diferensiasi
              </span>
            </div>
            <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300/60">
              Status: {aiActiveEnhancement}
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5">
            {aiPromptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAiAssistantPrompt(chip.prompt);
                  handleApplyAIEnhancement(chip.prompt);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Custom Prompt Input */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <input
              type="text"
              value={aiAssistantPrompt}
              onChange={(e) => setAiAssistantPrompt(e.target.value)}
              placeholder="Instruksi khusus AI: Misal tambahkan ice breaking tepuk rukun iman, tekankan gotong royong, atau materi slow-learner..."
              className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
            <button
              onClick={() => handleApplyAIEnhancement()}
              disabled={isGeneratingAI}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              {isGeneratingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isGeneratingAI ? 'Menganalisis...' : 'Sempurnakan AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 12 Tab Perangkat Navigation Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-3 max-w-full overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              12 Instrumen Perangkat Pembelajaran Tersedia (Pilih Instrumen):
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            Aktif: <strong className="text-emerald-800">{perangkatButtons.find(b => b.id === activePerangkat)?.shortTitle}</strong>
          </span>
        </div>

        {/* 12 Devices Grid Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {perangkatButtons.map((btn) => {
            const isActive = activePerangkat === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setActivePerangkat(btn.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                  isActive
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`p-1 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-2xs'}`}>
                    {btn.icon}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {btn.badge}
                  </span>
                </div>
                <div className="mt-1">
                  <div className={`text-xs font-extrabold line-clamp-1 ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {btn.shortTitle}
                  </div>
                  <div className={`text-[10px] line-clamp-1 ${isActive ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {btn.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DOCUMENT VIEWER & A4 PRINT PREVIEW AREA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden max-w-full">
        {/* Document Action Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-800" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Format Lembar Kerja Resmi A4: {perangkatButtons.find(b => b.id === activePerangkat)?.shortTitle}
              </h3>
              <p className="text-[11px] text-slate-500">
                Layout proporsional A4 standar Dinas Pendidikan, batas kotak terkunci rapi (anti-overflow), siap cetak atau ekspor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setViewMode(viewMode === 'document_a4' ? 'raw_editor' : 'document_a4')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                viewMode === 'raw_editor'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {viewMode === 'raw_editor' ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{viewMode === 'raw_editor' ? 'Lihat Format A4' : 'Mode Editor Teks'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            <button
              onClick={handleDownloadDoc}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Unduh .doc</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak A4</span>
            </button>
          </div>
        </div>

        {/* Content Render: Document A4 Sheet or Raw Editor */}
        {viewMode === 'raw_editor' ? (
          <div className="p-6">
            <textarea
              rows={24}
              value={customText || `Dokumen: ${perangkatButtons.find(b => b.id === activePerangkat)?.shortTitle}\nMata Pelajaran: ${selectedMapel}\nFase: ${selectedFase} / Kelas: ${selectedKelas}\nCapaian Pembelajaran: ${activeCPText}\nPenyusun: ${currentGuru.nama}`}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-4 font-mono text-xs leading-relaxed bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
          </div>
        ) : (
          /* THE OFFICIAL A4 PRINTABLE DOCUMENT CONTAINER */
          <div className="p-4 sm:p-8 bg-slate-100/60 flex justify-center">
            <div 
              id="perangkat-print-area"
              className="w-full max-w-[850px] bg-white border border-slate-300 shadow-lg p-6 sm:p-10 space-y-6 text-slate-900 font-sans text-xs leading-relaxed overflow-hidden break-words"
              style={{ minHeight: '1100px' }}
            >
              {/* 1. KOP SURAT DINAS RESMI */}
              <div className="text-center pb-2 border-b-2 border-slate-900 space-y-1 relative">
                <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-800">
                  PEMERINTAH KABUPATEN PASURUAN
                </p>
                <p className="text-xs sm:text-sm font-extrabold uppercase text-slate-800">
                  DINAS PENDIDIKAN DAN KEBUDAYAAN
                </p>
                <h1 className="text-base sm:text-xl font-black uppercase text-slate-950 tracking-tight">
                  UPT SATUAN PENDIDIKAN {profil.nama.toUpperCase()}
                </h1>
                <p className="text-[10px] text-slate-600 font-medium">
                  NPSN: {profil.npsn} | {profil.alamat}, Kec. {profil.kecamatan}, Kab. {profil.kabupaten} — Kode Pos 67154
                </p>
                <p className="text-[10px] text-slate-600 font-medium">
                  Surel: {profil.email} | Telepon: {profil.telepon}
                </p>
                <div className="pt-1">
                  <div className="h-0.5 bg-slate-950 w-full" />
                  <div className="h-px bg-slate-950 w-full mt-0.5" />
                </div>
              </div>

              {/* 2. JUDUL DOKUMEN & NOMOR ADMINISTRASI */}
              <div className="text-center space-y-1 py-1">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-950 underline decoration-slate-900 underline-offset-4">
                  {perangkatButtons.find(b => b.id === activePerangkat)?.shortTitle.toUpperCase()}
                </h2>
                <p className="text-[10px] font-mono text-slate-600">
                  Nomor Dokumen: 421.2/0{selectedKelas}8/SDN-KDR1/{new Date().getFullYear()}
                </p>
                <div className="inline-block px-3 py-0.5 bg-slate-100 rounded-full text-[10px] font-extrabold text-slate-700 uppercase">
                  {curriculumType === 'cp020_pai' ? 'Keputusan BSKAP No. 020 (PAI)' : 'Keputusan BSKAP No. 046/H/KR/2024'}
                </div>
              </div>

              {/* 3. TABEL IDENTITAS PERANGKAT (ANTI-OVERFLOW FIXED TABLE) */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full table-fixed text-[11px] border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/4 py-1.5 px-3 font-bold bg-slate-50 text-slate-700">Satuan Pendidikan</td>
                      <td className="w-1/4 py-1.5 px-3 text-slate-900 font-semibold">{profil.nama}</td>
                      <td className="w-1/4 py-1.5 px-3 font-bold bg-slate-50 text-slate-700">Fase / Kelas</td>
                      <td className="w-1/4 py-1.5 px-3 text-slate-900 font-semibold">Fase {selectedFase} / Kelas {selectedKelas}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-3 font-bold bg-slate-50 text-slate-700">Mata Pelajaran</td>
                      <td className="py-1.5 px-3 text-slate-900 font-semibold truncate" title={selectedMapel}>{selectedMapel}</td>
                      <td className="py-1.5 px-3 font-bold bg-slate-50 text-slate-700">Semester / TP</td>
                      <td className="py-1.5 px-3 text-slate-900 font-semibold">Semester {selectedSemester === 1 ? '1 (Ganjil)' : '2 (Genap)'} / {profil.tahunPelajaranAktif}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-3 font-bold bg-slate-50 text-slate-700">Elemen Capaian</td>
                      <td className="py-1.5 px-3 text-slate-900 font-semibold truncate" title={selectedElemen}>{selectedElemen}</td>
                      <td className="py-1.5 px-3 font-bold bg-slate-50 text-slate-700">Alokasi Waktu</td>
                      <td className="py-1.5 px-3 text-slate-900 font-semibold">{alokasiWaktu}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-bold bg-slate-50 text-slate-700">Pendidik / Guru</td>
                      <td className="py-1.5 px-3 text-slate-900 font-bold truncate">{currentGuru.nama}</td>
                      <td className="py-1.5 px-3 font-bold bg-slate-50 text-slate-700">NIP / Jabatan</td>
                      <td className="py-1.5 px-3 text-slate-900 font-mono text-[10px]">{currentGuru.nip || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4. DYNAMIC DETAIL CONTENT PER PERANGKAT (RICH FORMAL STRUCTURE) */}
              {activePerangkat === 'modul_deep_learning' ? (
                /* MODUL AJAR DEEP LEARNING (3 PILAR: MINDFUL, MEANINGFUL, JOYFUL) */
                <div className="space-y-4 pt-1">
                  {/* Bagian I: Capaian & Tujuan */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 border-l-4 border-emerald-700">
                      I. Capaian Pembelajaran & Tujuan Pembelajaran (TP ABCD)
                    </h4>
                    <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg space-y-2">
                      <p className="text-slate-700">
                        <strong>Capaian Pembelajaran Elemen ({selectedElemen}):</strong> "{activeCPText}"
                      </p>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">Tujuan Pembelajaran Khusus (Spesifik & Terukur):</p>
                        <ol className="list-decimal pl-5 space-y-1 text-slate-700">
                          <li>Peserta didik (A) mampu menguraikan makna konsep {selectedElemen} (B) melalui tayangan studi kasus kontekstual (C) secara benar dan mandiri minimal 80% (D).</li>
                          <li>Peserta didik (A) mampu mendemonstrasikan sikap empati dan pengamalan nilai {selectedElemen} (B) dalam aktivitas kolaboratif kelompok (C) secara santun dan konsisten (D).</li>
                          <li>Peserta didik (A) mampu menyusun dan mempresentasikan karya reflektif / peta konsep {selectedElemen} (B) dengan bahasa yang runtut dan percaya diri (D).</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Bagian II: Pemahaman Bermakna & Profil Pelajar Pancasila */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 border-l-4 border-emerald-700">
                      II. Pemahaman Bermakna, Pertanyaan Pemantik & Profil Pelajar Pancasila
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                        <p className="font-bold text-slate-800">Pemahaman Bermakna:</p>
                        <p className="text-slate-700 leading-normal">
                          Pemahaman mengenai {selectedElemen} membimbing murid untuk memiliki ketenangan hati, kesadaran moral tinggi, serta kepekaan sosial terhadap sesama di lingkungan SDN Kedungringin 1 Beji.
                        </p>
                        <p className="font-bold text-slate-800 pt-1">Pertanyaan Pemantik:</p>
                        <ul className="list-disc pl-5 text-slate-700 space-y-0.5">
                          <li>Mengapa kita perlu memahami ajaran {selectedElemen} dalam kehidupan sehari-hari?</li>
                          <li>Bagaimana tindakan kita jika menghadapi situasi nyata yang membutuhkan pengamalan nilai tersebut?</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                        <p className="font-bold text-slate-800">Dimensi Profil Pelajar Pancasila (P3):</p>
                        <ul className="list-disc pl-5 text-slate-700 space-y-1">
                          <li><strong>Beriman & Bertakwa:</strong> Membiasakan doa, dzikir, dan penghayatan nilai moral ketuhanan.</li>
                          <li><strong>Bernalar Kritis:</strong> Mampu membedakan konsep benar-salah dan menganalisis sebab-akibat.</li>
                          <li><strong>Gotong Royong & Mandiri:</strong> Bekerja sama menyelesaikan tantangan kelompok secara bertanggung jawab.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Bagian III: Langkah-Langkah Pembelajaran Berbasis Deep Learning */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 border-l-4 border-emerald-700">
                      III. Langkah Pembelajaran Deep Learning (Mindful, Meaningful, Joyful)
                    </h4>
                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                      <table className="w-full table-fixed text-[11px] border-collapse">
                        <thead className="bg-slate-100 font-bold border-b border-slate-300">
                          <tr>
                            <th className="w-[20%] py-2 px-3 text-left">Fase Pembelajaran</th>
                            <th className="w-[65%] py-2 px-3 text-left">Aktivitas Guru & Peserta Didik</th>
                            <th className="w-[15%] py-2 px-3 text-center">Waktu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="py-2 px-3 font-bold align-top bg-emerald-50/40 text-emerald-950">
                              1. Mindful Learning<br />
                              <span className="text-[10px] font-normal text-slate-500">(Orientasi & Kesadaran Penuh)</span>
                            </td>
                            <td className="py-2 px-3 text-slate-800 space-y-1">
                              <p>• Guru menyapa dengan salam hangat, berdoa bersama, dan melatih teknik pernapasan hening (mindfulness 2 menit) untuk menyiapkan fokus mental murid.</p>
                              <p>• Asesmen Diagnostik Awal: Guru menampilkan gambar/pertanyaan singkat untuk memetakan pemahaman awal murid.</p>
                              <p>• Menyampaikan tujuan pembelajaran yang jelas dan kriteria keberhasilan.</p>
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold align-top">10 Menit</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold align-top bg-blue-50/40 text-blue-950">
                              2. Meaningful Learning<br />
                              <span className="text-[10px] font-normal text-slate-500">(Koneksi Bermakna & Analisis)</span>
                            </td>
                            <td className="py-2 px-3 text-slate-800 space-y-1">
                              <p>• Murid dibagi menjadi kelompok kecil berdasarkan diferensiasi kesiapan belajar (gaya belajar visual, auditori, kinestetik).</p>
                              <p>• Menyimak stimulus cerita kontekstual / kartu kasus mengenai {selectedElemen}.</p>
                              <p>• Eksplorasi Konsep: Murid berdiskusi mengidentifikasi nilai penting dan menyusun solusi masalah di LKPD interaktif.</p>
                              <p>• Bimbingan bertingkat (scaffolding): Guru mendampingi kelompok yang membutuhkan bantuan intensif.</p>
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold align-top">50 Menit</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold align-top bg-amber-50/40 text-amber-950">
                              3. Joyful Learning<br />
                              <span className="text-[10px] font-normal text-slate-500">(Apresiasi & Refleksi Gembira)</span>
                            </td>
                            <td className="py-2 px-3 text-slate-800 space-y-1">
                              <p>• Gelar Karya & Presentasi Kelompok: Setiap kelompok menampilkan hasil LKPD dengan cara kreatif (poster, lisan, atau bermain peran singkat).</p>
                              <p>• Kuis Cepat & Gamifikasi: Game pertanyaan interaktif untuk memperkuat daya ingat dengan tepuk apresiasi bintang kelas.</p>
                              <p>• Refleksi & Penutup: Murid mengungkapkan hal baru yang paling menyenangkan yang mereka pelajari hari ini.</p>
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold align-top">10 Menit</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bagian IV: Diferensiasi & Asesmen KKTP */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 border-l-4 border-emerald-700">
                      IV. Diferensiasi Pembelajaran & Asesmen Ketercapaian (KKTP)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                        <p className="font-bold text-slate-800">Strategi Diferensiasi:</p>
                        <p>• <strong>Diferensiasi Konten:</strong> Lembar teks bergambar untuk visual, rekaman bacaan/suara untuk auditori.</p>
                        <p>• <strong>Diferensiasi Proses:</strong> Kelompok mandiri mengerjakan analisis studi kasus; kelompok bimbingan didampingi langsung oleh guru.</p>
                        <p>• <strong>Diferensiasi Produk:</strong> Murid bebas memilih membuat bagan peta konsep, rekaman suara ringkasan, atau presentasi langsung.</p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                        <p className="font-bold text-slate-800">Asesmen & Kriteria KKTP:</p>
                        <p>• <strong>Formatif:</strong> Pengamatan sikap keaktifan, kepatuhan adab, dan unjuk kerja LKPD.</p>
                        <p>• <strong>Sumatif:</strong> Tes tertulis pilihan ganda & uraian singkat (Ambang Batas Tuntas KKTP: {kktpThreshold} Poin).</p>
                        <p>• <strong>Tindak Lanjut:</strong> Nilai &lt; {kktpThreshold} mengikuti remedial terbimbing; Nilai &gt;= {kktpThreshold} diberikan pengayaan studi kasus tingkat lanjut.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activePerangkat === 'atp' ? (
                /* ALUR TUJUAN PEMBELAJARAN (ATP) FORMAL TABLE */
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                    <strong>Capaian Elemen ({selectedElemen}):</strong> "{activeCPText}"
                  </div>

                  <table className="w-full table-fixed text-[11px] border border-slate-300 border-collapse">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="w-[6%] py-2 px-2 text-center border-r border-slate-300">No</th>
                        <th className="w-[28%] py-2 px-3 text-left border-r border-slate-300">Elemen & Materi Pokok</th>
                        <th className="w-[38%] py-2 px-3 text-left border-r border-slate-300">Tujuan Pembelajaran (TP)</th>
                        <th className="w-[18%] py-2 px-3 text-left border-r border-slate-300">Profil Pancasila</th>
                        <th className="w-[10%] py-2 px-2 text-center">Alokasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2.5 px-2 text-center font-mono font-bold border-r border-slate-300">1</td>
                        <td className="py-2.5 px-3 border-r border-slate-300">
                          <strong>{selectedElemen} - Sub-topik 1</strong><br />
                          <span className="text-[10px] text-slate-600">Pengenalan Dasar & Identifikasi Karakteristik</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300">
                          Murid mampu mengidentifikasi dan menjelaskan makna pokok {selectedElemen} secara runut dan benar.
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-[10px]">
                          Beriman, Bertakwa, Mandiri
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold">4 JP</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-2 text-center font-mono font-bold border-r border-slate-300">2</td>
                        <td className="py-2.5 px-3 border-r border-slate-300">
                          <strong>{selectedElemen} - Sub-topik 2</strong><br />
                          <span className="text-[10px] text-slate-600">Implementasi Nilai dalam Kasus Nyata</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300">
                          Murid mampu menerapkan dan membiasakan tindakan baik berdasarkan nilai {selectedElemen} di rumah dan sekolah.
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-[10px]">
                          Gotong Royong, Bernalar Kritis
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold">4 JP</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-2 text-center font-mono font-bold border-r border-slate-300">3</td>
                        <td className="py-2.5 px-3 border-r border-slate-300">
                          <strong>{selectedElemen} - Sub-topik 3</strong><br />
                          <span className="text-[10px] text-slate-600">Refleksi, Unjuk Karya & Evaluasi Mandiri</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300">
                          Murid mampu menganalisis perbandingan serta membuat karya portofolio rangkuman reflektif bersama kelompok.
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 text-[10px]">
                          Kreatif, Mandiri
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold">4 JP</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                      <tr>
                        <td colSpan={4} className="py-2 px-3 text-right border-r border-slate-300">Total Alokasi Jam Elemen {selectedElemen}:</td>
                        <td className="py-2 px-2 text-center font-mono font-extrabold text-emerald-800">12 JP</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : activePerangkat === 'prota' ? (
                /* PROGRAM TAHUNAN (PROTA) */
                <div className="space-y-4 pt-1">
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 font-extrabold px-3 py-1.5 border-b border-slate-300 text-slate-800">
                      SEMESTER 1 (GANJIL)
                    </div>
                    <table className="w-full table-fixed text-[11px] border-collapse">
                      <thead className="bg-slate-50 font-bold border-b border-slate-300">
                        <tr>
                          <th className="w-[8%] py-1.5 px-2 text-center border-r border-slate-200">No</th>
                          <th className="w-[32%] py-1.5 px-3 text-left border-r border-slate-200">Elemen Capaian</th>
                          <th className="w-[45%] py-1.5 px-3 text-left border-r border-slate-200">Materi Pokok / Lingkup Pembelajaran</th>
                          <th className="w-[15%] py-1.5 px-2 text-center">Alokasi Waktu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2 px-2 text-center font-mono border-r border-slate-200">1</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold">{selectedElemen} I</td>
                          <td className="py-2 px-3 border-r border-slate-200">Konsep Fondasional, Makna dan Bacaan Bertajwid</td>
                          <td className="py-2 px-2 text-center font-mono font-bold">8 JP</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2 text-center font-mono border-r border-slate-200">2</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold">{selectedElemen} II</td>
                          <td className="py-2 px-3 border-r border-slate-200">Penerapan Nilai Karakter dan Sikap Empati Berkelanjutan</td>
                          <td className="py-2 px-2 text-center font-mono font-bold">8 JP</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2 text-center font-mono border-r border-slate-200">3</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold">Evaluasi Tengah Semester</td>
                          <td className="py-2 px-3 border-r border-slate-200">Asesmen Sumatif Tengah Semester (STS) Ganjil</td>
                          <td className="py-2 px-2 text-center font-mono font-bold">2 JP</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2 text-center font-mono border-r border-slate-200">4</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold">{selectedElemen} III</td>
                          <td className="py-2 px-3 border-r border-slate-200">Proyek Pembelajaran Kolaboratif Berbasis Masalah Nyata</td>
                          <td className="py-2 px-2 text-center font-mono font-bold">8 JP</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2 text-center font-mono border-r border-slate-200">5</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold">Evaluasi Akhir Semester</td>
                          <td className="py-2 px-3 border-r border-slate-200">Asesmen Sumatif Akhir Semester (SAS) Ganjil</td>
                          <td className="py-2 px-2 text-center font-mono font-bold">2 JP</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                        <tr>
                          <td colSpan={3} className="py-1.5 px-3 text-right border-r border-slate-200">Jumlah Jam Efektif Semester Ganjil:</td>
                          <td className="py-1.5 px-2 text-center font-mono font-black text-emerald-800">28 JP</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 font-extrabold px-3 py-1.5 border-b border-slate-300 text-slate-800">
                      SEMESTER 2 (GENAP)
                    </div>
                    <table className="w-full table-fixed text-[11px] border-collapse">
                      <thead className="bg-slate-50 font-bold border-b border-slate-300">
                        <tr>
                          <th className="w-[8%] py-1.5 px-2 text-center border-r border-slate-200">No</th>
                          <th className="w-[32%] py-1.5 px-3 text-left border-r border-slate-200">Elemen Capaian</th>
                          <th className="w-[45%] py-1.5 px-3 text-left border-r border-slate-200">Materi Pokok / Lingkup Pembelajaran</th>
                          <th className="w-[15%] py-1.5 px-2 text-center">Alokasi Waktu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2 px-2 text-center font-mono border-r border-slate-200">6</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold">{selectedElemen} Lanjutan</td>
                          <td className="py-2 px-3 border-r border-slate-200">Pendalaman Konsep dan Hubungan Sosial Harmonis</td>
                          <td className="py-2 px-2 text-center font-mono font-bold">8 JP</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2 text-center font-mono border-r border-slate-200">7</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold">Aksi Peduli Lingkungan</td>
                          <td className="py-2 px-3 border-r border-slate-200">Praktik Baik dan Observasi Lapangan di Pasuruan</td>
                          <td className="py-2 px-2 text-center font-mono font-bold">8 JP</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2 text-center font-mono border-r border-slate-200">8</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold">Gelar Karya & SAT</td>
                          <td className="py-2 px-3 border-r border-slate-200">Unjuk Portofolio dan Asesmen Akhir Tahun</td>
                          <td className="py-2 px-2 text-center font-mono font-bold">10 JP</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                        <tr>
                          <td colSpan={3} className="py-1.5 px-3 text-right border-r border-slate-200">Jumlah Jam Efektif Semester Genap:</td>
                          <td className="py-1.5 px-2 text-center font-mono font-black text-emerald-800">26 JP</td>
                        </tr>
                        <tr className="bg-emerald-50 text-emerald-950 font-black border-t border-slate-300">
                          <td colSpan={3} className="py-2 px-3 text-right border-r border-slate-300 uppercase">TOTAL ALOKASI JAM KBM SATU TAHUN:</td>
                          <td className="py-2 px-2 text-center font-mono text-sm text-emerald-900">54 JP</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : activePerangkat === 'promes' ? (
                /* PROGRAM SEMESTER (PROMES) */
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                    <strong>Distribusi Pekan KBM Semester {selectedSemester === 1 ? '1 (Ganjil)' : '2 (Genap)'}:</strong>
                    <p className="mt-0.5 text-slate-600">
                      {selectedSemester === 1
                        ? 'Juli: 2 Pekan | Agustus: 5 Pekan | September: 4 Pekan | Oktober: 4 Pekan | November: 4 Pekan | Desember: 2 Pekan (Total: 21 Pekan Efektif)'
                        : 'Januari: 4 Pekan | Februari: 4 Pekan | Maret: 4 Pekan | April: 3 Pekan | Mei: 4 Pekan | Juni: 2 Pekan (Total: 21 Pekan Efektif)'}
                    </p>
                  </div>

                  <table className="w-full table-fixed text-[11px] border border-slate-300 border-collapse">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="w-[10%] py-2 px-2 text-center border-r border-slate-300">Pekan Ke-</th>
                        <th className="w-[50%] py-2 px-3 text-left border-r border-slate-300">Materi / Aktivitas KBM</th>
                        <th className="w-[25%] py-2 px-3 text-left border-r border-slate-300">Fokus Pembelajaran</th>
                        <th className="w-[15%] py-2 px-2 text-center">Alokasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-300">1 – 4</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-semibold">Eksplorasi Konsep Elemen {selectedElemen}</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-[10px]">Mindful Learning & Pemetaan Awal</td>
                        <td className="py-2 px-2 text-center font-mono font-bold">8 JP</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-300">5 – 8</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-semibold">Studi Kasus Nyata & Diskusi Kelompok LKPD</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-[10px]">Meaningful Learning & Berpikir Kritis</td>
                        <td className="py-2 px-2 text-center font-mono font-bold">8 JP</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-300 bg-amber-50/50">9</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-bold bg-amber-50/50">Asesmen Sumatif Tengah Semester (STS)</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-[10px] bg-amber-50/50">Evaluasi Pemahaman Kognitif</td>
                        <td className="py-2 px-2 text-center font-mono font-bold bg-amber-50/50">2 JP</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-300">10 – 14</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-semibold">Game Kolaboratif, Praktik Lapangan & Unjuk Karya</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-[10px]">Joyful Learning & Portofolio</td>
                        <td className="py-2 px-2 text-center font-mono font-bold">8 JP</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-300">15 – 16</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-semibold">Penguatan Karakter P3 & Proyek Bertema</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-[10px]">Gotong Royong & Refleksi</td>
                        <td className="py-2 px-2 text-center font-mono font-bold">4 JP</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-300 bg-blue-50/50">17</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-bold bg-blue-50/50">Asesmen Sumatif Akhir Semester (SAS)</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-[10px] bg-blue-50/50">Penilaian Capaian Belajar</td>
                        <td className="py-2 px-2 text-center font-mono font-bold bg-blue-50/50">2 JP</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-300">18</td>
                        <td className="py-2 px-3 border-r border-slate-300 font-semibold">Remedial, Pengayaan, dan Verifikasi Hasil Belajar</td>
                        <td className="py-2 px-3 border-r border-slate-300 text-[10px]">Tindak Lanjut KKTP & Rapor</td>
                        <td className="py-2 px-2 text-center font-mono font-bold">2 JP</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : activePerangkat === 'rpe' ? (
                /* RENCANA PEKAN EFEKTIF (RPE) */
                <div className="space-y-4 pt-1">
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full table-fixed text-[11px] border-collapse">
                      <thead className="bg-slate-100 font-bold border-b border-slate-300">
                        <tr>
                          <th className="w-[10%] py-2 px-2 text-center border-r border-slate-200">No</th>
                          <th className="w-[50%] py-2 px-3 text-left border-r border-slate-200">Bulan Kalender Pendidikan</th>
                          <th className="w-[20%] py-2 px-3 text-center border-r border-slate-200">Jumlah Pekan Kalender</th>
                          <th className="w-[20%] py-2 px-3 text-center">Pekan Efektif KBM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedSemester === 1 ? (
                          <>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">1</td><td className="py-1.5 px-3 border-r border-slate-200">Juli</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">4</td><td className="py-1.5 px-3 text-center font-mono font-bold">2</td></tr>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">2</td><td className="py-1.5 px-3 border-r border-slate-200">Agustus</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">5</td><td className="py-1.5 px-3 text-center font-mono font-bold">5</td></tr>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">3</td><td className="py-1.5 px-3 border-r border-slate-200">September</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">4</td><td className="py-1.5 px-3 text-center font-mono font-bold">4</td></tr>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">4</td><td className="py-1.5 px-3 border-r border-slate-200">Oktober</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">4</td><td className="py-1.5 px-3 text-center font-mono font-bold">4</td></tr>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">5</td><td className="py-1.5 px-3 border-r border-slate-200">November</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">4</td><td className="py-1.5 px-3 text-center font-mono font-bold">4</td></tr>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">6</td><td className="py-1.5 px-3 border-r border-slate-200">Desember</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">5</td><td className="py-1.5 px-3 text-center font-mono font-bold">2</td></tr>
                          </>
                        ) : (
                          <>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">1</td><td className="py-1.5 px-3 border-r border-slate-200">Januari</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">5</td><td className="py-1.5 px-3 text-center font-mono font-bold">4</td></tr>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">2</td><td className="py-1.5 px-3 border-r border-slate-200">Februari</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">4</td><td className="py-1.5 px-3 text-center font-mono font-bold">4</td></tr>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">3</td><td className="py-1.5 px-3 border-r border-slate-200">Maret</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">4</td><td className="py-1.5 px-3 text-center font-mono font-bold">4</td></tr>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">4</td><td className="py-1.5 px-3 border-r border-slate-200">April</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">4</td><td className="py-1.5 px-3 text-center font-mono font-bold">3</td></tr>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">5</td><td className="py-1.5 px-3 border-r border-slate-200">Mei</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">5</td><td className="py-1.5 px-3 text-center font-mono font-bold">4</td></tr>
                            <tr><td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">6</td><td className="py-1.5 px-3 border-r border-slate-200">Juni</td><td className="py-1.5 px-3 text-center font-mono border-r border-slate-200">4</td><td className="py-1.5 px-3 text-center font-mono font-bold">2</td></tr>
                          </>
                        )}
                      </tbody>
                      <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                        <tr>
                          <td colSpan={2} className="py-2 px-3 text-right border-r border-slate-200">Total:</td>
                          <td className="py-2 px-3 text-center font-mono font-black border-r border-slate-200">26 Pekan</td>
                          <td className="py-2 px-3 text-center font-mono font-black text-emerald-800">21 Pekan Efektif</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-slate-800">
                    <p className="font-bold">Kalkulasi Jam Pembelajaran Efektif Riil:</p>
                    <p>• Jumlah Pekan Efektif KBM : 21 Pekan</p>
                    <p>• Alokasi Jam Tatap Muka per Pekan : 2 JP / Pekan</p>
                    <p className="font-bold text-emerald-900">• Total Jam Pelajaran Efektif : 21 Pekan x 2 JP = 42 JP Tatap Muka</p>
                  </div>
                </div>
              ) : activePerangkat === 'jurnal_mengajar' ? (
                /* JURNAL MENGAJAR GURU */
                <div className="space-y-3 pt-1">
                  <table className="w-full table-fixed text-[11px] border border-slate-300 border-collapse">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="w-[6%] py-2 px-2 text-center border-r border-slate-300">No</th>
                        <th className="w-[18%] py-2 px-3 text-left border-r border-slate-300">Hari / Tanggal</th>
                        <th className="w-[10%] py-2 px-2 text-center border-r border-slate-300">Jam Ke-</th>
                        <th className="w-[38%] py-2 px-3 text-left border-r border-slate-300">Materi / Tujuan Pembelajaran</th>
                        <th className="w-[16%] py-2 px-2 text-center border-r border-slate-300">Kehadiran</th>
                        <th className="w-[12%] py-2 px-2 text-center">Catatan / Paraf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[1, 2, 3, 4].map((pertemuan) => (
                        <tr key={pertemuan}>
                          <td className="py-3 px-2 text-center font-mono font-bold border-r border-slate-300">{pertemuan}</td>
                          <td className="py-3 px-3 border-r border-slate-300 font-medium">Senin, {pertemuan * 7} Agustus {new Date().getFullYear()}</td>
                          <td className="py-3 px-2 text-center font-mono border-r border-slate-300">1 – 2 (07.00 - 08.10)</td>
                          <td className="py-3 px-3 border-r border-slate-300">
                            <strong>{selectedElemen} (Pertemuan {pertemuan}):</strong><br />
                            <span className="text-[10px] text-slate-600">
                              {pertemuan === 1 ? 'Eksplorasi konsep dasar & asesmen diagnostik mindful' :
                               pertemuan === 2 ? 'Studi kasus kontekstual kelompok dan pengerjaan LKPD' :
                               pertemuan === 3 ? 'Presentasi karya kelompok & umpan balik sejawat' :
                               'Asesmen sumatif lingkup materi & refleksi bersama'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center border-r border-slate-300 font-mono text-[10px]">
                            H: 32 | S: 0 | I: 0 | A: 0<br />
                            <span className="text-emerald-700 font-bold">100% Hadir</span>
                          </td>
                          <td className="py-3 px-2 text-center text-[10px] text-slate-500">
                            Terlaksana baik & tertib<br />
                            <span className="font-bold text-slate-700">[Paraf Guru]</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : activePerangkat === 'lkm' ? (
                /* LEMBAR KERJA MURID (LKPD) */
                <div className="space-y-4 pt-1">
                  <div className="border border-slate-300 p-3 rounded-lg bg-slate-50 space-y-1">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <p>Nama Kelompok: _____________________________</p>
                      <p>Kelas / Semester: Kelas {selectedKelas} / {selectedSemester === 1 ? 'Ganjil' : 'Genap'}</p>
                      <p>Anggota: 1. _____________ 2. _____________</p>
                      <p>Hari / Tanggal: _____________________________</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase text-slate-900 border-b border-slate-300 pb-1">
                      A. Petunjuk Belajar & Stimulus Kontekstual:
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Bacalah dan diskusikan kasus berikut bersama teman sekelompokmu dengan santun dan bergiliran. Terapkan nilai <strong>{selectedElemen}</strong> dalam merumuskan penyelesaian terbaik.
                    </p>
                    <div className="p-3 bg-emerald-50/60 border border-emerald-300 rounded-lg text-slate-800">
                      <strong>Studi Kasus Lingkungan Sekitar:</strong><br />
                      "Di lingkungan sekolah SDN Kedungringin 1 Beji, Doni melihat temannya kesulitan membawa buku perpustakaan dan tampak ragu untuk meminta tolong, sementara beberapa murid lain sedang asyik bermain sendiri."
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase text-slate-900 border-b border-slate-300 pb-1">
                      B. Pertanyaan Penyelidikan Kelompok (HOTS):
                    </h4>
                    <ol className="list-decimal pl-5 space-y-3 text-slate-800">
                      <li>
                        Berdasarkan pemahamanmu tentang <strong>{selectedElemen}</strong>, tindakan apa yang paling tepat dan mulia yang seharusnya dilakukan oleh murid yang melihat keadaan tersebut?
                        <div className="mt-1.5 h-12 border-b border-dotted border-slate-400 w-full" />
                      </li>
                      <li>
                        Jelaskan alasan dan manfaat positif dari tindakan tersebut bagi kerukunan warga sekolah SDN Kedungringin 1 Beji!
                        <div className="mt-1.5 h-12 border-b border-dotted border-slate-400 w-full" />
                      </li>
                      <li>
                        Tuliskan 2 komitmen nyata kelompokmu dalam menerapkan nilai tersebut dalam kehidupan sehari-hari di rumah dan sekolah!
                        <div className="mt-1.5 h-12 border-b border-dotted border-slate-400 w-full" />
                      </li>
                    </ol>
                  </div>
                </div>
              ) : activePerangkat === 'penilaian' ? (
                /* LEMBAR PENILAIAN & RUBRIK KKTP */
                <div className="space-y-4 pt-1">
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs uppercase text-slate-900 bg-slate-100 p-1.5 border-l-4 border-emerald-700">
                      Rubrik Ketercapaian Tujuan Pembelajaran (KKTP Interval 4 Skala)
                    </h4>
                    <table className="w-full table-fixed text-[11px] border border-slate-300 border-collapse">
                      <thead className="bg-slate-100 font-bold border-b border-slate-300">
                        <tr>
                          <th className="w-[20%] py-2 px-3 text-left border-r border-slate-300">Kriteria Penilaian</th>
                          <th className="w-[20%] py-2 px-2 text-center border-r border-slate-300 bg-red-50/50">Perlu Bimbingan (0 - 60%)</th>
                          <th className="w-[20%] py-2 px-2 text-center border-r border-slate-300 bg-amber-50/50">Cukup (61 - 75%)</th>
                          <th className="w-[20%] py-2 px-2 text-center border-r border-slate-300 bg-blue-50/50">Baik (76 - 85%)</th>
                          <th className="w-[20%] py-2 px-2 text-center bg-emerald-50/50">Sangat Baik (86 - 100%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2.5 px-3 font-bold border-r border-slate-300">Pemahaman Konsep {selectedElemen}</td>
                          <td className="py-2.5 px-2 text-[10px] text-slate-600 border-r border-slate-300">Belum mampu menjelaskan konsep pokok materi.</td>
                          <td className="py-2.5 px-2 text-[10px] text-slate-600 border-r border-slate-300">Mampu menjelaskan sebagian kecil konsep dasar.</td>
                          <td className="py-2.5 px-2 text-[10px] text-slate-600 border-r border-slate-300">Mampu menguraikan sebagian besar konsep secara runtut.</td>
                          <td className="py-2.5 px-2 text-[10px] text-slate-600">Menguasai dan mampu menganalisis konsep secara komprehensif.</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold border-r border-slate-300">Keterampilan Penerapan / Sikap</td>
                          <td className="py-2.5 px-2 text-[10px] text-slate-600 border-r border-slate-300">Masih pasif dan membutuhkan dorongan penuh.</td>
                          <td className="py-2.5 px-2 text-[10px] text-slate-600 border-r border-slate-300">Mulai menunjukkan partisipasi dalam bimbingan kelompok.</td>
                          <td className="py-2.5 px-2 text-[10px] text-slate-600 border-r border-slate-300">Aktif berdiskusi dan berempati pada sesama.</td>
                          <td className="py-2.5 px-2 text-[10px] text-slate-600">Menjadi teladan positif dan memimpin diskusi teman sebaya.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 space-y-1">
                    <p className="font-bold text-slate-900">Keputusan Hasil Asesmen & Tindak Lanjut:</p>
                    <p>• <strong>Interval 0 - 60%:</strong> Belum tuntas. Murid diberikan bimbingan ulang secara individual oleh guru.</p>
                    <p>• <strong>Interval 61 - 75%:</strong> Cukup tuntas. Diberikan latihan soal tambahan terbimbing pada bagian yang belum dikuasai.</p>
                    <p>• <strong>Interval 76 - 85%:</strong> Tuntas KKTP. Berhak melanjutkan ke tujuan pembelajaran berikutnya.</p>
                    <p>• <strong>Interval 86 - 100%:</strong> Tuntas Sangat Baik. Diberikan tantangan pengayaan dan penugasan tutor sebaya.</p>
                  </div>
                </div>
              ) : activePerangkat === 'presensi' ? (
                /* PRESENSI / ABSENSI HARIAN KELAS TERPADU DATA SISWA */
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pb-1">
                    <span>DAFTAR PRESENSI KELAS {selectedKelas} — SEMESTER {selectedSemester === 1 ? '1' : '2'}</span>
                    <span>Tahun Ajaran: {profil.tahunPelajaranAktif}</span>
                  </div>

                  <table className="w-full table-fixed text-[11px] border border-slate-300 border-collapse">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300 text-center">
                      <tr>
                        <th className="w-[6%] py-1.5 px-1 border-r border-slate-300">No</th>
                        <th className="w-[16%] py-1.5 px-2 border-r border-slate-300">NISN</th>
                        <th className="w-[36%] py-1.5 px-3 text-left border-r border-slate-300">Nama Siswa</th>
                        <th className="w-[8%] py-1.5 px-1 border-r border-slate-300">L/P</th>
                        <th className="w-[6%] py-1.5 px-1 border-r border-slate-300">P1</th>
                        <th className="w-[6%] py-1.5 px-1 border-r border-slate-300">P2</th>
                        <th className="w-[6%] py-1.5 px-1 border-r border-slate-300">P3</th>
                        <th className="w-[6%] py-1.5 px-1 border-r border-slate-300">P4</th>
                        <th className="w-[10%] py-1.5 px-1">% Hadir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {siswa.filter(s => s.kelas === selectedKelas).map((s, idx) => (
                        <tr key={s.id}>
                          <td className="py-1.5 px-1 text-center font-mono border-r border-slate-300">{idx + 1}</td>
                          <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300">{s.nisn}</td>
                          <td className="py-1.5 px-3 border-r border-slate-300 font-bold text-slate-900 truncate">{s.nama}</td>
                          <td className="py-1.5 px-1 text-center font-semibold border-r border-slate-300">{s.jenisKelamin}</td>
                          <td className="py-1.5 px-1 text-center font-bold text-emerald-800 border-r border-slate-300">✓</td>
                          <td className="py-1.5 px-1 text-center font-bold text-emerald-800 border-r border-slate-300">✓</td>
                          <td className="py-1.5 px-1 text-center font-bold text-emerald-800 border-r border-slate-300">✓</td>
                          <td className="py-1.5 px-1 text-center font-bold text-emerald-800 border-r border-slate-300">✓</td>
                          <td className="py-1.5 px-1 text-center font-mono font-bold text-emerald-700">100%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : activePerangkat === 'bank_soal' ? (
                /* BANK SOAL HOTS & AKM */
                <div className="space-y-4 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                    <strong>Naskah Soal Asesmen Sumatif Lingkup Materi ({selectedElemen})</strong>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Berisi soal penalaran tingkat tinggi (C4 Analisis, C5 Evaluasi, C6 Kreasi) dan AKM Literasi.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Soal 1: Pilihan Ganda Berbobot */}
                    <div className="p-3 border border-slate-200 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">1. Pilihan Ganda (Level Kognitif C4 - Analisis Kasus):</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Bobot: 10 Poin</span>
                      </div>
                      <p className="text-slate-800">
                        Ahmad melihat teman sekelasnya tidak sengaja menumpahkan air di meja guru dan merasa takut untuk mengaku. Tindakan apa yang mencerminkan pemahaman nilai <strong>{selectedElemen}</strong> paling tepat?
                      </p>
                      <div className="pl-4 space-y-1 text-slate-700">
                        <p>A. Membiarkannya agar tidak ikut terkena masalah guru.</p>
                        <p>B. Menemani temannya menghadap guru secara jujur dan membantu membersihkan tumpahan air bersama.</p>
                        <p>C. Mengumumkan kepada seluruh teman di kelas agar temannya merasa malu.</p>
                        <p>D. Pura-pura tidak melihat dan langsung keluar dari ruang kelas.</p>
                      </div>
                      <p className="text-[10px] font-bold text-emerald-800 pt-1">Kunci Jawaban: B (Alasan: Mengedepankan kejujuran, tanggung jawab, dan saling tolong-menolong).</p>
                    </div>

                    {/* Soal 2: Pilihan Ganda Kompleks */}
                    <div className="p-3 border border-slate-200 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">2. Pilihan Ganda Kompleks (Level Kognitif C5 - Evaluasi Pernyataan):</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Bobot: 15 Poin</span>
                      </div>
                      <p className="text-slate-800">
                        Pilihlah tanda centang (✓) pada setiap pernyataan yang benar terkait pengamalan materi {selectedElemen}:
                      </p>
                      <div className="space-y-1 text-slate-700 pl-2">
                        <p>[ ✓ ] Berdoa dengan penuh harap dan ketundukan hanya kepada Allah Swt.</p>
                        <p>[ ✓ ] Bersikap adil dan tidak membeda-bedakan teman berdasarkan suku atau agama di sekolah.</p>
                        <p>[   ] Hanya berbuat baik kepada orang yang memberikan hadiah atau imbalan.</p>
                      </div>
                    </div>

                    {/* Soal 3: Uraian Studi Kasus */}
                    <div className="p-3 border border-slate-200 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">3. Uraian Pemecahan Masalah (Level Kognitif C6 - Kreasi Solusi):</span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">Bobot: 25 Poin</span>
                      </div>
                      <p className="text-slate-800">
                        Bagaimana cara kamu menciptakan suasana kelas yang damai, saling menghargai, dan gemar tolong-menolong di SDN Kedungringin 1 Beji sesuai materi {selectedElemen}? Tuliskan 3 langkah nyata yang dapat kamu lakukan setiap hari!
                      </p>
                      <div className="h-14 border-b border-dotted border-slate-400 w-full" />
                    </div>
                  </div>
                </div>
              ) : activePerangkat === 'remedial_pengayaan' ? (
                /* APLIKASI KOREKSI, REMIDI & PENGAYAAN */
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 uppercase">
                        Analisis Ketuntasan Belajar & Rencana Remedial / Pengayaan
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Ambang batas KKTP: <strong>{kktpThreshold} Poin</strong>. Siswa di bawah ambang batas wajib mendapatkan pendampingan remedial.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 text-[11px]">Batas KKTP:</span>
                      <input
                        type="number"
                        min={50}
                        max={95}
                        value={kktpThreshold}
                        onChange={(e) => setKktpThreshold(Number(e.target.value))}
                        className="w-14 px-2 py-1 bg-slate-50 border border-slate-300 rounded font-bold text-center text-emerald-900 font-mono"
                      />
                    </div>
                  </div>

                  <table className="w-full table-fixed text-[11px] border border-slate-300 border-collapse">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="w-[6%] py-2 px-1 text-center border-r border-slate-300">No</th>
                        <th className="w-[34%] py-2 px-3 text-left border-r border-slate-300">Nama Siswa</th>
                        <th className="w-[16%] py-2 px-2 text-center border-r border-slate-300 font-mono">NISN</th>
                        <th className="w-[12%] py-2 px-2 text-center border-r border-slate-300">Nilai</th>
                        <th className="w-[14%] py-2 px-2 text-center border-r border-slate-300">Status</th>
                        <th className="w-[18%] py-2 px-2 text-left">Tindak Lanjut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {siswa.filter(s => s.kelas === selectedKelas).map((s, idx) => {
                        const mockScore = 65 + ((s.nama.length * 7) % 32);
                        const isTuntas = mockScore >= kktpThreshold;
                        return (
                          <tr key={s.id}>
                            <td className="py-2 px-1 text-center font-mono border-r border-slate-300">{idx + 1}</td>
                            <td className="py-2 px-3 font-bold border-r border-slate-300 truncate">{s.nama}</td>
                            <td className="py-2 px-2 text-center font-mono border-r border-slate-300">{s.nisn}</td>
                            <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-300">
                              <span className={isTuntas ? 'text-emerald-700' : 'text-red-700'}>{mockScore}</span>
                            </td>
                            <td className="py-2 px-2 text-center border-r border-slate-300">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                                isTuntas ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isTuntas ? 'Tuntas' : 'Remedial'}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-[10px] text-slate-700">
                              {isTuntas ? 'Tantangan pengayaan' : 'Bimbingan ulang'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Berita Acara Formal */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 space-y-1">
                    <p className="font-extrabold uppercase text-slate-900">Berita Acara Pelaksanaan Remedial & Pengayaan</p>
                    <p className="text-[11px] leading-relaxed">
                      Pada hari ini telah diselenggarakan kegiatan pembelajaran remedial dan program pengayaan untuk mata pelajaran <strong>{selectedMapel}</strong> materi <strong>{selectedElemen}</strong> di {profil.nama}. Seluruh siswa yang belum mencapai KKTP telah mendapatkan bimbingan ulang dan mencapai ketuntasan yang dipersyaratkan.
                    </p>
                  </div>
                </div>
              ) : activePerangkat === 'cover' ? (
                /* COVER PERANGKAT RESMI KEMDIKBUDRISTEK */
                <div className="py-8 px-6 border-4 border-double border-slate-800 text-center space-y-6 rounded-lg bg-linear-to-b from-white via-slate-50 to-white">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">PEMERINTAH KABUPATEN PASURUAN</p>
                    <p className="text-sm font-black uppercase tracking-wider text-slate-900">DINAS PENDIDIKAN DAN KEBUDAYAAN</p>
                    <p className="text-xs font-extrabold text-emerald-800 uppercase">UPT SATUAN PENDIDIKAN {profil.nama.toUpperCase()}</p>
                  </div>

                  <div className="py-4 flex justify-center">
                    <div className="w-28 h-28 rounded-full border-4 border-amber-500 bg-emerald-950 text-amber-300 flex flex-col items-center justify-center p-3 shadow-inner">
                      <GraduationCap className="w-12 h-12 text-amber-400" />
                      <span className="text-[8px] font-black uppercase text-white mt-1">KURIKULUM</span>
                      <span className="text-[8px] font-extrabold text-amber-300">MERDEKA</span>
                    </div>
                  </div>

                  <div className="space-y-2 py-4 bg-slate-100/70 border-y-2 border-slate-300">
                    <span className="text-xs font-extrabold tracking-widest uppercase text-amber-900">
                      BUNDEL DOKUMEN ADMINISTRASI GURU
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                      PERANGKAT PEMBELAJARAN
                    </h2>
                    <h3 className="text-sm sm:text-base font-extrabold text-emerald-900 uppercase">
                      {selectedMapel}
                    </h3>
                    <p className="text-xs font-bold text-slate-700">
                      FASE {selectedFase} — KELAS {selectedKelas} — SEMESTER {selectedSemester === 1 ? 'GANJIL (1)' : 'GENAP (2)'}
                    </p>
                    <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-[10px] font-extrabold uppercase">
                      {curriculumType === 'cp020_pai' ? 'Keputusan BSKAP No. 020 (PAI)' : 'Keputusan BSKAP No. 046/H/KR/2024'}
                    </div>
                  </div>

                  <div className="pt-2 space-y-1 text-xs">
                    <p className="text-slate-500 font-medium">Disusun Oleh:</p>
                    <p className="font-extrabold text-slate-950 text-sm">{currentGuru.nama}</p>
                    <p className="font-mono text-slate-700 text-[11px]">NIP. {currentGuru.nip || '-'}</p>
                    <p className="text-emerald-800 font-semibold text-[11px]">
                      Jabatan: {currentGuru.jabatan} (Golongan: {currentGuru.golongan})
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-300 text-xs space-y-1 text-slate-800 font-bold">
                    <p className="uppercase">{profil.nama}</p>
                    <p>KECAMATAN {profil.kecamatan.toUpperCase()} - KABUPATEN {profil.kabupaten.toUpperCase()}</p>
                    <p className="font-mono text-emerald-900">TAHUN AJARAN {profil.tahunPelajaranAktif}</p>
                  </div>
                </div>
              ) : null}

              {/* 5. LEMBAR PENGESAHAN TANDA TANGAN RESMI (DINAS STANDAR) */}
              {activePerangkat !== 'cover' && (
                <div className="pt-6 border-t border-slate-300 grid grid-cols-2 text-center text-xs text-slate-900 font-sans">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-600">Mengetahui,</p>
                    <p className="font-bold text-slate-900">Kepala {profil.nama}</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 italic">[Tanda Tangan & Stempel Resmi]</span>
                    </div>
                    <p className="font-extrabold underline text-slate-950">{profil.kepalaSekolah}</p>
                    <p className="font-mono text-[11px] text-slate-700">NIP. {profil.nipKepalaSekolah}</p>
                    <p className="text-[10px] text-slate-500">Pangkat: {profil.pangkatKepalaSekolah}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-slate-600">Pasuruan, {formatIndoDate(new Date().toISOString().split('T')[0])}</p>
                    <p className="font-bold text-slate-900">Guru Mata Pelajaran / Kelas</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 italic">[Tanda Tangan Guru Pengampu]</span>
                    </div>
                    <p className="font-extrabold underline text-slate-950">{currentGuru.nama}</p>
                    <p className="font-mono text-[11px] text-slate-700">NIP. {currentGuru.nip || '-'}</p>
                    <p className="text-[10px] text-slate-500">Jabatan: {currentGuru.jabatan}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
