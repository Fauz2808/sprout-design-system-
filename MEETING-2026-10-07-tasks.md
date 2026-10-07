# Meeting 2026-10-07: website v2 (parents, bukan AI dulu), share Sprout, prioritas app

Hadir: Tony, Mohit, Syed, Ahmad. Rabu 7 Okt.
Sumber (3 file di `~/Downloads/`):
- `Daily Brief, Spouse Connections, and App Priorities Transcription.vtt` (standup, 04:18–44:03)
- `Sprout Homepage and Product Story Transcription.vtt` (Tony + Ahmad, 7 menit)
- `Sprout Website and Sharing Experience Transcription.vtt` (Tony + Ahmad, 24 menit)

Lanjutan dari `MEETING-2026-10-06-tasks.md`. Item terbuka di sana ikut di bagian Z.

## Prioritas (Tony)

1. **App: Daily Brief, reminder suara, spouse connection.** "The next big unlock for us is to get those 65 parents on
   Sprout using the chat and everything." Mohit: reminder flow target Kamis, spouse connect Kamis (paling lambat Jumat).
2. **Mobile web join: satu tweak lagi** (layar "You're in" + keyboard OTP), lalu undangan dikirim.
3. **Portal room parent: tidak diminta apa-apa minggu ini.** "I'm not gonna ask anything of you on the room parent stuff."
4. **Ahmad: website v2 (struktur dulu) + cara share Sprout.**

**Aturan keras 2 Okt** (portal + coordinator dulu) sekarang bertabrakan langsung dengan arahan Tony hari ini. Kemarin
sudah ditandai, belum diputuskan. Usul: anggap dicabut untuk minggu ini, update memory
`feedback-finish-portal-before-anything-else`. **Ahmad yang putuskan.**

## Yang terjadi

### Standup (Daily Brief, Spouse Connections, and App Priorities)

1. **Birthday di Daily Brief masih 7 Okt, harusnya 8 Okt.** Fix-nya sudah ada tapi lupa di-merge Mohit; masuk build
   besok. Mohit juga debug pakai user ID Tony. [04:40–05:15, 21:17–21:34]
2. **Update Mohit:** CMS compose dapat formatting + attachment, No School khusus sekolah, reminder dengan link opsional
   dan deadline, Venmo paling atas di donasi. 3–4 dari ~7 API Daily Brief baru selesai. Dasar voice-to-text reminder
   jadi. [05:31–06:34]
3. **Tes share link subgroup (Miss Cruzona).** Join jalan, Mohit langsung masuk list. Tapi halaman web mobile bilang
   "Request sent. Tony approves who joins." Tony: **"I would just let them join."** Desain desktop (punya kita) sudah
   benar: "You're in", download Sprout. Tony: "Let's just do that... I don't need to read a bunch of stuff." Mohit
   update dua halaman. Halaman lama yang dia lihat ternyata cache. [08:00–17:00, 19:18–29:30]
4. **OTP di mobile web: ikon biru terpotong** saat mulai mengetik dengan keyboard terbuka. Mohit fix. Tony: "I just want
   it to be clean and easy." [18:40–19:07]
5. **SMS OTP sekarang menyebut joinsprout.co**, bukan dev.meetingpoint. [19:19–20:04]
6. **Spouse yang diundang saat onboarding tersambung** di backend; setelah tersambung semua Daily Brief, to-do, event
   dibagi berdua. "It'll have two images there." [20:04–20:55]
7. **Master calendar turun ke subgroup.** No School di Kiker Elementary Master tampil di app dan di semua subgroup.
   Tony akan pindahkan kalender grade-level ke satu master dan hapus duplikat. [41:46–43:03]
8. **Tony tidak tahu anak-anaknya libur Jumat + Senin sampai lihat Sprout.** Bukti nyata pertama Daily Brief/kalender
   membantu. [22:04–23:04] Layak jadi cerita di website atau video.
