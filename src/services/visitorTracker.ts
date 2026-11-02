import { VisitorLog, UserRole } from '../types';

const VISITOR_STORAGE_KEY = 'sim_kdr1_visitor_sessions';

// Helper to detect device and browser from navigator userAgent
export function detectClientDevice(): { deviceName: string; deviceType: 'Desktop' | 'Mobile' | 'Tablet' } {
  if (typeof window === 'undefined') {
    return { deviceName: 'Server Environment', deviceType: 'Desktop' };
  }

  const ua = navigator.userAgent;
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';

  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // Detect OS
  let os = 'Windows';
  if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Detect Browser
  let browser = 'Chrome';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  return {
    deviceName: `${browser} on ${os} (${deviceType})`,
    deviceType,
  };
}

// Generate realistic seed visitor data for past 14 days
function generateSeedVisitorLogs(): VisitorLog[] {
  const seedList: VisitorLog[] = [];
  const roles: { role: UserRole; name: string; id: string; rombel?: string }[] = [
    { role: 'admin', name: 'Administrator SIM (Fuad Fahrudin)', id: '19800618 200501 1 010' },
    { role: 'guru', name: 'Wahyu Tri Laksono, S.Pd.I', id: '19860628 202321 1 010', rombel: 'Guru PAI & BTQ' },
    { role: 'guru', name: 'Pudjiati, S.Pd.', id: '19690107 200701 2 015', rombel: 'Guru Kelas 6' },
    { role: 'guru', name: 'Gadis Yunita Berliana, S.Pd.', id: '19861103 201403 1 003', rombel: 'Guru Kelas 5' },
    { role: 'guru', name: 'Isfaul Mukarromah, S.Pd.', id: '19910418 201903 2 015', rombel: 'Guru Kelas 4' },
    { role: 'guru', name: 'Arif Diantoro, S.Pd.', id: '19940722 202221 2 009', rombel: 'Guru Kelas 3' },
    { role: 'guru', name: 'Mochammad Syafi\'i, S.Pd.', id: '19951205 202321 1 004', rombel: 'Guru PJOK' },
    { role: 'guru', name: 'Putri Azzahrahidayat, S.Pd.', id: '19960310 202421 2 011', rombel: 'Guru Kelas 2' },
    { role: 'guru', name: 'Dina Fitriyah, S.Pd.', id: '19970914 202107 2 001', rombel: 'Guru Kelas 1' },
    { role: 'siswa', name: 'Ahmad Faiz Al-Hafidz', id: '0158921102', rombel: 'Kelas 6 (A)' },
    { role: 'siswa', name: 'Nabila Putri Azzahra', id: '0167234901', rombel: 'Kelas 5 (A)' },
    { role: 'siswa', name: 'Muhammad Rizky Ramadhan', id: '0171245890', rombel: 'Kelas 4 (A)' },
    { role: 'siswa', name: 'Zahra Amelia Safitri', id: '0189021455', rombel: 'Kelas 3 (A)' },
    { role: 'siswa', name: 'Kenzo Aditama Putra', id: '0191245789', rombel: 'Kelas 2 (A)' },
    { role: 'siswa', name: 'Aisyah Humaira', id: '0204561234', rombel: 'Kelas 1 (A)' },
    { role: 'guest', name: 'Wali Murid Siswa Kelas 6 (Bpk. M. Sholeh)', id: 'sholeh.wali@gmail.com' },
    { role: 'guest', name: 'Pengawas Sekolah Korwil Beji', id: 'pengawas.disdik@pasuruankab.go.id' },
    { role: 'guest', name: 'Wali Murid Siswa Kelas 1 (Ibu Anisa)', id: 'anisa.walikelas1@gmail.com' },
    { role: 'guest', name: 'Masyarakat Umum / Calon Siswa', id: 'tamu.kedungringin@gmail.com' },
  ];

  const now = new Date();
  let logIdCounter = 1;

  // Generate historical visits for past 14 days
  for (let d = 13; d >= 0; d--) {
    const dayDate = new Date(now.getTime() - d * 86400000);
    const dateStr = dayDate.toISOString().split('T')[0];
    
    // Number of visits per day: varies between 12 to 28
    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
    const countToday = isWeekend ? Math.floor(Math.random() * 8) + 8 : Math.floor(Math.random() * 15) + 16;

    for (let i = 0; i < countToday; i++) {
      const actor = roles[Math.floor(Math.random() * roles.length)];
      const hour = Math.floor(Math.random() * 12) + 6; // 06:00 to 18:00
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
      
      const fullTimestamp = new Date(`${dateStr}T${timeStr}.000Z`).toISOString();
      const deviceTypes: ('Desktop' | 'Mobile' | 'Tablet')[] = ['Desktop', 'Desktop', 'Mobile', 'Mobile', 'Tablet'];
      const pickedDeviceType = actor.role === 'siswa' || actor.role === 'guest' ? 'Mobile' : deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      const deviceName = pickedDeviceType === 'Mobile' 
        ? 'Chrome on Android (Mobile)' 
        : pickedDeviceType === 'Tablet' 
        ? 'Safari on iPad (Tablet)' 
        : 'Chrome on Windows 11 (Desktop)';

      const pages = ['Dashboard Utama', 'Modul Kesiswaan', 'Penilaian Harian CBT', 'Inventaris Sarpras', 'Arsip Surat & Dokumen', 'Data Kepegawaian'];
      const pageVisited = pages[Math.floor(Math.random() * pages.length)];

      seedList.push({
        id: `vlog-seed-${logIdCounter++}`,
        timestamp: fullTimestamp,
        date: dateStr,
        time: timeStr,
        role: actor.role,
        userName: actor.name,
        identifier: actor.id,
        rombel: actor.rombel,
        device: deviceName,
        deviceType: pickedDeviceType,
        ip: `192.168.1.${Math.floor(Math.random() * 200) + 10}`,
        pageVisited,
        sessionMinutes: Math.floor(Math.random() * 25) + 5,
      });
    }
  }

  // Sort latest first
  return seedList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getAllVisitorLogs(): VisitorLog[] {
  try {
    const raw = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!raw) {
      const seeded = generateSeedVisitorLogs();
      localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = generateSeedVisitorLogs();
      localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch (err) {
    console.error('Gagal membaca visitor logs:', err);
    return generateSeedVisitorLogs();
  }
}

// Record a new visitor session
export function recordVisitorSession(
  role: UserRole,
  userName: string,
  identifier?: string,
  rombel?: string,
  pageVisited: string = 'Dashboard'
): VisitorLog {
  const { deviceName, deviceType } = detectClientDevice();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });

  const newLog: VisitorLog = {
    id: `vlog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    date: dateStr,
    time: timeStr,
    role,
    userName: userName || (role === 'admin' ? 'Administrator' : role === 'guest' ? 'Tamu Publik' : 'Pengguna SIM'),
    identifier: identifier || '-',
    rombel: rombel || '-',
    device: deviceName,
    deviceType,
    ip: '192.168.1.101 (Client Local)',
    pageVisited,
    sessionMinutes: 1,
  };

  try {
    const current = getAllVisitorLogs();
    // Throttle duplicate records within 1 minute from same user on same page
    const recentDuplicate = current.find(
      (l) => l.userName === newLog.userName && l.role === newLog.role && l.date === dateStr &&
        Math.abs(new Date(l.timestamp).getTime() - now.getTime()) < 60000
    );

    if (!recentDuplicate) {
      const updated = [newLog, ...current].slice(0, 1500); // Keep max 1500 logs
      localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Gagal menyimpan catatan kunjungan:', err);
  }

  return newLog;
}

// Daily Aggregated Statistics
export interface DailyVisitorStat {
  date: string; // YYYY-MM-DD
  dateLabel: string; // e.g. "31 Okt", "Jumat, 31 Okt"
  total: number;
  admin: number;
  guru: number;
  siswa: number;
  guest: number;
}

export function getDailyVisitorStats(daysCount: number = 14): DailyVisitorStat[] {
  const logs = getAllVisitorLogs();
  const now = new Date();
  const result: DailyVisitorStat[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const targetDate = new Date(now.getTime() - i * 86400000);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayName = targetDate.toLocaleDateString('id-ID', { weekday: 'short' });
    const dayNum = targetDate.getDate();
    const monthName = targetDate.toLocaleDateString('id-ID', { month: 'short' });
    const dateLabel = `${dayName}, ${dayNum} ${monthName}`;

    const logsForDay = logs.filter((l) => l.date === dateStr);
    const total = logsForDay.length;
    const admin = logsForDay.filter((l) => l.role === 'admin').length;
    const guru = logsForDay.filter((l) => l.role === 'guru').length;
    const siswa = logsForDay.filter((l) => l.role === 'siswa').length;
    const guest = logsForDay.filter((l) => l.role === 'guest').length;

    result.push({
      date: dateStr,
      dateLabel,
      total,
      admin,
      guru,
      siswa,
      guest,
    });
  }

  return result;
}

// High-level summary metrics
export interface VisitorSummary {
  totalVisits: number;
  todayVisits: number;
  yesterdayVisits: number;
  weeklyVisits: number;
  uniqueUsersCount: number;
  roleCounts: {
    admin: number;
    guru: number;
    siswa: number;
    guest: number;
  };
  deviceCounts: {
    Desktop: number;
    Mobile: number;
    Tablet: number;
  };
  growthPercentage: number;
}

export function getVisitorSummary(): VisitorSummary {
  const logs = getAllVisitorLogs();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayDate = new Date(now.getTime() - 86400000);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  const sevenDaysAgoTime = now.getTime() - 7 * 86400000;

  const todayLogs = logs.filter((l) => l.date === todayStr);
  const yesterdayLogs = logs.filter((l) => l.date === yesterdayStr);
  const weeklyLogs = logs.filter((l) => new Date(l.timestamp).getTime() >= sevenDaysAgoTime);

  const uniqueUsers = new Set(logs.map((l) => `${l.role}-${l.userName}`)).size;

  const roleCounts = {
    admin: logs.filter((l) => l.role === 'admin').length,
    guru: logs.filter((l) => l.role === 'guru').length,
    siswa: logs.filter((l) => l.role === 'siswa').length,
    guest: logs.filter((l) => l.role === 'guest').length,
  };

  const deviceCounts = {
    Desktop: logs.filter((l) => l.deviceType === 'Desktop').length,
    Mobile: logs.filter((l) => l.deviceType === 'Mobile').length,
    Tablet: logs.filter((l) => l.deviceType === 'Tablet').length,
  };

  const todayCount = todayLogs.length;
  const yesterdayCount = yesterdayLogs.length;
  const growthPercentage = yesterdayCount > 0 
    ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) 
    : 0;

  return {
    totalVisits: logs.length,
    todayVisits: todayCount,
    yesterdayVisits: yesterdayCount,
    weeklyVisits: weeklyLogs.length,
    uniqueUsersCount: uniqueUsers,
    roleCounts,
    deviceCounts,
    growthPercentage,
  };
}

// Export visitor logs to CSV
export function exportVisitorLogsToCSV(logs: VisitorLog[]): void {
  if (!logs || logs.length === 0) return;

  const headers = ['ID', 'Waktu Kunjungan', 'Tanggal', 'Jam', 'Peran', 'Nama Pengunjung', 'NIP / NISN / ID', 'Rombel', 'Perangkat', 'Tipe Perangkat', 'Halaman Dikunjungi'];
  const rows = logs.map((l) => [
    `"${l.id}"`,
    `"${new Date(l.timestamp).toLocaleString('id-ID')}"`,
    `"${l.date}"`,
    `"${l.time}"`,
    `"${l.role.toUpperCase()}"`,
    `"${l.userName.replace(/"/g, '""')}"`,
    `"${(l.identifier || '-').replace(/"/g, '""')}"`,
    `"${(l.rombel || '-').replace(/"/g, '""')}"`,
    `"${l.device.replace(/"/g, '""')}"`,
    `"${l.deviceType}"`,
    `"${l.pageVisited.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Analisis_Pengunjung_SIM_SDNKDR1_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
