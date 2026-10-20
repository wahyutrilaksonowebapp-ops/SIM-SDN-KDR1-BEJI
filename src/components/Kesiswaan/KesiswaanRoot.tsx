import React, { useState } from 'react';
import { 
  Siswa, 
  ProfilSekolah, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ, 
  UserRole,
  AuthUser,
  KesiswaanSubTab 
} from '../../types';
import { DataSiswa } from './DataSiswa';
import { RekapRapor, ProcessedRapor } from './RekapRapor';
import { IjazahBTQ } from './IjazahBTQ';
import { 
  Users, 
  Award, 
  BookOpen, 
  GraduationCap 
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
}) => {
  const [activeSubTab, setActiveSubTab] = useState<KesiswaanSubTab>('siswa');

  const subNavItems: { id: KesiswaanSubTab; label: string; icon: React.ReactNode; count?: number; badge?: string }[] = [
    {
      id: 'siswa',
      label: 'Data Siswa & Rekap Demografi',
      icon: <Users className="w-4 h-4" />,
      count: siswa.length,
    },
    {
      id: 'rapor',
      label: 'Rekap Rapor (4 vs 5 Semester)',
      icon: <Award className="w-4 h-4" />,
      badge: 'PPDB & Kelulusan',
    },
    {
      id: 'btq',
      label: "Ijazah / Sertifikat BTQ",
      icon: <BookOpen className="w-4 h-4" />,
      count: btq.length,
      badge: '5 Aspek Nilai',
    },
  ];

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

      {activeSubTab === 'rapor' && (
        <RekapRapor
          rapor={rapor}
          profil={profil}
          userRole={userRole}
          currentUser={currentUser}
          onSaveRapor={onSaveRapor}
          onOpenTranscriptModal={onOpenTranscriptModal}
          onOpenSKPModal={onOpenSKPModal}
        />
      )}

      {activeSubTab === 'btq' && (
        <IjazahBTQ
          btqList={btq}
          siswaList={siswa}
          profil={profil}
          onSaveBTQ={onSaveBTQ}
          onDeleteBTQ={onDeleteBTQ}
          onOpenCertificateModal={onOpenCertificateModal}
        />
      )}
    </div>
  );
};
