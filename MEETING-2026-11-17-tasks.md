# Meeting 2026-11-17 (Senin 16 Nov US): Muse scroll link, date night + sitter, events page tetap, Gmail = prioritas

Hadir: Tony, Ahmad, Syed. Mohit cuti (sakit).
Sumber: `~/Downloads/Sprout Assist Flows and Product Priorities Transcription.vtt` (00:00–17:17).
Lanjutan dari `MEETING-2026-11-14-tasks.md`.

Tony di jalan hari ini, review malam (sebelum kita mulai). **Meeting investor Tony besok (Selasa US)**, jadi B1 duluan.

## Prioritas (Ahmad)

| # | Task | Kenapa urutan ini | Selesai kalau |
|---|---|---|---|
| 1 | **B1** Link Vercel scroll Muse | **Investor Tony besok.** Kecil | Tony buka link di HP, scroll satu gambar panjang, tanpa klik/ketik |
| 2 | **B2** Kirim link flow ke Tony | Dia review malam ini; Ahmad bilang "sudah ada" | Satu pesan, satu link per flow, dikirim sebelum Tony luang |
| 3 | **B3** Flow date night: restoran → reservasi → sitter | Permintaan baru Tony; dinner step di prototype masih placeholder | Flow lengkap di Figma + prototype live |
| 4 | **B4** Jadwal setelah plan: push 30 menit sebelum + live activity | Tony jawab pertanyaan Ahmad; dipakai B3 + sitter | Layar push + live activity di akhir flow night out / sitter |
| 5 | **B5** Assist home: tile use case parent | Tony: "five to 10 options… they remember Sprout can do this" | Tile date night + night out + sitter ada di A·1, semua tersambung |
| 6 | **B6** Summer camp: diparkir | Tony riset registrasi camp dulu | Tidak dikerjakan sampai Tony balik bawa temuan |

## Yang terjadi

1. **Halaman kredensial** [00:00–00:37]: Ahmad jelaskan detail kartu/akun ada di halaman sendiri, tidak terikat sesi
   chat. Akun baru dari sesi lain (mis. daftar camp di platform baru) langsung tersimpan ke halaman detail itu.
2. **Assist home** [00:38–04:30]: Tony suka tile use case di halaman Assist. "I need help thinking what I could use AI
   for… Claude doesn't really help with that." 5–10 opsi yang dilihat tiap buka, contoh: plan a parents' night out,
   plan a date night. Analogi: kita = game kasual buat mom (Wordle), bukan gamer serius. "The simple version of AI for a
   mom."
3. **Vercel Muse** [04:30–05:47]: Tony mau link seperti demo Vercel, untuk percakapan Muse yang di-stitch. Klik link →
   tampil di HP → scroll. Tanpa klik/ketik. **Bukan Figma.** Untuk meeting besok, "show them the differences".
4. **Syed** [06:00–06:42]: kerja navigasi + tambahan kecil layar SSC. Video skenario ikon Sprout di navigasi sudah
   dikirim ke Tony untuk dicek. Build besok karena Mohit cuti.
5. **Review untuk Syed** [06:53–07:20]: Ahmad minta Tony coba flow sports (link Vercel). Kalau approved, lanjut ke
   summer camp.
6. **Events page** [07:22–09:13]: **tetap seperti sekarang** (AI). Top 10 per area tidak dilanjut: butuh foto + kenal
   area, dan Tony belum tahu apakah ada yang buka halaman itu. Mau cek pemakaian dulu.
7. **Date night + sitter** [09:00–09:30, 12:00–12:38]: yang Tony mau dikerjakan:
   - Date night: cari restoran → dapat reservasi → booking sitter untuk jam reservasi itu.
   - Sitter saja: tidak butuh restoran, cuma butuh sitter.
   Lebih gampang dari summer camp.
8. **Summer camp** [09:16–10:55]: "gonna be a little hard for us." Akan berubah saat kita belajar. Tony coba lihat
   registrasi beberapa camp. Saat dikerjakan: mirip registrasi sports, tapi menyempit dulu: dekat rumah? day camp atau
   overnight? destination camp?
9. **Liga SSC** [10:55–12:14]: pemiliknya bilang "this is really cool", tanya cara registrasi di platformnya. Tony
   arahkan ke **API key** (5 menit, beberapa klik). Belum dapat, arahnya bagus.
10. **Ahmad: night out, sitter, class family sitter sudah ada** [12:38–12:56]: Ahmad kirim link.
11. **Services tab** [13:02–13:50]: tab Events dulu dibayangkan jadi tab services (seperti Uber). Sekarang **tidak
    perlu**: services masuk ke Sprout Assist. Events tetap.
12. **Prioritas** [13:50–14:50]: Sprout Assist penting, tapi **lebih penting: Google verifikasi Gmail**. Push "you have
    five to-dos and three events to update" = engagement mingguan terbesar; yang connect email paling sering kembali.
    Assist = model bisnis. Fokus dua itu + beberapa use case yang langsung berguna.
