# Meeting 2026-09-30 — Kalender, portal room parent, reminder keluarga, kaos

Hadir: Tony, Mohit, Ahmad.
Sumber: `~/Downloads/321.vtt` (52 menit).
Lanjutan dari `MEETING-2026-09-29-tasks.md`.

## Yang terjadi

1. **Ellen Price (room parent baru) sudah masuk portal**, tapi tidak lihat donasi dan tidak punya
   foto. Penyebabnya: dia mulai di Kiker Elementary dan tidak tahu harus ganti ke kelas Miss
   Cruzona lewat dropdown. Mohit: *"we need to put some kind of message here"* supaya orang tahu
   bisa ganti kelas. Foto profil di portal ternyata tidak wajib, Mohit akan mewajibkannya di build
   besok. [01:16–03:20, 26:40–27:35]
2. **Tab room parent di Master menampilkan semua parent**, bukan room parent. Tony mau tab itu
   menunjukkan room parent mana yang sudah ada di platform. Kalau daftar semua parent tetap ada,
   namanya "All parents" atau "Directory". Ellen juga belum muncul di daftar room parent. Laura
   Mims ternyata bikin subgroup lewat app (bukan portal), Tony akan menghubunginya. [04:28–11:56]
3. **Event all day tampil "9AM" di Daily Brief.** Tony: *"No date. No time... Or you put all
   day. I don't care. But no time."* Mohit akan tambah kondisinya di app. [12:37–15:03]
4. **Aturan kalender vs event (keputusan Tony):** [15:05–24:26]
   - **Parent Invitation** (butuh RSVP) = event. Masuk invitation, My Events, chat, dan kalender.
   - **No RSVP** dan **Students only** = hanya kalender. Tidak ada undangan, tidak masuk My Events.
     Tap = lihat detail saja. *"They need to be aware that this is happening, and the only way for
     them to be aware is through the calendar."*
   - Kalender kelas di app harus menampilkan event dari portal juga, bukan cuma note.
   - Dua sumber utama isi kalender: room parent update kalender kelasnya, dan **master calendar**
     (misalnya No School). Reminder dari parent sendiri *"probably not gonna happen too often."*
   - Item kalender didorong ke upcoming events di chat dan Daily Brief.
5. **No School di master calendar, dikerjakan Ahmad.** *"We just need to have a no school option
   and then set the date... I should just be able to type in the title and then set a date."*
   Tidak ada parent invitation, tidak ada RSVP. [20:41–21:24, 22:47]
6. **Steven sekarang tampil "on the app".** Nomor dari consent form tidak punya kode negara,
   Mohit set +1 sebagai default. [24:35–26:09]
7. **Parents: klik untuk buka profil.** *"This photo is just so small... just be able to click
   into it... see a pop up of their information."* Tony: *"not as important as all the calendar
   stuff."* [26:12]
8. **Copy link: URL string dibuang.** *"This URL string, this is an engineering thing."* Ganti
   dengan copy link yang lebih jelas, sama seperti yang sudah ada. URL lengkap cukup muncul kalau
   buka "View all". Donations juga butuh copy link. [27:57–30:30]
9. **Email donasi terkirim dari "Tony at Cloud Poker Night"** (SendGrid lama). Tony mau email
   keluar dari email room parent (Gmail yang di-connect): *"That's the strongest authority."*
   Mohit mau memindah tombol Connect Gmail ke satu tempat, bukan di tiap halaman. [31:10–33:17]
10. **Tony minta update dikirim hari itu juga.** Dia bangun lebih pagi untuk feedback loop yang
    lebih cepat: *"If you have an update, just send it."* Update Ahmad yang terakhir belum sempat
    dia lihat. [33:36–34:12]
