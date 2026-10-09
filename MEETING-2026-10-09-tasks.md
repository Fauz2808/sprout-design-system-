# Meeting 2026-10-09: website live, release reminder, growth

Hadir: Tony, Mohit, Syed (Ahmad tidak bicara). Jumat 9 Okt.
Sumber: `~/Downloads/Sprout Release, Daily Briefs, and Growth Transcription.vtt` (00:00–41:55).

Lanjutan dari `MEETING-2026-10-08-tasks.md`.

## Prioritas (Tony)

1. **Rilis app ke App Store** begitu reminder jalan (Mohit: besok pagi). Sebelum push, **screenshot App Store diganti**.
   [08:59–09:25, 17:37–17:48]
2. **Website sudah live** dan Tony akan langsung share linknya: "I'm so happy it's already live because I'm gonna send
   out this link." Tinggal routing tombol Join (desktop, iOS, Android) dan link footer. [13:16–13:48]
3. **Undangan kelas bertahap:** kelas pertama dulu (34 parent termasuk Tony dan istri, target "high twenties" di app),
   lalu kelas kedua (~30, 5 sudah daftar). Target **~85 parent Kiker**, lalu kabari user app lama dan semua room parent
   "we have 85 parents now". [18:06–19:40]
4. **Sesudah rilis: "it's all about email scraping and daily brief updates."** [39:52–40:10]

## Yang terjadi

1. **Tony suka websitenya.** "This, like, really explains it to me in a way that I'm like, is freaking sweet... great
   job." Kelas-kelasnya sudah menanyakan kapan group chat kelas dimulai. [00:08–01:02]
2. **Angka "112 Kiker families in Circle C" belum benar:** "We don't have that yet. I think Ahmad just kinda put that
   there... I might wanna adjust that number." [00:08–00:40]
3. **Syed:** masalah keyboard di reminder sudah beres dan dikirim. Ada beberapa link footer yang perlu diperbarui.
   [01:02–01:12, 17:12–17:30]
4. **Mohit:** Daily Brief + undang dan terima spouse + berbagi data selesai. Halaman statis Sprout Assist sudah ada.
   Reminder belum: suara ke teks pakai SDK lokal, lalu teksnya diubah oleh model jadi judul + tanggal + isian form
   yang bisa diedit sebelum disimpan; lancar di Android, masih bermasalah di iOS. Selesai besok. Mengetik reminder
   belum bisa. [01:15–03:15, 40:15–40:24]
5. **Tes join kelas lewat link (Miss Taylor):** formatnya bagus. Halaman masih bilang "Request sent. Tony Martin
   approves", ternyata cache (di private window tidak muncul). OTP otomatis terverifikasi begitu 6 digit masuk. **Link
   Android di halaman join belum ada**, Mohit perbaiki. [03:28–08:46]
6. **Tombol "Join your schools" di website:**
   - **Mobile:** deteksi OS, langsung ke App Store atau Google Play.
   - **Desktop:** buka **pop-up dua QR code, iOS di kiri, Android di kanan**, dengan copy diperbarui. Mohit sudah punya
     desain QR yang Tony setujui ("something like this would be perfect").
   [09:27–12:25]
7. **Kontak di footer** diarahkan ke email Tony. [12:40–13:14]
8. **Daily Brief: hari libur dari Kiker master list masih belum muncul** (9 Okt, 12 Okt), padahal di subgroup muncul.
   Mohit cek lagi pakai ID Tony. [40:24–41:39]
9. **Muse** tidak tersedia di India (Mohit tidak bisa mencoba). Tony: digest Muse dari email kelas bagus, bukti bahwa
   email bisa di-scrape lalu disajikan di Daily Brief; kelebihan Sprout: semuanya tetap di sana dan bisa dicentang.
   [13:55–15:29]
10. **Rencana growth (Tony):**
    - **Daycare** (usia 1–4, banyak milik pribadi, birokrasi lebih sedikit, cukup satu "ya" dari owner/direktur). Basis
      Kiker jadi bukti saat presentasi. Dimulai sesudah rilis reminder. [19:40–21:30]
    - **Email scraper** untuk Daily Brief: email guru, room parent, sekolah, olahraga jadi reminder dan event. Dengan
      ini Sprout tidak bergantung pada room parent mengisi roomparent.com. [21:30–23:18]
    - **Upload semua SD Austin ISD (~70)** sekaligus: nama, alamat, logo yang di-generate, grade PK–5. Siapa pun bisa
      join sekolahnya, Daily Brief jalan dari hari pertama meski baru satu parent di sekolah itu. [23:18–24:02, 32:10–33:05]
    - **Konten Instagram**: orang menemukan sekolahnya lalu join. [24:04–24:49]
