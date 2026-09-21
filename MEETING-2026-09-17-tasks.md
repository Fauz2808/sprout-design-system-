# Meeting 2026-09-17 — Room Parent, Onboarding, AI Flows

Hadir: Tony, Mohit, Syed, Ahmad. Sumber: `Room Parent, Onboarding, and AI Flows Transcription.vtt`.

**Deadline konteks:** Tony bilang "two more workdays before the room parent meeting".
Mohit target sign-up flow beres Jumat. Jadi S-* dan O-* harus siap sebelum meeting itu.

**Urutan prioritas dari Tony (harfiah):** 1) sign-up link · 2) website · 3) AI flows —
dengan catatan "consider website and the AI thing kind of on the same level".

---

## P0 · Sign-Up Link — tipe sign-up baru

File: `01 - Website/room-parent-portal-redesign/index.html` → `#sec-signups`, editor `#slotEditor`.
Sekarang builder-nya maksa "Dates & Time Windows" untuk semua sign-up.

- [x] **S1** Tipe sign-up jadi pilihan, bukan satu bentuk:
  - (a) Time windows — yang sekarang, tetap ada
  - (b) Tanpa waktu / sepanjang durasi event — parent cuma daftar, nggak pilih slot
  - (c) Supply list — room parent list barang ("tiny pumpkins", "confetti"), parent klaim item
- [x] **S2** Field input bebas buat room parent ngetik item/kebutuhan (Tony: "you need to input an actual field so I can type in what it is")
- [x] **S3** Sisi parent: tampilan klaim item di halaman link + di email (`su-view-share` preview + `todo`/email template)
- [x] **S4** Detail view: kolom "Time Windows & Volunteers" harus adaptif — jadi "Items & Who's Bringing" kalau tipe supply
- [ ] **S5** Tunggu screenshot contoh dari Tony ("I'll get a screenshot from the room parent") — jangan blokir, bikin konsep duluan

**Status 17 Sep:** S1–S4 selesai di `index.html`, 12/12 smoke test lolos, spec di
`spec/21-sign-up-kinds.md`. Belum di-review Tony, belum di-release.

## P0 · Onboarding Room Parent → subgroup yang sudah ada

- [x] **O1** Di step pilih grade, tampilkan subgroup yang **sudah dibuat** di grade itu supaya RP bisa *join*, bukan bikin duplikat. Kasus Tony: Ms. Taylor & Ms. Cruzona sudah ada di 1st grade.
- [x] **O2** Empty state: kalau belum ada subgroup di grade itu → jalur create
- [x] **O3** RP yang join lewat jalur ini langsung jadi admin subgroup
- [ ] **O4** Onboarding portal = onboarding Sprout. Setelah selesai, status di CMS parents = **"on the app"**, bukan "email only" (Mohit sudah konfirmasi, cek copy-nya)
- [x] **O5** Tanpa autentikasi dulu — keputusan Tony, sadar risikonya, bukan bug

**Status 17 Sep:** O1/O2/O3/O5 ternyata SUDAH kebangun di `auth-classgroup`
(`index.html`) dan lolos verifikasi 5/5 — bukan gap desain. Yang kurang cuma
ketegasan spec buat Mohit, sudah ditambah di `spec/18-new-room-parent-onboarding.md`
("Re-confirmed on 17 September"). O4 tinggal di sisi Mohit.

Folder terkait: `08 - Generated Screens/Room Parent Portal/onboarding-review`, `08 - Generated Screens/Onboarding/`.

## P1 · AI Assist (Sprout Assist) — revisi flow suara

File: `08 - Generated Screens/AI Assist/ai-assist-all-flows.html` (yang di-review Tony),
+ `create-reminder-flow.html`, `club-create-voice-prototype.html`.

Masalah inti: nggak ada cara berhenti merekam, dan layar rekam kebanyakan nunjukin isi.

