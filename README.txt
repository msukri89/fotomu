# Fotomu — PWA Fase 1 (PoC Face Search)

## Tujuan
Membuktikan bahwa Fotomu dapat mencari foto yang kemungkinan memuat orang yang sama berdasarkan foto selfie.

## Cara tes paling mudah
1. Upload folder ini ke GitHub.
2. Aktifkan GitHub Pages.
3. Buka alamat GitHub Pages di Chrome.
4. Pilih 1 foto selfie.
5. Pilih 30–50 foto kegiatan sekaligus.
6. Tekan **Cari Foto Saya**.
7. Perhatikan apakah foto orang yang sama muncul di bagian atas.

## Catatan
- Ini masih PoC, bukan sistem produksi.
- Face descriptor diproses di browser.
- Model face-api.js diambil dari internet saat pertama kali digunakan.
- Ambang awal kemiripan = 0,52. Nilai ini belum final.
- Foto tanpa wajah dilewati.
- Untuk foto dengan banyak orang, setiap wajah dibandingkan dengan selfie dan jarak terbaik dipakai.
- Jangan gunakan hasil ini sebagai identifikasi pasti.

## Tahap berikutnya
Jika hasil tes nyata memuaskan, kita lanjutkan ke:
1. UI Fotomu sebenarnya.
2. Struktur kegiatan/rak.
3. Admin upload.
4. Storage.
5. Index descriptor agar tidak menghitung ulang setiap pencarian.
6. Face search produksi.
7. Optimasi HP dan foto dalam jumlah besar.
