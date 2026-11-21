# Meeting 2026-11-21 (Jumat 20 Nov US): pertanyaan sitter Mohit, review playdate / sitter / carpool, website

Hadir: Mohit, Ahmad, Tony (masuk 05:08).
Sumber: `MEETING-2026-11-21-transcript.vtt` (salinan dari `~/Downloads/Sprout Booking Flows and Website Review Transcription.vtt`)
+ doc Tony **"Sprout Website: Copy & Design Brief"** (Claude Docs, 20 Nov, view-only:
https://claude.ai/artifact/Jb66UZtegKiZGNWZuSfBzD).
Lanjutan dari `MEETING-2026-11-20-tasks.md`. Prototype: `08 - Generated Screens/AI Assist/task-first-assist/`.
Website: `01 - Website/sprout-reach-scene-iteration/` (hero kerja: `home-v3.html`, `hero-photo-2026-11-20/`).

## Prioritas (usulan)

| # | Task | Kenapa urutan ini | Selesai kalau | Status (21 Nov) |
|---|---|---|---|---|
| 1 | **S1–S7** Babysitter | Mohit **sedang membangun flow ini hari ini** dan punya banyak pertanyaan; tiap jam desain belum beres = Mohit nebak | Flow sitter di prototype sesuai semua poin di bawah + satu pesan jawaban ke Mohit | **Selesai**: commit `67cf2be`, live di sprout-assist-tasks.vercel.app. Pesan ke Mohit belum dikirim |
| 2 | **W1** Website hero | Permintaan eksplisit penutup meeting: "update that image at the top, header and subheader, see how that looks" | Hero baru dengan foto parent di depan sekolah + copy dari doc Tony, dikirim ke Tony | **Selesai**: commit `f6b3e56`, live di sprout-reach-scene-iteration.vercel.app/home-v3.html. Belum dikirim ke Tony |
| 3 | **P1–P3** Playdate | Tony review paling panjang; layout + sinkron dua sisi | Anak di atas, satu baris; widget sama di dua sisi; balasan "Suggest another time" punya opsi | **Selesai**: commit `60c6472`, live di sprout-assist-tasks.vercel.app (`/playdate/`, `/playdate-new-time/`, `/playdate-invite/`) |
| 4 | **C1** Carpool sekali | "The one I wanna focus on, obviously, is the one-time carpool" | Anak satu baris, header baru, sisi Priya + widget konfirmasi | **Selesai**: commit `632f348`, live (`/plan-carpool/`, `/receiver/?v=carpool-chat`) + tawaran jam dari parent lain |
| 5 | **C2** Carpool rutin | Dirombak: dua keluarga, tanya satu per satu | Demo: keluarga 1 tidak bisa, keluarga 2 bisa, jadwal bisa diubah, Share | **Selesai**: commit `458288a`, live (`/plan-carpool/`, `/receiver/?v=carpool-regular`) |
| 6 | **W2** Website bagian 2–6 | Doc Tony bilang "all copy below is final", tapi di meeting dia bilang hero dulu | Lima bagian sesuai doc, setelah Tony oke hero | Tunggu Tony oke hero |

Semua commit hari ini ada di branch `assist/sitter-date-night-map`, **sudah di-push** (21 Nov).

## Yang terjadi

1. **Pertanyaan sitter Mohit** [00:04–05:08, 23:31–44:21]: Mohit mulai build babysitter hari ini.
   - **Jarak waktu booking**: hari ini jam 2 PM, slot paling awal kapan? Disepakati **30 menit dari sekarang**
     (Tony: "probably none... maybe an hour... That's fine" ke usulan 30 menit Mohit).
   - **Quick options** (3 pilihan) tetap; atau pilih mulai–selesai sendiri.
   - **Location + notes**: kosong di pemakaian pertama, bukan prefilled. Mohit: ikon pensil berarti "edit", padahal
     field-nya harus diisi, jadi butuh affordance input.
   - **Data sitter dari mana**: tidak ada master/admin. Sitter **per user**: sitter yang kamu tambah sendiri + sitter
     dari kelas yang kamu simpan. Tidak pernah tampilkan sitter orang lain secara default. Jadi tidak perlu filter
     lokasi.
   - **Balasan sitter**: sitter tidak punya app, balas lewat SMS. Sprout bikin **group text (Sprout + parent +
     sitter)**, agent dalam **mode watcher** baca thread, lalu kasih tahu parent dan lanjut ke langkah berikutnya.
2. **Agent registrasi Mohit** [05:08–09:20]: isi form < 2 menit; field selain email/password/nama masih random, bisa
   diganti data user. Add card + payment jalan. Console langkah demi langkah ditampilkan ke user supaya tidak terasa
   menunggu (Tony: "it kinda builds trust"). CAPTCHA muncul di 2 tempat: sign up dan complete profile. Mohit cek cara
   Muse melewatinya, tanpa memblok pekerjaan lain. Tony: menang cepat = **playdate, sitter, carpool** (tanpa integrasi).
3. **Assist home** [07:01]: "This looks good. I think this is a good layout."
4. **Playdate** [07:01–23:31]:
   - Terlalu panjang, apalagi kalau 4 anak. **Maya dan Jake satu baris**, quick options tanggal satu baris.
   - **Jangan tulis "Miss Taylor's class"** di pilihan anak sendiri: parent cuma pilih Maya / Jake / dua-duanya.
   - **Pilih anak paling atas** ("you're selecting for which kid"), lalu tanggal (default terisi), tempat, antar-jemput.
   - Langkah preview pesan terasa opsional: cukup "we messaged them".
   - **Suggest another time** dari parent lain: di sisi organizer, agent tampilkan "Megan suggested Sat 3 PM" + opsi
     **Accept / Suggest a different time / Reply**.
   - **Dua sisi harus sama**: Megan dapat widget Confirm / Suggest another time / Can't make it. Tony (pembuat)
     punya **widget yang sama tanpa tombol**, status "Waiting on Megan", lalu jadi **Confirmed + di kalender** setelah
     Megan konfirmasi. Pesan Megan ("Harper is so excited...") muncul di chat dua sisi. Jangan pakai pesan template
     otomatis saat Confirm.
5. **Babysitter review** [23:31–59:35]:
   - Default tanggal **hari ini**, bukan besok.
   - Langkah detail: pemakaian pertama **cukup Location (alamat) + Notes**. Tidak usah konfirmasi ulang anak/waktu yang
     baru saja dipilih. Default asumsi rumah; kalau belum ada alamat, minta ketik.
   - **Add a sitter**: ambil dari **kontak HP** (contact picker), bukan ketik nomor. Rate per hour **opsional**.
     She/he: Tony ragu ("you're getting into the pronouns game"), dipakai untuk "she's available". **Hapus WhatsApp**:
     sitter hidup di SMS.
   - SMS thread: kalau sitter bilang yes, Sprout kasih hot key **Book Casey**; kalau parent balas sendiri di SMS
     ("see you Saturday"), Sprout baca dan bilang "Looks like you're confirmed".
   - **Live Activity** [44:21–48:13]: tulis **"babysitter"**; kartu lebih sempit; titik di tengah; "Home by 10 PM" dan
     "Casey by 6 PM" indent sama.
   - **Bayar** [48:13–59:35]:
     - CTA "Pay Casey" harus ke **pembayaran dulu, baru rating** (sekarang terbalik).
     - Jumlah **bisa diubah** (pulang jam 11, bukan 10 = satu jam ekstra) + **tip dengan persen**.
     - Ganti "Decline" jadi **"Already paid"** (cash/Venmo) dan **"Pay through Sprout"**.
     - Copy: "Paid through Sprout. In Casey's bank in 1–2 days." Setelah bayar, Casey dapat SMS konfirmasi + total.
   - **Payout sitter**: setelah booking terkonfirmasi (bukan setelah selesai), Sprout kirim link ke sitter untuk isi
     profil + info bank (Stripe). Hanya kalau sitter belum punya profil/bank. Pilih satu metode dulu: rekening bank.
6. **Carpool sekali** [60:28–66:10]:
   - Anak **satu baris** (seperti baris parent). Header "When is the ride" diganti: pertama pilih anak.
   - Pickup "Home". One way / both ways: "I'm so glad we figured this out finally."
   - Kirim ke beberapa parent sekaligus; **yang pertama Confirm dapat**; sisanya dapat "We're all set, thanks".
   - **Sisi Priya**: hot keys Confirm / Can't make it / Reply, lalu widget konfirmasi "saved to your calendar".
7. **Carpool rutin** [66:10–81:51]:
   - **Cuma dua keluarga** ("five would be like I'm a bus driver").
   - Pilih beberapa keluarga dalam **urutan**, Sprout **tanya satu per satu**: no → keluarga berikutnya, sampai ada yes.
     (Beda dengan sitter yang boleh tanya semua sekaligus.)
   - Setelah yes: usulan jadwal bergiliran ("Here's a fair split"), **organizer bisa ubah sebelum share**. Jangan
     ulang kata "drives" tiap baris. Ganti giliran = minta tukar tanggal ke keluarga lain (nanti; "let's say there's
     no changing right now").
   - **Share** → parent lain dapat "Carpool is set, here's the schedule, added to your calendar". Event dibuat di Sprout.
   - **Pesan di dalam Sprout, bukan SMS.** Demo: orang pertama tidak bisa, orang kedua bisa; tunjukkan agent yang urus.
8. **Website** [81:51–105:47]:
   - Halaman baru lebih bagus, tapi bagian kedua mengulang Daily Brief yang sudah ada di hero. Header "Your school's
     parent community" dapat review campur ("I don't really know what it means"). Tony tidak suka teks hitam + langit
     yang ambigu.
   - Referensi: homefellow.org (visual "banyak hal terjadi").
   - Tony cari carousel Instagram AI lama ("Your people are here to help", ~5 Okt) dengan **foto parent di depan sekolah,
     anak pakai ransel, ngobrol**: "these images are so good... looks so much like where I live." Mau foto seperti itu di hero.
   - Arah di meeting: hero saja dulu, foto penuh, tanpa app ("we wouldn't even need to show the app"), header
     "Meet Sprout, the parent community for your school" + sub soal "it takes a village". Daily Brief belum perlu.
   - **Doc Tony sesudahnya** menetapkan semua copy (lihat tabel W1/W2 di bawah).

## Copy website dari doc Tony (final per doc)

| # | Bagian | Header | Body | Visual |
|---|---|---|---|---|
| 1 | Hero | It takes a village to raise a family. Sprout brings yours together. | Meet the parents at your school. Sprout remembers the little things and helps you get them done. CTA: Join Sprout | Keluarga nyata (pickup sekolah, parent ngobrol), HP dengan Daily Brief di pojok |
| 2 | Problem | It's a lot to keep track of. | New school. New families. New group chats. Plus forms, practices, birthdays, carpools, picture day, spirit week… and somehow it all lives in your head. | Lock screen penuh notifikasi, miring, tumpah ke bawah (6 notifikasi di doc) |
| 3 | Daily brief | Sprout carries the mental load. | Connect your email and Sprout pulls out what matters (deadlines, game times, party invites) into one daily brief. Stop digging through your inbox. Open Sprout, see your day. | Daily Brief dengan item yang sama dengan bagian 2; opsional: notifikasi menyatu jadi brief saat scroll |
| 4 | Assist | What can Sprout take off your plate? | Playdates, babysitters, carpools. Tap what you need and Sprout Assist handles the back-and-forth. | Layar Assist, hanya tile Playdate, Babysitter, Carpool; ikon clay disorot |
| 5 | Community | Every parent in your kid's class, one message away. | No swapping numbers. Join the groups that matter: class, grade, team. Those parents you wave to at drop-off? Now they're your village. | Directory / group chat, wajah ramah (roster demo), opsional foto drop-off |
| 6 | Close | Free for every parent at your school. | See who's already here. CTA: Join Sprout | CTA besar di tengah + cluster avatar, gema hero |

Jangan tampilkan: tile Birthday + Date night, baris "Register my kids", "Saved details / Accounts and cards", feed discovery/event lokal.

## Task Ahmad

### Babysitter (`sitter-v3.js`, `sitter-profile.html`, `live-night.html`)
- [x] **S1** Waktu: default hari ini; slot paling awal = sekarang + 30 menit (dibulatkan ke 30 menit berikutnya)
- [x] **S2** Detail pemakaian pertama: hanya Location (field alamat kosong, placeholder rumah) + Notes, field input bukan pensil; tanpa ulang anak/waktu
- [x] **S3** Add a sitter: tombol "Choose from Contacts" (sheet kontak native), rate/hr opsional, hapus WhatsApp; she/he: lihat pertanyaan terbuka
- [x] **S4** Thread SMS: Sprout + parent + sitter; sitter "yes" → hot key Book Casey; parent balas sendiri → "Looks like you're confirmed"
- [x] **S5** Live Activity: "babysitter", kartu lebih sempit, titik di tengah, indent "Home by / Casey by" sama
- [x] **S6** Bayar: Pay Casey → layar bayar (ubah jam/jumlah, tip 10/15/20% (custom tip belum), Already paid / Pay through Sprout) → rating; SMS konfirmasi ke Casey
- [x] **S7** Payout: SMS ke sitter setelah booking terkonfirmasi, link profil + rekening bank (Stripe), hanya kalau belum ada
- [x] **S8** (sisa dari S6) Tip custom: chip **Other** → sheet "Tip Alex" (ketik dolar, ada contoh 15%); chip jadi "$12", total ikut; chip tip 44px (Ahmad, 21 Nov)

S1–S7: commit `67cf2be`, deploy https://sprout-assist-tasks.vercel.app (`/book-a-sitter/`, `/book-a-sitter-saved/?review=conversation`).

### Website (`sprout-reach-scene-iteration/`)
- [x] **W0** Ambil foto carousel "Your people are here to help" (parent di depan sekolah) dari link yang Tony kirim di meeting; regenerate HD kalau resolusinya kurang
      Foto = `community.png` slide 1 carousel Rainyday (14 Okt, https://sprout-carousel-review.vercel.app/rainyday).
      Asli portrait 1122 px: dipakai untuk HP (`assets/hero-dropoff-portrait.webp`); desktop = versi lebar 16:9
      orang yang sama (Seedream 5.5, flow ElevenLabs "Sprout website hero: parents at drop-off (wide)").
- [x] **W1** Hero baru: foto itu, copy dari doc, HP Daily Brief di pojok, CTA Join Sprout; kirim ke Tony
      Dibangun di `home-v3.html` (section `.hero2.village`), frame inset 2b tetap; hero 2b lama di
      `hero-photo-2026-11-20/v3-before-village/`. Tombol = arrow handoff (`.btn-hand`) + badge App Store/Google Play; HP = foto di atas, copy di panel hijau. Live: https://sprout-reach-scene-iteration.vercel.app/home-v3.html (21 Nov). Commit `f6b3e56`. Belum dikirim ke Tony.
- [x] **W1b** Riset tombol (7 situs) + 3 arah di `button-directions-2026-11-21/`; Ahmad pilih tombol B + badge A
- [ ] **W1c** Kirim link hero ke Tony (Ahmad); sebut copy ikut doc ("It takes a village…"), bukan kalimat di meeting: ada di draf update (pertanyaan 1)
- [ ] **W2** Bagian 2–6 sesuai doc; hapus bagian yang mengulang Daily Brief; Assist hanya 3 tile
- [ ] **W3** Setelah Tony oke: `python3 review/export-site.py`, commit + push `sprout-website`, kabari Mohit

### Playdate (`flows.js`, `other-side.html`, `receiver.html`)
- [x] **P1** Urutan baru: anak paling atas (chip satu baris, tanpa nama kelas) → tanggal (quick options satu baris) → tempat → antar-jemput
- [x] **P2** Widget yang sama di sisi organizer: "Waiting on Megan" tanpa tombol → Confirmed + kalender; pesan Megan tampil di dua sisi; tanpa pesan template
- [x] **P3** Suggest another time: organizer dapat kartu agent dengan jam usulan + Accept / Suggest a different time / Reply

### Carpool (`flows.js`, `carpool-review.html`)
- [x] **C1** Sekali: anak satu baris, header baru, "Home"; first-confirm-wins + pesan "all set" ke sisanya; sisi Priya (Confirm / Can't / Reply → widget kalender)
- [x] **C1b** (Ahmad, 21 Nov) "Can't at 9:30" membuka sheet jam: parent lain centang jam yang dia bisa; Tony pilih "Pick up at 9:45" → pickup pindah, parent itu yang nyetir
- [x] **C2** Rutin: dua keluarga; pilih keluarga berurutan, tanya satu per satu; demo no → yes; jadwal bisa diubah; Share → konfirmasi + kalender; pesan in-app

### Lainnya
- [ ] Kirim jawaban sitter ke Mohit (draf di bawah)
- [x] Build + deploy prototype Assist (sitter baru ada di `/review/`), dicek di browser
- [ ] Kirim link `/review/` + `/other-side/` ke Tony (Ahmad): ada di draf update
- [x] Push branch `assist/sitter-date-night-map` ke GitHub (Ahmad, 21 Nov; HEAD `458288a`, 10 commit)
- [ ] Update ke Tony ≥15 menit sebelum standup: **draf siap** (bagian "Draf update ke Tony" di bawah), tinggal kirim

## Task orang lain

- **Mohit**: build babysitter; lanjut agent registrasi (CAPTCHA di sign up + complete profile, isi field dari data user, Loom).
- **Tony**: pikirkan lanjutan copy website; tetap tes agent tiap hari.

## Keputusan

- Booking sitter paling awal **30 menit dari sekarang**.
- Sitter **per user** (tambah sendiri + simpan dari kelas). Tidak ada daftar sitter global, tidak ada admin master.
- Sitter balas lewat **SMS group thread** dengan Sprout di dalamnya; agent watcher membaca thread.
- Pembayaran: **bayar dulu, baru rating**; jumlah bisa diubah, ada tip; "Already paid" untuk cash/Venmo.
- Info bank sitter diminta **setelah booking terkonfirmasi**, bukan setelah selesai.
- Hero website (Ahmad, 21 Nov): copy di **garis tengah** frame, **HP di pojok dihapus**; tombol = **arrow handoff** (`.btn-hand`) + "or get the app" + **badge resmi** App Store/Google Play; di HP dan tablet portrait: foto di atas, copy di panel hijau.
- Playdate: pilih **anak dulu**; organizer dan penerima lihat **widget yang sama**.
- Carpool sekali: **yang pertama konfirmasi** dapat. Carpool rutin: **dua keluarga, tanya berurutan**, pesan **di dalam Sprout**.
- Website: copy di doc Tony = final; hero pakai **foto parent di depan sekolah**.

## Pertanyaan terbuka

1. **Hero copy**: di meeting Tony bilang "Meet Sprout, the parent community for your school"; doc bilang "It takes a
   village to raise a family. Sprout brings yours together." Ikuti doc (ditulis sesudah, ditandai final)?
2. ~~**Hero visual**~~: terjawab (Ahmad, 21 Nov): HP di pojok dihapus, badge App Store/Google Play di bawah tombol yang bilang ini app.
3. **Bagian 3 "Connect your email"**: Google verification belum disetujui. Kalau belum live saat launch, bagian ini
   melanggar aturan doc sendiri ("only show features that are live at launch").
4. ~~**She/he di Add a sitter**~~: terjawab di transcript [37:13]. Kalimat akhir Tony: "just say if it's a she or a
   he". Tetap She / He (dipakai Sprout untuk "she said so", "send her the address").
5. **Carpool rutin**: kalau keluarga pertama tidak menjawab (bukan "no"), berapa lama sebelum tanya keluarga berikutnya?

## Draf update ke Tony (Ahmad kirim, ≥15 menit sebelum standup)

> Hi Tony, here's where everything from Friday's call stands.
>
> **Review link** (every flow starts from the beginning): https://sprout-assist-tasks.vercel.app/review/
> **Both sides** (your phone next to the other parent's or sitter's): https://sprout-assist-tasks.vercel.app/other-side/
>
> **1. Babysitter** (Mohit is building this now)
> - Defaults to today. The earliest start is 30 minutes from now.
> - First time, it only asks for the address and notes.
> - Add a sitter straight from your contacts. Rate is optional. WhatsApp is gone.
> - The sitter's reply shows in the group text. You can tap Book, or just reply to her yourself and Sprout picks it up.
> - The Live Activity says "babysitter" and the layout is cleaner.
> - Pay first, then rate. Change the hours if she stayed late, add a tip, or mark "Already paid" for cash or Venmo.
> - Right after booking, Sprout texts the sitter a link to add her bank details, only once.
>
> **2. Playdate**
> - Kids first, on one line, no class names. Date and place are one line each, so it stays short.
> - You see the same invite card the other parent gets: "Waiting on Ana", then "Confirmed".
> - If she suggests another time, the card shows both times with Accept, Suggest another time, or Reply.
>
> **3. Carpool, one time**
> - Kids first ("Plan a ride"). The first yes drives, and the others get "we're all set, thanks".
> - The other parent can tap I can drive, Can't at 9:30, or Reply. Can't at 9:30 lets her pick times she could
>   drive, and you can move the pickup to one of them.
>
> **4. Carpool, regular**
> - Two families only. You rank who to ask, and Sprout asks one at a time in Sprout. It only asks the next if the
>   first can't.
> - In the demo Priya can't and Aisha says yes. You get a fair split, change any turn, then share it. Aisha gets the
>   schedule on her calendar.
>
> **5. Website hero** (from your copy doc): https://sprout-reach-scene-iteration.vercel.app/home-v3.html
> - The photo is the parents at drop-off from our carousel, widened for desktop.
> - The phone in the corner is gone. The App Store and Google Play badges under the button show it's an app.
> - Next: sections 2 to 6 from your doc, once you're happy with the hero.
>
> **Two questions**
> 1. Hero line: your doc says "It takes a village to raise a family. Sprout brings yours together." On the call you
>    said "Meet Sprout, the parent community for your school." I used the doc. Keep it?
> 2. Section 3 of the doc says "Connect your email". If Gmail isn't approved by launch, should we hold that section?

## Draf pesan ke Mohit (Ahmad kirim)

> Mohit, answers on babysitter from today's call:
> 1. Earliest start: 30 min from now, rounded to the next half hour. Default date is today.
> 2. Location and notes are empty the first time. Show input fields, not an edit pencil. We assume home; if we
>    don't have an address yet, ask for it.
> 3. No master sitter list or admin. Sitters are per user: ones they add (from phone contacts) plus ones they save
>    from their class. Never show other parents' sitters by default, so no location filter needed.
> 4. The sitter has no app. Sprout starts a group text (Sprout + parent + sitter) and the agent watches it. Sitter
>    says yes → parent gets "Book Casey". Parent confirms in the text themselves → Sprout marks it confirmed.
> 5. After booking: if the sitter has no payout info, Sprout texts them a link to add their bank details (Stripe).
> 6. After the job: Pay first (edit hours/amount, add tip, or "Already paid"), then rating.
> 7. Add a sitter: "Choose from Contacts" fills name + number. Rate is optional (the sitter can give it in their
>    reply). No WhatsApp, text only.
> Screens: /book-a-sitter/ (first time) and /book-a-sitter-saved/?review=conversation (pay + rate via the demo clock).
