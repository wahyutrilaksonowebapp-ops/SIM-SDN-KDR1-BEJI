import { 
  Siswa, 
  Pegawai, 
  RekapRaporSiswa, 
  NilaiIjazahBTQ, 
  SarprasItem, 
  SuratMasuk, 
  SuratKeluar 
} from '../types';

export interface DataFieldDiff {
  fieldName: string;
  label: string;
  oldValue: any;
  newValue: any;
}

export interface DataChangeRecord {
  id: string;
  timestamp: string; // ISO 8601 string
  module: 'siswa' | 'pegawai' | 'rapor' | 'btq' | 'sarpras' | 'surat_keluar' | 'surat_masuk';
  moduleLabel: string;
  entityId: string;
  entityName: string;
  changeType: 'UPDATE_TIMPA' | 'TAMBAH_BARU' | 'DEDUPLIKASI' | 'TARIK_SPREADSHEET';
  description: string;
  diffs: DataFieldDiff[];
  syncedWithSheets?: boolean;
}

const STORAGE_KEY = 'sim_kdr1_data_changes_log';

// Seed sample change records so administrator immediately sees the audit mechanism
const SEED_CHANGES: DataChangeRecord[] = [
  {
    id: 'diff-seed-1',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    module: 'pegawai',
    moduleLabel: 'Direktori Pegawai & GTK',
    entityId: 'peg-9',
    entityName: 'Dina Fitriyah, S.Pd.',
    changeType: 'UPDATE_TIMPA',
    description: 'Pembaruan NIP dan penugasan Guru Kelas 1 via sinkronisasi spreadsheet.',
    diffs: [
      {
        fieldName: 'nip',
        label: 'Nomor Induk Pegawai (NIP)',
        oldValue: '-',
        newValue: '19970914 202107 2 001',
      },
      {
        fieldName: 'statusKepegawaian',
        label: 'Status Kepegawaian',
        oldValue: 'GTT',
        newValue: 'PPPK (Penetapan)',
      },
    ],
    syncedWithSheets: true,
  },
  {
    id: 'diff-seed-2',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    module: 'siswa',
    moduleLabel: 'Data Induk Kesiswaan',
    entityId: 's-01',
    entityName: 'Ahmad Dani Pratama',
    changeType: 'DEDUPLIKASI',
    description: 'Penyatuan ID ganda: Menimpa data lama & menghapus baris bertumpuk duplikat.',
    diffs: [
      {
        fieldName: 'alamat',
        label: 'Alamat Domisili',
        oldValue: 'Dusun Ringin RT 01 RW 02',
        newValue: 'Dusun Ringin RT 02 RW 02, Desa Kedungringin',
      },
      {
        fieldName: 'noHpOrtu',
        label: 'No. HP / WhatsApp Orang Tua',
        oldValue: '-',
        newValue: '0812-3344-5566',
      },
    ],
    syncedWithSheets: true,
  },
  {
    id: 'diff-seed-3',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    module: 'surat_keluar',
    moduleLabel: 'Persuratan Keluar',
    entityId: 'sk-01',
    entityName: 'Surat Keterangan Aktif Siswa',
    changeType: 'UPDATE_TIMPA',
    description: 'Sinkronisasi update nomor surat resmi dari Google Spreadsheet.',
    diffs: [
      {
        fieldName: 'nomorSurat',
        label: 'Nomor Registrasi Surat',
        oldValue: '421.2/012/424.072/2024',
        newValue: '421.2/012/424.072/2025',
      },
    ],
    syncedWithSheets: true,
  },
];

export const getDataChangeRecords = (): DataChangeRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CHANGES));
      return SEED_CHANGES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_CHANGES;
  }
};

export const addDataChangeRecord = (
  entry: Omit<DataChangeRecord, 'id' | 'timestamp'>
): DataChangeRecord => {
  const newRecord: DataChangeRecord = {
    ...entry,
    id: `diff-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const records = getDataChangeRecords();
    const updated = [newRecord, ...records].slice(0, 500); // keep max 500 records
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Gagal menyimpan log perubahan data:', err);
  }

  return newRecord;
};

export const clearDataChangeRecords = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Gagal membersihkan log perubahan data:', err);
  }
};

export const exportDataChangesToCSV = (records: DataChangeRecord[]): void => {
  if (!records || records.length === 0) return;

  const headers = ['Waktu', 'Modul', 'ID Entitas', 'Nama Entitas', 'Tipe Perubahan', 'Deskripsi', 'Bidang/Field', 'Sebelum (Old Value)', 'Sesudah (New Value)'];
  const rows: string[][] = [];

  records.forEach((r) => {
    if (r.diffs.length === 0) {
      rows.push([
        `"${new Date(r.timestamp).toLocaleString('id-ID')}"`,
        `"${r.moduleLabel}"`,
        `"${r.entityId}"`,
        `"${r.entityName.replace(/"/g, '""')}"`,
        `"${r.changeType}"`,
        `"${r.description.replace(/"/g, '""')}"`,
        `"-"`,
        `"-"`,
        `"-"`
      ]);
    } else {
      r.diffs.forEach((d) => {
        rows.push([
          `"${new Date(r.timestamp).toLocaleString('id-ID')}"`,
          `"${r.moduleLabel}"`,
          `"${r.entityId}"`,
          `"${r.entityName.replace(/"/g, '""')}"`,
          `"${r.changeType}"`,
          `"${r.description.replace(/"/g, '""')}"`,
          `"${d.label} (${d.fieldName})"`,
          `"${String(d.oldValue ?? '-').replace(/"/g, '""')}"`,
          `"${String(d.newValue ?? '-').replace(/"/g, '""')}"`
        ]);
      });
    }
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Log_Perubahan_Sebelum_Sesudah_SIM_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// =========================================================================
// SMART UPSERT & DEDUPLICATION ALGORITHM (TIMPA DATA LAMA DENGAN ID SAMA)
// =========================================================================

