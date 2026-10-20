import React, { useState } from 'react';
import { 
  ProfilSekolah, 
  Pegawai, 
  Siswa, 
  SarprasItem, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ,
  TabType,
  AIInsightData,
  AuthUser
} from '../types';
import { 
  School, 
  Users, 
  GraduationCap, 
  Building2, 
  Sparkles, 
  Award, 
  FileCheck2, 
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Eye,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { generateAIInsight } from '../services/api';

interface DashboardProps {
  profil: ProfilSekolah;
  pegawai: Pegawai[];
  siswa: Siswa[];
  sarpras: SarprasItem[];
  rapor: RekapRaporSiswa[];
  btq: NilaiIjazahBTQ[];
  currentUser?: AuthUser;
  setActiveTab: (tab: TabType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profil,
  pegawai,
  siswa,
  sarpras,
  rapor,
  btq,
  currentUser,
  setActiveTab,
}) => {
  const [aiInsight, setAiInsight] = useState<AIInsightData | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Statistics
  const totalPegawai = pegawai.length;
  const pnsCount = pegawai.filter((p) => p.statusKepegawaian === 'PNS').length;
  const pppkCount = pegawai.filter((p) => p.statusKepegawaian === 'PPPK').length;
  const honorerCount = pegawai.filter((p) => p.statusKepegawaian === 'GTT' || p.statusKepegawaian === 'PTT').length;

  const totalSiswa = siswa.length;
  const lakiCount = siswa.filter((s) => s.jenisKelamin === 'L').length;
  const perempuanCount = siswa.filter((s) => s.jenisKelamin === 'P').length;

  const sarprasBaik = sarpras.filter((s) => s.kondisi === 'Baik').length;
  const sarprasRusakRingan = sarpras.filter((s) => s.kondisi === 'Rusak Ringan').length;
  const sarprasRusakBerat = sarpras.filter((s) => s.kondisi === 'Rusak Berat').length;

  // BTQ Pass Rate
  const btqLulus = btq.filter((b) => b.statusKelulusan === 'Lulus').length;
  const btqRate = btq.length > 0 ? Math.round((btqLulus / btq.length) * 100) : 100;

  // Siswa per kelas
  const perKelasCount = [1, 2, 3, 4, 5, 6].map((k) => ({
    kelas: k,
    total: siswa.filter((s) => s.kelas === k).length,
    laki: siswa.filter((s) => s.kelas === k && s.jenisKelamin === 'L').length,
    perempuan: siswa.filter((s) => s.kelas === k && s.jenisKelamin === 'P').length,
  }));

  // Trigger Gemini AI Insight
  const handleGenerateAiInsight = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const summaryPayload = {
        sekolah: profil.nama,
        tahunPelajaran: profil.tahunPelajaranAktif,
        rekapPegawai: {
          total: totalPegawai,
          pns: pnsCount,
          pppk: pppkCount,
          honorer: honorerCount,
        },
        rekapSiswa: {
          total: totalSiswa,
          lakiLaki: lakiCount,
          perempuan: perempuanCount,
          distribusiKelas: perKelasCount,
        },
        rekapSarpras: {
          total: sarpras.length,
          baik: sarprasBaik,
          rusakRingan: sarprasRusakRingan,
          rusakBerat: sarprasRusakBerat,
          daftarRusakBerat: sarpras.filter(s => s.kondisi === 'Rusak Berat').map(s => s.namaSarpras),
        },
        rekapBTQ: {
          totalPeserta: btq.length,
          lulus: btqLulus,
          persentaseLulus: `${btqRate}%`,
          rataRataSkor: (btq.reduce((acc, b) => acc + b.rataRata, 0) / (btq.length || 1)).toFixed(1),
        },
        rekapRapor: {
          jumlahSiswaTerekam: rapor.length,
        },
      };

      const result = await generateAIInsight(summaryPayload);
      setAiInsight({
        ...result,
        lastGenerated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      setAiError(err.message || 'Gagal memanggil Gemini AI.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Indicator Banner */}
      {currentUser?.role === 'guest' || currentUser?.role === 'siswa' ? (
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Mode Guest (Pengunjung Publik):</span>
              <span className="ml-1 text-slate-600">Menampilkan informasi umum sekolah, statistik data kesiswaan, sarpras, dan direktori umum SDN Kedungringin 1 Beji.</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] shrink-0">
            Hanya Lihat
          </span>
        </div>
      ) : currentUser?.role === 'guru' ? (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-700 text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-emerald-950">Selamat Datang, Bapak/Ibu {currentUser.name}!</span>
              <span className="ml-1 text-emerald-800">
                Akses aktif untuk <strong>{currentUser.rombel || `Rombel Kelas ${currentUser.kelas || ''}`}</strong>. Anda dapat memperbarui nilai rapor, asesmen TKA, data siswa rombel, dan keadministrasian ruang kelas binaan.
              </span>
            </div>
          </div>
          {currentUser.kelas && (
            <span className="px-3 py-1 rounded-full bg-emerald-700 text-white font-bold text-[11px] shrink-0">
              Rombel Kelas {currentUser.kelas}
            </span>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 shadow-xs flex items-center justify-between text-xs text-purple-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-700 text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-purple-950">Administrator Sistem (Akses Penuh):</span>
              <span className="ml-1 text-purple-800">Memiliki wewenang pembaruan keseluruhan data: master siswa semua rombel, kepegawaian ASN & SKP, sarpras & perpustakaan, dan sinkronisasi Google Drive & Sheets.</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-700 text-white font-bold text-[11px] shrink-0">
            Super Admin
          </span>
        </div>
      )}

      {/* Top Welcome & School Identity Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-700/60 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 border border-emerald-600/40">
              <School className="w-3.5 h-3.5" />
              Sistem Informasi Manajemen Terintegrasi
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Selamat Datang di SIM {profil.nama}
            </h2>
            <p className="text-emerald-100/90 text-sm max-w-2xl leading-relaxed">
              Pusat kendali manajemen data kesiswaan terintegrasi rapor 4 & 5 semester, sertifikasi BTQ,
              kepegawaian, sarana prasarana, serta generator persuratan resmi berbasis Google Workspace & Gemini AI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab('kesiswaan')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-semibold text-xs hover:bg-emerald-50 transition-all shadow-xs"
            >
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Kelola Rapor & BTQ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('keadministrasian')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-medium text-xs border border-emerald-600/60 transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-300" />
              <span>Generator Surat AI</span>
            </button>
          </div>
        </div>

        {/* Quick Identity Bar */}
        <div className="mt-6 pt-4 border-t border-emerald-700/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-emerald-300 font-medium">Kepala Sekolah</div>
            <div className="font-semibold text-white">{profil.kepalaSekolah}</div>
            <div className="text-emerald-200/80 text-[11px]">NIP. {profil.nipKepalaSekolah}</div>
          </div>
          <div>
            <div className="text-emerald-300 font-medium">Status & Akreditasi</div>
            <div className="font-semibold text-white">{profil.status} - Akreditasi {profil.akreditasi}</div>
            <div className="text-emerald-200/80 text-[11px]">NPSN: {profil.npsn}</div>
          </div>
          <div>
            <div className="text-emerald-300 font-medium">Tahun Pelajaran</div>
            <div className="font-semibold text-white">{profil.tahunPelajaranAktif}</div>
            <div className="text-emerald-200/80 text-[11px]">Acuan TMT: {profil.tanggalAcuanUsia}</div>
          </div>
          <div>
            <div className="text-emerald-300 font-medium">Kecamatan & Daerah</div>
            <div className="font-semibold text-white">Kec. {profil.kecamatan}</div>
            <div className="text-emerald-200/80 text-[11px]">Kab. {profil.kabupaten}, Jawa Timur</div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Siswa Card */}
        <div 
          onClick={() => setActiveTab('kesiswaan')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              6 Tingkat Kelas
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{totalSiswa}</div>
            <div className="text-xs font-medium text-slate-500">Total Siswa Terdaftar</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
            <span>L: <strong className="text-slate-800">{lakiCount}</strong></span>
            <span>P: <strong className="text-slate-800">{perempuanCount}</strong></span>
            <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Rincian <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Pegawai Card */}
        <div 
          onClick={() => setActiveTab('kepegawaian')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              PNS / PPPK / Honorer
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{totalPegawai}</div>
            <div className="text-xs font-medium text-slate-500">Total Pendidik & Tendik</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
            <span>PNS: <strong className="text-slate-800">{pnsCount}</strong></span>
            <span>PPPK: <strong className="text-slate-800">{pppkCount}</strong></span>
            <span>Honorer: <strong className="text-slate-800">{honorerCount}</strong></span>
          </div>
        </div>

        {/* BTQ Card */}
        <div 
          onClick={() => setActiveTab('kesiswaan')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Kelulusan {btqRate}%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{btq.length}</div>
            <div className="text-xs font-medium text-slate-500">Ijazah / Sertifikat BTQ</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
            <span>Lulus: <strong className="text-emerald-700">{btqLulus}</strong></span>
            <span>Remedial: <strong className="text-amber-700">{btq.length - btqLulus}</strong></span>
            <span className="text-amber-600 font-medium flex items-center gap-0.5">
              Input <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Sarpras Card */}
        <div 
          onClick={() => setActiveTab('sarpras')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {sarprasBaik} Laik Pakai
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{sarpras.length}</div>
            <div className="text-xs font-medium text-slate-500">Unit Sarana Prasarana</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
            <span className="text-emerald-700 font-medium">Baik: {sarprasBaik}</span>
            <span className="text-amber-700 font-medium">R. Ringan: {sarprasRusakRingan}</span>
            <span className="text-red-700 font-medium">R. Berat: {sarprasRusakBerat}</span>
          </div>
        </div>
      </div>

      {/* Grid: AI Insight Widget & Distribusi Siswa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Gemini AI Insight Widget */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Widget AI Insight Manajemen Sekolah
                  </h3>
                  <p className="text-xs text-slate-500">
                    Analisis pintar profil siswa, rapor, BTQ, dan sarpras oleh Gemini 3.8 Flash
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateAiInsight}
                disabled={loadingAi}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
              >
                {loadingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menganalisis Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>{aiInsight ? 'Perbarui Analisis AI' : 'Jalankan AI Insight'}</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* AI Insight Content */}
            {aiInsight ? (
              <div className="mt-5 space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-slate-800 text-xs leading-relaxed">
                  <div className="font-semibold text-emerald-950 mb-1 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    Executive Summary:
                  </div>
                  {aiInsight.executiveSummary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      Sorotan Akademik & Rapor:
                    </h4>
                    <ul className="space-y-1.5 text-slate-600">
                      {aiInsight.academicHighlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-600" />
                      Sorotan Capaian BTQ:
                    </h4>
                    <ul className="space-y-1.5 text-slate-600">
                      {aiInsight.btqHighlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
                  <h4 className="font-semibold text-amber-900 mb-1.5">
                    Rekomendasi Tindak Lanjut untuk Kepala Sekolah:
                  </h4>
                  <ul className="space-y-1 text-slate-700">
                    {aiInsight.actionableRecommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="inline-block w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-center font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-8 py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  AI Insight Belum Dijalankan
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Klik tombol di atas untuk menganalisis data terpadu SDN Kedungringin 1 Beji secara menyeluruh
                  menggunakan model Gemini 3.8 Flash.
                </p>
                <button
                  onClick={handleGenerateAiInsight}
                  disabled={loadingAi}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-medium text-xs hover:bg-emerald-800 transition-colors shadow-xs"
                >
                  Generate Insight Sekarang
                </button>
              </div>
            )}
          </div>

          {aiInsight && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
              <span>Status: <strong className="text-emerald-700">Diperbarui</strong></span>
              <span>Terakhir digenerate: {aiInsight.lastGenerated} WIB</span>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Distribusi Siswa per Kelas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Distribusi Rombel Kelas
              </h3>
              <span className="text-[11px] text-slate-500">TP {profil.tahunPelajaranAktif}</span>
            </div>

            <div className="mt-4 space-y-3">
              {perKelasCount.map((item) => {
                const max = Math.max(...perKelasCount.map((p) => p.total), 1);
                const percent = Math.round((item.total / max) * 100);
                return (
                  <div key={item.kelas} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Kelas {item.kelas}</span>
                      <div className="text-[11px] text-slate-500 space-x-2">
                        <span>{item.total} Siswa</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-blue-600">{item.laki} L</span>
                        <span className="text-pink-600">{item.perempuan} P</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-800 mb-2">Sebaran Agama Siswa</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                  <span className="text-slate-600">Islam:</span>
                  <strong className="text-slate-900">{siswa.filter(s => s.agama === 'Islam').length}</strong>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                  <span className="text-slate-600">Kristen:</span>
                  <strong className="text-slate-900">{siswa.filter(s => s.agama === 'Kristen').length}</strong>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                  <span className="text-slate-600">Katolik:</span>
                  <strong className="text-slate-900">{siswa.filter(s => s.agama === 'Katolik').length}</strong>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between">
                  <span className="text-slate-600">Hindu:</span>
                  <strong className="text-slate-900">{siswa.filter(s => s.agama === 'Hindu').length}</strong>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('kesiswaan')}
            className="mt-6 w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Buka Modul Kesiswaan Penuh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
