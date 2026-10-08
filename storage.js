// storage.js — satu-satunya modul yang menyentuh localStorage.
// Bila nanti pindah ke IndexedDB atau sinkronisasi cloud, cukup ubah berkas ini.

export const KEY = 'duitku.v1';
export const SCHEMA_VERSION = 1;
const QUOTA_CHARS = 5_000_000; // perkiraan aman ~5 MB per origin

// Migrasi berurutan: migrations[n] mengubah data versi n menjadi n+1 (migrate_n_to_n+1).
const migrations = {
  // 1: (d) => { /* migrate_1_to_2 */ d.schemaVersion = 2; return d; },
};

export const DEFAULT_CATEGORIES = [
  { id: 'c_makan', name: 'Makan', type: 'expense', icon: '🍜', color: '#F97316' },
  { id: 'c_transport', name: 'Transport', type: 'expense', icon: '🛵', color: '#0EA5E9' },
  { id: 'c_belanja', name: 'Belanja', type: 'expense', icon: '🛍️', color: '#EC4899' },
  { id: 'c_tagihan', name: 'Tagihan', type: 'expense', icon: '🧾', color: '#8B5CF6' },
  { id: 'c_hiburan', name: 'Hiburan', type: 'expense', icon: '🎮', color: '#EAB308' },
  { id: 'c_kesehatan', name: 'Kesehatan', type: 'expense', icon: '💊', color: '#10B981' },
  { id: 'c_pendidikan', name: 'Pendidikan', type: 'expense', icon: '📚', color: '#6366F1' },
  { id: 'c_lainnya_out', name: 'Lainnya', type: 'expense', icon: '📦', color: '#64748B' },
  { id: 'c_gaji', name: 'Gaji', type: 'income', icon: '💼', color: '#16A34A' },
  { id: 'c_freelance', name: 'Freelance', type: 'income', icon: '💻', color: '#0D9488' },
  { id: 'c_bonus', name: 'Bonus', type: 'income', icon: '🎁', color: '#F59E0B' },
  { id: 'c_lainnya_in', name: 'Lainnya', type: 'income', icon: '✨', color: '#64748B' },
];

export function createDefaultState() {
  return {
    _rev: 0,
    schemaVersion: SCHEMA_VERSION,
    settings: {
      currency: 'IDR',
      locale: 'id-ID',
      theme: 'system',
      startOfMonth: 1,
      quietMode: false,
      lastBackupAt: null,
      onboarded: false,
      firstUseAt: new Date().toISOString(),
      backupSnoozeUntil: null,
      recapDismissedWeek: null,
    },
    wallets: [{ id: 'w_main', name: 'Dompet Utama', initialBalance: 0, icon: '👛', archived: false }],
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, hidden: false })),
    transactions: [],
    budgets: [],
    gamification: {
      streakCount: 0,
      longestStreak: 0,
      lastLoggedDate: null,
      freezeUsedOn: null,
      badges: [],
      inputStats: { count: 0, totalMs: 0 },
    },
  };
}

let available = null;
export function isAvailable() {
  if (available !== null) return available;
  try {
    const k = 'duitku.__probe';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    available = true;
  } catch {
    available = false;
  }
  return available;
}