export interface DeduplicateResult<T> {
  cleaned: T[];
  duplicatesRemoved: number;
  updatedCount: number;
  addedCount: number;
  changes: DataChangeRecord[];
}

/**
 * Merges incoming items into existing items.
 * If an item with the same ID exists, it compares fields, records diffs (sebelum vs sesudah),
 * and overwrites (timpa data lama) the previous record to eliminate duplicate stacked rows.
 */
export function upsertWithDeduplication<T extends { id: string }>(
  existingList: T[],
  incomingList: T[],
  module: DataChangeRecord['module'],
  moduleLabel: string,
  getEntityName: (item: T) => string,
  fieldLabels: Record<string, string>,
  changeSource: 'TARIK_SPREADSHEET' | 'DEDUPLIKASI' | 'UPDATE_TIMPA' = 'UPDATE_TIMPA'
): DeduplicateResult<T> {
  const map = new Map<string, T>();
  const order: string[] = [];
  const changes: DataChangeRecord[] = [];
  let duplicatesRemoved = 0;
  let updatedCount = 0;
  let addedCount = 0;

  // 1. Put existing items into map
  for (const item of existingList) {
    if (!item || !item.id || String(item.id).trim().toUpperCase() === 'ID') continue;
    if (map.has(item.id)) {
      duplicatesRemoved++;
    } else {
      map.set(item.id, item);
      order.push(item.id);
    }
  }

  // 2. Upsert incoming items
  for (const incoming of incomingList) {
    if (!incoming || !incoming.id || String(incoming.id).trim().toUpperCase() === 'ID') continue;
    if (map.has(incoming.id)) {
      const oldItem = map.get(incoming.id)!;
      const diffs: DataFieldDiff[] = [];

      // Compare fields
      const allKeys = Array.from(new Set([...Object.keys(oldItem), ...Object.keys(incoming)]));
      for (const k of allKeys) {
        if (k === 'id') continue;
        const oldVal = (oldItem as any)[k];
        const newVal = (incoming as any)[k];

        // Object or array comparison via JSON
        const oldStr = typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal ?? '');
        const newStr = typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal ?? '');

        if (oldStr !== newStr && newVal !== undefined) {
          diffs.push({
            fieldName: k,
            label: fieldLabels[k] || k,
            oldValue: oldVal ?? '-',
            newValue: newVal ?? '-',
          });
        }
      }

      if (diffs.length > 0) {
        // Timpa data lama dengan data baru yang memiliki ID sama
        map.set(incoming.id, { ...oldItem, ...incoming });
        updatedCount++;

        const changeRecord = addDataChangeRecord({
          module,
          moduleLabel,
          entityId: incoming.id,
          entityName: getEntityName(incoming),
          changeType: changeSource,
          description: `Memperbarui & menimpa data lama (ID: ${incoming.id}) dengan data sinkronisasi terbaru. Mengurangi tumpukan baris ganda.`,
          diffs,
          syncedWithSheets: true,
        });
        changes.push(changeRecord);
      }
    } else {
      // New record
      map.set(incoming.id, incoming);
      order.push(incoming.id);
      addedCount++;

      const changeRecord = addDataChangeRecord({
        module,
        moduleLabel,
        entityId: incoming.id,
        entityName: getEntityName(incoming),
        changeType: 'TAMBAH_BARU',
        description: `Menambahkan rekaman baru (ID: ${incoming.id}) dari sinkronisasi data.`,
        diffs: [
          {
            fieldName: 'id',
            label: 'ID Entitas',
            oldValue: '(Kosong)',
            newValue: incoming.id,
          },
        ],
        syncedWithSheets: true,
      });
      changes.push(changeRecord);
    }
  }

  const cleaned = order.map((id) => map.get(id)!);

  return {
    cleaned,
    duplicatesRemoved,
    updatedCount,
    addedCount,
    changes,
  };
}