13. **Jadwal setelah plan** [15:17–16:47]: Ahmad tanya: setelah plan night out (mis. Rabu 10 PM), nyalakan lagi fitur
    calendar lama atau masuk to-do sebagai reminder? Tony: **push notification 30 menit sebelum**, seperti dulu saat
    buat event, **dengan live activity**. Berlaku juga untuk camp dan yang terjadwal lain.

## Task Ahmad

- [x] **B1 selesai, Ahmad suka (17 Nov): https://muse-signup-scroll.vercel.app** · satu WebP 921×11738 (881 KB), lebar penuh di HP,
  scroll saja, noindex. Sumber = export Figma `16102:18` (versi yang mulai dari pesan pertama Tony; PNG lokal
  `muse-ssc-signup-stitched.png` masih versi lama tanpa pesan itu). Garis sambungan 1 px Part 1→2 dihapus. Dicek di
  viewport 375 px: tanpa scroll horizontal, sambungan bersih. Folder `scroll-site/`. Isi: email Tony + nama/DOB Cooper
  terlihat (dari screenshot asli); link publik tapi tidak diindeks.
- [x] ~~B1 Link Vercel scroll Muse (untuk investor besok).~~ (catatan asli di bawah)
  - Sumber: `08 …/References/muse-ssc-signup-2026-11-13/muse-ssc-signup-stitched.png` (sudah mulai dari pesan pertama
    Tony sejak A2 14 Nov).
  - Halaman: satu gambar lebar penuh di HP, scroll vertikal, tanpa UI lain. Gambar 3,1 MB: potong jadi beberapa tile
    WebP supaya cepat di HP (tile tidak boleh kelihatan sambungannya).
  - Deploy proyek Vercel baru (CLI, seperti link review lain), catat di `sprout-review-deploy-links`.
  - **Tanya Tony / putuskan:** "show them the differences" = Muse saja, atau Muse lalu demo Sprout di bawahnya? Default:
    Muse saja (yang dia minta), dengan link demo SSC terpisah di pesan.
  - 3 screenshot secure login (sisa A2) masih belum ada: kalau Tony kirim, masukkan di urutannya.
- [x] **B2 dikirim (Ahmad, 17 Nov):** link Assist tasks prototype ke Tony; menunggu review/feedback.
- [ ] ~~**B2 Kirim link ke Tony**~~ (satu pesan, ≥15 menit sebelum standup):
  - Sports / SSC Kids: demo SSC.
  - Assist home + semua flow: https://sprout-assist-tasks.vercel.app/assist/ (night out, ask my sitters, class-family
    sitters, camps, birthday, club).
  - Muse scroll: https://muse-signup-scroll.vercel.app
  - Bilang jujur: dinner step di night out masih placeholder, desainnya B3.
- [ ] **B3 Flow date night: restoran → reservasi → sitter.** · **17 Nov: 3 arah dibangun untuk review (lokal, belum Vercel).**
  http://localhost:4331/date-night/ (HP di Wi-Fi yang sama: http://192.168.0.101:4331/date-night/), server mati sendiri
  setelah 24 jam. A = step by step, B = satu plan card, C = Sprout menyarankan (push dulu). Kode: `task-first-assist/app/date-night.js`
  + `date-night-review.html`; rute `/date-night-a|b|c/`. Semua jalur dicek di browser (termasuk sitter menolak → meja
  tetap, cancel, "Not this week"). Menunggu Ahmad pilih; setelah itu jadi flow night out + publish Vercel.
  - **17 Nov, arah Ahmad: v2 = satu flow** (C proaktif + peta camp ala Frida): http://localhost:4331/date-night-v2/
    Lock screen push → peta dengan pin foto + jam → "Show me others" (pin dan kartu sinkron, peta meluncur) → sheet
    detail → booked → Sprout menawarkan sitter → konfirmasi. Semua jalur dicek. 15 foto restoran dibuat dengan Figma AI
    (ElevenLabs sibuk), file scratch `H5GZYtSTT9TOR8qc5ieuV7`; pin peta = foto makanan, kartu = foto ruangan.
  - Gap: `task-first-assist/README.md` → "Night out: none in Figma… dinner step is a placeholder". K13 date night
    `15445:53226` diarsip 9 Nov; cek isinya dulu sebelum bikin baru (reuse, jangan karang UI baru).
  - Urutan Tony: kapan + budget/vibe → 2–3 restoran yang ada slot → pilih → reservasi (jam pasti) → **sitter dibooking
    untuk jam reservasi** (pakai flow A8: saved sitters dulu, class families sebagai fallback) → ringkasan + jadwal (B4).
  - Non-happy path: restoran penuh di jam itu, sitter tidak ada untuk jam reservasi (geser reservasi atau tanya class
    families), batal.
  - Sitter-only tetap flow sendiri (A8, sudah ada). Pastikan dua tile berbeda di Assist home.
  - Bagian SSC (chips, approval card, sheet) sesuai aturan prototype; tiap tombol punya layar.
  - **Tanya Tony:** reservasi lewat apa (OpenTable/Resy, atau agent telepon)? Untuk desain, cukup "Sprout booked it"
    dengan nama layanan disamarkan.
