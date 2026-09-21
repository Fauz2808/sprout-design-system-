# Loom untuk Tony — rundown, 17–21 September

Target 8–10 menit. Urutannya ngikut prioritas Tony sendiri: sign-up link dulu,
baru AI, baru sisanya. Tiap segmen: apa yang dibuka, apa yang ditunjukkan, dan
satu kalimat Tony yang jadi alasannya.

Semua file HTML dibuka di Chrome. Portal dibuka dari URL live, bukan file lokal.

---

## 0 · Pembuka, 20 detik

"Tony, ini update empat hari. Tiga bagian: sign-up link yang kamu minta, AI Assist
yang kamu bilang mau kasih banyak feedback, dan dua hal di Daily Brief. Di akhir ada
satu pertanyaan buat kamu dan satu hal yang belum beres di roomparent.com."

Jangan janjikan semuanya sudah final. Tony belum lihat apa pun sejak 17 Sep.

---

## 1 · Sign-up link, tiga tipe — **yang paling penting, taruh paling depan**

**Buka:** https://room-parent-portal.vercel.app → login → sidebar **Links** →
**Sign-Up Links**

**Kalimat Tony yang jadi alasannya (20 Sep):**
> "Currently, we default require to set a day and time window… room parents want to
> setup weekly signups for parents to bring the teacher lunch… another example is room
> parents will create a list of items they need for an event."

**Yang ditunjukkan, tiga contoh yang sudah ada isinya:**

1. **Teacher Lunch Fridays** — enam Jumat, tiga sudah diklaim. Ini contoh Tony persis.
   Buka View, tunjukkan siapa ambil minggu mana. Bilang: satu keluarga per Jumat, jadi
   statusnya **Taken** atau **Open**, bukan "1 spot left" yang kedengaran aneh.
2. **Fall Party Supplies** — empat item, tiga sudah diklaim. Orang tua pilih barang,
   bukan jam.
3. **Fall Field Trip Volunteers** — yang lama, shift dengan jam, masih utuh.

**Lalu tunjukkan cara bikinnya**, ini bagian yang bikin dipakai atau nggak:
**+ New Sign-Up** → kartu tengah **By date** → scroll ke **Dates** → isi Jumat pertama,
label "Teacher lunch", spots 1 → **Repeat: Every week**, **How many: 12** →
**Generate dates**.

Dua belas Jumat langsung jadi. Bilang kenapa ini penting: satu term lunch guru itu
12–15 tanggal, dan kalau harus diisi satu-satu, nggak akan ada room parent yang mau.

**Sebut juga yang berubah namanya:** kartu keduanya dulu "Anytime", sekarang **By date**.
Alasannya: "anytime" menggambarkan piknik yang orang datang kapan saja, bukan Jumat
yang satu keluarga klaim.

**Status:** sudah live dan sudah dirilis ke Mohit. `v2026-09-21.1`.

---

## 2 · AI Assist — **di sini minta koreksi, jangan jual**

Tony sudah bilang duluan: *"what I'm seeing with the AI generated UI, I don't wanna go
that path."* Buka segmen ini dengan mengakui itu, bukan dengan membela.

**Kalimat pembuka yang disarankan:** "Kamu bilang nggak mau jalan ke arah itu. Aku nggak
yakin yang kamu maksud UI fitur AI-nya atau UI hasil generate AI-nya, jadi aku tunjukkan
apa yang berubah dan kamu koreksi."

**Buka:** `08 - Generated Screens/AI Assist/reminder-flow-v2.html`

**Masalah yang diperbaiki, kalimat Tony 17 Sep:**
> "The thing that is missing here is when I'm done… if you don't have a closed thing,
> then how's it gonna know? I guess I just don't know when to stop."

Enam panel, kiri ke kanan. Yang ditunjukkan:
- Panel 1 dan 2 **sejajarkan di layar**. Tunjukkan bahwa yang bergerak cuma orb dan dua
  kata. Tombolnya di titik yang sama persis, jawaban langsung buat keluhan "I don't like
  that this button jumps from here to here."
- "Caught so far" dan transkrip live **dibuang**. Alasannya faktual, bukan selera:
  Mohit konfirmasi n8n baru jalan setelah selesai ngomong, jadi apa pun yang terisi
  selama merekam itu teater.
- **Orb-nya mengecil, contoh kalimat naik ke atas.** Ini yang langsung menjawab
  *"the blob just isn't the whole thing at all, it's more important to show people how
  to use it."*
- Panel 5 dan 6 yang dia minta sendiri: notifikasi yang diterima pasangan 15 menit
  sebelumnya, dan Daily Brief pasangan yang sudah terisi.

**Lalu:** `voice-capture-alternatives.html` — tiga arah alternatif, baseline di kiri
sebagai pembanding. Bilang jujur mana yang kamu nggak rekomendasikan dan kenapa
(auto-start merekam orang sebelum dia menekan apa pun).

**Terakhir, cepat:** `event-note-flow-v2.html` — pola yang sama diterapkan ke Event dan
Note, plus state attach-link yang dulu nggak pernah digambar.

**Pertanyaan yang ditanyakan di sini:** contoh kalimat pakai kutip **dan** kurung
sekaligus. Tony sempat bolak-balik soal ini 17 Sep. Lebih cepat diputuskan sambil lihat
layar daripada lewat chat.

---

## 3 · Daily Brief — dua hal, satu di antaranya yang dia minta kemarin

