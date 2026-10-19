# Storyboard di Figma

Langkah planning (step 2 di `SKILL.md`), dikerjakan di Figma, bukan di `planning.html`. Kamu mengedit kartu
dan menggambar sketsa di Figma. Claude membaca hasilnya kembali ke `plan.json`, dan file itu yang dipakai
scaffold untuk membangun video.

```
footage + words.json ──spec──► storyboard/spec.json + thumbs/ ──generate──► section di Figma
                                                                                  │  kamu edit
plan.json ◄──apply── storyboard/figma-export.json ◄──read──────────────────────────┘
    │
    └──► scaffold.py ──► scenes/ ──► render
```

Figma = tempat mengedit. `plan.json` = format yang dibaca mesin. Jangan anggap screenshot atau ekspor statis
sebagai storyboard: kalau tidak dibaca balik, editanmu tidak sampai ke video.

- File: Sprout Design (Prod) `EhpRiGZ5eJnBb132X9zewg`, halaman **Video Story Board** (`14064:28167`). Disimpan di
  `tools/figma/figma.json`.
- Contoh jadi: section **Video 10 · Arthur Brooks (kit test)** (`14068:2`).

## Isi halaman

**Storyboard · Components** (frame di kiri halaman, `14067:2`). Jangan diedit kecuali kamu memang mengubah
desain kartunya (lihat "Customize").
- `SB / Card`: satu kartu per baris naskah. Variant **Scene** = Captions / Captions + UI / Half / Full.
- `SB / Video Header`: style untuk satu video.

**Satu section per video.** Isinya, dari atas:
1. **Header** (`SB / Video Header`): judul, info project, speaker label, opening zoom, emphasis plate, cutaway
   background, dan catatan untuk Claude.
2. **Rhythm**: strip berwarna per baris, lebarnya sesuai durasi, plus persentase tiap tipe scene dibanding
   guide. Strip ini **tidak** dibaca balik dan baru diperbarui waktu section di-generate ulang.
3. **Satu baris per kalimat naskah.** Nama frame-nya adalah ID baris (`L021`), isinya tiga kolom:
   - **Footage · L021**: still frame dari footage di 40% durasi baris.
   - **Card · L021**: kartu yang kamu edit.
   - **Sketch · L021**: frame 9:16 kosong untuk menggambar layout scene. Boleh pakai komponen Sprout, ikon
     clay, teks, kotak, apa saja.

Urutan baca: kiri ke kanan, lalu baris berikutnya. Itu urutan video.

## Yang boleh diedit

| Di mana | Field | Boleh diedit? | Masuk ke plan.json sebagai |
|---|---|---|---|
| Kartu | **Scene** (variant di panel kanan) | ya | `scene` |
| Kartu | **Styled words** | ya: tulis kata persis seperti di baris; pisahkan beberapa frasa dengan ` / `; `—` untuk tidak ada | `emphasis` (word id) |
| Kartu | **Plan** | ya: apa yang tampil di scene ini | `plan` |
| Kartu | **Ink background** | ya, hanya berlaku untuk Half dan Full | `bg` = `ink` / `paper` |
| Kartu | **Speaker circle** | ya, hanya berlaku untuk Full | `pip` |
| Kartu | **Merge with next** | ya: gabungkan baris ini dengan baris sesudahnya | dua baris jadi satu |
| Kartu | Id, Time, Line | **tidak** (dibuat mesin) | diabaikan |
| Sketch | gambar apa pun di dalam frame | ya | `sketch` = `storyboard/sketches/L021.png` |
| Header | Speaker label | ya, `—` untuk tidak ada | `style.speaker_label` |
| Header | Opening zoom | ya, `on` / `off` | `style.opening_zoom` |
| Header | Emphasis plate | ya, `sage` / `cream` / `ink` | `style.emphasis_plate` |
| Header | Cutaway background | ya, `paper` / `ink` | `style.cutaway_bg` |
| Header | Notes | ya | `notes` |

Jangan:
- ganti nama frame baris (`L021`) atau frame `Sketch · L021`
- hapus atau pindahkan kartu ke section lain
- detach instance kartu atau header