9. **Open rate email room parent: diparkir.** Mohit tanya apakah bisa. Kesimpulan: bisa lewat pixel per penerima + kirim
   satu email per penerima (bukan BCC) + deteksi balasan lewat Gmail API; Gmail sendiri tidak menyediakannya. Tony suka
   sebagai alasan kirim lewat Room Parent, **tapi "not a big priority right now."** [23:32–31:45]
10. **Feedback website (assist.html) di standup:** Tony suka si Sprout kecil (mascot), tapi halaman terlalu berat di Sprout
    Assist. Yang harus seimbang: **Daily Brief, class group chat, member directory, lalu Sprout Assist.** Kompetitor
    (Muse, Instinct, Dot, Grok Bot, Orbits) cuma chat, jadi mereka jual use case chat. Sprout = assistant + platform
    sosial. Assist "will be in beta for a while", jadi **jangan dijadikan pembuka**; section AI di dekat bawah. Mascot =
    "the AI guy", jadi tidak di header dulu. [31:52–40:37]

### Homepage dan cerita produk

11. **Header baru, sederhana.** Tidak pakai interaksi rotating word; Tony kesulitan membacanya, terlalu cepat. Logo / app
    masuk, lalu "boom" langsung ke Daily Brief. [00:04–00:38, 39:18–40:14 standup, Website 03:30–04:02]
12. **Copy harus soal parents, bukan family/home.** "My identity is being a parent." Opsi dari Tony: "Finally, a super app
    for parents", "Parents, your family life simplified", "Parenting made easy", "all in one place". [Website 02:27–04:19]
13. **CTA = download app, bukan waitlist.** "We're not gonna do a wait list for Sprout... they can download it right now.
    They're just not gonna be able to use the Sprout Assist till later." [03:31–04:22]
14. **Urutan halaman (Tony):**
    1. Header sederhana + CTA download.
    2. **Daily Brief, interaktif lewat scroll:** teks pendukung tetap, layar Daily Brief bergulir naik saat scroll, lalu
       pindah section. "One place that has all your updates, to-dos, reminders that you and your spouse share."
    3. **Class group chats:** semua kelas anak di satu tempat (Presley, Jake, Mia dengan efek bounce yang sama seperti di
       video), lalu tiap kelas punya group chat, kalender, email guru, link penting.
    4. **Member directory:** tiga tempat/komunitas di atas, nama-nama "boop boop", scroll, klik satu parent, profil,
       **kirim pesan tanpa membagi info pribadi.**
    5. **Sprout Assist sebagai carousel** (6 use case yang sekarang jadi satu carousel), dengan video seperti Muse.
    6. **Penutup:** "Where parents bond, childhoods flourish" + headline yang mendukung. "Ready when your family is"
       dibuang.
    [04:22–07:36, Website 00:04–02:26]
15. **Ide dari Muse/kompetitor yang Tony suka:** UI "semua tempat parent harus melihat" (berserakan) jadi satu tempat; dan
    halaman About / "story" dengan cerita Sprout: jadi orang tua, pindah lingkungan, sekolah baru, notifikasi dari mana-
    mana, sambil kerja 9–5. "We gotta nail this part first." [01:00–03:46]
16. **Cara kerja: struktur dulu, animasi belakangan.** Supaya ganti copy tidak berarti produksi ulang. "Let's just make
    sure that we get the structure right first... then we can work on the copy... before production level." Boleh pecah
    jadi beberapa langkah. [Website 09:08–11:43]

### Share Sprout

17. **Tony coba Orbits** (rekaman 8 menit menyusul dari Tony). Yang dia suka: share code rumah lewat sheet share native.
    **Sprout butuh "Share Sprout"** yang membuka sheet share native iOS supaya teman dekat bisa langsung dikirimi.
    "In our daily brief, it's probably important to have a share Sprout thing in it." Ahmad: native share pop-up, mudah.
    [Website 19:16–23:27]
