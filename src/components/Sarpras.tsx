import React, { useState } from 'react';
import { 
  SarprasItem, 
  ProfilSekolah, 
  UserRole, 
  AuthUser,
  BukuPerpustakaan, 
  PeminjamanBuku, 
  AnggotaPerpustakaan, 
  PengunjungPerpustakaan, 
  RuangKelasDetail,
  SarprasSubTab
} from '../types';
import { InventarisSarpras } from './Sarpras/InventarisSarpras';
import { Perpustakaan } from './Sarpras/Perpustakaan';
import { GedungRuangKelas } from './Sarpras/GedungRuangKelas';
import { 
  INITIAL_BUKU_PERPUSTAKAAN, 
  INITIAL_ANGGOTA_PERPUSTAKAAN, 
  INITIAL_PEMINJAMAN_BUKU, 
  INITIAL_PENGUNJUNG_PERPUSTAKAAN, 
  INITIAL_RUANG_KELAS 
} from '../data/sarprasData';
import { 
  Building2, 
  BookOpen, 
  School, 
  FileSpreadsheet,
  Sparkles,
  Layers
} from 'lucide-react';

interface SarprasProps {
  sarpras: SarprasItem[];
  profil: ProfilSekolah;
  userRole?: UserRole;
  currentUser?: AuthUser;
  onSaveSarpras: (item: SarprasItem) => void;
  onDeleteSarpras: (id: string) => void;
}

