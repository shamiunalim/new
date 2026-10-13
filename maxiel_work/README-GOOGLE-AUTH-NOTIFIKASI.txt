PENAMBAHAN LOGIN GOOGLE, AKSES DEVELOPER, DAN BROADCAST

1. Firebase Console > Authentication > Sign-in method > aktifkan Google.
2. Authentication > Settings > Authorized domains: tambahkan domain hosting website.
3. Firebase Console > Firestore Database: buat database.
4. Ganti email placeholder pada "Gmail Dev.js" DAN "firestore.rules" dengan Gmail developer sebenarnya (huruf kecil). Samakan keduanya.
5. Publikasikan firestore.rules melalui Firebase Console > Firestore Database > Rules, atau Firebase CLI.
6. Deploy website lewat HTTPS. Popup Google tidak berfungsi normal jika dibuka sebagai file://.
7. Uji dengan akun developer dan akun biasa. Akun biasa tidak boleh bisa membuat broadcast meski memanggil Firestore langsung.

Catatan penting:
- API key konfigurasi Firebase web memang ditujukan untuk aplikasi klien, tetapi keamanan ditentukan oleh Authentication, Firestore Rules, dan konfigurasi project.
- Gmail Dev.js di browser bukan rahasia. Karena itu Firestore Rules menjadi pengaman yang sebenarnya.
- Fitur ini mengirim pengumuman ke semua akun yang login dan dapat membaca koleksi broadcasts (hingga 50 terbaru), bukan push notification OS dan bukan menjangkau orang yang tidak pernah membuka/login website. Untuk push notification latar belakang ke perangkat diperlukan Firebase Cloud Messaging, service worker, izin notifikasi, dan biasanya backend tepercaya.
- Ganti placeholder email pada kedua file sebelum deploy. Jangan biarkan email placeholder.
