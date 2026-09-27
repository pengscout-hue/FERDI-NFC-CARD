# Kartu NFC Google Review

Website aktivasi kartu NFC: sekali diaktifkan oleh pemilik bisnis, tap kartu berikutnya
langsung mengarahkan pelanggan ke halaman Google Review bisnis tersebut.

## Cara kerja
- Setiap kartu fisik ditulis dengan URL `https://domainkamu.vercel.app/?code=KODEKARTU`
  (kode unik per kartu, bisa kamu tentukan sendiri saat memprogram tag NFC-nya).
- Saat link dibuka dan kode itu **belum aktif**, muncul form aktivasi: nama bisnis,
  link Google Review, dan PIN 4 digit.
- Setelah diisi, data disimpan di database (Vercel KV). Tap berikutnya ke URL yang sama
  akan otomatis mengarahkan (redirect) ke link Google Review itu.
- PIN dipakai untuk mengunci perubahan — pemilik bisa membuka "Ubah data kartu" kapan
  pun untuk mengoreksi nama/link jika salah input.

## Kenapa bukan "cari otomatis" nama bisnis?
Pencarian otomatis seperti pada referensimu butuh Google Places API (berbayar, perlu
API key & billing Google Cloud). Supaya kamu bisa langsung pakai tanpa setup itu, form
ini minta pemilik menempel **link Google Review** langsung (dari tombol Bagikan di
Google Maps, atau "Minta ulasan" di Google Business Profile) — hasil akhirnya sama:
pelanggan tetap otomatis sampai di halaman ulasan yang benar. Kalau nanti kamu mau versi
dengan pencarian otomatis, tinggal tambahkan Google Places API di endpoint `/api/card.js`.

## Deploy ke Vercel
1. Push folder ini ke repo GitHub, lalu import ke Vercel (vercel.com/new).
2. Di dashboard project → tab **Storage** → tambahkan **Vercel KV** (gratis untuk skala kecil).
   Vercel otomatis mengisi environment variable yang dibutuhkan `@vercel/kv`.
3. Deploy. Situs kamu jadi `https://nama-project.vercel.app`.
4. Program setiap kartu NFC dengan URL `https://nama-project.vercel.app/?code=KODEUNIK`
   pakai app seperti NFC Tools (Android/iOS).

## Struktur file
- `index.html` — tampilan (form aktivasi, redirect, edit).
- `api/card.js` — API GET (cek status) / POST (aktivasi) / PUT (edit dengan PIN).
- `package.json` — dependency `@vercel/kv`.
