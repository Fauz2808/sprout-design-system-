# Meeting 2026-11-19 (Rabu 18 Nov US): review sitter / date night / birthday / playdate, Assist home 8 tile, LeagueApps API + agent

Hadir: Tony, Mohit, Ahmad.
Sumber: `MEETING-2026-11-19-transcript.vtt` (salinan dari `~/Downloads/Sprout Product Review and Integration Planning Transcription.vtt`).
Lanjutan dari `MEETING-2026-11-18-tasks.md`. Prototype: `08 - Generated Screens/AI Assist/task-first-assist/`.

## Prioritas (Ahmad)

| # | Task | Kenapa urutan ini | Selesai kalau |
|---|---|---|---|
| 1 | **L1** Assist home: 8 tile + sesi berjalan | Tony 2x minta ("send it to me as soon as you can"), penutup meeting | `/assist/` default = grid baru, 2 grup × 4, sesi berjalan di atas |
| 2 | **L2** Satu link umum untuk review | Tony tidak bisa navigasi link per-langkah | Satu halaman, tiap flow mulai dari awal, urut |
| 3 | **L3** Book a sitter: tweak | Tony review langsung | Pilih sitter = langsung kirim; event di Daily Brief; Live Activity timer + Text / Pay; rating + bayar malam itu |
| 4 | **L4** Share sitter: lebih dari satu + detail | Tony: "it's only letting me share one sitter" | Pilih beberapa, tambah catatan, tersimpan ke sitter Priya |
| 5 | **L5** Playdate: satu anak, sapa parent, masuk DM | Tony review | Satu anak, baris parent ("Leo's mom"), opsi antar-jemput, tombol buka DM |
| 6 | **L6** Birthday: jam selesai, urutan, kategori tempat, cover | Tony review | Start + end, kelas dipilih saat kirim undangan, 3 kategori tempat, default dekat rumah, 9 cover + AI |
| 7 | **L7** Date night: jam selesai | "Why is it only starts at?" | Konfirmasi + kalender punya jam mulai dan selesai |
| 8 | **L8** Profil sitter: isi otomatis | Tony review | Nama + nomor dari thread; tanya foto, nama belakang, ZIP, radius, Stripe |
| 9 | **L9** Hero website: beberapa arah | "The one we currently have feels very AI" | Halaman review 4 arah hero (desktop + HP) |
| – | **L10** Onboarding: Gmail jadi langkah pertama | Tunggu verifikasi Google | Diparkir sampai verified |

## Yang terjadi

1. **Link review membingungkan** [03:22–06:35]: Tony klik link di laporan, semuanya terlihat sama, tidak tahu harus ke
   mana. "What's the point of all these links?" Playdate link tidak menampilkan Playdate. Ahmad: ganti jadi link umum,
   kirim langsung di DM dan update laporan.
2. **Share sitter** [03:58–04:36]: hanya bisa share satu sitter. Harus bisa share beberapa, tambah detail, dan
   tersimpan di akun sitter (daftar sitter si parent).
3. **Book a sitter** [06:35–17:00]:
   - Hari sudah terpilih: bagus.
   - Setelah pilih siapa yang ditanya (Casey, Taylor, Jordan), **langsung ke pesan**. Tidak perlu langkah "send to
     all three" lagi. [07:20]
   - Waiting for replies, Who should you book, "You pay Casey directly", You're booked: bagus.
   - **Booking masuk Daily Brief sebagai event** "Casey's babysitting" + lokasi + jam (Happening Today). [09:46–10:12]
   - Push "Casey is sitting tonight" ke **spouse** saja, bukan ke yang booking. Tony setuju. [10:43–11:05]
   - **Live Activity = timer selama jam sitter (9–12)**: sisa waktu sebelum harus pulang + tombol Text Casey. Bukan
     tracking lokasi sitter ("Casey's not gonna have location services on"). "Arrives in 30 minutes" boleh sebagai
     perkiraan. [11:50–13:30]
   - **Bayar + rating malam itu juga**, bukan pagi berikutnya ("They're gonna wanna get paid right after"). Minta
     rating + catatan (berguna untuk parent berikutnya). [13:30–14:31]
   - **Bayar lewat Sprout (Stripe)**. Di akhir Live Activity: tombol Pay Casey + Text Casey. [15:25–17:00]