- [x] **B4 dibangun (Claude, 17 Nov): http://localhost:4331/date-night-live/** (`task-first-assist/app/live-night.html`). Lock screen dengan slider waktu + tombol Play: push 6:15 "Alex arrives in 30 minutes · Dana has this too" lalu Live Activity sampai 10:30 (Alex arrives in N min → Alex is here, leave by 6:55 → on your way → enjoy dinner / bedtime 8:30 → Home by 10:15 + "Ask Alex for 30 more min" → selesai, bayar besok pagi). HP kedua: Dynamic Island compact + expanded (tap). Strip 5 momen kunci. Aturan: dua orang tua dapat; push 30 menit sebelum hal pertama (sitter, atau makan malam kalau "We're covered"); berakhir 15 menit setelah jam sitter; satu tombol satu aksi. Ringkasan di flow sekarang menulis "Reminder for you both at 6:15 PM, then the evening on your lock screens". Peta sistem: p-30 + p-live jadi built.
- [ ] ~~**B4 Jadwal: push 30 menit sebelum + live activity.**
  - Tony tidak minta calendar lama dinyalakan; dia minta perilaku event lama: event dibuat → push 30 menit sebelum →
    live activity. Cari frame live activity lama di Figma (folder `08 …/Live Activities/` juga) dan pakai ulang.
  - Diterapkan di akhir date night, sitter, dan nanti camp. Plan juga muncul di Daily Brief "Happening today".
- [ ] **B5 Tile Assist home.** Pastikan A·1 punya tile: Plan a date night, Plan a parents' night out / Find a sitter,
  plus yang sudah ada. Target 5–10. Tile tanpa flow tetap toast, jangan dihapus.
- [ ] **B6 Summer camp: parkir.** Saat dibuka lagi, tambah langkah penyempit di depan: dekat / day vs overnight /
  destination. Catatan saja, jangan dikerjakan.

## Task orang lain

- [ ] **Tony** · Review flow sports + link Ahmad malam ini; approve → baru summer camp.
- [ ] **Tony** · Review video skenario ikon navigasi dari Syed.
- [ ] **Tony** · Riset registrasi summer camp beberapa provider.
- [ ] **Tony** · Lanjut minta API key ke pemilik liga SSC.
- [ ] **Tony** · Cek pemakaian Events page (ada yang buka?).
- [ ] **Syed** · Kirim build besok (navigasi + tambahan layar SSC).
- [ ] **Mohit** · Google verifikasi Gmail = prioritas engagement #1 (Tony). Tidak dibahas detail karena Mohit cuti.

## Keputusan

- Events page tetap AI seperti sekarang; top 10 per area tidak dilanjut sampai ada data pemakaian.
- Tidak ada tab Services; semua service masuk Sprout Assist.
- Prioritas produk: (1) verifikasi Gmail Google, (2) Sprout Assist + beberapa use case langsung berguna.
- Plan terjadwal dari Assist = push 30 menit sebelum + live activity (pola event lama), bukan calendar terpisah.
- Summer camp ditunda; date night + sitter duluan.

## Feedback Tony (chat, 17 Nov 9:14–9:19 AM): Book a sitter + Plan a date night

Ahmad kirim 2 konsep (1: reservasi restoran lalu tawarkan sitter; 2: push hari kerja dengan rekomendasi date night).
Tony menjawab dengan urutan langkah yang dia mau untuk dua flow. Ini menggantikan urutan v2 (v2 mulai dari pilihan
Sprout yang sudah jadi; Tony mau tanya dulu).

### C1 · Book a sitter (urutan Tony)

1. **Tanggal + durasi dulu**, UI yang ramah ("Make this a good friendly UI").
2. **Untuk anak yang mana**: nama + foto anak, **semua terpilih default**.
3. **Tampilkan detail permintaan sitter.**
4. **Sudah ada sitter tersimpan** → tanya mau kirim ke siapa.
5. **Belum ada sitter** → dua pilihan: tambah sitter, atau lihat sitter yang sudah disimpan parent lain di kelas anak.
   Kalau ada: tampilkan **nama parent + nama sitter**, saya pilih.
6. **Tidak ada sitter dari kelas mana pun** → kirim pesan ke grup kelas untuk minta rekomendasi. Ada UI tempat parent
   lain mengisi **nama + nomor HP sitter**; disimpan di akun pribadi saya dan ditampilkan ke saya.
7. Lanjut dengan flow yang sudah ada (kirim, balasan, konfirmasi, booked).

### C2 · Plan a date night (urutan Tony)

