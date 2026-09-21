# Catatan perubahan konten Sprout

Tanggal audit: 12 September 2026. Dokumen ini menjelaskan perubahan pada `index.html` dan copy interaksi pada `script.js`, dibandingkan dengan homepage publik Sprout yang diperiksa pada tanggal tersebut. Bahasa deliverable tetap English. Ini konsep redesign yang bisa ditinjau, belum publikasi ke website produksi.

## Dasar konten dan batas interpretasi

- [Homepage Sprout](https://joinsprout.co/) adalah sumber utama: komunitas parent, direktori sekolah/grade, events, chat, foto, Daily Brief, event planning, saved family profile, serta one-tap registration.
- [Berkas aplikasi publik saat audit](https://joinsprout.co/assets/index-y5gRk4lw.js) dipakai untuk memeriksa copy yang dirender, bagian yang disembunyikan, dan tujuan navigasi. Nama berkas ini dapat berubah saat produksi diperbarui.
- [Google Play](https://play.google.com/store/apps/details?id=com.meetingpoint) mengonfirmasi konteks parent, sekolah/grade, kegiatan keluarga, dan peluncuran di Austin. Daftar ini juga mencantumkan `tony@joinsprout.co` sebagai email support.
- [App Store](https://apps.apple.com/in/app/sprout-the-app-for-parents/id6739574052) dipakai untuk memeriksa tujuan unduh dan kompatibilitas iOS.
- [Bevel](https://www.bevel.health/) dipakai sebagai referensi visual dari brief, bukan sumber fitur atau klaim Sprout. Tidak ada klaim kesehatan, metrik tubuh, integrasi wearable, atau rekomendasi medis yang dipindahkan.

Klaim fitur di bawah berarti **sudah tertulis pada website Sprout**, bukan berarti implementasi aplikasi atau operasi bisnisnya sudah diuji. Demo halaman ini tidak mengakses akun Sprout atau mengirim registrasi.

## Urutan cerita yang berubah

**Homepage asli yang terlihat:** Hero → Daily Brief → enam feature cards → event planning → one-tap registration → closing download CTA/footer. Bagian tiga langkah how-it-works ada dalam sumber, tetapi disembunyikan oleh CSS.

**Preview baru:** Hero → pengantar koneksi keluarga → tiga feature tabs → Daily Brief → event planning + memories → one-tap demo → trust → cerita Sprout → download → footer.

Alasan perubahan: visitor mengenali manfaat sosial Sprout lebih dulu, lalu mengeksplorasi fitur yang mendukungnya. Daily Brief menjadi manfaat praktis setelah konteks komunitas terbentuk. Memories dipindahkan ke event planning karena foto adalah kelanjutan alami dari kegiatan bersama. Trust dan cerita pendirian mendapat ruang sendiri menjelang keputusan unduh.

Ini perubahan hierarki, bukan penambahan lini produk. Direktori parent tetap ada di tab Community. Clubs tetap dijelaskan di tab yang sama. Tiga tab bukan berarti produk hanya mempunyai tiga fitur.

## Copy asli ke copy preview

| Bagian | Sumber asli | Preview baru | Jenis perubahan |
|---|---|---|---|
| Hero headline | “When parents bond, childhoods flourish.” | Tetap sama | Identitas utama dipertahankan. |
| Hero body | Events, playdates, undangan keluarga dan pertemanan di lingkungan anak | “Find events, plan playdates, and build the friendships your family deserves. All in the neighborhood your kids call home.” | Ringkasan editorial; membetulkan susunan kata playdates dan memecah kalimat. Undangan keluarga tetap ada pada tab Discover. |
| Hero actions | Dua badge unduh langsung | “Download Sprout” dan “See how it works” | CTA utama menuju pemilih App Store/Google Play di bagian download; CTA kedua menuju feature tabs. Ikon panah menandai navigasi ke fitur, bukan pemutar video. |
| Hero reassurance | Private community terdapat pada trust card | “A private community, built for parents.” | Klaim lama dipindahkan mendekati CTA. |
| Intro | Headline “From neighbor to lifelong friend” ada pada bagian how-it-works yang tersembunyi | “From neighbor to lifelong friend.” + “Parenthood comes with a lot. Finding your people should feel easy.” | Headline lama dibuat terlihat; kalimat pendukung adalah improvisasi emosional baru. |
| Feature heading | “Everything your family actually needs”; body menekankan desain untuk realitas parenthood | Heading tetap; body menjadi “For the messy, joyful, unpredictable reality of parenthood.” | Menghapus pujian terhadap desain sendiri dan memadatkan copy. |
| Discover | Local events, playdates, sports, classes, outings, filter usia | “Playdates, sports, classes, and outings. Discover local events filtered for your kids’ ages.” | Memadatkan informasi yang sama; tanpa klaim katalog baru. |
| Discover bullets | Manfaat tersebar antara hero, feature dan how-it-works | “Discover what’s happening nearby”; “Find plans that fit your family”; “Invite families along” | Pengelompokan ulang manfaat lama. |
| Community | Parenting tribe, drop-off, grade directory; clubs pada how-it-works tersembunyi | Menyatukan klub dan direktori di tab Community, dengan subjudul “Know who’s who” | Penyederhanaan arsitektur; kata absolut setiap parent tidak diulang. |
| Stay connected | Group chats, event threads, DMs | “Group chats, event threads, and DMs keep everyone in the loop, so no plan falls through the cracks.” | Copy dirapikan; fitur tetap. Tambahan “From the first hello to the next playdate, stay connected with your people.” adalah framing baru. |
| Daily Brief | “Wake up to your daily brief”; empat ringkasan praktis | “A calmer start. A clearer day.” + “Wake up to your Daily Brief. The whole day on one screen, ready to read with your coffee.” | Headline emosional baru. Frasa minum kopi dan satu layar berasal dari narasi lama. Bukan klaim hasil kesehatan mental. |
| Daily Brief details | Weather/clothing, birthdays, events/reminders, assigned tasks | Empat kategori tetap, menjadi accordion dengan penjelasan lebih lengkap | Tambahan manfaat “One less thing to work out before heading out.” bersifat editorial. Tidak ada sumber data atau integrasi baru yang dijanjikan. |
| Event planning | “Plan the important moments” | “For the moments that matter.” | Reframing headline; birthday parties, playdates, family events dan grade tetap dipertahankan. |
| Event planning body | Kegiatan keluarga dan berbagi pengalaman dengan families in your grade | “Plan birthday parties, host playdates, and bring families in your grade together. Make room for the kind of days everyone remembers.” | Kalimat pertama merangkum fitur; kalimat kedua improvisasi emosional. |
| Memories | Card tersendiri tentang posting foto | “Share the good stuff” dan penjelasan posting foto dipertahankan di bawah planning | Perpindahan lokasi, bukan fitur tambahan. |
| One-tap headline | “Sign up once. Skip the forms forever.” | Tetap sama | Klaim absolut milik sumber dipertahankan untuk perbandingan konsep, tetapi perlu batas cakupan sebelum produksi. Lihat catatan konfirmasi. |
| One-tap body | Saved profile untuk sports league/camp; detail keluarga berulang | “Save your family’s details once. Register for sports leagues and summer camps with a single tap.” | Pemadatan; tidak menambahkan merchant, integrasi atau jenis pembayaran. |
| Saved profile | Enam label informasi keluarga pada sumber | “Child info”, “Birthdate”, “Allergies & medical notes”, “Emergency contacts”, “Jersey & shirt size”, “Photo & waiver consent” | Kategori tetap. “notes” menjelaskan label medis menggunakan istilah yang sudah ada pada form asli. Dibungkus disclosure baru. |
| Trust | Verification, moderation, private community, no data sale; no ads/family-safe badges | “Their world is precious. We treat it that way.” diikuti klaim sumber yang sama | Headline emosional baru. Tidak menambahkan sertifikasi, enkripsi, background check, atau jaminan keselamatan baru. |
| Our story | Narasi membangun kembali kehidupan sosial setelah mempunyai anak di closing CTA | Copy cerita dipindahkan ke section `#about`, headline “Parenthood changes your world. Find your people in this one.” | Headline baru; bukan kisah founder, kutipan pelanggan, atau sejarah perusahaan yang dibuat-buat. |
| Download | Narasi sosial panjang, dua store badges, info biaya/OS/subscription | “Your people are out there. Let’s find them.” + “A few taps today. More little moments together.” | Penutup emosional baru. Informasi OS/biaya/subscription dihapus dari preview; dua store badges tetap tersedia. |

## Improvisasi visual dan label interaksi

Seluruh kalimat berikut dibuat untuk menjelaskan suasana konsep. Tidak dipresentasikan sebagai testimonial atau hasil pengguna:

- Hero photo: “A little closer to your people.”, “A little more room to grow.”, “Good things start nearby.”
- Discover illustration: “Your next good day is out there.”
- Community illustration: “Shared interests. Real connections.”
- Daily Brief caption: “Your day, a little more together.”
- Planning illustration: “Little plans. Big memories.”
- Registration comparison: “The same details. Again. And again.”
- Registration demo: “Their next adventure. Your easiest sign-up.” dan “Your saved family profile is ready.”

Label navigasi baru atau disusun ulang: “Get Sprout”, “Our story”, “Make a plan”, “Find your people”, “Keep in touch”, “Let’s grow together”, “Choose your app store to get started.” dan “Back to top”. Semua menuju bagian halaman atau tujuan unduh/kontak yang dijelaskan, bukan menjalankan tindakan pada akun.

Pada demo, “Try one tap” mengubah tampilan menjadi “You’re registered.”; deskripsinya menjadi “That’s how simple a saved family profile can make it.” Tombol “Try again” mengembalikan kondisi awal. Kalimat permanen **“Interactive preview only. No registration is submitted.”** dan pengumuman pembaca layar menjelaskan bahwa ini simulasi. Tidak ada formulir yang meminta informasi anak sungguhan, request registrasi, penyimpanan data keluarga, atau klaim berhasil membayar/mendapat slot.

## Foto dan bukti produk

Hero memakai ulang **gambar konsep AI yang sudah ada**, bukan pemotretan baru atau foto pelanggan Sprout. Sumbernya adalah `../sprout-redesign-assets/hero-neighborhood-families.webp`, dengan dokumentasi `../sprout-redesign-assets/hero-neighborhood-families.prompt.md`. Catatan sumber menyebut OpenAI image generation pada 7 September 2026. Salinan yang digunakan preview diberi nama `assets/family-neighborhood.webp`.

Adegan tersebut menggambarkan parent dan anak yang berinteraksi di piknik lingkungan. Caption baru membantu menyampaikan suasana, tetapi orang dalam gambar tidak dianggap anggota, pelanggan, atau pemberi endorsement. Alt text menandainya sebagai concept image. Untuk produksi, pemotretan keluarga yang sudah memberi izin akan memberi identitas Sprout yang lebih kuat daripada mempertahankan konsep AI tanpa batas waktu.

Screenshots aplikasi yang dipasang pada hero dan bagian produk berfungsi menjelaskan interface. Demo HTML yang berubah ketika diklik tetap terpisah dari screenshots. Tidak ada testimonial, angka pengguna, rating, logo sekolah mitra, kutipan ahli, atau hasil pertumbuhan anak yang dibuat untuk mengisi ruang seperti social proof.

## Navigasi yang dibenahi

- `#about` sekarang mempunyai section nyata. Header dan footer sebelumnya mengarah ke target yang tidak ada pada homepage publik.
- Footer “Blog” dihilangkan karena link sumber tidak membuka blog. Tidak dibuat artikel atau halaman placeholder.
- “Contact” diarahkan ke `mailto:tony@joinsprout.co`, berdasarkan email support pada [listing Google Play](https://play.google.com/store/apps/details?id=com.meetingpoint). Tidak ada pesan yang dikirim.
- Terms dan Privacy diarahkan ke rute produksi yang ditemukan: [Terms](https://joinsprout.co/terms) dan [Privacy](https://joinsprout.co/privacy). Preview awal sempat memakai `/terms-and-conditions` dan `/privacy-policy`; temuan tersebut disampaikan dan diperbaiki.
- [Child Safety](https://joinsprout.co/child-safety) ikut ditautkan. Isi halaman eksternal tetap perlu penanganan owner karena memakai email contoh, seperti catatan di bawah.
- App Store menggunakan [URL canonical Sprout](https://apps.apple.com/in/app/sprout-the-app-for-parents/id6739574052). Slug lama bernama Meeting Point masih merespons, tetapi nama canonical lebih sesuai identitas sekarang.

## Konfirmasi owner sebelum produksi

| Prioritas | Temuan konkret | Dampak pada preview dan keputusan berikutnya |
|---|---|---|
| P1 | Homepage lama menyebut iOS 15+, sedangkan [App Store](https://apps.apple.com/in/app/sprout-the-app-for-parents/id6739574052) saat audit mensyaratkan iOS 17.6+. | Info versi dihapus dari preview supaya tidak mewariskan informasi salah. Owner perlu memastikan versi minimum aktual jika ingin menampilkannya kembali. Jangan mengembalikan 15+ dari copy lama. |
| P1 | Janji no ads, verification, moderation dan tidak menjual data berasal dari homepage. [Privacy](https://joinsprout.co/privacy) masih memuat bahasa generic third-party advertising. | Ketidaksinkronan editorial, bukan kesimpulan bahwa klaim homepage palsu. Owner perlu mengonfirmasi praktik produk dan menyelaraskan kebijakan sebelum trust section dipublikasikan. Tidak mengarang metode verification atau sertifikasi. |
| P1 | [Child Safety](https://joinsprout.co/child-safety) mencantumkan `support@yourdomain.com`. | Link halaman valid tetapi jalur pelaporannya belum siap. Owner perlu mengganti kontak di sumber produksi dengan alamat yang benar-benar menerima laporan; email support biasa tidak otomatis diasumsikan sebagai petugas child safety. |
| P1 | “Skip the forms forever” dan narasi semua website memberi cakupan lebih luas daripada rincian integrasi yang tersedia. | Demo sudah jujur sebagai simulasi. Owner perlu memastikan league/camp mana yang mendukungnya dan kapan persetujuan tambahan dibutuhkan. Kandidat copy setelah cakupan diketahui: “Save the details. Skip the repeat.” dengan penjelasan layanan yang didukung. Jangan menyatakan semua merchant mendukung fitur ini. |
| P2 | [Google Play](https://play.google.com/store/apps/details?id=com.meetingpoint) menyebut awal peluncuran Austin; homepage tidak menjelaskan cakupan kota. | Preview tidak menambahkan kota atau klaim tersedia di seluruh lokasi. Owner perlu menentukan pesan ketersediaan untuk parent di luar area, agar kata nearby tidak menciptakan ekspektasi katalog lokal yang kosong. |

## Iterasi berikut yang paling berarti untuk Sprout

1. **Uji apakah school/grade perlu menjadi manfaat pertama.** Preview membuka tab Discover. Dua versi yang patut dibandingkan adalah Discover-first melawan Community-first dengan direktori grade terlihat langsung. Parent sering sudah mempunyai titik temu di sekolah; tampilkan bagaimana mengenali keluarga lain tanpa menambah satu group chat yang membingungkan. Gunakan klik unduh dan pemahaman singkat tentang fungsi Sprout sebagai penilaian, bukan jumlah interaksi tab saja.
2. **Ganti hero konsep dengan satu momen Sprout yang nyata saat aset tersedia.** Prioritaskan parent saling mengenal sementara anak bermain, bukan potret keluarga berpose atau anak sebagai dekorasi. Pertahankan komposisi tenang dan ruang untuk app screen, tetapi buat lingkungan, ekspresi, dan aktivitas terasa milik komunitas Sprout. Izin penggunaan foto anak harus jelas sebelum aset nyata dipasang.
3. **Buat rasa aman lebih spesifik setelah fakta operasional siap.** Parent ingin tahu siapa yang dapat melihat profil keluarga dan foto anak. Setelah owner mengonfirmasi mekanismenya, jelaskan satu contoh alur visibilitas/bergabung komunitas dekat direktori. Hindari menambah shield badges atau kata-kata absolut tanpa penjelasan nyata.
4. **Perlihatkan satu hari keluarga yang saling terhubung.** Versi selanjutnya dapat menghubungkan event yang ditemukan → undangan keluarga → reminder pada Daily Brief → foto setelah kegiatan, memakai satu skenario fiktif yang ditandai sebagai contoh. Ini lebih relevan bagi Sprout daripada dashboard metrik ala produk kesehatan. Jangan mengubah contoh menjadi cerita pelanggan.
5. **Berikan batas yang jelas pada kemudahan one-tap.** Setelah dukungan merchant diketahui, demo dapat menampilkan informasi yang akan dibagikan sebelum konfirmasi, lalu status selesai. Parent perlu merasa cepat sekaligus memahami data anak mana yang dikirim. Animasi bukan pengganti kejelasan persetujuan.

Langkah review terdekat: nilai apakah cerita komunitas, Daily Brief, dan planning sudah terasa sebagai satu produk; lalu konfirmasi empat isu P1 di atas sebelum memakai copy yang sama untuk produksi.