// Labels dictionary for human-friendly before/after diffs
export const FIELD_LABELS: Record<string, string> = {
  nama: 'Nama Lengkap',
  namaSiswa: 'Nama Siswa',
  namaBarang: 'Nama Barang/Aset',
  namaRuang: 'Nama Ruang',
  namaSarpras: 'Nama Fasilitas Sarpras',
  nip: 'NIP Pegawai',
  nisn: 'NISN',
  nis: 'NIS',
  kelas: 'Tingkat Kelas',
  rombel: 'Rombongan Belajar',
  jabatan: 'Jabatan Guru/GTK',
  golongan: 'Pangkat/Golongan',
  pangkat: 'Pangkat',
  statusKepegawaian: 'Status Kepegawaian (PNS/PPPK/GTT/PTT)',
  kontak: 'Nomor Telepon/HP',
  email: 'Alamat Email',
  alamat: 'Alamat Tempat Tinggal',
  agama: 'Agama',
  jenisKelamin: 'Jenis Kelamin',
  tempatLahir: 'Tempat Lahir',
  tanggalLahir: 'Tanggal Lahir',
  namaAyah: 'Nama Ayah',
  namaIbu: 'Nama Ibu',
  noHpOrtu: 'No. HP Orang Tua',
  kondisi: 'Kondisi Kelaikan (Baik/Rusak)',
  jumlah: 'Kuantitas / Jumlah',
  satuan: 'Satuan',
  lokasi: 'Lokasi Kampus',
  nomorSurat: 'Nomor Registrasi Surat',
  nomorSuratMasuk: 'Nomor Surat Masuk',
  perihal: 'Perihal Surat',
  pengirim: 'Asal Pengirim',
  tujuan: 'Pihak Tujuan',
  disposisiKepsek: 'Disposisi Kepala Sekolah',
  rataRata: 'Rata-rata Nilai',
  predikat: 'Predikat Kelulusan',
  noSertifikat: 'Nomor Sertifikat Ijazah BTQ',
};

// =========================================================================
// DATA CONFLICT DETECTION & VALIDATION (SEBELUM DATA DISIMPAN)
// =========================================================================

export interface DataConflictItem {
  id: string;
  module: DataChangeRecord['module'];
  moduleLabel: string;
  entityName: string;
  existingItem: any;
  incomingItem: any;
  diffs: DataFieldDiff[];
  isDuplicateId: boolean;
}

export function detectSyncConflicts<T extends { id: string }>(
  existingList: T[],
  incomingList: T[],
  module: DataChangeRecord['module'],
  moduleLabel: string,
  getEntityName: (item: T) => string,
  fieldLabels: Record<string, string>,
  idMatchers?: ((item: T) => string)[]
): { conflicts: DataConflictItem[]; duplicateIdsInIncoming: number } {
  const conflicts: DataConflictItem[] = [];
  const incomingSeen = new Set<string>();
  let duplicateIdsInIncoming = 0;

  // 1. Detect duplicate IDs inside incoming data itself
  for (const inc of incomingList) {
    if (!inc || !inc.id || String(inc.id).trim().toUpperCase() === 'ID') continue;
    if (incomingSeen.has(inc.id)) {
      duplicateIdsInIncoming++;
    } else {
      incomingSeen.add(inc.id);
    }
  }

  // 2. Detect conflicts between existing data and incoming data
  for (const incoming of incomingList) {
    if (!incoming || !incoming.id || String(incoming.id).trim().toUpperCase() === 'ID') continue;
    const match = existingList.find((ex) => {
      if (!ex || !ex.id || String(ex.id).trim().toUpperCase() === 'ID') return false;
      if (ex.id === incoming.id) return true;
      if (idMatchers && idMatchers.length > 0) {
        for (const matcher of idMatchers) {
          const valEx = matcher(ex);
          const valInc = matcher(incoming);
          if (valEx && valInc && valEx.trim() !== '-' && valEx.trim() === valInc.trim()) {
            return true;
          }
        }
      }
      return false;
    });

    if (match) {
      const diffs: DataFieldDiff[] = [];
      const allKeys = Array.from(new Set([...Object.keys(match), ...Object.keys(incoming)]));

      for (const k of allKeys) {
        if (k === 'id') continue;
        const oldVal = (match as any)[k];
        const newVal = (incoming as any)[k];

        if (newVal === undefined || newVal === null || newVal === '') continue;

        const oldStr = typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal ?? '').trim();
        const newStr = typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal ?? '').trim();

        if (oldStr !== newStr) {
          diffs.push({
            fieldName: k,
            label: fieldLabels[k] || k,
            oldValue: oldVal ?? '-',
            newValue: newVal ?? '-',
          });
        }
      }

      if (diffs.length > 0) {
        conflicts.push({
          id: `conflict-${module}-${incoming.id || 'item'}-${conflicts.length + 1}`,
          module,
          moduleLabel,
          entityName: getEntityName(incoming) || getEntityName(match),
          existingItem: match,
          incomingItem: incoming,
          diffs,
          isDuplicateId: true,
        });
      }
    }
  }

  return { conflicts, duplicateIdsInIncoming };
}
