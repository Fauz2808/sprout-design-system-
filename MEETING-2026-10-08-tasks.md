# Meeting 2026-10-08: website ke Syed, Daily Brief, push notification

Hadir: Tony, Mohit, Syed, Ahmad. Kamis 8 Okt.
Sumber:
- `~/Downloads/Daily Brief, Website, and Notifications Transcription.vtt` (standup, 00:00–23:28)
- Pesan Tony sesudah meeting: 9 poin feedback website + "get it to Syed ASAP... out this weekend so I can start sending
  out the invites for the group chat."

Lanjutan dari `MEETING-2026-10-07-tasks.md`.

## Prioritas (Tony)

1. **Website live akhir pekan ini.** Tony mau kirim undangan group chat sesudah situs live. Alurnya: Ahmad beresin
   feedback, Syed ubah HTML ke React + tambah Privacy Policy dan Terms (wajib untuk branding verification, kata Mohit),
   estimasi Mohit 1 sampai 1,5 hari. [01:46–02:41, 07:37–09:28]
2. **App: Daily Brief + reminder + spouse connect, target Jumat** (Mohit). [14:17–14:33]
3. **Push notification: "I wanna nail these."** Yang baru: notifikasi saat guru atau room parent kirim email. [05:57–07:07]
4. **Fase berikutnya sesudah Daily Brief jalan: integrasi email** (ala Muse). [21:15–23:14]

## Yang terjadi

1. **Teks section website bergeser terus saat di-scroll** (class chats, directory). Tony: "I'd rather it just flash
   perfectly in the right spot... and then the next message comes on", terutama di mobile, "you really gotta stop it at
   the right spot to be able to see what the heck it even says." Section lain yang teksnya diam sudah oke. [00:00–01:05,
   03:24–04:35]
2. **Kalender kelas versi grid bulan: "isn't what we wanna display."** Pakai UI dari video (upcoming events saja). Sudah
   dikerjakan 7 Okt malam (T2) dan sudah dideploy; kemungkinan Tony lihat versi lama atau cache. [01:05–01:46]
3. **Video latar hero:** Tony suka. Coba ganti dengan sekolah, anak dan orang tua bergandengan tangan jalan ke sekolah,
   pakai AI. "It's worth a try." [04:51–05:55]
4. **Website "four times better than our current website."** Sprout Assist "all coming soon", nanti mungkin lebih ke
   birthday dan playdate. [07:37–08:52]
5. **Daily Brief Tony:** dinamis, "less about weather, more about what's actually happening in Sprout." Birthday Miss
   Taylor sudah muncul. No School dari Kiker master list belum masuk Daily Brief (baru di kalender). [06:34–07:07,
   10:01–11:41]
6. **Apex fundraiser dobel** karena Tony isi di kalender 1st grade dan kindergarten. Perilakunya benar; Tony hapus dan pakai
   Kiker master list. [11:51–12:55]
7. **Spouse:** Lydia sudah tersambung ke Tony, tapi data Daily Brief masih punya Tony saja sampai Mohit selesai sisi
   penerima undangan (accept flow). Undangan dan pesan per orang, sisanya dibagi. [13:05–14:05]
8. **Reminder, popup tambah:** contoh teks harus selalu abu-abu dengan tanda kutip (placeholder); yang jadi gelap hanya
   tombol centang. Bicara langsung ditranskrip ke kolom itu, tap untuk mengetik. Detail to-do digeser ke atas supaya pas
   dengan keyboard (contoh Orbits); judul "Sprout AI / Your day, in order" tidak perlu tampil di situ. [14:55–16:55]
9. **Riset Tony:** app keluarga (Orbits-like) dengan daily brief, task, meal plan, agent yang menelepon (Lifetime Fitness,
   reservasi), dan saran task dari riset party bus. Muse: digest email sekolah harian (picture day, enrichment fee, goal
   setting form, show and tell, library books). [16:58–23:14]

---

## W · Website v2 ke live (Ahmad, hari ini)

Folder: `01 - Website/sprout-reach-scene-iteration/home-v2.html`. Review: https://sprout-reach-scene-iteration.vercel.app/home-v2.html

- [x] **W1 Teks section tidak bergeser.** Class chats + directory: teks diam di satu tempat, step berganti (fade) mengikuti
  scroll, desktop dan mobile.
  - **Dikerjakan 8 Okt:** class chats + directory sekarang pinned seperti Daily Brief. Semua step di satu sel grid, scroll
    memilih step, teks fade di tempat, pips menunjukkan posisi. Step pertama kelas dapat 2x scroll untuk nama anak.
    Dicek otomatis: posisi teks sama persis di dua titik scroll, muat di layar 1440 dan 390.
