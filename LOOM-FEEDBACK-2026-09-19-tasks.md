# Feedback Tony di Loom "Design Updates, AI Flow, Animations, Live Activities"

Video 4:56, direkam ~19 Sep. Sepuluh komentar Tony, semuanya 1–2 hari lalu.
Tiap komentar dicocokkan ke menit yang dia tunjuk di transkrip.

Transkrip lengkap: `loom-2026-09-19-transcript.txt`.

---

## Yang dia setujui, jangan diutak-atik lagi

| Menit | Komentar | Apa yang ditunjuk |
|---|---|---|
| 2:07 | *"This is good I really like how big the minutes UI is. the CTAs look clean too."* | Live Activities untuk event |
| 3:00 | *"That looks really cool"* | AI blob yang bereaksi saat pengguna bicara |
| 3:37 | *"Better"* | Panah yang dipindah dari kanan ke kiri |

Blob-nya **dia suka**. Itu penting, karena di call 18 Sep kalimatnya terdengar
seperti menolak. Yang dia tolak bukan blob-nya.

---

## P0 · Hapus layar Start di AI flow — ini membatalkan yang sudah kita bangun

**Tony, 2:46:**
> *"I almost don't think we need this screen anymore. Now that the next page is so
> clear, we can just let the user start talking right after they select the reminder
> UI. Let's remove this UI and not require them to click start. Just immediately go
> to the next page to save a click."*

- [ ] **L1** Buang layar Start. Pilih Reminder di AI Assist → **langsung** mendarat di
  layar yang sudah merekam. Hemat satu ketukan.

**Ini persis Alternative B** di `08 - Generated Screens/AI Assist/voice-capture-alternatives.html`,
yang waktu itu gue bangun sebagai eksplorasi dan gue rekomendasikan **untuk tidak dipilih**,
alasannya: orang yang kepencet masuk sudah terlanjur direkam, dan nggak ada jeda buat
menyusun kalimat. Tony sekarang memintanya secara eksplisit.

Dua hal yang tetap berlaku dan jangan ikut terbuang:
- **Tombol stop tetap wajib.** Keluhan asli Tony 17 Sep bukan soal start, tapi
  *"I just don't know when to stop"*. Menghapus start tidak menyentuh itu.
- **Contoh kalimat tetap naik ke atas, orb tetap kecil.** Yang dia tolak di call adalah
  layar yang blob-nya jadi bintang utama, bukan blob-nya.

Risiko yang tetap harus disampaikan ke dia sekali lagi, lalu dia yang putuskan:
merekam orang sebelum dia menekan apa pun itu keputusan yang akan dipertanyakan.

---

## P0 · Animasi logo — arahnya salah, dan ada ketergantungan yang belum dibereskan

**Tony, 1:16:** *"What's this animation supposed to be for? Not sure about it."*
**Tony, 1:28:** *"I wanted this clover + the internals of the blob animation within it."*

- [ ] **L2** Yang dia mau spesifik: **bentuk clover**, dengan **animasi blob bergerak di
  dalamnya**. Bukan logo yang di-fade, bukan logo yang bergerak sebagai satu blok.
  Clover jadi wadah, blob jadi isinya.

- [ ] **L3** **Logo vektor belum ada, dan itu yang memblokir.** Kata Ahmad sendiri di 1:45:
  *"this is image-generated logo, not the one that we created on a vector base. We need
  to create that one."* Selama logonya masih raster, animasi halus tidak akan pernah
  tercapai, berapa kali pun diiterasi. Kerjakan L3 sebelum L2.

---

## P1 · Shimmer loading terlalu spesifik

**Tony, 3:55:**
> *"I want the shimmer loading to be more generic. it doesn't need to label your
> invitations or happening today in there. There's plenty of instances where users
> won't have any of those components there when the daily brief loads."*

- [ ] **L4** Skeleton Daily Brief jadi blok netral tanpa label section. Alasannya bukan
  selera: melabeli "Your Invitations" saat memuat itu menjanjikan sesuatu yang mungkin
  tidak ada begitu data datang, dan pengguna baru justru yang paling sering melihatnya.

---

## P1 · Empty state Daily Brief

**Tony, 4:15:** *"I think I like this page. I just don't want to show lunch menu in a empty state."*
**Tony, 4:41:** *"Let's not put lunch menu if it's unfilled"*

- [ ] **L5** Lunch menu **hilang dari empty state**. Dia menyebutnya dua kali di satu video,
  jadi ini bukan lewat begitu saja. Section lunch hanya muncul kalau memang ada isinya.

**Tony, 4:36:** *"I'm not sure what happens when the user clicks any of those empty states.
You'll need to build out that design."*

- [ ] **L6** Desain tujuan tiap empty state kalau ditap. Di video baru To-Do yang punya
  tujuan. Yang lain belum: Happening today, Upcoming events, Today's lunch, Birthdays,
  New messages, Invitations.
  Catatan dari transkrip sendiri: sebagian memang **tidak bisa** ditindaklanjuti pengguna,
  karena isinya dibuat orang lain. Undangan dan upcoming event masuk kategori itu. Jadi
  jawabannya bukan enam layar baru, tapi keputusan per section: **bisa ditap, atau tidak
  bisa ditap sama sekali.** Yang tidak bisa jangan dibuat kelihatan seperti tombol.

---

## Pola yang ketiga kalinya minggu ini

Lunch menu. Dicabut dari landing page 17 Sep, dua FAQ masih tertinggal sampai 21 Sep,
dan sekarang diminta keluar dari empty state Daily Brief. Tiga konteks, satu arah.
Layak dicek apakah ada tempat keempat sebelum dia yang menemukannya.