1. **Tanggal + jam** (UI yang sama dengan C1).
2. **Jarak**: 3 mil atau kurang / 10 mil atau kurang / tidak masalah.
3. **Jenis tempat / makanan** yang mereka mau (boleh lebih dari satu).
4. **Budget**: high end / mid-range / budget.
5. **Tampilkan 3–5 tempat**: foto, **preview menu**, **link website**, **alasan singkat kenapa AI memilihnya**. Parent pilih.
6. **AI kirim jam yang tersedia**, diurutkan paling dekat dengan jam yang diminta.
7. Pilih jam → **Sprout booking atas nama parent**.
8. Lalu **mulai booking sitter** (C1, tanggal + jam sudah terisi).

- [x] **C1 + C2 dibangun untuk review (Claude, 17 Nov, lokal).** http://localhost:4331/sitter-date-night/ (4 HP sitter
  + 2 HP date night). Semua jalur dicek di browser: saved + Add a sitter, Riley saja → grup kelas, class parents → Morgan,
  tanpa sitter → grup kelas → Taylor, Priya share, date night 3 mil/Italian+Small plates/mid → Olive & Ember 7:15 → Alex.
  Default yang dipakai: push mengisi Sabtu 7 PM tapi semua pertanyaan tetap ditanya; sitter dari parent lain = nama
  saja, nomor tetap privat sampai sitter membalas; tiga keadaan keluarga = tiga HP, bukan tombol tes.
  - [ ] Tanya Tony: parent harus opt-in untuk berbagi sitter ke kelas? (desain sekarang mengasumsikan ya)
  - [ ] Publish ke Vercel setelah Ahmad setuju.
- [x] **C3 UI lebih menarik (Ahmad, 17 Nov).** Mock 2 layar × 3 arah di http://localhost:4331/ui-directions/.
  **Ahmad pilih A + foto C**, sudah diterapkan ke flow C1 + C2: kartu waktu = strip minggu + stepper − / +
  (date night: satu stepper "Dinner around"), anak = baris foto, siapa yang ditanya = kartu foto sitter yang bisa
  digeser (tag "Maya's favorite" / "Priya's sitter"), balasan + konfirmasi + ringkasan pakai foto sitter, header pakai
  ikon clay. 6 foto sitter (Figma AI, file scratch). Semua jalur dicek ulang di browser.


## Feedback Ahmad (17 Nov, review C1 + C2 setelah A + foto C) · dikerjakan satu per satu

- [x] **D1 Pilihan makanan** (Claude, 17 Nov): tile foto 2 kolom (foto hidangan tiap jenis, "Anything good" = mosaik 4 hidangan), terpilih = ring hijau + centang, tombol "Next · 2 kinds". Ring fokus biru dihapus di semua tombol (fokus keyboard tetap ring hijau). Dicek di browser, lanjut ke hasil normal.
- [x] **D1b Pilih jam terlalu banyak tap** → bar waktu yang digeser (siang ke malam): sitter = dua pegangan Dari/Sampai (3 PM–12 AM, 30 menit), date night = satu pegangan (5–10 PM, 15 menit); tap di bar = pegangan terdekat lompat ke situ; panah keyboard juga bisa. 7 PM → 10 PM = satu geser. Dicek di browser. Catatan asli: (stepper − / +, 7 PM ke 10 PM = 12 tap). Ganti UI yang lebih ramah.
- [x] **D1c Kartu restoran** → foto full-bleed 16:9.5 di atas, nama + harga, 2 baris alasan (tanpa kotak/ikon AI), Menu dan Website jadi link kecil, Choose satu tombol ringkas. Catatan asli:: foto terlalu tipis; deskripsi terlalu panjang; kotak AI (ikon sparkle) dibuang, cukup 2 baris; tombol jangan makan tempat; foto full-bleed di atas kartu (tanpa margin kiri/kanan/atas), konten lain tetap ber-padding.
- [x] **D2 Peta bisa digeser** (drag, tombol kembali ke rumah, petunjuk "Drag to look around"); tempat yang tidak cocok tampil sebagai pin kecil pudar, tap = alasannya ("not the food you picked"). Catatan asli:: parent bisa drag/geser peta untuk lihat restoran di sekitar.
- [x] **D3 Sitter setelah booking = saran**: kartu "Suggestion · A sitter for Maya and Jake" dengan jam + sitter tersimpan, chip Find a sitter / We're covered; covered = ringkasan makan malam saja. Catatan asli:, bukan langkah wajib ("Mau saya carikan sitter?" Ya / Sudah ada yang jaga).
- [x] **D4 Foto sitter tidak masuk akal** → avatar placeholder perempuan / laki-laki (SVG, warna brand) di semua kartu, balasan, konfirmasi, ringkasan; form Add a sitter punya pilihan She / He. Catatan asli:: ganti placeholder avatar (laki-laki / perempuan) yang menunjukkan gender.
- [x] **D5 Cara menghubungi + membayar sitter** · dibangun (17 Nov, Ahmad setuju): kirim dari HP parent satu per sitter (sheet Messages / WhatsApp mock, pilihan kanal per sitter), pesan berisi link balasan; halaman balasan sitter web tanpa app `/sitter-reply/` (I'm free / Can't + tarif); balasan "answered on the link" + "Someone texted you back instead? Mark it"; pagi berikutnya: How was Alex? + Pay with Venmo (terisi) / Paid in cash / Another way, dicatat. Dicek di browser. Riset: `08 …/AI Assist/task-first-assist/research/D5-sitter-messaging-and-payment.md`. Usul: pesan dari HP parent (Messages / WhatsApp, satu per sitter) + link balasan web tanpa app; bayar langsung (Venmo terisi / tunai) sekarang, Stripe Connect nanti = keputusan Tony. Menunggu Ahmad setuju. Catatan asli:: sitter tidak punya Sprout → buka WhatsApp / iMessage dengan pesan yang sudah ditulis. Pembayaran: lewat platform atau langsung? Perlu riset.
- [x] **D6 Peta sistem Assist** (Claude, 17 Nov): http://localhost:4331/assist-map/ (`task-first-assist/app/assist-map.html`). Gaya feature-map: aturan + strip gap di atas, 7 flow + 7 status plan melintang, 8 permukaan (Daily Brief, To-Do, Push + Live Activity, kalender keluarga, Dana, kelas + chat, saved details, di luar Sprout) dengan chip berstatus built / designed / gap; tap = garis koneksi + panel (apa, kapan, siapa). Plus timeline date night Kamis → Minggu. 13 gap terdaftar, termasuk B4 (push 30 menit + Live Activity), "Pay Alex" sebagai to-do, baris Happening today, layar kalender, push untuk Dana, sistem booking restoran, pencocokan email konfirmasi.
- [ ] ~~**D6 Sambungkan flow Assist ke fitur lain** (to-do, push, kalender, Daily Brief): buat peta sistem seluruh flow supaya jelas perilaku tiap fitur.