11. **Summer camp (Januari) lewat Sprout Assist, bukan portal:** Assist mencari camp, mengisi form di website camp,
    mengingatkan hari registrasi (contoh 21 Jan), dan minta izin sebelum bayar pakai Link (dompet agen dari Stripe), seperti
    di Muse. Assist dibuat lebih berbasis teks. Model take rate ala Instinct nanti; integrasi pertama yang diincar:
    **Austin SSC** (soccer, baseball, usia 3–13, pemiliknya sudah tertarik). [24:52–31:57]
12. **Invite teman (growth loop), "the only other thing Ahmad needs to think about":** parent yang paling terhubung
    harus gampang mengajak teman, termasuk dari sekolah lain. Contoh Instinct: 5 undangan per user, tumbuh 10% per hari.
    - Mohit: pop-up **sesudah seminggu pemakaian**, sekaligus minta rating App Store/Play Store dan tombol share.
      Tony setuju, dan **jangan di onboarding** ("I don't like the app yet").
    - Ide lain dari Tony: fitur terbuka setelah mengajak teman (contoh app olahraga: atlet ke-16 butuh referral, 35%
      user organik), atau imbalan karena share (contoh iCracked: screen protector gratis kalau share di Facebook).
    - Tony juga menyebut tombol "invite friends" di Daily Brief. Belum diputuskan: "we'll have to figure that part out
      too eventually."
    [33:05–39:52]

---

## A · Ahmad

- [x] **A1 Angka di baris bukti hero.** "112" bukan angka nyata. Pilihan: (a) buang angkanya, jadi "Kiker families in
  Circle C are already here · Free for parents. Always."; (b) pakai angka nyata dari Tony (kelas pertama 34, target 85).
  Satu tempat: `SCHOOLS` di `home-v2.js`, lalu export + push ke `sprout-website`. **Tanya Tony atau putuskan (a).**
  - **Dikerjakan 9 Okt (a, Ahmad):** angka dibuang, `SCHOOLS` dihapus. Live di link review + `sprout-website`.
- [x] **A2 Pop-up QR di desktop: dikerjakan kita (9 Okt), bukan Mohit.** QR di-generate dari link store yang sama
  (`review/make-qr.py`, dicek dengan decoder: dua-duanya terbaca persis sebagai link tombolnya). Desktop: pop-up iOS kiri,
  Android kanan, tutup lewat Esc / tombol / klik di luar. HP: langsung ke store sesuai OS (iPad ikut App Store). Link App
  Store diganti ke storefront US (sebelumnya India). Live di link review + `sprout-website` (Syed tinggal deploy).
  Desain QR Mohit belum dilihat; kalau beda gaya, sesuaikan.
- [x] **A3 Screenshot App Store/Play Store untuk rilis ini** (`03 - App Marketplace Screenshots/`): Daily Brief baru,
  spouse, reminder. Harus siap sebelum Mohit push (target besok).
  - **Selesai 9 Okt:** sudah di-handover Ahmad ke Mohit.