18. **Positioning vs Orbits:** Orbits teknis, perlu banyak setup. Sprout punya data dari hari pertama (master calendar,
    directory), efek jaringan; cukup sambungkan spouse lalu mulai reminder. [22:25–23:27] Bahan untuk copy website.

---

## Q · Website v2 (Ahmad, minggu ini)

Folder: `01 - Website/sprout-reach-scene-iteration/`. Review link: https://sprout-reach-scene-iteration.vercel.app
(Vercel CLI, redeploy manual).

- [x] **Q1 Struktur v2 tanpa animasi produksi.** Halaman baru `home-v2.html` (index.html dan assist.html tetap). Urutan
  persis poin 14. Pakai layar app sungguhan dari Figma, satu interaksi saja yang memang inti struktur: Daily Brief
  bergulir saat scroll. Chat bounce, tap profil, video Assist = Q4 setelah struktur disetujui.
  - Selesai kalau: Tony bisa scroll dari atas sampai bawah dan bilang setuju/tidak dengan urutan dan copy-nya.
  - **Dikerjakan 7 Okt:** `home-v2.html` + `home-v2.css` + `home-v2.js`. Urutan: header → "too many places" →
    Daily Brief (pinned, brief bergulir ikut scroll, daftar isi di kiri menyala) → Class group chats (5 step: semua
    kelas dengan chip Presley/Jake/Mia yang bounce, lalu chat, kalender, updates, links) → Member directory (4 step:
    komunitas, list, profil, pesan privat) → Sprout Assist carousel (5 kartu dari assist.html, mascot hanya di sini,
    "Coming soon") → penutup + Share Sprout. Semua layar = kode, bukan PNG: Daily Brief dari Figma `13266:241031`,
    kelas dari `sections-demo.js`, Chat/Clubs dari `assist-demo.css`, phone Assist dari `home-v2-gp.css`
    (di-generate `review/sync-v2-gp.sh`). Tanggal demo digeser ke minggu 7 Okt, host Figma "Patrick Collison" diganti
    cast fiktif. Dicek di 1440 dan 390: tanpa horizontal scroll, tanpa error console, `node --test` 28/28.
    **Belum dideploy** ke link review.
- [x] **Q2 Header copy, 3–5 opsi tentang parents.** Tampil di halaman yang sama (switcher kecil berlabel "Review: header
  options", bukan UI sungguhan) supaya Tony pilih di tempat.
  - **Dikerjakan 7 Okt:** 5 opsi, pill "Review only" kiri bawah, `?h=3` membuka opsi 3: Parenting, all in one place. /
    Finally, a super app for parents. / Parents, your family life simplified. / Parenting, made easy. / The app for
    parents. (opsi 5 = nama App Store + kaos).
  - **Diganti Tony (pesan, 7 Okt):** header "Your village, handled.", sub "Sprout connects you with the parents at your
    school and handles the logistics in between.", tombol **"Join your schools"** menggantikan Download ("reinforces that
    the community already exists and you're just stepping into it"). Dipasang di hero, top bar, dan penutup; di HP tombol
    langsung ke App Store / Play Store, di komputer turun ke tombol store di penutup. Switcher 5 opsi dibuang.
  - **Tony (7 Okt, lanjutan): hero lama kembali.** Video langit + mascot hidup + portal (lingkaran mascot membesar jadi
    scene berikutnya, objek 3D terbang) dibawa dari `assist.html`, dengan copy dan tombol Tony. Judul portal: "All the
    logistics in between" (dihapus lagi oleh Ahmad 7 Okt: section berikutnya sekarang naik menutupi akhir portal; badge
    store di hero juga dihapus, Join di komputer langsung lompat ke penutup). Section lain tidak berubah.
  - **Notes + landing (Ahmad, 7 Okt):** section "Family life lives in too many places" dibuang; isinya jadi 10 note
    (ikon 3D + teks: School emails, Class group texts, ...) yang terbang keluar dari portal. Sesudahnya Daily Brief
    mendarat di tengah di bawah "Sprout puts them in one place.", lalu pindah ke kanan sambil copy masuk, baru
    scrollytelling brief jalan. Review headless baru: `node review/home-v2-shots.mjs` (gagal kalau landing tidak di
    tengah / tidak settle, overflow, atau error console). Kode hero dipindah ke `hero-portal.css` / `hero-portal.js` dan
    dipakai bersama oleh `assist.html` + `home-v2.html` (dicek: assist.html tetap jalan).
