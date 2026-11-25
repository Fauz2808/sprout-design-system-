# Meeting 2026-11-25 (Selasa 24 Nov US): prioritas produk, share sitter di class chat, App Store, review website

Hadir: Tony, Mohit, Ahmad.
Sumber: `MEETING-2026-11-25-transcript.vtt` (salinan dari `~/Downloads/Sprout Product Priorities and Website Review Transcription.vtt`)
+ DM Tony ke Ahmad (25 Nov): "little profiles over the people standing there talking" + 4 catatan website (di bawah).
Lanjutan dari `MEETING-2026-11-21-tasks.md`.
Website: `01 - Website/sprout-reach-scene-iteration/home-v3.html` (basis, hero foto besar yang Tony suka).
`home-scroll.html` / `home-stories.html` = versi 24 Nov yang Tony lihat sebagai "the other one".
Assist prototype: `08 - Generated Screens/AI Assist/task-first-assist/`. App Store: `08 - Generated Screens/App Store/screenshots-v15-people.html`.

## Prioritas tim (Tony, penutup meeting)

1. **Google verification = prioritas nomor satu** tiap kali Google minta sesuatu. Mohit kirim video full flow + akun test besok; review 7 hari.
2. **Sprout Assist tanpa integrasi dulu**: babysitter, lalu playdate, lalu carpool (Mohit + Syed). Sitter backend sudah ~60%.
3. **Registrasi olahraga** menunggu public API dari Mark (Tony kirim video "cara bikin public API key"). Field registrasi (5 langkah setelah login) sama untuk semua event, jadi bisa di-handle di sisi API, tanpa database dulu.
4. Website: lebih banyak elemen manusia, empat inti: **Daily Brief + Gmail, Sprout Assist, class chat, directory**.

## Task Ahmad

| # | Task | Asal | Selesai kalau |
|---|---|---|---|
| **W1** | Profil kecil di atas orang-orang di foto hero | DM Tony + gambar referensi | Tiap orang di foto punya chip profil (nama, "X's mom/dad · kelas"), muncul bergantian, tidak menutup wajah, rapi di HP |
| **W2** | Bagian "mental load": notifikasi muncul di sekitar kepala seorang parent, lalu tersedot jadi satu UI (Daily Brief). **Satu transisi bersih**, pin pendek, tidak ada keadaan setengah jalan yang terlihat rusak | Meeting [29:16–35:24] + DM ("pins in place for about half the page") | Scroll berhenti di mana pun, layar tetap terlihat utuh |
| **W3** | Phone Daily Brief di website: cuaca ada, yang **hari ini di atas**, "Due Friday" di bawahnya, 1–2 to-do supaya muat, Happening Today pakai UI app terbaru | Meeting [22:56–24:09] | Semua section muat di atas tab bar |
| **W4** | Tap to-do → sheet naik: ringkasan bullet + link ke email asli + **Mark as done** → kembali ke brief | Meeting [24:09–25:27] | Bisa diklik di website, ada state done |
| **W5** | Assist: tiga tile tetap + baris kecil **"Coming next: date nights, tutors, summer camp and sports registration"** + satu happy path (sitter atau carpool) yang pendek | DM + meeting [35:24–42:40] | Tidak ada flow yang terpotong, tidak menjanjikan yang belum live |
| **W6** | Community: tambah **parent directory** (wajah + nama anak + kelas), bukan cuma chat | DM + meeting [26:52–27:40] | Directory terlihat sejajar dengan chat |
| **W7** | "Join Sprout" lalu "or get the app" terdengar seperti dua hal berbeda | DM | Satu aksi, satu kalimat |
| **A1** | App Store screenshots: **9 → 6 slide**. Urutan: preview (parent community), Gmail (school emails in, your day out), Daily Brief, Assist (playdate, sitter, carpool; tanpa registrasi), class chat, directory. Buang: Find events, Plan important moments, Invite families | Meeting [15:00–21:44] | V.15 enam slide, copy Assist tanpa sports/camps |
| **A2** | Share sitter di class chat: mulai dari **Choose from contacts** (multi-pilih, add to list, gampang tambah lagi), bukan dari daftar sitter tersimpan ("no one's gonna have them"). Tersimpan ke sitter si pemberi + dikirim **privat** ke yang minta | Meeting [11:03–13:58] | `/sitter-class-chat/` + `/sitter-v3-share/` mulai dari kontak. Kirim URL ke Mohit |
| **A3** | Happy path sitter: setelah "Book Alex" cukup satu ringkasan: "Alex is booked. I let Sam know you found someone. Added to your Daily Brief. When Alex is done, pay and rate here." | Meeting [38:13–39:53] | Tidak ada log pesan ke Jake/Sam di atasnya |
| **A4** | Happy path carpool: UI pilihan anak/jenis ride **sama** sebelum dan sesudah preselect; **tanpa penyesuaian jam** di happy path ("Priya can pick up Jake") | Meeting [40:26–42:30] | Dua langkah pakai komponen yang sama; Priya langsung setuju |