function normalize(d) {
  const base = createDefaultState();
  const g = d.gamification || {};
  return {
    ...base,
    ...d,
    settings: { ...base.settings, ...(d.settings || {}) },
    gamification: {
      ...base.gamification,
      ...g,
      badges: Array.isArray(g.badges) ? g.badges : [],
      inputStats: { ...base.gamification.inputStats, ...(g.inputStats || {}) },
    },
    wallets: Array.isArray(d.wallets) && d.wallets.length ? d.wallets : base.wallets,
    categories: Array.isArray(d.categories) ? d.categories : base.categories,
    transactions: Array.isArray(d.transactions) ? d.transactions : [],
    budgets: Array.isArray(d.budgets) ? d.budgets : [],
  };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function validate(d) {
  if (!d || typeof d !== 'object') return 'format tidak dikenal';
  if (!Number.isInteger(d.schemaVersion)) return 'schemaVersion tidak ada';
  for (const k of ['wallets', 'categories', 'transactions']) {
    if (!Array.isArray(d[k])) return `bagian ${k} tidak ada`;
  }
  if (d.budgets != null && !Array.isArray(d.budgets)) return 'bagian budgets rusak';
  for (const w of d.wallets) {
    if (!w || typeof w.id !== 'string' || !Number.isInteger(w.initialBalance)) return 'data dompet rusak';
  }
  for (const c of d.categories) {
    if (!c || typeof c.id !== 'string' || !['income', 'expense'].includes(c.type)) return 'data kategori rusak';
  }
  for (const t of d.transactions) {
    if (!t || typeof t.id !== 'string') return 'transaksi tanpa id';
    if (!['income', 'expense'].includes(t.type)) return `jenis transaksi ${t.id} tidak dikenal`;
    if (!Number.isInteger(t.amount) || t.amount <= 0) return `nominal transaksi ${t.id} tidak valid`;
    if (!DATE_RE.test(t.date)) return `tanggal transaksi ${t.id} tidak valid`;
  }
  return null;
}

function migrate(d) {
  while (d.schemaVersion < SCHEMA_VERSION) {
    const fn = migrations[d.schemaVersion];
    if (!fn) throw new Error(`Tidak ada migrasi dari versi ${d.schemaVersion}`);
    d = fn(d);
  }
  return d;
}

/**
 * Status: ok | new | unavailable | corrupt | too-new | migration-failed
 */
export function loadState() {
  if (!isAvailable()) return { status: 'unavailable', state: createDefaultState() };
  let raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return { status: 'unavailable', state: createDefaultState() };
  }
  if (!raw) return { status: 'new', state: createDefaultState() };
  let d;
  try {
    d = JSON.parse(raw);
  } catch {
    return { status: 'corrupt', state: createDefaultState() };
  }
  if (validate(d)) return { status: 'corrupt', state: createDefaultState() };
  if (d.schemaVersion > SCHEMA_VERSION) return { status: 'too-new', state: normalize(d) };
  if (d.schemaVersion < SCHEMA_VERSION) {
    try {
      localStorage.setItem(`duitku.backup.v${d.schemaVersion}`, raw);
      d = migrate(d);
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch (error) {
      return { status: 'migration-failed', state: normalize(JSON.parse(raw)), error };
    }
  }
  return { status: 'ok', state: normalize(d) };
}

/** Salin data rusak ke kunci cadangan supaya bisa mulai baru tanpa kehilangan apa pun. */
export function quarantineCorrupt() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) localStorage.setItem(`duitku.corrupt.${Date.now()}`, raw);
    localStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}

function isQuotaError(e) {
  return (
    e instanceof DOMException &&
    (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014)
  );
}

/**
 * Tulis seluruh state secara atomik ke satu kunci.
 * Menolak penulisan dari state kedaluwarsa (tab lain sudah menulis versi lebih baru).
 */
export function saveState(state) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      let cur = null;
      try {
        cur = JSON.parse(raw);
      } catch {}
      if (cur && (cur._rev || 0) > (state._rev || 0)) {
        return { ok: false, reason: 'conflict', state: normalize(cur) };
      }
    }
    const prev = state._rev || 0;
    state._rev = prev + 1;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      state._rev = prev;
      throw e;
    }
    return { ok: true };
  } catch (e) {
    if (isQuotaError(e)) return { ok: false, reason: 'quota', error: e };
    return { ok: false, reason: 'error', error: e };
  }
}

export function exportState(state) {
  const { _rev, ...rest } = state;
  return JSON.stringify({ ...rest, exportedAt: new Date().toISOString() }, null, 2);
}

/** Validasi dan normalisasi berkas impor. Melempar Error dengan pesan yang ramah. */
export function importState(text) {
  let d;
  try {
    d = JSON.parse(text);
  } catch {
    throw new Error('Berkas ini bukan JSON yang valid. Pastikan kamu memilih berkas hasil ekspor Duitku.');
  }
  if (!d || typeof d !== 'object' || !('schemaVersion' in d)) {
    throw new Error('Berkas ini bukan backup Duitku (tidak ada schemaVersion).');
  }
  if (!Number.isInteger(d.schemaVersion) || d.schemaVersion < 1) {
    throw new Error('Versi data di berkas ini tidak dikenal.');
  }
  if (d.schemaVersion > SCHEMA_VERSION) {
    throw new Error(
      `Backup ini dibuat oleh Duitku versi lebih baru (data v${d.schemaVersion}). Muat ulang halaman untuk memperbarui aplikasi, lalu coba lagi.`
    );
  }
  const err = validate(d);
  if (err) throw new Error(`Isi berkas tidak lengkap atau rusak: ${err}.`);
  d = migrate(structuredClone(d));
  delete d.exportedAt;
  delete d._rev;
  return normalize(d);
}

export function usage() {
  let chars = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      chars += k.length + (localStorage.getItem(k) || '').length;
    }
  } catch {}
  return { chars, bytes: chars * 2, pct: chars / QUOTA_CHARS };
}
