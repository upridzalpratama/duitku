import * as store from './storage.js';

/* =========================================================
   Utilitas
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const sum = (arr, f = (x) => x) => arr.reduce((a, x) => a + f(x), 0);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

const nf = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const rp = (n) => (n < 0 ? '−' : '') + 'Rp ' + nf.format(Math.abs(Math.round(n)));
function short(n) {
  const a = Math.abs(n);
  const s = n < 0 ? '−' : '';
  if (a >= 1e9) return s + nf1.format(a / 1e9) + ' M';
  if (a >= 1e6) return s + nf1.format(a / 1e6) + ' jt';
  if (a >= 1e3) return s + nf1.format(a / 1e3) + ' rb';
  return s + nf.format(a);
}
const digits = (s) => String(s ?? '').replace(/\D/g, '');
const parseAmount = (s) => {
  const d = digits(s).slice(0, 13);
  return d ? parseInt(d, 10) : 0;
};

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d || 1);
};
const addDays = (s, n) => {
  const d = parseYmd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
};
const monthKey = (s) => s.slice(0, 7);
const addMonths = (mk, n) => {
  const [y, m] = mk.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const daysInMonth = (mk) => {
  const [y, m] = mk.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};
const daysBetween = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 864e5);
const monthLabel = (mk) => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(parseYmd(mk + '-01'));
const monthShort = (mk) => new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(parseYmd(mk + '-01')).replace('.', '');
function dayLabel(s) {
  const t = ymd();
  if (s === t) return 'Hari ini';
  if (s === addDays(t, -1)) return 'Kemarin';
  const opt = { weekday: 'long', day: 'numeric', month: 'long' };
  if (s.slice(0, 4) !== t.slice(0, 4)) opt.year = 'numeric';
  return new Intl.DateTimeFormat('id-ID', opt).format(parseYmd(s));
}
const uid = (p) =>
  p + '_' + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const ICON = {
  back: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  chev: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>',
  search: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  filter: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l-6 8v5l-4 2v-7z"/></svg>',
  trash: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  close: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  del: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11v12H9l-6-6z"/><path d="M12 10l4 4M16 10l-4 4"/></svg>',
  down: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v12M6 10l6 6 6-6M4 20h16"/></svg>',
  up: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V8M6 14l6-6 6 6M4 4h16"/></svg>',
  plus: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
};

const EMOJIS = ['🍜', '🍔', '☕', '🧋', '🛵', '🚗', '⛽', '🛍️', '👕', '🧾', '💡', '📱', '🎮', '🎬', '🎵', '💊', '🏥', '📚', '🎓', '📦', '🏠', '🐾', '👶', '🎁', '💼', '💻', '✨', '💰', '🏦', '📈', '✈️', '🧴', '💇', '🎉', '🙏', '🚌'];
const WALLET_ICONS = ['👛', '💵', '💳', '🏦', '📱', '🪙', '🐷', '💼'];
const COLORS = ['#F97316', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1', '#0EA5E9', '#14B8A6', '#10B981', '#16A34A', '#EAB308', '#F59E0B', '#64748B'];

/* =========================================================
   State & persistensi
   ========================================================= */
const loaded = store.loadState();
let S = loaded.state;
let bootStatus = loaded.status;
const storageOK = bootStatus !== 'unavailable';
let writeBlocked = ['too-new', 'corrupt', 'migration-failed'].includes(bootStatus);

const ui = {
  tab: 'home',
  sub: null,
  ob: 0,
  obWallets: null,
  hist: { q: '', type: 'all', from: '', to: '', cat: '', wallet: '', limit: 150, showFilters: false },
  reportMonth: monthKey(ymd()),
  budgetMonth: monthKey(ymd()),
  catTab: 'expense',
  updateWorker: null,
  installEvt: null,
};

let saveTimer = null;
let quotaWarned = false;
function flush() {
  clearTimeout(saveTimer);
  saveTimer = null;
  if (!storageOK || writeBlocked) return;
  const r = store.saveState(S);
  if (r.ok) return;
  if (r.reason === 'conflict') {
    S = r.state;
    snack('Data diperbarui dari tab lain, perubahan terakhir di tab ini tidak disimpan.', { now: true });
    render();
  } else if (r.reason === 'quota') {
    if (!quotaWarned) showQuotaDialog();
    quotaWarned = true;
  } else {
    snack('Gagal menyimpan ke browser. Coba ekspor data sebagai cadangan.', { now: true });
  }
}
function persist(immediate = true) {
  clearTimeout(saveTimer);
  if (immediate) flush();
  else saveTimer = setTimeout(flush, 300);
}
/** Semua perubahan lewat sini: ubah state, langsung tulis, render ulang. */
function commit(fn, { immediate = true, silent = false } = {}) {
  if (writeBlocked) {
    snack('Perubahan diblokir supaya data lama tidak rusak. Lihat pesan di atas.', { now: true });
    return false;
  }
  fn(S);
  persist(immediate);
  if (!silent) render();
  return true;
}

/* =========================================================
   Data turunan (tidak pernah disimpan, selalu dihitung)
   ========================================================= */
const cat = (id) => S.categories.find((c) => c.id === id);
const wallet = (id) => S.wallets.find((w) => w.id === id);
const walletName = (id) => wallet(id)?.name || 'Dompet';
const activeWallets = () => S.wallets.filter((w) => !w.archived);
const isReportable = (t) => !t.transferGroupId;

function walletBalance(id) {
  const w = wallet(id);
  let b = w ? w.initialBalance : 0;
  for (const t of S.transactions) if (t.walletId === id) b += t.type === 'income' ? t.amount : -t.amount;
  return b;
}
const totalBalance = () => sum(S.wallets, (w) => walletBalance(w.id));

function monthTx(mk) {
  return S.transactions.filter((t) => isReportable(t) && t.date.startsWith(mk));
}
function monthTotals(mk) {
  let income = 0,
    expense = 0;
  for (const t of monthTx(mk)) t.type === 'income' ? (income += t.amount) : (expense += t.amount);
  return { income, expense };
}
const budgetsFor = (mk) => S.budgets.filter((b) => b.period === mk && b.limit > 0);
function spentByCat(mk) {
  const m = new Map();
  for (const t of monthTx(mk)) if (t.type === 'expense') m.set(t.categoryId, (m.get(t.categoryId) || 0) + t.amount);
  return m;
}
function budgetStatus(catId, mk) {
  const b = budgetsFor(mk).find((x) => x.categoryId === catId);
  if (!b) return null;
  const spent = spentByCat(mk).get(catId) || 0;
  return { b, spent, pct: spent / b.limit };
}
const levelOf = (pct) => (pct > 1 ? 'over' : pct >= 0.8 ? 'warn' : 'ok');

/** Angka "Aman dipakai hari ini" = (sisa anggaran bulan) / (sisa hari), dikurangi yang sudah keluar hari ini. */
function safeInfo() {
  const t = ymd();
  const mk = monthKey(t);
  const bs = budgetsFor(mk);
  if (!bs.length) return null;
  const ids = new Set(bs.map((b) => b.categoryId));
  const total = sum(bs, (b) => b.limit);
  let before = 0,
    today = 0;
  for (const x of monthTx(mk)) {
    if (x.type !== 'expense' || !ids.has(x.categoryId)) continue;
    if (x.date < t) before += x.amount;
    else if (x.date === t) today += x.amount;
  }
  const daysLeft = daysInMonth(mk) - parseYmd(t).getDate() + 1;
  const allowance = Math.floor((total - before) / daysLeft);
  const spent = before + today;
  return { total, spent, today, allowance, safe: allowance - today, daysLeft, pct: spent / total, count: bs.length };
}

function moodOf(info) {
  if (!info) return { key: 'calm', emoji: '😌', label: 'Santai' };
  const p = info.pct;
  if (p < 0.6) return { key: 'great', emoji: '😄', label: 'Lega banget' };
  if (p < 0.8) return { key: 'good', emoji: '🙂', label: 'Aman terkendali' };
  if (p <= 1) return { key: 'careful', emoji: '😐', label: 'Pelan-pelan dulu' };
  return { key: 'over', emoji: '😮‍💨', label: 'Lewat sedikit' };
}

function categoryUsage30() {
  const from = addDays(ymd(), -30);
  const m = new Map();
  for (const t of S.transactions) if (t.categoryId && t.date >= from) m.set(t.categoryId, (m.get(t.categoryId) || 0) + 1);
  return m;
}
function sortedCats(type, includeId) {
  const use = categoryUsage30();
  const list = S.categories.filter((c) => c.type === type && (!c.hidden || c.id === includeId));
  const order = new Map(list.map((c, i) => [c.id, i]));
  return list.sort((a, b) => (use.get(b.id) || 0) - (use.get(a.id) || 0) || order.get(a.id) - order.get(b.id));
}

const txSorted = (list) =>
  list.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.createdAt || '').localeCompare(a.createdAt || '')));

/** Gabungkan pasangan transfer menjadi satu baris tampilan. */
function displayItems(list) {
  const groups = new Map();
  for (const t of S.transactions) {
    if (!t.transferGroupId) continue;
    const g = groups.get(t.transferGroupId) || {};
    g[t.type === 'expense' ? 'from' : 'to'] = t;
    groups.set(t.transferGroupId, g);
  }
  const seen = new Set();
  const out = [];
  for (const t of list) {
    if (t.transferGroupId) {
      if (seen.has(t.transferGroupId)) continue;
      seen.add(t.transferGroupId);
      const g = groups.get(t.transferGroupId);
      out.push({ kind: 'transfer', id: (g.from || t).id, date: t.date, amount: t.amount, from: g.from, to: g.to, tx: t });
    } else out.push({ kind: t.type, id: t.id, date: t.date, amount: t.amount, tx: t });
  }
  return out;
}

/* ---------- Gamifikasi ---------- */
function freezeAvailableFor(dateStr) {
  const f = S.gamification.freezeUsedOn;
  return !f || monthKey(f) !== monthKey(dateStr);
}
function currentStreak() {
  const g = S.gamification;
  const t = ymd();
  if (!g.lastLoggedDate) return 0;
  if (g.lastLoggedDate === t || g.lastLoggedDate === addDays(t, -1)) return g.streakCount;
  if (g.lastLoggedDate === addDays(t, -2) && freezeAvailableFor(addDays(t, -1))) return g.streakCount;
  return 0;
}
/** Dipanggil saat transaksi baru tercatat. Mengembalikan pesan khusus bila freeze terpakai. */
function registerLog(s) {
  const g = s.gamification;
  const t = ymd();
  if (g.lastLoggedDate === t) return null;
  let msg = null;
  const y = addDays(t, -1);
  if (g.lastLoggedDate === y) g.streakCount += 1;
  else if (g.lastLoggedDate === addDays(t, -2) && freezeAvailableFor(y)) {
    g.streakCount += 1;
    g.freezeUsedOn = y;
    msg = 'Kemarin bolong, tapi streak kamu aman berkat freeze bulan ini 🧊';
  } else g.streakCount = 1;
  g.lastLoggedDate = t;
  g.longestStreak = Math.max(g.longestStreak || 0, g.streakCount);
  return msg;
}

const BADGES = [
  { id: 'first_entry', icon: '🌱', name: 'Catatan pertama', desc: 'Mencatat transaksi pertama', test: () => S.transactions.length > 0 },
  { id: 'week_streak', icon: '🔥', name: 'Catat 7 hari', desc: 'Streak 7 hari berturut-turut', test: () => S.gamification.longestStreak >= 7 },
  { id: 'streak_21', icon: '🏅', name: '21 hari beruntun', desc: 'Kebiasaan sudah terbentuk', test: () => S.gamification.longestStreak >= 21 },
  { id: 'tx_100', icon: '💯', name: '100 transaksi', desc: 'Mencatat 100 transaksi', test: () => S.transactions.filter(isReportable).length >= 100 },
  { id: 'budget_3', icon: '🎯', name: 'Punya rencana', desc: 'Pasang anggaran untuk 3 kategori', test: () => budgetsFor(monthKey(ymd())).length >= 3 },
  {
    id: 'under_budget',
    icon: '🧘',
    name: 'Sebulan di bawah anggaran',
    desc: 'Satu bulan penuh tidak melewati total anggaran',
    test: () => {
      const mk = addMonths(monthKey(ymd()), -1);
      const bs = budgetsFor(mk);
      if (!bs.length) return false;
      const sp = spentByCat(mk);
      return sum(bs, (b) => sp.get(b.categoryId) || 0) <= sum(bs, (b) => b.limit);
    },
  },
  { id: 'first_backup', icon: '🛟', name: 'Data aman', desc: 'Pertama kali ekspor backup', test: () => !!S.settings.lastBackupAt },
];
function checkBadges() {
  const got = new Set(S.gamification.badges);
  const fresh = BADGES.filter((b) => !got.has(b.id) && b.test());
  if (!fresh.length) return;
  commit((s) => s.gamification.badges.push(...fresh.map((b) => b.id)), { silent: true });
  if (!S.settings.quietMode) snack(`${fresh.map((b) => b.icon).join('')} Badge baru: ${fresh.map((b) => b.name).join(', ')}`, { duration: 3500 });
}