## Task orang lain

| Siapa | Task |
|---|---|
| Mohit | Video full flow + detail akun test untuk Google (besok, babak pertama); cek dulu supaya tidak bolak-balik 7 hari |
| Mohit + Syed | Selesaikan flow book a sitter (backend + UI), termasuk watcher balasan SMS/WhatsApp |
| Mohit | OTP saat registrasi: ambil dari Gmail kalau user sudah connect |
| Tony | Video ke Mark untuk public API key (SSC Kids) |
| Tony | Kirim catatan website tambahan ke Ahmad |

## Catatan Tony (DM, apa adanya)

- Chat section tidak menyebut parent directory. Wajah + nama anak, bukan nomor acak, itu yang bikin lebih dari WhatsApp.
- Scroll animation terlalu rumit: cerita notifikasi pin setengah halaman; berhenti di tengah = notifikasi menumpuk di atas brief dan terlihat rusak. Satu transisi bersih lebih baik.
- Cerita Assist yang lebih besar belum ada: baris kecil "Coming next: date nights, tutors, summer camp and sports registration" di bawah tiga tile.
- "Join Sprout" lalu "or get the app" terdengar seperti dua hal berbeda.

## Status (25 Nov)

| Task | Status | Di mana |
|---|---|---|
| W1 Profil di foto hero | **Selesai**. 4 chip (Dan Ellis, Jess Moreno, Grace Lin "New", Ben Carter), avatar = wajah dari foto itu sendiri, ikut drift foto. HP: 2 chip | `home-v3.js` (PEOPLE), `home-v3.css` (1c) |
| W2 Mental load | **Selesai**. Foto mom di dapur + 8 notifikasi di sekitar kepala → satu transisi (0,9 dtk) ke Daily Brief. Pin 460vh → 220vh (HP 200vh). Tidak ada state setengah jalan | `home-v3.html` #problem, `assets/mental-load-mom.webp` (crop dari App Store `kitchen-phone.webp`) |
| W3 Brief di phone | **Selesai**. Cuaca, to-do Today dulu lalu Due Fri (2 saja), Happening Today pakai `db2-hap`, muat di atas tab bar | `home-v3.js` TODOS |
| W4 Sheet to-do | **Selesai**. Tap → ringkasan 3 bullet + "Email from the School Office" (buka email asli) + Mark as done; kotak centang langsung juga bisa | `home-v3.js`, `.td-*` |
| W5 Coming next | **Selesai** (baris di bawah tiga tile). Happy path di website **menunggu Tony pilih** sitter atau carpool (A3/A4) | `.plate-next` |
| W6 Directory | **Selesai**. Kartu Member Directory (wajah + nama anak + kelas) di atas foto piknik + satu kalimat baru di copy community (**cek ke Tony**, copy doc-nya "final") | `.dir-card`, `.kin-dir` |
| W7 Join vs get the app | **Selesai**. "or get the app" dihapus, badge langsung di bawah Join Sprout | `home-v3.html` hero |
| A1 App Store 6 slide | **Selesai**. Urutan: community, Gmail, brief, Assist, class chat, directory. Subline Assist tanpa sports/camps. Layar Assist baru `assist-home-launch.png` (cuma Playdate / Babysitter / Carpool, tanpa Date night, Birthday, Register my kids, Saved details) | `screenshots-v15-people.html`, `tools/export-v15.mjs` |
| A2 Share sitter dari kontak | **Selesai**. Sheet mulai dari "Choose from contacts" (multi-pilih, "Add Casey and Mia"), lalu "Add another from contacts"; ketik manual = link kecil; sitter tersimpan muncul di bawah sebagai "Your sitters", tidak tercentang. Konfirmasi: "shared privately with Tony" + "saved to your sitters". Review route baru `/sitter-v3-share-saved/` | `app/sitter-v3.js` `shareSheet()`, `pickContact({multi})` |
| A3 Ringkasan setelah Book | **Selesai**. Satu pesan: "Alex is booked. I let Sam know you found someone. It's in your Daily Brief. When Alex is done, you'll pay and rate here." + kartu booked. Log teks ke Alex/Sam dihapus dari chat Tony (SMS tetap terkirim). Link payout pindah ke kartu booked | `sendAndBook` |
| A4 Carpool happy path | **Selesai**. "One way or both ways?" sekarang baris tap-langsung seperti "Pick up from / Drop off at" (tanpa preselect, tanpa tombol Find families). Priya langsung bisa: "Priya can pick up Jake". Cabang ganti jam tetap ada di `/plan-carpool-new-time/` | `cpWay`, `app/flows.js`, `build.py` |