11. **Reminder = "the big one".** [34:21–41:17]
    - Voice diinterpretasi, bukan ditranskrip. "Remind my husband to pick up Presley at 2PM today"
      jadi judul "Pick up Presley from school", jam 2 PM, penerima suami.
    - Layar voice langsung mendengarkan saat dibuka. Centang muncul setelah user mulai bicara.
      Ahmad konfirmasi "Yes".
    - Mohit minta **desain error**: user bilang sesuatu yang tidak bisa jadi reminder.
    - **UI processing: tunggu.** Mohit implement Whisper dulu, lalu dites bareng untuk tahu
      durasinya (Mohit menebak 1–4 detik). *"We can make it awkward in the beginning."*
      Baru setelah itu desain loading yang pas. Jangan bikin yang heboh untuk 2 detik.
    - Reminder masih statis, belum ada push notification.
12. **Notifikasi pindah ke Daily Brief, ikon kalender dibuang.** Bell ada di tab Events karena
    dulu itu Home. *"Take notifications, remove the calendar, and just add it there... this
    calendar thing, fuck it. Doesn't matter."* Ahmad: ini sudah dia angkat beberapa minggu lalu. [42:35–43:54]
13. **Reminder keluarga dan Daily Brief bersama.** [43:54–49:01]
    - Gabung reminder pasangan dan reminder sendiri jadi satu list ("Family reminders"), foto di
      tiap item. Kalau untuk berdua, dua foto. Bisa lihat yang sudah dicentang.
    - Tambah reminder cepat **dengan mengetik** dari list, tanpa voice: tulis "pick up Presley",
      set tanggal dan jam, kirim ke pasangan. *"Maybe that would take precedence over nudge."*
    - Dua pasangan ada di kelas yang sama, jadi Daily Brief mereka *"should be one and the same."*
      Kalau satu menjawab undangan dari room parent, pasangannya tidak perlu menjawab lagi.
      Undangan pribadi tetap per orang. *"We don't have that fully fleshed out."*
    - Ahmad menunjukkan pola assignee di Notion. Tony: *"We just need an elegant UI for that."*
    - Tony mau sesi kerja bareng **besok pagi** untuk spouse reminder.
14. **Kaos.** Tony mau satu final, bukan konsep lagi, supaya bisa langsung diproduksi. Copy "The App
    for Parents", Sprout, semua stacked di punggung. Warna kaos **hitam**, bukan hijau tua. Putihnya
    harus benar-benar menonjol. Depan kaos punya sekolah, jadi tidak perlu logo di dada. Sekolah
    mungkin sudah punya sesuatu di punggung, jadi bisa ada revisi. [49:01–52:12]

---

## P0 · Punya kita (Ahmad)

- [x] **B1 No School di Master Calendar (portal).** Tambah jenis event keempat di form event,
  sebelah Parent Invitation / No RSVP / Students only (`index.html:1538`). Pilih No School →
  sisa form hilang: cuma **judul + tanggal**, tanpa jam, tanpa undangan, tanpa RSVP, tanpa tanggal
  kirim. Hanya muncul di konteks Master (`MASTER_NAV`, `index.html:3179`).
  - Tampil di list sebagai 🚫 No School, sama dengan kartu No School lama di Daily Brief
    (`08 …/Home/daily-brief-collapse-and-bell.html`) dan pilihan No School di
    `08 …/Admin/add-note-redesign.html:139`. Tony: *"Same thing that we had before, just in this
    type of UI."*
  - Pertanyaan untuk Tony, jangan ditebak: libur beberapa hari (Thanksgiving, winter break) satu
    item dengan tanggal akhir, atau satu per hari? Tony cuma bilang "set a date".
  - **Dikerjakan 30 Sep:** di Master Calendar, form New Event dibuka dengan pilihan "What are you
    adding?" Event / No School. No School = Title + First day + Last day (optional), sisanya hilang.
    Preview menampilkan baris 🚫 seperti di Sprout ("5 days" untuk libur panjang). Di list: 🚫 +
    judul, "No school for every class · tanggal", chip merah No school, tanpa tombol kirim dan copy
    link. Seed: Fall Holiday (Mon Oct 12), Thanksgiving Break (Nov 23–27). Libur beberapa hari
    dibangun sebagai satu item + Last day opsional, pertanyaannya dicatat di Open questions spec/30.