4. **Date night** [17:00–18:46]: UI bagus. Konfirmasi hanya punya "starts at": **harus ada jam selesai**.
5. **Birthday** [18:28–30:34]:
   - **Start + end time wajib** ("parents don't want people to hang out for hours, they wanna time box it").
   - Pilih kelas (Miss Poole's class) **jangan di tengah**: selesaikan event dulu, kelas dipilih saat Send invites.
   - Where's the party: Our place, A park, Help me book a place: masuk akal.
   - Help me book a place: **3 kategori**: Birthday-friendly venues, Parks & playgrounds, Restaurants. (Hands-on fun,
     outdoors, food and fun dilebur.)
   - **Hapus "Where should I look?"**: default dekat rumah, peta dengan rumah, yang terdekat dulu, geser = makin jauh.
     Ahmad: boleh ketik nama area (mis. Austin, TX). Tony setuju. Use my location tidak perlu (booking jauh hari).
   - Booking venue sungguhan (reservasi area 20 orang) belum: sekarang cukup bantu cari + buat kartu event.
   - **Cover: 6 atau 9 pilihan**, satu opsi "Generate with AI". Ganti "Make 3 more". Kalau cuma 3, 70% pilih yang sama.
   - Copy link: copy + preview kartu, konfirmasi tersalin. Oke.
6. **Playdate** [30:34–36:36]:
   - **Satu anak saja**, tidak perlu banyak kelas.
   - Tempat: Our place, park, lunch oke. Tambah opsi **kami bisa jemput / antar**.
   - Baris teman: kita jarang punya foto anak. Tampilkan **foto + nama parent**, di bawahnya **"Leo's mom"**.
   - Setelah undangan terkirim: bisa **langsung masuk DM** dengan parent itu. Reply membuka keyboard: oke.
   - Tony: "Fucking awesome."
7. **Assist home** [36:36–44:32]: tidak mau "Create an event" sebagai pintu masuk. Grid ilustrasi (K1, 18 Nov) = arah
   yang benar ("this is how the UI should look"). Label pendek. **8 tile:**
   - Grup 1 (urutan Tony): **Playdate, Book a sitter, Date night, Birthday**.
   - Grup 2 **Register my kids**: **Sports, After school, Camps, Tutoring**.
   - Buang dulu: Reminder, Plan event, This week, Start club.
   - **Sesi berjalan** (mis. Book a sitter menunggu balasan) muncul **di atas 8 tile**, tap = kembali ke chat itu.
8. **Profil sitter** [44:42–48:29]: nama (dan nomor) sudah kita punya dari thread, isi otomatis. Field nomor tidak
   perlu. Yang perlu dikumpulkan: **foto, nama belakang, ZIP code rumah, radius menyetir**, Stripe. "Way to contact me"
   boleh. Pertanyaan terbuka: sitter kembali ke profil bagaimana, tanpa login?
9. **Website** [48:33–49:00]: hero sekarang "feels very AI". Coba banyak arah. Sisanya bagus.
10. **LeagueApps** [49:35–1:04:09] (Mohit): API public = data liga/program (yang tampil di situs SSC). Private key
    membuka semua data member + transaksi, partner tidak akan kasih. Rencana: **public API key dari Mark + agent
    isi form registrasi di browser**. Mohit demo LeagueApps besok 12:30 IST, tanya apakah private key bisa dibatasi.
11. **Pembayaran + password agent** [1:04:09–1:12:00]: Muse menyimpan pembayaran, agent memakai saat user konfirmasi.
    Perlu: Stripe (agent payment), **1Password for agents** (developer, Sprout yang integrasi, user tidak daftar).
    Akun provider butuh password dari user (pertama kali).
12. **Arsitektur agent** [1:12:00–1:18:00]: Sprout agent = orchestrator; LLM bebas (Grok, GPT, Gemini, Claude). Tony
    coba Grokbot. User tidak perlu lihat browser agent; proses di background, notifikasi saat selesai.
13. **Google verification** [1:20:46–1:25:53]: belum. 2 user baru sambung email. **Setelah verified: onboarding mulai
    dari Connect Gmail**, baru nomor HP + kode. Engagement email-connected jauh lebih tinggi; friction di depan oke.
    Mohit tambah analytics push pagi (berapa to-do + event terkirim).

## Task Ahmad

- [x] **L1** Assist home: 8 tile (2 grup), label pendek, sesi berjalan di atas, jadi default `/assist/`
  Grid 2×2 (Playdate, Book a sitter, Date night, Birthday) + 4 kecil Register my kids. "Pick up where you left off" di atas tile; contoh di `/assist-ongoing/`. Playdate pakai ilustrasi treehouse, Birthday balon.
- [x] **L2** Satu link umum untuk Tony (halaman review: tiap flow mulai dari awal) + update laporan
  `/review/`: 9 HP, tiap flow mulai dari awal, satu baris apa yang berubah. Link di samping HP juga diganti, semuanya mulai dari awal. Laporan: kirim `/review/` saja.
- [x] **L3** Book a sitter: langsung kirim setelah pilih; event "Casey's babysitting" di Daily Brief; push hanya ke
  spouse; Live Activity timer selama jam sitter + Text + Pay; rating + catatan + Pay via Sprout malam itu
  Setelah "Ask …" Sprout langsung kirim di tiap thread (tanpa sheet Send). Push booking ke Dana saja (sudah begitu). Live Activity: "should be there in" → "3h left with Alex" + Text → 30 menit terakhir → "Alex is done" + Pay + Text. Bintang + catatan, lalu Approve via Stripe; cash tetap bisa. `/pay-todo/` buka di lock screen itu.
- [x] **L4** Share sitter (sisi Priya): pilih beberapa sitter, tambah catatan, sitter baru tersimpan ke daftarnya
  `/sitter-class-chat/` dan `/sitter-v3-share/`: Taylor + Jamie + Add someone else, catatan per sitter.
- [x] **L5** Playdate: satu anak; opsi jemput/antar; baris parent + "Leo's mom"; tombol buka DM setelah kirim
  Setelah konfirmasi: "Message Priya" buka DM (keyboard langsung aktif). Default waktu Sab 2–4 PM.
- [x] **L6** Birthday: start + end; kelas saat Send invites; 3 kategori tempat; hapus "Where should I look" (default
  dekat rumah + cari area); 9 cover + Generate with AI
  Urutan: anak → From/Until → tempat → cover → undangan → Send invites → kelas / classmates / link. 9 tile = 8 cover + "Make one with AI" (6 cover baru Figma AI, file scratch `H5GZYtSTT9TOR8qc5ieuV7` 6:2–6:7). Restoran Austin = Casa Verde + Rosie's (tempat fiktif dari date night).
- [x] **L7** Date night: jam selesai di konfirmasi + kalender
  Kartu waktu: Table around + Home by (default +3,5 jam). Sitter sampai Home by; kartu "We're covered" tampilkan jam pulang.
- [x] **L8** Profil sitter: nama + nomor terisi dari thread; foto, nama belakang, ZIP, radius, Stripe
  Nomor tampil (Change untuk edit), foto wajib, ZIP 5 digit. Usulan re-entry tanpa login ditulis di halaman done (belum diputuskan).
- [x] **L9** Hero joinsprout.co: 4 arah di halaman review (desktop + HP)
  `01 - Website/sprout-reach-scene-iteration/hero-directions-2026-11-19/index.html`: A Front page, B The people, C Class page (yearbook), D The plate. Catatan: D memakai ilustrasi Assist (belum rilis), A masih header "Sprout AI". Belum di-deploy.
- [x] Publish ke Vercel setelah Ahmad review (Ahmad OK L1–L8, 19 Nov). Live: https://sprout-assist-tasks.vercel.app/review/ (9 HP dicek di produksi, 0 error)
- [x] After school + Tutoring: tile Register my kids sekarang membuka flow sungguhan (`/after-school/`, `/tutoring/`), ditambahkan ke `/review/`. Program dan tutor = contoh fiktif.
- [ ] Kirim link `/review/` ke Tony (Ahmad)
- [ ] L9 website hero: diparkir sampai Ahmad selesai review Assist
- [ ] Update ke Tony ≥15 menit sebelum standup

## Task orang lain

- **Mohit:** demo LeagueApps besok (tanya private key bisa dibatasi?). Prototype agent isi form registrasi di browser.
  Riset Stripe agent payments + 1Password for agents. Analytics push pagi. Follow up verifikasi Google.
- **Tony:** minta public API key ke Mark (SSC Kids). Coba Grokbot untuk registrasi.

## Keputusan

- Assist home = grid ilustrasi, 8 tile dalam 2 grup. Reminder / Plan event / This week / Start club keluar dulu.
- Sitter: bayar + rating malam itu (bukan pagi), lewat Sprout (Stripe). Live Activity = timer jam sitter, tanpa lokasi.
- Birthday: start + end wajib; tempat default dekat rumah; 3 kategori; 9 cover.
- Playdate: satu anak per undangan; parent di baris teman, anak sebagai keterangan.
- LeagueApps: public API key + agent di browser untuk registrasi. Private key tidak diminta kecuali bisa dibatasi.
- Setelah Google verified: Connect Gmail = langkah pertama onboarding.

## Pertanyaan terbuka

- Sitter kembali ke profilnya tanpa login: usul = Sprout kirim link baru di thread kalau sitter balas "profile" (tanpa password). (Tony: "we'll have to think about that")
- Birthday: bantu reservasi venue sungguhan (mis. area pesta trampoline park) atau cukup cari tempat? (sekarang: cari saja)
- Potongan Sprout dari pembayaran sitter (dari 18 Nov, masih terbuka).
