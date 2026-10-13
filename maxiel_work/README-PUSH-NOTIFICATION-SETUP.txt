MAXIEL WEB — GOOGLE LOGIN + WAJIB IZINKAN NOTIFIKASI + PUSH BROADCAST

YANG SUDAH DITAMBAHKAN
- Overlay mengunci penggunaan website sampai login Google dan izin notifikasi berstatus granted.
- Mendaftarkan FCM token pengguna ke Firestore.
- Service worker firebase-messaging-sw.js menampilkan push saat halaman tidak aktif/tertutup (bergantung dukungan browser/OS).
- Cloud Function memantulkan dokumen broadcast yang sah menjadi push ke token yang terdaftar.
- Gmail developer diset ke shamiunaje@gmail.com pada Gmail Dev.js, firestore.rules, dan functions/index.js. Ubah semua jika Gmail developer berbeda.

WAJIB DIKONFIGURASI SEBELUM PUSH BERFUNGSI
1. Firebase Console > Project settings > Cloud Messaging > Web Push certificates. Buat/gunakan VAPID key.
2. Salin PUBLIC VAPID KEY ke konstanta FCM_VAPID_KEY di app.js (jangan pernah menaruh private key di frontend).
3. Firebase Console > Authentication: aktifkan Google. Tambahkan hostname website ke Authorized domains.
4. Buat Firestore database dan publish firestore.rules. Aturan mengizinkan user menulis token miliknya sendiri, dan hanya Gmail developer terverifikasi membuat broadcast.
5. Pasang Firebase CLI di komputer/Termux yang mendukung Node.js: npm install -g firebase-tools
6. Dari root project, login dan pilih project:
   firebase login
   firebase use coffee-spark-ai-barista-ed3e0
   firebase deploy --only firestore:rules,functions
   Jika hosting Firebase dipakai: firebase deploy --only hosting
7. Saat deploy Functions pertama kali, Firebase mungkin meminta aktivasi billing/Blaze. Pastikan project mengaktifkan Cloud Messaging API dan Firebase Cloud Messaging API bila diminta.
8. Hosting wajib HTTPS (localhost juga dianggap secure untuk pengembangan). GitHub Pages sudah HTTPS.

CATATAN PERANGKAT
- Android: gunakan Chrome/Browser modern, izin notifikasi harus Allow. Jangan gunakan mode incognito.
- iPhone/iPad: Web Push memerlukan iOS/iPadOS 16.4+, website ditambahkan ke Home Screen, lalu dibuka dari ikon Home Screen sebelum izin diminta. Dukungan browser berbeda-beda.
- Browser/perangkat yang tidak mendukung FCM tidak dapat dipaksa menerima push. Gate akan menjelaskan jika fitur tidak didukung.
- Pengguna yang belum pernah membuka website atau belum memberi izin tidak memiliki token, jadi tidak dapat menerima push. Tidak ada cara yang sah untuk memaksa izin semua orang.
- Jangan deploy rules terbuka untuk memperbaiki permission-denied. Pastikan database Firestore benar dan deploy rules.
- Cloud Function memakai allowlist developer yang sama. Jangan hanya mengandalkan UI untuk keamanan.

GMAIL DEVELOPER
Default: shamiunaje@gmail.com (diambil dari screenshot pengguna). Ubah alamat ini di ketiga file jika itu bukan Gmail developer yang dimaksud.
