# Duitku

Aplikasi web pencatat keuangan pribadi, offline-first, tanpa server dan tanpa database.
Semua data disimpan di `localStorage` (kunci `duitku.v1`) pada perangkat pengguna.

## Menjalankan

Tanpa build step. Cukup sajikan folder ini lewat server statis apa pun (ES module dan service worker tidak jalan dari `file://`):

```bash
python3 -m http.server 5173
```

Lalu buka http://localhost:5173.

## Deploy

Unggah seluruh folder ke Netlify, Vercel, atau GitHub Pages (situs statis).
**Setiap rilis, naikkan `VERSION` di `sw.js`** supaya pengguna mendapat banner "Versi baru siap".

## Struktur

| Berkas | Isi |
| --- | --- |
| `index.html` | Kerangka halaman, bottom tab bar, tombol Quick Add |
| `app.js` | Seluruh UI dan logika: beranda, Quick Add, riwayat, laporan, anggaran, gamifikasi, ekspor/impor |
| `storage.js` | Satu-satunya modul yang menyentuh localStorage: `loadState`, `saveState`, `exportState`, `importState`, migrasi skema |
| `styles.css` | Tampilan mobile-first (kontainer maks 480 px), dark mode, mode tenang |
| `sw.js` | Service worker: cache semua aset untuk offline, update atas persetujuan pengguna |
| `manifest.webmanifest`, `icons/` | PWA |

## Migrasi skema

Tambahkan fungsi di objek `migrations` pada `storage.js` (misalnya `1: migrate_1_to_2`) lalu naikkan `SCHEMA_VERSION`.
Data lama otomatis dicadangkan ke `duitku.backup.v<n>` sebelum migrasi.
