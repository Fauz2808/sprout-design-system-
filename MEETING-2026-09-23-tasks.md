# Meeting 2026-09-23 — App, Events, and Sprout Assist Planning

Hadir: Tony, Mohit, Ahmad.
Sumber: `~/Downloads/App, Events, and Sprout Assist Planning Transcription.vtt`.
Lanjutan dari `MEETING-2026-09-18-tasks.md`.

## Urutan prioritas dari Tony

1. **Sekarang:** room parent portal + iOS app keluar dengan fitur yang ada hari ini.
2. **Sebelum rilis:** schools & grades menu (Mohit), copy changes, Upcoming events 14 hari.
3. **Sesudah itu, Sprout Assist:** **reminders dan events dulu, sampai benar.** Lalu birthdays, lalu clubs.
   Tony: *"eventually, reminders might be a pretty powerful thing for us."*
4. **Website:** *"we have more time on the website."* Bukan P0.

Jawaban untuk pertanyaan Ahmad ("selain Daily Brief, kita fokus apa?"): ya, lanjut ke voice
dictate. Mulai dari **reminder**, lalu events.

---

## P0 · Punya kita (Ahmad)

- [x] **R1 Buang check mark kedua di layar voice.** Tony: *"I just don't wanna hit two buttons."*
  Satu centang di bawah orb, nggak ada centang di atas. Nggak ada transcript live, karena
  background noise bakal jadi teks sampah dan AI yang memilah setelahnya.
  Contoh kalimat tetap: *"Remind my husband to pick up Presley from school at 2PM."*
  → `08 - Generated Screens/Home/daily-brief-reminder-loop.html` step 2.
  Ekstra: dari CTA brief, layar voice **langsung mendengarkan**, jadi tombol Start juga hilang.
  Perlu dicek ke Mohit: auto-start butuh izin mic sudah diberikan.

- [x] **R2 CTA "Add a reminder" di Daily Brief**, terutama kalau hari itu belum ada to-do.
  Tap → langsung ke voice reminder. Kalau list sudah ada isinya, CTA mengecil jadi link
  **+ Add** di header section. → step 1 dan 5.

- [x] **R3 Empty-state copy** dengan logika yang benar. Bug-nya: *"You got a free day"* muncul
  padahal ada school picture day hari itu. Empty state To do sekarang hanya bicara soal to-do.
  Tabel logika ada di bagian bawah file prototipe.
  **Ini draft.** Tony bilang dia akan kirim copy final. Kirim tabelnya ke Tony, biar copy
  finalnya ditulis per state, bukan satu kalimat untuk semua kondisi.

- [ ] **R4 Konfirmasi ikon Daily Brief ke Tony.** Di call kamu sudah bilang *"this one different,
  it's not all updated."* Spesifikasinya sudah ada di tabel prototipe (sumbernya Figma
  `11351:103830` + `daily-brief-homepage.html`):
  | Section | Ikon |
  |---|---|
  | Header kanan atas | Phosphor `CalendarDots`, regular, 24px |
  | Happening today | 📅 (kalender dengan angka) |
  | Upcoming events | 📆 (kalender sobek, tanpa angka) |
  | Your invitations | ✉️ (Tony sudah setuju ikon surat) |
  | To do | ✅ |
  **Yang masih kurang:** screenshot build dari Tony. Ada di chat kamu, nggak ada di mesin ini.
  Cocokkan satu per satu, lalu kirim ke Mohit ikon mana yang perlu diganti.

## P1 · Punya kita, Tony masih mikir

- [x] **S1 Reminder pasangan: satu list, wajah di setiap item.** Tony nggak suka header dropdown
  (*"so much UI for that header thing"*), dan dia memperkirakan biasanya cuma 1 sampai 2 reminder.
  Idenya: gabung reminder pasangan ke list yang sama, foto orangnya di sebelah centang, dan
  kalau pasangan menyelesaikan satu, layar kita ikut update. Sudah digambar persis seperti dia
  ucapkan → step 5. Versi dropdown yang lama: `daily-brief-spouse-todo.html`.
  Tony bilang *"let me think about this"*, jadi **kirim dua-duanya berdampingan.**

