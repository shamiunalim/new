MAXIEL WEB - CUSTOM APP IDENTITY

Fitur:
- Nama website/aplikasi dapat diubah dari Pengaturan.
- Foto ikon aplikasi dapat diganti dari Pengaturan.
- Ikon developer.jpg dipakai sebagai logo M default di topbar dan sidebar.
- Favicon dan judul browser mengikuti nama/ikon yang dipilih.
- PWA manifest + service worker sudah disertakan.
- Tombol "Pasang Aplikasi" muncul jika browser menyediakan instalasi PWA dan opsi pemasangan diaktifkan.
- Tombol pemasangan dapat dimatikan dari Pengaturan.
- Pengaturan nama dan ikon disimpan di perangkat/browser menggunakan localStorage.

Catatan:
- Karena website berjalan di GitHub Pages, nama/foto custom disimpan per perangkat/browser.
- Ikon custom untuk favicon dan preview langsung mengikuti pilihan.
- Metadata instalasi PWA mengikuti manifest dinamis pada browser yang mendukungnya; beberapa browser dapat mempertahankan metadata manifest saat aplikasi pertama kali dipasang.
- Untuk instalasi PWA, website harus dibuka melalui HTTPS (GitHub Pages sudah HTTPS).

File penting:
index.html
app.js
style.css
api.js
manifest.json
service-worker.js
developer.jpg
icon-192.png
icon-512.png