- [x] **Q3 Headline penutup** yang mendukung "Where parents bond, childhoods flourish", CTA App Store + Google Play.
- [ ] **Q4 Ronde produksi (setelah Tony setuju Q1–Q3):** bounce nama anak di section chat, directory tap-to-profile +
  Message, video/carousel Assist ala Muse, mascot hanya di section Assist.
- [ ] **Q5 Halaman About / "Our story"** (eksplorasi, setelah Q4): jadi orang tua, pindah, sekolah baru, notifikasi dari
  mana-mana. Cerita Tony libur 4 hari bisa jadi bukti.

## R · Share Sprout (app)

- [x] **R1 Konsep "Share Sprout" di Daily Brief: 2–3 arah, belum desain final.** Tap = sheet share native iOS dengan
  pesan + link joinsprout.co yang sudah terisi. Arah yang dibandingkan: (A) kartu di bawah Daily Brief, (B) baris di
  menu profil + banner sekali di Daily Brief, (C) muncul sesudah momen bagus (spouse tersambung, kelas pertama join).
  Pertanyaan untuk Tony: link mengajak ke kelas yang sama (join kelas) atau cuma download app?
  - Tunggu rekaman Orbits dari Tony sebelum final.
  - **Konsep 7 Okt:** `08 - Generated Screens/Home/share-sprout-concepts.html`. A kartu di akhir brief (rekomendasi),
    B baris di menu profil, C sekali sesudah spouse tersambung (pasangan A), + sheet share native yang dibuka ketiganya.
    3 pertanyaan untuk Tony di bawah halaman.
  - **Dipilih Ahmad 7 Okt: A + C** (B tidak dipakai). Tinggal jawaban Tony soal link (download saja atau langsung ke kelas
    pengirim) sebelum dibawa ke Figma Dev Ready untuk Syed.

## S · Punya Tony / Mohit / Syed (track)

**Mohit**
- Halaman join subgroup (web, desktop + mobile): langsung "You're in" + download Sprout, tanpa approval.
- OTP mobile web: ikon terpotong saat mengetik.
- Merge fix birthday 8 Okt (build besok).
- 7 API Daily Brief, reminder suara (target Kamis), spouse connect penuh (kirim, join, resend, ganti nomor; Kamis/Jumat).
- Open rate email: tidak sekarang.

**Syed**
- Daily Brief baru di app. "All going fine."

**Tony**
- Kirim rekaman Orbits ke Ahmad.
- Pindahkan kalender grade-level ke master, hapus duplikat.
- Uji spouse connect dengan Lydia setelah build Kamis.

## Z · Terbawa dari 6 Okt

- ~~K1 Spouse pending: kartu yang jelas bisa di-tap~~: selesai (Ahmad, 6 Okt).
- ~~K2 Sprout Assist "coming soon"~~: selesai (Ahmad).
- M1–M6 Sprout Assist versi agent: setelah Q; landing `assist.html` tetap jadi bahan section Assist/carousel.
- ~~H1, H3, H4, F1, F4, F6, F7, C8, G9 dari 5 Okt~~: semua clear (dikonfirmasi Ahmad 7 Okt).

## Catatan

- Open rate kalau suatu saat dibangun: agregat dan berorientasi aksi ("6 belum lihat, kirim ulang"), bukan daftar siapa
  yang tidak buka. Sejalan dengan memory `tony-neutral-reporting-no-totals`.
- Next action: deploy `home-v2.html` + konsep R1 ke link review (tunggu oke Ahmad), kirim ke Tony.