- [x] **B2 Tulis aturan kalender vs event ke spec**, karena Mohit membangun dari spec dan hari ini
  build-nya memasukkan semuanya ke Events:
  | Jenis | Invitation | My Events | Chat | Kalender kelas | Daily Brief |
  |---|---|---|---|---|---|
  | Parent Invitation | ya | ya | ya | ya | Your invitations, lalu Upcoming |
  | No RSVP | tidak | tidak | tidak | ya | Upcoming / Happening today, info saja |
  | Students only | tidak | tidak | tidak | ya | sama |
  | No School (B1) | tidak | tidak | tidak | ya, semua kelas | sama |
  All day = tanpa jam (tulis "All day" atau kosong), **tidak pernah 9 AM**.
  Tap item kalender-saja = detail, bukan chat.
  - Portal: `spec/30-status-and-decisions.md` (bagian keputusan) + band "Events: what goes where"
    di `08 …/Home/daily-brief-reminder-loop.html` (tambahkan Students only dan No School).
  - Rilis B1 + B2 bersama: `./tools/release.sh`, kirim link ke Mohit.
  - **Dikerjakan 30 Sep:** spec/30 "Decided 30 Sep" (tabel routing, kontrak No School, aturan copy
    link). Form event sekarang menulis di bawah radio ke mana event itu masuk di Sprout
    (`#evModeWhere`). Band Events di `daily-brief-reminder-loop.html` ikut diupdate + baris No School
    di Upcoming. **Belum dirilis, belum di-commit** (tunggu oke Ahmad).
- [x] **B3 Copy link tanpa URL string.** Tony melihat build Mohit. Overview Links di prototipe kita
  sudah punya tombol copy link besar sejak `3bec5e5` (v2026-09-29.6, semalam), termasuk Donations
  (`index.html:1626`). Yang masih menampilkan URL mentah di list:
  - Fundraising, baris donation master: `donationMasterUrl` (`index.html:1664`).
  - Links umum: `.meta` berisi `l.url` (`index.html:4709`).
  - Share row sign-up dan consent (`index.html:2265`, `:2325`) = halaman detail, URL boleh tetap
    di sini sesuai kata Tony ("if they hit view all").
  Pola: list/overview = judul + tombol "Copy link" (gaya `3bec5e5`), halaman detail = URL + Open.
  Masuk rilis yang sama dengan B1.
  - **Dikerjakan 30 Sep:** satu kontrol copy link di semua tempat (pill LinkSimple dari `3bec5e5`):
    baris kalender (ganti ikon share 28 px; di desktop sempit jadi ikon saja supaya judul tidak
    kejepit), baris sign-up + detail sign-up, baris links, baris donasi. Baris links dan picker
    compose menampilkan nama situs, bukan URL. Ikut dibetulkan: di HP tombol baris links meluber
    keluar kartu (trash terpotong), sekarang wrap.
  - Dicek: 1440 px dan 375 px, tanpa horizontal scroll, tanpa error console. e2e sign-up links 8/8.
    e2e donation methods 9/13, **4 gagal yang sama juga gagal di v2026-09-29.6** (Zelle), bukan
    dari perubahan ini. Sudah dibuat task terpisah.

## P0 · Reminder (Tony: "the big one we need to nail")

  **Dikerjakan 30 Sep (B4–B7 sekaligus):** `08 - Generated Screens/Home/daily-brief-family-reminders.html`,
  dibangun oleh `build-family-reminders.py` dari style reminder loop (ikon dari paket Phosphor, foto =
  cast join page sebagai placeholder: Tony = marcus, Dana = jen, Lydia). Header sudah pakai bell (B8).
  - B4: satu list "Family reminders", foto per item, dua foto untuk berdua dan untuk reminder dari room
    parent, versi HP Tony dan HP Dana berdampingan, tabel aturan foto.
  - B5: + Add → sheet dengan keyboard, default Me / hari ini / any time, lalu For (foto), When (chip),
    Time, tombol "Send to Dana". Toast "Sent to Dana". Nudge sengaja tidak digambar (Tony: add lebih penting).
  - B6: satu layar error (Try again / Type it instead) + aturan: yang kurang (when / time / who) bukan
    error, masuk Review dengan field amber terisi default. Layar processing sengaja tidak didesain.
  - B7: tiga arah (A langsung hilang, **B settled sehari, rekomendasi**, C masing-masing jawab) + tabel
    undangan mana yang dibagi + 5 pertanyaan untuk sesi besok.

