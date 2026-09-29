# Meeting 2026-09-29 — Standup singkat (15 menit, Tony harus ke meeting 08:45)

Hadir: Tony, Mohit, Syed, Ahmad.
Sumber: `~/Downloads/Todaay.vtt`.
Lanjutan dari `MEETING-2026-09-23-tasks.md`. Tony: *"we can go deeper tomorrow."*

## Yang terjadi

1. **App live** (Mohit deploy Sabtu 27 Sep). Tony akan minta orang update app. [01:01]
2. **Portal room parent (Mohit):** section "all time / set time" di Events sudah jadi, deploy
   dalam 10 menit. Email template donasi sudah didesain, fitur kirimnya sedang dikerjakan.
   SMTP sempat mati sejak pindah domain ke joinsprout, sekarang sudah dibetulkan. Berikutnya
   **sign up flow** (tab Links → Create a sign up), lalu balik ke **reminder flow** di mobile. [01:10–03:44]
3. **Link panjang → "copy link".** Tony mau URL panjang di Events diganti tombol copy link.
   Mohit: sudah kepikiran, lupa. [03:51]
4. **Web group chat.** Tony membuka halaman yang kamu kirim dan bilang arahnya bagus, tapi
   bagian preview harus diganti. *"Maybe recent messages isn't the thing"*, karena grup baru
   pasti belum ada chat, jadi kosong. Gantinya: **mock chat yang kaya**, foto orang tua dengan
   label seperti "Cooper's mom", plus kalender dan links, bergerak pelan seperti GIF, lalu
   tombol Join the chat. Kamu mengusulkan HTML interaktif seperti hero website, Tony setuju. [05:59–08:37]
   Status: *"future stuff, so no rush"* [16:16]. Yang harus benar sekarang adalah request-to-join
   di joinsprout (punya Mohit).
5. **Kritik video referensi** (segmen Class Group Chat): [08:37–11:34]
   - Isinya kebanyakan laki-laki, fotonya lama. Harus ada **foto guru**, bukan monogram "MT".
   - Label harus "teacher **emails** in one feed".
   - **Terlalu cepat.** Tony nggak sempat membaca card-nya keras-keras sebelum ganti.
   - Fokus di bagian chat saja: *"I don't wanna overwhelm them."*
   - Butuh versi kecil yang muat di mobile.
6. **Mobile duluan.** Tony menebak 60/30 mobile. *"We wanna get the mobile piece correct,
   not so much this desktop"*, karena orang yang join dari halaman ini lanjut ke app. [11:37–12:29]
7. **Field nama di join chat: dibuang.** Tony: *"Just get rid of it. We don't need it. Why are
   we even asking for a name?"* Onboarding di app yang akan mengambilnya. Flow-nya harus sama
   dengan request-to-join di joinsprout: nomor HP → kode → masuk → Download Sprout.
   *"We don't need to change the flow."* [13:01–14:49]
8. **Sudah login, halaman nggak bilang apa-apa.** Mohit: request-to-join nggak jalan kalau
   user sudah login, dan halaman tidak menunjukkan status login. Tony: minimal ada teks
   "you're already logged in". Saat dites, input OTP juga tidak menampilkan angka. [14:55–18:45]
9. **Coordinator portal.** Tony sudah lihat `coordinator.html`: *"looks really good as a first
   baseline."* Dia mau main-main dulu, kasih feedback, lalu tunjukkan ke para room parent
   coordinator sebagai v1. [20:20–21:29]
10. **Rollout.** Lydia join lewat roomparent.com hari ini. Tony mulai menambahkan room parent
    minggu ini dan mengirim sign-up Sprout ke kelasnya: 34 + 28 orang tua (sekitar 60 user baru,
    total sekitar 85). [18:45–20:20]

---

## P0 · Punya kita (Ahmad)

