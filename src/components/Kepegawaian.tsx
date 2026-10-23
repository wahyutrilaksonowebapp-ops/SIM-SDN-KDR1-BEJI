import React, { useState } from 'react';
import { 
  Pegawai, 
  ProfilSekolah, 
  UserRole, 
  AuthUser,
  FaceprintPresensi, 
  SkpEKinerja,
  SKPangkat,
  SKBerkala
} from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Edit3, 
  Trash2, 
  X,
  CheckCircle,
  Briefcase,
  FileSpreadsheet,
  ScanFace,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  Filter,
  Sparkles,
  School,
  FileCheck,
  TrendingUp,
  Building,
  UserCheck,
  ShieldAlert,
  Eye,
  RefreshCw,
  FileText
} from 'lucide-react';
import { 
  formatIndoDate, 
  sortPegawaiDUK, 
  calculateAge, 
  calculateNextKgbDate, 
  getKgbStatus, 
  getStatusColorConfig, 
  getJenisKelaminConfig 
} from '../utils/helpers';
import { ConfirmModal } from './ConfirmModal';

interface KepegawaianProps {
  pegawai: Pegawai[];
  profil: ProfilSekolah;
  userRole?: UserRole;
  currentUser?: AuthUser;
  presensiList?: FaceprintPresensi[];
  skpList?: SkpEKinerja[];
  onSavePegawai: (pegawai: Pegawai) => void;
  onDeletePegawai: (id: string) => void;
  onSavePresensi?: (presensi: FaceprintPresensi) => void;
  onSaveSkp?: (skp: SkpEKinerja) => void;
}

type KepegawaianTab = 'daftar' | 'laporan_asn' | 'faceprint' | 'skp_tribulan';