- [x] **A4 Invite teman / growth loop: 2–3 arah, belum desain final.** Bahan: pop-up sesudah seminggu (rating + share,
  usul Mohit, Tony setuju), tombol invite di Daily Brief, batas 5 undangan ala Instinct, imbalan/fitur terbuka karena
  mengajak. Gabungkan dengan R1 Share Sprout (A + C sudah dipilih 7 Okt). Bukan di onboarding.
  - **Konsep 9 Okt:** `08 - Generated Screens/Home/invite-friends-concepts.html`, review link
    https://sprout-invite-concepts.vercel.app. A "One week in" (sheet hari ke-7: rekap minggu keluarga sendiri, lalu
    Share + Rate; prompt rating sistem, tanpa hadiah/filter), B "Five personal invites" (link pribadi, halaman web "Tony
    invited you", invite kembali saat teman join), C "Invite to get Sprout Assist first" (3 teman = masuk beta Assist).
    Rekomendasi: A sekarang (tanpa backend), C di atas link pribadi B (butuh Mohit). 4 pertanyaan untuk Tony di bawah
    halaman.
  - **Diputuskan Ahmad 9 Okt:** (1) share + rating digabung di satu sheet hari ke-7; (2) undangan tidak terbatas, satu
    link pribadi per parent; (3) hadiah = Sprout Assist duluan, 3 parent join dari link; (4) link masuk ke kelas
    pengundang: teman pilih kelas (pengundang bisa punya beberapa kelas), belum punya app → store dulu, lalu app pertama
    kali dibuka langsung di kelas itu. Halaman jadi flow final + catatan untuk Mohit (link pribadi, deferred deep link
    lewat Branch/AppsFlyer karena iOS tidak punya bawaan, halaman web pilih kelas, timer 7 hari). Masih terbuka: teman
    dari sekolah lain tetap dihitung untuk Assist? Assist untuk pengundang saja atau sekeluarga? (usul: ya, sekeluarga).
  - **Tambahan 9 Okt (D, Ahmad):** invite juga dari class chat: tombol Invite di header chat kelas + baris pertama di daftar
    member ("Invite a parent to Miss Taylor's Class", jumlah parent sebagai angka, bukan daftar yang belum join). Link dari
    kelas membawa kelasnya, jadi halaman web teman langsung "Join Miss Taylor's Class" tanpa pilih kelas.
  - **Figma 9 Okt (A1 "The week, then the ask"):** section `13634:213791` (Exploration Page), screen
    `13635:199628` di sebelah screen Ahmad (tidak diubah). Komponen lokal baru di "Components · Daily Brief":
    `DB / Week Recap Sheet` 13635:199582, `DB / Stat Tile` 13635:17826, `DB / Sheet Grabber` 13635:17825. Variable baru
    `color/background/scrim` (alias `color/alpha/black-40`). Effect style baru `Shadow XS` (bayangan mentah Button, nilai
    sama, 60 varian diikat). Audit: 0 masalah.
  - **Tambahan 9 Okt (A2 + A3):** screen `13639:199796` (prompt rating iOS) dan `13639:200105` (share sheet iOS, link
    kelas Tony) di section yang sama. Komponen lokal baru di frame "Components - Invite After 7 Days" (`13639:1692`):
    `iOS / Review Prompt`, `iOS / Share Sheet` (property Title, Link), `iOS / Contact Avatar` (property Initials). App
    icon = varian Logo 56/48 px; effect style baru `App Icon / Depth 56/48/80` (nilai sama dengan efek mentah Logo).
    18 ukuran Logo lain masih efek mentah. Audit 218 node: 0 masalah.
  - **A4 (9 Okt):** screen `13641:17038` "Day 7 · Messages, prefilled invite": iMessage terbuka ke Sarah Baker dengan
    pesan terisi ("I've been using Sprout for a week: our class chat, the school calendar and our family to-dos in one
    app. It's free, join Miss Taylor's class: joinsprout.co/i/tony"), pakai komponen `iOS / Messages Compose Sheet`
    yang sudah ada. 3 fill putih mentah di komponen itu diikat ke `color/text/stable/white`. Audit: 0 masalah.
- [ ] **A5 (nanti) Logo sekolah Austin ISD** kalau batch upload ~70 SD jatuh ke desain: satu gaya logo yang bisa
  di-generate konsisten.

## S · Punya Tony / Mohit / Syed (track)

**Mohit**
- Reminder suara selesai (besok), lalu rilis iOS.
- Link Android di halaman join kelas.
- ~~Join di website: pop-up QR desktop~~: dikerjakan kita (A2). Mohit tidak perlu mengerjakan.
- Hari libur dari Kiker master list ke Daily Brief (9 dan 12 Okt belum muncul).
- Sesudah rilis: email scraping ke Daily Brief.

**Syed**
- Link footer website. Kontak footer ke email Tony.

**Tony**
- Kirim undangan ke kelas pertama, lalu kelas kedua; kabari user lama dan room parent.
- Mulai pendekatan daycare sesudah rilis. Austin SSC sebagai integrasi pertama.
- Angka keluarga Kiker untuk website (A1).

## Catatan

- Website live dikelola Syed dari `Fauz2808/sprout-website`. Perubahan desain tetap dari `home-v2` lalu export + push,
  supaya repo dan link review tidak beda.
- Hero CTA dihapus hari ini atas permintaan Tony (sudah di-push, `c2fbf9a`). "Join your schools" tinggal di top bar dan
  penutup, jadi A2 berlaku untuk dua tombol itu.