/* ---------- Rekap mingguan & pengingat backup ---------- */
function weekStart(t = ymd()) {
  const dow = (parseYmd(t).getDay() + 6) % 7;
  return addDays(t, -dow);
}
function weeklyRecap() {
  const mon = weekStart();
  if (S.settings.recapDismissedWeek === mon) return null;
  const start = addDays(mon, -7);
  const end = addDays(mon, -1);
  const inRange = (t, a, b) => isReportable(t) && t.date >= a && t.date <= b;
  const last = S.transactions.filter((t) => inRange(t, start, end));
  if (!last.length) return null;
  const prev = S.transactions.filter((t) => inRange(t, addDays(start, -7), addDays(start, -1)));
  const exp = sum(last.filter((t) => t.type === 'expense'), (t) => t.amount);
  const prevExp = sum(prev.filter((t) => t.type === 'expense'), (t) => t.amount);
  const byCat = new Map();
  for (const t of last) if (t.type === 'expense') byCat.set(t.categoryId, (byCat.get(t.categoryId) || 0) + t.amount);
  const top = [...byCat].sort((a, b) => b[1] - a[1])[0];
  const days = new Set(last.map((t) => t.date)).size;
  let finding;
  if (top && exp) {
    const c = cat(top[0]);
    finding = `Paling banyak ke ${c?.icon || ''} ${esc(c?.name || 'Lainnya')}: ${rp(top[1])} (${Math.round((top[1] / exp) * 100)}% pengeluaran minggu lalu).`;
  } else finding = 'Minggu lalu kamu cuma mencatat pemasukan. Pengeluarannya jangan lupa dicatat juga ya.';
  let compare = '';
  if (prevExp > 0 && exp > 0) {
    const d = Math.round(((exp - prevExp) / prevExp) * 100);
    compare = d < 0 ? `${Math.abs(d)}% lebih sedikit dari minggu sebelumnya.` : d > 0 ? `${d}% lebih banyak dari minggu sebelumnya.` : 'Sama persis dengan minggu sebelumnya.';
  }
  let tip;
  const mk = monthKey(ymd());
  const bst = top && budgetStatus(top[0], mk);
  if (bst) {
    const left = bst.b.limit - bst.spent;
    const dl = daysInMonth(mk) - parseYmd(ymd()).getDate() + 1;
    tip = left > 0 ? `Sisa jatah ${esc(cat(top[0])?.name)} bulan ini ${rp(left)}, kira-kira ${rp(left / dl)} per hari.` : `Jatah ${esc(cat(top[0])?.name)} bulan ini sudah habis. Mau naikkan anggarannya atau tahan dulu minggu ini?`;
  } else if (top) tip = `Coba pasang anggaran untuk ${esc(cat(top[0])?.name)} supaya kelihatan batasnya.`;
  else tip = 'Pasang anggaran bulanan supaya angka aman dipakai hari ini muncul di beranda.';
  return { mon, exp, days, finding, compare, tip };
}
function needsBackup() {
  const s = S.settings;
  if (!S.transactions.length) return false;
  const t = ymd();
  if (s.backupSnoozeUntil && t < s.backupSnoozeUntil) return false;
  const since = s.lastBackupAt || s.firstUseAt;
  if (since && daysBetween(ymd(new Date(since)), t) >= 30) return true;
  const newCount = S.transactions.filter((x) => !s.lastBackupAt || (x.createdAt || '') > s.lastBackupAt).length;
  return newCount >= 100;
}

/* =========================================================
   Render: komponen kecil
   ========================================================= */
const signed = (kind, amount) =>
  kind === 'income' ? '+' + rp(amount) : kind === 'expense' ? '−' + rp(amount) : rp(amount);

function rowHTML(it) {
  let icon, color, title, sub, cls;
  if (it.kind === 'transfer') {
    icon = '⇄';
    color = '#64748B';
    title = 'Transfer';
    sub = `${walletName(it.from?.walletId)} → ${walletName(it.to?.walletId)}${it.tx.note ? ' · ' + it.tx.note : ''}`;
    cls = 'tr';
  } else {
    const c = cat(it.tx.categoryId);
    icon = c?.icon || '❔';
    color = c?.color || '#64748B';
    title = c?.name || 'Tanpa kategori';
    sub = [it.tx.note, S.wallets.length > 1 ? walletName(it.tx.walletId) : ''].filter(Boolean).join(' · ');
    cls = it.kind === 'income' ? 'in' : 'out';
  }
  const amt = signed(it.kind, it.amount);
  return `<li class="tx" data-id="${it.id}">
    <button type="button" class="tx-del" data-act="del" data-id="${it.id}" tabindex="-1" aria-hidden="true">${ICON.trash}<span>Hapus</span></button>
    <button type="button" class="tx-main" data-act="edit" data-id="${it.id}" aria-label="${esc(title)}, ${esc(amt)}${sub ? ', ' + esc(sub) : ''}. Ketuk untuk edit.">
      <span class="tx-ic" style="--c:${color}" aria-hidden="true">${icon}</span>
      <span class="tx-text"><span class="tx-title">${esc(title)}</span>${sub ? `<span class="tx-sub">${esc(sub)}</span>` : ''}</span>
      <span class="tx-amt ${cls}">${amt}</span>
    </button>
  </li>`;
}

function groupedHTML(items, limit = Infinity, nets) {
  const groups = [];
  let cur = null;
  for (const it of items.slice(0, limit)) {
    if (!cur || cur.date !== it.date) {
      cur = { date: it.date, items: [] };
      groups.push(cur);
    }
    cur.items.push(it);
  }
  if (!nets) {
    nets = new Map();
    for (const it of items) {
      const v = it.kind === 'income' ? it.amount : it.kind === 'expense' ? -it.amount : 0;
      nets.set(it.date, (nets.get(it.date) || 0) + v);
    }
  }
  return groups
    .map((g) => {
      const net = nets.get(g.date) || 0;
      return `<section class="day">
        <h3 class="day-h"><span>${dayLabel(g.date)}</span><span class="day-net ${net > 0 ? 'in' : net < 0 ? 'out' : ''}">${net > 0 ? '+' : ''}${rp(net)}</span></h3>
        <ul class="tx-list">${g.items.map(rowHTML).join('')}</ul>
      </section>`;
    })
    .join('');
}

function progressHTML(pct, label) {
  const lvl = levelOf(pct);
  const p = Math.round(pct * 100);
  return `<div class="progress ${lvl}" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${clamp(p, 0, 100)}" aria-valuetext="${p} persen terpakai"><span style="width:${clamp(p, 0, 100)}%"></span></div>`;
}

function emptyHTML(icon, title, text, btn) {
  return `<div class="empty"><div class="empty-ic" aria-hidden="true">${icon}</div><h3>${title}</h3><p>${text}</p>${btn || ''}</div>`;
}

const pageHead = (title, backTo, right = '') =>
  `<header class="top">${backTo ? `<a class="back" href="#/${backTo}" aria-label="Kembali">${ICON.back}</a>` : ''}<h1 class="h1">${title}</h1>${right}</header>`;

/* =========================================================
   Layar: Onboarding (maksimal 3 layar, tanpa akun)
   ========================================================= */
function onboardingHTML() {
  const step = ui.ob;
  const dots = `<div class="ob-dots" aria-label="Langkah ${step + 1} dari 3">${[0, 1, 2].map((i) => `<span class="${i === step ? 'on' : ''}"></span>`).join('')}</div>`;
  if (step === 0) {
    return `<section class="ob">
      ${dots}
      <div class="ob-hero" aria-hidden="true">💸</div>
      <h1 class="ob-title">Uangmu lari ke mana? Yuk, cari tahu.</h1>
      <p class="ob-text">Catat pemasukan dan pengeluaran dalam hitungan detik. Tanpa daftar akun, langsung pakai.</p>
      <div class="note-card"><b>🔒 Datamu tetap di HP ini.</b><br>Semua catatan disimpan di browser perangkat ini dan tidak dikirim ke server mana pun. Karena itu, kalau data browser dihapus, catatan ikut hilang. Duitku akan rutin mengingatkanmu ekspor backup.</div>
      <div class="ob-actions">
        <button class="btn primary big" data-act="ob-next">Mulai</button>
        <button class="btn ghost" data-act="import">Sudah punya backup? Impor</button>
        <button class="btn ghost small" data-act="ob-skip">Lewati, langsung catat</button>
      </div>
    </section>`;
  }
  if (step === 1) {
    const ws = ui.obWallets;
    const presets = [
      ['Tunai', '💵'],
      ['Rekening', '🏦'],
      ['GoPay', '📱'],
      ['OVO', '📱'],
      ['DANA', '📱'],
    ].filter(([n]) => !ws.some((w) => w.name === n));
    return `<section class="ob">
      ${dots}
      <h1 class="ob-title">Uangmu ada di mana saja?</h1>
      <p class="ob-text">Isi saldo sekarang di tiap tempat. Boleh dikira-kira, nanti bisa diubah.</p>
      <div class="ob-wallets">
        ${ws
          .map(
            (w, i) => `<div class="ob-wallet">
            <span class="ob-w-ic" aria-hidden="true">${w.icon}</span>
            <label class="ob-w-name"><span class="sr-only">Nama dompet</span><input type="text" value="${esc(w.name)}" data-ob-name="${i}" maxlength="24"></label>
            <label class="money-in"><span aria-hidden="true">Rp</span><span class="sr-only">Saldo ${esc(w.name)}</span><input type="text" inputmode="numeric" placeholder="0" value="${w.balance ? nf.format(w.balance) : ''}" data-ob-bal="${i}" data-money></label>
            ${ws.length > 1 ? `<button class="icon-btn" data-act="ob-remove" data-i="${i}" aria-label="Hapus ${esc(w.name)}">${ICON.close}</button>` : ''}
          </div>`
          )
          .join('')}
      </div>
      ${presets.length ? `<p class="small muted">Tambah tempat lain:</p><div class="chips wrap">${presets.map(([n, ic]) => `<button class="chip" data-act="ob-add" data-name="${n}" data-icon="${ic}">+ ${n}</button>`).join('')}</div>` : ''}
      <div class="ob-actions">
        <button class="btn primary big" data-act="ob-next">Lanjut</button>
        <button class="btn ghost" data-act="ob-back">Kembali</button>
      </div>
    </section>`;
  }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return `<section class="ob">
    ${dots}
    <div class="ob-hero" aria-hidden="true">🚀</div>
    <h1 class="ob-title">Siap! Satu kebiasaan kecil saja.</h1>
    <ul class="ob-list">
      <li><span aria-hidden="true">➕</span><div><b>Ketuk tombol + setelah bayar.</b> Isi nominal, pilih kategori, simpan. Kurang dari 5 detik.</div></li>
      <li><span aria-hidden="true">🔥</span><div><b>Catat tiap hari,</b> streak-mu naik. Lupa sehari? Ada jatah freeze sekali sebulan.</div></li>
      <li><span aria-hidden="true">📲</span><div><b>Pasang di layar utama</b> supaya bisa dibuka offline dan data lebih awet${isIOS ? ' (Safari: tombol Bagikan → Tambahkan ke Layar Utama)' : ''}.</div></li>
    </ul>
    <div class="ob-actions">
      ${ui.installEvt ? '<button class="btn big" data-act="install">📲 Pasang aplikasi</button>' : ''}
      <button class="btn primary big" data-act="ob-finish">Mulai catat</button>
      <button class="btn ghost" data-act="ob-back">Kembali</button>
    </div>
  </section>`;
}

function finishOnboarding(wallets) {
  commit((s) => {
    s.wallets = wallets.map((w, i) => ({
      id: i === 0 ? 'w_main' : uid('w'),
      name: (w.name || '').trim() || `Dompet ${i + 1}`,
      initialBalance: w.balance || 0,
      icon: w.icon,
      archived: false,
    }));
    s.settings.onboarded = true;
    s.settings.firstUseAt = new Date().toISOString();
  });
  location.hash = '#/';
}

/* =========================================================
   Layar: Beranda
   ========================================================= */
function greeting() {
  const h = new Date().getHours();
  return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 19 ? 'Selamat sore' : 'Selamat malam';
}