**Status 17 Sep:** A1–A8 dibangun di `08 - Generated Screens/AI Assist/reminder-flow-v2.html`
(6 panel, arah "satu tombol jangkar"). Arah di-ACC Ahmad 17 Sep.
A9 + A10 di `event-note-flow-v2.html` (8 panel: Event 4, Note 4). Belum di-review Tony.
A11 di `voice-capture-alternatives.html` — 3 alternatif (sheet / auto-start / canvas)
disandingkan sama baseline. Belum ada yang dipilih. Sisa: A12 carpool parkir.

- [x] **A1** Kontrol stop eksplisit: start → rekam → tap to stop (check mark). Pola referensi: Wispr Flow (record button → check button).
- [x] **A2** Tombol **nggak boleh loncat posisi** antar state. Tony: "I don't like that this button jumps from here to here... should just stay on the same plane." Pertimbangkan naikin posisinya.
- [x] **A3** Buang "Caught so far" sebagai checklist live — n8n baru jalan setelah selesai ngomong, jadi nggak mungkin live. Ganti jadi pengingat statis 3 hal.
- [x] **A4** Layar rekam = *listening mode* doang. Jangan tampilkan transkrip live. Tempat edit ada di layar Review.
- [x] **A5** Urutan copy dibalik: **hint di atas** ("Who's it for? What's it about? When's it happening?") → **contoh di bawah**, dalam kutip: *"Remind my husband to pick up Presley from school at 2PM today."* Bracket dipertahankan sebagai sinyal "ini bisa diganti" (Ahmad usul, Tony setuju).
- [x] **A6** Copy kecil: "Hold the button…" → "Tap to stop."; tanda seru → titik.
- [x] **A7** Review Reminder: recipient (spouse) ke-select otomatis, avatar sesuai gender (husband = cowok), field teks aktif dengan kursor dari awal, hapus tombol **Save reminder**, kartu jangan fixed-height — margin mati dibuang, tumbuh kalau teks panjang. Time = optional.
- [x] **A8** **Lanjutkan flow setelah "Reminder is set"** (permintaan eksplisit Tony):
  - layar push notification yang diterima pasangan, lengkap dengan copy-nya
  - layar Daily Brief pasangan yang ter-update
  - timing notifikasi ±15 menit sebelum jam acara
- [x] **A9** Flow Notes: hapus tombol "Save notes"; kursor cuma aktif di field utama; bikin state "Attach link" (keyboard + tombol Paste native)
- [x] **A10** Flow Event: heading "What's it about?" → **"What?"** + contoh; satu layar dihapus ("this, we're just gonna delete")
- [x] **A11** Eksplorasi UI alternatif buat voice capture — Ahmad yang usul, Tony approve, tetap pakai pola contoh kalimat karena "these are all new users"
- [ ] **A12** Parkir: **Carpool** (Tony: "gonna get a little tricky, need to think"). **Birthday** sudah oke. Group title/description oke.

## P1 · Website

- [ ] **W1** Tony belum kasih detail di meeting ini, cuma "we have the website stuff to do". Canonical sekarang `roomparent-com-landing-v2.html`. → **butuh konfirmasi scope dari Tony**

## P2 · Notifikasi — nggak ada rumahnya

**Status 17 Sep:** N1+N2 di `08 - Generated Screens/Notifications/join-request-and-notifications-door.html`
(5 panel). Temuan: layar Notifications-nya nggak pernah dihapus, cuma kehilangan pintu
pas nav restructure. Jadi ini perbaikan pintu, bukan desain ulang. Belum di-review Tony.
**Revisi 17 Sep malam:** header di prototipe itu karangan. Header asli = avatar kiri +
judul tengah + SATU ikon kalender. Versi yang benar ada di
`Home/daily-brief-collapse-and-bell.html`, di-port dari frame Figma 7.1, sekalian
nunjukin F2 (collapse) di atas desain sungguhan.

Icon notifikasi di Daily Brief sekarang masuk ke layar kalender. Kalender **tetap dipertahankan** (alasan Tony: parent lihat jadwal sendiri tanpa keluar app, kalender anak di-overlay). Akibatnya notifikasi nggak punya tempat.