## Gap dari peta sistem (D6) · dikerjakan satu per satu

- [x] **Pay Alex sebagai to-do** (Claude, 17 Nov): http://localhost:4331/pay-todo/ (Minggu 9 AM). Baris baru di To-Do List Daily Brief: "Pay Alex $88 · Due today · From Sprout Assist" + badge clover (baris lama tetap persis dari gambar, baris baru HTML yang ukurannya ikut grid gambar). Tap baris = plan terbuka di kartu bayar. Centang = sheet "How did you pay Alex?" (Venmo / Cash / app lain) dan plan mencatatnya. Bayar dari kartu = Sprout mencentang to-do. Done (1) membuka daftar selesai ("Paid with Venmo · ticked by Sprout"). Juga jalan di flow penuh (`morningAfter`). Peta: td-pay + td-origin jadi built.
- [x] **Happening today** (Claude, 17 Nov): pagi http://localhost:4331/happening-am/ (baris 6:45 PM · Date night · chip Sprout Assist + You and Dana · Alex + meja), sore http://localhost:4331/happening-pm/ (jadi item utama sejak push 6:15: "in 30 min", baris live, track sama dengan Live Activity, Text Alex / Directions; acara pagi jadi "Earlier today"). Kartu Happening today di gambar diganti versi HTML hanya untuk bagian itu (y1061–2183). Tap = plan terbuka. Peta: db-today jadi built.
- [ ] Sisa gap: layar kalender keluarga, Dana melihat plan + push mana yang ke Dana, tampilan permintaan sitter di Chat, booking restoran, pencocokan email konfirmasi (anti duplikat), daftar packing camp.


## Feedback Ahmad (17 Nov, setelah lihat preview)