**Buka:** `08 - Generated Screens/Home/daily-brief-spouse-todo.html`

**Alasannya, Tony 17 Sep:**
> "From parent to parent, like me to my wife. If we can get the spouses using it with
> the reminders, that's half the battle."

Tiga panel. Yang ditunjukkan:
- Daftar pasangan duduk di bawah daftar sendiri. Punya sendiri sudah beres jadi melipat,
  punya pasangan masih ada sisa jadi terbuka. Aturannya: yang selesai melipat, yang belum
  tetap terbuka.
- **Baris pasangan nggak bisa dicentang.** Kotak persegi berarti punyamu, lingkaran
  berarti punya dia. Alasannya bukan sopan santun: begitu bisa mencentang kerjaan orang
  lain, angka 1/3 berhenti berarti apa-apa.
- Panel kedua, ada yang telat, muncul tombol **Nudge**. Kirim notifikasi, bukan mengedit
  daftar dia.
- Panel ketiga, HP pasangan. Komponen sama, nama ditukar. Nggak ada HP yang jadi master.

**Lalu:** `daily-brief-collapse-and-bell.html` — dua perbaikan di atas frame asli 7.1.
Panel 1 dan 2 bedanya cuma satu section yang dilipat, dan semua di bawahnya naik ~190px.
Panel 3, bel notifikasi dikembalikan ke header.

**Yang perlu disebut jujur:** header aslinya cuma punya satu ikon, jadi menambah bel itu
menghabiskan ruang terakhir di kanan. Kalau di HP kelihatan berat sebelah, jalan keluarnya
tanggal pindah ke bawah judul.

---

## 4 · Notifikasi — masalah yang dia sendiri bilang bakal terlupakan

**Buka:** `08 - Generated Screens/Notifications/join-request-and-notifications-door.html`

> "If someone requests to join a club, I need to receive a notification on my phone. If
> you don't put it in here, the guys will forget."

Temuan yang perlu disebut: layar Notifications-nya **nggak pernah dihapus**. Dia kehilangan
pintunya waktu nav direstruktur, karena satu-satunya ikon di header Daily Brief dialihkan
ke kalender. Jadi ini perbaikan pintu, bukan desain ulang.

Lima panel: header diperbaiki → push di lock screen → layar approve/deny → request juga
menunggu di layar Notifications kalau push-nya terlewat → selesai.

---

## 5 · Feature map — pakai ini buat menutup, bukan membuka

**Buka:** https://feature-map-deploy.vercel.app

Ini yang kamu usulkan dan Tony bilang "I like that". Jangan dijelaskan lama, cukup
tunjukkan dua hal:

1. Strip paling atas, **What is at risk right now**. Lima hal missing atau broken.
2. Tap **Push notifications**. Dua fitur menyala: AI Reminder dan Join request. Bilang
   kalimatnya: dua fitur yang kelihatan tinggal dibangun sebenarnya duduk di atas pipa
   yang belum ada.

Itu argumen prioritas yang paling kuat yang bisa kamu kasih ke Tony minggu ini.

---

## 6 · Penutup — dua hal yang butuh dia, bukan kamu

**Satu:** roomparent.com masih menyebut lunch menu di dua FAQ. Mohit sudah hapus yang di
hero, dan kamu bilang "looks good" waktu itu, tapi dua kalimat di FAQ masih hidup. Sudah
aku kirim string penggantinya ke Mohit. *(Sebut ini terakhir dan singkat. Ini koreksi,
bukan tuduhan.)*

**Dua:** siklus hidup to-do. Tony sendiri yang bilang *"it's more of a UI problem than
anything, on how we would show that."* Empat keadaan yang harus didesain sebagai satu
paket: hidup sampai due date, reminder portal tanpa tanggal kalender, sudah dicentang tapi
tetap kelihatan buat pasangan, lalu pindah ke History. Bilang ini yang kamu kerjakan
berikutnya, dan Mohit lagi bangun logika backend-nya, jadi desainnya perlu duluan.

**Tutup dengan tanggal:** 23 September room parent beneran mulai masukkan kontak orang tua.
Dua hari lagi.

---

## Checklist tab sebelum rekam

Buka semua ini dulu, urut, biar nggak ada jeda cari file pas rekaman:

1. https://room-parent-portal.vercel.app  (login duluan, jangan rekam proses login)
2. `08 - Generated Screens/AI Assist/reminder-flow-v2.html`
3. `08 - Generated Screens/AI Assist/voice-capture-alternatives.html`
4. `08 - Generated Screens/AI Assist/event-note-flow-v2.html`
5. `08 - Generated Screens/Home/daily-brief-spouse-todo.html`
6. `08 - Generated Screens/Home/daily-brief-collapse-and-bell.html`
7. `08 - Generated Screens/Notifications/join-request-and-notifications-door.html`
8. https://feature-map-deploy.vercel.app

Semua halaman HTML itu panel horizontal. Zoom browser ke 67–75% biar dua panel muat
sekaligus, karena perbandingan sebelah-menyebelah itu inti dari cara bacanya.

---

## Yang JANGAN masuk video

- Perbaikan generator handoff (section terakhir menelan blok script, notes yang cuma
  menyebut spec). Itu urusan internal pipeline, nggak menarik buat Tony dan cuma bikin
  dia ragu sama release notes.
- Bersih-bersih repo, 500MB, arsip portal lama.
- Salah paham soal join-existing-class dengan Mohit. Sudah selesai lewat chat.
