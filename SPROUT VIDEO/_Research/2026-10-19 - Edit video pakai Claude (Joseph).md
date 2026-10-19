# Edit Reels pakai Claude Opus 5.5: catatan studi

Sumber: "How to Edit VIRAL Instagram Reels Using Opus 5.5! (New Style in 2026)", Joseph | Video Editing,
11 Okt 2026, 17:16, ~95 rb view. https://www.youtube.com/watch?v=5UnK3c-nlIs
Transcript lengkap diambil 19 Okt (yt-dlp, auto-caption en). Sekitar 3 menit dari 17 menit adalah iklan
kursus Ultimate Editors; guide visual mereka ada di balik paywall, jadi yang kita pelajari di sini adalah
strukturnya, bukan isinya.

## Hasil yang diklaim

Raw talking head 76 dtk jadi Reel 50 dtk: caption, 12 animasi (full screen, half screen, UI, zoom, camera
move), 106 SFX, musik di -20 dB. Total 110 menit, manusia kerja ~20 menit. Biaya < 10% kuota mingguan
Max (~$1–5 per edit).

| Langkah | Siapa | Waktu |
|---|---|---|
| 1. Cut: transcript per kata, buang jeda + take jelek, padding 20 ms | Claude | 24 mnt (dia sendiri bilang terlalu lambat, sarankan Gling atau manual) |
| 2. Planning page: tiap baris naskah diberi tipe scene + deskripsi | Manusia | 15 mnt |
| 3. Build animasi di Remotion dari plan + guide | Claude | 40 mnt |
| 4. Review, minta revisi "ubah X, Y, Z" | Manusia | singkat |
| 5. Sound design dari guide + library SFX, lalu musik | Claude | 25 mnt |

## Inti metodenya: dua "training" yang dijadikan skill

Klaim utamanya: hasil AI jelek hampir selalu karena training-nya, bukan modelnya. Dua dokumen dibuat sekali,
dianalisis Claude, lalu **dijadikan skill** supaya tidak perlu training ulang.

### A. Visual guide (3 bagian)

1. **Caption.** Referensi gambar gaya caption. Dua font: sans medium untuk hampir semua kata, script untuk
   kata spesial. Putih untuk kata biasa, satu warna aksen untuk kata yang harus nonjol. Posisi, efek, animasi
   (pop-up fade per kata). Contoh banyak supaya Claude tidak menebak. Aturan hook: pembicara selalu di layar,
   subtitle di separuh bawah, satu kata yang di-highlight adalah kata yang bikin orang terus nonton.
2. **Animasi.** Empat tipe: *text-centric*, *person-centric*, *object-centric*, *graphic-centric* (chart, UI).
   Cara bangun background langkah demi langkah. **Aturan tiga objek:** satu objek utama di tengah, elemen
   pendukung di tepi, elemen kedalaman di sekeliling luar. Dasar desain (opsi warna, font, tampilan teks,
   objek, background). Lebih dari 100 referensi inspirasi (UI, grafik, scene penuh). Ini moat-nya yang
   sebenarnya.
3. **On-screen animation** (UI kecil saat bicara). Dua aturan: background di belakangnya gelap + blur, dan
   animasinya duduk di separuh bawah layar.

### B. Sound design guide + library

Library minimum (checklist dari video):

| Jenis | Jumlah | Isi |
|---|---|---|
| Whoosh | 5 | panjang, pendek, bertekstur (untuk zoom dan gerak) |
| Mechanical click | 2–3 | pendek, metalik, retro |
| Sci-fi | 2–3 | impact, click, shot |
| UI | 2–3 | click, success, fail |
| Riser | 2 | bass, metalik |
| Hit | 2 | bass hit, heavy hit |

Guide-nya: siapa Claude dan tugasnya, filosofi (SFX mengikuti gerak), tiga keluarga SFX (whoosh / tekstur /
riser+hit), seberapa keras, di mana ditaruh. Lalu per keluarga: kapan dipakai, whoosh mana untuk gerak mana,
riser dan hit untuk membangun dan menjatuhkan antisipasi. Prosesnya: Claude menulis dulu semua yang terjadi di
layar, baru merencanakan SFX per event.

## Planning page (langkah paling penting menurut dia)

Halaman sederhana yang Claude bangun dari transcript:
- Atas: warna aksen, dua font, warna font.
- Bawah: tiap baris naskah di kiri, kotak kosong di kanan untuk rencana.
- Tiap baris pilih satu dari **4 tipe scene**: *Captions* (bicara + teks), *Captions + UI* (teks + animasi
  kecil di separuh bawah), *Half screen* (animasi atas, orang bawah), *Full screen* (animasi menutup layar).

Alasannya: manusia yang tahu kapan sesuatu harus muncul supaya orang terus nonton. Claude cukup mengikuti
selera itu. Dia sengaja mengatur ritme full / half / captions (contoh: struktur 3 chapter dengan UI chapter
1-2-3 yang terisi bergantian, kembali di akhir sebagai recap).

Tips lain: suruh Claude **bilang kalau butuh aset** (dia kasih screenshot edit jelek dan foto bola mata).

## Dibandingkan dengan yang sudah kita punya

