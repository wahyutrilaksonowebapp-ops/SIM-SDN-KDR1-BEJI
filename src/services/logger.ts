import { ActivityLog, UserRole } from '../types';

const STORAGE_KEY = 'sim_kdr1_activity_logs';

// Initial realistic audit logs so the administrator has immediate historical context
const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-seed-1',
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    role: 'admin',
    userName: 'Administrator SIM SDN Kedungringin 1',
    action: 'LOGIN',
    category: 'AUTENTIKASI',
    description: 'Administrator masuk ke sistem SIM SDN Kedungringin 1 Beji.',
  },
  {
    id: 'log-seed-2',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    role: 'guru',
    userName: 'Dewi Lestari, S.Pd.',
    userNip: '19910418 201903 2 015',
    action: 'UBAH',
    category: 'RAPOR',
    description: 'Guru Kelas 4 memperbarui nilai rapor semester 7 dan asesmen TKA rombel kelas 4.',
  },
  {
    id: 'log-seed-3',
    timestamp: new Date(Date.now() - 3600000 * 15).toISOString(),
    role: 'admin',
    userName: 'Administrator SIM SDN Kedungringin 1',
    action: 'TAMBAH',
    category: 'SURAT',
    description: 'Menambah Surat Keluar: No. 421.2/045/424.072/2025 - Undangan Rapat Komite & Sosialisasi TKA.',
  },
  {
    id: 'log-seed-4',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    role: 'admin',
    userName: 'Administrator SIM SDN Kedungringin 1',
    action: 'UBAH',
    category: 'SARPRAS',
    description: 'Memperbarui data inventaris & jadwal piket Ruang Kelas 6.',
  },
];

export const getActivityLogs = (): ActivityLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Gagal membaca log aktivitas dari localStorage:', err);
    return INITIAL_LOGS;
  }
};

export const logUserActivity = (
  entry: Omit<ActivityLog, 'id' | 'timestamp'>
): ActivityLog => {
  const newLog: ActivityLog = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const logs = getActivityLogs();
    // Keep max 800 most recent logs to prevent localStorage saturation
    const updated = [newLog, ...logs].slice(0, 800);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Gagal menyimpan log aktivitas ke localStorage:', err);
  }

  return newLog;
};

export const clearActivityLogs = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Gagal membersihkan log aktivitas:', err);
  }
};

export const exportLogsToCSV = (logs: ActivityLog[]): void => {
  if (!logs || logs.length === 0) return;

  const headers = ['Waktu', 'Peran', 'Nama Pengguna', 'NIP', 'Aksi', 'Kategori', 'Deskripsi', 'Detail'];
  const rows = logs.map((l) => [
    `"${new Date(l.timestamp).toLocaleString('id-ID')}"`,
    `"${l.role}"`,
    `"${l.userName}"`,
    `"${l.userNip || '-'}"`,
    `"${l.action}"`,
    `"${l.category}"`,
    `"${l.description.replace(/"/g, '""')}"`,
    `"${(l.details || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Log_Aktivitas_SIM_SDNKedungringin1_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