- [x] **A1 Buang field nama dari join web group chat.** Ini membalik aturan 28 Sep ("nomor baru
  ditanya nama depannya sekali"). Kalau spec tidak diubah, handoff kita bertentangan dengan
  instruksi Tony langsung ke Mohit, dan Mohit membaca spec.
  - `01 - Website/room-parent-portal-redesign/chat.html`: hapus state `newmember` (prompt nama).
  - `spec/24-web-group-chat.md`: baris 34 (field "What's your name?"), 35 ("You're in, Tony."
    untuk nomor baru nggak punya nama, jadi copy-nya tanpa nama), rule 2 (baris 49–50),
    rule 6 (baris 60–61), baris 66, 81, 83–85 (kasus QA name prompt), 103.
  - Flow akhirnya: nomor → kode → joined → Download Sprout, sama dengan joinsprout.
  - Rilis `./tools/release.sh`, kirim link release ke Mohit.
  - Update decision log 28 Sep di `CLAUDE.md` supaya nggak ada yang mengembalikan field nama.

## P1 · Punya kita, Tony bilang nggak buru-buru

- [ ] **A2 Ganti preview "recent messages" di join page dengan preview chat yang hidup.**
  C1 dari 23 Sep sekarang **tidak on hold lagi**: Tony sudah mengonfirmasi arahnya.
  - Sumber gerak: segmen chat di `SPROUT VIDEO/Video 5 - Launch/episodes/seg4.js`, dibangun
    ulang sebagai HTML interaktif (pola hero `01 - Website/sprout-reach-scene-iteration/`),
    bukan MP4.
  - Fokus chat. Kalender dan links boleh muncul sebentar sesudahnya, jangan tiga-tiganya berebut.
  - Data mock: orang tua campuran (jangan mayoritas laki-laki), foto baru, **foto guru**
    menggantikan monogram "MT", label "Cooper's mom". Semua fiktif, jangan pakai roster asli.
  - Mobile-first. Versi desktop menyusul.
  - Update `spec/24` bagian Preview (baris 31, "recent messages as shapes") sekaligus.
  - **Status 29 Sep:** arah A (chat-only, dipilih Ahmad) sudah dibangun di `chat.html`, commit
    lokal `Web group chat: preview plays an example class chat`, **belum dirilis**. Kurang:
    7 potret AI (prompt di `assets/chat/people/PROMPTS.md`; Weave belum di-link ke akun Figma),
    lalu review Tony, baru rilis + item di issue #2.
  - **Update 29 Sep siang:** 7 potret masuk (ChatGPT via Codex), dipasang, avatar kelas jadi foto
    guru. Link review untuk Tony: https://roomparent-chat-review.vercel.app (semua state:
    `/review/chat-flow.html`). Commit portal `d81fa27` + `38190b8` masih lokal sampai Tony oke.

- [ ] **A3 Video Class Group Chat: isi chat dan foto.** *Koreksi:* pacing-nya sudah beres
  pagi ini di sesi lain. `card()` di `core.js:127` menahan tiap card 0,34 s/kata + 0,8 s dan
  menggeser sisanya otomatis, "Teacher emails" sudah benar, dan hasilnya sudah dirender
  (`out/sprout-launch.mp4` dan `out/sprout-launch-no-families.mp4`, 29 Sep). Klaim awal soal
  "card cuma 1,75–2 detik" salah, karena angka di `seg4.js` di-override oleh `card()`.
  **Yang tersisa:**
  - Copy placeholder dari Figma di `screens.js:301-312`: "Yoow What is up", "thanks for letting
    me in into Meeting Point Event, can't wait to golfing", "welcome to the club buddy".
  - Catatan kalender "By: Mohit Rai" / "By: James Martin" (`screens.js:90, 325-326`, nama tim asli)
    dan "Robert: my golf score" di chat list (`screens.js:220, 272`).
  - Foto lama, dan avatar grup masih "MT".
  Rencana: cast dan naskah disamakan dengan chat contoh di join page (Mrs. Taylor, Lydia, Priya,
  Marcus, Jen, Aisha), pakai potret yang sama, lalu render sekali.
  **Dikerjakan 29 Sep siang:** cast + naskah join page, foto guru menggantikan MT (chat list,
  header, pengirim email), catatan kalender dan email guru diganti, chat scroll supaya balasan
  guru terlihat (layar chat 3,9 → 8,6 s). Detail di README film. Render ulang kedua cut.

- [x] **A4 State "sudah login / sudah member" di join page.** Tony minta ke Mohit, tapi copy
  dan state-nya lebih rapi kalau ada di spec kita. Contoh: "You're already in Miss Taylor's
  class" + Open Sprout, dan kalau nomornya lain, "Not you? Sign out". Tambah sebagai state
  di `chat.html` dan `spec/24`, masuk rilis yang sama dengan A1.

## P2 · Menunggu / cek kecil

- [ ] **A5 Coordinator portal:** tunggu feedback Tony. Jangan lanjut sebelum ada.
- [x] **A6 Cek link box di portal prototipe.** Tidak perlu diubah. Di tab Links, Consent Form
  dan Class Group Chat (yang Tony sebut "both of these") sudah tampil sebagai "Shareable link"
  plus ikon copy, bukan URL panjang (`index.html:1596-1609`). URL panjang hanya ada di build
  Mohit, dan dia sudah bilang akan membetulkannya.

---

## Punya Mohit (track, bukan kita)

- Deploy section all time / set time di Events (portal).
- Email donasi ke orang tua pakai template. SMTP joinsprout sudah dibetulkan.
- Sign up flow (tab Links → Create a sign up), lalu deploy semuanya.
- Link panjang → Copy link.
- Request-to-join di joinsprout: tombol nggak bisa diklik saat sudah login, tidak ada status
  login, input OTP tidak menampilkan angka. Tambah teks "you're already logged in".
- Buang field nama dari join chat (instruksi Tony langsung).
- Sesudah itu: reminder flow di mobile.
- Tony: *"the big thing is obviously getting the calendar working and the links working."*

## Tony sendiri

- Meeting dengan guru dan co-room parent (08:45).
- Minta orang update app.
- Lydia join lewat roomparent.com hari ini.
- Mulai menambahkan room parent minggu ini, kirim sign-up Sprout ke 34 + 28 orang tua.
- Main-main dengan coordinator portal, kirim feedback, atur meeting dengan para coordinator.