function homeHTML() {
  const t = ymd();
  const mk = monthKey(t);
  const tot = monthTotals(mk);
  const info = safeInfo();
  const mood = moodOf(info);
  const streak = currentStreak();
  const recent = displayItems(txSorted(S.transactions)).slice(0, 5);
  const recap = weeklyRecap();
  const prevBudgets = budgetsFor(addMonths(mk, -1)).length;

  let safeCard;
  if (info) {
    let msg;
    if (info.allowance <= 0)
      msg = `Anggaran bulan ini sudah terpakai ${rp(info.spent)} dari ${rp(info.total)}. Mau naikkan anggarannya atau tahan dulu sampai bulan depan?`;
    else if (info.safe < 0) msg = `Hari ini sudah lewat ${rp(-info.safe)} dari jatah harian. Besok jatahnya menyesuaikan otomatis.`;
    else msg = `Jatah harian ${rp(info.allowance)} · sisa ${info.daysLeft} hari bulan ini`;
    safeCard = `<section class="card safe" aria-labelledby="safe-h">
      <div class="row-between"><h2 id="safe-h" class="label">Aman dipakai hari ini</h2><a class="link" href="#/pengaturan/anggaran">Anggaran ${ICON.chev}</a></div>
      <div class="safe-amt">${rp(Math.max(0, info.safe))}</div>
      <p class="small muted">${msg}</p>
      ${progressHTML(info.pct, 'Anggaran bulan ini')}
      <div class="row-between small muted"><span>Terpakai ${rp(info.spent)} dari ${rp(info.total)}</span><b class="pct ${levelOf(info.pct)}">${Math.round(info.pct * 100)}%</b></div>
    </section>`;
  } else {
    safeCard = `<section class="card cta">
      <div class="cta-ic" aria-hidden="true">🎯</div>
      <div>
        <h2 class="h3">Berapa yang aman dipakai hari ini?</h2>
        <p class="small muted">Pasang anggaran bulanan per kategori, nanti Duitku hitungkan jatah harianmu.</p>
        <div class="btn-row">
          <a class="btn primary" href="#/pengaturan/anggaran">Atur anggaran</a>
          ${prevBudgets ? '<button class="btn" data-act="copy-budgets">Salin dari bulan lalu</button>' : ''}
        </div>
      </div>
    </section>`;
  }

  const banners = [];
  if (needsBackup()) {
    banners.push(`<section class="card notice" aria-label="Pengingat backup">
      <div class="notice-ic" aria-hidden="true">🛟</div>
      <div><b>Waktunya backup.</b><p class="small muted">${S.settings.lastBackupAt ? 'Sudah lama sejak backup terakhir.' : 'Kamu belum pernah ekspor data.'} Simpan salinan supaya catatan aman kalau browser dibersihkan.</p>
      <div class="btn-row"><button class="btn primary" data-act="export-json">Ekspor sekarang</button><button class="btn ghost" data-act="snooze-backup">Nanti saja</button></div></div>
    </section>`);
  }
  if (recap) {
    banners.push(`<section class="card recap" aria-labelledby="recap-h">
      <div class="row-between"><h2 id="recap-h" class="h3">📬 Rekap minggu lalu</h2><button class="icon-btn" data-act="dismiss-recap" aria-label="Tutup rekap">${ICON.close}</button></div>
      <p class="recap-big">${rp(recap.exp)} <span class="small muted">keluar · tercatat ${recap.days} dari 7 hari</span></p>
      <p>🔎 ${recap.finding}${recap.compare ? ' ' + recap.compare : ''}</p>
      <p>💡 ${recap.tip}</p>
    </section>`);
  }

  return `
    <header class="top home-top">
      <div><p class="eyebrow">${greeting()} 👋</p><h1 class="h1">Duitku</h1></div>
      <button class="streak ${streak ? 'on' : ''}" data-act="streak-info" aria-label="Streak ${streak} hari. Lihat detail">
        <span aria-hidden="true">🔥</span><b>${streak}</b><span class="small">hari</span>
      </button>
    </header>

    <section class="card balance mood-${mood.key}" aria-labelledby="bal-h">
      <div class="row-between"><h2 id="bal-h" class="label">Total saldo</h2><span class="mood" title="Mood keuangan"><span aria-hidden="true">${mood.emoji}</span> ${mood.label}</span></div>
      <div class="bal-amt">${rp(totalBalance())}</div>
      <div class="bal-row">
        <div><span class="label">↑ Masuk ${monthShort(mk)}</span><b>+${rp(tot.income)}</b></div>
        <div><span class="label">↓ Keluar ${monthShort(mk)}</span><b>−${rp(tot.expense)}</b></div>
      </div>
    </section>

    ${safeCard}
    ${banners.join('')}

    <section class="section" aria-labelledby="recent-h">
      <div class="row-between"><h2 id="recent-h" class="h2">Catatan terakhir</h2>${recent.length ? `<a class="link" href="#/riwayat">Lihat semua ${ICON.chev}</a>` : ''}</div>
      ${
        recent.length
          ? groupedHTML(recent)
          : emptyHTML('📝', 'Belum ada catatan', 'Habis bayar sesuatu? Catat sekarang, cuma butuh beberapa detik.', '<button class="btn primary" data-act="open-sheet">+ Catat transaksi pertama</button>')
      }
    </section>`;
}

/* =========================================================
   Layar: Riwayat
   ========================================================= */
function historyFiltered() {
  const h = ui.hist;
  const q = h.q.trim().toLowerCase();
  const qd = digits(q);
  let items = displayItems(txSorted(S.transactions));
  return items.filter((it) => {
    if (h.type !== 'all' && it.kind !== h.type) return false;
    if (h.from && it.date < h.from) return false;
    if (h.to && it.date > h.to) return false;
    if (h.cat && (it.kind === 'transfer' || it.tx.categoryId !== h.cat)) return false;
    if (h.wallet) {
      if (it.kind === 'transfer') {
        if (it.from?.walletId !== h.wallet && it.to?.walletId !== h.wallet) return false;
      } else if (it.tx.walletId !== h.wallet) return false;
    }
    if (q) {
      const note = (it.tx.note || '').toLowerCase();
      const cname = it.kind === 'transfer' ? 'transfer' : (cat(it.tx.categoryId)?.name || '').toLowerCase();
      const hit = note.includes(q) || cname.includes(q) || (qd && String(it.amount).includes(qd));
      if (!hit) return false;
    }
    return true;
  });
}
const activeFilterCount = () => ['from', 'to', 'cat', 'wallet'].filter((k) => ui.hist[k]).length;

function historyListHTML() {
  if (!S.transactions.length)
    return emptyHTML('🗂️', 'Riwayat masih kosong', 'Semua yang kamu catat akan muncul di sini, dikelompokkan per hari.', '<button class="btn primary" data-act="open-sheet">+ Catat sekarang</button>');
  const items = historyFiltered();
  if (!items.length)
    return emptyHTML('🔍', 'Tidak ada yang cocok', 'Coba kata kunci lain atau longgarkan filternya.', '<button class="btn" data-act="reset-filters">Hapus semua filter</button>');
  let inc = 0,
    exp = 0;
  for (const it of items) it.kind === 'income' ? (inc += it.amount) : it.kind === 'expense' ? (exp += it.amount) : 0;
  const more = items.length > ui.hist.limit;
  return `<p class="hist-sum small muted">${items.length} transaksi · <span class="in">+${rp(inc)}</span> · <span class="out">−${rp(exp)}</span></p>
    <p class="small muted hint">Geser baris ke kiri untuk hapus, ketuk untuk edit.</p>
    ${groupedHTML(items, ui.hist.limit)}
    ${more ? '<div id="more" class="more small muted">Memuat lagi…</div>' : ''}`;
}

function historyHTML() {
  const h = ui.hist;
  const types = [
    ['all', 'Semua'],
    ['expense', '− Keluar'],
    ['income', '+ Masuk'],
    ['transfer', '⇄ Transfer'],
  ];
  const n = activeFilterCount();
  const t = ymd();
  const mk = monthKey(t);
  const ranges = [
    ['Bulan ini', mk + '-01', mk + '-' + pad(daysInMonth(mk))],
    ['Bulan lalu', addMonths(mk, -1) + '-01', addMonths(mk, -1) + '-' + pad(daysInMonth(addMonths(mk, -1)))],
    ['7 hari', addDays(t, -6), t],
  ];
  const filters = h.showFilters
    ? `<div class="card filters" id="filters">
        <div class="chips wrap">${ranges.map(([l, a, b]) => `<button class="chip ${h.from === a && h.to === b ? 'on' : ''}" data-act="range" data-from="${a}" data-to="${b}">${l}</button>`).join('')}</div>
        <div class="grid2">
          <label class="field"><span>Dari tanggal</span><input type="date" data-hf="from" value="${h.from}"></label>
          <label class="field"><span>Sampai tanggal</span><input type="date" data-hf="to" value="${h.to}"></label>
          <label class="field"><span>Kategori</span><select data-hf="cat"><option value="">Semua kategori</option>
            ${['expense', 'income'].map((ty) => `<optgroup label="${ty === 'expense' ? 'Pengeluaran' : 'Pemasukan'}">${S.categories.filter((c) => c.type === ty).map((c) => `<option value="${c.id}" ${h.cat === c.id ? 'selected' : ''}>${c.icon} ${esc(c.name)}${c.hidden ? ' (disembunyikan)' : ''}</option>`).join('')}</optgroup>`).join('')}
          </select></label>
          <label class="field"><span>Dompet</span><select data-hf="wallet"><option value="">Semua dompet</option>${S.wallets.map((w) => `<option value="${w.id}" ${h.wallet === w.id ? 'selected' : ''}>${w.icon} ${esc(w.name)}</option>`).join('')}</select></label>
        </div>
        ${n ? '<button class="btn ghost small" data-act="reset-filters">Reset filter</button>' : ''}
      </div>`
    : '';
  return `${pageHead('Riwayat')}
    <div class="search"><span aria-hidden="true">${ICON.search}</span><input id="q" type="search" placeholder="Cari catatan, kategori, atau nominal" value="${esc(h.q)}" aria-label="Cari transaksi" autocomplete="off"></div>
    <div class="chips scroll">
      ${types.map(([k, l]) => `<button class="chip ${h.type === k ? 'on' : ''}" data-act="htype" data-type="${k}" aria-pressed="${h.type === k}">${l}</button>`).join('')}
      <button class="chip ${n || h.showFilters ? 'on' : ''}" data-act="toggle-filters" aria-expanded="${h.showFilters}">${ICON.filter} Filter${n ? ` (${n})` : ''}</button>
    </div>
    ${filters}
    <div id="hist-list">${historyListHTML()}</div>`;
}

let moreObserver = null;
function bindMore() {
  moreObserver?.disconnect();
  const el = $('#more');
  if (!el) return;
  moreObserver = new IntersectionObserver(
    (en) => {
      if (en.some((e) => e.isIntersecting)) {
        ui.hist.limit += 150;
        renderHistoryList();
      }
    },
    { rootMargin: '400px' }
  );
  moreObserver.observe(el);
}
function renderHistoryList() {
  const box = $('#hist-list');
  if (!box) return;
  box.innerHTML = historyListHTML();
  bindMore();
}

/* =========================================================
   Layar: Laporan (grafik SVG ringan, tanpa pustaka)
   ========================================================= */
function donutSVG(parts, total) {
  const r = 70,
    c = 2 * Math.PI * r;
  let off = 0;
  const segs = parts
    .map((p) => {
      const len = (p.value / total) * c;
      const gap = parts.length > 1 && len > 6 ? 2 : 0;
      const s = `<circle r="${r}" cx="90" cy="90" fill="none" stroke="${p.color}" stroke-width="26" stroke-dasharray="${Math.max(0, len - gap)} ${c}" stroke-dashoffset="${-off}"><title>${esc(p.name)}: ${rp(p.value)}</title></circle>`;
      off += len;
      return s;
    })
    .join('');
  return `<svg viewBox="0 0 180 180" class="donut" role="img" aria-label="Komposisi pengeluaran per kategori">
    <g transform="rotate(-90 90 90)">${segs}</g>
    <text x="90" y="84" text-anchor="middle" class="d-lbl">Total keluar</text>
    <text x="90" y="106" text-anchor="middle" class="d-val">${short(total)}</text>
  </svg>`;
}