Cek: `node review/home-v3-shots.mjs http://localhost:4320/home-v3.html` → ok (desktop 1440 + phone 390, tanpa overflow, 8 notifikasi tampil, brief muat, sheet terbuka).
Assist: `python3 build.py` (50 route), semua route yang disentuh + `/review/`, `/review-all/`, `/other-side/` dibuka headless tanpa error. Belum dites ujung ke ujung: share dua HP terhubung (`/other-side/` baris 6); sitter dari kontak tidak punya foto (avatar huruf).
App Store: export ulang semua device (6 PNG per device). File lama 7–9 + zip lama dipindah ke `exports/v15/_old-9-slide/` (tidak dihapus).

### Putaran 2 (review Ahmad, 25 Nov)

| Task | Status | Di mana |
|---|---|---|
| W1b Chip hero kepotong / wajah tidak kelihatan | **Selesai**. Avatar = crop wajah yang dipotong rapi (`assets/hero-faces/*.webp`), ukuran chip ikut skala foto, chip dijepit di dalam bingkai dan tidak menabrak copy | `home-v3.js` place(), `.tag` |
| A1 dibangun ulang sebagai **V.22** di atas V.21 (bukan V.15) | **Selesai**. Salah saya: brief ke helper pakai V.15 karena handoff 24 Nov masih menyebutnya "current", padahal Tony sudah lihat V.16–V.21. V.22 = slide 1 animasi V.21 (ikon terbang dari clover), lalu foto besar V.20/V.21: Gmail, Daily Brief keluarga (Tony, Dana, berdua; dari brief Prod yang dikode), Assist launch (Pick up where you left off + 3 tile), class chat, directory. Status bar + Dynamic Island sama di setiap phone. Logo = tile clover 24 Nov | `screenshots-v22-people.html`, `tools/make-brief-family.mjs`, `tools/make-assist-launch.mjs`, `tools/export-v22.mjs`, `exports/v22/` (6.9″ + 6.3″) |
| A5 Sitter lewat class group, semua sisi | **Selesai**. Baris 06 `/other-side/#sitter-class` = 4 phone terhubung: Tony (minta lewat class group, terima sitter yang dibagikan, Book), Priya di class chat (post muncul live + Share a sitter), Aisha di lock screen (push → buka chat), sitter di Messages (group text, "Yes, I'm free!", lalu teks booking + link payout). Share dari dua parent sampai ke Tony. Tidak ada di `/review/` | `app/other-side.html`, `app/sitter-v3.js` (`classChatLinked`, `classGroup`), `app/receiver.html` |