- [x] **W2 9 poin feedback tertulis Tony:** (semua dikerjakan 8 Okt)
  1. Daily Brief: satu pagi nyata, bukan daftar 6 kategori.
  2. Lokal: pencarian sekolah di hero ("Find your school"), bukti Kiker / Circle C, jawaban "sekolahku belum ada".
  3. Sprout Assist: teaser 3 baris berbasis hasil, detail keamanan pindah ke FAQ.
  4. Kalimat kepercayaan tepat di bagian email: "You choose which senders Sprout reads. Nothing else."
  5. "Free for parents. Always." dekat CTA.
  6. Penutup: "The parents who matter most are already at drop-off." lalu CTA.
  7. "In one place" cuma sekali.
  8. Strip room parent: "Room parent? Set up your class in 5 minutes" ke RoomParent.
  9. Privasi anak di halaman: "No kid profiles. No public posts. Only verified parents at your school."
  - Catatan: Daily Brief kiri = "7:02 AM · Thursday" + 4 baris Tony (Dan diganti Lydia, cast halaman), tiap baris
    menyala saat phone menampilkannya; isi phone ikut diganti ke pagi yang sama. Cari sekolah: hanya Kiker Elementary
    (Circle C), data di `SCHOOLS` di home-v2.js; sekolah lain dijawab "isn't on Sprout yet" + Get Sprout + "I'm the room
    parent". FAQ 6 pertanyaan (gratis, sekolah belum ada, siapa lihat anak, email, Assist bayar/password, spouse).
  - **Perlu Tony:** angka "112 Kiker families" itu contoh dari Tony; konfirmasi angka asli sebelum live (memory 7 Okt
    menyebut target 65 parent). Jawaban FAQ "ask for your school from the app" juga perlu dicek ada fiturnya.
- [x] **W3 Kalender kelas = events saja.** Sudah 7 Okt (T2). Cek link live menampilkan list, bukan grid.
- [x] **W4 Handoff ke Syed:** link review + catatan konversi React (file, perilaku scroll, data yang harus jadi API,
  halaman Privacy/Terms yang sudah ada di `01 - Website/`).
  - **Siap 8 Okt:** https://sprout-reach-scene-iteration.vercel.app/handoff.html (+ `legal/privacy-policy.html`,
    `legal/terms-and-conditions.html`). Belum dikirim ke Syed: Ahmad yang kirim.
- [ ] **W5 Video hero baru (AI):** sekolah, anak dan orang tua bergandengan jalan ke sekolah. Tidak memblokir Syed: cukup
  ganti file video nanti.

- [x] **W6 Revisi UI (Ahmad, 8 Okt sore), dari `ui-options-1008.html`:** A1 morning = 4 notifikasi dengan ikon 3D Sprout;
  B1 step class chats + directory = counter "02 / 05" tanpa kotak + bar yang terisi ikut scroll; C2 room parent = tombol
  outline "I'm a room parent" di top bar + section before/after (strip hijau dibuang, Tony: "a random spot"). Deployed.

- [x] **W7 Feedback Tony di HP (8 Okt malam):** search sekolah di hero dihapus (balik ke tombol Join); note portal
  tidak keluar dari pill lagi di iPhone (`max-content`) + pita abu-abu di bawah portal (`100lvh`); mobile: teks step di
  atas phone; baris "No kid profiles..." dibuang (tetap di FAQ); Daily Brief mobile tanpa copy, phone lebih besar dan
  jarak dari "Sprout puts them in one place" rapat; section room parent dibuang ("confusing if I'm a normal parent"),
  tombol "I'm a room parent" di top bar langsung ke roomparent.com. Deployed.

## N · Push notification (Ahmad)

- [x] **N1 Notifikasi saat guru atau room parent kirim email** (Updates). Tambah ke set 7 Okt di Figma `13556:117832`,
  komponen Push Notification.
  - **Dikerjakan 8 Okt:** kolom "5 · Class email" (`13582:21567`) di section yang sama. A email guru (avatar kelas MT,
    guru tidak pernah tampil sebagai orang yang chat), B email room parent (Aisha, "Room parent · Miss Taylor's Class"),
    C "1 thing to do" (isi email diringkas jadi satu tindakan, arah integrasi email). Menunggu Tony pilih.
- Tony review set 7 Okt (spouse SMS, event, Morning Brief, subgroup) hari ini.

## S · Punya Tony / Mohit / Syed (track)

**Mohit**
- Daily Brief selesai besok (Jumat paling lambat), reminder flow juga.
- Spouse: accept flow dari sisi pasangan, lalu shared to-do, event, birthday, upcoming.
- No School dari Kiker master list masuk Daily Brief (sekarang cuma di kalender).
- Popup reminder: contoh teks tetap abu-abu, hanya centang yang gelap; transkrip suara ke kolom, tap untuk ketik; layout
  naik mengikuti keyboard.

**Syed**
- Coming soon pages + halaman undangan spouse (sudah). Lalu website: HTML ke React + Privacy Policy + Terms.

**Tony**
- Hapus duplikat Apex, pakai Kiker master list.
- Review push notification 7 Okt.
- Konfirmasi angka keluarga Kiker untuk website (lihat W2 poin 2).

## Catatan

- Integrasi email (fase berikutnya): bahan dari Muse, digest harian dari email sekolah masuk ke Daily Brief sebagai to-do.
  Sejalan dengan kalimat kepercayaan W2 poin 4: pilih pengirim, bukan baca semua inbox.
