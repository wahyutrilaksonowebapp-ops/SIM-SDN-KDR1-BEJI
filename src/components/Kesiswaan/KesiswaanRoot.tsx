import React, { useState } from 'react';
import { 
  Siswa, 
  ProfilSekolah, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ, 
  UserRole,
  AuthUser, 
  KesiswaanSubTab,
  TabunganTransaksi,
  SaldoAwalTabungan,
  PresensiHarianSiswa,
  PresensiRekapBulan
} from '../../types';
import { DataSiswa } from './DataSiswa';
import { PenilaianTerpadu } from './PenilaianTerpadu';
import { TabunganSiswa } from './TabunganSiswa';
import { PresensiSiswa } from './PresensiSiswa';
import { ProcessedRapor } from './RekapRapor';
import { 
  Users, 
  GraduationCap,
  Wallet,
  CalendarCheck
} from 'lucide-react';

interface KesiswaanRootProps {
  siswa: Siswa[];
  profil: ProfilSekolah;
  rapor: RekapRaporSiswa[];
  btq: NilaiIjazahBTQ[];
  userRole?: UserRole;
  currentUser?: AuthUser;
  onSaveSiswa: (s: Siswa) => void;
  onDeleteSiswa: (id: string) => void;
  onSaveRapor: (r: RekapRaporSiswa) => void;
  onSaveBTQ: (b: NilaiIjazahBTQ) => void;
  onDeleteBTQ: (id: string) => void;
  onOpenTranscriptModal: (item: ProcessedRapor) => void;
  onOpenCertificateModal: (item: NilaiIjazahBTQ) => void;
  onOpenSKPModal?: (item: ProcessedRapor) => void;
  // Tabungan Props
  tabunganList?: TabunganTransaksi[];
  saldoAwalList?: SaldoAwalTabungan[];
  onSaveTransaksi?: (t: TabunganTransaksi) => void;
  onSaveSaldoAwal?: (s: SaldoAwalTabungan) => void;
  onDeleteTransaksi?: (id: string) => void;
  // Presensi Props
  presensiHarianList?: PresensiHarianSiswa[];
  presensiBulananList?: PresensiRekapBulan[];
  onSavePresensiHarian?: (p: PresensiHarianSiswa) => void;
  onSavePresensiBulanan?: (p: PresensiRekapBulan) => void;
  onDeletePresensiHarian?: (id: string) => void;
}

export const KesiswaanRoot: React.FC<KesiswaanRootProps> = ({
  siswa,
  profil,
  rapor,
  btq,
  userRole = 'admin',
  currentUser,
  onSaveSiswa,
  onDeleteSiswa,
  onSaveRapor,
  onSaveBTQ,
  onDeleteBTQ,
  onOpenTranscriptModal,
  onOpenCertificateModal,
  onOpenSKPModal,
  tabunganList = [],
  saldoAwalList = [],
  onSaveTransaksi = () => {},
  onSaveSaldoAwal = () => {},
  onDeleteTransaksi,
  presensiHarianList = [],
  presensiBulananList = [],
  onSavePresensiHarian = () => {},
  onSavePresensiBulanan = () => {},
  onDeletePresensiHarian,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<KesiswaanSubTab>(() => {
    if (userRole === 'siswa') return 'tabungan';
    return 'siswa';
  });

  const subNavItems: { id: KesiswaanSubTab; label: string; icon: React.ReactNode; count?: number; badge?: string }[] = [
    {
      id: 'siswa',
      label: userRole === 'siswa' ? 'Profil & Rombel Saya' : 'Data Siswa & Rekap Demografi',
      icon: <Users className="w-4 h-4" />,
      count: userRole === 'siswa' ? undefined : siswa.length,
    },
    {
      id: 'penilaian',
      label: userRole === 'siswa' ? 'Rapor Semester Saya' : 'Penilaian',
      icon: <GraduationCap className="w-4 h-4 text-emerald-300" />,
      badge: userRole === 'siswa' ? '8 Mapel & TKA' : 'Rapor, TKA & BTQ',
    },
  ];

  // Syarat: Akun Guest tidak bisa memantau "tabungan".
  // Hanya tampilkan sub menu "tabungan" jika BUKAN guest!
  if (userRole !== 'guest') {
    subNavItems.push({
      id: 'tabungan',
      label: userRole === 'siswa' ? 'Buku Tabungan Saya' : 'Tabungan Siswa',
      icon: <Wallet className="w-4 h-4 text-amber-400" />,
      badge: userRole === 'siswa' ? 'Personal' : 'Kas Kelas',
    });
  }

  // Sub menu "presensi" tersedia untuk semua peran dengan tampilan sesuai hak akses
  subNavItems.push({
    id: 'presensi',
    label: userRole === 'siswa' ? 'Presensi Saya (S, I, TK, J)' : userRole === 'guest' ? 'Presensi Kelas (Agregat)' : 'Presensi Siswa',
    icon: <CalendarCheck className="w-4 h-4 text-sky-400" />,
    badge: userRole === 'guest' ? 'Publik' : userRole === 'siswa' ? 'Rekap Kehadiran' : 'Harian & Bulanan',
  });

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5">
        {subNavItems.map((item) => {
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.count}
                </span>
              )}
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content based on sub-tab */}
      {activeSubTab === 'siswa' && (
        <DataSiswa
          siswa={siswa}
          profil={profil}
          userRole={userRole}
          currentUser={currentUser}
          onSaveSiswa={onSaveSiswa}
          onDeleteSiswa={onDeleteSiswa}
        />
      )}

      {activeSubTab === 'penilaian' && (
        <PenilaianTerpadu
          siswa={siswa}
          profil={profil}
          rapor={rapor}
          btq={btq}
          userRole={userRole}
          currentUser={currentUser}
          onSaveRapor={onSaveRapor}
          onSaveBTQ={onSaveBTQ}
          onDeleteBTQ={onDeleteBTQ}
          onOpenTranscriptModal={onOpenTranscriptModal}
          onOpenCertificateModal={onOpenCertificateModal}
          onOpenSKPModal={onOpenSKPModal}
        />
      )}

      {activeSubTab === 'tabungan' && userRole !== 'guest' && (
        <TabunganSiswa
          siswa={siswa}
          profil={profil}
          currentUser={currentUser}
          userRole={userRole}
          tabunganList={tabunganList}
          saldoAwalList={saldoAwalList}
          onSaveTransaksi={onSaveTransaksi}
          onSaveSaldoAwal={onSaveSaldoAwal}
          onDeleteTransaksi={onDeleteTransaksi}
        />
      )}

      {activeSubTab === 'presensi' && (
        <PresensiSiswa
          siswa={siswa}
          profil={profil}
          currentUser={currentUser}
          userRole={userRole}
          presensiHarianList={presensiHarianList}
          presensiBulananList={presensiBulananList}
          onSavePresensiHarian={onSavePresensiHarian}
          onSavePresensiBulanan={onSavePresensiBulanan}
          onDeletePresensiHarian={onDeletePresensiHarian}
        />
      )}
    </div>
  );
};