- [x] **B4 Family reminders: satu list, wajah di setiap item.** Dasarnya sudah ada: step 5 di
  `daily-brief-reminder-loop.html` (S1, 23 Sep) dan arah A di `daily-brief-reminder-lifecycle.html`
  (29 Sep). Yang baru hari ini:
  - Nama section "Family reminders" (atau serupa), reminder saya dan pasangan tercampur.
  - Reminder untuk berdua = **dua foto** bertumpuk, seperti assignee di Notion.
  - Reminder yang sudah dicentang terlihat, lengkap dengan siapa yang mencentang (sudah ada di
    lifecycle).
- [x] **B5 Tambah reminder dengan mengetik.** Tombol "+ Add" di list → form singkat: judul, tanggal,
  jam, untuk siapa (Me / Spouse / Both) → Send. Tanpa voice. Tony: mungkin lebih penting dari
  tombol nudge. Tempatkan di prototipe yang sama supaya Tony melihatnya sebagai satu flow.
- [x] **B6 Error state voice.** Permintaan Mohit: user bicara tapi tidak ada reminder yang bisa
  dibuat. Satu layar: pesan singkat ("We couldn't turn that into a reminder"), contoh kalimat yang
  benar, lalu **Try again** (kembali ke listening) dan **Type it instead** (ke form B5).
  **Jangan** desain UI processing dulu. Tony: tunggu Mohit selesai Whisper dan kita tahu durasinya.
- [x] **B7 Siapkan konsep Daily Brief bersama untuk sesi besok pagi.** Tony belum punya jawabannya,
  jadi bawa 2–3 arah, jangan satu desain jadi:
  - Undangan dari room parent = milik keluarga. Satu pasangan jawab → kartu hilang di sisi
    pasangannya, diganti "Lydia said yes for the family".
  - Undangan pribadi (misalnya Jake ke pickleball) tetap per orang.
  - Reminder = B4.
  Pertanyaan yang perlu dijawab Tony: kalau satu bilang Yes dan satu bilang No, siapa yang menang?

## P1 · Punya kita

- [x] **B8 Bell notifikasi menggantikan ikon kalender di header Daily Brief.** Desain bell sudah ada
  (`daily-brief-collapse-and-bell.html`, panel 3, 21 Sep) tapi di sana bell **ditambahkan** di
  sebelah kalender. Sekarang cuma satu ikon: bell, kalender dibuang. Update tabel ikon di
  `daily-brief-reminder-loop.html` (baris "Header, top right: Phosphor CalendarDots" → Phosphor
  `Bell`), lalu kirim ke Mohit. Pertanyaan kecil: bell di header tab Events ikut dibuang?
  - **Dikerjakan 30 Sep:** bell (Phosphor Bell + titik merah unread) menggantikan ikon kalender di
    `daily-brief-reminder-loop.html` (3 layar), `daily-brief-homepage.html`, lifecycle (dibangun ulang),
    dan family reminders. Baris tabel ikon diupdate dengan kutipan Tony. Belum dikirim ke Mohit (app, bukan portal).
- [x] **B9 Parents: klik baris → popup profil.** Foto besar, nama, anak, telepon, email, status
  on the app. Pakai ulang modal room parent `rpInfoModalOverlay` (`index.html:2481`). Tony sendiri
  bilang ini di bawah urusan kalender.
  - **Dikerjakan 30 Sep:** wajah di list 24 → 36 px, nama + wajah = satu tombol → popup **Parent** (foto
    88 px, anak + kelas, On the app / Email only, Room Parent, telepon + Text/Call, email + Email, Edit).
    Field baru `photo` di setiap parent (null di seed, sengaja tanpa wajah stand-in; foto Lydia yang ada
    ternyata versi lama yang mirip guru). Spec/30 diupdate.
  - Ikut dibetulkan: `tools/handoff.mjs` menghitung semua modal sebagai bagian `consent`, jadi popup baru
    ini tercatat "consent — button ADDED: Edit". Sekarang tiap modal punya entri sendiri (`modal-*`) +
    jembatan satu kali supaya rilis berikutnya tidak melaporkan 21 perubahan palsu.
