import React, { useState } from 'react';
import { 
  Database, 
  FileText, 
  Copy, 
  Check, 
  CheckCircle2, 
  SendHorizontal,
  RefreshCw,
  AlertCircle,
  Lock,
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';
import { 
  GOOGLE_DOCS_SURAT_TEMPLATE, 
  GOOGLE_DOCS_BTQ_TEMPLATE 
} from '../data/initialData';
import { syncWithGoogleAppsScript, LOCKED_WEB_APP_URL } from '../services/api';
import { SingleMasterDatabasePanel } from './SingleMasterDatabasePanel';
import { 
  ProfilSekolah, 
  Siswa, 
  Pegawai, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ, 
  SarprasItem, 
  SuratMasuk, 
  SuratKeluar,
  FaceprintPresensi,
  SkpEKinerja,
  UserRole
} from '../types';

interface DocsAndGasProps {
  profil: ProfilSekolah;
  siswa?: Siswa[];
  pegawai?: Pegawai[];
  rapor?: RekapRaporSiswa[];
  btq?: NilaiIjazahBTQ[];
  sarpras?: SarprasItem[];
  suratMasuk?: SuratMasuk[];
  suratKeluar?: SuratKeluar[];
  presensiList?: FaceprintPresensi[];
  skpList?: SkpEKinerja[];
  userRole?: UserRole;
  onUpdateProfil?: (updated: ProfilSekolah) => void;
  onUpdateData?: (newData: {
    siswa?: Siswa[];
    pegawai?: Pegawai[];
    rapor?: RekapRaporSiswa[];
    btq?: NilaiIjazahBTQ[];
    sarpras?: SarprasItem[];
    suratMasuk?: SuratMasuk[];
    suratKeluar?: SuratKeluar[];
  }) => void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onPurgeDummyData?: () => void;
}

export const DocsAndGas: React.FC<DocsAndGasProps> = ({
  profil = {
    nama: 'SDN Kedungringin 1 Beji',
    npsn: '20519312',
    bentukPendidikan: 'SD',
    status: 'Negeri',
    akreditasi: 'A',
    skPendirian: '421.2/012/424.072/1982',
    tanggalSk: '1982-01-10',
    alamat: 'Jl. Raya Beji No. 12',
    kelurahan: 'Kedungringin',
    kecamatan: 'Beji',
    kabupaten: 'Kabupaten Pasuruan',
    provinsi: 'Jawa Timur',
    kodePos: '67154',
    telepon: '(0343) 656123',
    email: 'sdnkedungringin1beji@gmail.com',
    kepalaSekolah: 'Hj. Siti Fatimah, S.Pd., M.Pd.',
    nipKepalaSekolah: '19740512 199803 2 004',
    pangkatKepalaSekolah: 'Pembina Tk. I (IV/b)',
    tahunPelajaranAktif: '2024/2025',
    tanggalAcuanUsia: '2024-07-01',
  },
  siswa = [],
  pegawai = [],
  rapor = [],
  btq = [],
  sarpras = [],
  suratMasuk = [],
  suratKeluar = [],
  userRole = 'admin',
  onUpdateProfil,
  onUpdateData,
  onNotify,
  onPurgeDummyData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'master_database' | 'sync' | 'templates'>('master_database');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Locked Web App State
  const scriptUrl = LOCKED_WEB_APP_URL;
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncActionType, setSyncActionType] = useState<'ping' | 'getAllData'>('ping');
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleTestSync = async (action: 'ping' | 'getAllData' = 'ping') => {
    setSyncLoading(true);
    setSyncActionType(action);
    setSyncError(null);
    setSyncResult(null);

    try {
      const res = await syncWithGoogleAppsScript(scriptUrl, action);
      setSyncResult(res);
      if (onNotify) {
        onNotify(`Koneksi Web App Google Apps Script berhasil (${action})!`, 'success');
      }
    } catch (err: any) {
      const msg = err.message || 'Gagal terhubung dengan Google Apps Script Web App.';
      setSyncError(msg);
      if (onNotify) {
        onNotify(msg, 'error');
      }
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Streamlined Sub-Navigation */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Database className="w-4 h-4 text-emerald-700" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Pusat Integrasi Basis Data Master & Google Apps Script Web App
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Sistem database terpadu SDN Kedungringin 1 Beji. Seluruh data dipusatkan pada <strong>1 Google Spreadsheet Master</strong> dan terhubung langsung dengan <strong>Google Apps Script Web App</strong> resmi yang telah terkunci permanen.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[200px] font-mono text-[11px]" title={LOCKED_WEB_APP_URL}>
              Web App Terkunci Resmi
            </span>
          </div>
        </div>

        {/* Clean Sub-navigation (Only active & essential tools) */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('master_database')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'master_database'
                ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-300" />
            <span>⚡ 1 Master Spreadsheet (Database Terpusat & Sinkronisasi)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-emerald-400 text-slate-950">
              Utama
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('sync')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'sync'
                ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>🔒 Uji Koneksi Web App (Terkunci)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-extrabold bg-amber-400 text-amber-950">
              Live API
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'templates'
                ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 Master Template Google Docs (Sertifikat BTQ & Surat)</span>
          </button>
        </div>
      </div>

      {/* SubTab 1: Single Master Database Panel (Primary) */}
      {activeSubTab === 'master_database' && (
        <SingleMasterDatabasePanel
          profil={profil}
          siswa={siswa}
          pegawai={pegawai}
          rapor={rapor}
          btq={btq}
          sarpras={sarpras}
          suratMasuk={suratMasuk}
          suratKeluar={suratKeluar}
          userRole={userRole}
          onUpdateProfil={onUpdateProfil}
          onUpdateData={onUpdateData || (() => {})}
          onNotify={onNotify || (() => {})}
          onPurgeDummyData={onPurgeDummyData || (() => {})}
        />
      )}

      {/* SubTab 2: Locked Web App Live Connection & Diagnostic */}
      {activeSubTab === 'sync' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-700" />
                <span>Konektivitas Google Apps Script Web App (Terkunci Resmi)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                URL Web App ini telah dikunci secara otomatis ke backend Google Apps Script resmi SIM SDN Kedungringin 1 Beji.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Status: URL Terkunci Aman (Permanen)</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                URL Google Apps Script Web App Terkunci:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={scriptUrl}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-800 select-all cursor-text focus:outline-none"
                  />
                  <div className="absolute right-3 top-2.5 text-slate-400">
                    <Lock className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(scriptUrl, 'locked-url')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  {copiedSection === 'locked-url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSection === 'locked-url' ? 'Tersalin' : 'Salin URL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Backend ini mengelola operasi CRUD seluruh 11 sheet, merge sertifikat BTQ, dan penerbitan persuratan secara otomatis.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap pt-2">
              <button
                onClick={() => handleTestSync('ping')}
                disabled={syncLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
              >
                {syncLoading && syncActionType === 'ping' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menguji Ping...</span>
                  </>
                ) : (
                  <>
                    <SendHorizontal className="w-4 h-4" />
                    <span>Uji Ping Endpoint (doGet)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleTestSync('getAllData')}
                disabled={syncLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
              >
                {syncLoading && syncActionType === 'getAllData' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengambil 11 Sheet...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Uji Tarik Seluruh Data (getAllData)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {syncError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Gagal Terhubung ke Web App:</strong>
                <p className="mt-0.5">{syncError}</p>
                <p className="text-[11px] text-red-600 mt-1">
                  Pastikan deployment Google Apps Script Anda telah diatur dengan akses "Siapa Saja" (Anyone / Anyone with link).
                </p>
              </div>
            </div>
          )}

          {syncResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
              <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Respon Sukses dari Google Apps Script Web App Terkunci:
              </div>
              <pre className="p-4 bg-white rounded-xl border border-emerald-300 font-mono text-slate-800 overflow-x-auto text-[11px] max-h-72 leading-relaxed shadow-inner">
                {JSON.stringify(syncResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SubTab 3: Master Templates Google Docs */}
      {activeSubTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Template Surat Resmi Dinas (Google Docs)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Salin teks di bawah ini ke dokumen Google Docs Anda untuk digunakan sebagai template surat resmi sekolah.
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(GOOGLE_DOCS_SURAT_TEMPLATE, 'surat-template')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold cursor-pointer"
              >
                {copiedSection === 'surat-template' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'surat-template' ? 'Tersalin!' : 'Salin Template Surat'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {GOOGLE_DOCS_SURAT_TEMPLATE}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Template Sertifikat / Ijazah BTQ (Google Docs)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Template dokumen ijazah standarisasi Baca Tulis Al-Qur'an tingkat Sekolah Dasar.
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(GOOGLE_DOCS_BTQ_TEMPLATE, 'btq-template')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold cursor-pointer"
              >
                {copiedSection === 'btq-template' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'btq-template' ? 'Tersalin!' : 'Salin Template BTQ'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {GOOGLE_DOCS_BTQ_TEMPLATE}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