function barSVG(months) {
  const W = 320,
    H = 170,
    pl = 8,
    pb = 22,
    pt = 14;
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]));
  const gw = (W - pl * 2) / months.length;
  const bw = Math.min(16, gw / 3);
  const y = (v) => pt + (H - pb - pt) * (1 - v / max);
  const bars = months
    .map((m, i) => {
      const x = pl + gw * i + gw / 2;
      return `<g>
        <rect class="b-in" x="${x - bw - 1}" y="${y(m.income)}" width="${bw}" height="${H - pb - y(m.income)}" rx="4"><title>${monthLabel(m.mk)} masuk ${rp(m.income)}</title></rect>
        <rect class="b-out" x="${x + 1}" y="${y(m.expense)}" width="${bw}" height="${H - pb - y(m.expense)}" rx="4"><title>${monthLabel(m.mk)} keluar ${rp(m.expense)}</title></rect>
        <text x="${x}" y="${H - 6}" text-anchor="middle" class="ax ${m.current ? 'cur' : ''}">${monthShort(m.mk)}</text>
      </g>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Pemasukan dan pengeluaran 6 bulan terakhir">
    <line x1="${pl}" x2="${W - pl}" y1="${H - pb}" y2="${H - pb}" class="base"/>
    <text x="${pl}" y="10" class="ax">${short(max)}</text>
    ${bars}
  </svg>`;
}

function lineSVG(mk) {
  const W = 320,
    H = 150,
    pl = 8,
    pr = 8,
    pb = 22,
    pt = 16;
  const t = ymd();
  const dim = daysInMonth(mk);
  const lastDay = mk === monthKey(t) ? parseYmd(t).getDate() : dim;
  const vals = Array(dim).fill(0);
  for (const x of monthTx(mk)) if (x.type === 'expense') vals[parseInt(x.date.slice(8), 10) - 1] += x.amount;
  const shown = vals.slice(0, lastDay);
  const max = Math.max(1, ...shown);
  const avg = sum(shown) / lastDay;
  const X = (i) => pl + ((W - pl - pr) * i) / Math.max(1, dim - 1);
  const Y = (v) => pt + (H - pb - pt) * (1 - v / max);
  const pts = shown.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const area = `${X(0)},${H - pb} ${pts} ${X(lastDay - 1)},${H - pb}`;
  const peak = shown.indexOf(Math.max(...shown));
  const ticks = [1, 8, 15, 22, dim]
    .map((d) => `<text x="${X(d - 1)}" y="${H - 6}" text-anchor="${d === 1 ? 'start' : d === dim ? 'end' : 'middle'}" class="ax">${d}</text>`)
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Tren pengeluaran harian ${monthLabel(mk)}. Rata-rata ${rp(avg)} per hari">
    <defs><linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" class="lg-a"/><stop offset="1" class="lg-b"/></linearGradient></defs>
    <line x1="${pl}" x2="${W - pr}" y1="${H - pb}" y2="${H - pb}" class="base"/>
    <polygon points="${area}" fill="url(#lg)"/>
    <polyline points="${pts}" class="ln"/>
    <line x1="${pl}" x2="${W - pr}" y1="${Y(avg)}" y2="${Y(avg)}" class="avg"/>
    <text x="${W - pr}" y="${Y(avg) - 4}" text-anchor="end" class="ax">rata-rata ${short(avg)}</text>
    ${shown[peak] ? `<circle cx="${X(peak)}" cy="${Y(shown[peak])}" r="4" class="pk"><title>Tanggal ${peak + 1}: ${rp(shown[peak])}</title></circle>` : ''}
    ${ticks}
  </svg>`;
}

function reportsHTML() {
  const mk = ui.reportMonth;
  const cur = monthKey(ymd());
  const txs = monthTx(mk);
  const nav = `<div class="month-nav">
    <button class="icon-btn" data-act="rmonth" data-d="-1" aria-label="Bulan sebelumnya">${ICON.back}</button>
    <h2 class="h3" aria-live="polite">${monthLabel(mk)}</h2>
    <button class="icon-btn" data-act="rmonth" data-d="1" aria-label="Bulan berikutnya" ${mk >= cur ? 'disabled' : ''}>${ICON.chev}</button>
  </div>`;
  if (txs.length < 3) {
    return `${pageHead('Laporan')}${nav}${emptyHTML(
      '📊',
      'Grafiknya belum bisa digambar',
      `Butuh minimal 3 catatan di ${monthLabel(mk)} supaya polanya kelihatan. Sekarang baru ${txs.length}.`,
      mk === cur ? '<button class="btn primary" data-act="open-sheet">+ Catat transaksi</button>' : ''
    )}${budgetReportHTML(mk)}`;
  }
  const tot = monthTotals(mk);
  const sp = spentByCat(mk);
  const parts = [...sp]
    .map(([id, value]) => ({ id, value, name: cat(id)?.name || 'Lainnya', icon: cat(id)?.icon || '❔', color: cat(id)?.color || '#64748B' }))
    .sort((a, b) => b.value - a.value);
  const top3 = parts.slice(0, 3);
  const sentences = top3.length
    ? top3
        .map((p, i) => {
          const pct = Math.round((p.value / tot.expense) * 100);
          return i === 0
            ? `<li><b>${pct}%</b> uangmu ${mk === cur ? 'bulan ini' : 'di ' + monthLabel(mk)} habis di ${p.icon} <b>${esc(p.name)}</b>.</li>`
            : `<li>Lalu ${p.icon} <b>${esc(p.name)}</b> ${pct}% (${rp(p.value)}).</li>`;
        })
        .join('')
    : '<li>Bulan ini belum ada pengeluaran tercatat.</li>';
  const months = Array.from({ length: 6 }, (_, i) => {
    const m = addMonths(mk, i - 5);
    return { mk: m, ...monthTotals(m), current: m === mk };
  });
  const net = tot.income - tot.expense;
  return `${pageHead('Laporan')}${nav}
    <section class="card">
      <ul class="insights">${sentences}</ul>
      <div class="kpis">
        <div><span class="label">↑ Masuk</span><b class="in">+${short(tot.income)}</b></div>
        <div><span class="label">↓ Keluar</span><b class="out">−${short(tot.expense)}</b></div>
        <div><span class="label">Selisih</span><b>${net >= 0 ? '+' : ''}${short(net)}</b></div>
      </div>
    </section>
    ${
      parts.length
        ? `<section class="card" aria-labelledby="donut-h">
      <h2 id="donut-h" class="h3">Ke mana larinya</h2>
      <div class="donut-wrap">${donutSVG(parts, tot.expense)}
        <ul class="legend">${parts
          .map(
            (p) =>
              `<li><span class="sw" style="background:${p.color}"></span><span class="lg-name">${p.icon} ${esc(p.name)}</span><span class="lg-val">${short(p.value)} <span class="muted">${Math.round((p.value / tot.expense) * 100)}%</span></span></li>`
          )
          .join('')}</ul>
      </div>
    </section>`
        : ''
    }
    <section class="card" aria-labelledby="bar-h">
      <div class="row-between"><h2 id="bar-h" class="h3">6 bulan terakhir</h2><div class="chart-key small"><span><i class="k-in"></i>Masuk</span><span><i class="k-out"></i>Keluar</span></div></div>
      ${barSVG(months)}
    </section>
    <section class="card" aria-labelledby="line-h">
      <h2 id="line-h" class="h3">Pengeluaran harian</h2>
      ${lineSVG(mk)}
    </section>
    ${budgetReportHTML(mk)}`;
}

function budgetReportHTML(mk) {
  const bs = budgetsFor(mk);
  if (!bs.length) return '';
  const sp = spentByCat(mk);
  return `<section class="card" aria-labelledby="bud-h">
    <h2 id="bud-h" class="h3">Anggaran ${monthLabel(mk)}</h2>
    ${bs
      .map((b) => {
        const c = cat(b.categoryId);
        const s = sp.get(b.categoryId) || 0;
        const pct = s / b.limit;
        return `<div class="bud-mini"><div class="row-between small"><span>${c?.icon || ''} ${esc(c?.name || '?')}</span><span class="muted">${short(s)} / ${short(b.limit)} · <b class="pct ${levelOf(pct)}">${Math.round(pct * 100)}%</b></span></div>${progressHTML(pct, 'Anggaran ' + (c?.name || ''))}</div>`;
      })
      .join('')}
  </section>`;
}

/* =========================================================
   Layar: Pengaturan + sub-halaman
   ========================================================= */
function settingsHTML() {
  if (ui.sub === 'dompet') return walletsHTML();
  if (ui.sub === 'kategori') return categoriesHTML();
  if (ui.sub === 'anggaran') return budgetsHTML();
  const s = S.settings;
  const u = store.usage();
  const g = S.gamification;
  const years = [...new Set(S.transactions.map((t) => t.date.slice(0, 4)))].filter((y) => y < ymd().slice(0, 4)).sort();
  const theme = s.theme;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  // Statistik pribadi (dihitung lokal)
  const firstDay = ymd(new Date(s.firstUseAt));
  const dates = new Set(S.transactions.filter(isReportable).map((t) => t.date));
  const first30 = [...dates].filter((d) => d >= firstDay && d <= addDays(firstDay, 29)).length;
  const avgInput = g.inputStats.count ? g.inputStats.totalMs / g.inputStats.count / 1000 : null;
  const perDay = dates.size ? S.transactions.filter(isReportable).length / dates.size : 0;
  const stats = [
    ['⏱️ Rata-rata waktu catat', avgInput != null ? `${nf1.format(avgInput)} detik` : '–', 'target < 5 detik', avgInput != null && avgInput < 5],
    ['📅 Hari aktif di 30 hari pertama', `${first30} hari`, 'target ≥ 20', first30 >= 20],
    ['🔥 Streak terpanjang', `${g.longestStreak || 0} hari`, 'target 21', (g.longestStreak || 0) >= 21],
    ['🎯 Anggaran bulan ini', `${budgetsFor(monthKey(ymd())).length} kategori`, 'target ≥ 3', budgetsFor(monthKey(ymd())).length >= 3],
    ['🛟 Backup terakhir', s.lastBackupAt ? dayLabel(ymd(new Date(s.lastBackupAt))) : 'Belum pernah', 'ekspor rutin', !!s.lastBackupAt],
    ['🧾 Transaksi per hari aktif', nf1.format(perDay), 'target ≥ 3', perDay >= 3],
  ];

  return `${pageHead('Pengaturan')}
    <div class="note-card"><b>🔒 Privasi</b><br>Semua data hanya tersimpan di browser perangkat ini. Tidak ada yang dikirim ke server, tidak ada analitik pihak ketiga.</div>

    <section class="section"><h2 class="h2">Kelola</h2>
      <div class="list">
        <a class="list-item" href="#/pengaturan/dompet"><span aria-hidden="true">👛</span><span>Dompet<small>${activeWallets().length} dompet · total ${rp(totalBalance())}</small></span>${ICON.chev}</a>
        <a class="list-item" href="#/pengaturan/kategori"><span aria-hidden="true">🏷️</span><span>Kategori<small>${S.categories.filter((c) => !c.hidden).length} aktif</small></span>${ICON.chev}</a>
        <a class="list-item" href="#/pengaturan/anggaran"><span aria-hidden="true">🎯</span><span>Anggaran bulanan<small>${budgetsFor(monthKey(ymd())).length} kategori bulan ini</small></span>${ICON.chev}</a>
      </div>
    </section>

    <section class="section"><h2 class="h2">Backup & pindah perangkat</h2>
      <div class="card">
        <p class="small muted">Backup terakhir: <b>${s.lastBackupAt ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(s.lastBackupAt)) : 'belum pernah'}</b></p>
        <div class="btn-row">
          <button class="btn primary" data-act="export-json">${ICON.down} Ekspor JSON</button>
          <button class="btn" data-act="export-csv">${ICON.down} Ekspor CSV</button>
          <button class="btn" data-act="import">${ICON.up} Impor JSON</button>
        </div>
        <p class="small muted">Ganti HP atau browser? Ekspor JSON di sini, kirim berkasnya ke perangkat baru, lalu buka Duitku di sana dan pilih Impor. CSV bisa dibuka di Excel atau Google Sheets.</p>
        ${isIOS ? '<p class="small warn-text">iPhone/iPad: Safari bisa menghapus data situs yang lama tidak dibuka. Pasang Duitku di layar utama dan ekspor rutin supaya aman.</p>' : ''}
        <div class="usage">
          <div class="row-between small"><span>Pemakaian penyimpanan</span><span>${nf1.format(u.bytes / 1024)} KB · ${nf1.format(u.pct * 100)}%</span></div>
          ${progressHTML(u.pct, 'Pemakaian penyimpanan')}
        </div>
        ${years.length ? `<p class="small muted">Arsipkan data tahun lama untuk menghemat ruang. Berkasnya diunduh dulu, baru dihapus dari aplikasi, dan saldo tetap sama.</p><div class="chips wrap">${years.map((y) => `<button class="chip" data-act="archive-year" data-year="${y}">Arsipkan ${y}</button>`).join('')}</div>` : ''}
      </div>
    </section>

    <section class="section"><h2 class="h2">Tampilan</h2>
      <div class="card">
        <div class="field"><span>Tema</span>
          <div class="seg" role="radiogroup" aria-label="Tema">
            ${[
              ['system', 'Ikut sistem'],
              ['light', 'Terang'],
              ['dark', 'Gelap'],
            ]
              .map(([k, l]) => `<button role="radio" aria-checked="${theme === k}" class="${theme === k ? 'on' : ''}" data-act="theme" data-theme="${k}">${l}</button>`)
              .join('')}
          </div>
        </div>
        <label class="toggle"><span><b>Mode tenang</b><small>Matikan konfeti, getaran, dan badge</small></span><input type="checkbox" data-act="quiet" ${s.quietMode ? 'checked' : ''}><i aria-hidden="true"></i></label>
        ${ui.installEvt ? '<button class="btn" data-act="install">📲 Pasang di layar utama</button>' : ''}
      </div>
    </section>

    ${
      s.quietMode
        ? ''
        : `<section class="section"><h2 class="h2">Pencapaian</h2>
      <div class="badges">${BADGES.map((b) => {
        const has = g.badges.includes(b.id);
        return `<div class="badge ${has ? 'on' : ''}" title="${esc(b.desc)}"><span class="b-ic" aria-hidden="true">${has ? b.icon : '🔒'}</span><b>${b.name}</b><small>${b.desc}</small></div>`;
      }).join('')}</div>
    </section>`
    }

    <section class="section"><h2 class="h2">Statistik pribadi</h2>
      <div class="card stats">${stats
        .map(([l, v, tgt, ok]) => `<div class="stat"><span>${l}<small>${tgt}</small></span><b class="${ok ? 'in' : ''}">${v}${ok ? ' ✓' : ''}</b></div>`)
        .join('')}</div>
      <p class="small muted">Dihitung di perangkat ini saja.</p>
    </section>

    <section class="section"><h2 class="h2">Zona hati-hati</h2>
      <div class="card"><p class="small muted">Menghapus semua data tidak bisa dibatalkan. Ekspor dulu kalau ragu.</p><button class="btn danger" data-act="wipe">Hapus semua data</button></div>
    </section>
    <p class="small muted center">Duitku · data v${store.SCHEMA_VERSION}</p>`;
}

function walletsHTML() {
  const ws = S.wallets;
  return `${pageHead('Dompet', 'pengaturan')}
    <div class="card bal-sum"><span class="label">Total semua dompet</span><b>${rp(totalBalance())}</b></div>
    <div class="list">${ws
      .map(
        (w) => `<button class="list-item" data-act="edit-wallet" data-id="${w.id}"><span aria-hidden="true">${w.icon}</span><span>${esc(w.name)}${w.archived ? ' <em class="tag">diarsipkan</em>' : ''}<small>Saldo awal ${rp(w.initialBalance)}</small></span><b>${rp(walletBalance(w.id))}</b></button>`
      )
      .join('')}</div>
    <div class="btn-row">
      <button class="btn primary" data-act="edit-wallet">+ Tambah dompet</button>
      ${activeWallets().length > 1 ? '<button class="btn" data-act="open-transfer">⇄ Transfer antar dompet</button>' : ''}
    </div>
    <p class="small muted">Saldo dihitung dari saldo awal ditambah pemasukan dikurangi pengeluaran. Transfer tidak dihitung sebagai pemasukan atau pengeluaran.</p>`;
}

function categoriesHTML() {
  const type = ui.catTab;
  const counts = new Map();
  for (const t of S.transactions) if (t.categoryId) counts.set(t.categoryId, (counts.get(t.categoryId) || 0) + 1);
  const list = S.categories.filter((c) => c.type === type);
  return `${pageHead('Kategori', 'pengaturan')}
    <div class="seg" role="tablist">
      ${[
        ['expense', 'Pengeluaran'],
        ['income', 'Pemasukan'],
      ]
        .map(([k, l]) => `<button role="tab" aria-selected="${type === k}" class="${type === k ? 'on' : ''}" data-act="cat-tab" data-type="${k}">${l}</button>`)
        .join('')}
    </div>
    <div class="list">${list
      .map(
        (c) => `<button class="list-item ${c.hidden ? 'dim' : ''}" data-act="edit-cat" data-id="${c.id}"><span class="tx-ic" style="--c:${c.color}" aria-hidden="true">${c.icon}</span><span>${esc(c.name)}${c.hidden ? ' <em class="tag">disembunyikan</em>' : ''}<small>${counts.get(c.id) || 0} transaksi</small></span>${ICON.chev}</button>`
      )
      .join('')}</div>
    <button class="btn primary" data-act="edit-cat">+ Tambah kategori</button>
    <p class="small muted">Kategori yang sudah dipakai tidak bisa dihapus, hanya disembunyikan, supaya riwayat tetap utuh.</p>`;
}

function budgetsHTML() {
  const mk = ui.budgetMonth;
  const cur = monthKey(ymd());
  const sp = spentByCat(mk);
  const bmap = new Map(S.budgets.filter((b) => b.period === mk).map((b) => [b.categoryId, b]));
  const cats = S.categories.filter((c) => c.type === 'expense' && (!c.hidden || bmap.has(c.id)));
  const bs = budgetsFor(mk);
  const total = sum(bs, (b) => b.limit);
  const spent = sum(bs, (b) => sp.get(b.categoryId) || 0);
  const prev = budgetsFor(addMonths(mk, -1));
  return `${pageHead('Anggaran', 'pengaturan')}
    <div class="month-nav">
      <button class="icon-btn" data-act="bmonth" data-d="-1" aria-label="Bulan sebelumnya">${ICON.back}</button>
      <h2 class="h3" aria-live="polite">${monthLabel(mk)}</h2>
      <button class="icon-btn" data-act="bmonth" data-d="1" aria-label="Bulan berikutnya" ${mk >= cur ? 'disabled' : ''}>${ICON.chev}</button>
    </div>
    <div class="card">
      ${
        bs.length
          ? `<div class="row-between"><span class="label">Total anggaran</span><b>${rp(total)}</b></div>${progressHTML(spent / total, 'Total anggaran')}<p class="small muted">Terpakai ${rp(spent)} (${Math.round((spent / total) * 100)}%). Melewati anggaran tidak memblokir pencatatan.</p>`
          : `<p class="small muted">Belum ada anggaran untuk ${monthLabel(mk)}. Isi batas bulanan di kategori yang ingin kamu pantau.</p>`
      }
      ${!bs.length && prev.length ? `<button class="btn primary" data-act="copy-budgets" data-month="${mk}">Salin dari ${monthLabel(addMonths(mk, -1))}</button>` : ''}
    </div>
    <div class="bud-list">${cats
      .map((c) => {
        const b = bmap.get(c.id);
        const s = sp.get(c.id) || 0;
        const pct = b && b.limit ? s / b.limit : 0;
        let note = '';
        if (b && b.limit) {
          if (pct > 1) note = `<p class="small warn-text">${esc(c.name)} sudah lewat ${rp(s - b.limit)}. Mau naikkan anggarannya atau tahan dulu minggu ini?</p>`;
          else if (pct >= 0.8) note = `<p class="small warn-text">Sudah ${Math.round(pct * 100)}%. Sisa ${rp(b.limit - s)}.</p>`;
        }
        return `<div class="card bud">
          <div class="bud-row">
            <span class="tx-ic" style="--c:${c.color}" aria-hidden="true">${c.icon}</span>
            <div class="bud-name"><b>${esc(c.name)}</b>${b && b.limit ? '' : `<small>${s ? 'Terpakai ' + short(s) : 'Belum diatur'}</small>`}</div>
            <label class="money-in"><span aria-hidden="true">Rp</span><span class="sr-only">Anggaran ${esc(c.name)}</span><input type="text" inputmode="numeric" placeholder="0" value="${b?.limit ? nf.format(b.limit) : ''}" data-budget="${c.id}" data-money></label>
          </div>
          ${b && b.limit ? `${progressHTML(pct, 'Anggaran ' + c.name)}<div class="row-between small muted"><span>${rp(s)} / ${rp(b.limit)}</span><b class="pct ${levelOf(pct)}">${Math.round(pct * 100)}%</b></div>` : ''}
          ${note}
        </div>`;
      })
      .join('')}</div>
    <p class="small muted">Anggaran berlaku per bulan dan mulai kosong tiap awal bulan. Pakai tombol salin untuk meneruskan anggaran bulan lalu.</p>`;
}

/* =========================================================
   Render utama
   ========================================================= */
function applyTheme() {
  const t = S.settings.theme;
  const root = document.documentElement;
  if (t === 'light' || t === 'dark') root.dataset.theme = t;
  else delete root.dataset.theme;
  root.classList.toggle('quiet', !!S.settings.quietMode);
}

function bannersHTML() {
  const b = [];
  if (!storageOK)
    b.push(`<div class="banner danger" role="alert"><b>⚠️ Data tidak akan tersimpan.</b> Browser ini memblokir penyimpanan lokal (misalnya mode penyamaran). Catatanmu akan hilang saat tab ditutup. Buka Duitku di jendela biasa supaya aman.</div>`);
  if (bootStatus === 'too-new')
    b.push(`<div class="banner danger" role="alert"><b>Data dibuat oleh versi Duitku yang lebih baru.</b> Supaya tidak rusak, data tidak diubah. Muat ulang halaman untuk memperbarui. <button class="btn small" data-act="reload">Muat ulang</button></div>`);
  if (bootStatus === 'corrupt')
    b.push(`<div class="banner danger" role="alert"><b>Data tersimpan tidak bisa dibaca.</b> Data lama tidak disentuh. Kamu bisa impor backup, atau mulai baru (data lama disalin ke cadangan dulu). <div class="btn-row"><button class="btn small" data-act="import">Impor backup</button><button class="btn small" data-act="start-fresh">Mulai baru</button></div></div>`);
  if (bootStatus === 'migration-failed')
    b.push(`<div class="banner danger" role="alert"><b>Pembaruan format data gagal.</b> Salinan data lama sudah disimpan. Coba muat ulang, atau ekspor data sekarang. <button class="btn small" data-act="export-json">Ekspor</button></div>`);
  if (storageOK && store.usage().pct > 0.8)
    b.push(`<div class="banner warn" role="status"><b>Penyimpanan hampir penuh.</b> Ekspor dan arsipkan data tahun lama supaya catatan baru tetap bisa disimpan. <a class="btn small" href="#/pengaturan">Buka pengaturan</a></div>`);
  if (ui.updateWorker)
    b.push(`<div class="banner info" role="status"><span>✨ Versi baru Duitku siap.</span> <button class="btn small primary" data-act="apply-update">Muat ulang</button></div>`);
  return b.join('');
}

function render() {
  applyTheme();
  $('#banners').innerHTML = bannersHTML();
  const onboarding = !S.settings.onboarded && !writeBlocked;
  document.body.classList.toggle('onboarding', onboarding);
  const main = $('#main');
  if (onboarding) {
    if (!ui.obWallets) ui.obWallets = [{ name: 'Dompet Utama', icon: '👛', balance: 0 }];
    main.innerHTML = onboardingHTML();
    return;
  }
  const screens = { home: homeHTML, history: historyHTML, reports: reportsHTML, settings: settingsHTML };
  main.innerHTML = screens[ui.tab]();
  $$('.tab').forEach((a) => (a.dataset.tab === ui.tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  if (ui.tab === 'history') bindMore();
}

function parseHash() {
  const p = location.hash.replace(/^#\/?/, '').split('/');
  ui.tab = { riwayat: 'history', laporan: 'reports', pengaturan: 'settings' }[p[0]] || 'home';
  ui.sub = ui.tab === 'settings' ? p[1] || null : null;
}

/* =========================================================
   Quick Add sheet
   ========================================================= */
let sheet = null;
let sheetFocusReturn = null;

function defaultWalletId() {
  const last = txSorted(S.transactions.filter(isReportable))[0];
  const w = last && wallet(last.walletId);
  return w && !w.archived ? w.id : activeWallets()[0]?.id || S.wallets[0].id;
}

function openSheet(opts = {}) {
  if (writeBlocked) return snack('Perubahan diblokir supaya data lama tidak rusak.', { now: true });
  const aw = activeWallets();
  sheet = {
    mode: 'add',
    type: 'expense',
    amount: '',
    categoryId: null,
    walletId: defaultWalletId(),
    toWalletId: aw.find((w) => w.id !== defaultWalletId())?.id || null,
    date: ymd(),
    note: '',
    openedAt: performance.now(),
    ...opts,
  };
  sheetFocusReturn = document.activeElement;
  renderSheet();
  const root = $('#sheet-root');
  document.body.classList.add('sheet-open');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('open')));
  setTimeout(() => $('.sheet')?.focus(), 50);
}

function openEdit(id) {
  const t = S.transactions.find((x) => x.id === id);
  if (!t) return;
  if (t.transferGroupId) {
    const pair = S.transactions.filter((x) => x.transferGroupId === t.transferGroupId);
    const from = pair.find((x) => x.type === 'expense') || t;
    const to = pair.find((x) => x.type === 'income') || t;
    openSheet({ mode: 'edit', type: 'transfer', amount: String(t.amount), walletId: from.walletId, toWalletId: to.walletId, date: t.date, note: t.note || '', groupId: t.transferGroupId, editId: from.id });
  } else {
    openSheet({ mode: 'edit', type: t.type, amount: String(t.amount), categoryId: t.categoryId, walletId: t.walletId, date: t.date, note: t.note || '', editId: t.id });
  }
}

function closeSheet() {
  const root = $('#sheet-root');
  if (!sheet) return;
  sheet = null;
  root.classList.remove('open');
  document.body.classList.remove('sheet-open');
  flush(); // wajib langsung ditulis saat sheet ditutup
  setTimeout(() => {
    if (!sheet) root.innerHTML = '';
  }, 260);
  sheetFocusReturn?.focus?.();
}

function sheetValid() {
  const a = parseInt(sheet.amount || '0', 10);
  if (!a) return false;
  if (sheet.type === 'transfer') return sheet.walletId && sheet.toWalletId && sheet.walletId !== sheet.toWalletId;
  return !!(sheet.categoryId && cat(sheet.categoryId)?.type === sheet.type);
}

function renderSheet() {
  const sh = sheet;
  const t = ymd();
  const y = addDays(t, -1);
  const isOther = sh.date !== t && sh.date !== y;
  const aw = activeWallets();
  const typeOpts =
    sh.mode === 'edit'
      ? sh.type === 'transfer'
        ? [['transfer', '⇄ Transfer']]
        : [
            ['expense', '− Pengeluaran'],
            ['income', '+ Pemasukan'],
          ]
      : [['expense', '− Pengeluaran'], ['income', '+ Pemasukan'], aw.length > 1 ? ['transfer', '⇄ Transfer'] : null].filter(Boolean);

  let middle;
  if (sh.type === 'transfer') {
    const sel = (key, label) =>
      `<label class="field"><span>${label}</span><select data-sheet="${key}">${S.wallets
        .filter((w) => !w.archived || w.id === sh[key])
        .map((w) => `<option value="${w.id}" ${sh[key] === w.id ? 'selected' : ''}>${w.icon} ${esc(w.name)} · ${short(walletBalance(w.id))}</option>`)
        .join('')}</select></label>`;
    middle = `<div class="transfer-pick">${sel('walletId', 'Dari')}<span class="tr-arrow" aria-hidden="true">→</span>${sel('toWalletId', 'Ke')}</div>`;
  } else {
    const cats = sortedCats(sh.type, sh.categoryId);
    middle = `<div class="cat-grid" role="radiogroup" aria-label="Kategori">${cats
      .map(
        (c) => `<button type="button" class="cat ${sh.categoryId === c.id ? 'on' : ''}" role="radio" aria-checked="${sh.categoryId === c.id}" data-act="pick-cat" data-id="${c.id}" style="--c:${c.color}">
          <span class="cat-ic" aria-hidden="true">${c.icon}</span><span class="cat-name">${esc(c.name)}</span></button>`
      )
      .join('')}
    </div>`;
  }

  const keys = ['+1rb', '+10rb', '+50rb', '1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'];
  const keyLabel = (k) => (k === 'del' ? ICON.del : k);
  const keyAria = (k) => (k === 'del' ? 'Hapus satu angka' : k.startsWith('+') ? `Tambah ${k.slice(1).replace('rb', ' ribu')}` : k);

  $('#sheet-root').innerHTML = `
    <div class="backdrop" data-act="close-sheet"></div>
    <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabindex="-1">
      <div class="grab" data-drag aria-hidden="true"><span></span></div>
      <h2 id="sheet-title" class="sr-only">${sh.mode === 'edit' ? 'Edit transaksi' : 'Catat transaksi'}</h2>
      <div class="sheet-scroll">
        <div class="seg type-seg" role="radiogroup" aria-label="Jenis transaksi">
          ${typeOpts.map(([k, l]) => `<button type="button" role="radio" aria-checked="${sh.type === k}" class="${sh.type === k ? 'on ' + k : ''}" data-act="sheet-type" data-type="${k}">${l}</button>`).join('')}
        </div>
        <div class="amount ${sh.type}" data-drag>
          <span class="sign" aria-hidden="true">${sh.type === 'income' ? '+' : sh.type === 'expense' ? '−' : '⇄'}</span>
          <span class="cur">Rp</span><output id="amt" aria-live="polite" aria-label="Nominal">0</output>
        </div>
        <div class="chips date-chips" role="radiogroup" aria-label="Tanggal">
          <button type="button" role="radio" aria-checked="${sh.date === t}" class="chip ${sh.date === t ? 'on' : ''}" data-act="sheet-date" data-date="${t}">Hari ini</button>
          <button type="button" role="radio" aria-checked="${sh.date === y}" class="chip ${sh.date === y ? 'on' : ''}" data-act="sheet-date" data-date="${y}">Kemarin</button>
          <label class="chip date-chip ${isOther ? 'on' : ''}">📅 <span>${isOther ? dayLabel(sh.date) : 'Pilih tanggal'}</span>
            <input type="date" id="sheet-date" value="${sh.date}" max="${t}" aria-label="Pilih tanggal transaksi"></label>
        </div>
        ${middle}
        <div class="keypad" role="group" aria-label="Keypad nominal">
          ${keys.map((k) => `<button type="button" class="key ${k.startsWith('+') ? 'quick' : ''} ${k === 'del' ? 'del' : ''}" data-act="key" data-k="${k}" aria-label="${keyAria(k)}">${keyLabel(k)}</button>`).join('')}
        </div>
        <button type="button" class="btn-save" id="save-btn" data-act="save">${sh.mode === 'edit' ? 'Simpan perubahan' : 'Simpan'}</button>
        <div class="extras">
          <label class="field"><span>Catatan (opsional)</span><input type="text" id="sheet-note" maxlength="80" placeholder="mis. Nasi padang" value="${esc(sh.note)}" autocomplete="off" enterkeyhint="done"></label>
          ${
            sh.type !== 'transfer' && S.wallets.length > 1
              ? `<div class="field"><span>Dompet (opsional)</span><div class="chips wrap" role="radiogroup" aria-label="Dompet">${S.wallets
                  .filter((w) => !w.archived || w.id === sh.walletId)
                  .map((w) => `<button type="button" role="radio" aria-checked="${sh.walletId === w.id}" class="chip ${sh.walletId === w.id ? 'on' : ''}" data-act="sheet-wallet" data-id="${w.id}">${w.icon} ${esc(w.name)}</button>`)
                  .join('')}</div></div>`
              : ''
          }
          ${sh.type !== 'transfer' ? `<button type="button" class="btn ghost small add-cat" data-act="edit-cat" data-type="${sh.type}">＋ Kategori baru</button>` : ''}
          ${sh.mode === 'edit' ? `<button type="button" class="btn danger ghost" data-act="sheet-delete">${ICON.trash} Hapus transaksi ini</button>` : ''}
        </div>
      </div>
    </section>`;
  updateSheetAmount();
  bindSheetDrag();
}

function updateSheetAmount() {
  const a = parseInt(sheet.amount || '0', 10);
  const out = $('#amt');
  if (out) {
    out.textContent = nf.format(a);
    out.closest('.amount').classList.toggle('zero', !a);
  }
  const btn = $('#save-btn');
  if (btn) {
    const ok = sheetValid();
    btn.disabled = !ok;
    btn.setAttribute('aria-disabled', String(!ok));
  }
}

function pressKey(k) {
  let s = sheet.amount || '';
  if (k === 'del') s = s.slice(0, -1);
  else if (k.startsWith('+')) s = String((parseInt(s || '0', 10) || 0) + parseInt(k.slice(1), 10) * 1000);
  else s = s + k;
  s = s.replace(/^0+/, '').slice(0, 12);
  sheet.amount = s;
  updateSheetAmount();
  if (!S.settings.quietMode) navigator.vibrate?.(5);
}

function bindSheetDrag() {
  const el = $('.sheet');
  let y0 = null,
    dy = 0;
  const down = (e) => {
    y0 = e.clientY;
    dy = 0;
    el.style.transition = 'none';
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    if (y0 == null) return;
    dy = Math.max(0, e.clientY - y0);
    el.style.transform = `translate(-50%, ${dy}px)`;
  };
  const up = () => {
    if (y0 == null) return;
    y0 = null;
    el.style.transition = '';
    el.style.transform = '';
    if (dy > 90) closeSheet();
  };
  $$('[data-drag]', el).forEach((h) => {
    h.addEventListener('pointerdown', down);
    h.addEventListener('pointermove', move);
    h.addEventListener('pointerup', up);
    h.addEventListener('pointercancel', up);
  });
}

function saveSheet() {
  if (!sheet || !sheetValid()) return;
  const sh = sheet;
  const amount = parseInt(sh.amount, 10);
  const now = new Date().toISOString();
  const mk = monthKey(sh.date);
  const before = sh.type === 'expense' ? budgetStatus(sh.categoryId, mk) : null;
  let freezeMsg = null;
  const ok = commit((s) => {
    if (sh.mode === 'edit') {
      if (sh.type === 'transfer') {
        for (const t of s.transactions.filter((x) => x.transferGroupId === sh.groupId)) {
          Object.assign(t, { amount, date: sh.date, note: sh.note.trim(), walletId: t.type === 'expense' ? sh.walletId : sh.toWalletId, updatedAt: now });
        }
      } else {
        const t = s.transactions.find((x) => x.id === sh.editId);
        if (t) Object.assign(t, { type: sh.type, amount, categoryId: sh.categoryId, walletId: sh.walletId, date: sh.date, note: sh.note.trim(), updatedAt: now });
      }
    } else {
      if (sh.type === 'transfer') {
        const g = uid('g');
        const base = { amount, categoryId: null, date: sh.date, note: sh.note.trim(), transferGroupId: g, createdAt: now, updatedAt: now };
        s.transactions.push({ id: uid('t'), type: 'expense', walletId: sh.walletId, ...base });
        s.transactions.push({ id: uid('t'), type: 'income', walletId: sh.toWalletId, ...base });
      } else {
        s.transactions.push({ id: uid('t'), type: sh.type, amount, categoryId: sh.categoryId, walletId: sh.walletId, date: sh.date, note: sh.note.trim(), transferGroupId: null, createdAt: now, updatedAt: now });
      }
      freezeMsg = registerLog(s);
      const st = s.gamification.inputStats;
      const ms = performance.now() - sh.openedAt;
      if (ms < 120000) {
        st.count += 1;
        st.totalMs += Math.round(ms);
      }
    }
  });
  if (!ok) return;
  closeSheet();

  // Pesan: perayaan kebiasaan, atau info anggaran dengan nada ringan
  const after = sh.type === 'expense' ? budgetStatus(sh.categoryId, mk) : null;
  const cname = cat(sh.categoryId)?.name;
  let msg = null;
  let opt = {};
  if (after && after.pct > 1 && (!before || before.pct <= 1 || sh.mode === 'edit')) {
    msg = `${cname} sudah lewat ${short(after.spent - after.b.limit)}. Mau naikkan anggarannya atau tahan dulu minggu ini?`;
    opt = { action: 'Atur', onAction: () => (location.hash = '#/pengaturan/anggaran'), duration: 6000 };
  } else if (after && after.pct >= 0.8 && (!before || before.pct < 0.8)) {
    msg = `Anggaran ${cname} sudah terpakai ${Math.round(after.pct * 100)}%. Sisa ${rp(after.b.limit - after.spent)} bulan ini.`;
    opt = { duration: 5000 };
  }
  if (sh.mode === 'add') {
    celebrate();
    const st = currentStreak();
    snack(msg || (st > 1 ? `Tercatat! 🔥 ${st} hari beruntun` : 'Tercatat! Mantap 👍'), msg ? opt : { duration: 2200 });
    if (freezeMsg) snack(freezeMsg, { duration: 4000 });
  } else snack(msg || 'Perubahan disimpan', msg ? opt : { duration: 2000 });
  checkBadges();
}

function deleteTx(id) {
  const t = S.transactions.find((x) => x.id === id);
  if (!t) return;
  const ids = t.transferGroupId ? S.transactions.filter((x) => x.transferGroupId === t.transferGroupId).map((x) => x.id) : [id];
  const removed = ids.map((i) => ({ idx: S.transactions.findIndex((x) => x.id === i), tx: S.transactions.find((x) => x.id === i) })).sort((a, b) => a.idx - b.idx);
  if (!commit((s) => (s.transactions = s.transactions.filter((x) => !ids.includes(x.id))))) return;
  snack(t.transferGroupId ? 'Transfer dihapus' : 'Transaksi dihapus', {
    now: true,
    duration: 5000,
    action: 'Urungkan',
    onAction: () =>
      commit((s) => {
        for (const r of removed) s.transactions.splice(Math.min(r.idx, s.transactions.length), 0, r.tx);
      }),
  });
}

/* ---------- Geser kiri untuk hapus ---------- */
function bindSwipe() {
  let st = null;
  document.addEventListener('pointerdown', (e) => {
    const main = e.target.closest('.tx-main');
    if (!main || e.button !== 0) return;
    st = { el: main, x0: e.clientX, y0: e.clientY, dx: 0, active: false, id: e.pointerId };
  });
  document.addEventListener('pointermove', (e) => {
    if (!st || e.pointerId !== st.id) return;
    const dx = e.clientX - st.x0;
    const dy = e.clientY - st.y0;
    if (!st.active) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) return (st = null);
      if (Math.abs(dx) > 10 && dx < 0) {
        st.active = true;
        st.el.style.transition = 'none';
        st.el.closest('.tx').classList.add('swiping');
      } else return;
    }
    st.dx = Math.min(0, dx);
    st.el.style.transform = `translateX(${st.dx}px)`;
    e.preventDefault();
  });
  const end = () => {
    if (!st) return;
    const s = st;
    st = null;
    if (!s.active) return;
    s.el.dataset.swiped = '1';
    setTimeout(() => delete s.el.dataset.swiped, 50);
    s.el.style.transition = '';
    if (s.dx < -96) {
      s.el.style.transform = 'translateX(-110%)';
      setTimeout(() => deleteTx(s.el.dataset.id), 160);
    } else {
      s.el.style.transform = '';
      s.el.closest('.tx')?.classList.remove('swiping');
    }
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
}

/* =========================================================
   Umpan balik: snackbar, konfeti, dialog
   ========================================================= */
const snackQ = [];
let snackCur = null;
let snackTimer = null;
function snack(msg, opt = {}) {
  const item = { msg, duration: 3000, ...opt };
  if (opt.now) {
    snackQ.length = 0;
    showSnack(item);
  } else if (snackCur) snackQ.push(item);
  else showSnack(item);
}
function showSnack(item) {
  clearTimeout(snackTimer);
  snackCur = item;
  const el = $('#snackbar');
  $('.snack-msg', el).textContent = item.msg;
  const btn = $('.snack-act', el);
  btn.hidden = !item.action;
  btn.textContent = item.action || '';
  btn.onclick = () => {
    hideSnack();
    item.onAction?.();
  };
  el.classList.add('show');
  snackTimer = setTimeout(hideSnack, item.duration);
}
function hideSnack() {
  clearTimeout(snackTimer);
  $('#snackbar').classList.remove('show');
  snackCur = null;
  const next = snackQ.shift();
  if (next) setTimeout(() => showSnack(next), 220);
}

function celebrate() {
  if (S.settings.quietMode) return;
  navigator.vibrate?.(15);
  if (reducedMotion()) return;
  const root = $('#confetti-root');
  const colors = ['#F97316', '#10B981', '#0EA5E9', '#EAB308', '#EC4899', '#8B5CF6'];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('i');
    p.style.setProperty('--x', `${(Math.random() * 2 - 1) * 170}px`);
    p.style.setProperty('--y', `${-(140 + Math.random() * 220)}px`);
    p.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random() * 80}ms`;
    frag.append(p);
  }
  root.append(frag);
  setTimeout(() => (root.innerHTML = ''), 1300);
}

