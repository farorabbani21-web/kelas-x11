# Kelas X-11

Website kelas untuk jadwal pelajaran, jadwal piket, lokasi sekolah, serta tugas dan PR.

## Tugas dan lampiran publik

Tugas, PR, dan lampiran yang dikirim melalui situs disimpan di Netlify Blobs dan dapat dilihat semua pengunjung. Pengiriman bersifat publik dan tidak memerlukan login. Lampiran yang didukung: JPEG, PNG, GIF, WebP, PDF, dokumen Office, dan teks hingga 4 MB. Kiriman tidak dapat dihapus dari halaman publik.

Sambungkan repo ini ke situs Netlify dan gunakan pengaturan di `netlify.toml`. Netlify perlu membangun dari repo agar fungsi pada `netlify/functions/` aktif. Deploy manual file statis melalui Netlify Drop tidak menjalankan fungsi server.

## Pengembangan lokal

Jalankan dengan Netlify CLI untuk menyediakan fungsi dan Blobs secara lokal:

```sh
npx netlify dev
```