- Happening today: **jangan diutak-atik lagi**, biarkan apa adanya (bukan permintaan Ahmad).
- Kalender keluarga: hanya usulan, **tidak dibangun** kecuali Ahmad/Tony minta.
- [x] **E1 Pilih jam** (Claude, 17 Nov): pilihan cepat Morning 9 AM–12 PM / Afternoon 1–5 PM / Evening 6–10 PM + kolom Starts / Ends yang membuka roda jam (jam · menit per 15 · AM/PM), jam berapa pun bisa; selesai jam AM sebelum mulai = malam ke hari berikutnya ("1 AM next day", maks 16 jam); selesai PM sebelum mulai ditolak dengan pesan. Date night: pilihan 6:00–8:00 + kolom "Table around". Dicek: 1–5:30 PM, 11 AM ditolak, 10 PM–1 AM. Catatan asli:: bar geser 3 PM–12 AM tidak cukup (sitter bisa jam 10 AM / 1 PM). Ganti UI yang lebih sederhana untuk jam mulai dan selesai.
- [x] **E2 Kartu sitter terlalu besar** (Claude, 17 Nov): daftar ringkas satu kartu, tiap sitter satu baris (avatar 36, nama + tag, "Sat for you 4 times · $25/hr", centang bulat), ketiganya terlihat sekaligus (209 px), Select all / Clear all, perkiraan biaya "About $72–$84 for 3 hours", Add a sitter di bawah daftar. Catatan asli:: tanpa foto, jangan pakai struktur kartu besar. Daftar ringkas, mudah dibaca, ketiga sitter terlihat sekaligus, pilih satu atau semua.
- [ ] **E3 Kirim ke semua sekaligus**: sekarang satu per satu, Ahmad tidak suka. Diskusi dulu: plus minus + kemampuan teknis.
- [x] **E4 Quick options** (17 Nov): label "Quick options", chip cukup jamnya (9 AM–12 PM / 1–5 PM / 6–10 PM), tanpa kata Morning/Afternoon/Evening.
- [x] **E5 Tag sitter dibuang** (17 Nov): "Maya's favorite", "Great with Jake", "Lives 5 min away" dihapus karena Sprout tidak punya datanya. Yang tersisa hanya fakta: berapa kali sudah jaga, tarif, dan "Priya's sitter" (memang dibagikan parent itu).
- [x] **E6 Avatar sitter clay 3D** (17 Nov): perempuan + laki-laki, gaya ikon clay (Figma AI, file scratch `H5GZYtSTT9TOR8qc5ieuV7`), `assets/sitters/woman.webp` / `man.webp`, dipakai di semua tempat.
- Pesan per kanal (iMessage / WhatsApp per sitter): Ahmad bilang sudah cukup, tidak diubah.
- [x] **E7 Sitter membalas lewat SMS / WhatsApp, Sprout tidak bisa baca** (17 Nov, arah Ahmad): link balasan dibuang dari pesan, halaman `/sitter-reply/` diparkir (tidak di review page). Setelah kirim, kartu "Who can make it?" (When they text you back): tiap sitter Free / Can't, tombol "Continue with Alex and Sam", atau "No one has replied yet" → Sprout tanya lagi sejam kemudian ("Did Alex, Sam or Riley text you back?"). Kalau sebagian belum balas: Wait for … / Ask a class group. Lebih dari satu bebas → "Book Sam · about $112". Book → sheet pesan dari HP parent berisi alamat (hanya ke sitter terpilih) → opsi "Tell Alex" ucapan terima kasih. Semua jalur dicek di browser.

- [x] **E8 Kirim per sitter + kirim semua** (17 Nov): tiap baris sitter punya tombol Send (ikon Messages / WhatsApp) → sheet pesan → baris jadi "Sent". Tombol besar "Send to all 3" (atau "Send to the other 2") membuka sheet satu per satu tanpa berhenti ("1 of 2", "2 of 2"); Apple tetap butuh satu tap Send per sitter. "Skip, I'll text them myself" kecil di bawah. Pratinjau pesan jadi lipatan "See the message". Dicek di browser.
- [x] **E9 Sebelum publish** (17 Nov): kotak kosong di kartu "Pay Riley" = avatar yang gambarnya tidak di-cover (yang terlihat pojok kiri atas gambar, krem polos); sekarang semua avatar sitter bulat + cover di mana pun. Gelembung chat Sprout sekarang mengikuti panjang teks (fit-content), bukan selebar layar.

## Feedback Ahmad (17 Nov): sambungkan semua sebelum publish Vercel

- [x] **F1 Satu aplikasi**: Book a sitter + Plan a date night tersambung di prototype utama. Book a sitter **mulai dari kosong** (belum ada sitter): Add a sitter / Ask a class group. Setelah itu sitter tersimpan dan bisa dipilih lagi. Date night ikut tersambung.
- [x] **F2 Budget**: ganti $$ / $$$ jadi kisaran dolar nyata untuk makan malam di Austin, dan bisa isi sendiri.
- [x] **F3 Menu / Website**: ikon dan teks tidak sejajar; buat ringkas dan mudah ditap.
- [x] **F4 Bisa diedit**: semua info yang sudah terisi (detail permintaan, anak, alamat, pesan, tarif) harus bisa diubah, supaya terasa seperti flow nyata.
  - Dicek di browser 17 Nov: Book a sitter dari nol (Add a sitter / Ask a class group), sitter tersimpan bisa dipilih lagi dan jumlah "Sat for you N times" naik tiap malam; budget "Set my own" ($250) → hasil Olive & Ember ~$110, Kumo ~$320, Juniper ~$75; ikon Menu/Website sejajar; detail permintaan, jam, catatan, pesan, dan tarif bisa diedit. Belum dipublish ke Vercel.
