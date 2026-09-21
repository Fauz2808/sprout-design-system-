# Meeting 2026-09-18 — Sprout & Room Parent Launch Readiness

Hadir: Tony (nyetir, nggak bisa lihat layar), Mohit, Syed, Ahmad.
Sumber: `Sprout and Room Parent Launch Readiness Transcription.vtt`.
Lanjutan dari `MEETING-2026-09-17-tasks.md`.

## Tanggal yang mengikat

| Kapan | Apa |
|---|---|
| 19 Sep (besok) | Mohit: sign-up flow + consent→parents. Tony terbang, **nggak ada meeting**, update lewat chat |
| **23 Sep** | Room parent beneran mulai masukin kontak orang tua di roomparent.com |
| 29 Sep | Kelas Tony mulai |
| Minggu depan | Build iOS baru, setelah modul statis (social clubs, grades) dibikin dinamis |

Mohit: **jangan push build iOS minggu ini.** Masih banyak yang statis, dan dia full di CMS.

---

## P0 · Nyala di roomparent.com — belum selesai padahal dikira selesai

- [ ] **L1** Lunch menu **belum hilang semua**. Mohit bilang "lunch menus, I removed it",
  Tony jawab "I took a look, it looks good". Gue render DOM live-nya: hero sudah bersih,
  tapi **dua FAQ masih nyebut lunch menu**:
  1. *"Master-level info like the school-wide lunch menu is intentionally shared across classes"*
  2. *"no rebuilding the calendar or lunch menu from scratch"*
  Dua string pengganti sudah gue siapkan 17 Sep, tinggal kirim ulang ke Mohit.
  Ini persis pola yang sama: yang kelihatan dibenerin, yang di FAQ ketinggalan.

## P0 · To-do & reminder — Tony bilang sendiri ini masalah UI

Diskusi terpanjang di call ini, dan Tony menutupnya dengan:
*"It's more of a UI problem than anything, on how we would show that."* Artinya bola di kita.

- [ ] **T1** **Reminder harus hidup sampai due date, bukan cuma muncul di tanggalnya.**
  Sekarang catatan tanggal 1 dengan due date 7 cuma nongol tanggal 1. Mohit: *"This is not done"*,
  dan dia akan kerjakan dari backend. Yang perlu didesain: tampilannya selama rentang itu.
- [ ] **T2** **Reminder dari portal tanpa tanggal kalender.** Tony cuma isi due date, nggak perlu
  milih hari di kalender. Tampil sampai due date, lalu hilang hari berikutnya.
- [ ] **T3** **Yang sudah dicentang tetap kelihatan dulu.** Alasan Tony spesifik dan langsung
  nyambung ke blok pasangan yang kita desain kemarin: *"if I'm someone's spouse and I wanna see
  that my wife already finished it, I want it to still be there."*
- [ ] **T4** **Tapi akhirnya harus pergi.** Tony: sekitar 24 jam setelah dicentang.
  Mohit usul jangan dihapus tapi dipindah ke section **History**, alasannya: *"if I come after
  one week and my details are gone, it's a little bit confusing."* Tony setuju.
  → Perlu desain: di mana History tinggal, gimana bedanya di app vs portal, dan apakah
  blok pasangan juga punya History sendiri.

Ketiganya satu paket. Jangan didesain terpisah, karena satu item bergerak melewati
keempat state itu: hidup → lewat due date → dicentang → masuk history.

## P0 · Halaman event publik

- [ ] **E1** Mohit: link event dari CMS harusnya buka roomparent.com dengan event itu,
  dan *"that page is also pending in terms of design."*
  **Tapi desainnya sudah ada** — `event-preview.html` di repo portal, URL shape-nya sudah
  diputuskan (`roomparent.com/e/<classId>/<eventId>`) dan tertulis di `spec/15-public-pages.md`.
  Jadi ini kemungkinan besar bukan kerjaan desain baru, tapi **lubang serah terima** —
  kelas masalah yang sama dengan C1 (web group chat). Konfirmasi ke Mohit dulu sebelum
  menggambar apa pun.

## P1 · Feedback Tony ke desain AI — dan dia belum lihat apa-apa

Tony nyetir waktu meeting, jadi dia komentar dari ingatan/Loom, bukan dari layar.

> *"At least what I'm seeing with the AI generated UI looks like, I don't wanna go that path.
> So hopefully you have a different UI that you're working on. I love the blob. The blob just
> isn't the whole thing at all. It's actually more important to show people how to use it, for
> a specific use case, versus have a big blob."*

- [ ] **AI1** **Perlu diklarifikasi dulu sebelum dikerjakan.** "AI generated UI" bisa berarti
  dua hal yang jauh berbeda: (a) UI untuk fitur AI Assist, atau (b) UI yang digenerate AI,
  alias hasil eksplorasinya. Arah kerjanya beda total. Tanya Tony.
- [ ] **AI2** Yang jelas dan bisa dikerjakan sekarang: **orb bukan isi layar.** Yang mengajari
  cara pakai lebih penting. Ini menguatkan keputusan 17 Sep — contoh kalimat naik ke atas,
  orb mengecil. Kalau desain yang dia lihat masih menempatkan orb sebagai hero, itu yang ditolak.
- [ ] **AI3** Yang dia suka dan jangan diubah: warna hijau + animasi blob hasil adaptasi.
  *"I really like how Claude was able to take that example of the blob and turn it into our green."*

## P1 · Sisa daftar Ahmad yang Tony baca di call

- [ ] **W1** Website design — masih tanpa scope detail, Tony bilang akan lihat
- [ ] **EV1** **Link website di halaman Events** — permintaan lama Tony, sekarang hilang.
  Tony: *"because we don't have that anymore."* Implementasi ulang.
- [x] **SP** Spouse to-dos — sudah dibangun 17 Sep, Tony konfirmasi ini buat Daily Brief,
  belum dia review

## Proses

- [ ] **P1** Tony minta **Loom**. Dia nggak sempat buka apa pun dan bilang akan banyak feedback.
  Kalau update dikirim sebagai file, dia nggak akan lihat. Kirim Loom.

---

## Punya Mohit / Syed (track, bukan kita)

**Sudah jalan:** bug event→invite→chat sudah diperbaiki · CMS sudah deploy, to-do dinamis dan
responsif termasuk mobile · profile image dikompres · TestFlight sudah dipush.

**Sedang dikerjakan:** sign-up flow (target besok sore, prioritas utama) · consent form →
otomatis masuk daftar Parents (besok) · verifikasi domain roomparent.com ke Google untuk
branding email (propagasi 48 jam, besok atau Senin).

**Belum:** donation links masih section lama · modul statis di app (social clubs, grades) ·
due-date logic di backend · Syed: isu timezone.

**Blocker yang bukan teknis:** Mohit masih pakai akun GitHub pribadinya, nunggu akun dari Tony.
Tony akan urus di pesawat. Selama belum pindah, kerjaan Mohit nggak ada di organisasi.

## Konteks pasar dari Tony

Room parent lain sudah lihat portal dan terkesan. Hambatannya bukan fitur tapi kepercayaan:
room parent veteran sepuluh tahun sudah punya sistem sendiri dan takut kehilangan data di
platform yang belum terbukti. Strategi Tony: dia sendiri jadi room parent dan membuktikan
dari dalam.

Tony juga mulai bikin **UGC video series** — lima pain point orang tua, satu video per
pain point, Sprout sebagai obatnya. Dia nulis skrip pakai LLM. Belum ada permintaan ke kita,
tapi pola lama berlaku: shot UI di video sebaiknya pakai mockup HTML, bukan hasil generate AI.