export const Sarpras: React.FC<SarprasProps> = ({
  sarpras,
  profil,
  userRole = 'admin',
  currentUser,
  onSaveSarpras,
  onDeleteSarpras,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SarprasSubTab>(() => {
    if (currentUser?.role === 'guru') {
      return 'ruang_kelas';
    }
    return 'inventaris';
  });

  // Local state for Library data
  const [bukuList, setBukuList] = useState<BukuPerpustakaan[]>(() => {
    const saved = localStorage.getItem('app_perpustakaan_buku');
    return saved ? JSON.parse(saved) : INITIAL_BUKU_PERPUSTAKAAN;
  });

  const [peminjamanList, setPeminjamanList] = useState<PeminjamanBuku[]>(() => {
    const saved = localStorage.getItem('app_perpustakaan_peminjaman');
    return saved ? JSON.parse(saved) : INITIAL_PEMINJAMAN_BUKU;
  });

  const [anggotaList, setAnggotaList] = useState<AnggotaPerpustakaan[]>(() => {
    const saved = localStorage.getItem('app_perpustakaan_anggota');
    return saved ? JSON.parse(saved) : INITIAL_ANGGOTA_PERPUSTAKAAN;
  });

  const [pengunjungList, setPengunjungList] = useState<PengunjungPerpustakaan[]>(() => {
    const saved = localStorage.getItem('app_perpustakaan_pengunjung');
    return saved ? JSON.parse(saved) : INITIAL_PENGUNJUNG_PERPUSTAKAAN;
  });

  // Local state for Classrooms
  const [ruangKelasList, setRuangKelasList] = useState<RuangKelasDetail[]>(() => {
    const saved = localStorage.getItem('app_sarpras_ruang_kelas');
    return saved ? JSON.parse(saved) : INITIAL_RUANG_KELAS;
  });

  // Helpers to persist and update Library state
  const handleSaveBuku = (item: BukuPerpustakaan) => {
    setBukuList((prev) => {
      const idx = prev.findIndex((b) => b.id === item.id);
      const next = idx >= 0 ? prev.map((b, i) => (i === idx ? item : b)) : [item, ...prev];
      localStorage.setItem('app_perpustakaan_buku', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteBuku = (id: string) => {
    setBukuList((prev) => {
      const next = prev.filter((b) => b.id !== id);
      localStorage.setItem('app_perpustakaan_buku', JSON.stringify(next));
      return next;
    });
  };

  const handleSavePeminjaman = (item: PeminjamanBuku) => {
    setPeminjamanList((prev) => {
      const next = [item, ...prev];
      localStorage.setItem('app_perpustakaan_peminjaman', JSON.stringify(next));
      return next;
    });

    // Update book available copies
    setBukuList((prev) => {
      const next = prev.map((b) => {
        if (b.id === item.bukuId) {
          return {
            ...b,
            jumlahTersedia: Math.max(0, b.jumlahTersedia - 1),
          };
        }
        return b;
      });
      localStorage.setItem('app_perpustakaan_buku', JSON.stringify(next));
      return next;
    });

    // Update member active borrow count
    setAnggotaList((prev) => {
      const next = prev.map((a) => {
        if (a.id === item.anggotaId) {
          return { ...a, jumlahPinjamanAktif: a.jumlahPinjamanAktif + 1 };
        }
        return a;
      });
      localStorage.setItem('app_perpustakaan_anggota', JSON.stringify(next));
      return next;
    });
  };

  const handleKembalikanBuku = (peminjamanId: string) => {
    const item = peminjamanList.find((p) => p.id === peminjamanId);
    if (!item) return;

    setPeminjamanList((prev) => {
      const next = prev.map((p) => {
        if (p.id === peminjamanId) {
          return {
            ...p,
            status: 'Dikembalikan' as const,
            tanggalKembali: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      });
      localStorage.setItem('app_perpustakaan_peminjaman', JSON.stringify(next));
      return next;
    });

    // Restore book count
    setBukuList((prev) => {
      const next = prev.map((b) => {
        if (b.id === item.bukuId) {
          return { ...b, jumlahTersedia: Math.min(b.jumlahEksemplar, b.jumlahTersedia + 1) };
        }
        return b;
      });
      localStorage.setItem('app_perpustakaan_buku', JSON.stringify(next));
      return next;
    });

    // Decrease member borrow count
    setAnggotaList((prev) => {
      const next = prev.map((a) => {
        if (a.id === item.anggotaId) {
          return { ...a, jumlahPinjamanAktif: Math.max(0, a.jumlahPinjamanAktif - 1) };
        }
        return a;
      });
      localStorage.setItem('app_perpustakaan_anggota', JSON.stringify(next));
      return next;
    });
  };

  const handleSaveAnggota = (item: AnggotaPerpustakaan) => {
    setAnggotaList((prev) => {
      const idx = prev.findIndex((a) => a.id === item.id);
      const next = idx >= 0 ? prev.map((a, i) => (i === idx ? item : a)) : [item, ...prev];
      localStorage.setItem('app_perpustakaan_anggota', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteAnggota = (id: string) => {
    setAnggotaList((prev) => {
      const next = prev.filter((a) => a.id !== id);
      localStorage.setItem('app_perpustakaan_anggota', JSON.stringify(next));
      return next;
    });
  };

  const handleAddPengunjung = (item: PengunjungPerpustakaan) => {
    setPengunjungList((prev) => {
      const next = [item, ...prev];
      localStorage.setItem('app_perpustakaan_pengunjung', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateRuangKelas = (updated: RuangKelasDetail) => {
    setRuangKelasList((prev) => {
      const next = prev.map((k) => (k.kelas === updated.kelas ? updated : k));
      localStorage.setItem('app_sarpras_ruang_kelas', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub-menu Top Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {currentUser?.role !== 'guru' && (
            <>
              <button
                onClick={() => setActiveSubTab('inventaris')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeSubTab === 'inventaris'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Inventaris Fasilitas ({sarpras.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('perpustakaan')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeSubTab === 'perpustakaan'
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-300" />
                <span>Perpustakaan & Spreadsheet</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveSubTab('ruang_kelas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'ruang_kelas'
                ? 'bg-indigo-800 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <School className="w-4 h-4 text-indigo-300" />
            <span>
              {currentUser?.role === 'guru' && currentUser?.kelas
                ? `Sarpras Kelas: Ruang Kelas ${currentUser.kelas} (${currentUser.rombel || 'Rombel Anda'})`
                : 'Gedung Ruang Kelas (1 s.d. 6)'}
            </span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium pr-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>SDN Kedungringin 1 Beji</span>
        </div>
      </div>

      {/* Content based on selected sub-tab */}
      {activeSubTab === 'inventaris' && (
        <InventarisSarpras
          sarpras={sarpras}
          userRole={userRole}
          onSaveSarpras={onSaveSarpras}
          onDeleteSarpras={onDeleteSarpras}
        />
      )}

      {activeSubTab === 'perpustakaan' && (
        <Perpustakaan
          bukuList={bukuList}
          peminjamanList={peminjamanList}
          anggotaList={anggotaList}
          pengunjungList={pengunjungList}
          profil={profil}
          userRole={userRole}
          onSaveBuku={handleSaveBuku}
          onDeleteBuku={handleDeleteBuku}
          onSavePeminjaman={handleSavePeminjaman}
          onKembalikanBuku={handleKembalikanBuku}
          onSaveAnggota={handleSaveAnggota}
          onDeleteAnggota={handleDeleteAnggota}
          onAddPengunjung={handleAddPengunjung}
        />
      )}

      {activeSubTab === 'ruang_kelas' && (
        <GedungRuangKelas
          ruangKelasList={ruangKelasList}
          profil={profil}
          userRole={userRole}
          currentUser={currentUser}
          onUpdateRuangKelas={handleUpdateRuangKelas}
        />
      )}
    </div>
  );
};