function dialog({ title, html, actions = [], onMount }) {
  const d = document.createElement('dialog');
  d.className = 'dlg';
  d.innerHTML = `<form method="dialog">
    <h2 class="h3">${title}</h2>
    <div class="dlg-body">${html}</div>
    <div class="dlg-actions">${actions.map((a, i) => `<button value="${i}" class="btn ${a.kind || ''}" ${a.kind === 'primary' ? '' : 'formnovalidate'}>${a.label}</button>`).join('')}</div>
  </form>`;
  document.body.append(d);
  const form = $('form', d);
  form.addEventListener('submit', (e) => {
    const a = actions[+e.submitter?.value];
    if (a?.onClick && a.onClick(d) === false) e.preventDefault();
  });
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', (e) => {
    if (e.target === d) d.close();
  });
  d.showModal();
  onMount?.(d);
  return d;
}

function showQuotaDialog() {
  dialog({
    title: 'Penyimpanan browser penuh',
    html: '<p>Catatan terbaru belum bisa disimpan karena ruang penyimpanan browser habis. Ekspor data sekarang supaya aman, lalu arsipkan data tahun lama di Pengaturan.</p>',
    actions: [
      { label: 'Nanti', kind: 'ghost' },
      { label: 'Ekspor sekarang', kind: 'primary', onClick: () => exportJSON() },
    ],
  });
}

