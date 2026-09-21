# Catatan perubahan konten Sprout

Tanggal audit: 14 September 2026. Dokumen ini membandingkan copy prototype dengan materi publik Sprout yang diperiksa pada proyek sebelumnya. Copy di dalam prototype tetap English sesuai aturan proyek.

## Sumber dan batas klaim

- [Homepage Sprout](https://joinsprout.co/) menjadi sumber fitur utama.
- [Google Play](https://play.google.com/store/apps/details?id=com.meetingpoint) mengonfirmasi posisi produk untuk parent, konteks school/grade, aktivitas keluarga, dan email support `tony@joinsprout.co`.
- [App Store](https://apps.apple.com/in/app/sprout-the-app-for-parents/id6739574052) menjadi tujuan unduh iOS.
- [Privacy](https://joinsprout.co/privacy), [Terms](https://joinsprout.co/terms), dan [Child Safety](https://joinsprout.co/child-safety) dipertahankan sebagai tujuan legal.
- Maggie, Partiful, dan Bevel hanya dipakai untuk visual direction. Tidak ada fitur, metrik, endorsement, atau copy mereka yang dipindahkan ke Sprout.

Klaim fitur berarti klaim tersebut sudah ada pada materi Sprout. Prototype tidak menguji backend, akun, proses moderasi, atau cakupan layanan.

## Perubahan utama

| Bagian | Materi Sprout | Copy prototype | Catatan |
|---|---|---|---|
| Hero | “When parents bond, childhoods flourish.” | “Your family’s week has a new home.” | Headline baru menjelaskan manfaat produk. Tagline asli tetap muncul pada foto hero dan CTA akhir. |
| Hero body | Events, playdates, keluarga sekitar, dan pertemanan | “Meet parents from school, find local activities, plan the next playdate, and keep everyone in the loop.” | Merangkum manfaat lama tanpa menambah kemampuan baru. |
| Week | Events, invitations, sports, classes, dan family activities | Jadwal Wed, Sat, Sun yang dapat dipilih | Contoh memakai nama dan waktu yang terlihat pada screenshot Sprout. Label “Example from Sprout screens” mencegahnya terbaca sebagai event live. |
| Daily Brief | Weather, birthdays, events, reminders, assigned tasks | “The morning handoff your brain has been asking for.” | Headline emosional baru. Lima kategori tetap berasal dari produk. |
| Community | Direktori berdasarkan school/grade dan clubs | “Turn drop-off faces into people you know.” | Framing baru untuk menjelaskan nilai direktori. Tidak menyatakan setiap sekolah sudah tersedia. |
| Chat | Group chats, event threads, dan direct messages | “Plans move. Everyone stays with them.” | Copy diringkas. Jenis percakapan tetap sama. |
| Events + photos | Birthday, playdate, family event, dan posting foto | “Make the invite. Keep the good part.” | Menggabungkan planning dan memories menjadi satu alur. |
| Family profile | Data keluarga yang berulang untuk sports dan camps | “Save the details. Skip the repeat.” | Mengganti klaim absolut “Skip the forms forever.” Detail profil tetap mengikuti materi lama. |
| Trust | Verified members, moderation, private community | “Your family’s world deserves careful boundaries.” | Headline baru. Tiga klaim di bawahnya berasal dari homepage lama. |
| Download | Dua store badges dan tagline utama | “Bring your family’s people, plans, and everyday moments together.” | Penutup editorial baru. Tidak menambah klaim harga atau ketersediaan kota. |

## Improvisasi yang disengaja

Kalimat berikut dibuat untuk memberi ritme dan konteks pada konsep, bukan sebagai hasil pelanggan:

- “Built for parents. Rooted in your community.”
- “Ready before the first backpack hits the floor.”
- “Shared school. Shared interests.”
- “Little plans. Big memories.”
- “The next hello is nearby.”
- “For parents, around the corner.”

Tidak ada jumlah pengguna, rating, testimonial, logo sekolah mitra, kutipan ahli, atau klaim perkembangan anak yang dibuat untuk mengisi halaman.

Hero memakai gambar konsep AI yang sudah dimiliki proyek. Alt text menandainya sebagai concept image. Orang dalam gambar bukan pelanggan, anggota Sprout, atau pemberi endorsement. Untuk produksi, ganti dengan foto keluarga berizin saat aset tersedia.

## Demo one-tap

Tombol “Try one tap” hanya mengubah state lokal menjadi “Preview complete.” Teks permanen menjelaskan bahwa tidak ada informasi yang dikumpulkan dan tidak ada registrasi yang dikirim. Disclosure di sebelahnya menampilkan kategori data dari materi Sprout:

- Child information and birthdate
- Allergies and medical notes
- Emergency contacts
- Jersey and shirt size
- Photo and waiver consent

## Keputusan owner sebelum produksi

| Prioritas | Temuan | Keputusan yang dibutuhkan |
|---|---|---|
| P1 | Homepage lama menyebut iOS 15+, sedangkan App Store saat audit sebelumnya mensyaratkan iOS 17.6+. | Versi OS dihilangkan dari prototype. Konfirmasi minimum OS aktual sebelum ditampilkan kembali. |
| P1 | Homepage menyebut verification, moderation, no ads, dan tidak menjual data. Privacy masih memuat bahasa generic third-party advertising. | Selaraskan praktik produk dan kebijakan. Prototype hanya menampilkan tiga klaim yang paling dekat dengan pengalaman komunitas. |
| P1 | Child Safety pernah mencantumkan `support@yourdomain.com`. | Pastikan halaman produksi memakai jalur laporan yang benar sebelum link ini dipromosikan lebih jauh. |
| P1 | “Skip the forms forever” terlalu luas dibanding informasi integrasi yang tersedia. | Prototype memakai “Save the details. Skip the repeat.” Konfirmasi league dan camp yang didukung sebelum menjanjikan cakupan. |
| P2 | Google Play menyebut peluncuran awal di Austin, sementara homepage tidak menjelaskan area layanan. | Prototype tidak menyebut kota atau ketersediaan nasional. Tentukan pesan availability untuk visitor di luar area aktif. |

## Iterasi yang disarankan

1. Uji hero ini melawan versi yang membuka dengan school/grade directory. Ukur pemahaman fungsi Sprout dan klik store, bukan sekadar interaksi tab.
2. Ganti foto konsep dengan satu momen komunitas Sprout yang nyata dan berizin.
3. Setelah alur verification dikonfirmasi, jelaskan siapa yang dapat melihat profil keluarga dan foto anak dengan satu contoh yang konkret.
4. Sambungkan contoh event ke reminder Daily Brief dan foto setelah event menggunakan satu skenario yang jelas berlabel contoh.
5. Pada implementasi one-tap asli, tampilkan data yang akan dibagikan sebelum user mengonfirmasi.