| W2b Mental load gaya Homefellow (ref: homefellow.org bagian kedua) | **Selesai**. Foto baru: mom cemas (tidak tersenyum) pegang HP, suami + anak sarapan di belakang (Seedream 5.5, ElevenLabs flow `AV1bdo8NrSJDndYGENWK`), scene 4:3. Notifikasi tidak lagi muncul sekaligus: keluar kecil dari atas kepalanya dan melayang pelan menyebar ke dinding dapur, loop 9 dtk, kurva yang sama dengan ikon slide 1 App Store V.21. Wajah tidak pernah tertutup (desktop + HP). Transisi ke Daily Brief tetap satu kali | `assets/mental-load-mom-worried.webp`, `home-v3.css` `note-rise`, `home-v3.js` LANES |

| W2c Notifikasi menutupi wajah mom | **Selesai**. Mulai dari tepi atas foto di atas kepalanya, semua lane naik ke atas dan boleh keluar dari foto; foto diturunkan sedikit di kolomnya. Wajah tidak tertutup di desktop + HP | `home-v3.css` (`--oy`, `--up`), `home-v3.js` LANES |
| W6b Directory + phone menutupi foto piknik | **Selesai**. Foto utuh 3:2 lebar penuh; phone Chat dan kartu Member Directory (2 baris) hanya di tepi bawah foto, ukurannya ikut kolom (cqw). Wajah kelihatan | `.kin-visual`, `.dir-card` |
| W8 Foto CTA penutup beda dari hero | **Selesai**. Foto baru: seluruh sekolah saat pickup sore (Seedream 5.5) | `assets/finale-pickup.webp` |

Pertanyaan Ahmad: apakah Tony setuju tanpa demo happy path di website? **Tidak.** Di meeting [35:24–36:27] Tony minta satu flow happy path di bagian Assist ("pick one of these to kinda show... super happy path"), lalu [42:30–42:40] "Let's make the happy paths better for babysitter and carpool. And then we'll decide which one might make sense." Jadi keputusannya ditunda (Tony pilih), bukan dibuang. Happy path sitter + carpool di prototype sudah dirapikan (A3/A4); demo di website belum dibangun.