/* =========================================================
   Dialog edit: dompet & kategori
   ========================================================= */
function walletDialog(id) {
  const w = id ? wallet(id) : null;
  const used = w && S.transactions.some((t) => t.walletId === w.id);
  const activeCount = activeWallets().length;
  dialog({
    title: w ? 'Edit dompet' : 'Dompet baru',
    html: `
      <label class="field"><span>Nama</span><input name="name" required maxlength="24" value="${esc(w?.name || '')}" placeholder="mis. GoPay"></label>
      <div class="field"><span>Ikon</span><div class="pick-grid">${WALLET_ICONS.map((ic, i) => `<label class="pick"><input type="radio" name="icon" value="${ic}" ${(w ? w.icon === ic : i === 0) ? 'checked' : ''}><span>${ic}</span></label>`).join('')}</div></div>
      <label class="field"><span>Saldo awal</span><span class="money-in wide"><span aria-hidden="true">Rp</span><input name="bal" inputmode="numeric" data-money value="${w ? nf.format(w.initialBalance) : ''}" placeholder="0"></span></label>
      ${w ? `<p class="small muted">Saldo sekarang: <b>${rp(walletBalance(w.id))}</b></p>` : ''}
      ${w && (activeCount > 1 || w.archived) ? `<label class="toggle"><span><b>Arsipkan</b><small>Disembunyikan dari pilihan, riwayat tetap ada</small></span><input type="checkbox" name="archived" ${w.archived ? 'checked' : ''}><i aria-hidden="true"></i></label>` : ''}
    `,
    actions: [
      ...(w && !used && S.wallets.length > 1
        ? [
            {
              label: 'Hapus',
              kind: 'danger ghost',
              onClick: () => {
                commit((s) => (s.wallets = s.wallets.filter((x) => x.id !== w.id)));
              },
            },
          ]
        : []),
      { label: 'Batal', kind: 'ghost' },
      {
        label: 'Simpan',
        kind: 'primary',
        onClick: (d) => {
          const f = $('form', d);
          const name = f.elements.name.value.trim();
          if (!name) return false;
          const data = { name, icon: f.elements.icon.value, initialBalance: parseAmount(f.elements.bal.value), archived: !!f.elements.archived?.checked };
          commit((s) => {
            if (w) Object.assign(s.wallets.find((x) => x.id === w.id), data);
            else s.wallets.push({ id: uid('w'), ...data, archived: false });
          });
        },
      },
    ],
  });
}