Tes Video 10 (Arthur Brooks, 16 Okt, `SPROUT VIDEO/Video 10 - Happiness Test/`) sudah membuktikan engine-nya.
Yang belum ada adalah lapisan "training" dan "planning".

| Bagian | Video Joseph | Kita sekarang | Gap |
|---|---|---|---|
| Engine render | Remotion (React) | HyperFrames (HTML + GSAP), sudah jalan, ada `npm run check` + verifikasi | Tidak ada. Jangan ganti engine. |
| Cut raw footage | Claude, 24 mnt | Belum pernah (klip Arthur sudah bersih) | Perlu `cut.py`: Scribe → kata + timestamp → tandai take jelek → ffmpeg. Deterministik, harusnya < 2 mnt. |
| Visual guide | 1 dokumen → skill | Tersebar: `07 - Design Guide/SPROUT_DESIGN_REFERENCE.md`, DESIGN.md per versi | Ini persis tugas **A4 brand kit** (meeting 16 Okt). V1→V5 butuh 5 putaran karena guide-nya belum ada. |
| Gaya caption | Diatur di guide | Sudah terkunci di V5: Inter 500 48 px, frasa muncul 50% lalu kata yang diucapkan jadi 100%, 4 frasa besar Inter 800 + Playfair italic | Tinggal dipindah ke guide. |
| Tipe scene / animasi | 4 tipe scene, 4 tipe animasi, aturan tiga objek | Treatment ad hoc per versi (kartu cream, lingkaran pembicara 330 px, paper sculpture) | Petakan treatment V5 ke 4 tipe scene. |
| Planning page | Ya, 15 mnt | Tidak ada; arahan lewat chat dan moodboard | **Gap terbesar.** |
| SFX library | ~15 file, 6 jenis | 7 file ElevenLabs di Video 9 (ding, gather, msg, pop, send, tap, whoosh); Video 10 pakai 3 cue sintetis | Kurang riser, hit, variasi whoosh, UI fail. |
| Sound guide | Ya | Tidak ada; `tools/mix.py` sudah bagus untuk mix (−14 LUFS, ducking dari envelope suara) | Tulis guide-nya; mesin mix sudah ada. |

## Catatan kritis

- Ini video iklan kursus. Bagian yang paling bernilai (guide visual + 100 referensi) tidak dibagikan gratis.
  Strukturnya cukup untuk kita tiru dengan aset Sprout sendiri.
- "Tanpa software edit" itu klaim pemasaran: Remotion adalah editornya, Claude yang menulis kodenya.
- Cutting di dalam percakapan LLM itu salah tempat. Menandai take jelek butuh judgment (LLM), tapi memotong
  dan padding itu kerja deterministik (script).
- Padding 20 ms rawan terdengar terpotong di napas dan konsonan akhir. Perlu dicek di telinga, mungkin 60–120 ms.
- Dia membiarkan Claude ambil logo merek dari Chrome. Untuk kita tetap berlaku: jangan buat ulang logo
  kompetitor atau merek lain, nama teks saja.
- Biaya revisi tidak ditunjukkan. Di Video 10 revisi itulah yang makan waktu (V1 sampai V5).

## Rencana eksplorasi (usulan)

1. **E1 Sprout Talking-Head Kit = A4.** Satu skill berisi visual guide (caption V5, 4 tipe scene dengan
   treatment Sprout, aturan tiga objek versi Sprout, palet + font, aturan copy English tanpa emoji) dan sound
   guide. Bahan: V5 + SPROUT_DESIGN_REFERENCE + moodboard V2–V5.
2. **E2 `cut.py`.** Scribe word timestamps → Claude menandai take ulang/jelek di `words.json` → script ffmpeg
   memotong dengan padding yang bisa diatur → `cut.mp4` + `edl.json`. Bisa dijalankan ulang.
3. **E3 Planning page.** HTML yang dibuat dari transcript: baris naskah, pilihan 4 tipe scene, kotak rencana,
   warna/font global. Ekspor `plan.json` yang langsung dibaca `build.py` HyperFrames.
4. **E4 SFX library** sesuai checklist di atas (ElevenLabs SFX atau pack berlisensi).
5. **E5 Jalankan end-to-end** di raw footage Tony, catat waktu per langkah seperti tabel Joseph, lalu
   bandingkan Claude vs Codex di langkah yang sama.

**Status 19 Okt:** E1 dan E3 sudah dibangun sebagai skill `sprout-talking-head`
(`SPROUT VIDEO/_Kit/sprout-talking-head/`), diuji di `Video 10 - Happiness Test/kit-test/`. E2 (`transcribe.py` + `cut.py` + halaman review) juga sudah jadi, diuji di `cut-test/` (raw 25,9 dtk dengan 2 take gagal → 16,3 dtk, cocok kata per kata). Transkripsi sekarang lokal (whisper.cpp), tidak butuh kredit ElevenLabs. E4 dan E5 belum.

Blocker yang sudah diketahui: raw footage dari Tony (meeting 16 Okt: dia akan share), dan key ElevenLabs
"Sprout Video" yang sudah habis kuota (Scribe ikut makan kredit). Alternatif STT lokal: install mlx-whisper.
