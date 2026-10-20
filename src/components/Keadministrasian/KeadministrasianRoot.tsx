import React, { useState } from 'react';
import { 
  SuratKeluar, 
  SuratMasuk, 
  ProfilSekolah, 
  Pegawai, 
  Siswa, 
  KeadministrasianSubTab 
} from '../../types';
import { SuratKeluarComponent } from './SuratKeluar';
import { SuratMasukComponent } from './SuratMasuk';
import { FileText, Inbox, Sparkles } from 'lucide-react';
import { LetterGenerationResult } from '../../services/api';

interface KeadministrasianRootProps {
  suratKeluar: SuratKeluar[];
  suratMasuk: SuratMasuk[];
  profil: ProfilSekolah;
  pegawai: Pegawai[];
  siswa: Siswa[];
  onSaveSuratKeluar: (s: SuratKeluar) => void;
  onDeleteSuratKeluar: (id: string) => void;
  onSaveSuratMasuk: (s: SuratMasuk) => void;
  onDeleteSuratMasuk: (id: string) => void;
  onOpenLetterPrintModal: (letter: LetterGenerationResult) => void;
}

export const KeadministrasianRoot: React.FC<KeadministrasianRootProps> = ({
  suratKeluar,
  suratMasuk,
  profil,
  pegawai,
  siswa,
  onSaveSuratKeluar,
  onDeleteSuratKeluar,
  onSaveSuratMasuk,
  onDeleteSuratMasuk,
  onOpenLetterPrintModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<KeadministrasianSubTab>('surat_keluar');

  return (
    <div className="space-y-6">
      {/* Sub Tab Switcher */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveSubTab('surat_keluar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'surat_keluar'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Sub-menu Surat Keluar (AI Gemini)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold">
            {suratKeluar.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('surat_masuk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'surat_masuk'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Sub-menu Surat Masuk & Disposisi</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
            {suratMasuk.length}
          </span>
        </button>
      </div>

      {activeSubTab === 'surat_keluar' ? (
        <SuratKeluarComponent
          suratList={suratKeluar}
          profil={profil}
          pegawaiList={pegawai}
          siswaList={siswa}
          onSaveSuratKeluar={onSaveSuratKeluar}
          onDeleteSuratKeluar={onDeleteSuratKeluar}
          onOpenLetterPrintModal={onOpenLetterPrintModal}
        />
      ) : (
        <SuratMasukComponent
          suratList={suratMasuk}
          onSaveSuratMasuk={onSaveSuratMasuk}
          onDeleteSuratMasuk={onDeleteSuratMasuk}
        />
      )}
    </div>
  );
};