- [x] **G1 Kartu restoran** (17 Nov): ikon Menu/Website ketabrak style foto `.dncar .ph` dari peta (48px kotak krem) sehingga Choose terdorong keluar kartu; diperbaiki. Menu/Website jadi tombol sekunder abu-abu ringkas (34px), Choose selalu muat. Nama dan deskripsi diberi jarak, harga "~$75" 17px hijau. Budget "Set my own" sekarang benar-benar batas atas ($100 → Juniper, Rosie's, Casa Verde).
- [x] **G2 Edit tanpa chat baru** (17 Nov): pensil di kartu permintaan sitter membuka sheet (waktu, anak, alamat, catatan), kartu terupdate di tempat dengan highlight, tidak ada bubble chat tambahan. Tombol "Looks right" tunggal. Dicek: 3 edit = 0 baris chat baru.
- [x] **G3 Riwayat di tombol history** (17 Nov): "Your plans" dihapus dari home Assist. Tombol history (kanan atas, sebelum avatar) punya badge jumlah plan aktif (penuh hijau kalau ada yang butuh kamu). Isinya: Plans (Active dulu, lalu selesai) | garis pemisah | Chats (obrolan biasa tanpa plan, 3 contoh).
- [x] **G4 Add a sitter setelah class group** (17 Nov): tombol "Add a sitter" sekarang ada di setiap daftar "Who should I ask?", termasuk setelah parent membagikan sitter. Sheet (nama, nomor, tarif, She/He, Messages/WhatsApp) lalu sitter baru langsung masuk ke daftar yang sama dan tercentang, tanpa chat tambahan. Dicek: Riley (He, WhatsApp) masuk di bawah Taylor dan Jordan, lalu kartu kirim menampilkan Riley lewat WhatsApp.
- [x] **G5 Tidak menunggu class group selamanya** (17 Nov): kartu "Waiting for parents" sekarang punya tombol X kecil (batalkan permintaan ke kelas) dan "Add a sitter while you wait". Tambah sitter saat menunggu: permintaan kelas tetap jalan; kalau parent membalas, Taylor dan Jordan masuk ke daftar yang sedang terbuka (belum dicentang) dan kartu tunggu berubah jadi "Priya and Aisha shared a sitter". Kalau sudah memilih sitter, permintaan kelas otomatis ditutup. X: "Class request cancelled", lalu tawarkan Add a sitter / Not now, dan balasan parent tidak pernah masuk. Ketiga jalur dicek di browser.
- [x] **G6 Tombol kartu restoran sejajar** (17 Nov): Choose kena margin atas dari .btn; sekarang Menu, Website, Choose sama tinggi 36px dan satu garis tengah.
- [x] **G7 Tombol Save di sheet edit tidak tertutup home bar** (17 Nov): sheet edit waktu / anak diberi ruang bawah, Save 40px di atas tepi sheet.
- [x] **H1 Accounts and cards, arah A (detail sheet)** (17 Nov, Ahmad pilih A): tiap baris bisa ditap (chevron) dan membuka sheet di atas layar. Kartu: tampilan kartu (brand, 4 digit, exp), Default / Added by / Last used / Paying for; aksi Set as default, Rename / Add a nickname, Billing address (kartu Link: Manage in Link), Remove. Remove dijaga: kalau kartu sedang membayar sesuatu, "I'll move that to Mastercard" lalu "Move it and remove"; default pindah otomatis; kartu Link = "Remove from Sprout", tetap ada di Link. Kartu Dana: Tony hanya bisa Set as default (usulan: yang menambah kartu yang boleh ubah/hapus, perlu dikonfirmasi Tony). Akun provider (contoh: Austin Parks & Rec untuk Jake): Login / Password (di password manager) / Used for / Last used; aksi Change password on austintexas.gov (buka situs provider, password manager simpan yang baru, karena Apple tidak punya deep link resmi ke satu password), Use a different login (sheet password manager yang sudah ada), Remove from Sprout (akun di provider tetap ada). Nomor kartu tidak bisa diedit (Stripe): tambah kartu baru lalu hapus yang lama. Semua jalur dicek di browser, 0 error.
- [x] **H2 Edit card + konten bawah tidak tertutup home bar** (17 Nov): kartu (bukan Link) sekarang punya "Edit card": nomor kartu terkunci (tidak bisa diubah, tambah kartu baru), Name on card, Expires, Billing address, ZIP; simpan langsung mengubah tampilan kartu. Kartu Link tetap "Manage in Link". Ruang bawah dibetulkan sekali di app.css untuk semua route: sheet/layar tanpa footer dapat 28px + ruang home bar, footer dapat 16px + ruang home bar. Diukur di bingkai HP (home bar 24px) untuk 25 permukaan (Accounts and cards, kartu, akun, hapus, nickname, edit card, add a card, history, time wheel, edit waktu/anak/alamat/catatan, add a sitter, compose, edit pesan, budget sendiri, menu restoran): semua konten terbawah 25 sampai 52px di atas home bar.
- [x] **H3 Tombol tergencet + Edit card di semua kartu** (17 Nov): tombol di footer bertumpuk (Continue with saved login, Move it and remove, Remove from Sprout, Keep it) tergencet karena .btn{flex:1} di footer kolom; diperbaiki di app.css untuk semua sheet bertumpuk, sekarang 44px + tombol teks 34px. Edit card sekarang ada di setiap kartu dan menggantikan Add a nickname: kartu sendiri = nickname, nama, expiry, billing, ZIP (nomor terkunci); kartu Link = nickname di Sprout, expiry/billing terkunci + tombol "Update expiry or billing in Link"; kartu Dana = nickname saja, detail terkunci "Only Dana can change these". Dicek di bingkai HP.
- [x] **Publish** (17 Nov): build terbaru (F1–F4, G1–G7, H1–H3) di https://sprout-assist-tasks.vercel.app (deployment dpl_BKhdQH1WVFFEqWVNifEAhDQywALp). Semua route 200; app.js live identik byte-per-byte dengan build lokal.
- [x] **H4 Field terkunci di Edit card** (17 Nov): ikon gembok jatuh ke bawah teks karena .field.in{display:block}; sekarang gembok di kanan, sejajar tengah. Live di sprout-assist-tasks.vercel.app.
- [x] **H5 Tambah / hubungkan akun provider (camp, liga olahraga)** (17 Nov, Ahmad pilih C): tombol "Add an account" di bawah Provider accounts membuka picker: kolom cari (nama, situs, atau jenis seperti "camp"), "In your email" dengan logo Gmail (LeagueApps dari email Fall soccer U8 untuk Jake, Sawyer dari struk Clay studio camp untuk Maya; tombol x = bukan punya saya), "Sites parents use" (LeagueApps, Sawyer, TeamSnap, CampMinder, i9 Sports), "Somewhere else" (website lain, atau ketik domain langsung). Alur: sheet password manager -> "Checking your login on ..." -> "Signed in" -> "Who is X for?" (anak dari email sudah tercentang) -> Save account. CampMinder menunjukkan jalur gagal sekali: situs minta kode, Sprout tidak bisa baca kode, Try again / Sign in on campminder.com, belum ada yang tersimpan. "Linking" = Sprout simpan referensi login, password tetap di password manager, Sprout masuk di situs mereka saat mendaftarkan anak; platform ini tidak punya tombol connect untuk orang tua. Semua jalur dicek di bingkai HP, live di sprout-assist-tasks.vercel.app.
- [x] **I1 Prototype dinamis: yang dipesan menggerakkan app** (17 Nov, Ahmad: "Build both"): Book a sitter / Plan a date night di /assist/ sekarang mencatat plan (sitter, tarif, anak, hari, jam, restoran, jam makan). Demo clock di panel review samping HP (diberi label: bukan bagian app, hanya pengganti waktu berjalan) melangkah lewat: Booked (push ke Dana) -> pagi hari H 7:30 (push Morning Brief + baris Happening today, tanggal Daily Brief ikut) -> 30 menit sebelum (push + Live Activity di lock screen) -> malamnya (Live Activity update) -> besok 9:00 ("How was Casey last night?" + to-do "Pay Casey $X"). Badge History mengikuti: aktif -> Needs you saat harus bayar -> hilang setelah bayar. Semua push tercatat di panel dengan penerimanya (Tony, Dana, keduanya). Dicek: sitter saja (Casey Fri 6-10 PM, $96) dan date night + sitter (Juniper 6:45, Casey 6:15-10 PM, $90) dari awal sampai lunas, 0 error. assist-map: db-today, db-morning (designed -> built), p-booked, p-30, p-live, p-after, td-pay diberi catatan Live; s-push tetap gap (HP Dana belum digambar).
- [x] **I2 Flowchart seluruh Sprout** (17 Nov): https://sprout-assist-tasks.vercel.app/sprout-map/ (3 level: app map = entry points, onboarding, tab, sekitar tab, web; feature flows = 18 fitur, Prod + Exploration + prototipe HTML, handoff antar fitur; shared surfaces). Dibuat dari data, bukan digambar tangan: tools/build-sprout-map.py membaca structure-registry (15 row, 31 section, 265 layar, cocok dengan label CSV), Exploration dibaca dari Figma 17 Nov (7 row, 41 item), 36 prototipe HTML + 11 route, 7 permukaan web. Status Design / Handoff / Release dari data, tidak ada approval yang ditebak. 16 Open questions ditandai di halaman. Konflik data (label-map vs CSV, "CURRENT SOURCE" belum didefinisikan di DESIGN-LABELS, URL class chat beda antara README dan spec/24) tercatat di bagian Data notes. Salinan FigJam: https://www.figma.com/board/KkC7lsk6VRMbvo0zOLBRbx (Tony Martin's team), dibuat ulang dengan tools/mmd-to-figjam.py. Aturan status Prod "In review" = ada pilihan bertanggal dari Ahmad; perlu dikonfirmasi Ahmad.