Kalau ini terjadi, sync menolak dan tidak menulis apa pun.

**Memecah satu baris jadi dua** belum bisa dari Figma. Pecah dulu di `planning.html` (shift-klik kata), simpan
`plan.json`, lalu generate ulang storyboard-nya.

## Video baru, langkah demi langkah

Semua perintah dijalankan dari `~/Sprout`.

1. **Folder project.** Buat `SPROUT VIDEO/Video N - Nama/` dan taruh footage di `assets/`.
2. **Transcript + baris.** Ikuti `SKILL.md` step 1, lalu jalankan:
   ```bash
   python3 "SPROUT VIDEO/_Kit/sprout-talking-head/tools/plan_page.py" "SPROUT VIDEO/Video N - Nama" --title "Nama"
   ```
   Ini menulis `words.json` (dan `-edit.mp4` kalau keyframe footage-nya jarang).
3. **Spec + thumbnail.**
   ```bash
   python3 "SPROUT VIDEO/_Kit/sprout-talking-head/tools/storyboard.py" spec "SPROUT VIDEO/Video N - Nama" --title "Video N · Nama"
   ```
   Kalau `plan.json` sudah ada, isinya ikut terbawa. Kalau belum, semua baris dimulai sebagai Captions.
4. **Generate di Figma.** Bilang ke Claude: *"generate storyboard Video N"*. Claude menjalankan
   `storyboard.py code … generate` lewat use_figma, menyimpan section id di `storyboard/figma.json`, lalu
   mengunggah thumbnail ke frame Footage (`upload_assets` + `storyboard.py upload`). Thumbnail tidak lewat chat.
5. **Edit di Figma.** Ganti Scene, isi Styled words dan Plan, nyalakan switch, gambar di Sketch. Lihat strip
   Rhythm untuk keseimbangan antar tipe scene (angkanya baru diperbarui setelah generate ulang).
6. **Sync balik.** Bilang: *"sync storyboard Video N"*. Claude menjalankan `code … read`, menyimpan hasilnya ke
   `storyboard/figma-export.json`, mengunduh sketsa yang terisi ke `storyboard/sketches/`, lalu menjalankan:
   ```bash
   python3 "SPROUT VIDEO/_Kit/sprout-talking-head/tools/storyboard.py" apply "SPROUT VIDEO/Video N - Nama" "SPROUT VIDEO/Video N - Nama/storyboard/figma-export.json"
   ```
   Hasilnya daftar perubahan (`L016: scene 'captions' -> 'captions-ui'`). `plan.json` lama disimpan sebagai
   `plan.json.bak`.
7. **Bangun video.** Lanjut `SKILL.md` step 3 (scaffold). Baris yang punya sketsa membawa path sketsanya di brief
   placeholder-nya, dan Claude membangun scene mengikuti gambarmu.

Mau ubah lagi setelah render? Edit di Figma, sync, lalu scaffold ulang. Jangan generate ulang section yang sudah
kamu edit: generate **mengganti** section itu. Kalau terpaksa generate ulang (misalnya setelah memecah baris),
sync dulu supaya editanmu sudah ada di `plan.json`, lalu jalankan `spec` dan generate lagi.

## Kalau sync menolak

Sync tidak menulis apa pun kalau ada satu saja error. Pesannya menyebut baris yang bermasalah:

| Pesan | Artinya | Perbaikan |
|---|---|---|
| `styled words 'x' are not in the line` | kata di Styled words tidak ada (persis) di kalimatnya | samakan ejaannya; tanda baca boleh beda, urutan harus sama |
| `unknown scene` | variant bukan salah satu dari empat | pilih ulang di dropdown Scene |
| `no such line in the plan` | frame baris diganti namanya | kembalikan namanya ke `Lxxx` |
| `cards do not cover the transcript` | ada kartu yang hilang atau terhapus | undo di Figma, atau generate ulang dari plan.json |
| `header plate must be one of …` | Emphasis plate / Cutaway berisi nilai lain | tulis `sage` / `cream` / `ink`, `paper` / `ink` |