- [ ] **S2 Kirim link iterasi ke Tony.** Kamu janji di call: *"I'll send you the link for this."*
  Tony juga bilang akan nonton video kamu. Kalau lewat file dia nggak buka (pelajaran 18 Sep),
  kirim Loom singkat yang membuka `daily-brief-reminder-loop.html` dari kiri ke kanan.

## P2 · Website (Tony: waktunya masih ada) — dikerjakan 24 Sep di `01 - Website/sprout-reach-scene-iteration/`

- [x] **W1** Heading pakai **Playfair Display**, font display Sprout, menggantikan DM Sans yang
  Tony sebut *"very basic text"*. Berlaku untuk h1–h3, wordmark, judul moment, dan nama tab kelas.
  Body copy tetap DM Sans. Baris kedua hero dan heading Classes pakai Playfair italic, sama seperti
  "Here's your Wednesday:" di app. Kalau maksud Tony ternyata wordmark/logo, override-nya ada
  di satu blok di akhir `styles.css`, gampang dibalik.
- [x] **W2** Section baru **Classes** ("Everything for their class. In one place."), letaknya di
  antara Family life dan Sprout Assist. Isinya empat tab seperti di app: group chat, class calendar,
  teacher and room parent emails, important links. Layarnya dari Figma (`8198:109904`,
  `8766:154859`, `8827:117674`, `8845:135495`). Ada 2 redaksi:
  chip Gmail pribadi Tony di layar Updates dihapus, dan bubble chat yang masih menyebut
  "Meeting Point" diganti copy netral. Detailnya di `assets/SOURCES.md`.
- [x] **W3** Bagian yang dobel dibuang. Kartu moment Chat dihapus (chat sekarang ada di Classes
  dan hero). Moment 01 menampilkan potongan kartu to-do, bukan layar Daily Brief penuh yang sudah
  dibuka hero. Subjudul kartu itu dibetulkan dari "Great you got everything for today" (padahal
  ring-nya 1/3) jadi "Two things left for today".
- Test: `node --test review/*.test.cjs` lulus 15/15 (ada 3 test baru untuk Classes, dedupe,
  dan font display). Sudah dicek di browser 1440px dan 375px, tanpa horizontal scroll dan
  tanpa error di console.
- **Belum di-commit dan belum deploy.** Perubahan ini numpuk di atas WIP-mu yang belum di-commit
  (hero Events→Clubs). Vercel project `sprout-reach-scene-iteration` deploy dari folder ini.

---

## Punya Mohit (track, bukan kita)

**Selesai di call:** member subgroup muncul (kode chat belum di-merge, sudah dia upload ke backend).

**Bug:**
- App **crash** untuk user yang join dari web tanpa melengkapi profil (tanpa anak). Sumbernya di
  map. Mohit akan tambah pengecekan.
- **Event hari ini muncul di Upcoming events** (school picture day tanggal 23). Hari ini
  seharusnya hanya muncul di Happening today.

**Dikerjakan:**
- Schools & grades menu, 1 sampai 2 hari, mulai besok. Lalu submit review, lalu kembali ke CMS.
- Upcoming events: **7 → 14 hari.**
- Copy changes dari Tony, sebelum live.

**Model event (keputusan Tony, belum dibangun):**
| Jenis | Masuk ke | Setelah dijawab |
|---|---|---|
| Butuh RSVP | Your invitations | Yes → pindah ke Upcoming events |
| Tanpa RSVP (school calendar, event CMS) | Upcoming events langsung | Otomatis dianggap diterima |

Masalah hari ini: event yang dibuat di CMS **belum tampil di app sama sekali**, dan
Upcoming events cuma berisi "my events". Ide Mohit soal tombol "All events" ditolak Tony,
karena sebagian besar isinya dari kalender sekolah, bukan dari My events.
Semuanya digambar di band "Events" pada prototipe.

**Sesudah itu:** backend reminder. Tony: *"ready for Mohit to start to reconfigure n8n with
voice to text speech."* Daily Brief lalu bisa membedakan reminder antar pasangan (S1).

## Tony sendiri

- Bicara ke user yang join tanpa foto profil.
- Review semua CMS hari ini, isi fundraising dari kelas-kelasnya.
- Kirim copy changes dan feedback UI reminder antar pasangan.
- Jake (komunitas pickleball) mau pakai app buat sebar undangan. Ini user nyata pertama di luar
  sekolah yang pakai Invitations, jadi flow invitation layak dites dari sisi dia.
