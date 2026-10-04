# Kelas X-11

Website kelas sederhana yang menampilkan jadwal, piket, lokasi, dan daftar tugas/PR.

## Tugas dan lampiran publik

Tugas, PR, dan lampiran disimpan di Netlify Blobs melalui Netlify Function, sehingga dapat dilihat semua pengunjung. Pengiriman bersifat publik dan tidak memerlukan login. File yang didukung meliputi gambar JPEG, PNG, GIF, WebP, PDF, dokumen Office, serta teks dengan ukuran maksimal 4 MB.

Penghapusan tugas hanya tersedia untuk admin. Netlify harus memiliki environment variable rahasia `TASK_DELETE_TOKEN` yang tersedia untuk Functions. Tombol **Hapus (admin)** meminta token tersebut dan konfirmasi sebelum menghapus tugas beserta lampirannya. Jangan masukkan token ke repo atau bagikan kepada pengguna umum.

Hubungkan repo ini ke situs Netlify yang sudah ada dan gunakan pengaturan dari `netlify.toml`. Netlify perlu menjalankan build/deploy dari repo agar fungsi di `netlify/functions/` aktif. Situs yang hanya diunggah lewat Netlify Drop tidak menjalankan fungsi server.

## Pengembangan lokal

Gunakan Netlify CLI agar function dan Blobs tersedia di lingkungan lokal:

```sh
npx netlify dev
```