function categoryDialog(id, typeHint) {
  const c = id ? cat(id) : null;
  const used = c && S.transactions.some((t) => t.categoryId === c.id);
  const type = c?.type || typeHint || ui.catTab;
  dialog({
    title: c ? 'Edit kategori' : `Kategori ${type === 'income' ? 'pemasukan' : 'pengeluaran'} baru`,
    html: `
      <label class="field"><span>Nama</span><input name="name" required maxlength="20" value="${esc(c?.name || '')}" placeholder="mis. Kopi"></label>
      <div class="field"><span>Ikon</span><div class="pick-grid">${EMOJIS.map((ic, i) => `<label class="pick"><input type="radio" name="icon" value="${ic}" ${(c ? c.icon === ic : i === 0) ? 'checked' : ''}><span>${ic}</span></label>`).join('')}${c && !EMOJIS.includes(c.icon) ? `<label class="pick"><input type="radio" name="icon" value="${c.icon}" checked><span>${c.icon}</span></label>` : ''}</div></div>
      <div class="field"><span>Warna</span><div class="pick-grid colors">${COLORS.map((col, i) => `<label class="pick"><input type="radio" name="color" value="${col}" ${(c ? c.color === col : i === 0) ? 'checked' : ''}><span style="background:${col}" aria-label="${col}"></span></label>`).join('')}${c && !COLORS.includes(c.color) ? `<label class="pick"><input type="radio" name="color" value="${c.color}" checked><span style="background:${c.color}"></span></label>` : ''}</div></div>
      ${c ? `<label class="toggle"><span><b>Sembunyikan</b><small>Tidak muncul saat mencatat, transaksi lama tetap utuh</small></span><input type="checkbox" name="hidden" ${c.hidden ? 'checked' : ''}><i aria-hidden="true"></i></label>` : ''}
      ${c && used ? '<p class="small muted">Kategori ini sudah dipakai, jadi hanya bisa disembunyikan.</p>' : ''}
    `,
    actions: [
      ...(c && !used
        ? [
            {
              label: 'Hapus',
              kind: 'danger ghost',
              onClick: () => {
                commit((s) => {
                  s.categories = s.categories.filter((x) => x.id !== c.id);
                  s.budgets = s.budgets.filter((b) => b.categoryId !== c.id);
                });
                if (sheet) renderSheet();
              },
            },
          ]
        : []),
      { label: 'Batal', kind: 'ghost' },
      {
        label: 'Simpan',
        kind: 'primary',
        onClick: (d) => {
          const f = $('form', d);
          const name = f.elements.name.value.trim();
          if (!name) return false;
          const data = { name, icon: f.elements.icon.value, color: f.elements.color.value };
          let newId = null;
          commit((s) => {
            if (c) Object.assign(s.categories.find((x) => x.id === c.id), data, { hidden: !!f.elements.hidden?.checked });
            else {
              newId = uid('c');
              s.categories.push({ id: newId, type, ...data, hidden: false });
            }
          });
          if (sheet) {
            if (newId && sheet.type === type) sheet.categoryId = newId;
            renderSheet();
          }
        },
      },
    ],
  });
}

/* =========================================================
   Ekspor / impor / arsip
   ========================================================= */
function download(name, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function exportJSON() {
  // Simpan tanggal backup dulu supaya berkas dan data di aplikasi identik.
  if (!writeBlocked) commit((s) => ((s.settings.lastBackupAt = new Date().toISOString()), (s.settings.backupSnoozeUntil = null)));
  download(`duitku-backup-${ymd()}.json`, store.exportState(S), 'application/json');
  snack('Backup JSON diunduh. Simpan di tempat aman ya 🛟', { now: true });
  checkBadges();
}

function exportCSV() {
  const cell = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return /[",\r\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [['tanggal', 'jenis', 'kategori', 'dompet', 'nominal', 'catatan', 'id_transfer']];
  for (const t of txSorted(S.transactions)) {
    const jenis = t.transferGroupId ? (t.type === 'expense' ? 'transfer keluar' : 'transfer masuk') : t.type === 'income' ? 'pemasukan' : 'pengeluaran';
    rows.push([t.date, jenis, cat(t.categoryId)?.name || '', walletName(t.walletId), t.amount, t.note || '', t.transferGroupId || '']);
  }
  download(`duitku-transaksi-${ymd()}.csv`, '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n'), 'text/csv');
  snack('CSV diunduh', { now: true });
}

function mergeStates(cur, inc) {
  const byId = (a, b, prefer) => {
    const m = new Map(a.map((x) => [x.id, x]));
    for (const x of b) {
      const ex = m.get(x.id);
      if (!ex || prefer(x, ex)) m.set(x.id, x);
    }
    return [...m.values()];
  };
  const newer = (x, ex) => (x.updatedAt || '') > (ex.updatedAt || '');
  const bkey = (b) => b.categoryId + '|' + b.period;
  const bmap = new Map(cur.budgets.map((b) => [bkey(b), b]));
  for (const b of inc.budgets) if (!bmap.has(bkey(b))) bmap.set(bkey(b), b);
  const g = cur.gamification;
  const gi = inc.gamification;
  return {
    ...cur,
    wallets: byId(cur.wallets, inc.wallets, () => false),
    categories: byId(cur.categories, inc.categories, () => false),
    transactions: byId(cur.transactions, inc.transactions, newer),
    budgets: [...bmap.values()],
    gamification: {
      ...g,
      longestStreak: Math.max(g.longestStreak || 0, gi.longestStreak || 0),
      badges: [...new Set([...g.badges, ...gi.badges])],
    },
    settings: { ...cur.settings, onboarded: true, lastBackupAt: cur.settings.lastBackupAt || inc.settings.lastBackupAt },
  };
}

function handleImportFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let inc;
    try {
      inc = store.importState(String(reader.result));
    } catch (err) {
      dialog({ title: 'Berkas tidak bisa diimpor', html: `<p>${esc(err.message)}</p><p class="small muted">Data yang ada sekarang tidak berubah.</p>`, actions: [{ label: 'Oke', kind: 'primary' }] });
      return;
    }
    const n = inc.transactions.filter(isReportable).length;
    const hasData = S.transactions.length > 0;
    const apply = (mode) => {
      const wasBlocked = writeBlocked;
      if (bootStatus === 'corrupt') {
        store.quarantineCorrupt();
        writeBlocked = false;
        bootStatus = 'ok';
      }
      if (writeBlocked) return snack('Tidak bisa impor saat data diblokir. Muat ulang dulu.', { now: true });
      const rev = S._rev;
      S = mode === 'merge' ? mergeStates(S, inc) : { ...inc, _rev: rev, settings: { ...inc.settings, onboarded: true } };
      S._rev = rev;
      persist(true);
      location.hash = '#/';
      render();
      snack(wasBlocked ? 'Backup dipulihkan.' : mode === 'merge' ? 'Data digabungkan.' : 'Data diganti dengan isi backup.', { now: true });
    };
    dialog({
      title: 'Impor backup',
      html: `<p>Berkas berisi <b>${n} transaksi</b>, ${inc.wallets.length} dompet, dan ${inc.categories.length} kategori.</p>
        ${hasData ? '<p class="small muted"><b>Gabungkan</b> menambahkan data dari berkas tanpa menghapus yang ada. <b>Timpa</b> mengganti semua data di sini dengan isi berkas.</p>' : ''}`,
      actions: hasData
        ? [
            { label: 'Batal', kind: 'ghost' },
            { label: 'Timpa', kind: 'danger ghost', onClick: () => confirmOverwrite(() => apply('replace')) },
            { label: 'Gabungkan', kind: 'primary', onClick: () => apply('merge') },
          ]
        : [
            { label: 'Batal', kind: 'ghost' },
            { label: 'Impor', kind: 'primary', onClick: () => apply('replace') },
          ],
    });
  };
  reader.onerror = () => snack('Berkas tidak bisa dibaca.', { now: true });
  reader.readAsText(file);
}

