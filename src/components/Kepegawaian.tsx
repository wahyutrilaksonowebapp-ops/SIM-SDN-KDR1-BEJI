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
  Eye
} from 'lucide-react';
import { formatIndoDate } from '../utils/helpers';
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

  // ASN Pegawai List (PNS & PPPK)
  const asnList = pegawai.filter((p) => {
    const isAsn = p.statusKepegawaian === 'PNS' || p.statusKepegawaian === 'PPPK';
    if (!isAsn) return false;
    if (filterAsnType === 'PNS') return p.statusKepegawaian === 'PNS';
    if (filterAsnType === 'PPPK') return p.statusKepegawaian === 'PPPK';
    return true;
  });

  // General Filter
  const filtered = pegawai.filter((p) => {
    const matchSearch =
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.statusKepegawaian === statusFilter;
    return matchSearch && matchStatus;
  });

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingPegawai(null);
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
      tmt: new Date().toISOString().split('T')[0],
      statusKepegawaian: 'PNS',
      pendidikanTerakhir: 'S1 PGSD',
      tempatLahir: 'Pasuruan',
      tanggalLahir: '1990-01-01',
      mkgTahun: 0,
      mkgBulan: 0,
      karpeg: '',
      nomorTaspen: '',
      npwp: '',
      unitKerja: 'SDN Kedungringin 1 Beji',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Pegawai) => {
    setEditingPegawai(p);
    setFormData({ ...p });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.jabatan) {
      setFormError('Nama dan Jabatan wajib diisi!');
      return;
    }
    setFormError(null);

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
      unitKerja: formData.unitKerja || 'SDN Kedungringin 1 Beji',
      skPangkatTerakhir: formData.skPangkatTerakhir || editingPegawai?.skPangkatTerakhir,
      skBerkalaTerakhir: formData.skBerkalaTerakhir || editingPegawai?.skBerkalaTerakhir,
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
          <span>1. Direktori GTK</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 text-slate-800">
            {pegawai.length}
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
      {/* TAB 1: DIREKTORI PEGAWAI & GTK */}
      {/* ========================================================================= */}
      {activeTab === 'daftar' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari NIP, nama guru, atau jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">Semua Status ({pegawai.length})</option>
                <option value="PNS">PNS ({pegawai.filter(p => p.statusKepegawaian === 'PNS').length})</option>
                <option value="PPPK">PPPK ({pegawai.filter(p => p.statusKepegawaian === 'PPPK').length})</option>
                <option value="GTT">GTT ({pegawai.filter(p => p.statusKepegawaian === 'GTT').length})</option>
                <option value="PTT">PTT ({pegawai.filter(p => p.statusKepegawaian === 'PTT').length})</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        item.statusKepegawaian === 'PNS'
                          ? 'bg-blue-100 text-blue-800'
                          : item.statusKepegawaian === 'PPPK'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.statusKepegawaian}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {item.golongan}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {item.gelarDepan ? `${item.gelarDepan} ` : ''}
                    {item.nama}
                    {item.gelarBelakang ? `, ${item.gelarBelakang}` : ''}
                  </h3>

                  <p className="text-xs font-medium text-emerald-800 mt-0.5">
                    {item.jabatan}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px] font-semibold text-slate-800">
                        NIP: {item.nip}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        TMT: {formatIndoDate(item.tmt)}
                        {item.mkgTahun !== undefined && (
                          <strong className="text-slate-800 ml-1.5 font-mono">
                            (MKG: {item.mkgTahun} Th {item.mkgBulan ?? 0} Bln)
                          </strong>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.pendidikanTerakhir}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.kontak}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.email}</span>
                    </div>
                  </div>
                </div>

                {userRole === 'admin' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Data Pegawai"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(item.id);
                        setDeletingName(item.nama);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Pegawai"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
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
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-2.5">Pangkat / Gol.</th>
                    <th className="py-2.5 px-3 bg-blue-50/70 text-blue-950">SK Tingkat (Pangkat) Terakhir</th>
                    <th className="py-2.5 px-3 bg-amber-50/70 text-amber-950">SK Berkala (KGB) Terakhir</th>
                    <th className="py-2.5 px-2 text-center">Masa Kerja (MKG)</th>
                    <th className="py-2.5 px-2.5">Pendidikan & Tgl Lahir</th>
                    <th className="py-2.5 px-2 text-center">TMT KGB Berikutnya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {asnList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
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

                      {/* Status */}
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            item.statusKepegawaian === 'PNS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
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
                      <td className="py-3 px-3 bg-blue-50/30">
                        {item.skPangkatTerakhir ? (
                          <div className="space-y-0.5 text-[10px]">
                            <div className="font-mono font-bold text-blue-950 truncate max-w-[170px]" title={item.skPangkatTerakhir.nomor}>
                              No: {item.skPangkatTerakhir.nomor}
                            </div>
                            <div className="text-slate-600">
                              Tgl SK: {formatIndoDate(item.skPangkatTerakhir.tanggal)}
                            </div>
                            <div className="text-blue-900 font-semibold">
                              TMT Pangkat: <strong>{formatIndoDate(item.skPangkatTerakhir.tmt)}</strong>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Belum Ada SK</span>
                        )}
                      </td>

                      {/* SK Berkala (KGB) Terakhir */}
                      <td className="py-3 px-3 bg-amber-50/30">
                        {item.skBerkalaTerakhir ? (
                          <div className="space-y-0.5 text-[10px]">
                            <div className="font-mono font-bold text-amber-950 truncate max-w-[170px]" title={item.skBerkalaTerakhir.nomor}>
                              No: {item.skBerkalaTerakhir.nomor}
                            </div>
                            <div className="text-slate-600">
                              TMT KGB: <strong>{formatIndoDate(item.skBerkalaTerakhir.tmt)}</strong>
                            </div>
                            <div className="text-emerald-800 font-bold font-mono">
                              Gapok: Rp {item.skBerkalaTerakhir.gajiPokok.toLocaleString('id-ID')}
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
                      <td className="py-3 px-2 text-center font-mono font-bold text-purple-900 text-[10px]">
                        {item.skBerkalaTerakhir?.tmtBerikutnya ? formatIndoDate(item.skBerkalaTerakhir.tmtBerikutnya) : '-'}
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
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 border border-slate-200 my-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingPegawai ? 'Edit Data Pegawai & ASN' : 'Tambah Pegawai / GTK Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap (tanpa gelar)</label>
                  <input
                    type="text"
                    required
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                    placeholder="Contoh: Siti Fatimah"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIP (18 Digit untuk ASN)</label>
                  <input
                    type="text"
                    value={formData.nip || ''}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-medium"
                    placeholder="19740512 199803 2 004 atau '-'"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gelar Depan</label>
                  <input
                    type="text"
                    value={formData.gelarDepan || ''}
                    onChange={(e) => setFormData({ ...formData, gelarDepan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="Drs. / Hj."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gelar Belakang</label>
                  <input
                    type="text"
                    value={formData.gelarBelakang || ''}
                    onChange={(e) => setFormData({ ...formData, gelarBelakang: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="S.Pd., M.Pd."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.statusKepegawaian || 'PNS'}
                    onChange={(e) => setFormData({ ...formData, statusKepegawaian: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK (Pegawai Pemerintah dg Perjanjian Kerja)</option>
                    <option value="GTT">GTT (Guru Tidak Tetap)</option>
                    <option value="PTT">PTT (Pegawai Tidak Tetap / Tendik)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pangkat & Golongan Ruang</label>
                  <input
                    type="text"
                    value={formData.golongan || ''}
                    onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                    placeholder="IV/b (Pembina Tk. I) atau Gol. IX"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jabatan Tugas</label>
                  <input
                    type="text"
                    required
                    value={formData.jabatan || ''}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                    placeholder="Guru Kelas 1 / Kepala Sekolah"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Masa Kerja Golongan (MKG)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={0}
                      value={formData.mkgTahun ?? 0}
                      onChange={(e) => setFormData({ ...formData, mkgTahun: Number(e.target.value) })}
                      className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-center font-mono font-bold"
                      placeholder="Tahun"
                    />
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={formData.mkgBulan ?? 0}
                      onChange={(e) => setFormData({ ...formData, mkgBulan: Number(e.target.value) })}
                      className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-center font-mono font-bold"
                      placeholder="Bulan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={formData.pendidikanTerakhir || ''}
                    onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="S1 PGSD / S1 Pendidikan Jasmani"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">TMT Awal Masuk</label>
                  <input
                    type="date"
                    value={formData.tmt || '2020-01-01'}
                    onChange={(e) => setFormData({ ...formData, tmt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Data Lanjutan ASN */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                  Data Administrasi ASN (Karpeg & SK Terakhir)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[10px]">Nomor Karpeg</label>
                    <input
                      type="text"
                      value={formData.karpeg || ''}
                      onChange={(e) => setFormData({ ...formData, karpeg: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-mono text-[11px]"
                      placeholder="Contoh: G 049821"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px]">Nomor Taspen</label>
                    <input
                      type="text"
                      value={formData.nomorTaspen || ''}
                      onChange={(e) => setFormData({ ...formData, nomorTaspen: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px]">NPWP</label>
                    <input
                      type="text"
                      value={formData.npwp || ''}
                      onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Data Pegawai</span>
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