| W5b Demo happy path di website, sebagai **opsi** | **Selesai, dua link terpisah.** Opsi A = `home-v3.html` (tanpa demo, sesuai feedback yang sudah dikerjakan). Opsi B = `home-v3-carpool.html`: bagian Assist = 3 tile (Carpool "Playing") + Coming next, dan phone yang menjalankan prototype Assist asli lewat happy path carpool sekali jalan (One time → Sabtu 9:30 → Home → Soccer → One way → Post in Jake's team chat → "Priya drives Jake"), caption per langkah, mulai saat terlihat, Play again + ulang otomatis. Carpool dipilih karena Tony: "The carpool one seems pretty happy path to me" [36:14] | `home-v3-carpool.html`, `assist-demo.js`, `assist-demo.css`, `vendor/assist-story/runtime.html` (diekspor ulang dari prototype terbaru) |

| W3b Phone Daily Brief di website = Prod BRIEF-10 | **Selesai** (dua opsi). Dicek ke Figma `16180:365329`: Happening today dengan baris deskripsi, "Coming up" → **Upcoming events** ("Mon · Added by Tony"), "Messages" → **New messages** berupa daftar ("34 unread in Ms. Rivera's Class", "1 message from Priya Shah", nama digaris bawahi). Tetap muat di atas tab bar | `home-v3.js` brief, `.st-msgs` |

| W3c Brief di website = sudut pandang mom | **Selesai** (dua opsi). Dari BRIEF-10 tanpa banner SSC Kids dan tanpa Invitations: avatar header + "Morning, Dana" = wajah mom di foto; To-Do keluarga (punya mom, punya suami, dan satu berdua; wajah dipotong dari foto scene `assets/brief/scene-*.webp`), centang "seen" seperti Prod; Happening today kartu baru; Upcoming events. New messages dilepas supaya muat di atas tab bar. Avatar Tony tidak dipakai | `home-v3.js` TODOS + brief |

| W3d Avatar mom dibuat ulang | **Selesai**. Foto profil baru dari wanita yang sama di foto scene (gemini-3-pro-image dengan foto scene sebagai referensi, 1.827 kredit), tersenyum ke kamera, dipotong persegi → `assets/brief/scene-mom.webp` (header, To-Do, baris miliknya, sheet) | dua opsi |
| W5c Opsi B jadi scrollytelling | **Selesai**. Bagian Assist di `home-v3-carpool.html` di-pin; 6 langkah kiri (aktif disorot), tiap langkah satu potongan scroll yang mengetuk tombol prototype asli di phone dan chat ikut bergulir. Scroll balik memutar ulang ke langkah itu. HP: caption langkah di atas phone. Autoplay lama (`assist-demo.*`) dihapus | `assist-scrolly.js/.css`, `vendor/assist-story/guide.js` |

| W5e Opsi B: carpool saja | **Selesai + deploy**. Tiga tile tetap tampil, hanya Carpool yang jalan (3 langkah); Playdate/Babysitter disimpan di kode untuk dinyalakan lagi. Kedua opsi live: sprout-reach-scene-iteration.vercel.app/home-v3.html (A) dan /home-v3-carpool.html (B) | `assist-scrolly.js` |
| W5d Opsi B: tiga happy path, "tiles as chapters" | **Selesai** (pilihan Ahmad: tiles as chapters, 3 langkah inti per flow). Playdate (Maya, Sabtu 2–4 → orang tua Lily → set), Babysitter (malam ini 6–10 → Alex dan Sam bisa → Book Alex), Carpool (sekali, Sabtu 9:30 → rumah ke soccer → Priya bisa). Tile clay = bab (yang aktif terangkat + terisi saat scroll, bisa diklik), satu kalimat besar untuk langkah, phone kanan. **Terkunci ke scroll**: tiap tap di titik scroll tetap, chat di phone bergulir linear mengikuti scroll halaman, scroll balik memutar ulang; tidak ada yang jalan sendiri. Baris "Texted… / Posted…" dan pratinjau pesan panjang disembunyikan di salinan website saja | `assist-scrolly.js/.css`, `home-v3-carpool.html` |

| A1c V.22 slide 2–4 (review Ahmad) | **Selesai + ekspor ulang**. Slide 2: baris Gmail · Connected · Sprout pindah ke atas kepala mom; email + To-Do dikode ulang dan naik: email "Picture day is Thursday!" → to-do "Emma wears the class shirt" + "Send the picture day order form"; anak = **Emma** (bukan Jake); avatar = mom ini (Figma AI, scratch `H5GZYtSTT9TOR8qc5ieuV7` 7:2; ElevenLabs kena limit harian). Slide 3–4: mockup phone sungguhan di dalam foto, keluarga + lantai/tangga dipotong (Apple Vision, `tools/cutout.swift`) dan diletakkan di depan phone | `screenshots-v22-people.html`, `assets/people/v20/*-front.png`, `assets/people/email-mom-avatar.webp` |

| A1d V.22 slide 3–4 lagi (review Ahmad) | **Selesai + ekspor ulang**. Phone diturunkan (jarak ke deskripsi), panel kosong di foto dihapus (dinding diisi ulang: `*-clean.webp`); Daily Brief = brief milik mom ("Morning, Dana", avatar sama dengan slide School emails), to-do bersama di baris pertama; Assist: header Sprout langsung di bawah status bar | `screenshots-v22-people.html`, `tools/make-brief-family.mjs` |

Catatan: ekspor V.22 **lengkap** (25 Nov): iPhone 6.9″ + 6.3″, iPad 13″ 2064×2752 dan Google Play 1080×1920 (slide tanpa bezel iPhone di tengah, sisi = foto yang sama di-blur; slide 1 cream polos). Zip: `exports/v22/Sprout Store Assets V.22.zip`. Alat: `tools/export-v22.mjs [--device iphone63 | --frameless]` lalu `tools/compose-v22-wide.py`. Ikon terbang di slide 1 masih termasuk date night, camps, sports, tutoring (ikon fitur, bukan klaim), biarkan kecuali Tony keberatan.

**Masih terbuka**

| Task | Siapa | Menunggu |
|---|---|---|
| Commit (repo induk + `task-first-assist`) dan deploy dua review link (website, sprout-assist-tasks) | Ahmad | Oke Ahmad |
| Kirim link `/sitter-class-chat/` + `/sitter-v3-share/` ke Mohit | Ahmad | Deploy |
| Kirim update ke Tony: website (hero chip, mental load, directory, Coming next, CTA), App Store 6 slide, happy path sitter + carpool | Ahmad | Deploy |
| Pilih happy path untuk website (sitter atau carpool), lalu taruh satu demo di bagian Assist | Tony | Lihat A3/A4 |
| Kalimat baru di Community ("Every parent shows up with a face...") | Tony | Oke copy |
| Zip store assets V.15 baru (zip lama sudah tidak cocok) | Ahmad | Kalau mau upload |

**Tambahan:** `/other-side/` punya "Open full screen" di bawah setiap phone (14 phone), membuka sisi itu sendirian di tab baru lewat route standalone-nya. Live di sprout-assist-tasks.vercel.app.

## Draf pesan (siap kirim, 25 Nov)

### Ke Mohit

> Hi Mohit, the share-a-sitter flow from yesterday's call is updated in the prototype:
>
> - Class chat, tap "Share a sitter": https://sprout-assist-tasks.vercel.app/sitter-class-chat/
> - The same sheet from the push: https://sprout-assist-tasks.vercel.app/sitter-v3-share/
> - With sitters already saved: https://sprout-assist-tasks.vercel.app/sitter-v3-share-saved/
>
> What changed, per Tony:
> 1. The sheet starts with "Choose from contacts" (pick several at once, then "Add another from contacts"). Typing a name and number is a small link under it.
> 2. Saved sitters show under "Your sitters", not ticked. Most parents will have none, so contacts come first.
> 3. Sharing is private to the parent who asked. Nothing is posted in the class chat. Everyone shared is saved to the sharer's sitters too.
>
> All four sides of a class-group sitter request (Tony, a parent in the chat, a parent who gets the push, the sitter by SMS) are linked here: https://sprout-assist-tasks.vercel.app/other-side/#sitter-class
> Start on Tony's phone: tap the clover, then Babysitter. The other three phones react on their own.

### Ke Tony (kirim ≥15 menit sebelum standup)

> Hi Tony, updates from yesterday's standup and your notes:
>
> **Website, two options to pick from**
> - A, no Assist demo: https://sprout-reach-scene-iteration.vercel.app/home-v3.html
> - B, the carpool happy path told by scrolling: https://sprout-reach-scene-iteration.vercel.app/home-v3-carpool.html
>
> Both have your notes in: little profiles on the parents in the hero; the mental-load part is now a worried mom with the notifications rising from her head, then one clean move into the Daily Brief (no half-finished state if you stop scrolling); tap a to-do to see the summary, the original email and Mark as done; "Coming next: date nights, tutors, summer camp and sports registration" under the Assist tiles; a Member Directory card with faces and kids' names in the community part; no more "or get the app"; a new closing photo. I added one line to the community copy: "Every parent shows up with a face and their kids' names, not just a phone number." OK to keep?
>
> **App Store, six slides** (community, school emails, family Daily Brief, Assist, class chat, directory). All store sizes are ready. Assist shows only Playdate, Babysitter and Carpool. Images attached.
>
> **Assist prototype**
> - Share a sitter starts from Contacts: https://sprout-assist-tasks.vercel.app/sitter-class-chat/
> - After "Book Alex" it is one line: Alex is booked, Sam told, in the Daily Brief, pay and rate here: https://sprout-assist-tasks.vercel.app/sitter-v3/
> - Carpool: Priya just says yes, no time back-and-forth: https://sprout-assist-tasks.vercel.app/plan-carpool/
> - Asking a class group for a sitter, every side at once: https://sprout-assist-tasks.vercel.app/other-side/#sitter-class
>
> One question: website A or B?

Lampiran untuk Tony: `08 - Generated Screens/App Store/exports/v22/sheet.png`.