function confirmOverwrite(fn) {
  setTimeout(
    () =>
      dialog({
        title: 'Yakin timpa semua data?',
        html: `<p>${S.transactions.length} transaksi di perangkat ini akan diganti dengan isi berkas. Tidak bisa dibatalkan.</p>`,
        actions: [
          { label: 'Batal', kind: 'ghost' },
          { label: 'Ya, timpa', kind: 'danger', onClick: fn },
        ],
      }),
    50
  );
}

function archiveYear(year) {
  const txs = S.transactions.filter((t) => t.date.startsWith(year));
  if (!txs.length) return;
  dialog({
    title: `Arsipkan ${year}?`,
    html: `<p>${txs.length} transaksi tahun ${year} akan diunduh sebagai berkas arsip, lalu dihapus dari aplikasi. Saldo dompet tetap sama karena selisihnya dipindah ke saldo awal.</p>`,
    actions: [
      { label: 'Batal', kind: 'ghost' },
      {
        label: 'Unduh & arsipkan',
        kind: 'primary',
        onClick: () => {
          const archive = { ...S, transactions: txs, budgets: S.budgets.filter((b) => b.period.startsWith(year)) };
          download(`duitku-arsip-${year}.json`, store.exportState(archive), 'application/json');
          commit((s) => {
            for (const w of s.wallets) {
              const net = sum(txs.filter((t) => t.walletId === w.id), (t) => (t.type === 'income' ? t.amount : -t.amount));
              w.initialBalance += net;
            }
            const ids = new Set(txs.map((t) => t.id));
            s.transactions = s.transactions.filter((t) => !ids.has(t.id));
          });
          snack(`Data ${year} diarsipkan.`, { now: true });
        },
      },
    ],
  });
}

function copyBudgets(mk) {
  const prev = budgetsFor(addMonths(mk, -1));
  commit((s) => {
    for (const b of prev) if (!s.budgets.some((x) => x.period === mk && x.categoryId === b.categoryId)) s.budgets.push({ id: uid('b'), categoryId: b.categoryId, period: mk, limit: b.limit });
  });
  snack(`${prev.length} anggaran disalin dari ${monthLabel(addMonths(mk, -1))}.`, { now: true });
  checkBadges();
}

/* =========================================================
   Event (delegasi)
   ========================================================= */
const actions = {
  'open-sheet': () => openSheet(),
  'open-transfer': () => openSheet({ type: 'transfer' }),
  'close-sheet': () => closeSheet(),
  edit: (el) => {
    if (el.dataset.swiped) return;
    openEdit(el.dataset.id);
  },
  del: (el) => deleteTx(el.dataset.id),
  key: (el) => pressKey(el.dataset.k),
  'pick-cat': (el) => {
    sheet.categoryId = el.dataset.id;
    $$('.cat-grid .cat').forEach((b) => {
      const on = b.dataset.id === sheet.categoryId;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(on));
    });
    updateSheetAmount();
  },
  'sheet-type': (el) => {
    const ty = el.dataset.type;
    if (ty === sheet.type) return;
    sheet.type = ty;
    if (sheet.categoryId && cat(sheet.categoryId)?.type !== ty) sheet.categoryId = null;
    renderSheet();
  },
  'sheet-date': (el) => {
    sheet.date = el.dataset.date;
    renderSheet();
  },
  'sheet-wallet': (el) => {
    sheet.walletId = el.dataset.id;
    $$('[data-act="sheet-wallet"]').forEach((b) => {
      b.classList.toggle('on', b.dataset.id === sheet.walletId);
      b.setAttribute('aria-checked', String(b.dataset.id === sheet.walletId));
    });
  },
  save: () => saveSheet(),
  'sheet-delete': () => {
    const id = sheet.editId;
    closeSheet();
    deleteTx(id);
  },
  'streak-info': () => {
    const g = S.gamification;
    const st = currentStreak();
    const freeze = freezeAvailableFor(ymd());
    dialog({
      title: `🔥 Streak ${st} hari`,
      html: `<p>${st ? 'Kamu sudah mencatat beberapa hari berturut-turut. Pertahankan dengan mencatat minimal satu transaksi tiap hari.' : 'Catat satu transaksi hari ini untuk memulai streak.'}</p>
        <ul class="plain"><li>🏆 Terpanjang: <b>${g.longestStreak || 0} hari</b></li><li>🧊 Freeze bulan ini: <b>${freeze ? 'masih ada' : 'sudah dipakai'}</b></li></ul>
        <p class="small muted">Freeze otomatis menjaga streak kalau kamu bolong sehari, sekali tiap bulan.</p>`,
      actions: [{ label: 'Oke', kind: 'primary' }],
    });
  },
  'dismiss-recap': () => commit((s) => (s.settings.recapDismissedWeek = weekStart())),
  'snooze-backup': () => commit((s) => (s.settings.backupSnoozeUntil = addDays(ymd(), 3))),
  'copy-budgets': (el) => copyBudgets(el.dataset.month || monthKey(ymd())),
  htype: (el) => {
    ui.hist.type = el.dataset.type;
    ui.hist.limit = 150;
    render();
  },
  'toggle-filters': () => {
    ui.hist.showFilters = !ui.hist.showFilters;
    render();
  },
  range: (el) => {
    Object.assign(ui.hist, { from: el.dataset.from, to: el.dataset.to, limit: 150 });
    render();
  },
  'reset-filters': () => {
    Object.assign(ui.hist, { q: '', type: 'all', from: '', to: '', cat: '', wallet: '', limit: 150 });
    render();
  },
  rmonth: (el) => {
    ui.reportMonth = addMonths(ui.reportMonth, +el.dataset.d);
    render();
  },
  bmonth: (el) => {
    ui.budgetMonth = addMonths(ui.budgetMonth, +el.dataset.d);
    render();
  },
  'cat-tab': (el) => {
    ui.catTab = el.dataset.type;
    render();
  },
  'edit-wallet': (el) => walletDialog(el.dataset.id),
  'edit-cat': (el) => categoryDialog(el.dataset.id, el.dataset.type),
  theme: (el) => commit((s) => (s.settings.theme = el.dataset.theme)),
  'export-json': () => exportJSON(),
  'export-csv': () => exportCSV(),
  import: () => $('#import-file').click(),
  'archive-year': (el) => archiveYear(el.dataset.year),
  wipe: () =>
    dialog({
      title: 'Hapus semua data?',
      html: `<p>Semua ${S.transactions.length} transaksi, dompet, kategori, dan anggaran akan dihapus dari perangkat ini. Ketik <b>HAPUS</b> untuk melanjutkan.</p><label class="field"><span class="sr-only">Konfirmasi</span><input name="confirm" autocomplete="off" placeholder="HAPUS"></label>`,
      actions: [
        { label: 'Batal', kind: 'ghost' },
        {
          label: 'Hapus semua',
          kind: 'danger',
          onClick: (d) => {
            if ($("form", d).elements.confirm.value.trim().toUpperCase() !== 'HAPUS') return false;
            const rev = S._rev;
            S = store.createDefaultState();
            S._rev = rev;
            ui.ob = 0;
            ui.obWallets = null;
            persist(true);
            location.hash = '#/';
            render();
          },
        },
      ],
    }),
  install: async () => {
    const e = ui.installEvt;
    if (!e) return;
    e.prompt();
    await e.userChoice;
    ui.installEvt = null;
    render();
  },
  'apply-update': () => {
    flush();
    ui.updateWorker?.postMessage({ type: 'SKIP_WAITING' });
  },
  reload: () => location.reload(),
  'start-fresh': () => {
    if (!store.quarantineCorrupt()) return;
    S = store.createDefaultState();
    bootStatus = 'ok';
    writeBlocked = false;
    render();
  },
  // Onboarding
  'ob-next': () => {
    ui.ob = Math.min(2, ui.ob + 1);
    render();
  },
  'ob-back': () => {
    ui.ob = Math.max(0, ui.ob - 1);
    render();
  },
  'ob-skip': () => finishOnboarding([{ name: 'Dompet Utama', icon: '👛', balance: 0 }]),
  'ob-add': (el) => {
    ui.obWallets.push({ name: el.dataset.name, icon: el.dataset.icon, balance: 0 });
    render();
  },
  'ob-remove': (el) => {
    ui.obWallets.splice(+el.dataset.i, 1);
    render();
  },
  'ob-finish': () => finishOnboarding(ui.obWallets),
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.act];
  if (!fn) return;
  if (el.type !== 'checkbox') e.preventDefault();
  fn(el, e);
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.act === 'quiet') return commit((s) => (s.settings.quietMode = el.checked));
  if (el.id === 'sheet-date' && sheet) {
    if (el.value) sheet.date = el.value > ymd() ? ymd() : el.value;
    return renderSheet();
  }
  if (el.dataset.sheet && sheet) {
    sheet[el.dataset.sheet] = el.value;
    return updateSheetAmount();
  }
  if (el.dataset.hf) {
    ui.hist[el.dataset.hf] = el.value;
    ui.hist.limit = 150;
    return render();
  }
  if (el.dataset.budget) {
    const id = el.dataset.budget;
    const mk = ui.budgetMonth;
    const limit = parseAmount(el.value);
    commit((s) => {
      const b = s.budgets.find((x) => x.period === mk && x.categoryId === id);
      if (!limit) s.budgets = s.budgets.filter((x) => x !== b);
      else if (b) b.limit = limit;
      else s.budgets.push({ id: uid('b'), categoryId: id, period: mk, limit });
    });
    checkBadges();
    return;
  }
  if (el.id === 'import-file') {
    const f = el.files?.[0];
    el.value = '';
    if (f) handleImportFile(f);
  }
});

document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.id === 'q') {
    ui.hist.q = el.value;
    ui.hist.limit = 150;
    return renderHistoryList();
  }
  if (el.id === 'sheet-note' && sheet) sheet.note = el.value;
  if (el.hasAttribute('data-money')) {
    const v = parseAmount(el.value);
    el.value = v ? nf.format(v) : '';
  }
  if (el.dataset.obName != null) ui.obWallets[+el.dataset.obName].name = el.value;
  if (el.dataset.obBal != null) ui.obWallets[+el.dataset.obBal].balance = parseAmount(el.value);
});

document.addEventListener('focusin', (e) => {
  if (e.target.id === 'sheet-date') {
    try {
      e.target.showPicker?.();
    } catch {}
  }
});

document.addEventListener('keydown', (e) => {
  if (!sheet || e.target.closest?.('dialog')) return;
  const inField = e.target.matches('input, select, textarea');
  if (e.key === 'Escape') {
    e.preventDefault();
    return closeSheet();
  }
  if (e.key === 'Enter' && (!inField || e.target.id === 'sheet-note')) {
    if (e.target.closest?.('button') && !inField) return; // biarkan tombol bekerja normal
    e.preventDefault();
    return saveSheet();
  }
  if (inField) return;
  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault();
    pressKey(e.key);
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    pressKey('del');
  } else if (e.key === 'Tab') {
    // Jebakan fokus sederhana di dalam sheet
    const f = $$('.sheet button:not([disabled]), .sheet input, .sheet select').filter((x) => x.offsetParent);
    if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      f[f.length - 1].focus();
    } else if (!e.shiftKey && i === f.length - 1) {
      e.preventDefault();
      f[0].focus();
    }
  }
});

window.addEventListener('hashchange', () => {
  if (sheet) closeSheet();
  parseHash();
  render();
  window.scrollTo(0, 0);
});

// Tab lain menulis data → muat ulang state supaya tidak saling menimpa
window.addEventListener('storage', (e) => {
  if (e.key !== store.KEY && e.key !== null) return;
  const r = store.loadState();
  if (r.status === 'ok' || r.status === 'new') {
    S = r.state;
    render();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush();
  else render(); // tanggal bisa berganti saat aplikasi di latar belakang
});
window.addEventListener('pagehide', flush);

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  ui.installEvt = e;
  if (!sheet) render();
});

/* ---------- Service worker & pembaruan ---------- */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker
    .register('sw.js')
    .then((reg) => {
      const offer = (w) => {
        ui.updateWorker = w;
        $('#banners').innerHTML = bannersHTML();
      };
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w?.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
        });
      });
    })
    .catch(() => {});
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading || !ui.updateWorker) return;
    reloading = true;
    location.reload();
  });
}

/* ---------- Mulai ---------- */
parseHash();
bindSwipe();
render();
if (storageOK && bootStatus === 'new') persist(true);
