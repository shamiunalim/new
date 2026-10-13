// Ganti dengan Gmail developer yang diizinkan, gunakan huruf kecil.
// Penting: daftar di sisi browser hanya mengatur tampilan. Keamanan sebenarnya
// wajib diterapkan di firestore.rules (file pendamping) sebelum dipublikasikan.
export const DEVELOPER_EMAILS = [
  "shamiunaje@gmail.com"
].map(email => email.toLowerCase());