- [x] **N1** Tentukan di mana notification center tinggal setelah nav restructure
- [x] **N2** Minimum yang wajib jalan: request join club → push ke admin → tap → layar approve/deny (sekarang cuma ada di subgroup info). Tony: "if you don't put it in here, the guys will forget."

## P0 · Shared to-do suami-istri (task inti, masuk 17 Sep malam)

- [x] **SP1** Blok to-do pasangan di bawah punya sendiri di Daily Brief — dua-duanya
  kelihatan di dua HP. Tony: *"if we can get the spouses using it with the reminders,
  that's half the battle."*
- [x] **SP2** Aturan lipat: list yang sudah beres melipat, yang belum tetap terbuka —
  jadi layar selalu membuka pada apa yang benar-benar tersisa, punya siapa pun itu.
- [x] **SP3** Baris pasangan pakai titik status, bukan checkbox. Kotak persegi = punyamu
  dan bisa ditap, lingkaran = punya dia dan tidak. Nggak bisa nyentang kerjaan orang lain.
- [x] **SP4** State telat + tombol Nudge (kirim push, bukan ngedit list dia).
- [ ] **SP5** Perlu Tony: Nudge selalu ada atau cuma muncul pas telat, dan apakah
  pasangan tahu dia di-nudge. "Silent nudge" beda produk dari "Tony poked you".

File: `08 - Generated Screens/Home/daily-brief-spouse-todo.html` (3 panel, di atas frame 7.1).

## P2 · Sudah di-approve, siap handoff

**Status 17 Sep:** ketiganya beres. Catatan serah terima buat Syed + Mohit ada di
`08 - Generated Screens/HANDOFF-2026-09-17-approved.md`. F1 copy sudah diperbaiki di
prototipe (`Join 2`, bukan `Join — 2 of us`). F2 ternyata sudah kebangun di
`daily-brief-homepage.html`. F3 cuma keputusan, nggak ada kerjaan.

- [x] **F1** Join event popup (siapa yang ikut: myself/spouse/kids) — approved. Fix copy: **"Join 1"**, **"Join 5"** — buang "of us".
- [x] **F2** To-do collapsible kalau sudah selesai — approved ("that's a great idea")
- [x] **F3** Logo Sprout Assist — approved apa adanya, jangan bikin logo terpisah yang harus dimaintain

## P3 · Usulan Ahmad yang di-approve

**Status 17 Sep:** M1 selesai di `feature-map.html` (root repo). 54 fitur, 5 permukaan,
dependensi digerakkan satu blok JSON di atas file. Klik kartu = lihat apa yang rusak
kalau dihapus. 5/5 test lolos.

- [x] **M1** Feature map / IA doc: daftar semua fitur + irisannya, biar kelihatan dampak kalau nambah/hapus fitur. Tony: "I like that."

---

## Punya Mohit / Syed (track aja, bukan kita)

- CMS to-do section dinamis → target besok, lalu mulai sign-up flow (target Jumat)
- Consent form submit → auto-create parent di list Parents, tanpa tombol perantara
- Permission matrix: grade = nggak ada invite/add/edit; club & subgroup = admin dapat Edit + Add parent, member cuma Invite
- Dashboard: blok Gmail makan 3/4 lebar → dihapus (compose sudah punya)
- Email masuk spam karena dikirim dari inbox baru Tony, bukan lewat SDK — Tony pakai Gmail lamanya

## Perlu dikonfirmasi

- [ ] **C1** Halaman chat web buat parent email-only yang klik "Join group chat" di email — Mohit bilang "I need a design to build it", Tony kira sudah dikirim. Desainnya ada atau belum?
- [ ] **C2** Scope "website stuff" (W1)
- [ ] **C3** A5: contoh dalam kutip **dan** bracket sekaligus — perlu dilihat bareng di layar, Tony sempat bolak-balik soal ini