## Customize

**Tampilan kartu atau header.** Edit main component di frame Storyboard · Components. Aman selama nama property
tidak berubah (`Scene`, `Styled words`, `Plan`, `Ink background`, `Speaker circle`, `Merge with next`, dan field
header). Reader membaca berdasarkan nama itu. Semua instance di semua video langsung ikut berubah.

**Tambah tipe scene baru** (misalnya "Split"):
1. Figma: tambah variant `Scene=Split` di `SB / Card`. Clone variant yang ada, lalu ubah warna chip.
2. `tools/common.py`: tambah `"split"` ke `SCENE_TYPES`.
3. `tools/storyboard.py`: tambah `"split": "Split"` ke `SCENE_LABEL`.
4. `tools/figma/generate.js`: tambah warnanya ke `SCENE_COLOR`, dan ke daftar persentase Rhythm kalau perlu.
5. `tools/scaffold.py` + `references/visual-guide.md` §3: layout dan slot scene baru itu. Ini bagian terbesar,
   kerjakan bersama Claude.
6. `references/plan-schema.md`: catat nilai barunya.

**Tambah switch atau field baru di kartu** (misalnya "Music dip"):
1. Figma: tambah component property di `SB / Card` (boolean atau text). Kalau perlu, sambungkan ke tag seperti
   tiga switch yang sudah ada.
2. `tools/figma/read.js`: baca property-nya ke objek card.
3. `tools/storyboard.py` `cmd_apply`: tulis ke field plan yang baru. Di `cmd_spec`: isi nilainya dari plan.
   Di `generate.js` (`setProps`): set nilainya waktu generate.
4. `references/plan-schema.md`, lalu scaffold atau sound guide yang memakainya.

**Layout halaman.** Di `generate.js`: `COLS` (baris per deret, sekarang 2), `PAIR_GAP`, ukuran Footage dan Sketch
(216 × 384), lebar section `W`.

**Pindah file atau halaman.** Ubah `tools/figma/figma.json` (`file_key`, `page_id`). Halaman barunya perlu
komponennya sendiri: minta Claude menjalankan `code … components` sekali di sana.

## Batasan yang perlu diingat

- **Sketsa diekspor seukuran frame** (216 × 384). Cukup sebagai referensi layout, bukan aset final. Aset final
  (ikon, foto, screen Sprout) tetap disebut di Plan atau dibuat saat scene dibangun.
- **Thumbnail diambil sekali.** Kalau footage diganti atau dipotong ulang, jalankan `spec` lagi dan generate
  ulang.
- **Rhythm** tidak live. Angkanya dari waktu generate.
- **Generate menghapus section lama** dari project yang sama (dikenali lewat plugin data `sprout/project`, bukan
  nama). Jadi selalu sync dulu sebelum generate ulang.
- **URL upload Figma** sekali pakai dan kedaluwarsa dalam 10 menit. Kalau upload gagal, minta URL baru.

## File

| File | Isi | Diedit? |
|---|---|---|
| `tools/storyboard.py` | `spec`, `code`, `upload`, `apply` | kode kit |
| `tools/figma/components.js` | membuat komponen SB (sekali per file; idempotent) | kode kit |
| `tools/figma/generate.js` | membuat section satu video dari spec | kode kit |
| `tools/figma/read.js` | membaca section kembali | kode kit |
| `tools/figma/figma.json` | file key + page id | ya, kalau pindah file |
| `<project>/storyboard/spec.json` | dibuat `spec` | tidak |
| `<project>/storyboard/thumbs/*.jpg` | dibuat `spec` | tidak |
| `<project>/storyboard/figma.json` | section id + id frame Footage | dibuat saat generate |
| `<project>/storyboard/figma-export.json` | hasil `read` | tidak |
| `<project>/storyboard/sketches/*.png` | sketsamu, diunduh saat sync | tidak (edit di Figma) |
| `<project>/plan.json` | hasil `apply`; `.bak` = versi sebelumnya | lewat Figma atau planning.html |