export const Kepegawaian: React.FC<KepegawaianProps> = ({
  pegawai,
  profil,
  userRole = 'admin',
  currentUser,
  presensiList: initialPresensi = [],
  skpList: initialSkp = [],
  onSavePegawai,
  onDeletePegawai,
  onSavePresensi,
  onSaveSkp,
}) => {
  const [activeTab, setActiveTab] = useState<KepegawaianTab>('daftar');

  // Search & Filters for General GTK
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [kgbStatusFilter, setKgbStatusFilter] = useState<'ALL' | 'JATUH_TEMPO' | 'MENDEKATI' | 'AKTIF'>('ALL');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Form State for Pegawai
  const [formData, setFormData] = useState<Partial<Pegawai>>({
    nip: '',
    nama: '',
    gelarDepan: '',
    gelarBelakang: '',
    jenisKelamin: 'L',
    golongan: 'III/a (Penata Muda)',
    pangkat: 'Penata Muda',
    jabatan: 'Guru Kelas',
    kontak: '',
    email: '',
    tmt: '2020-01-01',
    statusKepegawaian: 'PNS',
    pendidikanTerakhir: 'S1 PGSD',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '1990-01-01',
    mkgTahun: 4,
    mkgBulan: 0,
    karpeg: '',
    nomorTaspen: '',
    npwp: '',
    unitKerja: 'SDN Kedungringin 1 Beji',
    skPangkatTerakhir: {
      nomor: '',
      tanggal: '',
      tmt: '',
      masaKerjaTahun: 0,
      masaKerjaBulan: 0,
      gajiPokok: 0,
      pejabatPenetap: '',
    },
    skBerkalaTerakhir: {
      nomor: '',
      tanggal: '',
      tmt: '',
      masaKerjaTahun: 0,
      masaKerjaBulan: 0,
      gajiPokok: 0,
      tmtBerikutnya: '',
      pejabatPenetap: '',
    },
  });

  // State for Laporan Bulanan ASN
  const [bulanLaporan, setBulanLaporan] = useState('Oktober 2024');
  const [filterAsnType, setFilterAsnType] = useState<'ALL' | 'PNS' | 'PPPK'>('ALL');

  // State for Presensi Faceprint
  const [presensiData, setPresensiData] = useState<FaceprintPresensi[]>(initialPresensi);
  const [filterTanggalPresensi, setFilterTanggalPresensi] = useState('2024-10-15');
  const [filterPegawaiPresensi, setFilterPegawaiPresensi] = useState<string>('ALL');
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanPegawaiId, setScanPegawaiId] = useState('');
  const [scanStatus, setScanStatus] = useState<FaceprintPresensi['statusKehadiran']>('Hadir Tepat Waktu');

  // State for SKP Tribulan E-Kinerja
  const [skpData, setSkpData] = useState<SkpEKinerja[]>(initialSkp);
  const [selectedTribulan, setSelectedTribulan] = useState<1 | 2 | 3 | 4>(3);
  const [selectedSkpDetail, setSelectedSkpDetail] = useState<SkpEKinerja | null>(null);
  const [skpModalOpen, setSkpModalOpen] = useState(false);

  // Sync props if changed
  React.useEffect(() => {
    if (initialPresensi.length > 0 && presensiData.length === 0) {
      setPresensiData(initialPresensi);
    }
  }, [initialPresensi]);

  React.useEffect(() => {
    if (initialSkp.length > 0 && skpData.length === 0) {
      setSkpData(initialSkp);
    }
  }, [initialSkp]);

  const [dukViewMode, setDukViewMode] = useState<'table' | 'sk_kgb' | 'card'>('table');

  // Sorted by Official DUK (Daftar Urutan Kepangkatan)
  const allPegawaiDUK = React.useMemo(() => {
    return sortPegawaiDUK(pegawai);
  }, [pegawai]);

  // ASN Pegawai List (PNS & PPPK) sorted by DUK
  const asnList = React.useMemo(() => {
    return allPegawaiDUK.filter((p) => {
      if (userRole === 'guru' && currentUser?.nip) {
        const cleanPNip = p.nip.replace(/[\s\-\.]/g, '');
        const cleanUserNip = currentUser.nip.replace(/[\s\-\.]/g, '');
        if (cleanPNip && cleanUserNip && cleanPNip === cleanUserNip) return true;
        return false;
      }
      const isAsn = p.statusKepegawaian === 'PNS' || p.statusKepegawaian === 'PPPK';
      if (!isAsn) return false;
      if (filterAsnType === 'PNS') return p.statusKepegawaian === 'PNS';
      if (filterAsnType === 'PPPK') return p.statusKepegawaian === 'PPPK';
      return true;
    });
  }, [allPegawaiDUK, userRole, currentUser, filterAsnType]);

  // General Filter (Strictly sorted by DUK: Kepala Sekolah -> Golongan tertinggi -> Non-ASN terbawah -> Usia tertua jika golongan sama)
  const filtered = React.useMemo(() => {
    return allPegawaiDUK.filter((p) => {
      if (userRole === 'guru') {
        const cleanPNip = p.nip.replace(/[\s\-\.]/g, '');
        const cleanUserNip = (currentUser?.nip || '').replace(/[\s\-\.]/g, '');
        if (cleanPNip && cleanUserNip && cleanPNip === cleanUserNip) {
          return true;
        }
        if (currentUser?.name && p.nama.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])) {
          return true;
        }
        return false;
      }

      const matchSearch =
        p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.statusKepegawaian === statusFilter;
      const matchGender = genderFilter === 'ALL' || p.jenisKelamin === genderFilter;
      
      let matchKgb = true;
      if (kgbStatusFilter !== 'ALL') {
        const kgbInfo = getKgbStatus(p.skBerkalaTerakhir?.tmtBerikutnya);
        if (kgbStatusFilter === 'JATUH_TEMPO') matchKgb = kgbInfo.status === 'Jatuh Tempo';
        else if (kgbStatusFilter === 'MENDEKATI') matchKgb = kgbInfo.status === 'Mendekati';
        else if (kgbStatusFilter === 'AKTIF') matchKgb = kgbInfo.status === 'Aktif';
      }

      return matchSearch && matchStatus && matchGender && matchKgb;
    });
  }, [allPegawaiDUK, userRole, currentUser, searchTerm, statusFilter, genderFilter, kgbStatusFilter]);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingPegawai(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      nip: '',
      nama: '',
      gelarDepan: '',
      gelarBelakang: '',
      jenisKelamin: 'L',
      golongan: 'III/a (Penata Muda)',
      pangkat: 'Penata Muda',
      jabatan: 'Guru Kelas',
      kontak: '',
      email: '',
      tmt: today,
      statusKepegawaian: 'PNS',
      pendidikanTerakhir: 'S1 PGSD',
      tempatLahir: 'Pasuruan',
      tanggalLahir: '1990-01-01',
      mkgTahun: 0,
      mkgBulan: 0,
      karpeg: '',
      nomorTaspen: '',
      npwp: '',
      unitKerja: profil.nama || 'SDN Kedungringin 1 Beji',
      skPangkatTerakhir: {
        nomor: '',
        tanggal: today,
        tmt: today,
        masaKerjaTahun: 0,
        masaKerjaBulan: 0,
        gajiPokok: 0,
        pejabatPenetap: 'Bupati Pasuruan',
      },
      skBerkalaTerakhir: {
        nomor: '',
        tanggal: today,
        tmt: today,
        masaKerjaTahun: 0,
        masaKerjaBulan: 0,
        gajiPokok: 0,
        tmtBerikutnya: calculateNextKgbDate(today),
        pejabatPenetap: 'Kepala Dinas Pendidikan Kab. Pasuruan',
      },
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Pegawai) => {
    setEditingPegawai(p);
    const kgbTmt = p.skBerkalaTerakhir?.tmt || p.tmt || '';
    const autoNextKgb = p.skBerkalaTerakhir?.tmtBerikutnya || (kgbTmt ? calculateNextKgbDate(kgbTmt) : '');

    setFormData({
      ...p,
      skPangkatTerakhir: p.skPangkatTerakhir
        ? {
            nomor: p.skPangkatTerakhir.nomor || '',
            tanggal: p.skPangkatTerakhir.tanggal || '',
            tmt: p.skPangkatTerakhir.tmt || '',
            masaKerjaTahun: p.skPangkatTerakhir.masaKerjaTahun ?? p.mkgTahun ?? 0,
            masaKerjaBulan: p.skPangkatTerakhir.masaKerjaBulan ?? p.mkgBulan ?? 0,
            gajiPokok: p.skPangkatTerakhir.gajiPokok ?? 0,
            pejabatPenetap: p.skPangkatTerakhir.pejabatPenetap || '',
          }
        : {
            nomor: '',
            tanggal: '',
            tmt: p.tmt || '',
            masaKerjaTahun: p.mkgTahun ?? 0,
            masaKerjaBulan: p.mkgBulan ?? 0,
            gajiPokok: 0,
            pejabatPenetap: '',
          },
      skBerkalaTerakhir: p.skBerkalaTerakhir
        ? {
            nomor: p.skBerkalaTerakhir.nomor || '',
            tanggal: p.skBerkalaTerakhir.tanggal || '',
            tmt: p.skBerkalaTerakhir.tmt || '',
            masaKerjaTahun: p.skBerkalaTerakhir.masaKerjaTahun ?? p.mkgTahun ?? 0,
            masaKerjaBulan: p.skBerkalaTerakhir.masaKerjaBulan ?? p.mkgBulan ?? 0,
            gajiPokok: p.skBerkalaTerakhir.gajiPokok ?? 0,
            tmtBerikutnya: autoNextKgb,
            pejabatPenetap: p.skBerkalaTerakhir.pejabatPenetap || '',
          }
        : {
            nomor: '',
            tanggal: '',
            tmt: p.tmt || '',
            masaKerjaTahun: p.mkgTahun ?? 0,
            masaKerjaBulan: p.mkgBulan ?? 0,
            gajiPokok: 0,
            tmtBerikutnya: autoNextKgb,
            pejabatPenetap: '',
          },
    });
    setModalOpen(true);
  };

  const handleKgbTmtChange = (newTmt: string) => {
    const autoNext = calculateNextKgbDate(newTmt);
    setFormData((prev) => ({
      ...prev,
      skBerkalaTerakhir: {
        nomor: prev.skBerkalaTerakhir?.nomor || '',
        tanggal: prev.skBerkalaTerakhir?.tanggal || '',
        tmt: newTmt,
        masaKerjaTahun: prev.skBerkalaTerakhir?.masaKerjaTahun ?? prev.mkgTahun ?? 0,
        masaKerjaBulan: prev.skBerkalaTerakhir?.masaKerjaBulan ?? prev.mkgBulan ?? 0,
        gajiPokok: prev.skBerkalaTerakhir?.gajiPokok ?? 0,
        tmtBerikutnya: autoNext,
        pejabatPenetap: prev.skBerkalaTerakhir?.pejabatPenetap || 'Kepala Dinas Pendidikan Kab. Pasuruan',
      },
    }));
  };

  const handleRecalculateKgb = () => {
    const currentTmt = formData.skBerkalaTerakhir?.tmt || formData.tmt || '';
    if (currentTmt) {
      const autoNext = calculateNextKgbDate(currentTmt);
      setFormData((prev) => ({
        ...prev,
        skBerkalaTerakhir: {
          nomor: prev.skBerkalaTerakhir?.nomor || '',
          tanggal: prev.skBerkalaTerakhir?.tanggal || '',
          tmt: currentTmt,
          masaKerjaTahun: prev.skBerkalaTerakhir?.masaKerjaTahun ?? 0,
          masaKerjaBulan: prev.skBerkalaTerakhir?.masaKerjaBulan ?? 0,
          gajiPokok: prev.skBerkalaTerakhir?.gajiPokok ?? 0,
          pejabatPenetap: prev.skBerkalaTerakhir?.pejabatPenetap || '',
          ...prev.skBerkalaTerakhir,
          tmtBerikutnya: autoNext,
        },
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.jabatan) {
      setFormError('Nama dan Jabatan wajib diisi!');
      return;
    }
    setFormError(null);

    const autoKgbNext = formData.skBerkalaTerakhir?.tmt
      ? (formData.skBerkalaTerakhir.tmtBerikutnya || calculateNextKgbDate(formData.skBerkalaTerakhir.tmt))
      : '';

    const payload: Pegawai = {
      id: editingPegawai ? editingPegawai.id : `peg-${Date.now()}`,
      nip: formData.nip || '-',
      nama: formData.nama,
      gelarDepan: formData.gelarDepan || '',
      gelarBelakang: formData.gelarBelakang || '',
      jenisKelamin: (formData.jenisKelamin || 'L') as 'L' | 'P',
      golongan: formData.golongan || '-',
      pangkat: formData.pangkat || '',
      jabatan: formData.jabatan,
      kontak: formData.kontak || '-',
      email: formData.email || '-',
      tmt: formData.tmt || '2020-01-01',
      statusKepegawaian: (formData.statusKepegawaian || 'PNS') as 'PNS' | 'PPPK' | 'GTT' | 'PTT',
      pendidikanTerakhir: formData.pendidikanTerakhir || 'S1',
      tempatLahir: formData.tempatLahir || 'Pasuruan',
      tanggalLahir: formData.tanggalLahir || '1990-01-01',
      mkgTahun: Number(formData.mkgTahun) || 0,
      mkgBulan: Number(formData.mkgBulan) || 0,
      karpeg: formData.karpeg || '',
      nomorTaspen: formData.nomorTaspen || '',
      npwp: formData.npwp || '',
      unitKerja: formData.unitKerja || profil.nama || 'SDN Kedungringin 1 Beji',
      skPangkatTerakhir: formData.skPangkatTerakhir?.nomor || formData.skPangkatTerakhir?.tmt
        ? {
            nomor: formData.skPangkatTerakhir.nomor || '-',
            tanggal: formData.skPangkatTerakhir.tanggal || formData.tmt || '',
            tmt: formData.skPangkatTerakhir.tmt || formData.tmt || '',
            masaKerjaTahun: Number(formData.skPangkatTerakhir.masaKerjaTahun) || Number(formData.mkgTahun) || 0,
            masaKerjaBulan: Number(formData.skPangkatTerakhir.masaKerjaBulan) || Number(formData.mkgBulan) || 0,
            gajiPokok: Number(formData.skPangkatTerakhir.gajiPokok) || 0,
            pejabatPenetap: formData.skPangkatTerakhir.pejabatPenetap || '',
          }
        : editingPegawai?.skPangkatTerakhir,
      skBerkalaTerakhir: formData.skBerkalaTerakhir?.nomor || formData.skBerkalaTerakhir?.tmt
        ? {
            nomor: formData.skBerkalaTerakhir.nomor || '-',
            tanggal: formData.skBerkalaTerakhir.tanggal || formData.tmt || '',
            tmt: formData.skBerkalaTerakhir.tmt || formData.tmt || '',
            masaKerjaTahun: Number(formData.skBerkalaTerakhir.masaKerjaTahun) || Number(formData.mkgTahun) || 0,
            masaKerjaBulan: Number(formData.skBerkalaTerakhir.masaKerjaBulan) || Number(formData.mkgBulan) || 0,
            gajiPokok: Number(formData.skBerkalaTerakhir.gajiPokok) || 0,
            tmtBerikutnya: autoKgbNext,
            pejabatPenetap: formData.skBerkalaTerakhir.pejabatPenetap || '',
          }
        : editingPegawai?.skBerkalaTerakhir,
    };

    onSavePegawai(payload);
    setModalOpen(false);
  };

  // Faceprint Simulation / Add
  const handleSimulateFaceprint = (e: React.FormEvent) => {
    e.preventDefault();
    const peg = pegawai.find((p) => p.id === scanPegawaiId);
    if (!peg) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const isLate = scanStatus === 'Terlambat';
    const newRecord: FaceprintPresensi = {
      id: `fp-${Date.now()}`,
      pegawaiId: peg.id,
      nip: peg.nip,
      nama: `${peg.nama}${peg.gelarBelakang ? ', ' + peg.gelarBelakang : ''}`,
      tanggal: filterTanggalPresensi,
      jamMasuk: isLate ? '07:22:15' : '06:51:30',
      jamPulang: '14:32:00',
      mesinId: 'FP-SDNKDR1-BEJI-01',
      statusKehadiran: scanStatus,
      keterlambatanMenit: isLate ? 7 : 0,
      pulangCepatMenit: 0,
      efektifJamKerja: 7.6,
      verifikasi: 'Face Recognition Biometrik 99.8%',
      lokasiGps: 'SDN Kedungringin 1 Beji (Radius 4m)',
      catatan: 'Scan presensi wajah biometrik otomatis mesin pintu kantor',
    };

    setPresensiData((prev) => [newRecord, ...prev]);
    onSavePresensi?.(newRecord);
    setScanModalOpen(false);
  };

  // Export CSV Handlers
  const handleExportAsnCSV = () => {
    const headers = [
      'No',
      'NIP',
      'Nama Lengkap',
      'Status ASN',
      'Pangkat / Golongan',
      'Jabatan',
      'SK Pangkat Terakhir (No/Tgl/TMT)',
      'SK Berkala Terakhir (No/Tgl/TMT)',
      'Gaji Pokok Berkala (Rp)',
      'TMT Berkala Berikutnya',
      'Masa Kerja Golongan (MKG)',
      'Pendidikan Terakhir',
      'Tempat, Tgl Lahir',
      'Karpeg',
      'Unit Kerja',
    ];

    const rows = asnList.map((p, idx) => [
      idx + 1,
      `"${p.nip}"`,
      `"${p.gelarDepan ? p.gelarDepan + ' ' : ''}${p.nama}${p.gelarBelakang ? ', ' + p.gelarBelakang : ''}"`,
      p.statusKepegawaian,
      `"${p.pangkat || ''} (${p.golongan})"`,
      `"${p.jabatan}"`,
      `"${p.skPangkatTerakhir?.nomor || '-'} / ${p.skPangkatTerakhir?.tanggal || '-'} / TMT: ${p.skPangkatTerakhir?.tmt || '-'}"`,
      `"${p.skBerkalaTerakhir?.nomor || '-'} / ${p.skBerkalaTerakhir?.tanggal || '-'} / TMT: ${p.skBerkalaTerakhir?.tmt || '-'}"`,
      p.skBerkalaTerakhir?.gajiPokok || '-',
      p.skBerkalaTerakhir?.tmtBerikutnya || '-',
      `"${p.mkgTahun ?? 0} Th ${p.mkgBulan ?? 0} Bln"`,
      `"${p.pendidikanTerakhir}"`,
      `"${p.tempatLahir}, ${p.tanggalLahir}"`,
      `"${p.karpeg || '-'}"`,
      `"${p.unitKerja || 'SDN Kedungringin 1 Beji'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Bulanan_ASN_${bulanLaporan.replace(' ', '_')}_SDN_KDR1.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPresensiCSV = () => {
    const headers = [
      'No',
      'Tanggal',
      'Nama Pegawai',
      'NIP',
      'Jam Masuk',
      'Jam Pulang',
      'Status Kehadiran',
      'Keterlambatan (Menit)',
      'Jam Kerja Efektif',
      'Mesin & Verifikasi',
      'Catatan',
    ];

    const rows = presensiData.map((p, idx) => [
      idx + 1,
      p.tanggal,
      `"${p.nama}"`,
      `"${p.nip}"`,
      p.jamMasuk,
      p.jamPulang,
      p.statusKehadiran,
      p.keterlambatanMenit,
      p.efektifJamKerja,
      `"${p.mesinId} - ${p.verifikasi}"`,
      `"${p.catatan || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Presensi_Faceprint_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDUKCSV = () => {
    const headers = [
      'No DUK',
      'Nama Lengkap',
      'NIP',
      'Jenis Kelamin',
      'Status Kepegawaian',
      'Jabatan',
      'Pangkat / Golongan',
      'TMT CPNS/Awal',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Usia',
      'Pendidikan Terakhir',
      'SK Pangkat (No Surat)',
      'SK Pangkat (Tgl Surat)',
      'SK Pangkat (TMT)',
      'SK Pangkat (MKG Th/Bln)',
      'SK Pangkat (Gaji Pokok)',
      'SK Berkala (No Surat)',
      'SK Berkala (Tgl Surat)',
      'SK Berkala (TMT KGB)',
      'SK Berkala (MKG Th/Bln)',
      'SK Berkala (Gaji Pokok)',
      'TMT KGB Berikutnya (2 Thn)',
      'Status Jatuh Tempo KGB',
      'Kontak / HP',
      'Unit Kerja'
    ];

    const rows = filtered.map((p) => {
      const dukIndex = allPegawaiDUK.findIndex((x) => x.id === p.id) + 1;
      const age = calculateAge(p.tanggalLahir, profil.tanggalAcuanUsia);
      const kgbInfo = getKgbStatus(p.skBerkalaTerakhir?.tmtBerikutnya);
      const skPangkat = p.skPangkatTerakhir;
      const skBerkala = p.skBerkalaTerakhir;

      return [
        dukIndex,
        `"${p.gelarDepan ? p.gelarDepan + ' ' : ''}${p.nama}${p.gelarBelakang ? ', ' + p.gelarBelakang : ''}"`,
        `"${p.nip}"`,
        p.jenisKelamin === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)',
        p.statusKepegawaian,
        `"${p.jabatan}"`,
        `"${p.golongan}${p.pangkat ? ' (' + p.pangkat + ')' : ''}"`,
        p.tmt,
        `"${p.tempatLahir}"`,
        p.tanggalLahir,
        `"${age.formatted}"`,
        `"${p.pendidikanTerakhir}"`,
        `"${skPangkat?.nomor || '-'}"`,
        `"${skPangkat?.tanggal || '-'}"`,
        `"${skPangkat?.tmt || '-'}"`,
        `"${skPangkat?.masaKerjaTahun ?? p.mkgTahun ?? 0} Th ${skPangkat?.masaKerjaBulan ?? p.mkgBulan ?? 0} Bln"`,
        skPangkat?.gajiPokok || 0,
        `"${skBerkala?.nomor || '-'}"`,
        `"${skBerkala?.tanggal || '-'}"`,
        `"${skBerkala?.tmt || '-'}"`,
        `"${skBerkala?.masaKerjaTahun ?? p.mkgTahun ?? 0} Th ${skBerkala?.masaKerjaBulan ?? p.mkgBulan ?? 0} Bln"`,
        skBerkala?.gajiPokok || 0,
        `"${skBerkala?.tmtBerikutnya || '-'}"`,
        `"${kgbInfo.label}"`,
        `"${p.kontak}"`,
        `"${p.unitKerja || profil.nama}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DUK_Daftar_Urut_Kepangkatan_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Manajemen Kepegawaian & Kinerja GTK
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Pengelolaan Data Guru & Tenaga Kependidikan, Laporan Bulanan Pegawai ASN (SK Pangkat, SK Berkala, MKG), Presensi Biometrik Faceprint, dan Evaluasi SKP E-Kinerja Tribulan.
          </p>
        </div>

        {userRole === 'admin' && activeTab === 'daftar' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pegawai / GTK</span>
          </button>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveTab('daftar')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'daftar'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{userRole === 'guru' ? '1. Profil & Tugas Guru Kelas' : '1. Direktori GTK'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-800">
            {filtered.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('laporan_asn')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'laporan_asn'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>2. Laporan Bulanan ASN (SK Tingkat & Berkala, MKG)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-900">
            {asnList.length} ASN
          </span>
        </button>

        <button
          onClick={() => setActiveTab('faceprint')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'faceprint'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ScanFace className="w-4 h-4" />
          <span>3. Presensi Kinerja Faceprint</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800">
            Biometrik Wajah
          </span>
        </button>

        <button
          onClick={() => setActiveTab('skp_tribulan')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'skp_tribulan'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>4. Laporan Tribulan SKP E-Kinerja</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-blue-100 text-blue-900">
            Tribulan {selectedTribulan}
          </span>
        </button>
      </div>

      {(userRole === 'guest' || userRole === 'siswa') && (
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs flex items-center gap-2.5">
          <Eye className="w-4 h-4 text-slate-600 shrink-0" />
          <span>
            <strong>Mode Guest:</strong> Anda sedang melihat direktori umum dan statistik profil kepegawaian SDN Kedungringin 1 Beji (Hanya Lihat).
          </span>
        </div>
      )}

      {userRole === 'guru' && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Mode Guru:</strong> Anda dapat melakukan presensi kehadiran faceprint biometrik dan melihat evaluasi SKP E-Kinerja diri Anda ({currentUser?.name}).
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-emerald-700 text-white font-bold rounded-md text-[11px] shrink-0">
            NIP: {currentUser?.nip || '-'}
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DIREKTORI PEGAWAI & GTK (DUK - DAFTAR URUT KEPANGKATAN) */}
      {/* ========================================================================= */}
      {activeTab === 'daftar' && (
        <div className="space-y-4">
          {/* Banner Informasi DUK Resmi */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-800/40">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-sm font-black">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Daftar Urutan Kepangkatan (DUK) Resmi Pegawai & GTK
                  </h3>
                  <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Standar BKN
                  </span>
                  <span className="text-[10px] bg-emerald-700/80 text-emerald-100 font-semibold px-2 py-0.5 rounded-full">
                    Auto-Urut DUK
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-1 leading-relaxed max-w-3xl">
                  Hierarki DUK Otomatis: <strong>Kepala Sekolah</strong> posisi teratas (#1) &rarr; <strong>PNS Golongan IV, III, II, I</strong> &rarr; <strong>PPPK</strong> &rarr; <strong>Non-ASN (GTT/PTT)</strong>. Apabila golongan sama, diprioritaskan berdasarkan <strong>tahun kelahiran tertua</strong> (tanggal lahir lebih awal).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {userRole === 'admin' && (
                <button
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Pegawai</span>
                </button>
              )}
              <button
                onClick={handleExportDUKCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer border border-white/20 shadow-xs"
                title="Unduh DUK Resmi dalam format CSV / Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh DUK (CSV)</span>
              </button>
              <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-emerald-800">
                <button
                  onClick={() => setDukViewMode('table')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dukViewMode === 'table' ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Tabel DUK
                </button>
                <button
                  onClick={() => setDukViewMode('sk_kgb')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    dukViewMode === 'sk_kgb' ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Rekap SK & KGB</span>
                  <span className="text-[9px] px-1 rounded-full bg-emerald-700 text-white font-mono">2 Th</span>
                </button>
                <button
                  onClick={() => setDukViewMode('card')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dukViewMode === 'card' ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Kartu GTK
                </button>
              </div>
            </div>
          </div>

          {/* Indikator Ringkas Jumlah Personil & Pewarnaan Status & Jenis Kelamin */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* PNS */}
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-900 uppercase">PNS</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-black text-blue-950 font-mono">
                  {pegawai.filter((p) => p.statusKepegawaian === 'PNS').length}
                </span>
                <span className="text-[10px] text-blue-800 font-medium">Orang</span>
              </div>
              <span className="text-[9px] text-blue-700 font-semibold mt-0.5">Golongan IV & III</span>
            </div>

            {/* PPPK */}
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-900 uppercase">PPPK</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-black text-emerald-950 font-mono">
                  {pegawai.filter((p) => p.statusKepegawaian === 'PPPK').length}
                </span>
                <span className="text-[10px] text-emerald-800 font-medium">Orang</span>
              </div>
              <span className="text-[9px] text-emerald-700 font-semibold mt-0.5">Ahli Pertama (IX)</span>
            </div>

            {/* Non ASN */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-900 uppercase">Non-ASN</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-black text-amber-950 font-mono">
                  {pegawai.filter((p) => p.statusKepegawaian === 'GTT' || p.statusKepegawaian === 'PTT').length}
                </span>
                <span className="text-[10px] text-amber-800 font-medium">Orang</span>
              </div>
              <span className="text-[9px] text-amber-700 font-semibold mt-0.5">GTT & PTT / Tendik</span>
            </div>

            {/* Laki-laki */}
            <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-sky-900 uppercase">Laki-laki</span>
                <span className="text-xs font-black text-sky-600">♂</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-black text-sky-950 font-mono">
                  {pegawai.filter((p) => p.jenisKelamin === 'L').length}
                </span>
                <span className="text-[10px] text-sky-800 font-medium">Orang</span>
              </div>
              <span className="text-[9px] text-sky-700 font-semibold mt-0.5">Personil Pria</span>
            </div>

            {/* Perempuan */}
            <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-900 uppercase">Perempuan</span>
                <span className="text-xs font-black text-rose-600">♀</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-black text-rose-950 font-mono">
                  {pegawai.filter((p) => p.jenisKelamin === 'P').length}
                </span>
                <span className="text-[10px] text-rose-800 font-medium">Orang</span>
              </div>
              <span className="text-[9px] text-rose-700 font-semibold mt-0.5">Personil Wanita</span>
            </div>

            {/* KGB Jatuh Tempo / Mendekati */}
            <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-900 uppercase">KGB 2-Thn</span>
                <Clock className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-black text-purple-950 font-mono">
                  {pegawai.filter((p) => {
                    const st = getKgbStatus(p.skBerkalaTerakhir?.tmtBerikutnya);
                    return st.status === 'Jatuh Tempo' || st.status === 'Mendekati';
                  }).length}
                </span>
                <span className="text-[10px] text-purple-800 font-medium">Perlu Update</span>
              </div>
              <span className="text-[9px] text-purple-700 font-semibold mt-0.5">Jatuh Tempo / Segera</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari NIP, nama guru, atau jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto text-xs flex-wrap">
              {/* Filter Status Kepegawaian */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="ALL">Semua Status ({pegawai.length})</option>
                  <option value="PNS">PNS ({pegawai.filter((p) => p.statusKepegawaian === 'PNS').length})</option>
                  <option value="PPPK">PPPK ({pegawai.filter((p) => p.statusKepegawaian === 'PPPK').length})</option>
                  <option value="GTT">GTT ({pegawai.filter((p) => p.statusKepegawaian === 'GTT').length})</option>
                  <option value="PTT">PTT ({pegawai.filter((p) => p.statusKepegawaian === 'PTT').length})</option>
                </select>
              </div>

              {/* Filter Jenis Kelamin */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Jenis Kelamin:</span>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="ALL">Semua (L/P)</option>
                  <option value="L">♂ Laki-laki ({pegawai.filter((p) => p.jenisKelamin === 'L').length})</option>
                  <option value="P">♀ Perempuan ({pegawai.filter((p) => p.jenisKelamin === 'P').length})</option>
                </select>
              </div>

              {/* Filter KGB Status (Aktif jika di tab SK/KGB) */}
              {dukViewMode === 'sk_kgb' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">KGB Status:</span>
                  <select
                    value={kgbStatusFilter}
                    onChange={(e) => setKgbStatusFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-purple-50 border border-purple-200 rounded-lg font-bold text-purple-900 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="ALL">Semua KGB</option>
                    <option value="JATUH_TEMPO">Jatuh Tempo!</option>
                    <option value="MENDEKATI">Segera (&lt; 3 Bln)</option>
                    <option value="AKTIF">Aktif</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* TAMPILAN 1: TABEL RESMI DUK BKN */}
          {dukViewMode === 'table' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>Daftar Urutan Kepangkatan (DUK) Tenaga Pendidik & Kependidikan</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    UPT Satuan Pendidikan {profil.nama} — Tahun Ajaran {profil.tahunPelajaranAktif} (Pewarnaan Resmi: PNS Biru, PPPK Hijau, Non-ASN Oranye)
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase">
                  {filtered.length} Personil Terurut DUK
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12 bg-amber-50 text-amber-950">No. DUK</th>
                      <th className="py-2.5 px-3">Nama Pegawai & NIP</th>
                      <th className="py-2.5 px-2.5 text-center">JK</th>
                      <th className="py-2.5 px-2.5 text-center">Status</th>
                      <th className="py-2.5 px-3">Jabatan</th>
                      <th className="py-2.5 px-3 text-center">Pangkat / Gol.</th>
                      <th className="py-2.5 px-3">TMT Gol. / MKG</th>
                      <th className="py-2.5 px-3 bg-blue-50/60 text-blue-950">SK Tingkat (Pangkat)</th>
                      <th className="py-2.5 px-3 bg-emerald-50/60 text-emerald-950">SK Berkala (KGB 2-Thn)</th>
                      <th className="py-2.5 px-3">Tempat, Tgl Lahir (Usia)</th>
                      {userRole === 'admin' && (
                        <th className="py-2.5 px-3 text-center">Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filtered.map((item) => {
                      const dukIndex = allPegawaiDUK.findIndex((x) => x.id === item.id) + 1;
                      const isKepsek = item.jabatan.toLowerCase().includes('kepala sekolah');
                      const ageInfo = calculateAge(item.tanggalLahir, profil.tanggalAcuanUsia);
                      const statusConfig = getStatusColorConfig(item.statusKepegawaian);
                      const genderConfig = getJenisKelaminConfig(item.jenisKelamin);
                      const kgbInfo = getKgbStatus(item.skBerkalaTerakhir?.tmtBerikutnya);

                      return (
                        <tr 
                          key={item.id} 
                          className={`transition-colors ${statusConfig.rowClass} ${
                            isKepsek ? 'bg-amber-50/50 font-medium' : ''
                          }`}
                        >
                          {/* No. DUK */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-extrabold font-mono text-xs ${
                              dukIndex === 1
                                ? 'bg-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-300'
                                : dukIndex <= 3
                                ? 'bg-emerald-700 text-white'
                                : item.statusKepegawaian === 'GTT' || item.statusKepegawaian === 'PTT'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : item.statusKepegawaian === 'PPPK'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-blue-100 text-blue-900 border border-blue-300'
                            }`}>
                              {dukIndex}
                            </span>
                          </td>

                          {/* Nama & NIP */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 flex-wrap">
                              <span>
                                {item.gelarDepan ? `${item.gelarDepan} ` : ''}
                                {item.nama}
                                {item.gelarBelakang ? `, ${item.gelarBelakang}` : ''}
                              </span>
                              {isKepsek && (
                                <span className="text-[9px] bg-amber-200 text-amber-950 font-extrabold px-1.5 py-0.2 rounded-full border border-amber-400">
                                  Kepala Sekolah (#1)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              NIP: {item.nip}
                            </div>
                          </td>

                          {/* Jenis Kelamin Badge */}
                          <td className="py-3 px-2.5 text-center">
                            <span 
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${genderConfig.badgeClass}`}
                              title={`Jenis Kelamin: ${genderConfig.label}`}
                            >
                              <span>{genderConfig.symbol}</span>
                              <span>{genderConfig.shortLabel}</span>
                            </span>
                          </td>

                          {/* Status Kepegawaian Badge */}
                          <td className="py-3 px-2.5 text-center">
                            <span
                              className={`inline-block text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${statusConfig.badgeClass}`}
                              title={statusConfig.label}
                            >
                              {item.statusKepegawaian}
                            </span>
                          </td>

                          {/* Jabatan */}
                          <td className="py-3 px-3 font-medium text-slate-800">
                            {item.jabatan}
                          </td>

                          {/* Golongan */}
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] inline-block">
                              {item.golongan}
                            </span>
                            {item.pangkat && (
                              <div className="text-[9px] text-slate-500 mt-0.5">
                                {item.pangkat}
                              </div>
                            )}
                          </td>

                          {/* TMT Golongan & MKG */}
                          <td className="py-3 px-3 text-slate-700 font-mono text-[10px]">
                            <div>{formatIndoDate(item.tmt)}</div>
                            {item.mkgTahun !== undefined && (
                              <span className="text-slate-500 block text-[9px]">
                                MKG: {item.mkgTahun} Th {item.mkgBulan ?? 0} Bln
                              </span>
                            )}
                          </td>

                          {/* SK Tingkat Terakhir */}
                          <td className="py-3 px-3 bg-blue-50/20 text-[10px]">
                            {item.skPangkatTerakhir?.nomor ? (
                              <div className="space-y-0.5">
                                <div className="font-bold text-blue-950 font-mono truncate max-w-[140px]" title={item.skPangkatTerakhir.nomor}>
                                  No: {item.skPangkatTerakhir.nomor}
                                </div>
                                <div className="text-slate-600">
                                  TMT: {formatIndoDate(item.skPangkatTerakhir.tmt)}
                                </div>
                                {item.skPangkatTerakhir.gajiPokok ? (
                                  <div className="text-blue-900 font-mono font-semibold">
                                    Rp {item.skPangkatTerakhir.gajiPokok.toLocaleString('id-ID')}
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">-</span>
                            )}
                          </td>

                          {/* SK Berkala (KGB) & TMT Berikutnya 2-Tahunan */}
                          <td className="py-3 px-3 bg-emerald-50/20 text-[10px]">
                            {item.skBerkalaTerakhir?.nomor ? (
                              <div className="space-y-0.5">
                                <div className="font-bold text-emerald-950 font-mono truncate max-w-[140px]" title={item.skBerkalaTerakhir.nomor}>
                                  No: {item.skBerkalaTerakhir.nomor}
                                </div>
                                <div className="text-slate-600">
                                  TMT: {formatIndoDate(item.skBerkalaTerakhir.tmt)}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[9px] text-slate-500">Berikutnya (2 Thn):</span>
                                  <span className={`px-1.5 py-0.2 rounded font-bold font-mono text-[9px] ${kgbInfo.badgeClass}`}>
                                    {item.skBerkalaTerakhir.tmtBerikutnya ? formatIndoDate(item.skBerkalaTerakhir.tmtBerikutnya) : '-'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">-</span>
                            )}
                          </td>

                          {/* Tempat, Tgl Lahir (Usia) */}
                          <td className="py-3 px-3 text-slate-700">
                            <div>{item.tempatLahir}, {formatIndoDate(item.tanggalLahir)}</div>
                            <span className="text-[10px] text-emerald-800 font-semibold font-mono">
                              {ageInfo.formatted}
                            </span>
                          </td>

                          {/* Aksi */}
                          {userRole === 'admin' && (
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Data Pegawai & Update SK"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingId(item.id);
                                    setDeletingName(item.nama);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Pegawai"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAMPILAN 2: REKAPITULASI KHUSUS UPDATE SK TINGKAT & SK BERKALA (KGB 2 TAHUNAN) */}
          {dukViewMode === 'sk_kgb' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50/40 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>Rekapitulasi Administrasi SK Tingkat & Kenaikan Gaji Berkala (KGB 2 Tahunan)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Monitoring Jatuh Tempo KGB Berikutnya dihitung otomatis 2 tahunan dari TMT Berkala terakhir (Berdasarkan PP Gaji ASN & Perka BKN).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full uppercase border border-emerald-300">
                    Otomatis 2-Tahunan
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12 bg-amber-50 text-amber-950">No. DUK</th>
                      <th className="py-2.5 px-3">Pegawai / GTK</th>
                      <th className="py-2.5 px-2.5 text-center">JK</th>
                      <th className="py-2.5 px-2.5 text-center">Status</th>
                      <th className="py-2.5 px-3 bg-blue-50/70 text-blue-950">
                        SK Tingkat (Pangkat) Terakhir
                      </th>
                      <th className="py-2.5 px-3 bg-emerald-50/70 text-emerald-950">
                        SK Berkala (KGB) Terakhir
                      </th>
                      <th className="py-2.5 px-3 bg-purple-50/70 text-purple-950 text-center">
                        TMT KGB Berikutnya (2 Thn)
                      </th>
                      <th className="py-2.5 px-3 text-center">Status Jatuh Tempo</th>
                      {userRole === 'admin' && (
                        <th className="py-2.5 px-3 text-center">Aksi Update</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filtered.map((item) => {
                      const dukIndex = allPegawaiDUK.findIndex((x) => x.id === item.id) + 1;
                      const statusConfig = getStatusColorConfig(item.statusKepegawaian);
                      const genderConfig = getJenisKelaminConfig(item.jenisKelamin);
                      const kgbInfo = getKgbStatus(item.skBerkalaTerakhir?.tmtBerikutnya);

                      return (
                        <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${statusConfig.rowClass}`}>
                          {/* No DUK */}
                          <td className="py-3 px-3 text-center font-bold font-mono text-slate-800">
                            {dukIndex}
                          </td>

                          {/* Pegawai */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 text-xs">
                              {item.gelarDepan ? `${item.gelarDepan} ` : ''}
                              {item.nama}
                              {item.gelarBelakang ? `, ${item.gelarBelakang}` : ''}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 font-semibold">
                              NIP. {item.nip}
                            </div>
                            <div className="text-[10px] text-emerald-800 font-medium">
                              {item.jabatan} &bull; <span className="font-mono">{item.golongan}</span>
                            </div>
                          </td>

                          {/* JK */}
                          <td className="py-3 px-2.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${genderConfig.badgeClass}`}>
                              <span>{genderConfig.symbol}</span>
                              <span>{genderConfig.shortLabel}</span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${statusConfig.badgeClass}`}>
                              {item.statusKepegawaian}
                            </span>
                          </td>

                          {/* SK Tingkat Terakhir */}
                          <td className="py-3 px-3 bg-blue-50/20">
                            {item.skPangkatTerakhir?.nomor ? (
                              <div className="space-y-1">
                                <div className="font-mono font-bold text-blue-950 truncate max-w-[180px]" title={item.skPangkatTerakhir.nomor}>
                                  No: {item.skPangkatTerakhir.nomor}
                                </div>
                                <div className="text-slate-600 text-[10px]">
                                  Tgl SK: {formatIndoDate(item.skPangkatTerakhir.tanggal)}
                                </div>
                                <div className="text-blue-900 font-semibold text-[10px]">
                                  TMT: {formatIndoDate(item.skPangkatTerakhir.tmt)}
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-blue-100 pt-0.5">
                                  <span>MKG: {item.skPangkatTerakhir.masaKerjaTahun ?? 0} Th {item.skPangkatTerakhir.masaKerjaBulan ?? 0} Bln</span>
                                  {item.skPangkatTerakhir.gajiPokok ? (
                                    <span className="font-mono font-bold text-blue-950">
                                      Rp {item.skPangkatTerakhir.gajiPokok.toLocaleString('id-ID')}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">Belum ada data SK Pangkat</span>
                            )}
                          </td>

                          {/* SK Berkala (KGB) Terakhir */}
                          <td className="py-3 px-3 bg-emerald-50/20">
                            {item.skBerkalaTerakhir?.nomor ? (
                              <div className="space-y-1">
                                <div className="font-mono font-bold text-emerald-950 truncate max-w-[180px]" title={item.skBerkalaTerakhir.nomor}>
                                  No: {item.skBerkalaTerakhir.nomor}
                                </div>
                                <div className="text-slate-600 text-[10px]">
                                  Tgl SK: {formatIndoDate(item.skBerkalaTerakhir.tanggal)}
                                </div>
                                <div className="text-emerald-900 font-semibold text-[10px]">
                                  TMT KGB: {formatIndoDate(item.skBerkalaTerakhir.tmt)}
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-emerald-100 pt-0.5">
                                  <span>MKG: {item.skBerkalaTerakhir.masaKerjaTahun ?? 0} Th {item.skBerkalaTerakhir.masaKerjaBulan ?? 0} Bln</span>
                                  <span className="font-mono font-bold text-emerald-900">
                                    Rp {(item.skBerkalaTerakhir.gajiPokok || 0).toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">Belum ada data SK Berkala</span>
                            )}
                          </td>

                          {/* TMT KGB Berikutnya */}
                          <td className="py-3 px-3 bg-purple-50/20 text-center font-mono">
                            {item.skBerkalaTerakhir?.tmtBerikutnya ? (
                              <div>
                                <div className="font-bold text-xs text-purple-950">
                                  {formatIndoDate(item.skBerkalaTerakhir.tmtBerikutnya)}
                                </div>
                                <div className="text-[9px] text-purple-700 mt-0.5 font-sans font-semibold">
                                  (+2 Tahun dari TMT)
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>

                          {/* Status KGB */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] ${kgbInfo.badgeClass}`}>
                              {kgbInfo.label}
                            </span>
                          </td>

                          {/* Aksi Update */}
                          {userRole === 'admin' && (
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Update SK</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAMPILAN 3: KARTU GRID GTK DENGAN LENCANA DUK & PEWARNAAN STATUS & JK */}
          {dukViewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => {
                const dukIndex = allPegawaiDUK.findIndex((x) => x.id === item.id) + 1;
                const isKepsek = item.jabatan.toLowerCase().includes('kepala sekolah');
                const ageInfo = calculateAge(item.tanggalLahir, profil.tanggalAcuanUsia);
                const statusConfig = getStatusColorConfig(item.statusKepegawaian);
                const genderConfig = getJenisKelaminConfig(item.jenisKelamin);
                const kgbInfo = getKgbStatus(item.skBerkalaTerakhir?.tmtBerikutnya);

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border shadow-xs transition-all flex flex-col justify-between overflow-hidden ${
                      isKepsek 
                        ? 'border-amber-300 ring-2 ring-amber-100 hover:border-amber-400 shadow-md' 
                        : `${statusConfig.cardBorderClass} hover:shadow-md`
                    }`}
                  >
                    {/* Top Color Bar according to Status */}
                    <div className={`h-1.5 w-full ${statusConfig.accentBarClass}`} />

                    <div className="p-5 flex-1">
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                              dukIndex === 1
                                ? 'bg-amber-400 text-amber-950 shadow-xs ring-1 ring-amber-400'
                                : dukIndex <= 3
                                ? 'bg-emerald-800 text-white'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            DUK #{dukIndex}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${statusConfig.badgeClass}`}
                          >
                            {item.statusKepegawaian}
                          </span>
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] ${genderConfig.badgeClass}`}
                          >
                            <span>{genderConfig.symbol}</span>
                            <span>{genderConfig.shortLabel}</span>
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.golongan}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {item.gelarDepan ? `${item.gelarDepan} ` : ''}
                        {item.nama}
                        {item.gelarBelakang ? `, ${item.gelarBelakang}` : ''}
                      </h3>

                      <p className="text-xs font-semibold text-emerald-800 mt-0.5 flex items-center gap-1">
                        {item.jabatan}
                        {isKepsek && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 rounded border border-amber-300">
                            Kepala Sekolah
                          </span>
                        )}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px] font-semibold text-slate-800">
                            NIP: {item.nip}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            Lahir: {item.tempatLahir}, {formatIndoDate(item.tanggalLahir)}{' '}
                            <strong className="text-emerald-800 font-mono">({ageInfo.formatted})</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            TMT: {formatIndoDate(item.tmt)}
                            {item.mkgTahun !== undefined && (
                              <strong className="text-slate-800 ml-1 font-mono">
                                (MKG: {item.mkgTahun} Th {item.mkgBulan ?? 0} Bln)
                              </strong>
                            )}
                          </span>
                        </div>

                        {/* SK Tingkat Mini Box */}
                        {item.skPangkatTerakhir?.nomor && (
                          <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-200/60 text-[10px] space-y-0.5">
                            <div className="flex items-center justify-between text-blue-900 font-bold">
                              <span>SK Tingkat (Pangkat)</span>
                              <span className="font-mono">{item.skPangkatTerakhir.tmt}</span>
                            </div>
                            <div className="text-slate-600 truncate" title={item.skPangkatTerakhir.nomor}>
                              No: {item.skPangkatTerakhir.nomor}
                            </div>
                            {item.skPangkatTerakhir.gajiPokok ? (
                              <div className="text-blue-950 font-mono font-semibold">
                                Gapok: Rp {item.skPangkatTerakhir.gajiPokok.toLocaleString('id-ID')}
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* SK Berkala Mini Box with 2-year Next Date */}
                        {item.skBerkalaTerakhir?.nomor && (
                          <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-[10px] space-y-0.5">
                            <div className="flex items-center justify-between text-emerald-900 font-bold">
                              <span>SK Berkala (KGB)</span>
                              <span className={`px-1.5 rounded-full text-[9px] ${kgbInfo.badgeClass}`}>
                                {kgbInfo.label}
                              </span>
                            </div>
                            <div className="text-slate-600 truncate" title={item.skBerkalaTerakhir.nomor}>
                              No: {item.skBerkalaTerakhir.nomor}
                            </div>
                            <div className="flex items-center justify-between text-[10px] pt-0.5">
                              <span className="text-emerald-950 font-mono font-semibold">
                                Rp {(item.skBerkalaTerakhir.gajiPokok || 0).toLocaleString('id-ID')}
                              </span>
                              <span className="text-purple-900 font-mono font-bold">
                                Next: {item.skBerkalaTerakhir.tmtBerikutnya ? formatIndoDate(item.skBerkalaTerakhir.tmtBerikutnya) : '-'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {userRole === 'admin' && (
                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="Edit Data Pegawai & SK"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit & Update SK</span>
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(item.id);
                            setDeletingName(item.nama);
                          }}
                          className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Pegawai"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LAPORAN BULANAN ASN (SK TINGKAT, SK BERKALA, MKG, DLL) */}
      {/* ========================================================================= */}
      {activeTab === 'laporan_asn' && (
        <div className="space-y-4">
          {/* Filter & Action Header */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Periode Laporan:</span>
                <select
                  value={bulanLaporan}
                  onChange={(e) => setBulanLaporan(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Oktober 2024">Oktober 2024 (Aktif)</option>
                  <option value="November 2024">November 2024</option>
                  <option value="Desember 2024">Desember 2024</option>
                  <option value="Januari 2025">Januari 2025</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Filter ASN:</span>
                <select
                  value={filterAsnType}
                  onChange={(e) => setFilterAsnType(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="ALL">Semua ASN (PNS & PPPK)</option>
                  <option value="PNS">PNS Saja</option>
                  <option value="PPPK">PPPK Saja</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAsnCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV</span>
              </button>

              <button
                onClick={handlePrintDocument}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Format BKN / Dinas (A4)</span>
              </button>
            </div>
          </div>

          {/* Ringkasan Indikator Kepegawaian ASN */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Pegawai ASN</div>
              <div className="text-xl font-extrabold text-emerald-900 mt-1 font-mono">{asnList.length} Orang</div>
              <div className="text-[10px] text-slate-600 mt-0.5">PNS: {asnList.filter(p => p.statusKepegawaian === 'PNS').length} | PPPK: {asnList.filter(p => p.statusKepegawaian === 'PPPK').length}</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Golongan Pembina (IV)</div>
              <div className="text-xl font-extrabold text-blue-900 mt-1 font-mono">
                {asnList.filter(p => p.golongan.startsWith('IV')).length} Orang
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">Kepala Sekolah & Guru Senior</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Golongan Penata (III)</div>
              <div className="text-xl font-extrabold text-purple-900 mt-1 font-mono">
                {asnList.filter(p => p.golongan.startsWith('III')).length} Orang
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">Guru Kelas Jenjang 4, 5, 6</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">PPPK Ahli Pertama (IX)</div>
              <div className="text-xl font-extrabold text-amber-900 mt-1 font-mono">
                {asnList.filter(p => p.statusKepegawaian === 'PPPK').length} Orang
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">Pendidik Formasi 2022-2024</div>
            </div>
          </div>

          {/* TABEL LAPORAN BULANAN PEGAWAI ASN */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Daftar Keadaan Pegawai ASN Bulan {bulanLaporan}</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  UPT Satuan Pendidikan SDN Kedungringin 1 Beji - Korwil Beji Kab. Pasuruan
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                Standar BKN & Kemdikbud
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-2 text-center w-8">No</th>
                    <th className="py-2.5 px-3">Nama Pegawai & NIP</th>
                    <th className="py-2.5 px-2 text-center">JK</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-2.5">Pangkat / Gol.</th>
                    <th className="py-2.5 px-3 bg-blue-50/70 text-blue-950">SK Tingkat (Pangkat) Terakhir</th>
                    <th className="py-2.5 px-3 bg-emerald-50/70 text-emerald-950">SK Berkala (KGB) Terakhir</th>
                    <th className="py-2.5 px-2 text-center">Masa Kerja (MKG)</th>
                    <th className="py-2.5 px-2.5">Pendidikan & Tgl Lahir</th>
                    <th className="py-2.5 px-2 text-center">TMT KGB Berikutnya (2 Thn)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {asnList.map((item, idx) => {
                    const statusConfig = getStatusColorConfig(item.statusKepegawaian);
                    const genderConfig = getJenisKelaminConfig(item.jenisKelamin);
                    const kgbInfo = getKgbStatus(item.skBerkalaTerakhir?.tmtBerikutnya);

                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${statusConfig.rowClass}`}>
                        <td className="py-3 px-2 text-center font-bold text-slate-500">{idx + 1}</td>
                        
                        {/* Nama & NIP */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 text-xs">
                            {item.gelarDepan ? `${item.gelarDepan} ` : ''}
                            {item.nama}
                            {item.gelarBelakang ? `, ${item.gelarBelakang}` : ''}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 font-semibold">
                            NIP. {item.nip}
                          </div>
                          <div className="text-[10px] text-emerald-800 font-medium">
                            {item.jabatan}
                          </div>
                        </td>

                        {/* Jenis Kelamin Badge */}
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${genderConfig.badgeClass}`}>
                            <span>{genderConfig.symbol}</span>
                            <span>{genderConfig.shortLabel}</span>
                          </span>
                        </td>

                        {/* Status ASN Badge */}
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${statusConfig.badgeClass}`}>
                            {item.statusKepegawaian}
                          </span>
                        </td>

                        {/* Pangkat & Golongan */}
                        <td className="py-3 px-2.5">
                          <div className="font-bold text-slate-900">{item.pangkat || '-'}</div>
                          <div className="font-mono text-[10px] text-slate-600 font-semibold">{item.golongan}</div>
                          {item.karpeg && (
                            <div className="text-[9px] text-slate-400 font-mono">Karpeg: {item.karpeg}</div>
                          )}
                        </td>

                        {/* SK Pangkat Terakhir */}
                        <td className="py-3 px-3 bg-blue-50/20">
                          {item.skPangkatTerakhir?.nomor ? (
                            <div className="space-y-0.5 text-[10px]">
                              <div className="font-mono font-bold text-blue-950 truncate max-w-[170px]" title={item.skPangkatTerakhir.nomor}>
                                No: {item.skPangkatTerakhir.nomor}
                              </div>
                              <div className="text-slate-600">
                                Tgl SK: {formatIndoDate(item.skPangkatTerakhir.tanggal)}
                              </div>
                              <div className="text-blue-900 font-semibold">
                                TMT: <strong>{formatIndoDate(item.skPangkatTerakhir.tmt)}</strong>
                              </div>
                              {item.skPangkatTerakhir.gajiPokok ? (
                                <div className="text-blue-950 font-mono font-bold">
                                  Gapok: Rp {item.skPangkatTerakhir.gajiPokok.toLocaleString('id-ID')}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Belum Ada SK</span>
                          )}
                        </td>

                        {/* SK Berkala (KGB) Terakhir */}
                        <td className="py-3 px-3 bg-emerald-50/20">
                          {item.skBerkalaTerakhir?.nomor ? (
                            <div className="space-y-0.5 text-[10px]">
                              <div className="font-mono font-bold text-emerald-950 truncate max-w-[170px]" title={item.skBerkalaTerakhir.nomor}>
                                No: {item.skBerkalaTerakhir.nomor}
                              </div>
                              <div className="text-slate-600">
                                TMT KGB: <strong>{formatIndoDate(item.skBerkalaTerakhir.tmt)}</strong>
                              </div>
                              <div className="text-emerald-800 font-bold font-mono">
                                Gapok: Rp {(item.skBerkalaTerakhir.gajiPokok || 0).toLocaleString('id-ID')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Belum Ada KGB</span>
                          )}
                        </td>

                        {/* Masa Kerja Golongan (MKG) */}
                        <td className="py-3 px-2 text-center">
                          <span className="inline-block px-2 py-1 rounded bg-slate-100 font-mono font-extrabold text-slate-900 text-xs">
                            {item.mkgTahun ?? 0} Th {item.mkgBulan ?? 0} Bln
                          </span>
                        </td>

                        {/* Pendidikan & Usia */}
                        <td className="py-3 px-2.5 text-[10px]">
                          <div className="font-semibold text-slate-900">{item.pendidikanTerakhir}</div>
                          <div className="text-slate-500">{item.tempatLahir}, {formatIndoDate(item.tanggalLahir)}</div>
                        </td>

                        {/* TMT KGB Berikutnya */}
                        <td className="py-3 px-2 text-center">
                          <div className="font-mono font-bold text-purple-950 text-xs">
                            {item.skBerkalaTerakhir?.tmtBerikutnya ? formatIndoDate(item.skBerkalaTerakhir.tmtBerikutnya) : '-'}
                          </div>
                          <span className={`inline-block mt-1 px-2 py-0.2 rounded-full text-[9px] font-bold ${kgbInfo.badgeClass}`}>
                            {kgbInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LAPORAN KINERJA PRESENSI FACEPRINT */}
      {/* ========================================================================= */}
      {activeTab === 'faceprint' && (
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Tanggal Presensi:</span>
                <input
                  type="date"
                  value={filterTanggalPresensi}
                  onChange={(e) => setFilterTanggalPresensi(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span>Filter Pegawai:</span>
                <select
                  value={filterPegawaiPresensi}
                  onChange={(e) => setFilterPegawaiPresensi(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="ALL">Seluruh Pegawai ({presensiData.length})</option>
                  {pegawai.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    setScanPegawaiId(pegawai[0]?.id || '');
                    setScanStatus('Hadir Tepat Waktu');
                    setScanModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <ScanFace className="w-3.5 h-3.5" />
                  <span>Simulasi Scan Faceprint</span>
                </button>
              )}

              <button
                onClick={handleExportPresensiCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={handlePrintDocument}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Rekap</span>
              </button>
            </div>
          </div>

          {/* Statistik Disiplin Presensi Faceprint */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-between">
                <span>Tingkat Disiplin</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold text-emerald-800 mt-1 font-mono">98.5%</div>
              <div className="text-[10px] text-emerald-700 mt-0.5">Sangat Baik (Bebas Potongan Tukin)</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-between">
                <span>Hadir Tepat Waktu</span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-extrabold text-blue-800 mt-1 font-mono">
                {presensiData.filter(p => p.statusKehadiran === 'Hadir Tepat Waktu').length} Log
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Batas Masuk Pkl 07:15 WIB</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-between">
                <span>Terlambat</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-extrabold text-amber-800 mt-1 font-mono">
                {presensiData.filter(p => p.statusKehadiran === 'Terlambat').length} Pegawai
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Rata-rata 3 Menit (Toleransi)</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-between">
                <span>Rerata Jam Efektif</span>
                <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-extrabold text-purple-800 mt-1 font-mono">7.7 Jam / Hari</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Standar Permendikbud: 37.5 Jam/Mgg</div>
            </div>
          </div>

          {/* TABEL LOG PRESENSI BIOMETRIK FACEPRINT */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ScanFace className="w-4 h-4 text-emerald-700" />
                  <span>Log Rekam Kehadiran Mesin Faceprint (Biometrik Wajah 99.8%)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ID Mesin: FP-SDNKDR1-BEJI-01 | Tanggal: {formatIndoDate(filterTanggalPresensi)}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Mesin Faceprint Aktif & Tersinkron</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-2 text-center w-8">No</th>
                    <th className="py-2.5 px-3">Nama Pegawai & NIP</th>
                    <th className="py-2.5 px-2.5 text-center">Jam Datang</th>
                    <th className="py-2.5 px-2.5 text-center">Jam Pulang</th>
                    <th className="py-2.5 px-3 text-center">Status Kehadiran</th>
                    <th className="py-2.5 px-2 text-center">Terlambat</th>
                    <th className="py-2.5 px-2 text-center">Jam Efektif</th>
                    <th className="py-2.5 px-3">Verifikasi Biometrik & Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {presensiData
                    .filter(p => filterPegawaiPresensi === 'ALL' || p.pegawaiId === filterPegawaiPresensi)
                    .map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-2 text-center font-bold text-slate-500">{idx + 1}</td>
                        
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{item.nama}</div>
                          <div className="text-[10px] font-mono text-slate-500">NIP. {item.nip}</div>
                        </td>

                        <td className="py-3 px-2.5 text-center font-mono font-bold text-emerald-800">
                          {item.jamMasuk}
                        </td>

                        <td className="py-3 px-2.5 text-center font-mono font-bold text-slate-700">
                          {item.jamPulang}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.statusKehadiran === 'Hadir Tepat Waktu'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.statusKehadiran === 'Terlambat'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.statusKehadiran === 'Hadir Tepat Waktu' ? (
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            )}
                            <span>{item.statusKehadiran}</span>
                          </span>
                        </td>

                        <td className="py-3 px-2 text-center font-mono font-semibold">
                          {item.keterlambatanMenit > 0 ? (
                            <span className="text-amber-700 font-bold">+{item.keterlambatanMenit} mnt</span>
                          ) : (
                            <span className="text-slate-400">0 mnt</span>
                          )}
                        </td>

                        <td className="py-3 px-2 text-center font-mono font-bold text-purple-900">
                          {item.efektifJamKerja} Jam
                        </td>

                        <td className="py-3 px-3 text-[10px]">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <ScanFace className="w-3 h-3 text-emerald-700" />
                            <span>{item.verifikasi}</span>
                          </div>
                          {item.catatan && (
                            <div className="text-slate-500 italic mt-0.5">{item.catatan}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LAPORAN TRIBULAN SKP E-KINERJA PEGAWAI (PERMENPAN-RB NO 6 TAHUN 2022) */}
      {/* ========================================================================= */}
      {activeTab === 'skp_tribulan' && (
        <div className="space-y-4">
          {/* Tribulan Selector & Header Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Periode Evaluasi:
              </span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {[1, 2, 3, 4].map((tri) => (
                  <button
                    key={tri}
                    onClick={() => setSelectedTribulan(tri as 1 | 2 | 3 | 4)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTribulan === tri
                        ? 'bg-blue-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tribulan {tri} ({tri === 1 ? 'Jan-Mar' : tri === 2 ? 'Apr-Jun' : tri === 3 ? 'Jul-Sep' : 'Okt-Des'})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintDocument}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Evaluasi SKP</span>
              </button>
            </div>
          </div>

          {/* Cards of Teachers with SKP for this Tribulan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {skpData.map((skp) => (
              <div
                key={skp.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-mono">
                      Tribulan {skp.tribulan} / Tahun {skp.tahun}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>{skp.predikatKinerja}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">
                    {skp.nama}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">NIP. {skp.nip}</p>
                  <p className="text-xs font-medium text-emerald-800 mt-0.5">{skp.jabatan} ({skp.pangkatGolongan})</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Rating Hasil Kerja:</span>
                      <strong className="text-emerald-800 font-bold">{skp.ratingHasilKerja}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Rating Perilaku Kerja:</span>
                      <strong className="text-blue-800 font-bold">{skp.ratingPerilaku}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Pejabat Penilai:</span>
                      <span className="text-slate-800 font-semibold">{skp.pejabatPenilaiNama}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 italic">
                      "{skp.catatanRekomendasi}"
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Nilai: {formatIndoDate(skp.tanggalPenilaian)}
                  </span>
                  <button
                    onClick={() => setSelectedSkpDetail(skp)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Lihat Rincian Kinerja</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal / Sheet: Rincian Target Kinerja & 7 Aspek Perilaku BerAKHLAK */}
          {selectedSkpDetail && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-700" />
                      <span>Formulir Evaluasi Kinerja ASN Periodik (PermenPAN-RB No. 6/2022)</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Pegawai: {selectedSkpDetail.nama} | Periode: Tribulan {selectedSkpDetail.tribulan} ({formatIndoDate(selectedSkpDetail.periodeAwal)} s.d {formatIndoDate(selectedSkpDetail.periodeAkhir)})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSkpDetail(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-6 text-xs">
                  {/* I. HASIL KERJA UTAMA */}
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-xs flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-emerald-700" />
                      <span>A. Hasil Kerja Utama & Realisasi Kinerja Pegawai</span>
                    </h4>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-800">
                          <tr>
                            <th className="py-2.5 px-3">Rencana Hasil Kerja Pimpinan / Intervensi</th>
                            <th className="py-2.5 px-3">Indikator Kinerja Individu</th>
                            <th className="py-2.5 px-2.5 text-center">Target Kuantitas</th>
                            <th className="py-2.5 px-2.5 text-center">Realisasi</th>
                            <th className="py-2.5 px-3">Umpan Balik Berkelanjutan (Feedback)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {selectedSkpDetail.targetKinerja.map((tk) => (
                            <tr key={tk.id}>
                              <td className="py-3 px-3 font-semibold text-slate-900 max-w-[200px]">
                                {tk.rencanaKinerja}
                              </td>
                              <td className="py-3 px-3 text-slate-700 max-w-[200px]">
                                {tk.indikator}
                              </td>
                              <td className="py-3 px-2.5 text-center font-bold font-mono text-slate-800">
                                {tk.targetKuantitas}
                              </td>
                              <td className="py-3 px-2.5 text-center font-bold font-mono text-emerald-800 bg-emerald-50/50">
                                {tk.realisasi}
                              </td>
                              <td className="py-3 px-3 text-[10px] text-slate-600 italic">
                                "{tk.umpanBalik}"
                                <div className="mt-1 font-bold text-emerald-800 not-italic uppercase text-[9px]">
                                  Capaian: {tk.capaian}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* II. PERILAKU KERJA BERAKHLAK */}
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-xs flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-700" />
                      <span>B. Evaluasi Perilaku Kerja Pegawai ASN (Core Values BerAKHLAK)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedSkpDetail.perilakuKerja.map((pk) => (
                        <div key={pk.aspek} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                          <span className="font-bold text-blue-900 text-xs block">
                            {pk.aspek}
                          </span>
                          <p className="text-[11px] text-slate-600">
                            <strong>Ekspektasi Pimpinan:</strong> {pk.ekspektasiPimpinan}
                          </p>
                          <p className="text-[11px] text-emerald-800 italic">
                            <strong>Umpan Balik:</strong> "{pk.umpanBalik}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Predikat Akhir */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                        Predikat Kinerja Pegawai Tribulan {selectedSkpDetail.tribulan}
                      </div>
                      <div className="text-2xl font-black tracking-wide text-white mt-1">
                        {selectedSkpDetail.predikatKinerja}
                      </div>
                      <p className="text-xs text-emerald-200 mt-1">
                        Rating Hasil: {selectedSkpDetail.ratingHasilKerja} | Rating Perilaku: {selectedSkpDetail.ratingPerilaku}
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <p className="text-slate-300">Pejabat Penilai Kinerja:</p>
                      <p className="font-bold text-white text-sm">{selectedSkpDetail.pejabatPenilaiNama}</p>
                      <p className="text-[11px] font-mono text-emerald-300">NIP. {selectedSkpDetail.pejabatPenilaiNip}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setSelectedSkpDetail(null)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Tutup Rincian
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL SIMULASI SCAN FACEPRINT */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-emerald-700" />
                <span>Simulasi Scan Presensi Biometrik Wajah</span>
              </h3>
              <button
                onClick={() => setScanModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulateFaceprint} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pilih Pegawai / GTK</label>
                <select
                  value={scanPegawaiId}
                  onChange={(e) => setScanPegawaiId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  {pegawai.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.statusKepegawaian} - {p.jabatan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status Kehadiran</label>
                <select
                  value={scanStatus}
                  onChange={(e) => setScanStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  <option value="Hadir Tepat Waktu">Hadir Tepat Waktu (06:51 WIB)</option>
                  <option value="Terlambat">Terlambat (07:22 WIB - 7 Menit)</option>
                  <option value="Dinas Luar">Dinas Luar (DL)</option>
                  <option value="Izin">Izin Resmi</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Cuti">Cuti Tahunan</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px] space-y-1">
                <div className="font-bold">Spesifikasi Mesin Faceprint:</div>
                <div>Perangkat: FP-SDNKDR1-BEJI-01 (Kamera AI Wajah Dual-Sensor)</div>
                <div>Akurasi Verifikasi: 99.8% Biometrik Face Recognition</div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScanModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <ScanFace className="w-4 h-4" />
                  <span>Catat Log Presensi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT / EDIT PEGAWAI */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 border border-slate-200 my-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingPegawai ? 'Edit Data Pegawai & Administrasi SK' : 'Tambah Pegawai / GTK Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Lengkapi identitas GTK, update SK Tingkat (Pangkat), serta SK Berkala dengan kalkulasi otomatis 2-tahunan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-5 text-xs">
              {/* BAGIAN 1: IDENTITAS UTAMA GTK */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>1. Identitas Pokok Pegawai & GTK</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Standar DUK BKN</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Nama Lengkap (tanpa gelar) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama || ''}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-emerald-500"
                      placeholder="Contoh: Siti Fatimah"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">NIP (18 Digit untuk ASN)</label>
                    <input
                      type="text"
                      value={formData.nip || ''}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-medium focus:ring-1 focus:ring-emerald-500"
                      placeholder="19740512 199803 2 004 atau '-'"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gelar Depan</label>
                    <input
                      type="text"
                      value={formData.gelarDepan || ''}
                      onChange={(e) => setFormData({ ...formData, gelarDepan: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      placeholder="Drs. / Hj."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gelar Belakang</label>
                    <input
                      type="text"
                      value={formData.gelarBelakang || ''}
                      onChange={(e) => setFormData({ ...formData, gelarBelakang: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      placeholder="S.Pd., M.Pd."
                    />
                  </div>

                  {/* Pilihan Jenis Kelamin (Pewarnaan Sky / Rose) */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Jenis Kelamin (Pewarnaan Khusus)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, jenisKelamin: 'L' })}
                        className={`py-2 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          formData.jenisKelamin === 'L'
                            ? 'bg-sky-100 text-sky-900 border-2 border-sky-500 shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm font-black text-sky-600">♂</span>
                        <span>Laki-laki</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, jenisKelamin: 'P' })}
                        className={`py-2 px-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          formData.jenisKelamin === 'P'
                            ? 'bg-rose-100 text-rose-900 border-2 border-rose-500 shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm font-black text-rose-600">♀</span>
                        <span>Perempuan</span>
                      </button>
                    </div>
                  </div>

                  {/* Pilihan Status Kepegawaian (PNS Biru, PPPK Hijau, Non ASN Oranye) */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Status Kepegawaian (DUK Tier)
                    </label>
                    <select
                      value={formData.statusKepegawaian || 'PNS'}
                      onChange={(e) => setFormData({ ...formData, statusKepegawaian: e.target.value as any })}
                      className={`w-full px-3 py-2 rounded-lg font-bold border ${
                        formData.statusKepegawaian === 'PNS'
                          ? 'bg-blue-50 text-blue-900 border-blue-400'
                          : formData.statusKepegawaian === 'PPPK'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-400'
                          : 'bg-amber-50 text-amber-900 border-amber-400'
                      }`}
                    >
                      <option value="PNS">PNS (Pegawai Negeri Sipil) - Biru</option>
                      <option value="PPPK">PPPK (Perjanjian Kerja) - Hijau</option>
                      <option value="GTT">Non-ASN: GTT (Guru Tidak Tetap) - Oranye</option>
                      <option value="PTT">Non-ASN: PTT (Pegawai Tidak Tetap) - Oranye</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Pangkat & Golongan Ruang
                    </label>
                    <input
                      type="text"
                      value={formData.golongan || ''}
                      onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-emerald-500"
                      placeholder="IV/b (Pembina Tk. I) / Gol. IX"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Jabatan Tugas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.jabatan || ''}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-1 focus:ring-emerald-500"
                      placeholder="Guru Kelas 1 / Kepala Sekolah"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={formData.tempatLahir || ''}
                      onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      placeholder="Pasuruan"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tanggal Lahir (Untuk DUK)</label>
                    <input
                      type="date"
                      value={formData.tanggalLahir || '1990-01-01'}
                      onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">TMT Awal Masuk</label>
                    <input
                      type="date"
                      value={formData.tmt || '2020-01-01'}
                      onChange={(e) => setFormData({ ...formData, tmt: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Pendidikan Terakhir</label>
                    <input
                      type="text"
                      value={formData.pendidikanTerakhir || ''}
                      onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      placeholder="S1 PGSD / S2 Pendidikan"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Kontak / No HP</label>
                    <input
                      type="text"
                      value={formData.kontak || ''}
                      onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      placeholder="0812-3456-7890"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email Resmi / Akun Belajar</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                      placeholder="nama.guru@admin.sd.belajar.id"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 2: UPDATE DATA SK TINGKAT (KENAIKAN PANGKAT) */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      <Award className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-blue-950 text-xs uppercase tracking-wide">
                      2. Update Data SK Tingkat (Kenaikan Pangkat Terakhir)
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold">SK Golongan Terakhir</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-blue-950 font-semibold mb-1">
                      Nomor Surat SK Pangkat
                    </label>
                    <input
                      type="text"
                      value={formData.skPangkatTerakhir?.nomor || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skPangkatTerakhir: {
                            nomor: e.target.value,
                            tanggal: formData.skPangkatTerakhir?.tanggal || '',
                            tmt: formData.skPangkatTerakhir?.tmt || '',
                            masaKerjaTahun: formData.skPangkatTerakhir?.masaKerjaTahun ?? 0,
                            masaKerjaBulan: formData.skPangkatTerakhir?.masaKerjaBulan ?? 0,
                            gajiPokok: formData.skPangkatTerakhir?.gajiPokok ?? 0,
                            pejabatPenetap: formData.skPangkatTerakhir?.pejabatPenetap || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                      placeholder="Contoh: 823.4/1042/424.103/2021"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-950 font-semibold mb-1">
                      Tanggal Surat SK Pangkat
                    </label>
                    <input
                      type="date"
                      value={formData.skPangkatTerakhir?.tanggal || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skPangkatTerakhir: {
                            nomor: formData.skPangkatTerakhir?.nomor || '',
                            tanggal: e.target.value,
                            tmt: formData.skPangkatTerakhir?.tmt || '',
                            masaKerjaTahun: formData.skPangkatTerakhir?.masaKerjaTahun ?? 0,
                            masaKerjaBulan: formData.skPangkatTerakhir?.masaKerjaBulan ?? 0,
                            gajiPokok: formData.skPangkatTerakhir?.gajiPokok ?? 0,
                            pejabatPenetap: formData.skPangkatTerakhir?.pejabatPenetap || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-950 font-semibold mb-1">
                      TMT Pangkat (Terhitung Mulai Tanggal)
                    </label>
                    <input
                      type="date"
                      value={formData.skPangkatTerakhir?.tmt || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skPangkatTerakhir: {
                            nomor: formData.skPangkatTerakhir?.nomor || '',
                            tanggal: formData.skPangkatTerakhir?.tanggal || '',
                            tmt: e.target.value,
                            masaKerjaTahun: formData.skPangkatTerakhir?.masaKerjaTahun ?? 0,
                            masaKerjaBulan: formData.skPangkatTerakhir?.masaKerjaBulan ?? 0,
                            gajiPokok: formData.skPangkatTerakhir?.gajiPokok ?? 0,
                            pejabatPenetap: formData.skPangkatTerakhir?.pejabatPenetap || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-950 font-semibold mb-1">
                      Masa Kerja Golongan (MKG) pada SK
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          value={formData.skPangkatTerakhir?.masaKerjaTahun ?? 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skPangkatTerakhir: {
                                nomor: formData.skPangkatTerakhir?.nomor || '',
                                tanggal: formData.skPangkatTerakhir?.tanggal || '',
                                tmt: formData.skPangkatTerakhir?.tmt || '',
                                masaKerjaTahun: Number(e.target.value),
                                masaKerjaBulan: formData.skPangkatTerakhir?.masaKerjaBulan ?? 0,
                                gajiPokok: formData.skPangkatTerakhir?.gajiPokok ?? 0,
                                pejabatPenetap: formData.skPangkatTerakhir?.pejabatPenetap || '',
                              },
                            })
                          }
                          className="w-full px-2 py-1.5 bg-white border border-blue-300 rounded text-center font-mono font-bold text-xs"
                        />
                        <span className="text-[9px] text-slate-500 block text-center mt-0.5">Tahun</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={11}
                          value={formData.skPangkatTerakhir?.masaKerjaBulan ?? 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skPangkatTerakhir: {
                                nomor: formData.skPangkatTerakhir?.nomor || '',
                                tanggal: formData.skPangkatTerakhir?.tanggal || '',
                                tmt: formData.skPangkatTerakhir?.tmt || '',
                                masaKerjaTahun: formData.skPangkatTerakhir?.masaKerjaTahun ?? 0,
                                masaKerjaBulan: Number(e.target.value),
                                gajiPokok: formData.skPangkatTerakhir?.gajiPokok ?? 0,
                                pejabatPenetap: formData.skPangkatTerakhir?.pejabatPenetap || '',
                              },
                            })
                          }
                          className="w-full px-2 py-1.5 bg-white border border-blue-300 rounded text-center font-mono font-bold text-xs"
                        />
                        <span className="text-[9px] text-slate-500 block text-center mt-0.5">Bulan</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-blue-950 font-semibold mb-1">
                      Gaji Pokok pada SK Pangkat (Rp)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.skPangkatTerakhir?.gajiPokok ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skPangkatTerakhir: {
                            nomor: formData.skPangkatTerakhir?.nomor || '',
                            tanggal: formData.skPangkatTerakhir?.tanggal || '',
                            tmt: formData.skPangkatTerakhir?.tmt || '',
                            masaKerjaTahun: formData.skPangkatTerakhir?.masaKerjaTahun ?? 0,
                            masaKerjaBulan: formData.skPangkatTerakhir?.masaKerjaBulan ?? 0,
                            gajiPokok: Number(e.target.value),
                            pejabatPenetap: formData.skPangkatTerakhir?.pejabatPenetap || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-900 font-mono text-xs font-bold"
                      placeholder="Nominal Rupiah"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-blue-950 font-semibold mb-1">
                      Pejabat Penetap SK Pangkat
                    </label>
                    <input
                      type="text"
                      value={formData.skPangkatTerakhir?.pejabatPenetap || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skPangkatTerakhir: {
                            nomor: formData.skPangkatTerakhir?.nomor || '',
                            tanggal: formData.skPangkatTerakhir?.tanggal || '',
                            tmt: formData.skPangkatTerakhir?.tmt || '',
                            masaKerjaTahun: formData.skPangkatTerakhir?.masaKerjaTahun ?? 0,
                            masaKerjaBulan: formData.skPangkatTerakhir?.masaKerjaBulan ?? 0,
                            gajiPokok: formData.skPangkatTerakhir?.gajiPokok ?? 0,
                            pejabatPenetap: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs"
                      placeholder="Contoh: Bupati Pasuruan / Gubernur Jawa Timur"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 3: UPDATE DATA SK BERKALA (KGB) DENGAN PERHITUNGAN OTOMATIS 2 TAHUNAN */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-emerald-950 text-xs uppercase tracking-wide">
                      3. Update Data SK Berkala (KGB) & Perhitungan Otomatis 2-Tahunan
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Auto-Calculate +2 Thn
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-emerald-950 font-semibold mb-1">
                      Nomor Surat SK Berkala (KGB)
                    </label>
                    <input
                      type="text"
                      value={formData.skBerkalaTerakhir?.nomor || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skBerkalaTerakhir: {
                            nomor: e.target.value,
                            tanggal: formData.skBerkalaTerakhir?.tanggal || '',
                            tmt: formData.skBerkalaTerakhir?.tmt || '',
                            masaKerjaTahun: formData.skBerkalaTerakhir?.masaKerjaTahun ?? 0,
                            masaKerjaBulan: formData.skBerkalaTerakhir?.masaKerjaBulan ?? 0,
                            gajiPokok: formData.skBerkalaTerakhir?.gajiPokok ?? 0,
                            tmtBerikutnya: formData.skBerkalaTerakhir?.tmtBerikutnya || '',
                            pejabatPenetap: formData.skBerkalaTerakhir?.pejabatPenetap || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                      placeholder="Contoh: 822.3/088/424.072/2023"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-950 font-semibold mb-1">
                      Tanggal Surat SK Berkala
                    </label>
                    <input
                      type="date"
                      value={formData.skBerkalaTerakhir?.tanggal || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skBerkalaTerakhir: {
                            nomor: formData.skBerkalaTerakhir?.nomor || '',
                            tanggal: e.target.value,
                            tmt: formData.skBerkalaTerakhir?.tmt || '',
                            masaKerjaTahun: formData.skBerkalaTerakhir?.masaKerjaTahun ?? 0,
                            masaKerjaBulan: formData.skBerkalaTerakhir?.masaKerjaBulan ?? 0,
                            gajiPokok: formData.skBerkalaTerakhir?.gajiPokok ?? 0,
                            tmtBerikutnya: formData.skBerkalaTerakhir?.tmtBerikutnya || '',
                            pejabatPenetap: formData.skBerkalaTerakhir?.pejabatPenetap || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-900 text-xs font-medium"
                    />
                  </div>

                  {/* TMT KGB (Mengubah ini langsung menghitung TMT Berikutnya 2 tahun kemudian) */}
                  <div>
                    <label className="block text-emerald-950 font-semibold mb-1 flex items-center justify-between">
                      <span>TMT Berkala (KGB) Terakhir</span>
                      <span className="text-[10px] text-emerald-700 font-bold">*Trigger +2 Thn</span>
                    </label>
                    <input
                      type="date"
                      value={formData.skBerkalaTerakhir?.tmt || ''}
                      onChange={(e) => handleKgbTmtChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border-2 border-emerald-400 rounded-lg text-slate-900 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Masa Kerja Golongan pada KGB */}
                  <div>
                    <label className="block text-emerald-950 font-semibold mb-1">
                      Masa Kerja Golongan (MKG) KGB
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          value={formData.skBerkalaTerakhir?.masaKerjaTahun ?? 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skBerkalaTerakhir: {
                                nomor: formData.skBerkalaTerakhir?.nomor || '',
                                tanggal: formData.skBerkalaTerakhir?.tanggal || '',
                                tmt: formData.skBerkalaTerakhir?.tmt || '',
                                masaKerjaTahun: Number(e.target.value),
                                masaKerjaBulan: formData.skBerkalaTerakhir?.masaKerjaBulan ?? 0,
                                gajiPokok: formData.skBerkalaTerakhir?.gajiPokok ?? 0,
                                tmtBerikutnya: formData.skBerkalaTerakhir?.tmtBerikutnya || '',
                                pejabatPenetap: formData.skBerkalaTerakhir?.pejabatPenetap || '',
                              },
                            })
                          }
                          className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded text-center font-mono font-bold text-xs"
                        />
                        <span className="text-[9px] text-slate-500 block text-center mt-0.5">Tahun</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={11}
                          value={formData.skBerkalaTerakhir?.masaKerjaBulan ?? 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skBerkalaTerakhir: {
                                nomor: formData.skBerkalaTerakhir?.nomor || '',
                                tanggal: formData.skBerkalaTerakhir?.tanggal || '',
                                tmt: formData.skBerkalaTerakhir?.tmt || '',
                                masaKerjaTahun: formData.skBerkalaTerakhir?.masaKerjaTahun ?? 0,
                                masaKerjaBulan: Number(e.target.value),
                                gajiPokok: formData.skBerkalaTerakhir?.gajiPokok ?? 0,
                                tmtBerikutnya: formData.skBerkalaTerakhir?.tmtBerikutnya || '',
                                pejabatPenetap: formData.skBerkalaTerakhir?.pejabatPenetap || '',
                              },
                            })
                          }
                          className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded text-center font-mono font-bold text-xs"
                        />
                        <span className="text-[9px] text-slate-500 block text-center mt-0.5">Bulan</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-emerald-950 font-semibold mb-1">
                      Gaji Pokok Baru pada KGB (Rp)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.skBerkalaTerakhir?.gajiPokok ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skBerkalaTerakhir: {
                            nomor: formData.skBerkalaTerakhir?.nomor || '',
                            tanggal: formData.skBerkalaTerakhir?.tanggal || '',
                            tmt: formData.skBerkalaTerakhir?.tmt || '',
                            masaKerjaTahun: formData.skBerkalaTerakhir?.masaKerjaTahun ?? 0,
                            masaKerjaBulan: formData.skBerkalaTerakhir?.masaKerjaBulan ?? 0,
                            gajiPokok: Number(e.target.value),
                            tmtBerikutnya: formData.skBerkalaTerakhir?.tmtBerikutnya || '',
                            pejabatPenetap: formData.skBerkalaTerakhir?.pejabatPenetap || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-900 font-mono text-xs font-bold"
                      placeholder="Nominal Rupiah"
                    />
                  </div>

                  {/* FIELD TMT KGB BERIKUTNYA - DIHITUNG OTOMATIS 2 TAHUNAN */}
                  <div className="sm:col-span-2 lg:col-span-3 p-3 rounded-xl bg-purple-50/80 border-2 border-purple-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-purple-950 font-bold text-xs uppercase tracking-wide">
                            TMT KGB Berikutnya (Perhitungan Otomatis 2 Tahunan)
                          </label>
                          <span className="text-[10px] bg-purple-200 text-purple-900 font-extrabold px-2 py-0.5 rounded-full">
                            Tepat 2 Tahun
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-800 mt-0.5">
                          TMT berikutnya dihitung otomatis dari TMT Berkala ditambah tepat 2 tahun (Contoh: 01/03/2023 &rarr; 01/03/2025).
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRecalculateKgb}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Hitung 2 Tahun Otomatis</span>
                      </button>
                    </div>

                    <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                      <div className="w-full sm:w-64">
                        <input
                          type="date"
                          value={formData.skBerkalaTerakhir?.tmtBerikutnya || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skBerkalaTerakhir: {
                                nomor: formData.skBerkalaTerakhir?.nomor || '',
                                tanggal: formData.skBerkalaTerakhir?.tanggal || '',
                                tmt: formData.skBerkalaTerakhir?.tmt || '',
                                masaKerjaTahun: formData.skBerkalaTerakhir?.masaKerjaTahun ?? 0,
                                masaKerjaBulan: formData.skBerkalaTerakhir?.masaKerjaBulan ?? 0,
                                gajiPokok: formData.skBerkalaTerakhir?.gajiPokok ?? 0,
                                tmtBerikutnya: e.target.value,
                                pejabatPenetap: formData.skBerkalaTerakhir?.pejabatPenetap || '',
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-purple-400 rounded-lg font-mono font-bold text-purple-950 text-xs focus:ring-1 focus:ring-purple-600"
                        />
                      </div>

                      {/* Status pill realtime */}
                      {formData.skBerkalaTerakhir?.tmtBerikutnya && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-600 font-medium">Status Jatuh Tempo:</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getKgbStatus(formData.skBerkalaTerakhir?.tmtBerikutnya).badgeClass}`}>
                            {getKgbStatus(formData.skBerkalaTerakhir?.tmtBerikutnya).label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-emerald-950 font-semibold mb-1">
                      Pejabat Penetap SK Berkala
                    </label>
                    <input
                      type="text"
                      value={formData.skBerkalaTerakhir?.pejabatPenetap || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skBerkalaTerakhir: {
                            nomor: formData.skBerkalaTerakhir?.nomor || '',
                            tanggal: formData.skBerkalaTerakhir?.tanggal || '',
                            tmt: formData.skBerkalaTerakhir?.tmt || '',
                            masaKerjaTahun: formData.skBerkalaTerakhir?.masaKerjaTahun ?? 0,
                            masaKerjaBulan: formData.skBerkalaTerakhir?.masaKerjaBulan ?? 0,
                            gajiPokok: formData.skBerkalaTerakhir?.gajiPokok ?? 0,
                            tmtBerikutnya: formData.skBerkalaTerakhir?.tmtBerikutnya || '',
                            pejabatPenetap: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-900 text-xs"
                      placeholder="Contoh: Kepala Dinas Pendidikan Kab. Pasuruan"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 4: DATA ADMINISTRASI ASN LANJUTAN */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wide block">
                  4. Administrasi Tambahan ASN (Karpeg, Taspen, NPWP, & Unit Kerja)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-600 text-[10px] font-semibold">Nomor Karpeg</label>
                    <input
                      type="text"
                      value={formData.karpeg || ''}
                      onChange={(e) => setFormData({ ...formData, karpeg: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                      placeholder="Contoh: G 049821"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] font-semibold">Nomor Taspen</label>
                    <input
                      type="text"
                      value={formData.nomorTaspen || ''}
                      onChange={(e) => setFormData({ ...formData, nomorTaspen: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                      placeholder="Nomor Taspen Pegawai"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] font-semibold">NPWP</label>
                    <input
                      type="text"
                      value={formData.npwp || ''}
                      onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                      placeholder="08.123.456.7-624.000"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] font-semibold">Unit Kerja</label>
                    <input
                      type="text"
                      value={formData.unitKerja || ''}
                      onChange={(e) => setFormData({ ...formData, unitKerja: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                      placeholder="SDN Kedungringin 1 Beji"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Data & Update SK Pegawai</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Hapus Data Pegawai"
        message={`Apakah Anda yakin ingin menghapus data pegawai "${deletingName}" dari pangkalan data sekolah?`}
        confirmText="Ya, Hapus Pegawai"
        cancelText="Batal"
        variant="danger"
        onConfirm={() => {
          if (deletingId) {
            onDeletePegawai(deletingId);
            setDeletingId(null);
            setDeletingName('');
          }
        }}
        onCancel={() => {
          setDeletingId(null);
          setDeletingName('');
        }}
      />
    </div>
  );
};