- [x] **B10 Jawab pertanyaan terbuka di `spec/18-new-room-parent-onboarding.md:152-158`.** Tony
  menjawabnya hari ini: foto **wajib**, mengikuti onboarding app. Interests tidak wajib (*"I guess
  they don't have to add interest"*). Tapi spec baris 40 bilang interests wajib ("none picked"),
  jadi ubah juga, dan tambah cek foto di `saveProfileStep()`.
  - **Dikerjakan 30 Sep:** tanpa foto Continue ditolak ("*Add a photo to continue"); interests opsional,
    tombol "Skip for now" sampai ada yang dipilih; foto onboarding tersimpan ke `photo` parent baru.
    spec/18 tabel + bagian "Settled 30 Sep". Dites di browser: profile → interests → kids.

## P2 · Kecil / menunggu

- [x] **B11 Kaos final.** Sudah dibuat pagi ini, 08:15: `09 - Logo/T-Shirt Back Production R2/`.
  Kaos hitam, stacked (ikon, Sprout, The App for Parents, joinsprout.co), putih opak. File untuk
  pabrik ada di `FACTORY-README.md`, preview untuk Tony `Sprout_Back_R2_Tony_preview.pdf`, semuanya
  di `Sprout_Tshirt_Back_R2_Tony_and_Factory.zip`. **Tinggal:** kirim ke Tony kalau belum, dan
  tunggu jawaban sekolah soal cetakan di punggung.
- [ ] **B12 Ganti kelas di portal.** Ellen tidak tahu ada dropdown. Usulan untuk dibawa ke Tony:
  room parent yang punya kelas langsung mendarat di kelasnya, bukan di Kiker Master, dan switcher
  kelas tampil sebagai nama kelas + caret di header. Lebih baik daripada pesan tambahan ala Mohit.
- [ ] **B13 Connect Gmail di satu tempat.** Prototipe kita belum punya state ini sama sekali. Mohit
  akan memindahnya sendiri. Tawarkan: satu baris "Sending from lydia@gmail.com · Change" di
  My Profile, dan kalau belum connect, tombol Send meminta connect dulu. Tanya Mohit mau atau tidak
  sebelum dikerjakan.

---

## Proses

- **Kirim update hari itu juga, jangan tunggu call.** Tony: kalau tidak, feedback baru datang
  besok pagi. Akhir hari = link + 2–3 kalimat apa yang berubah.
- Besok pagi: sesi kerja real-time dengan Tony (spouse reminder, B7) beberapa jam.

---

## Punya Mohit (track, bukan kita)

- Foto profil wajib di onboarding portal (build besok).
- Daftar room parent di Master belum update (Ellen belum ada). Tab itu harus room parent saja,
  sesuai prototipe (`index.html:1923`, Room Parents & Activity). Daftar semua parent diberi nama
  "All parents" / "Directory" kalau tetap ada.
- Data dashboard ada yang dummy, perlu dicek dari API.
- Daily Brief: event all day tanpa jam (bukan 9AM).
- Routing event vs kalender (B2), kalender kelas di app menampilkan event dari portal.
- Copy link, termasuk Donations.
- Email keluar dari Gmail room parent, bukan SendGrid Cloud Poker Night. Connect Gmail di satu tempat.
- Reminder: implement Whisper, ukur durasi, lalu tes bareng Tony dan Ahmad. Push notification belum ada.
- **Sudah:** tab Parents, Steven tampil on the app (+1 default), hapus room parent to-do, email
  donasi sudah terkirim.

## Tony sendiri

- Kasih tahu Ellen soal dropdown kelas dan minta dia upload foto.
- Hubungi Laura Mims (bikin subgroup di app) soal roomparent.com.
- Tambah donation methods dan sign-up links hari ini.
- Tes bikin event lewat Sprout Assist pakai HP istrinya, cek push notification.
- Tanya sekolah soal cetakan di punggung kaos.
