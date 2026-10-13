ALIM CHAT — ZIP WEB PWA

FITUR
- UI aplikasi chat yang terinspirasi aplikasi pesan.
- Login akun Google melalui Firebase Authentication.
- Obrolan umum real-time via Cloud Firestore setelah setup.
- Bisa dipasang sebagai ikon aplikasi di Android melalui Chrome.
- Status dan panggilan masih placeholder, belum fitur aktif.

1) FIREBASE CONFIG
Firebase Console > Project settings (gear) > General > Your apps > pilih aplikasi web </> > SDK setup and configuration > Config.
Buka firebase-config.js dan ganti placeholder dengan nilai config web milikmu. Jangan pernah taruh private service-account key di website.

2) GOOGLE LOGIN
Authentication > Sign-in method > aktifkan Google.
Authentication > Settings > Authorized domains > tambahkan shamiunalim.github.io.

3) FIRESTORE
Build > Firestore Database > Create database. Setelah database dibuat, tab Rules, pasang rules ini lalu Publish:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    match /rooms/general/messages/{messageId} {
      allow read: if signedIn();
      allow create: if signedIn()
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.text is string
        && request.resource.data.text.size() > 0
        && request.resource.data.text.size() <= 2000
        && request.resource.data.name is string;
      allow update, delete: if signedIn() && resource.data.uid == request.auth.uid;
    }
  }
}

Catatan keamanan: semua pengguna yang login dapat membaca ruang umum. Jangan kirim informasi rahasia. Untuk produksi, tambahkan App Check, rate limits/moderasi dan aturan lebih ketat.

4) UPLOAD KE GITHUB PAGES
Ekstrak ZIP lalu upload seluruh isi folder ke repository alim-web pada branch/folder yang digunakan GitHub Pages. Commit, lalu buka https://shamiunalim.github.io/alim-web/ . Tunggu beberapa menit bila belum update.

5) PASANG IKON DI ANDROID
Buka website di Chrome > menu ⋮ > Instal aplikasi atau Tambahkan ke layar utama.

BATASAN
Ini template awal, bukan WhatsApp asli. Login/chat lintas pengguna aktif setelah Firebase diisi dan Firestore dibuat. Tidak membaca pesan/notifikasi WhatsApp. Belum ada panggilan suara/video, status asli, chat privat, grup, kirim file/foto, enkripsi end-to-end, atau push notification.