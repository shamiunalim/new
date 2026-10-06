# Maxiel Web + Maxiel AI

Versi ini mempertahankan seluruh fitur Maxiel Web Ikon-Aplikasi dan menambahkan halaman Maxiel AI dari Maxiel Web AI Maxiel.

## AI
Halaman AI menggunakan endpoint:
https://maxiel-ganteng.shamiunaje.workers.dev/api/ai?query=...

`worker.js` adalah source Cloudflare Worker yang digunakan oleh endpoint tersebut. Jika endpoint online sudah aktif, `worker.js` tidak perlu diubah agar halaman AI bekerja.
